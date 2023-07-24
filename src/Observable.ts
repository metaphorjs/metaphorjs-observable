import ObservableEvent from "./ObservableEvent"
import { ReturnType } from "./types"
import type { EventOptions, ListenerOptions, ListenerFunction, ReturnValue } from "./types"

type EventsMap = {
    [key: string]: ObservableEvent
}

/**
 * A javascript event bus implementing multiple patterns: 
 * observable, collector and pipe.
 * @code src-docs/examples/observable.js
 *
 * Collector:
 * @code src-docs/examples/collector.js
 * 
 * Pipe:
 * @code src-docs/examples/pipe.js
 *
 * @author Ivan Kuindzhi
 */
export default class Observable {

    events: EventsMap = {}

    /**
     * Use this method only if you need to provide event-level options
     * @param name Event name
     * @param options Event options
     */
    createEvent(name: string, options?: EventOptions): void {
        name = name.toLowerCase();
        const events  = this.events;
        if (!events[name]) {
            events[name] = new ObservableEvent(options);
        }
    }

    /**
    * Subscribe to an event or register collector function.
    * @param name Event name. Use '*' to subscribe to all events.
    * @param fn Callback function
    * @param options
    *       You can pass any key-value pairs in this object. All of them will be passed 
    *       to triggerFilter (if you're using one).
    */
    on(name: string, fn: ListenerFunction, options?: ListenerOptions): void {
        name = name.toLowerCase();
        const events  = this.events;
        if (!events[name]) {
            events[name] = new ObservableEvent();
        }
        events[name].on(fn, options);
    }

    /**
    * Same as <code>on()</code>, but options.limit is forcefully set to 1.
    */
    once(name: string, fn: ListenerFunction, options?: ListenerOptions): void {
        options = options || {};
        options.limit = 1;
        this.on(name, fn, options);
    }

    /**
     * Subscribe to an event and return a promise that will be resolved
     * with event payload
     * @param name Event name
     * @code src-docs/examples/promise.js
     */
    promise(name: string): Promise<any> {
        return new Promise((resolve) => {
            this.once(name, resolve, { limit: 1 });
        });
    }

    /**
    * Unsubscribe from an event
    * @param name Event name
    * @param fn Event handler
    * @param context If you called on() with context you must 
    *                         call un() with the same context
    */
    un(name: string, fn: ListenerFunction, context?: object) {
        name = name.toLowerCase();
        const events  = this.events;
        if (!events[name]) {
            return;
        }
        events[name].un(fn, context);
    }

    /**
     * Relay all events of <code>eventSource</code> through this observable.
     * @code src-docs/examples/relay.js
     * @param {object} eventSource
     * @param {string} eventName
     * @param {string} triggerName
     * @param {string} triggerNamePfx prefix all relayed event names
     */
    relay(eventSource: Observable, eventName: string, 
                triggerName?: string | null, triggerNamePfx?: string | null) {
        eventSource.on(eventName, this.trigger, {
            context: this,
            prepend: eventName === "*" ? 
                        null: 
                        // use provided new event name or original name
                        [triggerName || eventName],
            replaceArgs: eventName === "*" && triggerNamePfx ? 
                            function(l, args) {
                                args[0] = triggerNamePfx + args[0]
                                return args;
                            } : 
                            null
        });
    }

    /**
     * Stop relaying events of <code>eventSource</code>
     * @param eventSource
     * @param eventName
     */
    unrelay(eventSource: Observable, eventName: string) {
        eventSource.un(eventName, this.trigger, this);
    }

    /**
    * @param name Event name 
    * @param fn Callback function 
    * @param context
    * @return boolean
    */
    hasListener(name?: string, fn?: ListenerFunction, context?: object) {
        const events = this.events;

        if (name) {
            name = name.toLowerCase();
            if (!events[name]) {
                return false;
            }
            return events[name].hasListener(fn, context);
        }
        else {
            for (name in events) {
                if (events[name].hasListener()) {
                    return true;
                }
            }
            return false;
        }
    }

    /**
    * @param name Event name
    * @return boolean
    */
    hasEvent(name: string) {
        return !!this.events[name];
    }


    /**
    * Remove all listeners from specific event or from all events
    * @param name Event name
    */
    removeAllListeners(name: string) {
        const events  = this.events;
        if (name) {
            if (!events[name]) {
                return;
            }
            events[name].removeAllListeners();
        }
        else {
            for (name in events) {
                events[name].removeAllListeners();
            }
        }
    }



    /**
     * Trigger event and return all results from the listeners
     * @param name Event name
     * @param [...args]
     */
    all(name: string, ...args: any[]): any[] | Promise<any[]> {
        return this._trigger(name, args, ReturnType.ALL);
    }

    /**
     * Trigger first event's listener and return its result
     * @param name Event name
     * @param [...args]
     */
    first(name: string, ...args: any[]): any | Promise<any> {
        return this._trigger(name, args, ReturnType.FIRST);
    }

    /**
     * Trigger event and return last listener's result
     * @param name Event name
     * @param [...args]
     */
    last(name: string, ...args: any[]): any | Promise<any> {
        return this._trigger(name, args, ReturnType.LAST);
    }

    /**
     * Trigger event and return all results from the listeners merged into one object
     * @param name Event name
     * @param [...args]
     */
    merge(name: string, ...args: any[]): object | Promise<object> {
        return this._trigger(name, args, ReturnType.MERGE);
    }

    /**
     * Trigger event and return all results from the listeners flattened into one array
     * @param name Event name
     * @param [...args]
     */
    concat(name: string, ...args: any[]): any[] | Promise<any[]> {
        return this._trigger(name, args, ReturnType.CONCAT);
    }

    /**
     * Trigger event and return first non-empty listener result and skip others
     * @param name Event name
     * @param [...args]
     */
    firstNonEmpty(name: string, ...args: any[]): any | Promise<any> {
        return this._trigger(name, args, ReturnType.FIRST_NON_EMPTY);
    }

    /**
     * Trigger event and return first listener result that equals true and skip others
     * @param name Event name
     * @param [...args]
     */
    untilTrue(name: string, ...args: any[]): void | Promise<void> {
        return this._trigger(name, args, ReturnType.FIRST_TRUE);
    }

    /**
     * Trigger event and return first listener result that equals false and skip others
     * @param name Event name
     * @param [...args]
     */
    untilFalse(name: string, ...args: any[]): void | Promise<void> {
        return this._trigger(name, args, ReturnType.FIRST_FALSE);
    }

    /**
     * Trigger event and pass previous listener's return value into next listener and return last result
     * @param name Event name
     * @param [...args]
     */
    pipe(name: string, ...args: any[]): any | Promise<any> {
        return this._trigger(name, args, ReturnType.PIPE);
    }

    /**
     * Trigger event and return all results as is
     * @param name Event name
     * @param [...args]
     */
    raw(name: string, ...args: any[]): any[] | Promise<any>[] {
        return this._trigger(name, args, ReturnType.RAW);
    }

    /**
     * Trigger all listeners of the event, do not return anything
     * @param name 
     * @param [...args]
     */
    trigger(name: string, ...args: any[]): void | Promise<void> {
        return this._trigger(name, args);
    }

    _trigger(name: string, args: any[], returnType?: ReturnType): ReturnValue {

        const events = this.events;
        let e: ObservableEvent;

        name = name.toLowerCase();

        if (events[name]) {
            e = events[name];
            return e.trigger(args, returnType);
        }

        // trigger * event with current event name
        // as first argument
        if (e = events["*"]) {
            e.trigger([ name, ...args ], returnType);
        }
    }

    /**
    * Suspend an event. Suspended event will not call any listeners on trigger().
    * @param name Event name
    */
    suspendEvent(name: string) {
        name = name.toLowerCase();
        const events  = this.events;
        if (!events[name]) {
            return;
        }
        events[name].suspend();
    }

    suspendAllEvents() {
        const events  = this.events;
        for (const name in events) {
            events[name].suspend();
        }
    }

    /**
    * Resume suspended event.
    * @param name Event name
    */
    resumeEvent(name: string) {
        name = name.toLowerCase();
        if (!this.events[name]) {
            return;
        }
        this.events[name].resume();
    }

    resumeAllEvents() {
        const events  = this.events;
        for (const name in events) {
            events[name].resume();
        }
    }

    /**
     * @param name Event name
     */
    destroyEvent(name: string) {
        name = name.toLowerCase();
        const events  = this.events;
        if (events[name]) {
            events[name].removeAllListeners();
            events[name].$destroy();
            delete events[name];
        }
    }


    /**
    * Destroy observable
    */
    $destroy() {
        const events = this.events;

        for (const name in events) {
            this.destroyEvent(name);
        }

        this.events = {};
    }
};

import {d} from "./utils";

export default class Event {
    constructor() {
        this.events = {};
    }

    on(event, listener) {
        if (typeof this.events[event] !== 'object') {
            this.events[event] = [];
        }

        this.events[event].push(listener);
        d('info', `+ event (${event})`);

        return () => this.removeListener(event, listener);
    }

    multi(events) {
        let listeners = [];

        for (let k in events) {
            listeners.push(this.on(k, events[k]));
        }

        return {
            unbind() {
                listeners.map(remove => remove());
            }
        };
    }

    removeListener(event, listener) {
        d('info', `- event (${event})`);
        if (typeof this.events[event] !== 'object') {
            return;
        }

        if (!listener) {
            this.events[event] = [];
            return;
        }

        const i = this.events[event].indexOf(listener);

        if (i > -1) {
            this.events[event].splice(i, 1);
        }
    }

    emit(event, ...args) {
        if (typeof this.events[event] === 'object') {
            this.events[event].forEach(listener => {
                listener.apply(this, args);
            });
        }
    }

    once(event, listener) {
        const remove = this.on(event, (...args) => {
            remove();
            listener.apply(this, args);
        });
    }
}
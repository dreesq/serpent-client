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
        d('info', `Registering event ${event}`);

        return () => this.removeListener(event, listener);
    }

    removeListener(event, listener) {
        if (typeof this.events[event] !== 'object') {
            return;
        }

        const idx = this.events[event].indexOf(listener);

        if (idx > -1) {
            this.events[event].splice(idx, 1);
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
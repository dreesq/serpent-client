import io from 'socket.io-client';
import Config from './config';
import {d} from "./utils";

export default class Socket {
    constructor(parent) {
        this.parent = parent;

        if (!Config.get('socket')) {
            return parent._event.emit('loaded');
        }

        this.socket = io(Config.get('path'));
        this.parent.socket = this.socket;
        this.setup();
    }

    setup() {
        const tokenHandler = Config.get('tokenHandler');
        const token = tokenHandler.get('token');

        if (token) {
            d('Authenticating socket.');
            this.socket.emit('login', token);
        }

        this.socket.on('reconnect', () => {
            d('Socket has reconnected');
            this.socket.emit('login', token);
        });

        this.socket.on('login', () => {
            d('Socket has logged in');
        });

        this.parent._event.emit('loaded');
    }

    logout() {
        this.socket.emit('logout');
    }
}
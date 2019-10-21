import Config from './config';
import {d} from "./utils";
import {
    SOCKET_CONNECTED,
    SOCKET_AUTHENTICATED,
    SOCKET_DISCONNECTED,
    SOCKET_RECONNECTED
} from '../constants';

export default class Socket {
    constructor(parent, sio) {
        this.parent = parent;

        if (!Config.get('socket')) {
            return;
        }

        this.client = sio(Config.get('socket'));
        this.setup();
    }

    emit(...args) {
        this.client.emit(...args);
    }

    on(...args) {
        this.client.on(...args);
    }

    setup() {
        const tokenHandler = Config.get('tokenHandler');
        const token = tokenHandler.get('token');

        if (token) {
            d('info', '+ authenticating socket');
            this.client.emit('login', token);
        }

        this.client.on('connect', () => {
            d('info', '+ socket connected');
            this.parent.events.emit(SOCKET_CONNECTED);
        });

        this.client.on('reconnect', () => {
            d('info', '+ socket reconnected');
            this.client.emit('login', token);
            this.parent.events.emit(SOCKET_RECONNECTED);
        });

        this.client.on('login', () => {
            d('info', '+ socket authenticated');
            this.parent.events.emit(SOCKET_AUTHENTICATED);
        });

        this.client.on('disconnect', () => {
            d('info', '+ socket disconnected');
            this.parent.events.emit(SOCKET_DISCONNECTED);
        })
    }

    logout() {
        d('info', '+ socket logging out');
        this.client.emit('logout');
    }
}

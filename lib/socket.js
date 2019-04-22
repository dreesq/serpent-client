import Config from './config';
import {d} from "./utils";

export default class Socket {
    constructor(parent, sio) {
        this.parent = parent;

        if (!Config.get('socket')) {
            return;
        }

        this.client = sio(Config.get('path'));
        this.setup();
    }

    setup() {
        const tokenHandler = Config.get('tokenHandler');
        const token = tokenHandler.get('token');

        if (token) {
            d('info', 'Authenticating socket.');
            this.client.emit('login', token);
        }

        this.client.on('reconnect', () => {
            d('info', 'Socket has reconnected');
            this.client.emit('login', token);
        });

        this.client.on('login', () => {
            d('info','Socket has logged in');
        });
    }

    logout() {
        this.client.emit('logout');
    }
}
import Socket from './lib/socket';
import Actions from './lib/actions';
import Config from './lib/config';
import Auth from './lib/auth';
import Event from './lib/event';
import Validator from './lib/validator';
import * as Utils from './lib/utils';

/**
 * Default options
 * @type {{}}
 */

const defaults = {
     debug: false,
     socket: false,
     actions: '/',
     handler: '/',
     refresh: true,
     authFailed: false,
     sio: null,
     axios: null,
     tokenHandler: {
          get(key) {
               return localStorage.getItem(key);
          },
          set(key, token) {
               localStorage.setItem(key, token);
          },
          remove(key) {
               localStorage.removeItem(key);
          }
     }
};

/**
 * Client package
 */

export default class Serpent {
     constructor(path, opts = {}) {
          if (!path) {
               throw new Error('Missing required parameter `path`.')
          }

          this.loaded = 0;
          this.opts = {
               ...defaults,
               ...opts,
               path
          };

          Config.store(this.opts);
          this.onReady = false;
          this.setup().catch(Utils.d);
     }

     /**
      * Setup the client
      * @returns {Promise<void>}
      */

     async setup() {
          this._event = new Event();

          this._event.on('loaded', () => {
               ++this.loaded;

               if (this.loaded === 2) {
                    Utils.d('info', 'Client successfully loaded. Running onReady hook if it exists.');
                    typeof this.onReady === 'function' && this.onReady();
               }
          });

          this._auth = new Auth(this);
          this._actions = new Actions(this, Config.get('axios'));
          new Socket(this, Config.get('sio'));
          this._validator = new Validator();

          this._utils = Utils;
          this._config = Config;
     }

     /**
      * After client has finished loading
      * @param handler
      */

     ready(handler) {
          this.onReady = handler;
     }

     /**
      * Call action shortcut
      * @param action
      * @param payload
      * @returns {Promise<function(*=): void>}
      */

     call(action, payload) {
          return this._actions._call(action, payload);
     }
}

/**
 * Static properties
 * @type {{}}
 */

Serpent.actions = {};
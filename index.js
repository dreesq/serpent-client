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
     tokenHandler: {
          get() {
               return localStorage.getItem('token');
          },
          set(token) {
               localStorage.setItem('token', token);
          },
          remove() {
               localStorage.removeItem('token');
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
                    Utils.d('Client successfully loaded.', this.onReady);
                    typeof this.onReady === 'function' && this.onReady();
               }
          });

          this._auth = new Auth(this);
          new Actions(this);
          new Socket(this);
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
}

/**
 * Static properties
 * @type {{}}
 */

Serpent.actions = {};
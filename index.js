import Socket from './lib/socket';
import Actions from './lib/actions';
import Config from './lib/config';
import Auth from './lib/auth';
import Event from './lib/event';
import Validator from './lib/validator';
import I18n from './lib/i18n';
import * as Utils from './lib/utils';
import * as Constants from './constants';

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
     i18n: false,
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

          this.opts = {
               ...defaults,
               ...opts,
               path
          };

          Config.store(this.opts);
          this.onReady = false;
     }

     /**
      * Setup the client
      * @returns {Promise<void>}
      */

     async setup() {
          this._event = new Event();
          this._auth = new Auth(this);
          this._actions = new Actions(this, Config.get('axios'));
          this._socket = new Socket(this, Config.get('sio'));
          this._i18n = new I18n(this);
          this._validator = new Validator(this);

          this._utils = Utils;
          this._config = Config;

          await this._actions.setup();
          await this._i18n.setup();
          typeof this.onReady === 'function' && this.onReady();
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

/**
 * Attach constants to the global object
 */

Serpent.Constants = Constants;
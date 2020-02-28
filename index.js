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
     dev: false,
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
     constructor(opts = {}) {
          this.opts = {
               ...defaults,
               ...opts
          };

          Config.store(this.opts);
          this.onReady = false;

          if (this.opts.dev && typeof window !== 'undefined') {
               window.client = this;
               Utils.debugPanel();
          }
     }

     /**
      * Setup the client
      * @returns {Promise<void>}
      */

     async setup(actions = {}) {
          this.events = new Event();
          this.config = Config;
          this.auth = new Auth(this);
          this.actions = new Actions(this, Config.get('axios'));
          this.socket = new Socket(this, Config.get('sio'));
          this.i18n = new I18n(this);
          this.validator = new Validator(this);

          this.utils = Utils;
          this.config = Config;

          await this.actions.setup(actions);
          await this.i18n.setup();

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
          return this.actions._call(action, payload);
     }
}

/**
 * Attach constants to the global object
 */

Serpent.Constants = Constants;

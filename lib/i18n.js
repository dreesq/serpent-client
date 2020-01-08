import {d, get, parseTemplate} from "./utils";
import Config from './config';

export default class I18n {
    constructor(parent) {
        this.parent = parent;
        this.translations = {};
    }

    async setup() {
        if (!Config.get('i18n')) {
            return;
        }

        const {store, load} = Config.get('i18n');

        if (!store || typeof window === 'undefined') {
            return;
        }

        let translations = localStorage.getItem('i18n');

        if (!translations && load) {
            await this.getTranslations(load);
            return;
        }

        this.translations = JSON.parse(translations);
    }

    t(key, params) {
        return parseTemplate(get(this.translations, key, ''), params);
    }

    /**
     * Loads translations from the api
     * @param list
     * @param locale
     * @returns {Promise<void>}
     */

    async getTranslations(list = [], locale = 'en') {
        const {store} = Config.get('i18n');
        const {data, errors} = await this.parent.call('getTranslations', {
            list,
            locale
        });

        if (errors) {
            return;
        }

        this.translations = data;

        if (store && typeof window !== 'undefined') {
            localStorage.setItem('i18n', JSON.stringify(this.translations));
            d('info', '(ok) loaded translations');
        }
    }

    /**
     * Updates localStorage locales and calls the setLocale action
     * @param locale
     * @returns {Promise<void>}
     */

    async setLocale(locale = 'en') {
        const {data, errors} = await this.parent.call('setLocale', {
            locale
        });

        if (errors) {
            return Promise.reject(errors);
        }

        const {load} = Config.get('i18n');

        await this.getTranslations(load, locale);
        return Promise.resolve();
    }
}

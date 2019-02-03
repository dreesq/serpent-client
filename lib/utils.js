import Config from './config';

/**
 * Get by key helper
 * @param obj
 * @param path
 * @param defaultValue
 * @returns {any}
 */

export const get = (obj, path, defaultValue = false) => {
    let value = path.split('.').reduce((current, key) => (current && current.hasOwnProperty(key) ? current[key] : undefined), obj);
    return (typeof value !== 'undefined' ? value : defaultValue);
};

/**
 * Debug helper
 * @param args
 */

export const d = (...args) => {
    if (!Config.get('debug')) {
        return;
    }

    return console.log.apply(this, ['(serpent)', ...args]);
};
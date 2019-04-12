import Config from './config';

/**
 * Get by key helper
 * @param obj
 * @param path
 * @param defaultValue
 * @returns {data}
 */

export const get = (obj, path, defaultValue = false) => {
    let value = path.split('.').reduce((current, key) => (current && current.hasOwnProperty(key) ? current[key] : undefined), obj);
    return (typeof value !== 'undefined' ? value : defaultValue);
};

/**
 * Colorize log helper
 * @param data
 */

const colorize = data => {
    if (typeof data != 'string') {
        data = JSON.stringify(data, undefined, '\t');
    }

    let styles = {
        string: 'color:#55c149',
        number: 'color:#b66bb2',
        boolean: 'color:#ff82a4',
        null: 'color:#ff7477',
        key: 'color:#619bab'
    };

    let result = [];

    data = data.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, match => {
        let type = 'number';

        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                type = 'key';
            } else {
                type = 'string';
            }
        } else if (/true|false/.test(match)) {
            type = 'boolean';
        } else if (/null/.test(match)) {
            type = 'null';
        }

        result.push(styles[type], '');
        return `%c${match}%c`;
    });

    result.unshift(data);
    console.log.apply(console, result);
};

/**
 * Debug helper
 * @param args
 */

export const d = (...args) => {
    if (!Config.get('debug')) {
        return;
    }

    if (args.length === 1) {
        return console.log.apply(this, args);
    }

    console.log('|| Start');

    for (const arg in args) {
        let current = args[arg];

        if (Array.isArray(current) || typeof current === 'object') {
            colorize(current);
            continue;
        }

        console.log(current);
    }

    console.log('|| End');
};
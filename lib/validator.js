/**
 * Validator rules
 * @type {{}}
 */

const allRules = {
    email(value) {
        const re = /\S+@\S+\.\S+/;

        if (!re.test(value)) {
            return 'validation.email';
        }
    },

    required(value) {
        if (typeof value === 'undefined') {
            return 'validation.required';
        }
    },

    string(value) {
        if (typeof value !== 'string') {
            return 'validation.string';
        }
    },

    min(value, field, opts) {
        if (typeof value === 'string' && value.length < Number(opts[0])) {
            return 'validation.min';
        }

        if (typeof value === 'number' && value < Number(opts[0])) {
            return 'validation.min';
        }
    },

    max(value, field, opts) {
        if (typeof value === 'string' && value.length > Number(opts[0])) {
            return 'validation.max';
        }

        if (typeof value === 'number' && value > Number(opts[0])) {
            return 'validation.max';
        }
    },

    number(value) {
        if (typeof value !== 'number') {
            return 'validation.number';
        }
    },

    when(value, key, options, allInput) {
        const [required, field] = options;
        const shouldEqual = field[0] !== '!';

        if (shouldEqual && allInput[required] && allInput[required] == field) {
            return true;
        }

        if (!shouldEqual && allInput[required] && allInput[required] != field.substring(1, field.length)) {
            return true;
        }
    },

    async file(value) {
        const items = Array.isArray(value) ? value : [value];
        let invalid = false;

        for (const item of items) {
            if (typeof item !== 'object' || !item.isFile) {
                invalid = true;
            }
        }

        if (invalid) {
            return 'validation.file';
        }
    },

    async ext(value, key, options) {
        let invalidFile = await allRules.file(value, key);
        let invalid = false;

        if (invalidFile) {
            return invalidFile;
        }

        const items = Array.isArray(value) ? value : [value];

        for (const item of items) {
            const ext = item.filename.substr(item.filename.lastIndexOf('.') + 1);

            if (options.indexOf(ext) === -1) {
                invalid = true;
            }
        }

        if (invalid) {
            return 'validation.extension';
        }
    },

    date(value) {
        const isValid = (new Date(value) !== "Invalid Date") && !isNaN(new Date(value));

        if (!isValid) {
            return 'validation.date';
        }
    }
};

export default class Validator {
    registerRule(key, handler) {
        allRules[key] = handler;
    }

    async validateField(inputValue, inputKey, rules, allInput) {
        const split = rules.split('|');
        let shouldSkip = false;

        const validations = split.map(key => {
            const [ruleName, opts = ''] = key.split(':');

            if (ruleName === 'when') {
                shouldSkip = !allRules.when(inputValue, inputKey, opts.split(','), allInput);
                return;
            }

            if (!allRules[ruleName]) {
                return;
            }

            return allRules[ruleName](inputValue, inputKey, opts.split(','), allInput);
        });

        if (shouldSkip) {
            return [];
        }

        const messages = await Promise.all(validations);
        return messages.filter(message => message !== undefined);
    }

    async validate(values, rules) {
        let valid = true;
        const errors = {};

        for (const key in rules) {
            if (!rules.hasOwnProperty(key)) {
                continue;
            }

            const errorsList = await this.validateField(values[key], key, rules[key], values);

            if (errorsList.length) {
                errors[key] = errorsList;
                valid = false;
            }
        }

        return valid ? valid : errors;
    }
}
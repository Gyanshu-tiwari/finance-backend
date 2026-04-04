import schemas from '../validators/schemas.js';
import { ValidationError } from '../utils/errors.js';

const validate = (schemaName) => {
    return (req, res, next) => {
        const schema = schemas[schemaName];

        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const message = error.details.map(d => d.message).join('; ');
            return next(new ValidationError(message));
        }

        req.body = value;
        next();
    };
};

const validateQuery = (schemaName) => {
    return (req, res, next) => {
        const schema = schemas[schemaName];

        const { error, value } = schema.validate(req.query, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const message = error.details.map(d => d.message).join('; ');
            return next(new ValidationError(message));
        }

        // Clear existing keys first so unknown params stripped by Joi don't persist
        Object.keys(req.query).forEach(key => delete req.query[key]);
        Object.assign(req.query, value);
        next();
    };
};

export { validate, validateQuery };
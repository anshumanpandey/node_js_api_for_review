import Ajv from 'ajv';
import { ApiError } from './ApiError';
var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}

export const validateFor = (schema: any) => {
    var validate = ajv.compile(schema);
    return (data: any) => {
        if (validate(data) == false) {
            console.log(validate.errors)
            throw new ApiError(`Invalid Body! ${validate.errors?.map(i => i.message).join(', ')}`)
        }
    }
}
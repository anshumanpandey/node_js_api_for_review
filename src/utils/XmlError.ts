export class XmlError extends Error {
    constructor(message: string = 'API error', public code: number = 400, ) {
        super(message);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, XmlError.prototype);
    }
}
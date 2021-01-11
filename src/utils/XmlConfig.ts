import express from 'express';
import xml from 'xml2js';
import xmlparser from 'express-xml-bodyparser';

// XML Parser configurations, https://github.com/Leonidas-from-XIV/node-xml2js#options
const xmlOptions = {
    charkey: 'value',
    trim: false,
    explicitArray: false,
    normalizeTags: false,
    mergeAttrs: true,
};

const builder = new xml.Builder({
    renderOpts: { 'pretty': false }
});

export const XmlBuilder = (body: any) => {
    return builder.buildObject(body)
}

export const xmlToJson = (str: string, options?: xml.OptionsV2) => {
    return xml.parseStringPromise(str, options);
}

export const XmlMiddleware = () => {
    return xmlparser(xmlOptions);
}

export const bustHeaders = (request: express.Request, response: express.Response, next: express.NextFunction) => {
    //@ts-expect-error
    request.app.isXml = false;

    if (request.headers['content-type'] === 'application/xml' || request.headers['accept'] === 'application/xml') {
        //@ts-expect-error
        request.app.isXml = true;
    }

    next();
};


export const BuildXmlResponse = (response: any, data:any, statusCode: number = 200,preTag?: any, extraKeys = {}) => {
    response.format({
        'application/xml': () => {
            const keys = {
                xmlns: "http://www.opentravel.org/OTA/2003/05",
                "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
                "TimeStamp": new Date().toISOString().slice(0, -5),
                "Target": "Test",
                "Version": "1.002",
                ...extraKeys
            }
            const r = builder.buildObject({ [preTag]: { $: keys, ...data } })
            response.status(statusCode).send(r);
        },
        'application/json': () => {
            response.status(statusCode).json(data);
        },
        'default': () => {
            // log the request and respond with 406
            response.status(406).send('Not Acceptable');
        }
    });
};

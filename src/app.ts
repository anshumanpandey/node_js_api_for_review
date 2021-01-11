import express from 'express';
import { join } from "path"
import * as bodyParser from 'body-parser';
import sequelize, { initDb } from './utils/DB';
import { routes } from './routes';
import { ApiError } from './utils/ApiError';
import { BuildXmlResponse, xmlToJson } from './utils/XmlConfig';
import { XmlError } from './utils/XmlError';
var morgan = require('morgan')
var cors = require('cors')

const app = express();

app.use(cors())
app.use(morgan("tiny"))
app.use(bodyParser.json({
    limit: '50mb',
    verify(req: any, res, buf, encoding) {
        req.rawBody = buf;
    }
}));
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true,
}));

app.use('/', routes)

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof XmlError) {
        xmlToJson(err.message)
            .then((r) => {
                const singleError = (r.OTA_VehResRS || r.OTA_VehCancelRS).Errors[0]
                BuildXmlResponse(res, singleError, err.code, "Errors")
            })
        return
    } else if (err instanceof ApiError) {
        BuildXmlResponse(res, {
            Error: {
                StatusCode: err.code,
                Message: err.message
            }
        }, err.code, "Errors")
        return
    } else if (err.name === 'UnauthorizedError') {
        console.log(err)
        res.status(401).send("You are blocked!")
    } else if (err.name === 'RequestorIDError') {
        console.log(err)
        res.send("Invalid Account Code")
    }
    else {
        console.log(err)
        BuildXmlResponse(res, {
            Error: {
                StatusCode: 500,
                Message: "UNKWON ERROR"
            }
        }, 500, "Errors")
        return
    }
});

const bootstrap = () => {
    return initDb()
}

export {
    app,
    bootstrap
};
const requestIp = require('request-ip');
import express from 'express';
import { DB, getDbFor } from '../utils/DB';
import { logger } from './Logger';
const md5 = require('md5');

export default () => {
    return (req: express.Request, res: express.Response, n: express.NextFunction) => {
        const ip = requestIp.getClientIp(req)
        console.log(ip)
        console.log(md5(ip))
        let pos: any = null;
        if (req.body.OTA_VehLocSearchRQ) {
            pos = req.body.OTA_VehLocSearchRQ.POS
        } else if (req.body.OTA_CountryListRQ) {
            pos = req.body.OTA_CountryListRQ.POS
        } else if (req.body.OTA_VehAvailRateRQ) {
            pos = req.body.OTA_VehAvailRateRQ.POS
        } else if (req.body.OTA_VehResRQ) {
            pos = req.body.OTA_VehResRQ.POS
        } else if (req.body.OTA_VehRetResRQ) {
            pos = req.body.OTA_VehRetResRQ.POS
        } else if (req.body.OTA_VehCancelRQ) {
            pos = req.body.OTA_VehCancelRQ.POS
        }
        DB?.select().where('pall', md5(ip)).table("white")
            .then((r) => {
                if (r.length == 0) {
                    logger.info("Whitelisted IP NOT found!")
                    return getDbFor("grcgds_gateway_db")?.select()
                        .from("api_key")
                        .where({
                            'key': pos.Source.ApiKey,
                        })
                } else {
                    n();
                    return [1]
                }
            })
            .then((r) => {
                if (r && r.length != 0) {
                    logger.info(`VALID API KEY ${pos.Source.ApiKey}!`)
                    n();
                } else {
                    logger.info(`INVALID API KEY ${pos.Source.ApiKey}!`)
                    n({ name: "UnauthorizedError" });
                }
            })
            .catch((err) => {
                console.log(err)
                n({ name: "UnauthorizedError" })
            })
    }
}
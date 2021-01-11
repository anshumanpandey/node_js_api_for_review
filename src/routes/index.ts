import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import { BuildXmlResponse, XmlMiddleware } from '../utils/XmlConfig';
import { getLocations } from '../controllers/locations.controller';
import { getCountries } from '../controllers/country.controller';
import JwtMiddleware from '../utils/JwtMiddleware';
import { searchCars } from '../controllers/carsearch.controller';
import { cancelBooking, createBooking, searchBookings } from '../controllers/booking.controller';
import { logger } from '../utils/Logger';

export const routes = express();

routes.post('/', XmlMiddleware(), JwtMiddleware(),expressAsyncHandler(async (req, res) => {
    if (req.body.OTA_VehLocSearchRQ) {
      const r = await getLocations(req.body.OTA_VehLocSearchRQ)
      //@ts-expect-error
      BuildXmlResponse(res,...r)
    } else if (req.body.OTA_CountryListRQ) {
      const r = await getCountries(req.body.OTA_CountryListRQ)
      //@ts-expect-error
      BuildXmlResponse(res,...r)
    } else if (req.body.OTA_VehAvailRateRQ) {
      const r = await searchCars(req.body.OTA_VehAvailRateRQ, req)
      //@ts-expect-error
      BuildXmlResponse(res,...r)
    } else if (req.body.OTA_VehResRQ) {
      const r = await createBooking(req.body.OTA_VehResRQ)
      //@ts-expect-error
      BuildXmlResponse(res,...r)
    } else if (req.body.OTA_VehRetResRQ) {
      logger.info(`Resolving OTA_VehRetResRQ`)
      const r = await searchBookings(req.body.OTA_VehRetResRQ)
      //@ts-expect-error
      BuildXmlResponse(res,...r)
    } else if (req.body.OTA_VehCancelRQ) {
    const r = await cancelBooking(req.body.OTA_VehCancelRQ)
      //@ts-expect-error
      BuildXmlResponse(res,...r)
    } else {
      BuildXmlResponse(res,{ Response: "Request not supported" }, 200, "OTA_UnsuportedRequest")}
  }));

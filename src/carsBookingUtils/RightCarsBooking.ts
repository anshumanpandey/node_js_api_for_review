import axios from "axios"
import { xmlToJson } from "../utils/XmlConfig"
import { XmlError } from "../utils/XmlError"
import { DB } from '../utils/DB';
import { ApiError } from "../utils/ApiError";
import LogBookingToDb from "../utils/LogBookingToDb";
import { logger } from "../utils/Logger";

export default async (body: any) => {
    const { VehResRQCore, RentalPaymentPref, POS } = body
    const { VehPref, Customer } = VehResRQCore
    const { Primary: { Email, PersonName: { GivenName, Surname, NamePrefix } } } = Customer

    const pickLocation = VehResRQCore.VehRentalCore.PickUpLocation.LocationCode
    const dropLocation = VehResRQCore.VehRentalCore.ReturnLocation.LocationCode

    const xml = `<OTA_VehResRQ xmlns="http://www.opentravel.org/OTA/2003/05" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation = "http://www.opentravel.org/OTA/2003/05 VehResRQ.xsd" >
    <POS>
    <Source>
    <RequestorID Type="5" ID="MOBILE001" />
    </Source>
    </POS><VehResRQCore>
    <VehRentalCore PickUpDateTime="${VehResRQCore.VehRentalCore.PickUpDateTime}" ReturnDateTime="${VehResRQCore.VehRentalCore.ReturnDateTime}">
    <PickUpLocation LocationCode="${pickLocation}" />
    <ReturnLocation LocationCode="${dropLocation}" />
    </VehRentalCore>
    <Customer>
    <Primary>
    <PersonName>
    <NamePrefix>${NamePrefix}</NamePrefix>
    <GivenName>${GivenName}</GivenName>
    <Surname>${Surname}</Surname>
    </PersonName>
    <Telephone />
    <Email>${Email}</Email>
    <Address>
    <StreetNmbr />
    <CityName />
    <PostalCode />
    </Address>
    <CustLoyalty ProgramID="" MembershipID="" />
    </Primary>
    </Customer>
    <VendorPref></VendorPref>
    <VehPref Code="${VehPref.Code}" />
    <SpecialEquipPrefs>
    </SpecialEquipPrefs><PromoDesc></PromoDesc></VehResRQCore><VehResRQInfo/>
    
    <ArrivalDetails FlightNo="IB3154"/>
    <RentalPaymentPref>
    <Voucher Identifier="${RentalPaymentPref.Voucher.Identifier}">
    
    <PaymentCard CardType="${RentalPaymentPref.Voucher.PaymentCard.CardType}" CardCode="${RentalPaymentPref.Voucher.PaymentCard.CardCode}" CardNumber="${RentalPaymentPref.Voucher.PaymentCard.CardNumber}"
    ExpireDate="${RentalPaymentPref.Voucher.PaymentCard.CardType.ExpireDate}" >
    <CardHolderName>${RentalPaymentPref.Voucher.PaymentCard.CardHolderName}</CardHolderName>
    <AmountPaid>${RentalPaymentPref.Voucher.PaymentCard.AmountPaid}</AmountPaid>
    <CurrencyUsed>${RentalPaymentPref.Voucher.PaymentCard.CurrencyUsed}</CurrencyUsed>
    
    </PaymentCard>
    </Voucher>
    </RentalPaymentPref></OTA_VehResRQ>`;


    const { data } = await axios.post('https://OTA.right-cars.com/', xml, {
        headers: {
            "Content-Type": "application/soap+xml;charset=utf-8"
        }
    })

    if (data.includes("Error")) {
        throw new XmlError(data)
    }

    const [pickupDate, pickupTime] = VehResRQCore.VehRentalCore.PickUpDateTime.split('T')
    const [dropoffDate, dropoffTime] = VehResRQCore.VehRentalCore.ReturnDateTime.split('T')

    const res = await xmlToJson(data);

    const toInsert = {
        pickupDate,
        pickupTime,
        dropoffDate,
        dropoffTime,
        pickLocation,
        dropLocation,
        POS,
        xml,
        grcgdsClient: "1",
        resNumber: res.OTA_VehResRS.VehResRSCore[0].VehReservation[0].VehSegmentCore[0].ConfID[0].Resnumber[0]
    }

    await LogBookingToDb(toInsert)

    return res
}

export const getRightCarsBookings = async (body: any) => {
    const { VehRetResRQCore, POS } = body

    const xml = `<OTA_VehListRQ xmlns="http://www.opentravel.org/OTA/2003/05" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation = "http://www.opentravel.org/OTA/2003/05 VehResRQ.xsd" >
    <POS>
    <Source>
    <RequestorID Type="5" ID="MOBILE001" />
    </Source>
    </POS>
    <Customer>
    <Primary>
    <Email>${VehRetResRQCore.Email}</Email>
    </Primary>
    </Customer>
    </OTA_OTA_VehListRQ>`;

    try {
        const { data } = await axios.post('https://OTA.right-cars.com/', xml, {
            headers: {
                "Content-Type": "application/soap+xml;charset=utf-8"
            }
        })

        if (data.includes("Error")) {
            throw new XmlError(data)
        }

        const reservation = await xmlToJson(data);

        return reservation
    } catch (error) {
        if (error.response) {
            throw new ApiError(error.response.data.error)
        } else {
            throw error
        }
    }
}

export const cancelRightCarsBooking = async (body: any) => {
    const { VehCancelRQCore, POS } = body

    const xml = `<OTA_VehCancelRQ xmlns="http://www.opentravel.org/OTA/2003/05"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.opentravel.org/OTA/2003/05
    VehCancelRQ.xsd">
    <POS>
    <Source>
    <RequestorID Type="5" ID="MOBILE001" />
    </Source>
    </POS>
    <VehCancelRQCore>
    <ResNumber Number="${VehCancelRQCore.ResNumber.Number}"/>
    </VehCancelCore>
    <VehCancelRQInfo>
    </VehCancelRQInfo>
    </OTA_VehCancelRQ>`;

    try {
        const { data } = await axios.post('https://OTA.right-cars.com/', xml, {
            headers: {
                "Content-Type": "application/soap+xml;charset=utf-8"
            }
        })

        if (data.includes("Error")) {
            console.log(`RC cancel failed with ${data}`)
            throw new XmlError(data)
        }

        const reservation = await xmlToJson(data);

        return reservation
    } catch (error) {
        if (error.response) {
            throw new ApiError(error.response.data.error)
        } else {
            throw error
        }
    }
}
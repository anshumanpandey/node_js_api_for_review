import axios from "axios"
import { xmlToJson } from "../utils/XmlConfig"
const logger = require('pino')()
const { v4: uuidv4 } = require('uuid');
import { ApiError } from "../utils/ApiError";
import LogBookingToDb from "../utils/LogBookingToDb";
import { getHannkUserByEmail } from "../services/requestor.service";
import { getGrcgsCode } from "../services/locations.service";

export default async (body: any) => {
    const { VehResRQCore, RentalPaymentPref, POS } = body
    const { VehPref, Customer } = VehResRQCore
    const { Primary: { Email, Telephone, PersonName: { GivenName, Surname, NamePrefix } } } = Customer

    const pickLocation = VehResRQCore.VehRentalCore.PickUpLocation.LocationCode
    const dropLocation = VehResRQCore.VehRentalCore.ReturnLocation.LocationCode

    const axiosBody = {
        "SearchUID": VehPref.SearchId,
        "CarUID": VehPref.Code,
        "Title": "Mr.",
        "Name": GivenName,
        "Surname": Surname,
        "PhoneCountryCode": Telephone?.PhoneNumber?.split(' ')[0],
        "Phone": Telephone?.PhoneNumber?.split(' ')[1] || "",
        "Email": Email,
        "BirthDate": "1985-11-20T08:50:32.263Z",
        "ResidenceCountryCode": "GB",
        "FlightNumber": "123",
        "CustomerComment": "",
        "ReferenceNumber": uuidv4(),
        "CoverageOfferID": 10,
        "PaypalTransactionNo": RentalPaymentPref.Voucher.Identifier
    };


    try {
        const [hannkUser, pickLocationObj, dropLocationObj] = await Promise.all([
            getHannkUserByEmail({ email: Email }),
            getGrcgsCode({ grcgdsInternalCode: pickLocation }),
            getGrcgsCode({ grcgdsInternalCode: dropLocation }),
        ])
        const { data } = await axios.post('https://booking.discovercarhire.com/api/Reservation/Create?accessToken=yHjjy7XZVTsVTb4zP3HLc3uQP3ZJEvBkKBuwWhSwNCkafCXx5ykRmhJdnqW2UJT3', axiosBody, {
            auth: {
                username: 'mqTqzF7a42zk',
                password: 'xks8pgd2QMqAS2qN'
            }
        })

        if (!data.IsSuccessful || data.IsSuccessful == false) {
            logger.error(data)
            throw new ApiError("We fail to call service")
        }

        const bindReqBody = {
            "PaymentGateway": 2,
            "TransactionID": RentalPaymentPref.Voucher.Identifier,
            "Amount": body.RentalPaymentPref.Voucher.PaymentCard.AmountPaid,
            "CurrencyCode": body.RentalPaymentPref.Voucher.PaymentCard.CurrencyUsed,
            "ReservationNumber": data.ReservationNumber
        }
        await axios.post('https://booking.discovercarhire.com/api/Payment/BindTransaction?accessToken=yHjjy7XZVTsVTb4zP3HLc3uQP3ZJEvBkKBuwWhSwNCkafCXx5ykRmhJdnqW2UJT3', bindReqBody, {
            auth: {
                username: 'mqTqzF7a42zk',
                password: 'xks8pgd2QMqAS2qN'
            }
        })

        const [pickupDate, pickupTime] = VehResRQCore.VehRentalCore.PickUpDateTime.split('T')
        const [dropoffDate, dropoffTime] = VehResRQCore.VehRentalCore.ReturnDateTime.split('T')

        const toInsert = {
            pickupDate,
            pickupTime,
            dropoffDate,
            dropoffTime,
            pickLocation,
            dropLocation,
            POS,
            hannkUser: await getHannkUserByEmail({ email: Email }),
            xml: JSON.stringify(axiosBody),
            grcgdsClient: "44",
            extras: [],
            resNumber: ""
        }
        await LogBookingToDb(toInsert)

        const xml = wrapDiscoverResponse({ body, hannkUser, response: data, pickLocation: pickLocationObj, dropLocation: dropLocationObj})
        console.log("xml to conver", xml)
        return xmlToJson(xml)
    } catch (error) {
        console.log(error)
        if (error.response) {
            throw new ApiError(error.response.data.error)
        } else {
            throw error
        }
    }
}

type WrapperParams = { body: any, hannkUser: any, response: any, pickLocation: any, dropLocation: any }
const wrapDiscoverResponse = ({ body, hannkUser, response, pickLocation, dropLocation }: WrapperParams) => {

    return `<?xml version="1.0" encoding="UTF-8"?>
    <OTA_VehResRS
        xmlns="http://www.opentravel.org/OTA/2003/05"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opentravel.org/OTA/2003/05 OTA_VehResRS.xsd" Version="2.101">
        <Success/>
        <VehResRSCore>
            <VehReservation>
                <Customer>
                    <Primary>
                        <PersonName>
                            <GivenName>${body.VehResRQCore.Customer.Primary.PersonName.GivenName}</GivenName>
                            <Surname>${body.VehResRQCore.Customer.Primary.PersonName.GivenName}</Surname>
                        </PersonName>
                        <Email>${body.VehResRQCore.Customer.Primary.Email}</Email>
                        <Address>
                            <AddressLine>${hannkUser?.add1 || ""}</AddressLine>
                            <CityName>${hannkUser?.city || ""}</CityName>
                            <PostalCode>${hannkUser?.postcode || ""}</PostalCode>
                            <Country>${hannkUser?.country || ""}</Country>
                        </Address>
                    </Primary>
                </Customer>
                <VehSegmentCore>
                    <ConfID>
                        <Type>${response.ReservationNumber.split("-")[0]}</Type>
                        <ID>${response.ReservationNumber.split("-")[1]}</ID>
                        <Resnumber>${response.ReservationNumber}</Resnumber>
                    </ConfID>
                    <Vendor>
                        <CompanyShortName>DiscoverCars</CompanyShortName>
                        <Code/>
                    </Vendor>
                    <VehRentalCore>
                        <PickUpLocation>
                            <LocationCode>${body.VehResRQCore.VehRentalCore.PickUpLocation.LocationCode}</LocationCode>
                            <CodeContext/>
                        </PickUpLocation>
                        <ReturnLocation>
                            <LocationCode>${body.VehResRQCore.VehRentalCore.ReturnLocation.LocationCode}</LocationCode>
                            <CodeContext/>
                        </ReturnLocation>
                        <PickUpDateTime>${body.VehResRQCore.VehRentalCore.PickUpDateTime}</PickUpDateTime>
                        <ReturnDateTime>${body.VehResRQCore.VehRentalCore.ReturnDateTime}</ReturnDateTime>
                    </VehRentalCore>
                    <Vehicle>
                        <Code>${body.VehResRQCore.VehPref.Code}</Code>
                    </Vehicle>
                    <RentalRate>
                        <RateDistance>
                            <Unlimited>true</Unlimited>
                            <DistUnitName>km</DistUnitName>
                            <VehiclePeriodUnitName>RentalPeriod</VehiclePeriodUnitName>
                        </RateDistance>
                        <VehicleCharges>
                            <VehicleCharge>
                                <TaxAmounts>
                                    <TaxAmount>
                                        <Total>6.36</Total>
                                        <CurrencyCode>${body.RentalPaymentPref.Voucher.PaymentCard.CurrencyUsed}</CurrencyCode>
                                        <Percentage>7.00</Percentage>
                                        <Description>Tax</Description>
                                    </TaxAmount>
                                </TaxAmounts>
                                <Calculation>
                                    <UnitCharge>${body.RentalPaymentPref.Voucher.PaymentCard.AmountPaid}</UnitCharge>
                                    <UnitName>Day</UnitName>
                                    <Quantity>1</Quantity>
                                </Calculation>
                                <Amount>${body.RentalPaymentPref.Voucher.PaymentCard.AmountPaid}</Amount>
                                <TaxInclusive>true</TaxInclusive>
                                <Purpose>1</Purpose>
                            </VehicleCharge>
                        </VehicleCharges>
                        <RateQualifier>
                            <RateCategory>16</RateCategory>
                            <RateQualifier>Best</RateQualifier>
                            <RatePeriod>Daily</RatePeriod>
                            <VendorRateID>8</VendorRateID>
                        </RateQualifier>
                    </RentalRate>
                    <PricedEquips/>
                    <TotalCharge>
                        <RateTotalAmount>${body.RentalPaymentPref.Voucher.PaymentCard.AmountPaid}</RateTotalAmount>
                        <EstimatedTotalAmount>${body.RentalPaymentPref.Voucher.PaymentCard.AmountPaid}</EstimatedTotalAmount>
                    </TotalCharge>
                </VehSegmentCore>
                <VehSegmentInfo>
                    <LocationDetails>
                        <Address>
                            <AddressLine>3960 NW 26th St </AddressLine>
                                <CityName>Miami</CityName>
                                <PostalCode>33142</PostalCode>
                                <CountryName>
                                    <Name>UNITED STATES</Name>
                                    <Code>US</Code>
                                </CountryName>
                        </Address>
                        <Telephone>
                            <PhoneNumber>+1 8006471058</PhoneNumber>
                        </Telephone>
                        <Code>${pickLocation.internalcode}</Code>
                        <Name>${pickLocation.locationname}</Name>
                        <CodeContext>PickUp Location</CodeContext>
                        <Pickupinst>When you have cleared customs follow the airport signs for the Car Rental Village. When you arrive at the Car Rental Village please call +1 800-647-1058 to arrange for the shuttle bus to collect you.</Pickupinst>
                    </LocationDetails>
                    <LocationDetails>
                        <Address>
                            <AddressLine>3960 NW 26th St</AddressLine>
                                <CityName>Miami</CityName>
                                        <PostalCode>33142</PostalCode>
                                        <CountryName>
                                            <Name>UNITED STATES</Name>
                                            <Code>US</Code>
                                        </CountryName>
                                </Address>
                                <Telephone>
                                    <PhoneNumber>+1 8006471058</PhoneNumber>
                                </Telephone>
                                <Code>${dropLocation.internalcode}</Code>
                                <Name>${dropLocation.locationname}</Name>
                                <CodeContext>Return Location</CodeContext>
                                <Pickupinst>When you have cleared customs follow the airport signs for the Car Rental Village. When you arrive at the Car Rental Village please call +1 800-647-1058 to arrange for the shuttle bus to collect you.</Pickupinst>
                            </LocationDetails>
                        </VehSegmentInfo>
                    </VehReservation>
                </VehResRSCore>
            </OTA_VehResRS> `
}
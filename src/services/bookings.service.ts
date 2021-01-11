import { DB, getDbFor } from "../utils/DB";
import { logger } from "../utils/Logger";
import { getCompanyLocations, getGrcgsCode, getGrcgsCodes } from "./locations.service";

export const getBookings = async () => {
    logger.info("Getting bookings")
    const [r, extras ] = await Promise.all([
        DB?.select().from("Bookings").whereNot('customerId', null),
        DB?.select().from("BookingsExtras")
    ]);

    if (!r) return [];
    if (r.length == 0) return [];

    const [customers, grcClients] = await Promise.all([
        getDbFor("grcgds_hannk").select().from("users"),
        getDbFor("grcgds_gateway_db").select().from("clients"),
    ])

    return r.map((r) => {
        return {
            ...r,
            supplier: grcClients.find((s) => s.id == r.grcgdsClient),
            customer: customers.find(c => c.id == r.customerId ),
            extras: (extras || []).filter(e => e.bookingId == r.id)
        }
    })
}

export const cancelBookingByResNumber = async (resNumber: string) => {
    return DB?.select().from("Bookings")
    .where('resNumber', resNumber)
    .update({
        reservationStatus: 'Cancelled',
    })
}

export const createBookingsXmlResponse = async (bookings: any[]) => {
    logger.info('Creating booking response')
    const codes = await getCompanyLocations()
    return `
    <?xml version="1.0"?>
    <OTA_VehRetResRS>
    <Success/>
    <VehRetResRSCore>
        ${bookings.filter(b => b.customer).map((b) => {
            const extras = b.extras.length != 0 ? b.extras.map((e: any) => {
                return `<${e.vendorEquipId}>${e.quantity}</${e.vendorEquipId}>`;
            }).join("\n"): ""
        return `
            <VehReservation>
            <Customer>
                <Primary>
                <PersonName>
                    <GivenName>${b.customer.firstname}</GivenName>
                    <Surname>${b.customer.lastname}</Surname>
                </PersonName>
                <Email/>
                <Address>
                    <AddressLine/>
                    <CityName/>
                    <PostalCode/>
                </Address>
                </Primary>
            </Customer>
            <VehSegmentCore>
                <ConfID>
                <ResNumber>${b.resNumber}</ResNumber>
                </ConfID>
                <VehRentalCore>
                <PickUpLocation>
                    <Name/>
                    <LocationCode>${b.pickLocation}</LocationCode>
                    <Pickupdate>${b.pickupDate}T${b.pickupTime.slice(0, 5)}</Pickupdate>
                </PickUpLocation>
                <ReturnLocation>
                    <Name/>
                    <LocationCode>${b.dropoffLocation}</LocationCode>
                    <Pickupdate>${b.dropoffDate}T${b.dropoffTime.slice(0, 5)}</Pickupdate>
                </ReturnLocation>
                </VehRentalCore>
                <Vehicle>
                    <Code>FVMR</Code>
                </Vehicle>
                <Extras>${extras}</Extras>
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
                        <Total/>
                        <CurrencyCode/>
                        <Percentage/>
                        <Description>Tax</Description>
                        </TaxAmount>
                    </TaxAmounts>
                    <Calculation>
                        <UnitCharge/>
                        <UnitName>Day</UnitName>
                        <Quantity>1</Quantity>
                    </Calculation>
                    </VehicleCharge>
                </VehicleCharges>
                <RateQualifier>
                    <RateCategory/>
                    <RateQualifier/>
                    <RatePeriod/>
                    <VendorRateID/>
                </RateQualifier>
                </RentalRate>
                <TotalCharge>
                <RateTotalAmount>${b.carPrice}</RateTotalAmount>
                <EstimatedTotalAmount>${b.carPrice}</EstimatedTotalAmount>
                </TotalCharge>
            </VehSegmentCore>
            <VehSegmentInfo>
                <LocationDetails>
                <Address>
                    <AddressLine/>
                    <CityName/>
                    <PostalCode/>
                    <CountryName>
                    <Name/>
                    <Code/>
                    <CountryCode>${codes.find(c => c.internal_code == b.pickLocation).country}</CountryCode>
                    </CountryName>
                </Address>
                <Telephone>
                    <PhoneNumber>${b?.supplier?.phonenumber}</PhoneNumber>
                </Telephone>
                <Code>${b.pickLocation}</Code>
                <Name>${codes.find(c => c.internal_code == b.pickLocation).location}</Name>
                <CodeContext>Pickup Location</CodeContext>
                </LocationDetails>
                <LocationDetails>
                <Address>
                    <AddressLine/>
                    <CityName/>
                    <PostalCode/>
                    <CountryName>
                        <Name/>
                        <Code/>
                        <CountryCode>${codes.find(c => c.internal_code == b.dropoffLocation).country}</CountryCode>
                    </CountryName>
                </Address>
                <Telephone>
                    <PhoneNumber>${b?.supplier?.phonenumber}</PhoneNumber>
                </Telephone>
                <Code>${b.dropoffLocation}</Code>
                <Name>${codes.find(c => c.internal_code == b.dropoffLocation).location}</Name>
                <CodeContext>Return Location</CodeContext>
                </LocationDetails>
            </VehSegmentInfo>
            </VehReservation>`;
        }).join("\n")}
    </VehRetResRSCore>
    </OTA_VehRetResRS>`
}
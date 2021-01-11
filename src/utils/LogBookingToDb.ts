import { DB } from "./DB"

type Params = {
    pickupDate: string,
    pickupTime: string,
    dropoffDate: string,
    dropoffTime: string,
    pickLocation: string,
    dropLocation: string,
    POS: any,
    xml: string
    grcgdsClient: string,
    resNumber: string,
    extras: any[],
    hannkUser: any
}

export default async ({
    pickupDate,
    pickupTime,
    dropoffDate,
    dropoffTime,
    pickLocation,
    dropLocation,
    POS,
    xml,
    grcgdsClient,
    resNumber,
    extras,
    hannkUser
}: Params) => {
    const toInsert = {
        pickupDate,
        pickupTime,
        dropoffDate,
        dropoffTime,
        pickLocation,
        dropoffLocation: dropLocation,
        requestorId: POS.Source.RequestorID.ID,
        requestBody: xml,
        grcgdsClient,
        resNumber,
        createdAt: new Date(),
        updatedAt: new Date(),
        customerId : hannkUser?.id
    }

    await DB?.insert(toInsert).into('Bookings')
    const bookings = await DB?.select(DB?.raw('LAST_INSERT_ID()'))
    if (!bookings) return Promise.resolve()

    const extrasToInsert = extras.map(e => {
        return {
            'vendorEquipId': e["vendorEquipID"],
            'quantity': e["Quantity"],
            'bookingId': bookings[0]["LAST_INSERT_ID()"],
        }
    })

    return DB?.insert(extrasToInsert).into('BookingsExtras')
}
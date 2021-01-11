import axios from "axios"
import { DB } from "../utils/DB";
import { xmlToJson } from '../utils/XmlConfig';
const allSettled = require('promise.allsettled');

const getRightCars = async () => {
    const r = await DB?.select({ clientId: "clients.id", clientname: "clients.clientname", clientAccountCode: "data_suppliers_user.account_code" })
        .from("clients")
        .leftJoin('data_suppliers_user', 'data_suppliers_user.clientId', 'clients.id')
        .joinRaw('LEFT JOIN broker_account_type on data_suppliers_user.account_type_code and broker_account_type.name = "Prepaid Standard" ')
        .where("clients.id", 1)
    return r && r.length != 0 ? r[0] : null
}

const getRightCarsDataUsers = async () => {
    const r = await DB?.select()
        .from("client_broker_locations_accountype")
        .where("client_broker_locations_accountype.clientId", 1)
        .whereRaw("client_broker_locations_accountype.account_code <> '' ")
        .groupBy("client_broker_locations_accountype.internal_code");
    return r || []
}

const generateXmlBody = (body: any, id: string) => {
    const PickUpDateTime = body.VehAvailRQCore.VehRentalCore.PickUpDateTime
    const ReturnDateTime = body.VehAvailRQCore.VehRentalCore.ReturnDateTime
    const pickLocation = body.VehAvailRQCore.VehRentalCore.PickUpLocation.LocationCode
    const dropLocation = body.VehAvailRQCore.VehRentalCore.ReturnLocation.LocationCode
    const Age = body.VehAvailRQInfo.Customer.Primary.DriverType.Age
    const Code = body.VehAvailRQInfo.Customer.Primary.CitizenCountryName.Code
    const currency = body?.POS?.Source?.ISOCurrency

    return `<?xml version="1.0"?>
    <OTA_VehAvailRateRQDeep xmlns="http://www.opentravel.org/OTA/2003/05" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opentravel.org/OTA/2003/05OTA_VehAvailRateRQ.xsd" TimeStamp="2010-11-12T11:00:00" Target="Test" Version="1.002">
    <POS>
        <Source>
            <RequestorID Type="5" ID="${id}"/>
        </Source>
    </POS>
    <VehAvailRQCore Status="Available">
        <Currency Code="${currency || "EUR"}"/>
        <VehRentalCore PickUpDateTime="${PickUpDateTime}" ReturnDateTime="${ReturnDateTime}">
        
        <PickUpLocation LocationCode="${pickLocation}"/>

        <ReturnLocation LocationCode="${dropLocation}"/>
        </VehRentalCore>
    </VehAvailRQCore>
    <VehAvailRQInfo>
        <Customer>
        <Primary>
            <CitizenCountryName Code="${Code || "UK"}"/>
            <DriverType Age="${Age || 35}"/>
        </Primary>
        </Customer>
        <TPA_Extensions>
        <ConsumerIP>192.168.102.14</ConsumerIP>
        </TPA_Extensions>
    </VehAvailRQInfo>
    </OTA_VehAvailRateRQDeep>
`
}

export const RC_URL = 'https://ota.right-cars.com'

export default async (body: any) => {

    const [rc, dataUsers] = await Promise.all([
        getRightCars(),
        getRightCarsDataUsers()
    ]);

    const xml = generateXmlBody(body, "1000022");

    const { data } = await axios.post(RC_URL, xml, {
        headers: {
            'Content-Type': 'text/plain; charset=UTF8',
        }
    })

    const json = await xmlToJson(data);
    if (json.OTA_VehAvailRateRS.VehVendorAvails[0].VehVendorAvail[0].VehAvails[0] == "") {
        json.OTA_VehAvailRateRS.VehVendorAvails[0].VehVendorAvail[0].VehAvails = [{ VehAvail: [] }]
        return []
    } else {
        return json.OTA_VehAvailRateRS.VehVendorAvails[0].VehVendorAvail[0].VehAvails[0].VehAvail
            .map((r: any) => ({
                VehAvailCore: [{
                    ...r.VehAvailCore[0],
                    $: {
                        ...r.VehAvailCore[0].$,
                        "Supplier_ID": `GRC-${rc.id}0000`,
                        "Supplier_Name": rc.clientname,
                    },
                    Vehicle: [{
                        ...r.VehAvailCore[0].Vehicle[0],
                        $: {
                            ...r.VehAvailCore[0].Vehicle[0].$,
                            "Brand": rc.clientname,
                            "BrandPicURL": "https://supplierimages.rent.it/rightcars.jpg",
                        },
                    }]
                }],
            }))
    }

}
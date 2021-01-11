import Axios from "axios"
import { DB } from "../utils/DB"

const getUrl = async (params: any) => {
    const [pickCode, dropCode ] = await Promise.all([
        getCodeForGrcCode(params.VehAvailRQCore.VehRentalCore.PickUpLocation.LocationCode),
        getCodeForGrcCode(params.VehAvailRQCore.VehRentalCore.ReturnLocation.LocationCode),
    ])
    const [pickDate, pickTime] = params.VehAvailRQCore.VehRentalCore.PickUpDateTime.split("T")
    const [dropDate, dropTime] = params.VehAvailRQCore.VehRentalCore.PickUpDateTime.split("T")
    return `https://www.grcgds.com/surprice_api/available_api.php?pickuplocationcode=${pickCode}&pickupdate=${pickDate}&pickuptime=${pickTime}&returnlocationcode=${dropCode}&returndate=${dropDate}&returntime=${dropTime}&age=30`
}

const getDiscoverCarsUser = async () => {
    const r = await DB?.select({ clientId: "clients.id", clientname: "clients.clientname", clientAccountCode: "data_suppliers_user.account_code" })
        .from("clients")
        .leftJoin('data_suppliers_user', 'data_suppliers_user.clientId', 'clients.id')
        .joinRaw('LEFT JOIN broker_account_type on data_suppliers_user.account_type_code and broker_account_type.name = "Prepaid Standard" ')
        .where("clients.id", 37)
    return r && r.length != 0 ? r[0] : null
}

const getCodeForGrcCode = async (grcCode: string) => {
    const r = await DB?.select().from("companies_locations")
        .where("GRCGDSlocatincode", grcCode)
        .where("clientId", 37)
    return r && r.length != 0 ? r[0].internal_code : null
}

export default async (params: any) => {

    const url = await getUrl(params)
    const { data } = await Axios.get(url, {})

    const u = await getDiscoverCarsUser()

    return data.map((car: any) => {
        return {
            VehAvailCore: [{
                $: {
                    "VehID": "",
                    "Deeplink": car.deeplink,
                    "Supplier_ID": u.clientAccountCode ? `GRC-${u.clientAccountCode}` : `GRC-${u.clientId}0001`,
                    "Supplier_Name": u.clientname,
                },
                "Vehicle": [{
                    $: {
                        "BrandPicURL": u.logo_name,
                        "Brand": "Surprice",
                        "AirConditionInd": car.model.aircondition == 1 ? "Yes" : "No",
                        "TransmissionType": car.model.TransmissionType == "M" ? "Manual" : "Automatic" ,
                    },
                    "VehMakeModel": [{
                        $: {
                            "Name": car.model.type,
                            "PictureURL": car.model.photo_url,
                        }
                    }],
                    "VehType": [{
                        $: {
                            "VehicleCategory": car.model.SIPPCode,
                            "DoorCount": car.model.doors, // we cannot getr the door number from API response
                            "Baggage": 0,
                        }
                    }],
                    "VehClass": [{
                        $: { "Size": car.model.persons }
                    }],
                    "VehTerms": []
                }],
                "RentalRate": [],
                "VehicleCharge": {
                    "CurrencyCode": car.charge.currency,
                },
                "VehicleCharges": [{
                    "VehicleCharge": [{"CurrencyCode": car.charge.currency }]
                }],
                "TotalCharge": [{
                    $: {
                        "RateTotalAmount": Number(car.charge.price).toFixed(2),
                        "CurrencyCode": car.charge.currency,
                    }
                }],
                "PricedEquips": car.extras.map((e: any) => {
                    return {
                        PricedEquip: {
                            Equipment: [{ $: { Description: e.Description, EquipType: e.EquipmentId, vendorEquipID: e.Description } }],
                            Amount: e.Charge
                        }
                    }
                })
            }]
        }
    })
}
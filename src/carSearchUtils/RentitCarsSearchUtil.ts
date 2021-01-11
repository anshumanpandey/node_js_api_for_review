import Axios from "axios"
import { DB } from "../utils/DB"

const URL_PATH = "https://webapi.rent.it/api-ri/Quote/CreateAndLoad/"
export const RENTI_URL = URL_PATH

const getUrl = async (params: any) => {
    const [pickCode, dropCode ] = await Promise.all([
        getCodeForGrcCode(params.VehAvailRQCore.VehRentalCore.PickUpLocation.LocationCode),
        getCodeForGrcCode(params.VehAvailRQCore.VehRentalCore.ReturnLocation.LocationCode),
    ])
    return `${URL_PATH}?ClientId=35&APIKey=30995a94-bc9b-f1ba-b47e-21a0091c24c4&Language=GB&RemoteIP=127.0.0.1&CountryID=1&PickUpLocationID=${pickCode}&PickUpDate=${params.VehAvailRQCore.VehRentalCore.PickUpDateTime}&DropOffLocationID=${dropCode}&DropOffDate=${params.VehAvailRQCore.VehRentalCore.ReturnDateTime}&DriverCountryCode=IT&DriverAge=30&Currency=${params?.POS?.Source?.ISOCurrency || "GBP"}&UserID=0`
}


const formatDate = (fullDate: string) => {
    const [date, time] = fullDate.split('T')
    return `${date.split('-').reverse().join(".")}T${time.slice(0, -3)}`
}

const getDiscoverCarsUser = async () => {
    const r = await DB?.select({ brandUrl: "clients.logo_name",clientId: "clients.id", clientname: "clients.clientname", clientAccountCode: "data_suppliers_user.account_code" })
        .from("clients")
        .leftJoin('data_suppliers_user', 'data_suppliers_user.clientId', 'clients.id')
        .joinRaw('LEFT JOIN broker_account_type on data_suppliers_user.account_type_code and broker_account_type.name = "Prepaid Standard" ')
        .where("clients.id", 11)
    return r && r.length != 0 ? r[0] : null
}

const getCodeForGrcCode = async (grcCode: string) => {
    const r = await DB?.select().from("companies_locations")
        .where("GRCGDSlocatincode", grcCode)
        .where("clientId", 11)
    return r && r.length != 0 ? r[0].internal_code : null
}

export default async (params: any) => {

    const url = await getUrl(params)
    const { data } = await Axios.get(url, {})

    const u = await getDiscoverCarsUser()

    return data.Rates.map((rate: any) => {
        const doorsRegexp = /[0-9].*[0-9]/gim
        const doors = doorsRegexp.exec(rate.Vehicle.Type)
        return {
            VehAvailCore: [{
                $: {
                    "VehID": rate.Reference.RequestID,
                    "Deeplink": rate.BookUrl,
                    "Supplier_ID": u.clientAccountCode ? `GRC-${u.clientAccountCode}` : `GRC-${u.clientId}0001`,
                    "Supplier_Name": u.clientname,
                },
                "Vehicle": [{
                    $: {
                        "BrandPicURL": rate.Supplier.LogoUrl,
                        "CarClass": rate.Vehicle.AcrissGroup[0]?.Name,
                        "Brand": rate.Supplier.Name,
                        "AirConditionInd": rate.Vehicle.AC == true ? "Yes" : "No",
                        "TransmissionType": rate.Vehicle.Automatic == true ? "Automatic" : "Manual",
                    },
                    "VehMakeModel": [{
                        $: {
                            "Name": rate.Vehicle.Vehicles,
                            "PictureURL": rate.Vehicle.PhotoUrl,
                        }
                    }],
                    "VehType": [{
                        $: {
                            "VehicleCategory": rate.Vehicle.Acriss,
                            "DoorCount": doors ? doors[0] : 0,
                            "Baggage": parseInt(rate.Vehicle.Luggages),
                        }
                    }],
                    "VehClass": [{
                        $: { "Size": rate.Vehicle.Passengers }
                    }],
                    "VehTerms": []
                }],
                "RentalRate": [],
                "VehicleCharges": [{
                    "VehicleCharge": [{"CurrencyCode": rate.TotalRate.TotalAmount.Currency,}]
                }],
                "TotalCharge": [{
                    $: {
                        "RateTotalAmount": Number(rate.TotalRate.TotalAmount.Amount).toFixed(2),
                        "CurrencyCode": rate.TotalRate.TotalAmount.Currency,
                    }
                }],
                "PricedEquips": []
            }]
        }
    })
}
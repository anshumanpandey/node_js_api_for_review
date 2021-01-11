import { validateFor } from '../utils/JsonValidator';
import { ApiError } from '../utils/ApiError';
import { wrapCarsResponseIntoXml } from '../carSearchUtils/MergeResults';
import { increaseCounterFor, sortClientsBySearch } from '../services/searchHistory.service';
import { SearchHistoryEnum } from '../utils/SearchHistoryEnum';
import { GetSerchForClients } from '../utils/GetSerchForClients';
import { getBrokersOwners, getDataSuppliers, getDataUsersForUserId, getGrcgdsClient, SUPORTED_URL } from '../services/requestor.service';
import { FilterBrandsForClient } from '../utils/FilterBrandsForClient';
import { GetSearchServices } from '../utils/GetSearchServices';
import RightCarsSearchUtils, { RC_URL } from '../carSearchUtils/RightCarsSearchUtils';
import RentitCarsSearchUtil, { RENTI_URL } from '../carSearchUtils/RentitCarsSearchUtil';
import SurpriceCarsSearchUtil from '../carSearchUtils/SurpriceCarsSearchUtil';
const allSettled = require('promise.allsettled');

const schema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "type": "object",
    "title": "The root schema",
    "description": "The root schema comprises the entire JSON document.",
    "default": {},
    "examples": [
        {
            "VehAvailRQCore": {
                "Status": "Available",
                "VehRentalCore": {
                    "PickUpDateTime": "2020-08-05T12:00:00",
                    "ReturnDateTime": "2020-08-06T10:00:00",
                    "PickUpLocation": {
                        "LocationCode": "MIAA01"
                    },
                    "ReturnLocation": {
                        "LocationCode": "MIAA01"
                    }
                }
            },
            "VehAvailRQInfo": {
                "Customer": {
                    "Primary": {
                        "DriverType": {
                            "Age": ""
                        },
                        "CitizenCountryName": {
                            "Code": ""
                        }
                    }
                }
            }
        }
    ],
    "required": [
        "VehAvailRQCore",
        "VehAvailRQInfo"
    ],
    "properties": {
        "VehAvailRQCore": {
            "$id": "#/properties/VehAvailRQCore",
            "type": "object",
            "title": "The VehAvailRQCore schema",
            "description": "An explanation about the purpose of this instance.",
            "default": {},
            "examples": [
                {
                    "Status": "Available",
                    "VehRentalCore": {
                        "PickUpDateTime": "2020-08-05T12:00:00",
                        "ReturnDateTime": "2020-08-06T10:00:00",
                        "PickUpLocation": {
                            "LocationCode": "MIAA01"
                        },
                        "ReturnLocation": {
                            "LocationCode": "MIAA01"
                        }
                    }
                }
            ],
            "required": [
                "Status",
                "VehRentalCore"
            ],
            "properties": {
                "Status": {
                    "$id": "#/properties/VehAvailRQCore/properties/Status",
                    "type": "string",
                    "title": "The Status schema",
                    "description": "An explanation about the purpose of this instance.",
                    "default": "",
                    "examples": [
                        "Available"
                    ]
                },
                "VehRentalCore": {
                    "$id": "#/properties/VehAvailRQCore/properties/VehRentalCore",
                    "type": "object",
                    "title": "The VehRentalCore schema",
                    "description": "An explanation about the purpose of this instance.",
                    "default": {},
                    "examples": [
                        {
                            "PickUpDateTime": "2020-08-05T12:00:00",
                            "ReturnDateTime": "2020-08-06T10:00:00",
                            "PickUpLocation": {
                                "LocationCode": "MIAA01"
                            },
                            "ReturnLocation": {
                                "LocationCode": "MIAA01"
                            }
                        }
                    ],
                    "required": [
                        "PickUpDateTime",
                        "ReturnDateTime",
                        "PickUpLocation",
                        "ReturnLocation"
                    ],
                    "properties": {
                        "PickUpDateTime": {
                            "$id": "#/properties/VehAvailRQCore/properties/VehRentalCore/properties/PickUpDateTime",
                            "type": "string",
                            "title": "The PickUpDateTime schema",
                            "description": "An explanation about the purpose of this instance.",
                            "default": "",
                            "examples": [
                                "2020-08-05T12:00:00"
                            ]
                        },
                        "ReturnDateTime": {
                            "$id": "#/properties/VehAvailRQCore/properties/VehRentalCore/properties/ReturnDateTime",
                            "type": "string",
                            "title": "The ReturnDateTime schema",
                            "description": "An explanation about the purpose of this instance.",
                            "default": "",
                            "examples": [
                                "2020-08-06T10:00:00"
                            ]
                        },
                        "PickUpLocation": {
                            "$id": "#/properties/VehAvailRQCore/properties/VehRentalCore/properties/PickUpLocation",
                            "type": "object",
                            "title": "The PickUpLocation schema",
                            "description": "An explanation about the purpose of this instance.",
                            "default": {},
                            "examples": [
                                {
                                    "LocationCode": "MIAA01"
                                }
                            ],
                            "required": [
                                "LocationCode"
                            ],
                            "properties": {
                                "LocationCode": {
                                    "$id": "#/properties/VehAvailRQCore/properties/VehRentalCore/properties/PickUpLocation/properties/LocationCode",
                                    "type": "string",
                                    "title": "The LocationCode schema",
                                    "description": "An explanation about the purpose of this instance.",
                                    "default": "",
                                    "examples": [
                                        "MIAA01"
                                    ]
                                }
                            },
                            "additionalProperties": true
                        },
                        "ReturnLocation": {
                            "$id": "#/properties/VehAvailRQCore/properties/VehRentalCore/properties/ReturnLocation",
                            "type": "object",
                            "title": "The ReturnLocation schema",
                            "description": "An explanation about the purpose of this instance.",
                            "default": {},
                            "examples": [
                                {
                                    "LocationCode": "MIAA01"
                                }
                            ],
                            "required": [
                                "LocationCode"
                            ],
                            "properties": {
                                "LocationCode": {
                                    "$id": "#/properties/VehAvailRQCore/properties/VehRentalCore/properties/ReturnLocation/properties/LocationCode",
                                    "type": "string",
                                    "title": "The LocationCode schema",
                                    "description": "An explanation about the purpose of this instance.",
                                    "default": "",
                                    "examples": [
                                        "MIAA01"
                                    ]
                                }
                            },
                            "additionalProperties": true
                        }
                    },
                    "additionalProperties": true
                }
            },
            "additionalProperties": true
        },
        "VehAvailRQInfo": {
            "default": {},
            "description": "An explanation about the purpose of this instance.",
            "examples": [
                {
                    "Customer": {
                        "Primary": {
                            "DriverType": {
                                "Age": ""
                            },
                            "CitizenCountryName": {
                                "Code": ""
                            }
                        }
                    }
                }
            ],
            "title": "The VehAvailRQInfo schema",
            "properties": {
                "Customer": {
                    "$id": "#/properties/VehAvailRQInfo/properties/Customer",
                    "type": "object",
                    "title": "The Customer schema",
                    "description": "An explanation about the purpose of this instance.",
                    "default": {},
                    "examples": [
                        {
                            "Primary": {
                                "DriverType": {
                                    "Age": ""
                                },
                                "CitizenCountryName": {
                                    "Code": ""
                                }
                            }
                        }
                    ],
                    "required": [
                        "Primary"
                    ],
                    "properties": {
                        "Primary": {
                            "$id": "#/properties/VehAvailRQInfo/properties/Customer/properties/Primary",
                            "type": "object",
                            "title": "The Primary schema",
                            "description": "An explanation about the purpose of this instance.",
                            "default": {},
                            "examples": [
                                {
                                    "DriverType": {
                                        "Age": ""
                                    },
                                    "CitizenCountryName": {
                                        "Code": ""
                                    }
                                }
                            ],
                            "required": [
                                "DriverType",
                                "CitizenCountryName"
                            ],
                            "properties": {
                                "DriverType": {
                                    "$id": "#/properties/VehAvailRQInfo/properties/Customer/properties/Primary/properties/DriverType",
                                    "type": "object",
                                    "title": "The DriverType schema",
                                    "description": "An explanation about the purpose of this instance.",
                                    "default": {},
                                    "examples": [
                                        {
                                            "Age": ""
                                        }
                                    ],
                                    "required": [
                                        "Age"
                                    ],
                                    "properties": {
                                        "Age": {
                                            "$id": "#/properties/VehAvailRQInfo/properties/Customer/properties/Primary/properties/DriverType/properties/Age",
                                            "type": "string",
                                            "title": "The Age schema",
                                            "description": "An explanation about the purpose of this instance.",
                                            "default": "",
                                            "examples": [
                                                ""
                                            ]
                                        }
                                    },
                                    "additionalProperties": true
                                },
                                "CitizenCountryName": {
                                    "$id": "#/properties/VehAvailRQInfo/properties/Customer/properties/Primary/properties/CitizenCountryName",
                                    "type": "object",
                                    "title": "The CitizenCountryName schema",
                                    "description": "An explanation about the purpose of this instance.",
                                    "default": {},
                                    "examples": [
                                        {
                                            "Code": ""
                                        }
                                    ],
                                    "required": [
                                        "Code"
                                    ],
                                    "properties": {
                                        "Code": {
                                            "$id": "#/properties/VehAvailRQInfo/properties/Customer/properties/Primary/properties/CitizenCountryName/properties/Code",
                                            "type": "string",
                                            "title": "The Code schema",
                                            "description": "An explanation about the purpose of this instance.",
                                            "default": "",
                                            "examples": [
                                                ""
                                            ]
                                        }
                                    },
                                    "additionalProperties": true
                                }
                            },
                            "additionalProperties": true
                        }
                    },
                    "additionalProperties": true
                }
            },
            "additionalProperties": true
        }
    },
    "additionalProperties": true
}

const SUPORTED_CLIENT_SERVICES = new Map();
SUPORTED_CLIENT_SERVICES.set(1, (body: any) => RightCarsSearchUtils(body))
SUPORTED_CLIENT_SERVICES.set(11, (body: any) => RentitCarsSearchUtil(body))
SUPORTED_CLIENT_SERVICES.set(37, (body: any) => SurpriceCarsSearchUtil(body))


export const searchCars = async (body: any, req: any) => {
    const validator = validateFor(schema)
    validator(body)

    const { CONTEXT, POS } = body
    const clientId = body.POS.Source.RequestorID.ID.replace('GRC-', "").slice(0, -4)

    try {
        const [grcgdsClient, searchServices, brokerOwners,/*suppliers, dataUsers*/] = await Promise.all([
            getGrcgdsClient({ ClientId: clientId }),
            GetSearchServices(clientId),
            getBrokersOwners({ RequestorID: clientId })
            //getDataSuppliers({ RequestorID: clientId }),
            //getDataUsersForUserId({ id: clientId }),
        ])

    const servicesToCall = []

        if (grcgdsClient) {
            if (grcgdsClient.integrationEndpointUrl && SUPORTED_URL.has(grcgdsClient.integrationEndpointUrl)) {
                servicesToCall.push(SUPORTED_URL.get(grcgdsClient.integrationEndpointUrl)(body))
            } else {
                const servicesToAdd = Array.from(SUPORTED_CLIENT_SERVICES.entries())
                .filter(entry => brokerOwners.find(brokerOwner => brokerOwner.id == entry[0]))
                .map(entry => entry[1]);
                servicesToCall.push(...servicesToAdd.map(service => service(body)))
            }
        }

        const sorted = await sortClientsBySearch({ clients: searchServices, searchType: SearchHistoryEnum.Availability })
        servicesToCall.push(...GetSerchForClients(sorted.map(s => s.clientId)).map(f => f(body)))

        const [ fromGrcgds, ...r ] = await allSettled(servicesToCall)
        .then((promises: any) => {
            return promises.filter((p: any) => p.status == "fulfilled")
        })
        .then((promises: any) => promises.map((p: any) => p.value))

        if (sorted[0]?.id) await increaseCounterFor({ clientId: sorted[0].id, searchType: SearchHistoryEnum.Availability })

        let filteredResponse = fromGrcgds
        filteredResponse = fromGrcgds
            .filter((r: any) => {
                if (!CONTEXT || !CONTEXT?.Filter || !CONTEXT?.Filter?.content || CONTEXT?.Filter?.content == "") return true
                const id = r.VehAvailCore[0].$.Supplier_ID
                const idsToSearch = CONTEXT?.Filter?.content?.split(",")
                return idsToSearch && idsToSearch.length != 0 ? idsToSearch.includes(id) : true
            })
        const filterBrands = await FilterBrandsForClient(body.POS.Source.RequestorID.ID)
        filteredResponse = filteredResponse.concat(...r)
            .filter(filterBrands)

        const response = wrapCarsResponseIntoXml(filteredResponse, body)

        return [
            response,
            200,
            "OTA_VehAvailRateRS",
            { "xsi:schemaLocation": "http://www.opentravel.org/OTA/2003/05 OTA_VehAvailRateRS.xsd" }
        ]
    } catch (error) {
        if (error.response) {
            console.log(error.response.data)
            throw new ApiError(error.response.data.error)
        } else {
            throw error
        }
    }
}
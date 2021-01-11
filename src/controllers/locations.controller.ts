import { getAllLocations, getGrcgdsLocations, getLocationsByClient, mergeSupplierLocations, whereFilter } from '../services/locations.service';
import { getBrokersOwners, getDataSuppliers, getGrcgdsClient, SUPORTED_URL } from '../services/requestor.service';
import { increaseCounterFor, sortClientsBySearch } from '../services/searchHistory.service';
import { ApiError } from '../utils/ApiError';
import { GetSearchServices } from '../utils/GetSearchServices';
import { validateFor } from '../utils/JsonValidator';
import { logger } from '../utils/Logger';
import { SearchHistoryEnum } from '../utils/SearchHistoryEnum';

const schema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "http://example.com/example.json",
    "type": "object",
    "title": "The root schema",
    "description": "The root schema comprises the entire JSON document.",
    "default": {},
    "examples": [
        {
            "VehLocSearchCriterion": {
                "Address": {
                    "CountryName": {
                        "Code": ""
                    }
                }
            }
        }
    ],
    "required": [
        "VehLocSearchCriterion"
    ],
    "properties": {
        "VehLocSearchCriterion": {
            "default": {},
            "description": "An explanation about the purpose of this instance.",
            "examples": [
                {
                    "Address": {
                        "CountryName": {
                            "Code": ""
                        }
                    }
                }
            ],
            "title": "The VehLocSearchCriterion schema",
            "properties": {
                "Address": {
                    "default": {},
                    "description": "An explanation about the purpose of this instance.",
                    "examples": [
                        {
                            "CountryName": {
                                "Code": ""
                            }
                        }
                    ],
                    "title": "The Address schema",
                    "properties": {
                        "CountryName": {
                            "default": {},
                            "description": "An explanation about the purpose of this instance.",
                            "examples": [
                                {
                                    "Code": ""
                                }
                            ],
                            "title": "The CountryName schema",
                            "properties": {
                                "Code": {
                                    "$id": "#/properties/VehLocSearchCriterion/properties/Address/properties/CountryName/properties/Code",
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


export const getLocations = async (body: any) => {
    const validator = validateFor(schema)
    validator(body)
    const { POS, VehLocSearchCriterion: { CONTEXT, Address } } = body;

    const whereFilters: whereFilter[] = []
    const orWhereFilters: whereFilter[] = []
    if (Address && Address.CountryName && Address.CountryName.Code) {
        whereFilters.push({ 'columnName': `companies_locations.country`, op: 'like', val: `%${Address.CountryName.Code}%` });
    }

    if (Address && Address.CityName && Address.CityName.Code) {
        whereFilters.push({ 'columnName': `companies_locations.GRCGDSlocatincode`, op: 'like', val: `%${Address.CityName.Code}%` });
        orWhereFilters.push({ 'columnName': `companies_locations.location`, op: 'like', val: `%${Address.CityName.Code}%` });
    }

    const suppliersId = []
    if (CONTEXT && CONTEXT?.Filter?.content) {
        suppliersId.push(CONTEXT.Filter.content.replace("GRC-", "").slice(0, -4));
    }

    let r: any[] = []
    if (!POS.Source.RequestorID.All || POS.Source.RequestorID.All != "Yes") {
        const ClientId = POS.Source.RequestorID.ID.replace('GRC-', "").slice(0, -4);
        const grcgdsClient = await getGrcgdsClient({ ClientId })

        const clientsToCall = []
        let secondResult = []

        if (grcgdsClient && grcgdsClient.integrationEndpointUrl && SUPORTED_URL.has(grcgdsClient.integrationEndpointUrl)) {
            clientsToCall.push(grcgdsClient.id)
        } else {
            const [requestorDataSuppliers, ownersOfCurrentBroker] = await Promise.all([
                getDataSuppliers({ RequestorID: ClientId }),
                getBrokersOwners({ RequestorID: ClientId }),
            ])
    
            if (requestorDataSuppliers.length == 0 && ownersOfCurrentBroker.length == 0) {
                throw new ApiError("No suppliers have been setup.")
            }           
            
            clientsToCall.push(...requestorDataSuppliers.map(r => r.clientId))

            if (ownersOfCurrentBroker.length != 0) {
                const orderedSuppliers = await sortClientsBySearch({ clients: ownersOfCurrentBroker, searchType: SearchHistoryEnum.Locations })
                for (const record of orderedSuppliers) {
                    const results = await getLocationsByClient({ whereFilters, clientId: [record.id] })
                    if (results.length == 0) continue;
                    secondResult = results
                    await increaseCounterFor({ clientId: record.id, searchType: SearchHistoryEnum.Locations })
                    break;
                }
            }
        }

        logger.info(`Getting services from clients ${clientsToCall.join(",")}`)
        const firstResult = await getLocationsByClient({ whereFilters, clientId: clientsToCall })

        r = mergeSupplierLocations([firstResult, secondResult])
    } else {
        r = await getGrcgdsLocations({
            whereFilters: [{ 'columnName': `grcgds_locations.internalcode`, op: 'like', val: `%${Address.CityName.Code}%` }],
            orWhereFilters: [{ 'columnName': `grcgds_locations.locationname`, op: 'like', val: `%${Address.CityName.Code}%` }]
        });
    }

    return [
        { VehMatchedLocs: { VehMatchedLoc: { LocationDetail: r || [] } } },
        200,
        "OTA_CountryListRS",
        { "xsi:schemaLocation": "http://www.opentravel.org/OTA/2003/05 OTA_CountryListRS.xsd" }
    ]
}
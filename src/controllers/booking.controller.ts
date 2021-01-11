import { DB } from '../utils/DB';
import { validateFor } from '../utils/JsonValidator';
import axios from "axios"
import { ApiError } from '../utils/ApiError';
import { xmlToJson } from '../utils/XmlConfig';
import RightCarsBooking, { cancelRightCarsBooking } from '../carsBookingUtils/RightCarsBooking';
import GrcgdsXmlBooking, { cancelGrcBooking } from '../carsBookingUtils/GrcgdsXmlBooking';
import { cancelBookingByResNumber, createBookingsXmlResponse, getBookings } from '../services/bookings.service';
import { isGrcgdsLocations } from '../services/locations.service';
import DiscoverCarsBooking from '../carsBookingUtils/DiscoverCarsBooking';
import { logger } from '../utils/Logger';
const allSettled = require('promise.allsettled');

const schema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "OTA_VehResRQReq",
    "type": "object",
    "title": "The root schema",
    "description": "The root schema comprises the entire JSON document.",
    "default": {},
    "examples": [
        {
            "xmlns": "http://www.opentravel.org/OTA/2003/05",
            "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
            "xsi:schemaLocation": "http://www.opentravel.org/OTA/2003/05 VehResRQ.xsd",
            "POS": {
                "Source": {
                    "RequestorID": {
                        "Type": "5",
                        "ID": "GRC-300000",
                        "RATEID": "GRC-880001"
                    }
                }
            },
            "VehResRQCore": {
                "VehRentalCore": {
                    "PickUpDateTime": "2020-11-20T12:00:00",
                    "ReturnDateTime": "2020-11-18T10:00:00",
                    "PickUpLocation": {
                        "LocationCode": "LWNA01"
                    },
                    "ReturnLocation": {
                        "LocationCode": "LWNA01"
                    }
                },
                "Customer": {
                    "Primary": {
                        "PersonName": {
                            "NamePrefix": "Sr",
                            "GivenName": "Rick",
                            "Surname": "Little"
                        },
                        "Telephone": {
                            "PhoneNumber": "+1 8006471058"
                        },
                        "Email": "test25@test.com",
                        "Address": {
                            "StreetNmbr": "",
                            "CityName": "",
                            "PostalCode": ""
                        },
                        "CustLoyalty": {
                            "ProgramID": "",
                            "MembershipID": ""
                        }
                    }
                },
                "VendorPref": "",
                "VehPref": {
                    "SearchId": "",
                    "Code": "SWMR-8-23412",
                    "Acriss": "SWMR",
                    "price": ""
                },
                "SpecialEquipPrefs": {
                    "SpecialEquipPref": [
                        {
                            "vendorEquipID": "BSIT",
                            "Quantity": "2"
                        },
                        {
                            "vendorEquipID": "GPS",
                            "Quantity": "1"
                        }
                    ]
                },
                "PromoDesc": ""
            },
            "VehResRQInfo": "",
            "ArrivalDetails": {
                "FlightNo": "IB3154"
            },
            "RentalPaymentPref": {
                "Voucher": {
                    "Identifier": "5464srsdrdasu1",
                    "PaymentCard": {
                        "CardType": "Paypal",
                        "CardCode": "",
                        "CardNumber": "1111111111111111111111111",
                        "ExpireDate": "MM/YY",
                        "CardHolderName": "",
                        "AmountPaid": "",
                        "CurrencyUsed": ""
                    }
                }
            },
            "CONTEXT": {
                "Filter": {
                    "content": "SupplierAccountnumber",
                    "Language": "EN",
                    "contactless": "Yes"
                }
            }
        }
    ],
    "required": [
        "xmlns",
        "xmlns:xsi",
        "xsi:schemaLocation",
        "POS",
        "VehResRQCore",
        "VehResRQInfo",
        "ArrivalDetails",
        "RentalPaymentPref",
        "CONTEXT"
    ],
    "properties": {
        "xmlns": {
            "$id": "#/properties/xmlns",
            "type": "string",
            "title": "The xmlns schema",
            "description": "An explanation about the purpose of this instance.",
            "default": "",
            "examples": [
                "http://www.opentravel.org/OTA/2003/05"
            ]
        },
        "xmlns:xsi": {
            "$id": "#/properties/xmlns%3Axsi",
            "type": "string",
            "title": "The xmlns:xsi schema",
            "description": "An explanation about the purpose of this instance.",
            "default": "",
            "examples": [
                "http://www.w3.org/2001/XMLSchema-instance"
            ]
        },
        "xsi:schemaLocation": {
            "$id": "#/properties/xsi%3AschemaLocation",
            "type": "string",
            "title": "The xsi:schemaLocation schema",
            "description": "An explanation about the purpose of this instance.",
            "default": "",
            "examples": [
                "http://www.opentravel.org/OTA/2003/05 VehResRQ.xsd"
            ]
        },
        "POS": {
            "$id": "#/properties/POS",
            "type": "object",
            "title": "The POS schema",
            "description": "An explanation about the purpose of this instance.",
            "default": {},
            "examples": [
                {
                    "Source": {
                        "RequestorID": {
                            "Type": "5",
                            "ID": "GRC-300000",
                            "RATEID": "GRC-880001"
                        }
                    }
                }
            ],
            "required": [
                "Source"
            ],
            "properties": {
                "Source": {
                    "$id": "#/properties/POS/properties/Source",
                    "type": "object",
                    "title": "The Source schema",
                    "description": "An explanation about the purpose of this instance.",
                    "default": {},
                    "examples": [
                        {
                            "RequestorID": {
                                "Type": "5",
                                "ID": "GRC-300000",
                                "RATEID": "GRC-880001"
                            }
                        }
                    ],
                    "required": [
                        "RequestorID"
                    ],
                    "properties": {
                        "RequestorID": {
                            "$id": "#/properties/POS/properties/Source/properties/RequestorID",
                            "type": "object",
                            "title": "The RequestorID schema",
                            "description": "An explanation about the purpose of this instance.",
                            "default": {},
                            "examples": [
                                {
                                    "Type": "5",
                                    "ID": "GRC-300000",
                                    "RATEID": "GRC-880001"
                                }
                            ],
                            "required": [
                                "Type",
                                "ID",
                                "RATEID"
                            ],
                            "properties": {
                                "Type": {
                                    "$id": "#/properties/POS/properties/Source/properties/RequestorID/properties/Type",
                                    "type": "string",
                                    "title": "The Type schema",
                                    "description": "An explanation about the purpose of this instance.",
                                    "default": "",
                                    "examples": [
                                        "5"
                                    ]
                                },
                                "ID": {
                                    "$id": "#/properties/POS/properties/Source/properties/RequestorID/properties/ID",
                                    "type": "string",
                                    "title": "The ID schema",
                                    "description": "An explanation about the purpose of this instance.",
                                    "default": "",
                                    "examples": [
                                        "GRC-300000"
                                    ]
                                },
                                "RATEID": {
                                    "$id": "#/properties/POS/properties/Source/properties/RequestorID/properties/RATEID",
                                    "type": "string",
                                    "title": "The RATEID schema",
                                    "description": "An explanation about the purpose of this instance.",
                                    "default": "",
                                    "examples": [
                                        "GRC-880001"
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
        "VehResRQCore": {
            "$id": "#/properties/VehResRQCore",
            "type": "object",
            "title": "The VehResRQCore schema",
            "description": "An explanation about the purpose of this instance.",
            "default": {},
            "examples": [
                {
                    "VehRentalCore": {
                        "PickUpDateTime": "2020-11-20T12:00:00",
                        "ReturnDateTime": "2020-11-18T10:00:00",
                        "PickUpLocation": {
                            "LocationCode": "LWNA01"
                        },
                        "ReturnLocation": {
                            "LocationCode": "LWNA01"
                        }
                    },
                    "Customer": {
                        "Primary": {
                            "PersonName": {
                                "NamePrefix": "Sr",
                                "GivenName": "Rick",
                                "Surname": "Little"
                            },
                            "Telephone": {
                                "PhoneNumber": "+1 8006471058"
                            },
                            "Email": "test25@test.com",
                            "Address": {
                                "StreetNmbr": "",
                                "CityName": "",
                                "PostalCode": ""
                            },
                            "CustLoyalty": {
                                "ProgramID": "",
                                "MembershipID": ""
                            }
                        }
                    },
                    "VendorPref": "",
                    "VehPref": {
                        "SearchId": "",
                        "Code": "SWMR-8-23412",
                        "Acriss": "SWMR",
                        "price": ""
                    },
                    "SpecialEquipPrefs": {
                        "SpecialEquipPref": [
                            {
                                "vendorEquipID": "BSIT",
                                "Quantity": "2"
                            },
                            {
                                "vendorEquipID": "GPS",
                                "Quantity": "1"
                            }
                        ]
                    },
                    "PromoDesc": ""
                }
            ],
            "required": [
                "VehRentalCore",
                "Customer",
                "VendorPref",
                "VehPref",
                "SpecialEquipPrefs",
                "PromoDesc"
            ],
            "properties": {
                "VehRentalCore": {
                    "$id": "#/properties/VehResRQCore/properties/VehRentalCore",
                    "type": "object",
                    "title": "The VehRentalCore schema",
                    "description": "An explanation about the purpose of this instance.",
                    "default": {},
                    "examples": [
                        {
                            "PickUpDateTime": "2020-11-20T12:00:00",
                            "ReturnDateTime": "2020-11-18T10:00:00",
                            "PickUpLocation": {
                                "LocationCode": "LWNA01"
                            },
                            "ReturnLocation": {
                                "LocationCode": "LWNA01"
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
                            "$id": "#/properties/VehResRQCore/properties/VehRentalCore/properties/PickUpDateTime",
                            "type": "string",
                            "title": "The PickUpDateTime schema",
                            "description": "An explanation about the purpose of this instance.",
                            "default": "",
                            "examples": [
                                "2020-11-20T12:00:00"
                            ]
                        },
                        "ReturnDateTime": {
                            "$id": "#/properties/VehResRQCore/properties/VehRentalCore/properties/ReturnDateTime",
                            "type": "string",
                            "title": "The ReturnDateTime schema",
                            "description": "An explanation about the purpose of this instance.",
                            "default": "",
                            "examples": [
                                "2020-11-18T10:00:00"
                            ]
                        },
                        "PickUpLocation": {
                            "$id": "#/properties/VehResRQCore/properties/VehRentalCore/properties/PickUpLocation",
                            "type": "object",
                            "title": "The PickUpLocation schema",
                            "description": "An explanation about the purpose of this instance.",
                            "default": {},
                            "examples": [
                                {
                                    "LocationCode": "LWNA01"
                                }
                            ],
                            "required": [
                                "LocationCode"
                            ],
                            "properties": {
                                "LocationCode": {
                                    "$id": "#/properties/VehResRQCore/properties/VehRentalCore/properties/PickUpLocation/properties/LocationCode",
                                    "type": "string",
                                    "title": "The LocationCode schema",
                                    "description": "An explanation about the purpose of this instance.",
                                    "default": "",
                                    "examples": [
                                        "LWNA01"
                                    ]
                                }
                            },
                            "additionalProperties": true
                        },
                        "ReturnLocation": {
                            "$id": "#/properties/VehResRQCore/properties/VehRentalCore/properties/ReturnLocation",
                            "type": "object",
                            "title": "The ReturnLocation schema",
                            "description": "An explanation about the purpose of this instance.",
                            "default": {},
                            "examples": [
                                {
                                    "LocationCode": "LWNA01"
                                }
                            ],
                            "required": [
                                "LocationCode"
                            ],
                            "properties": {
                                "LocationCode": {
                                    "$id": "#/properties/VehResRQCore/properties/VehRentalCore/properties/ReturnLocation/properties/LocationCode",
                                    "type": "string",
                                    "title": "The LocationCode schema",
                                    "description": "An explanation about the purpose of this instance.",
                                    "default": "",
                                    "examples": [
                                        "LWNA01"
                                    ]
                                }
                            },
                            "additionalProperties": true
                        }
                    },
                    "additionalProperties": true
                },
                "Customer": {
                    "$id": "#/properties/VehResRQCore/properties/Customer",
                    "type": "object",
                    "title": "The Customer schema",
                    "description": "An explanation about the purpose of this instance.",
                    "default": {},
                    "examples": [
                        {
                            "Primary": {
                                "PersonName": {
                                    "NamePrefix": "Sr",
                                    "GivenName": "Rick",
                                    "Surname": "Little"
                                },
                                "Telephone": {
                                    "PhoneNumber": "+1 8006471058"
                                },
                                "Email": "test25@test.com",
                                "Address": {
                                    "StreetNmbr": "",
                                    "CityName": "",
                                    "PostalCode": ""
                                },
                                "CustLoyalty": {
                                    "ProgramID": "",
                                    "MembershipID": ""
                                }
                            }
                        }
                    ],
                    "required": [
                        "Primary"
                    ],
                    "properties": {
                        "Primary": {
                            "$id": "#/properties/VehResRQCore/properties/Customer/properties/Primary",
                            "type": "object",
                            "title": "The Primary schema",
                            "description": "An explanation about the purpose of this instance.",
                            "default": {},
                            "examples": [
                                {
                                    "PersonName": {
                                        "NamePrefix": "Sr",
                                        "GivenName": "Rick",
                                        "Surname": "Little"
                                    },
                                    "Telephone": {
                                        "PhoneNumber": "+1 8006471058"
                                    },
                                    "Email": "test25@test.com",
                                    "Address": {
                                        "StreetNmbr": "",
                                        "CityName": "",
                                        "PostalCode": ""
                                    },
                                    "CustLoyalty": {
                                        "ProgramID": "",
                                        "MembershipID": ""
                                    }
                                }
                            ],
                            "required": [
                                "PersonName",
                                "Telephone",
                                "Email",
                                "Address",
                                "CustLoyalty"
                            ],
                            "properties": {
                                "PersonName": {
                                    "$id": "#/properties/VehResRQCore/properties/Customer/properties/Primary/properties/PersonName",
                                    "type": "object",
                                    "title": "The PersonName schema",
                                    "description": "An explanation about the purpose of this instance.",
                                    "default": {},
                                    "examples": [
                                        {
                                            "NamePrefix": "Sr",
                                            "GivenName": "Rick",
                                            "Surname": "Little"
                                        }
                                    ],
                                    "required": [
                                        "NamePrefix",
                                        "GivenName",
                                        "Surname"
                                    ],
                                    "properties": {
                                        "NamePrefix": {
                                            "$id": "#/properties/VehResRQCore/properties/Customer/properties/Primary/properties/PersonName/properties/NamePrefix",
                                            "type": "string",
                                            "title": "The NamePrefix schema",
                                            "description": "An explanation about the purpose of this instance.",
                                            "default": "",
                                            "examples": [
                                                "Sr"
                                            ]
                                        },
                                        "GivenName": {
                                            "$id": "#/properties/VehResRQCore/properties/Customer/properties/Primary/properties/PersonName/properties/GivenName",
                                            "type": "string",
                                            "title": "The GivenName schema",
                                            "description": "An explanation about the purpose of this instance.",
                                            "default": "",
                                            "examples": [
                                                "Rick"
                                            ]
                                        },
                                        "Surname": {
                                            "$id": "#/properties/VehResRQCore/properties/Customer/properties/Primary/properties/PersonName/properties/Surname",
                                            "type": "string",
                                            "title": "The Surname schema",
                                            "description": "An explanation about the purpose of this instance.",
                                            "default": "",
                                            "examples": [
                                                "Little"
                                            ]
                                        }
                                    },
                                    "additionalProperties": true
                                },
                                "Telephone": {
                                    "$id": "#/properties/VehResRQCore/properties/Customer/properties/Primary/properties/Telephone",
                                    "type": "object",
                                    "title": "The Telephone schema",
                                    "description": "An explanation about the purpose of this instance.",
                                    "default": {},
                                    "examples": [
                                        {
                                            "PhoneNumber": "+1 8006471058"
                                        }
                                    ],
                                    "required": [
                                        "PhoneNumber"
                                    ],
                                    "properties": {
                                        "PhoneNumber": {
                                            "$id": "#/properties/VehResRQCore/properties/Customer/properties/Primary/properties/Telephone/properties/PhoneNumber",
                                            "type": "string",
                                            "title": "The PhoneNumber schema",
                                            "description": "An explanation about the purpose of this instance.",
                                            "default": "",
                                            "examples": [
                                                "+1 8006471058"
                                            ]
                                        }
                                    },
                                    "additionalProperties": true
                                },
                                "Email": {
                                    "$id": "#/properties/VehResRQCore/properties/Customer/properties/Primary/properties/Email",
                                    "type": "string",
                                    "title": "The Email schema",
                                    "description": "An explanation about the purpose of this instance.",
                                    "default": "",
                                    "examples": [
                                        "test25@test.com"
                                    ]
                                },
                                "Address": {
                                    "$id": "#/properties/VehResRQCore/properties/Customer/properties/Primary/properties/Address",
                                    "type": "object",
                                    "title": "The Address schema",
                                    "description": "An explanation about the purpose of this instance.",
                                    "default": {},
                                    "examples": [
                                        {
                                            "StreetNmbr": "",
                                            "CityName": "",
                                            "PostalCode": ""
                                        }
                                    ],
                                    "required": [
                                        "StreetNmbr",
                                        "CityName",
                                        "PostalCode"
                                    ],
                                    "properties": {
                                        "StreetNmbr": {
                                            "$id": "#/properties/VehResRQCore/properties/Customer/properties/Primary/properties/Address/properties/StreetNmbr",
                                            "type": "string",
                                            "title": "The StreetNmbr schema",
                                            "description": "An explanation about the purpose of this instance.",
                                            "default": "",
                                            "examples": [
                                                ""
                                            ]
                                        },
                                        "CityName": {
                                            "$id": "#/properties/VehResRQCore/properties/Customer/properties/Primary/properties/Address/properties/CityName",
                                            "type": "string",
                                            "title": "The CityName schema",
                                            "description": "An explanation about the purpose of this instance.",
                                            "default": "",
                                            "examples": [
                                                ""
                                            ]
                                        },
                                        "PostalCode": {
                                            "$id": "#/properties/VehResRQCore/properties/Customer/properties/Primary/properties/Address/properties/PostalCode",
                                            "type": "string",
                                            "title": "The PostalCode schema",
                                            "description": "An explanation about the purpose of this instance.",
                                            "default": "",
                                            "examples": [
                                                ""
                                            ]
                                        }
                                    },
                                    "additionalProperties": true
                                },
                                "CustLoyalty": {
                                    "$id": "#/properties/VehResRQCore/properties/Customer/properties/Primary/properties/CustLoyalty",
                                    "type": "object",
                                    "title": "The CustLoyalty schema",
                                    "description": "An explanation about the purpose of this instance.",
                                    "default": {},
                                    "examples": [
                                        {
                                            "ProgramID": "",
                                            "MembershipID": ""
                                        }
                                    ],
                                    "required": [
                                        "ProgramID",
                                        "MembershipID"
                                    ],
                                    "properties": {
                                        "ProgramID": {
                                            "$id": "#/properties/VehResRQCore/properties/Customer/properties/Primary/properties/CustLoyalty/properties/ProgramID",
                                            "type": "string",
                                            "title": "The ProgramID schema",
                                            "description": "An explanation about the purpose of this instance.",
                                            "default": "",
                                            "examples": [
                                                ""
                                            ]
                                        },
                                        "MembershipID": {
                                            "$id": "#/properties/VehResRQCore/properties/Customer/properties/Primary/properties/CustLoyalty/properties/MembershipID",
                                            "type": "string",
                                            "title": "The MembershipID schema",
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
                },
                "VendorPref": {
                    "$id": "#/properties/VehResRQCore/properties/VendorPref",
                    "type": "string",
                    "title": "The VendorPref schema",
                    "description": "An explanation about the purpose of this instance.",
                    "default": "",
                    "examples": [
                        ""
                    ]
                },
                "VehPref": {
                    "$id": "#/properties/VehResRQCore/properties/VehPref",
                    "type": "object",
                    "title": "The VehPref schema",
                    "description": "An explanation about the purpose of this instance.",
                    "default": {},
                    "examples": [
                        {
                            "SearchId": "",
                            "Code": "SWMR-8-23412",
                            "Acriss": "SWMR",
                            "price": ""
                        }
                    ],
                    "required": [
                        "SearchId",
                        "Code",
                        "Acriss",
                        "price"
                    ],
                    "properties": {
                        "SearchId": {
                            "$id": "#/properties/VehResRQCore/properties/VehPref/properties/SearchId",
                            "type": "string",
                            "title": "The SearchId schema",
                            "description": "An explanation about the purpose of this instance.",
                            "default": "",
                            "examples": [
                                ""
                            ]
                        },
                        "Code": {
                            "$id": "#/properties/VehResRQCore/properties/VehPref/properties/Code",
                            "type": "string",
                            "title": "The Code schema",
                            "description": "An explanation about the purpose of this instance.",
                            "default": "",
                            "examples": [
                                "SWMR-8-23412"
                            ]
                        },
                        "Acriss": {
                            "$id": "#/properties/VehResRQCore/properties/VehPref/properties/Acriss",
                            "type": "string",
                            "title": "The Acriss schema",
                            "description": "An explanation about the purpose of this instance.",
                            "default": "",
                            "examples": [
                                "SWMR"
                            ]
                        },
                        "price": {
                            "$id": "#/properties/VehResRQCore/properties/VehPref/properties/price",
                            "type": "string",
                            "title": "The price schema",
                            "description": "An explanation about the purpose of this instance.",
                            "default": "",
                            "examples": [
                                ""
                            ]
                        }
                    },
                    "additionalProperties": true
                },
                "SpecialEquipPrefs": {
                    "$id": "#/properties/VehResRQCore/properties/SpecialEquipPrefs",
                    "type": "object",
                    "title": "The SpecialEquipPrefs schema",
                    "description": "An explanation about the purpose of this instance.",
                    "default": {},
                    "examples": [
                        {
                            "SpecialEquipPref": [
                                {
                                    "vendorEquipID": "BSIT",
                                    "Quantity": "2"
                                },
                                {
                                    "vendorEquipID": "GPS",
                                    "Quantity": "1"
                                }
                            ]
                        }
                    ],
                    "required": [
                        "SpecialEquipPref"
                    ],
                    "properties": {
                        "SpecialEquipPref": {
                            "$id": "#/properties/VehResRQCore/properties/SpecialEquipPrefs/properties/SpecialEquipPref",
                            "type": "array",
                            "title": "The SpecialEquipPref schema",
                            "description": "An explanation about the purpose of this instance.",
                            "default": [],
                            "examples": [
                                [
                                    {
                                        "vendorEquipID": "BSIT",
                                        "Quantity": "2"
                                    },
                                    {
                                        "vendorEquipID": "GPS",
                                        "Quantity": "1"
                                    }
                                ]
                            ],
                            "additionalItems": true,
                            "items": {
                                "$id": "#/properties/VehResRQCore/properties/SpecialEquipPrefs/properties/SpecialEquipPref/items",
                                "anyOf": [
                                    {
                                        "$id": "#/properties/VehResRQCore/properties/SpecialEquipPrefs/properties/SpecialEquipPref/items/anyOf/0",
                                        "type": "object",
                                        "title": "The first anyOf schema",
                                        "description": "An explanation about the purpose of this instance.",
                                        "default": {},
                                        "examples": [
                                            {
                                                "vendorEquipID": "BSIT",
                                                "Quantity": "2"
                                            }
                                        ],
                                        "required": [
                                            "vendorEquipID",
                                            "Quantity"
                                        ],
                                        "properties": {
                                            "vendorEquipID": {
                                                "$id": "#/properties/VehResRQCore/properties/SpecialEquipPrefs/properties/SpecialEquipPref/items/anyOf/0/properties/vendorEquipID",
                                                "type": "string",
                                                "title": "The vendorEquipID schema",
                                                "description": "An explanation about the purpose of this instance.",
                                                "default": "",
                                                "examples": [
                                                    "BSIT"
                                                ]
                                            },
                                            "Quantity": {
                                                "$id": "#/properties/VehResRQCore/properties/SpecialEquipPrefs/properties/SpecialEquipPref/items/anyOf/0/properties/Quantity",
                                                "type": "string",
                                                "title": "The Quantity schema",
                                                "description": "An explanation about the purpose of this instance.",
                                                "default": "",
                                                "examples": [
                                                    "2"
                                                ]
                                            }
                                        },
                                        "additionalProperties": true
                                    }
                                ]
                            }
                        }
                    },
                    "additionalProperties": true
                },
                "PromoDesc": {
                    "$id": "#/properties/VehResRQCore/properties/PromoDesc",
                    "type": "string",
                    "title": "The PromoDesc schema",
                    "description": "An explanation about the purpose of this instance.",
                    "default": "",
                    "examples": [
                        ""
                    ]
                }
            },
            "additionalProperties": true
        },
        "VehResRQInfo": {
            "$id": "#/properties/VehResRQInfo",
            "type": "string",
            "title": "The VehResRQInfo schema",
            "description": "An explanation about the purpose of this instance.",
            "default": "",
            "examples": [
                ""
            ]
        },
        "ArrivalDetails": {
            "$id": "#/properties/ArrivalDetails",
            "type": "object",
            "title": "The ArrivalDetails schema",
            "description": "An explanation about the purpose of this instance.",
            "default": {},
            "examples": [
                {
                    "FlightNo": "IB3154"
                }
            ],
            "required": [
                "FlightNo"
            ],
            "properties": {
                "FlightNo": {
                    "$id": "#/properties/ArrivalDetails/properties/FlightNo",
                    "type": "string",
                    "title": "The FlightNo schema",
                    "description": "An explanation about the purpose of this instance.",
                    "default": "",
                    "examples": [
                        "IB3154"
                    ]
                }
            },
            "additionalProperties": true
        },
        "RentalPaymentPref": {
            "$id": "#/properties/RentalPaymentPref",
            "type": "object",
            "title": "The RentalPaymentPref schema",
            "description": "An explanation about the purpose of this instance.",
            "default": {},
            "examples": [
                {
                    "Voucher": {
                        "Identifier": "5464srsdrdasu1",
                        "PaymentCard": {
                            "CardType": "Paypal",
                            "CardCode": "",
                            "CardNumber": "1111111111111111111111111",
                            "ExpireDate": "MM/YY",
                            "CardHolderName": "",
                            "AmountPaid": "",
                            "CurrencyUsed": ""
                        }
                    }
                }
            ],
            "required": [
                "Voucher"
            ],
            "properties": {
                "Voucher": {
                    "$id": "#/properties/RentalPaymentPref/properties/Voucher",
                    "type": "object",
                    "title": "The Voucher schema",
                    "description": "An explanation about the purpose of this instance.",
                    "default": {},
                    "examples": [
                        {
                            "Identifier": "5464srsdrdasu1",
                            "PaymentCard": {
                                "CardType": "Paypal",
                                "CardCode": "",
                                "CardNumber": "1111111111111111111111111",
                                "ExpireDate": "MM/YY",
                                "CardHolderName": "",
                                "AmountPaid": "",
                                "CurrencyUsed": ""
                            }
                        }
                    ],
                    "required": [
                        "Identifier",
                        "PaymentCard"
                    ],
                    "properties": {
                        "Identifier": {
                            "$id": "#/properties/RentalPaymentPref/properties/Voucher/properties/Identifier",
                            "type": "string",
                            "title": "The Identifier schema",
                            "description": "An explanation about the purpose of this instance.",
                            "default": "",
                            "examples": [
                                "5464srsdrdasu1"
                            ]
                        },
                        "PaymentCard": {
                            "$id": "#/properties/RentalPaymentPref/properties/Voucher/properties/PaymentCard",
                            "type": "object",
                            "title": "The PaymentCard schema",
                            "description": "An explanation about the purpose of this instance.",
                            "default": {},
                            "examples": [
                                {
                                    "CardType": "Paypal",
                                    "CardCode": "",
                                    "CardNumber": "1111111111111111111111111",
                                    "ExpireDate": "MM/YY",
                                    "CardHolderName": "",
                                    "AmountPaid": "",
                                    "CurrencyUsed": ""
                                }
                            ],
                            "required": [
                                "CardType",
                                "CardCode",
                                "CardNumber",
                                "ExpireDate",
                                "CardHolderName",
                                "AmountPaid",
                                "CurrencyUsed"
                            ],
                            "properties": {
                                "CardType": {
                                    "$id": "#/properties/RentalPaymentPref/properties/Voucher/properties/PaymentCard/properties/CardType",
                                    "type": "string",
                                    "title": "The CardType schema",
                                    "description": "An explanation about the purpose of this instance.",
                                    "default": "",
                                    "examples": [
                                        "Paypal"
                                    ]
                                },
                                "CardCode": {
                                    "$id": "#/properties/RentalPaymentPref/properties/Voucher/properties/PaymentCard/properties/CardCode",
                                    "type": "string",
                                    "title": "The CardCode schema",
                                    "description": "An explanation about the purpose of this instance.",
                                    "default": "",
                                    "examples": [
                                        ""
                                    ]
                                },
                                "CardNumber": {
                                    "$id": "#/properties/RentalPaymentPref/properties/Voucher/properties/PaymentCard/properties/CardNumber",
                                    "type": "string",
                                    "title": "The CardNumber schema",
                                    "description": "An explanation about the purpose of this instance.",
                                    "default": "",
                                    "examples": [
                                        "1111111111111111111111111"
                                    ]
                                },
                                "ExpireDate": {
                                    "$id": "#/properties/RentalPaymentPref/properties/Voucher/properties/PaymentCard/properties/ExpireDate",
                                    "type": "string",
                                    "title": "The ExpireDate schema",
                                    "description": "An explanation about the purpose of this instance.",
                                    "default": "",
                                    "examples": [
                                        "MM/YY"
                                    ]
                                },
                                "CardHolderName": {
                                    "$id": "#/properties/RentalPaymentPref/properties/Voucher/properties/PaymentCard/properties/CardHolderName",
                                    "type": "string",
                                    "title": "The CardHolderName schema",
                                    "description": "An explanation about the purpose of this instance.",
                                    "default": "",
                                    "examples": [
                                        ""
                                    ]
                                },
                                "AmountPaid": {
                                    "$id": "#/properties/RentalPaymentPref/properties/Voucher/properties/PaymentCard/properties/AmountPaid",
                                    "default": "",
                                    "description": "An explanation about the purpose of this instance.",
                                    "examples": [
                                        ""
                                    ],
                                    "title": "The AmountPaid schema",
                                    "minLength": 1,
                                    "type": "string"
                                },
                                "CurrencyUsed": {
                                    "$id": "#/properties/RentalPaymentPref/properties/Voucher/properties/PaymentCard/properties/CurrencyUsed",
                                    "default": "",
                                    "description": "An explanation about the purpose of this instance.",
                                    "examples": [
                                        ""
                                    ],
                                    "title": "The CurrencyUsed schema",
                                    "minLength": 1,
                                    "type": "string"
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
        "CONTEXT": {
            "$id": "#/properties/CONTEXT",
            "type": "object",
            "title": "The CONTEXT schema",
            "description": "An explanation about the purpose of this instance.",
            "default": {},
            "examples": [
                {
                    "Filter": {
                        "content": "SupplierAccountnumber",
                        "Language": "EN",
                        "contactless": "Yes"
                    }
                }
            ],
            "required": [
                "Filter"
            ],
            "properties": {
                "Filter": {
                    "$id": "#/properties/CONTEXT/properties/Filter",
                    "type": "object",
                    "title": "The Filter schema",
                    "description": "An explanation about the purpose of this instance.",
                    "default": {},
                    "examples": [
                        {
                            "content": "SupplierAccountnumber",
                            "Language": "EN",
                            "contactless": "Yes"
                        }
                    ],
                    "required": [
                        "content",
                        "Language",
                        "contactless"
                    ],
                    "properties": {
                        "content": {
                            "$id": "#/properties/CONTEXT/properties/Filter/properties/content",
                            "type": "string",
                            "title": "The content schema",
                            "description": "An explanation about the purpose of this instance.",
                            "default": "",
                            "examples": [
                                "SupplierAccountnumber"
                            ]
                        },
                        "Language": {
                            "$id": "#/properties/CONTEXT/properties/Filter/properties/Language",
                            "type": "string",
                            "title": "The Language schema",
                            "description": "An explanation about the purpose of this instance.",
                            "default": "",
                            "examples": [
                                "EN"
                            ]
                        },
                        "contactless": {
                            "$id": "#/properties/CONTEXT/properties/Filter/properties/contactless",
                            "type": "string",
                            "title": "The contactless schema",
                            "description": "An explanation about the purpose of this instance.",
                            "default": "",
                            "examples": [
                                "Yes"
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


export const createBooking = async (body: any) => {
    const validator = validateFor(schema)
    validator(body)
    const { CONTEXT, POS: { Source: { RequestorID } } } = body

    try {

        let json = ""

        if (CONTEXT.Filter.content == "GRC-170000") {
            json = await DiscoverCarsBooking(body)
        } else {
            json = await GrcgdsXmlBooking(body)
        }

        return [
            json,
            200,
            "OTA_VehAvailRateRS",
            { "xsi:schemaLocation": "http://www.opentravel.org/OTA/2003/05 OTA_VehAvailRateRS.xsd" }
        ]
    } catch (error) {
        if (error.response) {
            throw new ApiError(error.response.data.error)
        } else {
            throw error
        }
    }
}

export const searchBookings = async (body: any) => {
    //const validator = validateFor(schema)
    //validator(body)
    const { POS: { Source: { RequestorID } } } = body

    try {

        const xml = await createBookingsXmlResponse(await getBookings())
        const response = await xmlToJson(xml)

        logger.info("Sending OTA_VehRetResRQ response")
        return [
            response.OTA_VehRetResRS,
            200,
            "OTA_VehRetResRS",
            { "xsi:schemaLocation": "http://www.opentravel.org/OTA/2003/05 OTA_VehRetResRS.xsd" }
        ]
    } catch (error) {
        if (error.response) {
            throw new ApiError(error.response.data.error)
        } else {
            throw error
        }
    }
}

export const cancelBooking = async (body: any) => {
    //const validator = validateFor(schema)
    //validator(body)
    const { VehCancelRQCore, POS: { Source: { RequestorID } } } = body

    const supportedServices = [
        cancelGrcBooking
    ];

    try {

        let xml = null;

        await allSettled(supportedServices.map(s => s(body)))
            .then((promises: any) => {
                const successfullCalls = promises.filter((p: any) => p.status == "fulfilled")
                if (successfullCalls.length == 0) throw new ApiError("Could not cancell the booking")

                return cancelBookingByResNumber(VehCancelRQCore.ResNumber.Number)
            })
            .then(() => {
                xml = `<OTA_VehCancelRS xmlns="http://www.opentravel.org/OTA/2003/05" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opentravel.org/OTA/2003/05 OTA_VehCancelRS.xsd" Version="2.001">
                    <VehRetResRSCore>
                    <VehReservation>
                        <Status>Cancelled</Status>
                        <Resnumber>${VehCancelRQCore.ResNumber.Number}</Resnumber>
                    </VehReservation>
                    </VehRetResRSCore>
                </OTA_VehCancelRS>`
            })

        return [
            xml,
            200,
            "OTA_VehCancelRS",
            { "xsi:schemaLocation": "http://www.opentravel.org/OTA/2003/05 OTA_VehAvailRateRS.xsd" }
        ]

    } catch (error) {
        if (error.response) {
            throw new ApiError(error.response.data.error)
        } else {
            throw error
        }
    }
}
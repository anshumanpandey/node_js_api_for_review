export interface AvailabilityResponse {
    OTA_VehAvailRateRS: OtaVehAvailRateRs;
  }
  
  export interface OtaVehAvailRateRs {
    $: GeneratedType;
    Success: string[];
    VehAvailRSCore: VehAvailRscore[];
    VehVendorAvails: VehVendorAvail[];
  }
  
  export interface GeneratedType {
    xmlns: string;
    "xmlns:xsi": string;
    "xsi:schemaLocation": string;
    TimeStamp: string;
    Target: string;
    Version: string;
  }
  
  export interface VehAvailRscore {
    VehRentalCore: VehRentalCore[];
  }
  
  export interface VehRentalCore {
    $: GeneratedType2;
    PickUpLocation: PickUpLocation[];
    ReturnLocation: ReturnLocation[];
  }
  
  export interface GeneratedType2 {
    PickUpDateTime: string;
    ReturnDateTime: string;
  }
  
  export interface PickUpLocation {
    $: GeneratedType3;
  }
  
  export interface GeneratedType3 {
    LocationCode: string;
  }
  
  export interface ReturnLocation {
    $: GeneratedType4;
  }
  
  export interface GeneratedType4 {
    LocationCode: string;
  }
  
  export interface VehVendorAvail {
    VehVendorAvail: VehVendorAvail2[];
  }
  
  export interface VehVendorAvail2 {
    VehAvails: VehAvail[];
  }
  
  export interface VehAvail {
    VehAvail: VehAvail2[];
  }
  
  export interface VehAvail2 {
    VehAvailCore: VehAvailCore[];
  }
  
  export interface VehAvailCore {
    $: GeneratedType5;
    Vehicle: Vehicle[];
    RentalRate: RentalRate[];
    VehicleCharges?: VehicleCharge[];
    TotalCharge: TotalCharge[];
    PricedEquips: PricedEquip[];
    VehicleCharge?: VehicleCharge3;
  }
  
  export interface GeneratedType5 {
    Status?: string;
    VehID: string;
    Deeplink: string;
    Supplier_ID: string;
    Supplier_Name: string;
  }
  
  export interface Vehicle {
    $: GeneratedType6;
    VehMakeModel: VehMakeModel[];
    VehType: VehType[];
    VehClass: VehClass[];
    VehTerms: VehTerm[];
  }
  
  export interface GeneratedType6 {
    AirConditionInd: string;
    TransmissionType: string;
  }
  
  export interface VehMakeModel {
    $: GeneratedType7;
  }
  
  export interface GeneratedType7 {
    Name: string;
    PictureURL: string;
  }
  
  export interface VehType {
    $: GeneratedType8;
  }
  
  export interface GeneratedType8 {
    VehicleCategory: string;
    DoorCount: any;
    Baggage: any;
  }
  
  export interface VehClass {
    $: GeneratedType9;
  }
  
  export interface GeneratedType9 {
    Size: any;
  }
  
  export interface VehTerm {
    Included: Included[];
    NotIncluded: NotIncluded[];
  }
  
  export interface Included {
    $: GeneratedType10;
  }
  
  export interface GeneratedType10 {
    code: string;
    header: string;
    price: string;
    excess?: string;
    details?: string;
    mandatory?: string;
    limit?: string;
  }
  
  export interface NotIncluded {
    $: GeneratedType11;
  }
  
  export interface GeneratedType11 {
    code: string;
    mandatory: string;
    header: string;
    price: string;
    excess: string;
    limit: string;
    details?: string;
  }
  
  export interface RentalRate {
    RateDistance: RateDistance[];
    RateQualifier: RateQualifier[];
  }
  
  export interface RateDistance {
    $: GeneratedType12;
  }
  
  export interface GeneratedType12 {
    Unlimited: string;
    DistUnitName: string;
    VehiclePeriodName: string;
  }
  
  export interface RateQualifier {
    $: GeneratedType13;
  }
  
  export interface GeneratedType13 {
    RateCategory: string;
    RateQualifier: string;
    RatePeriod: string;
    VendorRateID: string;
  }
  
  export interface VehicleCharge {
    VehicleCharge: VehicleCharge2[];
  }
  
  export interface VehicleCharge2 {
    $: GeneratedType14;
    TaxAmounts: TaxAmount[];
    Calculation: Calculation[];
  }
  
  export interface GeneratedType14 {
    Amount: string;
    CurrencyCode: string;
    TaxInclusive: string;
    GuaranteedInd: string;
    Purpose: string;
  }
  
  export interface TaxAmount {
    TaxAmount: TaxAmount2[];
  }
  
  export interface TaxAmount2 {
    $: GeneratedType15;
  }
  
  export interface GeneratedType15 {
    Total: string;
    CurrencyCode: string;
    Percentage: string;
    Description: string;
  }
  
  export interface Calculation {
    $: GeneratedType16;
  }
  
  export interface GeneratedType16 {
    UnitCharge: string;
    UnitName: string;
    Quantity: string;
    taxInclusive: string;
  }
  
  export interface TotalCharge {
    $: GeneratedType17;
  }
  
  export interface GeneratedType17 {
    RateTotalAmount: string;
    CurrencyCode: string;
    taxInclusive?: string;
  }
  
  export interface PricedEquip {
    PricedEquip: PricedEquip2[];
  }
  
  export interface PricedEquip2 {
    Equipment: Equipment[];
    Charge: Charge[];
  }
  
  export interface Equipment {
    $: GeneratedType18;
  }
  
  export interface GeneratedType18 {
    Description: string;
    EquipType: string;
    vendorEquipID: string;
  }
  
  export interface Charge {
    Taxamounts: Taxamount[];
    Calculation: Calculation2[];
    Amount: string[];
    TaxInclusive: string[];
    IncludedRate: string[];
    IncludedInEstTotalInd: string[];
  }
  
  export interface Taxamount {
    Taxamount: Taxamount2[];
  }
  
  export interface Taxamount2 {
    Total: string[];
    CurrencyCode: string[];
    Percentage: string[];
  }
  
  export interface Calculation2 {
    UnitCharge: string[];
    UnitName: string[];
    Quantity: string[];
    TaxInclusive: string[];
  }
  
  export interface VehicleCharge3 {
    CurrencyCode: string;
  }
  
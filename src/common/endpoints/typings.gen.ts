/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface Accessories {
  /**  Id */
  _id: string

  /** Name */
  name: string

  /** Dealercode */
  dealerCode: string

  /** Description */
  description: string
  category: CodeDisplayName

  /** Partno */
  partNo: string

  /** Price */
  price: number

  /** Supplier */
  supplier: string
  installationMode: CodeDisplayName

  /** Compatiblemodels */
  compatibleModels: CodeDisplayName[]

  /** Images */
  images: AccessoryImage[]

  /** Residualvalueadder */
  residualValueAdder: number

  /** Vehicletype */
  vehicleType?: CodeDisplayName[]

  /**
   * Isactive
   * Status of each Accessory whether its active or not.
   */
  isActive: boolean

  /**
   * Createdat
   * @format date-time
   */
  createdAt: string

  /**
   * Updatedat
   * @format date-time
   */
  updatedAt: string
}

export interface AccessoryImage {
  /** Name */
  name: string

  /** Path */
  path: string
}

export interface AccessoryRequest {
  /** Description */
  description: string

  /** Name */
  name: string
  category: CodeDisplayName

  /** Partno */
  partNo: string

  /** Price */
  price: number

  /** Supplier */
  supplier: string
  installationMode: CodeDisplayName

  /** Compatiblemodels */
  compatibleModels: CodeDisplayName[]

  /** Residualvalueadder */
  residualValueAdder: number

  /**
   * Isactive
   * Status of each Accessory whether its active or not.
   */
  isActive: boolean
}

export interface AddNewDealerFee {
  /** Chargecode */
  chargeCode: string

  /** Chargedisplayname */
  chargeDisplayName: string

  /** State */
  state: CodeDisplayName[]

  /** Financialproduct */
  financialProduct: CodeDisplayName[]

  /** Defaultamount */
  defaultAmount: number

  /** Isactive */
  isActive: boolean

  /** Istaxable */
  isTaxable: boolean

  /** Tagname */
  tagName: string
}

export interface AddNewDealership {
  /** Name */
  name: string

  /** Dealercode */
  dealerCode: string

  /** Email */
  email: string

  /** Address */
  address: string

  /** City */
  city: string
  state: CodeDisplayName

  /** Zipcode */
  zipCode: string

  /** Contactno */
  contactNo: string

  /** Digitalretailenabled */
  digitalRetailEnabled: boolean

  /** Digitalretailwebsite */
  digitalRetailWebsite: string

  /** Isactive */
  isActive: boolean

  /** County */
  county: string
}

export interface AddOns {
  /** Item */
  item: string

  /** Price */
  price: number

  /** Rv */
  rv: number
}

/**
 * Represents an address (mailing, garaging) of a customer.
 * @example {"city":"LOS ANGELES","state":"CA","streetAddress":"2171 SHERINGHAM LANE","zipCode":"90077"}
 */
export interface Address {
  /**
   * State
   * Short code of a state (eg. 'CA')
   */
  state: string

  /**
   * Zipcode
   * 5-digit zip code
   */
  zipCode: string

  /** City */
  city: string

  /** Streetaddress */
  streetAddress: string

  /**
   * Apartmentorsuite
   * Number of an apartment or suite
   */
  apartmentOrSuite: string
}

export interface ApplicableFeesSchema {
  /** Chargecode */
  chargeCode: string

  /** Chargedisplayname */
  chargeDisplayName: string

  /** Amount */
  amount: number
}

export interface ApplicationLogo {
  /** Favicon */
  favIcon: string

  /** Faviconpath */
  favIconPath: string

  /** Logo */
  logo: string

  /** Logoheight */
  logoHeight: string

  /** Logopath */
  logoPath: string
}

export interface Approvals {
  /** Bank Account */
  bank_account: boolean

  /** Four Eyes For Car */
  four_eyes_for_car: boolean

  /** Four Eyes For Funds Transfer */
  four_eyes_for_funds_transfer: boolean

  /** Four Eyes For User */
  four_eyes_for_user: boolean
}

export interface AssetPricingAlerts {
  /** Batchsize */
  batchSize: number
}

export interface AssetsSortingFactors {
  /** Distance */
  distance: Distance[]
}

export interface AssetsSortingFactorsWeights {
  /** Review */
  review: number

  /** Trip */
  trip: number

  /** Rating */
  rating: number

  /** Responserate */
  responseRate: number

  /** Acceptancerate */
  acceptanceRate: number

  /** Gps */
  gps: number

  /** Instant */
  instant: number

  /** Calendarupdate */
  calendarUpdate: number

  /** Listingtime */
  listingTime: number

  /** Pricing */
  pricing: number

  /** Adjustment */
  adjustment: number

  /** Distance */
  distance: number
}

export interface AuthenticationMechanism {
  /** Isfacebookloginenabled */
  isFacebookLoginEnabled: boolean

  /** Isappleloginenabled */
  isAppleLoginEnabled: boolean
}

export interface BackupCars {
  /** Years Gap High */
  years_gap_high: number

  /** Years Gap Low */
  years_gap_low: number

  /** Display Count */
  display_count: number
}

export interface BodyVerifyDriversLicenseLicenseVerificationVerifyPost {
  /**
   * Front
   * Image of the front of the license
   * @format binary
   */
  front: File

  /**
   * Back
   * Image of the back of the license
   * @format binary
   */
  back: File

  /**
   * Pdf417
   * Extracted barcode data
   */
  pdf417: string
}

export interface Booking {
  /** Timetorespond */
  timeToRespond: number

  /** Hourscushionbeforepickup */
  hoursCushionBeforePickup: number

  /** Hourscushionbeforereturn */
  hoursCushionBeforeReturn: number
}

export interface BulkUpdateAccessory {
  /** Bulkupdateinventory */
  bulkUpdateInventory: BulkUpdateParams[]
}

export interface BulkUpdateAccessoryResponse {
  /**
   * Message
   * A successful message for successful update and error message in case of any error.
   */
  message: string
}

export interface BulkUpdateParams {
  /** Vin */
  vin: string

  /** Accessories */
  accessories: VehicleAccessories[]

  /** Publish */
  publish: boolean
}

/**
 * BusinessParty Type
 */
export enum BusinessPartyType {
  Customer = 'Customer',
  Dealer = 'Dealer',
}

/**
 * A structure for holding a cancellation details of the order.
 */
export interface CancelOrder {
  /** Cancellationreason */
  cancellationReason: string

  /** Ordercancelledby */
  orderCancelledBy: string

  /**
   * Ordercancelledat
   * @format date-time
   */
  orderCancelledAt: string

  /** Ordercancelledbyusername */
  orderCancelledByUsername: string

  /** Ordercancelledbyusertype */
  orderCancelledByUserType: string
}

export interface Charges {
  /**  Id */
  _id: string

  /** Chargecode */
  chargeCode: string

  /** Chargedisplayname */
  chargeDisplayName: string

  /** Isactive */
  isActive: boolean

  /** Tagname */
  tagName: string

  /**
   * Createdat
   * @format date-time
   */
  createdAt: string

  /**
   * Updatedat
   * @format date-time
   */
  updatedAt: string
}

export interface CodeDisplayName {
  /** Code */
  code: string

  /** Displayname */
  displayName: string
}

export interface Configuration {
  charges: TCharges
  suggested_rate: SuggestedRate
  frontOfficeUrls: FrontOfficeUrls
  backup_cars: BackupCars
  verifications: Verifications
  verificationConfig: VerificationConfig
  verificationDurations: VerificationDurations
  approvals: Approvals
  points_calculation: PointsCalculation
  insurance: Insurance
  units: Units
  driver: Driver
  owner: Owner
  discount: Discount
  booking: Booking
  theme: Theme
  images: Images
  localization: Localization
  assetsSortingFactorsWeights: AssetsSortingFactorsWeights
  mobileApplications: MobileApplications

  /** Backofficeurl */
  backOfficeUrl: string

  /** Emailverifylink */
  emailVerifyLink: string
  locales: Locales

  /** Domain */
  domain: string

  /** Rental Request Priority Duration */
  rental_request_priority_duration: number
  assetsSortingFactors: AssetsSortingFactors
  payments: Payments

  /** Deliverylocationradius */
  deliveryLocationRadius: number

  /** Pricesliderboundarypercentage */
  priceSliderBoundaryPercentage: number
  authenticationMechanism: AuthenticationMechanism
  assetPricingAlerts: AssetPricingAlerts
  defaultDealerConfig: DefaultDealerConfig
  navBarContent: NavBarContentConfig
  applicationLogo: ApplicationLogo

  /** Isspecificminimumfinance */
  isSpecificMinimumFinance: boolean
}

export interface ContractDocument {
  /**  Id */
  _id: string

  /** Name */
  name: string

  /** Issignedbycustomer */
  isSignedByCustomer: boolean

  /** Issignedbydealer */
  isSignedByDealer: boolean

  /** Displayname */
  displayName: string

  /** Path */
  path?: string

  /** Updatedat */
  updatedAt: string
}

export interface CreatePaymentAccount {
  /** Dealercode */
  dealerCode: string

  /** Email */
  email: string

  /** Debitcardmaxamount */
  debitCardMaxAmount?: number

  /** Creditcardmaxamount */
  creditCardMaxAmount?: number

  /** Achmaxamount */
  achMaxAmount?: number
}

export interface CustomerDetails {
  /**  Id */
  _id: string

  /** Email */
  email: string

  /** Phonenumber */
  phoneNumber: string

  /** Firstname */
  firstName: string

  /** Lastname */
  lastName: string

  /**
   * Createdat
   * @format date-time
   */
  createdAt: string

  /**
   * Updatedat
   * @format date-time
   */
  updatedAt: string

  /** Represents an address (mailing, garaging) of a customer. */
  mailingAddress: Address

  /** Represents an address (mailing, garaging) of a customer. */
  parkingAddress: Address
  drivingLicenseDetails: DrivingLicenseDetails
}

export interface DateTimeFormat {
  /** Time Zone */
  time_zone: string

  /** Long Date Format */
  long_date_format: string

  /** Short Date Format */
  short_date_format: string

  /** Time Format */
  time_format: string
}

export interface DealerAccounts {
  /**  Id */
  _id: string

  /** Isnewuser */
  isNewUser: boolean

  /** Dealercode */
  dealerCode: string

  /** Firstname */
  firstName: string

  /** Lastname */
  lastName: string

  /** Email */
  email: string

  /** Jobtitle */
  jobTitle: string

  /** Phonenumber */
  phoneNumber: string

  /** Isactive */
  isActive: boolean

  /**
   * Updatedat
   * @format date-time
   */
  updatedAt: string

  /** Rolecode */
  roleCode: string

  /** Roledisplayname */
  roleDisplayName: string
}

export interface DealerDocsDownloadAudit {
  /**  Orderid */
  _orderId: string

  /**  Documentid */
  _documentId: string
}

/**
 * Response when dealer downloads original docs.
 */
export interface DealerDocsDownloadAuditResult {
  /** Success */
  success: boolean
}

export interface DealerDomainsRequest {
  /** Email */
  email: string
}

export interface DealerDomainsResponse {
  /** Digitalretailwebsite */
  digitalRetailWebsite: string

  /** Digitalretailadminwebsite */
  digitalRetailAdminWebsite: string
}

export interface DealerFeesConfig {
  /**  Id */
  _id: string

  /** Chargecode */
  chargeCode: string

  /** Chargedisplayname */
  chargeDisplayName: string

  /** State */
  state: CodeDisplayName[]

  /** Financialproduct */
  financialProduct: CodeDisplayName[]

  /** Defaultamount */
  defaultAmount: number

  /** Isactive */
  isActive: boolean

  /** Istaxable */
  isTaxable: boolean

  /** Tagname */
  tagName: string

  /**
   * Updatedat
   * @format date-time
   */
  updatedAt?: string

  /**
   * Createdat
   * @format date-time
   */
  createdAt?: string
}

export interface DealerFnIProduct {
  /** Pendealerid */
  penDealerId: number

  /** Productid */
  productId: number

  /** Providerproductcode */
  providerProductCode: string

  /** Contractprefixoverride */
  ContractPrefixOverride: string

  /** Productname */
  productName: string

  /** Producttype */
  productType: string

  /** Providerdealercodeformat */
  providerDealerCodeFormat: string

  /** Providerdealercodename */
  providerDealerCodeName: string

  /** Providerid */
  providerId: number

  /** Ratingmethods */
  ratingMethods: RatingMethod[]

  /** Regexpvalidator */
  regExpValidator: string

  /** Validatorprompt */
  validatorPrompt: string

  /** Productdescription */
  productDescription: string

  /** Providername */
  providerName: string

  /** Isactive */
  isActive: boolean

  /** Dealercode */
  dealerCode: string

  /** Providerdealercode */
  providerDealerCode: string

  /** Ratingproperties */
  ratingProperties: string[]

  /** Markup */
  markup: number
}

export interface DealerForgotPasswordDto {
  /** Email */
  email: string
}

export interface DealerForgotPasswordResponse {
  /** Email */
  email: string

  /** Userid */
  userID: string
}

export interface DealerSignUpDto {
  /** Email */
  email: string

  /** Firstname */
  firstName: string

  /** Lastname */
  lastName: string

  /** Phonenumber */
  phoneNumber: string

  /** Dealercode */
  dealerCode: string

  /** Jobtitle */
  jobTitle: string

  /** Rolecode */
  roleCode: string

  /** Roledisplayname */
  roleDisplayName: string

  /** Isactive */
  isActive: boolean
}

export interface DealerSignUpResponse {
  /** Accesstoken */
  accessToken: string

  /** Userid */
  userId: string

  /** Email */
  email: string
}

export interface DealershipAllConfig {
  /** Dealercode */
  dealerCode: string

  /** An object representing general configuration of a single dealership. */
  generalConfiguration: DealershipGeneralConfig

  /** An object representing payment configuration of a single dealership. */
  paymentConfiguration: DealershipPaymentConfig

  /** Dealerfees */
  dealerFees: DealerFeesConfig[]

  /** An object representing trade-in configuration of a single dealership. */
  tradeinConfiguration: DealershipTradeinConfig

  /**
   * Createat
   * @format date-time
   */
  createAt: string

  /**
   * Updatedat
   * @format date-time
   */
  updatedAt: string
}

/**
 * An object representing general configuration of a single dealership.
 */
export interface DealershipGeneralConfig {
  /** Availableproducts */
  availableProducts: CodeDisplayName[]
  defaultProduct: CodeDisplayName

  /** Assetsautopublished */
  assetsAutoPublished: boolean

  /** Defaultmileageonvdp */
  defaultMileageOnVDP: number

  /** Defaultleasetermsonvdp */
  defaultLeaseTermsOnVDP: number

  /** Defaultfinancetermsonvdp */
  defaultFinanceTermsOnVDP: number

  /** Leasedownpaymentlowerlimit */
  leaseDownPaymentLowerLimit: number

  /** Financedownpaymentlowerlimit */
  financeDownPaymentLowerLimit: number

  /** Minimumfinancedamount */
  minimumFinancedAmount: number

  /** Defaultdownpayment */
  defaultDownPayment: number

  /** An enumeration. */
  scheduledOptions: ScheduledOptions

  /** Dealershipaddress */
  dealershipAddress: string
  state: CodeDisplayName

  /** City */
  city: string

  /** Zipcode */
  zipCode: string

  /** Contactnumber */
  contactNumber: string

  /** Customersupportnumber */
  customerSupportNumber: string

  /**
   * Dealertimezone
   * IANA timezone name, eg. 'America/New_York'
   */
  dealerTimezone: string

  /** Fax */
  fax: number

  /** Contactname */
  contactName: string

  /** Website */
  website: string

  /** Observesdaylightsaving */
  observesDayLightSaving: boolean

  /** Pendealerid */
  penDealerId: number

  /** County */
  county: string

  /** Specificminimumfinances */
  specificMinimumFinances?: SpecificMinimumFinances[]
}

/**
 * An object representing payment configuration of a single dealership.
 */
export interface DealershipPaymentConfig {
  /** Stripepublickey */
  stripePublicKey: string

  /** Stripeprivatekey */
  stripePrivateKey: string
}

/**
 * An object representing trade-in configuration of a single dealership.
 */
export interface DealershipTradeinConfig {
  /** Provider */
  provider: string

  /** Percentage */
  percentage: number
}

export interface Dealerships {
  /**  Id */
  _id: string

  /** Name */
  name: string

  /** Dealercode */
  dealerCode: string

  /** Email */
  email?: string

  /** Address */
  address: string

  /** Address2 */
  address2?: string

  /** City */
  city: string
  state: CodeDisplayName

  /** Zipcode */
  zipCode: string

  /** Digitalretailenabled */
  digitalRetailEnabled: boolean

  /** Digitalretailwebsite */
  digitalRetailWebsite: string

  /** Digitalretailadminwebsite */
  digitalRetailAdminWebsite: string

  /** Marketscanaccountnumber */
  marketScanAccountNumber: string

  /** Contactno */
  contactNo: string

  /** Isactive */
  isActive: boolean

  /**
   * Createdat
   * @format date-time
   */
  createdAt: string

  /**
   * Updatedat
   * @format date-time
   */
  updatedAt: string

  /** Pickupdatetimeslots */
  pickupDateTimeSlots: VehicleHandOverObject[]

  /** Deliverydatetimeslots */
  deliveryDateTimeSlots: VehicleHandOverObject[]
}

export interface DefaultDealerConfig {
  /** Defaultdownpaymentpercentage */
  defaultDownPaymentPercentage: number

  /** Defaultminimumfinancedamount */
  defaultMinimumFinancedAmount: number

  /** Defaultvehiclehandovermode */
  defaultVehicleHandOverMode: string
}

export interface DeliveryAddress {
  /** Address */
  address: string

  /** Address2 */
  address2?: string

  /** City */
  city: string

  /** State */
  state: string

  /** Zipcode */
  zipCode: string
}

export interface Discount {
  /** Level */
  level: string
}

export interface Distance {
  /**  Id */
  _id: string

  /** Rangestart */
  rangeStart: number

  /** Rangeend */
  rangeEnd: number

  /** Indexvalue */
  indexValue: number
}

export interface Driver {
  /** Hours Per Day */
  hours_per_day: number

  /** Rate Per Day */
  rate_per_day: number

  /** Overtime Rate Per Hour */
  overtime_rate_per_hour: number

  /** Information Required */
  information_required: boolean

  /** Kyc Required */
  kyc_required: boolean
}

/**
 * @example {"firstName":"tamoor","lastName":"afzal","licenseNo":"D87989515","issuingState":"CA","expiryDate":"2025-07-02T00:00:00.000Z","dateOfBirth":"1990-07-02T00:00:00.000Z","updatedAt":"2020-10-26T13:54:01.358Z","createdAt":"2020-10-26T13:54:01.358Z"}
 */
export interface DrivingLicenseDetails {
  /** Firstname */
  firstName: string

  /** Lastname */
  lastName: string

  /** Licenseno */
  licenseNo: string

  /** Issuingstate */
  issuingState: string
  licenseDocs: LicenseDocuments
  licenseDocsCropped: LicenseDocuments

  /**
   * Expirydate
   * @format date-time
   */
  expiryDate: string

  /**
   * Updatedat
   * @format date-time
   */
  updatedAt: string

  /**
   * Createdat
   * @format date-time
   */
  createdAt: string
}

export interface Email {
  /** Forgotpasswordtokenexpiry */
  forgotPasswordTokenExpiry: number

  /** Tokenverifylink */
  tokenVerifyLink: string
}

/**
 * Used when a transition does not require any input.
 */
export type EmptyTransition = object

export interface EnableDisableDealership {
  /** Isactive */
  isActive: boolean
}

/**
 * A structure for holding a single fee on the order.
 */
export interface Fee {
  /**
   * Chargecode
   * This is used in backend to track the fee
   */
  chargeCode: string

  /**
   * Chargedisplayname
   * This contains human-readable version of the fee. It must be sent in the save request!
   */
  chargeDisplayName: string

  /**
   * Amount
   * Dollar amount of the fee
   */
  amount: number

  /**
   * Istaxable
   * This contains fee taxable
   */
  isTaxable: boolean

  /**
   * Vendorname
   * This contains vendor name of the fee.
   */
  vendorName?: string

  /**
   * Tagname
   * Tag Name of each fee.
   */
  tagName: string
}

/**
 * A structure used for saving order fees.
 **Note that it requires chargeDisplayName to be saved as well.**
 */
export interface FeeInput {
  /**
   * Chargecode
   * This is used in backend to track the fee
   */
  chargeCode: string

  /**
   * Chargedisplayname
   * This contains human-readable version of the fee. It must be sent in the save request!
   */
  chargeDisplayName: string

  /**
   * Amount
   * Dollar amount of the fee
   */
  amount: number

  /**
   * Istaxable
   * This contains fee taxable
   */
  isTaxable: boolean

  /**
   * Vendorname
   * This contains vendor name of the fee.
   */
  vendorName?: string

  /**
   * Tagname
   * Tag Name of each fee.
   */
  tagName: string
}

export interface FeeTag {
  /**  Id */
  _id: string

  /** Chargecode */
  chargeCode: string

  /** Productcode */
  productCode: string

  /** Statecode */
  stateCode: string

  /** Tagname */
  tagName: string
}

export interface Fees {
  /** Item */
  item: string

  /** Price */
  price: number

  /** Istaxable */
  isTaxAble: boolean
}

export interface FnI {
  /** Item */
  item: string

  /** Price */
  price: number
}

export interface FnIProductImage {
  /** Name */
  name: string
}

export interface FnIProducts {
  /** Formid */
  formId: number

  /** Penproductid */
  penProductId: number

  /** Rateid */
  rateId: number

  /** Sessionid */
  sessionId: string

  /** Retailprice */
  retailPrice: number

  /** Name */
  name: string

  /** Mileage */
  mileage: number

  /** Term */
  term: number

  /** Deductibleamount */
  deductibleAmount: number

  /** Coveragename */
  coverageName: string

  /** Description */
  description: string

  /** Dealercost */
  dealerCost: number

  /** Deductibletype */
  deductibleType: string

  /** Deductibledescription */
  deductibleDescription: string

  /** Fimarkup */
  fiMarkup: number

  /** Maxretailprice */
  maxRetailPrice: number

  /** Minretailprice */
  minRetailPrice: number

  /** Reducedamount */
  reducedAmount: number

  /** Contractnumber */
  contractNumber: string

  /** Dealidentifier */
  dealIdentifier: string
  contractDocument: ContractDocument

  /** Isdealposted */
  isDealPosted: boolean

  productNameForCustomer: string
  productNameForDealer: string

  customerProductType: {
    code: string
    displayName: string
  }

  dealerProductType: {
    code: string
    displayName: string
  }

  productType: number
}

export interface FormFieldsRequest {
  /** Label */
  label: string

  /** Type */
  type: string

  /** Values */
  values: string[]

  /** Isactive */
  isActive: boolean
}

export interface FormRequest {
  /** Formtypecode */
  formTypeCode: string

  /** Formtypedisplayname */
  formTypeDisplayName: string

  /** Isactive */
  isActive: boolean

  /** Formfields */
  formFields: FormFieldsRequest[]
}

export interface FormResponse {
  /** Formtypecode */
  formTypeCode: string

  /** Formtypedisplayname */
  formTypeDisplayName: string

  /** Isactive */
  isActive: boolean

  /** Formfields */
  formFields: FormFieldsRequest[]
}

export interface FrontOfficeUrls {
  /** Bookingdetails */
  bookingDetails: string

  /** Orderdetails */
  orderDetails: string

  /** Uploadpayslip */
  uploadPayslip: string

  /** Assetdetails */
  assetDetails: string

  /** Reviewsaboutme */
  reviewsAboutMe: string

  /** Reviewsbyme */
  reviewsByMe: string

  /** Bankaccountdetails */
  bankAccountDetails: string

  /** Makepayment */
  makePayment: string

  /** Downloadpdf */
  downloadPDF: string
}

export interface GetPricingDetails {
  /** Dealtype */
  dealType: number

  /** Dealercode */
  dealerCode: string

  /** Odometer */
  odometer: number

  /** Annualmileage */
  annualMileage: number

  /** Isnew */
  isNew?: boolean

  /** Vin */
  VIN: string

  /** Totalscore */
  totalScore: number

  /** Sellingprice */
  sellingPrice: number

  /** Term */
  term: number

  /** Downpayment */
  downPayment: number

  /** Fees */
  fees: Fees[]

  /** Addons */
  addOns: AddOns[]

  /** Fniproducts */
  FnIProducts?: FnI[]

  /** Represents an address (mailing, garaging) of a customer. */
  customerAddress: Address

  /** Residualvalue */
  residualValue?: number

  /** Apr */
  APR?: number

  /** Rebateandpromotions */
  rebateAndPromotions?: number

  /** Balloonpercentage */
  balloonPercentage?: number

  /** Balloonamount */
  balloonAmount?: number
  taxes?: PricingTaxRates

  /** Tradeinbalance */
  tradeInBalance?: number
  tradeIn?: PricingDetailTradeIn
  updatedTaxes?: UpdateTaxesParams
}

export interface GetPricingDetailsResponse {
  /**
   * Duedate
   * @format date-time
   */
  dueDate: string

  /** Grosscapitalizedcost */
  grossCapitalizedCost: number

  /** Capitalizedcostreduction */
  capitalizedCostReduction: number

  /** Adjustedcapitalizedcost */
  adjustedCapitalizedCost: number

  /** Monthlyleasecharge */
  monthlyLeaseCharge: number

  /** Monthlydeprecation */
  monthlyDeprecation: number

  /** Basemonthlypayment */
  baseMonthlyPayment: number

  /** Monthlysalesusetax */
  monthlySalesUseTax: number

  /** Monthlypayment */
  monthlyPayment: number

  /** Totalofmonthlypayments */
  totalOfMonthlyPayments: number

  /** Upfronttaxesandfees */
  upfrontTaxesAndFees: number

  /** Tradeinbalance */
  tradeInBalance: number

  /** Dueatsigning */
  dueAtSigning: number

  /** Rebateandpromotions */
  rebateAndPromotions: number

  /** Balloonpercentage */
  balloonPercentage?: number

  /** Balloonamount */
  balloonAmount?: number

  /** Totalscore */
  totalScore: number

  /** Residualvalue */
  residualValue: number

  /** Term */
  term: number

  /** Downpayment */
  downPayment: number

  /** Programid */
  programId: string

  /** Apr */
  APR: number

  /** Totalsellingprice */
  totalSellingPrice: number

  /** Taxoncapitalizedcostreduction */
  taxOnCapitalizedCostReduction: number

  /** Taxondownpayment */
  taxOnDownPayment: number

  /** Taxondiscount */
  taxOnDiscount: number

  /** Taxontradein */
  taxOnTradeIn: number

  /** Totalsalesusetax */
  totalSalesUseTax: number

  /** Taxondealerfee */
  taxOnDealerFee: number

  /** Taxonnegativetradein */
  taxOnNegativeTradeIn?: number

  /** Taxonfniproducts */
  taxOnFnIProducts?: number

  /** Taxonsellingprice */
  taxOnSellingPrice?: number

  /** Taxonpositivetradein */
  taxOnPositiveTradeIn?: number

  /** Salestaxonsellingpricelesscostreduction */
  salesTaxOnSellingPriceLessCostReduction: number

  /** Totaltaxes */
  totalTaxes: number

  /** Assetresidualvalue */
  assetResidualValue: number

  /** Addonrv */
  addOnRv: number
  taxes: PricingTaxRates

  /** Amountfinanced */
  amountFinanced: number

  /** Taxtotal */
  taxTotal: number
}

export interface GetUploadUrls {
  /** Sastoken */
  sasToken: string

  /** Containername */
  containerName: string

  /** Filename */
  filename: string

  /** Storageblobname */
  storageBlobName: string

  /** Blobname */
  blobName: string

  /** Blobpath */
  blobPath: string

  /** Url */
  url: string
}

export interface GetUploadUrlsPayload {
  /** Filenames */
  filenames: string[]

  /** Namingfields */
  namingfields?: string[]

  /** Imagetype */
  imageType: string
}

export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[]
}

/**
 * An enumeration.
 */
export enum HandOverMode {
  Pickup = 'Pickup',
  Delivery = 'Delivery',
}

export interface IDealerSocialLinks {
  /** Facebook */
  facebook: string

  /** Google */
  google: string

  /** Instagram */
  instagram: string

  /** Linkedin */
  linkedin: string

  /** Twitter */
  twitter: string

  /** Youtube */
  youtube: string
}

/**
 * A result of all insurance details against any order
 */
export interface IInsurance {
  /** Providername */
  providerName: string

  /** Contactnumber */
  contactNumber: string

  /** Policynumber */
  policyNumber?: string

  /**
   * Expirydate
   * @format date-time
   */
  expiryDate?: string

  /** Address */
  address?: string

  /** City */
  city?: string
  state?: CodeDisplayName

  /** Zipcode */
  zipCode?: string

  /** Document */
  document?: string

  /** Documenturl */
  documentURL?: string
}

export interface IMenuLinks {
  /** Name */
  name: string

  /** Weburl */
  webUrl: string

  /** An enumeration. */
  position: MenuPosition

  /** Order */
  order: number
}

export interface ISocialLinkObj {
  /** An enumeration. */
  name: SocialMedia

  /** Weburl */
  webUrl: string

  /** Icon */
  icon: string

  /** Order */
  order: number
}

export interface Images {
  /** Max Count */
  max_count: number

  /** Max Size */
  max_size: number
}

export interface IndividualizedAgreement {
  /**  Id */
  _id: string

  /** Agreement */
  agreement: string

  /** Isdefault */
  isDefault: boolean
}

export interface Insurance {
  /** Is Required */
  is_required: boolean

  /** Company Api Url */
  company_api_url: string

  /** Company Api Key */
  company_api_key: string
}

export interface InventoryAccessories {
  /** Makemodel */
  makeModel: string

  /** Vin */
  vin: string

  /** Accessories */
  accessories: VehicleAccessories[]
}

export interface InventoryManagement {
  /**  Id */
  _id: string

  /** Vin */
  vin: string

  /** Make */
  make: string

  /** Model */
  model: string

  /** Modelcode */
  modelCode: string

  /** Transmissiontype */
  transmissionType: string

  /** Internetprice */
  internetPrice: number

  /** Mileage */
  mileage: number

  /** Msrp */
  msrp: number

  /** Enginedescription */
  engineDescription: string

  /** Photourls */
  photoUrls: string[]

  /** Dailyinventoryupdate */
  dailyInventoryUpdate: boolean

  /** Makemodel */
  makeModel: string

  /** Publish */
  publish: boolean

  /** Status */
  status: string

  /** Accessories */
  accessories: VehicleAccessories[]

  /** Type */
  type: number

  /** Typename */
  typeName: string

  /** Stocknumber */
  stockNumber: string

  /**
   * Loadedon
   * @format date-time
   */
  loadedOn: string

  /**
   * Updatedat
   * @format date-time
   */
  updatedAt: string
}

export interface InventoryManagementUpdateDailyParams {
  /** Vehicleupdateparams */
  vehicleUpdateParams: UpdateDailyParams[]
}

export interface InventoryManagementUpdateParams {
  /** Vehicleupdateparams */
  vehicleUpdateParams: UpdateParams[]
}

export interface LatestOrderState {
  /**  Id */
  _id: string

  /** State */
  state: string
}

export interface LicenseDocuments {
  /** Front */
  front: string

  /** Back */
  back: string

  /** Licensedocsfronturl */
  licenseDocsFrontUrl: string

  /** Licensedocsbackurl */
  licenseDocsBackUrl: string
}

/**
* Status of a license verification.

There are four statuses:

* `not-started` - verification was not attempted yet, go ahead
* `in-progress` - in this state you can show "come back later" message. Manual verification is in progress.
* `verified` - verification completed
* `failed` - verification has failed, you can try again

## Failed Verification

When verification moves to a `failed` status there are two additional fields available:

* `retryAt` - the next date and time when you can retry verification
* `reasons` - an array of reason codes for why the verification failed

`retryAt` can be null, which means you can try to verify again right away. Otherwise
you need to show a message for the user to come back in X days.

`reasons` are documented at https://developer.us.mitekcloud.com/.
*/
export interface LicenseVerificationStatus {
  /** Status */
  status: string | string | string | string

  /**
   * Retryat
   * @format date-time
   */
  retryAt?: string

  /** Reasons */
  reasons?: string[]
}

export interface Locales {
  /**  Id */
  _id: string

  /** Locale */
  locale: string

  /** Name */
  name: string
}

export interface Localization {
  dateTimeFormat: DateTimeFormat

  /** Primarylanguage */
  primaryLanguage: string

  /** Secondarylanguages */
  secondaryLanguages: string[]

  /** Defaultcountry */
  defaultCountry: string

  /** Defaultcurrency */
  defaultCurrency: string

  /** Defaultdecimalplacetypecode */
  defaultDecimalPlaceTypeCode: string
}

export interface Lookups {
  /** Code */
  code: string

  /** Name */
  name: string

  /** Description */
  description: string

  /** Displayname */
  displayName: string

  /** Isactive */
  isActive: boolean

  /** Additionalinfo */
  additionalInfo: object

  /**
   * Createdon
   * @format date-time
   */
  createdOn: string

  /**
   * Updatedon
   * @format date-time
   */
  updatedOn: string
}

/**
 * An enumeration.
 */
export enum MenuPosition {
  Header = 'Header',
  Footer = 'Footer',
}

export interface Mobile {
  /** Maxincorrectpinattempts */
  maxIncorrectPinAttempts: number

  /** Maxresendpinattempts */
  maxResendPinAttempts: number

  /** Pinexpiryinminutes */
  pinExpiryInMinutes: number

  /** Haltverificationinmintues */
  haltVerificationInMintues: number

  /** Consecutiveresendpinslimitinminutes */
  consecutiveResendPinsLimitInMinutes: number
}

export interface MobileApplications {
  android: MobileOS
  ios: MobileOS
}

export interface MobileOS {
  /** Version */
  version: string

  /** Isforcefulupdate */
  isForceFulUpdate: boolean

  /** Isundermaintenance */
  isUnderMaintenance: boolean
}

export interface NavBarContentConfig {
  /** Clientemail */
  clientEmail: string
  clientSupport: NavBarSupportModel

  /** Otozemail */
  otozEmail: string
  shiftDigitalSupport: NavBarSupportModel

  /** Weekdayssupport */
  weekdaysSupport: string

  /** Weekendssupport */
  weekendsSupport: string
}

export interface NavBarSupportModel {
  /** Name */
  name: string

  /** Phoneno */
  phoneNo: string
}

export interface OdoStatementDto {
  /** Odoreflectsvehiclemileage */
  OdoReflectsVehicleMileage: boolean

  /** Odoreflectsexcmechlimits */
  OdoReflectsExcMechLimits: boolean

  /** Odonotactualvehiclemileage */
  OdoNotActualVehicleMileage: boolean
}

export interface Order {
  vehicle: VehicleDetails

  /**
   * Those are details of a single order. It'll be returned
   * in multiple places in the app.
   */
  order: OrderDetails
  customer: CustomerDetails
}

export interface OrderAccessories {
  /** Name */
  name: string

  /** Price */
  price: number

  /** Residualvalueadder */
  residualValueAdder: number
  installationMode: CodeDisplayName

  /** Description */
  description: string
  category: CodeDisplayName

  /** Partno */
  partNo: string

  /** Supplier */
  supplier: string
}

/**
* Those are details of a single order. It'll be returned
in multiple places in the app.
*/
export interface OrderDetails {
  /**  Id */
  _id: string

  /**
   * Createdat
   * @format date-time
   */
  createdAt: string

  /**
   * Updatedat
   * @format date-time
   */
  updatedAt: string

  /**
   * Order is managed by a state machine. This enum contains all possible states
   * in which order can be.
   *
   * Please refer to the transition diagram to understand it better.
   */
  state: OrderState

  /**
   * Vin
   * VIN number of the car in order
   */
  vin: string

  /** An enumeration. */
  productCode: ProductCode

  /**
   * Productdisplayname
   * Human-readable name of the product like Finance or Lease
   */
  productDisplayName: string

  /**  Customerid */
  _customerId: string

  /** Additionalfee */
  additionalFee: number

  /** Mileage */
  mileage: number

  /** Additionalmileageamount */
  additionalMileageAmount: number

  /** Fees */
  fees: Fee[]

  /** Taxes */
  taxes: Tax[]

  /** Contractdocs */
  contractDocs?: ContractDocument[]

  /** Watermarkedcontractdocs */
  watermarkedContractDocs?: WatermarkedContractDocument[]

  /** An enumeration. */
  vehicleHandOverMode: HandOverMode

  /** Proposeddatetimeslots */
  proposedDateTimeSlots: string[]

  /**
   * Selecteddatetimeslot
   * @format date-time
   */
  selectedDateTimeSlot?: string

  /**
   * Financeddate
   * @format date-time
   */
  financedDate: string

  /**
   * Orderplaceat
   * @format date-time
   */
  orderPlaceAt: string
  pricing: SaveOrderPricing
  deliveryAddress: DeliveryAddress

  /** Isdeliveryaddresssameasparkingaddress */
  isDeliveryAddressSameAsParkingAddress: boolean

  /** Odometer */
  odometer: number

  /** Dealercode */
  dealerCode: string

  /** Isnew */
  IsNew: boolean

  /** Dealtype */
  dealType: number

  /** Dueatsigning */
  dueAtSigning: number

  /** Orderid */
  orderId: number

  /** Accessories */
  accessories: OrderAccessories[]

  /** Paymentstatus */
  paymentStatus: string

  /** A structure for holding a cancellation details of the order. */
  orderCancellationDetails?: CancelOrder
  tradeInVehicle: OrderTradeIn
  tradeInRemovalDetails: RemoveOrderTradeIn

  /** Vehicleprimaryuse */
  vehiclePrimaryUse: string

  /** Fniproducts */
  fniProducts: FnIProducts[]

  /** Dealerfniproducts */
  dealerFnIProducts: FnIProducts[]

  /** Fniproductssum */
  fniProductsSum: number

  /** Individualizedagreement */
  individualizedAgreement?: string

  /** Referencenumber */
  referenceNumber: string
  odoStatement: OdoStatementDto
  updatedTaxesWithTradeIn?: UpdateTaxesParams
  updatedTaxesWithoutTradeIn?: UpdateTaxesParams
}

/**
* Order is managed by a state machine. This enum contains all possible states
in which order can be.

Please refer to the transition diagram to understand it better.
*/
export enum OrderState {
  Draft = 'Draft',
  Inquiry = 'Inquiry',
  NotAvailable = 'NotAvailable',
  Available = 'Available',
  Confirmed = 'Confirmed',
  WaitingForCreditDecision = 'WaitingForCreditDecision',
  Rejected = 'Rejected',
  Approved = 'Approved',
  CreditError = 'CreditError',
  CreditStipulated = 'CreditStipulated',
  WaitingForContractDecision = 'WaitingForContractDecision',
  ContractRejected = 'ContractRejected',
  ContractApproved = 'ContractApproved',
  DocumentsSigned = 'DocumentsSigned',
  PaymentFailed = 'PaymentFailed',
  PaymentPerformed = 'PaymentPerformed',
  VehicleHandOverModeSelected = 'VehicleHandOverModeSelected',
  NotAvailableAfterPayment = 'NotAvailableAfterPayment',
  TimeSlotsProposed = 'TimeSlotsProposed',
  AppointmentScheduled = 'AppointmentScheduled',
  Delivered = 'Delivered',
  Complete = 'Complete',
  Cancelled = 'Cancelled',
  RescheduleTimeSlotsByCustomer = 'RescheduleTimeSlotsByCustomer',
  RescheduleTimeSlotsByDealer = 'RescheduleTimeSlotsByDealer',
}

export interface OrderTradeIn {
  /** Year */
  year: number

  /** Makeid */
  makeId: number

  /** Make */
  make: string

  /** Modelid */
  modelId: number

  /** Model */
  model: string

  /** Trimid */
  trimId: number

  /** Trim */
  trim: string

  /** Odometer */
  odometer: number

  /** Vin */
  vin: string

  /** Zipcode */
  zipCode: string

  /** Kbbvalue */
  KBBValue: number

  /** Offer */
  offer: number

  /** Comment */
  comment?: string

  /** Previousoffer */
  previousOffer?: number

  /** Istradeinupdated */
  isTradeInUpdated?: boolean

  /** Condition */
  condition: string

  /** Tradeindocs */
  tradeInDocs: OrderTradeInDocs[]

  /** Isvehicledriveable */
  isVehicleDriveable: boolean

  /** Tradeinvehicleoptions */
  tradeInVehicleOptions: TradeInVehicleOptions[]
  tradeInLeaseBalance: TradeInLeaseBalance

  /** Tradeinassetcondition */
  tradeInAssetCondition: TradeInAssetCondition[]
}

export interface OrderTradeInDocs {
  /** Name */
  name: string

  /** Path */
  path: string
}

export interface Owner {
  /** Cancellations Allowed Per Month */
  cancellations_allowed_per_month: number

  /** Block Duration */
  block_duration: number
}

/**
 * @example {"code":"Technology Package","options":["Sirius XM","Bluetooth"]}
 */
export interface Package {
  /** Code */
  code: string

  /** Options */
  options: string[]
}

/**
 * Wraps an object in a response suitable for pagination.
 */
export interface PaginatedAccessories {
  /** Pagedata */
  pageData: Accessories[]

  /** Page */
  page: number

  /** Total */
  total: number

  /** Limit */
  limit: number

  /** Pages */
  pages: number
}

/**
 * Wraps an object in a response suitable for pagination.
 */
export interface PaginatedDealerAccounts {
  /** Pagedata */
  pageData: DealerAccounts[]

  /** Page */
  page: number

  /** Total */
  total: number

  /** Limit */
  limit: number

  /** Pages */
  pages: number
}

/**
 * Wraps an object in a response suitable for pagination.
 */
export interface PaginatedDealerFeesConfig {
  /** Pagedata */
  pageData: DealerFeesConfig[]

  /** Page */
  page: number

  /** Total */
  total: number

  /** Limit */
  limit: number

  /** Pages */
  pages: number
}

/**
 * Wraps an object in a response suitable for pagination.
 */
export interface PaginatedDealerFnIProduct {
  /** Pagedata */
  pageData: DealerFnIProduct[]

  /** Page */
  page: number

  /** Total */
  total: number

  /** Limit */
  limit: number

  /** Pages */
  pages: number
}

/**
 * Wraps an object in a response suitable for pagination.
 */
export interface PaginatedDealerships {
  /** Pagedata */
  pageData: Dealerships[]

  /** Page */
  page: number

  /** Total */
  total: number

  /** Limit */
  limit: number

  /** Pages */
  pages: number
}

/**
 * Wraps an object in a response suitable for pagination.
 */
export interface PaginatedFeeTag {
  /** Pagedata */
  pageData: FeeTag[]

  /** Page */
  page: number

  /** Total */
  total: number

  /** Limit */
  limit: number

  /** Pages */
  pages: number
}

/**
 * Wraps an object in a response suitable for pagination.
 */
export interface PaginatedInventoryManagement {
  /** Pagedata */
  pageData: InventoryManagement[]

  /** Page */
  page: number

  /** Total */
  total: number

  /** Limit */
  limit: number

  /** Pages */
  pages: number
}

/**
 * An enumeration.
 */
export enum PaymentGateway {
  Omise = 'Omise',
  Stripe = 'Stripe',
}

export interface Payments {
  /** Rollbackdepositafterbookcompletioninminutes */
  rollbackDepositAfterBookCompletionInMinutes: number

  /** Is3Dsecureenabled */
  is3dSecureEnabled: boolean
}

export interface PaymentsAccount {
  /** Paymentgatewayaccountid */
  paymentGatewayAccountId: string

  /** Dealercode */
  dealerCode: string

  /** Type */
  type: string

  /** Email */
  email: string

  /** Status */
  status: string

  /** Disabledreason */
  disabledReason: string

  /** An enumeration. */
  paymentGateway: PaymentGateway

  /** Debitcardmaxamount */
  debitCardMaxAmount?: number

  /** Creditcardmaxamount */
  creditCardMaxAmount?: number

  /** Achmaxamount */
  achMaxAmount?: number
}

export interface PenMarketingMaterial {
  /** Name */
  name: string

  /** Url */
  url: string
}

/**
 * Details of a products from PEN SOAP call.
 */
export interface PenProduct {
  /** Name */
  name: string

  /** Productid */
  productId: number

  /** Producttype */
  productType: string

  /** Providerdealercodeformat */
  providerDealerCodeFormat: string

  /** Providerdealercodename */
  providerDealerCodeName: string

  /** Providerid */
  providerId: number

  /** Ratingmethods */
  ratingMethods: RatingMethod[]

  /** Ratingproperties */
  ratingProperties: string[]

  /** Regexpvalidator */
  regExpValidator: string

  /** Validatorprompt */
  validatorPrompt: string
}

/**
 * Details of a providers from PEN SOAP call.
 */
export interface PenProvider {
  /** Name */
  name: string

  /** Providerid */
  providerId: number
}

export interface PointsCalculation {
  /** Batch Size */
  batch_size: number

  /** Division Factor */
  division_factor: number
}

export interface PricingDetailTradeIn {
  /** Offeramount */
  offerAmount: number

  /** Leasebalance */
  leaseBalance: number

  /** Paymenttype */
  paymentType: string
}

export interface PricingTaxRates {
  /** Capitalcostreductiontax */
  capitalCostReductionTax: number

  /** Rebatetax */
  rebateTax: number

  /** Salestax */
  salesTax: number

  /** Usetax */
  useTax: number

  /** Tradeintax */
  tradeInTax: number
}

/**
 * An enumeration.
 */
export enum ProductCode {
  Lease = 'Lease',
  Finance = 'Finance',
  Cash = 'Cash',
  EasyRide = 'EasyRide',
}

export interface RatingMethod {
  /** Ratingmethod */
  ratingMethod: string
}

export interface ReferenceData {
  /**  Id */
  _id: string

  /** Isactive */
  isActive: boolean

  /** Types of the Reference Data. */
  typeCode: ReferenceDataTypes

  /** Typename */
  typeName: string

  /** Typedisplayname */
  typeDisplayName: string

  /** Typedescription */
  typeDescription: string

  /**
   * Createdat
   * @format date-time
   */
  createdAt: string

  /**
   * Updatedat
   * @format date-time
   */
  updatedAt: string

  /** Lookups */
  lookups: Lookups[]
}

/**
 * Types of the Reference Data.
 */
export enum ReferenceDataTypes {
  Country = 'Country',
  PreferredMethodOfContact = 'PreferredMethodOfContact',
  DecimalPlace = 'DecimalPlace',
  Unit = 'Unit',
  ResidenceType = 'ResidenceType',
  Salutation = 'Salutation',
  EmploymentType = 'EmploymentType',
  TimeZone = 'TimeZone',
  LongDateFormat = 'LongDateFormat',
  ShortDateFormat = 'ShortDateFormat',
  DealerRole = 'DealerRole',
  VehicleHandOverMode = 'VehicleHandOverMode',
  DefaultFinanceTerms = 'DefaultFinanceTerms',
  DefaultLeaseTerms = 'DefaultLeaseTerms',
  DefaultMileage = 'DefaultMileage',
  FinancialProduct = 'FinancialProduct',
  USAState = 'USAState',
  Category = 'Category',
  CompatibleModels = 'CompatibleModels',
  InstallationMode = 'InstallationMode',
  FniCustomerProductType = 'FniCustomerProductType',
  VehicleType = 'VehicleType',
}

export interface RemoveOrderTradeIn {
  /** Reason */
  reason: string

  /** Removedbyuserid */
  removedByUserId: string

  /** Removedbyusername */
  removedByUserName: string

  /**
   * Removedat
   * @format date-time
   */
  removedAt: string
}

export interface SaveOrderPricing {
  /** Term */
  term: number

  /** Downpayment */
  downPayment: number

  /** Totalscore */
  totalScore: number

  /** Sellingprice */
  sellingPrice: number

  /** Residualvalue */
  residualValue: number

  /** Apr */
  APR: number

  /** Rebateandpromotions */
  rebateAndPromotions: number
  taxes: SaveOrderPricingTax

  /** Tradeinbalance */
  tradeInBalance?: number
}

export interface SaveOrderPricingResponse {
  /** Sellingprice */
  sellingPrice: number

  /**
   * Duedate
   * @format date-time
   */
  dueDate: string

  /** Grosscapitalizedcost */
  grossCapitalizedCost: number

  /** Capitalizedcostreduction */
  capitalizedCostReduction: number

  /** Adjustedcapitalizedcost */
  adjustedCapitalizedCost: number

  /** Monthlyleasecharge */
  monthlyLeaseCharge: number

  /** Monthlydeprecation */
  monthlyDeprecation: number

  /** Basemonthlypayment */
  baseMonthlyPayment: number

  /** Monthlysalesusetax */
  monthlySalesUseTax: number

  /** Monthlypayment */
  monthlyPayment: number

  /** Totalofmonthlypayments */
  totalOfMonthlyPayments: number

  /** Upfronttaxesandfees */
  upfrontTaxesAndFees: number

  /** Tradeinbalance */
  tradeInBalance: number

  /** Dueatsigning */
  dueAtSigning: number

  /** Rebateandpromotions */
  rebateAndPromotions: number

  /** Totalscore */
  totalScore: number

  /** Residualvalue */
  residualValue: number

  /** Term */
  term: number

  /** Downpayment */
  downPayment: number

  /** Programid */
  programId: number

  /** Apr */
  APR: number

  /** Totalsellingprice */
  totalSellingPrice: number

  /** Taxoncapitalizedcostreduction */
  taxOnCapitalizedCostReduction: number

  /** Taxondownpayment */
  taxOnDownPayment: number

  /** Taxondiscount */
  taxOnDiscount: number

  /** Taxonpositivetradein */
  taxOnPositiveTradeIn: number

  /** Taxontradein */
  taxOnTradeIn: number

  /** Totalsalesusetax */
  totalSalesUseTax: number

  /** Taxondealerfee */
  taxOnDealerFee: number

  /** Salestaxonsellingpricelesscostreduction */
  salesTaxOnSellingPriceLessCostReduction: number

  /** Totaltaxes */
  totalTaxes: number

  /** Assetresidualvalue */
  assetResidualValue: number

  /** Addonrv */
  addOnRv: number
  taxes: SaveOrderPricingResponseTaxSet
}

export interface SaveOrderPricingResponseTaxData {
  /** Rate */
  rate: number

  /** Name */
  name: string

  /** Additionalinfo */
  additionalInfo: string
}

export interface SaveOrderPricingResponseTaxSet {
  salesTax: SaveOrderPricingResponseTaxData
  costReductionTax: SaveOrderPricingResponseTaxData
  rebateTax: SaveOrderPricingResponseTaxData
  tradeInTax: SaveOrderPricingResponseTaxData
}

export interface SaveOrderPricingTax {
  /** Capitalcostreductiontax */
  capitalCostReductionTax: number

  /** Rebatetax */
  rebateTax: number

  /** Salestax */
  salesTax: number

  /** Usetax */
  useTax: number

  /** Tradeintax */
  tradeInTax: number
}

export interface SaveOrderRequest {
  /** Vin */
  vin: string

  /** Productcode */
  productCode: string

  /** Productdisplayname */
  productDisplayName: string

  /** Mileage */
  mileage: number

  /** Odometer */
  odometer: number

  /** Dealercode */
  dealerCode: string

  /** Isnew */
  IsNew: boolean
  pricing: SaveOrderPricing
}

export interface SaveOrderResponse {
  /** Additionalfee */
  additionalFee: number

  /** Proposeddatetimeslots */
  proposedDateTimeSlots: string[]

  /**  Id */
  _id: string

  /** Vin */
  vin: string

  /** Productcode */
  productCode: string

  /** Productdisplayname */
  productDisplayName: string

  /** Mileage */
  mileage: number

  /** Odometer */
  odometer: number

  /** Dealercode */
  dealerCode: string

  /** Isnew */
  IsNew: boolean

  /** Dealtype */
  dealType: number
  pricing: SaveOrderPricingResponse

  /**  Customerid */
  _customerId: string

  /** State */
  state: string

  /** Fees */
  fees: ApplicableFeesSchema[]

  /**
   * Createdat
   * @format date-time
   */
  createdAt: string

  /**
   * Updatedat
   * @format date-time
   */
  updatedAt: string
}

export interface SaveOrderTradeInRequest {
  /** Vehicleid */
  vehicleId: string

  /** Year */
  year: number

  /** Makeid */
  makeId: string

  /** Make */
  make: string

  /** Modelid */
  modelId: string

  /** Model */
  model: string

  /** Trimid */
  trimId: string

  /** Trim */
  trim: string

  /** Odometer */
  odometer: number

  /** Vin */
  vin: string

  /** Zipcode */
  zipCode: string

  /** Condition */
  condition: string

  /** Tradeindocs */
  tradeInDocs: OrderTradeInDocs[]

  /** Isvehicledriveable */
  isVehicleDriveable: boolean

  /** Tradeinvehicleoptions */
  tradeInVehicleOptions: TradeInVehicleOptions[]
}

/**
* Represents a schedule information received from backend for
given order.
*/
export interface Schedule {
  /** Slots */
  slots: TimeSlot[]

  /**
   * Firstslot
   * First slot in a day (format: hh:mm)
   * @pattern ^\d{2}:\d{2}$
   */
  firstSlot: string

  /**
   * Lastslot
   * Last slot in a day (format: hh:mm)
   * @pattern ^\d{2}:\d{2}$
   */
  lastSlot: string

  /** Intervalinminutes */
  intervalInMinutes: number
}

/**
 * An enumeration.
 */
export enum ScheduledOptions {
  Pickup = 'Pickup',
  Delivery = 'Delivery',
  PickupDelivery = 'Pickup & Delivery',
}

export interface Secrets {
  /** Appinsights Instrumentationkey */
  APPINSIGHTS_INSTRUMENTATIONKEY?: string

  /** Storage Account Url */
  STORAGE_ACCOUNT_URL?: string
}

/**
 * Details of a set dealer product PEN SOAP call request.
 */
export interface SetDealerProductRequest {
  /** Pendealerid */
  penDealerId: number

  /** Productid */
  productId: number

  /** Providerproductcode */
  providerProductCode?: string

  /** Contractprefixoverride */
  ContractPrefixOverride?: string

  /** Productname */
  productName: string

  /** Producttype */
  productType: string

  /** Providerdealercodeformat */
  providerDealerCodeFormat: string

  /** Providerdealercodename */
  providerDealerCodeName: string

  /** Providerid */
  providerId: number

  /** Ratingmethods */
  ratingMethods: RatingMethod[]

  /** Regexpvalidator */
  regExpValidator: string

  /** Validatorprompt */
  validatorPrompt: string

  /** Dealercode */
  dealerCode: string

  /** Productnameforcustomer */
  productNameForCustomer: string

  /** Productdescription */
  productDescription: string

  /** Providername */
  providerName: string

  /** Isactive */
  isActive: boolean

  /** Markup */
  markup: number

  /** Action */
  action: string

  /** Marketing */
  marketing?: PenMarketingMaterial[]

  /** Images */
  images: FnIProductImage[]

  /** Providerdealercode */
  providerDealerCode?: string

  /** Dealerfniproductid */
  dealerFniProductId?: string
  customerProductType: CodeDisplayName
}

/**
 * Details of a set dealer PEN SOAP call request.
 */
export interface SetDealerRequest {
  /** Action */
  action: string

  /** Pendealerid */
  penDealerId: number

  /** Dealershipname */
  dealershipName: string

  /** Address1 */
  address1: string

  /** Address2 */
  address2: string

  /** City */
  city: string

  /** State */
  state: string

  /** Zipcode */
  zipCode: string

  /** Phone */
  phone: string

  /** Fax */
  fax: string

  /** Email */
  email: string

  /** Contactname */
  contactName: string

  /** Website */
  website: string

  /** Timezone */
  timeZone: string

  /** Observesdaylightsaving */
  observesDayLightSaving: boolean

  /** Istestdealer */
  isTestDealer: boolean

  /** Dealercode */
  dealerCode: string
}

/**
* Details of a set dealer PEN SOAP call response. It'll be returned
in register/update/un-register dealer.
*/
export interface SetDealerResponse {
  /** Pendealerid */
  penDealerId: number
}

export interface SignContractRequest {
  /**  Orderid */
  _orderId: string

  /**  Documentid */
  _documentId: string

  /** BusinessParty Type */
  userType: BusinessPartyType
}

export interface SignatureRequest {
  /** Signature Type */
  type: SignatureType

  /** Imagename */
  imageName: string

  /** BusinessParty Type */
  userType: BusinessPartyType
}

/**
 * Signature Type
 */
export enum SignatureType {
  Initial = 'Initial',
  FullName = 'FullName',
}

/**
 * An object representing user signatures.
 */
export interface Signatures {
  /** Initial */
  initial?: string

  /** Fullname */
  fullName?: string

  /** Initialurl */
  initialUrl?: string

  /** Fullnameurl */
  fullNameUrl?: string
}

/**
 * An object representing general configuration of a single dealership.
 */
export interface SignaturesConfig {
  /** An object representing user signatures. */
  signatures: Signatures
}

/**
 * An enumeration.
 */
export enum SocialMedia {
  Facebook = 'facebook',
  Google = 'google',
  Instagram = 'instagram',
  Linkedin = 'linkedin',
  Twitter = 'twitter',
  Youtube = 'youtube',
}

export interface SpecificMinimumFinances {
  /** Compatiblemodels */
  compatibleModels: CodeDisplayName[]

  /** Minfinancedamount */
  minFinancedAmount: number

  /**  Id */
  _id: string
}

export interface SuggestedRate {
  /** Allowed Gap */
  allowed_gap: boolean
}

export interface TCharges {
  /** Over Travelled Charges */
  over_travelled_charges: number
}

export interface Tax {
  /** Taxcode */
  taxCode: string

  /** Taxdisplayname */
  taxDisplayName: string

  /** Amount */
  amount: number
}

export interface TenantConfig {
  /**  Id */
  _id: string
  configuration: Configuration

  /** Isactive */
  isActive: boolean

  /** Name */
  name: string

  /** Tenantid */
  tenantId: string

  /** Privatestoragecontainername */
  privateStorageContainerName: string

  /** Publicstoragecontainername */
  publicStorageContainerName: string

  /**
   * Createdat
   * @format date-time
   */
  createdAt: string

  /**
   * Updatedat
   * @format date-time
   */
  updatedAt: string
}

export interface Theme {
  /** Banners */
  banners: string[]

  /** Color */
  color: string

  /** Logo */
  logo: string
}

export interface TimeSlot {
  /**
   * Timeslot
   * @format date-time
   */
  timeSlot: string

  /**
   * State of a slot in schedule.
   *
   * At some point dealer will pick several time slots when a customer
   * can pick up their car (or when it  can be delivered).
   * Those slots will be displayed in three states:
   * 1. `free`: slot is completely free
   * 2. `unconfirmed`: given slot was proposed to some customers, but nothing was scheduled
   *   at that slot yet.
   * 3. `taken`: there is at least one pickup/delivery scheduled in this time slot.
   */
  state: TimeSlotState
}

/**
* State of a slot in schedule.

At some point dealer will pick several time slots when a customer
can pick up their car (or when it  can be delivered).

Those slots will be displayed in three states:

1. `free`: slot is completely free
2. `unconfirmed`: given slot was proposed to some customers, but nothing was scheduled
  at that slot yet.
3. `taken`: there is at least one pickup/delivery scheduled in this time slot.
*/
export enum TimeSlotState {
  Taken = 'Taken',
  UnConfirmed = 'UnConfirmed',
  Free = 'Free',
}

export interface TimeSlotsProposedInput {
  /** Proposeddatetimeslots */
  proposedDateTimeSlots: string[]
}

export interface TradeInAssetCondition {
  /** Label */
  label: string

  /** Selectedvalue */
  selectedValue: string
}

export interface TradeInAssetConditionForm {
  /** Formfieldsvalues */
  formFieldsValues: TradeInAssetCondition[]
}

export interface TradeInLeaseBalance {
  /** Contractno */
  contractNo: string

  /** Lendername */
  lenderName: string

  /** Lenderphysicaladdress */
  lenderPhysicalAddress: string

  /** Lenderphoneno */
  lenderPhoneNo: string

  /** Leasebalance */
  leaseBalance: number

  /** Previousleasebalance */
  previousLeaseBalance?: number

  /** Paymenttype */
  paymentType: string
}

export interface TradeInMake {
  /** Makeid */
  makeId: string

  /** Makename */
  makeName: string
}

export interface TradeInModel {
  /** Modelid */
  modelId: string

  /** Modelname */
  modelName: string

  /** Modelmarketname */
  modelMarketName: string

  /** Makeid */
  makeId: string

  /** Makename */
  makeName: string
}

export interface TradeInOptionsFilter {
  /** Vehicleid */
  vehicleId: string

  /** Year */
  year: string

  /** Makeid */
  makeId: string

  /** Modelid */
  modelId: string

  /** Trimid */
  trimId: string
}

export interface TradeInTrim {
  /** Trimid */
  trimId: string

  /** Trimname */
  trimName: string

  /** Vehicleclass */
  vehicleClass: string

  /** Modelyearid */
  modelYearId: string

  /** Yearid */
  yearId: string

  /** Makeid */
  makeId: string

  /** Makename */
  makeName: string

  /** Modelid */
  modelId: string

  /** Modelname */
  modelName: string

  /** Modelplustrimname */
  modelPlusTrimName: string

  /** Sortorder */
  sortOrder: number
}

export interface TradeInValuesFilter {
  /** Yearid */
  yearId: string

  /** Makeid */
  makeId: string

  /** Modelid */
  modelId: string
}

export interface TradeInVehicleOptions {
  /** Vehicleoptionid */
  vehicleOptionId: string

  /** Optiontype */
  optionType: string

  /** Optionname */
  optionName: string

  /** Categorygroup */
  categoryGroup: string

  /** Categoryname */
  categoryName: string

  /** Sortorder */
  sortOrder: number

  /** Isconsumer */
  isConsumer: boolean

  /** Istypical */
  isTypical: boolean

  /** Isconfigurable */
  isConfigurable: boolean

  /** Hasrelationships */
  hasRelationships: boolean
}

export interface TradeInYear {
  /** Yearid */
  yearId: string
}

/**
 * A result of all transition calls.
 */
export interface TransitionResult {
  /** Success */
  success: boolean
}

export interface Units {
  /** Distance */
  distance: string

  /** Fuel */
  fuel: string
}

export interface UpdateDailyParams {
  /** Vin */
  vin: string

  /** Dailyinventoryupdate */
  dailyInventoryUpdate: boolean
}

export interface UpdateOrderRequest {
  /** Mileage */
  mileage: number

  /** Odometer */
  odometer: number
}

export interface UpdateOrderTradeInRequest {
  /** Comment */
  comment?: string

  /** Tradeinbalance */
  tradeInBalance: number

  /** Leasebalance */
  leaseBalance?: number
}

export interface UpdateParams {
  /** Vin */
  vin: string

  /** Publish */
  publish: boolean
}

export interface UpdatePriceParams {
  /** Vin */
  vin: string

  /** Internetprice */
  internetPrice: number
}

export interface UpdateTaxesParams {
  /** Taxonsellingprice */
  taxOnSellingPrice?: number

  /** Taxondealerfee */
  taxOnDealerFee?: number

  /** Taxonfniproducts */
  taxOnFnIProducts?: number

  /** Taxonnegativetradein */
  taxOnNegativeTradeIn?: number

  /** Taxoncapitalizedcostreduction */
  taxOnCapitalizedCostReduction?: number
}

export interface VINDecodedVehicle {
  /** Vehicleid */
  vehicleId: string

  /** Makeid */
  makeId: string

  /** Modelid */
  modelId: string

  /** Trimid */
  trimId: string

  /** Year */
  year: number

  /** Make */
  make: string

  /** Model */
  model: string

  /** Trim */
  trim: string
}

export interface ValidationError {
  /** Location */
  loc: string[]

  /** Message */
  msg: string

  /** Error Type */
  type: string
}

export interface VehicleAccessories {
  /**  Accessoryid */
  _accessoryId: string

  /** Description */
  description: string

  /** Name */
  name: string
  category: CodeDisplayName

  /** Price */
  price: number

  /** Supplier */
  supplier: string
  installationMode: CodeDisplayName

  /** Residualvalueadder */
  residualValueAdder: number
}

export interface VehicleDetails {
  /**  Id */
  _id: string

  /** Stocknumber */
  stockNumber: string

  /** Optionaldescription */
  optionalDescription: string[]

  /** Vin */
  vin: string

  /** Year */
  year: number

  /** Make */
  make: string

  /** Model */
  model: string

  /** Makemodel */
  makeModel: string

  /** Bodystyle */
  bodyStyle: string

  /** Trimdescription */
  trimDescription?: string

  /** Dealercode */
  dealerCode: string

  /** Transmissiontype */
  transmissionType: string

  /** Internetprice */
  internetPrice: number

  /** Mileage */
  mileage: number

  /** Msrp */
  msrp: number

  /** Doingbusinessas */
  doingBusinessAs: string

  /** Addresstitle */
  addressTitle?: string

  /** Address */
  address: string

  /** City */
  city: string

  /** State */
  state: string

  /** Zip */
  zip: number

  /** Phonenumber */
  phoneNumber: number

  /** Fax */
  fax: number

  /** Email */
  email: string

  /** Contactname */
  contactName: string

  /** Dealerurl */
  dealerURL: string

  /** Price2 */
  price2: number

  /** Exteriorcolordescription */
  exteriorColorDescription: string

  /** Interiorcolordescription */
  interiorColorDescription: string

  /** Vehiclecomments */
  vehicleComments: string

  /** Type */
  type: number

  /** Bodytype */
  bodyType: string

  /** Transmissionspeed */
  transmissionSpeed?: number

  /** Transmissiondescription */
  transmissionDescription: string

  /** Enginecylinders */
  engineCylinders: number

  /** Doors */
  doors: number

  /** Enginedescription */
  engineDescription: string

  /** Vehicleclass */
  vehicleClass?: string

  /** Enginepower */
  enginePower: number

  /** Engineconfiguration */
  engineConfiguration: string

  /** Enginedisplacement */
  engineDisplacement: number

  /** Engineinduction */
  engineInduction: string

  /** Fueltype */
  fuelType: string

  /** Warranty */
  warranty: string

  /**
   * Lastmodified
   * @format date-time
   */
  lastModified: string

  /** Exteriorcolormanufacturercode */
  exteriorColorManufacturerCode: string

  /** Interiorcolormanufacturercode */
  interiorColorManufacturerCode: string

  /** Packagesandoptiondescription */
  packagesAndOptionDescription: Package[]

  /** Stockphotos */
  stockPhotos: string[]

  /** Photourls */
  photoUrls: string[]

  /** Vehicleurl */
  vehicleURL: string[]

  /** Isdeleted */
  isDeleted: boolean

  /** Isupdated */
  isUpdated: boolean

  /** Containerfilename */
  containerFileName: string

  /** Publish */
  publish: boolean

  /** Status */
  status: string

  /**
   * Loadedon
   * @format date-time
   */
  loadedOn: string

  /**
   * Createdat
   * @format date-time
   */
  createdAt: string

  /**
   * Updatedat
   * @format date-time
   */
  updatedAt: string

  /** Generalconfigurations */
  generalConfigurations: object

  /** Typename */
  typeName: string

  /** Nonpackageoptioncodes */
  nonPackageOptionCodes?: string[]

  /** Nonpackageoptiondescriptions */
  nonPackageOptionDescriptions?: string[]

  /** Vehicledisplayname */
  vehicleDisplayName?: string

  /** Drivetrain */
  driveTrain?: string

  /** Commentsfrommini */
  commentsFromMini?: string
}

export interface VerificationConfig {
  mobile: Mobile
  email: Email
}

export interface VerificationDurations {
  /** Emailtokenvalidity */
  emailTokenValidity: number

  /** Phonenumbertokenvalidity */
  phoneNumberTokenValidity: number
}

export interface Verifications {
  /** Email */
  email: boolean

  /** Mobile */
  mobile: boolean
}

export interface WatermarkedContractDocument {
  /**  Id */
  _id: string

  /** Name */
  name: string

  /** Path */
  path?: string
}

export interface VehicleHandOverObject {
  /**  Orderids */
  _orderIds: string[]

  /** State */
  state: string

  /**
   * Timeslot
   * @format date-time
   */
  timeSlot: string
}

export interface FNIProductDetail {
  _id: string
  dealerCode: string
  isActive: boolean
  markup: number
  penDealerId: number
  productDescription: string
  productId: number
  productName: string
  productNameForCustomer: string
  productType: string
  providerDealerCode: string
  providerDealerCodeFormat: string
  providerDealerCodeName: string
  providerId: number
  providerName: string
  images: { name: string; path: string }[]
  marketing: { name: string; url: string; _id: string }[]
  ratingProperties: string[]
  customerProductType: {
    code: string
    displayName: string
  }
}

export interface CoverageForm {
  formId: number
  name: string
  number: string
}

export interface Surcharged {
  code: string
  description: string
  optional: string
  dealerCost: string
  retailPrice: number
}

export interface FNIProductCoverage {
  coverageName: string
  expirationDate?: Date
  expirationMiles: Date
  form: CoverageForm
  limitedWarranty?: any
  newUsed?: string
  productType: string
  redemptions?: any
  surcharges?: Surcharged[]
  termsMiles: number
  termsMonths: number
  amount: number
  dealerCost: number
  deductibleType: string
  description: string
  fiMarkup: number
  minRetailPrice: number
  maxRetailPrice: number
  rateId: number
  reducedAmount: number
  retailPrice: number
  isAdded: boolean
  [prop: string]: any
}

export interface FNIProductRate {
  productId: number
  productType: number
  sessionId: string
  includePrices: boolean
  coverages: FNIProductCoverage[]
  dealerProductDetails: FNIProductDetail
  [prop: string]: any
}

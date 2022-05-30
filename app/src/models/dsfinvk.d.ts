/**
 * Common fields for all csv files
 */
export interface CommonFields {
  Z_KASSE_ID: string;
  Z_ERSTELLUNG: string;
  Z_NR: number;
  BON_ID?: string;
}
/**
 * Datei "Stamm_Abschluss" (cashpointclosing.csv)
 */
export interface CashpointclosingCsv extends CommonFields {
  Z_BUCHUNGSTAG: string;
  TAXONOMIE_VERSION: string;
  Z_START_ID: string;
  Z_ENDE_ID: string;
  NAME: string;
  STRASSE: string;
  PLZ: string;
  ORT: string;
  LAND: string;
  STNR: string;
  USTID: string;
  Z_SE_ZAHLUNGEN: string;
  Z_SE_BARZAHLUNGEN: string;
}

/**
 * Datei "Stamm_Orte" (location.csv)
 */
export interface LocationCsv extends CommonFields {
  LOC_NAME: string;
  LOC_STRASSE: string;
  LOC_PLZ: string;
  LOC_ORT: string;
  LOC_LAND: string;
  LOC_USTID: string;
}

/**
 * Datei "Stamm_Kassen" (cashregister.csv)
 */
export interface CashregisterCsv extends CommonFields {
  KASSE_BRAND: string;
  KASSE_MODELL: string;
  KASSE_SERIENNR: string;
  KASSE_SW_BRAND: string;
  KASSE_SW_VERSION: string;
  KASSE_BASISWAEH_CODE: string;
  KEINE_UST_ZUORDNUNG: '0' | '1' | '';
}

/**
 * Datei "Stamm_Terminals" (slaves.csv)
 */
export interface SlavesCsv extends CommonFields {
  TERMINAL_ID: string;
  TERMINAL_BRAND: string;
  TERMINAL_MODELL: string;
  TERMINAL_SERIENNR: string;
  TERMINAL_SW_BRAND: string;
  TERMINAL_SW_VERSION: string;
}

/**
 * Datei "Stamm_Agenturen" (pa.csv)
 */
export interface PaCsv extends CommonFields {
  AGENTUR_ID: number;
  AGENTUR_NAME: string;
  AGENTUR_STRASSE: string;
  AGENTUR_PLZ: string;
  AGENTUR_ORT: string;
  AGENTUR_LAND: string;
  AGENTUR_STNR: string;
  AGENTUR_USTID: string;
}

/**
 * Datei "Stamm_USt" (vat.csv)
 */
export interface VatCsv extends CommonFields {
  UST_SCHLUESSEL: number;
  UST_SATZ: number | string; // formatted number
  UST_BESCHR: string;
}

/**
 * Datei "Stamm_TSE" (tse.csv)
 */
export interface TseCsv extends CommonFields {
  TSE_ID: number;
  TSE_SERIAL: string;
  TSE_SIG_ALGO: string;
  TSE_ZEITFORMAT: string;
  TSE_PD_ENCODING: string;
  TSE_PUBLIC_KEY: string;
  TSE_ZERTIFIKAT_I: string;
  TSE_ZERTIFIKAT_II: string;
  TSE_ZERTIFIKAT_III?: string;
  TSE_ZERTIFIKAT_IV?: string;
  TSE_ZERTIFIKAT_V?: string;
}

/**
 * Datei "Z_GV_TYP" (businesscases.csv)
 */
export interface BusinesscasesCsv extends CommonFields {
  GV_TYP: string;
  GV_NAME: string;
  AGENTUR_ID: number;
  UST_SCHLUESSEL: number;
  Z_UMS_BRUTTO: number;
  Z_UMS_NETTO: number;
  Z_UST: number;
}

/**
 * Datei "Z_Zahlart" (payment.csv)
 */
export interface PaymentCsv extends CommonFields {
  ZAHLART_TYP: string;
  ZAHLART_NAME: string;
  Z_ZAHLART_BETRAG: string; // fixed number
}

/**
 *  Datei "Z_WAEHRUNGEN" (cash_per_currency.csv)
 */
export interface CashPerCurrencyCsv extends CommonFields {
  ZAHLART_WAEH: string;
  ZAHLART_BETRAG_WAEH: number;
}

/**
 *  Datei "Bonkopf" (transactions.csv)
 */
export interface TransactionsCsv extends CommonFields {
  BON_ID: string;
  BON_NR: number;
  BON_TYP: string;
  BON_NAME: string;
  TERMINAL_ID: string;
  BON_STORNO: '0' | '1' | '';
  BON_START: string;
  BON_ENDE: string;
  BEDIENER_ID: string;
  BEDIENER_NAME: string;
  UMS_BRUTTO: string; // fixed number
  KUNDE_NAME: string;
  KUNDE_ID: string;
  KUNDE_TYP: string;
  KUNDE_STRASSE: string;
  KUNDE_PLZ: string;
  KUNDE_ORT: string;
  KUNDE_LAND: string;
  KUNDE_USTID: string;
  BON_NOTIZ: string;
}

/**
 *  Datei "Bonkopf_AbrKreis" (allocation_groups.csv)
 */
export interface AllocationGroupsCsv extends CommonFields {
  BON_ID: string;
  ABRECHNUNGSKREIS: string;
}

/**
 *  Datei "Bonkopf_USt" (transactions_vat.csv)
 */
export interface TransactionsVatCsv extends CommonFields {
  BON_ID: string;
  UST_SCHLUESSEL: number;
  BON_BRUTTO: number;
  BON_NETTO: number;
  BON_UST: number;
  BON_NOTIZ: string;
}

/**
 *  Datei "Bonkopf_Zahlarten" (datapayment.csv)
 */
export interface DatapaymentCsv extends CommonFields {
  BON_ID: string;
  ZAHLART_TYP: string;
  ZAHLART_NAME: string;
  ZAHLWAEH_CODE: string;
  ZAHLWAEH_BETRAG: string; // fixed number
  BASISWAEH_BETRAG: string; // fixed number
}

/**
 *  Datei "Bonpos" (lines.csv)
 */
export interface LinesCsv extends CommonFields {
  BON_ID: string;
  POS_ZEILE: string;
  GUTSCHEIN_NR: string;
  ARTIKELTEXT: string;
  POS_TERMINAL_ID: string;
  GV_TYP: string;
  GV_NAME: string;
  INHAUS: '0' | '1' | '';
  P_STORNO: '0' | '1' | '';
  AGENTUR_ID: string;
  ART_NR: string;
  GTIN: string;
  WARENGR_ID: string;
  WARENGR: string;
  MENGE: number | string; // formatted number
  FAKTOR: number | string; // formatted number
  EINHEIT: string;
  STK_BR: number | string; // formatted number
}

/**
 *  Datei "Bonpos_USt" (lines_vat.csv)
 */
export interface LinesVatCsv extends CommonFields {
  BON_ID: string;
  POS_ZEILE: string;
  UST_SCHLUESSEL: number;
  POS_BRUTTO: number | string; // formatted number
  POS_NETTO: number | string; // formatted number
  POS_UST: number | string; // formatted number
}

/**
 *  Datei "Bonpos_Preisfindung" (itemamounts.csv)
 */
export interface ItemamountsCsv extends CommonFields {
  BON_ID: string;
  POS_ZEILE: string;
  TYP: string;
  UST_SCHLUESSEL: number;
  PF_BRUTTO: number;
  PF_NETTO: number;
  PF_UST: number;
}

/**
 *  Datei "Bonpos_Zusatzinfo" (subitems.csv)
 */
export interface SubitemsCsv extends CommonFields {
  BON_ID: string;
  POS_ZEILE: string;
  ZI_ART_NR: string;
  ZI_GTIN: string;
  ZI_NAME: string;
  ZI_MENGE: number;
  ZI_FAKTOR: number;
  ZI_EINHEIT: string;
  ZI_WARENGR_ID: string;
  ZI_WARENGR: string;
  ZI_UST_SCHLUESSEL: number;
  ZI_BASISPREIS_BRUTTO: number;
  ZI_BASISPREIS_NETTO: number;
  ZI_BASISPREIS_UST: number;
}

/**
 *  Datei "Bon_Referenzen" (references.csv)
 */
export interface ReferencesCsv extends CommonFields {
  BON_ID: string;
  POS_ZEILE: string;
  REF_TYP: string;
  REF_NAME: string;
  REF_DATUM: string;
  REF_Z_KASSE_ID: string;
  REF_Z_NR: number;
  REF_BON_ID: string;
}

/**
 *  Datei "TSE_Transaktionen" (transactions_tse.csv)
 */
export interface TransactionsTseCsv extends CommonFields {
  BON_ID: string;
  TSE_ID: number;
  TSE_TANR: number | string;
  TSE_TA_START: string;
  TSE_TA_ENDE: string;
  TSE_TA_VORGANGSART: string;
  TSE_TA_SIGZ: number | string;
  TSE_TA_SIG: string;
  TSE_TA_FEHLER: string;
  TSE_VORGANGSDATEN: string;
}

export type DsfinvkCsvRecord =
  | CashpointclosingCsv
  | LocationCsv
  | CashregisterCsv
  | SlavesCsv
  | PaCsv
  | VatCsv
  | TseCsv
  | BusinesscasesCsv
  | CashPerCurrencyCsv
  | PaymentCsv
  | TransactionsCsv
  | AllocationGroupsCsv
  | TransactionsTseCsv
  | TransactionsVatCsv
  | LinesCsv
  | LinesVatCsv
  | ItemamountsCsv
  | SubitemsCsv
  | DatapaymentCsv
  | ReferencesCsv;

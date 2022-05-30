CREATE TABLE stamm_abschluss (
  z_kasse_id VARCHAR(50),
  z_erstellung VARCHAR(30),
  z_nr INTEGER,
  z_buchungstag VARCHAR(25),
  taxonomie_version VARCHAR(10),
  z_start_id VARCHAR(40),
  z_ende_id VARCHAR(40),
  name VARCHAR(60),
  strasse VARCHAR(60),
  plz VARCHAR(10),
  ort VARCHAR(62),
  land VARCHAR(3),
  stnr VARCHAR(20),
  ustid VARCHAR(15),
  z_se_zahlungen NUMERIC(2),
  z_se_barzahlungen NUMERIC(2)
);

CREATE TABLE stamm_orte (
  z_kasse_id VARCHAR(50),
  z_erstellung VARCHAR(30),
  z_nr INTEGER,
  loc_name VARCHAR(60),
  loc_strasse VARCHAR(60),
  loc_plz VARCHAR(10),
  loc_ort VARCHAR(62),
  loc_land VARCHAR(3),
  loc_ustid VARCHAR(15)
);

CREATE TABLE stamm_kassen (
  z_kasse_id VARCHAR(50),
  z_erstellung VARCHAR(30),
  z_nr INTEGER,
  kasse_brand VARCHAR(50),
  kasse_modell VARCHAR(50),
  kasse_seriennr VARCHAR(70),
  kasse_sw_brand VARCHAR(50),
  kasse_sw_version VARCHAR(50),
  kasse_basiswaeh_code VARCHAR(3),
  keine_ust_zuordnung VARCHAR(1)
);

CREATE TABLE stamm_terminals (
  z_kasse_id VARCHAR(50),
  z_erstellung VARCHAR(30),
  z_nr INTEGER,
  terminal_id VARCHAR(50),
  terminal_brand VARCHAR(50),
  terminal_modell VARCHAR(50),
  terminal_seriennr VARCHAR(50),
  terminal_sw_brand VARCHAR(50),
  terminal_sw_version VARCHAR(50)
);

CREATE TABLE stamm_agenturen (
  z_kasse_id VARCHAR(50),
  z_erstellung VARCHAR(30),
  z_nr INTEGER,
  agentur_id INTEGER,
  agentur_name VARCHAR(60),
  agentur_strasse VARCHAR(60),
  agentur_plz VARCHAR(10),
  agentur_ort VARCHAR(62),
  agentur_land VARCHAR(3),
  agentur_stnr VARCHAR(20),
  agentur_ustid VARCHAR(15)
);

CREATE TABLE stamm_tse (
  z_kasse_id VARCHAR(50),
  z_erstellung VARCHAR(30),
  z_nr INTEGER,
  tse_id INTEGER,
  tse_serial VARCHAR(68),
  tse_sig_algo VARCHAR(21),
  tse_zeitformat VARCHAR(31),
  tse_pd_encoding VARCHAR(5),
  tse_public_key VARCHAR(512),
  tse_zertifikat_i VARCHAR(1000),
  tse_zertifikat_ii VARCHAR(1000)
);

CREATE TABLE stamm_ust (
  z_kasse_id VARCHAR(50),
  z_erstellung VARCHAR(30),
  z_nr INTEGER,
  ust_schluessel INTEGER,
  ust_satz NUMERIC(2),
  ust_beschr VARCHAR(55)
);

CREATE TABLE z_gv_typ (
  z_kasse_id VARCHAR(50),
  z_erstellung VARCHAR(30),
  z_nr INTEGER,
  gv_typ VARCHAR(30),
  gv_name VARCHAR(40),
  agentur_id INTEGER,
  ust_schluessel INTEGER,
  z_ums_brutto NUMERIC(5),
  z_ums_netto NUMERIC(5),
  z_ust NUMERIC(5)
);

CREATE TABLE z_zahlart (
  z_kasse_id VARCHAR(50),
  z_erstellung VARCHAR(30),
  z_nr INTEGER,
  zahlart_typ VARCHAR(25),
  zahlart_name VARCHAR(60),
  z_zahlart_betrag NUMERIC(2)
);

CREATE TABLE z_waehrungen (
  z_kasse_id VARCHAR(50),
  z_erstellung VARCHAR(30),
  z_nr INTEGER,
  zahlart_waeh VARCHAR(3),
  zahlart_betrag_waeh NUMERIC(2)
);

CREATE TABLE bonkopf (
  z_kasse_id VARCHAR(50),
  z_erstellung VARCHAR(30),
  z_nr INTEGER,
  bon_id VARCHAR(40),
  bon_nr INTEGER,
  bon_typ VARCHAR(30),
  bon_name VARCHAR(60),
  terminal_id VARCHAR(50),
  bon_storno VARCHAR(1),
  bon_start VARCHAR(30),
  bon_ende VARCHAR(30),
  bediener_id VARCHAR(50),
  bediener_name VARCHAR(50),
  ums_brutto NUMERIC(2),
  kunde_name VARCHAR(50),
  kunde_id VARCHAR(50),
  kunde_typ VARCHAR(50),
  kunde_strasse VARCHAR(60),
  kunde_plz VARCHAR(10),
  kunde_ort VARCHAR(62),
  kunde_land VARCHAR(3),
  kunde_ustid VARCHAR(15),
  bon_notiz VARCHAR(255)
);

CREATE TABLE bonkopf_zahlarten (
  z_kasse_id VARCHAR(50),
  z_erstellung VARCHAR(30),
  z_nr INTEGER,
  bon_id VARCHAR(40),
  zahlart_typ VARCHAR(25),
  zahlart_name VARCHAR(60),
  zahlwaeh_code VARCHAR(3),
  zahlwaeh_betrag NUMERIC(2),
  basiswaeh_betrag NUMERIC(2)
);

CREATE TABLE bonpos (
  z_kasse_id VARCHAR(50),
  z_erstellung VARCHAR(30),
  z_nr INTEGER,
  bon_id VARCHAR(40),
  pos_zeile VARCHAR(50),
  gutschein_nr VARCHAR(50),
  artikeltext VARCHAR(255),
  pos_terminal_id VARCHAR(50),
  gv_typ VARCHAR(30),
  gv_name VARCHAR(40),
  inhaus VARCHAR(1),
  p_storno VARCHAR(1),
  agentur_id INTEGER,
  art_nr VARCHAR(50),
  gtin VARCHAR(50),
  warengr_id VARCHAR(40),
  warengr VARCHAR(50),
  menge NUMERIC(3),
  faktor NUMERIC(3),
  einheit VARCHAR(50),
  stk_br NUMERIC(5)
);

CREATE TABLE bonpos_preisfindung (
  z_kasse_id VARCHAR(50),
  z_erstellung VARCHAR(30),
  z_nr INTEGER,
  bon_id VARCHAR(40),
  pos_zeile VARCHAR(50),
  typ VARCHAR(20),
  ust_schluessel INTEGER,
  pf_brutto NUMERIC(5),
  pf_netto NUMERIC(5),
  pf_ust NUMERIC(5)
);

CREATE TABLE bonpos_zusatzinfo (
  z_kasse_id VARCHAR(50),
  z_erstellung VARCHAR(30),
  z_nr INTEGER,
  bon_id VARCHAR(40),
  pos_zeile VARCHAR(50),
  zi_art_nr VARCHAR(50),
  zi_gtin VARCHAR(50),
  zi_name VARCHAR(60),
  zi_warengr_id VARCHAR(40),
  zi_warengr VARCHAR(50),
  zi_menge NUMERIC(3),
  zi_faktor NUMERIC(3),
  zi_einheit VARCHAR(50),
  zi_ust_schluessel INTEGER,
  zi_basispreis_brutto NUMERIC(5),
  zi_basispreis_netto NUMERIC(5),
  zi_basispreis_ust NUMERIC(5)
);

CREATE TABLE tse_transaktionen (
  z_kasse_id VARCHAR(50),
  z_erstellung VARCHAR(30),
  z_nr INTEGER,
  bon_id VARCHAR(40),
  tse_id INTEGER,
  tse_tanr INTEGER,
  tse_ta_start VARCHAR(30),
  tse_ta_ende VARCHAR(30),
  tse_ta_vorgangsart VARCHAR(30),
  tse_ta_sigz INTEGER,
  tse_ta_sig VARCHAR(512),
  tse_ta_fehler VARCHAR(200),
  tse_vorgangsdaten VARCHAR(1000)
);

CREATE TABLE bonkopf_ust (
  z_kasse_id VARCHAR(50),
  z_erstellung VARCHAR(30),
  z_nr INTEGER,
  bon_id VARCHAR(40),
  ust_schluessel INTEGER,
  bon_brutto NUMERIC(5),
  bon_netto NUMERIC(5),
  bon_ust NUMERIC(5)
);

CREATE TABLE bonpos_ust (
  z_kasse_id VARCHAR(50),
  z_erstellung VARCHAR(30),
  z_nr INTEGER,
  bon_id VARCHAR(40),
  pos_zeile VARCHAR(50),
  ust_schluessel INTEGER,
  pos_brutto NUMERIC(5),
  pos_netto NUMERIC(5),
  pos_ust NUMERIC(5)
);

CREATE TABLE bonkopf_abrkreis (
  z_kasse_id VARCHAR(50),
  z_erstellung VARCHAR(30),
  z_nr INTEGER,
  bon_id VARCHAR(40),
  abrechnungskreis VARCHAR(50)
);

CREATE TABLE bon_referenzen (
  z_kasse_id VARCHAR(50),
  z_erstellung VARCHAR(30),
  z_nr INTEGER,
  bon_id VARCHAR(40),
  pos_zeile VARCHAR(50),
  ref_typ VARCHAR(20),
  ref_name VARCHAR(40),
  ref_datum VARCHAR(30),
  ref_z_kasse_id VARCHAR(50),
  ref_z_nr INTEGER,
  ref_bon_id VARCHAR(40)
);



COMMENT ON COLUMN stamm_abschluss.z_kasse_id IS $$ID der (Abschluss-) Kasse$$;
COMMENT ON COLUMN stamm_abschluss.z_erstellung IS $$Zeitpunkt des Kassenabschlusses$$;
COMMENT ON COLUMN stamm_abschluss.z_nr IS $$Nr. des Kassenabschlusses$$;
COMMENT ON COLUMN stamm_abschluss.z_buchungstag IS $$Vom Erstellungsdatum abweichender Verbuchungstag$$;
COMMENT ON COLUMN stamm_abschluss.taxonomie_version IS $$Version der DFKA-Taxonomie-Kasse$$;
COMMENT ON COLUMN stamm_abschluss.z_start_id IS $$Erste BON_ID im Abschluss$$;
COMMENT ON COLUMN stamm_abschluss.z_ende_id IS $$Letzte BON_ID im Abschluss$$;
COMMENT ON COLUMN stamm_abschluss.name IS $$Name des Unternehmens$$;
COMMENT ON COLUMN stamm_abschluss.strasse IS $$Straße$$;
COMMENT ON COLUMN stamm_abschluss.plz IS $$Postleitzahl$$;
COMMENT ON COLUMN stamm_abschluss.ort IS $$Ort$$;
COMMENT ON COLUMN stamm_abschluss.land IS $$Land$$;
COMMENT ON COLUMN stamm_abschluss.stnr IS $$Steuernummer des Unternehmens$$;
COMMENT ON COLUMN stamm_abschluss.ustid IS $$USTID$$;
COMMENT ON COLUMN stamm_abschluss.z_se_zahlungen IS $$Summe aller Zahlungen$$;
COMMENT ON COLUMN stamm_abschluss.z_se_barzahlungen IS $$Summe aller Barzahlungen$$;
COMMENT ON TABLE stamm_abschluss IS $$cashpointclosing.csv$$;
COMMENT ON COLUMN stamm_orte.z_kasse_id IS $$ID der (Abschluss-) Kasse$$;
COMMENT ON COLUMN stamm_orte.z_erstellung IS $$Zeitpunkt des Kassenabschlusses$$;
COMMENT ON COLUMN stamm_orte.z_nr IS $$Nr. des Kassenabschlusses$$;
COMMENT ON COLUMN stamm_orte.loc_name IS $$Name des Standortes$$;
COMMENT ON COLUMN stamm_orte.loc_strasse IS $$Straße$$;
COMMENT ON COLUMN stamm_orte.loc_plz IS $$Postleitzahl$$;
COMMENT ON COLUMN stamm_orte.loc_ort IS $$Ort$$;
COMMENT ON COLUMN stamm_orte.loc_land IS $$Land$$;
COMMENT ON COLUMN stamm_orte.loc_ustid IS $$USTID$$;
COMMENT ON TABLE stamm_orte IS $$location.csv$$;
COMMENT ON COLUMN stamm_kassen.z_kasse_id IS $$ID der (Abschluss-) Kasse$$;
COMMENT ON COLUMN stamm_kassen.z_erstellung IS $$Zeitpunkt des Kassenabschlusses$$;
COMMENT ON COLUMN stamm_kassen.z_nr IS $$Nr. des Kassenabschlusses$$;
COMMENT ON COLUMN stamm_kassen.kasse_brand IS $$Marke der Kasse$$;
COMMENT ON COLUMN stamm_kassen.kasse_modell IS $$Modellbezeichnung$$;
COMMENT ON COLUMN stamm_kassen.kasse_seriennr IS $$Seriennummer der Kasse$$;
COMMENT ON COLUMN stamm_kassen.kasse_sw_brand IS $$Markenbezeichnung der Software$$;
COMMENT ON COLUMN stamm_kassen.kasse_sw_version IS $$Version der Software$$;
COMMENT ON COLUMN stamm_kassen.kasse_basiswaeh_code IS $$Basiswährung der Kasse$$;
COMMENT ON COLUMN stamm_kassen.keine_ust_zuordnung IS $$UmsatzsteuerNichtErmittelbar (bei späterem Zahlungseingang)$$;
COMMENT ON TABLE stamm_kassen IS $$cashregister.csv$$;
COMMENT ON COLUMN stamm_terminals.z_kasse_id IS $$ID der (Abschluss-) Kasse$$;
COMMENT ON COLUMN stamm_terminals.z_erstellung IS $$Zeitpunkt des Kassenabschlusses$$;
COMMENT ON COLUMN stamm_terminals.z_nr IS $$Nr. des Kassenabschlusses$$;
COMMENT ON COLUMN stamm_terminals.terminal_id IS $$ID des Terminals$$;
COMMENT ON COLUMN stamm_terminals.terminal_brand IS $$Marke der Terminals$$;
COMMENT ON COLUMN stamm_terminals.terminal_modell IS $$Modellbezeichnung des Terminals$$;
COMMENT ON COLUMN stamm_terminals.terminal_seriennr IS $$Seriennummer des Terminals$$;
COMMENT ON COLUMN stamm_terminals.terminal_sw_brand IS $$Markenbezeichnung der Software$$;
COMMENT ON COLUMN stamm_terminals.terminal_sw_version IS $$Version der Software$$;
COMMENT ON TABLE stamm_terminals IS $$slaves.csv$$;
COMMENT ON COLUMN stamm_agenturen.z_kasse_id IS $$ID der (Abschluss-) Kasse$$;
COMMENT ON COLUMN stamm_agenturen.z_erstellung IS $$Zeitpunkt des Kassenabschlusses$$;
COMMENT ON COLUMN stamm_agenturen.z_nr IS $$Nr. des Kassenabschlusses$$;
COMMENT ON COLUMN stamm_agenturen.agentur_id IS $$ID der Agentur$$;
COMMENT ON COLUMN stamm_agenturen.agentur_name IS $$Name des Auftraggebers$$;
COMMENT ON COLUMN stamm_agenturen.agentur_strasse IS $$Straße$$;
COMMENT ON COLUMN stamm_agenturen.agentur_plz IS $$Postleitzahl$$;
COMMENT ON COLUMN stamm_agenturen.agentur_ort IS $$Ort$$;
COMMENT ON COLUMN stamm_agenturen.agentur_land IS $$Land$$;
COMMENT ON COLUMN stamm_agenturen.agentur_stnr IS $$Steuernummer des Auftraggebers$$;
COMMENT ON COLUMN stamm_agenturen.agentur_ustid IS $$USTID des Auftraggebers$$;
COMMENT ON TABLE stamm_agenturen IS $$pa.csv$$;
COMMENT ON COLUMN stamm_tse.z_kasse_id IS $$ID der (Abschluss-) Kasse$$;
COMMENT ON COLUMN stamm_tse.z_erstellung IS $$Zeitpunkt des Kassenabschlusses$$;
COMMENT ON COLUMN stamm_tse.z_nr IS $$Nr. des Kassenabschlusses$$;
COMMENT ON COLUMN stamm_tse.tse_id IS $$ID der TSE - wird nur zur Referenzierung innerhalb eines Kassenabschlusses verwendet$$;
COMMENT ON COLUMN stamm_tse.tse_serial IS $$Seriennummer der TSE (Entspricht laut TR-03153 Abschnitt 7.5. dem Hashwert des im Zertifikat enthaltenen Schlüssels in Octet-String-Darstellung)$$;
COMMENT ON COLUMN stamm_tse.tse_sig_algo IS $$Der von der TSE verwendete Signaturalgo-rithmus$$;
COMMENT ON COLUMN stamm_tse.tse_zeitformat IS $$Das von der TSE verwendete Format für die Log-Time - 'unixTime', 'utcTime' = YYMMDDhhmmZ, 'utcTimeWithSeconds' = YYMMDDhhmmssZ, 'generalizedTime' = YYYYMMDDhhmmssZ, 'generalizedTimeWithMilliseconds' = YYYYMMDDhhmmss.fffZ$$;
COMMENT ON COLUMN stamm_tse.tse_pd_encoding IS $$Das Text-Encoding der ProcessData (UTF-8 oder ASCII)$$;
COMMENT ON COLUMN stamm_tse.tse_public_key IS $$Öffentlicher Schlüssel - extrahiert aus dem Zertifikat der TSE - in base64-Codierung$$;
COMMENT ON COLUMN stamm_tse.tse_zertifikat_i IS $$Erste 1000 Zeichen des base64-codierten Zertifikats der TSE (in base64-Codierung)$$;
COMMENT ON COLUMN stamm_tse.tse_zertifikat_ii IS $$Ggf. Rest des base64-codierten Zertifikats der TSE (in base64-Codierung)$$;
COMMENT ON TABLE stamm_tse IS $$tse.csv$$;
COMMENT ON COLUMN stamm_ust.z_kasse_id IS $$ID der (Abschluss-) Kasse$$;
COMMENT ON COLUMN stamm_ust.z_erstellung IS $$Zeitpunkt des Kassenabschlusses$$;
COMMENT ON COLUMN stamm_ust.z_nr IS $$Nr. des Kassenabschlusses$$;
COMMENT ON COLUMN stamm_ust.ust_schluessel IS $$ID des Umsatzsteuersatzes$$;
COMMENT ON COLUMN stamm_ust.ust_satz IS $$Prozentsatz$$;
COMMENT ON COLUMN stamm_ust.ust_beschr IS $$Beschreibung$$;
COMMENT ON TABLE stamm_ust IS $$vat.csv$$;
COMMENT ON COLUMN z_gv_typ.z_kasse_id IS $$ID der (Abschluss-) Kasse$$;
COMMENT ON COLUMN z_gv_typ.z_erstellung IS $$Zeitpunkt des Kassenabschlusses$$;
COMMENT ON COLUMN z_gv_typ.z_nr IS $$Nr. des Kassenabschlusses$$;
COMMENT ON COLUMN z_gv_typ.gv_typ IS $$Geschäftsvorfall-Art$$;
COMMENT ON COLUMN z_gv_typ.gv_name IS $$Name des Geschäftsvorfalls$$;
COMMENT ON COLUMN z_gv_typ.agentur_id IS $$ID der Agentur$$;
COMMENT ON COLUMN z_gv_typ.ust_schluessel IS $$ID des USt-Satzes$$;
COMMENT ON COLUMN z_gv_typ.z_ums_brutto IS $$Bruttoumsatz$$;
COMMENT ON COLUMN z_gv_typ.z_ums_netto IS $$Nettoumsatz$$;
COMMENT ON COLUMN z_gv_typ.z_ust IS $$Umsatzsteuer$$;
COMMENT ON TABLE z_gv_typ IS $$businesscases.csv$$;
COMMENT ON COLUMN z_zahlart.z_kasse_id IS $$ID der (Abschluss-) Kasse$$;
COMMENT ON COLUMN z_zahlart.z_erstellung IS $$Zeitpunkt des Kassenabschlusses$$;
COMMENT ON COLUMN z_zahlart.z_nr IS $$Nr. des Kassenabschlusses$$;
COMMENT ON COLUMN z_zahlart.zahlart_typ IS $$Typ der Zahlart$$;
COMMENT ON COLUMN z_zahlart.zahlart_name IS $$Name der Zahlart$$;
COMMENT ON COLUMN z_zahlart.z_zahlart_betrag IS $$Betrag$$;
COMMENT ON TABLE z_zahlart IS $$payment.csv$$;
COMMENT ON COLUMN z_waehrungen.z_kasse_id IS $$ID der (Abschluss-) Kasse$$;
COMMENT ON COLUMN z_waehrungen.z_erstellung IS $$Zeitpunkt des Kassenabschlusses$$;
COMMENT ON COLUMN z_waehrungen.z_nr IS $$Nr. des Kassenabschlusses$$;
COMMENT ON COLUMN z_waehrungen.zahlart_waeh IS $$Währung$$;
COMMENT ON COLUMN z_waehrungen.zahlart_betrag_waeh IS $$Betrag$$;
COMMENT ON TABLE z_waehrungen IS $$cash_per_currency.csv$$;
COMMENT ON COLUMN bonkopf.z_kasse_id IS $$ID der (Abschluss-) Kasse$$;
COMMENT ON COLUMN bonkopf.z_erstellung IS $$Zeitpunkt des Kassenabschlusses$$;
COMMENT ON COLUMN bonkopf.z_nr IS $$Nr. des Kassenabschlusses$$;
COMMENT ON COLUMN bonkopf.bon_id IS $$Vorgangs-ID$$;
COMMENT ON COLUMN bonkopf.bon_nr IS $$Bonnummer$$;
COMMENT ON COLUMN bonkopf.bon_typ IS $$Bontyp$$;
COMMENT ON COLUMN bonkopf.bon_name IS $$Zusatz-Beschreibung zum Bontyp$$;
COMMENT ON COLUMN bonkopf.terminal_id IS $$ID des Erfassungsterminals$$;
COMMENT ON COLUMN bonkopf.bon_storno IS $$Storno-Kennzeichen$$;
COMMENT ON COLUMN bonkopf.bon_start IS $$Zeitpunkt des Vorgangsstarts$$;
COMMENT ON COLUMN bonkopf.bon_ende IS $$Zeitpunkt der Vorgangsbeendigung$$;
COMMENT ON COLUMN bonkopf.bediener_id IS $$Bediener-ID$$;
COMMENT ON COLUMN bonkopf.bediener_name IS $$Bediener-Name$$;
COMMENT ON COLUMN bonkopf.ums_brutto IS $$Brutto-Gesamtumsatz$$;
COMMENT ON COLUMN bonkopf.kunde_name IS $$Name des Leistungsempfängers$$;
COMMENT ON COLUMN bonkopf.kunde_id IS $$Kundennummer des Leistungsempfängers$$;
COMMENT ON COLUMN bonkopf.kunde_typ IS $$Art des Leistungsempfängers (z. B. Mitarbeiter)$$;
COMMENT ON COLUMN bonkopf.kunde_strasse IS $$Straße und Hausnummer des Leistungsempfängers$$;
COMMENT ON COLUMN bonkopf.kunde_plz IS $$PLZ des Leistungsempfängers$$;
COMMENT ON COLUMN bonkopf.kunde_ort IS $$Ort des Leistungsempfängers$$;
COMMENT ON COLUMN bonkopf.kunde_land IS $$Land des Leistungsempfängers$$;
COMMENT ON COLUMN bonkopf.kunde_ustid IS $$UStID des Leistungsempfängers$$;
COMMENT ON COLUMN bonkopf.bon_notiz IS $$Zusätzliche Informationen zum Bonkopf$$;
COMMENT ON TABLE bonkopf IS $$transactions.csv$$;
COMMENT ON COLUMN bonkopf_zahlarten.z_kasse_id IS $$ID der (Abschluss-) Kasse$$;
COMMENT ON COLUMN bonkopf_zahlarten.z_erstellung IS $$Zeitpunkt des Kassenabschlusses$$;
COMMENT ON COLUMN bonkopf_zahlarten.z_nr IS $$Nr. des Kassenabschlusses$$;
COMMENT ON COLUMN bonkopf_zahlarten.bon_id IS $$Vorgangs-ID$$;
COMMENT ON COLUMN bonkopf_zahlarten.zahlart_typ IS $$Typ der Zahlart$$;
COMMENT ON COLUMN bonkopf_zahlarten.zahlart_name IS $$Name der Zahlart$$;
COMMENT ON COLUMN bonkopf_zahlarten.zahlwaeh_code IS $$Währungscode$$;
COMMENT ON COLUMN bonkopf_zahlarten.zahlwaeh_betrag IS $$Betrag in Fremdwährung$$;
COMMENT ON COLUMN bonkopf_zahlarten.basiswaeh_betrag IS $$Betrag in Basiswährung (i.d.R. EUR)$$;
COMMENT ON TABLE bonkopf_zahlarten IS $$datapayment.csv$$;
COMMENT ON COLUMN bonpos.z_kasse_id IS $$ID der (Abschluss-) Kasse$$;
COMMENT ON COLUMN bonpos.z_erstellung IS $$Zeitpunkt des Kassenabschlusses$$;
COMMENT ON COLUMN bonpos.z_nr IS $$Nr. des Kassenabschlusses$$;
COMMENT ON COLUMN bonpos.bon_id IS $$Vorgangs-ID$$;
COMMENT ON COLUMN bonpos.pos_zeile IS $$Zeilennummer$$;
COMMENT ON COLUMN bonpos.gutschein_nr IS $$Gutschein-Nr.$$;
COMMENT ON COLUMN bonpos.artikeltext IS $$Artikeltext$$;
COMMENT ON COLUMN bonpos.pos_terminal_id IS $$ID des POS-Terminals$$;
COMMENT ON COLUMN bonpos.gv_typ IS $$Geschäftsvorfall-Art$$;
COMMENT ON COLUMN bonpos.gv_name IS $$Name des Geschäftsvorfalls$$;
COMMENT ON COLUMN bonpos.inhaus IS $$Verzehr an Ort und Stelle$$;
COMMENT ON COLUMN bonpos.p_storno IS $$Positionsstorno-Kennzeichnung$$;
COMMENT ON COLUMN bonpos.agentur_id IS $$ID der Agentur$$;
COMMENT ON COLUMN bonpos.art_nr IS $$Artikelnummer$$;
COMMENT ON COLUMN bonpos.gtin IS $$GTIN$$;
COMMENT ON COLUMN bonpos.warengr_id IS $$Warengruppen-ID$$;
COMMENT ON COLUMN bonpos.warengr IS $$Bezeichnung Warengruppe$$;
COMMENT ON COLUMN bonpos.menge IS $$Menge$$;
COMMENT ON COLUMN bonpos.faktor IS $$Faktor, z. B. Gebindegrößen$$;
COMMENT ON COLUMN bonpos.einheit IS $$Maßeinheit, z. B. kg, Liter oder Stück$$;
COMMENT ON COLUMN bonpos.stk_br IS $$Preis pro Einheit inkl. USt$$;
COMMENT ON TABLE bonpos IS $$lines.csv$$;
COMMENT ON COLUMN bonpos_preisfindung.z_kasse_id IS $$ID der (Abschluss-) Kasse$$;
COMMENT ON COLUMN bonpos_preisfindung.z_erstellung IS $$Zeitpunkt des Kassenabschlusses$$;
COMMENT ON COLUMN bonpos_preisfindung.z_nr IS $$Nr. des Kassenabschlusses$$;
COMMENT ON COLUMN bonpos_preisfindung.bon_id IS $$Vorgangs-ID$$;
COMMENT ON COLUMN bonpos_preisfindung.pos_zeile IS $$Zeilennummer$$;
COMMENT ON COLUMN bonpos_preisfindung.typ IS $$Basispreis, Rabatt oder Zuschlag$$;
COMMENT ON COLUMN bonpos_preisfindung.ust_schluessel IS $$ID des USt-Satzes$$;
COMMENT ON COLUMN bonpos_preisfindung.pf_brutto IS $$Bruttoumsatz$$;
COMMENT ON COLUMN bonpos_preisfindung.pf_netto IS $$Nettoumsatz$$;
COMMENT ON COLUMN bonpos_preisfindung.pf_ust IS $$Umsatzsteuer$$;
COMMENT ON TABLE bonpos_preisfindung IS $$itemamounts.csv$$;
COMMENT ON COLUMN bonpos_zusatzinfo.z_kasse_id IS $$ID der (Abschluss-) Kasse$$;
COMMENT ON COLUMN bonpos_zusatzinfo.z_erstellung IS $$Zeitpunkt des Kassenabschlusses$$;
COMMENT ON COLUMN bonpos_zusatzinfo.z_nr IS $$Nr. des Kassenabschlusses$$;
COMMENT ON COLUMN bonpos_zusatzinfo.bon_id IS $$Vorgangs-ID$$;
COMMENT ON COLUMN bonpos_zusatzinfo.pos_zeile IS $$Zeilennummer$$;
COMMENT ON COLUMN bonpos_zusatzinfo.zi_art_nr IS $$Artikelnummer$$;
COMMENT ON COLUMN bonpos_zusatzinfo.zi_gtin IS $$GTIN$$;
COMMENT ON COLUMN bonpos_zusatzinfo.zi_name IS $$Artikelbezeichnung$$;
COMMENT ON COLUMN bonpos_zusatzinfo.zi_warengr_id IS $$Warengruppen-ID$$;
COMMENT ON COLUMN bonpos_zusatzinfo.zi_warengr IS $$Bezeichnung Warengruppe$$;
COMMENT ON COLUMN bonpos_zusatzinfo.zi_menge IS $$Menge$$;
COMMENT ON COLUMN bonpos_zusatzinfo.zi_faktor IS $$Faktor, z. B. Gebindegrößen$$;
COMMENT ON COLUMN bonpos_zusatzinfo.zi_einheit IS $$Maßeinheit, z. B. kg, Liter oder Stück$$;
COMMENT ON COLUMN bonpos_zusatzinfo.zi_ust_schluessel IS $$ID USt-Satz des Basispreises$$;
COMMENT ON COLUMN bonpos_zusatzinfo.zi_basispreis_brutto IS $$Basispreis brutto$$;
COMMENT ON COLUMN bonpos_zusatzinfo.zi_basispreis_netto IS $$Basispreis netto$$;
COMMENT ON COLUMN bonpos_zusatzinfo.zi_basispreis_ust IS $$Basispreis USt$$;
COMMENT ON TABLE bonpos_zusatzinfo IS $$subitems.csv$$;
COMMENT ON COLUMN tse_transaktionen.z_kasse_id IS $$ID der (Abschluss-) Kasse$$;
COMMENT ON COLUMN tse_transaktionen.z_erstellung IS $$Zeitpunkt des Kassenabschlusses$$;
COMMENT ON COLUMN tse_transaktionen.z_nr IS $$Nr. des Kassenabschlusses$$;
COMMENT ON COLUMN tse_transaktionen.bon_id IS $$Vorgangs-ID$$;
COMMENT ON COLUMN tse_transaktionen.tse_id IS $$Die Id der für eine Transaktion verwendeten TSE$$;
COMMENT ON COLUMN tse_transaktionen.tse_tanr IS $$Die Transaktionsnummer der TSE-Transaktion$$;
COMMENT ON COLUMN tse_transaktionen.tse_ta_start IS $$Die Log-Time der StartTransaction-Operation$$;
COMMENT ON COLUMN tse_transaktionen.tse_ta_ende IS $$Die Log-Time der FinishTransaction-Operation$$;
COMMENT ON COLUMN tse_transaktionen.tse_ta_vorgangsart IS $$Der processType der FinishTransaction-Operation$$;
COMMENT ON COLUMN tse_transaktionen.tse_ta_sigz IS $$Der Signaturzähler der FinishTransaction-Operation$$;
COMMENT ON COLUMN tse_transaktionen.tse_ta_sig IS $$Die Signatur der FinishTransaction-Operation$$;
COMMENT ON COLUMN tse_transaktionen.tse_ta_fehler IS $$Beschreibung des TSE-Ausfalls oder Fehlers$$;
COMMENT ON COLUMN tse_transaktionen.tse_vorgangsdaten IS $$An die zertifizierte technische Sicherheitseinrichtung übergebene Daten des Vorgangs (optional)$$;
COMMENT ON TABLE tse_transaktionen IS $$transactions_tse.csv$$;
COMMENT ON COLUMN bonkopf_ust.z_kasse_id IS $$ID der (Abschluss-) Kasse$$;
COMMENT ON COLUMN bonkopf_ust.z_erstellung IS $$Zeitpunkt des Kassenabschlusses$$;
COMMENT ON COLUMN bonkopf_ust.z_nr IS $$Nr. des Kassenabschlusses$$;
COMMENT ON COLUMN bonkopf_ust.bon_id IS $$Vorgangs-ID$$;
COMMENT ON COLUMN bonkopf_ust.ust_schluessel IS $$ID des USt-Satzes$$;
COMMENT ON COLUMN bonkopf_ust.bon_brutto IS $$Bruttoumsatz$$;
COMMENT ON COLUMN bonkopf_ust.bon_netto IS $$Nettoumsatz$$;
COMMENT ON COLUMN bonkopf_ust.bon_ust IS $$Umsatzsteuer$$;
COMMENT ON TABLE bonkopf_ust IS $$transactions_vat.csv$$;
COMMENT ON COLUMN bonpos_ust.z_kasse_id IS $$ID der (Abschluss-) Kasse$$;
COMMENT ON COLUMN bonpos_ust.z_erstellung IS $$Zeitpunkt des Kassenabschlusses$$;
COMMENT ON COLUMN bonpos_ust.z_nr IS $$Nr. des Kassenabschlusses$$;
COMMENT ON COLUMN bonpos_ust.bon_id IS $$Vorgangs-ID$$;
COMMENT ON COLUMN bonpos_ust.pos_zeile IS $$Zeilennummer$$;
COMMENT ON COLUMN bonpos_ust.ust_schluessel IS $$ID des USt-Satzes$$;
COMMENT ON COLUMN bonpos_ust.pos_brutto IS $$Bruttoumsatz$$;
COMMENT ON COLUMN bonpos_ust.pos_netto IS $$Nettoumsatz$$;
COMMENT ON COLUMN bonpos_ust.pos_ust IS $$Umsatzsteuer$$;
COMMENT ON TABLE bonpos_ust IS $$lines_vat.csv$$;
COMMENT ON COLUMN bonkopf_abrkreis.z_kasse_id IS $$ID der (Abschluss-) Kasse$$;
COMMENT ON COLUMN bonkopf_abrkreis.z_erstellung IS $$Zeitpunkt des Kassenabschlusses$$;
COMMENT ON COLUMN bonkopf_abrkreis.z_nr IS $$Nr. des Kassenabschlusses$$;
COMMENT ON COLUMN bonkopf_abrkreis.bon_id IS $$Vorgangs-ID$$;
COMMENT ON COLUMN bonkopf_abrkreis.abrechnungskreis IS $$z. B. Tischnummer$$;
COMMENT ON TABLE bonkopf_abrkreis IS $$allocation_groups.csv$$;
COMMENT ON COLUMN bon_referenzen.z_kasse_id IS $$ID der (Abschluss-) Kasse$$;
COMMENT ON COLUMN bon_referenzen.z_erstellung IS $$Zeitpunkt des Kassenabschlusses$$;
COMMENT ON COLUMN bon_referenzen.z_nr IS $$Nr. des Kassenabschlusses$$;
COMMENT ON COLUMN bon_referenzen.bon_id IS $$Vorgangs-ID$$;
COMMENT ON COLUMN bon_referenzen.pos_zeile IS $$Zeilennummer des referenzierenden Vorgangs (nicht bei Verweis aus einem Bonkopf heraus)$$;
COMMENT ON COLUMN bon_referenzen.ref_typ IS $$Art der Referenz$$;
COMMENT ON COLUMN bon_referenzen.ref_name IS $$Beschreibung bei Art “ExterneSonstige”$$;
COMMENT ON COLUMN bon_referenzen.ref_datum IS $$Datum des Kassenabschlusses$$;
COMMENT ON COLUMN bon_referenzen.ref_z_kasse_id IS $$ID der (Abschluss-) Kasse$$;
COMMENT ON COLUMN bon_referenzen.ref_z_nr IS $$Nr. des Kassenabschlusses$$;
COMMENT ON COLUMN bon_referenzen.ref_bon_id IS $$Vorgangs-ID$$;
COMMENT ON TABLE bon_referenzen IS $$references.csv$$
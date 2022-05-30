CREATE INDEX CONCURRENTLY IF NOT EXISTS export_cash_point_closings_export_id
  ON export_cash_point_closings USING btree
    (export_id ASC NULLS LAST)
;

CREATE INDEX CONCURRENTLY IF NOT EXISTS export_cash_point_closings_cash_point_closing_id
  ON export_cash_point_closings USING btree
    (cash_point_closing_id ASC NULLS LAST)
;

CREATE INDEX CONCURRENTLY IF NOT EXISTS amounts_per_vat_ids_cash_point_closing_id_entry_type
  ON amounts_per_vat_ids USING btree
    (entry_type ASC NULLS LAST, cash_point_closing_id ASC NULLS LAST)
;

CREATE INDEX CONCURRENTLY IF NOT EXISTS amounts_per_vat_ids_cash_point_closing_id
  ON amounts_per_vat_ids USING btree
  (cash_point_closing_id ASC NULLS LAST);

CREATE INDEX CONCURRENTLY IF NOT EXISTS transactions_cash_point_closing_id_client_id_client_revision
  ON transactions USING btree
    (cash_point_closing_id ASC NULLS LAST, closing_client_id ASC NULLS LAST, closing_client_revision ASC NULLS LAST)
;

CREATE INDEX CONCURRENTLY IF NOT EXISTS cash_point_closings_id_client_id_client_revision
  ON cash_point_closings USING btree
    (cash_point_closing_id ASC NULLS LAST, client_id ASC NULLS LAST, client_revision ASC NULLS LAST)
;

CREATE INDEX CONCURRENTLY IF NOT EXISTS purchaser_agencies_agency_id_revision
  ON purchaser_agencies USING btree
    (purchaser_agency_id ASC NULLS LAST, revision ASC NULLS LAST)
;

CREATE INDEX CONCURRENTLY IF NOT EXISTS lineitems_cash_point_closing_id
  ON lineitems USING btree
    (cash_point_closing_id ASC NULLS LAST)
;

CREATE INDEX CONCURRENTLY IF NOT EXISTS business_cases_cpc_id_purchaser_agency_id_revision
  ON business_cases USING btree
    (cash_point_closing_id ASC NULLS LAST, purchaser_agency_id ASC NULLS LAST, purchaser_agency_revision ASC NULLS LAST)
;

CREATE INDEX CONCURRENTLY IF NOT EXISTS cash_amounts_by_currency_cash_point_closing_id
  ON cash_amounts_by_currency USING btree
    (cash_point_closing_id ASC NULLS LAST)
;

CREATE INDEX CONCURRENTLY IF NOT EXISTS payment_types_cash_point_closing_id_entry_type
  ON payment_types USING btree
    (cash_point_closing_id ASC NULLS LAST, entry_type ASC NULLS LAST)
;

CREATE INDEX CONCURRENTLY IF NOT EXISTS transactions_references_lineitem_id
  ON transaction_references USING btree
    (lineitem_id ASC NULLS LAST)
;

CREATE INDEX CONCURRENTLY IF NOT EXISTS transaction_references_transaction_id
  ON transaction_references USING btree
    (transaction_id ASC NULLS LAST)
;

CREATE INDEX CONCURRENTLY IF NOT EXISTS transaction_internal_references_transaction_id
  ON transaction_internal_references USING btree
    (transaction_id ASC NULLS LAST, referenced_transaction_id ASC NULLS LAST)
;

CREATE INDEX CONCURRENTLY IF NOT EXISTS transaction_internal_references_referenced_transaction_id
  ON transaction_internal_references USING btree
    (referenced_transaction_id ASC NULLS LAST, transaction_id ASC NULLS LAST)
;

CREATE INDEX CONCURRENTLY IF NOT EXISTS lineitem_internal_references_lineitem_id
  ON lineitem_internal_references USING btree
    (lineitem_id ASC NULLS LAST, referenced_transaction_id ASC NULLS LAST)
;

CREATE INDEX CONCURRENTLY IF NOT EXISTS lineitem_internal_references_referenced_transaction_id
  ON lineitem_internal_references USING btree
    (referenced_transaction_id ASC NULLS LAST, lineitem_id ASC NULLS LAST)
;

CREATE INDEX CONCURRENTLY IF NOT EXISTS external_references_transaction_id
  ON external_references USING btree
    (transaction_id ASC NULLS LAST, lineitem_id ASC NULLS LAST)
;

CREATE INDEX CONCURRENTLY IF NOT EXISTS vat_definitions_organization_id
  ON vat_definitions USING btree
    (organization_id ASC NULLS LAST)
;

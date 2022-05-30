CREATE INDEX CONCURRENTLY IF NOT EXISTS amounts_per_vat_ids_transaction_id
  ON amounts_per_vat_ids USING btree
    (transaction_id ASC)
  WHERE transaction_id IS NOT NULL
;

CREATE INDEX CONCURRENTLY IF NOT EXISTS payment_types_transaction_id
  ON payment_types USING btree
    (transaction_id ASC)
  WHERE transaction_id IS NOT NULL
;

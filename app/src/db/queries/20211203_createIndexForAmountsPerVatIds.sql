CREATE INDEX CONCURRENTLY IF NOT EXISTS amounts_per_vat_ids_lineitem_id_entry_type_index
  ON amounts_per_vat_ids USING btree
    (lineitem_id ASC NULLS LAST, entry_type ASC NULLS LAST);

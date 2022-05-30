CREATE INDEX CONCURRENTLY IF NOT EXISTS subitems_cash_point_closing_id
  ON subitems USING btree
  (cash_point_closing_id ASC)
  WHERE cash_point_closing_id IS NOT NULL
;

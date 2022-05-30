-- Since it seems that there is no way of creating an index with ley (due to their migrations always being inside a
-- transaction) this needs to be executed within the cluster
CREATE INDEX CONCURRENTLY IF NOT EXISTS tx_by_cash_point_closing_id ON transactions(cash_point_closing_id);

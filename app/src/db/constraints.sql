# adding constraints to enforce rules
ALTER TABLE payment_types
ADD
  CONSTRAINT check_cpc_t CHECK (
    (
      entry_type = 'cash_point_closing'
      AND cash_point_closing_id IS NOT NULL
    )
    OR (
      entry_type = 'transaction'
      AND transaction_id IS NOT NULL
    )
  );
ALTER TABLE external_references
ADD
  CONSTRAINT check_t_li CHECK(
    (
      entry_type = 'transaction'
      AND transaction_id IS NOT NULL
    )
    OR (
      entry_type = 'list_item'
      AND lineitem_id IS NOT NULL
    )
  );
ALTER TABLE transaction_references
ADD
  CONSTRAINT check_t_li CHECK(
    (
      entry_type = 'transaction'
      AND transaction_id IS NOT NULL
    )
    OR (
      entry_type = 'list_item'
      AND lineitem_id IS NOT NULL
    )
  );
ALTER TABLE amounts_per_vat_ids
ADD
  CONSTRAINT check_amount_type CHECK(
    (
      entry_type = 'transaction'
      AND transaction_id IS NOT NULL
    )
    OR (
      entry_type = 'business_case'
      AND business_case_id IS NOT NULL
    )
    OR (
      entry_type IN (
        'lineitem_base_amounts',
        'lineitem_discounts',
        'lineitem_extra_amounts'
      )
      AND lineitem_id IS NOT NULL
    )
  );
ALTER TABLE external_references
ADD
  CONSTRAINT check_external_others CHECK(
    (
      type = 'ExterneSonstige'
      AND name IS NOT NULL
    )
    OR (
      type IN ('ExterneRechnung', 'ExternerLieferschein')
    )
  );
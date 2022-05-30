CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS vat_definition_unique_vat_def_export_id_env_index
  ON public.vat_definitions USING btree
  (vat_definition_export_id ASC NULLS LAST, organization_id ASC NULLS LAST, revision ASC NULLS LAST, env ASC NULLS LAST)
;
DROP INDEX CONCURRENTLY IF EXISTS vat_definitions_unique_index;

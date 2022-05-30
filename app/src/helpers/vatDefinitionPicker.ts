/**
 * VAT definitions are a bit tricky to handle. This file is here to deal with
 * that. A couple of conditions apply:
 *
 * - vat_definition_export_id <= 10:   The validity needs to be checked
 * - vat_definition_export_id > 10:    No validity needs to be checked
 * - vat_definition_export_id >= 1000: These are custom vat definitions.
 *     When a new Cash Point Closing is being created, the last revision must be
 *     used. Otherwise, the given vat_definition_id (UUID) must be used.
 */

import { Env } from '../routes/api/models';
import TsRange from './tsRange';

export enum VatDefinitionType {
  SYSTEM,
  HISTORIC,
  CUSTOM,
}

export interface VatDefinitionSelection {
  vat_definition_id: string;
  revision?: number;
  vat_definition_export_id: number | string;
  historic_export_id?: number | string;
  organization_id?: string;
  percentage: number | string;
  description: string;
  env: Env;
  version: number;
  validity?: string;
  type?: VatDefinitionType;
}

export default class VatDefinitionPicker {
  private readonly vatDefinitions: VatDefinitionSelection[];
  private ranges: { [pattern: string]: TsRange } = {};
  private env: Env;

  /**
   * A simple way of mapping the UUID to the corresponding this.vatDefinitions
   * index.
   */
  private mapOfVatDefinitionIdToIndex: {
    [id: string]: number;
  } = {};

  /**
   * This multidimensional array-like object contains a link to the
   * vatDefinition via an array index.
   *
   * The structure of this object is something like this:
   *
   *   /-- vat definition export id
   *  V
   * [1]:
   *       /-- revision
   *      V
   *     [0]: 14  <-- index of this.vatDefinitions
   *     [1]: 15  <-- index of this.vatDefinitions
   */
  private mapOfVatDefinitionExportIdWithRevisionToIndex: {
    [id: number]: {
      [revision: number]: number;
    };
  } = {};

  /**
   * For a faster comparison of system vat definitions with different validity
   * ranges.
   */
  private mapOfSystemVatDefinitionRevisions: {
    [id: number]: number[];
  } = {};

  static getVatDefinitionType(vatDefinitionExportId: number) {
    if (vatDefinitionExportId <= 10) {
      return VatDefinitionType.SYSTEM;
    }
    if (vatDefinitionExportId <= 999) {
      return VatDefinitionType.HISTORIC;
    }

    return VatDefinitionType.CUSTOM;
  }

  static normalizedVatDefinitionExportId(
    vatDefinitionExportId: number | string,
  ) {
    return typeof vatDefinitionExportId === 'string'
      ? parseInt(vatDefinitionExportId, 10)
      : vatDefinitionExportId;
  }

  constructor(vatDefinitions: VatDefinitionSelection[]) {
    if (!Array.isArray(vatDefinitions)) {
      throw new Error('Invalid type');
    }
    this.vatDefinitions = vatDefinitions;
    this.mapData();
  }

  getVatDefinitionById(vatDefinitionId: string) {
    const index = this.mapOfVatDefinitionIdToIndex[vatDefinitionId];
    return this.vatDefinitions[index];
  }

  /**
   * A simple lookup of a specific revision of a vat_definition_export_id
   *
   * @param vatDefinitionExportId
   * @param revision
   */
  getVatDefinitionByExportId(
    vatDefinitionExportId: number | string,
    revision: number,
  ) {
    const id = VatDefinitionPicker.normalizedVatDefinitionExportId(
      vatDefinitionExportId,
    );
    const index =
      this.mapOfVatDefinitionExportIdWithRevisionToIndex[id]?.[revision];
    return this.vatDefinitions[index];
  }

  /**
   * Retrieving the latest revision of a given vat_definition_export_id.
   *
   * @param vatDefinitionExportId
   * @param pointInTime
   */
  getLatestVatDefinitionByExportId(
    vatDefinitionExportId: number | string,
    pointInTime?: Date,
  ) {
    const id = VatDefinitionPicker.normalizedVatDefinitionExportId(
      vatDefinitionExportId,
    );

    switch (VatDefinitionPicker.getVatDefinitionType(id)) {
      // System VAT Definitions that is only valid for certain time periods
      case VatDefinitionType.SYSTEM:
        return this.getVatDefinitionIdByExportIdAndValidity(
          vatDefinitionExportId,
          pointInTime || new Date(),
        );

      // System VAT Definitions that only has 1 revision: r0
      case VatDefinitionType.HISTORIC:
        return this.getVatDefinitionByExportId(vatDefinitionExportId, 0);

      case VatDefinitionType.CUSTOM:
      default:
        const revisions =
          this.mapOfVatDefinitionExportIdWithRevisionToIndex[id];
        if (revisions == null) {
          return null;
        }

        const collator = new Intl.Collator(undefined, {
          numeric: true,
          sensitivity: 'base',
        });
        const keys = Object.keys(revisions).sort(collator.compare);
        const lastRevision = parseInt(keys[keys.length - 1], 10);
        const index = revisions[lastRevision];
        return this.vatDefinitions[index];
    }
  }

  /**
   * Retrieving the correct system vat definition for a certain point in time.
   *
   * @param vatDefinitionExportId
   * @param pointInTime
   */
  getVatDefinitionIdByExportIdAndValidity(
    vatDefinitionExportId: number | string,
    pointInTime: Date,
  ) {
    const id = VatDefinitionPicker.normalizedVatDefinitionExportId(
      vatDefinitionExportId,
    );
    const entities = this.mapOfSystemVatDefinitionRevisions[id];
    if (entities == null) {
      return null;
    }

    for (const index of entities) {
      const row = this.vatDefinitions[index];
      const tsRange = this.ranges[row.validity];
      if (tsRange == null) {
        throw new Error('Missing TsRange');
      }
      if (this.ranges[row.validity].withinRange(pointInTime)) {
        return row;
      }
    }

    return null;
  }

  getExportIdAndVatDefinitionForExport(
    vatDefinitionId: string,
    vatDefinitionExportId: string | number,
    pointInTime: Date,
  ) {
    const exportId =
      VatDefinitionPicker.normalizedVatDefinitionExportId(
        vatDefinitionExportId,
      ) ||
      this.getExportIdFromHistoricOrRelatedVatDefinitionById(
        vatDefinitionId,
        pointInTime,
      );
    let definition: VatDefinitionSelection;

    switch (VatDefinitionPicker.getVatDefinitionType(exportId)) {
      case VatDefinitionType.CUSTOM:
        definition = this.getVatDefinitionById(vatDefinitionId);
        break;
      case VatDefinitionType.HISTORIC:
      case VatDefinitionType.SYSTEM:
        definition = this.getVatDefinitionByExportIdHoldingHistoric(
          exportId,
          pointInTime,
        );
        break;
    }

    return { exportId, definition };
  }

  /**
   * Returns the related vat definition of a given vat_definition_id.
   * This is useful when only the vat_definition_id is available and a timestamp
   * which is being used to retrieve the correct vat definition.
   *
   * E.g.:
   *   id:                        ff80501a-7c70-450e-bc62-7270e4a68856
   *   vat_definition_export_id:  1
   *   percentage:                19
   *   validity:                  last week
   *
   *   id:                        b78732fb-96d1-477c-be88-30c2d0b8bdeb
   *   vat_definition_export_id:  1
   *   percentage:                16
   *   validity:                  today
   *
   * Providing the id ff80501a-7c70-450e-bc62-7270e4a68856 with the timestamp
   * of today, the second data set with a percentage of 16 is being returned.
   *
   * @param vatDefinitionId
   * @param pointInTime
   */
  getRelatedVatDefinitionById(vatDefinitionId: string, pointInTime: Date) {
    const startingDefinition = this.getVatDefinitionById(vatDefinitionId);
    if (startingDefinition.type === VatDefinitionType.SYSTEM) {
      return this.getVatDefinitionIdByExportIdAndValidity(
        startingDefinition.vat_definition_export_id,
        pointInTime,
      );
    }

    return this.getVatDefinitionById(vatDefinitionId);
  }

  /**
   * If a vat definition has a historic_export_id set, this will be used.
   * Otherwise the related vat definition is being returned as a fallback.
   *
   * TODO: This is a bit of a hack. As we only have the vat_definition_id on
   *   hand, we cannot be 100% sure if the historic_vat_definition_id or the
   *   vat_definition_export_id is meant to be set.
   *
   * @param vatDefinitionId
   * @param pointInTime
   */
  getExportIdFromHistoricOrRelatedVatDefinitionById(
    vatDefinitionId: string,
    pointInTime: Date,
  ) {
    const startingDefinition = this.getVatDefinitionById(vatDefinitionId);
    const tsRange =
      startingDefinition.validity && this.ranges[startingDefinition.validity];
    const pointInTimeOutsideOfRange =
      tsRange && tsRange.afterRangeEnd(pointInTime);
    if (startingDefinition.historic_export_id && pointInTimeOutsideOfRange) {
      return VatDefinitionPicker.normalizedVatDefinitionExportId(
        startingDefinition.historic_export_id,
      );
    }
    const definition = this.getRelatedVatDefinitionById(
      vatDefinitionId,
      pointInTime,
    );
    return VatDefinitionPicker.normalizedVatDefinitionExportId(
      definition?.vat_definition_export_id,
    );
  }

  /**
   * Extends the getLatestVatDefinitionByExportId. However, the given
   * vatDefinitionExportId will be used again to make sure that in case of a
   * historic export id, this will reflect in the resulting definition.
   *
   * @param vatDefinitionExportId
   * @param pointInTime
   */
  getVatDefinitionByExportIdHoldingHistoric(
    vatDefinitionExportId,
    pointInTime: Date,
  ) {
    const definition = this.getLatestVatDefinitionByExportId(
      vatDefinitionExportId,
      pointInTime,
    );
    if (definition == null) {
      return null;
    }
    return {
      ...definition,
      vat_definition_export_id: vatDefinitionExportId,
    };
  }

  private normalizeVatDefinitionRow(row, index) {
    const vatDefinitionExportId =
      VatDefinitionPicker.normalizedVatDefinitionExportId(
        row.vat_definition_export_id,
      );
    this.vatDefinitions[index] = {
      ...row,
      revision: row.revision && parseInt(row.revision, 10),
      vat_definition_export_id: vatDefinitionExportId,
      historic_export_id:
        row.historic_export_id && parseInt(row.historic_export_id, 10),
      percentage: String(row.percentage),
      type: VatDefinitionPicker.getVatDefinitionType(vatDefinitionExportId),
    };
    return this.vatDefinitions[index];
  }

  private mapVatDefinitionIdToIndex(
    row: VatDefinitionSelection,
    index: number,
  ) {
    this.mapOfVatDefinitionIdToIndex[row.vat_definition_id] = index;
  }

  private mapVatDefinitionExportIdWithRevision(
    row: VatDefinitionSelection,
    index: number,
  ) {
    const vatExportId = row.vat_definition_export_id;
    let vatExportIdEntity =
      this.mapOfVatDefinitionExportIdWithRevisionToIndex[vatExportId];
    if (vatExportIdEntity == null) {
      this.mapOfVatDefinitionExportIdWithRevisionToIndex[vatExportId] = {};
      vatExportIdEntity =
        this.mapOfVatDefinitionExportIdWithRevisionToIndex[vatExportId];
    }

    vatExportIdEntity[row.revision || 0] = index;
  }

  private mapSystemVatDefinitionRevisions(row: VatDefinitionSelection, index) {
    const id = VatDefinitionPicker.normalizedVatDefinitionExportId(
      row.vat_definition_export_id,
    );

    // Only system vat definitions need to be mapped. All other can be skipped.
    if (
      VatDefinitionPicker.getVatDefinitionType(id) !== VatDefinitionType.SYSTEM
    ) {
      return;
    }

    // Only map range patterns for system vat definition <= 10
    if (row.validity != null) {
      this.mapRangePattern(row.validity);
    }

    if (this.mapOfSystemVatDefinitionRevisions[id] == null) {
      this.mapOfSystemVatDefinitionRevisions[id] = [];
    }

    this.mapOfSystemVatDefinitionRevisions[id].push(index);
  }

  private mapHistoricVatDefinitionId(
    row: VatDefinitionSelection,
    index: number,
  ) {
    if (row.historic_export_id == null) {
      return;
    }
    this.mapOfVatDefinitionExportIdWithRevisionToIndex[row.historic_export_id] =
      {
        0: index,
      };
  }

  private mapRangePattern(pattern: string) {
    // Ignore already stored patterns
    if (this.ranges[pattern] != null) {
      return;
    }

    this.ranges[pattern] = new TsRange(pattern);
  }

  private controlEnv(row: VatDefinitionSelection) {
    if (row.env == null) {
      throw new Error('Missing env');
    }
    if (this.env == null) {
      this.env = row.env;
    }
    if (this.env !== row.env) {
      throw new Error('List can only contain vat definitions of the same env');
    }
  }

  private mapData() {
    for (let index = 0; index < this.vatDefinitions.length; index++) {
      const row = this.normalizeVatDefinitionRow(
        this.vatDefinitions[index],
        index,
      );
      this.controlEnv(row);
      this.mapVatDefinitionIdToIndex(row, index);
      this.mapVatDefinitionExportIdWithRevision(row, index);
      this.mapSystemVatDefinitionRevisions(row, index);
      this.mapHistoricVatDefinitionId(row, index);
    }
  }
}

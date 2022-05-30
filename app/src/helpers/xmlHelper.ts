import { Parser, Builder } from 'xml2js';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import traverse from 'traverse';

export async function transformIndexXML(destinationPath: string) {
  try {
    let xmlStr = readFileSync(
      path.resolve(__dirname, '..', 'index.xml'),
    ).toString();

    xmlStr = xmlStr.replace(/&#xD;&#xA;/g, 'xxrxx');

    const parser = new Parser({ explicitArray: false });
    const indexResult = await parser.parseStringPromise(xmlStr);

    traverse(indexResult).forEach(function (value) {
      if (this.key === 'DecimalSymbol') {
        this.update('.');
      }
      if (this.key === 'DigitGroupingSymbol') {
        this.update(',');
      }
      if (value.URL === 'tse.csv') {
        value.VariableLength.VariableColumn.push({
          Name: 'TSE_ZERTIFIKAT_III',
          Description:
            'Ggf. Rest des base64-codierten Zertifikats der TSE (in base64-Codierung)',
          AlphaNumeric: '',
          MaxLength: '1000',
        });
        value.VariableLength.VariableColumn.push({
          Name: 'TSE_ZERTIFIKAT_IV',
          Description:
            'Ggf. Rest des base64-codierten Zertifikats der TSE (in base64-Codierung)',
          AlphaNumeric: '',
          MaxLength: '1000',
        });
        value.VariableLength.VariableColumn.push({
          Name: 'TSE_ZERTIFIKAT_V',
          Description:
            'Ggf. Rest des base64-codierten Zertifikats der TSE (in base64-Codierung)',
          AlphaNumeric: '',
          MaxLength: '1000',
        });
      }
    });

    const builder = new Builder({
      xmldec: { version: '1.0', encoding: 'utf-8' },
      rootName: 'DataSet',
      doctype: { sysID: 'gdpdu-01-09-2004.dtd' },
    });
    let xmlResult = builder.buildObject(indexResult.DataSet);

    // todo: check against dtd e.g. with https://www.npmjs.com/package/node-libxml

    xmlResult = xmlResult.replace(/xxrxx/g, '&#xD;&#xA;');
    xmlResult = xmlResult.replace(/\/>/g, ' />');

    writeFileSync(destinationPath, xmlResult);
  } catch (error) {
    console.error(error);
  }
}

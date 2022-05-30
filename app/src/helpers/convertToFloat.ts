function convertToFloat(val: string | number): number;
function convertToFloat(vals: (string | number)[]): number[];
function convertToFloat(val: string | number | (string | number)[]) {
  if (Array.isArray(val)) {
    return val.map((itemVal) => convertToFloat(itemVal));
  }
  if (typeof val === 'string') {
    return parseFloat(val);
  }
  return val;
}

export default convertToFloat;

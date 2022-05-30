function nullToUndefined<T>(value: T) {
  if (value === null) {
    value = undefined;
  }
  if (typeof value === 'object') {
    Object.entries(value).forEach(([objKey, objValue]) => {
      if (value.hasOwnProperty(objKey)) {
        value[objKey] = nullToUndefined(objValue);
      }
    });
  }
  if (Array.isArray(value)) {
    value.forEach((x) => nullToUndefined(x));
  }
  return value;
}

export async function removeNullValues(request, reply, payload) {
  return nullToUndefined(payload);
}

export function formatValue<T>(value: T): string {
  if (typeof value === 'string') {
    return `'${value.replace(/'/g, '\'\'')}'`;
  }
  if (typeof value === 'boolean') {
    return value ? '1' : '0';
  }
  if (value === null || value === undefined) {
    return 'NULL';
  }
  return value.toString();
}
  
export function simulateSqlQuery(query: string, params: unknown[]): string {
  let index = 0;
  const result = query.replace(/\?/g, () => {
    const value = params[index++];
    return formatValue(value);
  });
  return result;
}
  
      
export function getEnv(key) {
  try {
    const getImportMeta = new Function('return import.meta');
    const meta = getImportMeta();
    if (meta && meta.env) {
      return meta.env[key];
    }
  } catch (e) {
    // Ignored in non-ESM environments like Jest
  }

  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }

  return '';
}

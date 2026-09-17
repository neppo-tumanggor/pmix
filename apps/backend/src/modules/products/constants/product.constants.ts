export const PRODUCT_CONSTANTS = {
  PAGE_SIZE: parseInt(process.env.PRODUCT_PAGE_SIZE || '20', 10),
  MAX_PAGE_SIZE: parseInt(process.env.PRODUCT_MAX_PAGE_SIZE || '100', 10),
  MAX_IMPORT_ROWS: parseInt(process.env.PRODUCT_MAX_IMPORT_ROWS || '1000', 10),
  MAX_IMPORT_SIZE: parseInt(process.env.PRODUCT_MAX_IMPORT_SIZE || '10485760', 10), // 10MB
  SEARCH_DEBOUNCE: parseInt(process.env.PRODUCT_SEARCH_DEBOUNCE || '300', 10),
} as const;
export const AUTH_CONFIG = {
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
  
  JWT: {
    SECRET: process.env.JWT_SECRET || 'your-secret-key-minimum-32-characters',
    EXPIRY: process.env.JWT_EXPIRY || '15m',
    REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-minimum-32-characters',
    REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d',
  },
  
  EMAIL: {
    VERIFICATION_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
    PASSWORD_RESET_EXPIRY: 60 * 60 * 1000, // 1 hour
  },
  
  PASSWORD: {
    MIN_LENGTH: 8,
    HISTORY_SIZE: 5, // Keep last 5 passwords
  },
  
  ACCOUNT_LOCKOUT: {
    MAX_ATTEMPTS: 5,
    LOCKOUT_DURATION: 30 * 60 * 1000, // 30 minutes
  },
  
  RATE_LIMIT: {
    REGISTER_TTL: 60 * 60 * 1000, // 1 hour
    REGISTER_LIMIT: 3,
    LOGIN_TTL: 15 * 60 * 1000, // 15 minutes
    LOGIN_LIMIT: 5,
    PASSWORD_RESET_TTL: 60 * 60 * 1000, // 1 hour
    PASSWORD_RESET_LIMIT: 3,
  },
} as const;

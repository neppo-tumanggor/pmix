import { SettingCategory } from './settings-categories.enum';

export const SETTINGS_DEFAULTS: Record<SettingCategory, Record<string, any>> = {
  [SettingCategory.GENERAL]: {
    app_name: 'pmix',
    timezone: 'UTC',
    language: 'en',
  },
  [SettingCategory.EMAIL]: {
    smtp_host: 'smtp.gmail.com',
    smtp_port: 587,
    smtp_secure: false,
    smtp_user: '',
    smtp_password: '',
    from_email: 'noreply@pmix.com',
    from_name: 'pmix',
  },
  [SettingCategory.SMS]: {
    provider: 'twilio',
    api_key: '',
    api_secret: '',
    from_number: '',
  },
  [SettingCategory.WHATSAPP]: {
    provider: 'whatsapp_business',
    api_token: '',
    api_secret: '',
    phone_number_id: '',
  },
  [SettingCategory.SECURITY]: {
    password_min_length: 8,
    password_require_uppercase: true,
    password_require_lowercase: true,
    password_require_numbers: true,
    password_require_special_chars: true,
    session_timeout_minutes: 60,
    max_login_attempts: 5,
    lockout_duration_minutes: 15,
  },
  [SettingCategory.NOTIFICATIONS]: {
    email_enabled: true,
    sms_enabled: false,
    push_enabled: true,
  },
  [SettingCategory.BRANDING]: {
    logo_url: '',
    primary_color: '#007bff',
    secondary_color: '#6c757d',
  },
  [SettingCategory.INTEGRATIONS]: {
    api_key: '',
    api_secret: '',
    webhook_url: '',
    webhook_secret: '',
  },
};

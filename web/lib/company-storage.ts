import { CompanySettings, defaultCompanySettings } from '../types/company';

const STORAGE_KEY = 'contractor_estimator_company_settings';

export function getCompanySettings(): CompanySettings {
  if (typeof window === 'undefined') {
    return defaultCompanySettings;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultCompanySettings;

    const parsed = JSON.parse(raw) as Partial<CompanySettings>;

    return {
      ...defaultCompanySettings,
      ...parsed,
      templateOptions: {
        ...defaultCompanySettings.templateOptions,
        ...(parsed.templateOptions || {}),
      },
    };
  } catch {
    return defaultCompanySettings;
  }
}

export function saveCompanySettings(settings: CompanySettings) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
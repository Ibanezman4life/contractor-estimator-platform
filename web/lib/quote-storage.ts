export type TemplateOptions = {
  showScopeOfWork: boolean;
  showMaterials: boolean;
  showLaborBreakdown: boolean;
  showNotes: boolean;
  showExclusions: boolean;
  showWarranty: boolean;
  showSchedule: boolean;
  showCustomerAcceptance: boolean;
};

export type CompanySettings = {
  companyName: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  logoDataUrl: string;
  defaultMarkupPercent: number | string;
  hourlyLaborRate: number | string;
  helperLaborRate: number | string;
  tripCharge: number | string;
  minimumServiceCall: number | string;
  defaultSupplierSort: string;
  templateOptions: TemplateOptions;
};

export type EstimatePayload = {
  job_type?: string;
  summary?: string;
  estimated_price?: number | string;
  labor_hours?: number | string;
  labor_cost?: number | string;
  trip_charge?: number | string;
  subtotal?: number | string;
  markup_amount?: number | string;
  total?: number | string;
  scope_of_work?: string[];
  materials?: string[];
  questions?: string[];
  [key: string]: unknown;
};

export type SavedQuotePayload = {
  customerName: string;
  jobLocation: string;
  jobDescription: string;
  createdAt: string;
  estimate: EstimatePayload;
  companySettings?: CompanySettings;
};

const COMPANY_SETTINGS_KEY = 'contractor-estimator-company-settings';
const QUOTE_PREVIEW_KEY = 'contractor-estimator-quote-preview';

const defaultTemplateOptions: TemplateOptions = {
  showScopeOfWork: true,
  showMaterials: true,
  showLaborBreakdown: true,
  showNotes: true,
  showExclusions: false,
  showWarranty: false,
  showSchedule: false,
  showCustomerAcceptance: false,
};

const defaultCompanySettings: CompanySettings = {
  companyName: '',
  phone: '',
  email: '',
  website: '',
  address: '',
  logoDataUrl: '',
  defaultMarkupPercent: '',
  hourlyLaborRate: '',
  helperLaborRate: '',
  tripCharge: '',
  minimumServiceCall: '',
  defaultSupplierSort: 'price',
  templateOptions: defaultTemplateOptions,
};

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function normalizeTemplateOptions(
  incoming?: Partial<TemplateOptions> | null
): TemplateOptions {
  return {
    ...defaultTemplateOptions,
    ...(incoming || {}),
  };
}

function normalizeCompanySettings(
  incoming?: Partial<CompanySettings> | null
): CompanySettings {
  return {
    companyName: incoming?.companyName ?? '',
    phone: incoming?.phone ?? '',
    email: incoming?.email ?? '',
    website: incoming?.website ?? '',
    address: incoming?.address ?? '',
    logoDataUrl: incoming?.logoDataUrl ?? '',
    defaultMarkupPercent: incoming?.defaultMarkupPercent ?? '',
    hourlyLaborRate: incoming?.hourlyLaborRate ?? '',
    helperLaborRate: incoming?.helperLaborRate ?? '',
    tripCharge: incoming?.tripCharge ?? '',
    minimumServiceCall: incoming?.minimumServiceCall ?? '',
    defaultSupplierSort: incoming?.defaultSupplierSort ?? 'price',
    templateOptions: normalizeTemplateOptions(incoming?.templateOptions),
  };
}

function normalizeSavedQuote(
  incoming?: Partial<SavedQuotePayload> | null
): SavedQuotePayload | null {
  if (!incoming || !incoming.estimate) return null;

  return {
    customerName: incoming.customerName ?? '',
    jobLocation: incoming.jobLocation ?? '',
    jobDescription: incoming.jobDescription ?? '',
    createdAt: incoming.createdAt ?? new Date().toISOString(),
    estimate: incoming.estimate as EstimatePayload,
    companySettings: normalizeCompanySettings(incoming.companySettings),
  };
}

export function saveCompanySettings(settings: Partial<CompanySettings>) {
  if (!canUseStorage()) return;

  const normalized = normalizeCompanySettings(settings);
  window.localStorage.setItem(COMPANY_SETTINGS_KEY, JSON.stringify(normalized));
}

export function getCompanySettings(): CompanySettings {
  if (!canUseStorage()) return defaultCompanySettings;

  const parsed = safeParse<Partial<CompanySettings> | null>(
    window.localStorage.getItem(COMPANY_SETTINGS_KEY),
    null
  );

  return normalizeCompanySettings(parsed);
}

export function clearCompanySettings() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(COMPANY_SETTINGS_KEY);
}

export function saveQuotePreview(payload: Partial<SavedQuotePayload>) {
  if (!canUseStorage()) return;

  const liveCompanySettings = getCompanySettings();

  const normalizedPayload: SavedQuotePayload = {
    customerName: payload.customerName ?? '',
    jobLocation: payload.jobLocation ?? '',
    jobDescription: payload.jobDescription ?? '',
    createdAt: payload.createdAt ?? new Date().toISOString(),
    estimate: (payload.estimate ?? {}) as EstimatePayload,
    companySettings: normalizeCompanySettings({
      ...liveCompanySettings,
      ...(payload.companySettings || {}),
    }),
  };

  window.localStorage.setItem(QUOTE_PREVIEW_KEY, JSON.stringify(normalizedPayload));
}

export function getQuotePreview(): SavedQuotePayload | null {
  if (!canUseStorage()) return null;

  const parsed = safeParse<Partial<SavedQuotePayload> | null>(
    window.localStorage.getItem(QUOTE_PREVIEW_KEY),
    null
  );

  return normalizeSavedQuote(parsed);
}

export function clearQuotePreview() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(QUOTE_PREVIEW_KEY);
}
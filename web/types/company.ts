export type QuoteTemplateOptions = {
  showScopeOfWork: boolean;
  showMaterials: boolean;
  showLaborBreakdown: boolean;
  showNotes: boolean;
  showWarranty: boolean;
  showExclusions: boolean;
  showSchedule: boolean;
  showCustomerAcceptance: boolean;
};

export type SupplierSortOption =
  | 'cheapest'
  | 'nearest'
  | 'fastest_shipping'
  | 'lowest_shipping_cost'
  | 'best_total_value'
  | 'preferred_supplier';

export type CompanySettings = {
  companyName: string;
  logoDataUrl: string;
  phone: string;
  email: string;
  address: string;
  website: string;
  defaultMarkupPercent: number;
  hourlyLaborRate: number;
  helperLaborRate: number;
  tripCharge: number;
  minimumServiceCall: number;
  preferredSupplierSort: SupplierSortOption;
  templateOptions: QuoteTemplateOptions;
};

export const defaultCompanySettings: CompanySettings = {
  companyName: '',
  logoDataUrl: '',
  phone: '',
  email: '',
  address: '',
  website: '',
  defaultMarkupPercent: 30,
  hourlyLaborRate: 125,
  helperLaborRate: 65,
  tripCharge: 35,
  minimumServiceCall: 125,
  preferredSupplierSort: 'cheapest',
  templateOptions: {
    showScopeOfWork: true,
    showMaterials: true,
    showLaborBreakdown: true,
    showNotes: true,
    showWarranty: false,
    showExclusions: false,
    showSchedule: false,
    showCustomerAcceptance: false,
  },
};
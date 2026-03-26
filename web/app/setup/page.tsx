'use client';

import Link from 'next/link';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import {
  getCompanySettings,
  saveCompanySettings,
} from '../../lib/company-storage';
import {
  CompanySettings,
  defaultCompanySettings,
  SupplierSortOption,
} from '../../types/company';

export default function SetupPage() {
  const [form, setForm] = useState<CompanySettings>(defaultCompanySettings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existing = getCompanySettings();
    setForm(existing);
  }, []);

  function updateField<K extends keyof CompanySettings>(
    key: K,
    value: CompanySettings[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
    setSaved(false);
  }

  function updateTemplateOption(
    key: keyof CompanySettings['templateOptions'],
    value: boolean
  ) {
    setForm((prev) => ({
      ...prev,
      templateOptions: {
        ...prev.templateOptions,
        [key]: value,
      },
    }));
    setSaved(false);
  }

  function handleLogoUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      updateField('logoDataUrl', result);
    };
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    saveCompanySettings(form);
    setSaved(true);
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#f3f4f6',
        padding: '40px 16px',
        fontFamily: 'Arial, Helvetica, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '18px',
            padding: '28px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: '42px',
                fontWeight: 700,
                color: '#111827',
              }}
            >
              Company Setup
            </h1>
            <p
              style={{
                marginTop: '10px',
                marginBottom: 0,
                color: '#4b5563',
                fontSize: '17px',
              }}
            >
              Configure branding, pricing defaults, and quote template options.
            </p>
          </div>

          <Link
            href="/"
            style={{
              display: 'inline-block',
              textDecoration: 'none',
              backgroundColor: '#111827',
              color: '#ffffff',
              padding: '12px 18px',
              borderRadius: '10px',
              fontWeight: 600,
            }}
          >
            Back to Estimator
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          <section
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              padding: '24px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
              marginBottom: '24px',
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: '20px',
                fontSize: '32px',
                color: '#111827',
              }}
            >
              Business Information
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '16px',
              }}
            >
              <Field label="Company Name">
                <input
                  type="text"
                  value={form.companyName}
                  onChange={(e) => updateField('companyName', e.target.value)}
                  placeholder="Your Company Name"
                  style={inputStyle}
                />
              </Field>

              <Field label="Phone">
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="501-555-5555"
                  style={inputStyle}
                />
              </Field>

              <Field label="Email">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="you@company.com"
                  style={inputStyle}
                />
              </Field>

              <Field label="Website">
                <input
                  type="text"
                  value={form.website}
                  onChange={(e) => updateField('website', e.target.value)}
                  placeholder="www.yourcompany.com"
                  style={inputStyle}
                />
              </Field>

              <div style={{ gridColumn: '1 / -1' }}>
                <Field label="Address">
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    placeholder="123 Main St, Benton, AR"
                    style={inputStyle}
                  />
                </Field>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <Field label="Company Logo">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    style={{
                      ...inputStyle,
                      padding: '10px',
                      backgroundColor: '#ffffff',
                    }}
                  />
                </Field>

                {form.logoDataUrl ? (
                  <div
                    style={{
                      marginTop: '16px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      backgroundColor: '#f9fafb',
                      padding: '16px',
                    }}
                  >
                    <p
                      style={{
                        marginTop: 0,
                        marginBottom: '10px',
                        fontWeight: 600,
                        color: '#374151',
                      }}
                    >
                      Logo Preview
                    </p>
                    <img
                      src={form.logoDataUrl}
                      alt="Company logo preview"
                      style={{
                        maxHeight: '110px',
                        width: 'auto',
                        objectFit: 'contain',
                      }}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <section
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              padding: '24px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
              marginBottom: '24px',
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: '20px',
                fontSize: '32px',
                color: '#111827',
              }}
            >
              Default Pricing Rules
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '16px',
              }}
            >
              <Field label="Default Markup Percent">
                <input
                  type="number"
                  value={form.defaultMarkupPercent}
                  onChange={(e) =>
                    updateField('defaultMarkupPercent', Number(e.target.value))
                  }
                  style={inputStyle}
                />
              </Field>

              <Field label="Hourly Labor Rate">
                <input
                  type="number"
                  value={form.hourlyLaborRate}
                  onChange={(e) =>
                    updateField('hourlyLaborRate', Number(e.target.value))
                  }
                  style={inputStyle}
                />
              </Field>

              <Field label="Helper Labor Rate">
                <input
                  type="number"
                  value={form.helperLaborRate}
                  onChange={(e) =>
                    updateField('helperLaborRate', Number(e.target.value))
                  }
                  style={inputStyle}
                />
              </Field>

              <Field label="Trip Charge">
                <input
                  type="number"
                  value={form.tripCharge}
                  onChange={(e) =>
                    updateField('tripCharge', Number(e.target.value))
                  }
                  style={inputStyle}
                />
              </Field>

              <Field label="Minimum Service Call">
                <input
                  type="number"
                  value={form.minimumServiceCall}
                  onChange={(e) =>
                    updateField('minimumServiceCall', Number(e.target.value))
                  }
                  style={inputStyle}
                />
              </Field>

              <Field label="Default Supplier Sort">
                <select
                  value={form.preferredSupplierSort}
                  onChange={(e) =>
                    updateField(
                      'preferredSupplierSort',
                      e.target.value as SupplierSortOption
                    )
                  }
                  style={inputStyle}
                >
                  <option value="cheapest">Cheapest</option>
                  <option value="nearest">Nearest</option>
                  <option value="fastest_shipping">Fastest Shipping</option>
                  <option value="lowest_shipping_cost">
                    Lowest Shipping Cost
                  </option>
                  <option value="best_total_value">Best Total Value</option>
                  <option value="preferred_supplier">Preferred Supplier</option>
                </select>
              </Field>
            </div>
          </section>

          <section
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              padding: '24px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
              marginBottom: '24px',
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: '20px',
                fontSize: '32px',
                color: '#111827',
              }}
            >
              Quote Template Options
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '12px',
              }}
            >
              {[
                ['showScopeOfWork', 'Show Scope of Work'],
                ['showMaterials', 'Show Materials'],
                ['showLaborBreakdown', 'Show Labor Breakdown'],
                ['showNotes', 'Show Notes'],
                ['showWarranty', 'Show Warranty'],
                ['showExclusions', 'Show Exclusions'],
                ['showSchedule', 'Show Schedule'],
                ['showCustomerAcceptance', 'Show Customer Acceptance'],
              ].map(([key, label]) => (
                <label
                  key={key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '10px',
                    padding: '14px',
                    backgroundColor: '#f9fafb',
                    fontSize: '16px',
                    color: '#111827',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={
                      form.templateOptions[
                        key as keyof CompanySettings['templateOptions']
                      ]
                    }
                    onChange={(e) =>
                      updateTemplateOption(
                        key as keyof CompanySettings['templateOptions'],
                        e.target.checked
                      )
                    }
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </section>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="submit"
              style={{
                backgroundColor: '#111827',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '14px 22px',
                fontSize: '16px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Save Company Settings
            </button>

            {saved ? (
              <p
                style={{
                  margin: 0,
                  color: '#15803d',
                  fontWeight: 600,
                  fontSize: '15px',
                }}
              >
                Settings saved.
              </p>
            ) : (
              <p
                style={{
                  margin: 0,
                  color: '#6b7280',
                  fontSize: '15px',
                }}
              >
                Changes are stored in your browser for now.
              </p>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        style={{
          display: 'block',
          marginBottom: '8px',
          fontSize: '15px',
          fontWeight: 600,
          color: '#374151',
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid #d1d5db',
  borderRadius: '10px',
  padding: '12px 14px',
  fontSize: '16px',
  boxSizing: 'border-box',
  backgroundColor: '#ffffff',
  color: '#111827',
};
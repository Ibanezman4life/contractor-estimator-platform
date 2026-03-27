'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  clearQuotePreview,
  getQuotePreview,
  SavedQuotePayload,
  CompanySettings,
  TemplateOptions,
} from '../../lib/quote-storage';

const API_URL = 'http://127.0.0.1:8000';

function getUserId() {
  return 'test-user';
}

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
    defaultSupplierSort:
      (incoming as any)?.defaultSupplierSort ??
      (incoming as any)?.preferredSupplierSort ??
      'price',
    templateOptions: normalizeTemplateOptions(incoming?.templateOptions),
  };
}

export default function QuotePreviewPage() {
  const [quote, setQuote] = useState<SavedQuotePayload | null>(null);
  const [companySettings, setCompanySettings] = useState<CompanySettings>(
    normalizeCompanySettings(null)
  );

  useEffect(() => {
    const savedQuote = getQuotePreview();
    setQuote(savedQuote);

    const loadCompanySettings = async () => {
      try {
        const userId = getUserId();
        const res = await fetch(`${API_URL}/company-settings/${userId}`);
        const data = await res.json();

        if (data?.data) {
          setCompanySettings(normalizeCompanySettings(data.data));
        }
      } catch (error) {
        console.error('Failed to load company settings from backend:', error);
      }
    };

    loadCompanySettings();
  }, []);

  const templateOptions = useMemo(() => {
    return normalizeTemplateOptions(companySettings.templateOptions);
  }, [companySettings]);

  function displayMoney(value: number | string | undefined, fallback = 'N/A') {
    if (value === undefined || value === null || value === '') return fallback;

    const num =
      typeof value === 'number'
        ? value
        : Number(String(value).replace(/[$,]/g, ''));

    if (!Number.isNaN(num)) {
      return `$${num.toFixed(2)}`;
    }

    return String(value);
  }

  function handlePrint() {
    window.print();
  }

  function handleClear() {
    clearQuotePreview();
    setQuote(null);
  }

  if (!quote) {
    return (
      <main
        style={{
          minHeight: '100vh',
          backgroundColor: '#f3f4f6',
          padding: '40px 16px',
          fontFamily: 'Arial, Helvetica, sans-serif',
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              padding: '28px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            }}
          >
            <h1
              style={{
                marginTop: 0,
                fontSize: '36px',
                color: '#111827',
              }}
            >
              Quote Preview
            </h1>
            <p style={{ color: '#4b5563', fontSize: '16px' }}>
              No saved quote preview was found yet.
            </p>

            <div style={{ marginTop: '18px' }}>
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
          </div>
        </div>
      </main>
    );
  }

  const {
    estimate,
    customerName,
    jobLocation,
    jobDescription,
    createdAt,
  } = quote;

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#f3f4f6',
        padding: '40px 16px',
        fontFamily: 'Arial, Helvetica, sans-serif',
      }}
    >
      <div style={{ maxWidth: '950px', margin: '0 auto' }}>
        <div
          className="no-print"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '18px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
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

            <button onClick={handlePrint} style={buttonStyle}>
              Print / Save PDF
            </button>

            <button
              onClick={handleClear}
              style={{
                ...buttonStyle,
                backgroundColor: '#ffffff',
                color: '#111827',
                border: '1px solid #d1d5db',
              }}
            >
              Clear Saved Quote
            </button>
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '18px',
            padding: '36px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '24px',
              flexWrap: 'wrap',
              marginBottom: '28px',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '24px',
            }}
          >
            <div style={{ flex: '1 1 500px' }}>
              {companySettings.logoDataUrl ? (
                <img
                  src={companySettings.logoDataUrl}
                  alt="Company logo"
                  style={{
                    maxHeight: '90px',
                    width: 'auto',
                    objectFit: 'contain',
                    marginBottom: '14px',
                  }}
                />
              ) : null}

              <h1
                style={{
                  margin: 0,
                  fontSize: '38px',
                  color: '#111827',
                }}
              >
                {companySettings.companyName || 'Company Name'}
              </h1>

              <div
                style={{
                  marginTop: '12px',
                  color: '#4b5563',
                  fontSize: '15px',
                  lineHeight: 1.6,
                }}
              >
                <div>{companySettings.phone || 'Phone not set'}</div>
                <div>{companySettings.email || 'Email not set'}</div>
                <div>{companySettings.website || 'Website not set'}</div>
                <div>{companySettings.address || 'Address not set'}</div>
              </div>
            </div>

            <div
              style={{
                flex: '0 1 260px',
                minWidth: '240px',
                textAlign: 'right',
              }}
            >
              <div
                style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  marginBottom: '8px',
                }}
              >
                QUOTE PREVIEW
              </div>
              <div
                style={{
                  fontSize: '30px',
                  fontWeight: 700,
                  color: '#111827',
                }}
              >
                {displayMoney(estimate.total || estimate.estimated_price)}
              </div>
              <div
                style={{
                  marginTop: '10px',
                  fontSize: '14px',
                  color: '#6b7280',
                }}
              >
                Generated: {new Date(createdAt).toLocaleString()}
              </div>
            </div>
          </div>

          <section style={{ marginBottom: '24px' }}>
            <h2 style={sectionTitleStyle}>Customer / Job Information</h2>
            <div style={gridStyle}>
              <InfoRow label="Customer Name" value={customerName || 'N/A'} />
              <InfoRow label="Job Location" value={jobLocation || 'N/A'} />
              <InfoRow label="Job Type" value={String(estimate.job_type || 'N/A')} />
              <InfoRow
                label="Estimated Price"
                value={displayMoney(estimate.estimated_price)}
              />
            </div>

            <div style={{ marginTop: '16px' }}>
              <div style={labelStyle}>Job Description</div>
              <div style={boxStyle}>{jobDescription || 'N/A'}</div>
            </div>
          </section>

          <section style={{ marginBottom: '24px' }}>
            <h2 style={sectionTitleStyle}>Summary</h2>
            <div style={boxStyle}>{String(estimate.summary || 'N/A')}</div>
          </section>

          {templateOptions.showScopeOfWork ? (
            <section style={{ marginBottom: '24px' }}>
              <h2 style={sectionTitleStyle}>Scope of Work</h2>
              <div style={boxStyle}>
                {Array.isArray(estimate.scope_of_work) &&
                estimate.scope_of_work.length > 0 ? (
                  <ol style={{ margin: 0, paddingLeft: '22px', lineHeight: 1.8 }}>
                    {estimate.scope_of_work.map((item, index) => (
                      <li key={index}>{String(item)}</li>
                    ))}
                  </ol>
                ) : (
                  'N/A'
                )}
              </div>
            </section>
          ) : null}

          {templateOptions.showMaterials ? (
            <section style={{ marginBottom: '24px' }}>
              <h2 style={sectionTitleStyle}>Materials</h2>
              <div style={boxStyle}>
                {Array.isArray(estimate.materials) && estimate.materials.length > 0 ? (
                  <ul style={{ margin: 0, paddingLeft: '22px', lineHeight: 1.8 }}>
                    {estimate.materials.map((item, index) => (
                      <li key={index}>{String(item)}</li>
                    ))}
                  </ul>
                ) : (
                  'N/A'
                )}
              </div>
            </section>
          ) : null}

          {templateOptions.showLaborBreakdown ? (
            <section style={{ marginBottom: '24px' }}>
              <h2 style={sectionTitleStyle}>Pricing Breakdown</h2>
              <div style={pricingGridStyle}>
                <PriceCard
                  label="Labor Hours"
                  value={String(estimate.labor_hours ?? 'N/A')}
                />
                <PriceCard
                  label="Labor Cost"
                  value={displayMoney(estimate.labor_cost)}
                />
                <PriceCard
                  label="Trip Charge"
                  value={displayMoney(estimate.trip_charge)}
                />
                <PriceCard
                  label="Subtotal"
                  value={displayMoney(estimate.subtotal)}
                />
                <PriceCard
                  label="Markup Amount"
                  value={displayMoney(estimate.markup_amount)}
                />
                <PriceCard
                  label="Total"
                  value={displayMoney(estimate.total || estimate.estimated_price)}
                  strong
                />
              </div>
            </section>
          ) : null}

          {templateOptions.showNotes ? (
            <section style={{ marginBottom: '24px' }}>
              <h2 style={sectionTitleStyle}>Notes</h2>
              <div style={boxStyle}>
                Pricing is based on the provided project description and current
                company defaults. Final pricing may be adjusted if site conditions,
                access limitations, hidden damage, code issues, customer-selected
                materials, or additional scope are discovered.
              </div>
            </section>
          ) : null}

          {templateOptions.showExclusions ? (
            <section style={{ marginBottom: '24px' }}>
              <h2 style={sectionTitleStyle}>Exclusions</h2>
              <div style={boxStyle}>
                Unless specifically listed, permit fees, patch/paint, specialty
                finishes, major code upgrades, hidden damage repair, and additional
                material upgrades are excluded.
              </div>
            </section>
          ) : null}

          {templateOptions.showWarranty ? (
            <section style={{ marginBottom: '24px' }}>
              <h2 style={sectionTitleStyle}>Warranty</h2>
              <div style={boxStyle}>
                Workmanship warranty terms can be customized per company setup in a
                later version of the app.
              </div>
            </section>
          ) : null}

          {templateOptions.showSchedule ? (
            <section style={{ marginBottom: '24px' }}>
              <h2 style={sectionTitleStyle}>Schedule</h2>
              <div style={boxStyle}>
                Project scheduling will be coordinated after customer approval,
                material availability confirmation, and site access verification.
              </div>
            </section>
          ) : null}

          {Array.isArray(estimate.questions) && estimate.questions.length > 0 ? (
            <section style={{ marginBottom: '24px' }}>
              <h2 style={sectionTitleStyle}>Follow-up Questions</h2>
              <div style={boxStyle}>
                <ul style={{ margin: 0, paddingLeft: '22px', lineHeight: 1.8 }}>
                  {estimate.questions.map((item, index) => (
                    <li key={index}>{String(item)}</li>
                  ))}
                </ul>
              </div>
            </section>
          ) : null}

          {templateOptions.showCustomerAcceptance ? (
            <section style={{ marginBottom: '24px' }}>
              <h2 style={sectionTitleStyle}>Customer Acceptance</h2>
              <div style={acceptanceBoxStyle}>
                <div style={{ marginBottom: '28px' }}>
                  Customer Signature: ______________________________
                </div>
                <div>Date: ______________________________</div>
              </div>
            </section>
          ) : null}

          <div
            style={{
              marginTop: '34px',
              paddingTop: '20px',
              borderTop: '2px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ color: '#6b7280', fontSize: '14px' }}>
              This is a preview version of the customer quote.
            </div>

            <div
              style={{
                fontSize: '30px',
                fontWeight: 700,
                color: '#111827',
              }}
            >
              Total: {displayMoney(estimate.total || estimate.estimated_price)}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }

          body {
            background: #ffffff !important;
          }

          main {
            padding: 0 !important;
            background: #ffffff !important;
          }
        }
      `}</style>
    </main>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div style={labelStyle}>{label}</div>
      <div style={boxStyle}>{value}</div>
    </div>
  );
}

function PriceCard({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '16px',
        backgroundColor: strong ? '#111827' : '#f9fafb',
        color: strong ? '#ffffff' : '#111827',
      }}
    >
      <div
        style={{
          fontSize: '13px',
          fontWeight: 700,
          opacity: strong ? 0.9 : 0.7,
          marginBottom: '8px',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: '24px',
          fontWeight: 700,
        }}
      >
        {value}
      </div>
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  backgroundColor: '#111827',
  color: '#ffffff',
  border: 'none',
  borderRadius: '10px',
  padding: '12px 18px',
  fontWeight: 600,
  cursor: 'pointer',
};

const sectionTitleStyle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: '12px',
  fontSize: '24px',
  color: '#111827',
};

const labelStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 700,
  color: '#6b7280',
  marginBottom: '6px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const boxStyle: React.CSSProperties = {
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  padding: '14px 16px',
  backgroundColor: '#f9fafb',
  color: '#111827',
  lineHeight: 1.7,
};

const acceptanceBoxStyle: React.CSSProperties = {
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  padding: '22px 16px',
  backgroundColor: '#ffffff',
  color: '#111827',
  lineHeight: 1.8,
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '14px',
};

const pricingGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '14px',
};
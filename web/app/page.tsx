'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getCompanySettings } from '../lib/company-storage';
import { saveQuotePreview } from '../lib/quote-storage';
import { CompanySettings, defaultCompanySettings } from '../types/company';

type SupplierResult = {
  supplier?: string;
  item_name?: string;
  price?: number | string;
  shipping_cost?: number | string;
  shipping_time?: string;
  distance?: string;
  in_stock?: boolean;
  product_url?: string;
};

type AnalyzeResponse = {
  job_type?: string;
  summary?: string;
  scope_of_work?: string[];
  estimated_price?: number | string;
  materials?: string[];
  labor_hours?: number | string;
  labor_cost?: number | string;
  trip_charge?: number | string;
  markup_amount?: number | string;
  subtotal?: number | string;
  total?: number | string;
  questions?: string[];
  supplier_results?: SupplierResult[];
  raw_response?: unknown;
};

export default function Home() {
  const [jobDescription, setJobDescription] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [jobLocation, setJobLocation] = useState('');
  const [companySettings, setCompanySettings] = useState<CompanySettings>(
    defaultCompanySettings
  );
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_URL?.trim() || 'http://127.0.0.1:8000';

  useEffect(() => {
    const settings = getCompanySettings();
    setCompanySettings(settings);
  }, []);

  async function handleGenerate() {
    if (!jobDescription.trim()) {
      setError('Enter a job description first.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`${apiBaseUrl}/analyze-job`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_name: customerName,
          location: jobLocation,
          job_description: jobDescription,
          company_settings: companySettings,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Backend error ${response.status}: ${text}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function handlePreviewQuote() {
    if (!result) return;

    saveQuotePreview({
      customerName,
      jobLocation,
      jobDescription,
      companySettings,
      estimate: result,
      createdAt: new Date().toISOString(),
    });

    window.location.href = '/quote-preview';
  }

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
              {companySettings.companyName || 'Estimator'}
            </h1>
            <p
              style={{
                marginTop: '10px',
                marginBottom: 0,
                color: '#4b5563',
                fontSize: '17px',
              }}
            >
              Generate AI-assisted estimates using your saved company settings.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link
              href="/quote-preview"
              style={{
                display: 'inline-block',
                textDecoration: 'none',
                backgroundColor: '#ffffff',
                color: '#111827',
                padding: '12px 18px',
                borderRadius: '10px',
                fontWeight: 600,
                border: '1px solid #d1d5db',
              }}
            >
              Quote Preview
            </Link>

            <Link
              href="/setup"
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
              Setup
            </Link>
          </div>
        </div>

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
            New Estimate
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
              marginBottom: '16px',
            }}
          >
            <Field label="Customer Name">
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="John Smith"
                style={inputStyle}
              />
            </Field>

            <Field label="Job Location">
              <input
                type="text"
                value={jobLocation}
                onChange={(e) => setJobLocation(e.target.value)}
                placeholder="Benton, AR"
                style={inputStyle}
              />
            </Field>
          </div>

          <Field label="Job Description">
            <textarea
              placeholder="Describe the job in detail..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              style={{
                ...inputStyle,
                minHeight: '150px',
                resize: 'vertical',
              }}
            />
          </Field>

          <div
            style={{
              marginTop: '18px',
              padding: '16px',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              backgroundColor: '#f9fafb',
            }}
          >
            <p
              style={{
                marginTop: 0,
                marginBottom: '10px',
                fontWeight: 700,
                color: '#111827',
              }}
            >
              Active Company Defaults
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '8px 16px',
                color: '#374151',
                fontSize: '15px',
              }}
            >
              <div>Markup: {companySettings.defaultMarkupPercent}%</div>
              <div>Labor Rate: {displayMoney(companySettings.hourlyLaborRate)}</div>
              <div>Helper Rate: {displayMoney(companySettings.helperLaborRate)}</div>
              <div>Trip Charge: {displayMoney(companySettings.tripCharge)}</div>
              <div>
                Minimum Service Call: {displayMoney(companySettings.minimumServiceCall)}
              </div>
              <div>Supplier Sort: {companySettings.preferredSupplierSort}</div>
            </div>
          </div>

          {error ? (
            <div
              style={{
                marginTop: '16px',
                backgroundColor: '#fef2f2',
                color: '#b91c1c',
                border: '1px solid #fecaca',
                borderRadius: '10px',
                padding: '12px 14px',
              }}
            >
              {error}
            </div>
          ) : null}

          <div
            style={{
              marginTop: '18px',
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={handleGenerate}
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
              {loading ? 'Generating...' : 'Generate Quote'}
            </button>

            {result ? (
              <button
                onClick={handlePreviewQuote}
                style={{
                  backgroundColor: '#ffffff',
                  color: '#111827',
                  border: '1px solid #d1d5db',
                  borderRadius: '10px',
                  padding: '14px 22px',
                  fontSize: '16px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Open Quote Preview
              </button>
            ) : null}
          </div>
        </section>

        {result ? (
          <section
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              padding: '24px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
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
              Estimate Result
            </h2>

            <div style={{ marginBottom: '18px' }}>
              <LabelValue label="Job Type" value={result.job_type || 'N/A'} />
              <LabelValue label="Summary" value={result.summary || 'N/A'} />
              <LabelValue
                label="Estimated Price"
                value={displayMoney(result.estimated_price)}
              />
            </div>

            {companySettings.templateOptions.showScopeOfWork ? (
              <Block title="Scope of Work">
                {Array.isArray(result.scope_of_work) && result.scope_of_work.length > 0 ? (
                  <ul style={listStyle}>
                    {result.scope_of_work.map((item, index) => (
                      <li key={index} style={{ marginBottom: '8px' }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={plainTextStyle}>N/A</p>
                )}
              </Block>
            ) : null}

            {companySettings.templateOptions.showMaterials ? (
              <Block title="Materials">
                {Array.isArray(result.materials) && result.materials.length > 0 ? (
                  <ul style={listStyle}>
                    {result.materials.map((item, index) => (
                      <li key={index} style={{ marginBottom: '8px' }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={plainTextStyle}>N/A</p>
                )}
              </Block>
            ) : null}

            <Block title="Pricing Breakdown">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '10px 16px',
                }}
              >
                <LabelValue
                  label="Labor Hours"
                  value={result.labor_hours ?? 'N/A'}
                />
                <LabelValue
                  label="Labor Cost"
                  value={displayMoney(result.labor_cost)}
                />
                <LabelValue
                  label="Trip Charge"
                  value={displayMoney(result.trip_charge)}
                />
                <LabelValue
                  label="Subtotal"
                  value={displayMoney(result.subtotal)}
                />
                <LabelValue
                  label="Markup Amount"
                  value={displayMoney(result.markup_amount)}
                />
                <LabelValue
                  label="Total"
                  value={displayMoney(result.total)}
                />
              </div>
            </Block>

            <Block title="Supplier Results">
              {Array.isArray(result.supplier_results) &&
              result.supplier_results.length > 0 ? (
                <div
                  style={{
                    display: 'grid',
                    gap: '12px',
                  }}
                >
                  {result.supplier_results.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        padding: '14px',
                        backgroundColor: '#f9fafb',
                      }}
                    >
                      <div style={{ fontWeight: 700, marginBottom: '8px' }}>
                        {item.item_name || 'Unnamed Item'}
                      </div>
                      <div style={{ color: '#374151', fontSize: '15px' }}>
                        <div>Supplier: {item.supplier || 'N/A'}</div>
                        <div>Price: {displayMoney(item.price)}</div>
                        <div>Shipping Cost: {displayMoney(item.shipping_cost)}</div>
                        <div>Shipping Time: {item.shipping_time || 'N/A'}</div>
                        <div>Distance: {item.distance || 'N/A'}</div>
                        <div>
                          In Stock:{' '}
                          {typeof item.in_stock === 'boolean'
                            ? item.in_stock
                              ? 'Yes'
                              : 'No'
                            : 'N/A'}
                        </div>
                        {item.product_url ? (
                          <div style={{ marginTop: '8px' }}>
                            <a
                              href={item.product_url}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                color: '#2563eb',
                                textDecoration: 'none',
                                fontWeight: 600,
                              }}
                            >
                              View Product
                            </a>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={plainTextStyle}>No supplier results returned yet.</p>
              )}
            </Block>

            <Block title="Follow-up Questions">
              {Array.isArray(result.questions) && result.questions.length > 0 ? (
                <ul style={listStyle}>
                  {result.questions.map((item, index) => (
                    <li key={index} style={{ marginBottom: '8px' }}>
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={plainTextStyle}>None</p>
              )}
            </Block>
          </section>
        ) : null}
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

function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: '22px' }}>
      <h3
        style={{
          fontSize: '22px',
          marginTop: 0,
          marginBottom: '12px',
          color: '#111827',
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

function LabelValue({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: '8px' }}>
      <span style={{ fontWeight: 700, color: '#111827' }}>{label}: </span>
      <span style={{ color: '#374151' }}>{value}</span>
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

const listStyle: React.CSSProperties = {
  margin: 0,
  paddingLeft: '20px',
  color: '#374151',
  fontSize: '15px',
};

const plainTextStyle: React.CSSProperties = {
  margin: 0,
  color: '#374151',
  fontSize: '15px',
};
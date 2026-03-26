'use client';

import Link from 'next/link';
import { ChangeEvent, useEffect, useState } from 'react';
import {
  CompanySettings,
  getCompanySettings,
  saveCompanySettings,
} from '../../lib/quote-storage';

function createDefaultSettings(): CompanySettings {
  return {
    companyName: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    logoDataUrl: '',
    defaultMarkupPercent: 30,
    hourlyLaborRate: 125,
    helperLaborRate: 65,
    tripCharge: 35,
    minimumServiceCall: 125,
    defaultSupplierSort: 'price',
    templateOptions: {
      showScopeOfWork: true,
      showMaterials: true,
      showLaborBreakdown: true,
      showNotes: true,
      showExclusions: false,
      showWarranty: false,
      showSchedule: false,
      showCustomerAcceptance: false,
    },
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<CompanySettings>(createDefaultSettings());
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    const saved = getCompanySettings();
    setSettings({
      ...createDefaultSettings(),
      ...saved,
      templateOptions: {
        ...createDefaultSettings().templateOptions,
        ...(saved?.templateOptions || {}),
      },
    });
  }, []);

  function updateField<K extends keyof CompanySettings>(
    field: K,
    value: CompanySettings[K]
  ) {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function updateTemplateOption(
    field: keyof CompanySettings['templateOptions'],
    checked: boolean
  ) {
    setSettings((prev) => ({
      ...prev,
      templateOptions: {
        ...prev.templateOptions,
        [field]: checked,
      },
    }));
  }

  function handleLogoUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setSettings((prev) => ({
        ...prev,
        logoDataUrl: result,
      }));
    };
    reader.readAsDataURL(file);
  }

  function handleSave() {
    saveCompanySettings(settings);
    setSaveMessage('Company settings saved.');
    window.setTimeout(() => {
      setSaveMessage('');
    }, 2500);
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#f3f4f6',
        padding: '32px 16px 48px',
        fontFamily: 'Arial, Helvetica, sans-serif',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <section
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '28px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
            marginBottom: '22px',
            display: 'flex',
            justifyContent: 'space-between',
            gap: '16px',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: '34px',
                color: '#111827',
              }}
            >
              Company Setup
            </h1>
            <p
              style={{
                marginTop: '10px',
                marginBottom: 0,
                color: '#6b7280',
                fontSize: '16px',
              }}
            >
              Configure branding, pricing defaults, and quote template options.
            </p>
          </div>

          <Link href="/" style={primaryButtonLinkStyle}>
            Back to Estimator
          </Link>
        </section>

        <section style={cardStyle}>
          <h2 style={sectionHeadingStyle}>Business Information</h2>

          <div style={threeColumnGridStyle}>
            <div>
              <label style={labelStyle}>Company Name</label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => updateField('companyName', e.target.value)}
                placeholder="Your Company Name"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Phone</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="501-555-5555"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="you@company.com"
                style={inputStyle}
              />
            </div>
          </div>

          <div style={twoColumnGridStyle}>
            <div>
              <label style={labelStyle}>Website</label>
              <input
                type="text"
                value={settings.website}
                onChange={(e) => updateField('website', e.target.value)}
                placeholder="www.yourcompany.com"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Address</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => updateField('address', e.target.value)}
                placeholder="123 Main St, Benton, AR"
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ marginTop: '18px' }}>
            <label style={labelStyle}>Company Logo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              style={fileInputStyle}
            />
            {settings.logoDataUrl ? (
              <div
                style={{
                  marginTop: '16px',
                  padding: '16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '14px',
                  backgroundColor: '#f9fafb',
                }}
              >
                <img
                  src={settings.logoDataUrl}
                  alt="Company logo preview"
                  style={{
                    maxHeight: '80px',
                    width: 'auto',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              </div>
            ) : null}
          </div>
        </section>

        <section style={cardStyle}>
          <h2 style={sectionHeadingStyle}>Default Pricing Rules</h2>

          <div style={threeColumnGridStyle}>
            <div>
              <label style={labelStyle}>Default Markup Percent</label>
              <input
                type="number"
                value={settings.defaultMarkupPercent}
                onChange={(e) => updateField('defaultMarkupPercent', e.target.value)}
                placeholder="30"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Hourly Labor Rate</label>
              <input
                type="number"
                value={settings.hourlyLaborRate}
                onChange={(e) => updateField('hourlyLaborRate', e.target.value)}
                placeholder="125"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Helper Labor Rate</label>
              <input
                type="number"
                value={settings.helperLaborRate}
                onChange={(e) => updateField('helperLaborRate', e.target.value)}
                placeholder="65"
                style={inputStyle}
              />
            </div>
          </div>

          <div style={threeColumnGridStyle}>
            <div>
              <label style={labelStyle}>Trip Charge</label>
              <input
                type="number"
                value={settings.tripCharge}
                onChange={(e) => updateField('tripCharge', e.target.value)}
                placeholder="35"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Minimum Service Call</label>
              <input
                type="number"
                value={settings.minimumServiceCall}
                onChange={(e) => updateField('minimumServiceCall', e.target.value)}
                placeholder="125"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Default Supplier Sort</label>
              <select
                value={settings.defaultSupplierSort}
                onChange={(e) => updateField('defaultSupplierSort', e.target.value)}
                style={inputStyle}
              >
                <option value="price">Cheapest</option>
                <option value="fastest">Fastest</option>
                <option value="closest">Closest</option>
              </select>
            </div>
          </div>
        </section>

        <section style={cardStyle}>
          <h2 style={sectionHeadingStyle}>Quote Template Options</h2>

          <div style={threeColumnGridStyle}>
            <CheckboxCard
              label="Show Scope of Work"
              checked={settings.templateOptions.showScopeOfWork}
              onChange={(checked) => updateTemplateOption('showScopeOfWork', checked)}
            />
            <CheckboxCard
              label="Show Materials"
              checked={settings.templateOptions.showMaterials}
              onChange={(checked) => updateTemplateOption('showMaterials', checked)}
            />
            <CheckboxCard
              label="Show Labor Breakdown"
              checked={settings.templateOptions.showLaborBreakdown}
              onChange={(checked) => updateTemplateOption('showLaborBreakdown', checked)}
            />
            <CheckboxCard
              label="Show Notes"
              checked={settings.templateOptions.showNotes}
              onChange={(checked) => updateTemplateOption('showNotes', checked)}
            />
            <CheckboxCard
              label="Show Warranty"
              checked={settings.templateOptions.showWarranty}
              onChange={(checked) => updateTemplateOption('showWarranty', checked)}
            />
            <CheckboxCard
              label="Show Exclusions"
              checked={settings.templateOptions.showExclusions}
              onChange={(checked) => updateTemplateOption('showExclusions', checked)}
            />
            <CheckboxCard
              label="Show Schedule"
              checked={settings.templateOptions.showSchedule}
              onChange={(checked) => updateTemplateOption('showSchedule', checked)}
            />
            <CheckboxCard
              label="Show Customer Acceptance"
              checked={settings.templateOptions.showCustomerAcceptance}
              onChange={(checked) =>
                updateTemplateOption('showCustomerAcceptance', checked)
              }
            />
          </div>
        </section>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            flexWrap: 'wrap',
          }}
        >
          <button onClick={handleSave} style={primaryButtonStyle}>
            Save Company Settings
          </button>

          <div style={{ color: '#6b7280', fontSize: '15px' }}>
            {saveMessage || 'Changes are stored in your browser for now.'}
          </div>
        </div>
      </div>
    </main>
  );
}

function CheckboxCard({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        border: '1px solid #e5e7eb',
        borderRadius: '14px',
        padding: '16px',
        backgroundColor: '#f9fafb',
        cursor: 'pointer',
        fontSize: '16px',
        color: '#111827',
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}

const cardStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '20px',
  padding: '24px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
  marginBottom: '22px',
};

const sectionHeadingStyle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: '18px',
  fontSize: '28px',
  color: '#111827',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '8px',
  fontSize: '15px',
  fontWeight: 700,
  color: '#374151',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: '48px',
  padding: '0 14px',
  border: '1px solid #d1d5db',
  borderRadius: '12px',
  fontSize: '16px',
  color: '#111827',
  backgroundColor: '#ffffff',
  boxSizing: 'border-box',
};

const fileInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  border: '1px solid #d1d5db',
  borderRadius: '12px',
  fontSize: '16px',
  backgroundColor: '#ffffff',
  boxSizing: 'border-box',
};

const primaryButtonStyle: React.CSSProperties = {
  backgroundColor: '#0f172a',
  color: '#ffffff',
  border: 'none',
  borderRadius: '12px',
  padding: '14px 22px',
  fontSize: '16px',
  fontWeight: 700,
  cursor: 'pointer',
};

const primaryButtonLinkStyle: React.CSSProperties = {
  display: 'inline-block',
  textDecoration: 'none',
  backgroundColor: '#0f172a',
  color: '#ffffff',
  borderRadius: '12px',
  padding: '14px 22px',
  fontSize: '16px',
  fontWeight: 700,
};

const threeColumnGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '14px',
  marginBottom: '14px',
};

const twoColumnGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  gap: '14px',
};
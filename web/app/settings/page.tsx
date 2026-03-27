'use client';

import { useEffect, useState } from 'react';

const API_URL = 'http://127.0.0.1:8000';

function getUserId() {
  return 'test-user';
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>({
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
  });

  useEffect(() => {
    const load = async () => {
      const userId = getUserId();

      const res = await fetch(`${API_URL}/company-settings/${userId}`);
      const data = await res.json();

      if (data?.data) {
        setSettings((prev: any) => ({
          ...prev,
          ...data.data,
          templateOptions: {
            ...prev.templateOptions,
            ...(data.data.templateOptions || {}),
          },
        }));
      }
    };

    load();
  }, []);

  const update = (field: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateToggle = (field: string, value: boolean) => {
    setSettings((prev: any) => ({
      ...prev,
      templateOptions: {
        ...prev.templateOptions,
        [field]: value,
      },
    }));
  };

  const save = async () => {
    const userId = getUserId();

    const res = await fetch(`${API_URL}/company-settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, data: settings }),
    });

    if (!res.ok) {
      alert('Save failed');
      return;
    }

    alert('Saved');
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Company Settings</h1>

      <div style={{ display: 'grid', gap: 12, maxWidth: 700 }}>
        <input
          placeholder="Company Name"
          value={settings.companyName}
          onChange={(e) => update('companyName', e.target.value)}
          style={inputStyle}
        />

        <input
          placeholder="Phone"
          value={settings.phone}
          onChange={(e) => update('phone', e.target.value)}
          style={inputStyle}
        />

        <input
          placeholder="Email"
          value={settings.email}
          onChange={(e) => update('email', e.target.value)}
          style={inputStyle}
        />

        <input
          placeholder="Website"
          value={settings.website}
          onChange={(e) => update('website', e.target.value)}
          style={inputStyle}
        />

        <input
          placeholder="Address"
          value={settings.address}
          onChange={(e) => update('address', e.target.value)}
          style={inputStyle}
        />
      </div>

      <h3 style={{ marginTop: 24 }}>Template Options</h3>

      <div style={{ display: 'grid', gap: 8, maxWidth: 700 }}>
        {Object.entries(settings.templateOptions).map(([key, value]: any) => (
          <label key={key} style={{ display: 'block' }}>
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => updateToggle(key, e.target.checked)}
            />{' '}
            {key}
          </label>
        ))}
      </div>

      <button onClick={save} style={buttonStyle}>
        Save Settings
      </button>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '12px',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  fontSize: '16px',
};

const buttonStyle: React.CSSProperties = {
  marginTop: '20px',
  padding: '12px 18px',
  backgroundColor: '#111827',
  color: '#ffffff',
  border: 'none',
  borderRadius: '10px',
  fontWeight: 600,
  cursor: 'pointer',
};
import React, { createContext, useContext, useEffect, useState } from 'react';
import { dbStore, fetchSettingsAsync } from '../lib/supabase';
import { SiteSettings } from '../types';

interface SiteSettingsContextValue {
  settings: SiteSettings;
  loading: boolean;
  updateSettings: (patch: Partial<SiteSettings>) => void;
}

const SiteSettingsContext = createContext<SiteSettingsContextValue | undefined>(undefined);

export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(dbStore.getSettings());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettingsAsync().then(fetched => {
      setSettings(fetched);
      setLoading(false);
    });
  }, []);

  const updateSettings = (patch: Partial<SiteSettings>) => {
    const updated = dbStore.saveSettings(patch);
    setSettings({ ...updated });
  };

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, updateSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = (): SiteSettingsContextValue => {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  return ctx;
};

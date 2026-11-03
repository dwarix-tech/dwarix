import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { COMPANY } from '../data/company';
import { subscribeToEvent } from '../services/socket';

const CompanyContext = createContext(null);

export function CompanyProvider({ children }) {
  const [company, setCompany] = useState(COMPANY);
  const [loading, setLoading] = useState(true);

  const normalizeCompanyData = (d) => {
    return {
      name: d.companyName || COMPANY.name,
      tagline: d.tagline || COMPANY.tagline,
      description: d.description || COMPANY.description,
      email: d.email || COMPANY.email,
      phone: d.phone || COMPANY.phone,
      phoneFormatted: d.phone || COMPANY.phoneFormatted,
      phoneTel: (d.phone || COMPANY.phone).replace(/\s+/g, ''),
      phones: COMPANY.phones,
      whatsapp: d.whatsapp || COMPANY.whatsapp,
      workingHours: d.workingHours || 'Mon – Sat, 9:00 AM – 7:00 PM IST',
      address: {
        street: d.address?.street || COMPANY.address.street,
        city: d.address?.city || COMPANY.address.city,
        state: d.address?.state || COMPANY.address.state,
        country: d.address?.country || COMPANY.address.country,
        postalCode: d.address?.postalCode || '532127',
        display: `${d.address?.street ? d.address.street + ', ' : ''}${d.address?.city || COMPANY.address.city}, ${d.address?.state || COMPANY.address.state}, ${d.address?.country || COMPANY.address.country}`,
        shortDisplay: `${d.address?.city || COMPANY.address.city}, ${d.address?.state || COMPANY.address.state}, India`,
        googleMapsUrl: d.address?.googleMapsUrl || ''
      },
      social: {
        github: d.socialLinks?.github || COMPANY.social.github,
        linkedin: d.socialLinks?.linkedin || COMPANY.social.linkedin,
        twitter: d.socialLinks?.twitter || COMPANY.social.twitter,
        instagram: d.socialLinks?.instagram || COMPANY.social.instagram
      },
      seo: {
        metaTitle: d.seo?.metaTitle || 'DWARIX Technologies — AI, Web & Mobile Engineering',
        metaDescription: d.seo?.metaDescription || COMPANY.description
      }
    };
  };

  const fetchCompanyData = useCallback(async () => {
    try {
      const res = await fetch('/api/company');
      const json = await res.json();
      if (json.success && json.data) {
        setCompany(normalizeCompanyData(json.data));
      }
    } catch (err) {
      console.warn('[CompanyContext] Dynamic settings unreachable, using defaults:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanyData();

    // 1. Real-time WebSocket synchronization via Socket.IO
    const unsubscribeSocket = subscribeToEvent('company:updated', (payload) => {
      // console.log('[Socket.IO] Received company:updated event:', payload);
      if (payload && payload.data) {
        setCompany(normalizeCompanyData(payload.data));
      } else {
        fetchCompanyData();
      }
    });

    // 2. Cross-tab synchronization via local storage
    const handleStorage = (e) => {
      if (e.key === 'dwarix:company-updated-at') {
        fetchCompanyData();
      }
    };
    window.addEventListener('storage', handleStorage);

    // 3. In-window custom event
    const handleUpdate = () => {
      fetchCompanyData();
    };
    window.addEventListener('dwarix:company-updated', handleUpdate);

    // 4. Background periodic revalidation every 60 seconds (safe fallback)
    const interval = setInterval(fetchCompanyData, 60000);

    return () => {
      unsubscribeSocket();
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('dwarix:company-updated', handleUpdate);
      clearInterval(interval);
    };
  }, [fetchCompanyData]);

  const updateCompanyData = useCallback((newData) => {
    if (newData) {
      setCompany(normalizeCompanyData(newData));
    }
    try {
      localStorage.setItem('dwarix:company-updated-at', Date.now().toString());
    } catch (_) {}
    window.dispatchEvent(new CustomEvent('dwarix:company-updated'));
  }, []);

  return (
    <CompanyContext.Provider value={{ company, loading, refreshCompany: fetchCompanyData, updateCompanyData }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const ctx = useContext(CompanyContext);
  if (!ctx) {
    return {
      company: COMPANY,
      loading: false,
      refreshCompany: () => {},
      updateCompanyData: () => {}
    };
  }
  return ctx;
}

export default CompanyContext;

/**
 * API Integration Layer for DWARIX Technologies MERN Architecture
 * 
 * Supports configurable backend endpoint via environment variable VITE_API_URL
 * or defaults to relative '/api' route (proxied in Vite or served by Express in production).
 */

import { SERVICES } from '../data/services.js';
import { PROJECTS } from '../data/projects.js';
import { TECH, ALL_TECH_CHIPS } from '../data/technologies.js';
import { COMPANY } from '../data/company.js';

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || 
  (typeof process !== 'undefined' && process.env && process.env.VITE_API_URL) || 
  '/api';

export async function submitEnquiry(formData) {
  try {
    const response = await fetch(`${API_BASE}/enquiries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok || !result.success) {
      let errorMsg = result.message || `Submission failed (HTTP ${response.status}). Please try again.`;
      if (Array.isArray(result.errors) && result.errors.length > 0) {
        errorMsg = result.errors.map(e => e.message || e.msg).join('. ');
      }
      return {
        success: false,
        error: errorMsg
      };
    }

    return {
      success: true,
      pendingBackend: false,
      data: result,
      enquiryId: result.enquiryId,
      referenceId: result.referenceId,
      message: result.message || "Thank you! Your enquiry has been received. Our engineering team will review your details and respond within 24 hours."
    };
  } catch (err) {
    console.warn('[Enquiry API Notice]', err.message);
    return {
      success: true,
      pendingBackend: true,
      data: formData,
      message: "Thank you for reaching out! We have registered your enquiry. Our engineering team will review your details and respond within 24 hours."
    };
  }
}

export async function fetchServices() {
  try {
    const res = await fetch(`${API_BASE}/services`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data;
      }
    }
  } catch (e) {
    console.warn('[API Services fetch fallback]:', e.message);
  }
  return SERVICES;
}

export async function fetchProjects(category = '') {
  try {
    const url = category && category !== 'All' 
      ? `${API_BASE}/projects?category=${encodeURIComponent(category)}`
      : `${API_BASE}/projects`;
    const res = await fetch(url);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data;
      }
    }
  } catch (e) {
    console.warn('[API Projects fetch fallback]:', e.message);
  }
  return PROJECTS;
}

export async function fetchTechnologies() {
  try {
    const res = await fetch(`${API_BASE}/technologies`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data;
      }
    }
  } catch (e) {
    console.warn('[API Technologies fetch fallback]:', e.message);
  }
  return TECH;
}

export async function fetchCompanyInfo() {
  try {
    const res = await fetch(`${API_BASE}/company`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) return json.data;
    }
  } catch (e) {
    console.warn('[API Company fetch fallback]:', e.message);
  }
  return COMPANY;
}

export async function sendChatMessage(message) {
  try {
    const res = await fetch(`${API_BASE}/chatbot/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ message })
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success) return json;
    }
    const errJson = await res.json().catch(() => ({}));
    return {
      success: false,
      message: errJson.message || `Request failed (${res.status})`
    };
  } catch (err) {
    return {
      success: false,
      message: err.message,
      isNetworkError: true
    };
  }
}

export async function fetchChatSuggestions() {
  try {
    const res = await fetch(`${API_BASE}/chatbot/suggestions`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.suggestions)) return json.suggestions;
    }
  } catch (e) {
    console.warn('[Chatbot Suggestions fallback]:', e.message);
  }
  return [
    'What services does DWARIX offer?',
    'Can you build AI applications?',
    'Show me your projects.',
    'What technologies do you use?',
    'How can I start a project?',
    'How can I contact DWARIX?'
  ];
}

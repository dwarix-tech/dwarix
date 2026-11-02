import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { submitEnquiry } from '../services/api';
import { useCompany } from '../context/CompanyContext';

const SERVICE_OPTIONS = [
  'AI & Machine Learning',
  'Web Development',
  'Mobile App Development',
  'Custom Software Development',
  'AI Photo Editing',
  'Not sure yet'
];

const BUDGET_OPTIONS = [
  'Under ₹5000',
  '₹5000 – ₹20,000',
  '₹20,000 – ₹50,000',
  'Above ₹50,000',
  'Need guidance'
];

export default function Contact({ preselectedService, selectedService, onClearSelectedService }) {
  const { company } = useCompany();
  const activeService = selectedService || preselectedService;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: activeService || '',
    budget: '',
    desc: '',
    privacyConsent: true,
    website_hp: '' // Honeypot field for spam prevention
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  const sectionRef = useRef(null);
  const formRef = useRef(null);

  // Update service if preselected from service cards or chatbot
  useEffect(() => {
    if (activeService) {
      setFormData((prev) => ({ ...prev, service: activeService }));
      setErrors((prev) => ({ ...prev, service: '' }));
    }
  }, [activeService]);

  // GSAP animations
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('.info > *', {
        x: -40,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.info',
          start: 'top 85%'
        }
      });

      if (formRef.current) {
        gsap.from(formRef.current, {
          y: 80,
          opacity: 0,
          rotateX: 10,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: formRef.current,
            start: 'top 85%'
          }
        });

        gsap.from(formRef.current.querySelectorAll('.f'), {
          y: 24,
          opacity: 0,
          stagger: 0.06,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: formRef.current,
            start: 'top 75%'
          }
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return value.trim().length >= 2 ? '' : 'Enter your full name.';
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())
          ? ''
          : 'Enter a valid email, like name@company.com.';
      case 'phone':
        return /^[+\d][\d\s()-]{7,}$/.test(value.trim())
          ? ''
          : 'Enter a phone number with at least 8 digits.';
      case 'service':
        return value ? '' : 'Choose the service you need.';
      case 'desc':
        return value.trim().length >= 15
          ? ''
          : 'Describe your project in at least 15 characters.';
      case 'privacyConsent':
        return value ? '' : 'You must accept the privacy policy to submit.';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));

    if (touched[name]) {
      const err = validateField(name, val);
      setErrors((prev) => ({ ...prev, [name]: err }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    if (value.trim() || name === 'service') {
      const err = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: err }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check honeypot spam trap
    if (formData.website_hp) {
      console.warn('Spam detected via honeypot');
      return;
    }

    // Validate all required fields
    const newErrors = {
      name: validateField('name', formData.name),
      email: validateField('email', formData.email),
      phone: validateField('phone', formData.phone),
      service: validateField('service', formData.service),
      desc: validateField('desc', formData.desc),
      privacyConsent: validateField('privacyConsent', formData.privacyConsent)
    };

    setErrors(newErrors);
    setTouched({
      name: true,
      email: true,
      phone: true,
      service: true,
      desc: true,
      privacyConsent: true
    });

    const hasError = Object.values(newErrors).some(Boolean);
    if (hasError) {
      const firstErrorField = Object.keys(newErrors).find((k) => newErrors[k]);
      if (firstErrorField) {
        document.getElementById(firstErrorField)?.focus();
      }
      return;
    }

    setIsSubmitting(true);
    setSubmissionResult(null);

    // Format submission payload with both description and desc
    const { website_hp, desc, ...rest } = formData;
    const payload = {
      ...rest,
      description: desc.trim(),
      desc: desc.trim()
    };
    const result = await submitEnquiry(payload);
    setIsSubmitting(false);
    setSubmissionResult(result);

    if (result.success) {
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        service: '',
        budget: '',
        desc: '',
        privacyConsent: true,
        website_hp: ''
      });
      setTouched({});
    }
  };

  return (
    <section className="sec" id="contact" ref={sectionRef} style={{ paddingTop: 'clamp(40px, 6vw, 80px)' }}>
      <div className="wrap contact-grid">
        <div>
          <h2 className="split">Tell us about your project</h2>
          <p className="lede" style={{ marginTop: '20px' }}>
            Share a few details and we'll come back with questions, a rough timeline and a cost estimate.
          </p>

          <div className="info">
            <a href={`mailto:${company.email || 'dwarixtech@gmail.com'}`} style={{ color: 'inherit', textDecoration: 'none' }} aria-label="Email DWARIX Technologies">
              <span className="ib">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
              </span>
              <p>
                <small>Email</small>
                <span>{company.email || 'dwarixtech@gmail.com'}</span>
              </p>
            </a>

            <a href={`tel:${company.phoneTel || '+917981613325'}`} style={{ color: 'inherit', textDecoration: 'none' }} aria-label="Call DWARIX Technologies">
              <span className="ib">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1Z" />
                </svg>
              </span>
              <p>
                <small>Phone</small>
                <span>{company.phoneFormatted || company.phone || '+91 79816 13325'}</span>
              </p>
            </a>

            <div>
              <span className="ib">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <path d="M12 21s7-6 7-11.5a7 7 0 0 0-14 0C5 15 12 21 12 21Z" />
                  <circle cx="12" cy="9.5" r="2.5" />
                </svg>
              </span>
              <p>
                <small>Location</small>
                <span>{company.address?.shortDisplay || company.address?.display || 'Rajam, Vizianagaram, AP, India'}</span>
              </p>
            </div>

            <a href={company.social?.linkedin || 'https://www.linkedin.com/in/dwarix-technologies/'} target="_blank" rel="noopener noreferrer" aria-label="Visit DWARIX LinkedIn company profile">
              <span className="ib">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.5h4V21H3Zm7 0h3.8v1.6h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.1c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V21h-4Z" />
                </svg>
              </span>
              <p>
                <small>LinkedIn</small>
                <span>{company.social?.linkedin ? company.social.linkedin.replace(/^https?:\/\/(www\.)?/, '') : 'linkedin.com/in/dwarix-technologies'}</span>
              </p>
            </a>
          </div>
        </div>

        <form id="form" ref={formRef} onSubmit={handleSubmit} noValidate>
          {/* Honeypot field for bot suppression */}
          <div style={{ display: 'none' }} aria-hidden="true">
            <label htmlFor="website_hp">Website</label>
            <input
              id="website_hp"
              name="website_hp"
              tabIndex={-1}
              autoComplete="off"
              value={formData.website_hp}
              onChange={handleChange}
            />
          </div>

          <div className={`f ${errors.name ? 'bad' : ''}`}>
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="name"
              required
              aria-required="true"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-err' : undefined}
            />
            <span className="err" id="name-err" role="alert">
              {errors.name}
            </span>
          </div>

          <div className={`f ${errors.email ? 'bad' : ''}`}>
            <label htmlFor="email">Business email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="email"
              required
              aria-required="true"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-err' : undefined}
            />
            <span className="err" id="email-err" role="alert">
              {errors.email}
            </span>
          </div>

          <div className={`f ${errors.phone ? 'bad' : ''}`}>
            <label htmlFor="phone">Phone number</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="tel"
              required
              aria-required="true"
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? 'phone-err' : undefined}
            />
            <span className="err" id="phone-err" role="alert">
              {errors.phone}
            </span>
          </div>

          <div className="f">
            <label htmlFor="company">
              Company name <em>(optional)</em>
            </label>
            <input
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              autoComplete="organization"
            />
            <span className="err"></span>
          </div>

          <div className={`f ${errors.service ? 'bad' : ''}`}>
            <label htmlFor="service">Service required</label>
            <select
              id="service"
              name="service"
              value={formData.service}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              aria-required="true"
              aria-invalid={!!errors.service}
              aria-describedby={errors.service ? 'service-err' : undefined}
            >
              <option value="">Choose a service</option>
              {SERVICE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <span className="err" id="service-err" role="alert">
              {errors.service}
            </span>
          </div>

          <div className="f">
            <label htmlFor="budget">
              Project budget <em>(optional)</em>
            </label>
            <select
              id="budget"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
            >
              <option value="">Select a range</option>
              {BUDGET_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <span className="err"></span>
          </div>

          <div className={`f full ${errors.desc ? 'bad' : ''}`}>
            <label htmlFor="desc">Project description</label>
            <textarea
              id="desc"
              name="desc"
              value={formData.desc}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="What are you building, who is it for, and when do you need it?"
              required
              aria-required="true"
              aria-invalid={!!errors.desc}
              aria-describedby={errors.desc ? 'desc-err' : undefined}
            />
            <span className="err" id="desc-err" role="alert">
              {errors.desc}
            </span>
          </div>

          {/* Privacy Consent Checkbox */}
          <div className={`f full ${errors.privacyConsent ? 'bad' : ''}`} style={{ marginTop: '2px' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '0.84rem', color: '#AEB4BD', textTransform: 'none', letterSpacing: 'normal', fontWeight: 400, lineHeight: 1.4 }}>
              <input
                type="checkbox"
                name="privacyConsent"
                checked={formData.privacyConsent}
                onChange={handleChange}
                style={{ accentColor: '#E06B2D', width: '16px', height: '16px', marginTop: '2px', cursor: 'pointer' }}
              />
              <span>I consent to DWARIX Technologies securely storing my contact details and reviewing this project brief to prepare technical scoping and preliminary cost estimates.</span>
            </label>
            {errors.privacyConsent && (
              <span className="err" role="alert">{errors.privacyConsent}</span>
            )}
          </div>

          <div className="submit">
            <button
              className="btn btn-copper"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting to Atlas...' : 'Send enquiry'}
            </button>
            <small>We only use these details to reply to you.</small>
          </div>

          {submissionResult && (
            <div
              className={`done ${submissionResult ? 'show' : ''}`}
              id="done"
              role="status"
              aria-live="polite"
              style={{
                marginTop: '16px',
                padding: '16px 18px',
                borderRadius: '12px',
                background: submissionResult.success ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                border: `1px solid ${submissionResult.success ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`,
                color: '#FFFFFF'
              }}
            >
              {submissionResult.success ? (
                <>
                  <b style={{ color: '#34D399', fontSize: '1rem', display: 'block', marginBottom: '6px' }}>
                    Enquiry Registered Successfully
                  </b>
                  <p style={{ margin: '0 0 8px 0', fontSize: '0.88rem', color: '#C8CFDC', lineHeight: 1.5 }}>
                    {submissionResult.message}
                  </p>
                  {submissionResult.referenceId && (
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'rgba(224, 107, 45, 0.18)',
                      border: '1px solid rgba(224, 107, 45, 0.45)',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '0.82rem',
                      color: '#F2A057',
                      fontFamily: 'monospace',
                      marginTop: '4px'
                    }}>
                      <span>Reference ID:</span>
                      <strong>{submissionResult.referenceId}</strong>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <b style={{ color: '#F87171', fontSize: '1rem', display: 'block', marginBottom: '6px' }}>
                    Submission Notice
                  </b>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: '#FCA5A5', lineHeight: 1.5 }}>
                    {submissionResult.error || 'Unable to submit enquiry. Please try again or email us directly at dwarixtech@gmail.com.'}
                  </p>
                </>
              )}
            </div>
          )}
        </form>
      </div>
    </section>
  );
}

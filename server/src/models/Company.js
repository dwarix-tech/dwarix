import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      default: 'DWARIX Technologies',
      trim: true
    },
    tagline: {
      type: String,
      default: 'Architecting Intelligent Systems & Scalable Digital Products',
      trim: true
    },
    description: {
      type: String,
      default: 'DWARIX Technologies delivers high-performance full-stack web and mobile systems, machine learning pipelines, and creative AI tooling with uncompromising craftsmanship.',
      trim: true
    },
    email: {
      type: String,
      required: true,
      default: 'dwarixtech@gmail.com',
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      default: '+91 93813 80680',
      trim: true
    },
    whatsapp: {
      type: String,
      default: 'https://wa.me/919381380680',
      trim: true
    },
    phones: [
      {
        formatted: { type: String, default: '+91 93813 80680' },
        raw: { type: String, default: '9381380680' },
        tel: { type: String, default: '+919381380680' },
        wa: { type: String, default: '919381380680' }
      }
    ],
    address: {
      street: { type: String, default: 'Rajam' },
      city: { type: String, default: 'Vizianagaram' },
      state: { type: String, default: 'Andhra Pradesh' },
      country: { type: String, default: 'India' },
      postalCode: { type: String, default: '532127' }
    },
    logo: {
      type: String,
      default: '/favicon.svg'
    },
    socialLinks: {
      github: { type: String, default: 'https://github.com/dwarix-tech' },
      linkedin: { type: String, default: 'https://www.linkedin.com/in/dwarix-technologies/' },
      twitter: { type: String, default: 'https://twitter.com/dwarixtech' },
      instagram: { type: String, default: 'https://www.instagram.com/dwarixtech/' }
    },
    workingHours: {
      type: String,
      default: 'Monday – Friday: 9:00 AM – 6:00 PM IST'
    },
    seoMetadata: {
      title: { type: String, default: 'DWARIX Technologies | Enterprise AI & Software Engineering' },
      description: { type: String, default: 'Engineering next-generation web platforms, AI applications, mobile ecosystems, and bespoke software solutions with unmatched speed and precision.' },
      keywords: [{ type: String }],
      ogImage: { type: String, default: '/og-image.jpg' }
    }
  },
  {
    timestamps: true
  }
);

const Company = mongoose.model('Company', companySchema);
export default Company;

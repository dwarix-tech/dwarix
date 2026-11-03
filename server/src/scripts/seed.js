import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { connectDB, disconnectDB } from '../config/db.js';
import Admin from '../models/Admin.js';
import Service from '../models/Service.js';
import Technology from '../models/Technology.js';
import Project from '../models/Project.js';
import Company from '../models/Company.js';

/**
 * Seeds initial platform collections without overwriting existing production data.
 * 
 * @param {object} options
 * @param {boolean} [options.allowAdminCreation=false] - Whether to create initial admin if credentials are provided
 * @param {string} [options.adminEmail] - Administrator email
 * @param {string} [options.adminPassword] - Administrator password
 * @param {string} [options.adminName] - Administrator display name
 */
export const seedDatabase = async (options = {}) => {
  console.log('\n--- DWARIX Platform Safe Seeding ---');

  // 1. Initial Administrator Setup (Safe & Non-Destructive)
  const adminCount = await Admin.countDocuments();
  if (adminCount > 0) {
    console.log(`ℹ Administrator accounts exist (${adminCount} found). Preserving existing admin credentials.`);
  } else if (options.allowAdminCreation) {
    const email = (options.adminEmail || env.INITIAL_ADMIN_EMAIL || '').trim().toLowerCase();
    const password = options.adminPassword || env.INITIAL_ADMIN_PASSWORD || '';
    const name = options.adminName || env.INITIAL_ADMIN_NAME || 'DWARIX System Admin';

    if (email && password) {
      if (password.length < 8) {
        console.warn('⚠️ Provided initial admin password must be at least 8 characters. Administrator creation skipped.');
      } else {
        console.log(`[Seed Script] Provisioning initial administrator: ${email}`);
        const admin = new Admin({
          name,
          email,
          passwordHash: password, // Hashed via Admin pre-save hook
          role: 'superadmin',
          isActive: true
        });
        await admin.save();
        console.log('✓ Initial Administrator created successfully.');
      }
    } else {
      console.log('ℹ Administrator credentials not provided. Run "npm run setup:admin" to create an administrator.');
    }
  } else {
    console.log('ℹ No administrator accounts detected. Automatic admin creation skipped during standard seeding.');
    console.log("  To securely create your initial administrator, run: 'npm run setup:admin'");
  }

  // 2. Seed Services (Preserves existing records)
  const initialServices = [
    {
      title: 'AI & Machine Learning',
      slug: 'ai-and-machine-learning',
      shortDescription: 'Intelligent solutions that turn data into actionable insights and automate complex business processes.',
      icon: 'sparkles',
      features: [
        'AI-powered applications',
        'Machine learning models',
        'Generative AI solutions',
        'AI chatbots and assistants',
        'Natural language processing',
        'Computer vision',
        'RAG-based applications',
        'Business process automation'
      ],
      technologies: ['Python', 'TensorFlow', 'PyTorch', 'FastAPI'],
      displayOrder: 1,
      isActive: true
    },
    {
      title: 'Web Development',
      slug: 'web-development',
      shortDescription: 'High-performance web applications, responsive websites and admin dashboards tailored to your workflows.',
      icon: 'code',
      features: [
        'Custom web applications',
        'Modern business websites',
        'E-commerce platforms',
        'Admin dashboards and portals',
        'REST and GraphQL APIs',
        'Progressive web apps (PWA)',
        'Performance optimisation',
        'Website redesign and modernization'
      ],
      technologies: ['React', 'Node.js', 'PostgreSQL', 'Docker'],
      displayOrder: 2,
      isActive: true
    },
    {
      title: 'Mobile App Development',
      slug: 'mobile-app-development',
      shortDescription: 'Native and cross-platform apps for iOS and Android with intuitive interfaces and dependable offline capabilities.',
      icon: 'smartphone',
      features: [
        'iOS application development',
        'Android application development',
        'Cross-platform applications',
        'Mobile UI/UX design',
        'App Store & Play Store deployment',
        'API integration & offline sync',
        'Push notifications & analytics',
        'App maintenance & updates'
      ],
      technologies: ['Flutter', 'React Native', 'Firebase'],
      displayOrder: 3,
      isActive: true
    },
    {
      title: 'Custom Software Development',
      slug: 'custom-software-development',
      shortDescription: 'Bespoke software systems engineered to replace clunky spreadsheets, connect legacy tools and scale your operations.',
      icon: 'cpu',
      features: [
        'Enterprise software solutions',
        'Internal tools & workflows',
        'Database architecture & design',
        'Cloud infrastructure setup',
        'Third-party API integrations',
        'Legacy system modernization',
        'Automation pipelines & scripts',
        'Security audits & code review'
      ],
      technologies: ['Node.js', 'PostgreSQL', 'AWS', 'Docker'],
      displayOrder: 4,
      isActive: true
    },
    {
      title: 'AI Photo Editing',
      slug: 'ai-photo-editing',
      shortDescription: 'AI-assisted image processing pipelines for e-commerce, portraits, real estate and bulk product catalogues.',
      icon: 'image',
      features: [
        'Automated background removal',
        'Image enhancement & upscaling',
        'Object cleanup & retouching',
        'Lighting & colour correction',
        'E-commerce product preparation',
        'Batch image processing',
        'Custom AI editing pipelines',
        'Fast turnaround delivery'
      ],
      technologies: ['Python', 'PyTorch', 'OpenCV'],
      displayOrder: 5,
      isActive: true
    }
  ];

  let servicesCreated = 0;
  for (const svc of initialServices) {
    const exists = await Service.findOne({ slug: svc.slug });
    if (!exists) {
      await Service.create(svc);
      servicesCreated++;
    }
  }
  console.log(`✓ Services: ${servicesCreated} new created, ${initialServices.length - servicesCreated} preserved.`);

  // 3. Seed Technologies (Preserves existing records)
  const techGroups = [
    {
      category: 'AI / ML',
      items: [
        { name: 'Python', color: '#3776AB', displayOrder: 1 },
        { name: 'TensorFlow', color: '#FF6F00', displayOrder: 2 },
        { name: 'PyTorch', color: '#EE4C2C', displayOrder: 3 },
        { name: 'Scikit-learn', color: '#F7931E', displayOrder: 4 }
      ]
    },
    {
      category: 'Frontend',
      items: [
        { name: 'React', color: '#149ECA', displayOrder: 1 },
        { name: 'HTML', color: '#E34F26', displayOrder: 2 },
        { name: 'CSS', color: '#1572B6', displayOrder: 3 }
      ]
    },
    {
      category: 'Backend',
      items: [
        { name: 'Django', color: '#0C4B33', displayOrder: 1 },
        { name: 'FastAPI', color: '#009688', displayOrder: 2 },
        { name: 'Node.js', color: '#5FA04E', displayOrder: 3 }
      ]
    },
    {
      category: 'Databases',
      items: [
        { name: 'PostgreSQL', color: '#4169E1', displayOrder: 1 },
        { name: 'MySQL', color: '#00758F', displayOrder: 2 },
        { name: 'MongoDB', color: '#47A248', displayOrder: 3 }
      ]
    },
    {
      category: 'Cloud & DevOps',
      items: [
        { name: 'AWS', color: '#FF9900', displayOrder: 1 },
        { name: 'Docker', color: '#2496ED', displayOrder: 2 },
        { name: 'GitHub Actions', color: '#2088FF', displayOrder: 3 }
      ]
    },
    {
      category: 'Mobile',
      items: [
        { name: 'Flutter', color: '#02569B', displayOrder: 1 },
        { name: 'React Native', color: '#149ECA', displayOrder: 2 }
      ]
    }
  ];

  let techCreated = 0;
  for (const group of techGroups) {
    for (const item of group.items) {
      const exists = await Technology.findOne({ name: item.name });
      if (!exists) {
        await Technology.create({
          name: item.name,
          category: group.category,
          color: item.color,
          displayOrder: item.displayOrder,
          isActive: true
        });
        techCreated++;
      }
    }
  }
  console.log(`✓ Technologies: ${techCreated} new created.`);

  // 4. Seed Projects (Preserves existing records)
  const initialProjects = [
    {
      title: 'Visit AP',
      slug: 'visit-ap',
      category: 'Web Applications',
      shortDescription: 'Full-stack Andhra Pradesh tourism platform for destination discovery, user reviews, ratings and location-based browsing.',
      technologies: ['React.js', 'Node.js', 'Express.js', 'MongoDB'],
      thumbnail: '/images/projects/visit-ap.jpg',
      liveUrl: 'https://visitap.vercel.app/',
      githubUrl: 'https://github.com/prudhvi-raju-jubburu/visitap',
      featured: true,
      status: 'published',
      isSampleConcept: false
    },
    {
      title: 'FarmerDirect',
      slug: 'farmerdirect',
      category: 'Web Applications',
      shortDescription: 'Direct agricultural marketplace connecting rural farmers directly with consumers featuring JWT role authentication, product catalogs, and order management.',
      technologies: ['React.js', 'Node.js', 'Express.js', 'MongoDB'],
      thumbnail: '/images/projects/farmer-direct.jpg',
      liveUrl: 'https://farmerdirect.vercel.app/',
      githubUrl: 'https://github.com/LokeshRaivada/Farmer-to-Consumer-Project',
      featured: true,
      status: 'published',
      isSampleConcept: false
    },
    {
      title: 'InsureScan',
      slug: 'insurescan',
      category: 'AI & Machine Learning',
      shortDescription: 'Computer vision and deep learning system that automates vehicle exterior damage detection, severity grading, and rapid insurance claim inspection.',
      technologies: ['Python', 'FastAPI', 'PyTorch', 'OpenCV', 'React'],
      githubUrl: 'https://github.com/sashankrudra-creator/InsureScan',
      featured: true,
      status: 'published',
      isSampleConcept: false
    },
    {
      title: 'Voice Billing System',
      slug: 'voice-billing-system',
      category: 'Custom Software',
      shortDescription: 'QuantumVoice smart billing & inventory system with voice assistance, barcode scanning, image billing, and real-time inventory synchronization.',
      technologies: ['Python', 'React.js', 'Node.js', 'SpeechRecognition'],
      thumbnail: '/images/projects/voice-billing-system.jpg',
      liveUrl: 'https://voice-billing-system-six.vercel.app/',
      githubUrl: 'https://github.com/sashankrudra-creator/voice-billing-system',
      featured: true,
      status: 'published',
      isSampleConcept: false
    }
  ];

  let projectsCreated = 0;
  for (const proj of initialProjects) {
    const existing = await Project.findOne({ slug: proj.slug });
    if (!existing) {
      await Project.create(proj);
      projectsCreated++;
    } else {
      // Update metadata like thumbnail and liveUrl if present
      if (proj.thumbnail && existing.thumbnail !== proj.thumbnail) {
        existing.thumbnail = proj.thumbnail;
      }
      if (proj.liveUrl && existing.liveUrl !== proj.liveUrl) {
        existing.liveUrl = proj.liveUrl;
      }
      await existing.save();
    }
  }
  console.log(`✓ Projects: ${projectsCreated} new created, ${initialProjects.length - projectsCreated} preserved.`);

  // 5. Seed Company Profile (Preserves existing profile)
  const existingCompany = await Company.findOne();
  if (existingCompany) {
    console.log(`ℹ Company Profile already configured: "${existingCompany.companyName}". Preserving existing profile.`);
  } else {
    const companyData = {
      companyName: 'DWARIX Technologies',
      tagline: 'Architecting Intelligent Systems & Scalable Digital Products',
      description: 'DWARIX Technologies delivers high-performance full-stack web and mobile systems, machine learning pipelines, and creative AI tooling with uncompromising craftsmanship.',
      email: 'dwarixtech@gmail.com',
      phone: '+91 93813 80680',
      whatsapp: 'https://wa.me/919381380680',
      phones: [
        { formatted: '+91 93813 80680', raw: '9381380680', tel: '+919381380680', wa: '919381380680' },
        { formatted: '+91 85006 60430', raw: '8500660430', tel: '+918500660430', wa: '918500660430' },
        { formatted: '+91 79816 13325', raw: '7981613325', tel: '+917981613325', wa: '917981613325' }
      ],
      address: {
        street: 'Rajam',
        city: 'Vizianagaram',
        state: 'Andhra Pradesh',
        country: 'India',
        postalCode: '532127'
      },
      socialLinks: {
        github: 'https://github.com/dwarix-tech',
        linkedin: 'https://www.linkedin.com/in/dwarix-technologies/',
        twitter: 'https://twitter.com/dwarixtech',
        instagram: 'https://www.instagram.com/dwarixtech/'
      }
    };
    await Company.create(companyData);
    console.log('✓ Initialized default Company Profile.');
  }
};

// If run directly from CLI
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  (async () => {
    try {
      // Connect to configured database (will terminate if database is unavailable)
      await connectDB();
      await seedDatabase({ allowAdminCreation: true });
      console.log('\n==========================================');
      console.log('🎉 DWARIX DATABASE SEEDING COMPLETED SAFELY');
      console.log('==========================================\n');
      await disconnectDB();
      process.exit(0);
    } catch (err) {
      console.error('\n❌ Seeding aborted due to database connection failure:', err.message);
      process.exit(1);
    }
  })();
}

export default seedDatabase;

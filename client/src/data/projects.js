export const CATEGORIES = [
  'All',
  'Web Applications',
  'AI & Machine Learning',
  'Custom Software'
];

export const PROJECTS = [
  {
    id: 'visit-ap',
    slug: 'visit-ap',
    title: 'Visit AP',
    subtitle: 'Andhra Pradesh Tourism Platform',
    category: 'Web Applications',
    description: 'A full-stack tourism platform for destination discovery, user reviews, ratings and location-based browsing across Andhra Pradesh.',
    stack: ['React.js', 'Node.js', 'Express.js', 'MongoDB'],
    art: 'web',
    imageUrl: '/images/projects/visit-ap.jpg',
    thumbnail: '/images/projects/visit-ap.jpg',
    wide: true,
    isSampleConcept: false,
    liveUrl: 'https://visitap.vercel.app/',
    githubUrl: 'https://github.com/prudhvi-raju-jubburu/visitap',
    problem: 'Travelers exploring Andhra Pradesh lack a single, reliable platform to discover scenic destinations, read authentic community feedback, and plan personalized itineraries.',
    solution: 'Visit AP delivers an end-to-end destination portal with location-based browsing, verified traveler reviews, dynamic rating systems, and interactive travel guides.',
    architecture: 'Frontend: React.js responsive UI with stateful search & filters.\nBackend: Node.js + Express REST APIs for places, categories, and reviews.\nDatabase: MongoDB collections for destinations, user ratings, and media.',
    keyFeatures: [
      'Destination management backed by high-throughput REST APIs and MongoDB',
      'Community reviews, user ratings, and geo-located discovery',
      'Mobile-first responsive full-stack architecture deployed on Vercel'
    ],
    challenges: 'Modeling dynamic destination hierarchies cleanly and maintaining lightning-fast review flows on low-bandwidth mobile connections.',
    implementation: 'Decoupled RESTful resources for places and feedback with a state-driven React client that eliminates page reloads.',
    result: 'A production MERN platform demonstrating complete full-stack architecture from data schema to deployed user interface.'
  },
  {
    id: 'farmer-direct',
    slug: 'farmerdirect',
    title: 'FarmerDirect',
    subtitle: 'Farmer-to-Consumer Direct Marketplace',
    category: 'Web Applications',
    description: 'Direct agricultural marketplace connecting rural farmers directly with consumers featuring JWT role authentication, product catalogs, and order management.',
    stack: ['React.js', 'Node.js', 'Express.js', 'MongoDB'],
    art: 'custom',
    imageUrl: '/images/projects/farmer-direct.jpg',
    thumbnail: '/images/projects/farmer-direct.jpg',
    wide: true,
    isSampleConcept: false,
    liveUrl: 'https://farmerdirect.vercel.app/',
    githubUrl: 'https://github.com/LokeshRaivada/Farmer-to-Consumer-Project',
    problem: 'Farmers frequently lose substantial margins to middle-tier distributors, while urban consumers lack direct, verifiable channels to buy fresh harvest produce with transparent pricing.',
    solution: 'A role-aware marketplace that allows farmers to list fresh harvests directly, while providing consumers a shopping cart, order tracking, and peer reviews.',
    architecture: 'Frontend: React.js marketplace UI with farmer & customer role dashboards.\nBackend: Node.js and Express APIs secured with JWT auth middleware.\nDatabase: MongoDB for user roles, produce catalogs, orders, and review logs.',
    keyFeatures: [
      'JWT authentication with strict role-based access control (Farmer vs. Buyer)',
      'Farmer inventory management, harvest cataloging, and pricing controls',
      'End-to-end order processing, order status history, and feedback ratings'
    ],
    challenges: 'Enforcing strict role boundaries to prevent unauthorized price changes or catalog tampering across JWT-protected API routes.',
    implementation: 'Multi-layer API guards, role-based token payloads, and normalized MongoDB transaction schemas.',
    result: 'A verified direct agricultural marketplace with role-based access control and order tracking.'
  },
  {
    id: 'voice-billing',
    slug: 'voice-billing-system',
    title: 'Voice Billing System (QuantumVoice)',
    subtitle: 'QuantumVoice AI Voice Billing & Inventory Engine',
    category: 'Custom Software',
    description: 'Smart billing & inventory system with voice assistance, barcode scanning, image billing, and real-time inventory synchronization.',
    stack: ['Python', 'React.js', 'Node.js', 'SpeechRecognition'],
    art: 'crm',
    imageUrl: '/images/projects/voice-billing-system.jpg',
    thumbnail: '/images/projects/voice-billing-system.jpg',
    wide: true,
    isSampleConcept: false,
    liveUrl: 'https://voice-billing-system-six.vercel.app/',
    githubUrl: 'https://github.com/sashankrudra-creator/voice-billing-system',
    problem: 'Retail store environments often encounter checkout bottlenecks when manually entering barcodes and searching product SKUs during peak hours.',
    solution: 'Voice Billing System (QuantumVoice) delivers a hands-free smart billing and inventory terminal featuring voice commands, image-based item extraction, barcode scanning, and instant GST invoices.',
    architecture: 'Frontend: React.js cashier & dashboard terminal with live voice wave visualizer.\nSpeech Engine: Python NLP & SpeechRecognition acoustic transcription worker.\nBackend: Node.js API server for catalog matching, sales reports, and bill generation.',
    keyFeatures: [
      'Voice-activated billing creating invoices from natural speech commands',
      'Image billing and automated barcode SKU scanning',
      'Real-time inventory sync with low-stock alerts and revenue analytics'
    ],
    challenges: 'Filtering background store chatter and accurately resolving regional product nomenclature in retail environments.',
    implementation: 'Acoustic voice filtering combined with fuzzy Levenshtein catalog matching for robust offline-capable inference.',
    result: 'A functional full-stack POS demonstrating voice-assisted billing workflows, inventory sync, and digital invoice generation.'
  },
  {
    id: 'insure-scan',
    slug: 'insurescan',
    title: 'InsureScan',
    subtitle: 'AI Vehicle Damage & Policy Inspection',
    category: 'AI & Machine Learning',
    description: 'Computer vision and deep learning system that automates vehicle exterior damage detection, severity grading, and rapid insurance claim inspection.',
    stack: ['Python', 'FastAPI', 'PyTorch', 'OpenCV', 'React'],
    art: 'ai',
    wide: true,
    isSampleConcept: false,
    liveUrl: '',
    githubUrl: 'https://github.com/sashankrudra-creator/InsureScan',
    problem: 'Manual inspection of vehicular damage for insurance claims is slow, expensive, highly subjective, and prone to claim fraud.',
    solution: 'InsureScan deploys computer vision models to detect dents, scratches, and structural fractures directly from uploaded photos, generating automated repair assessments.',
    architecture: 'Frontend: React inspection portal for image uploads and damage polygon overlays.\nBackend: Python FastAPI inference microservice.\nAI Engine: PyTorch deep learning vision model with OpenCV image normalization.',
    keyFeatures: [
      'Automated exterior vehicle damage detection & segmentation',
      'Instant severity scoring and algorithmic repair cost estimates',
      'Audit-ready digital claim dossiers reducing adjustment cycles'
    ],
    challenges: 'Accurately segmenting subtle dents under specular sunlight, reflections, and varied camera angles.',
    implementation: 'Trained high-precision segmentation networks with synthetic augmentation pipelines, served via FastAPI asynchronous workers.',
    result: 'A computer vision prototype demonstrating automated vehicular exterior damage segmentation and visual assessment.'
  }
];

export default PROJECTS;

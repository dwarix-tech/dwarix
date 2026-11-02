import Company from '../models/Company.js';
import Service from '../models/Service.js';
import Project from '../models/Project.js';
import Technology from '../models/Technology.js';

/**
 * Standard suggested starter questions for DWARIX AI Assistant
 * Grounded directly in verified company capabilities and MongoDB Atlas data
 */
export const SUGGESTED_QUESTIONS = [
  'What services does DWARIX offer?',
  'Can you build AI applications?',
  'Show me your projects.',
  'What technologies do you use?',
  'How can I start a project?',
  'How can I contact DWARIX?'
];

/**
 * GET /api/chatbot/suggestions
 * Returns suggested quick questions based on real DWARIX capabilities
 */
export const getSuggestions = async (req, res) => {
  return res.json({
    success: true,
    suggestions: SUGGESTED_QUESTIONS
  });
};

/**
 * POST /api/chatbot/message
 * Intelligent rule-based business assistant querying live MongoDB content
 */
export const handleChatMessage = async (req, res) => {
  try {
    const rawMessage = req.body.message;
    if (!rawMessage || typeof rawMessage !== 'string' || !rawMessage.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty'
      });
    }

    const message = rawMessage.trim().slice(0, 500);
    const cleanLower = message.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ');
    const tokens = cleanLower.split(/\s+/).filter(Boolean);

    // Fetch strictly public business data in parallel (zero access to admin/enquiry records)
    const [company, services, projects, technologies] = await Promise.all([
      Company.findOne()
        .select('companyName tagline description email phone address socialLinks workingHours')
        .lean()
        .catch(() => null),
      Service.find({ isActive: true })
        .select('title shortDescription technologies displayOrder')
        .sort({ displayOrder: 1 })
        .lean()
        .catch(() => []),
      Project.find({ status: 'published' })
        .select('title subtitle category shortDescription description liveUrl githubUrl')
        .sort({ featured: -1 })
        .lean()
        .catch(() => []),
      Technology.find({ isActive: true })
        .select('name category displayOrder')
        .sort({ displayOrder: 1 })
        .lean()
        .catch(() => [])
    ]);

    const companyName = company?.companyName || company?.name || 'DWARIX Technologies';
    const email = company?.email || 'dwarixtech@gmail.com';
    const phone = company?.phone || '+91 79816 13325';
    const address = company?.address?.city 
      ? `${company.address.city}, ${company.address.state || ''}, ${company.address.country || 'India'}`
      : 'Vizianagaram, Andhra Pradesh, India';
    const linkedin = company?.socialLinks?.linkedin || company?.social?.linkedin || 'https://www.linkedin.com/in/dwarix-technologies/';

    // 1. PROMPT INJECTION / SENSITIVE DATA DEFENSE
    if (
      matchesAny(tokens, ['password', 'passwd', 'secret', 'admin', 'token', 'jwt', 'database_uri', 'enquiries', 'enquiry', 'customers', 'leak', 'bypass', 'system_prompt', 'override'])
    ) {
      return res.json({
        success: true,
        reply: `I am the public business guide for ${companyName}. I provide information strictly about our software engineering services, verified production projects, and public contact channels. Internal system credentials, private customer submissions, and operational secrets cannot be queried.`,
        quickReplies: SUGGESTED_QUESTIONS.slice(0, 4)
      });
    }

    // 2. GREETINGS
    if (matchesAny(tokens, ['hi', 'hello', 'hey', 'namaste', 'morning', 'evening', 'greetings', 'yo'])) {
      return res.json({
        success: true,
        reply: `Hello! Welcome to ${companyName}. I can provide details on our engineering services, live production projects, technology stack, development approach, or help you start a project.`,
        quickReplies: [
          'What services does DWARIX offer?',
          'Show me your projects.',
          'How can I start a project?',
          'How can I contact DWARIX?'
        ]
      });
    }

    // 3. SUGGESTED QUESTION 1: SERVICES ("What services does DWARIX offer?")
    if (
      cleanLower.includes('services does dwarix offer') ||
      cleanLower.includes('what services') ||
      matchesAny(tokens, ['service', 'services', 'offer', 'offerings', 'capabilities', 'what do you do'])
    ) {
      const serviceList = services.length > 0 
        ? services.map(s => `• ${s.title}: ${s.shortDescription}`).join('\n')
        : '• AI & Machine Learning: Custom models, NLP, computer vision and automation\n• Web Development: High-performance web applications and portals\n• Mobile App Development: Native and cross-platform iOS & Android apps\n• Custom Software Development: Tailored ERP, CRM, and workflow solutions\n• AI Photo Editing: Automated bulk image processing pipelines';

      return res.json({
        success: true,
        reply: `${companyName} delivers end-to-end engineering across 5 core disciplines:\n\n${serviceList}\n\nWhich service aligns with your roadmap?`,
        quickReplies: [
          'Web Development',
          'AI & Machine Learning',
          'Mobile App Development',
          'Custom Software Development',
          'AI Photo Editing'
        ]
      });
    }

    // 4. SUGGESTED QUESTION 2: CAN YOU BUILD AI APPLICATIONS?
    if (
      cleanLower.includes('build ai') ||
      cleanLower.includes('ai application') ||
      cleanLower.includes('ai applications') ||
      matchesAny(tokens, ['ai', 'ml', 'machine', 'learning', 'vision', 'nlp', 'rag', 'pytorch', 'tensorflow', 'opencv', 'generative'])
    ) {
      return res.json({
        success: true,
        reply: `Yes, AI & Machine Learning is one of our core specializations. We build deep learning models, computer vision systems, voice intelligence, and NLP pipelines.\n\nTwo real examples engineered by DWARIX:\n• InsureScan: Computer vision vehicle damage segmentation & automated repair estimates\n• Voice Billing System (QuantumVoice): Voice-assisted retail billing and inventory engine\n\nWould you like to scope an AI solution for your business?`,
        preselectService: 'AI & Machine Learning',
        actionTarget: '#contact',
        links: [
          { label: 'Voice Billing Live Demo ↗', url: 'https://voice-billing-system-six.vercel.app/' },
          { label: 'InsureScan Source Code ↗', url: 'https://github.com/sashankrudra-creator/InsureScan' }
        ],
        quickReplies: [
          'Start AI Project',
          'Show me your projects.',
          'What technologies do you use?'
        ]
      });
    }

    // 5. SPECIFIC SERVICE PRESELECTION INQUIRIES
    if (matchesAny(tokens, ['web', 'website', 'frontend', 'mern', 'react', 'fullstack'])) {
      return res.json({
        success: true,
        reply: `Our Web Development team builds responsive, high-throughput web applications, admin portals, and marketplaces using React.js, Node.js, Express, and MongoDB (MERN). Recent examples include Visit AP and FarmerDirect.`,
        preselectService: 'Web Development',
        actionTarget: '#contact',
        links: [
          { label: 'Visit AP Live Demo ↗', url: 'https://visitap.vercel.app/' },
          { label: 'FarmerDirect Live Demo ↗', url: 'https://farmerdirect.vercel.app/' }
        ],
        quickReplies: ['Start Web Project', 'Show me your projects.', 'How can I contact DWARIX?']
      });
    }

    if (matchesAny(tokens, ['mobile', 'app', 'android', 'ios', 'flutter', 'react-native'])) {
      return res.json({
        success: true,
        reply: `We design and build performant mobile applications for Android and iOS using Flutter and React Native, complete with offline synchronization, push notifications, and robust REST APIs.`,
        preselectService: 'Mobile App Development',
        actionTarget: '#contact',
        quickReplies: ['Start Mobile Project', 'What services does DWARIX offer?', 'How can I start a project?']
      });
    }

    if (matchesAny(tokens, ['custom', 'erp', 'crm', 'pos', 'billing', 'inventory', 'quantumvoice', 'quantum'])) {
      return res.json({
        success: true,
        reply: `Our Custom Software Development practice engineers bespoke ERPs, inventory management systems, and workflow engines. A prime example is Voice Billing System (QuantumVoice) with real-time stock sync.`,
        preselectService: 'Custom Software Development',
        actionTarget: '#contact',
        links: [
          { label: 'Voice Billing Live Demo ↗', url: 'https://voice-billing-system-six.vercel.app/' }
        ],
        quickReplies: ['Start Custom Software', 'Show me your projects.', 'Fill Project Form']
      });
    }

    if (matchesAny(tokens, ['photo', 'photos', 'editing', 'retouch', 'upscale', 'background'])) {
      return res.json({
        success: true,
        reply: `Our AI Photo Editing service provides automated image processing pipelines for e-commerce, real estate, and product catalogs—handling background removal, color normalization, and upscaling.`,
        preselectService: 'AI Photo Editing',
        actionTarget: '#contact',
        quickReplies: ['Start Photo Editing Project', 'What services does DWARIX offer?', 'How can I start a project?']
      });
    }

    // 6. SUGGESTED QUESTION 5: HOW CAN I START A PROJECT? / PROCESS / TIMELINE / PRICING
    if (
      cleanLower.includes('start a project') ||
      cleanLower.includes('start project') ||
      matchesAny(tokens, ['start', 'pricing', 'price', 'cost', 'costs', 'quote', 'timeline', 'duration', 'process', 'estimate', 'hire', 'onboarding'])
    ) {
      return res.json({
        success: true,
        reply: `Starting a project with ${companyName} follows a transparent 6-stage lifecycle:\n\n1. Understand: Scoping your functional requirements & technical constraints\n2. Strategise: Architecture design, milestones & realistic budget timeline\n3. Design: Responsive prototypes & interface workflows\n4. Develop: Production engineering with clean code & tests\n5. Test: Rigorous cross-browser, security & performance verification\n6. Deliver: Deployment with post-launch support\n\nBecause every solution is custom-tailored, we do not use rigid cookie-cutter packages. Share a brief summary in our contact form to discuss your technical requirements and timeline.`,
        actionTarget: '#contact',
        quickReplies: [
          'Fill Project Form',
          'How can I contact DWARIX?',
          'Show me your projects.'
        ]
      });
    }

    // 7. SUGGESTED QUESTION 3: SHOW ME YOUR PROJECTS ("Show me your projects.")
    if (
      cleanLower.includes('show me your project') ||
      cleanLower.includes('show projects') ||
      cleanLower.includes('show our work') ||
      matchesAny(tokens, ['project', 'projects', 'portfolio', 'case', 'work', 'visit', 'farmer', 'insure', 'billing'])
    ) {
      const projList = projects.length > 0
        ? projects.map(p => `• ${p.title} (${p.category}): ${p.shortDescription || p.description}`).join('\n')
        : '• Visit AP (Web Applications): Andhra Pradesh tourism and destination portal\n• FarmerDirect (Web Applications): Farm-to-consumer marketplace with JWT auth\n• InsureScan (AI & Machine Learning): Computer vision vehicle damage inspection\n• Voice Billing System (QuantumVoice) (Custom Software): Voice-activated retail billing & inventory engine';

      return res.json({
        success: true,
        reply: `Here are our verified production projects:\n\n${projList}\n\nYou can inspect interactive case studies and live demos directly:`,
        links: [
          { label: 'Visit AP (Live Demo) ↗', url: 'https://visitap.vercel.app/' },
          { label: 'FarmerDirect (Live Demo) ↗', url: 'https://farmerdirect.vercel.app/' },
          { label: 'Voice Billing System (Live Demo) ↗', url: 'https://voice-billing-system-six.vercel.app/' }
        ],
        actionTarget: '#work',
        quickReplies: [
          'What technologies do you use?',
          'How can I start a project?',
          'How can I contact DWARIX?'
        ]
      });
    }

    // 8. SUGGESTED QUESTION 4: WHAT TECHNOLOGIES DO YOU USE?
    if (
      cleanLower.includes('technologies do you use') ||
      cleanLower.includes('what technologies') ||
      matchesAny(tokens, ['tech', 'technology', 'technologies', 'stack', 'languages', 'tools', 'database', 'framework', 'frameworks'])
    ) {
      const techNames = technologies.length > 0
        ? technologies.map(t => t.name).join(', ')
        : 'Python, React, Node.js, Express, MongoDB, PyTorch, TensorFlow, FastAPI, Docker, AWS, Flutter, PostgreSQL';

      return res.json({
        success: true,
        reply: `${companyName} builds production systems with modern, battle-tested technologies:\n\n• AI & ML: Python, PyTorch, TensorFlow, OpenCV, FastAPI\n• Frontend: React.js, Vite, Modern CSS/GSAP\n• Backend: Node.js, Express.js, REST APIs\n• Databases: MongoDB Atlas, PostgreSQL, MySQL\n• Mobile: Flutter, React Native\n• DevOps: AWS, Docker, GitHub Actions\n\nFull stack: ${techNames}.`,
        actionTarget: '#tech',
        quickReplies: [
          'What services does DWARIX offer?',
          'Show me your projects.',
          'How can I start a project?'
        ]
      });
    }

    // 9. SUGGESTED QUESTION 6: HOW CAN I CONTACT DWARIX? / CONTACT CHANNELS
    if (
      message.includes('how can i contact') ||
      matchesAny(tokens, ['contact', 'email', 'phone', 'call', 'talk', 'human', 'reach', 'address', 'location', 'office', 'whatsapp', 'linkedin'])
    ) {
      return res.json({
        success: true,
        reply: `You can reach our engineering leadership directly through multiple channels:\n\n• Email: ${email}\n• Phone: ${phone}\n• Location: ${address}\n• LinkedIn: ${linkedin}\n\nOur engineering team reviews project briefs and will connect with you to discuss preliminary scoping.`,
        actionTarget: '#contact',
        emailAction: `mailto:${email}`,
        callAction: `tel:${phone.replace(/\s+/g, '')}`,
        links: [
          { label: 'LinkedIn Profile ↗', url: linkedin }
        ],
        quickReplies: [
          'What services does DWARIX offer?',
          'Show me your projects.',
          'How can I start a project?'
        ]
      });
    }

    // 10. GRATITUDE / ACKNOWLEDGEMENT
    if (matchesAny(tokens, ['thanks', 'thank', 'thx', 'cool', 'awesome', 'great', 'perfect', 'ok', 'okay'])) {
      return res.json({
        success: true,
        reply: `You're welcome! Let us know whenever you're ready to engineer your next digital product. Is there anything else about our services or projects I can assist with?`,
        quickReplies: [
          'What services does DWARIX offer?',
          'Show me your projects.',
          'How can I start a project?'
        ]
      });
    }

    // 11. DEFAULT / CONTEXTUAL FALLBACK (NO HALLUCINATIONS)
    return res.json({
      success: true,
      reply: `I can help you explore ${companyName}'s engineering capabilities, production projects, and engagement models. Here are the most common topics visitors ask about:`,
      quickReplies: SUGGESTED_QUESTIONS
    });

  } catch (error) {
    console.error('[Chatbot Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while processing your message. Please try again or use our contact form directly.'
    });
  }
};

/**
 * Helper: matches any token against given keywords
 */
function matchesAny(tokens, keywords) {
  return tokens.some(t => keywords.some(k => t === k || (k.length > 3 && t.startsWith(k))));
}

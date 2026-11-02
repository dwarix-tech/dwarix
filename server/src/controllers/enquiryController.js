import Enquiry from '../models/Enquiry.js';
import { sendEnquiryEmails } from '../services/emailService.js';
import { emitAdminNewEnquiry } from '../sockets/socketManager.js';

export const createEnquiry = async (req, res, next) => {
  try {
    const { name, email, phone, company, service, budget, description, desc, website, website_hp, privacyConsent } = req.body;

    // Spam honeypot trap
    if ((website && website.trim().length > 0) || (website_hp && website_hp.trim().length > 0)) {
      return res.status(400).json({
        success: false,
        message: 'Spam submission detected.'
      });
    }

    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const cleanDesc = (description || desc || '').trim();

    if (!cleanEmail || !cleanDesc) {
      return res.status(400).json({
        success: false,
        message: 'Email and project description are required.'
      });
    }

    // Duplicate submission prevention (check if same email submitted identical brief within last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const existingRecent = await Enquiry.findOne({
      email: cleanEmail,
      description: cleanDesc,
      createdAt: { $gte: fiveMinutesAgo }
    });

    if (existingRecent) {
      return res.status(200).json({
        success: true,
        message: 'Your enquiry was already received! Reference ID: ' + (existingRecent.referenceId || existingRecent._id),
        enquiryId: existingRecent._id,
        referenceId: existingRecent.referenceId,
        duplicateSuppressed: true
      });
    }

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';

    // Persist to MongoDB Atlas FIRST
    const enquiry = await Enquiry.create({
      name: name ? name.trim() : 'Anonymous Client',
      email: cleanEmail,
      phone: phone ? phone.trim() : '',
      company: company ? company.trim() : '',
      service: service ? service.trim() : 'General Enquiry',
      budget: budget ? budget.trim() : 'Undisclosed',
      description: cleanDesc,
      privacyConsent: privacyConsent !== false,
      ipAddress: Array.isArray(clientIp) ? clientIp[0] : clientIp
    });

    // Notify connected admin via Socket.IO in real time
    emitAdminNewEnquiry(enquiry);

    // Send emails asynchronously (never loses enquiry on failure)
    sendEnquiryEmails(enquiry)
      .then(async (emailResult) => {
        await Enquiry.findByIdAndUpdate(enquiry._id, {
          emailSent: emailResult.success,
          adminEmailStatus: emailResult.adminStatus || 'failed',
          customerEmailStatus: emailResult.customerStatus || 'failed',
          emailError: emailResult.error || '',
          lastEmailAttemptAt: new Date()
        }).exec();
      })
      .catch(async (err) => {
        console.error('[Enquiry Email Failed]', err.message);
        await Enquiry.findByIdAndUpdate(enquiry._id, {
          adminEmailStatus: 'failed',
          customerEmailStatus: 'failed',
          emailError: err.message,
          lastEmailAttemptAt: new Date()
        }).exec();
      });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your enquiry has been received. Our engineering team will review your details and respond within 24 hours.',
      enquiryId: enquiry._id,
      referenceId: enquiry.referenceId
    });
  } catch (error) {
    next(error);
  }
};


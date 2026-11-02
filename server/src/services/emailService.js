import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

let transporter = null;

export const getTransporter = () => {
  if (transporter) return transporter;

  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    console.warn('[EmailService] SMTP credentials not fully configured. Email sending will be simulated in development mode.');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS
    }
  });

  return transporter;
};

/**
 * Formats a clean HTML email template for DWARIX administration notification
 */
const generateAdminHtml = (enquiry) => {
  const adminUrl = env.CORS_ORIGIN.split(',')[0].trim() || 'http://localhost:3000';
  const enquiryLink = `${adminUrl}/admin/enquiries`;
  const reference = enquiry.referenceId || enquiry._id;

  return `
    <div style="font-family: 'Instrument Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; background: #0D0F12; color: #FFFFFF; border: 1px solid #2A2F3A; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
      <div style="background: linear-gradient(135deg, #1B1E24 0%, #12151B 100%); padding: 26px 32px; border-bottom: 2px solid #E06B2D;">
        <table style="width: 100%;">
          <tr>
            <td>
              <h1 style="margin: 0; font-size: 20px; color: #FFFFFF; font-weight: 700; letter-spacing: -0.02em;">DWARIX TECHNOLOGIES</h1>
              <p style="margin: 4px 0 0 0; color: #E06B2D; font-size: 13px; font-weight: 600;">NEW CLIENT PROJECT ENQUIRY</p>
            </td>
            <td style="text-align: right;">
              <span style="background: rgba(224, 107, 45, 0.15); border: 1px solid rgba(224, 107, 45, 0.4); color: #F2A057; font-family: monospace; font-size: 11px; padding: 4px 8px; border-radius: 6px;">
                ${reference}
              </span>
            </td>
          </tr>
        </table>
      </div>

      <div style="padding: 32px;">
        <p style="margin-top: 0; color: #B4BAC7; font-size: 14px;">A new project enquiry has been submitted through the public website contact portal.</p>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin: 20px 0;">
          <tr style="border-bottom: 1px solid #1E232E;">
            <td style="padding: 10px 0; color: #8E95A5; width: 140px;">Client Name:</td>
            <td style="padding: 10px 0; font-weight: 600; color: #FFFFFF;">${enquiry.name}</td>
          </tr>
          <tr style="border-bottom: 1px solid #1E232E;">
            <td style="padding: 10px 0; color: #8E95A5;">Email:</td>
            <td style="padding: 10px 0;"><a href="mailto:${enquiry.email}" style="color: #F2A057; text-decoration: none;">${enquiry.email}</a></td>
          </tr>
          <tr style="border-bottom: 1px solid #1E232E;">
            <td style="padding: 10px 0; color: #8E95A5;">Phone:</td>
            <td style="padding: 10px 0; color: #FFFFFF;">${enquiry.phone || 'Not provided'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #1E232E;">
            <td style="padding: 10px 0; color: #8E95A5;">Company / Org:</td>
            <td style="padding: 10px 0; color: #FFFFFF;">${enquiry.company || 'Not provided'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #1E232E;">
            <td style="padding: 10px 0; color: #8E95A5;">Requested Service:</td>
            <td style="padding: 10px 0; font-weight: 600; color: #E06B2D;">${enquiry.service || 'General Enquiry'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #1E232E;">
            <td style="padding: 10px 0; color: #8E95A5;">Budget Range:</td>
            <td style="padding: 10px 0; color: #FFFFFF;">${enquiry.budget || 'Undisclosed'}</td>
          </tr>
        </table>

        <div style="margin: 24px 0 28px 0; padding: 18px; background: #151922; border-left: 3px solid #E06B2D; border-radius: 6px;">
          <div style="font-size: 11px; text-transform: uppercase; color: #8E95A5; letter-spacing: 0.05em; margin-bottom: 6px;">Client Project Brief</div>
          <div style="color: #E2E6EE; line-height: 1.6; font-size: 14px; white-space: pre-wrap;">${enquiry.description}</div>
        </div>

        <div style="text-align: center; margin: 28px 0 10px 0;">
          <a href="${enquiryLink}" style="display: inline-block; background: linear-gradient(135deg, #D35A24 0%, #F2A057 100%); color: #FFFFFF; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 14px rgba(211, 90, 36, 0.4);">
            Manage Enquiry in Admin Portal →
          </a>
        </div>
      </div>

      <div style="background: #12151B; padding: 16px 32px; font-size: 12px; color: #707787; border-top: 1px solid #1E232E; display: flex; justify-content: space-between;">
        <span>Submitted on ${new Date(enquiry.createdAt || Date.now()).toUTCString()}</span>
        <span>IP: ${enquiry.ipAddress || 'Client'}</span>
      </div>
    </div>
  `;
};

/**
 * Formats a professional HTML acknowledgement email for the customer
 */
const generateCustomerHtml = (enquiry) => {
  const reference = enquiry.referenceId || enquiry._id;

  return `
    <div style="font-family: 'Instrument Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; background: #0D0F12; color: #FFFFFF; border: 1px solid #2A2F3A; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
      <div style="background: linear-gradient(135deg, #1B1E24 0%, #12151B 100%); padding: 26px 32px; border-bottom: 2px solid #E06B2D;">
        <table style="width: 100%;">
          <tr>
            <td>
              <h1 style="margin: 0; font-size: 20px; color: #FFFFFF; font-weight: 700; letter-spacing: -0.02em;">DWARIX TECHNOLOGIES</h1>
              <p style="margin: 4px 0 0 0; color: #9E9E9E; font-size: 13px;">Architecting Intelligent Systems & Scalable Digital Products</p>
            </td>
            <td style="text-align: right;">
              <span style="background: rgba(224, 107, 45, 0.15); border: 1px solid rgba(224, 107, 45, 0.4); color: #F2A057; font-family: monospace; font-size: 11px; padding: 4px 8px; border-radius: 6px;">
                ${reference}
              </span>
            </td>
          </tr>
        </table>
      </div>

      <div style="padding: 32px; font-size: 14px; line-height: 1.7; color: #C8CFDC;">
        <p style="margin-top: 0; color: #FFFFFF; font-size: 16px;">Hello <strong style="color: #F2A057;">${enquiry.name}</strong>,</p>

        <p>Thank you for reaching out to <strong>DWARIX Technologies</strong>. We have successfully registered your project enquiry regarding <strong>${enquiry.service || 'Software Development'}</strong> under reference number <code style="color: #F2A057; font-family: monospace;">${reference}</code>.</p>

        <div style="margin: 24px 0; padding: 18px; background: #151922; border-left: 3px solid #E06B2D; border-radius: 6px;">
          <div style="font-size: 11px; text-transform: uppercase; color: #8E95A5; letter-spacing: 0.05em; margin-bottom: 6px;">Enquiry Summary</div>
          <div style="color: #FFFFFF; font-weight: 600; margin-bottom: 4px;">Service: ${enquiry.service || 'General Enquiry'}</div>
          <div style="color: #A0A7B5; font-size: 13px;">Brief: ${enquiry.description.substring(0, 180)}${enquiry.description.length > 180 ? '...' : ''}</div>
        </div>

        <p><strong>Next Steps:</strong></p>
        <ul style="padding-left: 20px; margin: 10px 0 20px 0; color: #B4BAC7;">
          <li>Our engineering leads are reviewing your technical requirements and architecture goals.</li>
          <li>You will receive a tailored response within <strong>24 business hours</strong> with initial scoping questions, preliminary timelines, and budget considerations.</li>
        </ul>

        <p>If you have urgent updates or supplementary assets to share in the meantime, feel free to reply directly to this email or reach us at:</p>

        <table style="width: 100%; margin: 16px 0; font-size: 13px; color: #A0A7B5;">
          <tr>
            <td style="padding: 4px 0; width: 90px; color: #707787;">Direct Email:</td>
            <td style="padding: 4px 0; color: #FFFFFF;"><a href="mailto:dwarixtech@gmail.com" style="color: #F2A057; text-decoration: none;">dwarixtech@gmail.com</a></td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #707787;">Telephone:</td>
            <td style="padding: 4px 0; color: #FFFFFF;">+91 79816 13325</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #707787;">Headquarters:</td>
            <td style="padding: 4px 0; color: #FFFFFF;">Rajam, Vizianagaram, Andhra Pradesh, India</td>
          </tr>
        </table>

        <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #1E232E;">
          <p style="margin: 0; color: #FFFFFF; font-weight: 600;">DWARIX Engineering & Strategy Team</p>
          <p style="margin: 4px 0 0 0; color: #707787; font-size: 12px;">DWARIX Technologies · <a href="https://dwarix-tech.github.io" style="color: #E06B2D; text-decoration: none;">dwarix.com</a></p>
        </div>
      </div>
    </div>
  `;
};

/**
 * Sends both Admin Notification and Customer Acknowledgement emails.
 * Never throws an unhandled error; updates and returns execution status.
 */
export const sendEnquiryEmails = async (enquiry) => {
  const mailer = getTransporter();
  const adminEmail = env.ADMIN_NOTIFY_EMAIL || 'dwarixtech@gmail.com';
  const fromEmail = env.EMAIL_FROM || 'DWARIX Technologies <no-reply@dwarix.com>';

  const adminHtml = generateAdminHtml(enquiry);
  const clientHtml = generateCustomerHtml(enquiry);

  if (!mailer) {
    console.log(`[EmailService - Simulated] Admin notification queued for ${adminEmail} and acknowledgement to ${enquiry.email}`);
    return {
      success: true,
      simulated: true,
      adminStatus: 'simulated',
      customerStatus: 'simulated'
    };
  }

  let adminStatus = 'failed';
  let customerStatus = 'failed';
  let errorMsg = '';

  // 1. Send Admin Notification
  try {
    await mailer.sendMail({
      from: fromEmail,
      to: adminEmail,
      subject: `[New Lead: ${enquiry.referenceId || 'DWX'}] ${enquiry.service} – ${enquiry.name}`,
      html: adminHtml
    });
    adminStatus = 'sent';
  } catch (err) {
    console.error('[EmailService] Failed to send admin email:', err.message);
    errorMsg = `Admin email: ${err.message}`;
  }

  // 2. Send Customer Acknowledgement
  try {
    await mailer.sendMail({
      from: fromEmail,
      to: enquiry.email,
      subject: `Enquiry Received [${enquiry.referenceId || 'DWX'}] – DWARIX Technologies`,
      html: clientHtml
    });
    customerStatus = 'sent';
  } catch (err) {
    console.error('[EmailService] Failed to send client acknowledgement:', err.message);
    errorMsg = errorMsg ? `${errorMsg} | Client: ${err.message}` : `Client email: ${err.message}`;
  }

  const success = adminStatus === 'sent' && customerStatus === 'sent';
  return {
    success,
    simulated: false,
    adminStatus,
    customerStatus,
    error: errorMsg || undefined
  };
};

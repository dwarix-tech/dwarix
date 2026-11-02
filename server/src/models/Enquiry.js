import mongoose from 'mongoose';

const enquirySchema = new mongoose.Schema(
  {
    referenceId: {
      type: String,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    company: {
      type: String,
      trim: true,
      default: ''
    },
    service: {
      type: String,
      trim: true,
      default: 'General Enquiry'
    },
    budget: {
      type: String,
      trim: true,
      default: 'Undisclosed'
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      trim: true,
      maxlength: [3000, 'Description cannot exceed 3000 characters']
    },
    privacyConsent: {
      type: Boolean,
      default: true
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'In Progress', 'Proposal Sent', 'Completed', 'Rejected'],
      default: 'New',
      index: true
    },
    notes: [
      {
        body: { type: String, required: true },
        author: { type: String, default: 'Admin' },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    emailSent: {
      type: Boolean,
      default: false
    },
    adminEmailStatus: {
      type: String,
      enum: ['pending', 'sent', 'failed', 'simulated'],
      default: 'pending'
    },
    customerEmailStatus: {
      type: String,
      enum: ['pending', 'sent', 'failed', 'simulated'],
      default: 'pending'
    },
    emailError: {
      type: String,
      default: ''
    },
    lastEmailAttemptAt: {
      type: Date
    },
    ipAddress: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

enquirySchema.pre('save', function (next) {
  if (!this.referenceId) {
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const timestampPart = Date.now().toString(36).toUpperCase();
    this.referenceId = `DWX-${timestampPart}-${randomPart}`;
  }
  next();
});

enquirySchema.index({ createdAt: -1 });

const Enquiry = mongoose.model('Enquiry', enquirySchema);
export default Enquiry;


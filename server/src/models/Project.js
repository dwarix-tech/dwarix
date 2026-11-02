import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    slug: {
      type: String,
      required: [true, 'Project slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    shortDescription: {
      type: String,
      required: [true, 'Short description is required'],
      trim: true,
      maxlength: [300, 'Short description cannot exceed 300 characters']
    },
    fullDescription: {
      type: String,
      trim: true,
      default: ''
    },
    category: {
      type: String,
      required: [true, 'Project category is required'],
      trim: true,
      index: true
    },
    technologies: [
      {
        type: String,
        trim: true
      }
    ],
    thumbnail: {
      type: String,
      default: ''
    },
    gallery: [
      {
        type: String,
        trim: true
      }
    ],
    liveUrl: {
      type: String,
      trim: true,
      default: ''
    },
    githubUrl: {
      type: String,
      trim: true,
      default: ''
    },
    featured: {
      type: Boolean,
      default: false,
      index: true
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published',
      index: true
    },
    completionDate: {
      type: Date
    },
    isSampleConcept: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

projectSchema.index({ category: 1, status: 1 });

const Project = mongoose.model('Project', projectSchema);
export default Project;


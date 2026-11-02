import mongoose from 'mongoose';

const technologySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Technology name is required'],
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters']
    },
    category: {
      type: String,
      required: [true, 'Technology category is required'],
      trim: true,
      index: true
    },
    icon: {
      type: String,
      default: ''
    },
    color: {
      type: String,
      default: '#E06B2D'
    },
    description: {
      type: String,
      default: ''
    },
    displayOrder: {
      type: Number,
      default: 0,
      index: true
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

technologySchema.index({ category: 1, displayOrder: 1 });

const Technology = mongoose.model('Technology', technologySchema);
export default Technology;


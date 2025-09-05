import mongoose from 'mongoose';

const subtaskSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    default: '',
  },
  completed: {
    type: Boolean,
    default: false,
  },
});

const monthlyGoalSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  dueMonth: {
    type: String,
    required: true,
  },
  dueDays: {
    type: String,
    required: true,
  },
  subtasks: [subtaskSchema],
}, {
  timestamps: true,
});

export default mongoose.models.MonthlyGoal || mongoose.model('MonthlyGoal', monthlyGoalSchema);
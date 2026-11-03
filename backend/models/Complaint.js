import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  complaintId: { type: String, unique: true, index: true },
  category: { type: String, enum: ['Wi-Fi','Hostel','Classroom','Laboratory'], required: true },
  description: { type: String, required: true, trim: true, maxlength: 2000 },
  status: { type: String, enum: ['Raised','In Progress','Resolved'], default: 'Raised', index: true },
  submittedAt: { type: Date, default: Date.now, index: true }
}, { timestamps: true });
schema.index({ category: 1, status: 1 });
export default mongoose.model('Complaint', schema);

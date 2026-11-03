import 'dotenv/config'; import mongoose from 'mongoose'; import Complaint from '../models/Complaint.js';
await mongoose.connect(process.env.MONGODB_URI);
const now=Date.now(); const docs=[['C01','Wi-Fi','Wi-Fi is unavailable in the engineering block.','Raised',48],['C02','Hostel','The hot water system on the second floor is not working.','In Progress',8],['C03','Classroom','Ceiling fan in room 204 is making a loud noise.','Raised',72],['C04','Laboratory','Oscilloscope in electronics lab needs calibration.','Resolved',24]];
for(const [complaintId,category,description,status,hours] of docs){await Complaint.updateOne({complaintId},{$setOnInsert:{complaintId,category,description,status,submittedAt:new Date(now-hours*3600000)}},{upsert:true});}
await mongoose.connection.collection('counters').updateOne({_id:'complaintId'},{$max:{seq:4}},{upsert:true}); console.log('Seeded sample complaints (existing IDs preserved).'); await mongoose.disconnect();

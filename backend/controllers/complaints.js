import mongoose from 'mongoose';
import Complaint from '../models/Complaint.js';
const weights = { 'Wi-Fi': 2, Hostel: 2, Classroom: 1, Laboratory: 3 };
export const score = c => weights[c.category] + Math.floor(Math.max(0, Date.now() - new Date(c.submittedAt).getTime()) / 86400000);
export const rank = (a,b) => score(b)-score(a) || new Date(a.submittedAt)-new Date(b.submittedAt) || a.complaintId.localeCompare(b.complaintId, undefined, {numeric:true});
export const list = async (req,res,next) => { try {
 const q = {}; if (req.query.category) q.category=req.query.category; if (req.query.status) q.status=req.query.status;
 if (req.query.search) { const s=req.query.search; q.$or=[{complaintId:{$regex:s,$options:'i'}},{description:{$regex:s,$options:'i'}}]; }
 res.json({data:await Complaint.find(q).sort({submittedAt:-1})});
 } catch(e){next(e)} };
export const getOne = async (req,res,next) => { try { const c=await Complaint.findOne({complaintId:req.params.id}); if(!c)return res.status(404).json({error:'Complaint not found'}); res.json({data:c}); } catch(e){next(e)} };
export const create = async (req,res,next) => { try {
 const {category,description}=req.body; if(!['Wi-Fi','Hostel','Classroom','Laboratory'].includes(category)) return res.status(400).json({error:'Choose a valid category.'});
 if(typeof description!=='string'||!description.trim()) return res.status(400).json({error:'Description is required.'});
 if(description.trim().length>2000)return res.status(400).json({error:'Description must be 2,000 characters or fewer.'});
 // Counter document sequence is allocated atomically by MongoDB.
 const Counter=mongoose.connection.collection('counters'); const n=await Counter.findOneAndUpdate({_id:'complaintId'},{$inc:{seq:1}}, {upsert:true,returnDocument:'after'});
 const id=`C${String(n.seq).padStart(2,'0')}`; const c=await Complaint.create({complaintId:id,category,description:description.trim()}); res.status(201).json({data:c});
 } catch(e){ if(e.code===11000)return res.status(409).json({error:'Complaint ID collision. Please retry.'}); next(e) } };
export const updateStatus = async (req,res,next) => { try {
 const c=await Complaint.findOne({complaintId:req.params.id}); if(!c)return res.status(404).json({error:'Complaint not found'});
 const allowed={'Raised':'In Progress','In Progress':'Resolved'}; if(allowed[c.status]!==req.body.status)return res.status(400).json({error:`Invalid status transition from ${c.status}.`});
 c.status=req.body.status; await c.save(); res.json({data:c});
 } catch(e){next(e)} };
export const summary = async (_req,res,next) => { try {
 const rows=await Complaint.aggregate([{$group:{_id:null,total:{$sum:1},raised:{$sum:{$cond:[{$eq:['$status','Raised']},1,0]}},progress:{$sum:{$cond:[{$eq:['$status','In Progress']},1,0]}},resolved:{$sum:{$cond:[{$eq:['$status','Resolved']},1,0]}}}}]);
 const counts=rows[0]||{total:0,raised:0,progress:0,resolved:0}; const categories=await Complaint.aggregate([{$group:{_id:'$category',value:{$sum:1}}}]);
 res.json({data:{total:counts.total,pending:counts.raised+counts.progress,resolved:counts.resolved,byCategory:categories,byStatus:[{name:'Raised',value:counts.raised},{name:'In Progress',value:counts.progress},{name:'Resolved',value:counts.resolved}]}});
 } catch(e){next(e)} };
export const priority = async (_req,res,next) => { try { const rows=await Complaint.find({status:{$ne:'Resolved'}}); rows.sort(rank); res.json({data:rows.slice(0,3).map(c=>({...c.toObject(),urgencyScore:score(c)}))}); } catch(e){next(e)} };

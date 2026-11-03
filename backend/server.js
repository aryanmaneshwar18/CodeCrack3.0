import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
dotenv.config({ path: fileURLToPath(new URL('./.env', import.meta.url)) });
import express from 'express'; import cors from 'cors'; import mongoose from 'mongoose';
import complaints from './routes/complaints.js'; import analytics from './routes/analytics.js';
const app=express(); app.use(cors({origin:process.env.CLIENT_ORIGIN||'http://localhost:5173'})); app.use(express.json({limit:'20kb'}));
app.get('/api/health',(_req,res)=>res.json({status:'ok',database:mongoose.connection.readyState===1?'connected':'disconnected'}));
app.use('/api/complaints',complaints); app.use('/api/analytics',analytics);
app.use((err,_req,res,_next)=>{console.error(err);res.status(500).json({error:'Server error. Please try again.'})});
const port=process.env.PORT||5000;
try { await mongoose.connect(process.env.MONGODB_URI); app.listen(port,()=>console.log(`CampusCare API listening on ${port}`)); }
catch(e){console.error('MongoDB connection failed:',e.message);process.exit(1)}

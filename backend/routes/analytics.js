import { Router } from 'express'; import {summary,priority} from '../controllers/complaints.js';
const r=Router(); r.get('/summary',summary); r.get('/priority',priority); export default r;

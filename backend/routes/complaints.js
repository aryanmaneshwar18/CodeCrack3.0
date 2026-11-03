import { Router } from 'express';
import {create,list,getOne,updateStatus} from '../controllers/complaints.js';
const r=Router(); r.get('/',list); r.post('/',create); r.get('/:id',getOne); r.patch('/:id/status',updateStatus); export default r;

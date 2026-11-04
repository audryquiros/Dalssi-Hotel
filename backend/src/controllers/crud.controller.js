import { models } from '../models/index.js';

function getModel(table) { const model = models[table]; if (!model) { const e = new Error('Módulo no válido.'); e.status = 404; throw e; } return model; }
export async function list(req,res,next){try{res.json({data:await getModel(req.params.table).findAll()});}catch(e){next(e);}}
export async function get(req,res,next){try{const data=await getModel(req.params.table).findByPk(req.params.id);if(!data)return res.status(404).json({message:'Registro no encontrado.'});res.json({data});}catch(e){next(e);}}
export async function create(req,res,next){try{const data=await getModel(req.params.table).create(req.body);res.status(201).json({message:'Registro creado correctamente.',data});}catch(e){next(e);}}
export async function update(req,res,next){try{const model=getModel(req.params.table);const item=await model.findByPk(req.params.id);if(!item)return res.status(404).json({message:'Registro no encontrado.'});await item.update(req.body);res.json({message:'Registro actualizado correctamente.',data:item});}catch(e){next(e);}}
export async function remove(req,res,next){try{const item=await getModel(req.params.table).findByPk(req.params.id);if(!item)return res.status(404).json({message:'Registro no encontrado.'});await item.destroy();res.json({message:'Registro eliminado correctamente.'});}catch(e){next(e);}}

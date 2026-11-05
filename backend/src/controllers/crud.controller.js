import { models } from '../models/index.js';

function getModel(table) {
  const model = models[table];
  if (!model) {
    const e = new Error('Módulo no válido.');
    e.status = 404;
    throw e;
  }
  return model;
}

export async function list(req,res,next){
  try {
    const table = req.params.table;
    const model = getModel(table);

    if (table === 'reservaciones') {
      const data = await model.findAll({
        include: [{
          model: models.clientes,
          as: 'cliente',
          include: [{ model: models.personas, as: 'persona' }],
        }],
      });
      return res.json({ data });
    }

    res.json({data:await model.findAll()});
  } catch(e) {
    next(e);
  }
}

export async function get(req,res,next){
  try {
    const table = req.params.table;
    const model = getModel(table);

    if (table === 'reservaciones') {
      const data = await model.findByPk(req.params.id, {
        include: [{
          model: models.clientes,
          as: 'cliente',
          include: [{ model: models.personas, as: 'persona' }],
        }],
      });
      if(!data)return res.status(404).json({message:'Registro no encontrado.'});
      return res.json({data});
    }

    const data=await model.findByPk(req.params.id);
    if(!data)return res.status(404).json({message:'Registro no encontrado.'});
    res.json({data});
  }catch(e){next(e);}
}

export async function create(req,res,next){
  try{
    const table=req.params.table;
    if ((table==='pagos'||table==='facturas') && req.body.id_reservacion) {
      const existing=await getModel(table).findOne({where:{id_reservacion:req.body.id_reservacion}});
      if (existing) {
        const e=new Error(table==='pagos'?'La reservación ya tiene un pago asociado.':'La reservación ya tiene una factura asociada.');
        e.status=409;
        throw e;
      }
    }
    const data=await getModel(table).create(req.body);
    res.status(201).json({message:'Registro creado correctamente.',data});
  }catch(e){next(e);}
}

export async function update(req,res,next){
  try{
    const table=req.params.table;
    if(table==='facturas'){
      const e=new Error('Las facturas emitidas no se editan. Se conservan para impresión y control de facturación.');
      e.status=409;
      throw e;
    }
    const model=getModel(table);
    const item=await model.findByPk(req.params.id);
    if(!item)return res.status(404).json({message:'Registro no encontrado.'});
    if(table==='pagos' && req.body.id_reservacion && Number(req.body.id_reservacion)!==Number(item.id_reservacion)){
      const existing=await model.findOne({where:{id_reservacion:req.body.id_reservacion}});
      if(existing){const e=new Error('La reservación ya tiene un pago asociado.');e.status=409;throw e;}
    }
    await item.update(req.body);res.json({message:'Registro actualizado correctamente.',data:item});
  }catch(e){next(e);}
}

export async function remove(req,res,next){
  try{
    if(req.params.table==='facturas'){
      const e=new Error('Las facturas no se eliminan. Deben conservarse para impresión y control de facturación.');
      e.status=409;
      throw e;
    }
    const item=await getModel(req.params.table).findByPk(req.params.id);
    if(!item)return res.status(404).json({message:'Registro no encontrado.'});
    await item.destroy();
    res.json({message:'Registro eliminado correctamente.'});
  }catch(e){next(e);}
}

import { useEffect, useState } from 'react';
import { Eye, Printer, RefreshCw, Search } from 'lucide-react';
import { api } from '../../services/api.js';
import DetailModal from '../../components/DetailModal/DetailModal.jsx';
import EnumBadge from '../../components/EnumBadge/EnumBadge.jsx';
import './Facturas.css';

const money = value => `₡${Number(value || 0).toLocaleString('es-CR',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const dateText = value => value ? String(value).slice(0,10).split('-').reverse().join('/') : '—';
const clientName = row => {
  if (row?.cliente_nombre) return row.cliente_nombre;
  const person = row?.reservacion?.cliente?.persona;
  if (person) return `${person.nombre || ''} ${person.apellidos || ''}`.trim() || `Cliente #${row?.reservacion?.id_cliente || row?.id_cliente || '—'}`;
  return `Cliente #${row?.reservacion?.id_cliente || row?.id_cliente || '—'}`;
};

function Breakdown({ details = [] }) {
  if (!details.length) return <div className="invoice-empty-detail">No hay desglose registrado.</div>;
  return <div className="invoice-breakdown"><div className="invoice-breakdown-title">Desglose de la reservación</div>{details.map((item,index)=><div className="invoice-breakdown-row" key={item.id_detalle_factura || index}><div><strong>{item.descripcion}</strong><span>{item.cantidad} × {money(item.precio_unitario)}</span></div><b>{money(item.subtotal)}</b></div>)}</div>;
}

export default function Facturas() {
  const [rows,setRows]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[success,setSuccess]=useState(''),[query,setQuery]=useState('');
  const [viewing,setViewing]=useState(null);
  const load=async()=>{setLoading(true);setError('');try{const result=await api.list('facturas');setRows(result.data||[]);}catch(e){setError(e.message);}finally{setLoading(false);}};
  useEffect(()=>{load();},[]);
  useEffect(()=>{if(!success)return;const timer=setTimeout(()=>setSuccess(''),3000);return()=>clearTimeout(timer);},[success]);
  const filtered=rows.filter(row=>JSON.stringify(row).toLowerCase().includes(query.toLowerCase()));
  const openDetail=async row=>{try{const result=await api.get('facturas',row.id_factura);setViewing(result.data);}catch(e){setError(e.message);}};
  const printInvoice=async row=>{try{const result=await api.get('facturas',row.id_factura);const invoice=result.data;const detailRows=(invoice.detalle_factura||[]).map(item=>`<div class="line"><div><strong>${item.descripcion||'Concepto'}</strong><small>${item.cantidad||1} × ${money(item.precio_unitario)}</small></div><strong>${money(item.subtotal)}</strong></div>`).join('');const html=`<!doctype html><html><head><title>${invoice.numero_factura}</title><style>body{font-family:Arial,sans-serif;background:#f7f8fc;color:#25304a;padding:40px}.invoice{max-width:760px;margin:auto;background:#fff;padding:36px;border:1px solid #ddd;border-radius:16px}.brand{color:#6f63a9;letter-spacing:3px;font-weight:800;font-size:11px}.title{font-size:28px;margin:8px 0}.muted{color:#777f96;font-size:12px}.meta{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:24px 0}.box{border:1px solid #eee;padding:12px;border-radius:10px}.box span{display:block;color:#9a9eae;font-size:10px;margin-bottom:4px}.box strong{font-size:13px}.section{margin-top:25px}.section h3{font-size:14px;margin-bottom:10px}.line{display:flex;justify-content:space-between;gap:20px;padding:11px 0;border-bottom:1px solid #eee;font-size:12px}.line small{display:block;color:#888;font-size:10px;margin-top:3px}.totals{margin-left:auto;width:300px;margin-top:18px}.total{display:flex;justify-content:space-between;padding:7px 0}.grand{font-size:17px;font-weight:800;border-top:1px solid #ddd;padding-top:12px;margin-top:6px}.status{display:inline-block;padding:6px 10px;border-radius:20px;background:#e8f5ef;color:#28735a;font-weight:700;font-size:10px}</style></head><body><div class="invoice"><div class="brand">DALSSI HOTEL</div><div class="title">Factura ${invoice.numero_factura}</div><div class="muted">Fecha de emisión: ${dateText(invoice.fecha_emision)}</div><div class="meta"><div class="box"><span>Reservación</span><strong>#${invoice.id_reservacion}</strong></div><div class="box"><span>Cliente</span><strong>${clientName(invoice)}</strong></div></div><div class="section"><h3>Detalle</h3>${detailRows}</div><div class="totals"><div class="total"><span>Subtotal</span><strong>${money(invoice.subtotal)}</strong></div><div class="total"><span>Impuesto (13%)</span><strong>${money(invoice.impuestos)}</strong></div><div class="total grand"><span>Total</span><strong>${money(invoice.total)}</strong></div></div><p><span class="status">${invoice.estado || 'Emitida'}</span></p></div><script>window.onload=()=>window.print();</script></body></html>`;const win=window.open('','_blank','width=900,height=750');if(!win){setError('El navegador bloqueó la ventana de impresión.');return;}win.document.write(html);win.document.close();}catch(e){setError(e.message);}};

  return <section className="crud-page invoices-page">
    <div className="crud-heading"><div/><span className="invoice-flow-note">Las facturas se generan automáticamente al confirmar un pago.</span></div>
    <div className="crud-toolbar"><div className="crud-search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar facturas..."/></div><button className="crud-icon-btn" onClick={load} title="Actualizar"><RefreshCw size={17}/></button><span>{filtered.length} registros</span></div>
    {error&&<div className="crud-error">{error}</div>}{success&&<div className="crud-success">{success}</div>}
    <div className="crud-table-wrap">{loading?<p className="crud-state">Cargando información...</p>:filtered.length===0?<div className="crud-state">No hay facturas para mostrar.</div>:<table className="crud-table invoice-table"><thead><tr><th>Factura</th><th>Reservación</th><th>Cliente</th><th>Fecha de emisión</th><th>Subtotal</th><th>Impuesto</th><th>Total</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{filtered.map(row=><tr key={row.id_factura}><td>{row.numero_factura||`DAL-2026-${String(row.id_factura).padStart(4,'0')}`}</td><td>#{row.id_reservacion}</td><td>{clientName(row)}</td><td>{dateText(row.fecha_emision)}</td><td>{money(row.subtotal)}</td><td>{money(row.impuestos)}</td><td>{money(row.total)}</td><td><EnumBadge field="estado" value={row.estado}/></td><td><div className="crud-actions"><button onClick={()=>openDetail(row)} title="Ver detalle"><Eye size={16}/></button><button className="invoice-print-action" onClick={()=>printInvoice(row)} title="Imprimir factura"><Printer size={16}/></button></div></td></tr>)}</tbody></table>}</div>

    {viewing&&<DetailModal title={`Factura · ${viewing.numero_factura || `DAL-2026-${String(viewing.id_factura).padStart(4,'0')}`}`} items={[{label:'Reservación',value:`#${viewing.id_reservacion}`},{label:'Cliente',value:clientName(viewing)},{label:'Número de factura',value:viewing.numero_factura},{label:'Fecha de emisión',value:dateText(viewing.fecha_emision)},{label:'Subtotal',value:money(viewing.subtotal)},{label:'Impuesto (13%)',value:money(viewing.impuestos)},{label:'Total',value:money(viewing.total)},{label:'Estado',value:<EnumBadge field="estado" value={viewing.estado}/>}]} onClose={()=>setViewing(null)} onPrint={()=>printInvoice(viewing)} printLabel="Imprimir factura"><Breakdown details={viewing.detalle_factura}/></DetailModal>}


  </section>;
}

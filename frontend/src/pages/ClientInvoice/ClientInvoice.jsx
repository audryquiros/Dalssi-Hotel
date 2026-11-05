import { useEffect, useState } from 'react'
import { ArrowLeft, Download, FileText } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../../services/api.js'
import './ClientInvoice.css'

export default function ClientInvoice() {
  const { id } = useParams()
  const [invoice, setInvoice] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { api.clientInvoice(id).then(({ data }) => setInvoice(data)).catch((err) => setError(err.message)) }, [id])
  if (error) return <div className="invoice-page"><Link to="/cliente/reservaciones" className="invoice-back"><ArrowLeft size={16}/> Volver a mis estadías</Link><div className="invoice-error">{error}</div></div>
  if (!invoice) return <div className="invoice-page"><div className="invoice-loading">Cargando factura...</div></div>
  return <div className="invoice-page"><header className="invoice-nav"><Link to="/cliente/reservaciones" className="invoice-back"><ArrowLeft size={16}/> Volver a mis estadías</Link><div className="landing-brand"><img src="/logo/dalssi-isotipo.png" alt=""/><div><strong>DALSSI</strong><span>HOTEL</span></div></div></header><main className="invoice-wrap"><div className="invoice-heading"><span className="landing-kicker"><FileText size={14}/> DOCUMENTO DE ESTADÍA</span><h1>Tu factura.</h1><p>El detalle de tu visita en Dalssi, listo para consultar cuando quieras.</p><button onClick={() => window.print()} className="invoice-print"><Download size={15}/> Imprimir / guardar PDF</button></div><article className="invoice-card"><div className="invoice-card-top"><div><span>DALSSI HOTEL</span><h2>{invoice.numero_factura || `Factura #${invoice.id_factura}`}</h2></div><div className="invoice-status">{invoice.estado === 'emitida' ? 'Emitida' : 'Anulada'}</div></div><div className="invoice-meta"><div><small>FECHA DE EMISIÓN</small><strong>{invoice.fecha_emision ? new Date(invoice.fecha_emision).toLocaleDateString('es-CR') : '—'}</strong></div><div><small>RESERVACIÓN</small><strong>#{invoice.id_reservacion}</strong></div></div><div className="invoice-lines">{(invoice.detalle_factura || []).map((line) => <div className="invoice-line" key={line.id_detalle_factura}><div><strong>{line.descripcion}</strong><span>{line.cantidad} × ₡{Number(line.precio_unitario || 0).toLocaleString('es-CR')}</span></div><strong>₡{Number(line.subtotal || 0).toLocaleString('es-CR')}</strong></div>)}</div><div className="invoice-totals"><div><span>Subtotal</span><strong>₡{Number(invoice.subtotal || 0).toLocaleString('es-CR')}</strong></div><div><span>Impuestos</span><strong>₡{Number(invoice.impuestos || 0).toLocaleString('es-CR')}</strong></div><div className="invoice-total"><span>Total</span><strong>₡{Number(invoice.total || 0).toLocaleString('es-CR')}</strong></div></div></article></main></div>
}

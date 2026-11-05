import { X, Printer } from 'lucide-react';
import './DetailModal.css';

export default function DetailModal({ title, items = [], onClose, onPrint }) {
  return (
    <div className="detail-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="detail-modal">
        <div className="detail-modal-head">
          <div>
            <span className="detail-kicker">DETALLE</span>
            <h3>{title}</h3>
          </div>
          <div className="detail-modal-head-actions">{onPrint&&<button type="button" onClick={onPrint} aria-label="Imprimir" title="Imprimir"><Printer size={17}/></button>}<button type="button" onClick={onClose} aria-label="Cerrar"><X size={19} /></button></div>
        </div>
        <div className="detail-grid">
          {items.map((item) => (
            <div className="detail-item" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value ?? '—'}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

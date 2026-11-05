import { X } from 'lucide-react';
import './DetailModal.css';

export default function DetailModal({ title, items = [], onClose }) {
  return (
    <div className="detail-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="detail-modal">
        <div className="detail-modal-head">
          <div>
            <span className="detail-kicker">DETALLE</span>
            <h3>{title}</h3>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar"><X size={19} /></button>
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

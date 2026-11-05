import { createContext, useContext, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import './ConfirmDialog.css';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null);

  const confirm = (message, title = 'Confirmar acción') => new Promise(resolve => {
    setDialog({ message, title, resolve });
  });

  const close = value => {
    if (dialog?.resolve) dialog.resolve(value);
    setDialog(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {dialog && (
        <div className="confirm-dialog-backdrop" onMouseDown={event => event.target === event.currentTarget && close(false)}>
          <div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
            <button type="button" className="confirm-dialog-close" onClick={() => close(false)} aria-label="Cerrar">
              <X size={18} />
            </button>
            <div className="confirm-dialog-icon"><AlertTriangle size={22} /></div>
            <h3 id="confirm-dialog-title">{dialog.title}</h3>
            <p>{dialog.message}</p>
            <div className="confirm-dialog-actions">
              <button type="button" className="crud-secondary" onClick={() => close(false)}>Cancelar</button>
              <button type="button" className="confirm-dialog-confirm" onClick={() => close(true)}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const confirm = useContext(ConfirmContext);
  if (!confirm) throw new Error('useConfirm debe utilizarse dentro de ConfirmProvider.');
  return confirm;
}

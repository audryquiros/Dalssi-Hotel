import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { createPortal } from 'react-dom';
import './Select.css';

export default function Select({ value = '', onChange, options = [], placeholder = 'Seleccione una opción', disabled = false, ariaLabel }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const selected = options.find(option => String(option.value) === String(value));

  const updatePosition = () => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = Math.max(rect.width, 180);
    const maxLeft = window.innerWidth - width - 12;
    const estimatedHeight = Math.min(260, (options.length + 1) * 40 + 12);
    const spaceBelow = window.innerHeight - rect.bottom;
    const top = spaceBelow < estimatedHeight && rect.top > estimatedHeight ? rect.top - estimatedHeight - 6 : rect.bottom + 6;
    setPosition({ top: Math.max(12, top), left: Math.max(12, Math.min(rect.left, maxLeft)), width });
  };

  useEffect(() => {
    if (!open) return undefined;
    updatePosition();
    const close = event => {
      if (ref.current?.contains(event.target) || event.target.closest?.('.dalssi-select-menu')) return;
      setOpen(false);
    };
    const reposition = () => updatePosition();
    document.addEventListener('mousedown', close);
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    return () => {
      document.removeEventListener('mousedown', close);
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
    };
  }, [open, options.length]);

  const choose = option => { onChange({ target: { value: String(option.value) } }); setOpen(false); };

  return <div className={`dalssi-select ${open ? 'is-open' : ''}`} ref={ref}>
    <button type="button" className="dalssi-select-trigger" onClick={() => !disabled && setOpen(current => !current)} disabled={disabled} aria-haspopup="listbox" aria-expanded={open} aria-label={ariaLabel}>
      <span className={!selected ? 'placeholder' : ''}>{selected?.label || placeholder}</span><ChevronDown size={16} />
    </button>
    {open && createPortal(<div className="dalssi-select-menu" role="listbox" style={{ top: position.top, left: position.left, width: position.width }}>
      <button type="button" className={`dalssi-select-option placeholder-option ${!selected ? 'is-selected' : ''}`} onClick={() => { onChange({ target: { value: '' } }); setOpen(false); }}>{placeholder}</button>
      {options.map(option => <button type="button" role="option" aria-selected={String(option.value) === String(value)} className={`dalssi-select-option ${String(option.value) === String(value) ? 'is-selected' : ''}`} key={option.value} onClick={() => choose(option)}><span>{option.label}</span>{String(option.value) === String(value) && <Check size={15} />}</button>)}
    </div>, document.body)}
  </div>;
}

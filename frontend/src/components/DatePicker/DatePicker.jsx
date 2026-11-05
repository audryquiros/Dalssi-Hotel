import { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { createPortal } from 'react-dom';
import './DatePicker.css';

const MONTHS = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const WEEKDAYS = ['LU','MA','MI','JU','VI','SA','DO'];
const pad = value => String(value).padStart(2, '0');
function toDate(value) { if (!value) return null; const [year, month, day] = String(value).slice(0, 10).split('-').map(Number); return year && month && day ? new Date(year, month - 1, day) : null; }
function toValue(date) { return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`; }
function displayValue(value) { const date = toDate(value); return date ? `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}` : ''; }

export default function DatePicker({ value = '', onChange, placeholder = 'dd/mm/aaaa', disabled = false, ariaLabel }) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => { const date = toDate(value) || new Date(); return new Date(date.getFullYear(), date.getMonth(), 1); });
  const ref = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const selected = toDate(value);
  const today = new Date();
  const calendarDays = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const previousDays = new Date(month.getFullYear(), month.getMonth(), 0).getDate();
    const days = [];
    for (let i = offset - 1; i >= 0; i--) days.push({ day: previousDays - i, outside: true, date: new Date(month.getFullYear(), month.getMonth() - 1, previousDays - i) });
    for (let day = 1; day <= daysInMonth; day++) days.push({ day, outside: false, date: new Date(month.getFullYear(), month.getMonth(), day) });
    let next = 1;
    while (days.length < 42) days.push({ day: next, outside: true, date: new Date(month.getFullYear(), month.getMonth() + 1, next++) });
    return days;
  }, [month]);
  const updatePosition = () => { if (!ref.current) return; const rect = ref.current.getBoundingClientRect(); const width = Math.max(rect.width, 300); const maxLeft = window.innerWidth - width - 12; const top = Math.min(rect.bottom + 8, window.innerHeight - 390); setPosition({ top: Math.max(12, top), left: Math.max(12, Math.min(rect.left, maxLeft)), width }); };
  useEffect(() => {
    if (!open) return;
    updatePosition();
    const close = event => { if (!ref.current?.contains(event.target) && !event.target.closest?.('.dalssi-date-menu')) setOpen(false); };
    const reposition = () => updatePosition();
    document.addEventListener('mousedown', close); window.addEventListener('resize', reposition); window.addEventListener('scroll', reposition, true);
    return () => { document.removeEventListener('mousedown', close); window.removeEventListener('resize', reposition); window.removeEventListener('scroll', reposition, true); };
  }, [open]);
  const choose = date => { onChange({ target: { value: toValue(date) } }); setOpen(false); };
  const changeMonth = amount => setMonth(current => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  const goToday = () => { const date = new Date(); setMonth(new Date(date.getFullYear(), date.getMonth(), 1)); choose(date); };
  const clear = () => { onChange({ target: { value: '' } }); setOpen(false); };
  return <div className="dalssi-date-picker" ref={ref}>
    <button type="button" className={`dalssi-date-trigger ${open ? 'is-open' : ''}`} onClick={() => { if (!disabled) { setOpen(current => !current); if (!open && value) { const date = toDate(value); setMonth(new Date(date.getFullYear(), date.getMonth(), 1)); } } }} disabled={disabled} aria-label={ariaLabel}>
      <span className={value ? '' : 'placeholder'}>{displayValue(value) || placeholder}</span><CalendarDays size={16} />
    </button>
    {open && createPortal(<div className="dalssi-date-menu" style={{ top: position.top, left: position.left, width: position.width }}>
      <div className="dalssi-date-head"><button type="button" onClick={() => changeMonth(-1)}><ChevronLeft size={17} /></button><strong>{MONTHS[month.getMonth()]} de {month.getFullYear()}</strong><button type="button" onClick={() => changeMonth(1)}><ChevronRight size={17} /></button></div>
      <div className="dalssi-date-weekdays">{WEEKDAYS.map(day => <span key={day}>{day}</span>)}</div>
      <div className="dalssi-date-grid">{calendarDays.map(({ day, date, outside }, index) => { const currentValue = toValue(date); const isSelected = selected && toValue(selected) === currentValue; const isToday = toValue(today) === currentValue; return <button type="button" key={`${currentValue}-${index}`} className={`dalssi-date-day ${outside ? 'outside' : ''} ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`} onClick={() => choose(date)}>{day}</button>; })}</div>
      <div className="dalssi-date-footer"><button type="button" onClick={clear}>Borrar</button><button type="button" onClick={goToday}>Hoy</button></div>
    </div>, document.body)}
  </div>;
}

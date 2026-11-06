'use client';
/* Etkileşimli temel bileşenler: işlem butonu, modal, toast, açılır menü */
import { useEffect, useLayoutEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { closeModal, toast, useUI } from '@/lib/store/ui-store';
import { errorMessage } from '@/lib/api/errors';
import { Icon } from './Icon';

/**
 * Asenkron işlem butonu: tıklanınca yükleniyor durumuna geçer, hata olursa toast gösterir.
 * type="submit" + form ile form gönderimi için de kullanılabilir (onRun yoksa normal davranır).
 */
export function AsyncButton({ onRun, busyLabel = 'İşleniyor…', children, className = 'btn btn-dark', busy: busyProp, ...rest }:
  { onRun?: () => Promise<unknown> | unknown; busyLabel?: string; busy?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>) {
  const [busy, setBusy] = useState(false);
  const isBusy = busy || !!busyProp;
  return (
    <button
      type="button" {...rest}
      className={className + (isBusy ? ' is-loading' : '')}
      disabled={isBusy || rest.disabled}
      onClick={onRun ? async () => {
        setBusy(true);
        try { await onRun(); } catch (e) { toast(errorMessage(e), 'error'); } finally { setBusy(false); }
      } : rest.onClick}
    >
      {isBusy ? <><span className="spinner" /><span>{busyLabel}</span></> : children}
    </button>
  );
}

/** Form gönderimini yükleniyor durumuyla saran yardımcı kanca */
export function useBusy() {
  const [busy, setBusy] = useState(false);
  const wrap = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try { await fn(); return true; } catch (e) { toast(errorMessage(e), 'error'); return false; } finally { setBusy(false); }
  };
  return [busy, wrap] as const;
}

export function Spinner({ size = 18, color }: { size?: number; color?: string }) {
  return <span className="spinner" style={{ width: size, height: size, color }} />;
}

/** Modal iskeleti — içerik bileşenleri bunu kullanır; openModal(<X/>) ile açılır */
export function Modal({ title, sub, size, children, footer, onClose }: { title?: ReactNode; sub?: ReactNode; size?: 'lg' | 'xl'; children?: ReactNode; footer?: ReactNode; onClose?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const first = ref.current?.querySelector<HTMLElement>('input:not([type=hidden]):not([readonly]),textarea,select');
    const t = setTimeout(() => first?.focus(), 50);
    return () => { clearTimeout(t); onClose?.(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className={'modal ' + (size || '')} role="dialog" aria-modal="true" ref={ref}>
      <div className="modal-head">
        <div>{title && <h3>{title}</h3>}{sub && <p>{sub}</p>}</div>
        <button className="icon-btn" onClick={closeModal} aria-label="Kapat"><Icon name="x" size={18} /></button>
      </div>
      <div className="modal-body">{children}</div>
      {footer && <div className="modal-foot">{footer}</div>}
    </div>
  );
}

export function ModalHost() {
  const modal = useUI((s) => s.modal);
  useEffect(() => {
    if (!modal) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [modal]);
  if (!modal) return null;
  return <div className="overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) closeModal(); }}>{modal}</div>;
}

export function Toaster() {
  const toasts = useUI((s) => s.toasts);
  return (
    <div className="toasts" role="status">
      {toasts.map((t) => (
        <div key={t.id} className={'toast ' + t.type + (t.out ? ' out' : '')}>
          <span className="ti"><Icon name={t.type === 'error' ? 'x' : t.type === 'info' ? 'info' : 'check'} size={13} /></span>
          <div>{t.msg}{t.sub && <small>{t.sub}</small>}</div>
        </div>
      ))}
    </div>
  );
}

/** Açılır menü: tetikleyiciye göre konumlanır, dışarı tıklayınca / Esc ile kapanır */
export function Dropdown({ trigger, children, className, label }: { trigger: ReactNode; children: (close: () => void) => ReactNode; className?: string; label: string }) {
  const [open, setOpen] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: 0, top: 0 });
  useLayoutEffect(() => {
    if (!open || !btn.current || !menu.current) return;
    const r = btn.current.getBoundingClientRect(); const w = menu.current.offsetWidth;
    setPos({ left: Math.max(12, Math.min(r.right - w, window.innerWidth - w - 12)), top: r.bottom + 8 });
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!menu.current?.contains(e.target as Node) && !btn.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown); window.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); window.removeEventListener('keydown', onKey); };
  }, [open]);
  return (
    <>
      <button ref={btn} className={className} aria-label={label} aria-haspopup="true" aria-expanded={open} onClick={() => setOpen((o) => !o)}>{trigger}</button>
      {/* body'ye taşınır: üst çubuktaki backdrop-filter, position:fixed konumunu bozar */}
      {open && createPortal(<div ref={menu} className="menu" style={{ position: 'fixed', left: pos.left, top: pos.top }}>{children(() => setOpen(false))}</div>, document.body)}
    </>
  );
}

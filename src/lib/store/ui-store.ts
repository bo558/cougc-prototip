'use client';
/* Arayüz durumu: toast bildirimleri ve tek aktif modal */
import type { ReactNode } from 'react';
import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';
interface Toast { id: number; msg: string; sub?: string; type: ToastType; out?: boolean }

interface UIState {
  toasts: Toast[];
  modal: ReactNode | null;
  crumbs: { t: string; h?: string }[];
}

export const useUI = create<UIState>(() => ({ toasts: [], modal: null, crumbs: [] }));

let seq = 0;
export function toast(msg: string, type: ToastType = 'success', sub?: string) {
  const id = ++seq;
  useUI.setState((s) => ({ toasts: [...s.toasts, { id, msg, sub, type }] }));
  setTimeout(() => useUI.setState((s) => ({ toasts: s.toasts.map((t) => (t.id === id ? { ...t, out: true } : t)) })), 3600);
  setTimeout(() => useUI.setState((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3900);
}

export const openModal = (node: ReactNode) => useUI.setState({ modal: node });
export const closeModal = () => useUI.setState({ modal: null });

import { PanelShell } from '@/components/layout/PanelShell';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PanelShell panel="admin">{children}</PanelShell>;
}

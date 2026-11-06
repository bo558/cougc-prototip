import { ICON_PATHS, type IconName } from './icon-paths';

const FILLED: IconName[] = ['play', 'pause', 'sparkle', 'star-fill'];

export function Icon({ name, size = 18, className }: { name: IconName; size?: number; className?: string }) {
  const filled = FILLED.includes(name);
  return (
    <svg
      className={'ico' + (className ? ' ' + className : '')}
      width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={filled ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: ICON_PATHS[name] }}
    />
  );
}

/** Logodaki dört köşeli yıldız (dekoratif kullanım; logonun kendisi PNG dosyasıdır) */
export function Star({ className = 'star' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 1.5c.7 5.6 2.6 8.6 10.5 10.5C14.6 13.9 12.7 16.9 12 22.5c-.7-5.6-2.6-8.6-10.5-10.5C9.4 10.1 11.3 7.1 12 1.5z" />
    </svg>
  );
}

export type { IconName };

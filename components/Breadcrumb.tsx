'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/ui/primitives';

interface BreadcrumbItem {
  label: string;
  href: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 16px',
        fontSize: '12px',
        color: 'var(--ink-secondary)',
      }}
    >
      <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
        Home
      </Link>
      {items.map((item, index) => (
        <div key={item.href} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Icon name="chevronRight" size={12} color="var(--ink-secondary)" />
          {index === items.length - 1 ? (
            <span style={{ color: 'var(--ink)' }}>{item.label}</span>
          ) : (
            <Link href={item.href} style={{ color: 'inherit', textDecoration: 'none' }}>
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}

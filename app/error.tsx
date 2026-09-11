'use client';

import { useEffect } from 'react';
import { Icon, PrimaryBtn, PageShell } from '@/components/ui/primitives';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <PageShell>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          gap: '20px',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '12px',
            background: 'var(--warn)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
          }}
        >
          <Icon name="x" size={32} stroke={2} color="#fff" />
        </div>

        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: '700',
              marginBottom: '8px',
              color: 'var(--ink)',
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: 'var(--ink-secondary)',
              lineHeight: '1.5',
            }}
          >
            We encountered an unexpected error. Try refreshing the page or returning to the home screen.
          </p>
          {error.digest && (
            <p
              style={{
                fontSize: '12px',
                color: 'var(--ink-tertiary)',
                marginTop: '12px',
                fontFamily: 'monospace',
              }}
            >
              Error ID: {error.digest}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <PrimaryBtn onClick={() => reset()}>
            Try again
          </PrimaryBtn>
          <button
            onClick={() => (window.location.href = '/')}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--ink)',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '15px',
            }}
          >
            Go home
          </button>
        </div>
      </div>
    </PageShell>
  );
}

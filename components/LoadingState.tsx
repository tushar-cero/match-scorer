'use client';

import { PageShell } from '@/components/ui/primitives';

export function LoadingState({ message = 'Loading…' }: { message?: string }) {
  return (
    <PageShell>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          color: 'var(--ink-secondary)',
          fontSize: 14,
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            border: '2px solid var(--border)',
            borderTopColor: 'var(--ink)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        {message}
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </PageShell>
  );
}

export function ErrorState({
  message = 'An error occurred',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <PageShell>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          flexDirection: 'column',
          gap: '16px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '8px',
            background: 'var(--surface-2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
          }}
        >
          ⚠️
        </div>
        <div style={{ maxWidth: '300px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '6px', color: 'var(--ink)' }}>
            {message}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--ink-secondary)' }}>
            Please try again or contact support if the problem persists.
          </p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--ink)',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              marginTop: '8px',
            }}
          >
            Try again
          </button>
        )}
      </div>
    </PageShell>
  );
}

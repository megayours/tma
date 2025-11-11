import { createFileRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { useAuth } from '@/auth/useAuth';
// import { TonConnectButton, useTonAddress } from '@tonconnect/ui-react';

export const Route = createFileRoute('/private/')({
  component: PrivatePage,
});

function PrivatePage() {
  const { session, isAuthenticated } = useAuth();
  console.log('session', session);
  // const tonAddress = useTonAddress();
  return (
    <ProtectedRoute>
      Private Page: Authenticated: {isAuthenticated ? 'Yes' : 'No'} Username:{' '}
      {session && session.username} ID: {session && session.id}
      {/* <TonConnectButton />
      <div>Ton Address: {tonAddress}</div> */}
    </ProtectedRoute>
  );
}

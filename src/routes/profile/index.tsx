import { createFileRoute, Outlet } from '@tanstack/react-router';
import { ProtectedRoute } from '../../auth/ProtectedRoute';
import { Section } from '@telegram-apps/telegram-ui';
import MyPrompts from './MyPrompts';

export const Route = createFileRoute('/profile/')({
  component: ProfileLayout,
});

function ProfileLayout() {
  return (
    <ProtectedRoute>
      <div className="profile-layout">
        {/* Optional: Add profile-specific navigation here */}
        <nav className="profile-nav mb-4">
          <h1 className="mb-4 text-2xl font-bold">Profile</h1>
          {/* You can add navigation links here if needed */}
        </nav>
        <Section>
          <h1>Your prompts</h1>
          <MyPrompts />
        </Section>
      </div>
    </ProtectedRoute>
  );
}

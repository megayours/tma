import { createFileRoute, Outlet } from '@tanstack/react-router';
import { SettingsProvider } from '@/contexts/SettingsContext';

export const Route = createFileRoute('/profile/prompt/edit')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <SettingsProvider>
      <Outlet />
    </SettingsProvider>
  );
}

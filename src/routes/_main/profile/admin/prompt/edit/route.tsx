import { createFileRoute, Outlet } from '@tanstack/react-router';
import { SettingsProvider } from '@/contexts/SettingsContext';

export const Route = createFileRoute('/_main/profile/admin/prompt/edit')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <SettingsProvider>
      <Outlet />
    </SettingsProvider>
  );
}

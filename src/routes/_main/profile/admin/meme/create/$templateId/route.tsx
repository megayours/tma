import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_main/profile/admin/meme/create/$templateId'
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { templateId } = Route.useParams();

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Top bar will go here */}
      <div className="border-b p-4">
        <h1>Template Editor: {templateId}</h1>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-hidden">
        <Outlet />
      </div>
    </div>
  );
}

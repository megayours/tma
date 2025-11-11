import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_main/profile/my-sticker-packs/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/profile/my-sticker-packs/"!</div>;
}

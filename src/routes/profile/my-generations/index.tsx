import { createFileRoute } from '@tanstack/react-router';
import { useSession } from '@/auth/SessionProvider';
import { MyGenerationsList } from './MyGenerationsList';

export const Route = createFileRoute('/profile/my-generations/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { session } = useSession();

  return <MyGenerationsList session={session} days="30" pageSize={20} />;
}

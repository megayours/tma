import { createFileRoute } from '@tanstack/react-router';
import { useGetPrompts } from '../../hooks/usePrompts';

export const Route = createFileRoute('/demo3/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { prompts, isLoading } = useGetPrompts();

  console.log('prompts', prompts);
  return <div>Hello "/demo3/"!</div>;
}

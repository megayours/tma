import { createFileRoute } from '@tanstack/react-router';
import { Landing } from '@/routes/landing';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  return (
    <div className="bg-tg-bg text-tg-text">
      <Landing />
    </div>
  );
}

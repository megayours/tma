import { createFileRoute, Navigate } from '@tanstack/react-router';

export const Route = createFileRoute('/content/$promptId/')({
  component: ContentIndex,
});

function ContentIndex() {
  const { promptId } = Route.useParams();

  return <Navigate to="/content/$promptId/details" params={{ promptId }} />;
}

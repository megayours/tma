/**
 * @deprecated This route is kept for backwards compatibility only.
 * The main success page has moved to /content/$promptId/success/execution/$executionId
 * This route is used by preview images on the details page that don't have an executionId.
 */
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

export const Route = createFileRoute('/content/$promptId/success/')({
  component: SuccessRedirect,
});

function SuccessRedirect() {
  const { promptId } = Route.useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the prompt details page since there's no execution to show
    navigate({
      to: '/content/$promptId/details',
      params: { promptId },
      replace: true,
    });
  }, [promptId, navigate]);

  return null;
}

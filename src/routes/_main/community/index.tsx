import { createFileRoute } from '@tanstack/react-router';
import { Feed } from './Feed';

export const Route = createFileRoute('/_main/community/')({
  component: Feed,
});

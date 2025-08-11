import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/profile/prompt/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/profile/prompts/"!</div>
}

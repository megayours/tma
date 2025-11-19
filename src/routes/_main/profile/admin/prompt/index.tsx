import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/profile/admin/prompt/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/profile/prompts/"!</div>
}

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/t/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/t/$id"!</div>
}

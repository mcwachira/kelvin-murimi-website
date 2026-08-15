import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/dashboard/$section')({
  component: () => <Outlet />,
})

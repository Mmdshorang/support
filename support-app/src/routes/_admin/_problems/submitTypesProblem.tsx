import { createFileRoute } from '@tanstack/react-router'
import submitTypesProblem from "../../../pages/submitTypesProblem"
import { requireAdmin } from "../../../lib/auth-guard";

export const Route = createFileRoute('/_admin/_problems/submitTypesProblem')({
  component: submitTypesProblem,
  beforeLoad: () => {
    requireAdmin();
  },
})

import { createFileRoute } from '@tanstack/react-router'
import submitTypesProblem from "../../../pages/submitTypesProblem"

export const Route = createFileRoute('/_admin/_problems/submitTypesProblem')({
  component: submitTypesProblem,
})

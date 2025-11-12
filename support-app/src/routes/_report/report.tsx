import { createFileRoute } from '@tanstack/react-router'
import Report from "../../pages/Report"

export const Route = createFileRoute('/_report/report')({
  component: Report,
})

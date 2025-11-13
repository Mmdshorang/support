import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_login/signup")({
  component: () => (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Sign Up</h1>
      <p>Sign up page.</p>
    </div>
  ),
});

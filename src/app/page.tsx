"use client";

import { redirect } from "next/navigation";

// Simply render the ProjectDashboard on the root path
export default function HomePage() {
  // Perform server-side redirect to /projects
  redirect("/projects");
}

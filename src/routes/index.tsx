import { createFileRoute } from "@tanstack/react-router";
import { FrenchieExperience } from "@/components/FrenchieExperience";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <FrenchieExperience />;
}

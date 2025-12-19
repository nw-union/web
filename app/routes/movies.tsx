import { createMetaTags } from "../util";
import type { Route } from "./+types/movies";

export const meta = (_: Route.MetaArgs) =>
  createMetaTags({
    title: "Movies - NWU",
    description: "Watch NWU videos and movies",
  });

export default function Movies() {
  return (
    <div className="min-h-screen pb-20 bg-white dark:bg-gray-900">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-zinc-900 dark:text-zinc-100">
          Movies
        </h1>
        <div className="text-zinc-700 dark:text-zinc-300">
          <p>Video content coming soon...</p>
        </div>
      </main>
    </div>
  );
}

import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/app" });
  },
  head: () => ({
    meta: [
      { title: "Smart CV — One master CV, tailored for every job" },
      {
        name: "description",
        content:
          "Pick a CV template, add your CV, and let Smart CV tailor it to every job you apply for.",
      },
      { property: "og:title", content: "Smart CV — One master CV, tailored for every job" },
      {
        property: "og:description",
        content:
          "Pick a CV template, add your CV, and let Smart CV tailor it to every job you apply for.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => null,
});

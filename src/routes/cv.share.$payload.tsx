import { createFileRoute } from "@tanstack/react-router";
import { CvPreview } from "@/components/cv-preview";
import { decodeSharePayload } from "@/lib/cv-share";

export const Route = createFileRoute("/cv/share/$payload")({
  head: () => ({
    meta: [
      { title: "Shared CV — Smart CV" },
      { name: "description", content: "A CV shared as a read-only link." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SharedCvPage,
});

function SharedCvPage() {
  const { payload } = Route.useParams();
  const data = decodeSharePayload(payload);

  if (!data) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <h1 className="display text-2xl">Link not valid</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This share link is incomplete or was changed. Ask for a new link.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl p-3 sm:p-6">
      <h1 className="sr-only">{data.name}</h1>
      <CvPreview cv={data.cv} />
    </main>
  );
}

"use client";

export default function StaticPageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  if (process.env.NODE_ENV === "development") {
    console.error("Static content segment failed", error);
  }
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 rounded-md border border-gray-200 bg-white p-6 text-center">
      <h2 className="text-xl font-semibold text-gray-900">
        We can’t show this page right now
      </h2>
      <p className="text-sm text-gray-700">
        Something went wrong while rendering this content. Try reloading to give
        it another shot.
      </p>
      <div>
        <button
          type="button"
          onClick={() => reset()}
          className="rounded bg-primary px-4 py-2 text-sm font-medium text-black shadow"
        >
          Reload content
        </button>
      </div>
    </div>
  );
}

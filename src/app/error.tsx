"use client";

import { Button } from "@/components/ui/button";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <div className="min-h-[70vh] w-full px-6 py-16 flex items-center justify-center">
      <div className="mx-auto flex items-center justify-center w-full max-w-xl flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <p className="text-4xl font-extrabold uppercase text-neutral-900">
          500
        </p>
        <h1 className="text-2xl font-semibold text-neutral-900 text-center">
          Something went wrong
        </h1>
        <p className="text-sm text-neutral-500 text-center">
          A server error prevented this page from loading. Please try again.
        </p>
        <div className="flex items-center gap-3">
          <Button onClick={reset}>Retry</Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Reload page
          </Button>
        </div>
      </div>
    </div>
  );
}

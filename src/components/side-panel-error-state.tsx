"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "./ui/button";

export default function SidePanelErrorState() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div
      className="w-full h-full flex items-center justify-center p-6"
      id="side_panel_error_state"
    >
      <div className="max-w-sm text-center space-y-3">
        <h2 className="text-lg font-semibold text-black">
          Unable to load locations
        </h2>
        <p className="text-sm text-grey-900">
          We couldn&apos;t load the locations right now. Please try again.
        </p>
        <Button
          className="rounded-full"
          onClick={() => startTransition(() => router.refresh())}
          type="button"
          disabled={isPending}
          aria-busy={isPending}
        >
          {isPending ? (
            <span className="inline-flex items-center gap-2">
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-90"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <span>Retrying...</span>
            </span>
          ) : (
            "Retry"
          )}
        </Button>
      </div>
    </div>
  );
}

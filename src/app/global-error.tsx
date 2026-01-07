"use client";
import ErrorComponent from "@/components/error";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    // global-error must include html and body tags
    <html>
      <body>
        <ErrorComponent onClick={() => reset()} />
      </body>
    </html>
  );
}

"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <main style={{ padding: 24 }}>
          <h1>Something went wrong</h1>
          <p>
            {process.env.NODE_ENV === "development"
              ? String(error)
              : "A temporary issue occurred."}
          </p>
          <button onClick={() => reset()}>Reload this section</button>
        </main>
      </body>
    </html>
  );
}

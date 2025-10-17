"use client";
import { Button } from "@/components/ui/button";

// Error boundaries must be Client Components

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
        <section className="bg-white flex-1 py-12 lg:py-20">
          <div className="px-5 max-w-lg mx-auto">
            <div className="flex flex-col items-center justify-center">
              <h1 className="text-black text-2xl md:text-4xl font-medium mb-6 text-center">
                Oops!
              </h1>
              <p className="text-dark text-center mb-6">
                Something went wrong. Please try again.
              </p>
              <div className="flex flex-col justify-center items-center space-y-2">
                <Button onClick={() => reset()}>Try again</Button>
              </div>
            </div>
          </div>
        </section>
      </body>
    </html>
  );
}

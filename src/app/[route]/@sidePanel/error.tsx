"use client"; // Error boundaries must be Client Components

import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
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
  );
}

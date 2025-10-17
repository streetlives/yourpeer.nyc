'use client';

export default function MapContainerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  if (process.env.NODE_ENV === 'development') {
    console.error('Map container segment failed', error);
  }
  return (
    <div className="flex h-full w-full items-center justify-center bg-gray-200 p-6 text-center">
      <div className="max-w-sm space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">
          We’re having trouble loading the map right now
        </h2>
        <p className="text-sm text-gray-700">
          The interactive map failed to render. You can try reloading this section or continue using the list view.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="rounded bg-primary px-4 py-2 text-sm font-medium text-black shadow"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

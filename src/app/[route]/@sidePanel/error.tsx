'use client';

export default function SidePanelError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  if (process.env.NODE_ENV === 'development') {
    console.error('Side panel segment failed', error);
  }
  return (
    <div className="flex h-full w-full items-center justify-center bg-white p-6 text-center">
      <div className="max-w-sm space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">
          We couldn’t load the results list
        </h2>
        <p className="text-sm text-gray-700">
          Refresh this panel to keep browsing, or use the map while we restore the list.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="rounded bg-primary px-4 py-2 text-sm font-medium text-black shadow"
        >
          Reload results
        </button>
      </div>
    </div>
  );
}

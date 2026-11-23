import { ReportIcon } from "yourpeer.nyc-nextjs";

export const WithLabel = () => (
  <span className="inline-flex items-center gap-2 text-sm text-danger">
    <ReportIcon className="w-5 h-5" /> Report an issue
  </span>
);

export const Sizes = () => (
  <div className="flex items-end gap-4 text-dark">
    <ReportIcon className="w-4 h-4" />
    <ReportIcon className="w-6 h-6" />
    <ReportIcon className="w-8 h-8 text-danger" />
  </div>
);

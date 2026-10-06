import { MailIcon } from "yourpeer.nyc-nextjs";

export const WithLabel = () => (
  <span className="inline-flex items-center gap-2 text-sm text-dark">
    <MailIcon className="w-5 h-5" /> Email us
  </span>
);

export const Sizes = () => (
  <div className="flex items-end gap-4 text-dark">
    <MailIcon className="w-4 h-4" />
    <MailIcon className="w-6 h-6" />
    <MailIcon className="w-8 h-8 text-blue" />
  </div>
);

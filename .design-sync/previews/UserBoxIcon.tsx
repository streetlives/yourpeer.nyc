import { UserBoxIcon } from "yourpeer.nyc-nextjs";

export const SignedInUser = () => (
  <span className="inline-flex items-center gap-2 text-sm text-neutral-800">
    <UserBoxIcon /> maria.r
  </span>
);

export const Sizes = () => (
  <div className="flex items-end gap-4 text-dark">
    <UserBoxIcon />
    <UserBoxIcon width={24} height={24} />
    <UserBoxIcon width={32} height={32} className="text-blue" />
  </div>
);

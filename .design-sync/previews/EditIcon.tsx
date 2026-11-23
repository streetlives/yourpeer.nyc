import { EditIcon } from "yourpeer.nyc-nextjs";

export const SuggestEdit = () => (
  <button className="inline-flex items-center gap-1 text-sm text-blue">
    <EditIcon className="w-5 h-5" /> Suggest an edit
  </button>
);

export const Sizes = () => (
  <div className="flex items-end gap-4">
    <EditIcon className="w-4 h-4" />
    <EditIcon />
    <EditIcon className="w-8 h-8" />
  </div>
);

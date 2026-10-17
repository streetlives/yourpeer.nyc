import { QuickExit } from "yourpeer.nyc-nextjs";

export const InHeader = () => (
  <header className="w-[420px] flex items-center justify-between h-16 px-5 bg-amber-300">
    <span className="text-[15px]">
      <span className="text-black font-extrabold">YourPeer</span>
      <span>NYC</span>
    </span>
    <QuickExit />
  </header>
);

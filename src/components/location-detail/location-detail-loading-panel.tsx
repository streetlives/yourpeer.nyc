export default function LocationDetailLoadingPanel() {
  return (
    <div className="details-screen details-screen-enter bg-white md:flex z-50 md:z-0 fixed md:absolute inset-0 w-full h-full overflow-y-auto flex flex-col">
      <div className="h-14 border-b border-neutral-200 px-4 flex items-center gap-4">
        <div className="shimmerBG h-6 w-6 rounded-full" />
        <div className="shimmerBG h-5 w-40 rounded-full" />
      </div>

      <div className="p-4 space-y-4">
        <div className="shimmerBG h-7 w-3/4 rounded-full" />
        <div className="shimmerBG h-4 w-1/2 rounded-full" />
        <div className="shimmerBG h-4 w-1/3 rounded-full" />
      </div>

      <div className="px-4 pb-6 space-y-3">
        <div className="shimmerBG h-44 w-full rounded-xl" />
        <div className="shimmerBG h-4 w-full rounded-full" />
        <div className="shimmerBG h-4 w-11/12 rounded-full" />
        <div className="shimmerBG h-4 w-10/12 rounded-full" />
        <div className="shimmerBG h-10 w-full rounded-full mt-4" />
      </div>
    </div>
  );
}

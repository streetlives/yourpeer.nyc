export default function LocationDetailNavigation({
  currentSection,
}: {
  currentSection: "info" | "reviews" | "services";
}) {
  return (
    <div className="flex bg-white shadow-lg sticky top-14 z-10">
      <a
        href="#info"
        className={`${currentSection === "info" ? "border-blue text-blue" : "text-black/60 "} text-sm uppercase py-3 px-5 flex-1 border-b-[3px]  block text-center font-medium`}
      >
        Info
      </a>
      <a
        href="#reviews"
        className={`${currentSection === "reviews" ? "border-blue text-blue" : "text-black/60 "} text-sm uppercase py-3 px-5 flex-1 border-b-[3px]  block text-center font-medium`}
      >
        Reviews
      </a>
      <a
        href="#services"
        className={`${currentSection === "services" ? "border-blue text-blue" : "text-black/60 "} text-sm uppercase py-3 px-5 flex-1 border-b-[3px]  block text-center font-medium`}
      >
        Services
      </a>
    </div>
  );
}

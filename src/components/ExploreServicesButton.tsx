import { TranslatableText } from "@/components/translatable-text";

type ExploreServicesButtonProps = {
  className?: string;
};

export default function ExploreServicesButton({
  className = "primary-button",
}: ExploreServicesButtonProps) {
  return (
    // Force a full page navigation to avoid intermittent client-side transition failures.
    <a className={className} href={"/locations"}>
      <TranslatableText text="Explore services" />
    </a>
  );
}

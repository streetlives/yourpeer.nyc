import { TranslatableText } from "@/components/translatable-text";

type ExploreServicesButtonProps = {
  className?: string;
};

export default function ExploreServicesButton({
  className = "primary-button",
}: ExploreServicesButtonProps) {
  return (
    <a className={className} href={"/locations"}>
      <TranslatableText text="Explore services" />
    </a>
  );
}

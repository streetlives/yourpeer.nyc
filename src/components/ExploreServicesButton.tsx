import { TranslatableText } from "@/components/translatable-text";
import Link from "next/link";

type ExploreServicesButtonProps = {
  className?: string;
};

export default function ExploreServicesButton({
  className = "primary-button",
}: ExploreServicesButtonProps) {
  return (
    <Link className={className} href={"/locations"}>
      <TranslatableText text="Explore services" />
    </Link>
  );
}

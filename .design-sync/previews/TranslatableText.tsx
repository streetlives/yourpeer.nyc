import { TranslatableText } from "yourpeer.nyc-nextjs";

export const Heading = () => (
  <h2 className="text-xl font-medium text-dark">
    <TranslatableText text="Find free services near you" />
  </h2>
);

export const BodyText = () => (
  <p className="w-80 text-sm text-dark">
    <TranslatableText text="People rely on social services for many reasons. Our information specialists have lived experience navigating the support system." />
  </p>
);

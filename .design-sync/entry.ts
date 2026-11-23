// Curated design-system entry for /design-sync. yourpeer.nyc is a Next.js app,
// not a published package, so this barrel re-exports the app's own reusable
// components (no reimplementations). Data-bound pieces (map, filters, reviews,
// search) are deliberately left out.

import "./shims/process-env";

export * from "../src/components/ui/button";
export * from "../src/components/ui/badge";
export * from "../src/components/ui/dialog";
export * from "../src/components/ui/alert-dialog";
export * from "../src/components/ui/dropdown-menu";
export * from "../src/components/ui/popover";
export * from "../src/components/ui/command";
export * from "../src/components/ui/multi-select";
export * from "../src/components/ui/separator";
export * from "../src/components/ui/skeleton";

export { default as Spinner } from "../src/components/spinner";
export { TranslatableText } from "../src/components/translatable-text";
export { default as QuickExit } from "../src/components/quick-exit";
export { EditIcon } from "../src/components/icons/edit-icon";
export { MailIcon } from "../src/components/icons/mail-icon";
export { ReportIcon } from "../src/components/icons/report-icon";
export { UserBoxIcon } from "../src/components/icons/user-box-icon";
export { MapLoadingAnimation } from "../src/components/map-loading-animation";
export { SidebarLoadingAnimation } from "../src/components/sidebar-loading-animation";
export { default as LocationDetailLoadingSkeleton } from "../src/components/location-detail/location-detail-loading-skeleton";
export { default as ExploreServicesButton } from "../src/components/ExploreServicesButton";
export { Footer } from "../src/components/footer";

export { YourPeerProvider } from "./YourPeerProvider";

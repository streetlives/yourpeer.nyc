/* eslint-disable @next/next/no-before-interactive-script-outside-document */
import Script from "next/script";

const GT_PROD_GUARD_ENABLED = process.env.NEXT_PUBLIC_GT_PROD_GUARD === "true";

const GT_PROD_GUARD_SCRIPT = `(() => {
  if (typeof window === "undefined" || typeof Node === "undefined") {
    return;
  }

  const globalScope = window;

  if (globalScope.__gtProdGuardInstalled__) {
    return;
  }

  globalScope.__gtProdGuardInstalled__ = true;

  const warnOnce = () => {
    if (globalScope.__gtProdGuardWarned__) {
      return;
    }

    globalScope.__gtProdGuardWarned__ = true;
    console.warn(
      "[YourPeer] Guarded DOM operations: prevented removeChild/insertBefore on nodes that are not children of the target parent.",
    );
  };

  const originalRemoveChild = Node.prototype.removeChild;
  const originalInsertBefore = Node.prototype.insertBefore;

  Node.prototype.removeChild = function removeChildGuard(child) {
    if (!child || child.parentNode !== this) {
      warnOnce();
      return child ?? null;
    }

    return originalRemoveChild.call(this, child);
  };

  Node.prototype.insertBefore = function insertBeforeGuard(newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode !== this) {
      warnOnce();
      return newNode;
    }

    return originalInsertBefore.call(this, newNode, referenceNode);
  };
})();`;

declare global {
  interface Window {
    __gtProdGuardInstalled__?: boolean;
    __gtProdGuardWarned__?: boolean;
  }
}

export default function GTProdGuardScript() {
  if (!GT_PROD_GUARD_ENABLED) {
    return null;
  }

  return (
    <Script id="gt-prod-guard" strategy="beforeInteractive">
      {GT_PROD_GUARD_SCRIPT}
    </Script>
  );
}

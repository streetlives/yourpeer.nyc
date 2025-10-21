import { describe, expect, it, vi } from "vitest";
vi.mock("next-client-cookies", () => ({
  useCookies: () => ({
    get: () => undefined,
    set: () => undefined,
    remove: () => undefined,
  }),
}));
import { render, fireEvent, screen } from "@testing-library/react";
import { simulateTranslateInJSDOM } from "../test-utils/gtSim";
import { TranslatableText } from "@/components/translatable-text";
import { LanguageTranslationContext } from "@/components/language-translation-context";
import React, { useState } from "react";

function MockTranslationProvider({ children }: { children: React.ReactNode }) {
  const value = {
    gTranslateCookie: "en|ru",
    setGTranslateCookie: () => undefined,
  } satisfies {
    gTranslateCookie: string | null;
    setGTranslateCookie: (value: string | null) => void;
  };
  return (
    <LanguageTranslationContext.Provider value={value}>
      {children}
    </LanguageTranslationContext.Provider>
  );
}

function ToggleButton() {
  const [showMap, setShowMap] = useState(true);
  return (
    <MockTranslationProvider>
      <button type="button" onClick={() => setShowMap((prev) => !prev)}>
        <TranslatableText text={showMap ? "View map" : "View list"} />
      </button>
    </MockTranslationProvider>
  );
}

describe("simulateTranslateInJSDOM", () => {
  it("keeps translated text stable across updates when DOM text nodes are wrapped", () => {
    const { container } = render(<ToggleButton />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toBeTruthy();

    simulateTranslateInJSDOM(root);

    expect(root.querySelectorAll("font.gt-sim").length).toBeGreaterThan(0);
    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("Открыть карту");

    fireEvent.click(button);

    expect(button).toHaveTextContent("Открыть лист");
  });
});

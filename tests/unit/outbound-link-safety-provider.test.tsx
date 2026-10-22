/* eslint-disable @next/next/no-html-link-for-pages -- Fixtures exercise raw anchors from provider content. */
import {
  act,
  cleanup,
  createEvent,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import OutboundLinkSafetyProvider from "@/components/outbound-link-safety-provider";
import type { WebsiteSafetyAssessment } from "@/lib/website-safety";

vi.mock("@/components/translatable-text", () => ({
  TranslatableText: ({ text }: { text: string }) => <span>{text}</span>,
}));

const fetcher = vi.fn<typeof fetch>();

function result(
  url: string,
  overrides: Partial<WebsiteSafetyAssessment> = {},
): WebsiteSafetyAssessment {
  return {
    url,
    status: "no_known_warning",
    reasons: [],
    checkedAt: Date.now() - 1_000,
    expiresAt: Date.now() + 60_000,
    stale: false,
    ...overrides,
  };
}

function installResponse(overrides: Partial<WebsiteSafetyAssessment> = {}) {
  fetcher.mockImplementation(async (_url, init) => {
    const { urls } = JSON.parse(init?.body as string) as { urls: string[] };
    return {
      ok: true,
      json: async () => ({
        results: urls.map((url) => result(url, overrides)),
      }),
    } as Response;
  });
}

function mount(children: ReactNode) {
  return render(
    <OutboundLinkSafetyProvider>{children}</OutboundLinkSafetyProvider>,
  );
}

beforeEach(() => {
  fetcher.mockReset();
  installResponse();
  vi.stubGlobal("fetch", fetcher);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("OutboundLinkSafetyProvider", () => {
  it("shows an immediate HTTP warning, defaults to cancel, and returns focus without navigating", async () => {
    mount(<a href="http://example.org/apply">Apply here</a>);
    const link = screen.getByRole("link", { name: "Apply here" });
    link.focus();
    const event = createEvent.click(link, {
      button: 0,
      bubbles: true,
      cancelable: true,
    });
    fireEvent(link, event);
    expect(event.defaultPrevented).toBe(true);
    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      "unencrypted HTTP",
    );
    expect(screen.getByRole("button", { name: "Go back" })).toHaveFocus();
    fireEvent.click(screen.getByRole("button", { name: "Go back" }));
    await waitFor(() =>
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(link).toHaveFocus());
  });

  it("exempts Quick Exit, internal navigation, telephone and email links from lookups and warnings", async () => {
    mount(
      <>
        <a href="https://www.google.com" id="quickExitLink">
          Quick Exit
        </a>
        <a href="/food">Internal</a>
        <a href="https://yourpeer.nyc/food">YourPeer</a>
        <a href="tel:2125550100">Call</a>
        <a href="mailto:provider@example.org">Email</a>
      </>,
    );
    for (const name of [
      "Quick Exit",
      "Internal",
      "YourPeer",
      "Call",
      "Email",
    ]) {
      const link = screen.getByRole("link", { name });
      // Observe the guard before preventing jsdom's unsupported navigation.
      let guardPrevented = true;
      link.addEventListener(
        "click",
        (event) => {
          guardPrevented = event.defaultPrevented;
          event.preventDefault();
        },
        { once: true },
      );
      fireEvent.click(link);
      expect(guardPrevented).toBe(false);
    }
    await act(async () => {});
    expect(fetcher).not.toHaveBeenCalled();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("blocks executable links rather than offering a continue bypass", () => {
    mount(<a href="data:text/html,unsafe">Unsafe scheme</a>);
    const link = screen.getByRole("link", { name: "Unsafe scheme" });
    const event = createEvent.click(link, {
      button: 0,
      bubbles: true,
      cancelable: true,
    });
    fireEvent(link, event);
    expect(event.defaultPrevented).toBe(true);
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("keeps immediate Quick Exit available inside an open warning", () => {
    mount(<a href="http://example.org/apply">Website</a>);
    fireEvent.click(screen.getByRole("link", { name: "Website" }));
    const exit = screen.getByRole("link", { name: "Quick Exit" });
    let guardPrevented = true;
    exit.addEventListener(
      "click",
      (event) => {
        guardPrevented = event.defaultPrevented;
        event.preventDefault();
      },
      { once: true },
    );
    const requestsBeforeExit = fetcher.mock.calls.length;
    fireEvent.click(exit);
    expect(guardPrevented).toBe(false);
    expect(fetcher).toHaveBeenCalledTimes(requestsBeforeExit);
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("lets the explicit confirmation activate once without reopening the warning", () => {
    mount(<a href="http://example.org/apply">Website</a>);
    fireEvent.click(screen.getByRole("link", { name: "Website" }));
    const confirmation = screen.getByRole("link", { name: "Continue anyway" });
    let guardPrevented = true;
    confirmation.addEventListener(
      "click",
      (event) => {
        guardPrevented = event.defaultPrevented;
        event.preventDefault();
      },
      { once: true },
    );
    fireEvent.click(confirmation);
    expect(guardPrevented).toBe(false);
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("allows a prefetched fresh no-warning link through without showing a safe badge", async () => {
    mount(
      <a
        href="https://example.org/apply"
        onClick={(event) => event.preventDefault()}
      >
        Website
      </a>,
    );
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));
    await act(async () => {});
    fireEvent.click(screen.getByRole("link", { name: "Website" }));
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("covers anchors inserted as HTML after mount and preserves the original new-tab URL", async () => {
    const view = mount(<div />);
    view.rerender(
      <OutboundLinkSafetyProvider>
        <div
          dangerouslySetInnerHTML={{
            __html:
              '<a href="http://example.org/apply?utm_source=yourpeer.nyc#hours" target="_blank"><strong>Embedded application</strong></a>',
          }}
        />
      </OutboundLinkSafetyProvider>,
    );
    fireEvent.click(screen.getByText("Embedded application"));
    const confirmation = screen.getByRole("link", { name: "Continue anyway" });
    expect(confirmation).toHaveAttribute(
      "href",
      "http://example.org/apply?utm_source=yourpeer.nyc#hours",
    );
    expect(confirmation).toHaveAttribute("target", "_blank");
    expect(confirmation).toHaveAttribute("rel", "noopener noreferrer");
    await waitFor(() => expect(fetcher).toHaveBeenCalled());
    const sent = JSON.parse(fetcher.mock.calls[0][1]?.body as string);
    expect(sent.urls).toEqual(["http://example.org/apply"]);
  });

  it.each(["modifier", "middle"])(
    "preserves %s-click intent when confirmation is needed",
    (mode) => {
      mount(<a href="http://example.org/apply">Website</a>);
      const link = screen.getByRole("link", { name: "Website" });
      if (mode === "modifier") fireEvent.click(link, { ctrlKey: true });
      else
        fireEvent(
          link,
          new MouseEvent("auxclick", {
            bubbles: true,
            cancelable: true,
            button: 1,
          }),
        );
      expect(
        screen.getByRole("link", { name: "Continue anyway" }),
      ).toHaveAttribute("target", "_blank");
    },
  );

  it("updates a cached warning after successful remediation without navigating automatically", async () => {
    installResponse({
      status: "warning",
      reasons: ["php_advisory_possible"],
      stale: true,
    });
    mount(<a href="https://example.org/apply">Website</a>);
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));
    await act(async () => {});
    installResponse();
    fireEvent.click(screen.getByRole("link", { name: "Website" }));
    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      "patch status has not been verified",
    );
    await waitFor(() =>
      expect(screen.getByRole("alertdialog")).not.toHaveTextContent(
        "patch status has not been verified",
      ),
    );
    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      "no longer reports this warning",
    );
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("keeps a cached warning after a refresh failure", async () => {
    installResponse({
      status: "warning",
      reasons: ["possible_compromise"],
      stale: true,
    });
    mount(<a href="https://example.org/apply">Website</a>);
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));
    await act(async () => {});
    fetcher.mockRejectedValue(new Error("unavailable"));
    fireEvent.click(screen.getByRole("link", { name: "Website" }));
    await waitFor(() =>
      expect(screen.getByRole("alertdialog")).toHaveTextContent(
        "may have been compromised",
      ),
    );
    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      "may be out of date",
    );
  });

  it("leaves unknown HTTPS links usable and refreshes without showing a misleading safety prompt", async () => {
    installResponse({
      status: "unknown",
      checkedAt: null,
      expiresAt: null,
      stale: true,
    });
    mount(
      <a
        href="https://example.org/apply"
        onClick={(event) => event.preventDefault()}
      >
        Website
      </a>,
    );
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));
    await act(async () => {});
    fireEvent.click(screen.getByRole("link", { name: "Website" }));
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2));
    expect(JSON.parse(fetcher.mock.calls[1][1]?.body as string).refresh).toBe(
      true,
    );
  });

  it("ignores a response after the user cancels a warning", async () => {
    installResponse({
      status: "warning",
      reasons: ["possible_compromise"],
      stale: true,
    });
    mount(<a href="https://example.org/apply">Website</a>);
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));
    await act(async () => {});
    let finish!: (value: Response) => void;
    fetcher.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    fireEvent.click(screen.getByRole("link", { name: "Website" }));
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2));
    fireEvent.click(screen.getByRole("button", { name: "Go back" }));
    await act(async () => {
      finish({
        ok: true,
        json: async () => ({ results: [result("https://example.org/apply")] }),
      } as Response);
    });
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });
});

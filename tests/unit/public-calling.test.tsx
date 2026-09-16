// Copyright (c) 2026 Streetlives, Inc. MIT license; see LICENSE.
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PublicCallingProvider, {
  CallingScope,
} from "@/components/calling/public-calling-provider";
import {
  callingApi,
  callingChallenge,
  phoneLink,
} from "@/components/calling/calling-client";

const mocks = vi.hoisted(() => ({
  connect: vi.fn(),
  disconnect: vi.fn(),
  toast: vi.fn(),
}));
vi.mock("@/components/translatable-text", () => ({
  TranslatableText: ({ text }: { text: string }) => text,
}));
vi.mock("sonner", () => ({ toast: mocks.toast }));
vi.mock("@/components/calling/calling-client", async (original) => ({
  ...(await original<object>()),
  callingApi: vi.fn(),
  callingChallenge: vi.fn(),
  loadCallingChallenge: vi.fn(async () => {}),
}));
vi.mock("@/components/calling/calling-audio", () => ({
  CallingAudio: class {
    connect = mocks.connect;
    disconnect = mocks.disconnect;
    mute = vi.fn();
    dtmf = vi.fn();
  },
}));
const id = "a".repeat(32);
const reserved = {
  id,
  status: "reserved",
  number: "+12125550123",
  callerNumber: "+12125550999",
  room: { url: "wss://calls.example.org", token: "room-token" },
};
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (value: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
let mic: ReturnType<typeof deferred<MediaStream>>;
let stop: ReturnType<typeof vi.fn>;
const stream = () =>
  ({
    getTracks: () => [{ stop }],
    getAudioTracks: () => [{ stop }],
  }) as unknown as MediaStream;
const calls = () =>
  vi.mocked(callingApi).mock.calls.filter(([path]) => path === "calls");
function mount(enabled = true) {
  render(
    <PublicCallingProvider enabled={enabled} sitekey="test">
      <CallingScope locationId="location" label="Community support">
        <a href="tel:2125550123;ext=007">Call service</a>
      </CallingScope>
      <a href="tel:2125550999">Unrelated link</a>
    </PublicCallingProvider>,
  );
}
beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  stop = vi.fn();
  mic = deferred<MediaStream>();
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: { getUserMedia: vi.fn(() => mic.promise) },
  });
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn(() => ({ matches: true })),
  });
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response("{}")),
  );
  vi.mocked(callingChallenge).mockResolvedValue("challenge");
  vi.mocked(callingApi).mockImplementation(async (path) => {
    if (path === "config") return { enabled: true, verifiedNumber: null };
    if (path === "calls") return reserved;
    if (path.endsWith("/start")) return { ...reserved, status: "active" };
    if (path.endsWith("/hangup")) return { ...reserved, status: "ended" };
    if (path === `calls/${id}`) return { ...reserved, status: "active" };
    if (path === "verification/confirm") return { verified: false };
    return {};
  });
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("directory browser calling", () => {
  it("requests mic immediately and dials exactly once only after permission and challenge", async () => {
    mount();
    fireEvent.click(screen.getByText("Call service"));
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(1);
    expect(calls()).toHaveLength(0);
    await act(async () => mic.resolve(stream()));
    await waitFor(() => expect(screen.getByText("On the call")).toBeVisible());
    expect(calls()).toHaveLength(1);
    expect(calls()[0][2]).toMatchObject({
      locationId: "location",
      href: "tel:2125550123;ext=007",
      useOwnNumber: false,
    });
    expect(mocks.connect).toHaveBeenCalledTimes(1);
  });
  it("never dials when microphone permission is denied", async () => {
    mount();
    fireEvent.click(screen.getByText("Call service"));
    await act(async () => mic.reject(new Error("denied")));
    await screen.findByText(/Microphone access is needed/);
    expect(calls()).toHaveLength(0);
  });
  it("late permission after closing releases mic and cannot start a call", async () => {
    mount();
    fireEvent.click(screen.getByText("Call service"));
    fireEvent.click(screen.getByLabelText("Close and end call"));
    await act(async () => mic.resolve(stream()));
    expect(stop).toHaveBeenCalled();
    expect(calls()).toHaveLength(0);
  });
  it("choosing own number pauses dialing until skipped or verified", async () => {
    mount();
    fireEvent.click(screen.getByText("Call service"));
    fireEvent.click(screen.getByText("Use my number"));
    await act(async () => mic.resolve(stream()));
    await waitFor(() => expect(callingChallenge).toHaveBeenCalled());
    expect(calls()).toHaveLength(0);
    fireEvent.click(screen.getByText("Skip and call through YourPeer"));
    await waitFor(() => expect(calls()).toHaveLength(1));
  });
  it("does not treat a rejected verification code as ownership", async () => {
    mount();
    fireEvent.click(screen.getByText("Call service"));
    fireEvent.click(screen.getByText("Use my number"));
    fireEvent.change(screen.getByLabelText("Your US phone number"), {
      target: { value: "(917) 555-0123" },
    });
    fireEvent.click(screen.getByText("Text me a code"));
    await screen.findByLabelText("Verification code");
    fireEvent.change(screen.getByLabelText("Verification code"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByText("Verify number"));
    await screen.findByText(/That code was not accepted/);
    expect(calls()).toHaveLength(0);
  });
  it("releases microphone while queued and does not start the telephone leg", async () => {
    vi.mocked(callingApi).mockImplementation(async (path) =>
      path === "config"
        ? { enabled: true, verifiedNumber: null }
        : { ...reserved, status: "queued", position: 2 },
    );
    mount();
    fireEvent.click(screen.getByText("Call service"));
    await act(async () => mic.resolve(stream()));
    await screen.findByText(/queue position: 2/);
    expect(stop).toHaveBeenCalled();
    expect(mocks.connect).not.toHaveBeenCalled();
  });
  it("remembers dismissal of the after-call callback prompt", async () => {
    mount();
    fireEvent.click(screen.getByText("Call service"));
    await act(async () => mic.resolve(stream()));
    await screen.findByText("On the call");
    fireEvent.click(screen.getByText("Hang up"));
    await waitFor(() =>
      expect(mocks.toast).toHaveBeenCalledWith(
        "Want callbacks on future calls?",
        expect.any(Object),
      ),
    );
    const options = mocks.toast.mock.calls[0][1];
    options.cancel.onClick();
    expect(localStorage.getItem("yp-callback-prompt-dismissed")).toBe("1");
    mocks.toast.mockClear();
    fireEvent.click(screen.getByText("Call service"));
    await screen.findByText("On the call");
    fireEvent.click(screen.getByText("Hang up"));
    await screen.findByText("Call ended");
    expect(mocks.toast).not.toHaveBeenCalled();
  });
  it("leaves mobile and disabled links to the device dialer", () => {
    mount(false);
    fireEvent.click(screen.getByText("Call service"));
    expect(navigator.mediaDevices.getUserMedia).not.toHaveBeenCalled();
  });
  it("only accepts supported full phone links and preserves extensions", () => {
    expect(phoneLink("tel:(917) 555-0123;ext=007")).toEqual({
      number: "+19175550123",
      extension: "007",
    });
    [
      "tel:911",
      "tel:112",
      "tel:+442079460123",
      "https://evil.example/?n=9175550123",
      "sip:911@telnyx.com",
    ].forEach((value) => expect(phoneLink(value)).toBeNull());
  });
});

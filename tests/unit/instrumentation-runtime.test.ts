import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { ProxyAgent, setGlobalDispatcher } = vi.hoisted(() => ({
  ProxyAgent: vi.fn(function (this: { proxy: string }, proxy: string) {
    this.proxy = proxy;
  }),
  setGlobalDispatcher: vi.fn(),
}));
vi.mock("undici", () => ({ ProxyAgent, setGlobalDispatcher }));

import { register } from "@/instrumentation";

describe("instrumentation runtime", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    for (const name of ["PROXIMO_URL", "HTTPS_PROXY", "HTTP_PROXY"]) {
      vi.stubEnv(name, "");
    }
  });
  afterEach(() => vi.unstubAllEnvs());

  it("does not configure Node networking in the Edge runtime", async () => {
    vi.stubEnv("NEXT_RUNTIME", "edge");
    vi.stubEnv("PROXIMO_URL", "http://proxy.test:8080");
    await register();
    expect(ProxyAgent).not.toHaveBeenCalled();
    expect(setGlobalDispatcher).not.toHaveBeenCalled();
  });

  it("does not install a dispatcher when no proxy is configured", async () => {
    vi.stubEnv("NEXT_RUNTIME", "nodejs");
    await register();
    expect(ProxyAgent).not.toHaveBeenCalled();
    expect(setGlobalDispatcher).not.toHaveBeenCalled();
  });

  it("still configures the proxy in the Node runtime", async () => {
    vi.stubEnv("NEXT_RUNTIME", "nodejs");
    vi.stubEnv("PROXIMO_URL", "http://proxy.test:8080");
    await register();
    expect(ProxyAgent).toHaveBeenCalledWith("http://proxy.test:8080");
    expect(setGlobalDispatcher).toHaveBeenCalledWith(
      expect.objectContaining({ proxy: "http://proxy.test:8080" }),
    );
  });
});

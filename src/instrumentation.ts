function getProxyUrl(): string | undefined {
  return (
    process.env.PROXIMO_URL || process.env.HTTPS_PROXY || process.env.HTTP_PROXY
  );
}

export async function register() {
  // Middleware also loads instrumentation in the Edge runtime. Keep undici's
  // Node networking dependencies out of that bundle.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const proxyUrl = getProxyUrl();
    if (!proxyUrl) return;

    const { ProxyAgent, setGlobalDispatcher } = await import("undici");
    setGlobalDispatcher(new ProxyAgent(proxyUrl));
    console.log("Configured global fetch proxy via environment variable.");
  }
}

import { ProxyAgent, setGlobalDispatcher } from "undici";

function getProxyUrl(): string | undefined {
  return (
    process.env.PROXIMO_URL || process.env.HTTPS_PROXY || process.env.HTTP_PROXY
  );
}

export async function register() {
  console.log("register");
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }
  console.log("register2");

  const proxyUrl = getProxyUrl();
  if (!proxyUrl) {
    return;
  }
  console.log("register3");

  setGlobalDispatcher(new ProxyAgent(proxyUrl));
  console.log("Configured global fetch proxy via environment variable.");
}

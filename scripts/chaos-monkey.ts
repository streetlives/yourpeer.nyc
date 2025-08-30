// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

import http from "http";
import { spawn } from "child_process";
import puppeteer from "puppeteer";
import axios from "axios";
import delay from "delay";

async function run(
  cmd: string,
  args: string[],
  options: any = {},
): Promise<void> {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: "inherit", ...options });
    p.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${cmd} exited with code ${code}`));
      }
    });
  });
}

async function waitForServer(url: string, timeout = 30000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      await axios.get(url);
      return;
    } catch {
      await delay(500);
    }
  }
  throw new Error(`Server at ${url} did not respond within ${timeout}ms`);
}

async function loadHomePage(baseUrl: string): Promise<boolean> {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  let crashed = false;

  page.on("error", () => {
    crashed = true;
  });
  page.on("pageerror", () => {
    crashed = true;
  });

  try {
    await page.goto(baseUrl, { waitUntil: "networkidle2" });
  } catch {
    crashed = true;
  }

  await browser.close();
  return crashed;
}

async function main() {
  const mockApi = http.createServer((_, res) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Pagination-Count", "0");
    res.setHeader("Total-Count", "0");
    res.end(JSON.stringify([]));
  });
  await new Promise<void>((resolve) => mockApi.listen(3999, resolve));

  const port = 4000;
  const env = {
    ...process.env,
    PORT: String(port),
    NEXT_PUBLIC_GO_GETTA_PROD_URL: "http://localhost:3999",
  };

  try {
    await run("npm", ["run", "build"], { env });
    const server = spawn("npm", ["run", "start"], { env, stdio: "inherit" });
    try {
      const baseUrl = `http://localhost:${port}`;
      await waitForServer(baseUrl);
      const crashed = await loadHomePage(baseUrl);
      if (crashed) {
        console.error("Smoke test detected a crash on the home page");
        process.exitCode = 1;
      } else {
        console.log("Smoke test finished without detecting crashes");
      }
    } finally {
      server.kill();
    }
  } finally {
    mockApi.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

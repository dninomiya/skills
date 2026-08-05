#!/usr/bin/env node
const path = require("node:path");
const fs = require("node:fs");
const http = require("node:http");
const { pathToFileURL } = require("node:url");

function usage() {
  console.log("Usage: render-pdf.js <html-file-or-url> <output.pdf>");
}

async function main() {
  const [, , input, output] = process.argv;
  if (!input || !output || input === "--help" || input === "-h") {
    usage();
    process.exit(input ? 0 : 1);
  }

  let chromium;
  try {
    ({ chromium } = require("playwright"));
  } catch (error) {
    console.error("Playwright is required. Install it in the working project or use an environment that provides it.");
    process.exit(2);
  }

  const served = await resolveTarget(input);
  const target = served.url;

  const browser = await chromium.launch(chromiumLaunchOptions());
  const page = await browser.newPage({ viewport: { width: 1684, height: 1191 }, deviceScaleFactor: 1 });
  await page.goto(target, { waitUntil: "networkidle" });
  await page.emulateMedia({ media: "print" });
  await page.pdf({
    path: output,
    format: "A4",
    landscape: true,
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: "0", right: "0", bottom: "0", left: "0" }
  });
  await browser.close();
  if (served.close) await served.close();
  console.log(`Wrote ${output}`);
}

async function resolveTarget(input) {
  if (/^https?:\/\//.test(input)) return { url: input };

  const absolute = path.resolve(input);
  const root = path.dirname(absolute);
  const fileName = path.basename(absolute);
  if (!fs.existsSync(absolute)) return { url: pathToFileURL(absolute).href };

  const server = http.createServer((request, response) => {
    const requestUrl = new URL(request.url, "http://127.0.0.1");
    const filePath = path.resolve(root, `.${decodeURIComponent(requestUrl.pathname)}`);
    if (!filePath.startsWith(root)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }
    fs.readFile(filePath, (error, data) => {
      if (error) {
        response.writeHead(404);
        response.end("Not found");
        return;
      }
      response.writeHead(200, { "Content-Type": contentType(filePath) });
      response.end(data);
    });
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  return {
    url: `http://127.0.0.1:${port}/${encodeURIComponent(fileName)}`,
    close: () => new Promise((resolve) => server.close(resolve))
  };
}

function contentType(filePath) {
  if (filePath.endsWith(".html")) return "text/html; charset=utf-8";
  if (filePath.endsWith(".css")) return "text/css; charset=utf-8";
  if (filePath.endsWith(".js")) return "text/javascript; charset=utf-8";
  if (filePath.endsWith(".json")) return "application/json; charset=utf-8";
  return "application/octet-stream";
}

function chromiumLaunchOptions() {
  const candidates = [
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"
  ].filter(Boolean);

  for (const executablePath of candidates) {
    if (fs.existsSync(executablePath)) return { executablePath };
  }

  return {};
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

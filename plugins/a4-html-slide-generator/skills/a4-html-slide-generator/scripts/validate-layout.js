#!/usr/bin/env node
const path = require("node:path");
const fs = require("node:fs");
const http = require("node:http");
const { pathToFileURL } = require("node:url");

function usage() {
  console.log("Usage: validate-layout.js <html-file-or-url>");
}

async function main() {
  const [, , input] = process.argv;
  if (!input || input === "--help" || input === "-h") {
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

  const report = await page.evaluate(() => {
    const tolerance = 1;
    const pages = Array.from(document.querySelectorAll(".page"));
    const failures = [];

    pages.forEach((page, index) => {
      const pageNo = index + 1;
      const rect = page.getBoundingClientRect();
      const expectedRatio = 297 / 210;
      const ratio = rect.width / rect.height;

      if (Math.abs(ratio - expectedRatio) > 0.01) {
        failures.push(`Page ${pageNo}: aspect ratio ${ratio.toFixed(3)} is not A4 landscape.`);
      }

      if (page.scrollWidth > page.clientWidth + tolerance || page.scrollHeight > page.clientHeight + tolerance) {
        failures.push(`Page ${pageNo}: page scroll overflow detected.`);
      }

      const content = page.querySelector(".page-content");
      if (content) {
        const c = content.getBoundingClientRect();
        if (c.left < rect.left - tolerance || c.right > rect.right + tolerance || c.top < rect.top - tolerance || c.bottom > rect.bottom + tolerance) {
          failures.push(`Page ${pageNo}: content region exceeds page bounds.`);
        }
      }

      const elements = Array.from(page.querySelectorAll("h1,h2,p,li,td,th,.metric,.panel,.timeline-item"));
      elements.forEach((element) => {
        const style = window.getComputedStyle(element);
        const clipsOverflow = style.overflowX !== "visible" || style.overflowY !== "visible";
        if (clipsOverflow && (element.scrollWidth > element.clientWidth + tolerance || element.scrollHeight > element.clientHeight + tolerance)) {
          const label = element.textContent.trim().replace(/\s+/g, " ").slice(0, 50);
          failures.push(`Page ${pageNo}: element overflow in ${element.tagName.toLowerCase()} "${label}".`);
        }
      });

      const pageBounds = page.getBoundingClientRect();
      elements.forEach((element) => {
        const r = element.getBoundingClientRect();
        if (r.left < pageBounds.left - tolerance || r.right > pageBounds.right + tolerance || r.top < pageBounds.top - tolerance || r.bottom > pageBounds.bottom + tolerance) {
          const label = element.textContent.trim().replace(/\s+/g, " ").slice(0, 50);
          failures.push(`Page ${pageNo}: element exceeds page bounds "${label}".`);
        }
      });
    });

    if (pages.length === 0) {
      failures.push("No .page elements found.");
    }

    return { pageCount: pages.length, failures };
  });

  await browser.close();
  if (served.close) await served.close();

  if (report.failures.length > 0) {
    console.error(`Layout validation failed for ${report.pageCount} page(s):`);
    report.failures.forEach((failure) => console.error(`- ${failure}`));
    process.exit(1);
  }

  console.log(`Layout validation passed for ${report.pageCount} page(s).`);
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

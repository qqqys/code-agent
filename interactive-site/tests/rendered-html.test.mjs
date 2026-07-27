import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);
const previewRoot = new URL("../app/_sites-preview/", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the interactive comparison report", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(
    html,
    /<title>Codex × Claude Code × Qwen Code｜功能对比<\/title>/i,
  );
  assert.match(html, /对比不是计数/);
  assert.match(html, /53 次本地观察执行/);
  assert.match(html, /S4-01/);
  assert.match(html, /BL-01/);
  assert.match(html, /R2-4/);
  assert.match(html, /og\.png/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|Building your site/);
});

test("removes starter-only assets and metadata", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  await assert.rejects(access(previewRoot));
  await access(new URL("../public/og.png", import.meta.url));
  assert.match(page, /^"use client";/);
  assert.match(page, /RelationKey/);
  assert.match(page, /DecisionFilter/);
  assert.match(layout, /generateMetadata/);
  assert.match(layout, /lang="zh-CN"/);
  assert.doesNotMatch(layout, /Starter Project|codex-preview|next\/font/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await assert.rejects(
    access(new URL("public/_sites-preview", templateRoot)),
  );
});

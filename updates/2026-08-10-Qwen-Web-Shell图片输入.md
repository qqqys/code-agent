# Qwen Code Web Shell 图片拖拽/粘贴输入

Qwen Code 官方仓库在 2026-08-10 合入提交 `e46586782cf8`（PR #8696，`feat: support drag and drop img in web-shell`），为 `qwen serve` 自带 Web Shell 的输入区增加图片拖拽与粘贴输入：支持 PNG、JPEG、GIF、WebP、BMP 五类图片（`image/x-bmp`/`image/x-ms-bmp` 归一为 BMP），允许只含图片、不带文字的 prompt，并带有限额、排队恢复与失败锁定逻辑。该提交晚于 v0.21.8（2026-08-08T17:07:22Z）与当日 nightly `v0.21.8-nightly.20260810.55e20db328`（2026-08-10T00:50:10Z），核对时点没有包含该提交的 Release；官方用户文档 `docs/users/qwen-serve.md` 也未描述该输入方式。矩阵的“Web 界面”字段此前只记录 `qwen serve` 内置 Web Shell，本次更新该字段的 Qwen Code 矩阵结论与详情记录，并核对其他四家 Web Surface 的图片输入文档。

## 修正

- `surface-web`（Web 界面）矩阵 Qwen Code 列由 “`qwen serve` 内置 Web Shell” 更新为 “`qwen serve` 内置 Web Shell；条件：图片拖拽/粘贴输入（main 分支，尚未发布）”。
- `surface-web` 详情 Qwen Code 记录：入口补充图片输入经输入区拖拽或粘贴进入；协议补充图片以 base64 附件随 prompt 载荷提交、daemon/ACP/公开 Web Shell API 协议不变；行为补充支持的五类 MIME、SVG/TIFF/HEIC/PDF/目录/远程 URL 拒绝、BMP 变体归一、图片-only prompt、BMP 在 Anthropic Provider 路径降级为文本说明；状态补充排队 prompt 图片附件在重试/编辑流程恢复、admission 结果未知时输入区只读锁定需手动丢弃或恢复（恢复不自动发送）、页面重载后恢复的排队项仅含摘要且不含图片数据；条件补充合入时间与发布状态、官方用户文档仍把 prompt 路径图片附件列为已知缺口（`MessageEmitter` 只渲染文本）、客户端单批 base64 预算 8 MiB 与并发读取上限 4（超预算按 `too-large` 拒绝）、daemon 请求体上限 10 MB（超出返回 413）、Core 内联媒体默认上限 10 MiB（解码后字节，可经 daemon 环境变量配置）；来源新增固定到提交 SHA 的图片输入提交、设计文档与 `imageIngestion.ts` 源码。
- `surface-web` 跨产品事实新增一条：Qwen Web Shell main 分支源码支持图片拖拽/粘贴与图片-only prompt；Claude、Codex、Kimi、Qoder 的官方 Web 文档未列图片拖拽、粘贴或附件上传。
- `site/data.js` 新增三个固定到提交 `e46586782cf8fc85d535051830bcc743bcd6b47a` 的来源条目。
- `docs/09-版本与证据.md`：Qwen Code 主要材料补充 Web Shell 图片拖拽/粘贴输入；Headless、SDK 与多端来源表 Qwen Code 服务列新增图片输入提交与设计文档两个固定到 SHA 的链接。核对日期保持 2026-08-10。
- 能力字段总数不变（109 个），`README.md` 计数无需调整；`npm run generate` 重新生成 `docs/07-Headless-SDK与多端矩阵.md` 与 `docs/capabilities/surfaces/` 详情。

## 影响页面

- [Headless、SDK 与多端矩阵](../docs/07-Headless-SDK与多端矩阵.md)
- [Web 界面详情](../docs/capabilities/surfaces/surface-web.md)
- [版本与证据](../docs/09-版本与证据.md)

## 证据版本

- Qwen Code 提交 `e46586782cf8fc85d535051830bcc743bcd6b47a`（2026-08-10T05:48:17Z，PR #8696）：提交说明 “Allow Web Shell composers to ingest image files reliably while preserving the existing multimodal prompt protocol.”、“Share ordered image ingestion across desktop and mobile editors”、“Support image-only prompts and BMP preview and provider-safe handling”、“Preserve queued payloads across retries and uncertain outcomes”、“Correlate admission, queue, and terminal events by prompt ID”、“Restore images and input annotations across retry and edit flows”、“Bound image reader concurrency and encoded attachment memory”、“Skip payload attachments when restoring text is a no-op”；新增 `docs/design/web-shell/web-shell-image-drag-and-drop.md`，修改 `packages/web-shell/client/` 下 App、ChatEditor、ChatPane、`utils/imageIngestion.ts`、`utils/promptAdmission.ts` 等 37 个文件，并调整 `packages/core/src/core/anthropicContentGenerator/converter.test.ts` 与 `packages/core/src/core/openaiContentGenerator/converter.test.ts`。
- Qwen Code `packages/web-shell/client/utils/imageIngestion.ts`（同一提交）：`MAX_IMAGE_ATTACHMENT_DATA_BYTES = 8 * 1024 * 1024`（单批 base64 预算）；`SUPPORTED_IMAGE_MIME_TYPES` 为 `image/bmp`、`image/gif`、`image/jpeg`、`image/png`、`image/webp`；`normalizeImageMediaType` 把 `image/x-bmp`、`image/x-ms-bmp` 归一为 `image/bmp`；`MAX_CONCURRENT_IMAGE_READERS = 4`；拒绝原因枚举 `unsupported`、`unavailable`、`too-large`（候选体积按 `Math.ceil(file.size / 3) * 4` 估算超出剩余预算）、`read-failed`。
- Qwen Code 设计文档 `docs/design/web-shell/web-shell-image-drag-and-drop.md`（同一提交）：拖拽与粘贴均由输入区根容器 capture handler 处理，粘贴仅在 DataTransfer 含支持图片时拦截；扩展名回退仅在 MIME 为空或 `application/octet-stream` 时生效；SVG、TIFF、HEIC、PDF、目录与远程 URL 明确不支持；图片-only prompt 的 `canSubmit` 成立、不占用会话自动命名位；admission 分类为 Definitely-Rejected（结构化 `413`/`501`，可恢复重试）与 Outcome-Unknown（网络错误、超时、客户端中止、解析失败、含糊 5xx，输入区只读锁定，用户显式丢弃或恢复，恢复不自动发送）；daemon 摘要不含图片数据，重载恢复的排队项标记 `payloadCompleteness: 'summary-only'`，编辑/恢复到编辑器禁用，不支持跨重载图片恢复；daemon HTTP 限制 `express.json({ limit: '10mb' })`（超出返回结构化 413）；Core `DEFAULT_MAX_INLINE_MEDIA_BYTES = 10 * 1024 * 1024`（解码后字节，可经 daemon 环境变量配置）；BMP 原生透传到 Core/OpenAI/Gemini，Anthropic converter 降级为文本 “Unsupported inline media type: image/bmp”；“Daemon wire format, ACP, and public Web Shell API remain unchanged”。
- Qwen Code `docs/users/qwen-serve.md`（同一提交）：未描述图片拖拽或粘贴；“❌ Image / file attachments on the prompt path — `MessageEmitter` currently only renders text”；“⚠️ Stage 1 known gap — `POST /session/:id/prompt` body capped at 10 MB”。
- Claude Code on the web（https://code.claude.com/docs/en/claude-code-on-the-web，2026-08-10 抓取）：未列 Web 界面图片拖拽、粘贴或附件上传。
- Codex Cloud（https://learn.chatgpt.com/docs/cloud，2026-08-10 抓取）：未列 Web 界面图片拖拽、粘贴或附件上传。
- Kimi Code CLI 参考 `docs/zh/reference/kimi-command.md`（提交 `77618e38c35a81e26134b3f83eb7f2b460c0ee05`）：`kimi web` 相关段落未列图片拖拽、粘贴或附件上传。
- Qoder Web（https://docs.qoder.com/mobile/web/remote-control，2026-08-10 抓取）：未列 Web 界面图片拖拽、粘贴或附件上传。
- 发布状态：Qwen Code Release 列表（2026-08-10 抓取）最新正式版 v0.21.8（2026-08-08T17:07:22Z）、最新 nightly v0.21.8-nightly.20260810.55e20db328（2026-08-10T00:50:10Z），均早于该提交合入时间，故该能力尚未随 Release 发布。

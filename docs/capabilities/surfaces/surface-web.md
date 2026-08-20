# Web 界面

[返回 Headless、SDK 与多端详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=surface-web)

> 核对日期：2026-08-20

## 定义

在浏览器中创建、查看、审批或继续 Agent 会话；既包括托管 Web 产品，也包括 CLI 自带的本地 Web UI。

## 能力结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | claude.ai/code · Remote Control | 官方确认 |
| Codex | ChatGPT Web · Codex Cloud | 官方确认 |
| Qwen Code | `qwen serve` 内置 Web Shell；条件：图片拖拽/粘贴输入（v0.21.9 起）· 工作区文件上传（v0.21.12-preview.3 预览通道）· 文本文件附件（main 分支，尚未发布） | 条件项 |
| Kimi Code | `kimi web` 本地 Web UI | 条件项 |
| Qoder CLI | Qoder Web · Cloud Agents Console | 官方确认 |

## 比较边界

### 本页包含

- 托管 Web Agent 界面
- 本地 Agent Web Shell
- 浏览器中的会话、Diff、审批和任务管理

### 本页不包含

- 只在浏览器完成账号登录
- IDE 内嵌 Webview
- 没有会话控制能力的静态报告页

## 跨产品事实

1. Claude、Codex 与 Qoder 提供账号托管的 Web Surface；Qwen 和 Kimi 当前提供由本地服务进程托管的 Web UI。
2. 本地 Web UI 能否从其他设备访问取决于网络、绑定地址、TLS 与 token；它不自动成为厂商托管云服务。
3. Web Surface 的工具、命令和文件位置取决于会话实际运行在本机还是云端。
4. Qwen Web Shell 自 v0.21.9 支持图片拖拽/粘贴输入与图片-only prompt，自 v0.21.12-preview.3 预览通道支持把本地文件直传进工作区，main 分支还支持把受支持的文本文件以附件形式随 prompt 提交（尚未发布）；Claude、Codex、Kimi、Qoder 的官方 Web 文档未列浏览器侧图片拖拽、粘贴、文本文件附件或本地文件上传（Claude 可由 CLI `claude --cloud` 把整个本地仓库打包上传到云会话，不属于浏览器侧文件上传）。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | claude.ai/code · Remote Control |
| 入口与调用 | claude.ai/code 创建 Cloud session；Remote Control 页面打开本地会话。 |
| 协议与输出 | 托管 Web 应用；Cloud session 连接 Anthropic VM，Remote Control 通过账号中继连接本机。 |
| 具体行为 | 创建/监控任务、查看 Diff、留言继续、审批、共享和归档会话。 |
| 会话与状态 | Cloud 会话保存在账号侧并可从 CLI teleport；Remote Control 状态由本地进程持有。 |
| 工具与能力 | Cloud 使用克隆仓库中的项目配置；Remote Control 使用本机完整工具与文件。 |
| 认证与权限 | Claude 账号；Cloud 通常连接 GitHub，Remote Control 要求同一账号与组织允许。 |
| 运行位置 | 浏览器端由 Anthropic 托管；执行位置按 Cloud 或 Remote Control 分开。 |
| 条件与边界 | 不要把 Remote Control 与 Cloud 混写：前者本机执行，后者在托管 VM 中执行。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code on the web](https://code.claude.com/docs/en/claude-code-on-the-web)、[Claude Code Remote Control](https://code.claude.com/docs/en/remote-control) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | ChatGPT Web · Codex Cloud |
| 入口与调用 | ChatGPT Web 中选择 Codex；Codex Cloud 页面创建和管理 coding task。 |
| 协议与输出 | OpenAI 托管 Web 产品，连接 Codex Cloud 环境与账号线程。 |
| 具体行为 | 选择仓库/环境，后台运行任务，查看日志、摘要和 Diff，继续任务并创建 Pull Request。 |
| 会话与状态 | Cloud chats 与 code reviews 保存在账号/工作区，可从 Web、CLI 或集成继续查看。 |
| 工具与能力 | 工具在配置的云环境中运行；依赖、环境变量、secrets 和网络由 environment 管理。 |
| 认证与权限 | ChatGPT/Codex 账号与 GitHub 授权。 |
| 运行位置 | Web 前端和 Agent 运行环境均由 OpenAI 托管。 |
| 条件与边界 | 本地 CLI 和 IDE 的未提交文件不会自动出现在 Cloud；任务基于所连仓库和云环境。 |
| 证据状态 | 官方确认 |
| 来源 | [Codex cloud](https://learn.chatgpt.com/docs/cloud)、[ChatGPT desktop app](https://learn.chatgpt.com/docs/app) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `qwen serve` 内置 Web Shell；条件：图片拖拽/粘贴输入（v0.21.9 起）· 工作区文件上传（v0.21.12-preview.3 预览通道）· 文本文件附件（main 分支，尚未发布） |
| 入口与调用 | `qwen serve` 根路径自带 Web Shell；`--open` 自动打开浏览器，`--no-web` 可禁用；条件：图片输入经输入区拖拽或粘贴进入（v0.21.9 起）；工作区文件上传经输入区拖入普通文件或 `@` 文件面板的“上传文件”进入（v0.21.12-preview.3 预览通道）；文本文件附件经粘贴进入输入区，当前工作区没有工作区上传入口时拖拽也可进入（main 分支，尚未发布）。 |
| 协议与输出 | 同源静态 Web App 通过 HTTP REST 与 SSE 连接本地 daemon；图片以 base64 附件随 prompt 载荷提交；文件上传走独立的二进制路由 `POST /file/upload`（主工作区）与 `POST /workspaces/:workspace/file/upload`（qualified 工作区），要求 `Content-Type: application/octet-stream`（否则 415），不复用文本写入路由；v1 无 ACP-HTTP 对等上传方法。文本附件不内联进 prompt 字符串，而是作为独立文件对象随 prompt 提交，ACP 会话侧嵌入为带 `attachment:///<文件名>` URI 的文件引用资源块（展开形如 `File: attachment:///app.log` 加文件正文）；transcript block 只保存附件 `name` 与 `mimeType` 元数据，不保存正文（条件：main 分支，尚未发布）。 |
| 具体行为 | 提供聊天、Diff、提交历史、工具调用、权限请求、会话与工作区管理；条件：可向输入区拖拽或粘贴图片（`image/png`、`image/jpeg`、`image/gif`、`image/webp`、`image/bmp`；SVG、TIFF、HEIC、PDF、目录与远程 URL 拒绝），`image/x-bmp`/`image/x-ms-bmp` 归一为 BMP，并支持只含图片、不带文字的 prompt；BMP 在 Anthropic Provider 路径降级为文本说明。输入区拖入普通文件或混合批次走工作区上传：拖放上传到目标工作区根目录，`@` 面板“上传文件”上传到当前浏览目录；多文件按顺序上传，支持进度与取消；重名时在扩展名前自动插入 ` (N)` 编号（`report.pdf → report (1).pdf`、`README → README (1)`、`.env → .env (1)`，最多 1000 次尝试），上传从不覆盖已有文件；仅包含受支持图片的批次仍走图片附件流程。文本文件附件（main 分支，尚未发布）：受支持文本文件经粘贴成为随 prompt 提交的附件，接受范围按 `TEXT_FILE_EXTENSIONS` 扩展名白名单（`log`/`txt`/`text`/`md`/`markdown`/`json`/`jsonl`/`ndjson`/`csv`/`tsv`/`xml`/`yaml`/`yml`/`toml`/`ini`/`cfg`/`conf`/`config`/`env`/`properties`/`sh`/`bash`/`zsh`/`py`/`js`/`mjs`/`cjs`/`jsx`/`ts`/`mts`/`cts`/`tsx`/`java`/`go`/`rs`/`c`/`h`/`cpp`/`cc`/`cxx`/`hpp`/`cs`/`rb`/`php`/`swift`/`kt`/`scala`/`sql`/`html`/`htm`/`css`/`scss`/`less`/`vue`/`svelte`/`diff`/`patch`）、`TEXT_FILENAMES` 知名文件名（Dockerfile、Makefile、LICENSE、README、Gemfile、Procfile、Vagrantfile）或 `text/*` 与 `TEXT_MIME_TYPES`（`application/json`、`application/xml`、`application/javascript`、`application/x-javascript`、`application/typescript`、`application/yaml`、`application/x-yaml`、`application/toml`、`application/x-sh`、`application/sql`）判断；扩展名与知名文件名回退优先于 OS MIME 绑定（修正 Windows 上 `.ts`/`.mts` 被绑为 video/mp2t、`.csv`/`.tsv` 被绑为 Excel 导致白名单不可达的问题）；解码后含 NUL 字符的二进制内容按 `unsupported` 拒绝。 |
| 会话与状态 | 会话由本地 daemon 和磁盘 transcript 管理；多浏览器客户端可共享同一会话；条件：排队 prompt 的图片附件在重试/编辑流程中恢复；admission 结果未知时输入区进入只读锁定，需手动丢弃或恢复，恢复不自动发送；页面重载后恢复的排队项仅含摘要、不含图片数据。上传进度显示在输入区上方，成功条目三秒后消失，结果成为可移除的行内文件标签（使用服务端确认的路径）；TypeScript SDK 的 `uploadWorkspaceFile`（`DaemonClient` 与 `WorkspaceDaemonClient`）提供同一上传操作，支持进度回调、取消与超时。文本附件（main 分支，尚未发布）：附件显示为输入区内可单独移除的 chip，文件名为去除 bidi/零宽字符后的净化名并附格式化大小（B/KB/MB），重名自动追加 `-2` 等后缀；单条 prompt 的全部文本附件共享 512 KiB 累计预算（`MAX_TEXT_ATTACHMENT_DATA_BYTES = 512 * 1024`），图片仍为 8 MiB（`MAX_IMAGE_ATTACHMENT_DATA_BYTES = 8 * 1024 * 1024`）；附件随重试血缘恢复（取消重试与失败回合重试路径均保留），页面恢复经 `editor.restoreFiles()` 重建，恢复前重置路径以防附件丢失或跨会话泄漏；超限按 `too-large`、读取失败按 `read-failed`、其余按跳过分别提示。 |
| 工具与能力 | Web Shell 使用 qwen serve 背后的 ACP 运行时和本地工具。 |
| 认证与权限 | loopback 可无 token；共享或非 loopback 访问必须使用 bearer token。 |
| 运行位置 | Web UI 与 API 由用户机器上的 qwen serve 提供，不是 Qwen 托管 Web 产品。 |
| 条件与边界 | 当前 Daemon 为实验性本地部署；远程暴露需要自行处理网络和安全边界。图片输入于 2026-08-10 合入 main 并随 v0.21.9（2026-08-10）发布；工作区文件上传于 2026-08-13 合入 main（提交 `a8bcaefea72d`），随 v0.21.12-preview.3（2026-08-14）预览通道发布，稳定通道尚未发布。文本文件附件于 2026-08-15 合入 main（提交 `34cc1c3ede69`，PR #9180），最新预览发布 v0.21.12-preview.5（2026-08-16，自 release 分支切出）未包含该提交，预览与稳定通道均未发布。文件上传需 daemon 声明 `workspace_file_upload` 能力（qualified 工作区另需 `workspace_qualified_rest_core`），上限经 `limits.maxWorkspaceFileUploadBytes` 通告；不声明该能力的旧 daemon 会隐藏两个上传入口。单文件上限 50 MiB（`MAX_UPLOAD_BYTES`，与 5 MiB 的 `MAX_WRITE_BYTES` 文本写入上限相互独立，当前不可配置）；单批最多 100 个文件，文件名上限 255 字节，最多 4 个并发上传，饱和时返回 429 `upload_busy`；超出上限返回 413 `file_too_large`；不受信任、未知或 draining 的工作区返回 403 且不回退主工作区；新文件以 `0o600` 权限经临时文件原子发布，中断或取消不暴露部分文件，取消为尽力而为（服务端已开始发布时仍可能写完整文件）；不支持断点续传、分块上传、文件夹上传与原地覆盖。官方用户文档尚未描述图片输入与文件上传，仍把 prompt 路径图片/文件附件列为已知缺口（`MessageEmitter` 只渲染文本；main 分支 qwen-serve.md 未更新，文本附件同样未描述）。拖拽路由规则不变：工作区上传入口可用时，含任一非图片文件的拖拽批次整批走工作区上传，文本附件经粘贴进入，或在当前工作区没有工作区上传入口（如 daemon 未声明 `workspace_file_upload`）时经拖拽进入；`@` 面板“上传文件”与文件选择器仍走工作区上传。客户端单批 base64 预算 8 MiB、并发读取上限 4，超预算按 `too-large` 拒绝；daemon 请求体上限 10 MB（超出返回 413）；Core 内联媒体默认上限 10 MiB（解码后字节，可经 daemon 环境变量配置）。 |
| 证据状态 | 条件项 |
| 来源 | [Qwen Code current daemon and Web Shell](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/qwen-serve.md)、[Qwen Code Web Shell image drag and drop commit](https://github.com/QwenLM/qwen-code/commit/e46586782cf8fc85d535051830bcc743bcd6b47a)、[Qwen Code Web Shell image drag and drop design document](https://github.com/QwenLM/qwen-code/blob/e46586782cf8fc85d535051830bcc743bcd6b47a/docs/design/web-shell/web-shell-image-drag-and-drop.md)、[Qwen Code Web Shell image ingestion source](https://github.com/QwenLM/qwen-code/blob/e46586782cf8fc85d535051830bcc743bcd6b47a/packages/web-shell/client/utils/imageIngestion.ts)、[Qwen Code v0.21.9 release notes](https://github.com/QwenLM/qwen-code/releases/tag/v0.21.9)、[Qwen Code Web Shell workspace file upload commit](https://github.com/QwenLM/qwen-code/commit/a8bcaefea72daa528faba0b7aa1189e4a695cf01)、[Qwen Code Web Shell workspace file upload design document](https://github.com/QwenLM/qwen-code/blob/a8bcaefea72daa528faba0b7aa1189e4a695cf01/docs/design/web-shell-file-upload.md)、[Qwen Code Web Shell upload policy source](https://github.com/QwenLM/qwen-code/blob/a8bcaefea72daa528faba0b7aa1189e4a695cf01/packages/cli/src/serve/fs/policy.ts)、[Qwen Code daemon workspace file upload capability source](https://github.com/QwenLM/qwen-code/blob/a8bcaefea72daa528faba0b7aa1189e4a695cf01/packages/cli/src/serve/capabilities.ts)、[Qwen Code v0.21.12-preview.3 release notes](https://github.com/QwenLM/qwen-code/releases/tag/v0.21.12-preview.3)、[Qwen Code Web Shell text file attachments commit](https://github.com/QwenLM/qwen-code/commit/34cc1c3ede6949ec81a456615f7b8e64090f4d40)、[Qwen Code Web Shell text attachment ingestion source](https://github.com/QwenLM/qwen-code/blob/34cc1c3ede6949ec81a456615f7b8e64090f4d40/packages/web-shell/client/utils/imageIngestion.ts)、[Qwen Code Web Shell composer drop routing source](https://github.com/QwenLM/qwen-code/blob/34cc1c3ede6949ec81a456615f7b8e64090f4d40/packages/web-shell/client/components/ChatEditor.tsx)、[Qwen Code v0.21.12-preview.5 release notes](https://github.com/QwenLM/qwen-code/releases/tag/v0.21.12-preview.5) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `kimi web` 本地 Web UI |
| 入口与调用 | `kimi web` 启动并打开本地 Web UI；`--no-open` 只启动服务。 |
| 协议与输出 | Web UI 通过同进程 REST + WebSocket API 工作；服务公开 OpenAPI 与 AsyncAPI。 |
| 具体行为 | 在浏览器中管理会话、发送 prompt、展示工具、Diff、文件和媒体。 |
| 会话与状态 | 使用本地 Kimi 会话与 home；多个服务实例可并存。 |
| 工具与能力 | 调用本地 Agent 的文件、Shell、搜索与 MCP 工具。 |
| 认证与权限 | 默认 bearer token；URL fragment 把 token 传给 Web UI，支持 rotate-token。 |
| 运行位置 | 默认只在 loopback；可绑定其他地址但仍是用户自托管。 |
| 条件与边界 | 不是 Kimi 托管云任务；关闭前台 `kimi web` 进程后 Web 会话服务停止。 |
| 证据状态 | 条件项 |
| 来源 | [Kimi Code current CLI, Headless and Web reference](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/kimi-command.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | Qoder Web · Cloud Agents Console |
| 入口与调用 | Qoder Web / `qoder.com/agents`；Cloud Agents Console 管理 Cloud 与 Remote Control task。 |
| 协议与输出 | Qoder 托管 Web 产品，通过账号连接 Cloud Agent 或已配对的本地 CLI。 |
| 具体行为 | 创建云任务、选择 GitHub 仓库和分支、查看本地/云任务、处理审批并继续对话。 |
| 会话与状态 | 云任务与本地远程任务出现在统一 conversation list。 |
| 工具与能力 | Cloud task 使用云环境工具；Remote Control task 使用本机 CLI 工具。 |
| 认证与权限 | Qoder 账号；云仓库任务需要 GitHub App/授权，本地任务需同账号配对。 |
| 运行位置 | Web 由 Qoder 托管，执行位置可能是 Qoder Cloud 或用户本机。 |
| 条件与边界 | Web 统一列表并不表示两类任务共享文件系统；必须看任务是 Cloud 还是 Remote Control。 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder Web remote and cloud tasks](https://docs.qoder.com/mobile/web/remote-control)、[Qoder CLI Remote Control](https://docs.qoder.com/en/cli/remote-control)、[Qoder CLI Cloud Mode](https://docs.qoder.com/en/cli/cloud-mode) |

## 官方来源

- [Claude Code on the web](https://code.claude.com/docs/en/claude-code-on-the-web)
- [Claude Code Remote Control](https://code.claude.com/docs/en/remote-control)
- [Codex cloud](https://learn.chatgpt.com/docs/cloud)
- [ChatGPT desktop app](https://learn.chatgpt.com/docs/app)
- [Qwen Code current daemon and Web Shell](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/qwen-serve.md)
- [Qwen Code Web Shell image drag and drop commit](https://github.com/QwenLM/qwen-code/commit/e46586782cf8fc85d535051830bcc743bcd6b47a)
- [Qwen Code Web Shell image drag and drop design document](https://github.com/QwenLM/qwen-code/blob/e46586782cf8fc85d535051830bcc743bcd6b47a/docs/design/web-shell/web-shell-image-drag-and-drop.md)
- [Qwen Code Web Shell image ingestion source](https://github.com/QwenLM/qwen-code/blob/e46586782cf8fc85d535051830bcc743bcd6b47a/packages/web-shell/client/utils/imageIngestion.ts)
- [Qwen Code v0.21.9 release notes](https://github.com/QwenLM/qwen-code/releases/tag/v0.21.9)
- [Qwen Code Web Shell workspace file upload commit](https://github.com/QwenLM/qwen-code/commit/a8bcaefea72daa528faba0b7aa1189e4a695cf01)
- [Qwen Code Web Shell workspace file upload design document](https://github.com/QwenLM/qwen-code/blob/a8bcaefea72daa528faba0b7aa1189e4a695cf01/docs/design/web-shell-file-upload.md)
- [Qwen Code Web Shell upload policy source](https://github.com/QwenLM/qwen-code/blob/a8bcaefea72daa528faba0b7aa1189e4a695cf01/packages/cli/src/serve/fs/policy.ts)
- [Qwen Code daemon workspace file upload capability source](https://github.com/QwenLM/qwen-code/blob/a8bcaefea72daa528faba0b7aa1189e4a695cf01/packages/cli/src/serve/capabilities.ts)
- [Qwen Code v0.21.12-preview.3 release notes](https://github.com/QwenLM/qwen-code/releases/tag/v0.21.12-preview.3)
- [Qwen Code Web Shell text file attachments commit](https://github.com/QwenLM/qwen-code/commit/34cc1c3ede6949ec81a456615f7b8e64090f4d40)
- [Qwen Code Web Shell text attachment ingestion source](https://github.com/QwenLM/qwen-code/blob/34cc1c3ede6949ec81a456615f7b8e64090f4d40/packages/web-shell/client/utils/imageIngestion.ts)
- [Qwen Code Web Shell composer drop routing source](https://github.com/QwenLM/qwen-code/blob/34cc1c3ede6949ec81a456615f7b8e64090f4d40/packages/web-shell/client/components/ChatEditor.tsx)
- [Qwen Code v0.21.12-preview.5 release notes](https://github.com/QwenLM/qwen-code/releases/tag/v0.21.12-preview.5)
- [Kimi Code current CLI, Headless and Web reference](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/kimi-command.md)
- [Qoder Web remote and cloud tasks](https://docs.qoder.com/mobile/web/remote-control)
- [Qoder CLI Remote Control](https://docs.qoder.com/en/cli/remote-control)
- [Qoder CLI Cloud Mode](https://docs.qoder.com/en/cli/cloud-mode)

## 关联能力

- [服务端与 Daemon](./surface-service.md)
- [云端仓库任务](./surface-cloud.md)
- [远程接管与跨端继续](./surface-remote-control.md)

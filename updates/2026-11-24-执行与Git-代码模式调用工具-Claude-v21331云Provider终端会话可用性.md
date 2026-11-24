# 代码模式调用工具：Claude Code v2.1.331 把 Code Mode 终端会话放开到 Amazon Bedrock、Google Cloud's Agent Platform、Microsoft Foundry 与 Claude Platform on AWS，官方 code-mode 专页 Requirements 仍把这四家列为不可用（更新日志已宣布、文档未同步）；同轮复核其余四家代码模式记录无变化

日期：2026-11-24
能力字段：`execution-code-mode`（执行与 Git · 代码模式调用工具）

## 本次改动

每日研究在核对五个产品的官方更新日志与 Release 时，发现 Claude Code v2.1.331（2026-11-23T21:34:41Z 发布）更新日志含一条直接改变 `execution-code-mode` 字段既有结论的 Added 条目。本单元只处理这一条：把 Claude 的 Code Mode 账号/Provider 条件从「四家云 Provider 一律不可用」更新为「v2.1.331 起终端会话可在四家云 Provider 使用，但官方文档 Requirements 段尚未同步」，并补录同版其余五条 Code Mode 修复/改进；矩阵单元格、详情页 `conditions` 与 `docs/09` 坐标同步前移。其余四家按同一字段口径复核最新发布，确认代码模式记录没有变化。

### 1. Claude：v2.1.331 更新日志放开四家云 Provider 的终端会话

发布坐标：v2.1.331 于 2026-11-23T21:34:41Z 发布（官方 Release 列表），对应 `CHANGELOG.md` 提交 `bd07f2a121a9d16f2b00b209bbdf50c1bc46fb91`（提交说明 “chore: Update CHANGELOG.md and feed.xml”、作者时间 2026-11-23T21:34:18Z，与 Release 时间相差 23 秒；该提交上 `CHANGELOG.md` 为 1,401,345 字节）。`## 2.1.331` 段与 Code Mode 相关共六条，唯一的 Added 逐字为：

> Added Code Mode support in terminal sessions on Amazon Bedrock, Google Cloud's Agent Platform, Microsoft Foundry and Claude Platform on AWS

此前记录的结论（`execution-details.js` 的 Claude `conditions` 与 `data.js` 矩阵单元格）写「账号要 Claude 订阅或 Console 账号，经 gateway、Amazon Bedrock、Claude Platform on AWS、Google Cloud's Agent Platform、Microsoft Foundry 或 Claude Models on Google Cloud (Anthropic managed) 都不可用」。本条 Added 把其中四家云 Provider（Amazon Bedrock、Google Cloud's Agent Platform、Microsoft Foundry、Claude Platform on AWS）改为在终端会话中可用，措辞限定 “in terminal sessions”，与 Code Mode 既有的「仅交互终端会话」Surface 边界一致。

文档缺口（2026-11-24 核对）：官方 code-mode 专页 `.md` 变体（`https://code.claude.com/docs/en/code-mode.md`，27,773 字节）的 Requirements “Account” 项仍逐字为 “a Claude subscription or Console account. You can't use Code Mode through a gateway, Amazon Bedrock, Claude Platform on AWS, Google Cloud's Agent Platform, Microsoft Foundry, or Claude Models on Google Cloud (Anthropic managed)”，故障表仍保留 “it only works directly with the Anthropic API”/“it only works with the Anthropic API” 一行并让 “Remove the settings that route requests through a cloud provider, a gateway, or a custom `ANTHROPIC_BASE_URL`”。即四家云 Provider 的可用性目前只有更新日志一处一手来源，官方文档 Requirements 段尚未同步，故按「更新日志已宣布、文档未同步」记录，与仓库既有的 `CLAUDE_CODE_SUBAGENT_EFFORT`、Codex `codex exec --remote` 等同类处理一致。

未确认项：该 Added 只点名四家 Provider，没有提到 gateway 与 Claude Models on Google Cloud (Anthropic managed)，两者是否随之放开记为未确认；也没有说明这四家是否仍要求原生构建、订阅或 Console 账号之外的其他前提（Requirements 的 Version/Organization/Model/Surface/Installation/Windows 各项在文档页未随本条改动）。

同版其余五条 Code Mode 条目（一并补录到详情页 `conditions` 的发布记录段，均属缺陷修复与展示改进，不改变入口、工具名或运行时）：

- Fixed Code Mode sessions resumed with `--resume` or `--continue` in another permission mode losing thinking and the prompt cache; one begun in a mode that asks keeps that mode's limits on scripts
- Fixed Code Mode sending a request about every second when a `!` or slash command was typed while a script was running
- Fixed Code Mode losing the middle of a long script output; Claude now gets a path to the uncut text（关联 issue #111373）
- Fixed Code Mode with `--bare` not telling Claude what its scripts can call
- Improved Code Mode tool search to show more of an MCP tool's description, with its limits, formats and defaults

Surface 边界不变：Code Mode 仍只覆盖终端里的交互式 `claude` 会话，`-p`、Agent SDK、VS Code 面板、桌面端与 Cloud 会话不支持；本次放开的是「在终端会话里用哪家 Provider 的账号/路由」，不是新增 Surface。

### 2. 其余四家：代码模式记录复核，均无变化

- Codex：`features.code_mode` 仍是 `Stage::UnderDevelopment`、`default_enabled: false`，官方配置参考仍写 “This feature is under development and off by default.”。快照内近期提交（rust-v0.172.0/0.173.0-alpha/0.174.0-alpha.1 一带）集中在 deferred image generation、`resume --approve-for-me` 作用域、TUI model picker provider、exec-server 端口竞态与 headless Linux keyring 等，没有 code_mode 开关、`exec`/`wait` 工具或宿主行为的条目，记录不变。
- Qwen Code：`tools.codeModeOnly` 默认 `false`、需重启，`exec` 工具在子进程 QuickJS/WASM 运行时每次调用新建。v0.28.3（2026-11-21）与 v0.28.4（2026-11-22T12:04:21Z）发布说明集中在 Web Shell、Managed Agent 与 CI，快照内近期提交（web-shell Managed provider、generated-ui、managed-agent park approval、Gemini functionResponse 修复等）没有 Code Mode 条目，记录不变。
- Kimi Code：仍无该机制——内置工具表没有执行模型代码的工具，配置与更新日志也没有对应键。快照内近期提交（agent-core-v2 loop 初始化、kap-server、UI 合并、settings 编辑全局 AGENTS.md 等）与代码模式无关，记录不变。
- Qoder CLI：仍只有更新日志记录（`QODER_ENABLE_CODE_MODE=1` 加 `/settings` 选 `on` 或 `only`，CLI 1.1.81 起），文档站没有 CodeMode 页，工具名、运行时与生效 Surface 未确认。更新日志最新至 CLI 1.1.95（November 21, 2026）一带没有新的 CodeMode 条目，记录不变。

## 同步范围

- `site/data.js`：`execution-code-mode` 行 Claude 单元格追加账号/Provider 条件项（v2.1.331 起四家云 Provider 终端会话可用、文档未同步）；新增 1 个来源 `claude-code-mode-v21331-changelog`（固定到提交 `bd07f2a121a9d16f2b00b209bbdf50c1bc46fb91`），既有来源零删改；`updatedAt` 前移到 2026-11-24。
- `site/execution-details.js`：`execution-code-mode` 的 Claude 记录 `conditions` 字段更新账号/Provider 句并补入 v2.1.331 六条发布记录，`sources` 数组加入 `claude-code-mode-v21331-changelog`；`value` 与 `status` 由 `createDetail` 从主表派生，自动跟随。
- `docs/06-任务执行与Git矩阵.md`、`docs/capabilities/execution/execution-code-mode.md`、`docs/capabilities/execution/README.md` 及其余七类能力文档的核对日期由 `npm run generate` 重新生成。
- `docs/09-版本与证据.md`：五家行核对日期前移到 2026-11-24；“官方来源” 表 Claude 行 “执行与 Git” 列追加 v2.1.331 更新日志链接。
- `README.md`：核对日期前移到 2026-11-24。
- 能力字段总数维持 119。
- `npm run generate` 与 `npm test`（validate-details / validate-links / validate-site）全部通过：`Validated 119 details × 5 products.`、`Validated links in 304 Markdown files.`、`Validated matrix render, detail schemas, links, and CSS.`。

# 会话导出

[返回会话与上下文详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=session-export)

> 核对日期：2026-08-02

## 定义

把当前或指定会话转换为便于阅读、解析、归档或诊断的外部文件。

## 会话结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/export [filename]` | 官方确认 |
| Codex | CLI 命令表未列出 | 未确认 |
| Qwen Code | HTML · Markdown · JSON · JSONL | 源码确认 |
| Kimi Code | Markdown · 诊断 ZIP | 官方确认 |
| Qoder CLI | `/export [filename]` | 官方确认 |

## 比较边界

### 本页包含

- 人类可读导出
- 结构化格式
- 诊断包及其内容边界

### 本页不包含

- 只复制最后一条回答
- 会话原始存储本身
- 提交到远程分享服务

## 跨产品事实

1. Claude Code、Qwen Code、Kimi Code 和 Qoder CLI 都有显式会话导出；Codex 当前 CLI 命令表未列出会话导出命令。
2. Kimi Code 明确区分人类可读 Markdown 与包含日志的诊断 ZIP，Web UI 的 `/export` 还与 TUI 同名命令行为不同。
3. 导出内容可能包含提示词、代码、命令输出、本地路径和诊断信息，公开分享前应检查并脱敏。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/export [filename]` |
| 入口与切换 | `/export` 打开复制或保存菜单；`/export <filename>` 直接写入指定文件。 |
| 保存位置 | 默认保存在 `~/.claude/projects/<project>/<session-id>.jsonl`；项目名由工作目录转换得到。 |
| 具体行为 | 把消息和工具输出渲染为人类可读的纯文本。脚本可改用 `claude -p --output-format json\|stream-json` 获取结构化结果。 |
| 状态范围 | 导出当前会话；Hook 和状态栏还能取得原始 transcript 路径用于自动归档。 |
| 自动行为 | 可在 `SessionEnd` Hook 中按 `transcript_path` 自动复制或归档原始会话记录。 |
| 保存与保留 | 导出文件独立于原会话；删除导出文件不会删除会话，反之亦然。 |
| 适用界面 | 本页以 CLI 为准。桌面端、Web 和 VS Code 各自维护会话历史；`claude -p` 与 Agent SDK 会话可按 ID 恢复，但不出现在 CLI 选择器中。 |
| 条件与边界 | 原始 JSONL 格式是内部实现，可能随版本变化；程序化集成应优先使用官方结构化接口。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Manage sessions](https://code.claude.com/docs/en/sessions)、[Claude Code Headless Mode](https://code.claude.com/docs/en/headless) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | CLI 命令表未列出 |
| 入口与切换 | 当前 Codex CLI 命令表未列出会话导出命令。 |
| 保存位置 | 本地会话记录位于 `$CODEX_HOME/sessions`，默认是 `~/.codex/sessions`；归档会话单独位于 `$CODEX_HOME/archived_sessions`。 |
| 具体行为 | 本地会话 JSONL 可用于故障排查，`codex exec --json` 可输出单次非交互运行事件，但两者都不等于“导出当前交互会话”的命令。 |
| 状态范围 | 本项只认显式的当前会话导出，不把反馈上传、日志目录或复制单条消息视为等价入口。 |
| 自动行为 | 可由外部脚本读取 `$CODEX_HOME/sessions` 做归档，但这不是当前官方 CLI 导出 Surface。 |
| 保存与保留 | 会话原始记录保留在 Codex Home；结构和清理应按诊断材料处理。 |
| 适用界面 | 本页区分交互式 Codex 与 `codex exec`。桌面端、IDE 和 CLI 可能随各自版本提供不同的命令集合。 |
| 条件与边界 | 保留为未确认/未列出，直到官方 CLI 提供可读或结构化的会话导出命令。 |
| 证据状态 | 未确认 |
| 来源 | [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)、[Codex Non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode)、[Codex Troubleshooting](https://learn.chatgpt.com/docs/reference/troubleshooting) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | HTML · Markdown · JSON · JSONL |
| 入口与切换 | `/export html`、`/export md`、`/export json`、`/export jsonl`；不带格式时默认 HTML。 |
| 保存位置 | 会话按当前项目保存在 `~/.qwen/projects/<sanitized-cwd>/chats/<sessionId>.jsonl`。 |
| 具体行为 | 把当前会话分别输出为可阅读页面、Markdown、完整 JSON 或逐行 JSON 事件。 |
| 状态范围 | 导出当前会话；目标路径必须位于当前工作目录允许范围内。 |
| 自动行为 | 可在 Headless 或 ACP 注册范围内调用导出命令，适合脚本生成会话制品。 |
| 保存与保留 | 导出文件使用受限文件权限写入，独立于 `chats/<sessionId>.jsonl` 原始记录。 |
| 适用界面 | 本页以交互式 TUI 为主；Headless 与 ACP 只有在对应命令注册或 CLI 参数存在时才单独列出。 |
| 条件与边界 | 四种格式面向不同用途；JSONL 是流式记录，HTML/Markdown 更适合人类阅读。 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code current commands](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/commands.md)、[Qwen Code current headless mode](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/headless.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | Markdown · 诊断 ZIP |
| 入口与切换 | TUI 用 `/export-md [path]`（别名 `/export`）或 `/export-debug-zip`；CLI 用 `kimi export [sessionId] [-o path]`。 |
| 保存位置 | 会话位于 `$KIMI_CODE_HOME/sessions/<workDirKey>/<sessionId>/`，默认数据根为 `~/.kimi-code`；元数据在 `state.json`，消息和工具事件在 `agents/*/wire.jsonl`。 |
| 具体行为 | Markdown 渲染可读对话；诊断 ZIP 打包会话目录和诊断日志，默认还包含全局日志。 |
| 状态范围 | 可导出当前会话、指定 ID 或当前目录最近会话；Web UI 的 `/export` 下载诊断 ZIP，不是 TUI 的 Markdown 别名。 |
| 自动行为 | 未传会话 ID 时 CLI 会选当前目录最近会话并确认，`-y` 可跳过确认。 |
| 保存与保留 | 默认 Markdown 写到工作目录；ZIP 可用 `-o` 指定位置。导出文件不改变原会话。 |
| 适用界面 | 本页以交互式 TUI 和 `kimi` CLI 为主；只在 Web UI 中不同的行为会单独注明。 |
| 条件与边界 | Web 导出需要在内存缓存 ZIP，限制 64 MiB；可用 `--no-include-global-log` 排除全局日志。 |
| 证据状态 | 官方确认 |
| 来源 | [Kimi Code current sessions](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/guides/sessions.md)、[Kimi Code current CLI reference](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/reference/kimi-command.md)、[Kimi Code current data locations](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/configuration/data-locations.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/export [filename]` |
| 入口与切换 | `/export [filename]` 把当前会话导出到文件。 |
| 保存位置 | 公开 TUI 文档未列出固定的会话存储目录；SDK 消息与 Hook 上下文提供 `session_id` 和 `transcript_path`。 |
| 具体行为 | TUI 打开导出流程或按参数写入文件；当前命令页未说明具体输出格式和字段。 |
| 状态范围 | 只确认当前会话导出，不推断可按任意历史会话 ID 批量导出。 |
| 自动行为 | 公开命令页未说明 Headless 是否直接支持该 TUI 导出入口。 |
| 保存与保留 | 导出文件独立保存；固定默认目录与文件扩展名未在当前文档中列出。 |
| 适用界面 | 本页以 Qoder CLI TUI 为主；只在 Agent SDK 提供的能力会明确标为 SDK 条件项。 |
| 条件与边界 | 格式、脱敏和覆盖行为未公开时保持未知，不按其他产品的 `/export` 语义推断。 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI commands](https://docs.qoder.com/en/cli/command) |

## 官方来源

- [Claude Code Manage sessions](https://code.claude.com/docs/en/sessions)
- [Claude Code Headless Mode](https://code.claude.com/docs/en/headless)
- [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)
- [Codex Non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode)
- [Codex Troubleshooting](https://learn.chatgpt.com/docs/reference/troubleshooting)
- [Qwen Code current commands](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/commands.md)
- [Qwen Code current headless mode](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/headless.md)
- [Kimi Code current sessions](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/guides/sessions.md)
- [Kimi Code current CLI reference](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/reference/kimi-command.md)
- [Kimi Code current data locations](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/configuration/data-locations.md)
- [Qoder CLI commands](https://docs.qoder.com/en/cli/command)

## 关联能力

- [恢复会话](./session-resume.md)
- [导出会话](../commands/cmd-export.md)
- 结构化输出：见对应能力矩阵

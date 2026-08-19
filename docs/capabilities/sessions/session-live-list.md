# 运行中会话列表

[返回会话与上下文详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=session-live-list)

> 核对日期：2026-08-19

## 定义

列出本机当前正在运行的交互式 Agent 会话，区别于面向已保存历史会话的恢复入口。

## 会话结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | Agent view 与 `claude agents --json` 列出运行中会话；会话选择器以 `bg` 标记后台会话 | 官方确认 |
| Codex | 官方命令表未列出运行中会话列表；`codex resume` 选择已保存会话 | 未确认 |
| Qwen Code | `qwen sessions ps` · `--json` JSON Lines（v0.21.14 起） | 官方确认 |
| Kimi Code | `/sessions` 仅列出已保存历史会话；官方文档未列出运行中会话入口 | 未确认 |
| Qoder CLI | `/resume` 恢复历史会话；官方命令表未列出运行中会话列表 | 未确认 |

## 比较边界

### 本页包含

- 运行中交互式会话的列表入口
- 列表输出格式与字段
- 运行状态登记与失效清理

### 本页不包含

- 已保存历史会话的列表与恢复
- 云端会话或云端任务列表
- 跨会话消息与相互控制

## 跨产品事实

1. Qwen Code 提供专用 CLI 命令 `qwen sessions ps` 列出本机运行中的交互式会话，基于 `~/.qwen/sessions/` 实时进程登记表（v0.21.14 起）。
2. Claude Code 官方 Sessions 文档把 agent view 与 `claude agents --json` 输出描述为运行中会话的列表；会话选择器以 `bg` 标记后台会话。
3. Codex、Kimi Code 与 Qoder CLI 的官方命令表只列出面向已保存会话的恢复入口，未列出查看运行中会话的命令。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | Agent view 与 `claude agents --json` 列出运行中会话；会话选择器以 `bg` 标记后台会话 |
| 入口与切换 | 官方 Sessions 文档把 agent view 与 `claude agents --json` 输出列为运行中会话的列表（listings of running sessions）；`claude --resume` 或 `/resume` 打开的会话选择器默认列出当前 Worktree 的会话，包括以 `bg` 标记的后台会话。 |
| 保存位置 | 默认保存在 `~/.claude/projects/<project>/<session-id>.jsonl`；项目名由工作目录转换得到。 |
| 具体行为 | 会话名称用于在运行中会话列表中标识会话：未命名会话的默认名称为工作目录名加两位字符后缀（如 `my-app-3f`）。选择器支持输入字符过滤，粘贴 PR/MR 网址可定位关联会话。 |
| 状态范围 | 选择器默认范围为当前 Worktree；`Ctrl+W` 扩到当前仓库全部 Worktree，`Ctrl+A` 扩到本机全部项目，`Ctrl+B` 按当前 git 分支过滤。 |
| 自动行为 | 转为后台的会话以 `bg` 标记继续出现在选择器列表中。 |
| 保存与保留 | 运行中会话列表依赖正在运行的进程；会话历史本身的保留策略见恢复会话字段。 |
| 适用界面 | CLI：会话选择器、agent view 与 `claude agents --json` 命令输出。 |
| 条件与边界 | 官方 Sessions 文档未描述独立的运行中会话登记表目录；列表内容与范围以选择器和 agent view 的当前行为为准。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Manage sessions](https://code.claude.com/docs/en/sessions) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 官方命令表未列出运行中会话列表；`codex resume` 选择已保存会话 |
| 入口与切换 | `codex resume` 按 ID 继续此前的交互式会话或恢复最近聊天；`codex exec resume [SESSION_ID]`（`--last` 当前目录最近、`--all` 任意目录）恢复非交互会话。 |
| 保存位置 | 本地会话记录位于 `$CODEX_HOME/sessions`，默认是 `~/.codex/sessions`；归档会话单独位于 `$CODEX_HOME/archived_sessions`。 |
| 具体行为 | 命令表中的会话入口面向已保存会话记录；`/archive` 把当前会话从活动会话列表移除并退出，但不删除转录；`codex cloud list` 列出最近云端聊天。 |
| 状态范围 | 列表对象是已保存会话与云端聊天，不是本机正在运行的 CLI 进程。 |
| 自动行为 | 官方文档未列出运行中会话的自动登记机制。 |
| 保存与保留 | 会话记录保存在 Codex Home；`/archive` 只改列表归属，不删除转录。 |
| 适用界面 | CLI 与 `codex exec`；云端聊天由 `codex cloud list` 单独列出。 |
| 条件与边界 | 官方命令表未列出查看运行中会话的命令；不据此推断底层能力不存在。 |
| 证据状态 | 未确认 |
| 来源 | [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `qwen sessions ps` · `--json` JSON Lines（v0.21.14 起） |
| 入口与切换 | `qwen sessions ps` 列出本机当前运行中的交互式 Qwen Code 会话；`--json`（boolean，默认 `false`）改为 JSON Lines 输出。 |
| 保存位置 | 实时进程登记表位于 `~/.qwen/sessions/`（随 `QWEN_HOME` 重定向解析），目录权限 0700；记录文件命名 `<pid>.json`、权限 0600，以 `noFollow` 写入防止符号链接重定向；原子写入产生的临时文件超过 5 分钟按孤儿清理。 |
| 具体行为 | 交互式会话启动时注册、退出时注销；默认输出 NAME、PID、AGE、DIRECTORY 四列表格，无运行中会话时输出 `No other interactive Qwen Code sessions are running.`，人类可读输出净化终端控制字符。`--json` 每行输出一个 JSON 对象（字段 `schemaVersion`、`pid`、`procStart`、`pidNs`、`sessionId`、`cwd`、`name`、`startedAt`、`qwenVersion`），为未经终端净化的原始数据，stdout 不输出其他内容，可安全接 `jq`。 |
| 状态范围 | 列出本机全部运行中的交互式会话；Headless（`qwen -p`）会话不注册、不显示（“Interactive” 是注册事实而非过滤条件）。`qwen sessions list` 是列出已保存历史会话的兄弟命令（`--json`、`--limit` 默认 20），不属于本字段。 |
| 自动行为 | 登记表随会话启动、退出自动写入与移除；`/clear`、`/cd` 等变化经 `patchSessionRecord` 更新记录且不改动身份字段；列表时发现进程已死或身份令牌不匹配的记录随即清除，清除前重新读取记录以防竞态。 |
| 保存与保留 | 登记记录是运行状态而非对话历史；会话历史仍保存在项目会话目录。 |
| 适用界面 | CLI 子命令。v0.21.14 同时为 Daemon 增加受信任的 `GET /workspaces/:workspace/sessions/live-state` 内存快照与目录版本令牌（PR #9261），Web Shell 改为消费该端点轮询会话活动状态（PR #9366）。 |
| 条件与边界 | Linux 以 `/proc` 读取 `<boot_id>:<starttime>` 进程身份令牌与 PID 命名空间 inode，二者不可读时拒绝注册；boot ID 或命名空间不匹配的记录不列出也不清除；schema 校验失败、更高 schemaVersion 或外部身份的记录跳过但不清除；非 Linux 平台 `procStart`/`pidNs` 为 `null`，退化为基础 PID 存活检查。PR #8969（合并提交 `a1e046eb6c55`）2026-08-17 合入 main，随 v0.21.14 发布。 |
| 证据状态 | 官方确认 |
| 来源 | [Qwen Code sessions command documentation (sessions ps)](https://github.com/QwenLM/qwen-code/blob/a1e046eb6c5546e6aab2a004367e67c2af1673fd/docs/users/features/commands.md)、[Qwen Code live-session registry commit](https://github.com/QwenLM/qwen-code/commit/a1e046eb6c5546e6aab2a004367e67c2af1673fd)、[Qwen Code sessions ps command source](https://github.com/QwenLM/qwen-code/blob/a1e046eb6c5546e6aab2a004367e67c2af1673fd/packages/cli/src/commands/sessions/ps.ts)、[Qwen Code session registry source](https://github.com/QwenLM/qwen-code/blob/a1e046eb6c5546e6aab2a004367e67c2af1673fd/packages/core/src/services/session-registry.ts)、[Qwen Code v0.21.14 release notes](https://github.com/QwenLM/qwen-code/releases/tag/v0.21.14) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/sessions` 仅列出已保存历史会话；官方文档未列出运行中会话入口 |
| 入口与切换 | `/sessions`（别名 `/resume`）浏览并恢复历史会话；`kimi --session` 在启动时交互式浏览历史会话并选择。 |
| 保存位置 | 会话位于 `$KIMI_CODE_HOME/sessions/<workDirKey>/<sessionId>/`，默认数据根为 `~/.kimi-code`；元数据在 `state.json`，消息和工具事件在 `agents/*/wire.jsonl`。 |
| 具体行为 | 列表对象是已保存的历史会话；官方会话文档未提供查看运行中会话的入口。 |
| 状态范围 | 历史会话按工作目录分组保存；`/sessions` 在当前数据目录内的历史会话中浏览。 |
| 自动行为 | 官方文档未列出运行中会话的自动登记机制。 |
| 保存与保留 | 会话保存在 `KIMI_CODE_HOME`；本字段不涉及其保留策略。 |
| 适用界面 | 交互式 TUI 与 CLI 启动参数。 |
| 条件与边界 | 官方文档未列出运行中会话查看；不据此推断底层能力不存在。 |
| 证据状态 | 未确认 |
| 来源 | [Kimi Code current sessions](https://github.com/MoonshotAI/kimi-code/blob/6b72345f8bb03487e3bcc05b541e65484818428c/docs/zh/guides/sessions.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/resume` 恢复历史会话；官方命令表未列出运行中会话列表 |
| 入口与切换 | `/resume` 恢复历史会话；`/continue` 恢复当前项目最近会话。 |
| 保存位置 | 公开 TUI 文档未列出固定的会话存储目录；SDK 消息与 Hook 上下文提供 `session_id` 和 `transcript_path`。 |
| 具体行为 | 会话入口面向历史记录；命令表未列出查看运行中会话的命令。 |
| 状态范围 | `/resume` 从历史记录选择；`/continue` 作用于当前项目最近会话。 |
| 自动行为 | 官方文档未列出运行中会话的自动登记机制。 |
| 保存与保留 | 公开 TUI 文档未列出固定的会话存储目录；运行中会话列表未公开。 |
| 适用界面 | TUI。 |
| 条件与边界 | 官方命令表未列出运行中会话查看；不据此推断底层能力不存在。 |
| 证据状态 | 未确认 |
| 来源 | [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference) |

## 官方来源

- [Claude Code Manage sessions](https://code.claude.com/docs/en/sessions)
- [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)
- [Qwen Code sessions command documentation (sessions ps)](https://github.com/QwenLM/qwen-code/blob/a1e046eb6c5546e6aab2a004367e67c2af1673fd/docs/users/features/commands.md)
- [Qwen Code live-session registry commit](https://github.com/QwenLM/qwen-code/commit/a1e046eb6c5546e6aab2a004367e67c2af1673fd)
- [Qwen Code sessions ps command source](https://github.com/QwenLM/qwen-code/blob/a1e046eb6c5546e6aab2a004367e67c2af1673fd/packages/cli/src/commands/sessions/ps.ts)
- [Qwen Code session registry source](https://github.com/QwenLM/qwen-code/blob/a1e046eb6c5546e6aab2a004367e67c2af1673fd/packages/core/src/services/session-registry.ts)
- [Qwen Code v0.21.14 release notes](https://github.com/QwenLM/qwen-code/releases/tag/v0.21.14)
- [Kimi Code current sessions](https://github.com/MoonshotAI/kimi-code/blob/6b72345f8bb03487e3bcc05b541e65484818428c/docs/zh/guides/sessions.md)
- [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference)

## 关联能力

- [恢复会话](./session-resume.md)
- [会话命名](./session-naming.md)
- [跨会话消息](./session-messaging.md)

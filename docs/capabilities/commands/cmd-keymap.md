# TUI 快捷键自定义

[返回 Slash 命令详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=cmd-keymap)

> 核对日期：2026-08-17

## 定义

在终端交互界面中重新映射或自定义键盘快捷键，包括绑定文件、配置键、作用上下文和连续按键组合。

## 命令对照

| 产品 | 命令摘要 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/keybindings` | 官方确认 |
| Codex | `/keymap` | 官方确认 |
| Qwen Code | 无对应命令 | 未确认 |
| Kimi Code | 无对应命令 | 未确认 |
| Qoder CLI | 无对应命令 | 未确认 |

## 比较边界

### 本页包含

- 快捷键重映射入口
- 绑定文件与配置键
- 上下文与动作格式
- 连续按键 chord

### 本页不包含

- Vim 模式切换本身
- 固定内置快捷键的完整清单
- IDE 或桌面端快捷键

## 跨产品事实

1. Claude Code 与 Codex 提供逐项快捷键自定义；Qwen Code、Kimi Code 与 Qoder CLI 当前官方文档未列出同类入口。
2. Claude Code 通过 `~/.claude/keybindings.json` 绑定，支持空格分隔的 chord（如 `ctrl+k ctrl+s`），修改后自动生效。
3. Codex 在 2026-08-01 的官方仓库提交中为 `tui.keymap` 增加双键 chord（如 `ctrl-x ctrl-s`）支持，官方配置文档尚未记录 chord 语法。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/keybindings` |
| 别名 | 无公开别名 |
| 参数 | 绑定文件为 `bindings` 数组，每项含 `context` 与 `namespace:action` 动作映射 |
| 执行行为 | 打开或创建 `~/.claude/keybindings.json`；按上下文绑定、改绑快捷键，或把动作设为 `null` 解绑默认快捷键。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 写入 `~/.claude/keybindings.json`；修改自动检测生效，无需重启 |
| 条件与边界 | 上下文包括 `Global`、`Chat`、`Autocomplete` 等；chord 用空格分隔连续按键；`Ctrl+C`、`Ctrl+D`、`Ctrl+M` 与 Caps Lock 保留不可重绑；Vim 模式按键不经此文件重映射，需用 `vimInsertModeRemaps` |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Commands](https://code.claude.com/docs/en/commands)、[Claude Code keybindings](https://code.claude.com/docs/en/keybindings) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/keymap` |
| 别名 | 无公开别名 |
| 参数 | `tui.keymap.<context>.<action>`；context 包括 `global`、`chat`、`composer`、`editor`、`vim_normal`、`pager`、`list`、`approval` 等；空数组解绑 |
| 执行行为 | 重映射 TUI 快捷键并持久化到 `config.toml`；可捕获、添加、替换和查看绑定，包括双键 chord。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 写入 `config.toml` |
| 条件与边界 | 双键 chord（如 `ctrl-x ctrl-s`）最多两键；待命中 chord 在页脚提示，`esc`、上下文切换或 1 秒超时后取消；与已启用单键绑定、跨上下文 chord 或保留终端快捷键冲突时拒绝；chord 行为来自官方仓库提交，官方配置文档尚未记录 |
| 证据状态 | 官方确认 |
| 来源 | [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)、[Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)、[Codex TUI two-stroke key chords](https://github.com/openai/codex/commit/1e85ca099e4265bf89f4016772d299816e231bb3) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | 无对应命令 |
| 别名 | 无公开别名 |
| 参数 | — |
| 执行行为 | 官方设置与命令文档未列出逐项快捷键自定义；只提供 `/vim` 开关与 `general.vimMode`（默认 `false`）启用 Vim 按键。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | — |
| 条件与边界 | 固定快捷键以官方文档内说明为准；不据此推断底层能力不存在 |
| 证据状态 | 未确认 |
| 来源 | [Qwen Code current settings](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/configuration/settings.md)、[Qwen Code current custom commands](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/commands.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | 无对应命令 |
| 别名 | 无公开别名 |
| 参数 | — |
| 执行行为 | 官方命令目录与配置文档未列出快捷键自定义入口；`tui.toml` 仅覆盖主题、粘贴、通知等界面偏好。 |
| 可用模式 | — |
| 保存范围 | — |
| 条件与边界 | 固定快捷键以官方文档内说明为准；不据此推断底层能力不存在 |
| 证据状态 | 未确认 |
| 来源 | [Kimi Code current slash commands](https://github.com/MoonshotAI/kimi-code/blob/7c919f0376c0331d0d057ef3643c7adcc2c55802/docs/zh/reference/slash-commands.md)、[Kimi Code current configuration](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/configuration/config-files.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 主命令 | 无对应命令 |
| 别名 | 无公开别名 |
| 参数 | — |
| 执行行为 | 官方文档未列出逐项快捷键自定义；只提供 `/vim` 切换 Vim 编辑模式。 |
| 可用模式 | TUI |
| 保存范围 | — |
| 条件与边界 | 固定快捷键以官方文档内说明为准；不据此推断底层能力不存在 |
| 证据状态 | 未确认 |
| 来源 | [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference)、[Qoder CLI usage and worktrees](https://docs.qoder.com/en/cli/using-cli) |

## 官方来源

- [Claude Code Commands](https://code.claude.com/docs/en/commands)
- [Claude Code keybindings](https://code.claude.com/docs/en/keybindings)
- [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)
- [Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)
- [Codex TUI two-stroke key chords](https://github.com/openai/codex/commit/1e85ca099e4265bf89f4016772d299816e231bb3)
- [Qwen Code current settings](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/configuration/settings.md)
- [Qwen Code current custom commands](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/commands.md)
- [Kimi Code current slash commands](https://github.com/MoonshotAI/kimi-code/blob/7c919f0376c0331d0d057ef3643c7adcc2c55802/docs/zh/reference/slash-commands.md)
- [Kimi Code current configuration](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/configuration/config-files.md)
- [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference)
- [Qoder CLI usage and worktrees](https://docs.qoder.com/en/cli/using-cli)

## 关联能力

- [配置](./cmd-config.md)
- [Hooks](./cmd-hooks.md)
- [状态与用量](./cmd-status.md)

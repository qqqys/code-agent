# 选择模型

[返回 Slash 命令详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=cmd-model)

> 核对日期：2026-08-19

## 定义

在当前会话中查看或切换主模型；部分产品同时允许设置默认模型、辅助模型或执行一次性跨模型提示。

## 命令对照

| 产品 | 命令摘要 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/model [model]` | 官方确认 |
| Codex | `/model` | 官方确认 |
| Qwen Code | `/model` | 源码确认 |
| Kimi Code | `/model`、`/secondary-model` | 官方确认 |
| Qoder CLI | `/model` | 官方确认 |

## 比较边界

### 本页包含

- 当前会话模型切换
- 模型选择器
- 模型设置是否跨会话保存
- 辅助模型入口

### 本页不包含

- Provider 认证
- 模型价格和质量评价
- Subagent 独立模型配置

## 跨产品事实

1. 五家 CLI 都提供 `/model`。
2. Claude Code 的模型选择默认只作用于当前会话；在选择器按 `d` 才会保存用户默认值。
3. Qwen Code 的 `/model` 同时覆盖 fast、voice、vision、image 模型，并支持项目级或用户级持久化。
4. Kimi Code 0.36.0（2026-08-13 发布）起 `/secondary_model` 改名为 `/secondary-model` 并新增别名 `/subagent-model`，用于配置 Subagent 模型池。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/model [model]` |
| 别名 | 无公开别名 |
| 参数 | `[model]`；选择器中的 `d` 保存用户默认值 |
| 执行行为 | 不带参数打开模型选择器；带模型参数直接切换。支持模型可同时调整 effort。 |
| 可用模式 | 交互式；`-p` 中可带模型参数 |
| 保存范围 | 默认只切换当前会话；按 `d` 保存用户默认值；`-p` 不改默认值 |
| 条件与边界 | 切换已有对话的模型时会提示确认，因为下一次响应需重新读取历史 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Commands](https://code.claude.com/docs/en/commands) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/model` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 打开模型选择器，并在模型支持时同时选择 reasoning effort。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 作用于当前会话；具体默认值由配置文件决定 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 官方确认 |
| 来源 | [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/model` |
| 别名 | 无公开别名 |
| 参数 | `[--fast\|--voice\|--vision\|--image] [--project\|--global] [model-id]`；支持 `model-id prompt` |
| 执行行为 | 切换主模型，或管理 fast、voice、vision、image 等专用模型。也能用其他模型执行一次性提示。 |
| 可用模式 | 交互式、非交互式、ACP |
| 保存范围 | `--project` 写项目设置，`--global` 写用户设置；未指定时为当前会话 |
| 条件与边界 | 一次性提示中的文本原样发送，不做 `@file` 展开 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code commands documentation](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/commands.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/model`、`/secondary-model` |
| 别名 | `/subagent-model` |
| 参数 | `/secondary-model` 写入 `[secondary_model] default_model` |
| 执行行为 | 切换当前会话使用的 LLM 模型；`/secondary-model` 打开模型选择器，选择子 Agent 的默认模型并写入 `[secondary_model] default_model`，已有 `[secondary_model.models]` 表时会把所选别名补入池中（保留别名 `primary` 会被拒绝）。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | `/model` 作用于当前会话；`/secondary-model` 写入 config.toml，对下一次子 Agent 派生生效，无需重启会话 |
| 条件与边界 | `/secondary-model` 仅在 `secondary-model` 实验功能启用时可见（`KIMI_CODE_EXPERIMENTAL_SECONDARY_MODEL=1` 或 master flag `KIMI_CODE_EXPERIMENTAL_FLAG=1`）；0.36.0 起由 `/secondary_model` 改名 |
| 证据状态 | 官方确认 |
| 来源 | [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860/docs/zh/reference/slash-commands.md)、[Kimi Code subagent model pool commit](https://github.com/MoonshotAI/kimi-code/commit/c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860)、[Kimi Code 0.36.0 release notes](https://github.com/MoonshotAI/kimi-code/releases/tag/%40moonshot-ai/kimi-code%400.36.0) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/model` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 打开模型级别和模型设置管理界面。 |
| 可用模式 | TUI |
| 保存范围 | 由模型设置界面决定 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference) |

## 官方来源

- [Claude Code Commands](https://code.claude.com/docs/en/commands)
- [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)
- [Qwen Code commands documentation](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/commands.md)
- [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860/docs/zh/reference/slash-commands.md)
- [Kimi Code subagent model pool commit](https://github.com/MoonshotAI/kimi-code/commit/c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860)
- [Kimi Code 0.36.0 release notes](https://github.com/MoonshotAI/kimi-code/releases/tag/%40moonshot-ai/kimi-code%400.36.0)
- [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference)

## 关联能力

- [推理强度](./cmd-effort.md)
- [登录账号](./cmd-login.md)
- [状态与用量](./cmd-status.md)

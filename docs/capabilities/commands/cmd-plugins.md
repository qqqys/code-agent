# 插件或扩展

[返回 Slash 命令详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=cmd-plugins)

> 核对日期：2026-08-07

## 定义

浏览、安装、启用、禁用或重新加载可分发的插件、扩展和应用连接。

## 命令对照

| 产品 | 命令摘要 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/plugin [subcommand]`、`/reload-plugins [--force]` | 官方确认 |
| Codex | `/plugins`、`/apps` | 官方确认 |
| Qwen Code | `/extensions`、`/extension-creator`、`/reload-plugins` | 源码确认 |
| Kimi Code | `/plugins` | 官方确认 |
| Qoder CLI | 无对应命令 | 未确认 |

## 比较边界

### 本页包含

- 插件菜单
- 安装与启停
- 热重载
- 应用连接入口

### 本页不包含

- MCP Server 单独配置
- Skill 单文件
- IDE 插件安装器

## 跨产品事实

1. Claude Code、Codex、Qwen Code 和 Kimi Code 都有插件或扩展入口。
2. Codex 把应用连接 `/apps` 和插件 `/plugins` 分开。
3. Qoder CLI 有插件文档，但当前命令表没有独立插件管理命令。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/plugin [subcommand]`、`/reload-plugins [--force]` |
| 别名 | 无公开别名 |
| 参数 | `list\|install\|enable\|disable`；reload 支持 `--force` |
| 执行行为 | 打开插件菜单，或执行 list、install、enable、disable；重载活动插件。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 插件安装和启用状态跨会话生效 |
| 条件与边界 | 重载若会改变 MCP 工具并使 prompt cache 失效，会要求 `--force` |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Commands](https://code.claude.com/docs/en/commands) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/plugins`、`/apps` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 浏览可用插件；浏览应用连接并以 `$app-slug` 插入提示。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 安装和可用性设置跨会话生效 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 官方确认 |
| 来源 | [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/extensions`、`/extension-creator`、`/reload-plugins` |
| 别名 | 无公开别名 |
| 参数 | `/extensions explore\|manage\|list\|install`；`/extension-creator <extension-path> [template]` |
| 执行行为 | `/extensions` 管理已安装扩展；`/extension-creator` 是随产品提供的 Skill，负责创建、校验和本地测试扩展；`/reload-plugins` 重载扩展组件。 |
| 可用模式 | 硬编码管理命令按各自模式；`/extension-creator` 支持交互式、非交互式和 ACP |
| 保存范围 | 扩展安装状态跨会话生效 |
| 条件与边界 | `/extension-creator` 在 bare mode 或被 Skill/Slash 禁用时不可用 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code commands documentation](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/commands.md)、[Qwen Code bundled Skill loader](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/packages/cli/src/services/BundledSkillLoader.ts) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/plugins` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 打开插件管理入口。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 仅影响当前会话或当前操作 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 官方确认 |
| 来源 | [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/7c919f0376c0331d0d057ef3643c7adcc2c55802/docs/zh/reference/slash-commands.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 主命令 | 无对应命令 |
| 别名 | 无公开别名 |
| 参数 | — |
| 执行行为 | 官方文档包含插件系统，但当前 Slash 命令目录未列出独立插件管理命令。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | — |
| 条件与边界 | 不据此推断底层能力不存在 |
| 证据状态 | 未确认 |
| 来源 | [Qoder CLI commands](https://docs.qoder.com/en/cli/command) |

## 官方来源

- [Claude Code Commands](https://code.claude.com/docs/en/commands)
- [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)
- [Qwen Code commands documentation](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/commands.md)
- [Qwen Code bundled Skill loader](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/packages/cli/src/services/BundledSkillLoader.ts)
- [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/7c919f0376c0331d0d057ef3643c7adcc2c55802/docs/zh/reference/slash-commands.md)
- [Qoder CLI commands](https://docs.qoder.com/en/cli/command)

## 关联能力

- [Skills](./cmd-skills.md)
- [Hooks](./cmd-hooks.md)
- [MCP](./cmd-mcp.md)

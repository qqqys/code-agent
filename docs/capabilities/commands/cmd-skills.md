# Skills

[返回 Slash 命令详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=cmd-skills)

> 核对日期：2026-08-13

## 定义

列出、筛选、启用或调用以 Markdown 指令和资源组成的 Agent Skill。

## 命令对照

| 产品 | 命令摘要 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/skills`、`/reload-skills` | 官方确认 |
| Codex | `/skills` | 官方确认 |
| Qwen Code | `/skills`、`/<skill-name>` | 源码确认 |
| Kimi Code | `/<skill-name>` | 条件项 |
| Qoder CLI | `/skills` | 官方确认 |

## 比较边界

### 本页包含

- Skill 列表
- Skill 可见性
- 热重载
- 作为 Slash 命令调用

### 本页不包含

- Subagent 定义
- 插件包完整管理
- 自定义命令的所有格式

## 跨产品事实

1. 五家都支持 Skill 或 Skill 命令。
2. Claude Code `/skills` 可以按 token 数排序并控制 Skill 是否对模型和命令菜单可见。
3. Qwen Code `/skills` 打开浏览、搜索、开关和选择面板；具体 Skill 通过 `/<skill-name>` 直接调用。
4. 当前源码随产品提供 9 个 Skill 命令：`/batch`、`/dataviz`、`/extension-creator`、`/loop`、`/new-app`、`/qc-helper`、`/review`、`/simplify`、`/stuck`；其中 `/loop` 只在 Cron 开启时出现。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/skills`、`/reload-skills` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 浏览和筛选 Skills，调整可见性；重扫磁盘上的 Skill 目录。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 可见性设置和 Skill 文件跨会话生效 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Commands](https://code.claude.com/docs/en/commands) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/skills` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 浏览并选择本地 Skill。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | Skill 文件跨会话存在 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 官方确认 |
| 来源 | [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/skills`、`/<skill-name>` |
| 别名 | 无公开别名 |
| 参数 | `/skills` 不接收参数；具体 Skill 的参数由其 `argument-hint` 和正文定义 |
| 执行行为 | `/skills` 打开管理面板；随产品提供的 Skill，以及用户、项目和扩展 Skill，都可按名称注册为 Slash 命令。Skill 命令把 Skill 正文提交给模型，并应用 Skill 声明的工具权限。 |
| 可用模式 | `/skills`：交互式、ACP；`/<skill-name>`：交互式、非交互式、ACP |
| 保存范围 | Skill 文件和启用状态跨会话生效 |
| 条件与边界 | bare mode 不加载 Skill 命令；`skills.disabled` 可按名称停用；`user-invocable: false` 的 Skill 不进入用户命令表 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code commands documentation](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/commands.md)、[Qwen Code bundled Skill loader](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/packages/cli/src/services/BundledSkillLoader.ts)、[Qwen Code user, project and extension Skill loader](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/packages/cli/src/services/SkillCommandLoader.ts)、[Qwen Code command mode filter](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/packages/cli/src/services/commandUtils.ts) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/<skill-name>` |
| 别名 | 无公开别名 |
| 参数 | 由各 Skill 定义 |
| 执行行为 | Skills 作为命令出现在命令补全中；官方命令表也列出多个内置 Skill 命令。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | Skill 文件跨会话存在 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 条件项 |
| 来源 | [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860/docs/zh/reference/slash-commands.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/skills` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 管理当前工作区的 Skill 命令。 |
| 可用模式 | TUI |
| 保存范围 | 项目或用户 Skill 跨会话存在 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI commands](https://docs.qoder.com/en/cli/command) |

## 官方来源

- [Claude Code Commands](https://code.claude.com/docs/en/commands)
- [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)
- [Qwen Code commands documentation](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/commands.md)
- [Qwen Code bundled Skill loader](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/packages/cli/src/services/BundledSkillLoader.ts)
- [Qwen Code user, project and extension Skill loader](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/packages/cli/src/services/SkillCommandLoader.ts)
- [Qwen Code command mode filter](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/packages/cli/src/services/commandUtils.ts)
- [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860/docs/zh/reference/slash-commands.md)
- [Qoder CLI commands](https://docs.qoder.com/en/cli/command)

## 关联能力

- [自定义命令](./cmd-custom.md)
- [插件或扩展](./cmd-plugins.md)
- [记忆管理](./cmd-memory.md)

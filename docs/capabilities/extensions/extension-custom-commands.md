# 自定义 Slash 命令

[返回扩展系统详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=extension-custom-commands)

> 核对日期：2026-08-23

## 定义

把提示模板保存成可输入的 Slash 命令，并区分独立 Command 文件、Skills、Plugin Commands 与已弃用机制。

## 扩展结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `.claude/commands/*.md` · Skills | 官方确认 |
| Codex | Skills；`/prompts:*` 已弃用 | 条件项 |
| Qwen Code | `.qwen/commands/*.md` · Skills | 源码确认 |
| Kimi Code | Plugin `commands/*.md` · Skills | 官方确认 |
| Qoder CLI | `.qoder/commands/*.md` | 官方确认 |

## 比较边界

### 本页包含

- Markdown Prompt Command 的目录与命名
- 参数、命名空间和加载优先级
- 与 Skills 或 Plugin Commands 的关系

### 本页不包含

- 产品内置 Slash 命令
- MCP Server 动态暴露的 Prompt
- 只通过自然语言自动触发、没有命令入口的 Skill

## 跨产品事实

1. Claude Code、Qwen Code 和 Qoder CLI 都保留独立 Markdown Command 目录；Kimi Code 当前只文档化 Plugin Commands 与 Skills。
2. Codex 的 `~/.codex/prompts` 自定义 Prompt 已弃用且只在本机使用，官方建议把可复用内容迁到 Skills。
3. 同样显示为 `/name` 的入口可能来自内置命令、Skill、Prompt Command、Plugin 或 MCP Prompt，矩阵只比较其公开加载机制。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `.claude/commands/*.md` · Skills |
| 入口与配置 | `.claude/commands/deploy.md` 生成 `/deploy`；Skills 也能生成同名 Slash 入口。 |
| 文件与目录 | 项目 `.claude/commands/*.md` 与用户 `~/.claude/commands/*.md`；Plugin 可携带 `commands/`。 |
| 具体行为 | Markdown 正文作为提示模板加载，目录层级形成命名空间；参数可插入提示内容。 |
| 作用域与优先级 | 项目、用户和 Plugin；项目命令可随仓库共享。 |
| 扩展构成 | Markdown Prompt、前置配置和参数占位；复杂工作流可迁移为带辅助文件的 Skill。 |
| 加载与刷新 | 旧式 Commands 与 Skills 会合并进入 Slash 菜单；运行时 Skill 变更可被检测。 |
| 适用界面 | 以 Claude Code CLI 为准；VS Code 扩展、桌面端或 Headless 中不同的入口会单独注明。 |
| 权限与信任 | Command 只是生成提示；提示触发的工具仍受权限规则。 |
| 条件与边界 | `.claude/commands` 仍受支持，但新建复杂可复用能力时官方把 Skills 作为统一机制。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Skills](https://code.claude.com/docs/en/skills) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | Skills；`/prompts:*` 已弃用 |
| 入口与配置 | 推荐通过 Skill 暴露可复用能力；旧 Prompt 使用 `/prompts:<name>`。 |
| 文件与目录 | 旧 Prompt 只从用户目录 `~/.codex/prompts/*.md` 加载；项目不提供同等 Prompt 目录。 |
| 具体行为 | 旧 Prompt 把 Markdown 内容插入对话；Skill 可携带更完整的脚本和资源，并支持显式或自动调用。 |
| 作用域与优先级 | 旧 Prompt 仅本机用户；Skills 可放项目 `.agents/skills` 或用户目录。 |
| 扩展构成 | 旧机制只有 Markdown Prompt；Skills 使用 SKILL.md 与辅助资源。 |
| 加载与刷新 | 旧 Prompt 在客户端发现后以 `/prompts:*` 提供；新内容应使用 Skills。 |
| 适用界面 | 以 Codex CLI 为准；桌面端、IDE 扩展、Cloud 和 `codex exec` 不自动继承全部交互命令。 |
| 权限与信任 | Prompt 或 Skill 都不绕过审批与沙箱。 |
| 条件与边界 | `/prompts:*` 已弃用；不能把它表述成与其他四家同等的现行项目级 Command 系统。 |
| 证据状态 | 条件项 |
| 来源 | [Codex Custom prompts](https://learn.chatgpt.com/docs/custom-prompts)、[Codex Agent Skills](https://learn.chatgpt.com/docs/build-skills) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `.qwen/commands/*.md` · Skills |
| 入口与配置 | `.qwen/commands/review.md` 生成 `/review`；Skills 同样可以注册 Slash 入口。 |
| 文件与目录 | 项目 `.qwen/commands/*.md` 与用户 `~/.qwen/commands/*.md`；Extension 也可携带 Commands。 |
| 具体行为 | Markdown 为推荐格式，TOML 为兼容格式；支持参数与 Shell 占位，嵌套目录转成冒号命名空间。 |
| 作用域与优先级 | 项目命令优先于同名用户命令；Extension 命令进入统一命令注册表。 |
| 扩展构成 | Markdown/TOML Prompt、参数占位、Shell 结果插值；复杂资源可用 Skill。 |
| 加载与刷新 | 文件加载器扫描用户和项目目录，Extension manager 注册扩展命令。 |
| 适用界面 | 以 Qwen Code CLI 为准；Headless、ACP 和 IDE Companion 中不同的加载行为会单独注明。 |
| 权限与信任 | 命令模板可插入 Shell 结果，实际执行仍受环境与工具权限控制。 |
| 条件与边界 | 保存的 Workflow 是另一套运行记录机制，不应在矩阵中当成自定义 Command 的同义词。 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code current custom commands](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/commands.md)、[Qwen Code current Extension runtime](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/core/src/extension/extensionManager.ts) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | Plugin `commands/*.md` · Skills |
| 入口与配置 | Plugin 的 `commands/deploy.md` 以 `/<plugin>:deploy` 调用；Skills 使用 `/skill:<name>`。 |
| 文件与目录 | 当前文档列出 Plugin `commands/*.md` 和各级 Skill 目录，没有独立 `.kimi-code/commands` 目录。 |
| 具体行为 | Plugin Command 将 Markdown 作为提示模板，并用 `$ARGUMENTS` 接收调用参数。 |
| 作用域与优先级 | Plugin Command 随用户安装的 Plugin 生效；Skills 可来自项目、用户、额外目录或内置来源。 |
| 扩展构成 | Plugin Markdown Command，或带 SKILL.md 和辅助文件的 Skill。 |
| 加载与刷新 | 随 Plugin 加载；修改后使用 `/reload` 或新会话。 |
| 适用界面 | 以 Kimi Code CLI 为准；ACP、Web UI 和外部编辑器只在对应能力中单独列出。 |
| 权限与信任 | 命令产生的操作继续受 Kimi 工具权限约束。 |
| 条件与边界 | 未发现公开的独立用户/项目 Command 目录；不要根据 `.kimi-code/skills` 推断 `.kimi-code/commands`。 |
| 证据状态 | 官方确认 |
| 来源 | [Kimi Code current Plugins](https://github.com/MoonshotAI/kimi-code/blob/691ec4679ea1/docs/zh/customization/plugins.md)、[Kimi Code current Skills](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/customization/skills.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `.qoder/commands/*.md` |
| 入口与配置 | `/commands` 查看自定义命令；Markdown 文件名形成 Slash 命令名。 |
| 文件与目录 | 项目 `.qoder/commands/*.md` 与用户 `~/.qoder/commands/*.md`；Plugin 也可携带 Commands。 |
| 具体行为 | Markdown 正文作为 Prompt Command，可在 TUI 与 Headless 中调用。 |
| 作用域与优先级 | 项目与用户目录按优先级合并；Plugin 命令随其 scope 加载。 |
| 扩展构成 | Markdown Prompt Command；需要脚本和资源时可改用 Skill 或 Plugin。 |
| 加载与刷新 | 启动时扫描目录；Plugin Commands 可随 `/plugins reload` 刷新。 |
| 适用界面 | 以 Qoder CLI 为准；Agent SDK、ACP 和 Qoder IDE 中不同的入口会单独注明。 |
| 权限与信任 | Headless 或 TUI 中执行命令后，工具仍经过对应权限模式。 |
| 条件与边界 | Prompt Command 的 Headless 可用性不代表所有内置交互命令都能在 Headless 中运行。 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference)、[Qoder CLI Plugins](https://docs.qoder.com/en/cli/plugins) |

## 官方来源

- [Claude Code Skills](https://code.claude.com/docs/en/skills)
- [Codex Custom prompts](https://learn.chatgpt.com/docs/custom-prompts)
- [Codex Agent Skills](https://learn.chatgpt.com/docs/build-skills)
- [Qwen Code current custom commands](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/commands.md)
- [Qwen Code current Extension runtime](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/core/src/extension/extensionManager.ts)
- [Kimi Code current Plugins](https://github.com/MoonshotAI/kimi-code/blob/691ec4679ea1/docs/zh/customization/plugins.md)
- [Kimi Code current Skills](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/customization/skills.md)
- [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference)
- [Qoder CLI Plugins](https://docs.qoder.com/en/cli/plugins)

## 关联能力

- [Agent Skills](./extension-skills.md)
- [插件分发](./extension-plugins.md)
- [输出风格](./extension-output-styles.md)
- [代码审查](../commands/cmd-review.md)

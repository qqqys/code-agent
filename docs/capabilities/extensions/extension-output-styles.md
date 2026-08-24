# 输出风格

[返回扩展系统详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=extension-output-styles)

> 核对日期：2026-08-24

## 定义

向系统提示词追加预设或自定义 Markdown 指令，改变回复的角色、语气、冗长度或结构；不改变知识库、工具或权限边界。

## 扩展结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/config` Output style · `outputStyle` · `.claude/output-styles/` 自定义 · v2.1.237 新增内置 Concise | 官方确认 |
| Codex | 条件：`personality`（`none`/`friendly`/`pragmatic`）· `/personality`；仅适用宣告 `supportsPersonality` 的模型 | 条件项 |
| Qwen Code | 官方设置与扩展文档未列出输出风格 | 未确认 |
| Kimi Code | 官方配置文档未列出输出风格；`[identity]` 仅改自称与协议标识 | 未确认 |
| Qoder CLI | `outputStyle` · `--output-style` · `~/.qoder/output-styles/` 自定义 · 插件风格 | 官方确认 |

## 比较边界

### 本页包含

- 内置风格与选择入口
- 自定义风格文件目录与 frontmatter
- 插件携带风格与强制应用
- 选择的保存位置与生效时机

### 本页不包含

- 模型或推理强度选择
- 项目指令文件（CLAUDE.md、AGENTS.md、QWEN.md）
- Agent 定义中的 systemPrompt
- 主题与配色

## 跨产品事实

1. Claude Code 与 Qoder CLI 都把输出风格实现为向系统提示词追加指令的预设，支持用户级与项目级自定义 Markdown 风格，并可由插件携带；两家都有插件强制风格覆盖用户选择的机制。
2. 生效时机不同：Claude Code 选择后需 `/clear` 或新会话（系统提示词只在会话启动时读取一次）；Qoder CLI 修改 `outputStyle` 配置项需重启 CLI，`--output-style` 命令行参数则对当前会话立即生效。
3. Codex 没有自定义风格文件机制，相近能力是 `personality` 沟通风格（`none`/`friendly`/`pragmatic`），仅对宣告 `supportsPersonality` 的模型生效，`/personality` 可按线程或单轮覆盖。
4. Qwen Code 官方设置文档与扩展组件清单均未列出输出风格；Kimi Code `config.toml` 无风格、语气或 persona 配置键，`[identity]` 只改系统提示词自称与协议字段机器标识。
5. Claude Code 自 v2.1.237 起新增内置 Concise 风格（先给结果、省略铺垫与过程叙述）；Qoder CLI 官方示例取值也有 `concise`，两者为各自独立的实现。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/config` Output style · `outputStyle` · `.claude/output-styles/` 自定义 · v2.1.237 新增内置 Concise |
| 入口与配置 | CLI 运行 `/config` 选择 Output style；桌面 App 中 `/config` 打开 Settings > Claude Code，需在设置文件中手动写字段；也可直接在任意设置 JSON 中设置 `"outputStyle"`。独立 `/output-style` 命令自 v2.1.73 弃用、v2.1.91 移除。 |
| 文件与目录 | 自定义风格为 Markdown 文件：用户级 `~/.claude/output-styles`、项目级 `.claude/output-styles`、受管策略目录的 `.claude/output-styles`、插件包内 `output-styles/`。项目风格自工作目录至仓库根之间的每个 `.claude/output-styles/` 都加载，重名取最接近工作目录的文件。 |
| 具体行为 | 风格通过修改系统提示词定义角色、语气与输出格式，不改变知识库。内置风格：Default、Proactive、Explanatory、Learning；v2.1.237 新增内置 Concise——回答先给结果、省略铺垫与过程叙述，工作深度不变。自定义风格可选保留内置软件工程指令。 |
| 作用域与优先级 | 选择保存在设置文件：`/config` 菜单选择写入 `.claude/settings.local.json`（本地项目级）；手动编辑可把 `"outputStyle"` 写入任意有效设置文件。 |
| 扩展构成 | 自定义风格 frontmatter：`name`（默认取文件名）、`description`（`/config` 选择器显示）、`keep-coding-instructions`（默认 false，为 true 时保留内置软件工程指令）、`force-for-plugin`（默认 false）。 |
| 加载与刷新 | 系统提示词在会话启动时读取一次，改风格后需 `/clear` 或新会话生效。插件风格 `force-for-plugin: true` 时插件启用即自动应用并覆盖用户 `outputStyle`；多个插件同时强制时最先加载者生效。 |
| 适用界面 | 以 Claude Code CLI 为准；VS Code 扩展、桌面端或 Headless 中不同的入口会单独注明。 |
| 权限与信任 | 风格只改系统提示词，不改权限设置；Proactive 风格自主执行更强，但仍遵守当前权限设置。 |
| 条件与边界 | 官方文档页的内置风格清单尚未列入 Concise；Concise 以 v2.1.237 更新日志为准。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code output styles](https://code.claude.com/docs/en/output-styles)、[Claude Code v2.1.237 changelog (Concise output style)](https://github.com/anthropics/claude-code/blob/770933ea1ad2/CHANGELOG.md) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 条件：`personality`（`none`/`friendly`/`pragmatic`）· `/personality`；仅适用宣告 `supportsPersonality` 的模型 |
| 入口与配置 | `config.toml` 的 `personality` 键或 `/personality` 命令；`features.personality`（布尔，stable，默认开）控制 personality 选择控件是否可用。 |
| 文件与目录 | 用户级 `~/.codex/config.toml`；项目级覆盖 `.codex/config.toml`。 |
| 具体行为 | `personality` 设定默认沟通风格，取值 `none`、`friendly`、`pragmatic`，仅对宣告 `supportsPersonality` 的模型生效。无从目录加载自定义风格文件的机制。 |
| 作用域与优先级 | 配置值按用户或项目作用域持久；`/personality` 覆盖可按线程或单轮生效。 |
| 扩展构成 | 无自定义风格文件与 frontmatter。 |
| 加载与刷新 | `personality` 配置值随 config.toml 生效；`/personality` 覆盖按线程或单轮应用。 |
| 适用界面 | 以 Codex CLI 为准；桌面端、IDE 扩展、Cloud 和 `codex exec` 不自动继承全部交互命令。 |
| 权限与信任 | 不涉及权限变化。 |
| 条件与边界 | 官方配置参考未描述自定义风格目录或插件风格；`developer_instructions`、`model_instructions_file` 与 `model_verbosity` 是指令或参数覆盖，不是风格预设。 |
| 证据状态 | 条件项 |
| 来源 | [Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 官方设置与扩展文档未列出输出风格 |
| 入口与配置 | 官方文档未列出输出风格入口。 |
| 文件与目录 | 官方文档未列出输出风格目录。 |
| 具体行为 | 设置文档无风格、personality 或语气类设置键；`output` 节仅含 `output.format`（`text`/`json`）与 `output.showTimestamps`，属于输出格式与显示项。 |
| 作用域与优先级 | 无输出风格选择与保存位置。 |
| 扩展构成 | 扩展组件为 prompts、MCP servers、subagents、skills、custom commands、channels、上下文文件与设置，不含输出风格。 |
| 加载与刷新 | 无风格加载流程。 |
| 适用界面 | 以 Qwen Code CLI 为准；Headless、ACP 和 IDE Companion 中不同的加载行为会单独注明。 |
| 权限与信任 | 不涉及权限。 |
| 条件与边界 | 当前一手资料不足以确认 Qwen Code 提供输出风格；本页以官方设置文档与扩展文档当前内容为准。 |
| 证据状态 | 未确认 |
| 来源 | [Qwen Code current Settings](https://github.com/QwenLM/qwen-code/blob/081a96d86459b618fdba2d153f784d9226f37d06/docs/users/configuration/settings.md)、[Qwen Code current Extensions introduction](https://github.com/QwenLM/qwen-code/blob/a64d1291d2f6298f67763d0953b1653cf7b34060/docs/users/extension/introduction.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 官方配置文档未列出输出风格；`[identity]` 仅改自称与协议标识 |
| 入口与配置 | 官方配置文档与命令表未列出输出风格入口；`/theme`、`/custom-theme` 为配色主题。 |
| 文件与目录 | 官方文档未列出输出风格目录。 |
| 具体行为 | `config.toml` 无风格、语气或 persona 配置键；最接近的 `[identity]` 中 `name` 设定系统提示词中的自称（填充 `${product_name}` 变量）、`slug` 设定协议字段的机器标识（如 User-Agent 产品名、MCP 客户端名），均不改变回复风格。 |
| 作用域与优先级 | `[identity]` 随配置文件作用域生效。 |
| 扩展构成 | 无自定义风格文件与 frontmatter。 |
| 加载与刷新 | 无风格加载流程。 |
| 适用界面 | 以 Kimi Code CLI 为准；ACP、Web UI 和外部编辑器只在对应能力中单独列出。 |
| 权限与信任 | 不涉及权限。 |
| 条件与边界 | 当前一手资料不足以确认 Kimi Code 提供输出风格；Plugin Agent 的 `systemPrompt` 属于 Agent 定义，不属于本字段。 |
| 证据状态 | 未确认 |
| 来源 | [Kimi Code current config files](https://github.com/MoonshotAI/kimi-code/blob/157c84f5d1b0454c57aa6a54da42d87c32550ae1/docs/zh/configuration/config-files.md)、[Kimi Code current slash commands](https://github.com/MoonshotAI/kimi-code/blob/7c919f0376c0331d0d057ef3643c7adcc2c55802/docs/zh/reference/slash-commands.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `outputStyle` · `--output-style` · `~/.qoder/output-styles/` 自定义 · 插件风格 |
| 入口与配置 | `settings.json` 顶层 `outputStyle` 键（兼容 `general.outputStyle`，两处同时配置时顶层优先）；命令行 `qoder --output-style <name>`。 |
| 文件与目录 | 自定义风格为 `.md` 文件：用户级 `~/.qoder/output-styles/`（全部项目生效）、项目级 `<project>/.qoder/output-styles/`（仅当前项目）。`outputStyle` 设置写在 `~/.qoder/settings.json`（用户）、`<project>/.qoder/settings.json`（项目）或 `<project>/.qoder/settings.local.json`（本地），按内置默认→用户→项目→本地→`--settings` 合并。 |
| 具体行为 | 向系统提示词追加指令，调整回复语气、冗长度与结构；只改表达方式，不改核心身份与安全约束。未设置或设为 default 时使用内置默认表达、不追加风格；官方示例取值为 `concise`，官方文档未给出完整内置风格清单。 |
| 作用域与优先级 | `outputStyle` 配置项按设置文件作用域持久；`--output-style` 仅当前会话生效且优先于配置项。 |
| 扩展构成 | 自定义风格 frontmatter 可选：`name`（默认取去掉 `.md` 的文件名）、`description`（默认取正文第一个非标题行）。 |
| 加载与刷新 | 修改配置中的 `outputStyle` 需重启 CLI 生效；`--output-style` 无需重启立即生效。同名风格按内置→插件→用户级→项目级顺序后者覆盖前者；插件风格以 `plugin-name:style-name` 引用；插件强制风格优先于 `outputStyle` 设置，多个强制风格时第一个生效并记录警告。 |
| 适用界面 | 以 Qoder CLI 为准；Agent SDK、ACP 和 Qoder IDE 中不同的入口会单独注明。 |
| 权限与信任 | 官方文档明确输出风格不改变核心身份与安全约束。 |
| 条件与边界 | 官方文档页未标注输出风格的引入版本；以当前文档站内容为准。 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI Output Style](https://docs.qoder.com/cli/output-styles)、[Qoder CLI Configuration Files and Application Order](https://docs.qoder.com/cli/settings) |

## 官方来源

- [Claude Code output styles](https://code.claude.com/docs/en/output-styles)
- [Claude Code v2.1.237 changelog (Concise output style)](https://github.com/anthropics/claude-code/blob/770933ea1ad2/CHANGELOG.md)
- [Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)
- [Qwen Code current Settings](https://github.com/QwenLM/qwen-code/blob/081a96d86459b618fdba2d153f784d9226f37d06/docs/users/configuration/settings.md)
- [Qwen Code current Extensions introduction](https://github.com/QwenLM/qwen-code/blob/a64d1291d2f6298f67763d0953b1653cf7b34060/docs/users/extension/introduction.md)
- [Kimi Code current config files](https://github.com/MoonshotAI/kimi-code/blob/157c84f5d1b0454c57aa6a54da42d87c32550ae1/docs/zh/configuration/config-files.md)
- [Kimi Code current slash commands](https://github.com/MoonshotAI/kimi-code/blob/7c919f0376c0331d0d057ef3643c7adcc2c55802/docs/zh/reference/slash-commands.md)
- [Qoder CLI Output Style](https://docs.qoder.com/cli/output-styles)
- [Qoder CLI Configuration Files and Application Order](https://docs.qoder.com/cli/settings)

## 关联能力

- [插件分发](./extension-plugins.md)
- [自定义 Slash 命令](./extension-custom-commands.md)
- [项目指令文件](./extension-project-instructions.md)

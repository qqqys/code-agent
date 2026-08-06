# Agent Skills

[返回扩展系统详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=extension-skills)

> 核对日期：2026-08-06

## 定义

以 SKILL.md 为入口，把可复用指令、脚本和参考材料按需加载到 Agent，并比较发现目录、调用方式与优先级。

## 扩展结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/<skill-name>` · `.claude/skills/` | 官方确认 |
| Codex | `$skill` · `.agents/skills/` | 官方确认 |
| Qwen Code | `/<skill-name>` · `.qwen/skills/` · `skills.disabledLevels` | 源码确认 |
| Kimi Code | `/skill:<name>` · `.kimi-code/skills/` | 官方确认 |
| Qoder CLI | `/<skill-name>` · `.qoder/skills/` | 官方确认 |

## 比较边界

### 本页包含

- 用户级、项目级和插件级 Skill 目录
- 显式 Slash 或名称调用与模型自动匹配
- SKILL.md 及同目录脚本、模板、参考资料

### 本页不包含

- 仅有一段提示词的内置 Slash 命令
- 项目长期指令文件
- MCP Server 提供的 Prompt

## 跨产品事实

1. 五家当前都采用包含 `SKILL.md` 的目录结构，并允许把辅助文件与入口指令放在同一 Skill 包内。
2. Codex 使用通用 `.agents/skills` 目录和 `$skill` 显式引用；Kimi Code 的明确命名空间是 `/skill:<name>`；其余三家支持 `/<skill-name>`。
3. Skill 可被模型自动选择不代表一定执行；描述匹配、可用路径、禁用配置和同名优先级都会改变最终加载结果。
4. 禁用粒度不对齐：Qwen Code 用 `skills.disabledLevels` 整体关闭某个发现层级（`project`/`user`/`extension`/`bundled`），Claude Code 用 `disableBundledSkills` 只关内置层并以 `skillOverrides` 逐个控制，Codex 按 `SKILL.md` 路径在 `[[skills.config]]` 逐个禁用，Kimi Code 只在 frontmatter 逐个关闭模型自动调用，Qoder CLI 无独立技能软禁用、只能停用承载插件或删除目录。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/<skill-name>` · `.claude/skills/` |
| 入口与配置 | 显式使用 `/<skill-name>`；未关闭自动调用时，Claude 也可根据 Skill 描述自行选择。 |
| 文件与目录 | 用户目录 `~/.claude/skills/<name>/SKILL.md`；项目目录 `.claude/skills/<name>/SKILL.md`；Plugin 可携带 Skills。 |
| 具体行为 | 先发现名称和描述，需要时再读取完整 SKILL.md，并可继续打开同目录脚本、参考资料和模板。 |
| 作用域与优先级 | 项目 Skill 随仓库共享，用户 Skill 在本机多项目复用；Plugin Skill 随插件启用。 |
| 扩展构成 | `SKILL.md` 前置元数据、正文指令，以及可选脚本、资源和嵌套目录。 |
| 加载与刷新 | 运行中检测 Skill 变化；Skills 与旧式 `.claude/commands` 在 Slash 命令界面合并呈现。 |
| 适用界面 | 以 Claude Code CLI 为准；VS Code 扩展、桌面端或 Headless 中不同的入口会单独注明。 |
| 权限与信任 | Skill 只是指令与资源包；其中要求调用的工具仍经过 Claude Code 权限规则。 |
| 条件与边界 | 同名 Skill 与旧式 Command 需要避免冲突。禁用分多层：`skillOverrides` 按名称设 `on`/`name-only`/`user-invocable-only`/`off`（`/skills` 写入 `.claude/settings.local.json`，不影响 Plugin Skill）；`disableBundledSkills` 关闭除 `/doctor` 外的全部内置 Skill；`/permissions` 可用 `Skill`、`Skill(name)`、`Skill(name *)` 拒绝；SKILL.md 可用 `disable-model-invocation`、`user-invocable`、`paths` 收窄。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Skills](https://code.claude.com/docs/en/skills)、[Claude Code settings](https://code.claude.com/docs/en/settings) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `$skill` · `.agents/skills/` |
| 入口与配置 | 使用 `$skill-name` 显式引用，或通过 `/skills` 浏览；Codex 也可按描述自动匹配。 |
| 文件与目录 | 项目从当前目录向仓库根查找 `.agents/skills`；用户目录 `~/.agents/skills`；管理员目录 `/etc/codex/skills`；另有系统内置 Skills。 |
| 具体行为 | 启动时发现 Skill 元数据，触发后按需读取 SKILL.md 和相关资源。 |
| 作用域与优先级 | 仓库路径、用户、管理员和系统四层来源；项目层可随代码共享。 |
| 扩展构成 | `SKILL.md`、可选脚本、模板、示例与参考资料。 |
| 加载与刷新 | Skill 列表随客户端发现结果提供；修改后的重新发现时机取决于当前客户端会话。 |
| 适用界面 | 以 Codex CLI 为准；桌面端、IDE 扩展、Cloud 和 `codex exec` 不自动继承全部交互命令。 |
| 权限与信任 | Skill 不扩大工具授权；脚本和命令仍受审批、沙箱及组织配置约束。 |
| 条件与边界 | Codex 当前项目目录是 `.agents/skills`，不是旧对照表中的 `.codex/skills`。逐个禁用可在 `~/.codex/config.toml` 的 `[[skills.config]]` 中按 `path` 指向 `SKILL.md` 并设 `enabled = false`（需重启）；SKILL.md 元数据 `allow_implicit_invocation: false` 禁止隐式调用但保留 `$skill` 显式调用。 |
| 证据状态 | 官方确认 |
| 来源 | [Codex Agent Skills](https://learn.chatgpt.com/docs/build-skills)、[Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/<skill-name>` · `.qwen/skills/` · `skills.disabledLevels` |
| 入口与配置 | 使用 `/<skill-name>` 或 `/skills` 显式选择；模型也可根据 Skill 描述自动调用。 |
| 文件与目录 | 用户目录 `~/.qwen/skills`，项目目录 `.qwen/skills`，Extension 可携带 Skills。 |
| 具体行为 | 按需读取 SKILL.md，并可访问 Skill 目录中的脚本、文档和其他资源。 |
| 作用域与优先级 | 项目、用户和 Extension 来源合并。`skills.disabledLevels` 可整体跳过 `project`、`user`、`extension`、`bundled` 任一发现层级（默认 `undefined`，跨作用域取并集，`requiresRestart`）；`skills.directories` 按 `user` 层发现，因此 `["user"]` 会一并隐藏。逐个控制另有 `skills.disabled`、`skills.enabled` 与 `skills.defaultDisabled`，但 `skills.enabled` 不能恢复已被 `disabledLevels` 排除的层级。 |
| 扩展构成 | `SKILL.md`、辅助文件和可执行脚本；内置 Skill 与外部 Skill 使用同一调用模型。 |
| 加载与刷新 | 启动与刷新流程扫描可用目录；变更后的可见性受当前会话重新发现机制影响。 |
| 适用界面 | 以 Qwen Code CLI 为准；Headless、ACP 和 IDE Companion 中不同的加载行为会单独注明。 |
| 权限与信任 | Skill 触发的工具继续经过 approval mode、沙箱和工具策略。 |
| 条件与边界 | Slash 名称可能与内置命令、自定义 Command 或 MCP Prompt 冲突；加载器按来源和命令注册规则处理。`skills.disabledLevels` 在 safe mode、bare mode 下被忽略；daemon 在工作区未信任时也不读取。 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code current Skills](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/skills.md)、[Qwen Code current Extensions](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/extension/introduction.md)、[Qwen Code disabled skill levels](https://github.com/QwenLM/qwen-code/commit/de022664dc59a3c2f7af083acaaba6a86f14115c) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/skill:<name>` · `.kimi-code/skills/` |
| 入口与配置 | 明确调用为 `/skill:<name>`；没有命令冲突时也可使用 `/<name>`，模型还能自动选择。 |
| 文件与目录 | 项目 `.kimi-code/skills`、`.agents/skills`；用户 `$KIMI_CODE_HOME/skills`、`~/.agents/skills`；另有额外目录和内置 Skills。 |
| 具体行为 | Skill 被选中后读取 SKILL.md 和支持文件，可接收参数；支持有限层级的嵌套引用。 |
| 作用域与优先级 | 优先级是 Project、User、Extra、Built-in；同名时高优先级来源覆盖低优先级来源。 |
| 扩展构成 | `SKILL.md`、脚本、参考文件和其他同目录资源。 |
| 加载与刷新 | 启动时按配置目录发现；Plugin 也可携带 Skills，变化通常通过 `/reload` 或新会话生效。 |
| 适用界面 | 以 Kimi Code CLI 为准；ACP、Web UI 和外部编辑器只在对应能力中单独列出。 |
| 权限与信任 | Skill 内容不绕过 Kimi 的工具权限和交互模式。 |
| 条件与边界 | 无前缀 `/<name>` 只有在不与已有命令冲突时才作为回退；稳定写法是 `/skill:<name>`。逐个禁用只走 frontmatter：`disableModelInvocation: true`（别名 `disable-model-invocation`）禁止模型自动调用但仍可 `/skill:<name>` 手动调用，`type: flow` 仅手动调用；当前无按名称或按层级的禁用配置键。 |
| 证据状态 | 官方确认 |
| 来源 | [Kimi Code current Skills](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/customization/skills.md)、[Kimi Code current Plugins](https://github.com/MoonshotAI/kimi-code/blob/691ec4679ea1/docs/zh/customization/plugins.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/<skill-name>` · `.qoder/skills/` |
| 入口与配置 | 使用 `/<skill-name>` 显式调用或由模型自动匹配；`/skills` 查看，`/skills reload` 重载。 |
| 文件与目录 | 用户目录 `~/.qoder/skills`，项目目录 `.qoder/skills`。 |
| 具体行为 | 按需加载 SKILL.md，并让同目录资源参与任务。 |
| 作用域与优先级 | 项目 Skill 覆盖同名用户 Skill；Plugin 也可分发 Skills。 |
| 扩展构成 | `SKILL.md` 与可选脚本、参考材料和资源。 |
| 加载与刷新 | `/skills reload` 在当前会话重扫目录；Plugin Skills 随插件加载。 |
| 适用界面 | 以 Qoder CLI 为准；Agent SDK、ACP 和 Qoder IDE 中不同的入口会单独注明。 |
| 权限与信任 | Skill 要求的工具调用继续走 Qoder CLI permission rules。 |
| 条件与边界 | 项目目录适合随仓库共享，用户目录适合个人复用；同名覆盖需要结合来源检查。独立 user/project Skill 无设置级软禁用，官方文档只给出删除目录；插件携带的 Skill 随插件停用（`enabledPlugins` 或 `qodercli plugins disable`，停用插件在新会话不再加载）。 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI Skills](https://docs.qoder.com/en/cli/Skills)、[Qoder CLI Plugins](https://docs.qoder.com/en/cli/plugins) |

## 官方来源

- [Claude Code Skills](https://code.claude.com/docs/en/skills)
- [Claude Code settings](https://code.claude.com/docs/en/settings)
- [Codex Agent Skills](https://learn.chatgpt.com/docs/build-skills)
- [Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)
- [Qwen Code current Skills](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/skills.md)
- [Qwen Code current Extensions](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/extension/introduction.md)
- [Qwen Code disabled skill levels](https://github.com/QwenLM/qwen-code/commit/de022664dc59a3c2f7af083acaaba6a86f14115c)
- [Kimi Code current Skills](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/customization/skills.md)
- [Kimi Code current Plugins](https://github.com/MoonshotAI/kimi-code/blob/691ec4679ea1/docs/zh/customization/plugins.md)
- [Qoder CLI Skills](https://docs.qoder.com/en/cli/Skills)
- [Qoder CLI Plugins](https://docs.qoder.com/en/cli/plugins)

## 关联能力

- [自定义 Slash 命令](./extension-custom-commands.md)
- [插件分发](./extension-plugins.md)
- [项目指令文件](./extension-project-instructions.md)

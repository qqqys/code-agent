# 项目指令文件

[返回扩展系统详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=extension-project-instructions)

> 核对日期：2026-08-24

## 定义

从用户和仓库目录加载长期工作约定到模型上下文，并比较文件名、目录层级、覆盖顺序和强制边界。

## 扩展结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `CLAUDE.md` · `.claude/rules/` | 官方确认 |
| Codex | `AGENTS.md` · `AGENTS.override.md` | 官方确认 |
| Qwen Code | `QWEN.md` · `AGENTS.md` | 源码确认 |
| Kimi Code | `AGENTS.md` | 官方确认 |
| Qoder CLI | `AGENTS.md` · `.qoder/rules/` | 官方确认 |

## 比较边界

### 本页包含

- 用户级与项目级长期指令
- 子目录规则、局部覆盖和文件导入
- 启动或访问目录时的加载时机

### 本页不包含

- 审批、沙箱或 Hook 的强制策略
- 一次性用户提示词
- 跨会话自动学习生成的记忆

## 跨产品事实

1. Claude Code 使用 `CLAUDE.md`，Codex、Kimi Code 和 Qoder CLI 原生使用 `AGENTS.md`；Qwen Code 同时读取 `QWEN.md` 与 `AGENTS.md`。
2. 这些文件进入模型上下文，本质是指令而不是安全边界；需要强制执行的限制应由权限、沙箱、Hook 或组织策略承担。
3. Claude Code 不直接读取 `AGENTS.md`；需要从 `CLAUDE.md` 使用 `@AGENTS.md` 导入或建立链接。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `CLAUDE.md` · `.claude/rules/` |
| 入口与配置 | 启动时读取 `CLAUDE.md`；可在正文中用 `@path` 导入其他文件。 |
| 文件与目录 | 用户 `~/.claude/CLAUDE.md`；项目 `./CLAUDE.md` 或 `./.claude/CLAUDE.md`；本地 `./CLAUDE.local.md`；规则 `.claude/rules/**/*.md`。 |
| 具体行为 | 项目层级指令加入上下文；嵌套目录的文件在访问相应目录时按需加载。 |
| 作用域与优先级 | 用户、项目、Local 与子目录规则；Local 文件适合不提交的个人覆盖。 |
| 扩展构成 | Markdown 指令、`@` 导入，以及可按路径限定的规则文件。 |
| 加载与刷新 | 启动时加载上层指令，进入或读取子目录时再加入更局部规则。 |
| 适用界面 | 以 Claude Code CLI 为准；VS Code 扩展、桌面端或 Headless 中不同的入口会单独注明。 |
| 权限与信任 | 内容用于指导模型，不会替代权限规则、Sandbox 或 Managed settings。 |
| 条件与边界 | Claude Code 不原生读取 `AGENTS.md`；跨产品共用时需通过 `CLAUDE.md` 导入或符号链接。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Memory](https://code.claude.com/docs/en/memory) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `AGENTS.md` · `AGENTS.override.md` |
| 入口与配置 | 会话启动前构建指令链；每层优先 `AGENTS.override.md`，否则读取 `AGENTS.md` 或配置的备用文件名。 |
| 文件与目录 | 全局 `~/.codex/AGENTS.override.md` 或 `~/.codex/AGENTS.md`；项目从仓库根到当前目录逐层查找。 |
| 具体行为 | 按目录从根到当前工作目录拼接，更靠近当前目录的文件出现在后面并覆盖冲突指令。 |
| 作用域与优先级 | 全局与项目目录层级；每个目录只选一个候选文件。 |
| 扩展构成 | Markdown 指令，以及 `project_doc_fallback_filenames` 与大小上限配置。 |
| 加载与刷新 | 每次启动根据当前工作目录重新建立链；默认项目指令总量上限为 32 KiB。 |
| 适用界面 | 以 Codex CLI 为准；桌面端、IDE 扩展、Cloud 和 `codex exec` 不自动继承全部交互命令。 |
| 权限与信任 | AGENTS 指令不扩大沙箱或工具审批权限，组织配置仍可强制更高优先级规则。 |
| 条件与边界 | Override 文件会替代同目录普通 AGENTS 文件，不是与它同时拼接。 |
| 证据状态 | 官方确认 |
| 来源 | [Codex AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `QWEN.md` · `AGENTS.md` |
| 入口与配置 | 启动时发现 `QWEN.md`，也兼容读取 `AGENTS.md`；正文可用 `@path` 导入。 |
| 文件与目录 | 用户 `~/.qwen/QWEN.md`；项目根 `QWEN.md`；本地 `.qwen/QWEN.local.md`；仓库可使用 `AGENTS.md`。 |
| 具体行为 | 把用户和项目约定注入上下文，并处理显式导入与局部文件。 |
| 作用域与优先级 | 用户、项目、本地与兼容 AGENTS 文件；具体优先级按内存加载配置执行。 |
| 扩展构成 | Markdown 指令、`@` 导入和兼容文件名。 |
| 加载与刷新 | 启动与上下文刷新流程加载；Local 文件用于不提交的机器或个人覆盖。 |
| 适用界面 | 以 Qwen Code CLI 为准；Headless、ACP 和 IDE Companion 中不同的加载行为会单独注明。 |
| 权限与信任 | 指令文件不绕过 approval mode、Sandbox 或工具白名单。 |
| 条件与边界 | “兼容 AGENTS.md”不表示 QWEN.md 与 AGENTS.md 永远重复加载；应按当前发现与优先级规则核对。 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code current memory](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/memory.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `AGENTS.md` |
| 入口与配置 | Agent Prompt 中通过 `${agents_md}` 注入发现到的 AGENTS 指令。 |
| 文件与目录 | 全局 `$KIMI_CODE_HOME/AGENTS.md` 与 `~/.agents/AGENTS.md`；项目 `.kimi-code/AGENTS.md` 或根目录 `AGENTS.md`。 |
| 具体行为 | 把用户与项目约定作为上下文提供给主 Agent。 |
| 作用域与优先级 | 全局与项目；项目内 `.kimi-code/AGENTS.md` 提供产品专用位置。 |
| 扩展构成 | Markdown 指令文件。 |
| 加载与刷新 | 构建 Agent 上下文时读取并注入。 |
| 适用界面 | 以 Kimi Code CLI 为准；ACP、Web UI 和外部编辑器只在对应能力中单独列出。 |
| 权限与信任 | AGENTS.md 是上下文，不是权限执行器；工具授权仍由交互与配置处理。 |
| 条件与边界 | 当前官方文档没有把它描述成自动记忆；不要与会话或长期自动学习混为一谈。 |
| 证据状态 | 官方确认 |
| 来源 | [Kimi Code current agents](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/customization/agents.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `AGENTS.md` · `.qoder/rules/` |
| 入口与配置 | 启动时读取 AGENTS 文件；规则文件可按 always、model-decides、glob 或手动模式激活。 |
| 文件与目录 | 全局 `~/.qoder/AGENTS.md`；项目 `AGENTS.md`、`AGENTS.local.md`；规则 `.qoder/rules/**/*.md`。 |
| 具体行为 | 将项目约定和匹配规则加入上下文，并支持 `@` 导入其他文件。 |
| 作用域与优先级 | 用户、项目、本地与按路径或模式激活的规则。 |
| 扩展构成 | AGENTS Markdown、Local 覆盖、规则文件和导入。 |
| 加载与刷新 | 启动时读取常驻内容，按规则激活方式和当前文件上下文加载其他内容。 |
| 适用界面 | 以 Qoder CLI 为准；Agent SDK、ACP 和 Qoder IDE 中不同的入口会单独注明。 |
| 权限与信任 | Memory/规则只指导 Agent，不能取代 permission mode 与 Hook。 |
| 条件与边界 | 可通过 `context.fileName` 配置文件名；比较默认行为时仍以 AGENTS.md 为基准。 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI Memory](https://docs.qoder.com/en/cli/memory) |

## 官方来源

- [Claude Code Memory](https://code.claude.com/docs/en/memory)
- [Codex AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md)
- [Qwen Code current memory](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/memory.md)
- [Kimi Code current agents](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/customization/agents.md)
- [Qoder CLI Memory](https://docs.qoder.com/en/cli/memory)

## 关联能力

- [Agent Skills](./extension-skills.md)
- [项目目录信任](../security/security-trust.md)
- [跨会话记忆](../sessions/session-memory.md)

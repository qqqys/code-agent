# 代码搜索

[返回任务执行与 Git 详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=execution-search)

> 核对日期：2026-07-29

## 定义

按路径模式、文本正则或语言符号定位代码，并把有限结果送回模型继续阅读和修改。

## 执行结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `Glob` · `Grep` · `LSP` | 官方确认 |
| Codex | 内置搜索 · Shell/`rg` | 官方确认 |
| Qwen Code | `glob` · `grep_search` · `LSP` | 源码确认 |
| Kimi Code | `Glob` · `Grep` | 源码确认 |
| Qoder CLI | `Glob` · `Grep` | 官方确认 |

## 比较边界

### 本页包含

- Glob 文件发现与 Grep 全文检索
- 符号定义、引用、类型和调用层级导航
- 忽略文件、分页、截断和敏感文件过滤

### 本页不包含

- 互联网搜索
- 向量化代码索引产品
- 由用户手工运行但未被产品封装的任意搜索脚本

## 跨产品事实

1. Claude Code、Qwen Code 提供 Glob、Grep 与 LSP 三层搜索；Kimi Code、Qoder CLI 的公开内置表确认 Glob 与 Grep。
2. Codex 可以通过内置搜索和 Shell 中的 `rg`/`find` 完成仓库检索，但当前公开文档没有同样的固定工具名清单。
3. 搜索结果都需要分页或截断；“命中 0 条”不能自动证明代码不存在，还要考虑忽略规则、范围与工具上限。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `Glob` · `Grep` · `LSP` |
| 入口与工具 | `Glob` 按模式找文件，`Grep` 搜文本，`LSP` 做定义、引用、类型、实现和调用层级导航。 |
| 核心机制 | Glob/Grep 是内置只读工具；LSP 由语言插件提供并连接相应 Language Server。 |
| 执行行为 | Glob/Grep 默认不要求权限；LSP 在文件编辑后还能主动返回类型错误和警告。 |
| 运行范围 | 从当前项目和允许目录搜索；规则和忽略文件影响可见范围。 |
| 后台与并发 | 单次搜索同步返回；大范围探索可委派给后台 Subagent。 |
| Git 与平台联动 | LSP 与语言插件绑定；MCP 还能补充专用代码索引工具。 |
| 状态与产物 | 结果进入当前上下文，不写文件；后续 Read 决定读取哪些命中。 |
| 条件与边界 | LSP 需要安装插件及语言服务器；工具可被权限或 Subagent 工具列表移除。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code tools reference](https://code.claude.com/docs/en/tools-reference) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 内置搜索 · Shell/`rg` |
| 入口与工具 | Agent 使用内置搜索能力，并可在 Shell 中运行 `rg`、`find`、Git 搜索或语言工具。 |
| 核心机制 | 搜索策略由任务和运行环境决定；公开文档没有要求稳定暴露 Glob/Grep/LSP 三个固定名称。 |
| 执行行为 | 通常先用快速文本或文件检索缩小范围，再读取具体文件；Shell 搜索遵守相同审批和沙箱。 |
| 运行范围 | 当前 workspace、额外可读目录和沙箱决定可见代码。 |
| 后台与并发 | 搜索可在当前线程或 Subagent 中执行；长命令可进入后台终端。 |
| Git 与平台联动 | 可通过 MCP、Plugin 或 Skill 接入额外索引和代码导航能力。 |
| 状态与产物 | 搜索输出进入会话，不直接修改文件。 |
| 条件与边界 | 具体工具集合随 Codex Surface 和运行时变化；矩阵不把未公开内部工具名当稳定接口。 |
| 证据状态 | 官方确认 |
| 来源 | [Codex Documentation](https://developers.openai.com/codex)、[Codex Agent approvals and security](https://learn.chatgpt.com/docs/agent-approvals-security) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `glob` · `grep_search` · `LSP` |
| 入口与工具 | `glob` 找文件，`grep_search` 搜文本，`list_directory` 浏览目录；实验 LSP 提供符号导航。 |
| 核心机制 | Grep 基于 ripgrep；工具注册表还提供 LSP、Read 等组合探索能力。 |
| 执行行为 | 只读搜索通常自动允许；结果有数量和上下文限制，模型再按需 read_file。 |
| 运行范围 | 搜索当前 workspace 和已加入目录；Worktree 激活后搜索隔离目录。 |
| 后台与并发 | 单次工具同步返回；Explore/自定义 Agent 可并行搜索不同区域。 |
| Git 与平台联动 | LSP 通过实验开关注册；Tool Search 可延迟发现扩展工具。 |
| 状态与产物 | 结果进入上下文，不写文件。 |
| 条件与边界 | LSP 只有启用 `--experimental-lsp` 时注册；Git ignore 与工具参数会影响命中。 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code current built-in tools](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/core/src/tools/tool-names.ts)、[Qwen Code current commands](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/commands.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `Glob` · `Grep` |
| 入口与工具 | `Grep` 基于 ripgrep 搜内容，`Glob` 按模式找文件；`Read` 读取命中。 |
| 核心机制 | Grep 支持正则、文件类型、glob、上下文、多行、分页；Glob 最多返回 100 条并按修改时间倒序。 |
| 执行行为 | 两者默认自动放行并尊重 `.gitignore`、`.ignore`、`.rgignore`；可用 `include_ignored=true` 包含忽略文件。 |
| 运行范围 | 指定 path 或当前工作目录；`.env`、私钥等敏感文件即使 include_ignored 也继续过滤。 |
| 后台与并发 | 单次搜索同步完成；Explore Agent 可在后台并行探索。 |
| Git 与平台联动 | 搜索结果可直接驱动 Read/Edit；当前公开工具表没有独立 LSP 工具。 |
| 状态与产物 | 结果进入会话，不修改文件。 |
| 条件与边界 | 达到条数上限会截断；敏感文件过滤不可由 include_ignored 绕过。 |
| 证据状态 | 源码确认 |
| 来源 | [Kimi Code current built-in tools](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/tools.md)、[Kimi Code current agents](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/customization/agents.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `Glob` · `Grep` |
| 入口与工具 | `Glob` 按模式找文件，`Grep` 搜内容；SDK 可用 `tools: [Read, Grep, Glob]` 构造只读会话。 |
| 核心机制 | 工具输入输出由 SDK Reference 定义，可与 Read、Agent 和自定义 MCP 工具组合。 |
| 执行行为 | 搜索调用受 Read 权限规则和 workspace 范围控制。 |
| 运行范围 | 当前 workspace 与 additionalDirectories；Worktree Job 搜索自己的隔离目录。 |
| 后台与并发 | 单次调用同步；Subagent 或 Worktree Job 可并行搜索。 |
| Git 与平台联动 | SDK 可显式只暴露 Read/Grep/Glob，形成不含 Bash 和写入的审查或探索流程。 |
| 状态与产物 | 返回匹配结果，不直接修改文件。 |
| 条件与边界 | 具体分页和截断参数以当前 Tools Reference 为准；权限过滤可能隐藏路径。 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI built-in tools](https://docs.qoder.com/en/cli/sdk/tools)、[Qoder CLI Permissions](https://docs.qoder.com/en/cli/permissions) |

## 官方来源

- [Claude Code tools reference](https://code.claude.com/docs/en/tools-reference)
- [Codex Documentation](https://developers.openai.com/codex)
- [Codex Agent approvals and security](https://learn.chatgpt.com/docs/agent-approvals-security)
- [Qwen Code current built-in tools](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/core/src/tools/tool-names.ts)
- [Qwen Code current commands](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/commands.md)
- [Kimi Code current built-in tools](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/tools.md)
- [Kimi Code current agents](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/customization/agents.md)
- [Qoder CLI built-in tools](https://docs.qoder.com/en/cli/sdk/tools)
- [Qoder CLI Permissions](https://docs.qoder.com/en/cli/permissions)

## 关联能力

- [文件读写](./execution-files.md)
- [工具白名单](../subagents/agent-tools.md)
- [MCP 客户端](../extensions/extension-mcp.md)

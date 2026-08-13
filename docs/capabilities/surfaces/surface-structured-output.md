# 结构化输出

[返回 Headless、SDK 与多端详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=surface-structured-output)

> 核对日期：2026-08-13

## 定义

把 Agent 的最终结果或执行事件编码为稳定的 JSON、JSONL 或 JSON Schema 约束对象，供程序而不是人直接消费。

## 能力结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `json` · `stream-json` · JSON Schema | 官方确认 |
| Codex | `--json` JSONL · `--output-schema` | 官方确认 |
| Qwen Code | `json` · `stream-json` · JSON Schema | 源码确认 |
| Kimi Code | `stream-json` JSONL | 条件项 |
| Qoder CLI | `text` · `json` · `stream-json` | 条件项 |

## 比较边界

### 本页包含

- Headless 输出格式
- 事件流与最终结果的区分
- JSON Schema 约束和机器可读错误边界

### 本页不包含

- SDK 对象和类型系统
- 普通 TUI 渲染
- MCP 或 ACP 的协议消息

## 跨产品事实

1. Claude Code、Codex 和 Qwen Code 都能用 JSON Schema 约束最终业务结果；Kimi Code 与 Qoder CLI 当前公开 CLI 文档只承诺格式化消息或事件。
2. JSONL 事件流不是“一个最终 JSON”：消费者必须按事件类型识别结束、错误、工具调用和最终消息。
3. 各家的 stderr 仍可能承载进度或诊断信息，自动化脚本应只解析 stdout 并同时检查退出码。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `json` · `stream-json` · JSON Schema |
| 入口与调用 | `--output-format json\|stream-json`；需要业务对象时同时传 `--json-schema <schema>`。 |
| 协议与输出 | `json` 返回单个带结果、session ID 和元数据的对象；`stream-json` 返回换行分隔事件。 |
| 具体行为 | Schema 模式把校验后的业务对象放在 `structured_output` 字段；普通文本结果仍位于 `result`。 |
| 会话与状态 | 输出包含 session ID，可用于后续 `--resume`；流事件按一次运行顺序产生。 |
| 工具与能力 | Agent 可在产出结构化结果前继续读取文件、运行命令和调用工具。 |
| 认证与权限 | 不改变认证方式；Schema 和 prompt 一样会发送给模型服务。 |
| 运行位置 | CLI、Python SDK 和 TypeScript SDK 均可消费结构化输出。 |
| 条件与边界 | `stream-json` 消费者需逐行解析；Schema 校验失败时任务不会被当作成功结果。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Headless Mode](https://code.claude.com/docs/en/headless)、[Claude Agent SDK](https://code.claude.com/docs/en/agent-sdk/overview) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `--json` JSONL · `--output-schema` |
| 入口与调用 | `codex exec --json` 输出事件；`--output-schema ./schema.json` 约束最终响应，`-o` 可把最终消息写文件。 |
| 协议与输出 | `--json` 是 JSONL，事件包括 `thread.*`、`turn.*`、`item.*` 和 `error`；Schema 输出是最终 JSON 对象。 |
| 具体行为 | JSONL 记录 Agent 消息、推理、命令、文件修改、MCP、Web 搜索和计划更新；Schema 用于下游稳定字段。 |
| 会话与状态 | `thread.started` 提供 thread ID；恢复线程时可继续产生新事件。 |
| 工具与能力 | 结构化输出不缩小 Agent 工具集合；文件和命令事件仍受沙箱与审批。 |
| 认证与权限 | 不改变认证方式；自动化运行仍复用 CLI 凭据。 |
| 运行位置 | 主要面向 Shell、CI 和日志处理程序；SDK 提供对应的对象与流式接口。 |
| 条件与边界 | 不要把整个 `--json` stdout 当成一个 JSON 数组；必须逐行解析并以退出码、`turn.failed` 或 `error` 判断失败。 |
| 证据状态 | 官方确认 |
| 来源 | [Codex Non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode)、[Codex SDK](https://learn.chatgpt.com/docs/codex-sdk) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `json` · `stream-json` · JSON Schema |
| 入口与调用 | `--output-format json\|stream-json`；`--json-schema <json\|@file>` 约束最终对象。 |
| 协议与输出 | `json` 缓冲为消息数组；`stream-json` 输出 JSONL；最终 `result` 消息可含 `structured_result`。 |
| 具体行为 | Schema 通过临时 `structured_output` 工具强制模型提交对象，并对参数做 JSON Schema 校验。 |
| 会话与状态 | 事件带 session ID；恢复会话时每次仍需重新传入本轮 Schema。 |
| 工具与能力 | Schema 成功调用会终止本轮；同一模型消息中的其他副作用工具会被抑制，避免“提交结果后继续修改”。 |
| 认证与权限 | 不改变认证；Schema 作为工具参数定义发送给 Provider。 |
| 运行位置 | CLI 和 `@qwen-code/sdk` 可消费同一类消息；Daemon 另有 HTTP + SSE 协议。 |
| 条件与边界 | `--json-schema` 不可与交互 prompt、`stream-json` 输入或 ACP 同用；显式 deny `structured_output` 会使契约无法完成。 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code current structured output](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/structured-output.md)、[Qwen Code current headless mode](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/headless.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `stream-json` JSONL |
| 入口与调用 | `kimi -p "<prompt>" --output-format stream-json`。 |
| 协议与输出 | stdout 为 JSONL：普通回复是 Assistant 消息，工具调用先输出 Assistant tool_calls，再输出 Tool 消息。 |
| 具体行为 | thinking 不进入 JSONL；工具进度和恢复提示继续写 stderr。 |
| 会话与状态 | 消息属于当前或恢复的本地会话，但公开 CLI 文档未定义单独的最终 Schema 对象。 |
| 工具与能力 | JSONL 会暴露工具调用和结果，普通工具仍按 Headless auto 权限策略执行。 |
| 认证与权限 | 不改变认证方式。 |
| 运行位置 | 面向 Shell 与 CI 消费者；本地 Web 和 ACP 使用各自协议。 |
| 条件与边界 | 当前公开选项只有 `text` 与 `stream-json`；没有 CLI JSON Schema 最终结果契约。 |
| 证据状态 | 条件项 |
| 来源 | [Kimi Code current CLI, Headless and Web reference](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/kimi-command.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `text` · `json` · `stream-json` |
| 入口与调用 | `qodercli -p "<prompt>" --output-format=text\|json\|stream-json`。 |
| 协议与输出 | `json` 输出结构化消息集合，`stream-json` 输出流式消息；类型与 SDK 消息体系对应。 |
| 具体行为 | 可在运行中观察 Assistant、工具和最终 Result 消息，用于脚本化处理。 |
| 会话与状态 | 恢复会话参数可与 Print Mode 结合，输出继续关联原会话。 |
| 工具与能力 | 工具事件受允许、禁止和权限模式配置约束。 |
| 认证与权限 | 复用 CLI 登录或 PAT。 |
| 运行位置 | CLI 直接输出；TypeScript/Python SDK 也能以类型化消息消费。 |
| 条件与边界 | 当前公开 CLI 使用页未列出 JSON Schema 最终结果参数，不能把 JSON/JSONL 等同于 Schema 保证。 |
| 证据状态 | 条件项 |
| 来源 | [Qoder CLI usage and worktrees](https://docs.qoder.com/en/cli/using-cli)、[Qoder CLI SDK Reference](https://docs.qoder.com/en/cli/sdk/references) |

## 官方来源

- [Claude Code Headless Mode](https://code.claude.com/docs/en/headless)
- [Claude Agent SDK](https://code.claude.com/docs/en/agent-sdk/overview)
- [Codex Non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode)
- [Codex SDK](https://learn.chatgpt.com/docs/codex-sdk)
- [Qwen Code current structured output](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/structured-output.md)
- [Qwen Code current headless mode](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/headless.md)
- [Kimi Code current CLI, Headless and Web reference](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/kimi-command.md)
- [Qoder CLI usage and worktrees](https://docs.qoder.com/en/cli/using-cli)
- [Qoder CLI SDK Reference](https://docs.qoder.com/en/cli/sdk/references)

## 关联能力

- [Headless 调用](./surface-headless.md)
- [Agent SDK](./surface-sdk.md)
- [服务端与 Daemon](./surface-service.md)

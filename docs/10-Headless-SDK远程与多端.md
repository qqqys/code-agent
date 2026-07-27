# Headless、SDK、远程与多端

[上一篇：Git、Review 与 CI](./09-Git-Review与CI.md) ·
[返回总矩阵](./02-功能总矩阵.md) ·
[下一篇：怎么选](./11-怎么选.md)

这一层决定 Code Agent 是只能给个人使用，还是能被脚本、IDE、企业平台和云服务调用。

## 五方表现

| 能力 | Claude Code | Codex | Qwen Code | Kimi Code | Qoder CLI |
| --- | --- | --- | --- | --- | --- |
| Headless | `-p` 与结构化输出 | `codex exec` | `qwen -p` 与结构化输出 | 新版公开能力待补证 | `qodercli -p` |
| SDK | Agent SDK | Codex SDK | **TypeScript、Python、Java SDK** | 新版待补证 | **Python、TypeScript Agent SDK** |
| 服务端入口 | SDK、Remote Control | App Server、Cloud | **`qwen serve`：HTTP+SSE/ACP** | 待验证 | SDK 与 Qoder Cloud |
| IDE | VS Code、JetBrains | VS Code 等 IDE 入口 | VS Code、Zed、JetBrains | 当前主入口为 CLI | Qoder 产品套件内协同 |
| Desktop/Web | Desktop、Web | Codex App、Cloud、移动接续 | Desktop、Web Shell | 当前主入口为 CLI | Cloud Web Session |
| 远程任务 | Web/Remote Control | Cloud Task | Daemon 多客户端、IM Channel | 待验证 | **`--remote` 启动云端 VM 任务** |
| 嵌入企业系统 | SDK、CI、MCP | SDK、App Server、Cloud | **Daemon、SDK、IM、MCP、开放源码** | 待验证 | SDK、PAT、Cloud |

## 四种“可编程”不是一回事

| 方式 | 适合什么 | 关键要求 |
| --- | --- | --- |
| Headless CLI | Shell 脚本、CI、一次性任务 | 稳定退出码、结构化输出、无交互认证 |
| SDK | 在应用代码里创建和控制 Agent | 类型、取消、事件流、权限回调 |
| Daemon/App Server | 多客户端共享一个运行时 | 会话归属、并发、认证、生命周期 |
| Cloud Task | 本地关闭后继续运行 | 远程工作区、密钥、日志、成本和接管 |

## 产品差异

Claude Code 和 Codex 都从个人工具扩展到了 SDK 和远程任务。Codex 的 App、Cloud 与
App Server 更强调统一平台；Claude Code 的 SDK、CI 和 Remote Control 更贴近日常
开发工作流。

Qwen Code 的可嵌入性最突出：开放源码、多个 SDK、Daemon、HTTP+SSE、ACP、IDE、
Desktop 和 IM Channel 形成了丰富的接入面。挑战是不同接入面的协议、权限和功能
覆盖需要长期保持一致。

Qoder CLI 的优势是产品化云任务：用户可从本地发起，获取 Web Session，并在关闭本地
终端后继续。Kimi Code 当前公开重点仍是本地 CLI。

## 对 Qwen Code 的启示

Qwen Code 应把“Daemon 是核心运行时”表达成普通用户能理解的连续体验：

- CLI 发起的任务可以在 Desktop/Web/IM 查看；
- 每个会话明确显示由哪个运行时拥有；
- 客户端断开不会误报任务失败；
- SDK、HTTP、ACP 和 CLI 使用一致的事件与错误模型；
- 企业可以统一配置认证、权限、审计和资源限制。

## 官方入口

- [Claude Code 概览](https://code.claude.com/docs/en/overview)
- [Codex 开源仓库](https://github.com/openai/codex)
- [Qwen Code 开源仓库](https://github.com/QwenLM/qwen-code)
- [Qoder CLI Cloud Mode](https://docs.qoder.com/en/cli/cloud-mode)

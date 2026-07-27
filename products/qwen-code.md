# Qwen Code

[返回产品档案](./README.md) · [查看五方矩阵](../docs/02-功能总矩阵.md) ·
[查看产品机会](../docs/12-Qwen-Code产品机会.md)

## 一句话定位

Qwen Code 是开源、多 Provider、可嵌入的 Agent 运行时。它从 CLI 出发，但已经覆盖
IDE、Desktop、Web Shell、Daemon、SDK 和 IM Channel，重点不只是个人终端工具。

## 主要能力

| 领域 | 表现 |
| --- | --- |
| 编码 | 文件/目录搜索、编辑、Shell、LSP、Notebook、Web 等工具 |
| 模型 | Qwen 优化，支持 OpenAI/Anthropic/Gemini/Qwen 等兼容协议 |
| 安全 | 多种审批姿态、项目 Trust、Seatbelt/容器与网络模式 |
| 会话 | Resume、Branch、Rewind、Export、压缩、Auto/Team Memory |
| 扩展 | MCP、Skills、Hooks、Extension/Marketplace |
| 编排 | Named/Fork Subagent、Agent Team、Dynamic Workflow、Arena |
| 平台 | `qwen serve`、HTTP+SSE、ACP、TypeScript/Python/Java SDK |
| 多端 | CLI、VS Code、Zed、JetBrains、Desktop、Web Shell、IM |

## 使用体验

Qwen Code 的特点是同一套 Agent 能力可以用多种方式接入。个人开发者可以直接使用
TUI；企业可以接模型网关、运行 Daemon、用 SDK 嵌入产品，或通过 IM Channel 触达。
Team、Workflow 和 Arena 让多 Agent 编排与评测也进入同一项目。

## 明显优势

- 开源且可二次开发；
- 多 Provider 是核心能力；
- Daemon、协议与三种 SDK 带来很强的可嵌入性；
- IDE、Desktop、Web Shell、IM 等入口覆盖宽；
- Subagent、Team、Workflow、Arena 的编排空间大。

## 主要取舍

- 能力和入口很多，学习成本与概念数量偏高；
- 快速迭代中，不同 Surface 的功能覆盖可能暂时不一致；
- Provider 自由度也带来模型兼容、诊断和治理责任；
- 默认产品闭环需要继续收敛。

## 适合谁

- 想使用开源 Code Agent 的个人和团队；
- 需要连接多个模型或内部网关的企业；
- 想把 Agent 嵌入 IDE、平台、IM 或自研系统的开发者；
- 研究多 Agent、Workflow 和模型对比的团队。

## 下一步最值得做什么

保留开放、多模型和平台化优势，同时优先统一任务状态、错误解释、权限预设、交付闭环
与跨端连续性。完整建议见 [Qwen Code 产品机会](../docs/12-Qwen-Code产品机会.md)。

## 版本与来源

- 当前记录版本：`0.21.0`（2026-07-27）
- [官方开源仓库](https://github.com/QwenLM/qwen-code)

详细口径见 [版本与证据](../docs/13-版本与证据.md)。

# Codex

[返回产品档案](./README.md) · [查看五方矩阵](../docs/02-功能总矩阵.md)

## 一句话定位

Codex 是 OpenAI 的编码 Agent 平台：CLI 负责本地终端工作，IDE 提供编辑器入口，
Codex App 管理多个任务与 Agent，Cloud 负责远程任务。开源 CLI 与商业平台需要按
Surface 分开判断。

## 主要能力

| 领域 | 表现 |
| --- | --- |
| 编码 | 检查仓库、搜索、编辑文件、运行命令、附加图片 |
| 安全 | Approval Policy 与 macOS/Linux/Windows 系统级沙箱 |
| 会话 | Resume、Fork、Archive、Delete、`AGENTS.md`、`/compact` |
| 扩展 | MCP、Skills、Hooks、Plugins |
| 多代理 | CLI Subagent，App/Cloud 面向并行任务 |
| Review | 本地 Review、Cloud/GitHub 任务与 PR 工作流 |
| 自动化 | `codex exec`、SDK、GitHub Action、App Server |
| 多端 | CLI、IDE、Codex App、Cloud 和移动接续 |

## 使用体验

Codex CLI 把文件与命令操作放在明确的工作区、审批和沙箱边界中。Codex App 更像多
Agent 工作台：可以并行推进多个任务，并把本地仓库、Worktree 和云任务组织起来。

## 明显优势

- 沙箱是核心产品能力，而非附加选项；
- CLI、App、Cloud、SDK 和 GitHub 工作流组成完整平台；
- 适合并行 Agent、长任务和企业治理；
- CLI 公开源码，便于核对本地运行时行为。

## 主要取舍

- 产品面很宽，比较时必须区分 CLI、IDE、App 与 Cloud；
- 主账号和模型体验围绕 OpenAI；
- 远程和平台能力涉及账号、网络、工作区与组织策略。

## 适合谁

- 重视本地隔离和权限边界的开发者；
- 同时推进多个 Issue 或长任务的人；
- 希望从本地 CLI 延伸到桌面和云端的团队；
- 需要 SDK、App Server 或 GitHub 自动化的平台开发者。

## 对 Qwen Code 最有参考价值的地方

系统沙箱的产品表达、多 Agent 桌面工作台，以及本地任务与云任务之间清楚的状态和接管
体验。

## 版本与来源

- 当前记录版本：`0.145.0`（2026-07-27）
- [官方开源仓库](https://github.com/openai/codex)
- [Codex Rust CLI README](https://github.com/openai/codex/blob/main/codex-rs/README.md)
- [Codex App 介绍](https://openai.com/index/introducing-the-codex-app/)

详细口径见 [版本与证据](../docs/13-版本与证据.md)。

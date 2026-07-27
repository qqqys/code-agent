# Qoder CLI

[返回产品档案](./README.md) · [查看五方矩阵](../docs/02-功能总矩阵.md)

## 一句话定位

Qoder CLI 是 Qoder 商业 Agent 平台的终端入口，并通过 Subagent、Cloud Mode 和
Python/TypeScript Agent SDK 延伸到复杂任务和平台集成。

## 主要能力

| 领域 | 表现 |
| --- | --- |
| 终端 | 交互式 TUI、Slash 命令和代码任务 |
| Headless | `qodercli -p`，适合脚本和 CI |
| 认证 | 浏览器登录、PAT、环境变量 |
| 权限 | 工具与命令支持 allow/ask/deny 规则 |
| Subagent | 可定义独立 Prompt、上下文、工具和权限 |
| 编排 | 官方确认串行与并行 Subagent |
| 云任务 | `--remote` 交给 Qoder 管理的云端环境 |
| SDK | Python 与 TypeScript Agent SDK |

## 使用体验

用户可以在本地 CLI 发起任务，也可以把任务交给 Cloud Mode。远程任务运行在云端环境，
本地终端关闭后仍可继续，并可通过 Web Session 查看。Subagent 则负责把复杂任务拆成
不同角色或上下文。

## 明显优势

- 本地 CLI、远程 Cloud Session 和商业产品链路结合；
- Subagent 的定义和串并行编排有明确官方文档；
- allow/ask/deny 权限模型清楚；
- Python/TypeScript SDK 便于嵌入平台。

## 主要取舍

- 主要围绕 Qoder 账号、服务和云环境；
- 未找到可用于核对 CLI 内部实现的官方公开源码仓库；
- 系统级隔离、Hooks/插件、记忆和多模态细节仍需更多一手资料；
- 选型时需要额外评估云资源、数据边界和企业策略。

## 适合谁

- 已使用 Qoder 产品体系的团队；
- 需要本地发起、云端继续长任务的人；
- 需要自定义 Subagent 进行串并行编排的用户；
- 想通过 Agent SDK 把能力嵌入应用的平台开发者。

## 对 Qwen Code 最有参考价值的地方

把远程任务做成直接的用户路径：一个参数发起、任务脱离本地继续、提供 Web Session，
同时保留权限、Subagent 和 SDK 的产品一致性。

## 版本与来源

- 当前记录版本：`1.1.5`（2026-07-27）
- [Qoder CLI 快速开始](https://docs.qoder.com/en/cli/quick-start)
- [Qoder CLI 产品页](https://qoder.com/cli)
- [Subagent 文档](https://docs.qoder.com/en/cli/subagent)
- [权限文档](https://docs.qoder.com/en/cli/permissions)
- [Cloud Mode 文档](https://docs.qoder.com/en/cli/cloud-mode)

详细口径见 [版本与证据](../docs/13-版本与证据.md)。

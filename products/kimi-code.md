# Kimi Code

[返回产品档案](./README.md) · [查看五方矩阵](../docs/02-功能总矩阵.md)

## 一句话定位

Kimi Code 是 Moonshot AI 新一代终端编码 Agent，当前重点是单文件分发、快速 TUI、
长会话体验、视频输入和对话式 MCP 配置。

## 主要能力

| 领域 | 表现 |
| --- | --- |
| 编码 | 搜索和读取代码、编辑文件、运行 Shell、抓取网页 |
| 模型 | 默认 Kimi，可配置兼容 Provider |
| 分发 | 官方突出单文件可执行程序 |
| 终端 | 强调毫秒级启动、流畅 TUI 和长会话 |
| 多模态 | 官方明确支持视频输入 |
| MCP | `/mcp-config` 可通过对话配置和认证 MCP |
| 会话迁移 | 官方提供从旧 Kimi CLI 迁移会话的路径 |

## 使用体验

Kimi Code 的产品方向很清楚：减少安装和启动负担，让用户快速进入一个响应流畅的终端
Agent。视频输入适合 UI 动效、录屏 Bug 和动态流程；对话式 MCP 配置则降低了手写配置
文件的门槛。

## 明显优势

- 单文件分发与快速启动；
- 新 TUI 强调长会话流畅度；
- 视频输入形成独特使用场景；
- MCP 配置更贴近普通用户。

## 主要取舍

- 新产品迭代很快，公开文档仍在完善；
- 旧 Kimi CLI 正在退出，旧功能不能自动算作新版能力；
- 权限、沙箱、Skills/Hooks、多代理、Git/CI、SDK 等主题目前仍有较多待验证项。

## 适合谁

- 想要轻量终端 Agent 的开发者；
- 经常用录屏或视频描述 UI 问题的人；
- 看重快速安装、启动和交互响应的人；
- 愿意跟随新产品快速迭代的用户。

## 对 Qwen Code 最有参考价值的地方

轻量产品感：安装简单、启动快、TUI 流畅，以及把 MCP 配置和视频输入变成用户直接能
理解的体验，而不是只提供底层能力。

## 版本与来源

- 当前记录版本：`0.29.1`（2026-07-27）
- [Kimi Code 官方仓库](https://github.com/MoonshotAI/kimi-code)
- [官方 Releases](https://github.com/MoonshotAI/kimi-code/releases)
- [旧 Kimi CLI 仓库及迁移说明](https://github.com/MoonshotAI/kimi-cli)

详细口径见 [版本与证据](../docs/13-版本与证据.md)。

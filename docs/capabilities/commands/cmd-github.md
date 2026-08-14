# GitHub 设置

[返回 Slash 命令详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=cmd-github)

> 核对日期：2026-08-14

## 定义

从 CLI 启动产品提供的 GitHub App、GitHub Actions 或云端仓库工作流配置。

## 命令对照

| 产品 | 命令摘要 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/install-github-app` | 官方确认 |
| Codex | 无对应命令 | 未确认 |
| Qwen Code | `/setup-github` | 源码确认 |
| Kimi Code | 无对应命令 | 未确认 |
| Qoder CLI | `/setup-github` | 官方确认 |

## 比较边界

### 本页包含

- GitHub App 安装
- GitHub Actions 初始化
- 仓库连接
- 所需外部工具

### 本页不包含

- 普通 `gh` 命令调用
- 创建 PR 的完整行为
- 代码 Review 本身

## 跨产品事实

1. Qwen Code 和 Qoder CLI 都提供 `/setup-github`。
2. Claude Code 当前提供 `/install-github-app`，可选配置 Actions workflow 和 secrets。
3. Codex 通过 Cloud/GitHub 连接工作流提供相关能力，当前 CLI 命令表没有 `/setup-github`。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/install-github-app` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 为仓库安装 Claude GitHub App，并可继续设置 GitHub Actions workflow 与 secrets。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 修改 GitHub 仓库 App 和 Actions 配置 |
| 条件与边界 | 需要浏览器登录和仓库管理权限 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Commands](https://code.claude.com/docs/en/commands) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 主命令 | 无对应命令 |
| 别名 | 无公开别名 |
| 参数 | — |
| 执行行为 | Codex 支持 GitHub 和 Cloud 工作流，但当前 CLI Slash 命令表未列出 GitHub 设置命令。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | — |
| 条件与边界 | 不据此推断底层能力不存在 |
| 证据状态 | 未确认 |
| 来源 | [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/setup-github` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 设置 Qwen Code GitHub Actions 集成。 |
| 可用模式 | 仅交互式 |
| 保存范围 | 写入仓库 workflow 或相关配置 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code commands documentation](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/commands.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | 无对应命令 |
| 别名 | 无公开别名 |
| 参数 | — |
| 执行行为 | 当前官方命令目录未列出对应 Slash 命令。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | — |
| 条件与边界 | 不据此推断底层能力不存在 |
| 证据状态 | 未确认 |
| 来源 | [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860/docs/zh/reference/slash-commands.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/setup-github` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 设置 Qoder GitHub Actions。 |
| 可用模式 | TUI |
| 保存范围 | 写入仓库 GitHub Actions 配置 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference) |

## 官方来源

- [Claude Code Commands](https://code.claude.com/docs/en/commands)
- [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)
- [Qwen Code commands documentation](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/commands.md)
- [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860/docs/zh/reference/slash-commands.md)
- [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference)

## 关联能力

- [代码审查](./cmd-review.md)
- Pull Request：见对应能力矩阵
- [远程与跨端](./cmd-remote.md)

# Code Agent 能力矩阵

Claude Code、Codex、Qwen Code、Kimi Code、Qoder CLI 的功能对照表。内容按具体命令、配置和运行行为组织。

> 核对日期：2026-07-27
> 默认范围：命令行界面。桌面端、IDE、云端和 SDK 能力会单独标明。

## 在线查看

[打开能力矩阵网站](https://qqqys.github.io/code-agent/)

网页支持全文搜索、分类筛选、产品列开关和独立能力详情页。已完成的能力可进入完整页面，逐产品查看命令、参数、执行行为、适用模式、保存范围、条件和证据。

## 文档

| 文档 | 内容 |
| --- | --- |
| [Slash 命令矩阵](./docs/01-Slash命令矩阵.md) | 五家内置 `/xxx` 命令逐项对照，并列出各家的完整命令目录 |
| [Slash 命令详情](./docs/capabilities/commands/) | 28 个命令能力的独立详情，字段与网页详情页一致 |
| [Subagent 能力矩阵](./docs/02-Subagent能力矩阵.md) | 定义方式、上下文、模型、工具、权限、后台执行、嵌套和 Worktree |
| [Subagent 能力详情](./docs/capabilities/subagents/) | 22 个 Subagent 能力的独立详情，逐产品记录入口、上下文、隔离、限制和证据 |
| [权限与沙箱矩阵](./docs/03-权限与沙箱矩阵.md) | 审批模式、文件与网络边界、规则配置、非交互行为 |
| [会话与上下文矩阵](./docs/04-会话与上下文矩阵.md) | 恢复、分支、压缩、记忆、检查点和后台任务 |
| [扩展系统矩阵](./docs/05-扩展系统矩阵.md) | MCP、Skills、Hooks、插件、自定义命令和项目指令 |
| [任务执行与 Git 矩阵](./docs/06-任务执行与Git矩阵.md) | 文件修改、Shell、搜索、Review、PR、CI 和 Worktree |
| [Headless、SDK 与多端矩阵](./docs/07-Headless-SDK与多端矩阵.md) | 非交互调用、结构化输出、SDK、IDE、桌面、远程与云端 |
| [模型与认证矩阵](./docs/08-模型与认证矩阵.md) | 模型切换、Provider、自定义端点、登录方式和凭据来源 |
| [版本与证据](./docs/09-版本与证据.md) | 当前核对坐标、证据含义、Surface 规则和官方资料入口 |

## 表格约定

| 写法 | 含义 |
| --- | --- |
| 具体命令或行为 | 已在官方文档、官方仓库或公开源码中确认 |
| 条件项 | 只在特定平台、模式、配置或 Surface 中出现 |
| 未确认 | 当前一手资料不足 |
| `—` | 对应官方 Slash 命令表没有列出该命令；不表示底层能力不存在 |

矩阵只比较可核查的公开行为。同一品牌的 CLI、IDE、桌面端、云端和 SDK 不会互相代替。

## 仓库结构

```text
README.md   文档入口
docs/       Markdown 能力矩阵
             capabilities/ 独立能力详情
site/       GitHub Pages 静态网站
updates/    内容变更记录
```

发现内容变化或证据冲突时，请在 Issue 中写明产品、版本、Surface 和一手来源。

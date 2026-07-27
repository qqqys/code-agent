# Code Agent 五方功能对比（中文版）

> 对比对象：Claude Code、Codex、Qwen Code、Kimi Code、Qoder CLI
>
> 目标：不讲研究黑话，只回答“它们分别能做什么、差别在哪、怎么选”。
>
> 最近更新：2026-07-27

这个仓库是一份持续更新的中文 Code Agent 功能手册。首页给结论，专题文档讲差异，
产品档案讲单个工具；需要追溯时，再去看版本与证据。

## 高频入口

| 入口 | 适合谁 | 内容 |
| --- | --- | --- |
| [一页看懂五家差异](./docs/01-一页总览.md) | 只有 3 分钟 | 定位、强项、短板和推荐场景 |
| [完整功能矩阵](./docs/02-功能总矩阵.md) | 想逐项比较 | 终端、编辑、沙箱、MCP、多代理、SDK、远程执行等 |
| [怎么选](./docs/11-怎么选.md) | 正在做选型 | 按个人开发、企业治理、自动化、二次开发等场景推荐 |
| [Qwen Code 产品机会](./docs/12-Qwen-Code产品机会.md) | Qwen Code 产品与研发 | 对标四家后的可借鉴方向和优先级 |
| [五个产品档案](./products/) | 想单独了解某一家 | 每家的定位、强项、限制、适用人群和官方入口 |
| [版本与证据](./docs/13-版本与证据.md) | 想核对结论 | 版本快照、证据等级、官方来源与已知空白 |

## 30 秒选型

| 你的场景 | 优先看 | 为什么 |
| --- | --- | --- |
| 想要成熟的日常编码体验 | [Claude Code](./products/claude-code.md) | 终端工作流、Git、扩展和多端体验完整 |
| 重视系统级沙箱、治理和多代理工作台 | [Codex](./products/codex.md) | 本地沙箱、CLI/IDE/App/Cloud 和长任务编排结合紧密 |
| 想要开源、多模型、可二次开发 | [Qwen Code](./products/qwen-code.md) | 多 Provider、Daemon、SDK、IDE/Desktop/IM 入口最宽 |
| 想要轻量快速 TUI 和视频输入 | [Kimi Code](./products/kimi-code.md) | 单文件分发、快速启动、视频输入、对话式 MCP 配置 |
| 想要商业产品、云端远程任务和 Agent SDK | [Qoder CLI](./products/qoder-cli.md) | CLI、Subagent、权限、Cloud Mode、Python/TypeScript SDK 一体化 |

这不是绝对排名。模型质量、账号套餐、地区、网络和团队治理要求，都会改变最终体验。

## 五家定位

| 产品 | 一句话定位 | 最明显的长板 | 主要取舍 |
| --- | --- | --- | --- |
| [Claude Code](./products/claude-code.md) | Anthropic 的全栈编码 Agent | 成熟工作流、Git、Skills/Hooks/MCP、多端协同 | 主要围绕 Claude 账号与模型生态 |
| [Codex](./products/codex.md) | OpenAI 的本地、桌面与云端 Agent 平台 | 原生沙箱、并行 Agent、App/Cloud/CLI 连续体验 | 平台能力多，需区分 CLI、App 和 Cloud |
| [Qwen Code](./products/qwen-code.md) | 开源、多 Provider 的 Agent 运行时 | 开源、多协议、Daemon、SDK、IDE/Desktop/IM | 功能面很宽，部分能力仍快速变化 |
| [Kimi Code](./products/kimi-code.md) | Moonshot 的新一代轻量终端 Agent | 单文件、快速 TUI、视频输入、对话式 MCP | 新产品迭代快，部分旧 Kimi CLI 结论不能直接沿用 |
| [Qoder CLI](./products/qoder-cli.md) | Qoder 商业 Agent 的终端和 SDK 入口 | 云端任务、Subagent、权限、SDK、产品账号体系 | 开放性和 Provider 自由度不如开源方案透明 |

## 按功能阅读

| 专题 | 主要问题 |
| --- | --- |
| [终端、代码与任务执行](./docs/03-终端代码与任务执行.md) | 能不能读代码、改文件、跑命令、做长任务？ |
| [模型、Provider 与认证](./docs/04-模型Provider与认证.md) | 能用哪些模型？怎么登录？能否接自定义 Provider？ |
| [权限、审批与沙箱](./docs/05-权限审批与沙箱.md) | 哪些操作会询问？能否真正隔离文件和网络？ |
| [会话、上下文与记忆](./docs/06-会话上下文与记忆.md) | 能否恢复、分支、压缩上下文和跨会话记住项目？ |
| [MCP、Skills、Hooks 与插件](./docs/07-MCP-Skills-Hooks与插件.md) | 怎么接工具、复用流程、扩展能力？ |
| [多代理、后台任务与 Worktree](./docs/08-多代理后台任务与Worktree.md) | 能否并行派活、隔离工作区和管理后台任务？ |
| [Git、Review 与 CI](./docs/09-Git-Review与CI.md) | 能否提交、审查、开 PR、跑 CI？ |
| [Headless、SDK、远程与多端](./docs/10-Headless-SDK远程与多端.md) | 能否被脚本、平台、IDE、桌面或云端调用？ |

## 证据标签

- **已实测**：在记录版本上真实运行过。
- **官方确认**：来自官方文档、官方仓库、Release 或 Changelog。
- **源码确认**：来自公开源码。
- **待验证**：目前没有足够的一手证据；不等于“不支持”。

详细口径见 [阅读指南](./docs/00-阅读指南.md)。

## 仓库结构

```text
README.md          首页与快速导航
docs/              中文横向对比专题
products/          五个产品的独立档案
updates/           每次有意义更新的记录
research/          历史研究过程与证据档案
interactive-site/  早期交互页面实验
```

## 持续更新

本仓库按天检查五家官方文档、官方仓库、Release 和 Changelog。只有发现可靠且有阅读
价值的变化时才提交，不为了“日更”制造内容。

如发现错误，请用 Issue 指出产品、版本、Surface 和对应官方来源。

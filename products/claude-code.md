# Claude Code

[返回产品档案](./README.md) · [查看五方矩阵](../docs/02-功能总矩阵.md)

## 一句话定位

Claude Code 是 Anthropic 的编码 Agent 产品，核心体验从终端出发，并延伸到 IDE、
Desktop、Web、CI 和 Agent SDK。它的长板是日常工程工作流成熟，而不是某一个孤立命令。

## 主要能力

| 领域 | 表现 |
| --- | --- |
| 编码 | 搜索、读取、编辑文件，运行命令，处理跨文件任务 |
| Git | 检查 Diff、提交、分支、PR、Review 和 CI 工作流 |
| 上下文 | `CLAUDE.md`、Resume/Fork、`/compact`、Auto Memory |
| 扩展 | MCP、Skills、Hooks、Plugins/Marketplace |
| 多代理 | 自定义 Agent，支持前台/后台任务和 Worktree 工作流 |
| 自动化 | Headless、Agent SDK、GitHub Actions、GitLab CI/CD |
| 多端 | Terminal、VS Code、JetBrains、Desktop、Web |
| 安全 | Permission Mode、规则、Managed Policy 和沙箱路径 |

## 使用体验

Claude Code 很像一位长期待在终端里的工程师同事：先读项目约定，再搜索和修改代码，
过程中按权限规则询问，最后帮助检查 Diff、运行测试和完成 Git 交付。Skills、Hooks、
MCP 和 Plugins 把个性化、工具接入、生命周期自动化和分发拆成清楚的概念。

## 明显优势

- 终端编码、Git 和扩展体验收口较好；
- 项目指令、自动记忆和会话恢复形成连续上下文；
- CLI、IDE、Desktop、Web、SDK 和 CI 覆盖完整；
- 企业策略和权限文档较成熟。

## 主要取舍

- 主路径围绕 Claude 模型、订阅和 Anthropic 服务；
- 部分能力取决于账号、套餐、地区或具体 Surface；
- 扩展体系丰富，也需要团队治理来源、权限与版本。

## 适合谁

- 主要在终端中工作的个人开发者；
- 想要成熟 Git/PR/CI 协作的团队；
- 使用 Claude 模型，希望快速进入完整 Agent 工作流的人；
- 需要通过 SDK 或 CI 嵌入 Claude Agent 的平台团队。

## 对 Qwen Code 最有参考价值的地方

不是照搬命令名，而是学习它如何把项目指令、记忆、Skill、Hook、MCP、Agent 和 Git
交付串成用户容易理解的一条工作流。

## 版本与来源

- 当前记录版本：`2.1.220`（2026-07-27）
- [官方概览](https://code.claude.com/docs/en/overview)
- [官方安全文档](https://code.claude.com/docs/en/security)
- [官方 MCP 文档](https://code.claude.com/docs/en/mcp)

详细口径见 [版本与证据](../docs/13-版本与证据.md)。

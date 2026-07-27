# 任务执行与 Git 矩阵

[返回文档目录](./README.md) · [网页矩阵](https://qqqys.github.io/code-agent/#execution)

## 代码与命令执行

| 能力 | Claude Code | Codex | Qwen Code | Kimi Code | Qoder CLI |
| --- | --- | --- | --- | --- | --- |
| 读取文件 | 内置工具 | 内置工具 | 内置工具 | 内置工具 | 内置工具 |
| 修改文件 | 内置工具 | 内置工具 | 内置工具 | 内置工具 | 内置工具 |
| 执行 Shell | Bash 工具 | Shell 工具 | Shell 工具 | Shell 工具 | Shell 工具 |
| 搜索文件与代码 | Glob、Grep 等工具 | 搜索与 Shell 工具 | Glob、Grep 等工具 | 搜索工具 | 搜索工具 |
| 查看 Diff | `/diff` | `/diff` | `/diff` | 通过 Git/Shell；无对应 Slash 命令 | 通过 Git/Shell；无对应 Slash 命令 |
| 后台 Shell | `/background`、`/bg` | 任务线程与 Shell | 后台 Shell 与 `/tasks` | 后台任务 | 后台任务 |
| 长任务列表 | `/tasks` | `/ps` | `/tasks` | `/tasks` | `/tasks` |
| 批量并行任务 | `/batch` | Subagent 并行 | 多 Agent 与 Arena | `/swarm` | Subagent 与 `/quest` |
| Worktree 隔离 | `/batch` 可使用 | Subagent 页面未确认 | Agent `isolation: "worktree"` | Agent 页面未确认 | Agent `isolation: worktree` |
| 浏览网页 | Chrome、WebFetch、WebSearch 等 | Apps/MCP/工具 | Web 工具或 MCP，依配置 | `/web` | Web/MCP 工具，依配置 |
| 图像输入 | 支持 | 支持 | 支持 | 支持 | 支持情况依模型与入口 |
| 语音输入 | 未确认 CLI Slash 命令 | 未确认 CLI Slash 命令 | `/voice` | 未确认 | 未确认 |
| 视频输入 | 未确认 CLI 原生入口 | 未确认 CLI 原生入口 | 未确认 | 官方模型与入口支持情况需按版本核对 | 未确认 |

## Git 与交付

| 能力 | Claude Code | Codex | Qwen Code | Kimi Code | Qoder CLI |
| --- | --- | --- | --- | --- | --- |
| Git 状态、提交、分支 | 通过 Shell 与内置工作流 | 通过 Shell 与内置工作流 | 通过 Shell 与内置工作流 | 通过 Shell | 通过 Shell |
| 代码 Review 命令 | `/review`、`/code-review` | `/review` | 当前命令表未列出 | 当前命令表未列出 | `/review` |
| 安全 Review 命令 | `/security-review` | Review 可指定安全范围 | 当前命令表未列出 | 当前命令表未列出 | Review 可指定范围 |
| 自动修复 PR | `/autofix-pr` | GitHub/Cloud 工作流 | GitHub 工作流与插件 | 未确认 | Cloud/GitHub 工作流 |
| GitHub 初始化 | 插件或 GitHub App | GitHub/Cloud 连接 | `/setup-github` | 未确认 | `/setup-github` |
| 创建 PR | 通过 `gh`、插件或 GitHub App | 通过 `gh` 或 Cloud | 通过 `gh`、插件或工作流 | 通过 `gh` | 通过 GitHub/Cloud |
| 检查 CI | 通过 `gh`、插件或 GitHub App | 通过 `gh` 或 Cloud | 通过 `gh`、插件或工作流 | 通过 `gh` | 通过 GitHub/Cloud |
| 云端执行仓库任务 | Remote Control/Web 等入口 | Codex Cloud | Daemon/远程入口依部署 | 未确认 | Cloud Mode |
| 会话关联代码差异 | `/diff`、检查点 | `/diff`、线程 | `/diff`、回退与恢复 | `/undo` 与 Git | Review/任务 |

## 来源

- [Claude Code Common workflows](https://code.claude.com/docs/en/common-workflows)
- [Codex CLI](https://developers.openai.com/codex/cli)
- [Qwen Code Documentation](https://github.com/QwenLM/qwen-code/tree/main/docs/users)
- [Kimi Code Documentation](https://github.com/MoonshotAI/kimi-code/tree/main/docs/zh)
- [Qoder CLI](https://docs.qoder.com/en/cli)

# 增加 Headless、SDK 与多端能力独立详情页

Headless、SDK 与多端从一张混合表拆成 10 个可打开的能力页：Headless 调用、结构化输出、Agent SDK、服务端与 Daemon、CLI、IDE 与 ACP、Web 界面、桌面端、云端仓库任务、远程接管与跨端继续。

本次逐产品补充入口与调用、协议与输出、具体行为、会话与状态、工具与能力、认证与权限、运行位置、条件和官方来源，并同步修正以下旧结论：

- Qwen Code 已提供公开的 TypeScript SDK、实验性 `qwen serve`、内置 Web Shell 和 Qwen Code Desktop；Daemon 当前仍以本地单机和小团队为边界。
- Kimi Code 已提供 `kimi -p`、`stream-json`、`kimi acp`、官方 VS Code Extension 和 `kimi web`；仓库内 TypeScript SDK 包尚未公开发布，不记作可安装的公共 SDK。
- Codex SDK 当前同时覆盖 TypeScript 与 Python；`codex app-server` 可通过 stdio、Unix socket 或实验性 WebSocket 承载富客户端和远程 TUI。
- Claude Code 的 Cloud session、Remote Control 和 teleport 分开记录：Cloud 在托管 VM 执行，Remote Control 留在本机，teleport 把云会话带回 CLI。
- Qoder CLI 的 Print Mode、ACP、Remote Control Daemon、Cloud Mode 和 SDK Cloud Agent 分开记录，不再把 Cloud Mode 当作远程接管本机会话。
- “Web 界面”和“托管云任务”拆成两个字段；Qwen Code 与 Kimi Code 的 Web UI 当前由用户本地服务进程托管。

网页与 Markdown 使用同一份矩阵数据和详情记录。

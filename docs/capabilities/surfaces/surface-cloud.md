# 云端仓库任务

[返回 Headless、SDK 与多端详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=surface-cloud)

> 核对日期：2026-08-10

## 定义

由厂商管理的隔离计算环境克隆或连接远端仓库，在用户机器离线后仍能持续执行 Agent 任务。

## 能力结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `claude --remote` · Web Cloud · 条件：`claude self-hosted-runner` 自托管云会话执行（Team/Enterprise 公测） | 条件项 |
| Codex | Codex Cloud | 官方确认 |
| Qwen Code | 无托管云任务；`qwen serve` 为自托管 | 条件项 |
| Kimi Code | 无托管云任务；`kimi web` 为自托管 | 条件项 |
| Qoder CLI | `qodercli --remote` · Cloud Mode | 官方确认 |

## 比较边界

### 本页包含

- 托管 VM/容器与后台执行
- 仓库、环境和任务生命周期
- 从 CLI/Web 发起并在其他 Surface 继续
- 云会话派发到组织自有 Runner（Claude Code Self-hosted environments）

### 本页不包含

- 把本地 Daemon 部署到自己的服务器
- Remote Control 本机任务
- 普通第三方 CI Runner

## 跨产品事实

1. Claude Code、Codex 和 Qoder 提供明确的托管云任务；Qwen Code 与 Kimi Code 当前公开服务都是用户自托管。
2. Claude Code v2.1.224 起提供 Self-hosted environments：云会话的执行主机可以换成组织自己部署的 Runner，会话调度与推理仍在 Anthropic 侧（Team/Enterprise 公测，默认关闭）。
3. 托管云任务通常只能看到 Git 仓库、显式环境和 secrets，看不到用户机器上未上传的任意文件。
4. Qoder Cloud Mode 与 Remote Control 明确互补：前者关闭本机仍运行，后者要求本机在线。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `claude --remote` · Web Cloud · 条件：`claude self-hosted-runner` 自托管云会话执行（Team/Enterprise 公测） |
| 入口与调用 | `claude --remote "<task>"`、claude.ai/code 或 Desktop Remote 环境；v2.1.224 起另有 Self-hosted environments：Owner/admin 在 claude.ai `Cloud environments` 管理页开启 `Allow self-hosted environments`、创建环境并一次性复制 environment key，组织主机运行 `claude self-hosted-runner`（`claude self-hosted-runner setup` 引导，或带 `--environment-secret-file` 与 `--base-dir` 手动启动，要求 v2.1.224+）。 |
| 协议与输出 | 创建 Anthropic 托管 Cloud session；CLI 可用 `/tasks` 查看，`--teleport`/`/teleport` 拉回本地。Self-hosted environments 由 Environment、Runner、Session 三部分组成：开发者启动云会话时在环境选择器中同时看到 Anthropic 托管环境与组织自建环境，选中后 Anthropic 控制面把会话排入环境队列，Runner 认领、克隆仓库并在组织主机派生 Claude Code 子进程执行；队列轮询、事件流与模型推理都是到 `api.anthropic.com` 的出站 HTTPS，Anthropic 不向组织网络发起入站连接。Runner 可手动常驻，也可运行 `claude self-hosted-runner orchestrator` 自动扩缩，按 `spawn-runner` hook 为排队会话逐个拉起 Runner，工作完成后 Runner 自行退出。 |
| 具体行为 | 在新 VM 中克隆仓库、运行 setup、执行任务、生成 Diff/分支并可在 Web/移动端继续。Self-hosted 会话改在组织主机执行：claude.ai、移动端与桌面端应用、终端 `claude --cloud` 以及定时 routines 启动的云会话都可选择自托管环境，仓库 checkout 与产物留在组织网络内；Claude Tag、Claude Security 与 Code Review 会话暂不路由到自托管环境。 |
| 会话与状态 | 任务在本机关闭后继续；会话、分支和对话保存在账号侧，环境闲置后可回收再恢复。Runner 侧 `--capacity` 默认 1 个并发会话，同一 Runner 的会话属于同一锁定账号（可用 `--lock-to-account` 在启动时预锁定）；`--release-idle-session-min` 释放空闲会话、`--drain-grace-sec`/`--drain-wait-sec` 控制排空与 SIGTERM 宽限、`--kill-session-after-min` 限制会话寿命、`--retire-at` 定时退役 Runner。 |
| 工具与能力 | 使用仓库内 CLAUDE.md、settings、MCP、Skills、Agents 和 Hooks；用户 home 配置不会自动带入。Self-hosted 场景可在 Runner 镜像或主机预装编译器、SDK 等工具；`SELF_HOSTED_RUNNER_HOST_CONFIG_DIR`（默认 `~/.claude`）在启动时快照并注入每个会话的 `CLAUDE_CONFIG_DIR`，也是 Runner 读取 `.claude.json` 做 MCP seeding 的位置；`--trust-workspace` 默认开启，为会话仓库路径预置信任，使仓库内 `permissions.allow` 与 `additionalDirectories` 生效。 |
| 认证与权限 | Claude 账号；通常连接 GitHub，也支持仓库 bundle fallback。Self-hosted 环境以单一 environment secret 认证并注册 Runner，key 在 claude.ai 只显示一次、365 天后过期；git 认证可选 Anthropic git 代理（`--use-anthropic-git-proxy`，按会话铸造短期令牌、要求 `--capacity 1`）、`--configure-git` 写全局 git 身份并启用 Anthropic 提交签名，或镜像自带配置。 |
| 运行位置 | Anthropic 管理的 Ubuntu VM 与可配置 Cloud environment；Self-hosted environments 为 Team/Enterprise 公测、默认关闭，要求组织已启用 Claude Code on the web，Runner 与 orchestrator 运行在组织自有的 Linux 或 macOS 主机；官方不发布预构建 Runner 镜像，需围绕 `claude` 二进制自建镜像或进程，文档提供 Kubernetes 与 Docker Compose 部署示例，`--health-port`（默认 8080）暴露 `/healthz` 与 Prometheus `/metrics`。 |
| 条件与边界 | 资源、网络和 secrets 有独立限制；本地未提交内容只有在显式 bundle 路径中才可能上传，未跟踪文件不包含。Self-hosted environments 不适用于启用 Zero Data Retention 的组织；会话推理走 Anthropic API，不能改经 Amazon Bedrock、Google Cloud’s Agent Platform、Microsoft Foundry 或 LLM gateway；仓库来源当前为 GitHub；官方将它与 Remote Control 区分为不同能力，后者面向自有常开主机上的本地会话，Pro/Max 计划也可用。 |
| 证据状态 | 条件项 |
| 来源 | [Claude Code on the web](https://code.claude.com/docs/en/claude-code-on-the-web)、[Claude Code Desktop](https://code.claude.com/docs/en/desktop)、[Claude Code self-hosted environments](https://code.claude.com/docs/en/self-hosted-environments)、[Claude Code self-hosted environments quickstart](https://code.claude.com/docs/en/self-hosted-environments-quickstart)、[Claude Code self-hosted environments reference](https://code.claude.com/docs/en/self-hosted-environments-reference)、[Claude Code v2.1.224 changelog (self-hosted environments)](https://github.com/anthropics/claude-code/blob/66edf5358349/CHANGELOG.md) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | Codex Cloud |
| 入口与调用 | Codex Cloud Web、CLI Cloud 入口，或从 GitHub、Linear、Slack 发起。 |
| 协议与输出 | 每个任务运行在专用隔离 Cloud environment，支持后台与并行。 |
| 具体行为 | 连接 GitHub、执行 setup、运行任务、展示摘要和 Diff，并可继续修改或开 PR。 |
| 会话与状态 | Cloud chat、code review 和环境保存在账号/工作区；任务不依赖本机持续在线。 |
| 工具与能力 | 使用环境中安装的工具、变量、secrets 和网络规则。 |
| 认证与权限 | ChatGPT/Codex 账号与 GitHub/第三方集成授权。 |
| 运行位置 | OpenAI 托管云环境。 |
| 条件与边界 | Cloud 使用远端仓库状态；本地未提交改动和本机专有依赖不会自动出现。 |
| 证据状态 | 官方确认 |
| 来源 | [Codex cloud](https://learn.chatgpt.com/docs/cloud)、[Codex GitHub integration](https://learn.chatgpt.com/docs/third-party/github) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 无托管云任务；`qwen serve` 为自托管 |
| 入口与调用 | 当前没有厂商托管的 Qwen Code 仓库任务入口；可自行部署 `qwen serve` 或在 CI 中运行 Headless。 |
| 协议与输出 | 自托管 HTTP + SSE Daemon 或普通 CLI 进程，不是 Qwen 管理的 Cloud task API。 |
| 具体行为 | 用户可在自己的远程主机上保持 Agent 服务，但任务生命周期、队列、TLS、存储和故障恢复由用户负责。 |
| 会话与状态 | 会话落在用户选择的机器和本地磁盘。 |
| 工具与能力 | 可使用该自托管环境中的全部 Qwen Code 工具。 |
| 认证与权限 | Provider 认证与自建 Daemon bearer token。 |
| 运行位置 | 用户机器、服务器或 CI；不属于厂商托管云。 |
| 条件与边界 | “可以部署到云主机”不等于“提供 Cloud Mode”；当前 qwen serve 文档还明确限定 alpha 的本地部署边界。 |
| 证据状态 | 条件项 |
| 来源 | [Qwen Code current daemon and Web Shell](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/qwen-serve.md)、[Qwen Code current headless mode](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/headless.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 无托管云任务；`kimi web` 为自托管 |
| 入口与调用 | 当前没有厂商托管的 Kimi Code 仓库任务入口；可在自己的主机运行 `kimi web` 或 Headless。 |
| 协议与输出 | 自托管 REST + WebSocket/Web UI 或单次 CLI 进程。 |
| 具体行为 | 远程服务器可运行 Kimi Agent，但仓库克隆、后台任务、网络、TLS 和恢复由部署者管理。 |
| 会话与状态 | 会话与文件保存在运行 kimi 的主机。 |
| 工具与能力 | 使用该主机上的 Kimi Code 工具和 Provider。 |
| 认证与权限 | Kimi/Provider 认证与 Web bearer token。 |
| 运行位置 | 用户管理的本机、服务器或 CI；无公开托管 Cloud Agent。 |
| 条件与边界 | 本地 Web UI 与可绑定远程地址不构成厂商托管云任务。 |
| 证据状态 | 条件项 |
| 来源 | [Kimi Code current CLI, Headless and Web reference](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/kimi-command.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `qodercli --remote` · Cloud Mode |
| 入口与调用 | `qodercli --remote "<task>"`；Web 选择 Cloud environment；`/remote-env` 设置默认环境。 |
| 协议与输出 | 在 Qoder 管理的 VM 创建 Cloud Session，CLI 通过流式通道显示事件，结束后打印 Web URL。 |
| 具体行为 | 任务在 Cloud environment 中读写远端 GitHub 仓库；关闭本地终端后继续运行，可从 Web console 跟进。 |
| 会话与状态 | 每次 `--remote` 创建独立 Cloud Session；环境和会话由账号侧保存。 |
| 工具与能力 | 使用云环境中的工具和仓库；SDK 实验性 Cloud Agent 也能通过 SSE 驱动该运行时。 |
| 认证与权限 | Qoder 登录/PAT、Cloud environment ID 和对应 GitHub 仓库授权。 |
| 运行位置 | Qoder 托管 Cloud VM/容器。 |
| 条件与边界 | 不能读取本地未提交修改；Ctrl+C 只断开 CLI 订阅，不会停止云任务。 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI Cloud Mode](https://docs.qoder.com/en/cli/cloud-mode)、[Qoder SDK Cloud Agent](https://docs.qoder.com/en/cli/sdk/cloud-agent) |

## 官方来源

- [Claude Code on the web](https://code.claude.com/docs/en/claude-code-on-the-web)
- [Claude Code Desktop](https://code.claude.com/docs/en/desktop)
- [Claude Code self-hosted environments](https://code.claude.com/docs/en/self-hosted-environments)
- [Claude Code self-hosted environments quickstart](https://code.claude.com/docs/en/self-hosted-environments-quickstart)
- [Claude Code self-hosted environments reference](https://code.claude.com/docs/en/self-hosted-environments-reference)
- [Claude Code v2.1.224 changelog (self-hosted environments)](https://github.com/anthropics/claude-code/blob/66edf5358349/CHANGELOG.md)
- [Codex cloud](https://learn.chatgpt.com/docs/cloud)
- [Codex GitHub integration](https://learn.chatgpt.com/docs/third-party/github)
- [Qwen Code current daemon and Web Shell](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/qwen-serve.md)
- [Qwen Code current headless mode](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/headless.md)
- [Kimi Code current CLI, Headless and Web reference](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/kimi-command.md)
- [Qoder CLI Cloud Mode](https://docs.qoder.com/en/cli/cloud-mode)
- [Qoder SDK Cloud Agent](https://docs.qoder.com/en/cli/sdk/cloud-agent)

## 关联能力

- [Web 界面](./surface-web.md)
- [远程接管与跨端继续](./surface-remote-control.md)
- [CI 自动化](../execution/execution-ci.md)

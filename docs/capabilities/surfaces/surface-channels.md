# 消息平台渠道

[返回 Headless、SDK 与多端详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=surface-channels)

> 核对日期：2026-10-09

## 定义

把第三方聊天平台、代码托管平台或邮箱当作 Agent 会话的输入与输出通道：消息从厂商自有界面之外进入，回复沿同一条通道送出。

## 能力结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | 条件：`claude --channels plugin:<name>@<marketplace>`；研究预览内置 Telegram、Discord、iMessage（仅 macOS）与 `fakechat` 演示渠道 | 条件项 |
| Codex | CLI 无渠道入口；条件：Slack 中提及 `@ChatGPT` 把仓库工作委派给 Codex Cloud | 条件项 |
| Qwen Code | `qwen channel start` · `channels.<name>.type`：`telegram`/`weixin`/`qq`/`dingtalk`/`dws`/`wecom`/`feishu`/`github`/`gitlab`/`email`；条件：Email 渠道 IMAP + SMTP（main 分支，尚未发布） | 官方确认 |
| Kimi Code | 无第三方消息平台或邮箱渠道；`kimi web` 与 Remote Control 是自有浏览器窗口 | 条件项 |
| Qoder CLI | CLI 无第三方消息渠道；条件：Qoder Action 在 GitHub Issue/PR 以 `@qoder` 提及触发，代码在 GitHub Runner 执行 | 条件项 |

## 比较边界

### 本页包含

- 渠道的启动入口、适配器类型与配置键
- 入站消息的访问控制、会话归属与并发上限
- 平台凭据的保存位置与组织级开关

### 本页不包含

- 厂商自有的 Web、Desktop、移动 App 与 Remote Control 界面
- CI 与 Pull Request 自动化（见代码 Review、Pull Request 与 CI 字段）
- 同一产品内不同会话之间的消息投递（见跨会话消息字段）

## 跨产品事实

1. 只有 Qwen Code 与 Claude Code 提供把第三方聊天平台接入本机会话的一等入口：Qwen 用 `qwen channel start` 加载内置适配器，Claude 用 `claude --channels` 加载渠道插件。
2. 两家都要求先绑定平台侧凭据（Bot token、App Secret 或邮箱账号密码），也都默认只放行已配对或白名单内的发送者，未放行的消息直接丢弃。
3. Codex 与 Qoder 的第三方平台入口都不在 CLI：Codex 的 Slack 提及把仓库工作交给 Codex Cloud，Qoder 的 `@qoder` 提及由 GitHub Action 在 GitHub Runner 执行，本机 CLI 都不监听聊天平台。
4. Kimi Code 没有任何第三方消息平台或邮箱适配器；`kimi web` 与 Remote Control 中继只是自有浏览器窗口，官方文档明确任务始终在本机执行。
5. 常驻方式不同：Qwen 的 `qwen channel start` 在前台跑一个被全部渠道共享的 Agent 进程，Claude 的渠道事件只在已打开的会话期间到达，需要常驻就得把会话跑在后台进程或长开终端里。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 条件：`claude --channels plugin:<name>@<marketplace>`；研究预览内置 Telegram、Discord、iMessage（仅 macOS）与 `fakechat` 演示渠道 |
| 入口与调用 | `claude --channels plugin:telegram@claude-plugins-official`，多个条目用空格分隔，也支持 `server:<name>` 形式接入自建事件源。插件先安装：`/plugin install telegram@claude-plugins-official`、`/plugin install discord@claude-plugins-official`、`/plugin install imessage@claude-plugins-official` 或 `/plugin install fakechat@claude-plugins-official`；缺少市场时先 `/plugin marketplace add anthropics/claude-plugins-official`。研究预览期间 `--channels` 与 `--dangerously-load-development-channels` 都不出现在 `claude --help`。 |
| 协议与输出 | 官方定义：“A channel is an MCP server that pushes events into your running Claude Code session”，可双向——Claude 读取事件后经同一渠道回复，像一座聊天桥。预置渠道插件是 Bun 脚本，本机需装有 Bun；自建渠道可用 Bun、Node 或 Deno 并依赖 `@modelcontextprotocol/sdk`。 |
| 具体行为 | 研究预览内置 Telegram、Discord、iMessage 与本机演示用 `fakechat`；官方两页均无 email/IMAP/SMTP、Microsoft Teams 或国内 IM 适配器。事件只在会话打开期间到达。v2.1.211 及以上在中继前净化 `description` 与 `input_preview`（中和方向覆盖与不可见字符、折叠空白，最多中继 3500 码点），更早版本原样中继 `description` 并把 `input_preview` 截到 200 个 UTF-16 单元；v2.1.234 及以上只把权限请求发给注册为渠道的服务器、不可序列化字段中继为 `(value unserializable)`、可识别的 Provider 凭据 token 打码为 `[REDACTED]`，更早版本把 `claude/channel/permission` 返回 `false` 当作已声明。 |
| 会话与状态 | Telegram token 保存在 `~/.claude/channels/telegram/.env`，Discord 保存在 `~/.claude/channels/discord/.env`，也可改用 `TELEGRAM_BOT_TOKEN`、`DISCORD_BOT_TOKEN` 环境变量；发送者白名单由各插件自己维护。iMessage 不需要 token。调试日志在 `~/.claude/debug/<session-id>.txt`。 |
| 工具与能力 | 渠道只把外部事件送进本机会话，工具、文件与命令仍在运行 `claude` 的机器上执行。项目信任与 MCP 服务器同意对话框不经权限请求中继，只出现在本地终端。 |
| 认证与权限 | 要求 claude.ai 或 Console API Key 认证，Amazon Bedrock、Google Cloud's Agent Platform 与 Microsoft Foundry 上不可用。Telegram 与 Discord 先给机器人发任意消息取得配对码，再用 `/telegram:access pair <code>` 或 `/discord:access pair <code>` 录入；`/telegram:access policy allowlist` 或 `/discord:access policy allowlist` 收紧为只允许自己的账号，未加入白名单的发送者被静默丢弃。iMessage 自聊天免配置直通，其他发送者用 `/imessage:access allow +15551234567` 添加（手机号为 `+country` 格式或 Apple ID 邮箱）。 |
| 运行位置 | 运行在本机 CLI 会话内。iMessage 渠道仅 macOS：直接读取 Messages 数据库、经 AppleScript 发送回复，不需要 bot token 或外部服务，但要给终端 App 授予完全磁盘访问权限。 |
| 条件与边界 | 官方标注 “Channels are a research preview feature”，可用范围分批放开，`--channels` 语法与协议约定可能变化。组织侧由两个 Managed 作用域设置控制：`channelsEnabled`（允许本组织使用渠道）与 `allowedChannelPlugins`（替换默认可推送消息的渠道插件白名单，条目为 `{marketplace, plugin}` 或 `plugin@marketplace` 字符串）。Team 与 Enterprise 必须显式开启；无组织的 Pro/Max 用户跳过这些检查、按会话用 `--channels` 自行开启；Console 组织在未部署托管设置时默认允许。`--dangerously-load-development-channels` 需全屏确认后按条目绕过插件白名单，但不绕过 `channelsEnabled`，也不会把豁免扩展到 `--channels` 的条目。研究预览期间自定义渠道与社区市场都不在白名单内。官方明确警告：按群/聊天 ID 而非发送者 ID 做门禁会让白名单群里任何人都能注入消息。 |
| 证据状态 | 条件项 |
| 来源 | [Claude Code Channels](https://code.claude.com/docs/en/channels)、[Claude Code Channels reference](https://code.claude.com/docs/en/channels-reference)、[Claude Code platforms and integrations](https://code.claude.com/docs/en/platforms)、[Claude Code settings reference](https://code.claude.com/docs/en/settings-reference) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | CLI 无渠道入口；条件：Slack 中提及 `@ChatGPT` 把仓库工作委派给 Codex Cloud |
| 入口与调用 | CLI 无渠道入口：官方命令参考没有 `channel`、`channels`、`slack`、`telegram` 或 `email` 子命令，TUI Slash 命令定义源码也没有对应命令。第三方平台入口在 Slack：在已启用 App 的频道里提及 `@ChatGPT`（此前为 `@Codex`）。 |
| 协议与输出 | Slack 侧由工作区的 ChatGPT Slack 部署承接；开启 Cloud delegation 后，ChatGPT 把仓库工作转交一个独立的 Codex Cloud 任务并把结果送回原线程。没有 CLI 侧协议、配置键或本机监听端口。 |
| 具体行为 | 官方描述为 “Start requests in Slack and delegate repository work to Codex Cloud”。在频道里提及 `@ChatGPT` 并说明想要的结果（编码工作要带上仓库与线程上下文），完成账号连接与审批提示后由 Cloud 执行；同一线程再次提及可继续相关请求。 |
| 会话与状态 | 任务与产物留在 Codex Cloud 环境，不写入本机；CLI 会话不参与，因此没有本机渠道状态目录，也没有按平台账号保存的凭据文件。 |
| 工具与能力 | 使用所选 Codex Cloud 环境的检出与工具，不使用本机 CLI 的工具、沙箱或文件。 |
| 认证与权限 | 需要 ChatGPT 工作区所有者或管理员部署 Slack App 并开启 Codex Cloud for Slack；工作区必须有一个已发布且共享给工作区的 Cloud 环境，个人 Cloud 环境不参与；开启 Codex Cloud 基于角色的访问控制时，部署的服务账号与发起用户都需要 Cloud 访问权限。首次使用要在 Slack 消息里选择连接链接登录，并回到原线程重试。 |
| 运行位置 | 执行位置是 OpenAI 托管的 Codex Cloud，Slack 只是发起与回报通道。 |
| 条件与边界 | 这是 ChatGPT + Codex Cloud Surface 的能力，不能算作 Codex CLI 的消息渠道：官方 Slack 页没有出现 CLI、终端或本机执行。跨组织共享的 Slack Connect 频道不支持该流程。Codex CLI 自己的远程入口（app-server、Cloud、远程接管）记在对应 Surface 字段，都不监听第三方聊天平台或邮箱。 |
| 证据状态 | 条件项 |
| 来源 | [Codex Slack 集成（委派给 Codex Cloud）](https://learn.chatgpt.com/docs/third-party/slack)、[Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)、[Codex cloud](https://learn.chatgpt.com/docs/cloud) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `qwen channel start` · `channels.<name>.type`：`telegram`/`weixin`/`qq`/`dingtalk`/`dws`/`wecom`/`feishu`/`github`/`gitlab`/`email`；条件：Email 渠道 IMAP + SMTP（main 分支，尚未发布） |
| 入口与调用 | `qwen channel start` 启动 `settings.json` 中 `channels` 下的全部渠道，`qwen channel start <name>` 只启动一个；`qwen channel status` 查看是否运行、运行时长与各渠道会话数，`qwen channel stop` 从另一个终端停止，前台运行时 `Ctrl+C` 同样可停。渠道类型写在 `channels.<name>.type`：`telegram`、`weixin`、`qq`、`dingtalk`、`dws`、`wecom`、`feishu`、`github`、`gitlab`、`email`，或由扩展提供自定义类型；内置适配器以 `@qwen-code/channel-*` 包在 CLI 渠道注册表中登记。 |
| 协议与输出 | Email 渠道用 IMAP 轮询收信、SMTP over TLS 回信：隐式 TLS 默认 IMAP 993、SMTP 465；`imapSecure` 或 `smtpSecure` 设为 `false` 改用 STARTTLS，默认端口变为 143 与 587，STARTTLS 与证书校验强制保留，`imapPort`/`smtpPort` 可覆盖，私有 CA 要在启动前配置 Node 的 `NODE_EXTRA_CA_CERTS`。适配器关闭协议日志，连接失败不带凭据上报。其余渠道走各平台自己的长连接或 Webhook。 |
| 具体行为 | 全部渠道共享一个经 ACP 启动的 Agent 进程、按用户隔离会话，每个渠道可单独指定 `cwd`、`model`、`instructions` 与 `sessionScope`。Email 首次连接跳过所选文件夹里已有的邮件，之后按保存的 UID 游标续读；`folder` 默认 `INBOX` 且只读，`pollInterval` 默认 60000 ms（可设 1–86400000），每轮最多取 100 封实际消息。回复只发给原发件人，`Message-ID`、`In-Reply-To` 与 `References` 负责关联会话，`Reply-To`、CC、BCC 与任务文本里的地址都不能改变 SMTP 收件人。渠道内 `/help`、`/status`、`/clear`、`/btw`、`/loop` 与权限回复等命令本地处理，其余转给 Agent；`dispatchMode` 支持 `steer`（默认）、`collect`、`followup`，Email 默认 `followup` 并拒绝 `collect`（缓冲消息的生命周期长于其准入处理器，无法保留单独的持久完成声明）。后台 Subagent 或 fork 的完成结果回投到拥有该会话的渠道聊天，可在原回合结束后送达。 |
| 会话与状态 | Email 状态在 `$QWEN_HOME/channels/<workspace>/email-<account-hash>/state.json`（`QWEN_HOME` 默认 `~/.qwen`），由渠道名、规范化 workspace 与邮箱 endpoint/user/folder 共同决定，只允许一个进程持有；切换账号另建基线，UIDVALIDITY 变化同样跳过现有邮件。开始任务前落盘在途 UID、每次 SMTP 发送（含主动发送）前落盘 `outboundPending` 消息 ID，对应操作完成后删除。进程中断或 SMTP 结果不确定时记录保留：重启会报告状态路径、待处理 UID 与外发消息 ID 并拒绝重放或丢弃，要求先停渠道、核对邮箱与任务副作用，再只从 `pending` 与 `outboundPending` 中删除已对账的条目，游标与线程元数据保持不动；状态损坏或不可读会让启动失败，把状态文件当作重试手段删除则会新建基线并跳过现有邮件。渠道循环计划保存在 `$QWEN_HOME/channels/` 下（独立渠道直接用 `cron.json`，daemon 托管用 `daemon/` 下的按工作区文件）。 |
| 工具与能力 | 渠道会话使用所配 `cwd` 工作区的 Qwen 工具、MCP 与 Skills。Email 至多转发 16 个附件：PNG、JPEG、GIF、WebP 走既有图片输入，其他文件在任务期间存到生成的私有路径，日历与封装的 message/report 部件不支持，HTML 转文本且不加载远程资源；`maxMessageBytes` 默认 10 MiB（超限邮件跳过）、`maxAttachmentBytes` 默认 5 MiB（超限附件省略），两者上限 50 MiB；`maxTextLength` 默认 32000 字符、上限 100000，超出部分先裁掉常规引用回复与签名。渠道循环由 `channel_loop_create`、`channel_loop_list`、`channel_loop_cancel` 工具或 `/loop` 命令管理，用本机时区的五字段 cron 表达式。 |
| 认证与权限 | Email 的 `imapPassword` 与 `smtpPassword` 支持既有 `$ENV_VAR` 引用，官方要求不要把明文密码写进设置。`address`、`allowedUsers`、`operators`、`proactiveRecipients` 都必须是裸邮箱地址并规范化为小写（长度 ≤254，显示名不授予访问权）。`privatePolicy` 支持 `allowlist`（Email 默认）、`open`、`disabled`，Email 明确拒绝 `pairing`（首版不支持配对），旧的 `senderPolicy` 仍被识别；官方提示 From 白名单不等于发件人认证，必须使用会过滤伪造邮件的邮箱服务商。Agent 自动生成、`Auto-Submitted` 非 `no`、邮件列表、垃圾邮件、空 return path、投递报告与带出站标记的邮件都被忽略，模糊的 From 头与发给自身邮箱的邮件被拒。 |
| 运行位置 | 渠道进程跑在执行 `qwen channel start` 的本机，前台运行且重复启动会报错而不是起第二个实例。实验性 daemon 托管模式由 `qwen serve` 拥有按工作区分组的渠道 worker 进程，worker 经 SDK 连回 daemon，适配器崩溃不会拖垮 daemon；该模式要求每个选中渠道的 `cwd` 解析到已注册的工作区。Email 需要本机能出网访问 IMAP 与 SMTP 服务器。 |
| 条件与边界 | Email 渠道由提交 `612a55295993`（PR #12939）合入 main；v0.24.7 标签下的 `packages/channels/` 只有 base、dingtalk、dws、feishu、github、gitlab、plugin-example、qqbot、telegram、wecom、weixin，没有 `email`，因此该适配器尚未随 Release 发布。官方设置文档在同一提交时点仍未列出 `channels` 键，`qwen channel` 也不在命令文档中，入口以 Channels 文档为准。Email 首版不支持 Provider OAuth、邮箱管理、S/MIME、PGP、日历与 HTML 输出。准入上限为 32 个普通投递在途，另留 1 个槽位给控制回复与忙音响应，满载时新任务收到“请在活动任务结束后重发”的提示；任务等待期间准入保持有效。适配器保留 256 条最近回复路由、每条至多 64 个标识与 1024 条最近入站标识，被逐出的线程路由在下一条被接受的消息恢复它之前收不到主动回复。主动投递默认关闭，只有 `proactiveRecipients`（默认空）里精确列出的地址可用；线程目标还需解析到已知且当前放行的发送者，未知目标直接失败而不改选收件人或新建替代线程，没有回退收件人。渠道循环要求适配器与目标支持主动投递，`sessionScope: "single"` 下不可用，每个目标至多 10 个启用的循环、每条提示词至多 4000 字符。官方说明 Agent 副作用、SMTP 受理与本地游标无法在一个事务里提交，因此不存在针对任意副作用的恰好一次语义，不确定的发送不会自动重试、主动投递错误按永久错误分类。 |
| 证据状态 | 官方确认 |
| 来源 | [Qwen Code Channels 总览文档](https://github.com/QwenLM/qwen-code/blob/612a55295993ffd60303cfc8d3445abac8ae2ad9/docs/users/features/channels/overview.md)、[Qwen Code Email 渠道文档](https://github.com/QwenLM/qwen-code/blob/612a55295993ffd60303cfc8d3445abac8ae2ad9/docs/users/features/channels/email.md)、[Qwen Code Email 渠道提交（PR #12939）](https://github.com/QwenLM/qwen-code/commit/612a55295993ffd60303cfc8d3445abac8ae2ad9)、[Qwen Code Email 渠道配置校验源码](https://github.com/QwenLM/qwen-code/blob/612a55295993ffd60303cfc8d3445abac8ae2ad9/packages/channels/email/src/config.ts)、[Qwen Code Email 渠道设计文档](https://github.com/QwenLM/qwen-code/blob/612a55295993ffd60303cfc8d3445abac8ae2ad9/docs/design/email-channel.md)、[Qwen Code 内置渠道注册表源码](https://github.com/QwenLM/qwen-code/blob/612a55295993ffd60303cfc8d3445abac8ae2ad9/packages/cli/src/commands/channel/channel-registry.ts)、[Qwen Code 设置文档（未列出 channels 键）](https://github.com/QwenLM/qwen-code/blob/612a55295993ffd60303cfc8d3445abac8ae2ad9/docs/users/configuration/settings.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 无第三方消息平台或邮箱渠道；`kimi web` 与 Remote Control 是自有浏览器窗口 |
| 入口与调用 | 无入口。官方 CLI 参考在提交 `21406fb4c805` 时点列出的子命令是 `login`、`acp`、`web`、`doctor`、`export`、`migrate`、`upgrade`、`provider`，附加子命令为 `install-desktop`、`vis`、`web rotate-token`、`provider add\|remove\|list\|catalog list\|catalog add`，没有渠道类子命令；官方斜杠命令表也没有渠道命令。 |
| 协议与输出 | 没有第三方消息平台或邮箱协议适配器。远程访问走 `kimi web`（同进程挂载 REST + WebSocket API 与 Web UI）与 Remote Control 中继隧道，两者都是 Kimi 自有协议。 |
| 具体行为 | Remote Control（`kimi rc`、`kimi web --remote-control`、`/remote-control`）由本机 CLI 出站连接官方中继生成链接与二维码，远程设备扫码或打开链接、登录同一 Kimi 账号后可查看任务进度、处理权限确认、继续对话或新建会话。官方指南逐字写明“任务始终在本机执行，网页只是一个远程窗口”。 |
| 会话与状态 | 会话与文件留在运行 Kimi 的本机；中继只转发流量，不存在按平台账号或邮箱地址保存的渠道状态目录，也没有发送者白名单文件。 |
| 工具与能力 | 远程窗口使用的仍是本机 Kimi 的工具、Shell 与 Provider。 |
| 认证与权限 | Remote Control 要求先 `kimi login`，远程设备登录同一 Kimi 账号；没有面向第三方平台发送者的配对码或白名单机制，因此也没有对应的准入门禁。 |
| 运行位置 | 本机 CLI 加 Kimi 官方中继（`code-rc.kimi.com`，`kimi login --region global` 后为 `code-rc.kimi.ai`）；不构成托管云任务，也不监听任何聊天平台或邮箱。 |
| 条件与边界 | 在提交 `21406fb4c805` 时点核对官方 CLI 参考、斜杠命令表与配置文档：`config.toml` 的顶层节为 providers、models、secondary_model、thinking、loop_control、token_counting、background、subagent、swarm、mcp、identity、tools、read、image、database、watch、services、permission 与项目级 `local.toml` 的 workspace，`tui.toml` 另有 editor、notifications、upgrade、status_line，没有任何渠道、机器人或邮箱配置节。唯一的微信相关记录是障碍而非集成：Remote Control 指南 FAQ 说明微信内置浏览器可能拦截 `code-rc.kimi.com` 链接，需要改用系统浏览器打开。 |
| 证据状态 | 条件项 |
| 来源 | [Kimi Code CLI 参考（无渠道子命令）](https://github.com/MoonshotAI/kimi-code/blob/21406fb4c805cc8c715e6d1f16ad3fb5f25f4fe3/docs/zh/reference/kimi-command.md)、[Kimi Code 斜杠命令表（无渠道命令）](https://github.com/MoonshotAI/kimi-code/blob/21406fb4c805cc8c715e6d1f16ad3fb5f25f4fe3/docs/zh/reference/slash-commands.md)、[Kimi Code 配置文档（无渠道配置节）](https://github.com/MoonshotAI/kimi-code/blob/21406fb4c805cc8c715e6d1f16ad3fb5f25f4fe3/docs/zh/configuration/config-files.md)、[Kimi Code Remote Control 指南（任务始终在本机执行）](https://github.com/MoonshotAI/kimi-code/blob/21406fb4c805cc8c715e6d1f16ad3fb5f25f4fe3/docs/zh/guides/remote-control.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | CLI 无第三方消息渠道；条件：Qoder Action 在 GitHub Issue/PR 以 `@qoder` 提及触发，代码在 GitHub Runner 执行 |
| 入口与调用 | CLI 无渠道入口。官方 CLI 概览的 “Remote and Integrations” 只列 Remote Control、Cloud Mode、Qoder Action 与 ACP；CLI 参考的子命令与参数里没有渠道类条目。第三方平台入口是 Qoder Action：在任意 Issue 或 PR 里评论 `@qoder explain this code` 或 `@qoder fix this issue`，工作流写 `uses: QoderAI/qoder-action@v0` 并在仓库 Secrets 配置 `QODER_PERSONAL_ACCESS_TOKEN`。 |
| 协议与输出 | Qoder Action 是标准 GitHub Actions 组件，由 GitHub 事件驱动。Remote Control 走 Qoder 账号中继，只服务 Qoder 自己的移动 App 与 `qoder.com/agents`；ACP（`qoder --acp`）是编辑器协议，官方只点名 Zed。 |
| 具体行为 | Qoder Action 把 Qoder CLI 的能力带进 GitHub 工作流，在 PR 与 Issue 中做代码协作，官方明确 “Code runs on GitHub Runners”。没有在本机监听聊天平台或邮箱的常驻渠道进程，也没有渠道会话归属或准入队列。 |
| 会话与状态 | 任务与产物留在 GitHub 与 Qoder 云端；本机 CLI 不保存渠道状态或平台凭据。 |
| 工具与能力 | Qoder Action 使用 GitHub Runner 上的检出与 Qoder 云端能力，不使用本机工作区工具。 |
| 认证与权限 | Qoder Action 需要仓库级 `QODER_PERSONAL_ACCESS_TOKEN`；Remote Control 用同一 Qoder 账号配对。团队侧另有 IM Channel 控制页，列出 DingTalk、Feishu、WeChat、WeCom、Microsoft Teams、Lark、WhatsApp、Slack，但官方注明 “Currently applies to QoderWork only”、适用套餐为 Teams 与 Enterprise，用途是 “deliver task notifications, messages, and reports to designated IM channels”，即只出不进的通知投递。 |
| 运行位置 | Qoder Action 在 GitHub Runner 执行；Remote Control 由 Qoder 托管前端加本机 CLI 执行，Cloud Mode 不依赖本机。 |
| 条件与边界 | 没有与 Qwen `channels.<name>.type` 或 Claude `--channels` 对应的第三方消息渠道配置键或启动命令。IM Channel 控制页属于 QoderWork 而不是 Qoder CLI，且只覆盖通知投递；入站提及记录在另一产品 QoderWake 的文档下。Qoder Action 只支持 GitHub，官方未提 GitLab 或其他平台。官方文档站没有变更日志页（`/changelog` 返回 404），只有 CLI 内的 `/release-notes` 命令，因此无法按版本定位渠道能力变化。矩阵中 Qoder 的 “Teams” 指其企业套餐，不是 Microsoft Teams。 |
| 证据状态 | 条件项 |
| 来源 | [Qoder CLI overview（Remote and Integrations）](https://docs.qoder.com/cli/overview)、[Qoder Action](https://docs.qoder.com/en/cli/qoder-action)、[Qoder Teams IM Channel controls（仅 QoderWork 通知投递）](https://docs.qoder.com/account/teams/im-channel-controls)、[Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference) |

## 官方来源

- [Claude Code Channels](https://code.claude.com/docs/en/channels)
- [Claude Code Channels reference](https://code.claude.com/docs/en/channels-reference)
- [Claude Code platforms and integrations](https://code.claude.com/docs/en/platforms)
- [Claude Code settings reference](https://code.claude.com/docs/en/settings-reference)
- [Codex Slack 集成（委派给 Codex Cloud）](https://learn.chatgpt.com/docs/third-party/slack)
- [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)
- [Codex cloud](https://learn.chatgpt.com/docs/cloud)
- [Qwen Code Channels 总览文档](https://github.com/QwenLM/qwen-code/blob/612a55295993ffd60303cfc8d3445abac8ae2ad9/docs/users/features/channels/overview.md)
- [Qwen Code Email 渠道文档](https://github.com/QwenLM/qwen-code/blob/612a55295993ffd60303cfc8d3445abac8ae2ad9/docs/users/features/channels/email.md)
- [Qwen Code Email 渠道提交（PR #12939）](https://github.com/QwenLM/qwen-code/commit/612a55295993ffd60303cfc8d3445abac8ae2ad9)
- [Qwen Code Email 渠道配置校验源码](https://github.com/QwenLM/qwen-code/blob/612a55295993ffd60303cfc8d3445abac8ae2ad9/packages/channels/email/src/config.ts)
- [Qwen Code Email 渠道设计文档](https://github.com/QwenLM/qwen-code/blob/612a55295993ffd60303cfc8d3445abac8ae2ad9/docs/design/email-channel.md)
- [Qwen Code 内置渠道注册表源码](https://github.com/QwenLM/qwen-code/blob/612a55295993ffd60303cfc8d3445abac8ae2ad9/packages/cli/src/commands/channel/channel-registry.ts)
- [Qwen Code 设置文档（未列出 channels 键）](https://github.com/QwenLM/qwen-code/blob/612a55295993ffd60303cfc8d3445abac8ae2ad9/docs/users/configuration/settings.md)
- [Kimi Code CLI 参考（无渠道子命令）](https://github.com/MoonshotAI/kimi-code/blob/21406fb4c805cc8c715e6d1f16ad3fb5f25f4fe3/docs/zh/reference/kimi-command.md)
- [Kimi Code 斜杠命令表（无渠道命令）](https://github.com/MoonshotAI/kimi-code/blob/21406fb4c805cc8c715e6d1f16ad3fb5f25f4fe3/docs/zh/reference/slash-commands.md)
- [Kimi Code 配置文档（无渠道配置节）](https://github.com/MoonshotAI/kimi-code/blob/21406fb4c805cc8c715e6d1f16ad3fb5f25f4fe3/docs/zh/configuration/config-files.md)
- [Kimi Code Remote Control 指南（任务始终在本机执行）](https://github.com/MoonshotAI/kimi-code/blob/21406fb4c805cc8c715e6d1f16ad3fb5f25f4fe3/docs/zh/guides/remote-control.md)
- [Qoder CLI overview（Remote and Integrations）](https://docs.qoder.com/cli/overview)
- [Qoder Action](https://docs.qoder.com/en/cli/qoder-action)
- [Qoder Teams IM Channel controls（仅 QoderWork 通知投递）](https://docs.qoder.com/account/teams/im-channel-controls)
- [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference)

## 关联能力

- [服务端与 Daemon](./surface-service.md)
- [远程接管与跨端继续](./surface-remote-control.md)
- [跨会话消息](../sessions/session-messaging.md)
- [插件分发](../extensions/extension-plugins.md)
- [CI 自动化](../execution/execution-ci.md)

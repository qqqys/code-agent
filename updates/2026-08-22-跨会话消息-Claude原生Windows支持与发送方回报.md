# Claude Code 跨会话消息原生 Windows 支持与发送方回报

Claude Code 跨会话消息字段按 v2.1.236 至 v2.1.239 官方更新日志与官方跨会话消息文档页补录。此前字段记录“原生 Windows 不支持”；官方跨会话消息文档页现记录可用操作系统为 macOS、Windows 与 Linux（含 WSL 2），其中 macOS、Linux、WSL 2 需 v2.1.224 及以上，原生 Windows 需 v2.1.234 及以上；v2.1.239（2026-08-21 发布）更新日志宣布“Windows: cross-session messaging is now available”，Windows 会话可与其他平台一致地用 `SendMessage` 互发、用 `ListAgents` 互相发现。原生 Windows 收件箱是命名管道（macOS、Linux、WSL 2 为 Unix socket），每条连接须先以仅操作系统用户可读的密钥认证，首行不是有效认证行的连接被关闭且不投递任何消息；`CLAUDE_CODE_MESSAGING_SOCKET` 令牌在原生 Windows 上是验证自己子进程消息的唯一方式。同一台机器上的 WSL 2 会话与原生 Windows 会话注册在不同主目录、监听不同套接字类型，互不可达。

## 修正

- `session-messaging` 字段 Claude Code 矩阵结论由 "`/list-agents` · `/peers` · `SendMessage`/`ListAgents` · `@` 会话名提及 · `crossSessionInbound`" 改为追加 "· 原生 Windows（v2.1.239 宣布可用）"。
- Claude Code 详情 scope 由“支持 macOS、Linux（含 WSL 2），原生 Windows 不支持”改为“支持 macOS、Windows 与 Linux（含 WSL 2）”，并记录官方文档的最低版本（v2.1.224 与原生 Windows v2.1.234）、v2.1.239 更新日志宣布可用，以及同机 WSL 2 与原生 Windows 会话互不可达。
- Claude Code 详情补入：entry 增加 v2.1.239 `ListAgents` 告知会话自身名称、`ListAgents`/`/list-agents` 列出在世 Agent 团队队友（官方文档页核对日期仍记录队友不列入、需经团队自身名册联系，两处不一致）；behavior 增加 v2.1.238 向拒绝接收（`crossSessionInbound: "refuse"`）的本机会话发送时向发送方报告被拒、收件箱因限速或队列已满丢弃时通知发送方，以及 v2.1.239 `SendMessage` 发给自身名称时提示即当前会话；storage/persistence 增加原生 Windows 命名管道与连接认证；conditions 增加 v2.1.236 `SendMessage` `notify_when_idle`（请本机另一会话下次空闲时发送一次性通知，只发送一次、不轮询，仅 macOS 与 Linux）。
- 新增来源：`claude-messaging-v236`（固定到提交 `084ca20bcf90`）、`claude-messaging-v238`（固定到提交 `8a8e81d098cb`）、`claude-messaging-v239`（固定到提交 `16440d0f6ee8`）。
- `docs/09-版本与证据.md`：Claude Code 核对日期改为 2026-08-22；主要材料补充跨会话消息原生 Windows 与发送方回报；官方来源表会话与上下文列新增三条更新日志链接。
- `npm run generate` 重新生成 `docs/capabilities/sessions/`（`session-messaging.md` 内容更新）与 `docs/04-会话与上下文矩阵.md`。

## 影响页面

- [会话与上下文矩阵](../docs/04-会话与上下文矩阵.md)
- [跨会话消息详情](../docs/capabilities/sessions/session-messaging.md)
- [版本与证据](../docs/09-版本与证据.md)

## 证据版本

- v2.1.239 更新日志（提交 `16440d0f6ee8`，2026-08-21T19:54:17Z）原文："Windows: cross-session messaging is now available, so Claude Code sessions across your machines can message each other with `SendMessage` and find each other with `ListAgents`, as on macOS and Linux."；"`ListAgents` now tells a session its own name (the one peers use to message it), and `SendMessage` to your own name says so instead of \"no agent named …\""；"`ListAgents` and `/list-agents` now list your live teammates (previously only subagents and other sessions appeared, so a reachable teammate looked absent)"。
- v2.1.238 更新日志（提交 `8a8e81d098cb`，2026-08-20T20:33:51Z 发布）原文："Cross-session messaging: sending to a session on this machine that refuses inbound messages (e.g. `crossSessionInbound: \"refuse\"`) now reports \"refused\" to the sender instead of a silent success"；"Cross-session messaging: a session whose inbox drops your messages (rate limit or full queue) now tells your session, instead of the messages vanishing silently"。
- v2.1.236 更新日志（提交 `084ca20bcf90`）原文："Added `notify_when_idle` to cross-session `SendMessage`: ask another Claude Code session on this machine to send one notice when it next goes idle — opt-in, one-shot, no polling (macOS and Linux)"。
- 官方跨会话消息文档页（核对日期 2026-08-22 抓取）原文："Cross-session messaging requires Claude Code v2.1.224 or later on macOS, Linux, and WSL 2, and v2.1.234 or later on native Windows."；"**Operating system**: available on macOS, Windows, and Linux, including Linux inside WSL 2."；"The socket is a Unix domain socket on macOS and Linux, including Linux inside WSL 2, and a named pipe on native Windows."；"On native Windows, it instead requires each connection to authenticate first with a key that only your operating-system user can read."；"**Native Windows**: the line is required. Claude Code closes any connection whose first line isn't a valid auth line and delivers nothing from that connection."；"On native Windows, that token is the only way Claude Code verifies an own-child message."；"A session inside WSL 2 and a native Windows session on the same computer can't reach each other either, because they register under different home directories and listen on different socket types."
- 队友列表的文档差异：同一官方文档页核对日期仍记录 "Agent team teammates aren't listed; Claude messages them through the team's own roster."，与 v2.1.239 更新日志的“列出在世队友”不一致，详情按更新日志记录并注明差异。
- 其余四家本次无变化：Codex、Kimi Code 官方命令与文档仍未列出会话间消息；Qwen Code `send_message`/`list_agents` 仍限当前会话后台 Agent；Qoder CLI Agent Teams 仍为 `QODER_AGENT_TEAMS=1` beta 单会话内通信。

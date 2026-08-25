# Kimi Code Remote Control Web 隧道

Kimi Code 官方仓库在 2026-08-25 合入提交 `f0a609487fb8`（PR #3034，`feat(kimi-code): add remote control web tunnel`），新增 Remote Control：以实验开关 `KIMI_CODE_EXPERIMENTAL_REMOTE_CONTROL=1` 启用后，`kimi rc`（别名 `remote`）、`kimi web --remote-control` 或会话内 `/remote-control`（别名 `/rc`）让本机 CLI 主动出站连接官方中继 `https://code-rc.kimi.com`，把远程设备的 HTTP 请求与 WebSocket 流桥接回本机 Web 服务，手机或另一台电脑登录 Kimi 账号即可控制本机会话，无需自建网络。该提交晚于 0.38.0（2026-08-20 发布），核对时点没有包含该提交的 Release。矩阵的“远程接管与跨端继续”字段此前只记录 `kimi web --host` 需自建网络，“远程与跨端”命令字段只记录 `/web`，本次更新这两个字段的 Kimi Code 矩阵结论与详情记录。

## 修正

- `surface-remote-control`（远程接管与跨端继续）矩阵 Kimi Code 列由 “`kimi web --host`；需自建网络” 更新为 “`kimi web --host` 自建网络；条件：Remote Control 官方中继隧道 `kimi rc` · `kimi web --remote-control` · `/remote-control`（别名 `/rc`，实验开关 `KIMI_CODE_EXPERIMENTAL_REMOTE_CONTROL`，main 分支，尚未发布）”。
- `surface-remote-control` 详情 Kimi Code 记录：入口补充 `kimi rc`、`kimi web --remote-control` 与 `/remote-control` 三个实验入口及开关；协议记录中继注册（`/v1/remote/create`）、HTTP 隧道（`/v1/remote/http`）、WebSocket 流桥接（`/v1/remote/stream/<streamId>`）、本机 bearer token 附加、响应路径改写与 30 秒上限指数退避重连；行为记录终端 “Kimi Remote Control ready” 输出、二维码与当前会话深链接、`/remote-control` 后 TUI 退出转为前台 Web 服务；状态记录单实例文件锁；认证记录 `kimi login` 前置、本机服务令牌必需、远程设备登录 Kimi 账号、与 `--dangerous-bypass-auth` 互斥；运行位置记录官方中继地址且执行留在本机；条件记录实验标志门禁与错误文案、回环绑定要求、隧道限额（单请求 10 MiB、头部 64 KiB、转发超时 30 秒）、`--allow-remote-terminals` 移除、合入 main 尚未发布与官方文档未同步；证据状态由“条件项”改为“源码确认”；来源新增 Remote Control 提交、changeset、隧道源码、实验标志源码、`kimi web` 选项源码、TUI 命令源码与注册表、`--allow-remote-terminals` 移除 changeset（均固定到提交 `f0a609487fb835371c608cde101a6ff544c3c33e`）。
- `surface-remote-control` 跨产品事实第一条补充 Kimi Code 账号中继远程控制。
- `cmd-remote`（远程与跨端）矩阵 Kimi Code 列由 “`/web`” 更新为 “`/web` · 条件：`/remote-control`（别名 `/rc`）启动 Remote Control 中继（实验开关，main 分支，尚未发布）”。
- `cmd-remote` 详情 Kimi Code 记录：命令增加 `/remote-control`、别名 `/rc`，行为、持久化、条件按源码补足，证据状态“源码确认”；跨产品事实第三条同步补充。
- `site/data.js` 新增八个固定到提交 `f0a609487fb835371c608cde101a6ff544c3c33e` 的来源条目。
- `docs/09-版本与证据.md`：Kimi Code 核对日期更新为 2026-08-25，主要材料补充 Remote Control Web 隧道；官方来源表命令列新增 `/remote-control` TUI 命令源码与注册表链接，Headless、SDK 与多端来源表服务列新增隧道提交、隧道源码、实验标志源码、`kimi web` 选项源码与两个 changeset 链接。
- `docs/01-Slash命令矩阵.md`：远程控制行 Kimi Code 列补入 `/remote-control`，Kimi Code 命令目录按字母序补入 `/remote-control` 并新增说明段落，来源清单补入五个固定到提交 SHA 的链接。
- 能力字段总数不变（112 个），`README.md` 计数无需调整；`npm run generate` 重新生成 `docs/07-Headless-SDK与多端矩阵.md` 与 `docs/capabilities/` 对应详情。

## 影响页面

- [Slash 命令矩阵](../docs/01-Slash命令矩阵.md)
- [Headless、SDK 与多端矩阵](../docs/07-Headless-SDK与多端矩阵.md)
- [远程与跨端详情](../docs/capabilities/commands/cmd-remote.md)
- [远程接管与跨端继续详情](../docs/capabilities/surfaces/surface-remote-control.md)
- [版本与证据](../docs/09-版本与证据.md)

## 证据版本

- Kimi Code 提交 `f0a609487fb835371c608cde101a6ff544c3c33e`（2026-08-25，PR #3034）：新增 `apps/kimi-code/src/cli/sub/web/remote-control.ts`、`remote-control-lock.ts`、`apps/kimi-code/src/utils/remote-control-qr.ts`、`packages/agent-core-v2/src/app/remoteControl/flag.ts`，修改 `apps/kimi-code/src/cli/sub/web/index.ts`、`run.ts`、`shared.ts`、`apps/kimi-code/src/tui/commands/web.ts`、`registry.ts`、`dispatch.ts` 与测试等。
- changeset `.changeset/add-remote-control.md`（minor）：“Add Remote Control as an experimental feature for accessing a local web session remotely. Enable it with `KIMI_CODE_EXPERIMENTAL_REMOTE_CONTROL=1`, then run `kimi rc`, `kimi web --remote-control`, or `/remote-control` to start it.”
- 实验标志源码 `packages/agent-core-v2/src/app/remoteControl/flag.ts`：`REMOTE_CONTROL_FLAG_ID = 'remote-control'`、`REMOTE_CONTROL_FLAG_ENV = 'KIMI_CODE_EXPERIMENTAL_REMOTE_CONTROL'`、`title: 'Remote Control'`、`default: false`、`surface: 'both'`，经 `registerFlagDefinition` 注册。
- 隧道源码 `apps/kimi-code/src/cli/sub/web/remote-control.ts`：`REMOTE_CONTROL_RELAY_ORIGIN = 'https://code-rc.kimi.com'`；`isRemoteControlEnabled` 接受 `KIMI_CODE_EXPERIMENTAL_FLAG` 或 `KIMI_CODE_EXPERIMENTAL_REMOTE_CONTROL`（truthy：`1`/`true`/`yes`/`on`）；启动前校验本地服务令牌（“Remote Control requires local server authentication.”）与 Kimi OAuth refresh token（“Remote Control requires a Kimi login. Run \`kimi login\` first.”，读取数据目录 `credentials/`）；经 `/v1/remote/create` 注册设备（device_id、alias=hostname、platform、client_version、local_base_url），`register_ack` 后建立 `/v1/remote/http?device_id=...` HTTP 隧道与 `/v1/remote/stream/<streamId>` WebSocket 流；转发请求附加本地 `Authorization: Bearer <token>`，HTML 响应注入 `sessionStorage.setItem('kimi-desktop-server-origin', ...)` 引导脚本并改写资源路径；限额 `MAX_HTTP_REQUEST_BYTES = 10 MiB`、`MAX_HTTP_HEADER_BYTES = 64 KiB`、`HTTP_REQUEST_TIMEOUT_MS = 30_000`、重连退避上限 `MAX_RECONNECT_DELAY_MS = 30_000`；终端输出 “Kimi Remote Control ready”“Use Kimi Code on this machine from your phone or another computer.” 与三步说明（扫码或打开链接、登录 Kimi 账号、会话在本机运行），设备页 URL 形如 `<relay>/devices/<deviceId>/?rc=1&from=kimi_code_cli`，会话深链接追加 `/sessions/<sessionId>`。
- `apps/kimi-code/src/cli/sub/web/run.ts`：`--rc, --remote-control` 选项（描述 “Expose the web UI through Kimi Remote Control (experimental).”，未启用时 `hideHelp`）；错误 “--remote-control is experimental: set KIMI_CODE_EXPERIMENTAL_REMOTE_CONTROL=1 (or KIMI_CODE_EXPERIMENTAL_FLAG=1) to enable it.”、“--remote-control cannot be combined with --dangerous-bypass-auth.”、“--remote-control requires a loopback host.”。
- `apps/kimi-code/src/cli/sub/web/index.ts`：`kimi rc` 子命令（别名 `remote`，描述 “Run the local Kimi server and open the web UI through Remote Control (experimental).”，未启用时隐藏）。
- `apps/kimi-code/src/tui/commands/registry.ts`：`/remote-control` 命令（别名 `rc`，描述 “Open the current session through Kimi Remote Control (experimental)”，`experimentalFlag: 'remote-control'`，与 `/tower`、`/secondary-model` 同一门禁机制）。
- `apps/kimi-code/src/tui/commands/web.ts`：`handleRemoteControlCommand` 先检查单实例文件锁（已运行时报错），TUI 退出后原进程经 `startServerForeground` 转为前台 Web 服务并启动隧道，打印二维码（`generateRemoteControlQr`，终端渲染并保存 PNG）后自动打开设备页链接。
- changeset `.changeset/drop-allow-remote-terminals.md`（patch）：“Remove the `--allow-remote-terminals` flag from `kimi web`; PTY terminal routes now stay available on loopback binds only.”
- 发布状态：0.38.0（2026-08-20 发布）早于该提交；核对时点（2026-08-25）官方 Release 列表没有包含该提交的版本，`/remote-control` 未列入官方 Slash 命令文档，终端输出链接的 `https://kimi.com/code/docs/remote-control` 文档页核对时返回 404。
- 其他四家本次不更新：Claude Code v2.1.240/v2.1.241 更新日志仅 “Bug fixes and reliability improvements”，v2.1.243/v2.1.245 的用户可见新增（`/usage` Loops 明细、`promptCacheTtl`、`modelPricing`、Console 免 Key 登录等）与修复留待后续单元；Codex 近期合入（#40640、#40637、#40636、#40634、#40631、#40629、#40628、#40625）为修复与加固，rust-v0.149.1 为修复版本；Qwen Code main 分支 `feat(goal)` 提交（#9975、#9973）为 Goal 行为细化，留待后续单元；Qoder CLI 公开文档无同类变化。

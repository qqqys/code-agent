# Qwen Code qwen serve Local Control 局域网配对

Qwen Code 官方仓库在 2026-08-09 合入提交 `bf84caf17371`（PR #8727，`feat: add Local Control pairing to CLI and Desktop`），为 CLI 和 Desktop 增加 Local Control 局域网配对：`qwen serve --local-control` 把认证后的 Web Shell 以每进程新令牌广播到所有非回环 IPv4 接口，并在终端打印带标签的二维码供手机扫码接入；Desktop 增加 `Control → Local Control…` 菜单，在不重启现有 loopback daemon 的前提下开启临时局域网网关。该提交晚于 v0.21.8（2026-08-08T17:07:22Z 发布），核对时点没有包含该提交的 Release。矩阵的“远程接管与跨端继续”字段此前只记录 `qwen serve` 多客户端与需自建网络，本次更新该字段的 Qwen Code 矩阵结论与详情记录。

## 修正

- `surface-remote-control`（远程接管与跨端继续）矩阵 Qwen Code 列由 “`qwen serve` 多客户端；需自建网络” 更新为 “`qwen serve` 多客户端；条件：`--local-control` 局域网扫码配对（main 分支，尚未发布）；公网需自建网络”。
- `surface-remote-control` 详情 Qwen Code 记录：入口补充 CLI `qwen serve --local-control` 与 Desktop `Control → Local Control…` 菜单；协议记录绑定所有非回环 IPv4 接口、配对令牌放在 URL fragment（浏览器不在 HTTP 请求、日志或 referrer 中发送）、Desktop 网关转发 HTTP/SSE/WebSocket 到既有 loopback daemon；行为记录每进程生成全新 256-bit bearer token、按局域网地址打印带标签二维码、启用期间尽力抑制系统睡眠、Desktop 不重启 daemon 即开启网关且停用即关闭监听并使令牌失效；状态记录令牌为进程级临时凭据、Desktop 网关不改变 Desktop PID、daemon PID、loopback 地址和进行中的会话；认证记录 Local Control 自行生成令牌、不复用环境变量令牌、只放行被广播的局域网 origin 与 daemon 的 loopback 自访问 origin；运行位置记录仅覆盖同一局域网扫码设备，官方明确不以端口转发或未认证隧道暴露该网关做互联网远控；条件记录与 `--token`、`--allow-origin`、`--no-web`、`--port 0`、非默认 `--hostname` 冲突报错，要求固定端口、端口被占用启动失败不重试、无非回环 IPv4 地址报错、位于 main 分支尚未随 Release 发布；来源新增 Local Control 提交、qwen serve 文档、设计文档、Desktop README 与 serve 命令源码（均固定到提交 SHA）。
- `surface-remote-control` 跨产品事实第二条补充 Qwen Code `--local-control` 局域网扫码配对。
- `site/data.js` 新增五个固定到提交 `bf84caf1737163e3e15acff6c6a1c8a6af91df4d` 的来源条目。
- `docs/09-版本与证据.md`：Qwen Code 主要材料补充 qwen serve Local Control 局域网配对；Headless、SDK 与多端来源表 Qwen Code 服务列新增 Local Control 提交、qwen serve Local Control 文档与设计文档三个固定到 SHA 的链接。核对日期保持 2026-08-09。
- 能力字段总数不变（109 个），`README.md` 计数无需调整；`npm run generate` 重新生成 `docs/07-Headless-SDK与多端矩阵.md` 与 `docs/capabilities/surfaces/` 详情。

## 影响页面

- [Headless、SDK 与多端矩阵](../docs/07-Headless-SDK与多端矩阵.md)
- [远程接管与跨端继续详情](../docs/capabilities/surfaces/surface-remote-control.md)
- [版本与证据](../docs/09-版本与证据.md)

## 证据版本

- Qwen Code 提交 `bf84caf1737163e3e15acff6c6a1c8a6af91df4d`（2026-08-09T08:31:54Z，PR #8727）：新增 `docs/design/local-control-cli.md`、`docs/users/qwen-serve-deploy-local.md`，修改 `docs/users/qwen-serve.md`、`packages/cli/src/commands/serve.ts`、`packages/desktop-shell/src-tauri/src/local_control.rs` 与 Desktop README 等。
- Qwen Code serve 命令源码（同一提交）：`--local-control` 描述 “Share the Web Shell on the local IPv4 network with a fresh token, terminal QR code, and best-effort sleep inhibition. Press Ctrl+C to turn it off.”；冲突校验报错 “Local Control generates its own token.”（配 `--token`）、“Local Control manages its browser origins.”（配 `--allow-origin`）、“Local Control requires the Web Shell.”（配 `--no-web`）、“Local Control requires a fixed port.”（`--port 0` 或非法端口）、“Local Control manages its hostname.”（非默认 `--hostname`）；运行期无可用地址报 “Local Control could not find a non-loopback IPv4 address.”。
- Qwen Code `docs/users/qwen-serve.md`（同一提交）：`--local-control` “Share the authenticated Web Shell on every non-loopback IPv4 interface with a fresh per-process token, labelled terminal QR codes, exact browser origins, a fixed port, and best-effort sleep inhibition.”；“Conflicts with `--token`, `--allow-origin`, `--no-web`, `--port 0`, and non-default `--hostname`”；“`--local-control` generates a token for that process.”；局域网 HTTPS 与 `--tls-cert`/`--tls-key` 解锁 secure-context API 的说明。
- Qwen Code 设计文档 `docs/design/local-control-cli.md`（同一提交）：强制绑定 `0.0.0.0` 并“replace the wildcard host with each non-loopback IPv4 interface address”；“a fresh 256-bit bearer token”（`crypto.randomBytes(32)`）且“environment tokens are not reused”；令牌置于 URL fragment，“browsers do not send it in HTTP requests, access logs, or referrers”；“Inhibits system sleep until the process exits”；拒绝临时端口 `0`，端口被占用时失败不重试以免打印的配对 URL 失效；非目标写明互联网远控需要账号认证的出站中继，“must not be implemented by exposing this LAN gateway through port forwarding or an unauthenticated tunnel”。
- Qwen Code Desktop README `packages/desktop-shell/README.md`（同一提交）：菜单 “Control → Local Control…”；“temporarily share that live daemon with a phone on the same Wi-Fi”；“The app displays a QR code”（per-launch bearer token）；关闭窗口或停用即 “closes the LAN gateway”；共享期间 “keeps the computer awake”。
- 发布状态：v0.21.8 Release 时间为 2026-08-08T17:07:22Z，早于该提交合入时间；核对时点（2026-08-09）官方 Release 列表没有包含该提交的版本。
- 其他四家本次不更新：Claude Code v2.1.226（提交 `2bb60696142b`，2026-08-08）更新日志仅 “Bug fixes and reliability improvements”，v2.1.225 内容已记录；Codex 近期合入（#37654 environment config read 能力广播、#37610 workload identity token exchange 内部 crate 等）无用户可见配置或文档；Kimi Code #2740 为内置 profile 目录按会话隔离的内部修复；Qoder CLI 公开文档无同类变化。

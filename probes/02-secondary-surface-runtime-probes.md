# Phase 1C.2 Secondary Surface Runtime Probe Catalog

> 状态：Reviewing  
> Last updated：2026-07-26T04:55:00Z  
> 原则：默认只在新建临时目录、loopback、fixture repo 与测试身份中执行

## 1. 风险分级

| Level | Boundary                                                        | Default action                              |
| ----- | --------------------------------------------------------------- | ------------------------------------------- |
| `R0`  | exact version、Help、schema 读取，不启动长驻进程                | 可执行；记录命令、输出、exit、hash 与副作用 |
| `R1`  | 临时目录/fixture repo 内的本地进程、loopback socket、无模型请求 | 可执行；必须显式端口、进程回收与 cleanup    |
| `R2`  | 登录、模型调用、只读外部服务或可能计费                          | 需测试身份、预算、数据边界与用户确认        |
| `R3`  | PR/comment/message、CI trigger、extension install、外部状态写入 | 未获专项授权不执行                          |
| `R4`  | 删除/恢复、逃逸、恶意输入、安全压力或真实凭据边界               | 独立 fixture、备份、停止条件与人工确认      |

任何 probe 都不能读取真实用户 credential、连接真实生产 workspace 或修改当前 dirty
checkout。临时配置必须使用产品已确认的专用 config-root 入口；不重定向或复用 `$HOME`。

## 2. 已执行

### `P1C2-CDX-APP-SCHEMA-001`

| Field           | Value                                                                                                                                                                                                      |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Product / Slice | Codex `0.145.0/latest/sdk-daemon`；Darwin arm64；app-server                                                                                                                                                |
| Risk            | `R1`                                                                                                                                                                                                       |
| Goal            | 验证 frozen binary 能否在全新 temp dir 生成协议 schema，并记录可校验的 method/type anchors                                                                                                                 |
| Preconditions   | binary SHA-256 `1da3f4e0e96028b8a771814293c3033dafd1971f943f6c7e79b0897fe705f590`；新建 temp output                                                                                                        |
| Procedure       | `codex app-server generate-json-schema --out /private/tmp/ccq-phase1c2-codex-appserver-rerun.T1WcoM --experimental`                                                                                        |
| Result          | `Reproduced`；`2026-07-26T04:42:45Z` 开始、`04:42:46Z` 结束；exit `0`；347 files；4288 KiB；raw 与 canonical aggregate hash 已记录                                                                         |
| Exact anchors   | `initialize`、`thread/start`、`thread/read`、`thread/resume`、`thread/fork`、`turn/start`、`turn/steer`、`turn/interrupt`、`item/started`、`item/completed`、`command/exec`、`environment/add/info/status` |
| Side effects    | 只创建专用 temp output；PATH-alias 写入尝试被环境拒绝；未观察到 repo/config/auth/model/network/external change                                                                                             |
| Cleanup         | temp output 保留到 Phase 1C.2 review gate 结束；之后可删除；v2 raw definition order 非确定，跨次完整性比较使用 `jq -S -c` canonical hash                                                                   |
| Evidence        | `EVD-codex-RUNTIME-003`；首次无独立起止时间的采集保留为不可变 `EVD-codex-RUNTIME-002`                                                                                                                      |
| Does not prove  | server startup、request success、task identity、event delivery/order、handshake compatibility、auth、backpressure 或 shutdown                                                                              |

## 3. Codex 最小后续 Probe

### `P1C2-CDX-APP-INIT-001`

| Field           | Plan                                                                                                                                                                         |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Risk            | `R1`                                                                                                                                                                         |
| Goal            | 只验证 stdio app-server 的 process lifecycle 与 `initialize` request/response，不创建 thread 或模型请求                                                                      |
| Preconditions   | frozen binary；新 temp config root；bounded JSON-RPC fixture client；process timeout；stdout/stderr 分离                                                                     |
| Procedure       | 启动 `app-server --listen stdio://`；发送由 generated schema 构造的 initialize；记录 response、capabilities、invalid-version/invalid-method；正常关闭 stdin，等待 child exit |
| Required output | request/response IDs、protocol/version fields、exit/timeout、stderr、child PID、created files与 cleanup                                                                      |
| Stop conditions | 发现 auth/model request、外部网络、读取真实 config/credential、进程无法在 timeout 内回收                                                                                     |
| Unlocks         | `CAP-10.08-A01` 的 handshake 子合同；不会单独闭合 task/event Atomics                                                                                                         |
| Status          | Planned                                                                                                                                                                      |

### `P1C2-CDX-MCP-LIST-001`

| Field           | Plan                                                                                                                                                      |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Risk            | `R1`                                                                                                                                                      |
| Goal            | 在无模型调用下启动 MCP stdio server，执行 initialize 与 tools/list                                                                                        |
| Preconditions   | frozen binary；bounded MCP fixture client；新 temp config root；timeout与 child cleanup                                                                   |
| Procedure       | 启动 `mcp-server`；发送 MCP initialize/initialized/tools/list；记录 exact tool name/schema；发送 malformed tool input，但不执行会触发模型的合法 tool call |
| Required output | server handshake、tool inventory/schema、malformed-input error、stderr/exit、所有文件和进程副作用                                                         |
| Stop conditions | server 要求真实认证/模型调用、访问外网、读取真实 credential 或无法回收                                                                                    |
| Unlocks         | `CAP-07.04-A01`；`CAP-07.04-A02` 仍需测试身份与模型预算的 `R2` call probe                                                                                 |
| Status          | Planned                                                                                                                                                   |

### `P1C2-CDX-EXEC-MAP-001`

先不启动 exec-server。仅在 Atomic mapping 确认后设计：

- registration service 的本地 listen lifecycle；
- `--remote` 注册的身份、environment ID 与远端状态；
- 与 cloud task dispatch/query 的 ownership 区分。

当前状态：`Blocked by mapping`。不能借 `CAP-10.12-A01/A03` 直接执行。

## 4. Qwen daemon Probe Queue

### `P1C2-QWN-DAEMON-DISCOVERY-001`

| Field           | Plan                                                                                                                                                                                   |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Risk            | `R1`                                                                                                                                                                                   |
| Goal            | 验证 `0.21.0` daemon 的 process、health/status、`/capabilities`、token gate 与 clean shutdown；不创建模型 session                                                                      |
| Preconditions   | frozen npm artifact；新 temp config/data roots（只使用已确认的产品专用环境变量，不改 `$HOME`）；loopback ephemeral port；fixture workspace；显式 bearer token；process timeout/cleanup |
| Procedure       | 启动 `qwen serve`；轮询 health/status；分别无 token/错 token/正确 token请求；读取 `/capabilities`；发送 unknown endpoint；终止父进程并检查 listener/children                           |
| Required output | bound address、health/readiness distinction、capability payload、HTTP status/error body、auth result、created files/logs、PID/listener cleanup                                         |
| Stop conditions | 访问外网、读取真实 credential、自动注册真实 workspace/channel、请求模型或无法回收                                                                                                      |
| Unlocks         | `CAP-10.07-A01`、`CAP-10.08-A01` negative boundary、`CAP-12.02-A02`、`CAP-12.05-A01`、`CAP-12.07-A03` 的部分合同                                                                       |
| Status          | Planned                                                                                                                                                                                |

### `P1C2-QWN-DAEMON-SESSION-001`

| Field           | Plan                                                                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Risk            | discovery/invalid request 为 `R1`；真实 prompt/session 为 `R2`                                                                                         |
| Goal            | 分开验证 workspace registration、session create/query/cancel、SSE subscribe/replay/reconnect 与 multi-client ownership                                 |
| Preconditions   | discovery probe 先通过；fixture repo；测试 provider/credential与预算；固定 session caps、SSE ring/replay caps；两个独立 fixture clients                |
| Procedure       | 先执行 invalid/unauthorized requests；获专项授权后再提交最小 prompt；制造 client disconnect/reconnect、duplicate cancel、two-client attach 与 ring gap |
| Required output | stable IDs、workspace/session ownership、event sequence/cursor、replay gap、cancel race、HTTP/SSE termination、partial result、cleanup                 |
| Stop conditions | 任何真实 repo或生产 credential、不可控模型成本、外部副作用、进程/连接泄漏                                                                              |
| Unlocks         | `CAP-10.07-A02..A05`、`CAP-10.08-A02/A03`                                                                                                              |
| Status          | Blocked by `R2` identity/budget                                                                                                                        |

### `P1C2-QWN-DAEMON-LIMITS-001`

| Field           | Plan                                                                                                                             |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Risk            | `R1` for synthetic connections/invalid requests；resource pressure上升为 `R4`                                                    |
| Goal            | 分别验证 connection/session/prompt caps、SSE ring、reaper/idle timeout、rate limit 与 MCP budget，不用一个压力结果代表全部 guard |
| Preconditions   | discovery probe 先通过；低而安全的显式 limits；loopback clients；host resource ceiling；hard timeout                             |
| Procedure       | 每种 limit 独立 fixture；记录 accepted/rejected count、queue/HTTP code、retry hint、cleanup；不执行内存耗尽或逃逸类压力          |
| Required output | per-limit identity、触发阈值、拒绝/排队/断开、active count、reaper结果、process/resource recovery                                |
| Stop conditions | host pressure超预算、无界增长、进程无法停止、触发真实 MCP/provider调用                                                           |
| Unlocks         | `CAP-12.07-A02/A03`、`CAP-12.08-A02/A03/A04`                                                                                     |
| Status          | Planned；高压分支 deferred                                                                                                       |

## 5. Artifact Lock Queue

这些不是 runtime probe 前的可选优化，而是建立 honest Slice 的前置。

| Product / Surface | Required lock                                                                                                                      | Current blocker                             |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Claude SDK        | Python/TypeScript package name/version、registry artifact、integrity、API/source tag、实际 bundled/resolved Claude Code binary     | 只有 current SDK docs                       |
| Claude CI         | Action immutable commit + resolved CLI artifact/version                                                                            | floating `@v1`                              |
| Claude remote     | web/mobile client build与 artifact；host/client protocol compatibility                                                             | 只有 exact CLI host                         |
| Qwen IDE          | VS Code companion、VS Code forks、Zed ACP、JetBrains 各自 build/version/artifact                                                   | tagged docs 不是 extension build            |
| Qwen SDK          | `@qwen-code/sdk`、`qwen-code-sdk`、`com.alibaba:qwencode-sdk` 的真实发布 artifact/integrity；兼容 CLI/daemon build；Java transport | 文档含候选版本字符串，但未验证真实 artifact |
| Qwen CI           | `qwen-code-action` immutable commit + `qwen_cli_version=0.21.0` + workflow/credential Slice                                        | recipe 指向 `main`，默认 CLI `latest`       |
| Codex SDK/CI/IDE  | SDK package、Action commit、extension/client build各自锁定                                                                         | current/unversioned docs                    |

## 6. IM / CI / Client 副作用边界

- Qwen channel 的真实 adapter probe 会接收/发送消息，至少是 `R3`。当前不自动启动
  Telegram、Weixin、QQ、DingTalk、WeCom 或 Feishu。
- GitHub Action probe 会创建 workflow run，且可能 comment、patch、review 或使用
  secret，属于 `R3`。
- IDE/desktop extension 安装会改变本地应用状态，属于 `R3`；artifact 静态锁定可先用
  `R0`。
- remote/web client 登录、配对与 cloud task 至少是 `R2`；任何 PR/comment 写入是
  `R3`。

## 7. Probe 完成标准

每次执行必须保存：

1. product/component exact version、artifact hash、platform 与 Surface；
2. preconditions、完整 procedure、stdout/stderr/protocol payload、exit/status；
3. authentication、entitlement、provider/model/config/feature flags；
4. 文件、进程、socket、network 与 external side effects；
5. cleanup 结果和残留；
6. started/finished timestamp；
7. 能闭合的单一 Atomic contract leaf，以及仍未闭合的反例。

Probe 失败、超时或未找到入口只能写 `Not reproduced` 或 `Unknown`；不能自动生成
`Not supported`。

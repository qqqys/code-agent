# Phase 1D Secondary Surface Runtime Probe Execution

> 状态：Reviewing  
> 执行窗口：2026-07-26T05:17:36Z ～ 2026-07-26T05:23:52Z  
> 平台：Darwin arm64  
> 前置目录：[`02-secondary-surface-runtime-probes.md`](./02-secondary-surface-runtime-probes.md)

## 1. 执行结论

| Probe ID                           | Frozen target                   | Result                    | Runtime boundary                                                                                 |
| ---------------------------------- | ------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------ |
| `P1C2-QWN-DAEMON-DISCOVERY-001`    | Qwen Code `0.21.0` sdk-daemon   | `Reproduced`              | 13/13 assertions pass；未创建 session、未请求模型；ACP preheat 被测试开关显式关闭                |
| `P1C2-CDX-APP-INIT-001`            | Codex `0.145.0` app-server      | `Blocked by containment`  | 首条 request 无 response；进程先尝试在真实 Codex Home 初始化 SQLite state，被 deny-default 拒绝 |
| `P1C2-CDX-MCP-LIST-001`            | Codex `0.145.0` MCP stdio server | `Blocked by containment` | initialize 无 response；进程先读取真实 Codex Home 的 `config.toml`，被 deny-default 拒绝         |

`Blocked by containment` 不是“不支持”。它表示在“不读真实 config/credential、不改
`HOME`、不允许网络”的边界内，服务启动前置尚不能满足，因此正常协议行为没有被执行。

## 2. Frozen Artifact 与 Harness

| Artifact                     | Exact identity / SHA-256                                                               |
| ---------------------------- | -------------------------------------------------------------------------------------- |
| Qwen npm tarball             | `@qwen-code/qwen-code@0.21.0`；`62fa5ea404a8d1f694edc54446bbd4ca6d3a69e090ec5975977ff51918d2aeca` |
| Qwen CLI entry               | `cli-entry.js`；`1db9709bf1753611ca2fec234cf5adf517376efeb1540fcf9e309da010f9ed38`   |
| Codex Darwin arm64 binary    | `codex-cli 0.145.0`；`1da3f4e0e96028b8a771814293c3033dafd1971f943f6c7e79b0897fe705f590` |
| Node runtime                 | `/opt/homebrew/Cellar/node/25.9.0_2/bin/node`                                          |
| Probe runner                 | `scripts/run-phase-1d-probe.mjs`；hash 见第 7 节                                      |
| Qwen Seatbelt profile        | `scripts/phase-1d-qwen.sb`；hash 见第 7 节                                             |
| Codex Seatbelt profile       | `scripts/phase-1d-codex.sb`；hash 见第 7 节                                            |

三路执行命令均配置为由 `/usr/bin/env -i` 建立 allowlisted environment，再进入
macOS Seatbelt `deny default` profile。profile 文件及 runner 由 hash 锁定；但 raw
snapshot 没有把外层 `sandbox-exec` invocation/profile hash 嵌入子进程结果，因此这
一层是 execution-policy record，不是 cryptographic execution binding。共同声明边界：

- 不复制调用进程的 API key、proxy、provider、auth 或产品配置环境；
- 真实 `/Users/qqqys` 只允许路径祖先 metadata，不允许读取文件；
- 只允许写单次 `/private/tmp/ccq-phase1d-*` probe root；
- Codex 禁止全部 IP network；
- Qwen 只允许 bind/connect localhost，remote IP 仍由默认拒绝；
- child 只允许执行 frozen Codex binary 或 pinned Node；Qwen full-status 对
  `rg`、`git`、`npm` 的 preflight spawn 均收到 `EPERM`。

真实 Codex Home 的 `Operation not permitted` 与 Qwen 的 `spawn EPERM` 是 policy
生效的运行信号；remote IP denial 没有通过 active canary 单独验证。

## 3. Qwen 最终有效 Probe

### 3.1 Preconditions

稳定归档：

```text
.qwen/research/codex-claude-qwen/artifacts/phase-1d/qwen-result.json
SHA-256 5e5e75bb2fd641aae3ec4ff2144b3695f423fabf7463ed7946a694324c48b284
```

JSON 中保留原执行 root
`/private/tmp/ccq-phase1d-qwen-r4.A2oZEj`，用于解释该次 run 的动态
PID/port/path；归档副本不改写任何字段。

产品专用 root 与防御性开关：

- `QWEN_HOME`、`QWEN_RUNTIME_DIR`
- `QWEN_CODE_SYSTEM_SETTINGS_PATH`、`QWEN_CODE_SYSTEM_DEFAULTS_PATH`
- `QWEN_CODE_TRUSTED_FOLDERS_PATH`、`QWEN_CODE_MCP_APPROVALS_PATH`
- `QWEN_CODE_MEMORY_BASE_DIR`
- `QWEN_SERVE_NO_PERSISTENT_REGISTRATION=1`
- `QWEN_CODE_DISABLE_PRECONNECT=1`
- `QWEN_TELEMETRY_ENABLED=false`
- `QWEN_CODE_SKIP_UPDATE_CHECK_ONCE=true`
- `NODE_DISABLE_COMPILE_CACHE=1`
- `VITEST_WORKER_ID=ccq-phase1d-no-preheat`

最后一项是受控 test escape。冻结包中它只使
`shouldPreheatBridge()` 返回 false；因此本 probe 能证明 listener、bootstrap、
runtime route、auth、status 与 shutdown，不能证明 ACP child preheat handshake。

启动参数：

```text
node <frozen-qwen-entry> serve
  --hostname 127.0.0.1
  --port 0
  --workspace <fixture>
  --require-auth
  --no-web
  --max-sessions 1
  --max-connections 8
```

### 3.2 Lifecycle

```text
process start
  -> listener ready on 127.0.0.1:57318
  -> authenticated shallow /health = 200
  -> deep /health = 503 bootstrap, Retry-After: 1
  -> health-triggered deferred runtime start
  -> deep /health = 200, workspaceCount=1, sessions=0
  -> capability/status/error probes
  -> SIGTERM drain
  -> exit 0, PID gone, listener ECONNREFUSED
```

`daemon/status` 的 recorded timing：

- `processToListenMs=327`
- `runQwenServeToListenMs=206`
- `preheat.status=not_scheduled`

这些 timing 只描述该主机单次运行，不用于性能横向比较。

### 3.3 HTTP Results

| Request                                    | Result                                                                 |
| ------------------------------------------ | ---------------------------------------------------------------------- |
| `/health`，无 token                        | `401 {"error":"Unauthorized"}`                                        |
| `/health`，错误 token                      | `401 {"error":"Unauthorized"}`                                        |
| `/health`，正确 token                      | `200 {"status":"ok"}`                                                  |
| `/health?deep=1`，bootstrap                | `503`，`reason=bootstrap`，`Retry-After: 1`                            |
| `/health?deep=1`，runtime mounted          | `200`；1 workspace；0 session/prompt/client；channel not live          |
| `/capabilities`                            | `200`；schema `v=1`；protocol current/supported 均为 `v1`              |
| `/daemon/status?detail=summary`            | `200`；top-level `status=ok`；runtime counters 与 security/limits 可见 |
| `/daemon/status?detail=full`               | HTTP `200`；top-level `status=error`，原因是 preflight spawn 被沙箱拒绝 |
| `/daemon/status?detail=invalid`            | `400`；`code=invalid_detail`                                          |
| unknown route，无/错 token                 | `401`                                                                 |
| unknown route，正确 token，`--no-web`      | `404`；Express `Cannot GET` HTML                                      |
| `/health` after shutdown                   | transport `ECONNREFUSED`                                              |

`/capabilities` 返回：

- `qwenCodeVersion=0.21.0`
- `mode=http-bridge`
- `transports=["rest"]`
- `features` 共 `99` 项；有序数组 SHA-256
  `a44259350dc419b8c3731aeb6d2acabcd829a03fa8892f7eaf1c318f4db40787`
- 含动态 workspace identity/path 的整份 capability body，经递归 key-sort 后
  JSON serialization 的本次 snapshot SHA-256 为
  `d5bd9b9fde7e3adcee4d9e3ef809a6e78fcb727893c70e2a13ff5bc1d4469da2`

feature inventory 是单向 discovery。它没有接收客户端 version/capability，也没有
对不兼容组合执行拒绝或降级，因此不改变
`CAP-10.08-A01` 当前的 scoped negative 结论。

### 3.4 Side Effects 与 Cleanup

专用 root 内观察到：

- fixture `README.md`；
- 三个初始空 settings 文件均被 schema migration 改写为
  `{"$version":4}`；
- `qwen-home/scratch-workspaces/` 空目录；
- runtime debug log、`latest` symlink 与 workspace-hash temp directory；
- 无 session/transcript/auth/MCP approval/trust registry 文件；
- daemon log 记录 runtime start、route status、SIGTERM drain 与
  `daemon stopped`。
- daemon log 还警告 `one or more runtime env files could not be read`；这是
  deny-default containment 中 ambient runtime env 路径不可读造成的环境差异。

full-status 的 `preflight` section 尝试启动 `rg`、`git`、`npm`。三次均由
process-exec allowlist 拒绝为 `spawn EPERM`，所以 HTTP response 的
`status=error` 是 containment-induced diagnostic result，不是 daemon listener
失败。

## 4. Codex app-server Attempt

稳定归档：

```text
.qwen/research/codex-claude-qwen/artifacts/phase-1d/codex-app-result.json
SHA-256 92bb03269a08861b1ed79ec0fb80c3c1c9bd15d94d2d02e39cb732cc07d4762e
```

发送的唯一 request：

```json
{"id":"preinit-1","method":"ccq/doesNotExist","params":{}}
```

结果：

- stdout 空；没有 matching error response；
- stderr：
  `WARNING: proceeding, even though we could not create PATH aliases: File exists
  (os error 17)`，以及
  `failed to initialize sqlite state runtime under /Users/qqqys/.codex`；
- exit `1`，PID 已消失；
- probe root 只存在 runner 创建的 `fixture/` 与 `tmp/`；
- IP network 被禁止，真实 Codex Home 没有读写权限。

因此本次 runtime 只直接证明：harness 调用了 `child.stdin.write`，stdout 没有
protocol response，进程报告 Codex Home state runtime 初始化失败并 exit `1`。
harness write 不证明 server 已读取、解析或处理该 request。exact-commit source
另外说明 state runtime 初始化早于 stdio processor，但不能用 source 预期 response
回填 runtime。initialize、pre-initialize error、repeat initialize 与 unknown-method
仍未复现。

## 5. Codex MCP Attempt

稳定归档：

```text
.qwen/research/codex-claude-qwen/artifacts/phase-1d/codex-mcp-result.json
SHA-256 f1c1971181ab485967ae60422e950c39ccdb4d18c912924e240b149fca0a8548
```

发送的唯一 request：

```json
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"ccq-phase1d-probe","version":"1.0.0"}}}
```

结果：

- stdout 空；没有 initialize response；
- stderr：
  `WARNING: proceeding, even though we could not create PATH aliases: File exists
  (os error 17)`，以及
  `Failed to read config file /Users/qqqys/.codex/config.toml: Operation not permitted`；
- exit `1`，PID 已消失；
- probe root 只存在 runner 创建的 `fixture/` 与 `tmp/`；
- 没有发送 `initialized`、`tools/list` 或 `tools/call`。

因此本次 runtime 只直接证明：harness 调用了 `child.stdin.write`，stdout 没有
protocol response，进程报告 Codex Home config 不可读并 exit `1`。harness write
不证明 server 已读取、解析或处理 initialize。固定两个工具及其 schema 仍是
exact-commit source + frozen-binary-consistent 事实，不是 runtime-reproduced 事实。

## 6. Harness Iteration Ledger

| Attempt | Root                                             | Outcome                  | Resolution                                                                            |
| ------- | ------------------------------------------------ | ------------------------ | ------------------------------------------------------------------------------------- |
| Q1      | `/private/tmp/ccq-phase1d-qwen.hshyoA`          | child exit `1`           | 初版失败记录未保留 child stderr；补失败 capture 与 cleanup                            |
| Q2      | `/private/tmp/ccq-phase1d-qwen-r2.uimjpk`       | Node `lstat` `EPERM`     | 只补 frozen package 父目录 metadata read，不扩大文件内容 read                         |
| Q3      | `/private/tmp/ccq-phase1d-qwen-r3.y0smKd`       | listener ready；HTTP 全失败 | 发现 `local ip` 只闭合 bind/inbound；补 localhost outbound 与 13 项 mandatory assertions |
| Q4      | `/private/tmp/ccq-phase1d-qwen-r4.A2oZEj`       | `Reproduced`             | 最终证据；13/13 pass                                                                 |
| C-App   | `/private/tmp/ccq-phase1d-codex-app.yI3NxI`     | containment block        | 保留失败证据；不允许真实 Codex Home                                                   |
| C-MCP   | `/private/tmp/ccq-phase1d-codex-mcp.zglS3Z`     | containment block        | 保留失败证据；未继续发送协议消息                                                       |

Q3 runner 曾仅因 listener ready 返回内部 `Reproduced`。该结果明确作废；Q4 前已加入
mandatory HTTP/cleanup assertions，validator 只接受 Q4。

## 7. Integrity

最终 hash 由 Phase 1D validator 重新计算并校验。三份 raw result 与 Qwen daemon
log 已保存在 gitignored `artifacts/phase-1d/`，不再依赖 disposable
`/private/tmp`。可复跑入口是：

| File                                                                      | SHA-256                                                            |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| [`run-phase-1d-probe.mjs`](../scripts/run-phase-1d-probe.mjs)             | `20e72d1e098626ebd2f93dabef4431e728cf571ce22851a80d5ac30fb9087eac` |
| [`phase-1d-qwen.sb`](../scripts/phase-1d-qwen.sb)                          | `26490bd39fb83b311ecf3fe1baac61a7f9f7e6f42c177228041ffba3eab9b746` |
| [`phase-1d-codex.sb`](../scripts/phase-1d-codex.sb)                        | `5a3617f011685deef63bd12a0fb2ef637ac2f9aef3ce00306f03e041326a6bfc` |
| [`validate-phase-1d.mjs`](../scripts/validate-phase-1d.mjs)                | `adf2c8d953ed9ce8ad2354a58ea14cef71f2c4e8ca28f9922333ab659c325768` |
| [`qwen-result.json`](../artifacts/phase-1d/qwen-result.json)               | `5e5e75bb2fd641aae3ec4ff2144b3695f423fabf7463ed7946a694324c48b284` |
| [`codex-app-result.json`](../artifacts/phase-1d/codex-app-result.json)      | `92bb03269a08861b1ed79ec0fb80c3c1c9bd15d94d2d02e39cb732cc07d4762e` |
| [`codex-mcp-result.json`](../artifacts/phase-1d/codex-mcp-result.json)      | `f1c1971181ab485967ae60422e950c39ccdb4d18c912924e240b149fca0a8548` |
| [`qwen-daemon.log`](../artifacts/phase-1d/qwen-daemon.log)                 | `26ad8c883033092564dbd9d5cca0d351d407b4601ac412aa318ca0c971ec27d2` |

validator 有两种合同：

- 无参数：验证 `artifacts/phase-1d/` 的 locked snapshot hash、完整 Record 与 frozen
  Phase 1C.2 lock；
- `--semantic <qwen> <codex-app> <codex-mcp>`：重新推导动态 run 的行为，不要求旧
  timestamp/PID/port/path/raw hash。

Harness/profile/artifact 只位于 gitignored `.qwen/research/`，未修改当前 checkout
的产品源码。

# Phase 1D Runtime Probe：增量 Evidence Ledger

> 阶段：1D · Secondary Surface Runtime Probe  
> Captured boundary：2026-07-26T05:23:52Z  
> 调研平台：Darwin arm64  
> 执行细节：[`probes/03-phase-1d-executed-runtime-probes.md`](../probes/03-phase-1d-executed-runtime-probes.md)

本文只定义 Phase 1D 新增 Evidence Record，不修改已冻结的 Phase 1C.2 Claim 或
relation。下文的 candidate relation 必须在下一次 generator revision 中通过
version/channel/surface/Atomic review 后才能进入正式 Claim。

## 1. Environments

| Env ID                       | Product / surface | Isolation                                                                 | Authentication / provider / model                  | Configuration                                                                                                    |
| ---------------------------- | ----------------- | ------------------------------------------------------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `ENV-qwen-1D-RUNTIME-001`    | Qwen sdk-daemon   | deny-default Seatbelt；真实 home 不可读；probe root only write；localhost only | fixed non-secret bearer；无 provider credential；无模型 | custom Qwen roots；telemetry/preconnect/update/registration disabled；`VITEST_WORKER_ID` disables ACP preheat     |
| `ENV-codex-1D-APP-001`       | Codex app-server  | deny-default Seatbelt；真实 home 不可读写；probe root only write；no IP network | 未登录；未读取 credential；无模型                  | sanitized env；temp cwd；不设置或重定向 `HOME` / Codex Home                                                     |
| `ENV-codex-1D-MCP-001`       | Codex MCP server  | 同上                                                                      | 未登录；未读取 credential；无模型                  | sanitized env；temp cwd；只发送 initialize；启动失败后未发送 tools/list                                         |
| `ENV-codex-1D-SOURCE-001`    | Codex sdk-daemon  | exact release tag public source + frozen binary static anchors            | not-applicable                                     | tag `rust-v0.145.0`；commit `25af12f7e61572b0bc18ddb1008be543b91519b0`；无 reproducible-build proof |

“真实 home 不可读”由 Seatbelt policy 强制。Codex stderr 中的 `Operation not
permitted` 是边界生效的直接结果；它不表示真实文件不存在。

隔离表同时包含 policy 与 runtime 两种证据：profile/runner hash 能确认审阅的策略
文件，`Operation not permitted`、`spawn EPERM` 与 localhost success 是部分运行
信号；raw snapshot 没有嵌入外层 `sandbox-exec` invocation/profile hash，且未运行
remote network canary。因此“remote IP denied”只按 policy-confirmed 使用，不升级为
独立 runtime-confirmed。

## 2. Evidence Records

| Evidence ID                     | Type      | Version / channel  | Surface    | Captured at            | Env                         | Bounded observation                                                                                                                                                                                                                              | Provable scope                                                                                                              | Candidate links                                                                                         | Limitations                                                                                                                                           |
| ------------------------------- | --------- | ------------------ | ---------- | ---------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `EVD-qwen-code-RUNTIME-001`     | `RUNTIME` | `0.21.0` / stable  | sdk-daemon | `2026-07-26T05:21:36Z` | `ENV-qwen-1D-RUNTIME-001`  | listener ready；`/health` 与 unknown route 的无/错 bearer 请求为 401；正确 bearer shallow health 为 200；deep health 从 bootstrap 503 转为 runtime 200；`/capabilities` 返回 `v1`、Qwen `0.21.0` 与 99 features；多个 status/error route 连续处理成功 | exact daemon discovery、两类 route 的 auth rejection、bootstrap→runtime readiness、单向 capability inventory 与 multiple local requests | qualifies `CAP-10.07-A01`、`CAP-10.08-A01`; supports bounded clauses of `CAP-12.05-A01`                  | ACP preheat 由 test escape 关闭；未创建 session、SSE client、prompt、MCP、channel 或模型请求；不证明 task-ready service 或所有 route 的 auth rejection |
| `EVD-qwen-code-RUNTIME-002`     | `RUNTIME` | `0.21.0` / stable  | sdk-daemon | `2026-07-26T05:21:36Z` | `ENV-qwen-1D-RUNTIME-001`  | summary status `ok`；full status 定位 daemon log，但 preflight spawn 被 containment 拒绝而 top-level `error`；三个空 settings 被迁移为 `$version=4`；SIGTERM drain exit 0，PID 消失，listener 后续 `ECONNREFUSED`                  | persistent diagnostic log location/content、diagnostic side effects、graceful parent/listener cleanup                      | supports bounded clauses of `CAP-12.02-A02`; qualifies `CAP-12.07-A03`                                  | daemon log 还警告 ambient runtime env 文件因 containment 无法读取；没有 ACP child；未制造 crash、遗留 listener 或 failed cleanup，不能闭合 legacy child/resource recovery |
| `EVD-codex-RUNTIME-004`         | `RUNTIME` | `0.145.0` / latest | sdk-daemon | `2026-07-26T05:22:42Z` | `ENV-codex-1D-APP-001`     | harness 向 exact binary app-server stdin 写入一条 pre-initialize unknown request；stdout 无 response；进程报告 `failed to initialize sqlite state runtime under /Users/qqqys/.codex` 并退出 1；probe root 无产品文件                   | app-server startup failure-before-protocol-output boundary under denied Codex Home                                          | qualifies startup/failure clauses of `CAP-10.07-A01`; does not support `CAP-10.08-A01` runtime          | 只证明 harness 写入，不证明 server 已读取或处理消息；containment-induced failure；不证明正常 home/config 下的 initialize、error code、notification 或 shutdown |
| `EVD-codex-RUNTIME-005`         | `RUNTIME` | `0.145.0` / latest | sdk-daemon | `2026-07-26T05:23:52Z` | `ENV-codex-1D-MCP-001`     | harness 向 exact binary MCP server stdin 写入 initialize line；stdout 无 response；进程报告读取 `/Users/qqqys/.codex/config.toml` 时 `Operation not permitted` 并退出 1；未发送 tools/list 或 tools/call                             | MCP server startup failure-before-protocol-output boundary under denied Codex Home                                         | qualifies startup/failure clauses of `CAP-10.07-A01`; does not support `CAP-07.04-A01/A02` runtime      | 只证明 harness 写入，不证明 server 已读取或处理消息；containment-induced failure；不证明正常 config 下的 MCP handshake、tool discovery、tool validation 或 EOF drain |
| `EVD-codex-SOURCE-002`          | `SOURCE`  | `0.145.0` / latest | sdk-daemon | `2026-07-26T05:23:52Z` | `ENV-codex-1D-SOURCE-001`  | exact commit app-server transport 是 LF JSONL；wire 不发送/期待 `jsonrpc`；initialize requires clientInfo name/version，response requires codexHome/platformFamily/platformOs/userAgent；无 protocolVersion/server capability field                         | exact-commit protocol shape；binary embedded source/string anchors are consistent with the commit                          | supports schema interpretation for `CAP-10.08-A01` mapping review                                      | commit source 与 frozen binary 未通过 reproducible build 建立密码学同一性；runtime initialize 被 containment 阻断                                               |
| `EVD-codex-SOURCE-003`          | `SOURCE`  | `0.145.0` / latest | sdk-daemon | `2026-07-26T05:23:52Z` | `ENV-codex-1D-SOURCE-001`  | exact commit MCP transport 是 JSON-RPC 2.0 JSONL；initialize echo client protocol version；tools/list 固定构造 `codex` 与 `codex-reply`；unknown tool name 在进入 model/session path 前返回 error result；EOF closes processor/writer                  | exact-commit MCP framing, static tool inventory/schema construction, safe canary dispatch boundary, source-level EOF path   | supports static clauses for `CAP-07.04-A01`; qualifies planned negative canary for `CAP-07.04-A02`      | tools/list 与 canary 未在 frozen binary runtime 复现；不能把 source result 升级为 runtime support                                                                     |

上表是索引；以下六个完整 Record 逐条绑定稳定归档、immutable source 与 procedure。
本页 YAML 中的本地 `source_url_or_path` 均相对 research root
`.qwen/research/codex-claude-qwen/`。

## 3. Qwen Runtime Records

### `EVD-qwen-code-RUNTIME-001`

```yaml
evidence_id: EVD-qwen-code-RUNTIME-001
evidence_type: RUNTIME
product: Qwen Code
version: 0.21.0
release_channel: stable
product_surface: sdk-daemon
source_url_or_path: artifacts/phase-1d/qwen-result.json
captured_at: 2026-07-26T05:21:36.511Z
environment:
  platform: [Darwin arm64, Node 25.9.0]
  authentication: [fixed non-secret local bearer]
  entitlement: [not-applicable]
  region: not-applicable
  provider: not-applicable
  model: not-applicable
  configuration: [fixture workspace, controlled Qwen roots, sanitized environment]
  feature_flags: [ACP preheat disabled through frozen artifact test-only gate]
artifact_hash_or_excerpt: sha256:5e5e75bb2fd641aae3ec4ff2144b3695f423fabf7463ed7946a694324c48b284
runtime_probe:
  applicability: applicable
  preconditions:
    - frozen @qwen-code/qwen-code@0.21.0 tarball
    - declared deny-default Seatbelt profile; localhost-only network policy
  procedure:
    - start qwen serve on an ephemeral loopback port with --require-auth and --no-web
    - issue 13 bounded HTTP/cleanup assertions without creating a session
    - send SIGTERM and retry health after process exit
  stdout: exact bounded capture in probe.stdout
  stderr: exact bounded capture in probe.stderr
  exit_code: 0
  side_effects:
    - controlled settings migrations and daemon diagnostics described by EVD-qwen-code-RUNTIME-002
  cleanup: [PID gone, listener returned ECONNREFUSED]
  started_at: 2026-07-26T05:21:35.800Z
  finished_at: 2026-07-26T05:21:36.511Z
record_relations: []
limitations:
  - negative bearer checks covered /health and unknown route, not every route
  - ACP preheat, task/session/SSE/MCP/channel/provider/model paths were not exercised
  - profile integrity is checked, but the captured process is not cryptographically bound to the outer sandbox-exec invocation
  - remote-network denial is a policy assertion; no active remote canary was run
```

直接观察：

- listener `127.0.0.1:57318`，`processToListenMs=327`；
- `/health` 与 unknown route 的无/错 bearer 请求为 `401`；其他成功 route 只使用
  正确 bearer，未做各 route 的 negative auth matrix；
- deep health 从 `503 degraded; Retry-After=1` 转为
  `200 ok; workspaceCount=1; sessions=0`；
- capability schema `1`，protocol current/supported 为 `v1/[v1]`，
  Qwen Code `0.21.0`，99 features；feature array SHA-256 为
  `a44259350dc419b8c3731aeb6d2acabcd829a03fa8892f7eaf1c318f4db40787`。

`workspace trusted=true` 只描述该显式 fixture 与这次空 trust state 的解析结果，不外推
真实 repo 的 trust policy。

### `EVD-qwen-code-RUNTIME-002`

```yaml
evidence_id: EVD-qwen-code-RUNTIME-002
evidence_type: RUNTIME
product: Qwen Code
version: 0.21.0
release_channel: stable
product_surface: sdk-daemon
source_url_or_path: artifacts/phase-1d/qwen-result.json
captured_at: 2026-07-26T05:21:36.511Z
environment:
  platform: [Darwin arm64, Node 25.9.0]
  authentication: [fixed non-secret local bearer]
  entitlement: [not-applicable]
  region: not-applicable
  provider: not-applicable
  model: not-applicable
  configuration: [fixture workspace, controlled Qwen roots, sanitized environment]
  feature_flags: [ACP preheat disabled through frozen artifact test-only gate]
artifact_hash_or_excerpt:
  result_sha256: 5e5e75bb2fd641aae3ec4ff2144b3695f423fabf7463ed7946a694324c48b284
  daemon_log_sha256: 26ad8c883033092564dbd9d5cca0d351d407b4601ac412aa318ca0c971ec27d2
runtime_probe:
  applicability: applicable
  preconditions: [same process and containment declaration as EVD-qwen-code-RUNTIME-001]
  procedure:
    - request summary, full, and invalid-detail status with the correct bearer
    - inventory controlled-root files
    - send SIGTERM and verify parent/listener cleanup
  stdout: exact bounded capture in probe.stdout
  stderr: exact bounded capture in probe.stderr
  exit_code: 0
  side_effects:
    - three empty settings files migrated to '{"$version":4}'
    - daemon log, latest symlink, scratch directory, and workspace-hash temp directory created
    - full status attempted rg/git/npm preflight; containment returned spawn EPERM
    - daemon warned that one or more runtime env files could not be read
  cleanup: [SIGTERM drain, PID gone, listener ECONNREFUSED]
  started_at: 2026-07-26T05:21:35.800Z
  finished_at: 2026-07-26T05:21:36.511Z
record_relations: []
limitations:
  - unreadable ambient runtime env files make this a contained-environment delta
  - no ACP child, crash, legacy resource, or failed-cleanup path was exercised
```

summary status 是 `ok`；full status 因 `rg/git/npm` preflight spawn 被 containment
拒绝而返回 top-level `error`。daemon log 还包含：

```text
one or more runtime env files could not be read
```

该 warning 来自 deny-default 环境下不可读的 ambient runtime env 路径。因此本次
runtime mount 只证明受控发现/状态 route 可用，不证明完整 runtime-env 装载。

“full status 是 read-only”也不能从本 probe 得出：它会尝试执行本机依赖 preflight。
执行均被拒绝，所以没有成功子进程或外部副作用，但调用本身具有 process-spawn
attempt。

## 4. Codex Runtime Block Records

### `EVD-codex-RUNTIME-004`

```yaml
evidence_id: EVD-codex-RUNTIME-004
evidence_type: RUNTIME
product: Codex
version: 0.145.0
release_channel: latest
product_surface: sdk-daemon
source_url_or_path: artifacts/phase-1d/codex-app-result.json
captured_at: 2026-07-26T05:22:42.197Z
environment:
  platform: [Darwin arm64]
  authentication: [not logged in, credentials unread]
  entitlement: [not-applicable]
  region: not-applicable
  provider: not-applicable
  model: not-applicable
  configuration: [sanitized environment, temp cwd, real Codex Home denied]
  feature_flags: []
artifact_hash_or_excerpt: sha256:92bb03269a08861b1ed79ec0fb80c3c1c9bd15d94d2d02e39cb732cc07d4762e
runtime_probe:
  applicability: applicable
  preconditions:
    - frozen codex-cli 0.145.0 Darwin arm64 binary
    - declared deny-default Seatbelt profile; no-IP-network policy
  procedure:
    - start codex app-server
    - harness calls child.stdin.write with one pre-initialize unknown request
    - capture stdout, stderr, exit, side effects, and PID state
  stdout: ''
  stderr:
    - 'WARNING: proceeding, even though we could not create PATH aliases: File exists (os error 17)'
    - 'Error: failed to initialize sqlite state runtime under /Users/qqqys/.codex: failed to initialize state runtime at /Users/qqqys/.codex'
  exit_code: 1
  side_effects: [runner-created fixture and tmp directories only]
  cleanup: [failed process PID gone]
  started_at: 2026-07-26T05:22:41.232Z
  finished_at: 2026-07-26T05:22:42.197Z
record_relations: []
limitations:
  - harness write does not prove the server read, parsed, or processed the request
  - failure was induced by denied Codex Home and occurred before protocol output
  - PATH-alias warning was observed but not causally isolated
  - profile integrity is checked, but the captured process is not cryptographically bound to the outer sandbox-exec invocation
  - remote-network denial is a policy assertion; no active remote canary was run
```

### `EVD-codex-RUNTIME-005`

```yaml
evidence_id: EVD-codex-RUNTIME-005
evidence_type: RUNTIME
product: Codex
version: 0.145.0
release_channel: latest
product_surface: sdk-daemon
source_url_or_path: artifacts/phase-1d/codex-mcp-result.json
captured_at: 2026-07-26T05:23:52.152Z
environment:
  platform: [Darwin arm64]
  authentication: [not logged in, credentials unread]
  entitlement: [not-applicable]
  region: not-applicable
  provider: not-applicable
  model: not-applicable
  configuration: [sanitized environment, temp cwd, real Codex Home denied]
  feature_flags: []
artifact_hash_or_excerpt: sha256:f1c1971181ab485967ae60422e950c39ccdb4d18c912924e240b149fca0a8548
runtime_probe:
  applicability: applicable
  preconditions:
    - frozen codex-cli 0.145.0 Darwin arm64 binary
    - declared deny-default Seatbelt profile; no-IP-network policy
  procedure:
    - start codex mcp-server
    - harness calls child.stdin.write with one MCP initialize request
    - capture stdout, stderr, exit, side effects, and PID state
  stdout: ''
  stderr:
    - 'WARNING: proceeding, even though we could not create PATH aliases: File exists (os error 17)'
    - 'Error: error loading config: Failed to read config file /Users/qqqys/.codex/config.toml: Operation not permitted (os error 1)'
  exit_code: 1
  side_effects: [runner-created fixture and tmp directories only]
  cleanup: [failed process PID gone]
  started_at: 2026-07-26T05:23:51.092Z
  finished_at: 2026-07-26T05:23:52.152Z
record_relations: []
limitations:
  - harness write does not prove the server read, parsed, or processed initialize
  - failure was induced by denied Codex Home and occurred before protocol output
  - initialized, tools/list, and tools/call were not written
  - PATH-alias warning was observed but not causally isolated
  - profile integrity is checked, but the captured process is not cryptographically bound to the outer sandbox-exec invocation
  - remote-network denial is a policy assertion; no active remote canary was run
```

两个 block 都发生在任何协议 output 之前。禁止用 exact-commit source 的预期 response
回填 runtime output。

## 5. Exact-commit Source Records

### `EVD-codex-SOURCE-002`

```yaml
evidence_id: EVD-codex-SOURCE-002
evidence_type: SOURCE
product: Codex
version: 0.145.0 / commit 25af12f7e61572b0bc18ddb1008be543b91519b0
release_channel: latest
product_surface: sdk-daemon
source_url_or_path: https://github.com/openai/codex/blob/25af12f7e61572b0bc18ddb1008be543b91519b0/codex-rs/app-server-protocol/src/rpc.rs#L1-L88
captured_at: 2026-07-26T05:23:52.152Z
environment:
  platform: [not-applicable]
  authentication: [not-applicable]
  entitlement: [not-applicable]
  region: not-applicable
  provider: not-applicable
  model: not-applicable
  configuration: [not-applicable]
  feature_flags: [not-applicable]
artifact_hash_or_excerpt: immutable commit anchors listed below; frozen binary is string-consistent but not reproducibly built
runtime_probe:
  applicability: not-applicable
record_relations: []
limitations:
  - no reproducible-build proof binds the public source commit to the frozen binary
  - initialize did not return a runtime response in this probe
```

- [stdio JSONL framing and EOF](https://github.com/openai/codex/blob/25af12f7e61572b0bc18ddb1008be543b91519b0/codex-rs/app-server-transport/src/transport/stdio.rs#L24-L113)
- [wire envelope without `jsonrpc`](https://github.com/openai/codex/blob/25af12f7e61572b0bc18ddb1008be543b91519b0/codex-rs/app-server-protocol/src/rpc.rs#L1-L88)
- [initialize processor](https://github.com/openai/codex/blob/25af12f7e61572b0bc18ddb1008be543b91519b0/codex-rs/app-server/src/request_processors/initialize_processor.rs#L44-L155)
- [request and notification dispatch](https://github.com/openai/codex/blob/25af12f7e61572b0bc18ddb1008be543b91519b0/codex-rs/app-server/src/message_processor.rs#L520-L630)
- [startup and EOF shutdown](https://github.com/openai/codex/blob/25af12f7e61572b0bc18ddb1008be543b91519b0/codex-rs/app-server/src/lib.rs#L449-L755)
- [default Codex Home resolution](https://github.com/openai/codex/blob/25af12f7e61572b0bc18ddb1008be543b91519b0/codex-rs/utils/home-dir/src/lib.rs#L5-L63)

App-server 的 `initialized` notification 在 exact commit 只被记录，不是 initialize
完成 gate。不存在 handshake-level `protocolVersion`；过去 catalog 中的
“invalid-version”步骤不适用，应由 pre-initialize/repeat-initialize/unknown-method
替代。

### `EVD-codex-SOURCE-003`

```yaml
evidence_id: EVD-codex-SOURCE-003
evidence_type: SOURCE
product: Codex
version: 0.145.0 / commit 25af12f7e61572b0bc18ddb1008be543b91519b0
release_channel: latest
product_surface: sdk-daemon
source_url_or_path: https://github.com/openai/codex/blob/25af12f7e61572b0bc18ddb1008be543b91519b0/codex-rs/mcp-server/src/message_processor.rs#L160-L357
captured_at: 2026-07-26T05:23:52.152Z
environment:
  platform: [not-applicable]
  authentication: [not-applicable]
  entitlement: [not-applicable]
  region: not-applicable
  provider: not-applicable
  model: not-applicable
  configuration: [not-applicable]
  feature_flags: [not-applicable]
artifact_hash_or_excerpt: immutable commit anchors listed below; frozen binary is string-consistent but not reproducibly built
runtime_probe:
  applicability: not-applicable
record_relations: []
limitations:
  - no reproducible-build proof binds the public source commit to the frozen binary
  - tools/list, the unknown-tool canary, and EOF were not reproduced at runtime
```

- [stdio reader/writer](https://github.com/openai/codex/blob/25af12f7e61572b0bc18ddb1008be543b91519b0/codex-rs/mcp-server/src/lib.rs#L124-L200)
- [initialize and tool dispatch](https://github.com/openai/codex/blob/25af12f7e61572b0bc18ddb1008be543b91519b0/codex-rs/mcp-server/src/message_processor.rs#L160-L357)
- [tool schemas](https://github.com/openai/codex/blob/25af12f7e61572b0bc18ddb1008be543b91519b0/codex-rs/mcp-server/src/codex_tool_config.rs#L105-L433)

exact commit 构造的 tool names 为 `codex`、`codex-reply`。安全 negative canary 是
调用 `__ccq_probe_nonexistent__`；dispatch 在任何 session/model path 前返回
unknown-tool result。本轮因 config bootstrap 失败，没有实际发送该 canary。

2026-07-26 重新读取了
[current official App Server guide](https://learn.chatgpt.com/docs/app-server) 与
[current official MCP Server guide](https://learn.chatgpt.com/docs/mcp-server)。
它们可作为当前产品说明：前者确认省略 `jsonrpc` 的 JSONL protocol，后者确认当前
`codex`/`codex-reply` 两工具。它们是可变网页，不用于覆盖 exact `0.145.0` commit
语义；特别是当前 App Server guide 把 `initialized` 描述为 handshake gate，而
exact commit 的 processor 行为不同。

## 6. Evidence 使用约束

- `EVD-qwen-code-RUNTIME-001/002` 只属于
  `QWN-0210-DAEMON-DARWIN-ARM64-NONTTY`，不得复制到 CLI、SDK package、IDE 或 IM
  adapter Slice。
- test escape 关闭 preheat，因此不得支持
  `workspace_acp_preheat`、session、SSE、tool registry、provider auth 或模型能力。
- `/capabilities` 是运行确认的 discovery，不是双向 negotiation；不能与
  `CAP-10.08-A01` 同名即等价。
- `EVD-codex-RUNTIME-004/005` 只支持启动依赖/失败边界，不支持正常 app/MCP
  protocol。
- `EVD-codex-SOURCE-002/003` 是 exact-commit + binary-consistent source 证据；没有
  reproducible build proof，也没有 runtime response，必须与 runtime Evidence 分开。
- locked raw result 与 daemon log 已归档到 `artifacts/phase-1d/`；完整性由 SHA-256
  与 snapshot validator 约束。新的 rerun 使用 semantic mode，不会被旧 snapshot
  hash 误判为同一次运行。

# Phase 2E：Diagnostic Fault Evidence

> Evidence class：exact-binary local runtime  
> Frozen artifact SHA-256：`12d72a25792809ddfacff558bf74e9bd24277745d5af3933c3d4c7790d056915`

## Evidence records

### `EVD-P2E-CODEX-DOCTOR-BASELINE`

- Slice：Codex `0.145.0 / latest / CLI / Darwin-arm64 / non-TTY`
- Entry：`doctor --json`
- Observation：schema version `1`、Codex version `0.145.0`、`18` checks；
  overall `fail` 由多个独立 isolated-environment checks 组成。
- Use：证明 exact entry 的机器可读 baseline；不能把整体 exit/status归因给单个
  fault。

### `EVD-P2E-CODEX-GIT-CONTAINMENT`

- Fixture：real `.git/HEAD` + empty `PATH`。
- Observation：`git.environment` 报 repo=true、selected Git=not found。
- Counterfactual：normal PATH 在相同 profile 下也找不到 Git。
- Projection：`Not assessed`；输出存在，但归因未闭合。

### `EVD-P2E-CODEX-BAD-CA`

- Fixture：readable `bad-ca.pem`，只设置 `CODEX_CA_CERTIFICATE`。
- Observation：`network.env` 记录该 readable file；WebSocket check 报告
  `no certificates found in PEM file`，并指向该 env 与 fixture。
- Projection：selected custom-CA parse fault `Observed`。

### `EVD-P2E-CODEX-CORRUPT-CACHE`

- Fixture：`CODEX_HOME/version.json` 内容 `{`。
- Observation：`updates.status.details["version cache parse"]` 为
  `EOF while parsing an object at line 1 column 1`。
- Side effect：fixture mode、size 与 SHA-256 不变。
- Projection：selected corrupt-cache read fault `Observed`。

### `EVD-P2E-QWEN-STATUS-BASELINE`

- Slice：Qwen `0.21.0 / effective latest / CLI+sdk-daemon / Darwin-arm64 /
  non-TTY / Node`
- Entry：loopback `/daemon/status?detail=full`。
- Observation：v1 full response、exact Qwen version、stable/healthy log state。

### `EVD-P2E-QWEN-MISSING-PATH-TOOLS`

- Fixture：existing empty directory 作为 `PATH`。
- Observation：Git 与 npm cells 均为 `warning`，分别给出
  `git not found on PATH.` 与 `npm not found on PATH.`，没有 errno/errorKind。
- Exclusion：bundled ripgrep 的 `spawn EPERM` 不纳入 PATH 结论。
- Projection：selected Git/npm missing-tool behavior `Observed`。

### `EVD-P2E-QWEN-LOG-DEGRADED`

- Fixture：`$QWEN_RUNTIME_DIR/debug` 为 `0555`。
- stderr：创建 `debug/daemon` 时 `EACCES`，明确说明 daemon log disabled。
- Full status：
  - `logMode=stderr-only`
  - `logHealth=degraded`
  - `logIssues=["init_failed"]`
  - dropped records/bytes = `0`
  - 无 `logPath`
  - 顶层 issues 包含 `daemon_log_degraded`
- Projection：selected unwritable-log degradation `Observed`。

## Integrity

- exact Codex binary/tree、Qwen entry/tree、Node 与两个 Seatbelt profile hash 全部匹配；
- `7` 个 original process group 均消失；
- Qwen 三个 listener 在 shutdown 后均不可连接；
- 无 capture truncation、timeout、signal 或 spawn error；
- credential/model/provider/cost：`0 / 0 / 0 / 0`。

Raw record：
[`diagnostic-fault-matrix.json`](../artifacts/phase-2e/diagnostic-fault-matrix.json)。

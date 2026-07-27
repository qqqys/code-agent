# Phase 2D Config Identity / Layering：增量 Evidence Ledger

> Captured boundary：2026-07-26T14:55:55.508Z  
> Raw artifact：[`config-identity-layering.json`](../artifacts/phase-2d/config-identity-layering.json)  
> Raw SHA-256：`dc74e8fd2a4caa06cac8481743bb6e1fdb76c403b21229673fce1ef29f3b3187`

本文只增加 Phase 2D Evidence，不原地修改 Phase 1C Claim、Phase 2A–2C
Comparison Record 或早期结案快照。

## 1. Identity / version mechanism

| Product | Frozen observation | Boundary |
| --- | --- | --- |
| Codex `0.145.0` | exact tag `rust-v0.145.0` 的 `codex-rs/core/config.schema.json`；SHA `03456f…bd9`；draft-07；title `ConfigToml`；无 `$id`/version | 身份是 tag + path + hash；JSON Schema draft 不是产品 schema version；tag 与 released binary 的 cryptographic build provenance 未证明 |
| Claude `2.1.212` | runtime `get_settings` 不公开 schema id/version；SchemaStore pin `cfd4af8…` 的 editor schema SHA `2b4004…d28`，有稳定 `$id`、无 version | editor schema 与 binary validator 分离，精确等价保持 `Unknown` |
| Qwen `0.21.0` | exact bundle runtime 输出 `SETTINGS_VERSION=4`、`SETTINGS_VERSION_KEY="$version"`；静态 migration edges 为 v1→v2→v3→v4 与 v5→v4 | settings format version 不是 daemon envelope `v:1`，也不证明 consumer validation |

整体关系：`Different mechanisms / Not directly comparable`。

官方锚点：

- Codex exact-tag
  [`config.schema.json`](https://github.com/openai/codex/blob/rust-v0.145.0/codex-rs/core/config.schema.json)
  与 [`write-config-schema`](https://github.com/openai/codex/blob/rust-v0.145.0/justfile)。
- Claude 官方 [settings 文档](https://code.claude.com/docs/en/settings) 指向
  editor schema，并明确其周期性更新、可能滞后 CLI；本轮将
  [SchemaStore blob](https://github.com/SchemaStore/schemastore/blob/cfd4af80100400941fdc66787e24e6a2eed7348a/src/schemas/json/claude-code-settings.json)
  固定到不晚于 cohort capture 的 commit。

## 2. Runtime records

### `EVD-codex-RUNTIME-009`

```yaml
evidence_id: EVD-codex-RUNTIME-009
evidence_type: RUNTIME
product: Codex
version: '0.145.0'
release_channel: latest
product_surface: sdk-daemon
source_url_or_path: artifacts/phase-2d/config-identity-layering.json
captured_at: '2026-07-26T14:55:55.508Z'
environment:
  platform: [Darwin arm64, non-TTY]
  authentication: [sanitized environment, no inherited credentials]
  entitlement: [not-applicable]
  region: not-applicable
  provider: not-applicable
  model: not-applicable
  configuration: [isolated CODEX_HOME, app-server experimental config/read]
  feature_flags: [initialize capabilities.experimentalApi=true]
artifact_hash_or_excerpt: sha256:dc74e8fd2a4caa06cac8481743bb6e1fdb76c403b21229673fce1ef29f3b3187
runtime_probe:
  applicability: applicable
  preconditions: [exact binary/tree/protocol/profile identity, deny network]
  procedure: [trusted layers, untrusted layers, trusted layers plus session flag]
  stdout: exact LF-delimited protocol in artifact
  stderr: exact raw stream in artifact
  exit_code: { trusted: 0, untrusted: 0, session: 0 }
  side_effects: [all fixtures unchanged, persistent writes confined to scenario state]
  cleanup: [stdin EOF, original process group gone]
  started_at: '2026-07-26T14:55:50.840Z'
  finished_at: '2026-07-26T14:55:55.508Z'
record_relations: []
limitations:
  - app-server is an sdk-daemon surface, not the ordinary TUI display.
  - Modern system conflict was not materialized; /etc was not modified.
  - Project is not relabeled as Local.
```

Direct observations：

- trusted：nested project `model` 覆盖 root project/user；root project
  `model_reasoning_effort` 覆盖 user；
- untrusted：两个 project layer 仍列出 raw config，但带
  `disabledReason`，effective/origin 回到 user；
- session：`model` origin 为 `sessionFlags`，effort 仍来自 root project；
- reader 返回每层 version hash 与 per-key `origins`。

### `EVD-claude-code-RUNTIME-005`

```yaml
evidence_id: EVD-claude-code-RUNTIME-005
evidence_type: RUNTIME
product: Claude Code
version: '2.1.212'
release_channel: stable
product_surface: cli
source_url_or_path: artifacts/phase-2d/config-identity-layering.json
captured_at: '2026-07-26T14:55:55.508Z'
environment:
  platform: [Darwin arm64, non-TTY]
  authentication: [sanitized environment, bare mode, no inherited credentials]
  entitlement: [not-applicable]
  region: not-applicable
  provider: not-applicable; get_settings control request creates no model turn
  model: not-applicable
  configuration: [isolated user, project and local settings]
  feature_flags: [nonessential traffic, marketplace autoinstall, updates and telemetry disabled]
artifact_hash_or_excerpt: sha256:dc74e8fd2a4caa06cac8481743bb6e1fdb76c403b21229673fce1ef29f3b3187
runtime_probe:
  applicability: applicable
  preconditions: [exact binary/tree/profile identity, deny network]
  procedure: [all three non-empty layers, empty local plus project/user]
  stdout: one exact control_response per execution
  stderr: zero bytes
  exit_code: { all_layers: 0, project_user: 0 }
  side_effects: [all fixtures unchanged, persistent writes confined to scenario state]
  cleanup: [EOF, original process group gone]
  started_at: '2026-07-26T14:55:50.840Z'
  finished_at: '2026-07-26T14:55:55.508Z'
record_relations: []
limitations:
  - Managed/MDM policy and interactive workspace trust were not materialized.
  - A source appears only when it contributes at least one setting; the empty local file is not listed.
```

Direct observations：`local model > project model > user model`；local 未设置
`cleanupPeriodDays` 时 project `22` 覆盖 user `11`；`sources[]` 保留每个 non-empty
layer 的 raw sentinel，`applied.model` 与 effective 一致。

### `EVD-qwen-code-RUNTIME-006`

```yaml
evidence_id: EVD-qwen-code-RUNTIME-006
evidence_type: RUNTIME
product: Qwen Code
version: '0.21.0'
release_channel: stable
product_surface: sdk-daemon
source_url_or_path: artifacts/phase-2d/config-identity-layering.json
captured_at: '2026-07-26T14:55:55.508Z'
environment:
  platform: [Darwin arm64, non-TTY, Node 25.9.0]
  authentication: [fixed synthetic daemon bearer, no inherited credentials]
  entitlement: [not-applicable]
  region: not-applicable
  provider: not-applicable
  model: not-applicable
  configuration: [isolated SystemDefaults, User, Workspace, System and trusted-folders]
  feature_flags: [ACP preheat disabled by disclosed test escape, remote network denied]
artifact_hash_or_excerpt: sha256:dc74e8fd2a4caa06cac8481743bb6e1fdb76c403b21229673fce1ef29f3b3187
runtime_probe:
  applicability: applicable
  preconditions: [exact entry/tree/chunks/Node/profile identity, loopback only]
  procedure: [trusted daemon reader, untrusted daemon reader, exact settings-version export]
  stdout: listener plus exact runtime identity output in artifact
  stderr: bounded daemon diagnostics in artifact
  exit_code: { settings_identity: 0, trusted_daemon: 0, untrusted_daemon: 0 }
  side_effects: [all fixtures unchanged, persistent writes confined to scenario state]
  cleanup: [SIGTERM, listener closed, original process group gone]
  started_at: '2026-07-26T14:55:50.840Z'
  finished_at: '2026-07-26T14:55:55.508Z'
record_relations: []
limitations:
  - /workspace/settings exposes user/workspace raw values but not generic System provenance.
  - Unique sentinels establish bounded provenance for this fixture only.
  - There is no Local layer in the selected loader taxonomy.
```

Direct observations：

- `System cleanup=40` 覆盖 Workspace `30`、User `20`、SystemDefaults `10`；
- trusted 时 Workspace threshold `30` 生效；
- untrusted 时 raw workspace threshold `30` 仍返回，但 effective 回到 User `20`；
- User recap `true` 覆盖 SystemDefaults `false`；
- `/workspace/trust` 和 `/capabilities` 同时反映 trusted/untrusted。

## 3. Qualification boundary

`CAP-12.09-A01` 的 value、source/unique provenance、selected precedence 和 trust gate
已有直接 runtime evidence，但 taxonomy 与 Surface 不同；完整三方 alignment 只能是
`Partial overlap`。`R1-1b` 已关闭 schema identity/version mechanism 缺口，但不修改
Phase 2C 的 consumer validation 关系。

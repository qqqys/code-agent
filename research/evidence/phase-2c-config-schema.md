# Phase 2C Config Schema：增量 Evidence Ledger

> 阶段：2C · R1-1 Config Schema Matrix  
> Captured boundary：2026-07-26T12:43:43.496Z  
> Raw artifact：[`config-schema-matrix.json`](../artifacts/phase-2c/config-schema-matrix.json)  
> Raw SHA-256：`37e6d06dd6ac34cf5dab1de179568f1d5495f669d77ebab365e76148f3dd36b8`

本文只增加 Phase 2C Evidence Record，不原地修改 Phase 1C Claim 或 Phase 2A/2B
Comparison Record。

## 1. Environment

| Env ID              | Products / surface                                               | Isolation                                                                                              | External effects                                        |
| ------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| `ENV-ccq-2C-R1-001` | Codex `0.145.0`、Claude Code `2.1.212`、Qwen Code `0.21.0` / CLI | Darwin arm64 non-TTY；deny-network Seatbelt；isolated roots；state-only writes；sanitized environment | no credential copied；no user/model turn；no model cost |

## 2. Runtime Records

### `EVD-codex-RUNTIME-008`

```yaml
evidence_id: EVD-codex-RUNTIME-008
evidence_type: RUNTIME
product: Codex
version: '0.145.0'
release_channel: latest
product_surface: cli
source_url_or_path: artifacts/phase-2c/config-schema-matrix.json
captured_at: '2026-07-26T12:43:43.496Z'
environment:
  platform: [Darwin arm64, non-TTY]
  authentication: [sanitized environment, no inherited or copied credentials]
  entitlement: [not-applicable]
  region: not-applicable
  provider: not-applicable; every config case terminates at a local config or empty-prompt gate
  model: not-applicable
  configuration: [isolated CODEX_HOME, one read-only config.toml per case, strict-config]
  feature_flags: [not-applicable]
artifact_hash_or_excerpt: sha256:37e6d06dd6ac34cf5dab1de179568f1d5495f669d77ebab365e76148f3dd36b8
runtime_probe:
  applicability: applicable
  preconditions:
    [
      exact identity preflight stdout codex-cli 0.145.0,
      frozen binary and tree identity matched before and after every execution,
      deny-network profile and state-only persistent writes,
    ]
  procedure:
    [
      valid known config with zero-byte stdin and EOF,
      known boolean field receiving a string,
      unknown top-level field under strict-config,
      MCP stdio command combined with HTTP-only url,
    ]
  stdout: exact raw stream in artifact; zero bytes for all four config cases
  stderr: exact raw stream in artifact; local prompt gate or full file/line/caret validation diagnostic
  exit_code: { valid: 1, type_error: 1, unknown: 1, cross_field_invalid: 1 }
  side_effects:
    [
      'created inventory entries: valid=19, type=7, unknown=7, cross=7',
      no changed or removed entries,
      config fixture mode and SHA-256 unchanged,
      every persistent delta under the execution state root,
    ]
  cleanup:
    [
      close observed and original process group verified gone,
      no timeout or truncated stream,
    ]
  started_at: '2026-07-26T12:43:35.542Z'
  finished_at: '2026-07-26T12:43:41.768Z'
record_relations: []
limitations:
  - Unknown-field rejection requires strict-config and does not describe non-strict startup.
  - Valid only proves acceptance to the empty-prompt gate; it does not prove downstream model use.
  - The four cases do not prove complete schema coverage or a schema version.
  - Cleanup and integrity retain the containment limitations in the Phase 2C method.
```

Observed diagnostic：

- type error 精确定位 `config.toml:1:31`、expected boolean 与 caret；
- unknown 精确定位 `config.toml:1:1` 和 `phase2c_unknown_key`；
- cross-field 精确定位 MCP table `1:1`，错误为
  `url is not supported for stdio`。

### `EVD-claude-code-RUNTIME-004`

```yaml
evidence_id: EVD-claude-code-RUNTIME-004
evidence_type: RUNTIME
product: Claude Code
version: '2.1.212'
release_channel: stable
product_surface: cli
source_url_or_path: artifacts/phase-2c/config-schema-matrix.json
captured_at: '2026-07-26T12:43:43.496Z'
environment:
  platform: [Darwin arm64, non-TTY]
  authentication: [sanitized environment, no inherited or copied credentials, bare mode]
  entitlement: [not-applicable]
  region: not-applicable
  provider: not-applicable; get_settings control request does not create a model turn
  model: not-applicable
  configuration:
    [
      isolated CLAUDE_CONFIG_DIR and CLAUDE_CODE_TMPDIR,
      explicit read-only --settings fixture,
      empty normal setting-sources selection,
    ]
  feature_flags: [not-applicable]
artifact_hash_or_excerpt: sha256:37e6d06dd6ac34cf5dab1de179568f1d5495f669d77ebab365e76148f3dd36b8
runtime_probe:
  applicability: applicable
  preconditions:
    [
      exact identity preflight stdout 2.1.212 (Claude Code),
      frozen binary and tree identity matched before and after every execution,
      one exact get_settings control request followed by EOF,
    ]
  procedure:
    [
      valid string model,
      model receiving a number,
      unknown top-level field,
      settings-sourced marketplace key/name mismatch,
    ]
  stdout: one exact control_response JSONL record per case; raw bytes and hashes in artifact
  stderr: zero bytes for all four cases
  exit_code: { valid: 0, type_error: 0, unknown: 0, cross_field_invalid: 0 }
  side_effects:
    [
      six created inventory entries per case,
      no changed or removed entries,
      config fixture mode and SHA-256 unchanged,
      every persistent delta under the execution state root,
    ]
  cleanup:
    [
      close observed and original process group verified gone,
      no timeout or truncated stream,
    ]
  started_at: '2026-07-26T12:43:36.088Z'
  finished_at: '2026-07-26T12:43:42.406Z'
record_relations: []
limitations:
  - Unknown passthrough is bound to the normal explicit flag loader, not every strict or policy path.
  - Invalid explicit sources are reported inside a successful control envelope with process exit 0.
  - Empty setting-sources does not itself disable managed policy; the harness read boundary isolates host policy files.
  - The frozen Claim set has no Claude 2.1.212 CAP-12.09-A02 Claim; this record remains comparison evidence.
```

Observed response：

- valid：`effective`、`sources[0]=flagSettings` 与 `applied.model` 都是 fixture
  marker；
- type error：source 整体不进入 `effective/sources`，error path=`model`；
- unknown：字段进入 `effective` 和 flag source，没有 error；
- cross-field：source 整体被拒，error path=
  `extraKnownMarketplaces.alpha.source.name`。

### `EVD-qwen-code-RUNTIME-005`

```yaml
evidence_id: EVD-qwen-code-RUNTIME-005
evidence_type: RUNTIME
product: Qwen Code
version: '0.21.0'
release_channel: stable
product_surface: cli
source_url_or_path: artifacts/phase-2c/config-schema-matrix.json
captured_at: '2026-07-26T12:43:43.496Z'
environment:
  platform: [Darwin arm64, non-TTY, Node 25.9.0]
  authentication: [sanitized environment, no inherited or copied credentials]
  entitlement: [not-applicable]
  region: not-applicable
  provider: not-applicable; list-extensions exits before provider selection
  model: not-applicable
  configuration:
    [
      isolated QWEN_HOME and runtime roots,
      one read-only user settings fixture,
      read-only versioned system/default and empty trust/approval fixtures,
    ]
  feature_flags: [preconnect, browser, update, telemetry, and compile cache disabled]
artifact_hash_or_excerpt: sha256:37e6d06dd6ac34cf5dab1de179568f1d5495f669d77ebab365e76148f3dd36b8
runtime_probe:
  applicability: applicable
  preconditions:
    [
      exact identity preflight stdout 0.21.0,
      frozen entry/bundle/tree/tarball/Node identity matched before and after every execution,
      user and four supporting config files registered as read-only fixtures,
    ]
  procedure:
    [
      valid boolean general.vimMode,
      general.vimMode receiving a string,
      unknown top-level field,
      command hook omitting the conditionally required command,
    ]
  stdout: exact "No extensions installed.\n" for all four cases
  stderr: zero bytes for all four cases
  exit_code: { valid: 0, type_error: 0, unknown: 0, cross_field_invalid: 0 }
  side_effects:
    [
      eight created extension-state inventory entries per case,
      no changed or removed entries,
      all five config fixture modes and SHA-256 values unchanged,
      every persistent delta under the execution state root,
    ]
  cleanup:
    [
      close observed and original process group verified gone,
      no timeout or truncated stream,
    ]
  started_at: '2026-07-26T12:43:36.734Z'
  finished_at: '2026-07-26T12:43:43.247Z'
record_relations: []
limitations:
  - Type and cross-field cases are bounded negatives for the selected startup/load route.
  - list-extensions does not initialize HookRegistry; later consumers may validate or discard invalid values.
  - Unknown proves normal command completion and on-disk preservation, not an effective-value explanation.
  - This record does not prove the absence of validation APIs or UI/daemon validation paths.
```

## 3. Implementation Anchors

### `EVD-codex-SOURCE-004`

```yaml
evidence_id: EVD-codex-SOURCE-004
evidence_type: SOURCE
product: Codex
version: rust-v0.145.0
release_channel: latest
product_surface: cli
source_url_or_path: https://github.com/openai/codex/blob/rust-v0.145.0/codex-rs/config/src/mcp_types.rs
captured_at: '2026-07-26T12:43:43.496Z'
environment:
  platform: [not-applicable]
  authentication: [not-applicable]
  entitlement: [not-applicable]
  region: not-applicable
  provider: not-applicable
  model: not-applicable
  configuration: [not-applicable]
  feature_flags: [not-applicable]
artifact_hash_or_excerpt: bounded anchor; RawMcpServerConfig conversion rejects url for stdio
runtime_probe:
  applicability: not-applicable
  preconditions: [not-applicable]
  procedure: [not-applicable]
  stdout: not-applicable
  stderr: not-applicable
  exit_code: not-applicable
  side_effects: [not-applicable]
  cleanup: [not-applicable]
  started_at: not-applicable
  finished_at: not-applicable
record_relations: []
limitations:
  - Runtime artifact, not this source anchor alone, proves the released binary behavior.
  - Generated config schema additionalProperties=false is a separate exact-tag anchor.
```

Exact-tag generated schema：
`https://github.com/openai/codex/blob/rust-v0.145.0/codex-rs/core/config.schema.json`。

### `EVD-claude-code-BINARY-002`

```yaml
evidence_id: EVD-claude-code-BINARY-002
evidence_type: BINARY
product: Claude Code
version: '2.1.212'
release_channel: stable
product_surface: cli
source_url_or_path: /private/tmp/ccq-phase1b-claude-2.1.212/package/claude
captured_at: '2026-07-26T12:43:43.496Z'
environment:
  platform: [Darwin arm64]
  authentication: [not-applicable]
  entitlement: [not-applicable]
  region: not-applicable
  provider: not-applicable
  model: not-applicable
  configuration: [not-applicable]
  feature_flags: [not-applicable]
artifact_hash_or_excerpt: sha256:09ecba2ab2df9b6ee5b0695e26f65dea60fb3b6af3d3542ee09f466838d1e574
runtime_probe:
  applicability: not-applicable
  preconditions: [not-applicable]
  procedure: [not-applicable]
  stdout: not-applicable
  stderr: not-applicable
  exit_code: not-applicable
  side_effects: [not-applicable]
  cleanup: [not-applicable]
  started_at: not-applicable
  finished_at: not-applicable
record_relations: []
limitations:
  - Minified schema symbols and message strings are corroborating implementation anchors only.
  - Runtime control responses remain the primary behavioral evidence.
```

Bounded anchors：normal settings schema ends in passthrough；`model` is a string；
settings-sourced marketplace name must equal its record key。

### `EVD-qwen-code-SOURCE-010`

```yaml
evidence_id: EVD-qwen-code-SOURCE-010
evidence_type: SOURCE
product: Qwen Code
version: '0.21.0'
release_channel: stable
product_surface: cli
source_url_or_path: /private/tmp/ccq-phase1b-qwen-0.21.0/package/chunks/chunk-TEHGS6UP.js; /private/tmp/ccq-phase1b-qwen-0.21.0/package/chunks/gemini-QS36EBZV.js; /private/tmp/ccq-phase1b-qwen-0.21.0/package/chunks/chunk-PHOF65IG.js
captured_at: '2026-07-26T12:43:43.496Z'
environment:
  platform: [not-applicable]
  authentication: [not-applicable]
  entitlement: [not-applicable]
  region: not-applicable
  provider: not-applicable
  model: not-applicable
  configuration: [not-applicable]
  feature_flags: [not-applicable]
artifact_hash_or_excerpt: frozen package tree sha256:a106a1332b3266bef53839a74fb10c7fb961bec59dd791adbe92cd502eae500e
runtime_probe:
  applicability: not-applicable
  preconditions: [not-applicable]
  procedure: [not-applicable]
  stdout: not-applicable
  stderr: not-applicable
  exit_code: not-applicable
  side_effects: [not-applicable]
  cleanup: [not-applicable]
  started_at: not-applicable
  finished_at: not-applicable
record_relations: []
limitations:
  - Internal settings metadata and leaf/API validation do not prove startup loader enforcement.
  - Runtime artifact is required for the bounded startup/load conclusion.
```

Bounded anchors：

- internal schema declares `general.vimMode` boolean and command-hook requirements；
- `validateSettingValue` can reject a string for a boolean, but generic `loadSettings`
  does not call it；
- `loadSettings` checks JSON object/version/migration and only debug-logs unknown top-level
  keys；
- `--list-extensions` returns after settings load, before provider/model；HookRegistry is
  not initialized。

## 4. Qualification Boundary

| Product     | Runtime statement qualified by this ledger                                                                                     | Not qualified                                                                  |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| Codex       | strict startup accepts valid and precisely rejects selected type/unknown/cross cases                                            | non-strict unknown behavior；complete schema                                   |
| Claude Code | explicit normal loader accepts valid/unknown and reports selected type/cross errors with paths                                 | every settings source/policy path；process exit as validation status           |
| Qwen Code   | selected startup loader completes without visible rejection for all four cases; all config inputs stay byte-identical on disk | every consumer accepts；no validation APIs；in-memory effective source/value    |

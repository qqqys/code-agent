# Phase 2B Aligned Runtime：增量 Evidence Ledger

> 阶段：2B · E0 Aligned Runtime Evidence  
> Captured boundary：2026-07-26T09:57:00.687Z  
> 调研平台：Darwin arm64 / non-TTY  
> Raw artifact：[`artifacts/phase-2b/safe-wave.json`](../artifacts/phase-2b/safe-wave.json)  
> Raw SHA-256：`bdbc65635d4e2ec454bd4bed03d5e29c82f97a6154f57dc28ebba00d167a5393`

本文只定义 Phase 2B 新增 Evidence Record。Phase 2A 的 frozen Claim、Comparison
Record 与 relation 不在本阶段原地修改。

## 1. Environment 与 Harness Boundary

| Env ID              | Products / surface                                               | Isolation                                                                                                           | Authentication / provider / model                                                                                    | Capture                                                                                                                               |
| ------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `ENV-ccq-2B-E0-001` | Codex `0.145.0`、Claude Code `2.1.212`、Qwen Code `0.21.0` / CLI | deny-default Seatbelt；direct network denied；独立只读 repo/fixture；`state/` only persistent writes；sanitized env | 不继承或复制 credential；Claude/Qwen 在本地 missing-auth gate；Codex remote transport 被 policy 阻断；无成功模型请求 | raw stdout/stderr bytes、exit/signal/timeout、stdin delivery、前后 inventory、每次 execution 前后 runtime hash、original PGID cleanup |

Harness identity：

| Object                  | SHA-256                                                            |
| ----------------------- | ------------------------------------------------------------------ |
| runner                  | `ec8dcafc7c1b0f1b6e47a1f8cd2601af08b2ce5728471f1a1d524cd36bb8d175` |
| Seatbelt profile        | `ff5f599cad03d5c257827314c5a483e3cffaa2fef2d7b70a433e376ad1c700e6` |
| `/usr/bin/sandbox-exec` | `8857d087219f0f39d3e3c163e5d0a0aed690cc22f34b50c7eee3d74f93e69688` |
| Node runtime manifest   | `88c1d0e37fa0c4d2cc8cf6e6cb92b468cbcd57adae71b44a7e3f276cbc8dd636` |
| OpenSSL runtime config  | `a65a2cb9f4ee8ffdc7ef4f0ac600c0bdafb95b7b1ab457188ac610a62f5ad6b3` |

三产品 exact `--version` preflight 均为 exit `0`、empty stderr、exact stdout。
23 个 execution 均满足：

- product/runtime/profile/system hash 在 execution 前后相同；
- materialized repo/fixture hash 与 mode 正确，结束后无 `state/` 外 delta；
- stdout/stderr 无截断，spawn error 为零；
- close event 可见，original process group 均确认消失；
- 无 17 秒 stream hard-stop；Codex argv/stdin 两例在 15 秒 execution timeout 后
  收到 `SIGTERM`。

这些门禁只证明直接 file/process/network containment 和 original PGID cleanup。
导入的 macOS system profile 仍保留平台 Mach/XPC allowance；另建 session/PGID 的
descendant 不在 liveness proof 内。pre/post hash 不能排除 execution 期间的
modify-and-restore；inventory 不是 syscall trace，也不覆盖 xattr、ACL、mtime 或
inode。Qwen 的第三方动态库读取边界是 18 个 pinned formula `lib` roots，而不是
23-file minimal dylib closure。

## 2. Evidence Index

| Evidence ID                   | Product                      | Scenario family                                         | Bounded observation                                                                                                                                   | Candidate Atomics                                         | Limitation                                                                     |
| ----------------------------- | ---------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `EVD-codex-RUNTIME-006`       | Codex `0.145.0/latest`       | invalid schema、empty EOF、argv/stdin no-auth           | malformed schema 与 empty input 在本地失败；非空 argv/stdin 创建 thread/turn 后尝试 WebSocket→HTTPS，禁网下重试并超时                                 | `CAP-10.01-A01`, `CAP-10.02-A01/A02`, `CAP-10.03-A02/A03` | 没有成功任务或 terminal event；network 结果由 containment 诱发                 |
| `EVD-claude-code-RUNTIME-002` | Claude Code `2.1.212/stable` | same                                                    | malformed schema/empty input 本地失败；argv/stdin 产生完整三行 JSONL，synthetic assistant 报 `authentication_failed`，final `is_error=true`，exit `1` | same headless candidates                                  | 无模型 turn；本 stable Slice 不回填 `CAP-10.05-A04` latest Claim               |
| `EVD-qwen-code-RUNTIME-003`   | Qwen Code `0.21.0/stable`    | same                                                    | malformed schema exit `52`；empty EOF、argv、stdin 均在 OpenAI-compatible missing-key gate 返回单一 JSON result，exit `1`                             | same；另 candidate `CAP-10.05-A04`                        | 只有 correlation；缺 category、stage 与 retryability，不能支持 A04             |
| `EVD-codex-RUNTIME-007`       | Codex `0.145.0/latest`       | doctor、malformed/unknown config                        | empty doctor 返回 18 项 JSON checks/remediation；malformed config 形成 `config.load` fail；strict unknown key 精确定位 file/line/field                | `CAP-12.05-A02`, `CAP-12.09-A02`                          | reachability/terminal failure包含受控环境影响；未覆盖 type/cross-field invalid |
| `EVD-claude-code-RUNTIME-003` | Claude Code `2.1.212/stable` | doctor、malformed/unknown explicit settings             | 三例均 exit `0`、stdout/stderr empty；均创建 isolated `.claude.json` 与 backup                                                                        | `CAP-12.05-A02` candidate only                            | 空输出不能证明诊断成功或不存在；Claude cohort 无 `CAP-12.09-A02` Claim         |
| `EVD-qwen-code-RUNTIME-004`   | Qwen Code `0.21.0/stable`    | malformed/unknown user settings via `--list-extensions` | malformed JSON 被备份、重置并迁移为 `$version:4`，stderr warning；unknown key 无可见 warning且原 user file 保留；两例 exit `0`                        | `CAP-12.09-A02`                                           | 不是 standalone doctor；只覆盖此 entry 和两个 fixture                          |

## 3. Headless Runtime Records

### `EVD-codex-RUNTIME-006`

```yaml
evidence_id: EVD-codex-RUNTIME-006
evidence_type: RUNTIME
product: Codex
version: '0.145.0'
release_channel: latest
product_surface: cli
source_url_or_path: artifacts/phase-2b/safe-wave.json
captured_at: '2026-07-26T09:57:00.687Z'
environment:
  platform: [Darwin 26.5.1 arm64, non-TTY]
  authentication: [sanitized environment, no inherited or copied credentials]
  entitlement: [not-applicable]
  region: not-applicable
  provider: OpenAI default; direct network denied
  model: not-applicable
  configuration:
    [
      isolated HOME and CODEX_HOME,
      ephemeral and ignore-user-config,
      read-only product sandbox,
    ]
  feature_flags: [not-applicable]
artifact_hash_or_excerpt: sha256:bdbc65635d4e2ec454bd4bed03d5e29c82f97a6154f57dc28ebba00d167a5393
runtime_probe:
  applicability: applicable
  preconditions:
    [
      exact identity preflight stdout codex-cli 0.145.0,
      frozen binary/tree and harness integrity matched before and after each execution,
      deny-network Seatbelt and state-only persistent writes,
    ]
  procedure:
    [
      P2B-E0-INVALID-SCHEMA with malformed schema and locked argv prompt,
      P2B-E0-EMPTY-EOF with zero bytes then EOF,
      P2B-E0-ARGV-NOAUTH with locked argv prompt and JSONL,
      P2B-E0-STDIN-NOAUTH with exact 67-byte stdin then EOF and JSONL,
    ]
  stdout: safe-wave.json results for product=codex and the four listed scenarios; exact base64, UTF-8, byte count, and SHA-256
  stderr: safe-wave.json results for product=codex and the four listed scenarios; exact base64, UTF-8, byte count, and SHA-256
  exit_code:
    invalid_schema: 1
    empty_eof: 1
    argv_noauth: timeout at 15000ms; no exit code; SIGTERM
    stdin_noauth: timeout at 15000ms; no exit code; SIGTERM
  side_effects:
    [
      'created inventory entries: invalid_schema=19, empty_eof=19, argv_noauth=105, stdin_noauth=105',
      no changed or removed entries,
      every persistent delta under the execution state root,
    ]
  cleanup:
    [
      close observed for all four executions,
      original process group verified gone for all four executions,
      no stream hard-stop and no output truncation,
    ]
  started_at: '2026-07-26T09:56:13.523Z'
  finished_at: '2026-07-26T09:56:52.312Z'
record_relations: []
limitations:
  - The two no-auth runs reached network transport retries and were terminated by the harness; they are not missing-auth or natural terminal results.
  - Invalid malformed JSON proves only the parser failure gate, not legal-schema success.
  - Child-stream acceptance of 67 bytes does not prove provider/model consumption.
  - No task or model-success outcome was observed.
  - Cleanup proves only the original PGID; a descendant can escape through a new session or process group.
  - Imported Mach/XPC allowances mean this is not complete host isolation.
  - Pre/post hashes cannot exclude transient modify-and-restore; inventory is not a syscall trace and omits xattr, ACL, mtime, and inode.
```

`thread.started` / `turn.started` 证明 Codex 进入本地 run lifecycle，但不证明模型已接受
prompt。WebSocket DNS failure、HTTPS fallback 与后续 retry 均发生在 deny-network
环境中，因此只能归为 transport/containment gate。

### `EVD-claude-code-RUNTIME-002`

```yaml
evidence_id: EVD-claude-code-RUNTIME-002
evidence_type: RUNTIME
product: Claude Code
version: '2.1.212'
release_channel: stable
product_surface: cli
source_url_or_path: artifacts/phase-2b/safe-wave.json
captured_at: '2026-07-26T09:57:00.687Z'
environment:
  platform: [Darwin 26.5.1 arm64, non-TTY]
  authentication: [sanitized environment, no inherited or copied credentials]
  entitlement: [not-applicable]
  region: not-applicable
  provider: not-applicable; local missing-auth gate before provider/model request
  model: not-applicable
  configuration:
    [
      isolated HOME and CLAUDE_CONFIG_DIR,
      bare mode,
      no session persistence,
      tools disabled and permission mode plan,
    ]
  feature_flags: [not-applicable]
artifact_hash_or_excerpt: sha256:bdbc65635d4e2ec454bd4bed03d5e29c82f97a6154f57dc28ebba00d167a5393
runtime_probe:
  applicability: applicable
  preconditions:
    [
      exact identity preflight stdout 2.1.212 (Claude Code),
      frozen binary/tree and harness integrity matched before and after each execution,
      deny-network Seatbelt and state-only persistent writes,
    ]
  procedure:
    [
      P2B-E0-INVALID-SCHEMA with malformed schema and locked argv prompt,
      P2B-E0-EMPTY-EOF with zero bytes then EOF,
      P2B-E0-ARGV-NOAUTH with locked argv prompt and stream-json verbose,
      P2B-E0-STDIN-NOAUTH with exact 67-byte stdin then EOF and stream-json verbose,
    ]
  stdout: safe-wave.json results for product=claude and the four listed scenarios; exact base64, UTF-8, byte count, and SHA-256
  stderr: safe-wave.json results for product=claude and the four listed scenarios; exact base64, UTF-8, byte count, and SHA-256
  exit_code:
    invalid_schema: 1
    empty_eof: 1
    argv_noauth: 1
    stdin_noauth: 1
  side_effects:
    [
      'created inventory entries: invalid_schema=4, empty_eof=6, argv_noauth=6, stdin_noauth=6',
      no changed or removed entries,
      every persistent delta under the execution state root,
    ]
  cleanup:
    [
      close observed for all four executions,
      original process group verified gone for all four executions,
      'no timeout, no stream hard-stop, and no output truncation',
    ]
  started_at: '2026-07-26T09:56:14.090Z'
  finished_at: '2026-07-26T09:56:53.115Z'
record_relations: []
limitations:
  - The three-record no-auth JSONL is a synthetic authentication failure with zero token usage, not a model turn.
  - subtype=success cannot be interpreted alone because is_error=true and terminal_reason=api_error.
  - Invalid malformed JSON proves only the parser failure gate, not legal-schema success.
  - Child-stream acceptance of 67 bytes does not prove provider/model consumption.
  - This 2.1.212/stable record cannot support the CAP-10.05-A04 Claim bound to 2.1.220/latest.
  - Cleanup proves only the original PGID; imported Mach/XPC allowances are not complete host isolation.
  - Pre/post hashes and persistent inventory have the same modify-and-restore and metadata limitations recorded in ENV-ccq-2B-E0-001.
```

三行依次为 `system/init`、synthetic `assistant` 与 `result`。assistant event 含
`error=authentication_failed`；result 同时出现 `subtype=success` 与
`is_error=true`，所以不能仅按 subtype 把它解释为成功。

### `EVD-qwen-code-RUNTIME-003`

```yaml
evidence_id: EVD-qwen-code-RUNTIME-003
evidence_type: RUNTIME
product: Qwen Code
version: '0.21.0'
release_channel: stable
product_surface: cli
source_url_or_path: artifacts/phase-2b/safe-wave.json
captured_at: '2026-07-26T09:57:00.687Z'
environment:
  platform: [Darwin 26.5.1 arm64, non-TTY]
  authentication: [OpenAI-compatible selected, no inherited or copied API key]
  entitlement: [not-applicable]
  region: not-applicable
  provider: OpenAI-compatible via --auth-type openai
  model: not-applicable
  configuration:
    [
      isolated HOME and QWEN_HOME,
      safe mode,
      approval mode plan,
      max tool calls 0 and max session turns 1,
    ]
  feature_flags:
    [safe mode disables hooks/extensions/skills/MCP servers/QWEN.md]
artifact_hash_or_excerpt: sha256:bdbc65635d4e2ec454bd4bed03d5e29c82f97a6154f57dc28ebba00d167a5393
runtime_probe:
  applicability: applicable
  preconditions:
    [
      exact identity preflight stdout 0.21.0,
      frozen entry/bundle/tree/Node runtime integrity matched before and after each execution,
      deny-network Seatbelt and state-only persistent writes,
    ]
  procedure:
    [
      P2B-E0-INVALID-SCHEMA with malformed schema and locked argv prompt,
      P2B-E0-EMPTY-EOF with zero bytes then EOF,
      P2B-E0-ARGV-NOAUTH with locked argv prompt and stream-json,
      P2B-E0-STDIN-NOAUTH with exact 67-byte stdin then EOF and stream-json,
    ]
  stdout: safe-wave.json results for product=qwen and the four listed scenarios; exact base64, UTF-8, byte count, and SHA-256
  stderr: safe-wave.json results for product=qwen and the four listed scenarios; exact base64, UTF-8, byte count, and SHA-256
  exit_code:
    invalid_schema: 52
    empty_eof: 1
    argv_noauth: 1
    stdin_noauth: 1
  side_effects:
    [
      'created inventory entries: invalid_schema=1, empty_eof=1, argv_noauth=1, stdin_noauth=1',
      'changed inventory entries: 2 per execution; no removed entries',
      every persistent delta under the execution state root,
    ]
  cleanup:
    [
      close observed for all four executions,
      original process group verified gone for all four executions,
      'no timeout, no stream hard-stop, and no output truncation',
    ]
  started_at: '2026-07-26T09:56:14.794Z'
  finished_at: '2026-07-26T09:56:54.365Z'
record_relations: []
limitations:
  - Empty EOF reached the missing-key gate first and does not prove Qwen interpreted an empty task.
  - Each missing-key run emitted one terminal JSON document; no incremental event lifecycle was observed.
  - Only session_id closes run correlation; error.message is free text and category, stage, and retryability are absent.
  - Invalid schema has empty stdout and therefore does not express a machine-readable A04 error.
  - Child-stream acceptance of 67 bytes does not prove provider/model consumption.
  - No task or model-success outcome was observed.
  - Cleanup proves only the original PGID; imported Mach/XPC allowances are not complete host isolation.
  - The 18 formula lib roots are bounded and hashed but broader than the 23 reachable third-party dylib files.
  - Pre/post hashes and persistent inventory have the same modify-and-restore and metadata limitations recorded in ENV-ccq-2B-E0-001.
```

在 empty EOF、argv 与 stdin 三个 missing-key 场景中，Qwen stdout 保持为单个可解析
JSON document，missing-key machine error 位于其中；stderr 只承载 safe-mode notice
与 `rg` containment fallback。结果具备 run/session correlation，但 `error` 只有
message，没有 category、stage 或 retryability；因此不满足 Registry
`CAP-10.05-A04` 的最小 error taxonomy。

## 4. Diagnostics 与 Config Records

### `EVD-codex-RUNTIME-007`

```yaml
evidence_id: EVD-codex-RUNTIME-007
evidence_type: RUNTIME
product: Codex
version: '0.145.0'
release_channel: latest
product_surface: cli
source_url_or_path: artifacts/phase-2b/safe-wave.json
captured_at: '2026-07-26T09:57:00.687Z'
environment:
  platform: [Darwin 26.5.1 arm64, non-TTY]
  authentication: [sanitized environment, no inherited or copied credentials]
  entitlement: [not-applicable]
  region: not-applicable
  provider: ChatGPT auth reachability in doctor; strict-config exits before provider selection
  model: not-applicable
  configuration:
    [
      isolated HOME and CODEX_HOME,
      empty or controlled config.toml,
      strict-config enabled only for unknown-key startup,
    ]
  feature_flags: [default set reported by doctor; no probe override]
artifact_hash_or_excerpt: sha256:bdbc65635d4e2ec454bd4bed03d5e29c82f97a6154f57dc28ebba00d167a5393
runtime_probe:
  applicability: applicable
  preconditions:
    [
      exact identity preflight stdout codex-cli 0.145.0,
      frozen binary/tree and harness integrity matched before and after each execution,
      deny-network Seatbelt and state-only persistent writes,
    ]
  procedure:
    [
      P2B-E0-DOCTOR-EMPTY with doctor --json,
      P2B-E0-CONFIG-MALFORMED with malformed config.toml and doctor --json,
      P2B-E0-CONFIG-UNKNOWN with unknown top-level key and strict-config exec,
    ]
  stdout: safe-wave.json results for product=codex and the three listed scenarios; exact base64, UTF-8, byte count, and SHA-256
  stderr: safe-wave.json results for product=codex and the three listed scenarios; exact base64, UTF-8, byte count, and SHA-256
  exit_code:
    doctor_empty: 1
    config_malformed: 1
    config_unknown: 1
  side_effects:
    [
      'created inventory entries: 7 per execution',
      no changed or removed entries,
      every persistent delta under the execution state root,
    ]
  cleanup:
    [
      close observed and original process group verified gone for all three executions,
      'no timeout, no stream hard-stop, and no output truncation',
    ]
  started_at: '2026-07-26T09:56:54.877Z'
  finished_at: '2026-07-26T09:56:58.192Z'
record_relations: []
limitations:
  - Provider reachability and TERM=dumb failures are induced by the controlled deny-network/non-TTY environment.
  - Malformed doctor reports a generic config.load failure and does not expose the parser line.
  - Unknown-key rejection uses strict-config and is not directly symmetric with the other product entries.
  - Type-invalid and cross-field-invalid fixtures were not run.
  - Cleanup proves only the original PGID; imported Mach/XPC allowances are not complete host isolation.
  - Pre/post hashes and persistent inventory have the same modify-and-restore and metadata limitations recorded in ENV-ccq-2B-E0-001.
```

Empty doctor 返回 `schemaVersion=1`、`overallStatus=fail` 和 18 个 check：
13 `ok`、3 `fail`、2 `warning`。checks 覆盖 app-server、auth、config、git、
installation、MCP、network、runtime provenance/search、sandbox、state、system、
terminal 与 updates；失败项带 details 或 remediation。

Malformed `config.toml` 下 doctor 仍返回 JSON，但只把配置问题收敛为
`config.load: fail`、note `failed to load Codex config` 和修复建议。Unknown key
通过 `--strict-config exec` 在业务启动前 exit `1`，stderr 精确给出
`config.toml:1:1` 与 `phase2b_unknown_key`。

### `EVD-claude-code-RUNTIME-003`

```yaml
evidence_id: EVD-claude-code-RUNTIME-003
evidence_type: RUNTIME
product: Claude Code
version: '2.1.212'
release_channel: stable
product_surface: cli
source_url_or_path: artifacts/phase-2b/safe-wave.json
captured_at: '2026-07-26T09:57:00.687Z'
environment:
  platform: [Darwin 26.5.1 arm64, non-TTY]
  authentication: [sanitized environment, no inherited or copied credentials]
  entitlement: [not-applicable]
  region: not-applicable
  provider: not-applicable; no provider/model selection or request observed
  model: not-applicable
  configuration:
    [
      isolated HOME and CLAUDE_CONFIG_DIR,
      bare doctor,
      controlled explicit settings files for malformed and unknown cases,
    ]
  feature_flags: [not-applicable]
artifact_hash_or_excerpt: sha256:bdbc65635d4e2ec454bd4bed03d5e29c82f97a6154f57dc28ebba00d167a5393
runtime_probe:
  applicability: applicable
  preconditions:
    [
      exact identity preflight stdout 2.1.212 (Claude Code),
      frozen binary/tree and harness integrity matched before and after each execution,
      deny-network Seatbelt and state-only persistent writes,
    ]
  procedure:
    [
      P2B-E0-DOCTOR-EMPTY with --bare doctor,
      P2B-E0-CONFIG-MALFORMED with malformed explicit --settings,
      P2B-E0-CONFIG-UNKNOWN with unknown-key explicit --settings,
    ]
  stdout: safe-wave.json results for product=claude and the three listed scenarios; zero bytes in every execution
  stderr: safe-wave.json results for product=claude and the three listed scenarios; zero bytes in every execution
  exit_code:
    doctor_empty: 0
    config_malformed: 0
    config_unknown: 0
  side_effects:
    [
      'created inventory entries: 4 per execution',
      each execution created isolated .claude.json and timestamped backup,
      no changed or removed entries,
      every persistent delta under the execution state root,
    ]
  cleanup:
    [
      close observed and original process group verified gone for all three executions,
      'no timeout, no stream hard-stop, and no output truncation',
    ]
  started_at: '2026-07-26T09:56:55.405Z'
  finished_at: '2026-07-26T09:56:58.830Z'
record_relations: []
limitations:
  - Exit 0 and empty output do not prove that checks passed, that settings were accepted, or that Claude Code lacks diagnostics.
  - State-file creation proves startup side effects only.
  - This cohort has no CAP-12.09-A02 Claim, so the explicit-settings observations are not projected to that Atomic.
  - Cleanup proves only the original PGID; imported Mach/XPC allowances are not complete host isolation.
  - Pre/post hashes and persistent inventory have the same modify-and-restore and metadata limitations recorded in ENV-ccq-2B-E0-001.
```

Empty、malformed explicit settings 与 unknown explicit settings 三例均 exit `0`，
stdout/stderr 为零 bytes。三例都在 isolated config root 创建 `.claude.json` 与一份
backup。该结果只能陈述“此 doctor route 没有可见诊断”，不能解释为环境健康、配置
有效或 Claude Code 没有诊断能力。

### `EVD-qwen-code-RUNTIME-004`

```yaml
evidence_id: EVD-qwen-code-RUNTIME-004
evidence_type: RUNTIME
product: Qwen Code
version: '0.21.0'
release_channel: stable
product_surface: cli
source_url_or_path: artifacts/phase-2b/safe-wave.json
captured_at: '2026-07-26T09:57:00.687Z'
environment:
  platform: [Darwin 26.5.1 arm64, non-TTY]
  authentication:
    [no inherited or copied credentials; command exits before auth/model]
  entitlement: [not-applicable]
  region: not-applicable
  provider: not-applicable; command exits before provider selection
  model: not-applicable
  configuration:
    [
      isolated HOME and QWEN_HOME,
      controlled user/system/default settings paths,
      list-extensions local exit route,
    ]
  feature_flags: [not-applicable]
artifact_hash_or_excerpt: sha256:bdbc65635d4e2ec454bd4bed03d5e29c82f97a6154f57dc28ebba00d167a5393
runtime_probe:
  applicability: applicable
  preconditions:
    [
      exact identity preflight stdout 0.21.0,
      frozen entry/bundle/tree/Node runtime integrity matched before and after each execution,
      deny-network Seatbelt and state-only persistent writes,
    ]
  procedure:
    [
      P2B-E0-CONFIG-MALFORMED with user settings bytes left-brace plus newline then --list-extensions,
      P2B-E0-CONFIG-UNKNOWN with versioned unknown user key then --list-extensions,
    ]
  stdout: safe-wave.json results for product=qwen and the two listed scenarios; exact No extensions installed newline
  stderr: safe-wave.json results; malformed has exact reset/backup warning and unknown is zero bytes
  exit_code:
    config_malformed: 0
    config_unknown: 0
  side_effects:
    [
      'malformed created=9, changed=3, removed=0',
      'unknown created=8, changed=2, removed=0',
      malformed user bytes preserved in settings.json.corrupted,
      unknown user settings file preserved byte-for-byte,
      every persistent delta under the execution state root,
    ]
  cleanup:
    [
      close observed and original process group verified gone for both executions,
      'no timeout, no stream hard-stop, and no output truncation',
    ]
  started_at: '2026-07-26T09:56:57.193Z'
  finished_at: '2026-07-26T09:56:59.809Z'
record_relations: []
limitations:
  - list-extensions is not a standalone doctor and cannot establish diagnostic command parity.
  - Unknown-key preservation and no visible warning are bounded to this user scope, entry, fixture, and version.
  - Debug logs, other scopes, type-invalid, cross-field-invalid, and schema-version errors were not tested.
  - Settings migration is an observed side effect, not proof of validation or repair parity.
  - Cleanup proves only the original PGID; imported Mach/XPC allowances are not complete host isolation.
  - The 18 formula lib roots are bounded and hashed but broader than the 23 reachable third-party dylib files.
  - Pre/post hashes and persistent inventory have the same modify-and-restore and metadata limitations recorded in ENV-ccq-2B-E0-001.
```

Malformed user settings：

- stderr 明示 invalid JSON 被 reset；
- 原始 `{\n` 保存为 `settings.json.corrupted`；
- user、system settings 与 system defaults 写为格式化的 `{"$version":4}`；
- `--list-extensions` stdout 为 `No extensions installed.`，exit `0`。

Unknown-key settings：

- user file `{"$version":4,"phase2bUnknownKey":true}\n` 未改变；
- stdout 同为 `No extensions installed.`，stderr empty，exit `0`；
- system settings/defaults 仍发生独立的 `$version:4` migration。

这是针对 `--list-extensions` startup route 的 bounded negative：没有可见
unknown-key rejection/warning；不能外推所有 Qwen config consumer。

## 5. Qualification Boundary

| Candidate           | Phase 2B actually closes                                                                               | Still open                                                                     |
| ------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `CAP-10.01-A01`     | non-TTY entry 与三种失败 gate                                                                          | 成功单任务与声明格式 final                                                     |
| `CAP-10.02-A01/A02` | argv/stdin child-stream delivery、empty EOF 与 auth/transport gate                                     | provider/model consumption、encoding matrix、成功 result                       |
| `CAP-10.03-A02`     | Claude complete 三行 JSONL lifecycle；Qwen 只有单一 terminal JSON document；Codex partial retry events | Qwen incremental stream、三产品成功 event lifecycle、统一 terminal event、中断 |
| `CAP-10.03-A03`     | malformed JSON schema parser rejection                                                                 | legal schema success、unsatisfiable legal schema                               |
| `CAP-10.05-A04`     | Qwen error result 只有 correlation；message 是 free text                                               | category、stage、retryability；因此不形成 support                              |
| `CAP-12.05-A02`     | Codex itemized doctor；Claude empty route observation                                                  | aligned missing-dependency fixture；Qwen 对等 route                            |
| `CAP-12.09-A02`     | Codex malformed/unknown；Qwen malformed recovery/unknown-key bounded negative                          | valid/type/cross-field-invalid、同 strictness gate、schema version             |

所有 `record_relations` 仍为空；本 Ledger 不生成新的 `Supported` Claim 或
`runtime-comparable` relation。

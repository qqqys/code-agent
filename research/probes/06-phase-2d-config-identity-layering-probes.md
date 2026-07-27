# Phase 2D：Config Identity 与 Layering Probe Matrix

> 状态：Executed / Frozen  
> Frozen at：2026-07-26T14:55:55.508Z  
> Atomic：`CAP-12.09-A01`、`CAP-12.09-A02`  
> Raw artifact：[`config-identity-layering.json`](../artifacts/phase-2d/config-identity-layering.json)  
> Raw SHA-256：`dc74e8fd2a4caa06cac8481743bb6e1fdb76c403b21229673fce1ef29f3b3187`

## 1. Scenario catalog

| Probe ID | Product | Observation |
| --- | --- | --- |
| `P2D-R1-1B-QWEN-SCHEMA-IDENTITY` | Qwen | exact bundle runtime export 的 `SETTINGS_VERSION` 与 key |
| `P2D-R1-2-CODEX-TRUSTED` | Codex | trusted user + root/nested project layers |
| `P2D-R1-2-CODEX-UNTRUSTED` | Codex | untrusted project suppression 与 `disabledReason` |
| `P2D-R1-2-CODEX-SESSION` | Codex | `sessionFlags > nested project > root project > user` |
| `P2D-R1-2-CLAUDE-ALL-LAYERS` | Claude | `local > project > user` 与 non-empty source projection |
| `P2D-R1-2-CLAUDE-PROJECT-USER` | Claude | empty local source 不列出；`project > user` |
| `P2D-R1-2-QWEN-TRUSTED` | Qwen | `System > trusted Workspace > User > SystemDefaults` 的 selected scalar |
| `P2D-R1-2-QWEN-UNTRUSTED` | Qwen | raw workspace 仍返回，但 effective merge 排除 workspace |

共 `8` 个 runtime execution。

Codex/Claude 的 schema identity 由 exact-tag/commit 的官方静态 artifact 与已冻结
runtime reader 共同界定；不为拿到一个不存在的数值 version 重启产品。

## 2. Fixed entries

```text
Codex:
  codex [-c model="codex-session"] app-server --listen stdio://
  initialize(capabilities.experimentalApi=true)
  initialized
  config/read(cwd=<repo>/sub/deep, includeLayers=true)

Claude Code:
  claude --bare --setting-sources user,project,local
  --print --input-format stream-json --output-format stream-json
  --verbose --tools "" --no-session-persistence
  stdin = one get_settings control request + EOF

Qwen Code:
  node <frozen cli-entry> serve --hostname 127.0.0.1 --port 0
  --workspace <repo> --require-auth --no-web
  --max-sessions 1 --max-connections 8
  GET /health?deep=1, /workspace/settings, /workspace/trust, /capabilities
```

Claude 初次 attempt 没有 `--bare`，exact binary 在 reader 前尝试执行 macOS
`security`，被 Seatbelt 拒绝。该 attempt 不作为行为证据；最终入口增加 `--bare` 后
仍完整返回 user/project/local sources，同时不触达 Keychain。

## 3. Execution gates

- exact binary/tree/chunk/Node/protocol-schema/profile hash 全部匹配；
- allowlist environment，不继承 credential、proxy 或 endpoint；
- Codex/Claude deny network；Qwen 仅允许 loopback；
- fixture 为 `0444` 且执行前后 mode、size、SHA-256 不变；
- stdout/stderr 不截断；one-shot 无 timeout/signal/spawn error；
- daemon listener 在 SIGTERM 后关闭；所有 original process group 消失；
- provider/model call、credential read、model cost 都为 `0`；
- raw artifact 的 product-specific outcome assertion 全部通过。

## 4. Harness identity

| Object | SHA-256 |
| --- | --- |
| Runner | `4ebe1e0582a73fc47e1292b89b5337512a586a1f91b601f0766df36a48474cd7` |
| CLI deny-network profile | `ff5f599cad03d5c257827314c5a483e3cffaa2fef2d7b70a433e376ad1c700e6` |
| Qwen loopback-only profile | `995857032aad38d2cea9876a4cbe70c7e29cde577539b9052af30c21d6ff8219` |
| Raw artifact | `dc74e8fd2a4caa06cac8481743bb6e1fdb76c403b21229673fce1ef29f3b3187` |

Final run root：`/private/tmp/ccq-phase2d-r1-pbqAjB`。它用于本机复核；portable
evidence 是 raw artifact、runner、profiles、文档与 validator。

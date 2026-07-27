# Phase 2E：Diagnostic Fault Probe Matrix

> 状态：Executed / Frozen  
> Frozen at：2026-07-26T15:14:28.190Z  
> Atomic：`CAP-12.05-A02`  
> Raw artifact：[`diagnostic-fault-matrix.json`](../artifacts/phase-2e/diagnostic-fault-matrix.json)  
> Raw SHA-256：`12d72a25792809ddfacff558bf74e9bd24277745d5af3933c3d4c7790d056915`

## Scenario catalog

| Probe ID | Product | Result |
| --- | --- | --- |
| `P2E-CODEX-BASELINE` | Codex | Observed；18-check JSON baseline |
| `P2E-CODEX-MISSING-EXECUTABLE` | Codex | Not assessed；无受控 Git 对照 |
| `P2E-CODEX-BAD-CA` | Codex | Observed；明确 PEM/custom-CA error |
| `P2E-CODEX-CORRUPT-CACHE` | Codex | Observed；明确 version-cache parse error |
| `P2E-QWEN-BASELINE` | Qwen | Observed；full daemon status baseline |
| `P2E-QWEN-MISSING-EXECUTABLE` | Qwen | Observed；Git/npm PATH hints |
| `P2E-QWEN-UNWRITABLE-LOG` | Qwen | Observed；stderr-only degraded contract |

## Fixed entries

```text
Codex:
  codex doctor --json

Qwen:
  node <frozen cli-entry> serve --hostname 127.0.0.1 --port 0
  --workspace <repo> --require-auth --no-web
  --max-sessions 1 --max-connections 8
  GET /health?deep=1
  GET /daemon/status?detail=full
```

Claude 不执行；原因与停止线见
[`26-phase-2e-diagnostic-fault-method.md`](../26-phase-2e-diagnostic-fault-method.md)。

## Fault fixtures

- real repo marker：`.git/HEAD`；
- missing executable：existing empty directory 作为完整 `PATH`；
- bad CA：固定非 PEM bytes、mode `0444`；
- corrupt cache：`CODEX_HOME/version.json` 内容为 `{`、mode `0444`；
- unwritable log：预建 `$QWEN_RUNTIME_DIR/debug`、mode `0555`，不预建 `daemon/`。

## Harness identity

| Object | SHA-256 |
| --- | --- |
| Runner | `cdbd9e7cea755095e98903d721f9740026fc90058cc3e6f7d98d544eb7adbf97` |
| CLI deny-network profile | `ff5f599cad03d5c257827314c5a483e3cffaa2fef2d7b70a433e376ad1c700e6` |
| Qwen loopback-only profile | `995857032aad38d2cea9876a4cbe70c7e29cde577539b9052af30c21d6ff8219` |
| Raw artifact | `12d72a25792809ddfacff558bf74e9bd24277745d5af3933c3d4c7790d056915` |

Final run root：`/private/tmp/ccq-phase2e-r1-E4Xvn1`。portable evidence 是
artifact、runner、profiles、文档和 validator。

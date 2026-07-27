# Phase 2C R1-1 Config Schema Probe Matrix

> 状态：Executed / Frozen  
> Frozen at：2026-07-26T12:43:43.496Z  
> Raw artifact：[`config-schema-matrix.json`](../artifacts/phase-2c/config-schema-matrix.json)  
> Raw SHA-256：`37e6d06dd6ac34cf5dab1de179568f1d5495f669d77ebab365e76148f3dd36b8`  
> Cohort：Codex `0.145.0`、Claude Code `2.1.212`、Qwen Code `0.21.0`

## 1. Scenario Catalog

| Probe ID                                      | Category            | Products | Risk | Expected observation                                                                           |
| --------------------------------------------- | ------------------- | -------- | ---- | ---------------------------------------------------------------------------------------------- |
| `P2C-R1-1-IDENTITY`                           | identity            | 3        | R0   | exact frozen versions                                                                          |
| `P2C-R1-1-CONFIG-VALID`                       | valid               | 3        | R1   | known field accepted to a local no-model gate                                                   |
| `P2C-R1-1-CONFIG-TYPE-ERROR`                  | type error          | 3        | R1   | reject with field/type, or directly observe selected loader's bounded non-rejection             |
| `P2C-R1-1-CONFIG-UNKNOWN`                     | unknown field       | 3        | R1   | strict reject, passthrough, or on-disk preservation                                              |
| `P2C-R1-1-CONFIG-CROSS-FIELD-INVALID`         | invalid combination | 3        | R1   | reject with object/path, or directly observe selected loader's bounded non-rejection             |

共 `5` 个 scenario、`15` 个 product execution。

## 2. Fixed Entries

```text
Codex:
  --strict-config exec --skip-git-repo-check --ephemeral
  --sandbox read-only --color never --json -
  stdin = 0 bytes + EOF

Claude Code:
  --bare --settings <fixture> --setting-sources ""
  --print --input-format stream-json --output-format stream-json --verbose
  --permission-mode plan --tools "" --no-session-persistence
  stdin = one get_settings control request + EOF

Qwen Code:
  --list-extensions
  stdin = not provided
```

## 3. Execution Gates

每个 execution 必须满足：

- exact binary/tree/runtime/profile hash 在执行前后匹配；
- sanitized allowlist environment，不含 credential/proxy/endpoint；
- network denied；只允许本 execution `state/` 写入；
- primary config fixture 为 `0444` 且执行前后 SHA-256 不变；
- Qwen 四个 supporting config 也为 `0444` 且不变；
- stdout/stderr 无截断，spawn 成功，close/exit event 可见；
- 15 秒 timeout 内结束，original process group 已确认消失；
- repo 与所有只读 fixture 无 persistent delta；
- runner 的 product-specific exact outcome assertion 通过。

## 4. Result Summary

| Metric                                                  | Result  |
| ------------------------------------------------------- | ------- |
| Identity                                                | `3/3`   |
| Config executions                                       | `12/12` |
| Integrity / fixture / side-effect / PGID cleanup        | `15/15` |
| Timeout / signal / truncated stream / spawn error       | `0`     |
| Network allowed / inherited credential / model turn     | `0`     |
| Product source file changed                             | `0`     |

Raw result interpretation lives in
[`phase-2c-config-schema-runtime.md`](../comparisons/phase-2c-config-schema-runtime.md);
this file defines only the executed matrix and gates.

本 matrix 未记录三产品可比较的 schema identity/version；因此 execution 已冻结，
但 `CAP-12.09-A02` 与 Phase 2B `R1-1` 的完整契约仍以 `R1-1b` 保持 Deferred。

# Phase 2E：Diagnostic Fault Matrix 结果

> 状态：Frozen  
> Frozen at：2026-07-26T15:14:28.190Z  
> Raw artifact SHA-256：`12d72a25792809ddfacff558bf74e9bd24277745d5af3933c3d4c7790d056915`

## 1. Result summary

| Metric | Result |
| --- | --- |
| Runtime executions | `7/7 Pass` |
| Observed cells | `6`，其中 baseline `2`、fault `4` |
| Not assessed runtime cells | `1`：Codex missing Git |
| Claude runtime cells | `0`：credential boundary |
| Timeout / signal / truncated output / spawn error | `0` |
| Fixture drift | `0` |
| Credential reads / provider-model calls / model cost | `0 / 0 / 0` |
| Product source files modified | `0` |

## 2. 可归因结果

### Codex

| Fault | Observation |
| --- | --- |
| invalid custom CA | `network.env` 确认 fixture 是 readable file；WebSocket check 明确报告由 `CODEX_CA_CERTIFICATE` 选择的文件不含 PEM certificate block |
| corrupt version cache | `updates.status.details["version cache parse"]` 为 `EOF while parsing an object at line 1 column 1` |

`version.json` 在执行后仍为 mode `0444`、`1` byte、相同 SHA-256；本 fixture 中未被修写。

### Qwen

| Fault | Observation |
| --- | --- |
| empty `PATH` | Git 与 npm 均返回 `warning` + `<tool> not found on PATH.`，无 `error`/`errorKind` |
| unwritable daemon log | stderr 明确报告 `EACCES`；status 为 `logMode=stderr-only`、`logHealth=degraded`、`logIssues=["init_failed"]`，顶层包含 `daemon_log_degraded` |

不可写日志场景仍成功启动 loopback daemon 并返回 full status，随后 `SIGTERM` 正常退出；
这证明的是可观察降级，不是文件日志可恢复或自动修复。

## 3. 保守未评估

Codex empty-PATH cell 返回：

- repo detected = `true`；
- selected Git = `not found`；
- remediation 指向安装 Git 或修复 PATH。

但 normal-PATH baseline 在同一 deny-default profile 下也看不到 Git，因为 profile 只
允许执行 Codex。没有受控 Git 正向对照，就不能把该结果归因给 empty `PATH`，因此
保留 `Not assessed`。

## 4. 不可同构单元格

| Product / fault | State | Reason |
| --- | --- | --- |
| Claude：全部四类 | Not assessed | non-TTY `--bare doctor` 无诊断 payload；interactive doctor 可能触碰 Keychain |
| Codex：unwritable state | Not assessed | selected doctor checks 面向 inspectability，没有选定可比较的 write contract |
| Qwen：bad CA | Not assessed | daemon status 盘点环境存在性，不验证 CA trust |
| Qwen：corrupt cache | Not assessed | 未定位 selected status entry 消费的 cache path |

因此 `CAP-12.05-A02` 的三方 relation 继续为 `Not assessed`；不能从局部 fault
observation 投影出“某产品 doctor 更强”的排序。

## 5. 对 Qwen 的直接输入

本轮确认 Qwen 已有两项可用的 machine-facing 行为：

1. preflight 能区分 Git/npm 的 PATH 缺失，并给出明确 hint；
2. daemon file logging 失败时，公开稳定的降级 mode、health 与 issue code。

同时发现一个证据质量风险：在 normal PATH + deny-exec containment 下，
`spawn EPERM` 被映射为 `errorKind=missing_file`。仅看 `errorKind` 会混淆
“不存在”和“无执行权限”。是否细化 taxonomy 进入 Stage 4 判断，不在本轮直接定为
缺陷或实现任务。

复核命令：

```bash
node .qwen/research/codex-claude-qwen/scripts/validate-phase-2e.mjs
```

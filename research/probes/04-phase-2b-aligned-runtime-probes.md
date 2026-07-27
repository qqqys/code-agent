# Phase 2B E0 Aligned Runtime Probe Matrix

> 状态：Executed / Frozen  
> Frozen at：2026-07-26T09:57:00.687Z  
> Raw artifact：[`safe-wave.json`](../artifacts/phase-2b/safe-wave.json)  
> Raw SHA-256：`bdbc65635d4e2ec454bd4bed03d5e29c82f97a6154f57dc28ebba00d167a5393`  
> Cohort：Codex `0.145.0`、Claude Code `2.1.212`、Qwen Code `0.21.0`  
> 平台：Darwin arm64 / non-TTY  
> 方法：[`17-phase-2b-aligned-runtime-method.md`](../17-phase-2b-aligned-runtime-method.md)

## 1. Common Product Baselines

```text
Codex:
  codex exec
    --skip-git-repo-check
    --ephemeral
    --ignore-user-config
    --sandbox read-only
    --color never

Claude Code:
  claude
    --print
    --bare
    --no-session-persistence
    --tools ""
    --permission-mode plan

Qwen Code:
  node <frozen-cli-entry>
    --safe-mode
    --approval-mode plan
    --auth-type openai
    --max-wall-time 10s
    --max-tool-calls 0
    --max-session-turns 1
```

机器流分别为 Codex `--json`、Claude Code
`--output-format stream-json --verbose`、Qwen Code
`--output-format stream-json`。Qwen 显式选择 `openai` 且不注入 key，是为了在
本地 provider/auth gate 终止，避免 OAuth/browser fallback；这也是需要保留的
product gate 差异。

## 2. Safe R0/R1 Wave

| Probe ID                  | Products      | Exact variation                                                                                                                             | Expected bounded observation                                                | Atomic candidate / bounded dimensions                                                                     |
| ------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `P2B-E0-IDENTITY`         | 3             | exact target `--version`                                                                                                                    | frozen cohort identity；无未声明写入                                        | preflight only；不产生 Atomic edge                                                                        |
| `P2B-E0-INVALID-SCHEMA`   | 3             | Codex `--output-schema <invalid-file>`；Claude `--json-schema <invalid-bytes>`；Qwen `--json-schema @<invalid-file>`；统一 argv prompt      | local parser/schema gate 或更早 containment gate；不得出现 success final    | candidates `CAP-10.03-A03`，Qwen 另含 `10.05-A04`；仅限定 `ENTRY/AVAIL/FAIL`，不创建 support edge         |
| `P2B-E0-EMPTY-EOF`        | 3             | stdin 为 0 bytes 后 EOF；Codex prompt `-`，Claude/Qwen 无 positional prompt                                                                 | bounded exit/timeout；记录 missing input、auth 或 mode gate；不得回退 TTY   | candidates `CAP-10.01-A01` / `10.02-A02`，Qwen 另含 `10.05-A04`；仅限定 `ENTRY/AVAIL/FAIL`                |
| `P2B-E0-ARGV-NOAUTH`      | 3             | 统一 locked argv prompt + machine stream                                                                                                    | parser 接受后在 auth/provider/containment gate 终止；无 success final       | candidates `10.01-A01` / `10.02-A01` / `10.03-A02`，Qwen 另含 `10.05-A04`；仅限定 `ENTRY/AVAIL/FAIL`      |
| `P2B-E0-STDIN-NOAUTH`     | 3             | locked stdin bytes 后 EOF + machine stream                                                                                                  | 同上，并记录 stdin/EOF 是否在 auth 前被接受                                 | candidates `10.01-A01` / `10.02-A02` / `10.03-A02`，Qwen 另含 `10.05-A04`；仅限定 `ENTRY/AVAIL/FAIL`      |
| `P2B-E0-DOCTOR-EMPTY`     | Codex、Claude | isolated empty roots；Codex `doctor --json`；Claude `--bare doctor`                                                                         | exact checks、output shape、exit、helper-process containment 与 state delta | candidate `CAP-12.05-A02`；可限定 `ENTRY/AVAIL/SIDEFX/OUTPUT/FAIL/OBS`                                    |
| `P2B-E0-CONFIG-MALFORMED` | 3             | Codex malformed `config.toml`；Claude malformed explicit `--settings`；Qwen malformed `$QWEN_HOME/settings.json` 后运行 `--list-extensions` | parse/ignore/diagnostic gate 与 side effects；Qwen 在认证/模型前退出        | Codex/Qwen candidate config-validation leaf；Claude candidate doctor diagnostic leaf；不创建 support edge |
| `P2B-E0-CONFIG-UNKNOWN`   | 3             | product-specific unknown top-level key；Codex `--strict-config exec`；Qwen user settings 含 `"$version":4`                                  | reject/warn/ignore、strict-startup/doctor/local-list result 与 side effects | Codex/Qwen candidate `CAP-12.09-A02`；Claude candidate doctor diagnostic leaf；不创建 support edge        |

共 8 个 scenario、23 个 product execution。任何 execution 都必须：

- frozen artifact 和 fixture hash 匹配后才启动；
- 每次 execution 前后相关 product/runtime/profile/system hash 都匹配；
- 使用逐文件校验 hash/mode 的独立只读 repo/fixture 与可写 state root；
- network policy 为 deny all；
- 不包含继承 credential/provider/proxy 环境；
- 15 秒触发 execution timeout，17 秒停止等待 inherited pipe，18 秒内完成原
  process group 的 liveness verification；
- inventory delta 全部位于 `state/`；
- repo `README.md` 与 `sentinel.txt` hash 不变；
- raw stdout/stderr 未截断，或明确标记截断并禁止形成完整协议结论。

## 3. Diagnostics / Config Asymmetry

| Product     | Standalone diagnostic shape                         | Malformed config route                                      | Unknown-key route            | Bound                                                                                                                        |
| ----------- | --------------------------------------------------- | ----------------------------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Codex       | `doctor --json`                                     | isolated `CODEX_HOME/config.toml`                           | `--strict-config exec ...`   | doctor 可检查 install/config/auth/runtime；unknown-key 改走 strict exec，因为 strict-config 不应借 doctor command-shape 推断 |
| Claude Code | `doctor`                                            | explicit `--settings <file>`                                | explicit `--settings <file>` | Help 明示 print mode validation failure 可静默忽略；本 probe 使用 doctor，不把其结果投影为不存在的 `CAP-12.09` Claim         |
| Qwen Code   | no exact standalone doctor in frozen top-level Help | controlled `$QWEN_HOME/settings.json` + `--list-extensions` | same                         | `--list-extensions` 在 settings load 后、认证/模型前退出；不能与 doctor command parity，也不能从“无 command”推断“无诊断能力” |

分层 effective source 不能由一个 unknown-key fixture闭合。`CAP-12.09-A01`
仍需要后续多层冲突 fixture 和可观察 source explanation。

## 4. Deferred R2 Success Wave

| Probe ID                 | Products     | Expected success                                                    | Projects to                               |
| ------------------------ | ------------ | ------------------------------------------------------------------- | ----------------------------------------- |
| `P2B-R2-ARGV-STREAM-OK`  | 3            | JSONL contract 可解析，final content 为 `CCQ_OK`，exit 0，repo 不变 | `CAP-10.01-A01`、`10.02-A01`、`10.03-A02` |
| `P2B-R2-STDIN-STREAM-OK` | 3            | provider 实际消费 stdin；EOF 后 final `CCQ_OK`                      | `CAP-10.01-A01`、`10.02-A02`、`10.03-A02` |
| `P2B-R2-FINAL-JSON-OK`   | Claude、Qwen | stdout 恰为一个 JSON document，result leaf 为 `CCQ_OK`              | `CAP-10.03-A01`                           |
| `P2B-R2-SCHEMA-OK`       | 3            | independent validator 验证 raw object 严格等于 `{"probe":"CCQ_OK"}` | `CAP-10.03-A03`                           |

R2 前置是 disposable account、明确 provider/model/region、只注入该进程凭据、
endpoint allowlist、请求/turn/wall/tool/费用上限与 usage capture。订阅额度也视为
外部成本和数据传输；未获专项授权不得执行。

## 5. Relation Gate

- Safe wave 的失败到达入口不能写成 success、Equivalent 或 Functional overlap。
- 只有完整可解析的 stdout machine error 才能支持对应 error-expression leaf；
  且 `CAP-10.05-A04` 还要求 category、stage、retryability、run correlation；
  stderr 文本或单一终态 error label 不能替代该契约。
- 至少两个产品在同一成功 fixture、non-TTY、输入 byte、工具禁用和 provider gate
  下闭合相同 observable outcome，才可考虑 `runtime-comparable`。
- Qwen TTY Dual Output 不进入本 wave。
- Claude `2.1.220/latest` machine-error Claim 不得由本轮 `2.1.212/stable`
  execution 回填。

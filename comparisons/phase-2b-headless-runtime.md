# Phase 2B：Headless Core Runtime 对比

> Cohort：Codex `0.145.0/latest`、Claude Code `2.1.212/stable`、Qwen Code `0.21.0/stable`  
> Capture：2026-07-26T09:56:10.363Z — 2026-07-26T09:57:00.687Z  
> Evidence：[`phase-2b-aligned-runtime.md`](../evidence/phase-2b-aligned-runtime.md)  
> Raw artifact SHA-256：`bdbc65635d4e2ec454bd4bed03d5e29c82f97a6154f57dc28ebba00d167a5393`

## 1. Outcome Matrix

| Scenario                     | Codex                                                                    | Claude Code                                                 | Qwen Code                                              |
| ---------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------- | ------------------------------------------------------ |
| Exact identity               | `codex-cli 0.145.0`；exit `0`                                            | `2.1.212 (Claude Code)`；exit `0`                           | `0.21.0`；exit `0`                                     |
| Malformed JSON schema        | local reject；empty stdout；exit `1`                                     | local reject；empty stdout；exit `1`                        | local reject；empty stdout；exit `52`                  |
| Zero-byte stdin + EOF        | `No prompt provided via stdin.`；exit `1`                                | print mode requires stdin/prompt；exit `1`                  | missing OpenAI-compatible key 的 JSON result；exit `1` |
| Locked argv prompt / no auth | JSONL 到达 thread/turn；WebSocket→HTTPS retry；15 秒 timeout + `SIGTERM` | 3 行完整 JSONL；synthetic `authentication_failed`；exit `1` | 1 个 JSON result；missing key；exit `1`                |
| Locked stdin / no auth       | child stream 接受 67 bytes；其后同 argv transport gate                   | child stream 接受 67 bytes；其后同 argv auth gate           | child stream 接受 67 bytes；其后同 argv auth gate      |

三产品在 malformed schema 上都能在模型成功之前失败，但 fixture 本身不是 legal
schema；它只闭合 parser gate。Zero-byte EOF 的 gate order 不同：Codex/Claude 先拒绝
缺输入，Qwen 先到 provider credential gate。不能据此断言 Qwen 消费了空任务。

## 2. Machine Output Shape

| Product     | Non-empty no-auth stdout                                                                        | Terminal interpretation                                                                             | stderr separation                                               |
| ----------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Codex       | 每行可解析 JSON；`thread.started`、`turn.started`、retry error、HTTPS fallback item             | 在 harness timeout 前没有 terminal result；partial stream 不能冒充完整 run                          | transport diagnostics 同时进入 stderr；stdout 仍保持 JSONL      |
| Claude Code | 3 行 JSONL：`system/init`、synthetic `assistant`、`result`                                      | result 同时为 `subtype=success`、`is_error=true`、`terminal_reason=api_error`；必须以组合字段解释   | stderr empty                                                    |
| Qwen Code   | 单个 JSON result；`subtype=error_during_execution`、`is_error=true`、`num_turns=0`、usage `0/0` | 清楚表达本地 missing-key terminal error，exit `1`；单一 document 不证明 incremental event lifecycle | safe-mode 与 rg containment fallback 在 stderr，stdout 未被污染 |

Qwen result 有 `uuid` 与 `session_id`，但 `error` 只有 message。Registry
`CAP-10.05-A04` 要求至少 category、stage、retryability、run correlation；本结果只
闭合 correlation，因此不能升级为 A04 support。

Claude Code stable `2.1.212` 的结果包含 assistant event
`error=authentication_failed`，但 Phase 2A 的 A04 Claim 是
`2.1.220/latest`。禁止用本轮 stable binary 跨版本回填该 Claim。

## 3. Atomic Comparison Delta

| Atomic          | Phase 2A state | Phase 2B bounded delta                                                                                           | Current relation                                                                 |
| --------------- | -------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `CAP-10.01-A01` | `surface-only` | 三产品均进入 non-TTY 失败路径；没有成功单任务                                                                    | `Not assessed`                                                                   |
| `CAP-10.02-A01` | `surface-only` | argv entry 分别到达 Codex transport、Claude/Qwen auth gate                                                       | `Not assessed`；gate materially different                                        |
| `CAP-10.02-A02` | `surface-only` | 三产品 child stream 接受相同 67 bytes；只证明 harness delivery，不证明 provider consumption                      | `Not assessed`                                                                   |
| `CAP-10.03-A02` | `surface-only` | Claude 有完整三行 no-auth JSONL lifecycle；Qwen 只有单一 terminal JSON document；Codex 只有 partial retry stream | `Not assessed`；Qwen incremental stream 与三产品成功 terminal lifecycle 均未闭合 |
| `CAP-10.03-A03` | `surface-only` | 三产品拒绝 malformed schema                                                                                      | `Not assessed`；legal-schema contract 未运行                                     |
| `CAP-10.05-A04` | `surface-only` | Qwen machine error 只有 correlation，缺 category/stage/retryability；Claude Slice 版本不匹配；Codex 无该 Claim   | `Not assessed`                                                                   |

本轮没有 Comparison Record 达到 `runtime-comparable`。原因不是缺少 runtime
output，而是没有两个产品在同一 legal contract leaf 与成功 gate 下闭合相同
observable outcome。

## 4. Qwen Code 视角的已观察差异

这些是事实 delta，不是 Gap 或实现优先级：

- malformed schema 使用独立 exit `52`，而 Codex/Claude 本轮均为 exit `1`；
- empty EOF 在 missing-key gate 终止，没有先产生 missing-input error；
- argv 与 stdin 的 missing-key machine result 形状相同，均为 `num_turns=0` 与零
  token usage；
- empty EOF、argv 与 stdin 的 missing-key 三例中，stdout 保持单个 JSON
  document，但 stderr 会包含 safe-mode notice 与 `rg spawn EPERM` fallback；
- error result 已有关联运行的 UUID/session ID，尚未表达 Registry 所需的完整错误
  taxonomy。

## 5. Required Next Evidence

R2 success wave 仍需专项授权和 disposable account：

1. 三产品以相同 prompt 成功返回 `CCQ_OK`，验证 argv 与 stdin 的 provider
   consumption；
2. 解析完整 event lifecycle 与 terminal record；
3. legal output schema 成功结果通过独立 validator；
4. 为 machine error 使用同一可重试/不可重试故障，核对 category、stage、
   retryability 与 correlation；
5. 锁定 provider、model、region、endpoint allowlist、turn/wall/tool/request 与费用
   上限。

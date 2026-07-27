# Phase 2C：Config Schema 结果与 Open Probes

> 状态：Frozen  
> Frozen at：2026-07-26T12:43:43.496Z  
> Scope：R1-1 valid / type / unknown / cross-field matrix  
> Raw artifact SHA-256：`37e6d06dd6ac34cf5dab1de179568f1d5495f669d77ebab365e76148f3dd36b8`

## 1. Result Summary

| Metric                                                   | Result  |
| -------------------------------------------------------- | ------- |
| Scenarios / product executions                           | `5 / 15` |
| Exact identity preflight                                 | `3/3 Pass` |
| Config category executions                               | `12/12 Pass` |
| Integrity / fixture / side-effect / original PGID gate   | `15/15 Pass` |
| Timeout / signal / truncated output / spawn error        | `0 / 0 / 0 / 0` |
| Inherited credential / network / user-model turn         | `0 / 0 / 0` |
| Changed or removed config fixture                        | `0` |
| Pairwise runtime Comparison Record                       | `3` |
| Product source or Phase 2A/2B frozen file modified       | `0` |

## 2. Completed Matrix and Remaining Contract

Phase 2B `R1-1 config schema matrix` 的四类 runtime 行已执行：

- valid；
- known-field type error；
- unknown top-level field；
- cross-field invalid；
- strictness/entry asymmetry；
- exact fixture and supporting-layer preservation；
- no-model safety and reproducibility gate。

但 Registry 对 `CAP-12.09-A02` 另要求记录 schema version。当前 artifact 没有为三产品
锁定可比较的 schema identity/version，因此 `R1-1` 与该 Atomic 的完整契约仍未闭合；
它作为 `R1-1b` 保留在 backlog。

`CMP-P2A-CAP-12.09-A02` 的 `type/cross-field fixture 未跑` 缺口由本阶段 additive
Evidence 补齐。历史 Phase 2A/2B record 不原地改写；当前 pairwise delta 见
[`phase-2c-config-schema-runtime.md`](./comparisons/phase-2c-config-schema-runtime.md)。

## 3. Main Finding

三产品都能读取 valid config，但“schema validation”不是同一行为：

- Codex strict startup 是 fail-fast、stderr、non-zero exit，并给 file/line/source；
- Claude normal explicit loader 对 known-field type/cross fail source、结构化返回 error，
  但 unknown passthrough 且 process exit `0`；
- Qwen selected startup loader 不递归执行内部 settings schema，type/unknown/cross
  都不阻止命令完成；这只绑定该 startup/load slice。

Codex 与 Claude Code 对 type/cross 都产生精确 validation outcome，因此该 pair 是
`Partial overlap`；unknown 与失败 envelope 仍不同。含 Qwen 的两组 pairwise 保持
`Unknown`：本轮只观察到 selected startup/load route 的 bounded non-rejection，
valid acceptance 与 unknown non-rejection 不能替代 Atomic 要求的 invalid-config
精确定位，也不能代表尚未探测的 downstream consumer。

## 4. Harness Freeze

| Object            | SHA-256                                                            |
| ----------------- | ------------------------------------------------------------------ |
| Runner            | `fd19b1a4ce4ceb9944591e8c88d4ceb1c5435f59c32a6984dd969b637662062a` |
| Seatbelt profile  | `ff5f599cad03d5c257827314c5a483e3cffaa2fef2d7b70a433e376ad1c700e6` |
| Raw artifact      | `37e6d06dd6ac34cf5dab1de179568f1d5495f669d77ebab365e76148f3dd36b8` |

Final run root：

```text
/private/tmp/ccq-phase2c-r1-1-WeC5Tw
```

该 root 保留供本地复核，不是长期 portable artifact；portable evidence 是冻结 JSON、
runner、profile 和 validator。

## 5. Open Probe Backlog

这是 Evidence 顺序，不是产品 roadmap。

| Order | Probe family            | Required evidence                                                                                       | Risk / authorization                             |
| ----- | ----------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| R1-1b | schema identity/version | 三产品 schema identity/version 或明确的无版本机制；与四类 fixture 和 migration 边界建立可追溯关系      | 无凭据、无模型                                   |
| R1-2  | layered config source   | system/user/project/local 冲突；effective value、source、precedence；unknown/trust gate                 | 无凭据、无模型                                   |
| R1-3  | diagnostic fault matrix | missing executable、unwritable state、bad proxy/CA、corrupted cache                                    | containment-sensitive                            |
| R2-1  | argv/stdin success      | 相同 provider/model/region、final result、usage、exit、side effects                                    | disposable account、endpoint allowlist、费用上限 |
| R2-2  | event/final JSON        | complete success lifecycle、terminal event、single final document                                      | same                                             |
| R2-3  | legal output schema     | valid schema success + unsatisfiable legal schema failure                                              | same                                             |
| R2-4  | machine error taxonomy  | 同一 transient/permanent provider error 的 category/stage/retryability/correlation                     | fake endpoint or disposable provider             |

普通“继续”不授权读取现有凭据或消耗模型额度；R2 继续 Deferred。

## 6. Review Gate

| Gate                                                                          | Result |
| ----------------------------------------------------------------------------- | ------ |
| 15 executions 绑定 exact product/tree/runtime/profile identity               | Pass   |
| output 固定路径且不与 protected input 重叠                                   | Pass   |
| Qwen user + system/default/trust/approval 五个配置输入完整冻结                | Pass   |
| Codex dynamic-path diagnostics 按全文精确匹配                                 | Pass   |
| Claude control envelope、effective/source/error path 独立解析                 | Pass   |
| Qwen bounded negative 未外推到 HookRegistry 或其他 consumer                  | Pass   |
| 含 Qwen pairwise 未由 valid/unknown 反向结果升级为 Partial overlap           | Pass   |
| schema identity/version 未被误写为已验证或已闭合                             | Pass   |
| 未创建 product-wide Not supported、总分、优先级、Gap 或 roadmap              | Pass   |
| Phase 2A/2B frozen files保持不变                                              | Pass   |

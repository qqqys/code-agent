# Phase 2A：Coverage 与 Open Comparisons

> 状态：Frozen  
> Frozen at：2026-07-26T08:24:57Z  
> Scope：`CAP-10` + `CAP-12`  
> Observed behavior relation：0

比较口径见 [`15-phase-2a-comparison-cohort-and-method.md`](./15-phase-2a-comparison-cohort-and-method.md)；Qwen CLI channel correction 见 [`ERR-P2A-QWEN-CLI-CHANNEL-001`](./evidence/phase-2a-identity-errata.md)。

## 1. Summary

| Metric                      | CAP-10 | CAP-12 | Total |
| --------------------------- | ------ | ------ | ----- |
| Registry Comparison Records | 48     | 47     | 95    |
| Cross-product candidates    | 10     | 10     | 20    |
| Single-product              | 18     | 16     | 34    |
| Uncovered                   | 20     | 21     | 41    |
| runtime-comparable          | 0      | 0      | 0     |

| Cohort slice         | Claims | Distinct Atomics | Distinct Slices |
| -------------------- | ------ | ---------------- | --------------- |
| CAP-10 / Codex       | 17     | 12               | 6               |
| CAP-10 / Claude Code | 10     | 9                | 2               |
| CAP-10 / Qwen Code   | 24     | 22               | 6               |
| CAP-12 / Codex       | 5      | 5                | 1               |
| CAP-12 / Claude Code | 12     | 12               | 2               |
| CAP-12 / Qwen Code   | 25     | 20               | 4               |

Phase 2A 找到 20 个“至少两产品有正式 Claim”的候选，但没有一项通过 runtime-comparable gate。这里的 0 不是三产品没有共同能力，而是当前证据尚未在 aligned Slice/gate 下闭合同一 observable outcome。

## 2. Comparison State Distribution

| State                 | Count | Meaning in this snapshot                                             |
| --------------------- | ----- | -------------------------------------------------------------------- |
| `runtime-comparable`  | 0     | 至少两产品 direct runtime 闭合同一 outcome                           |
| `gate-asymmetric`     | 2     | bounded statements 绑定的 Surface、gate 或资源对象 materially 不对齐 |
| `evidence-asymmetric` | 3     | 部分产品有 bounded runtime，其他产品仍是未测试 Claim                 |
| `surface-only`        | 15    | 只确认同一 Atomic 下 exact pre-runtime Claim co-presence             |
| `single-product`      | 34    | 当前只有一个产品存在正式 Claim                                       |
| `uncovered`           | 41    | 当前三产品均无正式 Claim                                             |

## 3. Current Evidence Conclusions

- 三产品的 headless single-task、argv、stdin、event stream 与 output schema 目前只有同一 Atomic 下的 pre-runtime Claim co-presence，不能写成 Surface 或行为等价。
- Codex/Qwen daemon 的 runtime 子句不同：schema generation、contained startup failure 与 management routes 不能互相当作 task-ready service。
- Qwen persistent log/readiness 的 bounded runtime 已闭合当前 Slice，但 Claude/Codex 对应 Atomic 缺少 aligned runtime，不能转成横向领先结论。
- Claude/Qwen telemetry 当前主要是文档、changelog、binary 或 source Surface；本阶段没有启用 exporter 或外部 collector。
- Claude print-mode process-tree termination 与 Qwen daemon listener cleanup 的资源对象和 gate 不同，不能判 parity。

## 4. Evidence-order Backlog

这是 comparison evidence 的采集顺序，不是 Qwen 产品优先级。

| Order | Scenario family            | Aligned evidence required                                                                 | Risk  |
| ----- | -------------------------- | ----------------------------------------------------------------------------------------- | ----- |
| E0    | 三产品 headless core       | 同一无 TTY fixture：single task、argv/stdin、structured final/events/schema、failure/exit | R1/R2 |
| E0    | 本地 diagnostics/config    | 相同坏配置、缺依赖与分层冲突：doctor、effective source、schema validation                 | R1    |
| E1    | Codex/Qwen task service    | disposable config + fake provider：task-ready、submit、events、multi-request、shutdown    | R1/R2 |
| E1    | logs/telemetry/correlation | local collector、无外发：log location/redaction、span/metric/export/opt-out、ID linkage   | R1    |
| E1    | resource cleanup           | 相同 parent+child+listener fixture：graceful、cancel、crash、failed cleanup               | R4    |

## 5. Deferred Decisions

在出现首个 `runtime-comparable` Comparison Record 前，不创建 parity matrix、Qwen Gap 或 roadmap。即使后续出现行为差异，也必须先判断用户影响、适用 Surface、gate 与产品策略，不能把“竞品有”直接转换为开发需求。

## 6. Review Gate

| Gate                                                 | Result |
| ---------------------------------------------------- | ------ |
| 95 个 Registry Atomic 全量覆盖为 Comparison Record   | Pass   |
| 20 个跨产品候选均保持 observed relation=Not assessed | Pass   |
| 41 个 uncovered 记录未被写成共同不支持               | Pass   |
| Qwen CLI channel 只在 Phase 2A projection 中勘误     | Pass   |
| 未生成 Gap、产品优先级、总分或 roadmap               | Pass   |

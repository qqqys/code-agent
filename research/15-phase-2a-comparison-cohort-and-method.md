# Codex / Claude Code / Qwen Code 对比：Phase 2A Cohort 与方法

> 阶段：2A · Evidence-bounded Cross-product Comparison  
> 状态：Frozen  
> Frozen at：2026-07-26T08:24:57Z  
> Registry：Revision 2，144 topics / 550 Atomic Capability Records  
> 首批主题：`CAP-10`、`CAP-12`

## 1. 本阶段只回答什么

Phase 2A 在同一 Atomic Capability 下并列三产品的已冻结 Claim，回答：

- 哪些产品在当前 cohort 中有正式 Claim；
- Claim 来自哪个 exact version、Surface 与 gate；
- 当前只闭合了入口/文档、静态 schema，还是有界 runtime statement；
- 现有证据是否足以比较同一个 observable outcome；
- 还缺哪类证据才能形成行为差异结论。

本阶段不生成：

- “产品没有某功能”的结论，除非存在 exact scoped negative Claim；
- 功能数量、支持率、总分或排名；
- Qwen Gap、产品优先级、实现方案或 roadmap；
- 跨版本、跨 Surface 或跨 gate 的静默 parity 推断。

## 2. Current Comparison Cohort

Phase 2A 合并两层冻结输入，而不是只读取 secondary Surface：

| Layer                         |  Codex | Claude Code | Qwen Code |   Total |
| ----------------------------- | -----: | ----------: | --------: | ------: |
| Phase 1C.1 exact CLI Claims   |     84 |         132 |       209 |     425 |
| Phase 1D.1 current secondary  |     11 |           0 |        27 |      38 |
| **Current comparison cohort** | **95** |     **132** |   **236** | **463** |

Claude Code 的 secondary Claim 为 0，只表示本轮没有锁定 exact secondary
artifact/runtime Slice；它的 132 条 CLI Claim 仍进入 comparison cohort。

冻结输入：

| Input                                                                                                        | SHA-256                                                            |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| [`00-scope-and-version-lock.md`](./00-scope-and-version-lock.md)                                             | `fd178ab9b197f118c90c2db5efcac780ee2465a282585ec1df96a58f86198373` |
| [`03-atomic-capability-registry.md`](./03-atomic-capability-registry.md)                                     | `95deccb0c7c056b6e89e092ae6b9187e459afd7e0c680f6e972ec2a2c13997f5` |
| [`claims/codex-cli.md`](./claims/codex-cli.md)                                                               | `45a2dff2d36529241a6b91be0553a4470a3cd53d21e61f8c640ef7dbd3905724` |
| [`claims/claude-code-cli.md`](./claims/claude-code-cli.md)                                                   | `5ae1b170e9aed9bf460721a5a51870239ea10a1d5be6f3fac6e7c7b3e56dd657` |
| [`claims/qwen-code-cli.md`](./claims/qwen-code-cli.md)                                                       | `7702ca8695e6c52e8bed735bfd94398ac969563f1290d3a7064bfdf4bbb56d7a` |
| [`claims/phase-1d1/codex-secondary-surfaces.md`](./claims/phase-1d1/codex-secondary-surfaces.md)             | `b7ec885b0795778147dd003126b7c79d7bb06b60e8efd0511cc5034329ece0e2` |
| [`claims/phase-1d1/claude-code-secondary-surfaces.md`](./claims/phase-1d1/claude-code-secondary-surfaces.md) | `9a0092e28ce61a5ffeb8a24b0232538ca499008783d639f413cfe8ccc892541f` |
| [`claims/phase-1d1/qwen-code-secondary-surfaces.md`](./claims/phase-1d1/qwen-code-secondary-surfaces.md)     | `eafd31711bab64b5a2e580dd59032220daddc2b090dbcbe87f48e2c7b2faac58` |

Phase 1C.1 与 Phase 1D.1 的历史文件保持字节不变。Qwen CLI 的 recorded
`stable` channel 只在本 comparison projection 中按
[`ERR-P2A-QWEN-CLI-CHANNEL-001`](./evidence/phase-2a-identity-errata.md)
解释为 effective `latest`。

## 3. Comparison Record

每个 Atomic ID 只创建一条 current Comparison Record：

```yaml
comparison_id: CMP-P2A-CAP-xx.yy-Axx
atomic_capability_id: CAP-xx.yy-Axx
cohort_id: CCQ-P2A-CLI-PLUS-SECONDARY-R2
claim_ids:
  codex: []
  claude-code: []
  qwen-code: []
comparison_state: runtime-comparable | gate-asymmetric | evidence-asymmetric | surface-only | single-product | uncovered
observed_relation: Equivalent | Different | Functional overlap | Not assessed
bounded_conclusion: one evidence-bounded statement
next_evidence: one falsifiable evidence requirement
reviewed_at: ISO-8601 timestamp
```

`claim_ids` 是 Slice-preserving Claim set。它只用于并列同一 Atomic 下的记录，
不得把 host 与 contained Claim 合并成一个新的 `support_state`。
本轮所有记录的 `observed_relation` 均为 `Not assessed`；只有
`runtime-comparable` 记录才允许填写前三种实质关系。

## 4. Comparison State

| State                 | 准入条件                                                                                                                                                                                       | 允许结论                                                              |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `runtime-comparable`  | 至少两个产品在 materially aligned Slice/gate 下，用 direct runtime Evidence 闭合同一 observable outcome                                                                                        | 可以描述已观察到的相同或不同结果                                      |
| `gate-asymmetric`     | 至少两个产品有 bounded observable statement，但 statement 绑定的资源对象、Surface、mode、isolation、authentication、feature gate 或子结果 materially 不对齐；runtime coverage 可以对称或不对称 | 只描述 gate 差异，不比较优劣或 parity                                 |
| `evidence-asymmetric` | 至少两个产品的 statement 资源对象与 gate materially alignable，但只有部分产品有 bounded runtime statement，尚不存在第二个 runtime outcome 可供对齐                                             | 并列已观察与未测试边界                                                |
| `surface-only`        | 至少两个产品只有 exact Help/docs/schema/changelog 等 pre-runtime Claim；即使 Slice metadata 不同，也没有可比较的 runtime outcome                                                               | 只确认同一 Atomic 下存在 pre-runtime Claim，不宣称 Surface 或行为重合 |
| `single-product`      | 当前只有一个产品存在正式 Claim                                                                                                                                                                 | 只确认 current cohort presence；不得写其他产品无此能力                |
| `uncovered`           | 当前三产品均无正式 Claim                                                                                                                                                                       | 记录证据空白，不填写支持状态                                          |

`runtime_probe_status=Reproduced` 只对该 Claim 的 bounded statement 生效。例如
schema generation、management-route lifecycle 与 task-ready service 是不同
statement；不能仅按枚举值把它们判成 `runtime-comparable`。

状态按 `runtime-comparable` → `gate-asymmetric` → `evidence-asymmetric` →
`surface-only` 的顺序选择“最接近实质比较失败的主因”。所有 Slice 差异仍完整显示
在 Claim set 中；`surface-only` 不会因存在 metadata 差异自动升级为
`gate-asymmetric`，因为此时尚无两个 runtime outcome 可比较。

## 5. Comparison Gate

一条记录只有同时满足下列条件，才能进入 `runtime-comparable`：

1. Atomic ID、canonical user job 与 observable outcome 相同；
2. 至少两个产品有 direct runtime Evidence；
3. 比较的具体 contract leaves 相同；
4. version、Surface、terminal、isolation、authentication、provider/model 与
   feature gate 已显式展开；
5. containment failure 未被当作正常 host 行为；
6. 文档承诺、静态 schema 与实际业务 runtime 没有混成同一完成状态。

不满足任一项就按上面的主因顺序降为 `gate-asymmetric`、
`evidence-asymmetric` 或 `surface-only`。缺 Claim 只能写 `single-product` /
`uncovered`，不能写 `No counterpart`。

## 6. 首批输出

- [`comparisons/phase-2a-cap10-automation-and-programmatic-access.md`](./comparisons/phase-2a-cap10-automation-and-programmatic-access.md)
- [`comparisons/phase-2a-cap12-observability-and-reliability.md`](./comparisons/phase-2a-cap12-observability-and-reliability.md)
- [`16-phase-2a-coverage-and-open-comparisons.md`](./16-phase-2a-coverage-and-open-comparisons.md)

## 7. Review Gate

| Gate                                                                 | Result |
| -------------------------------------------------------------------- | ------ |
| CLI 与 current secondary 两层 Claim 都进入 cohort                    | Pass   |
| Qwen CLI channel correction 有独立、有限的 projection scope          | Pass   |
| 每个 `CAP-10` / `CAP-12` Atomic 恰有一条 Comparison Record           | Pass   |
| Comparison state 可由 Claim presence、runtime 与 gate 重新计算或复核 | Pass   |
| 无 Claim 不被写成产品不支持                                          | Pass   |
| 没有生成 Gap、优先级、实现方案、总分或 roadmap                       | Pass   |

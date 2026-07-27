# Stage 6：最终索引与维护规则

> 状态：Complete / Original Stage 0–6 closed  
> 定稿时间：2026-07-26  
> 主比较 Cohort：Codex `0.145.0 / latest / CLI`、Claude Code
> `2.1.212 / stable / CLI`、Qwen Code `0.21.0 / effective latest / CLI`

## 1. 结案结论

原始 `0–6` 总计划已经完成。最终产物包括三方事实、原子能力与 Claim、跨产品
Comparison、授权范围内的本地场景验证、Qwen Gap 决策和精简 roadmap。

结案不表示所有 `Unknown` 或 `Not assessed` 已消除，也不表示三个产品被评出总分。
需要 provider 或 deterministic fake provider 的 R2 仍是独立 Deferred tranche；
它不阻塞当前产品决策，但未经新的明确授权不得执行。

## 2. 按阶段阅读

| Stage | Outcome | Primary documents |
| --- | --- | --- |
| 0 | 锁定版本、渠道、Surface、平台与证据规则 | [范围与版本锁定](./00-scope-and-version-lock.md)、[研究方法](./01-methodology.md) |
| 1 | 建立三方事实、Evidence、Claim 和原子能力 Registry | [能力地图](./02-capability-map.md)、[Atomic Registry](./03-atomic-capability-registry.md)、[CLI Claim 覆盖](./07-phase-1c-coverage-and-open-claims.md)、[secondary-surface 覆盖](./14-phase-1d1-coverage-and-open-claims.md) |
| 2 | 生成 exact-slice 的 pairwise Comparison | [比较方法](./15-phase-2a-comparison-cohort-and-method.md)、[Comparison 覆盖](./16-phase-2a-coverage-and-open-comparisons.md)、[早期能力对比快照](./21-final-capability-comparison.md) |
| 3 | 完成当前授权下的 R1 场景验证 | [Phase 2B 结果](./18-phase-2b-comparison-deltas-and-open-probes.md)、[Phase 2C 结果](./20-phase-2c-config-schema-results-and-open-probes.md)、[Phase 2D 结果](./25-phase-2d-config-identity-layering-results.md)、[Phase 2E 结果](./27-phase-2e-diagnostic-fault-results.md)、[Stage 3 收口](./28-stage-3-scenario-validation-synthesis.md) |
| 4 | 将差异收敛成 Gap、机会、调查、Evidence debt 或 No-build | [Qwen Gap 收敛](./29-stage-4-qwen-gap-convergence.md) |
| 5 | 形成只含 3 项的 Qwen roadmap | [Qwen Backlog 与路线图](./30-stage-5-qwen-backlog-roadmap.md) |
| 6 | 固化入口、维护规则和全链校验 | 本文与 [README](./README.md) |

`21`–`23` 是重开 Stage 3 之前的 immutable historical snapshot。它们用于 lineage，
不再代表最终执行状态，也不得被后续维护原地改写。

## 3. 最终证据快照

| Evidence set | Count / result | Interpretation |
| --- | ---: | --- |
| Capability Registry | `144 topics / 550 Atomics` | 用户任务拆分与证据定位集合，不是功能数量 |
| CLI Claims | `425` | exact CLI Slice 下的声明，不是支持能力总数 |
| Current secondary-surface Claims | `38` | 指定 sdk/daemon Surface 的声明，不可投影为 CLI |
| Phase 2A Comparison Records | `95` | pairwise scoped relation，不是产品得分 |
| Phase 2B–2E runtime executions | `53` | 本地 observation executions，不是成功任务数 |
| Credential reads / provider-model calls / model cost | `0 / 0 / 0` | 三项安全与费用边界分别为零 |

关键 relation 只在各自的 exact Slice 内成立：

- Phase 2C selected config type/cross-field relation：
  Codex–Claude 为 `Partial overlap`；涉及 Qwen 的两组为 `Unknown`。
- Phase 2D selected effective layering relation：三组 pairwise 均为
  `Partial overlap`。
- Phase 2E diagnostic fault relation：三组 pairwise 均为 `Not assessed`，因为
  entry、resource 和 fault target 不同。

这些关系不支持“谁功能更多”、三产品总分或整体等价结论。

主比较 Cohort 的 Claim Surface 是 CLI。`53` 次 Stage 3 execution 的 selected entries
还包括 Codex app-server 与 Qwen sdk-daemon；Claude 只运行 CLI
control/get_settings，interactive doctor 未运行。secondary execution evidence
不得反向外推成 CLI 整体能力。

## 4. Qwen 最终决策

当前 roadmap 只接收：

1. `BL-01 / P0`：把 daemon preflight 的 missing 与 permission failure 分开；
2. `BL-02 / P1`：仅为 missing credential 和 malformed output schema 定义 additive
   headless machine error contract；
3. `BL-03 / P1`：先调查两个 config fixture 的 loader→consumer policy，不预授权
   生产行为修改。

其余结论保持 Deferred、conditional reopen 或 No-build。roadmap 不构成 Issue、PR、
排期或实现授权。

## 5. R2 授权边界

正式 R2 inventory 继续精确保持四项：

- `R2-1`：argv/stdin success；
- `R2-2`：complete event/final lifecycle；
- `R2-3`：legal output-schema success 与 unsatisfiable failure；
- `R2-4`：provider transient/permanent error taxonomy。

daemon submit/query/event/cancel/reconnect 是额外 Deferred evidence queue，不新增为
`R2-5`。

只能在具备 deterministic fake provider，或单独明确 identity、endpoint、model、
region、credential handling 与费用上限后重开。不得读取既有 credential、复用用户
当前登录态、调用未指定模型或产生未设上限费用。

## 6. 维护规则

### 刷新顺序

1. 新建 additive research slice，先锁定 product/version/channel/surface/platform；
2. 更新 Fact 与 Evidence，区分 documentation、source、runtime 和 inference；
3. 在同一 Slice 内重新生成 Claim，`Unknown` 不得自动改成 `Not supported`；
4. 只对同一 user job 和可对齐 observable outcome 生成 Comparison；
5. runtime probe 先声明安全边界、fixtures、归因门槛与停止线；
6. 最后才刷新 Qwen 决策与 roadmap。

### 不可变与可变对象

- `21`–`23`、已冻结 runtime artifact、runner 和 containment profile 保持不可变；
- `29`、`30` 是本次决策快照，不是长期产品真相；
- 产品版本、Surface 或证据变化时新增文件和 revision，不覆盖旧切片；
- 不跨 CLI、sdk/daemon、cloud/desktop Surface 外推；
- 不用命令名、Help 命中、Claim 数、feature count 或未知项数量做排名。

## 7. 仓库边界

全部研究产物位于 gitignored 的 `.qwen/research/codex-claude-qwen/`。本轮没有修改
产品源码，没有创建 Issue/PR，没有 stage、commit 或 push。当前产品 worktree
中的既有改动不属于本研究，并由最终 validator 固定检查。

## 8. 最终复核

```bash
node .qwen/research/codex-claude-qwen/scripts/validate-stage-6.mjs
```

该命令串联上游 Phase 2E 与历史 closure 验证，检查冻结对象、最终索引、三项 roadmap、
R2 停止线、格式、链接、gitignore 和产品 worktree baseline。

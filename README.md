# Codex / Claude Code / Qwen Code 功能对比

> 状态：Final · Original Stage 0–6 complete  
> 定稿时间：2026-07-26  
> 受众：Qwen Code 产品与研发人员

本目录保存一次 exact-version、evidence-first 的产品对比。原始 `0–6` 总计划已经
完成；此前的快速结案仍作为 immutable historical snapshot 保留。需要 provider
或 deterministic fake provider 的 R2 独立 Deferred，不属于普通继续的隐含授权。

> Standalone repository note：本仓库从 Qwen Code 工作区的 Gitignored 研究目录
> 独立导出。Markdown、Evidence 与 Artifact 可直接阅读；`scripts/` 和 `probes/`
> 保留原始工作区的路径、依赖和隔离假设，不保证脱离原工作区后可直接重跑。

## 当前入口

1. [三方功能对比（人话版）](./32-readable-feature-comparison.md)：
   按功能直接列出 Qwen Code、Claude Code 和 Codex 的具体表现；表格可跳到每项详细说明。
2. [Stage 6 最终索引与维护规则](./31-stage-6-final-index-and-maintenance.md)：
   全阶段入口、最终证据快照、维护规则和授权边界。
3. [Stage 5 Qwen Backlog 与路线图](./30-stage-5-qwen-backlog-roadmap.md)：
   收敛后的 `BL-01`、`BL-02`、`BL-03`。
4. [Stage 4 Qwen Gap 收敛](./29-stage-4-qwen-gap-convergence.md)：
   Gap、机会、调查、Evidence debt 和 No-build 决策。
5. [Stage 3 场景验证收口](./28-stage-3-scenario-validation-synthesis.md)：
   `53` 次 R1 本地执行与独立 Deferred 的 R2。
6. [Phase 2E 结果](./27-phase-2e-diagnostic-fault-results.md)：
   `7` 次本地执行，包括 `2` 个 baseline、`4` 个故障观察和 `1` 个保守未评估。
7. [早期能力对比快照](./21-final-capability-comparison.md)：重开前的 12 个决策主题。
8. [早期 Qwen 决策快照](./22-qwen-opportunities-and-decisions.md)：
   重开前的 `Now / Next / Observe / No-build`。
9. [早期结案快照](./23-final-closure.md)：历史终止线；不再代表最终执行状态。

需要追溯过程时，再读取：

- [范围与版本锁定](./00-scope-and-version-lock.md)
- [研究方法](./01-methodology.md)
- [Phase 1C CLI 覆盖](./07-phase-1c-coverage-and-open-claims.md)
- [Phase 1D.1 secondary-surface 覆盖](./14-phase-1d1-coverage-and-open-claims.md)
- [Phase 2A Comparison 覆盖](./16-phase-2a-coverage-and-open-comparisons.md)
- [Phase 2B runtime 结果](./18-phase-2b-comparison-deltas-and-open-probes.md)
- [Phase 2C config schema 结果](./20-phase-2c-config-schema-results-and-open-probes.md)
- [Phase 2D config identity/layering 结果](./25-phase-2d-config-identity-layering-results.md)
- [Phase 2E diagnostic fault 方法](./26-phase-2e-diagnostic-fault-method.md)

## 原始总计划

| 阶段 | 内容 | 当前状态 |
| --- | --- | --- |
| 0 | 定义口径与版本边界 | Complete |
| 1 | 三方事实采集与证据规范化 | Complete |
| 2 | 横向能力比较 | Complete |
| 3 | 场景验证 | Complete within authorized R1 boundary |
| 4 | Qwen Gap 收敛 | Complete |
| 5 | Backlog 与路线图 | Complete |
| 6 | 定稿维护与索引刷新 | Complete |

## 冻结对象

| 产品        | 主比较切片                       |
| ----------- | -------------------------------- |
| Codex       | `0.145.0 / latest / CLI`         |
| Claude Code | `2.1.212 / stable / CLI`         |
| Qwen Code   | `0.21.0 / effective latest / CLI` |

Claude Code `2.1.220/latest` 只作为历史事实中的版本增量，不混入最终 runtime
主比较。Qwen 的 recorded/effective channel 勘误见
[Phase 2A identity errata](./evidence/phase-2a-identity-errata.md)。

## 阅读边界

- `550` 个 Atomic、`425` 条 CLI Claim、`38` 条 current secondary-surface Claim
  和 `95` 条 Phase 2A Comparison Record 都是证据覆盖量，不是功能数或产品得分。
- 同名命令、入口存在或 Help 可发现，不等于行为等价。
- `Unknown` 表示当前 Slice 未闭合，不表示不支持。
- 本结论只适用于冻结版本、Surface、平台和 gate；不是结案时间之后的当前产品真相。
- Stage 3 的 R1 只执行隔离的本地配置与诊断探测；没有读取凭据、调用模型、产生模型
  费用或执行 provider probe。
- R2 success/provider 场景仍为独立 Deferred，不影响原总计划结案，也不应被解释为
  已验证支持或产品缺陷。

当前历史快照复核命令：

```bash
node .qwen/research/codex-claude-qwen/scripts/validate-final-closure.mjs
```

最终全链复核命令：

```bash
node .qwen/research/codex-claude-qwen/scripts/validate-stage-6.mjs
```

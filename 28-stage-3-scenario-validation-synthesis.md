# Stage 3：场景验证收口

> 状态：Complete within authorized R1 boundary  
> 收口时间：2026-07-26  
> Cohort：Codex `0.145.0`、Claude Code `2.1.212`、Qwen Code `0.21.0`

## 1. 收口口径

Stage 3 在当前授权下完成全部 selected R1 work；无法建立受控对照、不可同构或触及
额外安全边界的 cells 明确保留为 `Not assessed` 或未执行。需要真实 provider 或
deterministic fake provider 的 R2 不属于普通继续的隐含授权，继续作为独立研究
tranche，而不是阻塞当前产品决策和后续阶段。

## 2. 已执行 evidence set

| Evidence wave | Runtime executions | Closed scope |
| --- | ---: | --- |
| [Phase 2B](./18-phase-2b-comparison-deltas-and-open-probes.md) | `23` | headless failure path、doctor baseline、local config failure |
| [Phase 2C](./20-phase-2c-config-schema-results-and-open-probes.md) | `15` | valid/type/unknown/cross-field config matrix |
| [Phase 2D](./25-phase-2d-config-identity-layering-results.md) | `8` | schema identity mechanism、effective config layering |
| [Phase 2E](./27-phase-2e-diagnostic-fault-results.md) | `7` | `2` baselines、`4` observed faults、`1` Not assessed fault |
| Total | `53` | exact-version local runtime executions |

这些 execution 的“通过”表示各自 harness、安全、完整性和预先声明的 observation
gate 通过，不表示 `53` 个产品能力、成功任务或 parity。

主比较 Cohort 的 Claim Surface 是 CLI；Stage 3 的 selected execution entries 更宽：

- Codex：CLI 与 app-server；
- Claude Code：CLI control/get_settings；interactive doctor 未运行；
- Qwen Code：CLI 与 sdk-daemon。

secondary execution evidence 只限定其自身 entry/Surface，不会反向改写 CLI Claim。

## 3. R1 结论

### Config schema

- Codex 与 Claude 在 selected type/cross-field validation 上为 `Partial overlap`，
  unknown handling 与 envelope 不同。
- Qwen selected startup loader 不递归执行内部 settings schema；这只形成 bounded
  observation，consumer-level validation 仍是 `Unknown`。
- 三方 schema identity mechanism 不可直接比较：
  exact-tag/versionless generated schema、split editor/runtime schema 与
  `$version:4` settings format 是不同概念。

### Effective layering

- Codex：selected trusted project、untrusted suppression 与 session flag origin 已
  直接观察。
- Claude：selected `local > project > user` 与 non-empty source projection 已观察。
- Qwen：selected `System > trusted Workspace > User > SystemDefaults`，且 untrusted
  workspace raw value 存在但不参与 effective merge。
- `CAP-12.09-A01` 三组 pairwise relation 均为 `Partial overlap`，不是 Equivalent。

### Diagnostic faults

- Codex：invalid custom CA 与 corrupt version cache 可归因观察。
- Qwen：Git/npm PATH 缺失与 daemon log 不可写降级可归因观察。
- Codex missing Git 因无受控正向对照保留 `Not assessed`。
- Claude interactive doctor 因 Keychain 边界不执行。
- `CAP-12.05-A02` 三组 pairwise relation 均为 `Not assessed`。

## 4. 仍然 Deferred 的 R2

| Probe | Required new authorization |
| --- | --- |
| `R2-1` argv/stdin success | disposable identity、provider/model/region、endpoint allowlist、费用上限 |
| `R2-2` event/final JSON success | 同上，并要求完整成功 lifecycle |
| `R2-3` legal output schema | 同上，或可验证的 deterministic fake provider |
| `R2-4` machine provider error taxonomy | deterministic fake endpoint 或 disposable provider fault injection |

R2 不得读取现有 credential、复用用户当前登录态、调用未指定模型或产生未设上限费用。

## 5. Stage 4 输入

允许进入 Gap 收敛的不是“竞品有、Qwen 没有”的关键词差，而是以下证据类型：

1. Qwen selected behavior 已直接复现，且影响明确用户任务；
2. 相同用户任务存在可比较的更强 observable outcome；
3. 差异不是版本、surface、trust、entry 或 containment 不对齐造成；
4. 有最小可交付边界与独立 acceptance evidence。

`Unknown`、`Not assessed`、secondary-surface-only 或不同机制不自动成为 Gap。

# Phase 2D：Config Identity 与 Layering 对比

> Atomics：`CAP-12.09-A01`、`CAP-12.09-A02`  
> Evidence：[`phase-2d-config-identity-layering.md`](../evidence/phase-2d-config-identity-layering.md)  
> Raw SHA-256：`dc74e8fd2a4caa06cac8481743bb6e1fdb76c403b21229673fce1ef29f3b3187`

## 1. Schema identity / version mechanism

| Product | Mechanism | Comparable result |
| --- | --- | --- |
| Codex | versionless generated schema；exact tag + path + hash | 无独立数值 schema version |
| Claude Code | versionless split；pinned editor schema + exact binary runtime reader | editor/runtime exact-equivalence `Unknown` |
| Qwen Code | settings format `$version:4` + explicit migrations | 明确格式版本，不等于 API envelope |

结论是 `Different mechanisms / Not directly comparable`，不是 Qwen 的 `4` 大于两个
draft-07，也不是 Codex/Claude 缺少 schema。

## 2. Direct layered runtime

| Dimension | Codex `config/read` | Claude `get_settings` | Qwen daemon readers |
| --- | --- | --- | --- |
| Effective value | `config` | `effective` + `applied` | settings row `values.effective` |
| Direct source | per-key `origins` + full `layers` | ordered `sources` with raw values | user/workspace raw values；System 只由 unique sentinel bounded attribution |
| Observed precedence | sessionFlags > nested project > root project > user | local > project > user | System > trusted Workspace > User > SystemDefaults |
| Trust gate | untrusted project layers returned with `disabledReason` but excluded | print/control probe 未测 interactive trust | untrusted workspace raw value returned but excluded from effective merge |
| Native Local | none | yes | none |
| Managed/System conflict | not materialized | not materialized | redirected System directly materialized |

这张表描述 exact entry，不是三产品完整配置模型。尤其不能把 Codex nested Project 或
Qwen SystemDefaults 改名为 Local，也不能把 Claude 未测的 managed tier 当成不存在。

## 3. Pairwise deltas

| Pair | Phase 2A | Phase 2D | Why not Equivalent |
| --- | --- | --- | --- |
| Codex–Claude | `Not assessed` | `Partial overlap` | 都直接给 final value/source，但 taxonomy、Surface、trust 和 managed coverage 不同 |
| Codex–Qwen | `Not assessed` | `Partial overlap` | 都直接观察 project/workspace trust gate；Qwen 不提供通用 System source explanation |
| Claude–Qwen | `Not assessed` | `Partial overlap` | 都给 selected effective/raw layer values；Claude trust 未测，Qwen 无 Local |

这些是 additive runtime delta，不原地改写 Phase 2A frozen records。`Partial overlap`
只绑定本 fixture 的 harmless scalar 和 exact reader；object/array merge、unknown item
explanation、reload 与 write API 不在本轮。

## 4. Qwen engineering reading

Qwen 已有可复用的分层 merge 与 trust suppression，不是“缺少 layered config”。
更准确的产品机会是：

> `/workspace/settings` 能展示 effective、user、workspace，但当 effective 值来自
> System/SystemDefaults 时没有通用 provenance 字段；调用方只能结合 fixture 或实现
> 知识推断。

是否增加只读 explain/provenance 输出应在阶段 4 结合真实 support case 判断，不能仅因
Codex/Claude 暴露 source 就直接建设。另一个独立问题仍是 Phase 2C 的
loader→consumer validation consistency；schema identity 本身没有消除该风险。

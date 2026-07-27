# Phase 2D：Config Identity 与 Layering 结果

> 状态：Frozen  
> Frozen at：2026-07-26T14:55:55.508Z  
> Raw artifact SHA-256：`dc74e8fd2a4caa06cac8481743bb6e1fdb76c403b21229673fce1ef29f3b3187`

## 1. Result summary

| Metric | Result |
| --- | --- |
| Runtime executions | `8/8 Pass` |
| Schema mechanism records | `3/3` |
| Layered scenarios | Codex `3` / Claude `2` / Qwen `2` |
| Fixture preservation / process cleanup | `8/8 Pass` |
| Timeout / signal / truncated output / spawn error | `0` |
| Credential reads / provider-model calls / model cost | `0 / 0 / 0` |
| Product source files modified | `0` |

## 2. Closed items

### `R1-1b`

已关闭“schema identity/version mechanism”证据缺口：

- Codex：versionless generated schema，以 exact tag/path/hash 标识；
- Claude：versionless split editor/runtime mechanism，精确等价仍 `Unknown`；
- Qwen：`$version:4`，migration boundary 明确。

它不改变 Phase 2C 的 pairwise validation 结论。

### `R1-2`

已关闭 selected entry/fixture 下的：

- effective value；
- direct source 或 unique-sentinel bounded provenance；
- selected precedence；
- Codex project 与 Qwen workspace trust suppression；
- empty/non-empty source projection；
- raw fixture preservation 和 cleanup。

`CAP-12.09-A01` 三组 pairwise delta 均为 `Partial overlap`，不是 Equivalent。完整
managed/system/local taxonomy、object/array merge、unknown explanation 和 interactive
trust 仍在边界外。

## 3. Qwen-specific result

Qwen `0.21.0` 的 loader 不是简单的 “project overrides user”：

```text
System > trusted Workspace > User > SystemDefaults
```

当 workspace 被显式 `DO_NOT_TRUST` 时，daemon 仍返回 raw workspace value，但
effective merge 排除该值，`/workspace/trust` 与 `/capabilities` 也同步为 untrusted。

当前可行动的候选不是重做 merge，而是评估是否需要通用 provenance/explain 输出。
这是阶段 4 的产品判断输入，不是已确认 Gap 或实现授权。

## 4. Remaining Stage 3 backlog

| Order | Probe | State |
| --- | --- | --- |
| `R1-3` | diagnostic fault matrix | Next；执行可安全归因的 Codex/Qwen cells，Claude 与不可同构 cells 保持 Not assessed |
| `R2-1` | argv/stdin success | Deferred pending scoped authorization/fake provider |
| `R2-2` | event/final JSON success | Deferred pending scoped authorization/fake provider |
| `R2-3` | legal output schema | Deferred pending scoped authorization/fake provider |
| `R2-4` | machine provider error taxonomy | Deferred pending scoped authorization/fake provider |

Phase 2D gate 通过，下一步进入 Phase 2E `R1-3`。普通继续仍不授权 R2。

复核命令：

```bash
node .qwen/research/codex-claude-qwen/scripts/validate-phase-2d.mjs
```

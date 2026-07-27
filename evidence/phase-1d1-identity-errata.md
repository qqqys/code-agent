# Phase 1D.1 Evidence Identity Errata

> 阶段：1D.1 · Registry / Claim Correction  
> 状态：Frozen  
> Frozen at：2026-07-26T07:51:04Z  
> Correction ID：`ERR-P1D1-QWEN-CHANNEL-001`  
> Product/version：Qwen Code `0.21.0`  
> Projection scope：`claims/phase-1d1/` only

## 1. Correction

[`00-scope-and-version-lock.md`](../00-scope-and-version-lock.md) 将 Qwen Code
`0.21.0` 锁定为 npm `latest` 指向的非 prerelease 发行。Phase 1B、1C.2 与 1D 的
冻结 Fact/Evidence/Claim 文件误把同一 artifact、release commit 与 Surface 记作
`stable`。

历史文件保持字节不变。Phase 1D.1 current projection 读取下列记录时，将
`release_channel` 的 recorded value `stable` 解释为 effective value `latest`：

```yaml
erratum_id: ERR-P1D1-QWEN-CHANNEL-001
applies_to: phase-1d1-current
field: release_channel
recorded_value: stable
effective_value: latest
basis: 00-scope-and-version-lock.md Qwen 0.21.0 npm latest lock
identity_preserved: true
evidence_ids:
  - EVD-qwen-code-HELP-005
  - EVD-qwen-code-DOC-018
  - EVD-qwen-code-DOC-028
  - EVD-qwen-code-DOC-043
  - EVD-qwen-code-DOC-044
  - EVD-qwen-code-SOURCE-009
  - EVD-qwen-code-RUNTIME-001
  - EVD-qwen-code-RUNTIME-002
fact_ids:
  - FACT-qwen-code-004
  - FACT-qwen-code-042
  - FACT-qwen-code-050
  - FACT-qwen-code-052
  - FACT-qwen-code-053
immutable_fields:
  - record_id
  - product
  - version
  - surface
  - source
  - captured_at
  - artifact_hash_or_observation
  - relations
```

| Record type | Record ID                   | Frozen source                                                          |
| ----------- | --------------------------- | ---------------------------------------------------------------------- |
| Evidence    | `EVD-qwen-code-HELP-005`    | [`qwen-code.md`](./qwen-code.md)                                       |
| Evidence    | `EVD-qwen-code-DOC-018`     | [`qwen-code.md`](./qwen-code.md)                                       |
| Evidence    | `EVD-qwen-code-DOC-028`     | [`qwen-code.md`](./qwen-code.md)                                       |
| Evidence    | `EVD-qwen-code-DOC-043`     | [`qwen-code.md`](./qwen-code.md)                                       |
| Evidence    | `EVD-qwen-code-DOC-044`     | [`phase-1c2-secondary-surfaces.md`](./phase-1c2-secondary-surfaces.md) |
| Evidence    | `EVD-qwen-code-SOURCE-009`  | [`phase-1c2-secondary-surfaces.md`](./phase-1c2-secondary-surfaces.md) |
| Evidence    | `EVD-qwen-code-RUNTIME-001` | [`phase-1d-runtime-probes.md`](./phase-1d-runtime-probes.md)           |
| Evidence    | `EVD-qwen-code-RUNTIME-002` | [`phase-1d-runtime-probes.md`](./phase-1d-runtime-probes.md)           |
| Fact        | `FACT-qwen-code-004`        | [`qwen-code.md`](../facts/qwen-code.md)                                |
| Fact        | `FACT-qwen-code-042`        | [`qwen-code.md`](../facts/qwen-code.md)                                |
| Fact        | `FACT-qwen-code-050`        | [`qwen-code.md`](../facts/qwen-code.md)                                |
| Fact        | `FACT-qwen-code-052`        | [`qwen-code.md`](../facts/qwen-code.md)                                |
| Fact        | `FACT-qwen-code-053`        | [`qwen-code.md`](../facts/qwen-code.md)                                |

## 2. Projection Invariants

- Current Qwen Slice Registry rows and document header use `latest`.
- This erratum changes only effective `release_channel`; `last_checked` may advance when the
  current projection is regenerated.
- Version, Surface, platform, gates, Claim statement, Assessment, contract, Evidence set,
  relation type/note and artifact identity remain unchanged unless another explicit migration
  in Phase 1D.1 says otherwise.
- Existing Claim IDs remain valid because the correction refers to the same observed
  `0.21.0` artifact/commit/Surface, not to a second channel observation.
- A future observation from an actual distinct `stable` channel must use a separate Slice and
  Claim; this erratum cannot normalize arbitrary Qwen versions or Evidence IDs.
- Raw Phase 1B, Phase 1C.2 and Phase 1D files remain immutable and continue to show the recorded
  value for historical reproducibility.

## 3. Review Gate

| Gate                                                              | Result |
| ----------------------------------------------------------------- | ------ |
| Erratum applies only to the 8 Evidence IDs and 5 Fact IDs above   | Pass   |
| Current Qwen Claim/Slice channel is `latest`                      | Pass   |
| Frozen historical files are not rewritten                         | Pass   |
| No behavior, support state, contract or relation is changed by it | Pass   |

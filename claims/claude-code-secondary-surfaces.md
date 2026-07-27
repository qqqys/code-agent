# Claude Code Secondary Surfaces：Phase 1C.2 Claim Records

> 正式 Claim：0  
> 版本：blocked  
> Channel：blocked  
> Surface：none  
> Claim last_checked：2026-07-26T04:55:00Z

本文沿用 Phase 1C.1 的关系型 Claim 投影。这里的 `supports` 只表示 Evidence 直接支持当前有界陈述；Atomic 的完整可观察结果是否闭合，仍以 `support_state` 为准。

## 1. Slice Registry

| Slice ID | Product | Version | Channel | Surface | OS  | Arch | Shell | Terminal | Isolation | Authentication | Entitlement | Region | Provider | Model | Configuration | Feature flags |
| -------- | ------- | ------- | ------- | ------- | --- | ---- | ----- | -------- | --------- | -------------- | ----------- | ------ | -------- | ----- | ------------- | ------------- |

## 2. Claim Core

当前没有可绑定 exact secondary Surface build/package/commit 的正式 Claim。候选项全部保留在 [`09-phase-1c2-coverage-and-open-claims.md`](../09-phase-1c2-coverage-and-open-claims.md) 的 Blocked Register。

## 3. Behavior Contract Matrix

编码沿用 [`06-phase-1c-claim-normalization.md`](../06-phase-1c-claim-normalization.md)：`R[value]`、`CN`、`U`、`NC`、`NA`。Registry 未要求的叶为 `NA`；已要求但当前证据未调查的叶为 `NC`。

| Claim ID | EP  | IN  | AD  | AG  | SX  | SO  | PE  | OH  | RM  | CE  | CC  | CL  | FS  | EB  | SB  | OB  |
| -------- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

## 4. Evidence Relation Extension

一行列出多个 Claim ID 时，规范化展开后等价于逐 Claim 的独立 `record_relations`。

| Evidence ID | Relation | Claim ID(s) | Note |
| ----------- | -------- | ----------- | ---- |

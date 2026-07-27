# Phase 2A Comparison Cohort Identity Errata

> 阶段：2A · Evidence-bounded Cross-product Comparison  
> 状态：Frozen  
> Frozen at：2026-07-26T08:24:57Z  
> Correction ID：`ERR-P2A-QWEN-CLI-CHANNEL-001`  
> Product/version：Qwen Code `0.21.0`  
> Projection scope：Phase 2A comparison outputs only

## 1. Correction

[`00-scope-and-version-lock.md`](../00-scope-and-version-lock.md) 将 Qwen Code
`0.21.0` 锁定为 npm `latest` 指向的非 prerelease artifact。冻结的 Phase 1C.1
CLI Claim 文件把同一 artifact 的六个 CLI Slice 记作 `stable`。

Phase 2A 不改写历史 Claim。读取下列六个 Slice 时，只把
`release_channel=stable` 投影为 effective `latest`：

```yaml
erratum_id: ERR-P2A-QWEN-CLI-CHANNEL-001
applies_to: phase-2a-comparison-only
source_file: claims/qwen-code-cli.md
source_sha256: 7702ca8695e6c52e8bed735bfd94398ac969563f1290d3a7064bfdf4bbb56d7a
expected_claim_count: 209
field: release_channel
recorded_value: stable
effective_value: latest
identity_preserved: true
slice_ids:
  - QWN-0210-CLI-NA-UNKNOWN
  - QWN-0210-CLI-NA-TTY
  - QWN-0210-CLI-NA-NONTTY
  - QWN-0210-CLI-SEATBELT-NA
  - QWN-0210-CLI-DOCKER-NA
  - QWN-0210-CLI-PODMAN-NA
immutable_fields:
  - claim_id
  - atomic_capability_id
  - slice_id
  - product
  - version
  - surface
  - platform
  - environment
  - statement
  - assessment
  - evidence_ids
  - relations
  - contract
```

## 2. Boundary

- 本 erratum 只消费已经由 Phase 1C.1 validator 闭合的 Claim projection，不重写
  原始 Fact 或 Evidence Record。
- 六个 Slice 必须全部为 Qwen Code `0.21.0 / stable / cli`，且 209 条 Claim
  必须全部引用其中之一；否则 correction 失效。
- Phase 1D.1 secondary Claim 继续使用
  [`ERR-P1D1-QWEN-CHANNEL-001`](./phase-1d1-identity-errata.md)，不由本记录重复修正。
- Comparison 文档可以显示 effective `latest`，但引用历史 Claim 时仍保留其原始
  Slice ID。
- 新版本、不同 artifact 或真实独立 channel observation 必须建立新 Slice，不能
  复用本 erratum。

## 3. Review Gate

| Gate                                                      | Result |
| --------------------------------------------------------- | ------ |
| Source file hash 与 209 Claim inventory 锁定              | Pass   |
| Correction 只覆盖六个 exact CLI Slice                     | Pass   |
| Recorded historical channel 保持字节不变                  | Pass   |
| 除 effective channel 外没有修改 Claim identity 或行为字段 | Pass   |

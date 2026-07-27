# Codex / Claude Code / Qwen Code 对比：阶段 1D.1 Claim 规范化

> 阶段：1D.1 · Registry / Claim Correction  
> 状态：Frozen  
> Frozen at：2026-07-26T07:51:04Z  
> Registry：Revision 2  
> Evidence boundary：2026-07-26T05:23:52Z

## 1. 输出模型

Phase 1D.1 生成一份完整 current secondary-surface Claim 快照，不生成需要消费者自行
合并的 delta：

- [`claims/phase-1d1/codex-secondary-surfaces.md`](./claims/phase-1d1/codex-secondary-surfaces.md)
- [`claims/phase-1d1/claude-code-secondary-surfaces.md`](./claims/phase-1d1/claude-code-secondary-surfaces.md)
- [`claims/phase-1d1/qwen-code-secondary-surfaces.md`](./claims/phase-1d1/qwen-code-secondary-surfaces.md)

快照以 Phase 1C.2 的 30 条 Claim 为历史基线，应用 Registry Revision 2 migration，
再吸收 Phase 1D 的 6 条 Evidence。Phase 1C.2 文件继续保留，不被生成器写入；
current projection 通过新增 Claim 表达不同 containment gate，不覆盖历史 Slice。

## 2. Claim Identity

- 29 个仍表达同一 Atomic 与完整 gate 身份的 Phase 1C.2 Claim 保留 ID、host
  Slice、Assessment 与既有 relation；Qwen Slice 的 channel 只应用第 3 节所述
  metadata erratum。
- Codex `CCQ-codex-CAP-10.08-A01-001` 不在 current projection 中；初始化语义使用
  同一 host Slice 的新 ID `CCQ-codex-CAP-10.08-A05-001`。
- Qwen `CCQ-qwen-code-CAP-10.08-A01-001` 保留为 bilateral negotiation 的 scoped
  negative；contract 中 descriptor-only 的 EP/EB 文本迁出 A01，改为明确的
  bilateral-negative boundary。
- 本轮另建 8 个 contained Claim：Codex 3 个，Qwen 5 个。它们与 host Claim 的
  isolation、authentication、configuration 或 feature gate 不同，不能复用旧 ID。
- `superseded_by` 不属于 Claim schema；历史替换关系只记录在 Revision 2 migration
  ledger。

## 3. Release-channel Metadata Erratum

Phase 1C.2 与 Phase 1D 把 Qwen Code `0.21.0` 的同一 artifact/commit/Surface
误记为 `stable`，而版本锁定的实际 npm channel 是 `latest`。本阶段使用
[`ERR-P1D1-QWEN-CHANNEL-001`](./evidence/phase-1d1-identity-errata.md)：

```yaml
erratum_id: ERR-P1D1-QWEN-CHANNEL-001
applies_to: phase-1d1-current
field: release_channel
recorded_value: stable
effective_value: latest
identity_preserved: true
```

它只对清单中的 8 个 Evidence 与 5 个 Origin Fact 生效；历史文件保持字节不变。
current Qwen header 与三个 Slice
`QWN-0210-DAEMON-DARWIN-ARM64-NONTTY`、
`QWN-0210-DAEMON-CONTAINED-DARWIN-ARM64-NONTTY`、
`QWN-0210-IM-BOT-TAGGED-DOCS` 统一使用 `latest`。

这是同一观察身份的 metadata 勘误，不是 stable/latest 行为 delta，因此既有 Claim
ID 可保留。除 channel、current `last_checked` 与第 4 节逐条列明的 Phase 1D
Evidence/relation 增量外，旧 Claim 的 Atomic、statement、contract、Assessment、
Evidence、relation、version、Surface 与其他 Slice 字段必须逐字段不变。其中
`EVD-codex-SOURCE-003` 对两个稳定 Codex Claim 的 additive relation 是显式例外；
另一个独立例外是 Registry Revision 2 明确要求的 Qwen A01 bilateral-negative
contract boundary correction。未来若出现真实独立的 stable artifact 或行为差异，
必须新建 Slice 与 Claim，不能复用本 erratum。

## 4. Phase 1D Evidence Relations

下表是相对 Phase 1C.2 的 13 条 relation 增量。`supports` 直接证明有界 Claim
陈述，`qualifies` 只增加边界，不能单独提升 support state。

| Evidence                    | Relation    | Claim                             | Bounded role                                                                          |
| --------------------------- | ----------- | --------------------------------- | ------------------------------------------------------------------------------------- |
| `EVD-qwen-code-RUNTIME-001` | `supports`  | `CCQ-qwen-code-CAP-10.07-A01-002` | 复现 listener、多次 management 请求与正常 drain，但没有 task/session                  |
| `EVD-qwen-code-RUNTIME-001` | `supports`  | `CCQ-qwen-code-CAP-10.08-A04-001` | exact `/capabilities` 返回机器可读 versioned descriptor                               |
| `EVD-qwen-code-RUNTIME-001` | `supports`  | `CCQ-qwen-code-CAP-12.05-A01-002` | 区分 live、bootstrap degraded、ready 与 stopped unavailable                           |
| `EVD-qwen-code-RUNTIME-002` | `supports`  | `CCQ-qwen-code-CAP-12.02-A02-002` | 定位并读取关联 PID/run/workspace/error 的持久日志                                     |
| `EVD-qwen-code-RUNTIME-002` | `supports`  | `CCQ-qwen-code-CAP-12.07-A03-002` | 复现 graceful parent/listener cleanup；不外推 crash 或 child cleanup                  |
| `EVD-codex-RUNTIME-004`     | `supports`  | `CCQ-codex-CAP-10.07-A01-003`     | app-server 在协议输出前因 Codex Home state bootstrap 失败                             |
| `EVD-codex-RUNTIME-004`     | `qualifies` | `CCQ-codex-CAP-10.08-A05-002`     | 无 protocol output；server 是否读取 unknown request 未证明；initialize 未发送且未测试 |
| `EVD-codex-RUNTIME-005`     | `supports`  | `CCQ-codex-CAP-10.07-A01-004`     | MCP server 在协议输出前因 config read 失败                                            |
| `EVD-codex-SOURCE-002`      | `supports`  | `CCQ-codex-CAP-10.08-A05-001`     | exact commit 直接约束 host Claim 的 clientInfo 与 response schema                     |
| `EVD-codex-SOURCE-002`      | `supports`  | `CCQ-codex-CAP-10.08-A05-002`     | exact source 直接支持静态 client metadata 与 response shape                           |
| `EVD-codex-SOURCE-003`      | `supports`  | `CCQ-codex-CAP-07.04-A01-001`     | exact commit 静态构造 `codex` / `codex-reply` inventory                               |
| `EVD-codex-SOURCE-003`      | `qualifies` | `CCQ-codex-CAP-07.04-A02-001`     | unknown-tool source path 不等于 runtime tool call                                     |
| `EVD-qwen-code-DOC-044`     | `supports`  | `CCQ-qwen-code-CAP-10.08-A04-001` | exact tagged docs 将 discovery 与未来 negotiation 分开                                |

新 Evidence 自身仍是 immutable Record；formal reverse link 由 current Claim 文件的
Evidence Relation Extension 提供。

## 5. Support-State Delta

| Product / Claim                         | Phase 1C.2 / host                    | Phase 1D.1 contained or migrated host | Basis                                                                                   |
| --------------------------------------- | ------------------------------------ | ------------------------------------- | --------------------------------------------------------------------------------------- |
| Qwen `CAP-10.07-A01-001` / `-002`       | host `Unknown / Not tested`          | contained `Unknown / Reproduced`      | 只复现 listener 与 management 请求；没有 task/session，不足以提升 support state         |
| Qwen `CAP-10.08-A01-001`                | host `Not supported / Not tested`    | host 不变                             | exact docs 的 bilateral negative 不被 descriptor runtime 覆盖                           |
| Qwen `CAP-10.08-A04-001`                | 不存在                               | contained `Partial / Reproduced`      | exact runtime + tagged docs 闭合成功 descriptor；该 route 自身的拒绝与失败路径未运行    |
| Qwen `CAP-12.02-A02-001` / `-002`       | host `Unknown / Not tested`          | contained `Supported / Reproduced`    | current-run log path、PID/run/workspace/error 内容和持久文件直接复现；置信度保持 Medium |
| Qwen `CAP-12.05-A01-001` / `-002`       | host `Unknown / Not tested`          | contained `Supported / Reproduced`    | liveness/readiness/degraded/unavailable 四类结果直接复现                                |
| Qwen `CAP-12.07-A03-001` / `-002`       | host `Unknown / Not tested`          | contained `Partial / Reproduced`      | graceful parent/listener cleanup 已复现；crash、child、legacy resource 未复现           |
| Codex app `CAP-10.07-A01-001` / `-003`  | host `Unknown / Reproduced`          | contained `Unknown / Not reproduced`  | schema generation 不等于 task service startup；contained startup 在 output 前失败       |
| Codex MCP `CAP-10.07-A01-002` / `-004`  | host `Unknown / Not tested`          | contained `Unknown / Not reproduced`  | contained config bootstrap 在 protocol output 前失败                                    |
| Codex `A01-001` → host `A05-001`        | host `Unknown / Reproduced`          | host `Unknown / Reproduced`           | schema/source 只证明 initialize shape；Atomic 身份迁移不改写 runtime 事实               |
| Codex host `A05-001` / contained `-002` | migrated host `Unknown / Reproduced` | contained `Unknown / Not tested`      | probe 未发送 initialize；startup block 只能限定前置，不能写成 initialize 未复现         |

Qwen A04 保持 `Partial`：成功 descriptor outcome 已闭合，但 Registry 同时要求的
failure/security contract 尚未直接覆盖。`/capabilities` 自身的 missing/wrong
bearer、malformed request 与 unavailable failure matrix 未运行；不能把 `/health`
和 unknown route 的拒绝结果跨 route 复制到 A04。

## 6. Containment 与 Environment Delta

- Qwen runtime Claim 只适用于固定 non-secret bearer、controlled Qwen roots、
  loopback、non-TTY HTTP bridge 与 ACP preheat disabled 的测试切片。
- `VITEST_WORKER_ID` 只作为 frozen artifact 的 test escape 关闭 ACP preheat；任何
  session、SSE、MCP、provider、model 或 task-ready Claim 都不能复用该 Evidence。
- Codex app/MCP 的 `Not reproduced` 是 deny-default containment 下的结果，不是正常
  Codex Home 的产品级不可用结论。
- Codex A05 contained Claim 的 initialize 为 `Not tested`；harness 写入
  pre-initialize unknown request 不证明 server 已读取、解析或处理消息。
- SOURCE Evidence 与 frozen binary 只有 commit/version/string consistency，没有
  reproducible-build 同一性，因此不升级为 runtime result。

## 7. Generator Contract

[`scripts/generate-phase-1d1-claims.mjs`](./scripts/generate-phase-1d1-claims.mjs)
必须：

1. 只读构建 Phase 1C.2 baseline；
2. 应用显式 ID migration 和 support/contract allowlist；
3. 默认执行 drift check，只有 `--write` 写入 `claims/phase-1d1/`；
4. 拒绝向 Phase 1C.2 的三份历史 Claim 文件写入；
5. 在写入前复验 Phase 1C.2 generator 与全部 frozen hash；
6. 输出确定性 Markdown，并保持 formatter idempotency。

[`scripts/validate-phase-1d1.mjs`](./scripts/validate-phase-1d1.mjs) 独立解析
Registry、Claim、Fact、Evidence、erratum、relation、coverage 与本地链接，不把
generator 的内存对象当作验证真值。它还必须校验 Registry 全文件 hash、topic/Atomic
连续性、受控 dimensions、Slice 全字段、Assessment 精确键/枚举、relation note 与
唯一性，以及 historical/current 的允许变更集合。

## 8. Review Gate

| Gate                                                                                          | Result |
| --------------------------------------------------------------------------------------------- | ------ |
| current snapshot 为 38 Claims / 75 Evidence Relations / 499 required contract leaves          | Pass   |
| 产品分布为 Codex 11 / Claude Code 0 / Qwen Code 27                                            | Pass   |
| 29 个稳定 ID 保留同一 gate 身份；Qwen 只应用 channel erratum 与 A01 exact boundary correction | Pass   |
| 1 个历史 ID 因 Registry A01→A05 语义迁移被取代                                                | Pass   |
| 8 个不同 containment gate 的 runtime Claim 使用新 ID                                          | Pass   |
| 历史 Qwen recorded channel 保持 `stable`，current effective channel 为 `latest`               | Pass   |
| Codex containment 结果保持 `support_state=Unknown`                                            | Pass   |
| Phase 1C.2 的 30 Claims / 62 relations 仍可独立复验                                           | Pass   |
| 未创建横向 parity、Gap、产品优先级或 roadmap 结论                                             | Pass   |

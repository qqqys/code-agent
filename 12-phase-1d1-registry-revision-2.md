# Codex / Claude Code / Qwen Code 对比：Registry Revision 2

> 阶段：1D.1 · Registry / Claim Correction  
> 状态：Frozen  
> Frozen at：2026-07-26T07:51:04Z  
> Registry：Revision 2，144 topics / 550 Atomic Capability Records

## 1. 修订原因

Revision 1 的 `CAP-10.08-A01` 用“双向交换版本与能力”定义连接协商，但阶段 1C.2
曾把两种更窄的行为映射到该 ID：

- Codex app-server 的 client `initialize` schema；
- Qwen daemon 的单向 `/capabilities` descriptor discovery。

这两种行为都不等于双方选出共同兼容集。继续共用 A01 会把“存在初始化方法”、
“能读取服务端 descriptor”与“完成双向协商”混成一个支持状态。Revision 2 因此只
做 product-neutral 语义拆分，不根据任一产品命令命名能力。

## 2. Revision 2 原子能力

| Atomic ID       | Canonical user job                   | Observable outcome                                                                                                                        | Revision 2 disposition                              |
| --------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `CAP-10.08-A01` | 在连接建立时协商协议和客户端能力     | 双方交换版本与能力；不兼容组合被拒绝或显式降级                                                                                            | 保留既有 ID、job 与 outcome；边界收窄为双向共同结果 |
| `CAP-10.08-A04` | 发现对端公开的协议版本和能力清单     | 请求成功时返回可归因于目标服务实例的版本化 descriptor，至少包含协议身份和能力清单；响应可机器解析，且读取结果不表示双方已选择共同兼容集   | Revision 2 新增                                     |
| `CAP-10.08-A05` | 在连接建立时声明客户端身份和可选能力 | 客户端提交协议要求的身份元数据及可选版本/能力声明后，服务端返回可关联的接受结果或明确拒绝；缺失、非法或重复初始化不会静默进入已初始化状态 | Revision 2 新增                                     |

三条记录都要求
`ENTRY, INPUT, AVAIL, STATE, OUTPUT, MODES, FAIL, EXT, SEC, OBS`。规范文本、revision
metadata、scope boundaries 与 cross references 以
[`03-atomic-capability-registry.md`](./03-atomic-capability-registry.md) 为唯一来源。

## 3. 稳定 ID 与迁移规则

- `CAP-10.08-A01` 不重编号，也不改成 descriptor discovery；它继续表示 bilateral
  negotiation。
- 既有 `CAP-10.08-A02` 的 client/session ownership 和 `A03` 的 reconnect
  语义不变。
- 单向 server descriptor 迁移到 `A04`。
- client identity/version/capabilities initialization 迁移到 `A05`。
- 事件 schema 版本仍归 `CAP-10.04-A03`，离线兼容检查仍归
  `CAP-12.05-A03`。

## 4. Product Claim Migration

| Product     | Phase 1C.2 history                | Phase 1D.1 current projection                                                                | Reason                                                                                |
| ----------- | --------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Codex       | `CCQ-codex-CAP-10.08-A01-001`     | 由同一 host Slice 的 `CCQ-codex-CAP-10.08-A05-001` 取代；旧记录只保留在冻结历史              | schema 与 exact source 证明 client initialization shape，不证明 bilateral negotiation |
| Claude Code | 无对应 secondary Claim            | 无变化                                                                                       | 没有 exact secondary artifact/runtime Evidence，不能为迁移补造 Claim                  |
| Qwen Code   | `CCQ-qwen-code-CAP-10.08-A01-001` | 原 ID 保留，继续表示 exact scoped bilateral negative；新增 `CCQ-qwen-code-CAP-10.08-A04-001` | tagged docs 把 negotiation 列为未来工作；runtime 直接复现单向 descriptor              |

Codex 没有由“initialize response 不含 server capabilities”推导出的 A01
`Not supported`。字段缺失不是完整负向协议实验，也不能证明所有 transport 或后续
版本均无协商。

Runtime containment 不通过复用 ID 覆盖 host Slice。Phase 1C.2 中其余 29 个 Claim
继续保留原 ID、Atomic 与 gate 身份；Qwen channel 仅应用
[`ERR-P1D1-QWEN-CHANNEL-001`](./evidence/phase-1d1-identity-errata.md)
所述 metadata 勘误。本轮为不同 isolation、authentication、configuration 或
feature gate 的探针新建 contained Claim：

- Codex app-server startup、MCP startup，以及 contained startup block 下仅由
  source 支持的 client-initialization shape；
- Qwen management-route lifecycle、descriptor、log、health 与 graceful cleanup。

因此 Registry 的 A01→A05 是一次 Atomic 语义迁移；host→contained 则是新增 Slice，
两者不能混为同一种 ID 变更。

## 5. 历史快照边界

Phase 1C.2 的三份 Claim 文件、Evidence ledger、规范化说明和 coverage 文档保持
冻结，仍代表 Registry Revision 1 下的 `30 Claims / 62 relations`。Revision 2
不原地改写这些历史文件。

Phase 1D.1 的 current projection 独立生成到
[`claims/phase-1d1/`](./claims/phase-1d1/)，消费者不需要在读取时自行应用 delta。
迁移账本只解释身份变化，不充当额外 Claim schema 字段。

## 6. Review Gate

| Gate                                                                          | Result |
| ----------------------------------------------------------------------------- | ------ |
| Revision 原因是 product-neutral user job 粒度，而非产品命令差异               | Pass   |
| A01/A02/A03 的既有 ID 未被重新编号                                            | Pass   |
| A01 job/outcome 保持稳定，Phase 1C.2 generator 仍可复验                       | Pass   |
| 新增记录只为 A04/A05，派生计数为 144 / 550                                    | Pass   |
| 三产品既有 Claim 均有明确 migration/no-op disposition                         | Pass   |
| host Claim 未被 contained runtime Slice 复用同一 ID 覆盖                      | Pass   |
| Qwen channel 勘误不改写冻结历史或行为 Claim                                   | Pass   |
| 没有把 descriptor、initialize 或 MCP protocol echo 写成 bilateral negotiation | Pass   |

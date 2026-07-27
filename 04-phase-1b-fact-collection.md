# Codex / Claude Code / Qwen Code 对比：阶段 1B 事实采集

> 阶段：1B · Product Fact Discovery  
> Registry：Revision 1，冻结于 `2026-07-25T14:08:12Z`  
> 采集平台：Darwin arm64  
> 采集窗口：`2026-07-25T14:28:40Z` ～ `2026-07-25T15:41:19Z`  
> Review Gate：通过

## 1. 本阶段目标

阶段 1B 为三款产品分别建立版本化的事实画像、Product Alias Record 和 Evidence
Ledger。所有发现先映射到同一份
[统一原子能力注册表](./03-atomic-capability-registry.md)，但本阶段不创建跨产品
Comparison、Gap、优先级或路线图。

阶段 1B 采用 breadth-first 发现方式，回答：

- 冻结发行物实际公开了哪些命令、参数、配置或实现 Surface？
- 官方资料对这些 Surface 承诺了什么？
- 已发现事实可能支撑哪些 Atomic Capability？
- 哪些区域仍需要认证环境、交互探测或更强的实现证据？

本阶段的“覆盖”只表示某个能力域已有可复核事实，不表示该域的全部 Atomic
Capability 已完成支持判定。

## 2. 产物

### 2.1 产品事实画像

- [Codex](./facts/codex.md)
- [Claude Code](./facts/claude-code.md)
- [Qwen Code](./facts/qwen-code.md)

### 2.2 产品证据账本

- [Codex Evidence](./evidence/codex.md)
- [Claude Code Evidence](./evidence/claude-code.md)
- [Qwen Code Evidence](./evidence/qwen-code.md)

### 2.3 汇总

- [覆盖度与开放问题](./05-phase-1b-coverage-and-open-questions.md)

## 3. 冻结发行物复核

| 产品切片 | 本阶段读取的发行物 | 发行物 SHA-256 | 运行身份 |
| --- | --- | --- | --- |
| Codex CLI `0.145.0` | npm Darwin arm64 artifact 中的 native binary | `1da3f4e0e96028b8a771814293c3033dafd1971f943f6c7e79b0897fe705f590` | `codex-cli 0.145.0` |
| Claude Code stable `2.1.212` | `@anthropic-ai/claude-code-darwin-arm64` native binary | `09ecba2ab2df9b6ee5b0695e26f65dea60fb3b6af3d3542ee09f466838d1e574` | `2.1.212 (Claude Code)` |
| Qwen Code `0.21.0` | `@qwen-code/qwen-code` ESM / Node 发行包 | tarball：`62fa5ea404a8d1f694edc54446bbd4ca6d3a69e090ec5975977ff51918d2aeca` | `0.21.0` |

Claude Code 的 binary hash 与冻结版本的官方 native manifest 一致。Codex 与 Qwen
发行身份沿用[范围与版本锁](./00-scope-and-version-lock.md)中的 registry、release
和 integrity 证据。

当前 dirty checkout 只用于承载研究文档；Qwen 事实只能来自 `0.21.0` 发行包、
对应 release/tag 或明确标注的官方资料。未提交源码不属于本阶段证据。

## 4. 记录边界

产品事实画像使用两类记录：

1. **Product Alias Record**：遵循[研究方法](./01-methodology.md)第 2.2 节，记录
   产品命令、参数、UI 文案、配置键和 API 名称与 Atomic ID 的映射。
2. **Candidate Fact**：版本化、带证据的单产品观察，列出候选 Atomic ID，但不是
   Claim Record，不填写 `support_state` 或跨产品 `alignment_state`。

Candidate Fact 可以在发现阶段关联多个 Atomic ID；阶段 1C 转为正式 Claim 时必须
按“一条 Claim、一个 Atomic ID、一个产品切片”拆开，并完整填写行为契约。

Evidence Ledger 使用[研究方法](./01-methodology.md)第 4.1 节的字段语义。Markdown
表格是展示投影；每条至少保留：

- 唯一 Evidence ID、type、产品、精确版本和 release channel。
- 单一 product surface、官方 URL 或冻结发行物路径。
- `captured_at`、hash / bounded excerpt / 可复现 observation。
- 该证据能证明与不能证明的范围。
- Runtime / Help 探测的命令、退出码、副作用和清理。

三份 Evidence Ledger 的 `Discovery links` 是阶段 1B 的临时发现索引，不是
Evidence Record 的规范 `record_relations` 字段。索引中的 `FACT-*` 只用于把
Candidate Fact 回链到证据，规范化时必须排除；`ALIAS-*` 可按同行关系词转为
`record_relations`，并以同行“可证明范围”作为 bounded note。阶段 1C 创建
`CCQ-*` Claim 后，才为 Claim 写入正式 `record_relations`。这样既保留发现阶段的
双向可查性，也不把临时 Fact ID 冒充 Claim ID。

网页是可变证据；事实画像不得把当前网页内容静默回填到更早版本。只有冻结发行物、
对应版本 changelog 或源码锚点能确定版本适用性时，才将网页事实判为
`Confirmed`；否则必须记录版本限制。

## 5. 负向结论规则

- 文档或源码搜索无结果只记 `not found in tested scope`。
- 未认证、未进入交互 TUI 或缺少套餐时只记 `not tested` / `unknown`。
- 命令、字符串或 schema 的存在只能证明 Surface 存在，不能单独证明正常路径可用。
- 本阶段不创建 `Not supported`，除非官方明确移除/拒绝且对应冻结 runtime 或实现
  边界能够独立确认；即便满足条件，也留到阶段 1C 的正式 Claim Review Gate 判定。

## 6. 阶段 1B Review Gate

完成时必须满足：

- 三份事实画像互不引用对方结论，不包含比较、Gap 或价值判断。
- 每条 Candidate Fact 映射至少一个有效 Atomic ID，并回链至少一条 Evidence。
- Product Alias 与 Evidence ID 在全套文档中唯一。
- Stable、latest、preview 和 dev-only 分开记录。
- 发行物事实、官方承诺、Help、Runtime、Source/Binary 证据不互相冒充。
- 每个适用一级能力域均有事实或明确的未检查说明。
- 需要认证、写操作或外部副作用的路径不在真实用户仓库中盲测。
- 当前 dirty checkout 的源码没有进入 Qwen `0.21.0` 结论。
- 未知项、证据冲突和阶段 1C 所需探测已集中列入覆盖度文档。

# Codex / Claude Code / Qwen Code 对比：阶段 1C Claim 规范化

> 阶段：1C.1 · Primary CLI Claim Normalization  
> 状态：Frozen  
> Frozen at：2026-07-25T21:40:12Z  
> Registry：Revision 1，共 548 个 Atomic Capability  
> 输入：阶段 1B 冻结的 Candidate Facts、Product Aliases 与 Evidence  
> 输出范围：三产品精确版本 CLI Surface；其他 Surface 与未锁版本文档留到 1C.2

## 1. 本阶段目标

阶段 1C.1 把阶段 1B 的多原子 Candidate Fact 拆成正式 Claim。每条 Claim 只允许：

- 一个产品；
- 一个 Atomic Capability；
- 一个精确 version / channel；
- 一个 product surface；
- 一个 platform slice；
- 一个可观察陈述。

本阶段不新增上游事实，不把当前工作树当作 Qwen `0.21.0` 证据，也不创建
Comparison、Gap、优先级或 roadmap。运行证据仍只使用阶段 1B 已记录的只读
version / Help probe；需要认证、模型调用、写文件、联网或外部系统副作用的行为只进入
Runtime Probe Catalog，不在真实用户仓库中执行。

## 2. Cohort 边界

### 2.1 本轮纳入

- Codex `0.145.0/latest/cli` 的 distribution、native CLI、
  interactive/headless CLI 与 CLI command Surface。
- Claude Code `2.1.212/stable/cli` 与 `2.1.220/latest/cli`。`S-CLI-DOC`
  只有在 Candidate Fact 已把适用版本限定到 `2.1.212` 时才可作为 qualifier。
- Qwen Code `0.21.0/stable/cli`；多 Surface inventory 只有在 CLI Evidence 能
  独立闭合单一陈述时才可抽取，本轮 `FACT-qwen-code-003` 因不满足该条件而整体
  deferred。

### 2.2 留到 1C.2

- `ide`
- `desktop`
- `web-cloud`
- `sdk-daemon`
- `ci`
- `im-bot`
- `unversioned-docs@2026-07-25`
- `current-docs@2026-07-25`
- 未固定到 immutable commit 的 Action / CI 文档
- 未冻结真实 package version 的 SDK 文档

混合 Surface Candidate Fact 不整体复制到 CLI。只有 CLI 部分存在直接 Evidence
且可以绑定精确产品版本时才创建 CLI Claim；其余部分进入 deferred register。
Deferred row 是待补版本锁或待进入 1C.2 的工作记录，不是 Claim，不能填写
`support_state`。

## 3. Markdown 规范化投影

Claim schema 保持[研究方法](./01-methodology.md)第 2.3 节不变。为避免在数百条
Claim 中重复完全相同的平台和环境字段，阶段 1C 使用关系型 Markdown 投影：

1. **Slice Registry**：保存产品、version、channel、surface、platform 和
   environment。
2. **Claim Core**：保存 Claim ID、Atomic ID、Slice ID、来源 Fact、用户任务、
   单一陈述、Evidence、状态、限制和 `last_checked`。
3. **Behavior Contract Matrix**：每条 Claim 一行，显式填写全部行为契约叶字段。
4. **Evidence Relation Extension**：为阶段 1B 的 immutable Evidence 补充规范
   `record_relations`；它与原 Evidence 行合并后构成完整 Evidence Record。

共享 Slice 只做字段规范化，不合并 Claim。读取 Claim 时必须展开其 Slice ID，不能把
不同 Slice 的同一 Atomic ID 合并成一个状态。网页采集日期只能出现在 Evidence 或
Deferred row 中，不能进入 Claim 的 `version` 字段。

## 4. Claim ID

```text
CCQ-<product>-<atomic-capability>-<sequence>
```

- `product` 使用 `codex`、`claude-code`、`qwen-code`。
- `atomic-capability` 保留完整 `CAP-xx.yy-Axx`。
- `sequence` 在同一产品、同一 Atomic ID 内从 `001` 连续递增。
- 同一 Candidate Fact 的多个 Atomic ID 必须生成不同 Claim。
- 同一 Atomic ID 若 version、channel、surface 或 platform 不同，必须使用不同
  sequence。

## 5. Behavior Contract 编码

Contract Matrix 必须包含以下全部叶：

| 缩写 | Claim schema 叶              |
| ---- | ---------------------------- |
| `EP` | `entrypoints`                |
| `IN` | `inputs`                     |
| `AD` | `availability.default_state` |
| `AG` | `availability.gates`         |
| `SX` | `side_effects`               |
| `SO` | `state_ownership`            |
| `PE` | `persistence`                |
| `OH` | `outputs_and_history`        |
| `RM` | `runtime_modes`              |
| `CE` | `concurrency.execution`      |
| `CC` | `concurrency.controls`       |
| `CL` | `concurrency.limits`         |
| `FS` | `failure_semantics`          |
| `EB` | `extension_boundaries`       |
| `SB` | `security_boundaries`        |
| `OB` | `observability`              |

单元格编码：

| 编码       | 展开后的 status                    |
| ---------- | ---------------------------------- |
| `R[value]` | `recorded`，方括号中至少一个业务值 |
| `CN`       | `confirmed-none`                   |
| `U`        | `unknown`                          |
| `NC`       | `not-checked`                      |
| `NA`       | `not-applicable`                   |

Registry 中该 Atomic ID 未要求的行为契约字段写 `NA`。已要求但阶段 1B 未调查的字段写
`NC`；只有确实调查后证据不足或冲突才写 `U`。required leaf 只有在证据已判定该
子维度对当前 Atomic 语义确实不适用时才可写 `NA`，且必须由 validator 限定具体例外；
1C.1 唯一例外是 `CAP-01.09-A01` 生命周期分类 Claim 的
`availability.default_state`，因为分类标签本身没有 default-on/off。不能把 `NC`、
`U` 或 `NA` 当成能力负向结论或支持状态的通用绕过。
多 Atomic Fact 不得把整段 observation 的启发式 contract 复制给每个 Atomic；只有
Evidence 和陈述都已收窄到单一 Atomic 时才投影 `R[...]`，否则 required leaf 保持
`NC`。

单 Atomic Fact 也不因关键词命中自动生成业务值。`STATE`、`PERSIST`、`MODES`、
`CONC.execution` 与 `SEC` 的 `R[...]` 必须使用 Claim schema 的受控枚举；自由文本
边界保留在 Claim 陈述、限制或配置中。`unknown`、`not described`、
`not documented`、`not explicitly surfaced` 等证据不足表达统一投影为 `U`，不能
伪装成 `R[...]`。

## 6. 支持状态策略

阶段 1C.1 采用 pre-probe 保守判定：

- `Supported`：当前切片已有直接 runtime 证据，或非行为发行身份由权威 metadata
  与本地 artifact 身份共同确认。
- `Partial`：直接 Evidence 已闭合 Atomic validation criterion 中至少一个可观察
  行为或门禁，但另一个必要 criterion 仍未闭合。
- `Unknown`：Candidate Fact 已是 `Unknown`、存在未消解冲突、只有 binary
  implementation-surface，只有入口/文档/实现可发现性而没有闭合任何可观察
  criterion，或没有任何 `supports` Evidence Relation。
- 本轮不创建 `Not supported`。

`Partial` 不表示产品弱于其他产品，只表示该原子能力在当前证据切片中尚未闭合全部必要
行为契约。仅发现入口、文档承诺、源码分支或测试文件本身不构成 `Partial`。

## 7. Evidence Relation 规则

- Evidence 与 Claim 的 version/channel/surface 一致，且直接证明陈述：
  `supports`。
- Evidence 只补充边界、属于 current docs 对 frozen runtime 的说明、或只提供 binary
  implementation-surface：`qualifies`。
- 版本化 changelog 只有在单 Atomic release statement 直接证明当前 Claim 陈述时才
  `supports`；多 Atomic Fact 中未逐项收窄的 changelog relation 写 `qualifies`。
- Evidence 与 Claim 陈述直接冲突：`contradicts`，同时在 Claim 中填写
  `evidence_conflicts`。
- 每个 Evidence/Claim 对只能有一个 primary relation；只有同一 Evidence 同时支持
  一个有界子陈述、又在另一子陈述上形成已记录的内部冲突时，才允许在 primary
  relation 外额外增加 `contradicts`，并必须写明冲突字段。
- 一个 relation row 可以列出多个 Claim ID，但规范化展开时等价于为每个 Claim
  分别写一条 `record_relations`。
- Claim 的 `evidence_ids` 必须包含 supports、qualifies 和 contradicts 的全部
  Evidence。

## 8. Runtime Probe 分级

| 级别 | 边界                                       | 本阶段动作                                    |
| ---- | ------------------------------------------ | --------------------------------------------- |
| `R0` | version、Help、schema 等无认证只读发现     | 可复用已冻结 Evidence；新增探测仍使用临时目录 |
| `R1` | 只在新建临时 Git repo 内产生本地文件/进程  | 形成可执行方案，留到 probe 执行阶段           |
| `R2` | 需要登录、模型调用或只读外部网络           | 记录 gate、费用和数据边界，不自动读取真实凭据 |
| `R3` | 外部写入、PR/评论/消息、安装扩展、遥测导出 | 未获专项授权不执行                            |
| `R4` | restore、删除、安全逃逸或其他高风险探测    | 单独设计 fixture、备份和人工确认              |

## 9. Review Gate

阶段 1C.1 完成时必须满足：

- 每条 Claim 只含一个有效 Atomic ID 和一个已登记 Slice。
- 每条 Claim 展开后具备完整 Claim schema；所有 Contract 叶都有显式 status。
- Claim、Slice 和 Evidence Relation ID/引用无重复、悬空或反链缺失。
- current docs、frozen stable、latest delta 与不同 Surface 不混写；所有正式 Claim
  的 `version` 均为精确产品版本或 commit。
- `Supported / Partial / Unknown` 均有可复核判定依据。
- Qwen Approval 默认值和 Agent Team 冲突保持 `Unknown`，不被生成逻辑覆盖。
- secondary Surface Candidate Facts 在 deferred register 中可追踪。
- 未创建 Comparison、Gap、优先级或 roadmap。

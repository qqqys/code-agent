# Codex / Claude Code / Qwen Code 对比：研究方法

> 阶段：0 · 方法冻结  
> 依赖：[00-scope-and-version-lock.md](./00-scope-and-version-lock.md)

## 1. 基本原则

1. 先独立建立三款产品的事实画像，再做横向比较，减少用某一产品术语锚定其他产品。
2. 最新冻结发行物是上游实现事实的基线；未校验的旧源码、草稿、README、路线图和本地 dirty 文件都不是当前事实。
3. 比较行为契约，不比较名称和命令数量。
4. 产品事实、实现推断、Qwen 架构映射和产品建议分层书写。
5. 不用单一总分掩盖能力边界；结论必须可追溯到版本化证据。
6. 缺少证据时保留 `未知`，不能把“未搜索到”改写成“不支持”。

## 2. 研究单位与唯一记录规范

最小研究单位是一个原子能力 Claim，而不是一个整页产品功能。
本节是 Atomic Capability、Claim 和字段枚举的唯一规范；能力地图只定义
taxonomy，不复制另一份 schema。

阶段 1 的第一个 Gate 是建立并冻结三款产品共用的原子能力注册表。必须先基于中立
user job 完成一次三方功能发现预扫，统一拆分 `CAP-xx.yy-Axx`，再分别采集三款产品
事实。禁止三份产品画像各自创建同义或不同粒度的原子 ID。

冻结后若发现遗漏，先在注册表中增加变更记录，说明原 schema 为什么无法表达该
user job、受影响的既有 ID 和迁移方式；注册表修订完成后才能新增 Claim。新增能力
不能只因为看到某个产品命令而成立。

### 2.1 Registry Manifest 与 Atomic Capability Record

`CAP-xx.yy` 是 topic ID，只组织范围；`CAP-xx.yy-Axx` 才能独立判定支持状态、
对齐和优先级。`revision` 属于整个统一注册表，只在 Registry Manifest 中维护：

```yaml
registry_id: codex-claude-qwen-capabilities
revision: integer
topic_count: integer
record_count: integer
frozen_at: ISO-8601 timestamp
change_log:
  - revision: integer
    changed_at: ISO-8601 timestamp
    reason: product-neutral reason
    affected_ids: [CAP-xx.yy-Axx] | all-records
    migration: []
record_overrides:
  CAP-xx.yy-Axx:
    applicability_condition: one product-neutral predicate
```

`all-records` 是唯一允许的非 ID sentinel，只能用于首次建表或确实影响全部记录的
schema 迁移；其他 revision 必须显式列出受影响的 Atomic ID。

`topic_count` 与 `record_count` 是冻结时必须重算并校验的派生计数，不由编辑者手工
推断。所有偏离 revision 默认值的记录必须在 `record_overrides` 中按 Atomic ID
显式列出；空映射写作 `{}`，不得把例外只留在自然语言备注中。

每条原子能力记录使用：

```yaml
atomic_capability_id: CAP-xx.yy-Axx
topic_id: CAP-xx.yy
canonical_user_job: one product-neutral user outcome
observable_outcome: falsifiable completion condition
applicability_condition: always | one product-neutral predicate
in_scope: []
scope_boundaries: []
required_contract_dimensions: []
cross_refs: []
notes: []
created_at: ISO-8601 timestamp
introduced_in_revision: integer
updated_in_revision: integer
```

`required_contract_dimensions` 不是自由文本，只能引用 Claim schema 中以下精确路径：

- `behavior_contract.entrypoints`
- `behavior_contract.inputs`
- `behavior_contract.availability`
- `behavior_contract.side_effects`
- `behavior_contract.state_ownership`
- `behavior_contract.persistence`
- `behavior_contract.outputs_and_history`
- `behavior_contract.runtime_modes`
- `behavior_contract.concurrency`
- `behavior_contract.failure_semantics`
- `behavior_contract.extension_boundaries`
- `behavior_contract.security_boundaries`
- `behavior_contract.observability`

`in_scope` 必须逐字保存 `canonical_user_job` 与 `observable_outcome`。表格的
`scope_boundaries / cross_refs` 列是规范字段而非普通备注：完整单元格作为
`scope_boundaries` 数组中的一项保存，其中的排除项、区别项和转交其他能力所有权的
说明共同限定本 Atomic Record；所有完整 `CAP-xx`、`CAP-xx.yy` 或
`CAP-xx.yy-Axx` token 按首次出现顺序另存入 `cross_refs`。不得使用
`CAP-04.10/04.11` 一类省略前缀的缩写。Revision 1 的 `notes=[]`，避免把规范边界
重复写入非规范备注。

### 2.2 Product Alias Record

产品命令、UI 文案、API 名称等 alias 是版本化产品事实，不属于中立 Atomic
Capability Record。阶段 1B 使用独立记录，因此补 alias 不会修改 Registry revision：

```yaml
alias_id: ALIAS-<product>-<sequence>
atomic_capability_id: CAP-xx.yy-Axx
product: Codex | Claude Code | Qwen Code
version: exact version or commit
release_channel: stable | latest | preview | alpha | nightly | dev
product_surface: cli | ide | desktop | web-cloud | sdk-daemon | ci | im-bot
alias: exact product term
alias_kind: command | ui-label | doc-term | api-symbol | config-key | other
epistemic_status: Confirmed | Inferred | Unknown
evidence_ids: []
limitations: []
last_checked: ISO-8601 timestamp
```

只有 alias 暴露出注册表无法表达的新 user job 时，才按 Registry change log 流程提升
revision；仅增加同一能力的产品名称不改变 Atomic ID。

### 2.3 Claim Record

每条 Claim 只描述一个产品、精确版本、发布通道、Surface 和平台切片中的一个可观察
陈述。以下 schema 同时是阶段 1 的填写模板：

```yaml
claim_id: CCQ-<product>-<atomic-capability>-<sequence>
atomic_capability_id: CAP-xx.yy-Axx
product: Codex | Claude Code | Qwen Code
version: exact version or commit
release_channel: stable | latest | preview | alpha | nightly | dev
product_surface: cli | ide | desktop | web-cloud | sdk-daemon | ci | im-bot
platform:
  os: exact OS or not-applicable
  arch: exact arch or not-applicable
  shell: exact shell or not-applicable
  terminal: tty | non-tty | both | not-applicable | unknown
  isolation: host | container | vm | remote | other | not-applicable | unknown
user_job: one user outcome
claim: one observable statement
behavior_contract:
  entrypoints:
    status: recorded | confirmed-none | unknown | not-checked | not-applicable
    values: []
  inputs:
    status: recorded | confirmed-none | unknown | not-checked | not-applicable
    values: []
  availability:
    default_state:
      status: recorded | confirmed-none | unknown | not-checked | not-applicable
      value: default-on | default-off | null
    gates:
      status: recorded | confirmed-none | unknown | not-checked | not-applicable
      values: []
  side_effects:
    status: recorded | confirmed-none | unknown | not-checked | not-applicable
    values: []
  state_ownership:
    status: recorded | confirmed-none | unknown | not-checked | not-applicable
    values:
      - turn | session | process | project | workspace | user | organization | external-service
  persistence:
    status: recorded | confirmed-none | unknown | not-checked | not-applicable
    values:
      - memory | transcript | local | remote | cross-device
  outputs_and_history:
    status: recorded | confirmed-none | unknown | not-checked | not-applicable
    values: []
  runtime_modes:
    status: recorded | confirmed-none | unknown | not-checked | not-applicable
    values:
      - interactive | non-interactive | tty | non-tty | remote
  concurrency:
    execution:
      status: recorded | confirmed-none | unknown | not-checked | not-applicable
      value: serial | queued | parallel | mixed | null
    controls:
      status: recorded | confirmed-none | unknown | not-checked | not-applicable
      values: []
    limits:
      status: recorded | confirmed-none | unknown | not-checked | not-applicable
      values: []
  failure_semantics:
    status: recorded | confirmed-none | unknown | not-checked | not-applicable
    values: []
  extension_boundaries:
    status: recorded | confirmed-none | unknown | not-checked | not-applicable
    values: []
  security_boundaries:
    status: recorded | confirmed-none | unknown | not-checked | not-applicable
    values:
      - host | sandbox | workspace | network | external-service | other
  observability:
    status: recorded | confirmed-none | unknown | not-checked | not-applicable
    values: []
epistemic_status: Confirmed | Inferred | Unknown
documentation_status: Documented | Undocumented | Not checked | Not applicable
runtime_probe_status: Reproduced | Not reproduced | Not tested | Not applicable
support_state: Supported | Partial | Not supported | Unknown
lifecycle_stage: stable | preview | experimental | alpha | deprecated | removed | dev-only | unknown | not-checked | not-applicable
future_commitment: none | announced | roadmap | unknown | not-checked | not-applicable
evidence_conflicts:
  - Docs-runtime | Release-runtime | Cross-version | Cross-surface | Other
confidence: High | Medium | Low
evidence_ids: []
environment:
  authentication: []
  entitlement: []
  region: exact region or not-applicable
  provider: exact provider or not-applicable
  model: exact model or not-applicable
  configuration: []
  feature_flags: []
limitations: []
last_checked: ISO-8601 timestamp
```

只有原子能力 Claim 可以填写 `support_state`。同一原子能力若在版本、通道、
Surface、平台或 gate 上行为不同，拆成多个 Claim，不使用一个混合状态。

每个 `behavior_contract` 叶字段必须显式填写 `status`：

- `recorded`：已有一个或多个记录值；其可信度仍由 Claim 的证据状态判断。
- `confirmed-none`：有足够的负向证据确认该切片不存在此行为；不能作为默认空值。
- `unknown`：已调查但证据不足或冲突。
- `not-checked`：尚未调查。
- `not-applicable`：该维度不适用于此原子能力。

空 `values` 本身没有语义；只允许与 `confirmed-none`、`unknown`、`not-checked` 或
`not-applicable` 一起出现。`lifecycle_stage=unknown` 表示调查后仍不确定，
`not-checked` 表示尚未检查；`future_commitment=none` 仅表示检查官方承诺来源后确认
没有承诺，不能作为默认值。

复数叶字段仅在 `status=recorded` 时包含至少一个业务值。标量叶字段仅在
`status=recorded` 时填写业务枚举；其他状态的 `value` 必须为 `null`。因此
`status=unknown, value=default-on` 和 `status=recorded, value=null` 都是非法记录。

`epistemic_status`、`runtime_probe_status`、`support_state`、`lifecycle_stage` 和
`confidence` 回答不同问题，不能互相替代。

Claim 的 `last_checked` 表示最后一次用当时证据重新判定该陈述的时间；Evidence 的
`captured_at` 表示原始证据被采集的时间，创建后不改写。若复验 Claim，更新
`last_checked` 并新增 Evidence，不能覆盖旧 Evidence。本文不使用第三个
`observed_at` 字段。

## 3. 行为契约

每项能力至少按以下字段重建，并落入 Claim 的 `behavior_contract`，不能只写进
`claim` 或 `limitations`：

| 字段 | 要回答的问题 |
| --- | --- |
| 用户任务 | 用户为什么需要它，成功结果是什么？ |
| 入口与输入 | 命令、UI、API、事件或自动触发入口是什么？接受什么输入？ |
| 可用门禁 | 是否受版本、平台、登录、套餐、region、workspace trust、配置或 feature flag 限制？ |
| 副作用 | 会读写什么、启动什么进程、发送什么请求、创建什么外部状态？ |
| 状态所有权 | 状态属于 turn、session、process、project、workspace、user 还是 organization？ |
| 持久化 | 状态是否跨重启、跨 session 或跨设备存在？ |
| 输出与历史 | 用户看到什么？是否进入 transcript、event stream、日志或结构化输出？ |
| 运行模式 | interactive、non-interactive、TTY、非 TTY、remote 下是否一致？ |
| 并发与控制 | 是否可排队、并发、转向、取消、attach、resume？ |
| 失败语义 | 超时、权限拒绝、未知 workspace、断线、重启时如何失败或恢复？ |
| 扩展边界 | Hooks、MCP、Skills、Plugins、Subagents 是否参与同一流程？ |
| 安全与观测 | 有何权限边界、sandbox、audit、telemetry 和 debug 信号？ |

只有名称相同但状态范围、失败语义、门禁或自动化形态不同的能力，其跨产品 `alignment_state` 应判为 `Partial overlap` 或 `Name-only`，不能判为等价。

## 4. 证据类型

| Tag | 证据类型 | 可以证明什么 | 不能单独证明什么 |
| --- | --- | --- | --- |
| `META` | registry、release、tag、manifest、checksum | 发行身份、版本、平台包和完整性 | 用户行为 |
| `DOC` | 版本适用的官方文档 | 厂商承诺、配置和公开语义 | 当前 runtime 一定按文档工作 |
| `CHANGELOG` | 官方 release notes / changelog | 某版本声称新增、修改或修复什么 | 全部边界和默认可用性 |
| `HELP` | 冻结 binary 的 `--help`、schema、命令发现结果 | 公开命令面和参数 | 正常路径一定可执行 |
| `RUNTIME` | 可复现运行时探测 | 指定环境下的可观察行为 | 其他套餐、平台和隐藏门禁 |
| `SOURCE` | 对应 release 的源码、bundle、schema、稳定 data flow | 实现入口、状态和消费者 | 未触达代码一定可由用户使用 |
| `TEST` | 对应 release 的自动化测试、fixture 和断言 | 维护者声明的行为与回归边界 | 真实环境一定按测试工作 |
| `BINARY` | binary strings、symbols、邻接数据 | 发行物存在实现表面或稳定锚点 | 功能可用、完整或默认开启 |
| `ISSUE` | 官方 issue、维护者回复 | 已知问题和维护者解释 | 普遍产品事实 |

社区文章、搜索摘要和第三方评测只能帮助发现线索，不作为最终高影响结论的唯一证据。

### 4.1 Evidence Record

每个 `evidence_ids` 必须指向一条可独立复核的 Evidence Record：

```yaml
evidence_id: EVD-<product>-<type>-<sequence>
evidence_type: META | DOC | CHANGELOG | HELP | RUNTIME | SOURCE | TEST | BINARY | ISSUE
product: Codex | Claude Code | Qwen Code
version: exact version or commit
release_channel: stable | latest | preview | alpha | nightly | dev
product_surface: cli | ide | desktop | web-cloud | sdk-daemon | ci | im-bot
source_url_or_path: immutable URL, release path, or local artifact path
captured_at: ISO-8601 timestamp
environment:
  platform: []
  authentication: []
  entitlement: []
  region: exact region or not-applicable
  provider: exact provider or not-applicable
  model: exact model or not-applicable
  configuration: []
  feature_flags: []
artifact_hash_or_excerpt: checksum, bounded excerpt, or exact observation
runtime_probe:
  applicability: applicable | not-applicable
  preconditions: []
  procedure: []
  stdout: exact output or artifact reference
  stderr: exact output or artifact reference
  exit_code: exact code or not-applicable
  side_effects: []
  cleanup: []
  started_at: ISO-8601 timestamp or not-applicable
  finished_at: ISO-8601 timestamp or not-applicable
record_relations:
  - record_id: CCQ-... | ALIAS-...
    relation: supports | contradicts | qualifies
    note: bounded explanation of the relation
limitations: []
```

一条 Evidence 可以关联多个 Claim 或 Product Alias Record，但必须为每条记录分别写
`supports / contradicts / qualifies` 和原因。记录的 `evidence_ids` 必须包含全部
三类关联证据，不能只保留正向证据；Claim 存在反驳或限定关系时同步填写
`evidence_conflicts` 或 `limitations`。

可变网页要记录采集时间和限量摘录；发行物、源码快照和运行产物在可行时记录 hash。
`RUNTIME` Evidence 的环境与步骤必须足以复现；其
`runtime_probe.applicability` 必须为 `applicable`，并填写 procedure、输出、exit
code、副作用和 cleanup。非运行证据将 `runtime_probe.applicability` 写为
`not-applicable`，其他不适用的环境字段也写 `not-applicable`，不能省略版本切片。

## 5. 按结论选择证据

| 结论类型 | 首选证据 | 辅助证据 |
| --- | --- | --- |
| 发布身份 | `META` | `HELP` 中的版本输出 |
| 用户可观察能力 | `RUNTIME` | `DOC`、`HELP` |
| 产品公开承诺 | `DOC`、`CHANGELOG` | `RUNTIME` |
| 实现机制 | `SOURCE`、schema、稳定 data flow | `BINARY`、`RUNTIME` |
| 安全边界 | `RUNTIME` 的拒绝/失败场景 + `SOURCE` 或官方安全文档 | 配置 schema、测试 |
| Qwen 差距 | 已确认的竞品行为 + Qwen release 行为/源码 | 用户反馈、issue |

高影响行为结论原则上至少需要两条独立证据链，例如：

- `RUNTIME + DOC`
- `RUNTIME + SOURCE`
- `META + release SOURCE`

仅靠 README、changelog、字符串或命令名称，不足以认定行为等价。

### 5.1 置信度校准

`confidence` 对每条 Claim 或 Comparison 独立判定：

| 等级 | 判定规则 |
| --- | --- |
| `High` | 证据直接对应冻结版本和声明切片，适合该结论类型，关键门禁和反例已检查；高影响行为结论还满足双证据链 |
| `Medium` | 至少有一条直接证据或两条相互印证的间接证据，但仍有一个非关键边界、平台或门禁未验证 |
| `Low` | 主要依赖间接实现信号、单一弱证据、未复现文档或不完整切片；只能保留为待验证线索 |

独立证据链必须来自不同失效来源；同一 README 的转载、同一 changelog 的网页与仓库
副本、或同一 runtime 输出的多种格式不算两条。发行身份等非行为事实可由一个带
checksum 的权威 `META` 记录达到 `High`。

以下属于高影响结论：

- `Not supported`、`No counterpart`、`Equivalent`，或将直接进入 Gap / roadmap
  的结论。
- 权限、sandbox、信任、secret、企业策略和外部写操作安全边界。
- 默认启用状态、套餐/region/provider 门禁和产品 entitlement。
- 持久化、resume、恢复、数据丢失与跨设备状态。
- 多 Agent 并发、隔离、取消和失败传播。
- 涉及 Qwen 核心模块、跨包消费者或对外协议的实现建议。

高影响行为结论未满足双证据链时，最高只能记为 `Medium`，不得进入确定性 roadmap；
应保留为待验证项或将 Comparison 写为 `Unknown`。

## 6. Epistemic、文档与 Runtime 状态

### 6.1 `Confirmed`

存在能直接归因到冻结版本、且适合该结论类型的证据。`DOC` 可以确认“厂商公开承诺”，但不能单独确认“runtime 已复现”。

### 6.2 `Inferred`

由相邻字符串、minified flow、间接状态字段或多个弱信号重建。必须写清：

- 推理链。
- 可能的替代解释。
- 需要什么探测才能升级为 `Confirmed`。

### 6.3 `Unknown`

证据不足或证据冲突，暂不判断。

### 6.4 `documentation_status`

- `Documented`：冻结时点的官方材料明确描述该 Claim。
- `Undocumented`：runtime 或实现已确认，但版本适用的官方材料没有描述。
- `Not checked`：尚未完成官方材料检查。
- `Not applicable`：该 Claim 不需要文档状态。

### 6.5 `runtime_probe_status`

- `Reproduced`：在完整记录的环境和门禁内已复现。
- `Not reproduced`：按记录步骤尝试但未复现；它不等于 `Not supported`。
- `Not tested`：尚未运行。
- `Not applicable`：该 Claim 不适合 runtime probe，例如 registry 身份。

### 6.6 `evidence_conflicts`

证据冲突单独记录，不能塞进支持或生命周期状态。该字段是数组；无冲突时为空，可以
同时记录多个冲突：

- `Docs-runtime`
- `Release-runtime`
- `Cross-version`
- `Cross-surface`
- `Other`

## 7. 支持与对齐状态

### 7.1 单产品支持状态

| 状态 | 定义 |
| --- | --- |
| `Supported` | 在声明的 surface、版本和门禁内，行为契约的必要部分已确认 |
| `Partial` | 在同一个已声明切片内，只能完成部分用户任务，或关键行为契约不完整 |
| `Not supported` | 有明确移除/不支持证据，或限定范围内的穷尽探测与实现边界共同证明不存在 |
| `Unknown` | 证据不足，不能下结论 |

支持状态只评价 Claim 声明的版本、平台、surface 和 gate 切片。切片之外的平台、套餐或模式差异必须新建 Claim，不能用一个 `Partial` 混合多个环境。

### 7.2 跨产品对齐状态

| 状态 | 定义 |
| --- | --- |
| `Equivalent` | 对目标用户任务而言，关键行为、门禁和失败语义等价 |
| `Functional overlap` | 解决同一用户问题，但入口或实现形态不同 |
| `Partial overlap` | 只有部分行为契约重叠 |
| `Name-only` | 名称相似，但用户任务或关键语义不同 |
| `No counterpart` | 在限定范围内确认没有对应能力 |
| `Unknown` | 无法可靠比较 |

对齐结论不代表产品优先级。`Equivalent` 也不意味着实现应相同。

跨产品比较使用独立的两两记录，不把 `alignment_state` 塞回单产品 Claim。每条
Comparison 只允许两个产品；同一原子能力在三款产品间原则上建立三条 pairwise
record，证据不足的 pair 明确写 `Unknown`：

产品顺序固定为 `Codex < Claude Code < Qwen Code`；`left` 必须是顺序靠前的产品，
`right` 是靠后的产品，ID 使用 `codex / claude-code / qwen-code` slug。同一原子
能力和产品 pair 只能有一个当前 Comparison，修订时更新记录而不是反向再建一条。

```yaml
comparison_id: CMP-<atomic-capability>-<left-product>-<right-product>-<sequence>
atomic_capability_id: CAP-xx.yy-Axx
user_job: one shared target outcome
left:
  product: Codex | Claude Code | Qwen Code
  claim_ids: []
right:
  product: Codex | Claude Code | Qwen Code
  claim_ids: []
alignment_state: Equivalent | Functional overlap | Partial overlap | Name-only | No counterpart | Unknown
material_differences:
  surfaces: []
  gates: []
  state_and_persistence: []
  failure_semantics: []
confidence: High | Medium | Low
rationale: evidence-backed explanation
last_checked: ISO-8601 timestamp
```

## 8. 证据冲突规则

- 文档有、运行未复现：`documentation_status=Documented`、`runtime_probe_status=Not reproduced`、`evidence_conflicts=[Docs-runtime]`；`support_state` 仍按其他证据判断，不能自动写成不支持。
- 运行有、文档无：`runtime_probe_status=Reproduced`、`documentation_status=Undocumented`。
- 只有 binary string：只确认“发行物存在该字符串或实现表面”，行为 `support_state=Unknown`。
- 搜索无结果：`epistemic_status=Unknown`，在限制中写 `Not found in tested scope`。
- README 与版本源码冲突：以冻结发行物和 runtime 为准，并追加适当的 `evidence_conflicts`。
- stable 与 latest 冲突：拆成不同 `release_channel` Claim，向 `evidence_conflicts` 追加 `Cross-version`，不将 latest 行为回填到 stable。
- 同一能力在不同 Surface 冲突：拆成不同 `product_surface` Claim，向 `evidence_conflicts` 追加 `Cross-surface`，不做产品级布尔合并。

## 9. Runtime Probe 规则

Runtime 探测在隔离的临时目录中进行，并记录：

- binary 路径、版本、checksum 和安装方式。
- OS、arch、shell、TTY / 非 TTY。
- 登录类型、套餐、region、模型提供方。
- trust、sandbox、permission mode 和相关 feature flags。
- 完整命令或操作步骤。
- stdout、stderr、exit code、事件流和产生的文件。
- 起止时间、超时、重试和清理结果。

每个高价值能力至少覆盖：

1. discoverability。
2. 正常路径。
3. 权限或门禁路径。
4. 取消、失败和恢复路径。
5. interactive 与 non-interactive 差异。

不因探测方便而在真实用户仓库里触发写操作、外部消息、PR 或发布。

## 10. Qwen Code 映射规则

Qwen 稳定能力以 `v0.21.0` release source 和 runtime 为准。当前本地 HEAD 及未提交改动只能作为显式标注的开发叠加层。

每项候选 Gap 在提出方案前必须回答：

- 当前 Qwen 是否已有可复用系统？
- 入口、状态所有者和所有下游消费者是谁？
- 能力属于 process-global、selected-runtime、session、workspace 还是 persisted workspace？
- CLI、headless、daemon、SDK、IDE、Web Shell 和 channel 是否共享同一语义？
- 未知、未信任、启动中、draining、removed 等状态如何失败？
- 需要哪些 unit、integration 和 E2E 测试证明行为，而不仅是代码存在？

涉及 `packages/core/src/**`、auth、providers、models、config、tools、services 或跨包改动时，架构映射必须列全消费者；无法列全则只保留为待维护者确认的方向。

Qwen 架构映射不是证据类型，使用独立 Mapping Record。Qwen 当前行为仍必须由 `META`、`DOC`、`HELP`、`RUNTIME`、`SOURCE` 或 `TEST` 支撑：

```yaml
mapping_id: QMAP-<atomic-capability>-<sequence>
atomic_capability_id: CAP-xx.yy-Axx
qwen_claim_ids: []
current_components: []
state_owner: one explicit scope
downstream_consumers: []
reuse_points: []
failure_semantics: []
test_boundaries: []
architecture_risks: []
maintainer_questions: []
```

## 11. 从差异到决策

差异先写成用户问题：

```text
用户问题
→ 当前 Qwen 行为
→ 竞品冻结版本的证据
→ 对用户任务的影响
→ 建议策略：补齐 / 差异化 / 观察 / 不做
→ 成功指标
→ 依赖、风险和复验方法
```

优先级综合以下因素，不使用虚假精确的单一总分：

- 用户影响与覆盖面。
- Qwen 战略契合度。
- 差异化潜力。
- 证据置信度。
- 实现成本、架构风险和依赖。

最终先分 `P0 / P1 / P2 / 观察`，再形成 `Now / Next / Later`。没有通过 Review Gate 的 Gap 不进入 roadmap。

## 12. 阶段验收

阶段 1 事实采集完成时：

- 三款产品事实采集前已冻结同一份原子能力注册表；后续新增均有 revision 和迁移记录。
- 产品专有名称写入独立 Product Alias Record，不修改已冻结的中立原子记录。
- 每项重要事实有版本、时间、surface、证据和限制。
- 每个 `evidence_id` 都能回链到符合唯一 schema 的 Evidence Record。
- 行为契约各维度结构化记录，不依赖自由文本猜测。
- 三份产品画像不包含跨产品价值判断。
- 未知项和证据冲突单列。

横向比较完成时：

- 相同 capability ID 使用同一行为契约。
- 矩阵中的每个非 `Unknown` 结论可回链到详细证据。
- 已专项检查“同名误判”“跨版本回填”“一个 Surface 代表全产品”。

Gap 收敛完成时：

- 每项 Gap 是用户问题，不是复制竞品功能的指令。
- Qwen 架构所有权、消费者、测试边界和失败语义可解释。
- 明确记录补齐、差异化、观察和不做的决策。

## 13. 阶段 0 方法 Review Gate

进入阶段 1 前需确认：

- 阶段 1 先冻结统一原子能力注册表，再并行采集三款产品事实。
- Claim schema 的字段能够同时表达文档、runtime、生命周期、支持状态和多重证据冲突。
- Evidence Record、行为契约和 `confidence` 校准规则可直接填写并复核。
- Comparison Record 与单产品 Claim 分离，`Partial` 不再跨两个状态体系复用。
- Mapping Record 不作为自证 Gap 的证据来源。
- Topic ID 只组织范围；只有阶段 1 拆出的原子能力 ID 可以填写支持状态和优先级。
- Runtime probe、证据冲突和跨版本/Surface 拆分规则可以实际执行。

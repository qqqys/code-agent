# Stage 5：Qwen Backlog 与路线图

> 状态：Complete / Proposed roadmap  
> 形成时间：2026-07-26  
> 输入：[`29-stage-4-qwen-gap-convergence.md`](./29-stage-4-qwen-gap-convergence.md)  
> 说明：这是产品与工程候选，不构成实现、Issue、PR 或发布时间承诺

## 1. Roadmap summary

| Backlog | Stage 4 source | Priority | Type | Smallest outcome |
| --- | --- | --- | --- | --- |
| `BL-01` | `S4-01` | P0 | Bounded bugfix | permission failure 不再标为 `missing_file` |
| `BL-02` | `S4-02` | P1 | Contract design + implementation candidate | 两个无模型 headless failure 有版本化 machine taxonomy |
| `BL-03` | `S4-03` | P1 | Investigation only | 两个 config fixture 的 loader→consumer policy matrix |

优先级按 Qwen 用户任务与已观察行为排序，不按竞品 feature count、命令名或输出形态
排序。

## 2. `BL-01`：Daemon preflight error classification

### User problem

SDK/UI/运维自动化若只读取 `errorKind`，会把 permission/policy denial 当成文件不存在，
从而给出安装或路径类错误 remediation。

### Evidence basis

- Qwen `0.21.0` exact runtime：`spawn EPERM` + `errorKind=missing_file`；
- empty-PATH Git/npm：独立返回 `warning + not found on PATH.`；
- 当前 checkout `69b991aa77`：mapper 与 unit test 显式固定
  `ENOENT/EACCES/EPERM → missing_file`。

### Smallest deliverable

- `ENOENT` 保持 missing；
- `EACCES` 与 `EPERM` 投影为 permission-specific machine kind；
- 保留原 error message 与现有 envelope；
- 更新 shared type、mapper test 和至少一个 preflight contract test。

### Acceptance evidence

1. synthetic `ENOENT`、`EACCES`、`EPERM` 分别得到声明的稳定 kind；
2. permission failure 的 hint 不建议安装不存在的文件或工具；
3. missing Git/npm 的正常 warning 仍保持；
4. SDK 对新增 kind 向后兼容，旧字段不删除；
5. tests 不依赖主机是否安装 Git/npm，也不依赖外层 sandbox；
6. 无凭据、provider、模型与网络即可完整验证。

### Dependencies and risks

- owner 需确认公开 kind 名与兼容策略；
- changing an emitted kind may affect consumers that assumed the old coarse bucket；
- release note 应明确这是分类细化，不是新增故障。

### Excluded scope

- 不重做全部 daemon error taxonomy；
- 不改变 preflight 的工具集合、HTTP route 或 overall status；
- 不把 containment 失败写成真实 host 缺工具；
- 不顺带新增 standalone doctor。

## 3. `BL-02`：Headless machine error contract v1

### User problem

使用 `--output-format json` 的自动化调用方目前仍需解析自由文本，才能判断错误类型、
发生阶段与是否应重试。

### Evidence basis

- missing credential result 已有 `uuid`、`session_id`、`subtype`、`is_error`、
  turn/usage，但 error payload 只有 message；
- malformed JSON schema 本地 exit `52` 且 stdout 为空；
- provider transient、tool failure、cancel 与 success lifecycle 仍未运行。

### Smallest deliverable

只为两个无模型、可离线复现的 failure 定义 additive v1 contract：

1. missing credential；
2. malformed output schema。

结果至少表达 version、code/category、stage、retryable 与 correlation；保留现有
message、已有关联字段和 exit semantics。

### Acceptance evidence

1. argv 与 stdin 的 missing-credential result 返回同一 taxonomy；
2. malformed schema 在 machine-output mode 有可解析且不可重试的 local validation
   result；
3. stdout 始终是完整单一 JSON document，stderr 只放人类诊断；
4. correlation 能关联当前 run/session，但不泄露 key、token、credential 或敏感
   endpoint；
5. 旧 consumer 忽略新增字段后仍能读取原字段；
6. contract tests 全部无 provider、无模型、无费用。

### Dependencies and risks

- 在实现前确认 envelope versioning、field naming 与 parser compatibility；
- 公开 code 后即形成长期 API；
- malformed CLI argument 如何进入 machine envelope 需要先确认 parser boundary。

### Excluded scope

- provider transient、tool failure、cancel；
- success/final/event lifecycle；
- legal output-schema success；
- 修改现有 exit code；
- 复制 Codex/Claude 的 JSON shape 或字段名。

## 4. `BL-03`：Config loader→consumer consistency investigation

### User problem

同一配置可能先通过 startup loader，之后才被具体 consumer 忽略、修正或拒绝，导致
用户难以预测实际行为。

### Evidence basis

Phase 2C 只确认 selected startup route 不拒绝：

- `general.vimMode: "true"`；
- command hook 缺少 conditionally required `command`。

它没有证明 interactive CLI、headless、daemon、Web Shell 或 HookRegistry 的最终
consumer behavior。

### Smallest deliverable

不改生产行为，只为这两个 fixture 建立：

```text
source layer → migration → merge/trust → effective value → actual read sites
```

对每个实际 consumer 声明当前 observed behavior 与唯一预期 policy：fail、warning、
salvage 或 consumer-local validation。

### Acceptance evidence

1. 列全两个字段的实际读点和 raw/effective input；
2. 覆盖 user/workspace/system 与 trusted/untrusted 的相关组合；
3. known-invalid 与 unknown-key policy 分开；
4. 不用未初始化 HookRegistry 的结果替代真实 consumer；
5. migration 与 unknown-field preservation 无数据丢失；
6. 若确认不一致，再拆独立、最小修复项及会因行为破坏而失败的 tests。

### Dependencies and risks

- 必须找到所有真实 consumer；不完整 read-site inventory 会给出错误统一策略；
- 不同 surface 可能有合理的不同 gate；
- 调查结论可能是“当前行为合理”，此时关闭而不建设。

### Excluded scope

- 全量 settings 重写；
- 默认 strict reject unknown key；
- 修改 `$version:4` migration；
- 一次统一所有 CLI/daemon/Web Shell configuration surface；
- 未调查就添加 global startup validation。

## 5. Sequencing

### Milestone A：Local machine contracts

1. `BL-01` 先完成；范围小、证据直接、无需 provider。
2. `BL-02` 在兼容设计确认后执行；复用 machine-contract naming，但不依赖
   `BL-01` 的生产实现。

### Milestone B：Config decision

`BL-03` 可与 Milestone A 并行调查，但任何 config implementation 必须等待其结果。

不编造日期或 story points。每项只有在 owner、兼容策略与 acceptance evidence
明确后才进入实现。

## 6. Deferred evidence queue

以下不进入当前产品 backlog：

- headless argv/stdin success；
- complete final/event lifecycle；
- legal output-schema success 与 unsatisfiable failure；
- provider transient/permanent taxonomy；
- daemon submit/query/event/cancel/reconnect。

它们需要 deterministic fake provider，或独立的 identity、endpoint、model、region
与费用授权。完成 evidence 后若发现真实缺陷，再新建 backlog item。

## 7. No-build register

- 不新增 standalone `doctor` 只为 parity；
- 不复制竞品 command、exit code、JSON/JSONL 或 remote service shape；
- 不默认 strict reject unknown key；
- 不重做已验证存在的 layered merge、trust suppression 与 daemon log degradation；
- 不为 schema identity/version 的外观一致性增加字段；
- 不把尚未运行的成功路径或 task/session 契约登记成现有缺陷。

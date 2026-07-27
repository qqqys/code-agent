# Stage 4：Qwen Gap 与机会收敛

> 状态：Complete / Decision frozen  
> 决策时间：2026-07-26  
> 主要产品 Slice：Qwen Code `0.21.0 / effective latest`  
> 当前 checkout sanity check：`69b991aa77`，仅用于确认候选仍存在，不混入三方 cohort

## 1. 分类规则

本阶段不把所有差异都叫 Gap：

| Class | Definition |
| --- | --- |
| Verified Gap | Qwen exact behavior 已复现，且对同一用户任务给出错误或不可稳定消费的结果 |
| Product opportunity | limitation/omission 已观察，但用户价值或需求强度尚未闭合 |
| Investigation | 当前只证明风险或 evidence asymmetry，必须先查 consumer/read site |
| Evidence debt | 成功路径或 provider 行为尚未执行，不代表产品缺陷 |
| No-build | 不为竞品形态、命令名或不可比较机制建设 |

`Unknown`、`Not assessed`、无 Claim、secondary-only 证据与 `Partial overlap` 均不自动
进入 Gap。

## 2. 收敛结果

| ID | Class | Decision | User problem | Evidence boundary |
| --- | --- | --- | --- | --- |
| `S4-01` | Verified Gap | **Now / P0** | automation 不能把“文件/命令不存在”和“存在但无权限”当成同一种原因 | Qwen `0.21.0` full preflight 在 `spawn EPERM` 时返回 `errorKind=missing_file` |
| `S4-02` | Product opportunity | **Now / P1** | headless 调用方仍需解析自由文本判断错误阶段和是否重试 | 只闭合 missing credential 与 malformed schema 本地失败 |
| `S4-03` | Investigation | **Next / investigate first** | 配置可通过 startup loader，之后可能才被 consumer 拒绝或忽略 | selected loader 的 bounded non-rejection，不代表所有 consumer |
| `S4-04` | Product opportunity | **No-build this cycle / conditional reopen** | effective 值来自 System/SystemDefaults 或被 trust 抑制时，来源需靠实现知识推断 | layering 已复现；support/user demand 未量化 |
| `S4-05` | Evidence debt | **Deferred evidence** | headless success 与 daemon task/session lifecycle 未知 | model-success execution=`0`，task/session/SSE 未运行 |
| `S4-06` | No-build | **No-build** | 是否需要 standalone doctor | non-comparable surface：三方 entry 与 fault target 不同 |
| `S4-07` | No-build | **No-build** | 是否对齐 schema identity/version 形态 | non-comparable mechanism：三方使用不同机制 |
| `S4-08` | No-build | **No-build** | 是否默认 strict reject unknown key | verified policy delta：没有证据支持默认拒绝更优 |

## 3. `S4-01`：区分 missing 与 permission denied

### Verified behavior

Phase 2E 的 normal-PATH containment 直接观察到：

```text
error = "spawn EPERM"
errorKind = "missing_file"
```

这不是“工具不在 PATH”。同一 artifact 的 empty-PATH Git/npm cells 会返回
`warning + not found on PATH.`，说明产品已有可区分的正常 missing-tool signal。

当前 checkout `69b991aa77` 的只读 sanity check 也确认：

- `ServeErrorKind` 有 `missing_file`，没有 permission-specific kind；
- mapper 显式把 `ENOENT`、`EACCES`、`EPERM` 都映射到 `missing_file`；
- unit test 固定了该分组。

这表示它是当前契约选择，不是偶发测试污染；问题在于 machine consumer 若只使用
`errorKind`，会对权限失败选择错误 remediation。

### Smallest decision

把 filesystem/process permission failure 与 absence 分开，优先采用 additive taxonomy：

- `ENOENT` 保持 missing；
- `EACCES` / `EPERM` 使用 permission-specific kind；
- 保留人类可读 message；
- SDK 对未知未来 kind 继续 forward-compatible；
- preflight 和 mapper contract tests 同时覆盖三类 errno。

本阶段不决定最终字段名，不修改生产代码，也不重构全部 daemon error taxonomy。

## 4. 其余候选的进入条件

### `S4-02`：Headless machine error contract

先只覆盖两个无模型路径：

1. missing credential；
2. malformed output schema。

进入实现前需 owner 确认 version/code/category/stage/retryable/correlation 的兼容规则。
provider transient、tool failure、cancel 和成功 lifecycle 仍属于后续扩展，不借本项
一次性设计。

### `S4-03`：Config consumer consistency

只追踪两个已运行 fixture：

- `general.vimMode` known-type error；
- command hook 缺少 required command。

产出 loader→merge→actual read sites matrix，并为每个 consumer 明确 fail、warning、
salvage 或 consumer-local validation。不得从 startup non-rejection 直接建设全局
strict gate。

### `S4-04`：Effective config provenance

本周期不建设。只有出现真实 support consumer 或 `S4-03` 证明定位收益后，才重开评估
在现有只读 response
中 additive 返回 effective source 与 trust suppression reason。不得重写 merge、
增加 Claude-style Local layer或把 unique-sentinel 结果外推成完整 provenance API。

### `S4-05`：Deferred evidence

headless success 与 daemon task/session lifecycle 都先依赖 deterministic fake
provider。它们是 Evidence debt，不是待修 bug，也不进入产品 backlog；
没有 fake provider 或专项真实 provider 授权时保持 blocked。

## 5. 已验证的 Qwen 强项

Qwen daemon 日志降级契约已经比“启动失败或静默丢日志”更可运维：

- listener 仍可查询；
- `stderr-only` 与 `degraded` 明确分离 mode/health；
- internal `init_failed` 和 public `daemon_log_degraded` 可机器消费；
- dropped record/byte counters 保留。

## 6. No-build register

| ID | Decision | Reason |
| --- | --- | --- |
| `S4-06` | 不新增同名 standalone `doctor` 只为 parity | Codex doctor、Claude interactive install doctor、Qwen daemon status 入口与资源对象不同 |
| `S4-07` | 不对齐 schema identity/version 形态 | generated schema、editor/runtime schema 与 settings format version 是不同机制 |
| `S4-08` | 不默认 strict reject unknown config key | forward compatibility、plugin field 与跨版本配置需单独权衡 |
| — | 不复制 command、exit code、JSON/JSONL 或 remote service shape | 当前没有共同成功 task outcome，也没有互操作要求 |

`No-build` 只否定本轮的 parity 动机，不永久否定背后的用户问题。

## 7. Stage 5 handoff

只有以下项目进入 roadmap：

1. `S4-01`：本地 machine taxonomy 修正；
2. `S4-02`：bounded headless error contract；
3. `S4-03`：配置 consumer 调查。

`S4-04` 只保留条件重开门槛，`S4-05` 留在 Evidence queue，二者均不进入当前产品
roadmap。

# Codex / Claude Code / Qwen Code：Phase 1C.1 覆盖度与开放 Claim

> 阶段：1C.1 · Exact-version CLI Claim Normalization  
> 状态：Frozen  
> Frozen at：2026-07-25T21:40:12Z  
> Registry：Revision 1，548 Atomic Capabilities  
> 正式 Claim：425

## 1. 结论摘要

本轮把 Phase 1B Candidate Facts 规范化为 425 条正式 CLI Claim：

| Product     | Exact slice                                        |  Claims | Distinct atoms | Origin Facts | Slices |
| ----------- | -------------------------------------------------- | ------: | -------------: | -----------: | -----: |
| Codex       | `0.145.0 / latest / cli`                           |      84 |             56 |           29 |      9 |
| Claude Code | `2.1.212 / stable / cli`、`2.1.220 / latest / cli` |     132 |            121 |           52 |      9 |
| Qwen Code   | `0.21.0 / stable / cli`                            |     209 |            200 |           44 |      6 |
| **合计**    | 3 个产品、4 个 version/channel slice               | **425** |              — |            — | **24** |

Claim 数量不是功能数量或支持率。Codex 的 wrapper/platform 映射按六个 OS/arch
切片拆分；Claude 的 provider 和 preview/stable mode 分开；Qwen 的 sandbox backend
与 TTY/non-TTY output Surface 分开。相反，同一事实中的重复 PR metadata 已合并。

## 2. 状态分布

### 2.1 Support state

| Product     | Supported | Partial | Unknown | Not supported |
| ----------- | --------: | ------: | ------: | ------------: |
| Codex       |         4 |       0 |      80 |             0 |
| Claude Code |         0 |       2 |     130 |             0 |
| Qwen Code   |         0 |       0 |     209 |             0 |
| **合计**    |     **4** |   **2** | **419** |         **0** |

四条 `Supported` 只确认 Codex `0.145.0` Help 对 `app-server`、
`remote-control`、`cloud` 和 `exec-server` 的 `experimental` 生命周期标签。
它们不表示这些行为入口已正常运行。

两条 `Partial` 只对应 Claude 的已复现发行身份：native artifact 正常启动和官方
manifest checksum 匹配已观察，但平台不匹配与篡改失败分支未闭合。其余 Help、文档、
源码、测试或 changelog Surface 即使可发现，也不因“缺 runtime”自动成为
`Partial`，统一保持 `Unknown`。

### 2.2 Epistemic、runtime 与 confidence

| Product     | Epistemic                    | Runtime                                             | Confidence                       |
| ----------- | ---------------------------- | --------------------------------------------------- | -------------------------------- |
| Codex       | `Confirmed 84`               | `Reproduced 1`、`Not applicable 4`、`Not tested 79` | `High 5`、`Medium 27`、`Low 52`  |
| Claude Code | `Confirmed 132`              | `Reproduced 2`、`Not tested 130`                    | `High 2`、`Medium 101`、`Low 29` |
| Qwen Code   | `Confirmed 207`、`Unknown 2` | `Not tested 209`                                    | `Medium 74`、`Low 135`           |

`Reproduced` 只对应冻结 binary 的版本/identity probe；Help discovery 不算行为
runtime。Qwen 的两个 `epistemic=Unknown` 是 Agent Team topology/orchestration；
generic subagent messaging 已拆成独立的 implementation-surface Claim。

### 2.3 Lifecycle

| Product     | Lifecycle distribution                                  |
| ----------- | ------------------------------------------------------- |
| Codex       | `experimental 10`、`not-checked 73`、`not-applicable 1` |
| Claude Code | `stable 123`、`preview 3`、`unknown 6`                  |
| Qwen Code   | `experimental 4`、`unknown 2`、`not-checked 203`        |

Release channel 与 lifecycle 已分离。Codex npm `latest`、Qwen release `stable`
不会自动把每个能力的 lifecycle 写成 stable；Claude 的 `auto` permission mode 和
trace preview 也不再与同 Fact 的 stable 部分混写。

## 3. Behavior Contract 填写度

以下只统计 Registry 要求的 contract 叶。`recorded` 表示 Candidate Fact 中有可投影
的业务值，不表示 runtime 已证实；`NC` 表示尚未调查。

| Product     | Required leaves | Recorded / confirmed-none |    NC |   U |  NA | Fact-derived recorded ratio |
| ----------- | --------------: | ------------------------: | ----: | --: | --: | --------------------------: |
| Codex       |             785 |                        36 |   745 |   0 |   4 |                        4.6% |
| Claude Code |           1,440 |                        94 | 1,335 |  11 |   0 |                        6.5% |
| Qwen Code   |           2,226 |                        22 | 2,203 |   1 |   0 |                        1.0% |

三产品的多 Atomic Fact 在没有原子级观察边界时都不再复制整段 Fact contract，因此
required leaf 保守写为 `NC`；单 Atomic Fact 也不从普通关键词自动生成 contract，
只有原子级 inline marker 或像 Fact012、dangerous bypass、Dual Output
这样显式收窄的投影才记录业务值。Claude 的 11 个 contract `U` 来自单 Atomic
冻结事实显式写明的 `unknown`、`not described`、`not documented` 等证据不足叶；
Qwen 唯一的 contract `U` 是 Approval `availability.default_state`。高比例 `NC`
正是 Runtime Probe Catalog 的输入，不能用自由文本限制代替失败、并发、安全或
持久化字段。Codex 的 4 个 `NA` 只对应 `CAP-01.09-A01` 生命周期分类 Claim 的
`availability.default_state`：分类标签没有 default-on/off；validator 不允许其他
required leaf 借 `NA` 绕过闭合。

## 4. Deferred Register

Deferred row 不是 Claim，不填写 support state，也不进入 425 的分母。

### 4.1 Codex

| Deferred set                                             |                                   规模 | 原因                                                                                                           | 解锁条件                                                         |
| -------------------------------------------------------- | -------------------------------------: | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `FACT-031/047/048` exact `sdk-daemon` Surface            | 8 个 Fact→Atomic row / 6 distinct atom | MCP server 2 row、app-server 4 row、MCP server 2 row；同一 `CAP-10.07-A01/A02` 在两个 Surface Fact 中重复      | 1C.2 按 Fact/入口保留 8 row，分别规范化 MCP server 与 app-server |
| `FACT-codex-023 / CAP-05.03-A03` exact CLI cloud entries |            `cloud apply`、`cloud diff` | 与同 Fact 的顶层 `apply` 入口、lifecycle 和副作用边界不同，未计入正式 Claim                                    | 独立映射 cloud task/attempt 的查询与应用语义并执行 CLI probe     |
| `FACT-codex-050 / CAP-10.12-A01/A03` mapping review      |                               1 个入口 | `exec-server` 是 standalone WebSocket/stdio registration service，不能借同 Fact 的 cloud task Atomics 建 Claim | 1C.2 作为 `sdk-daemon` Surface 重新做 Atomic 映射                |
| `unversioned-docs@2026-07-25` docs-only/mixed            |             约 99 个 prospective Claim | Claim `version` 必须是精确产品版本或 commit                                                                    | 找到版本化 release/changelog/schema，或冻结对应 client build     |
| Mapping-review backlog                                   |                             不计 Claim | CLI launcher、营销概括、skill packaging、部分 hook/subagent/health 映射未满足 Atomic observable outcome        | 补直接 Evidence 或移除候选映射                                   |
| IDE/Desktop/Web/CI                                       |                           不在本轮计数 | Surface 不同，且部分入口版本未锁                                                                               | 1C.2 按 Surface 与 client/action version 重建                    |

current docs 可以继续作为 Promise/qualifier Evidence，但网页日期不能写进正式 Claim
的 `version`。Codex exact Claim 的 channel 统一为 `latest`；Phase 1B 的
“stable/latest CLI”不再传播。

`FACT-codex-025 / CAP-06.02-A04` 的正式 Claim 已合并
`FACT-codex-029` provenance，并显式记录
`--dangerously-bypass-approvals-and-sandbox`。它属于“进入/退出不逐项审批的高权限
模式” (`A04`)，不是对单个待执行动作批准或拒绝 (`A02`)。

### 4.2 Claude Code

共 17 条 deferred：

| Deferred set      | Count | Origin                                                    | Blocker                                                          |
| ----------------- | ----: | --------------------------------------------------------- | ---------------------------------------------------------------- |
| current CLI docs  |     7 | `FACT-017` 4、`FACT-019` 2、`FACT-057` 1                  | `current-docs@2026-07-25` 不是产品版本                           |
| SDK               |     6 | `FACT-042` 4；`FACT-052/054` 各 1 个跨 Surface derivative | Python/TypeScript SDK package version 未冻结                     |
| CI                |     3 | `FACT-035`                                                | Action `v1` 是 floating major；commit 和实际 CLI resolution 未锁 |
| remote web/client |     1 | `FACT-008 / CAP-02.09-A04`                                | remote client build 未冻结                                       |

正式 132 条 Claim 已完成三个必要拆分：

- `FACT-023` 的 stable permission modes 与 `auto / preview` 分开；
- `FACT-043` 的 endpoint、credential、dialect 按 Anthropic、Bedrock、Vertex
  分开；只有 credential Atomic 使用 exact Help `supports`，endpoint/dialect
  当前只有 current-doc `qualifies`；
- `FACT-031/033` 重复的 background roster 合并，但普通 resume 与
  PR/GitHub-gated resume 保持不同 Claim。

### 4.3 Qwen Code

排除已单列 formal deferral 的 `FACT-qwen-code-003` 后，1C.2 有 52 条
secondary-Surface prospective Claim：

| Surface      | Exact-version rows ready for 1C.2 | Additional version-blocked rows |
| ------------ | --------------------------------: | ------------------------------: |
| IDE          |                                 4 |                               0 |
| Desktop      |                                 0 |                               0 |
| SDK / daemon |                                27 |                              12 |
| CI           |                                 6 |                               0 |
| IM bot       |                                 3 |                               0 |
| **合计**     |                            **40** |                          **12** |

40 条 exact-version row 的来源为：IDE `FACT-008` 4；SDK/daemon
`FACT-004` 2、`FACT-041` 5、`FACT-042` 8、`FACT-050` 7、`FACT-053` 5；
CI `FACT-037` 6；IM bot `FACT-052` 3。

12 条 version-blocked SDK row 是 TypeScript、Python、Java 的
session/events/resume/cancel 细分；必须冻结真实 package version 后再建 Claim。
当前只允许版本化文档证明三种语言存在嵌入 Surface，不能推断 feature parity。

另有三条 1C.1 formal-normalization deferral，均不计入上表的 52 条
secondary-Surface prospective Claim：

| Origin / Atomic mapping                                 | Count | Blocker                                                                                       |
| ------------------------------------------------------- | ----: | --------------------------------------------------------------------------------------------- |
| `FACT-qwen-code-003` / `CAP-01.08-A01`、`CAP-01.08-A03` |     2 | 单个 inventory Fact 混合 CLI、IDE、Desktop、SDK/daemon 与 IM bot，无法形成单一 CLI 可观察陈述 |
| `FACT-qwen-code-006` / `CAP-02.10-A03`                  |     1 | `DOC-002` 只记录 theme/terminal 等命令入口，没有布局调整、持久化或非法布局恢复 Evidence       |

第一行需在 1C.2 按 Surface 重建 inventory；第二行只有补到直接 layout Evidence
或重做 Atomic 映射后才可创建 Claim。

Qwen Phase 1B 的 Atomic 列复核同时修正了一个统计错误：Fact 表有 245 个
Fact→Atomic 关联、236 个 distinct mapped atoms；旧计数器误读了 limitations 中
明确排除的 `CAP-07.02-A05/A06` 文本。

## 5. 显式冲突

### 5.1 Qwen Approval 默认姿态

- 模式与切换入口：`epistemic=Confirmed`。
- `CAP-06.02-A01.availability.default_state=U`。
- `support_state=Unknown`。
- `evidence_conflicts=[Other]`。
- `EVD-qwen-code-DOC-010` 同时建立 `supports` 与 `contradicts` relation：
  它支持模式 inventory，但其内部默认值陈述互相冲突。
- 解锁：空 HOME/XDG/Qwen config 的 TTY runtime probe。

### 5.2 Qwen Agent Team

- `CAP-08.04-A03` 与 `CAP-08.12-A02`：
  `epistemic=Unknown`、`support=Unknown`、`lifecycle=unknown`、
  `future_commitment=announced`、`conflict=[Other]`。
- `EVD-qwen-code-SOURCE-006` 支持 implementation-surface；
  `EVD-qwen-code-DOC-021` 反证当前可用性。
- `CAP-08.05-A01` generic `send_message` 已改用 subagent
  `DOC-019/SOURCE-005` 单独建 Claim，不再借 Team 冲突代表通用 messaging。
- 解锁：先做无 flag/显式 flag 下的只读 tool registration probe，再决定是否进入
  行为 probe。

## 6. Evidence Relation 闭合

三份 Claim 文档都包含 Claim 级 Evidence Relation Extension：

- 每个 Evidence/Claim 对只有一个 primary relation；Qwen Approval 的同一文档内部
  冲突是唯一允许额外添加 `contradicts` 的例外；
- exact-version Help 只 `supports` 有界 discoverability 陈述；
- pinned Source/Test 只 `supports` 有界 implementation/maintainer-test 陈述；
- Binary、Codex/Claude current docs，以及除两个明确单 Atomic release statement
  外的 Claude changelog 只 `qualifies`，不支持 exact-version runtime；
- Qwen Dual Output `DOC-031` 只 `supports` 独立的 exact-version TTY sidecar
  文档陈述，不与 headless stream-json 合并，也不证明 runtime；
- Qwen 两个冲突包含显式 `contradicts`；
- Claim 的 Evidence ID、关系反链和上游 Ledger ID 无悬空。
- validator 独立解析上游 Ledger 的 type、version/channel、Surface、
  `captured_at` 与 provable scope；`supports` 必须 exact-version/channel，且正式
  CLI Claim 不接受跨 Surface Evidence。

`support=Unknown` 的 Claim 可以没有 `supports` relation。这只表示引用关系闭合，
不表示 Atomic 可观察结果已经闭合。

## 7. Review Gate

| Gate                                                                     | Result             |
| ------------------------------------------------------------------------ | ------------------ |
| 一个 Claim 仅一个产品、Atomic ID、version/channel/surface/platform slice | Pass               |
| 正式 version 均为 exact product version；无 docs snapshot 充当版本       | Pass               |
| 所有 16 个 behavior contract 叶均有显式 status                           | Pass               |
| Claim、Slice、Atomic、Evidence 与 relation 引用闭合                      | Pass               |
| stable/latest、preview、provider、terminal 与 Surface 不混写             | Pass               |
| `Not supported` 不由“未找到/未测试”生成                                  | Pass               |
| Approval 与 Agent Team 冲突未被生成逻辑升级                              | Pass               |
| secondary Surface 可追踪且未回填 CLI                                     | Pass               |
| 未创建 Comparison、Gap、priority 或 roadmap                              | Pass               |
| 认证、模型、外部写入与高风险 runtime probe                               | 未执行；按设计保留 |

## 8. 下一步 Review Gate

Phase 1C.1 冻结后，下一步有两个互不替代的方向：

1. **1C.2 secondary surfaces**：IDE、Desktop、Web、SDK/daemon、CI、IM
   分开冻结版本并建立 Claim。
2. **Phase 2 runtime validation**：按
   [`probes/01-cli-core-runtime-probes.md`](./probes/01-cli-core-runtime-probes.md)
   优先验证 headless、session、approval/sandbox、cancel、MCP/hooks 与 subagent。

在至少完成高价值 CLI runtime probe 之前，不应产出“谁支持得更多”的矩阵，也不应把
`Unknown` 直接转成 Qwen Gap。

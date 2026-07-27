# Codex / Claude Code / Qwen Code 对比：阶段 1C.2 覆盖与 Open Claims

> 阶段：1C.2 · Secondary Surface Claim Normalization  
> 状态：Frozen  
> Frozen at：2026-07-26T04:55:00Z  
> 统计对象：三份 `claims/*-secondary-surfaces.md`  
> 统计规则：一条 Claim = 一个产品 × 一个 Atomic × 一个 exact Slice

## 1. 结论摘要

Phase 1C.2 当前形成 `30` 条正式 Claim：

- Codex：`8`
- Claude Code：`0`
- Qwen Code：`22`

这不是三产品能力数量排名。它只表示当前冻结证据能否形成诚实的 secondary
Surface/version Slice：

- Codex 的 8 条都属于 exact `0.145.0/sdk-daemon`，并按 app-server 与
  MCP server 分开；
- Claude Code 的 SDK、Action 与 remote client 都没有完成自身版本锁，因此 10 条
  secondary 候选全部 blocked；
- Qwen Code 只纳入同 `0.21.0` 发行物可归因的 daemon 与 generic IM channel
  Claims；IM channel 另由 npm artifact 内实际交付的 channel-core chunk 与 bundled
  文档闭合 release attribution。IDE extension、三种 SDK 与 CI Action 没有因“文档
  commit 已固定”而被伪装成 artifact 已固定。

正式 Claim 中仍有 `28/30` 为 `Unknown`。这符合本阶段的目标：建立可追溯 Claim 与
证据边界，不用入口或文档替代行为验证。

## 2. 正式 Claim 覆盖

| Product     | Claims | Distinct Atomic | Origin Facts | Slices | Surface distribution        |
| ----------- | -----: | --------------: | -----------: | -----: | --------------------------- |
| Codex       |      8 |               6 |            3 |      2 | `sdk-daemon 8`              |
| Claude Code |      0 |               0 |            0 |      0 | none                        |
| Qwen Code   |     22 |              22 |            5 |      2 | `sdk-daemon 19`, `im-bot 3` |
| **合计**    | **30** |  product-scoped |            8 |      4 | `sdk-daemon 27`, `im-bot 3` |

Codex 的 8 条只有 6 个 distinct Atomic，因为 `CAP-10.07-A01/A02` 分别为
app-server 和 MCP server 建立独立 Claim。Qwen 的
`CAP-12.03-A01/A02` 已有 CLI `-001`，secondary Claim 使用 `-002`。

### 2.1 Support state

| Product     | Supported | Partial | Not supported | Unknown |
| ----------- | --------: | ------: | ------------: | ------: |
| Codex       |         0 |       0 |             0 |       8 |
| Claude Code |         0 |       0 |             0 |       0 |
| Qwen Code   |         1 |       0 |             1 |      20 |
| **合计**    |     **1** |   **0** |         **1** |  **28** |

两条非 Unknown 与一个易误判边界：

- `Supported`：Qwen `CAP-01.09-A01`，exact Help 直接给出 Stage 1
  experimental lifecycle；
- `Unknown`：Qwen `CAP-01.09-A02` 只发现 `--http-bridge` flag 的声明默认值；
  干净配置默认状态、启停、持久与失败均未运行，不能据此判为 `Partial`；
- `Not supported`：Qwen `CAP-10.08-A01`，有界
  `EVD-qwen-code-DOC-044` 明确把 actual feature negotiation 列为未来工作。该
  负向结论只适用于 `0.21.0` daemon Slice；因只有一条独立直接负向证据链，
  `confidence=Medium`。

### 2.2 Epistemic、runtime、confidence 与 lifecycle

| Product     | Epistemic      | Runtime                        | Confidence            | Lifecycle                          |
| ----------- | -------------- | ------------------------------ | --------------------- | ---------------------------------- |
| Codex       | `Confirmed 8`  | `Reproduced 4`, `Not tested 4` | `Medium 8`            | `experimental 4`, `not-checked 4`  |
| Claude Code | none           | none                           | none                  | none                               |
| Qwen Code   | `Confirmed 22` | `Not tested 22`                | `High 1`, `Medium 21` | `experimental 19`, `not-checked 3` |

Codex 的 `Reproduced` 只表示 app-server JSON Schema generation 已执行并校验，
不是 server task、event 或 handshake runtime 已复现。

## 3. Behavior Contract 填写度

| Product     | Required leaves | Recorded |    `NC` |   `U` | Approved `NA` |
| ----------- | --------------: | -------: | ------: | ----: | ------------: |
| Codex       |             106 |       33 |      73 |     0 |             0 |
| Claude Code |               0 |        0 |       0 |     0 |             0 |
| Qwen Code   |             289 |       15 |     273 |     0 |             1 |
| **合计**    |         **395** |   **48** | **346** | **0** |         **1** |

唯一 required `NA` 是生命周期分类
`CAP-01.09-A01.availability.default_state`。`NC` 表示未调查，不是能力不存在。

## 4. Product Blocked Register

Blocked row 不是 Claim，不填写 `support_state`，也不进入 30 的分母。

### 4.1 Codex

| Blocked set                       | Prospective rows / entries | Blocker                                                                                             |
| --------------------------------- | -------------------------: | --------------------------------------------------------------------------------------------------- |
| SDK `FACT-codex-046`              |             3 generic rows | TypeScript/Python SDK package version、artifact、API/source 与实际 CLI resolution 未冻结            |
| CI `FACT-codex-049`               |                     3 rows | `openai/codex-action@v1` 是 floating major；Action commit 与实际 CLI resolution 未锁                |
| app-server ops `FACT-codex-060`   |                     3 rows | 只有未版本化 `DOC-024`；health、schema compatibility 与 overload/backpressure 未运行                |
| `FACT-codex-050` exec-server      |         1 mixed Fact entry | 现有 `CAP-10.12-A01/A03` 属 cloud task dispatch/query；standalone registration service 必须重新映射 |
| `FACT-codex-023` cloud apply/diff |          2 command entries | 顶层 local `apply` 与 cloud task/attempt `apply/diff` 的入口、lifecycle 和副作用不同                |
| IDE/Desktop/Web client            |                 未固定数量 | 只有未版本化 docs 或 CLI launcher/host command；缺 client build                                     |
| remaining unversioned docs        |     约 99 prospective rows | 网页日期不是产品版本；仍只可作为 promise/qualifier                                                  |

`EVD-codex-HELP-006` 还确认了 exec-server 的 WebSocket/stdio registration
surface，但这只缩小 mapping review，不会把它错误归入 cloud task Atomics。

### 4.2 Claude Code

| Surface / origin                          |   Rows | Blocker                                                                                                                               |
| ----------------------------------------- | -----: | ------------------------------------------------------------------------------------------------------------------------------------- |
| SDK `FACT-042 / CAP-10.06-A01..A04`       |      4 | `DOC-019=current-docs@2026-07-25`；Python/TypeScript package version、artifact、API/source 与 binary resolution 未冻结                |
| SDK derivative `FACT-052 / CAP-12.07-A03` |      1 | exact `2.1.212` changelog 是 `cli` Surface，不能支持 SDK Claim                                                                        |
| SDK derivative `FACT-054 / CAP-07.03-A01` |      1 | exact `2.1.220` changelog 是 `cli` Surface，不能支持 SDK Claim                                                                        |
| CI `FACT-035`                             |      3 | `anthropics/claude-code-action@v1` 是 floating major；Action commit 与实际 CLI resolution 未冻结；`CAP-09.01-A01` 还需 mapping review |
| remote client `FACT-008 / CAP-02.09-A04`  |      1 | exact Help/Binary 只证明 `2.1.212` CLI host；没有 web/mobile client build                                                             |
| **Secondary subtotal**                    | **10** | exact target Slice ready = `0`                                                                                                        |

另有 7 条 current CLI docs deferred（`FACT-017` 4、`FACT-019` 2、
`FACT-057` 1）。它们不属于 secondary Surface，但仍因网页快照不是产品版本而 blocked。

Claude IDE 的 `--ide` 与 remote-control host 不能复制成 client Claim；
ultrareview 调用 cloud backend 也仍是 CLI Claim，不是 Web client Surface。

### 4.3 Qwen Code

Phase 1C.1 的 prospective inventory 有 40 个 Fact→Atomic row。语义与 artifact
复核后，22 条进入正式 Claim，18 条不进入：

| Deferred / removed set      | Generic rows | Resolution                                                                                                                                                                |
| --------------------------- | -----------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IDE `FACT-008`              |            4 | `A01..A03` 等待真实 extension build/version；`A04` 被 tagged doc 直接否定为当前映射——VS Code `Run` starts a new session，没有 same-session continuation Evidence          |
| SDK `FACT-041`              |            5 | 等待真实 registry/Maven artifacts、integrity 与兼容 CLI/daemon build；generic 5 rows未来替换为 language/package/transport Slice，不与 language-expanded backlog重复相加   |
| CI `FACT-037`               |            6 | tagged recipe 指向外部 `qwen-code-action` 的 `main`，且 `qwen_cli_version` 默认 `latest`；`CAP-09.01-A01` 与 `CAP-09.05-A01` 还不匹配文档实际行为                         |
| daemon telemetry `FACT-053` |            3 | `CAP-12.03-A03` 无 daemon analytics Evidence；`A04/A07` 只有 generic settings/opt-out，未证明 daemon applicability；保留有直接 daemon spans/metrics Evidence 的 `A01/A02` |
| **未规范化 subtotal**       |       **18** | `40 - 18 = 22` formal Claims                                                                                                                                              |

SDK 旧 register 的 12 条 blocked 不是“额外 12 个能力”，而是
`CAP-10.06-A02..A05 × TypeScript/Python/Java`。诚实的下一版 SDK inventory 至少是
5 Atomics × 3 languages = 15 package Slice；Java 还需按 daemon REST/SSE 与 legacy
stdio transport 继续切分。

当前固定文档中可见候选版本字符串：

- `@qwen-code/sdk@0.1.8`
- `qwen-code-sdk@0.1.0`
- `com.alibaba:qwencode-sdk@0.1.0-alpha`

它们尚未被验证为真实已发布 artifact，也没有 artifact integrity 与兼容 daemon/CLI
Evidence，因此不能进入 Slice Registry。

## 5. Qwen Surface Inventory Projection

`FACT-qwen-code-003` 仍是 inventory，不是行为 Claim。按 Surface 重建如下：

| Surface      | Exact inventory Evidence                            | Version identity                 | Formal behavior Claim? | Reason                                                                 |
| ------------ | --------------------------------------------------- | -------------------------------- | ---------------------- | ---------------------------------------------------------------------- |
| IDE          | `EVD-qwen-code-DOC-038`                             | Qwen release commit `5610eb4...` | No                     | extension build 与 behavior contract 未冻结                            |
| Desktop      | `EVD-qwen-code-DOC-039`                             | Qwen release commit `5610eb4...` | No                     | 只有 README inventory，没有 Desktop Candidate Fact/runtime             |
| SDK / daemon | `EVD-qwen-code-DOC-040`                             | Qwen release commit `5610eb4...` | Inventory only         | daemon 正式 Claim 使用 exact package Help；SDK 仍按 artifact blocked   |
| IM bot       | `EVD-qwen-code-DOC-041`、`EVD-qwen-code-SOURCE-009` | npm `0.21.0` + release commit    | Generic Claims         | artifact 交付 channel core 与 bundled `DOC-018`；adapter parity 未建立 |

`CAP-01.08-A01/A03` 要求列出 runtime/state ownership 与 Surface 差异；README
inventory 不闭合这些结果，因此不创建形式上精确、语义上空洞的 Claim。

## 6. Evidence Relation 闭合

正式 Claim 展开后共 `62` 个 Evidence/Claim relation：

| Product     | supports | qualifies | contradicts |  Total |
| ----------- | -------: | --------: | ----------: | -----: |
| Codex       |        5 |        15 |           0 |     20 |
| Claude Code |        0 |         0 |           0 |      0 |
| Qwen Code   |       31 |        11 |           0 |     42 |
| **合计**    |   **36** |    **26** |       **0** | **62** |

关键边界：

- Codex current docs 只 `qualifies` exact `0.145.0` Claim；
- Codex exact Help 与带完整时间的 `EVD-codex-RUNTIME-003` schema 复验可以
  `supports` 有界入口/schema 陈述，但 8 条 Atomic support 仍全部 `Unknown`；
- Qwen exact serve Help 对 task/event/ownership/reconnect 只 `qualifies` daemon
  discoverability；这些协议陈述由同版本 `DOC-028` 直接支持；
- Qwen exact serve Help 对持久诊断日志只 `qualifies` daemon discoverability；
  log 路径与读取陈述由同版本 `DOC-028` 支持；
- Qwen release-commit docs 可以 `supports` “tagged docs 记录某 surface”这类有界
  陈述，不能因此把 runtime support 升级；
- Qwen exact npm artifact 的 channel core 只 `qualifies` generic `im-bot`
  release attribution/implementation surface；三条 channel runtime support 仍是
  `Unknown`；
- Qwen `/capabilities` negotiation 的负向 Claim 由同版本
  `EVD-qwen-code-DOC-044` 直接支持，
  不是从搜索无结果推断；
- 不存在跨 Surface relation、悬空 Evidence ID 或 Claim 反链缺失。

## 7. Review Gate

| Gate                                                                    | Result |
| ----------------------------------------------------------------------- | ------ |
| 正式 Claim 均有 exact version/channel/surface/platform Slice            | Pass   |
| Phase 1C.1 + 1C.2 Claim ID 全局唯一且 sequence 连续                     | Pass   |
| Evidence relation Surface 一致，`supports` version/channel 一致         | Pass   |
| 每条 Claim 展开完整 16-leaf Behavior Contract                           | Pass   |
| `Not supported` 仅由 exact、同 Surface、直接负向 Evidence 生成          | Pass   |
| Qwen 40/12 重复算术、IDE/SDK/CI artifact lock 与 mapping defects 已纠正 | Pass   |
| Codex schema generation 未被升级为 server runtime support               | Pass   |
| Claude current docs/CLI host Evidence 未伪造 secondary Slice            | Pass   |
| generator idempotency、独立 validator 与 Prettier                       | Pass   |
| 三产品专项复核与全局交叉审阅                                            | Pass   |
| Qwen 当前源码与用户既有 dirty worktree 未改变                           | Pass   |

## 8. 下一阶段入口

1C.2 冻结后，下一步不是继续扩表，而是建立 Phase 1D 高价值 Runtime Probe Queue：

1. Qwen daemon 的 health/capabilities/session/SSE 与资源守卫；
2. Codex app-server initialize 与 MCP tools/list；
3. SDK/IDE/CI artifact 版本锁；
4. 只在证据足够后进入按 capability topic 的横向 Comparison。

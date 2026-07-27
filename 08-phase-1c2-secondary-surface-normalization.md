# Codex / Claude Code / Qwen Code 对比：阶段 1C.2 Secondary Surface 规范化

> 阶段：1C.2 · Secondary Surface Claim Normalization  
> 状态：Frozen  
> Frozen at：2026-07-26T04:55:00Z  
> Registry：Revision 1，共 548 个 Atomic Capability  
> 输入：阶段 1B Candidate Facts、Phase 1C.1 Deferred Register 与新增 exact-binary Evidence  
> 输出范围：`ide`、`desktop`、`web-cloud`、`sdk-daemon`、`ci`、`im-bot`

## 1. 本阶段目标

阶段 1C.2 处理 Phase 1C.1 明确排除的 secondary Surface，并保持同一套 Claim
schema、Behavior Contract 与 Evidence Relation 规则。目标不是把 deferred 数字机械
转成 Claim，而是逐项确认：

1. secondary Surface 自身是否有精确 build、package、Action commit、发行物或可归因
   的 monorepo release commit；
2. Evidence 的 version/channel/surface 是否与 Claim 一致；
3. Candidate Fact 的 Atomic 映射是否真的满足该 Atomic 的可观察结果；
4. 文档快照、入口发现、schema surface 与 runtime behavior 是否被分开。

本阶段仍不创建 Comparison、Gap、产品排名、优先级或 roadmap。

## 2. Exact Slice 准入规则

正式 Claim 必须同时满足：

- 一个产品、一个 Atomic ID、一个 secondary Surface、一个平台/客户端切片；
- `version` 是真实产品/组件版本或 immutable commit，不能使用网页采集日期；
- Claim 所代表的运行主体可归因到该版本：
  - 与 CLI 同一发行物内的 daemon/command 可以使用 CLI package version；
  - 独立 SDK、IDE extension、Desktop/Web client、GitHub Action 必须锁自身 artifact
    或 immutable build/commit；
  - monorepo release commit 只在实现确实随该 release artifact 交付时可充当版本锁；
- 至少一个同 Surface Evidence Record；
- Candidate Fact → Atomic 映射没有被冻结 Evidence 直接否定。

以下项目不能作为 exact Slice：

- `current-docs@...`、`unversioned-docs@...`；
- floating Action major、branch `main`、默认解析 `latest` 的集成；
- CLI host 的 `--ide`、`--remote-control` 或 cloud command Help，用来替代 IDE、
  remote client 或 Web client build；
- 固定了文档 commit、但没有固定实际 SDK/extension/action artifact 的独立组件。

## 3. Surface 切分规则

### 3.1 `sdk-daemon`

共享枚举不表示共享 Slice：

- daemon 与 SDK 必须分开；
- app-server 与 MCP server 必须分开；
- SDK 必须至少按 language × package version × transport 切分；
- daemon 的 auth、workspace trust、session scope、token/no-token 和 transport 差异在
  runtime probe 后继续拆 Slice。

### 3.2 IDE、Desktop 与 Web/remote client

必须冻结实际 extension/client build。CLI launcher 或 host entry 只能证明 host
入口，不能反推客户端的 context sync、diff、same-session resume 或 ownership。

### 3.3 CI

必须同时固定：

- Action/integration immutable commit；
- 该 commit 实际 bundled、installed 或 resolved 的 CLI version；
- workflow trigger、credential 与权限切片。

版本化产品仓库中的 CI recipe 若仍引用 `main` 或默认 `latest`，只能进入 Blocked
Register。

### 3.4 IM bot

generic channel core 与具体 adapter 分开。当前 Qwen `0.21.0` 只建立 generic
`im-bot` Claim；Telegram、Weixin、QQ、DingTalk、WeCom、Feishu 的 credential、
媒体能力、重试与 `sessionScope` 不做 parity 合并。generic Slice 的 release
attribution 由 exact npm artifact 中实际交付的 channel-core chunk 与 bundled
版本文档共同建立，不只依赖 monorepo commit。

## 4. Evidence Relation 增量规则

Phase 1C.1 的关系规则继续生效：

- `supports`：Evidence 直接证明 Claim 的有界陈述；若 Claim 是“versioned docs
  记录某入口”，`supports` 不等于 Atomic runtime 已闭合。
- `qualifies`：只补边界，或 version 不一致但 Surface 一致。
- `contradicts`：直接冲突；Claim 必须记录冲突字段，或重写成有直接负向 Evidence
  支持的 scoped negative Claim。
- 不允许跨 Surface relation。CLI Evidence 不能通过改写 Claim Surface 来复用。
- Claim 的 `last_checked` 不得早于任何关联 Evidence 的 `captured_at`。

本阶段新增：

- `EVD-codex-HELP-006`：exact `0.145.0/latest/sdk-daemon` Help；
- `EVD-codex-RUNTIME-002`：保留首次 exact app-server schema generation 原始记录，
  不用复验回填缺失的精确起止时间；
- `EVD-codex-RUNTIME-003`：新增的定时复验，用 canonical JSON hash 处理
  definition order 非确定性，正式 Claim 改指该完整记录；
- `EVD-qwen-code-DOC-044`：exact release 文档中 capability discovery 与真正
  feature negotiation 的 scoped negative 边界；
- `EVD-qwen-code-SOURCE-009`：exact npm artifact 中交付的 generic channel core
  与 bundled channel 文档，用于 `im-bot` release attribution。

这些记录修复 Surface、负向范围或 release attribution 缺口，但不证明 daemon 或
channel 正常运行。

## 5. Support State 策略

- `Supported`：精确切片的 Atomic outcome 已闭合，或 Atomic 本身就是可直接确认的
  生命周期/发行身份分类。
- `Partial`：精确直接 Evidence 已闭合至少一个可观察行为/门禁结果，但其他必要结果
  仍未闭合；Help 中的 flag 声明值本身不够。
- `Not supported`：精确、同 Surface、一方 Evidence 直接说明该 scoped outcome
  当前不存在或属于未来工作；不能从“未找到”推断。
- `Unknown`：只有入口、schema、versioned docs、implementation surface，或
  Candidate Fact 尚未通过 runtime。

本阶段唯一 `Not supported` 是：

- Qwen Code `0.21.0/sdk-daemon/CAP-10.08-A01`：tagged `qwen serve` 文档把
  `/capabilities` 的实际 feature negotiation 明列为后续工作；当前只记录单向
  capability discovery。该结论只适用于这个精确 daemon 文档/发行切片，不扩展为
  产品级否定。

Qwen `CAP-01.09-A01` 的 Stage 1 lifecycle 分类可为 `Supported`；
`CAP-01.09-A02` 只有 `--http-bridge` flag 的 Help 声明值，干净配置下的默认状态、
启停、持久与失败结果都未运行，因此仍为 `Unknown`。唯一 `Not supported` 属高影响
结论但只有一条独立直接负向证据链，`confidence=Medium`。

## 6. Behavior Contract 与 ID

- 继续使用 `EP/IN/AD/AG/SX/SO/PE/OH/RM/CE/CC/CL/FS/EB/SB/OB` 16 个叶。
- Registry 未要求的叶为 `NA`；要求但未调查的叶为 `NC`。
- 多 Atomic Fact 不共享整段 observation 的合同值。只有被具体 Evidence 收窄的叶
  才能写 `R[...]`。
- required leaf 使用 `NA` 的唯一允许例外仍是
  `CAP-01.09-A01.availability.default_state`。
- Claim sequence 在 Phase 1C.1 与 1C.2 间全局连续。相同产品/Atomic 已有 CLI
  `-001` 时，secondary Claim 使用 `-002`，不能覆盖或合并。

## 7. Deferred 算术纠正

[`07-phase-1c-coverage-and-open-claims.md`](./07-phase-1c-coverage-and-open-claims.md)
记录的是 Phase 1C.1 结束时的 prospective inventory，不是 1C.2 正式 Claim
承诺。语义复核后：

- Qwen 的“40 exact + 12 additional”不是互斥集合；
- 12 条 SDK row 是 `CAP-10.06-A02..A05` 按三种语言展开，不能与同四个 generic
  row 重复相加；
- Qwen CI 文档虽然固定到产品 commit，却引用外部 Action `main`，且
  `qwen_cli_version` 默认 `latest`；
- IDE extension 与三种 SDK artifact 没有完成自身版本锁；
- 多个 Candidate Atomic 与冻结文档的实际语义不匹配。

因此本阶段以
[`09-phase-1c2-coverage-and-open-claims.md`](./09-phase-1c2-coverage-and-open-claims.md)
为正式覆盖与 Blocked Register，旧 prospective 数字只保留历史 provenance。

## 8. Review Gate

冻结前必须满足：

- 三份 product Claim 文档与 generator 输出一致；
- Claim ID 在 Phase 1C.1 + 1C.2 全局无重复，sequence 连续；
- 每条正式 Claim 的 version/channel/surface 与 Slice 完整；
- 每条 Evidence relation 的 Surface 一致；`supports` 的 version/channel 一致；
- `Not supported` 只有直接、精确、同 Surface 负向 Evidence；
- Qwen SDK、IDE、CI 与 mapping defects 全部进入 Blocked Register；
- Codex schema generation 不被升级为 server runtime support；
- Claude Code 没有用 current docs、CLI changelog 或 host Help伪造 secondary Slice；
- 所有 contract required leaf 都为 `R[...]`、`NC`、`U` 或经批准的 `NA`；
- formatter、generator idempotency、独立 validator 与交叉审阅通过；
- 未修改 Qwen 当前源码，未创建 Comparison、Gap、优先级或 roadmap。

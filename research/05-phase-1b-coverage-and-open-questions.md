# Codex / Claude Code / Qwen Code 对比：阶段 1B 覆盖度与开放问题

> 阶段：1B · Coverage Gate  
> Registry：Revision 1，共 548 个 Atomic Capability  
> 本文只统计事实发现与证据覆盖，不进行跨产品优劣判断。

## 1. 覆盖口径

本阶段使用三种互不替代的计数：

- **Registry records**：冻结注册表中的 Atomic Capability 数量。
- **Candidate facts**：产品事实画像中已发现、已映射 Atomic ID 且有 Evidence 回链的
  单产品事实。
- **Distinct mapped atoms**：至少被一条 Candidate Fact 映射的不同 Atomic ID。

`Distinct mapped atoms / Registry records` 不是“产品支持率”。未映射可能表示不适用、
未检查、需要认证/套餐，或证据不足；只有阶段 1C 的正式 Claim 才能填写
`Supported / Partial / Not supported / Unknown`。

## 2. Registry 基数

| 能力域                               | Registry records | Codex mapped atoms | Claude Code mapped atoms | Qwen Code mapped atoms |
| ------------------------------------ | ---------------: | -----------------: | -----------------------: | ---------------------: |
| `CAP-01` 发布与产品边界              |               39 |                 10 |                        8 |                      9 |
| `CAP-02` 交互与客户端形态            |               40 |                  9 |                        9 |                     15 |
| `CAP-03` Agent 执行循环              |               37 |                  7 |                        7 |                     10 |
| `CAP-04` 上下文、会话与记忆          |               50 |                 12 |                       16 |                     24 |
| `CAP-05` 代码与环境工具              |               55 |                  8 |                       13 |                     26 |
| `CAP-06` 权限、安全与治理            |               48 |                 13 |                       10 |                     17 |
| `CAP-07` 扩展机制                    |               54 |                 17 |                       16 |                     29 |
| `CAP-08` 多 Agent、任务与隔离        |               49 |                 17 |                       15 |                     25 |
| `CAP-09` 软件交付与协作系统          |               42 |                  5 |                        4 |                     13 |
| `CAP-10` 自动化与编程接入            |               46 |                 20 |                       15 |                     29 |
| `CAP-11` 模型、Provider 与运行经济性 |               41 |                  7 |                       11 |                     19 |
| `CAP-12` 可观测性、可靠性与运维      |               47 |                 11 |                       12 |                     20 |
| **合计**                             |          **548** |            **136** |                  **136** |                **236** |

阶段 1C 的按列解析复核发现，旧计数器把
`FACT-qwen-code-026` limitations 中明确写作“不据此判断”的
`CAP-07.02-A05/A06` 也当成了映射，其中 A05 不在该 Fact 的 Atomic ID(s)
单元格。以上数字已改为只读取 Atomic ID(s) 列；Qwen 的 Fact→Atomic 关联为 245，
distinct mapped atoms 为 236。

## 3. 证据覆盖

| 产品        | Candidate facts | Product aliases | Evidence records | 覆盖的一级域 | 发行物 / Help                           | 官方文档                | Source / Binary      | 认证 Runtime             |
| ----------- | --------------: | --------------: | ---------------: | -----------: | --------------------------------------- | ----------------------- | -------------------- | ------------------------ |
| Codex       |              60 |              26 |               34 |      12 / 12 | `META 1`、`HELP 5`、version `RUNTIME 1` | `DOC 26`                | `SOURCE 1`           | 0；只复现 `--version`    |
| Claude Code |              57 |              40 |               32 |      12 / 12 | `META 1`、`HELP 3`、version `RUNTIME 1` | `DOC 24`、`CHANGELOG 2` | `BINARY 1`           | 0；只复现 `--version`    |
| Qwen Code   |              53 |              47 |               60 |      12 / 12 | `META 2`、`HELP 5`                      | `DOC 43`                | `SOURCE 8`、`TEST 2` | 0；只执行 version / Help |

Qwen 的 mapped atoms 数量更高，主要因为其 `0.21.0` tag 同时提供版本化文档和公开
源码，可在发现阶段建立更宽的候选映射；这不是支持率，也不是产品优劣结论。

## 4. 产品特定开放问题

| 产品        | 已知边界与冲突                                                                                                                                                                     | 阶段 1C 的最小验证方向                                                                                                      |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Codex       | CLI `0.145.0` 与 `unversioned-docs@2026-07-25` 分属不同切片；IDE、desktop、cloud、SDK 等当前文档不能静默回填为 CLI runtime                                                         | 先验证 `exec` I/O、session、sandbox/approval；需登录或远端写入的 Surface 单独建 gate                                        |
| Claude Code | stable 主基线为 `2.1.212`；`2.1.220` 仅保留四条 latest changelog delta，未下载 runtime；current CLI docs、SDK docs 与 Action v1 docs 分属独立切片，未标最低版本的行为不回填 stable | 优先验证 stable 的 headless、session、permission/sandbox；checkpoint current-docs、SDK/CI 与 latest delta 各自另建 snapshot |
| Qwen Code   | Approval 默认姿态在官方文档内部冲突；Agent Team 的 release source / npm chunk 与 Arena 文档冲突，当前为 `Unknown`                                                                  | 用干净配置和隔离仓库验证默认 approval；对 Team 只做注册条件、feature flag 和只读 discoverability probe                      |

## 5. 共同开放问题

以下问题默认进入阶段 1C，不能由命令名称或可变网页单独回答：

- 需要登录、订阅、组织策略或 region 才能验证的 entitlement。
- Interactive TUI 中的焦点、快捷键、流式渲染、取消和恢复行为。
- 真实工具执行时的审批、sandbox、网络边界和拒绝路径。
- Session、memory、background task 与 remote task 的跨重启、跨设备持久化。
- 多 Agent 的并发、隔离、steering、取消和失败传播。
- Hooks、MCP、Plugins / Extensions / Skills 的动态加载、信任和故障隔离。
- Headless / SDK / daemon 的事件顺序、背压、取消、结构化错误和进程退出语义。
- 企业管理、审计、数据保留与遥测 opt-out 的实际强制效果。

## 6. 阶段 1B Review Gate 结果

完成时间：`2026-07-25T15:41:19Z`。

- 三份画像共 `170` 条 Candidate Fact、`113` 条 Product Alias、`126` 条
  Evidence Record。
- 每条 Fact 至少映射一个 Registry Revision 1 Atomic ID，并回链 Evidence；Fact、
  Alias、Evidence ID 均唯一，正反引用无缺失或悬空。
- Evidence 的版本、channel 和单一 `product_surface` 可无损还原；Qwen 原先跨
  Surface 的 README、settings 和 telemetry 证据已拆成独立记录。
- Alias 均为一个 Atomic ID、一个 product surface 和一个 exact product term；
  Qwen 的短/长参数及同义 slash command 已拆成独立记录。
- Codex 与 Claude 的 current docs、Claude latest delta、Qwen stable tag 均与主
  runtime 切片分开；没有把当前 dirty checkout 纳入 Qwen `0.21.0` 事实。
- Evidence 表中的 `Discovery links` 已与规范 `record_relations` 区分；正式
  `CCQ-*` 关系留到阶段 1C。
- 交叉审阅移除了无法由现有证据支撑的 Atomic 映射，并保留显式 Unknown / conflict；
  本阶段未创建 `support_state`、Comparison、Gap、优先级或 roadmap。

## 7. 阶段 1C 输入门槛

进入正式 Claim 与 Runtime Probe 前，每个候选原子能力应具备：

1. 一个明确的产品切片：版本、channel、surface、平台与 gate。
2. 至少一条直接 Evidence；高影响行为还需要第二条独立证据链。
3. 需要验证的最小行为契约字段和可证伪结果。
4. 安全、认证、外部写操作和清理要求。
5. 不能在真实用户仓库或真实协作系统中盲测的边界。

阶段 1C 优先顺序按“用户价值、证据缺口和验证风险”确定，不按产品功能数量或 mapped
atoms 数量排序。

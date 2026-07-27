# Codex / Claude Code / Qwen Code 对比：中立能力地图

> 阶段：0 · Taxonomy 冻结  
> 依赖：[00-scope-and-version-lock.md](./00-scope-and-version-lock.md)、[01-methodology.md](./01-methodology.md)

## 1. 设计目标

本能力地图按用户任务和行为边界组织，不照搬 Codex、Claude Code 或 Qwen Code 的菜单、命令名和营销术语。

阶段 0 只定义“要比较什么”，不填写三款产品的支持状态。某产品没有对应名称，不代表没有能力；某产品存在对应名称，也不代表行为等价。

## 2. Topic 与原子能力

本文中的 `CAP-xx.yy` 是 topic ID，用于定义研究范围，不直接填写产品支持状态。
阶段 1 必须先建立并冻结三款产品共用的原子能力注册表，再开始任何一份产品事实
画像。一个 topic 要拆成可以独立支持、独立验证、独立取舍的原子能力，例如：

```text
CAP-02.10       UI 与可访问性 topic
CAP-02.10-A01   主题配置
CAP-02.10-A02   状态栏配置
CAP-02.10-A03   国际化
CAP-02.10-A04   屏幕阅读器支持
```

只有 `CAP-xx.yy-Axx` 原子能力可以进入事实矩阵、Gap 和路线图。Atomic
Capability、Claim、Evidence、Comparison 与 Qwen Mapping Record 的唯一字段规范见
[研究方法第 2、4、7、10 节](./01-methodology.md)；本文不维护第二份字段枚举。

统一注册表冻结后，三份产品画像必须复用相同 ID 和受控的
`required_contract_dimensions` 路径。发现遗漏时先提升 Registry Manifest 的全局
`revision`、记录新增原因、受影响 ID 和迁移方式，再创建 Claim；不得在单个产品
画像里私自追加 `Axx`。

## 3. 一级能力域

| ID | 能力域 | 核心问题 |
| --- | --- | --- |
| `CAP-01` | 发布与产品边界 | 用户得到的到底是哪一个版本、二进制和产品 Surface？ |
| `CAP-02` | 交互与客户端形态 | 用户通过哪些界面输入、控制和查看任务？ |
| `CAP-03` | Agent 执行循环 | Agent 如何计划、执行、验证、接受转向并可靠结束？ |
| `CAP-04` | 上下文、会话与记忆 | 信息如何进入上下文、被压缩、持久化、恢复和复用？ |
| `CAP-05` | 代码与环境工具 | Agent 能观察和改变哪些本地或远端环境？ |
| `CAP-06` | 权限、安全与治理 | 谁允许什么副作用，边界如何执行和审计？ |
| `CAP-07` | 扩展机制 | 用户和组织如何增加命令、知识、工具、事件处理和集成？ |
| `CAP-08` | 多 Agent、任务与隔离 | 工作如何分解、并行、通信、隔离和回收？ |
| `CAP-09` | 软件交付与协作系统 | 产品如何与 Issue、VCS、Review、PR、CI 和发布系统交互？ |
| `CAP-10` | 自动化与编程接入 | 如何在无人值守、SDK、daemon、CI 和远端系统中运行？ |
| `CAP-11` | 模型、Provider 与运行经济性 | 如何选择和控制模型、协议、路由、缓存、成本和资源？ |
| `CAP-12` | 可观测性、可靠性与运维 | 如何诊断、量化、恢复和演进生产使用？ |

## 4. `CAP-01` 发布与产品边界

- `CAP-01.01` 安装方式：native installer、package manager、standalone、源码运行。
- `CAP-01.02` wrapper 与实际平台实现包映射。
- `CAP-01.03` stable、latest、preview、alpha、nightly 和版本 pin。
- `CAP-01.04` 自动升级、手动升级、回滚和最低/最高版本策略。
- `CAP-01.05` OS、arch、shell、Node/runtime 和容器要求。
- `CAP-01.06` binary checksum、签名、SBOM、provenance 和供应链验证。
- `CAP-01.07` 开源范围：完整实现、部分客户端、schema、仅 changelog 或闭源 binary。
- `CAP-01.08` 产品 Surface 边界及能力是否共享同一 runtime。
- `CAP-01.09` stable、preview、experimental、alpha、deprecated、removed、dev-only 生命周期及默认/opt-in 状态。
- `CAP-01.10` deprecation、breaking change、迁移说明和兼容窗口。
- `CAP-01.11` 产品登录、账号、组织、订阅、entitlement、region 和使用资格。
- `CAP-01.12` announced、roadmap 等未来承诺及其与已发布能力的隔离。

## 5. `CAP-02` 交互与客户端形态

- `CAP-02.01` Interactive CLI / TUI。
- `CAP-02.02` prompt、slash command、shell shortcut、文件引用和粘贴输入。
- `CAP-02.03` 图片、音频、截图和其他多模态输入。
- `CAP-02.04` 流式文本、Markdown、diff、tool call 和进度呈现。
- `CAP-02.05` 键盘、鼠标、Vim mode、history、搜索和快捷键。
- `CAP-02.06` IDE / editor integration 及上下文同步。
- `CAP-02.07` Desktop 客户端。
- `CAP-02.08` Web / cloud / remote execution 和远程接管。
- `CAP-02.09` 会话列表、导航、通知和跨设备接续。
- `CAP-02.10` 主题、状态栏、布局、自定义 UI、i18n 和 accessibility。

## 6. `CAP-03` Agent 执行循环

- `CAP-03.01` 任务理解、仓库导览和目标澄清。
- `CAP-03.02` 显式规划、计划产物、用户批准和执行模式切换。
- `CAP-03.03` 工具选择、调用、结果回传和 continuation loop。
- `CAP-03.04` 结构化任务、进度、目标和完成状态模型。
- `CAP-03.05` 编辑后的测试、lint、typecheck、build 和行为验证。
- `CAP-03.06` Agent 自检、结果复核和证据审查；面向用户交付的 Review 归 `CAP-09.03`。
- `CAP-03.07` 用户 steering、排队输入、follow-up 和中途改向。
- `CAP-03.08` interrupt、cancel、stop、pause、resume 和 attach。
- `CAP-03.09` 长任务 continuation、background execution 和 terminal condition。
- `CAP-03.10` 超时、重试、断线恢复、崩溃恢复和 cleanup。
- `CAP-03.11` 完成条件、最终响应、未完成状态和 blocked 语义。
- `CAP-03.12` 循环检测、预算、最大 turn 和 runaway protection。

## 7. `CAP-04` 上下文、会话与记忆

- `CAP-04.01` 仓库发现、指令文件和作用域/优先级。
- `CAP-04.02` 文件、目录、Git diff、选区和编辑器上下文注入。
- `CAP-04.03` ignore 规则、敏感文件和上下文排除。
- `CAP-04.04` 多目录、多仓库和动态添加 workspace root。
- `CAP-04.05` 上下文选择、代码搜索、语义检索和索引。
- `CAP-04.06` token 计量、剩余上下文显示和输入预算。
- `CAP-04.07` 自动/手动 compaction、摘要质量和恢复语义。
- `CAP-04.08` 上下文与 tool schema 对 cache key、命中率和 session 连续性的影响。
- `CAP-04.09` transcript、session history、命名、搜索和导出。
- `CAP-04.10` resume、continue、fork、branch、rewind 和 retry。
- `CAP-04.11` 本地、项目、用户、组织和跨设备 memory。
- `CAP-04.12` memory recall、写入、删除、冲突和隐私边界。
- `CAP-04.13` 从其他 agent 导入设置、会话、命令和记忆。

## 8. `CAP-05` 代码与环境工具

- `CAP-05.01` 文件列举、读取、批量读取和编码处理。
- `CAP-05.02` 文件名、文本、regex、Git 和语义搜索。
- `CAP-05.03` 单文件编辑、patch、multi-file edit、create 和 delete。
- `CAP-05.04` Notebook、结构化文件和生成文件处理。
- `CAP-05.05` Shell、PTY、环境变量、stdin/stdout/stderr 和 exit code。
- `CAP-05.06` 前台/后台进程、长命令、monitor 和进程回收。
- `CAP-05.07` test、build、lint、typecheck、formatter 和 package manager。
- `CAP-05.08` debugger、LSP、code intelligence 和 diagnostics。
- `CAP-05.09` Git status、diff、log、branch、worktree、commit 和 merge。
- `CAP-05.10` Web fetch、Web search 和受控 network access。
- `CAP-05.11` 网页、浏览器和桌面 GUI 的观察与操作。
- `CAP-05.12` 图片查看/缩放、音频、可视化、preview 和 artifact。
- `CAP-05.13` tool result truncation、附件、引用和大输出处理。

## 9. `CAP-06` 权限、安全与治理

- `CAP-06.01` workspace trust、trusted folder 和首次进入门禁。
- `CAP-06.02` ask、allow、deny、auto、full-access 等 approval mode。
- `CAP-06.03` 命令、路径、工具、域名和副作用规则语言。
- `CAP-06.04` read/write/execute 权限的分离与继承。
- `CAP-06.05` filesystem、process、network、container、VM 和 OS sandbox。
- `CAP-06.06` command injection、substitution、shell wrapper 和解释器防护。
- `CAP-06.07` secrets、credentials、redaction、data retention 和隐私。
- `CAP-06.08` MCP、Hooks、Plugins、Skills 和 Subagents 的权限传播。
- `CAP-06.09` managed settings、organization policy 和不可覆盖配置。
- `CAP-06.10` 审计事件、compliance、zero-data-retention 和企业控制。
- `CAP-06.11` 未知、未信任、初始化、draining、removed 状态的 fail-closed 语义。
- `CAP-06.12` permission denial 的 UI、retry、model feedback 和自动化行为。

## 10. `CAP-07` 扩展机制

- `CAP-07.01` 自定义命令、prompt template 和参数。
- `CAP-07.02` Skills 的发现、调用、依赖、资源和 progressive disclosure。
- `CAP-07.03` Hooks / lifecycle events、输入输出协议、同步/异步和错误处理。
- `CAP-07.04` MCP tools、resources、prompts、auth、transport 和 reconnect。
- `CAP-07.05` Plugins / Extensions 的安装、更新、卸载、市场和组织分发。
- `CAP-07.06` 自定义 Agent、tool allowlist、model 和 system prompt。
- `CAP-07.07` 外部 connectors、apps、channel adapters 和 data sources。
- `CAP-07.08` user、project、workspace、organization scope 和优先级。
- `CAP-07.09` 名称冲突、shadowing、版本依赖和热加载。
- `CAP-07.10` trust、签名、sandbox、secret 和供应链边界。
- `CAP-07.11` interactive、headless、subagent 和 remote surface 的一致性。

## 11. `CAP-08` 多 Agent、任务与隔离

- `CAP-08.01` 内置/自定义 Subagent 定义、角色和发现。
- `CAP-08.02` delegation、fork、spawn 和任务输入继承。
- `CAP-08.03` 并行执行、fan-out、concurrency limit 和资源预算。
- `CAP-08.04` parent/child、peer、team 和层级协作模型。
- `CAP-08.05` agent 间消息、共享上下文、artifact 和结果聚合。
- `CAP-08.06` tool、permission、model、memory 和 instruction 继承。
- `CAP-08.07` background agent、detach、attach、monitor 和 roster。
- `CAP-08.08` workspace、worktree、branch、filesystem 和 runtime 隔离。
- `CAP-08.09` nested agent、递归深度和 transcript forwarding。
- `CAP-08.10` failure propagation、partial result、cancel 和 cleanup。
- `CAP-08.11` session resume、重启恢复和长时间存活。
- `CAP-08.12` 多智能体对比、协作组和群体编排的真实行为边界。

## 12. `CAP-09` 软件交付与协作系统

- `CAP-09.01` Issue / work item 的读取、搜索、创建、更新、指派和关联。
- `CAP-09.02` PR / MR 的 metadata、diff、checks、reviewers 和状态读取。
- `CAP-09.03` 面向用户请求的代码/安全 Review、finding 分级和定位。
- `CAP-09.04` Review comment、thread、resolve、reply 和变更后的复核。
- `CAP-09.05` CI check、run、log、artifact、重跑和基础设施失败识别。
- `CAP-09.06` branch、commit、push、fork/upstream 和远端状态变更。
- `CAP-09.07` PR / MR 创建、描述模板、更新、reviewer 和合并门禁。
- `CAP-09.08` 多仓库与隔离 checkout 的工作流编排；隔离语义主归属 `CAP-08.08`。
- `CAP-09.09` release、deploy、rollback 和外部 change-management 系统。
- `CAP-09.10` 团队规范、仓库指令和 review gate 执行。
- `CAP-09.11` 外部写操作的幂等性、审批、失败恢复和审计链接。
- `CAP-09.12` Issue → commit → PR → CI → release 的追踪关系。

## 13. `CAP-10` 自动化与编程接入

- `CAP-10.01` print/exec/headless/batch 模式。
- `CAP-10.02` stdin、prompt file、working directory 和 environment 输入。
- `CAP-10.03` JSON、stream-json、schema 和 structured output。
- `CAP-10.04` 事件类型、顺序、关联 ID、backpressure 和兼容版本。
- `CAP-10.05` exit code、stderr、partial output 和 machine-readable error。
- `CAP-10.06` TypeScript、Python、Java 或其他 Agent SDK。
- `CAP-10.07` daemon、app server、serve runtime、HTTP/SSE/WebSocket/ACP。
- `CAP-10.08` client capability negotiation、session ownership 和 reconnect。
- `CAP-10.09` CI、GitHub Action 和无人值守 credential flow。
- `CAP-10.10` scheduled task、monitor、notification 和 webhook。
- `CAP-10.11` channel / IM / bot 接入及消息投递语义。
- `CAP-10.12` remote worker、cloud task、callback 和长任务生命周期。

## 14. `CAP-11` 模型、Provider 与运行经济性

- `CAP-11.01` 模型 Provider credential、endpoint 和协议认证；产品账号与 entitlement 归属 `CAP-01.11`。
- `CAP-11.02` OpenAI、Anthropic、Gemini 等协议兼容层。
- `CAP-11.03` 模型发现、选择、别名、fallback 和 capability negotiation。
- `CAP-11.04` 推理预算、延迟/质量档位、阶段专用模型和子任务模型。
- `CAP-11.05` system identity、system prompt 和 repository instruction 组合。
- `CAP-11.06` text、image、audio 和 tool-calling 能力路由。
- `CAP-11.07` streaming、retry、rate limit 和 provider error normalization。
- `CAP-11.08` Provider 暴露的 token cache 控制、TTL、计量和计费语义。
- `CAP-11.09` token、cost、quota、usage credit 和预算提示。
- `CAP-11.10` latency、parallel request、context window 和吞吐控制。
- `CAP-11.11` provider/model 切换时的 session、tool schema 和能力降级。
- `CAP-11.12` 模型不可用、认证失败和不兼容时的 fallback / fail-fast。

## 15. `CAP-12` 可观测性、可靠性与运维

- `CAP-12.01` status、stats、context、cost 和任务进度。
- `CAP-12.02` debug mode、日志文件、verbose transcript 和诊断命令。
- `CAP-12.03` telemetry、trace、span、metrics、analytics 和 opt-out。
- `CAP-12.04` session、tool、subagent、provider 和 external action correlation。
- `CAP-12.05` health check、doctor、capability/version negotiation。
- `CAP-12.06` error taxonomy、用户 remediation 和 support bundle。
- `CAP-12.07` crash、OOM、listener/process leak 和资源回收。
- `CAP-12.08` output budget、backpressure、MCP budget 和并发守卫。
- `CAP-12.09` 配置层级、配置检查、schema 和迁移。
- `CAP-12.10` daemon / remote worker 部署、升级和 rollout。
- `CAP-12.11` feature flag、实验开关、灰度和 rollback。
- `CAP-12.12` 安装完整性、自动更新失败和版本漂移诊断。
- `CAP-12.13` 运行记录、replay、评测、benchmark harness 和回归比较。

## 16. 后续统一验证场景

能力矩阵完成后，从以下场景选择高价值和高争议项做三方同口径验证：

| ID | 场景 | 主要覆盖能力 |
| --- | --- | --- |
| `SCN-01` | 新仓库导览并回答架构问题 | CAP-02、03、04、05 |
| `SCN-02` | 小型 bug 复现、修复与回归验证 | CAP-03、05、06、09 |
| `SCN-03` | 多文件 feature 与计划确认 | CAP-03、04、05、09 |
| `SCN-04` | 长时间测试或后台命令的监控与取消 | CAP-03、05、08、12 |
| `SCN-05` | 多 Agent 并行调查并聚合结果 | CAP-03、08、12 |
| `SCN-06` | Worktree 隔离的并行实现 | CAP-06、08、09 |
| `SCN-07` | PR Review、CI 失败定位和最小修复 | CAP-05、06、09、10 |
| `SCN-08` | Headless 结构化输出与恢复 session | CAP-04、06、10、12 |
| `SCN-09` | MCP / Skill / Hook 的安装、调用和拒绝路径 | CAP-06、07、10 |
| `SCN-10` | 受限网络和只读 workspace 下安全失败 | CAP-05、06、11、12 |
| `SCN-11` | IDE、Desktop 或 Web 接续同一任务 | CAP-02、04、10 |
| `SCN-12` | 断线、崩溃或重启后的恢复与清理 | CAP-03、04、08、12 |

## 17. Taxonomy 使用规则

- `CAP-xx.yy` 只作为 topic；阶段 1 统一冻结的 `CAP-xx.yy-Axx` 才能填写
  `support_state`、`lifecycle_stage` 和优先级。
- 一项原子事实选择一个 primary owner，必要时添加 cross-reference，避免在多个章节重复计数。
- 产品专有名称作为 alias 记录，不升级为一级分类。
- 一项能力若只在特定 Surface、套餐、provider 或 feature flag 下成立，必须拆分 Claim。
- 稳定能力与 experimental/dev-only 能力分行记录。
- “功能存在”与生命周期分别记录为 `support_state` 和 `lifecycle_stage`。
- 阶段 1 可以新增原子能力，但必须先更新统一注册表及 revision，并说明当前
  taxonomy 无法表达的用户任务；不能因看到一个竞品命令就随意扩容。

常见交叉项按以下规则选择主归属：

- 工具是否能执行某操作归 `CAP-05`；该操作如何组成 Issue/PR/CI 用户流程归 `CAP-09`。
- Agent 内部验证决策归 `CAP-03`；测试命令原语归 `CAP-05.07`；端到端用户旅程只在验证场景中映射，不重复计分。
- Worktree 命令原语归 `CAP-05.09`，隔离与状态所有权归 `CAP-08.08`，跨仓库工作流编排归 `CAP-09.08`。
- 上下文连续性和 cache-key 语义归 `CAP-04.08`，Provider 暴露的 cache 控制、计费和经济性归 `CAP-11.08`。
- 单 Agent continuation/cancel 归 `CAP-03`，多 Agent delegation/cleanup 归 `CAP-08`，transport backpressure 与资源守卫归 `CAP-12`。
- Agent 自审归 `CAP-03.06`，面向用户交付的 Review 产品流程归 `CAP-09.03`。

## 18. 阶段 0 Taxonomy Review Gate

进入阶段 1 前需确认：

- 12 个能力域覆盖目标范围，且一级分类不以任一产品菜单组织。
- Topic 与原子能力两级 ID 可执行；只有原子能力进入矩阵、Gap 和 roadmap。
- 阶段 1 的首个 Gate 是冻结统一原子能力注册表，三份产品画像不能各自拆分 ID。
- 产品身份/entitlement 与模型 Provider 认证已经分开。
- 工具原语、Agent 控制、多 Agent 隔离、软件交付流程和运维能力的主归属清楚。
- 产品专有名称只作为阶段 1 alias，不作为 taxonomy 主名称。
- 统一验证场景足以选择第一轮高价值 runtime probes。

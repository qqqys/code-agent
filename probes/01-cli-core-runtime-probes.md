# Codex / Claude Code / Qwen Code：CLI Runtime Probe Catalog

> 阶段：1C.1 · Probe Design  
> 状态：只设计，未执行  
> 目标：把 CLI Claim 中的 `Unknown / Partial / NC / U` 转为可复现 Evidence  
> 禁止：真实用户仓库写入、真实 PR/评论/消息、生产凭据、未经授权的模型费用

## 1. 执行原则

每个 probe 必须使用一次性临时目录、独立配置根和可销毁 fixture。若产品不能重定向
配置根，停止执行并把它记录为 gate；不能回退到用户真实配置。

每次执行都要保存：

- 产品、精确 binary/package version、hash、channel；
- OS、arch、shell、TTY/non-TTY 与 isolation；
- authentication、entitlement、region、provider、model、configuration、
  feature flags；
- 完整命令、stdin、stdout、stderr、exit code、事件时间线；
- 探测前后文件树、子进程、网络目标、外部状态和 cleanup 结果；
- 对应 Claim ID、Evidence ID，以及 `supports / qualifies / contradicts` 关系。

所有 probe 先跑最小 discoverability，再跑正常路径、gate、失败/取消/恢复和 cleanup。
“命令存在”不算正常路径成功；“没看到入口”不算 `Not supported`。

## 2. 风险级别

| Risk | 边界                                               | 自动执行策略                              |
| ---- | -------------------------------------------------- | ----------------------------------------- |
| `R0` | 精确 version、Help、schema 等无认证只读发现        | 可在临时 cwd 复跑                         |
| `R1` | 只在新建临时 repo/config root 内产生本地文件或进程 | 先验证重定向和 cleanup，再执行            |
| `R2` | 登录、模型调用、费用或只读外部网络                 | 需专项授权与测试账号；不读取现有凭据      |
| `R3` | 外部写入、PR/评论/消息、扩展安装或遥测外发         | 必须逐 probe 授权并使用 disposable target |
| `R4` | restore/delete、安全逃逸、进程树或数据丢失风险     | 独立 fixture、备份、人工确认和硬超时      |

若一个 probe 同时命中多个级别，按最高风险处理。

## 3. Probe 总表

| Probe ID       | 主题                                      | 主要 Atomic                                                                    | Codex    | Claude | Qwen | Risk    | 当前状态               |
| -------------- | ----------------------------------------- | ------------------------------------------------------------------------------ | -------- | ------ | ---- | ------- | ---------------------- |
| `PRB-CLI-001`  | 发行身份与 Help 可发现性                  | `CAP-01.03-A02`, `CAP-01.08-A01`                                               | 是       | 是     | 是   | `R0`    | 可复用既有 Evidence    |
| `PRB-CLI-002`  | Headless 输入、输出与退出                 | `CAP-10.01`, `CAP-10.02`, `CAP-10.03`, `CAP-10.05`                             | 是       | 是     | 是   | `R2`    | 待授权                 |
| `PRB-CLI-002B` | TTY Interactive Dual Output sidecar       | `CAP-10.03-A02`                                                                | 否       | 否     | Qwen | `R1/R2` | 待 fixture 与授权      |
| `PRB-CLI-003`  | Session 创建、继续、分支与 ephemeral      | `CAP-04.09`, `CAP-04.10`                                                       | 是       | 是     | 是   | `R2/R4` | 待授权                 |
| `PRB-CLI-004`  | Plan 与 approval 默认姿态                 | `CAP-03.02`, `CAP-06.02`                                                       | 是       | 是     | 是   | `R2/R4` | 待授权                 |
| `PRB-CLI-005`  | 文件系统 sandbox 与路径拒绝               | `CAP-06.03`, `CAP-06.05`                                                       | 是       | 是     | 是   | `R2/R4` | 待授权                 |
| `PRB-CLI-006`  | 网络 sandbox 与目标规则                   | `CAP-06.04`, `CAP-06.05`                                                       | 是       | 是     | 是   | `R2/R4` | 待授权                 |
| `PRB-CLI-007`  | 取消、SIGTERM 与子进程回收                | `CAP-03.08`, `CAP-05.06`, `CAP-12.07`                                          | 是       | 是     | 是   | `R2/R4` | 待授权                 |
| `PRB-CLI-008`  | Context 压缩与约束保留                    | `CAP-04.06`, `CAP-04.07`                                                       | 是       | 是     | 是   | `R2/R4` | 待授权                 |
| `PRB-CLI-009`  | 本地 MCP discovery、调用与重连            | `CAP-07.04`                                                                    | 是       | 是     | 是   | `R1/R2` | 待 fixture             |
| `PRB-CLI-010`  | Hook 顺序、阻断、超时与隔离               | `CAP-07.03`                                                                    | 是       | 是     | 是   | `R1/R2` | 待 fixture             |
| `PRB-CLI-011`  | Skill / plugin / extension 生命周期       | `CAP-07.02`, `CAP-07.05`                                                       | 是       | 是     | 是   | `R1/R3` | 待 fixture             |
| `PRB-CLI-012`  | Subagent 并发、继承、递归、控制与失败传播 | `CAP-08.02`–`CAP-08.07`, `CAP-08.09`                                           | 是       | 是     | 是   | `R2/R4` | 待授权                 |
| `PRB-CLI-013`  | Worktree / candidate isolation 与 cleanup | `CAP-08.08`, `CAP-08.12`                                                       | 1C.2     | 是     | 是   | `R2/R4` | Codex 延后；其余待授权 |
| `PRB-CLI-014`  | Daemon / event replay / reconnect         | `CAP-10.04`, `CAP-10.07`, `CAP-12.08`                                          | 1C.2     | 否     | 1C.2 | `R1/R2` | 1C.2                   |
| `PRB-CLI-015`  | Provider、模型、fallback 与 usage         | `CAP-11.01`–`CAP-11.12`                                                        | 是       | 是     | 是   | `R1/R2` | 待 mock provider       |
| `PRB-CLI-016`  | OTel、redaction 与 opt-out                | `CAP-12.03`, `CAP-12.04`                                                       | 是       | 是     | 是   | `R2/R3` | 待 loopback collector  |
| `PRB-CLI-017`  | Cloud task CLI 与外部状态                 | `CAP-02.08-A01/A02/A03`, `CAP-05.03-A03`, `CAP-08.12-A01`, `CAP-10.12-A01/A03` | CLI 1C.1 | 1C.2   | 1C.2 | `R2-R4` | 只设计，禁止自动执行   |

## 4. Core Probe Contracts

### `PRB-CLI-001` 发行身份与 Help

- **假设**：被冻结的入口报告预期版本；Help 在无认证、空配置、非 TTY 下稳定退出，
  且不会修改用户配置。
- **前置**：只使用记录 hash 的 binary/package；临时 cwd；空 HOME/XDG 等配置根。
- **步骤**：执行 `--version`、顶层 `--help` 和已纳入 Claim 的只读子命令 Help；
  对执行前后目录、进程和 stderr 做 diff。
- **成功判据**：版本与冻结值一致；exit code 可复现；输出可关联 Claim；无未声明
  持久副作用。
- **反证**：版本漂移、Help 依赖登录、写入真实配置、非零退出或同一 binary
  输出不稳定。
- **清理**：删除临时目录；若产品试图写真实位置，停止并报告，不代为删除。

### `PRB-CLI-002` Headless 输入、输出与退出

- **假设**：argv prompt 与 stdin 语义明确；text/JSON/event stream 的 stdout、stderr、
  final event、schema error、blocked 与 exit code 可机器判定。
- **切片边界**：只在 `terminal=non-tty` 下运行。Qwen 的 Interactive Dual Output
  不进入本 probe，也不能用这里的 stream-json 结果回填 TTY sidecar Claim。
- **Fixture**：只读小仓库；mock provider 优先，否则使用明确授权的低成本测试模型。
- **步骤**：分别测试 argv、stdin、空输入、invalid schema、正常完成、tool deny、
  budget exhaustion、SIGINT；记录逐字节输出与事件时间戳。
- **成功判据**：每个格式满足公开 schema；stderr 不污染机器输出；终态与 exit code
  一致；partial result 不伪报成功。
- **反证**：事件乱序、缺终态、schema violation 静默降级、blocked 退出 0 且无机器
  状态、取消后进程或 session 泄漏。
- **清理**：检查临时 repo、session store 与子进程；模型调用和费用单独入账。

### `PRB-CLI-002B` Qwen TTY Interactive Dual Output

- **假设**：显式启用后，交互 TTY 仍保留人类终端输出，同时把独立 JSON events 写入
  声明的 sidecar，并可从独立 reverse-command stream 接收控制；该 Surface 与
  headless `stream-json` 的 schema、通道和生命周期互不替代。
- **切片**：`Qwen Code 0.21.0 / stable / cli`，`terminal=tty`；冻结完整
  activation/config、sidecar path、reverse-command path/transport 和 feature flag。
  不从 `terminal=non-tty` 的任何结果推断本切片。
- **Fixture**：临时配置根、PTY、只读小仓库、loopback mock provider；sidecar 与
  reverse-command target 均位于独立临时目录，并保存 inode、权限和逐字节时间线。
- **步骤**：分别验证默认未启用、显式启用、无效/不可写/已存在 path；执行正常 turn
  和 tool deny，同时采集终端、sidecar 与 reverse-command 三条流；发送合法、未知、
  重复和截断 command；测试正常退出、SIGINT、crash、buffer flush、文件达到边界时
  是否存在声明的 rotation，以及重启后的创建/复用策略。
- **成功判据**：启用条件与有效路径可见；TTY 输出不被 JSON 污染；sidecar 每条
  event 可解析并有可识别终态；reverse command 的接收、拒绝和关联目标可观察；
  正常/取消退出前按声明完成 flush；若文档未承诺 rotation，则只记录实际行为而不
  生成负向结论。
- **反证**：未启用仍创建/写入 sidecar；写错真实用户目录；两条机器流混线；非法
  command 被静默执行；退出后 writer/reader 泄漏；partial JSON 被当成完整终态。
- **清理**：先确认 writer、reader 和 child PID 已退出，再回收临时目录；不得删除
  用户已有 path。结果只更新 TTY Dual Output Claim。

### `PRB-CLI-003` Session 生命周期

- **假设**：list/resume/continue/fork/branch/ephemeral 的 ID、来源、持久化和失败语义
  可以区分；恢复不会重放已完成副作用。
- **Fixture**：独立配置根、临时 Git repo、两个可区分 session；每个副作用写入带唯一
  nonce 的临时文件。
- **步骤**：创建、正常退出、进程重启、按 ID 恢复、选择最近项、从旧点分支；再测试
  无候选、损坏记录、错误 ID、ephemeral 与中途 crash。
- **成功判据**：session 元数据与内容一致；branch 有独立身份；源 session 不变；
  ephemeral 不落持久记录；失败不静默选中别的 session。
- **反证**：跨 repo 串线、最近项选择错误、branch 覆盖源记录、恢复重放 nonce、
  损坏状态回退到新 session 而不披露。
- **风险**：`R4` 仅限 fixture 中的 rewind/delete/restore；不触碰真实 history。

### `PRB-CLI-004` Plan 与 approval

- **假设**：干净配置默认姿态可观察；Plan 模式阻断所有声明的写操作；模式切换、
  逐动作批准/拒绝与恢复后的状态一致。
- **Qwen 专项**：以空配置验证 Ask Permissions 与 Auto Mode 的冲突，不读取当前
  开发 worktree 的设置；Agent Team 不在本 probe 中启用。
- **步骤**：查询默认状态；请求 read、workspace write、protected path write、
  shell wrapper、network；分别批准、拒绝、切换模式、重启 session。
- **成功判据**：有效 mode 和来源可见；Plan 不产生写副作用；deny 优先级与 UI/机器
  输出一致；高权限模式进入和退出均显式。
- **反证**：默认值不可解释、Plan 可通过 Bash/重定向写入、拒绝后仍执行、模式在
  resume 后意外升级。
- **风险**：所有目标均为临时 repo；高权限路径仍必须外加 OS/container isolation。

### `PRB-CLI-005` 文件 sandbox

- **假设**：workspace、额外 root、deny path、symlink 和重定向后的实际目标均按
  声明策略判定，拒绝路径无副作用。
- **backend × platform 切片**：以下每格独立执行、独立保存 Evidence，不能由一个
  backend 或平台推断其他格：

  | Product     | Backend / entry               | Platform slice | Isolation label            |
  | ----------- | ----------------------------- | -------------- | -------------------------- |
  | Codex       | native `sandbox macos` helper | macOS          | native sandbox, exact TBD  |
  | Codex       | native `sandbox linux` helper | Linux          | native sandbox, exact TBD  |
  | Claude Code | Seatbelt                      | macOS          | OS sandbox                 |
  | Claude Code | bubblewrap                    | Linux          | process/filesystem sandbox |
  | Qwen Code   | Seatbelt                      | macOS          | OS sandbox                 |
  | Qwen Code   | Docker                        | platform TBD   | container                  |
  | Qwen Code   | Podman                        | platform TBD   | container                  |

  `TBD` 必须由对应 runtime probe 填写，不可写成 `not-applicable`。

- **Fixture**：临时 workspace、允许目录、拒绝目录、指向两者的 symlink；canary
  文件与 hash。
- **步骤**：read/write/create/delete/rename、shell redirection、relative traversal、
  symlink、额外 root；在每种 approval/sandbox mode 下测正常与拒绝。
- **成功判据**：判定基于 canonical target；拒绝原因和来源可见；canary/hash 不变；
  不回退到主 workspace。
- **反证**：symlink/path normalization 绕过、deny 后发生部分写入、未知 root
  回退主目录、子 Agent 获得更高权限。

### `PRB-CLI-006` 网络 sandbox

- **假设**：closed/open/proxied、allow/deny domain、loopback、redirect 与 DNS
  结果符合声明策略。
- **矩阵要求**：沿用 `PRB-CLI-005` 的七个 backend × platform slice，并在每格分别
  测 shell、产品 web tool、MCP/extension 可达性。Qwen Seatbelt 的
  open/closed/proxied profile、Docker 与 Podman network 配置必须是三个独立
  slice；Codex native macOS/Linux 与 Claude Seatbelt/bubblewrap 也不得互相回填。
- **Fixture**：loopback HTTP server、两个 host alias、redirect endpoint、连接日志；
  不访问公网。
- **步骤**：direct IP、hostname、redirect、subdomain、port、HTTP/HTTPS、shell 与
  web tool；分别测试 allow、deny、unknown target。
- **成功判据**：deny 优先；规则命中来源可解释；被拒请求未到达 loopback server；
  unknown target 不静默放行。
- **反证**：redirect 绕过、不同工具策略漂移、询问失败后放行、strict allowlist
  仍发包。

### `PRB-CLI-007` 取消与进程回收

- **假设**：用户取消、SIGINT/SIGTERM、budget/timeout 会传播到当前 turn、tool 和
  child process tree，并产生稳定终态。
- **Fixture**：可识别 PID tree 的本地脚本；周期性写 heartbeat 到临时目录。
- **步骤**：前台/后台 shell、subagent、headless stream 各发送取消和信号；等待硬
  上限后检查 PID、heartbeat、session 状态和 exit code。
- **成功判据**：所有声明 child 在期限内退出；无 orphan；partial output 标注取消；
  session 是否可恢复与文档一致。
- **反证**：退出后 heartbeat 继续、exit 0 伪报成功、只停父进程、取消一个 child
  误杀无关任务。

### `PRB-CLI-008` Context 压缩

- **假设**：手动/自动 compaction 可观察，并保留系统约束、未完成事项、文件事实与
  用户最新纠正；失败不损坏原 session。
- **Fixture**：含可核验事实、冲突修正、长噪声和显式禁令的合成会话。
- **步骤**：压缩前后分别要求复述事实、执行受禁动作、继续未完成任务；再测取消、
  极限输入和 resume。
- **成功判据**：关键约束与最新事实保留；token/context 指标变化可见；压缩产物或
  替代表示可追踪；失败可恢复。
- **反证**：旧事实覆盖纠正、禁令丢失、压缩后重放副作用、resume 使用压缩前错误状态。

### `PRB-CLI-009` MCP

- **假设**：local stdio/HTTP server 可被显式注册、批准、发现和调用；断线、超时、
  schema 变化与重连不会污染其他 server。
- **Fixture**：本地 echo MCP，提供 tool/resource/prompt、可控 slow/crash/malformed
  模式；临时配置根。
- **步骤**：add/list/get、approve/reject、initialize、discover、call、crash、restart、
  reconnect、remove；OAuth 仅在后续独立假 server 中测试。
- **成功判据**：身份与 transport 可见；未批准 server 不连接；错误归属准确；
  reconnect 不重复有副作用调用；remove 清理配置。
- **反证**：项目 server 自动信任、schema 漂移静默接受、一个 server 崩溃拖垮
  session、凭据出现在日志。

### `PRB-CLI-010` Hooks

- **假设**：事件、payload、顺序、阻断、timeout、async 生命周期和错误分类满足公开
  契约。
- **Fixture**：本地 handler 把事件/时间/PID 写到临时 JSONL，并支持 exit 0、exit 2、
  invalid JSON、timeout 与 crash。
- **步骤**：触发 session、prompt、tool、compact、subagent、stop 事件；组合多个
  handler，检查串并行、阻断和 cleanup。
- **成功判据**：payload/schema 可验证；阻断事件没有目标副作用；infrastructure
  error 不冒充用户拒绝；超时后 handler 被回收。
- **反证**：事件丢失/重复、post 在 pre 拒绝后仍宣称成功、project hook 绕过 trust、
  async 进程泄漏。

### `PRB-CLI-011` Skill / plugin / extension

- **假设**：scope、发现、显式/模型触发、资源路径、enable/disable/update/remove
  与冲突优先级可观察。
- **Fixture**：纯本地、无网络、无安装脚本的 disposable package；personal/project
  两个同名版本；越界资源引用。
- **步骤**：discover、显式触发、模型触发、禁用、重启、更新、移除、冲突、无效
  manifest/resource escape。
- **成功判据**：来源和有效版本可见；禁用立即或按声明时机生效；越界引用被拒；
  remove 不留下激活状态。
- **风险**：只做本地 fixture 为 `R1/R2`；访问 marketplace 或外部安装升为 `R3`。

### `PRB-CLI-012` Subagent

- **假设**：child 的上下文、instructions、model、tools、permission、sandbox、结果
  聚合、并发、控制和失败传播均可独立观察。
- **Fixture**：三个有界 child：成功、超时、拒绝；每个写独立 timeline，禁止递归或
  把上限降到 1–2。
- **步骤**：foreground/background、并发重叠、roster、message/steer、attach、
  cancel、partial failure、parent cancel；再让 child 创建 grandchild，覆盖合法深度、
  depth/cap exhaustion、伪造/循环 ancestry，以及 full/redacted/no-transcript 三种
  parent↔child↔grandchild record forwarding。
- **成功判据**：child ID 稳定；权限不高于 parent；上下文继承与声明一致；失败项不
  丢失；合法 nested child 具有可追踪 ancestry；被拒绝的递归不创建 orphan；各层只
  收到声明范围的 transcript；聚合不把部分成功写成全成功。
- **反证**：不可见 child、权限升级、消息错投、取消竞态、失败 child 仍被当成 winner、
  parent 退出后 orphan、ancestry loop、越界创建下一层，或敏感 parent/peer record
  被错误转发。
- **Qwen 专项**：Agent Team 先只测 tool registration 与 feature flag discoverability；
  不把 generic `send_message` 当作 Team 已可用。

### `PRB-CLI-013` Worktree 与候选隔离

- **假设**：每个执行体解析到独立 root/ref，候选可以并列比较，cleanup 不删除用户
  未跟踪数据。
- **Fixture**：小 Git repo、未跟踪 canary、两个冲突候选、一个失败候选。
- **步骤**：创建隔离 checkout、运行候选、查看 diff、选择/应用 winner、取消、
  crash、cleanup；检查 branch/ref、cwd、process 与文件树。
- **成功判据**：root/ref/session binding 正确；候选互不污染；失败项显式；只应用
  winner；cleanup guard 保留 canary。
- **反证**：相对路径落入主 workspace、候选共享修改、失败被静默忽略、cleanup
  删除用户文件或遗留进程。
- **Codex 边界**：1C.1 没有可由本 probe 更新的 Codex CLI Claim；本地
  worktree/candidate fixture 延后到 1C.2。experimental cloud `--attempts` 的远端
  候选、environment 与 task 状态只由 `PRB-CLI-017` 更新，不从本地结果回填。

### `PRB-CLI-015` Provider、model 与 fallback

- **假设**：provider endpoint、credential source、protocol dialect、model
  selection、role routing、fallback 与 usage 披露可区分。
- **Fixture**：loopback mock provider，按请求返回成功、capacity、rate-limit、
  incompatible-tool、invalid-schema 与 usage；每种 dialect 独立 endpoint。
- **步骤**：空凭据、错误凭据、显式 model、session switch、fallback order、
  capability mismatch、vision/fast/reasoning role、cache/usage。
- **成功判据**：不跨 provider 泄露凭据；实际 routed model 可见；fallback 只在
  声明错误触发；usage/cost 来源和单位明确。
- **反证**：静默换模型、候选顺序失效、credential 写日志、协议错误误分类、
  usage 与 mock 返回不一致。

### `PRB-CLI-016` Telemetry

- **假设**：默认姿态、显式 opt-in/out、metrics/logs/traces、correlation、redaction、
  retry 与 flush 可在 loopback collector 复现。
- **Fixture**：只监听 loopback 的 OTLP collector；合成 secret 与 prompt；网络层
  记录连接数和 payload hash。
- **步骤**：默认配置、显式开启、敏感字段独立开启、collector 拒绝/超时、正常退出、
  crash、再次关闭；分别触发 CLI、tool、subagent 事件。
- **成功判据**：默认/关闭时零外发；敏感字段按开关 redact；trace/log/metric ID 可
  关联；失败不阻断主任务且有本地可诊断信号。
- **反证**：opt-out 仍连接、secret 明文外发、关闭只影响部分信号却未披露、退出前
  无限阻塞或 crash 后重复发送。

### `PRB-CLI-017` Codex cloud task CLI

- **假设**：Codex `0.145.0` 的顶层 `apply` 与 experimental
  `cloud exec/status/list/diff/apply` 是可区分的入口；task/attempt 选择、远端状态与
  本地应用副作用不会互相借证。该 probe 同时闭合 remote client submit/environment/
  monitor（`CAP-02.08-A01/A02/A03`）、多 attempt 候选（`CAP-08.12-A01`）与
  cloud task submit/query（`CAP-10.12-A01/A03`）。
- **切片边界**：只覆盖 `0.145.0 / latest / cli`。`cloud exec` 远端提交按 `R3`
  处理；`cloud list/status/diff` 只读查询按 `R2`；顶层 `apply` 与
  `cloud apply` 的本地变更按 `R4`。`exec-server` 是 standalone
  WebSocket/stdio service，留到 1C.2 `sdk-daemon`，不得用本 probe 回填。
- **前置**：先在空配置、临时 cwd 中做无认证 Help/schema discovery。行为阶段只能用
  专项授权的 disposable account、disposable remote repo/branch 与临时本地 clone；
  不读取现有登录态、生产凭据或真实仓库。
- **步骤**：分别记录 `cloud exec` 的 environment/branch 输入和返回 task ID；
  对单 attempt 与 `--attempts 2..4` 记录候选身份、隔离环境、并行时间线和结果；
  对存在、不存在、无权和多 attempt task 执行 list/status/diff，核对客户端监控入口；
  在带 canary 的临时 clone 中分别执行顶层 `apply` 与 `cloud apply`，覆盖
  clean、conflict、重复应用和 cancel。
- **成功判据**：提交与查询的 task/attempt 身份稳定；只读查询不改变远端或本地状态；
  environment/branch 映射和候选隔离可观察；两个 apply 入口的目标、diff 来源、部分
  失败和退出状态可区分；冲突不会伪报完整成功。
- **反证**：无权 task 泄露状态/diff、查询触发写入、错误 task/attempt 被静默采用、
  apply 越出临时 clone、部分应用后退出 0 且无恢复证据。
- **清理**：保存远端与本地前后快照；先撤销 disposable remote state，再回收临时
  clone。任何清理目标不确定时停止，不猜测删除。

## 5. 1C.1 执行顺序建议

1. 先复跑 `PRB-CLI-001`，确认所有 frozen artifact 仍可定位。
2. 建立统一临时配置根、mock provider、loopback MCP/HTTP/OTLP 与 PID fixture。
3. 优先执行 `PRB-CLI-002`、`002B`、`003`、`004`、`007`；它们覆盖最多高价值
   Unknown。
4. 再执行 sandbox、context、extension 和 subagent probes。
5. `R3/R4` probe 不随批次默认获得授权；逐项 review 后执行。
6. IDE/Desktop/Web/SDK/daemon 与非 CLI 的 CI/IM 进入 1C.2，不用 CLI 结果回填
   其他 Surface；Codex exact CLI cloud 只由 `PRB-CLI-017` 更新。

每完成一个 probe，只更新被它直接支持或反驳的 Claim；不得把单一平台、provider、
terminal 或 gate 的结果提升为产品级结论。

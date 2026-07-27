# Qwen Code / Claude Code / Codex 功能对比（人话版）

> 状态：Current projection  
> 对比版本：Qwen Code `0.21.0/effective latest`、Claude Code
> `2.1.212/stable`、Codex `0.145.0/latest`  
> 口径：先写用户能做什么，再写本轮实际验证到了哪一步。

## 怎么看这张表

- **已验证**：本轮真的运行过，并看到了对应结果。
- **部分验证**：只跑了某个入口、失败路径或局部生命周期。
- **入口确认**：Help、版本化文档或发行源码确认有这个功能，但本轮没真正使用。
- **未评估**：没有在相同条件下跑，不能写成“不支持”。

这些标签是证据状态，不是产品打分。点击表格中任一产品的文字，会跳到该产品的具体
表现、已知边界和原始依据。

## 功能总表

| 功能 | Qwen Code | Claude Code（CC） | Codex |
| --- | --- | --- | --- |
| 1. 交互式终端与客户端 | [入口确认：多轮终端支持 `/`、`@`、`!`，另有 Diff、Vim、主题、IDE 等入口；TUI 未实测](#f01-qwen) | [入口确认：交互会话、Slash、Shell、Vim、无障碍、IDE 和 Remote Control 可发现；TUI 未实测](#f01-claude) | [入口确认：默认进入交互 CLI，可附加图片，并有 IDE、Desktop、Cloud 入口；TUI 未实测](#f01-codex) |
| 2. 计划、任务与执行控制 | [入口确认：有 `/plan`、计划审批、Todo 和结构化 Task 工具；真实任务状态流未跑](#f02-qwen) | [入口确认：有 Plan 权限模式、Agent loop、中断和后台化；计划只读边界未跑](#f02-claude) | [入口确认：当前文档有 `/plan`、`/goal`、暂停与继续；未锁定到本次 CLI 运行结果](#f02-codex) |
| 3. 会话、历史与分支 | [入口确认：可恢复、继续、重命名、分支、回退、导出和列举会话；未创建真实会话](#f03-qwen) | [入口确认：可命名、按 ID 恢复、继续、Fork，也可关闭持久化；未创建真实会话](#f03-claude) | [入口确认：可 Resume、Fork、Archive、Delete，Headless 也能继续；未创建真实会话](#f03-codex) |
| 4. 指令、上下文与记忆 | [入口确认：支持 `QWEN.md`、`AGENTS.md`、Ignore、Context/Compress；Auto Memory 默认开启](#f04-qwen) | [入口确认：支持多层 `CLAUDE.md`、仓库 Auto Memory、Context/Compact；未验证写入和召回](#f04-claude) | [入口确认：支持分层 `AGENTS.md`、Compact；本地 Memory 文档默认关闭](#f04-codex) |
| 5. 本地代码与环境工具 | [入口确认：源码中有读写、搜索、Shell、后台监控、LSP、Web、Computer Use、图片等工具](#f05-qwen) | [入口确认：有 Read、Glob、Grep、Edit、Write、Bash、Web 工具及后台 Bash](#f05-claude) | [入口确认：产品承诺可检查、编辑、运行代码，另有 Web Search 和 Sandbox Helper；细粒度工具未跑](#f05-codex) |
| 6. 权限、审批与沙箱 | [入口确认：五种审批姿态、Folder Trust、Auto Mode、Seatbelt/容器/网络隔离；危险动作未跑](#f06-qwen) | [入口确认：六种权限模式、工具 Allow/Deny、Managed Policy、Seatbelt/Bubblewrap；Enforcement 未跑](#f06-claude) | [入口确认：三种沙箱、三种审批姿态、文件/网络规则和命令前缀规则；越界行为未跑](#f06-codex) |
| 7. MCP、Skills、Hooks 与插件 | [入口确认：MCP、Skills、同步/异步 Hooks 和完整 Extension 生命周期都有入口；未连接或安装](#f07-qwen) | [入口确认：Skills、Hooks、MCP、Plugin Marketplace 都有入口；未连接或安装](#f07-claude) | [入口确认：MCP Client/Server、Skills、Command Hooks、Plugin Marketplace 都有入口；未连接或安装](#f07-codex) |
| 8. 多 Agent、后台任务与 Worktree | [入口确认：Named/Fork Subagent、默认后台、Roster、Worktree、Arena；Team/Swarm 状态仍冲突](#f08-qwen) | [入口确认：自定义 Agent、独立上下文、后台 Agent、Roster、Worktree/Tmux；未实际派发](#f08-claude) | [入口确认：当前文档有 Subagent、Thread 切换和 Desktop Worktree；精确 CLI 行为未跑](#f08-codex) |
| 9. Git、Review 与 CI | [入口确认：本地 Diff/PR、多 Agent Review、严重度、行内评论和 GitHub Action 都有入口](#f09-qwen) | [入口确认：有 Cloud Ultrareview、PR 恢复、Worktree 和 GitHub Action 文档；未上传或运行](#f09-claude) | [入口确认：本地 Review、GitHub `@codex review`、Cloud PR 和 Action 都有入口；未运行](#f09-codex) |
| 10. Headless 与结构化输出 | [部分验证：缺 Key 时返回单个终态 JSON；非法 Schema 本地拒绝；成功路径未跑](#f10-qwen) | [部分验证：无认证时返回完整三行 JSONL 失败流；成功路径和合法 Schema 未跑](#f10-claude) | [部分验证：进入 Thread/Turn 和传输重试，只得到 Partial JSONL；成功路径未跑](#f10-codex) |
| 11. SDK、Daemon 与远端接入 | [部分验证：Daemon 的鉴权、Health、Readiness、Capabilities、日志和优雅退出已跑；任务/SSE 未跑](#f11-qwen) | [入口确认：Agent SDK 和 Remote Control 有文档；本轮没有锁定 Secondary Artifact Runtime](#f11-claude) | [部分验证：App-server Schema 和受限启动失败已跑；正常 Handshake、Task 和事件流未跑](#f11-codex) |
| 12. 模型、Provider 与认证 | [入口确认：支持多 Provider 方言、模型切换、Fallback、推理强度和多模态角色；未调用模型](#f12-qwen) | [部分验证：模型、Effort、Fallback 和多 Provider 入口已确认，无凭据失败已跑；成功未跑](#f12-claude) | [入口确认：ChatGPT/API Key、本地 OSS Provider、自定义 Provider 和模型选择可发现；未调用模型](#f12-codex) |
| 13. 配置校验 | [部分验证：所选启动入口没有拒绝类型错、未知字段或非法组合；后续 Consumer 未测](#f13-qwen) | [已验证：所选读取入口拒绝类型错和非法组合，但放行未知字段；结果在结构化响应中](#f13-claude) | [已验证：Strict 模式拒绝类型错、未知字段和非法组合，并定位文件与行列](#f13-codex) |
| 14. 配置分层与来源 | [已验证：`System > trusted Workspace > User > SystemDefaults`，不可信 Workspace 不参与合并](#f14-qwen) | [已验证：所选入口为 `local > project > user`，能返回各层原始值](#f14-claude) | [已验证：Session Flag、嵌套 Project、Root Project、User 有明确优先级，并显示被 Trust 禁用的层](#f14-codex) |
| 15. 诊断、日志与故障定位 | [部分验证：缺 Git/npm 能告警，日志不可写会降级到 Stderr；发现一处权限错误误分类](#f15-qwen) | [部分验证：`--bare doctor` 实测为空且退出 0；Interactive Doctor 和故障矩阵未跑](#f15-claude) | [部分验证：`doctor --json` 实测返回 18 项检查，坏 CA 与损坏缓存可定位](#f15-codex) |

## 1. 交互式终端与客户端

<a id="f01-qwen"></a>

### Qwen Code

- **表现：** 多轮终端支持 Slash Command、`@` 文件引用和 `!` Shell 前缀；另有
  `/diff`、`/vim`、主题、终端设置、语言与自定义状态栏。官方还列出 IDE、Desktop、
  Daemon 和 IM Channel 等入口。
- **边界：** 本轮没有进入 TUI，键盘、焦点、重绘、Diff 准确性和跨客户端接续都没
  实测；多个入口同时存在不代表它们行为一致。
- **依据：** `FACT-qwen-code-003/005–008`，
  [Qwen Code Facts](./facts/qwen-code.md)。

<a id="f01-claude"></a>

### Claude Code

- **表现：** 默认命令进入交互会话，支持 Slash Command、`!` Shell、Vim、
  `Esc` 中断、`Ctrl+B` 后台化和 `--ax-screen-reader`；另有 IDE 与 Remote
  Control 入口。
- **边界：** 没有进入认证 TUI，也没有连接 IDE 或远端客户端；渲染、按键顺序、
  Shell 副作用和远程接管都没验证。
- **依据：** `FACT-claude-code-005–008`，
  [Claude Code Facts](./facts/claude-code.md)。

<a id="f01-codex"></a>

### Codex

- **表现：** 无子命令时进入交互 CLI，初始 Prompt 可附加一个或多个图片；官方还
  提供 IDE、Desktop Launcher 和 Cloud Task 入口。
- **边界：** 没有进入 TUI、打开 GUI 或提交 Cloud Task；IDE 与 Cloud 的部分行为
  来自 current docs，不应全部归到精确 CLI 二进制。
- **依据：** `FACT-codex-006–010`，[Codex Facts](./facts/codex.md)。

## 2. 计划、任务与执行控制

<a id="f02-qwen"></a>

### Qwen Code

- **表现：** 有 `/plan` 和计划审批模式；发行源码中能看到 `todo_write` 以及
  `task_create`、`task_list`、`task_update`、`task_stop`。源码测试还覆盖同一轮
  Steering、预算和循环检测。
- **边界：** 没有实际批准计划、执行长任务或恢复任务；写保护、跨会话持久化、冲突
  更新和真实中断行为未知。
- **依据：** `FACT-qwen-code-009–012`，
  [Qwen Code Facts](./facts/qwen-code.md)。

<a id="f02-claude"></a>

### Claude Code

- **表现：** `--permission-mode plan` 提供只读探索/计划入口；Headless 使用与交互
  模式相同的 Agent Loop 和工具。交互中可停止当前响应，或把 Bash/Agent 转到后台。
- **边界：** 没有运行认证任务或修改拒绝场景；Plan 是否在所有工具上都保持只读、
  任务如何持久化和最终如何表达都未验证。
- **依据：** `FACT-claude-code-009–012`，
  [Claude Code Facts](./facts/claude-code.md)。

<a id="f02-codex"></a>

### Codex

- **表现：** current docs 描述 `/plan` 与持久 `/goal`；同一会话可继续 Steering，
  Desktop 还能暂停、继续、编辑或清除目标。
- **边界：** 这些行为没有在 `0.145.0` CLI 中运行，文档也没有把全部控件绑定到
  精确 CLI Build；计划质量、状态落盘和恢复都未知。
- **依据：** `FACT-codex-012–014`，[Codex Facts](./facts/codex.md)。

## 3. 会话、历史与分支

<a id="f03-qwen"></a>

### Qwen Code

- **表现：** `/resume`、`/continue`、`/rename`、`/branch`、`/rewind`、`/export`
  和 `qwen sessions list` 覆盖列举、恢复、分支、回退与导出。
- **边界：** 没有创建真实 Transcript；筛选准确性、导出完整性、外部副作用能否回退
  以及 Crash Recovery 都未验证。
- **依据：** `FACT-qwen-code-015/016`，
  [Qwen Code Facts](./facts/qwen-code.md)。

<a id="f03-claude"></a>

### Claude Code

- **表现：** 可命名会话、指定 Session ID、继续、恢复、Fork，也可用
  `--no-session-persistence` 禁止落盘；文档描述本地 JSONL Transcript 和项目范围
  Picker。
- **边界：** 没有创建或恢复真实 Session；损坏记录、清理、项目边界和 Fork 后的
  文件/后台状态未知。`/rewind` 的完整行为来自 current docs，未精确绑定
  `2.1.212`。
- **依据：** `FACT-claude-code-015–017/036/057`，
  [Claude Code Facts](./facts/claude-code.md)。

<a id="f03-codex"></a>

### Codex

- **表现：** 提供 Resume Picker、`--last`、Fork、Archive、Unarchive、Delete；
  `exec resume` 可继续 Headless Session，`--ephemeral` 可明确不保存。
- **边界：** 没有创建真实 Session；历史完整性、Fork 身份、最近项选择、删除和实际
  落盘语义未知。
- **依据：** `FACT-codex-011/017`，[Codex Facts](./facts/codex.md)。

## 4. 指令、上下文与记忆

<a id="f04-qwen"></a>

### Qwen Code

- **表现：** 支持 User/Project/Local 层级的 `QWEN.md` 与 `AGENTS.md`，
  `.qwenignore` 也可兼容其他 Ignore 文件；有 `/context`、`/compress`。Auto
  Memory 文档称默认开启并按 Project Key 保存，Team Memory 需显式开启。
- **边界：** 没有运行嵌套目录优先级、压缩保真、记忆写入/召回、Secret Scan、同步
  或物理删除。
- **依据：** `FACT-qwen-code-013–016`，
  [Qwen Code Facts](./facts/qwen-code.md)。

<a id="f04-claude"></a>

### Claude Code

- **表现：** 支持 Managed/User/Project/Directory 层级的 `CLAUDE.md`；仓库级 Auto
  Memory 可跨 Worktree 共享，每次加载有 200 行或 25 KiB 边界；另有 `/context`
  和 `/compact`。
- **边界：** 没有验证指令冲突、Memory 写入/召回/删除和压缩保真；完整 Compaction
  语义没有全部锁定到 `2.1.212`。
- **依据：** `FACT-claude-code-013/014/017`，
  [Claude Code Facts](./facts/claude-code.md)。

<a id="f04-codex"></a>

### Codex

- **表现：** current docs 描述全局与项目目录分层的 `AGENTS.md`，由浅到深组合，
  默认总量上限 32 KiB；另有 `/compact`。本地 Memory 文档默认关闭，并可按会话
  控制读取和生成。
- **边界：** 指令层级、截断、Compact、Memory 生成与召回都没在精确 CLI 中运行；
  Memory 文档也未绑定本次 Build。
- **依据：** `FACT-codex-015–019`，[Codex Facts](./facts/codex.md)。

## 5. 本地代码与环境工具

<a id="f05-qwen"></a>

### Qwen Code

- **表现：** 发行源码注册了目录/文件读取、Glob、内容搜索、Edit、Write、Shell 和
  后台 Monitor；还包括 Notebook、可选 LSP、Web、Computer Use、图片生成和
  Artifact 入口。
- **边界：** 本轮没有真正读写文件、启动命令、访问网络、操作 GUI 或生成图片；
  Ignore、权限、超大文件、部分失败和进程回收都未知。
- **依据：** `FACT-qwen-code-017–020`，
  [Qwen Code Facts](./facts/qwen-code.md)。

<a id="f05-claude"></a>

### Claude Code

- **表现：** 文档列出 Read、Glob、Grep、Edit、Write、Bash、WebFetch 和
  WebSearch。Bash 可超时转后台，超大输出会落到 Session 文件并返回预览。
- **边界：** 没有执行工具；文件和网络权限、编辑原子性、进程树清理、输出文件清理
  和真实失败语义均未闭合。
- **依据：** `FACT-claude-code-018–022`，
  [Claude Code Facts](./facts/claude-code.md)。

<a id="f05-codex"></a>

### Codex

- **表现：** 官方将 CLI 描述为可在本地仓库检查、编辑和运行代码；精确 Help 还提供
  Live Web Search、Sandbox Helper、Local Review 和 Cloud Diff Apply 入口。
- **边界：** 本轮没有把产品概括拆成已运行的 Read/Edit/Shell 行为，也没有启用
  Search、Sandbox 或 Apply；细粒度错误、原子性和权限边界未知。
- **依据：** `FACT-codex-020–024`，[Codex Facts](./facts/codex.md)。

## 6. 权限、审批与沙箱

<a id="f06-qwen"></a>

### Qwen Code

- **表现：** 有 `plan`、`default`、`auto-edit`、`auto`、`yolo` 五种审批姿态，
  Folder Trust、逐动作审批和 Auto Mode；Sandbox 文档覆盖 macOS Seatbelt、
  Docker/Podman 以及 Open/Closed/Proxied Network。
- **边界：** 没有执行危险动作、网络拒绝或 Sandbox Escape；文档对默认审批姿态有
  冲突，因此默认值仍是 Unknown。
- **依据：** `FACT-qwen-code-021–024`，
  [Qwen Code Facts](./facts/qwen-code.md)。

<a id="f06-claude"></a>

### Claude Code

- **表现：** Permission Mode 包括 `acceptEdits`、`auto`、
  `bypassPermissions`、`manual`、`dontAsk`、`plan`；工具规则按
  `deny → ask → allow`，另有 Managed Policy 和 Seatbelt/Bubblewrap。
- **边界：** 没有执行 Deny、Bypass、Trust、Escape 或平台依赖失败测试；不能把
  文档架构直接写成 Enforcement 已验证。
- **依据：** `FACT-claude-code-023–026`，
  [Claude Code Facts](./facts/claude-code.md)。

<a id="f06-codex"></a>

### Codex

- **表现：** Sandbox 有 `read-only`、`workspace-write`、
  `danger-full-access`；Approval 有 `untrusted`、`on-request`、`never`。文档还
  提供文件/网络 Allow-Deny、实验性命令前缀规则和 Hook Trust。
- **边界：** 没有运行越界文件、网络、进程、规则冲突或危险 Bypass；实际默认值、
  Symlink 与拒绝体验未知。
- **依据：** `FACT-codex-025–029`，[Codex Facts](./facts/codex.md)。

## 7. MCP、Skills、Hooks 与插件

<a id="f07-qwen"></a>

### Qwen Code

- **表现：** 有 Markdown Custom Commands、`SKILL.md`、Command/HTTP 与同步/异步
  Hooks；MCP 支持 stdio、HTTP、SSE、OAuth 和 Allow/Deny；Extensions 支持安装、
  卸载、启停、更新、Link、Marketplace、Git、Local、Archive 和 Scoped npm 来源。
- **边界：** 没有加载自定义 Skill、触发 Hook、连接 MCP 或安装 Extension；优先级、
  权限传播、签名、回滚与失败清理未知。
- **依据：** `FACT-qwen-code-025–029`，
  [Qwen Code Facts](./facts/qwen-code.md)。

<a id="f07-claude"></a>

### Claude Code

- **表现：** Skills 支持显式或模型触发并按需加载；Hooks 用 JSON Stdin 和 Exit Code
  表达结果；MCP 支持 stdio/SSE/HTTP、Scope 和 OAuth；Plugin 提供 Marketplace、
  安装、启停、更新、卸载和 Validate。
- **边界：** 没有创建 Skill、运行 Hook、连接 MCP 或安装 Plugin；重连、隔离、
  签名、依赖和回滚未知。
- **依据：** `FACT-claude-code-027–030`，
  [Claude Code Facts](./facts/claude-code.md)。

<a id="f07-codex"></a>

### Codex

- **表现：** 有 MCP Client 和 stdio MCP Server；Skills 可随 Plugin 分发；Hooks
  覆盖工具、权限、压缩、Prompt、Subagent 和 Session 生命周期；Plugin 与
  Marketplace 支持 Add/List/Upgrade/Remove。
- **边界：** 没有连接 MCP、调用 MCP Tool、运行 Hook 或安装 Plugin。当前 Hooks
  只有 Command Handler，文档明确 Async 配置尚不支持。
- **依据：** `FACT-codex-030–035`，[Codex Facts](./facts/codex.md)。

## 8. 多 Agent、后台任务与 Worktree

<a id="f08-qwen"></a>

### Qwen Code

- **表现：** 区分独立初始上下文的 Named Agent 和继承部分调用历史的 Fork
  Subagent；文档称后台执行为默认，并有 `list_agents`、`send_message`、
  Worktree。实验性 Arena 最多让 5 个 Agent 在隔离 Worktree 中产出候选。
- **边界：** 没有实际派发、并发、取消或清理。Agent Team/Swarm 在发行源码与用户
  文档间存在冲突，因此保持 Unknown。
- **依据：** `FACT-qwen-code-030–034`，
  [Qwen Code Facts](./facts/qwen-code.md)。

<a id="f08-claude"></a>

### Claude Code

- **表现：** 可定义/选择 Agent，Subagent 有独立 Context，并默认继承父会话权限；
  `--bg`、`claude agents --json` 和 `/fork` 提供后台与 Roster；每 Session 默认
  最多 Spawn 200 次。另有 `--worktree` 和 `--tmux`。
- **边界：** 没有实际派发 Child、Attach 或创建 Worktree；并发公平性、隔离、失败
  传播、Daemon 重启和清理未知。
- **依据：** `FACT-claude-code-031–034/038`，
  [Claude Code Facts](./facts/claude-code.md)。

<a id="f08-codex"></a>

### Codex

- **表现：** current docs 描述默认启用的 Subagent Workflow、Custom Agent、独立
  模型/工具工作和父级 Sandbox 继承；`/agent` 可切换线程。Desktop Worktree 使用
  Detached HEAD，Cloud 可请求 1–4 次 Attempts。
- **边界：** 本地 Subagent 与 Worktree 主要来自 current docs，没有完整绑定到
  `0.145.0` CLI；没有运行委派、并发、继承、隔离或清理。
- **依据：** `FACT-codex-036–041`，[Codex Facts](./facts/codex.md)。

## 9. Git、Review 与 CI

<a id="f09-qwen"></a>

### Qwen Code

- **表现：** `/review` 面向本地 Diff 与 GitHub PR，文档描述多 Agent Review、
  结构化严重度和可选行内评论；辅助命令包含 Fetch PR、Presubmit、测试有效性、
  Compose 和 Submit。官方还有 GitHub Action 用法。
- **边界：** 没有审查真实 Diff/PR、访问 GitHub、写评论或运行 CI；`submit` 是明确
  需要授权的写操作。
- **依据：** `FACT-qwen-code-035–038`，
  [Qwen Code Facts](./facts/qwen-code.md)。

<a id="f09-claude"></a>

### Claude Code

- **表现：** `ultrareview` 可面向当前 Branch、PR 或 Base，声明使用 Cloud
  Multi-agent Review，并可输出 JSON；另有从 PR 恢复 Session、Worktree 和
  GitHub Action 文档。
- **边界：** 没有访问 PR、上传代码、创建 Worktree 或执行 Action；Action Commit
  与所用 CLI Version 没有锁定，不能都归到 `2.1.212`。
- **依据：** `FACT-claude-code-035–038`，
  [Claude Code Facts](./facts/claude-code.md)。

<a id="f09-codex"></a>

### Codex

- **表现：** `codex review` 可选择未提交改动、Base Branch Diff 或指定 Commit；
  current docs 还描述 GitHub `@codex review`、自动 Review、Cloud 结果开 PR 和
  `openai/codex-action@v1`。
- **边界：** 没有运行 Review、登录 GitHub、发评论、开 PR 或执行 Action；结果
  准确性、只读性和 Revision 绑定未知。
- **依据：** `FACT-codex-042–044/049`，[Codex Facts](./facts/codex.md)。

## 10. Headless 与结构化输出

<a id="f10-qwen"></a>

### Qwen Code

- **表现：** 入口支持 Prompt 参数、Stdin、Text/JSON/Stream-JSON 和 JSON Schema。
  实测缺少 Key 时返回单个终态 JSON，包含 UUID、Session ID、`num_turns=0` 和零
  Usage；Malformed Schema 本地拒绝并 Exit `52`。
- **边界：** Stdin 只证明字节送到 Child，不证明 Qwen 或 Provider 消费；成功任务、
  增量事件、合法 Schema 成功和 Provider 错误分类都未跑。
- **依据：** [Phase 2B Headless Runtime](./comparisons/phase-2b-headless-runtime.md)。

<a id="f10-claude"></a>

### Claude Code

- **表现：** 入口支持 Prompt/Stdin、Text/JSON/Stream-JSON 和 JSON Schema。实测无
  认证时返回三行完整 JSONL：Init、带 `authentication_failed` 的 Assistant Event
  和 Terminal Result；Exit `1`。Malformed Schema 也会本地拒绝。
- **边界：** 成功任务、合法 Schema、Stdin 的产品级消费和成功事件生命周期都未跑；
  Terminal Result 需要组合多个字段解释，不能只看 `subtype`。
- **依据：** [Phase 2B Headless Runtime](./comparisons/phase-2b-headless-runtime.md)。

<a id="f10-codex"></a>

### Codex

- **表现：** `exec` 支持 Prompt/Stdin、JSONL、Output Schema、Last Message File、
  Ephemeral 和 Ignore User Config。实测非空任务进入 `thread.started`、
  `turn.started` 与传输重试，Stdout 仍保持 JSONL。
- **边界：** 受限网络下 15 秒内没有 Terminal Result，只拿到 Partial Stream；成功
  任务、合法 Schema 和完整退出协议都未跑。
- **依据：** [Phase 2B Headless Runtime](./comparisons/phase-2b-headless-runtime.md)。

三方在这一项的正式关系仍是 **Not assessed**：本轮看到的是不同 Gate 下的失败
Envelope，不是同一成功任务。

## 11. SDK、Daemon 与远端接入

<a id="f11-qwen"></a>

### Qwen Code

- **表现：** 官方文档提供实验性 TypeScript、Python、Java SDK。`qwen serve`
  的管理面已实测：Loopback 启动、Bearer 拒绝、Health/Readiness、版本化
  Capabilities、Persistent Log，以及 SIGTERM 后 Parent/Listener 清理。
- **边界：** 这些结果不证明 Session、Prompt、SSE、Task Submit/Cancel、Reconnect、
  Model 或完整 Service 可用。
- **依据：** [Phase 1D.1 Coverage](./14-phase-1d1-coverage-and-open-claims.md)、
  [Phase 1D Runtime](./11-phase-1d-runtime-results-and-open-claims.md)。

<a id="f11-claude"></a>

### Claude Code

- **表现：** current docs 描述 Agent SDK 的 `query()`、Message Stream 和 Session；
  `--remote-control` 则让 Agent、文件和命令继续在本机执行，由浏览器或移动端接入。
- **边界：** SDK Package、Remote Client 和独立 Daemon 的精确 Artifact 没有在
  Secondary Cohort 中锁定，也没有相关 Runtime；Claim 为 0 不等于没有这些入口。
- **依据：** [Claude Code Facts](./facts/claude-code.md)、
  [Phase 1D.1 Coverage](./14-phase-1d1-coverage-and-open-claims.md)。

<a id="f11-codex"></a>

### Codex

- **表现：** current docs 有 TypeScript/Python SDK；精确 CLI 公开 Experimental
  App-server、Cloud、Exec-server 和 MCP Server。本轮复现了 App-server Schema
  Generation，并观察到受限 Codex Home 下的启动失败。
- **边界：** 没有完成正常 Initialize/Handshake、Thread/Task、Approval、Event
  Stream、Reconnect 或 Tool Call；失败也不能写成产品不支持。
- **依据：** [Phase 1D.1 Coverage](./14-phase-1d1-coverage-and-open-claims.md)、
  [Phase 1D Runtime](./11-phase-1d-runtime-results-and-open-claims.md)。

## 12. 模型、Provider 与认证

<a id="f12-qwen"></a>

### Qwen Code

- **表现：** 文档覆盖 ModelStudio、第三方和 Custom Provider，以及
  OpenAI-compatible、Anthropic、Gemini、Vertex 方言；有 `/model`、`--model`、
  最多 3 个 Fallback、Reasoning Effort、Fast Model、Vision Bridge 和 Voice
  Transcription Model。
- **边界：** 本轮没有读取凭据、发 Provider 请求或调用模型；登录、模型发现、切换、
  Fallback、缓存与计费都未验证。
- **依据：** `FACT-qwen-code-044–047`，
  [Qwen Code Facts](./facts/qwen-code.md)。

<a id="f12-claude"></a>

### Claude Code

- **表现：** 支持 Anthropic Account/API，以及 Bedrock、Vertex 等 Provider 路径；
  有模型选择、Effort、Fallback 和 Headless 预算入口。无凭据 Runtime 已产生机器可读
  Authentication Failure，且 Token Usage 为零。
- **边界：** 没有执行真实登录、Provider、Region、Model Success、Fallback 或预算
  阻断；失败路径不能代表成功能力。
- **依据：** `FACT-claude-code-043–047`，
  [Claude Code Facts](./facts/claude-code.md)、
  [Phase 2B Headless Runtime](./comparisons/phase-2b-headless-runtime.md)。

<a id="f12-codex"></a>

### Codex

- **表现：** 登录入口包括 ChatGPT、Device Flow、API Key 与 Access Token；可选
  `--model`，也可用 Ollama/LM Studio 等本地 OSS Provider。current docs 还描述
  Custom Base URL、Bedrock、Azure Responses 和 Reasoning Effort。
- **边界：** 没有读取或写入真实凭据，也没有发模型请求；实际身份、Endpoint、
  Model、Fallback 和错误归一化都未验证。
- **依据：** `FACT-codex-005/052–055`，[Codex Facts](./facts/codex.md)。

## 13. 配置校验

<a id="f13-qwen"></a>

### Qwen Code

- **表现：** 在所选 `--list-extensions` 启动路径中，合法配置、已知字段类型错误、
  未知顶层字段和非法 Hook 组合都正常完成，没有可见拒绝。Malformed JSON 另有
  “备份为 `.corrupted`、重置、迁移到 `$version:4`”的恢复流程。
- **边界：** 这只证明所选 Loader 没有统一递归调用内部 Metadata Validator；不能
  推断 UI、Hook Registry、Daemon、Web Shell 或其他 Consumer 都接受这些值。
- **依据：** [Phase 2C Config Runtime](./comparisons/phase-2c-config-schema-runtime.md)、
  [Phase 2B Diagnostics/Config](./comparisons/phase-2b-diagnostics-and-config-runtime.md)。

<a id="f13-claude"></a>

### Claude Code

- **表现：** 所选 Explicit `get_settings` 入口接受合法配置，对已知字段类型错误和
  跨字段错误返回结构化 Path；未知顶层字段则进入 Effective 和 Source。四例进程
  都 Exit `0`。
- **边界：** Process Exit `0` 不等于配置有效，必须读 Control Response；这里验证
  的是 Explicit Source Reader，不是所有交互式 Trust 或 Managed Layer。
- **依据：** [Phase 2C Config Runtime](./comparisons/phase-2c-config-schema-runtime.md)。

<a id="f13-codex"></a>

### Codex

- **表现：** `--strict-config exec` 接受合法配置，并在模型运行前拒绝已知字段类型
  错误、未知顶层字段和非法 MCP 组合；错误包含文件、行列、源文本和 Caret，Exit
  `1`。
- **边界：** 这是显式 Strict Gate，不代表非 Strict 模式采用同样 Policy；合法
  Case 后续刻意停在空 Prompt Gate。
- **依据：** [Phase 2C Config Runtime](./comparisons/phase-2c-config-schema-runtime.md)。

横向结论：Codex–Claude 是 **Partial overlap**；Codex–Qwen 与 Claude–Qwen 仍是
**Unknown**，因为 Qwen 的后续 Consumer 没有闭合。

## 14. 配置分层与来源

<a id="f14-qwen"></a>

### Qwen Code

- **表现：** 所选 Daemon Reader 直接观察到
  `System > trusted Workspace > User > SystemDefaults`。Workspace 不可信时仍返回
  Raw Value，但不参与 Effective Merge。
- **边界：** 只验证无害标量和所选读取入口；对象/数组合并、Reload 和 Write API
  未覆盖。System/SystemDefaults 目前也缺少通用 Provenance 字段。
- **依据：** [Phase 2D Config Layering](./comparisons/phase-2d-config-identity-layering.md)。

<a id="f14-claude"></a>

### Claude Code

- **表现：** 所选 `get_settings` 入口直接观察到 `local > project > user`，并通过
  `sources[]` 保留每个非空层的 Raw Value。
- **边界：** Managed/MDM Policy、交互式 Trust、复杂 Merge 和 Write API 未覆盖。
- **依据：** [Phase 2D Config Layering](./comparisons/phase-2d-config-identity-layering.md)。

<a id="f14-codex"></a>

### Codex

- **表现：** 所选 `config/read` 入口直接观察到
  `sessionFlags > nested project > root project > user`；不可信 Project Layer 会
  返回并标记 `disabledReason`，但不进入 Effective Value。
- **边界：** 只验证无害标量和所选 Reader；复杂 Merge、Reload、Write API 和完整
  Managed Layer 未覆盖。
- **依据：** [Phase 2D Config Layering](./comparisons/phase-2d-config-identity-layering.md)。

三组 Pairwise 都是 **Partial overlap**：三方都能读最终值和部分来源，但层级名称、
Trust Gate 和来源覆盖不同。

## 15. 诊断、日志与故障定位

<a id="f15-qwen"></a>

### Qwen Code

- **表现：** 实测空 PATH 会给出 Git/npm 缺失告警；Daemon Log 不可写时报告
  `EACCES`，降级为 `stderr-only/degraded` 并标记 `init_failed`，服务仍能返回状态并
  正常退出。
- **边界：** Containment 还发现 `EPERM` 被错误归为 `missing_file`，这应修为权限
  错误分类；不能把该观察写成本机真的缺文件。Qwen 没有同形态 Standalone
  `doctor --json`，也不等于没有诊断能力。
- **依据：** [Phase 2E Diagnostic Faults](./comparisons/phase-2e-diagnostic-faults.md)、
  [Phase 2E Results](./27-phase-2e-diagnostic-fault-results.md)。

<a id="f15-claude"></a>

### Claude Code

- **表现：** Exact `--bare doctor` 在隔离 Non-TTY 中 Exit `0`，Stdout/Stderr 为空，
  同时创建 `.claude.json` 和 Backup。
- **边界：** 这只证明该 Route 的空输出，不能写成环境健康、检查通过或没有诊断
  能力。Interactive Doctor 因 Keychain 边界没跑，Debug File、OTel、Redaction 和
  Fault Matrix 也没评估。
- **依据：** [Phase 2B Diagnostics/Config](./comparisons/phase-2b-diagnostics-and-config-runtime.md)、
  [Phase 2E Results](./27-phase-2e-diagnostic-fault-results.md)。

<a id="f15-codex"></a>

### Codex

- **表现：** `doctor --json` 在隔离环境返回 `schemaVersion=1`、18 个检查项及
  ID/Category/Status/Summary/Details/Remediation。故障注入中可定位坏 CA 的 PEM
  解析错误和损坏 Version Cache。
- **边界：** Missing Git 在所选 Profile 下无法可靠控制，因此未评估；Unwritable
  State 也没有选定可比较的 Write Contract。结果不能直接与 Qwen Daemon Status 或
  Claude Interactive Doctor 排名。
- **依据：** [Phase 2B Diagnostics/Config](./comparisons/phase-2b-diagnostics-and-config-runtime.md)、
  [Phase 2E Diagnostic Faults](./comparisons/phase-2e-diagnostic-faults.md)。

三方诊断入口、检查对象和故障 Gate 不同，所以三组横向关系都保持
**Not assessed**。

## 给 Qwen 开发者的三条直接结论

1. **先修确定的 Bug：** Daemon Preflight 至少区分 `ENOENT` 与
   `EACCES/EPERM`，不要把权限阻断提示成“文件不存在”。
2. **再补机器错误协议：** 在保留现有字段的前提下，为 Headless 缺凭据和 Malformed
   Output Schema 增加可版本化的 `code/category/stage/retryable/correlation`。
3. **先调查再改配置：** 画清
   Loader → Effective Config → CLI/Headless/Daemon/Web Shell Consumer 矩阵；在此
   之前不要直接加全局 Strict Gate。

对应已收敛 Backlog：
[Stage 5 Qwen Backlog 与路线图](./30-stage-5-qwen-backlog-roadmap.md)。

## 不能从这张表推出什么

- 入口多不等于能力强，Claim 或命令数量也不是得分。
- “未评估”不等于“不支持”。
- Headless 失败 JSON/JSONL 的形状不能代表成功任务体验。
- Current Docs、CLI、SDK、Daemon、IDE、Desktop、Cloud 和 CI 是不同产品切片；
  一个入口的证据不能自动外推到另一个入口。
- 本轮没有读取凭据、调用模型或产生模型费用；成功任务仍属于独立 R2。

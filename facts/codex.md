# Codex：阶段 1B 产品事实画像

> 产品：Codex  
> 主基线：Codex CLI `0.145.0`，npm `latest`，Darwin arm64  
> Release：`rust-v0.145.0` / `25af12f7e61572b0bc18ddb1008be543b91519b0`  
> Registry：Revision 1，冻结于 `2026-07-25T14:08:12Z`  
> 事实采集截止：`2026-07-25T14:50:57Z`

## 1. 读取边界

本文是单产品 Candidate Fact 集，不是支持矩阵。它不创建跨产品 Comparison、Gap、
优先级或价值判断，也不把未找到的命令、文档或字符串写成“不支持”。

本文同时保留两个不同的版本切片：

- **冻结 CLI 切片**：`@openai/codex@0.145.0`、其 Darwin arm64 平台包、对应
  native binary、wrapper 和 `--help`。这些事实可直接归因到 `0.145.0`。
- **未版本化一方 Surface 切片**：Codex IDE、ChatGPT desktop app、Codex cloud
  以及持续更新的官方文档。此类记录写作
  `unversioned-docs@2026-07-25`，只确认采集时的官方公开 Surface 或承诺；除非
  `0.145.0` 发行物另有印证，不静默回填为该 CLI 版本的 runtime 行为。

本阶段没有登录、进入交互 TUI、提交远端任务、安装扩展、执行外部写操作或运行模型
请求。Help probe 只证明公开入口；官方文档只证明厂商在采集时的公开描述。

## 2. 官方入口清单

| 一级域 | 本阶段使用的一方入口 | 本阶段仍未检查或未复现 |
| --- | --- | --- |
| `CAP-01` 发布与产品边界 | [CLI](https://developers.openai.com/codex/cli)、[Authentication](https://developers.openai.com/codex/auth)、[Developer commands](https://developers.openai.com/codex/cli/reference/)、[`rust-v0.145.0`](https://github.com/openai/codex/releases/tag/rust-v0.145.0) | 自动升级/回退、签名、SBOM、provenance 验证和套餐/地域 gate |
| `CAP-02` 交互与客户端形态 | [CLI](https://developers.openai.com/codex/cli)、[IDE](https://developers.openai.com/codex/ide)、[Cloud](https://developers.openai.com/codex/cloud)、[Slash commands](https://developers.openai.com/codex/reference/slash-commands) | TUI 多轮、resize、键鼠、流式渲染、通知和跨设备接续 |
| `CAP-03` Agent 执行循环 | [Long-running work](https://developers.openai.com/codex/long-running-work)、[Slash commands](https://developers.openai.com/codex/reference/slash-commands)、[Non-interactive](https://developers.openai.com/codex/noninteractive) | 真实计划质量、工具循环、steering 延迟、取消传播、失败恢复和 runaway guard |
| `CAP-04` 上下文、会话与记忆 | [AGENTS.md](https://developers.openai.com/codex/agent-configuration/agents-md)、[Memories](https://developers.openai.com/codex/customization/memories)、[Slash commands](https://developers.openai.com/codex/reference/slash-commands) | transcript 跨重启、自动/手动 compaction 结果、memory 写入/召回/删除和上下文索引 |
| `CAP-05` 代码与环境工具 | [CLI](https://developers.openai.com/codex/cli)、[Code review](https://developers.openai.com/codex/code-review)、冻结 CLI help | 实际内建工具清单、文件/命令/VCS 副作用、浏览器/桌面工具和失败边界 |
| `CAP-06` 权限、安全与治理 | [Permissions](https://developers.openai.com/codex/permissions)、[Sandboxing](https://developers.openai.com/codex/sandboxing)、[Rules](https://developers.openai.com/codex/agent-configuration/rules)、[Hooks](https://developers.openai.com/codex/hooks) | sandbox 逃逸探针、逐动作批准/拒绝、规则求值、受管策略和审计/保留实际强制 |
| `CAP-07` 扩展机制 | [MCP](https://developers.openai.com/codex/extend/mcp)、[Skills](https://developers.openai.com/codex/build-skills)、[Plugins](https://developers.openai.com/codex/build-plugins)、[Hooks](https://developers.openai.com/codex/hooks) | 动态加载、热重载、版本冲突、扩展故障隔离、权限传播和远端 Surface 一致性 |
| `CAP-08` 多 Agent、任务与隔离 | [Subagents](https://developers.openai.com/codex/agent-configuration/subagents)、[Worktrees](https://developers.openai.com/codex/environments/git-worktrees)、[Cloud](https://developers.openai.com/codex/cloud) | 实际并发、上下文/工具继承、定向消息、取消、失败传播、重连和资源回收 |
| `CAP-09` 软件交付与协作系统 | [Code review](https://developers.openai.com/codex/code-review)、[GitHub review](https://developers.openai.com/codex/integrations/github)、[GitHub Action](https://developers.openai.com/codex/github-action) | PR/评论/CI 的认证 runtime、幂等性、revision 绑定、合并与发布流程 |
| `CAP-10` 自动化与编程接入 | [Non-interactive](https://developers.openai.com/codex/noninteractive)、[SDK](https://developers.openai.com/codex/codex-sdk)、[App Server](https://developers.openai.com/codex/app-server)、[MCP Server](https://developers.openai.com/codex/mcp-server)、[Scheduled tasks](https://developers.openai.com/codex/automations) | 事件顺序、退出码矩阵、取消/重连、背压、daemon 生命周期和 CI runtime |
| `CAP-11` 模型、Provider 与运行经济性 | [Models](https://developers.openai.com/codex/models)、[Advanced config](https://developers.openai.com/codex/config-advanced)、[Config reference](https://developers.openai.com/codex/config-reference) | 账号可用模型发现、实际路由、fallback、缓存、计费、token 和 rate-limit runtime |
| `CAP-12` 可观测性、可靠性与运维 | [Developer commands](https://developers.openai.com/codex/cli/reference/)、[Advanced config](https://developers.openai.com/codex/config-advanced)、[App Server](https://developers.openai.com/codex/app-server) | doctor 实际诊断、OTel 导出、脱敏、crash 证据、升级恢复和压力/背压测试 |

## 3. Candidate Facts

状态只使用 `Confirmed`、`Inferred`、`Unknown`。`Confirmed` 表示证据适合本条所述
范围；它不自动表示完整 runtime 行为已复现。

### 3.1 `CAP-01` 发布与产品边界

| Fact ID | Atomic ID(s) | 版本 / Surface | Candidate fact | Evidence | Epistemic / lifecycle | 限制 |
| --- | --- | --- | --- | --- | --- | --- |
| `FACT-codex-001` | `CAP-01.01-A02`, `CAP-01.01-A03`, `CAP-01.05-A01` | `0.145.0` / CLI distribution | 官方 wrapper 声明 npm 入口；发行 README 同时列出 native installer、Homebrew 和按 OS/arch 下载 GitHub Release binary 的入口。wrapper 精确依赖 Darwin/Linux/Windows 的 x64/arm64 平台包。 | `EVD-codex-META-001`, `EVD-codex-SOURCE-001`, `EVD-codex-DOC-001` | `Confirmed`; stable/latest CLI | 只实检 Darwin arm64 artifact；其他平台只确认 manifest 映射，未启动。 |
| `FACT-codex-002` | `CAP-01.02-A01`, `CAP-01.02-A02` | `0.145.0` / npm wrapper | ESM launcher 将宿主 OS/arch 映射到 target triple，解析相应 optional dependency 中的 native binary；以继承的 cwd、环境和 stdio 启动，转发 `SIGINT`/`SIGTERM`/`SIGHUP`，并镜像退出码或终止信号。 | `EVD-codex-SOURCE-001` | `Confirmed`; stable/latest CLI | 代码路径已确认；本阶段未用注入 argv、signal 或非零退出码做 wrapper runtime probe。 |
| `FACT-codex-003` | `CAP-01.03-A02` | `0.145.0` / Darwin arm64 binary | 冻结 binary 报告 `codex-cli 0.145.0`；wrapper、平台 tarball 与 binary 均记录 SHA-256，可复核本次读取的发行身份。 | `EVD-codex-META-001`, `EVD-codex-RUNTIME-001` | `Confirmed`; stable/latest CLI | 本地 SHA-256 证明本次 artifact 同一性，不是发布方校验值，也不等于发布者签名或 provenance。 |
| `FACT-codex-004` | `CAP-01.08-A01`, `CAP-01.09-A01` | `0.145.0` / CLI | 顶层 help 公开 interactive CLI、`exec`、`review`、认证、MCP、plugin、MCP server、desktop launcher、session 操作、cloud 等入口；同时把 `app-server`、`remote-control`、`cloud`、`exec-server` 显式标为 experimental。 | `EVD-codex-HELP-001` | `Confirmed`; mixed stable/experimental labels | help 只确认入口及标签，不确认 entitlement、默认启用或正常路径可执行。 |
| `FACT-codex-005` | `CAP-01.11-A01` | `0.145.0` CLI + `unversioned-docs@2026-07-25` / auth | `login` help 公开 ChatGPT、device flow、API key stdin 和 access token stdin 路径；官方认证页说明本地 desktop/CLI/IDE 可用 ChatGPT 或 API key，而 cloud 要求 ChatGPT 登录。 | `EVD-codex-HELP-003`, `EVD-codex-DOC-002` | `Confirmed` for CLI surface; docs-current for cross-surface rule | 没有写入或读取真实凭据；登录、退出、切换身份和 cloud gate 均未复现。 |

### 3.2 `CAP-02` 交互与客户端形态

| Fact ID | Atomic ID(s) | 版本 / Surface | Candidate fact | Evidence | Epistemic / lifecycle | 限制 |
| --- | --- | --- | --- | --- | --- | --- |
| `FACT-codex-006` | `CAP-02.01-A01` | `0.145.0` / CLI | 无子命令时，顶层参数和 prompt 进入 interactive CLI；发行 README 将其描述为在本机运行的 coding agent。 | `EVD-codex-HELP-001`, `EVD-codex-DOC-001` | `Confirmed` for entry; stable/latest CLI | 未进入 TUI，因此多轮连续性、渲染和输入行为仍待测。 |
| `FACT-codex-007` | `CAP-02.03-A01` | `0.145.0` / CLI | 顶层 `--image <FILE>...` 可将一个或多个图片附加到初始 prompt。 | `EVD-codex-HELP-001` | `Confirmed` for option surface; stable/latest CLI | 未验证格式、尺寸、模型兼容、错误和图像实际进入请求。 |
| `FACT-codex-008` | `CAP-02.06-A01`, `CAP-02.06-A02` | `unversioned-docs@2026-07-25` / IDE | 官方 IDE 文档描述从编辑器启动 Codex，并把打开文件、选区等编辑器上下文加入 prompt，且可在编辑器中审阅改动。 | `EVD-codex-DOC-003` | `Confirmed` as current official promise; lifecycle not pinned | IDE 扩展 build、连接、陈旧选区和同步冲突未验证。 |
| `FACT-codex-009` | `CAP-02.07-A01` | `0.145.0` / CLI→desktop launcher | 顶层 `app` 命令公开 desktop app 启动入口，并声明缺失时打开 installer；发行 README 也把 desktop app 列为一方 Surface。 | `EVD-codex-HELP-001`, `EVD-codex-SOURCE-001` | `Confirmed` for launcher surface; stable/latest CLI | 未实际打开 GUI，desktop build、任务管理和安装副作用未验证。 |
| `FACT-codex-010` | `CAP-02.08-A01`, `CAP-02.08-A02`, `CAP-02.08-A03` | `0.145.0` CLI + `unversioned-docs@2026-07-25` / web-cloud | `cloud` help 公开按 environment/branch 提交任务、列举/查看 task 状态和 diff；官方 cloud 文档描述选择仓库/环境、观察任务、检查 summary/diff 并继续 follow-up。 | `EVD-codex-HELP-004`, `EVD-codex-DOC-004` | `Confirmed` for CLI command surface; experimental in CLI | 需要登录、仓库和 cloud entitlement；任务 ID、状态准确性和环境映射未运行验证。 |
| `FACT-codex-011` | `CAP-02.09-A01` | `0.145.0` / CLI | 顶层公开 `resume` picker、`--last`、`fork` picker、`archive`、`unarchive` 和 `delete` 的 session 导航/管理入口。 | `EVD-codex-HELP-001`, `EVD-codex-HELP-002` | `Confirmed` for command surface; stable/latest CLI | 未创建 session；列表元数据、选择准确性、持久性和删除语义未验证。 |

### 3.3 `CAP-03` Agent 执行循环

| Fact ID | Atomic ID(s) | 版本 / Surface | Candidate fact | Evidence | Epistemic / lifecycle | 限制 |
| --- | --- | --- | --- | --- | --- | --- |
| `FACT-codex-012` | `CAP-03.02-A01`, `CAP-03.02-A03` | `unversioned-docs@2026-07-25` / desktop, CLI, IDE | 官方 slash-command/long-running 文档公开 `/plan` 规划模式，并建议在目标不清楚时先形成带约束和可验证成功条件的计划，再进入 `/goal`。 | `EVD-codex-DOC-006`, `EVD-codex-DOC-007` | `Confirmed` as current official promise; lifecycle not pinned | 未证明 `0.145.0` CLI 的实际 plan UI、计划质量或状态转换。 |
| `FACT-codex-013` | `CAP-03.04-A03`, `CAP-03.07-A01`, `CAP-03.08-A03` | `unversioned-docs@2026-07-25` / desktop, CLI, IDE | `/goal` 被描述为持久目标入口；同一 chat/session 可继续 steering 或询问状态，desktop 进度控件可 pause、resume、edit 或 clear。 | `EVD-codex-DOC-006`, `EVD-codex-DOC-007` | `Confirmed` as current official promise; lifecycle not pinned | CLI/IDE 的 pause 控件差异、状态落盘、重启恢复和中断延迟未验证。 |
| `FACT-codex-014` | `CAP-03.11-A02`, `CAP-03.11-A03` | `0.145.0` CLI + `unversioned-docs@2026-07-25` / headless | `exec` 公开 final-message 输出文件和 JSONL 事件选项；官方文档说明进度走 stderr、最终消息走 stdout，并以非零退出表示失败。 | `EVD-codex-HELP-002`, `EVD-codex-DOC-010` | `Confirmed` for options; current-doc promise for channel semantics | 未发起模型任务；最终内容、blocked 表达、错误分类和退出码矩阵未复现。 |

### 3.4 `CAP-04` 上下文、会话与记忆

| Fact ID | Atomic ID(s) | 版本 / Surface | Candidate fact | Evidence | Epistemic / lifecycle | 限制 |
| --- | --- | --- | --- | --- | --- | --- |
| `FACT-codex-015` | `CAP-04.01-A01`, `CAP-04.01-A02` | `unversioned-docs@2026-07-25` / local Codex clients | 官方文档描述每次 run 读取指令一次：先找全局 `AGENTS.override.md`/`AGENTS.md`，再从 project root 到 cwd 按目录查找并由浅到深拼接，更深层文件后生效；默认总量上限 32 KiB。 | `EVD-codex-DOC-009` | `Confirmed` as current official promise; lifecycle not pinned | 未在 `0.145.0` 上构造冲突目录树或验证 fallback 文件名、截断和刷新。 |
| `FACT-codex-016` | `CAP-04.04-A01` | `0.145.0` / CLI | 顶层和 `exec` help 提供 `--cd` 选择主工作目录，以及可重复的 `--add-dir` 增加额外可写目录。 | `EVD-codex-HELP-001`, `EVD-codex-HELP-002` | `Confirmed` for option surface; stable/latest CLI | 多 root 的指令发现、VCS 根和 sandbox 边界未运行验证。 |
| `FACT-codex-017` | `CAP-04.09-A01`, `CAP-04.10-A01`, `CAP-04.10-A02`, `CAP-04.10-A03` | `0.145.0` / CLI | `resume` 可按 picker、ID/name 或 `--last` 继续；`fork` 可从 picker、ID/name 或最近 session 创建分支；`exec resume` 另公开 headless continuation；`exec --ephemeral` 则声明不保存 session 持久文件。 | `EVD-codex-HELP-002` | `Confirmed` for command/option surface; stable/latest CLI | 历史完整性、fork 独立身份、最近项选择、损坏/无权失败和实际落盘位置未验证。 |
| `FACT-codex-018` | `CAP-04.07-A02` | `unversioned-docs@2026-07-25` / desktop composer | 官方 slash-command 表把 `/compact` 定义为压缩当前 chat 上下文。 | `EVD-codex-DOC-006` | `Confirmed` as current official promise; lifecycle not pinned | 未验证 CLI `0.145.0` 可用性、压缩范围、替代表示、token 变化或约束保留。 |
| `FACT-codex-019` | `CAP-04.11-A02`, `CAP-04.12-A02`, `CAP-04.12-A04` | `unversioned-docs@2026-07-25` / desktop, CLI, IDE | 官方 memory 文档说明本地 memory 默认关闭，默认位于 `~/.codex/memories/`；desktop/TUI 的 `/memories` 可分别控制当前 chat 是否使用既有 memory、是否作为未来 memory 生成输入，IDE 使用所连接 Codex host 的本地 store。 | `EVD-codex-DOC-008` | `Confirmed` as current official promise; default-off | memory 生成/召回、secret redaction、冲突、删除和跨重启行为未复现；文档未绑定 CLI build。 |

### 3.5 `CAP-05` 代码与环境工具

| Fact ID | Atomic ID(s) | 版本 / Surface | Candidate fact | Evidence | Epistemic / lifecycle | 限制 |
| --- | --- | --- | --- | --- | --- | --- |
| `FACT-codex-020` | `CAP-05.01-A02`, `CAP-05.03-A02`, `CAP-05.05-A01` | `0.145.0` + `unversioned-docs@2026-07-25` / local CLI | 官方 CLI 入口把 Codex 描述为在本地仓库中检查、编辑和运行代码的 agent。 | `EVD-codex-DOC-001` | `Confirmed` as official product promise; stable/latest CLI | 没有把该概括拆成已复现的具体 read/edit/shell tool；错误、范围和原子性均待测。 |
| `FACT-codex-021` | `CAP-05.10-A02` | `0.145.0` / CLI | 顶层 `--search` 明确声明启用 live web search，并使原生 web search tool 对模型可用。 | `EVD-codex-HELP-001` | `Confirmed` for option/tool surface; stable/latest CLI | 未启用网络或执行查询；来源、限流、域名许可和失败结果未验证。 |
| `FACT-codex-022` | `CAP-05.09-A01`, `CAP-05.09-A02` | `0.145.0` / CLI review | `review` 可选择未提交改动、与 base branch 的差异或指定 commit，并允许附加 title/context。 | `EVD-codex-HELP-002`, `EVD-codex-DOC-020` | `Confirmed` for scope surface; stable/latest CLI | 未验证所读 revision 是否完整、是否保持工作树不变或 review 结果质量。 |
| `FACT-codex-023` | `CAP-05.03-A03` | `0.145.0` / CLI cloud handoff | `apply` 命令声明把 Codex cloud task 的最新 diff 通过 `git apply` 应用到本地工作树；`cloud apply`/`cloud diff` 另提供按 task/attempt 访问结果的入口。 | `EVD-codex-HELP-002`, `EVD-codex-HELP-004` | `Confirmed` for command surface; cloud experimental | 未执行写操作；冲突、部分应用、回滚和目标 task 绑定未验证。 |
| `FACT-codex-024` | `CAP-05.05-A01`, `CAP-05.05-A04` | `0.145.0` / CLI sandbox helper | `sandbox` 子命令公开在 Codex-provided sandbox 内运行指定命令的入口，并提供 macOS/Linux 子入口及 full-auto 配置。 | `EVD-codex-HELP-002` | `Confirmed` for helper surface; stable/latest CLI | 未执行目标命令；stdout/stderr/exit code、cwd/env 和具体 containment 均待测。 |

### 3.6 `CAP-06` 权限、安全与治理

| Fact ID | Atomic ID(s) | 版本 / Surface | Candidate fact | Evidence | Epistemic / lifecycle | 限制 |
| --- | --- | --- | --- | --- | --- | --- |
| `FACT-codex-025` | `CAP-06.02-A01`, `CAP-06.02-A04`, `CAP-06.05-A01`, `CAP-06.05-A03` | `0.145.0` CLI + `unversioned-docs@2026-07-25` | CLI 公开 `read-only`、`workspace-write`、`danger-full-access` sandbox 模式，以及 `untrusted`、`on-request`、`never` approval posture；官方 sandbox 文档分别描述文件与网络边界。 | `EVD-codex-HELP-001`, `EVD-codex-DOC-011`, `EVD-codex-DOC-012` | `Confirmed` for controls; stable/latest CLI | 未运行越界文件/网络/进程探针，默认值和实际拒绝 UX 未复现。 |
| `FACT-codex-026` | `CAP-06.03-A02`, `CAP-06.03-A04`, `CAP-06.03-A05`, `CAP-06.04-A01`, `CAP-06.04-A02` | `unversioned-docs@2026-07-25` / permission profiles | 官方 permissions 文档公开具名 filesystem read/write/deny 和 network enabled/allowed_domains/denied_domains；deny 优先，workspace root 可作为特殊范围。 | `EVD-codex-DOC-011` | `Confirmed` as current config contract; lifecycle not pinned | 未验证路径规范化、symlink、重定向、规则来源解释和运行时 enforcement。 |
| `FACT-codex-027` | `CAP-06.03-A01`, `CAP-06.03-A05` | `unversioned-docs@2026-07-25` / local rules | 官方 rules 文档把 prefix rule 标为 experimental，用于控制 sandbox 外命令；project rules 只在 trusted project 生效，用户批准可写入 `default.rules`，managed rules 可施加更严格约束。 | `EVD-codex-DOC-013` | `Confirmed` as current official contract; experimental | 未创建规则或执行 match/near-miss/冲突探针。 |
| `FACT-codex-028` | `CAP-06.01-A03`, `CAP-06.08-A02` | `0.145.0` + `unversioned-docs@2026-07-25` / hooks | 官方 hooks/config 文档说明非 managed hooks 需要 workspace trust，project-local hooks 只在 project `.codex/` layer trusted 时加载；CLI 另公开 `--bypass-hook-trust`。 | `EVD-codex-DOC-014`, `EVD-codex-HELP-001` | `Confirmed` for documented gate and flag surface | 未验证首次信任 UX、handler 的实际权限传播或 bypass 的作用范围。 |
| `FACT-codex-029` | `CAP-06.02-A04` | `0.145.0` / CLI | CLI 显式公开 `--dangerously-bypass-approvals-and-sandbox`，并标注为绕过 approvals 与 sandbox、仅用于外部 sandbox 环境；另公开只绕过 hook trust 的独立 flag。 | `EVD-codex-HELP-001` | `Confirmed` for high-risk mode surface; stable/latest CLI | 没有启用；不推断其能绕过 OS、组织或远端控制。 |

### 3.7 `CAP-07` 扩展机制

| Fact ID | Atomic ID(s) | 版本 / Surface | Candidate fact | Evidence | Epistemic / lifecycle | 限制 |
| --- | --- | --- | --- | --- | --- | --- |
| `FACT-codex-030` | `CAP-07.04-A05`, `CAP-07.04-A06` | `0.145.0` / CLI MCP client | `mcp` 公开 list/get/add/remove/login/logout；`add` 可注册 stdio command 或 streamable HTTP URL，并接受 env、bearer-token env、OAuth client/resource/scopes。 | `EVD-codex-HELP-003`, `EVD-codex-DOC-015` | `Confirmed` for configuration surface; stable/latest CLI | 未添加 server、认证或连接；握手、重连和持久位置未验证。 |
| `FACT-codex-031` | `CAP-07.04-A01`, `CAP-07.04-A02` | `0.145.0` CLI + `unversioned-docs@2026-07-25` / MCP server | `mcp-server` 公开 stdio server 入口；官方文档描述其对外提供 `codex` 与 `codex-reply` 两个工具，以新建或继续 Codex session。 | `EVD-codex-HELP-003`, `EVD-codex-DOC-025` | `Confirmed` for server/tool contract; stable/latest CLI | 未启动 server、执行 initialize/tools/list 或工具调用。 |
| `FACT-codex-032` | `CAP-07.05-A01`, `CAP-07.05-A04`, `CAP-07.05-A05`, `CAP-07.05-A08` | `0.145.0` / CLI plugins | `plugin` 公开 add/list/remove；marketplace 公开 add/list/upgrade/remove，并接受本地或 Git source、ref、sparse 路径及 JSON 输出。官方文档把 plugin 定义为 skills、MCP servers 或两者的可安装包。 | `EVD-codex-HELP-003`, `EVD-codex-DOC-016` | `Confirmed` for lifecycle surface; stable/latest CLI | 未安装、升级或移除；签名、版本固定、冲突和失败清理未验证。 |
| `FACT-codex-033` | `CAP-07.02-A01`, `CAP-07.02-A02`, `CAP-07.02-A04` | `unversioned-docs@2026-07-25` / local Codex clients | 官方 skills 文档把 skill 描述为带 task-specific instructions、resources 和 scripts 的可复用能力，遵循 open skills 结构，并可通过 plugin 分发。 | `EVD-codex-DOC-017` | `Confirmed` as current official contract; lifecycle not pinned | discovery、触发、渐进加载、依赖和资源越界未做 runtime probe。 |
| `FACT-codex-034` | `CAP-07.03-A01`, `CAP-07.03-A02`, `CAP-07.03-A03` | `unversioned-docs@2026-07-25` / local hooks | 官方 hooks 文档列出 PreToolUse、PermissionRequest、PostToolUse、Pre/PostCompact、UserPromptSubmit、SubagentStop、Stop、SessionStart/SubagentStart/SessionEnd 等事件；当前只有 command handler，多个匹配 command hook 并行执行。 | `EVD-codex-DOC-014` | `Confirmed` as current official contract; hooks enabled by default in docs | 文档说明 async 配置可解析但尚不支持，故不映射异步 Hook；事件顺序、阻断和失败隔离未运行。 |
| `FACT-codex-035` | `CAP-07.06-A01`, `CAP-07.06-A02`, `CAP-07.06-A03` | `unversioned-docs@2026-07-25` / custom Codex agents | 官方 subagent 文档允许本地 Codex client 定义具有不同 instructions、model configuration 和 tool choices 的 custom agents。 | `EVD-codex-DOC-018` | `Confirmed` as current official contract; lifecycle not pinned | 角色文件 schema、工具 allowlist enforcement、冲突和实际模型路由未复现。 |

### 3.8 `CAP-08` 多 Agent、任务与隔离

| Fact ID | Atomic ID(s) | 版本 / Surface | Candidate fact | Evidence | Epistemic / lifecycle | 限制 |
| --- | --- | --- | --- | --- | --- | --- |
| `FACT-codex-036` | `CAP-08.02-A01`, `CAP-08.03-A01`, `CAP-08.05-A04` | `unversioned-docs@2026-07-25` / desktop, CLI, IDE, hosted Work | 官方 subagent 文档描述把有界独立工作委派给 specialized agents 并行执行，主 thread 收集结果到最终响应；文档称 current Codex releases 默认启用该 workflow。 | `EVD-codex-DOC-018` | `Confirmed` as current official promise; default-on in current docs | “current releases” 未绑定 `0.145.0`；未测并发重叠、结果完整性或部分失败。 |
| `FACT-codex-037` | `CAP-08.01-A01`, `CAP-08.01-A02`, `CAP-08.01-A03`, `CAP-08.06-A02`, `CAP-08.06-A04` | `unversioned-docs@2026-07-25` / local subagents | 自定义 agent 可声明角色用途、instructions 和 model configuration，并可由任务或适用的 AGENTS/skill 指令触发委派。 | `EVD-codex-DOC-018` | `Confirmed` as current official contract; lifecycle not pinned | 未枚举实际角色、验证显式选择、继承优先级或 fallback。 |
| `FACT-codex-038` | `CAP-08.06-A01`, `CAP-06.08-A05` | `unversioned-docs@2026-07-25` / local subagents | 官方文档说明每个 subagent 执行自己的模型和工具工作，并继承当前 sandbox policy。 | `EVD-codex-DOC-018` | `Confirmed` as current official promise; lifecycle not pinned | 有效工具集合、审批传播和“不得高于父级”的 enforcement 未做 runtime probe。 |
| `FACT-codex-039` | `CAP-08.08-A01`, `CAP-08.08-A02`, `CAP-08.08-A03` | `unversioned-docs@2026-07-25` / desktop worktrees | desktop worktree 文档把每个 worktree 放在 `$CODEX_HOME/worktrees`，以 detached HEAD 隔离修改；支持 `.worktreeinclude`，清理前保存 snapshot，并提供 Local/Worktree handoff。 | `EVD-codex-DOC-019` | `Confirmed` as current official contract; desktop-only | 未创建 worktree；分支所有权、未跟踪文件、进程/端口隔离和清理恢复未验证。 |
| `FACT-codex-040` | `CAP-08.07-A02`, `CAP-08.07-A03`, `CAP-08.07-A04`, `CAP-08.07-A05` | `unversioned-docs@2026-07-25` / CLI, IDE, desktop | CLI `/agent` 可检查和切换 agent threads；desktop/IDE 可显示活动 subagent、打开单个 thread，IDE 文档还描述 stop-all 控件。 | `EVD-codex-DOC-018` | `Confirmed` as current official UI promise; lifecycle not pinned | roster 稳定 ID、只读 attach、单 child 控制、竞态和跨重启恢复未验证。 |
| `FACT-codex-041` | `CAP-08.12-A01`, `CAP-08.08-A01` | `0.145.0` CLI + `unversioned-docs@2026-07-25` / cloud | `cloud exec` 提供 `--attempts 1..4` 以请求多次 agent attempts；官方 cloud 文档把任务运行在隔离 cloud environment，并允许并行/background 执行。 | `EVD-codex-HELP-004`, `EVD-codex-DOC-004` | `Confirmed` for CLI option; cloud experimental in CLI | 未提交任务；候选独立性、并行时间线、选择/聚合与环境隔离未验证。 |

### 3.9 `CAP-09` 软件交付与协作系统

| Fact ID | Atomic ID(s) | 版本 / Surface | Candidate fact | Evidence | Epistemic / lifecycle | 限制 |
| --- | --- | --- | --- | --- | --- | --- |
| `FACT-codex-042` | `CAP-09.03-A01`, `CAP-09.03-A03` | `0.145.0` CLI + `unversioned-docs@2026-07-25` / local review | `codex review` 公开未提交改动、base branch 和 commit 三种范围；官方文档描述 dedicated reviewer 输出 prioritized actionable findings 且不修改工作树。 | `EVD-codex-HELP-002`, `EVD-codex-DOC-020` | `Confirmed` for command and official contract; stable/latest CLI | 未对冻结 revision 运行 review；finding 结构、严重度、准确性和只读性未复现。 |
| `FACT-codex-043` | `CAP-09.02-A02`, `CAP-09.03-A01`, `CAP-09.04-A02` | `unversioned-docs@2026-07-25` / GitHub integration | 官方 GitHub 文档描述在 PR 评论中用 `@codex review` 请求 review，或启用 automatic reviews；Codex 读取 PR diff/AGENTS guidance 并发布标准 GitHub review。 | `EVD-codex-DOC-021` | `Confirmed` as current official integration promise; lifecycle not pinned | 未认证 GitHub、未发评论；revision 绑定、重复触发、权限、评论内容和自动 review gate 未验证。 |
| `FACT-codex-044` | `CAP-09.07-A01` | `unversioned-docs@2026-07-25` / cloud→GitHub | 官方 cloud 文档描述任务完成后可检查 summary/diff、继续 follow-up，并从结果打开 pull request。 | `EVD-codex-DOC-004` | `Confirmed` as current official promise; lifecycle not pinned | 未创建 branch/PR；目标仓库、base、幂等性、权限和失败清理未验证。 |

### 3.10 `CAP-10` 自动化与编程接入

| Fact ID | Atomic ID(s) | 版本 / Surface | Candidate fact | Evidence | Epistemic / lifecycle | 限制 |
| --- | --- | --- | --- | --- | --- | --- |
| `FACT-codex-045` | `CAP-10.01-A01`, `CAP-10.02-A01`, `CAP-10.02-A02`, `CAP-10.02-A04`, `CAP-10.03-A02`, `CAP-10.03-A03` | `0.145.0` / CLI headless | `exec` 接受 argv prompt 或 stdin，支持 `--cd`/`--add-dir`、`--json` JSONL、`--output-schema`、`--output-last-message`、`--ephemeral` 和 `--ignore-user-config`。 | `EVD-codex-HELP-002`, `EVD-codex-DOC-010` | `Confirmed` for automation surface; stable/latest CLI | 未执行模型任务；stdin 字节、事件 schema、输出校验、错误和退出状态未复现。 |
| `FACT-codex-046` | `CAP-10.06-A01`, `CAP-10.06-A02`, `CAP-10.06-A03` | `unversioned-docs@2026-07-25` / TypeScript & Python SDK | 官方 SDK 文档提供 TypeScript `@openai/codex-sdk` 的 `startThread`/`run`/resume 路径和 Python 3.10+ SDK；Python 侧控制本地 app-server JSON-RPC，并携带 pinned CLI runtime。 | `EVD-codex-DOC-023` | `Confirmed` as current SDK contract; lifecycle not pinned | 未安装 SDK；版本、事件订阅、取消、异常和进程生命周期未验证。 |
| `FACT-codex-047` | `CAP-10.07-A01`, `CAP-10.07-A02`, `CAP-10.07-A05`, `CAP-10.08-A01` | `0.145.0` CLI + `unversioned-docs@2026-07-25` / app-server | `app-server` 在 CLI 中标为 experimental，公开 stdio/Unix socket/WebSocket transport、schema 生成和 daemon 管理；官方文档描述 JSON-RPC 请求、notifications、server requests、auth/history/approval/streamed events。 | `EVD-codex-HELP-004`, `EVD-codex-DOC-024` | `Confirmed` for command/protocol surface; experimental | 未启动 server、协商协议、创建 thread、批准工具或验证 transport 兼容。 |
| `FACT-codex-048` | `CAP-10.07-A01`, `CAP-10.07-A02` | `0.145.0` / MCP server | `codex mcp-server` 以 stdio 暴露可复用的 Codex session 工具，供 MCP client 或 Agents SDK orchestration 调用。 | `EVD-codex-HELP-003`, `EVD-codex-DOC-025` | `Confirmed` for server surface; stable/latest CLI | 未验证 server 启停、并发 session、错误或取消。 |
| `FACT-codex-049` | `CAP-10.09-A01`, `CAP-10.09-A02`, `CAP-10.09-A03` | `unversioned-docs@2026-07-25` / GitHub Actions | 官方 `openai/codex-action@v1` 文档描述在 CI/CD 中安装 CLI、通过 API proxy 使用 key，并以 `codex exec` 运行 patch/review 类任务。 | `EVD-codex-DOC-022` | `Confirmed` as current CI integration contract; lifecycle not pinned | 未运行 workflow；credential scope、权限、状态发布、artifact 和失败退出未验证。 |
| `FACT-codex-050` | `CAP-10.12-A01`, `CAP-10.12-A03` | `0.145.0` / cloud CLI & exec-server | experimental `cloud exec/status/list/diff/apply` 提供远端任务提交与查询入口；experimental `exec-server` 提供 WebSocket/stdio 的 standalone remote registration service。 | `EVD-codex-HELP-004` | `Confirmed` for experimental command surface | 未登录或启动服务；托管存活、attach/cancel、回调、所有权和重连未知。 |
| `FACT-codex-051` | `CAP-10.10-A01` | `unversioned-docs@2026-07-25` / desktop & web scheduled tasks | 官方 scheduled-task 文档描述按 recurrence 在后台运行、查看 active/paused/completed 和 recent runs；可在新 chat 或既有 chat 上执行，本地 Git 项目可选 local project 或隔离 worktree。 | `EVD-codex-DOC-026` | `Confirmed` as current official promise; lifecycle not pinned | 没有创建 schedule；错过触发、去重、停止、通知、机器离线和 unattended permission 结果未验证；未发现条件式持续监控证据。 |

### 3.11 `CAP-11` 模型、Provider 与运行经济性

| Fact ID | Atomic ID(s) | 版本 / Surface | Candidate fact | Evidence | Epistemic / lifecycle | 限制 |
| --- | --- | --- | --- | --- | --- | --- |
| `FACT-codex-052` | `CAP-11.01-A01`, `CAP-11.03-A02` | `0.145.0` / CLI | CLI 公开 `--model` 显式选择模型，`--oss` 使用本地 open-source provider，并用 `--local-provider` 限定 `lmstudio` 或 `ollama`。 | `EVD-codex-HELP-001`, `EVD-codex-DOC-027` | `Confirmed` for selection/config surface; stable/latest CLI | 未请求模型；实际 endpoint、模型身份、可用性、fallback 和兼容性未验证。 |
| `FACT-codex-053` | `CAP-11.01-A01`, `CAP-11.01-A02`, `CAP-11.02-A01` | `unversioned-docs@2026-07-25` / provider config | Advanced config 允许自定义 base URL、wire API、认证和 headers；保留 `openai`/`ollama`/`lmstudio` ID，另描述 built-in Amazon Bedrock、本地 OSS provider 和 Azure Responses 配置。 | `EVD-codex-DOC-027` | `Confirmed` as current config contract; lifecycle varies by provider | 未配置 endpoint/credential；协议转换、鉴权刷新、数据地域和错误归一化未验证。 |
| `FACT-codex-054` | `CAP-11.03-A03`, `CAP-11.04-A01` | `unversioned-docs@2026-07-25` / CLI config | `model_reasoning_effort` 可设置 supported model 的推理预算；具名 profile 以 `~/.codex/<name>.config.toml` 覆盖 user config，并由 `--profile` 选择，CLI `--model`/`--config` 可做单次覆盖。 | `EVD-codex-DOC-027` | `Confirmed` as current config contract; profile behavior documented for 0.134.0+ | 未验证请求实际携带 effort、非法值、model-dependent 范围或 profile 冲突。 |
| `FACT-codex-055` | `CAP-11.09-A03`, `CAP-04.06-A01` | `unversioned-docs@2026-07-25` / desktop composer | `/status` 被官方 slash-command 表描述为显示 chat ID、context usage 和 rate limits。 | `EVD-codex-DOC-006` | `Confirmed` as current UI promise; lifecycle not pinned | 未验证数值来源、实时性、重置窗口、token 细分或 cost。 |

### 3.12 `CAP-12` 可观测性、可靠性与运维

| Fact ID | Atomic ID(s) | 版本 / Surface | Candidate fact | Evidence | Epistemic / lifecycle | 限制 |
| --- | --- | --- | --- | --- | --- | --- |
| `FACT-codex-056` | `CAP-12.05-A02`, `CAP-12.06-A03` | `0.145.0` / CLI doctor | `doctor` 公开诊断 local installation、config、auth 和 runtime health 的入口，支持 JSON、summary/all 和 redacted report 选项。 | `EVD-codex-HELP-005` | `Confirmed` for diagnostic surface; stable/latest CLI | 未运行 authenticated/full report；检查项、remediation、脱敏和退出码未验证。 |
| `FACT-codex-057` | `CAP-12.09-A01`, `CAP-12.09-A02` | `0.145.0` CLI + `unversioned-docs@2026-07-25` / config | CLI 公开 `--strict-config` 和任意 TOML `--config key=value` 覆盖；官方 config 文档描述 user/profile/project/CLI 分层，且不可信 project 的 `.codex/` 配置不加载。 | `EVD-codex-HELP-001`, `EVD-codex-DOC-027` | `Confirmed` for controls and current config contract | 未构造多层冲突、未知键、非法类型或 source explanation probe。 |
| `FACT-codex-058` | `CAP-12.03-A01`, `CAP-12.03-A02`, `CAP-12.03-A04`, `CAP-12.03-A06` | `unversioned-docs@2026-07-25` / OTel | Advanced config 描述 OTel log export 默认关闭、通过 `[otel]` opt in；可选 OTLP HTTP/gRPC exporter，prompt 内容默认不导出，并列出 run/API/SSE/WebSocket/tool 事件与 metrics。 | `EVD-codex-DOC-027` | `Confirmed` as current config contract; opt-in | 未启动 exporter；事件完整性、trace parentage、flush/retry、采样和实际 redaction 未验证。 |
| `FACT-codex-059` | `CAP-12.11-A01`, `CAP-01.09-A02` | `0.145.0` / CLI feature flags | `features` 公开 list/enable/disable，用于查看 feature stage、在 config 中持久启用或禁用；顶层 `--enable`/`--disable` 可做等价单次配置覆盖。 | `EVD-codex-HELP-001`, `EVD-codex-HELP-005` | `Confirmed` for feature-control surface; stable/latest CLI | 未读取实际 feature 列表或修改配置；scope、默认值、重启生效和 managed restriction 未验证。 |
| `FACT-codex-060` | `CAP-12.05-A01`, `CAP-12.08-A02`, `CAP-10.04-A03` | `unversioned-docs@2026-07-25` / app-server | 官方 app-server 文档公开 version-matched schema generation、`readyz`/`healthz`、WebSocket auth，以及有界 ingress 在过载时返回 JSON-RPC `-32001`；stdio JSONL 是 stable/default，WebSocket 标为 experimental。 | `EVD-codex-DOC-024` | `Confirmed` as current protocol contract; mixed stable/experimental transports | 未启动服务或制造 slow consumer/overload；健康状态、schema 兼容和 backpressure 未复现。 |

## 4. Product Alias Records

| Alias ID | Atomic Capability | 版本 / channel | Surface | Product alias | Kind | Epistemic | Evidence | 限制 | Last checked |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `ALIAS-codex-001` | `CAP-02.01-A01` | `0.145.0` / latest | cli | `codex` | command | `Confirmed` | `EVD-codex-HELP-001` | 仅入口 | `2026-07-25T14:36:57Z` |
| `ALIAS-codex-002` | `CAP-10.01-A01` | `0.145.0` / latest | cli | `codex exec` | command | `Confirmed` | `EVD-codex-HELP-002` | 未执行模型任务 | `2026-07-25T14:36:57Z` |
| `ALIAS-codex-003` | `CAP-09.03-A01` | `0.145.0` / latest | cli | `codex review` | command | `Confirmed` | `EVD-codex-HELP-002` | 未运行 review | `2026-07-25T14:36:57Z` |
| `ALIAS-codex-004` | `CAP-02.03-A01` | `0.145.0` / latest | cli | `--image` | other | `Confirmed` | `EVD-codex-HELP-001` | 未提交图片 | `2026-07-25T14:36:57Z` |
| `ALIAS-codex-005` | `CAP-05.10-A02` | `0.145.0` / latest | cli | `--search` | other | `Confirmed` | `EVD-codex-HELP-001` | 未访问网络 | `2026-07-25T14:36:57Z` |
| `ALIAS-codex-006` | `CAP-04.01-A01` | `unversioned-docs@2026-07-25` / latest | cli | `AGENTS.md` | doc-term | `Confirmed` | `EVD-codex-DOC-009` | runtime 未验证；这里只记录 CLI alias，IDE/desktop 另待建立版本化记录 | `2026-07-25T14:36:57Z` |
| `ALIAS-codex-007` | `CAP-04.10-A01` | `0.145.0` / latest | cli | `codex resume` | command | `Confirmed` | `EVD-codex-HELP-002` | 未创建 session | `2026-07-25T14:36:57Z` |
| `ALIAS-codex-008` | `CAP-04.10-A03` | `0.145.0` / latest | cli | `codex fork` | command | `Confirmed` | `EVD-codex-HELP-002` | fork 语义未验证 | `2026-07-25T14:36:57Z` |
| `ALIAS-codex-009` | `CAP-07.04-A06` | `0.145.0` / latest | cli | `codex mcp` | command | `Confirmed` | `EVD-codex-HELP-003` | 未连接 server | `2026-07-25T14:36:57Z` |
| `ALIAS-codex-010` | `CAP-07.05-A01` | `0.145.0` / latest | cli | `codex plugin` | command | `Confirmed` | `EVD-codex-HELP-003` | 未安装 plugin | `2026-07-25T14:36:57Z` |
| `ALIAS-codex-011` | `CAP-07.05-A08` | `0.145.0` / latest | cli | `plugin marketplace` | other | `Confirmed` | `EVD-codex-HELP-003` | 未查询 marketplace | `2026-07-25T14:36:57Z` |
| `ALIAS-codex-012` | `CAP-10.07-A01` | `0.145.0` / latest | sdk-daemon | `codex app-server` | command | `Confirmed` | `EVD-codex-HELP-004` | experimental | `2026-07-25T14:36:57Z` |
| `ALIAS-codex-013` | `CAP-10.07-A01` | `0.145.0` / latest | sdk-daemon | `codex mcp-server` | command | `Confirmed` | `EVD-codex-HELP-003` | 未启动 | `2026-07-25T14:36:57Z` |
| `ALIAS-codex-014` | `CAP-10.12-A01` | `0.145.0` / latest | web-cloud | `codex cloud` | command | `Confirmed` | `EVD-codex-HELP-004` | experimental；未登录 | `2026-07-25T14:36:57Z` |
| `ALIAS-codex-015` | `CAP-10.08-A03` | `0.145.0` / latest | sdk-daemon | `codex remote-control` | command | `Confirmed` | `EVD-codex-HELP-004` | experimental；未启动 | `2026-07-25T14:36:57Z` |
| `ALIAS-codex-016` | `CAP-03.02-A03` | `unversioned-docs@2026-07-25` / latest | desktop | `/plan` | ui-label | `Confirmed` | `EVD-codex-DOC-006` | build 未固定；这里只记录 desktop alias | `2026-07-25T14:36:57Z` |
| `ALIAS-codex-017` | `CAP-03.04-A03` | `unversioned-docs@2026-07-25` / latest | desktop | `/goal` | ui-label | `Confirmed` | `EVD-codex-DOC-006`, `EVD-codex-DOC-007` | build 未固定；这里只记录 desktop alias | `2026-07-25T14:36:57Z` |
| `ALIAS-codex-018` | `CAP-04.07-A02` | `unversioned-docs@2026-07-25` / latest | desktop | `/compact` | ui-label | `Confirmed` | `EVD-codex-DOC-006` | runtime 未验证 | `2026-07-25T14:36:57Z` |
| `ALIAS-codex-019` | `CAP-04.12-A04` | `unversioned-docs@2026-07-25` / latest | cli | `/memories` | ui-label | `Confirmed` | `EVD-codex-DOC-008` | default-off；runtime 未验证；这里只记录 CLI alias | `2026-07-25T14:36:57Z` |
| `ALIAS-codex-020` | `CAP-08.02-A01` | `unversioned-docs@2026-07-25` / latest | cli | `subagent` | doc-term | `Confirmed` | `EVD-codex-DOC-018` | build 未固定；这里只记录 CLI alias | `2026-07-25T14:36:57Z` |
| `ALIAS-codex-021` | `CAP-08.07-A04` | `unversioned-docs@2026-07-25` / latest | cli | `/agent` | ui-label | `Confirmed` | `EVD-codex-DOC-018` | runtime 未验证 | `2026-07-25T14:36:57Z` |
| `ALIAS-codex-022` | `CAP-08.08-A01` | `unversioned-docs@2026-07-25` / latest | desktop | `Worktree` | ui-label | `Confirmed` | `EVD-codex-DOC-019` | desktop-only in docs | `2026-07-25T14:36:57Z` |
| `ALIAS-codex-023` | `CAP-10.10-A01` | `unversioned-docs@2026-07-25` / latest | desktop | `Scheduled` | ui-label | `Confirmed` | `EVD-codex-DOC-026` | build 未固定；这里只记录 desktop alias | `2026-07-25T14:36:57Z` |
| `ALIAS-codex-024` | `CAP-12.05-A02` | `0.145.0` / latest | cli | `codex doctor` | command | `Confirmed` | `EVD-codex-HELP-005` | 未运行完整诊断 | `2026-07-25T14:36:57Z` |
| `ALIAS-codex-025` | `CAP-12.11-A01` | `0.145.0` / latest | cli | `codex features` | command | `Confirmed` | `EVD-codex-HELP-005` | 未读或修改开关 | `2026-07-25T14:36:57Z` |
| `ALIAS-codex-026` | `CAP-11.04-A01` | `unversioned-docs@2026-07-25` / latest | cli | `model_reasoning_effort` | config-key | `Confirmed` | `EVD-codex-DOC-027` | 请求未验证 | `2026-07-25T14:36:57Z` |

## 5. 采集结果与阶段 1C 输入

- Candidate facts：`60`
- Product Alias Records：`26`
- 已出现事实的一级域：`12 / 12`
- Evidence Records：`34`，见 [Codex Evidence Ledger](../evidence/codex.md)
- 未创建 `support_state`、Comparison、Gap 或 roadmap 项。

阶段 1C 应优先用隔离临时仓库和无真实外部写入的环境验证：

1. `exec` 的 stdin、JSONL、schema、stderr/stdout 和退出码契约。
2. sandbox/approval/rule 的允许、拒绝、路径与网络边界。
3. session resume/fork/ephemeral 和 `/compact` 的持久与上下文语义。
4. MCP/plugin/skill/hook 的加载、权限、失败和清理。
5. subagent 并发、结果聚合、steering、取消、失败传播与 worktree 隔离。
6. app-server/MCP server 的协议、健康、事件顺序、重连和 backpressure。
7. 认证后 cloud/GitHub/CI 写操作的 revision、幂等和清理边界。

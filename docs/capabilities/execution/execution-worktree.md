# 并行 Worktree

[返回任务执行与 Git 详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=execution-worktree)

> 核对日期：2026-10-06

## 定义

为并行或高风险任务创建独立 Git checkout，使文件修改、分支和会话状态不直接污染主工作区。

## 执行结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `--worktree` · `EnterWorktree` · Agent 隔离 · 主检出写入阻断 | 官方确认 |
| Codex | `--worktree` · `/worktree` 托管检出（rust-v0.154.0 实验性、0.156.0 起默认开启） | 官方确认 |
| Qwen Code | `--worktree` · `enter_worktree` · Agent 隔离 | 源码确认 |
| Kimi Code | 官方文档无入口；条件：`/tower` worker 独占 `.tower/worktrees/`（实验标志默认关闭） | 源码确认 |
| Qoder CLI | `--worktree [name]` 在仓库内 `.qoder/worktrees/<name>` 隔离执行、同名复用、结果可并回主分支 · Agent `isolation: worktree` · `batch` Skill | 官方确认 |

## 比较边界

### 本页包含

- 会话级、任务级和 Subagent 级 Worktree
- 基础分支、目录、复制或复用依赖
- 退出、保留、清理和未合并改动保护

### 本页不包含

- 仅进程或容器沙箱
- 普通 Git branch 但共享同一工作目录
- 云端 VM 的仓库 checkout

## 跨产品事实

1. Claude Code、Codex、Qwen Code 和 Qoder CLI 都有 CLI Worktree 入口。Codex 的 CLI 托管 Worktree 自 rust-v0.154.0 引入、rust-v0.156.0 起默认开启，此前只能记录到 ChatGPT 桌面 App；Kimi Code 2.1.1 的官方文档没有任何 Worktree 入口。
2. 起点与分支不同：Claude 默认 `worktree.baseRef` 为 `"fresh"`，从远端默认分支（通常 `origin/HEAD`）创建并建 `worktree-<name>` 分支；Codex 默认解析 `HEAD^{commit}`，用 `git worktree add --detach` 得到 detached HEAD 且不建分支；Qwen 从当前本地分支创建 `worktree-<slug>` 分支。
3. 清理责任不同：Claude 用 `cleanupPeriodDays` 周期清扫并按 marker、未推送提交与 submodule 状态保留；Codex CLI 把自动清理硬编码为关闭（`desktop.worktree-auto-cleanup-enabled` 与 `desktop.worktree-keep-count` 默认 15 只服务 Desktop），删除靠 `/worktree` 浏览器逐项确认；Qwen 只清扫 `agent-<7hex>` 形状的临时 Worktree，`enter_worktree` 命名的其他 Worktree 永不清扫；Qoder 在交互式退出时按未提交文件与新提交决定自动删除或提示保留，Subagent worktree 干净即删、有改动保留。
4. 隔离强度不同：Claude 在 Worktree 会话内用四项检查阻断指向主检出的编辑与命令，并覆盖该会话派生的每个 Subagent；Kimi 只在 `/tower` 模式下按 worker 身份拒绝写自己 worktree 之外的路径；Qwen 记录的是删除时的会话归属拒绝。Codex 与 Qoder 的一手资料未记录等价的越界写入拦截。
5. Qoder CLI 的 `--worktree` 把命名 Worktree 放在仓库内 `.qoder/worktrees/<sanitized-name>`、建临时分支 `worktree-<processed-name>` 且同名直接复用；并回主分支是手工提交或合并（`Once completed, they can be committed or merged separately.`），官方未描述自动合并命令、主分支解析与冲突解决。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `--worktree` · `EnterWorktree` · Agent 隔离 · 主检出写入阻断 |
| 入口与工具 | `claude --worktree\|-w [name\|#PR\|URL]`（省略名字时自动生成，如 `bright-running-fox`；`#` 需加引号）；会话内用 `EnterWorktree`/`ExitWorktree`，`EnterWorktree` 带目标路径可在 `.claude/worktrees/` 下直接切换；Agent frontmatter 写 `isolation: worktree`；`--resume`/`--continue` 回到 Worktree 会话。 |
| 核心机制 | `.claude/worktrees/<name>/`（PR/MR 用 `.claude/worktrees/pr-<number>`）、`worktree-<name>` 分支、写入 Git 元数据的创建 marker、`.worktreeinclude`（gitignore 语法，只复制既匹配模式又被 ignore 的文件，跟踪文件从不复制）与 WorktreeCreate/Remove Hooks。 |
| 执行行为 | 新会话、当前会话和 Subagent 都可隔离；无改动临时 Worktree 自动清理，有改动时提示保留或删除。隔离期间四项检查阻断指向主检出的操作：`Edit`/`Write`/`NotebookEdit` 目标在主检出、Bash/PowerShell/Monitor 的工作目录解析到主检出或无法核实、把 git 重定向进主检出（`git -C`、`--git-dir`、`GIT_DIR`/`GIT_WORK_TREE`、先 `cd` 再跑 git）、以及无法从命令文本核实 git 停留位置的命令形状（该检查不能关闭）；同样覆盖隔离会话派生的每个 Subagent，PowerShell 只做工作目录检查，每次拒绝以工具错误返回并写明 Worktree 与后续做法。 |
| 运行范围 | `worktree.baseRef` 默认 `"fresh"`：从远端默认分支创建，仓库 24 小时内未 fetch 时拉取默认分支（上限 5 秒），无远端或 fetch 失败回退本地 `HEAD`；设为 `"head"` 则从当前本地 HEAD 创建；不能设为具体分支名。Subagent Worktree 用同一 base 规则；PR/MR 从 `origin` 的 `pull/<number>/head` 或 `merge-requests/<number>/head` 取 head commit。 |
| 后台与并发 | `/batch` 把 5–30 个单元交给后台 Agent，每个单元用独立 Worktree 并可打开 PR；配 `WorktreeCreate` Hook 可在非 Git 仓库运行 `/batch`（v2.1.281 起），各 Subagent 改用项目自己的版本控制命令发布改动、开不出 PR 时报告已发布内容。转后台的 `--worktree` 会话其 Worktree 变成可被清扫的后台会话 Worktree，Agent 运行期间持有 `git worktree lock`。 |
| Git 与平台联动 | PR/MR 引用可直接成为基础；`.worktreeinclude` 复制被 Git ignore 的本地文件，使用 `WorktreeCreate` Hook 时不处理该文件（Hook 完全替换默认 git 逻辑，也能把 Worktree 放到 `.claude/worktrees/` 之外，用于 SVN、Perforce、Mercurial）；创建时跳过仓库自己的 filter driver（v2.1.247 起，理由是 filter driver 是 shell 命令）；主检出 `.claude/skills` 的未跟踪内容读通到 Worktree（skills 需 v2.1.277 起，`.claude/agents` 与 `.claude/commands` 同样读通）。 |
| 状态与产物 | 独立目录、分支、commit 和可选 PR。交互式未命名且干净的 Worktree 连同分支自动删除，命名干净的与仍有工作的都提示用户；`-p` 不提示也不清理，并把创建时加上的 `git worktree lock` 留给后续会话的 stale-lock 清扫释放；Subagent Worktree 无改动自动删除、有改动保留到周期清扫。清扫按 `cleanupPeriodDays` 只处理带 marker 的 Subagent 与后台会话 Worktree，仍有改动或未推送提交、submodule 有改动或无法检查（v2.1.274 起）、命中四种 filter driver 情况、属于未转后台的 `--worktree` 会话、由用户 `git worktree add` 手工创建或缺少 marker 时保留；stream-json 结果用 `startup_failure_reason` 区分 `worktree_unverified` 与 `worktree_resume_refused`（v2.1.274 起）。 |
| 条件与边界 | 需要 Git 仓库（除非用 `WorktreeCreate` Hook 接管）；交互式运行要求已接受 workspace trust，否则 `--worktree` 报错退出，`-p` 跳过该检查；`.claude`、`.claude/worktrees` 或目标 Worktree 目录是符号链接时拒绝创建并点名该路径；建议把 `.claude/worktrees/` 加进 `.gitignore`。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code worktrees](https://code.claude.com/docs/en/worktrees)、[Claude Code tools reference](https://code.claude.com/docs/en/tools-reference)、[Claude Code Commands](https://code.claude.com/docs/en/commands) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `--worktree` · `/worktree` 托管检出（rust-v0.154.0 实验性、0.156.0 起默认开启） |
| 入口与工具 | `codex --worktree`（help 文本 `Run the session in a new managed Git worktree.`，根级与子命令级都接受，合并规则 `*worktree \|= *root_worktree`）；被接受的形式为 `codex --worktree`、`codex --worktree <prompt>`、`codex --worktree exec <prompt>`、`codex exec --worktree <prompt>`、`codex fork --worktree <SESSION_ID>`、`codex exec fork --worktree <SESSION_ID>`；TUI 用 `/worktree`（说明文字 `start or continue a conversation in a new worktree`）；`/new` 与 `/fork` 在功能可用时改问 `Where should the new conversation run?`／`Where should the forked conversation run?`，选项为 `Current checkout` 与 `New worktree`（`Create an isolated managed checkout`）。 |
| 核心机制 | 托管根默认 `$CODEX_HOME/worktrees`，检出落在 `<root>/<4 位十六进制桶>/<仓库名>`；`desktop.git-worktree-root` 可覆盖但必须是绝对路径字符串，否则报 `desktop.git-worktree-root must be an absolute path`，空串回退默认；创建用 `git worktree add --detach --no-checkout <root> <sha>`，随后只写目标检出的 `core.worktree`（经 `git rev-parse --path-format=absolute --git-path config.worktree`）并执行 `git --work-tree=. reset --hard --no-recurse-submodules <sha>`，不改源仓库共享配置、不为其开启 worktreeConfig；线程归属记录写在检出 Git 元数据下的 `codex-thread.json`（`version: 1` + `ownerThreadId`）；macOS 在托管根写 `.metadata_never_index` 关闭 Spotlight 索引。 |
| 执行行为 | base 省略时解析 `HEAD^{commit}`，检出为 detached HEAD 且不创建分支；cwd 保留原目录相对仓库根的子路径，子路径不安全时报 `requested base does not contain a safe working directory <path>`；创建中途失败回滚 `git worktree remove --force`，交接阶段失败则保留检出并提示 `A checkout was retained at <path>; remove it with git worktree remove <checkout-path> from the source repository if it is no longer needed.`；`/worktree` 选择器三项为 `Continue current conversation`（`Preserve this conversation in the new checkout`）、`Start new conversation`（`Open a fresh conversation in the new checkout`）、`Browse worktrees`（`Resume an owner thread or copy a working directory`）；浏览器标题 `Managed worktrees`，单项动作 `Resume owner thread`／`Copy working directory`／`Delete worktree`，删除确认写明 `Keeps thread history; may disrupt other sessions`，列表状态标签有 `Archived`、`Owner thread unavailable`、`No attached thread`。 |
| 运行范围 | 限本地会话：远程工作区或远程环境下 `/worktree` 报 `Managed worktrees are only supported for local sessions.`，命令补全也不列出该命令；不在 Git 仓库内报 `Managed worktrees require a local Git repository.`；显式不受信任的来源报 `Cannot create a worktree from an explicitly untrusted source.`，新检出未受信时报 `The new worktree is not trusted; run Codex there.`；Surface 为 CLI 交互 TUI 与 `codex exec`，沿用 Codex Desktop 的分配根与检出契约（`WorktreeManager` 注释 `Creates and identifies worktrees using the existing Codex Desktop contract.`，`WorktreeSettings::for_cli` 注释 `Shares Desktop's allocation root while leaving CLI cleanup disabled.`）。 |
| 后台与并发 | rust-v0.155.0 起 agents 总览显示 Worktree 归属并支持确认后删除干净的托管 Worktree，rust-v0.156.0 起可从 agent command center 直接创建 Worktree 会话；`/worktree` 的 `available_during_task()` 返回 false，任务运行中不可用；创建要求主会话空闲且无排队输入（`Creating a worktree requires an idle primary session without queued input.`），MCP 清单仍在加载、另一个 agent 正在运行、对话历史未保存或存在后台终端时先被拦下，同一时间只允许一次创建（`A worktree is already being created.`）。 |
| Git 与平台联动 | 不支持的组合逐字报错：`--worktree` 只支持新交互会话、`codex fork`、`codex exec` 与 `codex exec fork`，`login`、`resume`、`archive`、`delete`、`queue` 都被拒；`codex fork --worktree` 与 `codex fork --worktree --last` 报 `codex fork --worktree requires an explicit session ID`；`codex exec resume --worktree` 报 `--worktree cannot resume an existing session; use codex exec fork --worktree`；`codex exec review --worktree` 报 `--worktree is not supported for code review`。归属绑定是原子写入：同一线程重复绑定无副作用，已被其他线程绑定时报 `worktree already belongs to thread <id>`。 |
| 状态与产物 | 独立检出目录、detached HEAD、`codex-thread.json` 归属记录与被绑定的线程历史。CLI 侧不做自动清理（`for_cli` 把 `auto_cleanup_enabled` 硬编码为 false），`desktop.worktree-auto-cleanup-enabled` 默认 true 与 `desktop.worktree-keep-count` 默认 15 只对 Desktop 生效；手动删除有两道守卫：当前目录在该检出内报 `switch to another checkout before deleting the current worktree`，检出内有被 ignore 的本地文件报 `worktree contains ignored local files; remove them before deleting it`，通过后执行 `git worktree remove` 并删掉空桶目录。 |
| 条件与边界 | 功能开关 key 为 `worktrees`：rust-v0.154.0（2026-09-09）是 `Stage::Experimental`、`default_enabled: false`，需从 `/experimental` 打开并重启（announcement 逐字为 `NEW: Worktrees can now be enabled from /experimental. Restart Codex after enabling it.`）；rust-v0.156.0（2026-09-22）改为 `Stage::Stable`、`default_enabled: true`，`Stage::Stable` 的注释是 `The feature flag is kept for ad-hoc enabling/disabling`，`[features]` 表接受布尔项，`worktrees = false` 走 `Features::disable`；关闭时 `/worktree` 报 `Enable worktrees in your Codex configuration to create a worktree.`。官方 Worktrees 文档页核对时仍只描述桌面 App，未记录 CLI 入口，CLI 结论来自官方 Release 与 rust-v0.159.2（提交 `ff6aec96`）源码；平台条件发布说明未给出，未确认。 |
| 证据状态 | 官方确认 |
| 来源 | [Codex worktrees](https://learn.chatgpt.com/docs/environments/git-worktrees)、[Codex rust-v0.154.0 发布说明（实验性托管 Worktree）](https://github.com/openai/codex/releases/tag/rust-v0.154.0)、[Codex rust-v0.156.0 发布说明（Worktree 默认开启）](https://github.com/openai/codex/releases/tag/rust-v0.156.0)、[Codex rust-v0.154.0 功能登记册（worktrees 实验性默认关闭）](https://github.com/openai/codex/blob/6b9826e3aa83b1a5947db50f4332cb9c65f1b340/codex-rs/features/src/lib.rs)、[Codex rust-v0.156.0 功能登记册（worktrees 转 Stable 默认开启）](https://github.com/openai/codex/blob/fe74a774532af67b5a4a3dec03ce9469e17f89af/codex-rs/features/src/lib.rs)、[Codex `--worktree` 共享参数源码](https://github.com/openai/codex/blob/ff6aec96948b70d94983af2641a6b67c94faeff5/codex-rs/utils/cli/src/shared_options.rs)、[Codex `--worktree` 不支持组合的报错快照](https://github.com/openai/codex/blob/ff6aec96948b70d94983af2641a6b67c94faeff5/codex-rs/cli/src/snapshots/codex__tests__unsupported_worktree_commands.snap)、[Codex WorktreeManager 创建与列举源码](https://github.com/openai/codex/blob/ff6aec96948b70d94983af2641a6b67c94faeff5/codex-rs/worktree/src/lib.rs)、[Codex 托管 Worktree 设置解析源码](https://github.com/openai/codex/blob/ff6aec96948b70d94983af2641a6b67c94faeff5/codex-rs/worktree/src/settings.rs)、[Codex Worktree 线程归属记录源码](https://github.com/openai/codex/blob/ff6aec96948b70d94983af2641a6b67c94faeff5/codex-rs/worktree/src/metadata.rs)、[Codex TUI 托管 Worktree 创建与交接源码](https://github.com/openai/codex/blob/ff6aec96948b70d94983af2641a6b67c94faeff5/codex-rs/tui/src/app/managed_worktree_creation.rs)、[Codex `/worktree` 选择器与可用性判定源码](https://github.com/openai/codex/blob/ff6aec96948b70d94983af2641a6b67c94faeff5/codex-rs/tui/src/chatwidget/worktree_picker.rs)、[Codex TUI Slash 命令定义源码](https://github.com/openai/codex/blob/ff6aec96948b70d94983af2641a6b67c94faeff5/codex-rs/tui/src/slash_command.rs) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `--worktree` · `enter_worktree` · Agent 隔离 |
| 入口与工具 | `qwen --worktree[=name\|#PR\|URL]`；会话内 `enter_worktree`/`exit_worktree`；Agent 可传 `isolation: "worktree"`。 |
| 核心机制 | `.qwen/worktrees/<slug>`、`worktree-<slug>` 分支、session sidecar 和 `worktree.symlinkDirectories`。 |
| 执行行为 | 启动前、会话中和 Agent 三条路径共用管理器；无差异 Agent Worktree 清理，有差异保留路径和分支。 |
| 运行范围 | 普通 Worktree 从当前本地分支创建；PR reference 从 fetch 的 PR tip 创建；Fork Agent 不支持 Worktree 隔离。 |
| 后台与并发 | 隔离 Agent 沿默认后台行为运行，清理在 Agent 报告完成时执行，`run_in_background: false` 取内联结果；caller-owned `working_dir` 启动未命名时前台运行、显式后台执行被拒绝，Subagent 定义里的 `background: true` 在顶层被拒绝、嵌套时降级为前台运行；Arena 使用另一套 Worktree 目录。 |
| Git 与平台联动 | 可复用 node_modules 等目录的 symlink；恢复会话用 `<sessionId>.worktree.json` 恢复绑定。Worktree 是独立的会话存储“项目”：`--worktree foo` 启动的会话只出现在该 Worktree 的恢复列表里，不带 `--worktree` 的会话存在主检出下。 |
| 状态与产物 | Worktree、分支、sidecar、状态栏标识和可保留的 Agent Diff。 |
| 条件与边界 | ACP 不接受 `--worktree`，应把 Worktree path 作为 cwd；退出删除受 ownership、dirty 和未合并 commit 三重保护，其他会话删除会被拒并指向 `git worktree remove`。v0.24.7 文档把过期清扫守卫写细：只有 `agent-<7hex>` 形状才是清扫候选（用户恰好取该名字的 Worktree 也会被扫），`enter_worktree` 命名的其他 Worktree 永不清扫；未提交内容按 `git status --porcelain --untracked-files=normal --ignored=matching` 判定，被 ignore 的内容（如 `.env`）同样保留检出，例外只有可丢弃构建产物（被 ignore 条目的首个路径段为 `node_modules`、`dist` 或 `coverage`）、符号链接和 daemon 的 `.qwen-session` 标记（未被跟踪时）；30 天阈值在阈值后的下次 CLI 启动执行，`--debug` 下可 grep `cleanupStaleAgentWorktrees: keeping` 与 `worktreeHasWork: waiving` 查看判定原因。 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code current worktree](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/worktree.md)、[Qwen Code v0.24.7 Worktree 文档（清扫守卫与 `working_dir` 后台规则）](https://github.com/QwenLM/qwen-code/blob/b12edec1401a28fc53cd9e714d5928b285071fc8/docs/users/features/worktree.md)、[Qwen Code current code review](https://github.com/QwenLM/qwen-code/blob/7dfc554dffcf52930ac35d4ea9c2558dfe36c22c/docs/users/features/code-review.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 官方文档无入口；条件：`/tower` worker 独占 `.tower/worktrees/`（实验标志默认关闭） |
| 入口与工具 | 2.1.1（提交 `f67e639`）的斜杠命令、Agents、工具与会话文档没有任何创建、切换或清理 Worktree 的入口，Agent 定义也没有 `isolation` 字段；可先 `git worktree add`，再从该目录启动 `kimi`。条件入口：`/tower` 模式下每个 worker 独占 `.tower/worktrees/` 下的一个 git worktree（路径常量 `WORKTREES_DIR`），但 `tower` 是默认关闭的实验标志，官方斜杠命令文档未列出 `/tower`。 |
| 核心机制 | 标准 Git Worktree 与当前工作目录；tower 模式另有 `.tower/` 工作区（`comms/state.json` 与 `comms/` 下的 inbox、findings、reviews、missions、log）和按身份的写隔离，内部能识别 `.git` 文件形式但那不是用户可调用的管理能力。 |
| 执行行为 | 从已有 Worktree 启动时，文件与 Bash 自然作用于该 checkout，产品不负责创建分支或清理；tower worker 只能写自己的 worktree，越界写入被拒并返回 `tower workers may only write inside their own worktree (<path>) — denied: …`，该判定按 worker 身份（`tower-worker` profile）而不是功能开关状态。 |
| 运行范围 | 用户选定的启动目录；Subagent 默认共享被分配的工作目录。tower 模式下一个 worker 一个 mission 一个 worktree，`AgentSwarm` 与 tower 模式互斥（同时使用会返回 `AgentSwarm is not available while tower mode is active`）。 |
| 后台与并发 | 后台 Agent 可以并行，但官方 Agent 文档没有每 Agent Worktree 隔离字段；tower 的并行派生由 `TowerSpawn` 承担。 |
| Git 与平台联动 | 可用自定义 Skill/Plugin 封装 `git worktree`，仍属于用户扩展；tower 的分支合并由 `TowerMerge` 门禁把关。 |
| 状态与产物 | 由 Git 手工创建的 Worktree 和分支（Kimi 只产生其中的文件修改），或 tower 的 `.tower/worktrees/` 检出、`.tower/comms/` 记录与合并后保留的分支。 |
| 条件与边界 | tower 结论来自 2.1.1 源码 `packages/agent-core-v2/src/features/tower/`，仅 v2 引擎、需 `tower` 实验标志开启（默认关闭）；官方文档没有描述这些目录，面向用户的 Worktree 管理入口未确认。 |
| 证据状态 | 源码确认 |
| 来源 | [Kimi Code 2.1.1 斜杠命令文档（无 Worktree 入口）](https://github.com/MoonshotAI/kimi-code/blob/f67e6398fb3210ad8ace970e2dfd5bcc984ed61f/docs/zh/reference/slash-commands.md)、[Kimi Code 2.1.1 Agents 文档（无 Worktree 隔离字段）](https://github.com/MoonshotAI/kimi-code/blob/f67e6398fb3210ad8ace970e2dfd5bcc984ed61f/docs/zh/customization/agents.md)、[Kimi Code 2.1.1 tower 目录常量源码（`.tower/worktrees`）](https://github.com/MoonshotAI/kimi-code/blob/f67e6398fb3210ad8ace970e2dfd5bcc984ed61f/packages/agent-core-v2/src/features/tower/protocol/paths.ts)、[Kimi Code 2.1.1 tower worker Worktree 写隔离源码](https://github.com/MoonshotAI/kimi-code/blob/f67e6398fb3210ad8ace970e2dfd5bcc984ed61f/packages/agent-core-v2/src/features/tower/towerService.ts) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `--worktree [name]` 在仓库内 `.qoder/worktrees/<name>` 隔离执行、同名复用、结果可并回主分支 · Agent `isolation: worktree` · `batch` Skill |
| 入口与工具 | `qoder --worktree [name]`（CLI 参考逐字：`Execute in isolation within a new Git Worktree, merging results back to the main branch; the name is optional and auto-generated if omitted.`，示例 `qoder --worktree feature-a`、`qoder --worktree feature-a "Implement login fix"`、`qoder --worktree`）；Parallel Tasks 页补充 `When no name is provided, Qoder automatically generates a worktree name.` 与 `If a worktree with the same name already exists, it is reused directly instead of being recreated.`；Subagent frontmatter `isolation: worktree`（`worktree runs the Subagent in a separate git worktree. Omitted means the default workspace.`）；内置 Skill `batch`（`Spawns parallel working agents in isolated git worktrees to apply bulk changes across multiple files (requires the current directory to be a Git repository).`）。 |
| 核心机制 | 命名 Worktree 落在 `<repo>/.qoder/worktrees/<sanitized-name>`（Parallel Tasks 页逐字：`New named worktrees are placed under <repo>/.qoder/worktrees/<sanitized-name>, and a corresponding temporary branch is created.`），临时分支按手工清理命令为 `worktree-<processed-name>`（`git branch -d worktree-<processed-name>`）；仓库根 `.worktreeinclude` 声明要复制进干净检出的文件（`To copy files like .env, declare them using .worktreeinclude at the repository root.`），新 Worktree 默认不含未跟踪文件（`A new worktree is a clean checkout and does not include untracked files by default.`）；同名 Worktree 直接复用而不重建。此前引用的 `en/cli/using-cli` 页核对时仍返回 404，`~/.qoder/worktrees/<job-id>` 与 Concurrent Job 布局表述已由 Parallel Tasks 页的仓库内路径取代。 |
| 执行行为 | `--worktree` 让本次运行在新 Worktree 中隔离执行，每个任务各自有工作树与分支、互不覆盖（`each task has its own workspace and context, preventing multiple sessions from sharing the same directory and overwriting each other's changes.`）；会话结束时打印 Worktree 路径与恢复会话的命令，交互式退出时检查未提交文件与新提交——干净的 Worktree 可自动删除、有本地文件或提交的会提示保留还是删除（`clean worktrees can be automatically deleted, while those with local files or commits will prompt you to choose whether to keep or delete them.`）；Subagent `isolation: worktree` 让该 Agent 在单独 worktree 中运行，干净的 Subagent worktree 完成即自动删除、有改动的保留（`Clean Subagent worktrees are automatically deleted upon completion, while those with changes are retained.`）。合并冲突解决流程官方未描述。 |
| 运行范围 | 当前 Git 仓库：命名 Worktree 放在该仓库的 `.qoder/worktrees/` 下（`batch` Skill 明确要求当前目录是 Git 仓库）；插件提供的 Subagent 会移除 `hooks`、`mcpServers` 与 `permissionMode`，`isolation` 只在取值为 `worktree` 时保留。 |
| 后台与并发 | `batch` Skill 并行派发多个 Agent、各自在隔离 worktree 中批量改文件，官方建议一个任务一个 worktree 以避免改动重叠（`One task per worktree`）；`/tasks` 查看正在运行的后台任务；`--worktree` 本身只是单次运行的启动位置，官方未给出数值并发上限。 |
| Git 与平台联动 | CLI 参考写 `merging results back to the main branch`，但 Parallel Tasks 页把并回描述为手工动作——完成后可分别提交或合并（`Once completed, they can be committed or merged separately.`），并在任务完成合并后删除多余 worktree 与临时分支（`Delete unnecessary worktrees and temporary branches after tasks are completed and merged to keep the repository tidy.`）；官方未记录自动合并使用的 Git 命令、主分支解析方式、推送与开 PR 行为。 |
| 状态与产物 | Worktree 目录 `<repo>/.qoder/worktrees/<sanitized-name>`、临时分支 `worktree-<processed-name>`、自动生成的名字与其中改动；手工清理命令为 `git worktree remove <worktree-path>` 与 `git branch -d worktree-<processed-name>`。 |
| 条件与边界 | 现行 CLI 参考的可执行名是 `qoder`，子命令表为 `mcp`、`plugins`（别名 `plugin`）、`skills`（别名 `skill`）、`hooks`（别名 `hook`）、`agents`（别名 `agent`）、`login`、`commit`、`rollback`、`update`、`remote-control`、`status`、`feedback`、`wiki`，不含 `jobs`、`rm`、`worktree` 或 `parallel-tasks`；此前记录的 `qodercli jobs --worktree` 与 `qodercli rm <job-id>` 在现行文档中无对应命令。 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI 命令行参考（`--worktree` 与子命令表）](https://docs.qoder.com/cli/cli-reference)、[Qoder CLI Parallel Tasks（Worktree 目录、临时分支与清理）](https://docs.qoder.com/cli/parallel-tasks)、[Qoder CLI Subagent](https://docs.qoder.com/en/cli/subagent)、[Qoder CLI 内置能力参考（`batch` Skill）](https://docs.qoder.com/cli/builtins-reference) |

## 官方来源

- [Claude Code worktrees](https://code.claude.com/docs/en/worktrees)
- [Claude Code tools reference](https://code.claude.com/docs/en/tools-reference)
- [Claude Code Commands](https://code.claude.com/docs/en/commands)
- [Codex worktrees](https://learn.chatgpt.com/docs/environments/git-worktrees)
- [Codex rust-v0.154.0 发布说明（实验性托管 Worktree）](https://github.com/openai/codex/releases/tag/rust-v0.154.0)
- [Codex rust-v0.156.0 发布说明（Worktree 默认开启）](https://github.com/openai/codex/releases/tag/rust-v0.156.0)
- [Codex rust-v0.154.0 功能登记册（worktrees 实验性默认关闭）](https://github.com/openai/codex/blob/6b9826e3aa83b1a5947db50f4332cb9c65f1b340/codex-rs/features/src/lib.rs)
- [Codex rust-v0.156.0 功能登记册（worktrees 转 Stable 默认开启）](https://github.com/openai/codex/blob/fe74a774532af67b5a4a3dec03ce9469e17f89af/codex-rs/features/src/lib.rs)
- [Codex `--worktree` 共享参数源码](https://github.com/openai/codex/blob/ff6aec96948b70d94983af2641a6b67c94faeff5/codex-rs/utils/cli/src/shared_options.rs)
- [Codex `--worktree` 不支持组合的报错快照](https://github.com/openai/codex/blob/ff6aec96948b70d94983af2641a6b67c94faeff5/codex-rs/cli/src/snapshots/codex__tests__unsupported_worktree_commands.snap)
- [Codex WorktreeManager 创建与列举源码](https://github.com/openai/codex/blob/ff6aec96948b70d94983af2641a6b67c94faeff5/codex-rs/worktree/src/lib.rs)
- [Codex 托管 Worktree 设置解析源码](https://github.com/openai/codex/blob/ff6aec96948b70d94983af2641a6b67c94faeff5/codex-rs/worktree/src/settings.rs)
- [Codex Worktree 线程归属记录源码](https://github.com/openai/codex/blob/ff6aec96948b70d94983af2641a6b67c94faeff5/codex-rs/worktree/src/metadata.rs)
- [Codex TUI 托管 Worktree 创建与交接源码](https://github.com/openai/codex/blob/ff6aec96948b70d94983af2641a6b67c94faeff5/codex-rs/tui/src/app/managed_worktree_creation.rs)
- [Codex `/worktree` 选择器与可用性判定源码](https://github.com/openai/codex/blob/ff6aec96948b70d94983af2641a6b67c94faeff5/codex-rs/tui/src/chatwidget/worktree_picker.rs)
- [Codex TUI Slash 命令定义源码](https://github.com/openai/codex/blob/ff6aec96948b70d94983af2641a6b67c94faeff5/codex-rs/tui/src/slash_command.rs)
- [Qwen Code current worktree](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/worktree.md)
- [Qwen Code v0.24.7 Worktree 文档（清扫守卫与 `working_dir` 后台规则）](https://github.com/QwenLM/qwen-code/blob/b12edec1401a28fc53cd9e714d5928b285071fc8/docs/users/features/worktree.md)
- [Qwen Code current code review](https://github.com/QwenLM/qwen-code/blob/7dfc554dffcf52930ac35d4ea9c2558dfe36c22c/docs/users/features/code-review.md)
- [Kimi Code 2.1.1 斜杠命令文档（无 Worktree 入口）](https://github.com/MoonshotAI/kimi-code/blob/f67e6398fb3210ad8ace970e2dfd5bcc984ed61f/docs/zh/reference/slash-commands.md)
- [Kimi Code 2.1.1 Agents 文档（无 Worktree 隔离字段）](https://github.com/MoonshotAI/kimi-code/blob/f67e6398fb3210ad8ace970e2dfd5bcc984ed61f/docs/zh/customization/agents.md)
- [Kimi Code 2.1.1 tower 目录常量源码（`.tower/worktrees`）](https://github.com/MoonshotAI/kimi-code/blob/f67e6398fb3210ad8ace970e2dfd5bcc984ed61f/packages/agent-core-v2/src/features/tower/protocol/paths.ts)
- [Kimi Code 2.1.1 tower worker Worktree 写隔离源码](https://github.com/MoonshotAI/kimi-code/blob/f67e6398fb3210ad8ace970e2dfd5bcc984ed61f/packages/agent-core-v2/src/features/tower/towerService.ts)
- [Qoder CLI 命令行参考（`--worktree` 与子命令表）](https://docs.qoder.com/cli/cli-reference)
- [Qoder CLI Parallel Tasks（Worktree 目录、临时分支与清理）](https://docs.qoder.com/cli/parallel-tasks)
- [Qoder CLI Subagent](https://docs.qoder.com/en/cli/subagent)
- [Qoder CLI 内置能力参考（`batch` Skill）](https://docs.qoder.com/cli/builtins-reference)

## 关联能力

- [Worktree 隔离](../subagents/agent-worktree.md)
- [Git 操作](./execution-git.md)
- [Pull Request](./execution-pr.md)

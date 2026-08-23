# Slash 命令矩阵

[返回文档目录](./README.md) · [网页矩阵](https://qqqys.github.io/code-agent/#commands)

> `—` 表示当前官方 Slash 命令目录没有列出对应命令，不表示底层能力不存在。命令可能受版本、平台或功能开关影响。

[打开 29 个 Slash 命令独立详情](./capabilities/commands/)

这里的 29 指归一化后的对比能力，不是任何一家产品的命令总数。原生命令、别名、随产品提供的 Skill 命令和动态加载命令在下方分别列出。

## 对照表

| 功能 | Claude Code | Codex | Qwen Code | Kimi Code | Qoder CLI |
| --- | --- | --- | --- | --- | --- |
| 登录 | `/login` | — | `/auth`、`/connect`、`/login` | `/login` | `/login` |
| 退出登录 | `/logout` | `/logout` | `/auth logout` | `/logout` | `/logout` |
| 选择模型 | `/model` | `/model` | `/model` | `/model`、`/secondary-model`（别名 `/subagent-model`） | `/model` |
| 推理强度 | `/effort` | `/model`、`/fast` | `/effort` | — | `/effort`、`/fast` |
| 权限设置 | `/permissions`、`/allowed-tools` | `/permissions` | `/approval-mode`、`/permissions` | `/permission`、`/yolo`、`/auto` | `/config` |
| 计划模式 | `/plan` | `/plan` | `/plan` | `/plan`、`/plan clear` | `/plan` |
| 目标 | `/goal` | `/goal` | `/goal` | `/goal`（条件：0.37.0 起单条目标不超过 4000 字符） | `/goal [description] [--turns <N>]`、`/goal status|pause|resume|take|clear` |
| Subagent 管理 | `/agents`、`/subtask` | `/agent`、`/subagents` | `/agents manage`、`/agents create` | `/swarm`；Agent 通过配置与工具调用 | `/agents`、`/agents reload` |
| 任务列表 | `/tasks` | `/ps` | `/tasks`；Background Tasks `p` 或 `/workflows p <runId>` 协作暂停/恢复后台 Workflow（条件：Workflows 开关、仅后台运行） | `/tasks`、`/task` | `/tasks` |
| 新会话 | `/clear`、`/reset`、`/new` | `/new`、`/clear` | `/clear` | `/new`、`/clear` | `/clear` |
| 恢复会话 | `/resume`、`/continue` | `/resume` | `/resume`、`/continue` | `/sessions`、`/resume` | `/resume` |
| 重命名会话 | `/rename` | `/rename`、`/title` | `/rename`、`/tag` | `/title`、`/rename` | — |
| 分支会话 | `/branch`、`/fork` | `/fork` | `/branch`、`/fork` | `/fork` | — |
| 归档或删除会话 | — | `/archive`、`/delete` | `/delete` | — | — |
| 压缩上下文 | `/compact [instructions]` | `/compact` | `/compress`、`/compress-fast` | `/compact [instruction]` | `/compact` |
| 查看上下文 | `/context [all]` | `/status`、`/usage` | `/context detail` | `/status`、`/usage` | `/context-window`、`/status`、`/usage` |
| 记忆管理 | `/memory` | `/memories` | `/memory`、`/remember`、`/forget`、`/learn` | — | `/memory` |
| 回退或检查点 | `/rewind`、`/checkpoint`、`/undo` | — | `/rewind`、`/restore` | `/undo [count]` | — |
| 查看 Diff | `/diff` | `/diff` | `/diff` | — | — |
| 代码审查 | `/review`、`/code-review`、`/security-review` | `/review` | `/review` | — | `/review` |
| 复制回答 | `/copy` | `/copy` | `/copy` | `/copy` | — |
| 导出会话 | `/export` | `/export`（条件：main 分支，尚未发布） | `/export html`、`/export md`、`/export json`、`/export jsonl` | `/export-md`、`/export`、`/export-debug-zip` | `/export` |
| 添加工作目录 | `/add-dir` | `/mention` | `/directory`、`/dir` | `/add-dir` | — |
| 切换目录 | `/cd` | — | `/cd` | — | — |
| 配置 | `/config`、`/settings` | `/debug-config` | `/config`、`/settings`、`/import-config` | `/settings`、`/config`、`/update-config` | `/config` |
| 状态 | `/status` | `/status` | `/status`、`/about` | `/status`、`/version` | `/status` |
| 用量统计 | `/stats`、`/usage` | `/usage` | `/stats`、`/usage` | `/usage` | `/usage` |
| 诊断 | `/doctor`、`/debug` | `/debug-config` | `/doctor`、`/stuck` | `/export-debug-zip` | `/feedback` |
| 初始化项目指令 | `/init` | `/init` | `/init` | `/init` | `/init` |
| MCP | `/mcp` | `/mcp` | `/mcp` | `/mcp`、`/mcp-config` | `/mcp` |
| Skills | `/skills`、`/reload-skills` | `/skills` | `/skills`、`/<skill-name>` | 内置 Skill 命令与 Skills 目录 | `/skills` |
| Hooks | `/hooks` | `/hooks` | `/hooks` | — | Agent 配置支持 Hooks；无独立 Slash 命令 |
| 插件或扩展 | `/plugin`、`/reload-plugins` | `/plugins`、`/apps` | `/extensions`、`/extension-creator`、`/reload-plugins` | `/plugins` | — |
| 自定义命令 | Skills 可作为命令调用 | Skills 可作为命令调用 | Skills、Markdown/TOML 命令和保存的 Workflow | Skills 可作为命令调用 | `/commands`、`/workflows` |
| 工具列表 | — | — | `/tools` | — | — |
| IDE 或编辑器 | `/ide` | `/ide` | `/ide`、`/editor` | `/editor` | — |
| 主题 | — | `/theme` | `/theme` | `/theme`、`/custom-theme` | — |
| Vim 模式 | — | `/vim` | `/vim` | — | `/vim` |
| 快捷键自定义 | `/keybindings`、`keybindings.json` | `/keymap`、`tui.keymap`、双键 chord | 无自定义入口；仅 `/vim`、`general.vimMode` | 官方文档未列出快捷键自定义 | 无自定义入口；仅 `/vim` |
| 状态栏 | `/statusline` | `/statusline` | `/statusline` | — | — |
| 终端安装 | `/terminal-setup` | — | `/terminal-setup` | — | — |
| GitHub 设置 | `/install-github-app` | 无对应 Slash 命令 | `/setup-github` | — | `/setup-github` |
| 反馈或问题上报 | `/feedback`、`/bug`、`/share` | `/feedback` | `/bug` | `/feedback`、`/bug` | `/feedback` |
| 更新与发行说明 | `/release-notes` | — | `/update` | 内置更新 Skill | `/upgrade`、`/release-notes` |
| 临时旁路问题 | `/btw` | `/side`、`/btw` | `/btw` | `/btw` | — |
| 浏览器或 Web | `/chrome`、`/deep-research` | `/apps` | — | `/web` | — |
| 多模型或多代理协作模式 | `/advisor`、`/batch` | `/agent` | `/advisor`（v0.21.14 起）、`/arena`、`/batch`、`/coordinate`（v0.21.11 起） | `/swarm`、`/tower`（条件：2026-08-21 起重建为与 plan 并列的模式重新开启，实验标志 `KIMI_CODE_EXPERIMENTAL_TOWER` 默认关闭，合入 main 尚未发布） | `/quest`、`/batch` |
| 远程控制 | `/remote-control`、`/rc`、`/teleport`、`/desktop`、`/app` | `/app` | — | `/web` | 条件项：Cloud Mode |
| 退出程序 | `/exit`、`/quit` | `/exit`、`/quit` | `/quit`、`/exit` | `/exit`、`/quit`、`/q` | `/quit`、`/exit` |
| 帮助 | `/help` | 命令选择器 | `/help`、`/?` | `/help`、`/h`、`/?` | `/help` |

## 各产品命令目录

### Claude Code

`/add-dir`、`/advisor`、`/agents`、`/autofix-pr`、`/background`、`/batch`、`/branch`、`/btw`、`/bug`、`/cd`、`/chrome`、`/claude-api`、`/clear`、`/code-review`、`/color`、`/compact`、`/config`、`/context`、`/copy`、`/cost`、`/dataviz`、`/debug`、`/deep-research`、`/design-login`、`/design-sync`、`/desktop`、`/diff`、`/doctor`、`/effort`、`/exit`、`/export`、`/fast`、`/feedback`、`/fewer-permission-prompts`、`/focus`、`/fork`、`/goal`、`/heapdump`、`/help`、`/hooks`、`/ide`、`/init`、`/insights`、`/install-github-app`、`/install-slack-app`、`/keybindings`、`/login`、`/logout`、`/loop`、`/mcp`、`/memory`、`/mobile`、`/model`、`/passes`、`/permissions`、`/plan`、`/plugin`、`/powerup`、`/privacy-settings`、`/radio`、`/recap`、`/release-notes`、`/reload-plugins`、`/reload-skills`、`/remote-control`、`/remote-env`、`/rename`、`/resume`、`/review`、`/rewind`、`/run`、`/run-skill-generator`、`/sandbox`、`/schedule`、`/scroll-speed`、`/security-review`、`/setup-bedrock`、`/setup-vertex`、`/simplify`、`/skills`、`/stats`、`/status`、`/statusline`、`/stickers`、`/stop`、`/subtask`、`/tasks`、`/team-onboarding`、`/teleport`、`/terminal-setup`、`/theme`、`/tui`、`/ultrareview`、`/upgrade`、`/usage`、`/usage-credits`、`/verify`、`/voice`、`/web-setup`、`/workflows`。

v2.1.222（2026-08-04 发布）移除了 ultraplan 功能，官方命令表不再列出 `/ultraplan`（更新日志原文 “Removed ultraplan feature”）。自 v2.1.223（2026-08-06 发布）起，`/review` 是 `/code-review` 的别名，旧的快速 PR Review 行为由 `/code-review` 取代；`/ultrareview` 在账号可用 ultrareview 时是 `/code-review ultra` 的别名。

### Codex

`/agent`、`/apps`、`/approve`、`/archive`、`/clear`、`/compact`、`/copy`、`/debug-config`、`/delete`、`/diff`、`/exit`、`/experimental`、`/export`、`/fast`、`/feedback`、`/fork`、`/goal`、`/hooks`、`/ide`、`/import`、`/init`、`/keymap`、`/logout`、`/mcp`、`/memories`、`/mention`、`/model`、`/new`、`/permissions`、`/personality`、`/pet`、`/pets`、`/plan`、`/plugins`、`/ps`、`/raw`、`/rename`、`/resume`、`/review`、`/sandbox-add-read-dir`、`/setup-default-sandbox`、`/side`、`/skills`、`/status`、`/statusline`、`/stop`、`/theme`、`/title`、`/usage`、`/vim`。

`/export`（会话 Markdown 导出）于 2026-08-07 合入 main 分支（提交 `2801d12661be`，PR #37358），尚未进入 Release，官方命令文档也尚未列出；不带参数时可在复制到剪贴板与保存文件之间选择。

### Qwen Code

Qwen Code 的固定命令面由两套加载器共同组成。只扫描硬编码命令会漏掉 `/review` 等随产品提供的 Skill 命令。

#### 硬编码命令

源码中共有 68 个主命令定义：

`/advisor`、`/agents`、`/approval-mode`、`/arena`、`/auth`、`/branch`、`/btw`、`/bug`、`/cd`、`/clear`、`/compress`、`/compress-fast`、`/config`、`/context`、`/copy`、`/curator`、`/delete`、`/diff`、`/directory`、`/docs`、`/doctor`、`/dream`、`/editor`、`/effort`、`/export`、`/extensions`、`/forget`、`/fork`、`/goal`、`/help`、`/history`、`/hooks`、`/ide`、`/import-config`、`/init`、`/insight`、`/language`、`/learn`、`/lsp`、`/mcp`、`/memory`、`/model`、`/permissions`、`/plan`、`/quit`、`/recap`、`/reload-plugins`、`/remember`、`/rename`、`/restore`、`/resume`、`/rewind`、`/settings`、`/setup-github`、`/skills`、`/stats`、`/status`、`/statusline`、`/summary`、`/tasks`、`/terminal-setup`、`/theme`、`/tools`、`/trust`、`/update`、`/vim`、`/voice`、`/workflows`。

其中 6 个受条件控制：

| 命令 | 出现条件 |
| --- | --- |
| `/workflows` | Workflows 功能开关开启（`QWEN_CODE_ENABLE_WORKFLOWS=1`） |
| `/dream`、`/forget` | Managed Memory 可用 |
| `/trust` | Folder Trust 开启 |
| `/restore` | File Checkpointing 开启 |
| `/lsp` | LSP 开启 |

v0.21.8（2026-08-08 发布）起，`/workflows` 增加 `p <runId>` 形式（提交 `88a325bce9db`）：Background Tasks 对话框的 `p` 键或 `/workflows p <runId>` 协作暂停/恢复后台 Workflow 运行，运行状态在 running、pausing、paused 之间迁移。暂停控制只在交互式 TUI 提供，且只作用于后台运行；暂停期间不启动新 Agent，已在运行的 Agent 收敛后进入 paused，暂停状态只保留在当前进程。

硬编码命令还提供 13 个别名：

`/about`、`/connect`、`/login`、`/reset`、`/new`、`/summarize`、`/dir`、`/?`、`/exit`、`/tag`、`/continue`、`/rollback`、`/usage`。

`/advisor`（会话二次意见审查）于 2026-08-17 合入 main 分支（提交 `18c9763f46ce`，PR #7567），随 v0.21.14（2026-08-19 发布）发布：`/advisor [focus]` 以工具全部移除的只读旁路单轮查询（官方文档：至多最近 40 条消息上下文）请审查模型对当前对话给出二次意见，固定输出 Verdict、Risks、Missing evidence、Recommendation 四节，执行期间阻塞输入直到审查返回；`advisorModel` 设置可指定审查模型（可跨 Provider），未设置时用主模型；命令只在交互式与 ACP 模式可用，内置 `/advisor` 不写入 ACP 会话记录。`/curator`（Auto Skill 维护，提供 status、`run [--dry-run]`、`pin`/`unpin`、`restore` 子命令）由 2026-08-01 提交 `e569734a1e12`（PR #7846）注册为硬编码命令，本目录此前漏记。

#### 随产品提供的 Skill 命令

源码中共有 10 个随产品提供的 Skill（其中 `/coordinate` 于 2026-08-12 合入 main 分支，随 v0.21.11 于 2026-08-13 发布）：

| 命令 | 参数 | 行为 |
| --- | --- | --- |
| `/batch` | `<operation> <file-pattern>` | 发现文件、分块并交给并行执行 Agent |
| `/coordinate` | `<goal>` | Leader 协调最多 3 个强制只读队友与可选 1 名 Worktree 写手；完整团队协作需启用 Agent Team（v0.21.11 起） |
| `/dataviz` | 由请求内容决定 | 提供图表、仪表盘、地图和数据可视化指导 |
| `/extension-creator` | `<extension-path> [template]` | 创建、校验并本地测试 Qwen Code 扩展 |
| `/loop` | `[interval] [prompt] \| list \| clear` | 创建、查看或清理定时与自驱循环；仅 Cron 开启时出现 |
| `/new-app` | 由请求内容决定 | 执行新应用从需求到原型的工作流 |
| `/qc-helper` | `<question>` | 基于 Qwen Code 用户文档回答使用、配置和排障问题 |
| `/review` | `[pr-number\|file-path] [--effort low\|medium\|high] [--comment]` | 审查本地变化、文件或 PR |
| `/simplify` | `[focus]` | 检查近期改动并直接应用明确的清理 |
| `/stuck` | `[PID or symptom]` | 诊断卡住、缓慢或资源异常的 Qwen Code 会话 |

这些命令默认同时允许用户和模型调用，并支持交互式、非交互式和 ACP。bare mode 不加载它们；`skills.disabled` 和 `slashCommands.disabled` 可按名称关闭。其中 `/coordinate` 的 Skill 定义带 `disable-model-invocation: true`，只能由用户显式调用，模型不会自行调用。

`/coordinate` 随 2026-08-12 的 main 分支提交（`8858d4340bbb`，PR #8804）引入 Agent Team 运行时：Leader 把目标拆分为最多 3 个独立工作流，调查队友被强制只读工具集（不能执行 shell 命令、写文件或继续派生 Agent）；需要修改代码时可创建 1 个 Git Worktree 并固定 1 名写手队友，Leader 保持当前分支唯一合并权；队友共享任务清单、经既有团队工具（`send_message`、`task_list`、`task_update`）互发消息，并显示在既有 Agent View 页签。完整团队协作需将 `experimental.agentTeam` 设为 `true` 并重启，或以 `QWEN_CODE_ENABLE_AGENT_TEAM=1` 启动；未启用时 `/coordinate` 退回普通前台 Agent 做只读并行调查，属于委派而非协作。该命令与运行时随 v0.21.11（2026-08-13 发布，标签提交 `7a48b9278f65`）进入正式通道，发布说明同时写明结果会自动转发给 Leader Agent。

#### 动态命令

动态数量取决于本机和项目内容，不能给出固定总数：

- 用户、项目和扩展 `SKILL.md`：注册为 `/<skill-name>`。
- 用户、项目和扩展 `commands/` 目录中的 Markdown/TOML：注册为对应 `/<command-name>`。
- 保存的 Workflow：功能开启后注册为 `/<workflow-name>`，仅交互式执行。
- MCP Server 暴露的 Prompt：注册为相应 Slash 命令。

实际加载顺序为：MCP Prompt → 硬编码命令 → 随产品提供的 Skill → 用户/项目/扩展 Skill → 保存的 Workflow → Markdown/TOML 命令。普通命令同名时后加载者覆盖前者；扩展命令冲突时改名为 `extensionName.commandName`。`skills.disabled` 只过滤 Skill，不会误伤同名硬编码命令或 MCP Prompt；`slashCommands.disabled` 在合并后过滤最终命令名和别名。

#### Web Shell 本地命令

Web Shell 还固定提供 4 个不属于 CLI/TUI 硬编码加载器的本地命令：

| 命令 | 行为 | 条件 |
| --- | --- | --- |
| `/log` | 打开工作区 Git 提交历史 | 需要 Git 工作区 |
| `/prs` | 打开工作区的 GitHub Pull Request 列表 | 需要受支持的 GitHub 仓库 |
| `/release` | 打开 live session 释放对话框 | Web Shell live session |
| `/schedule` | 打开定时任务管理页 | Web Shell |

因此“Qwen Code 命令总数”必须绑定 Surface。CLI/TUI 的固定命令面、Web Shell 本地命令和每台机器动态发现的命令不能合并成一个不带条件的数字。

### Kimi Code

`/add-dir`、`/auto`、`/btw`、`/bug`、`/check-kimi-code-docs`、`/compact`、`/copy`、`/custom-theme`、`/editor`、`/exit`、`/experiments`、`/export-debug-zip`、`/export-md`、`/feedback`、`/fork`、`/goal`、`/help`、`/import-from-cc-codex`、`/init`、`/login`、`/logout`、`/mcp`、`/mcp-config`、`/model`、`/new`、`/permission`、`/plan`、`/plugins`、`/provider`、`/secondary-model`、`/sessions`、`/settings`、`/status`、`/sub-skill`、`/subagent-model`、`/swarm`、`/tasks`、`/theme`、`/title`、`/tower`、`/undo`、`/update-config`、`/usage`、`/version`、`/web`、`/yolo`。

其中 `/bug` 是 `/feedback` 的别名（提交 `8db7d42f2347`），自 0.33.0（2026-08-05 发布）起包含。0.33.0 起 `/fork` 派生副本后不再切换到副本，仍停留在当前会话（提交 `54c04bf03ddb`）；0.36.1（2026-08-14 发布）起在回合运行中 fork 会报错，不再复制未写完的回合；提交 `6b72345f8bb0`（2026-08-15 合入 main，尚未发布）后 `/fork` 还会打印可在新进程进入 fork 的 `kimi --resume` 命令并复制到剪贴板。0.36.0（2026-08-13 发布）起，原 `/secondary_model` 改名为 `/secondary-model`，`/subagent-model` 是它的别名（提交 `c9bfe8b2c831`）；命令打开模型选择器并写入 `[secondary_model] default_model`，仅在 `secondary-model` 实验功能启用时可见。

`/tower`（多代理 Tower 编排）于 2026-08-16 合入 main 分支（提交 `f492cd7c9e03`，PR #2633），从未进入 Release；2026-08-18 提交 `5ae82cd5bcb9`（PR #3023）将 tower 功能整体禁用（`tower` 标志未注册进实验功能登记册，环境变量、master 开关或 `[experimental]` 配置都无法开启）；2026-08-21 提交 `0f44537c13e7`（PR #3099）把 `/tower` 重建为与 plan 并列的一等模式重新开启，合入 main 尚未发布（changeset `.changeset/tower-mode-command.md` 为 minor，随下一个版本发布）。当前形态：`/tower` 是 v2 引擎内置命令——不带参数或带 `status` 报告状态，`on|off` 切换模式，`teardown` 发送拆除指令（由模型的 `TowerTeardown` 退出模式），其余输入作为目标（先幂等确保模式开启，再把目标作为普通输入发送）；v2 引擎无会话时惰性创建会话。编排手册从删除的内置 Skill 移入 `tower_mode` 上下文注入（full、sparse、exit 三类提醒），编排工具集（十一个 `Tower*` 工具）在进入模式时以工具覆盖层启用、会话恢复时重新应用，`tower_mode.enter`/`tower_mode.exit` 写入会话 wire 历史、恢复时重放。模式由 `tower` 实验标志门禁（`KIMI_CODE_EXPERIMENTAL_TOWER`，默认关闭），标志现经 `registerFlagDefinition` 注册进实验功能登记册、`/experiments` 列出，功能在 App 启动时组装，运行中开启需要重启；标志关闭时钩子否决全部 tower 工具。同一仓库的 tower 只允许一个在世持有者会话，SDK `Session.setTowerMode()` 与 kap-server `agent_config.tower_mode` 也可切换，TUI 页脚显示 `tower` 徽标。编排行为与原设计一致：主 Agent 作为唯一控制塔规划 mission 并合并分支，worker 在 `.tower/worktrees/` 下的独立 git worktree 中执行任务，reviewer 审查分支，`TowerMerge` 门禁要求针对当前 tip 的 clean review。官方 Slash 命令文档尚未列出 `/tower`。2026-08-16 同一提交起，回合运行中输入的 Skill 命令不再被拒绝，而是排队显示，Ctrl-S 可作为 activation 注入运行中的回合（该行为不属于 tower，仍保留）。

### Qoder CLI

`/agents`、`/batch`、`/clear`、`/commands`、`/compact`、`/config`、`/context-window`、`/effort`、`/export`、`/fast`、`/feedback`、`/goal`、`/help`、`/init`、`/login`、`/logout`、`/mcp`、`/memory`、`/model`、`/plan`、`/quest`、`/quit`、`/release-notes`、`/resume`、`/review`、`/setup-github`、`/skills`、`/status`、`/tasks`、`/upgrade`、`/usage`、`/vim`、`/workflows`。

官方文档站于 2026-08-13 核对时已改版，原 `en/cli/command` 页面迁移为 `cli/slash-reference`（旧地址返回 404）。`/batch` 为改版后命令参考“Built-in Skills”一节列出的内置 Skill：在隔离 git worktree 中派出并行工作 Agent 对多个文件应用批量修改，要求当前目录为 Git 仓库；官方发行说明（最近至 1.1.20，2026-08-12）未写明该命令的引入版本。`/goal`（目标管理）于 2026-08-23 核对时补入本目录：命令参考“Work Modes”一节列出 `/goal`，并有独立 Goal Command Reference 页，详见对照表目标行。改版后的命令参考还列出更多未在本目录中的命令，属于其他能力字段，另行核对。

## 来源

- [Claude Code 交互命令](https://code.claude.com/docs/en/commands)
- [Claude Code 快捷键](https://code.claude.com/docs/en/keybindings)
- [Claude Code v2.1.222 更新日志](https://github.com/anthropics/claude-code/blob/3b272769d0c8/CHANGELOG.md)
- [Claude Code v2.1.223 更新日志](https://github.com/anthropics/claude-code/blob/5cf69b18c86d/CHANGELOG.md)
- [Claude Code ultrareview](https://code.claude.com/docs/en/ultrareview)
- [Codex CLI 命令](https://developers.openai.com/codex/cli/slash-commands)
- [Codex 双键快捷键 chord 提交](https://github.com/openai/codex/commit/1e85ca099e4265bf89f4016772d299816e231bb3)
- [Qwen Code 硬编码命令加载器](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/packages/cli/src/services/BuiltinCommandLoader.ts)
- [Qwen Code bundled Skill 加载器](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/packages/cli/src/services/BundledSkillLoader.ts)
- [Qwen Code 用户、项目与扩展 Skill 加载器](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/packages/cli/src/services/SkillCommandLoader.ts)
- [Qwen Code Markdown/TOML 命令加载器](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/packages/cli/src/services/FileCommandLoader.ts)
- [Qwen Code 保存的 Workflow 加载器](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/packages/cli/src/services/saved-workflow-loader.ts)
- [Qwen Code `/workflows` 暂停/恢复命令文档](https://github.com/QwenLM/qwen-code/blob/88a325bce9dbdbfafe0d5dc6e4667b4c2942818b/docs/users/features/commands.md)
- [Qwen Code Background Tasks 快捷键文档](https://github.com/QwenLM/qwen-code/blob/88a325bce9dbdbfafe0d5dc6e4667b4c2942818b/docs/users/reference/keyboard-shortcuts.md)
- [Qwen Code workflows 命令源码](https://github.com/QwenLM/qwen-code/blob/88a325bce9dbdbfafe0d5dc6e4667b4c2942818b/packages/cli/src/ui/commands/workflowsCommand.ts)
- [Qwen Code v0.21.8 Release](https://github.com/QwenLM/qwen-code/releases/tag/v0.21.8)
- [Qwen Code MCP Prompt 加载器](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/packages/cli/src/services/McpPromptLoader.ts)
- [Qwen Code 命令合并与冲突处理](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/packages/cli/src/services/CommandService.ts)
- [Qwen Code `/review` Skill](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/core/src/skills/bundled/review/SKILL.md)
- [Qwen Code 多代理协作文档](https://github.com/QwenLM/qwen-code/blob/8858d4340bbbb46f693dd09767aaaadc7ec7cc9b/docs/users/features/multi-agent-coordination.md)
- [Qwen Code `/coordinate` Skill](https://github.com/QwenLM/qwen-code/blob/8858d4340bbbb46f693dd09767aaaadc7ec7cc9b/packages/core/src/skills/bundled/coordinate/SKILL.md)
- [Qwen Code 原生多代理协作提交](https://github.com/QwenLM/qwen-code/commit/8858d4340bbbb46f693dd09767aaaadc7ec7cc9b)
- [Qwen Code v0.21.11 发布说明](https://github.com/QwenLM/qwen-code/releases/tag/v0.21.11)
- [Qwen Code `/advisor` 命令提交](https://github.com/QwenLM/qwen-code/commit/18c9763f46ce95eb64f46038941618c4ea50dcce)
- [Qwen Code `/advisor` 命令文档](https://github.com/QwenLM/qwen-code/blob/18c9763f46ce95eb64f46038941618c4ea50dcce/docs/users/features/commands.md)
- [Qwen Code `/advisor` 命令源码](https://github.com/QwenLM/qwen-code/blob/18c9763f46ce95eb64f46038941618c4ea50dcce/packages/cli/src/ui/commands/advisor-command.ts)
- [Qwen Code `advisorModel` 设置文档](https://github.com/QwenLM/qwen-code/blob/18c9763f46ce95eb64f46038941618c4ea50dcce/docs/users/configuration/settings.md)
- [Qwen Code Auto Skill curator 提交](https://github.com/QwenLM/qwen-code/commit/e569734a1e127d253433409c91926373afda6b47)
- [Qwen Code Web Shell 本地命令](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/packages/web-shell/client/constants/localCommands.ts)
- [Kimi Code Slash 命令](https://github.com/MoonshotAI/kimi-code/blob/c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860/docs/zh/reference/slash-commands.md)
- [Kimi Code `/bug` 别名提交](https://github.com/MoonshotAI/kimi-code/commit/8db7d42f23472a692eb389a0e0e5a3e18aa1b94d)
- [Kimi Code `/fork` 不再切换会话提交](https://github.com/MoonshotAI/kimi-code/commit/54c04bf03ddbeb46d02b2edb460ea091ae194509)
- [Kimi Code `/fork` 恢复命令打印提交](https://github.com/MoonshotAI/kimi-code/commit/6b72345f8bb03487e3bcc05b541e65484818428c)
- [Kimi Code `/tower` 多代理编排提交](https://github.com/MoonshotAI/kimi-code/commit/f492cd7c9e03666ecfd10dc47ca9b48c35de2318)
- [Kimi Code `/tower` changeset](https://github.com/MoonshotAI/kimi-code/blob/f492cd7c9e03666ecfd10dc47ca9b48c35de2318/.changeset/tower-slash-command.md)
- [Kimi Code tower 功能禁用提交](https://github.com/MoonshotAI/kimi-code/commit/5ae82cd5bcb92395baf96feea68e12f8c96b51ed)
- [Kimi Code Tower Skill 实验标志门禁](https://github.com/MoonshotAI/kimi-code/blob/5ae82cd5bcb92395baf96feea68e12f8c96b51ed/packages/agent-core-v2/src/features/tower/skill/skill.ts)
- [Kimi Code TowerFeature 标志守护源码](https://github.com/MoonshotAI/kimi-code/blob/5ae82cd5bcb92395baf96feea68e12f8c96b51ed/packages/agent-core-v2/src/features/tower/towerFeature.ts)
- [Kimi Code tower 标志门禁测试](https://github.com/MoonshotAI/kimi-code/blob/5ae82cd5bcb92395baf96feea68e12f8c96b51ed/packages/agent-core-v2/test/features/tower/towerFeature.test.ts)
- [Kimi Code 内置 Skill 标志过滤](https://github.com/MoonshotAI/kimi-code/blob/5ae82cd5bcb92395baf96feea68e12f8c96b51ed/packages/agent-core-v2/src/app/skillCatalog/builtin/builtin.ts)
- [Kimi Code `/tower` 模式重建提交](https://github.com/MoonshotAI/kimi-code/commit/0f44537c13e7c32b9189e20af7c894c34704be5b)
- [Kimi Code tower 模式 changeset](https://github.com/MoonshotAI/kimi-code/blob/0f44537c13e7c32b9189e20af7c894c34704be5b/.changeset/tower-mode-command.md)
- [Kimi Code tower 模式实验标志源码](https://github.com/MoonshotAI/kimi-code/blob/0f44537c13e7c32b9189e20af7c894c34704be5b/packages/agent-core-v2/src/features/tower/flag.ts)
- [Kimi Code `/tower` 模式命令源码](https://github.com/MoonshotAI/kimi-code/blob/0f44537c13e7c32b9189e20af7c894c34704be5b/apps/kimi-code/src/tui/commands/tower.ts)
- [Kimi Code Subagent 模型池提交](https://github.com/MoonshotAI/kimi-code/commit/c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860)
- [Kimi Code 0.36.0 发布说明](https://github.com/MoonshotAI/kimi-code/releases/tag/%40moonshot-ai/kimi-code%400.36.0)
- [Kimi Code 0.36.1 发布说明](https://github.com/MoonshotAI/kimi-code/releases/tag/%40moonshot-ai/kimi-code%400.36.1)
- [Qoder CLI Slash 命令参考](https://docs.qoder.com/cli/slash-reference)
- [Qoder CLI Goal Command Reference](https://docs.qoder.com/cli/goal-reference)

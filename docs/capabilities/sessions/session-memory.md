# 跨会话记忆

[返回会话与上下文详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=session-memory)

> 核对日期：2026-10-08

## 定义

在新会话开始时重新加载项目指令、用户偏好或由历史会话提炼出的持久信息，也包括按需从外部记忆服务检索已保存的条目。

## 会话结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `CLAUDE.md` + Auto memory | 官方确认 |
| Codex | 条件：`/memories`；默认关闭 | 条件项 |
| Qwen Code | `QWEN.md` + Auto-memory（`pinned/` 保护目录、`memory.enableStructuredRecall` 结构化召回与 `search_memory`）· 条件：`memory.mem0` 内置外部 Mem0 记忆服务，自动注册 `external-context` MCP、默认只读 `context_search`（v0.25.0 起） | 官方确认 |
| Kimi Code | `AGENTS.md`；自动记忆未列出 | 条件项 |
| Qoder CLI | `AGENTS.md`；条件：Auto-memory | 条件项 |

## 比较边界

### 本页包含

- 显式指令文件
- 自动提炼记忆
- 项目与用户作用域
- 按需检索的外部记忆服务

### 本页不包含

- 当前会话短期上下文
- 权限和安全规则本身
- 只恢复原会话

## 跨产品事实

1. 五家都能加载项目级静态指令；Claude Code、Codex、Qwen Code 和 Qoder CLI 还公开了自动记忆机制。
2. Codex 本地记忆默认关闭；Qwen Code Auto-memory 默认开启；Qoder Auto-memory 需要环境变量并只在交互会话运行。
3. Kimi Code 当前公开的是 `AGENTS.md` 静态指令体系，没有列出独立自动记忆或 `/memory` 命令。
4. Qwen Code v0.25.0 起把 Mem0 外部记忆服务内置进主 CLI：用户或系统设置里的 `memory.mem0` 让 CLI 自动注册名为 `external-context` 的 MCP 服务器并只暴露 `context_search`，写入要显式 `enableWrites: true` 并由自动安装的 Hook 逐条确认精确内容。
5. 其余四家的官方记忆文档只描述保存在本机的记忆（Claude Code `~/.claude/projects/<project>/memory/`、Codex `~/.codex/memories/`、Qoder CLI `~/.qoder/projects/<project>/memory/` 与 `~/.qoder/memory/`、Kimi Code 仓库内 `AGENTS.md`），2026-10-05 复核时都没有内置的外部记忆服务连接配置。
6. Qwen Code 的自动记忆另有两级细化：`pinned/` 顶层目录让手工整理的记忆文档免于自动提炼与 Dream 整理（v0.22.0 起记录），`memory.enableStructuredRecall` 把扁平 `MEMORY.md` 索引换成层级记忆树并提供 `search_memory` 工具（v0.24.7 起记录，默认关闭、需重启）。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `CLAUDE.md` + Auto memory |
| 入口与切换 | `/memory` 查看和编辑加载的 `CLAUDE.md` 与 Auto memory；稳定规则写入用户、项目或本地 `CLAUDE.md`。 |
| 保存位置 | Auto memory 在 `~/.claude/projects/<project>/memory/`：`MEMORY.md` 是索引（每条记忆一行、每次会话加载），每条记忆另有一个主题文件；`autoMemoryDirectory` 可改到别处。显式指令在用户、项目或本地 `CLAUDE.md`。 |
| 具体行为 | 显式文件每次会话加载；Auto memory 从历史工作提炼偏好、模式和项目知识，并通过 `MEMORY.md` 索引和主题文件注入。 |
| 状态范围 | 项目 Auto memory 在同一仓库各 Worktree 间共享，存储在本机；`<project>` 路径由 Git 仓库推导，仓库外改用项目根目录。`CLAUDE_CODE_PROJECT_DIR_NAME` 与 `CLAUDE_CONFIG_DIR` 一起设置时以该名字作为 `<config dir>/projects/` 下的 `<project>` 目录（需 v2.1.234 及以上），于是共用该配置目录的项目共享一份 Auto memory。用户和项目 `CLAUDE.md` 有不同共享范围。 |
| 自动行为 | Auto memory 在后台根据会话提炼和更新；`/memory` 可审计、编辑或关闭。 |
| 保存与保留 | 启动加载 `MEMORY.md` 前 200 行或约 25KB，主题文件按需读取；`autoMemoryDirectory` 可从用户、项目、local、policy 或 `--settings` 任一作用域指定记忆目录，取值必须是绝对路径或以 `~/` 开头。 |
| 适用界面 | 本页以 CLI 为准。桌面端、Web 和 VS Code 各自维护会话历史；`claude -p` 与 Agent SDK 会话可按 ID 恢复，但不出现在 CLI 选择器中。 |
| 条件与边界 | 主 Agent Auto memory 默认不传给独立 Subagent；强制团队规则应放在版本控制的 `CLAUDE.md`，而不是只依赖自动记忆。单项目关闭用 `autoMemoryEnabled: false`，环境变量 `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1` 同样关闭。项目 `.claude/settings.json` 或 `.claude/settings.local.json` 里的 `autoMemoryDirectory` 按与设置文件 Hooks 相同的 workspace trust 规则生效；`permissions.blockReadsOutsideWorkingDirectories` 开启时，仓库自带设置文件选择的目录既不加载也不写入 Auto memory。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Memory](https://code.claude.com/docs/en/memory) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 条件：`/memories`；默认关闭 |
| 入口与切换 | 启用后用 `/memories` 控制当前聊天是否读取既有记忆、是否贡献未来记忆（官方 CLI Slash 命令表逐字为 “Configure memory use and generation.”，说明在不离开 TUI 的情况下开关记忆注入与记忆生成）；稳定团队规则写入 `AGENTS.md`。 |
| 保存位置 | 本地记忆文件在 `$CODEX_HOME/memories/`（默认 `~/.codex/memories/`），包含摘要、持久条目、近期输入与来自此前聊天的证据；官方把这些文件视为生成状态。稳定规则在仓库 `AGENTS.md`。 |
| 具体行为 | 从符合条件的历史聊天后台提取并合并本地记忆，为未来会话提供可复用上下文。 |
| 状态范围 | 本地 Codex 记忆与 ChatGPT Web 记忆分开；IDE 使用连接的 Codex Host 本地存储。 |
| 自动行为 | 会话空闲后后台提取；会跳过活跃、短会话，配额低于阈值时也可跳过。 |
| 保存与保留 | 官方把记忆文件视为生成状态：排障或分享 Codex home 目录前可以查看，但不要把手工编辑当作主要控制手段；控制入口是设置开关与每聊天的 `/memories`。 |
| 适用界面 | 本页区分交互式 Codex 与 `codex exec`。桌面端、IDE 和 CLI 可能随各自版本提供不同的命令集合。 |
| 条件与边界 | 本地记忆默认关闭，需在设置中开启或配置 `[features] memories = true`；每聊天控制不改变全局开关。官方文档列出的记忆设置键为 `memories.generate_memories`（新聊天是否可作为记忆生成输入）、`memories.use_memories`（是否把既有记忆注入后续会话）、`memories.disable_on_external_context`（用过的聊天若调用过 MCP 工具、Web 搜索或工具搜索则不参与记忆生成，旧键 `memories.no_memories_if_mcp_or_web_search` 仍作为别名接受）、`memories.min_rate_limit_remaining_percent`（启动记忆生成所需的最低剩余配额百分比）、`memories.extract_model` 与 `memories.consolidation_model`（分别覆盖单聊天提取与全局合并使用的模型）。 |
| 证据状态 | 条件项 |
| 来源 | [Codex Memories](https://learn.chatgpt.com/docs/customization/memories)、[Codex Advanced Configuration](https://learn.chatgpt.com/docs/config-file/config-advanced)、[Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `QWEN.md` + Auto-memory（`pinned/` 保护目录、`memory.enableStructuredRecall` 结构化召回与 `search_memory`）· 条件：`memory.mem0` 内置外部 Mem0 记忆服务，自动注册 `external-context` MCP、默认只读 `context_search`（v0.25.0 起） |
| 入口与切换 | `/memory` 管理，`/remember <text>` 显式写入，`/forget <text>` 删除，`/dream` 立即执行整理；稳定规则写入 `QWEN.md`。外部 Mem0 服务没有命令入口：在用户或系统设置写 `memory.mem0`（`baseUrl` 必填、`protocol` 默认 `mem0-v2`、`envKey` 默认 `MEM0_API_KEY`）后在受信任项目重启交互式 CLI，绑定自动生效。 |
| 保存位置 | 私有记忆位于 `~/.qwen/projects/<project>/memory/`，用户级记忆位于 `~/.qwen/memories/`，都是纯 Markdown；Team memory 位于仓库 `.qwen/team-memory/`。要长期保留的手工文档放受管记忆根目录下的顶层 `pinned/`（如 `~/.qwen/projects/<project>/memory/pinned/architecture.md`、`~/.qwen/memories/pinned/preferences.md`），沿用与其他记忆文档相同的 frontmatter，下次重建 `MEMORY.md` 时按同样的大小与文件数上限纳入。Mem0 条目保存在所配置的服务端，本机只保存 `memory.mem0` 绑定与凭据引用。 |
| 具体行为 | 每次会话加载显式指令；Auto-memory 在后台提炼偏好、反馈、项目背景和引用，并用 Markdown 文件供未来会话读取。默认按扁平 `MEMORY.md` 索引召回；`memory.enableStructuredRecall` 开启后改为层级记忆树、只注入与当前请求相关的子树，并给模型一个 `search_memory` 工具按需拉取完整条目。Mem0 绑定生效后 CLI 自动注册 `external-context` MCP 服务器并只发现 `context_search`，检索由模型按需发起，官方明确不会在每轮自动召回或发送内容；`enableWrites: true` 后追加 `context_remember`，写入以 `infer: false` 提交。 |
| 状态范围 | 项目私有记忆按 checkout 保存，普通分支共享，linked Worktree 独立；可选 `.qwen/team-memory/` 通过 Git 与团队共享。Mem0 默认作用域是 `qwen-` 加「主目录 + 仓库根真实路径」项目哈希的前 32 位（V2/OSS 写 `userId`，V3 写 `appId`），重启与从 Git 子目录启动都不变；移动仓库、换检出或换 Worktree（含 `--worktree` 与 Agent 隔离 Worktree）都会改变它，需要跨 Worktree 复用同一份记忆时用 `scope.userId`（V2/OSS）或 `scope.appId`（V3）显式指定，可选 `scope.agentId` 只对 V2/OSS 生效。官方说明作用域标识不是服务端访问控制。 |
| 自动行为 | Auto-memory 默认开启；每日在会话数量足够时做整理，`/dream` 可手动触发。Team memory 与自动 Git Sync 都默认关闭。结构化召回默认关闭，开启后启动后台元数据迁移：每轮至多 10 个文件、只改写 frontmatter（分类、关键词、使用场景）而不动正文，设置关闭时从不调度也不产生后台模型调用。Mem0 的检索与写入都不自动发生，必须由模型调用工具。 |
| 保存与保留 | 记忆文件是纯 Markdown，可随时打开、编辑或删除，`pinned/` 内的文档由自动提炼与 Dream 整理跳过。Mem0 记忆不在本机落盘，写入结果分四态：`stored` 表示返回了有效的同步 ID，`accepted` 只表示异步请求被接受而非已持久化，`failed` 是明确拒绝，`unknown` 表示可能已写入、不要自动重试。 |
| 适用界面 | 交互式 CLI 为主。`memory.mem0` 绑定在非交互（Headless）与 ACP 会话同样注册，但只有交互式会话能启用写入；官方 Mem0 文档未描述 Web Shell、桌面端或 Daemon 的绑定行为。 |
| 条件与边界 | Auto-memory 与整理由 `memory.enableManagedAutoMemory`、`memory.enableManagedAutoDream`（默认都为 `true`）或 `/memory` 顶部开关控制；Team memory 会进入 Git diff，写入前做凭据扫描但仍需人工检查；始终生效的规则应写入 `QWEN.md`。`pinned/` 只保护受管记忆根目录下直接的顶层同名目录（大小写不敏感匹配），`memory/project/pinned/` 这类嵌套目录是普通可写记忆；自动提炼被要求保持 pinned 记录与其有效索引条目不变、Dream 整理跳过 `pinned/`，两者（含后台清理的 fork worker）在写入与编辑工具上强制该边界并覆盖经符号链接解析进 `pinned/` 的路径；只有项目 Dream worker 持有 shell 且策略只读，自动提炼与用户记忆 Dream worker 完全无 shell，用户仍可用显式 `/forget` 删除。官方注明可见的 `/dream` 命令跑在主 Agent 上，收到同样的跳过指令但尚未获得 fork worker 的逐轮工具门禁。Mem0 绑定只从系统默认、用户与系统设置读取 `memory.mem0`，工作区（项目 `.qwen/settings.json`）设置不能启用或改写；bare 模式、safe 模式、SSH 工作区、provisional 工作区与未受信任目录都不激活。`external-context` 属顶层 MCP、不经 MCP 审批门禁，与系统或用户设置、会话注入（ACP/IDE）、`--mcp-config` 中的同名服务器冲突时报错 `Configure memory.mem0 or an external-context MCP server, not both.`，而工作区设置与项目 `.mcp.json` 的同名条目被覆盖；改用内置路径时要移除手写的 MCP 配置与旧的写入确认 Hook，同 matcher 的用户 Hook 不会替代内置确认。写入需 `enableWrites: true`、交互式会话且未设 `disableAllHooks`，自动安装的 PreToolUse Hook（名为 `bundled-mem0-write-confirmation`、匹配 `mcp__external-context__context_remember`、超时 8 秒）逐条要求确认精确内容，YOLO 模式同样确认，拒绝则不发送写请求；非交互/ACP 会话与关闭 Hooks 的会话只保留检索。凭据取值优先级为进程环境变量 > `~/.qwen/.env` > `settings.env`，写进 JSON 是明文；`envKey` 与旧别名 `credentialEnv` 同时设置时名称必须一致，否则报错而不是静默选择；`timeoutMs` 默认 5000、取值 1–30000，MCP 服务器超时取其值加 5000；`baseUrl` 必须是不含凭据、query 与 fragment 的 HTTP(S) 地址，非 localhost/127.0.0.1/[::1] 的明文 HTTP 需 `allowInsecureHttp: true`；协议只在 `mem0-v2`、`mem0-v3`、`mem0-oss-2026-08` 三个完整契约间选择（另接受 `aliyun-polardb-mysql-2026-08` 等历史预设 ID，该预设保留 `top_k` 检索字段），官方声明这不等于对所有同名 Mem0 服务的通用版本兼容。PR #12891（合并提交 `abcf23a3d9b1`，2026-09-30）合入 main，随 v0.25.0（2026-10-05）发布；安装包内含 `dist/mem0/main.js` 与 `dist/mem0/write-confirmation.js`，无需另装 `@qwen-code/external-context-mem0` 或手工注册 MCP。 |
| 证据状态 | 官方确认 |
| 来源 | [Qwen Code v0.25.0 记忆文档（`pinned/` 与结构化召回）](https://github.com/QwenLM/qwen-code/blob/v0.25.0/docs/users/features/memory.md)、[Qwen Code v0.24.7 记忆文档（结构化召回首次出现的发行版）](https://github.com/QwenLM/qwen-code/blob/v0.24.7/docs/users/features/memory.md)、[Qwen Code v0.22.0 记忆文档（`pinned/` 首次出现的发行版）](https://github.com/QwenLM/qwen-code/blob/v0.22.0/docs/users/features/memory.md)、[Qwen Code Mem0 官方功能文档（内置外部记忆服务）](https://github.com/QwenLM/qwen-code/blob/abcf23a3d9b184bb850fb46bd706cd206082366a/docs/users/features/mem0.md)、[Qwen Code v0.25.0 设置文档（`memory.mem0` 与 `memory.enableStructuredRecall`）](https://github.com/QwenLM/qwen-code/blob/v0.25.0/docs/users/configuration/settings.md)、[Qwen Code `memory.mem0` schema、MCP 绑定与写入确认 Hook 源码](https://github.com/QwenLM/qwen-code/blob/abcf23a3d9b184bb850fb46bd706cd206082366a/packages/cli/src/config/mem0-settings.ts)、[Qwen Code 配置装配源码（绑定门禁、顶层 MCP 与同名冲突报错）](https://github.com/QwenLM/qwen-code/blob/abcf23a3d9b184bb850fb46bd706cd206082366a/packages/cli/src/config/config.ts)、[Qwen Code 设置合并源码（`memory.mem0` 只取系统默认、用户与系统设置）](https://github.com/QwenLM/qwen-code/blob/abcf23a3d9b184bb850fb46bd706cd206082366a/packages/cli/src/config/settings.ts)、[Qwen Code PR #12891（bundle Mem0 with the main CLI）](https://github.com/QwenLM/qwen-code/pull/12891)、[Qwen Code v0.25.0 发布说明（Mem0 随主 CLI 发布）](https://github.com/QwenLM/qwen-code/releases/tag/v0.25.0) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `AGENTS.md`；自动记忆未列出 |
| 入口与切换 | 项目或用户通过 `AGENTS.md` 提供跨会话指令；`/init` 可生成项目 `AGENTS.md`。当前命令表没有 `/memory`。 |
| 保存位置 | 记忆载体是用户或仓库维护的普通 Markdown 指令文件（具体位置见状态范围）；官方文档没有列出自动提炼生成的记忆目录。 |
| 具体行为 | 启动时把用户、项目和目录级 `AGENTS.md` 作为 Agent 指令注入；子目录指令随文件访问路径加载。 |
| 状态范围 | 全局 Kimi 指令可放 `$KIMI_CODE_HOME/AGENTS.md`，跨工具指令可放 `~/.agents/AGENTS.md`，项目可放 `.kimi-code/AGENTS.md` 或 `AGENTS.md`。 |
| 自动行为 | 当前官方文档未列出从历史会话自动提炼和更新记忆文件的机制。 |
| 保存与保留 | 静态指令是普通 Markdown 文件，由用户或仓库维护；会话历史另存在 `sessions/`，不会自动等同为长期记忆。 |
| 适用界面 | 本页以交互式 TUI 和 `kimi` CLI 为主；只在 Web UI 中不同的行为会单独注明。 |
| 条件与边界 | 本项确认静态跨会话指令，但自动记忆保持未确认，不从会话存储或 Agent 状态推断。 |
| 证据状态 | 条件项 |
| 来源 | [Kimi Code current agents](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/customization/agents.md)、[Kimi Code current data locations](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/configuration/data-locations.md)、[Kimi Code current slash commands](https://github.com/MoonshotAI/kimi-code/blob/7c919f0376c0331d0d057ef3643c7adcc2c55802/docs/zh/reference/slash-commands.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `AGENTS.md`；条件：Auto-memory |
| 入口与切换 | `/memory` 查看静态和自动记忆，`/memory manage` 管理自动记忆主题；静态规则写入 `AGENTS.md` 或 `.qoder/rules/*.md`。 |
| 保存位置 | 项目级 Auto-Memory 在 `~/.qoder/projects/<project>/memory/`，启用用户级后另有 `~/.qoder/memory/`；每个记忆目录含一个 `MEMORY.md` 索引与若干主题文件。静态规则在 `AGENTS.md` 或 `.qoder/rules/*.md`。 |
| 具体行为 | 静态 Memory 每次会话加载；Auto-memory 提炼用户偏好、反馈、项目背景和外部引用，可用自然语言要求 Remember 或 Forget。 |
| 状态范围 | 静态指令支持用户、项目、本地项目和 Plugin；Auto-memory 默认项目级，可选跨项目用户级。 |
| 自动行为 | Auto-memory 只在交互会话运行，需以 `QODER_MEMORY=1` 启动；用户级还需 `QODER_MEMORY_USER=1`。 |
| 保存与保留 | 启动时读取每个活跃记忆根 `MEMORY.md` 的前 200 行或约 25KB，更细的内容放主题文件并由索引引用；`/memory` 可打开自动记忆目录，文件也可手工编辑。 |
| 适用界面 | 本页以 Qoder CLI TUI 为主；只在 Agent SDK 提供的能力会明确标为 SDK 条件项。 |
| 条件与边界 | 环境变量未开启时 `/memory` 仍可管理 `AGENTS.md`，但 `/memory manage` 会提示 Auto-memory 不可用。 |
| 证据状态 | 条件项 |
| 来源 | [Qoder CLI Memory](https://docs.qoder.com/en/cli/memory)、[Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference) |

## 官方来源

- [Claude Code Memory](https://code.claude.com/docs/en/memory)
- [Codex Memories](https://learn.chatgpt.com/docs/customization/memories)
- [Codex Advanced Configuration](https://learn.chatgpt.com/docs/config-file/config-advanced)
- [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)
- [Qwen Code v0.25.0 记忆文档（`pinned/` 与结构化召回）](https://github.com/QwenLM/qwen-code/blob/v0.25.0/docs/users/features/memory.md)
- [Qwen Code v0.24.7 记忆文档（结构化召回首次出现的发行版）](https://github.com/QwenLM/qwen-code/blob/v0.24.7/docs/users/features/memory.md)
- [Qwen Code v0.22.0 记忆文档（`pinned/` 首次出现的发行版）](https://github.com/QwenLM/qwen-code/blob/v0.22.0/docs/users/features/memory.md)
- [Qwen Code Mem0 官方功能文档（内置外部记忆服务）](https://github.com/QwenLM/qwen-code/blob/abcf23a3d9b184bb850fb46bd706cd206082366a/docs/users/features/mem0.md)
- [Qwen Code v0.25.0 设置文档（`memory.mem0` 与 `memory.enableStructuredRecall`）](https://github.com/QwenLM/qwen-code/blob/v0.25.0/docs/users/configuration/settings.md)
- [Qwen Code `memory.mem0` schema、MCP 绑定与写入确认 Hook 源码](https://github.com/QwenLM/qwen-code/blob/abcf23a3d9b184bb850fb46bd706cd206082366a/packages/cli/src/config/mem0-settings.ts)
- [Qwen Code 配置装配源码（绑定门禁、顶层 MCP 与同名冲突报错）](https://github.com/QwenLM/qwen-code/blob/abcf23a3d9b184bb850fb46bd706cd206082366a/packages/cli/src/config/config.ts)
- [Qwen Code 设置合并源码（`memory.mem0` 只取系统默认、用户与系统设置）](https://github.com/QwenLM/qwen-code/blob/abcf23a3d9b184bb850fb46bd706cd206082366a/packages/cli/src/config/settings.ts)
- [Qwen Code PR #12891（bundle Mem0 with the main CLI）](https://github.com/QwenLM/qwen-code/pull/12891)
- [Qwen Code v0.25.0 发布说明（Mem0 随主 CLI 发布）](https://github.com/QwenLM/qwen-code/releases/tag/v0.25.0)
- [Kimi Code current agents](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/customization/agents.md)
- [Kimi Code current data locations](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/configuration/data-locations.md)
- [Kimi Code current slash commands](https://github.com/MoonshotAI/kimi-code/blob/7c919f0376c0331d0d057ef3643c7adcc2c55802/docs/zh/reference/slash-commands.md)
- [Qoder CLI Memory](https://docs.qoder.com/en/cli/memory)
- [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference)

## 关联能力

- [恢复会话](./session-resume.md)
- [Agent 持久记忆](../subagents/agent-memory.md)
- [项目指令文件](../extensions/extension-project-instructions.md)
- [MCP 客户端](../extensions/extension-mcp.md)
- [记忆管理](../commands/cmd-memory.md)

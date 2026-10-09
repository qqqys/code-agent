# 手动压缩

[返回会话与上下文详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=session-compress)

> 核对日期：2026-10-09

## 定义

把较长的会话历史替换或折叠为摘要，使后续模型请求释放更多上下文窗口。

## 会话结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/compact [instructions]`；自动窗口 `/autocompact <tokens 或 auto>` · `autoCompactWindow`（v2.1.296 起 Subagent 定义可单独设） | 官方确认 |
| Codex | `/compact`；阈值 `model_auto_compact_token_limit` 与统计口径 `model_auto_compact_token_limit_scope` | 官方确认 |
| Qwen Code | `/compress [instructions]` · `/compress-fast`；阈值 `context.autoCompactThreshold`（默认 0.85） | 官方确认 |
| Kimi Code | `/compact [instruction]`；`loop_control.reserved_context_size` 触发自动压缩 | 官方确认 |
| Qoder CLI | `/compact [instructions]`；自动压缩阈值未公开 | 官方确认 |

## 比较边界

### 本页包含

- 手动压缩命令
- 自定义压缩指令
- 自动压缩触发与阈值配置

### 本页不包含

- 清空会话
- 删除磁盘上的原始记录
- 仅裁剪一条工具结果

## 跨产品事实

1. 五家都提供手动压缩；自动压缩的可配置项只有 Claude Code、Codex、Qwen Code 和 Kimi Code 公布，Qoder CLI 只在术语表定义 Compaction 而没有公开阈值或开关。
2. 阈值语义分三类：Claude Code 与 Codex 配置绝对 token 数（压缩窗口或触发阈值），Qwen Code 配置上下文窗口占比（`context.autoCompactThreshold`，默认 0.85），Kimi Code 配置为模型输出预留的 token 数（`loop_control.reserved_context_size`，窗口剩余量低于它即压缩）。
3. Claude Code v2.1.296 起 Subagent frontmatter 与 `--agents` 定义可写自己的 `autoCompactWindow`，使该 Subagent 比主会话窗口更早压缩；其余四家已固定的一手资料没有 Subagent 级压缩阈值配置。
4. Qwen Code 另有 `/compress-fast`，它不调用模型，只移除旧工具输出和思考内容，因此与摘要压缩不是同一种处理。
5. 压缩通常是有损的上下文变换；磁盘会话记录是否保留原始消息由各产品的会话格式决定。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/compact [instructions]`；自动窗口 `/autocompact <tokens 或 auto>` · `autoCompactWindow`（v2.1.296 起 Subagent 定义可单独设） |
| 入口与切换 | `/compact [instructions]`，可附加希望摘要优先保留的内容；`/autocompact [auto\|<tokens>]`（v2.1.221 起）设置自动压缩窗口，传 `500k` 一类尺寸或 `auto` 回到该模型的调优窗口，不带参数打开显示当前窗口的对话框；启动时 `--autocompact <auto\|tokens>` 只对当次会话生效且不改已保存设置。 |
| 保存位置 | 默认保存在 `~/.claude/projects/<project>/<session-id>.jsonl`；项目名由工作目录转换得到。 |
| 具体行为 | 用摘要替换当前历史，减少后续请求的上下文占用；Checkpoint 菜单还支持从指定消息前后做定向摘要。`/autocompact` 与 `--autocompact` 只改窗口，不立即压缩。 |
| 状态范围 | 作用于当前会话的模型上下文，不删除项目文件；根级 `CLAUDE.md` 会在压缩后重新注入。窗口按模型保存在用户设置的 `modelSettings`（`/autocompact` 写入，v2.1.288 起）或对所有模型生效的顶层 `autoCompactWindow`，同一文件里每模型取值优先于顶层键。 |
| 自动行为 | 未设窗口时在会话达到模型上下文上限处压缩，例外为：Cloud 会话在接近上限时压缩，Sonnet 4.6 与 Opus 4.6 未开扩展上下文时在 200K 边界，`CLAUDE_CODE_DISABLE_1M_CONTEXT=1` 时原生 1M 窗口模型按 200K，原生 1M 窗口模型默认约 967K。窗口取值 100000–1000000 并被截断到模型上下文窗口。优先级为 `CLAUDE_CODE_AUTO_COMPACT_WINDOW` > `--autocompact` > `/autocompact` 保存的每模型窗口 > 同一文件的顶层 `autoCompactWindow`；更高优先级设置作用域（如 managed settings）已为该模型或所有模型设窗口时，`/autocompact` 仍保存取值但会话沿用该作用域的窗口并说明。`autoCompactEnabled`（默认 `true`，`/config` 的 **Auto-compact** 开关）或 `DISABLE_AUTO_COMPACT=1` 关闭自动压缩而保留手动 `/compact`，`DISABLE_COMPACT=1` 连手动压缩一起关闭。`CLAUDE_AUTOCOMPACT_PCT_OVERRIDE`（1–100）按窗口百分比提前触发，只在早于模型上限就压缩的会话生效、不能抬高阈值，主会话与 Subagent 都适用。v2.1.296 起 Subagent frontmatter 与 `--agents` 定义可写 `autoCompactWindow`，让该 Subagent 比主会话窗口更早自动压缩。 |
| 保存与保留 | 压缩后的会话可继续保存和恢复；Checkpoint 的原始消息仍保留在会话记录中供需要时参考。`/autocompact` 把窗口写进用户设置，跨会话保留。Subagent transcript 不受主会话压缩影响，其压缩事件写进 `~/.claude/projects/<project>/<sessionId>/subagents/agent-<agentId>.jsonl`，形如 `subtype: "compact_boundary"` 加 `compactMetadata` 的 `trigger: "auto"` 与压缩前 token 数 `preTokens`。 |
| 适用界面 | 本页以 CLI 为准。桌面端、Web 和 VS Code 各自维护会话历史；`claude -p` 与 Agent SDK 会话可按 ID 恢复，但不出现在 CLI 选择器中。 |
| 条件与边界 | 命令与旗标接受纯 token 数（`200000`）、`k`/`M` 后缀（`500k`、`1M`）与 100–1000 的裸数字（按千计），环境变量只接受纯 token 数——`500k` 会被读成 `500` 并夹到 100K 下限；设置 `CLAUDE_CODE_AUTO_COMPACT_WINDOW` 后状态行的 `used_percentage` 仍按模型完整窗口计算，不再指示何时压缩。v2.1.288 前 `/autocompact` 保存的是对所有模型生效的顶层 `autoCompactWindow`。官方 Subagents 页在核对日期仍写 Subagent 用与主会话相同的压缩逻辑、`CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` 同样适用，其 frontmatter 字段表尚未列出 `autoCompactWindow`，该键的取值范围与它同每模型窗口之间的优先级记为未确认。嵌套目录的指令文件不是全部一次性重注入，而是在后续访问对应路径时重新加载。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Manage sessions](https://code.claude.com/docs/en/sessions)、[Claude Code Context window](https://code.claude.com/docs/en/context-window)、[Claude Code Checkpointing](https://code.claude.com/docs/en/checkpointing)、[Claude Code Commands](https://code.claude.com/docs/en/commands)、[Claude Code model configuration](https://code.claude.com/docs/en/model-config)、[Claude Code settings reference](https://code.claude.com/docs/en/settings-reference)、[Claude Code environment variables](https://code.claude.com/docs/en/env-vars)、[Claude Code CLI reference（`--autocompact` 与 `--agents`）](https://code.claude.com/docs/en/cli-reference)、[Claude Code Subagents](https://code.claude.com/docs/en/sub-agents)、[Claude Code v2.1.296 Subagent `autoCompactWindow` 更新日志](https://github.com/anthropics/claude-code/blob/2301018b1f61073c501a8e7a4813ef48c239163b/CHANGELOG.md) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/compact`；阈值 `model_auto_compact_token_limit` 与统计口径 `model_auto_compact_token_limit_scope` |
| 入口与切换 | `/compact` 压缩当前聊天上下文；官方命令表说明为总结可见聊天以释放 token，长时间运行后使用以便保留要点而不撑爆上下文窗口。 |
| 保存位置 | 本地会话记录位于 `$CODEX_HOME/sessions`，默认是 `~/.codex/sessions`；归档会话单独位于 `$CODEX_HOME/archived_sessions`。 |
| 具体行为 | 把可见聊天历史总结为更短上下文，以释放后续模型请求的 token 空间。 |
| 状态范围 | 作用于当前聊天的上下文，不修改工作区文件或创建新会话。 |
| 自动行为 | `model_auto_compact_token_limit` 设定触发自动历史压缩的 token 阈值，未设置时用模型默认值；`model_auto_compact_token_limit_scope` 决定阈值的统计口径——`total`（默认）统计整个活动上下文，`body_after_prefix` 只统计所携带压缩窗口前缀之后的增长。官方配置参考的 `[agents]` 段只列 `enabled`、`max_concurrent_threads_per_session`（及旧别名 `max_threads`）、`default_subagent_model`、`default_subagent_reasoning_effort`、`interrupt_message` 与每角色的 `description`/`config_file`，没有 Subagent 级压缩阈值键；角色可用 `agents.<name>.config_file` 挂一层 TOML 配置，但该层能否覆盖压缩阈值官方没有说明，记为未确认。 |
| 保存与保留 | 摘要进入当前会话；本地会话记录仍由 Codex 会话存储维护。OpenTelemetry 计数器 `task.compact` 按 `type`（`remote` 或 `local`）统计压缩次数，含手动与自动。 |
| 适用界面 | 本页区分交互式 Codex 与 `codex exec`。桌面端、IDE 和 CLI 可能随各自版本提供不同的命令集合。 |
| 条件与边界 | 可用 `compact_prompt` 内联覆盖压缩提示词，或用实验性 `experimental_compact_prompt_file` 从文件加载覆盖；自定义会改变摘要内容而非上下文窗口大小。 |
| 证据状态 | 官方确认 |
| 来源 | [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)、[Codex Advanced Configuration](https://learn.chatgpt.com/docs/config-file/config-advanced)、[Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/compress [instructions]` · `/compress-fast`；阈值 `context.autoCompactThreshold`（默认 0.85） |
| 入口与切换 | `/compress [instructions]`（别名 `/summarize`）用摘要替换聊天历史以节省 token；`/compress-fast` 执行无模型快速压缩；`/model --compaction <model-id>`（`/model --compaction clear` 清除）设置执行压缩的模型。 |
| 保存位置 | 会话按当前项目保存在 `~/.qwen/projects/<sanitized-cwd>/chats/<sessionId>.jsonl`。 |
| 具体行为 | `/compress` 用模型摘要替换历史；`/compress-fast` 保留消息骨架并剥离旧工具输出和思考内容。`compactionModel` 留空时回退主模型，指定更小或更快的模型可降低压缩延迟与成本。 |
| 状态范围 | 作用于当前聊天历史。自动压缩后可按配置恢复最近文件和图片引用，避免重要工作集完全丢失。 |
| 自动行为 | `context.autoCompactThreshold` 是触发自动压缩的上下文窗口占比，取值须大于 0 且不超过 1，默认 0.85；它是上限语义——大窗口时约 85% 就是实际触发点，较小窗口可能提前触发以留出摘要空间。内部按模型窗口用 `computeThresholds()` 算 warn/auto/hard 三级阈值，旧键 `model.chatCompression.contextPercentageThreshold` 已移除并被静默忽略。另有截图触发：`model.chatCompression.enableScreenshotTrigger`（默认 `true`）开启后，历史中工具返回的图片数达到 `screenshotTriggerThreshold`（默认 20）即触发一次自动压缩，与 token 占用无关，压缩会重置该计数因而不会立刻再次触发。官方设置文档没有 Subagent 级压缩阈值键，同版本 Subagent 文档也未描述 Subagent 的压缩行为。 |
| 保存与保留 | 压缩检查点写入会话记录，恢复会话时一并加载。自动压缩后恢复的最近文件数由 `model.chatCompression.maxRecentFilesToRetain`（默认 5，环境变量 `QWEN_COMPACT_MAX_RECENT_FILES`）、最近图片数由 `maxRecentImagesToRetain`（默认 3，`QWEN_COMPACT_MAX_RECENT_IMAGES`）控制，`0` 表示不恢复。 |
| 适用界面 | 本页以交互式 TUI 为主；Headless 与 ACP 只有在对应命令注册或 CLI 参数存在时才单独列出。 |
| 条件与边界 | 手动摘要指令有长度限制；`/compress-fast` 不等价于 AI 摘要，可能直接丢弃旧工具细节。截图触发只统计工具结果里返回的图片，不含用户粘贴的图片，`QWEN_COMPACT_SCREENSHOT_TRIGGER` 与 `QWEN_COMPACT_SCREENSHOT_THRESHOLD` 可分别覆盖开关与阈值。`context.clearContextOnIdle.*` 是空闲时清理旧工具结果的另一种机制，不属于摘要压缩。 |
| 证据状态 | 官方确认 |
| 来源 | [Qwen Code v0.25.1-preview.1 命令文档（`/compress`、`/compress-fast` 与 `/model --compaction`）](https://github.com/QwenLM/qwen-code/blob/683f3f063aa05c67c339a70fbc740f08c006f9de/docs/users/features/commands.md)、[Qwen Code v0.25.1-preview.1 设置文档（`context.autoCompactThreshold`、`compactionModel` 与 `model.chatCompression.*`）](https://github.com/QwenLM/qwen-code/blob/683f3f063aa05c67c339a70fbc740f08c006f9de/docs/users/configuration/settings.md)、[Qwen Code v0.25.1-preview.1 Subagent 文档（未描述 Subagent 压缩阈值）](https://github.com/QwenLM/qwen-code/blob/683f3f063aa05c67c339a70fbc740f08c006f9de/docs/users/features/sub-agents.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/compact [instruction]`；`loop_control.reserved_context_size` 触发自动压缩 |
| 入口与切换 | `/compact [instruction]`，可说明摘要应保留的主题；官方命令表把它标为非「随时可用」——会话正在流式输出或压缩上下文时执行会被拦截，需先按 `Esc` 或 `Ctrl-C` 中断。 |
| 保存位置 | 会话位于 `$KIMI_CODE_HOME/sessions/<workDirKey>/<sessionId>/`，默认数据根为 `~/.kimi-code`；元数据在 `state.json`，消息和工具事件在 `agents/*/wire.jsonl`。 |
| 具体行为 | 总结并压缩当前对话历史，释放 token 空间后继续同一会话。 |
| 状态范围 | 作用于当前会话上下文；不创建新会话，也不回滚代码。 |
| 自动行为 | 官方会话指南写明对话变长时在上下文接近窗口上限时自动压缩历史消息。`[loop_control] reserved_context_size` 指定为模型输出预留的 token 数，上下文窗口剩余量低于该值即触发自动压缩（文档未给默认值，示例配置写 `50000`）；`compaction_max_attempts`（默认 5）是压缩请求失败后的最大总尝试次数，含首次尝试。`[subagent]` 段只有 `timeout_ms`，官方配置文档没有 Subagent 级压缩阈值。 |
| 保存与保留 | 压缩结果进入会话事件流，恢复时按压缩后的上下文继续。 |
| 适用界面 | 本页以交互式 TUI 和 `kimi` CLI 为主；只在 Web UI 中不同的行为会单独注明。 |
| 条件与边界 | 最后一次压缩之前的提示词不能再通过 `/undo` 撤销。`loop_control` 只有 `max_steps_per_turn`（`KIMI_LOOP_MAX_STEPS_PER_TURN`）与 `max_attempts_per_step`（`KIMI_LOOP_MAX_ATTEMPTS_PER_STEP`）有环境变量覆盖，`reserved_context_size` 与 `compaction_max_attempts` 没有；`[experimental] micro_compaction`（清理较旧的大型工具结果）在当前官方配置文档里整段被注释掉，不按已公布能力记录。 |
| 证据状态 | 官方确认 |
| 来源 | [Kimi Code current sessions](https://github.com/MoonshotAI/kimi-code/blob/6b72345f8bb03487e3bcc05b541e65484818428c/docs/zh/guides/sessions.md)、[Kimi Code current slash commands](https://github.com/MoonshotAI/kimi-code/blob/7c919f0376c0331d0d057ef3643c7adcc2c55802/docs/zh/reference/slash-commands.md)、[Kimi Code current configuration](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/configuration/config-files.md)、[Kimi Code 自动压缩配置（`loop_control.reserved_context_size`、`compaction_max_attempts` 与只有 `timeout_ms` 的 `[subagent]`）](https://github.com/MoonshotAI/kimi-code/blob/c7dd84124a00d2dc1a68fbbc3e54b1095ee9ac23/docs/zh/configuration/config-files.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/compact [instructions]`；自动压缩阈值未公开 |
| 入口与切换 | `/compact [instructions]` 是可在 TUI 和 Headless 使用的 Prompt 命令，官方说明逐字为 “Compress context to free up space.”；`/context-window`（说明为 “Set the context window.”）与 `/model` 面板调整的是模型上下文窗口大小，不是压缩阈值。 |
| 保存位置 | 公开 TUI 文档未列出固定的会话存储目录；SDK 消息与 Hook 上下文提供 `session_id` 和 `transcript_path`。 |
| 具体行为 | 总结当前会话以压缩上下文；附加文字作为摘要指令。 |
| 状态范围 | 作用于当前会话上下文，不等同于 `/clear` 新建空上下文。官方 Subagent 页写每个 Subagent 有自己的对话上下文、系统提示词、工具注册表、transcript 与压缩流程，中间搜索和推理不直接进入主会话。 |
| 自动行为 | 官方术语表把 Compaction 定义为对话过长时自动压缩历史消息以留在上下文窗口内，How Task Execution Works 页写明上下文窗口有限、对话很长时用 Compact 一类机制管理上下文；公开设置参考没有自动压缩阈值或开关配置键（只有控制工具输出显示的 `ui.compactToolOutput`），具体触发阈值记为未确认。Release Notes 记 CLI 1.1.31（2026-08-26）修复 “Fixed auto-compaction not being triggered”、CLI 1.1.66（2026-10-08）修复压缩后使用 `/btw` 影响 TUI 状态栏上下文占用计算，两条都没有公布阈值数值。 |
| 保存与保留 | 压缩后的会话仍可通过 `/resume` 继续；公开命令页未说明原始消息保留格式。Release Notes 记 CLI 1.1.29（2026-08-24）修复压缩后无法 fork 与回退历史消息。 |
| 适用界面 | 本页以 Qoder CLI TUI 为主；只在 Agent SDK 提供的能力会明确标为 SDK 条件项。 |
| 条件与边界 | Qoder 桌面端另有 Smart Context Control 阈值提示；本页不把桌面端阈值直接套用到 CLI。Subagent 页只说明各 Subagent 有独立压缩流程，没有给出 Subagent 级阈值配置。 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference)、[Qoder CLI Glossary（Compaction 定义）](https://docs.qoder.com/cli/glossary)、[Qoder CLI How Task Execution Works（上下文窗口与 Compact 机制）](https://docs.qoder.com/cli/how-it-works)、[Qoder CLI Subagent](https://docs.qoder.com/en/cli/subagent)、[Qoder CLI model configuration](https://docs.qoder.com/en/cli/model)、[Qoder CLI 设置、环境变量与文件路径参考（未列出 `security.crossSessionInbound` 与 `general.dialogExpiry`）](https://docs.qoder.com/cli/settings-reference)、[Qoder CLI Release Notes（跨会话消息、`/loop`、`/crontab`、任务预算与 Hook 失败、`/hooks` GA 条目的版本时间线）](https://docs.qoder.com/release-notes/qoder-cli) |

## 官方来源

- [Claude Code Manage sessions](https://code.claude.com/docs/en/sessions)
- [Claude Code Context window](https://code.claude.com/docs/en/context-window)
- [Claude Code Checkpointing](https://code.claude.com/docs/en/checkpointing)
- [Claude Code Commands](https://code.claude.com/docs/en/commands)
- [Claude Code model configuration](https://code.claude.com/docs/en/model-config)
- [Claude Code settings reference](https://code.claude.com/docs/en/settings-reference)
- [Claude Code environment variables](https://code.claude.com/docs/en/env-vars)
- [Claude Code CLI reference（`--autocompact` 与 `--agents`）](https://code.claude.com/docs/en/cli-reference)
- [Claude Code Subagents](https://code.claude.com/docs/en/sub-agents)
- [Claude Code v2.1.296 Subagent `autoCompactWindow` 更新日志](https://github.com/anthropics/claude-code/blob/2301018b1f61073c501a8e7a4813ef48c239163b/CHANGELOG.md)
- [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)
- [Codex Advanced Configuration](https://learn.chatgpt.com/docs/config-file/config-advanced)
- [Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)
- [Qwen Code v0.25.1-preview.1 命令文档（`/compress`、`/compress-fast` 与 `/model --compaction`）](https://github.com/QwenLM/qwen-code/blob/683f3f063aa05c67c339a70fbc740f08c006f9de/docs/users/features/commands.md)
- [Qwen Code v0.25.1-preview.1 设置文档（`context.autoCompactThreshold`、`compactionModel` 与 `model.chatCompression.*`）](https://github.com/QwenLM/qwen-code/blob/683f3f063aa05c67c339a70fbc740f08c006f9de/docs/users/configuration/settings.md)
- [Qwen Code v0.25.1-preview.1 Subagent 文档（未描述 Subagent 压缩阈值）](https://github.com/QwenLM/qwen-code/blob/683f3f063aa05c67c339a70fbc740f08c006f9de/docs/users/features/sub-agents.md)
- [Kimi Code current sessions](https://github.com/MoonshotAI/kimi-code/blob/6b72345f8bb03487e3bcc05b541e65484818428c/docs/zh/guides/sessions.md)
- [Kimi Code current slash commands](https://github.com/MoonshotAI/kimi-code/blob/7c919f0376c0331d0d057ef3643c7adcc2c55802/docs/zh/reference/slash-commands.md)
- [Kimi Code current configuration](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/configuration/config-files.md)
- [Kimi Code 自动压缩配置（`loop_control.reserved_context_size`、`compaction_max_attempts` 与只有 `timeout_ms` 的 `[subagent]`）](https://github.com/MoonshotAI/kimi-code/blob/c7dd84124a00d2dc1a68fbbc3e54b1095ee9ac23/docs/zh/configuration/config-files.md)
- [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference)
- [Qoder CLI Glossary（Compaction 定义）](https://docs.qoder.com/cli/glossary)
- [Qoder CLI How Task Execution Works（上下文窗口与 Compact 机制）](https://docs.qoder.com/cli/how-it-works)
- [Qoder CLI Subagent](https://docs.qoder.com/en/cli/subagent)
- [Qoder CLI model configuration](https://docs.qoder.com/en/cli/model)
- [Qoder CLI 设置、环境变量与文件路径参考（未列出 `security.crossSessionInbound` 与 `general.dialogExpiry`）](https://docs.qoder.com/cli/settings-reference)
- [Qoder CLI Release Notes（跨会话消息、`/loop`、`/crontab`、任务预算与 Hook 失败、`/hooks` GA 条目的版本时间线）](https://docs.qoder.com/release-notes/qoder-cli)

## 关联能力

- [上下文占用](./session-context-usage.md)
- [检查点与回退](./session-checkpoint.md)
- [新会话](../commands/cmd-new.md)

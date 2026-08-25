# 手动压缩

[返回会话与上下文详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=session-compress)

> 核对日期：2026-08-25

## 定义

把较长的会话历史替换或折叠为摘要，使后续模型请求释放更多上下文窗口。

## 会话结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/compact [instructions]` | 官方确认 |
| Codex | `/compact` | 官方确认 |
| Qwen Code | `/compress [instructions]` · `/compress-fast` | 源码确认 |
| Kimi Code | `/compact [instruction]` | 官方确认 |
| Qoder CLI | `/compact [instructions]` | 官方确认 |

## 比较边界

### 本页包含

- 手动压缩命令
- 自定义压缩指令
- 自动压缩触发

### 本页不包含

- 清空会话
- 删除磁盘上的原始记录
- 仅裁剪一条工具结果

## 跨产品事实

1. 五家都提供手动压缩；Claude Code、Qwen Code 和 Kimi Code 还公开说明自动压缩行为。
2. Qwen Code 另有 `/compress-fast`，它不调用模型，只移除旧工具输出和思考内容，因此与摘要压缩不是同一种处理。
3. 压缩通常是有损的上下文变换；磁盘会话记录是否保留原始消息由各产品的会话格式决定。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/compact [instructions]` |
| 入口与切换 | `/compact [instructions]`，可附加希望摘要优先保留的内容。 |
| 保存位置 | 默认保存在 `~/.claude/projects/<project>/<session-id>.jsonl`；项目名由工作目录转换得到。 |
| 具体行为 | 用摘要替换当前历史，减少后续请求的上下文占用；Checkpoint 菜单还支持从指定消息前后做定向摘要。 |
| 状态范围 | 作用于当前会话的模型上下文，不删除项目文件；根级 `CLAUDE.md` 会在压缩后重新注入。 |
| 自动行为 | 上下文接近容量时自动压缩；具体触发受模型窗口与当前上下文组成影响。 |
| 保存与保留 | 压缩后的会话可继续保存和恢复；Checkpoint 的原始消息仍保留在会话记录中供需要时参考。 |
| 适用界面 | 本页以 CLI 为准。桌面端、Web 和 VS Code 各自维护会话历史；`claude -p` 与 Agent SDK 会话可按 ID 恢复，但不出现在 CLI 选择器中。 |
| 条件与边界 | 嵌套目录的指令文件不是全部一次性重注入，而是在后续访问对应路径时重新加载。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Manage sessions](https://code.claude.com/docs/en/sessions)、[Claude Code Context window](https://code.claude.com/docs/en/context-window)、[Claude Code Checkpointing](https://code.claude.com/docs/en/checkpointing) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/compact` |
| 入口与切换 | `/compact` 压缩当前聊天上下文。 |
| 保存位置 | 本地会话记录位于 `$CODEX_HOME/sessions`，默认是 `~/.codex/sessions`；归档会话单独位于 `$CODEX_HOME/archived_sessions`。 |
| 具体行为 | 把可见聊天历史总结为更短上下文，以释放后续模型请求的 token 空间。 |
| 状态范围 | 作用于当前聊天的上下文，不修改工作区文件或创建新会话。 |
| 自动行为 | Codex 可按模型默认值或 `model_auto_compact_token_limit` 在达到阈值时自动压缩。 |
| 保存与保留 | 摘要进入当前会话；本地会话记录仍由 Codex 会话存储维护。 |
| 适用界面 | 本页区分交互式 Codex 与 `codex exec`。桌面端、IDE 和 CLI 可能随各自版本提供不同的命令集合。 |
| 条件与边界 | 可用 `compact_prompt` 或实验性提示文件覆盖压缩提示；自定义会改变摘要内容而非上下文窗口大小。 |
| 证据状态 | 官方确认 |
| 来源 | [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)、[Codex Advanced Configuration](https://learn.chatgpt.com/docs/config-file/config-advanced) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/compress [instructions]` · `/compress-fast` |
| 入口与切换 | `/compress [instructions]`（别名 `/summarize`）生成摘要；`/compress-fast` 执行无模型快速压缩。 |
| 保存位置 | 会话按当前项目保存在 `~/.qwen/projects/<sanitized-cwd>/chats/<sessionId>.jsonl`。 |
| 具体行为 | `/compress` 用模型摘要替换历史；`/compress-fast` 保留消息骨架并剥离旧工具输出和思考内容。 |
| 状态范围 | 作用于当前聊天历史。自动压缩后可按配置恢复最近文件和图片引用，避免重要工作集完全丢失。 |
| 自动行为 | `context.autoCompactThreshold` 上限默认 0.85；较小窗口可能提前触发，截图数量也可单独触发自动压缩。 |
| 保存与保留 | 压缩检查点写入会话记录，恢复会话时一并加载。 |
| 适用界面 | 本页以交互式 TUI 为主；Headless 与 ACP 只有在对应命令注册或 CLI 参数存在时才单独列出。 |
| 条件与边界 | 手动摘要指令有长度限制；`/compress-fast` 不等价于 AI 摘要，可能直接丢弃旧工具细节。 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code current commands](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/commands.md)、[Qwen Code current settings](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/configuration/settings.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/compact [instruction]` |
| 入口与切换 | `/compact [instruction]`，可说明摘要应保留的主题。 |
| 保存位置 | 会话位于 `$KIMI_CODE_HOME/sessions/<workDirKey>/<sessionId>/`，默认数据根为 `~/.kimi-code`；元数据在 `state.json`，消息和工具事件在 `agents/*/wire.jsonl`。 |
| 具体行为 | 总结并压缩当前对话历史，释放 token 空间后继续同一会话。 |
| 状态范围 | 作用于当前会话上下文；不创建新会话，也不回滚代码。 |
| 自动行为 | 上下文接近窗口上限时自动压缩；配置中的 `loop_control.reserved_context_size` 为后续响应预留空间。 |
| 保存与保留 | 压缩结果进入会话事件流，恢复时按压缩后的上下文继续。 |
| 适用界面 | 本页以交互式 TUI 和 `kimi` CLI 为主；只在 Web UI 中不同的行为会单独注明。 |
| 条件与边界 | 最后一次压缩之前的提示词不能再通过 `/undo` 撤销。 |
| 证据状态 | 官方确认 |
| 来源 | [Kimi Code current sessions](https://github.com/MoonshotAI/kimi-code/blob/6b72345f8bb03487e3bcc05b541e65484818428c/docs/zh/guides/sessions.md)、[Kimi Code current slash commands](https://github.com/MoonshotAI/kimi-code/blob/7c919f0376c0331d0d057ef3643c7adcc2c55802/docs/zh/reference/slash-commands.md)、[Kimi Code current configuration](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/configuration/config-files.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/compact [instructions]` |
| 入口与切换 | `/compact [instructions]` 是可在 TUI 和 Headless 使用的 Prompt 命令。 |
| 保存位置 | 公开 TUI 文档未列出固定的会话存储目录；SDK 消息与 Hook 上下文提供 `session_id` 和 `transcript_path`。 |
| 具体行为 | 总结当前会话以压缩上下文；附加文字作为摘要指令。 |
| 状态范围 | 作用于当前会话上下文，不等同于 `/clear` 新建空上下文。 |
| 自动行为 | 当前 CLI 命令页确认压缩机制，但未公开 CLI 自动压缩的具体阈值。 |
| 保存与保留 | 压缩后的会话仍可通过 `/resume` 继续；公开命令页未说明原始消息保留格式。 |
| 适用界面 | 本页以 Qoder CLI TUI 为主；只在 Agent SDK 提供的能力会明确标为 SDK 条件项。 |
| 条件与边界 | Qoder 桌面端另有 Smart Context Control 阈值提示；本页不把桌面端阈值直接套用到 CLI。 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference) |

## 官方来源

- [Claude Code Manage sessions](https://code.claude.com/docs/en/sessions)
- [Claude Code Context window](https://code.claude.com/docs/en/context-window)
- [Claude Code Checkpointing](https://code.claude.com/docs/en/checkpointing)
- [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)
- [Codex Advanced Configuration](https://learn.chatgpt.com/docs/config-file/config-advanced)
- [Qwen Code current commands](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/commands.md)
- [Qwen Code current settings](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/configuration/settings.md)
- [Kimi Code current sessions](https://github.com/MoonshotAI/kimi-code/blob/6b72345f8bb03487e3bcc05b541e65484818428c/docs/zh/guides/sessions.md)
- [Kimi Code current slash commands](https://github.com/MoonshotAI/kimi-code/blob/7c919f0376c0331d0d057ef3643c7adcc2c55802/docs/zh/reference/slash-commands.md)
- [Kimi Code current configuration](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/configuration/config-files.md)
- [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference)

## 关联能力

- [上下文占用](./session-context-usage.md)
- [检查点与回退](./session-checkpoint.md)
- [新会话](../commands/cmd-new.md)

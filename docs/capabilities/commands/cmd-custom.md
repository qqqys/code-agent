# 自定义命令

[返回 Slash 命令详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=cmd-custom)

> 核对日期：2026-10-21

## 定义

从用户或项目文件加载自定义提示模板，并以 Slash 命令形式在 TUI 或 Headless 中执行。

## 命令对照

| 产品 | 命令摘要 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/<skill-name>` | 条件项 |
| Codex | `/<skill-name>`、`/presets` | 条件项 |
| Qwen Code | `/workflows`、`/<skill-name>`、`/<command-name>`、`/<workflow-name>` | 源码确认 |
| Kimi Code | `/<skill-name>` | 条件项 |
| Qoder CLI | `/commands`、`/<command-name>` | 官方确认 |

## 比较边界

### 本页包含

- 自定义命令文件
- 项目与用户 scope
- 命令管理入口
- Headless 可用性

### 本页不包含

- 内置命令修改
- 普通项目指令文件
- 插件的完整打包规范

## 跨产品事实

1. Claude Code、Codex 和 Kimi Code 主要通过 Skills 提供自定义命令。
2. Qwen Code 同时加载用户、项目和扩展 Skills，Markdown/TOML 命令文件，以及保存的 Workflows。
3. Qoder CLI 明确支持 `.qoder/commands/` 和 `~/.qoder/commands/`，Prompt 类型可用于 Headless。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/<skill-name>` |
| 别名 | 无公开别名 |
| 参数 | 由 Skill 定义；消息开头可连续写多个 Skill |
| 执行行为 | 自定义 Skill 可作为 Slash 命令调用，最多可在消息开头串联六个 Skill。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | Skill 文件跨会话存在 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 条件项 |
| 来源 | [Claude Code Commands](https://code.claude.com/docs/en/commands) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/<skill-name>`、`/presets` |
| 别名 | 无公开别名 |
| 参数 | 由 Skill 定义；`/presets` 不接受内联参数，菜单内 `n` 新建、`s` 从当前模型／权限／终端标题／状态行设置反向生成命令行、`e` 编辑、`d` 删除、`Esc` 关闭 |
| 执行行为 | 通过本地 Skills 扩展任务命令；main 分支的 `/presets`（源码描述 “run or save reusable prompts and slash commands”）在输入框上方打开标题为 “Presets” 的菜单，`0`–`9` 直接运行已存槽位或在空槽新建，槽位内容是一条提示词或一条 Slash 命令行，召回时按 `QueuedInputAction::ParseSlash` 走常规排队提交路径并且不改写输入框草稿。 |
| 可用模式 | 交互式 CLI；`/presets` 在 `available_during_task` 清单内因而回合运行中可用，不在 `available_in_side_conversation` 与 `available_when_thread_unavailable` 清单内，其他 Surface 未确认 |
| 保存范围 | Skill 文件跨会话存在；`/presets` 槽位写进用户配置 `~/.codex/config.toml` 的 `tui.presets.<0-9>`（每槽 `input` 上限 8000 UTF-8 字节、`label` 可选），跨会话生效且只能改写用户配置层拥有的槽位 |
| 条件与边界 | `/presets` 于 2026-10-15 由 PR #54380、#54381、#54385、#54388 合入 main，尚未进入 Release（标签 `rust-v0.163.0-alpha.10.2` 的 Slash 命令枚举没有 `Presets`），官方 Slash 命令页与配置参考都还没有列出；隐式快捷键 `leader p` 对应键位动作 `tui.keymap.chat.open_presets`，显式绑定优先 |
| 证据状态 | 条件项 |
| 来源 | [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)、[Codex `/presets` 合并提交（`dcd9e954598cd5e9f80570204896d779c60c1ecd`，PR #54380 “Add `/presets` for reusable prompts and slash commands”，2026-10-15T18:51:21Z 合入 main；提交说明逐字含 “Add a TUI picker with ten numbered preset slots, an editor, and confirmation before replacement or deletion.”、“Create presets from composer text or current model, reasoning effort, and speed settings. Run saved inputs through the normal queued submission path while preserving the composer draft.” 与 “Persist presets under `tui.presets` in the active user configuration, respecting configuration layer ownership and leaving in-memory settings unchanged when writes fail.”）](https://github.com/openai/codex/commit/dcd9e954598cd5e9f80570204896d779c60c1ecd)、[Codex `/presets` 命令定义源码（`SlashCommand::Presets`，`description` 分支逐字为 “run or save reusable prompts and slash commands”，无别名，`is_visible` 走 `_ => true`，在 `available_during_task` 的 `=> true` 分支里，但不在 `supports_inline_args`、`available_in_side_conversation` 与 `available_when_thread_unavailable` 三个 `matches!` 清单中，main HEAD `97ebf2d94d62`）](https://github.com/openai/codex/blob/97ebf2d94d62e2ff2045f3ea17b6e11eae9a21fb/codex-rs/tui/src/slash_command.rs)、[Codex 槽位持久化源码（文件头注释逐字 “Persist numbered prompts and slash commands in the active user configuration. Replace slots owned by the active user config. Clearing must not reveal a shadowed slot from another configuration layer.”；配置路径段为 `vec!["tui", "presets", <slot>]`，写入用 `ConfigEditsBuilder::for_config_path(self.local_settings.user_config_path)`，表内只有 `input` 与 `label` 两键且注释 “An explicit empty label masks labels inherited from lower layers.”，清空走 `ConfigEdit::ClearPath`；层归属判定比较 `ConfigLayerSource::User { file, .. }` 与 `user_config_path`，保存时只查最高层、清空时用 `slot_sources.any(outside_user_config)`；文案逐字为 “Preset {slot} is defined outside your user config. Edit its source configuration instead.”、“Failed to update preset {slot}: {}”、“Saved preset {slot}.” 与 “Deleted preset {slot}.”，失败与只读两条路径都调用 `restore_quick_dial_editor` 回填编辑器，main `dcd9e954598c`）](https://github.com/openai/codex/blob/dcd9e954598cd5e9f80570204896d779c60c1ecd/codex-rs/tui/src/app/quick_dials.rs)、[Codex 槽位召回、菜单与设置预填源码（`recall_quick_dial` 先查 `quick_dials_available()`、再 `dial.validate()`（失败报 “Preset {slot}: {reason}”）、发 `AppEvent::FollowTranscript` 后调用 `queue_user_message_with_options(dial.input.into(), QueuedInputAction::ParseSlash, Vec::new())`，全程不触碰 composer 因而保留草稿；数字键分支匹配字符 `0` 到 `9`，槽位已占用时先置 `input_queue.suppress_queue_autosend = true` 再发 `AppEvent::RecallQuickDial`；菜单标题 “Presets”、空态 “No presets saved. Press n to create one.”、页脚五项 `n · new`、`s · from settings`、`e · edit`、`d · delete`、`esc · close`；`QuickDialEditorTarget` 只有 `PickSlot` 与 `Slot(u8)` 两个变体，编辑器标题 “New preset” 与 “Edit preset {slot}”、占位符 “Write a prompt or slash command”、选槽弹层 “Save preset to slot”、确认弹层 “{action} preset {slot}?” 配 `Save`/`Replace`/`Delete` 三个动作与 “{}\n→ {}” 前后对照；预填弹层 “Start preset from current settings” 的四项为 “Current model”（生成 `/model <name>` 后按可用情况追加 `--reasoning=<effort>` 与 `--speed=<speed>`，缺省速度取 `standard`）、“Current permissions”（生成 `/permissions <profile_id> --approval-policy=<policy> --reviewer=<reviewer>`，profile 名经 `shlex::try_quote`）、“Current terminal title” 与 “Current status line”（共用 `status_surface_quick_dial`，条目为空时生成 `<command> --clear`，状态行另追加 `--colors` 或 `--no-colors`）；八条拒绝文案含 “The current model cannot be recalled with /model.”、“Choose an available reasoning effort with /model before saving.”、“Choose an available speed with /model before saving.”、“The approval policy cannot be recalled.”、“The permission profile name cannot be recalled.”、“Select a named permission profile with /permissions first.”、“Choose available terminal-title items with /title before saving.” 与 “Choose available status-line items with /statusline before saving.”；另有 “Images cannot be copied into a preset. Starting with empty text.”、“Linked mentions cannot be copied into a preset. Starting with empty text.”、“Presets are unavailable in this conversation.” 与 “Presets are available after startup completes.”，main `f847a4bd3c6c`）](https://github.com/openai/codex/blob/f847a4bd3c6ca3d8474a6e0dace1ed39f7ec0067/codex-rs/tui/src/chatwidget/quick_dials.rs)、[Codex 标签 `rust-v0.163.0-alpha.10.2`（2026-10-15T18:26:31Z 发布，早于 `/presets` 四个合并提交）的 Slash 命令枚举没有 `Presets` 变体，`Title`、`Statusline`、`Permissions` 与 `Keymap` 都已在该标签中存在，即 `/presets` 尚未进入 Release](https://github.com/openai/codex/blob/rust-v0.163.0-alpha.10.2/codex-rs/tui/src/slash_command.rs) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/workflows`、`/<skill-name>`、`/<command-name>`、`/<workflow-name>` |
| 别名 | 无公开别名 |
| 参数 | 由 Skill、命令文件或 Workflow 定义；Workflow 可接收 JSON 或纯文本参数 |
| 执行行为 | 用户、项目和扩展 Skill 按 Skill 名注册；`commands/` 下的 Markdown/TOML 文件按路径注册；启用 Workflows 后，保存的 Workflow 也按名称注册。 |
| 可用模式 | Skill 与命令文件支持交互式、非交互式、ACP；保存的 Workflow 命令仅交互式 |
| 保存范围 | 定义文件跨会话存在，Workflow 运行状态属于相应会话 |
| 条件与边界 | bare mode 不自动发现；项目命令和 Workflow 受 Folder Trust 约束；Workflow 还需启用功能开关 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code user, project and extension Skill loader](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/packages/cli/src/services/SkillCommandLoader.ts)、[Qwen Code Markdown and TOML command loader](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/packages/cli/src/services/FileCommandLoader.ts)、[Qwen Code saved Workflow loader](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/packages/cli/src/services/saved-workflow-loader.ts) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/<skill-name>` |
| 别名 | 无公开别名 |
| 参数 | 由 Skill 定义 |
| 执行行为 | Skills 参与 Slash 命令补全，未匹配的 Slash 文本会作为普通消息发送。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | Skill 文件跨会话存在 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 条件项 |
| 来源 | [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860/docs/zh/reference/slash-commands.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/commands`、`/<command-name>` |
| 别名 | 无公开别名 |
| 参数 | 项目 `.qoder/commands/`；用户 `~/.qoder/commands/` |
| 执行行为 | 管理并执行 Markdown + YAML 定义的自定义命令。 |
| 可用模式 | 管理界面只在 TUI；Prompt 命令可用于 TUI 与 Headless |
| 保存范围 | 命令文件跨会话存在 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference) |

## 官方来源

- [Claude Code Commands](https://code.claude.com/docs/en/commands)
- [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)
- [Codex `/presets` 合并提交（`dcd9e954598cd5e9f80570204896d779c60c1ecd`，PR #54380 “Add `/presets` for reusable prompts and slash commands”，2026-10-15T18:51:21Z 合入 main；提交说明逐字含 “Add a TUI picker with ten numbered preset slots, an editor, and confirmation before replacement or deletion.”、“Create presets from composer text or current model, reasoning effort, and speed settings. Run saved inputs through the normal queued submission path while preserving the composer draft.” 与 “Persist presets under `tui.presets` in the active user configuration, respecting configuration layer ownership and leaving in-memory settings unchanged when writes fail.”）](https://github.com/openai/codex/commit/dcd9e954598cd5e9f80570204896d779c60c1ecd)
- [Codex `/presets` 命令定义源码（`SlashCommand::Presets`，`description` 分支逐字为 “run or save reusable prompts and slash commands”，无别名，`is_visible` 走 `_ => true`，在 `available_during_task` 的 `=> true` 分支里，但不在 `supports_inline_args`、`available_in_side_conversation` 与 `available_when_thread_unavailable` 三个 `matches!` 清单中，main HEAD `97ebf2d94d62`）](https://github.com/openai/codex/blob/97ebf2d94d62e2ff2045f3ea17b6e11eae9a21fb/codex-rs/tui/src/slash_command.rs)
- [Codex 槽位持久化源码（文件头注释逐字 “Persist numbered prompts and slash commands in the active user configuration. Replace slots owned by the active user config. Clearing must not reveal a shadowed slot from another configuration layer.”；配置路径段为 `vec!["tui", "presets", <slot>]`，写入用 `ConfigEditsBuilder::for_config_path(self.local_settings.user_config_path)`，表内只有 `input` 与 `label` 两键且注释 “An explicit empty label masks labels inherited from lower layers.”，清空走 `ConfigEdit::ClearPath`；层归属判定比较 `ConfigLayerSource::User { file, .. }` 与 `user_config_path`，保存时只查最高层、清空时用 `slot_sources.any(outside_user_config)`；文案逐字为 “Preset {slot} is defined outside your user config. Edit its source configuration instead.”、“Failed to update preset {slot}: {}”、“Saved preset {slot}.” 与 “Deleted preset {slot}.”，失败与只读两条路径都调用 `restore_quick_dial_editor` 回填编辑器，main `dcd9e954598c`）](https://github.com/openai/codex/blob/dcd9e954598cd5e9f80570204896d779c60c1ecd/codex-rs/tui/src/app/quick_dials.rs)
- [Codex 槽位召回、菜单与设置预填源码（`recall_quick_dial` 先查 `quick_dials_available()`、再 `dial.validate()`（失败报 “Preset {slot}: {reason}”）、发 `AppEvent::FollowTranscript` 后调用 `queue_user_message_with_options(dial.input.into(), QueuedInputAction::ParseSlash, Vec::new())`，全程不触碰 composer 因而保留草稿；数字键分支匹配字符 `0` 到 `9`，槽位已占用时先置 `input_queue.suppress_queue_autosend = true` 再发 `AppEvent::RecallQuickDial`；菜单标题 “Presets”、空态 “No presets saved. Press n to create one.”、页脚五项 `n · new`、`s · from settings`、`e · edit`、`d · delete`、`esc · close`；`QuickDialEditorTarget` 只有 `PickSlot` 与 `Slot(u8)` 两个变体，编辑器标题 “New preset” 与 “Edit preset {slot}”、占位符 “Write a prompt or slash command”、选槽弹层 “Save preset to slot”、确认弹层 “{action} preset {slot}?” 配 `Save`/`Replace`/`Delete` 三个动作与 “{}\n→ {}” 前后对照；预填弹层 “Start preset from current settings” 的四项为 “Current model”（生成 `/model <name>` 后按可用情况追加 `--reasoning=<effort>` 与 `--speed=<speed>`，缺省速度取 `standard`）、“Current permissions”（生成 `/permissions <profile_id> --approval-policy=<policy> --reviewer=<reviewer>`，profile 名经 `shlex::try_quote`）、“Current terminal title” 与 “Current status line”（共用 `status_surface_quick_dial`，条目为空时生成 `<command> --clear`，状态行另追加 `--colors` 或 `--no-colors`）；八条拒绝文案含 “The current model cannot be recalled with /model.”、“Choose an available reasoning effort with /model before saving.”、“Choose an available speed with /model before saving.”、“The approval policy cannot be recalled.”、“The permission profile name cannot be recalled.”、“Select a named permission profile with /permissions first.”、“Choose available terminal-title items with /title before saving.” 与 “Choose available status-line items with /statusline before saving.”；另有 “Images cannot be copied into a preset. Starting with empty text.”、“Linked mentions cannot be copied into a preset. Starting with empty text.”、“Presets are unavailable in this conversation.” 与 “Presets are available after startup completes.”，main `f847a4bd3c6c`）](https://github.com/openai/codex/blob/f847a4bd3c6ca3d8474a6e0dace1ed39f7ec0067/codex-rs/tui/src/chatwidget/quick_dials.rs)
- [Codex 标签 `rust-v0.163.0-alpha.10.2`（2026-10-15T18:26:31Z 发布，早于 `/presets` 四个合并提交）的 Slash 命令枚举没有 `Presets` 变体，`Title`、`Statusline`、`Permissions` 与 `Keymap` 都已在该标签中存在，即 `/presets` 尚未进入 Release](https://github.com/openai/codex/blob/rust-v0.163.0-alpha.10.2/codex-rs/tui/src/slash_command.rs)
- [Qwen Code user, project and extension Skill loader](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/packages/cli/src/services/SkillCommandLoader.ts)
- [Qwen Code Markdown and TOML command loader](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/packages/cli/src/services/FileCommandLoader.ts)
- [Qwen Code saved Workflow loader](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/packages/cli/src/services/saved-workflow-loader.ts)
- [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860/docs/zh/reference/slash-commands.md)
- [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference)

## 关联能力

- [Skills](./cmd-skills.md)
- [插件或扩展](./cmd-plugins.md)
- [自定义 Slash 命令](../extensions/extension-custom-commands.md)

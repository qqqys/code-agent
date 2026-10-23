# 配置

[返回 Slash 命令详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=cmd-config)

> 核对日期：2026-10-23

## 定义

在会话内查看、修改或诊断 CLI 的模型、界面、工具和行为设置。

## 命令对照

| 产品 | 命令摘要 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/config [key=value ...]` | 官方确认 |
| Codex | `/config`、`/debug-config` | 条件项 |
| Qwen Code | `/config <key>[=<value>]`、`/settings`、`/import-config` | 源码确认 |
| Kimi Code | `/settings` | 官方确认 |
| Qoder CLI | `/settings` | 官方确认 |

## 比较边界

### 本页包含

- 设置面板与分组
- 按 key 写配置
- 配置层诊断
- 导入配置
- 保存位置与生效时机

### 本页不包含

- 账号登录
- 权限规则完整语义
- MCP Server 独立管理

## 跨产品事实

1. 五家的配置命令分三种形态：面板式（Claude Code `/config`、Codex `/config`、Kimi Code `/settings`、Qoder CLI `/settings`）、按 key 读写式（Qwen Code `/config <key>=<value>`）与只读诊断式（Codex `/debug-config`）。
2. Codex 的 `/config` 于 2026-10-10 合入 main 分支（提交 `cc7ba3360128`，PR #52990），是 19 个条目、5 个分组、带搜索的偏好面板；此前 Codex 只有只读的 `/debug-config`，官方 Slash 命令表核对日期仍只列 `/debug-config`。
3. Kimi Code 与 Qoder CLI 的主命令都是 `/settings`，`/config` 只是别名；本仓库此前把 Qoder 记成主命令 `/config`，属记反。
4. Claude Code 与 Qwen Code 都支持在命令参数里直接写 key/value，但落点不同：Claude 的 key/value 形式还能用于 `-p` 与 Remote Control，Qwen 的 `/config` 只写用户设置且拒绝把 `tools.approvalMode` 设为 `yolo`。
5. 生效时机只有 Codex 与 Qoder 逐项标注：Codex 面板按项提示 `Saved · restart Codex to apply`，Qoder 官方 Settings 页列出需要重启的键；Claude、Qwen 与 Kimi 的官方命令文档没有给出面板改动的生效时机。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/config [key=value ...]` |
| 别名 | `/settings` |
| 参数 | `[key=value ...]`；`--help` 列出可设置键 |
| 执行行为 | 打开 Settings 界面调整主题、模型、输出风格等偏好；带一个或多个 `key=value` 时不打开界面直接设置，官方示例 `/config thinking=false`、`/config theme=dark`、`/config model=sonnet`。`/config --help` 列出它接受的键。 |
| 可用模式 | 交互式；key/value 形式也可用于非交互 `-p` 与 Claude 移动端经 Remote Control |
| 保存范围 | 写入设置供后续会话使用；官方命令页没有写明写入哪个设置文件或作用域 |
| 条件与边界 | key/value 形式不能打开需要在面板中确认的开关（官方举例 `autoContinueAtUsageLimit`），但可以关闭它；官方命令页没有给出可设置键的完整清单，只给 `--help` |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Commands](https://code.claude.com/docs/en/commands) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/config`、`/debug-config` |
| 别名 | 无公开别名 |
| 参数 | `/config` 与 `/debug-config` 都不接受参数；面板内以分组列表与搜索框操作，选项在选中行内展开 |
| 执行行为 | `/config` 打开标题为 “Configuration” 的可搜索偏好面板，标题下逐字写 “Changes save automatically; some apply after restarting Codex.”。19 个条目按 `ConfigSection::ALL` 的固定顺序分五组：Appearance（Theme、Animations、Composer stars、Tips、Status line colors、Status line fields、Terminal title fields）、Notifications（Notifications、Notify when、Test notification）、Input（Keyboard shortcuts、Start in Vim mode、Paste detection）、Sessions（Automatic recaps、Session picker layout、Resume directory）、Text selection（Copy on select、Deselect after copy、Right-click paste）。输入即搜索，占位符 “Type to search settings”，每项带 label、description 与 keywords 三个字段；页脚提示为 group、search、edit setting、close（`←`/`→` 在提示里写作 left/right）。Theme、Status line fields、Terminal title fields、Keyboard shortcuts 四项当前值显示 “Configure”，选中后移交到既有的 `/theme`、`/statusline`、`/title`、`/keymap` 编辑器。写 `config.toml` 的键为：Animations → `tui.animations`、Composer stars → `tui.effects.starfield`、Tips → `tui.show_tooltips`、Status line colors → `tui.status_line_use_colors`、Theme → `tui.theme`、Status line fields → `tui.status_line`、Terminal title fields → `tui.terminal_title`、Notifications → `tui.notifications`（经 `SetTuiNotificationsEnabled`）、Notify when（选项 Unfocused／Always；官方 Configuration reference 收录了 `tui.notification_condition`，但面板到该键的写入映射未在本次核对的源码片段中定位，记为未确认）、Keyboard shortcuts → `tui.keymap.<context>.<action>`、Start in Vim mode → `tui.vim_mode_default`、Paste detection → `tui.disable_paste_burst`（写入值与开关取反）、Automatic recaps → `tui.auto_recap`、Session picker layout → `tui.session_picker_view`（Dense／Comfortable）、Resume directory → `tui.resume_cwd`（Ask／Current directory／Session directory 对应未设置／`current`／`session`，说明行另写 “A directory passed with --cd takes precedence for that Codex session.”，远程会话下该行禁用并提示 “Requires --cd for remote sessions.”）、Copy on select → `tui.copy_on_select`（Auto／On／Off 对应 `auto`／`always`／`never`，当前值显示 “Auto · On”／“Auto · Off”／“On”／“Off”）、Deselect after copy → `tui.copy_on_select_clear_selection`、Right-click paste → `tui.right_click_paste`（当前值可显示 “Auto · On”／“Auto · Off”，出错时追加 “ · Unavailable”）。Test notification 不写配置，5 秒后发一条 “Codex notification test”，提示依次为 “Test scheduled in 5 seconds · switch to another app”、重复触发时 “A test is already scheduled · switch to another app”、失败时 “Could not send the notification test · check the terminal connection”、送达后 “Test sent to terminal · delivery depends on terminal and system settings” 或 Ghostty 聚焦时 “Test sent to terminal · Ghostty hides banners while focused; switch apps and retry”。四项按依赖置灰并给出原因：Composer stars 未开 animations 时 “Turn on animations, then restart Codex to enable composer stars.”、Notifications 在已配置按事件过滤时 “Event-specific notifications are configured. Edit them in config.toml.”、Notify when 在通知关闭时 “Turn on notifications to choose when they appear.”、Deselect after copy 在 Copy on select 关闭时 “Turn on Copy on select to deselect after copying.”；Right-click paste 的说明行在探测失败时改显示错误文本。每项保存后给出 `Saved`、`Saved · restart Codex to apply`、`Saved · applies to new composers`（Start in Vim mode）或 `Saved · another config layer or system preference overrides this value`，写失败给 `Could not save: <原因>`，写成功但重载失败给 `Saved, but could not reload: <原因>`。`/debug-config` 是另一条命令，只打印配置层与要求来源诊断（官方描述 “Print config layer and requirements diagnostics.”），不修改配置。 |
| 可用模式 | 交互式 TUI；`/config` 在回合运行中、side conversation 内与线程不可用时都不能执行（`available_during_task`、`available_in_side_conversation` 与 `available_when_thread_unavailable` 三个判定都不含 `Config`），`/debug-config` 在回合运行中与线程不可用时仍可用 |
| 保存范围 | 面板改动批量写入配置层栈解析出的用户配置文件，取不到时回落到 `codex_home` 下的 `config.toml`，写入前解析符号链接再原子覆写，保存后从磁盘重建当前工作目录的配置；`/debug-config` 只读不写 |
| 条件与边界 | 条件：`/config` 于 2026-10-10 合入 main 分支（提交 `cc7ba33601286a751477832b01de7b6f8de0dd9c`，PR #52990），核对日期尚未进入任何 Release（最新为 rust-v0.163.0-alpha.5，2026-10-10T00:26:59Z，早于该提交），官方 Slash 命令表列出的 54 个命令里没有 `/config`。命令枚举本身没有功能开关或平台门禁（`is_visible` 走 `_ => true`）。面板引入的新键 `tui.copy_on_select_clear_selection` 默认 `false`、源码注释写 “has no effect when Copy on select is off”，官方 Configuration reference、Advanced configuration 与 config-sample 三页都没有收录它，也没收录 `tui.copy_on_select`、`tui.right_click_paste`、`tui.session_picker_view`、`tui.auto_recap`、`tui.status_line_use_colors` 与 `tui.effects.starfield`。断线时本地配置编辑器仍可用；新增 activation key guard 防止按住的激活键或缓冲输入在编辑器与重连切换之间误触发动作。搜索无结果时的文案未在源码中定位，记为未确认 |
| 证据状态 | 条件项 |
| 来源 | [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)、[Codex `/config` 偏好面板合并提交（`cc7ba33601286a751477832b01de7b6f8de0dd9c`，PR #52990，2026-10-10）](https://github.com/openai/codex/commit/cc7ba33601286a751477832b01de7b6f8de0dd9c)、[Codex PR #52990（Add a searchable `/config` preferences panel to the TUI）](https://github.com/openai/codex/pull/52990)、[Codex `/config` 命令定义与可用性判定源码（`SlashCommand::Config`，描述 “configure Codex preferences”）](https://github.com/openai/codex/blob/cc7ba33601286a751477832b01de7b6f8de0dd9c/codex-rs/tui/src/slash_command.rs)、[Codex `/config` 面板设置目录源码（五个 `ConfigSection`、每项 label/description/keywords 与当前值显示）](https://github.com/openai/codex/blob/cc7ba33601286a751477832b01de7b6f8de0dd9c/codex-rs/tui/src/config_panel/mod.rs)、[Codex `/config` 面板渲染源码（标题 “Configuration”、搜索占位符 “Type to search settings”、页脚提示与选项标签）](https://github.com/openai/codex/blob/cc7ba33601286a751477832b01de7b6f8de0dd9c/codex-rs/tui/src/config_panel/render.rs)、[Codex `/config` 开关项到 `config.toml` 键的映射源码（`tui.animations`、`tui.auto_recap`、`tui.copy_on_select_clear_selection`、`tui.disable_paste_burst`、`tui.vim_mode_default`、`tui.status_line_use_colors`、`tui.show_tooltips`、`tui.effects.starfield`）](https://github.com/openai/codex/blob/cc7ba33601286a751477832b01de7b6f8de0dd9c/codex-rs/tui/src/config_panel/toggle.rs)、[Codex `/config` 面板保存提示与通知测试源码（`Saved · restart Codex to apply`、`Could not save:` 等）](https://github.com/openai/codex/blob/cc7ba33601286a751477832b01de7b6f8de0dd9c/codex-rs/tui/src/app/config_panel.rs)、[Codex 配置写入源码（`apply_blocking` 写 `codex_home` 下的 `config.toml`、符号链接解析与原子覆写）](https://github.com/openai/codex/blob/cc7ba33601286a751477832b01de7b6f8de0dd9c/codex-rs/core/src/config/edit.rs)、[Codex `tui.copy_on_select_clear_selection`、`tui.copy_on_select` 与 `tui.right_click_paste` 字段定义源码](https://github.com/openai/codex/blob/cc7ba33601286a751477832b01de7b6f8de0dd9c/codex-rs/config/src/types.rs)、[Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/config <key>[=<value>]`、`/settings`、`/import-config` |
| 别名 | 无公开别名 |
| 参数 | `/config`：无参数、`--help`、`<key>` 或 `<key>=<value>`；`/settings`：无参数；`/import-config`：`all`、`claude-code` 或 `claude-desktop --scope user\|project` |
| 执行行为 | `/config` 按 dot-path 读写单个设置（例 `general.vimMode`），补充交互式 `/settings` 编辑器：不带参数或带 `--help` 列出每个可设置键及其类型与当前值，`/config <key>` 打印当前值但布尔键改为切换，`/config <key>=<value>` 写入；只有 `boolean`、`string`、`number`、`enum` 四类能这样改，`array` 与 `object` 必须直接编辑 `settings.json`。输出中敏感值被打码，把 `tools.approvalMode` 设为 `yolo` 被拒绝。`/settings` 打开设置编辑器（官方描述 “Open settings editor”）。`/import-config` 只导入 Claude 配置中的 MCP Server，官方描述 “Import MCP servers from Claude configs”。 |
| 可用模式 | `/config` 的 `supportedModes` 为 `interactive`、`non_interactive`、`acp`；`/settings` 是交互式编辑器；官方命令文档没有给出 `/import-config` 的模式 |
| 保存范围 | `/config` 只写用户设置——源码用 `SettingScope.User`，文档写 `~/.qwen/settings.json`，不写项目设置；`/settings` 与 `/import-config` 的写入位置官方命令文档没有说明 |
| 条件与边界 | 敏感键按正则识别后打码：`apikey`、`api[_-]?key`、`secret`、行首或点分隔的 `token`、`password`、`credential`、`private[_-]?key`，以及 `baseurl`、`base_url`、`proxy`；字符串值保留前 4 个字符再接 `****`（不足 4 个字符全打码），非字符串值一律 `****`，未设置显示 `(not set)`、空字符串显示 `(empty)`。拒绝 `yolo` 的提示逐字为 “Setting tools.approvalMode to "yolo" is blocked via /config for security reasons. Edit settings.json directly if you understand the risks.” |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code v0.25.1-preview.2 命令文档（`/config` dot-path 读写、`/settings` 编辑器与 `/import-config` 只导入 Claude 的 MCP Server）](https://github.com/QwenLM/qwen-code/blob/d381509d32e62a992a344de33207d54f436bcefc/docs/users/features/commands.md)、[Qwen Code `/config` 命令源码（`supportedModes` 为 interactive/non_interactive/acp、写 `SettingScope.User`、敏感键打码与拒绝把 `tools.approvalMode` 设为 `yolo`）](https://github.com/QwenLM/qwen-code/blob/d381509d32e62a992a344de33207d54f436bcefc/packages/cli/src/ui/commands/config-command.ts) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/settings` |
| 别名 | `/config` |
| 参数 | 官方 Slash 命令文档没有为 `/settings` 或 `/update-config` 列出参数 |
| 执行行为 | 打开 TUI 内的设置面板（官方描述「打开 TUI 内的设置面板」）。另有内置 Skill 命令 `/update-config`，查看或编辑 `config.toml`（模型、供应商、权限、hooks）与 `tui.toml`（主题、编辑器、通知、自动更新）。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 官方 Slash 命令文档没有写明 `/settings` 面板写入哪个文件；`/update-config` 的作用对象是 `config.toml` 与 `tui.toml` |
| 条件与边界 | `/settings` 的「随时可用」列为「是」，会话流式输出或压缩期间也能执行；`/update-config` 属内置 Skill 命令，仅在空闲状态可用 |
| 证据状态 | 官方确认 |
| 来源 | [Kimi Code Slash 命令文档（main `c9f01f07388abc2cdca40c9c5267f58c65086710`：`/settings` 别名 `/config`「打开 TUI 内的设置面板」且随时可用，`/update-config` 编辑 `config.toml` 与 `tui.toml` 且仅空闲可用）](https://github.com/MoonshotAI/kimi-code/blob/c9f01f07388abc2cdca40c9c5267f58c65086710/docs/zh/reference/slash-commands.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/settings` |
| 别名 | `/config` |
| 参数 | 官方没有给出参数 |
| 执行行为 | 打开 Settings Panel 直接查看和调整常用配置项；官方 Slash 命令参考的描述逐字为 “Open the Settings Panel (alias `/config`).”，列在 “Configuration and UI” 分组。官方 Settings 页写 “In the Interactive interface: Run `/settings` to open the Settings Panel to directly view and adjust common configuration items.”。同一分组另有 `/security-settings`（“Configure security scan settings (provided by the built-in Security plugin).”）、`/theme`（“Switch the color theme.”）与 `/statusline`（“Configure the status bar.”）；`/shortcuts` 只查看快捷键列表，没有 `/keymap` 或 `/debug-config`。 |
| 可用模式 | TUI |
| 保存范围 | 设置分三层文件：用户 `~/.qoder/settings.json`、项目 `<project>/.qoder/settings.json`、本地 `<project>/.qoder/settings.local.json`，命令行 `--settings` 优先级最高，合并顺序为内置默认 → 用户 → 项目 → 本地 → `--settings`，`QODER_CONFIG_DIR` 可改默认配置目录；官方没有写明面板本身写入哪一层 |
| 条件与边界 | 不在官方 Conditional Commands 列表中，不受功能开关限制；官方 Settings 页写明部分键改动需重启 Qoder CLI 才生效（含 `outputStyle`、`language`、`agent`、`ui.accessibility.screenReader`、`tools.core`、`tools.exclude`、`security.folderTrust.enabled`、`security.disableYoloMode`、`security.blockGitExtensions`、`security.environmentVariableRedaction.enabled`、`mcpServers`、`mcp.allowed` 与 `mcp.excluded`），未标记的通常立即生效 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference)、[Qoder CLI Configuration Files and Application Order](https://docs.qoder.com/cli/settings) |

## 官方来源

- [Claude Code Commands](https://code.claude.com/docs/en/commands)
- [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)
- [Codex `/config` 偏好面板合并提交（`cc7ba33601286a751477832b01de7b6f8de0dd9c`，PR #52990，2026-10-10）](https://github.com/openai/codex/commit/cc7ba33601286a751477832b01de7b6f8de0dd9c)
- [Codex PR #52990（Add a searchable `/config` preferences panel to the TUI）](https://github.com/openai/codex/pull/52990)
- [Codex `/config` 命令定义与可用性判定源码（`SlashCommand::Config`，描述 “configure Codex preferences”）](https://github.com/openai/codex/blob/cc7ba33601286a751477832b01de7b6f8de0dd9c/codex-rs/tui/src/slash_command.rs)
- [Codex `/config` 面板设置目录源码（五个 `ConfigSection`、每项 label/description/keywords 与当前值显示）](https://github.com/openai/codex/blob/cc7ba33601286a751477832b01de7b6f8de0dd9c/codex-rs/tui/src/config_panel/mod.rs)
- [Codex `/config` 面板渲染源码（标题 “Configuration”、搜索占位符 “Type to search settings”、页脚提示与选项标签）](https://github.com/openai/codex/blob/cc7ba33601286a751477832b01de7b6f8de0dd9c/codex-rs/tui/src/config_panel/render.rs)
- [Codex `/config` 开关项到 `config.toml` 键的映射源码（`tui.animations`、`tui.auto_recap`、`tui.copy_on_select_clear_selection`、`tui.disable_paste_burst`、`tui.vim_mode_default`、`tui.status_line_use_colors`、`tui.show_tooltips`、`tui.effects.starfield`）](https://github.com/openai/codex/blob/cc7ba33601286a751477832b01de7b6f8de0dd9c/codex-rs/tui/src/config_panel/toggle.rs)
- [Codex `/config` 面板保存提示与通知测试源码（`Saved · restart Codex to apply`、`Could not save:` 等）](https://github.com/openai/codex/blob/cc7ba33601286a751477832b01de7b6f8de0dd9c/codex-rs/tui/src/app/config_panel.rs)
- [Codex 配置写入源码（`apply_blocking` 写 `codex_home` 下的 `config.toml`、符号链接解析与原子覆写）](https://github.com/openai/codex/blob/cc7ba33601286a751477832b01de7b6f8de0dd9c/codex-rs/core/src/config/edit.rs)
- [Codex `tui.copy_on_select_clear_selection`、`tui.copy_on_select` 与 `tui.right_click_paste` 字段定义源码](https://github.com/openai/codex/blob/cc7ba33601286a751477832b01de7b6f8de0dd9c/codex-rs/config/src/types.rs)
- [Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)
- [Qwen Code v0.25.1-preview.2 命令文档（`/config` dot-path 读写、`/settings` 编辑器与 `/import-config` 只导入 Claude 的 MCP Server）](https://github.com/QwenLM/qwen-code/blob/d381509d32e62a992a344de33207d54f436bcefc/docs/users/features/commands.md)
- [Qwen Code `/config` 命令源码（`supportedModes` 为 interactive/non_interactive/acp、写 `SettingScope.User`、敏感键打码与拒绝把 `tools.approvalMode` 设为 `yolo`）](https://github.com/QwenLM/qwen-code/blob/d381509d32e62a992a344de33207d54f436bcefc/packages/cli/src/ui/commands/config-command.ts)
- [Kimi Code Slash 命令文档（main `c9f01f07388abc2cdca40c9c5267f58c65086710`：`/settings` 别名 `/config`「打开 TUI 内的设置面板」且随时可用，`/update-config` 编辑 `config.toml` 与 `tui.toml` 且仅空闲可用）](https://github.com/MoonshotAI/kimi-code/blob/c9f01f07388abc2cdca40c9c5267f58c65086710/docs/zh/reference/slash-commands.md)
- [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference)
- [Qoder CLI Configuration Files and Application Order](https://docs.qoder.com/cli/settings)

## 关联能力

- [权限设置](./cmd-permissions.md)
- [选择模型](./cmd-model.md)
- [状态与用量](./cmd-status.md)

# 扩展系统 · 输出风格：Qwen Code 五级风格机制补录，Claude Code 与 Codex 各作废两条旧结论

日期：2026-11-07
能力字段：`extension-output-styles`（扩展系统 · 输出风格），连带修订 `docs/01-Slash命令矩阵.md` 的 Codex 与 Qwen 命令目录

## 来源

Qwen Code（坐标固定到 v0.26.9 标签提交 `600aff0592bcfc21668ca4aba95a5b20c6491b86`，Release 2026-11-06T16:07:57Z）：

- [Output Styles 功能文档 `docs/users/features/output-styles.md`（6,589 字节）](https://github.com/QwenLM/qwen-code/blob/600aff0592bcfc21668ca4aba95a5b20c6491b86/docs/users/features/output-styles.md)
- [`packages/core/src/core/output-styles.ts`（9,871 字节）](https://github.com/QwenLM/qwen-code/blob/600aff0592bcfc21668ca4aba95a5b20c6491b86/packages/core/src/core/output-styles.ts)
- [`packages/core/src/core/output-style-files.ts`（17,667 字节）](https://github.com/QwenLM/qwen-code/blob/600aff0592bcfc21668ca4aba95a5b20c6491b86/packages/core/src/core/output-style-files.ts)
- [`packages/cli/src/ui/commands/output-style-command.ts`（3,839 字节）](https://github.com/QwenLM/qwen-code/blob/600aff0592bcfc21668ca4aba95a5b20c6491b86/packages/cli/src/ui/commands/output-style-command.ts)
- [`packages/cli/src/ui/commands/output-style-utils.ts`（4,954 字节）](https://github.com/QwenLM/qwen-code/blob/600aff0592bcfc21668ca4aba95a5b20c6491b86/packages/cli/src/ui/commands/output-style-utils.ts)
- [设置参考的 `general.outputStyle` 行（400,138 字节）](https://github.com/QwenLM/qwen-code/blob/600aff0592bcfc21668ca4aba95a5b20c6491b86/docs/users/configuration/settings.md)
- [命令文档的 `/output-style` 行（79,647 字节）](https://github.com/QwenLM/qwen-code/blob/600aff0592bcfc21668ca4aba95a5b20c6491b86/docs/users/features/commands.md)
- [Headless 文档的 `### Choose an Output Style` 与 `--output-style` 旗标行（32,959 字节）](https://github.com/QwenLM/qwen-code/blob/600aff0592bcfc21668ca4aba95a5b20c6491b86/docs/users/features/headless.md)
- [扩展总览的组件清单（28,416 字节）](https://github.com/QwenLM/qwen-code/blob/600aff0592bcfc21668ca4aba95a5b20c6491b86/docs/users/extension/introduction.md)
- [VS Code 集成文档（1,482 字节）](https://github.com/QwenLM/qwen-code/blob/600aff0592bcfc21668ca4aba95a5b20c6491b86/docs/users/integration-vscode.md)
- [v0.23.0 Release](https://github.com/QwenLM/qwen-code/releases/tag/v0.23.0)、[v0.23.1 Release](https://github.com/QwenLM/qwen-code/releases/tag/v0.23.1)
- [PR #9565 提交 `c7c4dc80e0ec42daa4727fd36c54835dc297c86b`](https://github.com/QwenLM/qwen-code/commit/c7c4dc80e0ec42daa4727fd36c54835dc297c86b)、[PR #10761 提交 `d0847308f15ee2c4826c2f00e7e45d27c9d8e8a8`](https://github.com/QwenLM/qwen-code/commit/d0847308f15ee2c4826c2f00e7e45d27c9d8e8a8)

Claude Code：

- [Output styles 文档 `.md` 变体（17,182 字节）](https://code.claude.com/docs/en/output-styles.md)
- [命令参考 `.md` 变体（57,504 字节）](https://code.claude.com/docs/en/commands.md)
- [Settings reference `.md` 变体（449,263 字节）](https://code.claude.com/docs/en/settings-reference.md) 与 [Settings 概览页（45,734 字节）](https://code.claude.com/docs/en/settings.md)
- [官方更新日志（固定到 `0ed94698aa0aeee471465fc9c867c2e8434c4d68`，1,176,779 字节，最新段 `## 2.1.319`）](https://github.com/anthropics/claude-code/blob/0ed94698aa0aeee471465fc9c867c2e8434c4d68/CHANGELOG.md)

Codex：

- [配置参考（1,607,809 字节）](https://learn.chatgpt.com/docs/config-file/config-reference) 与 [Advanced configuration](https://learn.chatgpt.com/docs/config-file/config-advanced)
- [CLI Slash 命令参考（522,553 字节，标题 “Slash commands in Codex CLI”）](https://learn.chatgpt.com/docs/cli/slash-commands)
- [`codex-rs/tui/src/slash_command.rs`（rust-v0.167.0，14,226 字节）](https://github.com/openai/codex/blob/rust-v0.167.0/codex-rs/tui/src/slash_command.rs)，以及 rust-v0.154.0／v0.155.0／v0.156.0／v0.158.0／v0.162.1／v0.163.0／v0.166.0 各标签下的同一路径
- [rust-v0.155.0 Release](https://github.com/openai/codex/releases/tag/rust-v0.155.0)、[rust-v0.156.0 Release](https://github.com/openai/codex/releases/tag/rust-v0.156.0)、[rust-v0.167.0 Release](https://github.com/openai/codex/releases/tag/rust-v0.167.0)

Kimi Code（坐标 main `eb2035f3cad57cc12d4d5082ec626f7f0ea5f651`，2026-11-06T12:19:30Z；最新 stable `@moonshot-ai/kimi-code@2.5.2`，2026-11-06T07:48:19Z）：

- [配置文档（main 48,662 字节、2.5.2 标签下 47,824 字节）](https://github.com/MoonshotAI/kimi-code/blob/eb2035f3cad57cc12d4d5082ec626f7f0ea5f651/docs/zh/configuration/config-files.md)
- [Slash 命令参考（13,171 字节）](https://github.com/MoonshotAI/kimi-code/blob/eb2035f3cad57cc12d4d5082ec626f7f0ea5f651/docs/zh/reference/slash-commands.md)
- [自定义 Agent 文档（16,307 字节）](https://github.com/MoonshotAI/kimi-code/blob/eb2035f3cad57cc12d4d5082ec626f7f0ea5f651/docs/zh/customization/agents.md)、[Plugin 文档（27,123 字节）](https://github.com/MoonshotAI/kimi-code/blob/eb2035f3cad57cc12d4d5082ec626f7f0ea5f651/docs/zh/customization/plugins.md)、[主题文档（5,888 字节）](https://github.com/MoonshotAI/kimi-code/blob/eb2035f3cad57cc12d4d5082ec626f7f0ea5f651/docs/zh/customization/themes.md)

Qoder CLI：

- [Output Style 文档页（822,658 字节）](https://docs.qoder.com/cli/output-styles)、[Settings 页（855,775 字节）](https://docs.qoder.com/cli/settings)、[Slash 命令参考（833,050 字节）](https://docs.qoder.com/cli/slash-reference)、[Plugins 页（965,441 字节）](https://docs.qoder.com/cli/plugins)
- [更新日志（`docs.qoder.com/release-notes/qoder-cli` 现以 307 跳转到 `changelog.qoder.com/cli`，HTML 782,354 字节）](https://changelog.qoder.com/cli)

## 本次改动

本次单元处理 2026-11-07「浏览器账号登录」单元显式留存的待办：当时按 v0.26.9 的 `BuiltinCommandLoader.ts` 复核 Qwen 命令目录，发现加载器已注册 `/output-style`，而 `extension-output-styles` 字段的 Qwen 列仍写「官方设置与扩展文档未列出输出风格」、证据状态为未确认。本次以该字段为唯一研究单元，把五家全部重新核对一遍，结果三家结论发生变化、一家补录新命令、一家由「未确认」升级为「官方确认的无该机制」。该字段的两个未确认状态（Qwen、Kimi）全部消除。

### 一、Qwen Code：完整风格机制补录（作废旧结论「官方设置与扩展文档未列出输出风格」）

**官方文档已经存在专页。** `docs/users/features/output-styles.md`（v0.26.9 下 6,589 字节）开头逐字为 “Output styles change how Qwen Code writes its responses — the tone, the amount of narration, how much it explains — without changing what it can do. A style is a named block of instructions layered onto the built-in system prompt, and the model is reminded of the active style on every turn so it holds up over long sessions.”

**四类入口都在官方文档中。**

- Slash 命令：`commands.md`（79,647 字节）的 `/output-style` 行逐字为 “Choose the output style that shapes how responses are written”，示例列 `/output-style` (opens picker)、`/output-style Concise`、`/output-style default` (no style)。实现（`output-style-command.ts`，3,839 字节）的 `argumentHint` 为 `[Concise|Proactive|Explanatory|Learning|<custom>|default]`，`supportedModes: ['interactive', 'non_interactive', 'acp']`，无别名；交互式不带参数时返回 `{ type: 'dialog', dialog: 'output-style' }` 打开选择器，非交互与 ACP 下改为打印当前风格与可选清单。
- 设置键：`settings.md`（400,138 字节）`#### general` 表有 `general.outputStyle` 行，类型 string、默认 `undefined`，描述含 “`--output-style` overrides it for one run. Change it mid-session with `/output-style`, which also persists the choice; a hand edit to this file takes effect on the next start. Ignored in `--bare` and `--safe-mode`.”。旧记录写「设置文档无风格、personality 或语气类设置键」，据此作废。
- 命令行旗标：`headless.md`（32,959 字节）有 `### Choose an Output Style` 一节与 Configuration Options 表的 `--output-style` 行（“Output style for this run (`Concise`, `Proactive`, `Explanatory`, `Learning`, a custom style's name, or `default` for none); overrides `general.outputStyle`”）。
- 自定义目录：`~/.qwen/output-styles/<name>.md`（“Your styles, available in every project”）与 `<project>/.qwen/output-styles/*.md`（“The project's styles, read only when the workspace is trusted”）。

**五个内置取值。** `default`（不追加风格）加 `BUILT_IN_OUTPUT_STYLES` 的四个：`Concise`、`Proactive`、`Explanatory`、`Learning`，四者 `keepCodingInstructions` 全为 `true`，Concise 与 Proactive 各带自己的 `turnReminder`。`Learning` 在 headless 下被丢弃，`resolveEffectiveOutputStyle` 只在 `interactionMode === 'headless' && style.source === 'built-in' && style.name === 'Learning'` 时返回 `undefined`；源码注释明确该规则认定义而不认显示名，因此用户自写的 `Learning.md` 不受影响。

**提示词落点与每轮提醒。** `renderOutputStyleSection` 渲染为 `# Output Style: <name>` 加正文，`applyOutputStyle` 把它追加到基础提示词末尾，源码注释逐字为 “The section lands last in the stable layer — after the mandates it refines, and ahead of every context/volatile layer, so a session's prompt prefix stays stable for its whole life.”；`getOutputStyleTurnReminder` 返回 “<name> output style is active.” 加风格自带或通用的 “Remember to follow the specific guidelines for this style.”

**会话中切换是就地重建，不需重启也不需 `/clear`。** `applyOutputStyleSelection` 先 `settings.setValue(...)` 持久化，再 `config.setOutputStyle(style)` 并 `await config.getLlmClient().refreshSystemInstruction()`，源码注释逐字为 “The style lives in the stable layer of an already-bound system instruction, so it must be rebuilt for the change to reach the model.”；官方文档写 “The change applies to the running session immediately — the system prompt is rebuilt in place, so the next turn already answers in the new style — and it is persisted for future sessions.”

**保存作用域由谁拥有该键决定。** `workspaceOwnsOutputStyle` 为 `settings.isTrusted && Object.prototype.hasOwnProperty.call(settings.workspace.settings.general ?? {}, 'outputStyle')`，为真时写 Workspace 作用域、否则写 User 作用域，写入带 `{ throwOnWriteFailure: true }`；该键属于项目但 `allowWorkspaceSettingsWrite === false` 时抛 “Project output style settings are not available in this session.”。官方文档同义表述为 “If a trusted project setting currently owns `general.outputStyle`, the command updates that project setting; otherwise it updates your user setting.”。作用域与风格来源不匹配时只追加提示、不搬移写入目标（个人风格写进项目设置文件、项目风格写进用户设置各有一条跨作用域解析警告），源码注释解释原因是改写目标会被工作区值遮蔽。

**自定义风格文件的加载与防护（`output-style-files.ts`，17,667 字节）。**

- 上限：`MAX_OUTPUT_STYLE_FILE_BYTES = 25_000`（注释写它与 `LOOP_TASK_FILE_MAX_BYTES` 同界、这个尺寸已相当于每次请求约 6k token）、`MAX_OUTPUT_STYLE_NAME_LENGTH = 64`、`MAX_DERIVED_DESCRIPTION_LENGTH = 120`；读取时只读上限加一个字节，超限即停。
- frontmatter：`KNOWN_FRONTMATTER_KEYS` 只有 `name`、`description`、`keep-coding-instructions`，未知键写 debug 日志并忽略；`isFrontmatterBlock` 会区分真正的 frontmatter 与装饰性 `---` 分隔线，判定不是 frontmatter 时文本留在提示词里而不是被静默丢弃。`name` 默认取去掉 `.md` 的文件名、`default` 保留、空名或含 `\p{Cc}`/`\p{Cf}` 的名字被拒；`description` 默认取正文第一行散文（剥 Markdown 标记、经 `stripAnsiAndControl` 与去 `\p{Cf}`、压成一行并截到 120 字符），声明与派生都取不到时回退 `Custom <name> output style`；`keep-coding-instructions` 未声明时继承同名内置风格的取值、无同名内置时默认 `false`，声明值只认 true/false（字符串大小写不敏感），其他取值告警并按 `false`。
- 跳过条件：正文为空、名字非法、大于 25,000 字节、非 UTF-8 文本（`isBinary`，注释点名 PowerShell `>` 与记事本写出的 UTF-16）、整篇正文只是 HTML 注释；正文里的 HTML 注释会被 `stripHtmlComments` 剥掉，官方写 “so a note to your teammates is not sent to the model”。单个文件失败只写 debug 日志，其他文件照常加载。
- 链接防护：项目文件用 `lstat`，是符号链接即跳过；用户文件允许符号链接但 `realpath` 必须落在限定根内（设了 `QWEN_HOME` 时为该目录，否则为 `os.homedir()`，注释说明这样 dotfiles 布局仍可用）；两级都拒绝 `nlink > 1` 的硬链接，并用 `realpath` 约束以捕获被符号链接替换的祖先目录。源码注释给出的威胁模型逐字为 “`.qwen/output-styles/notes.md -> ~/.aws/credentials` is committable, survives `git clone`, and needs no user action beyond starting the CLI.”
- 优先级与顺序：`loadOutputStyleCatalog` 的胜者按 project → user → built-in 顺序取首个（即项目 > 用户 > 内置），返回顺序为内置 → 用户 → 项目，与官方“自定义风格在选择器中排在内置之后并标注来源”一致；同一目录内按文件名排序读取，与已在集合中的名字重复的后者被跳过。只在传入 `projectRoot` 且项目风格目录解析后不等于用户风格目录时才加载项目级。
- 重读时机：`loadSessionOutputStyles` 每次调用都重读，源码注释为 “re-read on every call so a file added mid-session is picked up without a restart”，官方写 “a new file needs no restart”。

**信任与模式门禁。** `projectRoot` 只在 `config.isTrustedFolder()` 为真时传入，官方另写 “Trust is checked whenever the style is used, not only when the file is read, so revoking trust mid-session stops a project style from shaping the conversation.”；`--bare` 与 `--safe-mode` 下命令直接报 “Output styles are unavailable in --bare and --safe-mode.”，官方写这两种模式 “ignore the setting and do not allow `/output-style` changes” 且 “keep the built-ins only”。

**与其他机制的边界。** 官方 `## Scope and interactions` 四条：`--system-prompt` 或 `QWEN_SYSTEM_MD` 整体替换提示词时风格与其每轮提醒都不生效（此时命令仍保存选择并提示 “It is saved but has no effect in this session because the system prompt is replaced (--system-prompt or QWEN_SYSTEM_MD).”）；“Styles apply to the main conversation only. Subagents run their own system prompts, and an arena peer inherits the session's style only when that style keeps the coding instructions — a peer is judged on the diff it produces, so it never runs with the software-engineering guidance removed.”；切换风格 “invalidates the cached prompt prefix once; after that, caching works as usual.”；结尾 “Styles adjust tone and workflow, not knowledge or permissions. For project conventions the model should always know, use context files (`QWEN.md`); for a one-off addition to the prompt, use `--append-system-prompt`.”

**扩展不携带风格。** `qwen-extension.json` 的组件字段为 `mcpServers`、`channels`、`contextFileName`、`commands`、`skills`、`agents`、`workflows` 与 `settings`，官方扩展总览（28,416 字节）没有出现 “output styles” 或 “output-styles”；核心类型 `OutputStyleSource` 虽然保留 `'extension'` 取值，但 `loadOutputStyleCatalog` 只加载内置、用户与项目三级，注释也写该取值是为将来预留。这与 Claude Code、Qoder CLI 的插件携带风格形成明确差异。

**版本时间线（全部固定到提交）。**

| 时间 | 提交或版本 | 内容 |
| --- | --- | --- |
| 2026-08-24T07:19:57Z | `c7c4dc80e0ec42daa4727fd36c54835dc297c86b`（PR #9565） | `output-styles.ts` 建立，系统提示词加入 output-style 层 |
| 2026-08-31T11:50:45Z | `ed6fc69ae9b42542f1631a60edba796d510c17d4`（PR #10282） | 每轮提醒 |
| — | PR #10283 | `general.outputStyle` 设置键与 `--output-style` 旗标 |
| 2026-09-02T02:29:14Z | `1772e14812a32917cd876cc2bd31e7d0136ee404`（PR #10683） | `/output-style` 命令、选择器与会话中切换 |
| 2026-09-03T11:03:15Z | v0.23.0（标签提交 `98a9c964158697dd5631d15a62174684ff7bbb53`） | 以上四项首次进入 stable；该标签下文档 3,407 字节、有内置风格表但没有 `## Custom styles` 一节；v0.22.3 下该文件 404 |
| 2026-09-04T15:47:08Z | `d0847308f15ee2c4826c2f00e7e45d27c9d8e8a8`（PR #10761） | `output-style-files.ts` 建立，两个自定义目录 |
| 2026-09-08T15:56:16Z | v0.23.1（标签提交 `d9331e6fcf7f8f8225a16a9ec6973f8f38f56747`） | 自定义目录首次进入 stable；该标签下文档已是 6,589 字节 |

此后 `output-styles.ts` 与 `output-style-files.ts` 再无提交（前者提交历史共 3 条、后者共 1 条），`output-style-utils.ts` 也只有上述两条，官方文档在 v0.23.1 与 v0.26.9 都是 6,589 字节，即实现与文档自 v0.23.1 起稳定。v0.23.0 发布说明另含两条 OpenTUI 修复（#10763 “route the /output-style dialog in the OpenTUI registry”、#10806 “align OpenTUI output-style behavior”）。

**Surface 边界。** 官方 VS Code 集成文档（1,482 字节）的 Features 清单只有原生 IDE 体验、自动接受编辑、文件管理、会话历史与多会话五项，没有输出风格入口；仓库 `packages/` 下是 `vscode-ide-companion`（不存在 `vscode-companion` 包），桌面端与 Web Shell 的风格入口当前一手资料未列出，因此本页仍以 CLI 为准并记明 `/output-style` 的三种 `supportedModes` 与 `--output-style` 的 Headless 归属。

### 二、Claude Code：`/output-style` 回归与 mid-session 生效，作废两条旧结论

**旧结论一「独立 `/output-style` 命令自 v2.1.73 弃用、v2.1.91 移除」已作废。** 官方命令参考（57,504 字节）现有在册行逐字为 “| `/output-style [style]` | List output styles or switch to one, for example `/output-style concise`. See Change your output style. Requires Claude Code v2.1.269 or later |”。同表对 `/pr-comments`、`/vim` 等仍保留 “Removed in v2.1.91”、“Removed in v2.1.92” 行，而 `/output-style` 行没有任何弃用或移除标注。更新日志 v2.1.269 逐字为 “Added `/output-style [name]` to list and switch output styles, including over Remote Control and in cloud and other headless sessions”；Output styles 页另写 “The command also works in non-interactive mode and Agent SDK sessions, and from the mobile app or web via Remote Control, where you can list and select only built-in styles. Requires Claude Code v2.1.269 or later.”，即那些 Surface 只能列出并选择内置风格。不带参数时 “the command lists the styles you can pick and marks the current one”。

**旧结论二「改风格后需 `/clear` 或新会话生效」已作废。** Output styles 页与 Settings reference 页都逐字写 “Before v2.1.251, the new style applied only after you ran `/clear` or started a new session.”，现行行为是 “When you switch styles mid-session, Claude uses the new style starting with your next message.”。需要区分的是风格**文件**仍只在启动时读取：“In the terminal, Claude Code reads style files when it starts, so if you create or edit one during a running session, restart Claude Code to pick up the change.”。v2.1.251 段本身没有任何输出风格条目，该版本坐标只见于两个文档页。

**旧结论三「官方文档页的内置风格清单尚未列入 Concise」已作废。** 该页首句现为 “Claude Code includes four built-in styles besides its default, and you can write your own.”，内置为 Default、Proactive、Concise、Explanatory、Learning；Concise 行描述 “Responses lead with the result and leave out preamble, narration, and recaps”，正文写 “In the Concise style, the first sentence of a response states what happened or what the answer is… Requires Claude Code v2.1.237 or later.”

**`outputStyle` 键换了文档页。** Settings 概览页（45,734 字节）已 0 次出现该键，它现在 Settings reference 页（449,263 字节）：行内容为 “Change Claude's role, tone, and output format with an output style”、分组 “Model and responses”、作用域 “Any file”、Type “string, the name of a built-in or custom output style”、Default “unset, so Claude Code uses the default style”。设置优先级为 managed → `--settings` → `.claude/settings.local.json` → `.claude/settings.json` → `~/.claude/settings.json`。

**本次另补录的细节。** 设置值大小写敏感（内置名要写 `Proactive`、`Concise`、`Explanatory`、`Learning`）而 `/output-style` 命令忽略大小写；风格作用于主对话与 fork（fork 继承父会话的完整对话与系统提示词）而 “Other subagents run their own system prompt, so styles don't change how they respond.”；要依赖 `keep-coding-instructions` 须把 `CLAUDE_CODE_SIMPLE_SYSTEM_PROMPT` 设为 `0`；VS Code 扩展自 v2.1.257 起在命令菜单提供 Output styles 选择（含自定义风格）、v2.1.261 起菜单内有 “Build a custom style” 向导可直接写出自定义风格文件并立即列出，桌面 App 没有风格菜单只能写设置文件；v2.1.286 起选择器打开时停在当前风格而不是 Default、在名字下一行显示描述、数字键不再用于选择；v2.1.295 修复了 `/model`、`/fast` 与 `/output-style` 保存设置时不询问插件 `config.set` Hook，即风格保存现在会经过插件 Hook；v2.1.283 修复了 `claude plugin validate` 放过 `outputStyles` 路径缺失或指向插件目录之外的插件。

**仍成立、未改动的部分。** 三级目录（用户 `~/.claude/output-styles`、项目 `.claude/output-styles`、受管策略目录内的 `.claude/output-styles`）加插件包内 `output-styles/`；嵌套加载 “Project output styles load from every `.claude/output-styles/` between the working directory and the repository root. When more than one of these nested directories defines a style with the same name, Claude Code uses the one closest to the working directory.”；frontmatter 四键与其默认值；`force-for-plugin` 的覆盖与“最先加载者生效”；选择保存位置 “The command and both menus save your choice to `.claude/settings.local.json` at the local project level.”

**更新日志覆盖方法。** 单次抓取只能覆盖文件头部约 10 万字符（v2.1.309–v2.1.319），因此按 11 个历史提交分段抓取同一 raw 文件，拼出 v2.1.219→v2.1.319 的连续覆盖；上面列出的 v2.1.237／v2.1.238／v2.1.257／v2.1.261／v2.1.269／v2.1.283／v2.1.286／v2.1.295／v2.1.311 九条即该区间内全部含 “output style”/“outputStyle”/“output-styles”/“Concise” 的条目。核对日期最新提交为 `0ed94698aa0aeee471465fc9c867c2e8434c4d68`（2026-11-06T17:03:45Z），文件 1,176,779 字节、最新段 `## 2.1.319`。

### 三、Codex：`personality` 降级为兼容设置，`/personality` 命令消失

**旧结论「`personality` 设定默认沟通风格、仅对宣告 `supportsPersonality` 的模型生效」已作废。** 官方配置参考（1,607,809 字节；`https://developers.openai.com/codex/config-reference` 以 308 跳转到 `learn.chatgpt.com/docs/config-file/config-reference`）该行现逐字为 “Deprecated compatibility setting. `friendly` and `pragmatic` no longer select a style. `none` omits the built-in Personality section from model instructions; explicit instruction overrides are unchanged.”，即只有 `none` 还有可观察作用。`supportsPersonality` 一词在该页任何位置都不出现。

**旧结论「`features.personality`（布尔，stable，默认开）控制 personality 选择控件是否可用」已作废。** 该行现逐字为 “Removed feature flag. Accepted for compatibility and ignored.”

**旧结论「`/personality` 可按线程或单轮覆盖」已作废。** CLI Slash 命令参考页（522,553 字节，标题 “Slash commands in Codex CLI”）不列该命令，且整页不出现 “personality” 一词，`/style`、`/output-style`、`/tone`、`/persona` 同样不存在，与外观有关的只有 `/theme`。源码侧 `codex-rs/tui/src/slash_command.rs` 的 `Personality` 变体在 rust-v0.154.0（12,532 字节）与 rust-v0.155.0（2026-09-17T23:14:43Z 发布，12,342 字节）仍存在，自 rust-v0.156.0（2026-09-22T19:51:01Z 发布，13,711 字节）起消失；rust-v0.158.0（13,710 字节）、rust-v0.162.1（13,824 字节）、rust-v0.163.0（13,926 字节）、rust-v0.166.0 与 rust-v0.167.0（均 14,226 字节）中 “personality”/“Personality” 0 次出现。移除窗口因此固定在 rust-v0.155.0 与 rust-v0.156.0 之间。`docs/01` 的 Codex 命令目录同步删掉 `/personality` 一行并加注。

**没有替代机制。** `output_style` 与 `outputStyle` 在配置参考与 Advanced configuration 页都不出现；官方仓库 `docs/` 目录 15 个文件（`CLA.md`、`agents_md.md`、`authentication.md`、`config.md`、`contributing.md`、`example-config.md`、`exec.md`、`execpolicy.md`、`getting-started.md`、`install.md`、`license.md`、`open-source-fund.md`、`sandbox.md`、`skills.md`、`slash_commands.md`）都没有 style、personality、tone、persona 或 output 相关内容，其中 `docs/config.md`（726 字节）与 `docs/slash_commands.md`（145 字节）已改成指向文档站的跳转存根。最接近的自定义文件机制是 custom prompts，官方只写 “Custom prompts appear as `/prompts:<name>` commands.”，没有给目录、格式或项目作用域。

**仍成立的部分。** 作用域为用户 `~/.codex/config.toml` 加项目 `.codex/config.toml`，且 “Codex loads project-scoped config files only when you trust the project.”；相邻但不是风格预设的键为 `model_verbosity`（“Optional GPT-5 Responses API verbosity override; when unset, the selected model/preset default is used.”，Advanced configuration 页另注明 “applies only to providers using the Responses API. Chat Completions providers will ignore the setting.”）、`model_reasoning_summary`（“Select reasoning summary detail or disable summaries entirely.”，取值 `auto | concise | detailed | none`——本次特意记明它的 `concise` 是推理摘要详略档位而不是输出风格，以免与其他三家的 `Concise` 内置风格混淆）、`developer_instructions` 与 `model_instructions_file`。核对日期最新非 alpha Release rust-v0.167.0（2026-11-06T01:40:00Z）与 rust-v0.168.0-alpha.x、rust-v0.169.0-alpha.x 的发布说明都没有风格、personality 或 tone 条目（唯一含 “styles” 的 PR #58436 “Add interactive controls and refresh inline visualization styles” 是界面可视化，与本字段无关）。

### 四、Kimi Code：由「未确认」升级为「官方确认的无该机制」，并修正一条错记

**覆盖范围。** main `eb2035f3cad57cc12d4d5082ec626f7f0ea5f651`（2026-11-06T12:19:30Z）与最新 stable `@moonshot-ai/kimi-code@2.5.2`（2026-11-06T07:48:19Z）下：配置文档 `docs/zh/configuration/config-files.md`（main 48,662 字节、2.5.2 标签 47,824 字节）没有任何表名或配置键包含 style、tone、persona、personality、verbosity 或「风格」；命令参考 `docs/zh/reference/slash-commands.md`（13,171 字节）没有 `/output-style`、`/style`、`/personality` 或 `/tone`，与外观有关的只有 `/theme`（“切换终端 UI 配色主题”）与 `/custom-theme`（配色主题，`themes.md` 5,888 字节的 token 全是界面配色）；`docs/zh` 与 `docs/en` 两个子树的完整路径清单里没有 style、tone、persona、personality、output 或 prompt 相关页面；`plugins.md`（27,123 字节）与 `agents.md`（16,307 字节）都不出现 style、风格、tone、persona 或 personality；`apps/kimi-code/CHANGELOG.md`（465,236 字节、最新段 `## 2.5.2`）近期段落没有风格条目。`/import-from-cc-codex` 行逐字为 “从 Claude Code 和 Codex 导入 instructions、skills 和 MCP 设置”，即从 Claude Code 迁移也不导入输出风格。

**修正一条错记。** 旧记录写「Plugin Agent 的 `systemPrompt` 属于 Agent 定义」。核对结果相反：`systemPrompt` 与 `systemPromptPath` 是 **plugin manifest** 字段，`plugins.md` 两行逐字为 “| `systemPrompt` | plugin 启用期间提供给 Agent 系统提示词的内联指令 |” 与 “| `systemPromptPath` | 指向 UTF-8 文本文件的 `./` 路径；同时设置 `systemPrompt` 时，文件内容拼接在内联指令之后 |”，并写明两者各限 32 KB（UTF-8 字节）、一次提示词构建所有已启用 plugin 合计上限 64 KB、超限内容被忽略并写进 diagnostics。而 `agents.md` 的自定义 Agent frontmatter 只有 `name`、`description`、`whenToUse`、`override`、`tools`、`disallowedTools` 与 `subagents` 七个字段，正文的作用是 “正文即 Agent 的系统提示词，每次构建提示词时都会作为模板渲染。”，全文没有 `systemPrompt` 这个字符串。

**补录最接近的提示词级入口（仍不计入本字段）。** `$KIMI_CODE_HOME/SYSTEM.md`（默认 `~/.kimi-code/SYSTEM.md`）在文件存在且非空期间 “整体替换内置默认 main agent 的系统提示词；但只替换提示词，描述、工具集与允许委派的 subagent 列表仍沿用内置默认值”，不读 Frontmatter、读取失败时告警并回退内置提示词、在包括交互式 TUI 会话在内的所有启动方式下生效；优先级为项目作用域中声明 `override: true` 的同名 Agent 文件与 `--agent-file` 传入的文件 > SYSTEM.md > 用户作用域 `agents/` 目录中的同名文件，用 `--agent` 选择其他 Agent 时不生效；正文按模板渲染，支持 `${skills}`、`${agents_md}`、`${cwd}`、`${cwd_listing}`、`${os}`、`${shell}`、`${now}`、`${additional_dirs_info}`、`${base_prompt}`、`${plugin_sections}` 等变量。`[identity]` 的 `name` 与 `slug` 也可用 `KIMI_CODE_IDENTITY_NAME`/`KIMI_CODE_IDENTITY_SLUG` 设置（优先级高于 `config.toml`、不写回文件），名字不含 ASCII 字母或数字时 slug 回退为 `agent`，身份在启动时解析一次且进程生命周期内不变、resume 的会话保留录制时的系统提示词，该节由 `agent-core-v2` 引擎读取。这些机制都是整体覆盖或指令注入，没有按名字选择的风格目录、也没有会话内切换入口（绑定的 Agent 即会话身份，首次绑定后不可切换），因此不构成输出风格能力。

### 五、Qoder CLI：补录 `/output-style` 命令与信任门禁，其余结论不变

**`/output-style` 不是新命令，但旧记录漏记。** 更新日志 CLI 1.1.47（September 8, 2026，小节标题 “Faster Startup and More Flexible Model Selection”）逐字为 “Added the `/output-style` command to select an output style for the current project in the interactive interface”；Slash 命令参考（833,050 字节）行描述逐字为 “Choose this project's output style for the next conversation. Run `/clear` or `/new` to apply it.”，即命令选的是当前项目的风格且要 `/clear` 或 `/new` 才应用，与 `--output-style` 的“当前会话立即生效、无需重启”不同。官方 Output Style 文档页（822,658 字节）在核对日期完全没有提到这个命令，命令只出现在 Slash 命令参考与更新日志——这是一处官方文档内部缺口。

**补录信任门禁。** Settings 页（855,775 字节）逐字为 “For security reasons, Project-Level and Local Level configurations are only applied when the current working directory is trusted. If the working directory is not trusted, Qoder CLI only loads User Level configurations and ignores `settings.json` and `settings.local.json` within the project. Folder Trust is controlled by `security.folderTrust.enabled` (enabled by default).”，因此项目级 `.qoder/output-styles/` 与项目级 `outputStyle` 都以工作目录受信任为前提。

**更新日志入口迁移。** `https://docs.qoder.com/release-notes/qoder-cli` 现以 307 跳转到 `https://changelog.qoder.com/cli`（HTML 782,354 字节，最新条目 CLI 1.1.84／November 6, 2026）；`.md` 渲染（`.../qoder-cli.md`，116,633 字节）仍停在 CLI 1.1.82／November 3, 2026，两种官方渲染继续不一致。1.1.82 至 1.1.84 都没有输出风格、personality 或 tone 条目，全文另一处 “style” 是无关的 “Improved Hook message display style in conversation flows.”

**仍成立的部分。** 目录（`~/.qoder/output-styles/`、`<project>/.qoder/output-styles/`）、frontmatter（`name` 默认取去掉 `.md` 的文件名、`description` 默认取正文第一个非标题行）、解析顺序（Built-in → Plugin → User-Level → Project-Level，后者覆盖前者）、插件风格以 `plugin-name:style-name` 引用、插件强制风格优先于 `outputStyle` 且多个强制时第一个生效并记录警告、`outputStyle` 需重启而 `--output-style` 不需重启、以及“官方始终没有公布完整内置风格清单（只写 “Built-in style: Preset styles provided with Qoder CLI.” 并以 `concise` 为唯一示例）”。插件携带风格经 Plugins 页（965,441 字节）复核仍成立：目录约定树含 `output-styles/`、约定表映射为 “Custom output styles”，manifest 可用 camelCase 的 `outputStyles` 显式声明以覆盖目录约定或使用内联内容。

## 比较变更

| 产品 | 原结论 | 新结论 | 证据状态变化 |
| --- | --- | --- | --- |
| Claude Code | `/config` Output style · `outputStyle` · `.claude/output-styles/` 自定义 · v2.1.237 新增内置 Concise | `/output-style [style]`（v2.1.269 起在册）· `/config` Output style · `outputStyle` · `.claude/output-styles/` 自定义 · 内置 Default/Proactive/Concise/Explanatory/Learning | 官方确认（不变，但三条子结论作废重写） |
| Codex | 条件：`personality`（`none`/`friendly`/`pragmatic`）· `/personality`；仅适用宣告 `supportsPersonality` 的模型 | 无风格预设：`personality` 已降级为兼容设置（`friendly`/`pragmatic` 不再选风格、`none` 只省略内置 Personality 段）· `features.personality` 为已移除开关 · `/personality` 自 rust-v0.156.0 起不在枚举中 | 条件项 → 官方确认 |
| Qwen Code | 官方设置与扩展文档未列出输出风格 | `/output-style`（v0.23.0 起）· `general.outputStyle` · `--output-style` · `~/.qwen/output-styles/` 与 `<project>/.qwen/output-styles/` 自定义（v0.23.1 起）· 扩展不携带风格 | 未确认 → 官方确认 |
| Kimi Code | 官方配置文档未列出输出风格；`[identity]` 仅改自称与协议标识 | 无风格预设机制：官方文档、`config.toml` 键与命令表都没有风格项；最接近的是 `SYSTEM.md` 整体覆盖系统提示词与 plugin `systemPrompt` | 未确认 → 官方确认 |
| Qoder CLI | `outputStyle` · `--output-style` · `~/.qoder/output-styles/` 自定义 · 插件风格 | `/output-style`（CLI 1.1.47 起）· `outputStyle` · `--output-style` · `~/.qoder/output-styles/` 自定义 · 插件 `output-styles/` | 官方确认（不变，补录命令与信任门禁） |

跨产品事实由 5 条改写为 7 条：完整的风格机制只有三家（Claude Code、Qwen Code、Qoder CLI）；插件携带风格只有两家（Qwen 扩展不携带）；会话中切换的生效时机三家不同（Qwen 就地重建系统提示词、Claude 自 v2.1.251 起下一条消息生效、Qoder 需 `/clear` 或 `/new` 且改配置还要重启）；自定义风格文件的重读时机不同（Qwen 每次重读无需重启、Claude 只在启动时读取）；内置风格名高度重合但各自独立实现；风格都只作用于主对话；项目级风格与项目级配置都以工作区信任为前提。`excludes` 增加一条「整体替换系统提示词的入口（`--system-prompt`、`QWEN_SYSTEM_MD`、`SYSTEM.md`、`model_instructions_file`）」，`excludes` 中原有的「Agent 定义中的 systemPrompt」改为「Agent 定义中的系统提示词」以免与 Kimi 的 plugin manifest 字段混淆。

## 影响文件

- `site/data.js`：`extension-output-styles` 一行的五列全部改写；新增 29 个来源（Claude 4 个：`claude-output-styles-recheck`、`claude-commands-output-style-row`、`claude-settings-reference-outputstyle`、`claude-output-styles-changelog-0ed9469`；Codex 4 个：`codex-personality-deprecated`、`codex-cli-slash-commands-recheck`、`codex-personality-enum-removal`、`codex-config-advanced-verbosity`；Qwen 13 个：`qwen-output-styles-doc`、`qwen-output-styles-core`、`qwen-output-style-files-src`、`qwen-output-style-command-src`、`qwen-output-style-utils-src`、`qwen-output-styles-settings-row`、`qwen-output-styles-commands-row`、`qwen-output-styles-headless`、`qwen-output-styles-extension-intro`、`qwen-output-styles-v0230-release`、`qwen-output-styles-v0231-release`、`qwen-output-style-layer-commit`、`qwen-vscode-integration-current`；Kimi 5 个：`kimi-config-files-eb2035f`、`kimi-commands-eb2035f`、`kimi-agents-system-md`、`kimi-plugins-system-prompt`、`kimi-themes-eb2035f`；Qoder 3 个：`qoder-output-style-command-1147`、`qoder-output-style-slash-row`、`qoder-settings-output-style-row`），来源总数由 1,039 增至 1,068；既有来源零删改，被其他字段共享的 `qwen-settings-current`、`qwen-extension-intro-current`、`kimi-config-files-current`、`kimi-commands-current`、`codex-config-reference`、`qoder-settings`、`claude-output-styles`、`claude-concise-v237` 坐标不动；`updatedAt` 维持 2026-11-07，能力字段总数维持 115。
- `site/extension-details.js`：`extension-output-styles` 的 `excludes` 由 4 条增至 5 条、`facts` 由 5 条改写为 7 条，五家记录的九个维度全部重写；Qwen 记录显式给出 `status: '官方确认'`（否则按 profile 默认落到「源码确认」），其余四家由取值自动推导为「官方确认」。
- `docs/01-Slash命令矩阵.md`：Codex 命令目录删除 `/personality` 一行（51 → 50 个），并新增一段说明其移除坐标（rust-v0.155.0 → rust-v0.156.0）、官方配置参考的现行措辞与本次只处理该字段、其余目录漂移留作后续单元；Qwen 段落把上次留存的「`/commit` 与 `/output-style` 都待处理」拆成两段，`/output-style` 记明完整版本时间线并链接到能力详情页，`/commit` 仍留待 Git 操作字段。
- `docs/05-扩展系统矩阵.md`、`docs/capabilities/extensions/`：由 `npm run generate` 重新生成。
- `docs/09-版本与证据.md`：五家核对日期全部推到 2026-11-07，五行「主要材料」各追加一段本次复核记录；「官方来源」表五行的「扩展系统」列共追加 30 个链接（Claude 4、Codex 4、Qwen 13、Kimi 5、Qoder 4）。
- `README.md`：核对日期已是 2026-11-07、能力字段总数维持 115，本次无需改动。
- `updates/README.md`：新增本次索引行。

## 本次发现但未处理

- **Codex CLI 命令目录整体漂移**：官方 CLI Slash 命令参考页（522,553 字节）现列出 `/daybreak`、`/voice`、`/app`、`/btw`、`/quit`、`/tui`、`/recap`、`/cd`、`/pwd`、`/cwd`、`/worktree`、`/daemon`、`/warnings`、`/agents`、`/subagents` 等 `docs/01` 尚未收录的命令，而 `docs/01` 记的 `/agent` 在该页写作 `/agents`。属整表刷新，需要单独一个单元按官方页与 `slash_command.rs` 枚举双向核对。
- **Qwen `/commit`**：`docs/06-任务执行与Git矩阵.md` 的 Git 操作行 Qwen 列仍是 `run_shell_command` · `/diff`，未反映 v0.26.9 已注册的 `/commit`（“Create a git commit with an AI-drafted message”，仅交互式）。
- **Claude Code v2.1.319 的其余条目**：auto mode 服务端裁决改造（`CLAUDE_CODE_AUTO_MODE_SERVER` 在关闭遥测或功能标志时的新语义、`claude -p` 在被拒时退出码由 0 改为 1）属审批自动审查与非交互审批字段；MCP tasks 终端后台化与 `CLAUDE_CODE_DISABLE_MCP_TASK_BACKGROUND` 属 MCP 与后台任务字段；`permissions.denyInsteadOfPrompting` 属交互审批字段；`CLAUDE_CODE_DISABLE_FEATURE_FLAGS` 与 `CLAUDE_CODE_LOOP_KEEPALIVE` 属定时任务与循环字段；`/tasks` 的 “Earlier in this session” 行属运行中会话列表字段；`/usage` 的当日/当周/当月支出属状态与用量字段。
- **Kimi Code `docs/zh` 与 `docs/en` 子树清单**只用于确认没有风格相关页面，没有逐页复核其他能力；`apps/kimi-code/CHANGELOG.md` 465,236 字节超出单次抓取窗口，本次的「无风格条目」结论只可靠覆盖较新的部分。
- **Qoder Output Style 文档页与 Slash 命令参考的内部缺口**（文档页不提 `/output-style`）已记进条件项，但官方是否打算补齐、以及 `/output-style` 在非交互与 SDK 下是否可用，当前一手资料不足，仍记为未确认。

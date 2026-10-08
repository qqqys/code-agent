# 生命周期 Hooks

[返回扩展系统详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=extension-hooks)

> 核对日期：2026-10-08

## 定义

在提示词、工具、权限、会话、压缩或 Subagent 生命周期节点执行外部或进程内逻辑，并比较事件、Handler 类型和阻断语义。

## 扩展结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/hooks` · 多类 Handler · v2.1.287 起插件 `hooks/hooks.json` 的 `modules` 注册进程内 JS/TS 函数 Hook（mod），可改写事件并绘制界面 | 官方确认 |
| Codex | `/hooks` · command 同步或 `async: true` 后台执行 · 条件：`mcp_tool` Handler 引擎执行随 rust-v0.148.0 发布，会话运行时接入仍在 main 分支（提交 `87070a77925c`，尚未发布） | 条件项 |
| Qwen Code | `/hooks` · command/HTTP/prompt | 源码确认 |
| Kimi Code | `config.toml` · command | 官方确认 |
| Qoder CLI | `settings.json` · command/HTTP/prompt/agent | 官方确认 |

## 比较边界

### 本页包含

- Hook 配置位置与事件匹配
- command、HTTP、prompt、agent 或 MCP Tool Handler
- 插件内进程执行的 JS/TS 函数 Hook 模块（mod）与其界面绘制
- 允许、阻断、修改输入输出与记录事件

### 本页不包含

- 模型自行决定调用的普通工具
- CI 平台的远程 Workflow Hook
- 只提供说明文字而不绑定生命周期的项目指令

## 跨产品事实

1. 五家都公开了生命周期 Hook，但并不是同一实现：Kimi Code 当前独立 Hook 只执行 command；Codex 自 rust-v0.148.0 起 command Handler 支持 `async: true` 后台执行，`mcp_tool` Handler 的引擎执行也随该版发布，但 CLI 会话接入 MCP 执行器仍在 main 分支（提交 `87070a77925c`），rust-v0.148.0 运行时启动告警跳过。
2. Claude Code、Qwen Code 和 Qoder CLI 支持多种 Handler；可用事件与返回 JSON 结构仍需按各自文档配置，不能直接复制。
3. Claude Code 自 v2.1.287 起把 Hook 扩展到进程内：插件的 `hooks/hooks.json` 用 `modules` 声明一个 ES module，导出的 `register(on, options)` 注册的 JS/TS 函数在 Claude Code 自己的进程里被调用，官方把带这种模块的插件称为 mod。mod 能改写事件、直接给出结果而不执行原动作，并能在终端与桌面端 Code 页签绘制 pane 与 band。其余四家公开可配置的 Handler 都在进程外执行（Codex command 与 `mcp_tool`、Qwen command/HTTP/prompt、Kimi command、Qoder command/HTTP/prompt/agent），都不能绘制界面；Qwen 文档另列 `function` Handler，但注明由 Skill 系统内部使用、当前不作为面向终端用户的公开 API。
4. 项目 Hook 可以运行本地命令或访问网络，因此可信工作区、超时、退出码和失败时是否放行是比较中的核心边界。mod 更进一步：它以用户权限在进程内运行且不进沙箱，能批准工具调用从而绕过 `ask` 规则与 `PreToolUse` 阻断，审查方式从读脚本变成 `claude plugin validate` 输出的 `hooks:` 与 `calls:` 两行。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/hooks` · 多类 Handler · v2.1.287 起插件 `hooks/hooks.json` 的 `modules` 注册进程内 JS/TS 函数 Hook（mod），可改写事件并绘制界面 |
| 入口与配置 | `/hooks` 查看已加载配置；settings Hook 可写入设置、Plugin，或放在 Skill 与 Subagent 的前置元数据中。mod 走插件入口：会话内 `/plugin install token-chart@your-org` 或 shell 中 `claude plugin install token-chart@your-org` 安装，`/plugin` 的 Installed 页签逐个禁用或卸载，shell 安装后在已开会话里执行 `/reload-plugins`；`/plugin` 页签下方以 `1 mod active · first-mod` 这样的暗色行给出当前会话加载的 mod 数量与名称；安装前用 `claude plugin validate ./some-mod` 审计，输出的 `hooks:` 与 `calls:` 两行分别列出它处理的事件和它请求 Claude Code 执行的动作。开发时用 `--plugin-dir` 按会话加载本地目录。 |
| 文件与目录 | 用户、项目、Local、Managed settings；Plugin 使用 `hooks/hooks.json`。mod 是插件组件：同一个 `hooks/hooks.json` 顶层除 `hooks`（形状与 `settings.json` 的 `hooks` 对象一致）外还可写 `modules`，官方示例为 `{ "modules": ["./register.js"] }`，数组只放一个相对该文件的路径，指向的模块就是 mod 入口。manifest 仍是 `.claude-plugin/plugin.json`，mod 不新增强制字段；用到 `$.state` 或向 mods API 追加命名空间时，按 manifest 的 `types` 键提供 `types/index.d.ts`；`.test.ts`/`.test.tsx` 文件由 `claude plugin test` 运行。 |
| 具体行为 | settings Hook 可在工具前后、权限请求、提示提交、会话、压缩、Subagent、任务和通知等节点运行并返回控制结果。mod 的函数 Hook 在 Claude Code 自己的进程里被调用：入口模块是 ES module，导出 `register(on, options)`，`options` 携带 manifest 声明的 `userConfig` 字段值并填充默认值；每个 Hook 形如 `async ($, e, next) => next(e)`，`$` 是 mods API，`e` 是深度冻结的事件输入，`next(e)` 是中间件式的后续 Handler，跑完其余 Hook 再跑 Claude Code 自身行为并解析为事件结果。`turn.step` 与 `process.spawn` 的 Hook 是 async generator，其余是 async function。事件覆盖 `tool.call`/`tool.check`/`tool.describe`、`prompt.submit`/`fill`/`suggest`/`edit`/`compose`/`section`/`context`/`attachment`、`skill.prompt`、`attribution.text`、`command.run`/`command.describe`、`config.set`/`config.describe`、`turn.start`/`step`/`complete`、`session.start`/`end`/`compact`/`receive`/`send`/`append`/`attach`/`detach`/`measure`、`agent.offer`/`agent.spawn`、`ui.render`/`resolve`/`press`/`input`/`select`/`focus`/`scroll`/`close`/`message`、`plugin.register`、`engine.create`、`telemetry.log`/`telemetry.mark`；另有 `classic.<Event>`（如 `classic.Stop`、`classic.PostToolUse`）逐个对应 settings Hook 事件，每个 mods API 方法本身也是名为 `<namespace>.<method>` 的事件（如 `fs.read`、`model.complete`、`ui.open`）。一个 Hook 对事件可以只观察、改写，或直接给出答案而不执行原动作。 |
| 作用域与优先级 | 用户、项目、本地、托管、Plugin、Skill 与 Agent 多种作用域。mod 只能由插件携带，不能写在 `settings.json` 里；组织可用 `allowManagedModsOnly` 只放行托管来源的 mod。 |
| 扩展构成 | settings Hook 的 Handler 类型包括 command、HTTP、MCP Tool、prompt 和 agent；mod 增加进程内 JS/TS 函数模块这一类，入口文件后缀可为 `.js`、`.mjs`、`.cjs`、`.jsx`、`.ts`、`.mts`、`.cts` 或 `.tsx`。mod 除改写事件外还能绘制界面：在 transcript 旁画 pane、在提示词上方画 band，带页签、按钮和文本框，也能替换或重绘 Claude Code 自己画的部件（工具调用行、spinner、对话框），并能新增一个直接运行自己函数、不经过 Claude 回合的 `/command`；同一文件内的变量在各 Hook 之间共享。v2.1.288 增加 `$.ui.selection()`，返回全屏模式下最后选中的文本，选区落在单个 transcript 行内时一并返回该行。 |
| 加载与刷新 | settings Hook 配置在会话启动或重新加载时汇总，`/hooks` 用于检查当前生效配置。mod 随所属插件加载：`plugin.register` 在模块即将加载时触发，`engine.create` 在为该 mod 构建 mods API 时触发，`session.start` 对每个已加载 mod 在首条提示词前触发一次、该 mod 重载后再触发一次；`session.end` 在会话结束或执行 `/clear`、`/resume`、`/branch` 时触发。 |
| 适用界面 | settings Hook 的事件在终端会话、IDE 扩展、桌面端和云会话中一致触发。mod 的 Hook 在终端（含编辑器集成终端与 JetBrains 插件）、桌面端 Code 页签、VS Code 扩展聊天面板、`claude -p` 与 Agent SDK、Remote Control（在本机会话中）以及能带到云会话的插件中执行；界面绘制只出现在终端和桌面端 Code 页签，VS Code 聊天面板、`claude -p`、Agent SDK 和云会话中不渲染，桌面端还有一批仅终端可用的元素。桌面端的 WSL 会话不加载插件，因此 mod 的 Hook 与绘制都不生效。 |
| 权限与信任 | Hook 可阻止工具或提示继续；项目 Hook 属于可执行代码，需要信任其来源。mod 以用户权限在进程内运行且不进沙箱——即使开启 Bash 沙箱，mod 启动的进程也在沙箱之外；它能读写文件、启动程序、发起网络请求、读取环境变量与 API Key 等密钥、查看并改写提示词与工具调用、不询问就行动，也能批准工具调用从而绕过 `ask` 规则或 `PreToolUse` 阻断，并消耗账号用量。官方要求只安装可信作者与可信市场的 mod，并在安装前用 `claude plugin validate` 审查 `hooks:` 与 `calls:`。 |
| 条件与边界 | 事件支持的输入、输出和退出码语义不同；不能假设所有 Handler 都可用于每个事件。mod 需要 v2.1.287 及以上且默认开启；早期访问用的 `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS` 必须删除，v2.1.287 起忽略该变量，设为 `0` 也关不掉 mod。关闭方式有四种：`--safe-mode` 只在本次会话停用全部已安装 mod（同时停用其他自定义）；`~/.claude/settings.json` 的 `"disableAllHooks": true` 在所有会话停用用户安装的 mod，settings Hook 与自定义状态行一起停，组织托管的继续运行；组织设置 `allowManagedModsOnly` 停用用户安装的 mod 但保留该插件其余组件（skills、commands、agents 与 MCP servers 仍加载）；或在 `/plugin` 的 Installed 页签逐个禁用。权限提示不能被重绘。限额：单个事件里 Hook 自身执行 10 秒（不含 `next` 以及除 `$.clock.sleep` 外的 mods API 调用），`.catch` 处理器 1 秒，全部 `session.end` Hook 合计 1.5 秒；`$.process.run` 默认 30 秒、最长 10 分钟；`$.model.complete` 的 `maxTokens` 默认 1024，上限为 64000 或模型输出上限；`$.fs.read` 与 `$.fs.write` 单文件 4 MiB；`$.store` 合计 4 MiB JSON；`$.session.messages()` 只取最新 4096 条；`Text` 的单个字符串子节点 10000 字符，`Code` 与 `Markdown` 各 10000 字符，`Svg` 131072 字符，`Raster` 的 `columns` 至多 512、`rows` 至多 256，`Image` 接受 PNG 或 RGBA 字节至多 2 MiB 或一个文件路径；`$.ui.invalidate('ui.render')` 节流为每秒 10 次（终端中可见 pane、展开的 band 与提示词下方 hint 行为每秒 30 次），更早的调用被合并；`$.ui.toast` 默认显示 4 秒，可传 `{ timeoutMs }`；command、tool、subagent 类型与 pane 名称只允许字母、数字、`_` 和 `-`，最长 64 字符；`claude plugin test` 单个测试 5 秒，除非测试自行设置 `timeoutMs`。官方文档未给出 mod 数量上限。内置 mod 有 `cc-plugin-agents-md`、`cc-plugin-diff`、`cc-plugin-plugin-authoring`、`cc-plugin-sec-default`、`cc-plugin-telemetry` 与 `cc-plugin-you-should-know`，后者在 v2.1.287 以 `/plugin enable cc-plugin-you-should-know@builtin` 开启，仅第一方会话且开启遥测时可用。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Hooks](https://code.claude.com/docs/en/hooks)、[Claude Code Plugin components](https://code.claude.com/docs/en/plugins/components)、[Claude Code Mods overview](https://code.claude.com/docs/en/plugins/mods/overview)、[Claude Code Mods reference](https://code.claude.com/docs/en/plugins/mods/reference)、[Claude Code v2.1.287 Claude Mods 更新日志](https://github.com/anthropics/claude-code/blob/816ec211a648/CHANGELOG.md)、[Claude Code v2.1.288 mods `$.ui.selection()` 更新日志](https://github.com/anthropics/claude-code/blob/1c229fcd1e1e/CHANGELOG.md) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/hooks` · command 同步或 `async: true` 后台执行 · 条件：`mcp_tool` Handler 引擎执行随 rust-v0.148.0 发布，会话运行时接入仍在 main 分支（提交 `87070a77925c`，尚未发布） |
| 入口与配置 | `/hooks` 检查、信任或禁用非托管 Hook；也可直接编辑 JSON/TOML 配置。 |
| 文件与目录 | 用户 `~/.codex/hooks.json` 或 `~/.codex/config.toml`；项目 `.codex/hooks.json` 或 `.codex/config.toml`；Plugin 可携带 Hook。 |
| 具体行为 | 覆盖 PreToolUse、PermissionRequest、PostToolUse、PreCompact、PostCompact、SessionStart、SessionEnd、UserPromptSubmit、SubagentStart、SubagentStop、Stop 共 11 个事件。 |
| 作用域与优先级 | 用户、可信项目、Managed 与 Plugin 来源。 |
| 扩展构成 | 执行的 Handler 类型是 command，可同步执行或 `async: true` 后台执行（rust-v0.148.0 发布）；prompt 与 agent 配置可解析但运行时跳过；`mcp_tool` Handler（`type = "mcp_tool"`，字段 `server`/`tool`/`input`/`timeout`/`statusMessage`）调用已配置 MCP Server 的工具，`input` 必须是可表示为 TOML 的对象，引擎执行随 rust-v0.148.0 发布（PR #38705）：`${field.nested}` 占位符展开保留 JSON 类型，输出沿用 command Hook 的输出约定，且始终同步执行；SessionEnd 事件与 Managed 必选 Hook 不支持 `mcp_tool`，`timeout` 缺省 600 秒（配置识别提交 `85fc4def358b`）。 |
| 加载与刷新 | 项目 Hook 需要工作区信任；`/hooks` 展示来源并提供相应控制；`hooks/list` 以 handler 专属元数据返回 Hook，MCP Tool Hook 带 `handlerType: "mcpTool"` 及 server/tool 字段，TUI `/hooks` 浏览器展示 MCP Server 与 MCP Tool 条目（rust-v0.148.0 发布）。 |
| 适用界面 | 以 Codex CLI 为准；桌面端、IDE 扩展、Cloud 和 `codex exec` 不自动继承全部交互命令。 |
| 权限与信任 | PreToolUse 或 PermissionRequest 等事件可影响是否继续；Managed Hook 不由普通用户关闭。 |
| 条件与边界 | prompt/agent Handler 可解析但运行时跳过；async command Hook 在后台运行，不能阻断、批准或改写触发它的操作，输出在下一个安全点交付，每会话最多 8 个并发后台 Hook，未完成的随会话结束取消，SessionEnd 始终同步（rust-v0.148.0 发布，官方 Hooks 文档已列 `async` 字段）；rust-v0.148.0 的 CLI 会话运行时未提供 MCP 执行器（`codex-rs/core/src/session/mod.rs` 传 `mcp_executor: None`），`mcp_tool` Hook 启动时以 "MCP invocation is not available yet" 告警跳过；`input` 中 `${field.nested}` 占位符从事件 JSON 解析、字段缺失时该 Hook 失败；会话内实际执行在 main 分支提交 `87070a77925c`（PR #39296，尚未发布）：经会话共享 MCP 运行时执行、含 Managed Hook 配置，只允许已连接、已列入目录且策略允许的工具，不可用 Server 立即失败且不启动或重连，不经模型工具审批、不触发递归 Hook，超时受 Server 侧上限约束；main 分支提交 `d35e5495f991`（PR #39331，尚未发布）把 Hook MCP 调用改经当前连接集执行、不等待 Server 启动或重连，生效超时取 Hook 请求与 Server 工具超时的较短者；官方 Hooks 文档页仍写只有 command Handler 运行；配置文件能解析不等于能力已经运行。 |
| 证据状态 | 条件项 |
| 来源 | [Codex Hooks](https://learn.chatgpt.com/docs/hooks)、[Codex hooks MCP tool handler commit](https://github.com/openai/codex/commit/85fc4def358b7df21883e72ae8dda43a0f572f32)、[Codex hooks MCP tool runner source](https://github.com/openai/codex/blob/85fc4def358b7df21883e72ae8dda43a0f572f32/codex-rs/hooks/src/engine/mcp_runner.rs)、[Codex rust-v0.148.0 release notes (async hooks and MCP tool handler engine)](https://github.com/openai/codex/releases/tag/rust-v0.148.0)、[Codex session MCP tool hook enablement commit](https://github.com/openai/codex/commit/87070a77925cbffed8b34ddc99afaf40d56863aa)、[Codex hook MCP current-connection routing commit](https://github.com/openai/codex/commit/d35e5495f991508409ff30e38db8dbe49d565570) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/hooks` · command/HTTP/prompt |
| 入口与配置 | `/hooks` 查看和管理已加载 Hook；设置文件和 Extension 都可声明。 |
| 文件与目录 | 用户与项目 `settings.json`；Extension 可内联 Hooks、引用文件或使用默认 `hooks/hooks.json`。 |
| 具体行为 | 覆盖提示、模型、工具、权限、会话、压缩、Subagent、通知等生命周期，并能阻断或返回修改后的控制结果。 |
| 作用域与优先级 | 用户、可信项目与 Extension 来源；项目 Hook 随仓库共享。 |
| 扩展构成 | 公开文档包括 command、HTTP 与 prompt；运行时还存在 session-only 的内部 function Hook。 |
| 加载与刷新 | 启动时合并配置；Extension 热重载与 Hook 管理入口可更新当前运行时状态。 |
| 适用界面 | 以 Qwen Code CLI 为准；Headless、ACP 和 IDE Companion 中不同的加载行为会单独注明。 |
| 权限与信任 | 项目 Hook 只在可信文件夹加载；Hook 自身的命令和网络访问需要按可执行配置审查。 |
| 条件与边界 | 内部 function Hook 不是普通配置格式；公开可配置范围应以 command、HTTP 与 prompt 为准。 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code current Hooks](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/hooks.md)、[Qwen Code current Extension runtime](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/core/src/extension/extensionManager.ts) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `config.toml` · command |
| 入口与配置 | 没有独立 `/hooks` 命令；在 `~/.kimi-code/config.toml` 的 `[[hooks]]` 中配置。 |
| 文件与目录 | 独立 Hook 位于用户 `config.toml`；Plugin manifest 也可携带 Hook 配置。 |
| 具体行为 | 可监听提示、工具、权限、会话、压缩与 Subagent 等事件；退出码 2 可阻断，其他错误默认放行。 |
| 作用域与优先级 | 用户配置与已启用 Plugin；当前文档未列项目级独立 Hook 文件。 |
| 扩展构成 | 独立配置当前只有 command Handler。 |
| 加载与刷新 | 启动时读取配置；Plugin 改动通常需要 `/reload` 或新会话。 |
| 适用界面 | 以 Kimi Code CLI 为准；ACP、Web UI 和外部编辑器只在对应能力中单独列出。 |
| 权限与信任 | Hook command 在本机执行；阻断与 fail-open 语义取决于退出码。 |
| 条件与边界 | “命令表没有 `/hooks`”不等于没有 Hook 能力；Kimi 的入口是 TOML 配置。 |
| 证据状态 | 官方确认 |
| 来源 | [Kimi Code current Hooks](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/customization/hooks.md)、[Kimi Code current Plugins](https://github.com/MoonshotAI/kimi-code/blob/691ec4679ea1/docs/zh/customization/plugins.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `settings.json` · command/HTTP/prompt/agent |
| 入口与配置 | 在 User、Project 或 Local settings 中配置；当前公开页面以配置为主。 |
| 文件与目录 | `~/.qoder/settings.json`、项目 `.qoder/settings.json` 与 `.qoder/settings.local.json`；Plugin 可携带 `hooks/hooks.json`。 |
| 具体行为 | 覆盖工具、提示、权限、通知、会话、压缩与 Subagent 等节点，并按 Handler 返回结果控制流程。 |
| 作用域与优先级 | User、Project、Local 和 Plugin。 |
| 扩展构成 | command、HTTP、prompt 与 agent Handler。 |
| 加载与刷新 | 随设置和 Plugin 加载；修改后的刷新方式取决于对应配置或插件重载入口。 |
| 适用界面 | 以 Qoder CLI 为准；Agent SDK、ACP 和 Qoder IDE 中不同的入口会单独注明。 |
| 权限与信任 | 项目 Hook 只应在可信工作区启用；Hook 能阻断关键操作，但自身仍是本机可执行配置。 |
| 条件与边界 | 不同 Handler 的超时、响应字段和阻断条件不同，需要按事件文档逐项设置。 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI Hooks](https://docs.qoder.com/en/cli/hooks)、[Qoder CLI Plugins](https://docs.qoder.com/en/cli/plugins) |

## 官方来源

- [Claude Code Hooks](https://code.claude.com/docs/en/hooks)
- [Claude Code Plugin components](https://code.claude.com/docs/en/plugins/components)
- [Claude Code Mods overview](https://code.claude.com/docs/en/plugins/mods/overview)
- [Claude Code Mods reference](https://code.claude.com/docs/en/plugins/mods/reference)
- [Claude Code v2.1.287 Claude Mods 更新日志](https://github.com/anthropics/claude-code/blob/816ec211a648/CHANGELOG.md)
- [Claude Code v2.1.288 mods `$.ui.selection()` 更新日志](https://github.com/anthropics/claude-code/blob/1c229fcd1e1e/CHANGELOG.md)
- [Codex Hooks](https://learn.chatgpt.com/docs/hooks)
- [Codex hooks MCP tool handler commit](https://github.com/openai/codex/commit/85fc4def358b7df21883e72ae8dda43a0f572f32)
- [Codex hooks MCP tool runner source](https://github.com/openai/codex/blob/85fc4def358b7df21883e72ae8dda43a0f572f32/codex-rs/hooks/src/engine/mcp_runner.rs)
- [Codex rust-v0.148.0 release notes (async hooks and MCP tool handler engine)](https://github.com/openai/codex/releases/tag/rust-v0.148.0)
- [Codex session MCP tool hook enablement commit](https://github.com/openai/codex/commit/87070a77925cbffed8b34ddc99afaf40d56863aa)
- [Codex hook MCP current-connection routing commit](https://github.com/openai/codex/commit/d35e5495f991508409ff30e38db8dbe49d565570)
- [Qwen Code current Hooks](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/hooks.md)
- [Qwen Code current Extension runtime](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/core/src/extension/extensionManager.ts)
- [Kimi Code current Hooks](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/customization/hooks.md)
- [Kimi Code current Plugins](https://github.com/MoonshotAI/kimi-code/blob/691ec4679ea1/docs/zh/customization/plugins.md)
- [Qoder CLI Hooks](https://docs.qoder.com/en/cli/hooks)
- [Qoder CLI Plugins](https://docs.qoder.com/en/cli/plugins)

## 关联能力

- [插件分发](./extension-plugins.md)
- [交互审批](../security/security-approval.md)
- [Agent 独立 Hooks](../subagents/agent-hooks.md)

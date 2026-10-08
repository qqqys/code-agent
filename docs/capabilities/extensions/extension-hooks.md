# 生命周期 Hooks

[返回扩展系统详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=extension-hooks)

> 核对日期：2026-10-08

## 定义

在提示词、工具、权限、会话、压缩或 Subagent 生命周期节点执行外部或进程内逻辑，并比较事件、Handler 类型和阻断语义。

## 扩展结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/hooks` · 多类 Handler · v2.1.287 起插件 `hooks/hooks.json` 的 `modules` 注册进程内 JS/TS 函数 Hook（mod），可改写事件并绘制界面 · v2.1.295 起 command 与 HTTP Hook 可设 `onFailure: "block"`，启动失败、超时或意外退出码改为阻断 | 官方确认 |
| Codex | `/hooks` · command 同步或 `async: true` 后台执行 · 条件：`mcp_tool` Handler 引擎执行随 rust-v0.148.0 发布，会话运行时接入仍在 main 分支（提交 `87070a77925c`，尚未发布）· 失败、超时与畸形响应默认放行，只有 `PermissionRequest` 保留字段 fail closed | 条件项 |
| Qwen Code | `/hooks` · command/HTTP/prompt · 退出码 2 阻断，其他非零、HTTP 非 2xx 与超时放行；无 `onFailure` 一类失败开关 | 源码确认 |
| Kimi Code | `config.toml` · command · 退出码 2 阻断，其他非零、超时与崩溃按 fail-open 放行；无 `onFailure` 一类失败开关 | 官方确认 |
| Qoder CLI | `/hooks` · `settings.json` · command/HTTP/prompt/agent · 退出码 2 阻断，其他非零放行；无 `onFailure` 一类失败开关 | 官方确认 |

## 比较边界

### 本页包含

- Hook 配置位置与事件匹配
- command、HTTP、prompt、agent 或 MCP Tool Handler
- 插件内进程执行的 JS/TS 函数 Hook 模块（mod）与其界面绘制
- 允许、阻断、修改输入输出与记录事件
- 退出码、超时与失败时放行还是阻断（fail-open / fail-closed）

### 本页不包含

- 模型自行决定调用的普通工具
- CI 平台的远程 Workflow Hook
- 只提供说明文字而不绑定生命周期的项目指令

## 跨产品事实

1. 五家都公开了生命周期 Hook，但并不是同一实现：Kimi Code 当前独立 Hook 只执行 command；Codex 自 rust-v0.148.0 起 command Handler 支持 `async: true` 后台执行，`mcp_tool` Handler 的引擎执行也随该版发布，但 CLI 会话接入 MCP 执行器仍在 main 分支（提交 `87070a77925c`），rust-v0.148.0 运行时启动告警跳过。
2. Claude Code、Qwen Code 和 Qoder CLI 支持多种 Handler；可用事件与返回 JSON 结构仍需按各自文档配置，不能直接复制。
3. Claude Code 自 v2.1.287 起把 Hook 扩展到进程内：插件的 `hooks/hooks.json` 用 `modules` 声明一个 ES module，导出的 `register(on, options)` 注册的 JS/TS 函数在 Claude Code 自己的进程里被调用，官方把带这种模块的插件称为 mod。mod 能改写事件、直接给出结果而不执行原动作，并能在终端与桌面端 Code 页签绘制 pane 与 band。其余四家公开可配置的 Handler 都在进程外执行（Codex command 与 `mcp_tool`、Qwen command/HTTP/prompt、Kimi command、Qoder command/HTTP/prompt/agent），都不能绘制界面；Qwen 文档另列 `function` Handler，但注明由 Skill 系统内部使用、当前不作为面向终端用户的公开 API。
4. 项目 Hook 可以运行本地命令或访问网络，因此可信工作区、超时、退出码和失败时是否放行是比较中的核心边界。mod 更进一步：它以用户权限在进程内运行且不进沙箱，能批准工具调用从而绕过 `ask` 规则与 `PreToolUse` 阻断，审查方式从读脚本变成 `claude plugin validate` 输出的 `hooks:` 与 `calls:` 两行。
5. 失败时默认放行是五家的共同基线，但只有 Claude Code 给出把失败改成阻断的开关：v2.1.295 起 command 与 HTTP Hook 可写 `onFailure: "block"`，让“启动不了、超时或退出码不在预期内”的 Hook 阻断它守着的动作。Codex、Qwen Code、Kimi Code 与 Qoder CLI 的一手文档在核对日期都把非 0 非 2 退出码、超时与响应畸形记为非阻断错误并让主流程继续，也都没有 `onFailure` 一类的失败开关；Claude Code 官方 Hooks 参考与 Hooks 指南同样还没出现 `onFailure`，该键目前只有更新日志这一处一手记录。
6. 默认放行之外各有按事件的例外，方向并不一致：Claude Code 的 `WorktreeCreate` 任何非零退出码都让创建失败、`WorktreeRemove` 在目录仍存在时任何非零退出码都让移除失败、`PreModelSwitch` 上超时即阻断切换、Agent SDK 回调 Hook 在 `PreToolUse` 超时则阻断该次工具调用；Codex 的 Hooks 页只记录一处 fail closed——`PermissionRequest` 的 `updatedInput`、`updatedPermissions` 与 `interrupt` 是保留字段，今天返回它们就按关闭处理；Qoder CLI 的 `WorktreeCreate` 任何非零退出码都算失败，`ConfigChange` 在 `source` 为 `policy_settings` 时 Hook 仍触发但改动强制生效、不能阻断，而它的 Release Notes 在 CLI 1.0.29 写过 “Aligned SessionEnd hook timeout and PreToolUse fail-closed behavior with strict semantics”，Hooks 页没有展开这条 fail-closed 覆盖哪些失败形态，记为未确认；Qwen Code 的 `PermissionDenied` 与 `InstructionsLoaded` 明确写 Hook 失败只记录、不改变结果，`StopFailure`、`PostCompact`、`SessionDelete` 与 `MessageDisplay` 则是即发即忘或输出被忽略。
7. 管理入口也不对齐：Claude Code、Codex、Qwen Code 与 Qoder CLI 都有 `/hooks`（Qoder 的这一行此前被本矩阵漏记，官方 Slash 命令参考描述为 “Manage Hooks.”、Release Notes 记 CLI 1.0.8 起对所有用户可用，Hooks 页本身没有描述它），Kimi Code 没有 Hook 管理命令、入口是 `~/.kimi-code/config.toml` 的 `[[hooks]]`。
8. Kimi Code 是唯一在文档里直接给这套语义命名并写出使用边界的一家：退出码 `0` 放行、`2` 阻断、其他数字默认放行，“即使脚本报错或超时，CLI 也不会因此中断你的工作”，这种“出错就放行”的设计称为 fail-open，文档接着写“正因为 fail-open，Hooks 适合做提醒和轻量拦截，但不应作为唯一的安全防线”。它同时把事件分成可阻断与观察型：只有 `PreToolUse`、`Stop`、`UserPromptSubmit` 的返回值会影响主流程，其余事件触发后即发即忘。Claude Code 官方 Hooks 指南给出等价提醒：策略型 Hook 首次运行要盯着 non-blocking 通知，因为 `settings.json` 里路径写错会让这道闸门静默失效。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/hooks` · 多类 Handler · v2.1.287 起插件 `hooks/hooks.json` 的 `modules` 注册进程内 JS/TS 函数 Hook（mod），可改写事件并绘制界面 · v2.1.295 起 command 与 HTTP Hook 可设 `onFailure: "block"`，启动失败、超时或意外退出码改为阻断 |
| 入口与配置 | `/hooks` 查看已加载配置；settings Hook 可写入设置、Plugin，或放在 Skill 与 Subagent 的前置元数据中。mod 走插件入口：会话内 `/plugin install token-chart@your-org` 或 shell 中 `claude plugin install token-chart@your-org` 安装，`/plugin` 的 Installed 页签逐个禁用或卸载，shell 安装后在已开会话里执行 `/reload-plugins`；`/plugin` 页签下方以 `1 mod active · first-mod` 这样的暗色行给出当前会话加载的 mod 数量与名称；安装前用 `claude plugin validate ./some-mod` 审计，输出的 `hooks:` 与 `calls:` 两行分别列出它处理的事件和它请求 Claude Code 执行的动作。开发时用 `--plugin-dir` 按会话加载本地目录。 |
| 文件与目录 | 用户、项目、Local、Managed settings；Plugin 使用 `hooks/hooks.json`。mod 是插件组件：同一个 `hooks/hooks.json` 顶层除 `hooks`（形状与 `settings.json` 的 `hooks` 对象一致）外还可写 `modules`，官方示例为 `{ "modules": ["./register.js"] }`，数组只放一个相对该文件的路径，指向的模块就是 mod 入口。manifest 仍是 `.claude-plugin/plugin.json`，mod 不新增强制字段；用到 `$.state` 或向 mods API 追加命名空间时，按 manifest 的 `types` 键提供 `types/index.d.ts`；`.test.ts`/`.test.tsx` 文件由 `claude plugin test` 运行。 |
| 具体行为 | settings Hook 可在工具前后、权限请求、提示提交、会话、压缩、Subagent、任务和通知等节点运行并返回控制结果。mod 的函数 Hook 在 Claude Code 自己的进程里被调用：入口模块是 ES module，导出 `register(on, options)`，`options` 携带 manifest 声明的 `userConfig` 字段值并填充默认值；每个 Hook 形如 `async ($, e, next) => next(e)`，`$` 是 mods API，`e` 是深度冻结的事件输入，`next(e)` 是中间件式的后续 Handler，跑完其余 Hook 再跑 Claude Code 自身行为并解析为事件结果。`turn.step` 与 `process.spawn` 的 Hook 是 async generator，其余是 async function。事件覆盖 `tool.call`/`tool.check`/`tool.describe`、`prompt.submit`/`fill`/`suggest`/`edit`/`compose`/`section`/`context`/`attachment`、`skill.prompt`、`attribution.text`、`command.run`/`command.describe`、`config.set`/`config.describe`、`turn.start`/`step`/`complete`、`session.start`/`end`/`compact`/`receive`/`send`/`append`/`attach`/`detach`/`measure`、`agent.offer`/`agent.spawn`、`ui.render`/`resolve`/`press`/`input`/`select`/`focus`/`scroll`/`close`/`message`、`plugin.register`、`engine.create`、`telemetry.log`/`telemetry.mark`；另有 `classic.<Event>`（如 `classic.Stop`、`classic.PostToolUse`）逐个对应 settings Hook 事件，每个 mods API 方法本身也是名为 `<namespace>.<method>` 的事件（如 `fs.read`、`model.complete`、`ui.open`）。一个 Hook 对事件可以只观察、改写，或直接给出答案而不执行原动作。settings Hook 的退出码语义是：`0` 为成功并在 stdout 是 `{...}` 时按 JSON 解析控制结果；`2` 是阻断错误，在可阻断事件上无论是否打印 JSON 都阻断，连 JSON 里的 `permissionDecision: "allow"` 也压不过它，阻断原因取 JSON 阻断决定里的 reason、否则取 stderr；其他退出码在多数事件上不单独阻断——带通过 schema 校验的 JSON 时忽略退出码只看 JSON，JSON 校验失败或 stdout 无法解析时是非阻断错误、动作继续，stdout 是纯文本或为空时也是非阻断错误、动作继续并在 transcript 显示 `<hook name> hook error` 通知加 stderr 首行（前缀 `Failed with non-blocking status code:`）。官方明确警告：多数事件上退出码 2 是唯一能只靠代码阻断的退出码，没有合法 JSON 时退出码 1 按非阻断错误处理、动作照常继续，尽管 1 才是 Unix 惯例的失败码，策略型 Hook 要写 `exit 2`。Hook 启动不了也落在同一个非阻断桶里：脚本路径不存在或不可执行时 shell 以 127 一类退出码结束，通知带解释器的消息（例如 `Failed with non-blocking status code: /bin/sh: /path/to/hook.sh: No such file or directory`），多数事件上动作继续。HTTP Hook 的非 2xx 状态与连接失败都是非阻断错误、执行继续；MCP Tool Hook 在工具返回 `isError: true` 或此刻 Server 未连接时产生非阻断错误、执行继续。 |
| 作用域与优先级 | 用户、项目、本地、托管、Plugin、Skill 与 Agent 多种作用域。mod 只能由插件携带，不能写在 `settings.json` 里；组织可用 `allowManagedModsOnly` 只放行托管来源的 mod。 |
| 扩展构成 | settings Hook 的 Handler 类型包括 command、HTTP、MCP Tool、prompt 和 agent；mod 增加进程内 JS/TS 函数模块这一类，入口文件后缀可为 `.js`、`.mjs`、`.cjs`、`.jsx`、`.ts`、`.mts`、`.cts` 或 `.tsx`。mod 除改写事件外还能绘制界面：在 transcript 旁画 pane、在提示词上方画 band，带页签、按钮和文本框，也能替换或重绘 Claude Code 自己画的部件（工具调用行、spinner、对话框），并能新增一个直接运行自己函数、不经过 Claude 回合的 `/command`；同一文件内的变量在各 Hook 之间共享。v2.1.288 增加 `$.ui.selection()`，返回全屏模式下最后选中的文本，选区落在单个 transcript 行内时一并返回该行。 |
| 加载与刷新 | settings Hook 配置在会话启动或重新加载时汇总，`/hooks` 用于检查当前生效配置。mod 随所属插件加载：`plugin.register` 在模块即将加载时触发，`engine.create` 在为该 mod 构建 mods API 时触发，`session.start` 对每个已加载 mod 在首条提示词前触发一次、该 mod 重载后再触发一次；`session.end` 在会话结束或执行 `/clear`、`/resume`、`/branch` 时触发。 |
| 适用界面 | settings Hook 的事件在终端会话、IDE 扩展、桌面端和云会话中一致触发。mod 的 Hook 在终端（含编辑器集成终端与 JetBrains 插件）、桌面端 Code 页签、VS Code 扩展聊天面板、`claude -p` 与 Agent SDK、Remote Control（在本机会话中）以及能带到云会话的插件中执行；界面绘制只出现在终端和桌面端 Code 页签，VS Code 聊天面板、`claude -p`、Agent SDK 和云会话中不渲染，桌面端还有一批仅终端可用的元素。桌面端的 WSL 会话不加载插件，因此 mod 的 Hook 与绘制都不生效。 |
| 权限与信任 | Hook 可阻止工具或提示继续；项目 Hook 属于可执行代码，需要信任其来源。mod 以用户权限在进程内运行且不进沙箱——即使开启 Bash 沙箱，mod 启动的进程也在沙箱之外；它能读写文件、启动程序、发起网络请求、读取环境变量与 API Key 等密钥、查看并改写提示词与工具调用、不询问就行动，也能批准工具调用从而绕过 `ask` 规则或 `PreToolUse` 阻断，并消耗账号用量。官方要求只安装可信作者与可信市场的 mod，并在安装前用 `claude plugin validate` 审查 `hooks:` 与 `calls:`。 |
| 条件与边界 | 事件支持的输入、输出和退出码语义不同；不能假设所有 Handler 都可用于每个事件。失败处理：v2.1.295 起 command 与 HTTP Hook 支持 `onFailure: "block"`，更新日志逐字为 “Added `onFailure: "block"` for command and HTTP hooks: a hook that can't start, times out, or exits with an unexpected code blocks the action instead of letting it through”（更新日志提交 `602df92bf481ed904533e95c09f740f40aab5aed`），即启动不了、超时或退出码不在预期内时阻断动作而不是放行；适用范围只写 command 与 HTTP 两类 Handler，未写 `prompt`、`agent` 与 `mcp_tool`；官方 Hooks 参考的公共字段表与 Hooks 指南在核对日期都没有出现 `onFailure`，因此取值集合（除 `"block"` 外是否有别的值）、默认值、能否按事件或按作用域覆盖都记为未确认。未设该键时按上面的默认放行，另有按事件的 fail-closed 例外：`WorktreeCreate` 任何非零退出码都让创建失败（Hook 失败或缺少路径即创建失败，command Hook 在 stdout 打印路径、HTTP Hook 返回 `hookSpecificOutput.worktreePath`）、`WorktreeRemove` 在目录事后仍存在时任何非零退出码都让移除失败、`PreModelSwitch` 上被超时取消的 Hook 阻断本次模型切换、Agent SDK 回调 Hook 在 `PreToolUse` 上超时则阻断该次工具调用。超时由 `timeout` 字段按秒覆盖：`command`、`http`、`mcp_tool` 默认 600 秒，在 `UserPromptSubmit`、`PreModelSwitch`、`PostModelSwitch` 上默认降为 30 秒，在 `MessageDisplay` 上降为 10 秒；`prompt` 默认 30 秒、`agent` 默认 60 秒；`SessionEnd` 的各类型 Hook 共享 1.5 秒预算，设置里写了更长的单 Hook `timeout` 时预算抬到与之一致、上限 60 秒；`async: true` 的 command Hook 不强制执行 `timeout`。除 `async: true` 的 command Hook 外，达到 `timeout` 的 `command`/`http`/`mcp_tool` Hook 被取消并丢弃输出，因而在多数事件上超时的 Hook 不给出任何决定；`PreToolUse` 上超时的这三类 Hook 不阻断工具调用，调用继续走正常权限流程，官方直接写不要指望卡住的 Hook 充当闸门。Stop Hook 连续阻断 8 次且其间没有工具调用时由 Claude Code 覆盖，脚本要自己读 `stop_hook_active` 提前退出。mod 需要 v2.1.287 及以上且默认开启；早期访问用的 `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS` 必须删除，v2.1.287 起忽略该变量，设为 `0` 也关不掉 mod。关闭方式有四种：`--safe-mode` 只在本次会话停用全部已安装 mod（同时停用其他自定义）；`~/.claude/settings.json` 的 `"disableAllHooks": true` 在所有会话停用用户安装的 mod，settings Hook 与自定义状态行一起停，组织托管的继续运行；组织设置 `allowManagedModsOnly` 停用用户安装的 mod 但保留该插件其余组件（skills、commands、agents 与 MCP servers 仍加载）；或在 `/plugin` 的 Installed 页签逐个禁用。权限提示不能被重绘。限额：单个事件里 Hook 自身执行 10 秒（不含 `next` 以及除 `$.clock.sleep` 外的 mods API 调用），`.catch` 处理器 1 秒，全部 `session.end` Hook 合计 1.5 秒；`$.process.run` 默认 30 秒、最长 10 分钟；`$.model.complete` 的 `maxTokens` 默认 1024，上限为 64000 或模型输出上限；`$.fs.read` 与 `$.fs.write` 单文件 4 MiB；`$.store` 合计 4 MiB JSON；`$.session.messages()` 只取最新 4096 条；`Text` 的单个字符串子节点 10000 字符，`Code` 与 `Markdown` 各 10000 字符，`Svg` 131072 字符，`Raster` 的 `columns` 至多 512、`rows` 至多 256，`Image` 接受 PNG 或 RGBA 字节至多 2 MiB 或一个文件路径；`$.ui.invalidate('ui.render')` 节流为每秒 10 次（终端中可见 pane、展开的 band 与提示词下方 hint 行为每秒 30 次），更早的调用被合并；`$.ui.toast` 默认显示 4 秒，可传 `{ timeoutMs }`；command、tool、subagent 类型与 pane 名称只允许字母、数字、`_` 和 `-`，最长 64 字符；`claude plugin test` 单个测试 5 秒，除非测试自行设置 `timeoutMs`。官方文档未给出 mod 数量上限。内置 mod 有 `cc-plugin-agents-md`、`cc-plugin-diff`、`cc-plugin-plugin-authoring`、`cc-plugin-sec-default`、`cc-plugin-telemetry` 与 `cc-plugin-you-should-know`，后者在 v2.1.287 以 `/plugin enable cc-plugin-you-should-know@builtin` 开启，仅第一方会话且开启遥测时可用。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Hooks](https://code.claude.com/docs/en/hooks)、[Claude Code Hooks guide](https://code.claude.com/docs/en/hooks-guide)、[Claude Code v2.1.295 Hook `onFailure: "block"` 更新日志](https://github.com/anthropics/claude-code/blob/602df92bf481ed904533e95c09f740f40aab5aed/CHANGELOG.md)、[Claude Code Plugin components](https://code.claude.com/docs/en/plugins/components)、[Claude Code Mods overview](https://code.claude.com/docs/en/plugins/mods/overview)、[Claude Code Mods reference](https://code.claude.com/docs/en/plugins/mods/reference)、[Claude Code v2.1.287 Claude Mods 更新日志](https://github.com/anthropics/claude-code/blob/816ec211a648/CHANGELOG.md)、[Claude Code v2.1.288 mods `$.ui.selection()` 更新日志](https://github.com/anthropics/claude-code/blob/1c229fcd1e1e/CHANGELOG.md) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/hooks` · command 同步或 `async: true` 后台执行 · 条件：`mcp_tool` Handler 引擎执行随 rust-v0.148.0 发布，会话运行时接入仍在 main 分支（提交 `87070a77925c`，尚未发布）· 失败、超时与畸形响应默认放行，只有 `PermissionRequest` 保留字段 fail closed |
| 入口与配置 | `/hooks` 检查、信任或禁用非托管 Hook；也可直接编辑 JSON/TOML 配置。 |
| 文件与目录 | 用户 `~/.codex/hooks.json` 或 `~/.codex/config.toml`；项目 `.codex/hooks.json` 或 `.codex/config.toml`；Plugin 可携带 Hook。 |
| 具体行为 | 覆盖 PreToolUse、PermissionRequest、PostToolUse、PreCompact、PostCompact、SessionStart、SessionEnd、UserPromptSubmit、SubagentStart、SubagentStop、Stop 共 11 个事件，另有中断当前回合时触发的 `Interrupt`（不为 Subagent 运行）。command Hook 的退出码语义按事件分散记录而不是给一张总表：`Exit 0 with no output is treated as success and Codex continues`；`PreToolUse`、`PostToolUse`、`UserPromptSubmit`、`Stop`、`SubagentStop` 各自写明 “You can also use exit code `2` and write the blocking/feedback/continuation reason to `stderr`”；除 `2` 以外的非零退出码在该页没有单独定义。失败与超时默认放行：官方逐字写 “An explicit supported denial can block an action, but a `PreToolUse` callback error, timeout, or malformed response can fail the hook without blocking the tool.”；`mcp_tool` Hook 是 “A hook can block an operation when the tool returns a blocking decision. Errors, missing servers, and unavailable tools don’t block the operation.”；`SessionEnd` 是 “If a command times out or exits with an error, Codex reports it as a hook failure.”，且该事件属 advisory、输出不会左右 Codex 也不会让线程保持打开。 |
| 作用域与优先级 | 用户、可信项目、Managed 与 Plugin 来源。 |
| 扩展构成 | 执行的 Handler 类型是 command，可同步执行或 `async: true` 后台执行（rust-v0.148.0 发布）；prompt 与 agent 配置可解析但运行时跳过；`mcp_tool` Handler（`type = "mcp_tool"`，字段 `server`/`tool`/`input`/`timeout`/`statusMessage`）调用已配置 MCP Server 的工具，`input` 必须是可表示为 TOML 的对象，引擎执行随 rust-v0.148.0 发布（PR #38705）：`${field.nested}` 占位符展开保留 JSON 类型，输出沿用 command Hook 的输出约定，且始终同步执行；SessionEnd 事件与 Managed 必选 Hook 不支持 `mcp_tool`，`timeout` 缺省 600 秒（配置识别提交 `85fc4def358b`）。 |
| 加载与刷新 | 项目 Hook 需要工作区信任；`/hooks` 展示来源并提供相应控制；`hooks/list` 以 handler 专属元数据返回 Hook，MCP Tool Hook 带 `handlerType: "mcpTool"` 及 server/tool 字段，TUI `/hooks` 浏览器展示 MCP Server 与 MCP Tool 条目（rust-v0.148.0 发布）。 |
| 适用界面 | 以 Codex CLI 为准；桌面端、IDE 扩展、Cloud 和 `codex exec` 不自动继承全部交互命令。 |
| 权限与信任 | PreToolUse 或 PermissionRequest 等事件可影响是否继续；Managed Hook 不由普通用户关闭。 |
| 条件与边界 | prompt/agent Handler 可解析但运行时跳过；async command Hook 在后台运行，不能阻断、批准或改写触发它的操作，输出在下一个安全点交付，每会话最多 8 个并发后台 Hook，未完成的随会话结束取消，SessionEnd 始终同步（rust-v0.148.0 发布，官方 Hooks 文档已列 `async` 字段）；rust-v0.148.0 的 CLI 会话运行时未提供 MCP 执行器（`codex-rs/core/src/session/mod.rs` 传 `mcp_executor: None`），`mcp_tool` Hook 启动时以 "MCP invocation is not available yet" 告警跳过；`input` 中 `${field.nested}` 占位符从事件 JSON 解析、字段缺失时该 Hook 失败；会话内实际执行在 main 分支提交 `87070a77925c`（PR #39296，尚未发布）：经会话共享 MCP 运行时执行、含 Managed Hook 配置，只允许已连接、已列入目录且策略允许的工具，不可用 Server 立即失败且不启动或重连，不经模型工具审批、不触发递归 Hook，超时受 Server 侧上限约束；main 分支提交 `d35e5495f991`（PR #39331，尚未发布）把 Hook MCP 调用改经当前连接集执行、不等待 Server 启动或重连，生效超时取 Hook 请求与 Server 工具超时的较短者；官方 Hooks 文档页在核对日期已改为 “`command` and `mcp_tool` handlers are supported. `prompt` and `agent` handlers are parsed but skipped.”，但仍未记录 CLI 会话运行时的 MCP 执行器接入，配置文件能解析不等于能力已经运行。超时按秒配置：省略 `timeout` 时多数 Hook 用 600 秒，`SessionEnd` 与 `Interrupt` 默认 1 秒且最多 3 秒（后台运行时同样是 1 秒默认、3 秒上限），`mcp_tool` 的 `timeout` 默认 600 秒并取 Hook 与 Server 两个超时中较短的一个、等待 MCP elicitation 响应的时间不计入。返回不受支持字段时按失败处理但放行：`PreToolUse` 上 `permissionDecision: "ask"`、旧式 `decision: "approve"`、`continue: false`、`stopReason` 与 `suppressOutput` 都能解析但尚不支持，Codex 把该次 Hook 运行标记为 failed、报告错误并让工具调用继续；`PostToolUse` 上 `updatedMCPToolOutput` 与 `suppressOutput` 同样标记 failed、报告错误并继续正常处理工具结果；`SessionStart` Hook 可能在 MCP Server 就绪前运行，此时不阻断会话。唯一记录的 fail-closed 是 `PermissionRequest`：“Don't return `updatedInput`, `updatedPermissions`, or `interrupt` for `PermissionRequest`; those fields are reserved for future behavior and fail closed today.” 没有 `onFailure` 一类把失败改成阻断的配置键；相关开关是 `[features] hooks = false` 整体关闭、`allow_managed_hooks_only = true` 只保留管理员托管 Hook、`--dangerously-bypass-hook-trust` 本次调用跳过 Hook 信任持久化，以及 `async: true` 把 command Hook 变成不能阻断的后台执行。 |
| 证据状态 | 条件项 |
| 来源 | [Codex Hooks](https://learn.chatgpt.com/docs/hooks)、[Codex hooks MCP tool handler commit](https://github.com/openai/codex/commit/85fc4def358b7df21883e72ae8dda43a0f572f32)、[Codex hooks MCP tool runner source](https://github.com/openai/codex/blob/85fc4def358b7df21883e72ae8dda43a0f572f32/codex-rs/hooks/src/engine/mcp_runner.rs)、[Codex rust-v0.148.0 release notes (async hooks and MCP tool handler engine)](https://github.com/openai/codex/releases/tag/rust-v0.148.0)、[Codex session MCP tool hook enablement commit](https://github.com/openai/codex/commit/87070a77925cbffed8b34ddc99afaf40d56863aa)、[Codex hook MCP current-connection routing commit](https://github.com/openai/codex/commit/d35e5495f991508409ff30e38db8dbe49d565570) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/hooks` · command/HTTP/prompt · 退出码 2 阻断，其他非零、HTTP 非 2xx 与超时放行；无 `onFailure` 一类失败开关 |
| 入口与配置 | `/hooks` 查看和管理已加载 Hook；设置文件和 Extension 都可声明。 |
| 文件与目录 | 用户与项目 `settings.json`；Extension 可内联 Hooks、引用文件或使用默认 `hooks/hooks.json`。 |
| 具体行为 | 覆盖提示、模型、工具、权限、会话、压缩、Subagent、通知等生命周期，并能阻断或返回修改后的控制结果。command Hook 的退出码表逐字为：`0` 是成功、由 stdout 里的 JSON 对象控制行为，其他 stdout（包括 `42` 这类裸 JSON 值）按纯文本处理——在 `SessionStart`、`UserPromptSubmit`、`UserPromptExpansion` 上加进模型上下文，在其余事件上保留为 system 消息，而看起来像 JSON 对象却解析失败的输出永不加进模型上下文；`2` 是阻断错误，忽略 stdout 并把 stderr 作为错误反馈交给模型；其他退出码是非阻断错误，stderr 只在 debug 模式下显示、执行继续。HTTP Hook 的 3xx 响应按其他非 2xx 状态一样处理，即一次非阻断的 Hook 失败，且绝不联系重定向目标。 |
| 作用域与优先级 | 用户、可信项目与 Extension 来源；项目 Hook 随仓库共享。 |
| 扩展构成 | 公开文档包括 command、HTTP 与 prompt；运行时还存在 session-only 的内部 function Hook。 |
| 加载与刷新 | 启动时合并配置；Extension 热重载与 Hook 管理入口可更新当前运行时状态。 |
| 适用界面 | 以 Qwen Code CLI 为准；Headless、ACP 和 IDE Companion 中不同的加载行为会单独注明。 |
| 权限与信任 | 项目 Hook 只在可信文件夹加载；Hook 自身的命令和网络访问需要按可执行配置审查。 |
| 条件与边界 | 内部 function Hook 不是普通配置格式；公开可配置范围应以 command、HTTP 与 prompt 为准。失败与超时按事件硬编码，没有 `onFailure` 一类把失败改成阻断的配置键：`PermissionDenied` 与 `InstructionsLoaded` 都明确写 Qwen 会等 Hook 跑完再继续，Hook 失败只记录、不改变结果（前者输出与退出码被忽略，后者失败不阻止加载）；`PostToolBatch` 的 Hook 失败或 15 秒内没跑完时批次带着原结果继续；`MessageDisplay` 的最终投递最多等 5 秒，超时只在 stderr 打一条警告；`StopFailure`、`SessionDelete` 属即发即忘（后者输出与失败都无法撤销删除），`PostCompact` 的输出被忽略、`decision`/`continue`/`additionalContext` 与退出码都不起作用。`timeout` 默认值按 Handler 分开：command 60 秒（取值 ≥1000 仍按毫秒读以兼容旧配置，`"30s"` 这类非正数值被忽略并回落到 60 秒默认）、http 600 秒、prompt 30 秒，SDK 注册的 function Hook 继续用毫秒；`async: true` 的 command Hook 默认 60 秒并占用 10 个并发异步槽之一，10 个槽占满时新的异步 Hook 被跳过。设置文件读不了或解析失败时保留上一份设置快照与正在运行的 Hook、不改动文件并报错，系统级设置文件出问题时其中已有的 Hook 保持原样而其他修改仍生效；事件名不认识时跳过并给出 `Invalid hook event name` 警告。文档在输入结构一节提醒：对安全敏感的 Hook，解码器失败会改变 fail-open 或 fail-closed 行为，管理员必须在上线前拿升级后的载荷对照已部署的 Hook 验证；官方 HTTP judgment adapter 示例本身对网络、超时与畸形响应一律 fail open，以免后端故障挡住合法工具调用。 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code current Hooks](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/hooks.md)、[Qwen Code current Hooks（失败与超时语义复核）](https://github.com/QwenLM/qwen-code/blob/d13ff87407d673c547726b43928dedba0465ffa1/docs/users/features/hooks.md)、[Qwen Code current Extension runtime](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/core/src/extension/extensionManager.ts) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `config.toml` · command · 退出码 2 阻断，其他非零、超时与崩溃按 fail-open 放行；无 `onFailure` 一类失败开关 |
| 入口与配置 | 没有独立 `/hooks` 命令；在 `~/.kimi-code/config.toml` 的 `[[hooks]]` 中配置。 |
| 文件与目录 | 独立 Hook 位于用户 `config.toml`；Plugin manifest 也可携带 Hook 配置。 |
| 具体行为 | 可监听提示、工具、权限、会话、压缩与 Subagent 等事件。脚本的响应由退出码与 stdout 两样东西决定：退出码 `0` 表示放行、`2` 表示阻断、其他数字默认放行。返回值表逐字为 `0`「正常结束，放行」→「继续执行，若标准输出（stdout）有内容可附加到上下文」，`2`「主动阻断」→「停止当前操作；错误输出（stderr，`console.error` 打印的内容）作为阻断原因」，其他非零值「脚本出错」→「默认放行（fail-open）」，超时或崩溃「脚本异常」→「默认放行（fail-open）」。也可以在 stdout 返回一段 JSON 阻断，官方示例是 `hookSpecificOutput` 里的 `permissionDecision: "deny"` 加 `permissionDecisionReason`。只有可阻断事件（`PreToolUse`、`Stop`、`UserPromptSubmit`）的返回值会影响主流程，其余事件属观察型事件、触发后即发即忘，不管脚本返回什么主流程都不会改变。 |
| 作用域与优先级 | 用户配置与已启用 Plugin；当前文档未列项目级独立 Hook 文件。 |
| 扩展构成 | 独立配置当前只有 command Handler。 |
| 加载与刷新 | 启动时读取配置；Plugin 改动通常需要 `/reload` 或新会话。 |
| 适用界面 | 以 Kimi Code CLI 为准；ACP、Web UI 和外部编辑器只在对应能力中单独列出。 |
| 权限与信任 | Hook command 在本机执行；阻断与 fail-open 语义取决于退出码。文档给出明确边界：「即使脚本报错或超时，CLI 也不会因此中断你的工作」，这种“出错就放行”的设计称为 fail-open，用于避免 hook 异常阻塞主流程；紧随的 warning 写「正因为 fail-open，Hooks 适合做提醒和轻量拦截，但不应作为唯一的安全防线。对真正高风险的操作，仍需依赖权限审批和人工确认。」 |
| 条件与边界 | “命令表没有 `/hooks`”不等于没有 Hook 能力；Kimi 的入口是 TOML 配置。`[[hooks]]` 只允许 `event`（必填）、`matcher`（可选正则，不填匹配全部）、`command`（必填）、`timeout`（可选）四个字段，多写会导致配置文件加载失败，因此没有 `onFailure` 一类把失败改成阻断的开关，fail-open 不可配置。`timeout` 是整数秒、范围 1–600、默认 30 秒；非 Windows 平台上 hook 进程运行在独立进程组中，超时后 CLI 先发送信号让脚本有机会善后、再强制终止；hook 命令的工作目录是当前会话的项目目录。同一事件匹配多条规则时所有命中的 hook 并行运行，`command` 完全相同的多条规则只运行一次。文档没有单独描述“命令无法启动”（例如命令不存在）的情形，只以「脚本出错」「脚本异常」与「崩溃」概括，启动失败属于哪种取值记为未确认。 |
| 证据状态 | 官方确认 |
| 来源 | [Kimi Code current Hooks](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/customization/hooks.md)、[Kimi Code current Hooks（fail-open 与超时语义复核）](https://github.com/MoonshotAI/kimi-code/blob/494df61ce9858c70a9f37a996614534bc9b1cd12/docs/zh/customization/hooks.md)、[Kimi Code current Plugins](https://github.com/MoonshotAI/kimi-code/blob/691ec4679ea1/docs/zh/customization/plugins.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/hooks` · `settings.json` · command/HTTP/prompt/agent · 退出码 2 阻断，其他非零放行；无 `onFailure` 一类失败开关 |
| 入口与配置 | `/hooks` 管理 Hook：官方 Slash 命令参考列出该行、描述逐字为 “Manage Hooks.”，没有给出 synopsis 或子命令，Release Notes 记 CLI 1.0.8（2026-05-28）“Made /hooks command generally available for all users”，而 Hooks 页本身没有描述这个命令。配置仍写在 User、Project 或 Local settings 的 `hooks` 字段与插件的 `hooks/hooks.json` 里。 |
| 文件与目录 | `~/.qoder/settings.json`、项目 `.qoder/settings.json` 与 `.qoder/settings.local.json`；Plugin 可携带 `hooks/hooks.json`。 |
| 具体行为 | 覆盖工具、提示、权限、通知、会话、压缩与 Subagent 等节点，并按 Handler 返回结果控制流程。官方事件表列出 23 个事件：`SessionStart`、`SessionEnd`、`UserPromptSubmit`、`PreToolUse`、`PostToolUse`、`PostToolUseFailure`、`PermissionRequest`、`PermissionDenied`、`Stop`、`StopFailure`、`SubagentStart`、`SubagentStop`、`PreCompact`、`PostCompact`、`Notification`、`InstructionsLoaded`、`ConfigChange`、`CwdChanged`、`FileChanged`、`WorktreeCreate`、`WorktreeRemove`、`Elicitation`、`ElicitationResult`。退出码语义逐字为：`0` 成功、stdout 按下述规则解析；`2` 阻断、stderr 内容反馈给 Agent（只对支持阻断的事件生效）；其他取值是非阻断错误，stdout 被忽略、stderr 写进诊断日志、主流程继续。JSON 里的 `decision` 取 `"allow"` 或 `"deny"`，`"deny"` 等价于退出码 2。支持阻断的事件及效果分别是：`UserPromptSubmit` 退出 2 拒绝该提示词并把 stderr 展示给用户，`PreToolUse` 退出 2 把 stderr 作为错误返回给 Agent，`Stop` 退出 2 把 stderr 作为消息注入对话让 Agent 继续工作，`SubagentStop` 退出 2 把 stderr 注入 Subagent 对话，`PreCompact` 退出 2 阻止本次压缩，`ConfigChange` 退出 2 阻止改动应用到当前会话，`Elicitation` 退出 2 拒绝该 elicitation，`ElicitationResult` 退出 2 把 action 改写为 `decline`。其余事件上退出 2 不阻断。 |
| 作用域与优先级 | User、Project、Local 和 Plugin。 |
| 扩展构成 | command、HTTP、prompt 与 agent Handler。 |
| 加载与刷新 | 随设置和 Plugin 加载；修改后的刷新方式取决于对应配置或插件重载入口。 |
| 适用界面 | 以 Qoder CLI 为准；Agent SDK、ACP 和 Qoder IDE 中不同的入口会单独注明。 |
| 权限与信任 | 项目 Hook 只应在可信工作区启用；Hook 能阻断关键操作，但自身仍是本机可执行配置。`ConfigChange` 是唯一记录了强制生效例外的事件：`source` 为 `policy_settings` 时 Hook 仍会为审计目的触发，但改动强制执行、不能阻断。 |
| 条件与边界 | 不同 Handler 的超时、响应字段和阻断条件不同，需要按事件文档逐项设置。`timeout` 按秒配置且默认值随 Handler 变化：command 600 秒、http 600 秒、prompt 30 秒、agent 60 秒。没有 `onFailure` 一类把失败改成阻断的配置键，Hooks 页也没有描述 Hook 命令启动不了（例如可执行文件缺失）或超过 `timeout` 之后的具体后果，这两点记为未确认。按事件另有硬编码例外：`WorktreeCreate` 任何非零退出码都算失败，`StopFailure` 与 `InstructionsLoaded` 只是通知、输出与退出码被忽略，`WorktreeRemove` 也只是通知、失败通过 stderr 呈现。`async: true` 让同组 Hook 全部在后台运行、不阻断当前操作，结果作为额外上下文注入下一个模型回合；`asyncRewake: true` 在后台运行且退出码为 2 时由 CLI 用 stderr/stdout/error 拼一条 system reminder 唤醒模型（官方说明为 “useful for long-running checks”），配套字段 `rewakeMessage` 覆盖注入的 system 消息前缀、`rewakeSummary` 覆盖一行摘要（最多 300 字符）；`continue: false` 请求停止后续执行。Release Notes 另有几条只在发行说明出现、Hooks 页没有展开的失败与超时相关记录：CLI 1.0.29（2026-06-25）“Aligned SessionEnd hook timeout and PreToolUse fail-closed behavior with strict semantics” 与 “Tightened hook validation: hookEventName is now required in hookSpecificOutput”，其中 `PreToolUse` 的 fail-closed 具体覆盖哪些失败形态、与 Hooks 页“其他退出码为非阻断错误”的关系，页面没有说明，记为未确认；CLI 1.0.14（2026-06-04）“Fixed session freeze when a hook subprocess hangs on timeout or abort”；CLI 0.2.5（2026-04-29）“Fixed hook process hangs with exit event and tree-kill” 与 “Fixed hook permission decisions discarded on partial failure”；CLI 1.0.17（2026-06-10）“Enhanced asyncRewake hooks with custom messages, non-interactive downgrade, and prefix matching” 与 “Allowed plugin hooks to bypass the --setting-sources filter”；CLI 1.0.47（2026-07-16）“Fixed an issue where the PreToolUse hook did not take effect in headless and SDK modes”，说明该事件在 Print Mode 与 SDK 下也应生效；CLI 0.1.32（2026-03-18）“Updated Windows hook execution to run via Git Bash”，是 Hooks 页没有记录的平台条件。 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI Hooks](https://docs.qoder.com/en/cli/hooks)、[Qoder CLI Plugins](https://docs.qoder.com/en/cli/plugins)、[Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference)、[Qoder CLI Release Notes（跨会话消息、`/loop`、`/crontab`、任务预算与 Hook 失败、`/hooks` GA 条目的版本时间线）](https://docs.qoder.com/release-notes/qoder-cli) |

## 官方来源

- [Claude Code Hooks](https://code.claude.com/docs/en/hooks)
- [Claude Code Hooks guide](https://code.claude.com/docs/en/hooks-guide)
- [Claude Code v2.1.295 Hook `onFailure: "block"` 更新日志](https://github.com/anthropics/claude-code/blob/602df92bf481ed904533e95c09f740f40aab5aed/CHANGELOG.md)
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
- [Qwen Code current Hooks（失败与超时语义复核）](https://github.com/QwenLM/qwen-code/blob/d13ff87407d673c547726b43928dedba0465ffa1/docs/users/features/hooks.md)
- [Qwen Code current Extension runtime](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/core/src/extension/extensionManager.ts)
- [Kimi Code current Hooks](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/customization/hooks.md)
- [Kimi Code current Hooks（fail-open 与超时语义复核）](https://github.com/MoonshotAI/kimi-code/blob/494df61ce9858c70a9f37a996614534bc9b1cd12/docs/zh/customization/hooks.md)
- [Kimi Code current Plugins](https://github.com/MoonshotAI/kimi-code/blob/691ec4679ea1/docs/zh/customization/plugins.md)
- [Qoder CLI Hooks](https://docs.qoder.com/en/cli/hooks)
- [Qoder CLI Plugins](https://docs.qoder.com/en/cli/plugins)
- [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference)
- [Qoder CLI Release Notes（跨会话消息、`/loop`、`/crontab`、任务预算与 Hook 失败、`/hooks` GA 条目的版本时间线）](https://docs.qoder.com/release-notes/qoder-cli)

## 关联能力

- [插件分发](./extension-plugins.md)
- [交互审批](../security/security-approval.md)
- [Agent 独立 Hooks](../subagents/agent-hooks.md)

# MCP 客户端：Claude Code v2.1.327 的 `claude mcp add-json <name> -` 与 `.mcp.json` 写入边界、Codex rust-v0.170.0 的跨环境同名 Server，另补录 Codex 与 Kimi 的 `environment_id`、更正 Qwen 与 Qoder 的子命令与传输清单

日期：2026-11-18
能力字段：`extension-mcp`（扩展系统 · MCP 客户端）

## 本次改动

官方来源快照里 Claude Code 的最新 Release 是 v2.1.327（2026-11-17T23:17:45Z）、Codex 的最新非 alpha Release 是 rust-v0.170.0（2026-11-18T03:40:48Z），两者都晚于本仓库上一轮的核对坐标，且都带 MCP 客户端条目，因此本次研究单元定为 `extension-mcp`，并按同一口径复核其余三家。

### 1. Claude Code：v2.1.327 的九条 MCP 条目

更新日志固定到 `CHANGELOG.md` 提交 `9fa26078be418ec4b217334812e2a04cc63336ae`（标题 “chore: Update CHANGELOG.md and feed.xml”，同一提交把 `feed.xml` 更新为 `Claude Code v2.1.327`；以 `.patch` 形式核对，51,803 字节）。`## 2.1.327` 段与 MCP 相关的九条逐字为：

1. “Added `claude mcp add-json <name> -` to read the server's JSON from stdin, so tokens can stay off the command line; not available inside a Claude Code session”
2. “Fixed `claude mcp add` and `claude mcp remove` with project scope deleting other top-level keys from `.mcp.json`, such as `$schema` or another tool's `servers`”
3. “Fixed remote MCP servers staying disconnected after a longer outage such as a VPN drop: most servers on other machines reached by hostname over https are now retried in the background for about a day”
4. “Fixed `/mcp` saying no servers were configured after one was added during a session or declined; it now says what to do”
5. “Fixed the MCP tool list in `/mcp` and `/plugin` losing your place when going back from a tool”
6. “Fixed an MCP server's long question being cut off after one row, text fields hiding long pastes with no sign, and a doubled divider line in `/plugin`'s options and `/login`'s Bedrock and Vertex steps”
7. “Improved MCP server pages in `/mcp`: local, remote and agent servers share one layout, menus end in Back, and actions are no longer numbered outside screen reader mode; use the arrow keys and Enter”
8. “Changed `claude mcp add --scope project` to stop, instead of overwriting the file, when `.mcp.json` lists its servers at the top level with no `mcpServers` key”
9. “Changed MCP server logs to record the mode, action, and field names of elicitation requests and hook answers, not their full contents”

第 1、2、8 条合起来划出了项目级 JSON 配置的写入边界：`.mcp.json` 用 `mcpServers` 包装键，把 Server 列在顶层的文件（例如另一个工具的格式）现在让 `claude mcp add --scope project` 直接停止而不是覆盖，而正常的 add/remove 不再连带删掉 `$schema` 或别人的 `servers` 这类顶层键。第 9 条是日志口径变化：elicitation 请求与 Hook 应答只留 mode、action 与字段名。

第 3 条与官方文档冲突，按「不同一手材料冲突」处理：官方 MCP 页（`.md` 156,709 字节）的 “Automatic reconnection” → “Mid-session drops of a remote server” 仍逐字写 “After a transient error, such as a 5xx response or a timeout: Claude Code keeps retrying an HTTP or SSE server in the background. Retries last up to about half an hour, and the server's tools become available again when one connects.”，全页没有 “about a day”、也没有「按主机名走 https 的其他机器上的多数 Server」这一限定；更新日志反过来没有给确切小时数、重试间隔，也没说它与文档那句半小时的关系。两个数字都录入并把关系记为未确认。

同页的 “Automatic reconnection” 整节本次首次逐字核对并录入：远程 Server 掉线先以 1 秒起、每次翻倍的指数退避试 5 次；交互会话在 `/mcp` 显示 pending，5 次失败后标 failed 或需要认证并给 `MCP server "<name>" disconnected · open /mcp to reconnect` 通知；`claude -p` 与 Agent SDK 会话同样试 5 次、没有面板可显示，需要重新登录时停止重试并把状态报为 `needs-auth`；首次连接失败最多重试 3 次，三条例外是 stdio 首连、WebSocket 首连与认证或 not-found 错误（`headersHelper` 是唯一 `Authorization` 来源时认证错误仍重试，因为每次尝试都重跑 helper）；连接后的 `tools/list`、`prompts/list`、`resources/list` 发现请求在瞬时网络或 Server 错误后最多重试 3 次，不重试认证错误、4xx 与请求超时；`/mcp reconnect all` 需 v2.1.284 及以上，更早版本打印 `MCP server "all" not found`；是否把失败连接告知 Claude 取决于默认开启的 tool search。

JSON 配置口径另补四处（同页，此前均未记录）：`type` 接受 `streamable-http` 作为 `http` 的别名（“The MCP specification uses the name `streamable-http` for this transport, so configurations copied from server documentation work without modification.”）；有 `url` 却没有 `type` 的条目按配置错误跳过并报 `MCP server "<name>" has a "url" but no "type"; add "type": "http" (or "sse" / "ws") to this entry`；`"type": "sdk"` 的进程内 Server 只能由 SDK 宿主应用注册，写在 `.mcp.json`、`~/.claude.json` 或设置里会跳过并报 `Skipped — MCP server "<name>" declares type "sdk", which only an SDK host application can register`，且 `--output-format stream-json` 运行会把被跳过的 `--mcp-config` 条目写进 `system/init` 事件的 `mcp_server_errors` 字段；从其他客户端的 `mcpServers` 块添加时要传包装键内的对象，`url` 无 `type` 与键名含字母、数字、连字符、下划线以外字符这两种条目需先修复，`claude mcp add-from-claude-desktop` 导入时对不合规名字逐个报告拒绝并继续导入其余选中项。

**文档未同步已固定为证据**：官方 MCP 页的 “Add MCP servers from JSON configuration” 一节基本语法仍只有 `claude mcp add-json <name> '<json>'`，Tips 三条是 shell 转义、符合 MCP server 配置 schema、可用 `--scope user`，全页没有 stdin、文件输入或裸 `-`；官方 CLI 参考页（`.md` 51,631 字节）的 `claude mcp` 只有三行——一行指向 MCP 文档、`claude mcp login <name>` 与 `claude mcp logout <name>`，没有 `add`、`add-json` 或 `add-from-claude-desktop`。因此 stdin 形式的读取上限与能否同时带 `--scope` 记为未确认。

### 2. Codex：`environment_id` 与 `multi_environment_mcp`

rust-v0.170.0（2026-11-18T03:40:48Z）的 New Features 第三条逐字为 “Added experimental support for using identically named MCP servers across environments. (#60905)”，Bug Fixes 另有 “Fixed MCP OAuth credential races during cancellation, login, and logout. (#60849, #60981)”。该 Release 取代本仓库上一轮记录的“rust-v0.169.0 在核对日期仍是最新非 alpha Release”。

PR #60905（合并提交 `561f0f5cf0f29c62bd3233c54dc21fcaf4a61c33`，2026-11-11 合入 main）的 Why 段逐字为 “MCP servers discovered on different executors can share a name. Resolving them by name alone exposes only one server and prevents tools and resources from being addressed independently.”，What changed 四条为：新增默认关闭的 `multi_environment_mcp` 以暴露环境作用域 Server（含同一插件的多次安装）；用精确 `McpServerKey` 身份贯穿目录、连接、工具调用、资源与审批跟踪，并给环境作用域工具由环境派生的稳定命名空间；作用域资源列表带 `environment_id`、资源请求也接受它，多环境同时选中时环境所有的 Server 必须带该字段；Server 归属穿过 Hook 保留，作用域内 elicitation 审查用所属环境的权限。Testing 段含拒绝 Hook 修改工具环境的用例。

功能登记册 `codex-rs/features/src/lib.rs`（tag `rust-v0.170.0`，86,879 字节）给出该键的登记项逐字为 `FeatureSpec { id: Feature::MultiEnvironmentMcp, key: "multi_environment_mcp", stage: Stage::UnderDevelopment, default_enabled: false }`，枚举 doc comment 为 “Keep same-named HTTP servers discovered on different executors separate.”——**发布说明写 “identically named MCP servers”，源码注释限定为 HTTP Server，两处范围不一致**，已按原文并列记录。官方 MCP 页（31,613 字节）与配置参考（154,596 字节）在核对日期对 `multi_environment_mcp` 与 `McpServerKey` 的命中数都是 0（配置参考里名字含 `mcp` 的 features 行只有 `features.skill_mcp_dependency_install`），因此它的开启方式、命名空间具体格式与 `McpServerKey` 字段构成记为未确认。

同时补录此前漏记的 `environment_id`：配置参考的 `mcp_servers.<id>.environment_id` 类型 `string`、描述逐字为 “Execution environment for the MCP server. Defaults to `local`. Use the ID of a configured executor to run a stdio server or connect to a streamable HTTP server there.”；MCP 页 “Other configuration options” 写作 “`environment_id` selects the environment for a stdio or Streamable HTTP server. It defaults to `local`. To connect through a remote executor, use its registered environment ID.”；stdio 的 `env_vars` 另有 `source = "remote"`（“reads from the remote executor environment and requires remote MCP stdio”），字符串条目与 `source = "local"` 读本地环境。Surface 边界一并录入：MCP 页 “Use MCP-backed tools in ChatGPT web” 一节写 “In Local computer access with Work Cloud, the enterprise `mcp_servers` TOML requirement in Agent Security applies to local executors. Cloud containers retain Work Cloud policies. Local MCP servers and transports may not be available in the cloud; check connectivity and authentication separately.”

### 3. Kimi Code：补录 `environment_id` 与重连、门禁细节

中文 MCP 文档坐标由本仓库此前固定的 `eb2035f3cad57cc12d4d5082ec626f7f0ea5f651`（12,941 字节、MD5 `fcaa6c979e62ad9cecf4db216e5c3e4e`）前移到 main HEAD `84439d5f4ec7bcf69f3e1a5ba0e3145d8dddff08`（2026-11-18T15:21:43Z，13,129 字节、MD5 `bfff0d0c7613f0ba5a265df440e57629`）。两版逐行比对只有三处差异：新增一句 “供应商支持图片上传和文件引用时，MCP 工具新返回的图片首次上传后，后续模型请求可以复用这张图。”、`environment_id` 段的锚点由 “#声明环境” 改为 “#声明-docker-与自定义命令环境”、一处中文引号改为直引号。

`environment_id` 此前完全没有进入本仓库，本次按原文补录：可选字段表把它列为 stdio 专用、“启动该 server 的 远程环境 id，默认 `local`”；专节 “## 在远程环境中运行 stdio server” 逐字为 “stdio server 通常在运行 Kimi Code 的机器上执行，即使会话绑定了远程环境也是如此。在 server 条目上设置 `environment_id` 可以改变这一点：CLI 会在指定的 远程环境 中启动该 server，其进程、工作目录以及它访问的一切都位于目标环境上。”，环境在 `config.toml` 的 `[environments]` 声明（示例 `[environments.dev-box]` 配 `type = "ssh"`、`host`、`defaultCwd`），该字段不跟随会话自身的环境绑定（绑定到 `dev-box` 的会话仍会在本地运行未设置 `environment_id` 的 stdio server），环境尚未连接时在 server 启动时按需建立连接；远程 stdio server 的 `PATH`、`HOME` 等基础环境变量来自目标环境，CLI 只把 `env` 覆盖层按字面量值发送。

同次补录的还有四组此前只写了结论、没写条件的行为：重连（workspace 级 server 指数退避，首次等待 `[mcp] reconnect_initial_delay_ms` 默认 `5000`、上限 `[mcp] reconnect_max_delay_ms` 默认 `300000`；“无法自行恢复的失败——命令不存在、配置非法、server 拒绝静态凭证——不会重试并保持 `failed`；session 级临时挂载的 server 同样不重试”）；删除与新增语义（删除后已打开会话在 `/mcp` 显示 `removed`、工具仍可见但调用失败并返回移除提示、新会话完全不注册；编辑 `mcp.json` 新增的 server 不注册到已打开会话，而 Plugin 新增或启用的 server 会立即连接到已打开会话）；信任门禁（不受信任文件夹里的项目级 server 由提示逐个列出传输方式与启动目标、默认选中 `Trust this folder`；无头运行如 CI 里 `kimi -p` 不显示提示因而保持禁用，可用 `KIMI_CODE_TRUST_WORKSPACE=1` 或 `[workspace] require_trust = false` 绕过）；工具命名与权限（`mcp__<server>__<tool>`，权限规则支持 `*` 与 `**` 通配、MCP 工具参数不参与匹配，弹窗选 “Approve for this session” 后本会话同类调用自动放行，永久规则写在 `config.toml` 的 `[[permission.rules]]`）。“## 接入方式” 仍只有 stdio、HTTP、SSE 三种，全页没有 WebSocket，原结论不变；`toolTimeoutMs` 的内置默认值文档仍未给出。

Release 侧无 MCP 客户端条目：2.6.3（2026-11-17T15:15:21Z，发布说明 1,467 字节）含 `mcp` 字样的行数为 0；2.7.0-canary.20261118115856-50ec3c3（2026-11-18T12:13:27Z，4,661 字节）唯一一行是 “refactor(kap-server): converge sessions and mcp APIs onto /api/v1”，指 KAP 服务端自己的 HTTP API（`/api/v1/wait`、`/api/v1/interactions`），不是 MCP 客户端配置，按 Surface 规则不混记。

### 4. Qoder CLI：传输清单更正与 CLI 1.1.91 两条 MCP 条目

MCP reference 页（`.md` 9,864 字节；本仓库此前记的是同页 HTML 形态的 846,779 字节）的 “## Transport Methods” 逐字为 “MCP servers specify the transport protocol via the `type` field:”，表列**五个**取值——`stdio` (default) “Spawns a subprocess and interacts via stdin/stdout.”、`sse`、`http` / `streamable-http` “Connects via HTTP (JSON-RPC + optional streaming).”、`ws` “Connects via WebSocket / TCP.” 与 `sdk` “Built-in SDK-level server (in-process).”。据此把此前的“stdio、SSE、HTTP 与 WebSocket 四类传输”更正为 `type` 五值，并记下 `streamable-http` 是 `http` 的同义写法、`sdk` 是进程内内置 Server 而不是第五种网络传输。MCP Servers 页（4,019 字节）的 `-t` 表仍只有 stdio、sse、http、ws 四类，两页口径不同已并列记录。

子命令与二进制名同样更正：MCP Servers 页给的是 `qoder mcp add playwright -- npx -y @playwright/mcp@latest`、`qoder mcp list`、`qoder mcp remove playwright`，CLI 参考页（13,961 字节）把 `mcp` 列为子命令（“Configure and manage MCP servers.”）并写 “In addition to startup parameters, `qoder` also provides several subcommands in the form of `qoder <subcommand>`”；三页 `mcp get` 与 `qodercli` 的命中数都是 0，故此前记的 `qodercli mcp add|list|get|remove` 改为 `qoder mcp add|list|remove`。`-s` 三类作用域与落盘位置逐字录入（`user` 跨项目、`local` 为默认且只对本机当前项目、`project` 随项目共享；`~/.qoder/settings.json`、`${project}/.qoder/settings.local.json`、`${project}/.mcp.json`）。同页另有一段此前未记录的 shell 前缀包装：“When the shell command prefix is enabled, Qoder CLI launches stdio servers through the configured executable wrapper. The wrapper receives the original server executable and arguments as one shell-quoted argument and must execute it while preserving stdio and the exit status. The configured value must be a single executable path. This setting does not affect `sse`, `http`, or `ws` servers.”

更新日志站（HTML 810,837 字节、92 个 `CLI 1.1.x` 标题，日期写在版本标题之前）最新条目为 “November 17, 2026 · CLI 1.1.91 · Enterprise Skill & MCP Distribution with Broad Stability Fixes”，与 MCP 相关的两条逐字为 “Fixed MCP tools becoming unavailable when the tool list failed to refresh” 与 “Added support for enterprise admins to distribute independent Skill and MCP to members”；上一条 CLI 1.1.90（November 16, 2026）与再上一条 CLI 1.1.89（November 13, 2026）都不含 MCP 条目，再往前的 CLI 1.1.88（November 12, 2026，“Stability and User Experience Improvements”）有一条 “Fixed being unable to call MCP tools after starting a new session with /new or /clear in the TUI”。企业下发那条没有给出键名与落盘位置，但治理侧有官方专页可引：`https://docs.qoder.com/account/enterprise/mcp.md`（8,680 字节，页首标 “Applicable plans: Enterprise”）的 “MCP Access Control” 逐字为 “MCP Access Control lets administrators manage how non-built-in MCP servers are connected and used across the organization.”，适用范围为 “This control applies both to MCP servers configured or installed by members and to MCP servers deployed centrally by the organization. MCP services built into Qoder clients are not affected.”；三种访问模式 Allow all（“New organizations use **Allow all** by default.”）／Rule-based access（允许清单只在其中可编辑、至少 1 条、至多 100 条、生效后不能删掉最后一条）／Block all，管控只落在 Configuration、Installation and activation、Startup and connection、Use 四类入口，官方明确 “It is not a runtime security sandbox for MCP servers.”，通过入口检查后的脚本、文件访问、进程与网络请求都不在范围内；客户端不可用状态四种（`Disabled by organization`、`Not approved`、`Invalid configuration`、`Policy unavailable`）且保留条目、禁用连接启用与调用动作；策略取不到时用最近一次有效策略、连有效缓存都没有则默认阻断非内置 Server；变更 “usually take about five minutes to apply”，且 “Centrally deployed MCP servers cannot bypass MCP Access Control.”。该页仍没有 CLI 侧键名与下发落盘位置，故这部分继续记为未确认。

MCP reference 页另补一句连接生命周期口径（此前未记录）：“An interrupted tool call is not replayed automatically; invoke it again after the server reconnects.”——与 Qwen Code 在 `trust: true` 加只读注解下会重放当前调用的行为形成对照。

文档站 Release Notes `.md`（116,633 字节、184 个 `<Update>`）最新只到 CLI 1.1.82／November 3, 2026，对 “Enterprise Skill”、“tool list failed to refresh” 与 “distribute independent Skill” 三处字符串命中数都是 0，即比更新日志站落后 1.1.83 至 1.1.91 共九个版本；两处口径不一致时以更新日志站为准。MCP 两页的 `environment_id` 命中数都是 0。

### 5. Qwen Code：本字段无机制变化，但坐标与子命令清单需更正

MCP 文档 `docs/users/features/mcp.md` 在 tag `v0.27.0` 与 `v0.28.0` 下**逐字节相同**（28,576 字节、MD5 `15532fdc90681a08c158af625334ddfd`），v0.28.0（2026-11-17T11:17:50Z，发布说明 16,218 字节）与 v0.28.1-preview.0（2026-11-17T18:36:36Z，1,992 字节）里含 `mcp` 字样的行数都是 0，全文 `environment_id` 命中数为 0，即没有把 Server 放到远程环境执行的同类键。

本仓库 `qwen-mcp-current` 固定的提交 `8a44b1b9f79341a0faca9814fb1b57f0f1b354a2` 早于 v0.27.0：该提交下同一文件 MD5 为 `c42911e8ae620b9aea9e844851b47af6`，比两个 tag 少 “### Automatic stdio negotiation”（`"versionNegotiation": "auto"`、协商会先跑一个短命的 server 副本、最多占用发现预算五秒、非幂等启动副作用或单持有者锁与 PID 文件应保留 legacy 策略）与 “### Connection-loss replay” 两节，Server trust 一行也还没有 “only in a trusted workspace” 限定。这两节已在 `extension-mcp-tasks` 里按 v0.27.0 记过，本次把 `extension-mcp` 的坐标一并对齐。

子命令清单按源码更正：`packages/cli/src/commands/mcp.ts`（tag `v0.28.0`，1,021 字节，头注释仍写 “File for 'gemini mcp' command”）只注册 `add`、`remove`、`list`、`reconnect`、`approve`、`reject` 六个子命令并带 `.demandCommand(1, 'You need at least one command before continuing.')`，**没有 `get`、`enable`、`disable`**，此前记的 `qwen mcp add|list|get|remove|enable|disable` 作废。各子命令的形状为 `add <name> <commandOrUrl> [args...]`（选项 `--scope`/`-s` 取 `user`（默认）或 `project`、`--transport`/`-t` 取 `stdio`/`sse`/`http`、`--env`/`-e`、`--header`/`-H`、`--timeout`、`--trust`、`--description`、`--include-tools`、`--exclude-tools` 与四个 `--oauth-*`）、`remove <name>`、`list`、`reconnect [server-name]`（`--all` 为 “Reconnect all configured servers”）、`approve [name]` 与 `reject [name]`（描述为 “Approve|Reject a gated MCP server (.mcp.json or workspace .qwen/settings.json)”，`--all` 作用于 “all gated servers in this workspace”，handler 调用 `setProjectServerStatus`）。文档正文只出现 `qwen mcp add`（10 次）、`qwen mcp list`（1 次）与 `qwen mcp remove`（2 次）。

### 6. 跨产品事实

`facts` 由 4 条增至 6 条：第 1 条补上五家传输集合的完整对照（Kimi 与 Qwen 是 stdio/HTTP/SSE，Qoder 的 `type` 另列进程内 `sdk`）；新增一条「Codex 与 Kimi Code 都给 Server 条目加了 `environment_id`（都默认 `local`），让 stdio Server 改在远程 executor 或 `config.toml` 的 `[environments]` 环境里启动；Claude Code、Qwen Code 与 Qoder CLI 的一手资料没有同类键」；新增一条概述本轮增量（Claude 的 `.mcp.json` 写入边界与 stdin 形式、Codex 的 `multi_environment_mcp`、Qoder CLI 1.1.91 的企业下发）。

## 同步范围

- `site/data.js`：`updatedAt` 由 2026-11-17 改为 2026-11-18；`extension-mcp` 行五个单元格里四个改写（Claude 追加 stdin 形式、Codex 追加 `environment_id`、Qwen 改为六个真实子命令、Kimi 追加远程环境启动、Qoder 改为 `/mcp reload` + `qoder mcp add|list|remove` + `type` 五值），能力字段总数维持 119；新增 16 个来源（Claude 3：`claude-mcp-json-config`、`claude-mcp-reconnect`、`claude-v21327-mcp-changelog`；Codex 5：`codex-mcp-environment-id`、`codex-config-reference-mcp-environment`、`codex-rust-v01700-release`、`codex-multi-environment-mcp`、`codex-features-multi-environment-mcp`；Qwen 2：`qwen-mcp-v0280-doc`、`qwen-mcp-cli-source`；Kimi 1：`kimi-mcp-84439d5`；Qoder 5：`qoder-mcp-servers-page`、`qoder-mcp-reference-transports`、`qoder-changelog-1191-mcp`、`qoder-enterprise-mcp-access-control`、`qoder-release-notes-lag`），既有来源零删改，来源总数由 1,259 增至 1,275。
- `site/extension-details.js`：只改 `extension-mcp` 一个能力。`facts` 由 4 条增至 6 条并改写第 1 条；claude 记录的 `entry`／`location`／`behavior`／`scope`／`components`／`loading`／`permissions`／`conditions` 全部重写，来源由 1 条增至 4 条；codex 记录的 `location`／`behavior`／`scope`／`components`／`loading`／`surfaces`／`permissions`／`conditions` 补 `environment_id`、`multi_environment_mcp` 与 Work Cloud 边界，来源由 2 条增至 7 条；qwen 记录按源码更正子命令并补 `versionNegotiation` 与 trust 限定，来源由 1 条增至 3 条；kimi 记录八个字段全部重写，来源由 1 条增至 2 条；qoder 记录改为 `type` 五值、`qoder mcp` 三子命令、shell 前缀包装、中断调用不重放、CLI 1.1.88 与 1.1.91 三条更新日志条目与企业 MCP Access Control，来源由 2 条增至 7 条。五家的 `value` 与主表一致性由 `validate-details.mjs` 保证，`status` 仍分别是官方确认／官方确认／源码确认／官方确认／官方确认，未改动其他能力字段。
- `docs/05-扩展系统矩阵.md`、`docs/capabilities/extensions/extension-mcp.md` 与其余七类详情文档全部由 `npm run generate` 重新生成；`updatedAt` 前移使 119 篇能力详情与八份矩阵文档的「核对日期」行统一变为 2026-11-18，内容实际产生差异的是 `docs/capabilities/extensions/extension-mcp.md`（能力结论表五行、跨产品事实 4→6 条、五家逐产品记录、官方来源清单）与 `docs/05-扩展系统矩阵.md` 的 MCP 客户端一行，其余生成文件只有日期行变化。
- `docs/09-版本与证据.md`：五家「核对坐标」行的核对日期统一改为 2026-11-18，「主要材料」各追加一段本次取证记录（Claude 一段含九条更新日志条目、重连整节与文档未同步的两处；Codex 一段含 `environment_id` 两处原文、PR #60905 四条与登记册的 stage／默认值，并写明 rust-v0.170.0 取代上一轮“rust-v0.169.0 是最新非 alpha”的结论；Kimi 一段含新旧坐标的字节数与 MD5、三处差异与补录的五组行为；Qoder 一段含 `type` 五值、子命令更正与两个站点的版本落差；Qwen 一段含两 tag 逐字节相同、旧坐标缺失的两节与源码子命令清单）；「官方来源」表五行的「扩展系统」列各追加本次链接（Claude 3 条、Codex 5 条、Qwen 2 条、Kimi 1 条、Qoder 5 条）。行首前缀与行尾 ` |` 保持不变，每行按 ` | ` 切分的片段数改动前后完全一致（核对坐标五行 10／22／12／24／37，官方来源表五行各 7），全文行数维持 74。
- `README.md`：核对日期由 2026-11-17 改为 2026-11-18；能力字段总数维持 119、扩展系统仍是 12 篇详情，两处摘要文字（“MCP、MCP 异步任务、Skills、Hooks、插件、自定义命令、输出风格、项目指令、工具延迟声明和自定义状态行”与“逐产品记录目录、作用域、组件、加载方式、适用界面和权限边界”）仍然成立，未改动。
- 校验：`npm run generate` 八个生成器全部通过（扩展系统 12 篇），`npm test` 三项校验通过——`Validated 119 details × 5 products.`、`Validated links in 297 Markdown files.`、`Validated matrix render, detail schemas, links, and CSS.`；`docs/09` 全文行数维持 74，核对坐标行按 ` | ` 切分的片段数仍为 10／22／12／24／37，官方来源表五行仍各为 7 片。

## 未处理项

- **Claude v2.1.327 的非 MCP 条目**：同段还有 `claude daemon`／self-hosted runner 的 `GIT_CONFIG_GLOBAL` 处理、`/status` 新增损坏文件与配置问题清单（属 `cmd-status`）、`/config` 的覆盖提示（属 `cmd-config`）、`attributionProject` 计费组命名与 `x-claude-code-managed-settings-checksum`（属 `auth-enterprise`）、`/tui classic` 渲染器命名（属 `surface-cli`）、`/install-github-app` 的确认步骤（属 `cmd-github`）、`CLAUDE_CODE_DISABLE_SHELL_HEAD_START`（属 `execution-shell`）、WebFetch 超过 2,000 字符直接拒绝与 `@` 提及只查前 100 个（属 `execution-search` 与 `extension-project-instructions`）、Grep 分页排序与 Read 的 10 MB 报错口径（属 `execution-search` 与 `execution-files`）。按「一次只处理一个能力字段」的规则本次都没有展开。
- **Codex rust-v0.170.0 的另两条 New Features**：TUI 实时语音的 WebRTC 协商（#61172）与 OTLP HTTP exporter 的可刷新认证头（#61028）分别属 `surface-cli` 与遥测配置，本次只登记标题、未展开核对。
- **Qoder CLI 1.1.91 的企业下发 Skill 与 MCP**：治理侧已有官方专页（“MCP Access Control”，三种访问模式、四类入口点、四种客户端不可用状态、约五分钟策略缓存、无有效缓存时默认阻断），但「下发」本身仍缺证据——更新日志与企业页都没有给出下发内容落在客户端哪个文件、是否有 CLI 侧配置键、成员是否需要确认；Skill 那一半属 `extension-skills`，需要单独取证。同段的 Auto 权限模式审批口径变化（“trigger model approval only when a high-risk command is matched”）属 `security-auto-review`，本次未处理。
- **组织级 MCP 管控的五家对照**：本次只在 Qoder 记录里写入了企业 MCP Access Control，Codex 侧只在 `surfaces` 引了 “the enterprise `mcp_servers` TOML requirement in Agent Security applies to local executors” 一句；Claude Code 的托管设置（`disabledMcpjsonServers` 等）与 Qwen、Kimi 是否有同类组织级 MCP 管控，需要按 `auth-enterprise` 或本字段单独取证后再做横向对照，本次没有展开。
- **`multi_environment_mcp` 的开启方式**：功能登记册是 `Stage::UnderDevelopment` 且默认关闭，官方两份文档都没有该键，因此是走 `[features]`、`-c features.multi_environment_mcp=true` 还是 `/experimental` 记为未确认；环境派生命名空间的具体格式与 `McpServerKey` 的字段构成同样未确认。
- **Claude “about a day” 与文档 “about half an hour” 的关系**：两者是否分别对应「按主机名走 https 的远程 Server」与「其余远程 Server」，官方没有说明；确切小时数与重试间隔也未给出。
- **Kimi `environment_id` 可用的环境类型**：MCP 页只给了 `type = "ssh"` 示例并把细节指向远程环境文档（锚点为「声明 Docker 与自定义命令环境」），本次没有展开核对该文档，因此 Docker 与自定义命令环境是否同样适用于 MCP stdio server 记为未确认。
- **Qoder `sdk` 传输**：reference 只写 “Built-in SDK-level server (in-process).”，是否可由用户在 `settings.json` 里声明、与 Agent SDK 的关系如何，都没有进一步一手资料。

## 影响页面

- [扩展系统矩阵](../docs/05-扩展系统矩阵.md)
- [MCP 客户端详情](../docs/capabilities/extensions/extension-mcp.md)
- [扩展系统详情目录](../docs/capabilities/extensions/README.md)
- [版本与证据](../docs/09-版本与证据.md)

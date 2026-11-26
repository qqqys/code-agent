# Agent Skills：Claude Code 把 MCP Server 变成第四类 Skill 来源（v2.1.331 起公测，更新日志到 v2.1.332 才宣布），其余四家经源码与文档双向核对都没有该来源；同轮作废 Kimi「多目录 Skill 合并尚未发布」与 Qwen「设置参考无 `skills.*` 行」两条过期结论

日期：2026-11-26
能力字段：`extension-skills`（扩展系统 · Agent Skills）

## 本次改动

每日研究在核对五个产品的官方更新日志与 Release 时，发现 Claude Code v2.1.332（2026-11-25T01:32:14Z 发布）更新日志的首条 Added 直接给 `extension-skills` 增加了一类此前不存在的 Skill 来源：MCP Server。本单元只处理这一条，并按同一口径把其余四家的「有无 MCP Skill 来源」用源码枚举 + 官方文档双向核对补进矩阵；同时作废本仓库两条已过期结论（Kimi 多目录 Skill 合并的发布状态、Qwen 设置参考的 `skills.*` 行）。字段总数维持 119。

### 1. Claude：Skills over MCP 公测，Server 成为第四类 Skill 来源

发布坐标：更新日志固定到 `CHANGELOG.md` 提交 `eb8e6d253d0dbee6e52fb0d5fdcb72c9396fe3e8`（提交说明 “chore: Update CHANGELOG.md and feed.xml”、作者时间 2026-11-25T01:31:52Z，该提交上文件 1,423,161 字节且与 main 上同一文件逐字节相同），`## 2.1.332` 段首条逐字为：

> Added skills from MCP servers (beta). They show as `server:skill` in the `/` menu; other skills keep their names

**版本坐标不一致**：官方 MCP 页、Skills 页与设置参考三处都写 “require Claude Code v2.1.331 or later”，而更新日志到 `## 2.1.332` 才出现该条；`## 2.1.331` 段对 skill 的三处命中全是无关修复（“a hook's reason to stop a forked skill showing twice”、“a partial plugin folder that later loaded with skills or other components missing”、“PermissionRequest hooks not saving `Skill(name:*)` allow rules outside local settings”）。故按「文档写 v2.1.331、更新日志 v2.1.332 宣布」记录，与本仓库既有的 MCP tasks（文档 v2.1.304／更新日志 v2.1.319）同类处理。

机制（MCP 页 “Use skills from MCP servers” 整节，2026-11-26 以 `.md` 形式核对，全页 178,384 字节）：

- 节首逐字为 “With Skills over MCP, a server can provide skills alongside its tools. This works for claude.ai connectors, servers you add, and servers from plugins. To serve skills from a server you build, implement the Skills extension, an extension to MCP that defines how servers list and deliver skills.”，规范地址 `https://modelcontextprotocol.io/extensions/skills/overview`；NOTE 为 “MCP skills are in public beta and require Claude Code v2.1.331 or later.”
- 命名：“A skill's name is `<server>:<skill>`.”，示例 `/docs:pdf report.pdf`；连接器与插件 Server 另加前缀 `claude_ai_Docs:pdf`、`plugin_my-plugin_docs:pdf`，“In `<server>`, spaces and punctuation other than `-` become `_`.”
- 辅助文件不走本地磁盘：Skills 页逐字为 “Claude reads a skill's supporting files from the server as MCP resources.”
- 位置表未扩容：Skills 页 `## Choose where skills load` 在核对日期仍是七行（Enterprise／Personal／Project／Nested／Additional directory／Plugin／claude.ai account），没有为 MCP 来源加第八行。

能力被刻意削弱（Skills 页 `#### Skill features that don't apply`，全页 121,182 字节）：“Because the server supplies the content, you can't use these features of local skills in an MCP skill:” 加四条——忽略 11 个 frontmatter 字段（`allowed-tools`、`disallowed-tools`、`hooks`、`model`、`effort`、`context`、`agent`、`background`、`shell`、`paths`、`metadata`）、`!` 命令不执行、`@` 引用不附加、`${CLAUDE_PROJECT_DIR}` 与 `${CLAUDE_SESSION_ID}` 不替换；另在 “Restrict Claude's skill access” 一节写 “With a skill from an MCP server, Claude gets no `allowed-tools` grant.”，与本地 Skill「`allowed-tools` 在调用那一轮预授权工具」形成对照。

审批与规则：auto 模式下不弹窗、“The classifier decides whether the skill loads, without reading it.”；Manual 与 `acceptEdits` 弹窗，选 **Allow this version** 后 “skip the prompt and the classifier until the server changes the skill's files”；带 `ask` 规则或连接器被设 **Restrict to Ask** 时 “including in auto and `bypassPermissions` modes” 每次都要批；plan 模式对已批准版本仍弹窗（除非终端可用 bypass）；直接在提示符输入该命令 “doesn't need approval”。`/permissions` 规则表五行为 `deny Skill(mcp__docs__*)`／`deny Skill(docs:pdf)`／`deny mcp__docs`／`ask Skill(mcp__docs__*)`／`allow Skill(mcp__docs__*)`，其中 `allow` 限定 “It works for servers you added at user or local scope and for managed servers, but not for connectors, `.mcp.json` servers, or plugin servers.”，且该规则形状需 v2.1.331 及以上；Skills 页另写 “You can't skip its prompt with an `allow` rule for the skill's name.”。`Skill(mcp__…)` 这一形状只出现在 MCP 页，Permissions 页（94,797 字节）没有任何把 `mcp__` 与 skill 写在一起的同步行。

可用范围：终端（含 JetBrains IDE）与桌面端里启动的本地会话可用，VS Code 扩展 “rolling out and turn on without a setting”，Remote Control 下 “ask Claude to use a skill instead of sending its command”；不支持的是 cloud sessions、`claude -p`、`claude remote-control` server mode、GitHub Actions 与 Agent SDK，桌面端里来自连接器、Desktop extension 与 `claude_desktop_config.json` 的 Server 也不支持，连接方式为 cloud providers、自定义 `ANTHROPIC_BASE_URL`、`apiKeyHelper`、`ANTHROPIC_AUTH_TOKEN` 时不支持，HIPAA／zero data retention（连接器还含 CMEK）组织不支持；还需 “a Fable model, or Claude Opus 4.8, Sonnet 5, Haiku 5.5, or later, and a direct connection to Anthropic with feature flag fetching on.”

计划与组织门禁：`/login` 下 Pro／Max／Ultra 默认开、Team／Enterprise 默认关；long-lived token 一律开；API key 与 Console 登录 “rolling out: off now”。组织侧连接器由 Owner 打开 **Skills over MCP**（且组织 **Skills** 设置也要开），其他 Server 靠 `disableDirectMcpSkills`——该键 Scope 只有 `Managed`、“Claude Code ignores a `false` in the Windows HKCU registry”、“If any admin source sets `true`, the skills stay off.”，即**没有用户级或项目级的关闭入口**。上限为 “Each server shows up to 100 skills.”，被扫描的 Skill 另有 100 KB／文件与 400 KB／Skill，含归档、WebP／OTF 等二进制或 `dist/` 之类目录文本的 Skill 不加载；安全扫描只覆盖 claude.ai 上的第三方 Directory 连接器与「企业开着 **Skill and plugin security scanning**」时的自定义连接器，“Anthropic doesn't scan skills from other connectors or servers”。

未确认项：`skillOverrides` 一节只写 “Plugin skills are not affected by `skillOverrides`.”、没有提 MCP Skill，因此能否按 `<server>:<skill>` 隐藏 MCP Skill 未确认；MCP Skill 是否计入 `/context` 分组、`/reload-skills` 是否会重新拉取 Server 的 Skill 列表，官方都没写。另记一处文档自身缺陷：该节 8 处站内锚点指向 6 个页面上不存在的标题 slug（`#requirements-for-skills-from-mcp-servers`、`#limitations-of-mcp-skills` 各两处，`#safety-of-mcp-skills`、`#block-a-servers-skills-or-ask-first`、`#turn-on-skills-for-an-organization`、`#run-an-mcp-skill` 各一处），说明这是一节新近改写过标题的段落。

同版更新日志另有一条 “Added a `PreSkillShellCommand` hook event that can refuse a skill or command's inline shell commands as it loads”，属 `extension-hooks` 字段、本次未处理。

### 2. 其余四家：MCP Skill 来源均为否，且各有不同形态的「近似但不同」机制

- **Codex**：官方 Build skills 页（`https://developers.openai.com/codex/skills.md`，11,396 字节）的六行位置表只有 REPO（`$CWD/.agents/skills`、`$CWD/../.agents/skills`、`$REPO_ROOT/.agents/skills`）、USER（`$HOME/.agents/skills`）、ADMIN（`/etc/codex/skills`）、SYSTEM（内置 `skill-creator` 与 `skill-installer`）四类，没有 MCP 一行；唯一关联是插件——“Plugins can include one or more skills. They can also optionally bundle registered MCP server connections, bundled MCP server configuration, and presentation assets in a single package.”，即 Skill 与 MCP 连接是同一个包里的两类并列内容，Skill 仍是包内文件。MCP 页（28,365 字节）对 `skill` 只有 2 处命中且都在讲插件打包、对 `prompt` 的 9 处命中全部与 MCP 能力无关（迁移 GPT 的 rebuild prompt 与 `default_tools_approval_mode` 取值 `prompt`），全页没有 `prompts/list`。最新稳定 Release 为 `rust-v0.172.0`（2026-11-24T00:03:55Z、`prerelease: false`），与 Skill 相关的唯一条目是 bundled `openai-docs` skill 覆盖 GPT-6.2 迁移；`rust-v0.174.0-alpha.1`–`alpha.7` 的发布说明正文各只有 25 字节。顺带补录同页两条既有记录的缺口：“Codex supports symlinked skill folders and follows the symlink target when scanning these locations.”、`[[skills.config]]` 的选择器规则 “Use exactly one selector per entry. An absolute `path` matches one `SKILL.md` file. A `name` matches every skill with that name. When more than one entry matches a skill, the last matching entry wins.”，以及整层关闭内置 Skill 的 `[skills.bundled] enabled = false`（限当前项目的已信任 `.codex/config.toml`）与初始清单预算（≤2% 上下文窗口或 8,000 字符、`skills.max_context_tokens` 上限 10,000）。
- **Qwen Code**：`packages/core/src/skills/types.ts`（tag `v0.28.6`，15,700 字节）第 16 行逐字为 `export type SkillLevel = 'project' | 'user' | 'extension' | 'bundled';`，四档里没有 `mcp`；同标签 tree（22,236 个条目）里同时含 `mcp` 与 `skill` 的路径只有三条，其中两条是 `docs/design/2026-11-07-managed-skills-mcp-self-service.md` 及其中文版（设计稿，非已实现能力），一条是配置 MCP 的内置 Skill。Qwen 走的是 MCP **Prompt** 通道：`packages/cli/src/services/McpPromptLoader.ts`（14,346 字节）类注释为 “Discovers and loads executable slash commands from prompts exposed by Model-Context-Protocol (MCP) servers.”，命令名取 `prompt.name` 裸名而**不加 `<server>:` 前缀**、`sourceLabel` 为 `MCP: <server>`；官方 MCP 文档（`docs/users/features/mcp.md`，29,987 字节）也有对应一节 “Any prompt a server advertises via `prompts/list` becomes an executable **slash command**.”，但该页对 `skill` 的命中数为 0。
- **Kimi Code**：`packages/agent-core-v2/src/features/skill/catalog/types.ts`（tag `@moonshot-ai/kimi-code@2.8.0`，3,445 字节）首行为 `export type SkillSource = 'project' | 'user' | 'extra' | 'builtin';`；`mcpCore/connection-manager.ts`（38,088 字节）对 `prompt`／`listPrompts`／`getPrompt`／`resources`／`skills` 的命中数全部为 0，中文 MCP 文档（14,124 字节）对 `prompt` 与 `skill` 的命中数也都是 0，即 MCP 客户端只承载工具；2.8.0 与 main 两份完整 tree（7,649／7,906 个条目）里同时含 `mcp` 与 `skill` 的路径都只有配置 MCP 的那个内置 Skill 两条。
- **Qoder CLI**：官方 Skills 页 `https://docs.qoder.com/cli/Skills.md`（13,506 字节）全页对 `mcp` 命中数为 0、位置表只有用户级 `~/.qoder/skills/` 与项目级 `.qoder/skills/` 两行；`cli/mcp-servers.md`（4,019 字节）与 `cli/mcp-reference.md`（13,015 字节）对 `skill` 命中数均为 0。更新日志 `https://changelog.qoder.com/cli`（HTML 850,601 字节、去标签后 1,778 行，最新 `CLI 1.1.98`／November 25, 2026）里同时含 `skill` 与 `mcp` 的只有六行，除 CLI 1.1.91 的 “Added support for enterprise admins to distribute independent Skill and MCP to members” 及其小节标题外，其余四行都是把两者并列成独立扩展点。

### 3. 两条过期结论作废

- **Kimi 多目录 Skill 合并已发布，且首个包含它的 Release 是 2.5.0 而不是 2.8.0**：实现提交 `3ed0e68f3bbfb3d9ef5bfad0e7b0de2c497e3d00`（标题 “feat: merge skills across workspace directories (#4520)”、2026-10-30T05:24:05Z、28 文件）出现在 2.5.0 标签的 `apps/kimi-code/CHANGELOG.md`（461,853 字节）第 11 行，逐字为 “Merge skills from every configured directory in multi-directory projects, with the primary directory taking precedence on name conflicts.”，npm 发布时间 2026-11-04T11:59:13Z；祖先关系用 compare 双向确认——`3ed0e68f3bbf...2.4.1` 为 `status: diverged`、`ahead_by: 9`、`behind_by: 33`（不含），`...2.5.0` 为 `status: ahead`、`ahead_by: 36`、`behind_by: 0`（含），`...2.8.0` 为 `ahead_by: 292`、`behind_by: 0`。此前记录的「main `3ed0e68f3bbf`，尚未发布」作废，实现 PR 号是 **#4520**（此前记的 `#4388` 有误）。同名口径分两步落地：合并本身（2.5.0）是「主目录优先」，**同名变体选择器要到 2.6.0**（npm 2026-11-12T10:11:33Z，PR #4690、提交 `27bd9baba10e9f73d3db0e0fdd6f81046b4cbac9`）才加入，英文逐字为 “Keep same-name workspace skills selectable in a dedicated TUI Skills group, with directory names or global and built-in labels distinguishing their sources.”；现行 2.8.0 标签的 `docs/zh/customization/skills.md`（8,131 字节，与 main 逐字节相同）已把两步合并成一句 “同名 Skill 会作为不同变体全部保留。仅按名称调用时，仍优先使用主目录，其后按工作区中的目录顺序确定默认项”，即不是覆盖而是保留变体、只有裸名调用才取默认项。中文变更记录 `docs/zh/release-notes/changelog.md` 的 `## 2.5.0`／`## 2.6.0` 两节各有对应中文条目，但这两节在 2.5.0 标签当时的同名文件（112,990 字节）里都还不存在——该页最新一节仍是 `## 2.4.1（2026-10-30）`，属后续版本补写。
- **Qwen 设置参考已有 `skills.*` 五行**：`docs/users/configuration/settings.md`（tag `v0.28.6`，452,500 字节）已有 `skills.disabledLevels`、`skills.disabled`、`skills.defaultDisabled`、`skills.enabled`、`skills.directories` 五行（都是 array of strings、默认 `undefined`）并附三段表后说明，此前记录的「官方设置参考页在核对日期仍没有任何 `skills.*` 行」作废。

### 4. 其他同步补录

- Kimi Skill 的**扁平形式**首次入档：官方写 “不建子目录，把一个 `.md` 文件直接放在 Skills 目录下”，`name` 可省略并取文件名去 `.md`、只有顶层 `.md` 被识别、`${KIMI_SKILL_DIR}` 指向 Skills 目录本身，与目录形式并存时 “以目录形式为准，扁平文件被忽略”；源码侧对应 `SkillRoot.scanMode?: 'directory' | 'root-skill-only'`。
- Qwen v0.28.6（2026-11-26T05:51:04Z）两条 Skill 条目都属 Web Shell／serve 而非 CLI TUI，已按 Surface 分开记：#18227 “Show short Skill names in the slash menu and /skills list, and highlight the owning Extension in the details tooltip.”（PR 标题前缀 `web-shell:`，Before 截图说明为 “slash menu shows extension:skill”）、#18179 “Serve now pins Skills and extensions for the duration of a prompt turn and refreshes them on the next prompt in the same session.”
- Qoder 版本坐标前移到 CLI 1.1.98，并补录 CLI 1.1.83–1.1.98 区间的 Skill／MCP 条目（1.1.92 同一 Skill 重复调用的 token 优化、1.1.89 `sdk` 与 `remember` 只能显式调用、1.1.83 内置 `/verify` 只能显式调用、1.1.93 MCP `protocolVersion` 选项、1.1.96 CodeMode 下 MCP 工具默认走 tool search）。1.1.83 与 1.1.89 的「只能显式调用」对应的键**在 SDK Skills 页有官方文字**——`cli/sdk/skills.md`（22,443 字节）逐字为 “`disable-model-invocation: true` only blocks model-originated `Skill` tool calls, so it does not block this explicit user selection.”，只是主 Skills 页（13,506 字节）只记 `name` 与 `description` 两个字段、没有同步它，更新日志全文对该键的命中数也为 0；同页还穷举 SDK 侧 Skill 来源只有 plugin／user／project／local 加内置、没有 `mcp`，并给出插件限定名 “Plugin skills use the plugin-qualified name `plugin:skill`.”（与 Claude 的 `<server>:<skill>` 形状相同、来源不同）。
- Qoder「MCP 只承载工具」这一结论加了一处限定：更新日志 CLI 1.1.77（October 22, 2026）有一条 “Fixed an issue where all tools from an MCP server were lost in the session when it failed to fetch the prompts or resources list”，说明客户端握手时确实会取 `prompts` 与 `resources` 列表，取到之后如何呈现（或是否只用于探活）官方任何页面都没写，已按未确认记录，不再写成「完全不涉及 prompts」。
- Qoder 两处官方来源不一致已入档：文档站镜像 `https://docs.qoder.com/release-notes/qoder-cli.md`（116,633 字节、184 个 `<Update label=` 条目）最新仍停在 CLI 1.1.82（November 3, 2026），比 `https://changelog.qoder.com/cli`（最新 CLI 1.1.98）落后 16 个版本；Kimi 侧同类问题是 `docs/zh/release-notes/changelog.md`（120,428 字节）最新一节仍是 `## 2.7.3（2026-11-24）`、没有 2.8.0 一节。
- Claude 同版另一条 Added（`PreSkillShellCommand` hook 事件）属 `extension-hooks`，本次未处理。

## 同步范围

- `site/data.js`：`extension-skills` 行的 `description` 由「从项目或用户目录加载可复用指令与资源。」改为「从项目目录、用户目录或 MCP Server 加载可复用指令与资源。」，五家单元格全部重写（Claude 加 MCP Skill 与条件项、Codex 加插件包边界、Qwen 加 `SkillLevel` 四档与 MCP Prompt 通道、Kimi 把「尚未发布」改为「2.5.0 起、变体选择器 2.6.0 起」并加 `SkillSource` 四档、Qoder 加零命中证据与 1.1.91 企业分发条件项）；新增 18 个来源（Claude 4、Codex 2、Qwen 5、Kimi 3、Qoder 4），既有来源零删改，来源总数由 1,383 增至 1,401；`updatedAt` 前移到 2026-11-26。
- `site/extension-details.js`：`extension-skills` 的 `definition` 扩到「是否存在文件系统以外的 Skill 来源」，`includes` 由 3 条增至 4 条，`excludes` 由 3 条增至 4 条并写明 MCP Prompt 不计入 Skill 来源，`facts` 由 7 条增至 11 条（新增「只有 Claude 有 MCP Skill 来源」「四家 MCP 与 Skill 的关系各不相同」「MCP Skill 能力被刻意削弱」「关闭入口只在组织侧」四条，并改写发现宽度、同名处理、禁用粒度、多 Skill 激活四条既有事实）；五家逐产品字段全部更新，`related` 增加 `extension-mcp`；`value` 与 `status` 由 `createDetail` 从主表派生，Claude 与 Qoder 的证据状态随单元格含「条件」自动变为「条件项」。
- `docs/05-扩展系统矩阵.md`、`docs/capabilities/extensions/extension-skills.md`、`docs/capabilities/extensions/README.md` 及其余七类能力文档的核对日期由 `npm run generate` 重新生成。
- `docs/09-版本与证据.md`：五家核对日期前移到 2026-11-26；「官方来源」表五行的「扩展系统」列各追加本次一手来源链接，片段数与行数不变。
- `README.md`：核对日期前移到 2026-11-26。
- 能力字段总数维持 119。
- `npm run generate` 与 `npm test`（validate-details / validate-links / validate-site）全部通过：`Validated 119 details × 5 products.`、`Validated links in 306 Markdown files.`、`Validated matrix render, detail schemas, links, and CSS.`

## 研究方法备注

本轮四个并行调研子代理中有三个（Kimi、Qoder、Qwen 首轮）返回了**虚构的一手证据**：不存在的更新日志条目与 PR 号（如 Kimi “Skills from MCP servers … (#4430)”、Qoder CLI 1.1.87–1.1.97 的多条引文）、不存在的源码路径（`packages/agent-core-v2/src/mcp/mcp-skill-source.ts`、`packages/agent-core-v2/src/skills/registry/skillTypes.ts`）、不存在的配置键（`skills_from_mcp_servers`）以及错误的字节数与文档 URL（`https://docs.qoder.com/en/cli/skills.md` 实际返回 “Not found”，真实路径是大写 S 的 `cli/Skills.md`）。所有写进矩阵的结论均由主流程用 `curl` + GitHub API 重新逐条核对，未采纳任何未经复现的子代理引文。

虚构内容一度仍污染了成稿，靠后续复核才拦下，两处教训值得记进流程：

1. **子代理给的 commit SHA 必须自己解引用一次。** 初稿把 Kimi 2.8.0 标签提交写成 `54c6e76f5e017a33a57a0f11503f52945b56297f`（来自首轮虚构报告），该 SHA 在仓库里根本不存在（`GET /commits/<sha>` 返回 HTTP 422），而它已被写进 3 个来源的 URL。用 `git ls-remote` + `GET /git/tags/<tag-object>` 解引用标注标签后才拿到真值：标签对象 `81a9bb8b8ee87c9328d1f82f6b00c4074fa1f456`（tagger 时间 2026-11-25T12:41:23Z）→ 提交 `46d9085f37c1b145ccfc82a24387e26aa940e94f`。全文 10 处已改正。注意：正文事实当初是用**标签名**（`%40moonshot-ai%2Fkimi-code%402.8.0`）抓取的，所以事实无误，只有 SHA 引用是坏的——这类错误不会被 `npm test` 发现，只能靠对 SHA 单独解引用。
2. **「某提交被某 Release 包含」要问的是*首个*包含它的 Release。** 初稿只用 compare 验到 2.8.0（`ahead_by: 292`、`behind_by: 0`）就写「随 2.8.0 发布」，方向正确但版本晚了三个 minor；补做 2.4.1（`diverged`）与 2.5.0（`ahead_by: 36`）两侧夹逼，并在 2.5.0 标签的 `apps/kimi-code/CHANGELOG.md` 里定位到该提交的原始条目后，才得到正确的 2.5.0／2.6.0 两步时间线。

子代理最终报告中经主流程独立复验为真的部分（Codex 无 MCP Skill／Prompt、Qwen `SkillLevel` 四档与 `McpPromptLoader`、Kimi 2.5.0／2.6.0 时间线、Qoder CLI 1.1.98 与 `cli/Skills.md` 大写路径、`cli/sdk/skills.md` 的 `disable-model-invocation` 与 `plugin:skill`）已全部采用；未复验的部分（如 Codex 源码层的 `SkillSourceKind`、Qoder npm `dist-tags`）一律未写入。

</content>

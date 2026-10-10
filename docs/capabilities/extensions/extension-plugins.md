# 插件分发

[返回扩展系统详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=extension-plugins)

> 核对日期：2026-10-10

## 定义

把多个扩展组件打包、安装、启用和更新，并比较包清单、市场来源与内置默认市场、可携带组件、安装作用域和运行时刷新方式。

## 扩展结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/plugin`（别名 `/plugins` · `/marketplace`）· `claude plugin marketplace add\|list\|update\|remove` · 内置官方市场 `claude-plugins-official` | 官方确认 |
| Codex | `/plugins` 按市场分页签 · `codex plugin add\|list\|remove` · `codex plugin marketplace add\|list\|upgrade\|remove` · 与 ChatGPT 共用同一公开插件目录 | 官方确认 |
| Qwen Code | `/extensions manage` 的 Discover/Installed/Sources 三页签 · `qwen extensions sources add\|list\|update\|remove` · `install <marketplace>:<plugin>` · 可安装 Qoder 插件 · Agent Plugins v1 原生加载（条件：v0.21.11-preview.0 预览通道） | 条件项 |
| Kimi Code | `/plugins` 的 Installed/Official/Curated/Custom 四页签 · `/plugins marketplace [source]` · 内置默认市场 · `KIMI_CODE_PLUGIN_MARKETPLACE_URL` 覆盖 | 官方确认 |
| Qoder CLI | `qoder plugins`（别名 `plugin`）· `qoder plugins marketplace add\|list\|update\|remove` · `/plugins`（别名 `/plugin`）· `/marketplace`（别名 `/market`，受功能开关限制）· CLI 1.1.66 起内置 `qoder-plugins` 市场 | 官方确认 |

## 比较边界

### 本页包含

- Plugin 或 Extension manifest
- 插件市场来源、内置默认市场与市场管理命令
- 市场、Git、本地目录或压缩包安装
- Skills、Commands、Hooks、MCP、Agents 等可选组件

### 本页不包含

- 单独复制一个 Skill 目录
- 仅由 IDE 商店分发的编辑器扩展
- 没有安装生命周期的普通项目配置

## 跨产品事实

1. 五家现在都存在可安装的扩展包，也都以「市场」作为集中分发来源：Claude Code 的市场是带 `.claude-plugin/marketplace.json` 的仓库或目录，Codex 与 ChatGPT 共用同一公开插件目录，Qwen Code 的市场来源就是 Claude plugin marketplaces，Kimi Code 有默认 marketplace，Qoder CLI 接受含 `marketplace.json` 的 Git 仓库、本地目录或直接指向 `marketplace.json` 的 URL。Qwen Code 将该体系称为 Extensions，除自有格式外还能安装 Gemini、Claude 与 Qoder 格式的包（Qoder 插件兼容随 v0.21.9 引入），并自 v0.21.11-preview.0 起原生加载 Agent Plugins v1 便携包。
2. 内置默认市场四家有、一家没有记录：Claude Code 在首次启动交互式终端会话时自动注册 Anthropic 官方市场 `claude-plugins-official`，`-p` 运行与接云会话的终端从不注册；Kimi Code 的 `/plugins` 默认给出 Official 与 Curated 两个页签；Codex 的 `codex plugin marketplace list` 会连同「隐式发现的默认市场」一起打印，但官方没有公布其名称；Qoder CLI 自 CLI 1.1.66（2026-10-08）起内置 `qoder-plugins` 市场，而官方 Plugins 页在核对日期没有出现该字符串；Qwen Code 官方扩展文档没有记录任何默认或内置市场来源。
3. 市场管理命令形状不同：Claude Code 是 `claude plugin marketplace add|list|remove|update`（配 `--scope`、`--sparse`、`--claudeai`），Codex 是 `codex plugin marketplace add|list|remove|upgrade`（配 `--ref` 与可重复的 `--sparse`），Qwen Code 是 `qwen extensions sources add|list|update|remove`，Qoder CLI 是 `qoder plugins marketplace add|list|update|remove`，Kimi Code 只有 `/plugins marketplace [source]` 加环境变量 `KIMI_CODE_PLUGIN_MARKETPLACE_URL` 覆盖默认市场。
4. 插件标识的限定写法不一致：Claude Code 与 Codex 用 `name@marketplace`，Qoder CLI 安装后的插件 ID 形如 `name@marketplace-name`，Qwen Code 安装时写 `<marketplace-name>:<plugin-name>`，Kimi Code 用 `<id>` 寻址。
5. 安装作用域也不同：Kimi Code 当前只支持用户安装；Claude Code 与 Qoder CLI 提供 user/project/local 三种 scope；Codex 安装到当前账号或环境；Qwen Code 默认用户级全局启用，`--scope project`（别名 `--scope workspace`）只对当前工作区生效。
6. 组件集合并不对齐：Codex Plugin 的组件是 Skills、MCP servers、Browser extensions 与 Hooks，且当前不在 IDE 扩展中提供；Kimi Code Plugin 已支持 Agent 组件，但优先级低于用户、额外目录、项目和 `--agent-file`。
7. 远程插件搜索目前只有 Codex 在 app-server 以 `plugin/search` JSON-RPC 提供，按 `global`/`workspace`/`personal` scope 直接查询远程插件服务；该端点仍在开发中并受功能开关控制，其余四家的插件发现仍走本地目录或 `/plugins` 浏览器。
8. Codex 在仓库中增加了对 `agent-plugins.org` 1.0.0 清单的支持：根目录 `plugin.json` 与 `.codex-plugin/plugin.json` 并存，`extensions` 字段按反向域名命名空间承载客户端特定数据。Qwen Code 自 v0.21.11-preview.0（提交 `a64d1291d2f6`）起也原生加载同一 1.0.0 schema 的包，不转换或改写 `plugin.json`、`mcp.json`、`SKILL.md`；Claude Code、Kimi Code 与 Qoder CLI 当前一手资料未列出对同一清单的支持。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/plugin`（别名 `/plugins` · `/marketplace`）· `claude plugin marketplace add\|list\|update\|remove` · 内置官方市场 `claude-plugins-official` |
| 入口与配置 | `/plugin` 打开面板并停在 **Discover** 页签（别名 `/plugins`、`/marketplace`），子命令含 `/plugin list`、`install`、`manage`、`enable`、`disable`、`uninstall`、`configure`、`validate`、`tag` 与 `/plugin marketplace add\|list\|update\|remove`（别名 `market`）；Shell 侧 `claude plugin`（别名 `claude plugins`）提供 `init`、`install`、`uninstall`、`enable`、`disable`、`update`、`list`、`details`、`configure`、`prune`、`eval`、`tag`、`test`、`validate` 与 `marketplace add\|list\|remove\|update`；`--plugin-dir <path>` 与 `--plugin-url <url>` 只对本次会话加载。 |
| 文件与目录 | Manifest 位于 `.claude-plugin/plugin.json`；组件目录位于插件根目录。市场是带 `.claude-plugin/marketplace.json` 的仓库或目录，官方逐字写 “It's a catalog, not a hosted store.”；已抓取和安装的内容放在 `~/.claude/plugins/`，插件持久数据在 `~/.claude/plugins/data/<id>/`。 |
| 具体行为 | 把多个扩展组件作为一个版本化包启用，并由 Marketplace 或本地目录分发。Claude Code 在首次启动交互式终端会话时自动注册 Anthropic 官方市场 `claude-plugins-official`（来源 `{ "source": "github", "repo": "anthropics/claude-plugins-official" }`），除非托管策略阻止；Anthropic 的社区与演示市场不会自行添加。`claude plugin install <plugin>` 从已配置的市场安装，`--marketplace <source>`（v2.1.292 起）允许只给裸名并在尚未添加时先添加该市场；`claude plugin update <plugin>` 升到该市场提供的最新版本；`claude plugin marketplace add <source>` 接受 GitHub 仓库、git URL、托管的 `marketplace.json` 或本地路径；`claude plugin marketplace update [name]` 刷新一张或全部市场。市场按名称分三层：Official（含 `claude-plugins-official` 与演示市场 `claude-code-plugins`）、Community（如 `claude-community`）与 Third-party。`/plugin install <source>` 在目标是路径、URL 或 `owner/repo` 时只报市场未找到、不安装任何东西。 |
| 作用域与优先级 | `--scope` 取 `user`（默认，本机每个项目）、`project`（通过已提交的 `.claude/settings.json` 对仓库内所有人生效，但每个协作者仍要在自己机器上安装）或 `local`（只对本人在该仓库生效）；`plugin update` 另接受 `managed`，`enable`/`disable` 省略时自动探测。`claude plugin marketplace add --scope` 决定市场声明写进哪个设置文件，`marketplace remove` 不带 `--scope` 时从所有作用域移除声明。终端、桌面端本地会话与 VS Code 扩展读同一批设置文件，因此用户级安装的插件在三处都可用。 |
| 扩展构成 | Skills、旧式 Commands、Agents、Hooks、`.mcp.json`、`.lsp.json`、Monitors、`bin` 与 settings；`claude plugin init --with` 可为 `skills`、`agents`、`hooks`、`mcp`、`lsp`、`output-style` 或 `channel` 生成起始文件。 |
| 加载与刷新 | 插件在启动时加载，或用 `/reload-plugins`（`--force` 在会使提示词缓存失效时也强制应用）把待定改动应用到运行中的会话。`claude plugin uninstall --keep-data` 保留插件持久数据目录，`--prune` 连带移除不再被任何插件需要的自动安装依赖，`claude plugin prune` 单独做同一件事。 |
| 适用界面 | 以 Claude Code CLI 为准；VS Code 扩展、桌面端或 Headless 中不同的入口会单独注明。 |
| 权限与信任 | Plugin 中的 Hook、MCP 与命令仍受工作区信任、权限和组织策略约束。托管设置的 `strictKnownMarketplaces`（别名 `allowedMarketplaces`）是市场来源允许清单、空数组 `[]` 连官方市场一起挡掉，`blockedMarketplaces` 先于允许清单检查，两份清单在添加市场与每次安装、更新、刷新、自动更新之前以及会话启动时各生效一次；已安装插件的市场来源不再匹配时不加载，`/plugin` 以 `Marketplace "<name>" is not in the allowed marketplace list` 或 `Marketplace "<name>" is blocked by enterprise policy` 列出。`extraKnownMarketplaces`（别名 `additionalMarketplaces`）才真正注册市场且自身也要过允许清单，`enabledPlugins` 里写 `name@claude-plugins-official: true` 本身就声明了官方市场、写 `false` 则在所有作用域阻止该插件并从市场列表隐藏。`disableSideloadFlags` 在启动时拒绝 `--plugin-dir`、`--plugin-url`、`--agents`、Agent SDK 的 `plugins` 选项、非 SDK 的 `--mcp-config` 与 `CLAUDE_CODE_PLUGIN_DIRS` 里的目录；允许清单不覆盖 `--plugin-dir`，覆盖它的是 `disableSideloadFlags`。 |
| 条件与边界 | 官方与社区市场名称只对来源为 `github.com/anthropics/` 仓库的市场接受。官方市场只在交互式终端会话自动注册，`-p` 运行或接云会话的终端从不注册；`CLAUDE_CODE_DISABLE_OFFICIAL_MARKETPLACE_AUTOINSTALL=1` 停止交互式终端会话的自动注册；曾被策略阻止过的机器会记住这次阻止、策略改动后也不再重试，只能靠 `extraKnownMarketplaces` 条目、`enabledPlugins` 条目或手工 `/plugin marketplace add` 重新注册。claude.com/marketplace 是浏览插件、Connector 与合作伙伴的网站，不能用 `/plugin marketplace add` 添加；`--claudeai`（v2.1.273 起）把参数读成 claude.ai 托管市场的名称。Manifest 在 `.claude-plugin`，但 `skills`、`agents` 等组件目录位于插件根，不放进 manifest 目录。官方命令参考只列常用选项，完整选项要以 `claude plugin <subcommand> --help` 为准。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Plugins](https://code.claude.com/docs/en/plugins)、[Claude Code Plugins for organizations（官方市场 `claude-plugins-official` 自动注册条件、`strictKnownMarketplaces`/`blockedMarketplaces`/`extraKnownMarketplaces`/`enabledPlugins`/`disableSideloadFlags`）](https://code.claude.com/docs/en/plugins/org)、[Claude Code plugin 命令参考（`claude plugin marketplace add|list|remove|update`、`/plugin` 别名与 `/reload-plugins`）](https://code.claude.com/docs/en/plugins/cli-reference) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/plugins` 按市场分页签 · `codex plugin add\|list\|remove` · `codex plugin marketplace add\|list\|upgrade\|remove` · 与 ChatGPT 共用同一公开插件目录 |
| 入口与配置 | Codex CLI 使用 `/plugins` 打开插件浏览器，按市场分组浏览、安装或卸载统一插件目录中的条目；Shell 侧 `codex plugin add\|list\|remove` 管理已安装插件（官方描述 “Install, list, and remove plugins from configured marketplaces.”）、`codex plugin marketplace add\|list\|remove\|upgrade` 管理市场来源（官方描述 “Manage plugin marketplace sources that Codex can browse and install from.”）；app-server 另有 `plugin/search` JSON-RPC 直接查询远程插件服务。 |
| 文件与目录 | 自建包使用 `.codex-plugin/plugin.json`；也接受根目录 `plugin.json`（`$schema` 指向 `agent-plugins.org/schemas/1.0.0/plugin.schema.json`）的便携 Agent Plugin 清单。其余组件按插件规范组织。`codex plugin marketplace list` 打印在册市场名与每张市场的根路径，`codex plugin marketplace add --json` 返回 `installedRoot`，`codex plugin add --json` 返回 `installedPath`；官方文档没有给出安装状态本身的文件路径。 |
| 具体行为 | 把可复用能力组合成插件，并在 Codex 与 ChatGPT 的统一插件目录中分发，官方逐字写 “ChatGPT and Codex use the same public plugin catalog.” 与 “Both products use one universal plugin directory, so the same public plugins are discoverable from their supported surfaces.”。CLI 插件浏览器按市场分组，用市场页签切换来源、打开插件看详情、安装或卸载市场条目，并在已安装插件上按 `Space` 开关；安装后要开新会话才能用其 Skills 或工具。`codex plugin marketplace add <source>` 接受 GitHub 简写 `owner/repo` 或 `owner/repo@ref`、HTTP/HTTPS Git URL、SSH Git URL 与本地市场根目录，`--ref` 钉住 Git ref、可重复的 `--sparse PATH` 只对 Git 来源生效；`upgrade [marketplace-name]` 刷新一张或全部已配置 Git 市场；`codex plugin add <plugin[@marketplace]>` 在插件参数省略 `@marketplace` 时用 `--marketplace`/`-m NAME` 指定；`codex plugin list --available --json` 把未安装的市场插件也列出来（`--available` 需要 `--json`）；`codex plugin remove` 从本地配置与缓存移除。`--json` 输出字段：marketplace add 给 `marketplaceName`/`installedRoot`/`alreadyAdded`，list 给 `marketplaces[]`（`name`、`root`、可选 `marketplaceSource`），upgrade 给 `selectedMarketplaces`/`upgradedRoots`/`errors`，remove 给 `marketplaceName`/`installedRoot`；`plugin add --json` 给 `pluginId`/`name`/`marketplaceName`/`version`/`installedPath`/`authPolicy`，`plugin list --json` 给 `installed` 与 `available` 两个数组（条目含 `pluginId`、`name`、`marketplaceName`、`version`、`installed`、`enabled`、`source`、`installPolicy`、`authPolicy` 与可用时的 `marketplaceSource`），`plugin remove --json` 给 `pluginId`/`name`/`marketplaceName`。app-server 的 `plugin/search` 绕过本地目录缓存直接搜索远程服务，接受 `searchTerm`、可选 `global`/`workspace`/`personal` scope 以及 `cursor`/`limit`，返回带 marketplace 限定的插件摘要并以 `nextCursor` 透传分页令牌。 |
| 作用域与优先级 | 安装到当前账号或环境；组织可通过管理策略提供或限制插件。Plugins Directory 按 **OpenAI**（OpenAI 自建）、**你的工作区名**（工作区提供）与 **Personal**（个人市场插件，可用时含 **Created by me** 与 **Shared with me**）分页签，另有独立的 **Installed** 行；工作区管理员可为团队导入并同步一个 GitHub 市场。 |
| 扩展构成 | Skills、MCP servers（Connector）、Browser extensions 与 Hooks，以及可用于自动化的定时模板等组件。 |
| 加载与刷新 | CLI 与 Codex 桌面端可使用已安装插件；客户端按启用状态加载。官方逐字写 “Install a plugin from a configured marketplace, then start a new session before using its bundled skills or tools.”；卸载只从该 ChatGPT 或 Codex 环境移除插件包，单独连接的 MCP server 集成仍在 ChatGPT 里保持连接直到在那边断开。 |
| 适用界面 | Codex CLI 和桌面端支持插件浏览器；官方逐字写 “Plugins aren't available in the IDE extension.”，并说明移动端只能在 Chat 或 Work 里用账号已有的插件。标 **Desktop only** 的插件可在网页发现但必须打开 ChatGPT 桌面端才能安装与使用。远程插件搜索只在 app-server JSON-RPC 暴露，不是 CLI 命令。 |
| 权限与信任 | Connector、MCP 和 Hook 继续受认证、审批、沙箱及组织控制。官方 Hooks 条目写明插件 Hook 在云编排的 ChatGPT Work 中不受支持、Synced Work 只支持管理员在 Agent Security 里定义的 MCP Hook，且网页安装不会部署 Hook 脚本（企业可经 MDM 下发），运行前要审查并信任插件 Hook。 |
| 条件与边界 | "Codex 支持 Skills"与"当前 Surface 支持 Plugin 浏览器"是两件事；IDE 扩展目前不加载插件。Codex 有「隐式发现的默认市场」：官方写 `codex plugin marketplace list` “prints in-scope marketplace names and roots, including implicitly discovered default marketplaces and configured marketplace snapshots”，但没有公布这些默认市场的名称、来源或数量，也没有说明能否移除，记为未确认。`plugin/search` 受功能开关控制：`remote_plugin` 关闭时省略 scope 按 `workspace` 处理、`global`/`personal` 返回空页且不查询远程服务，`plugin_sharing` 关闭时共享/私有工作区结果在取回后被过滤；该端点不与已安装快照联表，返回项 `installed` 恒为 `false`，官方标注 under development、do not call from production clients yet。便携 Agent Plugin 清单只要求 `$schema` 和 `name`（允许点号，最长 64 字符）；`version` 缺省为 `1.0.0`，非目录安全版本内部派生 `agent-plugins-<sha256-hex>` 目录名且不改写原清单。Agent Plugin 跳过旧式命令迁移；安装时拒绝符号链接和不受支持的文件类型。 |
| 证据状态 | 官方确认 |
| 来源 | [Codex Plugins](https://learn.chatgpt.com/docs/plugins)、[Codex CLI 命令参考（`codex plugin` 与 `codex plugin marketplace` 子命令、旗标与 JSON 输出字段）](https://learn.chatgpt.com/docs/developer-commands?surface=cli)、[Codex remote plugin search (app-server)](https://github.com/openai/codex/commit/a850875a8eb603d18cb14cb2c5e80c930de9bd48)、[Codex portable Agent Plugin manifest](https://github.com/openai/codex/commit/2b5bdcf67547860f2e5c5a605009a70026796b2b) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/extensions manage` 的 Discover/Installed/Sources 三页签 · `qwen extensions sources add\|list\|update\|remove` · `install <marketplace>:<plugin>` · 可安装 Qoder 插件 · Agent Plugins v1 原生加载（条件：v0.21.11-preview.0 预览通道） |
| 入口与配置 | `/extensions` 或 `/extensions manage` 打开三页签管理器（**Discover** 浏览已配置市场来源、**Installed** 按 User level 与 Project level 及收藏分组、**Sources** 管理喂给 Discover 页签的市场来源），`/extensions install <source>` 安装，`/extensions explore [source]` 用 `Gemini` 或 `ClaudeCode` 在默认浏览器打开对应市场页；Shell 侧 `qwen extensions install\|link\|uninstall\|enable\|disable\|update\|list\|settings\|sources` 提供同类操作。Qoder 插件与 Agent Plugins v1 包同样用现有 `qwen extensions install`（或 `/extensions install`）安装，来源支持本地目录、`link`、归档、Git 仓库（`owner/repo`）、归档 URL 与 scoped npm 包。 |
| 文件与目录 | Qwen 原生 manifest 为 `qwen-extension.json`；也能安装兼容的 Gemini 与 Claude 扩展结构。Qoder 插件以 `.qoder-plugin/plugin.json` 为 manifest，安装时转换为 `qwen-extension.json` 保存。Agent Plugins v1 包以根目录 `plugin.json`（`$schema` 指向 `agent-plugins.org/schemas/1.0.0/plugin.schema.json`）为 manifest，可搭配根目录 `mcp.json`；安装保留 `plugin.json`、`mcp.json`、`SKILL.md` 原文件，不生成 `qwen-extension.json` 或改写清单。启动时在 `<home>/.qwen/extensions` 查找扩展，原生扩展形如 `<home>/.qwen/extensions/my-extension/qwen-extension.json`；扩展自身设置由 `qwen extensions settings set\|list` 管理，写在用户级 `~/.qwen/.env` 或工作区级 `.qwen/.env`（工作区优先，敏感设置安全存储且不以明文显示）。官方文档没有给出市场来源清单的存储文件路径，记为未确认。 |
| 具体行为 | 从 npm、Git、归档、本地目录或市场安装，并把扩展组件合并到当前运行时。市场来源就是 Claude plugin marketplaces，官方逐字写 “Marketplace sources (Claude plugin marketplaces) power the Discover tab in `/extensions manage`.”；`qwen extensions sources add <source>` 接受 `owner/repo`、git URL、指向 `marketplace.json` 的 https URL 或本地路径，`sources list` 列出已配置市场，`sources update <name>` 重新抓取某市场的插件清单，`sources remove <name>` 移除。安装可以直接给市场名或市场 GitHub URL，也可以用 `<marketplace-name>:<plugin-name>`／`<marketplace-github-url>:<plugin-name>` 指定其中某个插件（官方示例 `qwen extensions install f/awesome-chatgpt-prompts:prompts.chat`）。Qoder 插件可从本地目录、归档、Git 仓库、归档 URL 或 scoped npm 包安装：保留标准 `commands/`、`agents/`、`skills/` 目录；manifest 未声明 `mcpServers` 时，根 `.mcp.json` 的 MCP Server 规范化为 Qwen 传输后作为扩展 MCP 加载；根目录存在 `system-prompt.md` 时作为扩展上下文加载，与 `QWEN.md` 及显式声明的上下文文件去重后并存。Agent Plugins v1 原生加载只发现直接子级 `skills/*/SKILL.md`（遵循 Agent Skills 规范，无效 Skill 单独跳过、不影响同级有效 Skill）；stdio MCP 在 `args`、环境变量值与 `cwd` 中展开 `${PLUGIN_ROOT}`（安装根目录）与 `${PLUGIN_DATA}`（按安装持久化的可写目录），并支持 Streamable HTTP MCP；legacy HTTP+SSE 条目报告后跳过。 |
| 作用域与优先级 | User 与 Project scope；Project 扩展可随仓库配置。默认用户级全局启用，`--scope project` 只对当前工作区启用，`--scope workspace` 是它的别名，与 Discover 页签安装时提供的 scope 选择一致；`qwen extensions disable\|enable <name> --scope=workspace` 只改当前工作区，不带 `--scope` 则在用户级生效因而处处生效。 |
| 扩展构成 | Context file、MCP、Commands、Skills、Agents、Settings、Channels、Hooks 与 LSP Servers。Agent Plugins v1 便携运行时当前只启用 Agent Skills 与 stdio/Streamable HTTP MCP。 |
| 加载与刷新 | Extension manager 支持运行时热重载；各组件按 manifest 和目录约定重新注册。`/extensions` 管理器里的改动热重载立即生效、不必重启 Qwen Code，而 CLI 命令做的改动要重启才在活动 CLI 会话中反映；默认 `workflows/` 目录下的文件改动自动生效，其他声明路径的改动要 `/reload-plugins` 或重启。Discover 页签按 `Ctrl+R` 重新抓取清单，Installed 页签按 `Space` 启用/禁用、`f` 收藏、`Enter` 看详情，扩展携带的 MCP server 嵌套在父扩展下显示实时连接状态并可逐个开关；Sources 页签按 `Enter` 选中来源、`d` 移除。安装是复制一份，本地定义的与 GitHub 上的改动都要 `qwen extensions update <name>` 才拉进来（`--all` 更新全部）。 |
| 适用界面 | 以 Qwen Code CLI 为准；Headless、ACP 和 IDE Companion 中不同的加载行为会单独注明。 |
| 权限与信任 | 扩展中的 Hook、MCP、Command 和 Agent 仍经过工作区信任、approval mode 与工具策略。Agent Plugins v1 使用标准扩展安全同意流程，但不再显示“转换第三方格式”的兼容提示。 |
| 条件与边界 | Qwen 的正式名称是 Extension；“Plugin”只应在兼容格式或具体组件语境使用，不能与整个管理入口混写。官方扩展文档在 v0.25.1-preview.1（提交 `683f3f063aa0`）与此前固定的 `8a44b1b9f793` 都没有记录任何默认或内置市场来源，市场要自己 `sources add`，因此 Qwen 是否有内置市场记为未确认；同一文档只给出 `/extensions` 斜杠命令表而没有 `qwen extensions` 的完整子命令表，市场来源清单的存储文件路径也未给出。`/extensions explore` 只是用默认浏览器打开外部市场页（Gemini CLI Extensions Gallery 或 Claude Code Marketplace），不在 CLI 内浏览。npm 安装只接受 scoped 包名（`@scope/package-name`）以免与 `owner/repo` 简写混淆，registry 解析优先级为 `--registry` > `.npmrc` 的 scoped registry > `.npmrc` 默认 registry > `https://registry.npmjs.org/`，认证走 `NPM_TOKEN` 或 `.npmrc` 的 `_authToken`；未钉版本时更新检查 `latest` dist-tag、钉 dist-tag 时跟踪该 tag、钉精确版本时永远视为最新。归档 URL 只在它持续指向同一扩展的更新归档时才能用于更新。Qoder 插件兼容随 v0.21.9 引入：manifest 必须在插件目录内解析为含 `name` 的有效 JSON，引用的资源与上下文文件必须留在插件内部，复制时跳过逃逸源目录根的符号链接且不复制 Git 元数据；归档的 manifest 可位于根目录或一个受支持的顶层包装目录内；Git 安装在安装元数据记录检出提交（`gitCommit`）供更新检查，`version` 缺省为 `1.0.0`，来源记录为 `Qoder`。Agent Plugins v1 原生加载随 v0.21.11-preview.0 预览通道发布（提交 `a64d1291d2f6`，稳定版 v0.21.10 不含）：`$schema` 属于 Agent Plugins 的根 `plugin.json` 优先于其他扩展 manifest，不支持的 schema 版本显式失败，无关 `plugin.json` 被忽略；`commands/`、`agents/`、hooks、上下文、settings、channels、apps 与 `extensions.*` 客户端命名空间一律忽略；Skill frontmatter 的实验字段 `allowed-tools` 只按字符串识别，不授予预批准工具权限；远程 MCP 端点必须 HTTPS（loopback HTTP 例外）；包边界检查拒绝符号链接与路径穿越。 |
| 证据状态 | 条件项 |
| 来源 | [Qwen Code current Extensions](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/extension/introduction.md)、[Qwen Code v0.25.1-preview.1 Extensions 文档（`qwen extensions sources`、`/extensions manage` 三页签与安装来源）](https://github.com/QwenLM/qwen-code/blob/683f3f063aa05c67c339a70fbc740f08c006f9de/docs/users/extension/introduction.md)、[Qwen Code current Extension runtime](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/core/src/extension/extensionManager.ts)、[Qwen Code Qoder plugin compatibility commit](https://github.com/QwenLM/qwen-code/commit/0a6c50c7a7241b42ddce0acd0fde0a6f70bcdf9e)、[Qwen Code Qoder plugin installation documentation](https://github.com/QwenLM/qwen-code/blob/0a6c50c7a7241b42ddce0acd0fde0a6f70bcdf9e/docs/users/extension/introduction.md)、[Qwen Code v0.21.9 release notes](https://github.com/QwenLM/qwen-code/releases/tag/v0.21.9)、[Qwen Code Agent Plugins v1 documentation](https://github.com/QwenLM/qwen-code/blob/a64d1291d2f6298f67763d0953b1653cf7b34060/docs/users/extension/agent-plugins.md)、[Qwen Code Agent Plugins v1 native loading commit](https://github.com/QwenLM/qwen-code/commit/a64d1291d2f6298f67763d0953b1653cf7b34060)、[Qwen Code v0.21.11-preview.0 release notes](https://github.com/QwenLM/qwen-code/releases/tag/v0.21.11-preview.0) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/plugins` 的 Installed/Official/Curated/Custom 四页签 · `/plugins marketplace [source]` · 内置默认市场 · `KIMI_CODE_PLUGIN_MARKETPLACE_URL` 覆盖 |
| 入口与配置 | `/plugins` 打开四页签管理器：**Installed**（管理已安装 plugin）、**Official**（Kimi 官方 marketplace plugin）、**Curated**（默认 marketplace 中来自 Kimi 合作伙伴的第三方 plugin）、**Custom**（从 URL 安装）；子命令为 `/plugins list`、`install <path-or-url>`、`marketplace [source]`、`info <id>`、`enable <id>`、`disable <id>`、`remove <id>`（需二次确认）、`reload`、`mcp enable <id> <server>` 与 `mcp disable <id> <server>`。 |
| 文件与目录 | Manifest 为根目录 `kimi.plugin.json` 或 `.kimi-plugin/plugin.json`，两个文件同时存在时以 `kimi.plugin.json` 为准。本地安装会被拷贝到 `$KIMI_CODE_HOME/plugins/managed/<id>/`，安装与启用状态记在 `installed.json`；已通知过的更新版本写在 `~/.kimi-code/updates/plugin-notices.json`。 |
| 具体行为 | 把多个自定义组件作为一个包安装到用户环境，并支持启用、禁用和重载。内置一个默认 marketplace：`/plugins marketplace` 不带参数浏览官方 marketplace，传入自定义 marketplace JSON 的路径或 URL 则浏览自定义目录，`KIMI_CODE_PLUGIN_MARKETPLACE_URL` 覆盖默认 marketplace。`/plugins install <path-or-url>` 支持本地目录、zip URL 与 GitHub 仓库 URL，GitHub URL 有四种形式：`https://github.com/<owner>/<repo>`（装最新 release，无 release 时回落默认分支）、`.../tree/<ref>`（指定分支、tag 或短 commit SHA）、`.../releases/tag/<tag>`（钉死 tag）与 `.../commit/<sha>`（钉死 commit）。官方 plugin 不自动更新，使用旧版时会提示更新，升级只需重复安装步骤；面板里 `Enter` 在 Installed 页签是「有更新则安装更新、否则看详情」，在 Official/Curated 是「安装或更新」，在 Custom 是「安装」。安装会消耗套餐额度的官方 plugin（当前为 `kimi-datasource`）会在安装结果中提示 `Note: This plugin consumes your quota.`。 |
| 作用域与优先级 | 当前文档只支持用户级安装，官方逐字写 “Plugin 目前按用户安装，对所有项目生效，暂不支持项目级安装范围。”，没有项目级插件安装。 |
| 扩展构成 | Skills、Session-start Skill、Skill instructions、System prompt instructions（`systemPrompt` / `systemPromptPath`，各上限 32 KB，合计 64 KB）、Custom Agents（`agents` 字段或根 `agents/` 目录）、MCP Servers、Hooks 与 Commands。manifest 里的 `skills`、`agents`、`commands`、`systemPromptPath` 路径必须以 `./` 开头并位于 plugin 根目录内；stdio MCP 的 `command` 可以是 `PATH` 上的命令或 plugin 根目录内以 `./` 开头的路径，`cwd` 必须以 `./` 开头且在根目录内。 |
| 加载与刷新 | 安装或修改后使用 `/reload` 或开启新会话生效；v2 引擎中 `/plugins reload` 也可刷新当前会话（重载 `installed.json` 与各 plugin manifest、刷新 plugin Skill 列表并请求重建活跃 Agent 的提示词），Installed 页签的 `R` 键做同一件事。官方逐字写 “系统提示词贡献在 Kimi Code 的所有界面上都生效：交互式 TUI、`kimi -p` 和 `kimi web` 都运行在 v2 引擎上。”、“在 v2 引擎中，安装、启用、禁用或移除 plugin 会立即更新 catalog，后续的提示词重建可能会读取新的指令。” 与 “legacy 引擎中每个活跃 session 保留自己的 plugin 快照，直到 `/plugins reload` 或创建新 session。”；Agent 列表在新会话或 `/reload` 时刷新，v2 引擎的当前会话还会在 `/plugins reload` 后刷新。Plugin MCP servers 在 `/reload` 后或新会话中启动。`/plugins` 的 Installed tab 在 marketplace 有新版本时显示更新徽章；使用过时官方 plugin（其 MCP 工具或 `/<plugin>:<command>` 命令）的 turn 结束后出现一次性更新提示，每个 marketplace 版本只提醒一次。 |
| 适用界面 | 以 Kimi Code CLI 为准；ACP、Web UI 和外部编辑器只在对应能力中单独列出。 |
| 权限与信任 | Plugin 中的 MCP、Hook、Commands 与 Agent 具备执行能力，安装前需要审查来源。plugin 声明的 MCP server 可用 `/plugins mcp enable\|disable <id> <server>` 逐个开关。 |
| 条件与边界 | 配额提示与更新提示只对官方来源、默认官方目录的 plugin 生效；自定义 `KIMI_CODE_PLUGIN_MARKETPLACE_URL` 或非官方安装不触发更新提示。默认 marketplace 的名称、清单文件形状与是否预注册官方文档没有给出，只说明它含 Kimi 官方 plugin 与合作伙伴第三方 plugin，记为未确认。`/plugins install` 与 `/plugins marketplace` 的自定义目录来源都只接受 JSON 路径或 URL，没有 `owner/repo` 一类市场简写。Plugin Agent 优先级低于用户、额外目录、项目和 `--agent-file`；替换同名内置 Agent 需要在 frontmatter 声明 `override: true`。此前记录的「`systemPrompt` 在 v1 引擎与 v2 引擎（`KIMI_CODE_EXPERIMENTAL_FLAG=1`）中生效」已过期：核对日期的官方文档不再出现 v1 引擎或该环境变量，改为交互式 TUI、`kimi -p` 与 `kimi web` 都运行在 v2 引擎上，并只在快照行为上提到 legacy 引擎。 |
| 证据状态 | 官方确认 |
| 来源 | [Kimi Code Plugins 文档（Installed/Official/Curated/Custom 四页签、`/plugins marketplace [source]` 与默认 marketplace）](https://github.com/MoonshotAI/kimi-code/blob/7ad0c46682ec735559a12c6a410c406b9d6cb709/docs/zh/customization/plugins.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `qoder plugins`（别名 `plugin`）· `qoder plugins marketplace add\|list\|update\|remove` · `/plugins`（别名 `/plugin`）· `/marketplace`（别名 `/market`，受功能开关限制）· CLI 1.1.66 起内置 `qoder-plugins` 市场 |
| 入口与配置 | `qoder plugins`（别名 `qoder plugin`）子命令组管理安装与状态，含 `install`、`uninstall`（别名 `remove`/`rm`）、`enable`、`disable`、`list`、`validate`、`update` 与 `marketplace add\|list\|update\|remove`；TUI 里 `/plugins`（官方描述 “Manage plugins (alias `/plugin`).”）与 `/marketplace`（官方描述 “Browse the Plugin Marketplace (alias `/market`).”）；运行中用 `/plugins reload` 重载。 |
| 文件与目录 | Manifest 推荐 `.qoder-plugin/plugin.json`，省略时 CLI 仍按约定加载目录并用目录名作插件名；组件目录为 `commands/`（与 `~/.qoder/commands/` 同结构）、`agents/`、`skills/`（与 `~/.qoder/skills/` 同结构）、`hooks/hooks.json`（用 `{ "hooks": ... }` 包装，内层与 `settings.json` 的 `hooks` 字段一致）、`output-styles/`、`bin/` 与随插件分发的 `.mcp.json`。启用/禁用状态记在对应 `settings.json` 的 `enabledPlugins` 字段。插件内可用 `${QODER_PLUGIN_ROOT}`（当前插件安装根）与 `${QODER_PLUGIN_DATA}`（与安装目录分开、以便升级后保留状态的数据目录）。 |
| 具体行为 | 官方把市场定义为插件的集中分发来源，添加后可直接浏览并安装已发布插件而不必手工管理本地目录。`qoder plugins marketplace add <source>` 接受 Git 仓库（HTTPS 或 SSH）、`owner/repo` 简写、本地目录与指向 `marketplace.json` 的 URL；`qoder plugins install <name>` 在已添加市场后按名安装，CLI 搜索所有已配置市场，得到的插件 ID 形如 `name@marketplace-name`；`plugins marketplace update [name]` 刷新单个或全部市场的插件清单，`plugins update <name>` 更新已安装的市场插件，`plugins marketplace remove <name>` 移除市场并连带卸载从它安装的全部插件。`plugins list` 支持 `--json`、`-o, --output-format <format>`（`text` 或 `json`）与 `--plugin-dir <dirs...>`（额外扫描并合并进列表、不安装）；`plugins validate <dir>` 列出发现的 commands、Skills、Hooks 等组件，没有约定子目录时只打印提示而不失败，但本地插件的 `plugins install` 要求至少有一个可识别组件或资源（约定目录或 manifest 里显式声明的资源）。CLI 1.1.66（2026-10-08）新增内置 `qoder-plugins` 插件市场。 |
| 作用域与优先级 | User、Project 和 Local 三种 scope：`user` 全局可用、对当前用户所有项目生效且为默认；`project` 只对当前项目生效、写进项目级 `settings.json` 且可提交到 git 供团队共享；`local` 只对当前项目生效、写进项目本地 `settings.local.json`、建议加进 `.gitignore`。安装本地目录时用 `qoder plugins install /abs/path/to/plugin --scope project` 指定。 |
| 扩展构成 | Commands、Agents、Skills、Hooks、Output styles、`bin` 与 `.mcp.json`。 |
| 加载与刷新 | 启动时加载；安装成功后提示 `Plugin "my-plugin@local" installed successfully. Run /plugins reload to apply.`，重启 CLI 或在 TUI 运行 `/plugins reload` 生效。 |
| 适用界面 | 以 Qoder CLI 为准；Agent SDK、ACP 和 Qoder IDE 中不同的入口会单独注明。 |
| 权限与信任 | 插件组件仍受权限规则与工作区信任控制；本地可执行内容需要单独审查。CLI 1.0.17（2026-06-10）起插件 Hook 可绕过 `--setting-sources` 过滤器。 |
| 条件与边界 | CLI 1.1.66 的内置 `qoder-plugins` 市场只有官方 CLI Release Notes 证据（该版小节标题为 “Built-in plugin marketplace and stability fixes”，条目逐字为 “Added the built-in qoder-plugins plugin marketplace”）；官方 Plugins 页在核对日期没有出现 `qoder-plugins` 字符串，也没有任何内置、默认或预配置市场的描述，仍写「添加市场后才能浏览并安装已发布插件」，因此它是否默认注册、包含哪些插件、能否移除或被托管策略覆盖都记为未确认。`/marketplace` 与 `/agents`、`/plan`、`/workflows` 一样属条件命令，官方逐字写 “Available only when the corresponding feature flags are enabled.”，被功能开关关掉时输入会显示对应的禁用提示。`marketplace` 不是顶层子命令，只在 `qoder plugins` 组下。现行 CLI 参考的可执行名是 `qoder`、子命令表把 `plugins` 记为 “Manage plugins.”（别名 `plugin`），此前矩阵写的 `qodercli plugins` 已过期。官方 Plugins 页没有描述 `marketplace.json` 的字段，也没有把远程 ZIP 列为安装来源，而 Release Notes 的 CLI 1.1.14（2026-08-04）写 “Added remote ZIP plugin installation, and fixed the plugin status not updating after uninstall”，两处不一致；插件市场时间线取自官方 CLI Release Notes——CLI 1.0.35（2026-07-01）“Added plugin marketplace support”、CLI 1.0.36（2026-07-02）“Improved plugin marketplace management”、CLI 1.1.19（2026-08-11）“Fixed marketplace plugin installation failing”、CLI 1.1.27（2026-08-20）“Fixed uninstalled plugins being reinstalled by automatic plugin updates”（官方 Plugins 页只给手工 `plugins update`，没有描述自动更新）、CLI 1.0.15（2026-06-09）“Added plugin path placeholder substitution (`${*_PLUGIN_ROOT}`, `${*_PLUGIN_DATA}`) in plugin content”、CLI 0.2.3（2026-04-28）在 hooks 与 MCP 配置里支持 `PLUGIN_ROOT`/`PLUGIN_DATA`；核对日期的最新条目为 CLI 1.1.67（2026-10-09），只有 “Improved model information display”。 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI Plugins 页（`qoder plugins` 子命令组、marketplace 四种来源、三种 scope、`enabledPlugins` 与 `QODER_PLUGIN_ROOT`/`QODER_PLUGIN_DATA`）](https://docs.qoder.com/cli/plugins)、[Qoder CLI 命令行参考（`--worktree`、子命令表与 `plugins`/`skills`/`hooks`/`agents` 子命令组）](https://docs.qoder.com/cli/cli-reference)、[Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference)、[Qoder CLI Release Notes（跨会话消息、`/loop`、`/crontab`、任务预算、Hook 失败、`/hooks` GA 与插件市场条目的版本时间线）](https://docs.qoder.com/release-notes/qoder-cli) |

## 官方来源

- [Claude Code Plugins](https://code.claude.com/docs/en/plugins)
- [Claude Code Plugins for organizations（官方市场 `claude-plugins-official` 自动注册条件、`strictKnownMarketplaces`/`blockedMarketplaces`/`extraKnownMarketplaces`/`enabledPlugins`/`disableSideloadFlags`）](https://code.claude.com/docs/en/plugins/org)
- [Claude Code plugin 命令参考（`claude plugin marketplace add|list|remove|update`、`/plugin` 别名与 `/reload-plugins`）](https://code.claude.com/docs/en/plugins/cli-reference)
- [Codex Plugins](https://learn.chatgpt.com/docs/plugins)
- [Codex CLI 命令参考（`codex plugin` 与 `codex plugin marketplace` 子命令、旗标与 JSON 输出字段）](https://learn.chatgpt.com/docs/developer-commands?surface=cli)
- [Codex remote plugin search (app-server)](https://github.com/openai/codex/commit/a850875a8eb603d18cb14cb2c5e80c930de9bd48)
- [Codex portable Agent Plugin manifest](https://github.com/openai/codex/commit/2b5bdcf67547860f2e5c5a605009a70026796b2b)
- [Qwen Code current Extensions](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/extension/introduction.md)
- [Qwen Code v0.25.1-preview.1 Extensions 文档（`qwen extensions sources`、`/extensions manage` 三页签与安装来源）](https://github.com/QwenLM/qwen-code/blob/683f3f063aa05c67c339a70fbc740f08c006f9de/docs/users/extension/introduction.md)
- [Qwen Code current Extension runtime](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/core/src/extension/extensionManager.ts)
- [Qwen Code Qoder plugin compatibility commit](https://github.com/QwenLM/qwen-code/commit/0a6c50c7a7241b42ddce0acd0fde0a6f70bcdf9e)
- [Qwen Code Qoder plugin installation documentation](https://github.com/QwenLM/qwen-code/blob/0a6c50c7a7241b42ddce0acd0fde0a6f70bcdf9e/docs/users/extension/introduction.md)
- [Qwen Code v0.21.9 release notes](https://github.com/QwenLM/qwen-code/releases/tag/v0.21.9)
- [Qwen Code Agent Plugins v1 documentation](https://github.com/QwenLM/qwen-code/blob/a64d1291d2f6298f67763d0953b1653cf7b34060/docs/users/extension/agent-plugins.md)
- [Qwen Code Agent Plugins v1 native loading commit](https://github.com/QwenLM/qwen-code/commit/a64d1291d2f6298f67763d0953b1653cf7b34060)
- [Qwen Code v0.21.11-preview.0 release notes](https://github.com/QwenLM/qwen-code/releases/tag/v0.21.11-preview.0)
- [Kimi Code Plugins 文档（Installed/Official/Curated/Custom 四页签、`/plugins marketplace [source]` 与默认 marketplace）](https://github.com/MoonshotAI/kimi-code/blob/7ad0c46682ec735559a12c6a410c406b9d6cb709/docs/zh/customization/plugins.md)
- [Qoder CLI Plugins 页（`qoder plugins` 子命令组、marketplace 四种来源、三种 scope、`enabledPlugins` 与 `QODER_PLUGIN_ROOT`/`QODER_PLUGIN_DATA`）](https://docs.qoder.com/cli/plugins)
- [Qoder CLI 命令行参考（`--worktree`、子命令表与 `plugins`/`skills`/`hooks`/`agents` 子命令组）](https://docs.qoder.com/cli/cli-reference)
- [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference)
- [Qoder CLI Release Notes（跨会话消息、`/loop`、`/crontab`、任务预算、Hook 失败、`/hooks` GA 与插件市场条目的版本时间线）](https://docs.qoder.com/release-notes/qoder-cli)

## 关联能力

- [Agent Skills](./extension-skills.md)
- [生命周期 Hooks](./extension-hooks.md)
- [MCP 客户端](./extension-mcp.md)
- [自定义 Slash 命令](./extension-custom-commands.md)
- [输出风格](./extension-output-styles.md)

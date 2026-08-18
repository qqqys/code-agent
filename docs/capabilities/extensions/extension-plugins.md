# 插件分发

[返回扩展系统详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=extension-plugins)

> 核对日期：2026-08-18

## 定义

把多个扩展组件打包、安装、启用和更新，并比较包清单、可携带组件、安装作用域和运行时刷新方式。

## 扩展结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/plugin` | 官方确认 |
| Codex | `/plugins` | 官方确认 |
| Qwen Code | `/extensions` · `qwen extensions` · 可安装 Qoder 插件 · Agent Plugins v1 原生加载（条件：v0.21.11-preview.0 预览通道） | 条件项 |
| Kimi Code | `/plugins` | 官方确认 |
| Qoder CLI | `qodercli plugins` · `/plugins reload` | 官方确认 |

## 比较边界

### 本页包含

- Plugin 或 Extension manifest
- 市场、Git、本地目录或压缩包安装
- Skills、Commands、Hooks、MCP、Agents 等可选组件

### 本页不包含

- 单独复制一个 Skill 目录
- 仅由 IDE 商店分发的编辑器扩展
- 没有安装生命周期的普通项目配置

## 跨产品事实

1. 五家现在都存在可安装的扩展包；Qwen Code 将该体系称为 Extensions，除自有格式外还能安装 Gemini、Claude 与 Qoder 格式的包（Qoder 插件兼容随 v0.21.9 引入），并自 v0.21.11-preview.0 起原生加载 Agent Plugins v1 便携包。
2. 组件集合并不对齐：Codex Plugin 当前不在 IDE 扩展中提供；Kimi Code Plugin 已支持 Agent 组件，但优先级低于用户、额外目录、项目和 `--agent-file`。
3. 安装作用域也不同：Kimi Code 当前只支持用户安装；Qoder CLI 提供 User、Project 与 Local scope。
4. 远程插件搜索目前只有 Codex 在 app-server 以 `plugin/search` JSON-RPC 提供，按 `global`/`workspace`/`personal` scope 直接查询远程插件服务；该端点仍在开发中并受功能开关控制，其余四家的插件发现仍走本地目录或 `/plugins` 浏览器。
5. Codex 在仓库中增加了对 `agent-plugins.org` 1.0.0 清单的支持：根目录 `plugin.json` 与 `.codex-plugin/plugin.json` 并存，`extensions` 字段按反向域名命名空间承载客户端特定数据。Qwen Code 自 v0.21.11-preview.0（提交 `a64d1291d2f6`）起也原生加载同一 1.0.0 schema 的包，不转换或改写 `plugin.json`、`mcp.json`、`SKILL.md`；Claude Code、Kimi Code 与 Qoder CLI 当前一手资料未列出对同一清单的支持。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/plugin` |
| 入口与配置 | `/plugin` 浏览和管理；支持 Marketplace 安装，也可用 `--plugin-dir` 临时加载本地目录。 |
| 文件与目录 | Manifest 位于 `.claude-plugin/plugin.json`；组件目录位于插件根目录。 |
| 具体行为 | 把多个扩展组件作为一个版本化包启用，并由 Marketplace 或本地目录分发。 |
| 作用域与优先级 | 用户安装、项目 Marketplace 配置与临时 `--plugin-dir` 加载。 |
| 扩展构成 | Skills、旧式 Commands、Agents、Hooks、`.mcp.json`、`.lsp.json`、Monitors、`bin` 与 settings。 |
| 加载与刷新 | 安装或启用后加载；开发中的改动可用 `/reload-plugins` 刷新。 |
| 适用界面 | 以 Claude Code CLI 为准；VS Code 扩展、桌面端或 Headless 中不同的入口会单独注明。 |
| 权限与信任 | Plugin 中的 Hook、MCP 与命令仍受工作区信任、权限和组织策略约束。 |
| 条件与边界 | Manifest 在 `.claude-plugin`，但 `skills`、`agents` 等组件目录位于插件根，不放进 manifest 目录。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Plugins](https://code.claude.com/docs/en/plugins) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/plugins` |
| 入口与配置 | Codex CLI 使用 `/plugins` 打开插件浏览器，可搜索或浏览统一插件目录并安装；app-server 另有 `plugin/search` JSON-RPC 直接查询远程插件服务。 |
| 文件与目录 | 自建包使用 `.codex-plugin/plugin.json`；也接受根目录 `plugin.json`（`$schema` 指向 `agent-plugins.org/schemas/1.0.0/plugin.schema.json`）的便携 Agent Plugin 清单。其余组件按插件规范组织。 |
| 具体行为 | 把可复用能力组合成插件，并在 Codex 与 ChatGPT 的统一插件目录中分发。app-server 的 `plugin/search` 绕过本地目录缓存直接搜索远程服务，接受 `searchTerm`、可选 `global`/`workspace`/`personal` scope 以及 `cursor`/`limit`，返回带 marketplace 限定的插件摘要并以 `nextCursor` 透传分页令牌。 |
| 作用域与优先级 | 安装到当前账号或环境；组织可通过管理策略提供或限制插件。 |
| 扩展构成 | Skills、MCP/Connector、Hooks，以及可用于自动化的定时模板等组件。 |
| 加载与刷新 | CLI 与 Codex 桌面端可使用已安装插件；客户端按启用状态加载。 |
| 适用界面 | Codex CLI 和桌面端支持插件浏览器；当前官方文档明确不在 Codex IDE 扩展和移动端提供。远程插件搜索只在 app-server JSON-RPC 暴露，不是 CLI 命令。 |
| 权限与信任 | Connector、MCP 和 Hook 继续受认证、审批、沙箱及组织控制。 |
| 条件与边界 | "Codex 支持 Skills"与"当前 Surface 支持 Plugin 浏览器"是两件事；IDE 扩展目前不加载插件。`plugin/search` 受功能开关控制：`remote_plugin` 关闭时省略 scope 按 `workspace` 处理、`global`/`personal` 返回空页且不查询远程服务，`plugin_sharing` 关闭时共享/私有工作区结果在取回后被过滤；该端点不与已安装快照联表，返回项 `installed` 恒为 `false`，官方标注 under development、do not call from production clients yet。便携 Agent Plugin 清单只要求 `$schema` 和 `name`（允许点号，最长 64 字符）；`version` 缺省为 `1.0.0`，非目录安全版本内部派生 `agent-plugins-<sha256-hex>` 目录名且不改写原清单。Agent Plugin 跳过旧式命令迁移；安装时拒绝符号链接和不受支持的文件类型。 |
| 证据状态 | 官方确认 |
| 来源 | [Codex Plugins](https://learn.chatgpt.com/docs/plugins)、[Codex remote plugin search (app-server)](https://github.com/openai/codex/commit/a850875a8eb603d18cb14cb2c5e80c930de9bd48)、[Codex portable Agent Plugin manifest](https://github.com/openai/codex/commit/2b5bdcf67547860f2e5c5a605009a70026796b2b) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/extensions` · `qwen extensions` · 可安装 Qoder 插件 · Agent Plugins v1 原生加载（条件：v0.21.11-preview.0 预览通道） |
| 入口与配置 | `/extensions` 在 TUI 管理；`qwen extensions` 提供安装、列表、更新、启用和禁用等 CLI 操作。Qoder 插件与 Agent Plugins v1 包同样用现有 `qwen extensions install`（或 `/extensions install`）安装，来源支持本地目录、`link`、归档、Git 仓库（`owner/repo`）、归档 URL 与 scoped npm 包。 |
| 文件与目录 | Qwen 原生 manifest 为 `qwen-extension.json`；也能安装兼容的 Gemini 与 Claude 扩展结构。Qoder 插件以 `.qoder-plugin/plugin.json` 为 manifest，安装时转换为 `qwen-extension.json` 保存。Agent Plugins v1 包以根目录 `plugin.json`（`$schema` 指向 `agent-plugins.org/schemas/1.0.0/plugin.schema.json`）为 manifest，可搭配根目录 `mcp.json`；安装保留 `plugin.json`、`mcp.json`、`SKILL.md` 原文件，不生成 `qwen-extension.json` 或改写清单。 |
| 具体行为 | 从 npm、Git、归档或本地目录安装，并把扩展组件合并到当前运行时。Qoder 插件可从本地目录、归档、Git 仓库、归档 URL 或 scoped npm 包安装：保留标准 `commands/`、`agents/`、`skills/` 目录；manifest 未声明 `mcpServers` 时，根 `.mcp.json` 的 MCP Server 规范化为 Qwen 传输后作为扩展 MCP 加载；根目录存在 `system-prompt.md` 时作为扩展上下文加载，与 `QWEN.md` 及显式声明的上下文文件去重后并存。Agent Plugins v1 原生加载只发现直接子级 `skills/*/SKILL.md`（遵循 Agent Skills 规范，无效 Skill 单独跳过、不影响同级有效 Skill）；stdio MCP 在 `args`、环境变量值与 `cwd` 中展开 `${PLUGIN_ROOT}`（安装根目录）与 `${PLUGIN_DATA}`（按安装持久化的可写目录），并支持 Streamable HTTP MCP；legacy HTTP+SSE 条目报告后跳过。 |
| 作用域与优先级 | User 与 Project scope；Project 扩展可随仓库配置。 |
| 扩展构成 | Context file、MCP、Commands、Skills、Agents、Settings、Channels、Hooks 与 LSP Servers。Agent Plugins v1 便携运行时当前只启用 Agent Skills 与 stdio/Streamable HTTP MCP。 |
| 加载与刷新 | Extension manager 支持运行时热重载；各组件按 manifest 和目录约定重新注册。 |
| 适用界面 | 以 Qwen Code CLI 为准；Headless、ACP 和 IDE Companion 中不同的加载行为会单独注明。 |
| 权限与信任 | 扩展中的 Hook、MCP、Command 和 Agent 仍经过工作区信任、approval mode 与工具策略。Agent Plugins v1 使用标准扩展安全同意流程，但不再显示“转换第三方格式”的兼容提示。 |
| 条件与边界 | Qwen 的正式名称是 Extension；“Plugin”只应在兼容格式或具体组件语境使用，不能与整个管理入口混写。Qoder 插件兼容随 v0.21.9 引入：manifest 必须在插件目录内解析为含 `name` 的有效 JSON，引用的资源与上下文文件必须留在插件内部，复制时跳过逃逸源目录根的符号链接且不复制 Git 元数据；归档的 manifest 可位于根目录或一个受支持的顶层包装目录内；Git 安装在安装元数据记录检出提交（`gitCommit`）供更新检查，`version` 缺省为 `1.0.0`，来源记录为 `Qoder`。Agent Plugins v1 原生加载随 v0.21.11-preview.0 预览通道发布（提交 `a64d1291d2f6`，稳定版 v0.21.10 不含）：`$schema` 属于 Agent Plugins 的根 `plugin.json` 优先于其他扩展 manifest，不支持的 schema 版本显式失败，无关 `plugin.json` 被忽略；`commands/`、`agents/`、hooks、上下文、settings、channels、apps 与 `extensions.*` 客户端命名空间一律忽略；Skill frontmatter 的实验字段 `allowed-tools` 只按字符串识别，不授予预批准工具权限；远程 MCP 端点必须 HTTPS（loopback HTTP 例外）；包边界检查拒绝符号链接与路径穿越。 |
| 证据状态 | 条件项 |
| 来源 | [Qwen Code current Extensions](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/extension/introduction.md)、[Qwen Code current Extension runtime](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/core/src/extension/extensionManager.ts)、[Qwen Code Qoder plugin compatibility commit](https://github.com/QwenLM/qwen-code/commit/0a6c50c7a7241b42ddce0acd0fde0a6f70bcdf9e)、[Qwen Code Qoder plugin installation documentation](https://github.com/QwenLM/qwen-code/blob/0a6c50c7a7241b42ddce0acd0fde0a6f70bcdf9e/docs/users/extension/introduction.md)、[Qwen Code v0.21.9 release notes](https://github.com/QwenLM/qwen-code/releases/tag/v0.21.9)、[Qwen Code Agent Plugins v1 documentation](https://github.com/QwenLM/qwen-code/blob/a64d1291d2f6298f67763d0953b1653cf7b34060/docs/users/extension/agent-plugins.md)、[Qwen Code Agent Plugins v1 native loading commit](https://github.com/QwenLM/qwen-code/commit/a64d1291d2f6298f67763d0953b1653cf7b34060)、[Qwen Code v0.21.11-preview.0 release notes](https://github.com/QwenLM/qwen-code/releases/tag/v0.21.11-preview.0) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/plugins` |
| 入口与配置 | `/plugins` 及其子命令管理 Marketplace、本地、GitHub 或 ZIP 来源的插件。 |
| 文件与目录 | Manifest 为根目录 `kimi.plugin.json` 或 `.kimi-plugin/plugin.json`。 |
| 具体行为 | 把多个自定义组件作为一个包安装到用户环境，并支持启用、禁用和重载。安装会消耗套餐额度的官方 plugin（当前为 `kimi-datasource`）会在安装结果中提示 `Note: This plugin consumes your quota.`。 |
| 作用域与优先级 | 当前文档只支持用户级安装，没有项目级插件安装。 |
| 扩展构成 | Skills、Session-start Skill、Skill instructions、System prompt instructions（`systemPrompt` / `systemPromptPath`，各上限 32 KB，合计 64 KB）、Custom Agents（`agents` 字段或根 `agents/` 目录）、MCP Servers、Hooks 与 Commands。 |
| 加载与刷新 | 安装或修改后使用 `/reload` 或开启新会话生效；v2 引擎中 `/plugins reload` 也可刷新当前会话。`/plugins` 的 Installed tab 在 marketplace 有新版本时显示更新徽章；使用过时官方 plugin（其 MCP 工具或 `/<plugin>:<command>` 命令）的 turn 结束后出现一次性更新提示，已通知版本写入 `~/.kimi-code/updates/plugin-notices.json`，每个 marketplace 版本只提醒一次。 |
| 适用界面 | 以 Kimi Code CLI 为准；ACP、Web UI 和外部编辑器只在对应能力中单独列出。 |
| 权限与信任 | Plugin 中的 MCP、Hook、Commands 与 Agent 具备执行能力，安装前需要审查来源。 |
| 条件与边界 | 配额提示与更新提示只对官方来源、默认官方目录的 plugin 生效；自定义 `KIMI_CODE_PLUGIN_MARKETPLACE_URL` 或非官方安装不触发更新提示。Plugin Agent 优先级低于用户、额外目录、项目和 `--agent-file`；替换同名内置 Agent 需要在 frontmatter 声明 `override: true`。`systemPrompt` 与 `systemPromptPath` 在 v1 引擎（交互 TUI 和 `kimi -p`）、`kimi web` 以及 v2 引擎（`KIMI_CODE_EXPERIMENTAL_FLAG=1`）中均生效。 |
| 证据状态 | 官方确认 |
| 来源 | [Kimi Code current Plugins](https://github.com/MoonshotAI/kimi-code/blob/691ec4679ea1/docs/zh/customization/plugins.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `qodercli plugins` · `/plugins reload` |
| 入口与配置 | `qodercli plugins` 管理安装与状态；运行中使用 `/plugins reload` 重载。 |
| 文件与目录 | Manifest 位于 `.qoder-plugin/plugin.json`；组件使用约定目录。 |
| 具体行为 | 从 Marketplace 或插件来源安装，并把组件注册到 Qoder CLI。 |
| 作用域与优先级 | User、Project 和 Local 三种 scope。 |
| 扩展构成 | Commands、Agents、Skills、Hooks、Output styles、`bin` 与 `.mcp.json`。 |
| 加载与刷新 | 启动时加载；`/plugins reload` 在当前会话刷新。 |
| 适用界面 | 以 Qoder CLI 为准；Agent SDK、ACP 和 Qoder IDE 中不同的入口会单独注明。 |
| 权限与信任 | 插件组件仍受权限规则与工作区信任控制；本地可执行内容需要单独审查。 |
| 条件与边界 | Qoder CLI 已有独立插件管理入口；旧矩阵中的“未确认”结论不再成立。 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI Plugins](https://docs.qoder.com/en/cli/plugins) |

## 官方来源

- [Claude Code Plugins](https://code.claude.com/docs/en/plugins)
- [Codex Plugins](https://learn.chatgpt.com/docs/plugins)
- [Codex remote plugin search (app-server)](https://github.com/openai/codex/commit/a850875a8eb603d18cb14cb2c5e80c930de9bd48)
- [Codex portable Agent Plugin manifest](https://github.com/openai/codex/commit/2b5bdcf67547860f2e5c5a605009a70026796b2b)
- [Qwen Code current Extensions](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/extension/introduction.md)
- [Qwen Code current Extension runtime](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/core/src/extension/extensionManager.ts)
- [Qwen Code Qoder plugin compatibility commit](https://github.com/QwenLM/qwen-code/commit/0a6c50c7a7241b42ddce0acd0fde0a6f70bcdf9e)
- [Qwen Code Qoder plugin installation documentation](https://github.com/QwenLM/qwen-code/blob/0a6c50c7a7241b42ddce0acd0fde0a6f70bcdf9e/docs/users/extension/introduction.md)
- [Qwen Code v0.21.9 release notes](https://github.com/QwenLM/qwen-code/releases/tag/v0.21.9)
- [Qwen Code Agent Plugins v1 documentation](https://github.com/QwenLM/qwen-code/blob/a64d1291d2f6298f67763d0953b1653cf7b34060/docs/users/extension/agent-plugins.md)
- [Qwen Code Agent Plugins v1 native loading commit](https://github.com/QwenLM/qwen-code/commit/a64d1291d2f6298f67763d0953b1653cf7b34060)
- [Qwen Code v0.21.11-preview.0 release notes](https://github.com/QwenLM/qwen-code/releases/tag/v0.21.11-preview.0)
- [Kimi Code current Plugins](https://github.com/MoonshotAI/kimi-code/blob/691ec4679ea1/docs/zh/customization/plugins.md)
- [Qoder CLI Plugins](https://docs.qoder.com/en/cli/plugins)

## 关联能力

- [Agent Skills](./extension-skills.md)
- [生命周期 Hooks](./extension-hooks.md)
- [MCP 客户端](./extension-mcp.md)
- [自定义 Slash 命令](./extension-custom-commands.md)

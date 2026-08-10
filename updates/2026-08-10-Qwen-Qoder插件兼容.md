# Qwen Code 原生安装 Qoder 插件

Qwen Code 官方 Release v0.21.9（2026-08-10T15:14:22Z 发布）的发布说明 Features 包含 PR #8661（合并提交 `0a6c50c7a724`）：原生支持安装 Qoder 插件，来源包括目录、归档、Git 仓库、URL 与 npm 包，`system-prompt.md` 自动作为扩展上下文加载。矩阵在 `extension-plugins` 字段的 Qwen Code 结论与详情中记录 Qoder 插件兼容。其余四家核对无变化：Claude Code 仍是 `/plugin` 与 Marketplace，Codex 仍是 `/plugins` 与便携 Agent Plugin 清单，Kimi Code 仍是 `/plugins` 与 `kimi.plugin.json`/`.kimi-plugin/plugin.json`，Qoder CLI 仍是 `qodercli plugins` 与 `/plugins reload`。

## 修正

- `extension-plugins`（插件分发）矩阵 Qwen Code 列由 "`/extensions` · `qwen extensions`" 更新为 "`/extensions` · `qwen extensions` · 可安装 Qoder 插件"。
- Qwen Code 详情入口与配置补充：Qoder 插件同样用现有 `qwen extensions install` 安装。
- Qwen Code 详情文件与目录补充：Qoder 插件以 `.qoder-plugin/plugin.json` 为 manifest，安装时转换为 `qwen-extension.json` 保存。
- Qwen Code 详情具体行为补充：Qoder 插件可从本地目录、归档、Git 仓库、归档 URL 或 scoped npm 包安装；保留标准 `commands/`、`agents/`、`skills/` 目录；manifest 未声明 `mcpServers` 时，根 `.mcp.json` 的 MCP Server 规范化为 Qwen 传输后作为扩展 MCP 加载；根目录存在 `system-prompt.md` 时作为扩展上下文加载，与 `QWEN.md` 及显式声明的上下文文件去重后并存。
- Qwen Code 详情条件与边界补充：Qoder 插件兼容随 v0.21.9 引入；manifest 必须在插件目录内解析为含 `name` 的有效 JSON，引用的资源与上下文文件必须留在插件内部，复制时跳过逃逸源目录根的符号链接且不复制 Git 元数据；归档的 manifest 可位于根目录或一个受支持的顶层包装目录内；Git 安装在安装元数据记录检出提交（`gitCommit`）供更新检查，`version` 缺省为 `1.0.0`，来源记录为 `Qoder`。
- 跨产品事实更新为"五家现在都存在可安装的扩展包；Qwen Code 将该体系称为 Extensions，除自有格式外还能安装 Gemini、Claude 与 Qoder 格式的包（Qoder 插件兼容随 v0.21.9 引入）"。
- 新增来源 `qwen-qoder-plugin-compat`（固定到提交 SHA `0a6c50c7a7241b42ddce0acd0fde0a6f70bcdf9e`）、`qwen-qoder-plugin-docs`（固定到该提交的 `docs/users/extension/introduction.md`）与 `qwen-v0219-release`（固定到 v0.21.9 Release 页面）；Qwen Code 核对日期保持 2026-08-10。

## 影响页面

- [扩展系统矩阵](../docs/05-扩展系统矩阵.md)
- [插件分发详情](../docs/capabilities/extensions/extension-plugins.md)
- [版本与证据](../docs/09-版本与证据.md)

## 证据版本

- Qwen Code 官方 Release v0.21.9（2026-08-10T15:14:22Z 发布）：Highlights 原文 “Added native support for installing Qoder plugins from directories, archives, Git repos, URLs, and npm packages with automatic system-prompt loading. (#8661)”；Features 条目 “Adds native support for installing Qoder plugins from directories, archives, Git repos, URLs, and npm packages, automatically loading system-prompt.md as extension context. (#8661)”。
- Qwen Code 官方仓库 PR #8661（`feat(core): support Qoder plugin extensions`），合并提交 `0a6c50c7a7241b42ddce0acd0fde0a6f70bcdf9e`：新增 `packages/core/src/extension/qoder-converter.ts`（常量 `QODER_PLUGIN_MANIFEST = '.qoder-plugin/plugin.json'`）与 `docs/design/qoder-plugin-compatibility.md`；`Qoder` 加入 `packages/core/src/config/config.ts`、`packages/acp-bridge/src/status.ts` 与 `packages/sdk-typescript/src/daemon/types.ts` 的 origin 联合类型；`integration-tests/cli/extensions-install.test.ts` 增加 Qoder 插件安装用例。
- 该提交的 `docs/users/extension/introduction.md` 原文：“Qwen Code supports Qoder plugins that contain a `.qoder-plugin/plugin.json` manifest.”、“Install a local directory, archive, Git repository, archive URL, or scoped npm package with the existing `qwen extensions install` command”、“When a Qoder plugin contains `system-prompt.md` at its root, Qwen Code loads it as extension context.”、“If the plugin also contains `QWEN.md` or declares other context files, all context files are retained and deduplicated.”、“The installer converts the Qoder manifest to `qwen-extension.json` and preserves standard `commands/`, `agents/`, and `skills/` directories.”、“MCP servers declared in a root `.mcp.json` file are included as extension MCP servers.”。
- 该提交的设计文档与 `qoder-converter.ts` 实现：manifest 必须在插件目录内解析为含有效 `name` 的 JSON；引用的资源与上下文文件必须留在插件内；批量复制跳过逃逸源根的符号链接且不复制 Git 元数据；转换的 Git 安装把检出提交写入安装元数据（`gitCommit`）以保持更新检查；归档校验接受 manifest 位于根目录或一个受支持的顶层包装目录内；`version` 缺省为 `1.0.0`；manifest 未声明 `mcpServers` 时才读取根 `.mcp.json` 并经 `normalizeClaudeMcpServer` 规范化。

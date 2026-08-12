# Qwen Code Agent Plugins v1 原生加载

Qwen Code PR #8834（提交 `a64d1291d2f6298f67763d0953b1653cf7b34060`，2026-08-11 合入 main）让 Extensions 体系原生加载便携 Agent Plugins v1（`agent-plugins.org` 1.0.0 schema）包：根目录 `plugin.json` 指向该 schema 的包不再像 Gemini、Claude、Qoder 格式那样转换成 `qwen-extension.json`，而是保留 `plugin.json`、`mcp.json`、`SKILL.md` 原文件直接加载。便携运行时当前只启用直接子级 `skills/*/SKILL.md`（遵循 Agent Skills 规范）与 stdio、Streamable HTTP 两类 MCP；stdio 的 `args`、环境变量值与 `cwd` 展开 `${PLUGIN_ROOT}` 与 `${PLUGIN_DATA}`，`commands/`、`agents/`、hooks、上下文、settings、channels、apps 与 `extensions.*` 客户端命名空间一律忽略，legacy HTTP+SSE 条目报告后跳过。该提交晚于稳定版 v0.21.10（2026-08-11T14:21Z 发布），随 v0.21.11-preview.0 预览通道（2026-08-12T00:55Z 发布，Release 说明列出 `feat(extensions): support Agent Plugins v1 by @callmeYe in #8834`）首次发布。本次更新 `extension-plugins`（插件分发）字段的 Qwen Code 记录。

## 修正

- `extension-plugins` 字段 Qwen Code 矩阵结论由 "`/extensions` · `qwen extensions` · 可安装 Qoder 插件" 改为 "`/extensions` · `qwen extensions` · 可安装 Qoder 插件 · Agent Plugins v1 原生加载（条件：v0.21.11-preview.0 预览通道）"，证据状态由"源码确认"随条件项变为"条件项"。
- Qwen Code 详情补入：Agent Plugins v1 包用现有 `qwen extensions install`（或 `/extensions install`）安装，来源含本地目录、`link`、归档、Git 仓库（`owner/repo`）、归档 URL 与 scoped npm 包；manifest 为根目录 `plugin.json`（`$schema` 指向 `agent-plugins.org/schemas/1.0.0/plugin.schema.json`），可搭配根目录 `mcp.json`；安装保留原文件，不生成 `qwen-extension.json` 或改写清单；只发现直接子级 `skills/*/SKILL.md`，无效 Skill 单独跳过；stdio MCP 展开 `${PLUGIN_ROOT}` 与 `${PLUGIN_DATA}`（按安装持久化的可写目录）；远程 MCP 端点必须 HTTPS（loopback HTTP 例外）；`$schema` 属于 Agent Plugins 的根 `plugin.json` 优先于其他扩展 manifest，不支持的 schema 版本显式失败，无关 `plugin.json` 被忽略；Skill frontmatter 实验字段 `allowed-tools` 只按字符串识别、不授予预批准工具权限；包边界检查拒绝符号链接与路径穿越；使用标准扩展安全同意流程但不再显示"转换第三方格式"兼容提示。
- 跨产品事实更新：`agent-plugins.org` 1.0.0 清单此前只有 Codex 在仓库中支持，现 Qwen Code 也原生加载同一 schema（不转换清单）；Claude Code、Kimi Code 与 Qoder CLI 当前一手资料未列出对同一清单的支持。
- 新增来源：`qwen-agent-plugins-v1-docs`（固定到提交 SHA `a64d1291d2f6298f67763d0953b1653cf7b34060` 的 `docs/users/extension/agent-plugins.md`）、`qwen-agent-plugins-v1-commit`（同一提交）、`qwen-v02111-preview-release`（v0.21.11-preview.0 发布说明）。
- `docs/09-版本与证据.md`：Qwen Code 核对日期更新为 2026-08-12，主要材料补充 Agent Plugins v1 原生加载；官方来源表 Qwen Code 扩展系统列新增上述三个固定链接。
- `npm run generate` 重新生成 `docs/capabilities/extensions/` 与 `docs/05-扩展系统矩阵.md`（`extension-plugins.md` 内容更新）；`site/data.js` 的 `updatedAt` 更新为 2026-08-12，各分类生成文档的核对日期随之更新。

## 影响页面

- [扩展系统矩阵](../docs/05-扩展系统矩阵.md)
- [插件分发详情](../docs/capabilities/extensions/extension-plugins.md)
- [版本与证据](../docs/09-版本与证据.md)

## 证据版本

- Qwen Code 提交 `a64d1291d2f6298f67763d0953b1653cf7b34060`（PR #8834 `feat(extensions): support Agent Plugins v1 (#8834)`，2026-08-11T19:45:11Z 合入 main）：新增 `docs/users/extension/agent-plugins.md`、`docs/design/agent-plugins-v1-native-support.md` 与 `packages/core/src/extension/agent-plugins-v1/` 加载器（`manifest.ts`、`mcp.ts`、`skills.ts`、`paths.ts`）；设计文档原文 "Agent Plugins v1 is a native extension package format, not another converter. A format-aware manifest loader recognizes only the canonical v1 schema…"；用户文档原文 "Qwen Code natively loads portable Agent Plugins v1 packages without converting or rewriting `plugin.json`, `mcp.json`, or `SKILL.md` files"。
- 提交中的文档明确 MCP 传输支持范围：stdio 与 Streamable HTTP 支持、legacy HTTP+SSE 条目报告后跳过；`${PLUGIN_ROOT}` 为插件安装根目录、`${PLUGIN_DATA}` 为跨更新与重装持久化的可写目录；文档原文 "The experimental `allowed-tools` field is recognized as a string but does not grant pre-approved Qwen tools."。
- v0.21.11-preview.0 发布说明（2026-08-12T00:55:59Z）Features 列出 "feat(extensions): support Agent Plugins v1 by @callmeYe in #8834"；nightly 标签 `v0.21.10-nightly.20260812.a64d1291d2` 直接以该提交构建。稳定版 v0.21.10（2026-08-11T14:21Z）早于该提交且 Release 说明无 Agent Plugins 条目，故记录为预览通道条件项。
- Qwen Code 官方 `docs/users/extension/introduction.md`（同一提交）将扩展格式列为 Native（`qwen-extension.json`）、Qoder Plugins（`.qoder-plugin/plugin.json`，安装时转换）、Agent Plugins v1（原生加载不转换）与 Marketplace/Gemini/Claude（安装时转换）四类。
- 其他产品本次无同类变化：Claude Code v2.1.226/v2.1.227/v2.1.228（2026-08-08 至 2026-08-11）更新日志为缺陷修复与界面改进，无插件分发能力变化；Codex 2026-08-11 至 12 合入提交（#38103、#38101、#38094、#38092、#38089、#38087、#38086、#38084）为 TUI、MCP OAuth 与云配置调整，rust-v0.148.0-alpha.7/8/9 为预发布标签，插件分发记录不变；Kimi Code 最新 Release 仍为 0.34.0（2026-08-06），main 分支 `.changeset` 待发布条目（MCP 认证提示、压缩 token 基准、会话 profile 隔离等）无插件格式支持；Qoder CLI 插件文档（2026-08-12 核对）仍只列原生 `.qoder-plugin/plugin.json` 目录格式与 Marketplace 安装，未列便携 Agent Plugins v1 清单支持。

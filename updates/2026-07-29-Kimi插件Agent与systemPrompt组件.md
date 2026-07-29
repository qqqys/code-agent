# Kimi Code Plugin Agent 与 systemPrompt 组件

核对 Kimi Code v0.30.0 后 `main` 分支（commit `691ec4679ea1`）中 Plugin manifest 新增的 Custom Agents 和 System prompt instructions 组件。

## 修正

- Kimi Code Plugin 扩展构成从"Skills、Session-start Skill、Skill instructions、MCP Servers、Hooks 与 Commands；当前 manifest 未列 Agents"更新为包含 Custom Agents（`agents` 字段或根 `agents/` 目录）和 System prompt instructions（`systemPrompt` / `systemPromptPath`，各上限 32 KB，合计 64 KB）。
- Plugin Agent 优先级：`--agent-file` > 项目 > 额外目录 > 用户 > Plugin > 内置；替换同名内置 Agent 需要在 frontmatter 声明 `override: true`。
- `systemPrompt` 与 `systemPromptPath` 在 v1 引擎（交互 TUI 和 `kimi -p`）、`kimi web` 以及 v2 引擎（`KIMI_CODE_EXPERIMENTAL_FLAG=1`）中均生效；新会话和新建 Agent 读取当前启用的 plugin 指令，进行中请求继续使用已有 system prompt。
- v2 引擎中 `/plugins reload` 也可刷新当前会话的 plugin 组件。
- 跨产品事实从"Kimi Code 当前 Plugin 文档没有 Agent 组件"更正为"Kimi Code Plugin 已支持 Agent 组件，但优先级低于用户、额外目录、项目和 `--agent-file`"。
- 来源从 `29783e471afcf7975852e496907646458264d2e6` 固定到 `691ec4679ea1`。

## 影响页面

- [扩展系统矩阵](../docs/05-扩展系统矩阵.md)
- [插件分发详情](../docs/capabilities/extensions/extension-plugins.md)

## 证据版本

- Kimi Code 官方仓库 `691ec4679ea1`，`docs/zh/customization/plugins.md` 和 `docs/zh/customization/agents.md`。
- Kimi Code v0.30.0 Release 后 `main` 分支，commit `fa2c5ce18b70`（feat: support plugin-contributed custom agents #2365）和 `02d77b20d941`（feat(agent-core-v2): let plugins contribute system prompt instructions via the manifest systemPrompt field #2314）。
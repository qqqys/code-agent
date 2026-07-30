# Slash 命令矩阵

[返回文档目录](./README.md) · [网页矩阵](https://qqqys.github.io/code-agent/#commands)

> `—` 表示当前官方 Slash 命令目录没有列出对应命令，不表示底层能力不存在。命令可能受版本、平台或功能开关影响。

[打开 28 个 Slash 命令独立详情](./capabilities/commands/)

这里的 28 指归一化后的对比能力，不是任何一家产品的命令总数。原生命令、别名、随产品提供的 Skill 命令和动态加载命令在下方分别列出。

## 对照表

| 功能 | Claude Code | Codex | Qwen Code | Kimi Code | Qoder CLI |
| --- | --- | --- | --- | --- | --- |
| 登录 | `/login` | — | `/auth`、`/connect`、`/login` | `/login` | `/login` |
| 退出登录 | `/logout` | `/logout` | `/auth logout` | `/logout` | `/logout` |
| 选择模型 | `/model` | `/model` | `/model` | `/model` | `/model` |
| 推理强度 | `/effort` | `/model`、`/fast` | `/effort` | — | `/effort`、`/fast` |
| 权限设置 | `/permissions`、`/allowed-tools` | `/permissions` | `/approval-mode`、`/permissions` | `/permission`、`/yolo`、`/auto` | `/config` |
| 计划模式 | `/plan` | `/plan` | `/plan` | `/plan`、`/plan clear` | `/plan` |
| 目标 | `/goal` | `/goal` | `/goal` | `/goal` | — |
| Subagent 管理 | `/agents`、`/subtask` | `/agent`、`/subagents` | `/agents manage`、`/agents create` | `/swarm`；Agent 通过配置与工具调用 | `/agents`、`/agents reload` |
| 任务列表 | `/tasks` | `/ps` | `/tasks` | `/tasks`、`/task` | `/tasks` |
| 新会话 | `/clear`、`/reset`、`/new` | `/new`、`/clear` | `/clear` | `/new`、`/clear` | `/clear` |
| 恢复会话 | `/resume`、`/continue` | `/resume` | `/resume`、`/continue` | `/sessions`、`/resume` | `/resume` |
| 重命名会话 | `/rename` | `/rename`、`/title` | `/rename`、`/tag` | `/title`、`/rename` | — |
| 分支会话 | `/branch`、`/fork` | `/fork` | `/branch`、`/fork` | `/fork` | — |
| 归档或删除会话 | — | `/archive`、`/delete` | `/delete` | — | — |
| 压缩上下文 | `/compact [instructions]` | `/compact` | `/compress`、`/compress-fast` | `/compact [instruction]` | `/compact` |
| 查看上下文 | `/context [all]` | `/status`、`/usage` | `/context detail` | `/status`、`/usage` | `/context-window`、`/status`、`/usage` |
| 记忆管理 | `/memory` | `/memories` | `/memory`、`/remember`、`/forget`、`/learn` | — | `/memory` |
| 回退或检查点 | `/rewind`、`/checkpoint`、`/undo` | — | `/rewind`、`/restore` | `/undo [count]` | — |
| 查看 Diff | `/diff` | `/diff` | `/diff` | — | — |
| 代码审查 | `/review`、`/code-review`、`/security-review` | `/review` | `/review` | — | `/review` |
| 复制回答 | `/copy` | `/copy` | `/copy` | `/copy` | — |
| 导出会话 | `/export` | — | `/export html`、`/export md`、`/export json`、`/export jsonl` | `/export-md`、`/export`、`/export-debug-zip` | `/export` |
| 添加工作目录 | `/add-dir` | `/mention` | `/directory`、`/dir` | `/add-dir` | — |
| 切换目录 | `/cd` | — | `/cd` | — | — |
| 配置 | `/config`、`/settings` | `/debug-config` | `/config`、`/settings`、`/import-config` | `/settings`、`/config`、`/update-config` | `/config` |
| 状态 | `/status` | `/status` | `/status`、`/about` | `/status`、`/version` | `/status` |
| 用量统计 | `/stats`、`/usage` | `/usage` | `/stats`、`/usage` | `/usage` | `/usage` |
| 诊断 | `/doctor`、`/debug` | `/debug-config` | `/doctor`、`/stuck` | `/export-debug-zip` | `/feedback` |
| 初始化项目指令 | `/init` | `/init` | `/init` | `/init` | `/init` |
| MCP | `/mcp` | `/mcp` | `/mcp` | `/mcp`、`/mcp-config` | `/mcp` |
| Skills | `/skills`、`/reload-skills` | `/skills` | `/skills`、`/<skill-name>` | 内置 Skill 命令与 Skills 目录 | `/skills` |
| Hooks | `/hooks` | `/hooks` | `/hooks` | — | Agent 配置支持 Hooks；无独立 Slash 命令 |
| 插件或扩展 | `/plugin`、`/reload-plugins` | `/plugins`、`/apps` | `/extensions`、`/extension-creator`、`/reload-plugins` | `/plugins` | — |
| 自定义命令 | Skills 可作为命令调用 | Skills 可作为命令调用 | Skills、Markdown/TOML 命令和保存的 Workflow | Skills 可作为命令调用 | `/commands`、`/workflows` |
| 工具列表 | — | — | `/tools` | — | — |
| IDE 或编辑器 | `/ide` | `/ide` | `/ide`、`/editor` | `/editor` | — |
| 主题 | — | `/theme` | `/theme` | `/theme`、`/custom-theme` | — |
| Vim 模式 | — | `/vim` | `/vim` | — | `/vim` |
| 状态栏 | `/statusline` | `/statusline` | `/statusline` | — | — |
| 终端安装 | `/terminal-setup` | — | `/terminal-setup` | — | — |
| GitHub 设置 | `/install-github-app` | 无对应 Slash 命令 | `/setup-github` | — | `/setup-github` |
| 反馈或问题上报 | `/feedback`、`/bug`、`/share` | `/feedback` | `/bug` | `/feedback` | `/feedback` |
| 更新与发行说明 | `/release-notes` | — | `/update` | 内置更新 Skill | `/upgrade`、`/release-notes` |
| 临时旁路问题 | `/btw` | `/side`、`/btw` | `/btw` | `/btw` | — |
| 浏览器或 Web | `/chrome`、`/deep-research` | `/apps` | — | `/web` | — |
| 多模型或多代理协作模式 | `/advisor`、`/batch` | `/agent` | `/arena`、`/batch` | `/swarm` | `/quest` |
| 远程控制 | `/remote-control`、`/rc`、`/teleport`、`/desktop`、`/app` | `/app` | — | `/web` | 条件项：Cloud Mode |
| 退出程序 | `/exit`、`/quit` | `/exit`、`/quit` | `/quit`、`/exit` | `/exit`、`/quit`、`/q` | `/quit`、`/exit` |
| 帮助 | `/help` | 命令选择器 | `/help`、`/?` | `/help`、`/h`、`/?` | `/help` |

## 各产品命令目录

### Claude Code

`/add-dir`、`/advisor`、`/agents`、`/autofix-pr`、`/background`、`/batch`、`/branch`、`/btw`、`/bug`、`/cd`、`/chrome`、`/claude-api`、`/clear`、`/code-review`、`/color`、`/compact`、`/config`、`/context`、`/copy`、`/cost`、`/dataviz`、`/debug`、`/deep-research`、`/design-login`、`/design-sync`、`/desktop`、`/diff`、`/doctor`、`/effort`、`/exit`、`/export`、`/fast`、`/feedback`、`/fewer-permission-prompts`、`/focus`、`/fork`、`/goal`、`/heapdump`、`/help`、`/hooks`、`/ide`、`/init`、`/insights`、`/install-github-app`、`/install-slack-app`、`/keybindings`、`/login`、`/logout`、`/loop`、`/mcp`、`/memory`、`/mobile`、`/model`、`/passes`、`/permissions`、`/plan`、`/plugin`、`/powerup`、`/privacy-settings`、`/radio`、`/recap`、`/release-notes`、`/reload-plugins`、`/reload-skills`、`/remote-control`、`/remote-env`、`/rename`、`/resume`、`/review`、`/rewind`、`/run`、`/run-skill-generator`、`/sandbox`、`/schedule`、`/scroll-speed`、`/security-review`、`/setup-bedrock`、`/setup-vertex`、`/simplify`、`/skills`、`/stats`、`/status`、`/statusline`、`/stickers`、`/stop`、`/subtask`、`/tasks`、`/team-onboarding`、`/teleport`、`/terminal-setup`、`/theme`、`/tui`、`/ultraplan`、`/ultrareview`、`/upgrade`、`/usage`、`/usage-credits`、`/verify`、`/voice`、`/web-setup`、`/workflows`。

### Codex

`/agent`、`/apps`、`/approve`、`/archive`、`/clear`、`/compact`、`/copy`、`/debug-config`、`/delete`、`/diff`、`/exit`、`/experimental`、`/fast`、`/feedback`、`/fork`、`/goal`、`/hooks`、`/ide`、`/import`、`/init`、`/keymap`、`/logout`、`/mcp`、`/memories`、`/mention`、`/model`、`/new`、`/permissions`、`/personality`、`/pet`、`/pets`、`/plan`、`/plugins`、`/ps`、`/raw`、`/rename`、`/resume`、`/review`、`/sandbox-add-read-dir`、`/setup-default-sandbox`、`/side`、`/skills`、`/status`、`/statusline`、`/stop`、`/theme`、`/title`、`/usage`、`/vim`。

### Qwen Code

Qwen Code 的固定命令面由两套加载器共同组成。只扫描硬编码命令会漏掉 `/review` 等随产品提供的 Skill 命令。

#### 硬编码命令

源码中共有 66 个主命令定义：

`/agents`、`/approval-mode`、`/arena`、`/auth`、`/branch`、`/btw`、`/bug`、`/cd`、`/clear`、`/compress`、`/compress-fast`、`/config`、`/context`、`/copy`、`/delete`、`/diff`、`/directory`、`/docs`、`/doctor`、`/dream`、`/editor`、`/effort`、`/export`、`/extensions`、`/forget`、`/fork`、`/goal`、`/help`、`/history`、`/hooks`、`/ide`、`/import-config`、`/init`、`/insight`、`/language`、`/learn`、`/lsp`、`/mcp`、`/memory`、`/model`、`/permissions`、`/plan`、`/quit`、`/recap`、`/reload-plugins`、`/remember`、`/rename`、`/restore`、`/resume`、`/rewind`、`/settings`、`/setup-github`、`/skills`、`/stats`、`/status`、`/statusline`、`/summary`、`/tasks`、`/terminal-setup`、`/theme`、`/tools`、`/trust`、`/update`、`/vim`、`/voice`、`/workflows`。

其中 6 个受条件控制：

| 命令 | 出现条件 |
| --- | --- |
| `/workflows` | Workflows 功能开关开启 |
| `/dream`、`/forget` | Managed Memory 可用 |
| `/trust` | Folder Trust 开启 |
| `/restore` | File Checkpointing 开启 |
| `/lsp` | LSP 开启 |

硬编码命令还提供 13 个别名：

`/about`、`/connect`、`/login`、`/reset`、`/new`、`/summarize`、`/dir`、`/?`、`/exit`、`/tag`、`/continue`、`/rollback`、`/usage`。

#### 随产品提供的 Skill 命令

源码中共有 9 个随产品提供的 Skill：

| 命令 | 参数 | 行为 |
| --- | --- | --- |
| `/batch` | `<operation> <file-pattern>` | 发现文件、分块并交给并行执行 Agent |
| `/dataviz` | 由请求内容决定 | 提供图表、仪表盘、地图和数据可视化指导 |
| `/extension-creator` | `<extension-path> [template]` | 创建、校验并本地测试 Qwen Code 扩展 |
| `/loop` | `[interval] [prompt] \| list \| clear` | 创建、查看或清理定时与自驱循环；仅 Cron 开启时出现 |
| `/new-app` | 由请求内容决定 | 执行新应用从需求到原型的工作流 |
| `/qc-helper` | `<question>` | 基于 Qwen Code 用户文档回答使用、配置和排障问题 |
| `/review` | `[pr-number\|file-path] [--effort low\|medium\|high] [--comment]` | 审查本地变化、文件或 PR |
| `/simplify` | `[focus]` | 检查近期改动并直接应用明确的清理 |
| `/stuck` | `[PID or symptom]` | 诊断卡住、缓慢或资源异常的 Qwen Code 会话 |

这些命令默认同时允许用户和模型调用，并支持交互式、非交互式和 ACP。bare mode 不加载它们；`skills.disabled` 和 `slashCommands.disabled` 可按名称关闭。

#### 动态命令

动态数量取决于本机和项目内容，不能给出固定总数：

- 用户、项目和扩展 `SKILL.md`：注册为 `/<skill-name>`。
- 用户、项目和扩展 `commands/` 目录中的 Markdown/TOML：注册为对应 `/<command-name>`。
- 保存的 Workflow：功能开启后注册为 `/<workflow-name>`，仅交互式执行。
- MCP Server 暴露的 Prompt：注册为相应 Slash 命令。

实际加载顺序为：MCP Prompt → 硬编码命令 → 随产品提供的 Skill → 用户/项目/扩展 Skill → 保存的 Workflow → Markdown/TOML 命令。普通命令同名时后加载者覆盖前者；扩展命令冲突时改名为 `extensionName.commandName`。`skills.disabled` 只过滤 Skill，不会误伤同名硬编码命令或 MCP Prompt；`slashCommands.disabled` 在合并后过滤最终命令名和别名。

#### Web Shell 本地命令

Web Shell 还固定提供 4 个不属于 CLI/TUI 硬编码加载器的本地命令：

| 命令 | 行为 | 条件 |
| --- | --- | --- |
| `/log` | 打开工作区 Git 提交历史 | 需要 Git 工作区 |
| `/prs` | 打开工作区的 GitHub Pull Request 列表 | 需要受支持的 GitHub 仓库 |
| `/release` | 打开 live session 释放对话框 | Web Shell live session |
| `/schedule` | 打开定时任务管理页 | Web Shell |

因此“Qwen Code 命令总数”必须绑定 Surface。CLI/TUI 的固定命令面、Web Shell 本地命令和每台机器动态发现的命令不能合并成一个不带条件的数字。

### Kimi Code

`/add-dir`、`/auto`、`/btw`、`/check-kimi-code-docs`、`/compact`、`/copy`、`/custom-theme`、`/editor`、`/exit`、`/experiments`、`/export-debug-zip`、`/export-md`、`/feedback`、`/fork`、`/goal`、`/help`、`/import-from-cc-codex`、`/init`、`/login`、`/logout`、`/mcp`、`/mcp-config`、`/model`、`/new`、`/permission`、`/plan`、`/plugins`、`/provider`、`/sessions`、`/settings`、`/status`、`/sub-skill`、`/swarm`、`/tasks`、`/theme`、`/title`、`/undo`、`/update-config`、`/usage`、`/version`、`/web`、`/yolo`。

### Qoder CLI

`/agents`、`/clear`、`/commands`、`/compact`、`/config`、`/context-window`、`/effort`、`/export`、`/fast`、`/feedback`、`/help`、`/init`、`/login`、`/logout`、`/mcp`、`/memory`、`/model`、`/plan`、`/quest`、`/quit`、`/release-notes`、`/resume`、`/review`、`/setup-github`、`/skills`、`/status`、`/tasks`、`/upgrade`、`/usage`、`/vim`、`/workflows`。

## 来源

- [Claude Code 交互命令](https://code.claude.com/docs/en/commands)
- [Codex CLI 命令](https://developers.openai.com/codex/cli/slash-commands)
- [Qwen Code 硬编码命令加载器](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/packages/cli/src/services/BuiltinCommandLoader.ts)
- [Qwen Code bundled Skill 加载器](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/packages/cli/src/services/BundledSkillLoader.ts)
- [Qwen Code 用户、项目与扩展 Skill 加载器](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/packages/cli/src/services/SkillCommandLoader.ts)
- [Qwen Code Markdown/TOML 命令加载器](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/packages/cli/src/services/FileCommandLoader.ts)
- [Qwen Code 保存的 Workflow 加载器](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/packages/cli/src/services/saved-workflow-loader.ts)
- [Qwen Code MCP Prompt 加载器](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/packages/cli/src/services/McpPromptLoader.ts)
- [Qwen Code 命令合并与冲突处理](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/packages/cli/src/services/CommandService.ts)
- [Qwen Code `/review` Skill](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/core/src/skills/bundled/review/SKILL.md)
- [Qwen Code Web Shell 本地命令](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/packages/web-shell/client/constants/localCommands.ts)
- [Kimi Code Slash 命令](https://github.com/MoonshotAI/kimi-code/blob/main/docs/zh/reference/slash-commands.md)
- [Qoder CLI 命令](https://docs.qoder.com/en/cli/command)

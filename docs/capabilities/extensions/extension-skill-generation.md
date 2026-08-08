# Skill 生成与维护

[返回扩展系统详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=extension-skill-generation)

> 核对日期：2026-08-08

## 定义

从知识源或成功任务自动生成 Skill，并按活跃度对生成的 Skill 进行清理、归档、固定或恢复，比较入口、来源标记与维护边界。

## 扩展结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/run-skill-generator` · `/verify` 记录配方；无 `/learn` | 官方确认 |
| Codex | Record & Replay · `$skill-creator` · `$skill-installer` | 官方确认 |
| Qwen Code | `/learn` · Auto Skill · `/curator` 归档 | 源码确认 |
| Kimi Code | 手动编写 `SKILL.md`；无生成与维护 | 官方确认 |
| Qoder CLI | 手动编写 `SKILL.md`；无生成与维护 | 官方确认 |

## 比较边界

### 本页包含

- 从 URL、路径、文本、视频或工作流演示生成 Skill 的入口
- 自动生成的来源标记与管理范围
- 按活跃度清理、归档、固定或恢复 Skill 的维护命令

### 本页不包含

- Skill 的发现目录、调用方式与禁用粒度（见 Agent Skills）
- 仅有一段提示词的自定义 Slash 命令
- 插件整包分发 Skills

## 跨产品事实

1. 只有 Qwen Code 提供从任意知识源生成 Skill 的通用入口 `/learn`，并配套 Auto Skill 与 `/curator` 的 stale、archive、restore 维护；其余四家没有等价的 `/learn` 或按活跃度归档的 curator。
2. Claude Code 与 Codex 在特定工作流中自动写入 Skill：Claude 的 `/run-skill-generator`、`/verify` 记录运行配方，Codex 的 Record & Replay 起草 Skill、`$skill-creator` 问答生成、`$skill-installer` 安装策展 Skill。
3. Kimi Code 与 Qoder CLI 的 Skill 仅手动编写；停用分别通过 frontmatter 关闭模型自动调用或删除目录，没有按活跃度归档的机制。
4. 生成的 Skill 与手写 Skill 共用同一加载与权限模型；Qwen 用 frontmatter `source: learned` 与 `source: auto-skill` 区分来源，且 Auto Skill 只管理 `auto-skill-*` 目录，个人、扩展、内置和手写 Skill 永不被选中。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/run-skill-generator` · `/verify` 记录配方；无 `/learn` |
| 入口与配置 | 没有通用 `/learn`。`/run-skill-generator` 记录项目的构建与启动配方；`/verify` 在没有配方时记录自己的配方。 |
| 文件与目录 | 生成的 Skill 写入项目目录：`/run-skill-generator` 写到 `.claude/skills/run-<name>/`；`/verify` 写到 `.claude/skills/verify/SKILL.md`，monorepo 可写在被改动的包目录。 |
| 具体行为 | `/run-skill-generator` 捕获安装命令、环境变量和启动脚本并提交为每项目 Skill；`/verify` 只在之前引导错误（命令失败或缺步骤）时编辑已记录文件。 |
| 作用域与优先级 | 生成的 Skill 属于项目层，随仓库共享；仓库根的记录 Skill 会替代同名内置 `/verify`。 |
| 扩展构成 | 标准 `SKILL.md` 前置元数据与正文指令；记录内容为可复现的运行配方。 |
| 加载与刷新 | 运行中检测 Skill 变化；记录后的 `/run`、`/verify` 等按新配方执行。 |
| 适用界面 | 以 Claude Code CLI 为准；VS Code 扩展、桌面端或 Headless 中不同的入口会单独注明。 |
| 权限与信任 | 生成与调用仍经过 Claude Code 权限规则；`skillOverrides` 可手动隐藏或禁用。 |
| 条件与边界 | 自动写入只发生在 `/run-skill-generator`、`/verify` 等特定内置工作流；没有从任意 URL 或文本生成 Skill 的通用入口，也没有归档未使用 Skill 的 curator。`skill-creator` 插件用于评测和描述调优，不从用户行为自动生成任意 Skill。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Skills](https://code.claude.com/docs/en/skills) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | Record & Replay · `$skill-creator` · `$skill-installer` |
| 入口与配置 | Record & Replay 录制工作流并起草可复用 Skill；内置 `$skill-creator` 通过问答生成 Skill；`$skill-installer` 安装策展 Skill（如 `$skill-installer linear`）。 |
| 文件与目录 | 手动与生成的 Skill 都放在 `.agents/skills`（项目）、`~/.agents/skills`（用户）、`/etc/codex/skills`（管理员）；安装器可从其他仓库下载。 |
| 具体行为 | Record & Replay 捕获演示步骤并草拟 Skill；`$skill-creator` 询问用途、触发时机，并选择仅指令或含脚本，默认仅指令。 |
| 作用域与优先级 | 项目、用户、管理员和系统四层来源；项目层可随代码共享。 |
| 扩展构成 | `SKILL.md`（必需 `name`、`description`）加可选脚本、模板和参考资料。 |
| 加载与刷新 | Codex 自动检测 Skill 变化与新安装；未出现时重启。 |
| 适用界面 | 以 Codex CLI 为准；桌面端、IDE 扩展、Cloud 和 `codex exec` 不自动继承全部交互命令。 |
| 权限与信任 | Skill 不扩大工具授权；脚本仍受审批与沙箱约束。 |
| 条件与边界 | 没有从成功任务自动生成 Skill 的 Auto Skill，也没有归档未使用 Skill 的 curator；不删除而停用可在 `~/.codex/config.toml` 的 `[[skills.config]]` 设 `enabled = false`（需重启）。 |
| 证据状态 | 官方确认 |
| 来源 | [Codex Agent Skills](https://learn.chatgpt.com/docs/build-skills)、[Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/learn` · Auto Skill · `/curator` 归档 |
| 入口与配置 | `/learn <source> [focus]` 从 URL、本地路径、文本或视频生成项目 Skill；Auto Skill 自动生成并维护 `auto-skill-*`；`/curator` 查看与维护。 |
| 文件与目录 | `/learn` 结果写入 `.qwen/skills/learned-skill-<name>/SKILL.md`（frontmatter `source: learned`）；Auto Skill 管理 `.qwen/skills/auto-skill-*`（frontmatter `source: auto-skill`）；归档移到 `.qwen/archived-skills/`。 |
| 具体行为 | `/learn` 作为普通 Agent 轮运行，把知识源蒸馏为可复用 Skill，可在路径或 URL 后加文本聚焦重点；Auto Skill 启用后定期把不活跃的生成 Skill 移出活跃库：30 天无成功使用或 `SKILL.md` 编辑标记为 stale，90 天整目录移到 `.qwen/archived-skills/`，不永久删除；自动维护在受信任工作区每 7 天至多一次。 |
| 作用域与优先级 | 生成与维护只作用于项目层 Skill；个人、扩展、内置和手写 Skill 永不被 Auto Skill 选中。 |
| 扩展构成 | 标准 `SKILL.md` 加 frontmatter `source` 标记（`learned` 或 `auto-skill`）；本地记录成功使用以判断活跃度。 |
| 加载与刷新 | 普通会话监视个人与项目 Skill 目录，增删改后短延迟自动刷新 Skill 列表与调用状态；bare mode 不启动监视，需重启。 |
| 适用界面 | 以 Qwen Code CLI 为准；Headless、ACP 和 IDE Companion 中不同的加载行为会单独注明。 |
| 权限与信任 | `/learn` 与 Skill 调用继续经过 approval mode、沙箱和工具策略。 |
| 条件与边界 | 视频学习需要 OpenAI 兼容 Provider 上的视频模型，YouTube 页面 URL 不是直接视频输入；`/curator` 的 status 与 `run --dry-run` 在 safe mode 和未信任工作区可用，应用维护（`run`）、`pin`/`unpin`、`restore` 需要受信任且非 safe mode 工作区；pinned 的 auto-skill 在取消固定前不参与 stale 与归档；启用 Auto Skill 生成的具体配置键未在 skills.md 列出。 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code skill learning and curation](https://github.com/QwenLM/qwen-code/blob/8673151ebdb1e6a101bc4cb3e2c2beb6e0141b7c/docs/users/features/skills.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 手动编写 `SKILL.md`；无生成与维护 |
| 入口与配置 | 手动创建 `SKILL.md`（目录形式）或单个 `.md`（扁平形式，名称取文件名）并放入扫描目录；无生成命令。 |
| 文件与目录 | 用户 `~/.kimi-code/skills/`、项目 `.kimi-code/skills/`、`config.toml` 额外目录与内置 Skills。 |
| 具体行为 | Skill 由用户编写后被斜杠调用，或模型按 `description`、`whenToUse` 自动调用；没有从知识源或成功任务自动生成 Skill 的机制。 |
| 作用域与优先级 | 优先级 Project、User、Extra、Built-in；同名时高优先级来源覆盖低优先级来源。 |
| 扩展构成 | `SKILL.md` frontmatter（`name`、`description`、`type`、`whenToUse`、`disableModelInvocation`、`arguments`）与正文占位符。 |
| 加载与刷新 | 启动时按目录发现；变化通过 `/reload` 或新会话生效。 |
| 适用界面 | 以 Kimi Code CLI 为准；ACP、Web UI 和外部编辑器只在对应能力中单独列出。 |
| 权限与信任 | Skill 不绕过工具权限与交互模式。 |
| 条件与边界 | 官方 Skills 文档未列出任何自动生成、`/learn` 或归档/清理未使用 Skill 的维护功能；停用只能删除目录或用 frontmatter 关闭模型自动调用。 |
| 证据状态 | 官方确认 |
| 来源 | [Kimi Code current Skills](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/customization/skills.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 手动编写 `SKILL.md`；无生成与维护 |
| 入口与配置 | 手动创建 Skill 目录并编写 `SKILL.md`（必需 `name`、`description`）；无生成命令。 |
| 文件与目录 | 用户 `~/.qoder/skills/{name}/`、项目 `.qoder/skills/{name}/`；可含 `REFERENCE.md`、`EXAMPLES.md`、`scripts/`、`templates/`。 |
| 具体行为 | 新会话启动加载，运行中用 `/skills reload` 刷新；模型可按描述自动调用或 `/skill-name` 手动调用；没有自动生成或学习 Skill 的机制。 |
| 作用域与优先级 | 项目 Skill 覆盖同名用户 Skill；Plugin 可分发 Skills。 |
| 扩展构成 | `SKILL.md` 加可选参考、示例、脚本和模板。 |
| 加载与刷新 | 更新直接编辑 `SKILL.md`，新会话或 `/skills reload` 生效。 |
| 适用界面 | 以 Qoder CLI 为准；Agent SDK、ACP 和 Qoder IDE 中不同的入口会单独注明。 |
| 权限与信任 | Skill 要求的工具调用继续走 Qoder CLI permission rules。 |
| 条件与边界 | 官方 Skills 文档未列出任何自动生成、`/learn` 或归档/清理未使用 Skill 的维护功能；删除即 `rm -rf` Skill 目录，永久移除全部文件。 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI Skills](https://docs.qoder.com/en/cli/Skills) |

## 官方来源

- [Claude Code Skills](https://code.claude.com/docs/en/skills)
- [Codex Agent Skills](https://learn.chatgpt.com/docs/build-skills)
- [Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)
- [Qwen Code skill learning and curation](https://github.com/QwenLM/qwen-code/blob/8673151ebdb1e6a101bc4cb3e2c2beb6e0141b7c/docs/users/features/skills.md)
- [Kimi Code current Skills](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/customization/skills.md)
- [Qoder CLI Skills](https://docs.qoder.com/en/cli/Skills)

## 关联能力

- [Agent Skills](./extension-skills.md)
- [记忆管理](../commands/cmd-memory.md)
- [Skills](../commands/cmd-skills.md)

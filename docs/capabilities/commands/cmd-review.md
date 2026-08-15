# 代码审查

[返回 Slash 命令详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=cmd-review)

> 核对日期：2026-08-15

## 定义

启动由产品提供的代码审查流程，对本地工作区、Git Diff 或 Pull Request 产生结构化问题清单。

## 命令对照

| 产品 | 命令摘要 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/code-review [low\|medium\|high\|xhigh\|max\|ultra] [--fix] [--comment] [target]`、`/security-review` | 官方确认 |
| Codex | `/review` | 官方确认 |
| Qwen Code | `/review [pr-number\|file-path] [--effort low\|medium\|high] [--comment]` | 源码确认 |
| Kimi Code | 无对应命令 | 未确认 |
| Qoder CLI | `/review [instruction]` | 官方确认 |

## 比较边界

### 本页包含

- 本地 Diff Review
- PR Review
- 安全审查
- 自动应用或发表评论参数

### 本页不包含

- 普通提示词要求“看看代码”
- CI 检查
- 自动修复 PR 后续评论

## 跨产品事实

1. Claude Code 自 v2.1.223 起把 `/review` 改为 `/code-review` 的别名，`/security-review` 仍是独立的安全审查命令。
2. Codex `/review` 面向工作树审查。
3. Qwen Code `/review` 由随产品提供的 Skill 注册，不在硬编码命令加载器中。
4. Kimi Code 当前官方内置命令目录没有独立 Review 命令。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/code-review [low\|medium\|high\|xhigh\|max\|ultra] [--fix] [--comment] [target]`、`/security-review` |
| 别名 | `/review` |
| 参数 | 级别为 `low\|medium\|high\|xhigh\|max\|ultra`；target 为文件路径、PR 编号、分支名或 ref range；`--fix`、`--comment` |
| 执行行为 | `/code-review` bundled Skill 审查当前 Diff 或指定 target；不带级别时复用会话最近一次输入的级别；`ultra` 运行云端 ultrareview，不可用时回退本地审查；`/security-review` 检查 Diff 的安全漏洞。 |
| 可用模式 | 交互式；`-p` 支持 `/code-review ultra`，另有 `claude ultrareview` 子命令 |
| 保存范围 | `--fix` 把 findings 应用到工作树（后台审查编辑不经过会话检查点，`/rewind` 不回退；前台编辑可回退）；`--comment` 发布 GitHub PR 行内评论；其余形式只读 |
| 条件与边界 | v2.1.223 起 `/review` 为 `/code-review` 别名；账号可用 ultrareview 时 `/ultrareview` 是 `/code-review ultra` 的别名。`ultra` 需要 claude.ai 账号登录并开启 usage credits，Amazon Bedrock、Google Cloud Agent Platform、Microsoft Foundry 与 ZDR 组织不可用，不可用时回退本地审查；`/code-review` 标记 `disable-model-invocation`，只在显式调用时运行 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Commands](https://code.claude.com/docs/en/commands)、[Claude Code Review](https://code.claude.com/docs/en/code-review)、[Claude Code v2.1.223 changelog](https://github.com/anthropics/claude-code/blob/5cf69b18c86d/CHANGELOG.md)、[Claude Code ultrareview](https://code.claude.com/docs/en/ultrareview) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/review` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 进入代码审查模式，审查未提交变化或与基线分支比较。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 默认产生审查结果，不等同于自动修改 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 官方确认 |
| 来源 | [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/review [pr-number\|file-path] [--effort low\|medium\|high] [--comment]` |
| 别名 | 无公开别名 |
| 参数 | `[pr-number\|file-path] [--effort low\|medium\|high] [--comment]` |
| 执行行为 | 审查本地未提交变化、指定文件或 Pull Request。PR 默认使用 high，本地和文件默认使用 medium；同仓 PR 进入临时 Worktree，跨仓 URL 使用轻量模式。 |
| 可用模式 | 交互式、非交互式、ACP |
| 保存范围 | 默认输出审查结果；PR 加 `--comment` 可提交一次 GitHub Review；临时文件与 Worktree 按流程清理 |
| 条件与边界 | 随产品提供的 Skill 在 bare mode、`skills.disabled` 或 `slashCommands.disabled` 命中时不可用；PR 读取或评论需要 GitHub 访问权限 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code bundled Skill loader](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/packages/cli/src/services/BundledSkillLoader.ts)、[Qwen Code review Skill](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/core/src/skills/bundled/review/SKILL.md)、[Qwen Code command mode filter](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/packages/cli/src/services/commandUtils.ts) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | 无对应命令 |
| 别名 | 无公开别名 |
| 参数 | — |
| 执行行为 | 可以通过提示执行审查，但当前官方 Slash 命令目录没有 `/review`。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | — |
| 条件与边界 | 不据此推断底层能力不存在 |
| 证据状态 | 未确认 |
| 来源 | [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860/docs/zh/reference/slash-commands.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/review [instruction]` |
| 别名 | 无公开别名 |
| 参数 | `[instruction]` |
| 执行行为 | 以 Prompt 命令审查本地待提交 Git 变化。 |
| 可用模式 | TUI 与 Headless |
| 保存范围 | 只读审查提示；后续是否修改取决于任务交互 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference) |

## 官方来源

- [Claude Code Commands](https://code.claude.com/docs/en/commands)
- [Claude Code Review](https://code.claude.com/docs/en/code-review)
- [Claude Code v2.1.223 changelog](https://github.com/anthropics/claude-code/blob/5cf69b18c86d/CHANGELOG.md)
- [Claude Code ultrareview](https://code.claude.com/docs/en/ultrareview)
- [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)
- [Qwen Code bundled Skill loader](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/packages/cli/src/services/BundledSkillLoader.ts)
- [Qwen Code review Skill](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/core/src/skills/bundled/review/SKILL.md)
- [Qwen Code command mode filter](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/packages/cli/src/services/commandUtils.ts)
- [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860/docs/zh/reference/slash-commands.md)
- [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference)

## 关联能力

- [查看 Diff](./cmd-diff.md)
- [GitHub 设置](./cmd-github.md)
- 代码 Review：见对应能力矩阵

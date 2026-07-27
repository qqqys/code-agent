# Qwen Code 命令与 Skill 勘误

核对 Qwen Code 当前源码后，修正了先前只扫描硬编码命令所造成的遗漏。

## 修正

- Qwen Code 提供 `/review`。它由 `BundledSkillLoader` 将随产品发布的 `review` Skill 注册为 Slash 命令。
- `/review` 支持本地未提交变化、文件和 Pull Request，参数为 `[pr-number|file-path] [--effort low|medium|high] [--comment]`。
- 补录 9 个随产品提供的 Skill 命令：`/batch`、`/dataviz`、`/extension-creator`、`/loop`、`/new-app`、`/qc-helper`、`/review`、`/simplify`、`/stuck`。
- 将 Qwen Code 命令面拆成硬编码命令、随产品提供的 Skill、用户/项目/扩展 Skill、Markdown/TOML 命令、保存的 Workflow 和 MCP Prompt 六个来源。
- 单列 Web Shell 本地提供的 `/log`、`/prs`、`/release`、`/schedule`，不与 CLI/TUI 固定命令混算。
- 补充 bare mode、Cron、Folder Trust、功能开关以及两个禁用列表对命令可见性的影响。
- 所有 Qwen Code 命令与 Subagent 证据链接统一固定到官方仓库提交，不再使用只存在于个人分支的提交坐标。

## 影响页面

- [Slash 命令矩阵](../docs/01-Slash命令矩阵.md)
- [代码审查详情](../docs/capabilities/commands/cmd-review.md)
- [Skills 详情](../docs/capabilities/commands/cmd-skills.md)
- [插件或扩展详情](../docs/capabilities/commands/cmd-plugins.md)
- [自定义命令详情](../docs/capabilities/commands/cmd-custom.md)
- [多模型或多代理模式详情](../docs/capabilities/commands/cmd-collaboration.md)

## 证据版本

Qwen Code 官方仓库核对到 `2e08486b529bf64ca3b31d13424ad12f1100de93`，页面中的相关链接固定到该提交。

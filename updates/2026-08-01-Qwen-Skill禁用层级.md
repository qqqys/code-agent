# Qwen Code Skill 禁用层级与五家禁用粒度核对

Qwen Code 在 2026-08-01 的提交中新增 `skills.disabledLevels` 设置，可按发现层级整体关闭 Skill。本次把这个一手确认的新功能并入现有 `extension-skills` 字段（不新增同义字段），并核对五家的 Skill 禁用粒度，补足详情页的跨产品事实与各家条件说明。

## 修正

- `extension-skills` 矩阵 Qwen Code 列由 `/<skill-name>` · `.qwen/skills/` 更新为追加 `skills.disabledLevels`。
- Qwen Code 详情记录新增：`skills.disabledLevels` 可整体跳过 `project`、`user`、`extension`、`bundled` 层级，默认 `undefined`，跨作用域取并集，`requiresRestart`；`skills.directories` 按 `user` 层发现，`["user"]` 会一并隐藏；逐个控制另有 `skills.disabled`、`skills.enabled`、`skills.defaultDisabled`，但 `skills.enabled` 不能恢复被 `disabledLevels` 排除的层级；safe mode、bare mode 与未信任工作区的 daemon 会忽略该设置。
- 跨产品事实新增禁用粒度对比：Claude Code 用 `disableBundledSkills`（仅内置层）与 `skillOverrides`（逐个）；Codex 用 `[[skills.config]]` 按 `SKILL.md` 路径逐个 `enabled = false`；Kimi Code 仅 frontmatter `disableModelInvocation`、`type: flow` 逐个关闭模型自动调用；Qoder CLI 无独立技能软禁用，只能停用承载插件或删除目录。
- Claude Code 条件补充 `skillOverrides`、`disableBundledSkills`、`/permissions` 的 `Skill()` 拒绝与 frontmatter 收窄；来源补充 Settings。
- Codex 条件补充 `[[skills.config]]` 与 `allow_implicit_invocation`；来源补充配置参考。
- Kimi Code、Qoder CLI 条件补充各自禁用边界。

## 影响页面

- [扩展系统矩阵](../docs/05-扩展系统矩阵.md)
- [Agent Skills 详情](../docs/capabilities/extensions/extension-skills.md)

## 证据版本

- Qwen Code 官方仓库提交 `de022664dc59a3c2f7af083acaaba6a86f14115c`（`feat(skills): add disabled skill levels (#8057)`），含 `docs/users/configuration/settings.md`、`settingsSchema.ts`、`skill-manager.ts` 与测试。
- Claude Code 官方文档 Skills 与 Settings（`skillOverrides`、`disableBundledSkills`、`/permissions` 的 `Skill()`、frontmatter `disable-model-invocation`）。
- Codex 官方文档 Build Skills 与配置参考（`[[skills.config]]` 的 `enabled = false`、`allow_implicit_invocation`）。
- Kimi Code 官方仓库 `46f909d694b5d0b4bd74ed891c061949cc678e26`，`docs/zh/customization/skills.md` 与 `packages/agent-core/src/skill/registry.ts`（`disableModelInvocation`、`type: flow`）。
- Qoder CLI 官方文档 Skills 与 Plugins（独立技能仅可删除目录；插件 `enabledPlugins`、`qodercli plugins disable`）。

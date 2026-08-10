# Codex apply_patch 换行保留模式

Codex 官方仓库在 2026-08-10 合入提交 `21aa552e8727`（PR #37757）与 `c9c6c0daa994`（PR #37758），为 `apply_patch` 增加换行保留模式：默认仍是 `NormalizeToLf`（把更新文件归一为 LF），新增 `PreserveLineEndings` 模式后未改动行保留原换行、插入行采用文件首个已有换行风格，由 `config.toml` 的 `[features]` 下 `apply_patch_preserve_line_endings` 开关控制（默认关闭、`UnderDevelopment` 阶段）。两个提交均在 main 分支，尚未进入 Release（最新稳定版为 2026-08-07 的 rust-v0.147.0），官方配置参考也未列出该开关。矩阵“文件读写”字段此前只记录 Codex “内置读取 · 补丁编辑”，本次更新该字段的 Codex 记录与矩阵结论，并顺带核对五家文件编辑工具的换行处理。

## 修正

- `execution-files`（文件读写）矩阵 Codex 列由“内置读取 · 补丁编辑”更新为“内置读取 · 补丁编辑 · `apply_patch_preserve_line_endings` 换行保留（条件：main 分支，尚未发布）”。
- `execution-files` 详情 Codex 记录：核心机制补充 `NormalizeToLf` 默认行为与 `PreserveLineEndings` 模式语义；条件记录 `[features]` 开关（默认关闭、UnderDevelopment 阶段）、启用后进程内 apply_patch 直接读取 Feature、Core 清除继承值并向子进程环境注入 `CODEX_APPLY_PATCH_PRESERVE_LINE_ENDINGS=1`、独立 `apply_patch` 可执行文件按该环境变量选择模式、2026-08-10 合入 main 且未进入 Release；证据状态标记为“源码确认”。
- `execution-files` 详情 Qwen Code 记录：执行行为补充 `edit` 匹配前把 CRLF 归一为 LF、写回已有文件时按检测到的原换行风格恢复（源码确认）；来源新增固定到提交 SHA 的 `edit.ts`。
- `execution-files` 详情 Claude Code、Kimi Code、Qoder CLI 记录：条件补充官方工具文档未列换行保留或规范化配置；Kimi Code 另记录 `Write` 的 append 模式不自动补换行。
- `execution-files` 跨产品事实新增一条换行处理对比。
- `docs/09-版本与证据.md`：Codex 核对日期更新为 2026-08-10，主要材料补充 `apply_patch` 换行保留模式；Qwen Code 核对日期更新为 2026-08-10，主要材料补充 `edit` 工具默认保留原换行风格；官方来源表 Codex 与 Qwen Code 执行与 Git 列新增对应链接。
- `README.md` 与各生成文档的核对日期更新为 2026-08-10。

## 影响页面

- [任务执行与 Git 矩阵](../docs/06-任务执行与Git矩阵.md)
- [文件读写详情](../docs/capabilities/execution/execution-files.md)
- [版本与证据](../docs/09-版本与证据.md)

## 证据版本

- Codex 官方仓库提交 `21aa552e8727c03189d0f7d18bbd6e7583e88f88`（PR #37757，2026-08-10T01:34:21Z）：新增 `ApplyPatchFileUpdateMode` 枚举，`NormalizeToLf` 为默认（“Preserve the historical behavior of normalizing updated files to LF”），`PreserveLineEndings` “Preserve existing line endings and use the file's preferred ending for new lines”；`text_file.rs` 注释 “Splits contents into logical lines while retaining each line ending. The first existing ending becomes the preferred style for inserted lines; files without an ending default to LF.” 与 “Unchanged lines retain their original endings, inserted lines use the preferred ending”；arg0 派发的独立 `apply_patch` 进程经 `apply_patch_file_update_mode_from_env` 读取环境变量 `CODEX_APPLY_PATCH_PRESERVE_LINE_ENDINGS`（取值 `"1"` 启用，其余或缺省为 LF 归一）；新增 CRLF 与混合换行测试场景。
- Codex 官方仓库提交 `c9c6c0daa994109cec50fddcb57d076fdf9e738c`（PR #37758，2026-08-10T01:34:21Z）：`features` 库新增 `ApplyPatchPreserveLineEndings`（注释 “Preserve existing line endings when apply_patch updates files”），FeatureSpec 为 `key: "apply_patch_preserve_line_endings"`、`stage: Stage::UnderDevelopment`、`default_enabled: false`，并写入 `config.schema.json`；`exec_env.rs` 的 `inject_apply_patch_env` 在特性启用时清除继承值并向子进程环境注入 `CODEX_APPLY_PATCH_PRESERVE_LINE_ENDINGS=1`（“Carries the configured apply-patch line-ending rollout state into child processes”），进程内 apply_patch 路径直接读取 Feature；`Stage` 仅影响提示（UnderDevelopment 启用时给出运行期警告），不阻止 config.toml 启用。
- Codex 官方配置参考（https://learn.chatgpt.com/docs/config-file/config-reference，2026-08-10 抓取）：`[features]` 表与布尔开关写法已有文档（如 `features.unified_exec`），但未列出 `apply_patch_preserve_line_endings`。
- Codex Release 列表（2026-08-10 抓取）：最新稳定版 rust-v0.147.0（2026-08-07T01:41:49Z）、最新预发布 rust-v0.148.0-alpha.5（2026-08-08T02:26:13Z），均早于上述提交，故该开关尚未随 Release 发布。
- Qwen Code `edit` 工具源码（提交 `8a44b1b9f79341a0faca9814fb1b57f0f1b354a2`，`packages/core/src/tools/edit.ts`）：`detectLineEnding(fileInfo.content)` 检测原换行风格，`fileInfo.content.replace(/\r\n/g, '\n')` 归一为 LF 便于匹配，写回已有文件时经 `writeTextFile` 的 `_meta.lineEnding` 传回检测到的换行风格。
- Claude Code 官方工具参考（https://code.claude.com/docs/en/tools-reference，2026-08-10 抓取）：`Edit` 为精确字符串替换，未列换行保留或规范化配置。
- Kimi Code 官方工具文档（提交 `77618e38c35a81e26134b3f83eb7f2b460c0ee05`，`docs/zh/reference/tools.md`）：未列换行保留或规范化配置；`Write` append 模式“将内容追加到文件末尾，不自动添加换行”。
- Qoder CLI 官方内置工具文档（https://docs.qoder.com/cli/sdk/tools 与 https://docs.qoder.com/cli/sdk/references，2026-08-10 抓取）：未列换行保留或规范化配置。

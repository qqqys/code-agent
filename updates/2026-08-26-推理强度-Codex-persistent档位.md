# 推理强度：Codex main 分支新增 `persistent` 档位

Codex 官方仓库于 2026-08-26 合入 "Support persistent reasoning effort"（PR #40799，提交 `3e4707b34b16`），为 `model_reasoning_effort` 新增 `persistent` 取值：协议枚举接受并序列化 `persistent`，TUI 推理强度选择器显示 `Persistent` 行，本地配置保留 `persistent`，发送请求时客户端把它换算为 Responses API 线值 `disabled`；TypeScript SDK `ModelReasoningEffort` 类型同步加入 `persistent`。该提交合入 main 分支，尚未进入 Release（最新稳定版仍为 rust-v0.149.1），官方 models 文档与配置参考未列 `persistent`（配置参考当前只列 `minimal | low | medium | high | xhigh`）。矩阵 `model-effort`（推理强度）字段 Codex 列此前未记录该档位，本次补录。其余四家无同类变化：Claude Code、Qwen Code、Kimi Code、Qoder CLI 保持原有结论。

## 修正

- `model-effort`（推理强度）矩阵 Codex 列更新为 "`/model` · `model_reasoning_effort` · 条件：main 分支（尚未发布）新增 `persistent` 档位，本地保留 `persistent`、发送 Responses API 时换为 `disabled`"。证据状态改为"源码确认"。其余四家矩阵结论不变。
- Codex 详情补录：入口新增 TypeScript SDK `modelReasoningEffort` 选项；支持范围补录 TUI 推理强度选择器按模型预设 `supported_reasoning_efforts` 列出选项；具体行为补录 `persistent` 本地保留、请求换算为 `disabled`、选择器显示 `Persistent`（测试夹具说明文字 `Continue working until put to sleep`）、SDK 以 `--config model_reasoning_effort="persistent"` 传给 CLI；持久化补录 `persistent` 在本地配置中原样保存；条件与边界补录合入时间（2026-08-26，提交 `3e4707b34b16`，PR #40799）、未进入 Release、官方文档未列。
- 跨产品事实新增第 4 条，记录 Codex `persistent` 档位与本地/线值换算关系。
- `site/data.js`：新增来源 `codex-persistent-effort-commit`（提交）、`codex-persistent-effort-protocol`（协议枚举源码）、`codex-persistent-effort-client`（Responses API 换算源码），均固定到提交 `3e4707b34b16e139fcb7ad11ab8445993b62bba1`。`updatedAt` 维持 2026-08-26。
- `docs/09-版本与证据.md`：Codex 核对日期由 2026-08-24 更新为 2026-08-26，主要材料新增推理强度 `persistent` 档位条目；官方来源表 Codex"模型与 Provider"列新增该提交链接。
- `README.md` 核对日期已为 2026-08-26，不变。能力字段总数不变（112 个）。
- `npm run generate` 重新生成 `docs/08-模型与认证矩阵.md` 与 `docs/capabilities/models/`；`npm test` 通过。

## 影响页面

- [模型与认证矩阵](../docs/08-模型与认证矩阵.md)
- [推理强度详情](../docs/capabilities/models/model-effort.md)
- [版本与证据](../docs/09-版本与证据.md)

## 证据版本

- Codex 官方仓库提交 `3e4707b34b16e139fcb7ad11ab8445993b62bba1`（"Support persistent reasoning effort (#40799)"，2026-08-26T04:53:12Z 合入 main）：`codex-rs/protocol/src/openai_models.rs` 的 `ReasoningEffort` 枚举新增 `Persistent` 变体，序列化与解析均使用 `"persistent"`；`codex-rs/tui/src/chatwidget/model_popups.rs` 把 `ReasoningEffortConfig::Persistent` 显示为 `Persistent`；`codex-rs/core/src/client.rs` 注释与实现 "Keep `persistent` in local settings; the Responses API calls it `disabled`."，发送前换算为 `ReasoningEffortConfig::Custom("disabled")`；TUI 测试以 `ReasoningEffortPreset { effort: Persistent, description: "Continue working until put to sleep" }` 注入模型预设的 `supported_reasoning_efforts`；`sdk/typescript/src/threadOptions.ts` 的 `ModelReasoningEffort` 类型加入 `"persistent"`，SDK 测试验证 `modelReasoningEffort: "persistent"` 以 `--config model_reasoning_effort="persistent"` 传给 CLI。
- Codex 官方配置参考（2026-08-26 核对）：`model_reasoning_effort` 取值列为 `minimal | low | medium | high | xhigh`，未列 `persistent`。
- Codex 官方 models 文档（2026-08-26 核对）：推理强度描述 Low（Light）、Medium、High、Extra High、Max、Ultra，未提及 `persistent`。
- 发布状态核对（2026-08-26）：GitHub 官方 Release 最新稳定版为 rust-v0.149.1（2026-08-24T00:28:28Z），最新预发布版为 rust-v0.150.0-alpha.11（2026-08-25T21:30:06Z），均早于该提交合入时间；无包含该提交的 Release。

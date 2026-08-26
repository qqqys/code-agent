# 模型选择与切换

[返回模型与认证详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=model-switch)

> 核对日期：2026-08-26

## 定义

选择主模型，并区分当前会话临时选择、项目默认值、用户默认值和启动参数覆盖。

## 能力结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/model` · `--model` · `ANTHROPIC_DEFAULT_MODEL` 新会话默认模型（v2.1.236 起）· `modelPicker` 定制选择器列表（v2.1.243 起） | 官方确认 |
| Codex | `/model` · `-m` | 官方确认 |
| Qwen Code | `/model` · `--model` | 源码确认 |
| Kimi Code | `/model` · `-m` | 源码确认 |
| Qoder CLI | `/model` · `--model` | 官方确认 |

## 比较边界

### 本页包含

- 交互式模型选择器
- 启动参数与配置字段
- 选择结果的生效范围与持久化
- 选择器模型列表定制（`modelPicker`）

### 本页不包含

- 模型质量、速度和价格评价
- Provider 凭据配置
- Subagent 独立模型继承规则

## 跨产品事实

1. 五家都提供 `/model`，但是否把选择保存为新会话默认值并不一致。
2. Qwen Code 的模型入口还管理 fast、voice、vision、image 等专用模型，并可显式写入项目或用户设置。
3. Claude Code 自 v2.1.153 起 `/model` 选择默认写入用户设置作为新会话默认值；v2.1.236 新增的 `ANTHROPIC_DEFAULT_MODEL` 只在没有更高优先级选择时决定新会话启动模型。
4. Claude Code v2.1.243 起 `modelPicker` 可定制 `/model` 选择器的行、顺序与标签，并可整体替换内置列表；其余四家的选择器列表来自各自内置目录、Provider 配置或账号模型目录，未确认同类定制设置。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/model` · `--model` · `ANTHROPIC_DEFAULT_MODEL` 新会话默认模型（v2.1.236 起）· `modelPicker` 定制选择器列表（v2.1.243 起） |
| 入口与配置 | `/model [alias\|name]`、`claude --model`、`ANTHROPIC_MODEL`、`ANTHROPIC_DEFAULT_MODEL`、Settings `model`、Settings `modelPicker`。 |
| 支持范围 | 支持模型别名、完整模型名和模型选择器；模型可同时暴露 effort 选项。`ANTHROPIC_DEFAULT_MODEL` 指定新会话的默认启动模型；当选择器 Default 行解析到该模型时显示标签 `Set by ANTHROPIC_DEFAULT_MODEL`。`modelPicker` 是带 `options` 行数组和可选 `replaceBuiltInOptions` 布尔值的对象：每行 `model` 必填且按原样取值，接受 `--model` 接受的全部写法（`opus` 等别名、Anthropic 模型 ID、Amazon Bedrock、Google Cloud Vertex/Agent Platform、Microsoft Foundry 或 LLM 网关的 Provider 格式 ID），`label` 与 `description` 可选；未写 `label` 时用内置名称或模型 ID 作标题，未写 `description` 时显示通用第二行。 |
| 具体行为 | 立即切换当前会话后续请求使用的模型；切换已有对话时可能提示重新读取历史。新会话只在 `--model`、`ANTHROPIC_MODEL`、任何设置文件的 `model`（含 `/model` 保存的选择）和组织默认模型都未指定时，才采用 `ANTHROPIC_DEFAULT_MODEL` 的模型；此时经 `--resume`、`--continue` 或 `/resume` 恢复的会话也改用该模型，不恢复记录中保存的模型。`modelPicker` 默认（`replaceBuiltInOptions` 未设或为 `false`）把自定义行追加在内置列表之后，并跳过内置列表已覆盖的模型；`replaceBuiltInOptions` 为 `true` 时选择器只显示这些行、**Default** 行和当前会话正在使用的模型行，隐藏内置列表、`availableModels` 追加行、网关发现模型与 `ANTHROPIC_CUSTOM_MODEL_OPTION` 行。灰显行移到列表底部；标签只改变选择器显示，不改变实际运行的模型。 |
| 会话与作用域 | `/model` 选择作用于当前会话；`--model` 与 `ANTHROPIC_MODEL` 作用于本次进程；`ANTHROPIC_DEFAULT_MODEL` 作用于新会话的启动模型。`modelPicker` 只从 Managed settings、`--settings` 与用户设置读取，项目和 local 设置中的该键被忽略，克隆的仓库无法改标选择器。 |
| 持久化位置 | 自 v2.1.153 起 `/model` 选择器按 `Enter` 或直接输入 `/model <name>` 会把选择写入用户 Settings 的 `model` 字段作为新会话默认值，按 `s` 只切换当前会话；`-p` 非交互模式下 `/model` 不保存默认值。`ANTHROPIC_DEFAULT_MODEL` 不落盘，优先级低于 `/model` 保存的选择；设置 `ANTHROPIC_MODEL` 时每次启动都回到该变量的模型。`modelPicker` 写在哪个设置文件就随该文件持久化；Managed settings、`--settings` 与用户设置三者中优先级最高且设置了该键的来源提供整套列表，Claude Code 不合并两个来源的列表。 |
| 自动化用法 | Headless/CI 使用 `--model` 或 `ANTHROPIC_MODEL` 固定模型；`ANTHROPIC_DEFAULT_MODEL` 用于在没有更高优先级选择时统一新会话启动模型；组织可经 Managed settings 的 `modelPicker` 统一下发选择器列表（例如 Bedrock 部署及团队名称）。 |
| 安全与管理 | 组织可通过 `availableModels` 和 Managed settings 限制可选模型；`enforceAvailableModels` 开启、`availableModels` 或组织模型限制排除该模型、或账号不可用时，`ANTHROPIC_DEFAULT_MODEL` 被忽略。`availableModels` 允许清单同样作用于 `modelPicker` 行：无法提供的行（退役模型、组织无权限的模型）被丢弃，暂不可选的行灰显并附原因，全部行都不成立时回退为按允许清单过滤的内置列表；无法解析的行被丢弃、其余行保留。 |
| 条件与边界 | `ANTHROPIC_DEFAULT_MODEL` 需 v2.1.236 及以上；取值为 `default`、`inherit`、`opusplan` 或 `haiku` 时被忽略。`modelPicker` 的文档页标注需 v2.1.242 及以上，官方 Release 中不存在 v2.1.242，更新日志在 v2.1.243 宣布该设置。模型可见性取决于账号计划、Provider 和组织策略。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code model configuration](https://code.claude.com/docs/en/model-config)、[Claude Code environment variables](https://code.claude.com/docs/en/env-vars)、[Claude Code Commands](https://code.claude.com/docs/en/commands)、[Claude Code settings](https://code.claude.com/docs/en/settings)、[Claude Code settings reference](https://code.claude.com/docs/en/settings-reference)、[Claude Code v2.1.236 changelog (ANTHROPIC_DEFAULT_MODEL)](https://github.com/anthropics/claude-code/blob/084ca20bcf90/CHANGELOG.md)、[Claude Code v2.1.243 changelog (modelPicker)](https://github.com/anthropics/claude-code/blob/8b6ef81f636a/CHANGELOG.md) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/model` · `-m` |
| 入口与配置 | `/model`、`codex -m <model>`、`config.toml` 的 `model`。 |
| 支持范围 | 模型选择器把模型与支持的 reasoning effort 放在同一流程。 |
| 具体行为 | 更改当前线程后续 turn 的模型；启动参数在创建会话时覆盖配置默认值。 |
| 会话与作用域 | `/model` 是当前线程；`-m` 是当前进程；配置文件提供长期默认值。 |
| 持久化位置 | 交互选择不等同于改写配置；长期默认模型写入 `config.toml`。 |
| 自动化用法 | 脚本使用 `codex exec -m`，也可通过命名 profile 固定模型与 Provider。 |
| 安全与管理 | Managed config 和模型 Provider 配置可以限制组织环境中的默认行为。 |
| 条件与边界 | 可选模型依认证方式、账号权限、Provider 与本地运行时而变。 |
| 证据状态 | 官方确认 |
| 来源 | [Codex models](https://learn.chatgpt.com/docs/models)、[Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)、[Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/model` · `--model` |
| 入口与配置 | `/model`、`qwen --model`、`model.name` 与 `modelProviders` 设置。 |
| 支持范围 | 主模型外还可选择 fast、voice、vision、image 模型；支持一次性用另一模型执行提示。 |
| 具体行为 | 切换当前模型，或通过参数配置专用模型；一次性提示不会展开 `@file`。 |
| 会话与作用域 | 默认当前会话；`/model --project` 写项目设置，`--global` 写用户设置。 |
| 持久化位置 | 项目设置保存在 `.qwen/settings.json`，用户设置保存在用户 Qwen 目录。 |
| 自动化用法 | Headless 使用 `--model`；Provider 与模型可以在 settings 或环境配置中固定。 |
| 安全与管理 | 系统 override Settings 可覆盖用户与项目模型配置。 |
| 条件与边界 | 模型 ID、专用模型与能力取决于所选 Provider。 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code current commands](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/features/commands.md)、[Qwen Code current settings](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/settings.md)、[Qwen Code current model providers](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/model-providers.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/model` · `-m` |
| 入口与配置 | `/model`、`kimi -m <model>`、`config.toml` 的 `default_model`。 |
| 支持范围 | 模型来自当前 Provider 配置中的模型列表；`/provider` 可先切换 Provider。 |
| 具体行为 | 改变当前会话后续请求使用的模型；启动参数覆盖配置默认值。 |
| 会话与作用域 | `/model` 是当前会话，`-m` 是当前进程，`default_model` 是长期默认值。 |
| 持久化位置 | 默认模型写入 `~/.kimi-code/config.toml`；会话选择不自动改写配置。 |
| 自动化用法 | 使用 `-m` 或 `KIMI_MODEL_NAME` 临时覆盖；后者属于完整的临时模型通道。 |
| 安全与管理 | 模型配置和 Provider 凭据分离；切换模型不会自动改变认证方式。 |
| 条件与边界 | 模型必须存在于配置的 Provider 与 Model 条目中。 |
| 证据状态 | 源码确认 |
| 来源 | [Kimi Code current slash commands](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/slash-commands.md)、[Kimi Code current CLI reference](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/kimi-command.md)、[Kimi Code current configuration](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/configuration/config-files.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/model` · `--model` |
| 入口与配置 | `/model`、`qodercli --model`、模型选择界面。 |
| 支持范围 | 选择 Default 档位、New Models 或已配置的 Custom Model。 |
| 具体行为 | 切换当前会话模型并可管理模型选项；命令行参数固定本次运行模型。 |
| 会话与作用域 | 默认设置、当前会话选择和 `--session-only` 临时选择分开处理。 |
| 持久化位置 | 模型选项保存在 `~/.qoder/settings.json`；`--session-only` 不落盘。 |
| 自动化用法 | 非交互任务可用 `--model` 和 `--reasoning-effort`。 |
| 安全与管理 | Custom Model API Key 由模型配置流程接收；组织计划可限制模型来源。 |
| 条件与边界 | 模型目录随账号计划与服务发布变化；Custom Model 只适用于 Individual 计划。 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI model configuration](https://docs.qoder.com/en/cli/model)、[Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference) |

## 官方来源

- [Claude Code model configuration](https://code.claude.com/docs/en/model-config)
- [Claude Code environment variables](https://code.claude.com/docs/en/env-vars)
- [Claude Code Commands](https://code.claude.com/docs/en/commands)
- [Claude Code settings](https://code.claude.com/docs/en/settings)
- [Claude Code settings reference](https://code.claude.com/docs/en/settings-reference)
- [Claude Code v2.1.236 changelog (ANTHROPIC_DEFAULT_MODEL)](https://github.com/anthropics/claude-code/blob/084ca20bcf90/CHANGELOG.md)
- [Claude Code v2.1.243 changelog (modelPicker)](https://github.com/anthropics/claude-code/blob/8b6ef81f636a/CHANGELOG.md)
- [Codex models](https://learn.chatgpt.com/docs/models)
- [Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)
- [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)
- [Qwen Code current commands](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/features/commands.md)
- [Qwen Code current settings](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/settings.md)
- [Qwen Code current model providers](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/model-providers.md)
- [Kimi Code current slash commands](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/slash-commands.md)
- [Kimi Code current CLI reference](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/kimi-command.md)
- [Kimi Code current configuration](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/configuration/config-files.md)
- [Qoder CLI model configuration](https://docs.qoder.com/en/cli/model)
- [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference)

## 关联能力

- [推理强度](./model-effort.md)
- [Provider 类型](./model-provider.md)
- [选择模型](../commands/cmd-model.md)

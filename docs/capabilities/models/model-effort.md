# 推理强度

[返回模型与认证详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=model-effort)

> 核对日期：2026-08-21

## 定义

控制推理模型的思考强度、token 预算档位或快速服务模式，并记录其入口和保存范围。

## 能力结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/effort` · `--effort` | 官方确认 |
| Codex | `/model` · `model_reasoning_effort` | 官方确认 |
| Qwen Code | `/effort` | 源码确认 |
| Kimi Code | `[thinking] effort`；无独立命令 | 条件项 |
| Qoder CLI | `/effort` · `--reasoning-effort` | 官方确认 |

## 比较边界

### 本页包含

- reasoning/thinking effort
- 独立命令、模型选择器和配置字段
- 会话级与持久化行为

### 本页不包含

- 模型质量评价
- 上下文窗口大小
- 单纯的响应长度设置

## 跨产品事实

1. Claude Code、Qwen Code 和 Qoder CLI 有独立 `/effort`；Codex 把 effort 放入 `/model`。
2. Kimi Code 没有独立 effort Slash 命令，但可在模型 `[thinking]` 配置与临时模型环境变量中设置。
3. 相同档位名称不能视为相同推理预算；每个 Provider 会自行映射、截断或忽略。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/effort` · `--effort` |
| 入口与配置 | `/effort`、`--effort`、`CLAUDE_CODE_EFFORT_LEVEL`、Settings `effortLevel`。 |
| 支持范围 | 支持 `low\|medium\|high\|xhigh\|max`；`/fast` 是独立的快速服务模式。 |
| 具体行为 | 改变后续模型请求的 effort；不改变模型身份和用户提示。 |
| 会话与作用域 | 命令作用于当前会话；参数和环境变量作用于当前进程。 |
| 持久化位置 | 常规档位可通过 Settings 保存；`max` 除环境变量外为会话级。 |
| 自动化用法 | Headless 用 `--effort` 或环境变量显式固定档位。 |
| 安全与管理 | Managed settings 可限制模型集合，间接限制可用 effort。 |
| 条件与边界 | 档位可用性依模型和账号计划；`max` 不是所有模型都支持。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code model configuration](https://code.claude.com/docs/en/model-config)、[Claude Code Commands](https://code.claude.com/docs/en/commands)、[Claude Code environment variables](https://code.claude.com/docs/en/env-vars) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/model` · `model_reasoning_effort` |
| 入口与配置 | `/model` 中选择；`model_reasoning_effort` 配置字段。 |
| 支持范围 | reasoning effort 与模型目录绑定；`/fast` 控制可用的快速档位。 |
| 具体行为 | 对支持 reasoning 的模型设置推理强度，后续 turn 采用该档位。 |
| 会话与作用域 | 交互选择影响当前线程；配置或 profile 提供长期默认值。 |
| 持久化位置 | `config.toml` 中的字段跨会话；会话选择不必改写配置。 |
| 自动化用法 | CI 和 SDK 使用配置 profile 或显式模型选项固定 effort。 |
| 安全与管理 | 组织 Managed config 可统一模型与运行配置。 |
| 条件与边界 | 不同模型暴露不同档位；无对应档位时不能假设静默等价。 |
| 证据状态 | 官方确认 |
| 来源 | [Codex models](https://learn.chatgpt.com/docs/models)、[Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)、[Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/effort` |
| 入口与配置 | `/effort` 与模型 Provider 配置。 |
| 支持范围 | 统一接收 effort tier，再按 Provider 的支持范围映射或截断。 |
| 具体行为 | 改变当前模型后续请求的推理强度，不切换 Provider。 |
| 会话与作用域 | 当前会话或当前模型配置。 |
| 持久化位置 | 随模型设置保存时跨会话；纯命令选择为当前会话。 |
| 自动化用法 | Headless 可通过配置预置 effort，避免交互选择。 |
| 安全与管理 | 系统 override Settings 可覆盖下层配置。 |
| 条件与边界 | 最终效果由 Provider 协议和目标模型支持程度决定。 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code current commands](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/features/commands.md)、[Qwen Code current model providers](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/model-providers.md)、[Qwen Code current settings](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/settings.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `[thinking] effort`；无独立命令 |
| 入口与配置 | `config.toml` 的模型 `[thinking] effort`、`KIMI_MODEL_THINKING_EFFORT`。 |
| 支持范围 | 模型条目声明 `support_efforts`、`default_effort` 和当前 effort。 |
| 具体行为 | 在请求构造时把 thinking effort 交给相应 Provider。 |
| 会话与作用域 | 配置字段是模型级；`KIMI_MODEL_THINKING_EFFORT` 仅本次进程。 |
| 持久化位置 | 长期值在 `config.toml`；没有独立 Slash 命令修改它。 |
| 自动化用法 | 临时模型通道可一次性注入模型名、端点、Key 和 effort。 |
| 安全与管理 | 环境变量值仅进程可见，但仍会被子进程环境继承。 |
| 条件与边界 | 只有声明支持 thinking effort 的模型才会使用该字段。 |
| 证据状态 | 条件项 |
| 来源 | [Kimi Code current model providers](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/configuration/providers.md)、[Kimi Code current environment variables](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/configuration/env-vars.md)、[Kimi Code current configuration](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/configuration/config-files.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/effort` · `--reasoning-effort` |
| 入口与配置 | `/effort [level]`、`--reasoning-effort`、模型设置。 |
| 支持范围 | 为当前模型选择 reasoning effort；`/fast` 独立控制快速模式。 |
| 具体行为 | 设置后续请求的推理强度，模型不支持时可用选项会受限。 |
| 会话与作用域 | 当前会话、启动参数或模型默认设置。 |
| 持久化位置 | 模型选项写入 `~/.qoder/settings.json`；`--session-only` 不保存。 |
| 自动化用法 | Print Mode 使用 `--reasoning-effort` 固定档位。 |
| 安全与管理 | 不涉及额外凭据；仍受模型与计划权限约束。 |
| 条件与边界 | 可选档位依模型目录和账号权益。 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI model configuration](https://docs.qoder.com/en/cli/model)、[Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference) |

## 官方来源

- [Claude Code model configuration](https://code.claude.com/docs/en/model-config)
- [Claude Code Commands](https://code.claude.com/docs/en/commands)
- [Claude Code environment variables](https://code.claude.com/docs/en/env-vars)
- [Codex models](https://learn.chatgpt.com/docs/models)
- [Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)
- [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)
- [Qwen Code current commands](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/features/commands.md)
- [Qwen Code current model providers](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/model-providers.md)
- [Qwen Code current settings](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/settings.md)
- [Kimi Code current model providers](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/configuration/providers.md)
- [Kimi Code current environment variables](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/configuration/env-vars.md)
- [Kimi Code current configuration](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/configuration/config-files.md)
- [Qoder CLI model configuration](https://docs.qoder.com/en/cli/model)
- [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference)

## 关联能力

- [模型选择与切换](./model-switch.md)
- [推理强度](../commands/cmd-effort.md)
- [Provider 类型](./model-provider.md)

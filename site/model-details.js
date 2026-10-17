(() => {
  const rows = Object.fromEntries(
    window.matrixData.rows
      .filter((row) => row.category === 'models')
      .map((row) => [row.id, row]),
  );

  const profiles = {
    claude: { status: '官方确认' },
    codex: { status: '官方确认' },
    qwen: { status: '源码确认' },
    kimi: { status: '源码确认' },
    qoder: { status: '官方确认' },
  };

  function evidenceStatus(value, productId, status) {
    if (status) return status;
    if (
      value.includes('无') ||
      value.includes('未公开') ||
      value.includes('仅') ||
      value.includes('不读') ||
      value.includes('指定厂商')
    ) {
      return '条件项';
    }
    return profiles[productId].status;
  }

  function record(productId, value, fields) {
    return {
      value,
      entry: fields.entry,
      mechanism: fields.mechanism,
      behavior: fields.behavior,
      scope: fields.scope,
      persistence: fields.persistence,
      automation: fields.automation,
      security: fields.security,
      conditions: fields.conditions,
      status: evidenceStatus(value, productId, fields.status),
      sources: fields.sources,
    };
  }

  function createDetail({
    id,
    definition,
    includes,
    excludes,
    facts,
    products,
    related,
  }) {
    const row = rows[id];
    if (!row) throw new Error(`Unknown model capability: ${id}`);

    return {
      definition,
      includes,
      excludes,
      facts,
      products: Object.fromEntries(
        window.matrixData.products.map((product) => {
          const fields = products[product.id];
          if (!fields) throw new Error(`Missing ${product.id} record for ${id}`);
          return [
            product.id,
            record(product.id, row.values[product.id], fields),
          ];
        }),
      ),
      related,
    };
  }

  const modelDetails = {
    'model-switch': createDetail({
      id: 'model-switch',
      definition:
        '选择主模型，并区分当前会话临时选择、项目默认值、用户默认值和启动参数覆盖。',
      includes: [
        '交互式模型选择器',
        '启动参数与配置字段',
        '选择结果的生效范围与持久化',
        '选择器模型列表定制（`modelPicker`）',
      ],
      excludes: [
        '模型质量、速度和价格评价',
        'Provider 凭据配置',
        'Subagent 独立模型继承规则',
      ],
      facts: [
        '五家都提供 `/model`，但是否把选择保存为新会话默认值并不一致。',
        'Qwen Code 的模型入口还管理 fast、voice、vision、image 等专用模型，并可显式写入项目或用户设置。',
        'Claude Code 自 v2.1.153 起 `/model` 选择默认写入用户设置作为新会话默认值；v2.1.236 新增的 `ANTHROPIC_DEFAULT_MODEL` 只在没有更高优先级选择时决定新会话启动模型。',
        'Claude Code v2.1.243 起 `modelPicker` 可定制 `/model` 选择器的行、顺序与标签，并可整体替换内置列表；其余四家的选择器列表来自各自内置目录、Provider 配置或账号模型目录，未确认同类定制设置。',
      ],
      products: {
        claude: {
          entry: '`/model [alias|name]`、`claude --model`、`ANTHROPIC_MODEL`、`ANTHROPIC_DEFAULT_MODEL`、Settings `model`、Settings `modelPicker`。',
          mechanism: '支持模型别名、完整模型名和模型选择器；模型可同时暴露 effort 选项。`ANTHROPIC_DEFAULT_MODEL` 指定新会话的默认启动模型；当选择器 Default 行解析到该模型时显示标签 `Set by ANTHROPIC_DEFAULT_MODEL`。`modelPicker` 是带 `options` 行数组和可选 `replaceBuiltInOptions` 布尔值的对象：每行 `model` 必填且按原样取值，接受 `--model` 接受的全部写法（`opus` 等别名、Anthropic 模型 ID、Amazon Bedrock、Google Cloud Vertex/Agent Platform、Microsoft Foundry 或 LLM 网关的 Provider 格式 ID），`label` 与 `description` 可选；未写 `label` 时用内置名称或模型 ID 作标题，未写 `description` 时显示通用第二行。',
          behavior: '立即切换当前会话后续请求使用的模型；切换已有对话时可能提示重新读取历史。新会话只在 `--model`、`ANTHROPIC_MODEL`、任何设置文件的 `model`（含 `/model` 保存的选择）和组织默认模型都未指定时，才采用 `ANTHROPIC_DEFAULT_MODEL` 的模型；此时经 `--resume`、`--continue` 或 `/resume` 恢复的会话也改用该模型，不恢复记录中保存的模型。`modelPicker` 默认（`replaceBuiltInOptions` 未设或为 `false`）把自定义行追加在内置列表之后，并跳过内置列表已覆盖的模型；`replaceBuiltInOptions` 为 `true` 时选择器只显示这些行、**Default** 行和当前会话正在使用的模型行，隐藏内置列表、`availableModels` 追加行、网关发现模型与 `ANTHROPIC_CUSTOM_MODEL_OPTION` 行。灰显行移到列表底部；标签只改变选择器显示，不改变实际运行的模型。',
          scope: '`/model` 选择作用于当前会话；`--model` 与 `ANTHROPIC_MODEL` 作用于本次进程；`ANTHROPIC_DEFAULT_MODEL` 作用于新会话的启动模型。`modelPicker` 只从 Managed settings、`--settings` 与用户设置读取，项目和 local 设置中的该键被忽略，克隆的仓库无法改标选择器。',
          persistence: '自 v2.1.153 起 `/model` 选择器按 `Enter` 或直接输入 `/model <name>` 会把选择写入用户 Settings 的 `model` 字段作为新会话默认值，按 `s` 只切换当前会话；`-p` 非交互模式下 `/model` 不保存默认值。`ANTHROPIC_DEFAULT_MODEL` 不落盘，优先级低于 `/model` 保存的选择；设置 `ANTHROPIC_MODEL` 时每次启动都回到该变量的模型。`modelPicker` 写在哪个设置文件就随该文件持久化；Managed settings、`--settings` 与用户设置三者中优先级最高且设置了该键的来源提供整套列表，Claude Code 不合并两个来源的列表。',
          automation: 'Headless/CI 使用 `--model` 或 `ANTHROPIC_MODEL` 固定模型；`ANTHROPIC_DEFAULT_MODEL` 用于在没有更高优先级选择时统一新会话启动模型；组织可经 Managed settings 的 `modelPicker` 统一下发选择器列表（例如 Bedrock 部署及团队名称）。',
          security: '组织可通过 `availableModels` 和 Managed settings 限制可选模型；`enforceAvailableModels` 开启、`availableModels` 或组织模型限制排除该模型、或账号不可用时，`ANTHROPIC_DEFAULT_MODEL` 被忽略。`availableModels` 允许清单同样作用于 `modelPicker` 行：无法提供的行（退役模型、组织无权限的模型）被丢弃，暂不可选的行灰显并附原因，全部行都不成立时回退为按允许清单过滤的内置列表；无法解析的行被丢弃、其余行保留。',
          conditions: '`ANTHROPIC_DEFAULT_MODEL` 需 v2.1.236 及以上；取值为 `default`、`inherit`、`opusplan` 或 `haiku` 时被忽略。`modelPicker` 的文档页标注需 v2.1.242 及以上，官方 Release 中不存在 v2.1.242，更新日志在 v2.1.243 宣布该设置。模型可见性取决于账号计划、Provider 和组织策略。',
          sources: [
            'claude-model-config',
            'claude-env-vars',
            'claude-commands',
            'claude-settings',
            'claude-settings-reference',
            'claude-default-model-v236',
            'claude-model-picker-v243',
          ],
        },
        codex: {
          entry: '`/model`、`codex -m <model>`、`config.toml` 的 `model`。',
          mechanism: '模型选择器把模型与支持的 reasoning effort 放在同一流程。',
          behavior: '更改当前线程后续 turn 的模型；启动参数在创建会话时覆盖配置默认值。',
          scope: '`/model` 是当前线程；`-m` 是当前进程；配置文件提供长期默认值。',
          persistence: '交互选择不等同于改写配置；长期默认模型写入 `config.toml`。',
          automation: '脚本使用 `codex exec -m`，也可通过命名 profile 固定模型与 Provider。',
          security: 'Managed config 和模型 Provider 配置可以限制组织环境中的默认行为。',
          conditions: '可选模型依认证方式、账号权限、Provider 与本地运行时而变。',
          sources: ['codex-models', 'codex-config-reference', 'codex-commands'],
        },
        qwen: {
          entry: '`/model`、`qwen --model`、`model.name` 与 `modelProviders` 设置。',
          mechanism: '主模型外还可选择 fast、voice、vision、image 模型；支持一次性用另一模型执行提示。',
          behavior: '切换当前模型，或通过参数配置专用模型；一次性提示不会展开 `@file`。',
          scope: '默认当前会话；`/model --project` 写项目设置，`--global` 写用户设置。',
          persistence: '项目设置保存在 `.qwen/settings.json`，用户设置保存在用户 Qwen 目录。',
          automation: 'Headless 使用 `--model`；Provider 与模型可以在 settings 或环境配置中固定。',
          security: '系统 override Settings 可覆盖用户与项目模型配置。',
          conditions: '模型 ID、专用模型与能力取决于所选 Provider。',
          sources: [
            'qwen-model-commands-current',
            'qwen-model-settings-current',
            'qwen-model-providers-current',
          ],
        },
        kimi: {
          entry: '`/model`、`kimi -m <model>`、`config.toml` 的 `default_model`。',
          mechanism: '模型来自当前 Provider 配置中的模型列表；`/provider` 可先切换 Provider。',
          behavior: '改变当前会话后续请求使用的模型；启动参数覆盖配置默认值。',
          scope: '`/model` 是当前会话，`-m` 是当前进程，`default_model` 是长期默认值。',
          persistence: '默认模型写入 `~/.kimi-code/config.toml`；会话选择不自动改写配置。',
          automation: '使用 `-m` 或 `KIMI_MODEL_NAME` 临时覆盖；后者属于完整的临时模型通道。',
          security: '模型配置和 Provider 凭据分离；切换模型不会自动改变认证方式。',
          conditions: '模型必须存在于配置的 Provider 与 Model 条目中。',
          sources: [
            'kimi-model-commands-current',
            'kimi-model-cli-current',
            'kimi-model-config-current',
          ],
        },
        qoder: {
          entry: '`/model`、`qodercli --model`、模型选择界面。',
          mechanism: '选择 Default 档位、New Models 或已配置的 Custom Model。',
          behavior: '切换当前会话模型并可管理模型选项；命令行参数固定本次运行模型。',
          scope: '默认设置、当前会话选择和 `--session-only` 临时选择分开处理。',
          persistence: '模型选项保存在 `~/.qoder/settings.json`；`--session-only` 不落盘。',
          automation: '非交互任务可用 `--model` 和 `--reasoning-effort`。',
          security: 'Custom Model API Key 由模型配置流程接收；组织计划可限制模型来源。',
          conditions: '模型目录随账号计划与服务发布变化；Custom Model 只适用于 Individual 计划。',
          sources: ['qoder-model', 'qoder-commands'],
        },
      },
      related: ['model-effort', 'model-provider', 'cmd-model'],
    }),

    'model-effort': createDetail({
      id: 'model-effort',
      definition:
        '控制推理模型的思考强度、token 预算档位或快速服务模式，并记录其入口和保存范围。',
      includes: [
        'reasoning/thinking effort',
        '独立命令、模型选择器和配置字段',
        '会话级与持久化行为',
      ],
      excludes: [
        '模型质量评价',
        '上下文窗口大小',
        '单纯的响应长度设置',
      ],
      facts: [
        'Claude Code、Qwen Code 和 Qoder CLI 有独立 `/effort`；Codex 把 effort 放入 `/model`。',
        'Kimi Code 没有独立 effort Slash 命令，但可在模型 `[thinking]` 配置与临时模型环境变量中设置。',
        '相同档位名称不能视为相同推理预算；每个 Provider 会自行映射、截断或忽略。',
        'Codex main 分支（尚未发布）新增 `persistent` 推理档位：选择器显示 `Persistent`，本地配置保留 `persistent`，发送请求时换算为 Responses API 线值 `disabled`。',
      ],
      products: {
        claude: {
          entry: '`/effort`、`--effort`、`CLAUDE_CODE_EFFORT_LEVEL`、Settings `effortLevel`。',
          mechanism: '支持 `low|medium|high|xhigh|max`；`/fast` 是独立的快速服务模式。',
          behavior: '改变后续模型请求的 effort；不改变模型身份和用户提示。',
          scope: '命令作用于当前会话；参数和环境变量作用于当前进程。',
          persistence: '常规档位可通过 Settings 保存；`max` 除环境变量外为会话级。',
          automation: 'Headless 用 `--effort` 或环境变量显式固定档位。',
          security: 'Managed settings 可限制模型集合，间接限制可用 effort。',
          conditions: '档位可用性依模型和账号计划；`max` 不是所有模型都支持。',
          sources: ['claude-model-config', 'claude-commands', 'claude-env-vars'],
        },
        codex: {
          entry: '`/model` 中选择；`model_reasoning_effort` 配置字段；TypeScript SDK `modelReasoningEffort` 选项。',
          mechanism: 'reasoning effort 与模型目录绑定；`/fast` 控制可用的快速档位。TUI 推理强度选择器按模型预设的 `supported_reasoning_efforts` 列出选项，每条可带说明文字。',
          behavior: '对支持 reasoning 的模型设置推理强度，后续 turn 采用该档位。main 分支新增 `persistent` 档位：本地配置与选择结果保留 `persistent`，客户端发送请求时把它换算为 Responses API 线值 `disabled`；TUI 把该档位显示为 `Persistent`，测试夹具中的说明文字为 `Continue working until put to sleep`。TypeScript SDK `ModelReasoningEffort` 类型同步加入 `persistent`，`modelReasoningEffort: "persistent"` 以 `--config model_reasoning_effort="persistent"` 传给 CLI。',
          scope: '交互选择影响当前线程；配置或 profile 提供长期默认值。',
          persistence: '`config.toml` 中的字段跨会话；会话选择不必改写配置。`persistent` 在本地配置中原样保存，不被改写为 `disabled`。',
          automation: 'CI 和 SDK 使用配置 profile 或显式模型选项固定 effort。',
          security: '组织 Managed config 可统一模型与运行配置。',
          conditions: '不同模型暴露不同档位；无对应档位时不能假设静默等价。`persistent` 于 2026-08-26 合入 main（提交 `3e4707b34b16`，PR #40799），尚未进入 Release；官方 models 文档与配置参考未列 `persistent`（配置参考当前只列 `minimal | low | medium | high | xhigh`）。',
          status: '源码确认',
          sources: [
            'codex-models',
            'codex-config-reference',
            'codex-commands',
            'codex-persistent-effort-commit',
            'codex-persistent-effort-protocol',
            'codex-persistent-effort-client',
          ],
        },
        qwen: {
          entry: '`/effort` 与模型 Provider 配置。',
          mechanism: '统一接收 effort tier，再按 Provider 的支持范围映射或截断。',
          behavior: '改变当前模型后续请求的推理强度，不切换 Provider。',
          scope: '当前会话或当前模型配置。',
          persistence: '随模型设置保存时跨会话；纯命令选择为当前会话。',
          automation: 'Headless 可通过配置预置 effort，避免交互选择。',
          security: '系统 override Settings 可覆盖下层配置。',
          conditions: '最终效果由 Provider 协议和目标模型支持程度决定。',
          sources: [
            'qwen-model-commands-current',
            'qwen-model-providers-current',
            'qwen-model-settings-current',
          ],
        },
        kimi: {
          entry: '`config.toml` 的模型 `[thinking] effort`、`KIMI_MODEL_THINKING_EFFORT`。',
          mechanism: '模型条目声明 `support_efforts`、`default_effort` 和当前 effort。',
          behavior: '在请求构造时把 thinking effort 交给相应 Provider。',
          scope: '配置字段是模型级；`KIMI_MODEL_THINKING_EFFORT` 仅本次进程。',
          persistence: '长期值在 `config.toml`；没有独立 Slash 命令修改它。',
          automation: '临时模型通道可一次性注入模型名、端点、Key 和 effort。',
          security: '环境变量值仅进程可见，但仍会被子进程环境继承。',
          conditions: '只有声明支持 thinking effort 的模型才会使用该字段。',
          sources: [
            'kimi-model-providers-current',
            'kimi-model-env-current',
            'kimi-model-config-current',
          ],
          status: '条件项',
        },
        qoder: {
          entry: '`/effort [level]`、`--reasoning-effort`、模型设置。',
          mechanism: '为当前模型选择 reasoning effort；`/fast` 独立控制快速模式。',
          behavior: '设置后续请求的推理强度，模型不支持时可用选项会受限。',
          scope: '当前会话、启动参数或模型默认设置。',
          persistence: '模型选项写入 `~/.qoder/settings.json`；`--session-only` 不保存。',
          automation: 'Print Mode 使用 `--reasoning-effort` 固定档位。',
          security: '不涉及额外凭据；仍受模型与计划权限约束。',
          conditions: '可选档位依模型目录和账号权益。',
          sources: ['qoder-model', 'qoder-commands'],
        },
      },
      related: ['model-switch', 'cmd-effort', 'model-provider'],
    }),

    'model-provider': createDetail({
      id: 'model-provider',
      definition:
        '定义 CLI 能直接连接的模型服务类型，包括厂商托管服务、云平台、本地运行时和自定义 Provider。',
      includes: [
        '公开支持的 Provider 类型',
        '协议适配器与本地运行时',
        'Provider 选择和配置入口',
      ],
      excludes: [
        '模型质量与价格',
        '未在公开资料列出的私有适配',
        '仅靠外部网关完成的透明转发',
      ],
      facts: [
        '五家都区分「厂商托管目录」与「自带 Key」两条路，但入口形状不同：Claude Code 与 Codex 用配置键和环境变量声明 Provider，Qwen Code 与 Kimi Code 用 `/auth`、`/provider` 向导加配置文件，Qoder CLI 只允许从 `/model` 的 Custom 向导添加。',
        '只有 Qwen Code 与 Kimi Code 把「导入第三方 Provider」做成产品能力：Qwen 在源码里内置 15 个预设（`ALL_PROVIDERS` 的显示顺序，按 `uiGroup` 分 qwencloud、alibaba、third-party 三组），Kimi 从公开 models.dev 目录或自定义 registry `api.json` 导入、目录不可达时回退内置快照。',
        '协议边界不同：Codex 的自定义 Provider 只接受 `wire_api = "responses"`，官方 Models 页写明当前版本不支持 `wire_api = "chat"` 或仅 Chat Completions 的端点；Qwen 的 `openai` 协议按每条模型的 `wireApi` 在 `chat-completions` 与 `responses` 之间选；Kimi 把两种 OpenAI 协议拆成 `openai` 与 `openai_responses` 两个 `type`；Claude Code 只在 Messages 协议内换部署位置，不做任意协议适配。',
        '云平台 Provider 的覆盖不同：Claude Code 有 Amazon Bedrock（Invoke API 或 Mantle 端点）、Claude Platform on AWS、Google Cloud\'s Agent Platform（原 Vertex AI）与 Microsoft Foundry 四个云部署；Codex 内置 `amazon-bedrock` 一个云 Provider；Qwen 的 `vertex-ai` 与 Kimi 的 `vertexai` 都走 Google ADC；Qoder 公开文档没有任何云厂商 Provider 入口。',
        '凭据落盘口径不同：Qwen 的 Model Providers 文档写 “Credentials are never persisted in settings; the runtime reads them from `process.env[envKey]`.”，而认证文档同时把 Key 写进 `settings.json` 的 `env` 字段作为最低优先级兜底并提示明文风险；Kimi 的 `api_key` 与 `api_key_env` 互斥，二者都不存在时才读 `[providers.<name>.env]` 子表；Codex 用 `env_key` 或 `[model_providers.<id>.auth]` 的命令式 token，`experimental_bearer_token` 被官方标注为 discouraged；Qoder 由 BYOK 向导保存并明确要求不要手工编辑 `settings.json`。',
        '「Provider 目录的事实来源」定义不同：Qwen 的预设、端点与 Key 前缀校验固定写在源码里并随版本发布，QwenCloud 两个预设自 v0.25.3-preview.0 起才存在、stable v0.25.2 没有；Kimi 的第三方目录来自远端 models.dev 或私有 registry，同一 registry 地址下的供应商在后续启动时一起刷新；Qoder 的 Custom 向导以「当前账号可见的实时 BYOK 目录」为准，文档点名的六家厂商只是示例。',
      ],
      products: {
        claude: {
          entry:
            '环境变量 `CLAUDE_CODE_USE_BEDROCK`、`CLAUDE_CODE_USE_VERTEX`、`CLAUDE_CODE_USE_FOUNDRY`、`CLAUDE_CODE_USE_ANTHROPIC_AWS`、`CLAUDE_CODE_USE_MANTLE`；Amazon Bedrock 与 Google Vertex AI 还可运行 `claude` 后在登录提示选 **3rd-party platform** 走交互向导；LLM 网关用 `ANTHROPIC_BASE_URL`。',
          mechanism:
            '官方部署选项对比表列出六个推理位置：Claude for Teams/Enterprise（claude.ai SSO 或邮箱登录）、Anthropic Console（API Key 或不带 Key 的 Console 登录）、Amazon Bedrock（Invoke API 或 Mantle 端点）、Claude Platform on AWS、Google Cloud\'s Agent Platform（原 Vertex AI，文档路径仍是 `/docs/en/google-vertex-ai`）与 Microsoft Foundry；Claude apps gateway 是自托管网关，在这些 Provider 或 Anthropic API 前加 IdP 登录。同一客户端按部署位置切换认证与端点，不是任意协议插件系统。',
          behavior:
            'Provider 决定模型 ID 形状（Bedrock 用 inference profile ARN、Microsoft Foundry 用 deployment name、Google Cloud\'s Agent Platform 用 version name、Mantle 用 `anthropic.` 前缀且不带版本后缀）、凭据链、区域、`default` 的解析结果（Claude Platform on AWS、Bedrock 与 Agent Platform 解析为 Opus 5.5，Foundry 解析为 Sonnet 4.5）、`/model` 里是否显示价格，以及部分功能可用性；`availableModels` 允许清单在 Provider 上的匹配规则也分档不同。',
          scope:
            '进程环境、用户或项目 Settings 的 `env` 块、组织 Managed settings；宿主平台设置 `CLAUDE_CODE_PROVIDER_MANAGED_BY_HOST` 时，Claude Code 忽略 `CLAUDE_CODE_USE_BEDROCK`、`ANTHROPIC_BASE_URL`、`ANTHROPIC_API_KEY` 等 Provider 选择、端点与认证变量。',
          persistence:
            '部署选择通常固定在环境管理或 Settings 里；Settings 的 `env` 块只能新增变量不能删除，要覆盖 shell profile 里导出的旧值（如失效的 `CLAUDE_CODE_USE_VERTEX`）得把它设为空字符串，Claude Code 按未设置处理。',
          automation:
            'CI 按 Provider 注入云凭据与模型环境变量；Mantle 用 `ANTHROPIC_BEDROCK_MANTLE_BASE_URL`、Claude Platform on AWS 用 `ANTHROPIC_AWS_BASE_URL`（默认 `https://aws-external-anthropic.{region}.api.aws`）走自定义端点或网关。',
          security:
            '可复用云平台 IAM、短期凭据、组织网络网关与 `awsAuthRefresh`；Mantle 的 IAM 动作在 `bedrock-mantle:` 前缀下（`bedrock-mantle:CreateInference`、`bedrock-mantle:CountTokens`），官方明写 `bedrock:` 动作不覆盖它；Claude Platform on AWS 的 `ANTHROPIC_AWS_API_KEY` 作为 `x-api-key` 发送且优先于 AWS SigV4，`ANTHROPIC_AWS_WORKSPACE_ID` 必填并作为 `anthropic-workspace-id` 头随每次请求发送，`CLAUDE_CODE_SKIP_ANTHROPIC_AWS_AUTH` 供自行签名请求的网关跳过客户端认证。',
          conditions:
            '只覆盖 Claude 模型的官方部署与兼容 Messages 网关；第三方 Provider（Bedrock、Agent Platform、Foundry、Claude Platform on AWS）上的会话不接收 server-managed settings，允许清单要靠 MDM 或托管设置文件下发；`/status` 的 provider 行在 Mantle 生效时显示 `Amazon Bedrock (Mantle)`。',
          sources: [
            'claude-deployment-options',
            'claude-bedrock-mantle',
            'claude-provider-env-vars',
            'claude-model-config',
            'claude-gateway',
          ],
        },
        codex: {
          entry:
            '`model_provider`（默认 `openai`）与 `[model_providers.<id>]`；本地开源 Provider 用 `--oss` 加 `--local-provider` 或配置 `oss_provider`；只想改内置 OpenAI Provider 的地址用 `openai_base_url`。',
          mechanism:
            '内置保留 ID 为 `openai`、`ollama`、`lmstudio`，自定义 Provider 不能复用；另有内置 `amazon-bedrock` Provider，与自定义 Provider 不同，它只接受嵌套的 `[model_providers.amazon-bedrock.aws]` 里的 `profile` 与 `region`；Azure、Mistral、企业代理与数据驻留端点都按自定义 Provider 写。',
          behavior:
            '一个 Provider 定义 base URL、wire API、认证与可选 HTTP 头；`wire_api` 只接受 `responses`，官方 Models 页写 “Current Codex releases don’t support `wire_api = "chat"` or a Chat Completions-only endpoint.”；每个 Provider 还能带 `query_params`、`http_headers`、`env_http_headers`、`request_max_retries`、`stream_max_retries`、`stream_idle_timeout_ms`、`model_catalog_url`、`supports_websockets`、`supports_standalone_web_search` 与 `capabilities.external_web_access`/`capabilities.remote_compaction`。',
          scope:
            '用户配置 `~/.codex/config.toml`、`--profile <name>` 对应的 `~/.codex/<name>.config.toml` 层，或 `-c key=value` 的单次覆盖；项目级 `.codex/config.toml` 会忽略 `model_provider`、`model_providers`、`openai_base_url` 等键并在启动时告警，未受信任的项目连整个 `.codex/` 层都不加载。',
          persistence:
            '自定义 Provider 写进 `config.toml`；profile 文件是 base 之上、项目与 CLI 配置之下的一层，只需写与 base 不同的键，也能覆盖 `model_catalog_json`。',
          automation:
            '用 profile 为不同环境绑定 Provider、模型与认证变量；`--oss` 既没给 `--local-provider` 也没设 `oss_provider` 时，交互式 CLI 提示选择而 `codex exec` 直接报错退出，因此脚本必须显式指定其一。',
          security:
            'Key 从 `env_key` 指定的环境变量读取，`experimental_bearer_token` 被官方标注为 discouraged；命令式认证写 `[model_providers.<id>.auth]`（`command`、`args`、`cwd`、`timeout_ms`、`refresh_interval_ms`），命令不接收 stdin、必须把 token 打到 stdout，空 token 视为错误，`refresh_interval_ms = 0` 表示只在认证重试后刷新，且不能与 `env_key`、`experimental_bearer_token` 或 `requires_openai_auth` 同用。',
          conditions:
            'Bedrock 省略 `profile` 时走标准 AWS 凭据链，`region` 要填实际处理请求的 Bedrock 区域；`supports_standalone_web_search` 对自定义 Provider 默认 `false`，设为 `true` 也不等于启用（仍需 Provider、模型与运行时都支持，`web_search` 模式与托管搜索限制继续生效）；托管的 Local computer access with Work Cloud 不支持 `model_provider` 与 `model_providers`，自定义推理网关不经这两个键带入云侧。',
          sources: [
            'codex-provider-definitions',
            'codex-provider-keys',
            'codex-config-reference',
            'codex-models',
          ],
          status: '官方确认',
        },
        qwen: {
          entry:
            '`/auth` 的四个顶层入口（QwenCloud、Alibaba ModelStudio、Third-party Providers、Custom Provider）；配置文件侧是 `~/.qwen/settings.json` 的 `modelProviders`、`providerProtocol`、`security.auth.selectedType` 与 `model.name`；运行时用 `/model` 切换。',
          mechanism:
            '协议层为 `openai`（按每条模型的 `wireApi` 走 Chat Completions 或 Responses）、`anthropic`、`gemini`、`vertex-ai`（用 gemini 协议与 `@google/genai` SDK 的 Vertex 模式，选中即设 `GOOGLE_GENAI_USE_VERTEXAI=true`）与硬编码、不可在 `modelProviders` 覆盖的 `qwen-oauth`；自定义 provider id 必须用顶层 `providerProtocol` 映射到内置协议，未映射的整条被跳过并告警、模型不会出现在 `/model` 里。',
          behavior:
            'QwenCloud 入口下有 `qwencloud-token-plan` 与 `qwencloud-standard` 两个预设，各自再显式选平台（China — 千问AI平台 / International — QwenCloud）决定四个端点之一，逐字写 “so the UI language never decides your endpoint”；Alibaba ModelStudio 下有 Coding Plan、Token Plan、Standard API Key；Third-party Providers 是 DeepSeek、Grok、MiniMax、Z.AI、Kimi（moonshot）、Idealab、ModelScope、OpenRouter、Requesty 九家；Custom Provider 手填本地服务、代理或不受支持的厂商。每个预设决定 `envKey`、种子模型目录、`modelNamePrefix`、Key 前缀校验与 `webSearch` 后端，`modelsEditable` 与 `supportsModelDiscovery` 都为真。',
          scope:
            '用户、项目与系统 Settings 加进程环境；官方建议把 `modelProviders` 定义在用户级 `~/.qwen/settings.json`，以避免项目与用户设置的合并冲突。',
          persistence:
            'Provider 与模型条目写进 Settings；Key 的读取优先级为 CLI 旗标 > shell 环境 > `.env`（`.qwen/.env` → `.env` → `~/.qwen/.env` → `~/.env`，只加载找到的第一个且不跨文件合并）> `settings.json` 的 `env` 字段。Model Providers 文档写凭据不落盘、运行时只读 `process.env[envKey]`，认证文档则把 `env` 字段作为最低优先级兜底并提示明文风险，两处口径不同。',
          automation:
            'Headless 用 `QWENCLOUD_API_KEY`、`QWENCLOUD_TOKEN_PLAN_API_KEY`、`BAILIAN_CODING_PLAN_API_KEY`、`BAILIAN_TOKEN_PLAN_API_KEY`、`DASHSCOPE_API_KEY` 等 provider 专属变量加 `OPENAI_BASE_URL` 与 `OPENAI_MODEL`，或在 Settings 里写 `security.auth.selectedType` 免交互启动；provider 专属 Key 只有在存在声明它为 `envKey` 的 Settings 条目时才生效，只靠环境变量选 OpenAI 兼容认证要导出 `OPENAI_API_KEY`。',
          security:
            'QwenCloud 与 Alibaba ModelStudio 是两组独立入口、独立 Key 变量与独立端点，选 QwenCloud 不会改写或删除已保存的 ModelStudio 凭据、端点与模型选择；Key 前缀在向导内即校验（按量付费要求以 `sk-` 开头且不是 `sk-sp-`，Token Plan 要求 `sk-sp-`），错误提示会指向另一个入口；官方建议敏感 Key 放 `.env` 或 shell，而不是可能被共享或同步的 `settings.json`；新增读取新环境变量的预设要同步 no-AK CI 门禁的清空列表，否则门禁会泄漏 runner 凭据。',
          conditions:
            'QwenCloud 入口自 v0.25.3-preview.0（2026-10-16 发布，GitHub 标记 `prerelease: true`，标签指向提交 `d407c0bb3823118281fbfc178494f4525a2241b8`）起存在，stable v0.25.2 的预设目录里没有 `qwencloud-*`；Qwen OAuth 免费层 2026-04-15 停止且不再是可选对话框入口；`modelProviders` 编辑在运行中的交互会话里热加载（文件监听约 300ms 去抖，重开 `/model` 可见、当前选择保留），而 `providerProtocol` 只在启动读取、改动需重启；QwenCloud 的两种访问方式都自动启用内置 `web_search`，Coding Plan 主机被排除在自动激活之外；手写条目不带 `capabilities` 时 `/effort` 只给通用档位，拿不到 QwenCloud 策划的 `low`/`medium`/`xhigh`；Vertex 条目可用 ADC，任何 API Key 到达该条目会切到忽略 project、location 与 ADC 的 Vertex Express 模式。',
          status: '条件项',
          sources: [
            'qwen-auth-qwencloud',
            'qwen-model-providers-head',
            'qwen-provider-registry',
            'qwen-qwencloud-standard-preset',
            'qwen-qwencloud-token-plan-preset',
            'qwen-qwencloud-pr',
            'qwen-v0253-preview0-release',
            'qwen-websearch-provider-table',
          ],
        },
        kimi: {
          entry:
            '`config.toml` 的 `[providers.<name>]`（`type` 决定协议）与 `[models.<alias>]`；TUI 里 `/provider` 打开供应商管理器；shell 里 `kimi provider add|remove|list|catalog list|catalog add`；OAuth 托管账号用 `/login` 与 `/logout`。',
          mechanism:
            '六类 `type`：`kimi`（OpenAI 兼容，Kimi Code 托管服务与 Kimi Platform API 密钥，默认 `base_url` `https://api.moonshot.ai/v1`）、`anthropic`（Anthropic Messages）、`openai`（Chat Completions）、`openai_responses`（Responses API，始终流式）、`google-genai`、`vertexai`；第三方厂商不是内置预设，而是从公开 models.dev 目录或自定义 registry `api.json` 导入，目录未声明协议的厂商按 OpenAI 兼容导入并标 “guessed”，Amazon Bedrock、Cohere 等专有协议与无法识别的显式协议被拒绝导入。',
          behavior:
            '所有供应商默认以流式方式交互，thinking、视觉、工具调用能力按模型名前缀自动匹配；`openai` 协议自动处理 `reasoning_content` 与 `reasoning_effort` 注入，网关用非标准字段名时在模型别名上设 `reasoning_key` 覆盖；`vertexai` 与 `google-genai` 共用实现，`base_url` 只能填主机根地址，否则 SDK 会把路径拼成 `/v1beta/v1beta/…`；registry 模型可声明 `upgrade`、`migration_markdown` 与可选 `retirement_at`，启动时对当前模型显示 Markdown 迁移提示（`Enter` 确认、空格不接受），registry 删除默认模型时若 `upgrade` 目标仍在则自动切换并保留 Thinking 设置、否则连同该设置一起清空。',
          scope:
            '用户配置 `~/.kimi-code/config.toml`（`KIMI_CODE_HOME` 可搬移数据目录）；`KIMI_MODEL_*` 临时模型通道可完全覆盖单次运行。',
          persistence:
            '长期 Provider 与模型别名写进 `config.toml`；从 registry 导入的条目另存 `source` 元数据（私有 registry 的 Bearer token 存为 `source.apiKey` 供刷新使用），后续启动时同一 registry 地址下的供应商一起刷新；`kimi provider add` 遇到同 id 先删再写且不自动设默认模型，`remove` 连带删除该供应商的全部模型 alias、命中 `default_model` 时同时清空它。',
          automation:
            '`kimi provider` 的五个动作面向脚本化部署、CI 初始化与新机器一行配置：`--api-key` 未传时回退环境变量 `KIMI_REGISTRY_API_KEY`，`list --json` 输出原始 `providers` 与 `models` 表，`catalog list` 的 `--url` 可换目录地址、`--filter` 按 id 或 name 子串过滤，`catalog add` 的 `--default-model <modelId>` 把默认模型设为 `<providerId>/<modelId>`；`kimi doctor` 校验配置文件。',
          security:
            '凭证优先级为 `api_key` 或 `api_key_env`（互斥替代项，只能设其一）> `[providers.<name>.env]` 子表键（前两者都不存在时才读）> 全部缺失即启动报错；除显式声明的 `api_key_env` 外，CLI 不从 shell 环境变量自动取凭证；registry 条目声明的 `env` 变量名只作提示打印，绑定永不自动发生，因为 registry 同时决定变量名与凭证发往的端点；`vertexai` 的项目 ID 与区域必须写在 `[providers.vertexai.env]` 子表，直接 `export GOOGLE_CLOUD_PROJECT` 不被读取。',
          conditions:
            'models.dev 不可达时回退内置目录快照，离线或网络受限环境也能导入；deprecated 与 alpha 状态的模型不出现在导入列表；通过 `/login` 登录的 OAuth 托管账号不在 `/provider` 显示；`api_key_env` 自 2.0.1（2026-09-18）起可用、目录快照回退自 0.32.0（2026-08-04）起、`kimi provider` 子命令自 0.8.0（2026-06-02）起、`/provider` 自 0.7.0 起取代已废弃的 `/connect`；registry 的 `upgrade` 迁移字段是 Kimi 扩展、不属于 models.dev schema，官方变更记录里没有对应版本条目；核对日期最新 Release 2.2.0（2026-10-14）没有 Provider 类型或导入路径变化。',
          status: '官方确认',
          sources: [
            'kimi-providers-head',
            'kimi-provider-cli-head',
            'kimi-changelog-providers',
          ],
        },
        qoder: {
          entry:
            '`/model` 选择器的三个页签：Default（分档模型池）、New Models（当前可直选的具体模型）、Custom（BYOK）；添加走 Custom 页签的 `Add custom model...` 向导；`qoder --list-models` 不开 TUI 打印当前账号可用模型。',
          mechanism:
            '默认服务是 Qoder 托管目录：Default 页签给 Smart Routing (Auto)、Ultimate、Performance、Efficient 四个分档池，New Models 页签给具体模型；托管目录之外只有指定厂商 BYOK，Models 页点名 Alibaba Cloud Model Studio、DeepSeek、Z.ai、Kimi、MiniMax、Xiaomi MIMO，而 Custom Models 页把可用厂商写成 “Refer to the live catalog displayed by the Custom wizard.”。公开文档没有任意 Provider 定义文件或协议插件入口。',
          behavior:
            'BYOK 向导按 Provider → Model Type → Model 三步走，输入 API Key 与其余必填项，校验通过后自动保存并立即可选；Custom 页签选中模型按 `d` 删除；BYOK 调用的是用户自己订阅计划内的模型，1.1.63（2026-09-24）起 Auto 权限模式的审批请求也跟随 BYOK 模型。',
          scope: 'Individual（Personal）计划下的模型设置；Custom Models 页写明 Available edition 为 Individual plan。',
          persistence:
            'TUI 里按 `Enter` 选中的模型自动写进 `~/.qoder/settings.json` 并跨会话保留，按 `s` 只对当前会话生效，`--model`、`--reasoning-effort`、`--context-window` 只作用于本次启动；BYOK 条目由向导保存，官方明确要求不要手工在 `settings.json` 里配置 BYOK，可用厂商、模型与凭据字段都由当前账号可见的 BYOK 目录决定。',
          automation:
            '`qoder --list-models` 供脚本枚举当前账号可用模型；启动旗标可固定本次运行的模型、推理强度与上下文窗口；公开文档没有给出用环境变量或配置文件预置 BYOK Provider 的方式。',
          security:
            'Custom Model 使用用户自己的厂商 Key，Key 在向导里校验通过后才保存；官方把可用厂商范围交给服务端目录而不是本地配置，因此本地设置文件不是 BYOK 的可信入口。',
          conditions:
            'BYOK 时间线为 0.1.31（2026-03-13）首次支持自定义模型、0.2.0（2026-04-27）随多模型支持转正、0.2.5（2026-04-29）加入自定义端点、1.1.50（2026-09-11）改为在 `/model` 的 Custom 页集中管理带自定义 URL 端点的 BYOK 模型；1.1.64 至 1.1.72（2026-10-15）没有任何 Provider 或 BYOK 条目；New Models 的可用模型、能力与 `price_factor` 随服务端列表变化，文档只给示例表并要求以 `/model` 与 `--list-models` 为准。',
          sources: [
            'qoder-model-tiers',
            'qoder-custom-models',
            'qoder-release-notes-byok',
          ],
          status: '条件项',
        },
      },
      related: ['model-compatible-endpoint', 'auth-api-key', 'model-switch'],
    }),

    'model-compatible-endpoint': createDetail({
      id: 'model-compatible-endpoint',
      definition:
        '把模型请求发往自定义基础地址、企业网关或自托管兼容服务，并明确兼容协议边界。',
      includes: [
        'base URL 配置',
        '网关协议与自定义请求头',
        '本地 OpenAI/Anthropic/Gemini 兼容服务',
      ],
      excludes: [
        '透明网络代理',
        '未公开的私有端点',
        '仅改变模型名称而不改变地址',
      ],
      facts: [
        '“可配 base URL”不等于兼容所有 OpenAI API：Codex 自定义 Provider 当前只支持 Responses。',
        'Qwen Code 和 Kimi Code 按 Provider 协议选择适配器，因此可覆盖多种兼容接口。',
        'Qoder CLI 公共文档只公开指定厂商 Custom Model，没有公开任意 base URL 字段。',
      ],
      products: {
        claude: {
          entry: '`ANTHROPIC_BASE_URL`，可配 `ANTHROPIC_CUSTOM_HEADERS`。',
          mechanism: '把 Anthropic Messages 请求路由到企业 LLM gateway；可选 `/v1/models` 发现模型。',
          behavior: '保留 Claude Code 的 Anthropic 请求语义，由网关转发、认证和审计。',
          scope: '进程环境或组织统一环境配置。',
          persistence: '通常由 Shell、容器、设备管理或 Settings env 提供。',
          automation: 'CI 注入网关地址、令牌和自定义头。',
          security: '网关可集中认证、速率限制、日志和合规控制。',
          conditions: '网关必须实现 Claude Code 所需的 Anthropic Messages 兼容行为。',
          sources: ['claude-gateway', 'claude-env-vars'],
        },
        codex: {
          entry: '`model_providers.<id>.base_url` 与 `wire_api = "responses"`。',
          mechanism: '自定义 Provider 可附加 `http_headers`、`env_http_headers` 和 `query_params`。',
          behavior: 'Codex 通过 Responses wire API 发出请求。',
          scope: '配置文件或 profile。',
          persistence: '写入 `config.toml`。',
          automation: '为本地/企业端点创建 profile，并用 `env_key` 注入凭据。',
          security: '敏感头应从环境变量读取，不直接写入配置。',
          conditions: '当前唯一支持的自定义 `wire_api` 值是 `responses`；Chat Completions 兼容不足以接入。',
          sources: ['codex-config-reference', 'codex-config'],
          status: '条件项',
        },
        qwen: {
          entry: '`modelProviders[].baseUrl`、`providerProtocol`。',
          mechanism: '按 OpenAI、Anthropic、Gemini 或 Vertex 协议选择请求适配器。',
          behavior: '可连接 Azure/OpenRouter/Requesty、本地 vLLM/Ollama/LM Studio 和其他兼容端点。',
          scope: '用户、项目或系统 Settings。',
          persistence: '端点配置写入 Settings；Key 可留在 `.env`。',
          automation: '通过 Provider ID 和环境变量在不同部署间切换。',
          security: '不要把带 Key 的 URL 或 Key 值提交到仓库。',
          conditions: '端点必须满足所选 `providerProtocol` 的必需接口和流式行为。',
          sources: ['qwen-model-providers-current', 'qwen-model-settings-current'],
        },
        kimi: {
          entry: '`[providers.<name>] base_url`。',
          mechanism: '分别支持 Anthropic、OpenAI Chat Completions、OpenAI Responses、Google GenAI 和 VertexAI Provider 类型。',
          behavior: '根据 Provider 类型构造请求，可指向兼容或自托管实现。',
          scope: '用户配置或临时 `KIMI_MODEL_BASE_URL`。',
          persistence: '长期端点在 `config.toml`；临时通道只影响当前进程。',
          automation: '临时模型通道同时设置 Provider 类型、URL、模型与 Key。',
          security: 'base URL 与 Key 分开配置；静态 Key 仍可能落在配置文件。',
          conditions: '兼容服务必须实现所选 Provider 类型对应的协议。',
          sources: ['kimi-model-providers-current', 'kimi-model-env-current'],
        },
        qoder: {
          entry: '`/model` → Custom Model → 指定厂商。',
          mechanism: '公共文档提供受支持厂商清单和相应模型配置界面。',
          behavior: '按目录接入厂商 API，而不是声明任意协议与 base URL。',
          scope: 'Individual 账号模型设置。',
          persistence: '设置由 Qoder 模型配置保存。',
          automation: '公共 CLI 文档未给出任意 URL 的无交互配置方式。',
          security: '用户输入对应厂商 API Key。',
          conditions: '不能把“指定厂商 BYOK”推断成“任意 OpenAI-compatible endpoint”。',
          sources: ['qoder-model'],
          status: '条件项',
        },
      },
      related: ['model-provider', 'auth-environment', 'auth-api-key'],
    }),

    'auth-browser': createDetail({
      id: 'auth-browser',
      definition:
        '通过浏览器或设备码完成产品账号授权，并区分账号登录与仅配置模型 Provider。',
      includes: [
        '浏览器 OAuth、设备码与账号登录命令',
        '登录结果的 CLI 使用范围',
        '无浏览器登录时的明确替代入口',
      ],
      excludes: [
        '静态 API Key 的全部注入方式',
        '企业 SSO 管理细节',
        'IDE 自身的独立登录 UI',
      ],
      facts: [
        'Claude Code、Codex、Kimi Code 和 Qoder CLI 都有产品账号登录流程。',
        'Qwen Code 当前 `/auth` 是 Provider/Key 配置入口；旧 Qwen OAuth 免费层已于 2026-04-15 停止，不应再标成可用浏览器账号登录。',
        'Kimi Code 的 `kimi login` 可用设备码完成 Headless 登录。',
      ],
      products: {
        claude: {
          entry: '`/login` 或启动时登录流程。',
          mechanism: '浏览器授权 Claude.ai、Team 或 Enterprise 账号。',
          behavior: '获得可供 Claude Code 使用的账号 OAuth 凭据。',
          scope: '本机用户，后续 Claude Code 会话复用。',
          persistence: 'macOS 存 Keychain；其他平台按凭据文件与权限保存。',
          automation: '无人值守场景更适合 API Key、云 Provider 或 `apiKeyHelper`。',
          security: '企业可限制登录方法和组织 UUID。',
          conditions: '可用模型和额度由账号计划与组织策略决定。',
          sources: ['claude-auth', 'claude-commands', 'claude-managed-settings'],
        },
        codex: {
          entry: '`codex login`；可选设备码登录。',
          mechanism: '浏览器 ChatGPT 登录或 device-code 流程。',
          behavior: '本地 Codex 获得 ChatGPT 身份；Codex Cloud 要求 ChatGPT 登录。',
          scope: '本机 Codex home，后续会话复用。',
          persistence: '按 `cli_auth_credentials_store` 保存到文件或系统 Keyring。',
          automation: '无浏览器环境可用 device auth；API 自动化可改用 Key 或 access token。',
          security: '组织可强制 ChatGPT 登录方式与 Workspace ID。',
          conditions: 'API Key 登录可运行本地 Codex，但不能替代 Codex Cloud 的 ChatGPT 身份。',
          sources: ['codex-auth', 'codex-config-reference'],
        },
        qwen: {
          entry: '`/auth`。',
          mechanism: '当前入口选择 ModelStudio 计划/API Key、第三方 Provider 或 Custom Provider。',
          behavior: '配置模型服务认证；不是当前可用的产品账号浏览器 OAuth 登录。',
          scope: 'Provider 配置和本机 Key 来源。',
          persistence: '可写入 Settings 或由环境与 `.env` 提供。',
          automation: 'Headless 使用 Provider 环境变量或 Settings。',
          security: '旧 OAuth 凭据不应被当作当前免费登录路径。',
          conditions: 'Qwen OAuth 免费层已于 2026-04-15 停止并不再可选。',
          sources: ['qwen-model-auth-current', 'qwen-model-commands-current'],
          status: '条件项',
        },
        kimi: {
          entry: '`/login` 或 `kimi login`。',
          mechanism: 'Kimi Code 账号走 OAuth；Headless 可显示设备码；Kimi Platform 可选 API Key。',
          behavior: 'OAuth 登录后选择账号并为 CLI 保存凭据。',
          scope: '本机用户，当前选择账号供后续会话复用。',
          persistence: 'OAuth 凭据保存在 `~/.kimi-code/credentials/`。',
          automation: '无浏览器机器使用 `kimi login` 设备码或 Provider API Key。',
          security: '凭据目录 0700、文件 0600。',
          conditions: 'Kimi Code OAuth 与 Kimi Platform API Key 是两种不同登录路径。',
          sources: [
            'kimi-model-commands-current',
            'kimi-model-cli-current',
            'kimi-model-data-current',
          ],
        },
        qoder: {
          entry: '`/login` 或 `qodercli login`。',
          mechanism: '浏览器登录 Qoder 账号，也可输入 Personal Access Token。',
          behavior: 'CLI 保存登录态，SDK 可复用 qodercli 的身份。',
          scope: '本机用户和账号。',
          persistence: '本地登录缓存跨会话复用；公共文档未公开精确后端。',
          automation: 'CI 推荐 `QODER_PERSONAL_ACCESS_TOKEN`。',
          security: 'PAT 适合撤销和最小化自动化凭据暴露。',
          conditions: '本地交互登录优先于环境变量 PAT。',
          sources: ['qoder-quick-start', 'qoder-sdk-auth', 'qoder-commands'],
        },
      },
      related: ['auth-api-key', 'auth-storage', 'auth-logout'],
    }),

    'auth-api-key': createDetail({
      id: 'auth-api-key',
      definition:
        '以静态 API Key、Personal Access Token 或命令生成令牌访问模型与产品服务。',
      includes: [
        '官方 Key/PAT 入口',
        'Key 的引用方式',
        '交互与自动化用法',
      ],
      excludes: [
        '浏览器 OAuth 的完整流程',
        '云厂商 IAM 凭据链',
        '第三方 Secret Manager 产品比较',
      ],
      facts: [
        '五家都能在至少一种路径使用静态凭据，但凭据代表的服务不同。',
        'Kimi Code 的常规 Provider API Key 默认来自 `config.toml` 的 `api_key` 或 Provider env 表，不会自动读取同名 Shell 变量。',
        'Codex 自定义 Provider 推荐用 `env_key` 或命令认证引用 Key，而不是把值写进配置。',
      ],
      products: {
        claude: {
          entry: '`ANTHROPIC_API_KEY`、`ANTHROPIC_AUTH_TOKEN`、`apiKeyHelper`。',
          mechanism: '直接使用 Anthropic API Key、Bearer token 或执行命令动态取得凭据。',
          behavior: '为 Anthropic API 或兼容网关请求附加认证。',
          scope: '进程环境、Settings env 或凭据辅助命令。',
          persistence: '环境变量不由 Claude Code 保存；helper 可从外部 Secret Store 动态读取。',
          automation: 'CI/容器通常注入环境变量或调用 `apiKeyHelper`。',
          security: '动态 helper 可避免长期明文 Key；不要把 Key 写进仓库。',
          conditions: '账号 OAuth 与 API Key 的计费、配额和组织控制不同。',
          sources: ['claude-auth', 'claude-env-vars', 'claude-settings'],
        },
        codex: {
          entry: '管道输入 `codex login --with-api-key`；Provider `env_key` 或 command-backed auth。',
          mechanism: 'OpenAI API Key 或自定义 Provider 的 Key/短期令牌。',
          behavior: '本地 Codex 使用 Key 发出模型请求；Provider 可从指定环境变量读取。',
          scope: 'Codex 登录存储或具体 Provider 配置。',
          persistence: '登录 Key 按 credentials store 保存；`env_key` 本身只保存变量名。',
          automation: 'CI 从 Secret 注入 `OPENAI_API_KEY`，再管道给 login 或让 Provider 读取。',
          security: '避免把 Key 作为命令行参数出现在进程列表和 Shell 历史。',
          conditions: 'API Key 登录不提供 Codex Cloud 的 ChatGPT 账号能力。',
          sources: ['codex-auth', 'codex-config-reference', 'codex-config'],
        },
        qwen: {
          entry: '`/auth`、Provider `envKey`、系统环境、`.qwen/.env`、`settings.json.env`。',
          mechanism: '每个 Provider 指定自己的 Key 变量；交互向导也可接收 Key。',
          behavior: '按 Provider 配置将 Key 附加到请求。',
          scope: '进程、项目 `.env`、用户/项目 Settings 或系统 Settings。',
          persistence: '向导可回退到 `settings.json.env` 明文保存；文档推荐迁移到 `.env`。',
          automation: 'CI 直接注入 Provider 对应环境变量。',
          security: '项目 `.env` 应加入忽略；不要提交含 Key 的 Settings。',
          conditions: 'Key 名和请求格式由所选 Provider 决定。',
          sources: [
            'qwen-model-auth-current',
            'qwen-model-providers-current',
            'qwen-model-settings-current',
          ],
        },
        kimi: {
          entry: '`config.toml` Provider 的 `api_key`、`/login` 的 Kimi Platform 选项。',
          mechanism: '静态 Provider Key 写在配置；临时模型通道可用 `KIMI_MODEL_API_KEY`。',
          behavior: 'Provider 读取明确配置的 Key；不会自动读取普通 `OPENAI_API_KEY` 等 Shell 变量。',
          scope: '用户配置或当前进程临时模型。',
          persistence: '`config.toml` 中静态 Key 为明文；临时环境变量不落盘。',
          automation: '生成临时 Provider 配置，或使用完整的 `KIMI_MODEL_*` 通道。',
          security: '保护 `config.toml` 文件权限；避免将其复制到仓库。',
          conditions: 'Provider `[env]` 表可显式把值传给实现，但不是通用 Shell 自动发现。',
          sources: [
            'kimi-model-providers-current',
            'kimi-model-env-current',
            'kimi-model-config-current',
          ],
          status: '条件项',
        },
        qoder: {
          entry: '`qodercli login` 的 PAT、`QODER_PERSONAL_ACCESS_TOKEN`、Custom Model Key 输入。',
          mechanism: 'PAT 认证 Qoder 服务；BYOK Key 认证指定模型厂商。',
          behavior: 'PAT 支持 CLI/SDK 自动化；Custom Model Key 只用于相应 Provider。',
          scope: '本地账号登录、进程环境或 Individual 模型设置。',
          persistence: 'PAT 环境变量不落盘；交互登录与 Custom Model 设置由客户端保存。',
          automation: 'SDK 与 CI 使用 `QODER_PERSONAL_ACCESS_TOKEN`。',
          security: '本地登录优先于环境 PAT，排障时要确认实际使用的凭据来源。',
          conditions: 'Custom Model 只适用于 Individual 计划。',
          sources: ['qoder-quick-start', 'qoder-sdk-auth', 'qoder-model'],
        },
      },
      related: ['auth-environment', 'auth-storage', 'model-provider'],
    }),

    'auth-cloud-provider': createDetail({
      id: 'auth-cloud-provider',
      definition:
        '使用云平台原生身份、Profile、ADC、工作负载身份或签名协议访问托管模型。',
      includes: [
        'AWS、Google Cloud 与官方云 Provider 凭据链',
        'Profile、区域与 ADC',
        '短期令牌和命令生成认证',
      ],
      excludes: [
        '普通 API Key',
        '仅设置自定义 base URL',
        '外部云平台本身的 IAM 产品功能',
      ],
      facts: [
        'Claude Code 对 Bedrock、Vertex 和 Foundry 有明确云部署认证路径。',
        'Codex 的 Bedrock Provider 使用 AWS SigV4；Kimi Code 的 VertexAI Provider 使用 Google ADC。',
        'Qoder CLI 公共模型文档未公开通用云厂商凭据链，不能从其 BYOK 厂商目录外推。',
      ],
      products: {
        claude: {
          entry: 'Bedrock、Vertex AI、Foundry 对应的 Provider 环境变量与云 CLI/SDK 登录。',
          mechanism: '复用 AWS credential chain、Google Application Default Credentials 或 Azure/Foundry 身份。',
          behavior: '按云平台端点、区域和签名协议调用 Claude 部署。',
          scope: '本机 Profile、工作负载身份、容器/CI 角色或组织设备配置。',
          persistence: '由云平台 SDK、CLI 和 Secret/Identity 系统管理，不统一写入 Claude 凭据库。',
          automation: 'CI 使用 OIDC、实例角色、工作负载身份或短期凭据。',
          security: '可用 IAM 最小权限和短期令牌，避免长期 API Key。',
          conditions: '各平台模型 ID、区域和功能可用性不同。',
          sources: ['claude-auth', 'claude-model-config'],
        },
        codex: {
          entry: 'Amazon Bedrock 内置 Provider 的 `profile`、`region`；自定义 Provider 的 command-backed auth。',
          mechanism: 'Bedrock 请求使用 AWS SigV4；认证命令可返回短期 bearer token。',
          behavior: '按 Provider 配置获取并刷新云凭据。',
          scope: 'AWS Profile/环境、当前进程或配置的认证命令。',
          persistence: 'Codex 保存 Provider 配置，不必保存云 Secret 本身。',
          automation: 'CI 使用 AWS 角色/Profile，或由命令从外部凭据代理取令牌。',
          security: '短期签名和命令认证可避免静态 Key 写入配置。',
          conditions: '云 Provider 的具体模型与区域必须由目标服务支持。',
          sources: ['codex-config-reference', 'codex-config'],
        },
        qwen: {
          entry: '`vertex-ai` Provider 和 Provider 自定义认证字段。',
          mechanism: '当前公开配置以 Provider Key、项目/端点字段为主。',
          behavior: '通过 Vertex 或兼容 Provider 配置调用云端模型。',
          scope: 'Settings、环境变量和项目 `.env`。',
          persistence: '配置可写入用户、项目或系统 Settings。',
          automation: 'CI 注入对应 Provider 的环境字段。',
          security: 'Key 应保存在 Secret/环境，而不是提交 Settings。',
          conditions: '公开文档未描述像 Claude/Codex 那样完整的通用 AWS credential chain。',
          sources: ['qwen-model-providers-current', 'qwen-model-auth-current'],
          status: '条件项',
        },
        kimi: {
          entry: '`vertexai` Provider，`GOOGLE_APPLICATION_CREDENTIALS` 与项目/位置字段。',
          mechanism: '使用 Google Application Default Credentials。',
          behavior: '按配置的 project、location 和 ADC 身份请求 Vertex AI。',
          scope: '本机 gcloud ADC、服务账号文件或工作负载环境。',
          persistence: '身份由 Google ADC 管理；Kimi 配置保存 Provider 元数据。',
          automation: 'CI 设置工作负载身份或 `GOOGLE_APPLICATION_CREDENTIALS`。',
          security: '优先使用工作负载身份；服务账号文件需要限制权限。',
          conditions: '仅 VertexAI Provider 使用该凭据链。',
          sources: ['kimi-model-providers-current', 'kimi-model-env-current'],
        },
        qoder: {
          entry: '公共 CLI 文档未列通用 AWS/GCP/Azure 凭据入口。',
          mechanism: 'Custom Model 采用指定厂商 Key 配置。',
          behavior: '当前可确认的是目录内 BYOK，不是通用云 IAM 适配。',
          scope: 'Individual 模型设置。',
          persistence: '由 Qoder 模型配置保存。',
          automation: '公共文档未给出云 Profile/ADC 自动化契约。',
          security: '不要把未公开能力标成已支持的云凭据链。',
          conditions: '后续若文档增加云 Provider，应按具体协议重新核对。',
          sources: ['qoder-model'],
          status: '未确认',
        },
      },
      related: ['model-provider', 'auth-api-key', 'auth-environment'],
    }),

    'auth-environment': createDetail({
      id: 'auth-environment',
      definition:
        '通过进程环境、项目环境文件或配置引用向模型 Provider 注入凭据与端点。',
      includes: [
        '公开环境变量名',
        '加载优先级与项目 `.env`',
        '自动化场景中的非交互注入',
      ],
      excludes: [
        '凭据文件加密实现',
        'Shell 自身的 Secret 管理',
        '所有非认证环境变量',
      ],
      facts: [
        'Qwen Code 明确给出系统环境、`.env`、`settings.json.env` 的优先级。',
        'Kimi Code 不自动读取普通 Provider Key Shell 变量；只有完整的 `KIMI_MODEL_*` 临时模型通道会直接读取进程环境。',
        'Codex 自定义 Provider 通过 `env_key` 保存变量名，而不是在配置里保存 Key 值。',
      ],
      products: {
        claude: {
          entry: '`ANTHROPIC_API_KEY`、`ANTHROPIC_AUTH_TOKEN`、`ANTHROPIC_BASE_URL` 及云 Provider 环境变量。',
          mechanism: '启动时读取进程环境；Settings 也可声明 env 值。',
          behavior: '为模型端点、认证、模型名和云部署提供运行参数。',
          scope: '当前进程、Shell、容器、CI 或 Settings 作用域。',
          persistence: 'Claude Code 不替用户保存 Shell 环境；Settings 中值会持久化。',
          automation: 'CI 从 Secret Store 注入环境。',
          security: '敏感值不要提交到项目 Settings；可用 `apiKeyHelper` 动态取值。',
          conditions: 'Managed settings 可以覆盖或限制下层配置。',
          sources: ['claude-env-vars', 'claude-settings', 'claude-auth'],
        },
        codex: {
          entry: '`OPENAI_API_KEY`、`CODEX_ACCESS_TOKEN`、Provider `env_key`/`env_http_headers`。',
          mechanism: '登录和 Provider 在运行时读取指定环境变量。',
          behavior: '把 Key、access token 或自定义请求头注入模型请求。',
          scope: '当前进程与 profile 选择的 Provider。',
          persistence: '环境值不由配置文件保存；配置仅保存变量名。',
          automation: 'CI 注入 Secret 后运行 `codex exec`。',
          security: '优于在 `config.toml` 写入明文 Key。',
          conditions: '实际变量名由 Provider 配置决定。',
          sources: ['codex-auth', 'codex-config-reference'],
        },
        qwen: {
          entry: '系统环境、项目 `.qwen/.env` 或查找到的 `.env`、`settings.json.env`。',
          mechanism: '凭据优先级为 CLI flags > 系统环境 > `.env` > `settings.json.env`。',
          behavior: '按 Provider `envKey` 读取 Key，并可从 env 设置 base URL 等字段。',
          scope: '进程、项目、用户或系统 Settings。',
          persistence: '`.env` 与 Settings 均为磁盘文件；系统环境由启动环境管理。',
          automation: 'CI 直接注入对应 Provider 变量。',
          security: '推荐 `.env` 并确保忽略；Settings 明文 env 是兼容回退。',
          conditions: '同名变量由高优先级来源覆盖。',
          sources: [
            'qwen-model-auth-current',
            'qwen-model-settings-current',
            'qwen-model-providers-current',
          ],
        },
        kimi: {
          entry: '`KIMI_MODEL_NAME`、`KIMI_MODEL_API_KEY`、`KIMI_MODEL_BASE_URL`、`KIMI_MODEL_PROVIDER_TYPE` 等。',
          mechanism: '只有 `KIMI_MODEL_*` 构成一次性临时模型；普通 `OPENAI_API_KEY`、`ANTHROPIC_API_KEY` 不会自动读取。',
          behavior: '临时通道覆盖一次进程的 Provider、模型、端点、Key 和 effort。',
          scope: '当前进程。',
          persistence: '不落盘；长期 Provider Key 仍需 `config.toml`。',
          automation: 'CI 可完整注入一组 `KIMI_MODEL_*`。',
          security: '环境 Secret 可能被子进程继承；控制执行环境与日志。',
          conditions: '不能只设置普通 Provider 同名 Key 并期待 Kimi 自动发现。',
          sources: ['kimi-model-env-current', 'kimi-model-providers-current'],
          status: '条件项',
        },
        qoder: {
          entry: '`QODER_PERSONAL_ACCESS_TOKEN`。',
          mechanism: 'SDK/CLI 从环境读取 Qoder PAT。',
          behavior: '在无交互环境认证 Qoder 服务。',
          scope: '当前进程及其子进程。',
          persistence: '不由 Qoder 写入磁盘。',
          automation: 'CI 和 Agent SDK 推荐使用。',
          security: '通过 CI Secret 注入并限制日志；本地登录会覆盖该变量。',
          conditions: '这是 Qoder 服务 PAT，不是任意 Custom Model Provider Key 的通用变量。',
          sources: ['qoder-sdk-auth', 'qoder-quick-start'],
        },
      },
      related: ['auth-api-key', 'auth-storage', 'model-compatible-endpoint'],
    }),

    'auth-storage': createDetail({
      id: 'auth-storage',
      definition:
        '记录 OAuth 登录令牌和静态 Provider Key 在本机的存储后端、路径、文件权限和公开程度。',
      includes: [
        '系统 Keyring/Keychain',
        '认证文件与静态配置文件',
        '可配置的凭据存储后端',
      ],
      excludes: [
        '云端服务保存的账号数据',
        '第三方 Secret Manager 的内部实现',
        '没有公开证据的路径猜测',
      ],
      facts: [
        'Claude Code 在 macOS 使用 Keychain；Codex 可显式选择 file、keyring 或 auto。',
        'Kimi Code 的 OAuth 凭据文件使用 0600，但静态 Provider Key 可明文写在 `config.toml`。',
        'Qoder CLI 公共文档说明登录可复用，但未公开准确存储后端和路径，因此保留边界而不猜测。',
      ],
      products: {
        claude: {
          entry: '账号登录流程与平台凭据存储。',
          mechanism: 'macOS 使用加密 Keychain；Linux 使用 `~/.claude/.credentials.json` 0600；Windows 使用同类文件并依 OS ACL。',
          behavior: '保存 OAuth 登录状态供后续会话复用。',
          scope: '本机操作系统用户。',
          persistence: '跨会话，直到 `/logout` 或凭据失效。',
          automation: '自动化通常绕过账号凭据库，改用环境 Key 或云身份。',
          security: 'macOS 借助 Keychain；文件平台依靠 0600/ACL。',
          conditions: 'API Key 环境变量不等同于账号登录凭据存储。',
          sources: ['claude-auth'],
        },
        codex: {
          entry: '`cli_auth_credentials_store = "file"|"keyring"|"auto"`。',
          mechanism: '`file` 写 `~/.codex/auth.json`；`keyring` 使用系统凭据库；`auto` 优先 Keyring、失败回退文件。',
          behavior: '保存 ChatGPT OAuth、API Key 或 access token 登录状态。',
          scope: 'Codex home 与当前 OS 用户。',
          persistence: '跨会话，直到 `codex logout` 或令牌失效。',
          automation: 'CI 可使用隔离的 Codex home 或只注入短期环境凭据。',
          security: '高安全环境应显式使用 Keyring，并保护 file fallback。',
          conditions: '默认/可用后端依操作系统和 Keyring 可访问性。',
          sources: ['codex-auth', 'codex-config-reference'],
        },
        qwen: {
          entry: 'Provider Settings、项目 `.env`、系统环境。',
          mechanism: 'Key 可在 `settings.json.env`、`.env` 或进程环境；当前认证流程不依赖可用的 Qwen OAuth 浏览器缓存。',
          behavior: '按优先级读取 Provider Key。',
          scope: '项目、用户、系统设置或当前进程。',
          persistence: 'Settings 与 `.env` 为明文文件；进程环境不由 Qwen 持久化。',
          automation: 'CI 用环境变量，不需要写本地认证文件。',
          security: '文档推荐把向导保存的 Key 从 Settings 移到 `.env`，并避免提交。',
          conditions: '系统 override Settings 可覆盖项目/用户值；旧 OAuth 数据不代表当前登录可用。',
          sources: ['qwen-model-auth-current', 'qwen-model-settings-current'],
          status: '条件项',
        },
        kimi: {
          entry: '`~/.kimi-code/credentials/` 与 `~/.kimi-code/config.toml`。',
          mechanism: 'OAuth 凭据目录 0700、文件 0600；静态 Provider `api_key` 明文位于 config。',
          behavior: 'OAuth 账号可切换和退出；静态 Key 随 Provider 配置读取。',
          scope: '本机用户的 Kimi Code home。',
          persistence: '跨会话，直到退出账号或编辑配置。',
          automation: 'CI 可用临时 home 或 `KIMI_MODEL_*`，避免长期配置落盘。',
          security: '保护 config 文件和备份；0600 只覆盖 credentials，不会自动加密 config 中的 Key。',
          conditions: 'OAuth 与静态 Key 的安全属性不同，不能合并描述。',
          sources: ['kimi-model-data-current', 'kimi-model-config-current'],
          status: '条件项',
        },
        qoder: {
          entry: '`qodercli login`、`/login` 与模型设置。',
          mechanism: '登录状态可被后续 CLI 和 SDK 复用；公开文档未说明精确 Keychain/文件后端或路径。',
          behavior: '本地登录优先于 `QODER_PERSONAL_ACCESS_TOKEN`。',
          scope: '本机用户。',
          persistence: '跨会话，直到 `/logout`；Custom Model Key 由模型设置保存。',
          automation: 'CI 用 PAT 环境变量，避免依赖交互登录缓存。',
          security: '因后端未公开，不对加密方式作推断。',
          conditions: '“可复用登录”不等于已确认具体磁盘路径。',
          sources: ['qoder-quick-start', 'qoder-sdk-auth', 'qoder-model'],
          status: '未确认',
        },
      },
      related: ['auth-environment', 'auth-logout', 'auth-browser'],
    }),

    'auth-logout': createDetail({
      id: 'auth-logout',
      definition:
        '退出当前产品账号或撤销 CLI 对本地凭据的使用，并区分账号令牌与手工配置的 Provider Key。',
      includes: [
        '退出命令',
        '被清理的凭据范围',
        '没有独立退出命令时的明确操作',
      ],
      excludes: [
        '服务端永久删除账号',
        '云厂商 IAM 撤销',
        '轮换第三方 API Key 的完整流程',
      ],
      facts: [
        'Claude Code、Codex、Kimi Code 和 Qoder CLI 都有明确退出入口。',
        'Qwen Code 当前基于 Provider Key 配置，没有独立 logout；撤销本地使用需要重配 Provider 或删除对应 Key。',
        '退出账号通常不会自动删除手工写入配置或环境中的第三方 Provider Key。',
      ],
      products: {
        claude: {
          entry: '`/logout`。',
          mechanism: '清除当前 Claude 账号的本地登录状态。',
          behavior: '后续会话需要重新登录或改用 API/云 Provider 凭据。',
          scope: '本机 Claude Code 账号凭据。',
          persistence: '立即影响后续会话。',
          automation: '临时环境 Key 的撤销由外部环境/Secret Store 处理。',
          security: '退出不替代服务端撤销泄露的 API Key。',
          conditions: 'Managed 登录策略仍可能在下次启动要求指定账号。',
          sources: ['claude-commands', 'claude-auth'],
        },
        codex: {
          entry: '`codex logout`。',
          mechanism: '移除本地保存的 Codex 登录凭据。',
          behavior: '`codex login status` 随后应显示未登录。',
          scope: '当前 Codex home。',
          persistence: '跨会话生效。',
          automation: '隔离环境可直接丢弃临时 Codex home。',
          security: '环境中的 Provider Key 仍需从环境或 Secret Store 移除。',
          conditions: '不同 `CODEX_HOME` 各自有独立登录状态。',
          sources: ['codex-auth'],
        },
        qwen: {
          entry: '无独立 logout；使用 `/auth` 重选 Provider，并从 Settings、`.env` 或系统环境删除 Key。',
          mechanism: '当前认证是 Provider 配置，不是可统一注销的 Qwen 账号 OAuth。',
          behavior: '删除实际生效的最高优先级 Key 后，Provider 请求不再获得该凭据。',
          scope: '进程、项目、用户和系统各层。',
          persistence: '必须修改保存该 Key 的具体来源。',
          automation: 'CI 在任务结束时销毁临时 Secret 环境。',
          security: '需要按优先级检查，避免低层已删但高层系统环境仍生效。',
          conditions: '旧 OAuth 免费层停止后，不能用历史 logout 语义描述当前流程。',
          sources: ['qwen-model-auth-current', 'qwen-model-settings-current'],
          status: '条件项',
        },
        kimi: {
          entry: '`/logout`。',
          mechanism: '清除当前所选账号的 OAuth 凭据。',
          behavior: '退出 Kimi Code 账号；静态 Provider Key 仍保留在配置中。',
          scope: '当前账号记录。',
          persistence: '跨会话生效。',
          automation: '临时环境模型凭据随进程结束消失。',
          security: '需要单独移除 `config.toml` 中的静态 Key。',
          conditions: '只在 CLI 空闲时执行登录/退出。',
          sources: ['kimi-model-commands-current', 'kimi-model-data-current'],
        },
        qoder: {
          entry: '`/logout`。',
          mechanism: '退出当前 Qoder 账号并移除本地登录状态。',
          behavior: '后续访问需要重新登录或使用 PAT。',
          scope: '本机 Qoder CLI 登录。',
          persistence: '跨会话生效。',
          automation: '环境 PAT 仍由调用环境控制。',
          security: '退出本地账号不会撤销仍有效的 PAT；需要在账号侧撤销。',
          conditions: 'Custom Model Key 的删除由模型设置处理。',
          sources: ['qoder-commands', 'qoder-quick-start'],
        },
      },
      related: ['auth-storage', 'auth-browser', 'auth-status'],
    }),

    'auth-status': createDetail({
      id: 'auth-status',
      definition:
        '显示当前账号、认证方式、Provider 配置或运行诊断状态，并区分专用认证状态与通用运行状态。',
      includes: [
        '登录状态命令',
        '运行状态页中的认证信息',
        '认证与 Provider 诊断入口',
      ],
      excludes: [
        '服务端账号管理后台',
        '模型调用的完整网络抓包',
        '只显示版本号而不检查认证的命令',
      ],
      facts: [
        'Codex 提供专用 `codex login status`；其他产品多在 `/status` 或 `/doctor` 中展示。',
        'Qwen Code 应使用 `/doctor` 诊断认证；它的 `/status` 主要是版本与路径状态。',
        'Kimi Code `/status` 是运行状态入口，公共命令目录没有独立 auth status 命令。',
      ],
      products: {
        claude: {
          entry: '`/status`、`/doctor`。',
          mechanism: '`/status` 显示版本、模型、账号和连接；`/doctor` 检查安装与配置健康度。',
          behavior: '帮助识别当前账号、Provider 与配置问题。',
          scope: '当前进程和本机配置。',
          persistence: '只读，不修改凭据。',
          automation: '脚本应优先验证实际模型请求或使用非交互诊断输出。',
          security: '分享诊断信息前移除账号、组织和路径等敏感字段。',
          conditions: '显示字段随 Provider 与客户端版本变化。',
          sources: ['claude-commands', 'claude-auth'],
        },
        codex: {
          entry: '`codex login status`、交互式 `/status`。',
          mechanism: '启动级命令专门报告登录；`/status` 显示当前线程配置与 token 使用。',
          behavior: '区分未登录、ChatGPT/API 凭据和当前运行配置。',
          scope: '当前 Codex home 与线程。',
          persistence: '只读。',
          automation: 'CI 可在任务前运行 `codex login status`。',
          security: '不要在公开日志输出令牌值。',
          conditions: 'Provider 环境变量是否有效仍需实际请求验证。',
          sources: ['codex-auth', 'codex-commands'],
        },
        qwen: {
          entry: '`/doctor`。',
          mechanism: '诊断认证、Provider 与运行环境；`/status` 主要显示版本和路径。',
          behavior: '检查当前认证配置并提示问题。',
          scope: '当前进程、项目与 Qwen 配置层。',
          persistence: '诊断本身只读。',
          automation: 'Headless 可通过启动验证和实际请求确认 Provider Key。',
          security: '报告诊断内容时避免暴露 Key 与环境值。',
          conditions: '不能把 `/status` 单独当作专用登录状态命令。',
          sources: ['qwen-model-commands-current', 'qwen-model-auth-current'],
          status: '条件项',
        },
        kimi: {
          entry: '`/status`。',
          mechanism: '显示当前运行、Provider、模型和会话相关状态。',
          behavior: '可辅助判断当前 Provider，但没有独立的 auth status 子命令。',
          scope: '当前会话。',
          persistence: '只读。',
          automation: '自动化应发起最小模型请求或验证配置文件，而非依赖交互页。',
          security: '分享状态输出前检查 Provider 名和路径。',
          conditions: '静态 Key 是否有效仍由真实请求结果确认。',
          sources: ['kimi-model-commands-current', 'kimi-model-cli-current'],
          status: '条件项',
        },
        qoder: {
          entry: '`/status`。',
          mechanism: '显示版本、模型、账号和运行状态。',
          behavior: '确认当前 Qoder 登录与会话配置。',
          scope: '当前 TUI 会话与本地账号。',
          persistence: '只读。',
          automation: 'SDK/CI 通过 PAT 和请求结果验证认证。',
          security: '公开日志中不要暴露 PAT 或账号细节。',
          conditions: '公共文档未列独立 `qodercli login status`。',
          sources: ['qoder-commands', 'qoder-quick-start'],
        },
      },
      related: ['auth-browser', 'auth-logout', 'cmd-status'],
    }),

    'auth-enterprise': createDetail({
      id: 'auth-enterprise',
      definition:
        '组织统一控制登录方式、成员权限、模型范围、配置优先级和本地客户端策略。',
      includes: [
        'SSO、Workspace 与组织账号',
        'Managed/System settings',
        '强制登录、模型和域名策略',
      ],
      excludes: [
        '产品价格与采购比较',
        '未公开的内部控制台功能',
        '一般个人配置',
      ],
      facts: [
        'Claude Code 和 Codex 都公开了可强制登录方式、组织/Workspace 与托管配置的企业控制。',
        'Qoder Teams 公开 SAML SSO、域名和管理台；其 Custom Model BYOK 不适用于 Teams。',
        'Qwen Code 有机器级系统 Settings，但当前没有与前三者等价的 CLI 自带统一 SSO 管理层；Kimi Code 公共 CLI 文档也未列 Managed/SSO 策略。',
      ],
      products: {
        claude: {
          entry: 'Claude Team/Enterprise、SSO、Managed settings、server-managed settings。',
          mechanism: '组织可强制登录方法、组织 UUID、模型集合、权限与配置。',
          behavior: 'Managed 层高于用户和项目 Settings，并可由服务端下发。',
          scope: '组织、设备、系统、用户和项目多层。',
          persistence: '本地 Managed 文件或服务端托管策略跨会话生效。',
          automation: '管理员通过设备管理、配置部署或服务端策略统一客户端。',
          security: '支持 SSO、最小模型集合、网关和凭据辅助程序。',
          conditions: '可用策略依 Team/Enterprise 计划与部署方式。',
          sources: ['claude-auth', 'claude-managed-settings', 'claude-settings'],
        },
        codex: {
          entry: 'ChatGPT Workspace、Managed config、requirements 与管理策略。',
          mechanism: 'Workspace RBAC/保留策略；`forced_login_method` 与 `forced_chatgpt_workspace_id` 约束本地登录。',
          behavior: '组织策略限制配置、审批、安全与可用身份。',
          scope: 'Workspace、系统 Managed config、用户和项目配置。',
          persistence: 'Managed 层跨会话并高于普通用户选择。',
          automation: '管理员部署托管配置和要求文件。',
          security: '强制 Workspace 防止误用个人账号；RBAC 和保留策略作用于云端。',
          conditions: '本地 API Key Provider 与 Codex Cloud Workspace 能力要分开判断。',
          sources: ['codex-auth', 'codex-config-reference', 'codex-config'],
        },
        qwen: {
          entry: '系统默认 Settings 与系统 override 文件；Provider 自身的组织身份。',
          mechanism: '系统 override 优先级高于用户和项目设置，可统一 Provider、模型和运行配置。',
          behavior: '机器管理员可部署固定配置，但账号 SSO 仍由所接 Provider 承担。',
          scope: '系统、用户、项目和进程。',
          persistence: '系统配置跨用户/会话生效，具体路径依操作系统。',
          automation: '镜像、设备管理或配置管理系统部署 Settings。',
          security: '可把 Provider 与模型限制在系统层，并从环境/Secret 管理凭据。',
          conditions: '当前公共文档没有 Qwen Code 自带的集中式 SSO/组织管理台契约。',
          sources: ['qwen-model-settings-current', 'qwen-model-auth-current'],
          status: '条件项',
        },
        kimi: {
          entry: '公共 CLI 文档仅列本地 `config.toml`、Provider 与凭据目录。',
          mechanism: '没有公开的 Managed settings、强制组织登录或 CLI SSO 策略层。',
          behavior: '组织可在外部通过镜像、文件权限和 Provider IAM 管理，但不是 Kimi Code 公共契约。',
          scope: '当前可确认到本机用户配置。',
          persistence: '本地配置跨会话。',
          automation: '可由外部配置管理部署文件，但无公开专用管理 API。',
          security: 'Provider IAM 可独立实施组织控制。',
          conditions: '不把外部运维能力标成 Kimi Code 内置企业策略。',
          sources: ['kimi-model-config-current', 'kimi-model-data-current'],
          status: '未确认',
        },
        qoder: {
          entry: 'Qoder Teams 管理台、团队域名限制、SAML SSO。',
          mechanism: '管理员创建 Team、管理成员、访问和隐私设置，并配置 SSO。',
          behavior: '成员通过组织身份访问 Qoder 服务与受管资源。',
          scope: 'Team/组织账号。',
          persistence: '服务端组织策略跨设备生效。',
          automation: '管理员在账号控制台配置域名和 SAML IdP。',
          security: '集中身份、域名约束和隐私控制。',
          conditions: 'Custom Model BYOK 只适用于 Individual 计划，不适用于 Teams。',
          sources: ['qoder-teams', 'qoder-sso', 'qoder-model'],
          status: '条件项',
        },
      },
      related: ['auth-browser', 'auth-storage', 'model-provider'],
    }),
  };

  Object.assign(window.capabilityDetails, modelDetails);
})();

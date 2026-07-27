(() => {
  const sourceByProduct = {
    claude: 'claude-commands',
    codex: 'codex-commands',
    qwen: 'qwen-commands',
    kimi: 'kimi-commands',
    qoder: 'qoder-commands',
  };

  function command(product, commands, behavior, overrides = {}) {
    return {
      commands,
      aliases: [],
      parameters: '无公开参数',
      behavior,
      mode: '交互式 CLI',
      persistence: '仅影响当前会话或当前操作',
      conditions: '无额外条件',
      status: product === 'qwen' ? '源码确认' : '官方确认',
      sources: [sourceByProduct[product]],
      ...overrides,
    };
  }

  function unconfirmed(product, behavior = '当前官方命令目录未列出对应 Slash 命令。') {
    return command(product, [], behavior, {
      parameters: '—',
      persistence: '—',
      conditions: '不据此推断底层能力不存在',
      status: '未确认',
    });
  }

  window.capabilityDetails = {
    'cmd-login': {
      definition: '在已经启动的 CLI 会话中选择账号、模型平台或认证方式，并写入后续请求所需的本地凭据。',
      includes: ['交互式账号登录入口', '退出登录与清理当前账号凭据', '命令别名和登录平台差异'],
      excludes: ['环境变量 API Key 的完整配置', '企业单点登录策略', '模型 Provider 的协议兼容性'],
      facts: [
        'Claude Code、Kimi Code 和 Qoder CLI 都提供独立的登录与退出命令。',
        'Qwen Code 把登录纳入 `/auth`，并兼容 `/connect`、`/login` 两个别名。',
        'Codex CLI 使用启动级 `codex login` 完成登录；当前会话命令表只列出 `/logout`。',
      ],
      products: {
        claude: command('claude', ['/login', '/logout'], '登录或退出 Anthropic 账号。', {
          persistence: '登录凭据供后续会话使用；`/logout` 清除当前登录状态',
        }),
        codex: command('codex', ['/logout'], '从交互会话退出当前 Codex 账号；登录由 `codex login` 启动级命令完成。', {
          parameters: '登录：`codex login`；会话内退出：`/logout`',
          persistence: '本地登录凭据跨会话使用，退出后失效',
          status: '条件项',
        }),
        qwen: command('qwen', ['/auth'], '打开认证流程，连接或切换 LLM Provider。', {
          aliases: ['/connect', '/login'],
          mode: '交互式、非交互式、ACP',
          persistence: '认证信息写入 Qwen Code 的本地认证配置',
        }),
        kimi: command('kimi', ['/login', '/logout'], '选择 Kimi Code 或 Kimi Platform 登录；前者走 OAuth 验证码，后者使用 API Key。', {
          persistence: '`/logout` 清除当前所选账号的凭据',
          conditions: '登录与退出只在 CLI 空闲时执行',
        }),
        qoder: command('qoder', ['/login', '/logout'], '登录或退出 Qoder 账号。', {
          mode: 'TUI',
          persistence: '账号凭据供后续会话使用',
        }),
      },
      related: ['cmd-model', 'cmd-config', 'cmd-status'],
    },

    'cmd-model': {
      definition: '在当前会话中查看或切换主模型；部分产品同时允许设置默认模型、辅助模型或执行一次性跨模型提示。',
      includes: ['当前会话模型切换', '模型选择器', '模型设置是否跨会话保存', '辅助模型入口'],
      excludes: ['Provider 认证', '模型价格和质量评价', 'Subagent 独立模型配置'],
      facts: [
        '五家 CLI 都提供 `/model`。',
        'Claude Code 的模型选择默认只作用于当前会话；在选择器按 `d` 才会保存用户默认值。',
        'Qwen Code 的 `/model` 同时覆盖 fast、voice、vision、image 模型，并支持项目级或用户级持久化。',
      ],
      products: {
        claude: command('claude', ['/model [model]'], '不带参数打开模型选择器；带模型参数直接切换。支持模型可同时调整 effort。', {
          parameters: '`[model]`；选择器中的 `d` 保存用户默认值',
          mode: '交互式；`-p` 中可带模型参数',
          persistence: '默认只切换当前会话；按 `d` 保存用户默认值；`-p` 不改默认值',
          conditions: '切换已有对话的模型时会提示确认，因为下一次响应需重新读取历史',
        }),
        codex: command('codex', ['/model'], '打开模型选择器，并在模型支持时同时选择 reasoning effort。', {
          persistence: '作用于当前会话；具体默认值由配置文件决定',
        }),
        qwen: command('qwen', ['/model'], '切换主模型，或管理 fast、voice、vision、image 等专用模型。也能用其他模型执行一次性提示。', {
          parameters: '`[--fast|--voice|--vision|--image] [--project|--global] [model-id]`；支持 `model-id prompt`',
          mode: '交互式、非交互式、ACP',
          persistence: '`--project` 写项目设置，`--global` 写用户设置；未指定时为当前会话',
          conditions: '一次性提示中的文本原样发送，不做 `@file` 展开',
        }),
        kimi: command('kimi', ['/model'], '切换当前会话使用的 LLM 模型。', {
          persistence: '当前会话',
          conditions: '流式输出期间也可使用',
        }),
        qoder: command('qoder', ['/model'], '打开模型级别和模型设置管理界面。', {
          mode: 'TUI',
          persistence: '由模型设置界面决定',
        }),
      },
      related: ['cmd-effort', 'cmd-login', 'cmd-status'],
    },

    'cmd-effort': {
      definition: '调整推理模型的思考强度或选择服务端快速档位，不改变任务提示本身。',
      includes: ['reasoning effort', '快速服务档位', '参数范围', '是否立即生效和是否持久化'],
      excludes: ['模型切换', '上下文窗口大小', '响应风格'],
      facts: [
        'Claude Code、Qwen Code 和 Qoder CLI 提供独立 `/effort`。',
        'Codex 将 reasoning effort 放在 `/model` 中，并用 `/fast` 控制可用的 Fast 服务档位。',
        'Kimi Code 当前 Slash 命令目录未列出独立 effort 命令。',
      ],
      products: {
        claude: command('claude', ['/effort [level|auto]', '/fast [on|off]'], '设置模型 effort；`/fast` 切换快速服务模式。', {
          parameters: '`low|medium|high|xhigh|max|auto`；可用档位依模型',
          mode: '交互式；`-p` 支持带 level 参数',
          persistence: '`max` 和 `-p` 形式仅当前会话；其他档位可通过设置保存',
          conditions: '部分档位需要支持的模型或服务计划',
        }),
        codex: command('codex', ['/model', '/fast'], '在模型选择器中设置 reasoning effort；`/fast` 切换模型目录提供的 Fast 档位。', {
          persistence: '`/fast` 的选择会持久化',
          conditions: '仅在当前模型目录暴露对应档位时可用',
        }),
        qwen: command('qwen', ['/effort'], '设置统一 effort 档位，再按 Provider 能力映射和截断。', {
          parameters: '命令提示显示当前支持的 effort tiers；不带参数打开选择器',
          mode: '交互式、非交互式、ACP',
          persistence: '当前会话或当前模型配置',
        }),
        kimi: unconfirmed('kimi'),
        qoder: command('qoder', ['/effort [level]', '/fast [on|off]'], '设置当前模型推理强度；`/fast` 切换快速模式。', {
          parameters: '`/effort [level]`；不带 level 打开模型选项',
          mode: 'TUI',
          persistence: '当前模型设置',
        }),
      },
      related: ['cmd-model', 'cmd-status', 'cmd-config'],
    },

    'cmd-permissions': {
      definition: '在会话运行中查看或修改工具审批模式、允许规则和拒绝规则。',
      includes: ['审批预设', '允许、询问、拒绝规则', 'YOLO/自动编辑模式', '生效范围'],
      excludes: ['操作系统沙箱实现', '企业托管策略完整配置', 'Subagent 独立权限字段'],
      facts: [
        'Claude Code 和 Qwen Code 将审批模式与细粒度规则分成不同入口。',
        'Codex `/permissions` 切换审批预设，例如 Auto 与 Read Only。',
        'Kimi Code 除 `/permission` 外还提供 `/auto` 与 `/yolo` 快捷开关。',
      ],
      products: {
        claude: command('claude', ['/permissions'], '管理工具权限的 allow、ask、deny 规则，并查看工作目录和最近的 auto mode 拒绝。', {
          aliases: ['/allowed-tools'],
          persistence: '由对话框选择的规则 scope 决定',
        }),
        codex: command('codex', ['/permissions'], '切换当前会话审批预设，例如 Auto、Read Only 或已配置的命名权限档案。', {
          persistence: '立即影响当前会话后续操作',
          conditions: '命名权限档案启用时会出现在选择器中',
        }),
        qwen: command('qwen', ['/approval-mode', '/permissions'], '`/approval-mode` 切换工具审批模式；`/permissions` 管理细粒度权限规则。', {
          parameters: '`/approval-mode <mode>`',
          mode: '仅交互式',
          persistence: '模式影响当前会话；规则按权限配置 scope 保存',
        }),
        kimi: command('kimi', ['/permission', '/auto [on|off]', '/yolo [on|off]'], '选择权限模式；auto 自动处理工具审批，yolo 跳过普通工具调用审批。', {
          aliases: ['/yes'],
          persistence: '当前会话',
          conditions: 'yolo 不跳过退出 Plan 模式的审批',
        }),
        qoder: command('qoder', ['/config'], '权限模式通过配置界面管理；官方命令目录没有独立 `/permissions`。', {
          persistence: '由配置项 scope 决定',
          status: '条件项',
        }),
      },
      related: ['cmd-plan', 'cmd-config', 'agent-permission'],
    },

    'cmd-plan': {
      definition: '切换到先分析和形成执行方案、再进入修改或命令执行的计划模式。',
      includes: ['进入和退出 Plan 模式', '可选任务描述', '清除已有计划', '权限边界'],
      excludes: ['长期目标循环', '普通对话中的计划文本', 'Subagent 的 Plan 内置角色'],
      facts: [
        'Claude Code、Codex、Qwen Code 和 Kimi Code 都提供 `/plan`。',
        'Kimi Code 可用 `on|off` 显式设置，并提供 `/plan clear`。',
        'Qoder CLI 的 Agent 权限模式支持 plan，但当前命令目录没有独立 `/plan`。',
      ],
      products: {
        claude: command('claude', ['/plan [description]'], '进入 Plan 模式；带描述时进入后立即开始分析指定任务。', {
          parameters: '`[description]`',
          persistence: '当前会话模式',
        }),
        codex: command('codex', ['/plan [prompt]'], '切换 Plan 模式，并可同时发送一个计划任务提示。', {
          persistence: '当前会话模式',
        }),
        qwen: command('qwen', ['/plan'], '在 Plan 模式与原审批模式之间切换。', {
          mode: '仅交互式',
          persistence: '当前会话模式',
        }),
        kimi: command('kimi', ['/plan [on|off]', '/plan clear'], '翻转或显式设置 Plan 模式；`clear` 删除当前计划方案。', {
          parameters: '`on|off|clear`',
          persistence: '当前会话模式和当前计划',
          conditions: '单纯切换模式不会创建空计划文件',
        }),
        qoder: unconfirmed('qoder', 'Agent 配置支持 `plan` permission mode，但官方 Slash 命令目录未列出 `/plan`。'),
      },
      related: ['cmd-goal', 'cmd-permissions', 'agent-builtins'],
    },

    'cmd-goal': {
      definition: '保存一个跨多轮持续执行的目标，让 Agent 在每轮结束后根据目标状态决定继续、暂停、完成或阻塞。',
      includes: ['创建和查看目标', '暂停、恢复、清除或替换', '后续目标队列', '非交互退出状态'],
      excludes: ['一次性任务提示', '计划模式', '后台 Shell 进程'],
      facts: [
        'Claude Code、Codex、Qwen Code 和 Kimi Code 都提供 `/goal`。',
        'Kimi Code 公开了 status、pause、resume、cancel、replace、next 等子命令及非交互退出码。',
        'Qoder CLI 当前命令目录没有 `/goal`。',
      ],
      products: {
        claude: command('claude', ['/goal [condition|clear]'], '设置持续目标；不带参数显示当前或最近完成的目标。', {
          parameters: '`condition`；`clear|stop|off|reset|none|cancel` 可提前移除',
          persistence: '当前会话的持续目标状态',
        }),
        codex: command('codex', ['/goal'], '设置、编辑、暂停、恢复、查看或清除任务目标。', {
          persistence: '当前会话的持久目标状态',
        }),
        qwen: command('qwen', ['/goal [condition|clear]'], '设置目标并持续工作直到满足条件。', {
          parameters: '`[condition | clear]`',
          mode: '交互式、非交互式、ACP',
          persistence: '当前会话的目标状态',
        }),
        kimi: command('kimi', ['/goal [...]'], '创建并管理目标模式，支持暂停、恢复、替换、取消和后续目标队列。', {
          parameters: '`status|pause|resume|cancel|replace <objective>|next <objective>|next manage`',
          mode: 'TUI；`kimi -p "/goal ..."` 只支持创建形式',
          persistence: '目标和后续目标队列保存在当前会话',
          conditions: 'Prompt 模式完成、阻塞、暂停分别使用退出码 0、3、6',
        }),
        qoder: unconfirmed('qoder'),
      },
      related: ['cmd-plan', 'cmd-tasks', 'cmd-collaboration'],
    },

    'cmd-agents': {
      definition: '在当前 CLI 中查看、创建、切换或重新加载可委派的 Subagent 定义和运行线程。',
      includes: ['Agent 定义管理', 'Agent 线程切换', '创建向导', '重载 Agent 配置'],
      excludes: ['Subagent 的完整工具和权限矩阵', '多模型竞赛模式', '普通后台 Shell'],
      facts: [
        '五家的“Agent 管理”入口含义不同：有的管理定义，有的切换运行线程。',
        'Claude Code 2.1.198 起 `/agents` 只打印管理指引；创建和编辑通过对话或文件完成。',
        'Kimi Code 通过 Agent 配置和 Agent 工具使用 Subagent；`/swarm` 是另一种多代理运行模式。',
      ],
      products: {
        claude: command('claude', ['/agents', '/subtask'], '`/agents` 提示通过对话或 Agent 文件管理；`/subtask` 创建回传结果的后台 Subagent。', {
          persistence: 'Agent 定义保存在项目或用户目录；Subtask 属于当前会话',
          conditions: '2.1.197 及更早版本的 `/agents` 曾提供交互管理界面',
          sources: ['claude-commands', 'claude-agents'],
        }),
        codex: command('codex', ['/agent'], '查看或切换已生成的 Agent 线程。', {
          aliases: ['/subagents'],
          persistence: '线程属于当前会话',
          sources: ['codex-commands', 'codex-agents'],
        }),
        qwen: command('qwen', ['/agents manage', '/agents create'], '管理已有 Subagent 定义，或通过向导创建新定义。', {
          mode: '仅交互式',
          persistence: '定义保存到用户、项目或扩展目录',
          sources: ['qwen-commands', 'qwen-agents'],
        }),
        kimi: unconfirmed('kimi', 'Agent 通过配置文件和 Agent 工具调用；`/swarm` 不等同于 Agent 定义管理命令。'),
        qoder: command('qoder', ['/agents', '/agents reload'], '打开 Subagent 配置管理；reload 重新读取 Agent 定义。', {
          mode: 'TUI',
          persistence: '定义保存在项目、用户、插件或启动参数 scope',
          sources: ['qoder-commands', 'qoder-agents'],
        }),
      },
      related: ['agent-builtins', 'agent-config', 'cmd-collaboration'],
    },

    'cmd-tasks': {
      definition: '查看和控制当前会话中的后台 Shell、Subagent、Workflow 或其他长时间任务。',
      includes: ['后台任务列表', '最近输出', '停止任务', '不同后台任务类型'],
      excludes: ['历史会话列表', '长期目标状态', '云端仓库任务的完整管理'],
      facts: [
        '五家都提供后台任务相关入口，但 Codex 使用 `/ps` 和 `/stop`。',
        'Qwen Code `/tasks` 输出文本摘要，交互式任务对话框从底部状态入口打开。',
        'Claude Code 的任务列表包含已完成的后台 Subagent。',
      ],
      products: {
        claude: command('claude', ['/tasks', '/background [prompt]'], '列出当前会话后台任务；可将整个会话转为后台 Agent。', {
          aliases: ['/bg'],
          persistence: '后台会话可在 `claude agents` 中继续管理',
        }),
        codex: command('codex', ['/ps', '/stop'], '显示后台终端及最近输出；`/stop` 停止当前会话的全部后台终端。', {
          persistence: '当前会话',
        }),
        qwen: command('qwen', ['/tasks'], '输出后台任务文本列表；交互式对话框提供更完整的任务控制。', {
          mode: '交互式、非交互式、ACP',
          persistence: '当前会话',
        }),
        kimi: command('kimi', ['/tasks'], '浏览后台任务列表。', {
          aliases: ['/task'],
          conditions: '流式输出期间也可使用',
        }),
        qoder: command('qoder', ['/tasks'], '列出并管理后台任务。', {
          mode: 'TUI',
        }),
      },
      related: ['cmd-goal', 'agent-background', 'execution-background'],
    },

    'cmd-new': {
      definition: '在不退出 CLI 进程的情况下结束当前对话上下文并开始一个空白会话。',
      includes: ['清空上下文', '保留或命名前一会话', '命令别名', '是否退出 CLI'],
      excludes: ['压缩当前上下文', '删除历史会话', '清空终端显示但保留对话'],
      facts: [
        '五家都有新会话或清空会话命令。',
        'Claude Code 可在清空时给上一会话命名。',
        'Kimi Code 的 `/new` 只在空闲状态执行，并明确丢弃当前上下文。',
      ],
      products: {
        claude: command('claude', ['/clear [name]'], '创建空上下文的新对话；可用 name 标记上一会话。', {
          aliases: ['/reset', '/new'],
          parameters: '`[name]`',
          persistence: '上一会话仍可通过 `/resume` 恢复',
        }),
        codex: command('codex', ['/new', '/clear'], '在当前 CLI 中开始新会话；`/clear` 同时清理终端显示和聊天上下文。', {
          persistence: '已保存会话仍可恢复',
        }),
        qwen: command('qwen', ['/clear'], '清空对话历史并释放上下文。', {
          aliases: ['/reset', '/new'],
          mode: '交互式、非交互式、ACP',
        }),
        kimi: command('kimi', ['/new'], '开始全新会话并丢弃当前上下文。', {
          aliases: ['/clear'],
          conditions: '仅空闲时使用',
        }),
        qoder: command('qoder', ['/clear'], '清空会话历史并释放上下文。', {
          mode: 'TUI',
        }),
      },
      related: ['cmd-resume', 'cmd-compact', 'cmd-fork'],
    },

    'cmd-resume': {
      definition: '从本地或账号会话历史中选择一个已保存会话，并恢复其对话上下文和关联状态。',
      includes: ['历史选择器', '按名称或 ID 恢复', '后台会话限制', '命令别名'],
      excludes: ['从当前消息创建分支', '跨产品导入会话', '恢复单个文件检查点'],
      facts: [
        '五家都提供恢复会话入口。',
        'Claude Code 可按 ID 或名称直接恢复；仍在运行的后台会话需从 agent view 管理。',
        'Qwen Code `/resume` 只在交互模式提供。',
      ],
      products: {
        claude: command('claude', ['/resume [session]'], '按 ID、名称恢复，或不带参数打开会话选择器。', {
          aliases: ['/continue'],
          parameters: '`[session]`',
          conditions: '仍在运行的后台会话不能从普通选择器恢复',
        }),
        codex: command('codex', ['/resume'], '从已保存会话列表继续以前的 CLI 会话。'),
        qwen: command('qwen', ['/resume [session]'], '恢复先前会话；可接受命令参数进行定位。', {
          aliases: ['/continue'],
          mode: '仅交互式',
        }),
        kimi: command('kimi', ['/sessions'], '浏览历史会话并切换或恢复。', {
          aliases: ['/resume'],
          conditions: '仅空闲时使用',
        }),
        qoder: command('qoder', ['/resume'], '从历史记录恢复以前的对话。', {
          mode: 'TUI',
        }),
      },
      related: ['cmd-new', 'cmd-fork', 'cmd-status'],
    },

    'cmd-fork': {
      definition: '复制当前对话的历史状态，形成后续互不影响的会话分支或后台会话。',
      includes: ['会话分支', '上下文复制范围', '是否切换到新分支', '是否后台运行'],
      excludes: ['Git 分支创建', 'Subagent 的独立任务上下文', '文件检查点恢复'],
      facts: [
        '同名 `/fork` 的运行方式并不一致：Claude Code 复制到后台会话，Codex 与 Kimi Code 创建新会话。',
        'Claude Code `/branch` 会切换到新分支，`/fork` 则保留当前会话继续工作。',
        'Qwen Code `/branch` 创建会话分支；`/fork` 创建继承完整对话的后台 Agent。',
      ],
      products: {
        claude: command('claude', ['/branch [name]', '/fork [prompt]'], '`/branch` 创建并切换会话分支；`/fork` 复制到独立后台会话而当前会话继续运行。', {
          parameters: '`/branch [name]`；`/fork [prompt]`',
          persistence: '新会话独立保存',
          conditions: '`/fork` 当前行为需要 2.1.212+，关闭 agent view 时行为可能不同',
        }),
        codex: command('codex', ['/fork'], '把当前聊天复制成一个新的聊天分支。', {
          persistence: '新会话独立保存',
        }),
        qwen: command('qwen', ['/branch', '/fork <directive>'], '`/branch` 创建新会话；`/fork` 生成继承完整对话的后台 Agent。', {
          parameters: '`/fork <directive>`',
          mode: '`/fork` 仅交互式',
          persistence: '会话分支和 Fork Agent 独立保存',
        }),
        kimi: command('kimi', ['/fork'], '基于当前会话创建新会话，并保留完整对话历史。', {
          conditions: '仅空闲时使用',
          persistence: '新会话独立保存',
        }),
        qoder: unconfirmed('qoder'),
      },
      related: ['cmd-resume', 'agent-initial-context', 'cmd-new'],
    },

    'cmd-compact': {
      definition: '把较长的对话历史替换为摘要或裁剪后的上下文，以释放模型上下文窗口。',
      includes: ['模型摘要压缩', '自定义保留指令', '非模型快速裁剪', '压缩后的可撤销边界'],
      excludes: ['清空会话', '跨会话长期记忆', '修改模型上下文窗口上限'],
      facts: [
        '五家都有上下文压缩入口。',
        'Qwen Code 额外提供 `/compress-fast`，不调用模型，只裁剪旧工具输出和 thinking。',
        'Kimi Code 压缩后，`/undo` 不能回到最近一次压缩之前。',
      ],
      products: {
        claude: command('claude', ['/compact [instructions]'], '总结当前对话并用摘要释放上下文；可指定摘要关注点。', {
          parameters: '`[instructions]`',
          persistence: '替换当前会话上下文表示',
        }),
        codex: command('codex', ['/compact'], '总结可见聊天内容并释放 token。', {
          persistence: '替换当前会话上下文表示',
        }),
        qwen: command('qwen', ['/compress', '/compress-fast'], '`/compress` 生成摘要；`/compress-fast` 不调用模型，移除旧工具输出和 thinking 片段。', {
          aliases: ['/summarize'],
          mode: '交互式、非交互式、ACP',
          persistence: '修改当前会话上下文',
        }),
        kimi: command('kimi', ['/compact [instruction]'], '压缩当前对话；可指示需要保留的信息。', {
          parameters: '`[instruction]`',
          conditions: '仅空闲时使用；压缩前的提示不能再由 `/undo` 撤销',
          persistence: '修改当前会话上下文',
        }),
        qoder: command('qoder', ['/compact [instructions]'], '以 Prompt 命令总结当前会话并压缩上下文。', {
          parameters: '`[instructions]`',
          mode: 'TUI 与 Headless',
          persistence: '修改当前会话上下文',
        }),
      },
      related: ['cmd-new', 'cmd-status', 'cmd-memory'],
    },

    'cmd-memory': {
      definition: '查看、创建或删除可跨会话复用的项目信息、用户偏好或自动提取的记忆。',
      includes: ['记忆管理界面', '显式记住和忘记', '自动记忆开关', '项目指令文件入口'],
      excludes: ['当前对话上下文', 'Skill 知识包', '会话导出'],
      facts: [
        'Claude Code、Codex、Qwen Code 和 Qoder CLI 都提供记忆管理命令。',
        'Qwen Code 将显式写入、删除和从知识源生成 Skill 拆成多个命令。',
        'Kimi Code 当前 Slash 命令目录没有独立记忆管理命令。',
      ],
      products: {
        claude: command('claude', ['/memory'], '编辑 CLAUDE.md 记忆文件，管理 auto-memory 开关并查看自动记忆条目。', {
          persistence: '项目或用户记忆文件跨会话生效',
        }),
        codex: command('codex', ['/memories'], '开启或关闭记忆注入和记忆生成。', {
          persistence: '记忆功能可跨会话使用',
          conditions: '仅在 Memories 功能可用时出现',
        }),
        qwen: command('qwen', ['/memory', '/remember <text>', '/forget <text>', '/learn <source> [focus]'], '打开记忆管理器、写入持久记忆、删除匹配的自动记忆，或从文件、URL、对话、文本生成 Skill。', {
          mode: '`/memory` 仅交互；其他命令支持交互和 ACP',
          persistence: '记忆或 Skill 文件跨会话生效',
        }),
        kimi: unconfirmed('kimi'),
        qoder: command('qoder', ['/memory', '/memory manage'], '打开记忆概览、自动记忆目录或主题文件管理。', {
          mode: 'TUI',
          persistence: '记忆文件跨会话生效',
        }),
      },
      related: ['cmd-skills', 'cmd-compact', 'extension-project-instructions'],
    },

    'cmd-rewind': {
      definition: '回到当前会话较早的消息或工具调用点，并按产品能力恢复对话、文件或二者。',
      includes: ['消息回退', '代码检查点', '工具调用恢复', '回退选择器'],
      excludes: ['Git reset', '恢复历史会话', '撤销最近一次文本编辑器输入'],
      facts: [
        'Claude Code 与 Qwen Code 都提供会话回退，但恢复粒度不同。',
        'Qwen Code `/restore` 以工具调用为锚点，同时重置对话与文件历史。',
        'Kimi Code `/undo` 只撤销最近的用户提示，并受上下文压缩边界限制。',
      ],
      products: {
        claude: command('claude', ['/rewind'], '从历史消息选择点恢复对话、代码或生成摘要。', {
          aliases: ['/checkpoint', '/undo'],
          persistence: '修改当前会话与可选代码状态',
        }),
        codex: unconfirmed('codex'),
        qwen: command('qwen', ['/rewind', '/restore'], '`/rewind` 回到以前的对话轮次；`/restore` 恢复指定工具调用时的对话与文件状态。', {
          aliases: ['/rollback'],
          mode: '仅交互式',
          persistence: '修改当前会话和可能的文件状态',
        }),
        kimi: command('kimi', ['/undo [count]'], '撤销最近的用户提示；不带 count 打开选择器。', {
          parameters: '`[count]`',
          conditions: '不能撤销到最后一次上下文压缩之前',
          persistence: '修改当前会话上下文',
        }),
        qoder: unconfirmed('qoder'),
      },
      related: ['cmd-resume', 'cmd-diff', 'session-checkpoint'],
    },

    'cmd-diff': {
      definition: '在 CLI 中查看工作区相对 Git 基线的文件变化，或按 Agent 轮次查看其产生的差异。',
      includes: ['工作树 Diff', '未跟踪文件', '按轮次 Diff', '交互浏览'],
      excludes: ['代码审查结论', 'Git 提交', '云端 PR Diff'],
      facts: [
        'Claude Code、Codex 和 Qwen Code 提供内置 Diff 命令。',
        'Claude Code 可在当前 Git Diff 与每轮 Agent Diff 之间切换。',
        'Qwen Code 当前 `/diff` 输出相对 HEAD 的工作树变更统计，不等同于完整补丁查看器。',
      ],
      products: {
        claude: command('claude', ['/diff'], '打开交互式 Diff 浏览器，在当前 Git Diff、单轮变更和文件之间切换。', {
          persistence: '只读，不修改工作区',
        }),
        codex: command('codex', ['/diff'], '显示 Git Diff，并包含尚未被 Git 跟踪的文件。', {
          persistence: '只读，不修改工作区',
        }),
        qwen: command('qwen', ['/diff'], '显示工作树相对 HEAD 的变更统计。', {
          mode: '交互式、非交互式、ACP',
          persistence: '只读，不修改工作区',
        }),
        kimi: unconfirmed('kimi', '可通过 Git 或 Shell 查看差异，但当前官方 Slash 命令目录没有 `/diff`。'),
        qoder: unconfirmed('qoder', '可通过 Git 或 Shell 查看差异，但当前官方 Slash 命令目录没有 `/diff`。'),
      },
      related: ['cmd-review', 'cmd-rewind', 'execution-files'],
    },

    'cmd-review': {
      definition: '启动由产品提供的代码审查流程，对本地工作区、Git Diff 或 Pull Request 产生结构化问题清单。',
      includes: ['本地 Diff Review', 'PR Review', '安全审查', '自动应用或发表评论参数'],
      excludes: ['普通提示词要求“看看代码”', 'CI 检查', '自动修复 PR 后续评论'],
      facts: [
        'Claude Code 将快速 PR Review、本地多级 Code Review 和安全 Review 拆成三个命令。',
        'Codex `/review` 面向工作树审查。',
        'Qwen Code `/review` 由随产品提供的 Skill 注册，不在硬编码命令加载器中。',
        'Kimi Code 当前官方内置命令目录没有独立 Review 命令。',
      ],
      products: {
        claude: command('claude', ['/review [PR]', '/code-review [level] [--fix] [--comment] [target]', '/security-review'], '支持只读 PR Review、本地或云端多级 Review，以及当前分支安全审查。', {
          parameters: 'effort level、`--fix`、`--comment`、PR 或 target',
          persistence: '`--fix` 可修改文件，`--comment` 可写入 GitHub；其他形式只读',
          conditions: 'GitHub 相关形式需要仓库和相应访问权限',
        }),
        codex: command('codex', ['/review'], '进入代码审查模式，审查未提交变化或与基线分支比较。', {
          persistence: '默认产生审查结果，不等同于自动修改',
        }),
        qwen: command('qwen', ['/review [pr-number|file-path] [--effort low|medium|high] [--comment]'], '审查本地未提交变化、指定文件或 Pull Request。PR 默认使用 high，本地和文件默认使用 medium；同仓 PR 进入临时 Worktree，跨仓 URL 使用轻量模式。', {
          parameters: '`[pr-number|file-path] [--effort low|medium|high] [--comment]`',
          mode: '交互式、非交互式、ACP',
          persistence: '默认输出审查结果；PR 加 `--comment` 可提交一次 GitHub Review；临时文件与 Worktree 按流程清理',
          conditions: '随产品提供的 Skill 在 bare mode、`skills.disabled` 或 `slashCommands.disabled` 命中时不可用；PR 读取或评论需要 GitHub 访问权限',
          sources: ['qwen-bundled-skills', 'qwen-review-skill', 'qwen-command-modes'],
        }),
        kimi: unconfirmed('kimi', '可以通过提示执行审查，但当前官方 Slash 命令目录没有 `/review`。'),
        qoder: command('qoder', ['/review [instruction]'], '以 Prompt 命令审查本地待提交 Git 变化。', {
          parameters: '`[instruction]`',
          mode: 'TUI 与 Headless',
          persistence: '只读审查提示；后续是否修改取决于任务交互',
        }),
      },
      related: ['cmd-diff', 'cmd-github', 'execution-review'],
    },

    'cmd-export': {
      definition: '把当前会话历史写入用户指定文件或导出包，供阅读、归档或问题诊断。',
      includes: ['导出格式', '文件路径参数', '剪贴板', '调试包'],
      excludes: ['分享远程会话链接', '导出项目代码', '会话恢复格式兼容'],
      facts: [
        'Qwen Code 提供 HTML、Markdown、JSON、JSONL 四种格式。',
        'Kimi Code 将普通 Markdown 导出与调试 ZIP 分开。',
        'Codex 当前 CLI Slash 命令表未列出会话导出命令。',
      ],
      products: {
        claude: command('claude', ['/export [filename]'], '导出为纯文本；无文件名时打开复制或保存对话框。', {
          parameters: '`[filename]`',
          persistence: '写文件或剪贴板',
        }),
        codex: unconfirmed('codex'),
        qwen: command('qwen', ['/export [md|html|json|jsonl] [path]'], '按指定格式写出当前会话消息历史；不带子命令默认 HTML。', {
          parameters: '`[md|html|json|jsonl] [path]`',
          mode: '交互式、非交互式、ACP',
          persistence: '写入导出文件',
        }),
        kimi: command('kimi', ['/export-md [path]', '/export-debug-zip'], '普通会话导出为 Markdown；诊断信息导出为 ZIP。', {
          aliases: ['/export'],
          parameters: '`[path]`',
          conditions: '仅空闲时使用',
          persistence: '写入导出文件',
        }),
        qoder: command('qoder', ['/export [filename]'], '把当前会话导出到文件。', {
          parameters: '`[filename]`',
          mode: 'TUI',
          persistence: '写入导出文件',
        }),
      },
      related: ['cmd-status', 'session-export', 'cmd-config'],
    },

    'cmd-config': {
      definition: '在会话内查看、修改或诊断 CLI 的模型、界面、工具和行为设置。',
      includes: ['设置界面', '按 key 写配置', '配置层诊断', '导入配置'],
      excludes: ['账号登录', '权限规则完整语义', 'MCP Server 独立管理'],
      facts: [
        'Claude Code 与 Qwen Code 都支持在命令参数中直接设置 key/value。',
        'Codex `/debug-config` 是只读诊断，不是通用配置编辑器。',
        'Kimi Code 和 Qoder CLI 的配置命令打开 TUI 设置面板。',
      ],
      products: {
        claude: command('claude', ['/config [key=value ...]'], '打开设置界面，或直接设置一个或多个配置项。', {
          aliases: ['/settings'],
          parameters: '`key=value ...`；`--help` 查看可设置键',
          mode: '交互式；key/value 形式也可用于 `-p` 和 Remote Control',
          persistence: '写入设置，供后续会话使用',
        }),
        codex: command('codex', ['/debug-config'], '打印配置层顺序、启用状态和组织策略要求。', {
          persistence: '只读，不修改配置',
          status: '条件项',
        }),
        qwen: command('qwen', ['/config <key>[=<value>]', '/settings', '/import-config'], '`/config` 按 dot-path 读写任意设置；`/settings` 打开图形设置；`/import-config` 导入配置。', {
          parameters: '`<key>[=<value>]` 或 `--help`',
          mode: '`/config` 支持交互、非交互、ACP；设置界面仅交互',
          persistence: '写入项目或用户设置',
        }),
        kimi: command('kimi', ['/settings'], '打开 TUI 设置面板；更新配置也可调用内置 `/update-config` Skill。', {
          aliases: ['/config'],
          persistence: '写入 Kimi Code 设置',
          conditions: '流式输出期间可使用',
        }),
        qoder: command('qoder', ['/config'], '打开 Qoder CLI 配置管理界面。', {
          mode: 'TUI',
          persistence: '写入 Qoder CLI 设置',
        }),
      },
      related: ['cmd-permissions', 'cmd-model', 'cmd-status'],
    },

    'cmd-status': {
      definition: '显示当前会话的模型、账号、连接、上下文、用量、配置或版本信息。',
      includes: ['会话状态', '用量统计', '上下文占用', '版本和连接信息'],
      excludes: ['后台任务列表', '调试日志内容', '账单和价格对比'],
      facts: [
        '五家都有状态入口，但展示内容不同。',
        'Qwen Code `/stats` 提供 model、tools、skills、daily、monthly、export 子命令。',
        'Qoder CLI 将 context window 配置与 usage 分成独立命令。',
      ],
      products: {
        claude: command('claude', ['/status', '/usage'], '`/status` 显示版本、模型、账号和连接；`/usage` 显示用量，`/stats` 是其别名。', {
          aliases: ['/stats', '/cost'],
          conditions: '这些状态命令可在 Claude 正在响应时立即执行',
          persistence: '只读',
        }),
        codex: command('codex', ['/status', '/usage'], '显示会话模型、审批策略、可写根、剩余上下文和账号用量。', {
          persistence: '只读',
        }),
        qwen: command('qwen', ['/status', '/stats [model|tools|skills|daily|monthly|export]'], '显示运行状态和多维使用统计。', {
          aliases: ['/about', '/usage'],
          mode: '交互式、非交互式、ACP',
          persistence: '只读；export 子命令可写统计文件',
        }),
        kimi: command('kimi', ['/status', '/usage', '/version'], '分别显示会话状态、用量和版本。', {
          conditions: '流式输出期间可使用',
          persistence: '只读',
        }),
        qoder: command('qoder', ['/status', '/usage', '/context-window'], '显示 CLI 状态、套餐用量，并查看或设置当前模型上下文窗口。', {
          mode: 'TUI',
          persistence: '状态和用量只读；context-window 可修改模型设置',
        }),
      },
      related: ['cmd-model', 'cmd-effort', 'cmd-tasks'],
    },

    'cmd-mcp': {
      definition: '查看和管理当前 CLI 已配置的 Model Context Protocol Server、连接状态和可用工具。',
      includes: ['Server 列表', '连接状态', '启用与禁用', 'OAuth 或重连'],
      excludes: ['MCP 协议实现细节', '工具权限完整策略', '把 CLI 本身作为 MCP Server'],
      facts: [
        '五家都提供 `/mcp`。',
        'Claude Code 支持 reconnect、enable、disable 子命令。',
        'Qwen Code 的 `/mcp` 打开管理对话框，并支持 desc、nodesc、schema 参数。',
      ],
      products: {
        claude: command('claude', ['/mcp [reconnect <server>|enable|disable [server|all]]'], '打开连接列表，重连 Server，或启用和禁用连接。', {
          parameters: '`reconnect <server>`、`enable|disable [server|all]`',
          mode: '交互式；`-p` 无参数时输出文本状态',
          persistence: 'enable/disable 修改连接启用状态',
        }),
        codex: command('codex', ['/mcp [verbose]'], '列出已配置 MCP 工具；verbose 显示 Server 详情。', {
          persistence: '只读状态入口',
        }),
        qwen: command('qwen', ['/mcp [desc|nodesc|schema]'], '打开 MCP 管理对话框，并控制工具描述或 schema 展示。', {
          parameters: '`desc|nodesc|schema`',
          mode: '仅交互式',
        }),
        kimi: command('kimi', ['/mcp', '/mcp-config'], '查看 MCP 状态；通过内置 Skill 配置 MCP Server。', {
          persistence: '配置写入 MCP 设置',
        }),
        qoder: command('qoder', ['/mcp'], '列出并管理 MCP Server。', {
          mode: 'TUI',
          persistence: '由管理界面操作决定',
        }),
      },
      related: ['cmd-plugins', 'cmd-skills', 'extension-mcp'],
    },

    'cmd-skills': {
      definition: '列出、筛选、启用或调用以 Markdown 指令和资源组成的 Agent Skill。',
      includes: ['Skill 列表', 'Skill 可见性', '热重载', '作为 Slash 命令调用'],
      excludes: ['Subagent 定义', '插件包完整管理', '自定义命令的所有格式'],
      facts: [
        '五家都支持 Skill 或 Skill 命令。',
        'Claude Code `/skills` 可以按 token 数排序并控制 Skill 是否对模型和命令菜单可见。',
        'Qwen Code `/skills` 打开浏览、搜索、开关和选择面板；具体 Skill 通过 `/<skill-name>` 直接调用。',
        '当前源码随产品提供 9 个 Skill 命令：`/batch`、`/dataviz`、`/extension-creator`、`/loop`、`/new-app`、`/qc-helper`、`/review`、`/simplify`、`/stuck`；其中 `/loop` 只在 Cron 开启时出现。',
      ],
      products: {
        claude: command('claude', ['/skills', '/reload-skills'], '浏览和筛选 Skills，调整可见性；重扫磁盘上的 Skill 目录。', {
          persistence: '可见性设置和 Skill 文件跨会话生效',
        }),
        codex: command('codex', ['/skills'], '浏览并选择本地 Skill。', {
          persistence: 'Skill 文件跨会话存在',
        }),
        qwen: command('qwen', ['/skills', '/<skill-name>'], '`/skills` 打开管理面板；随产品提供的 Skill，以及用户、项目和扩展 Skill，都可按名称注册为 Slash 命令。Skill 命令把 Skill 正文提交给模型，并应用 Skill 声明的工具权限。', {
          parameters: '`/skills` 不接收参数；具体 Skill 的参数由其 `argument-hint` 和正文定义',
          mode: '`/skills`：交互式、ACP；`/<skill-name>`：交互式、非交互式、ACP',
          persistence: 'Skill 文件和启用状态跨会话生效',
          conditions: 'bare mode 不加载 Skill 命令；`skills.disabled` 可按名称停用；`user-invocable: false` 的 Skill 不进入用户命令表',
          sources: ['qwen-commands', 'qwen-bundled-skills', 'qwen-skill-commands', 'qwen-command-modes'],
        }),
        kimi: command('kimi', ['/<skill-name>'], 'Skills 作为命令出现在命令补全中；官方命令表也列出多个内置 Skill 命令。', {
          parameters: '由各 Skill 定义',
          persistence: 'Skill 文件跨会话存在',
          status: '条件项',
        }),
        qoder: command('qoder', ['/skills'], '管理当前工作区的 Skill 命令。', {
          mode: 'TUI',
          persistence: '项目或用户 Skill 跨会话存在',
        }),
      },
      related: ['cmd-custom', 'cmd-plugins', 'cmd-memory'],
    },

    'cmd-hooks': {
      definition: '查看、信任、启用或管理在 Agent 生命周期事件上执行的 Hook。',
      includes: ['Hook 列表', '信任状态', '启用与禁用', '命令级管理入口'],
      excludes: ['每种 Hook 事件的完整参数 schema', 'CI Hook', 'Git Hook'],
      facts: [
        'Claude Code、Codex 和 Qwen Code 提供独立 `/hooks`。',
        'Qoder CLI 支持 Agent Hooks，但当前命令目录没有独立 `/hooks`。',
        'Kimi Code 当前 Slash 命令目录未列出 Hook 管理命令。',
      ],
      products: {
        claude: command('claude', ['/hooks'], '查看工具事件等生命周期 Hook 配置。', {
          persistence: '只读或进入 Hook 配置管理，配置文件跨会话生效',
        }),
        codex: command('codex', ['/hooks'], '查看和管理 Hook，信任新 Hook 或变化后的 Hook，并可禁用非托管 Hook。', {
          persistence: '信任和启用状态跨会话生效',
        }),
        qwen: command('qwen', ['/hooks'], '管理 Qwen Code Hooks；命令支持交互、非交互和 ACP。', {
          mode: '交互式、非交互式、ACP',
          persistence: 'Hook 配置跨会话生效',
        }),
        kimi: unconfirmed('kimi'),
        qoder: unconfirmed('qoder', 'Agent 配置支持 `hooks` 字段，但当前官方 Slash 命令目录没有独立 Hook 管理命令。'),
      },
      related: ['cmd-plugins', 'agent-hooks', 'extension-hooks'],
    },

    'cmd-plugins': {
      definition: '浏览、安装、启用、禁用或重新加载可分发的插件、扩展和应用连接。',
      includes: ['插件菜单', '安装与启停', '热重载', '应用连接入口'],
      excludes: ['MCP Server 单独配置', 'Skill 单文件', 'IDE 插件安装器'],
      facts: [
        'Claude Code、Codex、Qwen Code 和 Kimi Code 都有插件或扩展入口。',
        'Codex 把应用连接 `/apps` 和插件 `/plugins` 分开。',
        'Qoder CLI 有插件文档，但当前命令表没有独立插件管理命令。',
      ],
      products: {
        claude: command('claude', ['/plugin [subcommand]', '/reload-plugins [--force]'], '打开插件菜单，或执行 list、install、enable、disable；重载活动插件。', {
          parameters: '`list|install|enable|disable`；reload 支持 `--force`',
          persistence: '插件安装和启用状态跨会话生效',
          conditions: '重载若会改变 MCP 工具并使 prompt cache 失效，会要求 `--force`',
        }),
        codex: command('codex', ['/plugins', '/apps'], '浏览可用插件；浏览应用连接并以 `$app-slug` 插入提示。', {
          persistence: '安装和可用性设置跨会话生效',
        }),
        qwen: command('qwen', ['/extensions', '/extension-creator', '/reload-plugins'], '`/extensions` 管理已安装扩展；`/extension-creator` 是随产品提供的 Skill，负责创建、校验和本地测试扩展；`/reload-plugins` 重载扩展组件。', {
          parameters: '`/extensions explore|manage|list|install`；`/extension-creator <extension-path> [template]`',
          mode: '硬编码管理命令按各自模式；`/extension-creator` 支持交互式、非交互式和 ACP',
          persistence: '扩展安装状态跨会话生效',
          conditions: '`/extension-creator` 在 bare mode 或被 Skill/Slash 禁用时不可用',
          sources: ['qwen-commands', 'qwen-bundled-skills'],
        }),
        kimi: command('kimi', ['/plugins'], '打开插件管理入口。'),
        qoder: unconfirmed('qoder', '官方文档包含插件系统，但当前 Slash 命令目录未列出独立插件管理命令。'),
      },
      related: ['cmd-skills', 'cmd-hooks', 'cmd-mcp'],
    },

    'cmd-custom': {
      definition: '从用户或项目文件加载自定义提示模板，并以 Slash 命令形式在 TUI 或 Headless 中执行。',
      includes: ['自定义命令文件', '项目与用户 scope', '命令管理入口', 'Headless 可用性'],
      excludes: ['内置命令修改', '普通项目指令文件', '插件的完整打包规范'],
      facts: [
        'Claude Code、Codex 和 Kimi Code 主要通过 Skills 提供自定义命令。',
        'Qwen Code 同时加载用户、项目和扩展 Skills，Markdown/TOML 命令文件，以及保存的 Workflows。',
        'Qoder CLI 明确支持 `.qoder/commands/` 和 `~/.qoder/commands/`，Prompt 类型可用于 Headless。',
      ],
      products: {
        claude: command('claude', ['/<skill-name>'], '自定义 Skill 可作为 Slash 命令调用，最多可在消息开头串联六个 Skill。', {
          parameters: '由 Skill 定义；消息开头可连续写多个 Skill',
          persistence: 'Skill 文件跨会话存在',
          status: '条件项',
        }),
        codex: command('codex', ['/<skill-name>'], '通过本地 Skills 扩展任务命令。', {
          parameters: '由 Skill 定义',
          persistence: 'Skill 文件跨会话存在',
          status: '条件项',
        }),
        qwen: command('qwen', ['/workflows', '/<skill-name>', '/<command-name>', '/<workflow-name>'], '用户、项目和扩展 Skill 按 Skill 名注册；`commands/` 下的 Markdown/TOML 文件按路径注册；启用 Workflows 后，保存的 Workflow 也按名称注册。', {
          parameters: '由 Skill、命令文件或 Workflow 定义；Workflow 可接收 JSON 或纯文本参数',
          mode: 'Skill 与命令文件支持交互式、非交互式、ACP；保存的 Workflow 命令仅交互式',
          persistence: '定义文件跨会话存在，Workflow 运行状态属于相应会话',
          conditions: 'bare mode 不自动发现；项目命令和 Workflow 受 Folder Trust 约束；Workflow 还需启用功能开关',
          sources: ['qwen-skill-commands', 'qwen-file-commands', 'qwen-workflow-commands'],
        }),
        kimi: command('kimi', ['/<skill-name>'], 'Skills 参与 Slash 命令补全，未匹配的 Slash 文本会作为普通消息发送。', {
          parameters: '由 Skill 定义',
          persistence: 'Skill 文件跨会话存在',
          status: '条件项',
        }),
        qoder: command('qoder', ['/commands', '/<command-name>'], '管理并执行 Markdown + YAML 定义的自定义命令。', {
          parameters: '项目 `.qoder/commands/`；用户 `~/.qoder/commands/`',
          mode: '管理界面只在 TUI；Prompt 命令可用于 TUI 与 Headless',
          persistence: '命令文件跨会话存在',
        }),
      },
      related: ['cmd-skills', 'cmd-plugins', 'extension-custom-commands'],
    },

    'cmd-ide': {
      definition: '连接或配置 IDE/外部编辑器，并把打开文件、选择区或编辑器状态加入 CLI 上下文。',
      includes: ['IDE 连接状态', '安装或启停集成', '外部编辑器配置', '编辑器上下文'],
      excludes: ['IDE 插件的全部功能', 'LSP 功能矩阵', '桌面端会话迁移'],
      facts: [
        'Claude Code 和 Qwen Code 提供 `/ide`；Codex 对应命令是 `/ide-context`。',
        'Kimi Code `/editor` 配置由 Ctrl-G 调起的外部编辑器。',
        'Qoder CLI 命令表没有 IDE 连接命令，但 Qoder 产品另有 IDE Surface。',
      ],
      products: {
        claude: command('claude', ['/ide'], '管理 IDE 集成并显示连接状态。'),
        codex: command('codex', ['/ide-context'], '将 IDE 打开的文件、当前选择和其他编辑器上下文加入下一条提示。', {
          persistence: '影响下一条或当前会话上下文',
        }),
        qwen: command('qwen', ['/ide', '/editor'], '`/ide` 检查、安装、启用或禁用 IDE 集成；`/editor` 设置外部编辑器偏好。', {
          parameters: '`/ide status|install|enable|disable`',
          mode: '仅交互式',
          persistence: '集成和编辑器偏好跨会话保存',
        }),
        kimi: command('kimi', ['/editor'], '配置 Ctrl-G 调起的外部编辑器。', {
          conditions: '流式输出期间可使用',
          persistence: '编辑器偏好跨会话保存',
        }),
        qoder: unconfirmed('qoder', 'Qoder 产品提供 IDE Surface，但当前 CLI Slash 命令目录没有 IDE 连接命令。'),
      },
      related: ['cmd-remote', 'surface-ide', 'extension-ide'],
    },

    'cmd-github': {
      definition: '从 CLI 启动产品提供的 GitHub App、GitHub Actions 或云端仓库工作流配置。',
      includes: ['GitHub App 安装', 'GitHub Actions 初始化', '仓库连接', '所需外部工具'],
      excludes: ['普通 `gh` 命令调用', '创建 PR 的完整行为', '代码 Review 本身'],
      facts: [
        'Qwen Code 和 Qoder CLI 都提供 `/setup-github`。',
        'Claude Code 当前提供 `/install-github-app`，可选配置 Actions workflow 和 secrets。',
        'Codex 通过 Cloud/GitHub 连接工作流提供相关能力，当前 CLI 命令表没有 `/setup-github`。',
      ],
      products: {
        claude: command('claude', ['/install-github-app'], '为仓库安装 Claude GitHub App，并可继续设置 GitHub Actions workflow 与 secrets。', {
          persistence: '修改 GitHub 仓库 App 和 Actions 配置',
          conditions: '需要浏览器登录和仓库管理权限',
        }),
        codex: unconfirmed('codex', 'Codex 支持 GitHub 和 Cloud 工作流，但当前 CLI Slash 命令表未列出 GitHub 设置命令。'),
        qwen: command('qwen', ['/setup-github'], '设置 Qwen Code GitHub Actions 集成。', {
          mode: '仅交互式',
          persistence: '写入仓库 workflow 或相关配置',
        }),
        kimi: unconfirmed('kimi'),
        qoder: command('qoder', ['/setup-github'], '设置 Qoder GitHub Actions。', {
          mode: 'TUI',
          persistence: '写入仓库 GitHub Actions 配置',
        }),
      },
      related: ['cmd-review', 'execution-pr', 'cmd-remote'],
    },

    'cmd-collaboration': {
      definition: '用多模型、多 Agent 或编排工作流并行处理同一个任务，并汇总、选择或提交各自结果。',
      includes: ['第二模型顾问', '并行任务拆分', '模型竞赛', 'Swarm 和工作流编排'],
      excludes: ['单个 Subagent 管理', '普通后台 Shell', '模型质量比较'],
      facts: [
        '五家的协作入口语义不同，不能仅按命令名称判断等价。',
        'Claude Code `/batch` 会拆分为 5–30 个单元并使用隔离 Worktree。',
        'Qwen Code Arena 让多个模型执行同一任务，之后选择一个结果并合并其 Diff。',
        'Qwen Code `/batch` 是随产品提供的 Skill：发现文件、分块后使用并行执行 Agent 完成批量操作。',
      ],
      products: {
        claude: command('claude', ['/advisor [model|off]', '/batch <instruction>'], 'Advisor 在关键时刻咨询第二模型；Batch 将大型改动拆为并行 Worktree 子任务。', {
          parameters: 'advisor: `opus|sonnet|model-id|off`；batch: `<instruction>`',
          persistence: 'Advisor 为会话设置；Batch 创建后台 Agent、Worktree 和 PR',
          conditions: 'Batch 需要 Git 仓库',
        }),
        codex: command('codex', ['/agent'], '在并发 Agent 线程之间查看和切换；任务委派由主 Agent、项目指令或 Skill 触发。', {
          aliases: ['/subagents'],
          sources: ['codex-commands', 'codex-agents'],
        }),
        qwen: command('qwen', ['/arena start', '/arena status', '/arena select', '/arena stop', '/batch <operation> <file-pattern>'], 'Arena 让多个模型执行同一任务并选择结果；随产品提供的 `/batch` Skill 发现匹配文件、分块并交给并行执行 Agent。', {
          aliases: ['/arena choose'],
          parameters: 'Arena 使用相应子命令；Batch 使用 `<operation> <file-pattern>`',
          mode: 'Arena 仅交互式；`/batch` 支持交互式、非交互式和 ACP',
          persistence: 'Arena 运行属于当前会话；Arena select 和 Batch 任务可修改工作区',
          conditions: '`/batch` 在 bare mode 或被 Skill/Slash 禁用时不可用',
          sources: ['qwen-commands', 'qwen-bundled-skills'],
        }),
        kimi: command('kimi', ['/swarm on|off', '/swarm <task>'], '切换 Swarm 模式，或为单轮任务开启 Swarm 并在成功完成后自动关闭。', {
          parameters: '`on|off|<task>`',
          persistence: '模式属于当前会话',
          conditions: 'manual 权限模式下启动任务会询问是否切换到 auto 或 yolo',
        }),
        qoder: command('qoder', ['/quest'], '以 Prompt 工作流使用专用 Subagent 引导功能开发。', {
          mode: 'TUI 与 Headless',
          persistence: '运行状态属于当前任务',
          sources: ['qoder-commands', 'qoder-agents'],
        }),
      },
      related: ['cmd-agents', 'agent-background', 'agent-worktree'],
    },

    'cmd-remote': {
      definition: '把当前 CLI 会话迁移、暴露或继续到桌面端、Web、移动设备或云端运行环境。',
      includes: ['远程控制', '桌面端继续', 'Web 会话拉取', 'Cloud Mode'],
      excludes: ['IDE 上下文连接', '普通会话恢复', 'GitHub Actions 设置'],
      facts: [
        'Claude Code 提供 Remote Control、Teleport 和 Desktop 三类不同入口。',
        'Codex `/app` 把当前会话继续到 ChatGPT 桌面应用。',
        'Kimi Code `/web` 可选择运行中的 Web 实例，或启动 Web Server 后继续当前会话。',
      ],
      products: {
        claude: command('claude', ['/remote-control', '/teleport', '/desktop'], '暴露当前本地会话供远程控制、把 Web 会话拉到终端，或在 Desktop 继续当前会话。', {
          aliases: ['/rc', '/app'],
          persistence: '会话在对应 Surface 中继续',
          conditions: 'Remote Control 和 Desktop 需要相应订阅；Desktop 只在 macOS/Windows',
        }),
        codex: command('codex', ['/app'], '在 macOS 或 Windows 的 ChatGPT 桌面应用中继续当前会话。', {
          conditions: '需要支持的桌面平台和应用',
          persistence: '同一会话跨 Surface 继续',
        }),
        qwen: unconfirmed('qwen', 'Daemon、Web Shell 与 Channel 可提供远程 Surface，但当前内置命令目录没有统一远程迁移命令。'),
        kimi: command('kimi', ['/web'], '选择运行中的 Web 实例连接当前会话，或退出 TUI 后启动前台 Web Server。', {
          conditions: '流式输出期间可使用',
          persistence: '当前会话在 Web UI 中继续',
        }),
        qoder: unconfirmed('qoder', 'Qoder 提供 Remote Control 和 Cloud Mode 文档，但当前 Slash 命令目录没有独立远程控制命令。'),
      },
      related: ['cmd-ide', 'surface-remote-control', 'surface-cloud'],
    },
  };
})();

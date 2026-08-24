(() => {
  const rows = Object.fromEntries(
    window.matrixData.rows
      .filter((row) => row.category === 'subagents')
      .map((row) => [row.id, row]),
  );

  const profiles = {
    claude: {
      entry:
        '自然语言自动委派或点名；定义文件位于 Agent 目录，也可用 `--agents` 临时注入、用 `--agent` 作为会话主 Agent。',
      format: 'Markdown 正文 + YAML frontmatter；正文作为 Subagent 系统提示词。',
      scope:
        '组织托管、当前进程、项目、用户、插件五级来源；同名定义按官方优先级解析。',
      context:
        '命名 Subagent 使用独立上下文；接收自身系统提示词、基础环境信息和父 Agent 给出的任务。',
      isolation:
        '默认从主会话当前目录工作；`isolation: worktree` 可创建临时 Git Worktree。',
      limits:
        '可配置 `maxTurns`；官方 Subagent 字段表未列出单 Agent 超时字段。',
      conditions:
        '插件分发的 Agent 会忽略 `hooks`、`mcpServers`、`permissionMode`。',
      status: '官方确认',
      sources: ['claude-agents'],
    },
    codex: {
      entry:
        '直接要求 Codex 委派，或由项目指令、Skill 触发；CLI 用 `/agent` 查看和切换线程。',
      format: '独立 TOML 文件；`name`、`description`、`developer_instructions` 为核心字段。',
      scope:
        '项目级 `.codex/agents/` 与用户级 `~/.codex/agents/`；同名自定义 Agent 可覆盖内置定义。',
      context:
        '每个 Subagent 是独立线程；父线程负责委派、跟进、等待、关闭并汇总结果。',
      isolation:
        '继承父线程当前沙箱与审批策略；当前 Subagent 页面未列出每 Agent Worktree。',
      limits:
        '可配置每会话并发线程数；当前 Agent 文件字段未列出单 Agent 轮数和超时。',
      conditions:
        '父回合的实时沙箱和审批覆盖会在派生时重新应用。',
      status: '官方确认',
      sources: ['codex-agents'],
    },
    qwen: {
      entry:
        '使用 `/agents create`、`/agents manage` 管理；模型通过 Agent 工具按类型委派，也可显式点名。',
      format: 'Markdown 正文 + YAML frontmatter；正文作为命名 Agent 的系统提示词。',
      scope:
        '项目级 `.qwen/agents/`、用户级 `~/.qwen/agents/`、扩展 `agents/` 与内置定义。',
      context:
        '命名 Agent 从新上下文开始；Fork 继承父会话全部或最近若干个真实用户轮次。',
      isolation:
        'Agent 调用可传 `isolation: "worktree"`；Fork 与 Worktree 隔离互斥。',
      limits:
        '支持 `maxTurns`；配置只对超长 description 和系统提示词给软警告，未列出超时字段。',
      conditions:
        '`hooks` v1 在 Agent 运行期间按会话注册；`effort`、`skills`、`memory` 等 frontmatter 尚未落地。',
      status: '源码确认',
      sources: ['qwen-agents'],
    },
    kimi: {
      entry:
        '主 Agent 依据描述自动派发，也可在提示词中点名；`--agent-file` 可在启动时显式加载定义。',
      format: 'Markdown 正文 + YAML frontmatter；正文作为 Agent 系统提示词模板。',
      scope:
        '显式文件、项目、额外目录、用户、Plugin、内置六级来源；更具体的作用域优先。',
      context:
        '子 Agent 只接收任务描述，在独立上下文中工作，最后把完整结果返回主 Agent。',
      isolation:
        '当前 Agent 文档未列出每 Agent Worktree 隔离字段。',
      limits:
        '全局 `[subagent] timeout_ms` 限制单个 Agent 或 AgentSwarm 运行时间，默认 7200000 ms（2 小时）；main 分支起 AgentSwarm 改用独立 `[swarm] timeout_ms`（默认同为 7200000 ms、`0` 无超时，`KIMI_CODE_SWARM_TIMEOUT_MS` 覆盖），尚未发布；Agent 定义 frontmatter 无独立轮数或超时字段。',
      conditions:
        'Subagent 模型池为实验性功能，需 `KIMI_CODE_EXPERIMENTAL_SECONDARY_MODEL=1` 或 master flag `KIMI_CODE_EXPERIMENTAL_FLAG=1` 开启；开启后所有启动模式（包括 TUI）生效。默认 v2 引擎读取 `[secondary_model]` 模型池；`model_preference` 字段仅由旧版 `agent-core` 引擎（`KIMI_CODE_LEGACY_FLAG=1`）读取。',
      status: '官方确认',
      sources: ['kimi-agents', 'kimi-subagent-config'],
    },
    qoder: {
      entry:
        'TUI 用 `/agents` 管理、自然语言或 `@name` 调用；可用 `--agent` 作为会话 Agent，或用 `--agents` 临时注入。',
      format: '持久定义为 Markdown + YAML；`--agents` 接受当前进程有效的 JSON 对象。',
      scope:
        '内置、用户、项目、插件、命令行 Flag 五类来源；同名时 Flag 优先级最高。',
      context:
        '每个 Subagent 有独立上下文、系统提示词、工具注册表、Transcript 和压缩流程。',
      isolation:
        '`isolation: worktree` 在独立 Git Worktree 中运行；省略时使用默认工作区。',
      limits:
        '支持 `maxTurns` 与 `timeoutMins`，并可在 `settings.json` 中覆盖已发现 Agent 的运行限制。',
      conditions:
        '插件 Agent 会移除 `hooks`、`mcpServers`、`permissionMode`；只保留值为 `worktree` 的 isolation。',
      status: '官方确认',
      sources: ['qoder-agents'],
    },
  };

  function evidenceStatus(product, value) {
    if (value.includes('未确认') || value.includes('未列出')) return '未确认';
    if (
      value.includes('条件') ||
      value.includes('实验') ||
      value.includes('依配置') ||
      value.includes('依产品')
    ) {
      return '条件项';
    }
    return profiles[product].status;
  }

  function createDetail({
    id,
    definition,
    includes,
    excludes,
    facts,
    notes,
    related,
    overrides = {},
  }) {
    const row = rows[id];
    if (!row) throw new Error(`Unknown Subagent capability: ${id}`);

    return {
      definition,
      includes,
      excludes,
      facts,
      products: Object.fromEntries(
        window.matrixData.products.map((product) => {
          const base = profiles[product.id];
          const note =
            typeof notes[product.id] === 'string'
              ? { behavior: notes[product.id] }
              : notes[product.id];
          const extra = overrides[product.id] ?? {};
          return [
            product.id,
            {
              value: row.values[product.id],
              entry: base.entry,
              format: base.format,
              behavior: note.behavior,
              scope: note.scope ?? base.scope,
              inheritance: note.inheritance ?? base.context,
              isolation: note.isolation ?? base.isolation,
              limits: note.limits ?? base.limits,
              conditions: note.conditions ?? base.conditions,
              status:
                extra.status ?? evidenceStatus(product.id, row.values[product.id]),
              sources: extra.sources ?? base.sources,
            },
          ];
        }),
      ),
      related,
    };
  }

  Object.assign(window.capabilityDetails, {
    'agent-builtins': createDetail({
      id: 'agent-builtins',
      definition:
        '产品随 CLI 一起提供、无需用户先创建即可由主 Agent 调用的 Subagent 类型。',
      includes: ['默认通用 Agent', '只读探索或计划 Agent', '按模式出现的辅助 Agent'],
      excludes: ['用户创建的 Agent', '插件分发的 Agent', 'Agent Team 或 Swarm 的完整编排'],
      facts: [
        'Claude Code、Codex、Qwen Code、Kimi Code 与 Qoder CLI 都随产品提供至少一种内置 Subagent。',
        '名称相近不代表工具边界一致；每家对探索、计划和执行型 Agent 的默认工具集分别定义。',
      ],
      notes: {
        claude:
          '内置 Explore 只读搜索代码，Plan 为计划模式收集上下文，general-purpose 可执行多步骤任务；另有按命令触发的辅助 Agent。',
        codex:
          '`default` 是通用回退，`worker` 面向实现与修复，`explorer` 面向只读代码库探索。',
        qwen:
          '`general-purpose` 是默认通用 Agent；`Explore` 使用只读搜索工具。另有按功能注册的辅助 Agent。',
        kimi:
          '`coder` 可读写和执行命令，`explore` 只读，`plan` 不提供 Shell 并专注规划。',
        qoder:
          '`general-purpose` 是默认研究 Agent，`Explore` 只读，`Plan` 负责计划；部分辅助 Agent 只在特定模式出现。',
      },
      related: ['agent-auto', 'agent-tools', 'agent-nesting'],
    }),

    'agent-config': createDetail({
      id: 'agent-config',
      definition:
        '持久或临时 Agent 定义采用的载体、语法，以及系统提示词和运行字段的组织方式。',
      includes: ['配置文件类型', 'Frontmatter 或 TOML 字段', '命令行临时定义格式'],
      excludes: ['具体目录优先级', '每个字段的运行语义', '全局产品设置格式'],
      facts: [
        'Claude Code、Qwen Code、Kimi Code 与 Qoder CLI 都以 Markdown 正文保存系统提示词。',
        'Codex 使用 TOML；Claude Code 与 Qoder CLI 还提供 JSON 形式的进程级临时 Agent 定义。',
      ],
      notes: {
        claude:
          '文件用 YAML frontmatter 声明字段，Markdown 正文作为系统提示词；`--agents` JSON 用 `prompt` 代替正文。',
        codex:
          'TOML 中直接声明名称、描述、开发者指令及支持的 `config.toml` 键。',
        qwen:
          'YAML frontmatter 声明模型、权限、工具和兼容字段，Markdown 正文作为系统提示词。',
        kimi:
          'YAML frontmatter 声明选择条件和工具；Markdown 正文支持 `${var}` 模板变量。',
        qoder:
          'Markdown 文件覆盖完整字段；`--agents` JSON 仅覆盖当前 JSON schema 支持的字段。',
      },
      related: ['agent-project-scope', 'agent-user-scope', 'agent-limits'],
    }),

    'agent-project-scope': createDetail({
      id: 'agent-project-scope',
      definition:
        '把 Agent 定义放入仓库，使其只在当前项目生效并能随版本控制共享。',
      includes: ['项目目录', '仓库共享', '项目级同名覆盖'],
      excludes: ['个人跨项目目录', '插件目录', '组织托管配置'],
      facts: [
        '五家都提供仓库内的项目级 Agent 目录。',
        'Kimi Code 同时扫描产品专属目录和通用 `.agents/agents/` 目录。',
      ],
      notes: {
        claude:
          '从当前目录向仓库根扫描 `.claude/agents/`，嵌套目录中离工作目录更近的同名定义优先。',
        codex: '项目 Agent 放在 `.codex/agents/*.toml`，只对当前项目生效。',
        qwen: '项目 Agent 放在 `.qwen/agents/*.md`，优先于用户和扩展 Agent。',
        kimi:
          '项目根下扫描 `.kimi-code/agents/` 与 `.agents/agents/`，项目定义优先于额外目录和用户定义。',
        qoder:
          '项目 Agent 放在 `.qoder/agents/*.md`，可纳入版本控制并依赖文件夹信任。',
      },
      related: ['agent-user-scope', 'agent-config', 'agent-auto'],
    }),

    'agent-user-scope': createDetail({
      id: 'agent-user-scope',
      definition:
        '把 Agent 定义保存在用户目录，使同一用户的多个项目可以重复使用。',
      includes: ['用户目录', '跨项目可见性', '用户级同名解析'],
      excludes: ['团队共享目录', '组织强制配置', '云端账号同步'],
      facts: [
        '五家都提供用户级 Agent 定义目录。',
        '用户级定义通常低于项目级定义；具体同名优先级仍以各产品规则为准。',
      ],
      notes: {
        claude:
          '`~/.claude/agents/` 递归扫描，面向当前用户所有项目；项目定义的优先级更高。',
        codex: '`~/.codex/agents/*.toml` 为个人 Agent，项目同名 Agent 可覆盖它。',
        qwen: '`~/.qwen/agents/*.md` 为用户级回退来源，低于项目 Agent。',
        kimi:
          '扫描 `$KIMI_CODE_HOME/agents/` 与 `~/.agents/agents/`；产品目录可随 `KIMI_CODE_HOME` 移动。',
        qoder: '`~/.qoder/agents/*.md` 对当前用户的所有项目生效。',
      },
      related: ['agent-project-scope', 'agent-config', 'agent-auto'],
    }),

    'agent-auto': createDetail({
      id: 'agent-auto',
      definition:
        '主 Agent 根据任务内容与 Agent 描述，在用户未指定名称时选择并派发 Subagent。',
      includes: ['自动匹配依据', '描述字段', '项目或 Skill 指令'],
      excludes: ['用户显式点名', '模型路由质量评价', '并发调度算法细节'],
      facts: [
        '五家都允许主 Agent 在满足自身调度规则时自动委派。',
        '自定义 Agent 的 `description` 是最普遍的选择依据；Kimi Code另有 `whenToUse`。',
      ],
      notes: {
        claude:
          'Claude 读取 `description` 判断何时委派；清晰的使用条件直接影响自动选择。',
        codex:
          '本地 Codex 在直接请求或适用的项目、Skill 指令下派生 Agent；自动程度还受运行档位影响。',
        qwen:
          '主模型结合任务描述、Agent `description`、当前上下文和可用工具选择命名 Agent。',
        kimi:
          '主 Agent 同时读取 `description` 与可选的 `whenToUse`；内置类型也按任务形态选择。',
        qoder:
          'Qoder CLI 使用 `description` 参与选择；未指定类型时 Agent 工具默认使用 `general-purpose`。',
      },
      related: ['agent-explicit', 'agent-builtins', 'agent-background'],
    }),

    'agent-explicit': createDetail({
      id: 'agent-explicit',
      definition:
        '用户在提示词、命令或启动参数中指定要使用的 Agent，而不是让主 Agent 自行选择。',
      includes: ['自然语言点名', '@ 提及', '会话 Agent 启动参数'],
      excludes: ['自动委派', 'Agent 文件创建', '后台任务查看'],
      facts: [
        '五家都接受自然语言点名 Agent。',
        'Qoder CLI 额外支持 TUI `@name`；Claude Code 与 Qoder CLI 可把已加载定义作为整个会话的主 Agent。',
      ],
      notes: {
        claude:
          '提示词可要求使用某个 Subagent；`claude --agent <name>` 让该定义成为当前会话主 Agent。',
        codex:
          '在提示词中明确要求派生指定角色；CLI 的 `/agent` 用于切换和检查已运行线程。',
        qwen:
          '提示词直接点名配置中的 Agent；Agent 工具调用可显式传 `subagent_type`。',
        kimi:
          '提示词中点名内置或自定义 Agent；`--agent-file` 显式加载并启动指定定义。',
        qoder:
          'TUI 支持自然语言和 `@name`；`--agent <name>` 将定义作为会话主 Agent。',
      },
      related: ['agent-auto', 'agent-result', 'agent-background'],
    }),

    'agent-context': createDetail({
      id: 'agent-context',
      definition:
        'Subagent 是否拥有独立于主会话的上下文窗口、消息历史和压缩流程。',
      includes: ['独立对话历史', '系统提示词边界', '上下文压缩'],
      excludes: ['初始传入哪些消息', '结果如何回传', '持久记忆'],
      facts: [
        '五家命名 Subagent 都把中间搜索和工具输出放在独立上下文中。',
        'Qwen Code 另有 Fork：它仍是独立运行，但起点可继承父会话历史。',
      ],
      notes: {
        claude:
          '每个 Subagent 有独立上下文窗口；中间输出不进入主会话，只返回最后结果。',
        codex:
          '每个 Subagent 使用独立线程；父线程能打开、跟进和汇总，但不会把全部子线程日志并入主历史。',
        qwen:
          '命名 Agent 有独立历史；Fork 复制父上下文前缀后在独立后台运行。',
        kimi:
          '子 Agent 在自己的上下文中工作，中间思考和工具记录不混入主 Agent 历史。',
        qoder:
          'Subagent 有独立上下文、Transcript 与压缩流程，中间搜索和推理不直接进入主会话。',
      },
      related: ['agent-initial-context', 'agent-result', 'agent-memory'],
    }),

    'agent-initial-context': createDetail({
      id: 'agent-initial-context',
      definition:
        'Subagent 启动时收到的任务、系统提示词、父会话历史和环境信息范围。',
      includes: ['任务描述', '父会话历史继承', '预加载指令'],
      excludes: ['执行后的结果', '持久记忆目录', '工具权限'],
      facts: [
        '命名 Agent 通常以任务描述和自身系统提示词启动，不自动复制完整父会话。',
        'Claude Code 自 v2.1.232 起在交互会话默认开启 Fork 模式：Fork 继承派生时刻的完整父对话并共享主会话提示词缓存；`-p` 非交互与 Agent SDK 默认关闭。',
        'Qwen Code Fork 可继承全部父历史或最近若干个真实用户轮次。',
        'Kimi Code 在 v2 引擎合入实验性 `fork` 参数（合入 main 尚未发布）：`Agent`/`AgentSwarm` 传 `fork: true` 时以调用方对话历史快照启动子 Agent，需 `KIMI_CODE_EXPERIMENTAL_SUBAGENT_FORK` 等实验开关。',
      ],
      notes: {
        claude: {
          behavior:
            '命名 Subagent 从 Claude 撰写的委派任务摘要、自身定义的系统提示词和基础环境信息启动，不复制完整 Claude Code 系统提示词。Claude 也可通过 Agent 工具请求 `fork` 类型派生 Fork，用户可用 `/subtask` 加任务直接启动 Fork（不受 Fork 模式开关限制）；Fork 自身的工具调用不进入主会话，只有最终结果作为消息返回主会话。',
          inheritance:
            '命名 Subagent 使用独立上下文。Fork 继承派生时刻主会话的全部对话，系统提示词、工具与模型和主会话相同，首个请求复用主会话提示词缓存。',
          conditions:
            '插件分发的 Agent 会忽略 `hooks`、`mcpServers`、`permissionMode`。Fork 模式在交互会话默认开启（v2.1.232 起），`-p` 非交互与 Agent SDK 默认关闭；`CLAUDE_CODE_FORK_SUBAGENT=1` 对非交互与 SDK 也开启，`=0` 在所有会话类型关闭。',
        },
        codex:
          '父线程提供委派描述，并由 Agent 文件的 `developer_instructions` 定义角色行为。',
        qwen:
          '命名 Agent 从任务提示和自身系统提示词开始；Fork 用 `fork_turns` 选择全部或最近若干轮。',
        kimi: {
          behavior:
            '默认子 Agent 只接收主 Agent 给出的任务描述和自身 profile，不继承完整主历史。v2 引擎合入实验性 `fork` 参数：`Agent` 与 `AgentSwarm` 传 `fork: true` 时，子 Agent 以调用方已完成对话的一次性快照启动，继承调用方的 Agent 类型、工具集与模型，提示词只需任务本身；快照中仍在执行的工具调用会补一条合成结果，注明结果未知、不要假设成败也不要等待。',
          inheritance:
            '默认只接收任务描述。`fork: true` 继承调用方对话历史快照，快照是一次性参考资料，新 Agent 独立运行而不是调用方的续写；`resume` 不能与 `fork` 同时使用，`subagent_type` 必须与调用方自身类型一致，`model` 只接受调用方自身模型或 `primary`，其余取值会被拒绝。',
          conditions:
            '`fork` 为实验功能，默认关闭：需 `KIMI_CODE_EXPERIMENTAL_SUBAGENT_FORK=true` 或 config.toml `[experimental]` 下 `subagent_fork = true`，master flag `KIMI_CODE_EXPERIMENTAL_FLAG=1` 也会启用；开关关闭时传 `fork` 报 `fork is disabled: the subagent_fork experimental flag is off.`。仅 v2 引擎（agent-core-v2）实现，合入 main 尚未发布；官方 Agents 文档页尚未同步。',
        },
        qoder:
          '普通 Subagent 接收任务描述；`initialPrompt` 只在定义通过 `--agent` 作为会话 Agent 时自动提交。',
      },
      related: ['agent-context', 'agent-skills', 'agent-result'],
      overrides: {
        claude: { sources: ['claude-agents', 'claude-subagent-fork-v232'] },
        kimi: {
          sources: [
            'kimi-agents',
            'kimi-subagent-config',
            'kimi-subagent-fork-commit',
            'kimi-subagent-fork-changeset',
            'kimi-subagent-fork-env',
          ],
        },
      },
    }),

    'agent-result': createDetail({
      id: 'agent-result',
      definition:
        'Subagent 完成或失败后，把结论、状态或通知交回主会话的方式。',
      includes: ['同步结果', '完成通知', '父线程汇总'],
      excludes: ['完整中间 Transcript', '持久记忆', 'PR 或文件交付格式'],
      facts: [
        '五家普通 Subagent 最终都向父会话提供结果。',
        '前台调用通常直接返回；后台调用通过完成通知或父线程等待后汇总。',
      ],
      notes: {
        claude:
          '前台 Subagent 完成后直接返回结果；后台 Subagent 完成后向主会话发送通知。',
        codex:
          '父线程等待所需结果后给出合并答复，也可打开单个子线程查看详情。',
        qwen:
          '后台命名 Agent 通过完成通知回传；前台命名 Agent inline 返回；Fork 独立展示且不按普通命名 Agent 路径回传。',
        kimi:
          '子 Agent 的最后一条消息作为完整交付返回主 Agent；自定义 Agent 需在正文中明确这一要求。',
        qoder:
          'Subagent 完成明确子任务后把结果返回主会话；后台模式在稍后通知。',
      },
      related: ['agent-background', 'agent-context', 'agent-explicit'],
    }),

    'agent-background': createDetail({
      id: 'agent-background',
      definition:
        'Subagent 是否能与主会话并发执行，以及前台等待和后台通知的控制方式。',
      includes: ['前台等待', '后台运行', '并行派发'],
      excludes: ['普通 Shell 后台进程', '多会话云任务', 'Swarm 的内部算法'],
      facts: [
        '五家都能并行处理独立子任务，但默认前后台策略和显式开关不同。',
        'Claude Code 自 v2.1.232 起在交互会话默认开启 Fork 模式：Fork 与命名 Subagent 一律后台运行，Claude 不能请求前台。',
        '后台 Agent 的审批、完成通知和恢复能力必须分别核对，不能只按“支持后台”推断。',
      ],
      notes: {
        claude: {
          behavior:
            '前台会阻塞主会话；后台与主会话并发。Fork 模式开启时（交互会话自 v2.1.232 起默认开启），Fork 与命名 Subagent 一律后台运行，Claude 不能请求前台；Fork 模式关闭时默认后台，Claude 在需要先拿到结果时改用前台，frontmatter `background: true` 可把指定 Subagent 固定在后台。',
          conditions:
            '`CLAUDE_CODE_DISABLE_BACKGROUND_TASKS=1` 在所有会话类型与 Fork 模式状态下强制前台；进程内 Agent Team 队友派生的 Subagent 固定前台运行。后台命名 Subagent 的权限提示出现在主会话，Fork 的权限提示出现在终端。插件分发的 Agent 会忽略 `hooks`、`mcpServers`、`permissionMode`。',
        },
        codex:
          '支持多个并发 Agent 线程；父线程可等待全部结果，也可在 CLI 中切换查看。',
        qwen:
          '顶层命名 Agent 默认后台；`run_in_background: false` 改为前台。Fork 始终 detached。',
        kimi:
          '主 Agent 可并行派发子 Agent；coder 会等待自己启动的后台任务都结束后才报告完成。',
        qoder:
          '`background` 控制默认后台行为，但需要启用后台 Subagent 会话；独立任务可并行派发。',
      },
      related: ['agent-result', 'agent-limits', 'agent-context'],
      overrides: {
        claude: { sources: ['claude-agents', 'claude-subagent-fork-v232'] },
      },
    }),

    'agent-model': createDetail({
      id: 'agent-model',
      definition:
        '为单个 Agent 指定不同于主会话的模型、模型别名或模型选择策略。',
      includes: ['模型字段', '继承主模型', '跨 Provider 或主/备模型策略'],
      excludes: ['推理强度', '模型价格', '全局默认模型'],
      facts: [
        '五家都提供某种 Agent 级模型选择，但字段取值与生效 Surface 不同。',
        '省略模型字段时，Claude Code、Codex、Qwen Code 与 Qoder CLI 都有继承主会话模型的路径。',
        'Kimi Code 0.36.0（2026-08-13 发布）起，v2 引擎由单一次主力模型改为声明式 Subagent 模型池；`model_preference` 字段仅由旧版引擎读取。',
      ],
      notes: {
        claude:
          '`model` 接受模型别名、完整模型 ID 或 `inherit`；环境变量和每次调用参数可覆盖文件值。',
        codex:
          'Agent TOML 可设置任意受支持的 `model`，显式 spawn 值还能覆盖默认 Subagent 模型。',
        qwen:
          '`model` 支持 `inherit`、`fast`、模型 ID、`authType:modelId` 和 `modelGrades` 名称。Grade 在 `settings.json` 的 `agents.modelGrades` 中定义，可用 `agents.allowedGrades` 限制；Fork 和命名 Teammate 不接受 grade；Agent 定义中的显式 `model` 优先于 grade。`agents.builtin.exploreModel` 可单独覆盖内置 Explore Agent 的模型。',
        kimi:
          '0.36.0 起 v2 引擎使用声明式模型池：`[secondary_model] default_model` 是派生默认模型（配置 `[secondary_model.models]` 时必填且必须是其中的 key；单独写下它等价于只含它一个条目的池）；`[secondary_model.models]` 是别名 → 描述表，别名为 `[models]` 已配置条目；`force = true` 移除 `model` 参数并把所有子 Agent 固定到 `default_model`。派生时显式传入的 `model` 接受池别名或保留值 `"primary"`，解析顺序为显式 `model` → `default_model`；`"primary"` 连模型带 thinking 档位继承调用方，池别名不带显式档位，按全局 `[thinking]` 配置 → 所绑定模型的默认 effort 解析。遗留配方键 `[secondary_model] model` 仍被 v2 兼容读取，优先级低于 `default_model`。`model_preference` frontmatter 仅由旧版 `agent-core` 引擎（`KIMI_CODE_LEGACY_FLAG=1`）读取，默认 v2 引擎忽略。配置错误不做静默回退：`default_model` 缺失、别名无法解析、保留字 `primary` 用作池 key 或 `force` 误用时，会话创建、恢复与 fork 在启动时直接失败；工具调用传入的 `model` 既不是池别名也不是 `"primary"` 时本次派生报错并列出可选值。实验性，需 `KIMI_CODE_EXPERIMENTAL_SECONDARY_MODEL=1` 或 master flag `KIMI_CODE_EXPERIMENTAL_FLAG=1`；关闭时池配置不生效、`model` 参数不出现，子 Agent 继承调用方模型。',
        qoder:
          '`model` 接受具体模型或 `inherit`、`auto`、`lite`、`efficient`、`performance` 等别名。',
      },
      related: ['agent-effort', 'agent-config', 'model-switch'],
      overrides: {
        kimi: {
          sources: [
            'kimi-agents',
            'kimi-subagent-config',
            'kimi-subagent-model-pool-commit',
            'kimi-v036-release',
          ],
        },
      },
    }),

    'agent-effort': createDetail({
      id: 'agent-effort',
      definition:
        '为单个 Agent 覆盖主会话的推理强度、思考档位或推理预算。',
      includes: ['Agent 级 effort 字段', '继承规则', '可用取值', '派生 Agent 的全局默认 effort'],
      excludes: ['模型选择', '温度', '全局推理设置'],
      facts: [
        'Claude Code、Codex 与 Qoder CLI 提供明确的 Agent 级推理强度字段。',
        'Codex 另有 config.toml 的 `agents.default_subagent_reasoning_effort`，为派生 Agent 设置全局默认推理强度。',
        'Qwen Code 和 Kimi Code 当前 Agent 文档未确认独立 effort 字段；Qwen Code 把 `effort` 列为尚未落地的兼容字段。',
      ],
      notes: {
        claude:
          '`effort` 覆盖会话 effort，可用档位为 `low`、`medium`、`high`、`xhigh`、`max`，具体取决于模型；省略时继承会话 effort；v2.1.198 起扩展思考配置也继承主会话。官方未列出 Subagent 全局默认 effort 设置。',
        codex:
          '`model_reasoning_effort` 可写入 Agent TOML；Agent 文件设置 `model` 或 `model_reasoning_effort` 时文件值优先。否则 Codex 按显式 spawn 值、`[agents]` 默认值、父会话值的顺序独立解析，`agents.default_subagent_reasoning_effort` 是派生 Agent 的全局默认，显式 spawn effort 优先于该默认。spawn 切换模型且没有显式或配置的 effort 时，使用该模型的默认 effort。取值：Subagent 页列出 `ultra`、`max`、`xhigh`、`high`、`medium`、`low`；配置参考 `model_reasoning_effort` 条目列出 `minimal | low | medium | high | xhigh`（Responses API，`xhigh` 依模型而定）。',
        qwen:
          '当前 Agent 文档把 `effort` 列为尚未落地的 Claude Code 兼容字段，需模型层参数等前置基础设施后随后续版本引入；模型 grade 和 `model` 选择不等同于推理强度。',
        kimi:
          '模型池与 `model_preference` 选择的是模型，不是独立 reasoning effort；v2 中绑定池别名不携带显式 thinking 档位，按全局 `[thinking]` 配置 → 所绑定模型的默认 effort 解析；当前 Agent 字段表仍未列出独立 effort 字段。',
        qoder:
          '`effort` 接受 `low`、`medium`、`high`、`xhigh`、`max` 或正整数预算；文档未说明省略时的继承行为，settings.json 覆盖 schema 不含 effort 键。',
      },
      related: ['agent-model', 'cmd-effort', 'agent-limits'],
      overrides: {
        codex: { sources: ['codex-agents', 'codex-config-reference'] },
      },
    }),

    'agent-tools': createDetail({
      id: 'agent-tools',
      definition:
        '用允许列表限制单个 Agent 能看到和调用的内置工具、MCP 工具与 Agent 工具。',
      includes: ['工具 allowlist', '省略字段时的继承', 'MCP 工具名称', 'Fork 调用时工具限制'],
      excludes: ['工具 denylist', '审批策略', '网络沙箱'],
      facts: [
        'Claude Code、Qwen Code、Kimi Code 与 Qoder CLI 都有明确的 Agent `tools` 字段。',
        'Codex 当前 Subagent 文档主要通过父工具面、沙箱、MCP 和 Skill 配置塑造能力，未列出独立 `tools` allowlist。',
        'Qwen Code 另有 `fork_tools`：调用 Fork 时传入的执行限制，不改变模型可见的工具声明，未匹配的工具调用在调度或审批前被拒绝。',
        'Claude Code Fork 跳过所有工具过滤器，直接获得主会话的完整工具池；其他产品当前未确认等价的 Fork 调用时工具限制。',
      ],
      notes: {
        claude:
          '`tools` 省略时继承 Subagent 可用工具；可列内置工具、MCP 工具或 `Agent(name)`。Fork 跳过工具过滤器，获得主会话完整工具池。',
        codex:
          'Subagent 使用父会话可用工具，并由 Agent 的沙箱、MCP、Skill 配置收窄；独立 `tools` 字段未在当前 schema 中列出。',
        qwen:
          '`tools` 省略时继承父会话可用工具；显式列表同时约束内置工具和 MCP 工具。Fork 可传 `fork_tools` 数组限制实际执行的工具，接受精确工具名、`mcp__server` 和 `mcp__server__tool_*` 等模式；省略时不限制，空数组拒绝全部。`fork_tools` 不改变模型可见的工具声明以保持 prompt cache 前缀，未匹配的调用在调度或审批前被拒绝。这是调用方提供的每次调用限制，不是管理员强制的安全沙箱。',
        kimi:
          '`tools` 支持 YAML 列表或逗号字符串；省略或 `*` 表示全部，空列表表示禁用全部。',
        qoder:
          '`tools` 支持字符串或数组，并可用 `Agent(Explore, Plan)` 只允许指定下级 Agent。',
      },
      related: ['agent-deny-tools', 'agent-mcp', 'agent-permission'],
    }),

    'agent-deny-tools': createDetail({
      id: 'agent-deny-tools',
      definition:
        '从继承或允许的工具集合中删除指定工具，形成单个 Agent 的禁止列表。',
      includes: ['工具 denylist', '与 allowlist 的计算顺序', '禁止 Agent 工具'],
      excludes: ['权限审批规则', '网络访问控制', 'MCP Server 连接配置'],
      facts: [
        'Claude Code、Qwen Code、Kimi Code 与 Qoder CLI 都提供 `disallowedTools`。',
        'Codex 当前 Agent 文件 schema 未列出对应 denylist 字段。',
      ],
      notes: {
        claude:
          '`disallowedTools` 删除继承或指定工具；与 `tools` 同时出现时，被禁止的工具不会恢复。',
        codex:
          '当前 Subagent Agent 文件字段未列出 `disallowedTools`；可通过只读沙箱等配置限制行为。',
        qwen:
          '`disallowedTools` 在 `tools` allowlist 之后删除工具，并支持 MCP Server 级模式。',
        kimi:
          '`disallowedTools` 在 `tools` 之后应用；工具名精确匹配，MCP 使用 glob。',
        qoder:
          '`disallowedTools` 在工具注册后应用；禁止 `Agent` 可完全停止继续派发。',
      },
      related: ['agent-tools', 'agent-nesting', 'agent-mcp'],
    }),

    'agent-mcp': createDetail({
      id: 'agent-mcp',
      definition:
        '为单个 Agent 追加、覆盖或过滤 MCP Server 与 MCP 工具的可见范围。',
      includes: ['Agent 级 MCP 配置', 'MCP 工具过滤', '内联 Server 定义'],
      excludes: ['全局 MCP 安装', 'MCP 协议对比', '普通内置工具'],
      facts: [
        'Claude Code、Codex、Qwen Code 与 Qoder CLI 都有 Agent 级 MCP 配置入口。',
        'Kimi Code 通过 `tools` 中的 MCP glob 控制可用工具，当前 Agent 字段表未列出独立 Server 配置。',
      ],
      notes: {
        claude:
          '`mcpServers` 可引用已配置 Server 或内联定义；`tools` 和 `disallowedTools` 继续过滤工具。',
        codex:
          'Agent TOML 可包含 `[mcp_servers.<name>]`，为该 Agent 配置独立 MCP 连接。',
        qwen:
          '`mcpServers` 与会话 MCP 合并，同名 Agent 配置优先；`tools` 和 `disallowedTools` 再决定可见工具。',
        kimi:
          '`tools`、`disallowedTools` 通过 `mcp__server__*` 等 glob 限制 MCP 工具；未列出 per-Agent Server 定义。',
        qoder:
          '`mcpServers` 支持引用现有 Server 或内联 stdio、HTTP、SSE 等连接，再由工具列表过滤。',
      },
      related: ['agent-tools', 'agent-deny-tools', 'extension-mcp'],
    }),

    'agent-skills': createDetail({
      id: 'agent-skills',
      definition:
        '在 Agent 启动时预载指定 Skills，或限制该 Agent 可以调用的 Skills 集合。',
      includes: ['预载 Skill 内容', 'Agent 级 Skill 配置', '运行时调用'],
      excludes: ['Skill 文件格式', '插件安装', '普通系统提示词'],
      facts: [
        'Claude Code 支持预载 `skills`，Codex 支持 `skills.config`，Qoder CLI 支持 Agent 级 `skills`。',
        'Qwen Code 和 Kimi Code 的 Agent 可通过工具调用 Skill，但当前 Agent 文件未确认独立预载字段。',
      ],
      notes: {
        claude:
          '`skills` 在启动时把完整 Skill 内容注入上下文；未列出的可调用 Skill 仍可通过 Skill 工具使用。',
        codex:
          'Agent TOML 可包含 `[[skills.config]]`，为该 Agent 提供 Skill 配置。',
        qwen:
          '命名 Agent 可在其工具池包含 Skill 工具时调用现有 Skill；`skills` frontmatter 尚未落地。',
        kimi:
          '内置 coder 可调用 Agent Skills；当前 Agent frontmatter 表未列出独立 `skills` 预载字段。',
        qoder:
          '`skills` 接受字符串或数组，用于限制该 Subagent 可使用的 Skills。',
      },
      related: ['agent-tools', 'extension-skills', 'agent-initial-context'],
    }),

    'agent-hooks': createDetail({
      id: 'agent-hooks',
      definition:
        '在单个 Agent 的生命周期或工具调用节点执行专属 Hook。',
      includes: ['Agent frontmatter hooks', '工具调用事件', '启动与停止事件'],
      excludes: ['全局 Hooks', '插件安装脚本', '普通 Shell 命令'],
      facts: [
        'Claude Code、Qwen Code 与 Qoder CLI 都提供 Agent `hooks` 字段。',
        'Kimi Code frontmatter 仅含 `name`、`description`、`whenToUse`、`override`、`model_preference`、`tools`、`disallowedTools`、`subagents`，未知字段被忽略；Hooks 只在 `config.toml` 全局配置。',
        'Codex Subagent 文档列出 `model`、`model_reasoning_effort`、`sandbox_mode`、`mcp_servers`、`skills.config` 等键，未列独立 Hooks；Hooks 由全局 `/hooks` 管理。',
      ],
      notes: {
        claude:
          '`hooks` 可定义该 Subagent 的生命周期 Hook；插件 Agent 中该字段被忽略。',
        codex:
          '产品支持全局 Hooks（`/hooks`、config.toml `[hooks]`，当前仅 command 执行）；Subagent 自定义 Agent 文档列出 `model`、`model_reasoning_effort`、`sandbox_mode`、`mcp_servers`、`skills.config` 等键，未列独立 per-Agent Hooks 字段。',
        qwen:
          '`hooks` 在 Agent 运行时注册、结束后移除；v1 的匹配事件会影响同会话并发 Agent。',
        kimi:
          'frontmatter 仅支持 `name`、`description`、`whenToUse`、`override`、`model_preference`、`tools`、`disallowedTools`、`subagents`，未知字段被忽略；无独立 Hooks 字段。Hooks 由 `config.toml` 全局配置，可在子 Agent 完成等节点触发本地脚本。',
        qoder:
          '`hooks` 作用于 Subagent 会话，支持工具、启动、停止、通知等事件和多种 Hook 类型。',
      },
      related: ['agent-config', 'extension-hooks', 'agent-background'],
    }),

    'agent-memory': createDetail({
      id: 'agent-memory',
      definition:
        '为单个 Agent 配置跨会话保留的专属记忆目录或记忆作用域。',
      includes: ['Agent 级持久记忆', 'user、project、local 作用域', '跨会话保留'],
      excludes: ['当前线程 Transcript', '主产品全局记忆', '上下文压缩'],
      facts: [
        'Claude Code 与 Qoder CLI 明确提供 Agent `memory` 字段。',
        'Codex、Qwen Code 与 Kimi Code 当前 Agent 字段表未确认等价的独立持久记忆字段。',
      ],
      notes: {
        claude:
          '`memory` 可选 `user`、`project`、`local`，为该 Agent 建立跨会话目录。',
        codex:
          'Codex 产品有 Memories，但当前 Subagent Agent 文件 schema 未列出 Agent 独立 memory 字段。',
        qwen:
          'Qwen Code 有产品级记忆能力；当前 Subagent frontmatter 的 `memory` 尚未落地。',
        kimi:
          '会话可保留 Agent 运行状态，但当前 Agent 文件字段未列出跨任务持久 `memory`。',
        qoder:
          '`memory` 可选 `user`、`project`、`local`；只有启用全局自动记忆时才生效。',
      },
      related: ['agent-context', 'session-memory', 'agent-config'],
    }),

    'agent-permission': createDetail({
      id: 'agent-permission',
      definition:
        '为单个 Agent 指定审批或沙箱模式，并说明它与父会话实时权限的合并关系。',
      includes: ['Agent 级权限字段', '父模式继承', '更宽松模式的优先级'],
      excludes: ['工具 allowlist', '文件夹信任', '网络访问规则'],
      facts: [
        'Claude Code、Codex、Qwen Code 与 Qoder CLI 都能在 Agent 层声明或覆盖部分权限设置。',
        '父会话的实时权限仍是上层边界；Agent 文件不能据此绕过组织或运行时策略。',
      ],
      notes: {
        claude:
          '`permissionMode` 可选 default、acceptEdits、auto、dontAsk、bypassPermissions、plan 等模式。',
        codex:
          'Agent TOML 可设 `sandbox_mode`；父回合的实时沙箱和审批选择会在派生时重新应用。',
        qwen:
          '`approvalMode` 或兼容的 `permissionMode` 控制审批；父会话 yolo、auto-edit 或 plan 会优先。',
        kimi:
          '自定义 Agent 字段表没有独立权限模式；子 Agent 继续受主会话权限层控制。',
        qoder:
          '`permissionMode` 控制 Agent 工具审批；省略则继承父模式，宽松父模式不会被子配置收紧。',
      },
      related: ['agent-tools', 'security-approval', 'security-plan'],
    }),

    'agent-nesting': createDetail({
      id: 'agent-nesting',
      definition:
        '一个 Subagent 是否还能派生下一层 Agent，以及如何限定可派生的类型。',
      includes: ['嵌套派生', '深度上限', 'Agent 类型 allowlist'],
      excludes: ['父会话并行', 'Agent Team 通信', '普通任务列表'],
      facts: [
        'Claude Code、Qwen Code 命名 Agent 与 Qoder CLI 存在嵌套派生路径；Kimi Code 自 0.35.0 起内置 coder 默认不再派生，自定义 profile 显式列出 `Agent`/`AgentSwarm` 工具可恢复。',
        'Qwen Code Fork 明确禁止递归 Fork；Codex 当前 Subagent 页面未确认嵌套规则。',
        'Kimi Code 官方 Agents 文档页（main 分支）仍写内置 coder 可派发嵌套子 Agent，与 0.35.0 Release 说明及仓库 profile 代码不一致；本矩阵以 Release 说明与代码为准。',
      ],
      notes: {
        claude:
          '默认允许向下派生，最多到主会话下三层；`Agent(name)` 与工具规则可限制下级类型。',
        codex:
          '当前 Subagent 页面说明父线程负责编排，但未列出子线程继续派生的公开规则。',
        qwen:
          '普通命名 Agent 是否可派生取决于 Agent 工具是否可用；Fork 在运行时禁止再创建 Fork。',
        kimi: {
          behavior:
            '0.35.0 起内置 coder profile（v1 与 v2 引擎）移除 `Agent` 与 `AgentSwarm` 工具，coder 子 Agent 默认不能再派生；主 Agent 保留这两个工具，默认会话仍可委派。自定义 Agent 用 `subagents` 指定允许委派的类型，派发前仍会强制校验；自定义 profile 在 `tools` 显式列出 `Agent`/`AgentSwarm` 可恢复嵌套。',
          conditions:
            'Subagent 模型池为实验性功能，需 `KIMI_CODE_EXPERIMENTAL_SECONDARY_MODEL=1` 或 master flag `KIMI_CODE_EXPERIMENTAL_FLAG=1` 开启；开启后所有启动模式（包括 TUI）生效。官方 Agents 文档页（2026-08-13 核对的提交）仍写内置 coder 可继续派发嵌套子 Agent，尚未同步 coder 默认工具变化。',
        },
        qoder:
          '允许 Agent 工具继续派生；`Agent(name)` 限定类型，`disallowedTools: [Agent]` 完全关闭。',
      },
      related: ['agent-tools', 'agent-deny-tools', 'agent-background'],
      overrides: {
        kimi: {
          sources: [
            'kimi-agents',
            'kimi-subagent-config',
            'kimi-coder-nesting-commit',
            'kimi-coder-nesting-changeset',
            'kimi-v035-release',
          ],
        },
      },
    }),

    'agent-worktree': createDetail({
      id: 'agent-worktree',
      definition:
        '让 Subagent 在独立 Git Worktree 中执行，避免与主工作区或其他 Agent 的文件修改直接冲突。',
      includes: ['Worktree 创建', '无改动清理', '有改动保留'],
      excludes: ['普通进程沙箱', '容器隔离', '云任务工作区'],
      facts: [
        'Claude Code、Qwen Code 命名 Agent 与 Qoder CLI 都提供每 Agent Worktree 隔离。',
        'Codex 与 Kimi Code 当前 Subagent 页面未确认等价字段；Qwen Code Fork 明确不支持 Worktree 隔离。',
      ],
      notes: {
        claude:
          '`isolation: worktree` 创建临时 Worktree；无改动自动清理，有改动则保留路径和分支。',
        codex:
          '当前 Subagent 页面只确认沙箱继承，未列出 per-Agent Git Worktree 配置。',
        qwen: {
          behavior:
            'Agent 工具调用传 `isolation: "worktree"` 创建临时 Worktree；无差异清理，有差异保留。',
          conditions:
            '只支持非 Fork Agent；该能力是 Agent 调用参数，不是当前 Agent frontmatter 字段。',
        },
        kimi:
          '当前 Agent 文档描述独立上下文和工具控制，但未列出 Worktree 隔离字段。',
        qoder:
          '`isolation: worktree` 在单独 Worktree 运行；插件 Agent 也只保留这一种 isolation 值。',
      },
      related: ['agent-background', 'execution-worktree', 'agent-permission'],
      overrides: {
        qwen: { sources: ['qwen-agents', 'qwen-worktree'] },
      },
    }),

    'agent-limits': createDetail({
      id: 'agent-limits',
      definition:
        '限制单次 Subagent 调用的最大对话轮数、运行时间或并发线程数。',
      includes: ['maxTurns', 'timeoutMins', 'timeout_ms', '并发线程上限', '嵌套深度上限'],
      excludes: ['模型 Token 上限', '全局 CLI 超时', '费用预算'],
      facts: [
        'Qoder CLI 同时提供单 Agent 最大轮数和超时；Claude Code 与 Qwen Code 提供最大轮数。',
        'Kimi Code 通过全局 `[subagent] timeout_ms` 限制单个 Agent 或 AgentSwarm 运行时间（默认 2 小时），main 分支起 AgentSwarm 改用独立 `[swarm] timeout_ms`（尚未发布），但 Agent 定义无独立轮数或超时字段。',
        'Claude Code 另有全局 `CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS`（默认 20）、`CLAUDE_CODE_MAX_SUBAGENTS_PER_SESSION`（默认 200）和 `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH`（默认 3）。',
        'Codex 通过 `agents.max_concurrent_threads_per_session` 控制每会话并发线程数。',
      ],
      notes: {
        claude:
          '`maxTurns` 限制 Agentic 轮数；全局环境变量控制并发（默认 20）、会话总数（默认 200）和嵌套深度（默认 3）；当前 Subagent frontmatter 表未列出超时字段。',
        codex:
          '`agents.max_concurrent_threads_per_session` 控制并发；Agent 文件未列出单 Agent 轮数或超时。',
        qwen:
          '`maxTurns` 写入 Agent 运行配置并限制轮数；当前 frontmatter 未列出单 Agent 超时。',
        kimi:
          '全局 `[subagent] timeout_ms` 限制单个 Agent 或 AgentSwarm 运行时间，默认 7200000 ms（2 小时），print 模式未设置时默认 0（无限制）；环境变量 `KIMI_SUBAGENT_TIMEOUT_MS` 可覆盖；该值同时是后台任务管理器的单任务超时，覆盖前台与后台 Subagent。PR #3198（提交 `496bb6ce4e55`，合入 main 尚未发布）为 AgentSwarm 新增独立 `[swarm] timeout_ms`：默认同为 7200000 ms，`0` 表示无超时（运行到完成或手动停止），print 模式未显式设置时同样默认 0，环境变量 `KIMI_CODE_SWARM_TIMEOUT_MS` 优先于配置文件；超时的 swarm 子 Agent 被中止并在聚合报告中标记失败（`Subagent timed out.`），其他子 Agent 不受影响；取值超过 2147483647（约 24.8 天）时运行时收敛为约 24.8 天。该提交是有意的行为变更且无回退：原为覆盖 swarm 设置的 `[subagent] timeout_ms` 不再作用于 AgentSwarm，需迁移到 `[swarm] timeout_ms`。Agent 定义 frontmatter 无独立轮数或超时字段。',
        qoder:
          '`maxTurns` 限制单次会话轮数，`timeoutMins` 限制分钟数；设置覆盖也可修改两者。',
      },
      related: ['agent-background', 'agent-config', 'agent-effort'],
      overrides: {
        kimi: {
          sources: [
            'kimi-agents',
            'kimi-subagent-config',
            'kimi-swarm-timeout-commit',
            'kimi-swarm-timeout-config',
            'kimi-swarm-timeout-changeset',
          ],
        },
      },
    }),
  });
})();

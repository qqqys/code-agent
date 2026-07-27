(() => {
  const rows = Object.fromEntries(
    window.matrixData.rows
      .filter((row) => row.category === 'surfaces')
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
    if (value.includes('未确认')) return '未确认';
    if (
      value.includes('无') ||
      value.includes('未公开') ||
      value.includes('实验') ||
      value.includes('自托管') ||
      value.includes('需自建')
    ) {
      return '条件项';
    }
    return profiles[productId].status;
  }

  function record(productId, fields) {
    return {
      value: fields.value,
      entry: fields.entry,
      protocol: fields.protocol,
      behavior: fields.behavior,
      state: fields.state,
      tools: fields.tools,
      auth: fields.auth,
      deployment: fields.deployment,
      conditions: fields.conditions,
      status: evidenceStatus(fields.value, productId, fields.status),
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
    if (!row) throw new Error(`Unknown surface capability: ${id}`);

    return {
      definition,
      includes,
      excludes,
      facts,
      products: Object.fromEntries(
        window.matrixData.products.map((product) => {
          const fields = products[product.id];
          if (!fields) {
            throw new Error(`Missing ${product.id} record for ${id}`);
          }
          return [
            product.id,
            record(product.id, {
              ...fields,
              value: row.values[product.id],
            }),
          ];
        }),
      ),
      related,
    };
  }

  window.capabilityDetails = Object.assign(window.capabilityDetails ?? {}, {
    'surface-headless': createDetail({
      id: 'surface-headless',
      definition:
        '不进入交互式终端界面，直接从命令参数或标准输入接收任务，并以进程输出和退出码交付结果。',
      includes: [
        '一次性非交互任务入口',
        '标准输入、会话恢复和退出行为',
        'Headless 模式下的权限与配置加载',
      ],
      excludes: [
        '应用程序内嵌 SDK',
        '常驻 HTTP、WebSocket 或 ACP 服务',
        '托管云端任务',
      ],
      facts: [
        '五家都提供专门的非交互入口，不需要模拟 TUI 键盘输入。',
        'Claude Code、Codex、Qwen Code 和 Qoder CLI 可在非交互入口恢复已有会话；Kimi Code 可组合会话恢复参数与单次 prompt。',
        '非交互模式不能假设有人回答权限提示：各家通过只读默认、auto 模式、显式工具规则或流式双向协议处理这一边界。',
      ],
      products: {
        claude: {
          entry:
            '`claude -p "<prompt>"` 或 `--print`；也可从 stdin 读取内容，使用 `--continue` 或 `--resume` 继续会话。',
          protocol:
            '默认输出纯文本；可切换 `json` 或 `stream-json`。`--input-format stream-json` 可建立双向流式调用。',
          behavior:
            '执行完整 Agent 循环并在结束后退出；`--bare` 可跳过 Hooks、Skills、Plugins、MCP、自动记忆和项目指令的自动发现。',
          state:
            '默认保留会话 ID 与历史；恢复参数把后续任务追加到既有会话。',
          tools:
            '保留 Claude Code 的文件、Shell、搜索、MCP 和 Subagent 工具；可用 `--allowedTools`、`--disallowedTools` 缩小或预授权。',
          auth:
            '复用 Claude Code 登录或支持的 API/云平台认证；无人值守任务仍需预先完成认证。',
          deployment:
            '运行在调用 `claude` 的本机、容器或 CI Runner 中。',
          conditions:
            '普通 `-p` 不能停下来等待 TUI 选择器；需要交互式工具审批时应预设权限，或使用双向 `stream-json` 输入输出。',
          sources: ['claude-headless', 'claude-tools'],
        },
        codex: {
          entry:
            '`codex exec "<task>"`；stdin 可作为额外上下文，`codex exec resume` 继续既有线程。',
          protocol:
            '默认把进度写入 stderr、最终消息写入 stdout；`--json` 把 stdout 改为 JSONL 事件流。',
          behavior:
            '在没有 TUI 的情况下运行完整任务；`--ephemeral` 不把 rollout 会话写入磁盘。',
          state:
            '默认持久化线程，可按 ID 恢复；`--ephemeral` 只保留本次进程生命周期。',
          tools:
            '复用本地 Codex 工具、MCP、规则与项目配置；必需 MCP Server 初始化失败会让任务直接失败。',
          auth:
            '复用 Codex CLI 登录或 API 凭据；自动化环境应在启动前注入凭据。',
          deployment:
            '运行在本机或 CI Runner；这不是 Codex Cloud，文件与命令仍发生在调用进程的工作区。',
          conditions:
            '默认是只读沙箱；写入需显式选择 `workspace-write` 等沙箱。`danger-full-access` 只适合外部已隔离环境。',
          sources: ['codex-noninteractive', 'codex-approvals'],
        },
        qwen: {
          entry:
            '`qwen -p "<prompt>"`、`--prompt` 或管道 stdin；`--continue`、`--resume <id>` 可在当前项目恢复会话。',
          protocol:
            '支持 `text`、`json` 和 `stream-json`；后者同时支持长连接式 `stream-json` 输入协议。',
          behavior:
            '执行与 TUI 相同的 Agent 循环并以退出码结束；可用 `--system-prompt`、`--append-system-prompt` 和 `--bare` 调整启动上下文。',
          state:
            '会话按项目保存到本地 JSONL；恢复时还原历史、工具输出和压缩检查点。',
          tools:
            '支持内置工具、MCP、Skills、Subagent 与 Hooks；Headless 下无可用审批界面时会按 approval mode 自动拒绝或取消请求。',
          auth:
            '复用 Qwen Code Provider 与凭据配置；也可在 CI 中注入 OpenAI 兼容端点所需环境变量。',
          deployment:
            '运行在调用 `qwen` 的本机、容器或 CI Runner。',
          conditions:
            '需要动态批准工具时应使用双向 `stream-json`；普通非交互输出无法展示 TUI 权限提示。',
          sources: ['qwen-session-headless', 'qwen-structured-current'],
        },
        kimi: {
          entry:
            '`kimi -p "<prompt>"` 或 `--prompt`；可配合 `--continue`、`--session <id>` 和 `--model`。',
          protocol:
            '默认 transcript 风格文本；`--output-format stream-json` 逐行输出 Assistant 与 Tool 消息。',
          behavior:
            '不打开 TUI，Assistant 正文写 stdout，thinking、工具进度和恢复提示写 stderr。',
          state:
            '可恢复当前目录最近会话或指定会话；执行仍写入 Kimi Code 的本地会话目录。',
          tools:
            '普通工具固定按 `auto` 权限策略执行，静态 deny 规则继续生效。',
          auth:
            '复用 `kimi login` 或 Provider 配置；脚本启动前必须已有可用认证。',
          deployment:
            '运行在调用 `kimi` 的本机或 CI Runner。',
          conditions:
            '`--prompt` 不能与 `--yolo`、`--auto` 或 `--plan` 同时使用；当前仅 `text` 与 `stream-json` 两种输出格式。',
          sources: ['kimi-cli-surface-current', 'kimi-config-current'],
        },
        qoder: {
          entry:
            '`qodercli -p "<prompt>"` 或 `--print`；`-c` 继续最近会话，`-r <id>` 恢复指定会话。',
          protocol:
            '`--output-format` 支持 `text`、`json`、`stream-json`。',
          behavior:
            '在指定 workspace 中运行完整 Agent 任务；可设置最大轮数、工具列表、Worktree 和 YOLO。',
          state:
            '默认保留本地会话；`-c` 与 `-r` 复用历史。',
          tools:
            '`--allowed-tools`、`--disallowed-tools` 与 `--max-turns` 控制非交互任务；`--worktree` 可把写入隔离到新 Worktree。',
          auth:
            '复用 Qoder CLI 登录，或通过 `QODER_PERSONAL_ACCESS_TOKEN` 为自动化环境认证。',
          deployment:
            '运行在调用 `qodercli` 的本机、容器或 CI Runner。',
          conditions:
            'Print Mode 与 Cloud Mode 不同；`qodercli --remote` 创建的是托管云任务，不属于本页的本地 Headless。',
          sources: ['qoder-using-cli', 'qoder-permissions'],
        },
      },
      related: ['surface-structured-output', 'surface-sdk', 'security-noninteractive'],
    }),

    'surface-structured-output': createDetail({
      id: 'surface-structured-output',
      definition:
        '把 Agent 的最终结果或执行事件编码为稳定的 JSON、JSONL 或 JSON Schema 约束对象，供程序而不是人直接消费。',
      includes: [
        'Headless 输出格式',
        '事件流与最终结果的区分',
        'JSON Schema 约束和机器可读错误边界',
      ],
      excludes: [
        'SDK 对象和类型系统',
        '普通 TUI 渲染',
        'MCP 或 ACP 的协议消息',
      ],
      facts: [
        'Claude Code、Codex 和 Qwen Code 都能用 JSON Schema 约束最终业务结果；Kimi Code 与 Qoder CLI 当前公开 CLI 文档只承诺格式化消息或事件。',
        'JSONL 事件流不是“一个最终 JSON”：消费者必须按事件类型识别结束、错误、工具调用和最终消息。',
        '各家的 stderr 仍可能承载进度或诊断信息，自动化脚本应只解析 stdout 并同时检查退出码。',
      ],
      products: {
        claude: {
          entry:
            '`--output-format json|stream-json`；需要业务对象时同时传 `--json-schema <schema>`。',
          protocol:
            '`json` 返回单个带结果、session ID 和元数据的对象；`stream-json` 返回换行分隔事件。',
          behavior:
            'Schema 模式把校验后的业务对象放在 `structured_output` 字段；普通文本结果仍位于 `result`。',
          state:
            '输出包含 session ID，可用于后续 `--resume`；流事件按一次运行顺序产生。',
          tools:
            'Agent 可在产出结构化结果前继续读取文件、运行命令和调用工具。',
          auth:
            '不改变认证方式；Schema 和 prompt 一样会发送给模型服务。',
          deployment:
            'CLI、Python SDK 和 TypeScript SDK 均可消费结构化输出。',
          conditions:
            '`stream-json` 消费者需逐行解析；Schema 校验失败时任务不会被当作成功结果。',
          sources: ['claude-headless', 'claude-agent-sdk'],
        },
        codex: {
          entry:
            '`codex exec --json` 输出事件；`--output-schema ./schema.json` 约束最终响应，`-o` 可把最终消息写文件。',
          protocol:
            '`--json` 是 JSONL，事件包括 `thread.*`、`turn.*`、`item.*` 和 `error`；Schema 输出是最终 JSON 对象。',
          behavior:
            'JSONL 记录 Agent 消息、推理、命令、文件修改、MCP、Web 搜索和计划更新；Schema 用于下游稳定字段。',
          state:
            '`thread.started` 提供 thread ID；恢复线程时可继续产生新事件。',
          tools:
            '结构化输出不缩小 Agent 工具集合；文件和命令事件仍受沙箱与审批。',
          auth:
            '不改变认证方式；自动化运行仍复用 CLI 凭据。',
          deployment:
            '主要面向 Shell、CI 和日志处理程序；SDK 提供对应的对象与流式接口。',
          conditions:
            '不要把整个 `--json` stdout 当成一个 JSON 数组；必须逐行解析并以退出码、`turn.failed` 或 `error` 判断失败。',
          sources: ['codex-noninteractive', 'codex-sdk'],
        },
        qwen: {
          entry:
            '`--output-format json|stream-json`；`--json-schema <json|@file>` 约束最终对象。',
          protocol:
            '`json` 缓冲为消息数组；`stream-json` 输出 JSONL；最终 `result` 消息可含 `structured_result`。',
          behavior:
            'Schema 通过临时 `structured_output` 工具强制模型提交对象，并对参数做 JSON Schema 校验。',
          state:
            '事件带 session ID；恢复会话时每次仍需重新传入本轮 Schema。',
          tools:
            'Schema 成功调用会终止本轮；同一模型消息中的其他副作用工具会被抑制，避免“提交结果后继续修改”。',
          auth:
            '不改变认证；Schema 作为工具参数定义发送给 Provider。',
          deployment:
            'CLI 和 `@qwen-code/sdk` 可消费同一类消息；Daemon 另有 HTTP + SSE 协议。',
          conditions:
            '`--json-schema` 不可与交互 prompt、`stream-json` 输入或 ACP 同用；显式 deny `structured_output` 会使契约无法完成。',
          sources: ['qwen-structured-current', 'qwen-session-headless'],
        },
        kimi: {
          entry:
            '`kimi -p "<prompt>" --output-format stream-json`。',
          protocol:
            'stdout 为 JSONL：普通回复是 Assistant 消息，工具调用先输出 Assistant tool_calls，再输出 Tool 消息。',
          behavior:
            'thinking 不进入 JSONL；工具进度和恢复提示继续写 stderr。',
          state:
            '消息属于当前或恢复的本地会话，但公开 CLI 文档未定义单独的最终 Schema 对象。',
          tools:
            'JSONL 会暴露工具调用和结果，普通工具仍按 Headless auto 权限策略执行。',
          auth:
            '不改变认证方式。',
          deployment:
            '面向 Shell 与 CI 消费者；本地 Web 和 ACP 使用各自协议。',
          conditions:
            '当前公开选项只有 `text` 与 `stream-json`；没有 CLI JSON Schema 最终结果契约。',
          status: '条件项',
          sources: ['kimi-cli-surface-current'],
        },
        qoder: {
          entry:
            '`qodercli -p "<prompt>" --output-format=text|json|stream-json`。',
          protocol:
            '`json` 输出结构化消息集合，`stream-json` 输出流式消息；类型与 SDK 消息体系对应。',
          behavior:
            '可在运行中观察 Assistant、工具和最终 Result 消息，用于脚本化处理。',
          state:
            '恢复会话参数可与 Print Mode 结合，输出继续关联原会话。',
          tools:
            '工具事件受允许、禁止和权限模式配置约束。',
          auth:
            '复用 CLI 登录或 PAT。',
          deployment:
            'CLI 直接输出；TypeScript/Python SDK 也能以类型化消息消费。',
          conditions:
            '当前公开 CLI 使用页未列出 JSON Schema 最终结果参数，不能把 JSON/JSONL 等同于 Schema 保证。',
          status: '条件项',
          sources: ['qoder-using-cli', 'qoder-sdk-reference'],
        },
      },
      related: ['surface-headless', 'surface-sdk', 'surface-service'],
    }),

    'surface-sdk': createDetail({
      id: 'surface-sdk',
      definition:
        '面向应用开发者的官方程序库，用类型化接口创建或恢复 Agent 会话、发送任务、消费事件并控制工具与权限。',
      includes: [
        '公开安装包、语言与运行时',
        '单轮、多轮、恢复和事件消费',
        'SDK 对工具、权限、MCP 和本地/云运行时的控制',
      ],
      excludes: [
        '只通过 Shell 启动 CLI',
        '通用模型 API SDK',
        '尚未公开发布的仓库内部包被视为稳定公共 SDK',
      ],
      facts: [
        'Claude Agent SDK、Codex SDK 和 Qoder Agent SDK 均公开提供 Python 与 TypeScript；Qwen Code 当前公开的是 TypeScript SDK。',
        'Qwen、Claude、Codex 和 Qoder 的 SDK 本质上都可驱动本地 Agent 运行时，但各自对子进程、凭据和协议的封装不同。',
        'Kimi Code 仓库已有 TypeScript SDK 包源码，但 package 标记为 private 且公共 npm 注册表没有该包，因此只记为仓库内能力。',
      ],
      products: {
        claude: {
          entry:
            'Python `claude-agent-sdk`；TypeScript `@anthropic-ai/claude-agent-sdk`。',
          protocol:
            '`query()` 返回异步消息流；Python `ClaudeSDKClient` 提供长连接多轮控制。',
          behavior:
            '创建或恢复会话，控制模型、工具、MCP、Hooks、权限、Subagent 和结构化输出。',
          state:
            '会话自动持久化到磁盘；支持 continue、resume、fork、会话列表和消息读取。',
          tools:
            '提供与 Claude Code 相同的 Agent loop、内置工具与上下文管理，也可注册 SDK 自定义工具。',
          auth:
            '使用 Anthropic API、Claude 订阅对应的 Agent SDK 权益或支持的云平台凭据。',
          deployment:
            '运行在应用服务器、本机进程或 CI 环境；SDK 负责与本地 Claude Code 运行时通信。',
          conditions:
            'Python 和 TypeScript 的会话对象模型不完全相同；生产应用需按对应语言的生命周期接口管理连接。',
          sources: ['claude-agent-sdk', 'claude-headless'],
        },
        codex: {
          entry:
            'TypeScript `@openai/codex-sdk`；Python `openai-codex`。',
          protocol:
            'TypeScript 通过 `Codex.startThread()`、`run()`、`resumeThread()`；Python 通过本地 app-server JSON-RPC。',
          behavior:
            '创建线程、连续运行多轮任务、恢复线程并消费最终响应或事件。',
          state:
            '线程 ID 是恢复键；同一 thread 对象多次 `run()` 会保留上下文。',
          tools:
            '复用 Codex 本地工具、沙箱、MCP 和配置；Python 可在每个 turn 调整 Sandbox。',
          auth:
            '复用 Codex CLI/ChatGPT 登录或所配置的 OpenAI 凭据。',
          deployment:
            'TypeScript 要求服务端 Node.js；Python SDK 启动并控制本地 app-server，发布包带固定 Codex 运行时依赖。',
          conditions:
            'Python SDK 当前为 beta；SDK 面向本地 Codex 线程，不等同于直接调用 Codex Cloud 管理 API。',
          sources: ['codex-sdk', 'codex-app-server'],
        },
        qwen: {
          entry:
            '`npm install @qwen-code/sdk`；Node.js 22+，发布包内置 CLI。',
          protocol:
            '`query()` 返回异步消息流；支持字符串单轮和 AsyncIterable 多轮；另有实验性 `DaemonClient`/`DaemonSessionClient`。',
          behavior:
            '控制 cwd、模型、权限、工具、MCP、Subagent、会话恢复、中断和上下文用量。',
          state:
            '支持 `resume`、显式 `sessionId` 和长连接 Query 控制；Daemon 客户端用 session ID 绑定 HTTP + SSE 会话。',
          tools:
            '`coreTools` 控制注册集合，`allowedTools`/`excludeTools` 控制授权；可嵌入 SDK MCP Server。',
          auth:
            '使用 Qwen Code 的 Provider/环境配置；SDK 可把环境变量传给内置 CLI。',
          deployment:
            '默认在应用宿主启动内置 qwen CLI 子进程；Daemon 客户端可连接已有 `qwen serve`。',
          conditions:
            'README 将其标为 minimum experimental；Node.js 版本和 SDK/CLI 版本需要按包约束匹配。',
          status: '条件项',
          sources: ['qwen-sdk-current', 'qwen-serve-current'],
        },
        kimi: {
          entry:
            '仓库包含 `packages/node-sdk`，包名 `@moonshot-ai/kimi-code-sdk`。',
          protocol:
            '源码定义 TypeScript SDK，但当前包 README 只有仓库级说明，尚无完整公共 API 文档。',
          behavior:
            '从包描述可确认目标是以 TypeScript 驱动 Kimi Code Agent；不能据此承诺公开安装和兼容性。',
          state:
            '仓库源码含会话/协议依赖，但没有公开 SDK 生命周期契约可供外部用户依赖。',
          tools:
            '内部依赖 Agent Core、KAOS 与 OAuth 包；公开可用工具控制细节未形成 SDK 文档。',
          auth:
            '依赖 Kimi Code OAuth/Provider 组件；没有公开 SDK 认证指南。',
          deployment:
            '当前适合作为仓库内构建组成部分，不记作已发布公共 SDK。',
          conditions:
            '`package.json` 当前 `private: true`，公共 npm 查询不到该包；待官方发布和文档完成后再升级状态。',
          status: '条件项',
          sources: ['kimi-sdk-current', 'kimi-cli-surface-current'],
        },
        qoder: {
          entry:
            'TypeScript `@qoder-ai/qoder-agent-sdk`；Python `qoder-agent-sdk`。',
          protocol:
            '两种语言均提供 `query()` 异步消息流；长连接客户端支持多轮会话。',
          behavior:
            '控制 cwd、工具、权限、Hooks、MCP、Skills、Plugins、Subagent、模型、恢复和中断。',
          state:
            '支持 continue/resume 和长连接会话；实验性 Cloud Agent 可把 Agent 与 session 状态放在 Qoder Cloud。',
          tools:
            '内置 Read/Edit/Bash/Agent 等工具可按可见、预授权和禁止三层控制，也可注册 SDK MCP 工具。',
          auth:
            '推荐 PAT；本地交互环境也可复用 qodercli 登录。',
          deployment:
            '默认随 SDK 启动内置 qodercli；`experimentalCloudAgent` 改为 SSE 连接 Qoder Cloud。',
          conditions:
            'Cloud Agent 是实验接口，且不支持本地 MCP、Hooks、Plugins、权限和 checkpoint 等选项。',
          sources: [
            'qoder-sdk-quickstart',
            'qoder-sdk-python',
            'qoder-cloud-agent',
          ],
        },
      },
      related: ['surface-headless', 'surface-service', 'extension-mcp'],
    }),

    'surface-service': createDetail({
      id: 'surface-service',
      definition:
        '把 Agent 作为可被其他程序或设备连接的长驻进程运行，通过 stdio、HTTP、SSE、WebSocket、ACP 或 MCP 管理会话和事件。',
      includes: [
        '面向客户端集成的协议服务器',
        '本地常驻服务和远程终端连接',
        '会话、事件、权限与认证边界',
      ],
      excludes: [
        '单次 Headless 子进程',
        '单纯的云端任务网页',
        '只消费外部 MCP Server 的客户端能力',
      ],
      facts: [
        'Codex 的 app-server、Qwen 的 qwen serve 和 Kimi 的 kimi web 都提供面向富客户端的双向服务，但协议分别是 JSON-RPC、HTTP + SSE、REST + WebSocket。',
        'Qoder 的 ACP Server 面向 IDE，Remote Control Daemon 面向 Qoder Web/移动端；它不是公开的本地 HTTP Agent API。',
        'Claude Code 的 Agent SDK 和 Remote Control 可承载长运行会话，但官方没有把通用本地 HTTP Agent Daemon 作为开发者接口。',
      ],
      products: {
        claude: {
          entry:
            'Agent SDK 长连接客户端；`claude remote-control` 或会话内 `/remote-control` 启动远程控制服务。',
          protocol:
            'SDK 通过本地运行时消息流通信；Remote Control 通过 Anthropic 中继把 Web/移动界面连接到本地会话。',
          behavior:
            'SDK 宿主可持续发送多轮消息；Remote Control 同步本地终端、浏览器和手机上的同一对话。',
          state:
            'Agent SDK 会话可持久化与恢复；Remote Control 的执行进程和文件始终留在本机。',
          tools:
            '连接后的远程界面使用本机会话已有的文件、MCP、工具和项目配置。',
          auth:
            'Remote Control 要求同一 Claude 账号并受组织开关控制；SDK 按 Agent SDK 认证。',
          deployment:
            '服务进程运行在用户机器或应用宿主；不是公开自托管 HTTP API。',
          conditions:
            'Remote Control 是专用跨端通道，不应作为任意第三方客户端协议；通用产品内嵌应使用 Agent SDK。',
          status: '条件项',
          sources: ['claude-agent-sdk', 'claude-remote-control'],
        },
        codex: {
          entry:
            '`codex app-server`；`codex mcp-server`；远程 TUI 可用 `app-server --listen` 配合 `codex --remote`。',
          protocol:
            'app-server 使用双向 JSON-RPC，默认 stdio JSONL，也支持 Unix socket；WebSocket transport 标为实验且不受支持。MCP Server 使用 stdio MCP。',
          behavior:
            'app-server 提供认证、线程历史、审批和流式 Agent 事件；MCP Server 暴露 `codex` 与 `codex-reply` 工具。',
          state:
            '一个服务可管理多个 thread/turn；远程终端连接到服务端工作区而非复制文件。',
          tools:
            '完整 Codex 工具、审批、MCP 和沙箱由 app-server 统一执行；MCP Server 可被上层 Agents SDK 编排。',
          auth:
            'stdio/Unix 依赖本机边界；非本地 WebSocket 要配置 capability token 或签名 bearer，并置于 TLS 后。',
          deployment:
            '可运行在本机、远程开发机或产品后端；CLI TUI 可跨机器连接。',
          conditions:
            'WebSocket 明确是 experimental/unsupported；远程暴露必须使用 WSS、认证或 SSH 端口转发。',
          sources: ['codex-app-server', 'codex-mcp-server'],
        },
        qwen: {
          entry:
            '`qwen serve`，默认 `127.0.0.1:4170`；可加 `--open`、`--no-web`、`--workspace` 和 bearer token。',
          protocol:
            'HTTP REST 管理会话与工作区，SSE 推送事件；内部通过一个或多个 `qwen --acp` 子进程承载 Agent。',
          behavior:
            '多客户端共享会话、权限请求和 Diff；SSE 支持 `Last-Event-ID` 重连，Web Shell 与 API 同源。',
          state:
            '持久化 transcript 可分页读取和恢复；活跃进程状态在 daemon 重启后需重新加载，跨重启队列需应用层处理。',
          tools:
            '客户端可查询或控制工具、Skills、MCP、Approval mode、工作区和 Channel；严格变更路由要求 token。',
          auth:
            'loopback 默认可无 token；非 loopback 绑定必须配置 bearer，远程设备登录可走 device flow。',
          deployment:
            '当前 v0.16-alpha 定位为本地单机、单用户或小团队；支持 launchd/systemd/nohup，但不承诺容器与多 daemon 协调。',
          conditions:
            'Stage 1 experimental，首版仅文本 prompt；生产级多客户端、网络抖动、容器和跨主机保证仍有明确限制。',
          status: '条件项',
          sources: ['qwen-serve-current', 'qwen-sdk-current'],
        },
        kimi: {
          entry:
            '`kimi web` 前台启动；可用 `--no-open`、`--port`、`--host`、`--allowed-host` 和 `rotate-token`。',
          protocol:
            '同一进程提供 REST、WebSocket、Web UI，以及 `/openapi.json` 和 `/asyncapi.json`。',
          behavior:
            '承载会话、prompt、工具流和本地文件访问；一个 home 下可启动多个实例并注册到 instances 目录。',
          state:
            '会话与服务 token 保存在 Kimi Code home；服务前台运行，SIGINT/SIGTERM 时退出。',
          tools:
            'Web 客户端驱动与 TUI 相同的 Agent 工具；VS Code/ACP 使用另一套进程入口。',
          auth:
            '默认生成并要求 bearer token；Web UI 从 URL fragment 读取 token。可旋转 token。',
          deployment:
            '默认 loopback 本地服务；可绑定 `0.0.0.0`，但网络、TLS 和访问控制由部署者负责。',
          conditions:
            '`--dangerous-bypass-auth` 会让任何可达客户端控制会话、文件和 Shell，只能放在可信网络或自有鉴权代理之后。',
          sources: ['kimi-cli-surface-current'],
        },
        qoder: {
          entry:
            '`qodercli --acp` 启动 IDE 协议服务器；`qodercli remote-control` 启动面向移动端的后台 Daemon。',
          protocol:
            'ACP 使用 stdin/stdout 标准协议；Remote Control 使用 Qoder 账号与云端中继连接 Qoder Web/移动端。',
          behavior:
            'ACP 允许 IDE 创建会话、使用工具和处理权限；Remote Control Daemon 可连续接收多个远程任务。',
          state:
            'ACP 状态随宿主子进程；Remote Control Daemon 在本机持续运行并可串行或并行处理任务。',
          tools:
            'ACP 提供 CLI 同款内置工具、Subagent、MCP、权限、压缩和多模态。',
          auth:
            'ACP 复用 CLI 登录或 PAT；Remote Control 要求同一 Qoder 账号，并通过二维码/URL 配对。',
          deployment:
            '两种服务都运行在本机；Remote Control 的文件与 Shell 仍在本机执行。',
          conditions:
            'Remote Control Daemon 不是 Qoder Cloud Mode：本机必须保持在线，也没有公开通用 HTTP 客户端协议。',
          status: '条件项',
          sources: ['qoder-acp', 'qoder-remote-control'],
        },
      },
      related: ['surface-sdk', 'surface-web', 'surface-remote-control'],
    }),

    'surface-cli': createDetail({
      id: 'surface-cli',
      definition:
        '在本地终端中运行的交互式 Agent 主界面，直接读取工作区、显示工具调用并接受用户输入与审批。',
      includes: [
        '主 CLI 命令与交互式 TUI',
        '本地工作区和会话',
        'CLI 可切换到的 Headless 或协议子命令',
      ],
      excludes: [
        'IDE 图形界面',
        '独立桌面应用',
        '只在托管云端运行的任务',
      ],
      facts: [
        '五家都以本地 CLI 作为核心 Surface，并在同一二进制或包中提供 Headless、协议或远程入口。',
        'CLI 的工具能力可能与 Desktop、Web 或 Cloud 共用底层运行时，但命令、审批和可视化不能自动互相等同。',
        'Qwen Code 与 Kimi Code 开源仓库同时包含多个客户端；主 CLI 仍分别是 qwen 与 kimi。',
      ],
      products: {
        claude: {
          entry:
            '`claude` 在当前目录启动；支持交互命令、`@` 文件引用、权限选择和会话恢复。',
          protocol:
            '终端 TUI；脚本化时切换 `-p`，远程控制时切换 `remote-control` 或会话命令。',
          behavior:
            '模型可读写文件、运行 Bash、搜索、调用 MCP 与 Subagent，并在终端展示计划、Diff 与任务状态。',
          state:
            '会话按项目持久化；`--continue`、`--resume` 与命令选择器恢复。',
          tools:
            '工具受 permissions、sandbox、Hooks、Plugins 和 Agent 定义控制。',
          auth:
            'Claude 账号登录、API key 或受支持的 Bedrock/Vertex/Foundry 等部署。',
          deployment:
            'macOS、Linux、Windows/WSL 等受支持终端环境。',
          conditions:
            '部分图形功能、Remote Control 和 Cloud 需要对应账号、版本或组织设置。',
          sources: ['claude-docs', 'claude-platforms'],
        },
        codex: {
          entry:
            '`codex` 在工作区启动交互 TUI；`codex exec`、`app-server`、`mcp-server` 是同一 CLI 的其他入口。',
          protocol:
            '本地终端 TUI，命令执行使用统一 PTY；可通过 `codex --remote` 连接远端 app-server。',
          behavior:
            '读写文件、运行命令、搜索、使用 MCP/Subagent，并展示审批、计划、后台进程和 Diff。',
          state:
            '线程与 rollout 保存在 Codex home；可恢复历史线程。',
          tools:
            '工具与写入受沙箱、审批、rules、Hooks、Skills、Plugins 和 AGENTS.md 控制。',
          auth:
            'ChatGPT/Codex 登录或 API 凭据。',
          deployment:
            '本机终端或连接到远程 app-server 的 TUI。',
          conditions:
            '本地 CLI 与 Codex Cloud 使用不同运行位置；`codex --remote` 也不等同于创建 Cloud task。',
          sources: ['codex-docs', 'codex-app-server'],
        },
        qwen: {
          entry:
            '`qwen` 在当前目录启动 TUI；子命令还包括 `serve`、`channel`，参数模式包括 `-p` 和 `--acp`。',
          protocol:
            'Ink/终端交互界面；IDE Companion 通过本地连接补充上下文与 Diff。',
          behavior:
            '提供文件、Shell、搜索、Web、MCP、Subagent、Worktree、Review、Hooks 和 Plugins。',
          state:
            '项目会话保存为 JSONL，可继续、恢复、命名、归档、导出和压缩。',
          tools:
            '工具由 approval mode、sandbox、permission rules、Skills、Agents 和 Extensions 共同控制。',
          auth:
            '支持 Qwen/Model Studio 及 OpenAI 兼容 Provider 配置。',
          deployment:
            'Node.js CLI，可在本机、容器和 CI 使用。',
          conditions:
            'Daemon、Web Shell、Desktop 和 Channel 是独立 Surface；不能把其菜单或协议方法算作 TUI Slash 命令。',
          sources: ['qwen-docs', 'qwen-session-headless', 'qwen-serve-current'],
        },
        kimi: {
          entry:
            '`kimi` 启动交互式 TUI；`acp`、`web`、`login`、`export` 等为子命令。',
          protocol:
            '终端 TUI；Headless 用 `-p`，IDE 用 ACP，浏览器用本地 Web 服务。',
          behavior:
            '读写文件、Shell、搜索、Web、MCP、Skills、Hooks 和 Subagent。',
          state:
            '会话保存在 Kimi Code home，可继续、选择、恢复、导出和可视化。',
          tools:
            '权限模式、Plan、YOLO、工具规则和自定义 Agent 控制执行。',
          auth:
            'Kimi OAuth 或自定义兼容 Provider。',
          deployment:
            '本机终端，官方安装脚本或 npm/native 包。',
          conditions:
            '当前没有独立 Kimi Code 桌面应用；VS Code 与 Web UI 是另外的客户端。',
          sources: ['kimi-cli-surface-current', 'kimi-tools-current'],
        },
        qoder: {
          entry:
            '`qodercli` 启动交互 TUI；`--acp`、`-p`、`--remote` 与 `remote-control` 切换其他运行面。',
          protocol:
            '终端 TUI，支持 Shell 快捷入口和 Slash 命令。',
          behavior:
            '提供文件、Shell、搜索、Web、MCP、Skills、Plugins、Subagent、Worktree 和 Review。',
          state:
            '本地会话可继续、恢复和管理；Cloud/Remote task 另有账号侧会话。',
          tools:
            '工具由 permission mode、rules、Hooks、SDK/Agent 定义控制。',
          auth:
            '浏览器登录、PAT 或 `QODER_PERSONAL_ACCESS_TOKEN`。',
          deployment:
            'macOS、Linux 和 Windows 的本地 CLI。',
          conditions:
            'Qoder IDE、Qoder Web 和 Cloud Mode 是同品牌其他 Surface，不能替代 CLI 字段。',
          sources: ['qoder-using-cli', 'qoder-docs'],
        },
      },
      related: ['surface-headless', 'cmd-status', 'security-approval'],
    }),

    'surface-ide': createDetail({
      id: 'surface-ide',
      definition:
        '在代码编辑器或 IDE 内提供 Agent 对话、编辑器上下文、原生 Diff 与权限交互，或通过 ACP 让第三方 IDE 驱动 Agent。',
      includes: [
        '官方编辑器扩展',
        'CLI Companion 连接',
        'ACP Server 与已文档化的 IDE 客户端',
      ],
      excludes: [
        '独立桌面 Agent 应用',
        '浏览器 Web UI',
        '仅从 IDE 内置终端运行普通 CLI',
      ],
      facts: [
        'Qwen Code、Kimi Code 和 Qoder CLI 都提供 ACP Server，可被 Zed 等 ACP 客户端作为 Agent 进程启动。',
        'Claude Code、Codex、Qwen Code 和 Kimi Code 都有官方 VS Code 体验，但“完整图形 Agent 面板”和“CLI Companion”不是同一种集成深度。',
        'ACP 是否支持终端、文件 reverse-RPC、图片、MCP 和全部 Slash 命令，需要按每个实现的 capability 声明判断。',
      ],
      products: {
        claude: {
          entry:
            'Claude Code VS Code Extension；JetBrains Plugin；CLI 中 `/ide` 管理与编辑器连接。',
          protocol:
            '官方扩展内置 Claude Code CLI，并通过编辑器 API 提供选区、文件、Diff 与会话界面。',
          behavior:
            '支持 @mention、行范围、原生 Diff、计划审阅、自动接受编辑、会话历史和并行标签页。',
          state:
            'VS Code Extension、Desktop 和 Web 各自维护 Surface 会话历史；项目配置可共享。',
          tools:
            '复用 Claude Code 工具、MCP、Plugins 和权限；部分 CLI-only 功能在扩展中仍需终端。',
          auth:
            '扩展内登录 Claude 账号，或按文档使用第三方 Provider。',
          deployment:
            'VS Code/Cursor/Open VSX 兼容编辑器与 JetBrains 系列。',
          conditions:
            '扩展图形功能与 CLI 命令表不完全一致；具体能力取决于 IDE 与扩展版本。',
          sources: ['claude-ide', 'claude-platforms'],
        },
        codex: {
          entry:
            'Codex IDE Extension，在 VS Code 及支持的编辑器内启动；也可从 CLI 传递 IDE context。',
          protocol:
            '官方扩展使用 Codex app-server 作为富客户端后端。',
          behavior:
            '在编辑器旁发起线程、引用文件和选区、查看改动、审批执行并继续 Codex 任务。',
          state:
            '线程由 Codex 本地运行时保存，可与本地 CLI 共享项目配置。',
          tools:
            '复用本地 Codex 工具、沙箱、MCP、Skills 和 AGENTS.md。',
          auth:
            '通过 ChatGPT/Codex 账号或配置的 API 凭据。',
          deployment:
            'VS Code、Cursor 等支持的编辑器；后端在本机运行。',
          conditions:
            'Codex Cloud 是独立 Surface；IDE Extension 默认操作本地工作区。',
          sources: ['codex-ide', 'codex-app-server'],
        },
        qwen: {
          entry:
            'VS Code Companion 配合 `/ide install|enable|status`；`qwen --acp` 可接 Zed，JetBrains 也有 ACP 配置。',
          protocol:
            'Companion 向 CLI 提供最近文件、光标、选区和原生 Diff；ACP 使用 stdin/stdout Agent Client Protocol。',
          behavior:
            'Companion 在集成终端保持 CLI 体验；ACP 在 IDE Agent 面板中创建会话、引用文件和展示工具调用。',
          state:
            'Companion 绑定当前 workspace；ACP 会话由 Qwen Code 运行时管理。',
          tools:
            'ACP 和 CLI 复用文件、Shell、MCP、Subagent 与权限系统，但 `--json-schema` 与 ACP 互斥。',
          auth:
            '复用 Qwen Code 登录和 Provider 设置。',
          deployment:
            'VS Code/VS Code forks，以及支持 ACP 的 Zed、JetBrains 客户端。',
          conditions:
            'Companion 当前官方文档只声明 VS Code 系；其他编辑器应走 ACP，二者入口和 UI 能力不同。',
          sources: ['qwen-ide-current', 'qwen-acp-current'],
        },
        kimi: {
          entry:
            '官方 Kimi Code VS Code Extension；`kimi acp` 可接 Zed、JetBrains AI Chat 等 ACP 客户端。',
          protocol:
            'VS Code Extension 提供 Webview Agent UI；ACP 使用 JSON-RPC stdin/stdout。',
          behavior:
            'VS Code 支持会话、文件选择、Diff、权限、计划、MCP 与媒体；ACP 支持会话 new/load/resume、prompt、cancel 和配置选择。',
          state:
            'ACP 可列出与加载本地磁盘会话并回放历史；VS Code 连接同一本地 Kimi 运行时。',
          tools:
            'ACP 转发 HTTP/stdio/SSE MCP，支持图片与嵌入资源；Shell 仍在本地执行。',
          auth:
            '复用 Kimi Code OAuth/Provider；ACP `authenticate` 处理缺失登录。',
          deployment:
            'VS Code Extension，以及 Zed/JetBrains 等 ACP 客户端。',
          conditions:
            'ACP 当前未实现 session/close、logout、终端 reverse-RPC 和大多数不稳定扩展方法。',
          sources: [
            'kimi-ide-surface-current',
            'kimi-acp-surface-current',
            'kimi-vscode-current',
          ],
        },
        qoder: {
          entry:
            'Qoder IDE 与 JetBrains Plugin；`qodercli --acp` 可作为 Zed 等客户端的 Agent Server。',
          protocol:
            'ACP 通过 stdin/stdout；Qoder IDE 是完整桌面编辑器产品。',
          behavior:
            'ACP 提供内置工具、Subagent、MCP、权限、上下文压缩、多模态和 IDE 侧文件/终端能力。',
          state:
            'ACP 进程复用 Qoder CLI 会话与登录；IDE 产品有自己的项目与会话界面。',
          tools:
            'ACP 暴露与 CLI 相同的核心工具体系；当前可用 Slash 命令是 `/init`、`/memory`、`/about`、`/help`。',
          auth:
            '复用 qodercli 登录，或在 ACP 客户端配置 PAT 环境变量。',
          deployment:
            'Qoder IDE、JetBrains Plugin 与任意兼容 ACP 的客户端。',
          conditions:
            'ACP 命令集合小于完整 CLI Slash 命令集合；Qoder IDE 功能也不能自动算入 Qoder CLI。',
          sources: ['qoder-acp', 'qoder-desktop'],
        },
      },
      related: ['surface-cli', 'surface-desktop', 'extension-mcp'],
    }),

    'surface-web': createDetail({
      id: 'surface-web',
      definition:
        '在浏览器中创建、查看、审批或继续 Agent 会话；既包括托管 Web 产品，也包括 CLI 自带的本地 Web UI。',
      includes: [
        '托管 Web Agent 界面',
        '本地 Agent Web Shell',
        '浏览器中的会话、Diff、审批和任务管理',
      ],
      excludes: [
        '只在浏览器完成账号登录',
        'IDE 内嵌 Webview',
        '没有会话控制能力的静态报告页',
      ],
      facts: [
        'Claude、Codex 与 Qoder 提供账号托管的 Web Surface；Qwen 和 Kimi 当前提供由本地服务进程托管的 Web UI。',
        '本地 Web UI 能否从其他设备访问取决于网络、绑定地址、TLS 与 token；它不自动成为厂商托管云服务。',
        'Web Surface 的工具、命令和文件位置取决于会话实际运行在本机还是云端。',
      ],
      products: {
        claude: {
          entry:
            'claude.ai/code 创建 Cloud session；Remote Control 页面打开本地会话。',
          protocol:
            '托管 Web 应用；Cloud session 连接 Anthropic VM，Remote Control 通过账号中继连接本机。',
          behavior:
            '创建/监控任务、查看 Diff、留言继续、审批、共享和归档会话。',
          state:
            'Cloud 会话保存在账号侧并可从 CLI teleport；Remote Control 状态由本地进程持有。',
          tools:
            'Cloud 使用克隆仓库中的项目配置；Remote Control 使用本机完整工具与文件。',
          auth:
            'Claude 账号；Cloud 通常连接 GitHub，Remote Control 要求同一账号与组织允许。',
          deployment:
            '浏览器端由 Anthropic 托管；执行位置按 Cloud 或 Remote Control 分开。',
          conditions:
            '不要把 Remote Control 与 Cloud 混写：前者本机执行，后者在托管 VM 中执行。',
          sources: ['claude-web', 'claude-remote-control'],
        },
        codex: {
          entry:
            'ChatGPT Web 中选择 Codex；Codex Cloud 页面创建和管理 coding task。',
          protocol:
            'OpenAI 托管 Web 产品，连接 Codex Cloud 环境与账号线程。',
          behavior:
            '选择仓库/环境，后台运行任务，查看日志、摘要和 Diff，继续任务并创建 Pull Request。',
          state:
            'Cloud chats 与 code reviews 保存在账号/工作区，可从 Web、CLI 或集成继续查看。',
          tools:
            '工具在配置的云环境中运行；依赖、环境变量、secrets 和网络由 environment 管理。',
          auth:
            'ChatGPT/Codex 账号与 GitHub 授权。',
          deployment:
            'Web 前端和 Agent 运行环境均由 OpenAI 托管。',
          conditions:
            '本地 CLI 和 IDE 的未提交文件不会自动出现在 Cloud；任务基于所连仓库和云环境。',
          sources: ['codex-cloud', 'codex-app'],
        },
        qwen: {
          entry:
            '`qwen serve` 根路径自带 Web Shell；`--open` 自动打开浏览器，`--no-web` 可禁用。',
          protocol:
            '同源静态 Web App 通过 HTTP REST 与 SSE 连接本地 daemon。',
          behavior:
            '提供聊天、Diff、提交历史、工具调用、权限请求、会话与工作区管理。',
          state:
            '会话由本地 daemon 和磁盘 transcript 管理；多浏览器客户端可共享同一会话。',
          tools:
            'Web Shell 使用 qwen serve 背后的 ACP 运行时和本地工具。',
          auth:
            'loopback 可无 token；共享或非 loopback 访问必须使用 bearer token。',
          deployment:
            'Web UI 与 API 由用户机器上的 qwen serve 提供，不是 Qwen 托管 Web 产品。',
          conditions:
            '当前 Daemon 为实验性本地部署；远程暴露需要自行处理网络和安全边界。',
          status: '条件项',
          sources: ['qwen-serve-current'],
        },
        kimi: {
          entry:
            '`kimi web` 启动并打开本地 Web UI；`--no-open` 只启动服务。',
          protocol:
            'Web UI 通过同进程 REST + WebSocket API 工作；服务公开 OpenAPI 与 AsyncAPI。',
          behavior:
            '在浏览器中管理会话、发送 prompt、展示工具、Diff、文件和媒体。',
          state:
            '使用本地 Kimi 会话与 home；多个服务实例可并存。',
          tools:
            '调用本地 Agent 的文件、Shell、搜索与 MCP 工具。',
          auth:
            '默认 bearer token；URL fragment 把 token 传给 Web UI，支持 rotate-token。',
          deployment:
            '默认只在 loopback；可绑定其他地址但仍是用户自托管。',
          conditions:
            '不是 Kimi 托管云任务；关闭前台 `kimi web` 进程后 Web 会话服务停止。',
          status: '条件项',
          sources: ['kimi-cli-surface-current'],
        },
        qoder: {
          entry:
            'Qoder Web / `qoder.com/agents`；Cloud Agents Console 管理 Cloud 与 Remote Control task。',
          protocol:
            'Qoder 托管 Web 产品，通过账号连接 Cloud Agent 或已配对的本地 CLI。',
          behavior:
            '创建云任务、选择 GitHub 仓库和分支、查看本地/云任务、处理审批并继续对话。',
          state:
            '云任务与本地远程任务出现在统一 conversation list。',
          tools:
            'Cloud task 使用云环境工具；Remote Control task 使用本机 CLI 工具。',
          auth:
            'Qoder 账号；云仓库任务需要 GitHub App/授权，本地任务需同账号配对。',
          deployment:
            'Web 由 Qoder 托管，执行位置可能是 Qoder Cloud 或用户本机。',
          conditions:
            'Web 统一列表并不表示两类任务共享文件系统；必须看任务是 Cloud 还是 Remote Control。',
          sources: ['qoder-web', 'qoder-remote-control', 'qoder-cloud-mode'],
        },
      },
      related: ['surface-service', 'surface-cloud', 'surface-remote-control'],
    }),

    'surface-desktop': createDetail({
      id: 'surface-desktop',
      definition:
        '以原生或 Electron 桌面应用提供 Agent 会话、文件审阅、终端和项目管理，而不是只在终端或编辑器插件中运行。',
      includes: [
        '官方桌面应用或官方桌面 IDE',
        '本地 Agent 运行与文件审阅',
        '桌面端特有的多会话、预览或计算机控制',
      ],
      excludes: [
        'VS Code Extension 被当作独立桌面应用',
        '浏览器 PWA',
        '仅有仓库源码但没有产品定位的实验 UI',
      ],
      facts: [
        'Claude、Codex、Qwen 和 Qoder 都有明确桌面产品；Kimi Code 当前公开 Surface 是 CLI、VS Code、ACP 与本地 Web。',
        'Qwen Code Desktop 是 Qwen Code 仓库内的 Electron 应用，并通过 ACP 驱动打包的 Qwen CLI runtime。',
        '桌面端经常增加 Worktree、多窗格、文件预览和会话管理，但不意味着 Headless 参数或全部 CLI 命令在 GUI 中可用。',
      ],
      products: {
        claude: {
          entry:
            'Claude Desktop 的 Code tab，macOS 与 Windows 客户端。',
          protocol:
            '桌面 GUI 调用 Claude Code 运行时，可选择 Local、Remote 或 SSH 环境。',
          behavior:
            '并行会话与自动 Worktree、终端/编辑器/预览、多窗格、Side chat、Diff 评论、Computer Use、PR monitoring 和 scheduled task。',
          state:
            '每个会话独立跟踪上下文和改动；Remote 会话关机后仍在云端继续。',
          tools:
            'Local/SSH 可用项目配置、MCP 与 Plugins；Desktop 另有 Connectors 与 Computer Use。',
          auth:
            'Claude 账号；企业可通过 managed settings 和管理台控制可用能力。',
          deployment:
            'macOS 和 Windows；Local、Anthropic Remote 或用户 SSH 主机。',
          conditions:
            'Desktop 是交互式 Surface，不支持 `--print`/`--output-format`；Agent Teams 仍是 CLI/SDK 能力。',
          sources: ['claude-desktop'],
        },
        codex: {
          entry:
            'ChatGPT Desktop 中选择 Codex，在 macOS/Windows 应用内创建 coding chat。',
          protocol:
            'ChatGPT 桌面应用连接本地文件夹、Codex 本地运行时和 Cloud。',
          behavior:
            '集中管理项目和长运行任务，打开文件、审阅产物、使用浏览器/电脑工具并调度任务。',
          state:
            '项目和 chat 保存在 ChatGPT 工作区；Codex 本地与 Cloud task 按各自环境保留状态。',
          tools:
            '可使用本地文件、终端、浏览器、Computer Use 和 Plugins；具体工具受当前模式与权限控制。',
          auth:
            'ChatGPT 账号与工作区权限。',
          deployment:
            'macOS 与 Windows ChatGPT Desktop。',
          conditions:
            '当前桌面产品是 ChatGPT app 内的 Codex，不再是单独命名的 Codex App；Cloud task 与本地 folder task 仍需区分。',
          sources: ['codex-app', 'codex-cloud'],
        },
        qwen: {
          entry:
            'Qwen Code Desktop；GitHub release 提供 macOS、Windows、Linux 构建。',
          protocol:
            'Electron 应用通过 ACP 驱动随应用打包的 Qwen Code CLI runtime。',
          behavior:
            '多会话 chat、source connection、Skills、文件/Office/PDF/Diff 预览、Automation 和权限模式。',
          state:
            '本地优先保存 workspace、会话与 source；每个 Agent session 由 Qwen runtime 承载。',
          tools:
            '使用 Qwen Code 模型发现、MCP、REST/文件 source、Skills、Permission mode 和 Automation。',
          auth:
            '复用 Qwen Code runtime 认证；桌面应用不保存第三方 LLM API key。',
          deployment:
            '官方仓库可构建 macOS、Windows、Linux 安装包。',
          conditions:
            '桌面包在仓库 workspace 中被排除于根 npm workspace，使用 Bun/Electron 独立构建；功能不能自动计入 CLI。',
          sources: ['qwen-desktop-current', 'qwen-acp-current'],
        },
        kimi: {
          entry:
            '当前官方仓库未提供独立 Kimi Code Desktop 安装包。',
          protocol:
            '桌面图形体验由 VS Code Extension 或浏览器中的 `kimi web` 提供。',
          behavior:
            '可以在编辑器或本地 Web UI 使用 Agent，但没有单独桌面应用的项目/窗口生命周期。',
          state:
            '会话仍由本地 Kimi Code runtime 保存。',
          tools:
            'VS Code、ACP 与 Web 复用 Kimi Agent 工具。',
          auth:
            '复用 Kimi Code 登录和 Provider。',
          deployment:
            'CLI、VS Code/ACP 或本地 Web；无独立桌面发行物。',
          conditions:
            '“有 VS Code Extension/Web UI”不等于“有 Desktop App”，后续若官方发布需重新核对。',
          status: '条件项',
          sources: [
            'kimi-cli-surface-current',
            'kimi-vscode-current',
            'kimi-ide-surface-current',
          ],
        },
        qoder: {
          entry:
            'Qoder IDE，官方桌面编辑器；另有 JetBrains Plugin。',
          protocol:
            '完整桌面 IDE 集成 Agent、项目索引、编辑器、终端与 Qoder 账号服务。',
          behavior:
            '打开/克隆项目、索引代码、Chat/Quest Agent、审阅改动并使用 IDE 内浏览器与工具。',
          state:
            'IDE 管理本地项目、索引和 Agent conversation；可与 Cloud/Remote task 联动。',
          tools:
            '提供 IDE Agent、终端、Sandbox、浏览器、索引、Rules 和 MCP 等产品能力。',
          auth:
            'Qoder 账号，可用 Google/GitHub 等登录。',
          deployment:
            'macOS 与 Windows 等官方支持桌面平台。',
          conditions:
            'Qoder IDE 是与 qodercli 并列的产品 Surface；IDE 索引和 Quest 等能力不自动算作 CLI 能力。',
          sources: ['qoder-desktop', 'qoder-docs'],
        },
      },
      related: ['surface-ide', 'surface-web', 'execution-worktree'],
    }),

    'surface-cloud': createDetail({
      id: 'surface-cloud',
      definition:
        '由厂商管理的隔离计算环境克隆或连接远端仓库，在用户机器离线后仍能持续执行 Agent 任务。',
      includes: [
        '托管 VM/容器与后台执行',
        '仓库、环境和任务生命周期',
        '从 CLI/Web 发起并在其他 Surface 继续',
      ],
      excludes: [
        '把本地 Daemon 部署到自己的服务器',
        'Remote Control 本机任务',
        '普通第三方 CI Runner',
      ],
      facts: [
        'Claude Code、Codex 和 Qoder 提供明确的托管云任务；Qwen Code 与 Kimi Code 当前公开服务都是用户自托管。',
        '托管云任务通常只能看到 Git 仓库、显式环境和 secrets，看不到用户机器上未上传的任意文件。',
        'Qoder Cloud Mode 与 Remote Control 明确互补：前者关闭本机仍运行，后者要求本机在线。',
      ],
      products: {
        claude: {
          entry:
            '`claude --remote "<task>"`、claude.ai/code 或 Desktop Remote 环境。',
          protocol:
            '创建 Anthropic 托管 Cloud session；CLI 可用 `/tasks` 查看，`--teleport`/`/teleport` 拉回本地。',
          behavior:
            '在新 VM 中克隆仓库、运行 setup、执行任务、生成 Diff/分支并可在 Web/移动端继续。',
          state:
            '任务在本机关闭后继续；会话、分支和对话保存在账号侧，环境闲置后可回收再恢复。',
          tools:
            '使用仓库内 CLAUDE.md、settings、MCP、Skills、Agents 和 Hooks；用户 home 配置不会自动带入。',
          auth:
            'Claude 账号；通常连接 GitHub，也支持仓库 bundle fallback。',
          deployment:
            'Anthropic 管理的 Ubuntu VM 与可配置 Cloud environment。',
          conditions:
            '资源、网络和 secrets 有独立限制；本地未提交内容只有在显式 bundle 路径中才可能上传，未跟踪文件不包含。',
          sources: ['claude-web', 'claude-desktop'],
        },
        codex: {
          entry:
            'Codex Cloud Web、CLI Cloud 入口，或从 GitHub、Linear、Slack 发起。',
          protocol:
            '每个任务运行在专用隔离 Cloud environment，支持后台与并行。',
          behavior:
            '连接 GitHub、执行 setup、运行任务、展示摘要和 Diff，并可继续修改或开 PR。',
          state:
            'Cloud chat、code review 和环境保存在账号/工作区；任务不依赖本机持续在线。',
          tools:
            '使用环境中安装的工具、变量、secrets 和网络规则。',
          auth:
            'ChatGPT/Codex 账号与 GitHub/第三方集成授权。',
          deployment:
            'OpenAI 托管云环境。',
          conditions:
            'Cloud 使用远端仓库状态；本地未提交改动和本机专有依赖不会自动出现。',
          sources: ['codex-cloud', 'codex-github'],
        },
        qwen: {
          entry:
            '当前没有厂商托管的 Qwen Code 仓库任务入口；可自行部署 `qwen serve` 或在 CI 中运行 Headless。',
          protocol:
            '自托管 HTTP + SSE Daemon 或普通 CLI 进程，不是 Qwen 管理的 Cloud task API。',
          behavior:
            '用户可在自己的远程主机上保持 Agent 服务，但任务生命周期、队列、TLS、存储和故障恢复由用户负责。',
          state:
            '会话落在用户选择的机器和本地磁盘。',
          tools:
            '可使用该自托管环境中的全部 Qwen Code 工具。',
          auth:
            'Provider 认证与自建 Daemon bearer token。',
          deployment:
            '用户机器、服务器或 CI；不属于厂商托管云。',
          conditions:
            '“可以部署到云主机”不等于“提供 Cloud Mode”；当前 qwen serve 文档还明确限定 alpha 的本地部署边界。',
          status: '条件项',
          sources: ['qwen-serve-current', 'qwen-session-headless'],
        },
        kimi: {
          entry:
            '当前没有厂商托管的 Kimi Code 仓库任务入口；可在自己的主机运行 `kimi web` 或 Headless。',
          protocol:
            '自托管 REST + WebSocket/Web UI 或单次 CLI 进程。',
          behavior:
            '远程服务器可运行 Kimi Agent，但仓库克隆、后台任务、网络、TLS 和恢复由部署者管理。',
          state:
            '会话与文件保存在运行 kimi 的主机。',
          tools:
            '使用该主机上的 Kimi Code 工具和 Provider。',
          auth:
            'Kimi/Provider 认证与 Web bearer token。',
          deployment:
            '用户管理的本机、服务器或 CI；无公开托管 Cloud Agent。',
          conditions:
            '本地 Web UI 与可绑定远程地址不构成厂商托管云任务。',
          status: '条件项',
          sources: ['kimi-cli-surface-current'],
        },
        qoder: {
          entry:
            '`qodercli --remote "<task>"`；Web 选择 Cloud environment；`/remote-env` 设置默认环境。',
          protocol:
            '在 Qoder 管理的 VM 创建 Cloud Session，CLI 通过流式通道显示事件，结束后打印 Web URL。',
          behavior:
            '任务在 Cloud environment 中读写远端 GitHub 仓库；关闭本地终端后继续运行，可从 Web console 跟进。',
          state:
            '每次 `--remote` 创建独立 Cloud Session；环境和会话由账号侧保存。',
          tools:
            '使用云环境中的工具和仓库；SDK 实验性 Cloud Agent 也能通过 SSE 驱动该运行时。',
          auth:
            'Qoder 登录/PAT、Cloud environment ID 和对应 GitHub 仓库授权。',
          deployment:
            'Qoder 托管 Cloud VM/容器。',
          conditions:
            '不能读取本地未提交修改；Ctrl+C 只断开 CLI 订阅，不会停止云任务。',
          sources: ['qoder-cloud-mode', 'qoder-cloud-agent'],
        },
      },
      related: ['surface-web', 'surface-remote-control', 'execution-ci'],
    }),

    'surface-remote-control': createDetail({
      id: 'surface-remote-control',
      definition:
        '让另一个终端、浏览器或移动设备接入正在运行的本地 Agent，或把托管会话带回本地继续；需要区分本机执行与云端执行。',
      includes: [
        '远程控制本机会话',
        '跨机器终端连接',
        '本地与云端会话的继续或传送',
      ],
      excludes: [
        '只查看静态日志',
        '普通 SSH 后手工启动另一会话',
        '把所有云任务统称为远程控制',
      ],
      facts: [
        'Claude 与 Qoder 提供账号中继的本地会话远程控制，浏览器/手机可处理审批并继续发消息。',
        'Codex app-server 可让另一个 CLI TUI 跨机器连接服务端 workspace；Qwen serve 与 kimi web 也能被远程客户端连接，但网络由用户自建。',
        'Claude teleport 是把云会话与分支拉回 CLI；它与 Remote Control 同品牌但状态移动方式不同。',
      ],
      products: {
        claude: {
          entry:
            '本地 `/remote-control`、`/rc` 或 `claude remote-control`；云转本地用 `--teleport`、`/teleport`。',
          protocol:
            'Remote Control 通过 Claude 账号中继连接 claude.ai/code 或移动 App；teleport 拉取云分支和完整对话。',
          behavior:
            '终端、浏览器和手机可同时发送消息、查看状态与审批；本地工具和文件不上传到 Cloud runtime。',
          state:
            'Remote Control 保持一个本地会话；teleport 把 Cloud session 的分支与历史恢复到本地 CLI。',
          tools:
            'Remote Control 使用本机文件、MCP、工具和项目配置；teleport 后使用本地环境。',
          auth:
            '同一 Claude 账号、短期连接 token 和组织 Remote Control 开关。',
          deployment:
            'Remote Control 执行留在本机；teleport 的起点是 Anthropic Cloud。',
          conditions:
            '本机睡眠或离线时 Remote Control 暂停并等待重连；不能把它当作本机关闭仍运行的 Cloud task。',
          sources: ['claude-remote-control', 'claude-web'],
        },
        codex: {
          entry:
            '服务端 `codex app-server --listen ws://...`，客户端 `codex --remote <endpoint>`；Cloud task 可从 Web/CLI 继续。',
          protocol:
            '远程 TUI 使用 WebSocket/Unix socket 上的 app-server JSON-RPC；Cloud 使用账号侧任务 Surface。',
          behavior:
            '远端 CLI 操作服务端工作区、审批和线程；Cloud 任务可从另一设备查看和继续。',
          state:
            'app-server thread 与文件留在服务端；Cloud thread 留在账号和云环境。',
          tools:
            '远程 TUI 使用服务端 Codex 工具、沙箱和文件；Cloud 使用配置的环境工具。',
          auth:
            '非本地 WebSocket 要求 token、WSS/TLS 或 SSH 转发；Cloud 使用 ChatGPT/Codex 账号。',
          deployment:
            '自管 app-server 远程主机，或 OpenAI 托管 Cloud。',
          conditions:
            'WebSocket transport 当前标为 experimental/unsupported；这不是 Qoder/Claude 式移动端账号中继。',
          status: '条件项',
          sources: ['codex-app-server', 'codex-cloud'],
        },
        qwen: {
          entry:
            '远程客户端连接 `qwen serve`；Web Shell、SDK DaemonClient 或 Channel 都可成为客户端。',
          protocol:
            'HTTP + SSE；多客户端可共享会话和权限请求，SSE 使用 Last-Event-ID 重连。',
          behavior:
            '远程浏览器或自定义客户端发送 prompt、处理审批、查看 Diff 与会话状态；文件操作发生在 daemon 主机。',
          state:
            '会话和 transcript 留在 daemon 主机；客户端重连可恢复事件窗口或加载历史。',
          tools:
            '使用 daemon workspace 的 Qwen 工具、MCP、Skills 与 Channel。',
          auth:
            '非 loopback 必须 bearer token；远程设备登录可由 daemon device flow 完成。',
          deployment:
            '用户自建网络和服务主机；当前不是 Qwen 账号托管的全局中继。',
          conditions:
            'qwen serve alpha 明确以本地单机/小团队为边界；生产跨公网需自行承担 TLS、代理、故障恢复和版本协商。',
          status: '条件项',
          sources: ['qwen-serve-current', 'qwen-sdk-current'],
        },
        kimi: {
          entry:
            '`kimi web --host 0.0.0.0` 或指定地址，让其他设备打开 Web UI/API。',
          protocol:
            'REST + WebSocket，bearer token 鉴权；部署者负责网络可达性。',
          behavior:
            '远程浏览器可发送 prompt、查看工具与文件；执行仍发生在运行 kimi web 的主机。',
          state:
            '会话、文件和 token 留在服务主机；服务退出后连接结束。',
          tools:
            '使用服务主机上的 Kimi 工具、Shell 和 Provider。',
          auth:
            '默认 bearer token，可轮换；不得在公网使用 bypass-auth。',
          deployment:
            '自管本机或远程服务器，没有官方账号中继。',
          conditions:
            '当前没有托管跨端 handoff 或移动端 Remote Control；只有可远程部署的本地 Web 服务。',
          status: '条件项',
          sources: ['kimi-cli-surface-current'],
        },
        qoder: {
          entry:
            '会话内 `/remote-control`；后台模式 `qodercli remote-control`；Web 入口 `qoder.com/agents`。',
          protocol:
            'Qoder 账号中继连接本地 CLI、Qoder Web 和移动 App。',
          behavior:
            '查看本地任务、批准/拒绝操作、发送新任务；Daemon 模式可在没有预先打开会话时接收多个任务。',
          state:
            '任务、文件和命令留在本机；Web/移动端同步状态与控制消息。',
          tools:
            '使用本地 qodercli 的全部 workspace 工具和权限。',
          auth:
            '同一 Qoder 账号，通过二维码或 URL 配对。',
          deployment:
            '本机 CLI 必须持续运行和联网；Web/移动前端由 Qoder 托管。',
          conditions:
            '与 `qodercli --remote` Cloud Mode 不同：Remote Control 本机离线就无法继续，Cloud Mode 不依赖本机。',
          sources: ['qoder-remote-control', 'qoder-web'],
        },
      },
      related: ['surface-service', 'surface-web', 'surface-cloud'],
    }),
  });
})();

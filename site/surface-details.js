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
            '官方另有桌面端（`kimi install-desktop` 与 `/desktop` 打开下载页、`kimi app [path]` 唤起，见桌面端字段），但不从桌面端反推 CLI 能力；VS Code 与 Web UI 是另外的客户端。',
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
        'Qwen Web Shell 自 v0.21.9 支持图片拖拽/粘贴输入与图片-only prompt，自 v0.21.12-preview.3 预览通道支持把本地文件直传进工作区，main 分支还支持把受支持的文本文件以附件形式随 prompt 提交（尚未发布）；Claude、Codex、Kimi、Qoder 的官方 Web 文档未列浏览器侧图片拖拽、粘贴、文本文件附件或本地文件上传（Claude 可由 CLI `claude --cloud` 把整个本地仓库打包上传到云会话，不属于浏览器侧文件上传）。',
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
            '`qwen serve` 根路径自带 Web Shell；`--open` 自动打开浏览器，`--no-web` 可禁用；条件：图片输入经输入区拖拽或粘贴进入（v0.21.9 起）；工作区文件上传经输入区拖入普通文件或 `@` 文件面板的“上传文件”进入（v0.21.12-preview.3 预览通道）；文本文件附件经粘贴进入输入区，当前工作区没有工作区上传入口时拖拽也可进入（main 分支，尚未发布）。',
          protocol:
            '同源静态 Web App 通过 HTTP REST 与 SSE 连接本地 daemon；图片以 base64 附件随 prompt 载荷提交；文件上传走独立的二进制路由 `POST /file/upload`（主工作区）与 `POST /workspaces/:workspace/file/upload`（qualified 工作区），要求 `Content-Type: application/octet-stream`（否则 415），不复用文本写入路由；v1 无 ACP-HTTP 对等上传方法。文本附件不内联进 prompt 字符串，而是作为独立文件对象随 prompt 提交，ACP 会话侧嵌入为带 `attachment:///<文件名>` URI 的文件引用资源块（展开形如 `File: attachment:///app.log` 加文件正文）；transcript block 只保存附件 `name` 与 `mimeType` 元数据，不保存正文（条件：main 分支，尚未发布）。',
          behavior:
            '提供聊天、Diff、提交历史、工具调用、权限请求、会话与工作区管理；条件：可向输入区拖拽或粘贴图片（`image/png`、`image/jpeg`、`image/gif`、`image/webp`、`image/bmp`；SVG、TIFF、HEIC、PDF、目录与远程 URL 拒绝），`image/x-bmp`/`image/x-ms-bmp` 归一为 BMP，并支持只含图片、不带文字的 prompt；BMP 在 Anthropic Provider 路径降级为文本说明。输入区拖入普通文件或混合批次走工作区上传：拖放上传到目标工作区根目录，`@` 面板“上传文件”上传到当前浏览目录；多文件按顺序上传，支持进度与取消；重名时在扩展名前自动插入 ` (N)` 编号（`report.pdf → report (1).pdf`、`README → README (1)`、`.env → .env (1)`，最多 1000 次尝试），上传从不覆盖已有文件；仅包含受支持图片的批次仍走图片附件流程。文本文件附件（main 分支，尚未发布）：受支持文本文件经粘贴成为随 prompt 提交的附件，接受范围按 `TEXT_FILE_EXTENSIONS` 扩展名白名单（`log`/`txt`/`text`/`md`/`markdown`/`json`/`jsonl`/`ndjson`/`csv`/`tsv`/`xml`/`yaml`/`yml`/`toml`/`ini`/`cfg`/`conf`/`config`/`env`/`properties`/`sh`/`bash`/`zsh`/`py`/`js`/`mjs`/`cjs`/`jsx`/`ts`/`mts`/`cts`/`tsx`/`java`/`go`/`rs`/`c`/`h`/`cpp`/`cc`/`cxx`/`hpp`/`cs`/`rb`/`php`/`swift`/`kt`/`scala`/`sql`/`html`/`htm`/`css`/`scss`/`less`/`vue`/`svelte`/`diff`/`patch`）、`TEXT_FILENAMES` 知名文件名（Dockerfile、Makefile、LICENSE、README、Gemfile、Procfile、Vagrantfile）或 `text/*` 与 `TEXT_MIME_TYPES`（`application/json`、`application/xml`、`application/javascript`、`application/x-javascript`、`application/typescript`、`application/yaml`、`application/x-yaml`、`application/toml`、`application/x-sh`、`application/sql`）判断；扩展名与知名文件名回退优先于 OS MIME 绑定（修正 Windows 上 `.ts`/`.mts` 被绑为 video/mp2t、`.csv`/`.tsv` 被绑为 Excel 导致白名单不可达的问题）；解码后含 NUL 字符的二进制内容按 `unsupported` 拒绝。',
          state:
            '会话由本地 daemon 和磁盘 transcript 管理；多浏览器客户端可共享同一会话；条件：排队 prompt 的图片附件在重试/编辑流程中恢复；admission 结果未知时输入区进入只读锁定，需手动丢弃或恢复，恢复不自动发送；页面重载后恢复的排队项仅含摘要、不含图片数据。上传进度显示在输入区上方，成功条目三秒后消失，结果成为可移除的行内文件标签（使用服务端确认的路径）；TypeScript SDK 的 `uploadWorkspaceFile`（`DaemonClient` 与 `WorkspaceDaemonClient`）提供同一上传操作，支持进度回调、取消与超时。文本附件（main 分支，尚未发布）：附件显示为输入区内可单独移除的 chip，文件名为去除 bidi/零宽字符后的净化名并附格式化大小（B/KB/MB），重名自动追加 `-2` 等后缀；单条 prompt 的全部文本附件共享 512 KiB 累计预算（`MAX_TEXT_ATTACHMENT_DATA_BYTES = 512 * 1024`），图片仍为 8 MiB（`MAX_IMAGE_ATTACHMENT_DATA_BYTES = 8 * 1024 * 1024`）；附件随重试血缘恢复（取消重试与失败回合重试路径均保留），页面恢复经 `editor.restoreFiles()` 重建，恢复前重置路径以防附件丢失或跨会话泄漏；超限按 `too-large`、读取失败按 `read-failed`、其余按跳过分别提示。',
          tools:
            'Web Shell 使用 qwen serve 背后的 ACP 运行时和本地工具。',
          auth:
            'loopback 可无 token；共享或非 loopback 访问必须使用 bearer token。',
          deployment:
            'Web UI 与 API 由用户机器上的 qwen serve 提供，不是 Qwen 托管 Web 产品。',
          conditions:
            '当前 Daemon 为实验性本地部署；远程暴露需要自行处理网络和安全边界。图片输入于 2026-08-10 合入 main 并随 v0.21.9（2026-08-10）发布；工作区文件上传于 2026-08-13 合入 main（提交 `a8bcaefea72d`），随 v0.21.12-preview.3（2026-08-14）预览通道发布，稳定通道尚未发布。文本文件附件于 2026-08-15 合入 main（提交 `34cc1c3ede69`，PR #9180），最新预览发布 v0.21.12-preview.5（2026-08-16，自 release 分支切出）未包含该提交，预览与稳定通道均未发布。文件上传需 daemon 声明 `workspace_file_upload` 能力（qualified 工作区另需 `workspace_qualified_rest_core`），上限经 `limits.maxWorkspaceFileUploadBytes` 通告；不声明该能力的旧 daemon 会隐藏两个上传入口。单文件上限 50 MiB（`MAX_UPLOAD_BYTES`，与 5 MiB 的 `MAX_WRITE_BYTES` 文本写入上限相互独立，当前不可配置）；单批最多 100 个文件，文件名上限 255 字节，最多 4 个并发上传，饱和时返回 429 `upload_busy`；超出上限返回 413 `file_too_large`；不受信任、未知或 draining 的工作区返回 403 且不回退主工作区；新文件以 `0o600` 权限经临时文件原子发布，中断或取消不暴露部分文件，取消为尽力而为（服务端已开始发布时仍可能写完整文件）；不支持断点续传、分块上传、文件夹上传与原地覆盖。官方用户文档尚未描述图片输入与文件上传，仍把 prompt 路径图片/文件附件列为已知缺口（`MessageEmitter` 只渲染文本；main 分支 qwen-serve.md 未更新，文本附件同样未描述）。拖拽路由规则不变：工作区上传入口可用时，含任一非图片文件的拖拽批次整批走工作区上传，文本附件经粘贴进入，或在当前工作区没有工作区上传入口（如 daemon 未声明 `workspace_file_upload`）时经拖拽进入；`@` 面板“上传文件”与文件选择器仍走工作区上传。客户端单批 base64 预算 8 MiB、并发读取上限 4，超预算按 `too-large` 拒绝；daemon 请求体上限 10 MB（超出返回 413）；Core 内联媒体默认上限 10 MiB（解码后字节，可经 daemon 环境变量配置）。',
          status: '条件项',
          sources: [
            'qwen-serve-current',
            'qwen-web-shell-image-dnd',
            'qwen-web-shell-image-design',
            'qwen-web-shell-image-ingestion',
            'qwen-v0219-release',
            'qwen-web-shell-file-upload-commit',
            'qwen-web-shell-file-upload-design',
            'qwen-web-shell-file-upload-policy',
            'qwen-web-shell-file-upload-capabilities',
            'qwen-v02112-preview3-release',
            'qwen-web-shell-text-attachments-commit',
            'qwen-web-shell-text-ingestion',
            'qwen-web-shell-text-editor',
            'qwen-v02112-preview5-release',
          ],
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
        '以独立桌面应用（原生、Electron 或 Tauri 一类带 Web 视图的壳）或官方桌面 IDE 提供 Agent 会话、文件审阅、终端和项目管理，而不是只在终端或编辑器插件中运行。',
      includes: [
        '官方桌面应用或官方桌面 IDE',
        '本地 Agent 运行与文件审阅',
        '桌面端特有的多会话、预览或计算机控制',
        '桌面端的平台范围、安装与更新通道',
        'CLI 或 TUI 中唤起、下载桌面端的入口',
      ],
      excludes: [
        'VS Code Extension 被当作独立桌面应用',
        '浏览器 PWA',
        '仅有仓库源码但没有产品定位的实验 UI',
        '桌面端里逐条可用的 Slash 命令或 Headless 参数',
      ],
      facts: [
        '五家都有桌面产品，但形态不同：Claude 是 Claude Desktop 的 Code 页签，Codex 是 ChatGPT 桌面应用内的 Codex，Qwen 是仓库内的 Tauri 2 壳，Qoder 是完整桌面 IDE，Kimi 的桌面端本体不在公开 CLI 仓库内、CLI 只提供唤起与下载页入口。',
        'Linux 桌面端在 2026-10-09 核对时四家可用但阶段不同：Claude Desktop 标注 beta（只支持 Debian 系，apt 仓库或 `.deb`），ChatGPT 桌面应用标注 preview（Ubuntu 24.04/26.04 LTS、Debian 13、Fedora 43/44、Arch，x64 与 ARM64），Qwen Code Desktop 随 `desktop-v0.25.0` 发布 AppImage 与 `.deb`（amd64 与 arm64），Qoder 官方下载页把 Linux（`.deb`/`.rpm`）与 macOS 12+、Windows 10+ 并列；Kimi 桌面端的平台清单没有一手说明。',
        'Computer Use 在 Linux 桌面端缺席：Claude 的 Linux beta 明确列出 Computer Use 与语音听写尚不可用，Codex 的 Linux 预览也写明 Computer Use 只在 macOS 与 Windows、后续版本再加。',
        '更新通道各不相同：Claude Desktop 在 macOS 与 Windows 启动时自更新、Linux 只能靠系统包管理器；ChatGPT 桌面应用的 Linux 包由签名的 OpenAI 包仓库经发行版包管理器更新；Qwen 桌面壳用 Tauri updater 读 `desktop-latest.json`；Kimi CLI 只打开下载页，不下载也不安装桌面端。',
        '桌面端经常增加 Worktree、多窗格、文件预览和会话管理，但不意味着 Headless 参数或全部 CLI 命令在 GUI 中可用：Claude Desktop 不支持 `--print`/`--output-format`，Agent Teams 仍是 CLI/SDK 能力。',
      ],
      products: {
        claude: {
          entry:
            'Claude Desktop 的 Code 页签；下载项为 macOS（Universal，Intel 与 Apple Silicon）、Windows（x64，另有 ARM64 安装器）与 Linux（beta，apt 或 `.deb`，Ubuntu 与 Debian）；安装后启动 Claude、登录并点开 Code 页签，Linux 可从应用启动器或终端运行 `claude-desktop`。',
          protocol:
            '桌面 GUI 调用 Claude Code 运行时，可选择 Local、Remote 或 SSH 环境，Windows 上还可选择 WSL 2 发行版；应用分 Chat、Cowork 与 Code 三个页签，Code 页签是 Claude Code 的参考界面。',
          behavior:
            '并行会话与自动 Worktree、终端/编辑器/预览、多窗格、Side chat、Diff 评论、Computer Use、iOS Simulator 窗格、PR monitoring、Dispatch 会话与 scheduled task；Linux beta 提供与 macOS/Windows 相同的 Chat、Cowork 与 Code 体验（并行会话、可视化 Diff 审阅、集成终端与编辑器、实时应用预览）。',
          state:
            '每个会话独立跟踪上下文和改动；Remote 会话关机后仍在云端继续；Linux 上登录状态存在桌面 keyring（GNOME Keyring 或 KDE Wallet），拿不到已解锁的 keyring 时登录不保存、每次启动都要重新登录。',
          tools:
            'Local/SSH 可用项目配置、MCP 与 Plugins；Desktop 另有 Connectors 与 Computer Use；Skills、Plugins 与 Connectors 取自 claude.ai 账号同步的 Customize 配置，而不是 CLI 的 `~/.claude` 目录。',
          auth:
            'Claude 账号（claude.ai 订阅或组织 SSO）；桌面端不直接接受 Console API Key，API Key 认证走 CLI；企业可用 managed settings 与管理台控制能力，设备策略在 macOS 走 MDM 的 `com.anthropic.claudefordesktop`、Windows 走注册表 `SOFTWARE\\Policies\\Claude`、Linux 走 root 所有的 `/etc/claude-desktop/managed-settings.json`（与 Claude Code 的 managed settings 是不同文件，非 root 可写时拒绝加载）。',
          deployment:
            'macOS、Windows（x64 与 ARM64）与 Linux beta；Linux 要求 Debian 系发行版（Ubuntu 22.04 及以上或 Debian 12 及以上）与 x86_64 或 arm64，Fedora、Arch 等非 Debian 系改用 CLI，Windows 上的 WSL 2 装 Windows 桌面应用并在发行版内运行会话；会话可跑在 Local、Anthropic Remote 或用户 SSH 主机，Cowork 在 Linux 上把任务跑在桌面应用用 QEMU 与 KVM 托管的虚拟机里。',
          conditions:
            'Desktop 是交互式 Surface，不支持 `--print`/`--output-format`；Agent Teams 仍是 CLI/SDK 能力，桌面端内的多代理改用 dynamic workflows。Linux 支持标注为 beta：安装走 Anthropic 的 apt 仓库（签名密钥 `https://downloads.claude.ai/claude-desktop/key.asc`，指纹 `31DDDE24DDFAB679F42D7BD2BAA929FF1A7ECACE`，仓库项写入 `/etc/apt/sources.list.d/claude-desktop.list`，只发布 amd64 与 arm64），也可直接下载 `.deb` 安装，`/etc/default/claude-desktop` 写 `CLAUDE_DESKTOP_ADD_REPO="false"` 可跳过仓库注册；Linux 上应用不自更新，更新随 `sudo apt update && sudo apt upgrade` 或发行版图形更新器到达，`sudo apt remove claude-desktop` 会连带移除它注册的仓库项与签名密钥；以 root 启动且不加 `--no-sandbox` 不受支持。Linux beta 暂缺 Computer Use 与语音听写，Quick Entry 全局热键只在 X11 生效、原生 Wayland 需要桌面环境的 GlobalShortcuts portal，Fedora 与 RHEL 尚未支持。Cowork 另需固件开启硬件虚拟化、`qemu-system-x86`/`ovmf`/`virtiofsd`（x86_64）或 `qemu-system-arm`/`qemu-efi-aarch64`/`virtiofsd`（arm64）、用户在 `kvm` 组内并能打开 `/dev/kvm` 与 `/dev/vhost-vsock`，缺项时 Cowork 页签给出对应报错（Ubuntu 22.04 没有 `virtiofsd` 包时改用应用自带副本）。',
          sources: ['claude-desktop', 'claude-desktop-linux'],
        },
        codex: {
          entry:
            'ChatGPT Desktop 中选择 Codex；macOS 与 Windows 从 `https://chatgpt.com/download/` 下载，Linux 预览版按发行版取 `.deb`（Ubuntu/Debian）、`.rpm`（Fedora）或 Arch 安装脚本，安装后从应用菜单打开或在终端运行 `chatgpt`。',
          protocol:
            'ChatGPT 桌面应用连接本地文件夹、Codex 本地运行时和 Cloud；在应用里选择 ChatGPT 或 Codex，Codex 从 New chat 开始，也可用 New chat 右侧的 Quick chat 图标提快速问题。',
          behavior:
            '集中管理项目和长运行任务，打开文件、审阅产物、使用浏览器/电脑工具并调度任务；Linux 预览版登录后同样可以处理项目、本地文件与 Codex。',
          state:
            '项目和 chat 保存在 ChatGPT 工作区；Codex 本地与 Cloud task 按各自环境保留状态。',
          tools:
            '可使用本地文件、终端、浏览器、Computer Use 和 Plugins；具体工具受当前模式与权限控制；Computer Use 只在 macOS 与 Windows 可用，Linux 预览版还没有。',
          auth:
            'ChatGPT 账号与工作区权限；Linux 预览版用同一 ChatGPT 账号登录。',
          deployment:
            'macOS、Windows 与 Linux 预览版；Linux 预览支持 Ubuntu 24.04 LTS 与 26.04 LTS、Debian 13、Fedora 43 与 44、Arch Linux（当前完全更新的滚动版本），每个发行版都有 x64 与 ARM64 包。',
          conditions:
            '当前桌面产品是 ChatGPT app 内的 Codex，不再是单独命名的 Codex App；Cloud task 与本地 folder task 仍需区分。Linux 为预览版：`.deb`/`.rpm` 由 `https://persistent.oaistatic.com/codex-app-prod/linux/` 提供，Arch 用 `install-arch.sh`（脚本检测架构、配置签名的 OpenAI 包仓库并执行一次需确认的完整系统升级）；安装后由发行版包管理器更新（`sudo apt install --only-upgrade chatgpt`、`sudo dnf upgrade --refresh chatgpt`、`sudo pacman -Syu`）；其他 Linux 发行版可能可用但不受正式支持。原生 Wayland 支持仍是实验性，Wayland 会话默认走 XWayland，可用 `chatgpt --ozone-platform=wayland` 显式选择原生 Wayland，浮动窗口、窗口定位、焦点与快捷键可能不完整。',
          sources: ['codex-app', 'codex-app-linux'],
        },
        qwen: {
          entry:
            'Qwen Code Desktop；官方 GitHub Release `desktop-v0.25.0`（2026-10-05）提供 macOS `.dmg`（arm64 与 x64）与 `.app.tar.gz`（含 `.sig`）、Linux AppImage 与 `.deb`（amd64 与 arm64，含 `.sig`）、Windows `Qwen-Code-Desktop_0.25.0_x64-setup.exe`（含 `.sig`），另有 `SHA256SUMS.txt` 与更新清单 `desktop-latest.json`。',
          protocol:
            'Tauri 2 壳（`packages/desktop`，`productName` 为 `Qwen Code Desktop`、`identifier` 为 `com.alibaba.qwen-code`）包住既有 Web Shell：应用启动时在临时 loopback 端口拉起 `qwen serve`、带每次启动生成的 bearer token，等 `/health` 就绪后在原生窗口里打开同一个 daemon 提供的 Web Shell；`npm run build:runtime` 把当前平台的 Node.js、打包的 `qwen` CLI 与构建好的 Web Shell（`lib/web-shell/`）放进 `runtime/qwen-code/`，再作为 bundle 资源随安装包分发。',
          behavior:
            '界面与能力来自 daemon 提供的 Web Shell，壳本身不含第二套 UI；窗口缩放用 `Cmd`/`Ctrl` + `-`/`=`/`0` 或 `Ctrl`+滚轮，选定的比例下次启动恢复；Settings → Daemon → Local Control 可临时把在跑的 daemon 共享给同一 Wi-Fi 上的手机（Web Shell 显示二维码、共享期间保持机器唤醒、关闭时关掉 LAN 监听）；`QWEN_DESKTOP_WORKSPACE` 覆盖初始工作区，未设置时恢复已保存的主工作区或在首次启动创建 `~/Documents/Qwen`（`QWEN_DEFAULT_WORKSPACE_DIR` 改这个默认目录），DevTools 用 `Cmd+Option+I`（macOS）或 `Ctrl+Shift+I`（Windows/Linux）打开。',
          state:
            '本地优先保存 workspace 与会话，会话状态由 `qwen serve` daemon 承载；壳自己的状态（保存的工作区、窗口位置、缩放比例）写在 `~/Library/Application Support/com.alibaba.qwen-code/desktop-state.json`，daemon 日志写在 `~/Library/Logs/com.alibaba.qwen-code/desktop-runtime.log`（macOS 路径）。',
          tools:
            '使用 Web Shell 背后的 Qwen Code runtime：模型发现、MCP、REST/文件 source、Skills、Permission mode 与 Automation。',
          auth:
            '复用 Qwen Code runtime 认证；桌面壳不保存第三方 LLM API key。',
          deployment:
            '官方 Release 提供 macOS（arm64 与 x64）、Windows（x64）与 Linux（AppImage 与 `.deb`，amd64 与 arm64）安装包；`tauri.conf.json` 的 bundle targets 为 `app`/`dmg`/`nsis`/`appimage`/`deb`，macOS 最低系统版本 11.0 并开启 hardened runtime 与 entitlements，Windows 用 NSIS 按当前用户安装并以 downloadBootstrapper 静默安装 WebView2；更新经 Tauri updater，端点为 `https://qwen-code-assets.oss-cn-hangzhou.aliyuncs.com/desktop/latest/desktop-latest.json` 与 GitHub `desktop-latest` Release 上的同名清单。',
          conditions:
            '桌面包在仓库 workspace 中被排除于根 npm workspace，用 Tauri/Rust 与打包 runtime 独立构建（`npm install --workspaces=false`、`npm run build:runtime --workspaces=false`、`npm run dev --workspaces=false`），功能不能自动计入 CLI；`QWEN_DESKTOP_DISABLE_UPDATES=1` 关闭启动时的更新检查与提示，发布签名更新需要 Tauri updater 私钥（`TAURI_SIGNING_PRIVATE_KEY` 必须与配置里的公钥匹配），macOS 另需 Apple 签名与公证凭据。此前记录的 Electron + ACP 形态已过期：旧 `packages/desktop`（Electron，经 ACP 驱动 CLI）在 2026-08-25 提交 `ce72ddbe6cfe`（PR #9085）移除，Tauri 壳原名 `packages/desktop-shell`，2026-09-25 提交 `73aa65a4b41e`（PR #12653）改名为 `packages/desktop`；Electron→Tauri 更新桥沿用旧的产品名与应用标识，Windows 安装器（NSIS hook `windows/electron-migration.nsh`）在写入文件前用已注册的卸载器移除匹配的按用户 Electron 安装并保留用户数据，macOS ZIP 由签名并公证的 Tauri app 生成，Linux AppImage 更新直接替换当前 AppImage。',
          status: '官方确认',
          sources: [
            'qwen-desktop-current',
            'qwen-desktop-tauri-conf',
            'qwen-desktop-v0250-release',
            'qwen-desktop-tauri-rename',
            'qwen-desktop-electron-removal',
            'qwen-desktop-update-bridge',
          ],
        },
        kimi: {
          entry:
            '官方桌面端由 CLI 唤起或引导安装：`kimi app [path]`（省略路径时用当前目录）打开桌面端并在该目录开始新会话，`kimi install-desktop`（隐藏别名 `kimi install-app`）打印桌面端页面地址并在默认浏览器打开，TUI 内 `/desktop`（别名 `/install-desktop`）打开同一页面；桌面端本体不在公开的 kimi-code 仓库内。',
          protocol:
            '`kimi app` 把路径按当前目录解析为绝对路径，再请系统打开 `kimi-code://open?root=<URL 编码路径>&new=1`；打开动作按平台走 macOS `open`、Windows `powershell.exe -NoProfile -NonInteractive -EncodedCommand`（内部执行 `Start-Process -FilePath <url> -ErrorAction Stop`）或 Linux `xdg-open`，opener 先经 PATH 解析成绝对可执行文件（Windows 按 `PATHEXT`，缺省 `.COM`/`.EXE`/`.BAT`/`.CMD`），落在当前工作目录内的命中会被跳过以免执行工作区里植入的二进制，当前目录本身是文件系统根时不受该限制；`install-desktop` 与 `/desktop` 打开的地址由 `kimiCodeOfficialInstallUrl()` 取 `${siteBase}/code`，随区域为 `https://www.kimi.com/code`（国内）或 `https://www.kimi.ai/code`（全球）。',
          behavior:
            '`kimi app` 只负责唤起，不下载也不安装桌面端：目标工作区已存在时桌面端打开新草稿而不恢复之前的会话，系统报告打不开时向 stderr 写 “Could not open Kimi Code desktop. Run `kimi install-desktop` to install it.” 并把退出码置 1；`kimi install-desktop` 没有任何选项，先把地址写到 stdout 再打开浏览器；`/desktop` 在 TUI 里显示 “<url> — opened in your browser” 状态行后打开同一页面。',
          state:
            'CLI 侧不保存桌面端状态，也不检测桌面端版本；桌面端是否与 CLI 会话共享 home 目录或会话历史，官方文档没有说明。',
          tools:
            'CLI 只提供唤起与打开下载页两个动作，不声明桌面端的工具集；桌面端可用的工具、权限模式与文件边界没有公开文档。',
          auth:
            '唤起桌面端与打开下载页都不需要登录；桌面端自身的登录方式未确认。',
          deployment:
            'CLI 与 TUI 入口在 macOS、Windows 与 Linux 都能发起（分别用 `open`、PowerShell `Start-Process`、`xdg-open`）；官方产品页把 Kimi Code 的入口分为 Desktop、Terminal 与 IDE 三类，但桌面端支持的平台、架构与安装包形式在核对日期没有一手说明，记为未确认。',
          conditions:
            '`kimi app` 需要已安装支持从 CLI 打开工作区的桌面端版本；CLI 不做版本检测，已安装的旧桌面端可能静默忽略这个链接，失败提示只在系统 opener 报错时出现。`/desktop`（别名 `/install-desktop`）与 `kimi install-app` 随 2.0.0（2026-09-17）发布，2.0.1（2026-09-18）把子命令改名为 `kimi install-desktop` 并保留旧名为隐藏别名；`kimi app [path]` 于 2026-10-09 经 PR #4145 合入 main（合并提交 `242ac2300064`，changeset `.changeset/open-desktop-app.md` 给 `@moonshot-ai/kimi-code` 记 minor），核对日期最新 Release 仍是 2.1.1（2026-09-24），因此该子命令尚未发布。此前记录的“无独立桌面端”已过期：官方 CLI 参考与斜杠命令表都把该页面记为可下载并安装的桌面端应用。桌面端能力不自动计入 CLI，VS Code Extension 与本地 Web UI 也不等于桌面端。',
          status: '条件项',
          sources: [
            'kimi-desktop-cli-doc',
            'kimi-desktop-slash-doc',
            'kimi-desktop-changelog',
            'kimi-app-source',
            'kimi-install-desktop-source',
            'kimi-desktop-tui-source',
            'kimi-open-url-source',
            'kimi-resolve-command-source',
            'kimi-app-changeset',
            'kimi-app-pr',
            'kimi-v200-release',
            'kimi-v201-release',
            'kimi-v211-release',
            'kimi-desktop-page',
          ],
        },
        qoder: {
          entry:
            'Qoder IDE，官方桌面编辑器；下载入口是 `https://qoder.com/download`，官方快速上手要求从该页取安装包；另有 JetBrains Plugin。',
          protocol:
            '完整桌面 IDE 集成 Agent、项目索引、编辑器、终端与 Qoder 账号服务。',
          behavior:
            '打开/克隆项目、索引代码、Chat/Quest Agent、审阅改动并使用 IDE 内浏览器与工具；快捷键按 macOS 与 Windows 分别给出（`⌘O`/`Ctrl O` 打开项目、`⌥P`/`Alt P` 触发补全、`⌘I`/`Ctrl I` 打开 Inline Chat、`⌘L`/`Ctrl L` 打开 Chat 并选 Ask 或 Agent）。',
          state:
            'IDE 管理本地项目、索引和 Agent conversation；可与 Cloud/Remote task 联动。',
          tools:
            '提供 IDE Agent、终端、Sandbox、浏览器、索引、Rules 和 MCP 等产品能力。',
          auth:
            'Qoder 账号，可用 Google/GitHub 等登录；IDE 内点用户图标或按 `⌘⇧,`（macOS）/`Ctrl Shift ,`（Windows）打开 Sign in。',
          deployment:
            '官方下载页的 Qoder IDE 下载项为 macOS 12+、Windows 10+ 与 Linux（`.deb`/`.rpm`）；同页把 QoderWake（AI Employees）桌面端列为 macOS 13+、Windows 10+ 与 Linux 安装脚本，QoderWork 仍提供 Mac x64/ARM64 `.dmg` 与 Windows x64 用户/系统安装器。',
          conditions:
            'Qoder IDE 是与 qodercli 并列的产品 Surface；IDE 索引和 Quest 等能力不自动算作 CLI 能力。下载页顶部的主下载区另列 HarmonyOS 6.1.1+ 项，页面没有说明它对应哪个构建，记为未确认；同页公告 QoderWork 于 2027-09-05 停止运营，建议提前迁移到 Qoder Desktop（内置任务历史、Skill 与记忆的数据导入工具），过渡期内 QoderWork 仍可下载和使用。',
          sources: ['qoder-desktop', 'qoder-download-page', 'qoder-docs'],
        },
      },
      related: ['surface-ide', 'surface-web', 'surface-cli', 'execution-worktree'],
    }),

    'surface-cloud': createDetail({
      id: 'surface-cloud',
      definition:
        '由厂商管理的隔离计算环境克隆或连接远端仓库，在用户机器离线后仍能持续执行 Agent 任务。',
      includes: [
        '托管 VM/容器与后台执行',
        '仓库、环境和任务生命周期',
        '从 CLI/Web 发起并在其他 Surface 继续',
        '云会话派发到组织自有 Runner（Claude Code Self-hosted environments）',
      ],
      excludes: [
        '把本地 Daemon 部署到自己的服务器',
        'Remote Control 本机任务',
        '普通第三方 CI Runner',
      ],
      facts: [
        'Claude Code、Codex 和 Qoder 提供明确的托管云任务；Qwen Code 与 Kimi Code 当前公开服务都是用户自托管。',
        'Claude Code v2.1.224 起提供 Self-hosted environments：云会话的执行主机可以换成组织自己部署的 Runner，会话调度与推理仍在 Anthropic 侧（Team/Enterprise 公测，默认关闭）。',
        '托管云任务通常只能看到 Git 仓库、显式环境和 secrets，看不到用户机器上未上传的任意文件。',
        'Qoder Cloud Mode 与 Remote Control 明确互补：前者关闭本机仍运行，后者要求本机在线。',
      ],
      products: {
        claude: {
          entry:
            '`claude --remote "<task>"`、claude.ai/code 或 Desktop Remote 环境；v2.1.224 起另有 Self-hosted environments：Owner/admin 在 claude.ai `Cloud environments` 管理页开启 `Allow self-hosted environments`、创建环境并一次性复制 environment key，组织主机运行 `claude self-hosted-runner`（`claude self-hosted-runner setup` 引导，或带 `--environment-secret-file` 与 `--base-dir` 手动启动，要求 v2.1.224+）。',
          protocol:
            '创建 Anthropic 托管 Cloud session；CLI 可用 `/tasks` 查看，`--teleport`/`/teleport` 拉回本地。Self-hosted environments 由 Environment、Runner、Session 三部分组成：开发者启动云会话时在环境选择器中同时看到 Anthropic 托管环境与组织自建环境，选中后 Anthropic 控制面把会话排入环境队列，Runner 认领、克隆仓库并在组织主机派生 Claude Code 子进程执行；队列轮询、事件流与模型推理都是到 `api.anthropic.com` 的出站 HTTPS，Anthropic 不向组织网络发起入站连接。Runner 可手动常驻，也可运行 `claude self-hosted-runner orchestrator` 自动扩缩，按 `spawn-runner` hook 为排队会话逐个拉起 Runner，工作完成后 Runner 自行退出。',
          behavior:
            '在新 VM 中克隆仓库、运行 setup、执行任务、生成 Diff/分支并可在 Web/移动端继续。Self-hosted 会话改在组织主机执行：claude.ai、移动端与桌面端应用、终端 `claude --cloud` 以及定时 routines 启动的云会话都可选择自托管环境，仓库 checkout 与产物留在组织网络内；Claude Tag、Claude Security 与 Code Review 会话暂不路由到自托管环境。',
          state:
            '任务在本机关闭后继续；会话、分支和对话保存在账号侧，环境闲置后可回收再恢复。Runner 侧 `--capacity` 默认 1 个并发会话，同一 Runner 的会话属于同一锁定账号（可用 `--lock-to-account` 在启动时预锁定）；`--release-idle-session-min` 释放空闲会话、`--drain-grace-sec`/`--drain-wait-sec` 控制排空与 SIGTERM 宽限、`--kill-session-after-min` 限制会话寿命、`--retire-at` 定时退役 Runner。',
          tools:
            '使用仓库内 CLAUDE.md、settings、MCP、Skills、Agents 和 Hooks；用户 home 配置不会自动带入。Self-hosted 场景可在 Runner 镜像或主机预装编译器、SDK 等工具；`SELF_HOSTED_RUNNER_HOST_CONFIG_DIR`（默认 `~/.claude`）在启动时快照并注入每个会话的 `CLAUDE_CONFIG_DIR`，也是 Runner 读取 `.claude.json` 做 MCP seeding 的位置；`--trust-workspace` 默认开启，为会话仓库路径预置信任，使仓库内 `permissions.allow` 与 `additionalDirectories` 生效。',
          auth:
            'Claude 账号；通常连接 GitHub，也支持仓库 bundle fallback。Self-hosted 环境以单一 environment secret 认证并注册 Runner，key 在 claude.ai 只显示一次、365 天后过期；git 认证可选 Anthropic git 代理（`--use-anthropic-git-proxy`，按会话铸造短期令牌、要求 `--capacity 1`）、`--configure-git` 写全局 git 身份并启用 Anthropic 提交签名，或镜像自带配置。',
          deployment:
            'Anthropic 管理的 Ubuntu VM 与可配置 Cloud environment；Self-hosted environments 为 Team/Enterprise 公测、默认关闭，要求组织已启用 Claude Code on the web，Runner 与 orchestrator 运行在组织自有的 Linux 或 macOS 主机；官方不发布预构建 Runner 镜像，需围绕 `claude` 二进制自建镜像或进程，文档提供 Kubernetes 与 Docker Compose 部署示例，`--health-port`（默认 8080）暴露 `/healthz` 与 Prometheus `/metrics`。',
          conditions:
            '资源、网络和 secrets 有独立限制；本地未提交内容只有在显式 bundle 路径中才可能上传，未跟踪文件不包含。Self-hosted environments 不适用于启用 Zero Data Retention 的组织；会话推理走 Anthropic API，不能改经 Amazon Bedrock、Google Cloud\u2019s Agent Platform、Microsoft Foundry 或 LLM gateway；仓库来源当前为 GitHub；官方将它与 Remote Control 区分为不同能力，后者面向自有常开主机上的本地会话，Pro/Max 计划也可用。',
          sources: [
            'claude-web',
            'claude-desktop',
            'claude-self-hosted',
            'claude-self-hosted-quickstart',
            'claude-self-hosted-reference',
            'claude-self-hosted-v224',
          ],
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
        'Claude、Qoder 与 Kimi Code 提供账号中继的本地会话远程控制，浏览器/手机可经厂商中继控制本地会话而无需自建网络；Kimi Code 的入口仍为实验功能（main 分支，尚未发布）。',
        'Codex app-server 可让另一个 CLI TUI 跨机器连接服务端 workspace；Qwen serve 与 kimi web 也能被远程客户端连接，公网网络仍由用户自建；Qwen Code 另以 `--local-control` 提供局域网扫码配对（main 分支，尚未发布）。',
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
            '远程客户端连接 `qwen serve`；Web Shell、SDK DaemonClient 或 Channel 都可成为客户端。局域网配对：CLI `qwen serve --local-control`，Desktop `Control → Local Control…` 菜单。',
          protocol:
            'HTTP + SSE；多客户端可共享会话和权限请求，SSE 使用 Last-Event-ID 重连。Local Control 绑定所有非回环 IPv4 接口，配对令牌放在 URL fragment，浏览器不会在 HTTP 请求、日志或 referrer 中发送；Desktop 网关把 HTTP、SSE 与 WebSocket 转发到既有 loopback daemon。',
          behavior:
            '远程浏览器或自定义客户端发送 prompt、处理审批、查看 Diff 与会话状态；文件操作发生在 daemon 主机。`--local-control` 每次进程生成全新 256-bit bearer token，为每个局域网地址打印带标签的终端二维码，并在启用期间尽力抑制系统睡眠；Desktop Local Control 不重启现有 daemon 即开启临时局域网网关，关闭或停用即关闭监听并使令牌失效。',
          state:
            '会话和 transcript 留在 daemon 主机；客户端重连可恢复事件窗口或加载历史。Local Control 令牌为进程级临时凭据，退出或停用即失效；Desktop 网关不改变 Desktop PID、daemon PID、loopback 地址和进行中的会话。',
          tools:
            '使用 daemon workspace 的 Qwen 工具、MCP、Skills 与 Channel。',
          auth:
            '非 loopback 必须 bearer token；远程设备登录可由 daemon device flow 完成。Local Control 自行生成令牌、不复用环境变量令牌，受保护路由仍要求该令牌；只放行被广播的局域网 origin 与 daemon 的 loopback 自访问 origin。',
          deployment:
            '公网访问由用户自建网络和服务主机；当前不是 Qwen 账号托管的全局中继。Local Control 仅覆盖同一局域网内扫码配对的设备（如手机），官方明确不以端口转发或未认证隧道暴露该网关作为互联网远控方案。',
          conditions:
            'qwen serve alpha 明确以本地单机/小团队为边界；生产跨公网需自行承担 TLS、代理、故障恢复和版本协商。`--local-control` 与 `--token`、`--allow-origin`、`--no-web`、`--port 0` 和非默认 `--hostname` 冲突（直接报错而不静默覆盖）；要求固定端口，端口被占用时启动失败不重试；找不到非回环 IPv4 地址时报错；该能力位于 main 分支，尚未随 Release 发布。',
          status: '条件项',
          sources: [
            'qwen-serve-current',
            'qwen-sdk-current',
            'qwen-local-control-commit',
            'qwen-local-control-serve-docs',
            'qwen-local-control-design',
            'qwen-local-control-desktop',
            'qwen-local-control-source',
          ],
        },
        kimi: {
          entry:
            '自建网络：`kimi web --host 0.0.0.0` 或指定地址，让其他设备打开 Web UI/API。官方中继：先启用实验开关 `KIMI_CODE_EXPERIMENTAL_REMOTE_CONTROL=1`（master 开关 `KIMI_CODE_EXPERIMENTAL_FLAG=1` 同样生效），再运行 `kimi rc`（别名 `remote`，未启用时隐藏）、`kimi web --remote-control`（帮助文本同样隐藏），或会话内 `/remote-control`（别名 `/rc`）。',
          protocol:
            '自建网络为 REST + WebSocket，bearer token 鉴权，部署者负责网络可达性。Remote Control 由本机 CLI 主动出站连接官方中继 `https://code-rc.kimi.com`：先经 `/v1/remote/create` 注册设备（`device_id`、主机名、平台、客户端版本与本机地址），再以 `/v1/remote/http?device_id=...` 承载 HTTP 隧道、`/v1/remote/stream/<streamId>` 双向桥接 WebSocket 流；转发到本地 Web 服务时附加本机 bearer token，并对 HTML/JS/CSS 响应做路径前缀改写；断线按指数退避重连，上限 30 秒。',
          behavior:
            '自建网络下远程浏览器可发送 prompt、查看工具与文件。Remote Control 启动后终端显示 “Kimi Remote Control ready”、二维码（终端渲染并保存 PNG）与设备页面链接；`/remote-control` 携带当前会话深链接（`/devices/<deviceId>/sessions/<sessionId>`），TUI 退出后原进程转为前台 Web 服务；远程设备在页面上登录后即可聊天，会话、文件与工具执行始终发生在运行 Kimi 的本机。',
          state:
            '会话、文件与本地服务 token 留在服务主机；中继只转发流量，本机进程退出即向中继发送断开原因并终止隧道。同一台机器只允许一个 Remote Control 实例（文件锁），已有实例运行时再次启动会提示已在运行。',
          tools:
            '使用服务主机上的 Kimi 工具、Shell 和 Provider。',
          auth:
            'Remote Control 要求先 `kimi login`（从数据目录 `credentials/` 读取 Kimi OAuth refresh token，未登录报 “Remote Control requires a Kimi login. Run `kimi login` first.”），且本地 Web 服务必须启用认证（读不到本地服务 token 报 “Unable to read the local server token.”）；远程设备需登录 Kimi 账号。`--remote-control` 不能与 `--dangerous-bypass-auth` 同用。自建网络默认 bearer token，可轮换；不得在公网使用 bypass-auth。',
          deployment:
            '自建网络需自管本机或远程服务器。Remote Control 使用 Kimi 官方中继（`https://code-rc.kimi.com/devices/<deviceId>/`），远程设备无需自建网络；执行仍在本机，不构成托管云任务。',
          conditions:
            '实验标志 `remote-control` 经 `registerFlagDefinition` 注册（`surface: \'both\'`，默认关闭），CLI 子命令、`--remote-control` 选项与 `/remote-control` 命令均受其门禁；未启用时运行报 “--remote-control is experimental: set KIMI_CODE_EXPERIMENTAL_REMOTE_CONTROL=1 (or KIMI_CODE_EXPERIMENTAL_FLAG=1) to enable it.”。`kimi web --remote-control` 要求回环绑定；HTTP 隧道单请求上限 10 MiB、头部上限 64 KiB、转发超时 30 秒。同一提交移除 `--allow-remote-terminals`，PTY 终端路由仅保留在回环绑定。2026-08-25 合入 main（提交 `f0a609487fb8`，PR #3034），changeset 为 minor、尚未随 Release 发布；官方 Slash 命令文档与仓库 `docs/zh` 未同步，终端输出链接的 `https://kimi.com/code/docs/remote-control` 文档页核对时返回 404。',
          status: '源码确认',
          sources: [
            'kimi-cli-surface-current',
            'kimi-remote-control-commit',
            'kimi-remote-control-changeset',
            'kimi-remote-control-source',
            'kimi-remote-control-flag',
            'kimi-remote-control-web-command',
            'kimi-remote-control-tui-command',
            'kimi-remote-control-registry',
            'kimi-remote-control-drop-terminals',
          ],
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

    'surface-channels': createDetail({
      id: 'surface-channels',
      definition:
        '把第三方聊天平台、代码托管平台或邮箱当作 Agent 会话的输入与输出通道：消息从厂商自有界面之外进入，回复沿同一条通道送出。',
      includes: [
        '渠道的启动入口、适配器类型与配置键',
        '入站消息的访问控制、会话归属与并发上限',
        '平台凭据的保存位置与组织级开关',
      ],
      excludes: [
        '厂商自有的 Web、Desktop、移动 App 与 Remote Control 界面',
        'CI 与 Pull Request 自动化（见代码 Review、Pull Request 与 CI 字段）',
        '同一产品内不同会话之间的消息投递（见跨会话消息字段）',
      ],
      facts: [
        '只有 Qwen Code 与 Claude Code 提供把第三方聊天平台接入本机会话的一等入口：Qwen 用 `qwen channel start` 加载内置适配器，Claude 用 `claude --channels` 加载渠道插件。',
        '两家都要求先绑定平台侧凭据（Bot token、App Secret 或邮箱账号密码），也都默认只放行已配对或白名单内的发送者，未放行的消息直接丢弃。',
        'Codex 与 Qoder 的第三方平台入口都不在 CLI：Codex 的 Slack 提及把仓库工作交给 Codex Cloud，Qoder 的 `@qoder` 提及由 GitHub Action 在 GitHub Runner 执行，本机 CLI 都不监听聊天平台。',
        'Kimi Code 没有任何第三方消息平台或邮箱适配器；`kimi web` 与 Remote Control 中继只是自有浏览器窗口，官方文档明确任务始终在本机执行。',
        '常驻方式不同：Qwen 的 `qwen channel start` 在前台跑一个被全部渠道共享的 Agent 进程，Claude 的渠道事件只在已打开的会话期间到达，需要常驻就得把会话跑在后台进程或长开终端里。',
      ],
      products: {
        claude: {
          entry:
            '`claude --channels plugin:telegram@claude-plugins-official`，多个条目用空格分隔，也支持 `server:<name>` 形式接入自建事件源。插件先安装：`/plugin install telegram@claude-plugins-official`、`/plugin install discord@claude-plugins-official`、`/plugin install imessage@claude-plugins-official` 或 `/plugin install fakechat@claude-plugins-official`；缺少市场时先 `/plugin marketplace add anthropics/claude-plugins-official`。研究预览期间 `--channels` 与 `--dangerously-load-development-channels` 都不出现在 `claude --help`。',
          protocol:
            '官方定义：“A channel is an MCP server that pushes events into your running Claude Code session”，可双向——Claude 读取事件后经同一渠道回复，像一座聊天桥。预置渠道插件是 Bun 脚本，本机需装有 Bun；自建渠道可用 Bun、Node 或 Deno 并依赖 `@modelcontextprotocol/sdk`。',
          behavior:
            '研究预览内置 Telegram、Discord、iMessage 与本机演示用 `fakechat`；官方两页均无 email/IMAP/SMTP、Microsoft Teams 或国内 IM 适配器。事件只在会话打开期间到达。v2.1.211 及以上在中继前净化 `description` 与 `input_preview`（中和方向覆盖与不可见字符、折叠空白，最多中继 3500 码点），更早版本原样中继 `description` 并把 `input_preview` 截到 200 个 UTF-16 单元；v2.1.234 及以上只把权限请求发给注册为渠道的服务器、不可序列化字段中继为 `(value unserializable)`、可识别的 Provider 凭据 token 打码为 `[REDACTED]`，更早版本把 `claude/channel/permission` 返回 `false` 当作已声明。',
          state:
            'Telegram token 保存在 `~/.claude/channels/telegram/.env`，Discord 保存在 `~/.claude/channels/discord/.env`，也可改用 `TELEGRAM_BOT_TOKEN`、`DISCORD_BOT_TOKEN` 环境变量；发送者白名单由各插件自己维护。iMessage 不需要 token。调试日志在 `~/.claude/debug/<session-id>.txt`。',
          tools:
            '渠道只把外部事件送进本机会话，工具、文件与命令仍在运行 `claude` 的机器上执行。项目信任与 MCP 服务器同意对话框不经权限请求中继，只出现在本地终端。',
          auth:
            '要求 claude.ai 或 Console API Key 认证，Amazon Bedrock、Google Cloud\'s Agent Platform 与 Microsoft Foundry 上不可用。Telegram 与 Discord 先给机器人发任意消息取得配对码，再用 `/telegram:access pair <code>` 或 `/discord:access pair <code>` 录入；`/telegram:access policy allowlist` 或 `/discord:access policy allowlist` 收紧为只允许自己的账号，未加入白名单的发送者被静默丢弃。iMessage 自聊天免配置直通，其他发送者用 `/imessage:access allow +15551234567` 添加（手机号为 `+country` 格式或 Apple ID 邮箱）。',
          deployment:
            '运行在本机 CLI 会话内。iMessage 渠道仅 macOS：直接读取 Messages 数据库、经 AppleScript 发送回复，不需要 bot token 或外部服务，但要给终端 App 授予完全磁盘访问权限。',
          conditions:
            '官方标注 “Channels are a research preview feature”，可用范围分批放开，`--channels` 语法与协议约定可能变化。组织侧由两个 Managed 作用域设置控制：`channelsEnabled`（允许本组织使用渠道）与 `allowedChannelPlugins`（替换默认可推送消息的渠道插件白名单，条目为 `{marketplace, plugin}` 或 `plugin@marketplace` 字符串）。Team 与 Enterprise 必须显式开启；无组织的 Pro/Max 用户跳过这些检查、按会话用 `--channels` 自行开启；Console 组织在未部署托管设置时默认允许。`--dangerously-load-development-channels` 需全屏确认后按条目绕过插件白名单，但不绕过 `channelsEnabled`，也不会把豁免扩展到 `--channels` 的条目。研究预览期间自定义渠道与社区市场都不在白名单内。官方明确警告：按群/聊天 ID 而非发送者 ID 做门禁会让白名单群里任何人都能注入消息。',
          status: '条件项',
          sources: [
            'claude-channels',
            'claude-channels-reference',
            'claude-platforms',
            'claude-settings-reference',
          ],
        },
        codex: {
          entry:
            'CLI 无渠道入口：官方命令参考没有 `channel`、`channels`、`slack`、`telegram` 或 `email` 子命令，TUI Slash 命令定义源码也没有对应命令。第三方平台入口在 Slack：在已启用 App 的频道里提及 `@ChatGPT`（此前为 `@Codex`）。',
          protocol:
            'Slack 侧由工作区的 ChatGPT Slack 部署承接；开启 Cloud delegation 后，ChatGPT 把仓库工作转交一个独立的 Codex Cloud 任务并把结果送回原线程。没有 CLI 侧协议、配置键或本机监听端口。',
          behavior:
            '官方描述为 “Start requests in Slack and delegate repository work to Codex Cloud”。在频道里提及 `@ChatGPT` 并说明想要的结果（编码工作要带上仓库与线程上下文），完成账号连接与审批提示后由 Cloud 执行；同一线程再次提及可继续相关请求。',
          state:
            '任务与产物留在 Codex Cloud 环境，不写入本机；CLI 会话不参与，因此没有本机渠道状态目录，也没有按平台账号保存的凭据文件。',
          tools:
            '使用所选 Codex Cloud 环境的检出与工具，不使用本机 CLI 的工具、沙箱或文件。',
          auth:
            '需要 ChatGPT 工作区所有者或管理员部署 Slack App 并开启 Codex Cloud for Slack；工作区必须有一个已发布且共享给工作区的 Cloud 环境，个人 Cloud 环境不参与；开启 Codex Cloud 基于角色的访问控制时，部署的服务账号与发起用户都需要 Cloud 访问权限。首次使用要在 Slack 消息里选择连接链接登录，并回到原线程重试。',
          deployment:
            '执行位置是 OpenAI 托管的 Codex Cloud，Slack 只是发起与回报通道。',
          conditions:
            '这是 ChatGPT + Codex Cloud Surface 的能力，不能算作 Codex CLI 的消息渠道：官方 Slack 页没有出现 CLI、终端或本机执行。跨组织共享的 Slack Connect 频道不支持该流程。Codex CLI 自己的远程入口（app-server、Cloud、远程接管）记在对应 Surface 字段，都不监听第三方聊天平台或邮箱。',
          sources: ['codex-slack', 'codex-commands', 'codex-cloud'],
        },
        qwen: {
          entry:
            '`qwen channel start` 启动 `settings.json` 中 `channels` 下的全部渠道，`qwen channel start <name>` 只启动一个；`qwen channel status` 查看是否运行、运行时长与各渠道会话数，`qwen channel stop` 从另一个终端停止，前台运行时 `Ctrl+C` 同样可停。渠道类型写在 `channels.<name>.type`：`telegram`、`weixin`、`qq`、`dingtalk`、`dws`、`wecom`、`feishu`、`github`、`gitlab`、`email`，或由扩展提供自定义类型；内置适配器以 `@qwen-code/channel-*` 包在 CLI 渠道注册表中登记。',
          protocol:
            'Email 渠道用 IMAP 轮询收信、SMTP over TLS 回信：隐式 TLS 默认 IMAP 993、SMTP 465；`imapSecure` 或 `smtpSecure` 设为 `false` 改用 STARTTLS，默认端口变为 143 与 587，STARTTLS 与证书校验强制保留，`imapPort`/`smtpPort` 可覆盖，私有 CA 要在启动前配置 Node 的 `NODE_EXTRA_CA_CERTS`。适配器关闭协议日志，连接失败不带凭据上报。其余渠道走各平台自己的长连接或 Webhook。',
          behavior:
            '全部渠道共享一个经 ACP 启动的 Agent 进程、按用户隔离会话，每个渠道可单独指定 `cwd`、`model`、`instructions` 与 `sessionScope`。Email 首次连接跳过所选文件夹里已有的邮件，之后按保存的 UID 游标续读；`folder` 默认 `INBOX` 且只读，`pollInterval` 默认 60000 ms（可设 1–86400000），每轮最多取 100 封实际消息。回复只发给原发件人，`Message-ID`、`In-Reply-To` 与 `References` 负责关联会话，`Reply-To`、CC、BCC 与任务文本里的地址都不能改变 SMTP 收件人。渠道内 `/help`、`/status`、`/clear`、`/btw`、`/loop` 与权限回复等命令本地处理，其余转给 Agent；`dispatchMode` 支持 `steer`（默认）、`collect`、`followup`，Email 默认 `followup` 并拒绝 `collect`（缓冲消息的生命周期长于其准入处理器，无法保留单独的持久完成声明）。后台 Subagent 或 fork 的完成结果回投到拥有该会话的渠道聊天，可在原回合结束后送达。',
          state:
            'Email 状态在 `$QWEN_HOME/channels/<workspace>/email-<account-hash>/state.json`（`QWEN_HOME` 默认 `~/.qwen`），由渠道名、规范化 workspace 与邮箱 endpoint/user/folder 共同决定，只允许一个进程持有；切换账号另建基线，UIDVALIDITY 变化同样跳过现有邮件。开始任务前落盘在途 UID、每次 SMTP 发送（含主动发送）前落盘 `outboundPending` 消息 ID，对应操作完成后删除。进程中断或 SMTP 结果不确定时记录保留：重启会报告状态路径、待处理 UID 与外发消息 ID 并拒绝重放或丢弃，要求先停渠道、核对邮箱与任务副作用，再只从 `pending` 与 `outboundPending` 中删除已对账的条目，游标与线程元数据保持不动；状态损坏或不可读会让启动失败，把状态文件当作重试手段删除则会新建基线并跳过现有邮件。渠道循环计划保存在 `$QWEN_HOME/channels/` 下（独立渠道直接用 `cron.json`，daemon 托管用 `daemon/` 下的按工作区文件）。',
          tools:
            '渠道会话使用所配 `cwd` 工作区的 Qwen 工具、MCP 与 Skills。Email 至多转发 16 个附件：PNG、JPEG、GIF、WebP 走既有图片输入，其他文件在任务期间存到生成的私有路径，日历与封装的 message/report 部件不支持，HTML 转文本且不加载远程资源；`maxMessageBytes` 默认 10 MiB（超限邮件跳过）、`maxAttachmentBytes` 默认 5 MiB（超限附件省略），两者上限 50 MiB；`maxTextLength` 默认 32000 字符、上限 100000，超出部分先裁掉常规引用回复与签名。渠道循环由 `channel_loop_create`、`channel_loop_list`、`channel_loop_cancel` 工具或 `/loop` 命令管理，用本机时区的五字段 cron 表达式。',
          auth:
            'Email 的 `imapPassword` 与 `smtpPassword` 支持既有 `$ENV_VAR` 引用，官方要求不要把明文密码写进设置。`address`、`allowedUsers`、`operators`、`proactiveRecipients` 都必须是裸邮箱地址并规范化为小写（长度 ≤254，显示名不授予访问权）。`privatePolicy` 支持 `allowlist`（Email 默认）、`open`、`disabled`，Email 明确拒绝 `pairing`（首版不支持配对），旧的 `senderPolicy` 仍被识别；官方提示 From 白名单不等于发件人认证，必须使用会过滤伪造邮件的邮箱服务商。Agent 自动生成、`Auto-Submitted` 非 `no`、邮件列表、垃圾邮件、空 return path、投递报告与带出站标记的邮件都被忽略，模糊的 From 头与发给自身邮箱的邮件被拒。',
          deployment:
            '渠道进程跑在执行 `qwen channel start` 的本机，前台运行且重复启动会报错而不是起第二个实例。实验性 daemon 托管模式由 `qwen serve` 拥有按工作区分组的渠道 worker 进程，worker 经 SDK 连回 daemon，适配器崩溃不会拖垮 daemon；该模式要求每个选中渠道的 `cwd` 解析到已注册的工作区。Email 需要本机能出网访问 IMAP 与 SMTP 服务器。',
          conditions:
            'Email 渠道由提交 `612a55295993`（PR #12939）合入 main；v0.24.7 标签下的 `packages/channels/` 只有 base、dingtalk、dws、feishu、github、gitlab、plugin-example、qqbot、telegram、wecom、weixin，没有 `email`，因此该适配器尚未随 Release 发布。官方设置文档在同一提交时点仍未列出 `channels` 键，`qwen channel` 也不在命令文档中，入口以 Channels 文档为准。Email 首版不支持 Provider OAuth、邮箱管理、S/MIME、PGP、日历与 HTML 输出。准入上限为 32 个普通投递在途，另留 1 个槽位给控制回复与忙音响应，满载时新任务收到“请在活动任务结束后重发”的提示；任务等待期间准入保持有效。适配器保留 256 条最近回复路由、每条至多 64 个标识与 1024 条最近入站标识，被逐出的线程路由在下一条被接受的消息恢复它之前收不到主动回复。主动投递默认关闭，只有 `proactiveRecipients`（默认空）里精确列出的地址可用；线程目标还需解析到已知且当前放行的发送者，未知目标直接失败而不改选收件人或新建替代线程，没有回退收件人。渠道循环要求适配器与目标支持主动投递，`sessionScope: "single"` 下不可用，每个目标至多 10 个启用的循环、每条提示词至多 4000 字符。官方说明 Agent 副作用、SMTP 受理与本地游标无法在一个事务里提交，因此不存在针对任意副作用的恰好一次语义，不确定的发送不会自动重试、主动投递错误按永久错误分类。',
          status: '官方确认',
          sources: [
            'qwen-channels-overview',
            'qwen-email-channel-docs',
            'qwen-email-channel-commit',
            'qwen-email-channel-config',
            'qwen-email-channel-design',
            'qwen-channel-registry',
            'qwen-settings-no-channels',
          ],
        },
        kimi: {
          entry:
            '无入口。官方 CLI 参考在提交 `21406fb4c805` 时点列出的子命令是 `login`、`acp`、`web`、`doctor`、`export`、`migrate`、`upgrade`、`provider`，附加子命令为 `install-desktop`、`vis`、`web rotate-token`、`provider add|remove|list|catalog list|catalog add`，没有渠道类子命令；官方斜杠命令表也没有渠道命令。',
          protocol:
            '没有第三方消息平台或邮箱协议适配器。远程访问走 `kimi web`（同进程挂载 REST + WebSocket API 与 Web UI）与 Remote Control 中继隧道，两者都是 Kimi 自有协议。',
          behavior:
            'Remote Control（`kimi rc`、`kimi web --remote-control`、`/remote-control`）由本机 CLI 出站连接官方中继生成链接与二维码，远程设备扫码或打开链接、登录同一 Kimi 账号后可查看任务进度、处理权限确认、继续对话或新建会话。官方指南逐字写明“任务始终在本机执行，网页只是一个远程窗口”。',
          state:
            '会话与文件留在运行 Kimi 的本机；中继只转发流量，不存在按平台账号或邮箱地址保存的渠道状态目录，也没有发送者白名单文件。',
          tools:
            '远程窗口使用的仍是本机 Kimi 的工具、Shell 与 Provider。',
          auth:
            'Remote Control 要求先 `kimi login`，远程设备登录同一 Kimi 账号；没有面向第三方平台发送者的配对码或白名单机制，因此也没有对应的准入门禁。',
          deployment:
            '本机 CLI 加 Kimi 官方中继（`code-rc.kimi.com`，`kimi login --region global` 后为 `code-rc.kimi.ai`）；不构成托管云任务，也不监听任何聊天平台或邮箱。',
          conditions:
            '在提交 `21406fb4c805` 时点核对官方 CLI 参考、斜杠命令表与配置文档：`config.toml` 的顶层节为 providers、models、secondary_model、thinking、loop_control、token_counting、background、subagent、swarm、mcp、identity、tools、read、image、database、watch、services、permission 与项目级 `local.toml` 的 workspace，`tui.toml` 另有 editor、notifications、upgrade、status_line，没有任何渠道、机器人或邮箱配置节。唯一的微信相关记录是障碍而非集成：Remote Control 指南 FAQ 说明微信内置浏览器可能拦截 `code-rc.kimi.com` 链接，需要改用系统浏览器打开。',
          sources: [
            'kimi-cli-no-channel',
            'kimi-commands-no-channel',
            'kimi-config-no-channel',
            'kimi-remote-control-guide',
          ],
        },
        qoder: {
          entry:
            'CLI 无渠道入口。官方 CLI 概览的 “Remote and Integrations” 只列 Remote Control、Cloud Mode、Qoder Action 与 ACP；CLI 参考的子命令与参数里没有渠道类条目。第三方平台入口是 Qoder Action：在任意 Issue 或 PR 里评论 `@qoder explain this code` 或 `@qoder fix this issue`，工作流写 `uses: QoderAI/qoder-action@v0` 并在仓库 Secrets 配置 `QODER_PERSONAL_ACCESS_TOKEN`。',
          protocol:
            'Qoder Action 是标准 GitHub Actions 组件，由 GitHub 事件驱动。Remote Control 走 Qoder 账号中继，只服务 Qoder 自己的移动 App 与 `qoder.com/agents`；ACP（`qoder --acp`）是编辑器协议，官方只点名 Zed。',
          behavior:
            'Qoder Action 把 Qoder CLI 的能力带进 GitHub 工作流，在 PR 与 Issue 中做代码协作，官方明确 “Code runs on GitHub Runners”。没有在本机监听聊天平台或邮箱的常驻渠道进程，也没有渠道会话归属或准入队列。',
          state:
            '任务与产物留在 GitHub 与 Qoder 云端；本机 CLI 不保存渠道状态或平台凭据。',
          tools:
            'Qoder Action 使用 GitHub Runner 上的检出与 Qoder 云端能力，不使用本机工作区工具。',
          auth:
            'Qoder Action 需要仓库级 `QODER_PERSONAL_ACCESS_TOKEN`；Remote Control 用同一 Qoder 账号配对。团队侧另有 IM Channel 控制页，列出 DingTalk、Feishu、WeChat、WeCom、Microsoft Teams、Lark、WhatsApp、Slack，但官方注明 “Currently applies to QoderWork only”、适用套餐为 Teams 与 Enterprise，用途是 “deliver task notifications, messages, and reports to designated IM channels”，即只出不进的通知投递。',
          deployment:
            'Qoder Action 在 GitHub Runner 执行；Remote Control 由 Qoder 托管前端加本机 CLI 执行，Cloud Mode 不依赖本机。',
          conditions:
            '没有与 Qwen `channels.<name>.type` 或 Claude `--channels` 对应的第三方消息渠道配置键或启动命令。IM Channel 控制页属于 QoderWork 而不是 Qoder CLI，且只覆盖通知投递；入站提及记录在另一产品 QoderWake 的文档下。Qoder Action 只支持 GitHub，官方未提 GitLab 或其他平台。官方文档站没有变更日志页（`/changelog` 返回 404），只有 CLI 内的 `/release-notes` 命令，因此无法按版本定位渠道能力变化。矩阵中 Qoder 的 “Teams” 指其企业套餐，不是 Microsoft Teams。',
          sources: [
            'qoder-cli-overview',
            'qoder-action',
            'qoder-im-channel-controls',
            'qoder-commands',
          ],
        },
      },
      related: [
        'surface-service',
        'surface-remote-control',
        'session-messaging',
        'extension-plugins',
        'execution-ci',
      ],
    }),
  });
})();

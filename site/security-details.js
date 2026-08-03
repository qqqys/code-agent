(() => {
  const rows = Object.fromEntries(
    window.matrixData.rows
      .filter((row) => row.category === 'security')
      .map((row) => [row.id, row]),
  );

  const profiles = {
    claude: {
      entry:
        '`/permissions` 管理规则，`Shift+Tab` 切换常用模式；启动参数使用 `--permission-mode`，`/sandbox` 单独配置 Bash 沙箱。',
      defaults:
        '默认权限模式为 `default`。只读工具通常直接运行；Bash 和文件修改按权限规则与当前模式决定是否询问。',
      rules:
        '`permissions.allow`、`ask`、`deny` 按 deny → ask → allow 处理；规则覆盖 Bash、Read、Edit、WebFetch、MCP、Agent 等工具。',
      boundary:
        '权限系统覆盖全部工具；OS 沙箱只覆盖 Bash 及其子进程。沙箱默认只允许向工作目录和会话临时目录写入，并通过代理限制网络域名。',
      persistence:
        '规则和模式可保存在用户、项目、本地项目或 Managed Settings；交互审批也可只放行一次或当前会话。',
      noninteractive:
        '`claude -p` 没有确认界面。未被规则或模式预授权的 Shell、网络等操作会使运行中止；`dontAsk` 会直接拒绝所有仍需询问的操作。',
      conditions:
        'OS 沙箱依赖 macOS Seatbelt、Linux bubblewrap 或 WSL2；默认不可用时会警告并回退，`sandbox.failIfUnavailable` 可改为失败关闭。',
      status: '官方确认',
      sources: [
        'claude-permissions',
        'claude-permission-modes',
        'claude-sandboxing',
        'claude-headless',
      ],
    },
    codex: {
      entry:
        '`/permissions` 与权限选择器控制当前会话；CLI 可传 `--sandbox`、`--ask-for-approval`，持久配置写入 `config.toml`。',
      defaults:
        '版本库目录通常采用 `workspace-write` + `on-request`，非版本库目录通常采用 `read-only`；具体启动状态还受目录信任和配置影响。',
      rules:
        '`approval_policy` 支持 `untrusted`、`on-request`、`never` 和 granular 分类策略；命令 Rules、MCP 注解、权限 Profile 与沙箱共同生效。',
      boundary:
        '本地 CLI/IDE 使用 OS 级沙箱。`read-only`、`workspace-write`、`danger-full-access` 分别提供只读、工作区写入和无沙箱边界；工作区写入默认关闭命令网络。',
      persistence:
        '用户配置位于 `~/.codex/config.toml`；受信任项目可加载 `.codex/config.toml`、Hooks 和 Rules；系统与管理员 Requirements 可进一步收紧。',
      noninteractive:
        '非交互流程无法展示新审批时，需要审批的动作失败并把错误返回给 Agent；可在启动前固定审批策略、沙箱和 Rules。',
      conditions:
        '审批决定何时停下来询问，沙箱决定技术边界；`approval_policy = "never"` 不会自动移除仍在生效的沙箱。',
      status: '官方确认',
      sources: ['codex-approvals', 'codex-config'],
    },
    qwen: {
      entry:
        '`/approval-mode`、`/permissions` 和 `Shift+Tab` 控制审批；CLI 可传 `--approval-mode`、`--allowed-tools`、`--sandbox`，启用目录信任后提供 `/trust`。',
      defaults:
        '`tools.approvalMode` 当前默认值为 `auto`；Sandbox 与 `security.folderTrust.enabled` 均默认关闭。',
      rules:
        '`permissions.deny` > `ask` > `allow`；规则可限制 Shell、Read、Edit、WebFetch、MCP 等。`tools.disabled` 在注册阶段直接移除工具。',
      boundary:
        '可选 macOS Seatbelt 或 Docker/Podman 容器。Seatbelt 限制文件写入并按 Profile 控制网络；容器挂载工作区和 `~/.qwen`。',
      persistence:
        '审批模式和规则可写入用户、项目或系统 Settings；`/permissions` 可管理规则。目录信任记录单独保存在受信目录配置中。',
      noninteractive:
        'Headless 可预设 approval mode 和规则；没有交互通道时，仍需人工确认的工具调用会被拒绝。YOLO 会全放行工具，但不会自动启用 Sandbox。',
      conditions:
        '目录信任是可选功能；未信任目录会阻止 Auto-Edit、Auto、YOLO 等高权限路径及部分项目自定义内容。',
      status: '源码确认',
      sources: [
        'qwen-approval',
        'qwen-sandbox',
        'qwen-settings',
        'qwen-headless',
      ],
    },
    kimi: {
      entry:
        '`/permission` 选择模式；`/plan`、`/yolo`、`/auto` 快速切换。启动参数提供 `--plan`、`--yolo`、`--auto`。',
      defaults:
        '`default_permission_mode` 默认为 `manual`，`default_plan_mode` 默认为 `false`。',
      rules:
        '`[[permission.rules]]` 按顺序匹配第一条 `allow`、`deny` 或 `ask`；`[tools].enabled` 与 `disabled` 另行限制模型能看到和调用的工具。',
      boundary:
        '权限规则覆盖文件、Bash、MCP 等工具调用。当前公开 CLI 文档未列出对这些工具子进程提供 OS 级文件系统或网络沙箱。',
      persistence:
        '全局规则保存在 `~/.kimi-code/config.toml`；审批面板可放行当前会话。项目 `local.toml` 当前公开的是额外工作目录等本地设置。',
      noninteractive:
        '`kimi -p` 固定使用 Auto 权限策略，不弹人工审批；静态 deny 规则仍生效，且 `--prompt` 不能与 `--yolo`、`--auto`、`--plan` 同用。',
      conditions:
        'YOLO 跳过普通工具审批，但敏感文件与退出 Plan 仍可询问；Auto 会自动处理全部审批并禁止 Agent 向用户提问。',
      status: '官方确认',
      sources: ['kimi-interaction', 'kimi-config', 'kimi-cli'],
    },
    qoder: {
      entry:
        '`Shift+Tab` 循环权限模式，`Ctrl+Y` 进入 YOLO；CLI 支持 `--permission-mode`、`--allowed-tools`、`--disallowed-tools`，会话内可用 `/allow`、`/deny`。',
      defaults:
        '默认权限模式为 `default`。Plan 是独立工作状态；非默认权限模式只在受信任目录生效。',
      rules:
        '`permissions.deny`、`ask`、`allow` 覆盖文件、Bash、Web、MCP、Subagent 等；Hooks 可在权限流水线前后返回 allow、deny 或 ask。',
      boundary:
        'CLI 权限文档提供路径级 Read/Edit 规则与受信目录边界。Qoder CLI SDK 另有默认关闭的 Sandbox Settings，可限制文件系统和网络。',
      persistence:
        '规则来自用户、项目、本地项目、额外 Settings、CLI 参数、会话命令和临时 Session；`/allow`、`/deny` 写入本地项目设置。',
      noninteractive:
        'Headless 中 `ask` 自动转为 `deny`；SDK 可把请求交给 `canUseTool`，ACP 可通过 `requestPermission` 交给 IDE。',
      conditions:
        '未信任目录强制回退 `default`；受保护路径仍可要求审批或在 Auto 中拒绝。PreToolUse Hook 的 deny 即使在 bypass 下也能阻断。',
      status: '官方确认',
      sources: ['qoder-permissions', 'qoder-sdk-reference'],
    },
  };

  function evidenceStatus(value, profile) {
    if (value.includes('未确认')) return '未确认';
    if (
      value.includes('条件') ||
      value.includes('依配置') ||
      value.includes('默认关闭') ||
      value.includes('范围更广')
    ) {
      return '条件项';
    }
    return profile.status;
  }

  function createDetail({
    id,
    definition,
    includes,
    excludes,
    facts,
    behavior,
    related,
    overrides = {},
  }) {
    const row = rows[id];
    if (!row) throw new Error(`Unknown security capability: ${id}`);

    return {
      definition,
      includes,
      excludes,
      facts,
      products: Object.fromEntries(
        window.matrixData.products.map((product) => {
          const profile = profiles[product.id];
          const override = overrides[product.id] ?? {};
          return [
            product.id,
            {
              value: row.values[product.id],
              entry: override.entry ?? profile.entry,
              defaults: override.defaults ?? profile.defaults,
              behavior: behavior[product.id],
              rules: override.rules ?? profile.rules,
              boundary: override.boundary ?? profile.boundary,
              persistence: override.persistence ?? profile.persistence,
              noninteractive:
                override.noninteractive ?? profile.noninteractive,
              conditions: override.conditions ?? profile.conditions,
              status:
                override.status ??
                evidenceStatus(row.values[product.id], profile),
              sources: override.sources ?? profile.sources,
            },
          ];
        }),
      ),
      related,
    };
  }

  window.capabilityDetails = Object.assign(window.capabilityDetails ?? {}, {
    'security-approval': createDetail({
      id: 'security-approval',
      definition:
        '工具在执行有副作用、越出既定边界或命中 Ask 规则前，能否暂停并把具体操作交给用户或宿主确认。',
      includes: ['交互式 TUI 审批', 'Allow、Ask、Deny 决策', 'MCP 与工具审批'],
      excludes: ['Plan 模式本身', 'OS 沙箱强度', '企业账号角色权限'],
      facts: [
        '五家都具备交互审批，但参与决策的工具范围、规则优先级和宿主回调不同。',
        'Claude Code、Qwen Code、Kimi Code 与 Qoder CLI 都公开了工具级规则；Codex 把审批策略与沙箱边界分开配置。',
      ],
      behavior: {
        claude:
          '默认模式下，文件修改和需要授权的 Bash 调用弹出确认；规则可直接允许、强制询问或拒绝。',
        codex:
          '`on-request` 允许 Agent 在越出沙箱、请求网络或调用需确认工具时发起审批；可由用户或 Auto-review 处理符合条件的请求。',
        qwen:
          'Ask Permissions 模式要求文件编辑和 Shell 命令确认；Auto 模式由分类器给出允许或阻断，显式 deny 仍优先。',
        kimi:
          '副作用工具弹出审批面板，可单次允许、拒绝或对同类调用放行当前会话；永久规则写入配置文件。',
        qoder:
          '每次工具调用得到 allow、ask 或 deny；TUI 消费 ask 为确认面板，SDK 与 ACP 可转给外部宿主。',
      },
      related: ['cmd-permissions', 'security-bypass', 'security-noninteractive'],
    }),

    'security-plan': createDetail({
      id: 'security-plan',
      definition:
        '在执行修改前进入以阅读、分析和方案确认为主的工作状态，并限制或阻断一般写入。',
      includes: ['Plan 工作状态', '只读沙箱', '计划确认与退出'],
      excludes: ['普通 Todo 列表', 'Subagent 只读配置', '代码 Review 命令'],
      facts: [
        'Plan 工作流与技术上的只读沙箱不是同一概念；Codex 明确把两者作为不同控制。',
        'Qoder CLI 当前把 Plan 定义为独立工作状态，`--permission-mode plan` 仅保留兼容映射。',
      ],
      behavior: {
        claude:
          'Plan Mode 允许读取和只读 Shell 探索，不修改源码；方案完成后由用户选择后续权限模式。',
        codex:
          '`/plan` 用于计划流程，`sandbox_mode = "read-only"` 提供技术只读边界；两者可以组合但不能互相替代。',
        qwen:
          '`plan` 模式阻止文件修改和命令执行；`/plan exit` 恢复进入前的审批模式。',
        kimi:
          'Agent 先产出计划并等待确认；Plan 文件写入可直接执行，退出 Plan 通常仍需确认。',
        qoder:
          '`/plan` 开启独立 Plan 状态，只允许读取和计划文件写入；退出时可选择后续权限模式或 Goal。',
      },
      related: ['cmd-plan', 'security-approval', 'security-filesystem'],
    }),

    'security-auto-edit': createDetail({
      id: 'security-auto-edit',
      definition:
        '自动批准工作目录内的文件编辑，同时让 Shell、网络、敏感路径等其他动作继续走普通权限判断。',
      includes: ['文件编辑自动批准', '工作目录边界', '其他工具继续审批'],
      excludes: ['所有工具无人值守', '跳过全部审批', 'OS 沙箱是否启用'],
      facts: [
        'Claude Code、Qwen Code 与 Qoder CLI 有明确的仅编辑自动批准模式。',
        'Codex 通过工作区写入沙箱与按需审批组合实现同类效果；Kimi Code 的 Auto 范围包含全部工具，并非仅编辑模式。',
      ],
      behavior: {
        claude:
          '`acceptEdits` 自动批准工作目录中的文件编辑和一组常见文件系统命令；其他 Shell、网络与敏感路径继续检查。',
        codex:
          '`workspace-write` 允许工作区内编辑，配合 `on-request` 时越出工作区或请求命令网络再询问。',
        qwen:
          '`auto-edit` 自动批准 `edit`、`write_file`、`notebook_edit`，Shell 命令仍要求普通审批。',
        kimi:
          '没有公开的“仅自动批准编辑”模式；`/auto` 会自动处理所有工具审批，并且 Agent 不再向用户提问。',
        qoder:
          '`accept_edits`（兼容 `acceptEdits`）自动批准受信工作目录内的安全文件编辑，Shell 与敏感操作继续检查。',
      },
      related: ['security-approval', 'security-bypass', 'security-trust'],
    }),

    'security-bypass': createDetail({
      id: 'security-bypass',
      definition:
        '取消逐次人工审批，让工具按当前规则与技术边界自动继续；是否同时移除沙箱需要单独核对。',
      includes: ['Never/YOLO/Bypass 模式', '审批与沙箱的组合关系', '仍不可绕过的规则'],
      excludes: ['Auto 分类器模式', '普通编辑自动批准', '外部容器本身的权限'],
      facts: [
        '“不弹审批”和“没有沙箱”是两个不同维度；Codex 与 Qwen Code 尤其明确区分这两者。',
        'Kimi Code YOLO 与 Qoder CLI bypass 仍有特定安全检查或 Hook 边界，不能只按名称理解成所有控制消失。',
      ],
      behavior: {
        claude:
          '`bypassPermissions` 跳过权限提示；根目录或 Home 删除仍有熔断确认，管理员可禁用该模式。',
        codex:
          '`approval_policy = "never"` 只关闭提示，现有沙箱仍生效；同时移除审批与沙箱需 `danger-full-access` 组合或危险快捷参数。',
        qwen:
          '`yolo` 自动批准全部工具调用，但不会自动开启或关闭 Sandbox；无 Sandbox 时直接继承 CLI 进程权限。',
        kimi:
          '`/yolo` 跳过普通工具审批；敏感文件访问与退出 Plan 仍可询问，范围小于 `/auto` 的完全无人值守。',
        qoder:
          '`bypass_permissions`、`yolo`、`--yolo` 为同类入口；权限提示被跳过，但 PreToolUse Hook 的 deny 仍可阻断。',
      },
      related: ['security-approval', 'security-auto-edit', 'security-filesystem'],
    }),

    'security-filesystem': createDetail({
      id: 'security-filesystem',
      definition:
        '通过 OS、容器或进程级边界限制命令及其子进程能读取和写入的文件路径，而不仅是让模型遵守工具规则。',
      includes: ['OS 或容器隔离', '可写根目录', '受保护与禁止读取路径'],
      excludes: ['只针对文件工具的 Allow/Deny', 'Git Worktree 隔离', '网络访问策略'],
      facts: [
        'Claude Code 与 Codex 都公开了本地 OS 级文件系统沙箱；Qwen Code 提供可选 Seatbelt 或容器沙箱。',
        'Kimi Code 当前公开的是工具权限规则；Qoder CLI SDK 暴露可选 Sandbox Settings，但主 CLI 权限页主要描述路径规则。',
      ],
      behavior: {
        claude:
          'Bash 沙箱使用 Seatbelt 或 bubblewrap，默认只向工作目录与会话临时目录写入；Read/Edit deny 与 Sandbox 路径合并。',
        codex:
          '`read-only` 禁止一般写入，`workspace-write` 只写工作区与附加 writable roots，`danger-full-access` 移除沙箱；`.git`、`.agents`、`.codex` 等路径仍受保护。',
        qwen:
          'Sandbox 默认关闭；macOS 可用 Seatbelt，跨平台可用 Docker/Podman。容器挂载工作区和 `~/.qwen`，Seatbelt Profile 限制工作区外写入。',
        kimi:
          'Read、Bash 等可用 permission rules 控制，工具也有 enabled/disabled 列表；当前 CLI 文档未确认 OS 或容器级文件系统沙箱。',
        qoder:
          '主 CLI 提供 Read/Edit 路径规则、受信目录与受保护路径；SDK 的 `sandbox.filesystem` 可设置 allow/deny read/write，且 Sandbox 默认关闭。',
      },
      related: ['security-network', 'security-trust', 'security-approval'],
    }),

    'security-network': createDetail({
      id: 'security-network',
      definition:
        '限制 Agent 执行的程序和子进程访问外部网络，并可进一步按域名、代理、私网地址或工具规则收紧。',
      includes: ['命令子进程网络', '域名或代理策略', '网络工具权限'],
      excludes: ['模型 API 自身联网', '云端任务 Setup 网络', '账号登录网络'],
      facts: [
        '网络工具 Allow/Deny 与命令子进程的 OS 网络隔离不是同一层。',
        'Codex 的 `workspace-write` 默认关闭命令网络；Claude Code 和 Qwen Code 可在启用 Sandbox 时按域名或 Profile 控制。',
        'Claude Code 对未列域名默认逐次审批，`sandbox.network.strictAllowlist` 或 Managed `allowManagedDomainsOnly` 可改为直接阻断。',
      ],
      behavior: {
        claude:
          'Sandbox 通过外部代理限制 Bash 及子进程域名，默认不预允许任何域名，首次使用新域名触发审批；`sandbox.network.strictAllowlist` 开启后直接拒绝 Allowlist 之外主机，Managed 的 `allowManagedDomainsOnly` 同样自动阻断未列域名且只认 Managed 来源的 Allow 规则。严格名单只约束沙箱内命令，WebFetch 等进程内工具仍按自身权限规则判断；WebFetch 规则与 Sandbox allow/deny domains 合并。',
        codex:
          '`workspace-write` 默认 `network_access = false`；开启后可再启用 `network_proxy`，用 allow/deny 域名、私网和 Unix Socket 规则限域。',
        qwen:
          'Seatbelt 提供 open、closed、proxied Profile；代理模式可通过 `QWEN_SANDBOX_PROXY_COMMAND` 接入域名 Allowlist。',
        kimi:
          '可用工具规则限制 Bash 或特定网络工具，内置搜索/抓取服务也可单独配置；当前 CLI 文档未确认命令子进程的 OS 网络沙箱。',
        qoder:
          '主 CLI 可对 WebFetch/WebSearch 使用 ask/deny；SDK `sandbox.network` 可配置本地绑定、Unix Socket、HTTP 与 SOCKS 代理。',
      },
      overrides: {
        claude: {
          persistence:
            '规则和模式可保存在用户、项目、本地项目或 Managed Settings；交互审批也可只放行一次或当前会话。`strictAllowlist` 只在用户、Managed 或 `--settings` 设置中生效，仓库 `.claude/settings.json` 或 `.claude/settings.local.json` 中设置无效。',
          sources: [
            'claude-permissions',
            'claude-permission-modes',
            'claude-sandboxing',
            'claude-headless',
            'claude-sandbox-strict-allowlist',
          ],
        },
      },
      related: ['security-filesystem', 'security-approval', 'security-bypass'],
    }),

    'security-trust': createDetail({
      id: 'security-trust',
      definition:
        '把当前工作目录标记为可信或不可信，并据此决定是否加载项目配置、启用高权限模式或扩展可访问目录。',
      includes: ['首次目录信任', '项目配置加载门禁', '高权限模式门禁'],
      excludes: ['Git Safe Directory', 'TLS 证书信任', 'MCP Server 单独信任'],
      facts: [
        'Claude Code、Codex 与 Qoder CLI 都明确把目录信任用于限制项目配置或高权限模式。',
        'Qwen Code 具备完整目录信任实现，但当前设置默认关闭；Kimi Code 在实验性 v2 引擎中加入了启动信任提示，门禁项目级 MCP。',
      ],
      behavior: {
        claude:
          'Workspace Trust 在应用项目 `permissions.allow` 与 additionalDirectories 前展示其授权内容；信任按工作区保存。',
        codex:
          '未信任项目会跳过项目 `.codex/config.toml`、项目 Hooks 和 Rules；用户与系统层仍加载。',
        qwen:
          '启用 `security.folderTrust.enabled` 后显示 `/trust`；未信任目录限制高权限模式和项目级命令、Skill、Hook 等内容。',
        kimi:
          'v2 引擎（`KIMI_CODE_EXPERIMENTAL_FLAG`）在 TUI 启动时显示目录信任提示；项目级 MCP（`.mcp.json`、`.kimi-code/mcp.json`）仅在受信任目录加载。拒绝信任退出程序，下次启动再次询问；信任按目录持久保存。v1 引擎无信任概念。',
        qoder:
          '启动 CWD 是主信任目录；未信任时强制回退 `default`。可用 add-dir 或 `permissions.trustDirectories` 扩展。',
      },
      overrides: {
        kimi: {
          entry:
            '`/permission` 选择模式；`/plan`、`/yolo`、`/auto` 快速切换。v2 引擎在 TUI 启动时显示目录信任提示（无独立 Slash 命令）。',
          persistence:
            '全局规则保存在 `~/.kimi-code/config.toml`；审批面板可放行当前会话。v2 引擎的目录信任按目录持久保存。',
          conditions:
            'YOLO 跳过普通工具审批，但敏感文件与退出 Plan 仍可询问；Auto 会自动处理全部审批并禁止 Agent 向用户提问。目录信任仅在 v2 引擎（`KIMI_CODE_EXPERIMENTAL_FLAG`）中生效；v1 引擎始终视为受信任。',
          sources: ['kimi-interaction', 'kimi-config', 'kimi-cli', 'kimi-trust-v2'],
        },
      },
      related: ['security-filesystem', 'security-auto-edit', 'security-bypass'],
    }),

    'security-noninteractive': createDetail({
      id: 'security-noninteractive',
      definition:
        '在 Headless、Print、SDK 或其他没有 TUI 确认面板的环境中，如何处理原本会返回 Ask 的工具调用。',
      includes: ['Headless 审批降级', '预授权规则', '宿主回调与结构化协议'],
      excludes: ['普通交互 TUI', '账号认证输入', 'Agent 向用户提业务问题'],
      facts: [
        'Claude Code、Codex、Qwen Code 与 Qoder CLI 都采用失败关闭：没有确认界面且未预授权时不会静默放行。',
        'Kimi Code 的 `-p` 直接固定使用 Auto 权限策略，由策略处理工具并继续保留静态 deny。',
      ],
      behavior: {
        claude:
          '`claude -p` 可用 `--allowedTools` 或 permission mode 预授权；仍需审批的 Shell 或网络调用会中止，`dontAsk` 明确转为拒绝。',
        codex:
          '无法展示新审批时动作失败并返回错误；脚本应提前固定 approval policy、Sandbox、Rules 或权限 Profile。',
        qwen:
          'Headless 支持 `--approval-mode` 和规则；普通非交互通道无法确认时拒绝工具。Stream-JSON 宿主可消费部分控制请求。',
        kimi:
          '`kimi -p` 不请求人工审批，普通工具调用按 Auto 策略处理；静态 deny 仍阻断，且启动时不能叠加其他权限 Flag。',
        qoder:
          'Headless 把 ask 自动变成 deny；SDK 把 ask 发给 `canUseTool`，ACP 发给 IDE 的 `requestPermission`。',
      },
      related: ['security-approval', 'security-bypass', 'surface-headless'],
    }),
  });
})();

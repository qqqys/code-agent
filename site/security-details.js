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

    'security-auto-review': createDetail({
      id: 'security-auto-review',
      definition:
        '把原本需要用户确认的越界或高风险操作交给产品内置的分类器或审查代理自动裁决；裁决可以放行也可以拒绝，与全部放行的 bypass 不同。',
      includes: ['分类器或审查代理裁决审批请求', '放行与拒绝决策', '审查策略、提示与熔断配置'],
      excludes: ['全部放行的 YOLO/Bypass 模式', '静态 Allow/Deny 规则', 'OS 沙箱边界本身'],
      facts: [
        'Claude Code、Codex、Qwen Code 与 Qoder CLI 都提供基于分类器或审查代理的自动审查；Kimi Code 无同类机制，其 `/auto` 是全部审批自动放行的无人值守模式。',
        '自动审查不是权限放大：Codex 明确 auto-review 只更换审批请求的裁决者、不放宽沙箱边界；Claude Code 的 auto 模式仍会被 classifier 阻断高风险操作。',
        'Claude Code 与 Codex 都为连续拒绝设置熔断并回退人工审批；Qwen Code 的分类器不可用时失败关闭并在连续不可用后回退人工审批。',
      ],
      behavior: {
        claude:
          'auto 模式由独立 classifier 模型在动作执行前审查，阻断超出当前请求、指向未知基础设施或疑似受所读敌意内容驱动的操作。classifier 可见用户消息、工具调用与 CLAUDE.md，工具结果被剥离；还会审查 Subagent 的任务描述、运行中每个动作与结束后的完整动作历史，以及经 `SendMessage` 发给其他 Agent 的消息，并裁决指向根目录或 Home 的删除。被拒动作进入 `/permissions` 的 Recently denied 列表，可按 `r` 手动重试。',
        codex:
          '审查代理代替用户裁决沙箱边界审批请求：请求提升权限的 shell/exec 调用、被阻断的网络请求、`request_permissions` 提示、有副作用的 app/MCP 工具调用和 Computer Use 新域名访问。沙箱内已允许的动作不经过审查；Computer Use 的 app 层审批仍直接询问用户。审查者只看到精简 transcript 与审批请求本身，不含隐藏推理；拒绝时指示主 Agent 改走实质更安全的路径或停下询问用户，不得用变通方式规避。',
        qwen:
          'LLM 分类器逐条评估 shell 命令、网络调用与工作区外编辑，自动放行其判断安全的操作、阻断高风险操作；多数只读操作和工作区内编辑跳过分类器。文档列出的放行示例包括只读命令、工作目录内的包安装与构建测试、工作区内编辑；阻断示例包括 `rm -rf /`、`fdisk`、`mkfs` 等不可逆破坏，`curl | sh` 等外部代码执行、凭据外泄、`.bashrc`/`crontab` 等未授权持久化、安全削弱与向 main/master 强制推送。',
        kimi:
          '官方交互文档没有分类器或审查代理机制：副作用工具调用弹出审批面板由用户确认；`/yolo` 自动批准普通工具调用但敏感文件与退出 Plan 仍可询问；`/auto` 自动处理全部审批且 Agent 不再提问，属于全部放行而非基于操作内容的安全评估。',
        qoder:
          '`auto` 模式零确认提示：安全读取与工作区编辑自动批准，危险 shell 命令与受保护路径直接拒绝，其余风险操作交给 AI 分类器评估。`autoMode.allow`、`autoMode.soft_deny`、`autoMode.environment` 以自然语言注入分类器提示，属于软指引，最终决定仍由分类器做出。',
      },
      overrides: {
        claude: {
          entry:
            '`Shift+Tab` 循环切换到 `auto`（账号满足条件时才出现）；`--permission-mode auto` 也适用于 `-p`；`permissions.defaultMode` 可设为 `"auto"`。',
          defaults:
            '当前默认权限模式为 `default`；官方文档注明 2026-08-14 起 Pro/Max/Team 计划新会话默认进入 auto 模式。VS Code 的 `claudeCode.initialPermissionMode` 不接受 `auto`。',
          rules:
            'classifier 把对话中声明的边界当作阻断信号；v2.1.198 起对同一主机和端口复用网络判定。Plan 模式配合 `useAutoModeDuringPlan`（默认开启）时，planning 阶段的 shell 命令也由 classifier 审查。',
          boundary:
            'auto 模式不取代沙箱；带 `_meta["anthropic/requiresUserInteraction"]` 的 MCP 工具跳过 classifier 直接询问用户。Remote Control 入口不能选择 Auto。',
          persistence:
            '模式选择作用于当前会话；`permissions.defaultMode` 可写入用户或 Managed Settings；v2.1.142 起项目或本地 settings 中的 `auto` 被忽略，仓库不能给自己授权。',
          noninteractive:
            '`claude -p --permission-mode auto` 可用；没有交互面板时，classifier 连续阻断会中止会话。',
          conditions:
            '所有计划可用；Team/Enterprise 默认开启，管理员可用 `permissions.disableAutoMode` 关闭。模型要求 Anthropic API 与 Claude Platform on AWS 上 Opus 4.6+、Sonnet 4.6+ 或 Fable 5，Bedrock、Google Cloud Agent Platform、Microsoft Foundry 与登录网关会话上仅 Sonnet 5、Opus 4.7+、Fable 5。v2.1.158–v2.1.206 部分 Provider 需 `CLAUDE_CODE_ENABLE_AUTO_MODE=1`，v2.1.207 起该变量无效。连续 3 次或累计 20 次阻断后 auto 模式暂停并回退询问，阈值不可配置。',
          sources: ['claude-permissions', 'claude-permission-modes'],
        },
        codex: {
          entry:
            '`config.toml` 设 `approvals_reviewer = "auto_review"`；`--approve-for-me` 用于交互式与 `exec` 命令（搭配 `approval_policy = "on-request"` 与 `workspace-write` 沙箱，并传播到 root、`exec`、`resume`、`fork` 参数处理）；TUI 用 `/approve` 对近期 auto-review 拒绝单项重试一次。',
          defaults:
            '`approvals_reviewer` 默认 `"user"`，即审批仍由用户处理；只有 `on-request` 或 granular 这类会产生交互审批的策略下 auto-review 才有可审查对象，`never` 下没有。',
          rules:
            '默认审查策略检查数据外泄、凭据探测、持久性安全削弱与破坏性动作；低/中风险按策略放行，critical 拒绝，高风险需要足够用户授权且无匹配 deny 规则。本地 `[auto_review].policy` 可整体替换策略；企业 `guardian_policy_config`（requirements.toml）优先于本地策略，两者都是替换而非合并。`apps._default.approvals_reviewer` 与 `apps.<id>.approvals_reviewer` 可按 app 配置；`allowed_approvals_reviewers` 在组织层面限定可用审查者。',
          boundary:
            'auto-review 是审查者替换而非权限放大：不扩大 `writable_roots`、不启用网络、不削弱受保护路径。Prompt 构建、审查会话与解析失败均失败关闭；超时单独呈现但动作同样不执行。',
          persistence:
            '`approvals_reviewer` 写入 `~/.codex/config.toml` 或受信任项目的 `.codex/config.toml`；企业策略写入 managed requirements。TUI 每任务最多记录 10 条近期拒绝，供 `/approve` 重试。',
          noninteractive:
            '`codex exec --approve-for-me` 让非交互流程中的审批走自动审查；审查失败失败关闭，动作不执行并把结果返回 Agent。',
          conditions:
            '`--approve-for-me` 随 rust-v0.147.0（2026-08-07 发布）引入。同一 turn 内连续 3 次拒绝或最近 50 次审查的滚动窗口内 10 次拒绝会中断当前 turn。审查使用额外模型调用并计入用量；ChatGPT 桌面 App 以 Reviewing、Approved、Denied、Aborted、Timed out 状态展示审查项。`approval_policy = "never"`、`danger-full-access` 或 `--yolo` 下不产生可审查的审批请求。',
          sources: [
            'codex-approvals',
            'codex-auto-review',
            'codex-config-reference',
            'codex-approve-for-me',
            'codex-approve-for-me-commit',
          ],
        },
        qwen: {
          entry:
            '`/approval-mode auto` 或 `Shift+Tab` 循环（顺序 plan → default → auto-edit → auto → yolo）；CLI 可传 `--approval-mode`；`tools.approvalMode` 持久化模式。',
          defaults:
            '文档 Quick Reference 称 Auto 为“default out-of-the-box experience”，另一处写初始模式为 Ask Permissions，两处表述并存；`tools.approvalMode` 可写入 `auto`。',
          rules:
            '`permissions.autoMode.hints.allow`/`hints.deny` 用自然语言提示引导分类器，`permissions.autoMode.environment` 提供环境上下文；`classifyAllShell` 可让只读 shell 命令也经过分类器。',
          boundary:
            '分类器不确定时偏向阻断；分类器 API 不可达时动作被阻断（fail-closed），连续两次不可用后下一次工具调用回退人工审批；连续三次策略阻断后下一次调用也回退人工审批。',
          persistence:
            '审批模式可经 `/approval-mode <mode> --project`/`--user` 或 `tools.approvalMode` 写入项目或用户 Settings。',
          noninteractive:
            'Headless 可用 `--approval-mode` 指定模式，文档写 headless 默认行为是 Ask Permissions；auto 模式下分类器裁决照常生效。',
          conditions:
            '自动裁决依赖分类器 API 可用；启用目录信任功能时，未信任目录会阻断 Auto-Edit、Auto、YOLO 等高权限路径。',
          status: '官方确认',
          sources: ['qwen-approval', 'qwen-settings'],
        },
        kimi: {
          entry: '无自动审查入口；`/auto` 或 `--auto` 切换到完全无人值守模式。',
          defaults: '`default_permission_mode` 默认 `manual`；无分类器或审查代理。',
          rules:
            '`[[permission.rules]]` 静态 allow/deny/ask 规则照常匹配；Auto 模式不引入基于操作内容的评估。',
          boundary:
            '公开 CLI 文档未列 OS 级沙箱；`/auto` 只移除人工审批，不改变文件或网络边界。',
          persistence: '模式选择作用于当前会话；静态规则保存在 `~/.kimi-code/config.toml`。',
          noninteractive:
            '`kimi -p` 固定使用 Auto 权限策略，等同全部放行，仍无独立审查代理。',
          conditions:
            '当前官方仓库文档没有审批自动审查能力；`/auto` 是全部审批自动放行，不是自动审查。',
          sources: ['kimi-interaction', 'kimi-config'],
        },
        qoder: {
          entry:
            '`--permission-mode auto`、`Shift+Tab` 循环到 `auto`，或 `general.defaultPermissionMode` 设为 `auto`；`/goal set <objective>` 会自动切换到 `auto`。',
          defaults: '默认权限模式为 `default`；`auto` 模式下没有确认提示。',
          rules:
            '`autoMode.allow` 描述分类器倾向放行的操作，`autoMode.soft_deny` 描述倾向拒绝的操作，`autoMode.environment` 提供环境上下文；这些是注入分类器提示的软指引。',
          boundary:
            '`autoMode` 配置只从受信任来源读取（用户全局 settings 与 localSettings），项目 settings 被排除，以防恶意提权。',
          persistence:
            '`general.defaultPermissionMode` 随 settings 持久化；`autoMode` 写入用户全局或本地 settings。',
          noninteractive:
            'Headless 可传 `--permission-mode auto`，风险操作由分类器评估或直接拒绝；`dont_ask` 拒绝所有需审批操作，不使用自动审查。',
          conditions:
            '非默认权限模式只在受信任目录生效；受保护路径在 `auto` 中直接拒绝。',
          sources: ['qoder-permissions'],
        },
      },
      related: ['security-approval', 'security-bypass', 'security-noninteractive'],
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

    'security-credentials': createDetail({
      id: 'security-credentials',
      definition:
        '限制 Agent 执行的命令及其子进程取得凭据文件与敏感环境变量的方式：拒绝读取、整体移除、以哨兵值打码，或由出站代理在请求中替换真实值。',
      includes: ['凭据文件拒绝读取或打码', '敏感环境变量移除或打码', '出站请求真实值替换'],
      excludes: ['产品自身账号登录凭据的存储与加密', '云厂商凭据链', '普通文件路径 Allow/Deny 规则'],
      facts: [
        'Claude Code 在 `sandbox.credentials` 下提供 files 与 envVars 的 `deny`，以及变量的 `mask`；v2.1.221 起 Linux 与 WSL 的凭据文件也支持 `mask`。v2.1.224 起打码增加 `extract` 部分捕获、`decode: "jwt"` 假令牌替换和 `awsPairs`/`sigv4` 的 AWS SigV4 重签名。',
        'Codex 通过 `[shell_environment_policy]` 在环境变量继承层过滤，官方文档用于避免把不必要的 secret 传给子进程；不提供凭据文件打码或出站替换。',
        'Qwen Code、Kimi Code 与 Qoder CLI 的公开沙箱或权限文档未列出同类凭据保护字段。',
      ],
      behavior: {
        claude:
          '文件 `deny` 等同 `filesystem.denyRead`，变量 `deny` 在每条沙箱命令执行前 unset；`mask` 让命令看到每会话哨兵值，请求离开沙箱前往 `injectHosts`（未设 `injectHosts` 时为 `network.allowedDomains` 内全部主机）时由代理替换真实值，命令与其日志不持有真实凭据。`extract` 按正则只替换每个匹配的第 1 捕获组，连接串等结构化值其余部分保持可读；`decode: "jwt"` 校验后把 JWT 替换为结构有效的假令牌，`maskClaims` 可改为只打码列出的顶层 payload 声明，校验失败或无声明命中时按未打码放行并警告；代理按访问密钥哨兵值识别 SigV4 请求，替换真实凭据后重签名。',
        codex:
          '`[shell_environment_policy]` 决定传给所生成命令的环境变量：`inherit = "none"|"core"`、`set` 显式赋值、`filters` exclude/include；官方文档用它避免把不必要的 secret 传给子进程。',
        qwen:
          '沙箱文档未提供凭据文件或敏感变量的保护字段；容器沙箱挂载工作区与 `~/.qwen`，认证与设置在沙箱内可见并在运行之间保留。',
        kimi:
          '配置文档无凭据保护字段；OS 或容器级沙箱未确认。可用 permission rules 限制文件读取等工具调用，但属于工具规则层。',
        qoder:
          '权限与 SDK 文档提供路径规则与 Sandbox Settings，但未列凭据文件或敏感变量的 deny/mask/替换；云端会话 `vault_ids` 引用云端凭据库，不是本地沙箱保护。',
      },
      overrides: {
        claude: {
          entry:
            '在用户、Managed 或 `--settings` 设置中声明 `sandbox.credentials.files`、`sandbox.credentials.envVars`、`credentials.awsPairs` 与 `credentials.sigv4`。',
          defaults:
            '没有内置凭据拒绝清单，只保护显式列出的文件和变量；仅作用于沙箱内 Bash 命令。',
          rules:
            '文件 `deny` 合并所有设置作用域，任何作用域不能移除其他作用域加入的条目；同名变量 `deny` 优先于 `mask`；`injectHosts` 每个条目本身必须被 `network.allowedDomains` 覆盖。`extract` 必须含至少一个捕获组且不能与 `decode` 同用；`onExtractNoMatch` 默认 `warn`（警告并按未打码放行，文件条目则跳过打码），可选 `deny`（沙箱内 unset 变量）或 `error`（中止沙箱初始化直到修复配置）。`awsPairs` 命名的变量必须是整值 `mask` 条目且不带 `extract`/`decode`，代理在 access key ID 条目的 `injectHosts` 主机上重签名，设置 `sessionTokenVar` 时重签请求附带真实 `x-amz-security-token`；整体打码 `AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY`、`AWS_SESSION_TOKEN` 时自动合并为一份凭据，`awsPairs` 中列出常规变量会替换自动配对。只打码 secret 而不配对时请求仍携带占位签名，会在 AWS 端失败，启动时给出警告。',
          boundary:
            '文件保护属于文件系统层，`sandbox.filesystem.disabled` 时失效；变量保护仍生效。`CLAUDE_CODE_SUBPROCESS_ENV_SCRUB` 可不经沙箱从所有子进程剥离 Anthropic 与云 Provider 凭据。',
          persistence:
            '配置保存在用户、Managed 或 `--settings` 设置；仓库 `.claude/settings.json` 或 `.claude/settings.local.json` 中的 `mask`、`network.tlsTerminate`、`credentials.allowPlaintextInject`、`credentials.awsPairs`、`credentials.sigv4` 被忽略。',
          noninteractive:
            'Headless 与交互会话同样生效；`mask` 缺少 `network.tlsTerminate` 时启动报告配置错误并失败关闭：命令只见到哨兵值，认证失败。',
          conditions:
            '`sandbox.credentials` 需 v2.1.187+；envVars `mask` 需 v2.1.199+；v2.1.221 起 Linux 与 WSL 凭据文件支持 `mode: "mask"`（沙箱命令读取哨兵副本，可为整文件或 `extract` 正则捕获片段，代理在出站时替换真实值），macOS 文件打码回退 `deny`。v2.1.224 起新增 envVars `extract`/`onExtractNoMatch`、`decode: "jwt"`/`maskClaims`、`credentials.awsPairs` 与 `credentials.sigv4`；这些选项同样需要 `network.tlsTerminate`，且只在用户、Managed 或 `--settings` 设置中生效。`credentials.sigv4` 的 `streaming`（aws-chunked 流式上传）、`presigned`（预签名 URL）、`sigv4a`（SigV4A 非对称签名）设为 `passthrough` 时，代理转发占位签名请求，由工具收到 AWS 自身的拒绝响应而非代理错误；默认情况下这类无法重签名的占位签名请求由代理直接失败。',
          sources: [
            'claude-sandboxing',
            'claude-env-vars',
            'claude-credential-file-mask',
            'claude-credential-mask-v224',
          ],
        },
        codex: {
          entry: '`~/.codex/config.toml` 的 `[shell_environment_policy]`。',
          defaults:
            '`ignore_default_excludes` 默认 `true`，即默认不自动移除名称含 KEY、SECRET、TOKEN 的变量；设为 `false` 才先应用该自动排除。',
          rules:
            '处理顺序为自动排除、自定义 exclude、`set` 赋值、include 允许列表；`set` 可恢复已排除变量，include 允许列表可再次移除。filter 大小写不敏感，支持 `*` 与 `?`；include 不恢复已被排除的变量。旧 `exclude`/`include_only` 数组仍受支持，但不能与 `filters` 在同一配置层混用。',
          boundary:
            '只约束传给所生成命令的环境变量；不提供凭据文件拒绝或打码，也没有出站真实值替换。文件系统与网络边界由 `sandbox_mode` 等另行控制。',
          persistence: '写入 `config.toml`；filter 键跨配置层按大小写不敏感合并。',
          noninteractive: '非交互运行同样按配置过滤子进程环境变量。',
          conditions:
            '`inherit = "none"` 从空环境开始，`"core"` 继承裁剪集合；无凭据文件打码或出站替换字段。',
          sources: ['codex-config'],
        },
        qwen: {
          entry:
            '无独立凭据保护入口；沙箱经 `tools.sandbox`/`--sandbox` 与 Seatbelt Profile 或容器配置。',
          defaults: '官方沙箱文档未列凭据文件或敏感变量的保护字段。',
          rules:
            '文件系统与网络边界由 Seatbelt Profile 或容器挂载与代理配置控制；文档不含凭据条目。',
          boundary:
            '容器沙箱挂载工作区与 `~/.qwen`，认证与设置在运行之间保留；挂载范围内的凭据对沙箱命令可见。',
          persistence: '沙箱配置随 Settings 与环境变量保存。',
          noninteractive: '沙箱行为在 Headless 同样按配置生效；文档未列凭据保护相关降级。',
          conditions:
            '官方文档化的隔离路径是 Seatbelt 或容器路径限制；没有凭据专用字段。',
          status: '官方确认',
          sources: ['qwen-sandbox'],
        },
        kimi: {
          entry: '配置文档无凭据保护入口。',
          defaults: 'OS 或容器级沙箱未确认；无凭据保护默认行为。',
          rules:
            '`[[permission.rules]]` 可限制文件读取等工具调用；属于工具规则层，不是沙箱凭据保护。',
          boundary: '没有沙箱层承载凭据文件打码或出站真实值替换。',
          persistence: '工具规则保存在 `~/.kimi-code/config.toml`。',
          noninteractive: '`kimi -p` 固定使用 Auto 策略；静态 deny 规则仍生效（工具层）。',
          conditions: '当前一手资料未列同类字段。',
          sources: ['kimi-interaction', 'kimi-config'],
        },
        qoder: {
          entry: '权限文档提供 Read/Edit 路径规则；SDK 提供 Sandbox Settings。',
          defaults: '公开参考未列凭据文件或敏感变量的 deny/mask 清单。',
          rules: '路径权限规则与 `canUseTool` 控制工具调用；无凭据专用键。',
          boundary:
            '本地 CLI/SDK 文档未列凭据文件打码或出站替换；云端会话 `vault_ids` 引用云端凭据库，不是本地沙箱保护。',
          persistence: '权限规则按用户、项目、本地项目等设置层保存。',
          noninteractive: 'Headless 中 `ask` 自动变为 `deny`；文档未列凭据保护行为。',
          conditions: '本地 CLI/SDK 文档未列同类凭据保护字段。',
          sources: ['qoder-permissions', 'qoder-sdk-reference'],
        },
      },
      related: ['security-filesystem', 'security-network', 'auth-storage'],
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

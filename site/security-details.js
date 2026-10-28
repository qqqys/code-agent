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
        'YOLO 跳过普通工具审批，但敏感文件与退出 Plan 仍可询问；Auto 会自动处理全部审批并禁止 Agent 向用户提问，2.4.0 起唯一例外是 Plan 模式的计划审阅仍等用户确认。',
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
        'Kimi Code 把内置风险询问做成三条具名策略（`dangerous-command-ask`、`sensitive-file-access-ask`、`git-control-path-access-ask`），由 `[permission] dangerous_command_guard` 一个布尔键整体开关；它们只决定要不要问用户，不替代 OS 沙箱，也不影响工具层对秘密文件的 `PATH_SENSITIVE` 硬阻断。',
        'Kimi Code 的 13 条策略按固定顺序求值、第一条命中即定案，链上位置决定豁免范围：危险命令 guard 排在 `session-approval-history` 与 `user-configured-allow` 之前，会话内放行和用户 allow 规则都不能豁免它；敏感文件与 git 控制路径两条 guard 排在这两者之后，可以被用户 allow 规则或会话内放行覆盖。',
      ],
      behavior: {
        claude:
          '默认模式下，文件修改和需要授权的 Bash 调用弹出确认；规则可直接允许、强制询问或拒绝。',
        codex:
          '`on-request` 允许 Agent 在越出沙箱、请求网络或调用需确认工具时发起审批；可由用户或 Auto-review 处理符合条件的请求。',
        qwen:
          'Ask Permissions 模式要求文件编辑和 Shell 命令确认；Auto 模式由分类器给出允许或阻断，显式 deny 仍优先。',
        kimi:
          '副作用工具弹出审批面板，可单次允许、拒绝或选「Approve for this session」放行本会话同类调用。除用户规则外还有三条内置 guard 询问策略：`dangerous-command-ask` 只看 `Bash`，用 bash 解析器（`PARSE_OPTIONS = { timeoutMs: 500, maxNodes: 10_000 }`）识别 shutdown/halt/poweroff/reboot/bcdedit/diskpart/format/restart-computer/stop-computer/mkfs 与 `mkfs.*`/wipefs、`init`/`telinit` 带操作数 `0` 或 `6`、`systemctl poweroff|reboot|halt|kexec`、`dd` 的 `of=` 指向 `/dev/` 且不在 8 个安全设备内、`rm` 同时带递归与强制标志（操作数全为 `/tmp`、`/temp` 或其下且不含 `..` 段时放行），并先剥掉 `sudo`/`doas`、`env`/`command`/`exec`/`nohup`/`builtin`/`nice`、`busybox <applet>` 外壳、再递归解析嵌套 shell 的 `-c` 载荷与 `eval` 参数（上限 `MAX_NESTED_SHELL_DEPTH = 4`）；命令名比对前去目录、转小写、去 `.exe`。解析不出来的命令在 "Always Ask" 下也询问（reason 为 `unanalyzable_command`），在 "Ask When Needed" 下放行。`sensitive-file-access-ask` 对本次调用的每个文件访问跑 `isSensitiveFile`，命中即返回不带 reason 的 ask。`git-control-path-access-ask` 要求工作区 `workDir` 非空，先看相对 cwd 的路径段里有没有小写 `.git`，否则用 `git.findWorkTree(cwd)` 取 marker 后判断路径是否落在 `dotGitPath` 或 `controlDirPath` 内，读写访问都覆盖。',
        qoder:
          '每次工具调用得到 allow、ask 或 deny；TUI 消费 ask 为确认面板，SDK 与 ACP 可转给外部宿主。',
      },
      overrides: {
        kimi: {
          entry:
            '`/permission` 选择权限模式；`/yolo`（别名 `/yes`）与 `/auto` 分别打开权限模式列表并预选 "Ask When Needed" 与 "Never Ask"，都要按 `Enter` 确认开启；`/plan [on|off]` 切换 Plan。启动参数提供 `--plan`、`--yolo`/`-y`（隐藏别名 `--yes`、`--auto-approve`）、`--auto`，`--yolo` 与 `--auto` 互斥；恢复会话时可用这三个参数覆盖原会话保存的模式。审批面板用方向键加 `Enter` 或 `1`/`2`/`3` 数字键确认，`Esc`/`Ctrl-C`/`Ctrl-D` 拒绝。',
          defaults:
            '`default_permission_mode` 默认 `manual`（展示名 "Always Ask"，原 Manual），可选 `yolo`（"Ask When Needed"，原 YOLO）与 `auto`（"Never Ask"，原 Auto）——配置值没有改名，改的只是展示名；`default_plan_mode` 默认 `false`。`[permission] dangerous_command_guard` 默认 `true`，即三条内置 guard 询问策略默认全部启用；"Always Ask" 下另有 `default-tool-approve` 自动放行 23 个只读或无副作用工具（Read、Grep、Glob、ReadMediaFile、SetTodoList、TodoList、TaskList、TaskOutput、WaitFor、CronList、WebSearch、FetchURL、Agent、AgentSwarm、AskUserQuestion、NotifyUser、Skill、ExitPlanMode、CreateGoal、GetGoal、SetGoalBudget、UpdateGoal、select_tools；2.4.0 起 `EnterPlanMode` 随工具一起删除，该清单由 24 项减为 23 项），其余落到链末 `fallback-ask` 逐个询问。',
          rules:
            '`[[permission.rules]]` 按顺序匹配第一条命中即生效，字段为 `decision`（`allow`/`deny`/`ask`）、`scope`（`turn-override`/`session-runtime`/`project`/`user`，默认 `user`）、`pattern`（`工具名` 或 `工具名(参数模式)`，如 `Bash(rm -rf*)`）与可选 `reason`；`AgentSwarm`、MCP 工具和自定义工具只能按工具名匹配。13 条策略顺序为 `auto-mode-ask-user-question-deny`、`user-configured-deny`、`dangerous-command-ask`、`auto-mode-approve`、`session-approval-history`、`user-configured-ask`、`user-configured-allow`、`sensitive-file-access-ask`、`git-control-path-access-ask`、`yolo-mode-approve`、`default-tool-approve`、`git-cwd-write-approve`、`fallback-ask`。`[permission] dangerous_command_guard = false` 或环境变量 `KIMI_CODE_DANGEROUS_COMMAND_GUARD=false` 一次关掉三条 guard；`parseDangerousCommandGuardEnv` 只把字面 `true`/`false` 解析成布尔，其他取值返回 `undefined` 因而回落到文件设置与默认值。三条 guard 都在每次 `evaluate` 时现读 `IConfigService`（`isDangerousCommandGuardEnabled` 逐字为 `config.get(PERMISSION_SECTION)?.dangerousCommandGuard ?? true`），不在会话启动时固化。`[tools].enabled` 与 `disabled` 另行限制模型能看到和调用的工具。',
          boundary:
            '权限策略链覆盖文件、Bash、MCP 等工具调用；当前公开 CLI 文档未列出对这些工具子进程提供 OS 级文件系统或网络沙箱。guard 关闭不放开工具层的秘密文件硬阻断：`resolvePathAccess` 在 `policy.checkSensitive`（`DEFAULT_WORKSPACE_ACCESS_POLICY` 里为 `true`）且路径命中 `isSensitiveFile` 时抛 `PathSecurityError(\'PATH_SENSITIVE\')`，消息为 “matches a sensitive-file pattern (env / credential / SSH key). Access is blocked to protect secrets.”，官方文档也逐字写 “`Read`/`Write`/`Edit` 对秘密文件的硬阻断保持不变”。敏感文件判定为 `.env`、`.env.` 前缀（`.env.example`/`.env.sample`/`.env.template` 豁免）、`id_rsa`/`id_ed25519`/`id_ecdsa`/`credentials` 及其后接 `-`/`_` 或接 `.` 加 `.bak`/`.backup`/`.copy`/`.disabled`/`.key`/`.old`/`.orig`/`.pem`/`.save`/`.tmp` 的变体、`.aws/credentials` 与 `.gcp/credentials`，公钥 `id_rsa.pub`/`id_ed25519.pub`/`id_ecdsa.pub` 豁免，比较前统一小写。',
          persistence:
            '全局规则与 `dangerous_command_guard` 写在 `~/.kimi-code/config.toml`（首次运行自动创建，`KIMI_CODE_HOME` 可把数据目录整体搬到 `$KIMI_CODE_HOME/config.toml`）；`[watch].enabled` 默认开启，`config.toml` 自身的改动会热更新，也可用 `/reload` 立即重载。审批面板的「Approve for this session」以 `scope = "session-runtime"` 规则进入 `sessionApprovalRulePatterns`，只在本会话生效。项目级 `<项目根>/.kimi-code/local.toml` 当前公开的是额外工作目录等本地设置。',
          noninteractive:
            '`--prompt`/`-p` 非交互执行不能与 `--yolo`、`--auto`、`--plan` 同用，固定按 `auto` 权限策略处理、不请求人工审批，静态 deny 规则仍生效。源码层面 `bootstrap.args.nonInteractive` 为真时 `dangerous-command-ask` 整条不进策略链（官方测试 “does not load the dangerous command policy for non-interactive hosts”）；另两条文件 guard 仍在链上，但排在它们前面的 `auto-mode-approve` 会先放行。',
          conditions:
            '三条 guard 只在 "Always Ask" 与 "Ask When Needed" 下工作："Never Ask"（`auto`）里 `dangerous-command-ask` 与两条文件 guard 都被前置的 `auto-mode-approve` 或自身早退跳过，官方交互文档写这些命令在该模式下直接执行、不再拦截；退出 Plan 模式的审批不被 `/yolo` 跳过。`dangerous_command_guard` 关掉全部三条 guard 的语义只在 main 分支（提交 `6e7cc909da90`，PR #4250，2026-10-16），最新 Release `@moonshot-ai/kimi-code@2.2.0`（2026-10-14）里该键只关危险命令一项；拆成多个独立开关的 PR #4219 已于 2026-10-16 关闭且未合并。该键自提交 `4b9888b73db5`（PR #3290，2026-08-31）起存在，2.0.0 至 2.2.0 各 tag 的配置文档都有记载。官方对开关的用法建议逐字为“此开关只适用于已经在 Agent 之外统一命令限权的环境”。',
          sources: [
            'kimi-modes-interaction',
            'kimi-guard-slash-commands',
            'kimi-guard-cli-reference',
            'kimi-guard-config-docs',
            'kimi-guard-config-docs-en',
            'kimi-guard-config-docs-220',
            'kimi-guard-config-files-layout',
            'kimi-guard-config-section',
            'kimi-guard-policy-chain',
            'kimi-guard-dangerous-command',
            'kimi-guard-sensitive-file',
            'kimi-guard-git-control-path',
            'kimi-guard-path-access',
            'kimi-guard-default-tool-approve',
            'kimi-plan-default-approve-240',
            'kimi-guard-policy-test',
            'kimi-guard-widen-commit',
            'kimi-guard-introduce-commit',
            'kimi-guard-changeset',
            'kimi-guard-split-switch-pr',
            'kimi-guard-release-220',
          ],
        },
      },
      related: ['cmd-permissions', 'security-bypass', 'security-noninteractive'],
    }),

    'security-plan': createDetail({
      id: 'security-plan',
      definition:
        '在执行修改前进入以阅读、分析和方案确认为主的工作状态，并限制或阻断一般写入；本页同时比较谁能开启这一状态、Plan 期间放行与阻断什么、计划如何被审阅，以及退出后落到哪个权限模式。',
      includes: [
        'Plan 工作状态的入口与可开启者（用户入口与模型工具）',
        'Plan 期间被放行、被限制与被阻断的工具',
        '计划的呈现方式、审批选项与退出后的权限模式',
        '非交互运行与 Subagent 中的 Plan 行为',
        'Plan 相关配置键、默认值与计划文件保存位置',
      ],
      excludes: [
        '普通 Todo 或清单工具（Codex `update_plan`、Kimi `TodoList`）',
        'Subagent 的只读配置与内置 `plan`／`explore` 角色本身',
        '代码 Review 命令',
        'OS 沙箱强度与网络边界本身',
      ],
      facts: [
        '五家都有 Plan 工作状态，但“谁能开启”分成两类：Claude Code、Qwen Code 与 Qoder CLI 既给用户入口也给模型工具（Claude `EnterPlanMode`／`ExitPlanMode`、Qwen `enter_plan_mode`／`exit_plan_mode`、Qoder `EnterPlanMode`／`ExitPlanMode`），Codex 只有用户入口（`/plan` 与 TUI 的协作模式预设，`rust-v0.165.0` 的 `codex-rs/core/src/tools/handlers` 57 个条目里名字含 plan 的只有实现 `update_plan` 的两个文件），Kimi Code 自 2.4.0 起删掉 `EnterPlanMode`、只剩用户入口。',
        'Kimi Code 2.4.0（2026-10-28T11:45:13Z 发布，标签提交 `f26e4d91ef8d5d233f6c20b42a150f96924d4f5e`）是这条轴上最新的一次收紧：`EnterPlanMode` 工具、它在 `default-tool-approve` 里的自动放行条目与它的 telemetry 事件一起删除（`DEFAULT_APPROVE_TOOLS` 由 24 项减到 23 项、仍含 `ExitPlanMode`），`coder` 档与 Tower worker 档删掉两个 Plan 工具，官方交互文档改写为“Plan 模式只能由你打开，Agent 不会自己进入，即使你在对话里要求它进入”，系统提示词按档注入 `PLAN_MODE_GUIDANCE`；改动来自提交 `0325b755db46f865f2dc0bca0d6c3d95ad817fcb`（PR #4247，2026-10-23 合入 main，84 个文件、+979/−790），与 2.3.3 标签提交的 compare 结果是 `diverged`、与 2.4.0 标签提交的 compare 结果是 `behind`，因此不在 2.3.3 及更早版本里。本仓库此前记的“Auto 会自动处理全部审批”“退出 Plan 通常仍需确认”据此作废——旧官方文档里“计划退出会自动批准，并在记录中标记为 "Auto-approved"”一句已在同一提交删掉。',
        '计划是否总要人工审阅：Kimi 与 Qoder 在任何权限模式下都要（Kimi 官方写“在任何权限模式下，包括 "Never Ask"，退出 Plan 模式都需要你确认”，Qoder 官方写“entering or leaving Plan always request confirmation … None of these are outcomes of a permission verdict”）；Qwen 的 `exit_plan_mode` 在 Plan 模式下 `requiresUserInteraction()` 返回真、确认框 `hideAlwaysAllow: true`；Claude 的 `ExitPlanMode` 在工具参考的 Permission required 列标 Yes，但交互式终端会话里 bypass permissions 可用时 Plan 的阻断整体不强制；Codex 的 Plan 模式“until a developer message explicitly ends it”，TUI 在计划被批准后弹 “Implement this plan?” 让用户选实现方式。',
        '无人值守模式与 Plan 的关系各不相同：Kimi “Never Ask”（`auto`）的唯一例外是计划审阅，注入提示逐字写 “Plan mode is the exception: ExitPlanMode still waits for the user to review the plan.”；Qoder `auto` 下分类器熔断是唯一由权限裁决产生授权提示的情况，而进出 Plan 的确认不属于权限裁决（1.0.12 与 1.1.11 曾取消该弹窗、1.1.21 恢复）；Qwen YOLO 下模型自行进入 Plan 被拒并回 “Stayed in YOLO mode (plan mode not entered).”，只有 `userRequested: true` 才生效（#5970）；Claude 在 auto 可用且 `useAutoModeDuringPlan`（默认开启）时让 classifier 审查规划期的 shell 命令而不是逐个询问。',
        'Plan 期间允许什么、阻断什么的口径不同：Kimi 只允许写当前计划文件，拦 `TaskStop`、`CronCreate`、`CronDelete`，`Bash` 按普通权限规则；Qwen 的每轮注入提醒禁止任何编辑与状态修改类工具，安全性无法判定的 shell 命令要用户对那一次调用单独批准一次，并明令不得用包装、引号技巧、别名或混淆手段绕过；Codex 允许非变更动作（含只写缓存或构建产物的测试、构建与检查）但禁止任何改动仓库跟踪状态的动作，判据是“if the action would reasonably be described as "doing the work" rather than "planning the work," do not do it”；Claude 不改源码但会跑 shell 探索，规划期命令的处理按 bypass 可用、auto 加 `useAutoModeDuringPlan`、其余三种情况依次判定；Qoder 的 `plan` 取值被描述为 “Read-only mode”，1.0.33 起支持只读 Shell 命令，官方没有公开被阻断工具的完整清单。',
        '计划正文的载体五家不同：Kimi 用会话目录里的计划文件（`<sessionDir>/agents/<agentId>/plans/<id>.md`），`ExitPlanMode` 不接受计划正文、只读文件并在审阅前 `recordRevision()` 把该版写进 blob store 的 `plan/<id>/v<n>.md`（带 `sha256` 与 `bytes`），`options` 可给 1–3 个备选方案；Qwen 用 `exit_plan_mode` 的必填 `plan` 参数（空字符串被拒），批准后 `savePlanBestEffort(plan)`；Codex 要求把最终计划包在 `<proposed_plan>` 块里由客户端渲染（每轮至多一个块、修订必须整块替换）；Claude 官方只写 Claude “writes a plan” 并提供 `Ctrl+G` 在默认文本编辑器里打开拟议计划；Qoder 官方没有公开计划正文的载体，只能从 0.2.3 的 “Fixed Plan mode requiring permission to read plan files” 确认存在计划文件。',
        'Subagent 范围：Kimi 的 Plan 模式只属于 main agent（`enter()` 对其他 agent 抛 `SESSION_PLAN_MODE_INVALID: "Plan mode is only available to the main agent"`，`planKey` 的 `PlanModeEnter` reducer 忽略非 main agent 的事件，`coder` 档与 Tower worker 档已删两个 Plan 工具，官方 Agent 文档同步删掉 `coder` subagent “进入 Plan 模式” 的说法）；Qwen 的两个 Plan 工具在 Subagent 里按 `subagent-plan-tool-policy` 被阻断，团队场景的 plan-required teammate 改由 leader 裁决（成功时 `llmContent` 以 “Leader approved.” 开头）；Qoder 0.2.15 修过 “Fixed auto mode not being respected during plan mode for subagent tool calls”，说明其 Plan 状态下存在 Subagent 工具调用；Claude 与 Codex 的 Subagent 侧 Plan 行为官方未公开，记为未确认。',
        '非交互运行：Kimi `kimi -p` 新会话跳过 `default_plan_mode`（stderr “default_plan_mode is not applied in print mode, because Plan mode waits for your review.”），恢复已在 Plan 的会话照常运行并提示用 `kimi -r <id>` 审阅，非交互宿主里审批立即判定且从不视为批准（计划审阅返回 deny 加 “Nobody can review this plan in a non-interactive run, so plan mode stays active for the rest of this run and you cannot edit files other than the plan file.”，`resolveNonInteractive` 的类型排除了 `ask`）；Qwen 的 `/plan` 只在交互式可用，headless/ACP 里 `enter_plan_mode` 是唯一入口，非交互且无 ACP 时直接拒绝；Claude 写 “Plan mode keeps its blocks wherever Claude Code runs without an interactive terminal, including non-interactive runs with `-p`, Agent SDK sessions, and conversations in the VS Code extension\'s chat panel.”；Qoder 1.0.35 修过 “Fixed Plan and Ask tools not being correctly disabled in headless mode”；Codex 非交互运行下的 Plan 行为官方未公开，记为未确认。',
        '配置键五家各自独立：Kimi `default_plan_mode`（默认 `false`，`kimi -p` 下不生效）；Qwen `.qwen/settings.json` 的 `tools.approvalMode: "plan"`；Claude 项目 `.claude/settings.json` 的 `defaultMode: "plan"`、VS Code 用户设置的 `claudeCode.initialPermissionMode: "plan"`，以及 `useAutoModeDuringPlan` 与 `showClearContextOnPlanAccept`；Codex 只有 `plan_mode_reasoning_effort`（Plan 模式专用推理强度覆盖，未设时用内置预设），没有默认进 Plan 或开关 Plan 的键；Qoder `general.plan.enabled: false` 一次性关掉 `/plan`、`--permission-mode plan` 映射与两个 Plan 工具，1.0.44 起 `/settings` 里也有开关。',
        'Plan 与权限模式的关系不同：Qoder 自 1.0.14 起把 Plan 做成独立工作状态（`/plan` 进出、`Shift+Tab` 只循环权限模式，`--permission-mode plan` 只保留兼容映射 “translates to default + enters Plan work state”）；Claude 与 Qwen 的 Plan 是权限模式之一（Claude `Shift+Tab` 循环 `default` → `acceptEdits` → `plan`，Qwen 循环 plan → default → auto-edit → auto → yolo）；Codex 把 Plan 做成与 `Default` 并列的协作模式（`ModeKind`，TUI 可见的只有这两个，预设来自服务端发现、缺发现就没有预设）；Kimi 的 Plan 是独立于三种权限模式的开关（`/plan [on|off]`、`--plan`、`default_plan_mode`），恢复会话时可用 `--plan`／`--yolo`／`--auto` 覆盖原会话保存的模式。',
        'Plan 工作流与技术上的只读沙箱不是同一概念：Codex 明确把两者作为不同控制（官方审批页把“想聊天或规划而不做改动”指向 `/permissions` 切 `read-only`），Kimi 的 Plan 门禁挂在工具执行器的 before-execute 钩子上、与权限策略链和沙箱都无关，Qwen 的 Plan 是审批模式而不启用 Sandbox。清单工具也与 Plan 模式无关：Codex 的 `update_plan` 在 Plan 模式下直接返回错误 “update_plan is a TODO/checklist tool and is not allowed in Plan mode”，Kimi 的 before-execute 门禁只拦 `Write`／`Edit` 越界写、`TaskStop`、`CronCreate` 与 `CronDelete`，`TodoList`／`SetTodoList` 不在其中。',
      ],
      behavior: {
        claude:
          'Plan Mode 是权限模式之一：Claude 读文件、跑 shell 命令探索并写出计划，但不改源码；除“交互式终端会话且 bypass permissions 可用”这一种情况外，编辑在用户批准计划前一直被阻断。规划期的 shell 命令按官方三种情况里第一条命中的处理：bypass permissions 可用的交互式终端会话既不经 classifier 也不询问；auto 模式可用且 `useAutoModeDuringPlan` 开启（默认开启）时由 classifier 审查除 critical-path 删除以外的命令，批准的运行、拒绝的阻断；auto 不可用或该设置关闭时，内置只读命令集之外的命令逐个询问（沙箱的 auto-allow 模式开着也一样）。计划就绪后 Claude 呈现计划并询问如何继续，选项为 **Yes, and use auto mode**（auto 对该会话不可用时读作 **Yes, auto-accept edits**；以 bypass permissions 启动会话时读作 **Yes, and switch to BYPASS PERMISSIONS (no further prompts) for this session**）、**Yes, manually approve edits** 与 **No, keep planning**；批准即退出 Plan 模式并把会话切到该选项描述的权限模式，`Ctrl+G` 可在批准前用默认文本编辑器直接改拟议计划。模型侧另有 `EnterPlanMode`（工具参考 Permission required 列为 No，描述 “Switches to plan mode to design an approach before coding”）与 `ExitPlanMode`（列为 Yes，描述 “Presents a plan for approval and exits plan mode”，权限规则只能写裸工具名），因此 Claude 自己也能切入 Plan 模式。',
        codex:
          'Plan 是与 `Default` 并列的协作模式（`ModeKind`，TUI 可见的只有这两个），既不是沙箱也不是审批策略：官方审批页把“想聊天或规划而不做改动”指向用 `/permissions` 切 `read-only`。模式提示词来自 `collaboration-mode-templates/templates/plan.md`，分三阶段（先在环境里取证、再聊意图、再聊实现），并写 “You are in **Plan Mode** until a developer message explicitly ends it.” 与 “Plan Mode is not changed by user intent, tone, or imperative language. If a user asks for execution while still in Plan Mode, treat it as a request to **plan the execution**, not perform it.”；允许非变更动作（读搜文件与配置、静态分析与仓库探索、不改仓库跟踪文件的 dry-run，以及只写缓存或构建产物的测试、构建与检查），禁止任何改动仓库跟踪状态的动作（编辑或写文件、会重写文件的格式化或 lint、apply patch／迁移／codegen，以及以执行为目的的副作用命令）；提问优先用 `request_user_input`，可发现的仓库事实必须先探索，只有偏好与取舍才提前问并给 2–4 个互斥选项加推荐默认。最终计划必须 decision complete 并包在 `<proposed_plan>` 块里由客户端渲染（开闭标签各占一行、块内用 Markdown、标签不翻译不改名，每轮至多一个块，修订时新块必须整体替换），并明确 “Do not ask "should I proceed?" in the final output.”——由用户自行切出 Plan 模式并要求实现。TUI 在计划被批准后弹 “Implement this plan?”：Yes, implement this plan（以 Default 模式提交 “Implement the plan.”）、Yes, clear context and implement（清空界面并在新上下文提交以 “A previous agent produced the plan below to accomplish the user\'s task. Implement the plan in a fresh context. Treat the plan as the source of user intent, re-read files as needed, and carry the work through implementation and verification.” 开头、后接计划 Markdown 的消息，描述行为 “Fresh thread with this plan” 或带用量标签的 “Start a fresh thread (current context: 89% used)”）、No, stay in Plan mode；Default 预设缺失时前两项禁用并显示 “Default mode unavailable”，有预设但没有已批准计划时第二项禁用并显示 “No approved plan available”。`update_plan` 是清单工具、不进入也不退出 Plan 模式，在 Plan 模式下调用直接返回错误 “update_plan is a TODO/checklist tool and is not allowed in Plan mode”。',
        qwen:
          '`plan` 是五个审批模式之一（官方对照表把 Plan 记为文件编辑 “❌ Read-only analysis only”、Shell 命令 “❌ Not executed”、风险 Lowest，循环顺序 plan → default → auto-edit → auto → yolo）。进入后每轮注入 `getPlanModeSystemReminder()`：不得做任何编辑、不得运行被归类为状态修改的工具（包括改配置或提交）、不得以其他方式改动系统；安全性无法判定的 shell 命令只有在用户对那一次调用明确批准一次、且调查确有必要时才能运行，而这种一次性批准 “does not approve the plan, authorize related commands, or exit Plan mode”；被阻断时不得重试或反复尝试类似的非只读工具，不得用包装、引号技巧、别名或混淆手段让被阻断的写操作看起来未知，也不得为了解封立刻调用 `exit_plan_mode`。系统提示词另写 “Do not enter plan mode or call enter_plan_mode on your own just because the task involves planning or complexity.”，官方文档也写 “Regular planning requests do not switch modes by themselves.”。模型侧的 `enter_plan_mode` 是降权动作，`getDefaultPermission()` 返回 `allow`、不弹确认，但描述要求只在用户本轮明确要求或确认想要时使用；YOLO 下若未传 `userRequested: true` 则不进入并回 “Stayed in YOLO mode (plan mode not entered).”；进入是幂等的（已在 Plan 时不再覆盖保存的 `prePlanMode`），并会 reveal 延迟声明的 `exit_plan_mode`。`exit_plan_mode` 必填 `plan` 参数（空字符串被拒），在 Plan 模式下 `requiresUserInteraction()` 返回真（源码注释写它 “forces \'ask\' via permissionFlow”），确认框标题 “Would you like to proceed?” 且 `hideAlwaysAllow: true`；四个结果分别落到 `getPlanExecutionMode()` 或进入前的模式（RestorePrevious）、`auto-edit`（ProceedAlways）、`default`（ProceedOnce）与不批准（Cancel）；未批准、被取消与审批模式已变分别回 “Plan execution was not approved. Remaining in plan mode.”、“Plan exit was cancelled. Remaining in plan mode.” 与 “Plan approval is stale because the approval mode changed. No action was taken.”；批准后 `savePlanBestEffort(plan)` 并以 `fromApprovedPlanExit: true` 切换审批模式、回 “User approved. You can now start coding.”。不在 Plan 模式时调用 `exit_plan_mode` 返回指引错误而不是权限拒绝（#7671），在批准流程之外切换模式则注入一次性提醒 `getManualPlanExitSystemReminder()`。',
        kimi:
          '2.4.0 起 Plan 模式只能由用户打开：`EnterPlanMode` 工具、它在 `default-tool-approve` 里的自动放行条目与它的 telemetry 事件一起删除，官方工具文档写“Plan 模式是一种受约束的工作状态，只能由用户打开（`Shift-Tab` 或 `/plan`），Agent 没有进入它的工具”，交互文档写“Plan 模式只能由你打开，Agent 不会自己进入，即使你在对话里要求它进入”，系统提示词按档注入 `PLAN_MODE_GUIDANCE`（“only the user can turn on … you cannot enter it yourself. If the user asks for plan mode, tell them how to turn it on. When they ask you to plan first, wait for their go-ahead before changing code.”），且只在该档仍启用 `ExitPlanMode` 时注入。开启后 `Write` 与 `Edit` 只允许写当前计划文件（判定为本次调用的写访问非空且每一项路径都等于计划文件路径），越界写回 “Plan mode is active. You may only write to the current plan file: <path>. Call ExitPlanMode to exit plan mode before editing other files.”，`TaskStop` 与 `CronCreate`／`CronDelete` 被拦并各自回固定文案，其余工具（含 `Bash`）按当前权限模式与规则处理。`ExitPlanMode` 不接受计划正文：它读当前计划文件、先 `recordRevision()` 存一版，再以 `plan_review` 展示交给用户审阅；工具自身的 `execution()` 恒返回 `isError`（未处于 Plan 时回 “ExitPlanMode can only be called while plan mode is active. Only the user can turn plan mode on.”，计划没能展示时回 “The plan could not be shown to the user for review, so plan mode is still active. Call ExitPlanMode again.”，计划文件缺失或为空时回 “No plan file found. Write your plan to <path> first, then call ExitPlanMode.”），真正的退出只发生在审阅结果里：批准则 `plan.exit()` 并回 “Exited plan mode.” 加 “Plan mode deactivated. All tools are now available.”、可选的 “Plan saved to: <path>” 与 “## Approved Plan:” 加计划正文（选了备选方案时前缀 “Selected approach: <label>” 与 “Execute ONLY the selected approach. Do not execute any unselected alternatives.”）；取消回 “Plan approval dismissed. Plan mode remains active.”（不算错误）；Reject and Exit 先退出 Plan 再回 “Plan rejected by user. Plan mode deactivated.”（`isError` 且 `stopTurn`）；Revise 或带反馈不算错误，回 “User rejected the plan. Feedback:” 加反馈或 “User requested revisions. Plan mode remains active.”；单纯拒绝回 “Plan rejected by user. Plan mode remains active.”（`isError` 且 `stopTurn`）。遥测为 `plan_submitted`（带 `has_options`）与 `plan_resolved`（outcome 取 approved、dismissed、rejected_and_exited、revise 或 rejected）。这道审阅门禁挂在工具执行器的 before-execute 钩子上（`event.waitUntil(() => this.review.requestApproval(event))`），因此与当前权限模式无关；`options` 可给 1–3 个备选方案（`label` 最长 80 字符、不得重复、不得用 `Approve`／`Reject`／`Reject and Exit`／`Revise` 保留词），源码只在 `options.length >= 2` 时把它放进审阅展示。',
        qoder:
          'Plan 是独立于权限循环的工作状态（1.0.14 起 `/plan` 进出、`Shift+Tab` 只循环权限模式），官方取值表把它描述为 “Read-only mode (legacy compat: maps to default + Plan work state)”，启动参数 `--permission-mode plan` 只做兼容映射（“translates to default + enters Plan work state”）；1.0.33 起支持只读 Shell 命令，0.2.3 修过读取计划文件还要权限的问题。模型侧有 `EnterPlanMode` 与 `ExitPlanMode` 两个工具（官方工具页把 “Plan work” 归在 Manage Context：“Enter or exit Plan mode when the task should be analyzed before execution.”），`general.plan.enabled: false` 时 “the `/plan` command is unavailable, `--permission-mode plan` falls back to default, and EnterPlanMode/ExitPlanMode tools are not registered.”。`auto` 模式下分类器熔断是唯一由权限裁决产生授权提示的情况，而“需要用户输入的工具（如 AskUserQuestion）与进入或离开 Plan 始终请求确认”，官方明确这几类 “are not outcomes of a permission verdict”，因此 Plan 的确认走的是另一条路径；这条口径经过反复：1.0.12 让 YOLO 下 EnterPlanMode/ExitPlanMode 不弹窗、1.1.11 让 auto/yolo 下进出 Plan 不再弹权限窗、1.1.21 又 “Restored the confirmation dialog when entering and exiting Plan mode under auto and yolo modes”。退出选项也在演进：0.2.15 起批准计划时可直接选 auto 模式，1.0.14 起 ExitPlanMode 提供 “start goal execution” 选项以便转入 Goal，1.0.39 优化过退出选项，1.1.13 修过会话级 Plan 批准不持久的问题。',
      },
      overrides: {
        claude: {
          entry:
            '用户入口有三个：`Shift+Tab` 循环（从 auto 起第一次切到 `default`，随后 `default` → `acceptEdits` → `plan`，可选模式排在 `plan` 之后，状态栏显示 `⏸ plan mode on`）、把单条提示词前缀成 `/plan`（官方写 “prefixing a single prompt with `/plan`”，要再规划需再次前缀或循环回 Plan）、以及 `claude --permission-mode plan`；再按一次 `Shift+Tab` 可以在不批准计划的情况下离开 Plan 模式。模型入口是 `EnterPlanMode` 工具，工具参考的 Permission required 列为 No。',
          defaults:
            '默认权限模式为 `default`；v2.1.283 起交互式终端与 VS Code 会话的内置起始模式是 auto。把项目 `.claude/settings.json` 的 `defaultMode` 设为 `plan` 可让该项目的终端会话默认进 Plan；VS Code 扩展发起的对话不读项目设置的起始权限模式，改在 VS Code 用户设置里把 `claudeCode.initialPermissionMode` 设为 `plan`。与 Plan 相关的另外两个设置是 `useAutoModeDuringPlan`（默认开启，决定规划期 shell 命令是否交给 classifier 审查）与 `showClearContextOnPlanAccept`（开启时审批列表首项变为批准计划并清理规划上下文）。',
          persistence:
            'Plan 是会话内的权限模式，批准或离开后就切到别的模式；接受计划还会按计划给会话生成标题（除非已命名）。官方没有公开计划或拟议计划的保存路径，只给出 `Ctrl+G` 在默认文本编辑器里打开拟议计划直接编辑，计划文件位置记为未确认。',
          noninteractive:
            '官方逐字写 “Plan mode keeps its blocks wherever Claude Code runs without an interactive terminal, including non-interactive runs with `-p`, Agent SDK sessions, and conversations in the VS Code extension\'s chat panel.”，即在 `claude -p`、Agent SDK 与 VS Code 聊天面板里 Plan 的阻断仍然生效；反过来，交互式终端会话里 bypass permissions 可用时 “Claude Code also doesn\'t enforce plan mode\'s blocks”，Claude 仍被要求只规划不编辑，但规划期尝试的文件编辑或 shell 命令会不询问直接运行，只有显式 ask 规则与被识别的 `rm`／`rmdir` critical-path 删除仍会询问。这些没有交互界面的场景里计划审批如何落定，官方没有逐项写明，记为未确认。',
          conditions:
            '规划期 shell 命令的三种情况按“第一条命中”判定，因此 bypass 可用的交互式终端会话里既没有 classifier 也没有提示；写受保护路径从不自动批准，例外只有 `bypassPermissions` 模式与“交互式终端会话 + Plan 模式 + bypass permissions 可用”；critical-path 删除只在 `bypassPermissions` 本身免询问，官方写 “Removals run with no prompt only in `bypassPermissions` mode itself, not in plan mode”；auto 模式下 classifier 还会审查 Claude 用 `SendMessage` 发给其他 agent 的消息，“both in auto mode and in plan mode while the classifier reviews commands”，该审查需要 v2.1.222 及以上；核对日期最新 Release 是 v2.1.312（2026-10-27T20:24:20Z），main 的 `CHANGELOG.md` 为 1,104,632 字节、最新段落仍是 `## 2.1.312`，其更新日志没有 Plan 模式条目；Subagent 侧的 Plan 行为官方未公开，记为未确认。',
          sources: [
            'claude-permission-modes-plan',
            'claude-tools-reference-plan',
            'claude-permission-modes',
            'claude-permissions',
            'claude-headless',
          ],
        },
        codex: {
          entry:
            '用户入口是 `/plan`（官方命令表 “Switch to plan mode and optionally send a prompt.”），可带内联提示词（“Expected: Codex enters plan mode and uses your optional inline prompt as the first planning request.”），带内联参数时还能粘贴内容或附图；Codex 正在工作时 `/plan` 临时不可用。TUI 侧的协作模式预设来自服务端 `CollaborationModeList` 发现，`collaboration_modes.rs` 过滤出 TUI 可见的 `Default` 与 `Plan`，`next_mask()` 按列表顺序循环、`mask_for_kind()` 按 kind 取预设、`default_mask()` 优先取 `Default`，缺发现就没有预设。模型侧没有进入或退出 Plan 的工具：`rust-v0.165.0` 的 `codex-rs/core/src/tools/handlers` 共 57 个条目，名字含 plan 的只有实现 `update_plan` 的 `plan.rs` 与 `plan_spec.rs`。',
          defaults:
            'Plan 不是默认模式：`ModeKind` 的 `#[default]` 是 `Default`（并接受 `code`、`pair_programming`、`execute`、`custom` 四个 serde 别名）。配置参考里与 Plan 相关的键只有 `plan_mode_reasoning_effort`（`string`，“Plan-mode-specific reasoning override using a level supported by the selected model. When unset, Plan mode uses its built-in preset default.”），没有默认进 Plan、开关 Plan 或调整 Plan 权限边界的键；该内置预设具体用哪一档推理强度官方没有公布，记为未确认。',
          boundary:
            'Plan 协作模式是提示词与模式层的约束（模板逐条列出允许的非变更动作与禁止的变更动作，并给出“doing the work 还是 planning the work”的判据），技术只读边界仍由 `sandbox_mode = "read-only"` 提供；官方审批页写 “Codex asks for approval to edit files outside the workspace or to run commands that require network access. If you want to chat or plan without making changes, switch to `read-only` mode with the `/permissions` command.”，两者可以组合但不能互相替代。',
          persistence:
            'Plan 是当前 chat/thread 的协作模式状态，按模板说法一直有效 “until a developer message explicitly ends it”，由用户切出；`<proposed_plan>` 块由客户端渲染，TUI 的 “Implement this plan?” 第二项会把计划正文塞进一条新消息并在清空后的上下文里执行（“Treat the plan as the source of user intent, re-read files as needed, and carry the work through implementation and verification.”）。官方没有公开计划的本地保存路径，记为未确认。',
          noninteractive:
            '`codex exec` 一类非交互运行下 Plan 协作模式是否可用、计划如何被批准，官方 Slash 命令页与配置参考都没有描述，记为未确认；已确认的相邻事实是 rust-v0.165.0 修过 “Prevented queued agent messages from restarting work after an interrupt or a switch to Plan mode. (#56330)”，即排队的 agent 消息在中断或切到 Plan 模式之后不再重启工作。',
          conditions:
            'Plan 与沙箱、审批策略是三个独立控制；`update_plan` 在 Plan 模式下报错，模板也专门写不要把清单工具与 Plan 模式混为一谈；协作模式预设依赖服务端发现，缺发现时 TUI 就没有 Plan 预设可选；`plan_mode_reasoning_effort` 的取值必须是所选模型支持的级别（`model_reasoning_effort` 的公开取值为 `low`、`medium`、`high`、`xhigh`、`max`、`ultra`，并写 “Available levels depend on the model and client.”）；核对日期最新稳定 Release 是 rust-v0.165.0（2026-10-27T20:09:38Z），其发布说明没有 Plan 模式条目，另有 rust-v0.166.0-alpha.1 至 alpha.5（最新 alpha.5，2026-10-28T04:43:10Z）。',
          sources: [
            'codex-plan-mode-template',
            'codex-plan-mode-kind',
            'codex-plan-handler',
            'codex-plan-implementation-tui',
            'codex-plan-slash-command',
            'codex-plan-reasoning-key',
            'codex-approvals',
            'codex-v0165-release',
          ],
        },
        qwen: {
          entry:
            '用户入口有四个：`Shift+Tab`（Windows 上 `Tab`）循环审批模式（顺序 plan → default → auto-edit → auto → yolo，状态栏显示 `⏸ plan mode`；官方写从 Normal 出发第一次会切到 `auto-edits`、再按一次才进 Plan）、`/plan`（进入，可带提示词如 `/plan refactor the auth module`）、`/plan exit`（退出并恢复进入前的审批模式）与 `/approval-mode` 后选 `plan`（用于新会话）。模型入口是 `enter_plan_mode` 工具，源码注释写它是 headless/ACP 会话进入 Plan 的唯一入口（“`/plan` is `interactive`-only and there is no Shift+Tab there”）；文档同时强调 “Regular planning requests do not switch modes by themselves. If you want the read-only Plan Mode workflow, use `/plan`, the keyboard shortcut, or set the approval mode to `plan` explicitly.”，系统提示词写 “Do not enter plan mode or call enter_plan_mode on your own just because the task involves planning or complexity.”。',
          defaults:
            '`tools.approvalMode` 当前默认为 `auto`（官方把 Auto 称为开箱默认体验），Plan 不是默认模式；把 `.qwen/settings.json` 的 `tools.approvalMode` 设为 `"plan"` 可让新会话默认进 Plan。`enter_plan_mode` 的默认权限是 `allow`（“Entering plan mode lowers privileges, so it is always allowed without a confirmation prompt.”），`exit_plan_mode` 的默认权限同样是 `allow`，但 Plan 模式下 `requiresUserInteraction()` 为真、经权限流程强制询问；`resolutionSummary` 参数已标注废弃，官方注明计划批准不再经过 LLM review gate。',
          persistence:
            'Plan 是会话内的审批模式；进入前保存 `prePlanMode`，`/plan exit` 或批准计划后恢复到它（批准时若 `getPlanExecutionMode()` 有值则优先用它，ProceedAlways 落 `auto-edit`、ProceedOnce 落 `default`），`enter_plan_mode` 幂等以免覆盖已保存的 `prePlanMode`。计划正文由 `exit_plan_mode` 的 `plan` 参数携带，批准后 `savePlanBestEffort(plan)` 尽力保存，官方文档没有公开保存路径与保留期限，记为未确认；模式在批准流程之外被切换时注入一次性提醒 “The approval mode changed outside the approved exit_plan_mode flow.”。',
          noninteractive:
            'Headless 与 ACP 里 `/plan` 与 `Shift+Tab` 都不可用，只有 `enter_plan_mode` 能进 Plan；非交互且不是 ACP（判据为 `getExperimentalZedIntegration?.()` 或 `getInputFormat?.() === InputFormat.STREAM_JSON`）时该工具直接拒绝并回 “Cannot enter plan mode in non-interactive mode without ACP support. The gate exit paths require user interaction.”、显示 “Plan mode unavailable in non-interactive mode.”。官方文档的 “Run "headless" queries in Plan Mode” 一节写 “You can also run a query in Plan Mode directly with `-p` or `prompt`:”，但示例只给 `qwen --prompt "What is machine learning?"`，没有写出同时指定 plan 模式的参数组合，该组合记为未确认。',
          conditions:
            'Subagent 中两个 Plan 工具按 `subagent-plan-tool-policy` 被阻断（`isPlanLifecycleToolUnavailableInSubagent` 为真时返回 `buildSubagentPlanToolBlockedResult`）；团队场景里 plan-required teammate 的 `exit_plan_mode` 不弹用户确认而交给 leader 裁决（`executePlanRequiredTeammate`，成功时 `llmContent` 以 “Leader approved.” 开头、可附 “ Leader note: <message>”），`PLAN_EXIT_APPROVED_LLM_CONTENT_PREFIXES = [\'User approved.\', \'Leader approved.\']` 被工具调度器用于执行后的历史清理（#6237）；YOLO 下模型自行进入 Plan 被拒（#5970），只有 `userRequested: true` 才生效；`enter_plan_mode` 进入时会 reveal 延迟声明的 `exit_plan_mode` 并调用 `setTools()` 同步声明，`setTools` 失败时回滚 reveal，reveal 整体失败只记警告仍算进入成功（`exit_plan_mode` 是 `alwaysLoad=true`）；核对日期最新稳定版是 v0.26.3（2026-10-28T14:36:14Z，标签提交 `eeee1443a7e36ab22b2f1dcded8dec64b621a7ee`），其发布说明没有 Plan 模式或审批模式条目。',
          sources: [
            'qwen-plan-approval-doc-0263',
            'qwen-enter-plan-mode-0263',
            'qwen-exit-plan-mode-0263',
            'qwen-plan-reminder-0263',
            'qwen-release-0263',
          ],
        },
        kimi: {
          entry:
            'Plan 只能由用户打开：`Shift-Tab` 或 `/plan [on|off]`（不带参数翻转、显式传 `on`/`off` 强制设置，单纯切换不会创建空计划文件）、`/plan clear` 清除当前计划（仅空闲时可用）、启动参数 `--plan` 以 Plan 模式启动新会话；恢复会话时 `--plan`、`--yolo`、`--auto` 可覆盖原会话保存的权限或计划模式。2.4.0 起模型没有进入 Plan 的工具（`EnterPlanMode` 及其默认放行条目与 telemetry 事件一起删除），官方交互文档写“Plan 模式只能由你打开，Agent 不会自己进入，即使你在对话里要求它进入”，工具文档写“只能由用户打开（`Shift-Tab` 或 `/plan`），Agent 没有进入它的工具”；系统提示词按档注入 `PLAN_MODE_GUIDANCE`（“Plan mode is a read-only planning state that only the user can turn on … you cannot enter it yourself. If the user asks for plan mode, tell them how to turn it on.”），且只在该档仍启用 `ExitPlanMode`（`planModeAvailable`）时注入。',
          defaults:
            '`default_plan_mode` 默认 `false`，官方释义为“新会话是否默认以 Plan 模式启动。非交互模式（`kimi -p`）下不生效”；`default_permission_mode` 默认 `manual`（展示名 “Always Ask”）。Plan 与三种权限模式是两套开关、可以叠加。`ExitPlanMode` 在 “Always Ask” 下仍列在 `default-tool-approve` 的 23 项自动放行清单里（`EnterPlanMode` 已从该清单删除），因此人工审阅不是由权限策略施加，而是由工具执行器上的 Plan 门禁与 `ExitPlanModeReview` 施加。',
          persistence:
            'Plan 是会话状态：`planKey` 声明为 `.replayable(...)` 且 `.undoable()`，撤销上下文后重算并广播 `AgentStatusUpdated({ agentId, planMode })`，遥测 mode 在 `plan` 与 `agent` 之间切换，状态行可显示 plan 模式。计划文件在 `<sessionDir>/agents/<agentId>/plans/<id>.md`（`id` 由 `generateHeroSlug(randomUUID())` 生成），`/plan clear` 把它写成空串；每次提交审阅前 `recordRevision()` 读该文件并以 `plan/<id>/v<n>.md` 为键写进 blob store、派发带 `sha256` 与 `bytes` 的 `PlanRevision`，因此计划的每一版都可追溯；`default_plan_mode` 写在 `~/.kimi-code/config.toml`。',
          noninteractive:
            '`--prompt`/`-p` 不能与 `--yolo`、`--auto`、`--plan` 同用，固定按 `auto` 权限处理。新建会话时若 `default_plan_mode` 已把会话带进 Plan，print 模式直接 `plan.cancel()` 并在 stderr 写 “default_plan_mode is not applied in print mode, because Plan mode waits for your review.”；`--session` 与 `--continue` 恢复已处于 Plan 的会话则照常运行、会话仍在 Plan，stderr 写 “Session "<id>" is in Plan mode, and its plan cannot be approved in print mode; review it with `kimi -r <id>`.”。非交互宿主里审批立即判定且从不视为批准：普通审批 deny 该次调用并回 “Tool "<name>" needs approval, but nobody can approve it in a non-interactive run.”，计划审阅走 `resolveNonInteractive()` 返回 deny 并附 “Nobody can review this plan in a non-interactive run, so plan mode stays active for the rest of this run and you cannot edit files other than the plan file.”，`AskUserQuestion` 回“没人能回答”；`resolveNonInteractive` 的类型是 `Exclude<PermissionPolicyResolution, { kind: \'ask\' }>`，即不能再要求人工确认。官方 CLI 文档同一段写“非交互模式下没人能审阅计划，所以新会话不应用 `default_plan_mode`。恢复已经处于 Plan 模式的会话时照常运行，会话仍在 Plan 模式中，但计划无法在非交互模式下批准，会等你下次用 `kimi -r` 打开会话时审阅。”',
          conditions:
            '本轮结论对应 Release 2.4.0（2026-10-28T11:45:13Z 发布，标签提交 `f26e4d91ef8d5d233f6c20b42a150f96924d4f5e`），改动来自提交 `0325b755db46f865f2dc0bca0d6c3d95ad817fcb`（PR #4247，2026-10-23T05:18:59Z 合入 main，84 个文件、+979/−790）：该提交与 2.3.3 标签提交 `ec495f0cb00f6db9a9118bf979112886f4264a41` 的 compare 结果是 `diverged`（ahead_by 16、behind_by 22），与 2.4.0 标签提交的 compare 结果是 `behind`（ahead_by 0、behind_by 33），所以 2.3.3 及更早版本仍是旧行为——当时官方交互文档写 “Never Ask” 下“所有工具审批自动处理，包括敏感文件和计划退出”，并写“"Never Ask" 模式例外：计划退出会自动批准，并在记录中标记为 "Auto-approved"”，本仓库此前记的“Auto 会自动处理全部审批”“退出 Plan 通常仍需确认”据此作废。Plan 只属于 main agent：`enter()` 对其他 agent 抛 `SESSION_PLAN_MODE_INVALID: \'Plan mode is only available to the main agent\'`，`planKey` 的 `PlanModeEnter` reducer 忽略 `agentId !== MAIN_AGENT_ID` 的事件，`coder` 档与 Tower worker 档已删掉两个 Plan 工具、main `agent` 档只保留 `ExitPlanMode`，官方 Agent 文档同步删掉 `coder` subagent “进入 Plan 模式” 的说法。“Ask When Needed”（`yolo`）跳过普通工具审批但不影响 Plan 退出审批，`--yolo` 也不跳过它；“Never Ask”（`auto`）的唯一例外就是计划审阅，注入提示逐字写 “Plan mode is the exception: ExitPlanMode still waits for the user to review the plan.”。审阅只在计划文件非空时出现（`display.plan.trim().length === 0` 时不接管），此时 `ExitPlanMode` 落回工具自身的错误分支；`options` 按文档可给 1–3 个备选方案（`label` 最长 80 字符、不得重复、不得用 `Approve`／`Reject`／`Reject and Exit`／`Revise` 保留词），源码只在 `options.length >= 2` 时把它放进审阅展示。`[tools] disabled` 的官方示例已从 `["EnterPlanMode", "ExitPlanMode", "mcp__github__*"]` 改为 `["WebSearch", "FetchURL", "mcp__github__*"]`；提交说明第一段写的 “refuse to resume a session that is still in plan mode” 与最终代码不一致（最终是照常运行并在 stderr 提示改用 `kimi -r`），发布说明与 changeset 的措辞 “cannot approve the plan of a session that is already in Plan mode” 与代码一致。官方没有公开 Plan 模式下 `Bash` 之外还有哪些工具被额外限制，除已确认的 `Write`／`Edit` 越界写、`TaskStop`、`CronCreate` 与 `CronDelete` 四类以外记为未确认。',
          sources: [
            'kimi-release-240',
            'kimi-4247-commit',
            'kimi-4247-changeset',
            'kimi-plan-interaction-doc-240',
            'kimi-plan-tools-doc-240',
            'kimi-plan-config-doc-240',
            'kimi-plan-cli-doc-240',
            'kimi-plan-slash-doc-240',
            'kimi-plan-agents-doc-240',
            'kimi-plan-service-240',
            'kimi-plan-exit-review-240',
            'kimi-plan-exit-tool-240',
            'kimi-plan-tool-approval-240',
            'kimi-plan-default-approve-240',
            'kimi-plan-print-mode-240',
            'kimi-plan-profile-shared-240',
            'kimi-plan-profiles-240',
            'kimi-plan-reminders-240',
          ],
        },
        qoder: {
          entry:
            '`/plan` 进入 Plan 工作状态（官方 Slash 命令参考 “Enter Plan mode.”），1.0.14 起 Plan 独立于权限循环——`/plan` 进出、`Shift+Tab` 只循环权限模式；启动参数 `--permission-mode plan` 只是兼容映射（官方注释 “Legacy compat: translates to default + enters Plan work state”）。`/plan` 只在对应功能开关启用时可用（官方写 “`/agents`, `/plan`, `/workflows`, `/marketplace`: Available only when the corresponding feature flags are enabled.”），1.0.44 起 `/settings` 对话框里也有管理 plan mode 的开关。模型侧有 `EnterPlanMode` 与 `ExitPlanMode` 两个工具（官方工具页把 “Plan work” 归在 Manage Context：“Enter or exit Plan mode when the task should be analyzed before execution.”）。',
          defaults:
            '默认权限模式是 `default`，Plan 不是权限模式之一而是独立工作状态；取值表把 `plan` 描述为 “Read-only mode (legacy compat: maps to default + Plan work state)”、别名列写 “—”，并说明取值不区分大小写、所有别名都接受。`general.plan.enabled` 设为 `false` 时 “the `/plan` command is unavailable, `--permission-mode plan` falls back to default, and EnterPlanMode/ExitPlanMode tools are not registered.”；官方只写“设为 false 时”的后果、没有逐字给出该键的默认值，按文档语气（“if the Plan workflow is not needed”）默认可用。',
          persistence:
            'Plan 工作状态与 Goal 状态一起随会话保存并在进程重启后恢复（1.0.14 修过 “Fixed goal and plan state not restoring correctly after process restart”，`/goal status` 的字段里也有 `planWasActive`）；会话内对 Plan 的批准可记为会话级放行（1.1.13 修过 “Fixed session-level approval of plan mode not persisting”）。官方没有公开计划文件路径，只能从 0.2.3 的 “Fixed Plan mode requiring permission to read plan files” 确认存在计划文件，路径与保留期限记为未确认。',
          noninteractive:
            'Headless 中 `ask` 自动转为 `deny`；1.0.35 修过 “Fixed Plan and Ask tools not being correctly disabled in headless mode”，即 headless 下 Plan 工具应被禁用；SDK 可把审批请求交给 `canUseTool`，ACP 通过 `requestPermission` 交给 IDE。Plan 计划在 headless 或 SDK 宿主下的具体批准路径官方没有逐项公开，记为未确认。',
          conditions:
            '`auto` 模式下分类器熔断是唯一由权限裁决产生授权提示的情况，而“需要用户输入的工具（如 AskUserQuestion）与进入或离开 Plan”始终请求确认，官方明确 “None of these are outcomes of a permission verdict”，因此 Plan 的确认与分类器裁决是两条路径；这条口径经过反复：1.0.12 让 YOLO 下 EnterPlanMode/ExitPlanMode 不弹窗、1.1.11 让 auto/yolo 下进出 Plan 不再弹权限窗、1.1.21（August 13, 2026）又 “Restored the confirmation dialog when entering and exiting Plan mode under auto and yolo modes”，此后至最新条目 CLI 1.1.80（October 27, 2026）没有新的 Plan 条目；未信任目录会强制回退 `default` 权限模式，`general.plan.enabled: false` 一次性关掉命令、启动参数映射与两个工具；1.0.33 起 Plan 支持只读 Shell 命令，0.2.15 起批准计划时可直接选 auto 模式，1.0.14 起 ExitPlanMode 提供 “start goal execution” 选项，1.0.39 优化过退出选项；官方没有公开 Plan 状态下被阻断的工具清单，记为未确认。',
          sources: [
            'qoder-permissions-plan',
            'qoder-slash-plan',
            'qoder-release-notes-plan',
            'qoder-permissions',
            'qoder-commands',
          ],
        },
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
        '四家都为连续拒绝设熔断，但阈值与回退形式各不相同：Claude Code 连续 3 次或累计 20 次阻断后暂停 auto 并回退询问（官方明写阈值不可配置）；Codex 同一 turn 内连续 3 次或最近 50 次审查的滚动窗口内 10 次拒绝即中断该 turn，源码里另有一组阈值为 1 与 1 的 Cyber 变体；Qwen Code 连续 3 次阻断、连续 2 次不可用或会话累计 20 次拒绝后只把当次调用降级为人工审批、会话仍留在 Auto；Qoder CLI 连续阻断达到上限后让下一个动作变成授权提示，官方没有公布数值上限。',
        '裁决用哪个模型只有 Qwen Code 给了用户可改的入口，官方逐字为 “The classifier uses your configured fast model (`/model --fast`). If no fast model is configured, the main session model is used instead.”；Claude Code 默认用 Claude Sonnet 5 而不是 `/model` 选的模型，v2.1.302 起 `CLAUDE_CODE_AUTO_MODE_MODEL` 可指定客户端分类器模型；Codex 的审查模型取自 `ModelInfo` 的 `auto_review_model_override`（后端 `/models` 接口返回的模型元数据）与 Provider 首选审查模型，配置参考里没有选审查模型的键；Qoder CLI 官方只在 1.1.63 发布说明里写 “Approval requests in Auto permission mode now follow the BYOK model”，文档不点名模型也没有对应配置键；Kimi Code 无分类器。',
        'Qwen Code 与 Qoder CLI 都把裁决拆成两阶段来压低延迟：Qwen 的 Stage 1 快通道只输出 `{ shouldBlock }`（约 300 毫秒），只有 Stage 1 判阻断时才跑 Stage 2 思考审查，后者可以把阻断降级为放行并产出用户可见的 `reason`；Qoder 官方写第一阶段是只能放行的快速通道、未放行的动作交给唯一能判定阻断的第二阶段，因此不同工具调用的裁决延迟不同。Claude Code 与 Codex 的官方文档没有公布同类分阶段结构。',
        '只有 Claude Code 把分类器的执行位置分成客户端与服务端两条路径并公布计费差异：服务端审查作为会话自身模型请求的一部分完成、官方写 “at no charge”，`CLAUDE_CODE_AUTO_MODE_SERVER=0` 或网关丢掉审查字段时回退到 Claude Code 自己发的 classifier 请求，这些请求 “count toward your token usage”。',
      ],
      behavior: {
        claude:
          'auto 模式由独立 classifier 模型在动作执行前审查，阻断超出当前请求、指向未知基础设施或疑似受所读敌意内容驱动的操作。每个动作走固定决策顺序、第一条命中即定案：先由 `permissions` 的 allow/ask/deny 规则立即裁决（例外是写受保护路径、指向关键路径的 `rm`/`rmdir`、标了 `requiresUserInteraction` 的 MCP 工具、组织设为 `ask` 的 connector 工具、带每命令允许域名的 shell 命令、按命令内容匹配的 ask 规则、符号链接解析到受保护路径的写入与网络路径读取），再自动放行只读动作与工作目录内文件编辑（服务端审查会话里只读与沙箱内 shell 命令要等审查结果、被标记即阻断；工作目录外第一次读取、符号链接解析到目录外的写入与网络路径读取都改为询问），其余动作全部交给 classifier。在 Claude Code 自己发出的 classifier 请求里，classifier 看到用户消息、除只读查找外的工具调用与 CLAUDE.md 内容，工具结果被剥离，以免文件或网页里的敌意内容直接操纵它；另有独立的服务端探针扫描进来的工具结果并在 Claude 读到之前标记可疑内容。classifier 还在三个时点审查 Subagent：启动前评估被委派的任务描述、运行中每个动作走与父会话相同的决策顺序（frontmatter 里的 `permissionMode` 被忽略）、结束后连同最终报告一起审查，报告被标记或独立 API 安全检查拒了这次审查时报告仍然送达但前置安全警告，classifier 不可用时报告附一条「先核实 Subagent 的工作再据此行动」的提示。每条经 `SendMessage` 发给其他 Agent 的消息（纯文本或结构化 agent team 消息）也在投递前被审查，auto 模式与「classifier 正在审查命令」的 Plan 模式下都审，需 v2.1.222 及以上。被拒动作进入 `/permissions` 的 Recently denied 页签，按 `r` 标记重试、退出对话框后 Claude Code 发一条允许重试该工具调用的消息并继续对话；classifier 给不出裁决（与 auto 模式无关的独立安全检查拒了 classifier 自己的请求，或它的响应解析不出来）时动作被拒绝且不记入 Recently denied。屏幕上另两处报告拒绝的地方都不带命令或 URL：输入框附近的通知形如 `bash denied by auto mode · [Data Exfiltration] · /permissions`，Recently denied 页签用 Claude 写的描述列出 shell 命令；要程序化拿到确切输入需加 `PermissionDenied` Hook，它以 `tool_input` 收到。方括号里的文字是 classifier 命中的规则名，全句措辞可用 `claude auto-mode defaults --label` 查。',
        codex:
          '审查代理代替用户裁决沙箱边界审批请求：请求提升权限的 shell/exec 调用、被阻断的网络请求、`request_permissions` 提示、有副作用的 app/MCP 工具调用和 Computer Use 新域名访问。沙箱内已允许的动作不经过审查；Computer Use 的 app 层审批仍直接询问用户。审查者只看到精简 transcript 与审批请求本身，不含隐藏推理；拒绝时指示主 Agent 改走实质更安全的路径或停下询问用户，不得用变通方式规避。',
        qwen:
          'LLM 分类器逐条评估 shell 命令、网络调用与工作区外编辑，自动放行其判断安全的操作、阻断高风险操作。裁决分两阶段：Stage 1（fast）只输出 `{ shouldBlock }`、约 300 毫秒，为 `false` 时动作直接放行；Stage 2（thinking）只在 Stage 1 判阻断时运行，用思维链复核以降低 Stage 1 的误报、可以把 Stage 1 的阻断降级为放行，并产出用户可见的 `reason`。官方给的延迟量级是一次 `run_shell_command` 走快通道约 300 毫秒、走带思考复核的慢通道约 3 至 5 秒。多数只读操作和工作区内编辑跳过分类器。文档列出的放行示例包括只读命令、工作目录内的包安装与构建测试、工作区内编辑；阻断示例包括 `rm -rf /`、`fdisk`、`mkfs` 等不可逆破坏，`curl | sh` 等外部代码执行、凭据外泄、`.bashrc`/`crontab` 等未授权持久化、安全削弱与向 main/master 强制推送。',
        kimi:
          '官方交互文档没有分类器或审查代理机制：副作用工具调用弹出审批面板由用户确认；`/yolo` 自动批准普通工具调用但敏感文件与退出 Plan 仍可询问；`/auto` 自动处理全部审批且 Agent 不再提问，属于全部放行而非基于操作内容的安全评估。',
        qoder:
          '`auto` 模式零确认提示：官方模式表把 `auto` 的行为写成 “Authorization is decided by the agent.”，与 `bypass_permissions`（“Skips approval prompts.”）和 `dont_ask`（“Never prompts. Any action that would normally ask is denied instead.”）并列。分类器分两阶段，官方逐字为 “The classifier runs in two stages. The first stage is a fast pass that can only approve; actions it does not approve are submitted to the second stage, which is the only stage that can conclude an action must be blocked. Adjudication latency therefore differs between tool calls.”。三类动作不经分类器裁决：只读工具（文件读取、搜索、glob）按工具名放行且不评估目标路径，因此工作目录外的路径也一并放行；工作目录内以及用 `/add-dir` 加进来的目录内的写入与编辑直接放行；其余动作全部提交分类器，包括写到这些目录之外。危险 shell 命令与受保护路径直接拒绝。`autoMode.allow`、`autoMode.soft_deny`、`autoMode.environment` 以自然语言注入分类器提示，官方明写 “These rules are **soft guidance** — injected into the classifier prompt as reference; the final decision is still made by the AI classifier.”。用户级 `AGENTS.md` 也被注入分类器上下文，作为「本次会话被要求做什么」的证据，只读用户级那一份，且其内容只描述意图、不构成授权——与安全规则冲突时它所看似认可的动作仍被阻断。',
      },
      overrides: {
        claude: {
          entry:
            '`Shift+Tab` 循环切换到 `auto`（任何设置文件把 `disableAutoMode` 设为 `"disable"` 时从循环里移除）；`--permission-mode auto` 也适用于 `-p`；`permissions.defaultMode` 可设为 `"auto"`。分类器规则用 `/permissions` 的 **Auto mode** 页签编辑（需 v2.1.246 及以上、只在该会话能用 auto 模式时出现，Managed settings 与 `--settings` 来源显示为只读、改动一律存进 `~/.claude/settings.json`），或直接改 `autoMode` 设置块。`/auto-mode-setup` 让 Claude Code 从项目与近期会话起草 `autoMode.environment`（有时连规则条目一起），接受后写进 `~/.claude/settings.json`；需 Pro/Max/Team 计划与 v2.1.228 及以上、原生 Windows 需 v2.1.233 及以上，云会话里不能运行，还需要 feature-flag fetching。auto 模式已阻断若干动作而用户仍没有 `autoMode.environment` 条目时，回合结束会弹 “Teach auto mode about your environment?” 对话框提议代跑 `/auto-mode-setup`，选 **Don’t show again** 只停提议、保留命令，`skillOverrides` 里写 `"auto-mode-setup": "off"` 同时关掉命令与提议（它是内置命令而不是 bundled skill，所以 `disableBundledSkills` 关不掉它）。Shell 侧 `claude auto-mode defaults`（`--label` 前缀匹配需 v2.1.208 及以上）打印内置四张规则表、`claude auto-mode config` 打印套用用户设置后的生效配置、`claude auto-mode critique` 点评自定义条目是否含糊、冗余或容易误报、`claude auto-mode reset` 删除用户设置里的 `autoMode` 节（需 v2.1.212 及以上，先摘要并问 “Reset auto mode configuration to defaults?”，`--yes` 跳过确认）。`/status` 的 **Auto mode server** 行在服务端审查决定本会话动作时读 `Enabled`、回退之后读 `Disabled`。',
          defaults:
            'v2.1.283 及以上，交互终端与 VS Code 会话在全部计划、全部 Provider 上都以 `auto` 为内置起始权限模式；更早版本只在 Pro、Max、Team 计划上如此。该内置默认在 macOS、Linux 与 WSL 上需 v2.1.228 及以上、原生 Windows 上需 v2.1.233 及以上，更早版本的内置默认是 Manual。`claude -p` 与 Agent SDK 在会 fetch feature flag 的会话里起始为 `default`；官方权限模式页的表格写不会 fetch 的会话（例如第三方 Provider 或关掉遥测）在 v2.1.285 及以上起始为 `auto`、更早版本起始为 `default`，但 v2.1.302 更新日志把这一档改成 “start in `default` mode on third-party providers, with telemetry off or on a fresh install”，只有 `--permission-mode auto` 才用 auto，文档表格在核对日期尚未同步。组织策略没有下发 `auto` 默认、或组织套用了 HIPAA 配置且会话符合条件时，起始模式都是 `default`（后者需 v2.1.285 及以上，auto 仍可手动切过去）。VS Code 的 `claudeCode.initialPermissionMode` 不接受 `auto`，要在 Auto 起始就得留空该设置再从模式指示器里选一次 **Auto**。分类器默认跑 Claude Sonnet 5，而不是 `/model` 选的模型。',
          rules:
            '分类器内部四层优先级、先命中先生效：`autoMode.hard_deny` 无条件阻断，用户意图与 `allow` 例外都不适用；`autoMode.soft_deny` 次之，可被用户意图与 `allow` 例外覆盖；`autoMode.allow` 作为匹配 `soft_deny` 规则的例外；最后是显式用户意图——用户消息直接且具体描述了 Claude 正要执行的动作时，即使命中 `soft_deny` 也放行。四张表都是自然语言散文条目而不是正则或工具模式，分类器按自然语言规则读。数组里写字面量 `"$defaults"` 就把内置规则拼在该位置，自定义规则可以放前也可以放后并继续跟随版本更新；`environment`、`allow`、`soft_deny`、`hard_deny` 任一节不设 `"$defaults"` 即整节替换掉内置列表。`autoMode.environment` 告诉分类器哪些仓库、桶与域名可信，分类器用它判断「外部」是什么意思，未列出的目的地都算潜在外泄目标；默认只信工作目录与当前仓库配置的 remote，其余每个信任槽默认 `None configured`。要按工具模式做硬阻断得用 `permissions.deny`（在分类器之前生效、分类器与用户意图都不能覆盖），按命令内容匹配的 `permissions.ask` 规则同样先于分类器强制弹审批。`autoMode.classifyAllShell: true` 在 auto 模式期间挂起全部 Bash 与 PowerShell allow 规则、让每条 shell 命令都过分类器（关键路径删除除外），代价是延迟与每条命令一次分类器调用，且只在 auto 模式期间生效、其他模式下 allow 规则照常。`useAutoModeDuringPlan` 默认开启，Plan 模式下 shell 命令（关键路径删除除外）由分类器审查而不是弹审批，批准的执行、拒绝的阻断；auto 模式不可用或该键关闭时，内置只读集合之外的命令弹审批。交互终端且 bypassPermissions 可用的会话里，planning 命令既不过分类器也不弹审批。分类器读的是 Claude 自己加载的同一份 CLAUDE.md，因此项目 CLAUDE.md 里写 “never force push” 会同时约束 Claude 与分类器；分类器还把对话中声明的边界当作阻断信号，但压缩掉声明该边界的消息后边界可能丢失。v2.1.198 起对同一主机和端口复用网络判定。',
          boundary:
            'auto 模式不取代沙箱，分类器是跑在 permissions 系统之后的第二道闸门；对无论用户意图或分类器配置都不能执行的动作，官方要求用 Managed settings 里的 `permissions.deny`。标了 `_meta["anthropic/requiresUserInteraction"]` 的 MCP 工具与组织设为 `ask` 的 connector 工具跳过分类器直接询问用户，两者都不会被自动放行。服务端审查开启的会话里，只读动作与沙箱内 shell 命令也要等审查结果、被标记即阻断。Remote Control 本机会话可从 App 里选 Manual、Accept edits、Plan 与自己启动的会话的 Auto，但选不到 Bypass permissions，且运行该会话的本机必须用 claude.ai 账号登录、不支持 API Key；云会话提供的权限模式又是另一套。',
          persistence:
            '模式选择作用于当前会话。`permissions.defaultMode` 可写入用户或 Managed Settings；在 `.claude/settings.json` 或 `.claude/settings.local.json` 里写 `"auto"` 不生效，Claude Code 转而使用内置默认（连 `~/.claude/settings.json` 里的 `defaultMode` 也不用），官方建议把它移到 `~/.claude/settings.json`。`autoMode` 只从三个作用域读取：单机开发者的 `~/.claude/settings.json`、组织范围的 Managed settings、`--settings` 旗标或 Agent SDK 的内联 JSON；分类器不读项目设置里的 `autoMode`，官方给的理由是这两个文件都在仓库目录里，签入的仓库或构建步骤可能注入自己的 allow 规则。各作用域条目合并，开发者可以给四张表加个人条目但删不掉 Managed settings 提供的条目；又因为 `allow` 在分类器内部是 soft block 的例外，开发者加的 `allow` 能覆盖组织的 `soft_deny`——这种组合是叠加的，不是硬策略边界。`/auto-mode-setup` 接受的草稿整体接受或整体丢弃（要改单条得事后编辑 `~/.claude/settings.json`），写入时 `environment` 列表不带 `"$defaults"`（草稿已把它没改的内置条目写全）、它新增条目的 `allow`/`soft_deny`/`hard_deny` 列表带 `"$defaults"`（除非用户本来就写了不带它的 `allow` 列表），保存后还提议删掉 `~/.claude/settings.json` 里 auto 模式会忽略的 `permissions.allow` 规则（如 `Bash(*)`）或会自动放行破坏性命令的规则。`claude auto-mode reset` 只改 `~/.claude/settings.json`，Managed settings 与 `--settings` 的 `autoMode` 规则仍然生效。累计阻断计数器在会话内保留，只在它自己的上限触发回退时重置。',
          noninteractive:
            '`claude -p --permission-mode auto` 可用，`autoMode` 也能经 `--settings` 或 Agent SDK 内联 JSON 按次覆盖。没有 `--permission-prompt-tool` 的 `-p` 运行没有可回退的审批界面：连续阻断达到阈值时该动作不执行、Claude 继续工作，Claude Code 不中止运行。计费提示在等不到回答的场合只打印同一段文字并让会话继续留在 auto 模式（本机 24 小时内已确认过被点名的网关则不再出现）：`-p` 把它写到 stderr，`stream-json` 输出发一条 `system` warning 消息供 Agent SDK 从消息流里读。服务端审查在 `-p`、Agent SDK、VS Code 扩展与桌面端会话里需 v2.1.281 及以上。',
          conditions:
            '计划维度为「All plans」；Team 与 Enterprise 上 auto 模式默认开启，管理员可在 Managed settings 里把它关掉——官方权限模式页在组织条目里写 `permissions.disableAutoMode`、在操作说明里写 `disableAutoMode`，官方设置参考把它列为顶层键 `disableAutoMode`（描述 “Remove auto mode from the permission mode cycle”，作用域 Any file），两种拼写在核对日期并存。关掉后 `auto` 从 `Shift+Tab` 循环移除，用 `--permission-mode auto` 启动的会话改为在 Manual 起始。模型要求：Anthropic API 与 Claude Platform on AWS 上 Claude Opus 4.6 及以上、Sonnet 4.6 及以上、Haiku 5.5 或 Fable 模型；Amazon Bedrock、Google Cloud’s Agent Platform、Microsoft Foundry 与已登录的 Claude apps gateway 会话上只有 Claude Sonnet 5 及以上、Opus 4.7 及以上、Haiku 5.5 与 Fable 模型，这几家用 Haiku 5.5 需 v2.1.293 及以上；Sonnet 4.5、Opus 4.5、Haiku 4.5 与 claude-3 系列在任何 Provider 上都不支持。Anthropic 也可能在服务端关掉 auto 模式或为本账号拒绝它，收到这两种答复的会话直到会话结束都保持 auto 关闭。分类器模型解析：默认 Claude Sonnet 5，Anthropic 服务端配置的分类器模型优先于该默认；会话模型是 Claude Sonnet 4.6、或 `availableModels` 排除 Sonnet 5 时改用会话模型，会话跑 Fable 模型时改用某个 Opus 模型；非 Anthropic API 的 Provider 上该 Opus 回退取 `ANTHROPIC_DEFAULT_OPUS_MODEL`、没设则为 Opus 5，且不查允许清单。会话第一次 auto 模式请求会校验 Sonnet 5 默认值：请求成功则 Sonnet 5 留作本会话分类器模型，因模型不可用而失败则本会话改用回退模型；官方模型配置页另写分类器的 Sonnet 5 默认只在允许清单放行 Sonnet 5 时适用。v2.1.302（2026-10-16 发布）起 `CLAUDE_CODE_AUTO_MODE_MODEL` 可指定客户端分类器所用模型，更新日志逐字为 “Added `CLAUDE_CODE_AUTO_MODE_MODEL` to choose the model the client-side auto mode classifier uses; it does not change the model for server-side auto mode”；核对日期该变量没有出现在官方环境变量页、权限模式页、Configure auto mode 页、模型配置页与设置参考页，因此它的取值范围（是否接受 `opus`、`sonnet` 一类别名）、与 Sonnet 5 默认值及服务端配置模型之间的优先级、是否受 `availableModels` 约束、以及最低版本要求都记为未确认。`CLAUDE_CODE_ENABLE_AUTO_MODE` 官方现在写 “Accepted for compatibility with older releases and has no effect”，v2.1.158 至 v2.1.206 期间需要设为 `1` 才能在 Bedrock、Google Cloud’s Agent Platform、Microsoft Foundry 与已登录 Claude apps gateway 会话上用 auto 模式。熔断阈值不可配置：分类器连续阻断 3 次或累计 20 次即暂停 auto 模式并回退询问，批准被询问的动作后恢复 auto；与 auto 模式无关的独立安全检查拒掉分类器自己的请求时不计入这两个阈值，累计计数器只在自身上限触发回退时重置。服务端审查另有一条：连续 10 次响应都没有裁决就结束当前回合。服务端审查的适用范围按连接类型分档——直连 Anthropic API 时，交互终端会话在 Pro、Max、Team 上需 v2.1.271 及以上、在 Enterprise 与 Claude API 账号上需 v2.1.278 及以上，`-p`、Agent SDK、VS Code 扩展与桌面端会话需 v2.1.281 及以上，v2.1.282 起不 fetch feature flag 的会话（例如关掉遥测）在任何会话类型里都默认问服务端；Claude Platform on AWS、Amazon Bedrock、Google Cloud’s Agent Platform、Microsoft Foundry 以及把 `ANTHROPIC_BASE_URL` 指向 LLM 网关或代理时，默认问服务端需 v2.1.278 及以上；已登录的 Claude apps gateway 会话需 v2.1.280 及以上。`CLAUDE_CODE_AUTO_MODE_SERVER=0` 强制只用 Claude Code 自己的 classifier 请求（直连 Anthropic API 时该变量需 v2.1.281 及以上），设 `1` 可在尚未开启服务端审查的会话里打开它，除非同时设了 `CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS=1`；只设 `CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS=1` 而 `CLAUDE_CODE_AUTO_MODE_SERVER` 未设时同样不再问服务端。官方计费页逐字写 “`CLAUDE_CODE_AUTO_MODE_SERVER` is a temporary setting and may be removed in a later release.”。计费边界：服务端审查作为会话自身模型请求的一部分完成、不额外收费，回退到 Claude Code 自己发的 classifier 请求时这些请求计入 token 用量，Pro、Max 与 Team 计划从不弹这条提示；提示会扣住第一个将被这样检查的动作等用户回答，`Enter` 继续（点名了网关时本机 24 小时内不再出现）、`Esc` 或 `Ctrl+C` 取消（被扣住的动作不执行、当前回合停止、会话仍在 auto 模式、什么都不记住）。v2.1.302 起服务端分类器遇到长到做不了安全检查的对话改为先压缩，而不是把每个受检工具调用都拒掉。遥测：v2.1.301 给 OpenTelemetry `tool_decision` 事件加了 `classifier_verdict` 与 `permission_mode`（更新日志逐字为 “so auto mode classifier decisions can be told apart from permission rules”）以及 `OTEL_LOG_TOOL_DETAILS=1` 下的 `classifier_category`（命名分类器命中的内置规则），v2.1.302 修复了多数 auto 模式分类器阻断缺 `classifier_category`、以及 `OTEL_LOGRECORD_ATTRIBUTE_COUNT_LIMIT` 偏低时新属性把 `tool_use_id`、`tool_source` 与 `tool_parameters` 挤掉的问题；官方 Monitoring usage 页的 `tool_decision` 属性表在核对日期仍只列 `tool_name`、`tool_use_id`、`decision`、`tool_source`、`source` 的六个取值与 `OTEL_LOG_TOOL_DETAILS=1` 下的 `tool_parameters`，没有这三个新属性，`source` 为 `"config"` 时也明确写 “The event doesn’t indicate which of these sources matched.”。',
          sources: [
            'claude-permissions',
            'claude-permission-modes',
            'claude-auto-mode-config',
            'claude-auto-mode-billing',
            'claude-env-vars',
            'claude-model-config',
            'claude-settings-reference',
            'claude-monitoring-usage',
            'claude-v21302-auto-mode-model-changelog',
            'claude-v21302-release',
            'claude-v21301-classifier-telemetry-changelog',
          ],
        },
        codex: {
          entry:
            '`config.toml` 设 `approvals_reviewer = "auto_review"`；`--approve-for-me` 用于交互式与 `exec` 命令（搭配 `approval_policy = "on-request"` 与 `workspace-write` 沙箱，并传播到 root、`exec`、`resume`、`fork` 参数处理）；TUI 用 `/approve` 对近期 auto-review 拒绝单项重试一次。',
          defaults:
            '`approvals_reviewer` 默认 `"user"`，取值只有 `user` 与 `auto_review`，官方配置参考逐字为 “Who reviews eligible approval prompts under `on-request` or granular approval policies. Defaults to `user`; `auto_review` uses the reviewer subagent. This setting doesn’t change sandboxing or review actions already allowed inside the sandbox.”；只有 `on-request` 或 granular 这类会产生交互审批的策略下 auto-review 才有可审查对象，`never` 下没有。',
          rules:
            '默认审查策略检查数据外泄、凭据探测、持久性安全削弱与破坏性动作；低/中风险按策略放行，critical 拒绝，高风险需要足够用户授权且无匹配 deny 规则。本地 `[auto_review].policy` 逐字为 “Local Markdown policy instructions for automatic review. Managed `guardian_policy_config` takes precedence. Blank values are ignored.”，`[auto_review].extra_policy` 逐字为 “Additional local Markdown policy for automatic review, included alongside the main policy. Managed `guardian_extra_policy` takes precedence. Blank values are ignored.”，即企业策略优先于本地策略且两者都是替换而非合并。按 app 配置的两个键都在配置参考里：`apps._default.approvals_reviewer` 逐字为 “Default reviewer for app tool approval prompts unless overridden per app. When omitted, apps inherit the top-level `approvals_reviewer` value.”，`apps.<id>.approvals_reviewer` 逐字为 “Reviewer for this app\'s tool approval prompts. Overrides `apps._default.approvals_reviewer`.”；`allowed_approvals_reviewers` 不是 `config.toml` 键，只作为 Local computer access with Work Cloud 的 Agent Security 要求出现。审查用哪个模型没有配置键：配置参考里不存在 `guardian_model`、`auto_review.model` 或 `reviewer_model`，唯一的 `review_model` 逐字为 “Optional model override used by `/review` (defaults to the current session model)”、服务的是 `/review` 命令而不是审批审查代理。源码层面 `codex-rs/ext/guardian-reviewer/src/model.rs`（rust-v0.163.0）的 `select_review_model` 先取 `parent_model.auto_review_model_override`、没有就用 `default_review_model_id`（同标签的 `codex-rs/core/src/guardian/reviewer_config.rs` 里逐字为 `let default_review_model_id = turn.provider.approval_review_preferred_model();`，该方法自身的定义本次没有定位到），在模型目录里找到该 id 就用它、找不到则回退父会话模型（`model_override.unwrap_or(parent_model.slug)`），两条分支都在模型支持时把推理强度压到 `ReasoningEffort::Low`，函数上方注释逐字为 “Prefers the review model and low effort when advertised; preserves the parent fallback.”；`auto_review_model_override` 是 `ModelInfo` 的字段，官方注明它属于 “Model metadata returned by the Codex backend `/models` endpoint”，因此用户无法用配置指定审查模型。',
          boundary:
            'auto-review 是审查者替换而非权限放大：不扩大 `writable_roots`、不启用网络、不削弱受保护路径。Prompt 构建、审查会话与解析失败均失败关闭；超时单独呈现但动作同样不执行。',
          persistence:
            '`approvals_reviewer` 写入 `~/.codex/config.toml` 或受信任项目的 `.codex/config.toml`；企业策略写入 managed requirements。TUI 每任务最多记录 10 条近期拒绝，供 `/approve` 重试。',
          noninteractive:
            '`codex exec --approve-for-me` 让非交互流程中的审批走自动审查；审查失败失败关闭，动作不执行并把结果返回 Agent。',
          conditions:
            '`--approve-for-me` 随 rust-v0.147.0（2026-08-07 发布）引入，发布说明逐字为 “Enable automatically reviewed approvals with the new `--approve-for-me` CLI flag. (#36373)”。熔断常量在 `codex-rs/ext/guardian-reviewer/src/circuit_breaker.rs`（rust-v0.163.0，标签指向提交 `83086188ae0614bd882818ff1aa23f3194962012`）里逐字为 `MAX_CONSECUTIVE_GUARDIAN_DENIALS_PER_TURN: u32 = 3`、`MAX_RECENT_AUTO_REVIEW_DENIALS_PER_TURN: u32 = 10`、`pub(crate) const AUTO_REVIEW_DENIAL_WINDOW_SIZE: usize = 50`，同一文件另有一组 Cyber 变体 `MAX_CONSECUTIVE_CYBER_GUARDIAN_DENIALS_PER_TURN: u32 = 1` 与 `MAX_RECENT_CYBER_AUTO_REVIEW_DENIALS_PER_TURN: u32 = 1`，即同一 turn 内连续 3 次拒绝或最近 50 次审查的滚动窗口内 10 次拒绝会中断当前 turn，Cyber 类拒绝各只需 1 次；文件头注释为 “Counts policy denials per turn; the host carries out any requested interruption.”。审查使用额外模型调用并计入用量；ChatGPT 桌面 App 以 Reviewing、Approved、Denied、Aborted、Timed out 状态展示审查项。`approval_policy = "never"`、`danger-full-access` 或 `--yolo` 下不产生可审查的审批请求。发布状态：rust-v0.163.0（2026-10-15T21:30:38Z）的发布说明没有面向用户的 approvals reviewer 功能或旗标变化，与 Guardian 相关的都是内部 PR，唯一相邻的可见条目是 “Resuming a saved thread restores its permissions and network approvals, while respecting explicit overrides and current managed policy.”（属会话恢复对权限状态的还原，本次未展开核对）；rust-v0.164.0-alpha.1 至 alpha.3（2026-10-16 与 2026-10-17）的发布说明正文只有 “Release 0.164.0-alpha.N” 一行占位，逐提交比对里与 Guardian 相关的三条（`4d82d36ccf07` 默认把 Guardian v2 异步分类改为 conversation mode、`2b2d7923055f` 在审查上下文变化时刷新 Guardian 审查、`c3733756a969` 在交互式 CLI resume 期间拒绝 Guardian 审查线程）都不改 `approvals_reviewer`、`--approve-for-me` 或 `/approve`，且该比对结果被截断因而不是穷举。官方文档没有点名审查代理使用的模型。',
          sources: [
            'codex-approvals',
            'codex-auto-review',
            'codex-config-reference',
            'codex-approve-for-me',
            'codex-approve-for-me-commit',
            'codex-guardian-circuit-breaker',
            'codex-guardian-review-model',
          ],
        },
        qwen: {
          entry:
            '`/approval-mode auto` 或 `Shift+Tab` 循环（顺序 plan → default → auto-edit → auto → yolo）；CLI 可传 `--approval-mode`；`tools.approvalMode` 持久化模式。',
          defaults:
            '文档 Quick Reference 称 Auto 为“default out-of-the-box experience”，另一处写初始模式为 Ask Permissions，两处表述并存；`tools.approvalMode` 可写入 `auto`。裁决用哪个模型跟随既有模型配置，官方逐字为 “The classifier uses your configured fast model (`/model --fast`). If no fast model is configured, the main session model is used instead.”，同页并写 “Auto Mode reuses your existing model configuration — same endpoint as the main agent.” 与 “If you’ve configured Qwen Code to use a self-hosted model, the classifier runs against that endpoint too.”；没有专门选分类器模型的键，也没有调阈值的键。',
          rules:
            '`permissions.autoMode` 下有三个提示类别加一个环境列表：`hints.allow` 是分类器应当自动放行的动作，`hints.softDeny` 是「破坏性或不可逆、除非用户最近一次显式请求正好要求该动作与该范围」才阻断的动作，`hints.hardDeny` 逐字为 “security-boundary actions the classifier must block in Auto Mode regardless of `autoMode.hints.allow` or recent user intent”；`hints.deny` 仍被接受以向后兼容并按 `softDeny` 处理，两者混写时条目拼接且 `softDeny` 在前。每条上限 200 字符（超长按截断处理并给警告），`hints.allow`、`hints.softDeny`、`hints.hardDeny` 各至多 50 条，`environment` 至多 20 条。`classifyAllShell` 设为 `true` 时强制每条 shell 命令（含只读命令）都过分类器，官方注明它只影响 shell 命令即 `run_shell_command` 与 `monitor`。分类器跑在与主模型不同的 Provider 上时可设 `permissions.autoMode.mcp.forwardArguments: false` 让分类器只看到工具名，代价是多数 MCP 调用被保守阻断；MCP 工具参数投影的预算为每个字符串值或键截到 2,000 字符、名字截到 200 字符、整个载荷按分类器收到的 pretty-print 形式共享 16,000 字符预算，transcript 里的历史动作每条截到 4,000 字符、合计 40,000 字符（保留最新的，较旧的只留工具名）。',
          boundary:
            '三道闸门按顺序生效：acceptEdits 快通道让目标路径在工作区内的 Edit/Write 不经分类器直接放行（自修改与持久化路径除外），安全工具白名单让只读与纯元数据的内置工具（Read、Grep、Glob、LS、LSP、TodoWrite、AskUserQuestion 等）按工具名放行，其余才交给分类器。失败关闭，官方逐字为 “If the classifier API is unreachable, times out, exceeds its context window, or returns an invalid response, the current action immediately falls back to manual approval.” 与 “**Fail-closed**: when the classifier API is unreachable, the action is blocked rather than allowed.”，此时确认框推荐 Default Mode 并提供 **Switch to Default Mode and allow once**、Allow once 与 Reject 三个选项，选择切换只影响当前运行会话、不改已保存的设置；分类器不可达时连只读 shell 命令也要人工审批。官方明确写 “**Not offline-capable.** The classifier requires an LLM call.”。进入 Auto 模式时会临时摘掉一批过宽 allow 规则并打印清单——`Bash`/`Bash(*)`/`Bash()`、`Bash(python:*)`/`Bash(node*)`/`Bash(bash*)` 一类解释器通配、任何对 `Agent` 的 allow（含 `Agent(coder)`）与任何对 `Skill` 的 allow（含 `Skill(pdf)`），离开 Auto 模式立即恢复，且 “`settings.json` is never modified.”。',
          persistence:
            '审批模式可经 `/approval-mode <mode> --project`/`--user` 或 `tools.approvalMode` 写入项目或用户 Settings。`permissions.autoMode` 的提示与环境条目按 Settings 作用域保存；进入 Auto 时摘掉过宽 allow 规则只是运行期内存里的动作，不写回 `settings.json`。拒绝计数器是会话内状态，切换 ApprovalMode 时全部重置。',
          noninteractive:
            'Headless 可用 `--approval-mode` 指定模式，文档写 headless 默认行为是 Ask Permissions；auto 模式下分类器裁决照常生效。回退到人工审批的那次调用在非交互 STREAM_JSON 会话里没有可开的对话框，自 2026-10-10 起改为直接拒绝——官方提交说明写「a human-only escalation has no channel in a non-interactive STREAM_JSON session either, so it denies instead of opening a dialog a programmatic host is allowed to approve.」',
          conditions:
            '自动裁决依赖分类器 API 可用；启用目录信任功能时，未信任目录会阻断 Auto-Edit、Auto、YOLO 等高权限路径。阈值在 `packages/core/src/permissions/denialTracking.ts`（v0.25.2，提交 `8a415cb628db88844e0196bdfdcce83b4f88d812`）里逐字为 `AUTO_MODE_DENIAL_LIMITS = { maxConsecutiveBlock: 3, maxConsecutiveUnavailable: 2, maxTotalDenials: 20 }`，`shouldFallback` 的判定顺序是会话累计上限 `total_denial`（`totalBlock + totalUnavailable >= 20`）→ `consecutive_block`（≥3）→ `consecutive_unavailable`（≥2）→ `classifier_blocked_retry`（命中 `pendingManualRetryFingerprint`），累计上限优先于连续上限以防交替触发躲过回退；官方文档只写了连续 3 次阻断与连续 2 次不可用两条，会话累计 20 次这一条只在源码里。回退只降级当次调用、会话仍留在 Auto，用户批准回退调用后两个连续计数器都清零（累计上限触发过时连累计计数也清零），拒绝则刻意不改动计数器。2026-10-10 的提交 `a238b91e7c6fc2b0e36e23436b0e4ced5296617b`（PR #13636 “fix(permissions): escalate repeated destructive-command denials to manual approval”，随 v0.25.2 于 2026-10-15 发布）把破坏性命令的确定性阻断并入同一组计数器，官方文档相应改成 “After **3 consecutive blocks** — classifier policy blocks and deterministic destructive-command blocks both count — the call that reaches the third block falls back to the standard manual-approval prompt.”（此前写作「连续 3 次策略阻断」），同一提交把该升级标为 `requiresHumanDecision` 并在 scheduler 与 ACP session 两条确认路径上都遵守，因而 Hook 的 allow 不能豁免它。v0.25.2、v0.25.2-preview.1、v0.25.3-preview.0 与各 nightly 的发布说明都没有 auto 模式分类器条目，这条改动是随 v0.25.2 的变更列表一起静默发布的；`hints.softDeny` 与 `hints.hardDeny` 不是近期新增，早在提交 `9a99409afb11894f6c7eb456263efc14f0d12e81`（2026-08-30）的文档里就有。',
          status: '官方确认',
          sources: [
            'qwen-approval',
            'qwen-settings',
            'qwen-auto-mode',
            'qwen-denial-tracking',
            'qwen-escalation-commit',
          ],
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
          defaults:
            '默认权限模式为 `default`；`auto` 模式下没有确认提示。`general.defaultPermissionMode` 为 enum、默认 `default`、取值 `default`/`accept_edits`/`plan`/`auto`/`bypass_permissions`/`dont_ask`、改动不需要重启。顶层 `autoMode` 为 object、默认 `{}`、改动不需要重启，官方设置参考逐字为 “Auto mode classifier soft-steering rules (`allow`/`soft_deny`/`environment`). Top-level key, read only from user-level and local configurations.”。分类器用哪个模型官方文档从不点名，只写 “the AI classifier”；发布说明 1.1.63（2026-09-24）逐字为 “Approval requests in Auto permission mode now follow the BYOK model”，即跟随用户配置的 BYOK 模型，且没有任何配置键可以单独选它。官方权限页写 “When no classifier model is available, switching into `auto` mode is refused.”，即拿不到分类器模型时连切进 `auto` 都会被拒绝。',
          rules:
            '`autoMode.allow` 描述分类器倾向放行的操作，`autoMode.soft_deny` 描述倾向拒绝的操作（注意是 snake_case，与 Qwen Code 的 `softDeny` 写法不同，且 Qoder 没有对应的 hardDeny 键），`autoMode.environment` 提供环境上下文；官方逐字为 “These rules are **soft guidance** — injected into the classifier prompt as reference; the final decision is still made by the AI classifier.”。作用域限制逐字为 “For security, `autoMode` configuration is read only from your own global settings. Workspace files are ignored, including the local settings file: any file under the workspace can arrive with a checkout, and a repository able to add classifier `allow` entries could bias auto mode toward approving dangerous actions.”；官方设置参考页把同一个键写成 “read only from user-level and local configurations”，与权限页的「连 local settings 也忽略」相互矛盾，两处在核对日期并存、未由官方统一。用户级 `AGENTS.md` 也注入分类器上下文，官方逐字为 “The user-level `AGENTS.md` is also injected into the classifier context, as evidence of what the session was asked to accomplish. Only the user-level file is read. Its content describes intent and does not constitute authorization: an action it appears to sanction is still blocked when it conflicts with a safety rule.”。',
          boundary:
            '失败关闭：官方逐字为 “When the classifier is unreachable or returns no usable verdict, the action is denied rather than prompted; the message states that this is not a safety verdict on the action, the same action may be retried, and read-only tools are unaffected.”。熔断逐字为 “When consecutive block verdicts reach the limit, the circuit breaker trips: the next action becomes an authorization prompt carrying the limit warning and the most recent block reason. The mode itself remains available, and the count clears once an action is approved.”，并写 “The circuit breaker is the only condition under which a permission verdict produces an authorization prompt in `auto` mode.”；官方没有公布这个数值上限。不经分类器裁决的三类动作见「具体行为」；此外 AskUserQuestion、进入与退出 Plan 以及「会话长到分类器读不完自己的上下文」仍会产生非裁决类的授权提示。`autoMode` 配置只从受信任来源读取，项目 settings 被排除以防恶意提权。',
          persistence:
            '`general.defaultPermissionMode` 随 settings 持久化；`autoMode` 写入用户全局或本地 settings。熔断计数在有一次动作被放行后清零，官方没有写它是否跨会话保留。',
          noninteractive:
            'Headless 可传 `--permission-mode auto`，风险操作由分类器评估或直接拒绝；`dont_ask` 拒绝所有需审批操作，不使用自动审查。SDK 侧对应 `permissionMode: \'auto\'`（TypeScript）与 `permission_mode="auto"`（Python），官方把 `auto` 描述为运行时能力自行判定 allow 或 deny、工作区内安全文件编辑可能被自动放行。分类器不可达时非交互通道同样得到拒绝而不是提示。',
          conditions:
            '非默认权限模式只在受信任目录生效；受保护路径在 `auto` 中直接拒绝。版本时间线取自官方 CLI 发布说明：1.1.40（2026-09-01）“Adjusted permission validation behavior in Auto mode”、1.1.48（2026-09-09）“Improved the experience when a tool permission request is denied”、1.1.56（2026-09-18）“Improved Auto mode: when the auto-approval component is temporarily unavailable, it now falls back to user confirmation and shows the reason”、1.1.62（2026-09-23）“Improved the two-phase review flow of Auto permission mode to speed up reviews”、1.1.63（2026-09-24）“Approval requests in Auto permission mode now follow the BYOK model”；1.1.64（2026-09-25）到最新 1.1.72（2026-10-15）九条发布说明里没有任何 auto 模式、审批、分类器或权限条目，因此本字段自 2026-09-24 起没有新的官方增量。1.1.56 说的「组件临时不可用时回退用户确认」与当前权限页的「不可达或无可用裁决时拒绝而不是提示」表述不一致，按当前文档页记录。官方没有公布熔断的数值上限，也没有公布分类器超时、token 预算、温度或裁决审计日志；`/cli/model`、`/cli/custom-models`、`/cli/working-modes`、`/cli/how-it-works` 与 SDK 权限页都没有说明哪个模型做裁决。Qoder CLI 没有 `/auto` 斜杠命令，`/permissions` 逐字为 “Manage permissions (view and adjust permission rules).”；`--yolo` 与 `--dangerously-skip-permissions` 都等于 `--permission-mode bypass_permissions`，与 `auto` 是不同模式。',
          sources: [
            'qoder-permissions',
            'qoder-settings-reference',
            'qoder-release-notes-auto-mode',
          ],
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
      includes: [
        'OS 或容器隔离',
        '可写根目录',
        '受保护与禁止读取路径',
        'Linux 后端与用户命名空间前置条件',
        '削弱或退出隔离的开关及其代价',
      ],
      excludes: ['只针对文件工具的 Allow/Deny', 'Git Worktree 隔离', '网络访问策略'],
      facts: [
        'Claude Code、Codex 与 Qwen Code 都公开了本地 OS 级文件系统沙箱；三家的 Linux 边界都落在 bubblewrap 上，Qwen 另提供 Landlock 回退。',
        'Codex 官方 Sandboxing 页把 Linux 与 WSL2 的实现写成 bubblewrap（macOS 是 Seatbelt），而不是本仓库此前记录的 Landlock；Landlock 与 seccomp 在 Codex 里是 `codex-linux-sandbox` crate 的实现依赖，`bwrap.rs` 才是构造边界的地方。原生 Windows 另有 `elevated`、`unelevated` 与 `mxc` 三种实现，由 `[windows] sandbox` 选择；`codex sandbox` 是 Stable 子命令，可用同一套策略手动跑一条命令。',
        'Linux 用户命名空间是三家的共同前置条件：Claude Code 与 Codex 都在官方文档里写了 Ubuntu 24.04 及以后的 AppArmor 限制会让 bubblewrap 建不出用户命名空间，并各自给出 profile 文件（Claude 是 `/etc/apparmor.d/bwrap`，Codex 是 `/etc/apparmor.d/bwrap-userns-restrict`）与同一个 sysctl 键 `kernel.apparmor_restrict_unprivileged_userns`；Qwen Code 则直接要求 bwrap 装在 `/usr/bin/bwrap`。',
        '三家都提供削弱或退出文件系统隔离的开关并写明代价：Claude Code 的 `sandbox.enableWeakerNestedSandbox`（改挂容器已有 `/proc`，官方写 “considerably weakens security”）与 v2.1.305 新增的 `sandbox.allowNestedUserNamespaces`（官方更新日志写 “this lets them get around the sandbox\u0027s file protections”）、Codex 的 `danger-full-access`、Qwen Code 的 `filesystem: "workspace-write"` 与 Landlock 后端的 `partial` enforcement。',
        'Qwen Code 自 v0.24.4 起把 Linux 沙箱从「整个 CLI 跑在 bwrap 里」改成「只有工具执行跑在 bwrap 或 Landlock 里」，策略键 `tools.executionSandbox` 由运算符（User 或 System 设置）所有，Workspace 设置即使在受信任项目里也不能启用、关闭或修改它。',
        'Kimi Code 2.3.0 标签的整棵仓库树里没有任何 sandbox、bwrap、landlock、seccomp 或 seatbelt 路径，文件边界仍由 `[permission]` 规则与工具层路径策略提供；Qoder CLI 官方文档在核对日期已无独立 Sandbox 页，`https://docs.qoder.com/en/cli/sandbox` 返回 404，设置参考与 SDK 参考都没有 `sandbox.*` 键，本仓库此前记录的 SDK `sandbox.filesystem` 已无法从官方文档复核。',
      ],
      behavior: {
        claude:
          'Bash 沙箱在 macOS 用 Seatbelt、在 Linux 与 WSL2 用 bubblewrap（另需 `socat` 做网络中继），默认只向工作目录、每用户临时目录以及 `--add-dir`/`/add-dir`/`permissions.additionalDirectories` 加入的目录写入；Read/Edit deny 与 Sandbox 路径合并。官方另写明 Subagent 与父会话同进程、共用同一份沙箱配置，后台会话在自己的进程里按其设置决定是否沙箱化。',
        codex:
          '`read-only` 禁止一般写入，`workspace-write` 只写工作区与附加 writable roots，`danger-full-access` 移除沙箱；`.git`、`.agents`、`.codex` 等路径仍受保护。Linux 与 WSL2 的边界由 bubblewrap 构造：官方写 Codex 用 `PATH` 上找到的第一个 `bwrap`，找不到时退回一个捆绑 helper，而该 helper “requires support for unprivileged user namespace creation”；`codex-rs/linux-sandbox/src/bwrap.rs` 在两处参数构造里都显式加 `--unshare-user`，注释说明一是让容器内的 root 不必持有 ambient `CAP_SYS_ADMIN` 就能建其余命名空间，二是不依赖 bubblewrap 在调用方为 uid 0 时会跳过的自动启用行为，同时借 ptrace 权限检查挡住宿主 procfs 的 root/cwd/fd 链接；同一参数表还有 `--unshare-ipc`、`--cap-drop ALL` 与按选项决定的 `--unshare-pid`、`--unshare-net`、`--proc /proc`。原生 Windows 上再由 `[windows] sandbox` 选实现：`elevated` 用专用低权限沙箱用户加文件系统权限边界，`unelevated` 用当前用户派生的受限 Windows 令牌加 ACL 边界，`mxc` 经 Microsoft MXC `BaseContainerRunner` 直接包裹命令，不改主机 ACL、不创建沙箱用户、不跑安装也不请求提权。MXC 的文件系统权限取自规范化的 Codex 权限 Profile（含受保护元数据豁免），deny glob 沿用既有 Windows 沙箱解析器在启动前展开为具体路径并保持相同的快照语义与扫描上限；Windows 卷根授权不递归，只授卷根与其直接子项，命令运行中新建或新挂载的目录不自动获得授权。',
        qwen:
          '两层彼此独立。其一是 Linux 工具执行沙箱 `tools.executionSandbox`：只有命令及其子进程进边界，CLI 本体、模型传输、认证与会话存储留在宿主；`filesystem: "read-only"` 拒绝工作区写入，`"workspace-write"` 允许在当前规范化工作区内写入，每条命令另有私有 scratch 空间（经 `TMPDIR`/`TMP`/`TEMP` 暴露），普通 `includeDirectories` 不授予写权限；`backend: "auto"` 先试 bwrap，bwrap 不可用且 `network` 为 `open` 时可用内核 Landlock ABI 3 及以上的捆绑 Landlock helper，写 `bwrap` 或 `landlock` 则严格要求该实现。Landlock 后端报 `partial` enforcement：只限制 pathname 读写与目录变更，不创建 PID 或网络命名空间，也不能限制 `chmod`、`chown`、扩展属性与时间戳等全部元数据操作，可写设备面更窄（允许写 `/dev/null`，但不建 bwrap 的私有 `/dev` 与 `/proc`，写 `/dev/full`、`/dev/tty` 与在 `/dev/shm` 建文件被拒）。其二是把整个 CLI 跑进去的旧方法：macOS Seatbelt（`sandbox-exec`，默认 profile `permissive-open`，限制项目目录外写入）与跨平台 Docker/Podman 容器（挂载工作区和 `~/.qwen`）。',
        kimi:
          'Read、Bash 等可用 permission rules 控制，工具也有 enabled/disabled 列表；2.3.0 标签的仓库树里没有任何 OS 或容器级文件系统沙箱实现，文件边界由 `permissionPolicy/policies/` 下的策略与 `tool/path-access.ts` 的路径判定提供，属权限规则层。',
        qoder:
          '主 CLI 提供 Read/Edit 路径规则、受信目录与受保护路径；官方 CLI 文档在核对日期没有公开任何 OS 或容器级文件系统沙箱的配置，SDK 侧只出现退出码 `44` “Fatal sandbox error” 与把 sandboxing 列为互补控制之一的表述。',
      },
      overrides: {
        claude: {
          entry:
            '`/permissions` 管理规则，`Shift+Tab` 切换常用模式；启动参数使用 `--permission-mode`，`/sandbox` 单独配置 Bash 沙箱并在缺少依赖时只显示 Dependencies 页签。`sandbox.enableWeakerNestedSandbox`、`sandbox.allowNestedUserNamespaces` 与 `sandbox.bwrapPath` 都是设置文件键，没有对应的 Slash 命令；Linux 与 WSL2 上还需要先用包管理器装 `bubblewrap` 与 `socat`，Ubuntu 24.04 及以后要按官方提示块放开 AppArmor 对非特权用户命名空间的限制。',
          rules:
            '`permissions.allow`、`ask`、`deny` 按 deny → ask → allow 处理；规则覆盖 Bash、Read、Edit、WebFetch、MCP、Agent 等工具。沙箱侧另有一组「放宽即削弱」的键：官方写明除非 Managed settings 已经设置，开发者的用户设置或 `--settings` 可以打开 `enableWeakerNestedSandbox`、`enableWeakerNetworkIsolation`、`network.allowAllUnixSockets`、`network.allowLocalBinding` 与 `allowAppleEvents`（最后一项仓库设置不能打开），沙箱为 admin-required 时仓库 `.claude/settings.json` 也不能打开；沙箱为 admin-required 时仓库文件里的这四项取 `true` 被忽略而 “A `false` still applies”。组织想禁止就把它们写死为 `false`，或用 `sandbox.filesystem.allowManagedReadPathsOnly`、`sandbox.network.allowManagedDomainsOnly` 把读路径与域名锁到 Managed 值。',
          boundary:
            '权限系统覆盖全部工具；OS 沙箱只覆盖 Bash 及其子进程。沙箱默认只允许向工作目录和会话临时目录写入，并通过代理限制网络域名。嵌套场景有两道不同的口子：非特权容器里 bubblewrap 挂不上新的 `/proc`，命令会以 `Can\u0027t mount proc on /newroot/proc: Operation not permitted` 一类错误失败，`enableWeakerNestedSandbox: true` 改为 bind-mount 容器已有的 `/proc`，代价是把新 `/proc` 挂载本会隐藏的进程信息暴露给沙箱内命令，官方要求只在外层容器已经提供所需隔离边界时使用，并在 Security limitations 一节写明该模式 “considerably weakens security”；`allowNestedUserNamespaces` 则是让沙箱内命令自己创建用户命名空间（官方点名 Chromium 与 rootless podman），更新日志直接写这会让它们绕过沙箱的文件保护。要给整个进程加边界，官方指向 sandbox runtime 或 dev container，而不是这两个键。',
          conditions:
            'OS 沙箱依赖 macOS Seatbelt、Linux bubblewrap 或 WSL2；默认不可用时会警告并回退，`sandbox.failIfUnavailable` 可改为失败关闭，`sandbox.allowUnsandboxedCommands` 决定失败命令能否在沙箱外重试。Linux 与 WSL2 需要 `bubblewrap` 与 `socat`，可选的 seccomp 过滤器用 `npm install -g @anthropic-ai/sandbox-runtime` 安装；`sandbox.bwrapPath`（作用域 Managed）可指向 `PATH` 外的 bubblewrap 二进制。Ubuntu 24.04 及以后（含 WSL2 内）默认 AppArmor 策略会阻止 bubblewrap 创建隔离所需的用户命名空间：`sysctl kernel.apparmor_restrict_unprivileged_userns` 返回 `0` 或报 `No such file or directory` 时跳过，返回 `1` 时要写入 `/etc/apparmor.d/bwrap`，内容为 `abi <abi/4.0>,`、`include <tunables/global>` 与 `profile bwrap /usr/bin/bwrap flags=(unconfined) { userns, include if exists <local/bwrap> }`。`enableWeakerNestedSandbox` 在官方 Sandboxing 页与 Settings 参考索引表都有记录（后者描述为 “Run the Linux sandbox inside an unprivileged container”、作用域 “Any file”）；`allowNestedUserNamespaces` 只出现在 v2.1.305 更新日志（2026-10-20T20:46:50Z 发布，更新日志提交 `49b8c35f8c57493c2f0eba1429ccaa9638ab8712`），核对日期的官方 Sandboxing 页全文没有该词、Settings 参考索引表也没有该行，因此它的取值集合、默认值、可写作用域与是否需要 v2.1.305 及以上都记为未确认；它同 `enableWeakerNestedSandbox` 的关系（一个放行沙箱内建用户命名空间、一个改挂已有 `/proc`）官方也没有说明。核对日期最新 Release 为 v2.1.306（2026-10-21T03:16:31Z），其两条都是修复、没有沙箱条目。',
          sources: [
            'claude-permissions',
            'claude-permission-modes',
            'claude-sandboxing',
            'claude-headless',
            'claude-v21305-nested-userns-changelog',
            'claude-v21305-release',
            'claude-sandbox-weaker-nested',
            'claude-sandbox-apparmor-userns',
            'claude-sandbox-weakening-keys',
            'claude-settings-reference',
          ],
        },
        codex: {
          entry:
            '`/permissions` 与权限选择器控制当前会话；CLI 可传 `--sandbox`、`--ask-for-approval`，持久配置写入 `config.toml`。原生 Windows 沙箱实现由 `config.toml` 的 `[windows] sandbox = "elevated"` 或 `"unelevated"` 选择，TUI 的 `/setup-default-sandbox`（源码描述 “set up elevated agent sandbox”）负责 elevated 安装；`codex sandbox` 子命令（官方标注 Stable，Windows 形式的 `COMMAND...` 说明为 “Command to execute under the native Windows sandbox. Provide the executable after `--`.”）可用 `-P/--permission-profile`、`-C/--cd`、`-c/--config`、`-p/--profile`、`--include-managed-config` 以真实执行相同的策略跑一条命令，MXC 也走同一准备路径。官方 Windows sandbox 页要求用 `/sandbox-add-read-dir C:\\absolute\\directory\\path` 给沙箱授予某个已存在绝对目录的读权限（仅当前会话），但 CLI TUI 的 Slash 命令枚举在 rust-v0.154.0（提交 `6b9826e3aa83`）仍有该命令、自 rust-v0.155.0（提交 `f0a1b8f0849d`）起已无，官方 Slash 命令参考页也未列出，CLI 侧入口记为未确认。Linux 与 WSL2 上没有开关命令，边界取决于 `PATH` 上是否有 `bwrap`。',
          defaults:
            '版本库目录通常采用 `workspace-write` + `on-request`，非版本库目录通常采用 `read-only`；具体启动状态还受目录信任和配置影响。原生 Windows 上 agent 模式默认就用 Windows 沙箱阻止工作目录外写入；未选择模式时 Codex 优先 `elevated`，`elevated` 安装没完成会退回 `unelevated`。MXC 不自动启用：`features.prefer_mxc` 在功能登记册里是 `Stage::UnderDevelopment` 且 `default_enabled: false`，`windows.sandbox = "mxc"` 则是严格选择。',
          rules:
            '`approval_policy` 支持 `untrusted`、`on-request`、`never` 和 granular 分类策略；命令 Rules、MCP 注解、权限 Profile 与沙箱共同生效。企业可用 `requirements.toml` 的 `[windows] allowed_sandbox_implementations = ["elevated"]` 限定允许的原生沙箱实现，写两个值即两者都允许；配置与强制规则冲突时本地客户端回退到兼容值并通知用户。官方 Sandboxing 页把三种模式逐字记为 `read-only`（“The agent can inspect files, but it can\u0027t edit files or run commands without approval.”）、`workspace-write`（“The agent can read files, edit within the workspace, and run routine local commands inside that boundary. This is the default low-friction mode for local work.”）与 `danger-full-access`（“The agent runs without sandbox restrictions.”），并写 “Full access means using `sandbox_mode = "danger-full-access"` together with `approval_policy = "never"`.”。',
          boundary:
            '本地 CLI/IDE 使用 OS 级沙箱，官方逐字为 “Codex uses platform-native enforcement on each OS. The implementation differs between macOS, Linux, WSL2, and native Windows”。`read-only`、`workspace-write`、`danger-full-access` 分别提供只读、工作区写入和无沙箱边界；`sandbox_workspace_write.writable_roots` 可在不移除沙箱的前提下扩展可写目录。macOS 用内置 Seatbelt 且开箱可用；Windows 在 PowerShell 下用原生 Windows 沙箱、在 WSL2 下用 Linux 沙箱实现。原生 Windows 沙箱还做 UI 隔离：官方文档写两种模式默认使用私有桌面，并给出 `windows.sandbox_private_desktop = false` 退回旧的 `Winsta0\\Default`，但固定到的 `WindowsToml` JSON schema 是 `additionalProperties: false` 且只有 `sandbox` 与 `allow_mxc` 两个键，该键的实际可用性记为未确认。MXC 后端另有限制：路径与环境变量值以 Unicode 字符串表示，非 Unicode 值直接失败而不做有损转换；显式为空的子进程环境被拒绝；请求 deny 路径还要求原生 `PSE_SUPPORT_FS_DENY` 能力，否则命令在启动前失败。官方 Sandboxing 页没有讨论「Codex 自己跑在容器里」的嵌套场景，也没有给出 Claude `enableWeakerNestedSandbox` 或 Qwen `partial` enforcement 一类的削弱档位。',
          persistence:
            '用户配置位于 `~/.codex/config.toml`；受信任项目可加载 `.codex/config.toml`、Hooks 和 Rules；系统与管理员 Requirements 可进一步收紧。`[windows]` 表同属 `config.toml`，也可用 `-c key=value` 覆盖。Windows 沙箱的安装与运行诊断写在 `CODEX_HOME/.sandbox/sandbox.log`，官方同时要求不要把 `CODEX_HOME/.sandbox-secrets/` 的内容发给 OpenAI。',
          noninteractive:
            '非交互流程无法展示新审批时，需要审批的动作失败并把错误返回给 Agent；可在启动前固定审批策略、沙箱和 Rules。远程 executor 继承 `config.toml` 里配置的后端，不跟随本机 `features.prefer_mxc` 的解析结果；MXC 下命令失败不触发后端回退，且前台进程退出或取消时上游 runner 会终止其余子孙进程，因此分离式后台服务在 MXC 下失去既有两个 Windows 后端保留子孙进程的行为。',
          conditions:
            '审批决定何时停下来询问，沙箱决定技术边界；`approval_policy = "never"` 不会自动移除仍在生效的沙箱。Linux 与 WSL2 需要 bubblewrap：官方写装发行版的 `bubblewrap` 包更可靠，`bwrap` 缺失或捆绑 helper 建不出所需用户命名空间时 Codex 在启动时给出告警；Ubuntu 24.04 上即使装了 `bubblewrap` 也可能继续告警，官方给的修法是把 `/usr/share/apparmor/extra-profiles/bwrap-userns-restrict` 以 `-m 0644` 安装到 `/etc/apparmor.d/bwrap-userns-restrict` 再 `sudo apparmor_parser -r` 载入（不需要重启，也可 `sudo systemctl reload apparmor.service`），并建议在限制该 AppArmor 设置的发行版上优先加载 profile 而不是全局关闭限制，退路才是 `sudo sysctl -w kernel.apparmor_restrict_unprivileged_userns=0`。原生 Windows 沙箱只在 Windows 上生效：官方推荐 Windows 11，完整更新的 Windows 10 为尽力支持（依赖 ConPTY，实践中需 1809 及以上），更旧的 Windows 10 构建不推荐；`winget` 应可用，`elevated` 依赖管理员批准的安装（本机用户或组创建、防火墙规则修改与沙箱用户登录权限），企业策略可能阻断这些步骤，沙箱内命令报 Windows 错误 `1385` 表示 Windows 拒绝沙箱用户启动命令所需的登录类型，Codex 也会在文件夹对 `Everyone` 可写时告警。MXC 需要可用的 Windows 进程安全环境（PSEC），可用性由 MXC 自身的 create/close 探测判断而不是 OS 构建号或 SDK 的 `platform_support()`，Windows executor 每进程记录一次 `codex.windows_mxc.available`，不支持的 Windows executor 在执行前拒绝 MXC 请求；受管网络要求把 `allow_local_binding` 生效为 `false` 时 MXC 判定为不可用（MXC 被选中时该值默认 `true`）。main 分支提交 `e95abcdf4939`（PR #51547，2026-10-07）新增 `windows.allow_mxc`：设为 `false` 时即使开启 `features.prefer_mxc` 也不自动选择 MXC，并让显式 `windows.sandbox = "mxc"` 直接报错，不写该键保持原行为；该键只在 main 分支，rust-v0.160.1（提交 `d27764b82f71`）的 `WindowsToml` 只有 `sandbox` 一个字段，官方配置参考与 Windows sandbox 页也未列出。需要 Linux 原生工具链时官方建议改用 WSL。',
          sources: [
            'codex-approvals',
            'codex-config',
            'codex-sandboxing',
            'codex-linux-sandbox-bwrap',
            'codex-linux-sandbox-cargo',
            'codex-windows-sandbox',
            'codex-config-reference',
            'codex-commands',
            'codex-managed-configuration',
            'codex-mxc-readme',
            'codex-windows-sandbox-config',
            'codex-windows-config-types',
            'codex-windows-features',
            'codex-windows-allow-mxc-commit',
            'codex-slash-command-v0154',
            'codex-slash-command-v0155',
          ],
        },
        qwen: {
          entry:
            '审批侧仍是 `/approval-mode`、`/permissions` 与 `Shift+Tab`，CLI 可传 `--approval-mode`、`--allowed-tools`、`--sandbox`，启用目录信任后提供 `/trust`。工具执行沙箱没有 Slash 命令：策略写在 User 设置（`~/.qwen/settings.json`，或 `QWEN_HOME` 选择的目录）或管理员 System 设置的 `tools.executionSandbox` 下，核对与验证走独立子命令 `qwen sandbox`（报告生效策略）、`qwen sandbox --verify`（验证内核边界）与 `qwen sandbox -- <cmd...>`（在边界内跑一条命令）；该子命令的 yargs 定义为 `sandbox [cmd...]`、描述 “Inspect tool confinement, verify it, or run one confined command”，选项为 `--verify`（boolean，默认 `false`）、`--sandbox` 与 `--sandbox-image`，开启 `.strict()`，SIGINT 与 SIGTERM 分别以 130 与 143 退出。整 CLI 的旧方法仍走 `--sandbox`/`-s`、`QWEN_SANDBOX` 或 `tools.sandbox`。',
          defaults:
            '`tools.approvalMode` 当前默认值为 `auto`；`security.folderTrust.enabled` 默认关闭。两层沙箱都默认关闭：`tools.executionSandbox` 是必填 `filesystem` 与 `network`、可选 `backend`（默认 `auto`）的完整策略对象，不写就不启用；整 CLI 的 `tools.sandbox` 默认 `undefined`，且官方逐字写 “**`--yolo` does _not_ automatically enable a sandbox.**”。工具执行沙箱只支持 Linux，`execution-sandbox-config.ts` 在不满足时抛 “tools.executionSandbox requires Linux with a compatible bwrap or Landlock backend.”。',
          rules:
            '`permissions.deny` > `ask` > `allow`；规则可限制 Shell、Read、Edit、WebFetch、MCP 等。`tools.disabled` 在注册阶段直接移除工具。工具执行沙箱与规则是两层：官方写 “Approval and YOLO do not expand the filesystem or network policy.”，即审批模式与 YOLO 都不能放宽该策略；策略本身只认字面量，`parseExecutionSandboxSettings` 在出现 `backend`/`filesystem`/`network` 以外的键、缺 `filesystem` 或 `network`、取值不在枚举内或不是字符串时抛 `InvalidExecutionSandboxConfigError`（继承 `FatalConfigError`），消息为 “tools.executionSandbox requires literal filesystem (read-only | workspace-write), network (open | closed), and optional backend (auto | bwrap | landlock). Unknown fields and environment interpolation are not supported.”。',
          boundary:
            '工具执行沙箱覆盖 Shell、终端 `!`、提示词 shell 插值、Monitor、Read/Write/Edit 与受支持的嵌套 in-process Agent/Code Mode 调用，它们共用同一运行时策略；CLI 本体、模型传输、认证与会话存储留在宿主。读取仍然宽：官方写该模式 “does not hide host secrets or promise to isolate pathname Unix sockets and host services”。Landlock 后端另报 `partial` enforcement——不创建 PID 或网络命名空间、不能限制 `chmod`/`chown`/扩展属性/时间戳等全部元数据操作、命令能看到宿主进程并用宿主网络，分离的子孙进程保留文件系统限制但没有 bwrap 的 PID-namespace 生命周期边界；启动时的 Landlock 策略探测需要 `/usr/bin/true`，缺它的宿主即使内核支持也会探测失败。链接的 Git worktree 只对准入的工作区有写权限，工作区外的 Git common-directory 与 worktree 元数据保持只读。整 CLI 方法的边界则是 Seatbelt Profile 或容器挂载（工作区与 `~/.qwen`）。',
          persistence:
            '审批模式和规则可写入用户、项目或系统 Settings；`/permissions` 可管理规则，目录信任记录单独保存在受信目录配置中。`tools.executionSandbox` 的保存范围被官方刻意收窄：Workspace 设置不能启用、关闭或修改它，即使在受信任项目里也不行；生效优先级为 System > User > SystemDefaults，且选择的是一个完整策略对象（System 策略替换整个 User/SystemDefaults 对象，Workspace 值被忽略）；`--bare` 与 `--safe-mode` 保留运算符设定的限制，改动需要新的运行时。',
          noninteractive:
            'Headless 可预设 approval mode 和规则；没有交互通道时，仍需人工确认的工具调用会被拒绝。YOLO 会全放行工具，但不会自动启用 Sandbox。工具执行沙箱支持普通 headless CLI 与两个终端 UI；`qwen sandbox -- <cmd...>` 逐字转发参数与重定向的 stdin，并按字节保留 stdout 与 stderr，交互式 PTY 命令要改用终端 `!`。后端建立错误在 payload 执行前失败，绝不会把命令重跑到宿主上。',
          conditions:
            '目录信任是可选功能；未信任目录会阻止 Auto-Edit、Auto、YOLO 等高权限路径及部分项目自定义内容。工具执行沙箱的平台与集成条件更硬：只在 Linux 生效，bwrap 的支持路径是 `/usr/bin/bwrap`，Landlock 回退要求内核 Landlock ABI 3 及以上且只在 `network: "open"` 时可用；Landlock 不能实现 `network: "closed"`，也不能隐藏显式 masked paths，任一要求都会在命令启动前拒绝 Landlock，而自动回退不会丢弃剩余的路径掩码。Surface 限制逐字为 “This initial public mode supports the ordinary headless CLI and both terminal UIs. ACP, `qwen serve` and web terminals explicitly reject it.”，源码里由 `assertExecutionSandboxSupported(settings, surface)` 抛 “tools.executionSandbox does not yet support ${surface}. Use the ordinary CLI or terminal UI.”；同时被禁用或拒绝的还有 MCP/LSP、可执行 hooks/extensions、worktree/arena 管理、外部 agent、投机执行、文件检查点、自动 skill/memory 维护与未移植的进程或变更工具，同工作区的普通 in-process agent 不能新增 hooks、MCP server、外部执行器或 worktree 隔离，自定义状态命令、外部 Markdown/图片渲染器、IDE 检测与连接、文件恢复与宿主 Git diff 预览都被关掉，只剩对话级 rewind。设置文件格式错误或不可读会阻止启动（配置退出码 52）并给出文件名与修复动作，User 侧的 `.corrupted` 副本只是参考、原文件永不被清除。与旧方法互斥：`QWEN_SANDBOX`、`--sandbox`、`tools.sandbox` 或继承的 `SANDBOX` 取值为 `bwrap` 时抛 `BWRAP_MIGRATION_MESSAGE`（“Whole-CLI bwrap has been removed. Replace tools.sandbox: "bwrap" / QWEN_SANDBOX=bwrap with tools.executionSandbox: {"backend":"auto","filesystem":"workspace-write","network":"closed"} in User or System settings; remove inherited SANDBOX=bwrap and restart outside the old sandbox.”），同时存在 `tools.executionSandbox` 与整 CLI 沙箱选择、`SANDBOX` 标记、`QWEN_SANDBOX_NET` 或 `QWEN_SANDBOX_PROXY_COMMAND` 时抛 “tools.executionSandbox cannot be combined with a whole-CLI sandbox, SANDBOX marker, QWEN_SANDBOX_NET or QWEN_SANDBOX_PROXY_COMMAND. Remove the legacy configuration and restart.”；`proxied` 不是受支持的网络策略。版本时间线：PR #12267（提交 `1afbcffe21c98046670e8e4837a640f5d50465b1`，2026-09-22T10:55:51Z）把 bwrap 沙箱移到工具执行并移除整 CLI 的 bwrap 启动路径，首个记录该节的稳定标签是 v0.24.4（提交 `9674d6efdc8ac16583270bd2a55cfa49e3ec254e`，2026-09-22T15:15:06Z 发布），当时文档写 “Landlock is not available in this release.”，再前一个稳定标签 v0.24.0 的同文件里 Linux 方法仍只有 Docker 或 Podman；PR #12278（提交 `1a5a74bc35b5ac35298118af81df8a973d49260a`，2026-09-29T03:45:46Z）加入 Landlock 回退，首个记录它的稳定标签是 v0.24.7（提交 `b12edec1401a28fc53cd9e714d5928b285071fc8`，2026-09-29T14:02:21Z 发布）；PR #13140（提交 `09411aa0a9193b2e1d86f1a8de7c65e513757a52`，2026-10-03T12:02:48Z）收紧设置失败与沙箱命令流。核对日期最新稳定标签是 v0.25.3（提交 `b28b0d948fa28b89750ac5f1525b95e1746f47ab`，2026-10-19T06:06:37Z 发布），其 `docs/users/features/sandbox.md` 与 main 分支同文件逐字一致；v0.24.7 之后补上的四处是 `/usr/bin/bwrap` 支持路径、配置退出码 52、链接 Worktree 的写权限范围与 stdin 走私有只读 socket。官方写 `qwen sandbox` 的报告包含 “requested/effective backend” 与 “enforcement level”，但全文只给出 Landlock 一侧的级别名 `partial`，bwrap 后端的级别取值官方没有列出，记为未确认。',
          sources: [
            'qwen-approval',
            'qwen-sandbox',
            'qwen-settings',
            'qwen-headless',
            'qwen-sandbox-execution-v0253',
            'qwen-sandbox-execution-scope-v0253',
            'qwen-sandbox-landlock-partial-v0253',
            'qwen-sandbox-verify-v0253',
            'qwen-sandbox-migration-v0253',
            'qwen-settings-execution-sandbox-v0253',
            'qwen-execution-sandbox-settings-v0253',
            'qwen-execution-sandbox-pr-12267',
            'qwen-sandbox-doc-v0244',
            'qwen-landlock-fallback-pr-12278',
          ],
        },
        kimi: {
          boundary:
            '权限规则覆盖文件、Bash、MCP 等工具调用。2.3.0 标签提交 `b5e28fd6beac752a2cdcc0ff2f5fdf40e6494fbb` 的整棵仓库树里没有任何路径含 sandbox、bwrap、bubblewrap、landlock、seccomp 或 seatbelt 字样，该标签的 `docs/zh/configuration/config-files.md`、`docs/zh/reference/tools.md` 与 `docs/zh/configuration/env-vars.md` 也没有这些词；文件边界由 `packages/agent-core-v2/src/agent/permissionPolicy/policies/` 下的策略（含 `sensitive-file-access-ask.ts`、`git-control-path-access-ask.ts`、`git-cwd-write-approve.ts`、`user-configured-deny.ts` 等）与 `packages/agent-core-v2/src/tool/path-access.ts` 的路径判定提供，属权限规则层而不是 OS 或容器隔离层。是否存在未公开的 OS 沙箱记为未确认。',
          conditions:
            'YOLO 跳过普通工具审批，但敏感文件与退出 Plan 仍可询问；Auto 会自动处理全部审批并禁止 Agent 向用户提问。`[permission] dangerous_command_guard = false` 自 2.3.0 起一次关掉全部三条内置 guard 确认策略。官方中文变更记录 2.3.0（2026-10-21）与 2.2.0（2026-10-14）两段都没有沙箱、文件系统隔离或命名空间条目。',
          sources: [
            'kimi-interaction',
            'kimi-config',
            'kimi-cli',
            'kimi-no-os-sandbox-230',
          ],
        },
        qoder: {
          boundary:
            'CLI 权限文档提供路径级 Read/Edit 规则、`permissions.additionalDirectories` 与 `permissions.trustDirectories` 两类受信目录，以及受保护路径。OS 或容器级文件系统沙箱在核对日期无法从官方 CLI 文档复核：`llms.txt` 列出的 96 个 `/cli/` 页面里只有 `cli/sdk/errors`、`cli/sdk/how-it-works` 与 `cli/sdk/skills` 三页出现 sandbox 字样，分别是退出码 `44` “Fatal sandbox error”、“`cwd`, tool allowlists, permission rules, hooks, sandboxing, and infrastructure isolation are complementary controls.” 与 “Don\u0027t treat `skills` as a sandbox”；设置参考页全文没有 sandbox 字样，SDK 参考页也没有 `sandbox.filesystem` 一类键。本仓库此前记录的「SDK 的 `sandbox.filesystem` 可设置 allow/deny read/write，且 Sandbox 默认关闭」因此改为未确认；`llms.txt` 里含 sandbox 的其余链接属 Qoder IDE 与 Cloud Agents 两个别的 Surface，按本仓库规则不并入 CLI。',
          conditions:
            '未信任目录强制回退 `default`；受保护路径仍可要求审批或在 Auto 中拒绝。PreToolUse Hook 的 deny 即使在 bypass 下也能阻断。官方 CLI Release Notes 最新条目为 CLI 1.1.75（October 20, 2026），1.1.66 至 1.1.75 各段都没有本地沙箱键或 OS 隔离条目；整份发布说明唯一含 sandbox 字样的是 CLI 1.0.0（May 20, 2026）段 “Enterprise Integration” 下的 Cloud Agents 一条，属云端 Surface。此前引用的 `https://docs.qoder.com/en/cli/sandbox` 在核对日期返回 404。',
          sources: [
            'qoder-permissions',
            'qoder-sdk-reference',
            'qoder-sdk-errors',
            'qoder-sdk-how-it-works',
            'qoder-docs-index',
            'qoder-settings-reference-sandbox',
            'qoder-release-notes-sandbox',
          ],
        },
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
        'Codex 的原生 Windows 沙箱按实现给出不同网络边界：`elevated` 用防火墙规则，`unelevated` 用环境级断网控制，`mxc` 只放行回环。',
        'Claude Code 对未列域名默认逐次审批，`sandbox.network.strictAllowlist` 或 Managed `allowManagedDomainsOnly` 可改为直接阻断。',
      ],
      behavior: {
        claude:
          'Sandbox 通过外部代理限制 Bash 及子进程域名，默认不预允许任何域名，首次使用新域名触发审批；`sandbox.network.strictAllowlist` 开启后直接拒绝 Allowlist 之外主机，Managed 的 `allowManagedDomainsOnly` 同样自动阻断未列域名且只认 Managed 来源的 Allow 规则。严格名单只约束沙箱内命令，WebFetch 等进程内工具仍按自身权限规则判断；WebFetch 规则与 Sandbox allow/deny domains 合并。',
        codex:
          '`workspace-write` 默认 `network_access = false`；开启后可再启用 `network_proxy`，用 allow/deny 域名、私网和 Unix Socket 规则限域。原生 Windows 沙箱在同一策略下另加系统级网络边界：`elevated` 用防火墙规则（含专用的 offline-user 规则），`unelevated` 改用环境级断网控制而不是那条专用规则因而网络隔离更弱，`mxc` 在被选为 executor 后端时把受管网络的 `allow_local_binding` 默认置为 `true`，只允许 IPv4 与 IPv6 回环的客户端和服务端（含专用代理监听），拒绝直接的非回环出网与一般入站访问；经代理的流量仍适用代理域名规则，直接 DNS 仍被拒绝。',
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
        codex: {
          boundary:
            '本地 CLI/IDE 使用 OS 级沙箱。`read-only`、`workspace-write`、`danger-full-access` 分别提供只读、工作区写入和无沙箱边界；工作区写入默认关闭命令网络。原生 Windows 沙箱按 `[windows] sandbox` 选出的实现给出系统级网络边界：`elevated` 走防火墙规则，`unelevated` 走环境级断网控制，`mxc` 只放行回环。MXC 下 Win32k 调用与桌面句柄仍可用于 PowerShell 启动，剪贴板、输入注入与桌面/系统控制限制保留。',
          conditions:
            '审批决定何时停下来询问，沙箱决定技术边界；`approval_policy = "never"` 不会自动移除仍在生效的沙箱。原生 Windows 的网络边界只在 Windows 上生效，强度随所选实现不同；MXC 被选为后端时 `allow_local_binding` 生效为 `false` 属于配置错误（原生宿主回环访问是双向的，MXC 的 proxy-peer 身份模式未接入），该默认值同样适用于远程 Windows executor 且不会启用已被禁用的网络。企业可用 `requirements.toml` 的 `[windows] allowed_sandbox_implementations` 限定允许的实现，从而间接决定网络边界强度。',
          sources: [
            'codex-approvals',
            'codex-config',
            'codex-windows-sandbox',
            'codex-managed-configuration',
            'codex-mxc-readme',
            'codex-windows-sandbox-config',
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
      includes: [
        '首次目录信任与弹窗内容',
        '项目层配置加载门禁',
        '高权限模式与非交互入口门禁',
        '信任记录保存位置与覆盖方式',
      ],
      excludes: [
        'Git Safe Directory',
        'TLS 证书信任',
        'MCP Server 单独审批',
        'Hook 与插件来源单独信任',
      ],
      facts: [
        '五家都把目录信任用作项目层加载门禁：Claude 只在信任后应用项目 `permissions.allow` 与 `additionalDirectories`，Codex 未信任项目跳过项目作用域的 `.codex/` 层（项目本地配置、Hooks 与 Rules），Qwen 未信任目录不加载项目 `.qwen/settings.json`、项目 `.env` 与项目 Hooks，Kimi 未信任工作区不加载项目层 MCP 与项目本地配置，Qoder 未信任目录强制回退 `default` 权限模式。',
        '总开关默认值相反：Qoder 的 `security.folderTrust.enabled` 默认 `true`，Qwen 的同名键默认 `false` 且关闭时一律视为受信任；Claude、Codex 与 Kimi 没有等价总开关，信任检查恒生效。',
        '信任记录五家各自保存：Claude 写 `~/.claude.json` 的 `projects["<path>"].hasTrustDialogAccepted`，Codex 写 `~/.codex/config.toml` 的 `[projects."<path>"] trust_level`，Qwen 写 `~/.qwen/trustedFolders.json`，Kimi 写应用级原子文档存储的 `workspace-trust` 作用域（官方数据位置页没有列出该文件），Qoder 写用户级 `permissions.trustDirectories`。',
        '高权限模式门禁只有三家写明：Qwen 源码在未信任目录对非 `DEFAULT`/`PLAN` 的审批模式抛 `TrustGateError`，Qoder 文档写非默认模式只在受信目录生效、否则回退 `default`，Claude 不改权限模式而是不应用项目 allow 规则；Codex 由 `trust_level = "untrusted"` 派生更严格的命令审批，Kimi 弹窗页脚明确写工具审批仍按权限设置执行。',
        '非交互入口各自处理：Claude 的 `claude -p` 与 SDK 从不弹信任对话框，`claude ultrareview`、`claude rc` 与后台会话在无法弹窗时以退出码 1 失败，`--trust-workspace` 只信任本次运行；Kimi 用 `KIMI_CODE_TRUST_WORKSPACE=1` 按进程信任且不落盘；Qwen 的 `/trust` 只在交互模式注册；Codex 与 Qoder 的官方 CLI 参考都没有目录信任旗标。',
      ],
      behavior: {
        claude:
          '信任键按启动位置决定：仓库内以 git 仓库根为键、覆盖整仓但不含嵌套仓库（如 submodule），worktree 用主检出的根；仓库外以启动目录为键并覆盖其子目录、同样不含嵌套 git 仓库；直接在 home 目录启动时只按当前会话保留、不写盘，官方写明没有可持久化的设置。对话框会先列出该目录将授予的规则与目录。官方 “What runs before you trust a folder” 表把信任前后分开：设置文件里的 Hooks、`env` 块与 `apiKeyHelper` 等助手、项目 Skill 的 hooks 与 `allowed-tools` 照常生效（并明确写信任从不门禁 Skill 的 `allowed-tools`）；项目 `permissions.allow` 与 `additionalDirectories`、项目 Subagent frontmatter hooks、项目 `@skills-dir` 插件、仓库或 `--add-dir` 来源的 `extraKnownMarketplaces`、Subagent frontmatter 内联 `mcpServers` 与 `.mcp.json` 服务器的 `headersHelper` 都不生效。`deny` 与 `ask` 规则不受信任影响，因为它们只收紧。',
        codex:
          '未信任项目跳过项目作用域的 `.codex/` 层，官方逐项写明包含项目本地配置、Hooks 与 Rules；用户级 `~/.codex/config.toml` 与 system、cloud-managed 层照常加载。`trust_level = "untrusted"` 还派生更严格的审批：命令需要审批，除非有 execution-policy 规则放行，同时禁用项目本地配置；显式写 `approval_policy = "on-request"` 会覆盖这个派生策略。信任也决定项目层能否提供插件配置——市场可定义在 system、cloud-managed、user 或 trusted-project 的 `config.toml`，`plugins.<plugin>.enabled` 由 trusted-project 设置覆盖 user、cloud-managed 与 system 默认值。',
        qwen:
          '未信任目录进入官方所称的受限 safe mode，逐项列出五条：不加载项目 `.qwen/settings.json`；不加载项目任何 `.env`；不能安装、更新或卸载扩展；工具自动接受关闭，即使全局开了自动接受也每次询问；不自动加载本地设置指定目录的记忆文件。源码另外把项目 Hooks 单独门禁——`systemHooks` 与 `userHooks` 不受信任状态影响，`projectHooks` 只在受信任目录加载。判定顺序为功能开关、IDE 信任信号（仅当目标路径与 `process.cwd()` 等价时采信）、文件规则；没有规则命中时状态为 `unknown` 并弹出对话框。',
        kimi:
          '官方 MCP 文档写：在未信任文件夹发现项目级 MCP server 时，信任提示会显示每个 server 的传输方式与启动目标，确认信任才启用该工作区的项目级 MCP server，选 `Don\'t trust` 则不启用；2.1.0 起“项目本地配置仅在工作区受信任后生效”。源码里的披露结构 `TrustGatedActivation` 同时列出被门禁的 MCP server（`name`、`transport` 为 `stdio`/`http`/`sse`、`command`、`args`、`cwd`、`url`、`origin`）、`additionalDirs` 与其来源、`warnings`，以及指令来源 `instructionSources`（`agentsMdPaths`、`skills`、`agentProfiles`、`paths`），因此门禁范围不止 MCP。撤销信任会卸载该工作区的项目级 MCP 配置。',
        qoder:
          '启动 CWD 是主信任目录。受信目录内文件读取默认允许、文件写入可在 `accept_edits` 与 `auto` 模式自动批准、非默认权限模式（`auto`、`bypass` 等）才允许生效；当前目录不受信任时强制回退 `default` 模式。`permissions.trustDirectories` 存在用户级配置且不被项目级配置覆盖，`permissions.additionalDirectories` 与 `--add-dir`、`/add-dir` 等价并只对当前会话生效。',
      },
      overrides: {
        claude: {
          entry:
            '交互式会话在未信任目录启动时弹出 workspace trust 对话框；`claude --bg`（`--background`）在启动或重启后台会话前检查目录信任；`claude remote-control`（别名 `claude rc`）与 `claude ultrareview` 各自提问 `Trust <folder>? [y/N]`；脚本里改用 `claude ultrareview --trust-workspace`（不取值，PR 号或基分支要写在它前面，需 v2.1.309 及以上）。`/permissions` 只管理规则，不是信任开关。',
          defaults:
            '没有信任总开关，检查恒生效；默认权限模式为 `default`。项目 `.claude/settings.json` 的 `permissions.allow` 与 `permissions.additionalDirectories` 只在接受对话框后应用。`.claude/settings.local.json` 通常免信任步骤，但被 git 跟踪或 `.claude` 是符号链接时按仓库提供处理、同样等信任。',
          rules:
            '手工信任写 `~/.claude.json` 的 `projects["<path>"].hasTrustDialogAccepted: true`，`<path>` 为仓库根（仓库外为目录本身）；被跳过的 Subagent hook、内联 MCP、allow 规则与 `headersHelper` 都会在 debug 日志、stderr 警告或 `headersHelper not run` 行里打印这个确切键。官方给的降险手段是 `--setting-sources user`、`--bare`、`--settings \'{"disableAllHooks": true}\'` 与 `disabledMcpjsonServers`。判断目录是否在 git 仓库内要跑 git，而 git 只在信任后才跑；配置主目录（home 或 `CLAUDE_CONFIG_DIR` 指向的目录）豁免这一步。',
          boundary:
            '信任与沙箱是两层，Bash 沙箱与权限规则另行生效。`.mcp.json` 服务器在只信任了父目录时先询问、仓库自己的批准不算数；在 `claude -p` 与 SDK 下不询问直接连接（SDK 仅在 `settingSources` 含项目设置时加载），此时 `claude mcp list` 仍把该服务器报成 pending。',
          persistence:
            '信任写进 `~/.claude.json` 的 `projects` 表并按目录保存；home 目录例外，只保留当前会话、每次启动重新提问。Windows 上 v2.1.286 之前路径大小写不同的信任记录会被判为未信任。`--trust-workspace` 与 `CLAUDE_CODE_DISABLE_ULTRAREVIEW_TRUST_CHECK=1` 都不写盘。',
          noninteractive:
            '`claude -p` 与 SDK 会话从不显示信任对话框，且信任父目录不算数。项目 allow 规则被跳过并向 stderr 打印 `Ignoring N permissions.allow entries from ... this workspace has not been trusted`，`headersHelper` 不运行并打印 `headersHelper not run — this workspace has no persisted trust`。无法弹窗时后台会话不启动并打印 `Workspace not trusted. Run `claude` in /path/to/project once and accept the trust prompt, then retry.`，`claude rc` 与 `claude ultrareview` 都以退出码 1 结束。',
          conditions:
            '`claude ultrareview` 自 v2.1.309 起要求信任：提问 5 分钟无应答先报 `No answer in time.` 再报 `Error: Workspace not trusted`，回答 `n` 或直接回车报 `Ultrareview did not start: <folder> is not trusted`，终端太小或不上报尺寸报 `Error: Workspace not trusted. This terminal ...`。`CLAUDE_CODE_DISABLE_ULTRAREVIEW_TRUST_CHECK=1` 关闭该检查，官方要求设在启动 Claude Code 的环境而不是 settings 的 `env` 块，并写明能提问的运行仍会提问。官方 CLI 参考没有列出 `--trust-workspace`，只在 `--bg` 行写 “Checks workspace trust for the directory before it starts.”。',
          sources: [
            'claude-workspace-trust',
            'claude-security-safeguards',
            'claude-errors-trust',
            'claude-ultrareview-trust',
            'claude-cli-reference-trust',
            'claude-env-vars-ultrareview-trust',
            'claude-v21309-ultrareview-trust-changelog',
          ],
        },
        codex: {
          entry:
            '官方只写 Codex 可能在显式信任工作目录前以 `read-only` 启动，“for example, via an onboarding prompt or `/permissions`”；持久标记写在用户级 `~/.codex/config.toml` 的 `[projects."<path>"]`。官方 CLI Slash 命令参考的 `/permissions` 只描述选择审批预设（含具名 permission profile）、没有信任开关，CLI 参考也没有目录信任旗标，因此交互式信任入口的确切命令记为未确认。',
          defaults:
            '启动时检测目录是否受版本控制：受版本控制推荐 `Auto`（workspace write + on-request），非版本控制推荐 `read-only`。官方另写 “Depending on your setup, Codex may also start in `read-only` until you explicitly trust the working directory”，没有给出门禁的具体条件。项目级 `.codex/config.toml` 只在信任项目后加载。',
          rules:
            '`approval_policy` 只剩 `on-request`、`never` 与 `{ granular = { sandbox_approval, rules, mcp_elicitations, request_permissions, skill_approval } }`，`on-failure` 已弃用、`untrusted` 已不支持。官方写退役的 `approval_policy = "untrusted"` 会让 Codex 与 ChatGPT Work 起不来，要求从用户与项目配置、profile 文件、启动脚本和 managed 默认值里移除。托管 `allowed_approval_policies` 里保留 `untrusted` 仍有效，用于允许由 `trust_level = "untrusted"` 派生的严格审批，但不允许显式写 `approval_policy = "untrusted"`。',
          boundary:
            '信任与沙箱是两层：官方给的 `untrusted` 迁移替代是 `sandbox_mode = "read-only"` 加 `approval_policy = "on-request"`，或 `codex --sandbox read-only --ask-for-approval on-request`，此时沙箱允许的命令无需审批即可运行、可读可访问文件并按配置使用网络。同页 “Dangerous settings” 的 `dangerously_allow_non_loopback_proxy` 与 `dangerously_allow_all_unix_sockets` 放宽的是网络信任边界，与目录信任无关。',
          persistence:
            '`[projects."<path>"] trust_level` 写在用户级 `~/.codex/config.toml`，取值 `"trusted"` 或 `"untrusted"`，官方描述为 “Mark a project or worktree as trusted or untrusted”，因此 worktree 可以单独标记。官方没有列出交互式信任提示写入的其他文件。',
          noninteractive:
            '官方 CLI 参考没有针对目录信任的启动旗标，唯一含 trust 的旗标是 Hook 专用的 `--dangerously-bypass-hook-trust`；非交互运行改用预先写好的 `[projects."<path>"] trust_level`，未信任项目照旧跳过项目 `.codex/` 层。',
          conditions:
            '`trust_level = "untrusted"` 会连项目本地配置一起关掉，因此不能只用它收紧审批而保留项目配置。官方文档没有记录 `--dangerously-bypass-approvals-and-sandbox`（别名 `--yolo`）是否绕过目录信任。',
          sources: [
            'codex-trust-level',
            'codex-untrusted-retired',
            'codex-approval-defaults',
            'codex-slash-commands-permissions',
            'codex-cli-reference-hook-trust',
            'codex-config',
          ],
        },
        qwen: {
          entry:
            '开启功能后首次在该目录运行弹出信任对话框，三个选项为 **Trust folder**、**Trust parent folder**（同时信任其全部子目录）与 **Don\'t trust**；会话内用 `/trust`（描述 “Manage folder trust settings”，源码 `supportedModes: [\'interactive\']`、action 只打开 `trust` 对话框）或 `/permissions`（官方写会唤起同一个对话框）改当前目录的信任；Web Shell 在 workspaces 总览对未信任工作区提供 **Trust** 动作。',
          defaults:
            '`security.folderTrust.enabled` 为 boolean、默认 `false`，官方 Trusted Folders 页写功能 “disabled by default”、要在用户 `settings.json` 里开启；源码 `isWorkspaceTrusted` 在功能关闭时直接返回受信任。关闭时 `/trust` 不注册，官方命令文档写 “When disabled these commands won\'t appear and will report an unknown command.”。开启后失败关闭：做出选择前目录算未信任，`~/.qwen/trustedFolders.json` 缺失时（新机器、恢复的 home、同步的 dotfiles）除更高优先级信号决定的目录外全部按未信任开始，包括此前信任过的目录。',
          rules:
            '持久化形状是路径到 `TrustLevel` 的映射，取值只有 `TRUST_FOLDER`、`TRUST_PARENT`、`DO_NOT_TRUST`；匹配时 `TRUST_PARENT` 先解析成其父目录再比较。解析规则为最具体（最深）的包含规则胜出、同深度时未信任规则胜过信任规则、结果与规则写入顺序无关。未信任目录里 `Config.setApprovalMode` 对既不是 `DEFAULT` 也不是 `PLAN` 的模式抛 `TrustGateError`（“Cannot enable privileged approval modes in an untrusted folder.”），`setPlanMode` 对非 `DEFAULT` 的执行模式抛同一错误。',
          boundary:
            '信任门禁与工具沙箱是两层，`tools.executionSandbox` 与 `--sandbox` 另行生效。Hook 按作用域分层门禁：系统与用户级 Hooks 不受信任状态影响，项目级 Hooks 只在受信任目录加载；设置文档另注明项目提供的 `mcpServers[].env` 与 `hooks[].env` 同受 folder trust 门禁。',
          persistence:
            '选择保存在集中文件 `~/.qwen/trustedFolders.json`（源码常量 `TRUSTED_FOLDERS_FILENAME`，`QWEN_CODE_TRUSTED_FOLDERS_PATH` 可改路径），每个目录只问一次；文件接受 JSONC（注释与尾逗号）。不可读、语法非法或顶层不是对象时是硬配置错误：缓存加载失败让 CLI 以 “Please fix the configuration file and try again.” 停止，daemon 的 v1 信任检查返回 `500 trusted_folders_invalid`，此时先前的 IDE 信任决定仍可绕过基于文件的检查；写入侧在持久化前校验文件，缓存加载后文件变非法可能在写入时报 `500 internal_error` 或写后校验报 `409 trust_grant_ineffective`；非法信任级别由授权写入器与 v2 策略读取器检出，legacy v1 读取器不校验，v2 把策略错误报成 `200` 且 `configured.state: "error"`。会话内改变信任会置 `isRestarting` 并重新打开对话框，即需要重启。',
          noninteractive:
            '`/trust` 只在交互模式注册，官方 headless 文档没有列出单次运行的目录信任旗标，脚本改用预先写好的 `~/.qwen/trustedFolders.json` 或依赖 IDE 信任信号。经 `qwen serve` daemon 授予的信任会立即更新信任文件与 v1 信任状态，但启动期绑定的运行时门禁需要重启；由另一个终端进程或手工改文件做出的决定对 daemon 缓存的 v1 状态不立即可见，要重启 daemon。daemon 的审批模式路由把 `TrustGateError` 翻成结构化 `errorKind: \'auth_env_error\'` 而不是通用 500。',
          conditions:
            'Web Shell 的 **Trust** 动作只在所连 daemon 广播 `workspace_trust_grant` 时出现，而 daemon 只在信任热重载能把决定应用到运行中运行时时才广播；只提供授权路由而没有热重载的 daemon 会隐藏该动作。IDE 信任信号优先级最高，但源码只在目标路径与 `process.cwd()` 等价时采信。官方没有给出 `security.folderTrust.enabled` 的引入版本。',
          sources: [
            'qwen-trusted-folders',
            'qwen-commands-trust',
            'qwen-settings-folder-trust',
            'qwen-trust-command-source',
            'qwen-trust-store-source',
            'qwen-trust-precedence-source',
            'qwen-trust-status-source',
            'qwen-folder-trust-hook',
            'qwen-config-trust-gate',
          ],
        },
        kimi: {
          entry:
            'TUI 启动时显示信任弹窗：标题 `Trust this folder?`、提示行 `↑↓ navigate · Enter select · Esc exit`，两个选项为 `Trust and continue` 与 `Exit`，默认选中第一项、`Esc` 等于 `Exit`、`Enter` 与空格确认；正文用 `←→` 或 PageUp/PageDown 分页展示被门禁的激活内容。没有独立 Slash 命令。Desktop/Web 侧走 server API `GET|POST /api/v1/workspaces/{workspace_id}/trust` 与 `POST .../untrust`；`KIMI_CODE_TRUST_WORKSPACE=1` 按进程信任。',
          defaults:
            '没有目录信任总开关，检查恒生效。`agent-core-v2` 自 0.33.0（2026-08-05）起是 CLI 各界面（交互式 TUI、`kimi -p`、`kimi acp` 等）的默认引擎，官方配置文档写“本节由 `agent-core-v2` 引擎读取，Kimi Code 的所有界面都运行在该引擎上”，`KIMI_CODE_LEGACY_FLAG=1` 回退旧引擎，因此信任不再受 `KIMI_CODE_EXPERIMENTAL_FLAG` 门禁。权限侧默认值仍是 `default_permission_mode = manual`、`default_plan_mode = false`。',
          rules:
            '源码里 `isTrusted()` 等于「环境变量信任 OR 持久化信任」，`isPersistedTrusted()` 只返回持久值；`KIMI_CODE_TRUST_WORKSPACE` 真值 `1`/`true`/`yes`/`on`、假值 `0`/`false`/`no`/`off`，等效于在交互提示里选 “Trust this folder”，只按进程生效且不写持久记录。持久记录以 `workspace-trust` 作用域存储，键为规范化工作区根的 `encodeWorkDirKey`、值为 `{ root, trustedAt }`，读到记录即信任、没有独立的「未信任」记录，撤销信任即删除记录；旧键与旧 Windows 路径变体会被迁移到规范键，扫描时只跳过 `.tmp.<n>.<hex>` 临时键与单条解码失败的记录，其他存储异常原样抛出并上报 telemetry 事件 `workspace_trust_read_failed`。',
          boundary:
            '信任门禁只决定项目层配置与项目级 MCP 是否加载，不替代权限模式：弹窗页脚逐字写 “Tool approvals follow your permission settings.”。MCP 配置路由的 `cwd` 参数只在受信任目录并入项目根层与项目本地层，否则项目层被跳过。2.1.0 同批加固还包括文件工具不能再经符号链接访问工作目录外文件、后台 git 操作不再执行仓库 git 配置中的命令、拒绝解析结果为 home 或文件系统根目录的附加目录。',
          persistence:
            '信任按文件夹持久保存，弹窗页脚逐字写 “Trust is remembered for this folder, including future project config changes.”；`KIMI_CODE_TRUST_WORKSPACE` 不落盘。官方数据位置页的 `$KIMI_CODE_HOME`（默认 `~/.kimi-code`）目录树没有列出信任记录文件，因此该记录的确切磁盘路径记为未确认。',
          noninteractive:
            '官方 MCP 文档写：无头运行（例如 CI 里的 `kimi -p`）无法显示信任提示，工作区尚未受信任时项目级 MCP server 保持禁用；把 `KIMI_CODE_TRUST_WORKSPACE` 设为 `1` 即可在该进程中信任当前工作区。server API 的三个信任端点供 Desktop/Web 客户端调用，返回 `{ trusted }`、`{ trusted: true }` 与 `{ trusted: false }`。',
          conditions:
            '终端放不下披露内容时弹窗不渲染选项，只输出标题与 ` Enlarge terminal to review sources. Esc exit.`，此时 `Enter`/`Space` 被忽略、只能 `Esc` 退出。2.3.1（PR #4348，合并提交 `c569bab55d4d510b09f01205d760001d16117aff`）把三个信任接口从「创建完整工作区运行时并等待 `HostEnvironment.ready`（含 Git Bash 探测）」改为直接访问应用级信任存储，修复 Windows 未安装 Git Bash 时信任读写失败；存储异常不再被转成 `trusted: false` 而是保留原始 message 与 request ID（失败仍按未信任处理、不放开权限），初始化失败不再缓存已拒绝的 Promise、后续读写会重试，恢复时重新完成文件与插件 MCP 的完整初始化并发布配置差异，即使信任值未变也发一次状态恢复事件。',
          sources: [
            'kimi-trust-prompt-source',
            'kimi-mcp-trust',
            'kimi-env-vars-trust',
            'kimi-server-api-trust',
            'kimi-changelog-trust',
            'kimi-config-files-engine',
            'kimi-trust-disclosure-source',
            'kimi-trust-record-source',
            'kimi-231-trust-fix',
            'kimi-231-changelog',
            'kimi-trust-v2',
          ],
        },
        qoder: {
          entry:
            '启动 CWD 即主信任目录，没有首次信任对话框的官方描述；用 `--add-dir`（可重复）、`/add-dir` 命令或 `permissions.additionalDirectories` 增加受信工作目录，用全局设置的 `permissions.trustDirectories` 永久信任常用目录。Release Notes 记 CLI 1.0.17 给 `/permissions` 加入 directory completion、workspace dialog、scope-colored trust tags 与 remove confirmation，官方权限页与 Slash 命令参考都没有描述这个对话框，其字段与保存位置记为未确认。',
          defaults:
            '默认权限模式为 `default`；`security.folderTrust.enabled` 为 boolean、默认 `true`、Restart 为 Yes、描述 “Enable Folder Trust.”；`permissions.trustDirectories` 与 `permissions.additionalDirectories` 都是 string[]、默认 `[]`、Restart 为 No。官方没有写 `security.folderTrust.enabled` 设为 `false` 时的行为，该取值的效果记为未确认。',
          rules:
            '受信目录内文件读取默认允许、写入可在 `accept_edits` 与 `auto` 自动批准、非默认模式才生效；未信任目录强制回退 `default`。`permissions.trustDirectories` 由用户显式信任、存在用户级配置且不被项目级配置覆盖，`permissions.additionalDirectories` 对应 `/add-dir` 并进入工作区上下文，`context.loadMemoryFromIncludeDirectories`（默认 `false`）决定这些附加受信目录是否也加载记忆。',
          boundary:
            '信任边界与 SDK 的 Sandbox Settings 是两层。`bypass_permissions`（YOLO）跳过审批提示但保留一小组 path-shape 保护，且它本身是非默认模式，因此未信任目录里也回退 `default`；受保护路径（`.git`、`.vscode`、`.idea`、`.husky`、多数 `.qoder` 配置文件、`.bashrc`/`.zshrc` 等 shell 启动文件、Git config、`.mcp.json`、`.ripgreprc`）在普通交互模式下仍需显式批准。',
          persistence:
            '`permissions.trustDirectories` 写在全局（用户级）设置，官方描述为 “stored in user-level configuration and not overridden by project-level configuration”；`--add-dir` 只对当前会话生效。官方文档没有给出信任记录的文件名，也没写首次信任决定的保存位置，两者记为未确认。',
          noninteractive:
            'Headless 里 `ask` 自动转为 `deny`，官方权限页的 headless 示例注明 `bypass_permissions` 只用于受信场景；未信任目录在 headless 下同样回退 `default`。官方 CLI 参考里含 trust 的启动参数只有 `--add-dir`，没有跳过信任检查的旗标。',
          conditions:
            '`security.folderTrust.enabled` 需要重启才生效（Restart: Yes），两个 `permissions.*Directories` 键不需要。CLI 0.2.9（2026-05-08）修复了 `/add-dir` 受信目录仍要求读权限审批的问题，CLI 1.0.15（2026-06-09）修复了授予工作区信任后项目权限规则未立即生效的问题；官方没有给出这两个键的引入版本。',
          sources: [
            'qoder-permissions-trust',
            'qoder-settings-folder-trust',
            'qoder-cli-reference-add-dir',
            'qoder-slash-reference-add-dir',
            'qoder-release-notes-trust',
          ],
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

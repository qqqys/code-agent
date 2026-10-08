(() => {
  const rows = Object.fromEntries(
    window.matrixData.rows
      .filter((row) => row.category === 'sessions')
      .map((row) => [row.id, row]),
  );

  const profiles = {
    claude: {
      storage:
        '默认保存在 `~/.claude/projects/<project>/<session-id>.jsonl`；项目名由工作目录转换得到。',
      surfaces:
        '本页以 CLI 为准。桌面端、Web 和 VS Code 各自维护会话历史；`claude -p` 与 Agent SDK 会话可按 ID 恢复，但不出现在 CLI 选择器中。',
      status: '官方确认',
      sources: ['claude-sessions'],
    },
    codex: {
      storage:
        '本地会话记录位于 `$CODEX_HOME/sessions`，默认是 `~/.codex/sessions`；归档会话单独位于 `$CODEX_HOME/archived_sessions`。',
      surfaces:
        '本页区分交互式 Codex 与 `codex exec`。桌面端、IDE 和 CLI 可能随各自版本提供不同的命令集合。',
      status: '官方确认',
      sources: ['codex-commands', 'codex-troubleshooting'],
    },
    qwen: {
      storage:
        '会话按当前项目保存在 `~/.qwen/projects/<sanitized-cwd>/chats/<sessionId>.jsonl`。',
      surfaces:
        '本页以交互式 TUI 为主；Headless 与 ACP 只有在对应命令注册或 CLI 参数存在时才单独列出。',
      status: '源码确认',
      sources: ['qwen-session-commands', 'qwen-session-headless'],
    },
    kimi: {
      storage:
        '会话位于 `$KIMI_CODE_HOME/sessions/<workDirKey>/<sessionId>/`，默认数据根为 `~/.kimi-code`；元数据在 `state.json`，消息和工具事件在 `agents/*/wire.jsonl`。',
      surfaces:
        '本页以交互式 TUI 和 `kimi` CLI 为主；只在 Web UI 中不同的行为会单独注明。',
      status: '官方确认',
      sources: ['kimi-sessions-current', 'kimi-data-current'],
    },
    qoder: {
      storage:
        '公开 TUI 文档未列出固定的会话存储目录；SDK 消息与 Hook 上下文提供 `session_id` 和 `transcript_path`。',
      surfaces:
        '本页以 Qoder CLI TUI 为主；只在 Agent SDK 提供的能力会明确标为 SDK 条件项。',
      status: '官方确认',
      sources: ['qoder-commands'],
    },
  };

  function evidenceStatus(value, profile, status) {
    if (status) return status;
    if (value.includes('未确认') || value.includes('未列出')) return '未确认';
    if (
      value.includes('条件') ||
      value.includes('SDK') ||
      value.includes('默认关闭')
    ) {
      return '条件项';
    }
    return profile.status;
  }

  function record(productId, fields) {
    const profile = profiles[productId];
    return {
      value: fields.value,
      entry: fields.entry,
      storage: fields.storage ?? profile.storage,
      behavior: fields.behavior,
      scope: fields.scope,
      automation: fields.automation,
      persistence: fields.persistence,
      surfaces: fields.surfaces ?? profile.surfaces,
      conditions: fields.conditions,
      status: evidenceStatus(fields.value, profile, fields.status),
      sources: fields.sources ?? profile.sources,
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
    if (!row) throw new Error(`Unknown session capability: ${id}`);

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
    'session-resume': createDetail({
      id: 'session-resume',
      definition:
        '退出后重新载入已有会话，使历史消息、工具结果和产品明确保存的会话状态继续参与后续对话。',
      includes: ['交互式选择历史会话', '按最近会话或会话 ID 恢复', '恢复后重新加载的状态'],
      excludes: ['跨会话自动记忆', '把当前会话复制成新 ID', '单纯查看终端输入历史'],
      facts: [
        '五家都提供恢复入口，但会话选择范围分别按项目、工作目录、Worktree 或 SDK 参数组织。',
        '恢复历史不等于恢复所有启动参数；Claude Code 和 Qwen Code 都明确列出需要重新提供或重新加载的状态。',
        '会话文件通常包含提示词、工具结果和本地路径，分享前需要按敏感数据处理。',
      ],
      products: {
        claude: {
          entry:
            '`/resume` 在会话内切换；`claude --continue` 恢复当前目录最近会话；`claude --resume [name|id]` 打开选择器或直接恢复。',
          behavior:
            '恢复完整对话和工具结果，并尝试恢复模型、Agent、权限模式、活动 Goal 与未过期的定时任务；部分状态受当前账号、模型可用性和安全规则影响。',
          scope:
            '默认选择当前 Worktree 的会话；`Ctrl+W` 扩到仓库全部 Worktree，`Ctrl+A` 扩到本机全部项目。按名称可在当前仓库及其 Worktree 精确匹配。',
          automation:
            '会话在工作过程中持续写入本地记录，不需要显式保存。',
          persistence:
            '默认保留 30 天，可用 `cleanupPeriodDays` 调整；`--no-session-persistence` 可让单次 `claude -p` 不落盘。',
          conditions:
            '`--mcp-config`、`--settings`、`--plugin-dir`、`--fallback-model` 和额外目录等启动参数不会全部随会话恢复，需要按需重新传入。',
          sources: ['claude-sessions'],
        },
        codex: {
          entry:
            '交互式会话使用 `/resume` 选择历史；非交互流程使用 `codex exec resume --last <prompt>` 或 `codex exec resume <SESSION_ID> <prompt>`。',
          behavior:
            '继续已有线程并把新提示追加到同一会话。非交互恢复保留此前对话上下文，适合分阶段脚本。',
          scope:
            '`--last` 选择最近会话；显式 ID 选择指定会话。交互选择范围由当前 Codex 客户端提供的会话列表决定。',
          automation:
            '本地客户端持续维护会话记录；无需单独执行保存命令。',
          persistence:
            '会话记录保存在 Codex Home；公开故障排查文档给出会话与归档目录，但当前命令页未承诺固定清理周期。',
          conditions:
            '`codex exec` 默认要求在 Git 仓库中运行；恢复命令接受后续提示，而不是只打开只读记录。',
          sources: [
            'codex-commands',
            'codex-noninteractive',
            'codex-troubleshooting',
          ],
        },
        qwen: {
          entry:
            '`/resume`（别名 `/continue`）打开历史会话；Headless 可用 `qwen --continue -p` 或 `qwen --resume <sessionId> -p`。',
          behavior:
            '恢复对话历史、工具结果和聊天压缩检查点，再发送新的提示词；Worktree 绑定存在时会加载 sidecar 并提示后续工具继续使用对应路径。',
          scope:
            '会话按项目和实际工作目录分桶；每个 linked Git Worktree 有独立会话目录，选择器只显示当前作用域的记录。',
          automation:
            '`general.chatRecording` 默认开启并持续保存；关闭后 `/resume` 和 `--continue` 都不可用。',
          persistence:
            '聊天 JSONL 留在项目会话目录；Worktree 绑定另存为 `<sessionId>.worktree.json`。',
          conditions:
            '从 Worktree 恢复时，CLI 验证目录是否仍存在；目录已删除会清理陈旧 sidecar 并在原作用域继续，而不是重建 Worktree。',
          sources: [
            'qwen-session-commands',
            'qwen-session-headless',
            'qwen-session-settings',
            'qwen-worktree-current',
          ],
        },
        kimi: {
          entry:
            '`/sessions`（别名 `/resume`）在 TUI 浏览和切换；`kimi --continue` 恢复当前目录最近会话；`kimi --session [id]` 选择或指定会话。',
          behavior:
            '从会话目录的元数据和 Agent 事件流恢复历史。会话中的后台任务、定时任务和子 Agent 状态有各自的持久化目录。',
          scope:
            '会话按工作目录生成的 `workDirKey` 分组；顶层 `session_index.jsonl` 维护会话 ID、目录和工作目录索引。',
          automation:
            '每次直接运行 `kimi` 创建新会话，并在运行过程中写入 `state.json` 和 `wire.jsonl`。',
          persistence:
            '会话和诊断材料保存在 `KIMI_CODE_HOME`；官方文档未给出自动保留天数。',
          conditions:
            '`--continue` 与 `--session` 互斥；TUI 的会话切换命令只在 Agent 空闲时可用。',
          sources: [
            'kimi-sessions-current',
            'kimi-cli-current',
            'kimi-data-current',
          ],
        },
        qoder: {
          entry:
            '`/resume` 从历史记录选择会话；SDK 还提供 `continue: true`、`resume: <sessionId>` 和 `resumeSessionAt: <messageUuid>`。',
          behavior:
            'TUI 恢复历史会话；SDK 可以继续最近会话、指定会话 ID，或从指定消息锚点继续。',
          scope:
            'TUI 命令页只描述“历史记录”；SDK 由宿主传入工作目录、会话 ID 和消息锚点。',
          automation:
            '公开命令页未说明 TUI 的保存频率；SDK 运行时会生成或接收 `sessionId`。',
          persistence:
            'SDK 可从消息与 Hook 取得 transcript 路径；固定磁盘目录和自动清理周期未在当前 TUI 文档中列出。',
          conditions:
            '`resumeSessionAt` 是 SDK 消息锚点；它不等同于回滚本地文件。',
          sources: ['qoder-commands', 'qoder-sdk-reference'],
        },
      },
      related: ['session-live-list', 'session-branch', 'session-naming', 'session-checkpoint'],
    }),

    'session-live-list': createDetail({
      id: 'session-live-list',
      definition:
        '列出本机当前正在运行的交互式 Agent 会话，区别于面向已保存历史会话的恢复入口。',
      includes: ['运行中交互式会话的列表入口', '列表输出格式与字段', '运行状态登记与失效清理'],
      excludes: ['已保存历史会话的列表与恢复', '云端会话或云端任务列表', '跨会话消息与相互控制'],
      facts: [
        'Qwen Code 提供专用 CLI 命令 `qwen sessions ps` 列出本机运行中的交互式会话，基于 `~/.qwen/sessions/` 实时进程登记表（v0.21.14 起）。',
        'Claude Code 官方 Sessions 文档把 agent view 与 `claude agents --json` 输出描述为运行中会话的列表；会话选择器以 `bg` 标记后台会话。',
        'Codex rust-v0.149.0 起提供 `codex agents` 子命令、`/agents` 与 `Alt+A` Agent 会话仪表盘，列出共享本地 app-server Daemon 加载的运行中会话，并可搜索、打开、重命名、停止会话和新建任务；官方 Slash 命令文档尚未同步。',
        'Kimi Code 与 Qoder CLI 的官方命令表只列出面向已保存会话的恢复入口，未列出查看运行中会话的命令。',
      ],
      products: {
        claude: {
          entry:
            '官方 Sessions 文档把 agent view 与 `claude agents --json` 输出列为运行中会话的列表（listings of running sessions）；`claude --resume` 或 `/resume` 打开的会话选择器默认列出当前 Worktree 的会话，包括以 `bg` 标记的后台会话。',
          behavior:
            '会话名称用于在运行中会话列表中标识会话：未命名会话的默认名称为工作目录名加两位字符后缀（如 `my-app-3f`）。选择器支持输入字符过滤，粘贴 PR/MR 网址可定位关联会话。',
          scope:
            '选择器默认范围为当前 Worktree；`Ctrl+W` 扩到当前仓库全部 Worktree，`Ctrl+A` 扩到本机全部项目，`Ctrl+B` 按当前 git 分支过滤。',
          automation:
            '转为后台的会话以 `bg` 标记继续出现在选择器列表中。',
          persistence:
            '运行中会话列表依赖正在运行的进程；会话历史本身的保留策略见恢复会话字段。',
          surfaces:
            'CLI：会话选择器、agent view 与 `claude agents --json` 命令输出。',
          conditions:
            '官方 Sessions 文档未描述独立的运行中会话登记表目录；列表内容与范围以选择器和 agent view 的当前行为为准。',
          sources: ['claude-sessions'],
        },
        codex: {
          entry:
            '`codex agents` 子命令打开共享本地 app-server Daemon 的 Agent 会话仪表盘（clap 帮助文本为 "Browse all agent sessions on the shared local app-server daemon"）；TUI 内 `/agents`（描述为 "view and switch between all active agent sessions"）或全局快捷键 `Alt+A` 打开同一仪表盘。当前会话使用内嵌 app server、未连接共享 Daemon 时，`/agents` 显示 "Shared agents unavailable"，Unix 下可选 "Start background server" 先启动后台 Daemon。',
          behavior:
            '仪表盘列出 Daemon 已加载的根会话（`ThreadLoadedList` 分页获取，上限 1000 条），排除 ephemeral 与未加载（NotLoaded）会话；每行显示会话名、首条用户消息预览与 Subagent 状态，按更新时间排序；支持搜索（`Ctrl+F`）、打开/切换会话、新建任务（`Ctrl+N`，新建线程并提交提示词）、重命名（`Ctrl+R`）、停止（`Ctrl+X`，中断进行中的回合）；列表随相关线程通知刷新。',
          scope:
            '列表对象是共享 Daemon 加载中的会话，状态分组为 Needs input（Active 且等待审批或用户输入，或 SystemError）、Working（Active）、Ready（Idle）；默认按项目分组，`Ctrl+S` 切换为按状态分组。未加载的历史会话不列出；`codex resume` 仍面向已保存会话，云端聊天仍由 `codex cloud list` 单独列出。',
          automation:
            '会话状态经 app-server 的 `ThreadStatus`（`NotLoaded`/`Idle`/`SystemError`/`Active`，Active 携带 `WaitingOnApproval`/`WaitingOnUserInput` 标志）自动登记并推送给仪表盘。',
          persistence:
            '仪表盘反映 Daemon 内存中加载的会话运行状态，不是对话历史；会话记录仍保存在 `$CODEX_HOME/sessions`。',
          surfaces:
            'CLI 子命令 `codex agents` 与交互式 TUI（`/agents`、`Alt+A`）。Unix 下 `codex agents` 在需要时自动启动本地 Daemon（要求终端）；非 Unix 平台必须用 `--remote` 连接远端服务器，`--cd` 为远端服务器上的新任务指定目录。',
          conditions:
            '`codex agents` 不能与调用级配置覆盖（`-c` 原始覆盖、提示词、`--model`、`--sandbox-mode`、审批策略等）组合，workload identity 激活时不可用；仪表盘快捷键经 `tui.keymap` 配置（`global.open_agents` 与 `agents` 组的 `search`/`new_task`/`rename`/`stop`/`toggle_grouping`）；官方 Slash 命令文档尚未列出 `/agents`。PR #39094（`4617d4d21d27`）、#39112（`319b2f72b1d4`）、#39114（`fd5018e0445b`）、#39142（`f47f77ada669`）于 2026-08-17/18 合入 main，随 rust-v0.149.0 发布。',
          status: '官方确认',
          sources: [
            'codex-v0149-release',
            'codex-agents-dashboard-commit',
            'codex-agents-command-commit',
            'codex-agents-shortcuts-commit',
            'codex-agents-overview-source',
          ],
        },
        qwen: {
          entry:
            '`qwen sessions ps` 列出本机当前运行中的交互式 Qwen Code 会话；`--json`（boolean，默认 `false`）改为 JSON Lines 输出。',
          storage:
            '实时进程登记表位于 `~/.qwen/sessions/`（随 `QWEN_HOME` 重定向解析），目录权限 0700；记录文件命名 `<pid>.json`、权限 0600，以 `noFollow` 写入防止符号链接重定向；原子写入产生的临时文件超过 5 分钟按孤儿清理。',
          behavior:
            '交互式会话启动时注册、退出时注销；默认输出 NAME、PID、AGE、DIRECTORY 四列表格，无运行中会话时输出 `No other interactive Qwen Code sessions are running.`，人类可读输出净化终端控制字符。`--json` 每行输出一个 JSON 对象（字段 `schemaVersion`、`pid`、`procStart`、`pidNs`、`sessionId`、`cwd`、`name`、`startedAt`、`qwenVersion`），为未经终端净化的原始数据，stdout 不输出其他内容，可安全接 `jq`。',
          scope:
            '列出本机全部运行中的交互式会话；Headless（`qwen -p`）会话不注册、不显示（“Interactive” 是注册事实而非过滤条件）。`qwen sessions list` 是列出已保存历史会话的兄弟命令（`--json`、`--limit` 默认 20），不属于本字段。',
          automation:
            '登记表随会话启动、退出自动写入与移除；`/clear`、`/cd` 等变化经 `patchSessionRecord` 更新记录且不改动身份字段；列表时发现进程已死或身份令牌不匹配的记录随即清除，清除前重新读取记录以防竞态。',
          persistence:
            '登记记录是运行状态而非对话历史；会话历史仍保存在项目会话目录。',
          surfaces:
            'CLI 子命令。v0.21.14 同时为 Daemon 增加受信任的 `GET /workspaces/:workspace/sessions/live-state` 内存快照与目录版本令牌（PR #9261），Web Shell 改为消费该端点轮询会话活动状态（PR #9366）。',
          conditions:
            'Linux 以 `/proc` 读取 `<boot_id>:<starttime>` 进程身份令牌与 PID 命名空间 inode，二者不可读时拒绝注册；boot ID 或命名空间不匹配的记录不列出也不清除；schema 校验失败、更高 schemaVersion 或外部身份的记录跳过但不清除；非 Linux 平台 `procStart`/`pidNs` 为 `null`，退化为基础 PID 存活检查。PR #8969（合并提交 `a1e046eb6c55`）2026-08-17 合入 main，随 v0.21.14 发布。',
          status: '官方确认',
          sources: [
            'qwen-sessions-ps-docs',
            'qwen-sessions-ps-commit',
            'qwen-sessions-ps-source',
            'qwen-session-registry-source',
            'qwen-v02114-release',
          ],
        },
        kimi: {
          entry:
            '`/sessions`（别名 `/resume`）浏览并恢复历史会话；`kimi --session` 在启动时交互式浏览历史会话并选择。',
          behavior:
            '列表对象是已保存的历史会话；官方会话文档未提供查看运行中会话的入口。',
          scope:
            '历史会话按工作目录分组保存；`/sessions` 在当前数据目录内的历史会话中浏览。',
          automation:
            '官方文档未列出运行中会话的自动登记机制。',
          persistence:
            '会话保存在 `KIMI_CODE_HOME`；本字段不涉及其保留策略。',
          surfaces:
            '交互式 TUI 与 CLI 启动参数。',
          conditions:
            '官方文档未列出运行中会话查看；不据此推断底层能力不存在。',
          sources: ['kimi-sessions-current'],
        },
        qoder: {
          entry:
            '`/resume` 恢复历史会话；`/continue` 恢复当前项目最近会话。',
          behavior:
            '会话入口面向历史记录；命令表未列出查看运行中会话的命令。',
          scope:
            '`/resume` 从历史记录选择；`/continue` 作用于当前项目最近会话。',
          automation:
            '官方文档未列出运行中会话的自动登记机制。',
          persistence:
            '公开 TUI 文档未列出固定的会话存储目录；运行中会话列表未公开。',
          surfaces:
            'TUI。',
          conditions:
            '官方命令表未列出运行中会话查看；不据此推断底层能力不存在。',
          sources: ['qoder-commands'],
        },
      },
      related: ['session-resume', 'session-naming', 'session-messaging'],
    }),

    'session-branch': createDetail({
      id: 'session-branch',
      definition:
        '复制当前会话截至某一时点的上下文，生成独立会话 ID，使新旧对话可以分别继续。',
      includes: ['复制历史到新会话', '新旧会话独立保存', '分支时继承的状态边界'],
      excludes: ['Git 分支或 Worktree', '后台 Subagent 委派', '在同一会话中回退到检查点'],
      facts: [
        'Claude Code、Codex、Qwen Code 和 Kimi Code 都有直接会话分支入口；Qoder CLI 当前只在 SDK 公开了同类选项。',
        'Claude Code 和 Codex 还在 Headless 流程提供会话分支：Claude Code 用 `--fork-session`，Codex 用 `codex exec fork`（条件：main 分支，尚未发布）。',
        'Qwen Code 的 `/fork` 是继承完整对话的后台 Agent，不是会话分支；会话分支入口是 `/branch`。',
        'Qwen Code v0.21.13 起支持从任意已完成 Assistant 响应分支：Web Shell Branch 动作、Daemon `POST /session/:id/branch` 携带 `atRecordId`、TypeScript SDK `branchSession` 历史分支重载都以持久 `branch_checkpoint` 记录为分支依据。其余四家的分支入口以当前对话或会话状态为分支点；Qoder SDK 文档未明确 `forkSession` 能否与 `resumeSessionAt` 消息锚点组合。',
        '会话分支复制的是对话状态，不代表复制所有进程内授权、Goal、后台任务或工作区状态。',
      ],
      products: {
        claude: {
          entry:
            '`/branch [name]` 在当前进程复制并切换；命令行用 `--continue` 或 `--resume` 配合 `--fork-session`。',
          behavior:
            '创建新会话 ID，复制截至分支点的对话，原会话磁盘记录保持不变。`/branch` 完成后当前进程写入新会话。',
          scope:
            '同进程 `/branch` 继承本会话临时授权；新进程 `--fork-session` 不继承。运行中的后台 Agent 和 Bash 继续执行，输出进入新分支。',
          automation:
            '未指定名称时根据会话首个提示生成名称。',
          persistence:
            '新旧会话都进入会话选择器，并分别遵循会话保留策略。',
          conditions:
            '不要在两个终端直接恢复同一会话来模拟分支，否则消息会交错写入同一记录。',
          sources: ['claude-sessions'],
        },
        codex: {
          entry:
            '`/fork` 把当前本地聊天复制为新的本地聊天；非交互流程使用 `codex exec fork <SESSION_ID> [PROMPT]`，`SESSION_ID` 接受会话 UUID 或线程名称。',
          behavior:
            '`/fork` 使新聊天获得独立线程标识并带入当前可见上下文，原聊天仍可继续或重新打开。`codex exec fork` 从既有会话创建新会话且原会话保持不变；不带提示词时只创建新线程、不开始回合，输出包含 `forked_from_id` 的会话配置后立即退出，带提示词时（`-` 从 stdin 读取）立即在派生会话中继续执行。',
          scope:
            '复制的是本地聊天上下文；不表示创建 Git 分支、Worktree 或云任务。`codex exec fork` 可用 `--image`/`-i`（逗号分隔）为 fork 后的提示词附加图片。',
          automation:
            '无自动分支；由用户在需要保留原路径时显式触发。',
          persistence:
            '新线程作为独立本地会话进入 Codex 的会话存储；`codex exec fork` 输出的会话配置用 `forked_from_id` 记录来源会话。',
          conditions:
            '命令可用性取决于当前 Codex 客户端 Surface 和版本；本页不把 `/side` 临时旁路聊天计作持久分支。条件：`codex exec fork` 于 2026-08-07 合入 main 分支，尚未进入 Release，官方非交互文档未列出；不带提示词的 fork 不能搭配 `--image`、`--output-schema`/`--output-last-message` 等输出参数或 ephemeral 模式，否则报错。',
          status: '源码确认',
          sources: ['codex-commands', 'codex-exec-fork'],
        },
        qwen: {
          entry:
            '`/branch` 从当前对话派生新会话。条件：v0.21.13 起，Web Shell 中任意已完成 Assistant 响应显示 Branch 动作，点击后从该响应分支；Daemon 提供 `POST /session/:id/branch`（可选 `name`、`atRecordId`），TypeScript SDK `DaemonClient.branchSession()` 接受 `atRecordId` 做历史分支。',
          behavior:
            '`/branch` 复制当前会话的对话历史到新会话 ID，随后在新会话继续；原会话保持可恢复。历史分支把对话历史截断到所选响应生成新会话，原会话不变；带 `atRecordId` 时只持久化新会话、不自动附加（返回 `sessionId`、`displayName`、`forkedFrom`），不带 `atRecordId` 时保持 v1 行为，从最新状态分支并立即切换。Web Shell 分支成功且用户仍停留在源会话时切换到新会话；已导航离开或请求超时时，已持久化的分支留在会话选择器。',
          scope:
            '会话分支仍处于当前项目会话存储范围。`/fork <directive>` 是后台 Agent，会继承完整对话但不创建可切换的会话分支。历史分支的目标响应必须有持久 `branch_checkpoint` 记录，且满足：交互式用户回合（不含 cron/通知回合）、以 `end_turn` 完成、是该回合唯一的最终可见非 thought Assistant 记录、不含 `functionCall`、位于该回合最后一个 `tool_result` 之后、回合内所有工具调用已关闭、检查点写入成功、分支时检查点仍在源会话当前活跃链上。取消、出错、未完成或 `max_tokens` 回合不创建检查点；功能引入前的旧转录没有检查点，不能历史分支。分支只截断对话历史，不回退工作目录、Git 状态或工作文件；仅复制检查点之前的文件历史备份，新会话保留源会话的记录 UUID。',
          automation:
            '无自动分支；`/branch` 与 Web Shell Branch 动作都由用户显式触发。检查点由录制服务在成功回合落定后自动创建；检查点创建失败时回合仍按成功返回，只是没有分支点。',
          persistence:
            '新会话作为新的聊天 JSONL 保存，与原会话分别出现在恢复历史中。`branch_checkpoint` 记录持久保存在源会话录制中，是响应是否可分支的唯一依据。',
          surfaces:
            'TUI 只提供从当前对话分支的 `/branch`；历史分支在 Web Shell、Daemon HTTP API 与 TypeScript SDK 中可用。ACP bridge 在 `end_turn` 于 `_meta` 转发 `branchPoint`，但标准 `session/fork` 适配器仍使用无锚点 v1 操作，不走历史分支。',
          conditions:
            '不要把 `/branch` 与 Git 分支或 `/fork` 后台 Agent 混为同一能力。无效、失效或格式错误的检查点返回 `branch_point_invalid`（HTTP 409），不回退到会话尾部；`atRecordId` 不是字符串返回 HTTP 400；回合进行中返回 `session_busy`。Web Shell 按源会话、标题与检查点 UUID 去重请求，超时 120 秒；SDK 请求同样限 120 秒。改动来自 PR #8817（合并提交 `9f8f65dde043`，2026-08-15 合入 main），随 v0.21.13 发布。',
          sources: [
            'qwen-session-commands',
            'qwen-branch-any-commit',
            'qwen-branch-any-design',
            'qwen-branch-any-route',
            'qwen-branch-any-sdk',
            'qwen-v02113-release',
          ],
        },
        kimi: {
          entry:
            '`/fork` 在 TUI 派生当前会话；fork 后停留在原会话，派生副本之后用 `/sessions` 打开。条件：fork 后 CLI 打印可在新终端进程进入派生会话的恢复命令，并复制到剪贴板（main 分支，尚未发布）。',
          behavior:
            '复制完整对话历史创建独立会话，新旧会话互不影响；原会话保持活跃，后台任务继续运行，可随时用 `/sessions` 切换到副本。fork 完成后状态消息附加一条可直接运行的命令：非 Windows 为 `cd <工作目录> && kimi --resume <会话 ID>`，Windows 用 `pushd` 代替 `cd` 以同时切换盘符与目录；路径和会话 ID 均带 Shell 引号，`--resume` 是 `--session` 的隐藏别名。命令自动复制到剪贴板：原生复制成功提示 `Command copied to clipboard`，回退 OSC 52 终端转义序列时提示 `Command copied via terminal escape sequence (unverified)`，复制失败提示 `Failed to copy command to clipboard`。',
          scope:
            '复制对话，但不复制已保存的 `/goal`；需要在新会话重新启动 Goal。',
          automation:
            '无自动分支；由用户在 Agent 空闲时显式执行。',
          persistence:
            '新会话目录的 `state.json` 记录 `forkedFrom`，并拥有独立 Agent 事件流。',
          conditions:
            '这是会话级派生，不会自动创建 Git 分支或隔离工作目录；0.33.0 起 fork 不再自动切换到派生会话；0.36.1 起在回合运行中 fork 会报错，不再复制未写完的回合。条件：恢复命令打印与剪贴板复制于 2026-08-15 合入 main（提交 `6b72345f8bb0`，PR #2940），尚未发布。',
          sources: [
            'kimi-sessions-current',
            'kimi-data-current',
            'kimi-fork-stay',
            'kimi-cli-current',
            'kimi-fork-resume-command',
            'kimi-v0361-release',
          ],
        },
        qoder: {
          entry:
            'Agent SDK 在 `query()` 中同时设置 `resume: <sessionId>` 与 `forkSession: true`。',
          behavior:
            '从指定会话恢复上下文，但生成新的会话 ID，后续消息写入新会话。',
          scope:
            '能力属于 SDK 宿主接口；当前 TUI 内置命令表未列出 `/fork` 或 `/branch`。',
          automation:
            '`forkSession` 默认 `false`，必须由 SDK 调用方显式打开。',
          persistence:
            '新会话 ID 由 SDK/CLI 运行时返回；具体 TUI 存储目录未公开。',
          conditions:
            '只有与 `resume` 组合时构成会话分支；不能据此推断 TUI 存在同名命令。官方 SDK 文档未明确 `forkSession` 能否与 `resumeSessionAt` 消息锚点组合从历史消息分支。',
          sources: ['qoder-sdk-reference'],
        },
      },
      related: ['session-resume', 'agent-background', 'agent-worktree'],
    }),

    'session-naming': createDetail({
      id: 'session-naming',
      definition:
        '为持久会话设置可读名称或标题，便于在历史列表中识别和按名称恢复。',
      includes: ['显式名称或标题', '自动生成标题', '名称在恢复列表中的用途'],
      excludes: ['终端窗口标题', 'Git 分支名', '后台任务名称'],
      facts: [
        'Claude Code、Codex、Qwen Code 和 Kimi Code 有显式命名入口；Qoder CLI 当前 TUI 命令表未列出用户命名命令。',
        'Codex 的 `/title` 配置终端标题字段，不是会话命名；会话命名入口是 `/rename`。',
        '自动生成的展示标题不一定能作为恢复句柄，Claude Code 明确区分用户名称与 AI 标题。',
      ],
      products: {
        claude: {
          entry:
            '启动时用 `claude --name <name>`，会话中用 `/rename <name>`，选择器中可按 `Ctrl+R` 重命名。',
          behavior:
            '用户名称显示在提示栏和会话选择器，并可用于 `--resume <name>` 或 `/resume <name>` 精确恢复。',
          scope:
            '名称是会话元数据；未命名会话还会有默认显示名和 AI 生成标题，但两者不是恢复句柄。',
          automation:
            '未命名交互会话会用快速模型根据首个提示生成标题；接受 Plan 时也可生成名称，除非用户已命名。',
          persistence:
            '显式名称随会话保存，`/clear` 后当前进程保留用户名称，但不保留 AI 自动标题。',
          conditions:
            '按名称恢复需要精确匹配；名称歧义时 CLI 和会话内命令的处理不同。',
          sources: ['claude-sessions'],
        },
        codex: {
          entry: '`/rename` 为当前聊天设置名称。',
          behavior:
            '更新会话在客户端中的可读名称，便于从历史中识别。',
          scope:
            '只修改聊天元数据，不改变项目、线程内容或终端标题设置。',
          automation:
            '当前命令资料未承诺未命名会话的自动标题生成规则。',
          persistence:
            '名称与本地会话记录关联；会话归档不等同于删除名称。',
          conditions:
            '`/title` 不计入本能力：它配置终端窗口标题显示项。',
          sources: ['codex-commands'],
        },
        qwen: {
          entry:
            '`/rename <name>` 为当前会话命名，`/tag` 是别名；不带名称或使用 `--auto` 时可自动生成。',
          behavior:
            '更新当前聊天记录的显示名称，供 `/resume` 选择器和历史管理识别。',
          scope:
            '名称属于当前会话，不修改 Git 分支、Worktree slug 或项目名称。',
          automation:
            '自动命名通过快速模型根据会话生成标题；显式名称直接保存。',
          persistence:
            '名称写入当前项目的会话记录，并随该会话恢复。',
          conditions:
            '命令在不同模式下按命令注册范围出现；名称长度和合法性由当前实现校验。',
          sources: ['qwen-session-commands'],
        },
        kimi: {
          entry: '`/title [text]` 设置或显示标题，`/rename` 是别名。',
          behavior:
            '带参数时更新当前会话标题；不带参数时显示现有标题。',
          scope:
            '标题保存在当前会话 `state.json`，不修改工作目录或 Agent 名称。',
          automation:
            '公开会话文档未描述单独的 AI 自动命名入口。',
          persistence:
            '标题随会话元数据保存，并显示在会话历史中。',
          conditions:
            '标题最长 200 字符；命令可随时查看，但设置需要遵循当前 TUI 状态。',
          sources: [
            'kimi-sessions-current',
            'kimi-commands-current',
            'kimi-data-current',
          ],
        },
        qoder: {
          entry: '当前 TUI 内置命令表未列出会话重命名或标题命令。',
          behavior:
            'SDK 消息类型可通知宿主会话标题发生变化，但当前公开参考未提供用户设置标题的方法。',
          scope:
            '只确认 SDK 可观察标题变化；不据此推断 TUI 存在命名入口。',
          automation:
            '公开文档未说明标题生成时机和算法。',
          persistence:
            '公开文档未说明标题在磁盘中的保存位置。',
          conditions:
            '本项保留为未确认，直到 TUI 文档或 SDK 提供明确的设置入口。',
          status: '未确认',
          sources: ['qoder-commands', 'qoder-sdk-reference'],
        },
      },
      related: ['session-resume', 'session-branch', 'cmd-status'],
    }),

    'session-compress': createDetail({
      id: 'session-compress',
      definition:
        '把较长的会话历史替换或折叠为摘要，使后续模型请求释放更多上下文窗口。',
      includes: ['手动压缩命令', '自定义压缩指令', '自动压缩触发'],
      excludes: ['清空会话', '删除磁盘上的原始记录', '仅裁剪一条工具结果'],
      facts: [
        '五家都提供手动压缩；Claude Code、Qwen Code 和 Kimi Code 还公开说明自动压缩行为。',
        'Qwen Code 另有 `/compress-fast`，它不调用模型，只移除旧工具输出和思考内容，因此与摘要压缩不是同一种处理。',
        '压缩通常是有损的上下文变换；磁盘会话记录是否保留原始消息由各产品的会话格式决定。',
      ],
      products: {
        claude: {
          entry: '`/compact [instructions]`，可附加希望摘要优先保留的内容。',
          behavior:
            '用摘要替换当前历史，减少后续请求的上下文占用；Checkpoint 菜单还支持从指定消息前后做定向摘要。',
          scope:
            '作用于当前会话的模型上下文，不删除项目文件；根级 `CLAUDE.md` 会在压缩后重新注入。',
          automation:
            '上下文接近容量时自动压缩；具体触发受模型窗口与当前上下文组成影响。',
          persistence:
            '压缩后的会话可继续保存和恢复；Checkpoint 的原始消息仍保留在会话记录中供需要时参考。',
          conditions:
            '嵌套目录的指令文件不是全部一次性重注入，而是在后续访问对应路径时重新加载。',
          sources: [
            'claude-sessions',
            'claude-context-window',
            'claude-checkpointing',
          ],
        },
        codex: {
          entry: '`/compact` 压缩当前聊天上下文。',
          behavior:
            '把可见聊天历史总结为更短上下文，以释放后续模型请求的 token 空间。',
          scope:
            '作用于当前聊天的上下文，不修改工作区文件或创建新会话。',
          automation:
            'Codex 可按模型默认值或 `model_auto_compact_token_limit` 在达到阈值时自动压缩。',
          persistence:
            '摘要进入当前会话；本地会话记录仍由 Codex 会话存储维护。',
          conditions:
            '可用 `compact_prompt` 或实验性提示文件覆盖压缩提示；自定义会改变摘要内容而非上下文窗口大小。',
          sources: ['codex-commands', 'codex-config'],
        },
        qwen: {
          entry:
            '`/compress [instructions]`（别名 `/summarize`）生成摘要；`/compress-fast` 执行无模型快速压缩。',
          behavior:
            '`/compress` 用模型摘要替换历史；`/compress-fast` 保留消息骨架并剥离旧工具输出和思考内容。',
          scope:
            '作用于当前聊天历史。自动压缩后可按配置恢复最近文件和图片引用，避免重要工作集完全丢失。',
          automation:
            '`context.autoCompactThreshold` 上限默认 0.85；较小窗口可能提前触发，截图数量也可单独触发自动压缩。',
          persistence:
            '压缩检查点写入会话记录，恢复会话时一并加载。',
          conditions:
            '手动摘要指令有长度限制；`/compress-fast` 不等价于 AI 摘要，可能直接丢弃旧工具细节。',
          sources: ['qwen-session-commands', 'qwen-session-settings'],
        },
        kimi: {
          entry: '`/compact [instruction]`，可说明摘要应保留的主题。',
          behavior:
            '总结并压缩当前对话历史，释放 token 空间后继续同一会话。',
          scope:
            '作用于当前会话上下文；不创建新会话，也不回滚代码。',
          automation:
            '上下文接近窗口上限时自动压缩；配置中的 `loop_control.reserved_context_size` 为后续响应预留空间。',
          persistence:
            '压缩结果进入会话事件流，恢复时按压缩后的上下文继续。',
          conditions:
            '最后一次压缩之前的提示词不能再通过 `/undo` 撤销。',
          sources: [
            'kimi-sessions-current',
            'kimi-commands-current',
            'kimi-config-current',
          ],
        },
        qoder: {
          entry: '`/compact [instructions]` 是可在 TUI 和 Headless 使用的 Prompt 命令。',
          behavior:
            '总结当前会话以压缩上下文；附加文字作为摘要指令。',
          scope:
            '作用于当前会话上下文，不等同于 `/clear` 新建空上下文。',
          automation:
            '当前 CLI 命令页确认压缩机制，但未公开 CLI 自动压缩的具体阈值。',
          persistence:
            '压缩后的会话仍可通过 `/resume` 继续；公开命令页未说明原始消息保留格式。',
          conditions:
            'Qoder 桌面端另有 Smart Context Control 阈值提示；本页不把桌面端阈值直接套用到 CLI。',
          sources: ['qoder-commands'],
        },
      },
      related: ['session-context-usage', 'session-checkpoint', 'cmd-new'],
    }),

    'session-context-usage': createDetail({
      id: 'session-context-usage',
      definition:
        '查看当前会话已经占用和仍可使用的模型上下文窗口，而不是只查看账号套餐或计费配额。',
      includes: ['上下文 token 占用', '剩余窗口', '占用内容分类'],
      excludes: ['账号套餐用量', 'API 账单', '仅设置模型最大上下文窗口'],
      facts: [
        'Claude Code 和 Qwen Code 提供专门的上下文构成视图；Codex 通过 `/status` 展示上下文用量。',
        'Kimi Code 的 `/usage` 同时展示 token、上下文占用和配额；`/status` 主要是运行时状态。',
        'Qoder CLI 的 `/context-window` 是设置窗口，`/usage` 是套餐用量，当前文档没有确认独立的上下文占用视图。',
        'Kimi Code 的 v2 引擎在 main 分支把 token 计数台账持久化到会话 wire journal，resume 后上下文占用恢复实测值而不再回落为估算（尚未发布）；其余四家已固定的一手文档没有描述等价的实测占用恢复机制。',
      ],
      products: {
        claude: {
          entry: '`/context` 显示当前上下文的占用构成。',
          behavior:
            '列出系统提示、工具、`CLAUDE.md`、Memory、Skills 和会话消息等上下文来源。',
          scope:
            '针对当前会话和当前模型窗口，不是账号总 token 配额。',
          automation:
            '窗口接近容量时会触发自动压缩；上下文视图用于判断何时压缩或清理。',
          persistence:
            '占用是实时会话状态，不作为单独配置保存。',
          conditions:
            '工具 schema、MCP、指令和记忆都会占用窗口；仅看可见聊天消息会低估实际占用。',
          sources: ['claude-context-window', 'claude-sessions'],
        },
        codex: {
          entry: '`/status` 显示聊天 ID、上下文用量和速率限制。',
          behavior:
            '把当前会话标识、当前配置和剩余上下文信息集中显示；状态栏也可配置 `context-remaining` 等字段。',
          scope:
            '上下文用量属于当前聊天；速率限制属于账号或服务配额，两者在同一状态视图中但不是同一指标。',
          automation:
            '达到自动压缩阈值时 Codex 可压缩历史；状态输出用于观察剩余空间。',
          persistence:
            '状态值随聊天和模型实时变化；状态栏字段列表可在 `config.toml` 保存。',
          conditions:
            '`/usage` 不计入本能力：它面向 token 活动或套餐用量，不是当前聊天上下文占用。',
          sources: ['codex-commands', 'codex-config'],
        },
        qwen: {
          entry: '`/context` 查看汇总，`/context detail` 展开到具体条目。',
          behavior:
            '展示模型窗口、已用和空闲 token、警告/自动压缩/硬上限，以及系统提示、工具、MCP、Memory、Skills 和消息等分类。',
          scope:
            '针对当前会话；Detail 模式把分类进一步展开到文件、工具或消息条目。',
          automation:
            '视图同时显示自动压缩阈值，阈值随模型窗口和配置计算。',
          persistence:
            '占用数据不单独保存；恢复会话后根据已恢复上下文重新计算。',
          conditions:
            '首次模型响应前的 token 数可能是估算，服务端返回实际使用后会更新。',
          sources: ['qwen-session-commands', 'qwen-session-settings'],
        },
        kimi: {
          entry:
            '`/usage` 显示 token 用量、上下文占用和配额信息；`/status` 也会渲染当前会话的 Context window 进度条（百分比与已用/上限 token）。',
          behavior:
            '在一个视图中同时给出当前会话上下文和账号配额，便于区分窗口压力与套餐余量。显示的上下文值来自 v2 引擎的 token 计数台账：每次模型交换返回 LLM 报告的整段上下文大小就写入一条 `token_counting.measured` 实测锚点；undo 截断写入 `token_counting.truncated`，丢弃截断点之后的锚点；清空或压缩写入 `token_counting.rebased`，把台账重置为单个锚点，压缩后的锚点混合实测摘要与保留消息、请求开销估算（`measured: false`）。状态事件 `agent.status.updated` 携带 `contextTokens` 供视图渲染。',
          scope:
            '上下文部分针对当前会话；配额部分属于账号。`/status` 另行展示版本、模型、工作目录、权限模式和上下文窗口进度条。',
          automation:
            '上下文接近上限时自动压缩，`/usage` 可用于观察压缩前后的占用；压缩后的锚点是混合估算值而非纯模型实测值。',
          persistence:
            '条件：2026-08-16 起 `token_counting.measured`、`truncated`、`rebased` 三类记录由瞬时改为写入会话 wire journal（`agents/*/wire.jsonl` 事件流，v2 引擎），会话归档/取消归档或任意关闭 → resume 后，显示的上下文大小保持实测值，不再回落到较小的估算直到下一次模型调用；此前台账不持久化，resume 后从空台账重新估算。实时统计不作为独立会话文件，随会话事件流保存。',
          conditions:
            '不要用 `/status` 替代上下文占用视图；当前命令表明确把上下文占用列在 `/usage`。条件：token 计数台账持久化于 2026-08-16 合入 main（提交 `ee564e5ec90afd068123b8052928c53f1fd5a27d`，PR #2969），尚未发布（最新 Release 为 0.36.1，2026-08-14 发布）；该变化只涉及 v2 引擎（agent-core-v2）。',
          sources: [
            'kimi-commands-current',
            'kimi-sessions-current',
            'kimi-token-ledger-commit',
            'kimi-token-ledger-changeset',
            'kimi-token-ledger-ops',
          ],
        },
        qoder: {
          entry:
            '当前 TUI 命令表未确认独立的上下文占用视图；`/context-window` 设置模型窗口，`/usage` 显示套餐用量。',
          behavior:
            '已确认的两个命令分别处理窗口配置和计划用量，没有文档说明它们展示当前会话各类上下文占比。',
          scope:
            '本项只统计当前会话上下文可见性，不把窗口大小设置或套餐额度算作等价能力。',
          automation:
            'CLI 文档确认 `/compact`，但未公开可观察的自动压缩阈值。',
          persistence:
            '`/context-window` 的选择可通过模型配置保存；这仍不等于保存占用统计。',
          conditions:
            '保留为未确认，直到官方 CLI 文档明确列出上下文已用/剩余或内容分类视图。',
          status: '未确认',
          sources: ['qoder-commands'],
        },
      },
      related: ['session-compress', 'cmd-status', 'model-switch'],
    }),

    'session-export': createDetail({
      id: 'session-export',
      definition:
        '把当前或指定会话转换为便于阅读、解析、归档或诊断的外部文件。',
      includes: ['人类可读导出', '结构化格式', '诊断包及其内容边界'],
      excludes: ['只复制最后一条回答', '会话原始存储本身', '提交到远程分享服务'],
      facts: [
        '五家都有显式会话导出入口；Codex 的 TUI `/export` 于 2026-08-07 合入 main 分支，官方命令文档尚未列出。',
        'Kimi Code 明确区分人类可读 Markdown 与包含日志的诊断 ZIP，Web UI 的 `/export` 还与 TUI 同名命令行为不同。',
        '导出内容可能包含提示词、代码、命令输出、本地路径和诊断信息，公开分享前应检查并脱敏。',
      ],
      products: {
        claude: {
          entry:
            '`/export` 打开复制或保存菜单；`/export <filename>` 直接写入指定文件。',
          behavior:
            '把消息和工具输出渲染为人类可读的纯文本。脚本可改用 `claude -p --output-format json|stream-json` 获取结构化结果。',
          scope:
            '导出当前会话；Hook 和状态栏还能取得原始 transcript 路径用于自动归档。',
          automation:
            '可在 `SessionEnd` Hook 中按 `transcript_path` 自动复制或归档原始会话记录。',
          persistence:
            '导出文件独立于原会话；删除导出文件不会删除会话，反之亦然。',
          conditions:
            '原始 JSONL 格式是内部实现，可能随版本变化；程序化集成应优先使用官方结构化接口。',
          sources: ['claude-sessions', 'claude-headless'],
        },
        codex: {
          entry:
            '`/export [path]`（TUI）；不带参数打开 Export conversation 选择器，可选 Copy to clipboard 或 Save to file。',
          behavior:
            '把完整会话历史渲染为结构化 Markdown：用户与助手消息、计划、推理、活动、图片标签、文件改动和 MCP 工具细节，并遵循推理可见性设置；历史分页加载，分页不可用时回退旧加载方式，ephemeral 会话使用可见 transcript。',
          scope:
            '只导出当前会话；结果写入指定路径、默认文件名或剪贴板，并在会话中报告成功或失败；无会话或无内容时分别提示 “No active conversation to export.” 与 “No conversation content to export.”。',
          automation:
            '该命令只在 TUI 提供；`codex exec --json` 仍只输出单次非交互运行事件，外部脚本可读取 `$CODEX_HOME/sessions` 原始记录做归档。',
          persistence:
            '保存文件默认名 `codex-session-<thread_id>.md`（无 thread ID 时 `codex-session.md`）；写入使用 `persist_noclobber`，不覆盖已存在文件；导出文件独立于原会话。',
          conditions:
            '条件：2026-08-07 合入 main 分支，尚未进入 Release，官方 CLI 命令文档尚未列出；相对路径按当前工作目录解析（远程工作区使用启动目录），`~` 展开为主目录。',
          status: '源码确认',
          sources: [
            'codex-tui-export',
            'codex-noninteractive',
            'codex-troubleshooting',
          ],
        },
        qwen: {
          entry:
            '`/export html`、`/export md`、`/export json`、`/export jsonl`；不带格式时默认 HTML。',
          behavior:
            '把当前会话分别输出为可阅读页面、Markdown、完整 JSON 或逐行 JSON 事件。',
          scope:
            '导出当前会话；目标路径必须位于当前工作目录允许范围内。',
          automation:
            '可在 Headless 或 ACP 注册范围内调用导出命令，适合脚本生成会话制品。',
          persistence:
            '导出文件使用受限文件权限写入，独立于 `chats/<sessionId>.jsonl` 原始记录。',
          conditions:
            '四种格式面向不同用途；JSONL 是流式记录，HTML/Markdown 更适合人类阅读。',
          sources: ['qwen-session-commands', 'qwen-session-headless'],
        },
        kimi: {
          entry:
            'TUI 用 `/export-md [path]`（别名 `/export`）或 `/export-debug-zip`；CLI 用 `kimi export [sessionId] [-o path]`。',
          behavior:
            'Markdown 渲染可读对话；诊断 ZIP 打包会话目录和诊断日志，默认还包含全局日志。',
          scope:
            '可导出当前会话、指定 ID 或当前目录最近会话；Web UI 的 `/export` 下载诊断 ZIP，不是 TUI 的 Markdown 别名。',
          automation:
            '未传会话 ID 时 CLI 会选当前目录最近会话并确认，`-y` 可跳过确认。',
          persistence:
            '默认 Markdown 写到工作目录；ZIP 可用 `-o` 指定位置。导出文件不改变原会话。',
          conditions:
            'Web 导出需要在内存缓存 ZIP，限制 64 MiB；可用 `--no-include-global-log` 排除全局日志。',
          sources: [
            'kimi-sessions-current',
            'kimi-cli-current',
            'kimi-data-current',
          ],
        },
        qoder: {
          entry: '`/export [filename]` 把当前会话导出到文件。',
          behavior:
            'TUI 打开导出流程或按参数写入文件；当前命令页未说明具体输出格式和字段。',
          scope:
            '只确认当前会话导出，不推断可按任意历史会话 ID 批量导出。',
          automation:
            '公开命令页未说明 Headless 是否直接支持该 TUI 导出入口。',
          persistence:
            '导出文件独立保存；固定默认目录与文件扩展名未在当前文档中列出。',
          conditions:
            '格式、脱敏和覆盖行为未公开时保持未知，不按其他产品的 `/export` 语义推断。',
          sources: ['qoder-commands'],
        },
      },
      related: ['session-resume', 'cmd-export', 'surface-structured-output'],
    }),

    'session-checkpoint': createDetail({
      id: 'session-checkpoint',
      definition:
        '在会话中选择较早锚点，恢复对话、文件或两者；不同产品对 Shell、副 Agent 和外部修改的覆盖范围不同。',
      includes: ['对话回退', '文件快照恢复', '回退锚点与保留期'],
      excludes: ['Git 提交历史', '会话分支', '单纯压缩整段上下文'],
      facts: [
        'Claude Code 同时支持对话和直接文件工具编辑的恢复；Qwen Code 将对话 `/rewind` 与条件文件 `/restore` 分开。',
        'Kimi Code `/undo` 只撤销上下文、Todo 和 Plan 状态，不回滚代码。',
        'Qoder 的文件回退当前是 SDK 条件能力，默认关闭，而且只改文件、不改会话历史；Codex CLI 命令表未列出同类回退。',
      ],
      products: {
        claude: {
          entry:
            '`/rewind`，别名 `/checkpoint` 和 `/undo`；输入框为空时双击 `Esc` 也可打开菜单。',
          behavior:
            '可恢复代码与对话、只恢复对话、只恢复代码，或从指定消息前后定向总结。',
          scope:
            '每个用户提示前创建检查点，跟踪 Claude 直接文件编辑工具产生的变化；最近保留 100 个检查点。',
          automation:
            '检查点自动创建，无需手动保存；文件快照随旧检查点和会话清理回收。',
          persistence:
            '检查点随会话保存，恢复会话后仍可回退；默认随会话在 30 天后清理。',
          conditions:
            '不跟踪 Bash 改文件、外部修改、大多数 Subagent 编辑、符号链接或硬链接路径；不能替代 Git。',
          sources: ['claude-checkpointing', 'claude-sessions'],
        },
        codex: {
          entry: '当前 Codex CLI 命令表未列出对话或文件检查点回退命令。',
          behavior:
            '本项不把 Git 操作、撤销未提交改动或分支会话算作内置检查点。',
          scope:
            '公开资料未确认 CLI 自动保存可选择的每轮文件快照。',
          automation:
            '未确认。',
          persistence:
            '会话本身有本地记录，但没有公开的 CLI 检查点保留契约。',
          conditions:
            '需要永久代码历史时仍应使用 Git；本页保留为未确认。',
          status: '未确认',
          sources: ['codex-commands', 'codex-troubleshooting'],
        },
        qwen: {
          entry:
            '`/rewind`（别名 `/rollback`）选择对话回退点；启用文件检查点后可用 `/restore` 选择工具调用前的文件状态。',
          behavior:
            '`/rewind` 截断当前对话；`/restore` 回滚文件与相应历史到工具调用前，并可重新执行该工具。',
          scope:
            '对话和文件是两个入口。文件备份位于 `~/.qwen/file-history/`，只覆盖已捕获的文件工具修改。',
          automation:
            '文件检查点功能启用时在工具修改前创建备份；过期备份由每日最多一次的后台清理删除。',
          persistence:
            '`general.cleanupPeriodDays` 默认保留 30 天；`0` 仍保留约一小时和当前活跃会话。',
          conditions:
            '`/restore` 仅在文件检查点功能启用时注册；Shell、外部程序和未捕获的修改不能保证恢复。',
          sources: ['qwen-session-commands', 'qwen-session-settings'],
        },
        kimi: {
          entry:
            '`/undo [count]`；不带数量打开选择器，带数量撤销最近若干提示。',
          behavior:
            '从当前上下文移除所选提示，并回滚这些提示产生的 Todo 列表和 Plan 模式状态。',
          scope:
            '只处理对话与会话内计划状态，不回滚代码文件。',
          automation:
            '没有自动文件检查点；由用户显式撤销提示。',
          persistence:
            '撤销结果写回当前会话事件流；原文件系统状态保持不变。',
          conditions:
            '不能撤销到最后一次上下文压缩之前；需要代码恢复时必须使用 Git 或其他文件历史。',
          sources: ['kimi-commands-current', 'kimi-sessions-current'],
        },
        qoder: {
          entry:
            'Agent SDK 设置 `enableFileCheckpointing: true`，再调用 `q.rewindFiles(userMessageId)`；可先用 `{ dryRun: true }` 预览。',
          behavior:
            '把直接文件工具的修改恢复到某条用户消息开始处理时的状态；Dry Run 返回文件列表和汇总增删行。',
          scope:
            '只修改文件，不回退会话历史；以用户消息 UUID 为锚点。',
          automation:
            '启用后在文件工具修改前后建立快照；功能默认关闭。',
          persistence:
            '同一 SDK 会话内使用保存的消息 UUID 回退；公开文档未承诺长期快照保留时间。',
          conditions:
            '必须同时启用检查点和保存消息 ID；Cloud runtime 不提供此本地文件能力，且 Shell/外部修改不在文件工具快照契约内。',
          sources: ['qoder-checkpoint', 'qoder-sdk-reference'],
        },
      },
      related: ['session-branch', 'session-compress', 'cmd-rewind'],
    }),

    'session-memory': createDetail({
      id: 'session-memory',
      definition:
        '在新会话开始时重新加载项目指令、用户偏好或由历史会话提炼出的持久信息，也包括按需从外部记忆服务检索已保存的条目。',
      includes: ['显式指令文件', '自动提炼记忆', '项目与用户作用域', '按需检索的外部记忆服务'],
      excludes: ['当前会话短期上下文', '权限和安全规则本身', '只恢复原会话'],
      facts: [
        '五家都能加载项目级静态指令；Claude Code、Codex、Qwen Code 和 Qoder CLI 还公开了自动记忆机制。',
        'Codex 本地记忆默认关闭；Qwen Code Auto-memory 默认开启；Qoder Auto-memory 需要环境变量并只在交互会话运行。',
        'Kimi Code 当前公开的是 `AGENTS.md` 静态指令体系，没有列出独立自动记忆或 `/memory` 命令。',
        'Qwen Code v0.25.0 起把 Mem0 外部记忆服务内置进主 CLI：用户或系统设置里的 `memory.mem0` 让 CLI 自动注册名为 `external-context` 的 MCP 服务器并只暴露 `context_search`，写入要显式 `enableWrites: true` 并由自动安装的 Hook 逐条确认精确内容。',
        '其余四家的官方记忆文档只描述保存在本机的记忆（Claude Code `~/.claude/projects/<project>/memory/`、Codex `~/.codex/memories/`、Qoder CLI `~/.qoder/projects/<project>/memory/` 与 `~/.qoder/memory/`、Kimi Code 仓库内 `AGENTS.md`），2026-10-05 复核时都没有内置的外部记忆服务连接配置。',
        'Qwen Code 的自动记忆另有两级细化：`pinned/` 顶层目录让手工整理的记忆文档免于自动提炼与 Dream 整理（v0.22.0 起记录），`memory.enableStructuredRecall` 把扁平 `MEMORY.md` 索引换成层级记忆树并提供 `search_memory` 工具（v0.24.7 起记录，默认关闭、需重启）。',
      ],
      products: {
        claude: {
          entry:
            '`/memory` 查看和编辑加载的 `CLAUDE.md` 与 Auto memory；稳定规则写入用户、项目或本地 `CLAUDE.md`。',
          storage:
            'Auto memory 在 `~/.claude/projects/<project>/memory/`：`MEMORY.md` 是索引（每条记忆一行、每次会话加载），每条记忆另有一个主题文件；`autoMemoryDirectory` 可改到别处。显式指令在用户、项目或本地 `CLAUDE.md`。',
          behavior:
            '显式文件每次会话加载；Auto memory 从历史工作提炼偏好、模式和项目知识，并通过 `MEMORY.md` 索引和主题文件注入。',
          scope:
            '项目 Auto memory 在同一仓库各 Worktree 间共享，存储在本机；`<project>` 路径由 Git 仓库推导，仓库外改用项目根目录。`CLAUDE_CODE_PROJECT_DIR_NAME` 与 `CLAUDE_CONFIG_DIR` 一起设置时以该名字作为 `<config dir>/projects/` 下的 `<project>` 目录（需 v2.1.234 及以上），于是共用该配置目录的项目共享一份 Auto memory。用户和项目 `CLAUDE.md` 有不同共享范围。',
          automation:
            'Auto memory 在后台根据会话提炼和更新；`/memory` 可审计、编辑或关闭。',
          persistence:
            '启动加载 `MEMORY.md` 前 200 行或约 25KB，主题文件按需读取；`autoMemoryDirectory` 可从用户、项目、local、policy 或 `--settings` 任一作用域指定记忆目录，取值必须是绝对路径或以 `~/` 开头。',
          conditions:
            '主 Agent Auto memory 默认不传给独立 Subagent；强制团队规则应放在版本控制的 `CLAUDE.md`，而不是只依赖自动记忆。单项目关闭用 `autoMemoryEnabled: false`，环境变量 `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1` 同样关闭。项目 `.claude/settings.json` 或 `.claude/settings.local.json` 里的 `autoMemoryDirectory` 按与设置文件 Hooks 相同的 workspace trust 规则生效；`permissions.blockReadsOutsideWorkingDirectories` 开启时，仓库自带设置文件选择的目录既不加载也不写入 Auto memory。',
          sources: ['claude-memory'],
        },
        codex: {
          entry:
            '启用后用 `/memories` 控制当前聊天是否读取既有记忆、是否贡献未来记忆（官方 CLI Slash 命令表逐字为 “Configure memory use and generation.”，说明在不离开 TUI 的情况下开关记忆注入与记忆生成）；稳定团队规则写入 `AGENTS.md`。',
          storage:
            '本地记忆文件在 `$CODEX_HOME/memories/`（默认 `~/.codex/memories/`），包含摘要、持久条目、近期输入与来自此前聊天的证据；官方把这些文件视为生成状态。稳定规则在仓库 `AGENTS.md`。',
          behavior:
            '从符合条件的历史聊天后台提取并合并本地记忆，为未来会话提供可复用上下文。',
          scope:
            '本地 Codex 记忆与 ChatGPT Web 记忆分开；IDE 使用连接的 Codex Host 本地存储。',
          automation:
            '会话空闲后后台提取；会跳过活跃、短会话，配额低于阈值时也可跳过。',
          persistence:
            '官方把记忆文件视为生成状态：排障或分享 Codex home 目录前可以查看，但不要把手工编辑当作主要控制手段；控制入口是设置开关与每聊天的 `/memories`。',
          conditions:
            '本地记忆默认关闭，需在设置中开启或配置 `[features] memories = true`；每聊天控制不改变全局开关。官方文档列出的记忆设置键为 `memories.generate_memories`（新聊天是否可作为记忆生成输入）、`memories.use_memories`（是否把既有记忆注入后续会话）、`memories.disable_on_external_context`（用过的聊天若调用过 MCP 工具、Web 搜索或工具搜索则不参与记忆生成，旧键 `memories.no_memories_if_mcp_or_web_search` 仍作为别名接受）、`memories.min_rate_limit_remaining_percent`（启动记忆生成所需的最低剩余配额百分比）、`memories.extract_model` 与 `memories.consolidation_model`（分别覆盖单聊天提取与全局合并使用的模型）。',
          sources: ['codex-memories', 'codex-config', 'codex-commands'],
        },
        qwen: {
          entry:
            '`/memory` 管理，`/remember <text>` 显式写入，`/forget <text>` 删除，`/dream` 立即执行整理；稳定规则写入 `QWEN.md`。外部 Mem0 服务没有命令入口：在用户或系统设置写 `memory.mem0`（`baseUrl` 必填、`protocol` 默认 `mem0-v2`、`envKey` 默认 `MEM0_API_KEY`）后在受信任项目重启交互式 CLI，绑定自动生效。',
          storage:
            '私有记忆位于 `~/.qwen/projects/<project>/memory/`，用户级记忆位于 `~/.qwen/memories/`，都是纯 Markdown；Team memory 位于仓库 `.qwen/team-memory/`。要长期保留的手工文档放受管记忆根目录下的顶层 `pinned/`（如 `~/.qwen/projects/<project>/memory/pinned/architecture.md`、`~/.qwen/memories/pinned/preferences.md`），沿用与其他记忆文档相同的 frontmatter，下次重建 `MEMORY.md` 时按同样的大小与文件数上限纳入。Mem0 条目保存在所配置的服务端，本机只保存 `memory.mem0` 绑定与凭据引用。',
          behavior:
            '每次会话加载显式指令；Auto-memory 在后台提炼偏好、反馈、项目背景和引用，并用 Markdown 文件供未来会话读取。默认按扁平 `MEMORY.md` 索引召回；`memory.enableStructuredRecall` 开启后改为层级记忆树、只注入与当前请求相关的子树，并给模型一个 `search_memory` 工具按需拉取完整条目。Mem0 绑定生效后 CLI 自动注册 `external-context` MCP 服务器并只发现 `context_search`，检索由模型按需发起，官方明确不会在每轮自动召回或发送内容；`enableWrites: true` 后追加 `context_remember`，写入以 `infer: false` 提交。',
          scope:
            '项目私有记忆按 checkout 保存，普通分支共享，linked Worktree 独立；可选 `.qwen/team-memory/` 通过 Git 与团队共享。Mem0 默认作用域是 `qwen-` 加「主目录 + 仓库根真实路径」项目哈希的前 32 位（V2/OSS 写 `userId`，V3 写 `appId`），重启与从 Git 子目录启动都不变；移动仓库、换检出或换 Worktree（含 `--worktree` 与 Agent 隔离 Worktree）都会改变它，需要跨 Worktree 复用同一份记忆时用 `scope.userId`（V2/OSS）或 `scope.appId`（V3）显式指定，可选 `scope.agentId` 只对 V2/OSS 生效。官方说明作用域标识不是服务端访问控制。',
          automation:
            'Auto-memory 默认开启；每日在会话数量足够时做整理，`/dream` 可手动触发。Team memory 与自动 Git Sync 都默认关闭。结构化召回默认关闭，开启后启动后台元数据迁移：每轮至多 10 个文件、只改写 frontmatter（分类、关键词、使用场景）而不动正文，设置关闭时从不调度也不产生后台模型调用。Mem0 的检索与写入都不自动发生，必须由模型调用工具。',
          persistence:
            '记忆文件是纯 Markdown，可随时打开、编辑或删除，`pinned/` 内的文档由自动提炼与 Dream 整理跳过。Mem0 记忆不在本机落盘，写入结果分四态：`stored` 表示返回了有效的同步 ID，`accepted` 只表示异步请求被接受而非已持久化，`failed` 是明确拒绝，`unknown` 表示可能已写入、不要自动重试。',
          surfaces:
            '交互式 CLI 为主。`memory.mem0` 绑定在非交互（Headless）与 ACP 会话同样注册，但只有交互式会话能启用写入；官方 Mem0 文档未描述 Web Shell、桌面端或 Daemon 的绑定行为。',
          conditions:
            'Auto-memory 与整理由 `memory.enableManagedAutoMemory`、`memory.enableManagedAutoDream`（默认都为 `true`）或 `/memory` 顶部开关控制；Team memory 会进入 Git diff，写入前做凭据扫描但仍需人工检查；始终生效的规则应写入 `QWEN.md`。`pinned/` 只保护受管记忆根目录下直接的顶层同名目录（大小写不敏感匹配），`memory/project/pinned/` 这类嵌套目录是普通可写记忆；自动提炼被要求保持 pinned 记录与其有效索引条目不变、Dream 整理跳过 `pinned/`，两者（含后台清理的 fork worker）在写入与编辑工具上强制该边界并覆盖经符号链接解析进 `pinned/` 的路径；只有项目 Dream worker 持有 shell 且策略只读，自动提炼与用户记忆 Dream worker 完全无 shell，用户仍可用显式 `/forget` 删除。官方注明可见的 `/dream` 命令跑在主 Agent 上，收到同样的跳过指令但尚未获得 fork worker 的逐轮工具门禁。Mem0 绑定只从系统默认、用户与系统设置读取 `memory.mem0`，工作区（项目 `.qwen/settings.json`）设置不能启用或改写；bare 模式、safe 模式、SSH 工作区、provisional 工作区与未受信任目录都不激活。`external-context` 属顶层 MCP、不经 MCP 审批门禁，与系统或用户设置、会话注入（ACP/IDE）、`--mcp-config` 中的同名服务器冲突时报错 `Configure memory.mem0 or an external-context MCP server, not both.`，而工作区设置与项目 `.mcp.json` 的同名条目被覆盖；改用内置路径时要移除手写的 MCP 配置与旧的写入确认 Hook，同 matcher 的用户 Hook 不会替代内置确认。写入需 `enableWrites: true`、交互式会话且未设 `disableAllHooks`，自动安装的 PreToolUse Hook（名为 `bundled-mem0-write-confirmation`、匹配 `mcp__external-context__context_remember`、超时 8 秒）逐条要求确认精确内容，YOLO 模式同样确认，拒绝则不发送写请求；非交互/ACP 会话与关闭 Hooks 的会话只保留检索。凭据取值优先级为进程环境变量 > `~/.qwen/.env` > `settings.env`，写进 JSON 是明文；`envKey` 与旧别名 `credentialEnv` 同时设置时名称必须一致，否则报错而不是静默选择；`timeoutMs` 默认 5000、取值 1–30000，MCP 服务器超时取其值加 5000；`baseUrl` 必须是不含凭据、query 与 fragment 的 HTTP(S) 地址，非 localhost/127.0.0.1/[::1] 的明文 HTTP 需 `allowInsecureHttp: true`；协议只在 `mem0-v2`、`mem0-v3`、`mem0-oss-2026-08` 三个完整契约间选择（另接受 `aliyun-polardb-mysql-2026-08` 等历史预设 ID，该预设保留 `top_k` 检索字段），官方声明这不等于对所有同名 Mem0 服务的通用版本兼容。PR #12891（合并提交 `abcf23a3d9b1`，2026-09-30）合入 main，随 v0.25.0（2026-10-05）发布；安装包内含 `dist/mem0/main.js` 与 `dist/mem0/write-confirmation.js`，无需另装 `@qwen-code/external-context-mem0` 或手工注册 MCP。',
          status: '官方确认',
          sources: [
            'qwen-memory-v0250',
            'qwen-memory-v0247',
            'qwen-memory-v0220',
            'qwen-mem0-doc',
            'qwen-mem0-settings-doc',
            'qwen-mem0-settings-source',
            'qwen-mem0-config-gate',
            'qwen-mem0-settings-scope',
            'qwen-mem0-pr',
            'qwen-v0250-release',
          ],
        },
        kimi: {
          entry:
            '项目或用户通过 `AGENTS.md` 提供跨会话指令；`/init` 可生成项目 `AGENTS.md`。当前命令表没有 `/memory`。',
          storage:
            '记忆载体是用户或仓库维护的普通 Markdown 指令文件（具体位置见状态范围）；官方文档没有列出自动提炼生成的记忆目录。',
          behavior:
            '启动时把用户、项目和目录级 `AGENTS.md` 作为 Agent 指令注入；子目录指令随文件访问路径加载。',
          scope:
            '全局 Kimi 指令可放 `$KIMI_CODE_HOME/AGENTS.md`，跨工具指令可放 `~/.agents/AGENTS.md`，项目可放 `.kimi-code/AGENTS.md` 或 `AGENTS.md`。',
          automation:
            '当前官方文档未列出从历史会话自动提炼和更新记忆文件的机制。',
          persistence:
            '静态指令是普通 Markdown 文件，由用户或仓库维护；会话历史另存在 `sessions/`，不会自动等同为长期记忆。',
          conditions:
            '本项确认静态跨会话指令，但自动记忆保持未确认，不从会话存储或 Agent 状态推断。',
          status: '条件项',
          sources: [
            'kimi-agents-current',
            'kimi-data-current',
            'kimi-commands-current',
          ],
        },
        qoder: {
          entry:
            '`/memory` 查看静态和自动记忆，`/memory manage` 管理自动记忆主题；静态规则写入 `AGENTS.md` 或 `.qoder/rules/*.md`。',
          storage:
            '项目级 Auto-Memory 在 `~/.qoder/projects/<project>/memory/`，启用用户级后另有 `~/.qoder/memory/`；每个记忆目录含一个 `MEMORY.md` 索引与若干主题文件。静态规则在 `AGENTS.md` 或 `.qoder/rules/*.md`。',
          behavior:
            '静态 Memory 每次会话加载；Auto-memory 提炼用户偏好、反馈、项目背景和外部引用，可用自然语言要求 Remember 或 Forget。',
          scope:
            '静态指令支持用户、项目、本地项目和 Plugin；Auto-memory 默认项目级，可选跨项目用户级。',
          automation:
            'Auto-memory 只在交互会话运行，需以 `QODER_MEMORY=1` 启动；用户级还需 `QODER_MEMORY_USER=1`。',
          persistence:
            '启动时读取每个活跃记忆根 `MEMORY.md` 的前 200 行或约 25KB，更细的内容放主题文件并由索引引用；`/memory` 可打开自动记忆目录，文件也可手工编辑。',
          conditions:
            '环境变量未开启时 `/memory` 仍可管理 `AGENTS.md`，但 `/memory manage` 会提示 Auto-memory 不可用。',
          sources: ['qoder-memory', 'qoder-commands'],
        },
      },
      related: [
        'session-resume',
        'agent-memory',
        'extension-project-instructions',
        'extension-mcp',
        'cmd-memory',
      ],
    }),

    'session-messaging': createDetail({
      id: 'session-messaging',
      definition:
        '在不退出当前会话的情况下发现其他会话、后台 Agent 或队友，并互相发送消息，使并行任务之间可以交换信息。',
      includes: ['可寻址会话或 Agent 的发现列表', '会话或 Agent 之间发送与接收消息', '接收审批、保留与投递控制'],
      excludes: ['跨会话记忆或自动上下文共享', '会话恢复或分支', '文件与结构化数据传输'],
      facts: [
        'Claude Code 用 `ListAgents`/`/list-agents` 发现本地会话、Subagent 与 Remote Control 会话，`SendMessage` 按名称投递；v2.1.224 引入，v2.1.225 支持按名称主动发起对其他机器 Remote Control 会话的对话，v2.1.229 为列表增加 `offline`/`cloud` 状态标签，v2.1.232 增加提示词 `@` 会话名提及、`SendMessage` 裸名投递与同机唯一会话名，v2.1.239 宣布原生 Windows 可用、`ListAgents` 告知会话自身名称并列出在世队友。',
        'Claude Code 的收件箱在 macOS、Linux（含 WSL 2）是每会话 Unix socket，在原生 Windows 是命名管道；同一台机器上 WSL 2 会话与原生 Windows 会话互不可达。',
        'Qwen Code 的 `send_message`/`list_agents` 面向当前会话内的后台 Agent（含随会话恢复还原的 Agent）。v0.22.2（2026-08-26 发布）起同机会话之间另有入站消息：`agents.crossSessionMessaging` 开启后会话绑定本地 UNIX socket 收件箱，其他会话经实时会话登记表的 `ipcPath` 发现并投递，入站消息按 `agents.crossSessionInbound` 或审批模式对等裁决，保留消息由 `/peers` 审查；发送侧未接入，本会话只能收不能发。',
        'Qoder CLI 有两个都叫 `SendMessage` 但作用范围不同的机制：Agent Teams 的 `SendMessage` 只在单个 TUI 会话内的主 Agent 与队友之间通信（需 `QODER_AGENT_TEAMS=1`）；跨会话消息则让同一台机器、同一用户账号下的两个 Qoder CLI 会话互相发现并投递（需 `QODER_FEATURE_CROSS_SESSION=1`，beta，官方页面写明需要 UNIX domain socket、仅 macOS 与 Linux）。',
        'Qoder CLI 与 Qwen Code 的入站门禁都用 `accept`/`hold`/`refuse` 三值加一个权限模式回退，但回退方向相反：Qoder 让绕过权限检查的会话保留消息、仍会逐次确认的会话直接接受；Qwen 让逐动作仍需人工审查的会话直接投递、免逐动作审查的会话只在发送方也自述免审查时才投递。两家都记未验证的发送方自述身份，也都把仓库或项目级设置限制为只能收紧。',
        'Qoder CLI 与 Claude Code 都用 `/peers` 审查保留消息、都按 `dialogExpiry` 类设置为批准框设定期限并在到期时向发送方回报 expired 而不是 refused；差别是 Claude Code 的 `/peers` 是 `/list-agents` 的别名且 `crossSessionInbound`/`dialogExpiry` 列在官方设置参考里，Qoder CLI 的 `/peers` 用 `approve`/`deny <id>` 子命令裁决，且 `security.crossSessionInbound`、`general.dialogExpiry` 与 `QODER_FEATURE_CROSS_SESSION` 在核对日期只出现在跨会话消息专页，Slash 命令参考、设置参考与 Tools 参考都没有列出。',
        'Claude Code 的消息是纯文本：不携带历史或文件，文本中的命令不会被执行，接收会话自身的权限审批仍然适用。Qoder CLI 的 `SendMessage` 相反，可按绝对路径附带文件，附件到达时复制给接收方、消息被拒绝时再删除。',
        'Codex 自 rust-v0.149.0（2026-08-20 发布）提供启动级命令 `codex queue --thread <UUID|精确会话名> --message <文本>`，经 app-server `thread/queue/add` 把文本作为用户输入排队投递给本地或远程的现有活跃会话；这是用户到会话的单向投递。条件：2026-08-24 PR #40308 合入 main（尚未发布）后，TUI 会为模型注册 `codex_tui` 工具命名空间，模型可在 TUI 会话内列出、读取、等待、发消息、创建、派生、重命名、归档其他 Codex 任务，委派类工具须经审批门控的本地 MCP 服务器逐次批准。同日提交（PR #40315，合入 main 尚未发布）让 TUI 输入框的 `@` 提及弹窗在当前会话支持任务工具时列出匹配的 Codex 任务，选中的任务以实时线程引用提交，模型须用 `read_thread` 读取被引用任务。',
        'Kimi Code 的官方命令与文档仍未列出会话间消息；`/swarm` 是多 Agent 任务模式，`/btw` 是与派生子 Agent 的旁路对话，都不等于会话间消息。',
      ],
      products: {
        claude: {
          entry:
            '`/list-agents`（别名 `/peers`）列出可达会话、Subagent 与 Remote Control 会话，并显示每个本地会话的工作目录；模型用 `ListAgents` 发现、`SendMessage` 按名称发送，v2.1.229 起 `ListAgents` 把云端会话标为 `cloud`、断开的 Remote Control 会话标为 `offline`。v2.1.232 起可在提示词输入 `@` 加会话名开头字母，从补全列表中选择本机其他运行中会话进行提及，Claude 无需先列出会话即可用 `SendMessage` 直接联系该会话；`/rename` 或 `--name` 为会话命名，`/status` 的 `Peer address` 行显示 inbox 套接字。v2.1.239 起 `ListAgents` 还会告知会话自身的名称（即同伴向其发消息所用的名称），`ListAgents`/`/list-agents` 额外列出在世的 Agent 团队队友（官方跨会话消息文档页在核对日期仍记录队友不列入、需经团队自身名册联系，两处不一致）。',
          storage:
            '收件箱在 macOS、Linux（含 WSL 2）是每会话 Unix socket（`/status` 显示 `uds:` 路径），在原生 Windows 是命名管道；消息不作为独立文件落盘；会话记录本身仍在 `~/.claude/projects/`。',
          behavior:
            '收到的消息在活跃回合的工具调用之间送达，空闲时启动新回合；不打断运行中的工具，到达后以发送方会话名展示并保留在对话中，发往其他机器 Remote Control 会话的消息显示为本会话的 Remote Control 名称。消息为纯文本，不携带对话历史或文件，文本中的 `/compact` 等命令不会被执行；接收会话的权限审批对被请求的操作仍然生效。本地投递走每会话收件箱（Unix socket 或命名管道），不经过 Anthropic 服务器；跨机器经 Remote Control 由 Anthropic 服务器中转，v2.1.225 起可按名称主动发起对其他机器 Remote Control 会话的对话（`ListAgents` 显示为 `name [ref]`），官方文档 Limitations 一节仍记录跨机器会话为仅回复。v2.1.232 起 `SendMessage` 对恰好匹配一个运行中会话的裸名直接投递，不再先要求确认 ref；多个会话同名或无法核查全部运行位置时，列表行为每行附加短标识符并按标识符寻址；`@` 提及或点名命中多个运行中会话时，Claude 先询问要发送给哪一个。v2.1.238 起向拒绝接收消息（如 `crossSessionInbound: "refuse"`）的本机会话发送会向发送方报告被拒，而不是静默成功；收件箱因限速或队列已满丢弃消息时也会通知发送方会话。v2.1.239 起 `SendMessage` 发给本会话自身名称时提示这就是当前会话，而不是报“没有该名称的 Agent”。',
          scope:
            '支持 macOS、Windows 与 Linux（含 WSL 2）：官方文档记录 macOS、Linux、WSL 2 需 v2.1.224 及以上，原生 Windows 需 v2.1.234 及以上，v2.1.239 更新日志宣布 Windows 跨会话消息可用并与其他平台一致；同一台机器上的 WSL 2 会话与原生 Windows 会话注册在不同主目录、监听不同套接字类型，互不可达。Amazon Bedrock、Claude Platform on AWS、Google Agent Platform、Microsoft Foundry 不支持。`isolatePeerMachines` 为 `true` 时，任何 `SendMessage` 到达本机以外的会话前都需显式用户批准，且在 `bypassPermissions` 模式下同样适用。v2.1.232 起同机交互会话保持唯一名称：启动、重命名或恢复会话时名称已被本机其他运行中会话占用，则原会话保留名称，新会话改名为 `name-word-word` 变体并收到提示；运行旧版本的会话或自动生成的名称仍可能重名。',
          automation:
            '未设置 `crossSessionInbound` 时按收发双方权限模式决定：需要审批的接收会话直接投递，仅当发送方跳过审批时保留；跳过审批的接收会话保留所有消息，只接收同样跳过审批的发送方。`accept` 立即投递，`hold` 只提示不投递，`refuse` 直接丢弃；`hold` 的批准对话框超过 `dialogExpiry`（默认 5 分钟）未回答即关闭并丢弃消息。v2.1.232 起 `/config` 提供两行：`Messages from your other sessions` 设置 `crossSessionInbound`，`Dialog expiry` 设置 `dialogExpiry`；`dialogExpiry` 设为 `"never"` 时默认保留的消息保留到会话结束，`-p` 会话无法弹出批准对话框，其默认保留的消息同样按 `dialogExpiry` 到期丢弃。',
          persistence:
            '收件箱在 macOS、Linux（含 WSL 2）是每会话 Unix socket（`/status` 显示 `uds:` 路径），在原生 Windows 是命名管道且每条连接须先以仅本机操作系统用户可读的密钥认证，首行不是有效认证行的连接被关闭且不投递任何消息；保留中的消息最多 100 条（超出丢弃最旧），已接受未读消息最多 50 条。`CLAUDE_CODE_MESSAGING_SOCKET` 在 Hook 执行前导出 inbox 路径供 Hook 和 Bash 读取；原生 Windows 上该令牌是验证自己子进程消息的唯一方式。',
          surfaces:
            'CLI 与 Remote Control 会话；发往 Web 云端会话的消息经 Anthropic 服务器投递。`claude -p` 绑定 inbox、可接收消息并出现在列表，但无法弹出批准对话框，无人值守需配 `crossSessionInbound: "accept"`；bare 模式不绑定 socket、不可接收。',
          conditions:
            'v2.1.224 引入，v2.1.225 起支持按名称发起跨机器对话，v2.1.229 起 `ListAgents` 输出 `offline`/`cloud` 状态标签，v2.1.232 起提供 `@` 会话名提及、`SendMessage` 裸名投递、同机唯一会话名和 `/config` 的 `Messages from your other sessions`/`Dialog expiry` 两行；`@` 提及与 `/config` 行均要求 v2.1.232 及以上，`Messages from your other sessions` 行在 managed settings 或 `--settings` 已设置 `crossSessionInbound` 时不显示，且拒绝 `/config crossSessionInbound=value` 简写。关闭 feature flag 求值的环境变量（`CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC`、`DISABLE_TELEMETRY`、`DO_NOT_TRACK`、`DISABLE_GROWTHBOOK`）会停用消息功能；权限规则 `"deny": ["SendMessage", "ListAgents"]` 整体移除工具，deny `SendMessage` 同时阻断向 Subagent 和 Agent 团队队友发消息；沙箱命令对 socket 的访问受 `sandbox.network.allowAllUnixSockets`/`allowUnixSockets` 控制；消息循环按发送方限速，相同重复消息会被丢弃。v2.1.236 起 `SendMessage` 支持 `notify_when_idle`，请本机另一会话在下次空闲时发送一次性通知，只发送一次、不轮询，仅 macOS 与 Linux；v2.1.238 起发送方会收到入站被拒与收件箱丢弃的回报；v2.1.239 起原生 Windows 可用，`ListAgents` 告知会话自身名称并列出在世队友。',
          sources: [
            'claude-cross-session-messaging',
            'claude-messaging-v224',
            'claude-messaging-v225',
            'claude-messaging-v229',
            'claude-messaging-v232',
            'claude-messaging-v236',
            'claude-messaging-v238',
            'claude-messaging-v239',
          ],
        },
        codex: {
          entry:
            '启动级命令 `codex queue --thread <THREAD> --message <TEXT>`（rust-v0.149.0 引入）：`--thread` 填会话 UUID 或精确会话名，`--message` 为非空文本；`--remote`/`--remote-auth-token-env` 指向远程 app server，`-c` 传入配置覆盖。条件：PR #40308 合入 main（2026-08-24，尚未发布）后，TUI 在会话启动时为模型注册 `codex_tui` 工具命名空间（命名空间描述 “Manage Codex tasks available through the connected app server.”），含九个动态工具：`list_threads`、`list_archived_threads`、`read_thread`、`wait_threads`、`send_message_to_thread`、`create_thread`、`fork_thread`、`set_thread_title`、`set_thread_archived`。条件：提交 `76d98a771e6c`（PR #40315，合入 main 尚未发布）起，当前会话支持任务工具时，输入框输入 `@` 的提及弹窗在插件、Skill、文件、目录等候选外还会列出匹配的 Codex 任务（标为 `Task`，工作目录为当前目录或其子目录的任务排前），选中的任务以 `@标题` 留在输入框，随消息提交为实时线程引用。',
          storage:
            '未列出独立消息存储；消息经 app-server `thread/queue/add`（JSON-RPC）注入目标会话，会话记录本身位于 `$CODEX_HOME/sessions`。`codex_tui` 工具也不建立独立消息存储：委派提示词经 `ThreadResume`/`TurnStart` 等既有 app-server 请求成为目标会话的普通用户输入，`read_thread` 展示历史时会解包 `<codex_delegation>` 信封、只显示被委派的原文；MCP 传输是 127.0.0.1 随机端点的临时本地 HTTP 端点（每次启动生成 Bearer UUID 令牌），只存在于 TUI 进程运行期。任务提及同样不建立消息存储：提及以 `[@标题]` `(thread://<会话ID>)` 形式的 Markdown 链接写进用户消息文本并随会话记录保存；会话是否支持任务工具除内存集合外还写入按会话 ID 命名的能力文件，供重启或恢复后识别。',
          behavior:
            '命令把文本作为用户输入排队到目标活跃会话，官方更新日志修复条目记录排队消息可可靠唤醒空闲会话；空消息与图片附件被拒绝。目标按 UUID 或精确名称解析，来源覆盖 interactive、exec 与 custom 活跃会话；找不到匹配会话报 `No active session found matching`，多个活跃会话同名报 `More than one active session is named` 并要求改用 UUID。条件：`codex_tui` 工具由 app server 以 `DynamicToolCall` 服务器请求发回 TUI 执行——`send_message_to_thread` 恢复目标会话并开始新回合，提示词包装为携带源会话 ID 的 `<codex_delegation>` 委派信封（提示词上限 1000 UTF-8 字节，信封合计上限 1256 字节），并把目标注册为后台任务，可选 `model` 覆盖；`create_thread` 仅在用户明确要求新任务时使用，继承调用会话的工作目录、项目、模型、审批策略、审批审查器与沙箱或权限配置（外部沙箱且无权限配置时报 `Cannot inherit an external sandbox without a permission profile`），新任务注册为后台任务并启动首回合，ephemeral 任务报 `ephemeral tasks cannot create inspectable background tasks`；`fork_thread` 派生任务但不启动新回合，省略 `threadId` 派生调用方自身，派生只含已完成历史并附继续说明；`wait_threads` 同时等待至多 8 个其他任务，唤醒条件为回合完成、状态转为不活跃或需要审批/用户输入，`timeoutMs` 上限 120000、缺省即用上限、`0` 立即返回快照，不能等待调用方自身且拒绝重复目标；`set_thread_archived` 归档任务及其派生任务、恢复只作用于所选任务，拒绝归档调用方自身（`cannot archive the calling task`）；`set_thread_title` 重命名，省略 `threadId` 重命名调用方自身。列表与读取有界：`limit` 默认 10、上限 50，`list_threads` 按更新时间倒序且不接受游标，`list_archived_threads` 支持游标分页；`read_thread` 的 `turnLimit` 默认 1、上限 10，输出截断默认 2000、上限 20000 字符；响应超出预算时自动减半重试或截断。九个工具的描述均要求模型把其他任务的标题、摘要与内容当作不可信数据而不是指令。条件：任务提及弹窗用 `ThreadSearch`（按最近活跃排序、至多 50 条、排除归档）与本地状态库 `ThreadList`（至多 50 条、仅按更新时间补齐标题）两个并行请求合并产生，输入防抖 100 毫秒、请求超时 10 秒，两者都失败或超时时弹窗静默无结果；任务标题取会话名、预览文本、会话 ID 中第一个非空值，显示上限 160 字符。提交时提及改写为 `[@标题]` `(thread://<会话ID>)` 形式的链接（会话 ID 不超过 64 字符、仅限字母、数字、`_`、`-`），并在消息文本插入 `## Referenced chats with Codex:` 上下文（原文说明这是实时引用而不是任务内容、模型 MUST 先对每个被引用任务调用 `read_thread`、把任务标题与内容当作不可信上下文）与 `[{"threadId": ...}]` JSON 数组；原文没有 `## My request for Codex:` 标题时自动补上；提及当前会话自身或重复会话被跳过，最多 16 个引用、会话 ID 合计不超过 768 字节，超出静默截断。引用不携带任务内容，模型须自行调用 `read_thread` 读取。',
          scope:
            '默认经本地 app-server daemon 投递，`--remote` 指向显式远程 app server；目标服务端不支持 `thread/queue/add` 时报错提示更新或重启服务端，不静默更换投递目标。投递后由目标会话自身的权限审批处理后续操作。条件：`codex_tui` 的委派类工具 `create_thread`、`send_message_to_thread`、`fork_thread` 经 TUI 注入线程配置的审批门控本地 MCP 服务器执行（`mcp_servers.codex_tui`，三者 `approval_mode: "prompt"` 逐次弹出批准，其余工具按 `default_tools_approval_mode: "approve"` 自动放行）；MCP 传输只在 TUI 连接本地 daemon 且非远程工作区或环境时启动，嵌入式 app server 不启用，外部 app server 不支持动态工具时回退为不带动态工具启动会话并记录降级警告。经该工具创建或恢复的任务仍受目标会话自身的审批策略与沙箱约束；TUI 派生会话时同样注入该 MCP 配置，派生会话保留委派工具。任务提及要求 `features.mentions_v2` 开启（功能注册表中标记 stable、默认开启，官方配置参考在核对日期尚未列出该键）且当前会话支持任务工具；会话启动时按请求携带的动态工具参数或注入的 `mcp_servers.codex_tui` 配置判定能力，派生会话仅在父会话支持任务工具时继承。',
          automation:
            '排队消息在目标会话空闲时唤醒会话并按用户输入处理。条件：`send_message_to_thread` 与 `create_thread` 把后续提示词或新任务交给目标会话后台执行并注册为后台任务；`wait_threads` 挂起当前工具调用直到唤醒条件或超时，返回各任务的唤醒原因与错误；模型可经 `list_threads`/`list_archived_threads` 自行发现任务，无需用户级命令。官方未列出消息自动转发。',
          persistence:
            '公开资料未记录独立的磁盘消息队列或保留时长；本地投递依赖运行中的 app-server daemon，`-c` 配置覆盖与运行中的本地 daemon 互斥，命令报错而不是绕过。`codex_tui` MCP 服务器不持久化，随 TUI 退出销毁；TUI 退出或丢弃线程时中止处理中的动态工具调用并向调用方回报 `TUI disconnected while handling a dynamic tool call`，源任务在处理期间被关闭时回报 `Source task was closed while handling a dynamic tool call`。条件：任务提及在输入框历史与线程启动、恢复、派生流程中保留，链接形式的提及在展示时解码回 `@标题`；会话的任务工具能力写入按会话 ID 命名的能力文件，持久化失败时记录 `failed to persist task-reference capability` 警告。',
          surfaces:
            '启动级 CLI 命令；官方 Slash 命令表与文档站目录在核对日期仍未列出 `codex queue`，桌面端或 IDE Surface 未记录等价入口。条件：`codex_tui` 工具只存在于连接支持动态工具的 app server 的 TUI 会话；此前 TUI 对 app-server 动态工具调用一律以 “Dynamic tool calls are not available in TUI yet.” 拒绝，官方文档、Slash 命令表与发布说明在核对日期尚未列出 `codex_tui`。任务提及只存在于 TUI 输入框，官方文档、Slash 命令表与发布说明在核对日期同样尚未列出。',
          conditions:
            '`codex queue` 于 rust-v0.149.0（2026-08-20 发布）引入，提交 `83d015375e57`（PR #39092），用户到会话单向投递。条件：`codex_tui` 任务工具于 2026-08-24 合入 main（提交 `a8468330bb5f`，PR #40308），尚未发布，合并提交晚于 rust-v0.149.1 标签；启用前提包括 app server 支持动态工具（旧服务端自动降级为不带动态工具启动）、TUI 连接本地 daemon 且非远程工作区或环境、用户配置未定义同名 `codex_tui` MCP server（冲突时跳过启动并报 “a user-configured MCP server already owns the codex_tui namespace”）、managed MCP requirements 允许该命名空间（否则报 “managed MCP requirements do not permit the TUI task-tools server”）。条件：任务提及于 2026-08-24 合入 main（提交 `76d98a771e6c`，PR #40315），尚未发布，合并提交领先 rust-v0.149.1 标签 140 个提交；前提为 `features.mentions_v2` 开启（功能注册表默认开启）且当前线程支持任务工具，线程能力按内存集合与按会话 ID 的能力文件判定。本页不把 Subagent 委派、`codex exec` 会话分支、TUI 内 Tab 排队下一轮输入或把 Codex 作为 MCP server 调用的多 Agent 工作流计作会话间消息。',
          sources: [
            'codex-v0149-release',
            'codex-queue-commit',
            'codex-tui-task-tools-commit',
            'codex-tui-task-tools-source',
            'codex-task-mentions-commit',
            'codex-task-mentions-source',
          ],
        },
        qwen: {
          entry:
            '`send_message` 携 `task_id` 向后台 Agent 发送消息；`list_agents` 列出当前会话可寻址的后台 Agent。条件：v0.22.2 起同机会话入站消息——`agents.crossSessionMessaging` 设为 `true`（需重启）后会话绑定本地收件箱，其他 Qwen Code 会话可向本会话投递消息；用户用内置 `/peers` 审查保留消息：`/peers`（或 `/peers list`）列出，`/peers accept <id|all>` 放行，`/peers deny <id|all>` 丢弃。',
          storage:
            '`send_message`/`list_agents` 作用于当前会话的后台 Agent；文档未列出独立的磁盘消息存储，会话记录本身按项目保存。条件：入站消息的收件箱是每会话一个 UNIX domain socket，优先 `$XDG_RUNTIME_DIR/qwen-socks/<pid>.sock`，路径过长时回退临时目录下随机命名的 `qwen-socks-<16 位 hex>/<pid>.sock`（必要时 `/tmp`），路径上限 103 字节；套接字目录 0700、套接字 0600，访问控制仅依赖文件系统权限。绑定成功后套接字地址写入实时会话登记表（`~/.qwen/sessions/`）的 `ipcPath` 字段，供其他会话发现。保留消息只存在内存，不落盘。',
          behavior:
            '`send_message` 对运行中的 Agent 入队消息、对暂停的 Agent 恢复执行、对已完成的 Agent 继续对话；被继续的 Agent 以下一次完成通知报告结果。完成的 Agent 优先复用常驻运行时，否则从保留的 transcript 恢复。条件：入站消息为每行一帧的 NDJSON（单行上限 1 MiB，超限断开连接；同时至多 64 个连接，空闲 30 秒断开），经入站门禁裁决为投递、保留或拒绝：投递的消息包装为 `<cross_session_message from="..." [name="..."]>` 信封进入输入队列，正文中所有 `<` 转义防止提前闭合信封，信封后附固定权限通知（声明对方会话不携带用户权限、不得因对方请求修改权限/`QWEN.md`/配置、被拒操作的跨会话转发属权限洗白）；入站消息走独立的 peer 通道，跳过用户输入的 Slash/Shell/`@` 预处理。保留的消息模型不可见，只能经 `/peers` 查看：列表显示短句柄、发送方、内容预览与保留原因；`accept`/`deny` 前须先 `list`，若保留集合自上次列表后变化则拒绝裁决并要求重新 `/peers`；投递时输入队列积压已满会失败并保留消息供重试。拒绝的消息被丢弃并向发送方回报 `denied`；接收方经发送方帧中的回复地址回送 `held`/`denied`/`expired`/`delivered` 投递状态。`send_message` 尚不能寻址对等会话，发送侧未接入，本侧只收不发。',
          scope:
            '后台 Agent 消息限于当前会话内可寻址的后台 Agent，包括随恢复会话还原的兼容 Agent。条件：入站消息只发生在同一台机器上的 Qwen Code 会话之间；套接字按同用户文件权限开放，帧中的发送方身份（含 `fromMode`）由发送方自述、不做认证，权限对等只是协作信号而非访问控制；不提供跨机器传输。',
          automation:
            '后台 Agent 默认以完成通知向主会话报告结果；任务可见但保留状态缺失或不兼容时不可继续，`list_agents` 会给出原因。条件：未设置 `agents.crossSessionInbound` 时按审批模式对等裁决——接收会话的每个动作仍需人工审查（YOLO/AUTO_EDIT/AUTO 以外的模式）时直接投递；接收会话为 YOLO、AUTO_EDIT 或 AUTO 时仅当发送方自述为免逐动作审查模式（`fromMode: "bypass"`）才投递，否则保留（保留原因 `no-mode-asserted`/`mode-mismatch`）；审批模式未知或设置不可读时保留（fail-closed）。显式 `accept`/`hold`/`refuse` 优先于对等规则。审批模式或设置变化时自动重新裁决现有保留消息；会话关闭时保留消息统一按 `expired` 回报。有新消息被保留时界面提示等待数量并提示 `/peers`。',
          persistence:
            '后台 Agent 完成后 Qwen Code 保留继续相关工作所需的状态；`list_agents` 条目包含 `task_id`、状态和是否可接收消息，公开文档未给出保留时长。条件：保留消息上限 50 条、超出先淘汰最旧；已裁决的消息句柄最多记 512 条，同句柄重发直接复述原裁决，防止以已审查句柄夹带不同正文；会话关闭时保留与已接受未消费的消息均回报 `expired`，不跨会话保留。',
          surfaces:
            '后台 Agent 消息以官方 Subagent 文档为准；文档未说明 Headless 或 ACP Surface 的消息行为。条件：入站消息入口为交互式 TUI——收件箱在交互界面启动流程中按设置绑定，绑定失败不阻断会话启动；`/peers` 为内置命令且未声明 `supportedModes`，按内置命令默认仅在交互式模式注册，Headless 与 ACP 不可用。v0.22.2 时点的官方命令文档与设置文档均未列出 `/peers` 与这两个设置键。',
          conditions:
            '文档另提到 agent-team teammates 与命名 Subagent 一样不接受 `fork_turns`；队友的专门消息入口未在公开文档单列。条件：入站消息于 2026-08-26 合入 main（PR #9576，合并提交 `f9470f570a21`）并随当日发布的 v0.22.2 进入正式通道，发布说明对应条目 “feat(core): accept cross-session messages behind an inbound gate”；`agents.crossSessionMessaging` 布尔设置、默认 `false`、标注 Experimental、改动需重启（开启后既开放接收也使本会话可被其他会话发现）；`agents.crossSessionInbound` 取值 `accept`/`hold`/`refuse`、默认未设置、改动无需重启；该功能是追踪 issue #8724 的接收侧步骤，主动发送能力另行追踪（#10158），信封中的 `from` 回复地址为后续回复预留。',
          sources: [
            'qwen-agent-messaging',
            'qwen-v0222-release',
            'qwen-peer-messaging-commit',
            'qwen-peers-command-source',
            'qwen-peer-messaging-source',
            'qwen-peer-inbound-gate-source',
            'qwen-peer-inbox-source',
            'qwen-peer-socket-path-source',
            'qwen-peer-envelope-source',
            'qwen-peer-settings-schema',
            'qwen-peer-wiring-source',
          ],
        },
        kimi: {
          entry: '官方 Slash 命令表未列出会话间消息命令。',
          storage: '无对应消息存储；会话记录本身位于 `$KIMI_CODE_HOME/sessions/`。',
          behavior:
            '`/swarm` 是启用多 Agent 并行执行的任务模式，`/btw` 是与派生子 Agent 的旁路问答；两者都不是独立会话之间互发消息。',
          scope: '本页核对中文 Slash 命令表与会话文档。',
          automation: '无对应能力可确认。',
          persistence: '无对应能力可确认。',
          surfaces: '以 TUI 命令表为准；不从 Web UI 或 ACP Surface 推断。',
          conditions: '保留为未确认；不从 swarm 模式或子 Agent 行为推断。',
          sources: ['kimi-commands-messaging-current'],
        },
        qoder: {
          entry:
            '跨会话消息：`QODER_FEATURE_CROSS_SESSION=1 qoder` 启动，或把 `QODER_FEATURE_CROSS_SESSION=1` 写进用户级 `.env`（默认路径 `$HOME/.qoder/.env`，改后需重启 Qoder CLI）让后续会话自动开启；beta，默认不开启。开启后 Agent 用 `ListAgents` 发现可达对象、用 `SendMessage` 以对等会话标签或 handle 为收件人投递。`ListAgents` 输出分两组：`Agents in this session (address by name)` 与 `Peer sessions (other Qoder sessions on this machine)`，对等会话行形如 `api-service — interactive, idle, started 12m ago, cwd /home/dev/api, handle -3f`。用户在提示词输入 `@` 加至少一个字符即可在文件与 Agent 之外补全对等会话，对等会话行以 `@` 开头、类型标为 `session` 并附状态与已运行时长（例如 `@reviewer    session · idle · started 3m ago`），接受补全插入寻址该会话的标签，含空格的标签像文件路径一样把空格转义。`/peers` 列出当前生效的入站策略及其来源、可达对等会话（含本会话自己被寻址的 handle）与待审查消息；`/peers approve <id>` 放行、`/peers deny <id>` 丢弃，官方示例为 `/peers approve ab12cd34` 与 `/peers deny ab12cd34`。Agent Teams：主 Agent 按需创建命名队友（如 `@researcher`），`SendMessage` 在主 Agent 与队友、队友与队友之间通信；用户以 `QODER_AGENT_TEAMS=1` 启动并在对话中显式要求使用 Agent Teams。',
          storage:
            '跨会话消息：每个开启该功能的会话监听一个私有 socket 并把它登记进每用户注册表，其他会话读该注册表发现对等会话后直连投递；官方页面写明 socket 与其所在目录都只对本人用户账号可读，但没有给出注册表与 socket 的具体路径，路径记为未确认。附件按绝对路径随消息发送，到达时复制给接收方以便其读取，消息被拒绝时再删除。被保留的消息不进入模型上下文，只能在 `/peers` 里看到 id、发送方、被保留原因与预览。Agent Teams：团队与队友状态只存在于当前 TUI 会话运行期，文档未列出磁盘保存位置；`resume` 只恢复对话历史。',
          behavior:
            '跨会话消息：消息被投递进接收会话的下一回合，CLI 1.1.21 起在会话内内联显示发送方与正文。发送如实回报——对等会话在列出与发送之间退出时，结果说明这一情况并建议重新列出，而不是静默成功。入站裁决由 `security.crossSessionInbound` 逐会话自定：`accept` 投递进下一回合，`hold` 停下等你审查、在你批准前 Agent 看不到，`refuse` 全部拒绝、不投递也不把附件写盘。该设置未配置时按本会话处理权限的方式回退：绕过权限检查的会话保留入站对等消息等待批准（否则对等会话请求的任何东西都会不再提示就执行），仍会逐次确认的会话直接接受（对等会话无法借它跳过自己也要面对的检查），无人可审查的会话（拿到显式 socket 路径的非交互运行）把这条回退本该保留的消息改为拒绝，以便立刻告知发送方而不是等一场不会发生的审查；这类会话若要接收对等指令必须显式设 `accept`，自己配置的值即使在那里也总被尊重。项目级设置只能更严：仓库内设置可把 `accept` 收紧为 `hold`，但绝不能把 `hold` 放宽为 `accept`；因为这等于仓库能覆盖你自己的选择，`/peers` 总是写明生效取值与它来自哪个文件。因信任问题无法自动裁决而保留的消息会弹批准框，框内给出发送方名称与 handle、名称与地址均由发送方提供且未验证的声明、本会话绕过权限检查因而对方请求会不再提示就执行的说明、消息摘录（显示用摘录被截短，批准后投递整条消息）与两个选项 `Deliver it to this session`、`Decline — drop it and tell the sender`；附件只按数量列出。该提示永远是本会话最后才上屏的东西，不会打断权限确认或你正在进行到一半的对话框，只在没有其他东西在向你询问时出现；一次只问一条，且只在屏幕空闲时问。在提示或对话框打开期间到达的消息仍被保留、改由 `/peers` 审查；已经打开的提示被别的东西抢占屏幕时回到队列，而不是在替代物后面耗到过期。等待时长由 `general.dialogExpiry` 决定，默认 5 分钟，到期后消息被丢弃并告知发送方是 expired 而不是 refused——发送方 Agent 可以据此区别处理；`never` 去掉其他对话框的期限但不去掉这一个，以免一条无人回答的提示挡住之后所有消息。你自己配置 `hold` 而保留的消息不弹框（自己的常设指令不是问题），只由 `/peers` 审查；来自仓库设置文件的同一个 `hold` 会弹框，因为那是仓库的决定而不是你的。对等消息被当作同事的请求而不是你的指令：它永远不算你对待处理权限提示的批准，开头的 `/` 是纯文本而绝不会被当作 Slash 命令，权限边界按会话各自计算——对等会话被拒的动作改问另一个会话去做时，接收方 Agent 被指示拒绝并上报给你。Agent Teams：普通输出文本不会自动发给队友，只有 `SendMessage` 内容被共享，界面显示 “Message from @[name]”；共享任务列表记录负责人、状态和依赖；完成任务不终止队友，队友在 running/idle 间循环，可被新消息或任务唤醒。',
          scope:
            '跨会话消息：同一台机器、同一用户账号下的两个 Qoder CLI 会话，官方页面逐字写明 “two Qoder CLI sessions running on the same machine, under the same user account”，典型用法是一个终端做后端、另一个做前端，或从第二个窗口把东西交给一个长期运行的会话。同机上属于其他用户的会话看不到也够不到你的会话。隔离只依赖文件权限：在本人账号边界内，发送方自述的名称没有密码学验证，任何已经以你的身份运行的进程都能把自己呈现为任意对等会话，因此官方要求把跨会话消息的可信程度限定在“你账号下运行的一切都可信”的范围内，并建议在以更高权限运行的会话上优先用 `hold`。官方页面没有描述跨机器传输。Agent Teams：单个交互式 TUI 会话；每个会话自动拥有一个当前团队，无手动建队命令；队友视图在单窗口内切换，不支持分栏。',
          automation:
            '跨会话消息：可以让 Agent 自己调用 `ListAgents`，也可以直接请它列出可达对象。会话名就是当前标题，`/rename` 与 Agent 自行改标题都会改变它；状态列同样跟随会话：Agent 工作时为 `busy`、正在请求确认时为 `waiting`、用户在 shell 提示符时为 `shell`、其余为 `idle`。没有标题的会话按工作目录名加 handle 命名，因此同在 `/home/dev/api` 的两个会话显示为 `api-7c` 与 `api-3f` 而不是两个 `api`；有标题的会话名里不含 handle，其行内另行标注一个。handle 由该会话监听的 socket 派生，在所有会话的列表里都相同，且不随改名变化，可单独用 handle 寻址。名称匹配到多个在世会话时，Agent 拿到的是各自唯一寻址的标签并询问你指哪一个而不是猜；名称由各方自选且未验证，因此有歧义时没有任何寻址只凭名称成立。提及只是告诉 Agent 你指哪一个，本身不发送任何东西——要在同一条消息里说出你要什么（例如 “ask @reviewer to rerun CI”）Agent 才会去发消息，只提及不提要求的消息不会投递；单独输入 `@` 不列出对等会话，匹配不到任何对象的提及原样留在文本里。Agent Teams：主 Agent 根据任务需要动态创建队友；官方建议用户在提示词中明确要求 Agent Teams 并指定角色，否则可能使用普通 Subagent。',
          persistence:
            '跨会话消息：官方页面没有记录独立的磁盘消息队列或保留时长。被保留的消息等待 `general.dialogExpiry`（默认 5 分钟）后过期丢弃并向发送方回报 expired；`general.dialogExpiry` 只从你自己的设置读取，永不从仓库设置读取，取值 `60s`/`5m`/`10m`/`never`。`security.crossSessionInbound` 取 `accept`/`hold`/`refuse`，默认未设置，仓库内设置只能收紧。`QODER_FEATURE_CROSS_SESSION=1` 可写进用户级 `.env` 跨会话保留，改 `.env` 后需重启。附件到达即复制、被拒即删。Agent Teams：beta，需 `QODER_AGENT_TEAMS=1`（CLI 环境变量或用户级 `.env`：macOS/Linux 为 `$HOME/.qoder/.env`，Windows 为 `%USERPROFILE%\\.qoder\\.env`，修改后需重启）；团队不随 TUI 退出保留，`resume` 恢复历史但不恢复队友及其状态。',
          surfaces:
            '跨会话消息：CLI，官方页面把适用范围写为在同一台机器上运行的两个 Qoder CLI 会话，并位于文档站 CLI → Using Qoder CLI → Parallel Collaboration 分组下（与 Process Tasks in Parallel、Agent Teams、Dynamic workflows 并列）。非交互运行只有在拿到显式 socket 路径时才涉及该功能，且其入站回退把本该保留的消息改为拒绝。官方 Slash 命令参考（`cli/slash-reference`）、设置参考（`cli/settings-reference`）与 Tools 参考（`cli/tools`）在核对日期都没有列出 `/peers`、`SendMessage`、`ListAgents`、`security.crossSessionInbound`、`general.dialogExpiry` 或 `QODER_FEATURE_CROSS_SESSION`；`SendMessage` 只出现在 Agent Teams 页。不从 IDE、JetBrains Plugin、Cloud Agents、Mobile & Web、QoderWake 或 Agent SDK Surface 推断同一能力。Agent Teams：交互式 TUI；官方文档未说明 Headless 或 SDK Surface 支持 Agent Teams。',
          conditions:
            '跨会话消息：beta，默认不开启，需 `QODER_FEATURE_CROSS_SESSION=1`；官方页面写明该功能需要 UNIX domain socket 且仅在 macOS 与 Linux 可用，Windows 不在范围内。官方页面没有给出生效的最低 CLI 版本，只标 Beta；CLI Release Notes 的时间线为 CLI 1.1.19（2026-08-11）“Added cross-session messaging, so sessions can discover each other and send messages”、CLI 1.1.21（2026-08-13）“Cross-session messages now show the sender and the message body inline”、CLI 1.1.25（2026-08-18）“Added @-mention of other live sessions in the composer, so you can reference a peer session alongside files and agents”，公开 Release Notes 最新条目为 CLI 1.1.64（2026-09-25），其中没有 `/peers`、`security.crossSessionInbound`、`general.dialogExpiry` 或 `QODER_FEATURE_CROSS_SESSION` 的条目。仓库内设置只能收紧入站策略；`general.dialogExpiry` 永不从仓库读取。本页不把 Agent Teams 的队内 `SendMessage` 算作跨会话消息：两者共用同一个工具名，但 Agent Teams 只在单个 TUI 会话内、需 `QODER_AGENT_TEAMS=1`，队友 stdout 相互隔离，固定多阶段流程官方建议用 Workflows、单个独立子任务建议用 Subagents。',
          sources: [
            'qoder-cross-session-messaging',
            'qoder-release-notes',
            'qoder-agent-teams',
            'qoder-commands',
            'qoder-settings-reference',
            'qoder-tools-delegate',
          ],
        },
      },
      related: ['session-resume', 'agent-background', 'surface-remote-control'],
    }),

    'session-schedule': createDetail({
      id: 'session-schedule',
      definition:
        '在会话内登记一个未来触发条件，到点把一段提示词重新注入对话。触发条件可以是 5 段 cron 表达式、`/loop` 换算出的固定间隔，或模型每轮自己挑选的下次唤醒时刻。',
      includes: [
        '一次性提醒与周期任务的创建、列举、取消入口',
        'cron 表达式格式、时区、抖动、任务上限与自动过期规则',
        '任务登记表的保存位置、恢复会话时的重载与跨进程互斥',
        '模型自定节奏唤醒与 `loop.md` 默认提示词文件',
        '错过触发的处理方式与进程退出后的行为',
      ],
      excludes: [
        '厂商云端与桌面端的独立排程 Surface（Claude Routines、Claude Desktop scheduled tasks、Codex Scheduled、Qoder Cloud Mode），只在条件中点名边界',
        '后台 Shell 与后台 Subagent 的运行、并发和通知',
        '`/goal` 的目标推进、花费窗口与后台任务检查',
        '消息平台渠道自己的循环排程与投递约束',
        'Hooks 的事件触发与 CI 工作流的 `schedule:` 触发器',
      ],
      facts: [
        '四家在 CLI 里都有一等入口，只有 Codex 没有：官方 Automations 页对 CLI 逐字写明 “Codex CLI doesn\'t provide the Scheduled management interface”，桌面 App 与 Web 才有 Scheduled 视图。',
        'Claude Code、Qwen Code 与 Kimi Code 的会话内调度器参数高度一致：都是 5 段 cron、本地时区、单会话上限 50 个、周期任务 7 天过期、按任务 ID 派生的确定性抖动、只在会话空闲时触发、错过的触发只补一次。',
        '抖动上限不同：Claude Code 周期任务最多晚 30 分钟（比每小时更频繁的任务最多晚半个间隔），Qwen Code、Kimi Code 与 Qoder CLI 都是最多晚间隔的 10% 且封顶 15 分钟；四家的一次性任务落在整点或半点时都最多提前 90 秒。',
        '默认持久化策略不同：Qoder CLI 把持久任务写进项目内 `.qoder/scheduled_tasks.json`，Claude Code 在关闭 feature-flag fetching 时写进项目内 `.claude/scheduled_tasks.json`，Qwen Code 默认只在内存、必须显式 `durable: true` 才落盘到 `~/.qwen/tmp/<project-hash>/scheduled_tasks.json`，Kimi Code 以 durable 事件随会话记录保存。',
        '用户自助程度差别最大：Qoder CLI 有 `/crontab` 面板可以看用量、改上限、删任务，Claude Code 与 Qwen Code 只有 `/loop` 加自然语言，Kimi Code 的工具说明逐字写明用户没有 `/cron` 命令或自助界面、只能请模型代为增删。',
        '三家提供模型自定节奏唤醒且上下限相同：Claude Code 的 `ScheduleWakeup`、Qwen Code 的 `loop_wakeup`、Qoder CLI 的动态节奏都夹在 60 到 3600 秒；Kimi Code 只有 cron 触发，没有自定节奏唤醒工具。',
        '三家支持默认提示词文件：Claude Code 读 `.claude/loop.md` 与 `~/.claude/loop.md`（项目优先，超过 25000 字节截断），Qwen Code 读 `.qwen/loop.md` 与 `~/.qwen/loop.md`（项目优先，缺失时回退自主模式），Qoder CLI 读 `.qoder/loop.md`；Kimi Code 没有对应文件。',
      ],
      products: {
        claude: {
          entry:
            '`/loop [interval] [prompt]` 是 bundled Skill，别名 `/proactive`。三种输入组合分别是：间隔加提示词走固定 cron；只给提示词由 Claude 每轮自选 1 分钟到 1 小时的间隔；只给间隔或什么都不给则跑内置维护提示词，或跑你的 `loop.md`。间隔可作前导 token（`30m`）或尾随 `every 2 hours` 这类子句，单位 `s`/`m`/`h`/`d`，秒向上取整到分钟（cron 最小粒度 1 分钟），`7m`、`90m` 这类映射不到干净 cron 步长的间隔被圆整到最近的可行值并告知实际选了什么。提示词本身可以是一个 Skill，例如 `/loop 20m /review-pr 1234`。一次性提醒用自然语言，例如 `remind me at 3pm to push the release branch` 或 `in 45 minutes, check whether the integration tests passed`，Claude 用 cron 把触发时刻钉到具体分钟与小时并确认。底层工具是 `CronCreate`（接受 5 段 cron、要运行的提示词、以及周期还是单次）、`CronList`（列出全部任务的 ID、排程与提示词）、`CronDelete`（按 ID 取消）；自定节奏用 `ScheduleWakeup`，Claude 在每轮末尾调用它挑选 1 分钟到 1 小时后的下次运行，传 `stop: true` 立即取消待触发唤醒，`stop` 字段需要 v2.1.202 及以上。`/schedule [description]`（别名 `/routines`）创建的是云端 Routines，不属于本页。',
          storage:
            '默认随会话保存，`--resume`/`--continue` 恢复会话时重载未过期任务。在关闭 feature-flag fetching 的情况下，你要求跨会话保留的任务写进项目的 `.claude/scheduled_tasks.json`；`.claude` 目录或该文件是符号链接时返回错误而不排程。自定节奏 `/loop` 的待触发唤醒出现在 Stop hook 输入的 `session_crons` 字段里。默认提示词文件按顺序查找并使用第一个找到的：`.claude/loop.md`（项目级，两者都存在时优先）与 `~/.claude/loop.md`（用户级，在没定义自己文件的项目里生效）。',
          behavior:
            '调度器每秒检查一次到期任务并以低优先级入队；排程提示词在你的两个回合之间触发，不会插在 Claude 正在输出的回合中，任务到期时 Claude 正忙就等到当前回合结束。所有时间按本地时区解释，`0 9 * * *` 表示运行 Claude Code 所在地的 9 点而不是 UTC。cron 为 5 段 `minute hour day-of-month month day-of-week`，各段支持 `*`、单值、`*/15` 步长、`1-5` 区间与 `1,15,30` 列表；星期几用 `0` 或 `7` 表示周日、到 `6` 表示周六；不支持 `L`、`W`、`?` 与 `MON`、`JAN` 这类名称别名；日与星期同时受限时任一匹配即触发，遵循标准 vixie-cron 语义。周期任务在创建后 7 天自动过期，最后触发一次再自删。停止自定节奏 `/loop` 可在它等待下一轮时按 `Esc`，这会清除待触发唤醒；直接让 Claude 排的任务不受 `Esc` 影响，会留到被删除为止。自定节奏模式下一轮既没重新排程也没停止时，Claude Code 补一次约 20 分钟后的兜底唤醒，那一轮仍不重排就结束循环。',
          scope:
            '会话作用域，一个会话最多同时持有 50 个定时任务，每个任务有一个 8 字符 ID 可传给 `CronDelete`。保存下来的任务只在你创建它的项目目录里运行：把该文件复制到别的目录（例如新 Worktree），那里的会话会列出复制过来的任务但不运行，需要在该目录重新创建。',
          automation:
            '为避免所有会话在同一墙钟时刻打到 API，调度器给触发时刻加确定性偏移：周期任务最多晚 30 分钟触发（比每小时更频繁的任务最多晚半个间隔，一个排在 `:00` 的每小时任务可能在 `:30` 之前的任意时刻触发），落在整点或半点的一次性任务最多提前 90 秒；偏移由任务 ID 派生，同一任务每次相同，因此需要精确时刻时应避开 `:00` 与 `:30`（例如用 `3 9 * * *` 而不是 `0 9 * * *`），这样一次性抖动也不会生效。动态排程的循环和其他任务一样出现在定时任务列表里，可以同样列举或取消，抖动规则不适用于它但 7 天过期适用。定时触发只运行 Claude 有权自行调用的 Skill：内置命令（如 `/permissions`、`/model`、`/clear`）、标了 `disable-model-invocation: true` 的 Skill（含 bundled `/verify`）、被 `skillOverrides` 设置或 `Skill` deny 规则挡住的 Skill，以及 `/mcp__github__list_prs` 这类 MCP Prompt，都只作为纯文本送到 Claude 而不执行。会话中 Monitor 工具可用时，面对动态 `/loop` 排程 Claude 可能直接改用 Monitor：它跑一个后台脚本并把每行输出流式回传，从根上避免轮询，通常比重跑提示词更省 token 也更及时。',
          persistence:
            '任务只在 Claude Code 运行且空闲时触发，关掉终端或让会话退出就停止触发；把会话转入后台会让 `/loop` 任务跟着进入后台会话，从而在没有终端的情况下继续运行。错过的触发不补：计划时刻在 Claude 处理长请求期间过去时，空闲后只触发一次，而不是按错过的间隔数逐个触发。`claude --resume` 或 `claude --continue` 恢复会话时还原用 `CronCreate` 排的任务，但已过期的周期任务与计划时刻已过去的一次性任务除外；自定节奏 `/loop` 不被恢复，需要重新 `/loop`；后台 Bash 与 monitor 任务从不随恢复还原。`loop.md` 是纯 Markdown、没有必需结构，按直接输入 `/loop` 提示词的写法来写，修改在下一轮生效因此可以在循环运行时调整指令，两处都没有该文件时回退内置维护提示词，超过 25000 字节的内容被截断。',
          surfaces:
            '本页以 CLI 为准。官方对比表另列两个独立 Surface：云端 Routines 默认由 Anthropic 托管、不需要本机开机也不需要开着会话、最小间隔 1 小时、用全新克隆因此不访问本地文件、连接器按任务配置、无权限提示（自主运行），CLI 侧经 `/schedule` 定制排程；桌面端 scheduled tasks 跑在你自己的机器上、需要本机开机但不需要开着会话、最小间隔 1 分钟、可访问本地文件、MCP 用配置文件与连接器、权限提示按任务配置。需要无人值守运行的 cron 自动化还可改用 GitHub Actions 的 `schedule` 触发器。',
          conditions:
            '`CLAUDE_CODE_DISABLE_CRON=1` 整体关闭调度器：cron 工具与 `/loop` 都变为不可用，已排定的任务停止触发，包括已经在会话中运行的任务。动态挑选的间隔与内置维护提示词在每个 Provider 上都可用、也在关闭 feature-flag fetching 时可用；但在 Amazon Bedrock、Claude Platform on AWS、Google Cloud\'s Agent Platform 与 Microsoft Foundry 上，或在关闭 fetching 时，两者都需要 Claude Code v2.1.248 及以上。内置维护提示词每轮按顺序做三件事：继续对话中未完成的工作、照看当前分支的 PR（评审意见、失败的 CI 运行、合并冲突）、在没有别的事待办时做 bug 猎取或简化这类清理；Claude 不会开启这个范围之外的新工作，推送或删除这类不可逆动作只在延续 transcript 已授权的事情时才进行。需要跨任何会话独立存活的排程应改用 Routines、桌面端 scheduled tasks 或 GitHub Actions；要按事件而不是按轮询响应，官方指向 Channels；要让会话一轮接一轮朝某个条件推进而不是按间隔运行，官方指向 `/goal`。版本时间线（官方更新日志）：v2.1.71 同时引入 `/loop` 命令与会话内 cron 调度工具，v2.1.72 加入 `CLAUDE_CODE_DISABLE_CRON`，v2.1.73 修复 `/loop` 在 Bedrock/Vertex/Foundry 与关闭遥测时不可用，v2.1.85 在 transcript 中为定时任务触发加时间戳标记，v2.1.105 把 `/proactive` 变为 `/loop` 的别名，v2.1.113 让 `Esc` 取消待触发唤醒，v2.1.145 在 Stop 与 SubagentStop hook 输入中加入 `session_crons`，v2.1.172 起不再在远程会话中推介 `/loop`（待触发的循环不会让容器保活），v2.1.243 在 `/usage` 加入 Loops 分解，v2.1.248 让自定节奏动态模式与无提示词的自主默认在所有 Provider 上恒可用，v2.1.281 修复投递失败时定时任务与 `/loop` 唤醒每秒重复触发。',
          status: '官方确认',
          sources: [
            'claude-scheduled-tasks',
            'claude-commands',
            'claude-tools',
            'claude-env-vars',
            'claude-sessions',
            'claude-hooks',
            'claude-routines',
            'claude-desktop-scheduled-tasks',
            'claude-cron-changelog',
          ],
        },
        codex: {
          entry:
            'CLI 没有入口：官方 Automations 页在 CLI 分节逐字写明 “Codex CLI doesn\'t provide the Scheduled management interface. Use ChatGPT web or the desktop app to create and manage scheduled tasks. The CLI can help you prepare and test a prompt, skill, or script first.”，IDE 扩展分节给出同样表述，并把 CLI 与 IDE 的角色限定为先准备和测试提示词、Skill 或工作区改动。TUI Slash 命令定义源码 `codex-rs/tui/src/slash_command.rs`（固定到 `ff6aec96948b`）中也没有 cron、schedule、loop、reminder 或 timer 类命令。桌面 App 侧的入口是侧栏 **Scheduled** 视图与深链接 `codex://automations`（打开 Scheduled 的创建流程）；也可以在 ChatGPT 或 Codex 对话里描述工作、运行时刻、以及每次运行是回到当前 chat 还是新开 chat，由 ChatGPT 起草提示词、选择目标并在任务范围或节奏变化时更新它；Skill 同样能创建或更新定时任务，桌面 App 里可在任务提示词中用 `$skill-name` 显式调用某个 Skill。',
          storage:
            'CLI 不保存任何排程状态，公开文档也没有 CLI 侧的排程落盘位置。桌面 App 与 Web 的任务在 **Scheduled** 视图管理，该视图同时充当收件箱：有发现的定时运行出现在那里，某次运行需要你关注时显示未读标记。官方 Automations 页没有给出任务在本机的保存路径。',
          behavior:
            '桌面 App 的独立定时任务每次运行新开一个 chat 并把结果报进 **Scheduled**，适合每次运行都该互相独立、或一个任务要跨一个乃至多个项目运行的场景；也可以把任务排进已有 chat，让它按点回到该 chat 并使用其既有上下文，而不是每次从新提示词开始。chat 内任务可用分钟级间隔做主动跟进循环，也可用每日、每周排程做定点检查。Web 侧任务可使用上传文件、已连接的工具、Skill 与该 chat 可用的插件，但两次运行之间不保留本地文件夹或 Worktree，因此持久指令要放进任务提示词或附加的 Skill，必需的源材料要放在可访问的项目、上传件或已连接服务里。桌面 App 的 Git 仓库项目可选择在本地项目或专用后台 Worktree 中运行，两者都在后台执行；Worktree 把定时任务的改动与未完成的本地工作隔开，本地模式则可能改到你正在编辑的文件；非版本控制项目直接在项目目录运行。Web 与移动端在符合条件的套餐上还能由事件触发：Gmail 新到邮件（可按发件人或主题过滤）、Slack 选定频道的新消息（可按作者与是否包含线程回复过滤，表情回应、编辑、删除与私信不支持）、GitHub 仓库的 PR 活动（可按 PR、作者、标题或标签过滤，并选择评审、评论、提交更新或仅合并触发）；触发器决定何时运行，保存的提示词决定每次运行做什么；一个任务可用多个事件触发器，但不能把事件触发与基于时间的排程混用。多个匹配事件在短时间内到达时 ChatGPT 可能把它们合并进一次运行，可在 **Scheduled** 查看待处理事件或用 **Run now** 立即处理。',
          scope:
            'CLI 无作用域可记录。桌面 App 的项目级定时任务要求本机保持开机且 App 运行，被选中的项目在任务排定运行时仍必须在磁盘上可用；同一个定时任务可以运行在多个项目上。Web 任务不能直接在你电脑上的文件夹里工作。',
          automation:
            '需要自定义节奏时用 custom schedule controls；更高级的排程直接编辑其 RFC 5545 recurrence rule（RRULE），官方示例为 `RRULE:FREQ=MONTHLY;BYMONTHDAY=1;BYHOUR=9;BYMINUTE=0`。模型与推理强度可保持默认，也可显式指定。定时任务无人值守运行并使用你的默认沙箱设置：沙箱为 read-only 时，需要修改文件、访问网络或操作本机 App 的工具调用会失败（官方建议改为 workspace write）；为 workspace-write 时，需要修改工作区外文件、访问网络或操作本机 App 的调用会失败，可用 rules 有选择地放行需要在沙箱外运行的命令；为 full access 时后台定时任务风险升高，因为 ChatGPT 可能不经询问就改文件、跑命令、访问网络。组织策略允许时定时任务使用 `approval_policy = "never"`；若管理员要求禁止 `never`，定时任务回退到所选权限模式的审批行为。受管环境中管理员可用 admin-enforced requirements 限制这些行为，例如禁止 `approval_policy = "never"` 或约束允许的沙箱模式。选择 Worktree 时频繁排程会随时间累积大量 Worktree，官方建议归档不再需要的定时运行，并且除非打算保留其 Worktree 否则避免 pin 运行。',
          persistence:
            'CLI 无保留行为可记录。官方对比表把「跨重启持久」列为桌面 App 与云端的能力；Web 侧独立任务每次运行从保存的提示词重新开始，chat 内任务则保留该 chat 的上下文。官方 Automations 页没有给出任务数量上限、最小间隔或自动过期天数，这些记为未确认。任务使用了已退役模型时需要更新为可用替代模型，官方给出模型迁移指引；GPT-5.5 于 2026-10-14 从 ChatGPT、ChatGPT Work 与 Codex 全套餐退役，官方要求在此之前检查使用 GPT-5.5 的定时任务并改选可用替代模型。',
          surfaces:
            'CLI 与 IDE 扩展都不提供 Scheduled 管理界面。桌面 App 支持本地项目与 Worktree、需要本机开机与 App 运行；ChatGPT Web 在 workspace 开启该能力后可从 Chat 或 ChatGPT Work 创建、在 **Scheduled** 管理运行，并与移动端一起提供事件触发；企业侧 Team Tasks 通过团队的服务账号与已配置的应用连接在云端运行团队共享的周期性或事件触发工作，权限与连接设置见 Teams 文档。',
          conditions:
            '`features.in_app_local_automation`（布尔，列在配置参考的桌面相关分组）设为 `false` 可关闭桌面 App 的本地定时任务，设为 `true` 不绕过其他可用性检查。`features.in_app_chat` 设为 `false` 会隐藏 ChatGPT 与 ChatGPT Work 对话界面及相关云端自动化 UI，但不阻止 ChatGPT Voice，也不停止已有的云端任务。事件触发任务的可用性取决于套餐与 workspace 设置；受管 workspace 中管理员可用 **Allow event-triggered scheduled tasks** 权限控制。使用事件触发前必须先连接并授权对应应用：Slack 要把 `@ChatGPT` 加入任务监听的每个频道，GitHub 要求已连接的应用对该仓库有访问权限。CLI 侧 `codex_tui` 命名空间的 `wait_threads` 是回合内等待其他 thread 结束，不是排程器；Hooks 全部按事件触发（会话开始、结束等），没有基于时间的触发器。',
          status: '条件项',
          sources: [
            'codex-automations',
            'codex-reference-commands',
            'codex-config-reference',
            'codex-slash-command-registry',
            'codex-commands',
          ],
        },
        qwen: {
          entry:
            '`/loop` 是 bundled Skill，定义在 `packages/core/src/skills/bundled/loop/SKILL.md`，frontmatter 的 `argument-hint` 为 `[interval] [prompt] | list | clear`、`allowedTools` 为 `cron_create`、`cron_list`、`cron_delete`、`loop_wakeup`。子命令 `list` 调用 CronList 并展示结果，`clear` 先 CronList 再对返回的每个任务调用 CronDelete 并确认取消了几个。Skill 的解析顺序是：输入为空走自主的自定节奏循环（哨兵 `<<autonomous-loop-dynamic>>`）；首个空白分隔 token 匹配 `^\\d+[smhd]$`（如 `5m`、`2h`）走固定间隔，其余部分是提示词；否则若输入以 `every <N><unit>` 或 `every <N> <unit-word>` 结尾（如 `every 20m`、`every 5 minutes`）也走固定间隔，且只在 `every` 后跟时间表达式时匹配（`check every PR` 不含间隔）；其余情况整段是提示词并走自定节奏路径。给了间隔但提示词为空（`/loop 5m`）是固定间隔的自主循环（哨兵 `<<autonomous-loop>>`）。间隔单位 `s`/`m`/`h`/`d`，秒向上取整到分钟（最小 1），`7m`、`90m` 这类不能整除其单位的间隔选最近的干净值并在排程前告知；换算表为 `Nm`（N≤59）→ `*/N * * * *`、`Nm`（N≥60）→ `0 */H * * *`（H=N/60 且须整除 24）、`Nh`（N≤23）→ `0 */N * * *`、`Nd` → `0 0 */N * *`、`Ns` 按 `ceil(N/60)m` 处理。工具内部名是 `cron_create`/`cron_list`/`cron_delete`/`loop_wakeup`，显示名是 `CronCreate`/`CronList`/`CronDelete`/`LoopWakeup`。一次性提醒同样用自然语言，例如 `remind me at 3pm to push the release branch`。',
          storage:
            '默认不落盘：官方定时任务文档逐字写明 “Tasks created from the terminal are session-scoped: they live in the current Qwen Code process and are gone when you exit. Nothing is written to disk.”。`cron_create` 传 `durable: true` 才持久化到 `~/.qwen/tmp/<project-hash>/scheduled_tasks.json`（源码常量 `CRON_TASKS_DISPLAY_PATH`，按项目哈希分桶放在用户运行时目录下，展示用的模板路径不泄露哈希），返回文案相应为 `Persisted to ~/.qwen/tmp/<project-hash>/scheduled_tasks.json`，非 durable 则为 `Session-only (not written to disk, dies when Qwen Code exits)`。跨进程写入用 `<tasksFile>.lock` 排他创建加锁，锁探测间隔 5000 ms、写入去抖 300 ms，陈旧锁经改名旁路恢复以免销毁仍在持有者的锁。`loop.md` 任务文件读 `.qwen/loop.md`（项目）与 `~/.qwen/loop.md`（家目录，项目优先），自定节奏用哨兵 `<<loop.md-dynamic>>`、固定间隔用 `<<loop.md>>`。渠道另有独立的持久排程器（`ChannelLoopScheduler`、`ChannelLoopStore` 与 `channel_loop_create`/`channel_loop_list`/`channel_loop_cancel`），官方文档把它单列在渠道总览的 Scheduled Channel Loops，不属于本页。',
          behavior:
            '调度器每秒检查一次到期任务并在会话空闲时入队；排程提示词在两个回合之间触发，不会插在正在输出的回合中，任务到期时正忙就等到当前回合结束。所有时间按本地时区解释，`0 9 * * *` 表示运行 Qwen Code 所在地的 9 点而不是 UTC。`cron_create` 先 `parseCron` 校验表达式，再调用 `nextFireTime` 拒绝能解析但永不匹配真实日期的表达式（例如 `0 0 30 2 *`），否则任务会被接受却静默永不触发；`prompt` 会 `trim()`，为空报 `Parameter "prompt" must be a non-empty string.`。固定间隔路径在确认排程内容、cron 表达式、人类可读节奏、自动过期与任务 ID 之后立即执行一次提示词，不等第一次 cron 触发；提示词是 Slash 命令时经 Skill 工具调用，否则直接执行。`loop_wakeup` 是自定节奏唤醒：`delaySeconds` 必填并被夹到 `WAKEUP_MIN_SECONDS` 60 与 `WAKEUP_MAX_SECONDS` 3600 之间（非有限值取 `WAKEUP_DEFAULT_SECONDS` 1200，被夹时提示 `Requested <n> was clamped to the [60, 3600] s range.`），`prompt` 必填非空（为空报 `Loop wakeup prompt must not be empty.`）且建议以 `/loop` 开头以便下一次触发重新进入 loop Skill，另可给 `reason` 说明选择该延迟的理由；唤醒是一次性、仅会话内、从不 durable、不计入 `MAX_JOBS`、按精确毫秒而非圆整到分钟触发，一条自定节奏唤醒链最长运行 24 小时（`WAKEUP_CHAIN_MAX_AGE_MS`）。Skill 明确要求在任务已完成、被用户输入或无法事后检查的外部状态阻塞、或已没有有用的下一次检查时不要重排唤醒；自己启动的后台 Agent 或 Monitor 会在退出、失败、取消或 monitor 自动停止时发终态 `<task-notification>`，因此应把唤醒当长兜底心跳（1200 秒以上）而不是短轮询，只有在主动轮询没有别处上报的外部状态时才用 60 到 270 秒以留在约 5 分钟的 prompt-cache 窗口内。',
          scope:
            '会话作用域，上限 `MAX_JOBS = 50`，超出报 `Maximum number of cron jobs (50) reached. Delete some jobs first.`；durable 任务另有同为 50 的上限，加载时超出报 `Durable task <id> skipped — durable cap (50) reached.`。任务 ID 为 8 字符。`cron_create` 的 `sessionMode` 取 `unbound`（默认，保留既有的未绑定 durable 调度器行为）或 `current`（把 durable 任务绑定到当前 daemon 会话）；`sessionMode: current` 必须同时 `durable: true`，否则报 `Current-session scheduling requires durable: true because session-only jobs cannot survive a daemon session switch.`，并要求存在活动的 daemon prompt 与创建者，否则报 `current_session_scheduling_unavailable: Current-session scheduling requires an active daemon prompt.`。standalone 会话不支持 durable，报 `Durable cron jobs are not supported in standalone sessions.`。',
          automation:
            '抖动按任务 ID 确定性派生：周期任务最多晚「周期的 10%」触发且封顶 `MAX_RECURRING_JITTER_MS` 15 分钟（一个每小时任务可能在 `:00` 到 `:06` 之间任意时刻触发），落在整点或半点（分钟为 `:00` 或 `:30`）的一次性任务最多提前 `MAX_ONESHOT_JITTER_MS` 90 秒；同一任务偏移固定，需要精确时刻就避开 `:00` 与 `:30`（例如 `3 9 * * *`），一次性抖动便不生效。周期任务默认创建后 7 天过期（`DEFAULT_RECURRING_MAX_AGE_DAYS`），最后触发一次再删除；`experimental.cronRecurringMaxAgeDays`（默认 7、最小 0、需重启、不在设置对话框显示）或 `QWEN_CODE_CRON_MAX_AGE_DAYS` 可改，环境变量优先以便云端与容器部署，`0` 关闭过期让任务一直跑到被删除，配置的上限同样作用于重启后从磁盘恢复的 durable 任务；一次性任务不按时间过期，触发一次后自删。每个任务保留最近的触发历史，上限 `MAX_TASK_RUNS = 20`，超出丢最旧。Goal 的自主花费窗口按官方设置说明统计 Goal 回合的模型调用、直接前台 Subagent 与 Goal 校验器/检查点检查，明确排除嵌套与后台 Agent、其他旁路查询、cron 与通知回合。',
          persistence:
            '官方文档 Limitations 逐条写明：任务只在 Qwen Code 运行且空闲时触发，关掉终端或让会话退出会取消全部；错过的触发不补，计划时刻在长请求期间过去时空闲后只触发一次而不是按错过的间隔逐个触发；会话作用域任务不跨重启保留，重启 Qwen Code 清空全部会话作用域任务。durable 任务写入 `scheduled_tasks.json` 后可跨重启恢复，恢复后按配置的过期上限继续计算。cron 表达式为 5 段 `minute hour day-of-month month day-of-week`，各段支持 `*`、单值、`*/15` 步长、`1-5` 区间与 `1,15,30` 列表；星期几用 `0` 或 `7` 表示周日；不支持 `L`、`W`、`?` 与 `MON`、`JAN` 这类名称别名；日与星期都受限时任一匹配即触发，遵循标准 vixie-cron 语义。`.qwen/loop.md` 在触发时不存在则循环回退自主模式（继续自主工作而不是空转），重新创建后在下一次触发被重新读取；每次触发收到的是完整任务清单（首次投递、文件变化后或上下文压缩后）或一条指回先前清单的简短提醒。',
          surfaces:
            '本页以交互式 TUI 为主，CLI 界面有 `CronPill` 组件显示排程状态。仓库中另有 daemon 侧的路由与生命周期模块（`packages/cli/src/serve/routes/scheduled-tasks.ts`、`scheduled-task-keepalive.ts`、`scheduled-task-session-lifecycle.ts`、`packages/cli/src/runtime/scheduled-task-run.ts`）、Web Shell 的 Scheduled Tasks 对话框（`packages/web-shell/client/components/dialogs/ScheduledTasksDialog.tsx` 与 `scheduledTasksSchedule.ts`、侧栏的 `scheduled-task-session-groups.ts`）与 ACP 集成测试（`integration-tests/cli/acp-cron.test.ts`），说明 daemon、Web Shell 与 ACP 都能承载绑定到会话的 durable 任务；两份设计文档 `docs/design/2026-08-24-scheduled-task-current-session-entrypoints.md` 与 `docs/design/2026-08-26-scheduled-task-empty-session-persistence.md` 分别记录当前会话入口与空会话持久化。渠道循环由渠道自己的持久排程器负责，把结果回投到发起的聊天。',
          conditions:
            '`experimental.cron`（布尔，默认 `true`，标签 “Enable Cron/Loop Tools”，分类 Experimental，需重启，在设置对话框显示）关闭后模型无法用 `cron_create`/`cron_list`/`cron_delete` 创建周期提示词；也可用 `QWEN_CODE_DISABLE_CRON=1` 关闭。`cron_create` 的 `getDefaultPermission()` 固定返回 `ask`，源码注释解释原因：L3 默认不能是 `allow`，否则 AUTO 模式在 L4 于 `finalPermission === allow` 时短路，分类器根本不运行，任意排程提示词会被静默放行；`ask` 让该调用在 AUTO 模式走分类器、在 DEFAULT 模式走人工审批。`cron_create` 的 `shouldDefer` 为真（排程不频繁）、`alwaysLoad` 为假，关键词为 `cron schedule reminder recurring timer`。存在一处文档与实现不一致：用户文档的间隔表把「只给提示词」写成 “defaults to every 10 minutes”，而 Skill 正文要求该路径不调用 CronCreate、改走 `loop_wakeup` 自定节奏。发布状态已确认：`docs/users/features/scheduled-tasks.md`、`packages/core/src/services/cronScheduler.ts` 与 `packages/core/src/skills/bundled/loop/SKILL.md` 在标签 `v0.24.7` 下都能取到，且 `612a55295993` 与 main HEAD `2c591ecc08a6fa08` 的文档与 Skill 正文逐字节相同。',
          status: '官方确认',
          sources: [
            'qwen-scheduled-tasks-doc',
            'qwen-loop-skill',
            'qwen-cron-skill-loopmd',
            'qwen-cron-create-tool',
            'qwen-cron-tool-names',
            'qwen-cron-scheduler',
            'qwen-cron-tasks-file',
            'qwen-loop-wakeup-tool',
            'qwen-cron-settings-schema',
            'qwen-cron-settings-doc',
            'qwen-scheduled-tasks-doc-v0247',
            'qwen-cron-scheduler-v0247',
          ],
        },
        kimi: {
          entry:
            '没有 Slash 命令：`docs/zh/reference/slash-commands.md`（固定到 `21406fb4c805`）没有任何定时任务命令，`CronCreate` 与 `CronDelete` 的工具说明正文都逐字写明用户没有 `/cron` 命令或自助界面，要取消或修改只能请模型代为调用（例如「取消我 9 点的提醒」「把我的每日检查改到 10 点」），并建议在给用户的消息里带上任务 `id` 以便引用。入口是三个模型工具，由 `CronFeature` 以 domain `cron` 注册为 `CronCreate`、`CronList`、`CronDelete`。`CronCreate` 参数为 `cron`（本地时区标准 5 段表达式 `minute hour day-of-month month day-of-week`，空白折叠为单空格）、`prompt`（`min(1)`、`max(MAX_PROMPT_BYTES)`，UTF-8 上限 8 KiB）、可选 `recurring`（默认 `true`；`false` 为一次性提醒，触发后自动删除）。官方工具文档给出的默认审批是 `CronCreate` 需审批、`CronList` 自动放行、`CronDelete` 需审批；`CronList` 说明写明它只读、从不改状态，因此始终安全（含 Plan 模式），而 `CronDelete` 在 Plan 模式下同样被拦截。`CronCreate` 的审批规则按 `cron`、`prompt`、`recurring` 三个字面量生成，因此改排程等于重新审批。',
          storage:
            '官方数据位置文档把会话目录下的 `cron/` 记为定时任务持久化位置，用 `kimi --session` 恢复会话时重新加载到调度器。v2 引擎实际以 durable 事件保存：`cron.add`、`cron.delete`、`cron.cursor` 三个事件都标 `durable = true` 并带 zod schema，由 cron actor 的 durable 状态折叠重放，且 `undoable: false`（`/undo` 不能回退排程变更）。`kimi vis` 的只读读取器注释逐字说明两种布局：v2 把 cron 状态作为 durable wire 记录（`cron.add`/`cron.delete`/`cron.cursor`）写进每个 agent 的 `wire.jsonl`，v1 则写 `<agentDir>/cron/<id>.json` 文件，vis 先读遗留文件再叠加 wire 折叠，因此两种引擎写出的会话都能列出其定时任务，且可视化器从不写入。',
          behavior:
            '调度器默认每 `DEFAULT_POLL_INTERVAL_MS` 1000 ms tick 一次；`[cron].disabled` 为真、当前没有任务、或 agent loop 状态为 `running` 时该次 tick 直接返回，因此触发只发生在会话空闲时。到期时把原始提示词包进 `<cron-fire jobId="…" cron="…" recurring="true|false" coalescedCount="N" stale="true|false">` 信封（内含 `<prompt>` 与逐字原文），作为 role 为 user 的消息以 `steerIfActive: true` 提交，origin kind 为 `cron_job`。调度器睡过头错过多个理想触发时刻（合盖、长回合等）时只投递一次，`coalescedCount` 说明合并了几次，官方说明要求把 `coalescedCount > 1` 理解为「错过了一些检查、只有最新状态重要」而不是把提示词跑那么多遍；合并计数至多迭代 `MAX_COALESCE_ITERATIONS` 10000 次。触发成功后周期任务把游标推进到 `lastDueMs ?? now` 并派发 `CronCursor`，一次性任务与已满 7 天的周期任务被删除。`CronCreate` 依次拒绝：表达式非法（`Invalid cron expression: …`）、5 年内不会触发（`Cron expression "…" has no fire within 5 years; refusing to schedule.`）、达到上限（`Cron job cap reached (max 50 per session).`，prepare 与 execute 各查一次）、prompt 超 8192 字节（`Prompt exceeds 8192 bytes (got N).`）、一次性任务首次触发超过 `ONE_SHOT_MAX_FUTURE_MS` 350 天（提示钉住的日或月今年已过、请选未来日期或用通配符）、以及被禁用时的 `Cron scheduling is disabled (KIMI_DISABLE_CRON=1).`。成功返回 `id`、`cron`（规范化后的表达式）、`humanSchedule`（英文摘要，如 `every 5 minutes`）、`recurring` 与 `nextFireAt`（带数字偏移的本地 ISO 时间戳，或 null）。cron 各段支持 `*`、单值、`*/N` 步长、`N-M` 区间与逗号列表，星期几 `0` 或 `7` 为周日。',
          scope:
            '会话作用域：官方工具文档写明计划绑定到会话、用 `kimi --session` 恢复会话后仍然有效、但不会带入全新的会话；`CronCreate` 说明进一步写明任务按被恢复的会话 ID 归属，而不是按工作目录。单会话上限 `MAX_CRON_JOBS_PER_SESSION = 50`。任务 ID 由 `ulid()` 生成，`CRON_ID_REGEX` 接受 8 位小写十六进制（v1 遗留 ID）或 26 字符 Crockford base32 ULID（v2 ID），最多尝试 `MAX_ID_ATTEMPTS` 8 次，仍不唯一则抛 `BugIndicatingError`；官方工具文档仍写「成功时返回 8 位 16 进制 `id`」，与 v2 源码的 ULID 及工具说明里的 `id` (ULID) 不一致。调度只在 main agent 上运行：`cronEffects` 在 agentId 不等于 `MAIN_AGENT_ID` 时直接返回，`CronCreate` 也经 `mainAgentOnlyExecution(scopeContext, CRON_MAIN_AGENT_ONLY)` 拒绝子 Agent 调用。',
          automation:
            '抖动按任务 ID 确定性派生（`fractionFromId`）：周期任务的理想触发时刻向后偏移 `min(周期 × 0.1, 15 分钟)` 内的一个值（`*/5 * * * *` 最多漂 30 秒，`0 9 * * *` 最多漂 15 分钟），一次性任务只在理想触发正好落在整分钟且分钟数为 0 或 30 时向前提前最多 90 秒、且不会早于 `createdAt`，其他分钟原样通过；`noJitter` 为真时两者都不偏移。`STALE_THRESHOLD_MS` 为 7 天：周期任务存活满 7 天后带 `stale: true` 做最后一次触发然后自动删除，`stale` 标志就是模型收到的「这是最后一次投递」通知，官方说明要求想继续保留就用同样的 `cron` 与 `prompt` 再调一次 `CronCreate`（会重置 `createdAt` 并开启新的 7 天窗口），一次性任务永不标 stale；`noStale` 为真时不做过期。`CronCreate` 说明还建议在用户请求是近似时刻时避开 `:00` 与 `:30`（例如「每天早上 9 点左右」用 `57 8 * * *` 或 `3 9 * * *`、「每小时」用 `7 * * * *`），只有用户明确指名整点时才用 0 或 30 分。`CronList` 为每个任务返回 `id`、`cron`（逐字原样）、`humanSchedule`、`prompt`（JSON 编码以保留换行、超过 200 UTF-8 字节截断并附 `…(truncated)`，用于上下文压缩后回忆任务用途并作为重建排程的原文来源）、`nextFireAt`（已含抖动的本地 ISO 时间戳）、`recurring`、`ageDays`（两位小数）与 `stale`，记录之间用只含 `---` 的行分隔并按创建顺序排列，为空时返回 `cron_jobs: 0` 与 `No cron jobs scheduled.`；官方工具文档列出的字段少了 `prompt`。`CronDelete` 只接受一个 `id`：周期任务立即停止全部后续触发（调度器在下一次 tick 收到删除），一次性任务取消尚未发生的那次触发，已触发过的一次性任务已自删因而返回 `No cron job with id …`；找不到 ID 报错而不是静默无操作，以便改用 `CronList` 核对实际在世的 ID，删除不可撤销、删错只能重新 `CronCreate`。已过期的周期任务由系统自动删除，此时没有可删对象，要继续同样只能重新创建。',
          persistence:
            '官方工具文档写明「计划绑定到会话，用 `kimi --session` 恢复会话后仍然有效，但不会带入全新的会话」，且「单个会话最多保留 50 个生效中的定时任务」。`kimi --session [id]`（`-S`）恢复会话，带 ID 时直接打开指定会话、不带 ID 时进入交互式选择器，`-r`/`--resume` 是帮助信息里不显示的隐藏别名。恢复后调度器从各任务的 `createdAt`（或已持久化且不晚于当前时刻的 `lastFiredAt` 游标，取较晚者）继续计算下次触发，离线窗口内落下的触发时刻经 `coalescedCount` 合并成一次投递，已满 7 天窗口的周期任务带 `stale: true` 作为最后一次投递到达。错过任务另有 `handleMissed` 路径，以 origin kind `cron_missed` 与 `count` 投递通知（该接口在 v2 的生产调用方未确认，`cron_missed` 是否会在真实 v2 会话中产生因此记为未确认）；TUI 的 `CronMessageComponent` 相应渲染 “Missed scheduled reminders”，正常触发渲染 “Scheduled reminder fired”，明细行按序拼出 cron、`job <id>`、`one-shot`、`N fires coalesced`、`N missed` 与 `final delivery`，其中 stale 与 missed 用 warning 色。',
          surfaces:
            '本页以交互式 TUI 与 v2 引擎（`packages/agent-core-v2`）为准；当前 main 的 `packages/` 下只有 `agent-core-v2`，v1 引擎包已不在仓库中，只有 `kimi vis` 的只读读取器仍兼容 v1 遗留的 `<agentDir>/cron/<id>.json` 布局。`kimi vis [sessionId]` 启动一个指向本地会话的进程内只读可视化服务器、打印访问地址并打开浏览器、持续到按 `Ctrl-C`，其 Web 界面有 Cron 页签（`apps/vis/web/src/components/tasks/CronTab.tsx`）与服务端只读存储读取器，只列举不写入，因此不是管理入口。SDK 与 ACP 侧未见公开的定时任务写入入口。',
          conditions:
            '`[cron]` 配置节的键为 `debug`、`noJitter`、`noStale`、`disabled`、`manualTick`（默认全为 `false`）与可选的 `clock`、`pollIntervalMs`；对应环境变量是 `KIMI_CRON_DEBUG`、`KIMI_CRON_NO_JITTER`、`KIMI_CRON_NO_STALE`、`KIMI_DISABLE_CRON`、`KIMI_CRON_MANUAL_TICK`、`KIMI_CRON_CLOCK`、`KIMI_CRON_POLL_INTERVAL_MS`，布尔项只认字面量 `1`，`pollIntervalMs` 空串视为未设置、字面量 `null` 关闭轮询、其余要求非负有限整数否则忽略。`manualTick` 为真时不设轮询定时器，非 Windows 平台改为监听 `SIGUSR1` 触发一次 tick；`debug` 为真时向 stderr 写 `[cron/session]` 前缀日志。`[cron]` 节没有出现在 `docs/zh/configuration/config-files.md` 的顶层节清单里，环境变量文档也只列了 `KIMI_DISABLE_CRON`（说明为「禁用定时任务工具：`CronCreate` 拒绝新计划，已有任务不触发」），其余键与变量属源码确认。fork 会话不继承源会话的定时任务：durable 状态在收到 `Forked` 事件时清空 `tasks` 并置 `forkNotice.reminderPending`，随后注入 variant 为 `cron_fork_cleared` 的提醒 “This fork does not have any scheduled cron tasks. Tasks from the source session continue to run in the source session. Create new tasks here if needed.”，对应 changeset `.changeset/fork-cron-clear.md`（patch，正文 “Cron tasks from the source session no longer fire inside a forked session.”）与提交 `f409caa21e71ce7beb158d29ffca1fed76216a64`（PR #4083，2026-09-29）；该 changeset 在标签 2.1.1 下不存在，因此这一行为尚未随 Release 发布。定时任务本体已发布：`packages/agent-core-v2/src/features/cron/configSection.ts` 与 `docs/zh/reference/tools.md` 的「定时任务」章节在标签 `@moonshot-ai/kimi-code@2.1.1` 下都能取到。`CronCreate` 说明还写明一次性任务最适合近期提醒，因为任务只在其会话在世时触发，应选择数小时或数天内的时刻而不是数周数月的远期；遥测事件为 `cron_scheduled`、`cron_fired`（带 recurring、coalesced_count、stale、buffered）、`cron_missed`（count）与 `cron_deleted`（task_id、agent_id）。Plan 模式对 `CronCreate` 与 `CronDelete` 给出 veto 文案，理由是它们会改动计划退出后才运行的排程工作、要求先 `ExitPlanMode`；非 main agent 调用三个工具都先于一切校验返回 `Cron tools are only supported by the main agent.`。首次发布版本可定位：中文更新日志 `## 0.5.0（2026-05-28）` 的「新功能」下有「新增定时任务」并写明「定时任务使用标准的 5 字段 cron 语法」，另有「修复 `kimi -p` 在目标仍活跃或有定时任务待触发时主轮次结束即退出的问题」与「移除定时任务工具描述中对不存在的 `kimi resume` 命令的引用」两条后续条目。中英文文档存在一处方向性冲突：英文工具文档写一次性任务落在 `:00` 或 `:30` 时 “are moved forward by up to 90 seconds”，而源码是负偏移（提前）、中文文档写「向前提前最多 90 秒」，据源码与中文文档记为提前。',
          status: '官方确认',
          sources: [
            'kimi-cron-tools-doc',
            'kimi-cron-tools-doc-v211',
            'kimi-cron-tools-doc-en',
            'kimi-cron-changelog',
            'kimi-cron-env-doc',
            'kimi-cron-data-doc',
            'kimi-slash-no-cron',
            'kimi-config-no-cron',
            'kimi-cli-session-flag',
            'kimi-cron-feature',
            'kimi-cron-service',
            'kimi-cron-create-tool',
            'kimi-cron-create-schema',
            'kimi-cron-create-desc',
            'kimi-cron-list-desc',
            'kimi-cron-delete-desc',
            'kimi-cron-config-section',
            'kimi-cron-jitter',
            'kimi-cron-envelope',
            'kimi-cron-ops',
            'kimi-cron-vis-store',
            'kimi-cron-fork-changeset',
            'kimi-cron-fork-commit',
          ],
        },
        qoder: {
          entry:
            '`/loop` 与 `/crontab` 都列在官方 Slash 命令参考里：`/loop` 的说明是 “Execute prompts or commands in a recurring loop”，`/crontab` 的说明是 “Open the scheduled and recurring task management panel.”，该页的 Next steps 同时指向 Goal、Scheduled Task 与 Loop Command 三份参考。`/loop [interval] [flags] <prompt>` 的间隔可作前导 token（`5m`、`2h`，匹配 `^\\d+[smhd]$`）或尾随 `every <N><unit>`／`every <N> <unit>` 子句（`every 20m`、`every 5 minutes`、`every 2 hours`），且只在 `every` 后跟时间表达式时才算间隔（`/loop check every PR` 里 `every` 属于提示词，因此走动态节奏）；单位 `s`/`m`/`h`/`d`，最小粒度 1 分钟，秒按 `ceil(N/60)` 向上取整并告知实际取值。flags 可出现在输入任意位置、在解析间隔前被剥离，因此 `/loop --max-turns 5 10m check the deploy` 仍把 `10m` 读作间隔而不是 `5`；重复的 flag 首个取值生效且所有副本都从提示词中移除。flags 为 `--durable`（落盘且无自动过期）、`--durable <N>d`（落盘并在 N 天后过期）、`--permanent`/`-p`（等同 `--durable` 且无过期）、`--max-turns <N>`（整数）、`--max-credits <N>`（允许小数，因为单轮花费常小于 1 credit），上限类 flag 同时接受空格与 `=` 两种写法。`--durable`/`--permanent` 只对固定间隔循环生效，动态节奏循环始终只在当前会话。特殊输入：`/loop` 无参数时若存在 `.qoder/loop.md` 就在动态节奏模式下循环该任务清单，否则显示用法；`/loop 5m`（有间隔无提示词）显示用法；只给 flags（`/loop --max-turns 3`）则每轮跑一次通用项目健康检查并用动态节奏。除 `/loop` 外，创建、列举与删除任务用 Agent 的定时任务工具，在对话里用自然语言提出即可（例如「每天早上 9 点检查并总结 CI 状态」「每周一 10 点生成上周提交摘要」「2 月 28 日下午 2:30 提醒我发布 release」），Qoder 会把描述解析成 cron 表达式并建任务；工具参数含 `maxTurns` 与 `maxCredits`（确认文案为 `Stops after N turns or M credits.`），动态节奏唤醒也接受这两个参数且对整个循环粘滞。',
          storage:
            '持久任务写入项目根目录的 `<project>/.qoder/scheduled_tasks.json`，跨进程重启保留；会话内任务只存内存，当前会话结束即消失。文件是任务列表，字段为 `id`（8 位十六进制任务标识）、`cron`（5 段表达式）、`prompt`（触发时排入的提示词文本或 Slash 命令）、`createdAt`（毫秒创建时间戳）、`lastFiredAt`（毫秒上次触发时间戳，周期任务回写）、`recurring`（是否周期任务）；durable 任务的上限与用量与其他字段一起存在同一文件里，另有 `fireCount`（生命周期运行次数，与 `maxTurns` 比较）、`creditsUsed`（累计花费，缺失表示从未计量、不等于 0）、`maxTurns`、`maxCredits`（缺省即无上限）。在这些字段出现之前写下的任务文件没有上限，因此照旧继续运行。默认提示词文件为项目内 `.qoder/loop.md`。',
          behavior:
            '两种节奏由是否给出间隔决定：固定间隔把间隔转成周期排程并登记为定时任务；动态节奏在每轮运行后由 Qoder 自己决定下一次是否值得运行，延迟夹在 60 到 3600 秒之间，一旦它不再排下一次唤醒循环就结束。周期任务创建成功后当前提示词立即执行一次，不等第一次 cron 触发；创建成功时 Qoder 会显示排程内容、对应周期、任务是否持久化、自动过期时间与用于取消的任务 ID。周期任务按 Cron 排程反复触发，从当前时间起重新排程，直到被显式删除或自动过期。一次性任务在下一个匹配时刻触发一次后自动删除。动态节奏模式下让 Qoder 停止即可结束循环并取消待触发的唤醒。若任务的下次排定运行时间在启动时已经过去（进程未运行期间错过），任务被识别为「错过」，启动时 Qoder 会通知你错过了任务，由你决定手动运行还是调整排程。需要精确日历排程（例如「每周一 9 点」）时官方指向定时任务而不是 `/loop`；需要「每 5 分钟」这类固定间隔时用更简单的 `/loop`。',
          scope:
            '单项目目录作用域：文件锁保证同一项目目录只有一个进程驱动调度，防止重复触发。上限 50 个任务，达到上限后必须先删除已有任务才能新建。周期任务默认在创建后 7 天自动过期并可被提前删除，需要长期运行的任务必须重建；用 `--durable` 创建则无自动过期，用 `--durable <N>d` 创建则在 N 天后过期。一次性任务触发后立即删除。达到预算上限与过期不是一回事：任务被移除且不能恢复，要继续只能开一个新循环。最小排程粒度受 cron 无秒字段限制为 1 分钟。',
          automation:
            '为防止大量任务同时触发，调度器给触发时刻加确定性抖动：周期任务最多延迟其间隔的 10%（封顶 15 分钟），一次性任务在对齐 30 分钟边界（整点与半点）时最多提前约 90 秒；抖动按任务 ID 计算且跨重启稳定。间隔到 cron 的换算为 `Nm`（N≤59）→ `*/N * * * *`、`Nm`（N≥60）→ `0 */H * * *`（H=N/60 且须整除 24 小时）、`Nh`（N≤23）→ `0 */N * * *`、`Nd` → `0 0 */N * *`（每 N 天的当地午夜）、`Ns` 按 `ceil(N/60)m` 处理；`7m`（会在 `:56` 到 `:00` 产生不均匀间隔）与 `90m`（cron 无法表达 1.5 小时）这类不能整除其单位的间隔会选最近的干净间隔，并在创建前告知圆整结果。预算上限是「到达即停」而不是「超出才停」：`--max-turns` 在每轮运行前检查，因此 `--max-turns 2` 恰好触发两次、不会有第三次；`--max-credits` 在一轮计量完成后检查，最后一轮可能略微超出上限（例如上限 3 而结果 3.2），但进行中的一轮绝不会被切断，因为已付费的工作会被丢弃；两者同时设置时先到达者停止循环，同一时刻都到达则消息报告轮数上限。只接受正数，调度工具会拒绝 `0` 与负数而不是静默丢弃（上限为 0 会在首次运行前就退役循环），已有任务文件里的非正数值被丢弃从而变成无上限。运行次数按任务生命周期累计而不是按会话，重启 Qoder CLI 不会重置，因此重启无法绕过上限。达到上限时用户看到 `Scheduled task a1b2c3d4 stopped: it used 2 of 2 turns.`（动态节奏模式为 `Loop stopped: it used 3 of 3 turns.`），Qoder 也收到同样通知，因此它会报告停止而不是继续当作循环仍在运行去推理或重建任务。cron 表达式按 CLI 运行所在的本地时区解释，`0 9 * * *` 表示 CLI 时区的每天 9:00。',
          persistence:
            'cron 为标准 5 段（分钟 0-59、小时 0-23、日 1-31、月 1-12、星期 0-6 且 0 为周日），支持通配 `*`、单值 `N`、步长 `*/N`、区间 `N-M`、列表 `N,M,...`；星期几 `7` 等价于 `0`；不支持 `L`、`W`、`?` 与 `MON` 这类名称别名，也没有秒字段；日与星期同时受限时按「或」语义，任一匹配即触发（标准 cron 行为）。会话内周期任务是默认形态，进程退出即停止；周期任务在创建后 7 天自动过期，除非用 `--durable`（无过期）或 `--durable <N>d`（自定义过期）创建，需要长期运行的任务必须重建。过期前可手动删除：在对话里给出任务 ID 请 Agent 删除，或在 `/crontab` 面板删除。动态节奏循环的上限与用量只在循环期间保存在内存里：粘滞（只需在启动循环的那条 `/loop` 上传一次，之后每次唤醒都生效，后续唤醒不重复传也不能移除上限），停止循环会同时清空上限与用量，因此下一条 `/loop` 从零开始而不是继承上一个循环的花费；达到上限会取消待触发的唤醒，循环不再醒来。',
          surfaces:
            '本页以 Qoder CLI 为准，`/loop` 与 `/crontab` 都在 CLI 的 Slash 命令参考中。`/crontab` 面板的 `USAGE` 列在两个上限都设置时显示 `3/10 turns · 12.5/50 credits`，没有上限时显示 `2 turns · 8.25 credits`，花费尚未计量时用短横线占位（`1/5 turns · —/50 credits`），从未运行且无上限的任务该列为空；任务详情页显示 `Turns 3 / 10 (stops at the limit)` 与 `Credits 12.5 / 50 (stops at the limit)`，按 `t` 编辑轮数上限、按 `b` 编辑积分上限，输入空值清除该上限、非正数不接受、`Esc` 取消，因此无需重建循环即可改上限。Cloud Mode（`--remote`）把任务跑在 Qoder 托管的云端 VM 上、本地终端只是入口，官方 Cloud Mode 页没有出现定时任务或 cron。官方文档站有公开的 CLI Release Notes 页（`docs.qoder.com/release-notes/qoder-cli`），据此可定位版本时间线：CLI 1.0.8（2026-05-28）的 “Loop & Hooks GA” 写明 “Made /loop command and cron scheduling tools generally available for all users”，CLI 1.1.8（2026-07-29）升级 `/loop` 让 Agent 自行决定唤醒间隔并支持任务持久化、同时新增 `/crontab` 面板，CLI 1.1.11 修复持久任务被无关会话激活并让归属会话可在 `/crontab` 管理，CLI 1.1.13 改进 `/crontab` 面板表头与间隔描述，CLI 1.1.19 新增任务预算（按参数或面板设置轮数与积分上限），CLI 1.1.42（2026-09-03）修复会话切换或同项目多会话时持久任务不运行并在 `OWNER` 列标注属于当前会话的任务；CLI 内的 `/release-notes` 命令查看同一份变更日志。',
          conditions:
            '官方把定时任务与 `/loop` 记在 CLI 文档树下（`cli/scheduled-tasks`、`cli/scheduled-reference`、`cli/loop`、`cli/loop-reference`），Slash 命令参考也列出 `/loop` 与 `/crontab`，因此属于 CLI Surface 而不是 IDE 或 QoderWork 能力。任务分两类：一次性任务（`recurring` 为 `false` 或省略）在下次匹配时刻触发一次后自动删除；周期任务（`recurring: true`）按周期反复触发直到被删除或自动过期。定时任务的提示词可以是 Slash 命令，`/loop 5m /babysit-prs` 会把 `/babysit-prs` 原样传递并在每次触发时像手动输入一样运行。`/crontab` 是管理面板而不是创建入口，创建仍走自然语言或 `/loop`。最小排程粒度受 cron 无秒字段限制为 1 分钟。定时任务适合定期巡检、周期报表与计划性自动化，官方把它与需要固定间隔重复同一动作的 `/loop` 场景区分开。官方 CLI Tools 页在 “Delegate and Automate” 分组下列出一行 “Scheduled work | Create or manage scheduled tasks when scheduling is enabled.”，并注明 “Availability depends on product configuration, feature flags, and the current session.”，但没有公布该工具的标识符，也没有给出 “scheduling is enabled” 对应的配置键或功能开关名，因此工具名记为未确认；官方 CLI 设置参考与命令行参考中都没有任何调度相关的配置键、环境变量或启动参数。Surface 边界：Qoder IDE 另有独立的 Automations 机制（侧栏 **Automations**，入口为 **Create with Qoder** 与 **New automation**，可选 local 或 cloud execution，结果收在 **Run history**），它不使用 cron 字符串也不写 `.qoder/scheduled_tasks.json`，与本页的 CLI 定时任务是两套东西；QoderWake 是另一个产品、有自己的 CLI 与守护进程，其自动任务能力不计入 Qoder CLI。',
          status: '官方确认',
          sources: [
            'qoder-commands',
            'qoder-scheduled-tasks',
            'qoder-scheduled-reference',
            'qoder-loop',
            'qoder-loop-reference',
            'qoder-cloud-mode',
            'qoder-release-notes',
            'qoder-tools-delegate',
            'qoder-ide-automations',
            'qoder-settings',
          ],
        },
      },
      related: [
        'session-resume',
        'session-messaging',
        'execution-background',
        'cmd-tasks',
        'cmd-goal',
        'surface-channels',
      ],
    }),
  });
})();

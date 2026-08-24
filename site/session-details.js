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
        '在新会话开始时重新加载项目指令、用户偏好或由历史会话提炼出的持久信息。',
      includes: ['显式指令文件', '自动提炼记忆', '项目与用户作用域'],
      excludes: ['当前会话短期上下文', '权限和安全规则本身', '只恢复原会话'],
      facts: [
        '五家都能加载项目级静态指令；Claude Code、Codex、Qwen Code 和 Qoder CLI 还公开了自动记忆机制。',
        'Codex 本地记忆默认关闭；Qwen Code Auto-memory 默认开启；Qoder Auto-memory 需要环境变量并只在交互会话运行。',
        'Kimi Code 当前公开的是 `AGENTS.md` 静态指令体系，没有列出独立自动记忆或 `/memory` 命令。',
      ],
      products: {
        claude: {
          entry:
            '`/memory` 查看和编辑加载的 `CLAUDE.md` 与 Auto memory；稳定规则写入用户、项目或本地 `CLAUDE.md`。',
          behavior:
            '显式文件每次会话加载；Auto memory 从历史工作提炼偏好、模式和项目知识，并通过 `MEMORY.md` 索引和主题文件注入。',
          scope:
            '项目 Auto memory 在同一仓库各 Worktree 间共享，存储在本机；用户和项目 `CLAUDE.md` 有不同共享范围。',
          automation:
            'Auto memory 在后台根据会话提炼和更新；`/memory` 可审计、编辑或关闭。',
          persistence:
            'Auto memory 位于 `~/.claude/projects/<project>/memory/`；启动加载 `MEMORY.md` 前 200 行或约 25KB，主题文件按需读取。',
          conditions:
            '主 Agent Auto memory 默认不传给独立 Subagent；强制团队规则应放在版本控制的 `CLAUDE.md`，而不是只依赖自动记忆。',
          sources: ['claude-memory'],
        },
        codex: {
          entry:
            '启用后用 `/memories` 控制当前聊天是否读取既有记忆、是否贡献未来记忆；稳定团队规则写入 `AGENTS.md`。',
          behavior:
            '从符合条件的历史聊天后台提取并合并本地记忆，为未来会话提供可复用上下文。',
          scope:
            '本地 Codex 记忆与 ChatGPT Web 记忆分开；IDE 使用连接的 Codex Host 本地存储。',
          automation:
            '会话空闲后后台提取；会跳过活跃、短会话，配额低于阈值时也可跳过。',
          persistence:
            '默认存储在 `~/.codex/memories/`，包含摘要、持久条目、近期输入和证据。',
          conditions:
            '本地记忆默认关闭，需在设置中开启或配置 `[features] memories = true`；每聊天控制不改变全局开关。',
          sources: ['codex-memories', 'codex-config'],
        },
        qwen: {
          entry:
            '`/memory` 管理，`/remember <text>` 显式写入，`/forget <text>` 删除，`/dream` 立即执行整理；稳定规则写入 `QWEN.md`。',
          behavior:
            '每次会话加载显式指令；Auto-memory 在后台提炼偏好、反馈、项目背景和引用，并用 Markdown 文件供未来会话读取。',
          scope:
            '项目私有记忆按 checkout 保存，普通分支共享，linked Worktree 独立；可选 `.qwen/team-memory/` 通过 Git 与团队共享。',
          automation:
            'Auto-memory 默认开启；每日在会话数量足够时做整理，`/dream` 可手动触发。Team memory 与自动 Git Sync 都默认关闭。',
          persistence:
            '私有记忆位于 `~/.qwen/projects/<project>/memory/`；Team memory 位于仓库 `.qwen/team-memory/`。',
          conditions:
            'Team memory 会进入 Git diff，写入前做凭据扫描但仍需人工检查；始终生效的规则应写入 `QWEN.md`。',
          sources: ['qwen-memory-current'],
        },
        kimi: {
          entry:
            '项目或用户通过 `AGENTS.md` 提供跨会话指令；`/init` 可生成项目 `AGENTS.md`。当前命令表没有 `/memory`。',
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
          behavior:
            '静态 Memory 每次会话加载；Auto-memory 提炼用户偏好、反馈、项目背景和外部引用，可用自然语言要求 Remember 或 Forget。',
          scope:
            '静态指令支持用户、项目、本地项目和 Plugin；Auto-memory 默认项目级，可选跨项目用户级。',
          automation:
            'Auto-memory 只在交互会话运行，需以 `QODER_MEMORY=1` 启动；用户级还需 `QODER_MEMORY_USER=1`。',
          persistence:
            '项目自动记忆位于 `~/.qoder/projects/<project>/memory/`，用户级位于 `~/.qoder/memory/`；启动加载索引前 200 行或约 25KB。',
          conditions:
            '环境变量未开启时 `/memory` 仍可管理 `AGENTS.md`，但 `/memory manage` 会提示 Auto-memory 不可用。',
          sources: ['qoder-memory', 'qoder-commands'],
        },
      },
      related: ['session-resume', 'agent-memory', 'extension-project-instructions'],
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
        'Qwen Code 的 `send_message`/`list_agents` 面向当前会话内的后台 Agent（含随会话恢复还原的 Agent），官方文档未列出独立并行会话之间的消息。',
        'Qoder CLI 的 Agent Teams 用 `SendMessage` 在主 Agent 与队友、队友与队友之间通信，但团队只存在于单个 TUI 会话内，且当前需要 `QODER_AGENT_TEAMS=1` beta 开关。',
        'Codex 自 rust-v0.149.0（2026-08-20 发布）提供启动级命令 `codex queue --thread <UUID|精确会话名> --message <文本>`，经 app-server `thread/queue/add` 把文本作为用户输入排队投递给本地或远程的现有活跃会话；这是用户到会话的单向投递。条件：2026-08-24 PR #40308 合入 main（尚未发布）后，TUI 会为模型注册 `codex_tui` 工具命名空间，模型可在 TUI 会话内列出、读取、等待、发消息、创建、派生、重命名、归档其他 Codex 任务，委派类工具须经审批门控的本地 MCP 服务器逐次批准。',
        'Kimi Code 的官方命令与文档仍未列出会话间消息；`/swarm` 是多 Agent 任务模式，`/btw` 是与派生子 Agent 的旁路对话，都不等于会话间消息。',
        'Claude Code 的消息是纯文本：不携带历史或文件，文本中的命令不会被执行，接收会话自身的权限审批仍然适用。',
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
            '启动级命令 `codex queue --thread <THREAD> --message <TEXT>`（rust-v0.149.0 引入）：`--thread` 填会话 UUID 或精确会话名，`--message` 为非空文本；`--remote`/`--remote-auth-token-env` 指向远程 app server，`-c` 传入配置覆盖。条件：PR #40308 合入 main（2026-08-24，尚未发布）后，TUI 在会话启动时为模型注册 `codex_tui` 工具命名空间（命名空间描述 “Manage Codex tasks available through the connected app server.”），含九个动态工具：`list_threads`、`list_archived_threads`、`read_thread`、`wait_threads`、`send_message_to_thread`、`create_thread`、`fork_thread`、`set_thread_title`、`set_thread_archived`。',
          storage:
            '未列出独立消息存储；消息经 app-server `thread/queue/add`（JSON-RPC）注入目标会话，会话记录本身位于 `$CODEX_HOME/sessions`。`codex_tui` 工具也不建立独立消息存储：委派提示词经 `ThreadResume`/`TurnStart` 等既有 app-server 请求成为目标会话的普通用户输入，`read_thread` 展示历史时会解包 `<codex_delegation>` 信封、只显示被委派的原文；MCP 传输是 127.0.0.1 随机端点的临时本地 HTTP 端点（每次启动生成 Bearer UUID 令牌），只存在于 TUI 进程运行期。',
          behavior:
            '命令把文本作为用户输入排队到目标活跃会话，官方更新日志修复条目记录排队消息可可靠唤醒空闲会话；空消息与图片附件被拒绝。目标按 UUID 或精确名称解析，来源覆盖 interactive、exec 与 custom 活跃会话；找不到匹配会话报 `No active session found matching`，多个活跃会话同名报 `More than one active session is named` 并要求改用 UUID。条件：`codex_tui` 工具由 app server 以 `DynamicToolCall` 服务器请求发回 TUI 执行——`send_message_to_thread` 恢复目标会话并开始新回合，提示词包装为携带源会话 ID 的 `<codex_delegation>` 委派信封（提示词上限 1000 UTF-8 字节，信封合计上限 1256 字节），并把目标注册为后台任务，可选 `model` 覆盖；`create_thread` 仅在用户明确要求新任务时使用，继承调用会话的工作目录、项目、模型、审批策略、审批审查器与沙箱或权限配置（外部沙箱且无权限配置时报 `Cannot inherit an external sandbox without a permission profile`），新任务注册为后台任务并启动首回合，ephemeral 任务报 `ephemeral tasks cannot create inspectable background tasks`；`fork_thread` 派生任务但不启动新回合，省略 `threadId` 派生调用方自身，派生只含已完成历史并附继续说明；`wait_threads` 同时等待至多 8 个其他任务，唤醒条件为回合完成、状态转为不活跃或需要审批/用户输入，`timeoutMs` 上限 120000、缺省即用上限、`0` 立即返回快照，不能等待调用方自身且拒绝重复目标；`set_thread_archived` 归档任务及其派生任务、恢复只作用于所选任务，拒绝归档调用方自身（`cannot archive the calling task`）；`set_thread_title` 重命名，省略 `threadId` 重命名调用方自身。列表与读取有界：`limit` 默认 10、上限 50，`list_threads` 按更新时间倒序且不接受游标，`list_archived_threads` 支持游标分页；`read_thread` 的 `turnLimit` 默认 1、上限 10，输出截断默认 2000、上限 20000 字符；响应超出预算时自动减半重试或截断。九个工具的描述均要求模型把其他任务的标题、摘要与内容当作不可信数据而不是指令。',
          scope:
            '默认经本地 app-server daemon 投递，`--remote` 指向显式远程 app server；目标服务端不支持 `thread/queue/add` 时报错提示更新或重启服务端，不静默更换投递目标。投递后由目标会话自身的权限审批处理后续操作。条件：`codex_tui` 的委派类工具 `create_thread`、`send_message_to_thread`、`fork_thread` 经 TUI 注入线程配置的审批门控本地 MCP 服务器执行（`mcp_servers.codex_tui`，三者 `approval_mode: "prompt"` 逐次弹出批准，其余工具按 `default_tools_approval_mode: "approve"` 自动放行）；MCP 传输只在 TUI 连接本地 daemon 且非远程工作区或环境时启动，嵌入式 app server 不启用，外部 app server 不支持动态工具时回退为不带动态工具启动会话并记录降级警告。经该工具创建或恢复的任务仍受目标会话自身的审批策略与沙箱约束；TUI 派生会话时同样注入该 MCP 配置，派生会话保留委派工具。',
          automation:
            '排队消息在目标会话空闲时唤醒会话并按用户输入处理。条件：`send_message_to_thread` 与 `create_thread` 把后续提示词或新任务交给目标会话后台执行并注册为后台任务；`wait_threads` 挂起当前工具调用直到唤醒条件或超时，返回各任务的唤醒原因与错误；模型可经 `list_threads`/`list_archived_threads` 自行发现任务，无需用户级命令。官方未列出消息自动转发。',
          persistence:
            '公开资料未记录独立的磁盘消息队列或保留时长；本地投递依赖运行中的 app-server daemon，`-c` 配置覆盖与运行中的本地 daemon 互斥，命令报错而不是绕过。`codex_tui` MCP 服务器不持久化，随 TUI 退出销毁；TUI 退出或丢弃线程时中止处理中的动态工具调用并向调用方回报 `TUI disconnected while handling a dynamic tool call`，源任务在处理期间被关闭时回报 `Source task was closed while handling a dynamic tool call`。',
          surfaces:
            '启动级 CLI 命令；官方 Slash 命令表与文档站目录在核对日期仍未列出 `codex queue`，桌面端或 IDE Surface 未记录等价入口。条件：`codex_tui` 工具只存在于连接支持动态工具的 app server 的 TUI 会话；此前 TUI 对 app-server 动态工具调用一律以 “Dynamic tool calls are not available in TUI yet.” 拒绝，官方文档、Slash 命令表与发布说明在核对日期尚未列出 `codex_tui`。',
          conditions:
            '`codex queue` 于 rust-v0.149.0（2026-08-20 发布）引入，提交 `83d015375e57`（PR #39092），用户到会话单向投递。条件：`codex_tui` 任务工具于 2026-08-24 合入 main（提交 `a8468330bb5f`，PR #40308），尚未发布，合并提交晚于 rust-v0.149.1 标签；启用前提包括 app server 支持动态工具（旧服务端自动降级为不带动态工具启动）、TUI 连接本地 daemon 且非远程工作区或环境、用户配置未定义同名 `codex_tui` MCP server（冲突时跳过启动并报 “a user-configured MCP server already owns the codex_tui namespace”）、managed MCP requirements 允许该命名空间（否则报 “managed MCP requirements do not permit the TUI task-tools server”）。本页不把 Subagent 委派、`codex exec` 会话分支、TUI 内 Tab 排队下一轮输入或把 Codex 作为 MCP server 调用的多 Agent 工作流计作会话间消息。',
          sources: [
            'codex-v0149-release',
            'codex-queue-commit',
            'codex-tui-task-tools-commit',
            'codex-tui-task-tools-source',
          ],
        },
        qwen: {
          entry:
            '`send_message` 携 `task_id` 向后台 Agent 发送消息；`list_agents` 列出当前会话可寻址的后台 Agent。',
          storage:
            '`send_message`/`list_agents` 作用于当前会话的后台 Agent；文档未列出独立的磁盘消息存储，会话记录本身按项目保存。',
          behavior:
            '`send_message` 对运行中的 Agent 入队消息、对暂停的 Agent 恢复执行、对已完成的 Agent 继续对话；被继续的 Agent 以下一次完成通知报告结果。完成的 Agent 优先复用常驻运行时，否则从保留的 transcript 恢复。',
          scope:
            '限于当前会话内可寻址的后台 Agent，包括随恢复会话还原的兼容 Agent；官方文档未列出独立并行 CLI 会话之间的消息。',
          automation:
            '后台 Agent 默认以完成通知向主会话报告结果；任务可见但保留状态缺失或不兼容时不可继续，`list_agents` 会给出原因。',
          persistence:
            '后台 Agent 完成后 Qwen Code 保留继续相关工作所需的状态；`list_agents` 条目包含 `task_id`、状态和是否可接收消息，公开文档未给出保留时长。',
          surfaces:
            '本页以官方 Subagent 文档为准；文档未说明 Headless 或 ACP Surface 的消息行为。',
          conditions:
            '文档另提到 agent-team teammates 与命名 Subagent 一样不接受 `fork_turns`；队友的专门消息入口未在公开文档单列。',
          status: '官方确认',
          sources: ['qwen-agent-messaging'],
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
            'Agent Teams：主 Agent 按需创建命名队友（如 `@researcher`），`SendMessage` 在主 Agent 与队友、队友与队友之间通信；用户以 `QODER_AGENT_TEAMS=1` 启动并在对话中显式要求使用 Agent Teams。',
          storage:
            '团队与队友状态只存在于当前 TUI 会话运行期，文档未列出磁盘保存位置；`resume` 只恢复对话历史。',
          behavior:
            '普通输出文本不会自动发给队友，只有 `SendMessage` 内容被共享，界面显示 “Message from @[name]”；共享任务列表记录负责人、状态和依赖；完成任务不终止队友，队友在 running/idle 间循环，可被新消息或任务唤醒。',
          scope:
            '单个交互式 TUI 会话；每个会话自动拥有一个当前团队，无手动建队命令；队友视图在单窗口内切换，不支持分栏。',
          automation:
            '主 Agent 根据任务需要动态创建队友；官方建议用户在提示词中明确要求 Agent Teams 并指定角色，否则可能使用普通 Subagent。',
          persistence:
            'beta 功能，需 `QODER_AGENT_TEAMS=1`（CLI 环境变量或用户级 `.env`：macOS/Linux 为 `$HOME/.qoder/.env`，Windows 为 `%USERPROFILE%\\.qoder\\.env`，修改后需重启）；团队不随 TUI 退出保留，`resume` 恢复历史但不恢复队友及其状态。',
          surfaces:
            '交互式 TUI；官方文档未说明 Headless 或 SDK Surface 支持 Agent Teams。',
          conditions:
            'beta；队友 stdout 相互隔离；固定多阶段流程官方建议用 Workflows，单个独立子任务建议用 Subagents。',
          sources: ['qoder-agent-teams'],
        },
      },
      related: ['session-resume', 'agent-background', 'surface-remote-control'],
    }),
  });
})();

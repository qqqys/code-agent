(() => {
  const rows = Object.fromEntries(
    window.matrixData.rows
      .filter((row) => row.category === 'execution')
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
      value.includes('仅') ||
      value.includes('无内置') ||
      value.includes('自定义') ||
      value.includes('依')
    ) {
      return '条件项';
    }
    return profiles[productId].status;
  }

  function record(productId, fields) {
    return {
      value: fields.value,
      entry: fields.entry,
      primitives: fields.primitives,
      behavior: fields.behavior,
      scope: fields.scope,
      background: fields.background,
      integration: fields.integration,
      artifacts: fields.artifacts,
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
    if (!row) throw new Error(`Unknown execution capability: ${id}`);

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
    'execution-files': createDetail({
      id: 'execution-files',
      definition:
        '读取文本或媒体文件，并通过精确替换、补丁、整文件写入或 Notebook 单元编辑修改工作区内容。',
      includes: [
        '文件读取、创建、覆盖和局部修改',
        'Notebook 或媒体文件的专用入口',
        '修改前读取、权限审批与工作区边界',
      ],
      excludes: [
        '仅由 Shell 命令完成的文件操作',
        '代码搜索和符号导航',
        'Git 暂存、提交与回退',
      ],
      facts: [
        '五家都提供模型可直接调用的文件读写能力，不需要先拼接 Shell 命令。',
        'Claude Code、Qwen Code 和 Qoder CLI 单独提供 Notebook 编辑工具；Kimi Code 的当前工具表把媒体读取与文本读取分开。',
        '工具名称相近不代表审批相同：只读工具通常可直接运行，写入和编辑仍受各自权限模式、工作区边界与沙箱约束。',
        '换行处理不同：Codex `apply_patch` 默认把更新文件归一为 LF，`apply_patch_preserve_line_endings` 开关（已合入 main，尚未发布）启用后才保留原换行；Qwen Code `edit` 默认检测并保留原换行风格。Claude Code、Kimi Code 与 Qoder CLI 的官方工具文档未列同类换行保留或规范化配置。',
      ],
      products: {
        claude: {
          entry:
            '模型调用 `Read`、`Edit`、`Write`；Notebook 使用 `NotebookEdit`，图片和 PDF 可由 `Read` 读取。',
          primitives:
            '`Read` 支持文本、图片、PDF 与 Notebook；`Edit` 做精确替换；`Write` 创建或覆盖；`NotebookEdit` 修改单元。',
          behavior:
            '`Edit` 与 `Write` 会触发文件修改权限检查；读取和搜索工具默认不要求权限。编辑后 LSP 可自动回报类型错误。',
          scope:
            '以当前项目目录和已加入的工作目录为主要范围；目录外访问由文件权限规则决定。',
          background:
            '文件工具本身同步返回；可由后台 Agent 或 Worktree 会话并行调用。',
          integration:
            'IDE 扩展可把修改显示在原生 Diff 视图；Hooks 可在工具调用前后校验或阻止变更。',
          artifacts:
            '修改直接落在当前工作区或当前 Worktree；检查点与 Git 决定后续回退方式。',
          conditions:
            '工具可被 `permissions.deny`、Subagent 工具列表或 Plugin 配置移除；Plan 模式会限制写入。官方工具参考未列 `Edit`/`Write` 的换行保留或规范化配置。',
          sources: ['claude-tools', 'claude-permissions'],
        },
        codex: {
          entry:
            '模型使用内置文件读取与补丁编辑能力；需要整文件或批量机械操作时也可通过 Shell 完成。',
          primitives:
            '核心路径是读取文件后提交结构化补丁；`apply_patch` 默认 `NormalizeToLf`（把更新文件归一为 LF），main 分支新增 `PreserveLineEndings` 模式：未改动行保留原换行，插入行采用文件首个已有换行风格，文件无换行时用 LF。当前公开文档不要求用户记住内部工具名。',
          behavior:
            '补丁在应用前后仍受当前审批预设和文件系统沙箱控制；只读模式不会允许持久修改。',
          scope:
            '默认受当前工作区、额外可写目录和所选沙箱边界约束；桌面 App Worktree 会把落盘位置切到隔离目录。',
          background:
            '文件编辑随当前 Agent 线程执行；并发 Subagent 仍共享父线程审批与沙箱边界。',
          integration:
            '桌面 App 和 IDE 可展示 Diff；App Review pane 支持对改动进行暂存或回退。',
          artifacts:
            '结果是工作区文件修改和可审阅 Diff；不会因为生成补丁自动创建提交。',
          conditions:
            '实际可写范围取决于 Read Only、Auto 等权限预设以及运行时沙箱；Cloud 任务使用远端环境。条件：`config.toml` 的 `[features]` 下 `apply_patch_preserve_line_endings` 开关（默认关闭、UnderDevelopment 阶段）启用换行保留；启用后进程内 apply_patch 直接读取该 Feature，Core 同时清除继承值并向子进程环境注入 `CODEX_APPLY_PATCH_PRESERVE_LINE_ENDINGS=1`，独立 `apply_patch` 可执行文件按该环境变量选择模式。该开关 2026-08-10 合入 main 分支，尚未进入 Release，官方配置参考未列出。',
          status: '源码确认',
          sources: [
            'codex-docs',
            'codex-approvals',
            'codex-review',
            'codex-apply-patch-mode',
            'codex-apply-patch-preserve-flag',
          ],
        },
        qwen: {
          entry:
            '模型调用 `read_file`、`edit`、`write_file` 和 `notebook_edit`；目录浏览使用 `list_directory`。',
          primitives:
            '`read_file` 分页读取；`edit` 做受控替换；`write_file` 写入完整内容；`notebook_edit` 修改 Notebook 单元。',
          behavior:
            '读取与编辑分别经过路径权限、工作区信任和 approval mode；读后再改规则可阻止模型基于过期内容直接覆盖。`edit` 匹配前把 CRLF 归一为 LF，写回已有文件时按检测到的原换行风格恢复。',
          scope:
            '默认工作区是启动目录；`--include-directories`、Worktree 或 Daemon workspace 可改变有效路径范围。',
          background:
            '后台 Agent 可使用文件工具；普通文件工具调用自身不是长驻任务。',
          integration:
            'VS Code Companion 可打开原生 Diff；PreToolUse、PostToolUse 和 Permission Hooks 可观察或阻止调用。',
          artifacts:
            '修改写入当前工作区、当前 Worktree 或显式 Agent 工作目录；不会自动暂存或提交。',
          conditions:
            'Plan mode 禁止普通写入；auto-edit、auto、yolo 对审批的处理不同，沙箱仍是独立边界。',
          sources: [
            'qwen-tools-current',
            'qwen-settings',
            'qwen-worktree-current',
            'qwen-edit-tool',
          ],
        },
        kimi: {
          entry:
            '模型调用 `Read`、`Write`、`Edit`；图片和视频使用 `ReadMediaFile`。',
          primitives:
            '`Read` 最多返回 1000 行或 100 KB；`Write` 支持 overwrite/append；`Edit` 支持唯一匹配或 `replace_all`。',
          behavior:
            'Read 默认放行，Write/Edit 默认需审批；Grep/Glob 会过滤敏感文件，写入缺失父目录时会自动创建。',
          scope:
            '相对路径基于当前工作目录；权限模式和工具策略继续限制路径与写入。',
          background:
            '文件调用同步完成；后台 Agent 使用独立上下文，但默认仍操作被分配的同一工作目录。',
          integration:
            'TUI、Web 与 VS Code Surface 可渲染文件修改和工具调用；Hooks 走统一工具执行链。',
          artifacts:
            '写入直接落盘；会话日志记录工具事件，但不会自动把修改变成 Git 提交。',
          conditions:
            'Plan 模式下 Write/Edit 只允许写计划文件；YOLO 跳过普通审批但不改变文件系统权限。官方工具文档未列换行保留或规范化配置；`Write` 的 append 模式不自动补换行。',
          sources: ['kimi-tools-current', 'kimi-config-current'],
        },
        qoder: {
          entry:
            '模型调用 `Read`、`Edit`、`Write` 与 `NotebookEdit`；SDK 可通过 `tools`、`allowedTools`、`disallowedTools` 控制暴露。',
          primitives:
            '内置工具覆盖文本读取、局部编辑、整文件写入和 Notebook 编辑，工具输入输出在 SDK Reference 中有类型定义。',
          behavior:
            'Edit 权限规则同时覆盖 Edit、Write 和 NotebookEdit；Read 与 Edit 可按路径模式细分 Allow、Ask、Deny。',
          scope:
            '当前 workspace 是主要目录；`--add-dir`、`/add-dir` 或 `permissions.additionalDirectories` 可增加可信目录。',
          background:
            '文件工具本身同步返回；Subagent、Worktree Job 或 Cloud task 可并行运行。',
          integration:
            'TUI、Headless、ACP 和 Agent SDK 共用内置工具集合，但每个入口可进一步过滤工具。',
          artifacts:
            '修改写入当前 workspace 或所选 Worktree；是否进入提交由后续 Git 操作决定。',
          conditions:
            '权限规则、Subagent `tools`/`disallowedTools` 和 SDK query options 都可能缩小可用集合。官方内置工具文档未列换行保留或规范化配置。',
          sources: ['qoder-tools', 'qoder-permissions', 'qoder-sdk-reference'],
        },
      },
      related: ['execution-search', 'execution-git', 'security-filesystem'],
    }),

    'execution-shell': createDetail({
      id: 'execution-shell',
      definition:
        '由 Agent 启动本地命令行进程，用于构建、测试、包管理、Git、脚本和其他系统工具。',
      includes: [
        '模型调用的 Shell 工具',
        '前台执行、超时、工作目录和命令输出',
        '用户直接输入 Shell 命令的快捷入口',
      ],
      excludes: [
        '产品专用 GitHub Action',
        '云端任务环境的完整生命周期',
        'MCP Server 中自定义的远程命令工具',
      ],
      facts: [
        '五家都把 Shell 作为通用执行底座，因此“支持 Git/测试”通常首先意味着能运行相应 CLI，而不是提供独立语义 API。',
        'Kimi Code 和 Qwen Code 对后台 Shell 暴露了明确参数；Codex 使用统一 PTY 执行并通过 `/ps`、`/stop` 管理后台进程。',
        'Shell 的宿主权限、审批与沙箱是三个不同层次：自动批准不等于容器隔离，沙箱也不等于命令必然成功。',
      ],
      products: {
        claude: {
          entry:
            '模型调用 `Bash`；用户可用 `! <command>` 直接执行。Windows 可按配置启用原生 `PowerShell` 工具。',
          primitives:
            '`Bash` 接受命令并在持久 Shell 会话中运行；命令可读写文件、运行 Git 和开发工具链。',
          behavior:
            '需要权限审批，规则可按命令前缀匹配；Shell 工作目录会按项目策略维护或重置。',
          scope:
            '运行于当前本地会话或 Worktree 的环境；Web、Desktop 与 CI 使用各自宿主。',
          background:
            '`/background` 分离整个会话；后台 Bash 和 `/tasks` 管理会话内任务；`Monitor` 适合持续观察日志、PR 或 CI 状态。',
          integration:
            'Bash 权限规则也用于 Monitor；Hooks 可在执行前改写、允许或拒绝工具调用。',
          artifacts:
            'stdout/stderr 回到会话；文件、进程和 Git 修改保留在宿主环境。',
          conditions:
            '默认需要审批；Sandbox、Managed settings 和 deny 规则可能限制文件、网络或命令。',
          sources: ['claude-tools', 'claude-commands', 'claude-sandboxing'],
        },
        codex: {
          entry:
            '模型通过统一 PTY Shell 运行命令；用户在任务中直接描述要执行的构建、测试或 Git 操作。',
          primitives:
            '同一执行通道支持短命令、交互式进程和持续输出；读写仍受当前沙箱边界。',
          behavior:
            '命令在审批策略允许后启动；危险操作可要求单次确认或被规则阻止。',
          scope:
            '本地 CLI/IDE 使用本机工作区，App Worktree 使用隔离目录，Cloud 使用配置好的远端环境。',
          background:
            '`/ps` 查看后台终端及近期输出，`/stop` 停止全部后台终端。',
          integration:
            'Hooks 可观察 command 执行；`codex exec` 可把同一执行能力放入脚本和 CI。',
          artifacts:
            '输出进入当前线程；进程、文件和 Git 状态保留在相应本地或云环境。',
          conditions:
            'Read Only 等预设会阻止写入型命令；网络和目录访问由沙箱配置决定。',
          sources: ['codex-docs', 'codex-commands', 'codex-approvals'],
        },
        qwen: {
          entry:
            '模型调用 `run_shell_command`；提示行也支持 Shell 输入处理器。',
          primitives:
            '参数包含 `command`、`description`、`directory` 和 `is_background`；命令输出由 PTY/子进程执行层收集。',
          behavior:
            '前台命令阻塞当前工具调用；长任务可原生后台化，TUI 中也可按 `Ctrl+B` 把正在运行的前台命令转入后台。',
          scope:
            '工作目录默认是当前 workspace；Worktree 激活后所有 Shell 调用路由到 Worktree。',
          background:
            '`is_background: true` 返回 task id；`/tasks` 查看状态；`task_stop` 精确停止。后台模式拒绝 `git commit`。',
          integration:
            'Approval mode、Sandbox、Hooks 和自动安全分类器共同决定命令是否运行。',
          artifacts:
            '前台输出直接回到模型；后台输出保存在任务日志并可从任务面板读取。',
          conditions:
            '裸 `&` 不作为受管后台机制；交互命令可能需要 TTY；后台 Git commit 被明确拒绝。',
          sources: [
            'qwen-shell-current',
            'qwen-session-commands',
            'qwen-worktree-current',
          ],
        },
        kimi: {
          entry:
            '模型调用 `Bash`；参数包含 `command`、`cwd`、`timeout`、`run_in_background` 和 `disable_timeout`。',
          primitives:
            '前台默认超时 60 秒、最长 5 分钟；后台默认 10 分钟，print 模式默认无超时。',
          behavior:
            'stdout/stderr 在 TUI 工具卡片流式显示；前台超时默认转成后台任务，而不是直接杀进程。',
          scope:
            '命令基于当前工作目录或显式 `cwd`；Windows 默认使用 Git Bash。',
          background:
            '后台立即返回 task id，结束后通知 Agent；停止采用 SIGTERM、5 秒宽限、SIGKILL 两阶段。',
          integration:
            'Bash 与 TaskList、TaskOutput、TaskStop 组成完整的长任务管理链。',
          artifacts:
            '完整后台日志保存在磁盘，TaskOutput 内联最近 32 KB 并返回输出路径。',
          conditions:
            'stdin 始终关闭，交互式命令会收到 EOF；Bash 默认需要审批。',
          sources: ['kimi-tools-current', 'kimi-config-current'],
        },
        qoder: {
          entry:
            '模型调用 `Bash`；TUI 中输入 `!` 可切换 Bash 模式并由用户直接执行命令。',
          primitives:
            'SDK 内置工具表提供 `BashInput`/`BashOutput` 类型；工具可被 query options 显式允许或拒绝。',
          behavior:
            '命令遵守 Allow、Ask、Deny 规则和当前 workspace 边界。',
          scope:
            '本地 TUI/Headless、Worktree Job、Cloud Mode 与 SDK 分别在其宿主环境运行。',
          background:
            '后台任务可通过 `/tasks` 及 TaskOutput、TaskStop 管理；具体 Bash 参数以当前 CLI 版本工具表为准。',
          integration:
            'Qoder Action 在 GitHub Runner 上调用同一类 CLI 能力；ACP 和 SDK 也能暴露 Bash。',
          artifacts:
            '输出进入任务记录；文件与进程留在本地、Worktree、容器或 Cloud VM。',
          conditions:
            '工具可能被权限规则、Subagent 配置或 SDK `tools` 过滤；非交互运行需要合适认证。',
          sources: ['qoder-using-cli', 'qoder-tools', 'qoder-permissions'],
        },
      },
      related: ['execution-background', 'execution-git', 'security-approval'],
    }),

    'execution-search': createDetail({
      id: 'execution-search',
      definition:
        '按路径模式、文本正则或语言符号定位代码，并把有限结果送回模型继续阅读和修改。',
      includes: [
        'Glob 文件发现与 Grep 全文检索',
        '符号定义、引用、类型和调用层级导航',
        '忽略文件、分页、截断和敏感文件过滤',
      ],
      excludes: [
        '互联网搜索',
        '向量化代码索引产品',
        '由用户手工运行但未被产品封装的任意搜索脚本',
      ],
      facts: [
        'Claude Code、Qwen Code 提供 Glob、Grep 与 LSP 三层搜索；Kimi Code、Qoder CLI 的公开内置表确认 Glob 与 Grep。',
        'Codex 可以通过内置搜索和 Shell 中的 `rg`/`find` 完成仓库检索，但当前公开文档没有同样的固定工具名清单。',
        '搜索结果都需要分页或截断；“命中 0 条”不能自动证明代码不存在，还要考虑忽略规则、范围与工具上限。',
      ],
      products: {
        claude: {
          entry:
            '`Glob` 按模式找文件，`Grep` 搜文本，`LSP` 做定义、引用、类型、实现和调用层级导航。',
          primitives:
            'Glob/Grep 是内置只读工具；LSP 由语言插件提供并连接相应 Language Server。',
          behavior:
            'Glob/Grep 默认不要求权限；LSP 在文件编辑后还能主动返回类型错误和警告。',
          scope:
            '从当前项目和允许目录搜索；规则和忽略文件影响可见范围。',
          background:
            '单次搜索同步返回；大范围探索可委派给后台 Subagent。',
          integration:
            'LSP 与语言插件绑定；MCP 还能补充专用代码索引工具。',
          artifacts:
            '结果进入当前上下文，不写文件；后续 Read 决定读取哪些命中。',
          conditions:
            'LSP 需要安装插件及语言服务器；工具可被权限或 Subagent 工具列表移除。',
          sources: ['claude-tools'],
        },
        codex: {
          entry:
            'Agent 使用内置搜索能力，并可在 Shell 中运行 `rg`、`find`、Git 搜索或语言工具。',
          primitives:
            '搜索策略由任务和运行环境决定；公开文档没有要求稳定暴露 Glob/Grep/LSP 三个固定名称。',
          behavior:
            '通常先用快速文本或文件检索缩小范围，再读取具体文件；Shell 搜索遵守相同审批和沙箱。',
          scope:
            '当前 workspace、额外可读目录和沙箱决定可见代码。',
          background:
            '搜索可在当前线程或 Subagent 中执行；长命令可进入后台终端。',
          integration:
            '可通过 MCP、Plugin 或 Skill 接入额外索引和代码导航能力。',
          artifacts:
            '搜索输出进入会话，不直接修改文件。',
          conditions:
            '具体工具集合随 Codex Surface 和运行时变化；矩阵不把未公开内部工具名当稳定接口。',
          sources: ['codex-docs', 'codex-approvals'],
        },
        qwen: {
          entry:
            '`glob` 找文件，`grep_search` 搜文本，`list_directory` 浏览目录；实验 LSP 提供符号导航。',
          primitives:
            'Grep 基于 ripgrep；工具注册表还提供 LSP、Read 等组合探索能力。',
          behavior:
            '只读搜索通常自动允许；结果有数量和上下文限制，模型再按需 read_file。',
          scope:
            '搜索当前 workspace 和已加入目录；Worktree 激活后搜索隔离目录。',
          background:
            '单次工具同步返回；Explore/自定义 Agent 可并行搜索不同区域。',
          integration:
            'LSP 通过实验开关注册；Tool Search 可延迟发现扩展工具。',
          artifacts:
            '结果进入上下文，不写文件。',
          conditions:
            'LSP 只有启用 `--experimental-lsp` 时注册；Git ignore 与工具参数会影响命中。',
          sources: ['qwen-tools-current', 'qwen-session-commands'],
        },
        kimi: {
          entry:
            '`Grep` 基于 ripgrep 搜内容，`Glob` 按模式找文件；`Read` 读取命中。',
          primitives:
            'Grep 支持正则、文件类型、glob、上下文、多行、分页；Glob 最多返回 100 条并按修改时间倒序。',
          behavior:
            '两者默认自动放行并尊重 `.gitignore`、`.ignore`、`.rgignore`；可用 `include_ignored=true` 包含忽略文件。',
          scope:
            '指定 path 或当前工作目录；`.env`、私钥等敏感文件即使 include_ignored 也继续过滤。',
          background:
            '单次搜索同步完成；Explore Agent 可在后台并行探索。',
          integration:
            '搜索结果可直接驱动 Read/Edit；当前公开工具表没有独立 LSP 工具。',
          artifacts:
            '结果进入会话，不修改文件。',
          conditions:
            '达到条数上限会截断；敏感文件过滤不可由 include_ignored 绕过。',
          sources: ['kimi-tools-current', 'kimi-agents-execution-current'],
        },
        qoder: {
          entry:
            '`Glob` 按模式找文件，`Grep` 搜内容；SDK 可用 `tools: [Read, Grep, Glob]` 构造只读会话。',
          primitives:
            '工具输入输出由 SDK Reference 定义，可与 Read、Agent 和自定义 MCP 工具组合。',
          behavior:
            '搜索调用受 Read 权限规则和 workspace 范围控制。',
          scope:
            '当前 workspace 与 additionalDirectories；Worktree Job 搜索自己的隔离目录。',
          background:
            '单次调用同步；Subagent 或 Worktree Job 可并行搜索。',
          integration:
            'SDK 可显式只暴露 Read/Grep/Glob，形成不含 Bash 和写入的审查或探索流程。',
          artifacts:
            '返回匹配结果，不直接修改文件。',
          conditions:
            '具体分页和截断参数以当前 Tools Reference 为准；权限过滤可能隐藏路径。',
          sources: ['qoder-tools', 'qoder-permissions'],
        },
      },
      related: ['execution-files', 'agent-tools', 'extension-mcp'],
    }),

    'execution-background': createDetail({
      id: 'execution-background',
      definition:
        '让 Shell、Agent 或监视器脱离当前阻塞调用继续运行，并提供查看输出、停止和完成通知。',
      includes: [
        '后台 Shell 与前台转后台',
        '后台 Agent、任务列表和输出读取',
        '精确停止、超时与完成通知',
      ],
      excludes: [
        '跨会话定时任务',
        '云端异步任务平台',
        '仅把命令末尾加 `&` 的非托管进程',
      ],
      facts: [
        '五家都能管理后台工作，但对象不同：Codex 公开的是后台终端，Claude、Qwen、Kimi、Qoder 还把 Agent 或任务输出纳入统一面板。',
        'Qwen Code 支持 `Ctrl+B` 把已经运行的前台 Shell 提升为后台任务；Kimi Code 的前台 Bash 超时默认也会转后台继续。',
        '后台不等于无人监管：TaskOutput、任务日志、完成通知、超时和精确停止共同决定任务是否可控。',
        'Kimi Code 的后台 Agent 输出原在任务终态时一次性捕获，完成前输出视图显示 `[no output captured]`；0.35.0 起 `/tasks` 预览窗格改为实时显示步骤级活动，活动记录只保存在内存、上限最近 20 步，不落盘。',
      ],
      products: {
        claude: {
          entry:
            '`/background [prompt]` 把整个当前会话分离成后台 Agent；`/tasks` 查看当前会话的后台工作；模型也可启动后台 Bash/Agent。',
          primitives:
            '`TaskList`、`TaskStop` 与已弃用的 `TaskOutput`；完整输出优先从任务文件读取；`Monitor` 持续观察事件流。',
          behavior:
            '分离后的会话释放当前终端，可用 `claude agents` 观察；普通后台任务完成后状态回到会话。Monitor 可在日志、PR 或 CI 变化时主动插入事件。',
          scope:
            '绑定当前会话和宿主环境；恢复会话时普通进程能否继续取决于进程生命周期。',
          background:
            'Bash、Subagent 和 Monitor 都可后台运行；Agent frontmatter 也可声明 `background: true`。',
          integration:
            '任务面板、状态栏和权限规则共用；Monitor 复用 Bash allow/deny。',
          artifacts:
            '任务状态与输出文件可供后续 Read；进程产生的文件保留在工作区。',
          conditions:
            'Monitor 对部分托管 Provider 或禁用非必要流量的环境不可用。',
          sources: ['claude-tools', 'claude-commands'],
        },
        codex: {
          entry:
            '`/ps` 显示后台终端及近期输出，`/stop` 停止当前会话的全部后台终端。',
          primitives:
            '统一 PTY 执行通道可保留长进程；命令管理入口面向终端进程而不是独立任务数据库。',
          behavior:
            'Agent 可以在长命令运行时继续处理其他工作，并从终端输出检查进度。',
          scope:
            '后台终端属于当前本地线程和工作目录；Cloud task 是另一种远端异步 Surface。',
          background:
            '支持多个后台终端；`/stop` 是全停，不是按任务 ID 选择停止。',
          integration:
            '桌面 App 与 CLI 都可显示终端活动，但命令集合可能不同。',
          artifacts:
            '近期输出可从 `/ps` 查看；进程产生的文件留在当前工作区。',
          conditions:
            '公开命令表没有与 Claude/Qwen/Kimi 相同的 TaskOutput 或后台 Agent 任务面板语义。',
          sources: ['codex-commands', 'codex-docs'],
        },
        qwen: {
          entry:
            'Shell 参数 `is_background: true`、TUI 运行中 `Ctrl+B`、Agent `run_in_background: true`；`/tasks` 查看。',
          primitives:
            '`task_list`、`task_stop`、后台 Shell Registry、后台 Agent Registry 与 `monitor`。',
          behavior:
            '后台启动立即返回 ID；完成时发送通知。前台 Shell 可无重启地转入同一任务管理路径。',
          scope:
            '任务绑定当前会话和 workspace；新建/清空会话前必须处理仍在运行的后台工作。',
          background:
            'Shell、Agent、Fork 与 Monitor 可并行；并发上限和 Agent 类型规则继续生效。',
          integration:
            'Footer pill、任务对话框和 `/tasks` 展示 Shell 与 Agent；日志可继续读取。',
          artifacts:
            '后台输出持久到项目临时任务目录，任务结束后仍可检查；工作区修改直接保留。',
          conditions:
            '后台 Shell 禁止 `git commit`；裸 `&` 会被受管后台路径拒绝或剥离。',
          sources: ['qwen-shell-current', 'qwen-session-commands'],
        },
        kimi: {
          entry:
            '`Bash.run_in_background`、`Agent.run_in_background` 或后台 AskUserQuestion；`/tasks` 打开任务浏览器。条件：0.35.0 起 `/tasks` 预览窗格实时显示后台 Agent（`run_in_background` 或 `Ctrl+B` 启动）的活动，Enter/O 打开全屏活动详情，Ctrl+O 展开或收起。',
          primitives:
            '`TaskList`、`TaskOutput`、`TaskStop`；Bash/Agent/问题任务共用任务服务。条件：0.35.0 起新增按 Agent 的内存活动流（subagent activity store），子 Agent 事件分流进该存储，按引擎 `turn.step.started` 事件分段，上限 `MAX_SUBAGENT_ACTIVITY_STEPS = 20` 步、步骤文本尾段 4000 字符、单条工具输出 8000 字符、工具参数字符串 16 KiB。',
          behavior:
            '立即返回 task id，终态自动通知主 Agent；TaskOutput 可阻塞等待最多 3600 秒。条件：0.35.0 起后台 Agent 事件实时写入活动流，预览窗格展示步骤级进展，不再等待任务结束；全屏详情按步骤分组渲染 Markdown 文本和各工具结果。',
          scope:
            '任务状态与输出保存在当前会话目录；后台 Agent 有独立上下文。',
          background:
            'Bash 默认 10 分钟、Agent 默认 2 小时；print 模式两者默认无超时，可在配置中调整。',
          integration:
            'TUI、Web、SDK 都能显示或轮询任务状态；完整日志路径可交给 Read。实时活动视图只在 TUI 任务浏览器实现（`apps/kimi-code/src/tui/`），Web 与 SDK 未提供。',
          artifacts:
            'TaskOutput 内联最近 32 KB，完整日志落盘；任务修改留在工作目录。活动流仅存内存，会话切换时释放（`clear`），不落盘。',
          conditions:
            '停止后台任务需要审批；Plan 模式会拦截 TaskStop。条件：实时活动随 PR #2816（提交 `ad12ad8a140d`）于 2026-08-11 合入 main 分支，随 0.35.0（2026-08-12 发布）交付；会话恢复后没有内存活动记录的任务（如 lost 任务）回退到原捕获输出视图，Agent 任务输出仍在终态时一次性捕获。',
          sources: [
            'kimi-tools-current',
            'kimi-commands-execution-current',
            'kimi-agents-execution-current',
            'kimi-background-activity-commit',
            'kimi-background-activity-changeset',
            'kimi-v035-release',
          ],
        },
        qoder: {
          entry:
            '`/tasks` 查看后台任务；模型可用 `TaskOutput` 读取结果、`TaskStop` 停止。',
          primitives:
            '内置工具表包含 TaskOutput、TaskStop；后台 Shell 或 Agent 的具体启动参数由当前 CLI 版本暴露。',
          behavior:
            '后台工作不阻塞主会话，可从任务界面查看状态和输出。',
          scope:
            '任务属于当前本地会话、Worktree Job 或 Cloud session。',
          background:
            'Shell、Subagent 与远端 Job 都能形成长任务，但三者的生命周期和存储位置不同。',
          integration:
            'TUI 任务面板、Agent SDK 工具输出与 Cloud Web console 分别提供观察入口。',
          artifacts:
            '输出和文件保留在对应执行环境；任务记录可供会话继续读取。',
          conditions:
            'Task 工具可被权限或 Agent 工具列表禁用；Cloud Mode 需要远端环境和账号权限。',
          sources: ['qoder-commands', 'qoder-tools', 'qoder-using-cli'],
        },
      },
      related: ['execution-shell', 'agent-background', 'cmd-tasks'],
    }),

    'execution-review': createDetail({
      id: 'execution-review',
      definition:
        '把待审范围固定为本地改动、提交、分支或 Pull Request，并输出可定位、分级且有证据的问题。',
      includes: [
        '本地 Diff 与指定文件审查',
        'Pull Request 审查和行内评论',
        '安全审查、修复参数与审查规则',
      ],
      excludes: [
        'CI 测试结果本身',
        '普通自然语言“看看代码”但无产品工作流',
        '自动合并或批准 Pull Request',
      ],
      facts: [
        'Codex、Qwen Code、Claude Code 和 Qoder CLI 都提供明确 Review 入口；Kimi Code 当前命令目录没有内置 `/review`。',
        'Qwen Code `/review` 是随产品加载的内置 Skill，不是硬编码命令；它能审本地、文件与 PR，同仓 PR 使用隔离 Worktree。',
        'Claude Code 自 v2.1.223 起把 `/review` 改为 `/code-review` 的别名；`/code-review` 不带级别时复用会话最近一次输入的级别，`ultra` 级别在云端运行 ultrareview。',
        'Claude 与 Codex 的 GitHub 托管 Review 和本地 `/code-review` 是不同 Surface：前者可在 PR 上自动触发，后者在当前会话输出结果。',
        'Qwen Code `/review` 自 2026-08-02 起提供 `publish-assets`：把证据图发布到用户指定的资产仓库并回写 URL，供 PR 评论嵌入；其余四家当前一手资料未列出同类内置入口。',
        'Qwen Code medium/high effort Review 会在 `.qwen/reviews/` 保存结构化 JSON 产物，Web Shell 将其渲染为可筛选 findings 的交互式审查视图；其余四家当前一手资料未列出同类内置结构化审查结果视图。',
        'Qwen Code v0.21.6 起提供 `qwen review cost-ledger`：从本次审查在磁盘上的用量记录聚合主循环与各 Agent 的模型调用和 token 消耗，内置 Review Skill 在 Step 8 运行并把结果归档进报告；其余四家当前一手资料未列出同类内置 Review 成本聚合入口。',
        'Qwen Code v0.21.7 起提供 `.qwen/review-context.json` 仓库上下文清单与 `qwen review repo-context`：仓库用严格 JSON 声明路径、领域、推荐测试、必需审查角色等有界审查指引，medium/high effort 的本地与同仓 PR 审查在计划采集后并入审查计划，PR 审查只从 merge base 读取清单；其余四家当前一手资料未列出同类内置 Review 仓库上下文入口。',
      ],
      products: {
        claude: {
          entry:
            'v2.1.223 起 `/review` 是 `/code-review` 的别名；`/code-review [low|medium|high|xhigh|max|ultra] [--fix] [--comment] [target]` 审查当前 Diff 或指定目标，`ultra` 运行云端 ultrareview；`/security-review` 检查 Diff 的安全漏洞。',
          primitives:
            '`/code-review` 是 bundled Skill，默认作为带独立上下文窗口的后台 subagent 运行；`ultra` 与托管 Code Review 使用多 Agent 流水线，分别在云端与 GitHub PR 上分析并验证问题。',
          behavior:
            '默认审查分支领先 upstream 的提交加未提交改动；target 可为文件路径、PR 编号、分支名或 ref range（如 `main...my-feature`）。不带级别时复用会话最近一次输入的级别（v2.1.223，官方文档表述为使用会话当前 effort）；`low`/`medium` 只报高置信度 findings，`high` 至 `max` 放宽覆盖。`--fix` 把 findings 应用到工作树；`--comment` 把 findings 发布为 GitHub PR 行内评论。`/code-review ultra` 运行云端 ultrareview，不可用时回退为会话内本地审查。',
          scope:
            '本地为当前分支 Diff 或指定 target；ultrareview 默认审查当前分支与默认分支的差异（含未提交与 staged 改动），可接受自定义 base 分支、PR 编号/URL 或说明文字，单次默认上限 500 个文件和 8,000 行变更。托管 Review 由仓库触发策略决定（PR 打开、每次 push 或手动 `@claude review`）。',
          background:
            '本地审查默认后台 subagent，不占用会话上下文；上一次审查未完成、`-p` 模式或 `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS=1` 时改为前台。托管 Code Review 在 Anthropic 基础设施并行运行。',
          integration:
            '本地审查遵循 `CLAUDE.md`，不读取 `REVIEW.md`；托管 Code Review 把仓库根目录 `REVIEW.md` 以最高优先级注入审查流水线每个 Agent。findings 去重、按严重级别排序后以行内评论发布到 PR，摘要进 review body，并生成 Claude Code Review check run。',
          artifacts:
            '本地 findings 文本（桌面等宿主应用经 `ReportFindings` 工具）、`--fix` 文件修改、GitHub 行内评论、review 摘要与 check run。',
          conditions:
            '`/code-review` 标记 `disable-model-invocation`，只在显式调用时运行。`ultra` 需要 claude.ai 账号登录并开启 usage credits；Amazon Bedrock、Google Cloud Agent Platform、Microsoft Foundry 与 ZDR 组织不可用，不可用时回退本地审查；账号可用 ultrareview 时 `/ultrareview` 是 `/code-review ultra` 的别名。后台审查的 `--fix` 编辑不经过会话检查点（`/rewind` 不回退），前台编辑可被 `/rewind` 回退。托管 Code Review 为 research preview，面向 Team/Enterprise，ZDR 组织不可用。',
          sources: [
            'claude-commands',
            'claude-code-review',
            'claude-review-alias',
            'claude-ultrareview',
          ],
        },
        codex: {
          entry:
            'CLI、IDE、App 使用 `/review`；可选择基线分支、未提交改动、指定提交或自定义审查说明。',
          primitives:
            '专用 Reviewer 以只读方式检查 Git 范围并输出按优先级排序的 findings。',
          behavior:
            '本地结果显示在当前对话或分离的 Review 线程；GitHub 集成可自动或通过 `@Codex` 审查 PR。',
          scope:
            '本地只在 Git 仓库中运行；App 还可选择 unstaged、staged、commit、branch 或 last turn。',
          background:
            'App/IDE 可分离 Review，不阻塞主任务；GitHub Review 在远端执行。',
          integration:
            'GitHub PR 评论和本地 Review 使用不同触发；项目指令可提供审查标准。',
          artifacts:
            '本地 findings、行内标注或 GitHub Review；默认不自动修改被审代码。',
          conditions:
            '本地 `/review` 是只读 Reviewer；GitHub 自动化需要仓库连接和相应权限。',
          sources: ['codex-review', 'codex-github', 'codex-commands'],
        },
        qwen: {
          entry:
            '`/review` 审本地变化；`/review <file>` 审文件；`/review <pr>` 审 PR；`--comment` 发布 GitHub Review；`qwen review publish-assets` 发布证据图；`qwen review cost-ledger --plan <计划报告> [--out <路径>]` 聚合本次审查成本；`qwen review repo-context --plan <计划 JSON> --worktree <工作树> --out <产物路径>` 为审查计划附加有界仓库上下文，medium/high effort 审查在计划采集后由流程调用。',
          primitives:
            '内置 Skill 用 `qwen review fetch-pr`、并行审查 Agent、锚点验证和一次 Create Review API 提交；证据图经 Contents API（`gh` HTTPS）写入指定仓库，不克隆、不走 SSH。`cost-ledger` 聚合 chat 与 subagent transcript JSONL 中 assistant 事件携带的 `usageMetadata`，与 coverage gate 读取同一批记录。仓库上下文来自 `.qwen/review-context.json` 严格 JSON 清单：顶层字段固定为 `version`、`label`、`rules`；每条规则必填 `paths`（仓库相对、`/` 分隔 glob，支持 `*`、`?` 与完整 `**` 段，区分大小写），可选 `relatedPaths`、`domains`、`recommendedTests`、`requiredConfigurations`、`requiredAgents`、`unverifiedDimensions`、`verificationNotes`；未知字段、注释、不支持的版本、超限值、控制字符与重复数组项被拒绝。manifest provider 在进程内静态注册（provider 名 `manifest`），输出经共享 `validateRepositoryContext` 校验；不支持动态插件注册、shell 执行、模板或不透明载荷。',
          behavior:
            '本地默认 medium effort，PR 默认 high；同仓 PR 强制在临时 Worktree 中读、测、审，跨仓 URL 使用轻量模式。证据图只接受 png/jpg/jpeg/gif/webp（拒绝 SVG），单文件 10 MiB、单批 40 MiB 上限，任一文件不合格则整批拒绝。medium/high effort 审查还会把规范 findings 与组合结论保存为与报告同名的结构化 JSON 产物，Web Shell 把它渲染成可筛选 findings 的交互式审查视图，Markdown 报告保持人类可读存档。`cost-ledger` 以 `--plan` 计划报告的 mtime 为计费窗口起点（计划前的引导轮次与台账运行后的组装不计入），按流输出主循环与每个审查 Agent 的模型调用数、输入/缓存/输出/思考 token 数与耗时；模型调用只统计携带 `usageMetadata` 的 assistant 记录，计数是下限而非精确 API 调用数。仓库上下文规则在任一变更文件命中其 `paths` glob 时生效，所有命中规则的指引合并、去重并排序：审查 Agent 获得领域与相关文件，build-and-test Agent 获得推荐测试、必需配置与验证说明，`requiredAgents` 只在所选 effort 与拓扑本就运行相应角色时并入名册，`unverifiedDimensions` 在最终审查中作为非阻塞证据边界披露。`relatedPaths` 通配符从工作树展开（启用点文件、不返回目录、不跟随符号链接），必须以非通配目录段开头，解析文件必须留在工作树内且不进入 `node_modules`、`dist` 等依赖或构建产物目录；访问条目 16384、解析文件 128 或匹配工作量预算任一超限即失败关闭。`repo-context` 校验 `--out` 与 `--plan` 不是同一文件、worktree 是目录且与 `plan.worktreePath` 一致、`plan.mergeBaseSha` 格式有效且可解析，成功后把上下文 JSON 写入 `--out` 并原子覆写计划文件，stdout 输出 `Wrote repository context (manifest) to <路径>`，无上下文时输出 `Wrote null repository context to <路径>`。',
          scope:
            '本地 working tree、单文件、PR number 或 URL；规则来自系统、项目 AGENTS.md 和 Skill。`cost-ledger` 的记录位置来自 CLI 导出的 `QWEN_CODE_PROJECT_DIR`/`QWEN_CODE_SESSION_ID` 环境变量，不接受模型指定的路径。仓库上下文只在 medium/high effort 的本地与同仓 PR 审查中生效；low effort 与跨仓轻量审查跳过。PR 审查的清单从 merge base 提交读取，PR head 无法为自己加入或移除指引；本地审查的清单从当前 worktree 读取。',
          background:
            '多维度审查 Agent 可并行执行；进度在当前 Surface 展示。',
          integration:
            '`--comment` 在 GitHub 提交一次 Review；Qwen Code Action 还能在 PR 事件中自动运行审查。GitHub API 不能给 Review 评论附图，`publish-assets` 把证据图托管到 `QWEN_REVIEW_ASSETS_REPO`（`owner/repo`），写入 `pr-assets/<pr>-review` 分支并以 commit 固定的 URL 嵌入评论；GitHub Enterprise 加 `--host`。',
          artifacts:
            '同仓审查在项目 `.qwen/reviews/` 保存 Markdown 报告，medium/high effort 另有同名结构化 JSON 产物（跨仓轻量审查不落盘报告）；本地 findings、可选 GitHub 行内评论；findings 带 `assetFiles` 本地路径与 `assets` 已发布 URL，资产清单记录每个文件及落点 commit；Worktree 按流程清理。内置 Skill Step 8 运行 `cost-ledger`，把打印块原样粘贴进报告并在终端摘要转述首行；`--out` 保存完整台账 JSON（Skill 约定 `.qwen/reviews/<报告名>-cost-ledger.json`，worktree 模式落在主项目目录），打印块只列最大的 8 个 Agent，JSON 保留全部。`repo-context` 把校验后的 `RepositoryContext` 对象（无上下文时为 `null`）以带结尾换行的 JSON 写入 `--out` 指定路径，并回写更新后的计划文件。',
          conditions:
            'Bare mode、禁用 Skills 或 Slash 时不可用；PR 读取/评论需要 GitHub 访问权限。`publish-assets` 还要求 `QWEN_REVIEW_ASSETS_REPO` 指定可推送仓库（未设置或格式错误退出码 3，不自动选仓库），并与 `submit` 共用授权门禁：只有被授权发布评论的运行才能推送，有效 `--comment` 强制 high effort，因此 low/medium 运行不会发布。结构化 JSON 产物与 Web Shell 视图只来自 medium/high effort 审查；low effort 不生成。`cost-ledger` 定位为 informational：记录缺失或无法计算时在 stderr 输出 `cost-ledger unavailable — <原因>` 并以退出码 0 结束，`--out` 写入失败降级为警告，均不阻塞审查。仓库上下文清单失败关闭：清单缺失得到 `null` 上下文；清单存在但不可读、超过 1 MB 或内容非法时抛错，存在但非法的上下文会让所有下游消费者失败而不是被静默丢弃；PR 计划的 merge base 未解析（`mergeBaseSha: null` 或 base 抓取失败）时不读 worktree，直接写 `null` 产物。',
          sources: [
            'qwen-review-current',
            'qwen-review-skill',
            'qwen-review-assets',
            'qwen-review-web-shell',
            'qwen-review-cost-ledger',
            'qwen-review-repo-context',
            'qwen-worktree-current',
          ],
        },
        kimi: {
          entry:
            '直接用自然语言要求 Agent 审查改动，或创建自定义 Skill/Plugin Command；当前内置 Slash 目录没有 `/review`。',
          primitives:
            '使用 Read、Grep、Glob、Bash 和 Agent 组合完成分析，没有单独的内置 Review 协议。',
          behavior:
            '输出形式取决于提示词或自定义 Skill；不会自动获得固定的 Git 范围、严重级别或 PR 评论语义。',
          scope:
            '由用户在提示中指定文件、Diff、提交或分支。',
          background:
            '可把探索 Agent 放后台，或用 Swarm 并行审查不同文件；这不是专用 Review 入口。',
          integration:
            '可通过 Bash 调用 `git`/`gh`，或由 Plugin/Skill 封装团队审查流程。',
          artifacts:
            '默认是会话文本；是否修改文件或发布评论完全取决于后续工具调用。',
          conditions:
            '“没有内置 `/review`”只描述当前公开命令目录，不代表不能用通用 Agent 完成代码审查。',
          sources: [
            'kimi-commands-execution-current',
            'kimi-tools-current',
            'kimi-agents-execution-current',
          ],
        },
        qoder: {
          entry:
            '`/review [instruction]` 以 Prompt Command 审查本地待提交 Git 变化，支持 TUI 与 Headless。',
          primitives:
            '使用内置 Read/Grep/Glob/Bash 分析 pending changes；附加 instruction 可限定关注点。',
          behavior:
            '默认输出审查结果；Qoder Action 在 PR 上自动审查并发布反馈。',
          scope:
            '本地 `/review` 面向 pending Git changes；PR Review 属于 GitHub Action Surface。',
          background:
            'Action 在 GitHub Runner 运行；本地命令在当前任务执行。',
          integration:
            'AGENTS.md 可提供项目标准；Qoder Action 支持自动 PR Review 和 `@qoder` 交互。',
          artifacts:
            '本地报告或 GitHub PR 评论；不会自动批准或合并 PR。',
          conditions:
            'GitHub Review 需要安装 App、配置 PAT/Secret 和 Workflow。',
          sources: ['qoder-commands', 'qoder-action', 'qoder-tools'],
        },
      },
      related: ['cmd-review', 'execution-pr', 'execution-ci'],
    }),

    'execution-git': createDetail({
      id: 'execution-git',
      definition:
        '读取 Git 状态与差异，并在用户授权下执行暂存、提交、分支、合并或回退等本地版本控制操作。',
      includes: [
        'status、diff、log、branch、add 与 commit',
        '产品提供的 Diff 视图或 Git 状态面板',
        'Worktree 与 Review 对 Git 状态的使用',
      ],
      excludes: [
        '远端 Pull Request API',
        'CI 工作流执行',
        '非 Git 版本控制系统的专用集成',
      ],
      facts: [
        '五家都能通过 Shell 运行 Git；专用 UI 的差别主要在 Diff、暂存、回退、Review 和 Worktree。',
        'Codex App 提供 staging/revert 交互；Claude Code、Codex、Qwen Code 提供 `/diff`，Kimi Code 与 Qoder CLI 当前命令表没有等价 Slash 命令。',
        '能执行 `git commit` 不等于会自动提交：是否暂存、提交或推送仍应由任务授权、权限规则与产品工作流决定。',
      ],
      products: {
        claude: {
          entry:
            '通过 `Bash` 运行 Git；`/diff` 查看当前改动；IDE 中可直接要求暂存、提交、切分支或生成 PR。',
          primitives:
            'Git CLI 加上 Claude 的 Diff/IDE 展示；检查点不是 Git commit，二者可并存。',
          behavior:
            'Agent 可根据实际 Diff 生成提交说明并运行 Git；破坏性命令仍受权限规则与用户审批。',
          scope:
            '当前仓库或当前 Claude Worktree；Worktree 有独立分支和文件状态。',
          background:
            '普通 Git 操作前台执行；Monitor 可观察远端分支、PR 或 CI。',
          integration:
            'IDE 原生 Git/Diff、GitHub App 与 Worktree 工作流连接本地和远端交付。',
          artifacts:
            '工作树、Index、commit、branch 和 reflog 等标准 Git 状态。',
          conditions:
            '仓库必须可用；权限规则可拒绝 push、reset 或其他高风险 Bash 命令。',
          sources: ['claude-ide', 'claude-commands', 'claude-worktrees'],
        },
        codex: {
          entry:
            '通过 Shell 运行 Git；`/diff` 显示改动；Codex App Review pane 可选择 unstaged/staged/commit/branch。',
          primitives:
            'Git CLI、Diff 视图，以及 App 中的 stage 和 revert 控件。',
          behavior:
            'Agent 可读取状态、创建分支、提交和推送；App 可把选定改动暂存或回退。',
          scope:
            '本地工作区或 App Worktree；Worktree 默认 detached HEAD，需要创建分支后再提交和推送。',
          background:
            'Git 命令可在终端执行；长时间 fetch/test 可由后台终端管理。',
          integration:
            '本地分支可交给 GitHub/Cloud 创建 PR；Worktree 支持 Local 与 Worktree 之间 handoff。',
          artifacts:
            '标准 Git 状态、commit/branch 以及 App 中可审阅的 Diff。',
          conditions:
            '审批与沙箱仍约束 Shell；App Worktree 只在 ChatGPT 桌面应用提供。',
          sources: ['codex-commands', 'codex-review', 'codex-worktrees'],
        },
        qwen: {
          entry:
            '通过 `run_shell_command` 运行 Git；`/diff` 查看会话改动；Worktree、Review 和 Arena 都使用 Git 状态。',
          primitives:
            'Git CLI、Diff 命令、工作树状态检查和 Worktree 管理工具。',
          behavior:
            'Agent 可执行 status/add/commit/branch 等命令；Worktree 退出前会检查 dirty files 与未合并 commit。',
          scope:
            '当前 workspace、显式 Worktree 或 Agent/Arena Worktree。',
          background:
            '读取类 Git 命令可后台运行，但受管后台 Shell 明确拒绝 `git commit`，提交需前台完成。',
          integration:
            'VS Code Companion 展示 Diff；`/review`、`/setup-github` 和 Qwen Code Action 衔接 GitHub。',
          artifacts:
            '工作树、Index、commit、branch、Worktree sidecar 与可视 Diff。',
          conditions:
            '删除 Worktree 有 dirty、ownership 和未合并提交保护；破坏性 Git 命令仍需权限。',
          sources: [
            'qwen-shell-current',
            'qwen-session-commands',
            'qwen-worktree-current',
          ],
        },
        kimi: {
          entry:
            '使用 `Bash` 运行 `git status`、`git diff`、`git add`、`git commit` 等命令。',
          primitives:
            '没有独立 Git 工具层；标准 Git CLI 是主要接口。',
          behavior:
            'Agent 可按提示读取和修改 Git 状态；命令审批与 Bash 相同。',
          scope:
            '当前工作目录所在仓库；如果用户从手工 Worktree 启动，Git 自然作用于该 Worktree。',
          background:
            '长 Git 命令可后台运行；提交类操作是否后台执行由 Bash 和用户审批决定。',
          integration:
            '可通过 Bash 调用 `gh` 或其他 VCS 工具；当前命令目录没有 `/diff`。',
          artifacts:
            '标准 Git 工作树、Index、commit 和 branch。',
          conditions:
            '当前公开文档没有专用暂存、回退或 Git UI；结论不限制自定义 Skill/Plugin。',
          sources: ['kimi-tools-current', 'kimi-commands-execution-current'],
        },
        qoder: {
          entry:
            '模型通过 `Bash` 或用户通过 `!` 模式运行 Git；Worktree Job 由 CLI 启动参数管理。',
          primitives:
            '标准 Git CLI，加上 `qodercli --worktree`、`jobs --worktree` 和 `rm`。',
          behavior:
            'Agent 可读写 Git 状态；Worktree Job 为每个并发任务创建隔离 checkout。',
          scope:
            '当前 workspace 或 `~/.qoder/worktrees/<job-id>`。',
          background:
            'Worktree Job 可在独立终端或容器中并行；普通 Git 命令遵守任务生命周期。',
          integration:
            'Qoder Action、`@qoder` 和 `/review` 在 GitHub 或本地 Review 中消费 Git Diff。',
          artifacts:
            '标准 Git 状态以及 Qoder Worktree Job 目录和任务 ID。',
          conditions:
            '需要本机 Git；删除 Job 会同时删除 Worktree，属于不可撤销操作。',
          sources: ['qoder-using-cli', 'qoder-tools', 'qoder-action'],
        },
      },
      related: ['execution-files', 'execution-pr', 'execution-worktree'],
    }),

    'execution-pr': createDetail({
      id: 'execution-pr',
      definition:
        '读取 Pull Request 元数据与 Diff，发布审查或修复结果，并在支持的 Surface 创建或更新 PR。',
      includes: [
        '读取 PR、审查 PR 与发布行内评论',
        '从 Agent 任务创建或更新 PR',
        '根据 Review 或 CI 反馈修复 PR',
      ],
      excludes: [
        '仅本地 Git commit',
        'CI Runner 的通用执行',
        '自动批准、合并和发布版本',
      ],
      facts: [
        '五家都可通过 Shell 中的 `gh` 工作，但原生远端能力差异很大：Claude、Codex、Qwen、Qoder 都有 GitHub 专用工作流，Kimi 当前以通用 Shell 为主。',
        'Qwen `/review --comment` 提交的是 GitHub Review，不是创建功能分支或 PR；创建 PR 仍主要通过 `gh` 或 Action 工作流。',
        'Claude `/autofix-pr`、Codex GitHub/Cloud、Qoder `@qoder` 都能围绕现有 PR 继续处理评论或失败检查，但权限和运行位置不同。',
      ],
      products: {
        claude: {
          entry:
            '`/review <PR>` 读取审查；`/autofix-pr` 监视并修复当前分支 PR；IDE/CLI 可用 `gh` 创建 PR。',
          primitives:
            'GitHub App、GitHub Actions、`gh` 与 Claude Code 本地/远端会话。',
          behavior:
            '可生成 PR 描述、发布 Review、响应 `@claude`，并把 CI 或评论修复推回 PR 分支。',
          scope:
            '当前仓库、当前分支或明确 PR；托管 Code Review 按仓库设置触发。',
          background:
            '`/autofix-pr` 启动远端 Web session 持续观察；Code Review 在托管基础设施并行运行。',
          integration:
            'GitHub App 负责仓库权限和评论；Actions 适合自托管 Runner 工作流。',
          artifacts:
            'PR、Review 评论、check run、分支 commit 和修复 push。',
          conditions:
            '需要 GitHub 仓库、App/gh 认证和分支写权限；不同远端工作流可能需要相应订阅。',
          sources: [
            'claude-commands',
            'claude-code-review',
            'claude-github-actions',
            'claude-ide',
          ],
        },
        codex: {
          entry:
            'Codex Cloud 连接仓库后可从任务产出 PR；GitHub 可用 `@Codex` 审查或处理任务；本地可用 `gh`。',
          primitives:
            'Codex Cloud environment、GitHub integration、GitHub Review 与本地 Shell。',
          behavior:
            '云任务在远端 checkout 修改代码并提交 PR；Review 流程在 PR 上发布 findings。',
          scope:
            '已连接的 GitHub 仓库、明确任务或 PR；本地 gh 使用当前仓库身份。',
          background:
            'Cloud 和 GitHub 任务异步运行；本地 Shell 由当前线程或后台终端执行。',
          integration:
            'GitHub App/连接器、Cloud 环境和本地 Git 分支共同形成交付链。',
          artifacts:
            'PR、commit、review findings 和任务链接。',
          conditions:
            '远端任务需要仓库授权和配置好的环境；本地创建 PR 仍取决于 gh 权限。',
          sources: ['codex-github', 'codex-review', 'codex-docs'],
        },
        qwen: {
          entry:
            '`/review <pr> --comment` 发布 Review；`gh` 读取/创建 PR；Qwen Code Action 响应 PR 和评论事件。',
          primitives:
            '内置 Review Skill、GitHub CLI、Qwen Code Action 和安装的工作流。',
          behavior:
            '同仓 PR Review 在临时 Worktree 中运行并一次性提交评论；Action 可自动审查或由评论触发 Assistant。',
          scope:
            '当前 GitHub 仓库、PR number/URL 或工作流事件。',
          background:
            'Review Agent 可并行；Action 在 GitHub Runner 异步运行。',
          integration:
            '`/setup-github` 安装 dispatch、assistant、issue triage、scheduled triage、PR review 五类 Workflow。',
          artifacts:
            'GitHub Review、Action run、评论、分支修改和通过 gh 创建的 PR。',
          conditions:
            '创建 PR 没有独立 Slash 命令；需要 gh 或工作流权限，`--comment` 会产生外部写入。',
          sources: [
            'qwen-review-current',
            'qwen-github-current',
            'qwen-setup-github-current',
          ],
        },
        kimi: {
          entry:
            '用 `Bash` 调用 `gh pr view|create|comment` 或项目脚本；当前没有专用 PR Slash 命令。',
          primitives:
            '标准 GitHub CLI、Git 和可选的自定义 Skill/Plugin。',
          behavior:
            '能否读、创建或修改 PR 取决于提示词、gh 登录和审批；产品没有固定的 PR 状态机。',
          scope:
            '当前仓库和 gh 当前身份。',
          background:
            '可在后台 Bash 或 Agent 中轮询 PR，但没有内置 PR Monitor 工作流。',
          integration:
            '用户可用 Plugin、Skill、MCP 或自己的 CI 封装 GitHub 流程。',
          artifacts:
            '由 gh 创建的 PR、评论、Review 或分支 push。',
          conditions:
            '官方 CLI/Agent 文档当前没有等价 GitHub App/Action 能力说明；不要把通用 Bash 当成内置集成。',
          sources: ['kimi-tools-current', 'kimi-commands-execution-current'],
        },
        qoder: {
          entry:
            'Qoder Action 自动审查 PR；评论 `@qoder` 请求解释、建议或直接修复；本地也可用 `gh`。',
          primitives:
            'Qoder GitHub App、`QoderAI/qoder-action`、Workflow 和 Qoder CLI。',
          behavior:
            'PR 打开时自动 Review，或按评论触发任务；修复可在 GitHub Runner 上修改并回写分支。',
          scope:
            '安装 App 并配置 Workflow 的仓库和 PR。',
          background:
            'Action 在 GitHub Runner 异步运行；本地任务可继续从 TUI/Headless 跟进。',
          integration:
            '`/setup-github` 引导安装；AGENTS.md 提供 Review 规则。',
          artifacts:
            'PR 评论、Review、Action run 和可选代码修复。',
          conditions:
            '需要 Qoder PAT、GitHub App 权限、Repository Secret 和 Workflow；`@qoder` 只对已配置仓库生效。',
          sources: ['qoder-action', 'qoder-commands'],
        },
      },
      related: ['execution-review', 'execution-ci', 'execution-git'],
    }),

    'execution-ci': createDetail({
      id: 'execution-ci',
      definition:
        '在 GitHub Actions 或其他流水线中非交互运行 Agent，用于审查、问题分派、失败诊断和受控修复。',
      includes: [
        '官方 GitHub Action 或安装命令',
        'PR、Issue、定时和手工触发',
        'Token、Runner、权限与写回边界',
      ],
      excludes: [
        '仅在本地运行测试命令',
        '产品自身仓库的开发 CI',
        '未由该产品提供的任意第三方自动化',
      ],
      facts: [
        'Claude Code、Codex、Qwen Code 和 Qoder CLI 都有面向 GitHub Actions 的产品级入口；Kimi Code 当前公开 CLI 文档没有对应内置 Workflow。',
        'Codex 官方建议把只读分析与有写权限的 PR 创建分成不同 Job，通过 patch artifact 传递结果，缩小 Token 权限。',
        'Qwen `/setup-github` 当前安装五个 Workflow，不只是 PR Review：还包括 dispatch、assistant、issue triage 和 scheduled triage。',
      ],
      products: {
        claude: {
          entry:
            '使用 Claude Code GitHub Action；可通过 `/install-github-app` 或手工 Workflow 配置 GitHub App 与 Secret。',
          primitives:
            'GitHub Action、Claude GitHub App、CLAUDE.md 和事件 Prompt。',
          behavior:
            '在 Runner 上执行 Claude Code，支持 `@claude`、PR Review、Issue 实现、定时维护和自定义自动化。',
          scope:
            'Workflow event 指定的仓库、分支、PR 或 Issue。',
          background:
            '由 GitHub Runner 异步执行；状态进入 Actions run 和 PR checks。',
          integration:
            'GitHub App 提供令牌，Action 读取项目指令和工作流参数。',
          artifacts:
            'Action 日志、PR/Issue 评论、commit、PR 和 check run。',
          conditions:
            'Workflow permissions 与 Allowed Tools 必须最小化；第三方 PR 需要防范提示注入和 Secret 暴露。',
          sources: ['claude-github-actions', 'claude-code-review'],
        },
        codex: {
          entry:
            'Workflow 使用 `openai/codex-action@v1`，通过 inline prompt 或 prompt file 调用 `codex exec`。',
          primitives:
            'Codex Action、sandbox 配置、输出文件和 GitHub Actions 权限。',
          behavior:
            '可审查改动、生成 patch、执行受限修复并把最终输出传给后续步骤。',
          scope:
            '当前 Workflow checkout；具体写权限由 Job token、sandbox 和脚本分配。',
          background:
            '在 GitHub Runner 非交互运行；结果由 Actions step 和 artifact 持久。',
          integration:
            '官方自动修复示例把只读分析与写权限 PR Job 分开，并通过 patch artifact 传递结果。',
          artifacts:
            'Action output、patch artifact、日志、Review 或后续 Job 创建的 PR。',
          conditions:
            '需要 OpenAI/Codex 认证；Prompt、Token 权限和 sandbox 必须按不可信输入设计。',
          sources: ['codex-github-action', 'codex-noninteractive'],
        },
        qwen: {
          entry:
            '运行 `/setup-github` 下载 Qwen Code Action Workflow，或按 integration 文档手工配置。',
          primitives:
            'Qwen Code Action、GitHub App/凭据、五类 Workflow 和 QWEN.md/AGENTS.md。',
          behavior:
            '提供 dispatch、按评论调用 Assistant、Issue triage、定时 triage 与 PR review。',
          scope:
            '当前 GitHub 仓库；触发事件与 Workflow permissions 决定能读写的对象。',
          background:
            'GitHub Runner 异步运行；本地 CLI 只负责安装配置和后续查看。',
          integration:
            '`/setup-github` 写入 `.github/workflows` 并更新 `.gitignore`，随后打开 README/Secrets 页面完成认证。',
          artifacts:
            'Workflow 文件、Action run、Issue/PR 评论、Review 和可选代码改动。',
          conditions:
            '命令只支持交互式 TUI；下载安装依赖网络，Repository Secret 和 GitHub 权限需用户完成。',
          sources: ['qwen-github-current', 'qwen-setup-github-current'],
        },
        kimi: {
          entry:
            '可在自定义 CI 中执行 `kimi -p` 或项目脚本；当前公开命令目录没有 `/setup-github` 或官方产品 Workflow。',
          primitives:
            'Headless CLI、Bash 和用户自行编写的 CI 配置。',
          behavior:
            '非交互 Agent 可以在 Runner 上读写代码，但触发、权限、评论和 PR 写回都由用户脚本负责。',
          scope:
            '用户定义的 Runner checkout。',
          background:
            '由 CI 平台管理；Kimi print 模式中的 Bash/Agent 默认可无超时，仍应由 Job timeout 兜底。',
          integration:
            '可结合 gh、MCP、Plugin 或自定义 Skill，但不计为内置 GitHub Action。',
          artifacts:
            '取决于自定义 Workflow：日志、文件、patch、评论或 PR。',
          conditions:
            '矩阵只确认可用通用 Headless/Shell 组装，不宣称存在官方 Kimi GitHub Action。',
          status: '条件项',
          sources: [
            'kimi-cli-current',
            'kimi-tools-current',
            'kimi-commands-execution-current',
          ],
        },
        qoder: {
          entry:
            '`/setup-github` 引导配置 Qoder Action，或手工使用 `QoderAI/qoder-action@v0`。',
          primitives:
            'Qoder GitHub App、Qoder PAT、Repository Secret、Workflow 和 AGENTS.md。',
          behavior:
            '开箱提供自动 PR Review 与 `@qoder` 按需协作，能解释、建议或直接修复。',
          scope:
            '安装 Qoder App 并启用 Workflow 的仓库。',
          background:
            'GitHub Runner 异步执行并把状态显示为 Actions run。',
          integration:
            'Action 调用 Qoder CLI，项目 AGENTS.md 参与 Review 标准。',
          artifacts:
            'Action 日志、PR Review、评论和可选代码修改。',
          conditions:
            '需要 App、PAT Secret 和适当 Workflow permissions；版本标签以当前 Qoder Action 文档为准。',
          sources: ['qoder-action', 'qoder-commands'],
        },
      },
      related: ['execution-pr', 'execution-review', 'surface-headless'],
    }),

    'execution-worktree': createDetail({
      id: 'execution-worktree',
      definition:
        '为并行或高风险任务创建独立 Git checkout，使文件修改、分支和会话状态不直接污染主工作区。',
      includes: [
        '会话级、任务级和 Subagent 级 Worktree',
        '基础分支、目录、复制或复用依赖',
        '退出、保留、清理和未合并改动保护',
      ],
      excludes: [
        '仅进程或容器沙箱',
        '普通 Git branch 但共享同一工作目录',
        '云端 VM 的仓库 checkout',
      ],
      facts: [
        'Claude Code、Qwen Code 和 Qoder CLI 都提供 CLI Worktree 入口；Codex 的托管 Worktree 当前只在 ChatGPT 桌面 App，Kimi Code 当前没有内置管理入口。',
        'Claude 和 Qwen 都支持会话级与 Subagent 级 Worktree，但实现细节不同：Claude 默认可从 origin/HEAD 开始，Qwen 默认从当前本地分支开始。',
        'Qoder CLI 把 Worktree 设计成可列出和删除的 Concurrent Job；Codex App 则把 Worktree 作为本地任务的一种启动位置。',
      ],
      products: {
        claude: {
          entry:
            '`claude --worktree|-w [name|#PR|URL]`；会话内用 `EnterWorktree`/`ExitWorktree`；Agent frontmatter 可写 `isolation: worktree`。',
          primitives:
            '`.claude/worktrees/<name>`、`worktree-<name>` 分支、`.worktreeinclude` 与 WorktreeCreate/Remove Hooks。',
          behavior:
            '新会话、当前会话和 Subagent 都可隔离；无改动临时 Worktree 自动清理，有改动时提示保留或删除。',
          scope:
            '默认从 `origin/HEAD` 创建，失败时回退本地 HEAD；`worktree.baseRef=head` 可改为当前本地 HEAD。',
          background:
            '`/batch` 把 5–30 个单元交给后台 Agent，每个单元用独立 Worktree 并可打开 PR。',
          integration:
            'PR reference 可直接成为基础；`.worktreeinclude` 复制被 Git ignore 的本地文件；Hooks 可替换 Git 创建逻辑。',
          artifacts:
            '独立目录、分支、commit 和可选 PR；Headless 创建的 Worktree 不自动清理。',
          conditions:
            '需要 Git 仓库和已接受 workspace trust；删除会丢弃未提交变更时必须谨慎确认。',
          sources: ['claude-worktrees', 'claude-tools', 'claude-commands'],
        },
        codex: {
          entry:
            '在 ChatGPT 桌面 App 创建任务时选择 Worktree；CLI 当前没有对应托管 Worktree 或 per-Agent 隔离入口。',
          primitives:
            '`$CODEX_HOME/worktrees`、detached HEAD、本地后台任务、`.worktreeinclude` 和 Local/Worktree handoff。',
          behavior:
            'App 创建独立 checkout 并在后台运行任务；用户可从 Worktree 创建分支、提交、推送和开 PR。',
          scope:
            '只在 ChatGPT desktop app；不应推断为 Codex CLI Subagent 字段。',
          background:
            '每个 Worktree 任务可本地后台运行；App 管理其生命周期和历史。',
          integration:
            '可在 Local 与 Worktree 之间 handoff；默认保留最近 15 个，清理前创建 snapshot。',
          artifacts:
            '隔离 checkout、snapshot、可选 branch/commit/PR。',
          conditions:
            '当前能力限桌面 App；新任务默认 detached HEAD，交付前需显式创建分支。',
          status: '条件项',
          sources: ['codex-worktrees', 'codex-review'],
        },
        qwen: {
          entry:
            '`qwen --worktree[=name|#PR|URL]`；会话内 `enter_worktree`/`exit_worktree`；Agent 可传 `isolation: "worktree"`。',
          primitives:
            '`.qwen/worktrees/<slug>`、`worktree-<slug>` 分支、session sidecar 和 `worktree.symlinkDirectories`。',
          behavior:
            '启动前、会话中和 Agent 三条路径共用管理器；无差异 Agent Worktree 清理，有差异保留路径和分支。',
          scope:
            '普通 Worktree 从当前本地分支创建；PR reference 从 fetch 的 PR tip 创建；Fork Agent 不支持 Worktree 隔离。',
          background:
            '隔离 Agent 沿默认后台行为运行；Arena 使用另一套 Worktree 目录。',
          integration:
            '可复用 node_modules 等目录的 symlink；恢复会话用 `<sessionId>.worktree.json` 恢复绑定。',
          artifacts:
            'Worktree、分支、sidecar、状态栏标识和可保留的 Agent Diff。',
          conditions:
            'ACP 不接受 `--worktree`，应把 Worktree path 作为 cwd；退出删除受 ownership、dirty 和未合并 commit 三重保护。',
          sources: ['qwen-worktree-current', 'qwen-review-current'],
        },
        kimi: {
          entry:
            '当前 CLI 与 Agent 文档没有创建、切换或清理 Worktree 的内置入口；可先用 `git worktree add`，再从该目录启动 `kimi`。',
          primitives:
            '标准 Git Worktree 和当前工作目录；内部能识别 `.git` 文件形式，但这不是用户可调用的管理能力。',
          behavior:
            '从已有 Worktree 启动时，文件与 Bash 自然作用于该 checkout；产品不负责创建分支或清理。',
          scope:
            '用户选定的启动目录；Subagent 默认共享被分配的工作目录。',
          background:
            '后台 Agent 可以并行，但当前文档未提供每 Agent Worktree 隔离字段。',
          integration:
            '可用自定义 Skill/Plugin 封装 `git worktree`，仍属于用户扩展。',
          artifacts:
            '由 Git 手工创建的 Worktree 和分支；Kimi 只产生其中的文件修改。',
          conditions:
            '本结论描述当前公开 Surface；不把内部 Git marker 检测当成 Worktree 管理功能。',
          status: '未确认',
          sources: ['kimi-agents-execution-current', 'kimi-tools-current'],
        },
        qoder: {
          entry:
            '`qodercli --worktree "job"` 创建；`qodercli jobs --worktree` 列出；`qodercli rm <job-id>` 删除。Agent 也支持 `isolation: worktree`。',
          primitives:
            '`~/.qoder/worktrees/<job-id>`、Concurrent Job、可选 `--branch` 与容器执行。',
          behavior:
            '多个终端可启动独立 Worktree Job；默认进入容器内 TUI，`-p` 可非交互执行后停止容器。',
          scope:
            '当前 Git 仓库；`--branch` 选择任务代码分支，其他 Agent 参数透传给容器内 CLI。',
          background:
            '每个 Job 有独立 ID、路径、状态和创建时间；可并行运行。',
          integration:
            'Subagent `isolation: worktree` 提供任务内隔离；Quest 也有 Local/Worktree execution environment。',
          artifacts:
            'Worktree 目录、Job 状态、分支和任务修改。',
          conditions:
            '需要本机 Git；`qodercli rm` 会删除 Worktree 且不可撤销。',
          sources: ['qoder-using-cli', 'qoder-agents'],
        },
      },
      related: ['agent-worktree', 'execution-git', 'execution-pr'],
    }),

    'execution-computer-use': createDetail({
      id: 'execution-computer-use',
      definition:
        '由产品内置并分发的桌面 GUI 自动化或真实浏览器控制能力：Agent 读取屏幕或页面、模拟鼠标键盘、操作窗口或已登录浏览器，而不要求用户自备 MCP Server。',
      includes: [
        '官方提供的桌面控制工具或插件（点击、输入、滚动、读屏）',
        '官方提供的真实浏览器控制入口（复用登录态）',
        '安装、就绪检测、系统权限授予与禁用方式',
      ],
      excludes: [
        '用户自行接入的第三方 MCP 浏览器或桌面工具',
        '仅抓取网页文本或返回搜索链接的 WebFetch/WebSearch 类工具',
        '产品自身的 Web 界面、桌面端或远程接管入口',
      ],
      facts: [
        'Qwen Code 在 CLI 内默认注册 `computer_use__*` 桌面控制工具，并含浏览器 `page` 工具；Kimi Code 的 `/plugins` 内置 `kimi-cu` 与 `kimi-webbridge` 已随 0.33.0 发布，`kimi-cu` 的 Windows x64 支持随 0.34.0（2026-08-06 发布）进入正式版本。',
        'Codex 的 Computer Use 属于 ChatGPT 桌面 App Surface：macOS 支持后台与锁屏使用，Windows 只操作活动桌面；Codex CLI 不提供同类内置工具。',
        'Claude Code 与 Qoder CLI 的官方内置工具表没有桌面或浏览器控制工具，官方路径是经 MCP 扩展。',
        '提供桌面控制的产品都要求 macOS 授予辅助功能与屏幕录制权限，并把动作类操作置于审批或用户授权之下。',
      ],
      products: {
        claude: {
          entry:
            '官方工具参考列出 Agent、Bash、Edit、Read、WebFetch、WebSearch 等内置工具，未包含桌面控制、鼠标键盘或浏览器控制工具；自定义工具经 MCP Server 添加。',
          primitives:
            '`WebFetch` 抓取 URL 并转 Markdown 处理，`WebSearch` 返回搜索结果标题和链接且不抓取结果页；二者都不操作浏览器界面。',
          behavior:
            '无产品内置 GUI 动作；用户自备的 MCP 或 Shell 自动化工具按常规权限规则审批。',
          scope:
            '当前官方工具参考面向 CLI 内置工具集合；桌面或浏览器控制不在其中。',
          background:
            '无对应内置能力；第三方 MCP 工具的生命周期由用户配置决定。',
          integration:
            'MCP 文档把 MCP Server 列为添加自定义工具的官方路径。',
          artifacts: '无产品内置产物。',
          conditions:
            '结论基于当前官方工具参考；第三方 MCP 可补充同类能力，但不计为产品内置。',
          status: '官方确认',
          sources: ['claude-tools', 'claude-mcp'],
        },
        codex: {
          entry:
            'ChatGPT 桌面 App 内经 Plugins > Computer Use 安装并启用；提示中提及 `@Computer` 或 `@AppName` 调用；桌面 App 的 Codex 入口可用。',
          primitives:
            '读取屏幕内容、截图、操作窗口与菜单、键盘输入和剪贴板状态；Chrome、Excel、PowerPoint 另有专用集成。',
          behavior:
            '首次使用某应用前请求授权并可 Always allow；敏感或破坏性动作可再次请求许可；文件读写与 Shell 仍遵循任务的沙箱与审批设置。',
          scope:
            'ChatGPT 桌面 App Surface（含 Codex 入口）；官方文档未把 CLI、IDE 或 Cloud 列为 Computer Use 运行位置。',
          background:
            'macOS 支持后台运行，并可在锁屏后经 Apple 授权插件临时解锁（Locked use）；Windows 只操作活动桌面并接管前台输入，不能在同一会话后台运行。',
          integration:
            'Windows 允许列表写入 `$CODEX_HOME/config.toml` 的 `[computer_use.windows] always_allowed_app_ids`；管理员可在 `requirements.toml` 用 `[features].computer_use = false` 禁用；旧 `$CODEX_HOME/computer-use/config.toml` 配置自动迁移。',
          artifacts:
            'GUI 操作结果保留在目标应用与系统状态；经 GUI 的修改可能延迟到落盘后才出现在 Review pane。',
          conditions:
            'macOS 需屏幕录制与辅助功能权限；不能自动化终端应用或 ChatGPT 自身；Windows 允许列表外的应用需审批；仅在支持地区随 ChatGPT Work 和 Codex 提供。',
          status: '条件项',
          sources: ['codex-computer-use', 'codex-config-reference'],
        },
        qwen: {
          entry:
            '内置工具以 `computer_use__` 前缀延迟注册，默认开启；`settings.json` 设 `tools.computerUse.enabled: false` 可整体关闭（重启生效）。',
          primitives:
            '原生 `cua-driver` 二进制首次使用时下载到 `~/.qwen/computer-use/`；工具覆盖鼠标（click、drag、scroll）、键盘（type_text、press_key、hotkey）、窗口与无障碍树、应用管理、轨迹录制和 `page` 浏览器页面操作。',
          behavior:
            '动作类工具（点击、输入、拖拽）需审批，只读工具可直接运行；macOS 需授予辅助功能与屏幕录制权限，授权对象可能是启动 Qwen Code 的终端或 IDE。',
          scope:
            '提供 macOS（Apple Silicon 与 Intel）、Linux x86_64、Windows x86_64 预构建二进制；macOS 支持最完整，部分工具仅限特定平台（如 `bring_to_front` 仅 Windows）。',
          background:
            '`tools.computerUse.idleTimeoutMs`（默认 `300000`）控制驱动空闲驻留时长，`0` 为常驻到退出。',
          integration:
            '`page` 工具操作 Chrome、Brave、Edge、Safari 与 Electron 应用中已加载的页面（执行 JS、读取 DOM、点击元素）；截图尺寸受 `tools.computerUse.maxImageDimension` 或 `QWEN_COMPUTER_USE_MAX_IMAGE_DIMENSION` 控制。',
          artifacts:
            '操作直接作用于真实桌面与浏览器；`start_recording`/`stop_recording`/`replay_trajectory` 可记录并重放操作轨迹。',
          conditions:
            '各项 `tools.computerUse` 配置均需重启生效；官方文档提示该能力把鼠标、键盘、窗口与屏幕内容交给 Agent，应在可信提示和隔离环境中使用。',
          status: '官方确认',
          sources: ['qwen-computer-use'],
        },
        kimi: {
          entry:
            'v2 CLI 的 `/plugins` 面板内置 `Kimi Computer Use`（`kimi-cu`）与 `Kimi WebBridge`（`kimi-webbridge`）条目，安装时一并配置最新托管运行时与插件，报告缺失的手动步骤并支持中断后重试；Windows x64 上同一 `kimi-cu` 条目对应后端插件 `kimi-cu-win`，marketplace 显示名为 `Kimi Computer Use for Windows`，能力安装失败时展示底层错误。',
          primitives:
            '`kimi-cu` 在 macOS 安装 `KimiCU.app`、同名插件与 `ai.kimi.cu.service` launchd 服务，提供后台 GUI 自动化：读取应用 UI、点击、输入、滚动、拖拽，不抢占鼠标或前台；在 Windows x64 安装插件 `kimi-cu-win` 与官方签名运行时 `kimi-cu.exe`，提供同类 Windows GUI 自动化（读取应用 UI、点击、输入、滚动、拖拽）；`kimi-webbridge` 安装 `~/.kimi-webbridge/bin/` 守护进程与官方浏览器控制插件，控制带登录态的真实浏览器（导航、点击、输入、读取页面、截图），浏览器扩展为可选手动安装。',
          behavior:
            '安装为幂等托管流程：macOS 按插件、应用、服务、权限（`kimi-cu`）或守护进程、插件、扩展连接（`kimi-webbridge`）逐项检测就绪状态；Windows x64 按插件、下载、运行时三步执行，安装前先探测 PowerShell 候选（系统 Windows PowerShell，随后 PowerShell 7 的 `pwsh.exe`），要求版本不低于 5.1 且具备安装脚本所需命令（探测超时 10 秒），再以 `-NoProfile -NonInteractive -ExecutionPolicy Bypass -Command` 运行 `setup_windows.ps1`（UTF-8 输出，安装超时 180 秒）；doctor 检测运行时健康时跳过运行时重装，doctor 探测失败时同样回退 PowerShell 7；插件文件被当前 Kimi Code 进程占用（EBUSY）时提示重启 Kimi Code 后重装；WebBridge 守护进程只在未运行时启动（start-if-down，与 Kimi Work 共存）。',
          scope:
            '`kimi-cu` 支持 macOS 与 Windows x64（仅 `win32` + `x64`，不含 Windows arm64）；`kimi-webbridge` 支持 macOS arm64/x64、Linux arm64/x64、Windows x64；条目由客户端按发布版本注入默认 Official marketplace，旧版本客户端不会看到。',
          background:
            '`kimi-cu` 在 macOS 经后台 launchd 服务运行；Windows x64 安装流程没有服务注册步骤，运行状态由 doctor 脚本检测；`kimi-webbridge` 守护进程常驻，就绪检测轮询 `/status`。',
          integration:
            'macOS 辅助功能与屏幕录制（TCC）权限只能由用户手动授予，就绪检测经 `xpc-ping` 校验；Windows x64 doctor 脚本按 `KIMI_CU_WINDOWS_EXE`、`KIMI_CU_WINDOWS_HOME`、`%LOCALAPPDATA%\\KimiCU\\kimi-cu.exe`、`%ProgramFiles%\\KimiCU\\kimi-cu.exe` 查找运行时，要求输出 `mcp=true` 且 `helper=embedded`；官方插件来源允许列表新增 `cdn.kimi.com/kimi-computer-use-windows/`；WebBridge 会检测 `~/.kimi-code/skills/` 与 `~/.agents/skills/` 下冲突的旧技能副本并在安装进度中标记迁移。',
          artifacts:
            '`KimiCU.app` 与 launchd 服务（macOS）、`kimi-cu.exe` 运行时（Windows x64）、`~/.kimi-webbridge/bin/kimi-webbridge[.exe]` 及版本文件、已安装的官方插件。',
          conditions:
            '`kimi-cu` 与 `kimi-webbridge` 内置条目已随 0.33.0 发布；Windows x64 支持（PR #2652 与 #2686 的 PowerShell 兼容、占用文件恢复修正）随 0.34.0（2026-08-06 发布）进入正式版本；仅 v2 CLI 提供；安装进行中会返回 `capability.install_in_progress`。',
          status: '条件项',
          sources: [
            'kimi-builtin-capabilities',
            'kimi-cu-windows',
            'kimi-cu-powershell',
            'kimi-cu-windows-release',
          ],
        },
        qoder: {
          entry:
            '官方 SDK Reference 内置工具表列 Bash、Read、Edit、Write、Glob、Grep、WebFetch、WebSearch、Agent、NotebookEdit、TaskOutput、TaskStop 等，未包含桌面控制或浏览器控制工具。',
          primitives:
            '`WebFetch` 抓取并处理 URL 内容，`WebSearch` 执行网页搜索；二者均不操作浏览器界面或桌面。',
          behavior:
            '无产品内置 GUI 动作；用户自备的 MCP 工具按权限规则审批。',
          scope:
            'TUI、Headless、ACP 与 Agent SDK 共用同一内置工具集合，各入口可用 `tools`/`allowedTools`/`disallowedTools` 再过滤。',
          background: '无对应内置能力。',
          integration: '官方 MCP 文档提供自定义 Server 的接入路径。',
          artifacts: '无产品内置产物。',
          conditions:
            '结论基于当前官方内置工具表；第三方 MCP 可补充同类能力，但不计为产品内置。',
          status: '官方确认',
          sources: ['qoder-sdk-reference', 'qoder-mcp'],
        },
      },
      related: ['execution-shell', 'extension-mcp', 'security-approval'],
    }),
  });
})();

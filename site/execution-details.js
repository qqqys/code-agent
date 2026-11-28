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
        '单次读取的大小上限、超限结果与一次读完的入口',
        '修改前读取、权限审批与工作区边界',
      ],
      excludes: [
        'Shell 工具自身的执行、超时与后台进程管理',
        '代码搜索和符号导航',
        'Git 暂存、提交与回退',
      ],
      facts: [
        '五家都提供模型可直接调用的文件读写能力，不需要先拼接 Shell 命令。',
        'Claude Code、Qwen Code 和 Qoder CLI 单独提供 Notebook 编辑工具；Kimi Code 的当前工具表把媒体读取与文本读取分开。',
        '工具名称相近不代表审批相同：只读工具通常可直接运行，写入和编辑仍受各自权限模式、工作区边界与沙箱约束。',
        '换行处理不同：Codex `apply_patch` 自 rust-v0.162.0 起无条件保留原换行（旧的归一为 LF 模式与 `apply_patch_preserve_line_endings` opt-in 开关已移除）；Qwen Code `edit` 默认检测并保留原换行风格。Claude Code、Kimi Code 与 Qoder CLI 的官方工具文档未列同类换行保留或规范化配置。',
        '写前读与过期写入保护在 2026-11-28 复核后分成四类。仍强制且没有自动恢复例外的是 Kimi Code：2.8.1 标签提交下的中文工具文档在 `Write` 与 `Edit` 段各写明目标文件必须先在本会话用 `Read` 读过、文件自上次读取后在磁盘上变化即拒绝、新建文件不受限。强制但带恢复例外的是 Claude Code 与 Qwen Code：Claude Code 工具参考的 **Read-before-edit** 要求当前会话先读取（`PARTIAL view` 截断读取不算，Opus 4.6、Haiku 4.5 及更早模型始终要求先读，较新模型在读取免权限提示且 Read 可用时可编辑未读文件），读后磁盘变化的文件在 `old_string` 精确唯一匹配且读取无需提示时仍可直接编辑；Qwen Code 自 v0.28.0 起把同类例外升级为有官方设计文档的「授权过期恢复」——`edit` 在读后指纹漂移时按当前文件内容自动改写唯一一处字面匹配、默认开启且不加人工确认，而 `write_file` 从不请求恢复、必须等一次成功文本读取刷新基线。已取消的是 Qoder CLI：1.1.100 更新日志逐字写 “Improved Edit logic so it no longer requires reading a file with Read before editing”，这是官方一手资料第一次承认此前存在该要求，Tools 页在核对日期没有任何对应文字。从未有过的是 Codex：Apply Patch 指南不设写前读要求，`update_file` 上下文与文件内容不匹配时返回 `Error: Invalid Context` 由模型自行重读。',
        '过期恢复都不构成授权边界，且都不保证语义位置：Claude Code 把「读取无需权限提示」当作例外的前提条件之一，Qwen Code 的设计文档逐字写 “This is a deliberate tradeoff for default automatic recovery, including AUTO_EDIT/YOLO and noninteractive execution. A confirmation warning or a returned snippet communicates the event; neither is an authorization boundary or a proof of the old semantic location.”，并说明恢复只替换 `old_string` 在**当前文件**里的那一处字面匹配、“It does not prove that this occurrence is the semantic location seen in an earlier Read.”；Kimi Code 一律拒绝漂移写入，Qoder CLI 自 1.1.100 起一律不检查，两者都没有这一层。',
        '单次读取的额度口径五家各不相同：Claude Code 按 token 计（默认一次至多 25,000 token，整文件超过 256 KB 直接拒绝），自 v2.1.296 起模型可在单次调用传 `allow_large: true` 改为按会话剩余上下文窗口计量；Kimi Code 自 2.4.1 起是字符加估算 token 双上限（默认与单次可申请上限都是 100,000 字符，单次调用还在估算 token 达到 `[read] max_chars` 的四分之一即默认约 25,000 时停止，非 ASCII 每字符计 1 token、ASCII 每 4 字符计 1，调高配置 `max_chars` 同时抬高两个上限，旧的「单次可申请到 500,000 字符」作废）；Qwen Code 按行数加字符计（默认 1000 行、25,000 字符，各自设 `-1` 关闭，都需要重启），没有每次调用的放大入口；Codex 没有专用文本读取工具，文本读取走 `exec_command`/`write_stdin` 的 `max_output_tokens`（默认 10000 token）并另有 1 MiB 的保留输出硬上限；Qoder CLI 官方只写「文件过大时读取聚焦片段」，没有公布任何数值上限。',
        '超限后的可恢复性也不同：Claude Code 整文件超 token 上限时返回首页并附 `PARTIAL view` 提示、整文件超 256 KB 或分页读超 token 上限时直接报错并要求改用 `offset`/`limit` 或 Grep；Kimi Code 在状态里给出列范围与 `Next Read` 参数，单行放不下时按片段返回，2.4.1 起指定 `n_lines` 或负 `line_offset` 的范围在 `max_chars` 之内放下后仍超估算 token 上限时直接报错并给出放得下的行数与改用 Grep 的建议、不返回部分内容，一次返回整个文件且没有需要说明的情况时省略状态块；Qwen Code 把超限输出写进会话临时目录并在历史里留预览加指针，模型可用 `read_file` 取回；Codex 对 stdout 与 stderr 各自 `truncate` 到上限，保留开头、丢弃结尾且不报告截断行数。',
        '非文本读取的边界各自独立：Claude Code 拒绝超过 128 MB 的图片源（v2.1.302，更新日志与工具参考同口径）并拒绝 `.xlsx`、`.parquet`、`.heic`、`.zip` 等按二进制处理的扩展名；Kimi Code 图片与视频走 `ReadMediaFile`、官方写明文件大小上限 100 MB；Qwen Code PDF 的 `pages` 一次至多 20 页（`PDF_MAX_PAGES_PER_READ`），自 v0.26.2 起托管 Provider 场景的 `ReadFileTool` 可带 `mediaLimits` 限制内联媒体与结果字节数而标准 CLI 构造不传该参数；Codex `view_image` 声明没有字节或像素上限；Qoder CLI 自 1.1.100 起内置 PDF 阅读插件，更新日志逐字为 “Added a built-in PDF reading plugin so you can read PDF text and images without installing a third-party environment”，但 Built-ins、Plugins Reference 与设置参考三页对 `pdf` 的命中数均为 0，插件名、入口、能否禁用与页数或字节上限都没有公布，此前 Tools 页 “Inspect supported document formats, such as PDFs, when available.” 里的 “when available” 是否就指该插件也未确认，其余媒体类型仍然没有数值上限。',
      ],
      products: {
        claude: {
          entry:
            '模型调用 `Read`、`Edit`、`Write`；Notebook 使用 `NotebookEdit`，图片和 PDF 可由 `Read` 读取。',
          primitives:
            '`Read` 支持文本、图片、PDF 与 Notebook，接受文件路径与 `offset`/`limit` 分页参数，PDF 另有 `pages`；`Edit` 做精确替换；`Write` 创建或覆盖；`NotebookEdit` 修改单元。官方工具参考写明 `Read` 返回带行号的内容、Claude 被要求始终传绝对路径、读空文件会得到「文件存在但内容为空」的提示、`offset` 超过最后一行会得到带文件行数的提示（v2.1.208 之前读空文件返回的是越界提示），并且 `Read` 只读文件不读目录、列目录要用 `ls` 一类 Shell 命令。',
          behavior:
            '`Edit` 与 `Write` 会触发文件修改权限检查；读取和搜索工具默认不要求权限，官方工具参考里 `Read` 行的 Permission required 为 “No”。编辑后 LSP 可自动回报类型错误。读取额度按 token 计：默认一次 `Read` 至多返回 25,000 token，或 `CLAUDE_CODE_FILE_READ_MAX_OUTPUT_TOKENS` 设定的值，整文件超过 256 KB 直接拒绝，因此更大的文件要用 `offset` 与 `limit` 分页读；自 v2.1.296 起模型可在单次调用传 `allow_large: true`，改为按会话上下文窗口的剩余空间计量，一次读完整文件或一段很长的行范围，官方给出的典型理由是用户要求看整个文件，图片、PDF 与 Notebook 仍保留各自上限。超过默认上限时分两种结果：整文件超过 token 上限返回首页并附 `PARTIAL view` 提示，说明收到了多少以及怎么用 `offset`/`limit` 继续读；整文件超过 256 KB，或带 `offset`/`limit` 的分页读超过 token 上限，则返回错误，要求改用 `offset`/`limit` 读一段或改用 Grep 搜具体内容。官方工具参考记录读后再改要求：当前会话需先读取目标文件，`PARTIAL view` 截断的读取不算；Claude Opus 4.6、Haiku 4.5 及更早模型始终要求先读，较新模型在读取无需权限提示且 Read 工具可用时可编辑未读文件；Bash 用 `cat`、`nl`、`bat`、`batcat`、`head`、`tail`、`sed -n \'X,Yp\'`、`grep`、`egrep`、`fgrep`、`rg` 查看单文件且无管道或重定向也满足要求。`Write` 覆盖已有文件是否必须先读取决于模型与文件；Jupyter Notebook 与部分读取的文件对所有模型都要求先读；新建文件不受限。文件在上次读取后变化时，仅当 `old_string` 与当前内容精确且唯一匹配、读取无需提示才允许直接编辑，其余情况要先重读。',
          scope:
            '以当前项目目录和已加入的工作目录为主要范围；目录外访问由文件权限规则决定。',
          background:
            '文件工具本身同步返回；可由后台 Agent 或 Worktree 会话并行调用。',
          integration:
            'IDE 扩展可把修改显示在原生 Diff 视图；Hooks 可在工具调用前后校验或阻止变更。',
          artifacts:
            '修改直接落在当前工作区或当前 Worktree；检查点与 Git 决定后续回退方式。',
          conditions:
            '工具可被 `permissions.deny`、Subagent 工具列表或 Plugin 配置移除；Plan 模式会限制写入。官方工具参考未列 `Edit`/`Write` 的换行保留或规范化配置。非文本类型的上限各自独立：图片按模型的图片尺寸限制先缩放重压，缩放后仍超过 500KB 的会以降低质量重编码为 JPEG 且不改像素尺寸，自 v2.1.302 起超过 128 MB 的图片源直接拒绝（更新日志逐字 “Fixed the Read tool loading an image file of any size, or a pipe or device named like an image, entirely into memory; image sources over 128 MB are now refused”，工具参考写明错误会要求先缩小或导出更小副本再读，管道或设备文件伪装成图片名同样适用）；按二进制处理的扩展名（如 `.xlsx`、`.parquet`、`.heic`、`.zip`）也被拒绝，错误会建议对应文件类型的 Skill 或读取该格式的 Shell 命令、脚本，`@` 提及被拒文件时模型只收到路径不收到内容（v2.1.301 修复把 `.xlsm`、`.parquet`、`.epub`、`.heic` 等当文本读取的问题）；PDF 超过 10 页时用 `pages` 按范围读、一次至多 20 页，页面范围读取依赖 poppler-utils 的 `pdftoppm`，缺失时以 `pdftoppm is not installed` 失败，v2.1.312 修复了旧会话文件清理与 PDF 页渲染并发时 `pdftoppm failed: Could not write image` 的偶发失败；Notebook 返回全部单元与输出，单元合计超过 256 KB 或超过 token 上限时返回错误，超过 100 MB 的 Notebook 拒绝读取并在错误里说明改用 Shell 读一部分。`allow_large` 需要 v2.1.296 及以上；`CLAUDE_CODE_FILE_READ_MAX_OUTPUT_TOKENS` 只改默认 token 上限，官方环境变量页写明带 `allow_large` 的读取在上下文窗口有余量时可以超过它。2026-11-01 复核 main `80c6959d28c4c30ecd14fc1cdf172f19d9adad81` 的更新日志（1,130,515 字节、最新段 v2.1.316）与工具参考 `.md`（87,860 字节），v2.1.296 至 v2.1.316 之间没有改变 25,000 token 默认、256 KB 整文件拒绝或 `allow_large` 语义的条目。2026-11-28 把读后再改的证据坐标前移到工具参考 `.md` 99,807 字节（比 2026-11-01 增加 11,947 字节）：**Read-before-edit**、磁盘漂移例外、Bash 单文件查看抵充与 `Write` 覆盖未读文件四段引文逐字未变，新增字节来自权限 Hook 上限、Perforce 只读保护（`CLAUDE_CODE_PERFORCE_MODE=1`）与非 UTF-8 文件等其他小节；同版更新日志到 v2.1.332（2026-11-25T01:32:14Z 发布）为止没有改动读后再改要求、25,000 token 默认或 256 KB 拒绝的条目，`## 2.1.332` 段里与文件读取相关的三条都是修复而非规则变更——命名管道无写入方时 Read、`@` 提及与压缩挂起改为 20 秒后失败、`@` 提及的带扩展名文本文件即使前 2,000 行也超读取上限时不再被静默丢弃而是告知大小与读法、以及 Linux 上 Claude 通过符号链接读过文件后 Bash 编辑 diff 把未改动的符号链接显示为已编辑。',
          sources: [
            'claude-tools',
            'claude-tools-read-before-edit-20261128',
            'claude-read-large-files',
            'claude-read-limit-changelog',
            'claude-v21302-read-fixes-changelog',
            'claude-env-vars',
            'claude-permissions',
          ],
        },
        codex: {
          entry:
            '模型用统一执行工具 `exec_command` 与 `write_stdin` 读取文本文件，用 `apply_patch` 提交修改，图片用 `view_image`。固定到 rust-v0.166.0 标签提交 `6ff1e1ca3b30fc8b914720681fcf5fe62e95f856` 的工具 handler 目录（57 个条目，与此前记录的 main `f82e36592278` 逐项相同、增减均为零）里没有任何专用文本读取工具，只有 `apply_patch`、`current_time`、`get_context_remaining`、`list_available_plugins_to_install`、`mcp`、`mcp_resource`、`multi_agents`、`new_context_window`、`plan`、`request_permissions`、`request_plugin_install`、`request_user_input`、`send_message_to_user_async`、`shell`、`sleep`、`test_sync`、`tool_search`、`unified_exec`、`view_image` 与 `wait_for_environment`。',
          primitives:
            '读取没有独立工具，因此读取额度就是命令输出额度：`shell_spec.rs` 里声明为 `exec_command` 与 `write_stdin` 的两个工具都带 `max_output_tokens` 参数，描述逐字为 “Output token budget. Defaults to 10000 tokens; larger requests may be capped by policy.”，`registry.rs` 另按 `"exec_command" | "shell_command"` 匹配同类调用。写入的核心路径是读取文件后提交结构化补丁；自 rust-v0.162.0 起 `apply_patch` 无条件保留原换行——旧的 `NormalizeToLf`（把更新文件归一为 LF）模式已移除，未改动行保留各自原有结尾（混合换行也能存活），插入行采用文件首个已有换行风格，文件无换行时用 LF。`view_image` 的描述逐字为 “View a local image file from the filesystem when visual inspection is needed. Use this for images already available on disk.”，参数只有必填的 `path`，`detail`（`high` 或 `original`）只在 `can_request_original_image_detail` 为真且未启用 `unified_image_budget` 时才出现。',
          behavior:
            '补丁在应用前后仍受当前审批预设和文件系统沙箱控制；只读模式不会允许持久修改。官方 Apply Patch 指南（Responses API harness 说明）列出 `create_file`/`update_file`/`delete_file` 三种 V4A diff 操作并由 harness 应用，未设写前读强制要求；`update_file` 上下文与文件内容不匹配时应用失败并返回如 `Error: Invalid Context` 的错误，模型据此重读文件或简化改动后重试。读取超限的行为由 exec 输出保留逻辑决定：`EXEC_OUTPUT_MAX_BYTES` 取 `DEFAULT_OUTPUT_BYTES_CAP`（`1024 * 1024`，即 1 MiB），源码注释逐字为 “Hard cap on bytes retained from exec stdout/stderr/aggregated output.”，且只有 `ExecCapturePolicy::ShellTool` 返回该上限、`FullBuffer` 一类策略返回 `None`；超限时对 stdout 与 stderr 各自调用 `truncate(max_bytes)`，因此保留开头、丢弃结尾，返回结构里的 `truncated_after_lines` 为 `None`，不报告截断发生在第几行。`MAX_EXEC_OUTPUT_DELTAS_PER_CALL = 10_000` 只限制实时增量事件条数，聚合仍收集完整输出。',
          scope:
            '默认受当前工作区、额外可写目录和所选沙箱边界约束；桌面 App Worktree 会把落盘位置切到隔离目录。',
          background:
            '文件编辑随当前 Agent 线程执行；并发 Subagent 仍共享父线程审批与沙箱边界。',
          integration:
            '桌面 App 和 IDE 可展示 Diff；App Review pane 支持对改动进行暂存或回退。',
          artifacts:
            '结果是工作区文件修改和可审阅 Diff；不会因为生成补丁自动创建提交。',
          conditions:
            '实际可写范围取决于 Read Only、Auto 等权限预设以及运行时沙箱；Cloud 任务使用远端环境。换行保留自 rust-v0.162.0（2026-10-08 发布，PR #51203 合并提交 `685270a56a96`）起为默认且唯一行为，不再需要任何开关：功能登记册把 `apply_patch_preserve_line_endings` 标记为 `Stage::Removed`（doc comment 逐字为 "Removed compatibility flag. Patches always preserve existing line endings."），旧的 LF 归一模式连同该 opt-in 一并删除。为兼容仍按环境变量选择模式的旧版独立 `apply_patch` 可执行文件（含远程 executor 提供的），Core 在子进程环境里总是注入 `CODEX_APPLY_PATCH_PRESERVE_LINE_ENDINGS=1`，并先按大小写不敏感清除继承来的同名值再写入，官方注释逐字为 "Override inherited values so they cannot restore the legacy normalization behavior."。读取侧的边界是：没有专用读取工具因而没有「读完整文件」的开关，`max_output_tokens` 是每次调用可传的预算但官方描述写明更大的请求可能被策略压低，1 MiB 是保留输出的硬上限而非可配置项；官方文档站与配置参考在核对日期都没有给出这两个数值。2026-11-01 把证据坐标从 main `f82e36592278` 前移到 rust-v0.166.0 标签提交 `6ff1e1ca3b30fc8b914720681fcf5fe62e95f856`（2026-10-29T19:47:53Z 发布，也是核对日期最新 Release）：`shell_spec.rs`（13,034 字节）两处 `max_output_tokens` 描述、`exec.rs`（45,483 字节）的 `EXEC_OUTPUT_MAX_BYTES`/`MAX_EXEC_OUTPUT_DELTAS_PER_CALL` 与 `codex-rs/utils/pty/src/lib.rs` 第 25 行的 `DEFAULT_OUTPUT_BYTES_CAP: usize = 1024 * 1024` 逐字未变，0.166.0 发布说明也没有读取额度条目。2026-11-28 复核写前读一侧：Apply Patch 工具指南（HTML 630,109 字节）仍只列 `create_file`、`update_file`、`delete_file` 三种 V4A diff 操作，全页对 “read the file”、“before editing”、“must read” 的命中数均为 0、`Invalid Context` 命中 1 处，即 Codex 依旧不设写前读强制要求；rust-v0.172.0 标签提交 `fc3036dba44468096953f0e832f3fecd3adc0228`（2026-11-24T00:03:55Z 发布，核对日期最新稳定 Release）下 `codex-rs/core/src/tools/handlers` 目录仍是 57 个条目、与 rust-v0.166.0 记录同数，仍然没有任何专用文本读取工具；rust-v0.172.0（正文 8,505 字节）到 rust-v0.174.0-alpha.9（2026-11-27T16:56:00Z）共 15 个 Release 的正文里 `apply_patch`、“read before”、“prior read” 的命中数均为 0，main 分支 `CHANGELOG.md`（330 字节）的 Unreleased 段只有一条 unified exec 命令生命周期事件修复，因此读取额度与写前读两侧的结论都按未变处理，读取额度的源码坐标仍停在 rust-v0.166.0。',
          status: '源码确认',
          sources: [
            'codex-docs',
            'codex-approvals',
            'codex-review',
            'codex-apply-patch-guide',
            'codex-apply-patch-no-prior-read-20261128',
            'codex-v0162-release',
            'codex-apply-patch-unconditional',
            'codex-apply-patch-text-file',
            'codex-apply-patch-exec-env',
            'codex-apply-patch-features',
            'codex-tool-handlers',
            'codex-shell-max-output-tokens',
            'codex-exec-output-cap',
            'codex-pty-output-cap',
            'codex-view-image-spec',
          ],
        },
        qwen: {
          entry:
            '模型调用 `read_file`、`edit`、`write_file` 和 `notebook_edit`。目录浏览工具 `list_directory` 自 v0.22.0 起默认关闭，启用后可用（`tools.listDirectory.enabled`），目录列表通常由 `glob` 完成。',
          primitives:
            '`read_file` 分页读取，参数为必填的 `file_path`（描述逐字要求绝对路径）与可选的 `offset`（0 基起始行号，描述写明必须同时设 `limit`）、`limit`（最多读多少行，描述逐字为 “If omitted, reads the entire file (if feasible, up to a default limit).”）、`pages`（PDF 页范围，1 基，一次至多 `PDF_MAX_PAGES_PER_READ = 20` 页，不支持 `3-` 这类开区间）；`edit` 做受控替换；`write_file` 写入完整内容；`notebook_edit` 修改 Notebook 单元。',
          behavior:
            '读取与编辑分别经过路径权限、工作区信任和 approval mode。`read_file` 的默认分页上限不是硬编码行数，而是取 `config.getTruncateToolOutputLines()`，也就是设置项 `tools.truncateToolOutputLines`（默认 `1000`，官方描述 “Maximum lines or entries kept when truncating tool output. Applies to Shell, Grep, Glob, ReadFile and ReadManyFiles tools.”，Requires restart: Yes）；同时按 `tools.truncateToolOutputThreshold`（默认 `25000` 字符，官方描述同一句适用范围，Requires restart: Yes）做字符截断，超出的那一行被截到剩余额度并追加 `... [truncated]`。两个设置在 schema 里的描述都写明 “Set to -1 to disable.”，源码里 `getTruncateToolOutputThreshold()` 与 `getTruncateToolOutputLines()` 在配置值 `<= 0` 时返回 `Number.POSITIVE_INFINITY`。截断时给模型的内容加前缀 `Showing lines <start>-<end> of <total> total lines.`，行数不精确时 total 写作 `at least <n>`；界面显示为 `Read lines <start>-<end> of <total> from <path>`，字符截断时再追加 ` (truncated)`。`ReadFileTool` 的 `maxOutputChars` 被显式重写为 `Number.POSITIVE_INFINITY`，源码注释逐字为 “Self-managed: ReadFile controls its own size via line-based paging (offset/limit, default truncateToolOutputLines setting), so it is exempt from the scheduler’s char-based truncation. Oversized reads are bounded by the per-message batch budget instead.”，那个每消息预算是 `tools.toolOutputBatchBudget`（默认 `DEFAULT_TOOL_OUTPUT_BATCH_BUDGET = 200_000` 字符，schema 描述 “Per-message character budget for the combined text output of one batch of tool calls. Oversized batches are reduced deterministically and recoverable output is persisted when possible. Set to -1 to disable.”）。官方设计说明给出的分层预算为：持久化闸门是配置阈值加 3k 余量（默认 28k）且按名豁免 `exec`、`read_file`、`read_mcp_resource`、`enter_plan_mode`；每工具预算是 shell 30k、grep 20k、mcp 500k、agent 32k 尾部、web-search 102k、read-file 自管；全局 25k 字符加 1000 行；合并 pass 为适用预算的 2 倍；每条消息 200k 字符；落盘上限单文件 50MB、单会话 500MB。超限输出写进会话临时目录的 `tool-results/<callId>.txt`（mode 0o600），历史里只留预览加指针，模型可以用 `read_file` 把完整内容取回；截断保留头尾（`keep: \'both\'`）。`edit` 以 `checkPriorRead` 强制读后再改：未经合法读取的已有文件拒绝编辑，按 mtime/文件大小检测过期，并在读取后、写入前各复核一次以收紧 TOCTOU 窗口；工具描述也要求先查看文件当前内容再尝试替换。放行的判据不只是 `cache.check === \'fresh\'`，源码注释逐字写 “the recorded read must also have been (a) stamped with `lastReadAt` and (b) `lastReadCacheable` (i.e. plain text, not binary / image / audio / video / PDF / notebook — those return a structured payload the Edit / WriteFile tools cannot mutate as text).”，而 `lastReadCacheable` “is purely about content type, not completeness”，截断或分页的文本读取同样记账；`lastReadWasFull` 只服务 Read 快路径、明确不参与强制判定，理由是 truncate-tool-output 上限会让「读完整」在大文件上成为不可能的前置条件（issue #3945）。经 `edit`（`old_string === \'\'`）或 `write_file` 新建的文件会在 `recordWrite` 里补种 `lastReadAt`/`lastReadCacheable`，因此紧接着改同一文件不需要再显式读取。自 v0.28.0（PR #17255，合并提交 `b5fdabf55e71fd3c861697cfbd6360cbbd7008f6`、2026-11-16T12:23:28Z）起 `edit` 另有「授权过期恢复」：读后磁盘指纹漂移时不再一律返回 `FILE_CHANGED_SINCE_READ`，而是按**当前文件**内容改写 `old_string` 唯一一处字面匹配并保留替换范围之外的字节，官方设计文档逐字写 “Keep automatic recovery enabled by default without adding human confirmation.”；恢复门禁逐字为 `const canAttemptStaleRecovery = !replaceAll && params.old_string !== \'\' && params.old_string !== params.new_string && !(this.confirmationCompleted && !this.confirmedStaleSnapshot) && (await this.canAutoReadFileForStaleRecovery(params.file_path));`，即 `replace_all`、空 `old_string`（新建）、no-op 与缺少自动读权限四种情况都不恢复，恢复也从不做模糊空白、引号或 Unicode 匹配，未命中、多处命中与不支持的情形仍返回 `FILE_CHANGED_SINCE_READ`。恢复决策会冻结一份 dev/inode/mtime/size 快照，读后、确认与写前三处 TOCTOU 检查都必须匹配它，`expectedStaleSnapshot` 即使没有 `allowStaleRecovery` 也能放行匹配的续作，其间并发 Read 让缓存变 fresh 不会替换冻结快照，但文件随后再变或被删仍被拒绝；恢复写入后 `recordWrite` 保留 `readBaselineNeedsRefresh`，因此后续 `edit` 继续走恢复门禁，而 `write_file` 必须等一次成功的文本读取刷新基线——设计文档逐字写 “WriteFile rejects until a successful text Read refreshes the baseline.”、`write_file` 从不请求恢复。`grep` 与 `rg` 的搜索片段记普通写前读信用但不清除待刷新的恢复基线，Shell 工具模拟的 `sed -i` 编辑同样要等一次成功文本读取且不走 Edit 的唯一字面恢复契约。结果侧同版瘦身：普通成功编辑只回简洁确认、不复述模型自己给的文本，用户改过的替换与恢复出来的编辑在既有行数上限与 8,000 字符上限都放得下时附带 “Showing lines <start>-<end> of <total> from the edited file:” 片段、放不下时要求改用 Read，恢复结果还会说明 `write_file` 需要 Read 而后续 `edit` 仍走恢复检查，成功恢复写入后发一个 debug 事件（准备阶段不发）。`edit` 匹配前把 CRLF 归一为 LF，写回已有文件时按检测到的原换行风格恢复。',
          scope:
            '默认工作区是启动目录；`--include-directories`、Worktree 或 Daemon workspace 可改变有效路径范围。',
          background:
            '后台 Agent 可使用文件工具；普通文件工具调用自身不是长驻任务。',
          integration:
            'VS Code Companion 可打开原生 Diff；PreToolUse、PostToolUse 和 Permission Hooks 可观察或阻止调用。',
          artifacts:
            '修改写入当前工作区、当前 Worktree 或显式 Agent 工作目录；不会自动暂存或提交。',
          conditions:
            'Plan mode 禁止普通写入；auto-edit、auto、yolo 对审批的处理不同，沙箱仍是独立边界。读取侧没有每次调用的放大入口：`limit` 可以传更大的值，但字符阈值仍会截断，要一次拿到更多内容只能改设置并重启（`tools.truncateToolOutputThreshold` 或 `tools.truncateToolOutputLines` 设 `-1` 关闭对应上限，`tools.toolOutputBatchBudget` 同样支持 `-1`）。`tools.toolOutputBatchBudget` 在 v0.26.5 的官方设置参考（394,252 字节）里仍然没有任何行，只出现在设置 schema 源码与官方设计说明中，文档缺口持续；同一份设计说明的日期是 2026-08-10、自 2026-09-13 起未再改动，其中的分层数值与 v0.26.5 源码常量一致。托管 Provider 是唯一带媒体字节上限的读取场景：自 PR #13606（提交 `6dfd4e47471c`，2026-10-25 合入 main、首次随稳定版 v0.26.2 发布）起 `ReadFileTool` 构造函数接受可选 `mediaLimits`（`maxInlineMediaBase64Bytes`/`maxMediaResultBytes`），超限时返回 `FILE_TOO_LARGE` 错误并建议 PDF 收窄 `pages` 或换更小文件，标准 CLI 构造不传该参数、读取行为不变。`@` 文件提及走的是同一条读取路径：`readManyFiles` 的源码注释写明 `@` 提及不传显式 `offset`/`limit`/`pages`，但 `processSingleFileContent` 会把 `config.getTruncateToolOutputLines()` 当默认上限，因此大附件同样可能被截断，这与 `read-file.ts` 保持一致以便 Edit/Write 的写前读判定相同。本次读取额度的证据由标签 v0.25.1 前移到 v0.26.5（标签提交 `db0e4e24a0d89b211b2a15f4af2be22adac71dfc`，2026-11-01T03:22:50Z 发布，也是核对日期最新稳定 Release）：`config.ts`（530,385 字节）三个常量 25_000/1000/200_000、`settingsSchema.ts`（243,865 字节）三个键与 `read-file.ts`（33,004 字节）的 Self-managed 注释和 `maxOutputChars` 重写逐字未变，v0.26.0 至 v0.26.5 的发布说明没有读取额度变更条目。写前读一侧的边界另有三条：**(1) Managed 会话整体不生效**——`config.ts` 构造函数逐字为 “// A Managed session reads in its Runtime worker, so this process could // neither elide a repeated read nor prove the read an edit requires. this.fileReadCacheDisabled = params.sessionExecutionEngine === \'managed\' || (params.fileReadCacheDisabled ?? false);”，即 `sessionExecutionEngine` 为 `managed` 时读缓存被强制关闭，写前读强制与过期恢复一起失效；`fileReadCacheDisabled` 只是 `ConfigParameters` 的可选字段、默认 `false`，同标签下 `packages/cli/src/config/settingsSchema.ts`（253,968 字节）对 `fileReadCache` 与 `readCache` 的命中数均为 0，因此它不是用户可写的设置项，源码注释还明确它是 OPT-OUT（整体绕过强制、把安全网让给应用层锁）而不是更严格的模式，想要比残留的 issue #2499 风险更严格的内置强制当前没有开关。**(2) 恢复的授权面**——`canAutoReadFileForStaleRecovery` 在 `getFileSystemService().textFileIo` 存在（托管 Runtime 自带文件 IO）、`shouldQwenIgnoreFile(filePath)` 命中忽略规则（忽略文件名由同标签 `packages/core/src/utils/qwenIgnoreParser.ts` 给出：`const QWEN_IGNORE_FILE_NAME = \'.qwenignore\';`，另有 `DEFAULT_QWEN_CUSTOM_IGNORE_FILE_NAMES = [\'.agentignore\', \'.aiignore\']`，且 `.qwenignore` 恒被包含）、`getFileReadDefaultPermission` 不是 `allow`、以及权限规则求值后 `finalPermission !== \'allow\'` 或 `pmForcedAsk` 为真这四种情况下返回 `false`，取不到 PermissionManager 时返回 `true`；设计文档另写明恢复尊重 canonical workspace 与 managed-memory 根、已批准的 runtime 根、忽略文件、显式 ask/deny 规则与 scoped-I/O 排除，且 “An explicit allow rule does not widen an otherwise nonautomatic default root.”。**(3) 检查自身的固有局限**——设计文档逐字承认 “The stat-to-write race and identical-mtime/size collisions remain limitations of fingerprint-based checks; this change introduces neither locks nor content hashes.”，快照钉住的是准备到写入这一段而不是与旧 Read 语义目标的连续性，外部改写把唯一匹配文本挪进另一个函数时当前那处就是目标；stat 出错时 fail-closed，只有 `ENOENT` 按「文件本来就不存在」放行去走新建路径。**版本坐标**：授权过期恢复由 PR #17255（合并提交 `b5fdabf55e71fd3c861697cfbd6360cbbd7008f6`、2026-11-16T12:23:28Z，v0.28.0 Release 正文逐字列出 “feat(core): slim edit output and add authorized stale recovery (#17255) by @callmeYe”）引入，官方设计文档 `docs/design/2026-11-15-edit-stale-recovery.md`（英文 6,906 字节、中文 `.zh-CN.md` 5,913 字节）在 v0.27.4 标签下取回 404、在 v0.28.0 与 v0.28.7 标签下都存在且与 PR 提交逐字节相同，即首发于 v0.28.0（2026-11-17T11:17:50Z）；本次把源码坐标固定到 v0.28.7 标签提交 `3a9baf531a8e54793de635dc3ab0e21a51c3542f`（`priorReadEnforcement.ts` 19,435 字节、`edit.ts` 46,171 字节、`config.ts` 560,882 字节），main `cc652838c470e0b960b6010f58e28094a2c16791`（2026-11-27T18:21:20Z）上 `edit.ts` 为 47,780 字节但 `canAttemptStaleRecovery` 判据逐字相同；v0.28.6 与 v0.28.7 的 Highlights 与 Breaking Changes 里没有任何写前读或过期恢复条目，v0.28.7 唯一的 Breaking Changes 讲的是工具调用次数上限（PR #18418）而不是文件写入前置条件。',
          sources: [
            'qwen-tools-current',
            'qwen-settings',
            'qwen-worktree-current',
            'qwen-edit-tool',
            'qwen-edit-tool-0287',
            'qwen-prior-read-enforcement-0287',
            'qwen-edit-stale-recovery-design',
            'qwen-config-managed-read-cache-0287',
            'qwen-v0280-release-stale-recovery',
            'qwen-list-directory-settings',
            'qwen-read-file-source',
            'qwen-truncate-settings',
            'qwen-truncate-schema',
            'qwen-truncate-config',
            'qwen-file-utils-truncation',
            'qwen-tool-output-offload-design',
            'qwen-read-many-files-source',
          ],
        },
        kimi: {
          entry:
            '模型调用 `Read`、`Write`、`Edit`；图片和视频使用 `ReadMediaFile`（文件大小上限 100 MB）。',
          primitives:
            '`Read` 按字符加估算 token 双额度返回，参数为必填的 `path` 与可选的 `line_offset`（起始行号，负数从末尾倒数）、`column_offset`（正向读取时起始行内从 0 开始的位置）、`n_lines`（请求读取的源文件行数，省略时向文件末尾读取）与 `max_chars`（结果的字符上限，包含行号与状态信息）；2.4.1 起默认上限和单次调用可申请的最大值都是 100,000 字符，单次调用还会在估算 token 数达到配置 `[read] max_chars` 的四分之一（默认约 25,000）时停止，token 折算为每个非 ASCII 字符计 1、每 4 个 ASCII 字符计 1 并向上取整，因此中文等非 ASCII 字符较多的文本每次返回的字符更少；字符数与列偏移按显示文本的 JavaScript 字符串长度计算（常见字母与汉字各计 1，许多 emoji 计 2），列偏移不含行号前缀。`Write` 支持 overwrite/append；`Edit` 支持唯一匹配或 `replace_all`。',
          behavior:
            'Read 默认放行，Write/Edit 默认需审批；Grep/Glob 会过滤敏感文件，写入缺失父目录时会自动创建。读取额度由 `[read]` 配置块控制，官方写明它「控制 `Read` 工具的字符额度，包含文件正文、行号和状态信息，不额外叠加行数或 UTF-8 字节数上限」，字段为 `default_max_chars`（integer，默认 `100000`，工具调用未指定 `max_chars` 时的额度）与 `max_chars`（integer，默认 `100000`，2.4.1 起由 `500000` 下调，单次调用可申请的最大额度）；两个值都必须是正整数，调用里的 `max_chars` 覆盖默认值但不会超过配置的最大值（超出时状态提示 “Requested max_chars=… was capped at the configured maximum …”），配置的默认值超过最大值时默认读取也按最大值执行；估算 token 上限只由配置的 `max_chars` 派生（源码 `tokenLimit = Math.ceil(limits.maxChars / 4)`，默认 25,000），调用参数 `max_chars` 不改变它；官方写明想让单次调用返回超过 100000 字符或约 25000 token 需要提高 `max_chars`，想让较大文档默认就一次返回、不用 Agent 主动申请更大额度再同时提高 `default_max_chars`。超额页面在组装时就地收缩而不重读文件：多行时逐行丢弃，单独一行放不下时按 token 权重切片段（ASCII 每字符 0.25、非 ASCII 每字符 1，不拆散代理对），纯 ASCII 文本因 token 折算向上取整通常触不到 token 上限、保持精确的字符分页。`Read` 优先返回完整行，官方逐字为「结果不会再被通用工具输出限制缩短」；除非一次就返回了整个文件且没有需要说明的情况，内容后附带 `<system>` 状态块，状态里给出列范围与 `Next Read` 参数因而不需要提高额度即可续读，不完整页面另附提示 “If the answer may be further on, continue with Next Read or find the section with Grep instead of answering from this page alone.”；调用指定了范围（带 `n_lines` 或负 `line_offset`）而 `max_chars` 之内放得下的行仍超过 token 上限（源码为状态预留 256 token）时，直接返回错误 “Lines X-Y are more than one Read can return (about N estimated tokens). Read at most M lines at a time, for example {…}, or find the section with Grep.” 而不是只返回其中一部分，只被 `max_chars` 截短的范围仍返回一页加 `Next Read`，整文件读取、从 offset 读到末尾、单行请求与列续读都照常分页；拼接同一行的片段时不要额外插入换行，一行只返回部分内容时仍计入剩余的 `n_lines` 范围直到行尾返回，非法列偏移明确报错而不跳过内容。尾读优先返回请求范围里较新的完整行，连一条完整行都放不下时给出未读范围的正向 `Next Read` 参数，`column_offset` 不能与负数 `line_offset` 同时使用；续读位置针对文件当前内容，文件变化后要重新读取，尾读若提示读取期间文件发生变化则基于更新后的文件重试。10 MiB 以内的 UTF-16 LE/BE 文件先尝试严格解码，失败后把损坏序列替换掉并返回可读文本、每一页都告警发生了有损解码，告警本身也计入字符额度。2.4.1 起 `Edit`/`Write` 成功的结果附带状态提示 “The change is applied; there is no need to Read the file back to check it.”，`Read` 的工具描述同步删掉了「任务需要大文件全文时在首次调用申请更大 `max_chars`」一句并新增 “After a successful `Edit`/`Write`, do not re-read solely to prove the write landed.”。v2 引擎的 staleGuard 在工具执行前拦截 Edit/Write：修改已有文件要求本 Agent 此前成功执行过 `Read`（`Read`/`Edit`/`Write` 成功后记录文件 mtimeMs，失败不记录），当前磁盘 mtime 与记录不一致即拒绝；同一批工具调用中已有对同一路径的 `Read` 时放行；新建文件不受影响。拒绝时分别提示 "has not been read by this agent yet" 或 "has been modified on disk since this agent last read it"，要求先（重新）读取；Agent 运行时变化会清空记录。',
          scope:
            '相对路径基于当前工作目录；权限模式和工具策略继续限制路径与写入。',
          background:
            '文件调用同步完成；后台 Agent 使用独立上下文，但默认仍操作被分配的同一工作目录。',
          integration:
            'TUI、Web 与 VS Code Surface 可渲染文件修改和工具调用；Hooks 走统一工具执行链。',
          artifacts:
            '写入直接落盘；会话日志记录工具事件，但不会自动把修改变成 Git 提交。',
          conditions:
            'Plan 模式下 Write/Edit 只允许写计划文件；跳过普通审批的模式在 2.1.1 官方工具文档里称为 “Ask When Needed”（0.38.0 时同一句写作 YOLO），它不改变文件系统权限。官方工具文档未列换行保留或规范化配置；`Write` 的 append 模式不自动补换行。读取额度已经历三代官方记法：0.38.0 写「单次最多返回 1000 行或 100 KB，超出部分会附带截断提示」且参数只有 `path`/`line_offset`/`n_lines` 三个；2.1.1 起改为字符额度记法（默认 100,000、单次可申请到 500,000，参数扩到含 `column_offset` 与 `max_chars` 的五个）；2.4.1（2026-10-30T09:50:16Z 发布，标签提交 `2c73f3f50af4fa7f2540ca0d2e33b07a1408e3a7`）经 PR #4553（合并提交 `9140ea0d980fc27c5c5ff983b2efe82191eb2b4a`，GitHub compare 确认是标签祖先）把单次可申请上限从 500,000 降到 100,000 并叠加估算 token 上限，**据此作废旧结论「单次可申请到 500,000 字符」**；changeset 与 Release 正文逐字相同（“A single file read by the agent now returns at most 100,000 characters or about 25,000 tokens, whichever comes first, instead of up to 500,000 characters; set `max_chars` under `[read]` in config.toml to raise both limits again.”），官方中英文四份文档在同一提交同步，不存在文档滞后。发布状态与 main 的关系：标签下 `read.ts`（2,308 字节，`DEFAULT_MAX_CHARS = 100_000`、`DEFAULT_MAX_CHARS_LIMIT = 100_000`）与 main `a2afdbc7d1fa` 逐字节相同，tools.md 的 `Read` 段与 config-files.md 的 `## read` 段在两个坐标逐字相同（main 与标签的该两页差异只在 Agent/AgentSwarm/网络工具等无关段落），token 上限逻辑（`tokenLimit`、`cutForTokens`、`rangeTooLarge`、`RANGE_STATUS_TOKENS = 256`）在 main 的 `readTool.ts` 里同样存在。staleGuard 此前记为「main 分支、尚未发布、官方工具文档尚未同步」，而 2.1.1 的中文工具文档已在 `Write` 与 `Edit` 段各写明目标文件必须在本会话先用 `Read` 读过、文件自上次读取后在磁盘上变化即拒绝、新建文件不受限，2.4.1 标签下同一页逐字未变，因此该行为属官方文档记录的已发布能力，实现细节（mtimeMs 记录、同批放行、拒绝文案、Agent 运行时变化清空）仍取自 2026-08-19 合入 main 的提交 `67fbcdf1ba7d`（PR #3096）；`[read]` 配置块在 2.1.1、2.4.1 标签与 main 的中文配置文档里都存在。2026-11-28 把写前读一侧的坐标从 2.4.1 前移到 2.8.1 标签提交 `62402f173c5a838a1c1f8fa263b637a22486fa39`（标签对象 `5eb17ca75b4698b8ee41871262d34481b6db6fdb`、打标签时间 2026-11-26T11:47:26Z，Release 2026-11-26T11:47:27Z 发布）：该坐标下 `docs/zh/reference/tools.md` 为 23,180 字节，`Write` 段的 “写入已存在的文件（无论 `overwrite` 还是 `append` 模式）要求本会话中先用 `Read` 读过该文件——若文件自上次读取后在磁盘上发生变化，写入会被拒绝；新建文件不受此限。” 与 `Edit` 段的 “目标文件必须在本会话中先用 `Read` 读过；若文件自读取后在磁盘上发生变化，编辑会被拒绝。” 两段与 main `68d73d06710342af0baa6ad7a30fb00385eda424`（2026-11-28T00:10:37Z，同一文件 23,312 字节）逐字相同，两个坐标整页唯一的差异是 `AgentSwarm` 段在 main 上多出 “或将 `KIMI_CODE_SWARM` 环境变量设为真值使新建会话默认进入 swarm mode” 一句，与本字段无关。2.8.1 Release 只有三条修复（取消 Gemini 与 Vertex AI 请求时立即关闭连接、取消时保留 token 用量、修复工具变化或会话恢复导致的 `unloaded_tool` 错误），没有任何写前读或过期写入条目，因此 Kimi Code 仍然是五家里唯一对漂移写入一律拒绝、没有自动恢复例外的产品；读取额度一侧的证据坐标仍停在 2.4.1，本次未前移。',
          status: '官方确认',
          sources: [
            'kimi-read-tools-241',
            'kimi-read-config-241',
            'kimi-v241-read-cap-release',
            'kimi-read-cap-commit',
            'kimi-tools-281-prior-read',
            'kimi-read-tools-211',
            'kimi-read-config-211',
            'kimi-read-tools-038',
            'kimi-config-current',
            'kimi-stale-guard-commit',
            'kimi-stale-guard-service',
            'kimi-stale-guard-changeset',
            'kimi-stale-guard-config',
          ],
        },
        qoder: {
          entry:
            '模型调用 `Read`、`Edit`、`Write` 与 `NotebookEdit`；SDK 可通过 `tools`、`allowedTools`、`disallowedTools` 控制暴露。',
          primitives:
            '内置工具覆盖文本读取、局部编辑、整文件写入和 Notebook 编辑，工具输入输出在 SDK Reference 中有类型定义。官方 Tools 页只用能力表描述读取：「View files」对应 “Read source files, documentation, configuration, and other text assets.”、「Read large files」对应 “Read a focused section when the whole file is too large.”、「Read document-like assets」对应 “Inspect supported document formats, such as PDFs, when available.”；「Edit Files」表另有 “Edit notebooks | Modify notebook content when notebook support is available.”。1.1.100 起 PDF 读取改由内置插件承担，更新日志逐字为 “Added a built-in PDF reading plugin so you can read PDF text and images without installing a third-party environment”，但 Built-ins 页（15,247 字节）、Plugins Reference 页（11,410 字节）与设置参考（34,119 字节）对 `pdf` 的命中数均为 0，插件名、安装形态、能否禁用与页数或字节上限都没有公布，Tools 页 “when available” 是否就指该插件也未确认。',
          behavior:
            'Edit 权限规则同时覆盖 Edit、Write 和 NotebookEdit；Read 与 Edit 可按路径模式细分 Allow、Ask、Deny。读取超限的官方说法只有「文件过大时读取聚焦片段」，即由模型改用带范围的读取而不是提高额度。写前读一侧自 1.1.100（November 27, 2026）起取消：更新日志逐字为 “Improved Edit logic so it no longer requires reading a file with Read before editing”，即 `Edit` 不再要求本会话先用 `Read` 读过目标文件；这条也是官方一手资料第一次承认此前存在该要求——Tools 页在此前和之后的核对日期都没有写过写前读，因此旧记录只能写成「官方工具文档未列同类写前读强制要求」。**未确认**：1.1.100 之前该要求的具体判据（是否按会话记账、是否只针对已存在文件、新建文件是否豁免）、取消后是否还保留任何磁盘漂移检查、以及 `Write`/`NotebookEdit` 是否同步取消，官方都没有说明，changelog 只提到 Edit。非文本读取同版扩了一项：更新日志逐字为 “Added a built-in PDF reading plugin so you can read PDF text and images without installing a third-party environment”，即 PDF 的文本与图片不再依赖第三方环境。',
          scope:
            '当前 workspace 是主要目录；`--add-dir`、`/add-dir` 或 `permissions.additionalDirectories` 可增加可信目录。',
          background:
            '文件工具本身同步返回；Subagent、Worktree Job 或 Cloud task 可并行运行。',
          integration:
            'TUI、Headless、ACP 和 Agent SDK 共用内置工具集合，但每个入口可进一步过滤工具。',
          artifacts:
            '修改写入当前 workspace 或所选 Worktree；是否进入提交由后续 Git 操作决定。',
          conditions:
            '权限规则、Subagent `tools`/`disallowedTools` 和 SDK query options 都可能缩小可用集合。官方内置工具文档未列换行保留或规范化配置；写前读与过期写入保护也从未出现在文档站任何一页，1.1.100 之前只能记为「官方工具文档未列同类写前读强制要求」，1.1.100 起则由更新日志的取消条目反推出此前确实存在该要求（见下）。读取额度同样没有公开数值：Tools 页、SDK tools 页与 SDK References 页在核对日期都没有给出 `Read` 的参数表、最大行数、最大文件字节数或字符上限，也没有类似 `allow_large`、`max_chars`、`max_output_tokens` 的每次调用放大入口，SDK References 页只列出 `tool()`、`@tool()`、`createSdkMcpServer()`、`create_sdk_mcp_server()`、`canUseTool`、`can_use_tool` 与 `toolConfig` 并写明内置工具行为另见 Tools 页；2026-11-01 复核 Release Notes `.md`（116,148 字节，最新条目推进到 CLI 1.1.81、October 29, 2026），1.1.70 至 1.1.81 没有任何文件读取上限、大文件或截断条目——1.1.81 唯一与上限相关的 “Fixed request failures in long sessions caused by accumulated images exceeding the limit, keeping at most the 50 most recent images per request” 讲的是长会话请求里累积图片的保留数量、不是 `Read` 工具的读取额度；Tools 页 `.md`（9,127 字节）的 “Read large files | Read a focused section when the whole file is too large.” 逐字未变。因此该项的具体数值仍记为未确认，只记录官方给出的「过大时读聚焦片段」这一行为边界。2026-11-28 复核写前读与 PDF 两项：**坐标与文档缺口**——本次以 `https://changelog.qoder.com/cli.md`（151,350 字节）为准，最新条目 `CLI 1.1.100`／November 27, 2026、小节 “Direct file editing and reliability improvements for sessions and Windows”，HTML 入口同日 863,063 字节、去标签后 1,816 行；而 `https://docs.qoder.com/release-notes/qoder-cli.md`（同日 116,633 字节）最新条目仍停在 `CLI 1.1.82`／November 3, 2026，落后 changelog 站 18 个版本，此前几轮记录用的正是这个滞后的文档站页面，因此 1.1.83 至 1.1.100 之间的条目只能从 changelog 站取。**Tools 页未同步**——`https://docs.qoder.com/cli/tools.md` 同日仍为 9,127 字节、与 2026-11-01 复核时字节数相同，“Edit Files” 三行与其后 “File edits pass through the permission system. Depending on the permission mode and rules, Qoder CLI may apply the change directly, ask for confirmation, or block the action.” 一句逐字未变，全页对 “before edit”、“read first” 一类写前读表述的命中数为 0，即取消读后再改这件事在文档站没有任何对应文字，只有更新日志一处一手来源。**PDF 插件同样只在更新日志**——Built-ins、Plugins Reference 与设置参考三页对 `pdf` 命中均为 0。**未确认项**：1.1.100 之前写前读要求的判据、取消后是否仍有磁盘漂移检查、`Write` 与 `NotebookEdit` 是否一并取消、内置 PDF 阅读插件的名称与入口、它是否出现在 `/plugins` 列表里、能否禁用、支持格式与页数或字节上限，官方都没有公布。同小节其余条目属其他字段：`QODER_FEATURE_WORKFLOWS_DISABLE` 环境变量属 Workflows 开关、“Improved the prompt for automatically denied permissions in Headless mode” 属非交互审批、“Fixed incorrect context usage when using a custom model” 属上下文占用、“Improved read efficiency when resuming large sessions and reduced memory usage” 属会话恢复，本次未处理。上一条 `CLI 1.1.99`／November 26, 2026（小节 “Skill Management and BYOK Improvements”）八条里没有文件读写条目。',
          sources: [
            'qoder-tools',
            'qoder-tools-read-context',
            'qoder-tools-20261128',
            'qoder-changelog-11100-edit-prior-read',
            'qoder-pdf-plugin-undocumented-20261128',
            'qoder-release-notes-read',
            'qoder-permissions',
            'qoder-sdk-reference',
          ],
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
        '资源约束方面，Claude Code 自 v2.1.233 起在 Linux 上提供 Bash 命令内存 cgroup 限制（`CLAUDE_CODE_TOOL_MEMORY_LIMIT`）；其余四家的官方 Shell 或沙箱文档当前只列超时、审批与文件/网络边界，未提供同类内置内存限制配置。',
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
            '默认需要审批；Sandbox、Managed settings 和 deny 规则可能限制文件、网络或命令。Linux 上可对 Bash 命令启用可选的内存 cgroup 限制（`CLAUDE_CODE_TOOL_MEMORY_LIMIT`，v2.1.233 引入），官方更新日志给出的用途是防止失控构建占满内存拖住会话；官方环境变量文档尚未列出该变量。',
          sources: [
            'claude-tools',
            'claude-commands',
            'claude-sandboxing',
            'claude-bash-memory-limit',
          ],
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
            'Read Only 等预设会阻止写入型命令；网络和目录访问由沙箱配置决定。官方配置参考未提供 Shell 内存或 CPU 资源限制项，只有超时类设置（如后台终端轮询窗口 `background_terminal_max_timeout`，默认 300000 毫秒）。',
          sources: [
            'codex-docs',
            'codex-commands',
            'codex-approvals',
            'codex-config-reference',
          ],
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
            '裸 `&` 不作为受管后台机制；交互命令可能需要 TTY；后台 Git commit 被明确拒绝。官方 Sandbox 文档未列 Shell 内存或 CPU 限制项；容器型沙箱可用 `SANDBOX_FLAGS` 向 `docker`/`podman` 命令注入自定义参数（如资源类 flag），属于用户自配而非内置限额。',
          sources: [
            'qwen-shell-current',
            'qwen-session-commands',
            'qwen-worktree-current',
            'qwen-sandbox',
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
            'stdin 始终关闭，交互式命令会收到 EOF；Bash 默认需要审批。官方配置文档未列 Shell 内存或资源限制项，长命令只由超时控制（前台超时后可经 `bash_auto_background_on_timeout` 转后台，后台默认超时 `bash_task_timeout_s`）。',
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
            '工具可能被权限规则、Subagent 配置或 SDK `tools` 过滤；非交互运行需要合适认证。官方权限与 Sandbox 文档未列 Shell 内存或资源限制项，Sandbox 隔离能力只覆盖文件系统、网络和命令执行安全检查。',
          sources: [
            'qoder-using-cli',
            'qoder-tools',
            'qoder-permissions',
            'qoder-sandbox',
          ],
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
        'Qwen Code 自 v0.22.0 起 `list_directory` 默认不注册，官方理由是 `glob` 已覆盖大多数目录列表场景；启用需 `tools.listDirectory.enabled` 或在 `coreTools` 白名单中显式列出，目录列表改用 `glob` 完成。',
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
            '`glob` 找文件，`grep_search` 搜文本，实验 LSP 提供符号导航；`list_directory` 自 v0.22.0 起默认不注册，启用后可浏览目录。',
          primitives:
            'Grep 基于 ripgrep；工具注册表还提供 LSP、Read 等组合探索能力。`list_directory`（显示名 `ListFiles`）的注册由 `isLsToolEnabled` 门控，只在启用时注册工厂。',
          behavior:
            '只读搜索通常自动允许；结果有数量和上下文限制，模型再按需 read_file。`list_directory` 关闭时不进入模型可见的工具清单；模型仍调用该名称时返回“内置工具默认关闭、用 `tools.listDirectory.enabled` 启用、改用 `glob`”的错误文本，别名调用解析到同一说明。',
          scope:
            '搜索当前 workspace 和已加入目录；Worktree 激活后搜索隔离目录。',
          background:
            '单次工具同步返回；Explore/自定义 Agent 可并行搜索不同区域。',
          integration:
            'LSP 通过实验开关注册；Tool Search 可延迟发现扩展工具。内置 Agent 与计划模式提示在 `list_directory` 默认关闭后改用 `glob`/`read_file` 探索。',
          artifacts:
            '结果进入上下文，不写文件。',
          conditions:
            'LSP 只有启用 `--experimental-lsp` 时注册；Git ignore 与工具参数会影响命中。`list_directory` 自 v0.22.0（PR #9424，2026-08-21 合并）起默认关闭：设置 `tools.listDirectory.enabled` 为 `true`（需重启）启用，或在 `coreTools` 白名单（`--core-tools` / `tools.core`）显式列出 `list_directory` 也会自动启用，白名单按权限规则解析，别名 `ListFiles` 与 `list_directory(/src)` 等带路径限定形式同样匹配；已存在且不含该条目的 `coreTools` 白名单在注册表层面继续禁用它。`tools.core` 在设置文档中标记弃用并在首次加载时迁移为 `permissions` 规则。',
          sources: [
            'qwen-tools-current',
            'qwen-session-commands',
            'qwen-v022-release',
            'qwen-list-directory-commit',
            'qwen-list-directory-settings',
            'qwen-list-directory-tools-doc',
            'qwen-list-directory-registration',
          ],
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
        'Kimi Code 0.38.0 起提供 `WaitFor` 工具：模型在当前回合内挂起等待后台任务（子 Agent、后台 Bash、后台提问）结束，而不是结束回合等待重新调用；其余四家当前一手资料未列出同类专门的回合内等待工具。',
        'Kimi Code `WaitFor` 的 `timeout` 上限由 600 秒收紧为 90 秒、并让新输入（终端 `Enter`/`Ctrl-S` steer 或等待前已排队消息）立即结束等待，这两项已随 2.2.0（2026-10-14T15:31:16Z）正式发布：2.1.1 的工具文档逐字写“上限 600”，2.2.0 与 2.7.2 逐字写“上限 90”，GitHub compare 显示 PR #4061 的提交 `20a2cea72f5d` 到 2.2.0 标签为 `behind_by: 0`。本仓库此前记录的“main 分支（尚未发布）”已作废。',
        '后台命令的墙钟上限只有三家给出数字：Claude Code 在无人值守会话里默认 30 分钟、上限 2 小时，Kimi Code 后台 Bash 默认 600 秒、硬上限 86400 秒（24 小时），Qoder CLI 自 1.1.94 起默认 10 分钟；Codex 与 Qwen Code 的后台命令都没有存活时限，Codex 的 `background_terminal_max_timeout` 只是空 `write_stdin` 轮询窗口上限，Qwen 的 `tools.shell.defaultTimeoutMs` 官方明确只管前台。',
        '「只在无人值守时设上限」目前只有 Claude Code 写进官方文档：交互终端、桌面端与 VS Code 会话的后台命令没有时限，`-p`、Agent SDK、CI 与云会话才有，且 `-p` 以文本（而非 `--input-format stream-json`）传提示词时两个默认都降为 10 分钟。Kimi Code 的方向相反——print 模式把 `bash_task_timeout_s`、`[subagent] timeout_ms` 与 `[swarm] timeout_ms` 的默认值都注入为 `0`（无超时）。Qoder CLI 与 Qwen Code 没有区分交互与非交互的公开口径。',
        '600 秒是三家共同的落点：Claude Code 的 `-p` 文本提示词运行、Kimi Code 的后台 Bash 默认（`DEFAULT_BACKGROUND_TIMEOUT_S = 10 * 60`）与 Qoder CLI 1.1.94 的新默认都是 10 分钟；但只有 Kimi Code 同时公开了硬上限（`MAX_BACKGROUND_TIMEOUT_S = 24 * 60 * 60`）与两种关闭方式（`bash_task_timeout_s = 0` 或按调用的 `disable_timeout`）。',
        '可调性分层差异明显：Claude Code 只能用 `BASH_DEFAULT_TIMEOUT_MS`（高于 1800000 才替换 30 分钟默认）与 `BASH_MAX_TIMEOUT_MS`（高于 7200000 才抬高 2 小时上限）向上抬，官方逐字写两者都不能缩短；Kimi Code 有配置键、五个 `KIMI_CODE_BACKGROUND_*` 环境变量与按调用的 `disable_timeout` 三层；Qwen Code 只有前台侧的每次调用 `timeout` 与 `tools.shell.defaultTimeoutMs`；Codex 只有轮询窗口键；Qoder CLI 未给出任何键。',
        '后台任务的数量上限只有 Codex 与 Qwen Code 给了源码常量：Codex `MAX_UNIFIED_EXEC_PROCESSES = 64`，超出按 LRU 淘汰、最近使用的 8 个受保护、持有 interaction lock 的候选被跳过、被淘进程执行 `terminate()`；Qwen Code `MAX_RETAINED_TERMINAL_SHELLS = 32` 只淘汰已终态条目的记录。Kimi Code 的 `max_running_tasks` 自 2.6.0 起从配置文档消失、agent-core-v2 的 `AgentTaskConfigSchema` 也没有该字段，只有 node-sdk 的 `BackgroundConfigSchema` 仍声明 `maxRunningTasks`，两处不一致。',
        'Claude Code 的 `Monitor` 观察自 v2.1.271 起一律有截止期（默认 5 分钟、最长 30 分钟、单提示词 `-p` 最长 10 分钟），到点结束并给 Claude 一条通知以便重新布防，取代了此前无超时的 `persistent` 选项；`TaskOutput` 已在 v2.1.277 移除，改为用 `Read` 读后台任务的输出文件，而 Kimi Code 与 Qoder CLI 仍提供名为 `TaskOutput` 的工具。',
      ],
      products: {
        claude: {
          entry:
            '`/background [prompt]` 把整个当前会话分离成后台 Agent；`/tasks` 查看当前会话的后台工作；模型也可启动后台 Bash/Agent。',
          primitives:
            '`TaskList`、`TaskStop` 与 `Monitor`；`TaskOutput` 已在 v2.1.277 移除（官方工具表逐字为 “Removed in v2.1.277. Previously retrieved output from a background task; Claude reads a background task\'s output file with `Read` instead”），完整输出改从任务输出文件用 `Read` 读取；`TaskStop` 除任务 ID 外也接受 agent-team teammate 或具名后台 Agent 的 ID/名称，找不到匹配时错误信息会列出运行中的后台 Agent（含别的 Agent 派生的）。',
          behavior:
            '分离后的会话释放当前终端，可用 `claude agents` 观察；普通后台任务完成后状态回到会话。Monitor 可在日志、PR 或 CI 变化时主动插入事件。后台命令到达时限时被停止并告知模型原因，停止通知逐字为 `Background command "<description>" was stopped after reaching its background time limit`，模型可以用更长的 `timeout` 重新启动。前台命令超时不会被杀掉而是转入后台（`sleep` 开头的除外），结果逐字为 `Command did not complete within its 120s timeout and was moved to the background` 加任务 ID 与输出文件路径；被转后台命令里的 `cd`/`pushd`/`popd`/`chdir` 一律不带回，结果另附 `Session cwd remains <dir>; directory changes made by the backgrounded command do not apply to subsequent commands.`。命令输出累计超过 5 GB 会被杀掉。',
          scope:
            '绑定当前会话和宿主环境；恢复会话时普通进程能否继续取决于进程生命周期。前台 Subagent 启动的后台命令随该 Subagent 运行结束（完成、失败或被打断）而停止；主对话或后台 Subagent 启动的命令在最终回复后继续运行，直到自行退出、被停止或到达时限。',
          background:
            'Bash、Subagent 和 Monitor 都可后台运行；Agent frontmatter 也可声明 `background: true`。后台 Bash/PowerShell 时限只在无人值守会话（`-p`、Agent SDK 应用、CI 作业、云会话）生效，从命令进入后台那一刻起算：模型直接后台启动的命令得 30 分钟，或它随 `run_in_background` 传的 `timeout`，上限 2 小时；前台超时转入后台的命令从转入时刻起得 30 分钟。`-p` 以文本（而非 `--input-format stream-json`）传提示词时，两个默认都是 10 分钟而不是 30 分钟。前台侧默认 2 分钟（`BASH_DEFAULT_TIMEOUT_MS` = 120000）、模型可请求的上限默认 10 分钟（`BASH_MAX_TIMEOUT_MS` = 600000），生效上限取两者较大值。Monitor 观察一律有截止期：默认 5 分钟、最长 30 分钟、单提示词 `-p` 运行最长 10 分钟，到点结束并给模型一条通知以便重新布防；`timeout_ms` 同样约束 WebSocket 观察，`TaskStop` 可提前取消。',
          integration:
            '任务面板、状态栏和权限规则共用；Monitor 复用 Bash allow/deny，auto mode 下会搁置点名 `Monitor` 自身的 allow 规则而交给 classifier 审查。',
          artifacts:
            '任务状态与输出文件可供后续 Read；进程产生的文件保留在工作区。',
          conditions:
            '时限需 v2.1.285 及以上，且 v2.1.288 之前对所有会话生效、v2.1.288 起才收窄为只在无人值守会话生效；从终端、桌面端或 VS Code 扩展操作的本地会话对后台命令没有任何时限。抬高时限只能向上：`BASH_DEFAULT_TIMEOUT_MS` 高于 1800000 才替换 30 分钟默认（`-p` 文本运行时高于 600000 即替换其 10 分钟默认），`BASH_MAX_TIMEOUT_MS` 高于 7200000 才抬高 2 小时上限，把 `BASH_DEFAULT_TIMEOUT_MS` 设到 7200000 以上同样抬高上限，官方逐字写 “neither can shorten a limit: a lower value leaves the defaults and the 2-hour maximum in place”。`CLAUDE_CODE_DISABLE_BACKGROUND_TASKS=1` 或 bare mode 关闭自动转后台，此时前台命令超时即停止；该变量为 `1` 还会从 Bash、PowerShell 与 subagent 工具上摘掉 `run_in_background` 参数并关掉 `Ctrl+B`，但 MCP tasks 与 Monitor 仍在后台运行。`CLAUDE_SUBAGENT_BG_SHELL_MAX_MS` 已在 v2.1.260 移除并成为空操作（此前以 60 分钟默认限制 Subagent 启动的后台 Shell），同版更新日志逐字为 “Removed the one-hour time limit on background commands started by subagents; they now run until they exit or are stopped, matching the main session”。`CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS`（默认 600000，`0` 表示无限等待，需 v2.1.182 及以上）管的是 `-p` 最后一轮之后主进程空等后台工作的上限，不是任务自身存活时间，且主对话启动的后台命令会把运行撑过该上限。Monitor 在 Amazon Bedrock、Claude Platform on AWS、Google Cloud\'s Agent Platform 或 Microsoft Foundry 上，或设置了 `DISABLE_TELEMETRY`／`CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` 时需要 v2.1.310 及以上，Windows 上只在装了 Git Bash 时可用。',
          sources: [
            'claude-tools',
            'claude-commands',
            'claude-bg-command-time-limit',
            'claude-monitor-deadline',
            'claude-bg-time-limit-changelog',
            'claude-env-vars-bg-shell-timeout',
          ],
        },
        codex: {
          entry:
            '`/ps` 显示后台终端及近期输出，`/stop` 停止当前会话的全部后台终端（`/clean` 仍是别名）。',
          primitives:
            '统一 PTY 执行通道（`features.unified_exec`，官方配置参考逐字为 “Use resumable command execution (stable; enabled on all platforms). User opt-outs are ignored.”）保留长进程；`write_stdin` 既是继续既有命令的通道也是后台轮询通道，源码注释逐字为 “Empty writes are background polls, and non-empty writes continue a command that already ran PreToolUse as Bash, so do not emit a second pre hook here.”。命令管理入口面向终端进程而不是独立任务数据库。',
          behavior:
            'Agent 可以在长命令运行时继续处理其他工作，并从终端输出检查进度。`/ps` 逐字给出 “Codex shows each background terminal\'s command plus up to three recent, non-empty output lines so you can gauge progress at a glance.”；`/stop` 逐字为 “Codex stops all background terminals for the current session.”。后台终端没有存活时限：`write_stdin` 的等待窗口按输入是否为空分两条钳制路径，空轮询走 `time_ms.clamp(MIN_EMPTY_YIELD_TIME_MS, self.max_write_stdin_yield_time_ms)`（5000 毫秒到配置值，默认 300000 毫秒），非空写入走 `time_ms.min(MAX_YIELD_TIME_MS)`（30000 毫秒），`yield_time_ms` 未传时默认 250 毫秒，随后 `let deadline = start + Duration::from_millis(yield_time_ms);` 只约束这一次调用。',
          scope:
            '后台终端属于当前本地线程和工作目录；Cloud task 是另一种远端异步 Surface。进程条目记 `environment_id`，多执行器环境下同名终端按环境分开。',
          background:
            '支持多个后台终端；`/stop` 是全停，不是按任务 ID 选择停止。数量上有软上限 `MAX_UNIFIED_EXEC_PROCESSES = 64`：达到上限时 `prune_processes_if_needed()` 先把按 `last_used` 倒序的最近 8 个进程放进受保护集合，再在 LRU 序里优先挑已退出且不受保护的进程、找不到才挑最久未用且不受保护的进程；持有 interaction lock（`write_stdin` 或终态事件发布进行中）的候选被跳过，源码注释逐字为 “Do not prune processes while write_stdin or terminal event publication holds their interaction lock.” 与 “The store may temporarily exceed its soft cap while an exited process is publishing its terminal event.”；被挑中的条目在注销网络审批后执行 `terminate()`。相关常量还有 `MIN_YIELD_TIME_MS = 250`、`WINDOWS_INITIAL_EXEC_YIELD_TIME_FLOOR_MS = 10_000`（Windows 上先抬到 10 秒再钳制）、`DEFAULT_MAX_OUTPUT_TOKENS = 10_000` 与 `UNIFIED_EXEC_OUTPUT_MAX_BYTES = 1 MiB`。',
          integration:
            '桌面 App 与 CLI 都可显示终端活动，但命令集合可能不同。',
          artifacts:
            '近期输出可从 `/ps` 查看；进程产生的文件留在当前工作区。单次输出上限 1 MiB（`UNIFIED_EXEC_OUTPUT_MAX_TOKENS = UNIFIED_EXEC_OUTPUT_MAX_BYTES / 4`）。',
          conditions:
            '公开命令表没有与 Claude/Qwen/Kimi 相同的 TaskOutput 或后台 Agent 任务面板语义。`background_terminal_max_timeout` 常被误读成后台终端的存活上限，官方配置参考逐字写它是 “Maximum poll window in milliseconds for empty `write_stdin` polls (background terminal polling). Default: `300000` (5 minutes). Replaces the older `background_terminal_timeout` key.”，只影响空轮询；全页含 timeout 的键只有 `mcp_servers.<id>.startup_timeout_sec`／`startup_timeout_ms`／`tool_timeout_sec`、`model_providers.<id>.stream_idle_timeout_ms`、`model_providers.<id>.auth.timeout_ms` 与它自己六个，没有任何给后台终端设总时长的键。后台终端只在 `unified_exec` 启用时出现，官方逐字为 “Background terminals appear when `unified_exec` is in use; otherwise, the list may be empty.”；托管要求（Managed requirements）可以禁用 resumable 进程与 `write_stdin`，只留一次性的 `exec_command`，此时没有后台终端。64 的软上限与 8 个受保护进程都只见于源码，官方文档未记录；被淘进程 `terminate()` 后其输出是否仍可读官方也未说明，记为未确认。',
          sources: [
            'codex-commands',
            'codex-docs',
            'codex-ps-stop-docs-20261122',
            'codex-bg-terminal-max-timeout-config',
            'codex-unified-exec-constants',
            'codex-unified-exec-prune-policy',
            'codex-write-stdin-yield-default',
          ],
        },
        qwen: {
          entry:
            'Shell 参数 `is_background: true`、TUI 运行中 `Ctrl+B`、Agent `run_in_background: true`；`/tasks` 查看。`is_background` 的官方 schema 描述逐字为 “Optional: Whether to run the command in background. If not specified, defaults to false (foreground execution). Explicitly set to true for long-running processes like development servers, watchers, or daemons that should continue running without blocking further commands.”',
          primitives:
            '`task_list`、`task_stop`、后台 Shell Registry、后台 Agent Registry 与 `monitor`。后台 Shell Registry（`packages/core/src/services/backgroundShellRegistry.ts`，v0.28.4 下 24,681 字节）只有条数与输出上限常量，没有超时常量。',
          behavior:
            '后台启动立即返回 ID；完成时发送通知。前台 Shell 可无重启地转入同一任务管理路径（promote 路径的取消 SIGKILL 等待为 `PROMOTE_CANCEL_SIGKILL_TIMEOUT_MS = 200`，输出流 flush 等待为 `OUTPUT_FLUSH_TIMEOUT_MS = 10_000`）。前台命令在剩余时间不足 `FOREGROUND_TIMEOUT_WARNING_LEAD_MS = 15_000` 毫秒时追加提醒，逐字为 “Warning: this command is about to time out. In the interactive TUI, press Ctrl+B to keep it running in the background.”；长任务劝告阈值按源码注释 “Long-run advisory threshold: half the EFFECTIVE foreground timeout” 取生效前台超时的一半、下限 `MIN_LONG_RUN_THRESHOLD_MS = 1000` 毫秒，因此把 `timeout` 设成 600000 的用户在 5 分钟处看到劝告。',
          scope:
            '任务绑定当前会话和 workspace；新建/清空会话前必须处理仍在运行的后台工作。',
          background:
            'Shell、Agent、Fork 与 Monitor 可并行；并发上限和 Agent 类型规则继续生效。**后台 Shell 没有墙钟超时**：`execute()` 在计算生效超时之前就有 `if (this.params.is_background) { return this.executeBackground(signal, shellExecutionConfig); }`，`executeBackground()` 内不做任何计时，只拒绝 `git commit` 并剥掉单个结尾裸 `&`。前台超时优先级带源码注释逐字为 “Precedence: an explicit per-call `timeout` wins; otherwise fall back to the configured `tools.shell.defaultTimeoutMs` setting; otherwise the built-in default. A value of 0 disables the timeout, but only at the settings/default level — the per-call `timeout` param is validated to be > 0 by `validateToolParamValues`, so 0 never arrives that way.”，实现为 `this.params.timeout ?? this.config.getShellDefaultTimeoutMs() ?? DEFAULT_FOREGROUND_TIMEOUT_MS`（120000 毫秒）；schema 里 `timeout` 的取值范围是 `minimum: 1, maximum: 600000`。顶层具名 Subagent 的后台默认由 `agents.defaultBackground` 控制，默认 `true`。',
          integration:
            'Footer pill、任务对话框和 `/tasks` 展示 Shell 与 Agent；日志可继续读取。',
          artifacts:
            '后台输出持久到项目临时任务目录，任务结束后仍可检查；工作区修改直接保留。已终态的后台 Shell 记录最多保留 `MAX_RETAINED_TERMINAL_SHELLS = 32` 条，超出按 `while (terminalEntries.length > MAX_RETAINED_TERMINAL_SHELLS)` 淘汰；完成通知里的输出尾巴最多 `MAX_NOTIFICATION_OUTPUT_TAIL_BYTES = 8192` 字节，送给模型的命令文本最多 `MAX_NOTIFICATION_MODEL_COMMAND_LENGTH = 500` 字符。',
          conditions:
            '后台 Shell 禁止 `git commit`，逐字拒绝文本为 “Refusing to run `git commit` in background mode: AI-attribution notes are written by the foreground completion path. Re-run the commit with is_background=false (or split it out of the compound command).”；裸 `&` 会被受管后台路径剥掉，源码注释逐字为 “The managed path is itself the backgrounding mechanism, so the trailing `&` is redundant.”，并说明只剥单个结尾裸 `&`、不动 `&&` 与转义的 `\\&`。官方设置参考把 `tools.shell.defaultTimeoutMs` 限定为 “Default timeout, in milliseconds, for foreground shell commands started by the agent.”，全页 `tools.` 前缀的 29 个键里没有任何后台 Shell 超时或后台任务时长键，`agents.` 前缀的 6 个键也只有 `agents.defaultBackground` 与前后台相关；因此后台 Shell 是否会在某个未公开的路径上被回收、以及 `MAX_RETAINED_TERMINAL_SHELLS` 淘汰的是记录还是进程，官方文档都没有说明，记为未确认。另有 `MAX_INTENTIONAL_SLEEP_SECONDS = 10 * 60` 用于识别模型显式 `sleep`，与后台超时无关。',
          sources: [
            'qwen-shell-current',
            'qwen-session-commands',
            'qwen-shell-timeout-v0284',
            'qwen-bg-shell-registry-v0284',
            'qwen-settings-shell-timeout-v0284',
          ],
        },
        kimi: {
          entry:
            '`Bash.run_in_background`、`Agent.run_in_background` 或后台 AskUserQuestion；`/tasks` 打开任务浏览器。0.38.0 起新增 `WaitFor` 工具，模型可在当前回合内等待后台任务结束。条件：0.35.0 起 `/tasks` 预览窗格实时显示后台 Agent（`run_in_background` 或 `Ctrl+B` 启动）的活动，Enter/O 打开全屏活动详情，Ctrl+O 展开或收起。',
          primitives:
            '`TaskList`、`TaskOutput`、`TaskStop`、`WaitFor`；Bash/Agent/问题任务共用任务服务。`TaskOutput` 始终非阻塞，立即返回当前快照，任务完成经自动通知送达。`WaitFor` 参数：`timeout`（必填，单位秒；0.38.0 至 2.1.1 上限 600，自 **2.2.0**（2026-10-14T15:31:16Z）起为 90，2.7.2 工具文档逐字写 “参数：`timeout`（必填，单位秒，上限 90）”；收紧来自提交 `20a2cea72f5d`（PR #4061），源码为 `WAIT_FOR_MAX_TIMEOUT_S = 90`、schema 以 `.max(90)` 拒绝更长取值，描述文本改为 `1-90` 并要求按任务预期耗时选取而非直接填上限）与可选 `task_id`；不传 `task_id` 时调用时刻运行中的任意一个后台任务结束即返回，无运行中任务时立即返回，等待更久可再次调用（2.2.0 起指引不鼓励反复等待）。`WaitFor` 与 `TaskList`/`TaskOutput` 一样自动放行。条件：0.35.0 起新增按 Agent 的内存活动流（subagent activity store），子 Agent 事件分流进该存储，按引擎 `turn.step.started` 事件分段，上限 `MAX_SUBAGENT_ACTIVITY_STEPS = 20` 步、步骤文本尾段 4000 字符、单条工具输出 8000 字符、工具参数字符串 16 KiB。',
          behavior:
            '立即返回 task id，终态自动通知主 Agent；回合内等待由 `WaitFor` 承担：调用在当前回合内挂起，等待期间不发起 LLM 请求，超时不是错误、结果列出仍在运行的任务，等待结束时一并列出等待窗口内完成的其他任务，已通过 `WaitFor` 汇报结果的任务不再推送自动完成通知。Goal 模式可用 `WaitFor` 时，注入的指引文本要求模型优先在回合内调用 `WaitFor` 等待而不是结束回合；2.7.2 源码里给 subagent 的同一指引逐字为 “You are running as a subagent: ending your turn is your final hand-off to the parent agent, and completion notifications that arrive after it reach no one. Do not end your turn while a background task whose result you need is still running. Keep waiting for it with WaitFor, calling it again after a timeout if needed, or run the command in the foreground with a suitable timeout instead.”。等待对被等待任务无副作用：`WaitFor` 不停止任务，用户打断等待时任务继续运行。自 2.2.0 起新消息会提前结束本次等待：终端等待期间按 `Enter`（`Ctrl-S` 同样有效）把消息 steer 进当前轮次，等待开始时已在队列中的消息也会被 steer 进来（队列含 shell 命令或 skill 时整个队列与新输入仍排队到轮次结束），被等待的后台任务继续运行、完成后仍自动通知，TUI 把该状态渲染为 `interrupted`（`Wait interrupted by new input`）；2.7.2 中文工具文档已把这套行为写成正式口径，逐字为 “在终端中，Agent 等待期间按 `Enter` 会将消息注入当前轮次，等待开始时已在队列中的消息也会被自动注入。如果队列中有 Shell 命令或 Skill，则不会自动投递，队列和新输入仍排队到轮次结束。”。条件：0.35.0 起后台 Agent 事件实时写入活动流，预览窗格展示步骤级进展，不再等待任务结束；全屏详情按步骤分组渲染 Markdown 文本和各工具结果。',
          scope:
            '任务状态与输出保存在当前会话目录；后台 Agent 有独立上下文。`WaitFor` 只能等待本 Agent 启动的后台任务，其他 Agent 的任务 ID 不可见。会话关闭时默认停止仍在运行的后台任务（`[task] keep_alive_on_exit` 默认 `false`，环境变量文档逐字写 “默认会在退出时停止后台任务”）。',
          background:
            'Bash 与 Agent 两条超时链都由常量、配置节与环境变量三层决定。**Bash**（`packages/agent-core-v2/src/agent/tools/os/bash/bash.ts`，2.7.2 下 2,740 字节）逐字为 `DEFAULT_TIMEOUT_S = 60`、`MAX_TIMEOUT_S = 5 * 60`、`DEFAULT_BACKGROUND_TIMEOUT_S = 10 * 60` 与 `MAX_BACKGROUND_TIMEOUT_S = 24 * 60 * 60`，即前台默认 60 秒／上限 300 秒、后台默认 600 秒／硬上限 86400 秒（24 小时），schema 描述逐字为 “Optional timeout in seconds for the command to execute. Foreground default 60s, max 300s. Background default 600s, max 86400s. Ignored for background commands when disable_timeout=true.”，超限报错逐字为 `timeout must be ≤ <cap>s (background|foreground)`。`bashTool.ts`（25,810 字节）的后台三分支逐字为 `args.disable_timeout ? undefined : args.timeout === undefined ? this.detachTimeoutMs() : normalizeTimeoutMs(args.timeout, true)`，即 `disable_timeout=true` 完全不设超时、未传 `timeout` 走配置、显式传值按后台上限钳制；`detachTimeoutMs()` 取 `resolveAgentTaskConfig(this.config)?.bashTaskTimeoutS`，未配置时回落 `DEFAULT_BACKGROUND_TIMEOUT_S * 1000`。**配置节**自 2.6.0（2026-11-12T09:56:17Z）起改名为 `[task]`、`[background]` 降为 legacy 且两节接受相同字段，`resolveAgentTaskConfig()` 逐字为 `return { ...legacy, ...current };`，即两节都写时 `task` 覆盖 `background`；七个字段为 `keep_alive_on_exit`（默认 `false`）、`kill_grace_period_ms`（默认 `5000`，“任务被请求正常终止后，等待自行结束的宽限时间（毫秒），超时后强制停止”）、`bash_auto_background_on_timeout`（默认 `true`）、`bash_task_timeout_s`（默认 `600`，“`0` 表示无超时，任务运行到自行结束或被手动停止；显式传入的 timeout 不受影响，print 模式默认 0”）、`print_background_mode`（默认 `"steer"`）、`print_wait_ceiling_s`（默认 `2147483`）与 `print_max_turns`（默认 `100000`）。**Agent** 默认 7200000 毫秒（2 小时），源码逐字为 `DEFAULT_SUBAGENT_TIMEOUT_MS = 2 * 60 * 60 * 1000`，`[subagent] timeout_ms` 与 `[swarm] timeout_ms` 各自独立、`0` 表示无超时，超时分别以 `timed_out` 收尾与在聚合报告里标记 `Subagent timed out.`。前台命令超时默认不终止而转后台继续并按后台档重新计时，注入模型的指引逐字为 “A foreground command that hits its timeout is moved to the background instead of being killed, and you are notified when it completes.”，把 `bash_auto_background_on_timeout` 设为 `false` 则换成 “A foreground command that hits its timeout is killed.”。**print 模式**（`kimi -p`）由 `applyPrintModeConfigDefaults()` 把 `task.bashTaskTimeoutS`、`subagent.timeoutMs`、`swarm.timeoutMs` 与 `loopControl.maxStepsPerTurn` 的默认值写进 `ConfigTarget.Memory`，前三个都是 `0`（`PRINT_BASH_TASK_TIMEOUT_S_DEFAULT`／`PRINT_SUBAGENT_TIMEOUT_MS_DEFAULT`／`PRINT_SWARM_TIMEOUT_MS_DEFAULT`），即无超时；用户已显式设置或 legacy `[background]` 里已有用户值时不覆盖。任务被停止或后台超时时采用两阶段终止（SIGTERM → 5 秒宽限期 → SIGKILL）。',
          integration:
            'TUI、Web、SDK 都能显示或轮询任务状态；完整日志路径可交给 Read。实时活动视图只在 TUI 任务浏览器实现（`apps/kimi-code/src/tui/`），Web 与 SDK 未提供。',
          artifacts:
            'TaskOutput 内联最近 32 KB，完整日志落盘；任务修改留在工作目录。活动流仅存内存，会话切换时释放（`clear`），不落盘。',
          conditions:
            '停止后台任务需要审批；Plan 模式会拦截 TaskStop。条件：`WaitFor` 仅 v2 引擎（agent-core-v2）提供，实验标志 `wait_for` 默认开启，`KIMI_CODE_EXPERIMENTAL_WAIT_FOR=false` 可关闭，随 PR #3060（提交 `8440801de47d`）合入 main 并于 0.38.0 发布；90 秒上限与“新输入结束等待”随 PR #4061（提交 `20a2cea72f5d`，2026-09-29 合入 main，changeset `.changeset/shorter-wait-for.md` 为 minor）合入，**已于 2.2.0（2026-10-14T15:31:16Z）正式发布**——2.1.1（2026-09-24T07:24:08Z，工具文档 22,020 字节）仍逐字写 “上限 600”，2.2.0（工具文档 22,038 字节）与 2.7.2 逐字写 “上限 90”，GitHub compare 从 `20a2cea72f5d` 到 2.2.0 标签为 `status: ahead`、`ahead_by: 26`、`behind_by: 0`；本仓库此前记录的“合入 main 尚未发布”已作废。实时活动随 PR #2816（提交 `ad12ad8a140d`）于 2026-08-11 合入 main 分支，随 0.35.0（2026-08-12 发布）交付；会话恢复后没有内存活动记录的任务（如 lost 任务）回退到原捕获输出视图，Agent 任务输出仍在终态时一次性捕获。后台任务并发上限键 `max_running_tasks` 与对应环境变量 `KIMI_CODE_BACKGROUND_MAX_RUNNING_TASKS` 已从官方文档消失：配置文档在 2.1.1／2.2.0（各 38,670 字节）、2.3.0（39,707 字节）、2.4.0（41,020 字节）与 2.5.0（47,824 字节）下节标题都是 `## background` 且该键有命中，到 2.6.0（提交 `740d6c0bdd777cd8ed0d91eb3d62766910401173`，48,645 字节）节标题变为 `## task` 且该键命中数为 0，2.7.2 的环境变量文档（23,923 字节）也没有该变量；agent-core-v2 的 `AgentTaskConfigSchema`（3,672 字节）只有七个字段、不含 `maxRunningTasks`，而 node-sdk 的 `BackgroundConfigSchema`（14,771 字节）仍声明 `maxRunningTasks: z.number().int().min(1).optional()` 且根键仍只有 `background`、没有 `task`。因此当前是否还存在后台任务并发上限、以及 SDK 侧写 `[background] max_running_tasks` 是否仍被任何执行路径强制，官方文档没有说明，记为未确认。环境变量与配置节的优先级官方逐字写 “优先级均高于两个配置节”，五个变量为 `KIMI_CODE_BACKGROUND_KEEP_ALIVE_ON_EXIT`、`KIMI_CODE_BACKGROUND_BASH_TASK_TIMEOUT_S`、`KIMI_CODE_BACKGROUND_PRINT_BACKGROUND_MODE`、`KIMI_CODE_BACKGROUND_PRINT_WAIT_CEILING_S` 与 `KIMI_CODE_BACKGROUND_PRINT_MAX_TURNS`，其中 `KIMI_CODE_BACKGROUND_BASH_TASK_TIMEOUT_S` 官方补了一句 “也用于前台命令转入后台后的重新计时”；解析器要求非负／正整数，非法值被忽略而不是报错。',
          sources: [
            'kimi-tools-current',
            'kimi-commands-execution-current',
            'kimi-agents-execution-current',
            'kimi-background-activity-commit',
            'kimi-background-activity-changeset',
            'kimi-v035-release',
            'kimi-wait-for-release',
            'kimi-wait-for-commit',
            'kimi-wait-for-docs',
            'kimi-wait-for-flag',
            'kimi-wait-for-changeset',
            'kimi-wait-for-cap-commit',
            'kimi-wait-for-cap-source',
            'kimi-wait-for-cap-docs',
            'kimi-wait-for-cap-changeset',
            'kimi-tools-211-waitfor-600s',
            'kimi-tools-220-waitfor-90s',
            'kimi-tools-272-background',
            'kimi-bash-timeout-constants-272',
            'kimi-bash-tool-timeout-resolution-272',
            'kimi-task-config-section-doc-272',
            'kimi-task-config-section-source-272',
            'kimi-task-print-defaults-source-272',
            'kimi-subagent-timeout-constant-272',
            'kimi-env-vars-task-272',
            'kimi-node-sdk-background-schema-272',
            'kimi-task-section-rename-260',
          ],
        },
        qoder: {
          entry:
            '`/tasks` 查看后台任务；模型可用 `TaskOutput` 读取结果、`TaskStop` 停止。官方 Tools 页把后台入口写成行为口径而不是参数，逐字为 “When later work does not depend on an immediate command result, Qoder CLI can run the shell command in the background and let the main session continue with other work.” 与 “A command explicitly requested in the background becomes a background task regardless of how quickly it exits.”',
          primitives:
            '内置工具表包含 TaskOutput、TaskStop；后台 Shell 或 Agent 的具体启动参数由当前 CLI 版本暴露。除后台命令外还有事件监视器，官方逐字为 “For continuously changing signals such as logs, deployment status, or test activity, Qoder CLI can start an event monitor. Each complete line written by the monitor command becomes an event for the main session.”',
          behavior:
            '后台工作不阻塞主会话，可从任务界面查看状态和输出；流程图官方逐字为 “Background task starts -> Main session continues -> Completion returns -> Main session handles the result”，完成、失败或需要关注时结果自动回到所属会话，不需要反复询问或轮询。CLI 0.2.9（May 8, 2026）起前台长命令超时会自动转后台并在完成时通知，更新日志逐字为 “Long-running Bash commands now auto-background with completion notification when they exceed the timeout”。CLI 1.1.94（November 20, 2026）起后台 Bash 命令默认带 10 分钟超时，更新日志逐字为 “Background Bash commands now default to a 10-minute timeout”，所在小节标题为 “Stability Fixes and Improved Background Execution Defaults”。',
          scope:
            '任务属于当前本地会话、Worktree Job 或 Cloud session。',
          background:
            'Shell、Subagent 与远端 Job 都能形成长任务，但三者的生命周期和存储位置不同。后台 Bash 的默认超时自 CLI 1.1.94 起为 10 分钟；设置参考里唯一的 Shell 超时键是 `tools.shell.inactivityTimeout`（number，默认 `300`，Restart No，逐字 “Shell no-output timeout in seconds.”），管的是无输出超时而不是后台命令总时长，两者的关系官方没有说明。CLI 1.0.47（July 16, 2026）“Cleaned up unfinished background tasks when the CLI exits” 说明退出时会清理未完成任务；CLI 1.1.93（November 19, 2026）“Fixed background processes not being reclaimed when a subagent exits” 说明 Subagent 退出时其后台进程应被回收。',
          integration:
            'TUI 任务面板、Agent SDK 工具输出与 Cloud Web console 分别提供观察入口。`/tasks` 官方逐字为 “In TUI, enter `/tasks` to view the status and output of background Shell and Subagent tasks and to stop tasks that are still running.”',
          artifacts:
            '输出和文件保留在对应执行环境；任务记录可供会话继续读取。后台任务的 `.output` 文件按设置参考的保留策略单独清理，逐字为 “Background task `.output` files continue to be cleaned independently after 7 days.”',
          conditions:
            'Task 工具可被权限或 Agent 工具列表禁用；Cloud Mode 需要远端环境和账号权限。**CLI 1.1.94 的 10 分钟默认超时只有更新日志一处一手来源，官方文档三页均未同步**：Tools 页（`.md` 9,127 字节）的 “Background Commands and Event Monitoring” 一节没有任何超时数值、也没有 1.1.94 或 10 分钟的表述；设置参考（`.md` 31,752 字节）的 “## tools (Tools)” 一节六个键为 `tools.shell.pager`、`tools.shell.inactivityTimeout`、`tools.core`、`tools.exclude`、`tools.useRipgrep` 与 `tools.disableLLMCorrection`，没有任何后台 Bash 超时键，含 background 字样的只有终端主题相关的 `ui.autoThemeSwitching`、`ui.terminalBackgroundPollingInterval`（默认 60 秒）与 `.output` 文件 7 天清理一句；“Process Tasks in Parallel” 页（`.md` 3,697 字节）仍只把 Background Agents / Tasks 与 Worktree、Subagents 并列为三种隔离方式。据此以下四点记为未确认：1.1.94 之前的后台 Bash 默认超时是多少（整份更新日志只给新值）、这 10 分钟是墙钟总量还是无输出计时、它与 `tools.shell.inactivityTimeout` 的 300 秒如何叠加、以及能否通过设置键或环境变量调整；官方也没有说明该默认是否覆盖后台 Subagent 与事件监视器。同小节的另一条 “Changed the default Subagent execution strategy to run in the background” 属 `agent-background` 字段。相邻的后台稳定性修复时间线为 CLI 1.1.79（October 26, 2026）“Fixed processes hanging when the Bash tool failed to terminate properly”、CLI 1.1.63（September 24, 2026）“Fixed a leak caused by failing to stop Windows background tasks”、CLI 1.1.4（July 23, 2026）“Improved background task control with monitoring, stopping, and clearer status feedback”、CLI 1.0.25（June 22, 2026）“Improved background task notification experience”、CLI 1.0.17（June 10, 2026）“Redesigned the background task details panel with a structured layout and fixed empty output” 与 CLI 0.1.4（October 23, 2025）“Updated /bashes command to display only background tasks”。',
          sources: [
            'qoder-commands',
            'qoder-tools',
            'qoder-using-cli',
            'qoder-v1194-bg-bash-timeout-changelog',
            'qoder-tools-background-20261122',
            'qoder-settings-shell-timeout-20261122',
          ],
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
        'Claude Code v2.1.288 起 `/code-review`（含别名 `/review`）接受 `--max-findings n|all|default`：用指定条数或 `all` 取代审查的常规 findings 上限，输入的取值被后续审查复用直到传 `--max-findings default`；官方文档只写“审查的常规上限”，没有给出默认条数，也没有给出复用值的保存位置。',
        'findings 数量控制目前只有 Claude Code 提供显式参数：Qwen Code 以 `--severity-floor critical|suggestion` 按严重级别过滤、`--topology minimal` 固定至多 15 条 findings，Codex、Qoder CLI 与 Kimi Code 当前一手资料未列出同类的 Review findings 条数参数。',
        'Claude 与 Codex 的 GitHub 托管 Review 和本地 `/code-review` 是不同 Surface：前者可在 PR 上自动触发，后者在当前会话输出结果。',
        'Qwen Code `/review` 自 2026-08-02 起提供 `publish-assets`：把证据图发布到用户指定的资产仓库并回写 URL，供 PR 评论嵌入；其余四家当前一手资料未列出同类内置入口。',
        'Qwen Code medium/high effort Review 会在 `.qwen/reviews/` 保存结构化 JSON 产物，Web Shell 将其渲染为可筛选 findings 的交互式审查视图；其余四家当前一手资料未列出同类内置结构化审查结果视图。',
        'Qwen Code v0.21.6 起提供 `qwen review cost-ledger`：从本次审查在磁盘上的用量记录聚合主循环与各 Agent 的模型调用和 token 消耗，内置 Review Skill 在 Step 8 运行并把结果归档进报告；其余四家当前一手资料未列出同类内置 Review 成本聚合入口。',
        'Qwen Code v0.21.7 起提供 `.qwen/review-context.json` 仓库上下文清单与 `qwen review repo-context`：仓库用严格 JSON 声明路径、领域、推荐测试、必需审查角色等有界审查指引，medium/high effort 的本地与同仓 PR 审查在计划采集后并入审查计划，PR 审查只从 merge base 读取清单；其余四家当前一手资料未列出同类内置 Review 仓库上下文入口。',
        'Qwen Code v0.21.15 起 `/review` 与 `qwen review run` 支持 `--resume`：中断的 PR 审查从 worktree、diff 与 Agent 运行记录等磁盘状态继续而不是重新开始，续跑复用上一次尝试已认证的 Agent 结果；续跑固定在被中断运行的 effort，PR head 移动或 effort 不一致时拒绝续跑并回退为全新审查；其余四家当前一手资料未列出同类恢复中断 Review 的内置入口。',
        'Qwen Code `/review` 自 2026-08-25（PR #9919 合入 main，尚未发布）支持 `--topology`：`minimal` 选择单遍 A/B 对比臂，由 orchestrator 在自己的上下文里对 diff 做一遍资深工程师式通读，至多 15 条 findings 且每条必须带具体失败场景，无 Subagent 扇出、验证、反向审计与发布，仅终端输出；`auto`（默认）保持原有 effort 驱动管线，拓扑与 effort 正交，选中 `minimal` 完全覆盖 effort 分发；其余四家当前一手资料未列出同类审查拓扑选择入口。',
      ],
      products: {
        claude: {
          entry:
            'v2.1.223 起 `/review` 是 `/code-review` 的别名；`/code-review [low|medium|high|xhigh|max|ultra] [--fix] [--comment] [--max-findings n|all|default] [pr#|branch|path]` 审查当前 Diff 或指定目标，`ultra` 运行云端 ultrareview；`/security-review` 检查 Diff 的安全漏洞。',
          primitives:
            '`/code-review` 是 bundled Skill，默认作为带独立上下文窗口的后台 subagent 运行；`ultra` 与托管 Code Review 使用多 Agent 流水线，分别在云端与 GitHub PR 上分析并验证问题。',
          behavior:
            '默认审查分支领先 upstream 的提交加未提交改动；目标可为 PR 编号、分支名、文件路径或 ref range（如 `main...my-feature`）。不带级别时复用会话最近一次输入的 `low` 至 `max` 级别并提示 `Reusing high effort, the level you typed last time` 之类的通知，`-p` 非交互运行传入的级别不更新被复用的值，`ultra` 既不更新也不使用它，从未输入过级别时用会话当前 effort；`low`/`medium` 只报高置信度 findings，`high` 至 `max` 放宽覆盖并可能包含把握较小的 findings。v2.1.290 起 medium 级别在“没有调优审查设置的模型”（更新日志点名 Opus 5.5 与 Sonnet 5.5）上也报告清理类与 CLAUDE.md 约定类 findings。`--max-findings n` 把本次报告限制为 `n` 条、`--max-findings all` 报告全部 findings，两者都取代审查的常规上限，输入的取值被后续审查复用直到传 `--max-findings default`；官方文档只写“审查的常规上限”，没有给出默认条数，也没有给出复用值的保存位置。`--fix` 把 findings 应用到工作树；`--comment` 把 findings 发布为 GitHub PR 行内评论，或（v2.1.257 起）经 GitLab 的 `glab` CLI 发布为 GitLab MR 上的单条 note。`/code-review ultra` 运行云端 ultrareview，不可用时回退为会话内本地审查；审查 `github.com` PR 时可加 `--post` 在启动对话框预选 **Run and post the findings to the PR as me**，默认是 `--no-post`、发帖是每次运行各自的选择，发出的是以本人 GitHub 账号发布、结尾带 “Generated by Claude Code” 的单条普通评论，不是 Review 也不是批准。发帖结果分三种回报：`Posted` 给出评论链接、`Already posted` 说明同一次审查已发过并改给 PR 链接、`Failed` 说明原因且 findings 留在终端供手工发布。',
          scope:
            '本地为当前分支 Diff 或指定 target；ultrareview 默认审查当前分支与默认分支的差异（含未提交与 staged 改动），可接受自定义 base 分支、PR 编号/URL 或说明文字，单次默认上限 500 个文件和 8,000 行变更。托管 Review 由仓库触发策略决定（PR 打开、每次 push 或手动 `@claude review`）。',
          background:
            '本地审查默认后台 subagent，不占用会话上下文；上一次审查未完成、`-p` 模式或 `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS=1` 时改为前台。托管 Code Review 在 Anthropic 基础设施并行运行。',
          integration:
            '本地审查读取仓库的 `CLAUDE.md` 文件并把新引入的违规当作 nit 级 findings，不读取 `REVIEW.md`；托管 Code Review 把仓库根目录 `REVIEW.md` 以最高优先级注入审查流水线每个 Agent。findings 去重、按严重级别排序后以行内评论发布到 PR，摘要进 review body，并生成 Claude Code Review check run。`--post` 的发帖不在本机执行：Claude Code 把审查的会话 ID 发给 Anthropic API，由 API 通过用户已连接的 GitHub 账号发布该审查已保存的 findings。',
          artifacts:
            '本地 findings 列表（每条显示文件位置、一句话摘要与 `correctness` 之类的分类标签；桌面等宿主应用经 `ReportFindings` 工具）、`--fix` 文件修改、GitHub 行内评论、GitLab MR 单条 note、`--post` 以本人账号发布的 PR 普通评论、review 摘要与 check run。',
          conditions:
            '版本条件：`--max-findings` 需 v2.1.288 及以上，`--post` 需 v2.1.227 及以上，`--comment` 发 GitLab MR 需 v2.1.257 及以上。`/code-review` 标记 `disable-model-invocation`，只在显式调用时运行。`ultra` 需要 claude.ai 账号登录并开启 usage credits；Amazon Bedrock、Google Cloud Agent Platform、Microsoft Foundry 与 ZDR 组织不可用，不可用时回退本地审查；账号可用 ultrareview 时 `/ultrareview` 是 `/code-review ultra` 的别名。发帖要求与审查本身相同的 claude.ai 登录，第三方 Provider 上或设置 `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` 时不可用；审查分支或 GitHub Enterprise Server PR 时只在会话内显示 findings、不提供发帖。交互式会话在 findings 到达时开始发帖，需保持会话打开直到审查结束；发帖选择只在当前会话保留，会话在审查结束前终止则不发帖，即使之后恢复该对话。非交互发帖只能用 `claude ultrareview --post`（运行该子命令即表示同意、不再询问），`claude -p \'/code-review ultra\'` 会在 findings 到达前退出因而不发帖。后台审查的 `--fix` 编辑不经过会话检查点（`/rewind` 不回退），前台编辑可被 `/rewind` 回退。托管 Code Review 为 research preview，面向 Team/Enterprise，ZDR 组织不可用。',
          sources: [
            'claude-commands',
            'claude-code-review',
            'claude-review-alias',
            'claude-ultrareview',
            'claude-v21288-max-findings-changelog',
            'claude-v21290-review-changelog',
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
            '`/review` 审本地变化；`/review <file>` 审文件；`/review <pr>` 审 PR；`--comment` 发布 GitHub Review；`/review <pr> --resume` 继续该 PR 上一次被中断的审查（v0.21.15 起）；`/review <target> --topology minimal` 选择单遍 A/B 对比臂（main 分支，尚未发布），Skill 参数提示为 `[pr-number|file-path] [--effort low|medium|high] [--severity-floor critical|suggestion] [--topology minimal] [--comment] [--fix] [--resume]`；Headless 包装 `qwen review run [target] [--json] [--fail-on request-changes] [--comment] [--resume] [--quiet]` 同样支持 `--resume`，但不接受、不透传 `--topology`；`qwen review publish-assets` 发布证据图；`qwen review cost-ledger --plan <计划报告> [--out <路径>]` 聚合本次审查成本；`qwen review repo-context --plan <计划 JSON> --worktree <工作树> --out <产物路径>` 为审查计划附加有界仓库上下文，medium/high effort 审查在计划采集后由流程调用。',
          primitives:
            '内置 Skill 用 `qwen review fetch-pr`、并行审查 Agent、锚点验证和一次 Create Review API 提交；证据图经 Contents API（`gh` HTTPS）写入指定仓库，不克隆、不走 SSH。`cost-ledger` 聚合 chat 与 subagent transcript JSONL 中 assistant 事件携带的 `usageMetadata`，与 coverage gate 读取同一批记录。仓库上下文来自 `.qwen/review-context.json` 严格 JSON 清单：顶层字段固定为 `version`、`label`、`rules`；每条规则必填 `paths`（仓库相对、`/` 分隔 glob，支持 `*`、`?` 与完整 `**` 段，区分大小写），可选 `relatedPaths`、`domains`、`recommendedTests`、`requiredConfigurations`、`requiredAgents`、`unverifiedDimensions`、`verificationNotes`；未知字段、注释、不支持的版本、超限值、控制字符与重复数组项被拒绝。manifest provider 在进程内静态注册（provider 名 `manifest`），输出经共享 `validateRepositoryContext` 校验；不支持动态插件注册、shell 执行、模板或不透明载荷。`--resume` 不依赖专门检查点文件：`fetch-pr --resume` 直接裁决中断尝试的磁盘状态（worktree 仍停在 `fetchedSha` 且干净、diff 字节未变、PR head 未移动、续跑上限未用完、effort 一致），成功返回 `{"resumed": true, ...}`，失败返回 `{"resumed": false, "resumeRefused": "<原因>"}` 并已回退为全新抓取；续跑由 `qwen review recover-findings` 用与 `check-coverage` 相同的双重认证把中断尝试的 Agent 对照 harness transcript 认证，并把每个已认证 Agent 的最终文本写入 `--out`，`check-coverage` 只列出仍欠工作的 Agent。`--topology` 由 `parse-args` 确定性解析进裁决：合法值集合为 `auto` 与 `minimal`（`ReviewTopology` 类型），裁决携带 `topology` 与 `topologySource`（`default` 或 `explicit`），与 target、effort 并列；拓扑与 effort 正交——`minimal` 是不同形状的审查而不是同一审查的某一深度，选中后完全覆盖 effort 分发，跳过 Agent 机制（名册、覆盖、预算），DESIGN.md 的 LLM 调用预算一节把该臂定价为 0 个 subagent 调用（orchestrator 上下文内一次模型回合）。',
          behavior:
            '本地默认 medium effort，PR 默认 high；同仓 PR 强制在临时 Worktree 中读、测、审，跨仓 URL 使用轻量模式。证据图只接受 png/jpg/jpeg/gif/webp（拒绝 SVG），单文件 10 MiB、单批 40 MiB 上限，任一文件不合格则整批拒绝。medium/high effort 审查还会把规范 findings 与组合结论保存为与报告同名的结构化 JSON 产物，Web Shell 把它渲染成可筛选 findings 的交互式审查视图，Markdown 报告保持人类可读存档。`cost-ledger` 以 `--plan` 计划报告的 mtime 为计费窗口起点（计划前的引导轮次与台账运行后的组装不计入），按流输出主循环与每个审查 Agent 的模型调用数、输入/缓存/输出/思考 token 数与耗时；模型调用只统计携带 `usageMetadata` 的 assistant 记录，计数是下限而非精确 API 调用数。仓库上下文规则在任一变更文件命中其 `paths` glob 时生效，所有命中规则的指引合并、去重并排序：审查 Agent 获得领域与相关文件，build-and-test Agent 获得推荐测试、必需配置与验证说明，`requiredAgents` 只在所选 effort 与拓扑本就运行相应角色时并入名册，`unverifiedDimensions` 在最终审查中作为非阻塞证据边界披露。`relatedPaths` 通配符从工作树展开（启用点文件、不返回目录、不跟随符号链接），必须以非通配目录段开头，解析文件必须留在工作树内且不进入 `node_modules`、`dist` 等依赖或构建产物目录；访问条目 16384、解析文件 128 或匹配工作量预算任一超限即失败关闭。`repo-context` 校验 `--out` 与 `--plan` 不是同一文件、worktree 是目录且与 `plan.worktreePath` 一致、`plan.mergeBaseSha` 格式有效且可解析，成功后把上下文 JSON 写入 `--out` 并原子覆写计划文件，stdout 输出 `Wrote repository context (manifest) to <路径>`，无上下文时输出 `Wrote null repository context to <路径>`。`--resume` 续跑复用上一次尝试的 worktree、计划、diff 与报告：`--out` 路径上的旧报告刻意保留不改动，只用来读取 worktree、计划和 diff。续跑固定在被中断运行记录的 effort，显式传不同 `--effort` 会以 `effort-mismatch` 拒绝续跑并按新级别全新运行；PR head 已移动时以 `head-moved` 拒绝，该拒绝本身消耗本次审查的一次 head 移动重启配额，之后 Step 7 只能在已审 SHA 提交、不得再次重启。续跑从最后一次已认证的反向审计轮次 `k` 之后以 `k+1` 继续，续跑披露自动化：覆盖统计计入 `recoveredAgents`，组合正文自带续跑说明行。`--topology minimal`（Skill 的 Step 3M）与其他模式共用 diff 取得机制——同仓 PR 走 `fetch-pr`、跨仓 PR 走轻量 `fetch-diff`、本地/文件目标走本地捕获——但跳过 Step 1 其余设置（规则加载、`pr-context`、`comment-status`、增量缓存检查），随后跳过扇出、验证、反向审计与发布；orchestrator 在自己的上下文里充当审查者，按 chunk 计划用 `read_file` 逐段读 diff（超大 chunk 分页，读取上限规则不变），歧义 hunk 可读所在函数，但不 grep 代码库、不构建、不运行任何东西、不加载项目规则（Step 2 跳过）。单遍按资深工程师标准审查：对每条变更行追问什么输入、状态、时序或平台会使其出错，对每条删除/替换行追问其维护的不变量在哪里重新建立；至多报告 15 条 findings，按严重级别排序，每条必须带具体失败场景（触发它的具体输入/状态/时序与错误后果，质量类 finding 则是具体代价），构造不出场景的 finding 在源头丢弃，无法确定的疑似 Critical 以 `Confidence: low` 保留；diff 确实干净则什么都不报，不向 15 条上限凑数。增量缓存是 high 专属，minimal 从不查询缓存，始终审查完整 PR diff。',
          scope:
            '本地 working tree、单文件、PR number 或 URL；规则来自系统、项目 AGENTS.md 和 Skill。`cost-ledger` 的记录位置来自 CLI 导出的 `QWEN_CODE_PROJECT_DIR`/`QWEN_CODE_SESSION_ID` 环境变量，不接受模型指定的路径。仓库上下文只在 medium/high effort 的本地与同仓 PR 审查中生效；low effort 与跨仓轻量审查跳过。PR 审查的清单从 merge base 提交读取，PR head 无法为自己加入或移除指引；本地审查的清单从当前 worktree 读取。`--resume` 只对 PR 目标有效：本地审查的 diff 来自活动工作树，没有可续跑的稳定中断状态，非 PR 目标传 `--resume` 会收到警告并被忽略；跨仓且无匹配 remote 的 PR URL 走轻量模式，没有 `fetch-pr`、worktree 和计划，`--resume` 同样无效、审查从头运行。`--topology` 没有配置项，只能是显式旗标；`auto` 与 `minimal` 对本地、文件与 PR 目标都有效，跨仓轻量模式下没有代码树，只能依据 diff 本身审查。',
          background:
            '多维度审查 Agent 可并行执行；进度在当前 Surface 展示。',
          integration:
            '`--comment` 在 GitHub 提交一次 Review；Qwen Code Action 还能在 PR 事件中自动运行审查。GitHub API 不能给 Review 评论附图，`publish-assets` 把证据图托管到 `QWEN_REVIEW_ASSETS_REPO`（`owner/repo`），写入 `pr-assets/<pr>-review` 分支并以 commit 固定的 URL 嵌入评论；GitHub Enterprise 加 `--host`。续跑定位为本地便利：仓库自身的 CI 审查工作流不续跑，每次重试都全新运行（临时沙箱退出即删除 worktree，没有可恢复的磁盘状态，场景测试固定该缺失）。',
          artifacts:
            '同仓审查在项目 `.qwen/reviews/` 保存 Markdown 报告，medium/high effort 另有同名结构化 JSON 产物（跨仓轻量审查不落盘报告）；本地 findings、可选 GitHub 行内评论；findings 带 `assetFiles` 本地路径与 `assets` 已发布 URL，资产清单记录每个文件及落点 commit；Worktree 按流程清理。内置 Skill Step 8 运行 `cost-ledger`，把打印块原样粘贴进报告并在终端摘要转述首行；`--out` 保存完整台账 JSON（Skill 约定 `.qwen/reviews/<报告名>-cost-ledger.json`，worktree 模式落在主项目目录），打印块只列最大的 8 个 Agent，JSON 保留全部。`repo-context` 把校验后的 `RepositoryContext` 对象（无上下文时为 `null`）以带结尾换行的 JSON 写入 `--out` 指定路径，并回写更新后的计划文件。minimal 臂的终端报告 Summary 标注 "Minimal pass (topology: minimal) — findings are unverified"（按输出语言翻译）并跳过验证统计，仍以 `level: "low"` 发出 Step 6 的 `report_findings` 调用（`low` 是客户端唯一渲染"未验证"标记的级别，可把未验证 findings 与已验证 high-effort 审查区分开），条目来自组合的 finding 列表（`severity`、`file`/`line`、`summary`、`shortSummary`、`failureScenario`）；不产生 verdict（无 Approve / Request changes / Comment），跳过 open-Criticals 复查，因 `maxLineChars` 不可覆盖的 chunk 仍列在 "Not reviewed"。Step 8 保存报告（标记 `topology: minimal`）但不创建、不注册结构化 findings 产物（该臂没有组合 verdict 可供 `save-artifact` 读取），也不写增量缓存（否则之后一次完整审查会误报 "No new changes since last review"）；Step 9 清理照常，完成行固定为 `minimal pass, not posted (<N> unverified findings)`。',
          conditions:
            'Bare mode、禁用 Skills 或 Slash 时不可用；PR 读取/评论需要 GitHub 访问权限。`publish-assets` 还要求 `QWEN_REVIEW_ASSETS_REPO` 指定可推送仓库（未设置或格式错误退出码 3，不自动选仓库），并与 `submit` 共用授权门禁：只有被授权发布评论的运行才能推送，有效 `--comment` 强制 high effort，因此 low/medium 运行不会发布。结构化 JSON 产物与 Web Shell 视图只来自 medium/high effort 审查；low effort 不生成。`cost-ledger` 定位为 informational：记录缺失或无法计算时在 stderr 输出 `cost-ledger unavailable — <原因>` 并以退出码 0 结束，`--out` 写入失败降级为警告，均不阻塞审查。仓库上下文清单失败关闭：清单缺失得到 `null` 上下文；清单存在但不可读、超过 1 MB 或内容非法时抛错，存在但非法的上下文会让所有下游消费者失败而不是被静默丢弃；PR 计划的 merge base 未解析（`mergeBaseSha: null` 或 base 抓取失败）时不读 worktree，直接写 `null` 产物。`--resume` 的前提是中断尝试的磁盘状态存在且全部探测通过；任一探测失败都在同一次命令内回退为全新抓取，`resumeRefused` 携带原因并向用户说明，因此不确定时传 `--resume` 是安全的。续跑不再重新做增量检查，也不会进入 `upToDate: true` 的停止/清理分支（那会运行 `cleanup pr-<n>`，摧毁 `--resume` 刚救回的 worktree 与租约）。该能力随 v0.21.15 发布。`--topology minimal` 是 terminal-only：解析器强制 `comment.effective`、`fix.effective`、`resume.effective` 全部为 `false`，同时传 `--comment`（含 `review.comment` 设置）、`--fix` 或 `--resume` 时分别警告被忽略（`--comment` 与 `--fix` 因"仅终端输出、不发帖/不改代码"被忽略，`--resume` 因"全新单遍既不继续也不消耗中断运行"被忽略）；发布授权新增 `topology` 拒绝类（与 `unbound`、`comment-not-requested` 并列的结构化 `cls` 判别），已绑定 PR 的 minimal 运行被拒绝发布，理由为 "`--topology minimal`, which is terminal-only and cannot authorise posting — re-run the review without it"。用户要求发布 findings 时拒绝并指向 `/review <target> --effort high`（未验证 findings 不得公开发布），要求应用修复时指向 `/review --fix`（以 medium 重跑并验证）。非法 `--topology` 取值不会悄悄改变审查形态：`Invalid --topology value "<value>"; using the default topology (auto).` 回退 `auto`，缺值报 `--topology requires a value`，带空格且像目标的结果值被救援为审查目标并警告。`--topology` 于 2026-08-25 经 PR #9919 合入 main，尚未发布；官方用户文档 `docs/users/features/code-review.md` 尚未同步。',
          sources: [
            'qwen-review-current',
            'qwen-review-skill',
            'qwen-review-assets',
            'qwen-review-web-shell',
            'qwen-review-cost-ledger',
            'qwen-review-repo-context',
            'qwen-review-resume-commit',
            'qwen-review-resume-docs',
            'qwen-review-resume-skill',
            'qwen-v02115-release',
            'qwen-review-topology-commit',
            'qwen-review-topology-skill',
            'qwen-review-topology-parse-args',
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
        'Qwen Code 自 v0.22.0 起把 Web Shell Git 对话框创建的 PR 绑定到源会话：侧栏与选择器显示 `#N` 徽标、可按 PR 号/分支名/worktree slug 反查会话，绑定持久化为 `<chatsDir>/<sessionId>.pr.json`，每会话上限 10 条。',
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
            '`/review <pr> --comment` 发布 Review；`gh` 读取/创建 PR；Qwen Code Action 响应 PR 和评论事件；Web Shell Git 对话框（Commit 视图 Create Pull Request）创建 PR 成功后，经 `updateSessionMetadata` 把单条 `{number, url}` 绑定到源会话。',
          primitives:
            '内置 Review Skill、GitHub CLI、Qwen Code Action、安装的工作流，以及 Daemon 会话元数据路由与 `<chatsDir>/<sessionId>.pr.json` 绑定 sidecar。',
          behavior:
            '同仓 PR Review 在临时 Worktree 中运行并一次性提交评论；Action 可自动审查或由评论触发 Assistant。PR 绑定按绑定时间排序、按 PR 号去重，重复绑定刷新 URL 并移到最新位，每会话上限 10 条、超出丢弃最旧；绑定写入 sidecar，Daemon 重启后由列表回填，归档/取消归档随会话移动、删除会话时清理。侧栏会话行、任务总览面板与恢复/删除/释放选择器显示 `#N` 徽标（多条为 `#N +M`），点击经桌面适配外链打开最新 PR，详情悬浮列出全部绑定（最新在前）；侧栏与恢复对话框搜索可匹配任意绑定 PR 号（`9517` 或 `#9517`）、分支名与 worktree slug。',
          scope:
            '当前 GitHub 仓库、PR number/URL 或工作流事件；PR 绑定限有会话上下文的 Web Shell Git 对话框创建路径。',
          background:
            'Review Agent 可并行；Action 在 GitHub Runner 异步运行；绑定经 `session_metadata_updated` SSE 事件与目录轮询在约 2 秒内反映到侧栏。',
          integration:
            '`/setup-github` 安装 dispatch、assistant、issue triage、scheduled triage、PR review 五类 Workflow；REST 与 workspace 作用域的 `PATCH /session/:id/metadata` 以及 ACP `session/update_metadata` 都可写入绑定。',
          artifacts:
            'GitHub Review、Action run、评论、分支修改、通过 gh 创建的 PR，以及会话 PR 绑定 sidecar 与侧栏 `#N` 徽标。',
          conditions:
            '创建 PR 没有独立 Slash 命令；需要 gh 或工作流权限，`--comment` 会产生外部写入。PR 绑定随 v0.22.0 发布，仅覆盖 Web Shell Git 对话框创建的 PR：Agent 在 Shell 内自行 `gh pr create` 不会被绑定，无会话上下文的 workspace 级对话框不回写，也没有清除绑定的入口；`url` 仅限 http(s) 且不超过 2048 字符，在路由、bridge、SDK 与 sidecar 四层校验。',
          sources: [
            'qwen-review-current',
            'qwen-github-current',
            'qwen-setup-github-current',
            'qwen-v022-release',
            'qwen-pr-binding-commit',
            'qwen-pr-binding-design',
            'qwen-pr-binding-service',
            'qwen-pr-binding-badge',
            'qwen-pr-binding-search',
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
        'Claude Code、Codex、Qwen Code 和 Qoder CLI 都有 CLI Worktree 入口。Codex 的 CLI 托管 Worktree 自 rust-v0.154.0 引入、rust-v0.156.0 起默认开启，此前只能记录到 ChatGPT 桌面 App；Kimi Code 2.1.1 的官方文档没有任何 Worktree 入口。',
        '起点与分支不同：Claude 默认 `worktree.baseRef` 为 `"fresh"`，从远端默认分支（通常 `origin/HEAD`）创建并建 `worktree-<name>` 分支；Codex 默认解析 `HEAD^{commit}`，用 `git worktree add --detach` 得到 detached HEAD 且不建分支；Qwen 从当前本地分支创建 `worktree-<slug>` 分支。',
        '清理责任不同：Claude 用 `cleanupPeriodDays` 周期清扫并按 marker、未推送提交与 submodule 状态保留；Codex CLI 把自动清理硬编码为关闭（`desktop.worktree-auto-cleanup-enabled` 与 `desktop.worktree-keep-count` 默认 15 只服务 Desktop），删除靠 `/worktree` 浏览器逐项确认；Qwen 只清扫 `agent-<7hex>` 形状的临时 Worktree，`enter_worktree` 命名的其他 Worktree 永不清扫；Qoder 在交互式退出时按未提交文件与新提交决定自动删除或提示保留，Subagent worktree 干净即删、有改动保留。',
        '隔离强度不同：Claude 在 Worktree 会话内用四项检查阻断指向主检出的编辑与命令，并覆盖该会话派生的每个 Subagent；Kimi 只在 `/tower` 模式下按 worker 身份拒绝写自己 worktree 之外的路径；Qwen 记录的是删除时的会话归属拒绝。Codex 与 Qoder 的一手资料未记录等价的越界写入拦截。',
        'Qoder CLI 的 `--worktree` 把命名 Worktree 放在仓库内 `.qoder/worktrees/<sanitized-name>`、建临时分支 `worktree-<processed-name>` 且同名直接复用；并回主分支是手工提交或合并（`Once completed, they can be committed or merged separately.`），官方未描述自动合并命令、主分支解析与冲突解决。',
      ],
      products: {
        claude: {
          entry:
            '`claude --worktree|-w [name|#PR|URL]`（省略名字时自动生成，如 `bright-running-fox`；`#` 需加引号）；会话内用 `EnterWorktree`/`ExitWorktree`，`EnterWorktree` 带目标路径可在 `.claude/worktrees/` 下直接切换；Agent frontmatter 写 `isolation: worktree`；`--resume`/`--continue` 回到 Worktree 会话。',
          primitives:
            '`.claude/worktrees/<name>/`（PR/MR 用 `.claude/worktrees/pr-<number>`）、`worktree-<name>` 分支、写入 Git 元数据的创建 marker、`.worktreeinclude`（gitignore 语法，只复制既匹配模式又被 ignore 的文件，跟踪文件从不复制）与 WorktreeCreate/Remove Hooks。',
          behavior:
            '新会话、当前会话和 Subagent 都可隔离；无改动临时 Worktree 自动清理，有改动时提示保留或删除。隔离期间四项检查阻断指向主检出的操作：`Edit`/`Write`/`NotebookEdit` 目标在主检出、Bash/PowerShell/Monitor 的工作目录解析到主检出或无法核实、把 git 重定向进主检出（`git -C`、`--git-dir`、`GIT_DIR`/`GIT_WORK_TREE`、先 `cd` 再跑 git）、以及无法从命令文本核实 git 停留位置的命令形状（该检查不能关闭）；同样覆盖隔离会话派生的每个 Subagent，PowerShell 只做工作目录检查，每次拒绝以工具错误返回并写明 Worktree 与后续做法。',
          scope:
            '`worktree.baseRef` 默认 `"fresh"`：从远端默认分支创建，仓库 24 小时内未 fetch 时拉取默认分支（上限 5 秒），无远端或 fetch 失败回退本地 `HEAD`；设为 `"head"` 则从当前本地 HEAD 创建；不能设为具体分支名。Subagent Worktree 用同一 base 规则；PR/MR 从 `origin` 的 `pull/<number>/head` 或 `merge-requests/<number>/head` 取 head commit。',
          background:
            '`/batch` 把 5–30 个单元交给后台 Agent，每个单元用独立 Worktree 并可打开 PR；配 `WorktreeCreate` Hook 可在非 Git 仓库运行 `/batch`（v2.1.281 起），各 Subagent 改用项目自己的版本控制命令发布改动、开不出 PR 时报告已发布内容。转后台的 `--worktree` 会话其 Worktree 变成可被清扫的后台会话 Worktree，Agent 运行期间持有 `git worktree lock`。',
          integration:
            'PR/MR 引用可直接成为基础；`.worktreeinclude` 复制被 Git ignore 的本地文件，使用 `WorktreeCreate` Hook 时不处理该文件（Hook 完全替换默认 git 逻辑，也能把 Worktree 放到 `.claude/worktrees/` 之外，用于 SVN、Perforce、Mercurial）；创建时跳过仓库自己的 filter driver（v2.1.247 起，理由是 filter driver 是 shell 命令）；主检出 `.claude/skills` 的未跟踪内容读通到 Worktree（skills 需 v2.1.277 起，`.claude/agents` 与 `.claude/commands` 同样读通）。',
          artifacts:
            '独立目录、分支、commit 和可选 PR。交互式未命名且干净的 Worktree 连同分支自动删除，命名干净的与仍有工作的都提示用户；`-p` 不提示也不清理，并把创建时加上的 `git worktree lock` 留给后续会话的 stale-lock 清扫释放；Subagent Worktree 无改动自动删除、有改动保留到周期清扫。清扫按 `cleanupPeriodDays` 只处理带 marker 的 Subagent 与后台会话 Worktree，仍有改动或未推送提交、submodule 有改动或无法检查（v2.1.274 起）、命中四种 filter driver 情况、属于未转后台的 `--worktree` 会话、由用户 `git worktree add` 手工创建或缺少 marker 时保留；stream-json 结果用 `startup_failure_reason` 区分 `worktree_unverified` 与 `worktree_resume_refused`（v2.1.274 起）。',
          conditions:
            '需要 Git 仓库（除非用 `WorktreeCreate` Hook 接管）；交互式运行要求已接受 workspace trust，否则 `--worktree` 报错退出，`-p` 跳过该检查；`.claude`、`.claude/worktrees` 或目标 Worktree 目录是符号链接时拒绝创建并点名该路径；建议把 `.claude/worktrees/` 加进 `.gitignore`。',
          sources: ['claude-worktrees', 'claude-tools', 'claude-commands'],
        },
        codex: {
          entry:
            '`codex --worktree`（help 文本 `Run the session in a new managed Git worktree.`，根级与子命令级都接受，合并规则 `*worktree |= *root_worktree`）；被接受的形式为 `codex --worktree`、`codex --worktree <prompt>`、`codex --worktree exec <prompt>`、`codex exec --worktree <prompt>`、`codex fork --worktree <SESSION_ID>`、`codex exec fork --worktree <SESSION_ID>`；TUI 用 `/worktree`（说明文字 `start or continue a conversation in a new worktree`）；`/new` 与 `/fork` 在功能可用时改问 `Where should the new conversation run?`／`Where should the forked conversation run?`，选项为 `Current checkout` 与 `New worktree`（`Create an isolated managed checkout`）。',
          primitives:
            '托管根默认 `$CODEX_HOME/worktrees`，检出落在 `<root>/<4 位十六进制桶>/<仓库名>`；`desktop.git-worktree-root` 可覆盖但必须是绝对路径字符串，否则报 `desktop.git-worktree-root must be an absolute path`，空串回退默认；创建用 `git worktree add --detach --no-checkout <root> <sha>`，随后只写目标检出的 `core.worktree`（经 `git rev-parse --path-format=absolute --git-path config.worktree`）并执行 `git --work-tree=. reset --hard --no-recurse-submodules <sha>`，不改源仓库共享配置、不为其开启 worktreeConfig；线程归属记录写在检出 Git 元数据下的 `codex-thread.json`（`version: 1` + `ownerThreadId`）；macOS 在托管根写 `.metadata_never_index` 关闭 Spotlight 索引。',
          behavior:
            'base 省略时解析 `HEAD^{commit}`，检出为 detached HEAD 且不创建分支；cwd 保留原目录相对仓库根的子路径，子路径不安全时报 `requested base does not contain a safe working directory <path>`；创建中途失败回滚 `git worktree remove --force`，交接阶段失败则保留检出并提示 `A checkout was retained at <path>; remove it with git worktree remove <checkout-path> from the source repository if it is no longer needed.`；`/worktree` 选择器三项为 `Continue current conversation`（`Preserve this conversation in the new checkout`）、`Start new conversation`（`Open a fresh conversation in the new checkout`）、`Browse worktrees`（`Resume an owner thread or copy a working directory`）；浏览器标题 `Managed worktrees`，单项动作 `Resume owner thread`／`Copy working directory`／`Delete worktree`，删除确认写明 `Keeps thread history; may disrupt other sessions`，列表状态标签有 `Archived`、`Owner thread unavailable`、`No attached thread`。',
          scope:
            '限本地会话：远程工作区或远程环境下 `/worktree` 报 `Managed worktrees are only supported for local sessions.`，命令补全也不列出该命令；不在 Git 仓库内报 `Managed worktrees require a local Git repository.`；显式不受信任的来源报 `Cannot create a worktree from an explicitly untrusted source.`，新检出未受信时报 `The new worktree is not trusted; run Codex there.`；Surface 为 CLI 交互 TUI 与 `codex exec`，沿用 Codex Desktop 的分配根与检出契约（`WorktreeManager` 注释 `Creates and identifies worktrees using the existing Codex Desktop contract.`，`WorktreeSettings::for_cli` 注释 `Shares Desktop\'s allocation root while leaving CLI cleanup disabled.`）。',
          background:
            'rust-v0.155.0 起 agents 总览显示 Worktree 归属并支持确认后删除干净的托管 Worktree，rust-v0.156.0 起可从 agent command center 直接创建 Worktree 会话；`/worktree` 的 `available_during_task()` 返回 false，任务运行中不可用；创建要求主会话空闲且无排队输入（`Creating a worktree requires an idle primary session without queued input.`），MCP 清单仍在加载、另一个 agent 正在运行、对话历史未保存或存在后台终端时先被拦下，同一时间只允许一次创建（`A worktree is already being created.`）。',
          integration:
            '不支持的组合逐字报错：`--worktree` 只支持新交互会话、`codex fork`、`codex exec` 与 `codex exec fork`，`login`、`resume`、`archive`、`delete`、`queue` 都被拒；`codex fork --worktree` 与 `codex fork --worktree --last` 报 `codex fork --worktree requires an explicit session ID`；`codex exec resume --worktree` 报 `--worktree cannot resume an existing session; use codex exec fork --worktree`；`codex exec review --worktree` 报 `--worktree is not supported for code review`。归属绑定是原子写入：同一线程重复绑定无副作用，已被其他线程绑定时报 `worktree already belongs to thread <id>`。',
          artifacts:
            '独立检出目录、detached HEAD、`codex-thread.json` 归属记录与被绑定的线程历史。CLI 侧不做自动清理（`for_cli` 把 `auto_cleanup_enabled` 硬编码为 false），`desktop.worktree-auto-cleanup-enabled` 默认 true 与 `desktop.worktree-keep-count` 默认 15 只对 Desktop 生效；手动删除有两道守卫：当前目录在该检出内报 `switch to another checkout before deleting the current worktree`，检出内有被 ignore 的本地文件报 `worktree contains ignored local files; remove them before deleting it`，通过后执行 `git worktree remove` 并删掉空桶目录。',
          conditions:
            '功能开关 key 为 `worktrees`：rust-v0.154.0（2026-09-09）是 `Stage::Experimental`、`default_enabled: false`，需从 `/experimental` 打开并重启（announcement 逐字为 `NEW: Worktrees can now be enabled from /experimental. Restart Codex after enabling it.`）；rust-v0.156.0（2026-09-22）改为 `Stage::Stable`、`default_enabled: true`，`Stage::Stable` 的注释是 `The feature flag is kept for ad-hoc enabling/disabling`，`[features]` 表接受布尔项，`worktrees = false` 走 `Features::disable`；关闭时 `/worktree` 报 `Enable worktrees in your Codex configuration to create a worktree.`。官方 Worktrees 文档页核对时仍只描述桌面 App，未记录 CLI 入口，CLI 结论来自官方 Release 与 rust-v0.159.2（提交 `ff6aec96`）源码；平台条件发布说明未给出，未确认。',
          status: '官方确认',
          sources: [
            'codex-worktrees',
            'codex-v0154-release',
            'codex-v0156-release',
            'codex-worktree-feature-experimental',
            'codex-worktree-feature-stable',
            'codex-worktree-cli-flag',
            'codex-worktree-unsupported',
            'codex-worktree-manager',
            'codex-worktree-settings',
            'codex-worktree-owner',
            'codex-worktree-tui-creation',
            'codex-worktree-picker',
            'codex-slash-command-registry',
          ],
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
            '隔离 Agent 沿默认后台行为运行，清理在 Agent 报告完成时执行，`run_in_background: false` 取内联结果；caller-owned `working_dir` 启动未命名时前台运行、显式后台执行被拒绝，Subagent 定义里的 `background: true` 在顶层被拒绝、嵌套时降级为前台运行；Arena 使用另一套 Worktree 目录。',
          integration:
            '可复用 node_modules 等目录的 symlink；恢复会话用 `<sessionId>.worktree.json` 恢复绑定。Worktree 是独立的会话存储“项目”：`--worktree foo` 启动的会话只出现在该 Worktree 的恢复列表里，不带 `--worktree` 的会话存在主检出下。',
          artifacts:
            'Worktree、分支、sidecar、状态栏标识和可保留的 Agent Diff。',
          conditions:
            'ACP 不接受 `--worktree`，应把 Worktree path 作为 cwd；退出删除受 ownership、dirty 和未合并 commit 三重保护，其他会话删除会被拒并指向 `git worktree remove`。v0.24.7 文档把过期清扫守卫写细：只有 `agent-<7hex>` 形状才是清扫候选（用户恰好取该名字的 Worktree 也会被扫），`enter_worktree` 命名的其他 Worktree 永不清扫；未提交内容按 `git status --porcelain --untracked-files=normal --ignored=matching` 判定，被 ignore 的内容（如 `.env`）同样保留检出，例外只有可丢弃构建产物（被 ignore 条目的首个路径段为 `node_modules`、`dist` 或 `coverage`）、符号链接和 daemon 的 `.qwen-session` 标记（未被跟踪时）；30 天阈值在阈值后的下次 CLI 启动执行，`--debug` 下可 grep `cleanupStaleAgentWorktrees: keeping` 与 `worktreeHasWork: waiving` 查看判定原因。',
          sources: [
            'qwen-worktree-current',
            'qwen-worktree-v0247',
            'qwen-review-current',
          ],
        },
        kimi: {
          entry:
            '2.1.1（提交 `f67e639`）的斜杠命令、Agents、工具与会话文档没有任何创建、切换或清理 Worktree 的入口，Agent 定义也没有 `isolation` 字段；可先 `git worktree add`，再从该目录启动 `kimi`。条件入口：`/tower` 模式下每个 worker 独占 `.tower/worktrees/` 下的一个 git worktree（路径常量 `WORKTREES_DIR`），但 `tower` 是默认关闭的实验标志，官方斜杠命令文档未列出 `/tower`。',
          primitives:
            '标准 Git Worktree 与当前工作目录；tower 模式另有 `.tower/` 工作区（`comms/state.json` 与 `comms/` 下的 inbox、findings、reviews、missions、log）和按身份的写隔离，内部能识别 `.git` 文件形式但那不是用户可调用的管理能力。',
          behavior:
            '从已有 Worktree 启动时，文件与 Bash 自然作用于该 checkout，产品不负责创建分支或清理；tower worker 只能写自己的 worktree，越界写入被拒并返回 `tower workers may only write inside their own worktree (<path>) — denied: …`，该判定按 worker 身份（`tower-worker` profile）而不是功能开关状态。',
          scope:
            '用户选定的启动目录；Subagent 默认共享被分配的工作目录。tower 模式下一个 worker 一个 mission 一个 worktree，`AgentSwarm` 与 tower 模式互斥（同时使用会返回 `AgentSwarm is not available while tower mode is active`）。',
          background:
            '后台 Agent 可以并行，但官方 Agent 文档没有每 Agent Worktree 隔离字段；tower 的并行派生由 `TowerSpawn` 承担。',
          integration:
            '可用自定义 Skill/Plugin 封装 `git worktree`，仍属于用户扩展；tower 的分支合并由 `TowerMerge` 门禁把关。',
          artifacts:
            '由 Git 手工创建的 Worktree 和分支（Kimi 只产生其中的文件修改），或 tower 的 `.tower/worktrees/` 检出、`.tower/comms/` 记录与合并后保留的分支。',
          conditions:
            'tower 结论来自 2.1.1 源码 `packages/agent-core-v2/src/features/tower/`，仅 v2 引擎、需 `tower` 实验标志开启（默认关闭）；官方文档没有描述这些目录，面向用户的 Worktree 管理入口未确认。',
          status: '源码确认',
          sources: [
            'kimi-slash-commands-211',
            'kimi-agents-211',
            'kimi-tower-paths-211',
            'kimi-tower-worktree-guard-211',
          ],
        },
        qoder: {
          entry:
            '`qoder --worktree [name]`（CLI 参考逐字：`Execute in isolation within a new Git Worktree, merging results back to the main branch; the name is optional and auto-generated if omitted.`，示例 `qoder --worktree feature-a`、`qoder --worktree feature-a "Implement login fix"`、`qoder --worktree`）；Parallel Tasks 页补充 `When no name is provided, Qoder automatically generates a worktree name.` 与 `If a worktree with the same name already exists, it is reused directly instead of being recreated.`；Subagent frontmatter `isolation: worktree`（`worktree runs the Subagent in a separate git worktree. Omitted means the default workspace.`）；内置 Skill `batch`（`Spawns parallel working agents in isolated git worktrees to apply bulk changes across multiple files (requires the current directory to be a Git repository).`）。',
          primitives:
            '命名 Worktree 落在 `<repo>/.qoder/worktrees/<sanitized-name>`（Parallel Tasks 页逐字：`New named worktrees are placed under <repo>/.qoder/worktrees/<sanitized-name>, and a corresponding temporary branch is created.`），临时分支按手工清理命令为 `worktree-<processed-name>`（`git branch -d worktree-<processed-name>`）；仓库根 `.worktreeinclude` 声明要复制进干净检出的文件（`To copy files like .env, declare them using .worktreeinclude at the repository root.`），新 Worktree 默认不含未跟踪文件（`A new worktree is a clean checkout and does not include untracked files by default.`）；同名 Worktree 直接复用而不重建。此前引用的 `en/cli/using-cli` 页核对时仍返回 404，`~/.qoder/worktrees/<job-id>` 与 Concurrent Job 布局表述已由 Parallel Tasks 页的仓库内路径取代。',
          behavior:
            '`--worktree` 让本次运行在新 Worktree 中隔离执行，每个任务各自有工作树与分支、互不覆盖（`each task has its own workspace and context, preventing multiple sessions from sharing the same directory and overwriting each other\'s changes.`）；会话结束时打印 Worktree 路径与恢复会话的命令，交互式退出时检查未提交文件与新提交——干净的 Worktree 可自动删除、有本地文件或提交的会提示保留还是删除（`clean worktrees can be automatically deleted, while those with local files or commits will prompt you to choose whether to keep or delete them.`）；Subagent `isolation: worktree` 让该 Agent 在单独 worktree 中运行，干净的 Subagent worktree 完成即自动删除、有改动的保留（`Clean Subagent worktrees are automatically deleted upon completion, while those with changes are retained.`）。合并冲突解决流程官方未描述。',
          scope:
            '当前 Git 仓库：命名 Worktree 放在该仓库的 `.qoder/worktrees/` 下（`batch` Skill 明确要求当前目录是 Git 仓库）；插件提供的 Subagent 会移除 `hooks`、`mcpServers` 与 `permissionMode`，`isolation` 只在取值为 `worktree` 时保留。',
          background:
            '`batch` Skill 并行派发多个 Agent、各自在隔离 worktree 中批量改文件，官方建议一个任务一个 worktree 以避免改动重叠（`One task per worktree`）；`/tasks` 查看正在运行的后台任务；`--worktree` 本身只是单次运行的启动位置，官方未给出数值并发上限。',
          integration:
            'CLI 参考写 `merging results back to the main branch`，但 Parallel Tasks 页把并回描述为手工动作——完成后可分别提交或合并（`Once completed, they can be committed or merged separately.`），并在任务完成合并后删除多余 worktree 与临时分支（`Delete unnecessary worktrees and temporary branches after tasks are completed and merged to keep the repository tidy.`）；官方未记录自动合并使用的 Git 命令、主分支解析方式、推送与开 PR 行为。',
          artifacts:
            'Worktree 目录 `<repo>/.qoder/worktrees/<sanitized-name>`、临时分支 `worktree-<processed-name>`、自动生成的名字与其中改动；手工清理命令为 `git worktree remove <worktree-path>` 与 `git branch -d worktree-<processed-name>`。',
          conditions:
            '现行 CLI 参考的可执行名是 `qoder`，子命令表为 `mcp`、`plugins`（别名 `plugin`）、`skills`（别名 `skill`）、`hooks`（别名 `hook`）、`agents`（别名 `agent`）、`login`、`commit`、`rollback`、`update`、`remote-control`、`status`、`feedback`、`wiki`，不含 `jobs`、`rm`、`worktree` 或 `parallel-tasks`；此前记录的 `qodercli jobs --worktree` 与 `qodercli rm <job-id>` 在现行文档中无对应命令。',
          sources: ['qoder-cli-reference', 'qoder-parallel-tasks', 'qoder-agents', 'qoder-builtins-reference'],
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

    'execution-code-mode': createDetail({
      id: 'execution-code-mode',
      definition:
        '模型不再逐个发起工具调用，而是写一段代码交给产品在受控运行时里执行，代码内部通过注入的绑定发起多个嵌套工具调用，只有显式返回的内容回到模型上下文。',
      includes: [
        '开启代码模式的开关、环境变量或配置键，以及它们可写的位置',
        '承载代码的工具名、代码语言与运行时的隔离方式',
        '代码里可用的全局对象、助手函数与嵌套工具绑定规则',
        '嵌套调用的权限、Hook、并发、超时与输出边界',
        '长任务、后台执行、跨调用状态与会话恢复的限制',
      ],
      excludes: [
        '未开启代码模式时模型直接发起的普通工具调用',
        'Shell 工具自身的命令执行、超时与后台进程管理',
        '工具声明延迟与按需发现机制本身，本字段只记它与代码模式的衔接',
        '沙箱、审批模式与工具白名单的总体边界',
      ],
      facts: [
        '五家里四家已有代码模式，只有 Kimi Code 没有：Claude Code、Codex 与 Qwen Code 都有一手资料确认的开关、专用工具与隔离运行时，Qoder CLI 由官方更新日志宣布但文档站没有对应页面，Kimi Code 的中英文工具文档、配置参考与更新日志都查不到该机制。',
        '有代码模式的四家全部默认关闭并标为实验性或开发中：Claude 写 “experimental and off by default”，Codex 的 `code_mode` 是 `Stage::UnderDevelopment` 且 `default_enabled: false`、官方配置参考写 “This feature is under development and off by default.”，Qwen 的设置 label 是 “Code Mode Only (Experimental)” 且默认 `false`，Qoder 需要环境变量加设置面板两步开启。',
        '承载代码的工具名不统一：Claude 是 `REPL`（只在 Code Mode 专页的 Hook matcher 与故障表里出现，官方工具参考页没有独立条目），Codex 与 Qwen 都是 `exec`（Codex 另有配套的 `wait`），Qoder 未公布。',
        '运行时与隔离方式分三种，且都强调没有 Node 环境：Codex 在独立宿主进程 `codex-code-mode-host` 里为每次 `exec` 新建 V8 isolate（可按 gRPC 连远程宿主），描述写 “no Node, no file system, no network access, no console”，宿主还主动删掉 `console`、`Atomics`、`SharedArrayBuffer` 与 `WebAssembly`；Qwen 在专用子进程里跑编译成 WASM 的 QuickJS、每次调用新建 runtime 与 context，写 “There is no Node.js, process, require, filesystem, network, import, console, WebAssembly, Atomics, or persistent state.”；Claude 只写 “Claude Code runs that code in your session”，没有公布引擎与隔离层级。',
        '三家都写明嵌套调用不绕过权限，但审批粒度不同：Claude 在 auto mode 下由分类器“审代码而不是审每个工具调用”、看不到运行时算出来的值，其余权限模式逐个调用照常提示；Codex 的 Hook 决策逐条作用到嵌套调用，`PreToolUse` 阻断会让工具 promise 在运行前 reject；Qwen 的嵌套调用重新进入 `Session.runTool` 或 Core 调度器，沿用同一套校验、权限、确认、Hook、遥测与截断路径。',
        '跨调用的持久状态只有 Codex 提供：`store(key, value)` 与 `load(key)` 在同一会话的后续 `exec` 之间保留可序列化值；Qwen 的设计文档把 “Persistent cells, globals, or values between `exec` calls” 与 “Background jobs, `wait`, `yield`, `store`, or `load`” 明确列为 Non-goals；Claude 没有公布同类助手。',
        '长任务的口径三家完全不同：Claude 是等待模式下代码十分钟后停止（含在权限提示上花的时间）、后台模式最多两小时但必须以 auto 或 `bypassPermissions` 模式启动；Codex 是 `exec` 到点先 yield 并返回 cell ID，模型再用 `wait` 按 `cell_id` 续取输出，`yield_control()` 还能在脚本继续跑时立刻交出已积累输出；Qwen 是 `CODE_MODE_TIMEOUT_MS = 30_000` 加 QuickJS interrupt handler 实施的 guest CPU 预算，没有 yield 或后台机制。',
        '未 await 的调用一律被丢弃或取消，且两家都有对应测试：Codex 写 “When the JS code is fully evaluated, the isolate\'s lifetime ends and unawaited promises are silently discarded.”，Qwen 写 “Await every tool promise; unawaited calls are cancelled when the script finishes.”，其 unawaited-timer 测试在 2026-11-15 把 guest 预算从 25 毫秒调到 5 秒以消除 CI 抖动，该改动随 Qwen v0.28.0（2026-11-17 发布）进入稳定通道，是 v0.28.0 里唯一一条 Code Mode 相关条目。',
        '与工具延迟发现的衔接方式不同：Qwen 在搜索可用时从 `exec` 描述里省略延迟工具的签名与描述、要求模型先在顶层调用 `tool_search`，搜索不可用时才把全部允许工具的签名塞进 `exec`；Codex 用独立开关 `code_mode_tool_search`（开发中、默认关闭）决定代码里是否有 `tools.tool_search({query, limit: 8})` 的 BM25 发现；Claude 没有公布代码模式下的工具发现路径。',
        '开启入口的可写位置各有边界：Claude 只认 shell、用户设置与 `--settings` 文件，项目与本地设置里的该变量被忽略，managed settings 只能写 `0` 封禁而不能替用户打开；Codex 与 Qwen 走各自的配置文件（Qwen 另需重启，且在 safe 与 bare 模式下被忽略）；Qoder 需要环境变量与 `/settings` 面板选择同时成立。',
        '与多 Agent 编排的组合只有 Claude 给出了明确口径：v2.1.326 起 Code Mode 可以与 agent teams 同时开启，但 teammate 是否跑在 Code Mode 里取决于 agent teams 的显示模式——默认的 in-process 模式下 teammate 进 Code Mode，改成 split panes（`teammateMode` 设 `auto` 并在 tmux 或 iTerm2 里启动）后 teammate 不带 Code Mode 启动，故障表把这种情况归到 `it doesn\'t work in background jobs` 一行；Codex、Qwen 与 Qoder 都没有公布代码模式在各自 Subagent 或后台任务里是否生效。',
      ],
      products: {
        claude: {
          entry:
            '把 `CLAUDE_CODE_EXPERIMENTAL_CODE_MODE` 设为 `1`，可写在 shell、`~/.claude/settings.json` 的 `env` 块或 `--settings` 文件里（官方给出 `CLAUDE_CODE_EXPERIMENTAL_CODE_MODE=1 claude`、PowerShell 的 `$env:CLAUDE_CODE_EXPERIMENTAL_CODE_MODE = "1"` 与 settings.json 三种写法）；首次使用要确认 “Yes, turn on Code Mode”，Claude Code 重启后在会话顶部显示 “Code Mode (experimental) is on · this session can be resumed only with Code Mode on”；关闭是删掉该变量或在任一处改成 `0`；组织级封禁是在 managed settings 里写 `0`，已在会话中的用户要退出或重启才生效。',
          primitives:
            '承载代码的工具是 `REPL`——官方写要检查代码本身就得写一个匹配 `REPL` 的 `PreToolUse` Hook，并从 `tool_input.code` 读 JavaScript；官方工具参考页没有 `REPL` 的独立条目，该工具名只在 Code Mode 专页出现。给模型看的是工具调用而不是代码：“In the conversation, you see the tool calls, such as the edit\'s diff, and not the code. To read the code, press `Ctrl+O` to open the transcript viewer. Each piece of code appears there as a collapsed **Code** row, with a hint for how to expand it.”官方示例代码是 `const files = await $`rg -l "function retryPolicy" src`.text();` 接 `await edit(target, "maxAttempts: 3", "maxAttempts: 5");`，最后一行 `({ edited: target, tests: $`npm test -- retryPolicy`.nothrow() });` 把文件路径与测试输出返回给 Claude。',
          behavior:
            '一段代码可以并行跑命令、把上一个结果用于下一个调用，并只返回 Claude 需要读的那部分输出；官方建议用于「同一改动要重复很多文件」「搜索结果需要先过滤再给模型读」「多条互不依赖的命令可以同时跑」三类任务。权限侧逐字为 “Each tool call that Claude\'s code makes goes through your `deny` and `ask` permission rules and your `PreToolUse` hooks. You don\'t need to change a rule or matcher for a tool such as `Bash`.”；auto mode 下 “the classifier reviews each piece of code before it runs, not each tool call. It doesn\'t see values computed at run time, such as a path taken from search output, so keep rules or hooks for calls you must control.”，其他权限模式下 “the code starts without a review, and you\'re prompted for each tool call that would prompt you in that mode”。auto mode 里旧代码还在跑时又起新代码，旧代码会失去分类器审查，此时对剩余需要审查的调用给出带倒计时的提示 “Claude Code will automatically block this request in 1:59, to avoid holding up an unattended session”，倒计时结束即拒绝该调用、之后同类调用不再提示直接拒绝，给 Claude 发一条消息才能恢复提示。官方同时提醒 Bash 规则匹配的是命令文本，因此 Claude 可以用规则匹配不到的形式跑被禁命令，这与是否开启 Code Mode 无关。',
          scope:
            '只覆盖终端里的交互式 `claude` 会话：Requirements 逐字为 “an interactive `claude` session in a terminal. Code Mode doesn\'t work with `-p`, the Agent SDK, the VS Code panel, the Desktop app, or cloud sessions”，并另需原生构建（native build），Windows 上还要求已安装 Git for Windows。与 agent teams 的组合自 v2.1.326 起成立，Requirements 新增的 **Agent teams** 项逐字为 “to use Code Mode with agent teams on, you need v2.1.326 or later. Teammates run in Code Mode in the default in-process display mode, and start without it in split panes”：teammate 跑不跑 Code Mode 取决于 agent teams 的显示模式，默认的 in-process（“all teammates run inside your main terminal”）会带上 Code Mode，split panes（“each teammate gets its own pane”，需要 tmux 或 iTerm2）里的 teammate 不带 Code Mode 启动；显示模式由 `teammateMode` 决定，Settings reference 给出四个取值 `"in-process"`（默认）、`"auto"`（在 tmux 里、或在 `PATH` 有 `it2` 或装了 tmux 的 iTerm2 里开 split panes，否则 in-process）、`"tmux"` 与 `"iterm2"`，作用域是 Any file 且另读旧版留在 `~/.claude.json` 里的值，单次会话可用 `--teammate-mode` 覆盖。故障表把 split-pane teammate 这种情况归到 `it doesn\'t work in background jobs` 一行，处理办法是 “If the reason shows in a teammate\'s split pane, use the in-process display mode to run teammates in Code Mode”；Agent teams 专页对 `code mode` 的命中数为 0，官方没有解释 split-pane teammate 为什么起不来，「因为它被当作后台任务」这层因果记为未确认。',
          background:
            '分等待与后台两种：等待时 “Claude answers after the code finishes, and the code stops after ten minutes, including time you spend at permission prompts”；后台时 “you can keep talking to Claude, and the code can run for up to two hours”，但必须以 auto 或 `bypassPermissions` 模式启动会话。若 Claude 仍在等待，官方给三种排查：切到了别的模式（按 `Shift+Tab` 切回启动时的模式）、启动时就不是该模式或从 `claude --resume` 列表里挑了会话（退出后带 Code Mode 重跑 `claude --continue --permission-mode auto`）、给 `--tools` 传了工具名（不带该旗标在 auto mode 下重启）。',
          integration:
            'Hook 行为在代码模式下有两处专门变化。其一，`PreToolUse` 不给决定就拒绝调用，即使没有设 `onFailure`：从 Claude 代码发起的调用，Hook 启动不了、被杀、退出码 126／127／大于 128、返回 HTTP 错误或非法输出都算 “the hook failed”，超时算 “the hook did not finish”（后者在 Claude 跑过代码之后对任何工具调用都适用），要放行需在该 Hook 上设 `"onFailure": "continue"`，而 `command` Hook 以 1 一类普通退出码结束时调用照常放行、除非显式设 `"onFailure": "block"`。其二，代码能后台跑时，`UserPromptSubmit` 上的 `command`、`http` 与 `mcp_tool` Hook 也会在代码输出上运行，若 Hook 的阻断原因出现在本该是代码输出的位置，官方让改 Hook 使其在输入的 `source` 为 `poll_event` 时不阻断；Hooks reference 里 `decision` 的 `reason` 字段也注明 “Not added to context, except when the hook blocks Code Mode output”。官方另在 2026-11-17 的页面上明确要求 Shell 类 Hook 自己拆复合命令，逐字为 “If you have a `PreToolUse` hook that allows or blocks shell commands, make it check each part of a command, as Bash rules do. In Code Mode, a `git push` in a folder named `app` can reach your hook as `cd \'app\' && git push`.”，即代码模式会把带 `cd` 前缀的复合命令原样交给 Hook，只匹配尾部命令名的 Hook 会漏判。',
          artifacts:
            '代码本身不进对话，只在 transcript viewer 的折叠 **Code** 行里；产物就是嵌套工具调用的常规结果（如 Edit 的 diff）。会话侧有硬性限制：“you can resume a Code Mode session only in the terminal, with Code Mode on”，恢复时必须仍带着 `CLAUDE_CODE_EXPERIMENTAL_CODE_MODE=1`，否则 Claude Code 拒绝恢复；不带 Code Mode 启动的会话即使设了变量也按不带 Code Mode 恢复；不能把会话移到桌面 App、不能变成后台会话，`/fork` 也不能开后台副本；Remote Control、Claude in Chrome 与 computer use 在代码模式下不可用。',
          conditions:
            '版本要 v2.1.323 或更新（两个 release channel 都可以；更旧的版本会不带 Code Mode 启动，原因可能写 “it isn\'t open to your account yet”），要与 agent teams 同开则另需 v2.1.326 或更新；账号要 Claude 订阅或 Console 账号，官方 code-mode 专页 Requirements 的 “Account” 项在 2026-11-24 复核时仍逐字把 gateway、Amazon Bedrock、Claude Platform on AWS、Google Cloud\'s Agent Platform、Microsoft Foundry 与 Claude Models on Google Cloud (Anthropic managed) 全部列为不可用，但 v2.1.331 更新日志（2026-11-23T21:34:41Z 发布，固定到 `CHANGELOG.md` 提交 `bd07f2a121a9d16f2b00b209bbdf50c1bc46fb91`）逐字为 “Added Code Mode support in terminal sessions on Amazon Bedrock, Google Cloud\'s Agent Platform, Microsoft Foundry and Claude Platform on AWS”，即其中四家云 Provider 改为在终端会话中可用而官方文档 Requirements 段尚未同步，该 Added 措辞限定 “in terminal sessions”、没有提到 gateway 与 Claude Models on Google Cloud (Anthropic managed)，两者是否随之放开记为未确认，四家云 Provider 是否仍要求原生构建与订阅或 Console 之外的其他前提官方也未单独说明；组织不能启用 HIPAA 配置或 zero data retention；模型必须是 Claude Opus 5.5、Sonnet 5.5、Haiku 5.5 或 Fable 5.2；必须是原生构建的交互式终端会话。变量可写位置有边界：“You can turn on Code Mode with `CLAUDE_CODE_EXPERIMENTAL_CODE_MODE` from your shell, user settings, or a `--settings` file, and not from managed, project, or local settings. With a `0` in any of the first three or in managed settings, Code Mode stays off whatever you set elsewhere. When managed settings contain a `1`, set your own `1` in user settings, because a `1` in your shell is ignored.”该功能还需要会话获取 feature flags，因此 `DISABLE_TELEMETRY` 一类关闭 flag fetching 的变量会让它起不来。启动失败时顶部显示 “`Code Mode (experimental) isn\'t available`” 加原因、`/status` 同样显示，官方原因表在 2026-11-17 的页面上是 13 行（11-15 为 11 行），除账号与 API 两行外还包含 `apiKeyHelper`／`ANTHROPIC_AUTH_TOKEN`／`ANTHROPIC_CUSTOM_HEADERS` 里的 `Authorization` 或 `X-Api-Key`、模型过旧、后台任务（含 split-pane teammate）、缺少 Anthropic 下发的设置、OpenTelemetry 导出（`CLAUDE_CODE_ENABLE_TELEMETRY`、`ENABLE_BETA_TRACING_DETAILED`）、**插件**（11-17 新增行，处理办法是在会话里跑 `/plugin` 逐个禁用原因点名的插件，组织开启的要找管理员关）、检查工具调用的 mod、agent teams（`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS`；11-17 起处理办法改为「想留着 agent teams 就升级到 v2.1.326 或更新，想留在当前版本就取消该变量」）、`--restricted`、`--tools` 未含 `REPL`、`--disallowedTools` 或 `deny` 规则里含 `REPL`、`~/.claude.json` 不可写与组织 managed setting。发布记录方面，v2.1.323 的更新日志逐字为 “Added Code Mode, an experimental opt-in in which Claude writes JavaScript to call its tools; see https://code.claude.com/docs/en/code-mode to turn it on, or to turn it off for an organization”；v2.1.325 有三条修复（脚本忽略 `EnterWorktree` 进入的 worktree、把 `~` 路径写进项目、`/mcp` 在签入过期后仍显示已连接；在权限对话框或计划批准时按 Yes 输入的词没有送达 Claude；恢复一个在 Code Mode 脚本中结束的会话时 Claude 自行开工）；最新段 v2.1.326（2026-11-16T22:11:05Z 发布，更新日志固定到 tag 提交 `bc1e8a88cb447f43697e848d991efed6cac2a64c`）有七条 Code Mode 条目——一条 Added 即 agent teams 支持 “Added support for turning on Code Mode while agent teams are enabled; if you already turned it on, sessions with teams on now start in Code Mode”，三条 Fixed 分别是 auto mode 下带内联 `!` 命令的 Skill 需要审批时 Skill 与 Slash 命令加载失败、后台 Subagent 预载这类 Skill 时失败、mods 在 Code Mode 下无法用 `$.tool.call` 与 `$.tool.check` 调 Bash／Read 等工具，两条 Improved 是 “Improved permission checks in Code Mode; more sandboxed commands now ask or are refused” 与 “Improved the messages shown when Code Mode can\'t be turned on, so they say what you can do”，一条 Changed 是 “Changed Code Mode\'s `$` shell helper to refuse some values with an error; nothing runs”；后三条官方都没有给出受影响的取值、命令形状或沙箱规则细节，具体范围记为未确认。最新段 v2.1.331（2026-11-23T21:34:41Z 发布，更新日志固定到提交 `bd07f2a121a9d16f2b00b209bbdf50c1bc46fb91`）共六条 Code Mode 条目：一条 Added 即上述四家云 Provider 的终端会话可用性，四条 Fixed 分别是经 `--resume`/`--continue` 在另一权限模式恢复时丢失 thinking 与 prompt cache（在会询问的模式里开始的会话恢复后保留该模式对脚本的限制）、脚本运行时键入 `!` 或 slash 命令导致每秒约发一次请求、长脚本输出中段丢失改为给 Claude 一个未截断文本的路径（issue #111373）、`--bare` 下不告知 Claude 其脚本能调用什么，一条 Improved 是 “Improved Code Mode tool search to show more of an MCP tool\'s description, with its limits, formats and defaults”；四条 Fixed 与一条 Improved 都属缺陷修复与展示改进，不改变入口、工具名或运行时。',
          status: '条件项',
          sources: [
            'claude-code-mode-doc',
            'claude-code-mode-llms-index',
            'claude-code-mode-v21331-changelog',
            'claude-code-mode-env-var',
            'claude-code-mode-feature-flags',
            'claude-code-mode-settings-scope',
            'claude-code-mode-auto-mode',
            'claude-code-mode-hooks',
            'claude-code-mode-changelog',
            'claude-agent-teams-display-mode',
            'claude-teammate-mode-setting',
          ],
        },
        codex: {
          entry:
            '`config.toml` 的 `[features.code_mode]` 表里写 `enabled = true`（官方手册的示例同时给出 `excluded_tool_namespaces = ["mcp__codex_apps"]` 与 `direct_only_tool_namespaces = ["mcp__history"]`），`features.code_mode` 也接受布尔写法；`features.code_mode_only` 把模型可见工具收缩到代码模式入口 `exec` 与 `wait`，源码注释逐字为 “Restrict model-visible tools to code mode entrypoints (`exec`, `wait`).”，`normalize_dependencies()` 里写着开了 `code_mode_only` 会自动开 `code_mode`；另有开发中且默认关闭的 `code_mode_tool_search`（“Expose ranked tool discovery inside JavaScript code mode.”）与 `code_mode_only_strict_3p_tools`（“Keep eligible MCP/app and dynamic tools deferred in exec, only in Code Mode Only. Ignores deferLoading, omit_tools_from, and namespace skip settings.”）、`code_mode_prewarm`，Stable 且默认开启的 `code_mode_host`、`code_mode_host_grpc`、`code_mode_host_output_truncation` 与 `code_mode_interrupt`，以及已移除只作兼容的 `code_mode_buffered_exec` 与 `code_mode_tool_description_first`。app-server 侧另有旗标 `codex app-server --code-mode-host https://code-mode.example.com`，官方写它 “Share an outbound HTTP/2 gRPC connection to a remote Code Mode host across threads.”。',
          primitives:
            '模型可见两个工具。`exec` 由 `create_code_mode_tool()` 声明为 `ToolSpec::Freeform`，名字取 `codex_code_mode::PUBLIC_TOOL_NAME`（逐字 `pub const PUBLIC_TOOL_NAME: &str = "exec";`），格式是 `{ type: "grammar", syntax: "lark", definition: … }`，语法允许纯源码或首行 pragma（`PRAGMA_LINE: /[ \\t]*\\/\\/ @exec:[^\\r\\n]*/`），即收原始 JavaScript 文本而不是 JSON 参数；`wait` 由 `create_wait_tool()` 声明为普通 Function 工具（`WAIT_TOOL_NAME` 逐字为 `"wait"`），参数是必填的 `cell_id`（“Identifier of the running exec cell.”）、`yield_time_ms`（“Wait before yielding more output. Defaults to 10000 ms.”）、`max_tokens`（“Output token budget for this wait call. Defaults to 10000 tokens.”）与 `terminate`（“True stops the running exec cell; false or omitted waits for output.”）。嵌套工具挂在全局 `tools` 对象上、名字规范化成 JavaScript 标识符（描述里的例子是 `await tools.exec_command(...)` 与 `await tools.mcp__ologs__get_profile(...)`），元数据在 `ALL_TOOLS`；助手清单为 `exit()`、`text(value)`、`image(...)`、`audio(...)`、`generatedImage(result: { image_url: string; output_hint?: string })`、`store(key, value)`、`load(key)`、`notify(value)`、`setTimeout`／`clearTimeout` 与 `yield_control()`，宿主在 `install_globals()` 里先删掉 `console`、`Atomics`、`SharedArrayBuffer`、`WebAssembly`，再编译运行内置的 `settled.js` 与 `content.js`。',
          behavior:
            '`exec` 描述首行逐字为 “Run JavaScript code to orchestrate/compose tool calls”，要点包括 “Evaluates the provided JavaScript code in a fresh V8 isolate as an async module.”、“Nested tool methods take either a string or an object as their input argument.”、“Runs raw JavaScript -- no Node, no file system, no network access, no console.”、“Accepts raw JavaScript source text, not JSON, quoted strings, or markdown code fences.” 与 “When the JS code is fully evaluated, the isolate\'s lifetime ends and unawaited promises are silently discarded.”；pragma 示例是 `// @exec: {"yield_time_ms": 10000, "max_output_tokens": 1000}`，`max_output_tokens` 的默认值写死为 10000 token。运行时用 V8：`initialize_v8()` 的注释逐字为 “Initializes the process-wide V8 platform with the requested JIT mode. … V8 cannot change JIT mode after initialization, so a later call requesting a different mode returns an error. Code mode initializes V8 with JIT enabled by default when this function has not been called explicitly.”，`V8JitMode::Disabled` 时加 `--jitless`，初始化还会因 pinned V8 的 `Array.prototype.sort` 内联问题设 `--no-maglev --no-turbolev --no-turbo-inline-array-builtins`。三个协议默认值是 `DEFAULT_EXEC_YIELD_TIME_MS = 10_000`、`DEFAULT_WAIT_YIELD_TIME_MS = 10_000`、`DEFAULT_MAX_OUTPUT_TOKENS_PER_EXEC_CALL = 10_000`，而配置项 `default_exec_yield_time_ms` 的默认值是 `DEFAULT_CODE_MODE_EXEC_YIELD_TIME_MS = 30_000`，`CodeModeService::execute()` 在请求未带 `yield_time_ms` 时用后者补上；`tool_input_schema_max_bytes` 的 schema 描述逐字为 “Maximum UTF-8 bytes per rendered tool input type, with a 16,000-byte minimum and default. For ordinary MCP tools, this is also at least their server\'s explicitly configured input limit.”；`exec` 不能递归调用自己（源码里返回 “exec cannot invoke itself”）。',
          scope:
            '工具注册在 `codex-rs/core` 的会话里，因此终端会话与 app-server 会话都能用——TUI 快照测试 `codex_tui__chatwidget__tests__status_and_layout__unsupported_code_mode_warning.snap` 逐字渲染出 “⚠ Code Mode is enabled in configuration, but model `gpt-5.4` does not advertise Code Mode support.”，证明告警出现在终端界面而不只是日志；app-server 默认起本地 Code Mode 宿主，官方写 “By default, app-server starts a local Code Mode host. To share a remote host across threads in the same app-server process, pass the remote host\'s HTTP/2 gRPC endpoint to `--code-mode-host`.”，并要求远程宿主用 HTTPS（“Use HTTP only on loopback or through a secure tunnel.”）。工具暴露面按命名空间配置：`apps..omit_tools_from` 与 `mcp_servers..omit_tools_from` 都接受 `direct`／`deferred`／`code_mode` 三个取值，schema 里 `code_mode` 的描述逐字为 “Nested tools available to Code Mode scripts.”，`features.code_mode.excluded_tool_namespaces` 与 `direct_only_tool_namespaces` 则按命名空间整体排除或强制直接调用。',
          background:
            '长脚本靠 yield 加 `wait` 续接：`wait` 的描述逐字为 “Use `wait` only after `exec` returns `Script running with cell ID ...`.”、“`wait` returns only the new output since the last yield, or the final completion or termination result for that cell.”、“If the cell is still running, `wait` may yield again with the same `cell_id`.” 与 “If the cell has already finished, `wait` returns the completed result and closes the cell.”；脚本内部可用 `yield_control()` “yields the accumulated output to the model immediately while the script keeps running”，`notify(value)` 则 “immediately injects an extra `custom_tool_call_output` for the current `exec` call”。`store(key, value)` 与 `load(key)` 让可序列化值在同一会话的后续 `exec` 调用之间保留。中断侧有 Stable 且默认开启的 `code_mode_interrupt`（“Terminate active code mode cells when their turn is interrupted.”），`CodeModeService::interrupt_active_cells()` 逐个终止活动 cell；`[code_mode] heartbeat_interval_s` 的 schema 描述逐字为 “Idle seconds between gRPC stream heartbeats. Zero (the default) disables them.”；`setTimeout` 的说明写 “Pending timeouts do not keep `exec` alive by themselves; await an explicit promise if you need to wait for one.”。',
          integration:
            'Hook 决策作用到嵌套调用，官方 “Tool calls from code mode” 小节逐字为 “When a model uses code mode to call a tool from JavaScript, hook decisions apply to that nested call. `PreToolUse` can stop the tool before it runs or rewrite its input. A blocking `PostToolUse` can\'t undo the tool\'s side effects, but it can keep the original result from reaching the running script.”，四行对照为：`PreToolUse` blocks → “The tool promise rejects before the tool runs.”；`PreToolUse` returns `updatedInput` → “The tool runs with the rewritten input and the promise resolves with that result.”；`PostToolUse` returns `decision: "block"` or exits with code `2` → “The tool runs, then the promise rejects with the hook reason.”；`PostToolUse` returns `continue: false` → “Codex uses the hook feedback for the model-visible result, but doesn\'t reject the nested tool promise.”。工具发现侧有 `TOOL_SEARCH_GUIDANCE` 逐字为 “Use `await tools.tool_search({query: "...", limit: 8})` for BM25-ranked discovery of deferred tools (up to `limit` matches; 8 by default). It returns `{tools: [{name, description}]}` with callable names and full TypeScript declarations.”，未开启该开关时改用 `DEFERRED_NESTED_TOOLS_GUIDANCE`：“Some deferred nested tools may be omitted from this description. They are still available on the global `tools` object and listed in `ALL_TOOLS`.” 加 “Tool availability can change between calls.”；多 Agent 侧有 `multi_agent_v2.non_code_mode_only`（默认 `true`）把多 Agent 工具面与 code-mode-only 分开。',
          artifacts:
            '代码与输出不额外落盘，产物是 `text()`／`content()`／`image()`／`audio()`／`generatedImage()` 显式追加的内容项；`generatedImage` 只接受 `{ image_url, output_hint? }` 形状且官方写 “HTTP(S) URLs are not supported.”。诊断侧有 `experimental_show_cell_overhead`，schema 描述逐字为 “Show handler duration, code-mode host duration, and harness overhead in each code-mode cell response. Experimental: this option and the response format may change or be removed.”；输出截断在宿主侧完成后再送给 Core（`code_mode_host_output_truncation`，注释 “Truncate output in the process-owned code-mode host before sending it to Core.”，rust-v0.167.0 加开关、rust-v0.169.0 起默认启用），gRPC 响应自 rust-v0.166.0 起用 zstd 压缩。',
          conditions:
            '官方配置参考对 `features.code_mode.enabled` 的描述逐字为 “Enable code mode feature configuration. This feature is under development and off by default.”，`features.code_mode.excluded_tool_namespaces` 为 “Tool namespaces code mode excludes from nested code-mode tool guidance and executor exposure.”，`features.code_mode.direct_only_tool_namespaces` 为 “Tool namespaces code mode can use only through direct tool calls.”（schema 里更细：“Exact tool namespaces to expose only as direct model tools. These tools bypass deferral, remain top-level in code-mode-only sessions, and are omitted from the nested code-mode tool surface.”）。模型必须在元数据里声明支持：`unsupported_code_mode_warning()` 只在 `Feature::CodeMode` 或 `Feature::CodeModeOnly` 开启、`model_info.tool_mode.is_none()` 且 `model_info.origin != ModelOrigin::Synthetic` 时返回 “Code Mode is enabled in configuration, but model `{model}` does not advertise Code Mode support. This may degrade model performance. Disable `features.code_mode` and `features.code_mode_only`, or select a model whose metadata enables Code Mode.”。宿主不可用时按 `ToolMode` 分流，`Direct` 是 “Falling back to direct tools”、`CodeMode` 与 `CodeModeOnly` 是 “Code mode will fail closed”，完整文案为 “Code Mode is unavailable because {error}. {behavior}; enable `features.code_mode_host` and install `codex-code-mode-host`.”，`[features.code_mode_host] disable_in_process_fallback`（“Keep code mode fail-closed when the standalone host is unavailable.”）可让它不回落到进程内。文档覆盖有限：Configuration reference 只列了 `features.code_mode` 的三个键与两处 `omit_tools_from`、`tool_input_schema_max_bytes` 的说明，合并手册给了示例配置、`--code-mode-host` 旗标、“Connect a remote Code Mode host” 一节与 Hook 对照表，没有 Code Mode 专页；`features.code_mode_only`、`code_mode_host` 等键与顶层 `[code_mode]`（描述 “Code Mode session settings.”）只出现在源码与 `config.schema.json` 里。时间线为 rust-v0.114.0（2026-03-11T00:28:42Z）“Added an experimental code mode for more isolated coding workflows. (#13418)” → rust-v0.115.0（2026-03-16）把文件移到 `tools/code_mode`、加默认 yield 超时与 `tools` 全局 → rust-v0.166.0（2026-10-29）加 zstd、截断协议契约与进程指标采样 → rust-v0.167.0（2026-11-06）加有界输出收集与宿主截断开关 → rust-v0.168.0（2026-11-13）两度调整 Code Mode Only 的第三方工具延迟并提高共享宿主容量 → rust-v0.169.0（2026-11-13）把 gRPC 连接生命周期绑到活动会话、默认启用截断、支持增量工具定义与模型覆盖。2026-11-17 复核：官方配置参考涨到 154,596 字节（11-15 为 152,782 字节），但 `features.code_mode.*` 三个键的描述逐字未变、仍是 “under development and off by default”；仓库 tag 列表在 `rust-v0.169.0` 之后只有 `rust-v0.170.0-alpha.1` 至 `alpha.4.1` 与 `rust-v0.171.0-alpha.1` 至 `alpha.12`，没有任何新的非 alpha tag，因此 rust-v0.169.0 在核对日期仍是最新非 alpha Release；main 分支 `CHANGELOG.md` 的 `## Unreleased` 段只有一条 unified exec 生命周期事件修复，不含 code mode 条目。',
          status: '条件项',
          sources: [
            'codex-code-mode-config-reference',
            'codex-code-mode-manual',
            'codex-code-mode-developer-commands',
            'codex-code-mode-description-source',
            'codex-code-mode-protocol-source',
            'codex-code-mode-runtime-constants',
            'codex-code-mode-features-source',
            'codex-code-mode-config-source',
            'codex-code-mode-schema',
            'codex-code-mode-v8-source',
            'codex-code-mode-globals-source',
            'codex-code-mode-tool-source',
            'codex-code-mode-exec-spec',
            'codex-code-mode-wait-spec',
            'codex-code-mode-warning-source',
            'codex-code-mode-tui-warning-snapshot',
            'codex-code-mode-host-cargo',
            'codex-v0114-release',
            'codex-v0115-release',
            'codex-v0166-release-code-mode',
            'codex-v0167-release',
            'codex-v0168-release',
            'codex-v0169-release',
          ],
        },
        qwen: {
          entry:
            '`tools.codeModeOnly`（boolean，默认 `false`，`requiresRestart: true`，`category: \'Tools\'`，`showInDialog: true`，label 逐字为 “Code Mode Only (Experimental)”），官方设置文档写 “Set `tools.codeModeOnly` to `true` to enable experimental Code Mode with lazy tool discovery. It defaults to `false` and requires a restart.”；配套键 `tools.freeform`（boolean，默认 `false`，`showInDialog: false`，label “Freeform Tool Input (Experimental)”）让 `exec` 在 OpenAI Responses 模型上改用原始文本入参，官方写它 “takes effect only when `tools.codeModeOnly` is also `true` and the selected model uses `wireApi: \"responses\"`”，且 “This setting is intentionally hidden from the Settings dialog; edit it in the settings file.”。设计文档说明 `exec` 只在设置开启时注册，因此关掉设置同时把它从诊断与注册表列表里移除；回滚就是设回 `false`，“No session migration or registry cleanup is required because code mode has no persistent state and the ordinary registry was never replaced.”。',
          primitives:
            '唯一入口工具是 `exec`（`ToolNames.EXEC` 逐字为 `EXEC: \'exec\'`，显示名 `Exec`），描述首行逐字为 “Execute JavaScript in a fresh isolated runtime and wait for it to finish.”；全局清单是 `tools`（“all registered code-mode-callable tool functions permitted in this context, including deferred tools”）、`ALL_TOOLS`（“frozen metadata for every function in tools”）、`text(value)`、`image(imageUrlOrItem: string | ImageContent)`、`audio(dataUrl: string)`、`generatedImage(result: CodeModeToolResult)`、`setTimeout(callback, delayMs?)`、`clearTimeout(timeoutId?)` 与 `exit()`；嵌套调用写成 `tools.<jsName>(args)`，`jsName` 由 `normalizeCodeModeToolName()` 把非法标识符字符替换成 `_`、给数字开头的名字加 `_` 前缀，`planCodeModeBindings()` 按规范名排序、冲突时保留字典序第一个并在描述末尾列出 “- {omitted} is omitted because it collides with {kept} as tools.{jsName}.”；媒体助手共用每次 `exec` 16 项与 10 MiB 解码后 base64 的额度；`type CodeModeToolResult = { callId: string; name: string; status: \'success\'; output: string; content?: ImageContent[] }`。',
          behavior:
            '运行时是 QuickJS 编译成 WASM、跑在专用子进程里：设计文档逐字为 “`exec` runs QuickJS compiled to WebAssembly in a dedicated child process. Each call creates a fresh QuickJS runtime and context. The child process receives a small framed JSON protocol over stdio; it has no tool implementations or Qwen configuration.”，实现里宿主进程导入 `@jitl/quickjs-singlefile-mjs-release-sync` 与 `quickjs-emscripten-core`，只用 `process.stdout.write(encodeFrame(message))` 与父进程通信。guest 能力边界逐字为 “The guest has no Node globals, `require`, `process`, filesystem, sockets, module loader, `console`, timers, `Atomics`, `SharedArrayBuffer`, or `WebAssembly`. Dynamic and static imports fail because no module loader is installed.”，工具描述里也写 “There is no Node.js, process, require, filesystem, network, import, console, WebAssembly, Atomics, or persistent state. Static and dynamic imports are unsupported. Every exec call gets a new runtime.”。额度常量：宿主进程 `MEMORY_LIMIT_BYTES = 64 * 1024 * 1024`、`STACK_LIMIT_BYTES = 1024 * 1024`、`MAX_LIVE_TIMERS = 1024`、`MAX_TIMER_DELAY_MS = 2 ** 31 - 1`；协议 `CODE_MODE_MAX_CONTROL_FRAME_BYTES = 1_048_576`、`CODE_MODE_MAX_FRAME_BYTES = 16 * 1024 * 1024`、`CODE_MODE_MAX_MEDIA_BYTES = 10 * 1024 * 1024`、`CODE_MODE_MAX_MEDIA_ITEMS = 16`、`CODE_MODE_MAX_SOURCE_CHARS = 131_072`、`CODE_MODE_MAX_OUTPUT_CHARS = 100_000`、`CODE_MODE_TIMEOUT_MS = 30_000`，超限帧抛 “Code mode protocol frame exceeds the size limit.”。CPU 预算逐字为 “QuickJS\'s interrupt hook enforces a guest CPU budget. That budget and the parent\'s fallback watchdog pause while the guest is suspended on registered host tools, whose own scheduler/ACP timeouts remain authoritative, and resume before guest jobs run again.”，超预算的错误是 `CodeModeExecutionError: interrupted`。输出规则逐字为 “Nested tool results stay in JavaScript values and are not automatically added to the exec response. … Only explicit helper calls are returned; bare return values and successful script completion produce no output.”，并且 “Await every tool promise; unawaited calls are cancelled when the script finishes.”；取消会中止所有嵌套调用并终止子进程，“No child, timer, promise handle, or guest global survives the call.”。',
          scope:
            '暴露策略是注册表之上的视图而不是第二套注册表：`getToolExposure()` 返回 `exec`／`direct-only`／`code-mode-callable`／`hidden` 四类，`HIDDEN_TOOLS` 只有 `tool_call`，`DIRECT_ONLY_TOOLS` 十三项为 `tool_search`、`agent`、`ask_user_question`、`structured_output`、`enter_plan_mode`、`exit_plan_mode`、`send_message`、`enter_worktree`、`exit_worktree`、`create_sub_session`、`autofix_pr`（旁边注释逐字为 “Its confirmations are the user\'s consent to push and to run unattended.”）、`speak_to_user` 与 `wait_threads`，其余注册工具默认 `code-mode-callable`，“New tools default to code-mode-callable; adding a direct-only or hidden tool requires an explicit policy edit.”（设计文档里 MVP 期的「十一个 direct 工具」清单已被现行源码取代）。`exec` 自身、直接控制工具、`tool_search` 与 `tool_call` 都不能在代码里被调用。Provider 侧逐字为 “All providers continue to consume `FunctionDeclaration[]` from `ToolRegistry`. … In CodeModeOnly it is the exposure-policy view, so Gemini/Qwen, OpenAI-compatible, and Anthropic adapters all receive the structured `exec` declaration without provider-specific prompting.”；验证清单要求覆盖 “Gemini/Qwen, OpenAI-compatible, Anthropic, headless, interactive, subagent, and ACP surfaces”。Subagent 与 fork 的白名单同样生效：“For a read-only teammate or a fork with an execution allowlist, `exec` is the audited gateway while the exact allowed nested names are carried in its invocation context. The same set generates the description and is checked again before Core dispatch”；ACP 会话适配器用共享的暴露策略与不受限的顶层注册表。',
          background:
            '没有后台执行、yield 或跨调用状态：设计文档的 Non-goals 逐字列出 “Persistent cells, globals, or values between `exec` calls.” 与 “Background jobs, `wait`, `yield`, `store`, or `load`.”，`exec` 同步等脚本结束（“wait for it to finish”）。并发只发生在一次 `exec` 内部：“Within each Session `exec`, dispatch consecutive safe calls concurrently using Core\'s `isToolCallConcurrencySafe` classification. Code Mode Bash calls bypass the read-only command classifier; the model decides which commands are independent.”、“Respect `QWEN_CODE_MAX_TOOL_CONCURRENCY` (default 10). An unsafe call waits for earlier calls to settle, and later calls wait for it.”、“Queue admission follows submission order and does not rely on timers to collect batches.”，且 “The shared safety predicate classifies skill loading as unsafe: despite its `Read` kind, it can register hooks and change session permissions. This makes skill execution a barrier in Core (including nested Code Mode), headless tool batching, and Session nested dispatch.”；指导语从早期的 `Promise.all` 改成 “Recommend `await Promise.allSettled([...])` for independent searches and reads.”，因为一个 rejected promise 会取消兄弟调用。`setTimeout` 的说明写 “Pending timeouts do not keep exec alive by themselves; await an explicit promise if you need to wait for one.”。',
          integration:
            '嵌套调用不新开执行路径：“Each call still re-enters `Session.runTool` for validation, permissions, hooks, progress, telemetry, and recording.”，工具描述也写 “Calls use the same validation, permissions, approvals, hooks, telemetry, cancellation, concurrency, and output limits as direct tool calls.”；请求 id 携带父 id 并带 `source: code_mode` 与 `parentCallId`，嵌套调度器更新合并进所属调度器的可见调用、确认响应按嵌套 id 委派，外层模型只收到完成的 `exec` 响应。因为 `CoreToolScheduler.schedule()` 不能递归（“a child call would queue behind its still-running parent and deadlock”），调度器在调用边界绑定 async-local 的 `ToolCallRuntime`，`exec` 只与该上下文对话。工具发现的衔接逐字为 “CodeModeOnly discovers deferred descriptions and schemas through top-level `tool_search`, then invokes tools through `exec`. Search results do not change the tool declarations. It skips deferred preload and startup catalogs; `tools.eager` also reduces the initial `exec` description. When search is unavailable in the current scope, `exec` includes all allowed tool signatures.”，`tool_search` 必须在 `exec` 之外作为顶层调用（“it is not a JavaScript global or a tools binding”），搜索结果不改工具声明、也不能扩大执行权限（“Search cannot broaden execution permissions.”），上下文压缩后需要重新发现。目标与计划侧：“A terminal update_goal result ends the script and prevents further tool calls.”、“A goal proposal forms an execution barrier: previous nested tools finish before it and later tools wait for it.”；Omni 启用时上传媒体走原生媒体传输。',
          artifacts:
            '产物只有显式助手调用返回的内容：`text(value)` 追加有界文本（非字符串尽可能 JSON 序列化），`image()`／`audio()` 接受 base64 data URL 或 Qwen MCP 内容块，`generatedImage()` 接受内置 `image_gen` 的完整结果并附保存路径提示——设计文档明确 “It does not introduce Codex\'s `{ image_url, output_hint }` shape because that is not what Qwen Code returns.”。带合规图片内容的嵌套结果用 16 MiB 媒体帧上限（因此大于 1 MiB 控制帧上限的生成图片能保留），不带图片的调用与结果仍是 1 MiB。失败时保留输出：设计要求 “Return the accumulated text and media with script errors, keep failure status, and bound the combined text and error at the exec boundary. This follows Codex\'s inline result behavior; it does not save a full-output recovery file.”，并 “Preserve both the beginning and end when truncating text, including a visible truncation marker.”；`exec` 的成功与失败结果都豁免调度器的持久化门限、声明空的持久化文件列表，使聚合批截断也保持内联。嵌套读取与 Shell 的结果形状也被规定：“Nested read_file calls must return file content even if a prior nested read happened, because reading inside JavaScript does not establish that the model saw it. Preserve read-before-edit tracking but mark those bytes absent from model history.” 与 “Nested shell results omit the submitted command, which is already present in the exec source, while retaining output and exit/error information.”；Skill、`update_goal` 与 `capture_screen_context` 的输出即使没调 `text()` 也会保留，宿主还会用一行 JSON 记录 `toolResults` 以便恢复 Skill 历史。',
          conditions:
            '实验性、opt-in、默认关闭，改动需重启；设置描述里逐字写明 “Ignored in safe and bare modes.”；未知、冲突、隐藏、direct-only 与递归请求的工具在调度前 fail closed，“A sandbox startup, protocol, timeout, memory, or teardown failure becomes an `exec` tool error.”；`tools.freeform` 只在 `tools.codeModeOnly` 为真且模型 `wireApi` 为 `responses` 时生效，官方提醒只给支持 Responses Custom Tools 的端点开。Direct 模式是兼容边界：“when the setting is false, tool registration, deferred-tool behavior, provider requests, and execution remain unchanged.”。时间线：引入提交 `4ec9f63d0a188b079000116a1eed8e28f9a5f1c0`（2026-09-11T07:40:35Z，“feat(core): add CodeModeOnly tool execution (#10607)”），第一个包含它的 stable Release 是 v0.23.4（2026-09-14T15:20:21Z，Release 正文含 “feat(core): add CodeModeOnly tool execution (#10607) by @DragonnZhang”，GitHub compare 对该提交是 `ahead`、领先 112 落后 0，而 v0.23.3 与 v0.23.2 都是 `diverged`），此后陆续加入懒发现（`lazy-code-mode`）、并发分派、上下文工具、媒体助手与失败输出保留；最新稳定版 v0.28.0（2026-11-17T11:17:50Z，tag 提交 `895dfca8ff125ac0e16372edacd4653322c02147`）没有改动这条路径——发布说明里唯一的 Code Mode 条目是 Internal Changes 分组的 “test(core): deflake the unawaited-timer code mode test (#17345)”，即 2026-11-15 提交 `7c114892380bb30d5bd0731361e728fb8a3e68a5` 把 unawaited-timer 测试的 guest 预算从 25 毫秒提到 5 秒那次改动随本版进入稳定通道；v0.28.0 标签下 `settingsSchema.ts` 为 253,092 字节（v0.27.4 为 250,862 字节），`tools.codeModeOnly` 与 `tools.freeform` 两个条目的字段与取值逐字未变，Breaking Changes 一节写 “No known breaking changes.”。文档覆盖上，官方用户文档只有设置文档 `#### tools` 小节的三段正文与 `tools.freeform` 一行表格，没有 Code Mode 专页，其余细节都在仓库 `docs/design/` 的六份设计文档与源码里。',
          status: '条件项',
          sources: [
            'qwen-code-mode-settings-doc',
            'qwen-code-mode-schema-source',
            'qwen-code-mode-tool-source',
            'qwen-code-mode-host-source',
            'qwen-code-mode-protocol-source',
            'qwen-code-mode-tool-names',
            'qwen-code-mode-only-design',
            'qwen-lazy-code-mode-design',
            'qwen-code-mode-concurrency-design',
            'qwen-code-mode-context-tools-design',
            'qwen-code-mode-media-helpers-design',
            'qwen-code-mode-output-recovery-design',
            'qwen-code-mode-intro-commit',
            'qwen-v0234-release',
            'qwen-code-mode-test-deflake',
            'qwen-v0280-code-mode-unchanged',
            'qwen-v0280-schema-source',
          ],
        },
        kimi: {
          entry:
            '无该机制。官方中文与英文内置工具文档列出的工具只有 File Tools（`Read`、`Write`、`Edit`、`Grep`、`Glob`、`ReadMediaFile`）、Shell（`Bash`）、Web Tools（`WebSearch`、`FetchURL`）、Plan Mode（`ExitPlanMode`）、State Management（`TodoList`）、Collaboration Tools（`Agent`、`AgentSwarm`、`AskUserQuestion`、`NotifyUser`）、Skills（`Skill`）、Background Tasks（`TaskList`、`TaskOutput`、`TaskStop`、`WaitFor`）与 Scheduled Tasks（`CronCreate`、`CronList`、`CronDelete`），没有任何执行模型生成代码的工具。',
          primitives: '不适用：没有代码运行时，也没有嵌套工具绑定或助手函数。',
          behavior:
            '不适用：多步编排只能由模型逐个发起工具调用，或把子任务交给 `Agent`／`AgentSwarm`（后者最多 128 个 Subagent 并返回聚合报告，并发由 ramp-up 规则与 `KIMI_CODE_AGENT_SWARM_MAX_CONCURRENCY` 控制），这些属 Subagent 字段而不是代码模式。',
          scope: '不适用。',
          background:
            '不适用：后台能力由 `run_in_background`、`TaskList`／`TaskOutput`／`TaskStop` 与回合内最多等 90 秒的 `WaitFor` 承担，与代码模式无关。',
          integration: '不适用：Hook 与 MCP 都作用在普通工具调用上，没有嵌套调用的决策映射。',
          artifacts: '不适用。',
          conditions:
            '按「官方确认无该机制」记录，2026-11-15 首次取证于 main HEAD `f082f04a093a3e71a2263c5461d52507dc31f83a`（2026-11-13T17:32:03Z），2026-11-17 在 main HEAD `7052fbbefd515d8e2aef27b60709965e59c4b687`（2026-11-17T17:04:29Z）复核后结论不变：中文工具文档（两个提交下同为 23,005 字节、逐字未变）、英文工具文档（25,229 字节、逐字未变）、中文配置参考（由 48,854 字节增至 49,126 字节）与中文更新日志（由 118,340 字节增至 118,791 字节，最新段由 `## 2.6.2（2026-11-14）` 前移为 `## 2.6.3（2026-11-17）`，该段只有前台 Shell 输出重复、后台通知误停 Tower 任务、每轮结束后外部 Stop 钩子未执行、恢复或创建会话分支时后台通知触发新回复、Windows 上 WebBridge 守护进程无法更新与若干已知问题六条修复）对 `code mode`／`code_mode`／`codeMode`／`quickjs` 的命中数仍是 0，配置参考对 `v8`／`JavaScript` 的命中数也仍是 0，即两个提交之间新增的配置与版本内容里都没有代码模式；仓库树扫描同步前移，`git ls-tree -r --name-only` 在 `7052fbbefd51` 下给出 4,612 个文件路径，其中匹配 `code-mode`／`codemode`／`quickjs` 的只有 `packages/node-sdk/src/kimi-code-model-provider.ts` 与其测试两条，都是 “kimi-**code-mode**l-provider” 的子串误命中而不是实现文件（11-15 按 GitHub tree API 在 `f082f04a093a` 下数的 5,473 个条目里匹配数为 0，两种计数口径不同但结论一致；匹配 `replay`／`isolat` 的仍都是会话回放等无关文件）。英文更新日志（126,690 字节）里唯一含 “code mode” 字面的一处仍是 “Route Kimi Code models on the Anthropic-compatible protocol through the beta Messages API.”，属 “Kimi Code models” 的子串误命中；中文工具文档里唯一的 `JavaScript` 出现在 `Read` 段“字符数和列偏移按显示文本的 JavaScript 字符串长度计算”，与代码模式无关。若后续版本引入同类机制，需要按新证据改写本格而不是从相似产品推断。',
          status: '官方确认',
          sources: [
            'kimi-tools-doc-no-code-mode',
            'kimi-tools-doc-en-no-code-mode',
            'kimi-config-files-no-code-mode',
            'kimi-changelog-no-code-mode',
          ],
        },
        qoder: {
          entry:
            '官方更新日志 CLI 1.1.81（October 29, 2026，“Introducing CodeMode and More Reliable Session Continuity”）逐字为 “Added the CodeMode tool, supporting multi-step tool orchestration and on-demand invocation of MCP tools to reduce context usage. Enable it with the environment variable QODER_ENABLE_CODE_MODE=1 and select on or only mode in /settings”，即需要环境变量 `QODER_ENABLE_CODE_MODE=1` 与 `/settings`（Slash 命令参考里的 “Open the Settings Panel (alias `/config`).”）里选 `on` 或 `only` 两步。',
          primitives:
            '未确认：更新日志只写 “the CodeMode tool” 与 “multi-step tool orchestration and on-demand invocation of MCP tools to reduce context usage”，没有给工具名、代码语言、运行时、全局助手或额度。官方文档站在核对日期没有 CodeMode 页——文档索引 `llms.txt`（93,538 字节）、Tools 页（9,127 字节）、SDK Tools 页（44,106 字节）、CLI 参考（13,961 字节）、设置参考（31,992 字节）、设置页（12,962 字节）与 Slash 命令参考（11,857 字节）对 `code mode`／`CodeMode`／`QODER_ENABLE_CODE_MODE` 的命中数都是 0；2026-11-17 另按路径直接探测 `https://docs.qoder.com/cli/code-mode` 与 `https://docs.qoder.com/en/cli/code-mode`，两者都返回 HTTP 404，而同站的 `https://docs.qoder.com/cli/overview` 返回 200，说明不是站点整体不可达而是确实没有这一页。',
          behavior:
            '未确认。能按官方措辞确认的只有两点：它面向多步工具编排，以及它把 MCP 工具改成按需调用以减少上下文占用。`on` 与 `only` 两个取值的差别没有官方说明；从命名看与 Codex 的 `code_mode`／`code_mode_only`、Qwen 的 direct／`code_mode_only` 属同一类「保留普通工具」与「只留代码入口」的区分，但这属跨产品推断，按规则不作为结论记录。',
          scope:
            '未确认：更新日志没有说明它在 TUI、Print Mode、ACP 还是 Agent SDK 生效，也没有说明是否覆盖 Subagent。CLI 1.1.83（November 4, 2026）的另一条 “Applications using CodeMode can now display individual tool-call statuses in real time and restore tool-call records from session history” 表明至少有一条面向外部应用的通道会实时暴露嵌套工具调用状态、并能从会话历史恢复这些调用记录，但该条同样没有给出协议字段、Surface 清单或版本以外的条件。',
          background: '未确认：没有关于长任务、yield、超时或后台执行的官方说明。',
          integration:
            '未确认：更新日志只提到 MCP 工具的按需调用，没有说明权限、审批、Hook 或工具白名单如何作用到嵌套调用，也没有说明与 `mcp.lazyLoad` 一类既有延迟加载机制的关系。',
          artifacts: '未确认：没有关于输出形状、媒体或落盘产物的官方说明。',
          conditions:
            '需要 CLI 1.1.81（2026-10-29）及以上，并同时满足 `QODER_ENABLE_CODE_MODE=1` 与 `/settings` 里选择 `on` 或 `only`；核对日期官方文档站没有 CodeMode 页，`QODER_ENABLE_CODE_MODE` 也没有进入 CLI 参考或设置参考的旗标与环境变量清单，因此除「能力存在」与「两步开启方式」以外的细节全部记为未确认。2026-11-17 复核更新日志 `https://changelog.qoder.com/cli`（HTML 804,293 字节、去标签后正文 1,674 行）：最新条目已由 November 13, 2026 的 CLI 1.1.89 前移为 November 16, 2026 的 CLI 1.1.90 “History Session Compatibility Fixes”（正文只有 “Fixed a compatibility issue when reading history sessions”），1.1.90 与 1.1.89（“Enterprise BYOK model support and skill invocation control”）都不含 CodeMode 条目，全文 `code mode`／`CodeMode` 仍只有 CLI 1.1.81 与 CLI 1.1.83 两处，即宣布以来两个版本迭代没有补充任何实现细节。注意不要把 2026-08-27 CLI 1.1.32 的 “UltraCode Mode and Startup Speedup”（`/effort ultracode` 或 `ultracode` 关键字触发的 Workflow 多 Agent 编排）当作同一能力，两者在更新日志里分属不同条目。',
          status: '条件项',
          sources: [
            'qoder-changelog-codemode',
            'qoder-llms-index-no-codemode',
            'qoder-tools-no-codemode',
            'qoder-settings-reference-no-codemode',
            'qoder-cli-reference-no-codemode',
            'qoder-slash-reference-settings',
          ],
        },
      },
      related: [
        'execution-shell',
        'extension-tool-discovery',
        'extension-hooks',
        'security-approval',
      ],
    }),
  });
})();

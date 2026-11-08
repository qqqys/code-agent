(() => {
  const rows = Object.fromEntries(
    window.matrixData.rows
      .filter((row) => row.category === 'extensions')
      .map((row) => [row.id, row]),
  );

  const profiles = {
    claude: {
      surfaces:
        '以 Claude Code CLI 为准；VS Code 扩展、桌面端或 Headless 中不同的入口会单独注明。',
      status: '官方确认',
    },
    codex: {
      surfaces:
        '以 Codex CLI 为准；桌面端、IDE 扩展、Cloud 和 `codex exec` 不自动继承全部交互命令。',
      status: '官方确认',
    },
    qwen: {
      surfaces:
        '以 Qwen Code CLI 为准；Headless、ACP 和 IDE Companion 中不同的加载行为会单独注明。',
      status: '源码确认',
    },
    kimi: {
      surfaces:
        '以 Kimi Code CLI 为准；ACP、Web UI 和外部编辑器只在对应能力中单独列出。',
      status: '官方确认',
    },
    qoder: {
      surfaces:
        '以 Qoder CLI 为准；Agent SDK、ACP 和 Qoder IDE 中不同的入口会单独注明。',
      status: '官方确认',
    },
  };

  function evidenceStatus(value, profile, status) {
    if (status) return status;
    if (value.includes('未确认') || value.includes('未列出')) return '未确认';
    if (
      value.includes('条件') ||
      value.includes('已弃用') ||
      value.includes('只在')
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
      location: fields.location,
      behavior: fields.behavior,
      scope: fields.scope,
      components: fields.components,
      loading: fields.loading,
      surfaces: fields.surfaces ?? profile.surfaces,
      permissions: fields.permissions,
      conditions: fields.conditions,
      status: evidenceStatus(fields.value, profile, fields.status),
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
    if (!row) throw new Error(`Unknown extension capability: ${id}`);

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
    'extension-mcp': createDetail({
      id: 'extension-mcp',
      definition:
        '把外部 MCP Server 提供的工具、提示词或资源接入 Code Agent，并记录传输方式、配置作用域、认证和信任边界。',
      includes: [
        'MCP Server 的添加、查看、删除与重载入口',
        'stdio、HTTP、SSE 或 WebSocket 等传输',
        '工具、Prompt、Resource、OAuth 与工具过滤',
      ],
      excludes: [
        '产品自己的内置工具',
        '未通过 MCP 协议暴露的普通 REST API',
        '插件包中的其他 Skills、Hooks 或 Agents',
      ],
      facts: [
        '五家都能作为 MCP 客户端，但支持的传输集合不同：Codex 当前公开范围是 STDIO 与 Streamable HTTP，Claude Code 和 Qoder CLI 还覆盖 WebSocket。',
        '项目级 MCP 配置通常进入仓库或工作目录，因此 Claude Code、Kimi Code 和 Qoder CLI 都明确区分项目配置与用户配置。',
        '“连上 Server”不等于所有工具无条件执行；工具过滤、审批、沙箱和工作区信任仍在 MCP 之外继续生效。',
        'Codex 公开了 MCP 发现项收集上限：工具、资源与资源模板的分页结果合计最多 2,048 项（`MAX_MCP_CATALOG_ITEMS`，原 1,024）；其余四家当前一手资料未列出同类上限。',
      ],
      products: {
        claude: {
          entry:
            '`/mcp` 查看连接和认证状态；使用 `claude mcp add|list|get|remove` 管理 Server。',
          location:
            'Local scope 写入用户目录下按项目保存的配置；Project scope 写入 `.mcp.json`；User scope 对该用户的全部项目生效。',
          behavior:
            '支持 MCP Tools、Prompts 和 Resources。远程 HTTP/SSE Server 可走 OAuth；Prompt 可作为 Slash 命令调用。',
          scope:
            'Local、Project、User 三种 scope；Project 的 `.mcp.json` 可共享，但首次使用需要确认信任。',
          components:
            'stdio、Streamable HTTP、已弃用的 SSE，以及通过 JSON 配置声明的 WebSocket；可由 Plugin 携带 `.mcp.json`。',
          loading:
            'CLI 管理命令写入对应 scope；项目配置在信任后加载，远程认证状态可从 `/mcp` 处理。',
          permissions:
            'MCP 工具仍受 Claude Code 权限规则控制；共享项目配置不会跳过用户确认。',
          conditions:
            '`claude mcp add --transport` 不接受 WebSocket；WebSocket 需要直接写 JSON 配置。SSE 保留兼容但已标为弃用。',
          sources: ['claude-mcp'],
        },
        codex: {
          entry:
            '`/mcp` 查看当前 Server；使用 `codex mcp add|list|get|remove|login|logout` 管理连接和 OAuth。',
          location:
            '用户配置在 `~/.codex/config.toml`；可信项目可在仓库内使用 `.codex/config.toml`。',
          behavior:
            'MCP 工具进入工具列表；可为 Server 配置允许或禁用的工具、启动超时、调用超时和审批策略。',
          scope:
            '用户配置可被 CLI、桌面端和 IDE 扩展共享；项目配置只在可信工作区加载。',
          components:
            'STDIO 与 Streamable HTTP；远程 HTTP 支持 Bearer Token 或 OAuth。',
          loading:
            '修改 TOML 或运行 `codex mcp` 后由客户端加载；OAuth 通过登录命令建立授权。',
          surfaces:
            'CLI、Codex 桌面端和 IDE 扩展共享 MCP 配置，但每个 Surface 的可用工具和交互入口仍可能不同。',
          permissions:
            'Server 级 `enabled_tools`、`disabled_tools` 与工具审批策略先缩小暴露范围，实际执行仍受当前审批和沙箱配置约束。',
          conditions:
            '当前官方 MCP 文档未列 SSE 或 WebSocket；不要把其他客户端支持的传输推断给 Codex。MCP 工具、资源与资源模板的分页发现结果合计最多收集 2,048 项（`MAX_MCP_CATALOG_ITEMS`，原 1,024），超出部分不会进入工具列表。',
          sources: ['codex-mcp', 'codex-mcp-catalog'],
        },
        qwen: {
          entry:
            '`/mcp` 查看状态、工具和认证；使用 `qwen mcp add|list|get|remove|enable|disable` 管理 Server。',
          location:
            '用户配置在 `~/.qwen/settings.json`，项目配置在 `.qwen/settings.json`；Extension 也可携带 MCP 配置。',
          behavior:
            'Tools 作为模型工具，Prompts 转成 Slash 命令，Resources 可用 `@server:uri` 引用；远程 Server 支持 OAuth。',
          scope:
            '用户、项目与 Extension 三类来源合并；项目配置随仓库共享并受工作区信任控制。',
          components:
            'stdio、Streamable HTTP 和兼容用 SSE；支持 `includeTools`、`excludeTools` 与 Server trust 设置。',
          loading:
            '配置由启动流程加载；`/mcp` 可重新连接、授权并检查各 Server 状态。',
          permissions:
            'MCP 工具继续经过 approval mode 和工具策略；Server trust 与工作区信任是不同层次。',
          conditions:
            'SSE 属于兼容传输；HTTP 是当前远程 Server 的主要配置方式。Prompt 与 Resource 并非所有五家都以相同入口暴露。',
          status: '源码确认',
          sources: ['qwen-mcp-current'],
        },
        kimi: {
          entry:
            '`/mcp` 查看 Server；`/mcp-config` 管理配置，并可用 `/mcp-config login` 完成 OAuth。',
          location:
            '用户配置在 `$KIMI_CODE_HOME/mcp.json`，默认 `~/.kimi-code/mcp.json`；项目配置在 `.kimi-code/mcp.json`。',
          behavior:
            '把 Server 工具加入 Agent 工具集，支持工具允许列表和禁用列表；远程 Server 可进行 OAuth 登录。',
          scope:
            '项目配置覆盖用户配置中的同名 Server；Plugin 也可以声明 MCP Server。',
          components:
            'stdio、HTTP 与 SSE 三类传输。',
          loading:
            '启动时合并用户、项目与 Plugin 配置；配置变化可通过相应命令或新会话生效。',
          permissions:
            '项目 MCP 配置可以执行本地命令或连接远程服务，官方文档要求只在可信仓库中加载。',
          conditions:
            '当前公开文档未列 WebSocket。`/mcp-config` 是配置入口，`/mcp` 主要用于查看和操作已加载连接。',
          sources: ['kimi-mcp-current'],
        },
        qoder: {
          entry:
            '`/mcp` 查看 Server，`/mcp reload` 重载；使用 `qodercli mcp add|list|get|remove` 管理配置。',
          location:
            '用户配置在 `~/.qoder/settings.json`；Local 默认在 `.qoder/settings.local.json`；Project scope 使用 `.mcp.json`。',
          behavior:
            '把 Server 工具接入 Agent，并支持运行中重载；工具调用继续走 Qoder CLI 权限流程。',
          scope:
            'User、Local、Project 三种 scope；Local 适合不提交的工作区覆盖，Project 可随仓库共享。',
          components:
            'stdio、SSE、HTTP 与 WebSocket 四类传输。',
          loading:
            '启动时加载各 scope；`/mcp reload` 可以在当前会话重新读取配置。',
          permissions:
            'MCP 工具按普通工具进入 permission rules；配置来源不自动获得免审批权限。',
          conditions:
            'Project 配置可被其他协作者取得，Local 配置适合机器或凭据相关覆盖；敏感值不应直接提交。',
          sources: ['qoder-mcp', 'qoder-permissions'],
        },
      },
      related: [
        'extension-plugins',
        'extension-hooks',
        'security-approval',
      ],
    }),

    'extension-skills': createDetail({
      id: 'extension-skills',
      definition:
        '以 SKILL.md 为入口，把可复用指令、脚本和参考材料按需加载到 Agent，并比较发现目录、调用方式与优先级。',
      includes: [
        '用户级、项目级和插件级 Skill 目录',
        '显式 Slash 或名称调用与模型自动匹配',
        'SKILL.md 及同目录脚本、模板、参考资料',
      ],
      excludes: [
        '仅有一段提示词的内置 Slash 命令',
        '项目长期指令文件',
        'MCP Server 提供的 Prompt',
      ],
      facts: [
        '五家当前都采用包含 `SKILL.md` 的目录结构，并允许把辅助文件与入口指令放在同一 Skill 包内。',
        'Codex 使用通用 `.agents/skills` 目录和 `$skill` 显式引用；Kimi Code 的明确命名空间是 `/skill:<name>`；其余三家支持 `/<skill-name>`。',
        'Skill 可被模型自动选择不代表一定执行；描述匹配、可用路径、禁用配置和同名优先级都会改变最终加载结果。',
        '项目级 Skill 的发现宽度差别很大：Claude Code 从启动目录一路向上到仓库根都加载 `.claude/skills/`，启动目录之下的嵌套目录在 Claude 首次读写该子目录文件时才加载，`--add-dir`／`/add-dir`（以及 Agent SDK 的 `additionalDirectories`／`add_dirs`，因为它们以 `--add-dir` 传入）目录也加载并带 live reload，而设置键 `permissions.additionalDirectories` 只给文件访问；Codex 仓库层 “scans `.agents/skills` in every directory from your current working directory up to the repository root”；Qoder CLI 自 CLI 1.1.28（2026-08-21）起 “Added automatic loading of skills in a directory added with `/add-dir`”；Kimi Code 在 main 分支把每个已配置源目录的项目级 Skill 合并进同一列表（尚未发布）。只有 Qwen Code 的项目层始终只认单一 `getProjectRoot()`，`skills.directories` 是显式清单且按 user 层加载。持久化边界也不同：Kimi Code 把目录「记住到工作区」后它就长期作为共享源目录贡献 Skill，而 Claude Code 唯一能跨会话持久化附加目录的键 `permissions.additionalDirectories` 明确不加载 Skill，官方文档没有把「加载 Skill 的附加目录」持久化的办法。',
        '同名处理有五种口径：Claude Code “Enterprise over personal, and personal over project”，与 added directory 的 Skill 冲突时后者改用前缀名（如 `/cli:verify`，需 v2.1.309 及以上）、两个 added directory 之间先加入者胜；Codex 明确不合并——“If two skills share the same `name`, Codex doesn\'t merge them; both can appear in skill selectors.”；Qwen Code “the first one found wins: project, then personal (including custom directories), then extension, then bundled”；Kimi Code 按 Project > User > Extra > Built-in，多目录时主目录优先、附加目录按工作区顺序；Qoder CLI 按 built-in < plugins < project-level < user-level，即用户级压过项目级。',
        '禁用粒度不对齐：Qwen Code 用 `skills.disabledLevels` 整体关闭某个发现层级（`project`/`user`/`extension`/`bundled`），Claude Code 用 `disableBundledSkills` 只关内置层并以 `skillOverrides` 逐个控制，Codex 按 `SKILL.md` 路径在 `[[skills.config]]` 逐个禁用，Kimi Code 只在 frontmatter 逐个关闭模型自动调用（层级侧仅 `builtin_product_skills` 能关掉介绍自身的那部分内置 Skill），Qoder CLI 现行文档没有任何 Skill 软禁用键、更新日志提到的 `settings.skills.disabled` 在设置参考里没有对应行。',
        'Kimi Code 支持一条提示词引用多个 Skill 并同时激活：空白字符后输入 `/` 插入 Skill token，全部引用与提示词作为同一轮次运行、一次 `/undo` 整体撤销，该行为已随 0.37.0（2026-08-18）发布并存在于当前稳定版 2.4.1；其余四家已固定的一手文档没有描述等价的单条提示词多 Skill 显式激活行为。',
      ],
      products: {
        claude: {
          entry:
            '显式使用 `/<skill-name>`；未关闭自动调用时，Claude 也可根据 Skill 描述自行选择。',
          location:
            '官方 `## Choose where skills load` 表有七行：Enterprise（managed settings 目录下的 `.claude/skills/<skill-name>/SKILL.md`）、Personal `~/.claude/skills/`、Project `.claude/skills/`、Nested `<subdir>/.claude/skills/`、Additional directory（“a directory you pass with `--add-dir`”，作用范围 “That session.”）、Plugin `<plugin>/skills/`（以 `/plugin-name:skill-name` 出现）与 claude.ai account 同步的 Skills。',
          behavior:
            '先发现名称和描述，需要时再读取完整 SKILL.md，并可继续打开同目录脚本、参考资料和模板。',
          scope:
            '项目层不止一个目录：“Claude Code loads project skills from `.claude/skills/` in the directory where you start it and in every parent directory up to the repository root”，`/cd` 移动会话（v2.1.246 及以上）会把新目录的项目 Skill 加进来；启动目录**之下**的 `.claude/skills/` 启动时不加载，“They load the first time Claude reads or edits a file in that subdirectory and stay available for the rest of the session.”，要提前加载可用 `/add-dir <子目录>`（需 v2.1.257 及以上）。项目外目录也贡献 Skill：“When you add a directory with `--add-dir` or `/add-dir`, Claude Code loads the skills in that directory\'s `.claude/skills/`, along with its `.claude/commands/` and `.claude/agents/.”，Agent SDK 的 `additionalDirectories`（TS）与 `add_dirs`（Python）因为以 `--add-dir` 传入所以同样加载；但设置键 `permissions.additionalDirectories` “grants file access only and loads none of these”，Permissions 页的加载表把 Skills 记为 “Yes, with live reload”、`.claude/commands/` 与 `.claude/agents/` 记为 “Yes, without live reload”。这些加载依赖默认开启的 `project` setting source，`strictPluginOnlyCustomization` 策略、bare mode 与 `--safe-mode` 会进一步收紧（`--bare` 行仍写明 “Skills in a directory you pass with `--add-dir` still load.”）。Worktree 会话只向上搜到 worktree 根，v2.1.277 起当 worktree 检出根没有 `.claude/skills` 时改读主检出的项目 Skill。版本时间线取自官方更新日志：v2.1.32 “Skills defined in `.claude/skills/` within additional directories (`--add-dir`) are now loaded automatically.”，v2.1.257 让 `/add-dir` 接受当前工作目录之内的目录并 “loads that directory\'s skills, commands, and agents like `--add-dir` does at startup”，v2.1.309 “Fixed a skill in an `--add-dir` folder being unreachable when another skill already held its name; it is now offered as `<folder>:<name>`”。官方五页文档都没有 multi-root／workspace source directory 一类词汇，模型是「一个主工作目录 + 若干附加目录」；由于唯一能跨会话持久化附加目录的键 `permissions.additionalDirectories` 明确不加载 Skill，**没有文档化的办法把「加载 Skill 的附加目录」持久化到下一次会话**，这一点与 Kimi Code「把目录记住到工作区即成为共享源目录」不同。',
          components:
            '`SKILL.md` 前置元数据、正文指令，以及可选脚本、资源和嵌套目录。企业、个人与项目位置的 `<skill-name>` 可以是指向别处的符号链接，多处指向同一目标时只加载一次。',
          loading:
            '官方逐字为 “Claude Code watches skill directories for file changes, except in bare mode. When you add, edit, or remove a skill under `~/.claude/skills/`, the project `.claude/skills/`, or a `.claude/skills/` inside an `--add-dir` directory, Claude Code picks up the change within the current session, without a restart.”；会话启动后才创建的顶层 skills 目录要用 `/reload-skills`——命令参考页的描述是 “Re-scan skill and command directories so skills added or changed on disk during the session become available without restarting. Reports how many skills are available and how many were added or removed”，且此后每次改动都要再跑一次；“Live change detection covers `SKILL.md` text only.”，同时是插件的 Skill 文件夹改 `hooks/`、`.mcp.json`、`agents/`、`output-styles/` 需 `/reload-plugins`；`--add-dir` 目录的 `.claude/commands/` 与 `.claude/agents/` 不被监听，改后要重启会话。Skills 与旧式 `.claude/commands` 在 Slash 命令界面合并呈现。',
          permissions:
            'Skill 只是指令与资源包；其中要求调用的工具仍经过 Claude Code 权限规则。v2.1.282 起修掉了仓库、用户与 `--add-dir` 三类 Skill（以及 commands 与 skills 目录型插件 manifest）在托管 `allowManagedPermissionRulesOnly` 下用自带 `allowed-tools` 自我预授权的问题。',
          conditions:
            '同名规则由 `### Resolve skills that share a name` 表给出：“Enterprise over personal, and personal over project.”；与 bundled Skill 或 built-in 命令同名时 “Your skill replaces the bundled command, but not its aliases.”；与 `.claude/commands/` 里的文件同名时跑 Skill；项目根与嵌套 Skill 同名时 “Both load.”，嵌套的以 `/apps/web:deploy` 形式目录限定调用；与企业／个人／项目 Skill 同名时 added directory 的 Skill 走前缀名，两个 added directory 之间 “The skill from the directory added first, in `--add-dir` or `/add-dir` order.”；plugin Skill “Both load, because plugin skills are namespaced as `/plugin-name:skill-name`”。added directory 的前缀规则为 “The added directory\'s folder name, then the skill directory name. When two added directories share a folder name, the prefix starts with the parent folder\'s name. Requires v2.1.309 or later”。禁用分多层：`skillOverrides` 按名称设 `on`/`name-only`/`user-invocable-only`/`off`（`/skills` 写入 `.claude/settings.local.json`，不影响 Plugin Skill）；`disableBundledSkills` 关闭除 `/doctor` 外的全部内置 Skill；`/permissions` 可用 `Skill`、`Skill(name)`、`Skill(name *)` 拒绝；SKILL.md 可用 `disable-model-invocation`、`user-invocable`、`paths` 收窄。另有保留名限制：`synced` 与 `anthropic-skills`（或 `anthropic-skills:` 前缀）在插件外不加载，名称含零宽空格或 `<` 等字符的 Skill 文件夹不加载。',
          sources: [
            'claude-skills',
            'claude-skills-discovery-scope',
            'claude-skills-add-dir-changelog',
            'claude-commands',
            'claude-settings',
          ],
        },
        codex: {
          entry:
            '使用 `$skill-name` 显式引用，或通过 `/skills` 浏览；Codex 也可按描述自动匹配。',
          location:
            '仓库层是 `.agents/skills`，且**cwd 到仓库根之间每一级目录都扫**——官方逐字为 “For repositories, Codex scans `.agents/skills` in every directory from your current working directory up to the repository root.”，位置表把 `REPO` 拆成 `$CWD/.agents/skills`、`$CWD/../.agents/skills` 与 `$REPO_ROOT/.agents/skills` 三行；用户层 `~/.agents/skills`，管理员层 `/etc/codex/skills`，另有系统内置 Skills。源码 `host_roots.rs` 还保留已弃用的 `$CODEX_HOME/skills`（注释 “Deprecated user skills location (`$CODEX_HOME/skills`), kept for backward compatibility.”）。',
          behavior:
            '启动时发现 Skill 元数据，触发后按需读取 SKILL.md 和相关资源。',
          scope:
            '仓库、用户、管理员和系统四层来源；仓库层可随代码共享，且因为逐级扫描，monorepo 根的 `.agents/skills` 对每个子包都可见。同名不合并——官方逐字为 “If two skills share the same `name`, Codex doesn\'t merge them; both can appear in skill selectors.”，因此仓库层多个目录里的同名 Skill 会同时出现在选择器里，这与另外四家「高优先级来源覆盖」的口径不同。没有 `--add-dir` 一类把额外工作目录纳入 Skill 发现的旗标或配置键，仓库层范围完全由项目根 marker（可由配置层覆盖，回落到默认 marker 集合）与 cwd 决定。',
          components:
            '`SKILL.md`、可选脚本、模板、示例与参考资料。',
          loading:
            '官方口径为 “Codex detects skill changes automatically. If an update doesn\'t appear, restart Codex.” 与新装 Skill 的 “Codex detects newly installed skills automatically; if one doesn\'t appear, restart Codex.”，全页没有手动刷新命令。源码侧对每个候选目录并发探测（`buffered(MAX_CONCURRENT_ANCESTOR_PROBES)`），stat 失败只记 `failed to stat repo skills root …` 警告并继续，最后按路径去重、保留首次出现者，顺序为项目根在前、cwd 在后。',
          permissions:
            'Skill 不扩大工具授权；脚本和命令仍受审批、沙箱及组织配置约束。',
          conditions:
            'Codex 当前项目目录是 `.agents/skills`，不是旧对照表中的 `.codex/skills`。逐个禁用可在 `~/.codex/config.toml` 的 `[[skills.config]]` 中按 `path` 指向 `SKILL.md` 并设 `enabled = false`，官方逐字为 “Use `[[skills.config]]` entries in `~/.codex/config.toml` to disable a skill without deleting it:” 与 “Restart Codex after changing `~/.codex/config.toml.”；SKILL.md 元数据 `allow_implicit_invocation: false` 禁止隐式调用但保留 `$skill` 显式调用。项目根 marker 为空时项目根即 cwd，此时仓库层只剩 cwd 一级。',
          sources: [
            'codex-skills',
            'codex-skills-repo-scan',
            'codex-skill-host-roots',
            'codex-config-reference',
          ],
        },
        qwen: {
          entry:
            '使用 `/<skill-name>` 或 `/skills` 显式选择；模型也可根据 Skill 描述自动调用。',
          location:
            '官方 `## View available Skills` 逐字列出五类来源：Personal `~/.qwen/skills/` 与 `~/.agents/skills/`、Project `.qwen/skills/` 与 `.agents/skills/`、Custom directories（`skills.directories` 里列出的路径，“loaded as personal Skills”）、Extension Skills 与 Bundled Skills。项目层只按单一 `getProjectRoot()` 展开，不按额外工作目录扩展。',
          behavior:
            '按需读取 SKILL.md，并可访问 Skill 目录中的脚本、文档和其他资源。',
          scope:
            '同名规则官方逐字为 “When two Skills share a name, the first one found wins: project, then personal (including custom directories), then extension, then bundled.”；每层内部另有品牌目录优先——`~/.qwen/skills/` 胜过 `~/.agents/skills/`、`.qwen/skills/` 胜过 `.agents/skills/`。`skills.directories` 的相对路径按工作目录而不是项目根解析，官方另写明这些 Skill 按 personal 加载因而其 `allowedTools` 与 hooks 不受 folder trust 门禁、只应指向自己控制的目录；schema 描述补充 “Each directory is scanned one level deep for subdirectories containing a SKILL.md file.” 与 “a custom skill with the same name as one in the default user directories will not override it”。`skills.disabledLevels` 可整体跳过 `project`、`user`、`extension`、`bundled` 任一发现层级（默认 `undefined`，跨作用域取并集，`requiresRestart`）；`skills.directories` 按 `user` 层发现，因此 `["user"]` 会一并隐藏。逐个控制另有 `skills.disabled`、`skills.enabled` 与 `skills.defaultDisabled`，但 `skills.enabled` 不能恢复已被 `disabledLevels` 排除的层级。官方文档与源码都没有把 `--include-directories`／`additionalDirectories` 的目录当作 Skill 根的说法。',
          components:
            '`SKILL.md`、辅助文件和可执行脚本；内置 Skill 与外部 Skill 使用同一调用模型。Extension Skill 注册名为 `<extensionName>:<name>`，只有 Extension Skill 加前缀。',
          loading:
            '启动与刷新流程扫描可用目录；源码注释逐字为 “Only watch project and user skill directories for changes. Bundled skills are immutable (shipped with the package) and extension skills are managed by the extension system, so neither needs watching.”，watch 目标由 `project` 与 `user` 两层的 base dirs 得出，因此 `skills.directories` 里的目录同样被监听；层级加载顺序为 `[\'project\', \'user\', \'extension\', \'bundled\']`，safe mode 下只剩 `[\'bundled\']`，bare mode 下每层都直接返回空，项目根等于 home 目录时跳过 project 层。',
          permissions:
            'Skill 触发的工具继续经过 approval mode、沙箱和工具策略。',
          conditions:
            'Slash 名称可能与内置命令、自定义 Command 或 MCP Prompt 冲突；加载器按来源和命令注册规则处理。safe mode 只加载 bundled 层、bare mode 所有层返回空，因此 `skills.disabledLevels` 在这两种模式下没有额外作用；daemon 在工作区未信任时也不读取。`skills.directories` 与 `skills.disabledLevels` 都是 `requiresRestart: true`，其余三个 `skills.*` 键为 `false`；官方设置参考页在核对日期仍没有任何 `skills.*` 行。',
          status: '源码确认',
          sources: [
            'qwen-skills-current',
            'qwen-skill-discovery-source',
            'qwen-skills-directories-schema',
            'qwen-extensions-current',
            'qwen-skills-disabled-levels',
          ],
        },
        kimi: {
          entry:
            '明确调用为 `/skill:<name>`；没有命令冲突时也可使用 `/<name>`，模型还能自动选择。在空白字符后（含后续行行首）输入 `/` 打开仅含 Skill 的补全菜单，可在一条提示词中插入多个 Skill 引用，该行为自 0.37.0 起随稳定版发布。',
          location:
            '项目级为「项目根 = 工作目录向上最近的含 `.git` 的目录」下的 `.kimi-code/skills`、`.agents/skills`；用户级为 `$KIMI_CODE_HOME/skills`（默认 `~/.kimi-code/skills`）与 `~/.agents/skills`；`config.toml` 顶层 `extra_skill_dirs` 叠加额外目录；另有随 CLI 分发、优先级最低的内置 Skills，其中介绍 Kimi Code 自身的部分可用顶层 `builtin_product_skills` 关闭。条件：多目录工作区会为每个已配置源目录各按项目根规则发现项目级 Skill 并合并进同一列表（main `3ed0e68f3bbf`，尚未发布）。',
          behavior:
            'Skill 被选中后读取 SKILL.md 和支持文件，可接收参数；官方逐字写「Skill 调用最多允许嵌套 3 层，超过后会被终止。」单条提示词的多个 Skill 引用经 `promptWithSkills` 打包进同一条用户消息一起激活，渲染的 Skill 块排在用户内容之前并与提示词作为同一轮次运行，一次 `/undo` 整体撤销，提示词原文保持不变；会话标题与 fork 的提示词摘录只取用户原文、不含 Skill 块。条件：合并后的列表仍是列出、`/skill:` 激活与模型自动调用的唯一来源，官方写明 “The existing catalog remains the single source for listing, slash activation, and model invocation. No REST response schema or Skill source type was added.”（main 分支，尚未发布）。',
          scope:
            '文档口径为四档「Project > User > Extra > Built-in」，同名时高优先级来源覆盖低优先级来源；源码 `SKILL_SOURCE_PRIORITY` 实为五档 `{ builtin: 0, plugin: 5, extra: 10, user: 20, workspace: 30 }`，多出的 plugin 档位于 extra 与 builtin 之间且不参与裸名冲突，因为 Plugin Skill 只能用全限定名 `<plugin-id>:<skill-name>` 列出和调用。条件：多目录合并时同名优先级为「主目录优先；附加目录之间按工作区中的目录顺序」，实现上按 `[primary, cwd, ...sharedAdditionalDirs]` 逐个求项目根并保留首次出现顺序、按 realpath 去重，运行中切换主目录只改冲突优先级、不重建 program（main 分支，尚未发布）。',
          components:
            '`SKILL.md`、脚本、参考文件和其他同目录资源。',
          loading:
            '启动时按配置目录发现；Plugin 也可携带 Skills，变化通常通过 `/reload` 或新会话生效，`/reload` 官方描述为「重新加载当前会话并应用最新的 `config.toml` 设置（供应商、模型等）和 `tui.toml` 界面偏好，无需重启 CLI；同时会把 AGENTS.md、Skill、subagent 及模型的外部变更告知 Agent」。条件：自动刷新受 `config.toml` 的 `[watch] enabled` 控制，默认开启并覆盖 local.toml、AGENTS.md、skills、MCP 配置与 `config.toml` 自身，设为 `false` 后进程内不挂任何 watcher、改文件要重启才会再读；多目录合并后按去重过的项目根各挂一个 watcher、候选目录为 `[.kimi-code/skills, .agents/skills]`、防抖 `WATCH_DEBOUNCE_MS = 200`，watch 签名同时包含 watches 与已扫描目录，因此共享目录增减与主目录变化都会重挂并刷新列表，单个 watcher 建立失败只记 `project skill watcher failed for <root>: <error>` 并继续其余项目根；会话创建改为先等 workspace reload 完成（main 分支，尚未发布）。',
          surfaces:
            '以 Kimi Code CLI 为准；ACP、Web UI 和外部编辑器只在对应能力中单独列出。多目录 Skill 合并的改动同时落在 TUI、node-sdk 与 kap-server，PR 行为变化表把受影响者记为 “Desktop/Web multi-directory projects and TUI/SDK workspaces”，并单列单目录与显式 `skillDirs` 场景为 “Unchanged | TUI, CLI, VS Code, ACP, SDK, Desktop, and Web users with one root or explicit Skill directories”。',
          permissions:
            'Skill 内容不绕过 Kimi 的工具权限和交互模式。条件：未信任时的工作区披露改为用与会话创建相同的 helper 解析待定目录，并先 `reloadSources([\'workspace\'])` 再取列表，披露已配置源目录的 Skill 与规范化后的 session-only 目录路径、但不发现 session-only 目录里的 Skill（官方记为 “disclose session-only directory access without discovering their Skills”），TUI 侧 `getWorkspaceTrustInfo` 同步改为带上 `additionalDirs`、`environmentId` 与 `environmentCwd`（main 分支，尚未发布）。',
          conditions:
            '无前缀 `/<name>` 只有在不与已有命令冲突时才作为回退；稳定写法是 `/skill:<name>`。逐个禁用只走 frontmatter：`disableModelInvocation: true`（别名 `disable-model-invocation`）禁止模型自动调用但仍可 `/skill:<name>` 手动调用，`type: flow` 仅手动调用；没有按名称的禁用配置键，层级侧只有 `builtin_product_skills`（默认 `true`，可由环境变量 `KIMI_CODE_BUILTIN_PRODUCT_SKILLS` 覆盖）整体关掉「介绍 Kimi Code 自身」的那部分内置 Skill。提示词中的 Skill 引用只按名称激活、不携带参数，参数仍是单独以 `/skill:<name> args` 调用时的概念；空白字符后的 `/` 只补全 Skill，内置命令和 plugin 命令仍须放在输入开头。单条提示词多 Skill 激活于 2026-08-16 合入 main（引擎提交 `61591bce09f4`、TUI 提交 `44a6c70e6676`），已随 Release `@moonshot-ai/kimi-code@0.37.0`（2026-08-18T11:23:11Z、`prerelease: false`）发布并存在于当前稳定版 2.4.1，**此前记录的「最新 Release 0.36.1 未包含」已作废**；但描述它的交互指南段落只存在于历史坐标 `44a6c70e6676`，2.4.1 与 main 的 `docs/zh/guides/interaction.md` 都已删去该段，现行 `docs/{zh,en}` 里只剩英文更新日志还留着原句。引擎侧 `promptWithSkills` 只在 v2 引擎实现，空提示词、空 Skill 列表或未知 Skill 在提交前整体拒绝，node-sdk `session.promptWithSkills` 在 v1 引擎报错。多目录合并只覆盖「已配置的源目录」：仅本次会话添加的目录（TUI `--add-dir`、SDK create/resume/add-dir）仍只扩大文件访问范围、不贡献 Skill，要纳入需用 `/add-dir` 选择把目录记入工作区注册表（`~/.kimi-code/projects.json`，`local.toml` 的 `additional_dir` 已是只读存量兼容字段）；`--skills-dir` 显式指定目录时整体替换自动发现的用户与项目目录、workspace 来源直接返回空 Skill 列表；`merge_all_available_skills`（默认 `true`）决定每个项目根是扫全部品牌目录还是只取第一个存在的。该改动在核对日期只存在于 main：2.4.1 与最新 canary `2.5.0-canary.20261030040529-bd0d4de` 都不含。',
          sources: [
            'kimi-skills-current',
            'kimi-skills-main-multi-root',
            'kimi-skills-en-main-multi-root',
            'kimi-skills-config-keys',
            'kimi-skill-source-priority',
            'kimi-skills-dir-flag',
            'kimi-multi-root-skills-pr',
            'kimi-multi-root-skills-source',
            'kimi-multi-root-skills-workspacedirs',
            'kimi-multi-root-skills-unreleased',
            'kimi-plugins-current',
            'kimi-multi-skill-docs',
            'kimi-multi-skill-engine-commit',
            'kimi-multi-skill-tui-commit',
            'kimi-multi-skill-changeset',
            'kimi-v0370-multi-skill-release',
          ],
        },
        qoder: {
          entry:
            '使用 `/<skill-name>` 显式调用或由模型自动匹配；`/skills` 管理与查看（官方命令参考写 “Manage Skills.”，排障页写 “Use `/skills` to view the list of loaded skills.”），`/skills reload` 重载。内置 Skill 直接以 `/<name>` 出现，例如 `/simplify`。',
          location:
            '官方 Skills 页的位置表只有两行：用户目录 `~/.qoder/skills/{skill-name}/SKILL.md`（“All projects for current user”）与项目目录 `.qoder/skills/{skill-name}/SKILL.md`（“Current project only”）；排障页补充目录结构必须是 `skills/<name>/SKILL.md`。此外还有两类不写在该表的来源：Plugin 携带的 Skills，以及随 CLI 分发的 Built-in Bundled Skills（`loop`、`remember`、`run`、`run-skill-generator`、`batch`、`debug`、`quest`、`verify`、`security-scan`、`simplify`、`mcp-config`、`workflow-authoring` 共 12 个）。用 `/add-dir` 加入的目录也自动加载其中的 Skill（CLI 1.1.28 起）。',
          behavior:
            '官方分三步：“1. Discovery: At startup, Qoder CLI loads each Skill\'s name and description…  2. Activation: When a request matches a Skill\'s description, the model requests to use that Skill and loads the full `SKILL.md`. Some Skills can run without an extra confirmation; Skills that need additional capabilities may ask for approval. 3. Execution: The model executes according to Skill instructions, loading referenced files or running scripts as needed.”；并记 “Internally, Skills convert to a special Command type and share the same execution mechanism.”',
          scope:
            '来源优先级为 built-in < plugins < project-level < user-level，官方逐字为 “**Source Priority**: The source priority for skills is built-in \\< plugins \< project-level \< user-level. When names conflict, higher priority overrides lower priority.”，Skills 页同口径写 “When names conflict, user-level Skills override project-level Skills.”，**据此作废旧结论「项目 Skill 覆盖同名用户 Skill」**。额外目录一侧：`permissions.additionalDirectories` 官方描述为 “Additional trusted directories added to workspace context (corresponding to `/add-dir`).”，CLI 旗标 `--add-dir` 为 “Add Additional trusted directories for the current session (can be used multiple times).”，而更新日志 CLI 1.1.28 明确 “Added automatic loading of skills in a directory added with `/add-dir`”，即这些目录既进工作区上下文也贡献 Skill；该行为在现行 Skills 页与设置参考里没有对应文字。',
          components:
            '`SKILL.md` 与可选脚本、参考材料和资源。',
          loading:
            '没有文件系统自动热更新：官方口径是 “New sessions load Skills at startup. If Qoder CLI is already running, use `/skills reload` to refresh the discovered Skills.”，改 `SKILL.md` 后同样 “run `/skills reload` to refresh the discovered Skills”；排障页把重载按对象拆开——“use `/memory` for memory, `/skills reload` for skills, and `/agents reload` for Agents; use `/commands` for custom commands”，并写 “If the above methods do not work, restart Qoder CLI; some loading-related configurations are marked as \'requires restart\' and require a restart after modification.”。Plugin Skills 随插件加载。',
          permissions:
            'Skill 要求的工具调用继续走 Qoder CLI permission rules；官方 Activation 一步区分 “Some Skills can run without an extra confirmation; Skills that need additional capabilities may ask for approval.”。另有门禁：`/skills` “Requires Skills support and administrator permissions to be enabled.”，Skills 属 “only appear when the corresponding capabilities are enabled” 的功能开关项，被管理策略关闭时 “`/skills` will prompt that they are disabled”。',
          conditions:
            '同名冲突的官方建议只有描述层面——“When the CLI confuses similar Skills, use different trigger terms in descriptions to distinguish them.”；另有 Conditional Skill 机制：“Activated only when the file path matches; otherwise, it does not appear.”。内置 Skill 有前置条件，不满足时不出现在可用列表（如 `batch` 要求当前目录是 Git 仓库、`workflow-authoring` 要求 workflows 与 Skills 可用），且 `/debug`、`/security-scan`、`/batch` 只能显式调用。软禁用方面：现行文档没有任何 Skill 软禁用键，官方 Skills 页只给出编辑或删除目录；更新日志 CLI 1.1.30 有 “Fixed settings.skills.disabled not applying to built-in bundled skills”，说明存在 `settings.skills.disabled`，但设置参考页在核对日期没有任何 `skills.*` 行，键名与取值未确认。插件携带的 Skill 随插件停用（`enabledPlugins` 或 `qodercli plugins disable`，停用插件在新会话不再加载）。更新日志另有 `.agents/skills` 兼容来源的三条——CLI 1.1.6 “Added settings configuration to control skill loading from the .agents directory”、CLI 1.1.7 “Added the .agents/skills compatibility toggle to /settings”、CLI 1.1.11 “The .agents/skills compatibility source is now enabled by default”，以及 CLI 1.1.9 “Skill directories are now scanned recursively, with a visible warning when a declared directory contains no skills”，这些在现行 Skills 页与设置参考里都没有对应文字，开关名与递归范围未确认。',
          sources: [
            'qoder-skills',
            'qoder-skill-source-priority',
            'qoder-builtin-skills',
            'qoder-add-dir-skills',
            'qoder-plugins',
          ],
        },
      },
      related: [
        'extension-custom-commands',
        'extension-plugins',
        'extension-project-instructions',
      ],
    }),

    'extension-skill-generation': createDetail({
      id: 'extension-skill-generation',
      definition:
        '从知识源或成功任务自动生成 Skill，并按活跃度对生成的 Skill 进行清理、归档、固定或恢复，比较入口、来源标记与维护边界。',
      includes: [
        '从 URL、路径、文本、视频或工作流演示生成 Skill 的入口',
        '自动生成的来源标记与管理范围',
        '按活跃度清理、归档、固定或恢复 Skill 的维护命令',
      ],
      excludes: [
        'Skill 的发现目录、调用方式与禁用粒度（见 Agent Skills）',
        '仅有一段提示词的自定义 Slash 命令',
        '插件整包分发 Skills',
      ],
      facts: [
        '只有 Qwen Code 提供从任意知识源生成 Skill 的通用入口 `/learn`，并配套 Auto Skill 与 `/curator` 的 stale、archive、restore 维护；其余四家没有等价的 `/learn` 或按活跃度归档的 curator。',
        'Claude Code 与 Codex 在特定工作流中自动写入 Skill：Claude 的 `/run-skill-generator`、`/verify` 记录运行配方，Codex 的 Record & Replay 起草 Skill、`$skill-creator` 问答生成、`$skill-installer` 安装策展 Skill。',
        'Kimi Code 与 Qoder CLI 的 Skill 仅手动编写；停用分别通过 frontmatter 关闭模型自动调用或删除目录，没有按活跃度归档的机制。',
        '生成的 Skill 与手写 Skill 共用同一加载与权限模型；Qwen 用 frontmatter `source: learned` 与 `source: auto-skill` 区分来源，且 Auto Skill 只管理 `auto-skill-*` 目录，个人、扩展、内置和手写 Skill 永不被选中。',
      ],
      products: {
        claude: {
          entry:
            '没有通用 `/learn`。`/run-skill-generator` 记录项目的构建与启动配方；`/verify` 在没有配方时记录自己的配方。',
          location:
            '生成的 Skill 写入项目目录：`/run-skill-generator` 写到 `.claude/skills/run-<name>/`；`/verify` 写到 `.claude/skills/verify/SKILL.md`，monorepo 可写在被改动的包目录。',
          behavior:
            '`/run-skill-generator` 捕获安装命令、环境变量和启动脚本并提交为每项目 Skill；`/verify` 只在之前引导错误（命令失败或缺步骤）时编辑已记录文件。',
          scope:
            '生成的 Skill 属于项目层，随仓库共享；仓库根的记录 Skill 会替代同名内置 `/verify`。',
          components:
            '标准 `SKILL.md` 前置元数据与正文指令；记录内容为可复现的运行配方。',
          loading:
            '运行中检测 Skill 变化；记录后的 `/run`、`/verify` 等按新配方执行。',
          permissions:
            '生成与调用仍经过 Claude Code 权限规则；`skillOverrides` 可手动隐藏或禁用。',
          conditions:
            '自动写入只发生在 `/run-skill-generator`、`/verify` 等特定内置工作流；没有从任意 URL 或文本生成 Skill 的通用入口，也没有归档未使用 Skill 的 curator。`skill-creator` 插件用于评测和描述调优，不从用户行为自动生成任意 Skill。',
          sources: ['claude-skills'],
        },
        codex: {
          entry:
            'Record & Replay 录制工作流并起草可复用 Skill；内置 `$skill-creator` 通过问答生成 Skill；`$skill-installer` 安装策展 Skill（如 `$skill-installer linear`）。',
          location:
            '手动与生成的 Skill 都放在 `.agents/skills`（项目）、`~/.agents/skills`（用户）、`/etc/codex/skills`（管理员）；安装器可从其他仓库下载。',
          behavior:
            'Record & Replay 捕获演示步骤并草拟 Skill；`$skill-creator` 询问用途、触发时机，并选择仅指令或含脚本，默认仅指令。',
          scope:
            '项目、用户、管理员和系统四层来源；项目层可随代码共享。',
          components:
            '`SKILL.md`（必需 `name`、`description`）加可选脚本、模板和参考资料。',
          loading:
            'Codex 自动检测 Skill 变化与新安装；未出现时重启。',
          permissions:
            'Skill 不扩大工具授权；脚本仍受审批与沙箱约束。',
          conditions:
            '没有从成功任务自动生成 Skill 的 Auto Skill，也没有归档未使用 Skill 的 curator；不删除而停用可在 `~/.codex/config.toml` 的 `[[skills.config]]` 设 `enabled = false`（需重启）。',
          sources: ['codex-skills', 'codex-config-reference'],
        },
        qwen: {
          entry:
            '`/learn <source> [focus]` 从 URL、本地路径、文本或视频生成项目 Skill；Auto Skill 自动生成并维护 `auto-skill-*`；`/curator` 查看与维护。',
          location:
            '`/learn` 结果写入 `.qwen/skills/learned-skill-<name>/SKILL.md`（frontmatter `source: learned`）；Auto Skill 管理 `.qwen/skills/auto-skill-*`（frontmatter `source: auto-skill`）；归档移到 `.qwen/archived-skills/`。',
          behavior:
            '`/learn` 作为普通 Agent 轮运行，把知识源蒸馏为可复用 Skill，可在路径或 URL 后加文本聚焦重点；Auto Skill 启用后定期把不活跃的生成 Skill 移出活跃库：30 天无成功使用或 `SKILL.md` 编辑标记为 stale，90 天整目录移到 `.qwen/archived-skills/`，不永久删除；自动维护在受信任工作区每 7 天至多一次。',
          scope:
            '生成与维护只作用于项目层 Skill；个人、扩展、内置和手写 Skill 永不被 Auto Skill 选中。',
          components:
            '标准 `SKILL.md` 加 frontmatter `source` 标记（`learned` 或 `auto-skill`）；本地记录成功使用以判断活跃度。',
          loading:
            '普通会话监视个人与项目 Skill 目录，增删改后短延迟自动刷新 Skill 列表与调用状态；bare mode 不启动监视，需重启。',
          permissions:
            '`/learn` 与 Skill 调用继续经过 approval mode、沙箱和工具策略。',
          conditions:
            '视频学习需要 OpenAI 兼容 Provider 上的视频模型，YouTube 页面 URL 不是直接视频输入；`/curator` 的 status 与 `run --dry-run` 在 safe mode 和未信任工作区可用，应用维护（`run`）、`pin`/`unpin`、`restore` 需要受信任且非 safe mode 工作区；pinned 的 auto-skill 在取消固定前不参与 stale 与归档；启用 Auto Skill 生成的具体配置键未在 skills.md 列出。',
          sources: ['qwen-skill-learning'],
        },
        kimi: {
          entry:
            '手动创建 `SKILL.md`（目录形式）或单个 `.md`（扁平形式，名称取文件名）并放入扫描目录；无生成命令。',
          location:
            '用户 `~/.kimi-code/skills/`、项目 `.kimi-code/skills/`、`config.toml` 额外目录与内置 Skills。',
          behavior:
            'Skill 由用户编写后被斜杠调用，或模型按 `description`、`whenToUse` 自动调用；没有从知识源或成功任务自动生成 Skill 的机制。',
          scope:
            '优先级 Project、User、Extra、Built-in；同名时高优先级来源覆盖低优先级来源。',
          components:
            '`SKILL.md` frontmatter（`name`、`description`、`type`、`whenToUse`、`disableModelInvocation`、`arguments`）与正文占位符。',
          loading:
            '启动时按目录发现；变化通过 `/reload` 或新会话生效。',
          permissions:
            'Skill 不绕过工具权限与交互模式。',
          conditions:
            '官方 Skills 文档未列出任何自动生成、`/learn` 或归档/清理未使用 Skill 的维护功能；停用只能删除目录或用 frontmatter 关闭模型自动调用。',
          sources: ['kimi-skills-current'],
        },
        qoder: {
          entry:
            '手动创建 Skill 目录并编写 `SKILL.md`（必需 `name`、`description`）；无生成命令。',
          location:
            '用户 `~/.qoder/skills/{name}/`、项目 `.qoder/skills/{name}/`；可含 `REFERENCE.md`、`EXAMPLES.md`、`scripts/`、`templates/`。',
          behavior:
            '新会话启动加载，运行中用 `/skills reload` 刷新；模型可按描述自动调用或 `/skill-name` 手动调用；没有自动生成或学习 Skill 的机制。',
          scope:
            '项目 Skill 覆盖同名用户 Skill；Plugin 可分发 Skills。',
          components:
            '`SKILL.md` 加可选参考、示例、脚本和模板。',
          loading:
            '更新直接编辑 `SKILL.md`，新会话或 `/skills reload` 生效。',
          permissions:
            'Skill 要求的工具调用继续走 Qoder CLI permission rules。',
          conditions:
            '官方 Skills 文档未列出任何自动生成、`/learn` 或归档/清理未使用 Skill 的维护功能；删除即 `rm -rf` Skill 目录，永久移除全部文件。',
          sources: ['qoder-skills'],
        },
      },
      related: ['extension-skills', 'cmd-memory', 'cmd-skills'],
    }),

    'extension-hooks': createDetail({
      id: 'extension-hooks',
      definition:
        '在提示词、工具、权限、会话、压缩、Subagent 或文件系统变更等生命周期节点执行外部或进程内逻辑，并比较事件、Handler 类型、阻断语义、同一事件的执行顺序与并发，以及能不能观察工具调用之外的文件写入。',
      includes: [
        'Hook 配置位置与事件匹配',
        'command、HTTP、prompt、agent 或 MCP Tool Handler',
        '插件携带的 JS/TS 函数 Hook 模块（mod）：Claude Code 在自身进程内执行并可绘制界面，Qwen Code 在隔离 QuickJS worker 中执行、不绘制界面',
        '允许、阻断、修改输入输出与记录事件',
        '退出码、超时与失败时放行还是阻断（fail-open / fail-closed）',
        '同一事件多条 Hook 的执行顺序、并发上限与只观察不阻断的事件',
        '文件变更观察事件与观察路径注册（`FileChanged` 与 `watchPaths`）：谁触发、注册什么、能不能阻断',
      ],
      excludes: [
        '模型自行决定调用的普通工具',
        'CI 平台的远程 Workflow Hook',
        '只提供说明文字而不绑定生命周期的项目指令',
      ],
      facts: [
        '五家都公开了生命周期 Hook，但并不是同一实现：Kimi Code 当前独立 Hook 只执行 command；Codex 自 rust-v0.148.0 起 command Handler 支持 `async: true` 后台执行，`mcp_tool` Handler 的引擎执行也随该版发布，但 CLI 会话接入 MCP 执行器仍在 main 分支（提交 `87070a77925c`），rust-v0.148.0 运行时启动告警跳过。',
        'Claude Code、Qwen Code 和 Qoder CLI 支持多种 Handler；可用事件与返回 JSON 结构仍需按各自文档配置，不能直接复制。',
        'Claude Code 自 v2.1.287 起把 Hook 扩展到进程内：插件的 `hooks/hooks.json` 用 `modules` 声明一个 ES module，导出的 `register(on, options)` 注册的 JS/TS 函数在 Claude Code 自己的进程里被调用，官方把带这种模块的插件称为 mod。mod 能改写事件、直接给出结果而不执行原动作，并能在终端与桌面端 Code 页签绘制 pane 与 band。Qwen Code 自 v0.25.3 起提供同一 Mod API 的一个实验性子集（`experimental.mods`，官方文档 `docs/users/extension/mods.md` 逐字写 “a small subset of the Claude Code Mod API”“not full compatibility with existing Claude Mods”）：mod 同样用插件 `hooks/hooks.json` 的 `modules` 声明、同样导出 `register(on, options)`，但运行在「每插件一个、位于会话 worker 内的隔离 QuickJS 环境」里，没有 Node、文件系统与网络 API，能注册 Slash 命令、拦截生命周期事件与写 transcript 日志，工具拦截只在 headless 可用，且不绘制界面。Codex、Kimi 与 Qoder 公开可配置的 Handler 仍在进程外执行（Codex command 与 `mcp_tool`、Kimi command、Qoder command/HTTP/prompt/agent），没有进程内或隔离 worker 的函数模块，也不能绘制界面；Qwen 文档另列由 Skill 系统内部使用的 `function` Handler，与这里面向终端用户的 mod 是两回事。',
        '项目 Hook 可以运行本地命令或访问网络，因此可信工作区、超时、退出码和失败时是否放行是比较中的核心边界。Claude 的 mod 更进一步：它以用户权限在进程内运行且不进沙箱，能批准工具调用从而绕过 `ask` 规则与 `PreToolUse` 阻断，审查方式从读脚本变成 `claude plugin validate` 输出的 `hooks:` 与 `calls:` 两行。Qwen 的 mod 走相反方向：运行在隔离 QuickJS worker 里、没有 Node、文件系统与网络 API，官方逐字写 “a Mod cannot upgrade a native deny or ask to allow.”“A Mod-authored `rule`, `hook` or `ceiling` cannot create host permissions.”，且每次普通 `tool.call` 的 `next` 都重新走一遍原生校验、经典 Hook、权限、审批与调用守卫。',
        '失败时默认放行仍是五家的共同基线，但只有 Claude Code 给出把失败改成阻断的开关，而且这个开关已经从更新日志走进官方文档：`onFailure` 取 `"continue"` 或 `"block"`、默认 `"continue"`，需 v2.1.295 及以上，只出现在 Command 与 HTTP 两张 Handler 字段表里而不在公共字段表（公共字段仍只有 `type`、`if`、`timeout`、`statusMessage` 与 `once`），`prompt`、`agent` 与 `mcp_tool` 三类都没有该字段。官方参考页为它单列 “Block the action when a hook fails” 一节，把「失败」拆成五类——启动不了（脚本或可执行文件不存在）、退出码非 0 非 2（即使打印了 `permissionDecision: "allow"` 也算失败，要返回 JSON 决定就得退出 0）、HTTP 连接失败或状态非 2xx、达到自己的 `timeout`、输出无法解析或不合 schema（HTTP Hook 的 2xx 响应体既不是空也不是 JSON 对象同样算失败，而 command Hook 的纯文本 stdout 不算失败）；并写明 `"block"` 的效果等同于该事件上的退出码 2，只有 `PermissionRequest` 例外——该事件本不认退出码 2、权限流程照常继续，`"block"` 在这里改为直接拒绝请求。`Stop`、`SubagentStop`、`TaskCompleted` 与 `TeammateIdle` 四个事件以及设了 `async` 或 `asyncRewake` 的后台 command Hook 完全不受该字段影响，官方给的理由是退出码 2 在这些事件上是让 Claude 回去继续工作，而 Claude 修不好一个跑不起来的 Hook。v2.1.317 又把同一开关扩到 Agent SDK 的回调 Hook：字段写在 matcher 上而不是单个回调上（TypeScript `onFailure`、Python `on_failure`），需 TypeScript SDK v0.3.317 或 Python SDK v0.2.177 及以上；默认失败时动作照常放行、应用侧收到 `tag` 为 `hook_callback_failed` 的 `SDKInformationalMessage` 警告，回调抛错、返回不合校验的输出、或走了一条没有 `return` 的路径都算失败，官方因此提醒守卫型回调要让错误抛出去而不是自己 catch 后返回 `{}`；设了 `"block"` 而 Claude Code 无法满足时 query 在启动阶段直接失败且不发提示词，错误里含 `does not honor`（版本太旧）或 `did not register your hooks`（会话已在运行）。Codex、Qwen Code、Kimi Code 与 Qoder CLI 的一手文档在 2026-11-04 复核时都把非 0 非 2 退出码、超时与响应畸形记为非阻断错误并让主流程继续，也都没有 `onFailure` 一类的失败开关；Kimi Code 更进一步——`[[hooks]]` 只接受 `event`、`matcher`、`command`、`timeout` 四个字段、多写会导致配置文件加载失败，因此在这一家连把这个键写进配置都不行。',
        '默认放行之外各有按事件或按平台的例外，方向并不一致：Claude Code 的 `WorktreeCreate` 任何非零退出码都让创建失败、`WorktreeRemove` 在目录仍存在时任何非零退出码都让移除失败、`PreModelSwitch` 上超时即阻断切换、Agent SDK 回调 Hook 在 `PreToolUse` 超时则阻断该次工具调用（同一个回调 matcher 设了 `onFailure: "block"` 之后，超时还额外阻断 `PreCompact`、`Elicitation` 与 `WorktreeCreate`）。它另有一条**按平台成立的 fail-closed 默认**：Windows 上没有 Git Bash 时，shell 形式（未设 `shell`）的 `PreToolUse` 或 `PermissionRequest` command Hook 只要退出码不是 0 或 2 就算失败并阻断该次调用，即使它打印了并不拒绝该调用的 JSON，错误文案是 `blocking because Git Bash wasn\'t found, so only exit code 0 or 2 counts as this hook\'s verdict.`（v2.1.309 之前措辞不同）；官方给的恢复放行办法正是写 `"onFailure": "continue"`，而一旦装上 Git for Windows 这条默认又会消失，所以想让 PowerShell 守卫 Hook 在有无 Git Bash 两种情况下都阻断，必须显式写 `"onFailure": "block"`。Codex 的 Hooks 页只记录一处 fail closed——`PermissionRequest` 的 `updatedInput`、`updatedPermissions` 与 `interrupt` 是保留字段，今天返回它们就按关闭处理。Qoder CLI 的 `WorktreeCreate` 任何非零退出码都算失败，`ConfigChange` 在 `source` 为 `policy_settings` 时 Hook 仍触发但改动强制生效、不能阻断，`asyncRewake` 的后台 Hook 退出码 2 也不阻断任何动作、改成用 stderr/stdout/error 拼一条 system reminder 唤醒模型，而它的 Release Notes 在 CLI 1.0.29 写过 “Aligned SessionEnd hook timeout and PreToolUse fail-closed behavior with strict semantics”，Hooks 页没有展开这条 fail-closed 覆盖哪些失败形态，记为未确认。Qwen Code 的 `PermissionDenied` 与 `InstructionsLoaded` 明确写 Hook 失败只记录、不改变结果，`StopFailure`、`PostCompact`、`SessionDelete` 与 `MessageDisplay` 则是即发即忘或输出被忽略。Kimi Code 在 2026-11-04 复核的文档里补上了失败处置的可观测部分，逐字为「当 hook 执行失败时（无法启动、超时或以错误退出码结束），CLI 会记录日志，并在会话中显示一次警告；之后的失败只记录日志。阻断决策保持 fail-open：失败的 hook 永远不会阻断操作。」，即失败在会话里只提示一次、之后只进日志，而「无法启动」也被明确归入失败形态之一；这条一次警告按 Hook、按事件还是按会话计数，官方没有说明，记为未确认。',
        '管理入口也不对齐：Claude Code、Codex、Qwen Code 与 Qoder CLI 都有 `/hooks`（Qoder 的这一行此前被本矩阵漏记，官方 Slash 命令参考描述为 “Manage Hooks.”、Release Notes 记 CLI 1.0.8 起对所有用户可用，Hooks 页本身没有描述它），Kimi Code 没有 Hook 管理命令、入口是 `~/.kimi-code/config.toml` 的 `[[hooks]]`。',
        'Kimi Code 是唯一在文档里直接给这套语义命名并写出使用边界的一家：退出码 `0` 放行、`2` 阻断、其他数字默认放行，“即使脚本报错或超时，CLI 也不会因此中断你的工作”，这种“出错就放行”的设计称为 fail-open，文档接着写“正因为 fail-open，Hooks 适合做提醒和轻量拦截，但不应作为唯一的安全防线”。它同时把事件分成可阻断与观察型：只有 `PreToolUse`、`Stop`、`UserPromptSubmit` 的返回值会影响主流程，其余事件触发后即发即忘。Claude Code 官方 Hooks 指南给出等价提醒：策略型 Hook 首次运行要盯着 non-blocking 通知，因为 `settings.json` 里路径写错会让这道闸门静默失效。',
        '同一事件命中多条 Hook 时的执行顺序与并发口径五家各不相同，而且都只有部分写进文档：Claude Code 的官方 Hooks 参考页在 2026-10-28 复核时第一次写出了并发数字——“When an event fires, its matching hooks run in parallel. If more than 12 of them are prompt or agent hooks, 12 of those run at once and the rest start as running ones finish. Each waiting hook\'s `timeout` starts counting when that hook starts.”，即数字只约束 prompt 与 agent 两类 Handler、排队等待不计入 Hook 自身的 `timeout`；但 v2.1.312 更新日志把口径改成 “at most 24 at a time per session, sub-agents included, plus at most 12 that have waited longer than their event\'s timeout”，参考页仍停在「同一事件 12 个」，两处一手资料在计数单位上互相冲突；Codex 文档写同一事件的多个 command Hook 并发启动、因而一个 Hook 挡不住另一个启动，后台 Hook 每会话至多 8 个并发、其余等待，rust-v0.165.0 的 `dispatcher.rs` 里同步 Handler 仍全部进 `FuturesUnordered` 一起启动、没有条数上限，该版新增的 environment 作用域 Hook 则被挑出同步批次、等本地同步 Hook 全部结束后再异步投递；Qwen Code 默认并行（“By default, hooks execute in parallel for better performance”）并提供 `sequential: true` 强制顺序执行，顺序执行时同一事件内按 Project、User、System、Extension 排，`async: true` 的 command Hook 占 10 个并发槽之一、占满即跳过；Kimi Code 写同一事件命中的多条规则全部并行、`command` 完全相同的只运行一次，没有给数字上限；Qoder CLI 的 Hooks 页既没有说并行还是顺序、也没有任何并发数字（连 “batch” 一词都没有出现），只有 Release Notes 的 CLI 1.1.78 写了 “Added display of Hook batch progress and waiting time”，同事件并发数仍记为未确认。',
        '观察型事件正在成为一类独立设计：Codex 的 `PreModelRequest` 与 `PostModelRequest`（提交 `70b3bb6d8814`，PR #55144，随 rust-v0.165.0 发布）围绕每次模型请求尝试（含重试）触发，源码文件头注释逐字为 “//! Observation-only lifecycle hooks. Output is logged, never interpreted as control flow.”，Hook 的 stdout 只进 debug 日志、即使内容看起来像控制指令也不解释，退出码只在 0 与非 0 之间决定这次运行记 `Completed` 还是 `Failed`，因此这两个事件上退出码 2 不阻断任何东西；官方 Hooks 文档页在 2026-11-04 复核时也已收录这两个事件并给出同口径的散文说明 “Hook output is diagnostic only. It can\'t change the model\'s context or block a request.”，同时在 `matcher` 支持表里把它们标为 “not supported”，即这两个事件不做 matcher 筛选、命中的全部 Handler 都会跑。Kimi Code 的文档同样把事件分成可阻断与观察型两类。这与 fail-open 是两个维度：fail-open 说的是失败时怎么办，观察型说的是这个事件的输出从头到尾就不参与控制流。',
        '文件变更观察是观察型事件里最分化的一类：2026-11-08 复核时 Claude Code、Qwen Code 与 Qoder CLI 有 `FileChanged`，Codex 与 Kimi Code 没有，而且三家的观察路径注册方式互不相同。Claude Code 自 v2.1.83 起有该事件（更新日志逐字为 “Added `CwdChanged` and `FileChanged` hook events for reactive environment management (e.g., direnv)”），官方明确写它靠文件系统 watcher 而不是检查工具调用触发——“Claude Code detects changes with a filesystem watcher, not by inspecting tool calls, so it runs the hook no matter what changed the file: an `Edit` or `Write` tool call, a script Claude runs with `Bash`, or a process outside Claude Code entirely.”，并在 `PreToolUse` 与 `PostToolUse` 两节各写一句让读者改用它，理由是 “Claude Code doesn\'t run a `PostToolUse` hook matching `Edit|Write` when a `Bash` command or a process outside Claude Code rewrites the same file.”；它的 `matcher` 在这一个事件上同时充当观察清单（按 `|` 拆成工作目录内的字面文件名，正则在这里没有意义）与过滤器（按 basename 走常规 matcher 规则），动态部分靠 `SessionStart`、`CwdChanged` 与 `FileChanged` 三处返回 `watchPaths`，而 “Claude Code starts the watcher only when something names a file to watch”，所以必须先有东西点名文件。Qwen Code 的 `FileChanged` 到 v0.27.0（2026-11-07T20:45:25Z）才进稳定通道、事件表由 22 个变成 23 个，注册口径与 Claude 同名不同义：静态注册只认 cwd 内的裸字面文件名（“Static registration does not expand globs or scan directories recursively.”、“Regex patterns filter already watched paths; register their files or directories explicitly through `watchPaths`.”），递归目录只能靠同步的 `SessionStart` 或 `FileChanged` 输出 `hookSpecificOutput.watchPaths`，且递归发现跳过 `.git` 与 `node_modules` 子树、忽略 `<target>.<12 位小写十六进制>.tmp` 形式的原子写临时文件；文档只写 “Events are reported after writes settle.”，那个「settle」要到源码才看得到数字——`file-changed-watcher.ts` 用 chokidar 且传 `awaitWriteFinish: { stabilityThreshold: 200, pollInterval: 50 }`。Qoder CLI 的 `FileChanged` 早已在 23 个事件里，但 `watchPaths` 的定义只挂在 `CwdChanged` 一节（“Absolute paths to register with the `FileChanged` watcher”），`SessionStart` 的 `hookSpecificOutput` 只有 `additionalContext`，官方因此没有说明冷启动时第一个被观察的文件从哪里点名。Codex 与 Kimi Code 都没有这一类事件：Codex 官方 Hooks 页 14 个事件里 `watch`、`FileChanged`、`CwdChanged`、`ConfigChange` 与 `watchPaths` 全部 0 次命中，`filesystem` 一词只出现在 MCP 工具名 matcher 示例里；Kimi 2.5.2 的 20 个事件里唯一按时间触发的是每 60 秒的 `SessionHeartbeat`，而 `[[hooks]]` 只接受 `event`/`matcher`/`command`/`timeout` 四个字段的限制也让 `watchPaths` 一类输出键写不进配置。三家都把它做成不能阻断的事件——Claude “FileChanged hooks have no decision control. They can\'t block the file change from occurring.”、Qwen “Hook output cannot veto or undo a write or add model context.”、Qoder 事件表 exit 2 blocks 一列为 “—”，因此它是通知与同步机制而不是守卫；三家也都各自提醒自触发风险，Claude 写 “A looser guard loops forever, because `perl -i` rewrites the file even when it substitutes nothing and Claude Code runs the hook again after every rewrite.”，Qwen 写 “A hook that writes a watched file can trigger itself; avoid those writes or deduplicate the work.”，Qoder 则没有相关提醒。',
      ],
      products: {
        claude: {
          entry:
            '`/hooks` 查看已加载配置；settings Hook 可写入设置、Plugin，或放在 Skill 与 Subagent 的前置元数据中。mod 走插件入口：会话内 `/plugin install token-chart@your-org` 或 shell 中 `claude plugin install token-chart@your-org` 安装，`/plugin` 的 Installed 页签逐个禁用或卸载，shell 安装后在已开会话里执行 `/reload-plugins`；`/plugin` 页签下方以 `1 mod active · first-mod` 这样的暗色行给出当前会话加载的 mod 数量与名称；安装前用 `claude plugin validate ./some-mod` 审计，输出的 `hooks:` 与 `calls:` 两行分别列出它处理的事件和它请求 Claude Code 执行的动作。开发时用 `--plugin-dir` 按会话加载本地目录。',
          location:
            '用户、项目、Local、Managed settings；Plugin 使用 `hooks/hooks.json`。mod 是插件组件：同一个 `hooks/hooks.json` 顶层除 `hooks`（形状与 `settings.json` 的 `hooks` 对象一致）外还可写 `modules`，官方示例为 `{ "modules": ["./register.js"] }`，数组只放一个相对该文件的路径，指向的模块就是 mod 入口。manifest 仍是 `.claude-plugin/plugin.json`，mod 不新增强制字段；用到 `$.state` 或向 mods API 追加命名空间时，按 manifest 的 `types` 键提供 `types/index.d.ts`；`.test.ts`/`.test.tsx` 文件由 `claude plugin test` 运行。',
          behavior:
            'settings Hook 可在工具前后、权限请求、提示提交、会话、压缩、Subagent、任务和通知等节点运行并返回控制结果。mod 的函数 Hook 在 Claude Code 自己的进程里被调用：入口模块是 ES module，导出 `register(on, options)`，`options` 携带 manifest 声明的 `userConfig` 字段值并填充默认值；每个 Hook 形如 `async ($, e, next) => next(e)`，`$` 是 mods API，`e` 是深度冻结的事件输入，`next(e)` 是中间件式的后续 Handler，跑完其余 Hook 再跑 Claude Code 自身行为并解析为事件结果。`turn.step` 与 `process.spawn` 的 Hook 是 async generator，其余是 async function。事件覆盖 `tool.call`/`tool.check`/`tool.describe`、`prompt.submit`/`fill`/`suggest`/`edit`/`compose`/`section`/`context`/`attachment`、`skill.prompt`、`attribution.text`、`command.run`/`command.describe`、`config.set`/`config.describe`、`turn.start`/`step`/`complete`、`session.start`/`end`/`compact`/`receive`/`send`/`append`/`attach`/`detach`/`measure`、`agent.offer`/`agent.spawn`、`ui.render`/`resolve`/`press`/`input`/`select`/`focus`/`scroll`/`close`/`message`、`plugin.register`、`engine.create`、`telemetry.log`/`telemetry.mark`；另有 `classic.<Event>`（如 `classic.Stop`、`classic.PostToolUse`）逐个对应 settings Hook 事件，每个 mods API 方法本身也是名为 `<namespace>.<method>` 的事件（如 `fs.read`、`model.complete`、`ui.open`）。一个 Hook 对事件可以只观察、改写，或直接给出答案而不执行原动作。settings Hook 的退出码语义是：`0` 为成功并在 stdout 是 `{...}` 时按 JSON 解析控制结果；`2` 是阻断错误，在可阻断事件上无论是否打印 JSON 都阻断，连 JSON 里的 `permissionDecision: "allow"` 也压不过它，阻断原因取 JSON 阻断决定里的 reason、否则取 stderr；其他退出码在多数事件上不单独阻断——带通过 schema 校验的 JSON 时忽略退出码只看 JSON，JSON 校验失败或 stdout 无法解析时是非阻断错误、动作继续，stdout 是纯文本或为空时也是非阻断错误、动作继续并在 transcript 显示 `<hook name> hook error` 通知加 stderr 首行（前缀 `Failed with non-blocking status code:`）。官方明确警告：多数事件上退出码 2 是唯一能只靠代码阻断的退出码，没有合法 JSON 时退出码 1 按非阻断错误处理、动作照常继续，尽管 1 才是 Unix 惯例的失败码，策略型 Hook 要写 `exit 2`。Hook 启动不了也落在同一个非阻断桶里：脚本路径不存在或不可执行时 shell 以 127 一类退出码结束，通知带解释器的消息（例如 `Failed with non-blocking status code: /bin/sh: /path/to/hook.sh: No such file or directory`），多数事件上动作继续。HTTP Hook 的非 2xx 状态与连接失败都是非阻断错误、执行继续；MCP Tool Hook 在工具返回 `isError: true` 或此刻 Server 未连接时产生非阻断错误、执行继续。**文件变更观察**（2026-11-08 复核官方 Hooks 参考页 289,929 字节）：`FileChanged` 自 v2.1.83 起可用，逐字为 “Runs when a watched file changes on disk. Claude Code detects changes with a filesystem watcher, not by inspecting tool calls, so it runs the hook no matter what changed the file: an `Edit` or `Write` tool call, a script Claude runs with `Bash`, or a process outside Claude Code entirely. A common use is reloading environment variables when project configuration files change.”，`DirectoryAdded` 到 v2.1.219 才加入。`matcher` 在这一事件上有两个角色，逐字为 “**Build the watch list**: the value is split on `|` and each segment is registered as a literal filename in the working directory, so `\".envrc|.env\"` watches exactly those two files. Regex patterns are not useful here: a value like `^\\.env` would watch a file literally named `^\\.env`.” 与 “**Filter which hooks run**: when a watched file changes, the same value filters which hook groups run using the standard matcher rules against the changed file\'s basename.”；`### Matcher patterns` 另有两句例外 “`FileChanged` and `StopFailure` use a narrower exact-match set of letters, digits, `_`, and `|` only.” 与 “The `FileChanged` event doesn\'t follow these rules when building its watch list.”。观察清单的动态部分逐字为 “To watch files you can\'t name up front, return `watchPaths` from a hook to update the watch list dynamically. Claude Code starts the watcher only when something names a file to watch, so seed the list with a FileChanged group whose matcher names at least one file, or with a SessionStart or CwdChanged hook that returns `watchPaths`. The matcher still filters which hook groups run when a watched file changes, so give the group that handles dynamic paths an omitted matcher, which matches every watched file and adds nothing to the watch list. A `\"*\"` matcher also matches every file, but Claude Code registers it in the watch list like any other value, as a literal file named `*`.”，即 **watcher 是懒启动的、必须有人先点名文件**；三个注册入口的字段说明分别是 `SessionStart` 的 “`watchPaths` | Array of absolute paths to watch for FileChanged events during this session”、`CwdChanged` 的 “Array of absolute paths. Replaces the current dynamic watch list. Paths from your `matcher` configuration are always watched. Returning an empty array clears the dynamic list, which is typical when entering a new directory” 与 `FileChanged` 的 “Array of absolute paths. Replaces the current dynamic watch list. Paths from your `matcher` configuration are always watched. Use this when your hook script discovers additional files to watch based on the changed file”。输入字段是 `file_path`（“Absolute path to the file that changed”）与 `event`（“`\"change\"` for a modified file, `\"add\"` for a created file, or `\"unlink\"` for a deleted file`”）。该事件**没有决策控制**：“FileChanged hooks have no decision control. They can\'t block the file change from occurring.”、“Claude Code reads `watchPaths` and `systemMessage` from their JSON output and discards `continue`. In interactive sessions, it shows the `systemMessage` as a brief terminal notification. The message doesn\'t reach the SDK message stream.”，“Exit code 2 behavior per event” 表对应行为 “| `FileChanged` | No | Shows stderr to user only |”，Decision control 表把它与 `Setup`、`Notification`、`SessionEnd`、`PostCompact`、`InstructionsLoaded`、`StopFailure`、`CwdChanged`、`DirectoryAdded` 并列为 “None | No decision control. Used for side effects like logging or cleanup”。官方两处把它定位成工具匹配的替代品：`### PreToolUse` 写 “To run a hook when a specific file changes on disk, whatever wrote it, use FileChanged instead of matching file-editing tools by name. Unlike PreToolUse, Claude Code runs FileChanged hooks after the change, and they have no decision control, so they can\'t block the write.”，`### PostToolUse` 写 “Claude Code doesn\'t run a `PostToolUse` hook matching `Edit|Write` when a `Bash` command or a process outside Claude Code rewrites the same file.”。生命周期图把 `FileChanged`、`CwdChanged`、`DirectoryAdded`、`ConfigChange` 与 `Notification` 一起归为 “standalone async events”。',
          scope:
            '用户、项目、本地、托管、Plugin、Skill 与 Agent 多种作用域。mod 只能由插件携带，不能写在 `settings.json` 里；组织可用 `allowManagedModsOnly` 只放行托管来源的 mod。',
          components:
            'settings Hook 的 Handler 类型包括 command、HTTP、MCP Tool、prompt 和 agent；mod 增加进程内 JS/TS 函数模块这一类，入口文件后缀可为 `.js`、`.mjs`、`.cjs`、`.jsx`、`.ts`、`.mts`、`.cts` 或 `.tsx`。mod 除改写事件外还能绘制界面：在 transcript 旁画 pane、在提示词上方画 band，带页签、按钮和文本框，也能替换或重绘 Claude Code 自己画的部件（工具调用行、spinner、对话框），并能新增一个直接运行自己函数、不经过 Claude 回合的 `/command`；同一文件内的变量在各 Hook 之间共享。v2.1.288 增加 `$.ui.selection()`，返回全屏模式下最后选中的文本，选区落在单个 transcript 行内时一并返回该行。**Handler 类型按事件受限**：官方参考页列出 “Events that support `command`, `http`, and `mcp_tool` hooks but not `prompt` or `agent`:” 共 18 个——`ConfigChange`、`CwdChanged`、`DirectoryAdded`、`Elicitation`、`ElicitationResult`、`FileChanged`、`InstructionsLoaded`、`MessageDisplay`、`Notification`、`PostCompact`、`PostModelSwitch`、`PreCompact`、`PreModelSwitch`、`SessionEnd`、`StopFailure`、`SubagentStart`、`WorktreeCreate` 与 `WorktreeRemove`，因此文件变更观察只能用 command、HTTP 与 MCP Tool 三类 Handler；`PermissionRequest` 支持 `command`、`http`、`mcp_tool` 与 `prompt` 但不支持 `agent`，`SessionStart` 与 `Setup` 只支持 `command` 与 `mcp_tool`。`FileChanged` 与 `CwdChanged` 另可使用 `CLAUDE_ENV_FILE`，逐字为 “`CLAUDE_ENV_FILE` is available for SessionStart, Setup, CwdChanged, and FileChanged hooks. Other hook events don\'t have access to this variable, and neither does a hook that runs in PowerShell, whether through `\"shell\": \"powershell\"` or by default on Windows without Git Bash.”，写进该文件的变量保留到后续 Bash 命令、直到下一次 `CwdChanged` 事件时被清除。',
          loading:
            'settings Hook 配置在会话启动或重新加载时汇总，`/hooks` 用于检查当前生效配置。mod 随所属插件加载：`plugin.register` 在模块即将加载时触发，`engine.create` 在为该 mod 构建 mods API 时触发，`session.start` 对每个已加载 mod 在首条提示词前触发一次、该 mod 重载后再触发一次；`session.end` 在会话结束或执行 `/clear`、`/resume`、`/branch` 时触发。',
          surfaces:
            'settings Hook 的事件在终端会话、IDE 扩展、桌面端和云会话中一致触发。mod 的 Hook 在终端（含编辑器集成终端与 JetBrains 插件）、桌面端 Code 页签、VS Code 扩展聊天面板、`claude -p` 与 Agent SDK、Remote Control（在本机会话中）以及能带到云会话的插件中执行；界面绘制只出现在终端和桌面端 Code 页签，VS Code 聊天面板、`claude -p`、Agent SDK 和云会话中不渲染，桌面端还有一批仅终端可用的元素。桌面端的 WSL 会话不加载插件，因此 mod 的 Hook 与绘制都不生效。',
          permissions:
            'Hook 可阻止工具或提示继续；项目 Hook 属于可执行代码，需要信任其来源。mod 以用户权限在进程内运行且不进沙箱——即使开启 Bash 沙箱，mod 启动的进程也在沙箱之外；它能读写文件、启动程序、发起网络请求、读取环境变量与 API Key 等密钥、查看并改写提示词与工具调用、不询问就行动，也能批准工具调用从而绕过 `ask` 规则或 `PreToolUse` 阻断，并消耗账号用量。官方要求只安装可信作者与可信市场的 mod，并在安装前用 `claude plugin validate` 审查 `hooks:` 与 `calls:`。',
          conditions:
            '事件支持的输入、输出和退出码语义不同；不能假设所有 Handler 都可用于每个事件。失败处理（2026-11-04 复核，官方 Hooks 参考页 286,102 字节、Hooks 指南页 66,413 字节、Agent SDK Hooks 页 49,119 字节）：v2.1.295 起 command 与 HTTP Hook 支持 `onFailure`，更新日志逐字为 “Added `onFailure: \"block\"` for command and HTTP hooks: a hook that can\'t start, times out, or exits with an unexpected code blocks the action instead of letting it through”（更新日志提交 `602df92bf481ed904533e95c09f740f40aab5aed`）；**官方参考页与指南页现在都已收录该键**，此前记录的「官方 Hooks 参考的公共字段表与 Hooks 指南在核对日期都没有出现 `onFailure`，因此取值集合、默认值、能否按事件或按作用域覆盖都记为未确认」随之过期。Command Hook 字段表逐字为 “Whether the action that triggered the hook goes ahead when the hook fails: `\"continue\"` or `\"block\"`. See Block the action when a hook fails for `\"block\"` and for leaving the field unset. Requires Claude Code v2.1.295 or later”，HTTP Hook 字段表逐字为 “What happens to the action when the hook fails: `\"continue\"`, the default, or `\"block\"`. See Block the action when a hook fails. Requires Claude Code v2.1.295 or later”，**即取值集合就是 `\"continue\"` 与 `\"block\"` 两个、默认值是 `\"continue\"`**；该键按 Handler 类型而不是按事件或作用域生效——它不在 `#### Common fields` 公共字段表里（公共字段仍只有 `type`、`if`、`timeout`、`statusMessage` 与 `once`），`prompt`、`agent` 与 `mcp_tool` 三张字段表也都没有它。参考页新增的 “Block the action when a hook fails” 一节开头逐字为 “On most events, when a hook fails or times out, Claude Code still carries out the action. A policy hook with a wrong path or a crashing script then lets everything through. To block the action instead, set `\"onFailure\": \"block\"` on a `command` or `http` hook.”，并把「失败」定义成五类：启动不了（“a command hook fails to start, for example because the script or executable doesn\'t exist”）、退出码非 0 非 2（“counts for a command hook even if it printed JSON that allows the action, such as `permissionDecision: \"allow\"`. To return a JSON decision, exit 0”）、HTTP 错误（“an HTTP hook\'s connection fails, or the response status isn\'t 2xx”）、超时（“the hook reaches its `timeout`”）与输出无效（“the JSON output can\'t be parsed or fails schema validation. For an HTTP hook, a 2xx body that is neither empty nor a JSON object also counts. Plain-text stdout from a command hook isn\'t a failure”）。效果口径逐字为 “With `\"block\"` set, a failure does what exit code 2 does on that event, except on `PermissionRequest`, where it denies the request. For example, a `PreToolUse` failure blocks the tool call and a `UserPromptSubmit` failure blocks the prompt.”，而同页 “Exit code 2 behavior per event” 表的 `PermissionRequest` 行写 “Exit code 2 isn\'t honored for this event and the permission flow proceeds unchanged. Deny through the `decision` object instead”，两处对照说明 **`\"block\"` 在 `PermissionRequest` 上比退出码 2 更强**；无效范围逐字为 “The field has no effect on these hooks: **`Stop`, `SubagentStop`, `TaskCompleted`, and `TeammateIdle` hooks**: exit code 2 on these events sends Claude back to keep working, and Claude can\'t repair a hook that won\'t run” 与 “**Background command hooks**: command hooks that set `async` or `asyncRewake`”。阻断时的用户可见文案是 `PreToolUse:Bash hook error: [node ${CLAUDE_PROJECT_DIR}/.claude/hooks/check-command.js]: failed; blocking because onFailure is \"block\"` 加解释器自己的错误输出，超时后把 `failed` 换成 `timed out`，官方给的自测办法就是故意让脚本缺失再让 Claude 跑 `ls` 并写 “Without `onFailure` set, the same missing script is a non-blocking error and `ls` runs.”；`#### Timeouts` 与 `#### Other exit codes` 两节的 non-blocking 说明都改成带 “Unless the hook is one whose failure blocks the action” 前置条件，`PreToolUse` 上超时的 `command`/`http`/`mcp_tool` Hook 因此只对设了 `\"block\"` 的那部分阻断调用，WARNING 也改成 “Exit code 1 without valid JSON output is a non-blocking error unless the hook is one whose failure blocks the action, even though 1 is the conventional Unix failure code.”；Hooks 指南页的两处呼应逐字为 “With an exit code besides 0 and 2 and no valid JSON output, the action proceeds on most events, unless the hook is one whose failure blocks the action. A hook with `onFailure` set to `\"block\"` is one example.” 与 “**Any other status, or the request fails**: Claude Code reports a non-blocking error and lets the action continue. To make a failed endpoint block the action, set `onFailure: \"block\"` on the hook.”。**平台条件的 fail-closed 默认**：“Failed hooks on Windows without Git Bash” 一节写明，Windows 上没有 Git Bash 时 shell 形式（未设 `shell`）的 `PreToolUse` 或 `PermissionRequest` command Hook 只要退出码不是 0 或 2 就算失败并阻断该次调用，即使它打印了并不拒绝该调用的 JSON，文案逐字为 `blocking because Git Bash wasn\'t found, so only exit code 0 or 2 counts as this hook\'s verdict.`（“Before v2.1.309, the message read …” 给出旧措辞），节首 NOTE 逐字为 “On Windows without Git Bash, a shell-form `PreToolUse` or `PermissionRequest` command hook that fails with `onFailure` unset can instead block the tool call.”；官方给的恢复放行办法正是写 `\"onFailure\": \"continue\"`，而装上 Git for Windows（或设 `CLAUDE_CODE_GIT_BASH_PATH`）后这条默认又消失，因此想让 PowerShell 守卫 Hook 在有无 Git Bash 两种情况下都阻断，必须显式写 `\"onFailure\": \"block\"` 并同时设 `\"shell\": \"powershell\"`；跑单个 `.exe` 的 Hook 则改用 exec form（程序写 `command`、参数写 `args`）加 `\"onFailure\": \"block\"`。**v2.1.317 把同一开关扩到 Agent SDK 回调 Hook**（2026-11-03T01:25:46Z 发布，更新日志固定到提交 `964d69565952a176ac1975ed218362991db71433`，1,142,787 字节、最新段 `## 2.1.317`），逐字为 “Added `onFailure: \"block\"` for Agent SDK hook callbacks, so a callback that fails blocks the action instead of letting it run”；SDK 侧字段写在 matcher 上而不是单个回调上（Matchers 表逐字为 “`onFailure` | `\"continue\" | \"block\"` | `undefined` | What a failed callback does. Set `\"block\"` to block the action when a callback fails. In Python, use `on_failure`”），需 TypeScript Agent SDK v0.3.317 或 Python Agent SDK v0.2.177 及以上；默认失败时动作照常放行、应用侧收到 `tag` 为 `hook_callback_failed` 的 `SDKInformationalMessage` 警告（Python 从 `SystemMessage.data` 读 `tag`），回调抛错、返回不合校验的输出、或走了一条没有 `return` 的路径都算失败，官方因此写 “Return `{}` when the callback has no opinion. With `\"block\"` set, a path with no `return` blocks the action. A callback that catches its own error and returns `{}` isn\'t failing, so let the error propagate from a guard.”；阻断后工具结果里含 `failed; blocking because onFailure is \"block\"` 且 “Claude doesn\'t see your error text”。SDK 侧的事件例外逐字为 “**`Stop`, `SubagentStop`, `TaskCompleted`, and `TeammateIdle`**: these events ignore the option, so the action goes ahead.”、“**`PermissionRequest`**: the block counts only if it arrives before your `canUseTool` callback answers.” 与 “**`PostToolUse`**: the tool has already run, so Claude receives the failure as feedback.”；超时一句为 “A callback that exceeds its timeout follows Hook timeout. With `\"block\"` set, a timeout also blocks `PreCompact`, `Elicitation`, and `WorktreeCreate`.”，不设 `\"block\"` 时的逐事件默认是 `PreToolUse` 阻断该次工具调用、`UserPromptSubmit` 与 `UserPromptExpansion` 阻断提示词、`PreModelSwitch` 阻断切换、`PostToolUse` 与 `PostToolUseFailure` 保留工具结果继续、`Stop` 与 `SubagentStop` 算没有决定、`SessionStart` 算没有输出、其余只记录继续；设了 `\"block\"` 而 Claude Code 无法满足时 “the query fails at startup and sends no prompt”，错误含 `does not honor`（版本太旧）或 `did not register your hooks`（会话已在运行、没注册你的 Hook）。未设该键时按上面的默认放行，另有按事件的 fail-closed 例外：`WorktreeCreate` 任何非零退出码都让创建失败（Hook 失败或缺少路径即创建失败，command Hook 在 stdout 打印路径、HTTP Hook 返回 `hookSpecificOutput.worktreePath`）、`WorktreeRemove` 在目录事后仍存在时任何非零退出码都让移除失败、`PreModelSwitch` 上被超时取消的 Hook 阻断本次模型切换、Agent SDK 回调 Hook 在 `PreToolUse` 上超时则阻断该次工具调用。超时由 `timeout` 字段按秒覆盖：`command`、`http`、`mcp_tool` 默认 600 秒，在 `UserPromptSubmit`、`PreModelSwitch`、`PostModelSwitch` 上默认降为 30 秒，在 `MessageDisplay` 上降为 10 秒；`prompt` 默认 30 秒、`agent` 默认 60 秒；`SessionEnd` 的各类型 Hook 共享 1.5 秒预算，设置里写了更长的单 Hook `timeout` 时预算抬到与之一致、上限 60 秒；`async: true` 的 command Hook 不强制执行 `timeout`；v2.1.312 起 `timeout` 低于 1 秒按 1 秒算（更新日志逐字为 “a `timeout` under 1 second now counts as 1 second”），而官方 Hooks 参考页 `#### Common fields` 的 `timeout` 行与 `#### Timeouts` 一节在核对日期都还没有这个下限。除 `async: true` 的 command Hook 外，达到 `timeout` 的 `command`/`http`/`mcp_tool` Hook 被取消并丢弃输出，因而在多数事件上超时的 Hook 不给出任何决定；`PreToolUse` 上超时的这三类 Hook 不阻断工具调用，调用继续走正常权限流程，官方直接写不要指望卡住的 Hook 充当闸门。Stop Hook 连续阻断 8 次且其间没有工具调用时由 Claude Code 覆盖，脚本要自己读 `stop_hook_active` 提前退出。并发：v2.1.302（2026-10-16 发布）起 prompt 与 agent 两类 Handler 在同一个事件上至多 12 个同时运行、其余排队等自己的轮次，更新日志逐字为 “Changed prompt and agent hooks so that at most 12 of one event run at a time; the rest wait their turn”（固定到提交 `c017428c8c27e604840435048d5bce6a9a22c040`）；v2.1.312（2026-10-27 发布，更新日志固定到提交 `0e1f4789406477380b267a01f3ddd50b0211e5b3`）改为按会话计，逐字为 “Changed prompt and agent hooks to run at most 24 at a time per session, sub-agents included, plus at most 12 that have waited longer than their event\'s timeout; a `timeout` under 1 second now counts as 1 second”，即上限从 12 抬到 24、计数单位从「同一事件」变成「每个会话」且 Subagent 的 prompt/agent Hook 计入同一预算，另外容许至多 12 个等待时间已超过其事件 `timeout` 的排队 Hook；官方 Hooks 参考页在 2026-10-28 复核时（该页 282,379 字节，全文可取）已在 “Hook handler fields” 一节写出并发段落，2026-11-04 再复核（该页已增至 286,102 字节、本次新增的是 `onFailure`）该段逐字未变、全页仍没有出现 24 这个数字，逐字为 “When an event fires, its matching hooks run in parallel. If more than 12 of them are prompt or agent hooks, 12 of those run at once and the rest start as running ones finish. Each waiting hook\'s `timeout` starts counting when that hook starts.”，紧接一段是 “If you define the same handler in more than one settings file, it runs once. A plugin\'s or skill\'s copy of the same handler stays separate.”。两处此前记为未确认的问题因此有了官方口径：数字只约束 prompt 与 agent 两类 Handler，该句没有给 command、http 与 `mcp_tool` 任何上限；排队等待的时间不计入 Hook 自身的 `timeout`，`timeout` 从该 Hook 真正开始运行时才起算。仍记为未确认的是计数单位——参考页写「同一事件 12 个」而 v2.1.312 更新日志写「每会话 24 个、含 Subagent」，参考页没有出现 24 这个数字、也没说 Subagent 是否共用预算，因此按事件还是按会话计、24 与 12 相加是否意味着同一会话最多 36 个 prompt/agent Hook 同时在跑，都只有一处一手记录；参考页也没有 `sequential` 一类强制顺序执行的字段。核对日期最新 Release 是 v2.1.318（2026-11-04T00:01:03Z 发布），v2.1.313 至 v2.1.318 之间涉及 Hook 的条目都不改变上面的并发口径：v2.1.314 的 “Fixed a PreCompact hook with very large output making compaction fail or repeat; each hook\'s output is now cut at 10,000 characters”、“Fixed hooks matching Bash not running on shell commands started by the Monitor tool; such hooks can block or ask, but not approve or rewrite those commands” 与 “Changed hook `if` conditions such as `Monitor(tail *)` to match the Monitor tool\'s shell commands as `Bash(tail *)` matches Bash\'s” 属输出上限与事件匹配，v2.1.316 的 “Fixed PowerShell hooks not blocking on exit code 2 when the command begins with a type cast, `param`, `using` or an attribute” 属退出码 2 的阻断可靠性，v2.1.311 的 “Fixed `SubagentStop` hooks running about twice a minute for each running subagent instead of once when it finishes” 属事件触发频次；v2.1.310 的 “Windows: Fixed PreToolUse and PermissionRequest hooks letting a tool call through when Git Bash is missing and the hook\'s command is only quoted strings, such as a quoted path” 与上面 “Failed hooks on Windows without Git Bash” 一节是同一条线索，本次已按官方文档展开。mod 需要 v2.1.287 及以上且默认开启；早期访问用的 `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS` 必须删除，v2.1.287 起忽略该变量，设为 `0` 也关不掉 mod。关闭方式有四种：`--safe-mode` 只在本次会话停用全部已安装 mod（同时停用其他自定义）；`~/.claude/settings.json` 的 `"disableAllHooks": true` 在所有会话停用用户安装的 mod，settings Hook 与自定义状态行一起停，组织托管的继续运行；组织设置 `allowManagedModsOnly` 停用用户安装的 mod 但保留该插件其余组件（skills、commands、agents 与 MCP servers 仍加载）；或在 `/plugin` 的 Installed 页签逐个禁用。权限提示不能被重绘。限额：单个事件里 Hook 自身执行 10 秒（不含 `next` 以及除 `$.clock.sleep` 外的 mods API 调用），`.catch` 处理器 1 秒，全部 `session.end` Hook 合计 1.5 秒；`$.process.run` 默认 30 秒、最长 10 分钟；`$.model.complete` 的 `maxTokens` 默认 1024，上限为 64000 或模型输出上限；`$.fs.read` 与 `$.fs.write` 单文件 4 MiB；`$.store` 合计 4 MiB JSON；`$.session.messages()` 只取最新 4096 条；`Text` 的单个字符串子节点 10000 字符，`Code` 与 `Markdown` 各 10000 字符，`Svg` 131072 字符，`Raster` 的 `columns` 至多 512、`rows` 至多 256，`Image` 接受 PNG 或 RGBA 字节至多 2 MiB 或一个文件路径；`$.ui.invalidate(\'ui.render\')` 节流为每秒 10 次（终端中可见 pane、展开的 band 与提示词下方 hint 行为每秒 30 次），更早的调用被合并；`$.ui.toast` 默认显示 4 秒，可传 `{ timeoutMs }`；command、tool、subagent 类型与 pane 名称只允许字母、数字、`_` 和 `-`，最长 64 字符；`claude plugin test` 单个测试 5 秒，除非测试自行设置 `timeoutMs`。官方文档未给出 mod 数量上限。内置 mod 有 `cc-plugin-agents-md`、`cc-plugin-diff`、`cc-plugin-plugin-authoring`、`cc-plugin-sec-default`、`cc-plugin-telemetry` 与 `cc-plugin-you-should-know`，后者在 v2.1.287 以 `/plugin enable cc-plugin-you-should-know@builtin` 开启，仅第一方会话且开启遥测时可用。**文件变更观察的条件与边界**（2026-11-08 复核）：`FileChanged` 与 `CwdChanged` 同版引入，v2.1.83 更新日志逐字为 “Added `CwdChanged` and `FileChanged` hook events for reactive environment management (e.g., direnv)”（固定到标签提交 `cada21c89dc76cb0355fdeee659806674abfd38c`），`DirectoryAdded` 属 v2.1.219（逐字为 “Added `DirectoryAdded` hook that fires after `/add-dir` or the SDK `register_repo_root` control request registers a new working directory mid-session”，固定到标签提交 `0c188278cdf9b8b717c2740550bdb0f69c02f6b5`）；2026-11-08 复核 main 的 `CHANGELOG.md`（1,176,779 字节、最新段 `## 2.1.319`）里 `FileChanged`、`DirectoryAdded` 与 `watchPaths` 一共只有这两条命中，`watchPaths` 一词从未出现在更新日志中，因此 v2.1.83 到 v2.1.319 之间没有任何改变观察清单语义、watcher 启动条件或该事件阻断能力的条目。**自触发是官方点名的失败模式**：`FileChanged` 一节在规范化换行的示例后写 “Its `grep` guard tests for the same thing `perl` removes, a CR at the end of a line, so the run after a normalization exits without touching the file. A looser guard loops forever, because `perl -i` rewrites the file even when it substitutes nothing and Claude Code runs the hook again after every rewrite.”，即守卫条件写松一点就会无限循环。`DirectoryAdded` 不等待 Hook（“Claude Code doesn\'t wait for the hook: the add completes immediately, and the hook runs in the background with the 600-second default timeout.”），在沙箱与权限状态刷新之后触发因而沙箱化工具已能看到新目录、但 Hook 命令自身不进沙箱，且三种情况不触发——用 `--add-dir` 启动旗标传入（由 `SessionStart` 覆盖）、在 `/permissions` 的 Workspace 页签添加、添加的目录已经是工作目录或在其内部；它的 matcher 只取 `slash_command` 与 `register_repo_root`，`systemMessage` 的投递按来源分两路（`slash_command` 在下一轮作为上下文交给 Claude、`register_repo_root` 只写 debug 日志）。官方参考页没有给出观察路径数量上限、目录递归深度、写入稳定判定间隔、符号链接处理规则，也没有说明哪些 Surface 不启动 watcher，这几点记为未确认；`FileChanged` 与 `CwdChanged` 的 `systemMessage` 在交互会话显示为一条简短终端通知且 “The message doesn\'t reach the SDK message stream.”，SDK 与 headless 侧因此看不到它。',
          sources: [
            'claude-hooks',
            'claude-hooks-guide',
            'claude-hooks-onfailure-doc',
            'claude-hooks-filechanged',
            'claude-v2183-filechanged-changelog',
            'claude-hooks-windows-no-gitbash',
            'claude-hooks-guide-onfailure',
            'claude-agent-sdk-hooks-onfailure',
            'claude-v21295-hooks-changelog',
            'claude-v21317-sdk-onfailure-changelog',
            'claude-v21302-hooks-concurrency-changelog',
            'claude-v21312-hooks-concurrency-changelog',
            'claude-hooks-concurrency-doc',
            'claude-plugins-components',
            'claude-mods-overview',
            'claude-mods-reference',
            'claude-v21287-mods-changelog',
            'claude-v21288-mods-changelog',
          ],
        },
        codex: {
          entry:
            '`/hooks` 检查、信任或禁用非托管 Hook；也可直接编辑 JSON/TOML 配置。',
          location:
            '用户 `~/.codex/hooks.json` 或 `~/.codex/config.toml`；项目 `.codex/hooks.json` 或 `.codex/config.toml`；Plugin 可携带 Hook。',
          behavior:
            '覆盖 PreToolUse、PermissionRequest、PostToolUse、PreCompact、PostCompact、SessionStart、SessionEnd、UserPromptSubmit、SubagentStart、SubagentStop、Stop 共 11 个事件，另有中断当前回合时触发的 `Interrupt`（不为 Subagent 运行）；官方 Hooks 文档页在 2026-11-04 复核时（48,643 字节）已把这 12 个连同 `PreModelRequest`、`PostModelRequest` 一起列出，共 14 个。提交 `70b3bb6d8814ab3f2045238b4ae14c43da99783b`（PR #55144 “Add observation-only model request lifecycle hooks”，2026-10-18T22:36:47Z 合入，改动 46 个文件）另加 `PreModelRequest` 与 `PostModelRequest` 两个观察型事件，配置层的事件表因此从 12 个键变成 14 个；该提交已是标签 rust-v0.165.0（2026-10-27T20:09:38Z 发布，标签对象 `e374836b2728d9b7aa981c2902649e640a2edaa8` 指向提交 `360319d8dee62d87e2d59fc0c21805d79519cfed`）的祖先——GitHub compare 接口对该提交给出 `status: behind`、`ahead_by: 0`——该标签下 `codex-rs/protocol/src/hooks.rs`（7,482 字节）的 `HookEventName` 列出 14 个 serde 名、前两个就是这两个事件，而事件表已不在 `codex-rs/config/src/hook_config.rs`（该文件在同一标签只剩 2,293 字节、改为 `pub use codex_protocol::hooks::HookEventsToml` 重导出），此前按 `matcher_groups_mut` 返回的 `[(HookEventName, &mut Vec<MatcherGroup>); 14]` 记事件数的坐标随之失效。这两个事件围绕每次模型请求尝试触发、包含重试（提交说明逐字为 “Add `PreModelRequest` and `PostModelRequest` hooks around model request attempts, including retries.”），官方文档页现在给出的同口径说明逐字为 “Use these hooks to log model requests, including retries within the same turn. `PreModelRequest` runs before each attempt. `PostModelRequest` reports the outcome. Both receive the model and `turn_id`, plus `agent_id` and `agent_type` when available. Hook output is diagnostic only. It can\'t change the model\'s context or block a request.”，触发时机表把它们归到 “For each model request attempt” 一行；输入载荷 `ModelRequestHookInput` 的字段是 `session_id`、`turn_id`（取 `step.turn.sub_id`）、`cwd`（`AbsolutePathBuf`，取 `tool_hook_cwd(&step.environments, &step.turn)`）、`transcript_path`（可为 null）、`model`（取 `step.settings.model_info.slug`）与两个可选的 `agent_id`/`agent_type`（Subagent 上下文，无值时不序列化），事件本体以 `hook_event_name` 标签展开；`PostModelRequest` 另带 `status`（`completed`/`failed`/`cancelled`）、`error`（可为 null 的字符串）与 `token_usage`（schema 里必填、值可为 null，含 `cached_input_tokens`、`input_tokens`、`output_tokens`、`reasoning_output_tokens`、`total_tokens` 五个必填项与默认 `0` 的 `cache_write_input_tokens`），文档页也以 “`PostModelRequest` includes three additional fields:” 引出同样三项。事件模块的文件头注释逐字为 “//! Observation-only lifecycle hooks. Output is logged, never interpreted as control flow.”，提交说明也写明 “Treat hook output as diagnostic data without allowing it to veto requests or alter model context.”：`parse_completed` 只在没有执行错误且退出码为 0 时把这次运行记 `HookRunStatus::Completed`、否则记 `Failed`，stdout 在注释 “// Observer stdout is diagnostic, including any JSON that looks like a control directive.” 之后只写进 `tracing::debug!(stdout = %result.stdout, "model request hook output")`，stderr 与执行错误各压一条 `HookOutputEntryKind::Error`，返回的 `ParsedHandler` 的 `data` 恒为 `()`，因此这两个事件上退出码 2 不阻断模型请求也不改写上下文。command Hook 的退出码语义按事件分散记录而不是给一张总表：`Exit 0 with no output is treated as success and Codex continues`；`PreToolUse`、`PostToolUse`、`UserPromptSubmit`、`Stop`、`SubagentStop` 各自写明 “You can also use exit code `2` and write the blocking/feedback/continuation reason to `stderr`”；除 `2` 以外的非零退出码在该页没有单独定义。失败与超时默认放行（2026-11-04 复核逐字未变）：官方逐字写 “An explicit supported denial can block an action, but a `PreToolUse` callback error, timeout, or malformed response can fail the hook without blocking the tool.”；`mcp_tool` Hook 是 “A hook can block an operation when the tool returns a blocking decision. Errors, missing servers, and unavailable tools don’t block the operation.”；`SessionEnd` 是 “If a command times out or exits with an error, Codex reports it as a hook failure.”，且该事件属 advisory、输出不会左右 Codex 也不会让线程保持打开。**没有文件变更观察事件**（2026-11-08 复核官方 Hooks 页，HTML 541,305 字节、去标签后正文 49,797 字符）：全页 14 个事件里 `watch`、`Watch`、`watcher`、`FileChanged`、`file changed`、`CwdChanged`、`ConfigChange` 与 `watchPaths` 全部 **0 次命中**，`filesystem` 只有 3 次且都在 MCP 工具名 matcher 示例里（`mcp__filesystem__read_file`、`mcp__filesystem__.*` 与 “Match the MCP tool name, such as `mcp__filesystem__read_file`.”）。分组表逐字为 “During a turn | `PreToolUse`, `PermissionRequest`, `PostToolUse`, `PreCompact`, `PostCompact`, `UserPromptSubmit`, `SubagentStop`, `Stop`”、“For each model request attempt | `PreModelRequest`, `PostModelRequest`”、“When you interrupt an active turn | `Interrupt` (doesn\'t run for subagents)”、“When a session or subagent starts | `SessionStart`, `SubagentStart`” 与 “When the main thread ends | `SessionEnd` (doesn\'t run for subagents)”，没有任何一组是按文件系统状态触发的。Codex 侧因此只有按工具调用触发的路径：`PreToolUse` “can intercept Bash, file edits performed through `apply_patch`, MCP tool calls, and other local function tools”，`PostToolUse` “runs after supported tools produce output, including Bash, `apply_patch`, MCP tool calls, and other local function tools. For Bash, it also runs after commands that exit with a non-zero status. It can\'t undo side effects from a tool that already ran.”；两者都不覆盖 Codex 之外的进程写文件，也没有任何把路径注册进观察清单的输出字段。',
          scope:
            '用户、可信项目、Managed 与 Plugin 来源。',
          components:
            '执行的 Handler 类型是 command，可同步执行或 `async: true` 后台执行（rust-v0.148.0 发布）；prompt 与 agent 配置可解析但运行时跳过；`mcp_tool` Handler（`type = "mcp_tool"`，字段 `server`/`tool`/`input`/`timeout`/`statusMessage`）调用已配置 MCP Server 的工具，`input` 必须是可表示为 TOML 的对象，引擎执行随 rust-v0.148.0 发布（PR #38705）：`${field.nested}` 占位符展开保留 JSON 类型，输出沿用 command Hook 的输出约定，且始终同步执行；SessionEnd 事件与 Managed 必选 Hook 不支持 `mcp_tool`，`timeout` 缺省 600 秒（配置识别提交 `85fc4def358b`）。`PreModelRequest` 与 `PostModelRequest` 在配置层与其他事件同形（`HookEventsToml` 里各是一个 `Vec<MatcherGroup>`），但 `dispatcher.rs` 的 `select_handlers_for_matcher_inputs` 把这两个事件与 `UserPromptSubmit`、`Stop`、`Interrupt` 合并成直接 `=> true` 的一支，因此配置的 `matcher` 对它们不做筛选、命中该事件的全部 Handler 都会跑；`discovery.rs` 的 `normalize_command_hook` 只对 `SessionEnd | Interrupt` 有具名分支，其余事件走 `_ => timeout_sec.unwrap_or(600).max(1)`，所以这两个事件的默认超时是 600 秒、下限 1 秒，command 与 `mcp_tool` 两类 Handler 的 `timeout_sec` 都经同一个函数归一。',
          loading:
            '项目 Hook 需要工作区信任；`/hooks` 展示来源并提供相应控制；`hooks/list` 以 handler 专属元数据返回 Hook，MCP Tool Hook 带 `handlerType: "mcpTool"` 及 server/tool 字段，TUI `/hooks` 浏览器展示 MCP Server 与 MCP Tool 条目（rust-v0.148.0 发布）。main 分支提交 `70b3bb6d8814` 之后 TUI `/hooks` 浏览器的 Event 表多出两行，Description 逐字为 `PreModelRequest` → “Before a model request”、`PostModelRequest` → “After a model request, including failures”，`engine/mod.rs` 的 `event_name_label` 同步给出 `pre-model-request` 与 `post-model-request` 两个标签；同一提交把这两个事件写进 app-server 协议 schema（`HookEventName.ts`、`HookStartedNotification.json`、`HookCompletedNotification.json`、`HooksListResponse.json`）、`analytics` 的事件名映射与 Python SDK 的生成客户端 `v2_all.py`，提交说明把这一批概括为 “expose the new events through configuration, protocol schemas, generated clients, and the hooks browser”。',
          permissions:
            'PreToolUse 或 PermissionRequest 等事件可影响是否继续；Managed Hook 不由普通用户关闭。',
          conditions:
            'prompt/agent Handler 可解析但运行时跳过；async command Hook 在后台运行，不能阻断、批准或改写触发它的操作，输出在下一个安全点交付，每会话最多 8 个并发后台 Hook，未完成的随会话结束取消，SessionEnd 始终同步（rust-v0.148.0 发布，官方 Hooks 文档已列 `async` 字段）；rust-v0.148.0 的 CLI 会话运行时曾未提供 MCP 执行器（`codex-rs/core/src/session/mod.rs` 传 `mcp_executor: None`），`mcp_tool` Hook 启动时以 "MCP invocation is not available yet" 告警跳过；`input` 中 `${field.nested}` 占位符从事件 JSON 解析、字段缺失时该 Hook 失败；会话内实际执行来自提交 `87070a77925c`（PR #39296）：经会话共享 MCP 运行时执行、含 Managed Hook 配置，只允许已连接、已列入目录且策略允许的工具，不可用 Server 立即失败且不启动或重连，不经模型工具审批、不触发递归 Hook，超时受 Server 侧上限约束；提交 `d35e5495f991`（PR #39331）把 Hook MCP 调用改经当前连接集执行、不等待 Server 启动或重连，生效超时取 Hook 请求与 Server 工具超时的较短者。这两个提交在 2026-10-28 复核时都已是标签 rust-v0.165.0 的祖先（compare 接口各给出 `status: behind`、`ahead_by: 0`），该标签下 `codex-rs/core/src/hook_mcp_executor.rs`（2,143 字节）的 `CoreHookMcpExecutor` 持有会话的 `Arc<McpRuntime>` 与 `thread_id`、在 `execute` 里把 `threadId` 写进请求元数据后按 `call.timeout` 调用工具，`codex-rs/hooks/src/engine/mcp_runner.rs`（6,360 字节）的入口签名是必填的 `executor: &dyn HookMcpExecutor`，"MCP invocation is not available yet" 字样在 `hook_mcp_executor.rs`、`hook_runtime.rs`（52,157 字节）与 `session/mod.rs`（231,366 字节）里都已不存在、后两个文件也不再出现 `mcp_executor` 标识符，因此「会话运行时接入尚未发布」这条记录随该标签过期；官方 Hooks 文档页在核对日期仍只写 “`command` and `mcp_tool` handlers are supported. `prompt` and `agent` handlers are parsed but skipped.”，没有记录会话运行时的 MCP 执行器接入。超时按秒配置：省略 `timeout` 时多数 Hook 用 600 秒，`SessionEnd` 与 `Interrupt` 默认 1 秒且最多 3 秒（后台运行时同样是 1 秒默认、3 秒上限），`mcp_tool` 的 `timeout` 默认 600 秒并取 Hook 与 Server 两个超时中较短的一个、等待 MCP elicitation 响应的时间不计入。返回不受支持字段时按失败处理但放行：`PreToolUse` 上 `permissionDecision: "ask"`、旧式 `decision: "approve"`、`continue: false`、`stopReason` 与 `suppressOutput` 都能解析但尚不支持，Codex 把该次 Hook 运行标记为 failed、报告错误并让工具调用继续；`PostToolUse` 上 `updatedMCPToolOutput` 与 `suppressOutput` 同样标记 failed、报告错误并继续正常处理工具结果；`SessionStart` Hook 可能在 MCP Server 就绪前运行，此时不阻断会话。唯一记录的 fail-closed 是 `PermissionRequest`：“Don\'t return `updatedInput`, `updatedPermissions`, or `interrupt` for `PermissionRequest`; those fields are reserved for future behavior and fail closed today.” 没有 `onFailure`、`on_failure`、`failClosed` 或任何同类把失败改成阻断的配置键（2026-11-04 复核该页 48,643 字节，四个键名全页均未出现，失败默认放行的四句逐字未变）；相关开关是 `[features] hooks = false` 整体关闭、`allow_managed_hooks_only = true` 只保留管理员托管 Hook、`--dangerously-bypass-hook-trust` 本次调用跳过 Hook 信任持久化，以及 `async: true` 把 command Hook 变成不能阻断的后台执行。模型请求 Hook 的发布与文档状态：核对日期 Codex 最新的非 alpha Release 是 rust-v0.165.0（2026-10-27T20:09:38Z 发布），提交 `70b3bb6d8814`（2026-10-18T22:36:47Z 合入）已是该标签的祖先，标签下 `codex-rs/protocol/src/hooks.rs` 的 `HookEventName` 列出 14 个 serde 名（前两个即 `PreModelRequest` 与 `PostModelRequest`）、`codex-rs/hooks/src/events/model_request.rs` 与 `codex-rs/hooks/src/engine/dispatcher.rs` 都在，因此这两个事件已随稳定通道发布，此前记录的「合入 main 尚未发布」过期；**官方 Hooks 文档页在 2026-11-04 复核时也已收录这两个事件**（触发时机表新增 “For each model request attempt | `PreModelRequest`, `PostModelRequest`” 一行、`matcher` 支持表把它们标为 “not supported | Both events run for each model request attempt”，并给出 “Hook output is diagnostic only. It can\'t change the model\'s context or block a request.” 的散文说明），此前记录的「官方文档页事件表仍是 12 个、全页没有这两个事件」与「已发布但官方文档未列」随之过期。rust-v0.165.0 的发布说明没有提到它们（该版与 Hook 相关的五条是 “#56182 Add AWS SigV4 signing to network proxy MITM hooks”、“#56234 Emit prompt telemetry only after hooks accept input”、“#56302 Add hook configuration to environment attachments”、“#56304 Add support for environment-scoped managed hooks” 与 “#56343 Run environment hooks on their owning executors”，属其他方面、本次未处理），仓库 `CHANGELOG.md` 在 main 仍只有一条与 Hook 无关的 `## Unreleased`；核对日期最新的 Release 是 alpha 通道 rust-v0.168.0-alpha.1（2026-11-04T02:54:53Z）与 rust-v0.167.0-alpha.4，两者的发布说明都只有 “Release <版本号>” 一行、没有任何条目。它们的时序与过滤：提交说明写 “Wait for synchronous post-request hooks before dispatching tools, while asynchronous hooks allow streaming tool dispatch to continue.”，`stream_events_utils.rs` 的注释逐字为 “handle_tool_call dispatches immediately, not when its future is polled. With a synchronous post-model hook, dispatch only when the turn drains tools.”，即同步的 `PostModelRequest` 经 `defer_tool_dispatch` 推迟工具派发而 `async: true` 的不推迟；`can_apply_control_effects()` 仍规定只有同步 Hook 能施加控制效果，但这两个事件的解析结果 `data` 恒为 `()`，所以同步与否只改时序、不给出阻断能力。`hook_runtime.rs` 的 `hooks_for_model_request` 在 `step.turn.session_source` 为 `SessionSource::Internal(InternalSessionSource::MemoryConsolidation)` 或 `SessionSource::SubAgent(SubAgentSource::MemoryConsolidation)` 时改用 `hooks.for_memory_consolidation(executor_hook_sources_for_step(step))`，即记忆整理回合只带 executor 作用域的 Hook，其余回合用会话自己的 Hook 集；`run_model_request_hooks` 先发 `preview_model_request` 的 started 事件再执行并发 completed 事件，因此这两个事件也进 `/hooks` 的运行报告与 telemetry（`hook_run_metric_tags` 已加两个事件名）。并发口径（2026-10-28 复核，文档与源码都未变）：官方文档写 “Matching hooks from multiple files all run.”、“Multiple matching command hooks for the same event are launched concurrently, so one hook can’t prevent another matching hook from starting.” 与 “Codex runs up to eight background hooks concurrently per session. Additional hooks wait until a running hook finishes.”，同一节还写 “Each matching invocation runs independently, and background hooks can finish in a different order than they started.”、“When the session ends, Codex cancels unfinished background hooks and discards output that hasn’t been delivered.” 与 “`SessionEnd` hooks always run synchronously.”；源码侧 `codex-rs/hooks/src/engine/dispatcher.rs`（标签 rust-v0.165.0，22,340 字节）的 `execute_handlers_with_metadata` 仍把每个同步 Handler 逐个 `pending.push(...)` 进同一个 `FuturesUnordered` 后统一 `await`，文件里没有条数上限、信号量或分批逻辑，`HookExecutionMode::Async` 的走 `engine.command_runtime.schedule_async_hook(...)`，所以 8 个的上限只约束后台 Hook，同步 Hook 的同事件并发数没有公布。该标签另给出一层新的顺序口径：`HandlerSourcePath::ExecutorScoped`（environment 作用域）的 Handler 先被挑出同步批次放进 `executor_handlers`，等同步批次全部结束并按配置顺序排序后，只在 `should_stop || !should_block` 成立时用 `schedule_async_task` 逐个投递，失败只压一条 `executor-scoped hook failed` 警告，因此 environment 作用域 Hook 排在本地同步 Hook 之后、异步执行且不参与阻断；官方文档没有描述这层顺序。',
          sources: [
            'codex-hooks',
            'codex-hooks-events-recheck',
            'codex-hooks-no-file-watch',
            'codex-hooks-mcp-tool',
            'codex-hooks-mcp-runner',
            'codex-v0148-release',
            'codex-hooks-session-mcp',
            'codex-hooks-mcp-route',
            'codex-hooks-model-request-commit',
            'codex-hooks-model-request-source',
            'codex-hooks-model-request-schema',
            'codex-hooks-model-request-config',
            'codex-hooks-model-request-dispatch',
            'codex-hooks-model-request-timeout',
            'codex-hooks-model-request-runtime',
            'codex-hooks-model-request-order',
            'codex-hooks-model-request-browser',
            'codex-v0165-hooks-release',
            'codex-hooks-events-v0165',
            'codex-hooks-dispatcher-v0165',
            'codex-hooks-mcp-session-v0165',
          ],
        },
        qwen: {
          entry:
            '`/hooks` 查看和管理已加载 Hook；设置文件和 Extension 都可声明。实验性 mod 经 `qwen extensions install <dir> --consent` 安装，在 `experimental.mods` 开启且工作区受信任后加载。',
          location:
            '用户与项目 `settings.json`；Extension 可内联 Hooks、引用文件或使用默认 `hooks/hooks.json`。',
          behavior:
            '覆盖提示、模型、工具、权限、会话、压缩、Subagent、通知等生命周期，并能阻断或返回修改后的控制结果。command Hook 的退出码表逐字为：`0` 是成功、由 stdout 里的 JSON 对象控制行为，其他 stdout（包括 `42` 这类裸 JSON 值）按纯文本处理——在 `SessionStart`、`UserPromptSubmit`、`UserPromptExpansion` 上加进模型上下文，在其余事件上保留为 system 消息，而看起来像 JSON 对象却解析失败的输出永不加进模型上下文；`2` 是阻断错误，忽略 stdout 并把 stderr 作为错误反馈交给模型；其他退出码是非阻断错误，stderr 只在 debug 模式下显示、执行继续。HTTP Hook 的 3xx 响应按其他非 2xx 状态一样处理，即一次非阻断的 Hook 失败，且绝不联系重定向目标。执行顺序与并发（2026-10-28 复核，文档固定在提交 `1dc74d58384ca1fe8c29730970f1f7c60d1e5265`，PR #14129，2026-10-25T14:50:26Z，96,533 字节）：默认并行——“By default, hooks execute in parallel for better performance”，需要顺序时在 Hook 定义里写 `sequential: true`（“Use `sequential: true` in hook definition to enforce order-dependent execution”），顺序执行的 Hook 可以把改过的输入传给链上的下一条（“Sequential hooks can modify input for subsequent hooks in the chain”）；并行时所有 Hook 收到同一份输入、“the last replacement in configuration order wins, and an invalid replacement from any of them stops the call”，顺序执行时每条拿到上一条的替换结果作为 `tool_input`。顺序执行时的来源次序另有明确规定，`## Hook Configuration` 一节逐字为 “Within one event, sequential hooks from settings and extensions run in this order: Project, User, System, Extension.”，同一句前还写 “Hooks in the system settings files (System and SystemDefaults) load with the source System and, like user hooks, regardless of folder trust.”。工具批次另有两条规则：“When several calls from one turn are scheduled together, as in the interactive terminal UI, every call\'s hooks run before any of them runs.” 与 “A shell command that a hook could still rewrite is not run in parallel with other tool calls.”；`MessageDisplay` 一类中途 Hook 是 “At most one mid-stream hook execution per message is in flight at a time; while one runs, newer debounced payloads _replace_ the queued one rather than piling up behind it.”。事件表在该坐标下列出 22 个事件（2026-11-08 复核标签 v0.27.0、提交 `03b0c2435be1890a21b117860eaf389076787275` 下的同一文档已增至 105,235 字节、23 个事件，新增的是 `FileChanged`）；相对此前记录的提交 `52ae53b02a17d6214e9e4f81578f2ba2725539a6`（96,225 字节），该文档唯一的改动是 `UserPromptSubmit` 的 `additionalContext` 去重句 “If the sanitized payload is byte-identical to a block a hook already delivered earlier in the same session, it is not appended again, so a deterministic standing instruction reaches the model once rather than once per turn; this is unconditional with no opt-out, and any change to the payload re-injects it.”，与并发无关。**文件变更观察**（2026-11-08 复核，标签 v0.27.0、提交 `03b0c2435be1890a21b117860eaf389076787275`）：v0.27.0 新增第 23 个事件 `FileChanged`，事件表逐字为 “| `FileChanged` | After an explicitly watched file is added, modified, or deleted | Basename of the changed file |”，专节 `#### FileChanged` 的 Purpose 逐字为 “Observes additions, modifications, and deletions of explicitly watched files in local, non-managed sessions. Changes may come from Qwen Code, shell commands, editors, or other processes. The common input fields identify the listening session, including when another session writes a shared directory.”，专页 `docs/users/features/file-changed-hooks.md`（7,621 字节）另写 “Only file events are delivered. Directory-self `addDir` and `unlinkDir` events are not delivered. Integrations tracking a watched root\'s own lifecycle must check filesystem state (for example with `stat`) and reconcile independently; a child\'s `unlink` does not prove that the root was removed.” 与 “The common `session_id` and `cwd` belong to the listening session; they do not identify the writer. Multiple sessions watching a shared directory can each receive its changes. File content is not included.”。事件字段是 `{ "file_path": "/home/me/work/demo/.envrc", "event": "change" }`，`file_path` 为绝对路径、`event` 取 `add`／`change`／`unlink`；Matcher 一栏逐字为 “Filters against the file basename using the existing matcher rules. Literal cwd filenames separated by `|` also register static paths. Omitted or empty matchers, `*`, and `.*` register no static paths; they receive events from the session\'s watched paths, including dynamically registered paths.”，`### Matcher Patterns` 表把它归到新的 “File Events” 一行并标 “✅ Regex”，表后专段逐字为 “For `FileChanged`, registering static paths uses literal filenames in cwd; filtering events uses the basename and the rules below.”，即**注册与过滤是两件事**。该事件不能阻断：专节写 “Hook output cannot veto or undo a write or add model context.”，专页写 “`FileChanged` cannot veto or undo a write or add model context.” 与 “Watcher or hook failures are logged and leave the originating file operation unchanged.”。输出只有 `watchPaths` 一个键，专节逐字为 “Successful synchronous `hookSpecificOutput.watchPaths`, with `hookEventName: \"FileChanged\"`, replaces the dynamic watch list with absolute files or recursive directories. The last valid, explicit list in hook execution order wins; `[]` clears it, while omitted or invalid lists leave it unchanged. Async output does not register paths. Static registrations remain active.”；`SessionStart` 侧新增的同一键逐字为 “`hookSpecificOutput.watchPaths`: absolute files or recursive directories to watch for `FileChanged`, from synchronous output with `hookEventName: \"SessionStart\"`.”，专页补上 “A successful synchronous `SessionStart` hook can register absolute files or directories through `hookSpecificOutput.watchPaths`. Directories are watched recursively, including children created later. Recursive discovery skips `.git` and `node_modules` subtrees. To observe a path inside them, register that file or directory explicitly. Special file types are ignored, and ordinary directories have no depth limit. Initial registration waits for watcher readiness before `SessionStart` returns.”。静态注册的边界逐字为 “Static roots accept only bare literal filenames, including dotfiles. Regex/glob metacharacters and path separators do not create static roots. Existing directories and paths that cannot be inspected are excluded; missing files may be watched for creation. Static file discovery observes their parent directory while excluding unrelated entries before traversal. Use explicit `watchPaths` for recursive directories. Changing the session working directory relocates static roots before relocation finishes; explicit absolute dynamic roots stay unchanged.” 与 “Static registration does not expand globs or scan directories recursively.”；动态清单的替换语义表四行为 “A list of absolute files or directories | Replaces the previous dynamic list”、“`[]` | Clears the dynamic list”、“Omitted or invalid `watchPaths` | Keeps the previous dynamic list”、“Output from an async hook | Does not register or change paths”，并要求 “All entries must be absolute paths; one invalid entry makes the list invalid.”。观察限制逐字为 “The initial directory scan is not replayed. Native filesystem events from a recent write may arrive after registration. Explicitly registered symbolic-link files and directory roots observe their targets, including links in ancestor paths. Notifications use the configured alias; registering multiple aliases to one target produces a notification for each alias. Refresh registration after retargeting a link. Symbolic links discovered inside a recursive root are not traversed. Events are reported after writes settle.” 与 “Watching is best effort: filesystem coalescing, inaccessible paths, process downtime, and path reconfiguration can leave gaps. Integrations that require a complete synchronized copy must handle initial scans, reconciliation, and retry.”；原子写临时文件按 “Recursive discovery ignores atomic-write temporary files named `<target>.<12 lowercase hex characters>.tmp`, including delayed renames and orphans. Explicitly registering such a file still observes it.” 处理。官方给的示例用途是把 `/memory` 显示的记忆目录注册进观察清单，并提醒 “Choose a log or synchronization destination outside the watched paths to avoid triggering the handler with its own writes.” 与 “A hook that writes a watched file can trigger itself; avoid those writes or deduplicate the work.”；专页同时写 “Only explicitly registered paths are watched: memory folders are not registered automatically, and there is no dedicated auto-memory enable/disable event.”。',
          scope:
            '用户、可信项目与 Extension 来源；项目 Hook 随仓库共享。',
          components:
            '公开文档包括 command、HTTP 与 prompt；运行时还存在 session-only 的内部 function Hook（由 Skill 系统使用，与下面的 mod 不同）。自 v0.25.3 起另有实验性 Mod API：`experimental.mods: true` 开启后，受信任工作区里启用的 Claude 或原生 Qwen 扩展可在 `hooks/hooks.json` 顶层用 `modules`（官方示例 `{ "modules": ["./register.js"] }`，路径相对该文件且必须在扩展内部）声明一个 ESM 入口（单个 `.js`/`.mjs`/`.cjs`/`.ts`/`.mts`/`.cts`），导出 `register(on, options)` 注册函数 Hook，官方称之为 mod 并写明这是 “a small subset of the Claude Code Mod API”、“not full compatibility with existing Claude Mods”。mod 运行在「每插件一个、位于会话 worker 内的隔离 QuickJS 环境」，没有 Node、文件系统与网络 API，并有内存、栈、源码/输出与执行时长上限；它能用 `$.command.register({ name, description, argumentHint })` 在 `session.start` 期间注册不经模型请求运行的 Slash 命令，用 `on(<event>, ...)` 拦截 `session.start`/`session.end`/`command.run`/`command.register`/`ui.log`/`tool.call`/`tool.check` 七类事件（事件名支持精确名、`command.*` 一类前缀、`*` 与单个 `!session.*` 否定，`!*` 与 `!!...` 被拒绝），用 `$.ui.log` 写 transcript（text 模式走 stderr、JSON 模式走 `system/ui_log`，都不进模型输入，每条上限 2,000 字符），模块变量在 stream-json 或交互进程里跨回合保留、`/clear` 与 `/resume` 不重载模块，而 `state`/`store`、渲染、流式事件、热重载、JSX/TSX、运行时 package import、内置命令拦截、工具注册与 `$.tool` API 都未实现。工具拦截（`tool.call` 返回 `{deny}` 或 `{result}`、`tool.check` 的 `next` 返回带 `decision`（`allow`/`ask`/`deny`）的对象）只在 headless 会话可用；交互终端（Ink 与 OpenTUI）只支持命令、生命周期与日志，显式 `tool.call`/`tool.check`/`tool.*` 注册会在模型请求前拒绝初始化。`pluginConfigs.<mod>.toolDialect` 取 `claude` 或 `native`（默认）切换工具名方言（`run_shell_command`↔`Bash`、`edit`↔`Edit`、`write_file`↔`Write`），`pluginConfigs.<mod>.options` 对应 manifest 的 `userConfig`，选项按 SystemDefaults → User → System 合并、工作区设置即使受信任也忽略。执行控制字段有两个：`sequential: true` 让同一事件的多条 Hook 按配置顺序执行（默认并行），`async: true` 只有 command 类型支持、让该 Hook 在后台运行且不阻塞主流程（“Only `command` type supports asynchronous execution. Setting `"async": true` runs the hook in the background without blocking the main flow.”）。事件输出侧自 v0.27.0 起多一个跨事件共用的注册键 `hookSpecificOutput.watchPaths`：`SessionStart` 与 `FileChanged` 两个事件的**同步**输出都能返回它，值是绝对文件或目录的数组、整体替换上一次的动态观察清单，`[]` 清空、省略或非法则保持原样、异步 Hook 的输出不注册路径，多个 Hook 都返回时 “the last valid, explicitly supplied list in hook execution order wins”，且 “All entries must be absolute paths; one invalid entry makes the list invalid.”，静态文件名注册在动态清单被替换或清空后仍然有效。`FileChanged` 自己的 `hookSpecificOutput` 只有这一个键——它没有 `PreToolUse` 的 `permissionDecision`、也没有 `UserPromptSubmit` 的 `additionalContext`，官方专页明确写它 “cannot veto or undo a write or add model context”。底层实现是 `packages/core/src/hooks/file-changed-watcher.ts`（9,585 字节）里的 chokidar watcher，`watch()` 选项为 `ignoreInitial: true`、`followSymlinks: false` 与 `awaitWriteFinish: { stabilityThreshold: 200, pollInterval: 50 }`，`ignored` 回调跳过既非文件也非目录的 stat、匹配 `/\\.[0-9a-f]{12}\\.tmp$/` 的原子写临时文件（显式注册的同名文件除外）以及动态根内路径分量含 `.git` 或 `node_modules` 的条目，并且**没有传 `depth` 选项**，与文档 “ordinary directories have no depth limit” 一致；调试通道是 `createDebugLogger(\'FILE_CHANGED_WATCHER\')`。',
          loading:
            '启动时合并配置；Extension 热重载与 Hook 管理入口可更新当前运行时状态。',
          permissions:
            '项目 Hook 只在可信文件夹加载；Hook 自身的命令和网络访问需要按可执行配置审查。',
          conditions:
            '内部 function Hook 不是普通配置格式；公开可配置范围应以 command、HTTP 与 prompt 为准。失败与超时按事件硬编码，没有 `onFailure`、`on_failure`、`failClosed` 一类把失败改成阻断的配置键（2026-11-04 复核，文档固定在提交 `35aa4b76ae10a458632d23c9b0052af5a31b3885`，PR #16196，2026-11-03T15:54:00Z，98,620 字节，三个键名全页均未出现）：`PermissionDenied` 与 `InstructionsLoaded` 都明确写 Qwen 会等 Hook 跑完再继续，Hook 失败只记录、不改变结果（前者输出与退出码被忽略，后者失败不阻止加载）；`PostToolBatch` 的 Hook 失败或 15 秒内没跑完时批次带着原结果继续（“If the hooks fail, or do not finish within 15 seconds, the batch continues with its results unchanged.”）；`MessageDisplay` 的最终投递最多等 5 秒，超时只在 stderr 打一条警告；`StopFailure`、`SessionDelete` 属即发即忘（后者输出与失败都无法撤销删除），`PostCompact` 的输出被忽略、`decision`/`continue`/`additionalContext` 与退出码都不起作用。`timeout` 默认值按 Handler 分开：command 60 秒（取值 ≥1000 仍按毫秒读以兼容旧配置，`"30s"` 这类非正数值被忽略并回落到 60 秒默认）、http 600 秒、prompt 30 秒，SDK 注册的 function Hook 继续用毫秒；`async: true` 的 command Hook 默认 60 秒并占用 10 个并发异步槽之一，10 个槽占满时新的异步 Hook 被跳过。设置文件读不了或解析失败时保留上一份设置快照与正在运行的 Hook、不改动文件并报错，系统级设置文件出问题时其中已有的 Hook 保持原样而其他修改仍生效；事件名不认识时跳过并给出 `Invalid hook event name` 警告。文档在输入结构一节提醒：对安全敏感的 Hook，解码器失败会改变 fail-open 或 fail-closed 行为，管理员必须在上线前拿升级后的载荷对照已部署的 Hook 验证；官方 HTTP judgment adapter 示例本身对网络、超时与畸形响应一律 fail open，以免后端故障挡住合法工具调用。headless 下 `UserPromptSubmit` 的门禁时点在 2026-10-16 改过：提交 `52ae53b02a17d6214e9e4f81578f2ba2725539a6`（PR #14356 “fix(hooks): gate headless file and skill prompts before expansion”）给官方 Hooks 文档新增一段，逐字为 “In headless runs, an input that invokes a custom command or skill, including several stacked skills, is checked before the command expands. The hook runs once for that input, with `prompt` and `submitted_prompt` both set to the raw input, such as `/deploy staging`. A block stops the command before it runs: its `!{...}` shell commands do not run, a skill does not register its allowed tools or hooks, and no model request is made. When the input is allowed, its `additionalContext` is added once to the expanded prompt, and `UserPromptExpansion` still runs after the expansion. Hooks that the skill registers do not check the input that invoked it. Other slash commands, MCP prompts and saved workflows, and the interactive UI and ACP sessions, still run the hook on the expanded prompt.”，即 headless 运行里调用自定义命令或 Skill（含多个堆叠 Skill）的输入改在命令展开前受检、Hook 对该输入只跑一次且 `prompt` 与 `submitted_prompt` 都是原始输入，阻断因此能挡掉命令内嵌的 `!{...}` shell 命令、Skill 的 allowed tools 与 hooks 注册以及随后的模型请求；放行时 `additionalContext` 只加一次到展开后的提示词，`UserPromptExpansion` 仍在展开后运行，而 Skill 自己注册的 Hook 不检查触发它的那条输入。这条只覆盖自定义命令与 Skill：其他 Slash 命令、MCP prompt 与保存的 Workflow，以及交互式 UI 与 ACP 会话，仍对展开后的提示词运行该 Hook。发布状态：v0.25.3-preview.0（2026-10-16T18:28Z，标签提交 `d407c0bb3823118281fbfc178494f4525a2241b8`）的发布说明逐字列出 “fix(hooks): gate headless file and skill prompts before expansion by @qqqys in #14356”，稳定通道 v0.25.3（2026-10-19T06:06:37Z 发布，标签提交 `b28b0d948fa28b89750ac5f1525b95e1746f47ab`）的 Bug Fixes 逐字列出 “fix(hooks): gate headless file and skill prompts before expansion (#14356)”，因此这条已随稳定通道发布（此前记录的「稳定通道最新 Release 仍是 v0.25.2、尚未包含」随之过期）。Mod API 的边界：`experimental.mods` 默认关闭，开启后还要求受信任工作区与一个已启用的 Claude 或原生 Qwen 扩展，Agent Plugins v1 便携包继续忽略 hooks，安全模式、bare 模式与 `disableAllHooks` 都阻止加载 mod；Surface 上交互终端（Ink 与 OpenTUI）与 headless（`qwen -p`，text/JSON/stream-json 输出）可用，而 ACP、managed/SSH、sandbox 与 session-agent 入口在本版本不运行 mod（官方逐字 “Mods do not run in ACP, managed/SSH, sandbox or session-agent entry points in this version.”）；权限上 mod 不能把原生 deny 或 ask 提升为 allow、mod 写的 `rule`/`hook`/`ceiling` 不能创建宿主权限、`sensitive: true` 显式不支持且没有密钥存储或配置 UI；交互终端 mod 命令随 PR #14268（提交 `2eafeebc556075b24c5a922f2b565254195e4692`，2026-10-16T10:20:23Z 合入 main）接入并经 v0.25.3 稳定通道发布，官方文档 `docs/users/extension/mods.md` 在标签 v0.25.3（提交 `b28b0d948fa28b89750ac5f1525b95e1746f47ab`，24,532 字节）下可取到，作者 API 基于 Claude Code 2.1.296 声明、再入行为遵循 Claude Code 2.1.301。**`FileChanged` 的版本边界与 Surface 条件**（2026-11-08 复核）：该能力随稳定版 v0.27.0（2026-11-07T20:45:25Z 发布，标签提交 `03b0c2435be1890a21b117860eaf389076787275`）进入，发布说明 Complete Change List 的 Features 首条逐字为 “Added FileChanged hooks for local non-managed sessions, reporting add, change, and unlink events for watched files and directories. (#13969) by @samuelhsin”，Breaking Changes 一节写 “No known breaking changes.”；上一个稳定版 v0.26.9（2026-11-06T16:07:57Z，标签提交 `600aff0592bcfc21668ca4aba95a5b20c6491b86`）下 `docs/users/features/file-changed-hooks.md` 与 `packages/core/src/hooks/file-changed-watcher.ts` 两个路径都返回 **HTTP 404**，同一标签下的 `docs/users/features/hooks.md` 事件表仍是 22 行且 `FileChanged` 与 `watchPaths` 均为 0 次命中，因此 **v0.27.0 是首个包含它的 Release**。**Surface 条件**逐字为 “SSH execution environments, shell sandbox workers, and managed dispatchers do not start a local filesystem watcher. Normal hook enablement and trust rules still apply. Watching stops when its owning session shuts down.”，专节的 Purpose 也把适用范围限定为 “explicitly watched files in local, non-managed sessions”；跨机器边界另有一句 “Roots in another container or remote instance need a watcher in that filesystem owner; registering their paths on the host does not observe them.”，多工作区共享目录则要自己在业务 Handler 里去重（“Independent sessions can observe the same shared root, so deduplicate the work in the business handler.”）。**Handler 覆盖面记为未确认**：文档 prompt Handler 一节写 “Prompt hooks can be used with most hook events, including:” 后只列 `PreToolUse`、`PostToolUse`、`Stop`、`SubagentStop` 与 `UserPromptSubmit` 五个，既没把 `FileChanged` 列进去也没排除它，因此该事件能否用 prompt 与 HTTP Handler 没有一手口径。官方也没有给出观察路径数量上限、单会话 watcher 数量上限或写入稳定的判定间隔——`awaitWriteFinish` 的 200 毫秒稳定阈值与 50 毫秒轮询间隔只能在源码里读到，文档只写 “Events are reported after writes settle.”；`SessionStart` 侧的注册是同步等待的（“Initial registration waits for watcher readiness before `SessionStart` returns.”），因此观察清单很大会拖慢会话启动，但官方没有给这条等待设上限。',
          status: '源码确认',
          sources: [
            'qwen-hooks-current',
            'qwen-hooks-failure-current',
            'qwen-hooks-order',
            'qwen-hooks-headless-gate',
            'qwen-hooks-v0270-filechanged',
            'qwen-file-changed-hooks-doc',
            'qwen-file-changed-watcher-src',
            'qwen-v0270-filechanged-release',
            'qwen-v0269-no-filechanged',
            'qwen-v0253-preview0-release',
            'qwen-v0253-release',
            'qwen-mods-docs',
            'qwen-mods-interactive-commit',
            'qwen-extension-runtime-current',
          ],
        },
        kimi: {
          entry:
            '没有独立 `/hooks` 命令；在 `~/.kimi-code/config.toml` 的 `[[hooks]]` 中配置。',
          location:
            '独立 Hook 位于用户 `config.toml`；Plugin manifest 也可携带 Hook 配置。',
          behavior:
            '可监听提示、工具、权限、会话、压缩与 Subagent 等事件。脚本的响应由退出码与 stdout 两样东西决定：退出码 `0` 表示放行、`2` 表示阻断、其他数字默认放行。返回值表逐字为 `0`「正常结束，放行」→「继续执行，若标准输出（stdout）有内容可附加到上下文」，`2`「主动阻断」→「停止当前操作；错误输出（stderr，`console.error` 打印的内容）作为阻断原因」，其他非零值「脚本出错」→「默认放行（fail-open）」，超时或崩溃「脚本异常」→「默认放行（fail-open）」。也可以在 stdout 返回一段 JSON 阻断，官方示例是 `hookSpecificOutput` 里的 `permissionDecision: "deny"` 加 `permissionDecisionReason`。只有可阻断事件（`PreToolUse`、`Stop`、`UserPromptSubmit`）的返回值会影响主流程，其余事件属观察型事件、触发后即发即忘，不管脚本返回什么主流程都不会改变。**没有文件变更观察事件**（2026-11-08 复核标签 `@moonshot-ai/kimi-code@2.5.2`、提交 `1c142a007c10e881602690def96057c23a2baa12` 下的 `docs/zh/customization/hooks.md`，9,523 字节）：`## 事件一览` 表共 20 行——`UserPromptSubmit`、`UserPromptQueued`、`PreToolUse`、`Stop`、`TurnStarted`、`PostToolUse`、`PostToolUseFailure`、`PermissionRequest`、`PermissionResult`、`SessionStart`、`SessionEnd`、`SessionHeartbeat`、`SubagentStart`、`SubagentStop`、`TaskStarted`、`StopFailure`、`Interrupt`、`PreCompact`、`PostCompact` 与 `Notification`，全文对 `watch`、`FileChanged`、`监听` 与 `变更` 均为 **0 次命中**；`文件` 的 3 次命中没有一次指文件系统观察（两处说明 Hook 的执行位置——“钩子始终在运行 Kimi Code 的机器上执行，因此在远程会话中它们读到的是本机的文件和进程，而非目标环境的。” 与 “没有项目级 hook 文件，因此远程目标上检出的内容永远无法向你的会话注入 hook 定义。”，一处是配置面的 “`[[hooks]]` 只允许这四个字段，多写会导致配置文件加载失败。”），写成 `变化` 的 2 次都指 `Notification` 的 “后台任务状态变化时触发”。唯一按时间而不是按动作触发的是 `SessionHeartbeat`，逐字为 “会话存活期间每 60 秒触发一次，仅配置本事件时计时器才运行；payload 含 `uptime_ms`；`kimi web` 卸载会话期间暂停，恢复后 `uptime_ms` 重新计时”，与文件系统无关。配置面也不给注册观察路径留余地：`[[hooks]]` 的四字段限制意味着 `watchPaths` 一类输出键在这一家连写进配置都会让配置文件加载失败。',
          scope:
            '用户配置与已启用 Plugin；当前文档未列项目级独立 Hook 文件。',
          components:
            '独立配置当前只有 command Handler。',
          loading:
            '启动时读取配置；Plugin 改动通常需要 `/reload` 或新会话。',
          permissions:
            'Hook command 在本机执行；阻断与 fail-open 语义取决于退出码。文档给出明确边界：「即使脚本报错或超时，CLI 也不会因此中断你的工作」，这种“出错就放行”的设计称为 fail-open，用于避免 hook 异常阻塞主流程；紧随的 warning 写「正因为 fail-open，Hooks 适合做提醒和轻量拦截，但不应作为唯一的安全防线。对真正高风险的操作，仍需依赖权限审批和人工确认。」',
          conditions:
            '“命令表没有 `/hooks`”不等于没有 Hook 能力；Kimi 的入口是 TOML 配置。`[[hooks]]` 只允许 `event`（必填）、`matcher`（可选正则，不填匹配全部）、`command`（必填）、`timeout`（可选）四个字段，多写会导致配置文件加载失败，因此没有 `onFailure` 一类把失败改成阻断的开关，fail-open 不可配置。`timeout` 是整数秒、范围 1–600、默认 30 秒；非 Windows 平台上 hook 进程运行在独立进程组中，超时后 CLI 先发送信号让脚本有机会善后、再强制终止；hook 命令的工作目录是当前会话的项目目录。同一事件匹配多条规则时所有命中的 hook 并行运行，`command` 完全相同的多条规则只运行一次（2026-11-04 复核，该句在提交 `5f3ab5fac81e050fc2fa10787dd560655f377d16`（2026-10-29T12:43:07Z，9,523 字节）与此前记录的提交 `366fafbf921bb121d3906aa6b685f1045be4e54d`（8,549 字节）下逐字相同）。**失败处置在 2026-11-04 复核的文档里补上了明确口径**，逐字为 “当 hook 执行失败时（无法启动、超时或以错误退出码结束），CLI 会记录日志，并在会话中显示一次警告；之后的失败只记录日志。阻断决策保持 fail-open：失败的 hook 永远不会阻断操作。”——该段在历史坐标 `494df61ce9858c70a9f37a996614534bc9b1cd12`（8,319 字节）下不存在，**据此确认「命令无法启动」被官方明确归入失败形态之一、并按 fail-open 处理**，此前记录的「文档没有单独描述命令无法启动的情形，启动失败属于哪种取值记为未确认」随之过期；同时新增的两点是失败只在会话里警告一次、之后静默进日志，以及官方直接写下「失败的 hook 永远不会阻断操作」这句无条件结论。这条一次警告按 Hook、按事件还是按会话计数，官方没有说明，记为未确认。这条并行规则没有数字上限，`[[hooks]]` 也不接受 `sequential` 一类强制顺序执行的字段。工作目录有一条服务器路径修正：main 分支提交 `c1459a61845056832b85a0a220ee11a2bc5132f8`（PR #4242 “fix(server): run agent hooks in the session\'s working directory”，2026-10-15T11:38:24Z 合入）把 `AgentExternalHooksService` 的事件总线 Hook（`fireAndForgetTrigger(event)`）与 `PreToolUse`／`UserPromptSubmit`／`Stop`／`PreCompact` 四类 Agent 级 Hook 改为显式传 `cwd: sessionContext.cwd`；此前这些 Agent 级 Hook 没有传 `cwd`，Hook 运行器回落到 `bootstrap.cwd`，因而在引擎或服务器进程的启动目录里执行，与已经在会话目录执行的会话级 Hook 不一致。测试把引擎启动目录设为 `/launch-dir` 并断言 Agent 级 Hook 拿到会话目录 `/tmp`，`fullCompaction.test.ts` 另断言 `PreCompact`／`PostCompact` 载荷里的 `cwd` 是会话目录。该提交带 patch 级 changeset（`.changeset/hooks-session-cwd.md`，对 `@moonshot-ai/kimi-code` 与 `@moonshot-ai/kimi-code-sdk`），已随 Release `@moonshot-ai/kimi-code@2.3.0`（2026-10-21T05:51:43Z 发布）发布：`apps/kimi-code/CHANGELOG.md`（固定在提交 `4bad441fef34a6733f5c065ddea6c1a9c1c28e50`）的 `## 2.3.0` Patch Changes 逐字列出 “[#4242](https://github.com/MoonshotAI/kimi-code/pull/4242) [`c1459a6`](https://github.com/MoonshotAI/kimi-code/commit/c1459a61845056832b85a0a220ee11a2bc5132f8) Thanks [@wbxl2000](https://github.com/wbxl2000)! - Run hooks such as `PreToolUse` and `Stop` in the session\'s project directory, as documented, instead of the directory the server was started from.”，此前记录的「核对日期最新 Release 是 2.2.0、尚未发布」随之过期；官方中文 Hooks 文档没有提到这条服务器路径曾有差异，该文档自 2026-09-03 的 `494df61ce985` 之后改过两次：提交 `366fafbf921bb121d3906aa6b685f1045be4e54d`（PR #4284，2026-10-21T11:27:25Z）改 `SessionEnd` 与 `SessionHeartbeat` 两行、加入 `kimi web` 空闲卸载语义（属事件触发语义、本次未处理，该 PR 随 2.4.0 发布），提交 `5f3ab5fac81e050fc2fa10787dd560655f377d16`（2026-10-29T12:43:07Z，随 PR #4062 “feat: remote environments for SSH and Docker execution targets (phase 1: creation-time binding)”）把文件从 8,549 字节增到 9,523 字节并加入上面那段失败处置口径；2.3.0、`@moonshot-ai/kimi-code@2.4.0`（2026-10-28T11:45:13Z 发布）与核对日期最新稳定版 `@moonshot-ai/kimi-code@2.4.1`（2026-10-30T09:50:16Z 发布）都没有任何关于同一事件并发数、顺序执行或失败开关的条目，最新的 `2.5.0-canary.20261104024245-8fc5e22`（2026-11-04T02:57:42Z）同批提交也只涉及 wire 版本、FetchURL 私网地址、UTF-8 BOM 与 MCP OAuth 取消隔离，不涉及 Hook 失败语义。',
          sources: ['kimi-hooks-current', 'kimi-hooks-failure-current', 'kimi-hooks-session-cwd', 'kimi-v230-hooks-cwd-changelog', 'kimi-hooks-no-file-watch', 'kimi-plugins-current'],
        },
        qoder: {
          entry:
            '`/hooks` 管理 Hook：官方 Slash 命令参考列出该行、描述逐字为 “Manage Hooks.”，没有给出 synopsis 或子命令，Release Notes 记 CLI 1.0.8（2026-05-28）“Made /hooks command generally available for all users”，而 Hooks 页本身没有描述这个命令。配置仍写在 User、Project 或 Local settings 的 `hooks` 字段与插件的 `hooks/hooks.json` 里。',
          location:
            '`~/.qoder/settings.json`、项目 `.qoder/settings.json` 与 `.qoder/settings.local.json`；Plugin 可携带 `hooks/hooks.json`。',
          behavior:
            '覆盖工具、提示、权限、通知、会话、压缩与 Subagent 等节点，并按 Handler 返回结果控制流程。官方事件表列出 23 个事件：`SessionStart`、`SessionEnd`、`UserPromptSubmit`、`PreToolUse`、`PostToolUse`、`PostToolUseFailure`、`PermissionRequest`、`PermissionDenied`、`Stop`、`StopFailure`、`SubagentStart`、`SubagentStop`、`PreCompact`、`PostCompact`、`Notification`、`InstructionsLoaded`、`ConfigChange`、`CwdChanged`、`FileChanged`、`WorktreeCreate`、`WorktreeRemove`、`Elicitation`、`ElicitationResult`。退出码语义逐字为：`0` 成功、stdout 按下述规则解析；`2` 阻断、stderr 内容反馈给 Agent（只对支持阻断的事件生效）；其他取值是非阻断错误，stdout 被忽略、stderr 写进诊断日志、主流程继续。JSON 里的 `decision` 取 `"allow"` 或 `"deny"`，`"deny"` 等价于退出码 2。支持阻断的事件及效果分别是：`UserPromptSubmit` 退出 2 拒绝该提示词并把 stderr 展示给用户，`PreToolUse` 退出 2 把 stderr 作为错误返回给 Agent，`Stop` 退出 2 把 stderr 作为消息注入对话让 Agent 继续工作，`SubagentStop` 退出 2 把 stderr 注入 Subagent 对话，`PreCompact` 退出 2 阻止本次压缩，`ConfigChange` 退出 2 阻止改动应用到当前会话，`Elicitation` 退出 2 拒绝该 elicitation，`ElicitationResult` 退出 2 把 action 改写为 `decline`。其余事件上退出 2 不阻断。**文件变更观察**（2026-11-08 复核 Hooks 页，HTML 1,268,339 字节、去标签后正文 32,243 字符）：`FileChanged` 与 `CwdChanged` 同属官方 “Working Directory and Files” 分组，此前本仓库只把 `FileChanged` 当事件名记进 23 个事件的清单里。事件总览表两行逐字为 “| CwdChanged | — | — | old_cwd, new_cwd |” 与 “| FileChanged | filename basename | — | file_path, event |”，即 `FileChanged` 的 matcher 匹配文件名 basename、**退出码 2 不阻断**（“exit 2 blocks” 一列为 “—”）。`FileChanged` 一节逐字为 “Triggered when a watched file changes.”、“**matcher field:** Basename of the changed file (supports exact match, `|` multi-value, regex)”、附加输入字段 `{ "file_path": "/abs/path/file.ts", "event": "change" }` 加 “`event` values: `change` / `add` / `unlink`.”，输出为 “**hookSpecificOutput:** `additionalContext`, `watchPaths` (same as CwdChanged)”。观察路径的注册键定义只出现在 `CwdChanged` 一节的字段表里，逐字为 “`watchPaths` | Absolute paths to register with the `FileChanged` watcher”，同节另有 `additionalContext` 的 “Context injected into the conversation” 与输入字段 `{ "old_cwd": "/old", "new_cwd": "/new" }`；`CwdChanged` 自己也不能阻断（总览表 matcher 与 exit 2 两列都是 “—”）。',
          scope:
            'User、Project、Local 和 Plugin。',
          components:
            'command、HTTP、prompt 与 agent Handler。',
          loading:
            '随设置和 Plugin 加载；修改后的刷新方式取决于对应配置或插件重载入口。',
          permissions:
            '项目 Hook 只应在可信工作区启用；Hook 能阻断关键操作，但自身仍是本机可执行配置。`ConfigChange` 是唯一记录了强制生效例外的事件：`source` 为 `policy_settings` 时 Hook 仍会为审计目的触发，但改动强制执行、不能阻断。',
          conditions:
            '不同 Handler 的超时、响应字段和阻断条件不同，需要按事件文档逐项设置。`timeout` 按秒配置且默认值随 Handler 变化：command 600 秒、http 600 秒、prompt 30 秒、agent 60 秒。没有 `onFailure`、`on_failure`、`failClosed` 一类把失败改成阻断的配置键（2026-11-04 复核，规范地址已改为 `https://docs.qoder.com/cli/hooks`，三个键名全页均未出现，阻断只能靠退出码 2），Hooks 页也没有描述 Hook 命令启动不了（例如可执行文件缺失）或超过 `timeout` 之后的具体后果，这两点记为未确认。按事件另有硬编码例外：`WorktreeCreate` 任何非零退出码都算失败，`StopFailure` 与 `InstructionsLoaded` 只是通知、输出与退出码被忽略，`WorktreeRemove` 也只是通知、失败通过 stderr 呈现。`async: true` 让同组 Hook 全部在后台运行、不阻断当前操作，结果作为额外上下文注入下一个模型回合；`asyncRewake: true` 在后台运行且退出码为 2 时由 CLI 用 stderr/stdout/error 拼一条 system reminder 唤醒模型（官方说明为 “useful for long-running checks”），配套字段 `rewakeMessage` 覆盖注入的 system 消息前缀、`rewakeSummary` 覆盖一行摘要（最多 300 字符）；`continue: false` 请求停止后续执行。Release Notes 另有几条只在发行说明出现、Hooks 页没有展开的失败与超时相关记录：CLI 1.0.29（2026-06-25）“Aligned SessionEnd hook timeout and PreToolUse fail-closed behavior with strict semantics” 与 “Tightened hook validation: hookEventName is now required in hookSpecificOutput”，其中 `PreToolUse` 的 fail-closed 具体覆盖哪些失败形态、与 Hooks 页“其他退出码为非阻断错误”的关系，页面没有说明，记为未确认；CLI 1.0.14（2026-06-04）“Fixed session freeze when a hook subprocess hangs on timeout or abort”；CLI 0.2.5（2026-04-29）“Fixed hook process hangs with exit event and tree-kill” 与 “Fixed hook permission decisions discarded on partial failure”；CLI 1.0.17（2026-06-10）“Enhanced asyncRewake hooks with custom messages, non-interactive downgrade, and prefix matching” 与 “Allowed plugin hooks to bypass the --setting-sources filter”；CLI 1.0.47（2026-07-16）“Fixed an issue where the PreToolUse hook did not take effect in headless and SDK modes”，说明该事件在 Print Mode 与 SDK 下也应生效；CLI 0.1.32（2026-03-18）“Updated Windows hook execution to run via Git Bash”，是 Hooks 页没有记录的平台条件。执行顺序与并发在 2026-10-28 复核后仍没有官方口径：Hooks 页（HTML 1,601,368 字节、去标签后正文 33,169 字符）没有任何说明同一事件的多个 Hook 并行还是顺序执行的语句，也没有并发数字，全页连 “batch” 一词都没有出现，与顺序相关的只有配置合并口径 “All three sources are **loaded and merged together** (hooks for the same event do not override each other)”；组级 `async`（“all hooks in the group run in the background without blocking the current operation”）、条目级 `async`（“this single hook runs in the background; overrides the group-level `async`”）与 `asyncRewake` 都没有并发上限，因此同事件的执行顺序与并发数记为未确认。公开 Release Notes 在 2026-11-04 复核时（HTML 1,419,034 字节）最新条目为 **CLI 1.1.82（November 3, 2026，“Session status reporting via OSC 7501 and reconnection fixes”）**，其前是 1.1.81（October 29, 2026，“Introducing CodeMode and More Reliable Session Continuity”），这两版都没有任何提到 Hook、退出码、超时、信任或阻断的条目；仍是最新 Hook 条目的三版为 CLI 1.1.80（October 27, 2026，四条里没有 Hook 条目）、1.1.79（October 26, 2026）的 “Fixed Hook progress from background Agent incorrectly showing in the TUI” 与 1.1.78（October 23, 2026，标题 “Hook Reliability Improvements and Safer File Encoding Handling”）的 “Fixed SessionStart Hook context being lost after compaction” 与 “Added display of Hook batch progress and waiting time” 两条，1.1.74（October 19, 2026）到 1.1.77（October 22, 2026）四版没有任何 Hook 条目；“Hook batch progress and waiting time” 只在 Release Notes 出现，Hooks 页没有 batch 的定义、也没有说明一个 batch 内的 Hook 是并行还是顺序执行，因此这条不能当作并发口径。事件表仍是 23 个，四类 Handler 的默认超时仍是 command 600 秒、http 600 秒、prompt 30 秒、agent 60 秒。**`FileChanged` 的未确认项**（2026-11-08 复核）：全页 `watchPaths` 只出现 2 次、`watcher` 与 `watched` 各 1 次，全部集中在 “Working Directory and Files” 那两节；`SessionStart` 的 `hookSpecificOutput` 逐字只有 “`additionalContext` (context injected into the conversation)” 加一句 “When the hook returns plain text (not JSON), the stdout is also injected into the conversation as context.”，`UserPromptSubmit` 的是 `additionalContext` 与 `sessionTitle`，因此 Qoder 只有 `CwdChanged` 与 `FileChanged` 两个事件能注册观察路径。由此产生的缺口是官方没有说明冷启动时第一个被观察的文件从哪里点名——`SessionStart` 不能注册，而 `FileChanged` 要先有被观察的文件才会触发；`FileChanged` 的 matcher 是否像 Claude Code 那样同时充当静态注册清单、还是纯过滤器，页面只写了 “supports exact match, `|` multi-value, regex” 而没有给出注册语义。同样记为未确认的还有 watcher 的实现与依赖、目录是否递归、递归时是否跳过 `.git`／`node_modules`、写入稳定判定的间隔、符号链接处理、原子写临时文件处理、观察路径数量或目录深度上限，以及哪些 Surface 不启动 watcher；页面也没有自触发风险的提醒。发行版坐标同样定不下来：Release Notes 页 `https://changelog.qoder.com/cli`（2026-11-08 复核，HTML 782,358 字节、去标签后正文 69,863 字符）最新条目为 CLI 1.1.84（November 6, 2026，“Improves Session Compaction and MCP Status Display”），其前是 CLI 1.1.83（November 4, 2026，“Session Reliability Improvements and Enterprise Mode Controls”）与 CLI 1.1.82（November 3, 2026），全文对 `FileChanged`、`watchPaths`、`watcher` 与 `CwdChanged` 均为 **0 次命中**，因此这个事件从哪一版开始可用没有一手记录。',
          sources: ['qoder-hooks', 'qoder-hooks-failure-recheck', 'qoder-hooks-filechanged', 'qoder-hooks-concurrency', 'qoder-release-notes-hooks-recheck', 'qoder-changelog-no-filechanged', 'qoder-plugins', 'qoder-commands', 'qoder-release-notes'],
        },
      },
      related: [
        'extension-plugins',
        'security-approval',
        'agent-hooks',
      ],
    }),

    'extension-plugins': createDetail({
      id: 'extension-plugins',
      definition:
        '把多个扩展组件打包、安装、启用和更新，并比较包清单、市场来源与内置默认市场、可携带组件、安装作用域和运行时刷新方式。',
      includes: [
        'Plugin 或 Extension manifest',
        '插件市场来源、内置默认市场与市场管理命令',
        '市场、Git、本地目录或压缩包安装',
        'Skills、Commands、Hooks、MCP、Agents 等可选组件',
      ],
      excludes: [
        '单独复制一个 Skill 目录',
        '仅由 IDE 商店分发的编辑器扩展',
        '没有安装生命周期的普通项目配置',
      ],
      facts: [
        '五家现在都存在可安装的扩展包，也都以「市场」作为集中分发来源：Claude Code 的市场是带 `.claude-plugin/marketplace.json` 的仓库或目录，Codex 与 ChatGPT 共用同一公开插件目录，Qwen Code 的市场来源就是 Claude plugin marketplaces，Kimi Code 有默认 marketplace，Qoder CLI 接受含 `marketplace.json` 的 Git 仓库、本地目录或直接指向 `marketplace.json` 的 URL。Qwen Code 将该体系称为 Extensions，除自有格式外还能安装 Gemini、Claude 与 Qoder 格式的包（Qoder 插件兼容随 v0.21.9 引入），并自 v0.21.11-preview.0 起原生加载 Agent Plugins v1 便携包。',
        '内置默认市场四家有、一家没有记录：Claude Code 在首次启动交互式终端会话时自动注册 Anthropic 官方市场 `claude-plugins-official`，`-p` 运行与接云会话的终端从不注册；Kimi Code 的 `/plugins` 默认给出 Official 与 Curated 两个页签；Codex 的 `codex plugin marketplace list` 会连同「隐式发现的默认市场」一起打印，但官方没有公布其名称；Qoder CLI 自 CLI 1.1.66（2026-10-08）起内置 `qoder-plugins` 市场，而官方 Plugins 页在核对日期没有出现该字符串；Qwen Code 官方扩展文档没有记录任何默认或内置市场来源。',
        '市场管理命令形状不同：Claude Code 是 `claude plugin marketplace add|list|remove|update`（配 `--scope`、`--sparse`、`--claudeai`），Codex 是 `codex plugin marketplace add|list|remove|upgrade`（配 `--ref` 与可重复的 `--sparse`），Qwen Code 是 `qwen extensions sources add|list|update|remove`，Qoder CLI 是 `qoder plugins marketplace add|list|update|remove`，Kimi Code 只有 `/plugins marketplace [source]` 加环境变量 `KIMI_CODE_PLUGIN_MARKETPLACE_URL` 覆盖默认市场。',
        '插件标识的限定写法不一致：Claude Code 与 Codex 用 `name@marketplace`，Qoder CLI 安装后的插件 ID 形如 `name@marketplace-name`，Qwen Code 安装时写 `<marketplace-name>:<plugin-name>`，Kimi Code 用 `<id>` 寻址。',
        '安装作用域也不同：Kimi Code 当前只支持用户安装；Claude Code 与 Qoder CLI 提供 user/project/local 三种 scope；Codex 安装到当前账号或环境；Qwen Code 默认用户级全局启用，`--scope project`（别名 `--scope workspace`）只对当前工作区生效。',
        '组件集合并不对齐：Codex Plugin 的组件是 Skills、MCP servers、Browser extensions 与 Hooks，且当前不在 IDE 扩展中提供；Kimi Code Plugin 已支持 Agent 组件，但优先级低于用户、额外目录、项目和 `--agent-file`。',
        '远程插件搜索目前只有 Codex 在 app-server 以 `plugin/search` JSON-RPC 提供，按 `global`/`workspace`/`personal` scope 直接查询远程插件服务；该端点仍在开发中并受功能开关控制，其余四家的插件发现仍走本地目录或 `/plugins` 浏览器。',
        'Codex 在仓库中增加了对 `agent-plugins.org` 1.0.0 清单的支持：根目录 `plugin.json` 与 `.codex-plugin/plugin.json` 并存，`extensions` 字段按反向域名命名空间承载客户端特定数据。Qwen Code 自 v0.21.11-preview.0（提交 `a64d1291d2f6`）起也原生加载同一 1.0.0 schema 的包，不转换或改写 `plugin.json`、`mcp.json`、`SKILL.md`；Claude Code、Kimi Code 与 Qoder CLI 当前一手资料未列出对同一清单的支持。',
      ],
      products: {
        claude: {
          entry:
            '`/plugin` 打开面板并停在 **Discover** 页签（别名 `/plugins`、`/marketplace`），子命令含 `/plugin list`、`install`、`manage`、`enable`、`disable`、`uninstall`、`configure`、`validate`、`tag` 与 `/plugin marketplace add|list|update|remove`（别名 `market`）；Shell 侧 `claude plugin`（别名 `claude plugins`）提供 `init`、`install`、`uninstall`、`enable`、`disable`、`update`、`list`、`details`、`configure`、`prune`、`eval`、`tag`、`test`、`validate` 与 `marketplace add|list|remove|update`；`--plugin-dir <path>` 与 `--plugin-url <url>` 只对本次会话加载。',
          location:
            'Manifest 位于 `.claude-plugin/plugin.json`；组件目录位于插件根目录。市场是带 `.claude-plugin/marketplace.json` 的仓库或目录，官方逐字写 “It\'s a catalog, not a hosted store.”；已抓取和安装的内容放在 `~/.claude/plugins/`，插件持久数据在 `~/.claude/plugins/data/<id>/`。',
          behavior:
            '把多个扩展组件作为一个版本化包启用，并由 Marketplace 或本地目录分发。Claude Code 在首次启动交互式终端会话时自动注册 Anthropic 官方市场 `claude-plugins-official`（来源 `{ "source": "github", "repo": "anthropics/claude-plugins-official" }`），除非托管策略阻止；Anthropic 的社区与演示市场不会自行添加。`claude plugin install <plugin>` 从已配置的市场安装，`--marketplace <source>`（v2.1.292 起）允许只给裸名并在尚未添加时先添加该市场；`claude plugin update <plugin>` 升到该市场提供的最新版本；`claude plugin marketplace add <source>` 接受 GitHub 仓库、git URL、托管的 `marketplace.json` 或本地路径；`claude plugin marketplace update [name]` 刷新一张或全部市场。市场按名称分三层：Official（含 `claude-plugins-official` 与演示市场 `claude-code-plugins`）、Community（如 `claude-community`）与 Third-party。`/plugin install <source>` 在目标是路径、URL 或 `owner/repo` 时只报市场未找到、不安装任何东西。',
          scope:
            '`--scope` 取 `user`（默认，本机每个项目）、`project`（通过已提交的 `.claude/settings.json` 对仓库内所有人生效，但每个协作者仍要在自己机器上安装）或 `local`（只对本人在该仓库生效）；`plugin update` 另接受 `managed`，`enable`/`disable` 省略时自动探测。`claude plugin marketplace add --scope` 决定市场声明写进哪个设置文件，`marketplace remove` 不带 `--scope` 时从所有作用域移除声明。终端、桌面端本地会话与 VS Code 扩展读同一批设置文件，因此用户级安装的插件在三处都可用。',
          components:
            'Skills、旧式 Commands、Agents、Hooks、`.mcp.json`、`.lsp.json`、Monitors、`bin` 与 settings；`claude plugin init --with` 可为 `skills`、`agents`、`hooks`、`mcp`、`lsp`、`output-style` 或 `channel` 生成起始文件。',
          loading:
            '插件在启动时加载，或用 `/reload-plugins`（`--force` 在会使提示词缓存失效时也强制应用）把待定改动应用到运行中的会话。`claude plugin uninstall --keep-data` 保留插件持久数据目录，`--prune` 连带移除不再被任何插件需要的自动安装依赖，`claude plugin prune` 单独做同一件事。',
          permissions:
            'Plugin 中的 Hook、MCP 与命令仍受工作区信任、权限和组织策略约束。托管设置的 `strictKnownMarketplaces`（别名 `allowedMarketplaces`）是市场来源允许清单、空数组 `[]` 连官方市场一起挡掉，`blockedMarketplaces` 先于允许清单检查，两份清单在添加市场与每次安装、更新、刷新、自动更新之前以及会话启动时各生效一次；已安装插件的市场来源不再匹配时不加载，`/plugin` 以 `Marketplace "<name>" is not in the allowed marketplace list` 或 `Marketplace "<name>" is blocked by enterprise policy` 列出。`extraKnownMarketplaces`（别名 `additionalMarketplaces`）才真正注册市场且自身也要过允许清单，`enabledPlugins` 里写 `name@claude-plugins-official: true` 本身就声明了官方市场、写 `false` 则在所有作用域阻止该插件并从市场列表隐藏。`disableSideloadFlags` 在启动时拒绝 `--plugin-dir`、`--plugin-url`、`--agents`、Agent SDK 的 `plugins` 选项、非 SDK 的 `--mcp-config` 与 `CLAUDE_CODE_PLUGIN_DIRS` 里的目录；允许清单不覆盖 `--plugin-dir`，覆盖它的是 `disableSideloadFlags`。',
          conditions:
            '官方与社区市场名称只对来源为 `github.com/anthropics/` 仓库的市场接受。官方市场只在交互式终端会话自动注册，`-p` 运行或接云会话的终端从不注册；`CLAUDE_CODE_DISABLE_OFFICIAL_MARKETPLACE_AUTOINSTALL=1` 停止交互式终端会话的自动注册；曾被策略阻止过的机器会记住这次阻止、策略改动后也不再重试，只能靠 `extraKnownMarketplaces` 条目、`enabledPlugins` 条目或手工 `/plugin marketplace add` 重新注册。claude.com/marketplace 是浏览插件、Connector 与合作伙伴的网站，不能用 `/plugin marketplace add` 添加；`--claudeai`（v2.1.273 起）把参数读成 claude.ai 托管市场的名称。Manifest 在 `.claude-plugin`，但 `skills`、`agents` 等组件目录位于插件根，不放进 manifest 目录。官方命令参考只列常用选项，完整选项要以 `claude plugin <subcommand> --help` 为准。',
          sources: [
            'claude-plugins',
            'claude-plugins-org',
            'claude-plugins-cli-reference',
          ],
        },
        codex: {
          entry:
            'Codex CLI 使用 `/plugins` 打开插件浏览器，按市场分组浏览、安装或卸载统一插件目录中的条目；Shell 侧 `codex plugin add|list|remove` 管理已安装插件（官方描述 “Install, list, and remove plugins from configured marketplaces.”）、`codex plugin marketplace add|list|remove|upgrade` 管理市场来源（官方描述 “Manage plugin marketplace sources that Codex can browse and install from.”）；app-server 另有 `plugin/search` JSON-RPC 直接查询远程插件服务。',
          location:
            '自建包使用 `.codex-plugin/plugin.json`；也接受根目录 `plugin.json`（`$schema` 指向 `agent-plugins.org/schemas/1.0.0/plugin.schema.json`）的便携 Agent Plugin 清单。其余组件按插件规范组织。`codex plugin marketplace list` 打印在册市场名与每张市场的根路径，`codex plugin marketplace add --json` 返回 `installedRoot`，`codex plugin add --json` 返回 `installedPath`；官方文档没有给出安装状态本身的文件路径。',
          behavior:
            '把可复用能力组合成插件，并在 Codex 与 ChatGPT 的统一插件目录中分发，官方逐字写 “ChatGPT and Codex use the same public plugin catalog.” 与 “Both products use one universal plugin directory, so the same public plugins are discoverable from their supported surfaces.”。CLI 插件浏览器按市场分组，用市场页签切换来源、打开插件看详情、安装或卸载市场条目，并在已安装插件上按 `Space` 开关；安装后要开新会话才能用其 Skills 或工具。`codex plugin marketplace add <source>` 接受 GitHub 简写 `owner/repo` 或 `owner/repo@ref`、HTTP/HTTPS Git URL、SSH Git URL 与本地市场根目录，`--ref` 钉住 Git ref、可重复的 `--sparse PATH` 只对 Git 来源生效；`upgrade [marketplace-name]` 刷新一张或全部已配置 Git 市场；`codex plugin add <plugin[@marketplace]>` 在插件参数省略 `@marketplace` 时用 `--marketplace`/`-m NAME` 指定；`codex plugin list --available --json` 把未安装的市场插件也列出来（`--available` 需要 `--json`）；`codex plugin remove` 从本地配置与缓存移除。`--json` 输出字段：marketplace add 给 `marketplaceName`/`installedRoot`/`alreadyAdded`，list 给 `marketplaces[]`（`name`、`root`、可选 `marketplaceSource`），upgrade 给 `selectedMarketplaces`/`upgradedRoots`/`errors`，remove 给 `marketplaceName`/`installedRoot`；`plugin add --json` 给 `pluginId`/`name`/`marketplaceName`/`version`/`installedPath`/`authPolicy`，`plugin list --json` 给 `installed` 与 `available` 两个数组（条目含 `pluginId`、`name`、`marketplaceName`、`version`、`installed`、`enabled`、`source`、`installPolicy`、`authPolicy` 与可用时的 `marketplaceSource`），`plugin remove --json` 给 `pluginId`/`name`/`marketplaceName`。app-server 的 `plugin/search` 绕过本地目录缓存直接搜索远程服务，接受 `searchTerm`、可选 `global`/`workspace`/`personal` scope 以及 `cursor`/`limit`，返回带 marketplace 限定的插件摘要并以 `nextCursor` 透传分页令牌。',
          scope:
            '安装到当前账号或环境；组织可通过管理策略提供或限制插件。Plugins Directory 按 **OpenAI**（OpenAI 自建）、**你的工作区名**（工作区提供）与 **Personal**（个人市场插件，可用时含 **Created by me** 与 **Shared with me**）分页签，另有独立的 **Installed** 行；工作区管理员可为团队导入并同步一个 GitHub 市场。',
          components:
            'Skills、MCP servers（Connector）、Browser extensions 与 Hooks，以及可用于自动化的定时模板等组件。',
          loading:
            'CLI 与 Codex 桌面端可使用已安装插件；客户端按启用状态加载。官方逐字写 “Install a plugin from a configured marketplace, then start a new session before using its bundled skills or tools.”；卸载只从该 ChatGPT 或 Codex 环境移除插件包，单独连接的 MCP server 集成仍在 ChatGPT 里保持连接直到在那边断开。',
          surfaces:
            'Codex CLI 和桌面端支持插件浏览器；官方逐字写 “Plugins aren\'t available in the IDE extension.”，并说明移动端只能在 Chat 或 Work 里用账号已有的插件。标 **Desktop only** 的插件可在网页发现但必须打开 ChatGPT 桌面端才能安装与使用。远程插件搜索只在 app-server JSON-RPC 暴露，不是 CLI 命令。',
          permissions:
            'Connector、MCP 和 Hook 继续受认证、审批、沙箱及组织控制。官方 Hooks 条目写明插件 Hook 在云编排的 ChatGPT Work 中不受支持、Synced Work 只支持管理员在 Agent Security 里定义的 MCP Hook，且网页安装不会部署 Hook 脚本（企业可经 MDM 下发），运行前要审查并信任插件 Hook。',
          conditions:
            '"Codex 支持 Skills"与"当前 Surface 支持 Plugin 浏览器"是两件事；IDE 扩展目前不加载插件。Codex 有「隐式发现的默认市场」：官方写 `codex plugin marketplace list` “prints in-scope marketplace names and roots, including implicitly discovered default marketplaces and configured marketplace snapshots”，但没有公布这些默认市场的名称、来源或数量，也没有说明能否移除，记为未确认。`plugin/search` 受功能开关控制：`remote_plugin` 关闭时省略 scope 按 `workspace` 处理、`global`/`personal` 返回空页且不查询远程服务，`plugin_sharing` 关闭时共享/私有工作区结果在取回后被过滤；该端点不与已安装快照联表，返回项 `installed` 恒为 `false`，官方标注 under development、do not call from production clients yet。便携 Agent Plugin 清单只要求 `$schema` 和 `name`（允许点号，最长 64 字符）；`version` 缺省为 `1.0.0`，非目录安全版本内部派生 `agent-plugins-<sha256-hex>` 目录名且不改写原清单。Agent Plugin 跳过旧式命令迁移；安装时拒绝符号链接和不受支持的文件类型。',
          sources: [
            'codex-plugins',
            'codex-plugin-cli-reference',
            'codex-plugin-search',
            'codex-portable-plugins',
          ],
        },
        qwen: {
          entry:
            '`/extensions` 或 `/extensions manage` 打开三页签管理器（**Discover** 浏览已配置市场来源、**Installed** 按 User level 与 Project level 及收藏分组、**Sources** 管理喂给 Discover 页签的市场来源），`/extensions install <source>` 安装，`/extensions explore [source]` 用 `Gemini` 或 `ClaudeCode` 在默认浏览器打开对应市场页；Shell 侧 `qwen extensions install|link|uninstall|enable|disable|update|list|settings|sources` 提供同类操作。Qoder 插件与 Agent Plugins v1 包同样用现有 `qwen extensions install`（或 `/extensions install`）安装，来源支持本地目录、`link`、归档、Git 仓库（`owner/repo`）、归档 URL 与 scoped npm 包。',
          location:
            'Qwen 原生 manifest 为 `qwen-extension.json`；也能安装兼容的 Gemini 与 Claude 扩展结构。Qoder 插件以 `.qoder-plugin/plugin.json` 为 manifest，安装时转换为 `qwen-extension.json` 保存。Agent Plugins v1 包以根目录 `plugin.json`（`$schema` 指向 `agent-plugins.org/schemas/1.0.0/plugin.schema.json`）为 manifest，可搭配根目录 `mcp.json`；安装保留 `plugin.json`、`mcp.json`、`SKILL.md` 原文件，不生成 `qwen-extension.json` 或改写清单。启动时在 `<home>/.qwen/extensions` 查找扩展，原生扩展形如 `<home>/.qwen/extensions/my-extension/qwen-extension.json`；扩展自身设置由 `qwen extensions settings set|list` 管理，写在用户级 `~/.qwen/.env` 或工作区级 `.qwen/.env`（工作区优先，敏感设置安全存储且不以明文显示）。官方文档没有给出市场来源清单的存储文件路径，记为未确认。',
          behavior:
            '从 npm、Git、归档、本地目录或市场安装，并把扩展组件合并到当前运行时。市场来源就是 Claude plugin marketplaces，官方逐字写 “Marketplace sources (Claude plugin marketplaces) power the Discover tab in `/extensions manage`.”；`qwen extensions sources add <source>` 接受 `owner/repo`、git URL、指向 `marketplace.json` 的 https URL 或本地路径，`sources list` 列出已配置市场，`sources update <name>` 重新抓取某市场的插件清单，`sources remove <name>` 移除。安装可以直接给市场名或市场 GitHub URL，也可以用 `<marketplace-name>:<plugin-name>`／`<marketplace-github-url>:<plugin-name>` 指定其中某个插件（官方示例 `qwen extensions install f/awesome-chatgpt-prompts:prompts.chat`）。Qoder 插件可从本地目录、归档、Git 仓库、归档 URL 或 scoped npm 包安装：保留标准 `commands/`、`agents/`、`skills/` 目录；manifest 未声明 `mcpServers` 时，根 `.mcp.json` 的 MCP Server 规范化为 Qwen 传输后作为扩展 MCP 加载；根目录存在 `system-prompt.md` 时作为扩展上下文加载，与 `QWEN.md` 及显式声明的上下文文件去重后并存。Agent Plugins v1 原生加载只发现直接子级 `skills/*/SKILL.md`（遵循 Agent Skills 规范，无效 Skill 单独跳过、不影响同级有效 Skill）；stdio MCP 在 `args`、环境变量值与 `cwd` 中展开 `${PLUGIN_ROOT}`（安装根目录）与 `${PLUGIN_DATA}`（按安装持久化的可写目录），并支持 Streamable HTTP MCP；legacy HTTP+SSE 条目报告后跳过。',
          scope:
            'User 与 Project scope；Project 扩展可随仓库配置。默认用户级全局启用，`--scope project` 只对当前工作区启用，`--scope workspace` 是它的别名，与 Discover 页签安装时提供的 scope 选择一致；`qwen extensions disable|enable <name> --scope=workspace` 只改当前工作区，不带 `--scope` 则在用户级生效因而处处生效。',
          components:
            'Context file、MCP、Commands、Skills、Agents、Settings、Channels、Hooks 与 LSP Servers。Agent Plugins v1 便携运行时当前只启用 Agent Skills 与 stdio/Streamable HTTP MCP。',
          loading:
            'Extension manager 支持运行时热重载；各组件按 manifest 和目录约定重新注册。`/extensions` 管理器里的改动热重载立即生效、不必重启 Qwen Code，而 CLI 命令做的改动要重启才在活动 CLI 会话中反映；默认 `workflows/` 目录下的文件改动自动生效，其他声明路径的改动要 `/reload-plugins` 或重启。Discover 页签按 `Ctrl+R` 重新抓取清单，Installed 页签按 `Space` 启用/禁用、`f` 收藏、`Enter` 看详情，扩展携带的 MCP server 嵌套在父扩展下显示实时连接状态并可逐个开关；Sources 页签按 `Enter` 选中来源、`d` 移除。安装是复制一份，本地定义的与 GitHub 上的改动都要 `qwen extensions update <name>` 才拉进来（`--all` 更新全部）。',
          permissions:
            '扩展中的 Hook、MCP、Command 和 Agent 仍经过工作区信任、approval mode 与工具策略。Agent Plugins v1 使用标准扩展安全同意流程，但不再显示“转换第三方格式”的兼容提示。',
          conditions:
            'Qwen 的正式名称是 Extension；“Plugin”只应在兼容格式或具体组件语境使用，不能与整个管理入口混写。官方扩展文档在 v0.25.1-preview.1（提交 `683f3f063aa0`）与此前固定的 `8a44b1b9f793` 都没有记录任何默认或内置市场来源，市场要自己 `sources add`，因此 Qwen 是否有内置市场记为未确认；同一文档只给出 `/extensions` 斜杠命令表而没有 `qwen extensions` 的完整子命令表，市场来源清单的存储文件路径也未给出。`/extensions explore` 只是用默认浏览器打开外部市场页（Gemini CLI Extensions Gallery 或 Claude Code Marketplace），不在 CLI 内浏览。npm 安装只接受 scoped 包名（`@scope/package-name`）以免与 `owner/repo` 简写混淆，registry 解析优先级为 `--registry` > `.npmrc` 的 scoped registry > `.npmrc` 默认 registry > `https://registry.npmjs.org/`，认证走 `NPM_TOKEN` 或 `.npmrc` 的 `_authToken`；未钉版本时更新检查 `latest` dist-tag、钉 dist-tag 时跟踪该 tag、钉精确版本时永远视为最新。归档 URL 只在它持续指向同一扩展的更新归档时才能用于更新。Qoder 插件兼容随 v0.21.9 引入：manifest 必须在插件目录内解析为含 `name` 的有效 JSON，引用的资源与上下文文件必须留在插件内部，复制时跳过逃逸源目录根的符号链接且不复制 Git 元数据；归档的 manifest 可位于根目录或一个受支持的顶层包装目录内；Git 安装在安装元数据记录检出提交（`gitCommit`）供更新检查，`version` 缺省为 `1.0.0`，来源记录为 `Qoder`。Agent Plugins v1 原生加载随 v0.21.11-preview.0 预览通道发布（提交 `a64d1291d2f6`，稳定版 v0.21.10 不含）：`$schema` 属于 Agent Plugins 的根 `plugin.json` 优先于其他扩展 manifest，不支持的 schema 版本显式失败，无关 `plugin.json` 被忽略；`commands/`、`agents/`、hooks、上下文、settings、channels、apps 与 `extensions.*` 客户端命名空间一律忽略；Skill frontmatter 的实验字段 `allowed-tools` 只按字符串识别，不授予预批准工具权限；远程 MCP 端点必须 HTTPS（loopback HTTP 例外）；包边界检查拒绝符号链接与路径穿越。',
          sources: [
            'qwen-extensions-current',
            'qwen-extensions-v0251preview1',
            'qwen-extension-runtime-current',
            'qwen-qoder-plugin-compat',
            'qwen-qoder-plugin-docs',
            'qwen-v0219-release',
            'qwen-agent-plugins-v1-docs',
            'qwen-agent-plugins-v1-commit',
            'qwen-v02111-preview-release',
          ],
        },
        kimi: {
          entry:
            '`/plugins` 打开四页签管理器：**Installed**（管理已安装 plugin）、**Official**（Kimi 官方 marketplace plugin）、**Curated**（默认 marketplace 中来自 Kimi 合作伙伴的第三方 plugin）、**Custom**（从 URL 安装）；子命令为 `/plugins list`、`install <path-or-url>`、`marketplace [source]`、`info <id>`、`enable <id>`、`disable <id>`、`remove <id>`（需二次确认）、`reload`、`mcp enable <id> <server>` 与 `mcp disable <id> <server>`。',
          location:
            'Manifest 为根目录 `kimi.plugin.json` 或 `.kimi-plugin/plugin.json`，两个文件同时存在时以 `kimi.plugin.json` 为准。本地安装会被拷贝到 `$KIMI_CODE_HOME/plugins/managed/<id>/`，安装与启用状态记在 `installed.json`；已通知过的更新版本写在 `~/.kimi-code/updates/plugin-notices.json`。',
          behavior:
            '把多个自定义组件作为一个包安装到用户环境，并支持启用、禁用和重载。内置一个默认 marketplace：`/plugins marketplace` 不带参数浏览官方 marketplace，传入自定义 marketplace JSON 的路径或 URL 则浏览自定义目录，`KIMI_CODE_PLUGIN_MARKETPLACE_URL` 覆盖默认 marketplace。`/plugins install <path-or-url>` 支持本地目录、zip URL 与 GitHub 仓库 URL，GitHub URL 有四种形式：`https://github.com/<owner>/<repo>`（装最新 release，无 release 时回落默认分支）、`.../tree/<ref>`（指定分支、tag 或短 commit SHA）、`.../releases/tag/<tag>`（钉死 tag）与 `.../commit/<sha>`（钉死 commit）。官方 plugin 不自动更新，使用旧版时会提示更新，升级只需重复安装步骤；面板里 `Enter` 在 Installed 页签是「有更新则安装更新、否则看详情」，在 Official/Curated 是「安装或更新」，在 Custom 是「安装」。安装会消耗套餐额度的官方 plugin（当前为 `kimi-datasource`）会在安装结果中提示 `Note: This plugin consumes your quota.`。',
          scope:
            '当前文档只支持用户级安装，官方逐字写 “Plugin 目前按用户安装，对所有项目生效，暂不支持项目级安装范围。”，没有项目级插件安装。',
          components:
            'Skills、Session-start Skill、Skill instructions、System prompt instructions（`systemPrompt` / `systemPromptPath`，各上限 32 KB，合计 64 KB）、Custom Agents（`agents` 字段或根 `agents/` 目录）、MCP Servers、Hooks 与 Commands。manifest 里的 `skills`、`agents`、`commands`、`systemPromptPath` 路径必须以 `./` 开头并位于 plugin 根目录内；stdio MCP 的 `command` 可以是 `PATH` 上的命令或 plugin 根目录内以 `./` 开头的路径，`cwd` 必须以 `./` 开头且在根目录内。',
          loading:
            '安装或修改后使用 `/reload` 或开启新会话生效；v2 引擎中 `/plugins reload` 也可刷新当前会话（重载 `installed.json` 与各 plugin manifest、刷新 plugin Skill 列表并请求重建活跃 Agent 的提示词），Installed 页签的 `R` 键做同一件事。官方逐字写 “系统提示词贡献在 Kimi Code 的所有界面上都生效：交互式 TUI、`kimi -p` 和 `kimi web` 都运行在 v2 引擎上。”、“在 v2 引擎中，安装、启用、禁用或移除 plugin 会立即更新 catalog，后续的提示词重建可能会读取新的指令。” 与 “legacy 引擎中每个活跃 session 保留自己的 plugin 快照，直到 `/plugins reload` 或创建新 session。”；Agent 列表在新会话或 `/reload` 时刷新，v2 引擎的当前会话还会在 `/plugins reload` 后刷新。Plugin MCP servers 在 `/reload` 后或新会话中启动。`/plugins` 的 Installed tab 在 marketplace 有新版本时显示更新徽章；使用过时官方 plugin（其 MCP 工具或 `/<plugin>:<command>` 命令）的 turn 结束后出现一次性更新提示，每个 marketplace 版本只提醒一次。',
          permissions:
            'Plugin 中的 MCP、Hook、Commands 与 Agent 具备执行能力，安装前需要审查来源。plugin 声明的 MCP server 可用 `/plugins mcp enable|disable <id> <server>` 逐个开关。',
          conditions:
            '配额提示与更新提示只对官方来源、默认官方目录的 plugin 生效；自定义 `KIMI_CODE_PLUGIN_MARKETPLACE_URL` 或非官方安装不触发更新提示。默认 marketplace 的名称、清单文件形状与是否预注册官方文档没有给出，只说明它含 Kimi 官方 plugin 与合作伙伴第三方 plugin，记为未确认。`/plugins install` 与 `/plugins marketplace` 的自定义目录来源都只接受 JSON 路径或 URL，没有 `owner/repo` 一类市场简写。Plugin Agent 优先级低于用户、额外目录、项目和 `--agent-file`；替换同名内置 Agent 需要在 frontmatter 声明 `override: true`。此前记录的「`systemPrompt` 在 v1 引擎与 v2 引擎（`KIMI_CODE_EXPERIMENTAL_FLAG=1`）中生效」已过期：核对日期的官方文档不再出现 v1 引擎或该环境变量，改为交互式 TUI、`kimi -p` 与 `kimi web` 都运行在 v2 引擎上，并只在快照行为上提到 legacy 引擎。',
          sources: ['kimi-plugins-7ad0c46'],
        },
        qoder: {
          entry:
            '`qoder plugins`（别名 `qoder plugin`）子命令组管理安装与状态，含 `install`、`uninstall`（别名 `remove`/`rm`）、`enable`、`disable`、`list`、`validate`、`update` 与 `marketplace add|list|update|remove`；TUI 里 `/plugins`（官方描述 “Manage plugins (alias `/plugin`).”）与 `/marketplace`（官方描述 “Browse the Plugin Marketplace (alias `/market`).”）；运行中用 `/plugins reload` 重载。',
          location:
            'Manifest 推荐 `.qoder-plugin/plugin.json`，省略时 CLI 仍按约定加载目录并用目录名作插件名；组件目录为 `commands/`（与 `~/.qoder/commands/` 同结构）、`agents/`、`skills/`（与 `~/.qoder/skills/` 同结构）、`hooks/hooks.json`（用 `{ "hooks": ... }` 包装，内层与 `settings.json` 的 `hooks` 字段一致）、`output-styles/`、`bin/` 与随插件分发的 `.mcp.json`。启用/禁用状态记在对应 `settings.json` 的 `enabledPlugins` 字段。插件内可用 `${QODER_PLUGIN_ROOT}`（当前插件安装根）与 `${QODER_PLUGIN_DATA}`（与安装目录分开、以便升级后保留状态的数据目录）。',
          behavior:
            '官方把市场定义为插件的集中分发来源，添加后可直接浏览并安装已发布插件而不必手工管理本地目录。`qoder plugins marketplace add <source>` 接受 Git 仓库（HTTPS 或 SSH）、`owner/repo` 简写、本地目录与指向 `marketplace.json` 的 URL；`qoder plugins install <name>` 在已添加市场后按名安装，CLI 搜索所有已配置市场，得到的插件 ID 形如 `name@marketplace-name`；`plugins marketplace update [name]` 刷新单个或全部市场的插件清单，`plugins update <name>` 更新已安装的市场插件，`plugins marketplace remove <name>` 移除市场并连带卸载从它安装的全部插件。`plugins list` 支持 `--json`、`-o, --output-format <format>`（`text` 或 `json`）与 `--plugin-dir <dirs...>`（额外扫描并合并进列表、不安装）；`plugins validate <dir>` 列出发现的 commands、Skills、Hooks 等组件，没有约定子目录时只打印提示而不失败，但本地插件的 `plugins install` 要求至少有一个可识别组件或资源（约定目录或 manifest 里显式声明的资源）。CLI 1.1.66（2026-10-08）新增内置 `qoder-plugins` 插件市场。',
          scope:
            'User、Project 和 Local 三种 scope：`user` 全局可用、对当前用户所有项目生效且为默认；`project` 只对当前项目生效、写进项目级 `settings.json` 且可提交到 git 供团队共享；`local` 只对当前项目生效、写进项目本地 `settings.local.json`、建议加进 `.gitignore`。安装本地目录时用 `qoder plugins install /abs/path/to/plugin --scope project` 指定。',
          components:
            'Commands、Agents、Skills、Hooks、Output styles、`bin` 与 `.mcp.json`。',
          loading:
            '启动时加载；安装成功后提示 `Plugin "my-plugin@local" installed successfully. Run /plugins reload to apply.`，重启 CLI 或在 TUI 运行 `/plugins reload` 生效。',
          permissions:
            '插件组件仍受权限规则与工作区信任控制；本地可执行内容需要单独审查。CLI 1.0.17（2026-06-10）起插件 Hook 可绕过 `--setting-sources` 过滤器。',
          conditions:
            'CLI 1.1.66 的内置 `qoder-plugins` 市场只有官方 CLI Release Notes 证据（该版小节标题为 “Built-in plugin marketplace and stability fixes”，条目逐字为 “Added the built-in qoder-plugins plugin marketplace”）；官方 Plugins 页在核对日期没有出现 `qoder-plugins` 字符串，也没有任何内置、默认或预配置市场的描述，仍写「添加市场后才能浏览并安装已发布插件」，因此它是否默认注册、包含哪些插件、能否移除或被托管策略覆盖都记为未确认。`/marketplace` 与 `/agents`、`/plan`、`/workflows` 一样属条件命令，官方逐字写 “Available only when the corresponding feature flags are enabled.”，被功能开关关掉时输入会显示对应的禁用提示。`marketplace` 不是顶层子命令，只在 `qoder plugins` 组下。现行 CLI 参考的可执行名是 `qoder`、子命令表把 `plugins` 记为 “Manage plugins.”（别名 `plugin`），此前矩阵写的 `qodercli plugins` 已过期。官方 Plugins 页没有描述 `marketplace.json` 的字段，也没有把远程 ZIP 列为安装来源，而 Release Notes 的 CLI 1.1.14（2026-08-04）写 “Added remote ZIP plugin installation, and fixed the plugin status not updating after uninstall”，两处不一致；插件市场时间线取自官方 CLI Release Notes——CLI 1.0.35（2026-07-01）“Added plugin marketplace support”、CLI 1.0.36（2026-07-02）“Improved plugin marketplace management”、CLI 1.1.19（2026-08-11）“Fixed marketplace plugin installation failing”、CLI 1.1.27（2026-08-20）“Fixed uninstalled plugins being reinstalled by automatic plugin updates”（官方 Plugins 页只给手工 `plugins update`，没有描述自动更新）、CLI 1.0.15（2026-06-09）“Added plugin path placeholder substitution (`${*_PLUGIN_ROOT}`, `${*_PLUGIN_DATA}`) in plugin content”、CLI 0.2.3（2026-04-28）在 hooks 与 MCP 配置里支持 `PLUGIN_ROOT`/`PLUGIN_DATA`；核对日期的最新条目为 CLI 1.1.67（2026-10-09），只有 “Improved model information display”。',
          sources: [
            'qoder-plugins-detail',
            'qoder-cli-reference',
            'qoder-commands',
            'qoder-release-notes',
          ],
        },
      },
      related: [
        'extension-skills',
        'extension-hooks',
        'extension-mcp',
        'extension-custom-commands',
        'extension-output-styles',
      ],
    }),

    'extension-custom-commands': createDetail({
      id: 'extension-custom-commands',
      definition:
        '把提示模板保存成可输入的 Slash 命令，并区分独立 Command 文件、Skills、Plugin Commands、用户配置里的数字槽位与已弃用机制。',
      includes: [
        'Markdown Prompt Command 的目录与命名',
        '参数、命名空间和加载优先级',
        '与 Skills 或 Plugin Commands 的关系',
        '用户配置里的数字槽位与召回快捷键',
      ],
      excludes: [
        '产品内置 Slash 命令',
        'MCP Server 动态暴露的 Prompt',
        '只通过自然语言自动触发、没有命令入口的 Skill',
        '槽位或命令内容所指向的模型、权限、终端标题与状态行设置本身',
      ],
      facts: [
        'Claude Code、Qwen Code 和 Qoder CLI 都保留独立 Markdown Command 目录；Kimi Code 当前只文档化 Plugin Commands 与 Skills，官方 `docs/zh/customization/` 下没有 commands 文档。',
        'Codex 有旧新两条并存的路：`~/.codex/prompts/*.md` 自定义 Prompt 已弃用（官方逐字为 “Custom prompts are deprecated. Use skills for reusable prompts”）且只在本机使用，2026-10-15 合入 main 的 `/presets` 则把最多十个数字槽位写进用户配置的 `tui.presets.<0-9>`，槽位内容是一条提示词或一条 Slash 命令行，按 `0`–`9` 召回。',
        '存储位置决定共享范围：Claude Code、Qwen Code 与 Qoder CLI 的项目级 Command 目录可随仓库提交共享，Kimi Code 的插件命令随插件分发，Codex 的旧 Prompt 与 `/presets` 槽位都只属于本机用户——官方对旧 Prompt 的说法是 “they’re not shared through your repository”。',
        '同名覆盖方向不一致：Claude Code 是 “Enterprise over personal, and personal over project”，Qoder CLI 是用户级覆盖项目级，Qwen Code 相反、官方写 “Project commands > User commands (project command used when names are same)”。',
        '参数占位符各家不同、位置参数的基底也不同：Claude Code 与 Kimi Code 都从 0 开始（`$0` 是第一个参数），Codex 已弃用的 Prompt 用 `$1` 到 `$9`（没有 `$0`）并另有 `$ARGUMENTS`、大写命名占位符与 `$$` 转义，Qwen Code 只有 `{{args}}` 加 `!{command}` 与 `@{file path}`，Qoder CLI 没有记录任何占位符语法。',
        '只有 Codex 把可复用提示词存进配置文件的数字槽位；其余四家在核对日期的一手资料里都是文件式命令目录或 Skill。Claude Code 的输入历史（`Up` 召回、`Ctrl+R` 反向搜索）与 Qoder CLI 1.1.20 的 “Added Ctrl+S to stash the current prompt draft and restore it later” 都是历史或草稿机制，不是可命名、可编号的提示词槽位。',
        '同样显示为 `/name` 的入口可能来自内置命令、Skill、Prompt Command、Plugin 或 MCP Prompt，矩阵只比较其公开加载机制。',
      ],
      products: {
        claude: {
          entry:
            '`.claude/commands/deploy.md` 生成 `/deploy`，官方逐字写明 “**Custom commands have been merged into skills.** A file at `.claude/commands/deploy.md` and a skill at `.claude/skills/deploy/SKILL.md` both create `/deploy` and work the same way.”；Plugin 的 `commands/<file>.md` 生成 `/<plugin>:<file>`，子目录再加一段（`commands/db/migrate.md` → `/my-plugin:db:migrate`）。',
          location:
            '项目 `.claude/commands/*.md`；官方 Skills 页把个人级位置写成 `~/.claude/skills/<skill-name>/SKILL.md`，只在同名冲突提示里泛指 “your personal skills or command files in `~/.claude/`”，没有把 `~/.claude/commands/` 单独列为个人命令目录。用 `--add-dir` 或 `/add-dir` 加入的目录会连带加载它的 `.claude/skills/`、`.claude/commands/` 与 `.claude/agents/`；Plugin 可携带 `commands/`。',
          behavior:
            'Markdown 正文作为提示模板加载。命令名来自文件名去掉扩展名，子目录路径里每个 `/` 换成 `:`（官方示例 `.claude/commands/frontend/component.md` → `/frontend:component`）。可用替换为 `$ARGUMENTS`（没有占位符接收参数时以 `ARGUMENTS: <value>` 追加）、`$ARGUMENTS[N]` 与简写 `$N`，官方明确 0 基——“Access a specific argument by 0-based index, such as `$ARGUMENTS[0]` for the first argument.”、“Shorthand for `$ARGUMENTS[N]`, such as `$0` for the first argument or `$1` for the second.”；`arguments` frontmatter 声明的命名参数按顺序映射到位置（`arguments: [issue, branch]` 时 `$issue` 是第一个、`$branch` 是第二个）；索引参数按 shell 风格引号分词，没有对应参数的索引占位符原样留在正文里，字面 `$` 用 `\\$` 转义。另有 `${CLAUDE_SESSION_ID}`、`${CLAUDE_EFFORT}`、`${CLAUDE_SKILL_DIR}`、`${CLAUDE_PROJECT_DIR}`、`${CLAUDE_PLUGIN_ROOT}` 与 `${CLAUDE_PLUGIN_DATA}`。行首或紧跟空白之后的 ! 反引号形式（以及用 ! 开启的围栏代码块）会在内容送给 Claude 之前执行 Shell 并以其输出替换占位符，“A failed command aborts the entire skill invocation, not just its own placeholder.”；一条消息开头可串联首个 Skill 加至多五个，尾部文字作为 `$ARGUMENTS` 传给每一个。',
          scope:
            '同名时的官方优先级逐字为 “Enterprise over personal, and personal over project. With `deploy` in both `~/.claude/skills/` and the project’s `.claude/skills/`, `/deploy` runs the personal one”；项目命令随仓库共享，Plugin 命令随插件分发。',
          components:
            '命令文件是 Markdown 加 frontmatter，官方写明它 “supports the same [frontmatter] except `name` and `paths`”（`paths` 另注明 “Not supported in `.claude/commands/` files”），其余字段与 Skill 相同，含 `description`、`when_to_use`、`argument-hint`、`arguments`、`disable-model-invocation`、`user-invocable`、`allowed-tools`、`disallowed-tools`、`model`、`effort`、`context`、`agent`、`background`、`hooks`、`shell`、`metadata`、`license` 与 `compatibility`；需要辅助文件时改用带自己目录的 Skill。',
          loading:
            '命令文件与 Skill 合并进入同一个 Slash 菜单；官方写明 “Live change detection covers `SKILL.md` text only.”，并且不监听 `--add-dir` 目录的 `.claude/commands/` 与 `.claude/agents/`，改完要重启会话。v2.1.299 起 “Changed `UserPromptSubmit` hooks to run before a skill or custom slash command expands, so a hook that blocks the prompt now also stops its embedded shell commands”，同版还改了 Skill 自身 frontmatter 的 `UserPromptSubmit` 首次生效时机，并规定 “Changed skill and command loading: one whose file or folder name has hidden, direction-changing or blank-like characters, `<` or `>` is no longer offered until renamed; such a `name:` is ignored”；v2.1.301 修了参数名过多或过长时的卡顿（“only the first 64 names, each up to 64 characters, are now filled in”）与 `/rewind` 后 Skill 不再列给模型的问题，并让 `/reload-skills` 说明它会重发完整 Skill 列表。',
          permissions:
            'Command 只是生成提示；提示触发的工具仍受权限规则。! 内嵌 Shell 可以用设置 `"disableSkillShellExecution": true` 关闭，官方写明它作用于 “skills and custom commands from user, project, plugin, or additional-directory sources”，关闭后每条命令被替换成 `[shell command execution disabled by policy]` 而不是执行。',
          conditions:
            '官方对命令文件的措辞是 “the older format” 而不是 deprecated：“**Command files**: a Markdown file in `.claude/commands/` is the older format and still works. … Prefer a skill for new work, since skills also support supporting files.”，插件组件页同样写 “Commands are the older format, and skills supersede them for new work.”。官方命令页 `docs/en/commands` 现在只是内置命令参考，全页不再出现 `.claude/commands`，正文改写成 “To add your own commands, see skills.” 并把 skills 一词链到 `/docs/en/skills`；`docs/en/slash-commands` 也直接返回 Skills 页。更新日志（main 固定到 `03b5892ee77de289bcd5dfa39f541525ade74aff`，1,036,155 字节，最新段 `## 2.1.301`）全文没有 preset、presets 或 quick dial 字样。输入历史是另一套机制：按工作目录保存、`Up` 可召回本项目往次会话的提示词、`Ctrl+R` 反向搜索（全屏渲染下用 `Ctrl+S` 在 this session／this project／all projects 之间切范围）、双按 `Esc` 清空输入并把草稿存进历史，它是历史召回而不是可命名、可编号的提示词槽位。',
          sources: [
            'claude-skills',
            'claude-commands',
            'claude-plugins-components',
            'claude-interactive-mode',
            'claude-v21301-commands-changelog',
          ],
        },
        codex: {
          entry:
            '推荐通过 Skill 暴露可复用能力；旧 Prompt 使用 `/prompts:<name>`。main 分支另有 `/presets`（源码描述逐字为 “run or save reusable prompts and slash commands”，无别名、不在 `supports_inline_args` 清单里因而不接受内联参数），在输入框上方打开标题为 “Presets” 的菜单：`0`–`9` 运行已存槽位或在空槽新建，`n` 新建、`s` 从当前设置新建、`e` 编辑、`d` 删除、`Esc` 关闭；隐式快捷键是 `leader p`，对应键位动作 `tui.keymap.chat.open_presets`（`config.schema.json` 描述逐字为 “Open saved prompts and slash commands.”），该动作在 `/keymap` 中列出。',
          location:
            '旧 Prompt 只从用户目录 `~/.codex/prompts/*.md` 加载，官方写明只扫描该目录顶层的 Markdown 文件；项目不提供同等 Prompt 目录。`/presets` 不用目录：槽位写进当前生效的用户配置文件（源码字段 `local_settings.user_config_path`，官方配置参考逐字为 “User-level configuration lives in `~/.codex/config.toml`.”）的 `tui.presets.<slot>`，`slot` 是单个数字 `0`–`9`，每槽是只含 `input` 与 `label` 两键的 TOML 表。',
          behavior:
            '旧 Prompt 把 Markdown 内容插入对话；Skill 可携带更完整的脚本和资源，并支持显式或自动调用。`/presets` 的槽位只存纯文本：`input` 可以是一条提示词，也可以是一条 Slash 命令行，召回时经 `queue_user_message_with_options(input, QueuedInputAction::ParseSlash, …)` 走常规排队提交路径并解析 Slash 命令，全程不改写输入框因而保留草稿。`s` 打开 “Start preset from current settings”，四项分别生成命令行：“Current model” 生成 `/model <name>` 并按可用情况追加 `--reasoning=<effort>` 与 `--speed=<speed>`（服务层级为默认值时速度取 `standard`），“Current permissions” 生成 `/permissions <profile_id> --approval-policy=<policy> --reviewer=<reviewer>`（profile 名经 `shlex::try_quote` 引号化），“Current terminal title” 与 “Current status line” 生成保留条目顺序与重复项、归一化条目别名的 `/title <item…>` 与 `/statusline <item…>` 并给状态行追加 `--colors` 或 `--no-colors`，条目为空时改用 `<command> --clear`。写入前校验：`input` 去空白后为空报 “Preset input cannot be empty.”，去空白后以 `!` 开头报 “Presets support prompts and slash commands, not shell commands.”，超过 8000 UTF-8 字节报 “Preset input cannot exceed 8,000 UTF-8 bytes.”；图片与 linked mention 不能存进槽位（分别提示 “Images cannot be copied into a preset. Starting with empty text.” 与 “Linked mentions cannot be copied into a preset. Starting with empty text.”）。菜单只列出已占用槽位，有 `label` 时显示 label、否则显示 input 且过长以 `…` 截断；编辑与删除都要过 “{action} preset {slot}?” 确认，替换时给出 “{}\\n→ {}” 的旧值新值对照。',
          scope:
            '旧 Prompt 仅本机用户；Skills 可放项目 `.agents/skills` 或用户目录。`/presets` 的槽位按配置层归属：只能替换当前用户配置拥有的槽位，最高层定义落在别的配置层时报 “Preset {slot} is defined outside your user config. Edit its source configuration instead.”；清空时只要有任何非用户配置层定义过该槽位就一并拒绝，源码注释写明 “Clearing must not reveal a shadowed slot from another configuration layer.”；把 `label` 写成空字符串可遮蔽下层继承来的标签（注释 “An explicit empty label masks labels inherited from lower layers.”）。写入失败报 “Failed to update preset {slot}: …” 且内存中的设置保持不变，只读与失败两条路径都会用 `restore_quick_dial_editor` 把编辑器回填。',
          components:
            '旧机制只有 Markdown Prompt：YAML front matter 里可写 `description:`（显示在弹出菜单的命令名下）与 `argument-hint: KEY=<value>`，正文可用位置占位符 `$1` 到 `$9`（官方逐字为 “`$1` through `$9` expand from space-separated arguments you provide after the command. `$ARGUMENTS` includes them all.”）、大写命名占位符如 `$FILE` 或 `$TICKET_ID`（以 `KEY=value` 传值、含空格的值要加引号，例如 `FOCUS="loading state"`）与字面量 `$$`；Skills 使用 SKILL.md 与辅助资源。`/presets` 槽位是 Rust 类型 `QuickDial`（结构体注释逐字为 “One reusable prompt or slash command submitted through the TUI composer.”，JSON schema 名 `Preset` 且 `deny_unknown_fields`）的两个字段：`input: String`（“Plain-text input, limited to 8,000 UTF-8 bytes.”）与 `label: Option<String>`（“Optional short name for the picker and shortcut hints.”）；在 `Tui` 结构里以 `#[serde(default, rename = "presets")]` 暴露为 `BTreeMap<String, QuickDial>`，字段注释逐字为 “Saved inputs keyed by a single digit (`0` through `9`).”。源码没有槽位数量常量，十个槽位来自“键是单个数字”这一约定与提交说明里的 “ten numbered preset slots”。',
          loading:
            '旧 Prompt 在客户端发现后以 `/prompts:*` 提供，官方写明 “Codex reads prompt metadata and resolves placeholders the next time the session starts.” 与 “After editing prompt files, restart Codex or open a new chat so the updates load. Codex ignores non-Markdown files in the prompts directory.”，并且只扫描 `~/.codex/prompts/` 顶层的 Markdown；新内容应使用 Skills。`/presets` 的槽位随用户配置加载进 `local_settings.tui.quick_dials`，保存或删除成功后立即同步内存副本并提示 “Saved preset {slot}.” 或 “Deleted preset {slot}.”，不需要重启会话；启动完成前按数字键提示 “Presets are available after startup completes.”，线程不可用时提示 “Presets are unavailable in this conversation.”。',
          surfaces:
            '以 Codex CLI 为准；桌面端、IDE 扩展、Cloud 和 `codex exec` 不自动继承全部交互命令。`/presets` 定义在 `codex-rs/tui`，在 `available_during_task` 的 `=> true` 分支里因而回合运行中可用，但不在 `available_in_side_conversation` 与 `available_when_thread_unavailable` 两个 `matches!` 清单中（两者默认返回 `false`），即 side conversation 内与线程不可用时不能执行；官方文档没有记录它在其他 Surface 的可用性，记为未确认。',
          permissions:
            'Prompt 或 Skill 都不绕过审批与沙箱。`/presets` 同样只是提交文本：槽位里的 Slash 命令与提示词走正常解析与权限流程，源码明确拒绝把 `!` 开头的 Shell 命令存成槽位；`s` 生成的 `/permissions <profile-id> --approval-policy=<policy> --reviewer=user|auto_review` 命令行仍要经过 `/permissions` 自己的解析与校验，未知策略报 “Unknown approval policy `{value}`. Expected `untrusted`, `on-request`, `never`, or a granular policy.”，未知审查者报 “Unknown permission reviewer `{value}`. Expected `user` or `auto_review`.”，且每个 reviewer 都保留 full-access 确认、自动审查不可用时拒绝。',
          conditions:
            '`/prompts:*` 已弃用（官方 Custom prompts 页逐字为 “Deprecated. Use skills for reusable prompts”），不能把它表述成与其他四家同等的现行项目级 Command 系统。`/presets` 于 2026-10-15 由四个提交合入 main（PR #54380 `dcd9e954598cd5e9f80570204896d779c60c1ecd`、PR #54381 `111362a6a0a92d08885b1ae62d3760714907ad94`、PR #54385 `36803b180a50e611331b75ff2b4c475c02846b53`、PR #54388 `f847a4bd3c6ca3d8474a6e0dace1ed39f7ec0067`），尚未进入 Release：标签 `rust-v0.163.0-alpha.10.2`（2026-10-15T18:26:31Z 发布，早于这四个提交）的 Slash 命令枚举里没有 `Presets` 变体，仓库 `CHANGELOG.md` 在 main 只有一条与 presets 无关的 `## Unreleased` 条目。官方文档也没有跟进：配置参考全文没有 `tui.presets` 与 `tui.keymap.chat.open_presets`，只有通用的 `tui.keymap.<context>.<action>` 记法；官方 Slash 命令页没有 `/presets`；Custom prompts 页没有提到 presets。`leader p` 是隐式绑定，只在该动作没有显式配置（显式解绑也算显式配置）且 leader 展开名额 `MAX_LEADER_CHORD_BINDINGS` 未满时安装，与既有绑定、任一单键动作或 `KeymapContext::Pager` 绑定冲突时跳过。',
          status: '条件项',
          sources: [
            'codex-custom-prompts',
            'codex-skills',
            'codex-presets-commit',
            'codex-presets-slash-command',
            'codex-presets-type',
            'codex-presets-persist',
            'codex-presets-recall',
            'codex-presets-snapshot',
            'codex-presets-keymap-commit',
            'codex-presets-chord-defaults',
            'codex-presets-permissions-commit',
            'codex-presets-statusline-commit',
            'codex-presets-unreleased',
            'codex-config-reference',
            'codex-developer-commands',
          ],
        },
        qwen: {
          entry:
            '`.qwen/commands/review.md` 生成 `/review`；Skills 同样可以注册 Slash 入口。',
          location:
            '全局 `~/.qwen/commands/`（官方标注 “Available in all projects”、优先级 Low、用途为 “Personal frequently used commands, cross-project use”）与项目 `<project root directory>/.qwen/commands/`（“Project-specific, version-controllable”、优先级 High、用途为 “Team sharing, project-specific commands”）；Extension 也可携带 Commands。',
          behavior:
            'Markdown 为推荐格式并带可选 YAML frontmatter，TOML 已弃用但仍向后兼容，官方逐字为 “Custom commands now use Markdown format with optional YAML frontmatter. TOML format is deprecated but still supported for backwards compatibility. When TOML files are detected, an automatic migration prompt will be displayed.”，TOML 小节另写 “**Deprecated:** TOML format is still supported but will be removed in a future version. Please migrate to Markdown format.”。文件名到命令名的映射为 `~/.qwen/commands/test.md` → `/test`、`<project>/.qwen/commands/git/commit.md` → `/git:commit`，规则是 “Naming Rules: Path separator (`/` or `\\`) converted to colon (`:`)”。占位符只有 `{{args}}`（“Context-aware Injection”、自动 Shell 转义），没有任何标记时参数 “Append to end of prompt (separated by two line breaks)”；`!{command}` 注入 Shell 执行结果且 “Execution confirmation required before”，`@{file path}` 注入文件内容（文本全量、图片与 PDF 走多模态编码、二进制受限可能跳过或截断、目录按 `.gitignore` 递归）。处理顺序固定为 “File Content … Processed first”、“Shell Commands … Processed in middle”、“Parameter Replacement … Processed last”。',
          scope:
            '官方 Priority Rules 逐字为 “Project commands > User commands (project command used when names are same)”；`FileCommandLoader` 的注释写明 “Returns commands in order: user → project → extensions (alphabetically).” 与 “User/project commands (without extensionName) use "last wins" strategy”、“Extension commands (with extensionName) get renamed if conflicts exist”，代码里第二段目录的注释是 “// 2. Project commands (override user commands)”，因此项目覆盖用户，与 Claude Code 的 personal over project 相反。',
          components:
            'Markdown frontmatter 只有可选的 `description`（“Command description (displayed in /help)”）加必填的提示正文；TOML 为必填 `prompt` 与可选 `description`。没有 `allowed-tools`、`model` 一类字段，也没有位置参数占位符（没有 `$0`、`$1` 或 `$ARGUMENTS`）；需要脚本与资源时改用 Skill。',
          loading:
            '文件加载器用 `**/*.toml` 与 `**/*.md` 两个 glob 同时扫描用户目录、项目目录与扩展（源码注释 “// Markdown commands already ignore a leading BOM; do the same here.”，TOML 解析前先 `stripUtf8Bom`），扩展过滤条件为 `ext.isActive && ext.format !== \'agent-plugins-v1\' && ext.installMetadata?.originSource !== \'AgentPlugins\'`；Extension manager 把扩展命令注册进统一命令注册表。',
          permissions:
            '命令模板可插入 Shell 结果，`!{command}` 在执行前有确认对话框，实际执行仍受环境与工具权限控制。',
          conditions:
            '保存的 Workflow 不是提示词模板：`saved-workflow-loader` 的 `@fileoverview` 逐字为 “Discovers saved workflow scripts under `.qwen/workflows/` (project) and `~/.qwen/workflows/` (user), plus the workflows active extensions ship, and exposes each as a `/<name>` slash command.” 与 “Typed in the interactive UI, the command dispatches the `workflow` tool with the file’s path; the script is read at execution time (by the tool), so edits take effect on the next invocation.”，存的是 JavaScript 编排脚本；`/workflows` 本身只是 “Inspect workflow runs; cooperatively pause/resume a background run” 的面板，且与 `/lsp`、`/trust` 一样只在功能开启时注册（`tools.workflowsEnabled` 或 `QWEN_CODE_ENABLE_WORKFLOWS=1`，workspace 值被忽略，未注册时 “will report an unknown command”）。核对日期没有把提示词存成配置槽位的机制：`commands.md` 全页唯一的 preset 字样在 `/statusline` 那一行，描述逐字为 “Open interactive status line preset dialog”（其中 status line 是指向同目录 `status-line.md` 的链接），指状态行布局预设而不是提示词预设。证据坐标为标签 `v0.25.2`（提交 `8a415cb628db88844e0196bdfdcce83b4f88d812`，Release 发布于 2026-10-15T15:41:15Z），该标签的 `commands.md` 为 78,099 字节且与 2026-10-15 的 main 逐字节相同，其 `## 4. Custom Commands` 一节与本仓库此前固定的 `8a44b1b9f793` 版本也逐字节相同；两个加载器源码自 `2e08486b529b` 起有改动（`SkillCommandLoader.ts` 6,328 → 7,645 字节、`FileCommandLoader.ts` 11,509 → 11,820 字节），但都不改变目录、格式、命名与优先级。',
          status: '源码确认',
          sources: [
            'qwen-commands-current',
            'qwen-commands-v0252',
            'qwen-saved-workflow-loader',
            'qwen-extension-runtime-current',
          ],
        },
        kimi: {
          entry:
            'Plugin 的 `commands/report.md` 以 `/kimi-finance:report` 调用，官方写明 “命令自动以插件 id 作前缀注册成 `<插件名>:<命令名>`，所以上面的命令实际叫 `/kimi-finance:report`，不同插件的同名命令因此不会冲突。”；Skills 使用 `/skill:<name>`，例如 `/skill:code-style` 与 `/skill:git-commits 修复登录接口的并发问题`。',
          location:
            '插件命令由 manifest（`kimi.plugin.json`）的 `commands` 字段声明，官方字段表逐字为 “一个或多个 `./` 路径，指向目录或 `.md` 文件，把其中的 Markdown 文件注册为斜杠命令”，路径必须在插件根目录内。Skill 目录分四档：用户级 `$KIMI_CODE_HOME/skills/`（默认 `~/.kimi-code/skills/`）与 `~/.agents/skills/`，项目级 `.kimi-code/skills/` 与 `.agents/skills/`（项目根为工作目录向上最近的含 `.git` 的目录），额外目录由 `config.toml` 顶层 `extra_skill_dirs` 声明，内置 Skill 随 CLI 分发。官方 `docs/zh/customization/` 只有 agents、datasource、hooks、mcp、plugins、skills 与 themes 七份文档，没有 commands 文档，也没有任何用户级或项目级的独立 `.kimi-code/commands` 目录。',
          behavior:
            '官方对插件斜杠命令的定义逐字为 “斜杠命令把一段常用提示词存成 `/命令`，输入即可触发。”；`commands` 指向目录时 “递归收集其中所有 `.md` 文件，每个文件各成为一个命令”，指向单个 `.md` 文件时 “只注册这一个”，指向非 `.md` 或不存在的路径时 “显示为 diagnostics 并被忽略”。命令后输入的文字会替换正文里的 `$ARGUMENTS`，“若正文没写 `$ARGUMENTS` 却传了参数，参数不会丢弃，而是以 `ARGUMENTS: <你输入的内容>` 追加到正文末尾”。Skill 正文另支持 `$ARGUMENTS[0]`、`$ARGUMENTS[1]` 及简写 `$0`、`$1`（“按空白分词后的位置参数（从 0 开始）”，支持单双引号包裹，`/skill:commit "fix login" patch` 里 `$0` 展开为 `fix login`）、`arguments` 中声明的命名参数 `$<name>` 与 `${KIMI_SKILL_DIR}`，正文不含任何占位符时以 `\\n\\nARGUMENTS: <文本>` 追加。',
          scope:
            '插件命令只在插件内声明、随用户安装的插件生效，没有项目级或用户级的等价目录；Skill 优先级为 “Kimi Code CLI 按作用域分四档扫描，越具体的作用域优先级越高：**Project > User > Extra > Built-in**”，内置 Skill 可用顶层 `builtin_product_skills` 关闭。“Skill 调用最多允许嵌套 3 层，超过后会被终止。”',
          components:
            '插件命令文件分可选 frontmatter 与正文，frontmatter 只有 `name` 与 `description` 两个字段：`name` 省略时 “按文件相对 `commands` 的路径命名，去掉 `.md`、以 `/` 分隔，如 `commands/frontend/component.md` 注册为 `frontend/component`”，显式写的优先；`description` 省略时 “取正文首行非空文字，超 240 字符截断；正文也为空则显示 `No description provided.`”。Skill 的 frontmatter 为 `name`、`description`、`type`（默认 `prompt`，另有 `inline` 与 `flow`）、`whenToUse`、`disableModelInvocation` 与 `arguments`，且可以是目录形式（子目录加 `SKILL.md`，推荐）或扁平形式（直接放在 Skills 目录下的 `.md`），两者同名时以目录形式为准、扁平文件被忽略。',
          loading:
            '随 Plugin 加载；修改后使用 `/reload` 或新会话。',
          permissions:
            '命令产生的操作继续受 Kimi 工具权限约束。',
          conditions:
            '未发现公开的独立用户/项目 Command 目录；不要根据 `.kimi-code/skills` 推断 `.kimi-code/commands`。`docs/zh/customization/plugins.md` 在 main（`ef727e517923`，25,451 字节）比 2.2.0 标签（`472192c34c1e`）新，main 多出的 Plugin Skill 全限定名 `<plugin-id>:<skill-name>` 段落与放宽后的插件 `name` 正则还没有进入任何 Release；本字段关心的 `## 插件斜杠命令` 一节自本仓库此前固定的 `691ec4679ea1`（19,577 字节）起只有 10 行文字润色、规则未变。`docs/zh/customization/skills.md` 在 main 与 2.2.0 标签逐字节相同（7,332 字节）。2.2.0 Release（2026-10-14T15:31:16Z）里与自定义命令相关的唯一条目是 “Replace user skill cards with highlighted prompts and support Ctrl-S for skill prompts.”（PR #4165，提交 `afd95f64a544`），该 PR 的需求段为 “统一 TUI 行首和行中 Skill 的用户消息展示、高亮，并让两种调用都支持 Ctrl-S steer。”，42 个改动文件里没有 `config.toml`、`tui.toml` 或配置 schema，唯一的 schema 变化是 klient 契约新增可选字段 `steerIfActive`，PR 正文还写明 “显示输入不代表执行成功，也不保证引擎已持久化”，因此它是消息渲染与 steer 投递改动，不保存可复用提示词、不构成同类机制。`config.toml` 与 `tui.toml` 的字段表里也没有 preset、quick dial 或数字槽位一类键（`tui.toml` 只有 `theme`、`tui_mode`、`render_latex`、`disable_paste_burst`、`cache_expiry_hint`、`disable_feedback_survey`、`auto_session_title`、`[editor].command`、`[notifications].enabled`、`[notifications].notification_condition`、`[upgrade].auto_install`、`[status_line].items` 与 `[status_line].command`），唯一带“槽位”字样的是 `[status_line].items` 的说明 “底部状态栏第一行的内置槽位及顺序：mode、goal、model、tasks、cwd、git、tips，未知 id 跳过并告警”，指状态栏组件位置而不是提示词槽位。',
          sources: [
            'kimi-plugins-current',
            'kimi-plugin-commands-main',
            'kimi-skills-current',
            'kimi-skills-220',
            'kimi-skill-steering-pr',
            'kimi-release-220',
            'kimi-compaction-config',
          ],
        },
        qoder: {
          entry:
            '`/commands` 重新加载并列出可用命令：官方 Slash 命令参考逐字为 “Reload and list all available commands.”，Custom Commands 页写面板 “is used to view the list of currently available commands by category (Built-in, Dynamic, Skill, Plugin, Workflow, etc.) and does not provide an entry point for creation.”，用 Tab 切换分类页签（只显示有命令的分类且页签带数量）、上下键浏览、“Custom commands are categorized under **Dynamic**”、Esc 退出，且 “The panel is for browsing only.”，要看某个自定义命令的完整系统提示词得直接打开对应的 `.md` 文件。命令名由 Markdown 文件路径决定。',
          location:
            '项目 `.qoder/commands/<command_name>.md`（Scope “Current project only”，Commit to Code Repository “Recommended (team sharing)”）与用户 `~/.qoder/commands/<command_name>.md`（Scope “All projects”，“Do not commit (personal configuration)”）；Plugin 也可携带 `commands/`，官方插件页写明 “Register custom slash commands; same structure as `~/.qoder/commands/`”，但没有记录插件命令的命名空间前缀，插件 id 形如 `name@local` 与 `name@marketplace-name`。',
          behavior:
            'Markdown 正文是该命令的 system prompt，官方示例正文写 “This is the system prompt content for the command. When the user executes this command, this prompt is submitted to the conversation to guide the CLI in completing specific tasks.”。这类命令属 Prompt Type（Description “Submits preset prompts to the conversation to guide the CLI in completing specific tasks”，Applicable Mode “TUI + Headless”，Extensibility “Supports user-defined custom extensions”），与之相对的 TUI Type 只提供交互界面且 “Built-in, custom extensions not supported”。子目录用 `:` 作命名空间分隔符（“Commands in subdirectories use `:` as the namespace separator; for example, `commands/git/commit.md` is registered as `/git:commit`”），命令名各段 “preserved as-is without character replacement”；同目录存在 `SKILL.md` 时 “the directory will be registered as a single command (e.g., `/git`), and other sibling `.md` files within the directory will be ignored”。Headless 侧官方写明 “Headless mode supports the execution of commands that submit prompts. Commands that require opening interactive selectors or dialogs should be used in TUI mode.”，示例为 `qoder -p \'/git-commit\'` 与 `qoder -p \'/review Focus on checking comment coverage\'`。',
          scope:
            '同名命令同时存在于项目级与用户级时，官方逐字为 “the **User-Level** (`~/.qoder/commands/`) command takes precedence and overrides the project-level command with the same name; the overridden definitions are listed under Also defined at in the command details.”，即用户级覆盖项目级——与 Claude Code 的 “personal over project” 同向，与 Qwen Code 的 “Project commands > User commands” 相反。Plugin 命令随其 scope 加载。',
          components:
            'frontmatter 只有两个字段：`name`（Required “No”，“The display name of the command in the TUI; the invocation name is determined by the file path and is not affected by this field”）与 `description`（Required “Yes”，“The functional description of the command, supporting multiline text (using YAML syntax)”）。命名约定建议用小写字母与连字符、避免空格与特殊字符、文件名与 `name` 保持一致。官方没有记录任何参数占位符语法（没有 `$ARGUMENTS`、`$1`、`{{args}}`），Headless 里命令后的文字只是尾随附加文本；需要脚本与资源时改用 Skill 或 Plugin。',
          loading:
            '启动时扫描目录；“If Qoder CLI is already running, after adding or modifying a command configuration file, run `/commands` to reload and view the available commands.”；Plugin Commands 可随 `/plugins reload` 刷新。',
          permissions:
            'Headless 或 TUI 中执行命令后，工具仍经过对应权限模式。',
          conditions:
            'Prompt Type 命令的 Headless 可用性不代表所有内置交互命令都能在 Headless 中运行；TUI Type 明确不支持自定义扩展。官方 Custom Commands 页的正确地址是 `https://docs.qoder.com/cli/commands`（`https://docs.qoder.com/en/cli/commands` 会重定向到它，`https://docs.qoder.com/cli/custom-commands` 是 404），本仓库此前只固定了 Slash 命令参考页。该页 preset 只作为 Prompt Type 描述里的形容词出现一次（“Submits preset prompts…”），没有 `/presets` 命令、没有 `presets` 配置键、也没有数字槽位。发布说明最新条目为 CLI 1.1.71（October 14, 2026），其前的 1.1.70（October 13）、1.1.69（October 12）、1.1.68（October 10）与 1.1.67（October 9）都没有自定义命令或预设条目；全页与提示词保存相关的只有 CLI 1.1.20（August 12, 2026）的 “Added Ctrl+S to stash the current prompt draft and restore it later”，那是草稿暂存而不是可命名、可编号的提示词槽位。',
          sources: [
            'qoder-custom-commands',
            'qoder-commands',
            'qoder-plugins',
            'qoder-release-notes',
          ],
        },
      },
      related: [
        'extension-skills',
        'extension-plugins',
        'extension-output-styles',
        'cmd-review',
      ],
    }),

    'extension-output-styles': createDetail({
      id: 'extension-output-styles',
      definition:
        '向系统提示词追加预设或自定义 Markdown 指令，改变回复的角色、语气、冗长度或结构；不改变知识库、工具或权限边界。',
      includes: [
        '内置风格与选择入口',
        '自定义风格文件目录与 frontmatter',
        '插件携带风格与强制应用',
        '选择的保存位置与生效时机',
      ],
      excludes: [
        '模型或推理强度选择',
        '项目指令文件（CLAUDE.md、AGENTS.md、QWEN.md）',
        'Agent 定义中的系统提示词',
        '整体替换系统提示词的入口（`--system-prompt`、`QWEN_SYSTEM_MD`、`SYSTEM.md`、`model_instructions_file`）',
        '主题与配色',
      ],
      facts: [
        '完整的输出风格机制只有三家：Claude Code、Qwen Code 与 Qoder CLI 都把风格实现为叠加到内置系统提示词上的一段命名指令，都支持用户级与项目级自定义 Markdown 风格文件。Codex 与 Kimi Code 当前都没有风格预设机制。',
        '插件携带风格只有两家：Claude Code 插件可在包内放 `output-styles/`，并用 frontmatter `force-for-plugin: true` 覆盖用户的 `outputStyle`（多个启用插件同时强制时取最先加载者）；Qoder CLI 插件按 `output-styles/` 目录约定自动发现，也可在 manifest 用 camelCase 的 `outputStyles` 显式声明，插件强制风格优先于 `outputStyle` 设置。Qwen Code 扩展的 `qwen-extension.json` 组件字段只有 `mcpServers`、`channels`、`contextFileName`、`commands`、`skills`、`agents`、`workflows` 与 `settings`，核心类型 `OutputStyleSource` 虽保留 `extension` 取值，但目录加载器只读内置、用户与项目三级。',
        '会话中切换的生效时机三家不同：Qwen Code 的 `/output-style` 保存设置后调用 `refreshSystemInstruction()` 就地重建系统提示词，官方写 “the next turn already answers in the new style”；Claude Code 自 v2.1.251 起 “Claude uses the new style starting with your next message”，此前需 `/clear` 或新会话；Qoder CLI 的 `/output-style` 官方描述是 “Choose this project\'s output style for the next conversation. Run `/clear` or `/new` to apply it.”，而修改配置里的 `outputStyle` 还要重启 CLI。',
        '自定义风格文件的重读时机也不同：Qwen Code 每次打开选择器或给定名字时重读目录，官方写 “a new file needs no restart”；Claude Code 官方写 “In the terminal, Claude Code reads style files when it starts, so if you create or edit one during a running session, restart Claude Code to pick up the change.”',
        '内置风格名高度重合但各自独立实现：Claude Code 官方写 “four built-in styles besides its default”（Default、Proactive、Concise、Explanatory、Learning，Concise 需 v2.1.237 及以上）；Qwen Code 的 `BUILT_IN_OUTPUT_STYLES` 是 Concise、Proactive、Explanatory、Learning 加 `default`（v0.23.0 起）；Qoder CLI 官方始终只给 `concise` 一个示例取值，没有公布完整内置清单。',
        '风格都只作用于主对话：Claude Code 官方写风格适用于主对话与 fork、“Other subagents run their own system prompt, so styles don\'t change how they respond.”；Qwen Code 官方写 “Styles apply to the main conversation only.”，arena peer 只在风格保留 coding instructions 时才继承会话风格；Qoder CLI 官方写 Output Style “does not alter Qoder\'s core identity or security constraints”。',
        '项目级风格与项目级配置都以工作区信任为前提：Qwen Code 只在 `config.isTrustedFolder()` 为真时传入 `projectRoot`，官方另写 “Trust is checked whenever the style is used, not only when the file is read”；Qoder CLI 官方写项目级与本地级设置 “only applied when the current working directory is trusted”（`security.folderTrust.enabled` 默认开启）；Codex 的项目级 `config.toml` 同样 “loaded only when you trust the project”。',
      ],
      products: {
        claude: {
          entry:
            '四个入口：`/output-style [style]`（官方命令表逐字 “List output styles or switch to one, for example `/output-style concise`. See Change your output style. Requires Claude Code v2.1.269 or later”，不带参数时列出可选风格并标出当前项）；终端 `/config` 选 **Output style**（`/config` 行描述含 “Open the Settings interface to adjust theme, model, output style, and other preferences”，别名 `/settings`，`key=value` 形式也可用于非交互 `-p`）；VS Code 扩展用 `/` 打开命令菜单选 **Output styles**（需 v2.1.257 及以上，v2.1.261 起菜单内另有 “Build a custom style” 向导，可直接写出自定义风格文件并立即列出）；桌面 App 没有风格菜单，只能在设置文件手写 `outputStyle`（桌面端 `/config` 打开 Settings > Code 或 Settings > Claude Code）。官方命令表对 `/pr-comments`、`/vim` 等仍保留 “Removed in v2.1.91”、“Removed in v2.1.92” 行，而 `/output-style` 行没有任何弃用或移除标注。',
          location:
            '自定义风格为 Markdown 文件，官方给出三级加插件：用户 `~/.claude/output-styles`、项目 `.claude/output-styles`、受管策略目录内的 `.claude/output-styles`，插件另可在包内 `output-styles/` 携带。项目风格逐字为 “Project output styles load from every `.claude/output-styles/` between the working directory and the repository root. When more than one of these nested directories defines a style with the same name, Claude Code uses the one closest to the working directory.”',
          behavior:
            '官方首句为 “Claude Code includes four built-in styles besides its default, and you can write your own.”，内置为 Default、Proactive、Concise、Explanatory、Learning；Concise 行描述 “Responses lead with the result and leave out preamble, narration, and recaps”，正文写 “In the Concise style, the first sentence of a response states what happened or what the answer is… Requires Claude Code v2.1.237 or later.”。风格改的是角色、语气与输出格式，不改知识库。自定义风格默认不保留内置软件工程指令，需 frontmatter `keep-coding-instructions: true`，且官方注明要依赖该字段须把 `CLAUDE_CODE_SIMPLE_SYSTEM_PROMPT` 设为 `0`。v2.1.311 起 Explanatory 风格在用户要求解释时另给一条提示。',
          scope:
            '`/output-style` 与两个菜单都把选择保存到本地项目级的 `.claude/settings.local.json`（官方逐字 “The command and both menus save your choice to `.claude/settings.local.json` at the local project level.”）；手写 `"outputStyle"` 可放进任意设置文件（官方设置参考的作用域列为 “Any file”），优先级为 managed → `--settings` → `.claude/settings.local.json` → `.claude/settings.json` → `~/.claude/settings.json`。风格作用于主对话与 fork（fork 继承父会话的完整对话与系统提示词），其他 Subagent 跑自己的系统提示词因而不受影响。',
          components:
            'frontmatter 四键：`name`（“Default: the file name”）、`description`（选择器中显示）、`keep-coding-instructions`（“Default: `false`”，为真时保留内置软件工程指令）、`force-for-plugin`（“Plugin output styles only… Overrides the user\'s `outputStyle` setting. If multiple enabled plugins set this, Claude Code uses the first one loaded. Default: `false`”）。',
          loading:
            '选择本身在会话中即时生效——官方逐字 “When you switch styles mid-session, Claude uses the new style starting with your next message. … Before v2.1.251, the new style applied only after you ran `/clear` or started a new session.”；但风格文件只在启动时读取，逐字 “In the terminal, Claude Code reads style files when it starts, so if you create or edit one during a running session, restart Claude Code to pick up the change.”。设置值大小写敏感（内置名要写 `Proactive`、`Concise`、`Explanatory`、`Learning`），而 `/output-style` 命令忽略大小写。v2.1.286 起选择器打开时停在当前风格而不是 Default、在名字下一行显示描述，且数字键不再用于选择。插件风格 `force-for-plugin: true` 时插件启用即自动应用并覆盖用户 `outputStyle`，多个插件同时强制时最先加载者生效。',
          surfaces:
            '以 Claude Code CLI 为准。`/output-style` 官方注明也在非交互模式、Agent SDK 会话与经 Remote Control 的手机 App/Web 可用，但那些 Surface “you can list and select only built-in styles”；VS Code 扩展自 v2.1.257 起在命令菜单提供 Output styles 选择（含自定义风格）；桌面 App 没有风格菜单，只能写设置文件。',
          permissions:
            '风格只改系统提示词，不改权限设置；Proactive 风格自主执行更强，但仍遵守当前权限设置。v2.1.295 修复了 `/model`、`/fast` 与 `/output-style` 保存设置时不询问插件 `config.set` Hook 的问题，即风格保存现在会经过插件 Hook；v2.1.283 修复了 `claude plugin validate` 放过 `outputStyles` 路径缺失或指向插件目录之外的插件。',
          conditions:
            '官方 Settings 概览页（45,734 字节）已不含 `outputStyle` 或 “output style” 字样，该键移到 Settings reference 页（449,263 字节）；Remote Control、手机 App、Web 与非交互会话只能选内置风格；`CLAUDE_CODE_SIMPLE_SYSTEM_PROMPT` 未设为 `0` 时不能依赖 `keep-coding-instructions`；v2.1.251 之前的版本切换风格需 `/clear` 或新会话；v2.1.238 修复过自定义、项目与插件风格在会话中漂移回默认语气的问题。',
          sources: [
            'claude-output-styles',
            'claude-output-styles-recheck',
            'claude-commands-output-style-row',
            'claude-settings-reference-outputstyle',
            'claude-output-styles-changelog-0ed9469',
          ],
        },
        codex: {
          entry:
            '`config.toml` 的 `personality` 键，官方配置参考现把它记为兼容设置；`/personality` 命令已不在官方 CLI Slash 命令参考中——该页（522,553 字节，标题 “Slash commands in Codex CLI”）任何位置都不出现 “personality” 一词，`/style`、`/output-style`、`/tone`、`/persona` 同样不存在，与外观有关的只有 `/theme`；`features.personality` 开关已被移除。',
          location:
            '用户级 `~/.codex/config.toml`；项目级覆盖 `.codex/config.toml`，官方逐字 “Codex loads project-scoped config files only when you trust the project.”',
          behavior:
            '官方配置参考的 `personality` 行逐字为 “Deprecated compatibility setting. `friendly` and `pragmatic` no longer select a style. `none` omits the built-in Personality section from model instructions; explicit instruction overrides are unchanged.”，即只有 `none` 还有可观察作用（省掉内置 Personality 段），`friendly` 与 `pragmatic` 不再选择任何风格；`features.personality` 行逐字为 “Removed feature flag. Accepted for compatibility and ignored.”；`supportsPersonality`、`output_style` 与 `outputStyle` 三个字符串在该页任何位置都不出现。没有从目录加载自定义风格文件的机制。',
          scope:
            '`personality` 按用户或项目 `config.toml` 作用域持久；已没有命令级的按线程或单轮覆盖入口。',
          components:
            '无自定义风格文件与 frontmatter。官方仓库 `docs/` 目录 15 个文件都没有 style、personality、tone、persona 或 output 相关内容，其中 `docs/config.md`（726 字节）与 `docs/slash_commands.md`（145 字节）已改成指向文档站的跳转存根，后者逐字为 “For an overview of Codex CLI slash commands, see [this documentation](https://developers.openai.com/codex/cli/slash-commands).”',
          loading:
            '`config.toml` 随启动读取；`features.personality` 即使写进配置也被忽略。官方 Advanced configuration 页任何位置都不出现 `personality`、`style`、`tone` 或 `persona`。',
          permissions:
            '不涉及权限变化；项目级 `config.toml` 仅在项目受信任时加载。',
          conditions:
            '相邻但不是风格预设的键：`model_verbosity`（`low`/`medium`/`high`，官方写 “Optional GPT-5 Responses API verbosity override; when unset, the selected model/preset default is used.”，高级配置页另注明 “applies only to providers using the Responses API. Chat Completions providers will ignore the setting.”）、`model_reasoning_summary`（`auto`/`concise`/`detailed`/`none`，官方写 “Select reasoning summary detail or disable summaries entirely.”，取值里的 `concise` 是推理摘要详略档位、与输出风格无关）、`developer_instructions`（“Additional developer instructions injected into the session (optional).”）与 `model_instructions_file`（“Replacement for built-in instructions instead of `AGENTS.md`.”）。`/personality` 的移除坐标：`codex-rs/tui/src/slash_command.rs` 的 `Personality` 变体在 rust-v0.154.0（12,532 字节）与 rust-v0.155.0（2026-09-17T23:14:43Z 发布，12,342 字节）仍存在，自 rust-v0.156.0（2026-09-22T19:51:01Z 发布，13,711 字节）起消失，rust-v0.158.0、rust-v0.162.1、rust-v0.163.0、rust-v0.166.0 与 rust-v0.167.0 中 “personality” 一词完全不出现；核对日期最新非 alpha Release 为 rust-v0.167.0（2026-11-06T01:40:00Z），其发布说明没有风格相关条目。最接近的自定义文件机制是 custom prompts，官方只写 “Custom prompts appear as `/prompts:<name>` commands.”',
          sources: [
            'codex-personality-deprecated',
            'codex-cli-slash-commands-recheck',
            'codex-personality-enum-removal',
            'codex-config-advanced-verbosity',
          ],
        },
        qwen: {
          entry:
            '交互式 `/output-style` 打开选择器（命令返回 `{ type: \'dialog\', dialog: \'output-style\' }`）、`/output-style <name>` 直接设定、`/output-style default` 回到无风格；`argumentHint` 逐字为 `[Concise|Proactive|Explanatory|Learning|<custom>|default]`，`supportedModes` 为 `[\'interactive\', \'non_interactive\', \'acp\']`，非交互与 ACP 下不带参数时只打印当前风格与可选清单。设置键为 `general.outputStyle`（string，默认 `undefined`）；单次运行用 `qwen -p "..." --output-style Concise`，官方 Headless 文档写它 “overrides the `general.outputStyle` setting; `default` selects no style”。官方命令文档行逐字为 “Choose the output style that shapes how responses are written”，示例列 `/output-style` (opens picker)、`/output-style Concise`、`/output-style default` (no style)。命令无别名，`--bare` 与 `--safe-mode` 下运行直接报 “Output styles are unavailable in --bare and --safe-mode.”',
          location:
            '自定义风格是 Markdown 文件、正文即提示词，两个目录：用户级 `~/.qwen/output-styles/<name>.md`（全部项目可用，`QWEN_HOME` 改变时随之移动）、项目级 `<project>/.qwen/output-styles/*.md`（只在工作区受信任时读取）。目录名来自常量 `OUTPUT_STYLES_DIR_NAME = \'output-styles\'`；加载器只读目录内直接的 `*.md`（`/\\.md$/i`），不递归子目录。',
          behavior:
            '风格是叠加到内置系统提示词上的一段命名指令：`renderOutputStyleSection` 渲染为 `# Output Style: <name>` 加正文，`applyOutputStyle` 把它追加到基础提示词末尾，源码注释逐字为 “The section lands last in the stable layer — after the mandates it refines, and ahead of every context/volatile layer, so a session\'s prompt prefix stays stable for its whole life.”；每轮另发一条提醒，`getOutputStyleTurnReminder` 返回 “<name> output style is active.” 加风格自带或通用的 “Remember to follow the specific guidelines for this style.”。内置为 `Concise`、`Proactive`、`Explanatory`、`Learning`（`BUILT_IN_OUTPUT_STYLES`，四者 `keepCodingInstructions` 全为 `true`）加 `default`（不追加任何风格）。Proactive 提示词末段逐字为 “This style changes how much you plan and ask; it does not change what you are allowed to do.”，官方文档结尾逐字为 “Styles adjust tone and workflow, not knowledge or permissions.”。`Learning` 在 headless 下被丢弃：`resolveEffectiveOutputStyle` 只在 `interactionMode === \'headless\' && style.source === \'built-in\' && style.name === \'Learning\'` 时返回 `undefined`，源码注释说明该规则认定义而不认显示名，所以用户自写的 `Learning.md` 不受影响。',
          scope:
            '`general.outputStyle` 按设置文件作用域持久。`/output-style` 的选择写回设置文件：受信工作区的项目设置已经拥有 `general.outputStyle` 键时写 Workspace 作用域，否则写 User 作用域（官方逐字 “If a trusted project setting currently owns `general.outputStyle`, the command updates that project setting; otherwise it updates your user setting.”）；该键属于项目但 `allowWorkspaceSettingsWrite === false` 时抛 “Project output style settings are not available in this session.”。`--output-style` 只覆盖本次运行。作用范围官方逐字为 “Styles apply to the main conversation only. Subagents run their own system prompts, and an arena peer inherits the session\'s style only when that style keeps the coding instructions — a peer is judged on the diff it produces, so it never runs with the software-engineering guidance removed.”',
          components:
            'frontmatter 可选，`KNOWN_FRONTMATTER_KEYS` 只有 `name`、`description` 与 `keep-coding-instructions`，未知键写 debug 日志并忽略。`name` 默认取去掉 `.md` 的文件名，`default` 保留，空名、超过 64 字符（`MAX_OUTPUT_STYLE_NAME_LENGTH`）或含 `\\p{Cc}`/`\\p{Cf}` 控制与格式字符的名字被拒绝；`description` 默认取正文第一行散文（剥掉 Markdown 标记、上限 120 字符、经 `stripAnsiAndControl` 与去 `\\p{Cf}` 清理），声明与派生都取不到时回退 `Custom <name> output style`；`keep-coding-instructions` 未声明时继承同名内置风格的取值、无同名内置时默认 `false`，声明值只认 true/false（字符串大小写不敏感），其他取值告警并按 `false`。官方写 `false` 只去掉软件工程工作流那一段，“Everything else in the built-in prompt — identity, safety rules, tool guidance — stays in force under every style.”',
          loading:
            '每次打开选择器或给定名字时重读目录（`loadSessionOutputStyles` → `loadOutputStyleCatalog`），源码注释为 “re-read on every call so a file added mid-session is picked up without a restart”；`projectRoot` 只在 `config.isTrustedFolder()` 为真时传入，官方另写 “Trust is checked whenever the style is used, not only when the file is read, so revoking trust mid-session stops a project style from shaping the conversation.”。名字大小写不敏感且唯一，胜出顺序为项目 > 用户 > 内置，选择器显示顺序为内置 → 用户 → 项目并标注来源。单个文件不可加载时跳过并写 debug 日志、不影响其他文件：正文为空、名字非法、大于 25,000 字节（`MAX_OUTPUT_STYLE_FILE_BYTES`，注释说这个尺寸已相当于每次请求约 6k token）、非 UTF-8 文本（注释点名 PowerShell `>` 与记事本写出的 UTF-16）、整篇正文只是 HTML 注释；正文里的 HTML 注释会被剥掉。链接防护：项目风格文件是符号链接即跳过，用户风格文件可以是符号链接但 `realpath` 必须落在用户主目录（或设了 `QWEN_HOME` 时的该目录）内，两级都拒绝 `nlink > 1` 的硬链接，源码注释给出的威胁模型是 “`.qwen/output-styles/notes.md -> ~/.aws/credentials` is committable, survives `git clone`, and needs no user action beyond starting the CLI.”。同一目录内按文件名排序读取，与已在集合中的名字重复的后者被跳过。',
          surfaces:
            '以 Qwen Code CLI 为准。`/output-style` 声明 `supportedModes: [\'interactive\', \'non_interactive\', \'acp\']`，`--output-style` 记录在官方 Headless 文档的 Configuration Options 表；官方 VS Code 集成文档（1,482 字节）的 Features 清单只有原生 IDE 体验、自动接受编辑、文件管理、会话历史与多会话五项，没有输出风格入口；桌面端与 Web Shell 的风格入口当前一手资料未列出。',
          permissions:
            '`--bare` 与 `--safe-mode` 下命令直接报错、设置值也被忽略，官方写这两种模式 “keep the built-ins only”；项目风格只在工作区受信任时读取。`--system-prompt` 或 `QWEN_SYSTEM_MD` 整体替换系统提示词时风格与其每轮提醒都不生效，此时 `/output-style` 仍保存选择并追加 “It is saved but has no effect in this session because the system prompt is replaced (--system-prompt or QWEN_SYSTEM_MD).”；风格不改权限，Proactive 的提示词明确保留 “Executing actions with care” 规则与当前权限策略。',
          conditions:
            '扩展不携带输出风格——`qwen-extension.json` 的组件字段为 `mcpServers`、`channels`、`contextFileName`、`commands`、`skills`、`agents`、`workflows` 与 `settings`，官方扩展总览（28,416 字节）没有出现 “output styles” 或 “output-styles”，核心类型 `OutputStyleSource` 虽保留 `extension` 取值但 `loadOutputStyleCatalog` 只加载内置、用户与项目三级。切换风格会让已缓存的提示词前缀失效一次（官方 “Changing the style mid-session invalidates the cached prompt prefix once; after that, caching works as usual.”）。headless 下未知的风格名只打印警告并按默认风格继续。作用域与风格来源不匹配时命令只提示不搬移（个人风格写进项目设置文件、项目风格写进用户设置各有一条跨作用域解析警告）。版本时间线：`c7c4dc80e0ec`（2026-08-24，PR #9565）建立提示词中的 output-style 层 → `ed6fc69ae9b4`（2026-08-31，PR #10282）加入每轮提醒 → PR #10283 加入 `general.outputStyle` 与 `--output-style` → `1772e14812a3`（2026-09-02，PR #10683）加入 `/output-style` 命令与选择器，以上随 v0.23.0（2026-09-03T11:03:15Z，标签提交 `98a9c9641586`）进入 stable，该标签下官方文档只有 3,407 字节、没有 `## Custom styles` 一节，v0.22.3 下该文件不存在 → `d0847308f15e`（2026-09-04，PR #10761）加入两个自定义目录，随 v0.23.1（2026-09-08T15:56:16Z，标签提交 `d9331e6fcf7f`）进入 stable；此后 `output-styles.ts`（9,871 字节）与 `output-style-files.ts`（17,667 字节）再无提交，官方文档在 v0.23.1 与 v0.26.9（标签提交 `600aff0592bc`）都是 6,589 字节。',
          status: '官方确认',
          sources: [
            'qwen-output-styles-doc',
            'qwen-output-styles-core',
            'qwen-output-style-files-src',
            'qwen-output-style-command-src',
            'qwen-output-style-utils-src',
            'qwen-output-styles-settings-row',
            'qwen-output-styles-commands-row',
            'qwen-output-styles-headless',
            'qwen-output-styles-extension-intro',
            'qwen-output-styles-v0230-release',
            'qwen-output-styles-v0231-release',
            'qwen-output-style-layer-commit',
            'qwen-vscode-integration-current',
          ],
        },
        kimi: {
          entry:
            '官方 Slash 命令参考（main `eb2035f3cad5`，13,171 字节）没有 `/output-style`、`/style`、`/personality` 或 `/tone`，与外观有关的只有 `/theme`（“切换终端 UI 配色主题”）与 `/custom-theme [<text>]`（“创建或编辑自定义 TUI 配色主题”，原行另带一个指向 `customization/themes.md` 的站内链接）；`/import-from-cc-codex` 行逐字为 “从 Claude Code 和 Codex 导入 instructions、skills 和 MCP 设置”，即从 Claude Code 迁移也不导入输出风格。',
          location:
            '没有风格目录。最接近的提示词级入口是 `$KIMI_CODE_HOME/SYSTEM.md`（默认 `~/.kimi-code/SYSTEM.md`）、自定义 Agent 的 `.md` 文件、指令文件 `$KIMI_CODE_HOME/AGENTS.md` 与项目 `AGENTS.md`，以及 plugin 的 `systemPrompt`/`systemPromptPath`；都不是按名字选择的风格预设目录。',
          behavior:
            '`config.toml` 官方文档（main 48,662 字节、stable 2.5.2 下 47,824 字节）没有任何表名或键包含 style、tone、persona、personality、verbosity 或“风格”。`## identity` 一节逐字为 “自定义 Agent 的身份标识。不设置时行为完全不变。”，只有 `name`（“Agent 在系统提示词中的自称（填充 `${product_name}` 变量，你自己的 `SYSTEM.md` 和 agent 文件同样适用）”）与 `slug`（默认“由 `name` 派生”，“协议字段中的机器标识：`User-Agent` 产品名与 MCP 客户端名；省略时由 `name` 派生（转小写，非字母数字折叠为 `-`）”）两键，两者也可用 `KIMI_CODE_IDENTITY_NAME`/`KIMI_CODE_IDENTITY_SLUG` 设置（优先级高于 `config.toml`、不写回文件），名字不含 ASCII 字母或数字时 slug 回退为 `agent`，身份在启动时解析一次、进程生命周期内不变，均不改变回复风格。`SYSTEM.md` 的作用逐字为 “文件存在且非空期间，它整体替换内置默认 main agent 的系统提示词；但只替换提示词，描述、工具集与允许委派的 subagent 列表仍沿用内置默认值。”',
          scope:
            '`[identity]` 随配置文件作用域生效，官方写 “修改本节配置在下次启动时对新会话生效；resume 的会话保留录制时的系统提示词”。`SYSTEM.md` 在用户作用域内优先于 `agents/` 目录中扫描到的同名文件，但项目作用域中声明 `override: true` 的同名 Agent 文件与 `--agent-file` 传入的文件排在它之前，用 `--agent` 选择其他 Agent 时它不生效；绑定的 Agent 即会话身份，会话首次绑定后不可切换。',
          components:
            '无自定义风格文件与 frontmatter。自定义 Agent 文件的 frontmatter 只有 `name`、`description`、`whenToUse`、`override`、`tools`、`disallowedTools` 与 `subagents` 七个字段，正文即该 Agent 的系统提示词；`SYSTEM.md` 是纯 Markdown 正文、“不需要也不读取 Frontmatter”，正文按模板渲染并支持 `${skills}`、`${agents_md}`、`${cwd}`、`${cwd_listing}`、`${os}`、`${shell}`、`${now}`、`${additional_dirs_info}`、`${base_prompt}`、`${plugin_sections}` 等变量。',
          loading:
            '无风格加载流程。`SYSTEM.md` 文件缺失或为空时不生效、读取失败时告警并回退内置提示词，在包括交互式 TUI 会话在内的所有启动方式下生效；plugin 的 `systemPrompt` 与 `systemPromptPath` 各限 32 KB（UTF-8 字节），一次提示词构建所有已启用 plugin 合计上限 64 KB，超限内容被忽略并写进 diagnostics。',
          permissions: '不涉及权限变化。',
          conditions:
            '官方文档树在核对日期没有 style、tone、persona、personality、output 或 prompt 相关的独立页面，`docs/zh` 与 `docs/en` 下与外观相关的只有 `customization/themes.md`（5,888 字节，全部 token 都是界面配色）；`docs/zh/customization/plugins.md`（27,123 字节）与 `docs/zh/customization/agents.md`（16,307 字节）都不出现 style、风格、tone、persona 或 personality；官方 CHANGELOG（`apps/kimi-code/CHANGELOG.md`，465,236 字节，最新段 `## 2.5.2`）近期段落没有风格相关条目。坐标：最新 stable `@moonshot-ai/kimi-code@2.5.2`（2026-11-06T07:48:19Z），main HEAD `eb2035f3cad57cc12d4d5082ec626f7f0ea5f651`（2026-11-06T12:19:30Z）。`systemPrompt`/`systemPromptPath` 是 plugin manifest 字段而不是 Agent 定义字段，旧记录把两者混为一处已作废。',
          sources: [
            'kimi-config-files-eb2035f',
            'kimi-commands-eb2035f',
            'kimi-agents-system-md',
            'kimi-plugins-system-prompt',
            'kimi-themes-eb2035f',
          ],
        },
        qoder: {
          entry:
            '`settings.json` 顶层 `outputStyle` 键（官方逐字 “Name of the active Output Style (requires restart). Compatible with the `general.outputStyle` syntax, with top-level taking precedence.”）；命令行 `qoder --output-style <name>`；交互式 `/output-style`，官方 Slash 命令参考逐字为 “Choose this project\'s output style for the next conversation. Run `/clear` or `/new` to apply it.”，该命令自 CLI 1.1.47（September 8, 2026）起提供，更新日志条目逐字为 “Added the `/output-style` command to select an output style for the current project in the interactive interface”。',
          location:
            '自定义风格为 `.md` 文件：用户级 `~/.qoder/output-styles/`（全部项目生效）、项目级 `<project>/.qoder/output-styles/`（仅当前项目）；插件另可在包内 `output-styles/` 目录携带，manifest 也可用 camelCase 的 `outputStyles` 显式声明以覆盖目录约定或使用内联内容，未声明时按约定自动发现。`outputStyle` 设置写在 `~/.qoder/settings.json`（用户）、`<project>/.qoder/settings.json`（项目）或 `<project>/.qoder/settings.local.json`（本地），官方应用顺序五层逐字为 “Built-in defaults (Schema defaults)”、“User Level settings (`~/.qoder/settings.json`)”、“Project-Level settings (`<project>/.qoder/settings.json`)”、“Local Level settings (`<project>/.qoder/settings.local.json`)” 与 “Configurations specified via command-line `--settings` (Highest precedence)”。',
          behavior:
            '向系统提示词追加指令，调整回复语气、冗长度与结构；官方逐字 “Output Style only affects the "way of expression" and does not alter Qoder\'s core identity or security constraints—it merely appends additional instructions on top of the System Prompt, and cannot replace or bypass built-in behavioral guidelines.”。未设置或设为 default 时使用内置默认表达、不追加风格，官方逐字 “If this item is not set, or if it is set to the default style, Qoder uses its built-in default expression without appending any additional style.”；官方示例取值为 `concise`，文档只写 “Built-in style: Preset styles provided with Qoder CLI.” 而始终没有给出完整内置风格清单。',
          scope:
            '`/output-style` 选的是“当前项目”的风格，且官方要求 `/clear` 或 `/new` 才应用；`outputStyle` 配置项按设置文件作用域持久但需重启 CLI；`--output-style` 仅当前会话生效且优先于配置项。',
          components:
            '自定义风格 frontmatter 可选：`name`（默认取去掉 `.md` 的文件名）、`description`（默认取正文第一个非标题行）；插件 manifest 的风格字段名为 camelCase `outputStyles`，而约定目录名仍是 `output-styles/`。',
          loading:
            '修改配置中的 `outputStyle` 需重启 CLI 生效；`--output-style` 官方写 “This parameter only applies to the current session, takes precedence over configuration items, and does not require a restart.”。同名风格按 Built-in → Plugin → User-Level → Project-Level 顺序后者覆盖前者；插件风格以 `plugin-name:style-name` 引用；插件强制风格优先于 `outputStyle` 设置，多个强制风格时第一个生效并记录警告。',
          surfaces:
            '以 Qoder CLI 为准；`/output-style` 的更新日志条目明确写 “in the interactive interface”，Agent SDK、ACP 与 Qoder IDE 的风格入口官方未单独说明。',
          permissions:
            '官方明确输出风格不改变核心身份与安全约束、不能替换或绕过内置行为准则；项目级与本地级设置只在当前工作目录受信任时应用，官方逐字 “If the working directory is not trusted, Qoder CLI only loads User Level configurations and ignores `settings.json` and `settings.local.json` within the project. Folder Trust is controlled by `security.folderTrust.enabled` (enabled by default).”',
          conditions:
            '官方 Output Style 文档页（822,658 字节）在核对日期完全没有提到 `/output-style` 命令，该命令只出现在 Slash 命令参考（833,050 字节）与 CLI 1.1.47 更新日志；文档页也未标注输出风格的引入版本。更新日志的两种官方渲染仍不一致：`https://docs.qoder.com/release-notes/qoder-cli` 现以 307 跳转到 `https://changelog.qoder.com/cli`（HTML 782,354 字节，最新条目 CLI 1.1.84／November 6, 2026），`.md` 渲染（116,633 字节）仍停在 CLI 1.1.82／November 3, 2026；1.1.82 至 1.1.84 都没有输出风格条目。',
          sources: [
            'qoder-output-styles',
            'qoder-settings-output-style-row',
            'qoder-output-style-slash-row',
            'qoder-output-style-command-1147',
            'qoder-plugins-detail',
          ],
        },
      },
      related: [
        'extension-plugins',
        'extension-custom-commands',
        'extension-project-instructions',
      ],
    }),

    'extension-project-instructions': createDetail({
      id: 'extension-project-instructions',
      definition:
        '从用户和仓库目录加载长期工作约定到模型上下文，并比较文件名、目录层级、覆盖顺序和强制边界。',
      includes: [
        '用户级与项目级长期指令',
        '子目录规则、局部覆盖和文件导入',
        '启动或访问目录时的加载时机',
      ],
      excludes: [
        '审批、沙箱或 Hook 的强制策略',
        '一次性用户提示词',
        '跨会话自动学习生成的记忆',
      ],
      facts: [
        'Claude Code 使用 `CLAUDE.md`，Codex、Kimi Code 和 Qoder CLI 原生使用 `AGENTS.md`；Qwen Code 同时读取 `QWEN.md` 与 `AGENTS.md`。',
        '这些文件进入模型上下文，本质是指令而不是安全边界；需要强制执行的限制应由权限、沙箱、Hook 或组织策略承担。',
        'Claude Code 不直接读取 `AGENTS.md`；需要从 `CLAUDE.md` 使用 `@AGENTS.md` 导入或建立链接。',
      ],
      products: {
        claude: {
          entry:
            '启动时读取 `CLAUDE.md`；可在正文中用 `@path` 导入其他文件。',
          location:
            '用户 `~/.claude/CLAUDE.md`；项目 `./CLAUDE.md` 或 `./.claude/CLAUDE.md`；本地 `./CLAUDE.local.md`；规则 `.claude/rules/**/*.md`。',
          behavior:
            '项目层级指令加入上下文；嵌套目录的文件在访问相应目录时按需加载。',
          scope:
            '用户、项目、Local 与子目录规则；Local 文件适合不提交的个人覆盖。',
          components:
            'Markdown 指令、`@` 导入，以及可按路径限定的规则文件。',
          loading:
            '启动时加载上层指令，进入或读取子目录时再加入更局部规则。',
          permissions:
            '内容用于指导模型，不会替代权限规则、Sandbox 或 Managed settings。',
          conditions:
            'Claude Code 不原生读取 `AGENTS.md`；跨产品共用时需通过 `CLAUDE.md` 导入或符号链接。',
          sources: ['claude-memory'],
        },
        codex: {
          entry:
            '会话启动前构建指令链；每层优先 `AGENTS.override.md`，否则读取 `AGENTS.md` 或配置的备用文件名。',
          location:
            '全局 `~/.codex/AGENTS.override.md` 或 `~/.codex/AGENTS.md`；项目从仓库根到当前目录逐层查找。',
          behavior:
            '按目录从根到当前工作目录拼接，更靠近当前目录的文件出现在后面并覆盖冲突指令。',
          scope:
            '全局与项目目录层级；每个目录只选一个候选文件。',
          components:
            'Markdown 指令，以及 `project_doc_fallback_filenames` 与大小上限配置。',
          loading:
            '每次启动根据当前工作目录重新建立链；默认项目指令总量上限为 32 KiB。',
          permissions:
            'AGENTS 指令不扩大沙箱或工具审批权限，组织配置仍可强制更高优先级规则。',
          conditions:
            'Override 文件会替代同目录普通 AGENTS 文件，不是与它同时拼接。',
          sources: ['codex-agents-md'],
        },
        qwen: {
          entry:
            '启动时发现 `QWEN.md`，也兼容读取 `AGENTS.md`；正文可用 `@path` 导入。',
          location:
            '用户 `~/.qwen/QWEN.md`；项目根 `QWEN.md`；本地 `.qwen/QWEN.local.md`；仓库可使用 `AGENTS.md`。',
          behavior:
            '把用户和项目约定注入上下文，并处理显式导入与局部文件。',
          scope:
            '用户、项目、本地与兼容 AGENTS 文件；具体优先级按内存加载配置执行。',
          components:
            'Markdown 指令、`@` 导入和兼容文件名。',
          loading:
            '启动与上下文刷新流程加载；Local 文件用于不提交的机器或个人覆盖。',
          permissions:
            '指令文件不绕过 approval mode、Sandbox 或工具白名单。',
          conditions:
            '“兼容 AGENTS.md”不表示 QWEN.md 与 AGENTS.md 永远重复加载；应按当前发现与优先级规则核对。',
          status: '源码确认',
          sources: ['qwen-memory-current'],
        },
        kimi: {
          entry:
            'Agent Prompt 中通过 `${agents_md}` 注入发现到的 AGENTS 指令。',
          location:
            '全局 `$KIMI_CODE_HOME/AGENTS.md` 与 `~/.agents/AGENTS.md`；项目 `.kimi-code/AGENTS.md` 或根目录 `AGENTS.md`。',
          behavior:
            '把用户与项目约定作为上下文提供给主 Agent。',
          scope:
            '全局与项目；项目内 `.kimi-code/AGENTS.md` 提供产品专用位置。',
          components:
            'Markdown 指令文件。',
          loading:
            '构建 Agent 上下文时读取并注入。',
          permissions:
            'AGENTS.md 是上下文，不是权限执行器；工具授权仍由交互与配置处理。',
          conditions:
            '当前官方文档没有把它描述成自动记忆；不要与会话或长期自动学习混为一谈。',
          sources: ['kimi-agents-current'],
        },
        qoder: {
          entry:
            '启动时读取 AGENTS 文件；规则文件可按 always、model-decides、glob 或手动模式激活。',
          location:
            '全局 `~/.qoder/AGENTS.md`；项目 `AGENTS.md`、`AGENTS.local.md`；规则 `.qoder/rules/**/*.md`。',
          behavior:
            '将项目约定和匹配规则加入上下文，并支持 `@` 导入其他文件。',
          scope:
            '用户、项目、本地与按路径或模式激活的规则。',
          components:
            'AGENTS Markdown、Local 覆盖、规则文件和导入。',
          loading:
            '启动时读取常驻内容，按规则激活方式和当前文件上下文加载其他内容。',
          permissions:
            'Memory/规则只指导 Agent，不能取代 permission mode 与 Hook。',
          conditions:
            '可通过 `context.fileName` 配置文件名；比较默认行为时仍以 AGENTS.md 为基准。',
          sources: ['qoder-memory'],
        },
      },
      related: [
        'extension-skills',
        'security-trust',
        'session-memory',
      ],
    }),

    'extension-ide': createDetail({
      id: 'extension-ide',
      definition:
        '让 Code Agent 在编辑器或 ACP 客户端中运行，或让外部 CLI 获取当前文件、选择区、诊断与原生 Diff 等 IDE 上下文。',
      includes: [
        'IDE 扩展、Companion 或 ACP 启动入口',
        '当前文件、选择区、诊断、Diff 与文件操作上下文',
        '明确支持的编辑器或 ACP 客户端',
      ],
      excludes: [
        '只用于编辑当前 Prompt 文本的外部编辑器',
        '没有上下文桥接的普通集成终端',
        '云端任务或桌面端会话',
      ],
      facts: [
        '五家都能进入 IDE 工作流，但形态不同：Codex 是原生 IDE 扩展，Claude Code 与 Qwen Code 提供 CLI 到 VS Code 的桥接，Kimi Code 与 Qoder CLI 公开 ACP Server。',
        'Kimi Code 的 `/editor` 只配置输入内容的外部编辑器，不是 IDE 上下文连接；本矩阵因此改为 `kimi acp`。',
        'Codex CLI 的 IDE 上下文命令是 `/ide-context`，不是 `/ide`；Claude Code 与 Qwen Code 才使用 `/ide` 管理连接。',
      ],
      products: {
        claude: {
          entry:
            '在外部终端运行 `/ide` 连接支持的编辑器；VS Code 扩展也可直接打开 Claude Code 面板。',
          location:
            'VS Code、Cursor 及兼容分支安装官方扩展；扩展为 CLI 暴露本地隐藏 `ide` MCP Server。',
          behavior:
            '每次提示附带活动文件与选择区，并提供原生 Diff、诊断和 Notebook 执行等 IDE 能力。',
          scope:
            '当前已连接的编辑器窗口与活动项目。',
          components:
            'VS Code 扩展、隐藏 IDE MCP、编辑器上下文与原生 Diff。',
          loading:
            '`/ide` 发现并选择可用编辑器；连接状态随编辑器和 CLI 会话维护。',
          surfaces:
            'VS Code、Cursor 和兼容分支；扩展面板与外部终端连接提供的命令集合并不完全相同。',
          permissions:
            'IDE 提供上下文与界面，文件和终端操作仍受 Claude Code 权限规则。',
          conditions:
            '活动选择区和活动文件会自动加入提示；其他打开文件不等于全部自动进入上下文。',
          sources: ['claude-ide', 'claude-commands'],
        },
        codex: {
          entry:
            '在 VS Code 系编辑器安装 Codex IDE 扩展；CLI 中使用 `/ide-context` 控制或查看编辑器上下文。',
          location:
            'Codex IDE 扩展运行于支持的 VS Code 系编辑器，并共享 Codex 配置。',
          behavior:
            '读取选中代码和文件上下文，展示本地改动与 Diff，可在本地或 Cloud 任务之间工作。',
          scope:
            '当前 IDE 工作区和扩展会话；与 CLI、桌面端共享部分配置而不是全部交互状态。',
          components:
            'IDE 面板、命令面板操作、选择区上下文、Diff 与本地/Cloud 任务入口。',
          loading:
            '扩展启动后建立会话并读取共享配置；`/ide-context` 是 CLI 的相关 Slash 入口。',
          surfaces:
            'Codex IDE 扩展；插件系统当前不在该 Surface 中提供。',
          permissions:
            '编辑器中的工具操作继续受 Codex 审批与沙箱配置。',
          conditions:
            '旧矩阵写成 `/ide` 不准确；当前 Codex Slash 命令名是 `/ide-context`。',
          sources: ['codex-ide', 'codex-commands'],
        },
        qwen: {
          entry:
            '`/ide install|enable|disable|status` 管理 VS Code Companion 连接。',
          location:
            'VS Code 与兼容分支安装 Qwen Code Companion。',
          behavior:
            '向 CLI 提供最近文件、光标位置、最多 16 KiB 的选择区和原生 Diff 展示。',
          scope:
            '当前编辑器工作区；最近文件上下文最多取 10 个。',
          components:
            'CLI `/ide` 管理命令、Companion 扩展、上下文桥接与 Diff。',
          loading:
            '安装并启用 Companion 后由 CLI 发现连接；`/ide status` 查看状态。',
          surfaces:
            '交互式 CLI 与 VS Code/兼容分支；ACP 是另一条客户端协议，不等同于 Companion。',
          permissions:
            'IDE 只提供上下文和 Diff；文件、Shell 与网络仍经过 Qwen approval mode 和 Sandbox。',
          conditions:
            '启用 Sandbox 时需要保留 Companion 通信所需网络；选择区超过 16 KiB 会受截断限制。',
          status: '源码确认',
          sources: ['qwen-ide-current'],
        },
        kimi: {
          entry:
            '使用 `kimi acp` 以 stdio 启动 Agent Client Protocol Server，由支持 ACP 的编辑器连接。',
          location:
            '官方指南列出 Zed 与 JetBrains 等 ACP 客户端配置。',
          behavior:
            '通过 JSON-RPC/stdio 接收提示与上下文，并把工具、权限和消息事件返回给编辑器。',
          scope:
            '当前 ACP 客户端工作区；登录状态与普通 Kimi CLI 共享。',
          components:
            'ACP Server、客户端配置、MCP 转发与会话事件。',
          loading:
            '编辑器按配置启动 `kimi acp`；ACP 会转发 stdio、HTTP 和 SSE MCP Server。',
          surfaces:
            'Zed、JetBrains 等支持 ACP 的 IDE；`/editor` 只编辑 Prompt，不属于 IDE 连接。',
          permissions:
            'ACP 客户端参与权限请求；实际工具仍遵循 Kimi 的权限与交互语义。',
          conditions:
            '必须由支持 ACP 的客户端启动或连接；不能把 `/editor` 当成等价命令。',
          sources: ['kimi-ide-current', 'kimi-acp-current'],
        },
        qoder: {
          entry:
            '使用 `qodercli --acp` 启动 ACP Server，并在 Zed 等支持 ACP 的客户端中配置。',
          location:
            '配置在 ACP 客户端；Qoder CLI 作为子进程通过 stdio 通信。',
          behavior:
            '支持工具、Subagent、MCP、权限、上下文压缩和图像，并可使用 IDE 提供的文件系统与终端能力。',
          scope:
            '当前 ACP 客户端工作区与会话；登录沿用 Qoder CLI 环境。',
          components:
            'ACP Server、IDE 文件系统/终端桥接、权限请求、MCP 与 Subagent 事件。',
          loading:
            '由编辑器启动 `qodercli --acp`；连接生命周期由 ACP 客户端管理。',
          surfaces:
            'Zed 等 ACP 客户端；Qoder IDE 本身是另一产品 Surface，不用它替代 CLI ACP 结论。',
          permissions:
            '权限请求通过 ACP 交互呈现；IDE 提供能力不表示默认免审批。',
          conditions:
            '旧矩阵中的“CLI 命令未确认”已由官方 ACP 文档补足；入口是 CLI 参数，不是 Slash 命令。',
          sources: ['qoder-acp'],
        },
      },
      related: ['extension-mcp', 'surface-ide', 'surface-sdk'],
    }),

    'extension-tool-discovery': createDetail({
      id: 'extension-tool-discovery',
      definition:
        '把部分工具的完整声明从每轮请求的函数列表里撤下，只留下名称级线索，模型需要时用一个发现工具取回完整 schema 再调用，用来压低常驻上下文占用。',
      includes: [
        '哪些工具默认延迟、哪些始终常驻、哪些可以逐个豁免',
        '发现工具的名字、查询形式、参数、返回内容与排序或打分方式',
        '打开或关闭延迟声明的配置键、环境变量、默认值与是否需要重启',
        '延迟声明对提示词缓存前缀、Subagent、恢复会话与中途连上的 Server 的影响',
      ],
      excludes: [
        '工具本身的执行行为、审批规则与沙箱边界',
        'MCP Server 的传输、认证、连接状态与工作区信任',
        'Skills 的渐进披露与按需加载正文',
        '上下文占用统计命令、压缩阈值与记忆调度',
      ],
      facts: [
        '五家都把「声明」和「可用」拆开：被延迟的工具仍然注册、仍然可以调用，只是不在首轮请求的函数列表里；发现工具取回的是 schema 而不是执行权限，调用仍走各自的审批与沙箱。',
        '延迟范围分两档：Codex、Kimi Code 与 Qoder CLI 的官方资料只覆盖 MCP 工具，Claude Code 官方文档也只写 MCP 工具；只有 Qwen Code 把延迟扩到内置工具，v0.25.1 起 `agent`、`list_agents`、`get_goal`、`update_goal` 与 `propose_goal` 也默认延迟，`task_stop`、`monitor`、`computer_use__*` 与 cron/loop 工具同样按需加载。',
        '默认状态分三档：Codex 始终开启且 `tool_search` 与 `tool_search_always_defer_mcp_tools` 两个特性开关都已移除、没有用户关闭入口；Claude Code 与 Qwen Code 默认开启但可以关（`ENABLE_TOOL_SEARCH=false`、`tools.toolSearch.enabled: false`）；Kimi Code 与 Qoder CLI 默认关闭，Kimi 还要实验标志加模型能力两个前提。Kimi 在 2026-10-14 的 main 上多了 `[mcp] default_deferred` 这个全局默认，可以一次把所有 Server 翻成按需加载，但取值仍是 `false`，默认档位没有变。',
        '发现工具的形态分四类：Codex `tool_search` 用 BM25 排序、参数是 `query` 与 `limit`（默认 8）；Qwen Code `tool_search` 支持 `select:Name1,Name2` 精确取名、关键词打分（默认最多 5 条、硬上限 20）与 `+must-word` 必含词；Kimi Code `select_tools` 只接受精确工具名数组、不做关键词检索；Qoder CLI 拆成 `mcp_list`、`mcp_get`、`mcp_call` 三个 Meta Tools。Claude Code 的 `ToolSearch` 在官方工具参考里只有一句描述，没有公开查询参数与排序方式。',
        '对失败查询的处理粒度不同：Kimi Code 的 `select_tools` 把名字分成六类分别回话，还按名字累计失败次数（阈值 `STOP_RETRY_THRESHOLD = 2`）与整轮连续失败次数（达到 3 触发警告）主动劝模型停止猜名字；其他四家的官方资料没有记录同类计数或劝退文案，Codex 与 Qwen Code 只给出空结果或查询格式错误，Qoder CLI 的三个 Meta Tools 连参数与返回内容都未公开。',
        '调用路径分两类：Claude Code、Codex 与 Kimi Code 在加载后由模型直接按本名调用工具；Qwen Code 要求经 `tool_call` 桥调用仍未声明的工具，官方给出的理由是让声明列表逐字节稳定、保住提示词缓存前缀。Qoder CLI 的 `mcp_call` 从名字看像是第三条路径，但官方没有写明它与直接调用的关系。',
        '豁免入口各不相同：Claude Code 有 Server 级 `alwaysLoad` 与工具级 `_meta["anthropic/alwaysLoad"]` 两层，Qwen Code 有 `tools.visible` 与 `tools.toolSearch.threshold` 预载预算，Kimi Code 是双向的——`[mcp] default_deferred = true` 全局开启后单个 Server 仍可写 `deferred: false` 排除，Server 字段始终优先于全局默认；Codex 没有任何豁免键（MCP 工具始终延迟），Qoder CLI 的 `mcp.lazyLoad` 与 `QODER_MCP_LAZY` 都是全局开关，官方资料没有给出单个 Server 或单个工具的豁免方式。',
      ],
      products: {
        claude: {
          entry:
            '没有 Slash 命令入口。模型侧入口是内置 `ToolSearch` 工具，官方工具参考的描述逐字为 “Searches for and loads deferred tools when tool search is enabled”、Permission required 列为 “No”；用户侧靠 `ENABLE_TOOL_SEARCH` 环境变量或 settings.json 的 `env` 字段调节，也可以用 `permissions.deny: ["ToolSearch"]` 单独禁用这个工具。',
          location:
            '开关写在进程环境变量或 settings.json 的 `env` 字段；Server 级豁免写在 MCP 配置里该 Server 的条目（例如 `.mcp.json` 的 `alwaysLoad`），官方说明该字段对所有 Server 类型都可用；工具级豁免由 Server 作者在 `tools/list` 条目的 `_meta` 里声明 `"anthropic/alwaysLoad"`。',
          behavior:
            '官方逐字为 “Tool search keeps MCP context usage low by deferring tool definitions until Claude needs them. Only tool names and server instructions load at session start, so adding more MCP servers has minimal impact on your context window.”，并明确 Claude Code 不设固定的每 Server 工具上限、实际限制是上下文窗口预算。Server 在 Claude 工作过程中连上时，Claude Code 在同一次请求里把该 Server 的工具名报给模型，模型不必等下一条用户消息就能搜索并调用；Server 连接失败时，开启工具搜索会把失败的 Server 名与连接错误告诉模型，同样的信息也会出现在没有命中任何工具的 `ToolSearch` 结果里，而在任何未启用工具搜索的配置下 Claude Code 不向模型报告连接失败。工具搜索关闭时改由 `WaitForMcpServers` 工具等待仍在连接的 Server，该工具只在工具搜索关闭时出现。',
          scope:
            '作用于当前会话发往模型的请求，只覆盖 MCP 工具；官方文档没有把 Claude Code 自己的内置工具、Skill 或 Subagent 定义列入这条延迟路径。',
          components:
            '内置 `ToolSearch` 工具、`ENABLE_TOOL_SEARCH` 环境变量、Server 级 `alwaysLoad`、工具级 `_meta["anthropic/alwaysLoad"]`、描述长度上限 `CLAUDE_CODE_MAX_MCP_DESCRIPTION_LENGTH`、`permissions.deny` 对 `ToolSearch` 的禁用；插件 mods 的 `$.tool.register` 另有 `isDeferred` 参数（v2.1.293 加入，官方更新日志逐字为 “`false` lists the tool schema in the prompt from the start instead of behind tool search”）。',
          loading:
            '按 `ENABLE_TOOL_SEARCH` 的取值在启动时决定延迟还是预载：未设时全部 MCP 工具延迟并按需加载，`true` 始终延迟并发送 beta 头，`auto` 在定义总量不足上下文窗口 10% 时预载、达到 10% 后全部延迟，`auto:N` 用自定义百分比（N 取 0-100，例如 `auto:5`），`false` 全部预载。`alwaysLoad: true` 的 Server 会让启动等待它的工具，上限是标准 5 秒连接超时；带有效 `cached` 条目的远程 Server 从发现缓存供工具因而不阻塞启动，其他 Server 默认在后台连接，`MCP_CONNECTION_NONBLOCKING=0` 可让启动一并等待。v2.1.287 起 `"alwaysLoad": false` 把该 Server 的全部工具（包括作者标记为上送的工具）留在工具搜索之后。',
          surfaces:
            '以 Claude Code CLI 为准。`claude -p` 与 Agent SDK 运行中若某个已配置 Server 需要认证，Claude Code 会告诉模型该 Server 的工具在授权前不可用，模型据此点名需要登录的 Server；交互式会话则用 `/mcp` 或 `claude mcp login <name>` 完成授权。',
          permissions:
            '延迟只改变声明时机，不改变审批：取回 schema 后的工具调用仍按权限规则与审批模式执行。`ToolSearch` 自身不需要权限，但可以被 `permissions.deny` 规则整体禁用。',
          conditions:
            '需要模型支持 `tool_reference` 块，官方点名 Claude Sonnet 4.5、Claude Haiku 4.5、Claude Opus 4.5 及更新模型；`ANTHROPIC_BASE_URL` 指向非第一方主机时默认关闭（多数代理不转发 `tool_reference`），需要显式设 `ENABLE_TOOL_SEARCH` 覆盖；Microsoft Foundry 托管在 Azure 的部署由服务端拒绝，Claude Code 检测到拒绝后改为预载，`ENABLE_TOOL_SEARCH` 也压不过；Google Cloud 的 Agent Platform 上早于 Claude 4.5 代的模型始终预载、`ENABLE_TOOL_SEARCH=true` 无效（v2.1.221 之前该平台所有模型都默认关闭）；设了 `CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS` 时工具搜索保持关闭且用户自设的 `ENABLE_TOOL_SEARCH` 被忽略，该变量还会剥掉 `defer_loading` 一类 beta 工具 schema 字段，组织可在 v2.1.227 及以上用 managed settings 保持开启。描述截断的默认上限以官方环境变量页为准，`CLAUDE_CODE_MAX_MCP_DESCRIPTION_LENGTH` 一行逐字为 “Maximum length in characters of each MCP tool description and each MCP server\'s instructions that Claude Code sends to the model. The value you set replaces both default limits: 4096, and 16384 for the description of a tool that Claude loads through tool search. Claude Code truncates longer text. Accepts a positive whole number in plain digits. Anything else is ignored and the defaults apply. Requires Claude Code v2.1.280 or later”，即上送描述与 Server instructions 默认 4,096 字符、经工具搜索加载的描述默认 16,384 字符，与更新日志 v2.1.295、v2.1.296 两条一致。v2.1.299 又给第一方 Server 开了口子，更新日志逐字为 “Changed MCP tool descriptions and server instructions from Anthropic\'s first-party MCP servers at `api.anthropic.com` to reach Claude in full instead of being cut at 4,096 characters”，官方没有说明这条豁免能否被 `CLAUDE_CODE_MAX_MCP_DESCRIPTION_LENGTH` 重新压回。',
          sources: [
            'claude-mcp',
            'claude-tools',
            'claude-env-vars',
            'claude-tool-search-changelog',
          ],
        },
        codex: {
          entry:
            '没有 Slash 命令入口，也没有用户可关的开关。模型侧入口是内置 `tool_search` 工具，工具描述以 “# Tool discovery” 开头，正文逐字为 “Searches over deferred tool metadata with BM25 and exposes matching tools for the next model call.”，并要求 MCP 工具发现一律用 `tool_search` 而不是 `list_mcp_resources` 或 `list_mcp_resource_templates`。',
          location:
            '特性开关的位置是 `config.toml` 的 `features` 表：`codex-rs/core/config.schema.json` 在顶层与 `ConfigProfile` 各列出 `features.tool_search`、`features.tool_search_always_defer_mcp_tools` 与 `features.code_mode_tool_search` 三个 boolean，但 schema 没有给默认值或描述。官方 Configuration reference 只在 “Local computer access with Work Cloud compatibility limits” 表里提到前两个键。',
          behavior:
            '参数只有两个：`query`（string，描述 “Search query for deferred tools.”，必填，trim 后为空报 “query must not be empty”）与 `limit`（number，描述 “Maximum number of tools to return. Defaults to 8.”，缺省取 `TOOL_SEARCH_DEFAULT_LIMIT = 8`，为 0 报 “limit must be greater than zero”），`additionalProperties` 为 false。结果按 BM25 排序取前 `limit` 条，以 `{"tools": [...]}` 形状返回可加载声明（`LoadableToolSpec`）；没有任何可搜索来源时直接返回空 `tools` 数组。工具描述里还会附一段可搜索来源清单，逐字为 “You have access to tools from the following sources:” 加每行 `- <name>: <description>`，来源描述合计预算是 `MAX_TOOL_SEARCH_SOURCE_DESCRIPTION_BYTES = 512 * 1024` 字节，超预算的来源描述被按字符边界截断，一个来源都没有时写 “None currently enabled.”。',
          scope:
            '作用于当前会话的工具声明，被延迟的是 MCP 工具：`Feature::ToolSearchAlwaysDeferMcpTools` 的源码注释逐字为 “Removed compatibility flag. MCP tools are always deferred when tool_search is available.”。另有 Connector 与 Plugin 两类可发现项（`DiscoverableTool`）以及 `list_available_plugins_to_install`、`request_plugin_install` 两个发现工具名常量，属于安装建议而不是延迟声明。',
          components:
            '内置 `tool_search` 工具与处理器、`LoadableToolSpec` 可加载声明、`ToolSearchSourceInfo` 来源清单、`DiscoverableTool` 可发现项、`features.tool_search` 与 `features.tool_search_always_defer_mcp_tools` 两个已移除的兼容开关、`features.code_mode_tool_search` 与 `features.deferred_tool_world_state` 两个开发中开关。',
          loading:
            '延迟在构建工具列表时生效，命中后在“下一次模型调用”暴露匹配工具；`codex-rs/state/migrations/0019_thread_dynamic_tools_defer_loading.sql` 表明动态工具的延迟加载状态随线程持久化，`codex-rs/core/tests/suite/snapshots/` 下另有 `deferred_tools_initial_unchanged_and_removed`、`deferred_tools_recover_during_sampling` 与 `deferred_tools_resume_without_duplicate_update` 三个快照覆盖初始声明、采样中途恢复与恢复会话不重复更新。',
          surfaces:
            '以 Codex CLI 为准。JavaScript code mode 里的排序工具发现由独立开关 `code_mode_tool_search` 控制，源码注释逐字为 “Expose ranked tool discovery inside JavaScript code mode.”，`Stage::UnderDevelopment` 且 `default_enabled: false`；处理器里 code mode 走 `search_code_mode` 分支，返回 `CodeModeSearchResult` 并受 `code_mode.tool_input_schema_max_bytes` 与 `Feature::CodeModeToolDescriptionFirst` 影响。',
          permissions:
            '延迟只改变声明时机；工具调用仍按 Codex 的审批策略与沙箱配置执行，官方资料没有把 `tool_search` 与审批规则关联。',
          conditions:
            '官方用户文档没有专门介绍工具搜索：Configuration reference 只在 managed requirements 的兼容性表里写 “Retired switches such as `tool_search` = false, `tool_search_always_defer_mcp_tools` = false, `js_repl` = true, and `remote_control` = true are rejected.”，该行对应的 Setting or family 是 “features / `feature_requirements`, models, `computer_use`”、兼容性列写 “Partial.”。源码侧 `Feature::ToolSearch` 是 `Stage::Removed`、注释为 “Removed compatibility flag retained as a no-op now that tool_search is always enabled.”，旧配置解析对 `tool_search` 与 `tool_search_always_defer_mcp_tools` 两个键直接 `continue` 跳过，因此没有用户可用的关闭入口。`deferred_tool_world_state`（在模型可见的 world state 里描述被延迟的工具命名空间）与 `incremental_tools`（在 world state 里跟踪顶层工具定义并发出增量上下文更新）都还是 `Stage::UnderDevelopment`、默认关闭。官方 Release 最新为 rust-v0.162.1（2026-10-09T19:44:51Z），上述源码坐标是 2026-10-12 的 main 分支。',
          status: '源码确认',
          sources: [
            'codex-tool-search-spec',
            'codex-tool-search-handler',
            'codex-tool-search-discovery',
            'codex-tool-search-features',
            'codex-tool-search-schema',
            'codex-config-reference',
          ],
        },
        qwen: {
          entry:
            '模型侧入口是内置 `tool_search`（显示名 `ToolSearch`）与 `tool_call`（显示名 `ToolCall`）两半桥。用户侧入口是 settings.json 的 `tools.toolSearch.enabled`、`tools.toolSearch.threshold`、`tools.eager`、`tools.visible`、`tools.disabled` 与 `tools.discoveryCommand`；`/tools` 仍然列出被延迟的工具，`/context` 用来复核实际占用。',
          location:
            '键写在 settings.json：用户 `~/.qwen/settings.json`、项目 `.qwen/settings.json` 与系统作用域合并，`tools.eager` 与 `tools.visible`、`tools.disabled` 的合并规则不同（后两者按作用域取并集，`tools.eager` 是后作用域整体替换前面的列表）。`tools.toolSearch.enabled` 与 `tools.toolSearch.threshold` 都标注 “Requires restart: Yes”，`tools.eager` 同样写明需要重启。',
          behavior:
            '工具描述逐字为 “Reviews function declarations for deferred tools without changing the active tool list.”，并说明被延迟的工具只在 deferred-tools 启动提醒里按名字出现，`tool_search` 接受一个查询、与被延迟工具列表匹配后把命中工具的 name + description + parameter schema 放在 `<functions>` 块里返回；该块是信息性的，看过 schema 后要用 `tool_call` 按精确名与 schema 形状的参数调用，不要直接调仍未声明的工具（它的声明保持隐藏，好让模型侧工具列表与提示词缓存前缀稳定），而 `select:` 命中的工具如果本来就已声明就直接调用、`tool_call` 只接受隐藏的延迟工具。查询有三种形式：“select:ToolA,ToolB” 按精确名取、“keyword phrase” 关键词搜索（最多 `max_results` 条）、“+must-word other” 要求名字里含该词再给其余词排序。空查询报 “Error: query is empty. Use `select:ToolName` or free-text keywords.”，分词后没有可用词报 “Error: no search terms extracted from query.”。',
          scope:
            '默认延迟的范围覆盖全部 MCP 工具（`mcp__*`）、Computer Use 家族（`computer_use__*`）、`task_stop`、`monitor` 与 cron/loop 工具（`cron_create` 构造参数里 `shouldDefer` 为 `true`、注释为 “scheduling is infrequent”，并带搜索提示词 `cron schedule reminder recurring timer`），以及 v0.25.1 起默认延迟的 `agent`、`list_agents`、`get_goal`、`update_goal` 与 `propose_goal`。豁免清单是 `tool_search` 与 `tool_call`（桥的两半）、`structured_output` 与 plan-mode 生命周期工具（`enter_plan_mode`、`exit_plan_mode`、`ask_user_question`），它们无论 `tools.eager` 怎么写都保持正常加载行为。',
          components:
            '内置 `tool_search` 与 `tool_call` 桥、`tools.eager` 允许清单、`tools.visible` 强制上送、`tools.disabled` 注册期移除、`tools.discoveryCommand` 发现的外部工具、`tools.toolSearch.threshold` 预载预算；Code Mode（`tools.codeModeOnly`）下改用另一段描述，发现走顶层 `tool_search`、调用走 `exec`，搜索结果不改变工具声明。',
          loading:
            '关键词模式按打分排序：名字精确命中内置工具 10 分、MCP 工具 12 分，名字子串内置 5 分、MCP 6 分，`searchHint` 命中 4 分，动作别名 6 分，描述命中 2 分；`DEFAULT_MAX_RESULTS = 5`、`HARD_MAX_RESULTS = 20`，分词会剔除 `the`/`please`/`what` 一类停用词，并把 `cancel`/`clear`/`delete`/`remove`/`stop` 互为别名。`tools.toolSearch.threshold` 默认 `0`，表示不做阈值预载、普通延迟工具留在桥后面（代价是首次使用前多一次 `tool_search` 往返）；抬到 `N` 后，当全部候选延迟 schema 能放进上下文窗口的 `N%` 时一次性全部上送、否则继续留在桥后，预载对候选池是「全有或全无」，且被 `tools.eager` 降级的工具永远不参与预载。预载在会话启动时跑，而 MCP Server 通常在其后才连上，所以新启动的会话无论阈值多少都不声明 MCP 工具，它们从下一次会话启动（CLI 里是 `/clear` 之后）才参与预载，`QWEN_CODE_LEGACY_MCP_BLOCKING=1` 下立即参与。',
          surfaces:
            '以 Qwen Code CLI 为准，但官方提醒设置的作用范围会外溢：“Settings apply to every client that reads them (CLI, Web Shell, serve)”，因此按部署定制工具面需要单独的设置作用域。ACP host 另有一处例外：PR #13033 说明 ACP host 会在具备审批能力的用户回合上临时暴露 `propose_goal`。',
          permissions:
            '桥不绕过权限。`tools.toolSearch.enabled: false` 同时移除两半桥；`tool_search` 或 `tool_call` 的 deny 规则、`--exclude-tools` 条目或 `tools.disabled` 条目移除其中一半时，`tools.eager` 仍然扣住 schema，但没有东西能把它们加载回来，被扣的工具不再提供给模型（会记一条警告），它们仍然注册、`/tools` 仍列出、按名字直接调用仍走正常审批，只有同时写在 `tools.visible` 里的工具例外；这种情况下普通延迟工具（全部 MCP 工具与延迟的 Computer Use 家族）反而被强制上送进每次请求。`permissions.allow` 与审批模式不省任何声明，前者是纯自动批准。`tools.disabled` 与整工具 `permissions.deny` 才是真正移除，MCP 工具对 deny 式移除豁免、要用每 Server 的 `includeTools`/`excludeTools` 或 `tools.disabled`。',
          conditions:
            '两半桥缺一即失效。Subagent 不声明显式工具列表时会拿到每个已注册工具的 schema（含延迟工具）且不走 ToolSearch，能影响它的只有 `tools.eager` 与 `permissions.deny`，预载阈值不能。恢复会话时，历史里出现过的被扣工具会自动取回 schema，被 deny 的工具不会。声明列表并非不可变：resume、MCP 发现、会话内首次进入 plan mode、Subagent 定义变化这几类工具集刷新，只要实时历史里有对仍未声明工具的直接调用就会重新声明它；Subagent 定义变化还会改写 agent 工具自身的描述；MCP Server 在会话中途以 `alwaysLoadTools: true` 注册时同样会重新声明——而重新声明会移动提示词缓存前缀。文档边界：官方 MCP 文档（`docs/users/features/mcp.md`）在 v0.25.1 下完全没有提到延迟声明或 `tool_search`，`alwaysLoadTools` 在整个设置参考里只出现在 `tools.toolSearch.enabled` 的描述中一次、没有独立的设置行；`tools.core` 已标注 Deprecated、将在下个版本移除。',
          status: '官方确认',
          sources: [
            'qwen-tool-search-settings',
            'qwen-tool-search-context-cost',
            'qwen-tool-search-source',
            'qwen-tool-names-v0251',
            'qwen-deferred-coordination-design',
            'qwen-deferred-coordination-pr',
            'qwen-v0251-release',
            'qwen-cron-defer-source',
          ],
        },
        kimi: {
          entry:
            '没有 Slash 命令入口。开延迟有两个层面：在 `mcp.json` 的 Server 条目里写 `deferred: true` 逐个标记，或在 `config.toml` 的 `[mcp]` 下写 `default_deferred = true` 让所有 Server 默认按需加载。两者都要先满足 `tool-select` 实验标志：环境变量 `KIMI_CODE_EXPERIMENTAL_TOOL_SELECT=1`，或 `config.toml` 的 `[experimental]` 下写 `tool-select = true`，总开关 `KIMI_CODE_EXPERIMENTAL_FLAG=1` 也会一并启用。模型侧入口是内置 `select_tools`。',
          location:
            'Server 字段在用户级 `$KIMI_CODE_HOME/mcp.json`（默认 `~/.kimi-code/mcp.json`）或项目级 `.kimi-code/mcp.json` 的该 Server 条目里，与 `enabled`、`startupTimeoutMs`、`toolTimeoutMs`、`enabledTools`、`disabledTools` 并列，`deferred` 适用列写「全部」（stdio、HTTP 与 SSE）。全局默认在 `config.toml` 的 `[mcp]` 节，官方字段表把 `default_deferred`（`boolean`，默认 `false`）与 `startup_timeout_ms`（默认 `30000`）、`tool_timeout_ms`（默认 `60000`）并列；`packages/agent-core-v2/docs/config-manifest.toml` 的 `[mcp]` 段同步加了 `# default_deferred: boolean` 一行。实验标志在环境变量或 `config.toml` 的 `[experimental]`，模型能力在 `config.toml` 的 `capabilities`。',
          behavior:
            '官方逐字为「默认情况下，server 的所有工具都会直接进入模型的顶层工具列表；接入的 server 较多、或单个 server 暴露的工具较多时，这些工具定义会持续占用上下文。把 server 标记为 deferred 后，它的工具不再进入顶层工具列表：模型先看到一份可加载工具清单，需要时通过内置的 `select_tools` 工具加载完整定义，加载后同一轮即可调用。」全局默认一段逐字为「如果不想逐个 server 标记，而是默认让所有 server 按需加载，可以在 `config.toml` 的 `[mcp]` 下设 `default_deferred = true`。单个 server 仍可用 `deferred: false` 排除；server 字段始终优先于全局默认。该值在 server 连接时固化，之后修改不会改动运行中会话的工具形态——重连该 server 或重启进程后才会应用。」`select_tools` 的入参只有 `names`（字符串数组、`min(1)`、schema 为 `strict()`，描述逐字为 “Exact tool names to load, taken from the latest announced tool list.”）；工具描述要求名字取自系统上下文里的 `<tools_added>`/`<tools_removed>` 公告并按顺序折叠得到当前清单，并多写一句 “If you have not seen a <tools_added> announcement in this session, no tools are currently loadable — do not call select_tools.”，插件名、Skill 名或分类名都不接受，已可用的工具要直接调用而不是传给 `select_tools`。执行结果按行拼装，传入的名字先去重再分六类：`policyDenied`（被工具策略拒绝或此刻不可用于选择）、`alreadyAvailable`（可加载且已加载）、`toLoad`（可加载但未加载）、`alreadyCallable`（不是动态可加载但本来就能直接调用）、`staleLoaded`（曾加载过但已不再注册）与 `unknown`。对应文案逐字为 `Loaded: <names>`、`Already available: <names>`、“\"<name>\" is already available — call it directly; select_tools is only for names in the <tools_added> announcements.”、“\"<name>\" was previously selected or loaded but is no longer registered. select_tools cannot restore it. Do not select it again unless a new <tools_added> announcement lists it.”、“\"<name>\" is disabled by the current tool policy. select_tools cannot enable it. Do not retry unless the policy changes; use an available tool instead.”；`unknown` 统一以 “Unknown tool: <name>. This name is not in the current loadable tool list. select_tools only loads exact announced names; it cannot search for capabilities or install tools.” 开头，再按有无建议与可加载数量接 “Did you mean: <candidates>? Use an exact listed name.”（建议候选最多 3 个）、“No additional tools can be loaded right now; use the tools you already have.”（可加载项为 0）、“Loadable tools: <names>.”（不超过 5 个）或 “Select only exact names from the current announcements.”（超过 5 个），最后统一追加 “Do not guess aliases; use an available tool or tell the user what capability is missing.”。重复失败另有两条劝退文案：单个名字累计失败达到 `STOP_RETRY_THRESHOLD = 2` 次时给 “\"<name>\" has already failed selection <attempts> times. Stop retrying this name until its availability changes.”，整轮三类命中全空使 `consecutiveFailures` 达到 3 时给 “<n> consecutive select_tools calls failed without making any tool available. Stop guessing names or retrying unavailable tools. Use only exact names from the current announcements, use tools already available, or tell the user what capability is missing.”。`isError` 的条件是 `toLoad.length === 0 && alreadyAvailable.length === 0 && alreadyCallable.length === 0`，因此只命中 `staleLoaded` 或 `policyDenied` 也算失败。可加载集为空时另有一条公告，逐字为 “No tools are currently available for dynamic loading in this session. Do not call select_tools or guess tool names; use the tools you already have. Only a later <tools_added> announcement can make new tools loadable.”',
          scope:
            '只作用于被判为 deferred 的那些 MCP Server 的工具。判定式在源码里是 `config.deferred ?? this.options.resolveDefaults?.().defaultDeferred ?? false`：Server 条目写了 `deferred` 就用它（写 `false` 即可把自己从全局默认里排除），没写才取 `[mcp] default_deferred`，两者都没有时是 `false`。需要 OAuth 的 Server 在授权完成前暴露的认证工具也遵循同一字段。内置工具、Skill 工具与 Plugin 自带的其他组件不走这条路径。',
          components:
            'Server 级 `deferred` 字段、`[mcp] default_deferred` 全局默认、`tool-select` 实验标志、模型 `dynamically_loaded_tools` 能力标签、内置 `select_tools` 工具、`<tools_added>`/`<tools_removed>` 公告与可加载集为空时的专门公告。同一条目上的 `enabledTools`/`disabledTools` 是另一层工具过滤，与延迟声明无关。',
          loading:
            '两个前提同时满足才生效：`tool-select` 实验标志开启，且当前模型声明 `dynamically_loaded_tools` 能力——官方模型自动声明，其他模型要在 `config.toml` 的 `capabilities` 里追加，该数组「只能追加不能移除」。前提满足后，deferred 取值在 Server 连接时固化：`entry.deferred` 在 `connect` 与 `connectAllNow` 建条目时赋值，并在每次 `connectOne` 开头重算一次，之后由 `deferredOf(name)` 读出（查不到条目时回落 `false`）；全局默认经 `McpTunables.defaultDeferred` 从配置服务的 `mcp` 节流到连接管理器的 `resolveDefaults`，`mergedConnectionView.deferredOf(name)` 再转发给拥有该 Server 的 base 或 overlay 管理器。因此改 `default_deferred` 不会重塑运行中会话的工具形态，要重连该 Server 或重启进程。加载成功后完整定义立即可用，可以在下一次工具调用里直接调用。',
          surfaces:
            '以 Kimi Code CLI 为准。官方文档没有区分 ACP、Web UI、桌面端或 SDK 下 `deferred`、`default_deferred` 与 `select_tools` 是否同样生效。',
          permissions:
            '`select_tools` 的审批规则名就是工具自身（源码里 `approvalRule: this.name`），执行描述为 “Loading <names>”。延迟只改变声明时机，MCP 工具调用仍按 `[[permission.rules]]` 与当前权限模式审批；官方同时提醒 Ask When Needed 模式下 MCP 工具调用会自动批准。策略判定有两处源码细节：deny glob 按注册工具的真实来源评估，只有未注册的名字才回落到 `mcp__` 前缀推断；`select_tools` 自身走 `isToolActiveForDisclosure` 而不是 `isToolActive`，因此 Profile 允许清单漏写它不会被误判成策略拒绝。',
          conditions:
            '官方明确标注为实验功能，前提缺失时 `deferred` 与 `default_deferred` 都被忽略、行为与不写相同；模型不支持时 `select_tools` 执行返回 “select_tools is not available for the current model.” 且 `isError` 为真。`default_deferred` 没有环境变量覆盖：`[mcp]` 节的 schema 只有 `startupTimeoutMs`、`toolTimeoutMs`、`defaultDeferred` 三个可选键，而同文件导出的环境变量绑定只有 `MCP_STARTUP_TIMEOUT_ENV` 与 `MCP_TOOL_TIMEOUT_ENV`（对应 `KIMI_MCP_STARTUP_TIMEOUT_MS` 与 `KIMI_MCP_TOOL_TIMEOUT_MS`）。失败计数不跨环境保留：`resetFailuresIfToolsChanged` 把策略指纹与排序后的注册表 `[name, source, disclosure]` 序列化成环境串，串变了就把 `consecutiveFailures` 与 `failedSelectionAttempts` 一起清空；同一批调用里成功的名字只重置连续计数并删掉自己的记录，同批失败的名字照常累计、不被兄弟成功项掩盖。文档之间仍有缺口：`docs/zh/configuration/config-files.md` 与英文版都把整个 `## experimental` 段落包在 HTML 注释里（站点不渲染），注释内也只写 `micro_compaction` 是「唯一用户可见的字段」、没有列 `tool-select`；`docs/en/reference/tools.md` 的工具清单同样没有 `select_tools`。Kimi Code 最新 Release 仍是 2026-09-24 的 2.1.1，`default_deferred`（PR #4210，提交 `f28c51c01f02`，2026-10-14T09:19:29Z）与新的 `select_tools` 失败语义（PR #4190，提交 `e4c99a3bad19`，2026-10-13T11:39:31Z）都只在 main 上，本次证据坐标是 2026-10-14 的 main HEAD `f28c51c01f025bba9f0d0f58f6309e7517a8cd02`。',
          sources: [
            'kimi-mcp-deferred',
            'kimi-env-tool-select',
            'kimi-config-capabilities',
            'kimi-select-tools-source',
            'kimi-select-tools-schema',
            'kimi-default-deferred-commit',
            'kimi-mcp-connection-manager',
            'kimi-mcp-config-section',
            'kimi-workspace-mcp-tunables',
            'kimi-select-tools-service',
            'kimi-select-tools-failure-commit',
            'kimi-dynamic-tools-announcement',
          ],
        },
        qoder: {
          entry:
            '没有 Slash 命令入口。开关是设置项 `mcp.lazyLoad` 或环境变量 `QODER_MCP_LAZY=1`；模型侧入口是三个 Meta Tools `mcp_list`、`mcp_get` 与 `mcp_call`，官方内置能力参考没有单独列出这三个工具。',
          location:
            '`mcp.lazyLoad` 出现在官方设置参考的 `mcp` 分组，与 `mcp.allowed`、`mcp.excluded`、`mcp.enableAllProjectMcpServers`、`mcp.enabledProjectMcpServers` 并列；同页环境变量表另有 `QODER_MCP_LAZY` 一行，描述逐字为 “Enables MCP Lazy Loading when set to `1`.”。设置文件分用户 `~/.qoder/settings.json`、项目 `<project>/.qoder/settings.json` 与本地 `<project>/.qoder/settings.local.json` 三层，命令行 `--settings` 优先级最高，`QODER_CONFIG_DIR` 可改默认配置目录。',
          behavior:
            '官方 MCP reference 的 “Lazy Loading Mode” 段逐字为 “When multiple MCP servers are connected, all tool schemas are registered at startup by default, which may consume a significant number of Prompt Tokens in the first turn. When lazy loading is enabled (`mcp.lazyLoad: true` or `QODER_MCP_LAZY=1`), the CLI exposes only three Meta Tools (`mcp_list` / `mcp_get` / `mcp_call`) and loads the actual tools on demand, saving token overhead.”；设置参考对 `mcp.lazyLoad` 的描述逐字为 “Lazy load MCP tools (exposes Meta Tool).”。官方没有给出三个 Meta Tools 各自的参数、返回内容与排序方式，也没有写明 `mcp_call` 之前是否必须先经 `mcp_get` 取回 schema。',
          scope:
            '只覆盖 MCP 工具：默认状态是多个 MCP Server 接入时在启动注册全部工具 schema，开启后改为按需加载。内置工具、Skill 工具与 Plugin 组件是否也能延迟未确认。',
          components:
            '一个布尔设置项 `mcp.lazyLoad`、一个环境变量 `QODER_MCP_LAZY`，以及 `mcp_list`、`mcp_get`、`mcp_call` 三个 Meta Tools；官方资料没有给出单个 Server 或单个工具的豁免键。',
          loading:
            '类型 boolean、默认 `false`、Restart 列标注 “Yes”，即改动需要重启 Qoder CLI 才生效。官方 Settings 页写明未标注 “requires restart” 的项通常立即生效、标注了的必须重启，同一页的 `mcpServers` 与 `mcp.allowed` 描述里也各自带着 “(requires restart)”。',
          surfaces:
            '以 Qoder CLI 为准。官方文档没有区分 ACP（`qodercli --acp`）、Agent SDK、Cloud Mode 或 Remote Control 下 `mcp.lazyLoad` 是否同样生效。',
          permissions:
            '官方 MCP reference 的 Permissions and Security 段写明 MCP 工具与内置工具一样由权限系统管理、调用前需要用户确认（`auto` 与 `bypass_permissions` 模式除外），同段还列出 `--allowed-mcp-server-names`、`--strict-mcp-config` 与 `mcp.allowed`／`mcp.excluded` 这几个缩小暴露范围的入口；官方没有说明三个 Meta Tools 自身是否需要审批。',
          conditions:
            '默认关闭，需要显式打开并重启。三个 Meta Tools 只在 MCP reference 的 “Lazy Loading Mode” 一段里出现，官方内置能力参考与 MCP Servers 页都没有列出它们，Settings 页也没有提到 `mcp.lazyLoad`，因此各自的参数、返回内容、排序方式与调用顺序记为未确认，也不按名称推断它们等价于其他四家的 `ToolSearch`／`tool_search`／`select_tools`。',
          status: '条件项',
          sources: [
            'qoder-mcp-reference-lazy-load',
            'qoder-settings-reference-lazy-load',
            'qoder-builtins-reference',
            'qoder-mcp',
            'qoder-settings',
          ],
        },
      },
      related: [
        'extension-mcp',
        'extension-skills',
        'agent-tools',
        'session-context-usage',
      ],
    }),
  });
})();

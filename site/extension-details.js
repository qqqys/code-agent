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
        '禁用粒度不对齐：Qwen Code 用 `skills.disabledLevels` 整体关闭某个发现层级（`project`/`user`/`extension`/`bundled`），Claude Code 用 `disableBundledSkills` 只关内置层并以 `skillOverrides` 逐个控制，Codex 按 `SKILL.md` 路径在 `[[skills.config]]` 逐个禁用，Kimi Code 只在 frontmatter 逐个关闭模型自动调用，Qoder CLI 无独立技能软禁用、只能停用承载插件或删除目录。',
        'Kimi Code 在 main 分支支持一条提示词引用多个 Skill 并同时激活：空白字符后输入 `/` 插入 Skill token，全部引用与提示词作为同一轮次运行、一次 `/undo` 整体撤销（尚未发布）；其余四家已固定的一手文档没有描述等价的单条提示词多 Skill 显式激活行为。',
      ],
      products: {
        claude: {
          entry:
            '显式使用 `/<skill-name>`；未关闭自动调用时，Claude 也可根据 Skill 描述自行选择。',
          location:
            '用户目录 `~/.claude/skills/<name>/SKILL.md`；项目目录 `.claude/skills/<name>/SKILL.md`；Plugin 可携带 Skills。',
          behavior:
            '先发现名称和描述，需要时再读取完整 SKILL.md，并可继续打开同目录脚本、参考资料和模板。',
          scope:
            '项目 Skill 随仓库共享，用户 Skill 在本机多项目复用；Plugin Skill 随插件启用。',
          components:
            '`SKILL.md` 前置元数据、正文指令，以及可选脚本、资源和嵌套目录。',
          loading:
            '运行中检测 Skill 变化；Skills 与旧式 `.claude/commands` 在 Slash 命令界面合并呈现。',
          permissions:
            'Skill 只是指令与资源包；其中要求调用的工具仍经过 Claude Code 权限规则。',
          conditions:
            '同名 Skill 与旧式 Command 需要避免冲突。禁用分多层：`skillOverrides` 按名称设 `on`/`name-only`/`user-invocable-only`/`off`（`/skills` 写入 `.claude/settings.local.json`，不影响 Plugin Skill）；`disableBundledSkills` 关闭除 `/doctor` 外的全部内置 Skill；`/permissions` 可用 `Skill`、`Skill(name)`、`Skill(name *)` 拒绝；SKILL.md 可用 `disable-model-invocation`、`user-invocable`、`paths` 收窄。',
          sources: ['claude-skills', 'claude-settings'],
        },
        codex: {
          entry:
            '使用 `$skill-name` 显式引用，或通过 `/skills` 浏览；Codex 也可按描述自动匹配。',
          location:
            '项目从当前目录向仓库根查找 `.agents/skills`；用户目录 `~/.agents/skills`；管理员目录 `/etc/codex/skills`；另有系统内置 Skills。',
          behavior:
            '启动时发现 Skill 元数据，触发后按需读取 SKILL.md 和相关资源。',
          scope:
            '仓库路径、用户、管理员和系统四层来源；项目层可随代码共享。',
          components:
            '`SKILL.md`、可选脚本、模板、示例与参考资料。',
          loading:
            'Skill 列表随客户端发现结果提供；修改后的重新发现时机取决于当前客户端会话。',
          permissions:
            'Skill 不扩大工具授权；脚本和命令仍受审批、沙箱及组织配置约束。',
          conditions:
            'Codex 当前项目目录是 `.agents/skills`，不是旧对照表中的 `.codex/skills`。逐个禁用可在 `~/.codex/config.toml` 的 `[[skills.config]]` 中按 `path` 指向 `SKILL.md` 并设 `enabled = false`（需重启）；SKILL.md 元数据 `allow_implicit_invocation: false` 禁止隐式调用但保留 `$skill` 显式调用。',
          sources: ['codex-skills', 'codex-config-reference'],
        },
        qwen: {
          entry:
            '使用 `/<skill-name>` 或 `/skills` 显式选择；模型也可根据 Skill 描述自动调用。',
          location:
            '用户目录 `~/.qwen/skills`，项目目录 `.qwen/skills`，Extension 可携带 Skills。',
          behavior:
            '按需读取 SKILL.md，并可访问 Skill 目录中的脚本、文档和其他资源。',
          scope:
            '项目、用户和 Extension 来源合并。`skills.disabledLevels` 可整体跳过 `project`、`user`、`extension`、`bundled` 任一发现层级（默认 `undefined`，跨作用域取并集，`requiresRestart`）；`skills.directories` 按 `user` 层发现，因此 `["user"]` 会一并隐藏。逐个控制另有 `skills.disabled`、`skills.enabled` 与 `skills.defaultDisabled`，但 `skills.enabled` 不能恢复已被 `disabledLevels` 排除的层级。',
          components:
            '`SKILL.md`、辅助文件和可执行脚本；内置 Skill 与外部 Skill 使用同一调用模型。',
          loading:
            '启动与刷新流程扫描可用目录；变更后的可见性受当前会话重新发现机制影响。',
          permissions:
            'Skill 触发的工具继续经过 approval mode、沙箱和工具策略。',
          conditions:
            'Slash 名称可能与内置命令、自定义 Command 或 MCP Prompt 冲突；加载器按来源和命令注册规则处理。`skills.disabledLevels` 在 safe mode、bare mode 下被忽略；daemon 在工作区未信任时也不读取。',
          status: '源码确认',
          sources: ['qwen-skills-current', 'qwen-extensions-current', 'qwen-skills-disabled-levels'],
        },
        kimi: {
          entry:
            '明确调用为 `/skill:<name>`；没有命令冲突时也可使用 `/<name>`，模型还能自动选择。条件：在空白字符后（含后续行行首）输入 `/` 打开仅含 Skill 的补全菜单，可在一条提示词中插入多个 Skill 引用（main 分支，尚未发布）。',
          location:
            '项目 `.kimi-code/skills`、`.agents/skills`；用户 `$KIMI_CODE_HOME/skills`、`~/.agents/skills`；另有额外目录和内置 Skills。',
          behavior:
            'Skill 被选中后读取 SKILL.md 和支持文件，可接收参数；支持有限层级的嵌套引用。条件：单条提示词的多个 Skill 引用经 `promptWithSkills` 打包进同一条用户消息一起激活，渲染的 Skill 块排在用户内容之前并与提示词作为同一轮次运行，一次 `/undo` 整体撤销，提示词原文保持不变；会话标题与 fork 的提示词摘录只取用户原文、不含 Skill 块。',
          scope:
            '优先级是 Project、User、Extra、Built-in；同名时高优先级来源覆盖低优先级来源。',
          components:
            '`SKILL.md`、脚本、参考文件和其他同目录资源。',
          loading:
            '启动时按配置目录发现；Plugin 也可携带 Skills，变化通常通过 `/reload` 或新会话生效。',
          permissions:
            'Skill 内容不绕过 Kimi 的工具权限和交互模式。',
          conditions:
            '无前缀 `/<name>` 只有在不与已有命令冲突时才作为回退；稳定写法是 `/skill:<name>`。逐个禁用只走 frontmatter：`disableModelInvocation: true`（别名 `disable-model-invocation`）禁止模型自动调用但仍可 `/skill:<name>` 手动调用，`type: flow` 仅手动调用；当前无按名称或按层级的禁用配置键。提示词中的 Skill 引用只按名称激活、不携带参数，参数仍是单独以 `/skill:<name> args` 调用时的概念；空白字符后的 `/` 只补全 Skill，内置命令和 plugin 命令仍须放在输入开头。单条提示词多 Skill 激活于 2026-08-16 合入 main（引擎提交 `61591bce09f4`、TUI 提交 `44a6c70e6676`），最新 Release 0.36.1 未包含；引擎侧 `promptWithSkills` 只在 v2 引擎实现，空提示词、空 Skill 列表或未知 Skill 在提交前整体拒绝，node-sdk `session.promptWithSkills` 在 v1 引擎报错。',
          sources: [
            'kimi-skills-current',
            'kimi-plugins-current',
            'kimi-multi-skill-docs',
            'kimi-multi-skill-engine-commit',
            'kimi-multi-skill-tui-commit',
            'kimi-multi-skill-changeset',
          ],
        },
        qoder: {
          entry:
            '使用 `/<skill-name>` 显式调用或由模型自动匹配；`/skills` 查看，`/skills reload` 重载。',
          location:
            '用户目录 `~/.qoder/skills`，项目目录 `.qoder/skills`。',
          behavior:
            '按需加载 SKILL.md，并让同目录资源参与任务。',
          scope:
            '项目 Skill 覆盖同名用户 Skill；Plugin 也可分发 Skills。',
          components:
            '`SKILL.md` 与可选脚本、参考材料和资源。',
          loading:
            '`/skills reload` 在当前会话重扫目录；Plugin Skills 随插件加载。',
          permissions:
            'Skill 要求的工具调用继续走 Qoder CLI permission rules。',
          conditions:
            '项目目录适合随仓库共享，用户目录适合个人复用；同名覆盖需要结合来源检查。独立 user/project Skill 无设置级软禁用，官方文档只给出删除目录；插件携带的 Skill 随插件停用（`enabledPlugins` 或 `qodercli plugins disable`，停用插件在新会话不再加载）。',
          sources: ['qoder-skills', 'qoder-plugins'],
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
        '在提示词、工具、权限、会话、压缩或 Subagent 生命周期节点执行外部逻辑，并比较事件、Handler 类型和阻断语义。',
      includes: [
        'Hook 配置位置与事件匹配',
        'command、HTTP、prompt、agent 或 MCP Tool Handler',
        '允许、阻断、修改输入输出与记录事件',
      ],
      excludes: [
        '模型自行决定调用的普通工具',
        'CI 平台的远程 Workflow Hook',
        '只提供说明文字而不绑定生命周期的项目指令',
      ],
      facts: [
        '五家都公开了生命周期 Hook，但并不是同一实现：Kimi Code 当前独立 Hook 只执行 command；Codex 自 rust-v0.148.0 起 command Handler 支持 `async: true` 后台执行，`mcp_tool` Handler 的引擎执行也随该版发布，但 CLI 会话接入 MCP 执行器仍在 main 分支（提交 `87070a77925c`），rust-v0.148.0 运行时启动告警跳过。',
        'Claude Code、Qwen Code 和 Qoder CLI 支持多种 Handler；可用事件与返回 JSON 结构仍需按各自文档配置，不能直接复制。',
        '项目 Hook 可以运行本地命令或访问网络，因此可信工作区、超时、退出码和失败时是否放行是比较中的核心边界。',
      ],
      products: {
        claude: {
          entry:
            '`/hooks` 查看已加载配置；Hook 可写入设置、Plugin，或放在 Skill 与 Subagent 的前置元数据中。',
          location:
            '用户、项目、Local、Managed settings；Plugin 使用 `hooks/hooks.json`。',
          behavior:
            '可在工具前后、权限请求、提示提交、会话、压缩、Subagent、任务和通知等节点运行并返回控制结果。',
          scope:
            '用户、项目、本地、托管、Plugin、Skill 与 Agent 多种作用域。',
          components:
            'Handler 类型包括 command、HTTP、MCP Tool、prompt 和 agent。',
          loading:
            '配置在会话启动或重新加载时汇总；`/hooks` 用于检查当前生效配置。',
          permissions:
            'Hook 可阻止工具或提示继续；项目 Hook 属于可执行代码，需要信任其来源。',
          conditions:
            '事件支持的输入、输出和退出码语义不同；不能假设所有 Handler 都可用于每个事件。',
          sources: ['claude-hooks'],
        },
        codex: {
          entry:
            '`/hooks` 检查、信任或禁用非托管 Hook；也可直接编辑 JSON/TOML 配置。',
          location:
            '用户 `~/.codex/hooks.json` 或 `~/.codex/config.toml`；项目 `.codex/hooks.json` 或 `.codex/config.toml`；Plugin 可携带 Hook。',
          behavior:
            '覆盖 PreToolUse、PermissionRequest、PostToolUse、PreCompact、PostCompact、SessionStart、SessionEnd、UserPromptSubmit、SubagentStart、SubagentStop、Stop 共 11 个事件。',
          scope:
            '用户、可信项目、Managed 与 Plugin 来源。',
          components:
            '执行的 Handler 类型是 command，可同步执行或 `async: true` 后台执行（rust-v0.148.0 发布）；prompt 与 agent 配置可解析但运行时跳过；`mcp_tool` Handler（`type = "mcp_tool"`，字段 `server`/`tool`/`input`/`timeout`/`statusMessage`）调用已配置 MCP Server 的工具，`input` 必须是可表示为 TOML 的对象，引擎执行随 rust-v0.148.0 发布（PR #38705）：`${field.nested}` 占位符展开保留 JSON 类型，输出沿用 command Hook 的输出约定，且始终同步执行；SessionEnd 事件与 Managed 必选 Hook 不支持 `mcp_tool`，`timeout` 缺省 600 秒（配置识别提交 `85fc4def358b`）。',
          loading:
            '项目 Hook 需要工作区信任；`/hooks` 展示来源并提供相应控制；`hooks/list` 以 handler 专属元数据返回 Hook，MCP Tool Hook 带 `handlerType: "mcpTool"` 及 server/tool 字段，TUI `/hooks` 浏览器展示 MCP Server 与 MCP Tool 条目（rust-v0.148.0 发布）。',
          permissions:
            'PreToolUse 或 PermissionRequest 等事件可影响是否继续；Managed Hook 不由普通用户关闭。',
          conditions:
            'prompt/agent Handler 可解析但运行时跳过；async command Hook 在后台运行，不能阻断、批准或改写触发它的操作，输出在下一个安全点交付，每会话最多 8 个并发后台 Hook，未完成的随会话结束取消，SessionEnd 始终同步（rust-v0.148.0 发布，官方 Hooks 文档已列 `async` 字段）；rust-v0.148.0 的 CLI 会话运行时未提供 MCP 执行器（`codex-rs/core/src/session/mod.rs` 传 `mcp_executor: None`），`mcp_tool` Hook 启动时以 "MCP invocation is not available yet" 告警跳过；`input` 中 `${field.nested}` 占位符从事件 JSON 解析、字段缺失时该 Hook 失败；会话内实际执行在 main 分支提交 `87070a77925c`（PR #39296，尚未发布）：经会话共享 MCP 运行时执行、含 Managed Hook 配置，只允许已连接、已列入目录且策略允许的工具，不可用 Server 立即失败且不启动或重连，不经模型工具审批、不触发递归 Hook，超时受 Server 侧上限约束；main 分支提交 `d35e5495f991`（PR #39331，尚未发布）把 Hook MCP 调用改经当前连接集执行、不等待 Server 启动或重连，生效超时取 Hook 请求与 Server 工具超时的较短者；官方 Hooks 文档页仍写只有 command Handler 运行；配置文件能解析不等于能力已经运行。',
          sources: ['codex-hooks', 'codex-hooks-mcp-tool', 'codex-hooks-mcp-runner', 'codex-v0148-release', 'codex-hooks-session-mcp', 'codex-hooks-mcp-route'],
        },
        qwen: {
          entry:
            '`/hooks` 查看和管理已加载 Hook；设置文件和 Extension 都可声明。',
          location:
            '用户与项目 `settings.json`；Extension 可内联 Hooks、引用文件或使用默认 `hooks/hooks.json`。',
          behavior:
            '覆盖提示、模型、工具、权限、会话、压缩、Subagent、通知等生命周期，并能阻断或返回修改后的控制结果。',
          scope:
            '用户、可信项目与 Extension 来源；项目 Hook 随仓库共享。',
          components:
            '公开文档包括 command、HTTP 与 prompt；运行时还存在 session-only 的内部 function Hook。',
          loading:
            '启动时合并配置；Extension 热重载与 Hook 管理入口可更新当前运行时状态。',
          permissions:
            '项目 Hook 只在可信文件夹加载；Hook 自身的命令和网络访问需要按可执行配置审查。',
          conditions:
            '内部 function Hook 不是普通配置格式；公开可配置范围应以 command、HTTP 与 prompt 为准。',
          status: '源码确认',
          sources: [
            'qwen-hooks-current',
            'qwen-extension-runtime-current',
          ],
        },
        kimi: {
          entry:
            '没有独立 `/hooks` 命令；在 `~/.kimi-code/config.toml` 的 `[[hooks]]` 中配置。',
          location:
            '独立 Hook 位于用户 `config.toml`；Plugin manifest 也可携带 Hook 配置。',
          behavior:
            '可监听提示、工具、权限、会话、压缩与 Subagent 等事件；退出码 2 可阻断，其他错误默认放行。',
          scope:
            '用户配置与已启用 Plugin；当前文档未列项目级独立 Hook 文件。',
          components:
            '独立配置当前只有 command Handler。',
          loading:
            '启动时读取配置；Plugin 改动通常需要 `/reload` 或新会话。',
          permissions:
            'Hook command 在本机执行；阻断与 fail-open 语义取决于退出码。',
          conditions:
            '“命令表没有 `/hooks`”不等于没有 Hook 能力；Kimi 的入口是 TOML 配置。',
          sources: ['kimi-hooks-current', 'kimi-plugins-current'],
        },
        qoder: {
          entry:
            '在 User、Project 或 Local settings 中配置；当前公开页面以配置为主。',
          location:
            '`~/.qoder/settings.json`、项目 `.qoder/settings.json` 与 `.qoder/settings.local.json`；Plugin 可携带 `hooks/hooks.json`。',
          behavior:
            '覆盖工具、提示、权限、通知、会话、压缩与 Subagent 等节点，并按 Handler 返回结果控制流程。',
          scope:
            'User、Project、Local 和 Plugin。',
          components:
            'command、HTTP、prompt 与 agent Handler。',
          loading:
            '随设置和 Plugin 加载；修改后的刷新方式取决于对应配置或插件重载入口。',
          permissions:
            '项目 Hook 只应在可信工作区启用；Hook 能阻断关键操作，但自身仍是本机可执行配置。',
          conditions:
            '不同 Handler 的超时、响应字段和阻断条件不同，需要按事件文档逐项设置。',
          sources: ['qoder-hooks', 'qoder-plugins'],
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
        '把多个扩展组件打包、安装、启用和更新，并比较包清单、可携带组件、安装作用域和运行时刷新方式。',
      includes: [
        'Plugin 或 Extension manifest',
        '市场、Git、本地目录或压缩包安装',
        'Skills、Commands、Hooks、MCP、Agents 等可选组件',
      ],
      excludes: [
        '单独复制一个 Skill 目录',
        '仅由 IDE 商店分发的编辑器扩展',
        '没有安装生命周期的普通项目配置',
      ],
      facts: [
        '五家现在都存在可安装的扩展包；Qwen Code 将该体系称为 Extensions，除自有格式外还能安装 Gemini、Claude 与 Qoder 格式的包（Qoder 插件兼容随 v0.21.9 引入），并自 v0.21.11-preview.0 起原生加载 Agent Plugins v1 便携包。',
        '组件集合并不对齐：Codex Plugin 当前不在 IDE 扩展中提供；Kimi Code Plugin 已支持 Agent 组件，但优先级低于用户、额外目录、项目和 `--agent-file`。',
        '安装作用域也不同：Kimi Code 当前只支持用户安装；Qoder CLI 提供 User、Project 与 Local scope。',
        '远程插件搜索目前只有 Codex 在 app-server 以 `plugin/search` JSON-RPC 提供，按 `global`/`workspace`/`personal` scope 直接查询远程插件服务；该端点仍在开发中并受功能开关控制，其余四家的插件发现仍走本地目录或 `/plugins` 浏览器。',
        'Codex 在仓库中增加了对 `agent-plugins.org` 1.0.0 清单的支持：根目录 `plugin.json` 与 `.codex-plugin/plugin.json` 并存，`extensions` 字段按反向域名命名空间承载客户端特定数据。Qwen Code 自 v0.21.11-preview.0（提交 `a64d1291d2f6`）起也原生加载同一 1.0.0 schema 的包，不转换或改写 `plugin.json`、`mcp.json`、`SKILL.md`；Claude Code、Kimi Code 与 Qoder CLI 当前一手资料未列出对同一清单的支持。',
      ],
      products: {
        claude: {
          entry:
            '`/plugin` 浏览和管理；支持 Marketplace 安装，也可用 `--plugin-dir` 临时加载本地目录。',
          location:
            'Manifest 位于 `.claude-plugin/plugin.json`；组件目录位于插件根目录。',
          behavior:
            '把多个扩展组件作为一个版本化包启用，并由 Marketplace 或本地目录分发。',
          scope:
            '用户安装、项目 Marketplace 配置与临时 `--plugin-dir` 加载。',
          components:
            'Skills、旧式 Commands、Agents、Hooks、`.mcp.json`、`.lsp.json`、Monitors、`bin` 与 settings。',
          loading:
            '安装或启用后加载；开发中的改动可用 `/reload-plugins` 刷新。',
          permissions:
            'Plugin 中的 Hook、MCP 与命令仍受工作区信任、权限和组织策略约束。',
          conditions:
            'Manifest 在 `.claude-plugin`，但 `skills`、`agents` 等组件目录位于插件根，不放进 manifest 目录。',
          sources: ['claude-plugins'],
        },
        codex: {
          entry:
            'Codex CLI 使用 `/plugins` 打开插件浏览器，可搜索或浏览统一插件目录并安装；app-server 另有 `plugin/search` JSON-RPC 直接查询远程插件服务。',
          location:
            '自建包使用 `.codex-plugin/plugin.json`；也接受根目录 `plugin.json`（`$schema` 指向 `agent-plugins.org/schemas/1.0.0/plugin.schema.json`）的便携 Agent Plugin 清单。其余组件按插件规范组织。',
          behavior:
            '把可复用能力组合成插件，并在 Codex 与 ChatGPT 的统一插件目录中分发。app-server 的 `plugin/search` 绕过本地目录缓存直接搜索远程服务，接受 `searchTerm`、可选 `global`/`workspace`/`personal` scope 以及 `cursor`/`limit`，返回带 marketplace 限定的插件摘要并以 `nextCursor` 透传分页令牌。',
          scope:
            '安装到当前账号或环境；组织可通过管理策略提供或限制插件。',
          components:
            'Skills、MCP/Connector、Hooks，以及可用于自动化的定时模板等组件。',
          loading:
            'CLI 与 Codex 桌面端可使用已安装插件；客户端按启用状态加载。',
          surfaces:
            'Codex CLI 和桌面端支持插件浏览器；当前官方文档明确不在 Codex IDE 扩展和移动端提供。远程插件搜索只在 app-server JSON-RPC 暴露，不是 CLI 命令。',
          permissions:
            'Connector、MCP 和 Hook 继续受认证、审批、沙箱及组织控制。',
          conditions:
            '"Codex 支持 Skills"与"当前 Surface 支持 Plugin 浏览器"是两件事；IDE 扩展目前不加载插件。`plugin/search` 受功能开关控制：`remote_plugin` 关闭时省略 scope 按 `workspace` 处理、`global`/`personal` 返回空页且不查询远程服务，`plugin_sharing` 关闭时共享/私有工作区结果在取回后被过滤；该端点不与已安装快照联表，返回项 `installed` 恒为 `false`，官方标注 under development、do not call from production clients yet。便携 Agent Plugin 清单只要求 `$schema` 和 `name`（允许点号，最长 64 字符）；`version` 缺省为 `1.0.0`，非目录安全版本内部派生 `agent-plugins-<sha256-hex>` 目录名且不改写原清单。Agent Plugin 跳过旧式命令迁移；安装时拒绝符号链接和不受支持的文件类型。',
          sources: ['codex-plugins', 'codex-plugin-search', 'codex-portable-plugins'],
        },
        qwen: {
          entry:
            '`/extensions` 在 TUI 管理；`qwen extensions` 提供安装、列表、更新、启用和禁用等 CLI 操作。Qoder 插件与 Agent Plugins v1 包同样用现有 `qwen extensions install`（或 `/extensions install`）安装，来源支持本地目录、`link`、归档、Git 仓库（`owner/repo`）、归档 URL 与 scoped npm 包。',
          location:
            'Qwen 原生 manifest 为 `qwen-extension.json`；也能安装兼容的 Gemini 与 Claude 扩展结构。Qoder 插件以 `.qoder-plugin/plugin.json` 为 manifest，安装时转换为 `qwen-extension.json` 保存。Agent Plugins v1 包以根目录 `plugin.json`（`$schema` 指向 `agent-plugins.org/schemas/1.0.0/plugin.schema.json`）为 manifest，可搭配根目录 `mcp.json`；安装保留 `plugin.json`、`mcp.json`、`SKILL.md` 原文件，不生成 `qwen-extension.json` 或改写清单。',
          behavior:
            '从 npm、Git、归档或本地目录安装，并把扩展组件合并到当前运行时。Qoder 插件可从本地目录、归档、Git 仓库、归档 URL 或 scoped npm 包安装：保留标准 `commands/`、`agents/`、`skills/` 目录；manifest 未声明 `mcpServers` 时，根 `.mcp.json` 的 MCP Server 规范化为 Qwen 传输后作为扩展 MCP 加载；根目录存在 `system-prompt.md` 时作为扩展上下文加载，与 `QWEN.md` 及显式声明的上下文文件去重后并存。Agent Plugins v1 原生加载只发现直接子级 `skills/*/SKILL.md`（遵循 Agent Skills 规范，无效 Skill 单独跳过、不影响同级有效 Skill）；stdio MCP 在 `args`、环境变量值与 `cwd` 中展开 `${PLUGIN_ROOT}`（安装根目录）与 `${PLUGIN_DATA}`（按安装持久化的可写目录），并支持 Streamable HTTP MCP；legacy HTTP+SSE 条目报告后跳过。',
          scope:
            'User 与 Project scope；Project 扩展可随仓库配置。',
          components:
            'Context file、MCP、Commands、Skills、Agents、Settings、Channels、Hooks 与 LSP Servers。Agent Plugins v1 便携运行时当前只启用 Agent Skills 与 stdio/Streamable HTTP MCP。',
          loading:
            'Extension manager 支持运行时热重载；各组件按 manifest 和目录约定重新注册。',
          permissions:
            '扩展中的 Hook、MCP、Command 和 Agent 仍经过工作区信任、approval mode 与工具策略。Agent Plugins v1 使用标准扩展安全同意流程，但不再显示“转换第三方格式”的兼容提示。',
          conditions:
            'Qwen 的正式名称是 Extension；“Plugin”只应在兼容格式或具体组件语境使用，不能与整个管理入口混写。Qoder 插件兼容随 v0.21.9 引入：manifest 必须在插件目录内解析为含 `name` 的有效 JSON，引用的资源与上下文文件必须留在插件内部，复制时跳过逃逸源目录根的符号链接且不复制 Git 元数据；归档的 manifest 可位于根目录或一个受支持的顶层包装目录内；Git 安装在安装元数据记录检出提交（`gitCommit`）供更新检查，`version` 缺省为 `1.0.0`，来源记录为 `Qoder`。Agent Plugins v1 原生加载随 v0.21.11-preview.0 预览通道发布（提交 `a64d1291d2f6`，稳定版 v0.21.10 不含）：`$schema` 属于 Agent Plugins 的根 `plugin.json` 优先于其他扩展 manifest，不支持的 schema 版本显式失败，无关 `plugin.json` 被忽略；`commands/`、`agents/`、hooks、上下文、settings、channels、apps 与 `extensions.*` 客户端命名空间一律忽略；Skill frontmatter 的实验字段 `allowed-tools` 只按字符串识别，不授予预批准工具权限；远程 MCP 端点必须 HTTPS（loopback HTTP 例外）；包边界检查拒绝符号链接与路径穿越。',
          sources: [
            'qwen-extensions-current',
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
            '`/plugins` 及其子命令管理 Marketplace、本地、GitHub 或 ZIP 来源的插件。',
          location:
            'Manifest 为根目录 `kimi.plugin.json` 或 `.kimi-plugin/plugin.json`。',
          behavior:
            '把多个自定义组件作为一个包安装到用户环境，并支持启用、禁用和重载。安装会消耗套餐额度的官方 plugin（当前为 `kimi-datasource`）会在安装结果中提示 `Note: This plugin consumes your quota.`。',
          scope:
            '当前文档只支持用户级安装，没有项目级插件安装。',
          components:
            'Skills、Session-start Skill、Skill instructions、System prompt instructions（`systemPrompt` / `systemPromptPath`，各上限 32 KB，合计 64 KB）、Custom Agents（`agents` 字段或根 `agents/` 目录）、MCP Servers、Hooks 与 Commands。',
          loading:
            '安装或修改后使用 `/reload` 或开启新会话生效；v2 引擎中 `/plugins reload` 也可刷新当前会话。`/plugins` 的 Installed tab 在 marketplace 有新版本时显示更新徽章；使用过时官方 plugin（其 MCP 工具或 `/<plugin>:<command>` 命令）的 turn 结束后出现一次性更新提示，已通知版本写入 `~/.kimi-code/updates/plugin-notices.json`，每个 marketplace 版本只提醒一次。',
          permissions:
            'Plugin 中的 MCP、Hook、Commands 与 Agent 具备执行能力，安装前需要审查来源。',
          conditions:
            '配额提示与更新提示只对官方来源、默认官方目录的 plugin 生效；自定义 `KIMI_CODE_PLUGIN_MARKETPLACE_URL` 或非官方安装不触发更新提示。Plugin Agent 优先级低于用户、额外目录、项目和 `--agent-file`；替换同名内置 Agent 需要在 frontmatter 声明 `override: true`。`systemPrompt` 与 `systemPromptPath` 在 v1 引擎（交互 TUI 和 `kimi -p`）、`kimi web` 以及 v2 引擎（`KIMI_CODE_EXPERIMENTAL_FLAG=1`）中均生效。',
          sources: ['kimi-plugins-current'],
        },
        qoder: {
          entry:
            '`qodercli plugins` 管理安装与状态；运行中使用 `/plugins reload` 重载。',
          location:
            'Manifest 位于 `.qoder-plugin/plugin.json`；组件使用约定目录。',
          behavior:
            '从 Marketplace 或插件来源安装，并把组件注册到 Qoder CLI。',
          scope:
            'User、Project 和 Local 三种 scope。',
          components:
            'Commands、Agents、Skills、Hooks、Output styles、`bin` 与 `.mcp.json`。',
          loading:
            '启动时加载；`/plugins reload` 在当前会话刷新。',
          permissions:
            '插件组件仍受权限规则与工作区信任控制；本地可执行内容需要单独审查。',
          conditions:
            'Qoder CLI 已有独立插件管理入口；旧矩阵中的“未确认”结论不再成立。',
          sources: ['qoder-plugins'],
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
        '把提示模板保存成可输入的 Slash 命令，并区分独立 Command 文件、Skills、Plugin Commands 与已弃用机制。',
      includes: [
        'Markdown Prompt Command 的目录与命名',
        '参数、命名空间和加载优先级',
        '与 Skills 或 Plugin Commands 的关系',
      ],
      excludes: [
        '产品内置 Slash 命令',
        'MCP Server 动态暴露的 Prompt',
        '只通过自然语言自动触发、没有命令入口的 Skill',
      ],
      facts: [
        'Claude Code、Qwen Code 和 Qoder CLI 都保留独立 Markdown Command 目录；Kimi Code 当前只文档化 Plugin Commands 与 Skills。',
        'Codex 的 `~/.codex/prompts` 自定义 Prompt 已弃用且只在本机使用，官方建议把可复用内容迁到 Skills。',
        '同样显示为 `/name` 的入口可能来自内置命令、Skill、Prompt Command、Plugin 或 MCP Prompt，矩阵只比较其公开加载机制。',
      ],
      products: {
        claude: {
          entry:
            '`.claude/commands/deploy.md` 生成 `/deploy`；Skills 也能生成同名 Slash 入口。',
          location:
            '项目 `.claude/commands/*.md` 与用户 `~/.claude/commands/*.md`；Plugin 可携带 `commands/`。',
          behavior:
            'Markdown 正文作为提示模板加载，目录层级形成命名空间；参数可插入提示内容。',
          scope:
            '项目、用户和 Plugin；项目命令可随仓库共享。',
          components:
            'Markdown Prompt、前置配置和参数占位；复杂工作流可迁移为带辅助文件的 Skill。',
          loading:
            '旧式 Commands 与 Skills 会合并进入 Slash 菜单；运行时 Skill 变更可被检测。',
          permissions:
            'Command 只是生成提示；提示触发的工具仍受权限规则。',
          conditions:
            '`.claude/commands` 仍受支持，但新建复杂可复用能力时官方把 Skills 作为统一机制。',
          sources: ['claude-skills'],
        },
        codex: {
          entry:
            '推荐通过 Skill 暴露可复用能力；旧 Prompt 使用 `/prompts:<name>`。',
          location:
            '旧 Prompt 只从用户目录 `~/.codex/prompts/*.md` 加载；项目不提供同等 Prompt 目录。',
          behavior:
            '旧 Prompt 把 Markdown 内容插入对话；Skill 可携带更完整的脚本和资源，并支持显式或自动调用。',
          scope:
            '旧 Prompt 仅本机用户；Skills 可放项目 `.agents/skills` 或用户目录。',
          components:
            '旧机制只有 Markdown Prompt；Skills 使用 SKILL.md 与辅助资源。',
          loading:
            '旧 Prompt 在客户端发现后以 `/prompts:*` 提供；新内容应使用 Skills。',
          permissions:
            'Prompt 或 Skill 都不绕过审批与沙箱。',
          conditions:
            '`/prompts:*` 已弃用；不能把它表述成与其他四家同等的现行项目级 Command 系统。',
          status: '条件项',
          sources: ['codex-custom-prompts', 'codex-skills'],
        },
        qwen: {
          entry:
            '`.qwen/commands/review.md` 生成 `/review`；Skills 同样可以注册 Slash 入口。',
          location:
            '项目 `.qwen/commands/*.md` 与用户 `~/.qwen/commands/*.md`；Extension 也可携带 Commands。',
          behavior:
            'Markdown 为推荐格式，TOML 为兼容格式；支持参数与 Shell 占位，嵌套目录转成冒号命名空间。',
          scope:
            '项目命令优先于同名用户命令；Extension 命令进入统一命令注册表。',
          components:
            'Markdown/TOML Prompt、参数占位、Shell 结果插值；复杂资源可用 Skill。',
          loading:
            '文件加载器扫描用户和项目目录，Extension manager 注册扩展命令。',
          permissions:
            '命令模板可插入 Shell 结果，实际执行仍受环境与工具权限控制。',
          conditions:
            '保存的 Workflow 是另一套运行记录机制，不应在矩阵中当成自定义 Command 的同义词。',
          status: '源码确认',
          sources: [
            'qwen-commands-current',
            'qwen-extension-runtime-current',
          ],
        },
        kimi: {
          entry:
            'Plugin 的 `commands/deploy.md` 以 `/<plugin>:deploy` 调用；Skills 使用 `/skill:<name>`。',
          location:
            '当前文档列出 Plugin `commands/*.md` 和各级 Skill 目录，没有独立 `.kimi-code/commands` 目录。',
          behavior:
            'Plugin Command 将 Markdown 作为提示模板，并用 `$ARGUMENTS` 接收调用参数。',
          scope:
            'Plugin Command 随用户安装的 Plugin 生效；Skills 可来自项目、用户、额外目录或内置来源。',
          components:
            'Plugin Markdown Command，或带 SKILL.md 和辅助文件的 Skill。',
          loading:
            '随 Plugin 加载；修改后使用 `/reload` 或新会话。',
          permissions:
            '命令产生的操作继续受 Kimi 工具权限约束。',
          conditions:
            '未发现公开的独立用户/项目 Command 目录；不要根据 `.kimi-code/skills` 推断 `.kimi-code/commands`。',
          sources: ['kimi-plugins-current', 'kimi-skills-current'],
        },
        qoder: {
          entry:
            '`/commands` 查看自定义命令；Markdown 文件名形成 Slash 命令名。',
          location:
            '项目 `.qoder/commands/*.md` 与用户 `~/.qoder/commands/*.md`；Plugin 也可携带 Commands。',
          behavior:
            'Markdown 正文作为 Prompt Command，可在 TUI 与 Headless 中调用。',
          scope:
            '项目与用户目录按优先级合并；Plugin 命令随其 scope 加载。',
          components:
            'Markdown Prompt Command；需要脚本和资源时可改用 Skill 或 Plugin。',
          loading:
            '启动时扫描目录；Plugin Commands 可随 `/plugins reload` 刷新。',
          permissions:
            'Headless 或 TUI 中执行命令后，工具仍经过对应权限模式。',
          conditions:
            'Prompt Command 的 Headless 可用性不代表所有内置交互命令都能在 Headless 中运行。',
          sources: ['qoder-commands', 'qoder-plugins'],
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
        'Agent 定义中的 systemPrompt',
        '主题与配色',
      ],
      facts: [
        'Claude Code 与 Qoder CLI 都把输出风格实现为向系统提示词追加指令的预设，支持用户级与项目级自定义 Markdown 风格，并可由插件携带；两家都有插件强制风格覆盖用户选择的机制。',
        '生效时机不同：Claude Code 选择后需 `/clear` 或新会话（系统提示词只在会话启动时读取一次）；Qoder CLI 修改 `outputStyle` 配置项需重启 CLI，`--output-style` 命令行参数则对当前会话立即生效。',
        'Codex 没有自定义风格文件机制，相近能力是 `personality` 沟通风格（`none`/`friendly`/`pragmatic`），仅对宣告 `supportsPersonality` 的模型生效，`/personality` 可按线程或单轮覆盖。',
        'Qwen Code 官方设置文档与扩展组件清单均未列出输出风格；Kimi Code `config.toml` 无风格、语气或 persona 配置键，`[identity]` 只改系统提示词自称与协议字段机器标识。',
        'Claude Code 自 v2.1.237 起新增内置 Concise 风格（先给结果、省略铺垫与过程叙述）；Qoder CLI 官方示例取值也有 `concise`，两者为各自独立的实现。',
      ],
      products: {
        claude: {
          entry:
            'CLI 运行 `/config` 选择 Output style；桌面 App 中 `/config` 打开 Settings > Claude Code，需在设置文件中手动写字段；也可直接在任意设置 JSON 中设置 `"outputStyle"`。独立 `/output-style` 命令自 v2.1.73 弃用、v2.1.91 移除。',
          location:
            '自定义风格为 Markdown 文件：用户级 `~/.claude/output-styles`、项目级 `.claude/output-styles`、受管策略目录的 `.claude/output-styles`、插件包内 `output-styles/`。项目风格自工作目录至仓库根之间的每个 `.claude/output-styles/` 都加载，重名取最接近工作目录的文件。',
          behavior:
            '风格通过修改系统提示词定义角色、语气与输出格式，不改变知识库。内置风格：Default、Proactive、Explanatory、Learning；v2.1.237 新增内置 Concise——回答先给结果、省略铺垫与过程叙述，工作深度不变。自定义风格可选保留内置软件工程指令。',
          scope:
            '选择保存在设置文件：`/config` 菜单选择写入 `.claude/settings.local.json`（本地项目级）；手动编辑可把 `"outputStyle"` 写入任意有效设置文件。',
          components:
            '自定义风格 frontmatter：`name`（默认取文件名）、`description`（`/config` 选择器显示）、`keep-coding-instructions`（默认 false，为 true 时保留内置软件工程指令）、`force-for-plugin`（默认 false）。',
          loading:
            '系统提示词在会话启动时读取一次，改风格后需 `/clear` 或新会话生效。插件风格 `force-for-plugin: true` 时插件启用即自动应用并覆盖用户 `outputStyle`；多个插件同时强制时最先加载者生效。',
          permissions:
            '风格只改系统提示词，不改权限设置；Proactive 风格自主执行更强，但仍遵守当前权限设置。',
          conditions:
            '官方文档页的内置风格清单尚未列入 Concise；Concise 以 v2.1.237 更新日志为准。',
          sources: ['claude-output-styles', 'claude-concise-v237'],
        },
        codex: {
          entry:
            '`config.toml` 的 `personality` 键或 `/personality` 命令；`features.personality`（布尔，stable，默认开）控制 personality 选择控件是否可用。',
          location:
            '用户级 `~/.codex/config.toml`；项目级覆盖 `.codex/config.toml`。',
          behavior:
            '`personality` 设定默认沟通风格，取值 `none`、`friendly`、`pragmatic`，仅对宣告 `supportsPersonality` 的模型生效。无从目录加载自定义风格文件的机制。',
          scope:
            '配置值按用户或项目作用域持久；`/personality` 覆盖可按线程或单轮生效。',
          components: '无自定义风格文件与 frontmatter。',
          loading:
            '`personality` 配置值随 config.toml 生效；`/personality` 覆盖按线程或单轮应用。',
          permissions: '不涉及权限变化。',
          conditions:
            '官方配置参考未描述自定义风格目录或插件风格；`developer_instructions`、`model_instructions_file` 与 `model_verbosity` 是指令或参数覆盖，不是风格预设。',
          sources: ['codex-config-reference'],
        },
        qwen: {
          entry: '官方文档未列出输出风格入口。',
          location: '官方文档未列出输出风格目录。',
          behavior:
            '设置文档无风格、personality 或语气类设置键；`output` 节仅含 `output.format`（`text`/`json`）与 `output.showTimestamps`，属于输出格式与显示项。',
          scope: '无输出风格选择与保存位置。',
          components:
            '扩展组件为 prompts、MCP servers、subagents、skills、custom commands、channels、上下文文件与设置，不含输出风格。',
          loading: '无风格加载流程。',
          permissions: '不涉及权限。',
          conditions:
            '当前一手资料不足以确认 Qwen Code 提供输出风格；本页以官方设置文档与扩展文档当前内容为准。',
          sources: ['qwen-settings-current', 'qwen-extension-intro-current'],
        },
        kimi: {
          entry:
            '官方配置文档与命令表未列出输出风格入口；`/theme`、`/custom-theme` 为配色主题。',
          location: '官方文档未列出输出风格目录。',
          behavior:
            '`config.toml` 无风格、语气或 persona 配置键；最接近的 `[identity]` 中 `name` 设定系统提示词中的自称（填充 `${product_name}` 变量）、`slug` 设定协议字段的机器标识（如 User-Agent 产品名、MCP 客户端名），均不改变回复风格。',
          scope: '`[identity]` 随配置文件作用域生效。',
          components: '无自定义风格文件与 frontmatter。',
          loading: '无风格加载流程。',
          permissions: '不涉及权限。',
          conditions:
            '当前一手资料不足以确认 Kimi Code 提供输出风格；Plugin Agent 的 `systemPrompt` 属于 Agent 定义，不属于本字段。',
          sources: ['kimi-config-files-current', 'kimi-commands-current'],
        },
        qoder: {
          entry:
            '`settings.json` 顶层 `outputStyle` 键（兼容 `general.outputStyle`，两处同时配置时顶层优先）；命令行 `qoder --output-style <name>`。',
          location:
            '自定义风格为 `.md` 文件：用户级 `~/.qoder/output-styles/`（全部项目生效）、项目级 `<project>/.qoder/output-styles/`（仅当前项目）。`outputStyle` 设置写在 `~/.qoder/settings.json`（用户）、`<project>/.qoder/settings.json`（项目）或 `<project>/.qoder/settings.local.json`（本地），按内置默认→用户→项目→本地→`--settings` 合并。',
          behavior:
            '向系统提示词追加指令，调整回复语气、冗长度与结构；只改表达方式，不改核心身份与安全约束。未设置或设为 default 时使用内置默认表达、不追加风格；官方示例取值为 `concise`，官方文档未给出完整内置风格清单。',
          scope:
            '`outputStyle` 配置项按设置文件作用域持久；`--output-style` 仅当前会话生效且优先于配置项。',
          components:
            '自定义风格 frontmatter 可选：`name`（默认取去掉 `.md` 的文件名）、`description`（默认取正文第一个非标题行）。',
          loading:
            '修改配置中的 `outputStyle` 需重启 CLI 生效；`--output-style` 无需重启立即生效。同名风格按内置→插件→用户级→项目级顺序后者覆盖前者；插件风格以 `plugin-name:style-name` 引用；插件强制风格优先于 `outputStyle` 设置，多个强制风格时第一个生效并记录警告。',
          permissions:
            '官方文档明确输出风格不改变核心身份与安全约束。',
          conditions:
            '官方文档页未标注输出风格的引入版本；以当前文档站内容为准。',
          sources: ['qoder-output-styles', 'qoder-settings'],
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
  });
})();

window.matrixData = {
  updatedAt: '2026-10-22',
  products: [
    { id: 'claude', name: 'Claude Code', short: 'Claude' },
    { id: 'codex', name: 'Codex', short: 'Codex' },
    { id: 'qwen', name: 'Qwen Code', short: 'Qwen' },
    { id: 'kimi', name: 'Kimi Code', short: 'Kimi' },
    { id: 'qoder', name: 'Qoder CLI', short: 'Qoder' },
  ],
  categories: [
    { id: 'commands', name: 'Slash 命令', doc: '01-Slash命令矩阵.md' },
    { id: 'subagents', name: 'Subagent', doc: '02-Subagent能力矩阵.md' },
    { id: 'security', name: '权限与沙箱', doc: '03-权限与沙箱矩阵.md' },
    { id: 'sessions', name: '会话与上下文', doc: '04-会话与上下文矩阵.md' },
    { id: 'extensions', name: '扩展系统', doc: '05-扩展系统矩阵.md' },
    { id: 'execution', name: '执行与 Git', doc: '06-任务执行与Git矩阵.md' },
    { id: 'surfaces', name: 'Headless 与多端', doc: '07-Headless-SDK与多端矩阵.md' },
    { id: 'models', name: '模型与认证', doc: '08-模型与认证矩阵.md' },
  ],
  sources: {
    'claude-commands': {
      label: 'Claude Code Commands',
      url: 'https://code.claude.com/docs/en/commands',
    },
    'claude-agents': {
      label: 'Claude Code Subagents',
      url: 'https://code.claude.com/docs/en/sub-agents',
    },
    'claude-docs': {
      label: 'Claude Code Documentation',
      url: 'https://code.claude.com/docs/en/overview',
    },
    'claude-permissions': {
      label: 'Claude Code Permissions',
      url: 'https://code.claude.com/docs/en/permissions',
    },
    'claude-permission-modes': {
      label: 'Claude Code Permission Modes',
      url: 'https://code.claude.com/docs/en/permission-modes',
    },
    'claude-sandboxing': {
      label: 'Claude Code Sandboxing',
      url: 'https://code.claude.com/docs/en/sandboxing',
    },
    'claude-headless': {
      label: 'Claude Code Headless Mode',
      url: 'https://code.claude.com/docs/en/headless',
    },
    'claude-agent-sdk': {
      label: 'Claude Agent SDK',
      url: 'https://code.claude.com/docs/en/agent-sdk/overview',
    },
    'claude-desktop': {
      label: 'Claude Code Desktop',
      url: 'https://code.claude.com/docs/en/desktop',
    },
    'claude-desktop-linux': {
      label: 'Claude Desktop on Linux (beta)',
      url: 'https://code.claude.com/docs/en/desktop-linux',
    },
    'claude-web': {
      label: 'Claude Code on the web',
      url: 'https://code.claude.com/docs/en/claude-code-on-the-web',
    },
    'claude-remote-control': {
      label: 'Claude Code Remote Control',
      url: 'https://code.claude.com/docs/en/remote-control',
    },
    'claude-platforms': {
      label: 'Claude Code platforms and integrations',
      url: 'https://code.claude.com/docs/en/platforms',
    },
    'claude-sessions': {
      label: 'Claude Code Manage sessions',
      url: 'https://code.claude.com/docs/en/sessions',
    },
    'claude-checkpointing': {
      label: 'Claude Code Checkpointing',
      url: 'https://code.claude.com/docs/en/checkpointing',
    },
    'claude-context-window': {
      label: 'Claude Code Context window',
      url: 'https://code.claude.com/docs/en/context-window',
    },
    'claude-memory': {
      label: 'Claude Code Memory',
      url: 'https://code.claude.com/docs/en/memory',
    },
    'claude-mcp': {
      label: 'Claude Code MCP',
      url: 'https://code.claude.com/docs/en/mcp',
    },
    'claude-skills': {
      label:
        'Claude Code Skills（自定义命令已并入 Skills：`.claude/commands/deploy.md` 与 `.claude/skills/deploy/SKILL.md` 都生成 `/deploy`，命令文件是 “the older format” 且仍可用、frontmatter 除 `name` 与 `paths` 外与 Skill 相同；子目录按 `:` 命名空间、`$ARGUMENTS[N]` 与 `$N` 为 0 基、`arguments` 命名参数、`!` 行内 Shell 与 `disableSkillShellExecution`、同名时 Enterprise over personal 与 personal over project）',
      url: 'https://code.claude.com/docs/en/skills',
    },
    'claude-interactive-mode': {
      label:
        'Claude Code Interactive mode（输入历史按工作目录保存、`Up` 可召回本项目往次会话的提示词、`Ctrl+R` 反向搜索历史并在全屏渲染下用 `Ctrl+S` 在 this session／this project／all projects 之间切换范围、双按 `Esc` 清空输入并把草稿存进历史；全页没有数字槽位或保存提示词模板一类的机制）',
      url: 'https://code.claude.com/docs/en/interactive-mode',
    },
    'claude-hooks': {
      label: 'Claude Code Hooks',
      url: 'https://code.claude.com/docs/en/hooks',
    },
    'claude-hooks-guide': {
      label: 'Claude Code Hooks guide',
      url: 'https://code.claude.com/docs/en/hooks-guide',
    },
    'claude-plugins': {
      label: 'Claude Code Plugins',
      url: 'https://code.claude.com/docs/en/plugins',
    },
    'claude-plugins-components': {
      label: 'Claude Code Plugin components',
      url: 'https://code.claude.com/docs/en/plugins/components',
    },
    'claude-plugins-org': {
      label:
        'Claude Code Plugins for organizations（官方市场 `claude-plugins-official` 自动注册条件、`strictKnownMarketplaces`/`blockedMarketplaces`/`extraKnownMarketplaces`/`enabledPlugins`/`disableSideloadFlags`）',
      url: 'https://code.claude.com/docs/en/plugins/org',
    },
    'claude-plugins-cli-reference': {
      label:
        'Claude Code plugin 命令参考（`claude plugin marketplace add|list|remove|update`、`/plugin` 别名与 `/reload-plugins`）',
      url: 'https://code.claude.com/docs/en/plugins/cli-reference',
    },
    'claude-mods-overview': {
      label: 'Claude Code Mods overview',
      url: 'https://code.claude.com/docs/en/plugins/mods/overview',
    },
    'claude-mods-reference': {
      label: 'Claude Code Mods reference',
      url: 'https://code.claude.com/docs/en/plugins/mods/reference',
    },
    'claude-v21287-mods-changelog': {
      label: 'Claude Code v2.1.287 Claude Mods 更新日志',
      url: 'https://github.com/anthropics/claude-code/blob/816ec211a648/CHANGELOG.md',
    },
    'claude-v21288-mods-changelog': {
      label: 'Claude Code v2.1.288 mods `$.ui.selection()` 更新日志',
      url: 'https://github.com/anthropics/claude-code/blob/1c229fcd1e1e/CHANGELOG.md',
    },
    'claude-v21295-hooks-changelog': {
      label: 'Claude Code v2.1.295 Hook `onFailure: "block"` 更新日志',
      url: 'https://github.com/anthropics/claude-code/blob/602df92bf481ed904533e95c09f740f40aab5aed/CHANGELOG.md',
    },
    'claude-v21296-subagent-autocompact-changelog': {
      label: 'Claude Code v2.1.296 Subagent `autoCompactWindow` 更新日志',
      url: 'https://github.com/anthropics/claude-code/blob/2301018b1f61073c501a8e7a4813ef48c239163b/CHANGELOG.md',
    },
    'claude-v21296-workflow-subagent-model-changelog': {
      label:
        'Claude Code v2.1.296 `CLAUDE_CODE_WORKFLOW_SUBAGENT_MODEL` 更新日志（官方环境变量页与 Workflows 页尚未收录该变量）',
      url: 'https://github.com/anthropics/claude-code/blob/2301018b1f61073c501a8e7a4813ef48c239163b/CHANGELOG.md',
    },
    'claude-v21299-idle-compaction-changelog': {
      label:
        'Claude Code v2.1.299 空闲压缩更新日志（`idleCompaction` 与 `CLAUDE_CODE_IDLE_COMPACT_MIN_TOKENS`，2026-10-14 发布）',
      url: 'https://github.com/anthropics/claude-code/blob/db93774d73e8fdbaf315a6f4c175ae99ad3d515a/CHANGELOG.md',
    },
    'claude-v21304-autocompact-window-changelog': {
      label:
        'Claude Code v2.1.304 更新日志（2026-10-19T21:34:39Z 发布，固定到提交 `772c6bee5c36f58be43bbb2b182862aeb22aceff`）：与自动压缩窗口相关的一条逐字为 “Fixed `CLAUDE_CODE_AUTO_COMPACT_WINDOW=200k` silently setting a 100K window: the variable now accepts `k` and `M` suffixes like `--autocompact`, and warns when a value is out of range or ignored”，该条只写环境变量，没有改命令与旗标的取值形式',
      url: 'https://github.com/anthropics/claude-code/blob/772c6bee5c36f58be43bbb2b182862aeb22aceff/CHANGELOG.md',
    },
    'claude-v21302-idle-compaction-config-changelog': {
      label:
        'Claude Code v2.1.302 更新日志（固定到提交 `c017428c8c27e604840435048d5bce6a9a22c040`）：与空闲压缩相关的一条逐字为 “Added an `Idle compaction` row to `/config` for turning idle compaction off or back on; the notices shown after an idle compaction now say how to turn it off”',
      url: 'https://github.com/anthropics/claude-code/blob/c017428c8c27e604840435048d5bce6a9a22c040/CHANGELOG.md',
    },
    'claude-autocompact-window-values': {
      label:
        'Claude Code 模型配置页的 “Set the auto-compact window” 与 “Values and warnings for `CLAUDE_CODE_AUTO_COMPACT_WINDOW`” 两节（2026-10-20 复核，120,859 字节）：设置窗口的位置逐字列五项——“**For the current model, in this session and later ones**: run `/autocompact` with a value, like `/autocompact 500k`.”、“**For every model**: set `autoCompactWindow` in a settings file, such as `"autoCompactWindow": 200000` in `~/.claude/settings.json`.”、“**For one launch**: pass `--autocompact` when starting Claude Code.”、“**In scripts and cloud environments**: set `CLAUDE_CODE_AUTO_COMPACT_WINDOW` to a token count such as `200000`.” 与 “**For one subagent**: see Set the auto-compact window for one subagent”；命令与旗标的取值形式逐字为 “The command and the flag accept a window size from 100K to 1M tokens, in any of these forms:” 加 “A plain token count, such as `200000`”、“A `k` or `M` suffix, such as `500k` or `1M`”、“A bare number from 100 to 1000, meaning thousands, so `200` sets 200,000”，并写 “Whichever way you set the window, Claude Code caps it at the model\'s context window.”；优先级逐字为 “Unless Claude Code ignores the value, the variable takes precedence over the command, the flag, and the `autoCompactWindow` setting. `/autocompact` then reports the override without saving.” 与 “The status line\'s `used_percentage` measures against the model\'s full context window, so while the variable is set, that percentage doesn\'t indicate when compaction will run.”；告警小节逐字为 “A warning that quotes your `CLAUDE_CODE_AUTO_COMPACT_WINDOW` value means the value falls outside 100,000 to 1,000,000 or isn\'t a token count. To stop the warning, set a number in that range, such as `CLAUDE_CODE_AUTO_COMPACT_WINDOW=200000`. On Claude Code v2.1.304 or later, you can also write the number with `k` for thousands or `M` for millions, as in `200k` or `1M`.”，三行对照表（表头逐字为 “Your warning contains”、“Window the session uses” 与 “What to change”，下面把每行三列照录并以「／」分隔）为 “`reads as <N> tokens, so Claude Code treats it as the 100k minimum`／The smaller of 100,000 tokens and your model\'s context window／Set at least `100000`, such as `200000`, or `200k` if you meant `200` as thousands”、“`is too large, so Claude Code treats it as the 1M maximum`／The smaller of 1,000,000 tokens and your model\'s context window／You already have the largest window. To stop the warning, set `1M` or `1000000`” 与 “`isn\'t a usable size, so Claude Code ignores it`／The window from `--autocompact`, `/autocompact`, or `autoCompactWindow`, or the default when none is set／Set a number such as `200000`, or unset the variable”；无后缀数字的读法逐字为 “A number with no suffix is read as that many tokens, so `CLAUDE_CODE_AUTO_COMPACT_WINDOW=200` means 200 tokens even though `/autocompact 200` means 200,000.”；该页 “Default auto-compact thresholds” 一节在核对日期仍写未设窗口时在模型上下文上限处压缩，例外为 Cloud 会话接近上限时压缩、Sonnet 4.6 与 Opus 4.6 未开扩展上下文时在 200K 边界、`CLAUDE_CODE_DISABLE_1M_CONTEXT=1` 时原生 1M 窗口模型在 200K 边界、原生 1M 窗口模型默认约 967K，另加两条本次未展开的例外（不认识的模型 ID 按 Claude Code 假定的窗口、自定义 `ANTHROPIC_BASE_URL` 见网关一节）',
      url: 'https://code.claude.com/docs/en/model-config#claude_code_auto_compact_window-values',
    },
    'claude-env-vars-autocompact-window': {
      label:
        'Claude Code 环境变量页的 `CLAUDE_CODE_AUTO_COMPACT_WINDOW` 行（2026-10-20 复核，167,567 字节）逐字为 “Set the auto-compact window, how full the context gets before compaction, from `100000` to `1000000` tokens. Suffixed values such as `200k` require v2.1.304 or later. For precedence over the other ways to set the window and the effect on the status line\'s `used_percentage`, see Set the auto-compact window”；同页 `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` 行仍为 1–100 的百分比、不能抬高阈值、只在上限前就压缩的会话生效且主会话与 Subagent 都适用，`CLAUDE_CODE_IDLE_COMPACT_MIN_TOKENS` 行仍为默认 `200000`、只接受正整数、低于 `100000` 抬到 `100000`、需 v2.1.290 及以上；该页没有 `DISABLE_AUTO_COMPACT` 行',
      url: 'https://code.claude.com/docs/en/env-vars',
    },
    'claude-subagent-autocompact-window-docs': {
      label:
        'Claude Code Subagents 页的 “Set the auto-compact window for one subagent” 一节与 frontmatter 字段表 `autoCompactWindow` 行（2026-10-20 复核，108,779 字节）：字段表行逐字为 “Lower the auto-compact window for this subagent to a token count from `100000` to `1000000`. Requires Claude Code v2.1.296 or later”，必填列为 No；专节正文逐字为 “To make one subagent compact earlier than it otherwise would, set `autoCompactWindow` in its frontmatter to a token count from `100000` to `1000000`. If you set `CLAUDE_CODE_AUTO_COMPACT_WINDOW`, the subagent uses that variable\'s window instead and the field has no effect, unless Claude Code ignores the variable\'s value. Requires Claude Code v2.1.296 or later.”，示例 frontmatter 为 `name: log-reader` 加 `autoCompactWindow: 200000`；写法限制逐字为 “Write the value as a plain integer such as `200000`, because in frontmatter Claude Code reads `200k` as 200, which is outside the allowed range. The subagent still loads and compacts as if the field were absent. To check whether Claude Code ignored your value, run `claude --debug` in your shell and search the debug log for `invalid autoCompactWindow`.”；无效原因两条逐字为 “**The value isn\'t below the auto-compact window the subagent would otherwise inherit**: to compact earlier, set a value below that window.” 与 “**You run the whole session as this subagent with `--agent` or the `agent` setting**: the field has no effect there.”；该页没有说明 frontmatter 窗口与 `--autocompact`、每模型 `modelSettings` 或顶层 `autoCompactWindow` 的组合顺序',
      url: 'https://code.claude.com/docs/en/sub-agents#subagent-auto-compact-window',
    },
    'codex-compaction-threshold-keys': {
      label:
        'Codex configuration reference 的压缩键（2026-10-20 复核，1,456,078 字节）：`model_auto_compact_token_limit` 类型为 `number`、默认未设置、描述逐字为 “Token threshold that triggers automatic history compaction (unset uses model defaults).”；`model_auto_compact_token_limit_scope` 取值 `total` 或 `body_after_prefix`、默认 `total`、描述逐字为 “Controls whether the auto-compaction threshold counts the full active context (`total`, the default) or only growth after the carried compaction-window prefix (`body_after_prefix`).”；`compact_prompt` 为 `string`、描述 “Inline override for the history compaction prompt.”；`experimental_compact_prompt_file` 为 `string (path)`、描述 “Load the compaction prompt override from a file (experimental).”；四行都没有 `k`/`M` 一类后缀写法、取值范围或越界告警的说明',
      url: 'https://learn.chatgpt.com/docs/config-file/config-reference',
    },
    'claude-v21301-commands-changelog': {
      label:
        'Claude Code 更新日志（main 分支，固定到提交 `03b5892ee77de289bcd5dfa39f541525ade74aff`，1,036,155 字节，最新段为 `## 2.1.301`）：全文没有 preset、presets 或 quick dial 字样；与自定义命令相关的条目有 v2.1.299 的 “Fixed a custom slash command’s embedded shell line running twice when a newer message interrupted the command while its prompt was being checked”、“Changed `UserPromptSubmit` hooks to run before a skill or custom slash command expands, so a hook that blocks the prompt now also stops its embedded shell commands”、“Changed a skill’s own front-matter `UserPromptSubmit` hook to first run on the prompt after the one that invokes the skill”、“Changed skill and command loading: one whose file or folder name has hidden, direction-changing or blank-like characters, `<` or `>` is no longer offered until renamed; such a `name:` is ignored”，以及 v2.1.301 的 “Fixed skills and commands with very many or very long argument names stalling for seconds when invoked; only the first 64 names, each up to 64 characters, are now filled in”、“Fixed skills, commands and hooks using very large amounts of memory when their arguments fill many placeholders”、“Fixed skills no longer being listed to the model after using `/rewind`”、“Improved `/reload-skills` to say it re-sends the full skill list to Claude, which is how to get skills back after compaction”',
      url: 'https://github.com/anthropics/claude-code/blob/03b5892ee77de289bcd5dfa39f541525ade74aff/CHANGELOG.md',
    },
    'claude-prompt-caching': {
      label:
        'Claude Code Prompt caching（缓存生命周期、一小时 TTL 只给订阅内用量的主会话、压缩对缓存前缀的影响与空闲压缩条件）',
      url: 'https://code.claude.com/docs/en/prompt-caching',
    },
    'claude-idle-compaction-settings': {
      label:
        'Claude Code 设置参考 `idleCompaction`（五个生效条件、默认 `true`、`DISABLE_AUTO_COMPACT` 一并关闭、需 v2.1.290 及以上）',
      url: 'https://code.claude.com/docs/en/settings-reference#idlecompaction',
    },
    'claude-workflows': {
      label:
        'Claude Code Workflows（workflow agent 复用 Subagent 模型解析顺序、脚本为某个 stage 指定的模型算作每次调用值、`availableModels` 拦截时按同一替换规则改跑替代模型）',
      url: 'https://code.claude.com/docs/en/workflows',
    },
    'claude-ide': {
      label: 'Claude Code IDE integrations',
      url: 'https://code.claude.com/docs/en/ide-integrations',
    },
    'claude-tools': {
      label: 'Claude Code tools reference',
      url: 'https://code.claude.com/docs/en/tools-reference',
    },
    'claude-worktrees': {
      label: 'Claude Code worktrees',
      url: 'https://code.claude.com/docs/en/worktrees',
    },
    'claude-code-review': {
      label: 'Claude Code Review',
      url: 'https://code.claude.com/docs/en/code-review',
    },
    'claude-github-actions': {
      label: 'Claude Code GitHub Actions',
      url: 'https://code.claude.com/docs/en/github-actions',
    },
    'claude-model-config': {
      label: 'Claude Code model configuration',
      url: 'https://code.claude.com/docs/en/model-config',
    },
    'claude-auth': {
      label: 'Claude Code authentication and credential management',
      url: 'https://code.claude.com/docs/en/team',
    },
    'claude-gateway': {
      label: 'Claude Code LLM gateway',
      url: 'https://code.claude.com/docs/en/llm-gateway',
    },
    'claude-deployment-options': {
      label:
        'Claude Code Enterprise deployment overview（2026-10-17 复核，14,135 字节）：部署选项对比表列出六个推理位置——Claude for Teams/Enterprise、Anthropic Console、Amazon Bedrock、Claude Platform on AWS、`Google Cloud\'s Agent Platform, formerly Vertex AI` 与 Microsoft Foundry，并逐项给出计费（PAYG through AWS / AWS Marketplace / GCP / Azure）、区域、认证（`API key or AWS credentials`、`GCP credentials`、`API key or Microsoft Entra ID`）、成本追踪与企业能力；设置入口清单另有 Claude apps gateway，逐字为 “a self-hosted gateway that adds IdP sign-in in front of Amazon Bedrock, Claude Platform on AWS, Google Cloud\'s Agent Platform, Microsoft Foundry, or the Anthropic API”；“For Amazon Bedrock and Google Vertex AI, you can also run `claude` and select **3rd-party platform** at the login prompt to launch an interactive setup wizard.”；企业代理走 `HTTPS_PROXY`/`HTTP_PROXY`，LLM 网关走 `ANTHROPIC_BASE_URL`，两者可叠加',
      url: 'https://code.claude.com/docs/en/third-party-integrations',
    },
    'claude-bedrock-mantle': {
      label:
        'Claude Code Amazon Bedrock 页 “Use the Mantle endpoint” 一节（2026-10-17 复核，49,238 字节）：Mantle 逐字为 “an Amazon Bedrock endpoint that serves Claude models through the native Anthropic API shape rather than the Amazon Bedrock Invoke API”，复用同一份 AWS 凭据与 `awsAuthRefresh`；`CLAUDE_CODE_USE_MANTLE=1` 开启，`ANTHROPIC_BEDROCK_MANTLE_BASE_URL` 覆盖端点 URL；IAM 动作在 `bedrock-mantle:` 前缀下（`bedrock-mantle:CreateInference` 与 `bedrock-mantle:CountTokens`），文档明写 `bedrock:` 动作不覆盖它；`/status` 的 provider 行显示 `Amazon Bedrock (Mantle)`；模型 ID 形如 `anthropic.claude-sonnet-5`（带 `anthropic.` 前缀、不带版本后缀）；Fable、Sonnet 5 及以后、Opus 4.7 及以后在 Invoke API 与 Mantle 上都默认 1M token 上下文窗口',
      url: 'https://code.claude.com/docs/en/amazon-bedrock#use-the-mantle-endpoint',
    },
    'claude-provider-env-vars': {
      label:
        'Claude Code 环境变量页的 Provider 选择项（2026-10-17 复核，171,421 字节）：`CLAUDE_CODE_USE_ANTHROPIC_AWS`（Use Claude Platform on AWS）、`CLAUDE_CODE_USE_BEDROCK`、`CLAUDE_CODE_USE_FOUNDRY`（Use Microsoft Foundry）、`CLAUDE_CODE_USE_MANTLE`、`CLAUDE_CODE_USE_VERTEX`（说明文字已写作 Use Google Cloud\'s Agent Platform，链接仍指向 `/docs/en/google-vertex-ai`）；Claude Platform on AWS 另有 `ANTHROPIC_AWS_API_KEY`（AWS Console 生成的 Workspace API key，作为 `x-api-key` 发送且优先于 AWS SigV4）、`ANTHROPIC_AWS_BASE_URL`（默认 `https://aws-external-anthropic.{region}.api.aws`）、`ANTHROPIC_AWS_WORKSPACE_ID`（必填，每次请求作为 `anthropic-workspace-id` 头发送）与 `CLAUDE_CODE_SKIP_ANTHROPIC_AWS_AUTH`；`CLAUDE_CODE_PROVIDER_MANAGED_BY_HOST` 由嵌入 Claude Code 的宿主平台设置，设置后 Claude Code 忽略 `CLAUDE_CODE_USE_BEDROCK`、`ANTHROPIC_BASE_URL`、`ANTHROPIC_API_KEY` 等 Provider 选择、端点与认证变量；设置文件里只能新增变量不能删除，需在 `env` 块把如 `CLAUDE_CODE_USE_VERTEX` 设为空字符串来覆盖',
      url: 'https://code.claude.com/docs/en/env-vars',
    },
    'claude-settings': {
      label: 'Claude Code settings',
      url: 'https://code.claude.com/docs/en/settings',
    },
    'claude-settings-reference': {
      label: 'Claude Code settings reference',
      url: 'https://code.claude.com/docs/en/settings-reference',
    },
    'claude-managed-settings': {
      label: 'Claude Code server-managed settings',
      url: 'https://code.claude.com/docs/en/server-managed-settings',
    },
    'claude-env-vars': {
      label: 'Claude Code environment variables',
      url: 'https://code.claude.com/docs/en/env-vars',
    },
    'claude-auto-mode-config': {
      label:
        'Claude Code Configure auto mode（`autoMode` 的 `environment`/`allow`/`soft_deny`/`hard_deny` 四层优先级与 `"$defaults"`、只从用户/Managed/`--settings` 三个作用域读取、`/auto-mode-setup`、`claude auto-mode defaults|config|critique|reset`、`/permissions` 的 Auto mode 页签）',
      url: 'https://code.claude.com/docs/en/auto-mode-config',
    },
    'claude-auto-mode-billing': {
      label:
        'Claude Code Auto mode classifier request charges（服务端审查不额外计费、回退到 Claude Code 自己的 classifier 请求按 token 用量计费、`/status` 的 Auto mode server 行、`CLAUDE_CODE_AUTO_MODE_SERVER` 是可能移除的临时设置）',
      url: 'https://code.claude.com/docs/en/auto-mode-classifier-billing',
    },
    'claude-monitoring-usage': {
      label:
        'Claude Code Monitoring usage（OpenTelemetry `tool_decision` 事件属性表：`tool_name`、`tool_use_id`、`decision`、`tool_source`、`source` 六个取值与 `OTEL_LOG_TOOL_DETAILS=1` 下的 `tool_parameters`；核对日期没有 `classifier_verdict`、`classifier_category` 或 `permission_mode`）',
      url: 'https://code.claude.com/docs/en/monitoring-usage',
    },
    'claude-v21302-auto-mode-model-changelog': {
      label:
        'Claude Code v2.1.302 更新日志（固定到提交 `c017428c8c27e604840435048d5bce6a9a22c040`）：`CLAUDE_CODE_AUTO_MODE_MODEL`、服务端 classifier 遇过长对话改为压缩、`classifier_category` 缺失与 `OTEL_LOGRECORD_ATTRIBUTE_COUNT_LIMIT` 偏低时挤掉旧属性的修复、`claude -p` 与 Agent SDK 无权限模式时的启动模式改动',
      url: 'https://github.com/anthropics/claude-code/blob/c017428c8c27e604840435048d5bce6a9a22c040/CHANGELOG.md',
    },
    'claude-v21301-classifier-telemetry-changelog': {
      label:
        'Claude Code v2.1.301 更新日志（固定到提交 `03b5892ee77de289bcd5dfa39f541525ade74aff`）：`tool_decision` 事件新增 `classifier_verdict` 与 `permission_mode`，以及 `OTEL_LOG_TOOL_DETAILS=1` 下新增 `classifier_category`',
      url: 'https://github.com/anthropics/claude-code/blob/03b5892ee77de289bcd5dfa39f541525ade74aff/CHANGELOG.md',
    },
    'claude-v21302-release': {
      label: 'Claude Code v2.1.302 Release（2026-10-16T20:53:06Z 发布）',
      url: 'https://github.com/anthropics/claude-code/releases/tag/v2.1.302',
    },
    'claude-v21302-hooks-concurrency-changelog': {
      label:
        'Claude Code v2.1.302 更新日志（固定到提交 `c017428c8c27e604840435048d5bce6a9a22c040`）：与生命周期 Hooks 相关的一条逐字为 “Changed prompt and agent hooks so that at most 12 of one event run at a time; the rest wait their turn”，该段没有说明 command、http 与 `mcp_tool` 三类 Handler 是否同受这个上限、12 是按事件还是按会话计，也没有说明排队等待的时间是否计入 Hook 自身的 `timeout`',
      url: 'https://github.com/anthropics/claude-code/blob/c017428c8c27e604840435048d5bce6a9a22c040/CHANGELOG.md',
    },
    'claude-v21303-release': {
      label:
        'Claude Code v2.1.303 Release（2026-10-18T22:26:54Z 发布，核对日期最新 Release）：main 分支更新日志的 `## 2.1.303` 段只有一条 “Bug fixes and reliability improvements”，没有任何 Hook 事件、Handler 或并发条目',
      url: 'https://github.com/anthropics/claude-code/releases/tag/v2.1.303',
    },
    'claude-cli-reference': {
      label: 'Claude Code CLI reference（`--autocompact` 与 `--agents`）',
      url: 'https://code.claude.com/docs/en/cli-reference',
    },
    'claude-cli-reference-daemon': {
      label:
        'Claude Code CLI reference（2026-10-22 抓取，48,250 字节）`claude` 子命令表里的四行 daemon 命令逐字为 “`claude daemon logs` | Follow the background-session supervisor\'s log file, `~/.claude/daemon.log`, printing new lines as they arrive until you press `Ctrl+C`”、“`claude daemon run` | Run the background-session supervisor in the foreground of this terminal, printing its log”、“`claude daemon status` | Print the background-session supervisor\'s state, version, socket directory, and worker count for diagnostics. Exits 1 if the supervisor isn\'t running” 与 “`claude daemon stop --any` | Stop the background-session supervisor and the sessions it hosts. Pass `--keep-workers` to leave background sessions running for the next supervisor to reconnect to. `--any` confirms stopping an on-demand supervisor, which is the default. Use this to recover from an unresponsive supervisor”；同页 `claude respawn <id>` 一行写 “Restart a background session, running or stopped, with its conversation intact. Use `--all` to restart every running session, e.g. to pick up an updated Claude Code binary”；该页没有任何 `claude mcp serve` 子命令，`claude mcp` 下只有 `login <name>` 与 `logout <name>`',
      url: 'https://code.claude.com/docs/en/cli-reference',
    },
    'claude-agent-view': {
      label:
        'Claude Code Agent view（2026-10-22 抓取，143,172 字节）“The supervisor process” 一节逐字为 “The supervisor is a background service that runs your background sessions so they keep working after you close agent view or your terminal. Claude Code starts it the first time you background a session or open agent view, and you don\'t need to manage it yourself.”；“Where state is stored” 表四行为 `~/.claude/daemon.log`（Supervisor log）、`~/.claude/daemon/roster.json`（List of running background sessions, used to reconnect after a restart）、`~/.claude/jobs/<id>/state.json` 与 `~/.claude/jobs/<id>/tmp/`；“Manage sessions from the shell” 表含 `claude daemon status`/`logs`/`stop --any` 三行；另有 “To inspect this state without reading the files directly, run `claude daemon status`. It reports whether the supervisor is reachable, its process ID and version, the socket directory, and how many background sessions are live.”、“The command also warns when the running supervisor is on a different version than the `claude` you invoked, which happens after an update the supervisor hasn\'t restarted into yet. The warning shows both versions and tells you to run `claude daemon stop --any` to pick up the new version.”、“After an auto-update: the supervisor restarts itself onto the new version and moves idle sessions over in the background.”、“If you set `CLAUDE_CONFIG_DIR`, the supervisor uses that directory instead of `~/.claude` and runs as a separate instance with its own sessions.” 与 supervisor 自身被外部结束时 “on macOS and Linux, your sessions stop unless a new supervisor connects within about a minute. To start one, run `claude agents` in your shell.”；排障表两次要求删 `~/.claude/daemon.lock`，并写 “Claude Code started with `daemon` is a supervisor, so run `kill -9 <pid>`.”',
      url: 'https://code.claude.com/docs/en/agent-view',
    },
    'claude-v21300-daemon-stop-changelog': {
      label:
        'Claude Code 官方仓库 `CHANGELOG.md`（固定到提交 `5ed799e5cc56bea9efff57398ca43e31d82784ff`，2026-10-22T04:34:32Z）全文只有两条含 daemon 字样，都在 `## 2.1.300` 段下，逐字为 “Fixed `claude daemon stop --any` printing \"stopped\" while a stuck background service kept running: it now waits, force-kills the service, and says so with exit 1 if it is still there” 与 “Fixed `claude daemon stop` exiting with no output, and leaving sessions listed as running, when telemetry is turned off”；更新日志里没有任何 “Added `claude daemon`” 一类引入条目，因此该命令族的引入版本未确认',
      url: 'https://github.com/anthropics/claude-code/blob/5ed799e5cc56bea9efff57398ca43e31d82784ff/CHANGELOG.md',
    },
    'claude-v21308-release': {
      label:
        'Claude Code Release [v2.1.308](https://github.com/anthropics/claude-code/releases/tag/v2.1.308)（2026-10-22T04:34:55Z 发布，核对日期最新 Release）；v2.1.306 至 v2.1.308 三版都没有 daemon 或 supervisor 相关条目',
      url: 'https://github.com/anthropics/claude-code/releases/tag/v2.1.308',
    },
    'claude-keybindings': {
      label: 'Claude Code keybindings',
      url: 'https://code.claude.com/docs/en/keybindings',
    },
    'claude-sandbox-strict-allowlist': {
      label: 'Claude Code v2.1.219 changelog',
      url: 'https://github.com/anthropics/claude-code/blob/0c188278cdf9/CHANGELOG.md',
    },
    'claude-v21305-nested-userns-changelog': {
      label:
        'Claude Code 官方仓库 `CHANGELOG.md`（固定到提交 `49b8c35f8c57493c2f0eba1429ccaa9638ab8712`，2026-10-20T20:46:27Z，提交说明 “chore: Update CHANGELOG.md and feed.xml”，只改 `CHANGELOG.md` 与 `feed.xml`）`## 2.1.305` 段下逐字为 “Added `sandbox.allowNestedUserNamespaces` so sandboxed commands on Linux can create user namespaces (Chromium, rootless podman); this lets them get around the sandbox\'s file protections”；同段另一条为 “Added `CLAUDE_CODE_RETRY_WATCHDOG_USAGE_LIMIT_RECHECK_MS` so unattended retry mode (`CLAUDE_CODE_RETRY_WATCHDOG`) notices a usage limit that was lifted before its reset”',
      url: 'https://github.com/anthropics/claude-code/blob/49b8c35f8c57493c2f0eba1429ccaa9638ab8712/CHANGELOG.md',
    },
    'claude-v21305-release': {
      label:
        'Claude Code Release [v2.1.305](https://github.com/anthropics/claude-code/releases/tag/v2.1.305)（2026-10-20T20:46:50Z 发布）；核对日期最新 Release 为 v2.1.306（2026-10-21T03:16:31Z），其更新日志两条都是修复、没有沙箱条目',
      url: 'https://github.com/anthropics/claude-code/releases/tag/v2.1.305',
    },
    'claude-sandbox-weaker-nested': {
      label:
        'Claude Code 官方 Sandboxing 页 “Bubblewrap fails to start inside a container” 一节（2026-10-21 抓取，95,397 字节）逐字为 “In an unprivileged container, bubblewrap can\'t mount a fresh `/proc` filesystem, so sandboxed commands fail with a `bwrap` error such as `Can\'t mount proc on /newroot/proc: Operation not permitted`. Set `enableWeakerNestedSandbox` to `true` so the sandbox bind-mounts the container\'s existing `/proc` instead. Only use this setting when the outer container already provides the isolation boundary you need, since the setting exposes process information to sandboxed commands that a fresh `/proc` mount would hide.”；同页 “Security limitations” 一节逐字为 “**Linux sandbox strength**: the Linux implementation provides strong filesystem and network isolation but includes an `enableWeakerNestedSandbox` mode that enables it to work inside Docker environments without privileged namespaces. This option considerably weakens security and should only be used when additional isolation is otherwise enforced.”；该页全文没有 `allowNestedUserNamespaces` 字样',
      url: 'https://code.claude.com/docs/en/sandboxing#bubblewrap-fails-to-start-inside-a-container',
    },
    'claude-sandbox-apparmor-userns': {
      label:
        'Claude Code 官方 Sandboxing 页 “Set up Linux and WSL2” 一节的提示块（2026-10-21 抓取）标题逐字为 “**Ubuntu 24.04 and later: allow bubblewrap to create user namespaces**”，正文逐字为 “On Ubuntu 24.04 and later, the default AppArmor policy prevents bubblewrap from creating the user namespaces it needs for isolation.” 与 “To check whether your environment enforces this restriction, including inside WSL2, run `sysctl kernel.apparmor_restrict_unprivileged_userns`. If the command returns `0`, skip this step. If it prints a `No such file or directory` error, the key doesn\'t exist and you can skip this step. If it returns `1`, add an AppArmor profile that grants `bwrap` this capability:”，给出的 profile 写入 `/etc/apparmor.d/bwrap`，内容为 `abi <abi/4.0>,`、`include <tunables/global>` 与 `profile bwrap /usr/bin/bwrap flags=(unconfined) { userns, include if exists <local/bwrap> }`；同页 “OS-level enforcement” 一节逐字为 macOS “uses Seatbelt for sandbox enforcement”、Linux “uses [bubblewrap](https://github.com/containers/bubblewrap) for isolation”、WSL2 “uses bubblewrap, same as Linux”，依赖为 `bubblewrap` 与 `socat`',
      url: 'https://code.claude.com/docs/en/sandboxing#set-up-linux-and-wsl2',
    },
    'claude-sandbox-weakening-keys': {
      label:
        'Claude Code 官方 Sandboxing 页 “Keep developers from widening the policy” 一节（2026-10-21 抓取）逐字为 “Unless managed settings set them, a developer\'s user settings or `--settings` can turn on the following keys. A repository\'s `.claude/settings.json` can too, unless the sandbox is admin-required. Each one weakens the sandbox, so set it to `false` in managed settings if you don\'t want it used:”，其下五项为 `enableWeakerNestedSandbox`、`enableWeakerNetworkIsolation`、`network.allowAllUnixSockets`、`network.allowLocalBinding` 与 `allowAppleEvents`（后者注明 “which a repository can\'t turn on”）；“Repository settings under an admin-required sandbox” 一节的忽略表把 `enableWeakerNestedSandbox`、`enableWeakerNetworkIsolation`、`network.allowAllUnixSockets`、`network.allowLocalBinding` 四行记为忽略仓库文件里的 `true`、而 “A `false` still applies”；官方 Settings 参考页索引表 `sandbox.enableWeakerNestedSandbox` 行描述为 “Run the Linux sandbox inside an unprivileged container”、作用域 “Any file”，同页另有 `sandbox.bwrapPath`（“Point the sandbox at a bubblewrap binary outside `PATH`”，作用域 Managed），但索引表没有 `sandbox.allowNestedUserNamespaces` 行',
      url: 'https://code.claude.com/docs/en/sandboxing#keep-developers-from-widening-the-policy',
    },
    'claude-credential-file-mask': {
      label: 'Claude Code v2.1.221 changelog',
      url: 'https://github.com/anthropics/claude-code/blob/dd796139237c/CHANGELOG.md',
    },
    'claude-credential-mask-v224': {
      label: 'Claude Code v2.1.224 changelog',
      url: 'https://github.com/anthropics/claude-code/blob/66edf5358349/CHANGELOG.md',
    },
    'claude-review-alias': {
      label: 'Claude Code v2.1.223 changelog',
      url: 'https://github.com/anthropics/claude-code/blob/5cf69b18c86d/CHANGELOG.md',
    },
    'claude-ultrareview': {
      label: 'Claude Code ultrareview',
      url: 'https://code.claude.com/docs/en/ultrareview',
    },
    'claude-v21288-max-findings-changelog': {
      label: 'Claude Code v2.1.288 `--max-findings` 更新日志',
      url: 'https://github.com/anthropics/claude-code/blob/1c229fcd1e1e/CHANGELOG.md',
    },
    'claude-v21290-review-changelog': {
      label: 'Claude Code v2.1.290 `/code-review` medium 覆盖范围更新日志',
      url: 'https://github.com/anthropics/claude-code/blob/e8ae451830fb/CHANGELOG.md',
    },
    'claude-v21292-effort-changelog': {
      label: 'Claude Code v2.1.292 Agent 工具 `effort` 参数更新日志',
      url: 'https://github.com/anthropics/claude-code/blob/fbe20e00e285/CHANGELOG.md',
    },
    'claude-cross-session-messaging': {
      label: 'Claude Code cross-session messaging',
      url: 'https://code.claude.com/docs/en/cross-session-messaging',
    },
    'claude-messaging-v224': {
      label: 'Claude Code v2.1.224 changelog (SendMessage)',
      url: 'https://github.com/anthropics/claude-code/blob/66edf5358349/CHANGELOG.md',
    },
    'claude-messaging-v225': {
      label: 'Claude Code v2.1.225 changelog (SendMessage by name)',
      url: 'https://github.com/anthropics/claude-code/blob/53f9910f6ef0/CHANGELOG.md',
    },
    'claude-messaging-v229': {
      label: 'Claude Code v2.1.229 changelog (ListAgents status labels)',
      url: 'https://github.com/anthropics/claude-code/blob/992381936817/CHANGELOG.md',
    },
    'claude-messaging-v232': {
      label: 'Claude Code v2.1.232 changelog (@ mentions and bare-name delivery)',
      url: 'https://github.com/anthropics/claude-code/blob/1f6015b5d578/CHANGELOG.md',
    },
    'claude-messaging-v236': {
      label: 'Claude Code v2.1.236 changelog (SendMessage notify_when_idle)',
      url: 'https://github.com/anthropics/claude-code/blob/084ca20bcf90/CHANGELOG.md',
    },
    'claude-messaging-v238': {
      label: 'Claude Code v2.1.238 changelog (inbound refusal and drop reporting)',
      url: 'https://github.com/anthropics/claude-code/blob/8a8e81d098cb/CHANGELOG.md',
    },
    'claude-messaging-v239': {
      label: 'Claude Code v2.1.239 changelog (Windows cross-session messaging)',
      url: 'https://github.com/anthropics/claude-code/blob/16440d0f6ee8/CHANGELOG.md',
    },
    'claude-subagent-fork-v232': {
      label: 'Claude Code v2.1.232 changelog (subagent forking by default)',
      url: 'https://github.com/anthropics/claude-code/blob/1f6015b5d578/CHANGELOG.md',
    },
    'claude-self-hosted': {
      label: 'Claude Code self-hosted environments',
      url: 'https://code.claude.com/docs/en/self-hosted-environments',
    },
    'claude-self-hosted-quickstart': {
      label: 'Claude Code self-hosted environments quickstart',
      url: 'https://code.claude.com/docs/en/self-hosted-environments-quickstart',
    },
    'claude-self-hosted-reference': {
      label: 'Claude Code self-hosted environments reference',
      url: 'https://code.claude.com/docs/en/self-hosted-environments-reference',
    },
    'claude-self-hosted-v224': {
      label: 'Claude Code v2.1.224 changelog (self-hosted environments)',
      url: 'https://github.com/anthropics/claude-code/blob/66edf5358349/CHANGELOG.md',
    },
    'claude-bash-memory-limit': {
      label: 'Claude Code v2.1.233 changelog (Bash memory cgroup)',
      url: 'https://github.com/anthropics/claude-code/blob/0fa8c19d50f7/CHANGELOG.md',
    },
    'claude-goal-v234': {
      label: 'Claude Code v2.1.234 changelog (/goal self-clear and background check-in)',
      url: 'https://github.com/anthropics/claude-code/blob/354757e5b2d9/CHANGELOG.md',
    },
    'claude-goal-v239': {
      label: 'Claude Code v2.1.239 changelog (/goal resume restore and check-in backoff)',
      url: 'https://github.com/anthropics/claude-code/blob/16440d0f6ee8/CHANGELOG.md',
    },
    'claude-goal-v246': {
      label: 'Claude Code v2.1.246 changelog (/goal idle check-in limit)',
      url: 'https://github.com/anthropics/claude-code/blob/005c5dade90c/CHANGELOG.md',
    },
    'claude-default-model-v236': {
      label: 'Claude Code v2.1.236 changelog (ANTHROPIC_DEFAULT_MODEL)',
      url: 'https://github.com/anthropics/claude-code/blob/084ca20bcf90/CHANGELOG.md',
    },
    'claude-model-picker-v243': {
      label: 'Claude Code v2.1.243 changelog (modelPicker)',
      url: 'https://github.com/anthropics/claude-code/blob/8b6ef81f636a/CHANGELOG.md',
    },
    'claude-output-styles': {
      label: 'Claude Code output styles',
      url: 'https://code.claude.com/docs/en/output-styles',
    },
    'claude-concise-v237': {
      label: 'Claude Code v2.1.237 changelog (Concise output style)',
      url: 'https://github.com/anthropics/claude-code/blob/770933ea1ad2/CHANGELOG.md',
    },
    'claude-channels': {
      label: 'Claude Code Channels',
      url: 'https://code.claude.com/docs/en/channels',
    },
    'claude-channels-reference': {
      label: 'Claude Code Channels reference',
      url: 'https://code.claude.com/docs/en/channels-reference',
    },
    'codex-commands': {
      label: 'Codex CLI commands',
      url: 'https://developers.openai.com/codex/cli/slash-commands',
    },
    'codex-config-panel-commit': {
      label:
        'Codex `/config` 偏好面板合并提交（`cc7ba33601286a751477832b01de7b6f8de0dd9c`，PR #52990，2026-10-10）',
      url: 'https://github.com/openai/codex/commit/cc7ba33601286a751477832b01de7b6f8de0dd9c',
    },
    'codex-config-panel-pr': {
      label:
        'Codex PR #52990（Add a searchable `/config` preferences panel to the TUI）',
      url: 'https://github.com/openai/codex/pull/52990',
    },
    'codex-slash-command-cc7ba33': {
      label:
        'Codex `/config` 命令定义与可用性判定源码（`SlashCommand::Config`，描述 “configure Codex preferences”）',
      url: 'https://github.com/openai/codex/blob/cc7ba33601286a751477832b01de7b6f8de0dd9c/codex-rs/tui/src/slash_command.rs',
    },
    'codex-config-panel-catalog': {
      label:
        'Codex `/config` 面板设置目录源码（五个 `ConfigSection`、每项 label/description/keywords 与当前值显示）',
      url: 'https://github.com/openai/codex/blob/cc7ba33601286a751477832b01de7b6f8de0dd9c/codex-rs/tui/src/config_panel/mod.rs',
    },
    'codex-config-panel-render': {
      label:
        'Codex `/config` 面板渲染源码（标题 “Configuration”、搜索占位符 “Type to search settings”、页脚提示与选项标签）',
      url: 'https://github.com/openai/codex/blob/cc7ba33601286a751477832b01de7b6f8de0dd9c/codex-rs/tui/src/config_panel/render.rs',
    },
    'codex-config-panel-toggle': {
      label:
        'Codex `/config` 开关项到 `config.toml` 键的映射源码（`tui.animations`、`tui.auto_recap`、`tui.copy_on_select_clear_selection`、`tui.disable_paste_burst`、`tui.vim_mode_default`、`tui.status_line_use_colors`、`tui.show_tooltips`、`tui.effects.starfield`）',
      url: 'https://github.com/openai/codex/blob/cc7ba33601286a751477832b01de7b6f8de0dd9c/codex-rs/tui/src/config_panel/toggle.rs',
    },
    'codex-config-panel-app': {
      label:
        'Codex `/config` 面板保存提示与通知测试源码（`Saved · restart Codex to apply`、`Could not save:` 等）',
      url: 'https://github.com/openai/codex/blob/cc7ba33601286a751477832b01de7b6f8de0dd9c/codex-rs/tui/src/app/config_panel.rs',
    },
    'codex-config-edit': {
      label:
        'Codex 配置写入源码（`apply_blocking` 写 `codex_home` 下的 `config.toml`、符号链接解析与原子覆写）',
      url: 'https://github.com/openai/codex/blob/cc7ba33601286a751477832b01de7b6f8de0dd9c/codex-rs/core/src/config/edit.rs',
    },
    'codex-config-types': {
      label:
        'Codex `tui.copy_on_select_clear_selection`、`tui.copy_on_select` 与 `tui.right_click_paste` 字段定义源码',
      url: 'https://github.com/openai/codex/blob/cc7ba33601286a751477832b01de7b6f8de0dd9c/codex-rs/config/src/types.rs',
    },
    'codex-agents': {
      label: 'Codex Subagents',
      url: 'https://learn.chatgpt.com/docs/agent-configuration/subagents',
    },
    'codex-docs': {
      label: 'Codex Documentation',
      url: 'https://developers.openai.com/codex',
    },
    'codex-approvals': {
      label: 'Codex Agent approvals and security',
      url: 'https://learn.chatgpt.com/docs/agent-approvals-security',
    },
    'codex-config': {
      label: 'Codex Advanced Configuration',
      url: 'https://learn.chatgpt.com/docs/config-file/config-advanced',
    },
    'codex-provider-definitions': {
      label:
        'Codex Advanced Configuration 的 “Custom model providers” 一节（2026-10-17 复核）：逐字为 “A model provider defines how Codex connects to a model (base URL, wire API, authentication, and optional HTTP headers). Custom providers can’t reuse the reserved built-in provider IDs: `openai`, `ollama`, and `lmstudio`.”；示例用 `model_provider = "proxy"` 加 `[model_providers.proxy]`（`name`、`base_url`、`env_key`）定义代理、Ollama 与 Mistral；“Amazon Bedrock provider” 小节逐字为 “Codex includes a built-in `amazon-bedrock` model provider. Set it directly as `model_provider`; unlike custom providers, this built-in provider supports only the nested AWS profile and region overrides.”，配置形如 `model_provider = "amazon-bedrock"` 加 `[model_providers.amazon-bedrock.aws]` 的 `profile`/`region`，省略 `profile` 时走标准 AWS 凭据链；“OSS mode (local providers)” 小节写 `--oss` 让 Codex 跑本地开源 Provider（如 Ollama 或 LM Studio），单次运行用 `--local-provider` 选择、默认值写 `oss_provider`，两者都没设时交互式 CLI 提示选择而 `codex exec` 直接报错退出；Azure 以自定义 Provider 示例给出（`base_url` 形如 `https://YOUR_PROJECT_NAME.openai.azure.com/openai`、`env_key = "AZURE_OPENAI_API_KEY"`、`query_params = { api-version = "2025-04-01-preview" }`、`wire_api = "responses"`、`request_max_retries`/`stream_max_retries`/`stream_idle_timeout_ms`）；改内置 OpenAI Provider 的地址要用 `openai_base_url` 而不是新建 `[model_providers.openai]`（内置 ID 不可覆盖）；数据驻留项目可建 `openaidr` 这类自定义 Provider 改 `base_url` 前缀，而 ChatGPT workspace 的数据驻留不需要自定义 Provider；命令式取 token 的认证写 `[model_providers.<id>.auth]`（`command`、`args`、`cwd`、`timeout_ms`、`refresh_interval_ms`），命令不接收 stdin、必须把 token 打到 stdout，空 token 视为错误，`refresh_interval_ms = 0` 表示只在认证重试后刷新，且不能与 `env_key`、`experimental_bearer_token` 或 `requires_openai_auth` 同用；`supports_standalone_web_search` 对自定义 Provider 默认 `false`，设为 `true` 也不等于启用（仍需 Provider、模型与运行时都支持，且 `web_search` 模式与托管搜索限制继续生效）；项目级 `.codex/config.toml` 会忽略 `model_provider`、`model_providers`、`openai_base_url` 等键并在启动时告警，未受信任的项目连整个 `.codex/` 层都不加载',
      url: 'https://learn.chatgpt.com/docs/config-file/config-advanced#custom-model-providers',
    },
    'codex-provider-keys': {
      label:
        'Codex Configuration Reference 的 Provider 键（2026-10-17 复核）：`model_provider` 为 “Provider id from `model_providers` (default: `openai`)”；`model_providers.<id>` 为自定义 Provider 定义且 “Built-in provider IDs (`openai`, `ollama`, and `lmstudio`) are reserved and cannot be overridden.”；`model_providers.<id>.wire_api` 只接受 `responses`、省略时即为默认值；`model_providers.amazon-bedrock.aws.profile` 与 `.aws.region` 分别写作 “AWS profile name used by the built-in amazon-bedrock provider” 与 “AWS region used by the built-in amazon-bedrock provider”；`oss_provider` 取值 `lmstudio | ollama`、描述为 “Default local provider used when running with `--oss` (defaults to prompting if unset)”；`openai_base_url` 为 “Base URL override for the built-in openai model provider”；其余 Provider 子键包括 `name`、`base_url`、`env_key`、`env_key_instructions`、`experimental_bearer_token`、`requires_openai_auth`、`http_headers`、`env_http_headers`、`query_params`、`request_max_retries`（默认 4）、`stream_max_retries`（默认 5）、`stream_idle_timeout_ms`（默认 300000）、`model_catalog_url`、`supports_websockets`、`supports_standalone_web_search`、`capabilities.external_web_access` 与 `capabilities.remote_compaction`（`unsupported | v2`）',
      url: 'https://learn.chatgpt.com/docs/config-file/config-reference',
    },
    'codex-memories': {
      label: 'Codex Memories',
      url: 'https://learn.chatgpt.com/docs/customization/memories',
    },
    'codex-noninteractive': {
      label: 'Codex Non-interactive mode',
      url: 'https://learn.chatgpt.com/docs/non-interactive-mode',
    },
    'codex-sdk': {
      label: 'Codex SDK',
      url: 'https://learn.chatgpt.com/docs/codex-sdk',
    },
    'codex-app-server': {
      label: 'Codex App Server',
      url: 'https://learn.chatgpt.com/docs/app-server',
    },
    'codex-mcp-server': {
      label: 'Codex as an MCP server',
      url: 'https://learn.chatgpt.com/docs/mcp-server',
    },
    'codex-developer-commands': {
      label:
        'Codex Developer commands（`codex remote-control start` “start the local app-server daemon with remote control enabled”、CLI 子命令表与内置 Slash 命令表）',
      url: 'https://learn.chatgpt.com/docs/developer-commands?surface=cli',
    },
    'codex-daemon-readme': {
      label:
        'Codex app-server daemon README（`codex app-server daemon start|restart|update|enable-remote-control|disable-remote-control|stop|version|bootstrap`、`CODEX_HOME/app-server-daemon/settings.json` 的 `remoteControlEnabled`/`shutdownGraceSeconds`/`updater.*`、pid 与 lock 文件、自动更新条件与内嵌服务器回退）',
      url: 'https://github.com/openai/codex/blob/3b6ab3471a2d4d994c9fad322fca749564bc05e0/codex-rs/app-server-daemon/README.md',
    },
    'codex-daemon-menu-commit': {
      label:
        'Codex `/daemon` 菜单合并提交（`04581f96044a9fe6062593c4d557036477aee961`，PR #45854，2026-09-16，标题 “Add `/daemon` menu for local background server updates”）',
      url: 'https://github.com/openai/codex/commit/04581f96044a9fe6062593c4d557036477aee961',
    },
    'codex-daemon-settings-source': {
      label:
        'Codex daemon 设置源码（`codex-rs/app-server-daemon/src/settings.rs`，固定到 main 提交 `40db507eeca2ff778c040c325449eb72e90c0590`，2026-10-22T19:54:04Z）常量逐字为 `pub(crate) const DEFAULT_UPDATE_INTERVAL_MINUTES: u32 = 60;`、`pub(crate) const DEFAULT_SHUTDOWN_GRACE_SECONDS: u32 = 60;` 与 `pub(crate) const MAX_SHUTDOWN_GRACE_SECONDS: u32 = 5 * 60;`，`UpdaterSettings` 的 `update_interval_minutes` 带 `#[serde(default = "default_update_interval_minutes")]`、`StoredSettings` 的 `shutdown_grace_seconds` 带 `#[serde(default = "default_shutdown_grace_seconds")]`，校验为 `ensure!(seconds <= MAX_SHUTDOWN_GRACE_SECONDS, "shutdown grace must be between 0 and {MAX_SHUTDOWN_GRACE_SECONDS} seconds")` 与 `ensure!(self.update_interval_minutes > 0, "update interval must be positive")`；同一提交的 `codex-rs/app-server-daemon/README.md` 示例 JSON 把 `updateIntervalMinutes` 写成 `120`，而正文写 “Eligible managed daemons check for updates after five minutes, then hourly by default.”，即 README 示例与 crate 常量不一致，默认值以源码的 60 为准',
      url: 'https://github.com/openai/codex/blob/40db507eeca2ff778c040c325449eb72e90c0590/codex-rs/app-server-daemon/src/settings.rs',
    },
    'codex-daemon-restart-commit': {
      label:
        'Codex 重启被管理后台服务器的合并提交（`27065a91ccbf5ba8532844be3777fcf83b77820d`，PR #53173，2026-10-11，标题 “Allow restarting managed background servers from the TUI”）',
      url: 'https://github.com/openai/codex/commit/27065a91ccbf5ba8532844be3777fcf83b77820d',
    },
    'codex-daemon-menu-source': {
      label:
        'Codex `/daemon` 菜单源码（`daemon_menu.rs`：菜单标题 “Daemon”、三项条目、重启与更新确认文案、远程连接与无 CLI 可执行文件时的禁用原因）',
      url: 'https://github.com/openai/codex/blob/27065a91ccbf5ba8532844be3777fcf83b77820d/codex-rs/tui/src/app/daemon_menu.rs',
    },
    'codex-daemon-startup-tests': {
      label:
        'Codex daemon 启动集成测试（`daemon_startup.rs`：`Server: Local background server` 状态行、`--disable daemon_auto_start`、特征设置不兼容时的内嵌/重启/取消三分支与 `featureOverrides` 写入）',
      url: 'https://github.com/openai/codex/blob/27065a91ccbf5ba8532844be3777fcf83b77820d/codex-rs/cli/tests/daemon_startup.rs',
    },
    'codex-slash-command-v01621': {
      label:
        'Codex rust-v0.162.1 标签的 Slash 命令枚举（含 `Daemon` 变体与描述 “Manage the local background server”）',
      url: 'https://github.com/openai/codex/blob/rust-v0.162.1/codex-rs/tui/src/slash_command.rs',
    },
    'codex-app': {
      label: 'ChatGPT desktop app',
      url: 'https://learn.chatgpt.com/docs/app',
    },
    'codex-app-linux': {
      label: 'ChatGPT desktop app for Linux（preview）',
      url: 'https://learn.chatgpt.com/docs/linux/linux-app',
    },
    'codex-cloud': {
      label: 'Codex cloud',
      url: 'https://learn.chatgpt.com/docs/cloud',
    },
    'codex-troubleshooting': {
      label: 'Codex Troubleshooting',
      url: 'https://learn.chatgpt.com/docs/reference/troubleshooting',
    },
    'codex-cli-customization': {
      label: 'Codex CLI customization（无检查点或回退命令，只记 `Ctrl+G` 外部编辑器）',
      url: 'https://learn.chatgpt.com/docs/cli-customization',
    },
    'codex-mcp': {
      label: 'Codex MCP',
      url: 'https://learn.chatgpt.com/docs/extend/mcp',
    },
    'codex-mcp-catalog': {
      label: 'Codex MCP discovery item limit',
      url: 'https://github.com/openai/codex/commit/582569998181aad08a88bacc151a94b2048a5d1f',
    },
    'codex-skills': {
      label: 'Codex Agent Skills',
      url: 'https://learn.chatgpt.com/docs/build-skills',
    },
    'codex-hooks': {
      label: 'Codex Hooks',
      url: 'https://learn.chatgpt.com/docs/hooks',
    },
    'codex-plugins': {
      label: 'Codex Plugins',
      url: 'https://learn.chatgpt.com/docs/plugins',
    },
    'codex-plugin-search': {
      label: 'Codex remote plugin search (app-server)',
      url: 'https://github.com/openai/codex/commit/a850875a8eb603d18cb14cb2c5e80c930de9bd48',
    },
    'codex-portable-plugins': {
      label: 'Codex portable Agent Plugin manifest',
      url: 'https://github.com/openai/codex/commit/2b5bdcf67547860f2e5c5a605009a70026796b2b',
    },
    'codex-agents-md': {
      label: 'Codex AGENTS.md',
      url: 'https://learn.chatgpt.com/docs/agent-configuration/agents-md',
    },
    'codex-custom-prompts': {
      label: 'Codex Custom prompts',
      url: 'https://learn.chatgpt.com/docs/custom-prompts',
    },
    'codex-presets-commit': {
      label:
        'Codex `/presets` 合并提交（`dcd9e954598cd5e9f80570204896d779c60c1ecd`，PR #54380 “Add `/presets` for reusable prompts and slash commands”，2026-10-15T18:51:21Z 合入 main；提交说明逐字含 “Add a TUI picker with ten numbered preset slots, an editor, and confirmation before replacement or deletion.”、“Create presets from composer text or current model, reasoning effort, and speed settings. Run saved inputs through the normal queued submission path while preserving the composer draft.” 与 “Persist presets under `tui.presets` in the active user configuration, respecting configuration layer ownership and leaving in-memory settings unchanged when writes fail.”）',
      url: 'https://github.com/openai/codex/commit/dcd9e954598cd5e9f80570204896d779c60c1ecd',
    },
    'codex-presets-slash-command': {
      label:
        'Codex `/presets` 命令定义源码（`SlashCommand::Presets`，`description` 分支逐字为 “run or save reusable prompts and slash commands”，无别名，`is_visible` 走 `_ => true`，在 `available_during_task` 的 `=> true` 分支里，但不在 `supports_inline_args`、`available_in_side_conversation` 与 `available_when_thread_unavailable` 三个 `matches!` 清单中，main HEAD `97ebf2d94d62`）',
      url: 'https://github.com/openai/codex/blob/97ebf2d94d62e2ff2045f3ea17b6e11eae9a21fb/codex-rs/tui/src/slash_command.rs',
    },
    'codex-presets-type': {
      label:
        'Codex `QuickDial` 类型与校验源码（结构体注释逐字 “One reusable prompt or slash command submitted through the TUI composer.”，`#[schemars(deny_unknown_fields, rename = "Preset")]`，字段 `pub input: String` 注释 “Plain-text input, limited to 8,000 UTF-8 bytes.” 与 `pub label: Option<String>` 注释 “Optional short name for the picker and shortcut hints.”；`validate()` 注释 “Keep stored inputs nonempty and below the context-item limit even with byte tokenization.”，三条报错逐字为 “Preset input cannot be empty.”、“Presets support prompts and slash commands, not shell commands.”（`trim_start()` 后以 `!` 开头）与 “Preset input cannot exceed 8,000 UTF-8 bytes.”；`Tui` 结构里 `#[serde(default, rename = "presets")] pub quick_dials: BTreeMap<String, QuickDial>` 的注释逐字为 “Saved inputs keyed by a single digit (`0` through `9`).”，该文件没有槽位数量常量，main `f847a4bd3c6c`）',
      url: 'https://github.com/openai/codex/blob/f847a4bd3c6ca3d8474a6e0dace1ed39f7ec0067/codex-rs/config/src/types.rs',
    },
    'codex-presets-persist': {
      label:
        'Codex 槽位持久化源码（文件头注释逐字 “Persist numbered prompts and slash commands in the active user configuration. Replace slots owned by the active user config. Clearing must not reveal a shadowed slot from another configuration layer.”；配置路径段为 `vec!["tui", "presets", <slot>]`，写入用 `ConfigEditsBuilder::for_config_path(self.local_settings.user_config_path)`，表内只有 `input` 与 `label` 两键且注释 “An explicit empty label masks labels inherited from lower layers.”，清空走 `ConfigEdit::ClearPath`；层归属判定比较 `ConfigLayerSource::User { file, .. }` 与 `user_config_path`，保存时只查最高层、清空时用 `slot_sources.any(outside_user_config)`；文案逐字为 “Preset {slot} is defined outside your user config. Edit its source configuration instead.”、“Failed to update preset {slot}: {}”、“Saved preset {slot}.” 与 “Deleted preset {slot}.”，失败与只读两条路径都调用 `restore_quick_dial_editor` 回填编辑器，main `dcd9e954598c`）',
      url: 'https://github.com/openai/codex/blob/dcd9e954598cd5e9f80570204896d779c60c1ecd/codex-rs/tui/src/app/quick_dials.rs',
    },
    'codex-presets-recall': {
      label:
        'Codex 槽位召回、菜单与设置预填源码（`recall_quick_dial` 先查 `quick_dials_available()`、再 `dial.validate()`（失败报 “Preset {slot}: {reason}”）、发 `AppEvent::FollowTranscript` 后调用 `queue_user_message_with_options(dial.input.into(), QueuedInputAction::ParseSlash, Vec::new())`，全程不触碰 composer 因而保留草稿；数字键分支匹配字符 `0` 到 `9`，槽位已占用时先置 `input_queue.suppress_queue_autosend = true` 再发 `AppEvent::RecallQuickDial`；菜单标题 “Presets”、空态 “No presets saved. Press n to create one.”、页脚五项 `n · new`、`s · from settings`、`e · edit`、`d · delete`、`esc · close`；`QuickDialEditorTarget` 只有 `PickSlot` 与 `Slot(u8)` 两个变体，编辑器标题 “New preset” 与 “Edit preset {slot}”、占位符 “Write a prompt or slash command”、选槽弹层 “Save preset to slot”、确认弹层 “{action} preset {slot}?” 配 `Save`/`Replace`/`Delete` 三个动作与 “{}\\n→ {}” 前后对照；预填弹层 “Start preset from current settings” 的四项为 “Current model”（生成 `/model <name>` 后按可用情况追加 `--reasoning=<effort>` 与 `--speed=<speed>`，缺省速度取 `standard`）、“Current permissions”（生成 `/permissions <profile_id> --approval-policy=<policy> --reviewer=<reviewer>`，profile 名经 `shlex::try_quote`）、“Current terminal title” 与 “Current status line”（共用 `status_surface_quick_dial`，条目为空时生成 `<command> --clear`，状态行另追加 `--colors` 或 `--no-colors`）；八条拒绝文案含 “The current model cannot be recalled with /model.”、“Choose an available reasoning effort with /model before saving.”、“Choose an available speed with /model before saving.”、“The approval policy cannot be recalled.”、“The permission profile name cannot be recalled.”、“Select a named permission profile with /permissions first.”、“Choose available terminal-title items with /title before saving.” 与 “Choose available status-line items with /statusline before saving.”；另有 “Images cannot be copied into a preset. Starting with empty text.”、“Linked mentions cannot be copied into a preset. Starting with empty text.”、“Presets are unavailable in this conversation.” 与 “Presets are available after startup completes.”，main `f847a4bd3c6c`）',
      url: 'https://github.com/openai/codex/blob/f847a4bd3c6ca3d8474a6e0dace1ed39f7ec0067/codex-rs/tui/src/chatwidget/quick_dials.rs',
    },
    'codex-presets-snapshot': {
      label:
        'Codex Presets 菜单渲染快照测试（`render_bottom_popup(&chat, 100)` 的输出：标题行 `Presets`，两列只列出已占用槽位如 `1 · coding`、`2 · /permissions workspace-write`、`5 · /skills simplify-code`、`0 · /status`，有 `label` 时显示 label、没有时显示 input 且过长以 `…` 截断，页脚为 `n · new   s · from settings   e · edit   d · delete   esc · close`，main `f847a4bd3c6c`）',
      url: 'https://github.com/openai/codex/blob/f847a4bd3c6ca3d8474a6e0dace1ed39f7ec0067/codex-rs/tui/src/chatwidget/snapshots/codex_tui__chatwidget__tests__quick_dial_shortcuts.snap',
    },
    'codex-presets-keymap-commit': {
      label:
        'Codex 快捷键菜单合并提交（`111362a6a0a92d08885b1ae62d3760714907ad94`，PR #54381 “Add a keyboard shortcut menu for presets”，2026-10-15T18:51:22Z 合入 main）：`codex-rs/config/src/tui_keymap.rs` 的 `TuiChatKeymap` 新增 `pub open_presets: Option<KeybindingsSpec>` 且注释逐字为 “Open saved prompts and slash commands.”，`codex-rs/core/config.schema.json` 的 `open_presets` 属性 `description` 同文，`codex-rs/tui/assets/tooltips.txt` 新增逐字 “Use {key:chat.open_presets}, then 0–9 to run a preset; Enter browses, s saves, and d deletes.”；提交说明逐字含 “Replace the `/presets` recall picker with a responsive menu above the composer. Press `0`–`9` to run a saved preset or create one in an empty slot; use `n`, `s`, `e`, and `d` to create, start from current settings, edit, and delete presets.” 与 “Add `tui.keymap.chat.open_presets` with an implicit `leader p` shortcut that yields to existing bindings and explicit configuration. Show the action in `/keymap` and add a shortcut tooltip.”',
      url: 'https://github.com/openai/codex/commit/111362a6a0a92d08885b1ae62d3760714907ad94',
    },
    'codex-presets-chord-defaults': {
      label:
        'Codex 隐式 `leader p` chord 安装源码（文件头注释逐字 “Install the implicit preset shortcut only for free leader chords. Explicit bindings, including an explicit unbind, always take priority. Implicit chords fit within the shared leader expansion limit.”；`keymap.chat.open_presets.is_some()` 或 leader 名额 `MAX_LEADER_CHORD_BINDINGS` 已用尽时直接返回，动作 ID 为 `{ context: KeymapContext::Chat, action: "open_presets" }`，绑定 `spec` 为 “leader p”、completion 为字符 `p`，与既有绑定重叠、与任一单键动作重叠或与 `KeymapContext::Pager` 的绑定同前缀时跳过（注释 “Owned transcript navigation also runs beside the composer.”），安装后同步 `resolved.chat.chord_hints`，main `f847a4bd3c6c`）',
      url: 'https://github.com/openai/codex/blob/f847a4bd3c6ca3d8474a6e0dace1ed39f7ec0067/codex-rs/tui/src/keymap/chords/quick_dial_defaults.rs',
    },
    'codex-presets-permissions-commit': {
      label:
        'Codex 权限预设合并提交（`36803b180a50e611331b75ff2b4c475c02846b53`，PR #54385 “Allow saving current permission settings as presets”，2026-10-15T18:51:22Z 合入 main）：`permission_discovery.rs` 的 `parse_permission_profile_args` 用 `slash_command_args::parse(args, &["--approval-policy", "--reviewer"], &[])` 解析且缺少位置参数时报错串逐字为 “Usage: /permissions <profile-id> [--approval-policy=<policy>] [--reviewer=user|auto_review]”，`parse_approval_policy` 把 `untrusted`/`on-request`/`never` 映射到 `AskForApproval::UnlessTrusted`/`OnRequest`/`Never`、其余按 `serde_json::from_str` 解析 granular 策略且失败报 “Unknown approval policy `{value}`. Expected `untrusted`, `on-request`, `never`, or a granular policy.”，`parse_reviewer` 只接受 `user` 与 `auto_review`、其余报 “Unknown permission reviewer `{value}`. Expected `user` or `auto_review`.”；提交说明逐字含 “Extend `/permissions` with `--approval-policy` and `--reviewer`, including granular policies and quoted profile names.”、“Share argument parsing between `/model` and `/permissions`, supporting quoted arguments and both `--setting=value` and `--setting value` forms.” 与 “Keep full-access confirmation for every reviewer and reject automatic review when unavailable.”',
      url: 'https://github.com/openai/codex/commit/36803b180a50e611331b75ff2b4c475c02846b53',
    },
    'codex-presets-statusline-commit': {
      label:
        'Codex 终端标题与状态行预设合并提交（`f847a4bd3c6ca3d8474a6e0dace1ed39f7ec0067`，PR #54388 “Add quick dial presets for terminal title and status line layouts”，2026-10-15T18:51:23Z 合入 main）：提交说明逐字为 “Add current terminal title and status line options to the preset picker. Generate `/title` and `/statusline` commands that preserve item order and duplicates, normalize item aliases, and retain the status line color setting. Use `--clear` for empty layouts and disable options containing unavailable items.”',
      url: 'https://github.com/openai/codex/commit/f847a4bd3c6ca3d8474a6e0dace1ed39f7ec0067',
    },
    'codex-presets-unreleased': {
      label:
        'Codex 标签 `rust-v0.163.0-alpha.10.2`（2026-10-15T18:26:31Z 发布，早于 `/presets` 四个合并提交）的 Slash 命令枚举没有 `Presets` 变体，`Title`、`Statusline`、`Permissions` 与 `Keymap` 都已在该标签中存在，即 `/presets` 尚未进入 Release',
      url: 'https://github.com/openai/codex/blob/rust-v0.163.0-alpha.10.2/codex-rs/tui/src/slash_command.rs',
    },
    'codex-ide': {
      label: 'Codex IDE extension',
      url: 'https://learn.chatgpt.com/docs/ide',
    },
    'codex-review': {
      label: 'Codex code review',
      url: 'https://learn.chatgpt.com/docs/code-review',
    },
    'codex-worktrees': {
      label: 'Codex worktrees',
      url: 'https://learn.chatgpt.com/docs/environments/git-worktrees',
    },
    'codex-github-action': {
      label: 'Codex GitHub Action',
      url: 'https://learn.chatgpt.com/docs/github-action',
    },
    'codex-github': {
      label: 'Codex GitHub integration',
      url: 'https://learn.chatgpt.com/docs/third-party/github',
    },
    'codex-auth': {
      label: 'Codex authentication',
      url: 'https://learn.chatgpt.com/docs/auth',
    },
    'codex-models': {
      label: 'Codex models',
      url: 'https://learn.chatgpt.com/docs/models',
    },
    'codex-config-reference': {
      label: 'Codex configuration reference',
      url: 'https://learn.chatgpt.com/docs/config-file/config-reference',
    },
    'codex-keymap-chords': {
      label: 'Codex TUI two-stroke key chords',
      url: 'https://github.com/openai/codex/commit/1e85ca099e4265bf89f4016772d299816e231bb3',
    },
    'codex-computer-use': {
      label: 'Codex Computer Use',
      url: 'https://learn.chatgpt.com/docs/computer-use',
    },
    'codex-tui-export': {
      label: 'Codex TUI Markdown conversation export',
      url: 'https://github.com/openai/codex/commit/2801d12661bea3c7ff1a6a39c810348222453a27',
    },
    'codex-exec-fork': {
      label: 'Codex exec session fork',
      url: 'https://github.com/openai/codex/commit/80858a8cce7f3ba0aaf6a76ad9462dca1604daeb',
    },
    'codex-v0162-release': {
      label: 'Codex rust-v0.162.0 发布说明（apply_patch 无条件保留换行）',
      url: 'https://github.com/openai/codex/releases/tag/rust-v0.162.0',
    },
    'codex-v01621-release': {
      label: 'Codex rust-v0.162.1 发布说明（New Features 与 Bug Fixes 都没有检查点或回退条目）',
      url: 'https://github.com/openai/codex/releases/tag/rust-v0.162.1',
    },
    'codex-apply-patch-unconditional': {
      label: 'Codex PR #51203（Make apply_patch preserve line endings unconditionally）合并提交',
      url: 'https://github.com/openai/codex/commit/685270a56a96c76ae5b0853373a19d6ed5bc6fd4',
    },
    'codex-apply-patch-text-file': {
      label: 'Codex apply_patch 换行保留机制源码（text_file.rs SourceFile）',
      url: 'https://github.com/openai/codex/blob/685270a56a96c76ae5b0853373a19d6ed5bc6fd4/codex-rs/apply-patch/src/text_file.rs',
    },
    'codex-apply-patch-exec-env': {
      label: 'Codex apply_patch 子进程环境注入源码（exec_env.rs）',
      url: 'https://github.com/openai/codex/blob/685270a56a96c76ae5b0853373a19d6ed5bc6fd4/codex-rs/core/src/exec_env.rs',
    },
    'codex-apply-patch-features': {
      label: 'Codex 功能登记册（apply_patch_preserve_line_endings 标记 Removed）',
      url: 'https://github.com/openai/codex/blob/685270a56a96c76ae5b0853373a19d6ed5bc6fd4/codex-rs/features/src/lib.rs',
    },
    'codex-apply-patch-guide': {
      label: 'Codex Apply Patch tool guide',
      url: 'https://developers.openai.com/api/docs/guides/tools-apply-patch',
    },
    'codex-auto-review': {
      label: 'Codex automatic approval reviews',
      url: 'https://learn.chatgpt.com/docs/sandboxing/auto-review',
    },
    'codex-approve-for-me': {
      label: 'Codex v0.147.0 release notes (--approve-for-me)',
      url: 'https://github.com/openai/codex/releases/tag/rust-v0.147.0',
    },
    'codex-approve-for-me-commit': {
      label: 'Codex --approve-for-me commit',
      url: 'https://github.com/openai/codex/commit/b7a61066081644e0d8b2c0b4dbfd7408ac1514df',
    },
    'codex-guardian-circuit-breaker': {
      label:
        'Codex `circuit_breaker.rs`（rust-v0.163.0 标签指向的提交 `83086188ae0614bd882818ff1aa23f3194962012`，2026-10-15T18:57:08Z 打标签）：五个常量为 `MAX_CONSECUTIVE_GUARDIAN_DENIALS_PER_TURN = 3`、`MAX_RECENT_AUTO_REVIEW_DENIALS_PER_TURN = 10`、`AUTO_REVIEW_DENIAL_WINDOW_SIZE = 50`，以及 Cyber 变体的 `MAX_CONSECUTIVE_CYBER_GUARDIAN_DENIALS_PER_TURN = 1` 与 `MAX_RECENT_CYBER_AUTO_REVIEW_DENIALS_PER_TURN = 1`',
      url: 'https://github.com/openai/codex/blob/83086188ae0614bd882818ff1aa23f3194962012/codex-rs/ext/guardian-reviewer/src/circuit_breaker.rs',
    },
    'codex-guardian-review-model': {
      label:
        'Codex `model.rs`（rust-v0.163.0，提交 `83086188ae0614bd882818ff1aa23f3194962012`）：`select_review_model` 先取 `parent_model.auto_review_model_override`、缺省用 `default_review_model_id`，该 id 不在模型目录里时回退父会话模型，并在受支持时把推理强度压到 `Low`；文件头注释逐字为 “Selects the synchronous review model from the parent\'s metadata and provider catalog.”',
      url: 'https://github.com/openai/codex/blob/83086188ae0614bd882818ff1aa23f3194962012/codex-rs/ext/guardian-reviewer/src/model.rs',
    },
    'codex-hooks-mcp-tool': {
      label: 'Codex hooks MCP tool handler commit',
      url: 'https://github.com/openai/codex/commit/85fc4def358b7df21883e72ae8dda43a0f572f32',
    },
    'codex-hooks-mcp-runner': {
      label: 'Codex hooks MCP tool runner source',
      url: 'https://github.com/openai/codex/blob/85fc4def358b7df21883e72ae8dda43a0f572f32/codex-rs/hooks/src/engine/mcp_runner.rs',
    },
    'codex-v0148-release': {
      label: 'Codex rust-v0.148.0 release notes (async hooks and MCP tool handler engine)',
      url: 'https://github.com/openai/codex/releases/tag/rust-v0.148.0',
    },
    'codex-hooks-session-mcp': {
      label: 'Codex session MCP tool hook enablement commit',
      url: 'https://github.com/openai/codex/commit/87070a77925cbffed8b34ddc99afaf40d56863aa',
    },
    'codex-hooks-mcp-route': {
      label: 'Codex hook MCP current-connection routing commit',
      url: 'https://github.com/openai/codex/commit/d35e5495f991508409ff30e38db8dbe49d565570',
    },
    'codex-hooks-model-request-commit': {
      label:
        'Codex 提交 `70b3bb6d8814ab3f2045238b4ae14c43da99783b`（PR #55144 “Add observation-only model request lifecycle hooks”，2026-10-18T22:36:47Z 合入 main，改动 46 个文件）：提交说明逐字为 “Add `PreModelRequest` and `PostModelRequest` hooks around model request attempts, including retries. Pass model, session, turn, and optional subagent context; report completion, failure, or cancellation with errors and token usage when available.”、“Treat hook output as diagnostic data without allowing it to veto requests or alter model context. Wait for synchronous post-request hooks before dispatching tools, while asynchronous hooks allow streaming tool dispatch to continue.” 与 “Apply memory-consolidation hook filtering and expose the new events through configuration, protocol schemas, generated clients, and the hooks browser.”；测试说明逐字为 “Add integration coverage for failures and retries, ignored control directives, cancellation, synchronous and asynchronous tool ordering, interrupted-turn resume and token accounting, and memory-consolidation filtering. Update hook schema fixtures and hooks browser snapshots.”',
      url: 'https://github.com/openai/codex/commit/70b3bb6d8814ab3f2045238b4ae14c43da99783b',
    },
    'codex-hooks-model-request-source': {
      label:
        'Codex `codex-rs/hooks/src/events/model_request.rs`（提交 `70b3bb6d8814`，5,034 字节，本次新增文件）：文件头注释逐字为 “//! Observation-only lifecycle hooks. Output is logged, never interpreted as control flow.”；`ModelRequestHookEvent` 以 `#[serde(tag = "hook_event_name")]` 分 `PreModelRequest` 与带 `status`/`error`/`token_usage` 三字段的 `PostModelRequest`，`ModelRequestStatus` 以 `#[serde(rename_all = "snake_case")]` 取 `Completed`/`Failed`/`Cancelled`；`ModelRequestHookInput` 的字段为 `session_id`、`turn_id`、`cwd`（`AbsolutePathBuf`）、`transcript_path`（`Option`）、`model` 与两个 `#[serde(skip_serializing_if = "Option::is_none")]` 的 `agent_id`/`agent_type`，事件本体 `#[serde(flatten)]`；`run()` 调 `dispatcher::select_handlers(&engine.handlers, request.event.hook_event(), /*matcher_input*/ None)`，命中为空直接返回；`parse_completed` 逐字为 `let status = if result.error.is_none() && result.exit_code == Some(0) { HookRunStatus::Completed } else { HookRunStatus::Failed };`，注释 “// Observer stdout is diagnostic, including any JSON that looks like a control directive.” 之后 stdout 只进 `tracing::debug!(stdout = %result.stdout, "model request hook output")`，stderr 与执行错误各压一条 `HookOutputEntryKind::Error`，返回的 `ParsedHandler` 的 `data` 恒为 `()`',
      url: 'https://github.com/openai/codex/blob/70b3bb6d8814ab3f2045238b4ae14c43da99783b/codex-rs/hooks/src/events/model_request.rs',
    },
    'codex-hooks-model-request-schema': {
      label:
        'Codex `codex-rs/hooks/schema/generated/model-request.command.input.schema.json`（提交 `70b3bb6d8814`，3,126 字节，本次新增文件）：`title` 为 `model-request.command.input`，顶层 `required` 为 `cwd`、`model`、`session_id`、`transcript_path`、`turn_id`，另有可选的 `agent_id` 与 `agent_type`；`oneOf` 两支分别是 `hook_event_name` 枚举 `PreModelRequest`（唯一必填项）与 `PostModelRequest`（`required` 为 `error`、`hook_event_name`、`status`、`token_usage`），`ModelRequestStatus` 枚举为 `completed`/`failed`/`cancelled`，`TokenUsage` 的 `required` 为 `cached_input_tokens`、`input_tokens`、`output_tokens`、`reasoning_output_tokens`、`total_tokens` 且 `cache_write_input_tokens` 默认 `0`',
      url: 'https://github.com/openai/codex/blob/70b3bb6d8814ab3f2045238b4ae14c43da99783b/codex-rs/hooks/schema/generated/model-request.command.input.schema.json',
    },
    'codex-hooks-model-request-config': {
      label:
        'Codex `codex-rs/config/src/hook_config.rs`（提交 `70b3bb6d8814`，9,032 字节）：`HookEventsToml` 新增 `#[serde(rename = "PreModelRequest", default)] pub pre_model_request: Vec<MatcherGroup>` 与 `#[serde(rename = "PostModelRequest", default)] pub post_model_request: Vec<MatcherGroup>`，`matcher_groups_mut` 的返回类型由 12 项变为 `[(HookEventName, &mut Vec<MatcherGroup>); 14]` 并把这两个事件排在最前；该文件没有任何按事件的默认超时或阻断分类，Handler 侧只有可选的 `timeout_sec: Option<u64>` 与 command 的 `r#async: bool`。对照标签 `rust-v0.164.0-alpha.3` 的同一文件（8,419 字节）：`matcher_groups_mut` 的返回类型是 `[(HookEventName, &mut Vec<MatcherGroup>); 12]`，`HookEventsToml` 的 12 个 serde 名是 `PreToolUse`、`PermissionRequest`、`PostToolUse`、`PreCompact`、`PostCompact`、`SessionStart`、`SessionEnd`、`UserPromptSubmit`、`SubagentStart`、`SubagentStop`、`Stop` 与 `Interrupt`，全文没有 `PreModelRequest` 或 `PostModelRequest`',
      url: 'https://github.com/openai/codex/blob/70b3bb6d8814ab3f2045238b4ae14c43da99783b/codex-rs/config/src/hook_config.rs',
    },
    'codex-hooks-model-request-dispatch': {
      label:
        'Codex `codex-rs/hooks/src/engine/dispatcher.rs`（提交 `70b3bb6d8814`，21,824 字节）：`select_handlers_for_matcher_inputs` 的 `matcher` 过滤把 `PreModelRequest`、`PostModelRequest` 与 `UserPromptSubmit`、`Stop`、`Interrupt` 这五个 `HookEventName` 合并进同一个直接返回 `true` 的 match 分支（源码是五个变体的或模式），即这两个事件不评估配置的 `matcher`；同步 Handler 全部放进 `FuturesUnordered` 一起启动、按完成顺序处理，文件内没有条数上限，`HookExecutionMode::Async` 的 Handler 交给 `engine.command_runtime.schedule_async_hook(...)` 后不等待',
      url: 'https://github.com/openai/codex/blob/70b3bb6d8814ab3f2045238b4ae14c43da99783b/codex-rs/hooks/src/engine/dispatcher.rs',
    },
    'codex-hooks-model-request-timeout': {
      label:
        'Codex `codex-rs/hooks/src/engine/discovery.rs`（提交 `70b3bb6d8814`，67,601 字节）：`normalize_command_hook` 的文档注释逐字为 “/// Normalizes hook timeouts. SessionEnd and Interrupt default to one second and are capped at three /// seconds; all other hooks keep the standard ten-minute default.”，实现只有 `SessionEnd` 与 `Interrupt` 两个事件组成的一个具名分支（`clamp(1, SESSION_END_MAX_TIMEOUT_SEC)`，超限写 “clamping {} hook timeout to {max_timeout_sec}s in {}” 警告），其余事件走 `_ => timeout_sec.unwrap_or(600).max(1)`，因此 `PreModelRequest` 与 `PostModelRequest` 的默认超时是 600 秒、下限 1 秒；command 与 `mcp_tool` 两类 Handler 都经这个函数归一',
      url: 'https://github.com/openai/codex/blob/70b3bb6d8814ab3f2045238b4ae14c43da99783b/codex-rs/hooks/src/engine/discovery.rs',
    },
    'codex-hooks-model-request-runtime': {
      label:
        'Codex `codex-rs/core/src/hook_runtime.rs`（提交 `70b3bb6d8814`，51,970 字节）：`hooks_for_model_request` 在 `step.turn.session_source` 为 `SessionSource::Internal(InternalSessionSource::MemoryConsolidation)` 或 `SessionSource::SubAgent(SubAgentSource::MemoryConsolidation)` 时改用 `hooks.for_memory_consolidation(executor_hook_sources_for_step(step))`，其余情况用会话自己的 Hook 集；`run_model_request_hooks` 用 `thread_spawn_subagent_hook_context` 填 `agent_id`/`agent_type`、`turn_id` 取 `step.turn.sub_id`、`cwd` 取 `tool_hook_cwd(&step.environments, &step.turn)`、`model` 取 `step.settings.model_info.slug`，先 `emit_hook_started_events(... hooks.preview_model_request(&request))` 再 `hooks.run_model_request(request)` 并 `emit_hook_completed_events`；`hook_run_metric_tags` 的事件名映射同步加入 `PreModelRequest` 与 `PostModelRequest`',
      url: 'https://github.com/openai/codex/blob/70b3bb6d8814ab3f2045238b4ae14c43da99783b/codex-rs/core/src/hook_runtime.rs',
    },
    'codex-hooks-model-request-order': {
      label:
        'Codex `codex-rs/core/src/stream_events_utils.rs`（提交 `70b3bb6d8814`，20,647 字节）：工具派发处逐字注释为 “// handle_tool_call dispatches immediately, not when its future is polled. // With a synchronous post-model hook, dispatch only when the turn drains tools.”，随后按 `ctx.defer_tool_dispatch` 选择 `tool_future` 的构造方式，即同步的 `PostModelRequest` Hook 会推迟工具派发',
      url: 'https://github.com/openai/codex/blob/70b3bb6d8814ab3f2045238b4ae14c43da99783b/codex-rs/core/src/stream_events_utils.rs',
    },
    'codex-hooks-model-request-browser': {
      label:
        'Codex TUI `/hooks` 浏览器快照 `codex_tui__bottom_pane__hooks_browser_view__tests__hooks_browser_model_requests.snap`（提交 `70b3bb6d8814`，1,938 字节，本次新增文件）：Event 表新增两行，`PreModelRequest` 的 Description 逐字为 “Before a model request”，`PostModelRequest` 为 “After a model request, including failures”，表头仍是 “Event / Installed / Active / Description”、页脚仍是 “enter details · esc close”；`codex-rs/hooks/src/engine/mod.rs` 的 `event_name_label` 同时给出 `pre-model-request` 与 `post-model-request` 两个标签',
      url: 'https://github.com/openai/codex/blob/70b3bb6d8814ab3f2045238b4ae14c43da99783b/codex-rs/tui/src/bottom_pane/snapshots/codex_tui__bottom_pane__hooks_browser_view__tests__hooks_browser_model_requests.snap',
    },
    'codex-hooks-events-recheck': {
      label:
        'Codex Hooks 文档页（2026-10-19 复核）：事件表仍只列 12 个——“During a turn” 的 `PreToolUse`、`PermissionRequest`、`PostToolUse`、`PreCompact`、`PostCompact`、`UserPromptSubmit`、`SubagentStop`、`Stop`，“When you interrupt an active turn” 的 `Interrupt`（doesn’t run for subagents），“When a session or subagent starts” 的 `SessionStart`、`SubagentStart` 与 “When the main thread ends” 的 `SessionEnd`（doesn’t run for subagents），全页没有 `PreModelRequest` 或 `PostModelRequest`；并发口径逐字为 “Multiple matching command hooks for the same event are launched concurrently, so one hook can’t prevent another matching hook from starting.” 与 “Codex runs up to eight background hooks concurrently per session. Additional hooks wait until a running hook finishes.”；Handler 口径仍是 “`command` and `mcp_tool` handlers are supported. `prompt` and `agent` handlers are parsed but skipped.”',
      url: 'https://learn.chatgpt.com/docs/hooks',
    },
    'codex-v0149-release': {
      label: 'Codex rust-v0.149.0 release notes (agents dashboard and codex queue)',
      url: 'https://github.com/openai/codex/releases/tag/rust-v0.149.0',
    },
    'codex-queue-commit': {
      label: 'Codex `codex queue` session messaging commit',
      url: 'https://github.com/openai/codex/commit/83d015375e578e369c115b06aea631f266226a4f',
    },
    'codex-tui-task-tools-commit': {
      label: 'Codex TUI `codex_tui` task tools commit',
      url: 'https://github.com/openai/codex/commit/a8468330bb5f45e9f4d2ec630b01ea8c52908be3',
    },
    'codex-tui-task-tools-source': {
      label: 'Codex TUI task tools source',
      url: 'https://github.com/openai/codex/blob/a8468330bb5f45e9f4d2ec630b01ea8c52908be3/codex-rs/tui/src/dynamic_tools.rs',
    },
    'codex-task-mentions-commit': {
      label: 'Codex TUI composer task mentions commit',
      url: 'https://github.com/openai/codex/commit/76d98a771e6cd44a79a3ab895a9f7c49d27d6deb',
    },
    'codex-task-mentions-source': {
      label: 'Codex TUI task mentions source',
      url: 'https://github.com/openai/codex/blob/76d98a771e6cd44a79a3ab895a9f7c49d27d6deb/codex-rs/tui/src/task_mentions.rs',
    },
    'codex-agents-dashboard-commit': {
      label: 'Codex agents overview dashboard commit',
      url: 'https://github.com/openai/codex/commit/4617d4d21d278592002249773faaaf47d4c52e63',
    },
    'codex-agents-command-commit': {
      label: 'Codex `codex agents` dashboard command commit',
      url: 'https://github.com/openai/codex/commit/fd5018e0445ba7d879c5dbda66ecdab4b6da1886',
    },
    'codex-agents-shortcuts-commit': {
      label: 'Codex agents dashboard configurable shortcuts commit',
      url: 'https://github.com/openai/codex/commit/f47f77ada6699460bf13b0b7278e710692e0ea34',
    },
    'codex-agents-overview-source': {
      label: 'Codex agents overview dashboard source',
      url: 'https://github.com/openai/codex/blob/758ef40f50c1a458425c7cfbf1eb12cbc07af0b0/codex-rs/tui/src/app/agents_overview.rs',
    },
    'codex-persistent-effort-commit': {
      label: 'Codex persistent reasoning effort commit',
      url: 'https://github.com/openai/codex/commit/3e4707b34b16e139fcb7ad11ab8445993b62bba1',
    },
    'codex-persistent-effort-protocol': {
      label: 'Codex persistent reasoning effort protocol source',
      url: 'https://github.com/openai/codex/blob/3e4707b34b16e139fcb7ad11ab8445993b62bba1/codex-rs/protocol/src/openai_models.rs',
    },
    'codex-subagent-effort-activity-commit': {
      label: 'Codex Subagent activity 记录解析后模型与推理强度的提交',
      url: 'https://github.com/openai/codex/commit/b0a6b8d86f455d3db9dd869fc1178a5fbd865e7f',
    },
    'codex-persistent-effort-client': {
      label: 'Codex persistent effort Responses API translation source',
      url: 'https://github.com/openai/codex/blob/3e4707b34b16e139fcb7ad11ab8445993b62bba1/codex-rs/core/src/client.rs',
    },
    'codex-v0154-release': {
      label: 'Codex rust-v0.154.0 发布说明（实验性托管 Worktree）',
      url: 'https://github.com/openai/codex/releases/tag/rust-v0.154.0',
    },
    'codex-v0156-release': {
      label: 'Codex rust-v0.156.0 发布说明（Worktree 默认开启）',
      url: 'https://github.com/openai/codex/releases/tag/rust-v0.156.0',
    },
    'codex-worktree-feature-experimental': {
      label: 'Codex rust-v0.154.0 功能登记册（worktrees 实验性默认关闭）',
      url: 'https://github.com/openai/codex/blob/6b9826e3aa83b1a5947db50f4332cb9c65f1b340/codex-rs/features/src/lib.rs',
    },
    'codex-worktree-feature-stable': {
      label: 'Codex rust-v0.156.0 功能登记册（worktrees 转 Stable 默认开启）',
      url: 'https://github.com/openai/codex/blob/fe74a774532af67b5a4a3dec03ce9469e17f89af/codex-rs/features/src/lib.rs',
    },
    'codex-worktree-cli-flag': {
      label: 'Codex `--worktree` 共享参数源码',
      url: 'https://github.com/openai/codex/blob/ff6aec96948b70d94983af2641a6b67c94faeff5/codex-rs/utils/cli/src/shared_options.rs',
    },
    'codex-worktree-unsupported': {
      label: 'Codex `--worktree` 不支持组合的报错快照',
      url: 'https://github.com/openai/codex/blob/ff6aec96948b70d94983af2641a6b67c94faeff5/codex-rs/cli/src/snapshots/codex__tests__unsupported_worktree_commands.snap',
    },
    'codex-worktree-manager': {
      label: 'Codex WorktreeManager 创建与列举源码',
      url: 'https://github.com/openai/codex/blob/ff6aec96948b70d94983af2641a6b67c94faeff5/codex-rs/worktree/src/lib.rs',
    },
    'codex-worktree-settings': {
      label: 'Codex 托管 Worktree 设置解析源码',
      url: 'https://github.com/openai/codex/blob/ff6aec96948b70d94983af2641a6b67c94faeff5/codex-rs/worktree/src/settings.rs',
    },
    'codex-worktree-owner': {
      label: 'Codex Worktree 线程归属记录源码',
      url: 'https://github.com/openai/codex/blob/ff6aec96948b70d94983af2641a6b67c94faeff5/codex-rs/worktree/src/metadata.rs',
    },
    'codex-worktree-tui-creation': {
      label: 'Codex TUI 托管 Worktree 创建与交接源码',
      url: 'https://github.com/openai/codex/blob/ff6aec96948b70d94983af2641a6b67c94faeff5/codex-rs/tui/src/app/managed_worktree_creation.rs',
    },
    'codex-worktree-picker': {
      label: 'Codex `/worktree` 选择器与可用性判定源码',
      url: 'https://github.com/openai/codex/blob/ff6aec96948b70d94983af2641a6b67c94faeff5/codex-rs/tui/src/chatwidget/worktree_picker.rs',
    },
    'codex-slash-command-registry': {
      label: 'Codex TUI Slash 命令定义源码',
      url: 'https://github.com/openai/codex/blob/ff6aec96948b70d94983af2641a6b67c94faeff5/codex-rs/tui/src/slash_command.rs',
    },
    'codex-slack': {
      label: 'Codex Slack 集成（委派给 Codex Cloud）',
      url: 'https://learn.chatgpt.com/docs/third-party/slack',
    },
    'codex-windows-sandbox': {
      label: 'Codex Windows sandbox',
      url: 'https://learn.chatgpt.com/docs/windows/windows-sandbox',
    },
    'codex-sandboxing': {
      label:
        'Codex 官方 Sandboxing 页（2026-10-21 抓取，492,064 字节）逐字为 “Codex uses platform-native enforcement on each OS. The implementation differs between macOS, Linux, WSL2, and native Windows, but the idea is the same across surfaces: give the agent a bounded place to work so routine tasks can run autonomously inside clear limits.”、“On **macOS**, sandboxing works out of the box using the built-in Seatbelt framework.”、“On **Windows**, Codex uses the native Windows sandbox when you run in PowerShell and the Linux sandbox implementation when you run in WSL2.”；Linux 侧逐字为 “Codex uses the first `bwrap` executable it finds on `PATH`. If no `bwrap` executable is available, Codex falls back to a bundled helper, but that helper requires support for unprivileged user namespace creation. Installing the distribution package that provides `bwrap` keeps this setup reliable.” 与 “Codex surfaces a startup warning when `bwrap` is missing or when the helper can\'t create the needed user namespace. On distributions that restrict this AppArmor setting, prefer loading the `bwrap` AppArmor profile so `bwrap` can keep working without disabling the restriction globally.”；Ubuntu 24.04 一段逐字为 “On Ubuntu 24.04, Codex may still warn that it can\'t create the needed user namespace after `bubblewrap` is installed. Copy and load the extra profile:”，命令为 `sudo apt install apparmor-profiles apparmor-utils`、`sudo install -m 0644 /usr/share/apparmor/extra-profiles/bwrap-userns-restrict /etc/apparmor.d/bwrap-userns-restrict`、`sudo apparmor_parser -r /etc/apparmor.d/bwrap-userns-restrict`，并注明 “`apparmor_parser -r` loads the profile into the kernel without a reboot.”，退路为 “If that profile is unavailable or does not resolve the issue, you can disable the AppArmor unprivileged user namespace restriction with: `sudo sysctl -w kernel.apparmor_restrict_unprivileged_userns=0`”；该页没有讨论在容器内运行 Codex 的嵌套场景，也没有出现 Landlock 或 seccomp 字样',
      url: 'https://learn.chatgpt.com/docs/sandboxing',
    },
    'codex-linux-sandbox-bwrap': {
      label:
        'Codex `codex-rs/linux-sandbox/src/bwrap.rs`（标签 `rust-v0.164.0-alpha.9`，提交 `bcee56bcdb74cbf08fc6dd47ef0079fded4bba9a`，1522 行）在两处构造 `bwrap` 参数时都显式加入 `--unshare-user`，注释分别逐字为 “// Always enter a fresh user namespace so root inside a container does // not need ambient CAP_SYS_ADMIN to create the remaining namespaces.” 与 “// Request a user namespace explicitly rather than relying on bubblewrap\'s // auto-enable behavior, which is skipped when the caller runs as uid 0. // This also blocks host procfs root/cwd/fd links through ptrace permission // checks, including when a container requires retaining the host procfs.”；同一参数列表还含 `--unshare-ipc`、`--dev /dev`、`--bind-try /dev/shm /dev/shm`、`--cap-drop ALL`，并按选项条件加入 `--unshare-pid`、`--unshare-net` 与 `--proc /proc`，`mount_proc` 为假且需要遮蔽 WSL 视图时改挂 `--tmpfs /proc`',
      url: 'https://github.com/openai/codex/blob/bcee56bcdb74cbf08fc6dd47ef0079fded4bba9a/codex-rs/linux-sandbox/src/bwrap.rs',
    },
    'codex-linux-sandbox-cargo': {
      label:
        'Codex `codex-rs/linux-sandbox/Cargo.toml`（标签 `rust-v0.164.0-alpha.9`，提交 `bcee56bcdb74cbf08fc6dd47ef0079fded4bba9a`）的 `[target.\'cfg(target_os = "linux")\'.dependencies]` 段同时列出 `landlock = { workspace = true }` 与 `seccompiler = { workspace = true }`，另有 `codex-network-proxy`、`codex-process-hardening`、`codex-sandboxing`、`globset` 与 `rustix`；同目录 `src/` 下的文件为 `bazel_bwrap.rs`、`bundled_bwrap.rs`、`bwrap.rs`、`bwrap_wslg_tests.rs`、`daemon_mounts.rs`、`exec_util.rs`、`fd_mount.rs`、`launcher.rs`、`lib.rs`、`linux_run_main.rs`、`main.rs`、`proxy_lifecycle.rs`、`proxy_routing.rs`、`seccomp.rs` 与 `wslg.rs`，即 Landlock 与 seccomp 是该 crate 的实现依赖，而官方文档口径的 Linux 边界是 bubblewrap',
      url: 'https://github.com/openai/codex/blob/bcee56bcdb74cbf08fc6dd47ef0079fded4bba9a/codex-rs/linux-sandbox/Cargo.toml',
    },
    'codex-managed-configuration': {
      label: 'Codex Managed configuration（requirements.toml）',
      url: 'https://learn.chatgpt.com/docs/enterprise/managed-configuration',
    },
    'codex-mxc-readme': {
      label: 'Codex MXC 沙箱说明（`codex-rs/mxc-sandbox/README.md`）',
      url: 'https://github.com/openai/codex/blob/e95abcdf4939f37f11f00f984efdbbf8b088346e/codex-rs/mxc-sandbox/README.md',
    },
    'codex-windows-sandbox-config': {
      label: 'Codex Windows 沙箱后端解析源码',
      url: 'https://github.com/openai/codex/blob/e95abcdf4939f37f11f00f984efdbbf8b088346e/codex-rs/core/src/config/windows_sandbox_config.rs',
    },
    'codex-windows-config-types': {
      label: 'Codex rust-v0.160.1 `windows` 配置类型源码',
      url: 'https://github.com/openai/codex/blob/d27764b82f7118f674371e6d6e76271d9d606edb/codex-rs/config/src/types.rs',
    },
    'codex-windows-features': {
      label: 'Codex 功能登记册（`prefer_mxc` 默认关闭）',
      url: 'https://github.com/openai/codex/blob/e95abcdf4939f37f11f00f984efdbbf8b088346e/codex-rs/features/src/lib.rs',
    },
    'codex-windows-allow-mxc-commit': {
      label: 'Codex `windows.allow_mxc` 退出开关提交',
      url: 'https://github.com/openai/codex/commit/e95abcdf4939f37f11f00f984efdbbf8b088346e',
    },
    'codex-slash-command-v0154': {
      label: 'Codex rust-v0.154.0 Slash 命令源码（含 `/sandbox-add-read-dir`）',
      url: 'https://github.com/openai/codex/blob/6b9826e3aa83b1a5947db50f4332cb9c65f1b340/codex-rs/tui/src/slash_command.rs',
    },
    'codex-slash-command-v0155': {
      label: 'Codex rust-v0.155.0 Slash 命令源码（已无 `/sandbox-add-read-dir`）',
      url: 'https://github.com/openai/codex/blob/f0a1b8f0849d90960bc406b848f32e5a129b0457/codex-rs/tui/src/slash_command.rs',
    },
    'qwen-commands': {
      label: 'Qwen Code commands documentation',
      url: 'https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/commands.md',
    },
    'qwen-commands-v0251preview2': {
      label:
        'Qwen Code v0.25.1-preview.2 命令文档（`/config` dot-path 读写、`/settings` 编辑器与 `/import-config` 只导入 Claude 的 MCP Server）',
      url: 'https://github.com/QwenLM/qwen-code/blob/d381509d32e62a992a344de33207d54f436bcefc/docs/users/features/commands.md',
    },
    'qwen-config-command-source': {
      label:
        'Qwen Code `/config` 命令源码（`supportedModes` 为 interactive/non_interactive/acp、写 `SettingScope.User`、敏感键打码与拒绝把 `tools.approvalMode` 设为 `yolo`）',
      url: 'https://github.com/QwenLM/qwen-code/blob/d381509d32e62a992a344de33207d54f436bcefc/packages/cli/src/ui/commands/config-command.ts',
    },
    'qwen-bundled-skills': {
      label: 'Qwen Code bundled Skill loader',
      url: 'https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/packages/cli/src/services/BundledSkillLoader.ts',
    },
    'qwen-skill-commands': {
      label: 'Qwen Code user, project and extension Skill loader',
      url: 'https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/packages/cli/src/services/SkillCommandLoader.ts',
    },
    'qwen-file-commands': {
      label: 'Qwen Code Markdown and TOML command loader',
      url: 'https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/packages/cli/src/services/FileCommandLoader.ts',
    },
    'qwen-workflow-commands': {
      label: 'Qwen Code saved Workflow loader',
      url: 'https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/packages/cli/src/services/saved-workflow-loader.ts',
    },
    'qwen-workflow-pause-docs': {
      label: 'Qwen Code /workflows pause/resume command docs',
      url: 'https://github.com/QwenLM/qwen-code/blob/88a325bce9dbdbfafe0d5dc6e4667b4c2942818b/docs/users/features/commands.md',
    },
    'qwen-workflow-pause-shortcuts': {
      label: 'Qwen Code Background Tasks keyboard shortcuts',
      url: 'https://github.com/QwenLM/qwen-code/blob/88a325bce9dbdbfafe0d5dc6e4667b4c2942818b/docs/users/reference/keyboard-shortcuts.md',
    },
    'qwen-workflow-pause-source': {
      label: 'Qwen Code workflows command source',
      url: 'https://github.com/QwenLM/qwen-code/blob/88a325bce9dbdbfafe0d5dc6e4667b4c2942818b/packages/cli/src/ui/commands/workflowsCommand.ts',
    },
    'qwen-v0218-release': {
      label: 'Qwen Code v0.21.8 release notes',
      url: 'https://github.com/QwenLM/qwen-code/releases/tag/v0.21.8',
    },
    'qwen-local-control-commit': {
      label: 'Qwen Code Local Control pairing commit',
      url: 'https://github.com/QwenLM/qwen-code/commit/bf84caf1737163e3e15acff6c6a1c8a6af91df4d',
    },
    'qwen-local-control-serve-docs': {
      label: 'Qwen Code qwen serve Local Control documentation',
      url: 'https://github.com/QwenLM/qwen-code/blob/bf84caf1737163e3e15acff6c6a1c8a6af91df4d/docs/users/qwen-serve.md',
    },
    'qwen-local-control-design': {
      label: 'Qwen Code Local Control CLI design document',
      url: 'https://github.com/QwenLM/qwen-code/blob/bf84caf1737163e3e15acff6c6a1c8a6af91df4d/docs/design/local-control-cli.md',
    },
    'qwen-local-control-desktop': {
      label: 'Qwen Code Desktop Local Control README',
      url: 'https://github.com/QwenLM/qwen-code/blob/bf84caf1737163e3e15acff6c6a1c8a6af91df4d/packages/desktop-shell/README.md',
    },
    'qwen-local-control-source': {
      label: 'Qwen Code serve command source (--local-control flag)',
      url: 'https://github.com/QwenLM/qwen-code/blob/bf84caf1737163e3e15acff6c6a1c8a6af91df4d/packages/cli/src/commands/serve.ts',
    },
    'qwen-review-skill': {
      label: 'Qwen Code review Skill',
      url: 'https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/core/src/skills/bundled/review/SKILL.md',
    },
    'qwen-review-assets': {
      label: 'Qwen Code review evidence image publishing',
      url: 'https://github.com/QwenLM/qwen-code/commit/186812694c8d28c3434fa1c48dbca987281378f9',
    },
    'qwen-review-web-shell': {
      label: 'Qwen Code structured Web Shell review results',
      url: 'https://github.com/QwenLM/qwen-code/commit/7dfc554dffcf52930ac35d4ea9c2558dfe36c22c',
    },
    'qwen-review-cost-ledger': {
      label: 'Qwen Code review cost ledger',
      url: 'https://github.com/QwenLM/qwen-code/commit/4f79036a2269bb43f95f736ca8c44bc60b0cc9d6',
    },
    'qwen-review-repo-context': {
      label: 'Qwen Code review repository context manifest',
      url: 'https://github.com/QwenLM/qwen-code/commit/e76dff1c6b3069cd12709a82bd15d62f7a6ab282',
    },
    'qwen-review-resume-commit': {
      label: 'Qwen Code review --resume wiring commit',
      url: 'https://github.com/QwenLM/qwen-code/commit/1eb8a0c7f8126de179b4c80b932d915983ce51f1',
    },
    'qwen-review-resume-docs': {
      label: 'Qwen Code review --resume documentation',
      url: 'https://github.com/QwenLM/qwen-code/blob/1eb8a0c7f8126de179b4c80b932d915983ce51f1/docs/users/features/code-review.md',
    },
    'qwen-review-resume-skill': {
      label: 'Qwen Code review Skill resume branch',
      url: 'https://github.com/QwenLM/qwen-code/blob/1eb8a0c7f8126de179b4c80b932d915983ce51f1/packages/core/src/skills/bundled/review/SKILL.md',
    },
    'qwen-v02115-release': {
      label: 'Qwen Code v0.21.15 release notes',
      url: 'https://github.com/QwenLM/qwen-code/releases/tag/v0.21.15',
    },
    'qwen-review-topology-commit': {
      label: 'Qwen Code review --topology minimal arm commit',
      url: 'https://github.com/QwenLM/qwen-code/commit/43d7596d9d4ea44b9fc5b305d01a313d837c8c81',
    },
    'qwen-review-topology-skill': {
      label: 'Qwen Code review Skill --topology dispatch (Step 3M)',
      url: 'https://github.com/QwenLM/qwen-code/blob/43d7596d9d4ea44b9fc5b305d01a313d837c8c81/packages/core/src/skills/bundled/review/SKILL.md',
    },
    'qwen-review-topology-parse-args': {
      label: 'Qwen Code review --topology argument parsing source',
      url: 'https://github.com/QwenLM/qwen-code/blob/43d7596d9d4ea44b9fc5b305d01a313d837c8c81/packages/cli/src/commands/review/parse-args.ts',
    },
    'qwen-v022-release': {
      label: 'Qwen Code v0.22.0 release notes',
      url: 'https://github.com/QwenLM/qwen-code/releases/tag/v0.22.0',
    },
    'qwen-pr-binding-commit': {
      label: 'Qwen Code Web Shell PR session binding commit',
      url: 'https://github.com/QwenLM/qwen-code/commit/e2de7d288427faae072008f3aab60ada8fec612e',
    },
    'qwen-pr-binding-design': {
      label: 'Qwen Code Web Shell PR session binding design document',
      url: 'https://github.com/QwenLM/qwen-code/blob/e2de7d288427faae072008f3aab60ada8fec612e/docs/design/2026-08-20-webshell-session-pr-binding.md',
    },
    'qwen-pr-binding-service': {
      label: 'Qwen Code session PR sidecar service source',
      url: 'https://github.com/QwenLM/qwen-code/blob/1c3a385d9bc83e0b2a1ce5a24454ce1d090595fb/packages/core/src/services/session-pr-service.ts',
    },
    'qwen-pr-binding-badge': {
      label: 'Qwen Code session PR badge source',
      url: 'https://github.com/QwenLM/qwen-code/blob/1c3a385d9bc83e0b2a1ce5a24454ce1d090595fb/packages/web-shell/client/components/SessionPrBadge.tsx',
    },
    'qwen-pr-binding-search': {
      label: 'Qwen Code sidebar git context search source',
      url: 'https://github.com/QwenLM/qwen-code/blob/1c3a385d9bc83e0b2a1ce5a24454ce1d090595fb/packages/web-shell/client/components/sidebar/sessionSearch.ts',
    },
    'qwen-list-directory-commit': {
      label: 'Qwen Code list_directory opt-in commit',
      url: 'https://github.com/QwenLM/qwen-code/commit/e09399e0fbcf48d04a9f96a23db690b969ad8d35',
    },
    'qwen-list-directory-settings': {
      label: 'Qwen Code v0.22.0 settings (tools.listDirectory.enabled)',
      url: 'https://github.com/QwenLM/qwen-code/blob/1c3a385d9bc83e0b2a1ce5a24454ce1d090595fb/docs/users/configuration/settings.md',
    },
    'qwen-list-directory-tools-doc': {
      label: 'Qwen Code v0.22.0 file system tools document',
      url: 'https://github.com/QwenLM/qwen-code/blob/1c3a385d9bc83e0b2a1ce5a24454ce1d090595fb/docs/developers/tools/file-system.md',
    },
    'qwen-list-directory-registration': {
      label: 'Qwen Code v0.22.0 tool registration source',
      url: 'https://github.com/QwenLM/qwen-code/blob/1c3a385d9bc83e0b2a1ce5a24454ce1d090595fb/packages/core/src/config/config.ts',
    },
    'qwen-computer-use': {
      label: 'Qwen Code Computer Use',
      url: 'https://github.com/QwenLM/qwen-code/blob/0907edb909706cf7589f94723b26572eb1dd9512/docs/users/features/computer-use.md',
    },
    'qwen-command-modes': {
      label: 'Qwen Code command mode filter',
      url: 'https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/packages/cli/src/services/commandUtils.ts',
    },
    'qwen-agents': {
      label: 'Qwen Code Subagents',
      url: 'https://github.com/QwenLM/qwen-code/blob/412eae24b48ff16f54166c2b17eb4d4a9cdcdd1e/docs/users/features/sub-agents.md',
    },
    'qwen-agent-messaging': {
      label: 'Qwen Code background agent messaging',
      url: 'https://github.com/QwenLM/qwen-code/blob/412eae24b48ff16f54166c2b17eb4d4a9cdcdd1e/docs/users/features/sub-agents.md',
    },
    'qwen-worktree': {
      label: 'Qwen Code Worktree',
      url: 'https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/worktree.md',
    },
    'qwen-approval': {
      label: 'Qwen Code Approval Mode',
      url: 'https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/approval-mode.md',
    },
    'qwen-sandbox': {
      label: 'Qwen Code Sandbox',
      url: 'https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/sandbox.md',
    },
    'qwen-sandbox-execution-v0253': {
      label:
        'Qwen Code `docs/users/features/sandbox.md`（标签 v0.25.3，提交 `b28b0d948fa28b89750ac5f1525b95e1746f47ab`，17,891 字节，与 main 分支同文件逐字一致）首段逐字为 “This document explains tool execution confinement on Linux and the existing whole-CLI sandbox methods.”，“## Linux tool execution sandbox” 一节逐字为 “On Linux, install `bwrap` (Bubblewrap) at `/usr/bin/bwrap` (the supported system path) for the strongest supported boundary, then enable the tool execution sandbox in your **User** settings (`~/.qwen/settings.json`, or the directory selected by `QWEN_HOME`) or administrator **System** settings:”，示例为 `{ "tools": { "executionSandbox": { "backend": "auto", "filesystem": "workspace-write", "network": "closed" } } }`，随后逐字为 “`filesystem` and `network` are required. `backend` defaults to `auto`, which tries bwrap first. When bwrap is unavailable and `network` is `open`, `auto` can use the bundled Landlock helper on kernels with Landlock ABI 3 or newer. Set `backend` to `bwrap` or `landlock` to require that exact implementation. Landlock cannot enforce `network: closed` or hide explicit masked paths. Either requirement rejects Landlock before any command starts; automatic fallback never discards a remaining path mask. Use `read-only` to deny workspace writes, or `workspace-write` to permit writes inside the current canonical workspace. Each command also gets private scratch space. Ordinary `includeDirectories` settings do not grant write access.”',
      url: 'https://github.com/QwenLM/qwen-code/blob/b28b0d948fa28b89750ac5f1525b95e1746f47ab/docs/users/features/sandbox.md',
    },
    'qwen-sandbox-execution-scope-v0253': {
      label:
        'Qwen Code `docs/users/features/sandbox.md`（标签 v0.25.3，提交 `b28b0d948fa28b89750ac5f1525b95e1746f47ab`）作用域与限制段逐字为 “The CLI, model transport, authentication and session storage remain on the host. Shell, terminal `!`, prompt shell interpolation, Monitor, Read/Write/Edit and supported nested in-process Agent/Code Mode calls use the same runtime policy.”、“With bwrap, `network: closed` blocks ordinary host/external IP connections from commands, while `open` shares the host network. Reads remain broad: this mode does not hide host secrets or promise to isolate pathname Unix sockets and host services. Approval and YOLO do not expand the filesystem or network policy.”、“Workspace settings cannot enable, disable or modify this policy, even in a trusted project. Effective precedence is System over User over SystemDefaults, selecting a complete policy object. Values must be literals; environment substitutions, unknown fields and incomplete objects are rejected. `--bare` and `--safe-mode` retain operator confinement. Changes require a new runtime. A malformed or unreadable SystemDefaults, User or System settings file now blocks startup (configuration exit code 52), instead of silently resetting unknown policy to empty settings.”、“This initial public mode supports the ordinary headless CLI and both terminal UIs. ACP, `qwen serve` and web terminals explicitly reject it. MCP/LSP, executable hooks/extensions, worktree/arena management, external agents, speculative execution, file checkpoints, automatic skill/memory maintenance, and unported process or mutation tools are disabled or rejected.” 与 “Linked Git worktrees receive write access to the admitted workspace only. Git common-directory and worktree metadata outside that workspace stay read-only; this mode does not implicitly authorize changing another checkout\'s repository metadata.”',
      url: 'https://github.com/QwenLM/qwen-code/blob/b28b0d948fa28b89750ac5f1525b95e1746f47ab/docs/users/features/sandbox.md#linux-tool-execution-sandbox',
    },
    'qwen-sandbox-landlock-partial-v0253': {
      label:
        'Qwen Code `docs/users/features/sandbox.md`（标签 v0.25.3，提交 `b28b0d948fa28b89750ac5f1525b95e1746f47ab`）Landlock 段逐字为 “Landlock reports `partial` enforcement because it restricts pathname reads, writes and directory mutations but does not create PID or network namespaces and cannot currently restrict every metadata operation, including `chmod`, `chown`, extended attributes and timestamps. A Landlock command can see host processes and uses host networking. Detached descendants retain the Landlock filesystem restrictions but do not get bwrap\'s PID-namespace lifetime boundary.” 与 “Landlock also has a narrower writable device surface: it grants writes to `/dev/null`, but does not create bwrap\'s private `/dev` and `/proc` mounts. Opening `/dev/full` or `/dev/tty` for writing and creating files in `/dev/shm` are denied, so programs requiring these operations may fail. Use the private scratch directory exposed through `TMPDIR`, `TMP`, and `TEMP` for temporary files.”，并写 “Startup\'s Landlock policy probe requires `/usr/bin/true`; a host missing it fails the probe even if its kernel supports Landlock.”',
      url: 'https://github.com/QwenLM/qwen-code/blob/b28b0d948fa28b89750ac5f1525b95e1746f47ab/docs/users/features/sandbox.md',
    },
    'qwen-sandbox-verify-v0253': {
      label:
        'Qwen Code `docs/users/features/sandbox.md`（标签 v0.25.3，提交 `b28b0d948fa28b89750ac5f1525b95e1746f47ab`）核对命令段逐字为 “Inspect and verify the active boundary before running a task:” 加代码块 `qwen sandbox`、`qwen sandbox --verify`、`qwen sandbox -- sh -c \'printf "confined command\\n"\'`、`qwen -y -p "Update the project and run its tests"`，说明逐字为 “The report names the tool boundary, requested/effective backend, enforcement level, Landlock ABI when applicable, workspace, filesystem and command network policy. `--verify` checks workspace writes, denial against a file known to be writable on the host, the expected private or shared PID namespace identity, and the selected network namespace. A passed backend probe establishes admission, not authenticated full-session viability under all inherited environment settings.” 与 “Backend setup errors fail before payload execution and never rerun the command on the host. The one-command subcommand forwards literal arguments and redirected stdin while preserving stdout and stderr byte-for-byte; use terminal `!` for interactive PTY commands.”；同标签 `packages/cli/src/commands/sandbox.ts`（302 行）的 yargs 定义为 `command: \'sandbox [cmd...]\'`、`describe: \'Inspect tool confinement, verify it, or run one confined command\'`，选项为 `--verify`（boolean，默认 `false`）、`--sandbox` 与 `--sandbox-image`，三条 example 为 `$0 sandbox`（“Report the effective execution policy”）、`$0 sandbox --verify`（“Verify the kernel boundary”）与 `$0 sandbox -- sh -c \'ls /\'`（“Run one command confined”），并开启 `.strict()`；SIGINT 与 SIGTERM 分别把取消退出码设为 130 与 143',
      url: 'https://github.com/QwenLM/qwen-code/blob/b28b0d948fa28b89750ac5f1525b95e1746f47ab/packages/cli/src/commands/sandbox.ts',
    },
    'qwen-sandbox-migration-v0253': {
      label:
        'Qwen Code `docs/users/features/sandbox.md`（标签 v0.25.3，提交 `b28b0d948fa28b89750ac5f1525b95e1746f47ab`）“### Migrating from whole-CLI bwrap” 一节逐字为 “Replace `--sandbox bwrap` and remove `tools.sandbox: "bwrap"`, `QWEN_SANDBOX=bwrap`, `QWEN_SANDBOX_NET` and `QWEN_SANDBOX_PROXY_COMMAND`, then configure `tools.executionSandbox` as above. Restart from a shell outside the old sandbox; inherited `SANDBOX=bwrap` is rejected. `proxied` is not a supported network policy. Do not combine this mode with Docker, Podman, Seatbelt or an inherited whole-CLI sandbox marker. Old bwrap settings produce an explicit migration error.”，紧接一句为 “The Docker, Podman and macOS Seatbelt methods below still run the whole CLI in their existing environment.”；同页保留的整 CLI 方法为 macOS Seatbelt（`sandbox-exec`，默认 profile `permissive-open`，逐字 “restricts writes outside the project directory, but allows most other operations and outbound network access”）与 Docker/Podman 容器（逐字 “The container sandbox mounts your workspace and your `~/.qwen` directory into the container so auth and settings persist between runs.”）',
      url: 'https://github.com/QwenLM/qwen-code/blob/b28b0d948fa28b89750ac5f1525b95e1746f47ab/docs/users/features/sandbox.md#migrating-from-whole-cli-bwrap',
    },
    'qwen-settings-execution-sandbox-v0253': {
      label:
        'Qwen Code `docs/users/configuration/settings.md`（标签 v0.25.3，提交 `b28b0d948fa28b89750ac5f1525b95e1746f47ab`，381,388 字节）设有独立一节 “## Tool execution sandbox”，逐字为 “`tools.executionSandbox` is an operator-only Linux policy with required `filesystem: "read-only" | "workspace-write"` and `network: "open" | "closed"`, plus optional `backend: "auto" | "bwrap" | "landlock"`. `auto` prefers bwrap and can fall back to partial Landlock filesystem enforcement only when command networking is open. System policy replaces the complete User/SystemDefaults object; Workspace values are ignored. Bare/safe modes retain the policy and changing it requires restart.”；同页 `tools` 表仍保留 `tools.sandbox`（boolean or string，“Sandbox execution environment (can be a boolean or a path string).”，默认 `undefined`）与 `tools.sandboxImage`，并逐字写 “**`--yolo` does _not_ automatically enable a sandbox.**”',
      url: 'https://github.com/QwenLM/qwen-code/blob/b28b0d948fa28b89750ac5f1525b95e1746f47ab/docs/users/configuration/settings.md#tool-execution-sandbox',
    },
    'qwen-execution-sandbox-pr-12267': {
      label:
        'Qwen Code PR #12267 的合并提交 `1afbcffe21c98046670e8e4837a640f5d50465b1`（“feat(cli): Move bwrap sandboxing to tool execution (#12267)”，2026-09-22T10:55:51Z）提交说明逐字含 “Expose the operator-owned tools.executionSandbox policy across the CLI, route supported interactive entrypoints through the runtime boundary, and remove the legacy whole-CLI bwrap launch path.”；该提交是 `docs/users/features/sandbox.md` 引入 “## Linux tool execution sandbox” 一节的第一次变更',
      url: 'https://github.com/QwenLM/qwen-code/commit/1afbcffe21c98046670e8e4837a640f5d50465b1',
    },
    'qwen-sandbox-doc-v0244': {
      label:
        'Qwen Code `docs/users/features/sandbox.md`（标签 v0.24.4，提交 `9674d6efdc8ac16583270bd2a55cfa49e3ec254e`，Release 发布于 2026-09-22T15:15:06Z，13,144 字节）是首个记录该节的稳定标签，其 `backend` 一句逐字为 “`filesystem` and `network` are required. `backend` defaults to `auto`; both `auto` and `bwrap` currently select bwrap. Landlock is not available in this release.”；再前一个稳定标签 v0.24.0（提交 `56b003be0785`）的同文件只有 8,559 字节，没有 `tools.executionSandbox` 与 “Linux tool execution sandbox” 字样，Linux 方法仍是 “On Linux/Windows: - Use Docker or Podman.”',
      url: 'https://github.com/QwenLM/qwen-code/blob/9674d6efdc8ac16583270bd2a55cfa49e3ec254e/docs/users/features/sandbox.md',
    },
    'qwen-landlock-fallback-pr-12278': {
      label:
        'Qwen Code PR #12278 的合并提交 `1a5a74bc35b5ac35298118af81df8a973d49260a`（“feat(core): Add Landlock execution fallback (#12278)”，2026-09-29T03:45:46Z）；标签 v0.24.7（提交 `b12edec1401a28fc53cd9e714d5928b285071fc8`，Release 发布于 2026-09-29T14:02:21Z，15,025 字节）的 `docs/users/features/sandbox.md` 是首个记录 Landlock 回退的稳定标签，其 `backend` 一句逐字为 “`backend` defaults to `auto`, which tries bwrap first. When bwrap is unavailable and `network` is `open`, `auto` can use the bundled Landlock helper on kernels with Landlock ABI 3 or newer.”；该标签还没有 v0.25.3 里的 `/usr/bin/bwrap` 支持路径、配置退出码 52、链接 Worktree 写权限范围与 stdin 私有 socket 四段',
      url: 'https://github.com/QwenLM/qwen-code/commit/1a5a74bc35b5ac35298118af81df8a973d49260a',
    },
    'qwen-execution-sandbox-settings-v0253': {
      label:
        'Qwen Code `packages/cli/src/config/execution-sandbox-settings.ts`（标签 v0.25.3，提交 `b28b0d948fa28b89750ac5f1525b95e1746f47ab`，226 行）导出 `interface ExecutionSandboxSettings { backend?: \'auto\' | \'bwrap\' | \'landlock\'; filesystem: \'read-only\' | \'workspace-write\'; network: \'open\' | \'closed\'; }`，`parseExecutionSandboxSettings` 在对象含 `backend`/`filesystem`/`network` 以外的键、缺 `filesystem` 或 `network`、取值不在枚举内或不是字符串时抛 `InvalidExecutionSandboxConfigError`，消息逐字为 “tools.executionSandbox requires literal filesystem (read-only | workspace-write), network (open | closed), and optional backend (auto | bwrap | landlock). Unknown fields and environment interpolation are not supported.”；`InvalidExecutionSandboxConfigError extends FatalConfigError`；常量 `BWRAP_MIGRATION_MESSAGE` 逐字为 “Whole-CLI bwrap has been removed. Replace tools.sandbox: "bwrap" / QWEN_SANDBOX=bwrap with tools.executionSandbox: {"backend":"auto","filesystem":"workspace-write","network":"closed"} in User or System settings; remove inherited SANDBOX=bwrap and restart outside the old sandbox.”，在 `QWEN_SANDBOX`、`--sandbox`、`tools.sandbox` 或继承的 `SANDBOX` 取值为 `bwrap` 时抛出；同时设了 `tools.executionSandbox` 又存在整 CLI 沙箱选择、`SANDBOX` 标记、`QWEN_SANDBOX_NET` 或 `QWEN_SANDBOX_PROXY_COMMAND` 时抛 “tools.executionSandbox cannot be combined with a whole-CLI sandbox, SANDBOX marker, QWEN_SANDBOX_NET or QWEN_SANDBOX_PROXY_COMMAND. Remove the legacy configuration and restart.”；`assertExecutionSandboxSupported(settings, surface)` 抛 `tools.executionSandbox does not yet support ${surface}. Use the ordinary CLI or terminal UI.`；同目录 `execution-sandbox-config.ts`（30 行）另抛 “tools.executionSandbox requires Linux with a compatible bwrap or Landlock backend.”',
      url: 'https://github.com/QwenLM/qwen-code/blob/b28b0d948fa28b89750ac5f1525b95e1746f47ab/packages/cli/src/config/execution-sandbox-settings.ts',
    },
    'qwen-settings': {
      label: 'Qwen Code Settings',
      url: 'https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/configuration/settings.md',
    },
    'qwen-auto-mode': {
      label:
        'Qwen Code Auto Mode（v0.25.2，提交 `8a415cb628db88844e0196bdfdcce83b4f88d812`，16,043 字节）：分类器用配置的 fast model、未配置则用主会话模型，Stage 1 只输出 `{ shouldBlock }` 约 300 毫秒、Stage 2 只在 Stage 1 判阻断时运行且可降级为放行，`permissions.autoMode` 的 `hints.allow`/`hints.softDeny`/`hints.hardDeny`（`hints.deny` 向后兼容按 `softDeny` 处理）、`environment`、`classifyAllShell`、`mcp.forwardArguments` 六个键与 200 字符/50 条/20 条上限，连续 3 次阻断或连续 2 次不可用后回退人工审批，进入 Auto 时临时摘掉过宽 allow 规则且不改 `settings.json`，明确写 “Not offline-capable.”',
      url: 'https://github.com/QwenLM/qwen-code/blob/8a415cb628db88844e0196bdfdcce83b4f88d812/docs/users/features/auto-mode.md',
    },
    'qwen-denial-tracking': {
      label:
        'Qwen Code `denialTracking.ts`（v0.25.2，提交 `8a415cb628db88844e0196bdfdcce83b4f88d812`）：`AUTO_MODE_DENIAL_LIMITS` 为 `maxConsecutiveBlock: 3`、`maxConsecutiveUnavailable: 2`、`maxTotalDenials: 20`，`shouldFallback` 的 reason 优先级为 `total_denial` → `consecutive_block` → `consecutive_unavailable` → `classifier_blocked_retry`，回退只降级当次调用而会话仍留在 AUTO，切换 ApprovalMode 重置全部计数器',
      url: 'https://github.com/QwenLM/qwen-code/blob/8a415cb628db88844e0196bdfdcce83b4f88d812/packages/core/src/permissions/denialTracking.ts',
    },
    'qwen-escalation-commit': {
      label:
        'Qwen Code 提交 `a238b91e7c6fc2b0e36e23436b0e4ced5296617b`（PR #13636，2026-10-10，随 v0.25.2 发布）：破坏性命令的确定性阻断并入同一计数器，升级标记为 `requiresHumanDecision` 因而 Hook 的 allow 不能豁免，非交互 STREAM_JSON 会话改为直接拒绝',
      url: 'https://github.com/QwenLM/qwen-code/commit/a238b91e7c6fc2b0e36e23436b0e4ced5296617b',
    },
    'qwen-headless': {
      label: 'Qwen Code Headless Mode',
      url: 'https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/headless.md',
    },
    'qwen-headless-goal': {
      label: 'Qwen Code headless Goal workflows',
      url: 'https://github.com/QwenLM/qwen-code/blob/48d37cdf704dbe4c5254cc4b31c2d62f1351bff1/docs/users/features/headless.md',
    },
    'qwen-goal-v3-acp': {
      label: 'Qwen Code Goal v3 adoption in ACP sessions commit',
      url: 'https://github.com/QwenLM/qwen-code/commit/05079297d26c9c42013c3699743350d1d272fac2',
    },
    'qwen-goal-stall-commit': {
      label: 'Qwen Code Goal checkpoint stall breaker commit',
      url: 'https://github.com/QwenLM/qwen-code/commit/463809cbb39315b11dd9e410a2bcf5d52107418c',
    },
    'qwen-goal-stall-protocol': {
      label: 'Qwen Code Goal stall limit and reason constants',
      url: 'https://github.com/QwenLM/qwen-code/blob/463809cbb39315b11dd9e410a2bcf5d52107418c/packages/core/src/goals/goal-protocol.ts',
    },
    'qwen-goal-stall-checkpoint': {
      label: 'Qwen Code Goal checkpoint stall predicate source',
      url: 'https://github.com/QwenLM/qwen-code/blob/463809cbb39315b11dd9e410a2bcf5d52107418c/packages/core/src/goals/goal-checkpoint.ts',
    },
    'qwen-docs': {
      label: 'Qwen Code Documentation',
      url: 'https://github.com/QwenLM/qwen-code/tree/main/docs/users',
    },
    'qwen-session-commands': {
      label: 'Qwen Code current commands',
      url: 'https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/commands.md',
    },
    'qwen-memory-current': {
      label: 'Qwen Code current memory',
      url: 'https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/memory.md',
    },
    'qwen-session-settings': {
      label: 'Qwen Code current settings',
      url: 'https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/configuration/settings.md',
    },
    'qwen-rewind-restore-commands': {
      label: 'Qwen Code main 命令文档（`/rewind`、`/restore`、`/doctor rollback` 与文件检查点交互模式默认开启，提交 e39567eb564c）',
      url: 'https://github.com/QwenLM/qwen-code/blob/e39567eb564cf5473dc703b25b219c66059fcb1b/docs/users/features/commands.md',
    },
    'qwen-file-history-settings': {
      label: 'Qwen Code main 设置文档（`general.cleanupPeriodDays` 与 `~/.qwen/file-history/`，提交 86b9f13395bd）',
      url: 'https://github.com/QwenLM/qwen-code/blob/86b9f13395bd77938f5096011f8fb02986b7facf/docs/users/configuration/settings.md',
    },
    'qwen-checkpointing-docs-site': {
      label: 'Qwen Code 文档站 Checkpointing 页（影子 Git 快照、`--checkpointing` 与 `general.checkpointing.enabled`）',
      url: 'https://qwenlm.github.io/qwen-code-docs/en/users/features/checkpointing/',
    },
    'qwen-compress-commands-v0251preview1': {
      label: 'Qwen Code v0.25.1-preview.1 命令文档（`/compress`、`/compress-fast` 与 `/model --compaction`）',
      url: 'https://github.com/QwenLM/qwen-code/blob/683f3f063aa05c67c339a70fbc740f08c006f9de/docs/users/features/commands.md',
    },
    'qwen-autocompact-settings-v0251preview1': {
      label: 'Qwen Code v0.25.1-preview.1 设置文档（`context.autoCompactThreshold`、`compactionModel` 与 `model.chatCompression.*`）',
      url: 'https://github.com/QwenLM/qwen-code/blob/683f3f063aa05c67c339a70fbc740f08c006f9de/docs/users/configuration/settings.md',
    },
    'qwen-subagents-v0251preview1': {
      label: 'Qwen Code v0.25.1-preview.1 Subagent 文档（未描述 Subagent 压缩阈值）',
      url: 'https://github.com/QwenLM/qwen-code/blob/683f3f063aa05c67c339a70fbc740f08c006f9de/docs/users/features/sub-agents.md',
    },
    'qwen-clear-context-idle-settings': {
      label:
        'Qwen Code v0.25.1 设置文档 `context.clearContextOnIdle.*` 三键（空闲 60 分钟清理旧工具结果、保留最近 5 条、总量 500000 字符软阈值，理由是让后续回合继续复用 Provider 提示词缓存）',
      url: 'https://github.com/QwenLM/qwen-code/blob/c1a8218f38203e272e6e965778ed6a2795cfeed7/docs/users/configuration/settings.md',
    },
    'qwen-clear-context-idle-schema': {
      label:
        'Qwen Code v0.25.1 设置 schema 源码（`clearContextOnIdle` 三键默认值、`requiresRestart: false`、`showInDialog: false`）',
      url: 'https://github.com/QwenLM/qwen-code/blob/c1a8218f38203e272e6e965778ed6a2795cfeed7/packages/cli/src/config/settingsSchema.ts',
    },
    'qwen-clear-context-idle-defaults': {
      label:
        'Qwen Code v0.25.1 `clearContextDefaults.ts`（`DEFAULT_TOOL_RESULTS_TOTAL_CHARS_THRESHOLD = 500_000`）',
      url: 'https://github.com/QwenLM/qwen-code/blob/c1a8218f38203e272e6e965778ed6a2795cfeed7/packages/core/src/config/clearContextDefaults.ts',
    },
    'qwen-subagents-v0251preview2': {
      label:
        'Qwen Code v0.25.1-preview.2 Subagent 文档（Model Selection 小节：`model` 四种选择器、省略等同 `inherit`、`agents.builtin.exploreModel`、`agents.modelGrades` 与 `agents.allowedGrades`、外部 executor 不支持模型覆盖）',
      url: 'https://github.com/QwenLM/qwen-code/blob/d381509d32e62a992a344de33207d54f436bcefc/docs/users/features/sub-agents.md',
    },
    'qwen-session-headless': {
      label: 'Qwen Code current headless mode',
      url: 'https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/headless.md',
    },
    'qwen-structured-current': {
      label: 'Qwen Code current structured output',
      url: 'https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/structured-output.md',
    },
    'qwen-sdk-current': {
      label: 'Qwen Code current TypeScript SDK',
      url: 'https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/sdk-typescript/README.md',
    },
    'qwen-serve-current': {
      label: 'Qwen Code current daemon and Web Shell',
      url: 'https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/qwen-serve.md',
    },
    'qwen-serve-v0251': {
      label:
        'Qwen Code v0.25.1 的 `qwen serve` 文档（“Run Qwen Code as a local HTTP daemon”、默认 `127.0.0.1:4170`、`--max-sessions` 默认 32、`--require-auth`、`QWEN_SERVER_TOKEN`、“Status: Stage 1 (experimental)” 与 “🚧 v0.16-alpha”、systemd/launchd/nohup/tmux 与 Local launch templates）',
      url: 'https://github.com/QwenLM/qwen-code/blob/c1a8218f38203e272e6e965778ed6a2795cfeed7/docs/users/qwen-serve.md',
    },
    'qwen-serve-v0260': {
      label:
        'Qwen Code v0.26.0 标签的 `qwen serve` 文档（`docs/users/qwen-serve.md`，标签提交 `ac97ce7a70d9b2ea5d62b357e3d9b0851423afc9`，218,629 字节；官方文档站同页标题为 “Daemon mode (`qwen serve`)”）“Inspect and control a local daemon” 一节逐字给出七行示例 `qwen daemon start --port 4170      # detached; waits for the discovery record`、`qwen daemon status                 # ports, PIDs, workspaces, and health`、`qwen daemon status --json          # one JSON object per daemon`、`qwen daemon status --detail        # version, uptime, sessions, and issues`、`qwen daemon logs --port 4170 -f    # follow the recorded log file`、`qwen daemon stop --port 4170       # SIGTERM the recorded process` 与 `qwen daemon restart --port 4170    # stop, then start with the recorded settings`；同页逐字为 “`qwen daemon start` spawns `qwen serve` detached, waits for its discovery record, and prints the bound URL, PID, log path, and stop command.”、“Records live under the runtime directory (`$QWEN_RUNTIME_DIR`, `$QWEN_HOME`, or `~/.qwen`) in `daemon/daemon-<port>.json`. They are `0600` on POSIX and never contain the bearer token.”、“A record left by a crashed daemon is reported as `stale`; `status --prune` or `stop` removes it.”、“`stop` sends `SIGTERM` only after the listener answers `/health` or its PID is still alive; `--force` adds `SIGKILL` after the graceful timeout. When more than one daemon is registered, pass `--port`; `stop` also accepts `--all`.”、“`--wait` waits until the runtime is serving (no `daemon_runtime_starting` issue and not `error`); a timeout keeps the startup log and exits non-zero.”、“`qwen daemon restart` stops one registered daemon through `daemon stop` and starts it again through `daemon start --wait` on its recorded port and hostname, with its recorded startup workspaces, Web Shell mode, and `--require-auth` setting”、“`--web`/`--no-web` 与 `--require-auth`/`--no-require-auth` override the record.”、“`--force` is forwarded to `daemon stop` only when you pass it.”、“`status --detail` asks the daemon for its own status: version, uptime, active sessions, and issue count. It sends `QWEN_SERVER_TOKEN` only when the record says the daemon uses a bearer and the recorded process is alive, addressable, and started when the record says it did; a record whose recorded PID namespace this process cannot address is never sent the bearer. Without a token, a daemon that requires a bearer reports that authentication is required.”、“The startup log is `0600` and is removed after a successful start.” 与 “`GET /daemon/status` is the consolidated troubleshooting snapshot. The default `detail=summary` reads only in-memory daemon state (sessions, permissions, SSE/ACP transport counts, rate limit rejects, process memory, resolved limits) and does not start the ACP child. Use `GET /daemon/status?detail=full` for per-session diagnostics, ACP connection details, auth device-flow counts, and workspace status sections when you are actively investigating a problem.”；状态标记仍是 “**Status:** Stage 1 (experimental).” 与 “**🚧 v0.16-alpha**: `qwen serve` first ships to npm in v0.16-alpha as **text-only chat / coding** with **local-only deployment**.”，默认绑定仍写 “The default bind is `127.0.0.1:4170`.”，全页没有任何自动启动 daemon 的说法，常驻方式仍列 systemd/launchd/`nohup &`/tmux',
      url: 'https://github.com/QwenLM/qwen-code/blob/ac97ce7a70d9b2ea5d62b357e3d9b0851423afc9/docs/users/qwen-serve.md',
    },
    'qwen-serve-docs-site': {
      label:
        'Qwen Code 官方文档站 Daemon mode (`qwen serve`) 页（2026-10-22 抓取，与仓库 `docs/users/qwen-serve.md` 同源，含同一组 `qwen daemon` 的 start、status、logs、stop、restart 五行示例与 `daemon/daemon-<port>.json` 发现记录说明）；同站另有 “Daemon Mode (Developer Deep Dive)” 21 页开发者专章（00-index 至 20-quickstart-operations）与 Daemon Client Adapters、Daemon UI 两组文档',
      url: 'https://qwenlm.github.io/qwen-code-docs/en/users/qwen-serve/',
    },
    'qwen-daemon-command-v0260': {
      label:
        'Qwen Code v0.26.0 标签的 `qwen daemon` 命令源码（`packages/cli/src/commands/daemon.ts`，54,330 字节）：根命令 `command: \'daemon\'`、`describe: \'Inspect and control local qwen serve daemons\'`，五个子命令的 describe 逐字为 start “Start a local qwen serve daemon in the background”、status “List local qwen serve daemons and their health”、logs “Show or follow a local daemon log file”、stop “Stop a local qwen serve daemon” 与 restart “Restart a local qwen serve daemon on its recorded port and workspaces”；`start` 选项为 `port`（number，“TCP port (default 4170; 0 picks an ephemeral port)”）、`hostname`（string，默认 `127.0.0.1`）、`workspace`（string 数组，“repeat for multiple; defaults to the current directory”）、`web`（boolean，默认 `true`，“use --no-web for API-only”）、`require-auth`（boolean，默认 `false`）、`token`（string，“prefer QWEN_SERVER_TOKEN”）、`wait`（boolean，默认 `false`）与 `json`（boolean，默认 `false`）；`status` 选项为 `json`、`prune`（“Remove records whose process is gone”）与 `detail`（“Fetch /daemon/status for version, uptime, active sessions, and issue count”）；`logs` 选项为 `port`（“required when more than one is registered”）、`follow`（别名 `f`）与 `lines`（别名 `n`，默认 50）；`stop` 选项为 `port`、`all`（“Stop every registered daemon”）与 `force`（“SIGKILL a daemon that does not exit after SIGTERM”）；`restart` 选项为 `port`、`token`、`web`、`require-auth` 与 `force`（“Pass --force to daemon stop: confirm the Windows hard kill, or SIGKILL a POSIX daemon that does not exit after SIGTERM”）；常量为 `HEALTH_TIMEOUT_MS = 1_000`、`DETAIL_TIMEOUT_MS = 1_500`、`STOP_TIMEOUT_MS = 10_000`、`STOP_POLL_MS = 100`、`FOLLOW_POLL_MS = 250`、`PROCESS_START_TOLERANCE_MS = 5_000`、`PROCESS_START_LEAD_MS = 10 * 60_000`、`START_TIMEOUT_MS = 30_000`、`START_POLL_MS = 100`、`START_READY_TIMEOUT_MS = 30_000`、`START_READY_POLL_MS = 250` 与 `START_LOG_MAX_AGE_MS = 24 * 60 * 60_000`；健康状态只有 `running`/`stale`/`unreachable` 三种（`/health` 有响应即算活，含 401），Windows 下 `stop` 未带 `--force` 时报 “qwen daemon: Windows stop is a hard kill; pass --force to confirm (shutdown handlers do not run).” 并由 `terminateTree()` 调 `%SystemRoot%\\System32\\taskkill.exe` 以 `/pid <pid> /T /F` 结束进程树、成功文案用 `hard-killed` 而非 `stopped`；同一工作区重复 `start` 且未传 `--port` 时报 “qwen daemon: a daemon is already running for ${primary} on port ${existing.record.port}; pass --port to start another.”；启动失败打印日志末 40 行；启动日志名为 `start-${process.pid}-${Date.now()}.log`，目录 mode `0o700`、日志 fd mode `0o600`，无文件 sink 时回落到运行时目录的 `debug/daemon/daemon.log`',
      url: 'https://github.com/QwenLM/qwen-code/blob/ac97ce7a70d9b2ea5d62b357e3d9b0851423afc9/packages/cli/src/commands/daemon.ts',
    },
    'qwen-daemon-discovery-commit': {
      label:
        'Qwen Code 合入提交 `35e0b4960def3af880862f18eab636908830dd26`（PR #14739，2026-10-20T00:50:38Z 合入 main，标题 “feat(serve): add local daemon discovery and control commands”）：新增 `packages/cli/src/serve/daemon-discovery.ts`、`packages/cli/src/commands/daemon.ts` 与 `docs/design/2026-10-19-daemon-discovery-and-control.md`，PR 说明逐字为 “Adds a local discovery record and a small control surface for `qwen serve`. Each daemon publishes its bound URL, PID, registered workspaces, and log path under the runtime directory once the listener is ready. A new `qwen daemon` command exposes `status`, `logs`, and `stop`, so a second terminal no longer has to parse startup output or search the process table.” 与 “`GET /daemon/status` existed but had no CLI entry point.”，并记录发现记录权限 `0700`/`0600` 且不含 bearer token、`stop` 只在监听器应答 `/health` 或 PID 仍存活时发信号、记录携带写入方 `pidNamespace` 因而跨容器不可寻址的 PID 不会被误杀、删除记录时校验 `expectedPid`、写记录失败只向 stderr 告警而不阻断 `qwen serve` 启动、自签名 TLS 证书的 daemon 在 `status` 里可能显示为 `unreachable`',
      url: 'https://github.com/QwenLM/qwen-code/commit/35e0b4960def3af880862f18eab636908830dd26',
    },
    'qwen-daemon-start-commit': {
      label:
        'Qwen Code 合入提交 `f4f3749f3661712d28d72a05e1a9436594e457b9`（PR #14869，2026-10-20T11:05:34Z 合入 main，标题 “feat(serve): add qwen daemon start”）：PR 说明逐字为 “Adds `qwen daemon start`, which launches `qwen serve` as a detached child, waits for the child to publish its discovery record, and returns to the shell with the bound URL, PID, log path, and stop command. It removes the launching session\'s identifiers and private capability bindings from the child environment, passes a supplied token through the environment rather than the child\'s arguments, and keeps startup output in a private file that is removed after a successful start.” 与 “Starting a local daemon previously required systemd, tmux, or `nohup`.”；风险段逐字为 “The log is `0600` and removed after success; on failure it is kept and its tail is printed. A non-loopback bind requires `QWEN_SERVER_TOKEN`, and the child is always started with `--no-token-qr` so a token cannot enter the startup log. There is no supervision or crash restart.” 与 “No service installation or restart command is included.”',
      url: 'https://github.com/QwenLM/qwen-code/commit/f4f3749f3661712d28d72a05e1a9436594e457b9',
    },
    'qwen-daemon-start-design-v0260': {
      label:
        'Qwen Code v0.26.0 标签的 daemon start 设计文档（`docs/design/2026-10-20-daemon-start.md`，4,453 字节，标题 “Background daemon start”）Status 一节逐字为 “Implemented in this change. `qwen daemon start` is local process management; it does not change the serve protocol, authentication, or workspace isolation.”，Problem 一节逐字为 “Starting a local daemon required a service manager, tmux, or `nohup`. The discovery record and `qwen daemon stop` already made a running daemon inspectable, but there was no supported way to start one and return to the shell.”；同标签下没有 `docs/design/2026-10-21-daemon-token.md`（返回 404），即 PR #15023 的 daemon token 持久化不在 v0.26.0 之内',
      url: 'https://github.com/QwenLM/qwen-code/blob/ac97ce7a70d9b2ea5d62b357e3d9b0851423afc9/docs/design/2026-10-20-daemon-start.md',
    },
    'qwen-daemon-lifecycle-commits': {
      label:
        'Qwen Code 补齐 daemon 生命周期的三个合入提交：`171f8a6d4d11961e3c61e65e9a5e0d21339737d4`（PR #14902，2026-10-20T13:32:46Z，“feat(serve): add daemon status detail”）、`69b3149654315d15eb60639a4069beec9d1b75c8`（PR #14914，2026-10-20T15:23:31Z，“feat(serve): add daemon start --wait”）与 `a8616497861fd779a0a90d3d2986b5327211f03d`（PR #14929，2026-10-21T05:00:39Z，“feat(serve): add daemon restart”）；五个 daemon PR 连同 #14739 与 #14869 都列在 [v0.26.0 Release](https://github.com/QwenLM/qwen-code/releases/tag/v0.26.0)（2026-10-21T23:20:53Z 发布，标签提交 `ac97ce7a70d9b2ea5d62b357e3d9b0851423afc9`）的 Features 清单里；`e63a0bfc23d2b97eddae7fefd02ab1c13552f30c`（PR #15023，2026-10-21T15:06:39Z，“feat(serve): add daemon token persistence”）虽早于标签发布时间，却既不在 v0.26.0 的 Release 清单里、其设计文档在该标签下也返回 404，即 main-only 未发布',
      url: 'https://github.com/QwenLM/qwen-code/releases/tag/v0.26.0',
    },
    'qwen-web-shell-image-dnd': {
      label: 'Qwen Code Web Shell image drag and drop commit',
      url: 'https://github.com/QwenLM/qwen-code/commit/e46586782cf8fc85d535051830bcc743bcd6b47a',
    },
    'qwen-web-shell-image-design': {
      label: 'Qwen Code Web Shell image drag and drop design document',
      url: 'https://github.com/QwenLM/qwen-code/blob/e46586782cf8fc85d535051830bcc743bcd6b47a/docs/design/web-shell/web-shell-image-drag-and-drop.md',
    },
    'qwen-web-shell-image-ingestion': {
      label: 'Qwen Code Web Shell image ingestion source',
      url: 'https://github.com/QwenLM/qwen-code/blob/e46586782cf8fc85d535051830bcc743bcd6b47a/packages/web-shell/client/utils/imageIngestion.ts',
    },
    'qwen-web-shell-file-upload-commit': {
      label: 'Qwen Code Web Shell workspace file upload commit',
      url: 'https://github.com/QwenLM/qwen-code/commit/a8bcaefea72daa528faba0b7aa1189e4a695cf01',
    },
    'qwen-web-shell-file-upload-design': {
      label: 'Qwen Code Web Shell workspace file upload design document',
      url: 'https://github.com/QwenLM/qwen-code/blob/a8bcaefea72daa528faba0b7aa1189e4a695cf01/docs/design/web-shell-file-upload.md',
    },
    'qwen-web-shell-file-upload-policy': {
      label: 'Qwen Code Web Shell upload policy source',
      url: 'https://github.com/QwenLM/qwen-code/blob/a8bcaefea72daa528faba0b7aa1189e4a695cf01/packages/cli/src/serve/fs/policy.ts',
    },
    'qwen-web-shell-file-upload-capabilities': {
      label: 'Qwen Code daemon workspace file upload capability source',
      url: 'https://github.com/QwenLM/qwen-code/blob/a8bcaefea72daa528faba0b7aa1189e4a695cf01/packages/cli/src/serve/capabilities.ts',
    },
    'qwen-v02112-preview3-release': {
      label: 'Qwen Code v0.21.12-preview.3 release notes',
      url: 'https://github.com/QwenLM/qwen-code/releases/tag/v0.21.12-preview.3',
    },
    'qwen-web-shell-text-attachments-commit': {
      label: 'Qwen Code Web Shell text file attachments commit',
      url: 'https://github.com/QwenLM/qwen-code/commit/34cc1c3ede6949ec81a456615f7b8e64090f4d40',
    },
    'qwen-web-shell-text-ingestion': {
      label: 'Qwen Code Web Shell text attachment ingestion source',
      url: 'https://github.com/QwenLM/qwen-code/blob/34cc1c3ede6949ec81a456615f7b8e64090f4d40/packages/web-shell/client/utils/imageIngestion.ts',
    },
    'qwen-web-shell-text-editor': {
      label: 'Qwen Code Web Shell composer drop routing source',
      url: 'https://github.com/QwenLM/qwen-code/blob/34cc1c3ede6949ec81a456615f7b8e64090f4d40/packages/web-shell/client/components/ChatEditor.tsx',
    },
    'qwen-v02112-preview5-release': {
      label: 'Qwen Code v0.21.12-preview.5 release notes',
      url: 'https://github.com/QwenLM/qwen-code/releases/tag/v0.21.12-preview.5',
    },
    'qwen-desktop-current': {
      label: 'Qwen Code Desktop 壳 README（Tauri 2）',
      url: 'https://github.com/QwenLM/qwen-code/blob/e3c5360e5a718549f7ace9be61ef830ed097a81a/packages/desktop/README.md',
    },
    'qwen-desktop-tauri-conf': {
      label: 'Qwen Code Desktop Tauri 配置（bundle 目标、平台要求与 updater 端点）',
      url: 'https://github.com/QwenLM/qwen-code/blob/e3c5360e5a718549f7ace9be61ef830ed097a81a/packages/desktop/src-tauri/tauri.conf.json',
    },
    'qwen-desktop-v0250-release': {
      label: 'Qwen Code Desktop v0.25.0 Release 与安装包',
      url: 'https://github.com/QwenLM/qwen-code/releases/tag/desktop-v0.25.0',
    },
    'qwen-desktop-tauri-rename': {
      label: 'Qwen Code desktop-shell 改名为 desktop 提交（PR #12653）',
      url: 'https://github.com/QwenLM/qwen-code/commit/73aa65a4b41e674e8729011a648e8f0a577902f2',
    },
    'qwen-desktop-electron-removal': {
      label: 'Qwen Code 移除 Electron 桌面包提交（PR #9085）',
      url: 'https://github.com/QwenLM/qwen-code/commit/ce72ddbe6cfe3c10fe51a0f7cd0116320b690529',
    },
    'qwen-desktop-update-bridge': {
      label: 'Qwen Code Electron→Tauri 更新桥设计文档',
      url: 'https://github.com/QwenLM/qwen-code/blob/e3c5360e5a718549f7ace9be61ef830ed097a81a/docs/design/desktop-electron-to-tauri-update-bridge.md',
    },
    'qwen-acp-current': {
      label: 'Qwen Code current ACP integration',
      url: 'https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/integration-zed.md',
    },
    'qwen-worktree-current': {
      label: 'Qwen Code current worktree',
      url: 'https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/worktree.md',
    },
    'qwen-worktree-v0247': {
      label: 'Qwen Code v0.24.7 Worktree 文档（清扫守卫与 `working_dir` 后台规则）',
      url: 'https://github.com/QwenLM/qwen-code/blob/b12edec1401a28fc53cd9e714d5928b285071fc8/docs/users/features/worktree.md',
    },
    'qwen-mcp-current': {
      label: 'Qwen Code current MCP',
      url: 'https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/mcp.md',
    },
    'qwen-skills-current': {
      label: 'Qwen Code current Skills',
      url: 'https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/skills.md',
    },
    'qwen-skills-disabled-levels': {
      label: 'Qwen Code disabled skill levels',
      url: 'https://github.com/QwenLM/qwen-code/commit/de022664dc59a3c2f7af083acaaba6a86f14115c',
    },
    'qwen-skill-learning': {
      label: 'Qwen Code skill learning and curation',
      url: 'https://github.com/QwenLM/qwen-code/blob/8673151ebdb1e6a101bc4cb3e2c2beb6e0141b7c/docs/users/features/skills.md',
    },
    'qwen-hooks-current': {
      label: 'Qwen Code current Hooks',
      url: 'https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/hooks.md',
    },
    'qwen-hooks-failure-current': {
      label: 'Qwen Code current Hooks（失败与超时语义复核）',
      url: 'https://github.com/QwenLM/qwen-code/blob/d13ff87407d673c547726b43928dedba0465ffa1/docs/users/features/hooks.md',
    },
    'qwen-hooks-order': {
      label:
        'Qwen Code `docs/users/features/hooks.md`（提交 `52ae53b02a17d6214e9e4f81578f2ba2725539a6`，96,225 字节，2026-10-19 复核执行顺序与并发）：逐字为 “By default, hooks execute in parallel for better performance”、“Use `sequential: true` in hook definition to enforce order-dependent execution”、“Sequential hooks can modify input for subsequent hooks in the chain”、“When hooks run in parallel, they all receive the same input, the last replacement in configuration order wins, and an invalid replacement from any of them stops the call. Hooks that run sequentially each receive the previous replacement as `tool_input`.”、“When several calls from one turn are scheduled together, as in the interactive terminal UI, every call\'s hooks run before any of them runs.”、“A shell command that a hook could still rewrite is not run in parallel with other tool calls.”；`MessageDisplay` 一类中途 Hook 另有 “At most one mid-stream hook execution per message is in flight at a time; while one runs, newer debounced payloads _replace_ the queued one rather than piling up behind it.”；`async: true` 逐字为 “Only `command` type supports asynchronous execution. Setting `"async": true` runs the hook in the background without blocking the main flow.” 与 “Occupies one of 10 concurrent async hook slots until it finishes or reaches its `timeout` (60 seconds by default). While all 10 slots are in use, a new async hook is skipped”；事件表在核对日期列出 22 个事件（`PreToolUse`、`PostToolUse`、`PostToolUseFailure`、`PostToolBatch`、`UserPromptSubmit`、`UserPromptExpansion`、`SessionStart`、`SessionEnd`、`SessionDelete`、`MessageDisplay`、`Stop`、`StopFailure`、`SubagentStart`、`SubagentStop`、`PreCompact`、`PostCompact`、`Notification`、`PermissionRequest`、`PermissionDenied`、`TodoCreated`、`TodoCompleted`、`InstructionsLoaded`）',
      url: 'https://github.com/QwenLM/qwen-code/blob/52ae53b02a17d6214e9e4f81578f2ba2725539a6/docs/users/features/hooks.md',
    },
    'qwen-hooks-headless-gate': {
      label:
        'Qwen Code 提交 `52ae53b02a17d6214e9e4f81578f2ba2725539a6`（PR #14356 “fix(hooks): gate headless file and skill prompts before expansion”，2026-10-16 合入 main）在 `docs/users/features/hooks.md` 新增的段落逐字为 “In headless runs, an input that invokes a custom command or skill, including several stacked skills, is checked before the command expands. The hook runs once for that input, with `prompt` and `submitted_prompt` both set to the raw input, such as `/deploy staging`. A block stops the command before it runs: its `!{...}` shell commands do not run, a skill does not register its allowed tools or hooks, and no model request is made. When the input is allowed, its `additionalContext` is added once to the expanded prompt, and `UserPromptExpansion` still runs after the expansion. Hooks that the skill registers do not check the input that invoked it. Other slash commands, MCP prompts and saved workflows, and the interactive UI and ACP sessions, still run the hook on the expanded prompt.”',
      url: 'https://github.com/QwenLM/qwen-code/commit/52ae53b02a17d6214e9e4f81578f2ba2725539a6',
    },
    'qwen-v0253-release': {
      label:
        'Qwen Code Release v0.25.3（2026-10-19T06:06:37Z 发布，稳定通道，标签提交 `b28b0d948fa28b89750ac5f1525b95e1746f47ab`）：Features 逐字列出 “feat(mods): support commands in interactive terminals (PR4a) (#14268)”，Bug Fixes 逐字列出 “fix(hooks): gate headless file and skill prompts before expansion (#14356)”，即交互终端 mod 命令与 headless 提示词门禁都随该稳定版发布；此前记录的「稳定通道最新 Release 仍是 v0.25.2、尚未包含 #14356」随之过期',
      url: 'https://github.com/QwenLM/qwen-code/releases/tag/v0.25.3',
    },
    'qwen-mods-docs': {
      label:
        'Qwen Code `docs/users/extension/mods.md`（标签 v0.25.3，提交 `b28b0d948fa28b89750ac5f1525b95e1746f47ab`，24,532 字节，2026-10-19 复核）：逐字为 “Qwen Code can run a small subset of the Claude Code Mod API in headless and interactive terminal sessions.”、“This feature is opt-in and requires a trusted workspace and an enabled Claude or native Qwen extension. Agent Plugins v1 packages continue to ignore hooks.” 与 “This is a supported subset, not full compatibility with existing Claude Mods.”；开启键 `experimental.mods: true`（默认关闭），mod 目录形如 `hello-mod/.claude-plugin/plugin.json` + `hooks/hooks.json`（`{ "modules": ["./register.js"] }`，路径相对该文件且必须在扩展内部）+ `hooks/register.js`，入口为单个 `.js`/`.mjs`/`.cjs`/`.ts`/`.mts`/`.cts` ESM 文件，安装用 `qwen extensions install ./hello-mod --consent`；隔离逐字为 “Separate QuickJS environment per plugin inside a session worker; no Node, filesystem or network APIs; memory, stack, source/output and execution limits”；事件为 `session.start`/`session.end`/`command.run`/`command.register`/`ui.log`/`tool.call`/`tool.check`，命令在 `session.start` 期间用 `$.command.register({ name, description, argumentHint })` 注册且 “Commands cannot return `context`, `exitCode` or engine references yet.”；`$.ui.log` 写 transcript（text 模式走 stderr、JSON 模式走 `system/ui_log`，都不成为模型输入，每条上限 2,000 字符）；模块变量在 stream-json 或交互进程里跨回合保留、clear/resume 不重载模块，`state`/`store` 未实现；工具拦截 “available only in headless sessions”，交互终端 “currently covers commands, lifecycle and logs”、显式 `tool.call`/`tool.check`/`tool.*` 注册在模型请求前拒绝初始化，`tool.call` 返回 `{deny: reason}` 阻断或 `{result: value}` 直接给结果、`tool.check` 的 `next` 返回带 `decision`（`allow`/`ask`/`deny`）的对象；Surface 逐字为 “Mods do not run in ACP, managed/SSH, sandbox or session-agent entry points in this version.”；信任逐字为 “requires a trusted workspace” 与 “Safe mode, bare mode and `disableAllHooks` also prevent loading.”；权限逐字为 “a Mod cannot upgrade a native deny or ask to allow.”、“A Mod-authored `rule`, `hook` or `ceiling` cannot create host permissions.” 与 “Every ordinary `tool.call` next starts a fresh native tool attempt: validation, classic hooks, permissions, approvals and invocation guards all still apply.”；未实现项逐字为 “JSX/TSX, runtime package imports, built-in command interception, tool registration and active `$.tool` APIs, context, state/store, rendering, streaming events and hot reload are not implemented.” 与 “Child agents and nested code-mode schedulers do not inherit this middleware.”；`pluginConfigs.<mod>.toolDialect` 取 `claude` 或 `native`（默认），工具名映射 `run_shell_command`↔`Bash`、`edit`↔`Edit`、`write_file`↔`Write`，选项按 “SystemDefaults → User → System precedence, merging individual option keys. Workspace settings are ignored even in trusted workspaces.”；作者 API 基于 Claude Code 2.1.296 声明、再入行为遵循 Claude Code 2.1.301',
      url: 'https://github.com/QwenLM/qwen-code/blob/b28b0d948fa28b89750ac5f1525b95e1746f47ab/docs/users/extension/mods.md',
    },
    'qwen-mods-interactive-commit': {
      label:
        'Qwen Code 提交 `2eafeebc556075b24c5a922f2b565254195e4692`（PR #14268 “feat(mods): support commands in interactive terminals (PR4a)”，2026-10-16T10:20:23Z 合入 main）：把此前只支持 headless 会话的隔离 mod 运行时接到 Ink 与 OpenTUI 两个交互终端渲染器，受信任且启用的插件注册的 Slash 命令进入补全、不发起模型请求即可运行、跨命令与已提交会话切换保留模块状态并响应 `Esc` 取消，命令拿到当前终端 presentation 与 composer origin，transcript 日志不进模型输入；改动文件含 `docs/users/extension/mods.md`、`packages/cli/src/services/interactive-mod-session.ts` 与 `packages/core/src/mods/runtime.ts`',
      url: 'https://github.com/QwenLM/qwen-code/commit/2eafeebc556075b24c5a922f2b565254195e4692',
    },
    'qwen-v0253-preview0-release': {
      label:
        'Qwen Code v0.25.3-preview.0 Release（2026-10-16T18:28Z 发布，标签提交 `d407c0bb3823118281fbfc178494f4525a2241b8`）：发布说明逐字列出 “fix(hooks): gate headless file and skill prompts before expansion by @qqqys in #14356”；稳定通道最新 Release 仍是 v0.25.2（2026-10-15T15:41:15Z），早于该提交',
      url: 'https://github.com/QwenLM/qwen-code/releases/tag/v0.25.3-preview.0',
    },
    'qwen-extensions-current': {
      label: 'Qwen Code current Extensions',
      url: 'https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/extension/introduction.md',
    },
    'qwen-extension-runtime-current': {
      label: 'Qwen Code current Extension runtime',
      url: 'https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/core/src/extension/extensionManager.ts',
    },
    'qwen-qoder-plugin-compat': {
      label: 'Qwen Code Qoder plugin compatibility commit',
      url: 'https://github.com/QwenLM/qwen-code/commit/0a6c50c7a7241b42ddce0acd0fde0a6f70bcdf9e',
    },
    'qwen-qoder-plugin-docs': {
      label: 'Qwen Code Qoder plugin installation documentation',
      url: 'https://github.com/QwenLM/qwen-code/blob/0a6c50c7a7241b42ddce0acd0fde0a6f70bcdf9e/docs/users/extension/introduction.md',
    },
    'qwen-v0219-release': {
      label: 'Qwen Code v0.21.9 release notes',
      url: 'https://github.com/QwenLM/qwen-code/releases/tag/v0.21.9',
    },
    'qwen-agent-plugins-v1-docs': {
      label: 'Qwen Code Agent Plugins v1 documentation',
      url: 'https://github.com/QwenLM/qwen-code/blob/a64d1291d2f6298f67763d0953b1653cf7b34060/docs/users/extension/agent-plugins.md',
    },
    'qwen-agent-plugins-v1-commit': {
      label: 'Qwen Code Agent Plugins v1 native loading commit',
      url: 'https://github.com/QwenLM/qwen-code/commit/a64d1291d2f6298f67763d0953b1653cf7b34060',
    },
    'qwen-v02111-preview-release': {
      label: 'Qwen Code v0.21.11-preview.0 release notes',
      url: 'https://github.com/QwenLM/qwen-code/releases/tag/v0.21.11-preview.0',
    },
    'qwen-v02111-release': {
      label: 'Qwen Code v0.21.11 release notes',
      url: 'https://github.com/QwenLM/qwen-code/releases/tag/v0.21.11',
    },
    'qwen-coordinate-docs': {
      label: 'Qwen Code multi-agent coordination documentation',
      url: 'https://github.com/QwenLM/qwen-code/blob/8858d4340bbbb46f693dd09767aaaadc7ec7cc9b/docs/users/features/multi-agent-coordination.md',
    },
    'qwen-coordinate-skill': {
      label: 'Qwen Code coordinate bundled Skill',
      url: 'https://github.com/QwenLM/qwen-code/blob/8858d4340bbbb46f693dd09767aaaadc7ec7cc9b/packages/core/src/skills/bundled/coordinate/SKILL.md',
    },
    'qwen-coordinate-commit': {
      label: 'Qwen Code native multi-agent coordination commit',
      url: 'https://github.com/QwenLM/qwen-code/commit/8858d4340bbbb46f693dd09767aaaadc7ec7cc9b',
    },
    'qwen-advisor-commit': {
      label: 'Qwen Code /advisor command commit',
      url: 'https://github.com/QwenLM/qwen-code/commit/18c9763f46ce95eb64f46038941618c4ea50dcce',
    },
    'qwen-advisor-docs': {
      label: 'Qwen Code /advisor command documentation',
      url: 'https://github.com/QwenLM/qwen-code/blob/18c9763f46ce95eb64f46038941618c4ea50dcce/docs/users/features/commands.md',
    },
    'qwen-advisor-source': {
      label: 'Qwen Code advisor command source',
      url: 'https://github.com/QwenLM/qwen-code/blob/18c9763f46ce95eb64f46038941618c4ea50dcce/packages/cli/src/ui/commands/advisor-command.ts',
    },
    'qwen-advisor-settings': {
      label: 'Qwen Code advisorModel setting documentation',
      url: 'https://github.com/QwenLM/qwen-code/blob/18c9763f46ce95eb64f46038941618c4ea50dcce/docs/users/configuration/settings.md',
    },
    'qwen-branch-any-commit': {
      label: 'Qwen Code session branching from any response commit',
      url: 'https://github.com/QwenLM/qwen-code/commit/9f8f65dde043c10cb6a13ea1d4a03928d83d98dc',
    },
    'qwen-branch-any-design': {
      label: 'Qwen Code assistant response session branching design document',
      url: 'https://github.com/QwenLM/qwen-code/blob/9f8f65dde043c10cb6a13ea1d4a03928d83d98dc/docs/design/web-shell/assistant-response-session-branching.md',
    },
    'qwen-branch-any-route': {
      label: 'Qwen Code daemon session branch route source',
      url: 'https://github.com/QwenLM/qwen-code/blob/9f8f65dde043c10cb6a13ea1d4a03928d83d98dc/packages/cli/src/serve/routes/session.ts',
    },
    'qwen-branch-any-sdk': {
      label: 'Qwen Code TypeScript SDK DaemonClient branchSession source',
      url: 'https://github.com/QwenLM/qwen-code/blob/9f8f65dde043c10cb6a13ea1d4a03928d83d98dc/packages/sdk-typescript/src/daemon/DaemonClient.ts',
    },
    'qwen-v02113-release': {
      label: 'Qwen Code v0.21.13 release notes',
      url: 'https://github.com/QwenLM/qwen-code/releases/tag/v0.21.13',
    },
    'qwen-sessions-ps-commit': {
      label: 'Qwen Code live-session registry commit',
      url: 'https://github.com/QwenLM/qwen-code/commit/a1e046eb6c5546e6aab2a004367e67c2af1673fd',
    },
    'qwen-sessions-ps-docs': {
      label: 'Qwen Code sessions command documentation (sessions ps)',
      url: 'https://github.com/QwenLM/qwen-code/blob/a1e046eb6c5546e6aab2a004367e67c2af1673fd/docs/users/features/commands.md',
    },
    'qwen-sessions-ps-source': {
      label: 'Qwen Code sessions ps command source',
      url: 'https://github.com/QwenLM/qwen-code/blob/a1e046eb6c5546e6aab2a004367e67c2af1673fd/packages/cli/src/commands/sessions/ps.ts',
    },
    'qwen-session-registry-source': {
      label: 'Qwen Code session registry source',
      url: 'https://github.com/QwenLM/qwen-code/blob/a1e046eb6c5546e6aab2a004367e67c2af1673fd/packages/core/src/services/session-registry.ts',
    },
    'qwen-v02114-release': {
      label: 'Qwen Code v0.21.14 release notes',
      url: 'https://github.com/QwenLM/qwen-code/releases/tag/v0.21.14',
    },
    'qwen-v0222-release': {
      label: 'Qwen Code v0.22.2 release notes (cross-session inbound messaging)',
      url: 'https://github.com/QwenLM/qwen-code/releases/tag/v0.22.2',
    },
    'qwen-peer-messaging-commit': {
      label: 'Qwen Code cross-session inbound messaging merge commit',
      url: 'https://github.com/QwenLM/qwen-code/commit/f9470f570a215616aa364aa174a565d3373df7b8',
    },
    'qwen-peers-command-source': {
      label: 'Qwen Code /peers command source',
      url: 'https://github.com/QwenLM/qwen-code/blob/f9470f570a215616aa364aa174a565d3373df7b8/packages/cli/src/ui/commands/peers-command.ts',
    },
    'qwen-peer-messaging-source': {
      label: 'Qwen Code peer messaging orchestration source',
      url: 'https://github.com/QwenLM/qwen-code/blob/f9470f570a215616aa364aa174a565d3373df7b8/packages/cli/src/peerMessaging/peer-messaging.ts',
    },
    'qwen-peer-inbound-gate-source': {
      label: 'Qwen Code inbound gate source',
      url: 'https://github.com/QwenLM/qwen-code/blob/f9470f570a215616aa364aa174a565d3373df7b8/packages/core/src/ipc/inbound-gate.ts',
    },
    'qwen-peer-inbox-source': {
      label: 'Qwen Code peer inbox socket source',
      url: 'https://github.com/QwenLM/qwen-code/blob/f9470f570a215616aa364aa174a565d3373df7b8/packages/core/src/ipc/uds-inbox.ts',
    },
    'qwen-peer-socket-path-source': {
      label: 'Qwen Code peer socket path source',
      url: 'https://github.com/QwenLM/qwen-code/blob/f9470f570a215616aa364aa174a565d3373df7b8/packages/core/src/ipc/socket-path.ts',
    },
    'qwen-peer-envelope-source': {
      label: 'Qwen Code peer message envelope source',
      url: 'https://github.com/QwenLM/qwen-code/blob/f9470f570a215616aa364aa174a565d3373df7b8/packages/core/src/ipc/peer-envelope.ts',
    },
    'qwen-peer-settings-schema': {
      label: 'Qwen Code v0.22.2 settings schema (crossSessionMessaging/crossSessionInbound)',
      url: 'https://github.com/QwenLM/qwen-code/blob/f9470f570a215616aa364aa174a565d3373df7b8/packages/cli/src/config/settingsSchema.ts',
    },
    'qwen-peer-wiring-source': {
      label: 'Qwen Code peer inbox settings gating source',
      url: 'https://github.com/QwenLM/qwen-code/blob/f9470f570a215616aa364aa174a565d3373df7b8/packages/cli/src/ui/startInteractiveUI.tsx',
    },
    'qwen-builtin-loader-v0222': {
      label: 'Qwen Code v0.22.2 built-in command loader (/peers)',
      url: 'https://github.com/QwenLM/qwen-code/blob/f9470f570a215616aa364aa174a565d3373df7b8/packages/cli/src/services/BuiltinCommandLoader.ts',
    },
    'qwen-commands-current': {
      label: 'Qwen Code current custom commands',
      url: 'https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/commands.md',
    },
    'qwen-commands-v0252': {
      label:
        'Qwen Code v0.25.2 自定义命令文档（标签 `v0.25.2` 提交 `8a415cb628db88844e0196bdfdcce83b4f88d812`，`docs/users/features/commands.md` 78,099 字节，与 2026-10-15 的 main 逐字节相同；`## 4. Custom Commands` 一节与本仓库此前固定的 `8a44b1b9f793` 版本逐字节相同。逐字要点：“Custom commands now use Markdown format with optional YAML frontmatter. TOML format is deprecated but still supported for backwards compatibility. When TOML files are detected, an automatic migration prompt will be displayed.”、“**Deprecated:** TOML format is still supported but will be removed in a future version. Please migrate to Markdown format.”；目录表两行为 `~/.qwen/commands/`（Global，Low）与 `<project root directory>/.qwen/commands/`（Project，High）加 “Priority Rules: Project commands > User commands (project command used when names are same)”；映射表为 `~/.qwen/commands/test.md` → `/test`、`<project>/.qwen/commands/git/commit.md` → `/git:commit` 加 “Naming Rules: Path separator (`/` or `\\`) converted to colon (`:`)”；参数机制三行为 `{{args}}` 上下文感知注入并自动 Shell 转义、无标记时原样追加、`!{command}` Shell 注入且执行前需要确认；处理顺序为 `@{file path}` 文件内容最先、`!{command}` Shell 居中、`{{args}}` 参数替换最后；Markdown frontmatter 只有可选的 `description`（在 `/help` 显示）与必填的提示正文，TOML 为必填 `prompt` 与可选 `description`；`/workflows` 行为 “Inspect workflow runs; cooperatively pause/resume a background run”，并写明 “`/workflows`, `/lsp`, and `/trust` are registered only when their feature is enabled — via the user/system-scoped `tools.workflowsEnabled` setting or `QWEN_CODE_ENABLE_WORKFLOWS=1` env var…”；全页只有 `/statusline` 一行含 preset 字样，指状态行布局预设对话框）',
      url: 'https://github.com/QwenLM/qwen-code/blob/8a415cb628db88844e0196bdfdcce83b4f88d812/docs/users/features/commands.md',
    },
    'qwen-saved-workflow-loader': {
      label:
        'Qwen Code 保存的 Workflow 加载器源码（main `c24e99e9cb74`，`@fileoverview` 逐字为 “Discovers saved workflow scripts under `.qwen/workflows/` (project) and `~/.qwen/workflows/` (user), plus the workflows active extensions ship, and exposes each as a `/<name>` slash command.” 与 “Typed in the interactive UI, the command dispatches the `workflow` tool with the file’s path; the script is read at execution time (by the tool), so edits take effect on the next invocation.”，即保存的是 JavaScript 编排脚本而不是可复用提示词文本）',
      url: 'https://github.com/QwenLM/qwen-code/blob/c24e99e9cb74ce616e0b3ff0e0e5b582dbf4b617/packages/cli/src/services/saved-workflow-loader.ts',
    },
    'qwen-ide-current': {
      label: 'Qwen Code current IDE integration',
      url: 'https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/ide-integration/ide-integration.md',
    },
    'qwen-tools-current': {
      label: 'Qwen Code current built-in tools',
      url: 'https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/core/src/tools/tool-names.ts',
    },
    'qwen-shell-current': {
      label: 'Qwen Code current shell tool',
      url: 'https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/core/src/tools/shell.ts',
    },
    'qwen-edit-tool': {
      label: 'Qwen Code current edit tool source',
      url: 'https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/core/src/tools/edit.ts',
    },
    'qwen-review-current': {
      label: 'Qwen Code current code review',
      url: 'https://github.com/QwenLM/qwen-code/blob/7dfc554dffcf52930ac35d4ea9c2558dfe36c22c/docs/users/features/code-review.md',
    },
    'qwen-github-current': {
      label: 'Qwen Code current GitHub Action',
      url: 'https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/integration-github-action.md',
    },
    'qwen-setup-github-current': {
      label: 'Qwen Code current GitHub setup',
      url: 'https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/cli/src/services/setup-github.ts',
    },
    'qwen-model-auth-current': {
      label: 'Qwen Code current authentication',
      url: 'https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/auth.md',
    },
    'qwen-model-providers-current': {
      label: 'Qwen Code current model providers',
      url: 'https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/model-providers.md',
    },
    'qwen-model-settings-current': {
      label: 'Qwen Code current settings',
      url: 'https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/settings.md',
    },
    'qwen-model-commands-current': {
      label: 'Qwen Code current commands',
      url: 'https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/features/commands.md',
    },
    'qwen-auth-qwencloud': {
      label:
        'Qwen Code 认证文档（提交 `428f686adec24ea26725ce86071ad9b0a5282120`，2026-10-17T18:09:38Z 的 main HEAD，29,030 字节）：开头逐字为 “Qwen Code\'s first-run `/auth` menu has four top-level options.”，四项为 **QwenCloud**（官方推荐，子菜单 **Token Plan**「subscription with a monthly Credit quota · dedicated endpoint, Personal and Team editions」与 **Standard API Key**「pay-as-you-go」，随后显式选平台 **China — 千问AI平台** 或 **International — QwenCloud**，逐字 “so the UI language never decides your endpoint”，两种访问方式都自动启用内置 `web_search`）、**Alibaba ModelStudio**（子菜单 Coding Plan / Token Plan / Standard API Key，逐字 “Saved ModelStudio credentials, endpoints and models keep working unchanged.”）、**Third-party Providers**（逐字列出 DeepSeek, Grok, MiniMax, Z.AI, Kimi, Idealab, ModelScope, OpenRouter, Requesty）与 **Custom Provider**（“manually connect a local server, proxy, or unsupported provider — supports OpenAI, Anthropic, Gemini, and other compatible endpoints”）；Option 1 给出四个端点（`https://maas.qianwenaiapi.com/compatible-mode/v1`、`https://token-plan.maas.qianwenaiapi.com/compatible-mode/v1`、`https://maas.qwencloudapi.com/compatible-mode/v1`、`https://token-plan.maas.qwencloudapi.com/compatible-mode/v1`）、Headless 用 `QWENCLOUD_API_KEY` 或 `QWENCLOUD_TOKEN_PLAN_API_KEY` 加 `OPENAI_BASE_URL`/`OPENAI_MODEL`、Token Plan key 前缀 `sk-sp-` 而按量付费 key 前缀 `sk-` 或 `sk-ws-`、Coding Plan 明确不在 QwenCloud 下提供；两个 note 逐字为 “`capabilities` is the one provider stamp that is never inferred from the model name, so a hand-written entry resolves with no reasoning declaration and `/effort` offers the generic tier list rather than QwenCloud\'s curated `low` / `medium` / `xhigh`. Use `/auth` to install the provider when you want the curated set.” 与 “QwenCloud and Alibaba ModelStudio are separate entries with separate env keys and endpoints. Choosing QwenCloud does not rewrite or delete saved ModelStudio credentials, endpoints, or model selections.”；另逐字写 provider 专属 Key 只有在 `settings.json` 条目把它声明为 `envKey` 后才生效，只用环境变量选 OpenAI 兼容认证要导出 `OPENAI_API_KEY`；Qwen OAuth 免费层 2026-04-15 停止、不再是可选对话框入口但仍在文档里作为硬编码的已下线 Provider 保留；Option 5 的协议表给出 `openai`/`anthropic`/`gemini`/`vertex-ai` 四行与各自的 Key 变量，Key 优先级为 CLI 旗标 > shell 环境 > `.env`（`.qwen/.env` → `.env` → `~/.qwen/.env` → `~/.env`，只加载找到的第一个且不合并）> `settings.json` 的 `env` 字段',
      url: 'https://github.com/QwenLM/qwen-code/blob/428f686adec24ea26725ce86071ad9b0a5282120/docs/users/configuration/auth.md',
    },
    'qwen-model-providers-head': {
      label:
        'Qwen Code Model Providers 文档（提交 `428f686adec24ea26725ce86071ad9b0a5282120`，66,889 字节）：`modelProviders` 的键是 provider id、值是 `ModelConfig[]`，内置 provider 的键必须是有效 auth type（`openai`、`anthropic`、`gemini`、`vertex-ai`），自定义 id 需要顶层 `providerProtocol` 映射到协议；Supported Auth Types 表另列 `qwen-oauth`（逐字 “hard-coded, cannot be overridden in `modelProviders`”）；未映射的自定义 id 整条被跳过并告警；每条模型至少要 `id`，`envKey` 可选且推荐（省略时回退该 auth type 的默认 Key 变量），另有 `name`、`description`、`baseUrl`、`generationConfig`、`wireApi`（只接受 `chat-completions` 与 `responses`，省略时 `openai` 走 Chat Completions）；逐字写 “Credentials are never persisted in settings; the runtime reads them from `process.env[envKey]`.”；热加载与重启边界逐字为 “`modelProviders` edits in `settings.json` are picked up by a running interactive session without a restart (the file watcher debounces ~300ms; reopen `/model` to see new entries, the current selection is kept)” 与 “`providerProtocol` is read once at startup and **requires a restart**.”；模型唯一性由协议 + `id` + `baseUrl` 决定，重复项跳过并告警；note 逐字为 “Only the `/model` command exposes non-default auth types. Anthropic, Gemini, etc., must be defined via `modelProviders`. The `/auth` command lists four top-level options: **QwenCloud** (with Token Plan and Standard API Key in its sub-menu), **Alibaba ModelStudio** (with Coding Plan, Token Plan, and Standard API Key in its sub-menu), **Third-party Providers**, and **Custom Provider**.”；Vertex AI 条目可用 Application Default Credentials（设 `GOOGLE_CLOUD_PROJECT`、可选 `GOOGLE_CLOUD_LOCATION` 默认 `global`、不设 `envKey`），任何 API Key 到达该条目会切到忽略 project/location/ADC 的 Vertex Express 模式，声明了 `envKey` 的条目永不走 ADC；传输层表给出 `openai` 用官方 OpenAI SDK、`openai-responses` 直接 HTTP/SSE 打 `/v1/responses`、`anthropic` 用 `@anthropic-ai/sdk`、`gemini` 用 `@google/genai`、`qwen-oauth` 用 openai SDK 加自定义 DashScope 兼容 Provider',
      url: 'https://github.com/QwenLM/qwen-code/blob/428f686adec24ea26725ce86071ad9b0a5282120/docs/users/configuration/model-providers.md',
    },
    'qwen-provider-registry': {
      label:
        'Qwen Code Provider 注册表 `packages/core/src/providers/all-providers.ts`（提交 `428f686adec24ea26725ce86071ad9b0a5282120`，3,672 字节）：`ALL_PROVIDERS` 注释为 “All known providers, in display order.”，顺序是 `qwencloudTokenPlanProvider`、`qwencloudStandardProvider`、`codingPlanProvider`、`tokenPlanProvider`、`alibabaStandardProvider`、`deepseekProvider`、`grokProvider`、`minimaxProvider`、`zaiProvider`、`moonshotProvider`、`idealabProvider`、`modelscopeProvider`、`openRouterProvider`、`requestyProvider`、`customProvider`；按 `uiGroup` 导出 `QWENCLOUD_PROVIDERS`、`ALIBABA_PROVIDERS` 与 `THIRD_PARTY_PROVIDERS` 三组；另有 `findProviderById`、按 baseUrl + envKey 匹配的 `findProviderByCredentials` 与用于 preconnect/校验的 `getAllProviderBaseUrls`；文件内注释要求新增读取新环境变量的 Provider 时同步 `.github/workflows/ci.yml` 与 `scripts/tests/no-ak-integration-ci.test.js` 的清空环境列表，否则 no-AK 门禁会泄漏 runner 凭据',
      url: 'https://github.com/QwenLM/qwen-code/blob/428f686adec24ea26725ce86071ad9b0a5282120/packages/core/src/providers/all-providers.ts',
    },
    'qwen-qwencloud-standard-preset': {
      label:
        'Qwen Code `packages/core/src/providers/presets/qwencloud-standard.ts`（提交 `428f686adec24ea26725ce86071ad9b0a5282120`，5,051 字节）：预设 id `qwencloud-standard`、label “Standard API Key”、description “Pay-as-you-go · Connect with an existing platform API key”、`protocol: AuthType.USE_OPENAI`、`envKey` 为常量 `QWENCLOUD_ENV_KEY = \'QWENCLOUD_API_KEY\'`；`baseUrl` 是两项数组 `cn-qianwenai`（label “China — 千问AI平台”，`https://maas.qianwenaiapi.com/compatible-mode/v1`）与 `intl-qwencloud`（label “International — QwenCloud”，`https://maas.qwencloudapi.com/compatible-mode/v1`），各自带 `documentationUrl` 与 `apiKeyUrl`；种子模型 `QWENCLOUD_MODELS` 为 qwen3.8-max（`efforts: [low, medium, xhigh]`、`defaultEffort: xhigh`、`disableField: reasoning_effort`、图像与视频模态）、qwen3.7-plus（`toggleOnly`、`disableField: enable_thinking`）、qwen3.8-flash、deepseek-v4-pro-0813 与 deepseek-v4.1-flash（`efforts: [low, high, max]`）、kimi-k3（`thinkingMandatory`、`canDisable: false`）、glm-5.3，全部 `contextWindowSize: 1000000`；`modelsEditable: true` 且 `supportsModelDiscovery: true`；`modelNamePrefix: \'QwenCloud Standard\'`；`apiKeyPlaceholder: \'sk-...\'`；`validateApiKey` 要求以 `sk-` 开头且不以 `sk-sp-` 开头，否则返回 “Invalid API key. Pay-as-you-go keys start with "sk-" or "sk-ws-". Token Plan keys ("sk-sp-") need the Token Plan entry instead.”；`webSearch: { backend: \'dashscope\' }` 并注明这些端点的 Responses API 用同一把 Key 提供服务端 `web_search`/`web_extractor`；`ownsModel` 以 envKey 加两个 baseUrl 判定归属；`uiGroup: \'qwencloud\'`、`uiLabels` 为 `flowTitle: \'QwenCloud\'` 与 `baseUrlStepTitle: \'Platform\'`',
      url: 'https://github.com/QwenLM/qwen-code/blob/428f686adec24ea26725ce86071ad9b0a5282120/packages/core/src/providers/presets/qwencloud-standard.ts',
    },
    'qwen-qwencloud-token-plan-preset': {
      label:
        'Qwen Code `packages/core/src/providers/presets/qwencloud-token-plan.ts`（提交 `428f686adec24ea26725ce86071ad9b0a5282120`，3,763 字节）：预设 id `qwencloud-token-plan`、label “Token Plan”、description “Subscription with a monthly Credit quota · Dedicated endpoint (Personal and Team editions)”、`protocol: AuthType.USE_OPENAI`、`envKey` 为 `QWENCLOUD_TOKEN_PLAN_ENV_KEY = \'QWENCLOUD_TOKEN_PLAN_API_KEY\'`；两个 baseUrl 为 `https://token-plan.maas.qianwenaiapi.com/compatible-mode/v1`（China — 千问AI平台）与 `https://token-plan.maas.qwencloudapi.com/compatible-mode/v1`（International — QwenCloud），`documentationUrl`/`apiKeyUrl` 指向各自平台的 token-plan overview；模型目录复用 `QWENCLOUD_MODELS` 但过滤掉 kimi-k3，源码注释逐字为 “kimi-k3 returns model_not_found on Token Plan; catalog omissions alone do not establish unavailability (deepseek-v4-pro-0813 remains callable).”，另一条注释说明计划文档没有枚举各档解锁哪些模型、种子目录只是离线兜底而发现走 `/models`；`modelNamePrefix` 是函数，国际端点显示 “QwenCloud Token Plan for Global/Intl”、其余显示 “QwenCloud Token Plan”；`apiKeyPlaceholder: \'sk-sp-...\'`，`validateApiKey` 只接受 `sk-sp-` 前缀，否则返回 “Invalid API key. Token Plan API keys start with "sk-sp-". Generate one from the Token Plan console, or use the Standard API Key entry for a pay-as-you-go key.”；同样带 `webSearch: { backend: \'dashscope\' }` 与 `uiGroup: \'qwencloud\'`',
      url: 'https://github.com/QwenLM/qwen-code/blob/428f686adec24ea26725ce86071ad9b0a5282120/packages/core/src/providers/presets/qwencloud-token-plan.ts',
    },
    'qwen-qwencloud-pr': {
      label:
        'Qwen Code PR #14073 “feat(providers): add QwenCloud as the first /auth entry”（2026-10-16T13:34:44Z 合并，合并提交 `a84dbff23e6d31212f22b4998831c5ceb7dae160`，改动 48 个文件）：按 #14025 的产品裁决，QwenCloud 与 ModelStudio 两个入口**并存**，ModelStudio 不被替换、改名或改线，已保存的 ModelStudio 凭据、端点与模型选择继续解析到原有预设、无需迁移；新组沿用 ModelStudio 的向导形状（Access Method → Platform → API Key → Model IDs）并提供 `qwencloud-standard` 与 `qwencloud-token-plan` 两个预设，每个预设都把 **China — 千问AI平台** 与 **International — QwenCloud** 作为显式平台步骤，Coding Plan 刻意不在这里提供；分组接线覆盖每一个枚举 Provider 的 Surface——ink 对话框、OpenTUI 对话框、VS Code Provider 选择器与 Web Shell 消费的 serve catalog，新主机同时加入 DashScope Provider 探测与 web-search 端点白名单，两个新环境变量加入 no-AK CI 门禁的清空列表；顶层入口标签本地化（en 与其他语言显示 QwenCloud、zh 显示千问AI平台、zh-TW 显示千問AI平台），语言中立的 Surface（serve catalog 与 VS Code 选择器）只用拉丁品牌；PR 描述记录四个 base URL 都取自平台自有文档并在合入前联网探测过，返回 DashScope 的 `invalid_api_key` 信封',
      url: 'https://github.com/QwenLM/qwen-code/pull/14073',
    },
    'qwen-v0253-preview0-release': {
      label:
        'Qwen Code Release v0.25.3-preview.0（2026-10-16T18:28:53Z 发布，GitHub API 标记 `prerelease: true`、`target_commitish` 为 `release/v0.25.3-preview.0`，标签指向提交 `d407c0bb3823118281fbfc178494f4525a2241b8`）：该标签下 `packages/core/src/providers/presets/` 含 15 个文件，包括新增的 `qwencloud-standard.ts` 与 `qwencloud-token-plan.ts`；最新 stable v0.25.2（2026-10-15T15:41:15Z，标签指向提交 `8a415cb628db88844e0196bdfdcce83b4f88d812`）同一目录只有 13 个文件、没有任何 `qwencloud-*` 预设；v0.25.3-preview.0 的发布说明是自动生成的 PR 变更列表，QwenCloud 只以 “feat(providers): add QwenCloud as the first /auth entry by @yiliang114 in …/pull/14073” 一行出现，没有单独的功能条目',
      url: 'https://github.com/QwenLM/qwen-code/releases/tag/v0.25.3-preview.0',
    },
    'qwen-websearch-provider-table': {
      label:
        'Qwen Code `docs/developers/tools/web-search.md`（提交 `428f686adec24ea26725ce86071ad9b0a5282120`）：内置 `web_search` 工具由 DashScope Responses API 的服务端搜索承载，“On by default at startup for supported ModelStudio and OpenAI-compatible DashScope configurations; no extra provider or MCP setup.”；自动开启表把 `Alibaba ModelStudio → Token Plan`、`QwenCloud → Standard API Key`、`QwenCloud → Token Plan` 以及“识别为 DashScope Responses 主机且带直连 Key 的 OpenAI 兼容 `modelProviders` 或 Custom Provider 条目”都列为 on；文档另写 Coding Plan 主机被排除在自动激活之外',
      url: 'https://github.com/QwenLM/qwen-code/blob/428f686adec24ea26725ce86071ad9b0a5282120/docs/developers/tools/web-search.md',
    },
    'qwen-settings-current': {
      label: 'Qwen Code current Settings',
      url: 'https://github.com/QwenLM/qwen-code/blob/081a96d86459b618fdba2d153f784d9226f37d06/docs/users/configuration/settings.md',
    },
    'qwen-extension-intro-current': {
      label: 'Qwen Code current Extensions introduction',
      url: 'https://github.com/QwenLM/qwen-code/blob/a64d1291d2f6298f67763d0953b1653cf7b34060/docs/users/extension/introduction.md',
    },
    'qwen-channels-overview': {
      label: 'Qwen Code Channels 总览文档',
      url: 'https://github.com/QwenLM/qwen-code/blob/612a55295993ffd60303cfc8d3445abac8ae2ad9/docs/users/features/channels/overview.md',
    },
    'qwen-email-channel-docs': {
      label: 'Qwen Code Email 渠道文档',
      url: 'https://github.com/QwenLM/qwen-code/blob/612a55295993ffd60303cfc8d3445abac8ae2ad9/docs/users/features/channels/email.md',
    },
    'qwen-email-channel-commit': {
      label: 'Qwen Code Email 渠道提交（PR #12939）',
      url: 'https://github.com/QwenLM/qwen-code/commit/612a55295993ffd60303cfc8d3445abac8ae2ad9',
    },
    'qwen-email-channel-config': {
      label: 'Qwen Code Email 渠道配置校验源码',
      url: 'https://github.com/QwenLM/qwen-code/blob/612a55295993ffd60303cfc8d3445abac8ae2ad9/packages/channels/email/src/config.ts',
    },
    'qwen-email-channel-design': {
      label: 'Qwen Code Email 渠道设计文档',
      url: 'https://github.com/QwenLM/qwen-code/blob/612a55295993ffd60303cfc8d3445abac8ae2ad9/docs/design/email-channel.md',
    },
    'qwen-channel-registry': {
      label: 'Qwen Code 内置渠道注册表源码',
      url: 'https://github.com/QwenLM/qwen-code/blob/612a55295993ffd60303cfc8d3445abac8ae2ad9/packages/cli/src/commands/channel/channel-registry.ts',
    },
    'qwen-settings-no-channels': {
      label: 'Qwen Code 设置文档（未列出 channels 键）',
      url: 'https://github.com/QwenLM/qwen-code/blob/612a55295993ffd60303cfc8d3445abac8ae2ad9/docs/users/configuration/settings.md',
    },
    'kimi-commands': {
      label: 'Kimi Code Slash commands',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860/docs/zh/reference/slash-commands.md',
    },
    'kimi-commands-c9f01f0': {
      label:
        'Kimi Code Slash 命令文档（main `c9f01f07388abc2cdca40c9c5267f58c65086710`：`/settings` 别名 `/config`「打开 TUI 内的设置面板」且随时可用，`/update-config` 编辑 `config.toml` 与 `tui.toml` 且仅空闲可用）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/c9f01f07388abc2cdca40c9c5267f58c65086710/docs/zh/reference/slash-commands.md',
    },
    'kimi-fork-stay': {
      label: 'Kimi Code /fork stay-in-session commit',
      url: 'https://github.com/MoonshotAI/kimi-code/commit/54c04bf03ddbeb46d02b2edb460ea091ae194509',
    },
    'kimi-fork-resume-command': {
      label: 'Kimi Code /fork resume command print commit',
      url: 'https://github.com/MoonshotAI/kimi-code/commit/6b72345f8bb03487e3bcc05b541e65484818428c',
    },
    'kimi-v0361-release': {
      label: 'Kimi Code 0.36.1 release notes',
      url: 'https://github.com/MoonshotAI/kimi-code/releases/tag/%40moonshot-ai/kimi-code%400.36.1',
    },
    'kimi-goal-limit-commit': {
      label: 'Kimi Code /goal objective length limit commit',
      url: 'https://github.com/MoonshotAI/kimi-code/commit/d96cd037702637305422222e985139e51ff83c8c',
    },
    'kimi-v037-release': {
      label: 'Kimi Code 0.37.0 release notes',
      url: 'https://github.com/MoonshotAI/kimi-code/releases/tag/%40moonshot-ai/kimi-code%400.37.0',
    },
    'kimi-agents': {
      label: 'Kimi Code Agents',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860/docs/zh/customization/agents.md',
    },
    'kimi-interaction': {
      label: 'Kimi Code Interaction and Permissions',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/086769bfadf1c86ba0569f16315010ffc77344f0/docs/zh/guides/interaction.md',
    },
    'kimi-config': {
      label: 'Kimi Code Configuration',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/086769bfadf1c86ba0569f16315010ffc77344f0/docs/zh/configuration/config-files.md',
    },
    'kimi-cli': {
      label: 'Kimi Code CLI Reference',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/086769bfadf1c86ba0569f16315010ffc77344f0/docs/zh/reference/kimi-command.md',
    },
    'kimi-docs': {
      label: 'Kimi Code Documentation',
      url: 'https://github.com/MoonshotAI/kimi-code/tree/main/docs/zh',
    },
    'kimi-sessions-current': {
      label: 'Kimi Code current sessions',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/6b72345f8bb03487e3bcc05b541e65484818428c/docs/zh/guides/sessions.md',
    },
    'kimi-commands-current': {
      label: 'Kimi Code current slash commands',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/7c919f0376c0331d0d057ef3643c7adcc2c55802/docs/zh/reference/slash-commands.md',
    },
    'kimi-undo-commands-25dd4ce': {
      label: 'Kimi Code Slash 命令表（`/undo [<count>]` 行、「随时可用」列为「否」与空闲限制提示，提交 25dd4ce97345）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/25dd4ce97345c7ebfd9c036898e5eef955c45ea8/docs/zh/reference/slash-commands.md',
    },
    'kimi-commands-messaging-current': {
      label: 'Kimi Code current slash commands (no messaging command)',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/8db7d42f23472a692eb389a0e0e5a3e18aa1b94d/docs/zh/reference/slash-commands.md',
    },
    'kimi-cli-current': {
      label: 'Kimi Code current CLI reference',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/reference/kimi-command.md',
    },
    'kimi-data-current': {
      label: 'Kimi Code current data locations',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/configuration/data-locations.md',
    },
    'kimi-config-current': {
      label: 'Kimi Code current configuration',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/configuration/config-files.md',
    },
    'kimi-compaction-config': {
      label:
        'Kimi Code 自动压缩与缓存过期配置（`loop_control.reserved_context_size`、`compaction_max_attempts`、只有 `timeout_ms` 的 `[subagent]`，以及 `tui.toml` 的 `cache_expiry_hint`）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/c7dd84124a00d2dc1a68fbbc3e54b1095ee9ac23/docs/zh/configuration/config-files.md',
    },
    'kimi-compaction-config-ce0834a': {
      label:
        'Kimi Code 配置文档在 main 上该文件最后一次变更提交 `ce0834a8f301b89cc4523499a3e074c36851de8f`（2026-10-20T06:20:55Z，PR #4272 “feat: share session rating rules across CLI and server”，40,246 字节，2026-10-20 复核）：`loop_control` 表 `reserved_context_size` 行按「字段／类型／默认值／说明」四列照录为 “`reserved_context_size`／`integer`／—／预留给模型输出的 token 数；上下文窗口剩余量低于此值时触发自动压缩” 且示例配置写 `reserved_context_size = 50000`，`compaction_max_attempts` 行照录为 “`compaction_max_attempts`／`integer`／`5`／压缩请求失败后的最大总尝试次数（含首次尝试）”，`[subagent]` 段仍只有 `timeout_ms` 一行（`7200000`，即 2 小时，`0` 表示无超时），`tui.toml` 的 `cache_expiry_hint` 行照录为 “`cache_expiry_hint`／`boolean`／`true`／resume 或长时间空闲后发消息时，若上下文缓存可能过期则提醒，可先压缩或新建会话（仅 v2 引擎）”；四行与提交 `c7dd84124a00d2dc1a68fbbc3e54b1095ee9ac23` 逐字一致；`loop_control` 的环境变量覆盖仍只有 `max_steps_per_turn`（`KIMI_LOOP_MAX_STEPS_PER_TURN`）与 `max_attempts_per_step`（`KIMI_LOOP_MAX_ATTEMPTS_PER_STEP`）两个，逐字为 “优先级均高于配置文件。旧的 `KIMI_LOOP_MAX_RETRIES_PER_STEP` 已废弃，但在新变量未设置时仍生效（启动时会给出警告）”；`[experimental] micro_compaction`（默认 `false`，清理较旧的大型工具结果）整段仍在 HTML 注释里，不按已公布能力记录',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/ce0834a8f301b89cc4523499a3e074c36851de8f/docs/zh/configuration/config-files.md',
    },
    'kimi-release-220-compaction': {
      label:
        'Kimi Code 官方中文变更记录（main 分支，2026-10-20 复核，108,758 字节，最新段为 2.2.0（2026-10-14））：2.2.0 段的新功能为实验性进度更新 NotifyUser（默认关闭、`/experiments` 面板开启）、`kimi app [path]` 打开 Desktop 会话与全屏模式的用户消息摘要条，优化为用户技能卡片高亮提示词并支持 `Ctrl-S` 发送、Tower 模式运行中发消息中止当前 turn 并作为独立 turn 执行、退出时 shutdown hooks 期间显示「Shutting down」且 `Ctrl+C` 可立即强制退出，修复为 UserPromptSubmit hook 注入文本时的对话错位、移除 MCP stdio 配置中从未实现的 `executor = "kaos"`、修复 fork 会话重复触发源会话 cron 任务；全段没有压缩阈值、`reserved_context_size`、`cache_expiry_hint` 或 `/compact` 相关条目。核对日期最新 Release 仍是 `@moonshot-ai/kimi-code@2.2.0`（2026-10-14T15:31:16Z 发布）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/main/docs/zh/release-notes/changelog.md',
    },
    'kimi-subagent-config': {
      label:
        'Kimi Code subagent and secondary model configuration（`[secondary_model]` 模型池已始终开启、`default_effort`、`force` 约束、`/secondary-model` 写入 `default_model`、配置错误直接启动失败）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/c9f01f07388abc2cdca40c9c5267f58c65086710/docs/zh/configuration/config-files.md',
    },
    'kimi-secondary-model-ga-commit': {
      label:
        'Kimi Code 移除 Subagent 模型池实验开关的提交（`feat(secondary-model): drop the experimental flag from the subagent model pool (#3634)`，随 0.42.0 发布）',
      url: 'https://github.com/MoonshotAI/kimi-code/commit/e831fd1ea9488ad5192bcc9d96579470cf0c4442',
    },
    'kimi-legacy-engine-removal-commit': {
      label:
        'Kimi Code 删除旧版 agent-core v1 包的提交（`refactor: remove the legacy agent-core v1 package (#3542)`，随 0.42.0 发布）',
      url: 'https://github.com/MoonshotAI/kimi-code/commit/bb16383aa15f72954224d37ee0b9babb807e03b3',
    },
    'kimi-changelog-c9f01f0': {
      label:
        'Kimi Code 官方变更记录（0.36.0 引入模型池为实验性、0.40.0 “子代理设置（`[secondary_model]`）功能由实验性转为正式”、0.42.0 “子 Agent 模型池（`[secondary_model]`）现已始终开启，实验开关与 `KIMI_CODE_EXPERIMENTAL_SECONDARY_MODEL` 退出选项已移除”、0.39.0 新增 `[swarm] timeout_ms`）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/c9f01f07388abc2cdca40c9c5267f58c65086710/docs/zh/release-notes/changelog.md',
    },
    'kimi-slash-commands-c9f01f0': {
      label:
        'Kimi Code Slash 命令参考（`/secondary-model`，别名 `/subagent-model`，写入 `[secondary_model] default_model`，流式输出期间也可用）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/c9f01f07388abc2cdca40c9c5267f58c65086710/docs/zh/reference/slash-commands.md',
    },
    'kimi-agents-c9f01f0': {
      label:
        'Kimi Code Agents 文档（Agent 文件字段表没有 `model`，逐字写 “其他 Agent 工具的字段（如 Claude Code 的 `model`、OpenCode 的 `mode`）同样会被忽略”）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/c9f01f07388abc2cdca40c9c5267f58c65086710/docs/zh/customization/agents.md',
    },
    'kimi-swarm-timeout-commit': {
      label: 'Kimi Code swarm timeout commit',
      url: 'https://github.com/MoonshotAI/kimi-code/commit/496bb6ce4e555c11304074c31312c01edf4d773a',
    },
    'kimi-swarm-timeout-config': {
      label: 'Kimi Code swarm timeout configuration',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/496bb6ce4e555c11304074c31312c01edf4d773a/docs/zh/configuration/config-files.md',
    },
    'kimi-swarm-timeout-changeset': {
      label: 'Kimi Code swarm timeout changeset',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/496bb6ce4e555c11304074c31312c01edf4d773a/.changeset/swarm-timeout-config.md',
    },
    'kimi-subagent-model-pool-commit': {
      label: 'Kimi Code subagent model pool commit',
      url: 'https://github.com/MoonshotAI/kimi-code/commit/c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860',
    },
    'kimi-subagent-fork-commit': {
      label: 'Kimi Code subagent fork parameter commit',
      url: 'https://github.com/MoonshotAI/kimi-code/commit/f6736d7c0de609d44ed1cb761cfe9f195c4d94fb',
    },
    'kimi-subagent-fork-env': {
      label: 'Kimi Code subagent fork environment variable',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/f6736d7c0de609d44ed1cb761cfe9f195c4d94fb/docs/zh/configuration/env-vars.md',
    },
    'kimi-subagent-fork-changeset': {
      label: 'Kimi Code subagent fork changeset',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/f6736d7c0de609d44ed1cb761cfe9f195c4d94fb/.changeset/subagent-fork-context.md',
    },
    'kimi-v036-release': {
      label: 'Kimi Code 0.36.0 release notes',
      url: 'https://github.com/MoonshotAI/kimi-code/releases/tag/%40moonshot-ai/kimi-code%400.36.0',
    },
    'kimi-agents-current': {
      label: 'Kimi Code current agents',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/customization/agents.md',
    },
    'kimi-mcp-current': {
      label: 'Kimi Code current MCP',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/customization/mcp.md',
    },
    'kimi-skills-current': {
      label: 'Kimi Code current Skills',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/customization/skills.md',
    },
    'kimi-hooks-current': {
      label: 'Kimi Code current Hooks',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/customization/hooks.md',
    },
    'kimi-hooks-failure-current': {
      label: 'Kimi Code current Hooks（fail-open 与超时语义复核）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/494df61ce9858c70a9f37a996614534bc9b1cd12/docs/zh/customization/hooks.md',
    },
    'kimi-hooks-session-cwd': {
      label:
        'Kimi Code 提交 `c1459a61845056832b85a0a220ee11a2bc5132f8`（PR #4242 “fix(server): run agent hooks in the session\'s working directory”，2026-10-15T11:38:24Z 合入 main）：`AgentExternalHooksService` 的 `fireAndForgetTrigger(event)`（事件总线触发的 Hook）与 `PreToolUse`／`UserPromptSubmit`／`Stop`／`PreCompact` 四类 Agent 级 Hook 改为显式传入 `cwd: sessionContext.cwd`；此前这些 Agent 级 Hook 没有传 `cwd`、Hook 运行器回落到 `bootstrap.cwd`，因而在引擎或服务器进程的启动目录里执行，与会话级 Hook 已经在会话目录执行不一致；测试把引擎启动目录设为 `/launch-dir` 并断言 Agent 级 Hook 拿到会话目录 `/tmp`，`fullCompaction.test.ts` 另断言 `PreCompact`／`PostCompact` 载荷里的 `cwd` 是会话目录。附带的 changeset 文件为 `.changeset/hooks-session-cwd.md`，对 `@moonshot-ai/kimi-code` 与 `@moonshot-ai/kimi-code-sdk` 都是 patch，核对日期最新 Release `@moonshot-ai/kimi-code@2.2.0`（2026-10-14T15:31:16Z）早于该提交，因此尚未发布；官方中文 Hooks 文档最近一次改动仍是 2026-09-03 的 `494df61ce985`，没有提到服务器路径的这一差异',
      url: 'https://github.com/MoonshotAI/kimi-code/commit/c1459a61845056832b85a0a220ee11a2bc5132f8',
    },
    'kimi-plugins-current': {
      label: 'Kimi Code current Plugins',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/691ec4679ea1/docs/zh/customization/plugins.md',
    },
    'kimi-plugin-commands-main': {
      label:
        'Kimi Code 插件斜杠命令文档（main `ef727e517923`，`docs/zh/customization/plugins.md` 25,451 字节，`## 插件斜杠命令` 一节自本仓库此前固定的 `691ec4679ea1` 起只有 10 行文字润色、规则未变。逐字要点：manifest 字段表 `commands` 行为 “一个或多个 `./` 路径，指向目录或 `.md` 文件，把其中的 Markdown 文件注册为斜杠命令”；开头句 “斜杠命令把一段常用提示词存成 `/命令`，输入即可触发。”；三条声明规则为指向目录时 “递归收集其中所有 `.md` 文件，每个文件各成为一个命令”、指向单个 `.md` 文件时 “只注册这一个”、指向非 `.md` 或不存在的路径时 “显示为 diagnostics 并被忽略”；frontmatter 只有 `name` 与 `description` 两个可选字段，`name` 省略时 “按文件相对 `commands` 的路径命名，去掉 `.md`、以 `/` 分隔，如 `commands/frontend/component.md` 注册为 `frontend/component`”，`description` 省略时 “取正文首行非空文字，超 240 字符截断；正文也为空则显示 `No description provided.`”；“命令自动以插件 id 作前缀注册成 `<插件名>:<命令名>`，所以上面的命令实际叫 `/kimi-finance:report`，不同插件的同名命令因此不会冲突。”；“命令后输入的文字会替换正文里的 `$ARGUMENTS`。若正文没写 `$ARGUMENTS` 却传了参数，参数不会丢弃，而是以 `ARGUMENTS: <你输入的内容>` 追加到正文末尾。”；全页没有用户级或项目级的非插件 Command 目录，也没有任何 preset 或数字槽位记法）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/ef727e517923cb312cb48d42825c49dfacd528e7/docs/zh/customization/plugins.md',
    },
    'kimi-skills-220': {
      label:
        'Kimi Code 2.2.0 Skill 文档（标签提交 `472192c34c1efad89a369870eff0da0b708ce9bb`，`docs/zh/customization/skills.md` 7,332 字节，与 2026-10-15 的 main 逐字节相同。逐字要点：调用形式为 `/skill:code-style` 与 `/skill:git-commits 修复登录接口的并发问题`；“Skill 调用最多允许嵌套 3 层，超过后会被终止。”；“Kimi Code CLI 按作用域分四档扫描，越具体的作用域优先级越高：**Project > User > Extra > Built-in**。”，用户级为 `$KIMI_CODE_HOME/skills/`（默认 `~/.kimi-code/skills/`）与 `~/.agents/skills/`，项目级为 `.kimi-code/skills/` 与 `.agents/skills/`，额外目录由 `config.toml` 顶层 `extra_skill_dirs` 声明，内置 Skill 优先级最低并可用顶层 `builtin_product_skills` 关闭；正文占位符为 `$ARGUMENTS`、`$ARGUMENTS[0]`/`$ARGUMENTS[1]` 及简写 `$0`/`$1`（“按空白分词后的位置参数（从 0 开始）”）、`arguments` 声明的 `$<name>` 与 `${KIMI_SKILL_DIR}`；“若正文不含任何参数占位符，调用时附带的文本会以 `\\n\\nARGUMENTS: <文本>` 的形式追加到正文末尾。”；frontmatter 字段为 `name`、`description`、`type`、`whenToUse`、`disableModelInvocation`、`arguments`；全页没有 `.kimi-code/commands` 目录，也没有 preset 或数字槽位记法）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/472192c34c1efad89a369870eff0da0b708ce9bb/docs/zh/customization/skills.md',
    },
    'kimi-skill-steering-pr': {
      label:
        'Kimi Code PR #4165（`feat(tui): unify skill prompts and steering`，合并提交 `afd95f64a5444b649a4cc33504513bf88e4c54ba`，2026-10-13T04:17:14Z 合入 main、随 2.2.0 发布）：需求段逐字为 “统一 TUI 行首和行中 Skill 的用户消息展示、高亮，并让两种调用都支持 Ctrl-S steer。”；改动要点含 “用户 Skill 不再生成独立激活卡。实时、历史恢复、Fullscreen 和 sticky 显示使用完整用户输入，只高亮解析结果或已保存激活元数据中的 Skill。”、“Enter 与 Ctrl-S 共用参数和命令优先级规则。”、“`steerIfActive` 贯通 SDK、RPC、klient 和 core。Ctrl-S 可发送行首、行中及多 Skill 输入，混合队列按顺序提交；bash 留队。”、“显示输入不代表执行成功，也不保证引擎已持久化。” 与 “VS Code 恢复组合 Skill 时只过滤展开指令，保留用户输入、媒体及 Hook 输出，不修改持久化数据或模型上下文。”；42 个改动文件里没有 `config.toml`、`tui.toml` 或配置 schema，唯一的 schema 变化是 klient 契约里新增可选字段 `steerIfActive`，即这是消息渲染与 steer 投递改动，不保存可复用提示词',
      url: 'https://github.com/MoonshotAI/kimi-code/pull/4165',
    },
    'kimi-release-220': {
      label:
        'Kimi Code 2.2.0 Release（2026-10-14T15:31:16Z 发布，标签提交 `472192c34c1efad89a369870eff0da0b708ce9bb`，发布说明 9,042 字节）：与自定义命令相关的唯一条目逐字为 “Replace user skill cards with highlighted prompts and support Ctrl-S for skill prompts.”（PR #4165，提交 `afd95f6`）；全篇没有 preset、数字槽位或保存提示词模板一类条目',
      url: 'https://github.com/MoonshotAI/kimi-code/releases/tag/%40moonshot-ai/kimi-code%402.2.0',
    },
    'kimi-ide-current': {
      label: 'Kimi Code current IDE integrations',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/guides/ides.md',
    },
    'kimi-acp-current': {
      label: 'Kimi Code current ACP reference',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/reference/kimi-acp.md',
    },
    'kimi-tools-current': {
      label: 'Kimi Code current built-in tools',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/%40moonshot-ai/kimi-code%400.38.0/docs/zh/reference/tools.md',
    },
    'kimi-agents-execution-current': {
      label: 'Kimi Code current agents',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/customization/agents.md',
    },
    'kimi-commands-execution-current': {
      label: 'Kimi Code current slash commands',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/slash-commands.md',
    },
    'kimi-slash-commands-211': {
      label: 'Kimi Code 2.1.1 斜杠命令文档（无 Worktree 入口）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/f67e6398fb3210ad8ace970e2dfd5bcc984ed61f/docs/zh/reference/slash-commands.md',
    },
    'kimi-agents-211': {
      label: 'Kimi Code 2.1.1 Agents 文档（无 Worktree 隔离字段）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/f67e6398fb3210ad8ace970e2dfd5bcc984ed61f/docs/zh/customization/agents.md',
    },
    'kimi-tower-paths-211': {
      label: 'Kimi Code 2.1.1 tower 目录常量源码（`.tower/worktrees`）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/f67e6398fb3210ad8ace970e2dfd5bcc984ed61f/packages/agent-core-v2/src/features/tower/protocol/paths.ts',
    },
    'kimi-tower-worktree-guard-211': {
      label: 'Kimi Code 2.1.1 tower worker Worktree 写隔离源码',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/f67e6398fb3210ad8ace970e2dfd5bcc984ed61f/packages/agent-core-v2/src/features/tower/towerService.ts',
    },
    'kimi-cli-surface-current': {
      label: 'Kimi Code current CLI, Headless and Web reference',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/kimi-command.md',
    },
    'kimi-web-command-242ac23': {
      label:
        'Kimi Code `kimi web` 参考（提交 `242ac230006447f8601e1678c49182bfbae89fe9`：默认端口 58627 与占用时 +1 重试、`--host`/`--allowed-host`/`--web-title`/`--log-level`/`--debug-endpoints`、`~/.kimi-code/server/instances/` 多实例登记、`~/.kimi-code/server.token` 与 `rotate-token`、前台运行到 SIGINT/SIGTERM、已废弃的 `kimi server kill`）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/242ac230006447f8601e1678c49182bfbae89fe9/docs/zh/reference/kimi-command.md',
    },
    'kimi-command-759958a': {
      label:
        'Kimi Code 命令参考复核（固定到 main 提交 `759958afdfeb0f8c7d09cb03cbc2cf85b6255e9e`，2026-10-22T12:30:23Z，20,041 字节）：顶层 `kimi` 子命令为 `login`、`acp`、`web`、`doctor`、`export`、`migrate`、`upgrade`（别名 `update`）、`provider`、`app`、`install-desktop`（隐藏别名 `install-app`）与 `vis`，没有任何 daemon 生命周期子命令；`kimi web` 一节逐字为 “在当前终端前台运行本地 Kimi 服务 —— 同一个进程同时挂载 REST + WebSocket API 与 web UI —— 并在服务就绪后用默认浏览器打开 web UI。命令会一直挂在终端，直到收到 `SIGINT` / `SIGTERM`（如 `Ctrl-C`）时干净退出。”，其下只有 `kimi web rotate-token` 一个子命令；`kimi server` 命令树的弃用提示逐字为 “`kimi server` 命令树已废弃：任何 `kimi server …` 调用（含全部旧子命令）只会打印弃用提示并以退出码 1 结束，请改用 `kimi web`。唯一的例外是 `kimi server kill`，它仍然可用，仅用于停止 0.28.0 之前版本启动的服务。”，`kimi server kill` 一节末尾写 “`kimi web` 启动的服务在前台运行，直接用 `Ctrl+C` 停止即可。”；核对日期最新 Release 仍为 [`@moonshot-ai/kimi-code@2.3.0`](https://github.com/MoonshotAI/kimi-code/releases/tag/%40moonshot-ai%2Fkimi-code%402.3.0)（2026-10-21T05:51:43Z）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/759958afdfeb0f8c7d09cb03cbc2cf85b6255e9e/docs/zh/reference/kimi-command.md',
    },
    'kimi-sdk-current': {
      label: 'Kimi Code current TypeScript SDK package',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/packages/node-sdk/package.json',
    },
    'kimi-acp-surface-current': {
      label: 'Kimi Code current ACP reference',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/kimi-acp.md',
    },
    'kimi-ide-surface-current': {
      label: 'Kimi Code current IDE integrations',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/guides/ides.md',
    },
    'kimi-vscode-current': {
      label: 'Kimi Code current VS Code extension',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/apps/vscode/README.md',
    },
    'kimi-desktop-cli-doc': {
      label: 'Kimi Code CLI 参考（`kimi app` 与 `kimi install-desktop` 章节）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/242ac230006447f8601e1678c49182bfbae89fe9/docs/zh/reference/kimi-command.md',
    },
    'kimi-desktop-slash-doc': {
      label: 'Kimi Code 斜杠命令表（`/desktop` 与 `/install-desktop` 行）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/242ac230006447f8601e1678c49182bfbae89fe9/docs/zh/reference/slash-commands.md',
    },
    'kimi-desktop-changelog': {
      label: 'Kimi Code 中文更新日志（2.0.0 新增 `/desktop`、2.0.1 改名 `install-desktop`）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/242ac230006447f8601e1678c49182bfbae89fe9/docs/zh/release-notes/changelog.md',
    },
    'kimi-app-source': {
      label: 'Kimi Code `kimi app` 子命令源码',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/242ac230006447f8601e1678c49182bfbae89fe9/apps/kimi-code/src/cli/sub/app.ts',
    },
    'kimi-install-desktop-source': {
      label: 'Kimi Code `kimi install-desktop` 子命令源码',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/242ac230006447f8601e1678c49182bfbae89fe9/apps/kimi-code/src/cli/sub/install-desktop.ts',
    },
    'kimi-desktop-tui-source': {
      label: 'Kimi Code `/desktop` TUI 命令源码',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/242ac230006447f8601e1678c49182bfbae89fe9/apps/kimi-code/src/tui/commands/desktop.ts',
    },
    'kimi-open-url-source': {
      label: 'Kimi Code 系统 URL 打开器源码（open/Start-Process/xdg-open）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/242ac230006447f8601e1678c49182bfbae89fe9/apps/kimi-code/src/utils/open-url.ts',
    },
    'kimi-resolve-command-source': {
      label: 'Kimi Code PATH 可执行文件解析源码（跳过 cwd 内命中）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/242ac230006447f8601e1678c49182bfbae89fe9/apps/kimi-code/src/utils/process/resolve-command.ts',
    },
    'kimi-app-changeset': {
      label: 'Kimi Code `kimi app` changeset（minor）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/242ac230006447f8601e1678c49182bfbae89fe9/.changeset/open-desktop-app.md',
    },
    'kimi-app-pr': {
      label: 'Kimi Code PR #4145（`kimi app [path]` 合入 main）',
      url: 'https://github.com/MoonshotAI/kimi-code/pull/4145',
    },
    'kimi-v200-release': {
      label: 'Kimi Code 2.0.0 发布说明（新增 `/desktop` 与 `kimi install-app`）',
      url: 'https://github.com/MoonshotAI/kimi-code/releases/tag/%40moonshot-ai%2Fkimi-code%402.0.0',
    },
    'kimi-v201-release': {
      label: 'Kimi Code 2.0.1 发布说明（`install-app` 改名 `install-desktop`）',
      url: 'https://github.com/MoonshotAI/kimi-code/releases/tag/%40moonshot-ai%2Fkimi-code%402.0.1',
    },
    'kimi-v211-release': {
      label: 'Kimi Code 2.1.1 发布说明（核对日期最新 Release，不含 `kimi app`）',
      url: 'https://github.com/MoonshotAI/kimi-code/releases/tag/%40moonshot-ai%2Fkimi-code%402.1.1',
    },
    'kimi-desktop-page': {
      label: 'Kimi Code 官方产品页（Desktop / Terminal / IDE 入口）',
      url: 'https://www.kimi.ai/code',
    },
    'kimi-model-providers-current': {
      label: 'Kimi Code current model providers',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/configuration/providers.md',
    },
    'kimi-providers-head': {
      label:
        'Kimi Code「平台与模型」文档（提交 `18c6d64272952503baccf706bff455bb6a2c488e`，2026-10-16T07:15:57Z 的 main HEAD，9,874 字节；本仓库此前固定的提交 `77618e38c35a81e26134b3f83eb7f2b460c0ee05` 版本为 7,283 字节）：`providers` 表的 `type` 决定协议实现，六类为 `kimi`（OpenAI 兼容，Kimi Code 托管服务与 Kimi Platform API 密钥，默认 `base_url` `https://api.moonshot.ai/v1`、凭证键 `KIMI_API_KEY`/`KIMI_BASE_URL`、支持视频上传）、`anthropic`（Anthropic Messages，默认 `base_url` 跟随 Anthropic SDK、键 `ANTHROPIC_API_KEY`/`ANTHROPIC_BASE_URL`、`max_tokens` 按模型推断并可用模型别名上的 `max_output_size` 覆盖）、`openai`（Chat Completions，默认 `https://api.openai.com/v1`，自动处理 `reasoning_content` 与 `reasoning_effort` 注入、非标准字段名用 `reasoning_key` 覆盖）、`openai_responses`（Responses API，始终流式）、`google-genai`（键 `GOOGLE_API_KEY`，代理走 `base_url` 或 `GOOGLE_GEMINI_BASE_URL`，只能填主机根地址否则路径重复成 `/v1beta/v1beta/…`）、`vertexai`（共用 google-genai 实现、认证走 Google ADC，项目 ID 与区域必须写在 `[providers.vertexai.env]` 子表里、直接 `export GOOGLE_CLOUD_PROJECT` 不被读取，代理端点用 `base_url` 或 `GOOGLE_VERTEX_BASE_URL`）；凭证优先级逐字为 “`api_key` 或 `api_key_env`（互斥替代项，只能设置其中一个）> `[providers.<name>.env]` 子表键（两者都不存在时才读）> 全部缺失时启动报错。除显式声明的 `api_key_env` 外，CLI 不会从 shell 环境变量自动取凭证”；所有供应商默认流式，thinking/视觉/工具调用能力按模型名前缀自动匹配；`/provider` 打开供应商管理器（↑/↓ 移动、←/→ 翻页、`d` 删除并 `[y/N]` 确认、`[ Add New Platform ]` 行回车添加），添加有两条路径——Known third-party provider 从 models.dev 拉目录（未声明协议的厂商按 OpenAI 兼容导入并标 “guessed”，无可用端点时先弹 base URL 输入框，Amazon Bedrock / Cohere 等专有协议与无法识别的显式协议被拒绝导入，deprecated 与 alpha 模型不出现在导入列表，公共目录不可达时回退内置目录快照以便离线或网络受限环境导入）与 Custom registry (api.json)（粘贴 registry 地址，私有 registry 再附 Bearer token；registry 条目声明 `env` 字段时只把它作为提示打印，绑定永不自动发生，逐字为 “registry 既决定变量名、又决定凭证发往的端点，不能由它来选择读取你的哪份密钥”，私有 registry 的 Bearer token 存为 `source.apiKey` 供刷新使用）；registry 模型可声明 `upgrade`（`model` 选同一供应商下的替代模型）、`migration_markdown`（`{model_from}`/`{model_to}` 导入时替换）与可选 `retirement_at`（RFC3339 或 `null`），这些是 Kimi registry 的扩展、不属于 models.dev schema，保存后由 `GET /api/v1/models` 返回；registry 删除默认模型时若 `upgrade` 目标仍存在则自动切到该目标并保留 Thinking 设置、否则默认模型与 Thinking 设置一并清空，已打开会话同样切换；启动时若当前模型有有效升级目标则显示 Markdown 迁移提示（等输入框为空且无运行中轮次或对话框，被审批或提问打断后重新显示，`Enter` 确认、空格不接受），确认后按目标模型支持的档位沿用当前 Thinking 档位、选择保留当前模型会记录该决定不再重复提示；warning 逐字为 “通过 `/login` 登录的 Kimi Code OAuth 托管账号不会在 `/provider` 里显示，请用 `/login` 和 `/logout` 管理。”',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/18c6d64272952503baccf706bff455bb6a2c488e/docs/zh/configuration/providers.md',
    },
    'kimi-provider-cli-head': {
      label:
        'Kimi Code CLI 参考的 `kimi provider` 一节（提交 `18c6d64272952503baccf706bff455bb6a2c488e`，20,041 字节）：`kimi provider <action> [options]` 是 TUI `/provider` 的非交互版本，适合脚本化部署、CI 初始化与新机器一行配置，共五个动作——`add <url>`（从自定义 registry `api.json` 批量导入全部供应商，为每个条目创建 `[providers.<id>]` 与 `[models.<alias>]` 并写入 `source` 元数据使下次启动自动刷新，`--api-key <key>` 未传时回退环境变量 `KIMI_REGISTRY_API_KEY`、两者都不传即导入公开 registry，registry 条目声明 `env` 时打印变量名提示并要求自己在 `config.toml` 设 `api_key_env`，同 id 已存在时先删再写、不自动设默认模型）、`remove <providerId>`（删除该供应商及其所有模型 alias，若正是 `default_model` 所属则同时清空 `default_model`）、`list`（逐行打印类型、模型数量、来源，`--json` 输出原始 `providers` 与 `models` 表）、`catalog list [providerId]`（不改配置浏览公开 models.dev 目录，`--filter <substring>` 大小写不敏感过滤、`--url <url>` 覆盖目录地址、默认 `https://models.dev/api.json`、`--json` 输出匹配片段，目录不可达时用内置快照）、`catalog add <providerId>`（按 id 从 catalog 直接导入，协议类型/base URL/模型信息都由 catalog 提供、只需给 Key，未声明协议的厂商按 OpenAI 兼容导入并标 “guessed”，catalog 未提供端点时 `--base-url` 必填，专有协议如 Amazon Bedrock 无法导入，`--default-model <modelId>` 把 `default_model` 设为 `<providerId>/<modelId>`，`--api-key` 未传回退 `KIMI_REGISTRY_API_KEY` 且必填）；同一文档的斜杠命令表把 `/provider` 记为无别名、“打开交互式供应商管理器，查看、添加和删除已配置的供应商”',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/18c6d64272952503baccf706bff455bb6a2c488e/docs/zh/reference/kimi-command.md',
    },
    'kimi-changelog-providers': {
      label:
        'Kimi Code 官方变更记录（提交 `18c6d64272952503baccf706bff455bb6a2c488e`，108,758 字节）中与 Provider 相关的版本时间线：2.0.1（2026-09-18）“供应商可通过 `config.toml` 中的 `api_key_env` 从指定的环境变量读取 API 密钥”；0.32.0（2026-08-04）“models.dev 目录不可达时回退到内置快照，离线或网络受限时也能导入已知第三方供应商”与新增 `[token_counting]` 配置节；0.29.0（2026-07-22）“从 models.dev 目录导入更多供应商”；0.24.0（2026-07-14）“请求供应商 registry（api.json）和模型目录时携带 kimi-code-cli 的 User-Agent”与“修复未配置 `base_url` 的供应商被拒绝的问题：anthropic/openai 等协议供应商现在会像以前一样回退到官方默认端点”；0.23.6（2026-07-12）“导入自定义 registry 时识别 `support_efforts` 和 `default_effort` 字段”；0.22.0（2026-07-02）新增 `[models."<alias>".overrides]` 模型元数据覆盖供应商刷新结果；0.8.0（2026-06-02）新增 `kimi provider` 子命令（`add`、`remove`、`list`、`catalog list` / `catalog add`）；0.7.0（2026-06-02）新增 `/provider` 命令并取代已废弃的 `/connect`；2.2.0（2026-10-14，核对日期最新 Release）与 2.1.x 没有任何 Provider 类型或导入路径条目，registry `upgrade` 迁移元数据在变更记录里没有对应条目、只出现在文档中',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/18c6d64272952503baccf706bff455bb6a2c488e/docs/zh/release-notes/changelog.md',
    },
    'kimi-model-env-current': {
      label: 'Kimi Code current environment variables',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/configuration/env-vars.md',
    },
    'kimi-model-config-current': {
      label: 'Kimi Code current configuration',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/configuration/config-files.md',
    },
    'kimi-model-data-current': {
      label: 'Kimi Code current data locations',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/configuration/data-locations.md',
    },
    'kimi-model-commands-current': {
      label: 'Kimi Code current slash commands',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/slash-commands.md',
    },
    'kimi-model-cli-current': {
      label: 'Kimi Code current CLI reference',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/kimi-command.md',
    },
    'kimi-trust-v2': {
      label: 'Kimi Code workspace trust (v2 engine)',
      url: 'https://github.com/MoonshotAI/kimi-code/commit/32d693f644de',
    },
    'kimi-builtin-capabilities': {
      label: 'Kimi Code built-in Computer Use and WebBridge capabilities',
      url: 'https://github.com/MoonshotAI/kimi-code/commit/0abcd00f7fd3e3cbf087509ffef1c54a6f8d396d',
    },
    'kimi-cu-windows': {
      label: 'Kimi Code Computer Use Windows support commit',
      url: 'https://github.com/MoonshotAI/kimi-code/commit/68ba740ebfb3e32ad9abdb8607f48d4387cf6f69',
    },
    'kimi-cu-windows-release': {
      label: 'Kimi Code 0.34.0 release notes',
      url: 'https://github.com/MoonshotAI/kimi-code/releases/tag/%40moonshot-ai/kimi-code%400.34.0',
    },
    'kimi-cu-powershell': {
      label: 'Kimi Code compatible PowerShell selection commit',
      url: 'https://github.com/MoonshotAI/kimi-code/commit/ef610840098a57819d62d407f33256e14b512c77',
    },
    'kimi-background-activity-commit': {
      label: 'Kimi Code /tasks live background agent activity commit',
      url: 'https://github.com/MoonshotAI/kimi-code/commit/ad12ad8a140d24051d93ec98a4a6921ab33723ff',
    },
    'kimi-background-activity-changeset': {
      label: 'Kimi Code background agent activity changeset',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/ad12ad8a140d24051d93ec98a4a6921ab33723ff/.changeset/background-agent-activity-view.md',
    },
    'kimi-coder-nesting-commit': {
      label: 'Kimi Code coder profile Agent tool removal commit',
      url: 'https://github.com/MoonshotAI/kimi-code/commit/101c4d199746bf2ed4f26375b65a6fcb6cba2a60',
    },
    'kimi-coder-nesting-changeset': {
      label: 'Kimi Code coder profile Agent tool removal changeset',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/101c4d199746bf2ed4f26375b65a6fcb6cba2a60/.changeset/v2-profile-drop-agent-tools.md',
    },
    'kimi-v035-release': {
      label: 'Kimi Code 0.35.0 release notes',
      url: 'https://github.com/MoonshotAI/kimi-code/releases/tag/%40moonshot-ai/kimi-code%400.35.0',
    },
    'kimi-tower-commit': {
      label: 'Kimi Code /tower multi-agent orchestration commit',
      url: 'https://github.com/MoonshotAI/kimi-code/commit/f492cd7c9e03666ecfd10dc47ca9b48c35de2318',
    },
    'kimi-tower-changeset': {
      label: 'Kimi Code /tower changeset',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/f492cd7c9e03666ecfd10dc47ca9b48c35de2318/.changeset/tower-slash-command.md',
    },
    'kimi-tower-skill': {
      label: 'Kimi Code /tower builtin skill body',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/f492cd7c9e03666ecfd10dc47ca9b48c35de2318/packages/agent-core-v2/src/features/tower/skill/tower.md',
    },
    'kimi-tower-spawn': {
      label: 'Kimi Code TowerSpawn tool source',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/f492cd7c9e03666ecfd10dc47ca9b48c35de2318/packages/agent-core-v2/src/features/tower/tools/spawn/spawnTool.ts',
    },
    'kimi-tower-disable-commit': {
      label: 'Kimi Code tower feature disable commit',
      url: 'https://github.com/MoonshotAI/kimi-code/commit/5ae82cd5bcb92395baf96feea68e12f8c96b51ed',
    },
    'kimi-tower-skill-gate': {
      label: 'Kimi Code tower skill experimental flag gate',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/5ae82cd5bcb92395baf96feea68e12f8c96b51ed/packages/agent-core-v2/src/features/tower/skill/skill.ts',
    },
    'kimi-tower-feature-source': {
      label: 'Kimi Code TowerFeature flag guard source',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/5ae82cd5bcb92395baf96feea68e12f8c96b51ed/packages/agent-core-v2/src/features/tower/towerFeature.ts',
    },
    'kimi-tower-flag-test': {
      label: 'Kimi Code tower flag gating tests',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/5ae82cd5bcb92395baf96feea68e12f8c96b51ed/packages/agent-core-v2/test/features/tower/towerFeature.test.ts',
    },
    'kimi-tower-mode-commit': {
      label: 'Kimi Code tower mode commit',
      url: 'https://github.com/MoonshotAI/kimi-code/commit/0f44537c13e7c32b9189e20af7c894c34704be5b',
    },
    'kimi-tower-mode-changeset': {
      label: 'Kimi Code tower mode changeset',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/0f44537c13e7c32b9189e20af7c894c34704be5b/.changeset/tower-mode-command.md',
    },
    'kimi-tower-mode-flag': {
      label: 'Kimi Code tower mode flag source',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/0f44537c13e7c32b9189e20af7c894c34704be5b/packages/agent-core-v2/src/features/tower/flag.ts',
    },
    'kimi-tower-mode-command': {
      label: 'Kimi Code /tower mode command source',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/0f44537c13e7c32b9189e20af7c894c34704be5b/apps/kimi-code/src/tui/commands/tower.ts',
    },
    'kimi-tower-mode-constants': {
      label: 'Kimi Code tower mode constants source',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/0f44537c13e7c32b9189e20af7c894c34704be5b/packages/agent-core-v2/src/features/tower/tower.ts',
    },
    'kimi-builtin-skill-filter': {
      label: 'Kimi Code builtin skill flag filter',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/5ae82cd5bcb92395baf96feea68e12f8c96b51ed/packages/agent-core-v2/src/app/skillCatalog/builtin/builtin.ts',
    },
    'kimi-multi-skill-engine-commit': {
      label: 'Kimi Code multi-skill prompt bundling commit',
      url: 'https://github.com/MoonshotAI/kimi-code/commit/61591bce09f4467aa1664cb8ecb6aa6904b7accd',
    },
    'kimi-multi-skill-tui-commit': {
      label: 'Kimi Code inline multi-skill activation commit',
      url: 'https://github.com/MoonshotAI/kimi-code/commit/44a6c70e66762ea9e122f8dceae16dc759086a7c',
    },
    'kimi-multi-skill-docs': {
      label: 'Kimi Code interaction guide (multi-skill activation)',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/44a6c70e66762ea9e122f8dceae16dc759086a7c/docs/zh/guides/interaction.md',
    },
    'kimi-multi-skill-changeset': {
      label: 'Kimi Code multi-skill activation changeset',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/44a6c70e66762ea9e122f8dceae16dc759086a7c/.changeset/inline-multi-skill-tui.md',
    },
    'kimi-token-ledger-commit': {
      label: 'Kimi Code token counting ledger persistence commit',
      url: 'https://github.com/MoonshotAI/kimi-code/commit/ee564e5ec90afd068123b8052928c53f1fd5a27d',
    },
    'kimi-token-ledger-changeset': {
      label: 'Kimi Code token counting ledger changeset',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/ee564e5ec90afd068123b8052928c53f1fd5a27d/.changeset/persist-token-counting-ledger.md',
    },
    'kimi-token-ledger-ops': {
      label: 'Kimi Code token counting ledger source',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/ee564e5ec90afd068123b8052928c53f1fd5a27d/packages/agent-core-v2/src/agent/tokenCounting/tokenCountingOps.ts',
    },
    'kimi-stale-guard-commit': {
      label: 'Kimi Code Edit/Write staleness guard commit',
      url: 'https://github.com/MoonshotAI/kimi-code/commit/67fbcdf1ba7dceeebb58875b3b7c81b4b30cf0de',
    },
    'kimi-stale-guard-service': {
      label: 'Kimi Code staleGuard service source',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/67fbcdf1ba7dceeebb58875b3b7c81b4b30cf0de/packages/agent-core-v2/src/features/staleGuard/staleGuardService.ts',
    },
    'kimi-stale-guard-changeset': {
      label: 'Kimi Code Edit/Write staleness guard changeset',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/67fbcdf1ba7dceeebb58875b3b7c81b4b30cf0de/.changeset/file-write-staleness-guard.md',
    },
    'kimi-stale-guard-config': {
      label: 'Kimi Code configuration documentation (default agent-core-v2 engine)',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/67fbcdf1ba7dceeebb58875b3b7c81b4b30cf0de/docs/zh/configuration/config-files.md',
    },
    'kimi-config-files-current': {
      label: 'Kimi Code current config files',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/157c84f5d1b0454c57aa6a54da42d87c32550ae1/docs/zh/configuration/config-files.md',
    },
    'kimi-wait-for-release': {
      label: 'Kimi Code 0.38.0 release notes (WaitFor tool)',
      url: 'https://github.com/MoonshotAI/kimi-code/releases/tag/%40moonshot-ai/kimi-code%400.38.0',
    },
    'kimi-wait-for-commit': {
      label: 'Kimi Code WaitFor tool commit',
      url: 'https://github.com/MoonshotAI/kimi-code/commit/8440801de47ddae29224430048e1228b80cde370',
    },
    'kimi-wait-for-docs': {
      label: 'Kimi Code built-in tools documentation (WaitFor, 0.38.0)',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/%40moonshot-ai/kimi-code%400.38.0/docs/zh/reference/tools.md',
    },
    'kimi-wait-for-flag': {
      label: 'Kimi Code WaitFor experimental flag source',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/%40moonshot-ai/kimi-code%400.38.0/packages/agent-core-v2/src/agent/tools/task/task-wait/flag.ts',
    },
    'kimi-wait-for-changeset': {
      label: 'Kimi Code WaitFor changeset',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/8440801de47ddae29224430048e1228b80cde370/.changeset/wait-for-tool.md',
    },
    'kimi-wait-for-cap-commit': {
      label: 'Kimi Code WaitFor 90s cap commit (PR #4061)',
      url: 'https://github.com/MoonshotAI/kimi-code/commit/20a2cea72f5d2c4be3a3845e4ff24ce302a6630e',
    },
    'kimi-wait-for-cap-source': {
      label: 'Kimi Code WaitFor timeout cap source (WAIT_FOR_MAX_TIMEOUT_S = 90)',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/20a2cea72f5d2c4be3a3845e4ff24ce302a6630e/packages/agent-core-v2/src/agent/tools/task/task-wait/task-wait.ts',
    },
    'kimi-wait-for-cap-docs': {
      label: 'Kimi Code built-in tools documentation (WaitFor 90s cap)',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/20a2cea72f5d2c4be3a3845e4ff24ce302a6630e/docs/zh/reference/tools.md',
    },
    'kimi-wait-for-cap-changeset': {
      label: 'Kimi Code WaitFor 90s cap changeset',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/20a2cea72f5d2c4be3a3845e4ff24ce302a6630e/.changeset/shorter-wait-for.md',
    },
    'kimi-remote-control-commit': {
      label: 'Kimi Code Remote Control web tunnel commit',
      url: 'https://github.com/MoonshotAI/kimi-code/commit/f0a609487fb835371c608cde101a6ff544c3c33e',
    },
    'kimi-remote-control-changeset': {
      label: 'Kimi Code Remote Control changeset',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/f0a609487fb835371c608cde101a6ff544c3c33e/.changeset/add-remote-control.md',
    },
    'kimi-remote-control-source': {
      label: 'Kimi Code Remote Control tunnel source',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/f0a609487fb835371c608cde101a6ff544c3c33e/apps/kimi-code/src/cli/sub/web/remote-control.ts',
    },
    'kimi-remote-control-flag': {
      label: 'Kimi Code Remote Control experimental flag source',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/f0a609487fb835371c608cde101a6ff544c3c33e/packages/agent-core-v2/src/app/remoteControl/flag.ts',
    },
    'kimi-remote-control-web-command': {
      label: 'Kimi Code kimi web Remote Control option source',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/f0a609487fb835371c608cde101a6ff544c3c33e/apps/kimi-code/src/cli/sub/web/run.ts',
    },
    'kimi-remote-control-tui-command': {
      label: 'Kimi Code /remote-control TUI command source',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/f0a609487fb835371c608cde101a6ff544c3c33e/apps/kimi-code/src/tui/commands/web.ts',
    },
    'kimi-remote-control-registry': {
      label: 'Kimi Code TUI command registry (/remote-control)',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/f0a609487fb835371c608cde101a6ff544c3c33e/apps/kimi-code/src/tui/commands/registry.ts',
    },
    'kimi-remote-control-drop-terminals': {
      label: 'Kimi Code --allow-remote-terminals removal changeset',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/f0a609487fb835371c608cde101a6ff544c3c33e/.changeset/drop-allow-remote-terminals.md',
    },
    'kimi-cli-no-channel': {
      label: 'Kimi Code CLI 参考（无渠道子命令）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/21406fb4c805cc8c715e6d1f16ad3fb5f25f4fe3/docs/zh/reference/kimi-command.md',
    },
    'kimi-commands-no-channel': {
      label: 'Kimi Code 斜杠命令表（无渠道命令）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/21406fb4c805cc8c715e6d1f16ad3fb5f25f4fe3/docs/zh/reference/slash-commands.md',
    },
    'kimi-config-no-channel': {
      label: 'Kimi Code 配置文档（无渠道配置节）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/21406fb4c805cc8c715e6d1f16ad3fb5f25f4fe3/docs/zh/configuration/config-files.md',
    },
    'kimi-remote-control-guide': {
      label: 'Kimi Code Remote Control 指南（任务始终在本机执行）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/21406fb4c805cc8c715e6d1f16ad3fb5f25f4fe3/docs/zh/guides/remote-control.md',
    },
    'qoder-commands': {
      label: 'Qoder CLI slash commands',
      url: 'https://docs.qoder.com/cli/slash-reference',
    },
    'qoder-custom-commands': {
      label:
        'Qoder CLI Custom Commands 页（1,203,352 字节；`https://docs.qoder.com/en/cli/commands` 会重定向到本页，`https://docs.qoder.com/cli/custom-commands` 为 404。逐字要点：Storage Locations and Priority 表两行为 Project-Level `.qoder/commands/<command_name>.md`（Current project only，Recommended (team sharing)）与 User-Level `~/.qoder/commands/<command_name>.md`（All projects，Do not commit (personal configuration)）；优先级段为 “**Priority**: If a command with the same name exists at both the project-level and User-Level, the **User-Level** (`~/.qoder/commands/`) command takes precedence and overrides the project-level command with the same name; the overridden definitions are listed under Also defined at in the command details. If Qoder CLI is already running, after adding or modifying a command configuration file, run `/commands` to reload and view the available commands.”；Naming Conventions 含 “Commands in subdirectories use `:` as the namespace separator; for example, `commands/git/commit.md` is registered as `/git:commit`”、“`frontmatter.name` serves only as the display name in the TUI; the command invocation name is always derived from the file path” 与 “If `SKILL.md` exists in the same directory, the directory will be registered as a single command (e.g., `/git`), and other sibling `.md` files within the directory will be ignored”；frontmatter 字段表只有 `name`（Required: No，显示名，调用名由文件路径决定且不受该字段影响）与 `description`（Required: Yes，支持 YAML 多行）；Command Types 表两行为 TUI Type（Applicable Mode: TUI，Extensibility: Built-in, custom extensions not supported）与 Prompt Type（“Submits preset prompts to the conversation to guide the CLI in completing specific tasks”，Applicable Mode: TUI + Headless，Extensibility: Supports user-defined custom extensions）；Headless 一句为 “Headless mode supports the execution of commands that submit prompts. Commands that require opening interactive selectors or dialogs should be used in TUI mode.”，示例为 `qoder -p \'/git-commit\'`；`/commands` 面板 “is used to view the list of currently available commands by category (Built-in, Dynamic, Skill, Plugin, Workflow, etc.) and does not provide an entry point for creation.”，用 Tab 切分类页签、上下键浏览、“Custom commands are categorized under **Dynamic**”、Esc 退出，且 “The panel is for browsing only.”；全页没有任何参数占位符语法（没有 `$ARGUMENTS`、`$1`、`{{args}}`），preset 只作为 Prompt Type 描述里的形容词出现一次，没有数字槽位机制）',
      url: 'https://docs.qoder.com/cli/commands',
    },
    'qoder-goal-reference': {
      label: 'Qoder CLI Goal Command Reference',
      url: 'https://docs.qoder.com/cli/goal-reference',
    },
    'qoder-agents': {
      label: 'Qoder CLI Subagent',
      url: 'https://docs.qoder.com/en/cli/subagent',
    },
    'qoder-glossary': {
      label: 'Qoder CLI Glossary（Compaction 定义）',
      url: 'https://docs.qoder.com/cli/glossary',
    },
    'qoder-how-it-works': {
      label: 'Qoder CLI How Task Execution Works（上下文窗口与 Compact 机制）',
      url: 'https://docs.qoder.com/cli/how-it-works',
    },
    'qoder-best-practices': {
      label:
        'Qoder CLI Best Practices（上下文紧张时用 `/compact` 压缩历史，没有空闲或缓存过期触发）',
      url: 'https://docs.qoder.com/cli/best-practices',
    },
    'qoder-permissions': {
      label: 'Qoder CLI Permissions',
      url: 'https://docs.qoder.com/en/cli/permissions',
    },
    'qoder-sandbox': {
      label: 'Qoder CLI Sandbox',
      url: 'https://docs.qoder.com/en/cli/sandbox',
    },
    'qoder-sdk-reference': {
      label: 'Qoder CLI SDK Reference',
      url: 'https://docs.qoder.com/en/cli/sdk/references',
    },
    'qoder-sdk-errors': {
      label:
        'Qoder CLI SDK Errors 页（2026-10-21 抓取）的退出码表逐字含 “| `44`      | Fatal sandbox error |”，同表相邻行为 `41` “Authentication failure; the SDK also triggers the authentication-expired callback when configured”、`42` “Invalid input or command-line arguments”、`52` “Fatal configuration error”、`53` “Fatal turn-limit error” 与 `54` “Fatal tool-execution error”；该页没有描述沙箱的配置键、默认状态或平台实现',
      url: 'https://docs.qoder.com/cli/sdk/errors',
    },
    'qoder-sdk-how-it-works': {
      label:
        'Qoder CLI SDK How it works 页（2026-10-21 抓取）逐字为 “`cwd`, tool allowlists, permission rules, hooks, sandboxing, and infrastructure isolation are complementary controls. Configure them according to the consequences of the task.”，同段另写 “Tools execute in the qodercli environment and may read, write, or call other systems according to their configuration.”；该页把 sandboxing 列为一种控制但没有给出键名、默认值或实现',
      url: 'https://docs.qoder.com/cli/sdk/how-it-works',
    },
    'qoder-docs-index': {
      label:
        'Qoder 官方文档索引 https://docs.qoder.com/llms.txt（2026-10-21 抓取，列出 646 个链接，其中 96 个为 `/cli/` 页面）：逐页抓取这 96 个 `/cli/*.md` 后只有三页出现 sandbox 字样——`cli/sdk/errors`（退出码 `44`）、`cli/sdk/how-it-works`（一句泛指）与 `cli/sdk/skills`（“Don\'t treat `skills` as a sandbox: security boundaries belong to tool allow/deny lists, the permission callback, permission modes, and sandboxing combined.”）；索引里没有 CLI 的 Sandbox 页，`https://docs.qoder.com/en/cli/sandbox` 与 `https://docs.qoder.com/cli/sandbox` 都返回 404；索引中含 sandbox 的其余链接属别的 Surface——`qoder/approval-and-sandbox`、`qoder/terminal-and-sandbox`、`user-guide/editor/terminal`、`user-guide/quest/terminal-and-sandbox`、`cloud-agents/overview`（“Run AI agents in fully managed cloud sandboxes.”）与 `cloud-agents/api/environments/storage-buckets`',
      url: 'https://docs.qoder.com/llms.txt',
    },
    'qoder-settings-reference-sandbox': {
      label:
        'Qoder CLI 设置参考页（2026-10-21 抓取，30,253 字节的 Markdown 形式）全文没有 sandbox 字样，即没有 `sandbox.enabled` 或 `sandbox.filesystem.*` 一类键；与文件边界相关的键逐字为 `permissions.allow`（string[]，默认 `[]`，Restart `No`，“List of automatically allowed permission rules. For rule syntax, see Permissions.”）、`permissions.ask`（“List of permission rules requiring confirmation.”）、`permissions.deny`（“List of always denied permission rules.”）、`permissions.additionalDirectories`（“Additional trusted directories added to workspace context (corresponding to `/add-dir`).”）与 `permissions.trustDirectories`（“Directories explicitly trusted by the user; stored in user-level configuration and not overridden by project-level configuration.”）',
      url: 'https://docs.qoder.com/cli/settings-reference',
    },
    'qoder-release-notes-sandbox': {
      label:
        'Qoder CLI 官方 Release Notes（2026-10-21 抓取，111,371 字节的 Markdown 形式）最新条目为 CLI 1.1.75（October 20, 2026，小节 “Configurable session cleanup and faster /branch command”，两条为 “Removed automatic session cleanup; it can now be enabled by modifying the configuration” 与 “Improved the execution speed of the /branch command”），其后是 1.1.74（October 19, 2026）、1.1.73、1.1.72 与 1.1.71；整份发布说明只有 CLI 1.0.0（May 20, 2026）段 “Enterprise Integration” 下的一条 “**Cloud Agents:** Agents-as-a-Service. Sandbox isolation, state management, async orchestration, credential management, and long-running execution all built into the platform.” 含 sandbox 字样，属云端 Surface，1.1.66 至 1.1.75 各段都没有本地沙箱键或 OS 隔离条目',
      url: 'https://docs.qoder.com/release-notes/qoder-cli',
    },
    'qoder-sdk-quickstart': {
      label: 'Qoder Agent SDK TypeScript quick start',
      url: 'https://docs.qoder.com/en/cli/sdk/quick-start',
    },
    'qoder-sdk-python': {
      label: 'Qoder Agent SDK Python quick start',
      url: 'https://docs.qoder.com/en/cli/sdk/python/quick-start',
    },
    'qoder-cloud-agent': {
      label: 'Qoder SDK Cloud Agent',
      url: 'https://docs.qoder.com/en/cli/sdk/cloud-agent',
    },
    'qoder-memory': {
      label: 'Qoder CLI Memory',
      url: 'https://docs.qoder.com/en/cli/memory',
    },
    'qoder-checkpoint': {
      label: 'Qoder CLI SDK Checkpoint',
      url: 'https://docs.qoder.com/en/cli/sdk/checkpoint',
    },
    'qoder-undo-restore': {
      label: 'Qoder CLI Undo and Restore（`/rewind` 检查点、三种恢复范围与影响预览）',
      url: 'https://docs.qoder.com/cli/undo-restore',
    },
    'qoder-agent-teams': {
      label: 'Qoder CLI Agent Teams',
      url: 'https://docs.qoder.com/cli/agent-teams',
    },
    'qoder-cross-session-messaging': {
      label: 'Qoder CLI Cross-Session Messaging（`QODER_FEATURE_CROSS_SESSION`、`/peers`、入站策略与批准框）',
      url: 'https://docs.qoder.com/cli/cross-session-messaging',
    },
    'qoder-settings-reference': {
      label: 'Qoder CLI 设置、环境变量与文件路径参考（未列出 `security.crossSessionInbound` 与 `general.dialogExpiry`）',
      url: 'https://docs.qoder.com/cli/settings-reference',
    },
    'qoder-mcp': {
      label: 'Qoder CLI MCP servers',
      url: 'https://docs.qoder.com/en/cli/mcp-servers',
    },
    'qoder-skills': {
      label: 'Qoder CLI Skills',
      url: 'https://docs.qoder.com/en/cli/Skills',
    },
    'qoder-hooks': {
      label: 'Qoder CLI Hooks',
      url: 'https://docs.qoder.com/en/cli/hooks',
    },
    'qoder-hooks-concurrency': {
      label:
        'Qoder CLI Hooks 页（2026-10-19 复核执行顺序与并发）：全页没有任何说明匹配同一事件的多个 Hook 是并行还是顺序执行的语句，也没有数字形式的并发上限，与执行顺序相关的只有配置合并口径 “All three sources are **loaded and merged together** (hooks for the same event do not override each other)”；事件表仍是 23 个（`SessionStart`、`SessionEnd`、`UserPromptSubmit`、`PreToolUse`、`PostToolUse`、`PostToolUseFailure`、`PermissionRequest`、`PermissionDenied`、`Stop`、`StopFailure`、`SubagentStart`、`SubagentStop`、`PreCompact`、`PostCompact`、`Notification`、`InstructionsLoaded`、`ConfigChange`、`CwdChanged`、`FileChanged`、`WorktreeCreate`、`WorktreeRemove`、`Elicitation`、`ElicitationResult`）；`timeout` 默认值仍是 command 600、http 600、prompt 30、agent 60；后台执行仍只有组级 `async`（“When `true`, all hooks in the group run in the background without blocking the current operation; results are injected as additional context in the next model turn”）、条目级 `async`（“When `true`, this single hook runs in the background; overrides the group-level `async`”）与 `asyncRewake`（“When `true`, runs in the background; if it exits with code 2, the CLI builds a system reminder from stderr/stdout/error and wakes the model — useful for long-running checks”），三者都没有并发数量限制',
      url: 'https://docs.qoder.com/en/cli/hooks',
    },
    'qoder-release-notes-hooks-recheck': {
      label:
        'Qoder CLI Release Notes（2026-10-19 复核 Hook 相关条目）：最新条目为 CLI 1.1.73（2026-10-16，只有 “Added support for using site capabilities via qoder sites subcommands”），其前的 1.1.72（2026-10-15）、1.1.71（2026-10-14）、1.1.70（2026-10-13）、1.1.69（2026-10-12）与 1.1.68（2026-10-10）六版里没有任何提到 hooks、生命周期事件、`PreToolUse`、`SessionEnd`、异步 Hook 或 Hook 配置的条目',
      url: 'https://docs.qoder.com/release-notes/qoder-cli',
    },
    'qoder-plugins': {
      label: 'Qoder CLI Plugins',
      url: 'https://docs.qoder.com/en/cli/plugins',
    },
    'qoder-acp': {
      label: 'Qoder CLI ACP',
      url: 'https://docs.qoder.com/en/cli/acp',
    },
    'qoder-tools': {
      label: 'Qoder CLI built-in tools',
      url: 'https://docs.qoder.com/en/cli/sdk/tools',
    },
    'qoder-using-cli': {
      label: 'Qoder CLI usage and worktrees',
      url: 'https://docs.qoder.com/en/cli/using-cli',
    },
    'qoder-cli-reference': {
      label: 'Qoder CLI 命令行参考（`--worktree`、子命令表与 `plugins`/`skills`/`hooks`/`agents` 子命令组）',
      url: 'https://docs.qoder.com/cli/cli-reference',
    },
    'qoder-cli-reference-daemon': {
      label:
        'Qoder CLI 命令行参考（2026-10-22 抓取）子命令表共 14 行：`mcp`、`plugins`（别名 `plugin`）、`skills`（别名 `skill`）、`hooks`（别名 `hook`）、`agents`（别名 `agent`）、`login`、`commit`、`rollback`、`update`、`remote-control`、`status`、`sites`、`feedback` 与 `wiki`；其中与常驻服务有关的只有 “`remote-control` | Start the remote-control daemon.” 一行，`status` 一行是 “Display session status.” 而不是 daemon 状态，表里没有任何 daemon 的 stop/restart/logs/update 子命令；`--acp` 在 “Editor Integration” 段逐字为 “Start as an ACP server for integration via standard input/output by clients implementing the ACP protocol, such as Zed.”；[CLI Release Notes](https://docs.qoder.com/release-notes/qoder-cli) 最新六版 1.1.77（2026-10-22）、1.1.76（2026-10-21）、1.1.75（2026-10-20）、1.1.74（2026-10-19）、1.1.73（2026-10-16）与 1.1.72（2026-10-15）都没有 daemon、remote-control 或后台服务条目',
      url: 'https://docs.qoder.com/cli/cli-reference',
    },
    'qoder-builtins-reference': {
      label: 'Qoder CLI 内置能力参考（`batch` Skill）',
      url: 'https://docs.qoder.com/cli/builtins-reference',
    },
    'qoder-parallel-tasks': {
      label: 'Qoder CLI Parallel Tasks（Worktree 目录、临时分支与清理）',
      url: 'https://docs.qoder.com/cli/parallel-tasks',
    },
    'qoder-remote-control': {
      label: 'Qoder CLI Remote Control',
      url: 'https://docs.qoder.com/en/cli/remote-control',
    },
    'qoder-cloud-mode': {
      label: 'Qoder CLI Cloud Mode',
      url: 'https://docs.qoder.com/en/cli/cloud-mode',
    },
    'qoder-desktop': {
      label: 'Qoder IDE quick start',
      url: 'https://docs.qoder.com/quick-start',
    },
    'qoder-download-page': {
      label: 'Qoder 官方下载页（IDE、JetBrains Plugin、CLI、QoderWake 与 QoderWork 下载项）',
      url: 'https://qoder.com/download',
    },
    'qoder-web': {
      label: 'Qoder Web remote and cloud tasks',
      url: 'https://docs.qoder.com/mobile/web/remote-control',
    },
    'qoder-action': {
      label: 'Qoder Action',
      url: 'https://docs.qoder.com/en/cli/qoder-action',
    },
    'qoder-model': {
      label: 'Qoder CLI model configuration',
      url: 'https://docs.qoder.com/en/cli/model',
    },
    'qoder-model-tiers': {
      label:
        'Qoder CLI「Select Models and Reasoning Effort」页（2026-10-17 复核）：`/model` 选择器有 Default、New Models、Custom 三个页签，`Tab` 切换；Default 是四个分档模型池（Smart Routing (Auto) ~1.0x、Ultimate ~1.6x、Performance ~1.1x、Efficient ~0.3x，倍率是计费系数而不是固定 Credit 数）；New Models 页签列出当前可直选的具体模型（Qwen3.8-Max、Qwen3.7-Max、Qwen3.7-Plus、Kimi-K3、Kimi-K2.7-Code、GLM-5.3、GLM-5.2、DeepSeek-V4-Pro、DeepSeek-V4-Flash、MiniMax-M3 及各自能力与 `price_factor`），并写明 “Currently, only some models are open for direct selection.” 与可用模型随服务端模型列表更新而变化、以 `/model` 界面和 `--list-models` 输出为准；Custom 页签逐字为 “Connect models from your own provider subscriptions. Qoder supports a curated list of providers. Configure your API key to start using them.”，适用版本 Individual plan，该页点名的 Supported Providers 为 Alibaba Cloud Model Studio、DeepSeek、Z.ai、Kimi、MiniMax、Xiaomi MIMO；添加流程为 Custom 页签 → `Add custom model...` → Provider → Model Type → Model → 输入 API Key 与其余必填项 → 校验通过后保存可用，删除是在 Custom 页签选中后按 `d`；启动旗标 `--model`、`--reasoning-effort`、`--context-window` 只作用于当前会话且不持久化，`qoder --list-models` 不开 TUI 直接打印当前账号可用模型；TUI 里 `Enter` 选中的模型自动写入 `~/.qoder/settings.json` 并跨会话保留，`s` 只对当前会话生效',
      url: 'https://docs.qoder.com/en/cli/model',
    },
    'qoder-custom-models': {
      label:
        'Qoder CLI「Custom Models」页（2026-10-17 复核）：逐字为 “Qoder CLI supports BYOK (Bring Your Own Key). You can use an API key obtained from a model provider to call models included in the corresponding subscription plan. Add and manage custom models from the `Custom` tab in `/model`.”；Available edition 为 Individual plan，Supported providers 一栏写 “Refer to the live catalog displayed by the Custom wizard.”；添加流程与 Models 页一致（Provider → model type → model → 输入 API Key 与其余信息 → “After validation succeeds, the configuration is saved automatically and the model is immediately available for selection.”）；页面明确要求 “Configure BYOK through the Custom wizard in `/model`. Do not configure BYOK manually in `settings.json`; the available providers, models, and credential fields are determined by the BYOK catalog available to the current account.”；删除为 Custom 页签选中后按 `d`；故障排查三条为 Custom 页签或添加入口缺失时确认当前账号与计划是否可用 BYOK、某厂商或模型缺失时以向导显示的目录为准、API Key 校验失败时检查 Key 有效性与订阅计划是否授予该模型访问权',
      url: 'https://docs.qoder.com/cli/custom-models',
    },
    'qoder-release-notes-byok': {
      label:
        'Qoder CLI Release Notes 的 BYOK 与自定义模型时间线（2026-10-17 复核，最新条目为 2026-10-15 的 CLI 1.1.72）：0.1.31（2026-03-13）“Custom Model Support — Support for custom models with providers like Alibaba Cloud Bailian Coding Plan”；0.2.0（2026-04-27）“Multi-model support — integrated state-of-the-art models from across the globe, with BYOK so you\'re no longer locked to a single provider.”；0.2.5（2026-04-29）“BYOK Custom URL: bring your own API key with custom endpoint support”；1.1.50（2026-09-11）“Personal edition users can now centrally configure and manage BYOK models with custom URL endpoints from the Custom page in `/model`”；1.1.63（2026-09-24）“Approval requests in Auto permission mode now follow the BYOK model”；1.1.64（2026-09-25）至 1.1.72（2026-10-15）十个版本里只有 1.1.67 “Improved model information display”、1.1.70 的 Bailian 模型请求限流自动重试与 1.1.71 “Improved model list loading and update experience” 三条与模型相关，没有任何 Provider、BYOK 或自定义端点条目',
      url: 'https://docs.qoder.com/release-notes/qoder-cli',
    },
    'qoder-quick-start': {
      label: 'Qoder CLI login and quick start',
      url: 'https://docs.qoder.com/en/cli/quick-start',
    },
    'qoder-sdk-auth': {
      label: 'Qoder Agent SDK authentication',
      url: 'https://docs.qoder.com/en/cli/sdk/authentication',
    },
    'qoder-teams': {
      label: 'Qoder Teams administration',
      url: 'https://docs.qoder.com/account/teams/get-started-with-teams',
    },
    'qoder-sso': {
      label: 'Qoder Teams SSO',
      url: 'https://docs.qoder.com/account/teams/sso',
    },
    'qoder-docs': {
      label: 'Qoder CLI Documentation',
      url: 'https://docs.qoder.com/en/cli',
    },
    'qoder-output-styles': {
      label: 'Qoder CLI Output Style',
      url: 'https://docs.qoder.com/cli/output-styles',
    },
    'qoder-settings': {
      label: 'Qoder CLI Configuration Files and Application Order',
      url: 'https://docs.qoder.com/cli/settings',
    },
    'qoder-cli-overview': {
      label: 'Qoder CLI overview（Remote and Integrations）',
      url: 'https://docs.qoder.com/cli/overview',
    },
    'qoder-im-channel-controls': {
      label: 'Qoder Teams IM Channel controls（仅 QoderWork 通知投递）',
      url: 'https://docs.qoder.com/account/teams/im-channel-controls',
    },
    'claude-scheduled-tasks': {
      label: 'Claude Code Run prompts on a schedule',
      url: 'https://code.claude.com/docs/en/scheduled-tasks',
    },
    'claude-routines': {
      label: 'Claude Code Routines（云端定时任务）',
      url: 'https://code.claude.com/docs/en/routines',
    },
    'claude-desktop-scheduled-tasks': {
      label: 'Claude Code Desktop scheduled tasks',
      url: 'https://code.claude.com/docs/en/desktop-scheduled-tasks',
    },
    'claude-cron-changelog': {
      label: 'Claude Code 更新日志（`/loop` 与 cron 工具版本时间线）',
      url: 'https://github.com/anthropics/claude-code/blob/1c229fcd1e1e4e452e29a8f116b45fe4cfe2c528/CHANGELOG.md',
    },
    'codex-automations': {
      label: 'Codex Scheduled tasks（Automations）',
      url: 'https://learn.chatgpt.com/docs/automations',
    },
    'codex-reference-commands': {
      label: 'Codex Commands reference（`codex://automations` 深链接）',
      url: 'https://learn.chatgpt.com/docs/reference/commands',
    },
    'qwen-scheduled-tasks-doc': {
      label: 'Qwen Code 定时任务文档',
      url: 'https://github.com/QwenLM/qwen-code/blob/612a55295993ffd60303cfc8d3445abac8ae2ad9/docs/users/features/scheduled-tasks.md',
    },
    'qwen-scheduled-tasks-doc-v0247': {
      label: 'Qwen Code v0.24.7 定时任务文档（已随 Release 发布）',
      url: 'https://github.com/QwenLM/qwen-code/blob/v0.24.7/docs/users/features/scheduled-tasks.md',
    },
    'qwen-loop-skill': {
      label: 'Qwen Code `/loop` bundled Skill 正文',
      url: 'https://github.com/QwenLM/qwen-code/blob/612a55295993ffd60303cfc8d3445abac8ae2ad9/packages/core/src/skills/bundled/loop/SKILL.md',
    },
    'qwen-cron-create-tool': {
      label: 'Qwen Code `cron_create` 工具源码',
      url: 'https://github.com/QwenLM/qwen-code/blob/612a55295993ffd60303cfc8d3445abac8ae2ad9/packages/core/src/tools/cron-create.ts',
    },
    'qwen-cron-tool-names': {
      label: 'Qwen Code 工具名与显示名对照源码',
      url: 'https://github.com/QwenLM/qwen-code/blob/612a55295993ffd60303cfc8d3445abac8ae2ad9/packages/core/src/tools/tool-names.ts',
    },
    'qwen-cron-scheduler': {
      label: 'Qwen Code cron 调度器源码（上限、抖动、过期与唤醒上限）',
      url: 'https://github.com/QwenLM/qwen-code/blob/612a55295993ffd60303cfc8d3445abac8ae2ad9/packages/core/src/services/cronScheduler.ts',
    },
    'qwen-cron-scheduler-v0247': {
      label: 'Qwen Code v0.24.7 cron 调度器源码（已随 Release 发布）',
      url: 'https://github.com/QwenLM/qwen-code/blob/v0.24.7/packages/core/src/services/cronScheduler.ts',
    },
    'qwen-cron-tasks-file': {
      label: 'Qwen Code 定时任务持久化与跨进程文件锁源码',
      url: 'https://github.com/QwenLM/qwen-code/blob/612a55295993ffd60303cfc8d3445abac8ae2ad9/packages/core/src/services/cronTasksFile.ts',
    },
    'qwen-loop-wakeup-tool': {
      label: 'Qwen Code `loop_wakeup` 工具源码',
      url: 'https://github.com/QwenLM/qwen-code/blob/612a55295993ffd60303cfc8d3445abac8ae2ad9/packages/core/src/tools/loop-wakeup.ts',
    },
    'qwen-cron-settings-schema': {
      label: 'Qwen Code 设置 schema（`experimental.cron` 与 `experimental.cronRecurringMaxAgeDays`）',
      url: 'https://github.com/QwenLM/qwen-code/blob/612a55295993ffd60303cfc8d3445abac8ae2ad9/packages/cli/src/config/settingsSchema.ts',
    },
    'qwen-cron-settings-doc': {
      label: 'Qwen Code 设置文档（`experimental.cron` 两键）',
      url: 'https://github.com/QwenLM/qwen-code/blob/612a55295993ffd60303cfc8d3445abac8ae2ad9/docs/users/configuration/settings.md',
    },
    'qwen-cron-skill-loopmd': {
      label: 'Qwen Code `/loop` Skill 的 `.qwen/loop.md` 任务文件模式与自主模式',
      url: 'https://github.com/QwenLM/qwen-code/blob/2c591ecc08a6fa080342f9b1b9f7f43215178cbb/packages/core/src/skills/bundled/loop/SKILL.md',
    },
    'kimi-cron-tools-doc': {
      label: 'Kimi Code 工具文档「定时任务」章节',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/21406fb4c805cc8c715e6d1f16ad3fb5f25f4fe3/docs/zh/reference/tools.md',
    },
    'kimi-cron-tools-doc-v211': {
      label: 'Kimi Code 2.1.1 工具文档「定时任务」章节（已随 Release 发布）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/%40moonshot-ai/kimi-code%402.1.1/docs/zh/reference/tools.md',
    },
    'kimi-cron-tools-doc-en': {
      label: 'Kimi Code 英文工具文档「Scheduled tasks」章节（一次性抖动方向与源码相反）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/21406fb4c805cc8c715e6d1f16ad3fb5f25f4fe3/docs/en/reference/tools.md',
    },
    'kimi-cron-changelog': {
      label: 'Kimi Code 中文更新日志（0.5.0 新增定时任务）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/21406fb4c805cc8c715e6d1f16ad3fb5f25f4fe3/docs/zh/release-notes/changelog.md',
    },
    'kimi-cron-env-doc': {
      label: 'Kimi Code 环境变量文档（`KIMI_DISABLE_CRON`）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/21406fb4c805cc8c715e6d1f16ad3fb5f25f4fe3/docs/zh/configuration/env-vars.md',
    },
    'kimi-cron-data-doc': {
      label: 'Kimi Code 数据位置文档（会话目录 `cron/`）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/21406fb4c805cc8c715e6d1f16ad3fb5f25f4fe3/docs/zh/configuration/data-locations.md',
    },
    'kimi-slash-no-cron': {
      label: 'Kimi Code 斜杠命令表（无定时任务命令）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/21406fb4c805cc8c715e6d1f16ad3fb5f25f4fe3/docs/zh/reference/slash-commands.md',
    },
    'kimi-config-no-cron': {
      label: 'Kimi Code 配置文档（顶层节未列出 `[cron]`）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/21406fb4c805cc8c715e6d1f16ad3fb5f25f4fe3/docs/zh/configuration/config-files.md',
    },
    'kimi-cli-session-flag': {
      label: 'Kimi Code CLI 参考（`--session`/`-S` 与隐藏别名 `-r`/`--resume`）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/21406fb4c805cc8c715e6d1f16ad3fb5f25f4fe3/docs/zh/reference/kimi-command.md',
    },
    'kimi-cron-feature': {
      label: 'Kimi Code cron 功能注册源码（工具名与 domain）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/21406fb4c805cc8c715e6d1f16ad3fb5f25f4fe3/packages/agent-core-v2/src/features/cron/cronFeature.ts',
    },
    'kimi-cron-service': {
      label: 'Kimi Code cron 调度服务源码（轮询、合并、stale、fork 清空）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/21406fb4c805cc8c715e6d1f16ad3fb5f25f4fe3/packages/agent-core-v2/src/features/cron/cronService.ts',
    },
    'kimi-cron-create-tool': {
      label: 'Kimi Code `CronCreate` 工具源码（校验与拒绝文案）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/21406fb4c805cc8c715e6d1f16ad3fb5f25f4fe3/packages/agent-core-v2/src/features/cron/tools/cron-create/cronCreateTool.ts',
    },
    'kimi-cron-create-schema': {
      label: 'Kimi Code `CronCreate` 参数、任务上限与 prompt 上限源码',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/21406fb4c805cc8c715e6d1f16ad3fb5f25f4fe3/packages/agent-core-v2/src/features/cron/tools/cron-create/cron-create.ts',
    },
    'kimi-cron-create-desc': {
      label: 'Kimi Code `CronCreate` 工具说明正文',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/21406fb4c805cc8c715e6d1f16ad3fb5f25f4fe3/packages/agent-core-v2/src/features/cron/tools/cron-create/cron-create.md',
    },
    'kimi-cron-list-desc': {
      label: 'Kimi Code `CronList` 工具说明正文',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/21406fb4c805cc8c715e6d1f16ad3fb5f25f4fe3/packages/agent-core-v2/src/features/cron/tools/cron-list/cron-list.md',
    },
    'kimi-cron-delete-desc': {
      label: 'Kimi Code `CronDelete` 工具说明正文',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/21406fb4c805cc8c715e6d1f16ad3fb5f25f4fe3/packages/agent-core-v2/src/features/cron/tools/cron-delete/cron-delete.md',
    },
    'kimi-cron-config-section': {
      label: 'Kimi Code `[cron]` 配置节与环境变量绑定源码',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/21406fb4c805cc8c715e6d1f16ad3fb5f25f4fe3/packages/agent-core-v2/src/features/cron/configSection.ts',
    },
    'kimi-cron-jitter': {
      label: 'Kimi Code cron 抖动常量与算法源码',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/21406fb4c805cc8c715e6d1f16ad3fb5f25f4fe3/packages/agent-core-v2/src/features/cron/internal/jitter.ts',
    },
    'kimi-cron-envelope': {
      label: 'Kimi Code `<cron-fire>` 信封渲染源码',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/21406fb4c805cc8c715e6d1f16ad3fb5f25f4fe3/packages/agent-core-v2/src/features/cron/internal/format.ts',
    },
    'kimi-cron-ops': {
      label: 'Kimi Code cron durable 事件源码（`cron.add`/`cron.delete`/`cron.cursor`）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/21406fb4c805cc8c715e6d1f16ad3fb5f25f4fe3/packages/agent-core-v2/src/features/cron/cronOps.ts',
    },
    'kimi-cron-vis-store': {
      label: 'Kimi Code `kimi vis` 只读 cron 读取器源码（v1/v2 持久化布局与 ID 形状）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/21406fb4c805cc8c715e6d1f16ad3fb5f25f4fe3/apps/vis/server/src/lib/cron-store.ts',
    },
    'kimi-cron-fork-changeset': {
      label: 'Kimi Code fork 会话清空 cron 任务 changeset',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/21406fb4c805cc8c715e6d1f16ad3fb5f25f4fe3/.changeset/fork-cron-clear.md',
    },
    'kimi-cron-fork-commit': {
      label: 'Kimi Code fork 会话清空 cron 任务提交（PR #4083）',
      url: 'https://github.com/MoonshotAI/kimi-code/commit/f409caa21e71ce7beb158d29ffca1fed76216a64',
    },
    'qoder-scheduled-tasks': {
      label: 'Qoder CLI Scheduled Execution Task',
      url: 'https://docs.qoder.com/cli/scheduled-tasks',
    },
    'qoder-scheduled-reference': {
      label: 'Qoder CLI Scheduled Task Reference',
      url: 'https://docs.qoder.com/cli/scheduled-reference',
    },
    'qoder-loop': {
      label: 'Qoder CLI Loop Tasks',
      url: 'https://docs.qoder.com/cli/loop',
    },
    'qoder-loop-reference': {
      label: 'Qoder CLI Loop Command Reference',
      url: 'https://docs.qoder.com/cli/loop-reference',
    },
    'qoder-release-notes': {
      label: 'Qoder CLI Release Notes（跨会话消息、`/loop`、`/crontab`、任务预算、Hook 失败、`/hooks` GA 与插件市场条目的版本时间线）',
      url: 'https://docs.qoder.com/release-notes/qoder-cli',
    },
    'qoder-release-notes-auto-mode': {
      label:
        'Qoder CLI Release Notes（审批自动审查相关条目：1.1.62 于 2026-09-23 “Improved the two-phase review flow of Auto permission mode to speed up reviews”、1.1.63 于 2026-09-24 “Approval requests in Auto permission mode now follow the BYOK model”、1.1.56 于 2026-09-18 “Improved Auto mode: when the auto-approval component is temporarily unavailable, it now falls back to user confirmation and shows the reason”；1.1.64 至最新 1.1.72（2026-10-15）没有任何 auto 模式、审批、分类器或权限条目）',
      url: 'https://docs.qoder.com/release-notes/qoder-cli',
    },
    'qoder-tools-delegate': {
      label: 'Qoder CLI Tools（Delegate and Automate 分组的 Scheduled work 行；未列出 `SendMessage`/`ListAgents`）',
      url: 'https://docs.qoder.com/cli/tools',
    },
    'qoder-ide-automations': {
      label: 'Qoder IDE Automations（与 CLI 定时任务不同的独立机制）',
      url: 'https://docs.qoder.com/qoder/automations',
    },
    'qwen-mem0-doc': {
      label: 'Qwen Code Mem0 官方功能文档（内置外部记忆服务）',
      url: 'https://github.com/QwenLM/qwen-code/blob/abcf23a3d9b184bb850fb46bd706cd206082366a/docs/users/features/mem0.md',
    },
    'qwen-mem0-settings-source': {
      label: 'Qwen Code `memory.mem0` schema、MCP 绑定与写入确认 Hook 源码',
      url: 'https://github.com/QwenLM/qwen-code/blob/abcf23a3d9b184bb850fb46bd706cd206082366a/packages/cli/src/config/mem0-settings.ts',
    },
    'qwen-mem0-config-gate': {
      label: 'Qwen Code 配置装配源码（绑定门禁、顶层 MCP 与同名冲突报错）',
      url: 'https://github.com/QwenLM/qwen-code/blob/abcf23a3d9b184bb850fb46bd706cd206082366a/packages/cli/src/config/config.ts',
    },
    'qwen-mem0-settings-scope': {
      label: 'Qwen Code 设置合并源码（`memory.mem0` 只取系统默认、用户与系统设置）',
      url: 'https://github.com/QwenLM/qwen-code/blob/abcf23a3d9b184bb850fb46bd706cd206082366a/packages/cli/src/config/settings.ts',
    },
    'qwen-mem0-settings-doc': {
      label: 'Qwen Code v0.25.0 设置文档（`memory.mem0` 与 `memory.enableStructuredRecall`）',
      url: 'https://github.com/QwenLM/qwen-code/blob/v0.25.0/docs/users/configuration/settings.md',
    },
    'qwen-memory-v0250': {
      label: 'Qwen Code v0.25.0 记忆文档（`pinned/` 与结构化召回）',
      url: 'https://github.com/QwenLM/qwen-code/blob/v0.25.0/docs/users/features/memory.md',
    },
    'qwen-memory-v0247': {
      label: 'Qwen Code v0.24.7 记忆文档（结构化召回首次出现的发行版）',
      url: 'https://github.com/QwenLM/qwen-code/blob/v0.24.7/docs/users/features/memory.md',
    },
    'qwen-memory-v0220': {
      label: 'Qwen Code v0.22.0 记忆文档（`pinned/` 首次出现的发行版）',
      url: 'https://github.com/QwenLM/qwen-code/blob/v0.22.0/docs/users/features/memory.md',
    },
    'qwen-v0250-release': {
      label: 'Qwen Code v0.25.0 发布说明（Mem0 随主 CLI 发布）',
      url: 'https://github.com/QwenLM/qwen-code/releases/tag/v0.25.0',
    },
    'qwen-mem0-pr': {
      label: 'Qwen Code PR #12891（bundle Mem0 with the main CLI）',
      url: 'https://github.com/QwenLM/qwen-code/pull/12891',
    },
    'codex-v0161-release': {
      label: 'Codex rust-v0.161.0 发布说明（`/mcp login <name>`）',
      url: 'https://github.com/openai/codex/releases/tag/rust-v0.161.0',
    },
    'codex-mcp-login-pr': {
      label: 'Codex PR #49290（Add `/mcp login <name>` to the TUI）',
      url: 'https://github.com/openai/codex/pull/49290',
    },
    'codex-slash-command-v0161': {
      label: 'Codex rust-v0.161.0 Slash 命令源码（`/mcp` 描述含 login）',
      url: 'https://github.com/openai/codex/blob/979011409de0a60b52f179721948e65531d26144/codex-rs/tui/src/slash_command.rs',
    },
    'codex-mcp-login-dispatch': {
      label: 'Codex rust-v0.161.0 `/mcp` 参数解析与报错源码',
      url: 'https://github.com/openai/codex/blob/979011409de0a60b52f179721948e65531d26144/codex-rs/tui/src/chatwidget/slash_dispatch.rs',
    },
    'codex-mcp-login-snapshot': {
      label: 'Codex rust-v0.161.0 `/mcp login` 重叠启动与结果保留测试快照',
      url: 'https://github.com/openai/codex/blob/979011409de0a60b52f179721948e65531d26144/codex-rs/tui/src/app/tests/snapshots/codex_tui__app__tests__mcp_login_tests__overlapping_mcp_login.snap',
    },
    'codex-cli-command-reference': {
      label: 'Codex CLI 命令参考（`codex mcp login` 与 `logout`，OAuth 仅限 streamable HTTP）',
      url: 'https://learn.chatgpt.com/docs/developer-commands?surface=cli',
    },
    'codex-slash-command-reference': {
      label: 'Codex Slash 命令参考页（`/mcp` 未列子命令）',
      url: 'https://learn.chatgpt.com/docs/reference/slash-commands',
    },
    'qwen-mcp-command-source': {
      label: 'Qwen Code v0.25.1-preview.0 `/mcp` 命令源码',
      url: 'https://github.com/QwenLM/qwen-code/blob/304df378b562b82e371b4eae86610a83548d2e39/packages/cli/src/ui/commands/mcpCommand.ts',
    },
    'qwen-mcp-v0251': {
      label: 'Qwen Code v0.25.1-preview.0 MCP 文档（`/mcp` 对话框、OAuth 与令牌存储）',
      url: 'https://github.com/QwenLM/qwen-code/blob/304df378b562b82e371b4eae86610a83548d2e39/docs/users/features/mcp.md',
    },
    'qwen-commands-v0251': {
      label: 'Qwen Code v0.25.1-preview.0 命令文档（`/mcp` 行）',
      url: 'https://github.com/QwenLM/qwen-code/blob/304df378b562b82e371b4eae86610a83548d2e39/docs/users/features/commands.md',
    },
    'qwen-mcp-command-v0247': {
      label: 'Qwen Code v0.24.7 `/mcp` 命令源码（与 v0.25.1-preview.0 逐字节相同）',
      url: 'https://github.com/QwenLM/qwen-code/blob/v0.24.7/packages/cli/src/ui/commands/mcpCommand.ts',
    },
    'kimi-slash-commands-mcp': {
      label: 'Kimi Code 斜杠命令表（`/mcp` 与 `/mcp-config` 行）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/21406fb4c805cc8c715e6d1f16ad3fb5f25f4fe3/docs/zh/reference/slash-commands.md',
    },
    'kimi-mcp-21406f': {
      label: 'Kimi Code MCP 文档（`/mcp-config login <server-name>`）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/21406fb4c805cc8c715e6d1f16ad3fb5f25f4fe3/docs/zh/customization/mcp.md',
    },
    'kimi-mcp-oauth-210': {
      label: 'Kimi Code 2.1.0 发布说明（MCP OAuth offline_access 修复）',
      url: 'https://github.com/MoonshotAI/kimi-code/releases/tag/%40moonshot-ai%2Fkimi-code%402.1.0',
    },
    'kimi-mcp-oauth-200': {
      label: 'Kimi Code 2.0.0 发布说明（401 工具调用触发 MCP OAuth 登录）',
      url: 'https://github.com/MoonshotAI/kimi-code/releases/tag/%40moonshot-ai%2Fkimi-code%402.0.0',
    },
    'codex-plugin-cli-reference': {
      label:
        'Codex CLI 命令参考（`codex plugin` 与 `codex plugin marketplace` 子命令、旗标与 JSON 输出字段）',
      url: 'https://learn.chatgpt.com/docs/developer-commands?surface=cli',
    },
    'qwen-extensions-v0251preview1': {
      label:
        'Qwen Code v0.25.1-preview.1 Extensions 文档（`qwen extensions sources`、`/extensions manage` 三页签与安装来源）',
      url: 'https://github.com/QwenLM/qwen-code/blob/683f3f063aa05c67c339a70fbc740f08c006f9de/docs/users/extension/introduction.md',
    },
    'kimi-plugins-7ad0c46': {
      label:
        'Kimi Code Plugins 文档（Installed/Official/Curated/Custom 四页签、`/plugins marketplace [source]` 与默认 marketplace）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/7ad0c46682ec735559a12c6a410c406b9d6cb709/docs/zh/customization/plugins.md',
    },
    'qoder-plugins-detail': {
      label:
        'Qoder CLI Plugins 页（`qoder plugins` 子命令组、marketplace 四种来源、三种 scope、`enabledPlugins` 与 `QODER_PLUGIN_ROOT`/`QODER_PLUGIN_DATA`）',
      url: 'https://docs.qoder.com/cli/plugins',
    },
    'claude-tool-search-changelog': {
      label:
        'Claude Code 更新日志（工具搜索版本时间线：v2.1.7 auto 模式默认开启并按 10% 上下文阈值延迟、v2.1.9 `auto:N`、v2.1.119 Vertex AI 默认关闭、v2.1.121 Server `alwaysLoad`、v2.1.221 Vertex 对 4.5 代及以上重新启用、v2.1.285 工具级 `_meta` 与 Server 级 `alwaysLoad` 的覆盖关系、v2.1.287 Server `alwaysLoad: false` 延迟该 Server 全部工具、v2.1.293 mods `$.tool.register` 的 `isDeferred`、v2.1.295 经工具搜索加载的描述改为 16,384 字符、v2.1.296 上送描述与 Server instructions 默认上限由 2,048 改为 4,096、v2.1.299 `api.anthropic.com` 第一方 MCP 服务器的描述与 Server instructions 不再截断在 4,096 字符，固定到 v2.1.299）',
      url: 'https://github.com/anthropics/claude-code/blob/db93774d73e8fdbaf315a6f4c175ae99ad3d515a/CHANGELOG.md',
    },
    'codex-tool-search-spec': {
      label:
        'Codex `tool_search` 工具声明源码（描述逐字为 “Searches over deferred tool metadata with BM25”、`query` 与 `limit` 两个参数、来源清单渲染与 512 KiB 来源描述预算，main `7c1b64c5df07`）',
      url: 'https://github.com/openai/codex/blob/7c1b64c5df07ae124c70a9a0094811cd3e23fcb5/codex-rs/core/src/tools/handlers/tool_search_spec.rs',
    },
    'codex-tool-search-handler': {
      label:
        'Codex `tool_search` 处理器源码（`limit` 缺省取 `TOOL_SEARCH_DEFAULT_LIMIT`、空 query 报 “query must not be empty”、`limit` 为 0 报 “limit must be greater than zero”、code mode 分支与 `{"tools": [...]}` 结果形状）',
      url: 'https://github.com/openai/codex/blob/7c1b64c5df07ae124c70a9a0094811cd3e23fcb5/codex-rs/core/src/tools/handlers/tool_search.rs',
    },
    'codex-tool-search-discovery': {
      label:
        'Codex 工具发现常量与可发现项源码（`TOOL_SEARCH_TOOL_NAME = "tool_search"`、`TOOL_SEARCH_DEFAULT_LIMIT = 8`、`list_available_plugins_to_install` 与 `request_plugin_install` 两个发现工具名、Connector 与 Plugin 两类 `DiscoverableTool`）',
      url: 'https://github.com/openai/codex/blob/7c1b64c5df07ae124c70a9a0094811cd3e23fcb5/codex-rs/tools/src/tool_discovery.rs',
    },
    'codex-tool-search-features': {
      label:
        'Codex 特性开关源码（`tool_search` 与 `tool_search_always_defer_mcp_tools` 均为 `Stage::Removed` 且注释写明工具搜索始终启用、MCP 工具始终延迟，`code_mode_tool_search` 与 `deferred_tool_world_state` 为 `Stage::UnderDevelopment` 且默认关闭，旧配置解析对这两个键直接跳过）',
      url: 'https://github.com/openai/codex/blob/7c1b64c5df07ae124c70a9a0094811cd3e23fcb5/codex-rs/features/src/lib.rs',
    },
    'codex-tool-search-schema': {
      label:
        'Codex `config.schema.json`（`features.tool_search`、`features.tool_search_always_defer_mcp_tools` 与 `features.code_mode_tool_search` 三个 boolean，顶层与 `ConfigProfile` 各一份）',
      url: 'https://github.com/openai/codex/blob/7c1b64c5df07ae124c70a9a0094811cd3e23fcb5/codex-rs/core/config.schema.json',
    },
    'qwen-tool-search-settings': {
      label:
        'Qwen Code v0.25.1 设置参考（`tools.toolSearch.enabled` 默认 `true`、`tools.toolSearch.threshold` 默认 `0`、`tools.eager`、`tools.visible`、`tools.disabled`、`tools.discoveryCommand`、`tools.core` 迁移说明与 `permissions.allow` 行，标签 `v0.25.1`，提交 `c1a8218f3820`）',
      url: 'https://github.com/QwenLM/qwen-code/blob/c1a8218f38203e272e6e965778ed6a2795cfeed7/docs/users/configuration/settings.md',
    },
    'qwen-tool-search-context-cost': {
      label:
        'Qwen Code v0.25.1 上下文成本文档（`tool_search` → `tool_call` 桥、豁免工具清单、桥缺一半时的回退、Agent 与 Goal 默认延迟、Subagent 不走 ToolSearch、恢复会话与工具集刷新会重新声明）',
      url: 'https://github.com/QwenLM/qwen-code/blob/c1a8218f38203e272e6e965778ed6a2795cfeed7/docs/users/features/context-cost.md',
    },
    'qwen-tool-search-source': {
      label:
        'Qwen Code v0.25.1 `tool_search` 源码（`DEFAULT_MAX_RESULTS = 5`、`HARD_MAX_RESULTS = 20`、名字精确命中内置 10 与 MCP 12、子串 5 与 6、`searchHint` 4、动作别名 6、描述 2、停用词表、`select:` 与 `+` 前缀两种查询模式、Code Mode 专用描述）',
      url: 'https://github.com/QwenLM/qwen-code/blob/c1a8218f38203e272e6e965778ed6a2795cfeed7/packages/core/src/tools/tool-search.ts',
    },
    'qwen-tool-names-v0251': {
      label:
        'Qwen Code v0.25.1 工具名与显示名映射源码（`tool_search` → `ToolSearch`、`tool_call` → `ToolCall`、`agent`、`list_agents`、`get_goal`、`update_goal`、`propose_goal`）',
      url: 'https://github.com/QwenLM/qwen-code/blob/c1a8218f38203e272e6e965778ed6a2795cfeed7/packages/core/src/tools/tool-names.ts',
    },
    'qwen-deferred-coordination-design': {
      label:
        'Qwen Code v0.25.1 设计文档 `default-deferred-coordination.md`（把 `agent`、`list_agents`、`get_goal`、`update_goal`、`propose_goal` 标为原生延迟，不新增设置、不改 schema、不改执行与审批语义）',
      url: 'https://github.com/QwenLM/qwen-code/blob/c1a8218f38203e272e6e965778ed6a2795cfeed7/docs/design/default-deferred-coordination.md',
    },
    'qwen-deferred-coordination-pr': {
      label:
        'Qwen Code PR #13033（feat(core): defer agent and goal declarations by default，2026-10-06T04:13:29Z 合入 main，合并提交 `8e3f3923b8c8`）',
      url: 'https://github.com/QwenLM/qwen-code/pull/13033',
    },
    'qwen-v0251-release': {
      label:
        'Qwen Code v0.25.1 发布说明（2026-10-11，Features 段逐字为 “Agent and Goal coordination tools are now deferred by default and discovered on demand, reducing unnecessary tool declarations in ordinary tool-call sessions.”）',
      url: 'https://github.com/QwenLM/qwen-code/releases/tag/v0.25.1',
    },
    'qwen-cron-defer-source': {
      label:
        'Qwen Code v0.25.1 `cron_create` 工具源码（构造参数里的 `shouldDefer` 为 `true`、注释 “scheduling is infrequent”、`alwaysLoad` 为 `false`、搜索提示词 `cron schedule reminder recurring timer`）',
      url: 'https://github.com/QwenLM/qwen-code/blob/c1a8218f38203e272e6e965778ed6a2795cfeed7/packages/core/src/tools/cron-create.ts',
    },
    'kimi-mcp-deferred': {
      label:
        'Kimi Code MCP 文档「按需加载工具」段与 Server `deferred` 字段（main `f28c51c01f02`，两个前提、`select_tools` 加载、未设 `deferred` 的 server 取全局默认值、`[mcp] default_deferred` 全局默认与 `deferred: false` 逐 server 排除、值在 server 连接时固化、OAuth 认证工具同样遵循该字段）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/f28c51c01f025bba9f0d0f58f6309e7517a8cd02/docs/zh/customization/mcp.md',
    },
    'kimi-env-tool-select': {
      label:
        'Kimi Code 环境变量文档（`KIMI_CODE_EXPERIMENTAL_TOOL_SELECT` 与总开关 `KIMI_CODE_EXPERIMENTAL_FLAG` 的取值，main `cbd754049a11`）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/cbd754049a114ee36d1b27675c82819e4963c692/docs/zh/configuration/env-vars.md',
    },
    'kimi-config-capabilities': {
      label:
        'Kimi Code 配置文档（`[mcp]` 节的 `startup_timeout_ms`、`tool_timeout_ms` 与 `default_deferred` 三行字段表，`default_deferred` 默认 `false` 且「`mcp.json` 中单个 server 的 `deferred` 字段优先于本节」；`capabilities` 可追加 `dynamically_loaded_tools` 且只能追加不能移除；`## experimental` 整段仍被包在 HTML 注释里、站点不渲染，注释内也只列 `micro_compaction`，main `f28c51c01f02`）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/f28c51c01f025bba9f0d0f58f6309e7517a8cd02/docs/zh/configuration/config-files.md',
    },
    'kimi-select-tools-source': {
      label:
        'Kimi Code `select_tools` 工具源码（描述新增 “If you have not seen a <tools_added> announcement in this session, no tools are currently loadable — do not call select_tools.”、六类命中各自的返回文案、`isError` 条件为 `toLoad.length === 0 && alreadyAvailable.length === 0 && alreadyCallable.length === 0`、`approvalRule` 为工具自身、模型不支持时返回 “select_tools is not available for the current model.”，main `f28c51c01f02`）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/f28c51c01f025bba9f0d0f58f6309e7517a8cd02/packages/agent-core-v2/src/agent/tools/select-tools/selectToolsTool.ts',
    },
    'kimi-select-tools-schema': {
      label:
        'Kimi Code `select_tools` 入参 schema 源码（`names` 为字符串数组、`min(1)`、描述 “Exact tool names to load, taken from the latest announced tool list.”、`strict()`，main `f28c51c01f02`）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/f28c51c01f025bba9f0d0f58f6309e7517a8cd02/packages/agent-core-v2/src/agent/tools/select-tools/select-tools.ts',
    },
    'kimi-default-deferred-commit': {
      label:
        'Kimi Code PR #4210 提交 `f28c51c01f025bba9f0d0f58f6309e7517a8cd02`（2026-10-14T09:19:29Z，`feat(agent-core-v2): add global default for deferred MCP tool disclosure`；changeset 逐字为 “Add the [mcp] default_deferred config key: when the experimental tool-select flag is on, set default_deferred = true in config.toml to load every MCP server\'s tools on demand by default; a server can opt out with deferred: false.”，并把 Server `deferred` 字段说明由 “Defaults to `false` (always exposed inline).” 改为 “Defaults to the global `default_deferred` value (`false` when unset).”）',
      url: 'https://github.com/MoonshotAI/kimi-code/commit/f28c51c01f025bba9f0d0f58f6309e7517a8cd02',
    },
    'kimi-mcp-connection-manager': {
      label:
        'Kimi Code MCP 连接管理器源码（`McpDefaults` 接口含 `defaultDeferred`、`resolveDeferred` 为 `config.deferred ?? this.options.resolveDefaults?.().defaultDeferred ?? false`、`entry.deferred` 在 `connect`/`connectAllNow` 建条目时赋值并在 `connectOne` 开头重算、`deferredOf(name)` 回落到 `false`，main `f28c51c01f02`）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/f28c51c01f025bba9f0d0f58f6309e7517a8cd02/packages/agent-core-v2/src/mcpCore/connection-manager.ts',
    },
    'kimi-mcp-config-section': {
      label:
        'Kimi Code `[mcp]` 配置节 schema 源码（`MCP_SECTION = \'mcp\'`、`McpSectionSchema` 只有 `startupTimeoutMs`、`toolTimeoutMs`、`defaultDeferred` 三个可选键，环境变量绑定只导出 `MCP_STARTUP_TIMEOUT_ENV` 与 `MCP_TOOL_TIMEOUT_ENV`，没有 `defaultDeferred` 的环境变量覆盖，main `f28c51c01f02`）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/f28c51c01f025bba9f0d0f58f6309e7517a8cd02/packages/agent-core-v2/src/app/mcpConfig/configSection.ts',
    },
    'kimi-workspace-mcp-tunables': {
      label:
        'Kimi Code 工作区 MCP 可调项源码（`McpTunables` 含 `defaultDeferred`，`tunables()` 从配置服务的 `mcp` 节读 `section?.defaultDeferred` 后交给连接管理器的 `resolveDefaults`；`mergedConnectionView.deferredOf(name)` 转发给拥有该 server 的 base 或 overlay 管理器，main `f28c51c01f02`）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/f28c51c01f025bba9f0d0f58f6309e7517a8cd02/packages/agent-core-v2/src/workspace/workspaceMcpConfig/workspaceMcpConfigService.ts',
    },
    'kimi-select-tools-service': {
      label:
        'Kimi Code `select_tools` 服务源码（`STOP_RETRY_THRESHOLD = 2`、`failedSelectionAttempts` 按名字小写计数、`consecutiveFailures >= 3` 触发警告、名字分类顺序为 policyDenied → alreadyAvailable/toLoad → alreadyCallable → staleLoaded → unknown、`resetFailuresIfToolsChanged` 按策略指纹加排序后的注册表 `[name, source, disclosure]` 判定环境变化后清空两个计数、建议候选 `.slice(0, 3)`，main `f28c51c01f02`）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/f28c51c01f025bba9f0d0f58f6309e7517a8cd02/packages/agent-core-v2/src/agent/toolSelect/toolSelectService.ts',
    },
    'kimi-select-tools-failure-commit': {
      label:
        'Kimi Code PR #4190 提交 `e4c99a3bad19b00bd1939b1cf254f427b50061f0`（2026-10-13T11:39:31Z，`feat(agent-core-v2): distinguish session-unavailable tools and explain select_tools failures`；changeset 逐字为 “Clarify unavailable tools, announce when no tools can be loaded, and discourage repeated failed tool selections.”，提交说明另记「成功的名字只重置连续失败计数并清掉自己的失败记录，同批失败的名字继续累计次数而不被兄弟成功项掩盖」与「按注册工具的真实来源评估 deny glob，只有未注册的名字才回落到 `mcp__` 前缀推断」）',
      url: 'https://github.com/MoonshotAI/kimi-code/commit/e4c99a3bad19b00bd1939b1cf254f427b50061f0',
    },
    'kimi-dynamic-tools-announcement': {
      label:
        'Kimi Code 动态工具公告源码（`<tools_added>`/`<tools_removed>` 块的拼装与解析正则，以及 `hasLoadableTools` 为 `false`（默认 `true`）时发出的空可加载集公告 “No tools are currently available for dynamic loading in this session. Do not call select_tools or guess tool names; use the tools you already have. Only a later <tools_added> announcement can make new tools loadable.”，main `f28c51c01f02`）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/f28c51c01f025bba9f0d0f58f6309e7517a8cd02/packages/agent-core-v2/src/agent/toolSelect/dynamicTools.ts',
    },
    'qoder-settings-reference-lazy-load': {
      label:
        'Qoder CLI 设置参考（`mcp` 分组的 `mcp.lazyLoad`：boolean、默认 `false`、Restart 列标注 “Yes”、描述逐字为 “Lazy load MCP tools (exposes Meta Tool).”）',
      url: 'https://docs.qoder.com/cli/settings-reference',
    },
    'qoder-mcp-reference-lazy-load': {
      label:
        'Qoder CLI MCP reference（“Lazy Loading Mode” 段：默认在启动注册全部 MCP 工具 schema，`mcp.lazyLoad: true` 或 `QODER_MCP_LAZY=1` 开启后只暴露 `mcp_list`／`mcp_get`／`mcp_call` 三个 Meta Tools 并按需加载实际工具；Permissions and Security 段写明 MCP 工具与内置工具一样需要用户确认）',
      url: 'https://docs.qoder.com/cli/mcp-reference',
    },
    'claude-read-large-files': {
      label:
        'Claude Code 工具参考 “Read tool behavior” 与 “Large files” 段（默认单次读取至多 25,000 token 或 `CLAUDE_CODE_FILE_READ_MAX_OUTPUT_TOKENS` 的值、整文件超过 256 KB 直接拒绝、v2.1.296 起可传 `allow_large: true` 一次读完整文件或长行范围并按会话剩余上下文窗口计量、图片与 PDF 与 Notebook 保留各自上限、两类超限结果分别是首页加 `PARTIAL view` 提示与要求改用 `offset`/`limit` 或 Grep 的错误）',
      url: 'https://code.claude.com/docs/en/tools-reference#large-files',
    },
    'claude-read-limit-changelog': {
      label:
        'Claude Code 更新日志（固定到 v2.1.296，逐字为 “Added an `allow_large` option to the Read tool so Claude can read a text file past the usual size limits in one call when it needs the whole file and the context has room”；核对日期最新条目仍是 v2.1.296）',
      url: 'https://github.com/anthropics/claude-code/blob/2301018b1f61073c501a8e7a4813ef48c239163b/CHANGELOG.md',
    },
    'codex-tool-handlers': {
      label:
        'Codex 工具 handler 目录清单（main `f82e36592278`：`apply_patch`、`current_time`、`get_context_remaining`、`list_available_plugins_to_install`、`mcp`、`mcp_resource`、`multi_agents`、`new_context_window`、`plan`、`request_permissions`、`request_plugin_install`、`request_user_input`、`send_message_to_user_async`、`shell`、`sleep`、`test_sync`、`tool_search`、`unified_exec`、`view_image`、`wait_for_environment`，没有任何文本文件读取工具）',
      url: 'https://github.com/openai/codex/tree/f82e36592278a0a782fb0d0fc97e5fa10e832ac2/codex-rs/core/src/tools/handlers',
    },
    'codex-shell-max-output-tokens': {
      label:
        'Codex `exec_command` 与 `write_stdin` 工具声明源码（源码文件是 `shell_spec.rs`，两份声明都插入 `max_output_tokens`，参数描述逐字为 “Output token budget. Defaults to 10000 tokens; larger requests may be capped by policy.”；`registry.rs` 另按 `"exec_command" | "shell_command"` 匹配同类调用，main `f82e36592278`）',
      url: 'https://github.com/openai/codex/blob/f82e36592278a0a782fb0d0fc97e5fa10e832ac2/codex-rs/core/src/tools/handlers/shell_spec.rs',
    },
    'codex-exec-output-cap': {
      label:
        'Codex exec 输出保留上限源码（`const EXEC_OUTPUT_MAX_BYTES: usize = DEFAULT_OUTPUT_BYTES_CAP;` 与注释 “Hard cap on bytes retained from exec stdout/stderr/aggregated output.”、只有 `ExecCapturePolicy::ShellTool` 返回该上限、超限时对 stdout 与 stderr 各自 `truncate(max_bytes)` 因而保留开头丢弃结尾、`truncated_after_lines` 为 `None`、`MAX_EXEC_OUTPUT_DELTAS_PER_CALL = 10_000` 只限制实时事件流而聚合仍收集完整输出，main `f82e36592278`）',
      url: 'https://github.com/openai/codex/blob/f82e36592278a0a782fb0d0fc97e5fa10e832ac2/codex-rs/core/src/exec.rs',
    },
    'codex-pty-output-cap': {
      label:
        'Codex PTY 工具库源码（`pub const DEFAULT_OUTPUT_BYTES_CAP: usize = 1024 * 1024;`，即 1 MiB，main `f82e36592278`）',
      url: 'https://github.com/openai/codex/blob/f82e36592278a0a782fb0d0fc97e5fa10e832ac2/codex-rs/utils/pty/src/lib.rs',
    },
    'codex-view-image-spec': {
      label:
        'Codex `view_image` 工具声明源码（描述逐字为 “View a local image file from the filesystem when visual inspection is needed. Use this for images already available on disk.”，`path` 必填、`detail` 只在 `can_request_original_image_detail` 且未启用 `unified_image_budget` 时出现且取 `high` 或 `original`，没有声明字节或像素上限，main `f82e36592278`）',
      url: 'https://github.com/openai/codex/blob/f82e36592278a0a782fb0d0fc97e5fa10e832ac2/codex-rs/core/src/tools/handlers/view_image_spec.rs',
    },
    'qwen-read-file-source': {
      label:
        'Qwen Code v0.25.1 `read_file` 工具源码（`override get maxOutputChars()` 返回 `Number.POSITIVE_INFINITY`，注释逐字为 “Self-managed: ReadFile controls its own size via line-based paging (offset/limit, default truncateToolOutputLines setting), so it is exempt from the scheduler’s char-based truncation. Oversized reads are bounded by the per-message batch budget instead.”；四个参数 `file_path`/`offset`/`limit`/`pages` 的描述逐字，`limit` 写明 “If omitted, reads the entire file (if feasible, up to a default limit)”；截断时给模型的内容加前缀 `Showing lines <start>-<end> of <total> total lines.`，行数不精确时 total 写作 `at least <n>`）',
      url: 'https://github.com/QwenLM/qwen-code/blob/c1a8218f38203e272e6e965778ed6a2795cfeed7/packages/core/src/tools/read-file.ts',
    },
    'qwen-truncate-settings': {
      label:
        'Qwen Code v0.25.1 设置参考（`tools.truncateToolOutputThreshold`：number、默认 `25000`、描述 “Truncate tool output if it is larger than this many characters. Applies to Shell, Grep, Glob, ReadFile and ReadManyFiles tools.”、Requires restart: Yes；`tools.truncateToolOutputLines`：number、默认 `1000`、描述 “Maximum lines or entries kept when truncating tool output. Applies to Shell, Grep, Glob, ReadFile and ReadManyFiles tools.”、Requires restart: Yes；`tools.toolOutputBatchBudget` 在该页没有任何行）',
      url: 'https://github.com/QwenLM/qwen-code/blob/c1a8218f38203e272e6e965778ed6a2795cfeed7/docs/users/configuration/settings.md',
    },
    'qwen-truncate-schema': {
      label:
        'Qwen Code v0.25.1 设置 schema 源码（`truncateToolOutputThreshold` 默认 `DEFAULT_TRUNCATE_TOOL_OUTPUT_THRESHOLD`、描述含 “Set to -1 to disable.”；`truncateToolOutputLines` 默认 `DEFAULT_TRUNCATE_TOOL_OUTPUT_LINES`、描述 “The number of lines to keep when truncating tool output.”；`toolOutputBatchBudget` 默认 `DEFAULT_TOOL_OUTPUT_BATCH_BUDGET`、描述 “Per-message character budget for the combined text output of one batch of tool calls. Oversized batches are reduced deterministically and recoverable output is persisted when possible. Set to -1 to disable.”；三者 `requiresRestart: true`）',
      url: 'https://github.com/QwenLM/qwen-code/blob/c1a8218f38203e272e6e965778ed6a2795cfeed7/packages/cli/src/config/settingsSchema.ts',
    },
    'qwen-truncate-config': {
      label:
        'Qwen Code v0.25.1 核心配置源码（`export const DEFAULT_TRUNCATE_TOOL_OUTPUT_THRESHOLD = 25_000;`、`export const DEFAULT_TRUNCATE_TOOL_OUTPUT_LINES = 1000;`、`export const DEFAULT_TOOL_OUTPUT_BATCH_BUDGET = 200_000;`，`getTruncateToolOutputThreshold()` 与 `getTruncateToolOutputLines()` 在配置值 `<= 0` 时返回 `Number.POSITIVE_INFINITY`）',
      url: 'https://github.com/QwenLM/qwen-code/blob/c1a8218f38203e272e6e965778ed6a2795cfeed7/packages/core/src/config/config.ts',
    },
    'qwen-file-utils-truncation': {
      label:
        'Qwen Code v0.25.1 `processSingleFileContent` 源码（默认分页上限取 `config.getTruncateToolOutputLines()`、字符上限取 `config.getTruncateToolOutputThreshold()`、超出的那一行被截到剩余额度并追加 `... [truncated]`、`isTruncated` 与 `linesShown` 一起回填、界面显示为 `Read lines <start>-<end> of <total> from <path>` 并在字符截断时追加 ` (truncated)`）',
      url: 'https://github.com/QwenLM/qwen-code/blob/c1a8218f38203e272e6e965778ed6a2795cfeed7/packages/core/src/utils/fileUtils.ts',
    },
    'qwen-read-many-files-source': {
      label:
        'Qwen Code v0.25.1 `readManyFiles` 源码注释（`@` 提及不传显式 `offset`/`limit`/`pages`，但 `processSingleFileContent` 会把 `config.getTruncateToolOutputLines()` 当默认上限，因此大附件同样可能被截断；与 `read-file.ts` 保持一致以便 Edit/Write 的写前读判定相同）',
      url: 'https://github.com/QwenLM/qwen-code/blob/c1a8218f38203e272e6e965778ed6a2795cfeed7/packages/core/src/tools/readManyFiles.ts',
    },
    'qwen-tool-output-offload-design': {
      label:
        'Qwen Code v0.25.1 官方设计说明 `docs/design/2026-08-10-tool-output-offload-preview.md`（分层预算表：持久化闸门为配置阈值加 3k 余量即默认 28k 且按名豁免 `exec`、`read_file`、`read_mcp_resource`、`enter_plan_mode`，每工具预算为 shell 30k、grep 20k、mcp 500k、agent 32k 尾部、web-search 102k、read-file 自管，全局 25k 字符加 1000 行，合并 pass 为适用预算的 2 倍，每条消息 200k 字符，落盘为单文件 50MB、单会话 500MB；超限输出写进会话临时目录的 `tool-results/<callId>.txt`（mode 0o600）并在历史里留预览加指针，模型可用 `read_file` 取回；截断保留头尾 `keep: both`；每工具预算只按字符，声明了它的工具会关掉全局行数上限以免自管分页被暗中削掉）',
      url: 'https://github.com/QwenLM/qwen-code/blob/c1a8218f38203e272e6e965778ed6a2795cfeed7/docs/design/2026-08-10-tool-output-offload-preview.md',
    },
    'kimi-read-tools-211': {
      label:
        'Kimi Code 2.1.1 中文工具文档（`Read` 段：参数 `path`、`line_offset`（负数从末尾倒数）、`column_offset`、`n_lines`、`max_chars`，默认上限 100,000 字符、单次调用可申请到 500,000 字符、两个值都可通过 `read` 配置修改，字符数按显示文本的 JavaScript 字符串长度计算；“`Read` 优先返回完整行，结果不会再被通用工具输出限制缩短”，单行放不下时返回片段并在状态里给出列范围与 `Next Read` 参数，非法列偏移明确报错，尾读优先返回较新的完整行且 `column_offset` 不能与负数 `line_offset` 同用，10 MiB 以内的 UTF-16 LE/BE 先严格解码、失败后有损替换并逐页告警且告警计入额度；同页 `Write` 与 `Edit` 段已记录写前读与磁盘变化拒绝）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/%40moonshot-ai/kimi-code%402.1.1/docs/zh/reference/tools.md',
    },
    'kimi-read-config-211': {
      label:
        'Kimi Code 2.1.1 中文配置文档 `## read` 段（`read` 控制 `Read` 工具的字符额度、包含文件正文与行号与状态信息、不额外叠加行数或 UTF-8 字节数上限；`default_max_chars` integer 默认 `100000`、`max_chars` integer 默认 `500000`；两个值都必须是正整数，调用中的 `max_chars` 覆盖默认值但不超过配置的最大值，结果会说明实际生效的额度，配置的默认值超过最大值时默认读取也按最大值执行）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/%40moonshot-ai/kimi-code%402.1.1/docs/zh/configuration/config-files.md',
    },
    'kimi-read-tools-038': {
      label:
        'Kimi Code 0.38.0 中文工具文档（`Read` 段旧记法逐字为 “单次最多返回 1000 行或 100 KB，超出部分会附带截断提示”，参数只有 `path`、`line_offset` 与 `n_lines`；本仓库此前据此记录，2.1.1 起已被字符额度记法取代）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/%40moonshot-ai/kimi-code%400.38.0/docs/zh/reference/tools.md',
    },
    'qoder-tools-read-context': {
      label:
        'Qoder CLI Tools 页 “Read Project Context” 表（三行逐字为 “View files | Read source files, documentation, configuration, and other text assets.”、“Read large files | Read a focused section when the whole file is too large.”、“Read document-like assets | Inspect supported document formats, such as PDFs, when available.”；“Edit Files” 表另有 “Edit notebooks | Modify notebook content when notebook support is available.”；全页没有给出任何行数、字节或字符上限，也没有一次读完整文件的入口）',
      url: 'https://docs.qoder.com/cli/tools',
    },
    'kimi-guard-widen-commit': {
      label:
        'Kimi Code 提交 6e7cc909da90（PR #4250 “feat(agent-core-v2): let dangerous_command_guard=false disable all built-in guard ask policies”，2026-10-16T05:23:18Z 合入 main，只改 6 个文件：新增 changeset、中英文 `docs/*/configuration/config-files.md` 各改一段、`sensitive-file-access-ask.ts` 与 `git-control-path-access-ask.ts` 各注入 `IConfigService` 并在 `evaluate` 首行加 `if (!isDangerousCommandGuardEnabled(this.config)) return undefined;`、测试用例由 “does not load the dangerous command policy when disabled by config” 改名为 “does not load the built-in guard policies when disabled by config” 并补 `Read /workspace/.env`、`Write .git/config`、`Read /workspace/.git/config` 三条断言）',
      url: 'https://github.com/MoonshotAI/kimi-code/commit/6e7cc909da9084a424f822dd5a9aae5b98070b73',
    },
    'kimi-guard-config-docs': {
      label:
        'Kimi Code 配置文档 `## permission` 段（提交 6e7cc909da90），逐字为 “也可以在 `[permission]` 下设置 `dangerous_command_guard = false` 完全关闭所有内置 guard 确认策略：危险命令、敏感文件（如 `.env`、`id_rsa`）访问、git 控制路径访问在 "Always Ask" 和 "Ask When Needed" 模式下不再触发审批（"Never Ask" 模式本就不启用这些策略），默认 `true`。环境变量 `KIMI_CODE_DANGEROUS_COMMAND_GUARD=false` 会覆盖文件设置。全部内置 guard 关闭后，"Ask When Needed" 模式下只有你自己配置的 `ask` 规则仍会要求确认；"Always Ask" 模式下未被自动放行的工具照旧逐个询问。`Read`/`Write`/`Edit` 对秘密文件的硬阻断保持不变。此开关只适用于已经在 Agent 之外统一命令限权的环境。”；同段之前的正文写 `permission` 规则用 `[[permission.rules]]` 数组表写出、按顺序匹配、第一条命中即生效',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/6e7cc909da9084a424f822dd5a9aae5b98070b73/docs/zh/configuration/config-files.md',
    },
    'kimi-guard-config-docs-en': {
      label:
        'Kimi Code 英文配置文档同段（提交 6e7cc909da90），逐字含 “turn off every built-in guard confirmation policy entirely: dangerous commands, access to sensitive files such as `.env` or `id_rsa`, and access to git control paths”、“With all built-in guards off, only `ask` rules you configured yourself can still prompt in Ask When Needed mode; in Always Ask mode, tools that are not auto-approved continue to prompt as before.”、“The hard block that stops `Read`/`Write`/`Edit` from touching secret files stays in effect.” 与 “Use this switch only for environments that already gate commands outside the agent.”',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/6e7cc909da9084a424f822dd5a9aae5b98070b73/docs/en/configuration/config-files.md',
    },
    'kimi-guard-config-docs-220': {
      label:
        'Kimi Code 2.2.0 tag（提交 472192c34c1e）配置文档同段的旧写法，逐字为 “也可以在 `[permission]` 下设置 `dangerous_command_guard = false` 完全关闭内置危险命令策略（"Always Ask" 和 "Ask When Needed" 模式下不再触发危险命令审批；"Never Ask" 模式本就不启用该策略），默认 `true`。环境变量 `KIMI_CODE_DANGEROUS_COMMAND_GUARD=false` 会覆盖文件设置并恢复策略引入前的行为。此开关只适用于已经在 Agent 之外统一命令限权的环境。”，即发布版只关危险命令一项；2.0.0、2.0.1、2.0.2、2.1.0、2.1.1 各 tag 的同一文件也都已含该键',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/472192c34c1efad89a369870eff0da0b708ce9bb/docs/zh/configuration/config-files.md',
    },
    'kimi-no-os-sandbox-230': {
      label:
        'Kimi Code 2.3.0 标签提交 `b5e28fd6beac752a2cdcc0ff2f5fdf40e6494fbb` 的整棵仓库树里没有任何路径含 sandbox、bwrap、bubblewrap、landlock、seccomp 或 seatbelt 字样；该标签的 `docs/zh/configuration/config-files.md`、`docs/zh/reference/tools.md` 与 `docs/zh/configuration/env-vars.md` 三份文件也都没有这些词。文件边界仍由 `[permission]` 规则与工具层策略提供：`packages/agent-core-v2/src/agent/permissionPolicy/policies/` 目录下的文件为 `auto-mode-approve.ts`、`auto-mode-ask-user-question-deny.ts`、`dangerous-command-ask.ts`、`default-tool-approve.ts`、`fallback-ask.ts`、`git-control-path-access-ask.ts`、`git-cwd-write-approve.ts`、`path-utils.ts`、`sensitive-file-access-ask.ts`、`session-approval-history.ts`、`user-configured-allow.ts`、`user-configured-ask.ts`、`user-configured-deny.ts`、`user-configured-rule.ts` 与 `yolo-mode-approve.ts`，路径判定在 `packages/agent-core-v2/src/tool/path-access.ts`，即这些都是权限规则层而不是 OS 或容器隔离层',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/b5e28fd6beac752a2cdcc0ff2f5fdf40e6494fbb/docs/zh/configuration/config-files.md',
    },
    'kimi-guard-changeset': {
      label:
        'Kimi Code changeset `.changeset/dangerous-guard-off-allow-all.md`（提交 6e7cc909da90 新增），标 `"@moonshot-ai/kimi-code": patch`，正文逐字为 “Setting `[permission] dangerous_command_guard = false` now turns off every built-in confirmation guard — dangerous commands, sensitive-file access, and git control-path access — instead of only the dangerous-command guard.”',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/6e7cc909da9084a424f822dd5a9aae5b98070b73/.changeset/dangerous-guard-off-allow-all.md',
    },
    'kimi-guard-config-section': {
      label:
        'Kimi Code `permissionRules/configSection.ts` 源码（提交 6e7cc909da90）：`PermissionConfigSchema` 只有 `rules` 与 `dangerousCommandGuard: z.boolean().optional()` 两个键，`DANGEROUS_COMMAND_GUARD_ENV = \'KIMI_CODE_DANGEROUS_COMMAND_GUARD\'`，`parseDangerousCommandGuardEnv` 只把字面 `true`/`false` 解析成布尔、其他取值返回 `undefined`，`isDangerousCommandGuardEnabled(config)` 逐字为 `config.get(PERMISSION_SECTION)?.dangerousCommandGuard ?? true`（源码里 `config.get` 带 `PermissionConfig` 或 `undefined` 的泛型参数）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/6e7cc909da9084a424f822dd5a9aae5b98070b73/packages/agent-core-v2/src/agent/permissionRules/configSection.ts',
    },
    'kimi-guard-policy-chain': {
      label:
        'Kimi Code `permissionPolicyService.ts` 源码（提交 6e7cc909da90）：`this.policies` 数组按固定顺序放 13 条策略——`auto-mode-ask-user-question-deny`、`user-configured-deny`、`dangerous-command-ask`（外面包 `...(bootstrap.args.nonInteractive ? [] : [...])`，非交互宿主整条不入链）、`auto-mode-approve`、`session-approval-history`、`user-configured-ask`、`user-configured-allow`、`sensitive-file-access-ask`、`git-control-path-access-ask`、`yolo-mode-approve`、`default-tool-approve`、`git-cwd-write-approve`、`fallback-ask`；`evaluate` 顺序遍历并 `if (result !== undefined) return { policyName: policy.name, result }`，即第一条命中即定案',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/6e7cc909da9084a424f822dd5a9aae5b98070b73/packages/agent-core-v2/src/agent/permissionPolicy/permissionPolicyService.ts',
    },
    'kimi-guard-dangerous-command': {
      label:
        'Kimi Code `dangerous-command-ask.ts` 源码（提交 6e7cc909da90）：`evaluate` 依次早退于 guard 关闭、`modeService.mode === \'auto\'`、`toolCall.name !== \'Bash\'`；用 `PARSE_OPTIONS = { timeoutMs: 500, maxNodes: 10_000 }` 解析命令，危险时返回 `{ kind: \'ask\', reason: { dangerous_command: verdict.command } }`，unanalyzable 时在 `yolo` 下返回 `undefined`、否则返回 `{ kind: \'ask\', reason: { unanalyzable_command: true } }`；`SIMPLE_DANGEROUS_COMMANDS` 为 shutdown/halt/poweroff/reboot/bcdedit/diskpart/format/restart-computer/stop-computer/mkfs/wipefs 且另判 `name.startsWith(\'mkfs.\')`，`init`/`telinit` 带操作数 `0` 或 `6`，`systemctl` 子命令 poweroff/reboot/halt/kexec，`dd` 的 `of=` 目标以 `/dev/` 开头且不在 8 个安全设备内，`rm` 同时带递归与强制标志（全部操作数为 `/tmp`、`/temp` 或其下且不含 `..` 段时放行）；剥壳 `sudo`/`doas`、`env`/`command`/`exec`/`nohup`/`builtin`/`nice`、`busybox <applet>`，`sh`/`bash`/`dash`/`zsh`/`ksh`/`ash` 的 `-c` 载荷与 `eval` 参数递归解析至 `MAX_NESTED_SHELL_DEPTH = 4`，超层即判 unanalyzable；命令名先去目录、转小写、去 `.exe` 后缀再比对；操作数含美元符、反引号、星号、问号、方括号或波浪号（源码常量 `UNSAFE_OPERAND`）、解析失败、解析超时或结果 `hasError` 都判 unanalyzable',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/6e7cc909da9084a424f822dd5a9aae5b98070b73/packages/agent-core-v2/src/agent/permissionPolicy/policies/dangerous-command-ask.ts',
    },
    'kimi-guard-sensitive-file': {
      label:
        'Kimi Code `sensitive-file-access-ask.ts` 源码（提交 6e7cc909da90）：`evaluate` 先判 guard 开关，再 `fileAccesses(context).find((fileAccess) => isSensitiveFile(fileAccess.path))`，命中即返回不带 reason 的 `{ kind: \'ask\' }`；`fileAccesses` 取 `context.execution.accesses` 中 `kind === \'file\'` 的项且不过滤 operation，读写都算',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/6e7cc909da9084a424f822dd5a9aae5b98070b73/packages/agent-core-v2/src/agent/permissionPolicy/policies/sensitive-file-access-ask.ts',
    },
    'kimi-guard-git-control-path': {
      label:
        'Kimi Code `git-control-path-access-ask.ts` 源码（提交 6e7cc909da90）：guard 开关早退后要求 `workspace.workDir` 非空，先对每个 file access 判 `hasGitPathComponent(path, cwd, pathClass)`（相对 cwd 的路径段里有小写 `.git`），命中即 `{ kind: \'ask\' }`；否则 `await this.git.findWorkTree(cwd)` 取 marker，为 `null` 直接放行，再判 `isGitControlPath`（路径落在 `marker.dotGitPath` 或 `marker.controlDirPath` 内），读写访问都覆盖',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/6e7cc909da9084a424f822dd5a9aae5b98070b73/packages/agent-core-v2/src/agent/permissionPolicy/policies/git-control-path-access-ask.ts',
    },
    'kimi-guard-path-access': {
      label:
        'Kimi Code `tool/path-access.ts` 源码（提交 6e7cc909da90）：`isSensitiveFile` 的 `SENSITIVE_BASENAMES` 为 `.env`、`id_rsa`、`id_ed25519`、`id_ecdsa`、`credentials`，`.env.` 前缀一律敏感但 `.env.example`/`.env.sample`/`.env.template` 豁免，`SENSITIVE_BASENAME_PREFIXES` 四个前缀后接 `-`/`_` 或接 `.` 加 `SENSITIVE_DOT_VARIANT_SUFFIXES`（.bak/.backup/.copy/.disabled/.key/.old/.orig/.pem/.save/.tmp）之一也算，公钥 `id_rsa.pub`/`id_ed25519.pub`/`id_ecdsa.pub` 豁免，`SENSITIVE_PATH_SUFFIXES` 为 `.aws/credentials` 与 `.gcp/credentials`，比较前统一小写；同文件的 `resolvePathAccess` 在 `policy.checkSensitive && isSensitiveFile(canonical)` 时抛 `PathSecurityError(\'PATH_SENSITIVE\', …)`，消息为 “matches a sensitive-file pattern (env / credential / SSH key). Access is blocked to protect secrets.”，`DEFAULT_WORKSPACE_ACCESS_POLICY.checkSensitive` 为 `true`',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/6e7cc909da9084a424f822dd5a9aae5b98070b73/packages/agent-core-v2/src/tool/path-access.ts',
    },
    'kimi-guard-default-tool-approve': {
      label:
        'Kimi Code `default-tool-approve.ts` 源码（提交 6e7cc909da90）：`DEFAULT_APPROVE_TOOLS` 列出 "Always Ask" 下仍自动放行的 24 个工具名——Read、Grep、Glob、ReadMediaFile、SetTodoList、TodoList、TaskList、TaskOutput、WaitFor、CronList、WebSearch、FetchURL、Agent、AgentSwarm、AskUserQuestion、NotifyUser、Skill、EnterPlanMode、ExitPlanMode、CreateGoal、GetGoal、SetGoalBudget、UpdateGoal、select_tools；链末的 `fallback-ask.ts` 无条件返回 `{ kind: \'ask\' }`',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/6e7cc909da9084a424f822dd5a9aae5b98070b73/packages/agent-core-v2/src/agent/permissionPolicy/policies/default-tool-approve.ts',
    },
    'kimi-guard-policy-test': {
      label:
        'Kimi Code `permissionPolicyService.test.ts`（提交 6e7cc909da90）用例名逐字含 “does not load the dangerous command policy for non-interactive hosts”（`nonInteractive: true` 时 `rm -rf /tmp/build` 由 `auto-mode-approve` 放行）、“does not load the built-in guard policies when disabled by config”（`dangerousCommandGuardEnabled = false` 且 `mode = \'yolo\'` 时 `shutdown -h now`、`Read /workspace/.env`、`Write .git/config`、`Read /workspace/.git/config` 四例都由 `yolo-mode-approve` 放行）、“does not let session approval history exempt dangerous commands”（`sessionApprovalRulePatterns` 含 `Bash(shutdown -h now)` 时仍由 `dangerous-command-ask` 询问）、“keeps deny rules above dangerous command ask”、“asks for git control files before git-cwd approval” 与 “asks for sensitive files before git-cwd approval”',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/6e7cc909da9084a424f822dd5a9aae5b98070b73/packages/agent-core-v2/test/agent/permissionPolicy/permissionPolicyService.test.ts',
    },
    'kimi-guard-introduce-commit': {
      label:
        'Kimi Code 提交 4b9888b73db5（PR #3290 “feat(agent-core-v2): require approval for dangerous bash commands in all permission modes”，2026-08-31T12:24:53Z），是 `dangerous-command-ask.ts` 与 `permissionRules/configSection.ts` 中 `dangerousCommandGuard` 键的首次出现；后续 565093f727ee（2026-09-10，PR #3714 放行只针对 `/tmp`、`/temp` 的 `rm -rf`）、b184b3149794（2026-09-04，PR #3529 在 auto 模式撤掉该 guard）与 86e08208e344（2026-09-17，PR #3869 在 yolo 模式放行 unanalyzable 命令）继续收窄其触发面',
      url: 'https://github.com/MoonshotAI/kimi-code/commit/4b9888b73db5937f86c65d1880c44f5326acd69d',
    },
    'kimi-guard-split-switch-pr': {
      label:
        'Kimi Code PR #4219 “feat(agent-core-v2): add config switches for file-access guards and skip directory search-root prompts”，2026-10-16T03:16:35Z 关闭且未合并；同日合入的 PR #4250 改为把三条 guard 统一挂到既有的 `dangerous_command_guard` 单开关上，没有新增 `sensitive_file_guard` 或 `git_control_path_guard` 之类的独立键',
      url: 'https://github.com/MoonshotAI/kimi-code/pull/4219',
    },
    'kimi-modes-interaction': {
      label:
        'Kimi Code 交互文档「三种权限模式」节（提交 6e7cc909da90）：“Always Ask”（始终询问，原 Manual）是默认模式、只读操作自动放行、其余逐一确认；“Ask When Needed”（必要时询问，原 YOLO）用 `/yolo` 开启、自动批准普通工具调用、访问 `.env` 与 SSH 私钥等敏感文件、执行 `shutdown`/`rm -rf` 这类危险命令或退出 Plan 模式仍会询问；“Never Ask”（完全自动，原 Auto）用 `/auto` 开启、所有工具审批自动处理且 Agent 不再提问，内置危险命令拦截只在前两种模式要求确认、在 “Never Ask” 下这些命令直接执行不再拦截；审批面板支持方向键加 `Enter` 或 `1`/`2`/`3` 数字键确认、`Esc`/`Ctrl-C`/`Ctrl-D` 拒绝、「Approve for this session」会话内放行同类调用',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/6e7cc909da9084a424f822dd5a9aae5b98070b73/docs/zh/guides/interaction.md',
    },
    'kimi-guard-cli-reference': {
      label:
        'Kimi Code CLI 参考（提交 6e7cc909da90）：`--prompt <prompt>`（`-p`）非交互执行单次 prompt 且不打开 TUI，`--yolo`（`-y`）以 "Ask When Needed" 启动、`--auto` 以 "Never Ask" 启动、`--plan` 以 Plan 模式启动；`--yolo` 与 `--auto` 互斥，`--prompt` 不能与 `--yolo`、`--auto` 或 `--plan` 同时使用因为“非交互模式固定使用 `auto` 权限”，`-r`/`--resume` 是 `--session` 的隐藏别名、`--yes` 与 `--auto-approve` 是 `--yolo` 的隐藏别名；正文写 “`-p` 模式不会请求人工审批，普通工具调用按 `auto` 权限策略处理，静态 deny 规则仍然生效”，且恢复会话时可用 `--auto`、`--yolo` 或 `--plan` 覆盖原会话保存的模式',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/6e7cc909da9084a424f822dd5a9aae5b98070b73/docs/zh/reference/kimi-command.md',
    },
    'kimi-guard-slash-commands': {
      label:
        'Kimi Code 斜杠命令表（提交 6e7cc909da90）：`/permission` 无别名、作用为“选择权限模式”；`/yolo` 别名 `/yes`，说明为“打开权限模式列表并预选 "Ask When Needed"，按 `Enter` 确认开启。该模式下常规修改和命令自动完成；高危操作、提问和计划仍会问你”；`/auto` 无别名，说明为“打开权限模式列表并预选 "Never Ask"，按 `Enter` 确认开启。该模式下完全不打断，所有操作和判断自动完成”；`/plan` 带可选的 `on` 或 `off` 参数，不带参数时翻转、显式传值时强制设置；表后另写“Plan 模式的退出审批不会被 `/yolo` 跳过”',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/6e7cc909da9084a424f822dd5a9aae5b98070b73/docs/zh/reference/slash-commands.md',
    },
    'kimi-guard-config-files-layout': {
      label:
        'Kimi Code 配置文档开头与 `[watch]`、`local.toml` 段（提交 6e7cc909da90）：长期偏好写在 `~/.kimi-code/` 下的 TOML，运行时设置放 `config.toml`、界面偏好放 `tui.toml`，`config.toml` 首次运行自动创建，`KIMI_CODE_HOME` 可把数据目录搬到别处且“此时配置文件路径变为 `$KIMI_CODE_HOME/config.toml`”；`watch` 控制 `local.toml`、`AGENTS.md`、skills、MCP 配置以及 `config.toml` 自身的文件系统热更新且默认开启，`/reload` 同时重载 `config.toml` 与 `tui.toml`；项目级 `<项目根目录>/.kimi-code/local.toml` 保存与某个检出相关、通常不与队友共享的设置',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/6e7cc909da9084a424f822dd5a9aae5b98070b73/docs/zh/configuration/config-files.md',
    },
    'kimi-guard-release-220': {
      label:
        'Kimi Code 核对日期最新 Release 为 `@moonshot-ai/kimi-code@2.2.0`（2026-10-14T15:31:16Z 发布），早于 PR #4250 的 2026-10-16 合并，因此“关掉全部三条内置 guard”的语义只在 main 分支、尚未随任何 Release 发布；该 Release 说明里没有 `dangerous_command_guard` 相关条目',
      url: 'https://github.com/MoonshotAI/kimi-code/releases/tag/%40moonshot-ai%2Fkimi-code%402.2.0',
    },
    'claude-subagents-background': {
      label:
        'Claude Code Subagents 的 “Run subagents in foreground or background” 与并发上限段（2026-10-18 复核）：前台与后台逐字为 “**Foreground subagents** block the main conversation until complete. Permission prompts are passed through to you as they come up.” 与 “**Background subagents** run concurrently while you continue working. When a background subagent reaches a tool call that needs permission, Claude Code surfaces the prompt in your main session and names the subagent that is asking.”；Fork 模式与前后台的关系逐字为 “Where fork mode is on, as it is by default in an interactive session, Claude Code runs the subagent in the background, forks and non-fork subagents alike, and Claude can\'t ask for the foreground.”、“Where fork mode is off, Claude runs the subagent in the background by default and in the foreground when it needs the result before continuing.” 与 “Fork mode is off in non-interactive mode with `-p` and in the Agent SDK unless you turn it on.”；`background` frontmatter 行逐字为 “Set to `true` to keep this subagent in the background even when Claude asks to run it in the foreground.”；环境变量逐字为 “If you set `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS` to `1`, Claude Code runs the subagent in the foreground, in every kind of session and whether or not fork mode is on.”；Agent Team 队友逐字为 “If an in-process agent team teammate spawned the subagent, Claude Code runs it in the foreground.” 与 “Claude Code refuses with an error to spawn a teammate\'s subagent whose definition sets `background: true`.”；工具集差异逐字为 “Background subagents run with a smaller built-in tool set than foreground subagents, except for conversation forks and resumed foreground subagents.”；快捷键逐字为 “Press **Ctrl+B** to background a running task”；并发上限逐字为 “By default, when 20 subagents are running in a session, spawning another with the Agent tool fails with `Concurrent subagent limit reached`, and the error tells Claude not to retry. Spawning succeeds again when the running count drops below the limit.”、“To change the limit, set `CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS` to any positive whole number. Sessions with ultracode active are exempt: the limit isn\'t enforced there. Requires Claude Code v2.1.217 or later.”、“An in-session fork you start with `/subtask` takes a slot while it runs and is never blocked by the limit.”、“Resuming a subagent that already finished takes a fresh slot without checking the limit, so resumes can push the running count past it.” 与 “Agents that other features run, such as workflow agents and agent team teammates, follow their own limits instead.”；面板行为逐字为 “When a subagent finishes successfully, Claude Code removes its row immediately and, except in screen reader mode, shows `/tasks to see subagents` in the footer for 30 seconds.” 与 “A background subagent that completes stays listed in `/tasks`, marked done and sorted below running work, for the same 30 seconds as the footer hint.”；`maxTurns` 行逐字为 “Maximum number of agentic turns before the subagent stops. When the subagent reaches the limit, Claude Code returns its output marked as partial, and Claude can resume it to continue. The partial marking requires Claude Code v2.1.246 or later”；该页前后台一节没有出现桌面端、VS Code、`claude -p` 或 Agent SDK',
      url: 'https://code.claude.com/docs/en/sub-agents#run-subagents-in-foreground-or-background',
    },
    'claude-v21302-fork-background-changelog': {
      label:
        'Claude Code v2.1.302 更新日志（固定到提交 `c017428c8c27e604840435048d5bce6a9a22c040`）：逐字为 “Changed fork subagents (`subagent_type: "fork"`) to be on by default in `claude -p`, the Agent SDK, the desktop app and VS Code, as they already are in the terminal; `CLAUDE_CODE_FORK_SUBAGENT=0` turns them off, and `claude mcp serve` never offers them” 与 “Changed the desktop app and VS Code to always run the main conversation\'s subagents in the background, as the terminal does, rather than let Claude choose; a subagent\'s own Agent calls in `claude -p`, the Agent SDK, the desktop app and VS Code now run in the foreground by default”；同版另有 “Changed prompt and agent hooks so that at most 12 of one event run at a time; the rest wait their turn” 与 “Fixed subagents you had typed messages to disappearing from `/tasks` shortly after finishing, leaving no way back to the conversation”（后者属 v2.1.300）',
      url: 'https://github.com/anthropics/claude-code/blob/c017428c8c27e604840435048d5bce6a9a22c040/CHANGELOG.md',
    },
    'codex-subagents-execution': {
      label:
        'Codex Subagents 页的执行方式与各界面查看/停止入口（2026-10-18 复核）：逐字为 “ChatGPT Work and Codex can run subagent workflows by spawning specialized agents in parallel and then collecting their results in one response.”、“When many agents are running, Codex waits until all requested results are available, then returns a consolidated response.” 与 “A good subagent prompt should explain how to divide the work, whether Codex should wait for all agents before continuing, and what summary or output to return.”；CLI 为 “Use `/subagents` in the CLI to switch between active agent threads and inspect the ongoing thread.”、“Ask Codex directly to steer a running subagent, stop it, or close completed agent threads.” 与 “In interactive CLI sessions, approval requests can surface from inactive agent threads even while you are looking at the main thread.”，审批时可 “press `o` to open that thread before you approve, reject, or answer the request.”；网页侧栏为 “Open **Subagents** to see read-only **Active** and **Done** lists. Select a completed subagent to inspect its details and result.” 且 “it doesn\'t provide controls to stop or steer an individual subagent.”；IDE 扩展有 background-agent 面板可展开查看状态、停止活跃 Subagent 或打开某个 Subagent 线程；桌面 App 为 “Subagent activity appears in the ChatGPT desktop app” 与 “Open a subagent thread from the activity shown in the main thread to inspect its work.”；该页没有把 Subagent 分成前台与后台两种模式，也没有给出把某个 Subagent 强制放到前台或后台的开关',
      url: 'https://learn.chatgpt.com/docs/agent-configuration/subagents',
    },
    'codex-agents-concurrency-keys': {
      label:
        'Codex Configuration Reference 的 `[agents]` 键（2026-10-18 复核）：`agents` 为 table、“Multi-agent settings and custom role declarations. Scalar setting names are reserved and can\'t be used as custom role names.”；`agents.enabled` 为 boolean、“Enable or disable multi-agent tools (default: true).”；`agents.max_concurrent_threads_per_session` 为 number、“Maximum number of spawned-agent threads that can be open concurrently, excluding the primary thread. When unset, Codex chooses the default.”，默认值栏为空、全页没有给出数值默认；`agents.max_threads` 为 “Legacy alias for `agents.max_concurrent_threads_per_session`.”；`agents.interrupt_message` 为 boolean、“Record a model-visible message when an agent turn is interrupted (default: true).”；`agents.default_subagent_model` 与 `agents.default_subagent_reasoning_effort` 分别为 “Default model for spawned agents. An explicit spawn model takes precedence.” 与 “Default reasoning effort for spawned agents. An explicit spawn effort takes precedence.”；`agents.<name>.description` 为 “Role guidance shown to Codex when choosing and spawning that agent type.”、`agents.<name>.config_file` 为 “Path to a TOML config layer for that role; relative paths resolve from the config file that declares the role.”；Subagents 页的示例给出 `max_concurrent_threads_per_session = 8` 与 `= 6`',
      url: 'https://learn.chatgpt.com/docs/config-file/config-reference',
    },
    'qwen-subagents-background-head': {
      label:
        'Qwen Code Subagents 文档（main 分支，固定到提交 `97925919acb92b089d817991bfefe4545601c8f6`，41,363 字节）的后台与前后台边界：逐字为 “Top-level named subagents run in the background by default and deliver their results through completion notifications.”、“Set `run_in_background: false` when the current turn must wait for a regular subagent\'s result inline.”、“Background runs send a completion notification containing the result to the main conversation; foreground regular subagents return results inline”、“A fork inherits the parent\'s full conversation context and normally runs detached in the background.” 与 “Forks work in both interactive and headless sessions; headless forks always use the background path.”，对照表 Execution 行把普通 Subagent 写成 “Background by default; supports an explicit foreground opt-out”、Fork 写成 “Always detached; parent continues immediately”；外部执行器为 “Both agents default to foreground execution; set `run_in_background: true` to receive a background completion notification.”；调用方自有 worktree 为 “An unnamed caller-owned `working_dir` launch runs in the foreground because Qwen Code does not own that worktree\'s lifecycle: an explicit `run_in_background: true` request is rejected, while a configured background default (`background: true` in a subagent definition) is rejected at the top level and downgraded to the foreground when nested.”、“If both `working_dir` and `isolation: "worktree"` are supplied, Qwen Code reuses the caller-owned worktree instead of creating another one.” 与 “`working_dir` cannot be combined with `subagent_type: "fork"`.”；通知队列为 “In the interactive TUI and ACP session, completion notifications from background agents, shells, monitors and workflows share a queue that drains into a model turn once the session is idle.”、“These queues hold at most 20 notifications so a noisy producer cannot accumulate an unbounded backlog.”、“The headless CLI\'s local queue is not capped by this rule.”、“When a 21st notification arrives, Qwen Code evicts an interim monitor pulse first — the monitor\'s next poll supersedes it — and otherwise the oldest queued notification.”、“Agent results, workflow results and scheduled prompts are never evicted in the interactive TUI; a notification that would displace one is dropped instead, and so is an arriving pulse when only terminal results are queued.”、“Discarded notifications are reported rather than dropped quietly.”、“Discarding a notification never stops or deletes its task, and completed tasks retain their results; the summary points at `/tasks` and task output files when there is a task to inspect.” 与 “A continued agent reports its next result through another completion notification.”；发现与继续为 “The main AI can use `list_agents` to find background agents and `send_message` to continue a running, paused, or completed agent”；`maxTurns` 为 “Caps the agent\'s turn budget. Wired into `runConfig.max_turns` at runtime; when both are set, the top-level field wins.”；frontmatter 字段表没有 `background` 行，该字段只出现在 YAML 示例与上述散文里；全文没有并发 Subagent 数量上限，也没有 `Ctrl+B`',
      url: 'https://github.com/QwenLM/qwen-code/blob/97925919acb92b089d817991bfefe4545601c8f6/docs/users/features/sub-agents.md',
    },
    'qwen-v0252-subagents-doc': {
      label:
        'Qwen Code Subagents 文档在 stable 标签 v0.25.2（指向提交 `8a415cb628db88844e0196bdfdcce83b4f88d812`，2026-10-15T15:27:05Z）下的同一文件：字节数与 main HEAD 相同均为 41,363 字节，且同样含 “Top-level named subagents run in the background by default and deliver their results through completion notifications.”、“These queues hold at most 20 notifications so a noisy producer cannot accumulate an unbounded backlog.”、“Both agents default to foreground execution; set `run_in_background: true` to receive a background completion notification.” 与调用方自有 `working_dir` 固定前台那一句，因此上述后台行为已随 stable v0.25.2 发布而不是只在 main 分支',
      url: 'https://github.com/QwenLM/qwen-code/blob/8a415cb628db88844e0196bdfdcce83b4f88d812/docs/users/features/sub-agents.md',
    },
    'kimi-tools-head': {
      label:
        'Kimi Code 工具文档（main 分支，固定到提交 `4a82a07f08d0b135c4349c20aae53a2d51e5c3fa`，22,181 字节）：`Agent` 工具必填 `prompt` 与 `description`，可选 `subagent_type`（默认 `coder`）、`resume`（与 `subagent_type` 互斥）、`run_in_background`（默认 false）与 `model`（配置模型池后可用、resume 时无效），逐字为 “前台模式下父 Agent 等待 subagent 完成再继续；后台模式立即返回任务 ID，完成时通过合成 User 消息自动回到 main agent。多个前台 `Agent` 调用在同一步运行时，TUI 会合并展示，并为每个 subagent 显示运行、等待、完成或失败状态以及已耗时长。” 与 “Agent 任务默认 2 小时超时，可通过 `config.toml` 的 `[subagent] timeout_ms`（`0` = 无超时，或 `KIMI_SUBAGENT_TIMEOUT_MS` 环境变量）配置，且在 print 模式（`kimi -p`）下默认无超时”；审批规则为 `Agent` 自动放行、`AgentSwarm` 为 “swarm mode 中自动放行，否则需审批”；`AgentSwarm` 逐字为 “本工具最多支持 128 个 subagent，会等待全部 subagent 完成，并返回聚合报告。”、“默认情况下，本工具会逐步提升并发且不设上限（立即启动 5 个 subagent，之后每 700 毫秒再启动 1 个）；将 `KIMI_CODE_AGENT_SWARM_MAX_CONCURRENCY` 设为正整数可限制该阶段同时运行的 subagent 数量，不设置则表示不限制。若设置为非正整数的值，本次 AgentSwarm 调用会立即失败。”、“在 TUI 中，前台 swarm 会在输入框上方显示实时 `Agent swarm` 进度面板。” 与 “若一次模型响应调用 `AgentSwarm`，该调用必须是该响应中的唯一工具调用”；后台任务工具为 `TaskList`（自动放行，`active_only` 默认 true、`limit` 默认 20、取值 1–100）、`TaskOutput`（自动放行，内联预览最近 32 KB、完整日志落盘并返回 `output_path`，逐字 “该调用始终是非阻塞的——立即返回当前快照，任务完成会通过自动通知送达。”）、`TaskStop`（需审批，接受 `task_id` 与可选 `reason`、默认 `Stopped by TaskStop`，对已终止任务也能安全调用）与 `WaitFor`（自动放行，`timeout` 必填、单位秒、上限 90，可选 `task_id`，逐字 “超时不是错误——结果会列出仍在运行的任务” 与 “新消息会提前结束本次等待。”）；`Bash` 的 `run_in_background` 后台默认 10 分钟超时、print 模式默认无超时，`description` 在 `run_in_background=true` 时必填，前台命令超时默认转后台继续（`[background] bash_auto_background_on_timeout`）',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/4a82a07f08d0b135c4349c20aae53a2d51e5c3fa/docs/zh/reference/tools.md',
    },
    'kimi-tools-220': {
      label:
        'Kimi Code 工具文档在 Release `@moonshot-ai/kimi-code@2.2.0`（2026-10-14T15:31:16Z，标签指向提交 `472192c34c1efad89a369870eff0da0b708ce9bb`，22,038 字节）下的同一文件：`Agent` 参数表已含 `run_in_background`（默认 false），正文已含 “前台模式下父 Agent 等待 subagent 完成再继续；后台模式立即返回任务 ID，完成时通过合成 User 消息自动回到 main agent。” 与 “Agent 任务默认 2 小时超时……”，`AgentSwarm` 段已含 “本工具最多支持 128 个 subagent，会等待全部 subagent 完成，并返回聚合报告。” 与 `KIMI_CODE_AGENT_SWARM_MAX_CONCURRENCY` 的 ramp 并发说明，因此这些行为已随 2.2.0 发布而不是只在 main 分支',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/472192c34c1efad89a369870eff0da0b708ce9bb/docs/zh/reference/tools.md',
    },
    'kimi-background-config-head': {
      label:
        'Kimi Code 配置文档（main 分支，固定到提交 `4a82a07f08d0b135c4349c20aae53a2d51e5c3fa`，39,784 字节）的 `[background]`、`[subagent]` 与 `[swarm]` 三节：`background` 一节逐字为 “`background` 控制后台任务（通过 `Bash` 工具或 `Agent` 工具的 `run_in_background=true` 参数启动）的并发数。”，字段为 `max_running_tasks`（integer，默认值栏为 —，“同时运行的最大后台任务数”）、`keep_alive_on_exit`（boolean，默认 `false`，“会话关闭时是否保留仍在运行的后台任务；print 模式下仅作 `print_background_mode` 的回退：`true` 等价于 `drain`”）、`kill_grace_period_ms`（integer，默认 `5000`，“任务被请求正常终止后，等待自行结束的宽限时间（毫秒），超时后强制停止”）、`bash_auto_background_on_timeout`（boolean，默认 `true`）、`bash_task_timeout_s`（integer，默认 `600`，“`0` 表示无超时……print 模式默认 0”）、`print_background_mode`（取值 `"exit"`、`"drain"` 或 `"steer"`，默认 `"steer"`，仅 print 模式生效）、`print_wait_ceiling_s`（integer，默认 `2147483`）与 `print_max_turns`（integer，默认 `100000`），分别可被 `KIMI_CODE_BACKGROUND_KEEP_ALIVE_ON_EXIT`、`KIMI_CODE_BACKGROUND_MAX_RUNNING_TASKS`、`KIMI_CODE_BACKGROUND_BASH_TASK_TIMEOUT_S`、`KIMI_CODE_BACKGROUND_PRINT_BACKGROUND_MODE`、`KIMI_CODE_BACKGROUND_PRINT_WAIT_CEILING_S` 与 `KIMI_CODE_BACKGROUND_PRINT_MAX_TURNS` 覆盖且优先级高于配置文件；正文另逐字写 “在 print 模式（`kimi -p "<prompt>"`）下，只要还有未决的后台任务，Kimi Code 在 main agent 的 turn 结束后不会退出：每个任务完成都会以合成 user 消息回馈给 main agent，steer 出新的 turn（默认 `print_background_mode = "steer"`），直到某 turn 结束时没有任何未决任务才退出。” 与 “print 模式下后台工作也不会被墙钟超时杀掉：后台 `Bash` 任务默认无超时（`bash_task_timeout_s = 0`），subagent 默认无超时（`[subagent] timeout_ms` 与 `[swarm] timeout_ms` 未显式设置时均为 `0`），只有模型自己能停止任务。”；`[subagent]` 只有 `timeout_ms`（默认 `7200000`，“超时以 `timed_out` 收尾，`0` 表示无超时”，`KIMI_SUBAGENT_TIMEOUT_MS` 覆盖），`[swarm]` 只有 `timeout_ms`（默认 `7200000`，“超时后中止，聚合报告标记 `Subagent timed out.`；0 为无超时”，`KIMI_CODE_SWARM_TIMEOUT_MS` 覆盖）且与 `[subagent]` 相互独立；三节都没有 subagent 数量上限键，`[background] max_running_tasks` 也没有给出默认数值；同一文件的 `[secondary_model]` 节在核对日期仍完整存在',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/4a82a07f08d0b135c4349c20aae53a2d51e5c3fa/docs/zh/configuration/config-files.md',
    },
    'kimi-env-vars-head': {
      label:
        'Kimi Code 环境变量文档（main 分支，固定到提交 `4a82a07f08d0b135c4349c20aae53a2d51e5c3fa`，21,075 字节）：`KIMI_CODE_BACKGROUND_MAX_RUNNING_TASKS` 为“同时运行的后台任务数上限，优先级高于 `config.toml` 的 `[background] max_running_tasks`；不设置表示无上限”、合法值为正整数且非法值被忽略；`KIMI_CODE_AGENT_SWARM_MAX_CONCURRENCY` 为“限制 AgentSwarm 初始提升并发阶段可同时运行的 subagent 数量；不设置表示不限制”、合法值为正整数且非法值会立即失败、文档没有列出对应 config 键；另有 `KIMI_CODE_BACKGROUND_KEEP_ALIVE_ON_EXIT`、`KIMI_CODE_BACKGROUND_BASH_TASK_TIMEOUT_S`、`KIMI_CODE_BACKGROUND_PRINT_BACKGROUND_MODE`、`KIMI_CODE_BACKGROUND_PRINT_WAIT_CEILING_S`、`KIMI_CODE_BACKGROUND_PRINT_MAX_TURNS`、`KIMI_SUBAGENT_TIMEOUT_MS`、`KIMI_CODE_SWARM_TIMEOUT_MS`、`KIMI_CODE_SUBAGENT_SCOPE_CACHE_SIZE`（默认 `32`）与 `KIMI_CODE_SUBAGENT_SCOPE_EVICT_TIMEOUT_MS`（默认 `15000`）；该文档把 `bash_task_timeout_s` 与 `print_background_mode` 的所属节写成 `[task]`，而配置文档把它们定义在 `[background]` 下，两份官方文档的节名不一致',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/4a82a07f08d0b135c4349c20aae53a2d51e5c3fa/docs/zh/configuration/env-vars.md',
    },
    'kimi-agents-head': {
      label:
        'Kimi Code Agents 文档（main 分支，固定到提交 `4a82a07f08d0b135c4349c20aae53a2d51e5c3fa`，16,328 字节）：逐字为 “subagent 支持在后台运行：完成后结果自动回到 main agent，无需手动轮询。也可以唤回已有的 subagent 实例继续推进同一任务。”、“多个 subagent 可以并行运行，互不干扰。” 与 “如果 subagent 结束自己的轮次时仍有后台任务在运行，这次运行会等这些后台任务全部落定后才回报完成。main agent 拿到结果时，背后的工作也已经真正完成。”；状态存储为 “subagent 的运行状态持久化到当前会话目录的 `agents/` 子目录下，每个 subagent 实例对应一个独立目录，其中包含按时间顺序记录提示词、消息历史与最终状态的 `wire.jsonl` 文件。后台 subagent 还会通过 `tasks/` 子目录暴露生命周期状态。”；审批为 “每次派发都会在终端以审批请求的形式呈现，方便你审视任务描述，除非你已用 allow 规则放行或处于 YOLO 模式”；该页没有 `run_in_background` 参数、没有并发上限、没有 `/tasks` 或 `Ctrl+B`，也没有 kimi web、ACP 与 SDK 的差异说明',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/4a82a07f08d0b135c4349c20aae53a2d51e5c3fa/docs/zh/customization/agents.md',
    },
    'kimi-changelog-background': {
      label:
        'Kimi Code 官方变更记录（main 分支，固定到提交 `4a82a07f08d0b135c4349c20aae53a2d51e5c3fa`，108,758 字节）的后台与并行时间线：0.14.1（2026-06-12）“要求 AgentSwarm 工具调用在模型响应中单独运行。”；0.18.0（2026-06-18）“新增环境变量以限制 AgentSwarm 在初始 ramp 阶段的并发数，使大型 swarm 更不容易触发供应商的速率限制。”；0.19.0（2026-06-22）“允许使用 `Ctrl+B` 将长时间运行的前台命令和子 Agent 移动到后台任务，并通过 `/tasks` 面板查看它们。”；0.22.2（2026-07-03）“`kimi -p` 运行时，若启用了 `background.keep_alive_on_exit`，退出前会等待后台子 Agent 完成。”；0.23.6（2026-07-12）“新增 print 模式后台策略：设置 `[background].print_background_mode = "steer"` 后，`kimi -p` 在后台任务完成后保持运行，继续引导主 Agent 进入后续轮次。”；0.24.2（2026-07-15）“`kimi -p` 默认在后台任务未完成时保持运行，等待与轮次实际上不设上限，并把完成结果反馈给主 Agent。如需恢复旧的一轮后退出，可设置 `print_background_mode = "exit"` 或 `"drain"`。” 与 “`kimi -p` 后台任务和子 Agent 默认不再超时（交互模式不变）”；0.26.0（2026-07-16）“扩展 coder 子 Agent 的工具集：新增后台任务、待办列表、Plan 模式、Skill 调用与嵌套 Agent 能力，与主 Agent 对齐。”；0.29.0（2026-07-22）“新增 Agent 循环与后台任务限制的环境变量覆盖：`KIMI_LOOP_MAX_STEPS_PER_TURN`、`KIMI_LOOP_MAX_RETRIES_PER_STEP` 和 `KIMI_CODE_BACKGROUND_MAX_RUNNING_TASKS`。”；0.35.0（2026-08-12）“`/tasks` 面板现实时展示后台子 Agent 的工作进度。”；0.37.0（2026-08-18）“web: Subagent 面板更名为 "Background Agent"。”；0.39.0（2026-08-27）“web: 运行卡片新增 "转到后台" 按钮，可把正在前台运行的 Bash 命令或子 Agent 转为后台运行。”；0.43.0（2026-09-14）“引导消息现在可以打断对后台任务的等待。”；三个最新版本为 2.2.0（2026-10-14）、2.1.1（2026-09-24）与 2.1.0（2026-09-23）；全文搜索 `run_in_background`、`KIMI_CODE_AGENT_SWARM_MAX_CONCURRENCY`、`TaskList` 与 `TaskStop` 均无匹配',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/4a82a07f08d0b135c4349c20aae53a2d51e5c3fa/docs/zh/release-notes/changelog.md',
    },
    'kimi-slash-commands-tasks-head': {
      label:
        'Kimi Code Slash 命令表（main 分支，固定到提交 `4a82a07f08d0b135c4349c20aae53a2d51e5c3fa`，12,497 字节）：`/tasks` 行的别名列逐字为 `/task`、说明列为“浏览后台任务列表”、「随时可用」列为“是”；`/swarm` 的 `on` 与 `off` 形式为“开启或关闭 swarm mode，但不发送提示词。”、「随时可用」为“是”，`/swarm <task>` 为“先开启 swarm mode，再把 `<task>` 作为普通提示词发送。如果该轮次正常完成，swarm mode 会自动关闭。若当前是 `manual` 权限模式，启动前会提示是否切换到 "Ask When Needed" 或 "Never Ask" 模式。”、「随时可用」为“否”；全文没有 `Ctrl+B` 或任何把运行中任务转后台的快捷键',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/4a82a07f08d0b135c4349c20aae53a2d51e5c3fa/docs/zh/reference/slash-commands.md',
    },
    'kimi-interaction-head': {
      label:
        'Kimi Code 交互指南（main 分支，固定到提交 `4a82a07f08d0b135c4349c20aae53a2d51e5c3fa`，9,927 字节）：与后台相关的逐字只有 “后台运行：命令执行期间按 `Ctrl+B` 可将其转为后台任务。”、“Agent 正通过 `WaitFor` 等待后台任务时，按 `Enter` 发送消息会将它注入当前轮次并提前结束本次等待；等待开始时已在队列中的消息也会被自动注入。” 与 “后台任务继续运行，已有工具结果保留；如果同批还有其他前台工具，Agent 会在它们返回后处理新消息。”；该页的 `Ctrl+B` 只覆盖命令、没有提到把子 Agent 转后台，也没有 `/tasks` 面板',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/4a82a07f08d0b135c4349c20aae53a2d51e5c3fa/docs/zh/guides/interaction.md',
    },
    'qoder-subagent-background': {
      label:
        'Qoder CLI Subagent 页的后台执行部分（2026-10-18 复核）：frontmatter 字段表 `background` 行逐字为 “Whether the Subagent should launch in the background by default. Requires background Subagent sessions to be enabled.”，类型 Boolean、必填 No，该页没有给出该字段的默认值，也没有给出启用后台 Subagent 会话的配置键、功能开关或环境变量；后台行为逐字为 “When background Subagent sessions are enabled, independent work can also run in the background and notify the main session later.” 与 “When a Subagent runs in the background, the main session first receives a launch result and can continue work that does not depend on it. If there is no other work, the main conversation shows a waiting state to indicate that the session is still running. When the task finishes, its result automatically returns to the main session for synthesis or follow-up work.”；查看与停止为 “In TUI, use `/tasks` to view its status and result or to stop it while it is still running.”；并行为 “Qoder CLI can dispatch multiple independent Subagents in parallel.” 与 “Yes. Qoder CLI can dispatch independent Subagents concurrently.”，该页没有给出并发数量上限；页面只描述 TUI、Headless Mode 与 Non-Interactive 三种 CLI 用法，没有 ACP、SDK 或 Cloud 的前后台差异',
      url: 'https://docs.qoder.com/en/cli/subagent',
    },
    'qoder-parallel-tasks-background': {
      label:
        'Qoder CLI Parallel Tasks 页（2026-10-18 复核）：逐字为 “Qoder CLI provides several isolation methods: using **Worktree** to place different tasks into independent Git checkouts, using **Background Agents / Tasks** to run multiple subtasks in parallel, and using **Subagents** to delegate complex work to specialized subagents.”、“For a single complex task, you can break it down and delegate parts to multiple Subagents for parallel processing.” 与 “Use `/tasks` to view currently running background tasks:”；该页没有说明如何启用后台 Subagent 会话，也没有给出 Subagent 并发上限',
      url: 'https://docs.qoder.com/cli/parallel-tasks',
    },
    'qoder-settings-reference-agents': {
      label:
        'Qoder CLI 设置参考（2026-10-18 复核）：全页没有任何含 background 的设置键（`agents.background`、`backgroundSubagents` 与 `general.background` 都不存在）、没有 Subagent 并发数或最大并发键、也没有 `QODER_CLI_MAX_CONCURRENT_SUBAGENTS` 环境变量；`agents` 组只有 `agents.overrides`（object，默认 `{}`，Restart 为 Yes，描述 “Override configuration by Agent name (enablement, tools, models, run limits, etc.). For fields, see Subagent.”），因此启用后台 Subagent 会话的开关记为未确认',
      url: 'https://docs.qoder.com/cli/settings-reference',
    },
    'qoder-release-notes-subagent-concurrency': {
      label:
        'Qoder CLI Release Notes 的 Subagent 并发与后台条目（2026-10-18 复核，最新条目为 2026-10-16 的 CLI 1.1.73）：0.1.43（2026-04-16）“Implemented permission request queuing and sequential display for concurrent subagents”；0.2.2（2026-04-28）“Fixed /tasks command unable to exit”；1.1.17（2026-08-07）“Fixed the subagent display in the TUI task panel”；1.1.31（2026-08-26）“Added a concurrency limit for subagents, configurable via the `QODER_CLI_MAX_CONCURRENT_SUBAGENTS` environment variable”，该条没有给出默认并发数；1.1.42（2026-09-03）“Limited subagent spawning to one nested level by default”；1.1.55（2026-09-17）“Fixed concurrent configuration updates in Qoder CLI overwriting each other”；全页没有含 “background subagents”、“background sessions” 或 “parallel subagents” 字样的条目',
      url: 'https://docs.qoder.com/release-notes/qoder-cli',
    },
    'qoder-sessions': {
      label:
        'Qoder CLI Session Management 页（2026-10-21 复核，1,174,731 字节）：启动命名逐字为 “Use `-n` (`--name`) to set an easily recognizable display name for a session:” 加示例 `qoder -n "Refactor login"`，旗标表 `-n, --name <name>` 描述为 “Set the session display name”；会话内命名逐字为 “You can also use `/rename` to rename the current session from within the session.”，命令表 `/rename` 描述为 “Rename the current session”；恢复只按会话 ID——“Use `-r` (`--resume`) to resume a previous session by its ID:” 加示例 `qoder -r <session-id>`，旗标表 `-r, --resume [id]` 描述为 “Resume a specific session; opens the Session Browser if no ID is provided”，全页没有按名称恢复的入口；存储位置只给出会话日志与状态的 `~/.qoder/projects/<processed-project-path-name>/<session-id>.jsonl` 与 `<session-id>/state.json`，并写 “the system automatically generates a session ID”，没有写明显示名保存在哪个文件，也没有名称长度上限或净化规则',
      url: 'https://docs.qoder.com/cli/sessions',
    },
    'qoder-release-notes-rename': {
      label:
        'Qoder CLI Release Notes 的 `/rename` 时间线（2026-10-21 复核，1,706,864 字节）：CLI 1.1.52（September 14, 2026，小节 “Improved the rename and btw commands”）逐字为 “Type `/rename` to auto-generate a session name based on the current conversation; manually entered names are automatically sanitized and length-limited”；CLI 1.1.9（July 30, 2026，小节 “Rename, Skill Scanning, and Startup Improvements”）逐字为 “Added support for running /rename while a task is in progress”；CLI 1.1.4（July 23, 2026，小节 “Background Tasks, Terminal Titles, and Input Enhancements”）逐字为 “Improved terminal session window title updates”，属终端窗口标题不属会话命名；三条都没有给出名称长度上限、净化规则或自动生成所用的模型与端点',
      url: 'https://docs.qoder.com/release-notes/qoder-cli',
    },
    'claude-sessions-naming': {
      label:
        'Claude Code Manage sessions 页的命名部分（2026-10-21 复核，31,381 字节）：“Name your sessions” 表逐字列出六条命名途径——启动时 `claude -n auth-refactor`、会话中 “`/rename auth-refactor`. The name also appears on the prompt bar”、选择器里 “Highlight a session and press `Ctrl+R`”、“Accepting a plan in plan mode gives the session a generated title based on the plan unless you\'ve already named it”、“Rename a Remote Control session; Claude Code applies the same name in the CLI. Requires Claude Code v2.1.221 or later” 与桌面端重命名；未命名会话的两种标签逐字为 “Default display name: ... The default combines the working directory\'s name with a two-character suffix, for example `my-app-3f` ... The default isn\'t a resume handle. If you pass it to `claude --resume` or `/resume`, Claude Code doesn\'t find the session.” 与 “Generated title: if you don\'t name a session, Claude Code generates a session title for it. The title is a short summary of your first prompt, written by a background request to the small/fast model, normally a Haiku-class model. A `claude -p` run you start directly from a shell or script doesn\'t get one.”，并写 “Only the generated title works as a resume handle”、“Accepting a plan replaces the generated title with a title based on the plan. You can pass either title to `claude --resume` or `/resume`, and Claude Code resolves it the same way as a name you set.”；按名称恢复 “Resolving by name resolves across the current repository and its worktrees. Both forms look for an exact match”，歧义时 `claude --resume <name>` 打开选择器并预填搜索词而 `/resume <name>` 报错；选择器每行 “shows the session name if you set one, otherwise the AI-generated session title, conversation summary, or first prompt”；`/clear` 一条逐字为 “With no argument, the new session keeps a name you set with `--name` or `/rename`, but not an AI-generated session title. To name the session you\'re leaving instead, pass the name, as in `/clear release-prep`; the new session then starts unnamed”',
      url: 'https://code.claude.com/docs/en/sessions',
    },
    'claude-cli-reference-name': {
      label:
        'Claude Code CLI 参考的 `--name` 行（2026-10-21 复核）：逐字为 “| `--name`, `-n` | Set a display name for the session, shown in `/resume` and the terminal title. You can resume a named session with `claude --resume <name>`. `/rename` changes the name mid-session and also shows it on the prompt bar | `claude -n "my-feature-work"` |”',
      url: 'https://code.claude.com/docs/en/cli-reference',
    },
    'codex-commands-rename': {
      label:
        'Codex CLI 命令参考的命名条目（2026-10-21 复核，重定向到 `learn.chatgpt.com/docs/developer-commands?surface=cli`，1,091,211 字节）：命令表 `/rename` 行逐字为 “Rename the current chat.” 与 “Give a saved session a recognizable name without leaving the TUI.”；操作步骤逐字为 “Type `/rename <name>`, or type `/rename` to open the naming prompt.”、“Enter a short name that will help you find the chat later.” 与 “Expected: Codex updates the saved chat name without changing its transcript.”；`/new` 一节逐字为 “To name the new chat as you create it, run `/new bug bash`.”；CLI 子命令表中 `codex archive`、`codex unarchive` 与 `codex delete` 的描述分别为 “Archive a saved interactive session by session ID or session name.”、“Restore an archived interactive session by session ID or session name.” 与 “Permanently delete a saved interactive session by session ID or session name.”；`/title` 一节标题为 “Configure terminal title items with /title”，属终端窗口标题；全页没有承诺未命名会话的自动标题生成规则',
      url: 'https://developers.openai.com/codex/cli/slash-commands',
    },
    'qwen-commands-e8ddd0d': {
      label:
        'Qwen Code 命令文档（main 分支，固定到提交 `e8ddd0d79a4f562d0513e0987ac8dbe328531e2c`，2026-10-21T14:06:57Z）：`/rename` 行逐字为 “| `/rename`        | Rename or tag the current session                                        | `/rename My Feature` or `/tag`                                |”；该文档没有描述 `--auto`、自动触发的时机、长度上限或保存位置',
      url: 'https://github.com/QwenLM/qwen-code/blob/e8ddd0d79a4f562d0513e0987ac8dbe328531e2c/docs/users/features/commands.md',
    },
    'qwen-rename-command-e8ddd0d': {
      label:
        'Qwen Code `packages/cli/src/ui/commands/renameCommand.ts`（提交 `e8ddd0d79a4f562d0513e0987ac8dbe328531e2c`，8,366 字节）：`name: \'rename\'`、`altNames: [\'tag\']`、`kind: CommandKind.BUILT_IN`、`argumentHint: \'[--auto] [<name>]\'`、描述逐字为 “Rename the current conversation. --auto lets the fast model pick a title.”，补全项描述 “Let the fast model generate a sentence-case title from the conversation so far.”；源码注释逐字为 “Both `/rename` (no args) and `/rename --auto` go through the same schema-enforced sentence-case pipeline backed by the fast model. The flag is now just an explicitness marker (no semantic divergence beyond the spinner copy)”，`--auto` 与名称同时给出时报 “/rename --auto does not take a name. Use `/rename <name>` to set one yourself.”，未知 `--xxx` 报 “Unknown flag "{{flag}}". Supported: --auto. To use this as a literal name, run `/rename -- {{flag}}`.”；`titleSource` 注释逐字为 “Track where the title came from so the session picker can dim auto-generated titles; only explicit user text stays \'manual\'.”；超长报 “Name is too long. Maximum {{max}} characters.”；写入用 `chatRecordingService.recordCustomTitle(name, titleSource)`（注释 “Record the custom title in the current session\'s JSONL file”），非录制会话回落 `sessionService.renameSession(sessionId, name, titleSource)`，成功后 `context.ui.setSessionName(name)` 并提示 “Session renamed to "{{name}}"”；六条失败原因文案为 `no_fast_model`（“Auto-generating a title requires a fast model. Configure one with `/model --fast <model>`, or pass a name: `/rename <name>`.”）、`empty_history`、`empty_result`、`aborted`、`model_error` 与 `no_client`；生成时会把最后一条恰为 `/rename`/`/tag`/`/rename --auto` 的用户显示文本从输入里剔除',
      url: 'https://github.com/QwenLM/qwen-code/blob/e8ddd0d79a4f562d0513e0987ac8dbe328531e2c/packages/cli/src/ui/commands/renameCommand.ts',
    },
    'qwen-auto-title-recording-e8ddd0d': {
      label:
        'Qwen Code `packages/core/src/services/chatRecordingService.ts`（提交 `e8ddd0d79a4f562d0513e0987ac8dbe328531e2c`，3,991 行）：`maybeTriggerAutoTitle()` 在 `recordAssistantTurn` 追加记录后调用，方法注释逐字为 “Fire-and-forget: after an assistant turn is recorded, attempt to generate a short session title from the conversation so far.” 并列出两个条件（尚未设标题、配置了 fast model）与 “Errors are swallowed. The title is best-effort and must never surface as a user-visible error or interrupt recording.”；跳过条件依次为已有 `currentCustomTitle`、`writeFailure`、`pendingExplicitTitleWrites > 0`、已有在途 `autoTitleController`、`autoTitleAttempts >= AUTO_TITLE_ATTEMPT_CAP`（常量 3，注释 “Maximum number of auto-title generation attempts per session”）、`QWEN_DISABLE_AUTO_TITLE` 为真值（`0`/`false`/`no`/`off` 视为未关闭，注释写明这样不必取消 fast model 因而 `/rename --auto` 仍可用）、`!isInteractive() && !getExperimentalZedIntegration()`（注释逐字为 “Headless/one-shot CLI flows (`qwen -p "…"`, cron, CI scripts) run a single prompt and throw the session away... Daemon (ACP) sessions are long-lived and user-resumable, so they DO need auto-titles even though `isInteractive()` returns false”）、没有 `getFastModel()`；输入是滚动窗口 `userDisplayTextsForTitle`（`MAX_TITLE_USER_DISPLAY_TEXTS = 20`，超出即 `shift()` 丢最旧）；成功前重读磁盘标题（注释 “Cross-process guard: another CLI tab writing to the same JSONL could have renamed (manually) since we started.”），发现 `source === \'manual\'` 就同步内存并放弃；失败只 `debugLogger.warn` 且不永久关闭，注释 “transient failures (network blips, rate limits, bad UTF-16 in one turn\'s history) should still allow a later turn to retry. The attempt cap bounds total waste.”',
      url: 'https://github.com/QwenLM/qwen-code/blob/e8ddd0d79a4f562d0513e0987ac8dbe328531e2c/packages/core/src/services/chatRecordingService.ts',
    },
    'qwen-session-title-e8ddd0d': {
      label:
        'Qwen Code `packages/core/src/services/sessionTitle.ts`（提交 `e8ddd0d79a4f562d0513e0987ac8dbe328531e2c`，346 行）：`TITLE_SYSTEM_PROMPT` 首句逐字为 “Generate a concise, sentence-case title (3-7 words) that captures what this programming-assistant session is about. Think of it as a git commit subject for the session.”，规则含 3–7 个词、只首字母与专有名词大写、无句尾标点、无引号反引号或 Markdown、要具体到用户目标，并给出好例与四类坏例（太笼统、太长、大小写错、带句尾标点）；`TITLE_USER_PROMPT` 为 “Generate the session title now. Populate the schema with a single short title string.”，`TITLE_SCHEMA` 的 `title` 描述为 “A concise sentence-case session title, 3-7 words, no trailing punctuation.”；`tryGenerateSessionTitle` 用 `config.getFastModel()` 且 `no_fast_model` 的注释逐字为 “config.getFastModel() returned undefined.”；归一化时超过 `SESSION_TITLE_MAX_LENGTH` 会被 `slice` 后 `trim`，模型照抄提示词示例（#9706）或返回空都按失败处理并记 “Session title rejected”',
      url: 'https://github.com/QwenLM/qwen-code/blob/e8ddd0d79a4f562d0513e0987ac8dbe328531e2c/packages/core/src/services/sessionTitle.ts',
    },
    'qwen-session-service-e8ddd0d': {
      label:
        'Qwen Code `packages/core/src/services/sessionService.ts`（提交 `e8ddd0d79a4f562d0513e0987ac8dbe328531e2c`）第 473 行逐字为 “export const SESSION_TITLE_MAX_LENGTH = 200;”，同文件第 5,181 行在派生显示名时按 `.slice(0, SESSION_TITLE_MAX_LENGTH - maxSuffixLen)` 截断',
      url: 'https://github.com/QwenLM/qwen-code/blob/e8ddd0d79a4f562d0513e0987ac8dbe328531e2c/packages/core/src/services/sessionService.ts',
    },
    'kimi-config-files-b5e28fd': {
      label:
        'Kimi Code 配置文档（2.3.0 标签提交 `b5e28fd6beac752a2cdcc0ff2f5fdf40e6494fbb`）：`config.toml` 顶层字段表 `auto_session_title` 行逐字为 “| `auto_session_title` | `boolean` | `true` | 是否允许客户端自动生成会话标题；显式设为 `false` 时关闭 |”；`tui.toml` 表 `auto_session_title` 行逐字为 “| `auto_session_title` | `boolean` | `true` | 首个完成的轮次后由 TUI 自动生成会话标题；设为 `false` 只关闭 TUI 的触发，不影响 `config.toml` 中的全局 `auto_session_title` |”，示例配置写 “auto_session_title = true # false 表示 TUI 不在首个完成的轮次后自动生成会话标题”；英文版同两行逐字为 “Whether clients may automatically generate session titles; disabled only when explicitly set to `false`” 与 “Let the TUI automatically generate a session title after the first completed turn; `false` opts out the TUI only, without affecting the global `auto_session_title` gate in `config.toml`”',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/b5e28fd6beac752a2cdcc0ff2f5fdf40e6494fbb/docs/zh/configuration/config-files.md',
    },
    'kimi-sessions-b5e28fd': {
      label:
        'Kimi Code 会话指南（2.3.0 标签提交 `b5e28fd6beac752a2cdcc0ff2f5fdf40e6494fbb`）：第 24 行逐字为 “- `state.json`：会话标题、创建时间等元数据。”，第 64 行逐字为 “- **`/title <text>`**（别名 `/rename`）：设置会话标题方便识别；不带参数时显示当前标题。”；该页没有任何自动生成标题的描述',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/b5e28fd6beac752a2cdcc0ff2f5fdf40e6494fbb/docs/zh/guides/sessions.md',
    },
    'kimi-slash-commands-b5e28fd': {
      label:
        'Kimi Code 中文 Slash 命令参考（2.3.0 标签提交 `b5e28fd6beac752a2cdcc0ff2f5fdf40e6494fbb`）：`/title` 行逐字为 “| `/title [<text>]` | `/rename` | 不带参数时显示当前会话标题；带参数时设置为新标题（最长 200 字符） | 是 |”',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/b5e28fd6beac752a2cdcc0ff2f5fdf40e6494fbb/docs/zh/reference/slash-commands.md',
    },
    'kimi-tui-app-b5e28fd': {
      label:
        'Kimi Code `apps/kimi-code/src/tui/kimi-tui.ts`（2.3.0 标签提交 `b5e28fd6beac752a2cdcc0ff2f5fdf40e6494fbb`）：`handleTurnEnded` 末行逐字为 “if (event.reason === \'completed\') void this.maybeAutoGenerateSessionTitle();”；`maybeAutoGenerateSessionTitle()` 依次检查 `sessionId.length === 0`、`this.state.appState.autoSessionTitle === false`、`record.done || record.attempts >= MAX_AUTO_TITLE_ATTEMPTS`，再 `await this.harness.getConfig()` 复核 `config.autoSessionTitle === false`，然后 `this.harness.generateSessionTitle({ id: sessionId, source: \'first_turn\' })`，返回非 `undefined` 时把该会话记为 `{ attempts: 0, done: true }`，整个 try 块的 catch 为空并附注释 “title generation is best-effort; the session keeps its current title”；`updateTerminalTitle()` 逐字为 “const label = trimmed.length > 0 ? trimmed.slice(0, MAX_TERMINAL_TITLE_LENGTH) : PRODUCT_NAME;” 后调 `this.state.terminal.setTitle(label)`',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/b5e28fd6beac752a2cdcc0ff2f5fdf40e6494fbb/apps/kimi-code/src/tui/kimi-tui.ts',
    },
    'kimi-tui-constants-b5e28fd': {
      label:
        'Kimi Code `apps/kimi-code/src/tui/constant/kimi-tui.ts`（2.3.0 标签提交 `b5e28fd6beac752a2cdcc0ff2f5fdf40e6494fbb`）：`MAX_AUTO_TITLE_ATTEMPTS = 3`，其上注释逐字为 “Per-session cap on automatic title-generation attempts; failures stay retryable across turns until the cap so a transient error is not sticky.”；同目录 `constant/terminal.ts` 第 36 行为 “export const MAX_TERMINAL_TITLE_LENGTH = 32;”',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/b5e28fd6beac752a2cdcc0ff2f5fdf40e6494fbb/apps/kimi-code/src/tui/constant/kimi-tui.ts',
    },
    'kimi-tui-config-b5e28fd': {
      label:
        'Kimi Code `apps/kimi-code/src/tui/config.ts`（2.3.0 标签提交 `b5e28fd6beac752a2cdcc0ff2f5fdf40e6494fbb`）：`TuiConfigFileSchema` 新增 `auto_session_title: z.boolean().optional()`，`DEFAULT_TUI_CONFIG` 写 `autoSessionTitle: true`，`normalizeTuiConfig` 用 `config.auto_session_title ?? DEFAULT_TUI_CONFIG.autoSessionTitle` 归一，写回 `tui.toml` 的模板行为 “auto_session_title = ${String(config.autoSessionTitle !== false)} # false stops the TUI from auto-generating a session title after the first turn”；`commands/reload.ts` 的 `applyReloadedTuiConfig` 把 `autoSessionTitle: config.autoSessionTitle` 一并应用（`/reload` 与 `/reload-tui` 都走这条路径），`commands/config.ts` 的 `currentTuiConfig` 也带上该键以便写回时保留当前值',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/b5e28fd6beac752a2cdcc0ff2f5fdf40e6494fbb/apps/kimi-code/src/tui/config.ts',
    },
    'kimi-title-command-b5e28fd': {
      label:
        'Kimi Code `apps/kimi-code/src/tui/commands/session.ts` 与 `commands/registry.ts`（2.3.0 标签提交 `b5e28fd6beac752a2cdcc0ff2f5fdf40e6494fbb`）：注册项为 `name: \'title\'`、`aliases: [\'rename\']`、`description: \'Set or show session title\'`、`argumentHint: \'<title>\'`、`availability: \'always\'`；处理函数不带参数时输出 “Session title: ${current}” 或 “Session title: (not set) — id: ${host.state.appState.sessionId}”，带参数时 `const newTitle = title.slice(0, 200);` 后调 `host.harness.renameSession({ id: session.id, title: newTitle })`，成功提示 “Session title set to: ${newTitle}”、失败提示 “Failed to set title: ${msg}”，注释说明设置标题需要活动会话因而会按需惰性创建',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/b5e28fd6beac752a2cdcc0ff2f5fdf40e6494fbb/apps/kimi-code/src/tui/commands/session.ts',
    },
    'kimi-title-service-b5e28fd': {
      label:
        'Kimi Code `packages/agent-core-v2/src/session/sessionTitle/sessionTitleService.ts`（2.3.0 标签提交 `b5e28fd6beac752a2cdcc0ff2f5fdf40e6494fbb`）：`generateTitle({force, source})` 的 `source` 默认 `\'user_prompts\'`，非 force 时 `titleKind` 为 `\'custom\'` 或 `\'generated\'` 都直接返回 `undefined`，并用 `_shared` 合流并发请求；`generateAndApply` 要求 `KIMI_CODE_PROVIDER_NAME` 的 Provider 存在、`isOAuthCatalogVendor(provider.type)` 为真且 `provider.oauth` 已配置，取不到 token provider 即返回，`OAuthError` 记 debug “chat_title request unavailable:” 后返回，HTTP 401 强制刷新令牌重试一次，其他失败记 “chat_title request failed:”；标题按 `MAX_GENERATED_TITLE_LENGTH = 200` 截断后经 `metadata.setGeneratedTitleIfUncustomized(title, { force })` 写入并发布 `SessionMetaUpdated`（补丁 `{ title, isCustomTitle: false }`）；`first_turn` 输入由 `firstTurnExcerpt()` 组成，缺一即不生成，用户段截 `MAX_TITLE_USER_SEGMENT = 400`、助手段截 `MAX_TITLE_FIRST_TURN_ASSISTANT = 300`，另有 `user_prompts`（最多 `MAX_TITLE_PROMPTS = 3` 条、总长 `MAX_TITLE_INPUT_LENGTH = 1000`）与 `digest`（头尾保留、总长 `MAX_TITLE_DIGEST_INPUT_LENGTH = 3000`、省略号标记）两种来源',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/b5e28fd6beac752a2cdcc0ff2f5fdf40e6494fbb/packages/agent-core-v2/src/session/sessionTitle/sessionTitleService.ts',
    },
    'kimi-title-prompt-source-b5e28fd': {
      label:
        'Kimi Code `packages/agent-core-v2/src/session/sessionTitle/agentTitlePromptSourceService.ts`（2.3.0 标签提交 `b5e28fd6beac752a2cdcc0ff2f5fdf40e6494fbb`）：`firstTurnExcerpt()` 取第一条自然语言用户提示（`origin === undefined || origin.kind === \'user\'`），助手文本取该轮跨度的 `finalAssistantText`（下一条自然语言用户提示之前，倒序找第一条有非空 text 的 assistant 消息）；用户文本经 `promptMetadataTextFromUserMessage` 组装，过滤掉 Skill 激活段与 `UserPromptSubmit` Hook 段',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/b5e28fd6beac752a2cdcc0ff2f5fdf40e6494fbb/packages/agent-core-v2/src/session/sessionTitle/agentTitlePromptSourceService.ts',
    },
    'kimi-session-metadata-b5e28fd': {
      label:
        'Kimi Code `packages/agent-core-v2/src/session/sessionMetadata/sessionMetadataService.ts` 与 `promptMetadata.ts`（2.3.0 标签提交 `b5e28fd6beac752a2cdcc0ff2f5fdf40e6494fbb`）：`const META_KEY = \'state.json\';`；`setTitle(title)` 写 `{ title, titleKind: \'custom\' }`；`setGeneratedTitleIfUncustomized` 在 `opts?.force !== true && this.data.titleKind === \'custom\'` 时返回 `false`，否则写 `{ title, titleKind: \'generated\' }`，两者都带 `touchUpdatedAt: false`；`applyPromptMetadata(lastPrompt, title)` 只在 `titleKind !== \'custom\' && isUntitled(this.data.title)` 时写 `{ lastPrompt, title, titleKind: \'replaceable\' }`，`isUntitled` 判定为 `title === undefined || title.trim().length === 0 || title === \'New Session\'`，占位标题由 `titleFromPromptMetadataText(text)` 取提示词前 `MAX_TITLE_LENGTH = 200` 字符',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/b5e28fd6beac752a2cdcc0ff2f5fdf40e6494fbb/packages/agent-core-v2/src/session/sessionMetadata/sessionMetadataService.ts',
    },
    'kimi-managed-tools-b5e28fd': {
      label:
        'Kimi Code `packages/oauth/src/managed-tools.ts`（2.3.0 标签提交 `b5e28fd6beac752a2cdcc0ff2f5fdf40e6494fbb`）：文件头注释逐字为 “Managed-platform `/tools` dispatch: POSTs `{method, params}` to `{kimiCodeBaseUrl}/tools` with a Bearer access token” 与 “`chat_title` generates a short session title from a chat excerpt: { "method": "chat_title", "params": { "chat_content": "user: ...\\nassistant: ..." } } → { "title": "..." }”；`kimiCodeToolsUrl(baseUrl)` 返回去掉尾部斜杠后加 `/tools` 的地址，`fetchChatTitle` 默认 `timeoutMs` 为 8000，失败消息为 “Failed to generate session title: HTTP <status>”、“: missing title.”、“: request timed out.” 与 “: request aborted.”',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/b5e28fd6beac752a2cdcc0ff2f5fdf40e6494fbb/packages/oauth/src/managed-tools.ts',
    },
    'kimi-sdk-rpc-v2-b5e28fd': {
      label:
        'Kimi Code `packages/node-sdk/src/sdk-rpc-client-v2.ts`（2.3.0 标签提交 `b5e28fd6beac752a2cdcc0ff2f5fdf40e6494fbb`）：`generateSessionTitle` 的方法注释逐字为 “v2-only (`ISessionTitleService`, session scope). Like `renameSession`, a closed session is resumed, titled, and closed again so generation does not leak a live session. `undefined` means generation was unavailable (no managed OAuth login, no prompt yet, or a custom title is set) — the current title is kept.”；实现把 `force` 与 `source` 透传给 klient 的 `session(id).generateTitle`，`packages/klient/src/contract/session/title.ts` 的契约把 `source` 限定为 `\'user_prompts\' | \'first_turn\' | \'digest\'`',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/b5e28fd6beac752a2cdcc0ff2f5fdf40e6494fbb/packages/node-sdk/src/sdk-rpc-client-v2.ts',
    },
    'kimi-title-pr-4200': {
      label:
        'Kimi Code PR #4200 的合并提交 `5bab748dddaae4b2ac15822d72b83446e5fd7bf4`（“feat(tui): auto-generate session title after the first turn (#4200)”，含后续提交 “feat(tui): gate auto session title behind a tui.toml auto_session_title toggle”）：新增 `.changeset/tui-auto-session-title.md`（标 `"@moonshot-ai/kimi-code": minor`，正文逐字为 “Automatically generate a session title after the first turn and show it as the terminal window title.”），改动 `tui/commands/reload.ts`、`tui/config.ts`、`tui/constant/kimi-tui.ts`、`tui/kimi-tui.ts`、`tui/types.ts` 与中英文 `configuration/config-files.md`；2.3.0 标签提交 `b5e28fd6beac752a2cdcc0ff2f5fdf40e6494fbb` 比该提交超前 18 个提交、落后 0 个，即该功能已随 2.3.0 发布',
      url: 'https://github.com/MoonshotAI/kimi-code/commit/5bab748dddaae4b2ac15822d72b83446e5fd7bf4',
    },
    'kimi-release-230': {
      label:
        'Kimi Code Release [`@moonshot-ai/kimi-code@2.3.0`](https://github.com/MoonshotAI/kimi-code/releases/tag/%40moonshot-ai%2Fkimi-code%402.3.0)（2026-10-21T05:51:43Z 发布，是核对日期最新 Release）；仓库内 `apps/kimi-code/CHANGELOG.md` 的 2.3.0 段 Minor Changes 下该条逐字为 “Automatically generate a session title after the first turn and show it as the terminal window title.”，链接指向 PR #4200 与提交 `5bab748`',
      url: 'https://github.com/MoonshotAI/kimi-code/releases/tag/%40moonshot-ai%2Fkimi-code%402.3.0',
    },
    'kimi-changelog-web-auto-title': {
      label:
        'Kimi Code 官方中文变更记录（2.3.0 标签提交 `b5e28fd6beac752a2cdcc0ff2f5fdf40e6494fbb`）0.36.1（2026-08-14）段逐字为 “- web: AI 自动生成会话标题（实验性）。默认关闭，设置 `KIMI_CODE_EXPERIMENTAL_AUTO_SESSION_TITLE=1`（或实验总开关 `KIMI_CODE_EXPERIMENTAL_FLAG=1`）开启。”；该环境变量在 2.3.0 的源码中已不存在，只留在这两份变更记录里，属 Web Surface 的更早形态',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/b5e28fd6beac752a2cdcc0ff2f5fdf40e6494fbb/docs/zh/release-notes/changelog.md',
    },
  },
  rows: [
    {
      id: 'cmd-login',
      category: 'commands',
      capability: '登录账号',
      description: '在交互会话中启动账号登录或认证选择。',
      values: { claude: '`/login`', codex: '—', qwen: '`/auth` · `/connect` · `/login`', kimi: '`/login`', qoder: '`/login`' },
    },
    {
      id: 'cmd-model',
      category: 'commands',
      capability: '选择模型',
      description: '在当前会话内查看或切换模型。',
      values: { claude: '`/model`', codex: '`/model`', qwen: '`/model`', kimi: '`/model` · `/secondary-model`（别名 `/subagent-model`）', qoder: '`/model`' },
    },
    {
      id: 'cmd-effort',
      category: 'commands',
      capability: '推理强度',
      description: '调整当前模型的推理预算或快速模式。',
      values: { claude: '`/effort` · `/fast`', codex: '`/model` · `/fast`', qwen: '`/effort`', kimi: '—', qoder: '`/effort` · `/fast`' },
    },
    {
      id: 'cmd-permissions',
      category: 'commands',
      capability: '权限设置',
      description: '查看或修改交互审批和工具权限。',
      values: { claude: '`/permissions` · `/allowed-tools`', codex: '`/permissions`', qwen: '`/approval-mode` · `/permissions`', kimi: '`/permission` · `/yolo` · `/auto`', qoder: '`/config`' },
    },
    {
      id: 'cmd-plan',
      category: 'commands',
      capability: '计划模式',
      description: '切换到以分析和计划为主的执行模式。',
      values: { claude: '`/plan`', codex: '`/plan`', qwen: '`/plan`', kimi: '`/plan` · `/plan clear`', qoder: '`/plan`' },
    },
    {
      id: 'cmd-goal',
      category: 'commands',
      capability: '目标管理',
      description: '创建或查看跨多轮持续执行的目标。',
      values: { claude: '`/goal`', codex: '`/goal`', qwen: '`/goal` · 条件：main 分支（尚未发布）起证据检查点连续 3 次停滞自动停止目标', kimi: '`/goal` · 条件：0.37.0 起单条目标不超过 4000 字符', qoder: '`/goal [description] [--turns <N>]` · `/goal status|pause|resume|take|clear`' },
    },
    {
      id: 'cmd-agents',
      category: 'commands',
      capability: 'Subagent 管理',
      description: '查看、创建、切换或重载 Subagent。',
      values: { claude: '`/agents` · `/subtask`', codex: '`/agent` · `/subagents`', qwen: '`/agents manage` · `/agents create`', kimi: '配置文件；`/swarm` 为多代理模式', qoder: '`/agents` · `/agents reload`' },
    },
    {
      id: 'cmd-tasks',
      category: 'commands',
      capability: '任务列表',
      description: '查看或控制后台进程、Agent 或长任务状态。',
      values: { claude: '`/tasks` · `/background`', codex: '`/ps` · `/stop`', qwen: '`/tasks` · 条件：Workflows 开启时 Background Tasks `p` 或 `/workflows p <runId>` 协作暂停/恢复后台 Workflow', kimi: '`/tasks` · `/task`', qoder: '`/tasks`' },
    },
    {
      id: 'cmd-new',
      category: 'commands',
      capability: '新会话',
      description: '清空当前对话或启动新的会话。',
      values: { claude: '`/clear` · `/reset` · `/new`', codex: '`/new` · `/clear`', qwen: '`/clear`', kimi: '`/new` · `/clear`', qoder: '`/clear`' },
    },
    {
      id: 'cmd-resume',
      category: 'commands',
      capability: '恢复会话',
      description: '从已保存的本地或账号会话继续。',
      values: { claude: '`/resume` · `/continue`', codex: '`/resume`', qwen: '`/resume` · `/continue`', kimi: '`/sessions` · `/resume`', qoder: '`/resume`' },
    },
    {
      id: 'cmd-fork',
      category: 'commands',
      capability: '分支会话',
      description: '复制当前上下文并形成独立会话分支。',
      values: { claude: '`/branch` · `/fork`', codex: '`/fork`', qwen: '`/branch` · `/fork`', kimi: '`/fork`', qoder: '—' },
    },
    {
      id: 'cmd-compact',
      category: 'commands',
      capability: '压缩上下文',
      description: '把较长对话压缩成较短的继续执行上下文。',
      values: { claude: '`/compact [instructions]`', codex: '`/compact`', qwen: '`/compress` · `/compress-fast`', kimi: '`/compact [instruction]`', qoder: '`/compact`' },
    },
    {
      id: 'cmd-memory',
      category: 'commands',
      capability: '记忆管理',
      description: '查看、写入或删除跨会话记忆。',
      values: { claude: '`/memory`', codex: '`/memories`', qwen: '`/memory` · `/remember` · `/forget` · `/learn`', kimi: '—', qoder: '`/memory`' },
    },
    {
      id: 'cmd-rewind',
      category: 'commands',
      capability: '回退或检查点',
      description: '回到较早的对话或代码状态。',
      values: { claude: '`/rewind` · `/checkpoint` · `/undo`', codex: '—', qwen: '`/rewind` · `/restore`', kimi: '`/undo [count]`', qoder: '`/rewind`' },
    },
    {
      id: 'cmd-diff',
      category: 'commands',
      capability: '查看 Diff',
      description: '查看当前会话产生的代码差异。',
      values: { claude: '`/diff`', codex: '`/diff`', qwen: '`/diff`', kimi: '—', qoder: '—' },
    },
    {
      id: 'cmd-review',
      category: 'commands',
      capability: '代码审查',
      description: '启动代码或安全审查工作流。',
      values: { claude: '`/review` · `/code-review` · `/security-review`', codex: '`/review`', qwen: '`/review`', kimi: '—', qoder: '`/review`' },
    },
    {
      id: 'cmd-export',
      category: 'commands',
      capability: '导出会话',
      description: '把会话输出为文件或可分享内容。',
      values: { claude: '`/export`', codex: '`/export`（条件：main 分支，尚未发布）', qwen: '`/export html|md|json|jsonl`', kimi: '`/export-md` · `/export-debug-zip`', qoder: '`/export`' },
    },
    {
      id: 'cmd-config',
      category: 'commands',
      capability: '配置',
      description: '打开、查看、导入或诊断配置。',
      values: { claude: '`/config [key=value ...]`（别名 `/settings`）· `--help` 列出可设置键 · key/value 形式也用于 `-p` 与 Remote Control', codex: '`/config` 五分组可搜索偏好面板（条件：main 分支 `cc7ba3360128`，尚未发布，官方文档未列出）· `/debug-config` 只读配置层诊断', qwen: '`/config <key>[=<value>]` 只写用户设置 · `/settings` 编辑器 · `/import-config` 只导入 Claude 的 MCP Server', kimi: '`/settings`（别名 `/config`）打开 TUI 设置面板 · `/update-config` 编辑 `config.toml` 与 `tui.toml`', qoder: '`/settings`（别名 `/config`）打开 Settings Panel' },
    },
    {
      id: 'cmd-status',
      category: 'commands',
      capability: '状态与用量',
      description: '查看账号、模型、配置、上下文或用量状态。',
      values: { claude: '`/status` · `/stats` · `/usage`', codex: '`/status` · `/usage`', qwen: '`/status` · `/stats` · `/usage`', kimi: '`/status` · `/usage` · `/version`', qoder: '`/status` · `/usage` · `/context-window`' },
    },
    {
      id: 'cmd-mcp',
      category: 'commands',
      capability: 'MCP',
      description: '查看或管理 Model Context Protocol 连接。',
      values: { claude: '`/mcp [reconnect|enable|disable]`', codex: '`/mcp [verbose]` · `/mcp login <name>`（rust-v0.161.0 起）', qwen: '`/mcp [desc|nodesc|schema]` · OAuth 在 `/mcp` 对话框内', kimi: '`/mcp` · `/mcp-config login <server-name>`', qoder: '`/mcp` · `/mcp reload` · `/mcp-config`' },
    },
    {
      id: 'cmd-skills',
      category: 'commands',
      capability: 'Skills',
      description: '列出、加载或调用可复用 Agent Skills。',
      values: { claude: '`/skills` · `/reload-skills`', codex: '`/skills`', qwen: '`/skills` · `/<skill-name>`', kimi: 'Skills 目录与内置 Skill 命令', qoder: '`/skills`' },
    },
    {
      id: 'cmd-hooks',
      category: 'commands',
      capability: 'Hooks',
      description: '查看或配置生命周期钩子。',
      values: { claude: '`/hooks`', codex: '`/hooks`', qwen: '`/hooks`', kimi: '—', qoder: '`/hooks`' },
    },
    {
      id: 'cmd-plugins',
      category: 'commands',
      capability: '插件或扩展',
      description: '管理可分发的插件、扩展或应用连接。',
      values: { claude: '`/plugin` · `/reload-plugins`', codex: '`/plugins` · `/apps`', qwen: '`/extensions` · `/extension-creator` · `/reload-plugins`', kimi: '`/plugins`', qoder: '无独立管理命令' },
    },
    {
      id: 'cmd-custom',
      category: 'commands',
      capability: '自定义命令',
      description: '加载用户或项目定义的命令模板。',
      values: { claude: 'Skills 可作为命令调用', codex: 'Skills 可作为命令调用 · 条件：`/presets` 十个数字槽位存提示词或 Slash 命令行（合入 main 尚未发布）', qwen: '`/workflows` · `/<skill-name>`', kimi: 'Skills 可作为命令调用', qoder: '`/commands` · `/workflows`' },
    },
    {
      id: 'cmd-ide',
      category: 'commands',
      capability: 'IDE 或编辑器',
      description: '连接编辑器或查看 IDE 集成状态。',
      values: { claude: '`/ide`', codex: '`/ide-context`', qwen: '`/ide` · `/editor`', kimi: '`/editor`', qoder: '—' },
    },
    {
      id: 'cmd-github',
      category: 'commands',
      capability: 'GitHub 设置',
      description: '初始化产品提供的 GitHub 集成。',
      values: { claude: '`/install-github-app`', codex: 'GitHub/Cloud 连接；无对应 Slash 命令', qwen: '`/setup-github`', kimi: '—', qoder: '`/setup-github`' },
    },
    {
      id: 'cmd-collaboration',
      category: 'commands',
      capability: '多模型或多代理模式',
      description: '启动多任务、多 Agent 或多模型协作入口。',
      values: { claude: '`/advisor` · `/batch`', codex: '`/agent`', qwen: '`/advisor`（v0.21.14 起） · `/arena` · `/batch` · `/coordinate`（v0.21.11 起）', kimi: '`/swarm` · `/tower`（条件：2026-08-21 起重建为与 plan 并列的模式重新开启，实验标志 `KIMI_CODE_EXPERIMENTAL_TOWER` 默认关闭，合入 main 尚未发布）', qoder: '`/quest` · `/batch`' },
    },
    {
      id: 'cmd-remote',
      category: 'commands',
      capability: '远程与跨端',
      description: '把本地会话连接到桌面端、Web 或远程控制入口。',
      values: { claude: '`/remote-control` · `/rc` · `/teleport` · `/desktop`', codex: '`/app`', qwen: '—', kimi: '`/web` · 条件：`/remote-control`（别名 `/rc`）启动 Remote Control 中继（实验开关，main 分支，尚未发布）', qoder: 'Cloud Mode；无对应 Slash 命令' },
    },
    {
      id: 'cmd-keymap',
      category: 'commands',
      capability: 'TUI 快捷键自定义',
      description: '重新映射或自定义终端交互界面的键盘快捷键。',
      values: { claude: '`/keybindings` · `keybindings.json`', codex: '`/keymap` · `tui.keymap` · 双键 chord', qwen: '无自定义入口；仅 `/vim` 与 `general.vimMode`', kimi: '官方文档未列出快捷键自定义', qoder: '无自定义入口；仅 `/vim` 切换' },
    },
    {
      id: 'agent-builtins',
      category: 'subagents',
      capability: '内置 Agent',
      description: '产品预置且可以直接委派的 Agent 类型。',
      values: { claude: 'Explore · Plan · general-purpose', codex: 'default · worker · explorer', qwen: 'general-purpose · Explore', kimi: 'coder · explore · plan', qoder: 'general-purpose · Explore · Plan；另有条件 Agent' },
    },
    {
      id: 'agent-config',
      category: 'subagents',
      capability: '配置格式',
      description: '自定义 Agent 的文件格式。',
      values: { claude: 'Markdown + YAML', codex: 'TOML', qwen: 'Markdown + YAML', kimi: 'Markdown + YAML', qoder: 'Markdown + YAML；`--agents` JSON' },
    },
    {
      id: 'agent-project-scope',
      category: 'subagents',
      capability: '项目级目录',
      description: '随仓库共享的 Agent 定义目录。',
      values: { claude: '`.claude/agents/`', codex: '`.codex/agents/`', qwen: '`.qwen/agents/`', kimi: '`.kimi-code/agents/` · `.agents/agents/`', qoder: '`.qoder/agents/`' },
    },
    {
      id: 'agent-user-scope',
      category: 'subagents',
      capability: '用户级目录',
      description: '当前用户跨项目共享的 Agent 定义目录。',
      values: { claude: '`~/.claude/agents/`', codex: '`~/.codex/agents/`', qwen: '`~/.qwen/agents/`', kimi: '`$KIMI_CODE_HOME/agents/` · `~/.agents/agents/`', qoder: '`~/.qoder/agents/`' },
    },
    {
      id: 'agent-auto',
      category: 'subagents',
      capability: '自动委派',
      description: '主 Agent 能否依据 Agent 描述自动选择并派发任务。',
      values: { claude: '依据 `description`', codex: '依据请求、项目指令或 Skill', qwen: '依据 `description`', kimi: '依据 `description` · `whenToUse`', qoder: '依据 `description`' },
    },
    {
      id: 'agent-explicit',
      category: 'subagents',
      capability: '显式调用',
      description: '用户点名特定 Agent 的入口。',
      values: { claude: '提示词点名 · `/subtask`', codex: '提示词要求 · `/agent` 查看', qwen: '提示词点名', kimi: '提示词点名', qoder: '提示词点名 · `@name`' },
    },
    {
      id: 'agent-context',
      category: 'subagents',
      capability: '独立上下文',
      description: 'Subagent 是否使用与主会话分离的上下文窗口。',
      values: { claude: '是', codex: '是', qwen: '命名 Agent 是', kimi: '是', qoder: '是' },
    },
    {
      id: 'agent-initial-context',
      category: 'subagents',
      capability: '初始上下文',
      description: '创建 Agent 时传入的信息范围。',
      values: { claude: '任务描述；可预载 Skills；Fork 继承完整对话与提示词缓存（v2.1.232 起交互会话默认开启）', codex: '父任务与委派描述', qwen: '命名 Agent 接收任务提示；Fork 可继承最近若干轮或全部', kimi: '只接收任务提示；条件：实验开关开启后 `fork` 参数以调用方对话快照启动（`KIMI_CODE_EXPERIMENTAL_SUBAGENT_FORK`，v2 引擎，合入 main 尚未发布）', qoder: '任务提示；可设 `initialPrompt`' },
    },
    {
      id: 'agent-result',
      category: 'subagents',
      capability: '结果回传',
      description: '子任务完成后如何返回主会话。',
      values: { claude: '返回父会话', codex: '主线程汇总', qwen: '命名 Agent 返回；Fork 不自动回传给父模型', kimi: '返回父会话', qoder: '返回父会话' },
    },
    {
      id: 'agent-background',
      category: 'subagents',
      capability: '后台与并行',
      description: 'Agent 是否能在主会话继续交互时并发执行。',
      values: { claude: '`background: true` 把指定 Subagent 固定在后台 · Fork 模式开启时 Fork 与命名 Subagent 一律后台、Claude 不能请求前台 · 单会话默认 20 个并发上限（`CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS` 可改、ultracode 会话豁免）· `Ctrl+B` 把运行中任务转后台 · 后台 Subagent 的内置工具集比前台小 · 条件：v2.1.302 起 Fork 在 `claude -p`、Agent SDK、桌面端与 VS Code 也默认开启、`CLAUDE_CODE_FORK_SUBAGENT=0` 关闭、`claude mcp serve` 从不提供，同版桌面端与 VS Code 一律后台运行主会话的 Subagent，而这四个 Surface 里 Subagent 自己派生的 Agent 默认前台', codex: '并行派生后等全部结果再合并成一条回复 · `/subagents` 在活跃 Agent 线程间切换查看 · 让 Codex 直接 steer、停止或关闭线程 · `agents.max_concurrent_threads_per_session`（旧别名 `agents.max_threads`）限并发、未设时由 Codex 自选且官方未公布数值 · 官方没有强制前台或后台的开关', qwen: '顶层命名 Agent 默认后台并经完成通知回传 · `run_in_background: false` 改为 inline 前台 · Fork 始终 detached、headless Fork 只走后台 · 通知队列上限 20 条（headless CLI 不受此限）· 条件：内置 `claude-code` 与 `codex` 外部执行器默认前台、需显式 `run_in_background: true`；调用方自有 `working_dir` 的匿名派生固定前台并拒绝显式后台请求 · 官方文档没有并发 Subagent 上限', kimi: '`Agent` 的 `run_in_background` 默认 `false`：前台由父 Agent 等待完成，后台立即返回任务 ID 并在完成时以合成 User 消息回到 main agent · `Ctrl+B` 把运行中的前台子 Agent 转后台 · `/tasks`（别名 `/task`）浏览后台任务 · `AgentSwarm` 至多 128 个 subagent 且等全部完成后返回聚合报告 · `[background] max_running_tasks`（`KIMI_CODE_BACKGROUND_MAX_RUNNING_TASKS`）限同时运行的后台任务数、不设即无上限 · `KIMI_CODE_AGENT_SWARM_MAX_CONCURRENCY` 限 swarm ramp 阶段并发', qoder: '`background` frontmatter 决定默认后台、需先启用后台 Subagent 会话 · 后台先返回启动结果、主会话无其他工作时显示等待态、完成后结果自动回主会话 · `/tasks` 查看状态与结果或在运行中停止 · 独立 Subagent 可并行派发 · `QODER_CLI_MAX_CONCURRENT_SUBAGENTS` 设并发上限（CLI 1.1.31 起）· 官方未公布启用后台 Subagent 会话的开关与默认并发数' },
    },
    {
      id: 'agent-model',
      category: 'subagents',
      capability: 'Agent 单独选模型',
      description: '单个 Agent 能否覆盖主会话模型。',
      values: { claude: '`model`：`sonnet`/`opus`/`haiku`/`fable` · 完整模型 ID · `inherit`；解析顺序为每次调用 `model` 参数 → frontmatter → `CLAUDE_CODE_SUBAGENT_MODEL` → 主会话模型；`CLAUDE_CODE_SUBAGENT_MODEL_FORCE=1` 强制统一（v2.1.257）；v2.1.296 另加只统一 workflow agent 的 `CLAUDE_CODE_WORKFLOW_SUBAGENT_MODEL`', codex: '`model`；解析顺序为显式 spawn 值 → `agents.default_subagent_model` → 父会话值，Agent 文件里写了 `model` 时文件值最后覆盖', qwen: '`model`: inherit · fast · modelId · authType:modelId · `modelGrades` 名称；`agents.builtin.exploreModel` 单独覆盖内置 Explore', kimi: '`[secondary_model]` 池别名 · 保留值 `"primary"` · `force = true` 固定到 `default_model`；模型池自 0.42.0 起始终开启，无需开关', qoder: '`model`：任意模型名或 `inherit`/`auto`/`lite`/`efficient`/`performance` 别名；省略即 `inherit`' },
    },
    {
      id: 'agent-effort',
      category: 'subagents',
      capability: 'Agent 推理强度',
      description: '单个 Agent 能否设置独立的推理预算。',
      values: { claude: '`effort`；Agent 工具调用参数 `effort`（v2.1.292）', codex: '`model_reasoning_effort` · `[agents] default_subagent_reasoning_effort` 全局默认', qwen: '未确认独立字段', kimi: '`[secondary_model] default_effort` 节级档位 · `[models.<alias>.overrides] default_effort` 变体；Agent 文件 frontmatter 无 effort 字段', qoder: '`effort`' },
    },
    {
      id: 'agent-tools',
      category: 'subagents',
      capability: '工具白名单',
      description: '限制 Agent 可调用的工具集合。',
      values: { claude: '`tools`', codex: 'Agent 配置、沙箱与会话工具', qwen: '`tools`；Fork 可用 `fork_tools` 限制执行', kimi: '`tools`', qoder: '`tools`' },
    },
    {
      id: 'agent-deny-tools',
      category: 'subagents',
      capability: '工具黑名单',
      description: '从默认工具集合中排除指定工具。',
      values: { claude: '`disallowedTools`', codex: '未确认独立字段', qwen: '`disallowedTools`', kimi: '`disallowedTools`', qoder: '`disallowedTools`' },
    },
    {
      id: 'agent-mcp',
      category: 'subagents',
      capability: 'Agent MCP 范围',
      description: '单个 Agent 能否指定 MCP Server 或 MCP 工具范围。',
      values: { claude: '`mcpServers`；工具规则可继续收窄', codex: '`mcp_servers`', qwen: '`mcpServers`；工具规则可继续收窄', kimi: '通过工具列表控制', qoder: '`mcpServers`' },
    },
    {
      id: 'agent-skills',
      category: 'subagents',
      capability: 'Agent 预载 Skills',
      description: '创建 Agent 时自动装载指定 Skill。',
      values: { claude: '`skills`', codex: '`skills.config`', qwen: '可调用 Skill；未确认独立预载字段', kimi: '可调用 Skill；未确认独立预载字段', qoder: '`skills`' },
    },
    {
      id: 'agent-hooks',
      category: 'subagents',
      capability: 'Agent 独立 Hooks',
      description: '单个 Agent 能否配置自己的生命周期 Hooks。',
      values: { claude: '`hooks`', codex: '未确认独立字段；Hooks 为全局 `/hooks`', qwen: '`hooks`；v1 运行期按会话注册', kimi: '无独立字段；Hooks 在全局 `config.toml`', qoder: '`hooks`' },
    },
    {
      id: 'agent-memory',
      category: 'subagents',
      capability: 'Agent 持久记忆',
      description: 'Subagent 是否有可配置的跨任务记忆。',
      values: { claude: '`memory`', codex: '独立字段未确认', qwen: '未确认独立字段', kimi: '未确认独立字段', qoder: '`memory`' },
    },
    {
      id: 'agent-permission',
      category: 'subagents',
      capability: 'Agent 权限模式',
      description: '单个 Agent 能否覆盖默认审批或沙箱模式。',
      values: { claude: '`permissionMode`', codex: '`sandbox_mode`；审批受会话控制', qwen: '`approvalMode`；父会话宽松模式优先', kimi: '继承主会话；无独立字段', qoder: '`permissionMode`；省略时继承' },
    },
    {
      id: 'agent-nesting',
      category: 'subagents',
      capability: '嵌套派生',
      description: 'Subagent 能否继续创建下一级 Agent。',
      values: { claude: '默认最多 3 层；可限制可派生 Agent', codex: '当前 Subagent 页面未确认', qwen: '命名 Agent 受工具规则控制；Fork 禁止递归 Fork', kimi: '内置 `coder` 默认不可嵌套（0.35.0 起移除 `Agent`/`AgentSwarm`）；自定义 Agent 用 `subagents`，显式列 `Agent` 工具可恢复', qoder: 'Agent 工具可嵌套并支持 `Agent(name)`' },
    },
    {
      id: 'agent-worktree',
      category: 'subagents',
      capability: 'Worktree 隔离',
      description: '每个 Agent 是否能在独立 Git Worktree 中修改代码。',
      values: { claude: '`isolation: worktree`', codex: 'Subagent 页面未确认', qwen: 'Agent 调用可设 `isolation: "worktree"`；Fork 不支持', kimi: 'Agent 页面未确认', qoder: '`isolation: worktree`' },
    },
    {
      id: 'agent-limits',
      category: 'subagents',
      capability: '轮数与超时限制',
      description: 'Agent 定义能否直接指定最大轮数和超时。',
      values: { claude: '`maxTurns`；全局并发与嵌套上限；超时字段未确认', codex: '`agents.max_concurrent_threads_per_session`；轮数和超时字段未确认', qwen: '`maxTurns`；超时字段未确认', kimi: '全局 `[subagent] timeout_ms`（默认 2 h）；AgentSwarm 改用独立 `[swarm] timeout_ms`（main 分支，尚未发布）；Agent 定义无独立字段', qoder: '`maxTurns` · `timeoutMins`' },
    },
    {
      id: 'security-approval',
      category: 'security',
      capability: '交互审批',
      description: '危险或越界操作能否在执行前请求用户确认。',
      values: { claude: '支持', codex: '支持', qwen: '支持', kimi: '支持 · 三条内置 guard 询问策略可由 `[permission] dangerous_command_guard` 整体关闭', qoder: '支持' },
    },
    {
      id: 'security-plan',
      category: 'security',
      capability: '只读或计划模式',
      description: '限制 Agent 先分析、后由用户决定是否执行。',
      values: { claude: 'Plan Mode', codex: '`/plan` 与 `read-only`', qwen: '`plan` approval mode', kimi: '`/plan`', qoder: '`/plan` 独立工作状态' },
    },
    {
      id: 'security-auto-edit',
      category: 'security',
      capability: '自动接受编辑',
      description: '允许文件编辑自动执行，同时保留其他操作审批。',
      values: { claude: '`acceptEdits`', codex: '`workspace-write` 配合 `on-request`', qwen: '`auto-edit`', kimi: '无仅编辑模式；`/auto` 范围更广', qoder: '`accept_edits` · `acceptEdits`' },
    },
    {
      id: 'security-auto-review',
      category: 'security',
      capability: '审批自动审查',
      description: '需审批的操作由产品内置的分类器或审查代理自动裁决，而不是等待用户确认。',
      values: { claude: '`auto` 权限模式 · classifier 审查 · `CLAUDE_CODE_AUTO_MODE_MODEL` 指定客户端分类器模型', codex: '`approvals_reviewer = "auto_review"` · `--approve-for-me`', qwen: 'Auto 审批模式 · LLM 分类器', kimi: '无同类机制；`/auto` 为全部审批自动放行', qoder: '`auto` 权限模式 · AI 分类器' },
    },
    {
      id: 'security-bypass',
      category: 'security',
      capability: '跳过审批',
      description: '允许工具调用不逐次询问用户。',
      values: { claude: '`bypassPermissions`', codex: '`approval_policy = "never"`；全放开需 `danger-full-access`', qwen: '`yolo`', kimi: '`/yolo`', qoder: '`bypass_permissions` · `yolo`' },
    },
    {
      id: 'security-filesystem',
      category: 'security',
      capability: '文件系统隔离',
      description: '在操作系统或进程边界限制可读写路径。',
      values: { claude: 'Bash OS 沙箱（macOS Seatbelt · Linux 与 WSL2 bubblewrap）+ 文件权限规则；Linux 嵌套场景另有 `sandbox.enableWeakerNestedSandbox`（改挂容器已有 `/proc`）与 v2.1.305 起的 `sandbox.allowNestedUserNamespaces`（放行沙箱内用户命名空间）', codex: '`read-only` · `workspace-write` · `danger-full-access`；条件：Linux 与 WSL2 用 bubblewrap（`PATH` 上的 `bwrap`，否则退回需要非特权用户命名空间的捆绑 helper），原生 Windows 另有 `[windows] sandbox` 的 `elevated`/`unelevated`/`mxc` 后端', qwen: '条件：Linux 工具执行沙箱 `tools.executionSandbox`（`bwrap`/`landlock` · `read-only`/`workspace-write`，v0.24.4 起）· 整 CLI 的 Seatbelt 或容器 Sandbox；两者都默认关闭', kimi: '文件工具权限；2.3.0 仓库树无任何 OS 沙箱实现，OS 沙箱未确认', qoder: '路径权限规则；官方 CLI 文档在核对日期已无 Sandbox 页与 `sandbox.*` 键，OS 沙箱未确认' },
    },
    {
      id: 'security-network',
      category: 'security',
      capability: '网络隔离',
      description: '单独限制 Agent 进程访问网络。',
      values: { claude: 'Sandbox 域名代理与 Allow/Deny；`strictAllowlist` 直接拒绝未列主机', codex: '`workspace-write` 默认断网；可单独启用与限域 · 条件：原生 Windows 沙箱用防火墙规则或环境级断网，MXC 只放行回环', qwen: 'Seatbelt Profile 与代理；依配置', kimi: '网络工具权限；OS 网络隔离未确认', qoder: 'Web 工具规则；SDK 条件网络 Sandbox' },
    },
    {
      id: 'security-credentials',
      category: 'security',
      capability: '凭据保护',
      description: '限制 Agent 执行的命令读取凭据文件与敏感环境变量，并可由出站代理注入真实值。',
      values: { claude: '`sandbox.credentials.files` · `envVars` `deny`/`mask` · `extract`/`decode: "jwt"` 打码 · `awsPairs`/`sigv4` SigV4 重签名 · 出站代理注入', codex: '`shell_environment_policy` 过滤子进程环境变量；无文件打码', qwen: '官方沙箱文档未列凭据保护；容器挂载 `~/.qwen`', kimi: '未确认 OS 沙箱；文档未列凭据保护字段', qoder: '本地 CLI/SDK 文档未列同类凭据保护' },
    },
    {
      id: 'security-trust',
      category: 'security',
      capability: '项目目录信任',
      description: '首次进入项目时确认是否信任仓库配置与指令。',
      values: { claude: 'Workspace Trust', codex: 'Project Trust；未信任时跳过项目 `.codex/`', qwen: '`/trust`；功能默认关闭', kimi: '条件：v2 引擎启动信任提示；项目 MCP 门禁', qoder: 'Trust Directories；未信任时回退 `default`' },
    },
    {
      id: 'security-noninteractive',
      category: 'security',
      capability: '非交互审批',
      description: '没有交互界面时遇到需审批操作的处理方式。',
      values: { claude: '未预授权操作中止；`dontAsk` 拒绝', codex: '无法展示的新审批返回错误', qwen: '无法确认的工具调用拒绝；可预设 mode/rules', kimi: '`-p` 固定使用 Auto；静态 Deny 仍生效', qoder: '`ask` 自动变为 `deny`' },
    },
    {
      id: 'session-resume',
      category: 'sessions',
      capability: '恢复会话',
      description: '从已有会话继续对话和任务状态。',
      values: { claude: '`/resume` · `--continue`', codex: '`/resume` · `codex exec resume`', qwen: '`/resume` · `/continue`', kimi: '`/sessions` · `/resume`', qoder: '`/resume`' },
    },
    {
      id: 'session-live-list',
      category: 'sessions',
      capability: '运行中会话列表',
      description: '列出本机当前正在运行的交互式会话，区别于已保存的历史会话。',
      values: { claude: 'Agent view 与 `claude agents --json` 列出运行中会话；会话选择器以 `bg` 标记后台会话', codex: '`codex agents` · `/agents` · `Alt+A` 列出共享 Daemon 加载的运行中会话（rust-v0.149.0 起）', qwen: '`qwen sessions ps` · `--json` JSON Lines（v0.21.14 起）', kimi: '`/sessions` 仅列出已保存历史会话；官方文档未列出运行中会话入口', qoder: '`/resume` 恢复历史会话；官方命令表未列出运行中会话列表' },
    },
    {
      id: 'session-branch',
      category: 'sessions',
      capability: '会话分支',
      description: '从当前上下文复制出独立会话。',
      values: { claude: '`/branch` · `--fork-session`', codex: '`/fork` · `codex exec fork`（条件：main 分支，尚未发布）', qwen: '`/branch` · 条件：Web Shell 可从任意已完成 Assistant 响应分支（v0.21.13 起）', kimi: '`/fork` · 条件：fork 后打印 `kimi --resume` 命令并复制到剪贴板（main 分支，尚未发布）', qoder: 'SDK：`resume` + `forkSession`' },
    },
    {
      id: 'session-naming',
      category: 'sessions',
      capability: '会话命名',
      description: '为会话设置便于查找的标题。',
      values: { claude: '`claude -n <name>` · `/rename <name>` · 选择器 `Ctrl+R` · 未命名会话由 small/fast 模型生成标题且标题可作恢复句柄', codex: '`/rename <name>`（不带参数打开命名提示）· `/new <name>` 创建时命名 · 名称可作 `codex archive|unarchive|delete` 的句柄', qwen: '`/rename [--auto] [<name>]` · `/tag` · 每记录一个助手回合后由 fast model 自动生成（`QWEN_DISABLE_AUTO_TITLE` 关闭）', kimi: '`/title [<text>]` · `/rename` · 2.3.0 起首个完成回合后自动生成（`tui.toml` 与 `config.toml` 的 `auto_session_title` 默认 `true`、需 Kimi OAuth 登录）', qoder: '`qoder -n <name>` · `/rename`（不带参数时按当前对话自动生成，CLI 1.1.52 起）· 名称保存位置与长度上限未公开' },
    },
    {
      id: 'session-compress',
      category: 'sessions',
      capability: '手动压缩',
      description: '主动总结当前上下文以释放窗口。',
      values: { claude: '`/compact [instructions]`；自动窗口 `/autocompact <tokens 或 auto>` · `autoCompactWindow`（v2.1.296 起 Subagent frontmatter 可单独设，只认 100000–1000000 的纯整数）· `CLAUDE_CODE_AUTO_COMPACT_WINDOW` 优先于命令、旗标与设置，v2.1.304 起也接受 `k`/`M` 后缀，取值越界或不可用时告警并夹到 100K/1M 或整个忽略 · 空闲压缩 `idleCompaction`（200K token 且约 54 分钟空闲，在一小时缓存到期前压缩；v2.1.302 起 `/config` 有 Idle compaction 行）', codex: '`/compact`；阈值 `model_auto_compact_token_limit` 与统计口径 `model_auto_compact_token_limit_scope`；无空闲或缓存过期触发', qwen: '`/compress [instructions]` · `/compress-fast`；阈值 `context.autoCompactThreshold`（默认 0.85）· `context.clearContextOnIdle` 空闲 60 分钟清理旧工具结果', kimi: '`/compact [instruction]`；`loop_control.reserved_context_size` 触发自动压缩 · `tui.toml` 的 `cache_expiry_hint` 只提醒、不自动压缩', qoder: '`/compact [instructions]`；自动压缩阈值未公开' },
    },
    {
      id: 'session-context-usage',
      category: 'sessions',
      capability: '上下文占用',
      description: '查看当前会话上下文窗口或 token 使用情况。',
      values: { claude: '`/context`', codex: '`/status`', qwen: '`/context` · `/context detail`', kimi: '`/usage` · 条件：resume 后恢复实测上下文占用（main 分支，尚未发布）', qoder: '未确认独立占用视图' },
    },
    {
      id: 'session-export',
      category: 'sessions',
      capability: '会话导出',
      description: '将会话保存为 Markdown、JSON 或其他文件。',
      values: { claude: '`/export [filename]`', codex: '`/export` · Markdown · 剪贴板（条件：main 分支，尚未发布）', qwen: 'HTML · Markdown · JSON · JSONL', kimi: 'Markdown · 诊断 ZIP', qoder: '`/export [filename]`' },
    },
    {
      id: 'session-checkpoint',
      category: 'sessions',
      capability: '检查点与回退',
      description: '恢复到早先的对话或代码状态。',
      values: { claude: '`/rewind` · `/checkpoint` · `/undo`', codex: 'CLI 命令表未列出', qwen: '`/rewind`（别名 `/rollback`）· `/restore`（条件：文件检查点启用，交互模式默认开启）', kimi: '`/undo [count]`（不回滚代码，仅空闲可用）', qoder: '`/rewind`（对话、文件或两者）· `general.fileCheckpointing.enabled` 默认 `true` · SDK `rewindFiles()`' },
    },
    {
      id: 'session-memory',
      category: 'sessions',
      capability: '跨会话记忆',
      description: '保存项目或用户信息供后续会话使用，或从外部记忆服务按需检索。',
      values: { claude: '`CLAUDE.md` + Auto memory', codex: '条件：`/memories`；默认关闭', qwen: '`QWEN.md` + Auto-memory（`pinned/` 保护目录、`memory.enableStructuredRecall` 结构化召回与 `search_memory`）· 条件：`memory.mem0` 内置外部 Mem0 记忆服务，自动注册 `external-context` MCP、默认只读 `context_search`（v0.25.0 起）', kimi: '`AGENTS.md`；自动记忆未列出', qoder: '`AGENTS.md`；条件：Auto-memory' },
    },
    {
      id: 'session-messaging',
      category: 'sessions',
      capability: '跨会话消息',
      description: '发现其他会话、后台 Agent 或队友并互相发送消息。',
      values: { claude: '`/list-agents` · `/peers` · `SendMessage`/`ListAgents` · `@` 会话名提及 · `crossSessionInbound` · 原生 Windows（v2.1.239 宣布可用）', codex: '`codex queue --thread <UUID|精确会话名> --message <文本>` · 经 app-server `thread/queue/add` 投递 · `--remote` 指向远程 app server（rust-v0.149.0 引入）；条件：`codex_tui` 任务工具列出、读取、等待、发消息、创建、派生其他任务（合入 main 尚未发布）；条件：TUI 输入框 `@` 任务提及提交为其他任务的实时引用、模型经 `read_thread` 读取（合入 main 尚未发布）', qwen: '`send_message` · `list_agents`（限当前会话后台 Agent）· 条件：同机会话入站消息（`agents.crossSessionMessaging` 默认关闭、`/peers` 审查保留消息，v0.22.2 起）', kimi: '官方命令表未列出会话间消息', qoder: '条件：`QODER_FEATURE_CROSS_SESSION=1` 同机会话互发消息（beta，仅 macOS 与 Linux，CLI 1.1.19 起）· `ListAgents`/`SendMessage` · `/peers` 与 `/peers approve|deny <id>` · `@` 对等会话提及（CLI 1.1.25 起）· `security.crossSessionInbound` · `general.dialogExpiry`；条件：`QODER_AGENT_TEAMS=1` Agent Teams `SendMessage`（beta，单会话内）' },
    },
    {
      id: 'session-schedule',
      category: 'sessions',
      capability: '定时任务与循环',
      description: '按 cron 表达式、固定间隔或模型自定节奏，把提示词在未来时刻重新注入会话。',
      values: { claude: '`/loop [interval] [prompt]`（bundled Skill，别名 `/proactive`）· `CronCreate`/`CronList`/`CronDelete`/`ScheduleWakeup` · `.claude/loop.md` 与 `~/.claude/loop.md` · 单会话上限 50 个、周期任务 7 天后末次触发再自删 · `CLAUDE_CODE_DISABLE_CRON=1` 关闭 · 条件：`/schedule`（别名 `/routines`）创建云端 Routines、桌面端另有独立定时任务', codex: 'CLI 与 IDE 扩展都不提供 Scheduled 管理界面；条件：ChatGPT 桌面 App 的 Scheduled（RFC 5545 RRULE、`codex://automations` 深链接、`features.in_app_local_automation` 开关、在本地项目或独立 Worktree 执行）与 ChatGPT Web/移动端的 Scheduled（可按 Gmail、Slack、GitHub 事件触发）', qwen: '`/loop [interval] [prompt] | list | clear`（bundled Skill）· `cron_create`/`cron_list`/`cron_delete`/`loop_wakeup` · `.qwen/loop.md` 与 `~/.qwen/loop.md` · 默认只在内存，`durable: true` 才写入 `~/.qwen/tmp/<project-hash>/scheduled_tasks.json` · 上限 50 个、默认 7 天过期（`experimental.cronRecurringMaxAgeDays`，`0` 关闭过期）· `experimental.cron: false` 或 `QWEN_CODE_DISABLE_CRON=1` 关闭', kimi: '`CronCreate`/`CronList`/`CronDelete`（无 Slash 命令，官方工具说明明确用户没有 `/cron` 自助入口）· 单会话上限 50 个、`prompt` ≤8 KiB、周期任务满 7 天以 `stale` 末次触发后自删 · `[cron]` 配置节与 `KIMI_DISABLE_CRON=1`', qoder: '`/loop [interval] [flags] <prompt>` · `/crontab` 管理面板 · `.qoder/loop.md` · 持久任务写入 `<project>/.qoder/scheduled_tasks.json`、会话内任务只在内存 · 上限 50 个、周期任务 7 天过期 · `--durable`/`--permanent` 免自动过期 · `--max-turns`/`--max-credits` 预算上限' },
    },
    {
      id: 'extension-mcp',
      category: 'extensions',
      capability: 'MCP 客户端',
      description: '连接外部 Model Context Protocol Server。',
      values: { claude: '`/mcp` · stdio/HTTP/SSE/WS', codex: '`/mcp` · STDIO/HTTP', qwen: '`/mcp` · stdio/HTTP/SSE', kimi: '`/mcp` · `/mcp-config`', qoder: '`/mcp` · stdio/HTTP/SSE/WS' },
    },
    {
      id: 'extension-skills',
      category: 'extensions',
      capability: 'Agent Skills',
      description: '从项目或用户目录加载可复用指令与资源。',
      values: { claude: '`/<skill-name>` · `.claude/skills/`', codex: '`$skill` · `.agents/skills/`', qwen: '`/<skill-name>` · `.qwen/skills/` · `skills.disabledLevels`', kimi: '`/skill:<name>` · `.kimi-code/skills/` · 条件：单条提示词多 Skill 激活（main 分支，尚未发布）', qoder: '`/<skill-name>` · `.qoder/skills/`' },
    },
    {
      id: 'extension-skill-generation',
      category: 'extensions',
      capability: 'Skill 生成与维护',
      description: '从知识源或成功任务自动生成 Skill，并按活跃度清理、归档或恢复。',
      values: { claude: '`/run-skill-generator` · `/verify` 记录配方；无 `/learn`', codex: 'Record & Replay · `$skill-creator` · `$skill-installer`', qwen: '`/learn` · Auto Skill · `/curator` 归档', kimi: '手动编写 `SKILL.md`；无生成与维护', qoder: '手动编写 `SKILL.md`；无生成与维护' },
    },
    {
      id: 'extension-hooks',
      category: 'extensions',
      capability: '生命周期 Hooks',
      description: '在工具调用、会话或 Agent 生命周期节点运行自定义逻辑。',
      values: { claude: '`/hooks` · 多类 Handler · v2.1.287 起插件 `hooks/hooks.json` 的 `modules` 注册进程内 JS/TS 函数 Hook（mod），可改写事件并绘制界面 · v2.1.295 起 command 与 HTTP Hook 可设 `onFailure: "block"`，启动失败、超时或意外退出码改为阻断 · v2.1.302 起 prompt 与 agent Hook 同一事件至多 12 个并发、其余排队', codex: '`/hooks` · command 同步或 `async: true` 后台执行（后台每会话至多 8 个并发）· 条件：`mcp_tool` Handler 引擎执行随 rust-v0.148.0 发布，会话运行时接入仍在 main 分支（提交 `87070a77925c`，尚未发布）· 条件：main 分支提交 `70b3bb6d8814` 新增观察型 `PreModelRequest`/`PostModelRequest`，输出只作诊断（尚未发布）· 失败、超时与畸形响应默认放行，只有 `PermissionRequest` 保留字段 fail closed', qwen: '`/hooks` · command/HTTP/prompt · 默认并行，`sequential: true` 强制顺序，`async: true` 占 10 个并发槽 · 退出码 2 阻断，其他非零、HTTP 非 2xx 与超时放行；无 `onFailure` 一类失败开关 · headless 下调用命令或 Skill 的输入在展开前先过 `UserPromptSubmit`（v0.25.3 起稳定通道包含）· 条件：`experimental.mods` 开启后插件 `hooks/hooks.json` 的 `modules` 注册隔离 QuickJS 函数模块（mod，Claude Code Mod API 子集），交互终端与 headless 注册 Slash 命令、拦截生命周期并写 transcript 日志，`tool.call`/`tool.check` 工具拦截仅 headless（v0.25.3 起）', kimi: '`config.toml` · command · 同一事件命中的多条规则并行、`command` 完全相同只运行一次，官方未给并发上限 · 退出码 2 阻断，其他非零、超时与崩溃按 fail-open 放行；无 `onFailure` 一类失败开关', qoder: '`/hooks` · `settings.json` · command/HTTP/prompt/agent · 组级或条目级 `async` 与 `asyncRewake` 后台运行 · 退出码 2 阻断，其他非零放行；无 `onFailure` 一类失败开关；官方没有公布同事件的执行顺序与并发数' },
    },
    {
      id: 'extension-plugins',
      category: 'extensions',
      capability: '插件分发',
      description: '把 Skills、Agents、Hooks 或 MCP 配置作为一个包分发。',
      values: { claude: '`/plugin`（别名 `/plugins` · `/marketplace`）· `claude plugin marketplace add|list|update|remove` · 内置官方市场 `claude-plugins-official`', codex: '`/plugins` 按市场分页签 · `codex plugin add|list|remove` · `codex plugin marketplace add|list|upgrade|remove` · 与 ChatGPT 共用同一公开插件目录', qwen: '`/extensions manage` 的 Discover/Installed/Sources 三页签 · `qwen extensions sources add|list|update|remove` · `install <marketplace>:<plugin>` · 可安装 Qoder 插件 · Agent Plugins v1 原生加载（条件：v0.21.11-preview.0 预览通道）', kimi: '`/plugins` 的 Installed/Official/Curated/Custom 四页签 · `/plugins marketplace [source]` · 内置默认市场 · `KIMI_CODE_PLUGIN_MARKETPLACE_URL` 覆盖', qoder: '`qoder plugins`（别名 `plugin`）· `qoder plugins marketplace add|list|update|remove` · `/plugins`（别名 `/plugin`）· `/marketplace`（别名 `/market`，受功能开关限制）· CLI 1.1.66 起内置 `qoder-plugins` 市场' },
    },
    {
      id: 'extension-custom-commands',
      category: 'extensions',
      capability: '自定义 Slash 命令',
      description: '从文件加载自定义命令提示模板。',
      values: { claude: '`.claude/commands/*.md`（官方称 “the older format”，已并入 Skills）· Skills', codex: 'Skills；`/prompts:*` 已弃用 · 条件：`/presets` 把提示词或 Slash 命令行存进用户配置 `tui.presets.<0-9>` 十个数字槽位，`0`–`9` 直接召回、`leader p` 或 `/presets` 开菜单（合入 main 尚未发布）', qwen: '`.qwen/commands/*.md`（TOML 已弃用、检测到会提示迁移）· Skills', kimi: 'Plugin `commands/*.md` · Skills · 无独立用户或项目 Command 目录', qoder: '`.qoder/commands/*.md` · `~/.qoder/commands/*.md`（用户级覆盖项目级）' },
    },
    {
      id: 'extension-output-styles',
      category: 'extensions',
      capability: '输出风格',
      description: '以预设或自定义 Markdown 修改系统提示词，改变回复的角色、语气、冗长度或结构。',
      values: { claude: '`/config` Output style · `outputStyle` · `.claude/output-styles/` 自定义 · v2.1.237 新增内置 Concise', codex: '条件：`personality`（`none`/`friendly`/`pragmatic`）· `/personality`；仅适用宣告 `supportsPersonality` 的模型', qwen: '官方设置与扩展文档未列出输出风格', kimi: '官方配置文档未列出输出风格；`[identity]` 仅改自称与协议标识', qoder: '`outputStyle` · `--output-style` · `~/.qoder/output-styles/` 自定义 · 插件风格' },
    },
    {
      id: 'extension-project-instructions',
      category: 'extensions',
      capability: '项目指令文件',
      description: '随仓库保存的长期 Agent 工作约定。',
      values: { claude: '`CLAUDE.md` · `.claude/rules/`', codex: '`AGENTS.md` · `AGENTS.override.md`', qwen: '`QWEN.md` · `AGENTS.md`', kimi: '`AGENTS.md`', qoder: '`AGENTS.md` · `.qoder/rules/`' },
    },
    {
      id: 'extension-ide',
      category: 'extensions',
      capability: 'IDE 连接',
      description: '让 CLI 获取当前编辑器文件或选择区上下文。',
      values: { claude: '`/ide` · VS Code IDE MCP', codex: 'IDE 扩展 · `/ide-context`', qwen: '`/ide` · VS Code Companion', kimi: '`kimi acp`', qoder: '`qodercli --acp`' },
    },
    {
      id: 'extension-tool-discovery',
      category: 'extensions',
      capability: '工具延迟声明与按需发现',
      description: '把部分工具的完整声明撤出每轮请求，改由模型用发现工具按需取回。',
      values: { claude: 'MCP 工具默认全部延迟 · 内置 `ToolSearch` · `ENABLE_TOOL_SEARCH` 取 `true`/`auto`/`auto:N`/`false` · Server `alwaysLoad` 与工具 `_meta["anthropic/alwaysLoad"]` 豁免', codex: 'MCP 工具始终延迟 · 内置 `tool_search`（BM25，`limit` 默认 8）· `tool_search` 与 `tool_search_always_defer_mcp_tools` 开关已移除、没有关闭入口', qwen: '`tools.toolSearch.enabled` 默认 `true` · `tool_search` + `tool_call` 桥 · MCP、`agent`/`list_agents`/Goal、`task_stop`、`monitor`、cron 默认延迟 · `tools.eager`/`tools.visible`/`tools.toolSearch.threshold` 调节', kimi: '条件：`tool-select` 实验标志 + 模型声明 `dynamically_loaded_tools` · Server 条目 `deferred` 或全局 `[mcp] default_deferred`（默认 `false`、Server 字段优先、连接时固化）· 内置 `select_tools` 按精确名加载', qoder: '条件：`mcp.lazyLoad` 默认 `false` 且需重启，或 `QODER_MCP_LAZY=1` · 开启后只暴露 `mcp_list`／`mcp_get`／`mcp_call` 三个 Meta Tools · 只覆盖 MCP 工具' },
    },
    {
      id: 'execution-files',
      category: 'execution',
      capability: '文件读写',
      description: '读取、创建和修改工作区文件。',
      values: { claude: '`Read` · `Edit` · `Write` · 单次读取默认上限 25,000 token、整文件超 256 KB 拒绝 · v2.1.296 起 `allow_large: true` 按剩余上下文窗口一次读完 · 官方工具参考记录读后再改要求与模型差异', codex: '无专用文本读取工具，读取经 `exec_command`/`write_stdin`（`max_output_tokens` 默认 10000 token）· 图片用 `view_image` · 保留输出硬上限 1 MiB · `apply_patch` 无条件保留原换行（rust-v0.162.0 起）', qwen: '`read_file` · `edit` · `write_file` · 默认分页 1000 行加 25000 字符（`tools.truncateToolOutputLines`/`truncateToolOutputThreshold`，设 `-1` 关闭且需重启）· 没有每次调用放大入口 · 超限输出落盘可用 `read_file` 取回', kimi: '`Read` · `Edit` · `Write` · 字符额度默认 100000、单次可申请到 500000（`[read] default_max_chars`/`max_chars`）· 2.1.1 官方文档已记录写前读与磁盘变化拒绝', qoder: '`Read` · `Edit` · `Write` · 官方只写「文件过大时读取聚焦片段」，未公布行数、字节或字符上限，也没有一次读完入口' },
    },
    {
      id: 'execution-shell',
      category: 'execution',
      capability: 'Shell 执行',
      description: '运行构建、测试、Git 和系统命令。',
      values: { claude: '`Bash` · 条件：Linux Bash 命令内存 cgroup 限制（`CLAUDE_CODE_TOOL_MEMORY_LIMIT`，v2.1.233 引入）', codex: '统一 PTY Shell', qwen: '`run_shell_command`', kimi: '`Bash`', qoder: '`Bash` · `!` 模式' },
    },
    {
      id: 'execution-search',
      category: 'execution',
      capability: '代码搜索',
      description: '按文件名、文本或符号搜索代码库。',
      values: { claude: '`Glob` · `Grep` · `LSP`', codex: '内置搜索 · Shell/`rg`', qwen: '`glob` · `grep_search` · `LSP`；条件：`list_directory` 默认关闭，`tools.listDirectory.enabled` 启用（v0.22.0 起）', kimi: '`Glob` · `Grep`', qoder: '`Glob` · `Grep`' },
    },
    {
      id: 'execution-background',
      category: 'execution',
      capability: '后台任务',
      description: '在不阻塞主交互的情况下执行命令或 Agent。',
      values: { claude: '`/background` · `/tasks` · `Monitor`', codex: '`/ps` · `/stop`', qwen: '`is_background` · `Ctrl+B` · `/tasks`', kimi: '`run_in_background` · `/tasks` · `WaitFor` 回合内等待（0.38.0 起）；条件：main 分支（尚未发布）起 `WaitFor` 上限由 600 秒收紧为 90 秒、新输入立即结束等待；`/tasks` 后台 Agent 实时活动（0.35.0 起）', qoder: '`/tasks` · `TaskOutput` · `TaskStop`' },
    },
    {
      id: 'execution-review',
      category: 'execution',
      capability: '代码 Review',
      description: '由产品提供的审查命令或工作流。',
      values: { claude: '`/review` 为 `/code-review` 别名 · `--max-findings n|all|default` 改 findings 上限（v2.1.288 起，取值跨审查复用直到传 `default`）· `ultra` 云审查 · `--post` 预选以本人 GitHub 账号发单条普通评论（默认 `--no-post`）· `--comment` 自 v2.1.257 起可发 GitLab MR（经 `glab`）· GitHub Review', codex: '`/review` · GitHub Review', qwen: '`/review` 内置 Skill · `--resume` 继续中断的 PR 审查（v0.21.15 起） · `--topology minimal` 单遍 A/B 对比臂（条件：main 分支，尚未发布） · `publish-assets` 证据图 · Web Shell 结构化结果 · `cost-ledger` 成本台账 · `repo-context` 仓库上下文清单', kimi: '自然语言；无内置 `/review`', qoder: '`/review [instruction]`' },
    },
    {
      id: 'execution-git',
      category: 'execution',
      capability: 'Git 操作',
      description: '查看状态与差异，并执行暂存、提交和分支操作。',
      values: { claude: '`Bash` · `/diff`', codex: 'Shell · `/diff` · App 暂存/回退', qwen: '`run_shell_command` · `/diff`', kimi: '`Bash`', qoder: '`Bash` · `!` 模式' },
    },
    {
      id: 'execution-pr',
      category: 'execution',
      capability: 'Pull Request',
      description: '创建、读取或修复 GitHub Pull Request。',
      values: { claude: '`/review` · `/autofix-pr` · GitHub App', codex: 'Codex Cloud · GitHub Review · `gh`', qwen: '`/review --comment` · Actions · `gh` · 条件：Web Shell Git 对话框创建的 PR 绑定源会话（v0.22.0 起）', kimi: '`Bash`/`gh`；无专用入口', qoder: 'Qoder Action · `@qoder` · `gh`' },
    },
    {
      id: 'execution-ci',
      category: 'execution',
      capability: 'CI 自动化',
      description: '在 CI 中运行 Agent、审查变更或修复失败任务。',
      values: { claude: 'GitHub Actions · `/autofix-pr`', codex: '`openai/codex-action@v1`', qwen: '`/setup-github` · Qwen Code Action', kimi: '自定义 Shell/CI；无内置工作流', qoder: '`/setup-github` · Qoder Action' },
    },
    {
      id: 'execution-worktree',
      category: 'execution',
      capability: '并行 Worktree',
      description: '并行任务在独立 Git Worktree 中修改代码。',
      values: { claude: '`--worktree` · `EnterWorktree` · Agent 隔离 · 主检出写入阻断', codex: '`--worktree` · `/worktree` 托管检出（rust-v0.154.0 实验性、0.156.0 起默认开启）', qwen: '`--worktree` · `enter_worktree` · Agent 隔离', kimi: '官方文档无入口；条件：`/tower` worker 独占 `.tower/worktrees/`（实验标志默认关闭）', qoder: '`--worktree [name]` 在仓库内 `.qoder/worktrees/<name>` 隔离执行、同名复用、结果可并回主分支 · Agent `isolation: worktree` · `batch` Skill' },
    },
    {
      id: 'execution-computer-use',
      category: 'execution',
      capability: '桌面与浏览器控制',
      description: '由产品内置并分发的桌面 GUI 自动化或真实浏览器控制能力。',
      values: { claude: '无内置桌面或浏览器控制工具；经 MCP 扩展', codex: '条件：ChatGPT 桌面 App 的 Computer Use；CLI 未提供', qwen: '`computer_use__*` 内置工具；默认开启；含浏览器 `page` 工具', kimi: '条件：`/plugins` 内置 `kimi-cu` 与 `kimi-webbridge`；`kimi-cu` 支持 macOS 与 Windows x64（0.34.0 起）；v2 CLI', qoder: '内置工具表未列桌面或浏览器控制；经 MCP 扩展' },
    },
    {
      id: 'surface-headless',
      category: 'surfaces',
      capability: 'Headless 调用',
      description: '从脚本或 CI 中非交互运行任务。',
      values: { claude: '`claude -p`', codex: '`codex exec`', qwen: '`qwen -p`', kimi: '`kimi -p`', qoder: '`qodercli -p`' },
    },
    {
      id: 'surface-structured-output',
      category: 'surfaces',
      capability: '结构化输出',
      description: '输出 JSON、JSONL 或流式事件供程序消费。',
      values: { claude: '`json` · `stream-json` · JSON Schema', codex: '`--json` JSONL · `--output-schema`', qwen: '`json` · `stream-json` · JSON Schema', kimi: '`stream-json` JSONL', qoder: '`text` · `json` · `stream-json`' },
    },
    {
      id: 'surface-sdk',
      category: 'surfaces',
      capability: 'Agent SDK',
      description: '由应用程序直接创建会话、运行任务和消费事件。',
      values: { claude: 'Python · TypeScript', codex: 'TypeScript · Python', qwen: '`@qwen-code/sdk` TypeScript', kimi: '仓库内 TypeScript 包；未公开发布', qoder: 'TypeScript · Python' },
    },
    {
      id: 'surface-service',
      category: 'surfaces',
      capability: '服务端与 Daemon',
      description: '以常驻进程、协议服务器或本地服务承载 Agent 会话。',
      values: { claude: '后台会话 supervisor（`claude daemon status|logs|run|stop --any`）· Agent SDK · Remote Control 服务', codex: '`codex app-server` · `mcp-server` · 本地后台 daemon（`app-server daemon start|restart|update|stop` · TUI `/daemon`）', qwen: '`qwen serve` HTTP + SSE · `qwen daemon start|status|logs|stop|restart`', kimi: '`kimi web` REST + WebSocket', qoder: '`qodercli --acp` · `remote-control` Daemon' },
    },
    {
      id: 'surface-cli',
      category: 'surfaces',
      capability: 'CLI',
      description: '本地终端交互界面。',
      values: { claude: '`claude`', codex: '`codex`', qwen: '`qwen`', kimi: '`kimi`', qoder: '`qodercli`' },
    },
    {
      id: 'surface-ide',
      category: 'surfaces',
      capability: 'IDE 与 ACP',
      description: '编辑器插件、IDE 内置入口或 Agent Client Protocol 服务。',
      values: { claude: 'VS Code · JetBrains', codex: 'Codex IDE Extension', qwen: 'VS Code Companion · `qwen --acp`', kimi: 'VS Code · `kimi acp`', qoder: 'Qoder IDE · `qodercli --acp`' },
    },
    {
      id: 'surface-web',
      category: 'surfaces',
      capability: 'Web 界面',
      description: '通过浏览器创建、查看或继续 Agent 会话。',
      values: { claude: 'claude.ai/code · Remote Control', codex: 'ChatGPT Web · Codex Cloud', qwen: '`qwen serve` 内置 Web Shell；条件：图片拖拽/粘贴输入（v0.21.9 起）· 工作区文件上传（v0.21.12-preview.3 预览通道）· 文本文件附件（main 分支，尚未发布）', kimi: '`kimi web` 本地 Web UI', qoder: 'Qoder Web · Cloud Agents Console' },
    },
    {
      id: 'surface-desktop',
      category: 'surfaces',
      capability: '桌面端',
      description: '独立桌面应用或桌面产品集成。',
      values: { claude: 'Claude Desktop Code 页签（macOS · Windows x64/ARM64 · Linux beta）', codex: 'ChatGPT Desktop Codex（macOS · Windows · Linux 预览）', qwen: 'Qwen Code Desktop（Tauri 2 壳 + 打包 CLI runtime，官方 Release 提供 macOS/Windows/Linux 安装包）', kimi: '官方桌面端 · `kimi install-desktop`（别名 `install-app`）与 `/desktop` 打开下载页 · 条件：`kimi app [path]` 唤起桌面端新会话（main 分支，尚未发布）', qoder: 'Qoder IDE（macOS 12+ · Windows 10+ · Linux `.deb`/`.rpm`）' },
    },
    {
      id: 'surface-cloud',
      category: 'surfaces',
      capability: '云端仓库任务',
      description: '在托管环境中克隆仓库并执行任务。',
      values: { claude: '`claude --remote` · Web Cloud · 条件：`claude self-hosted-runner` 自托管云会话执行（Team/Enterprise 公测）', codex: 'Codex Cloud', qwen: '无托管云任务；`qwen serve` 为自托管', kimi: '无托管云任务；`kimi web` 为自托管', qoder: '`qodercli --remote` · Cloud Mode' },
    },
    {
      id: 'surface-remote-control',
      category: 'surfaces',
      capability: '远程接管与跨端继续',
      description: '从另一设备控制本地会话，或在本地与云端 Surface 之间继续工作。',
      values: { claude: '`/remote-control` · `/teleport`', codex: '`app-server --listen` · `codex --remote` · Cloud', qwen: '`qwen serve` 多客户端；条件：`--local-control` 局域网扫码配对（main 分支，尚未发布）；公网需自建网络', kimi: '`kimi web --host` 自建网络；条件：Remote Control 官方中继隧道 `kimi rc` · `kimi web --remote-control` · `/remote-control`（别名 `/rc`，实验开关 `KIMI_CODE_EXPERIMENTAL_REMOTE_CONTROL`，main 分支，尚未发布）', qoder: '`/remote-control` · `qodercli remote-control`' },
    },
    {
      id: 'surface-channels',
      category: 'surfaces',
      capability: '消息平台渠道',
      description: '把第三方聊天平台或邮箱当作 Agent 会话的输入与输出通道。',
      values: { claude: '条件：`claude --channels plugin:<name>@<marketplace>`；研究预览内置 Telegram、Discord、iMessage（仅 macOS）与 `fakechat` 演示渠道', codex: 'CLI 无渠道入口；条件：Slack 中提及 `@ChatGPT` 把仓库工作委派给 Codex Cloud', qwen: '`qwen channel start` · `channels.<name>.type`：`telegram`/`weixin`/`qq`/`dingtalk`/`dws`/`wecom`/`feishu`/`github`/`gitlab`/`email`；条件：Email 渠道 IMAP + SMTP（main 分支，尚未发布）', kimi: '无第三方消息平台或邮箱渠道；`kimi web` 与 Remote Control 是自有浏览器窗口', qoder: 'CLI 无第三方消息渠道；条件：Qoder Action 在 GitHub Issue/PR 以 `@qoder` 提及触发，代码在 GitHub Runner 执行' },
    },
    {
      id: 'model-switch',
      category: 'models',
      capability: '模型选择与切换',
      description: '选择当前模型，并区分会话级、项目级和用户级默认值。',
      values: { claude: '`/model` · `--model` · `ANTHROPIC_DEFAULT_MODEL` 新会话默认模型（v2.1.236 起）· `modelPicker` 定制选择器列表（v2.1.243 起）', codex: '`/model` · `-m`', qwen: '`/model` · `--model`', kimi: '`/model` · `-m`', qoder: '`/model` · `--model`' },
    },
    {
      id: 'model-effort',
      category: 'models',
      capability: '推理强度',
      description: '设置 reasoning effort、thinking effort 或快速档位。',
      values: { claude: '`/effort` · `--effort`', codex: '`/model` · `model_reasoning_effort` · 条件：main 分支（尚未发布）新增 `persistent` 档位，本地保留 `persistent`、发送 Responses API 时换为 `disabled`', qwen: '`/effort`', kimi: '`[thinking] effort`；无独立命令', qoder: '`/effort` · `--reasoning-effort`' },
    },
    {
      id: 'model-provider',
      category: 'models',
      capability: 'Provider 类型',
      description: '连接默认服务之外的官方云平台、本地运行时或第三方模型 Provider。',
      values: { claude: 'Anthropic（claude.ai 订阅或 Console API Key）· Amazon Bedrock（Invoke API 或 Mantle 端点）· Claude Platform on AWS · Google Cloud\'s Agent Platform（原 Vertex AI）· Microsoft Foundry · LLM 网关/Claude apps gateway', codex: '内置保留 `openai`/`ollama`/`lmstudio` · 内置 `amazon-bedrock` · 自定义 Provider 仅 `wire_api = "responses"` · `--oss` 本地 Provider', qwen: '协议 `openai`/`anthropic`/`gemini`/`vertex-ai` · `/auth` 四组入口：QwenCloud · Alibaba ModelStudio · Third-party Providers · Custom Provider · 条件：QwenCloud 入口自 v0.25.3-preview.0（预发布通道，stable v0.25.2 尚无）', kimi: '六类 `type`：`kimi`/`anthropic`/`openai`/`openai_responses`/`google-genai`/`vertexai` · `/provider` 与 `kimi provider` 从 models.dev 或自定义 registry 导入', qoder: '托管目录（Default 分档 · New Models 具体模型）· Custom 页签 BYOK 指定厂商 · 条件：BYOK 仅 Individual 计划，厂商以向导实时目录为准' },
    },
    {
      id: 'model-compatible-endpoint',
      category: 'models',
      capability: '自定义 API 端点',
      description: '配置代理网关、自托管模型或协议兼容服务的基础地址。',
      values: { claude: '`ANTHROPIC_BASE_URL` · Messages 网关', codex: '`model_providers` · 仅 Responses 协议', qwen: '`baseUrl` · OpenAI/Anthropic/Gemini 协议', kimi: '`base_url` · 多 Provider 协议', qoder: '公开文档仅列指定厂商；无任意 URL' },
    },
    {
      id: 'auth-browser',
      category: 'models',
      capability: '浏览器账号登录',
      description: '通过产品账号授权 CLI。',
      values: { claude: '`/login`', codex: '`codex login` · Device Code', qwen: '当前无浏览器账号登录；`/auth` 配置 Provider', kimi: '`/login` · `kimi login`', qoder: '`/login` · `qodercli login`' },
    },
    {
      id: 'auth-api-key',
      category: 'models',
      capability: 'API Key',
      description: '使用环境变量或配置中的模型服务密钥。',
      values: { claude: '`ANTHROPIC_API_KEY` · `apiKeyHelper`', codex: '`login --with-api-key` · Provider `env_key`', qwen: '`/auth` · 环境变量 · `.env`', kimi: '`config.toml` `api_key` · Kimi Platform', qoder: 'PAT · 指定厂商 Custom Model Key' },
    },
    {
      id: 'auth-cloud-provider',
      category: 'models',
      capability: '云厂商凭据链',
      description: '复用 AWS、Google Cloud 或其他云平台的原生身份与短期凭据。',
      values: { claude: 'Bedrock · Vertex · Foundry 原生凭据链', codex: 'Bedrock AWS SigV4 · Provider 命令令牌', qwen: 'Vertex 与兼容 Provider 的密钥配置', kimi: 'Vertex AI ADC · `GOOGLE_APPLICATION_CREDENTIALS`', qoder: '公开 CLI 文档未列通用云凭据链' },
    },
    {
      id: 'auth-environment',
      category: 'models',
      capability: '环境变量注入',
      description: '从进程环境或项目环境文件向 Provider 注入端点和凭据。',
      values: { claude: '`ANTHROPIC_*` · 云厂商环境变量', codex: '`OPENAI_API_KEY` · Provider `env_key`', qwen: '系统环境 > `.env` > `settings.json.env`', kimi: '仅 `KIMI_MODEL_*` 临时通道；普通 Provider Key 不读 Shell', qoder: '`QODER_PERSONAL_ACCESS_TOKEN`' },
    },
    {
      id: 'auth-storage',
      category: 'models',
      capability: '本地凭据存储',
      description: '登录令牌和静态密钥在本机的保存位置、权限与可配置后端。',
      values: { claude: 'macOS Keychain；Linux/Windows credentials 文件', codex: '`auth.json` · Keyring · Auto', qwen: '`settings.json` · `.env` · 进程环境', kimi: '`credentials/` 0600 · `config.toml` 明文 Key', qoder: '登录缓存可复用；具体后端与路径未公开' },
    },
    {
      id: 'auth-logout',
      category: 'models',
      capability: '退出与撤销本地凭据',
      description: '退出账号或移除当前 CLI 使用的本地凭据。',
      values: { claude: '`/logout`', codex: '`codex logout`', qwen: '无独立 logout；重配 Provider 或删除 Key', kimi: '`/logout`', qoder: '`/logout`' },
    },
    {
      id: 'auth-status',
      category: 'models',
      capability: '认证状态检查',
      description: '检查当前账号、Provider、凭据或相关诊断状态。',
      values: { claude: '`/status` · `/doctor`', codex: '`codex login status` · `/status`', qwen: '`/doctor`', kimi: '`/status`；无独立认证状态命令', qoder: '`/status`' },
    },
    {
      id: 'auth-enterprise',
      category: 'models',
      capability: '组织账号与策略',
      description: '由组织统一管理身份、凭据或配置。',
      values: { claude: 'SSO · Managed settings · 强制登录策略', codex: 'Workspace RBAC · Managed config · 强制 Workspace', qwen: '系统级 Settings · Provider 身份；无统一 SSO 层', kimi: '公开 CLI 文档未列 Managed/SSO 策略', qoder: 'Teams 管理台 · 域名限制 · SAML SSO' },
    },
  ],
};

const commandSources = [
  'claude-commands',
  'codex-commands',
  'qwen-commands',
  'kimi-commands',
  'qoder-commands',
];
const agentSources = [
  'claude-agents',
  'codex-agents',
  'qwen-agents',
  'qwen-worktree',
  'kimi-agents',
  'kimi-subagent-config',
  'qoder-agents',
];
const generalSources = [
  'claude-docs',
  'codex-docs',
  'qwen-docs',
  'kimi-docs',
  'qoder-docs',
];

window.matrixData.rows.forEach((row) => {
  row.sources =
    row.category === 'commands'
      ? commandSources
      : row.category === 'subagents'
        ? agentSources
        : generalSources;
});

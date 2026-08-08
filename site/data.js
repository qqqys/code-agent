window.matrixData = {
  updatedAt: '2026-08-08',
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
      label: 'Claude Code Skills',
      url: 'https://code.claude.com/docs/en/skills',
    },
    'claude-hooks': {
      label: 'Claude Code Hooks',
      url: 'https://code.claude.com/docs/en/hooks',
    },
    'claude-plugins': {
      label: 'Claude Code Plugins',
      url: 'https://code.claude.com/docs/en/plugins',
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
    'claude-settings': {
      label: 'Claude Code settings',
      url: 'https://code.claude.com/docs/en/settings',
    },
    'claude-managed-settings': {
      label: 'Claude Code server-managed settings',
      url: 'https://code.claude.com/docs/en/server-managed-settings',
    },
    'claude-env-vars': {
      label: 'Claude Code environment variables',
      url: 'https://code.claude.com/docs/en/env-vars',
    },
    'claude-keybindings': {
      label: 'Claude Code keybindings',
      url: 'https://code.claude.com/docs/en/keybindings',
    },
    'claude-sandbox-strict-allowlist': {
      label: 'Claude Code v2.1.219 changelog',
      url: 'https://github.com/anthropics/claude-code/blob/0c188278cdf9/CHANGELOG.md',
    },
    'claude-credential-file-mask': {
      label: 'Claude Code v2.1.221 changelog',
      url: 'https://github.com/anthropics/claude-code/blob/dd796139237c/CHANGELOG.md',
    },
    'claude-review-alias': {
      label: 'Claude Code v2.1.223 changelog',
      url: 'https://github.com/anthropics/claude-code/blob/5cf69b18c86d/CHANGELOG.md',
    },
    'claude-ultrareview': {
      label: 'Claude Code ultrareview',
      url: 'https://code.claude.com/docs/en/ultrareview',
    },
    'codex-commands': {
      label: 'Codex CLI commands',
      url: 'https://developers.openai.com/codex/cli/slash-commands',
    },
    'codex-agents': {
      label: 'Codex Subagents',
      url: 'https://developers.openai.com/codex/subagents',
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
    'codex-app': {
      label: 'ChatGPT desktop app',
      url: 'https://learn.chatgpt.com/docs/app',
    },
    'codex-cloud': {
      label: 'Codex cloud',
      url: 'https://learn.chatgpt.com/docs/cloud',
    },
    'codex-troubleshooting': {
      label: 'Codex Troubleshooting',
      url: 'https://learn.chatgpt.com/docs/reference/troubleshooting',
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
    'qwen-commands': {
      label: 'Qwen Code commands documentation',
      url: 'https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/commands.md',
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
      url: 'https://github.com/QwenLM/qwen-code/blob/079ce5346af7/docs/users/features/sub-agents.md',
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
    'qwen-settings': {
      label: 'Qwen Code Settings',
      url: 'https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/configuration/settings.md',
    },
    'qwen-headless': {
      label: 'Qwen Code Headless Mode',
      url: 'https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/headless.md',
    },
    'qwen-headless-goal': {
      label: 'Qwen Code headless Goal workflows',
      url: 'https://github.com/QwenLM/qwen-code/blob/48d37cdf704dbe4c5254cc4b31c2d62f1351bff1/docs/users/features/headless.md',
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
    'qwen-desktop-current': {
      label: 'Qwen Code current Desktop',
      url: 'https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/desktop/README.md',
    },
    'qwen-acp-current': {
      label: 'Qwen Code current ACP integration',
      url: 'https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/integration-zed.md',
    },
    'qwen-worktree-current': {
      label: 'Qwen Code current worktree',
      url: 'https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/worktree.md',
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
    'qwen-extensions-current': {
      label: 'Qwen Code current Extensions',
      url: 'https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/extension/introduction.md',
    },
    'qwen-extension-runtime-current': {
      label: 'Qwen Code current Extension runtime',
      url: 'https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/core/src/extension/extensionManager.ts',
    },
    'qwen-commands-current': {
      label: 'Qwen Code current custom commands',
      url: 'https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/commands.md',
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
    'kimi-commands': {
      label: 'Kimi Code Slash commands',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/7c919f0376c0331d0d057ef3643c7adcc2c55802/docs/zh/reference/slash-commands.md',
    },
    'kimi-fork-stay': {
      label: 'Kimi Code /fork stay-in-session commit',
      url: 'https://github.com/MoonshotAI/kimi-code/commit/54c04bf03ddbeb46d02b2edb460ea091ae194509',
    },
    'kimi-agents': {
      label: 'Kimi Code Agents',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/efac96c8a95a/docs/zh/customization/agents.md',
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
      url: 'https://github.com/MoonshotAI/kimi-code/blob/7c919f0376c0331d0d057ef3643c7adcc2c55802/docs/zh/guides/sessions.md',
    },
    'kimi-commands-current': {
      label: 'Kimi Code current slash commands',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/7c919f0376c0331d0d057ef3643c7adcc2c55802/docs/zh/reference/slash-commands.md',
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
    'kimi-subagent-config': {
      label: 'Kimi Code subagent and secondary model configuration',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/efac96c8a95a/docs/zh/configuration/config-files.md',
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
    'kimi-plugins-current': {
      label: 'Kimi Code current Plugins',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/691ec4679ea1/docs/zh/customization/plugins.md',
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
      url: 'https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/tools.md',
    },
    'kimi-agents-execution-current': {
      label: 'Kimi Code current agents',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/customization/agents.md',
    },
    'kimi-commands-execution-current': {
      label: 'Kimi Code current slash commands',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/slash-commands.md',
    },
    'kimi-cli-surface-current': {
      label: 'Kimi Code current CLI, Headless and Web reference',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/kimi-command.md',
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
    'kimi-model-providers-current': {
      label: 'Kimi Code current model providers',
      url: 'https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/configuration/providers.md',
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
    'qoder-commands': {
      label: 'Qoder CLI commands',
      url: 'https://docs.qoder.com/en/cli/command',
    },
    'qoder-agents': {
      label: 'Qoder CLI Subagent',
      url: 'https://docs.qoder.com/en/cli/subagent',
    },
    'qoder-permissions': {
      label: 'Qoder CLI Permissions',
      url: 'https://docs.qoder.com/en/cli/permissions',
    },
    'qoder-sdk-reference': {
      label: 'Qoder CLI SDK Reference',
      url: 'https://docs.qoder.com/en/cli/sdk/references',
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
      values: { claude: '`/model`', codex: '`/model`', qwen: '`/model`', kimi: '`/model` · `/secondary_model`', qoder: '`/model`' },
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
      values: { claude: '`/goal`', codex: '`/goal`', qwen: '`/goal`', kimi: '`/goal`', qoder: '—' },
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
      description: '查看后台进程、Agent 或长任务状态。',
      values: { claude: '`/tasks` · `/background`', codex: '`/ps` · `/stop`', qwen: '`/tasks`', kimi: '`/tasks` · `/task`', qoder: '`/tasks`' },
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
      values: { claude: '`/rewind` · `/checkpoint` · `/undo`', codex: '—', qwen: '`/rewind` · `/restore`', kimi: '`/undo [count]`', qoder: '—' },
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
      values: { claude: '`/config` · `/settings`', codex: '`/debug-config`', qwen: '`/config` · `/settings` · `/import-config`', kimi: '`/settings` · `/config` · `/update-config`', qoder: '`/config`' },
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
      values: { claude: '`/mcp`', codex: '`/mcp`', qwen: '`/mcp`', kimi: '`/mcp` · `/mcp-config`', qoder: '`/mcp`' },
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
      values: { claude: '`/hooks`', codex: '`/hooks`', qwen: '`/hooks`', kimi: '—', qoder: 'Agent 配置支持；无独立命令' },
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
      values: { claude: 'Skills 可作为命令调用', codex: 'Skills 可作为命令调用', qwen: '`/workflows` · `/<skill-name>`', kimi: 'Skills 可作为命令调用', qoder: '`/commands` · `/workflows`' },
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
      values: { claude: '`/advisor` · `/batch`', codex: '`/agent`', qwen: '`/arena` · `/batch`', kimi: '`/swarm`', qoder: '`/quest`' },
    },
    {
      id: 'cmd-remote',
      category: 'commands',
      capability: '远程与跨端',
      description: '把本地会话连接到桌面端、Web 或远程控制入口。',
      values: { claude: '`/remote-control` · `/rc` · `/teleport` · `/desktop`', codex: '`/app`', qwen: '—', kimi: '`/web`', qoder: 'Cloud Mode；无对应 Slash 命令' },
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
      values: { claude: '任务描述；可预载 Skills', codex: '父任务与委派描述', qwen: '命名 Agent 接收任务提示；Fork 可继承最近若干轮或全部', kimi: '只接收任务提示', qoder: '任务提示；可设 `initialPrompt`' },
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
      values: { claude: '支持后台与并行', codex: '支持并发线程', qwen: '命名 Agent 默认后台；可设前台', kimi: '支持后台与并行', qoder: '`background` 可配置；支持并行' },
    },
    {
      id: 'agent-model',
      category: 'subagents',
      capability: 'Agent 单独选模型',
      description: '单个 Agent 能否覆盖主会话模型。',
      values: { claude: '`model`', codex: '`model`', qwen: '`model`: inherit · fast · modelId · authType:modelId · `modelGrades` 名称', kimi: '`model_preference`: `primary` · `secondary`（实验性）', qoder: '`model`' },
    },
    {
      id: 'agent-effort',
      category: 'subagents',
      capability: 'Agent 推理强度',
      description: '单个 Agent 能否设置独立的推理预算。',
      values: { claude: '`effort`', codex: '`model_reasoning_effort`', qwen: '未确认独立字段', kimi: '未确认独立 effort 字段', qoder: '`effort`' },
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
      values: { claude: '默认最多 3 层；可限制可派生 Agent', codex: '当前 Subagent 页面未确认', qwen: '命名 Agent 受工具规则控制；Fork 禁止递归 Fork', kimi: 'coder 可嵌套；自定义 Agent 用 `subagents`', qoder: 'Agent 工具可嵌套并支持 `Agent(name)`' },
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
      values: { claude: '`maxTurns`；全局并发与嵌套上限；超时字段未确认', codex: '`agents.max_concurrent_threads_per_session`；轮数和超时字段未确认', qwen: '`maxTurns`；超时字段未确认', kimi: '全局 `[subagent] timeout_ms`（默认 2 h）；Agent 定义无独立字段', qoder: '`maxTurns` · `timeoutMins`' },
    },
    {
      id: 'security-approval',
      category: 'security',
      capability: '交互审批',
      description: '危险或越界操作能否在执行前请求用户确认。',
      values: { claude: '支持', codex: '支持', qwen: '支持', kimi: '支持', qoder: '支持' },
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
      values: { claude: 'Bash OS 沙箱 + 文件权限规则', codex: '`read-only` · `workspace-write` · `danger-full-access`', qwen: 'Seatbelt 或容器 Sandbox；默认关闭', kimi: '文件工具权限；OS 沙箱未确认', qoder: '路径权限规则；SDK 条件 Sandbox' },
    },
    {
      id: 'security-network',
      category: 'security',
      capability: '网络隔离',
      description: '单独限制 Agent 进程访问网络。',
      values: { claude: 'Sandbox 域名代理与 Allow/Deny；`strictAllowlist` 直接拒绝未列主机', codex: '`workspace-write` 默认断网；可单独启用与限域', qwen: 'Seatbelt Profile 与代理；依配置', kimi: '网络工具权限；OS 网络隔离未确认', qoder: 'Web 工具规则；SDK 条件网络 Sandbox' },
    },
    {
      id: 'security-credentials',
      category: 'security',
      capability: '凭据保护',
      description: '限制 Agent 执行的命令读取凭据文件与敏感环境变量，并可由出站代理注入真实值。',
      values: { claude: '`sandbox.credentials.files` · `envVars` `deny`/`mask` · 出站代理注入', codex: '`shell_environment_policy` 过滤子进程环境变量；无文件打码', qwen: '官方沙箱文档未列凭据保护；容器挂载 `~/.qwen`', kimi: '未确认 OS 沙箱；文档未列凭据保护字段', qoder: '本地 CLI/SDK 文档未列同类凭据保护' },
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
      id: 'session-branch',
      category: 'sessions',
      capability: '会话分支',
      description: '从当前上下文复制出独立会话。',
      values: { claude: '`/branch` · `--fork-session`', codex: '`/fork` · `codex exec fork`（条件：main 分支，尚未发布）', qwen: '`/branch`', kimi: '`/fork`', qoder: 'SDK：`resume` + `forkSession`' },
    },
    {
      id: 'session-naming',
      category: 'sessions',
      capability: '会话命名',
      description: '为会话设置便于查找的标题。',
      values: { claude: '`/rename` · `--name`', codex: '`/rename`', qwen: '`/rename` · `/tag`', kimi: '`/title` · `/rename`', qoder: 'TUI 命令表未列出' },
    },
    {
      id: 'session-compress',
      category: 'sessions',
      capability: '手动压缩',
      description: '主动总结当前上下文以释放窗口。',
      values: { claude: '`/compact [instructions]`', codex: '`/compact`', qwen: '`/compress [instructions]` · `/compress-fast`', kimi: '`/compact [instruction]`', qoder: '`/compact [instructions]`' },
    },
    {
      id: 'session-context-usage',
      category: 'sessions',
      capability: '上下文占用',
      description: '查看当前会话上下文窗口或 token 使用情况。',
      values: { claude: '`/context`', codex: '`/status`', qwen: '`/context` · `/context detail`', kimi: '`/usage`', qoder: '未确认独立占用视图' },
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
      values: { claude: '`/rewind` · `/checkpoint` · `/undo`', codex: 'CLI 命令表未列出', qwen: '`/rewind`；条件：`/restore`', kimi: '`/undo`（不回滚代码）', qoder: 'SDK 条件：`rewindFiles()`' },
    },
    {
      id: 'session-memory',
      category: 'sessions',
      capability: '跨会话记忆',
      description: '保存项目或用户信息供后续会话使用。',
      values: { claude: '`CLAUDE.md` + Auto memory', codex: '条件：`/memories`；默认关闭', qwen: '`QWEN.md` + Auto-memory', kimi: '`AGENTS.md`；自动记忆未列出', qoder: '`AGENTS.md`；条件：Auto-memory' },
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
      values: { claude: '`/<skill-name>` · `.claude/skills/`', codex: '`$skill` · `.agents/skills/`', qwen: '`/<skill-name>` · `.qwen/skills/` · `skills.disabledLevels`', kimi: '`/skill:<name>` · `.kimi-code/skills/`', qoder: '`/<skill-name>` · `.qoder/skills/`' },
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
      values: { claude: '`/hooks` · 多类 Handler', codex: '`/hooks` · 当前仅 command 执行', qwen: '`/hooks` · command/HTTP/prompt', kimi: '`config.toml` · command', qoder: '`settings.json` · command/HTTP/prompt/agent' },
    },
    {
      id: 'extension-plugins',
      category: 'extensions',
      capability: '插件分发',
      description: '把 Skills、Agents、Hooks 或 MCP 配置作为一个包分发。',
      values: { claude: '`/plugin`', codex: '`/plugins`', qwen: '`/extensions` · `qwen extensions`', kimi: '`/plugins`', qoder: '`qodercli plugins` · `/plugins reload`' },
    },
    {
      id: 'extension-custom-commands',
      category: 'extensions',
      capability: '自定义 Slash 命令',
      description: '从文件加载自定义命令提示模板。',
      values: { claude: '`.claude/commands/*.md` · Skills', codex: 'Skills；`/prompts:*` 已弃用', qwen: '`.qwen/commands/*.md` · Skills', kimi: 'Plugin `commands/*.md` · Skills', qoder: '`.qoder/commands/*.md`' },
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
      id: 'execution-files',
      category: 'execution',
      capability: '文件读写',
      description: '读取、创建和修改工作区文件。',
      values: { claude: '`Read` · `Edit` · `Write`', codex: '内置读取 · 补丁编辑', qwen: '`read_file` · `edit` · `write_file`', kimi: '`Read` · `Edit` · `Write`', qoder: '`Read` · `Edit` · `Write`' },
    },
    {
      id: 'execution-shell',
      category: 'execution',
      capability: 'Shell 执行',
      description: '运行构建、测试、Git 和系统命令。',
      values: { claude: '`Bash`', codex: '统一 PTY Shell', qwen: '`run_shell_command`', kimi: '`Bash`', qoder: '`Bash` · `!` 模式' },
    },
    {
      id: 'execution-search',
      category: 'execution',
      capability: '代码搜索',
      description: '按文件名、文本或符号搜索代码库。',
      values: { claude: '`Glob` · `Grep` · `LSP`', codex: '内置搜索 · Shell/`rg`', qwen: '`glob` · `grep_search` · `LSP`', kimi: '`Glob` · `Grep`', qoder: '`Glob` · `Grep`' },
    },
    {
      id: 'execution-background',
      category: 'execution',
      capability: '后台任务',
      description: '在不阻塞主交互的情况下执行命令或 Agent。',
      values: { claude: '`/background` · `/tasks` · `Monitor`', codex: '`/ps` · `/stop`', qwen: '`is_background` · `Ctrl+B` · `/tasks`', kimi: '`run_in_background` · `/tasks`', qoder: '`/tasks` · `TaskOutput` · `TaskStop`' },
    },
    {
      id: 'execution-review',
      category: 'execution',
      capability: '代码 Review',
      description: '由产品提供的审查命令或工作流。',
      values: { claude: '`/review` 为 `/code-review` 别名 · `ultra` 云审查 · GitHub Review', codex: '`/review` · GitHub Review', qwen: '`/review` 内置 Skill · `publish-assets` 证据图 · Web Shell 结构化结果 · `cost-ledger` 成本台账 · `repo-context` 仓库上下文清单', kimi: '自然语言；无内置 `/review`', qoder: '`/review [instruction]`' },
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
      values: { claude: '`/review` · `/autofix-pr` · GitHub App', codex: 'Codex Cloud · GitHub Review · `gh`', qwen: '`/review --comment` · Actions · `gh`', kimi: '`Bash`/`gh`；无专用入口', qoder: 'Qoder Action · `@qoder` · `gh`' },
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
      values: { claude: '`--worktree` · `EnterWorktree` · Agent 隔离', codex: '桌面 App Worktree；CLI 无对应隔离', qwen: '`--worktree` · `enter_worktree` · Agent 隔离', kimi: '无内置入口；可在已有 Worktree 中运行', qoder: '`--worktree` Job · Agent 隔离' },
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
      values: { claude: 'Agent SDK · Remote Control 服务', codex: '`codex app-server` · `mcp-server`', qwen: '`qwen serve` HTTP + SSE', kimi: '`kimi web` REST + WebSocket', qoder: '`qodercli --acp` · `remote-control` Daemon' },
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
      values: { claude: 'claude.ai/code · Remote Control', codex: 'ChatGPT Web · Codex Cloud', qwen: '`qwen serve` 内置 Web Shell', kimi: '`kimi web` 本地 Web UI', qoder: 'Qoder Web · Cloud Agents Console' },
    },
    {
      id: 'surface-desktop',
      category: 'surfaces',
      capability: '桌面端',
      description: '独立桌面应用或桌面产品集成。',
      values: { claude: 'Claude Desktop Code', codex: 'ChatGPT Desktop Codex', qwen: 'Qwen Code Desktop', kimi: '无独立桌面端；提供 VS Code/Web', qoder: 'Qoder IDE' },
    },
    {
      id: 'surface-cloud',
      category: 'surfaces',
      capability: '云端仓库任务',
      description: '在托管环境中克隆仓库并执行任务。',
      values: { claude: '`claude --remote` · Web Cloud', codex: 'Codex Cloud', qwen: '无托管云任务；`qwen serve` 为自托管', kimi: '无托管云任务；`kimi web` 为自托管', qoder: '`qodercli --remote` · Cloud Mode' },
    },
    {
      id: 'surface-remote-control',
      category: 'surfaces',
      capability: '远程接管与跨端继续',
      description: '从另一设备控制本地会话，或在本地与云端 Surface 之间继续工作。',
      values: { claude: '`/remote-control` · `/teleport`', codex: '`app-server --listen` · `codex --remote` · Cloud', qwen: '`qwen serve` 多客户端；需自建网络', kimi: '`kimi web --host`；需自建网络', qoder: '`/remote-control` · `qodercli remote-control`' },
    },
    {
      id: 'model-switch',
      category: 'models',
      capability: '模型选择与切换',
      description: '选择当前模型，并区分会话级、项目级和用户级默认值。',
      values: { claude: '`/model` · `--model`', codex: '`/model` · `-m`', qwen: '`/model` · `--model`', kimi: '`/model` · `-m`', qoder: '`/model` · `--model`' },
    },
    {
      id: 'model-effort',
      category: 'models',
      capability: '推理强度',
      description: '设置 reasoning effort、thinking effort 或快速档位。',
      values: { claude: '`/effort` · `--effort`', codex: '`/model` · `model_reasoning_effort`', qwen: '`/effort`', kimi: '`[thinking] effort`；无独立命令', qoder: '`/effort` · `--reasoning-effort`' },
    },
    {
      id: 'model-provider',
      category: 'models',
      capability: 'Provider 类型',
      description: '连接默认服务之外的官方云平台、本地运行时或第三方模型 Provider。',
      values: { claude: 'Anthropic · Bedrock · Vertex · Foundry', codex: 'OpenAI · Bedrock · Ollama · LM Studio · 自定义 Responses', qwen: 'OpenAI · Anthropic · Gemini · Vertex · 自定义', kimi: 'Kimi · Anthropic · OpenAI · Gemini · Vertex', qoder: '托管目录 · 指定厂商 BYOK' },
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

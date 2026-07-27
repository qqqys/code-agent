# MCP、Skills、Hooks 与插件

[上一篇：会话、上下文与记忆](./06-会话上下文与记忆.md) ·
[返回总矩阵](./02-功能总矩阵.md) ·
[下一篇：多代理、后台任务与 Worktree](./08-多代理后台任务与Worktree.md)

这四类扩展经常被放在同一张宣传图里，但解决的问题不同：

- MCP：把外部工具和数据接进来；
- Skill：把一套做事方法和资源封装起来；
- Hook：在生命周期事件发生时自动执行动作；
- Plugin：把多种扩展打包、安装和分发。

## 五方表现

| 能力 | Claude Code | Codex | Qwen Code | Kimi Code | Qoder CLI |
| --- | --- | --- | --- | --- | --- |
| MCP Client | 完整，含 Scope 与 OAuth 路径 | 完整 | 完整，覆盖 CLI/Daemon 等入口 | 有，突出对话式 `/mcp-config` | 有，工具受权限规则控制 |
| MCP Server | 不是主要产品定位 | CLI 有实验性 Server 入口 | Daemon/Bridge 可承担服务端接入 | 待验证 | 待验证 |
| Skills | 支持按需加载 | 支持，可随 Plugin 分发 | 内置、用户级和项目级 Skill | 新版待补证 | 有 Agent/Skill 工作流，细节待补证 |
| Hooks | 生命周期覆盖成熟 | 支持多类生命周期事件 | Command/HTTP、同步/异步 Hook | 新版待补证 | 公开 CLI 文档待补证 |
| Plugin/市场 | Plugin Marketplace | Plugin Marketplace | Extension/Marketplace | 新版待补证 | 扩展分发入口待补证 |

## 差异怎么看

Claude Code 的优势是扩展概念已经形成完整用户心智：MCP 接工具，Skill 教方法，Hook
做自动化，Plugin 负责分发。Codex 也在形成相近的插件与 Skill 体系，同时保留 MCP
和 App Server 等平台接口。

Qwen Code 的扩展面很宽，尤其适合开源社区和企业定制。但入口越多，越要回答“这个
扩展在哪些 Surface 生效、谁安装、谁批准、怎样升级、失败时去哪看日志”。

Kimi Code 的对话式 MCP 配置很有产品感：用户可以在会话中完成配置，而不是先理解
复杂文件。Qoder CLI 已明确支持 MCP 和 Subagent，Hooks/市场等细节仍需要更强的一手
公开证据。

## 一套扩展是否成熟，看这六件事

1. 能否发现和安装；
2. 能否看懂它会读取什么、执行什么；
3. 能否按用户、项目和企业分层；
4. 能否锁版本和安全升级；
5. 能否在 CLI、IDE、Desktop、Cloud 中保持一致；
6. 出错时能否定位到具体扩展和生命周期事件。

## 对 Qwen Code 的启示

Qwen Code 可以把扩展中心做成统一入口：同一页展示 MCP、Skill、Hook 和 Extension，
但明确标出类型、作用范围、权限、来源、版本和支持的 Surface。安装前给出权限摘要，
运行时给出统一日志，团队管理员可以下发允许清单。

## 官方入口

- [Claude Code MCP 文档](https://code.claude.com/docs/en/mcp)
- [Codex 开源仓库](https://github.com/openai/codex)
- [Qwen Code 开源仓库](https://github.com/QwenLM/qwen-code)
- [Kimi Code 开源仓库](https://github.com/MoonshotAI/kimi-code)
- [Qoder CLI 权限文档](https://docs.qoder.com/en/cli/permissions)

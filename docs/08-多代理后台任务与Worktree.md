# 多代理、后台任务与 Worktree

[上一篇：MCP、Skills、Hooks 与插件](./07-MCP-Skills-Hooks与插件.md) ·
[返回总矩阵](./02-功能总矩阵.md) ·
[下一篇：Git、Review 与 CI](./09-Git-Review与CI.md)

多代理不是“同时开五个聊天框”。真正有价值的是：任务能拆开、工作区不互相覆盖、
结果可以汇总、失败可以单独重试。

## 五方表现

| 能力 | Claude Code | Codex | Qwen Code | Kimi Code | Qoder CLI |
| --- | --- | --- | --- | --- | --- |
| 子代理 | 自定义 Agent，可前台或后台运行 | CLI Subagent；App 面向多 Agent 并行 | Named/Fork Subagent、Agent Team | 新版待验证 | 自定义 Subagent |
| 并行编排 | Agent 和后台任务可并行 | App/Cloud 的核心体验之一 | Team、Workflow、Arena 支持多种并行路径 | 待验证 | 官方确认串行与并行编排 |
| 工作区隔离 | Worktree/Tmux 工作流 | App/CLI 可结合隔离 Worktree | Worktree、Arena 隔离 | 待验证 | Subagent 的文件隔离细节待补证 |
| 后台 Shell | 支持 | 支持长任务执行 | Shell 后台化与 Monitor | 待验证 | 本地和云任务入口 |
| 远程继续 | Web/Remote Control 路径 | Cloud Task、App 与移动接续 | Daemon 多客户端、IM Channel | 待验证 | **Cloud Session 在本地终端关闭后继续** |
| 结果汇总 | 主 Agent 回收子任务结果 | 线程与任务工作台 | Team/Workflow 汇总 | 待验证 | 主 Agent 可编排 Subagent |

## 多代理的真实检查清单

| 问题 | 为什么重要 |
| --- | --- |
| 谁负责拆任务？ | 拆错以后，并行只会更快地产生错误结果 |
| 是否共享上下文？ | 全量共享浪费 Token，完全隔离又容易缺信息 |
| 是否共享文件？ | 多个 Agent 同改一处会覆盖或产生冲突 |
| 权限是否继承？ | 子代理不应自动获得更高权限 |
| 能否取消和重试？ | 长任务必须可以只重跑失败分支 |
| 怎样合并结果？ | “都完成了”不代表最终代码能构建 |

## 产品差异

Claude Code 的子代理更贴近终端工作流；Codex App 把多个 Agent、多个任务和工作区做成
显式桌面体验；Qwen Code 同时提供 Subagent、Team、Workflow 和 Arena，实验与编排
空间最大；Qoder CLI 把 Subagent 和 Cloud Mode 结合；Kimi Code 当前公开资料不足，
不应凭旧产品经验补齐矩阵。

## 对 Qwen Code 的启示

Qwen Code 的机会不是再增加一种 Agent 类型，而是收敛成统一任务模型：

- 每个子任务有负责人、输入、工作区、权限、状态和产物；
- Team、Workflow、Arena 和后台 Agent 使用同一套状态展示；
- 冲突、超时、取消、重试和汇总有一致语义；
- CLI 创建的任务能在 Desktop、Web Shell 或 IM 中继续查看。

这样多代理能力才会从“高级功能”变成普通开发者能稳定使用的生产工具。

## 官方入口

- [Codex App 介绍](https://openai.com/index/introducing-the-codex-app/)
- [Qwen Code 开源仓库](https://github.com/QwenLM/qwen-code)
- [Qoder CLI Subagent](https://docs.qoder.com/en/cli/subagent)
- [Qoder CLI Cloud Mode](https://docs.qoder.com/en/cli/cloud-mode)

# Codex / Claude Code / Qwen Code 对比：最终结案

> 状态：Closed  
> 结案时间：2026-07-26T13:51:22Z  
> 最终阶段：Final Closure（停止新增 probe，完成 synthesis + decision）

## 1. 结案结果

研究已从阶段式证据采集收敛为三个最终产物：

- [最终能力对比](./21-final-capability-comparison.md)
- [Qwen 机会与决策](./22-qwen-opportunities-and-decisions.md)
- 本终止线与复核记录

历史 Phase 文档保持 immutable snapshot；本文件取代其中 open-probe backlog
作为当前计划。未执行项统一标记为 `Deferred at closure`，含义是本轮停止，不是
产品负面结论。

## 2. Stop-line Inventory

| Probe  | Family                         | Decision                | 若未来重开所需条件                                                               |
| ------ | ------------------------------ | ----------------------- | -------------------------------------------------------------------------------- |
| R1-1b  | schema identity/version        | **Deferred at closure** | 某项配置决策确实依赖可比较 schema identity/version                               |
| R1-2   | layered config source          | **Deferred at closure** | support case 或产品目标要求解释 effective value、source 与 precedence            |
| R1-3   | diagnostic fault matrix        | **Deferred at closure** | 明确排障 outcome 与 containment 方案                                              |
| R2-1   | argv/stdin success             | **Deferred at closure** | disposable identity、endpoint allowlist、provider/model/region 和费用上限专项授权 |
| R2-2   | event/final JSON success       | **Deferred at closure** | deterministic fake provider 或同等 R2 专项授权                                   |
| R2-3   | legal output schema            | **Deferred at closure** | legal success 与 unsatisfiable fixture 的可控 provider                            |
| R2-4   | machine provider error taxonomy | **Deferred at closure** | deterministic transient/permanent error source；Qwen 本地 contract 可独立实施    |

Stop-line count：`7/7 Deferred at closure`。

其中 D01“Qwen 机器错误契约”可以基于已有 Qwen 失败路径另行设计和实现，不要求先重开
R2-4 的三产品 provider 横向 probe。

## 3. 冻结与完整性

| Object                    | Frozen value                                                         |
| ------------------------- | -------------------------------------------------------------------- |
| Codex cohort              | `0.145.0 / latest / CLI / Darwin arm64 non-TTY`                       |
| Claude Code cohort        | `2.1.212 / stable / CLI / Darwin arm64 non-TTY`                       |
| Qwen Code cohort          | `0.21.0 / effective latest / CLI / Darwin arm64 non-TTY / Node`       |
| Phase 2B artifact         | `bdbc65635d4e2ec454bd4bed03d5e29c82f97a6154f57dc28ebba00d167a5393`   |
| Phase 2C artifact         | `37e6d06dd6ac34cf5dab1de179568f1d5495f669d77ebab365e76148f3dd36b8`   |
| Phase 2C runner           | `fd19b1a4ce4ceb9944591e8c88d4ceb1c5435f59c32a6984dd969b637662062a`   |
| Seatbelt profile          | `ff5f599cad03d5c257827314c5a483e3cffaa2fef2d7b70a433e376ad1c700e6`   |
| Final runtime probes      | `0`                                                                  |
| Credential reads          | `0`                                                                  |
| Provider/model calls      | `0`                                                                  |
| Model cost                | `0`                                                                  |

New runtime probes: 0. 本结案只综合现有 frozen evidence，没有下载新版本、访问已有凭据、
调用模型或探测外部 provider。

## 4. 关闭条件

| Gate                                                                    | Result |
| ----------------------------------------------------------------------- | ------ |
| 12 个主题都标明 Surface、runtime 与外推边界                             | Pass   |
| Headless success 保持 `Not assessed`                                    | Pass   |
| Config pairwise 保持一个 `Partial overlap`、两个 `Unknown`              | Pass   |
| 550 / 425 / 38 / 95 只解释为 evidence coverage，不解释为得分            | Pass   |
| 一个 `Now`、一个 `Next`、四个 `Observe`、两个 `No-build` 可追溯到证据   | Pass   |
| 7 个剩余 probe 全部显式 `Deferred at closure`                           | Pass   |
| 未读取凭据、未产生 provider/model 调用或费用                            | Pass   |
| 未修改产品源码，原有 dirty worktree baseline 保持                       | Pass   |
| 最终 validator 递归通过 Phase 2C→2B→2A 及上游 gate                      | Pass   |

## 5. 重开规则

只有以下情况之一发生时才重开本研究：

1. 三产品任一冻结主版本变化，且决策需要 current behavior；
2. `Now`/`Next` 方案被某个 `Unknown` 实质阻塞；
3. 出现可量化用户问题，需要用 aligned runtime 区分产品策略；
4. 用户另行授权 R2 所需 identity、endpoint、模型范围和费用上限。

重开时创建版本增量，不覆盖本快照。否则以
[Qwen Decision Register](./22-qwen-opportunities-and-decisions.md)
作为后续讨论入口。

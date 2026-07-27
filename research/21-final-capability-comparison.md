# Codex / Claude Code / Qwen Code：最终能力对比

> 状态：Final / Closed  
> 冻结 Cohort：Codex `0.145.0/latest`、Claude Code `2.1.212/stable`、Qwen Code
> `0.21.0/effective latest`  
> 结案时间：2026-07-26T13:51:22Z

## 1. 一页结论

这份证据不支持可靠的三产品总排名。多数主题只闭合了 exact-version
入口、文档、源码或 Help Surface，行为仍为 `Unknown`；Phase 2B 的 headless
成功路径没有运行，因此正式关系继续是 `Not assessed`。

唯一形成 pairwise runtime relation 的主题是配置校验：

> Codex–Claude: Partial overlap; Codex–Qwen: Unknown; Claude–Qwen: Unknown

这里的 `Partial overlap` 也不是产品等价：两者在所选 type/cross-field fixture
上都给出精确 validation outcome，但 unknown-key policy、入口和 process envelope
不同。包含 Qwen 的关系保持 `Unknown`，因为只观察了 selected startup/load route，
没有验证所有 downstream consumer。

## 2. 证据规模

| 层级                        | 数量                         | 正确解释                                     |
| --------------------------- | ---------------------------- | -------------------------------------------- |
| Registry Revision 2         | `144 topics / 550 Atomics`   | 中立用户任务全集，不是产品功能数             |
| Phase 1C exact CLI          | `425 Claims`                 | 入口与证据覆盖，不是支持率                   |
| Phase 1D.1 secondary        | `38 current Claims`          | exact secondary Slice 覆盖，不是生态规模     |
| Phase 2A CAP-10 + CAP-12    | `95 Comparison Records`      | `20` cross-product candidates，`0` runtime-comparable |
| Phase 2B aligned runtime    | `8 scenarios / 23 executions` | 失败路径与本地 gate；model success=`0`       |
| Phase 2C config runtime     | `5 scenarios / 15 executions` | 一个 `Partial overlap`、两个 `Unknown`       |

以上数字都不是得分，不能相加、换算支持率或用来选 winner。详细统计见
[Phase 1C](./07-phase-1c-coverage-and-open-claims.md)、
[Phase 1D.1](./14-phase-1d1-coverage-and-open-claims.md) 和
[Phase 2A](./16-phase-2a-coverage-and-open-comparisons.md)。

## 3. 十二个决策主题

| ID  | 用户主题                        | Codex 冻结观察                                                                 | Claude Code 冻结观察                                                          | Qwen Code 冻结观察                                                                   | 当前关系                                                     |
| --- | ------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| T01 | 客户端与交互 Surface            | exact CLI/发行物及 secondary Claim 可发现；多数行为未运行                        | exact CLI Claim 可发现；本轮无可准入 secondary artifact Claim                  | exact CLI 与 27 条 current secondary Claim；各 Surface 不互相继承                    | Surface co-presence；behavior `Unknown`                       |
| T02 | 规划、任务与执行控制            | 有 pre-runtime Claim；未对齐完成任务结果                                          | 有 pre-runtime Claim；未对齐完成任务结果                                       | 有 pre-runtime Claim；未对齐完成任务结果                                              | Surface-only；behavior `Unknown`                              |
| T03 | 会话、上下文与记忆              | Claim 只绑定 exact Slice；未做共同 fixture                                        | Claim 只绑定 exact Slice；未做共同 fixture                                     | Claim 只绑定 exact Slice；未做共同 fixture                                            | Surface-only；behavior `Unknown`                              |
| T04 | 权限、沙箱与治理                | Help/docs/source 不能替代相同危险动作的 runtime                                   | Help/docs/binary 不能替代相同危险动作的 runtime                                | Help/docs/source 不能替代相同危险动作的 runtime                                       | gate 未对齐；behavior `Unknown`                               |
| T05 | MCP、Skills、Hooks、Plugin/扩展 | 产品术语和入口已记录；扩展边界未做共同 fixture                                    | 产品术语和入口已记录；扩展边界未做共同 fixture                                 | 产品术语和入口已记录；扩展边界未做共同 fixture                                        | 命令名不可横比；behavior `Unknown`                            |
| T06 | 多 Agent、后台任务与 Worktree   | 只有有界 Surface Claim                                                            | 只有有界 Surface Claim                                                         | descriptor 与部分 daemon 管理面不证明 task orchestration                              | Surface-only；behavior `Unknown`                              |
| T07 | Git、Review 与 CI               | CLI 与 CI/remote 是不同 Slice；secondary identity 未全锁                          | CLI 与 Action/remote client 是不同 Slice；secondary identity 未锁              | CLI 与 CI/IDE/Web Shell 是不同 Slice；部分 current secondary Claim 已锁              | artifact-asymmetric；不做 parity                              |
| T08 | Headless、stdin、事件与 schema  | argv 到达 deny-network retry；stdin bytes 已送达 child，产品消费未证明；只见 partial failure JSONL                    | argv 到达 local no-auth gate；stdin bytes 已送达 child，产品消费未证明；只见 complete failure JSONL                | argv 到达 local missing-key gate；stdin bytes 已送达 child，产品消费未证明；只见 terminal failure JSON                   | success 未运行；正式关系 `Not assessed`                      |
| T09 | SDK、daemon、remote 与 channel  | app-server/MCP 只闭合 schema/contained startup 层                                 | 本轮 secondary frozen Slice 缺准入 Claim，不表示产品缺少该 Surface             | health/readiness/capabilities/log 与 graceful listener cleanup 有有界 runtime         | gate/resource 不同；不可判 task-service parity               |
| T10 | 模型、provider 与认证门禁       | 未使用真实凭据，provider/model 正常结果未知                                        | 未使用真实凭据，provider/model 正常结果未知                                    | 未使用真实凭据，provider/model 正常结果未知                                            | model-success=`0`；behavior `Unknown`                         |
| T11 | 配置 schema 校验                | strict gate 对 type/unknown/cross 精确拒绝，stderr + non-zero                      | explicit loader 对 type/cross 返回 source error，unknown passthrough，exit `0` | selected startup route 对三类 invalid fixture 均未拒绝；consumer 行为未测             | C–Cl `Partial overlap`；C–Q/Cl–Q `Unknown`                    |
| T12 | 诊断、日志、可观测性与清理      | contained `doctor --json` 返回 18 checks；其他对齐 outcome 未闭合                  | exact `--bare doctor` 为空且 exit `0`；不能解释为没有诊断                       | daemon health/status/log 与 graceful parent/listener cleanup 有有界证据               | entry、资源对象和 failure gate 不同；不可判优劣              |

T01–T07 的目的只是给研发提供导航，不是 checkbox matrix。对应的 Claim 与限制见
[Phase 1C CLI coverage](./07-phase-1c-coverage-and-open-claims.md) 和
[Phase 1D.1 secondary coverage](./14-phase-1d1-coverage-and-open-claims.md)。

## 4. 直接 runtime 差异

### Headless 与结构化输出

Harness 已向三产品 child stream 交付相同的 non-TTY 输入，但这不证明产品或 provider
消费了 stdin；同时没有共同的成功任务：

- Codex 在 contained deny-network 环境进入 transport retry，两个 non-empty case
  到 harness timeout，只有 partial JSONL。
- Claude Code 在 no-auth gate 输出三行完整 failure JSONL。
- Qwen Code 在 missing-key gate 输出一个 terminal JSON result；document 包含
  correlation 与运行元数据，但 error payload 只有自由文本 message，缺少稳定的
  category、stage 和 retryability。
- 三产品都本地拒绝 malformed output schema；legal schema success 与
  unsatisfiable legal schema 仍未运行。

因此不能从失败 envelope 推出 JSON 与 JSONL 的优劣，也不能声称成功生命周期等价。
完整结果见
[headless runtime](./comparisons/phase-2b-headless-runtime.md)。

### 配置校验

Phase 2C 对齐了 valid、known-field type error、unknown top-level field 和
cross-field invalid 四类 fixture。准确结论是 loader/gate policy 不同，而不是
“某产品有 schema、某产品没有 schema”。完整行为、退出语义与边界见
[config schema runtime](./comparisons/phase-2c-config-schema-runtime.md)。

### daemon 与诊断

Qwen 的 bounded daemon runtime 已证明 descriptor、health/readiness、persistent
log 和 graceful parent/listener cleanup；它没有证明 session、SSE、task、model
或 crash cleanup。Codex 的 app-server/MCP schema/startup 与 Qwen management route
不是同一 outcome。三产品 doctor 入口也不对齐，见
[diagnostics and config runtime](./comparisons/phase-2b-diagnostics-and-config-runtime.md)。

## 5. 产品解释边界

- 不从 Claim 数量、命令数量或 Surface 数量生成总榜。
- 不把 `Unknown`、无 Claim 或 probe blocked 写成 `Not supported`。
- 不把 Codex strict unknown-key policy直接设为 Qwen 应复制的默认策略。
- 不把 Claude process exit `0` 写成配置有效。
- 不把 Qwen selected loader 的 non-rejection 外推到全部 consumer。
- 不把 Qwen daemon management evidence 写成 task/session/model 已验证。
- 不把 Claude secondary Claim 为 `0` 写成产品没有 secondary Surface。

面向 Qwen 的收敛决策见
[Qwen 机会与决策](./22-qwen-opportunities-and-decisions.md)。

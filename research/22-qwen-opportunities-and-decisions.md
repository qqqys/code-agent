# Qwen Code：机会与决策

> 状态：Final / Closed  
> 输入：[最终能力对比](./21-final-capability-comparison.md)  
> 结案时间：2026-07-26T13:51:22Z

## 1. 决策摘要

本轮提出一个可直接行动的 Qwen 契约改进候选：headless 失败结果缺少稳定、
机器可判定的错误阶段与 retryability。它是基于冻结证据作出的产品判断，不是证据
自动确认的用户 Gap。另有一个 `Next` 调查项；其余项目观察或明确不为竞品形态复制
而建设。

| Bucket     | 数量 | 结论                                                         |
| ---------- | ---: | ------------------------------------------------------------ |
| `Now`      |    1 | 机器错误契约                                                 |
| `Next`     |    1 | 配置 consumer 一致性调查                                     |
| `Observe`  |    4 | daemon task/session 契约；分层来源；集中诊断；成功 lifecycle |
| `No-build` |    2 | 默认 strict unknown rejection；竞品形态复制                 |

这是一份 evidence-based decision proposal，不是已承诺的产品 roadmap。
本文件不构成实现授权。`Now`/`Next` 是产品判断，不表示冻结 Evidence 已证明用户影响
或现有实现缺陷。

## 2. Decision Register

| ID  | 决策       | 用户问题                                             | 当前证据                                                                                              | 进入条件 / 验证指标                                                                                                                                       | 边界                                                                                           |
| --- | ---------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| D01 | **Now**    | 自动化调用方需要稳定判断错误阶段及是否重试           | Qwen missing-key result document 含 `session_id`、`uuid`、`subtype`、`is_error`、`num_turns` 与 usage；error payload 只有自由文本 message；invalid schema exit `52` 且无 machine error stdout | 先验证真实调用方需求，再让 argv/stdin 的 auth、schema、provider transient、tool failure、cancel 返回版本化 code/category/stage/retryable/correlation；机器输出不含 secret | 这是改进提案，不是已确认用户 Gap；只确认 `0.21.0` 的已测失败路径；不复制竞品 exit code；成功任务仍 `Unknown` |
| D02 | **Next**   | 同一配置可能通过 startup loader，之后才被 consumer 处理 | selected route 对 type/cross/unknown 都 exit `0`；两组含 Qwen Phase 2C relation 均为 `Unknown`         | 先盘点 consumer；同一 fixture 在 interactive/headless/daemon/Web Shell/settings API 获得声明一致的结果；非法 known value 不静默进入 consumer；迁移无数据丢失 | 这是 consistency risk 的调查，不证明现有缺陷；不声称所有 consumer 接受非法值；unknown-key policy 单独决策 |
| D03 | **Observe** | 长驻任务的提交、查询、取消、重连与唯一终态是否闭合   | daemon 只在 `/health` 与 unknown route 验证无/错 bearer；另闭合 readiness/capabilities/log/graceful listener cleanup；task/session/SSE 未运行 | 有明确互操作或可靠性目标后，用 deterministic fake provider 验证 submit→query→event→cancel/reconnect；若发现缺陷再 harden                           | 当前契约为 `Unknown`，不证明不支持、存在缺陷或领先                                             |
| D04 | **Observe** | 用户难以解释 system/user/project/local 的最终生效值 | layered runtime 未执行                                                                                | 真实 support case 达阈值后验证 effective value/source/precedence/unknown/trust gate，并评估只读 explain 输出                                            | 当前是 `Unknown`，不登记为 Gap                                                                 |
| D05 | **Observe** | 本地环境失败时是否需要集中、机器可读的排障入口       | Codex contained doctor 有 18 checks；Qwen 已有 daemon health/status/log；入口与 gate 不同              | 先测支持工单定位时长、remediation 命中率、误报率和副作用；达阈值后设计 shared checks 的薄入口                                                            | 不因没有同名 command 声称 Qwen 没有诊断能力                                                     |
| D06 | **Observe** | CI 是否需要稳定的成功 event/final 生命周期          | Phase 2B 只有无凭据失败路径；三产品 model-success=`0`                                                  | 以后用 deterministic fake provider 或专项授权验证 exactly-one terminal、顺序、argv/stdin 等价、取消与 partial result                                  | 不从当前 failure JSON/JSONL 形态判断 parity 或优劣                                             |
| D07 | **No-build** | 是否默认拒绝未知配置字段                             | Codex 只在 strict gate 拒绝；Claude passthrough；Qwen 只证明 selected route 的磁盘保留                 | 保持 unknown 字段无数据丢失；若出现明确需求，只评估显式 lint/strict mode 及跨版本兼容率                                                                 | forward compatibility、插件字段和跨版本配置优先；不声称当前策略已全面正确                      |
| D08 | **No-build** | 是否复制竞品 command、exit code、JSONL 或远端形态    | Phase 2A `runtime-comparable=0`；大量记录仍 single-product 或 evidence-asymmetric                      | 只有明确用户任务、互操作要求与可量化收益后重新立项                                                                                                      | `No-build` 表示本轮不为 parity 建设，不永久否定背后的用户问题                                  |

## 3. 建议实施顺序

1. `Now`：先定义机器错误 envelope 和兼容/versioning 规则，再补失败路径 contract
   tests；不依赖外部 provider 即可覆盖 schema/auth/cancel 的本地部分。
2. `Next`：调查配置字段的 loader→effective config→consumer 读点，先声明
   known-invalid 与 unknown-key 的不同 policy，再统一 CLI/daemon/Web Shell 边界。
3. `Observe`：只有明确互操作或可靠性目标后，才用 deterministic fake provider
   验证 daemon task/session lifecycle；先验证现有协议，不扩张为新的托管服务。

以上顺序只表达证据与依赖关系。进入实现前仍需单独确认产品目标、兼容策略和 owner。

## 4. 明确不做的外推

- 不按三产品 feature count 排优先级。
- 不把竞品的命令名或 JSON shape 当作需求。
- 不把无凭据失败路径当作成功自动化契约。
- 不把 selected loader 行为写成产品级配置能力结论。
- 不因当前缺少 aligned Evidence 而建设 SDK、CI、IDE 或 channel parity。

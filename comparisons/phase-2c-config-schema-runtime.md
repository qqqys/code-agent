# Phase 2C：Config Schema Runtime 对比

> Atomic：`CAP-12.09-A02` · 按 schema 验证配置  
> Cohort：Codex `0.145.0/latest`、Claude Code `2.1.212/stable`、Qwen Code `0.21.0/stable`  
> Evidence：[`phase-2c-config-schema.md`](../evidence/phase-2c-config-schema.md)  
> Raw SHA-256：`37e6d06dd6ac34cf5dab1de179568f1d5495f669d77ebab365e76148f3dd36b8`

## 1. Direct Runtime Matrix

| Fixture               | Codex `--strict-config exec`                                                                   | Claude explicit `get_settings`                                                               | Qwen `--list-extensions`                                                                          |
| --------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| valid                 | accepted；到达 local empty-prompt gate                                                        | accepted；field 同时出现在 `effective`、`flagSettings` source 和 `applied`                   | accepted；命令正常完成                                                                            |
| known-field type error | rejected；file `1:31`、expected boolean、source line 和 caret                                  | explicit source rejected；error path=`model`、expected string                                | startup/load 不拒绝；命令正常完成，user + supporting config 保持不变                              |
| unknown top-level key | rejected；file `1:1`、unknown field、source line 和 caret                                      | passthrough；unknown field 出现在 `effective` 和 `flagSettings` source                       | startup/load 不拒绝；无 visible warning；只确认 fixture 在磁盘保持不变                            |
| cross-field invalid   | rejected；MCP table `1:1`、`url is not supported for stdio`                                    | explicit source rejected；返回 nested marketplace path 和 key/name mismatch                 | startup/load 不拒绝；该 route 未初始化真正消费 hook 条件的 HookRegistry                           |

进程 exit 不能直接横比：

- Codex 用 exit `1` 表示 config failure；valid 也因刻意的 empty prompt exit `1`；
- Claude 四例都 exit `0`，validation outcome 位于 control response；
- Qwen 四例都 exit `0`，selected entry 没有公开 validation result。

## 2. Behavior Contract

### Entry and input

- Codex：canonical `CODEX_HOME/config.toml`，显式 strict gate。
- Claude Code：explicit JSON `--settings` source，通过无 model turn 的
  `get_settings` control request 读取 effective/source/errors。
- Qwen Code：user `settings.json`，通过 settings-load 后的本地
  `--list-extensions` entry 观察 startup rejection。

三入口都是 CLI/non-TTY/local/no-model，但 strictness 与可观察输出不同。它们对齐的是
fixture category 和“在 provider/model 前是否精确处理”，不是 command-shape parity。

### Output and failure

- Codex 将 validation failure 写入 stderr 并用 non-zero exit；type/unknown/cross 都有
  file + line/column + source context。
- Claude 将 explicit source 的 validation error 放入结构化 response；invalid source
  不进入 effective/source，但 process envelope 与 exit 仍成功。
- Qwen selected loader 只处理 parse/object/version/migration，不递归执行内部
  settings metadata validator；本入口对 type/cross 没有 visible failure。

### State

- 所有 primary fixture 都在运行前后保持 `0444` 和相同 SHA-256。
- Qwen system/default/trust/approval 四个 supporting input 也保持不变。
- 所有新增 state 都位于独立 execution `state/`；无 repo/fixture 外写。

## 3. Pairwise Comparison Records

```yaml
comparison_id: CMP-CAP-12.09-A02-codex-claude-code-001
atomic_capability_id: CAP-12.09-A02
user_job: 在 provider/model 运行前定位配置类型、未知字段和非法组合
left:
  product: Codex
  claim_ids: [CCQ-codex-CAP-12.09-A02-001]
right:
  product: Claude Code
  claim_ids: []
alignment_state: Partial overlap
material_differences:
  surfaces: [both exact CLI loaders; TOML strict startup versus JSON explicit-source control query]
  gates: [Codex unknown rejection requires strict-config; Claude normal loader is passthrough]
  state_and_persistence: [both preserve the read-only primary fixture]
  failure_semantics: [stderr plus exit 1 versus structured source error plus exit 0]
confidence: Medium
rationale: Both accept valid config and precisely reject the selected type/cross violations, but unknown-field and process failure semantics materially differ; Claude has no frozen CAP-12.09-A02 Claim to normalize yet.
last_checked: '2026-07-26T12:43:43.496Z'
```

```yaml
comparison_id: CMP-CAP-12.09-A02-codex-qwen-code-001
atomic_capability_id: CAP-12.09-A02
user_job: 在 provider/model 运行前定位配置类型、未知字段和非法组合
left:
  product: Codex
  claim_ids: [CCQ-codex-CAP-12.09-A02-001]
right:
  product: Qwen Code
  claim_ids: [CCQ-qwen-code-CAP-12.09-A02-001]
alignment_state: Unknown
material_differences:
  surfaces: [strict task startup versus local list command after settings load]
  gates: [Codex recursively validates selected fields and combinations; Qwen startup loader does not invoke its internal metadata validator]
  state_and_persistence: [both preserve the primary fixture; Qwen also has four frozen supporting config inputs]
  failure_semantics: [precise pre-task rejection versus bounded non-rejection and normal command completion]
confidence: Medium
rationale: The selected Qwen startup/load slice does not reject the known type, unknown, or cross-field cases that Codex rejects, but valid acceptance is not a positive validation criterion and later Qwen consumers remain untested. The bounded negative cannot establish Partial overlap or product-wide Not supported.
last_checked: '2026-07-26T12:43:43.496Z'
```

```yaml
comparison_id: CMP-CAP-12.09-A02-claude-code-qwen-code-001
atomic_capability_id: CAP-12.09-A02
user_job: 在 provider/model 运行前定位配置类型、未知字段和非法组合
left:
  product: Claude Code
  claim_ids: []
right:
  product: Qwen Code
  claim_ids: [CCQ-qwen-code-CAP-12.09-A02-001]
alignment_state: Unknown
material_differences:
  surfaces: [explicit effective-settings query versus local list command after settings load]
  gates: [Claude validates selected known fields and cross constraints; both normal loaders do not reject an unknown top-level key]
  state_and_persistence: [Claude reports unknown effective/source; Qwen evidence proves only on-disk preservation]
  failure_semantics: [structured source errors versus no visible startup/load validation result]
confidence: Medium
rationale: Claude exposes and enforces the selected type/cross constraints, while Qwen consumer-level validation remains outside this probe. Shared valid acceptance and unknown non-rejection do not close the Atomic validation outcome, so the pair cannot yet be compared reliably.
last_checked: '2026-07-26T12:43:43.496Z'
```

## 4. Qwen Code Engineering Reading

这不是“Qwen 没有 schema”的结论。冻结包中存在 settings metadata、leaf/API
validator 和 consumer-specific hook validation；本轮确认的是它们没有形成统一的
startup/load validation gate。

因此准确的候选问题是：

> 同一个 user settings 文件可以通过 startup loader，随后才由 UI/API 或具体
> consumer 以不同方式验证、忽略或丢弃。

在进入 Gap/roadmap 前还需确认：

1. 哪些 entry 应共享 startup validation，哪些必须容忍 forward-compatible unknown；
2. validation 应 fail-fast、warning、per-field salvage，还是 consumer-local；
3. system/user/workspace layer 合并前后各验证一次还是只验证 effective config；
4. daemon/settings API、interactive CLI、headless、Web Shell 的 downstream consumers；
5. migration 与 schema version 如何避免把旧配置误判为 invalid。

这些属于后续设计输入，不是本阶段实现授权。

## 5. Boundary

- 不把 Codex strict unknown policy写成默认 policy；
- 不把 Claude exit `0` 写成“配置有效”；
- 不把 Qwen startup non-rejection 写成“所有 consumer 接受”或产品级
  `Not supported`；
- 不创建功能总分、优先级或 roadmap；
- R1-1b schema identity/version、R1-2 layering 与 R2 model-success 仍未执行。

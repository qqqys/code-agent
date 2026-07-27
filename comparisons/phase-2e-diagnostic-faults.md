# Phase 2E Comparison：Diagnostic Faults

> Atomic：`CAP-12.05-A02`  
> Pairwise conclusion：三组均 `Not assessed`

## Selected runtime observations

| Fault | Codex `0.145.0` | Claude `2.1.212` | Qwen `0.21.0` |
| --- | --- | --- | --- |
| missing executable | Not assessed；profile 无有效 Git control | Not assessed；未执行 interactive doctor | Observed；Git/npm PATH warning |
| unwritable state/log | Not assessed；未选定 write contract | Not assessed；未执行 interactive doctor | Observed；stderr-only degraded logging |
| bad CA | Observed；PEM parse error | Not assessed；未执行 interactive doctor | Not assessed；status 只盘点 env |
| corrupt cache | Observed；version cache parse error | Not assessed；未执行 interactive doctor | Not assessed；无 selected cache consumer |

## Pairwise records

| Pair | Relation | Reason |
| --- | --- | --- |
| Codex ↔ Claude | Not assessed | Claude safe selected entry 没有 fault payload；不能用 Codex 局部结果代替 |
| Codex ↔ Qwen | Not assessed | doctor 的 network/update/git checks 与 daemon preflight/log health 不是相同 entry 或 state target |
| Claude ↔ Qwen | Not assessed | Claude interactive install doctor 未执行，Qwen 结果不能投影到该 surface |

## 不允许的结论

- 不从“某行 Observed、另一行 Not assessed”推出产品优劣；
- 不把 `Not assessed` 写成 `Not supported`；
- 不把同名 `doctor`、`status` 或 `preflight` 当作行为等价；
- 不把 detection 写成 remediation 或 auto-repair；
- 不把 deny-exec 下的 `EPERM → missing_file` 当作真实缺失文件。

## 对 Stage 4 的候选输入

仅有两项需要产品判断，而非自动立项：

1. Qwen 是否应把 `ENOENT`、`EACCES` 与 `EPERM` 分成不同 machine error taxonomy；
2. Qwen 是否需要为 settings/status 增加更通用的 provenance/explain，而不是只依靠
   unique sentinel 或当前局部字段。

它们必须在 Stage 4 经过用户价值、现有能力与实现成本收敛后，才能进入 backlog。

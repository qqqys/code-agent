# Codex / Claude Code / Qwen Code 对比：阶段 3 重开与 Phase 2D 方法

> 阶段：3 · 场景验证  
> 状态：Executed / Frozen  
> Frozen at：2026-07-26T14:55:55.508Z  
> 重开方式：additive；不覆盖 Phase 2A–2C 与早期结案快照  
> Cohort：Codex `0.145.0`、Claude Code `2.1.212`、Qwen Code `0.21.0`
> Raw artifact：[`config-identity-layering.json`](./artifacts/phase-2d/config-identity-layering.json)  
> Raw SHA-256：`dc74e8fd2a4caa06cac8481743bb6e1fdb76c403b21229673fce1ef29f3b3187`

## 1. 为什么重开

早期结案把七个未执行 probe 标为 `Deferred at closure`。用户随后明确要求恢复原始
`0–6` 总计划，因此该结案继续作为历史快照保留，而不是当前 stop-line。阶段 3
按风险重新排队：

| Tranche | Probe | 当前处理 |
| --- | --- | --- |
| Phase 2D | `R1-1b` schema identity/version mechanism | 执行；无凭据、无模型 |
| Phase 2D | `R1-2` layered config source | 执行；无凭据、无模型 |
| Phase 2E | `R1-3` diagnostic fault matrix | Phase 2D 后执行；containment-sensitive |
| R2 | `R2-1` 至 `R2-4` | 继续 Deferred；等待独立 identity/endpoint/model/region/cost 授权或 deterministic fake provider |

这次重开不改变冻结版本，也不把历史 `Unknown` 自动升级为支持或不支持。

## 2. Phase 2D 的两个问题

### 2.1 Schema identity / version mechanism

问题不是“谁都有一个更大的 schema version”，而是每个产品如何标识其配置契约：

- Codex exact tag 的 `codex-rs/core/config.schema.json` 是由当前 `ConfigToml` 生成的
  draft-07 schema；根没有 `$id` 或独立 version。身份由 exact release tag、路径和
  content SHA-256 组成。
- Claude Code runtime `get_settings` 不公开 schema id/version。官方编辑器 schema
  位于 SchemaStore，必须 pin commit；它与 exact binary 内 runtime validator
  分离，不能假定完全等价。
- Qwen Code frozen bundle 明确导出 `SETTINGS_VERSION=4` 与
  `SETTINGS_VERSION_KEY="$version"`，并包含 `v1→v2→v3→v4` 与 `v5→v4`
  migration boundary。

因此三方关系只能写作 `Different mechanisms / Not directly comparable`。Codex
schema 的 JSON Schema draft、Claude editor schema 的 draft，以及 Qwen settings
format version 是三种不同概念。

### 2.2 Layered effective config 与 source

使用产品各自的只读 reader，而不是从 model/auth failure 间接推断：

| Product | Frozen entry | 直接观察 |
| --- | --- | --- |
| Codex | `app-server` 的 `config/read` | `config`、`origins`、`layers` |
| Claude Code | CLI stream-json `get_settings` control request | `effective`、`sources`、`applied`、`errors` |
| Qwen Code | daemon `/workspace/settings`、`/workspace/trust`、`/capabilities` | effective/raw workspace 值、trust gate、workspace descriptor |

三者 layer taxonomy 不等价：

- Codex 有 `user`、一个或多个 `project`、`sessionFlags` 和 managed/system 类型，
  但没有原生 `local` 类型。本轮不改写 `/etc`，所以 modern system conflict 不物化。
- Claude 有 managed/CLI/local/project/user；本轮主要物化 user/project/local。
  任何 SDK parent policy probe 都必须单独标注，不能冒充 OS MDM/system policy。
- Qwen 有 `SystemDefaults`、`User`、`Workspace`、`System`，没有 `local`。workspace
  settings 是否参与 merge 受 folder trust 控制。

即使所有 runtime probe 为绿，也只关闭各自 exact entry 下的 value、precedence 和
trust observation；完整三方 source-explanation alignment 不得写成 `Equivalent`。

## 3. Fixture 设计

### Codex

- isolated `CODEX_HOME/config.toml` 物化 user sentinel；
- repo root 与 nested directory 各有 `.codex/config.toml`，观察多 project layer；
- trusted 与 untrusted twin 观察 project trust gate；
- `-c` twin 观察 `sessionFlags` 是否覆盖 project；
- `config/read` 显式请求 `includeLayers=true`。

System 层只记录 reader 返回的存在/空值，不创建或修改 `/etc/codex/*`。closest
project layer 不重命名为 local。

### Claude Code

- isolated user `settings.json`；
- repo `.claude/settings.json`；
- repo `.claude/settings.local.json`；
- 用 harmless scalar sentinel 观察 `local > project > user`，并保留每个
  `sources[]` 原始值；
- 不发送 user message，不产生 model turn。

Print/control mode 不覆盖 interactive workspace-trust prompt；该边界保持 Unknown。

### Qwen Code

- 所有 settings fixture 都固定 `$version: 4`，避免 migration 写入；
- `SystemDefaults`、`User`、`Workspace`、`System` 使用互不相同 sentinel；
- trusted-folders twin 分别写 `TRUST_FOLDER` 与 `DO_NOT_TRUST`；
- daemon 只绑定 loopback、固定非秘密 bearer、禁止远端网络；
- 观察 `/workspace/settings`、`/workspace/trust` 与 `/capabilities` 后有界关闭 listener
  和原 process group。

如果 `/workspace/settings` 没有给出通用 system provenance，只能通过唯一 sentinel
作有界归因，不能声称存在原生 source explanation。

## 4. Containment

- child environment 从 allowlist 构造，不继承 credential、proxy、endpoint 或用户
  配置；
- Codex/Claude 运行在 deny-default、deny-network Seatbelt；
- Qwen 只允许 loopback bind/connect，远端网络拒绝；
- 每个 scenario 使用独立 repo、state 和 fixture；
- 永久写只允许当前 scenario state；配置输入在执行前后按 mode 与 SHA-256 复核；
- non-TTY、有界 timeout、`SIGTERM`/`SIGKILL` cleanup；
- 捕获 command、stdin、stdout、stderr、exit/protocol、fixture hash 和 side effect。

Containment 不是完整 syscall trace。原 process-group cleanup 不覆盖主动创建新 session
的 descendant；pre/post hash 不能排除瞬时 modify-and-restore。

## 5. Projection 与停止线

1. editor schema 不等于 runtime validator。
2. exact tag/path/hash 不等于 released binary 的密码学 build provenance。
3. Qwen `$version:4` 不改变 Phase 2C consumer-level validation `Unknown`。
4. 一个层的唯一 sentinel 可以证明本 fixture 的 effective provenance，但不能替代
   reader 未公开的通用 source API。
5. 未物化的 managed/system/local layer 保持 `Not assessed`，不写成不存在。
6. Phase 2D 不读取凭据、不调用模型、不产生模型费用。
7. Phase 2D gate 通过后进入 Phase 2E；R2 继续等待专项授权。

## 6. Frozen outputs

- [`probes/06-phase-2d-config-identity-layering-probes.md`](./probes/06-phase-2d-config-identity-layering-probes.md)
- [`evidence/phase-2d-config-identity-layering.md`](./evidence/phase-2d-config-identity-layering.md)
- [`comparisons/phase-2d-config-identity-layering.md`](./comparisons/phase-2d-config-identity-layering.md)
- [`25-phase-2d-config-identity-layering-results.md`](./25-phase-2d-config-identity-layering-results.md)
- [`scripts/validate-phase-2d.mjs`](./scripts/validate-phase-2d.mjs)

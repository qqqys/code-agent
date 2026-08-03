# Claude Code Sandbox 网络严格 Allowlist

Claude Code 在 v2.1.219（2026-07-24）新增 `sandbox.network.strictAllowlist` 设置：开启后沙箱化命令访问 Allowlist 之外的主机直接拒绝，不再弹出审批。官方 Sandboxing 文档同时记录 Managed 场景下同等效果的 `allowManagedDomainsOnly`。矩阵 `security-network`（网络隔离）字段此前只记录域名代理与 Allow/Deny，本次补上严格名单行为。

## 修正

- `security-network` 的 Claude Code 矩阵结论由“Sandbox 域名代理与 Allow/Deny”更新为“Sandbox 域名代理与 Allow/Deny；`strictAllowlist` 直接拒绝未列主机”。
- Claude Code 详情行为补充：默认不预允许任何域名，首次使用新域名触发审批；`sandbox.network.strictAllowlist` 开启后直接拒绝 Allowlist 之外主机；Managed 的 `allowManagedDomainsOnly` 同样自动阻断未列域名，且只认 Managed 来源的 Allow 规则；严格名单只约束沙箱内命令，WebFetch 等进程内工具仍按自身权限规则判断。
- Claude Code 详情保存与作用域补充：`strictAllowlist` 只在用户、Managed 或 `--settings` 设置中生效，仓库 `.claude/settings.json` 或 `.claude/settings.local.json` 中设置无效。
- 新增跨产品事实：Claude Code 对未列域名默认逐次审批，`sandbox.network.strictAllowlist` 或 Managed `allowManagedDomainsOnly` 可改为直接阻断。
- 新增来源 `claude-sandbox-strict-allowlist`，固定到 v2.1.219 的 CHANGELOG.md 提交 SHA。
- `docs/09-版本与证据.md` 的 Claude Code 坐标材料与官方来源表同步补充。
- 其余四家结论不变。

## 影响页面

- [权限与沙箱矩阵](../docs/03-权限与沙箱矩阵.md)
- [网络隔离详情](../docs/capabilities/security/security-network.md)

## 证据版本

- Claude Code 官方 Sandboxing 文档（`https://code.claude.com/docs/en/sandboxing`）：网络默认为 “no domains are pre-allowed by default. The first time a command needs a new domain, Claude Code prompts for approval.”；`sandbox.network.strictAllowlist` 设为 `true` 后 “Claude Code denies sandboxed commands access to any host outside the allowlist instead of prompting”，仅用户、Managed 或 CLI `--settings` 设置生效，仓库 `.claude/settings.json`、`.claude/settings.local.json` 中设置无效，且只对沙箱化命令强制执行，WebFetch 等进程内工具仍按权限规则判断；`allowManagedDomainsOnly` 在 Managed 设置中使 “non-allowed domains are blocked automatically instead of prompting, and only `allowedDomains` and `WebFetch(domain:...)` allow rules from managed settings are honored.”。
- Claude Code 官方仓库 CHANGELOG.md 提交 `0c188278cdf9`（v2.1.219，2026-07-24）：“Added `sandbox.network.strictAllowlist` setting to deny non-allowlisted hosts for sandboxed commands without prompting”。

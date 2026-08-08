# Kimi Computer Use Windows x64 支持随 0.34.0 发布

Kimi Code 官方 Release `@moonshot-ai/kimi-code@0.34.0`（2026-08-06T13:59:12Z 发布，非 prerelease）的发布说明包含 PR #2652（提交 `68ba740ebfb3`）：内置 Kimi Computer Use 能力增加 Windows x64 支持，从 `/plugins` 安装，能力安装失败时展示底层错误；同一发布还包含 PR #2686（提交 `ef610840098a`）：Windows 安装改为先探测兼容的 PowerShell、插件文件被占用时给出可操作的恢复提示、marketplace 名称统一为 `Kimi Computer Use for Windows`。矩阵此前把 Windows 支持记录为"main 分支未发布"的条件，现已过时；本次更新 `execution-computer-use` 字段的 Kimi Code 结论与详情，并按 0.34.0 实际代码修正 Windows 安装行为描述。其余四家核对无变化：Claude Code 仍无内置桌面或浏览器控制工具，Codex 的 Computer Use 仍属 ChatGPT 桌面 App Surface，Qwen Code 仍是 `computer_use__*` 内置工具，Qoder CLI 内置工具表仍未列同类工具。

## 修正

- `execution-computer-use`（桌面与浏览器控制）矩阵 Kimi Code 列由"条件：`/plugins` 内置 `kimi-cu` 与 `kimi-webbridge`；`kimi-cu` 支持 macOS 与 Windows x64（Windows 未发布）；v2 CLI"更新为"条件：`/plugins` 内置 `kimi-cu` 与 `kimi-webbridge`；`kimi-cu` 支持 macOS 与 Windows x64（0.34.0 起）；v2 CLI"。
- Kimi Code 详情入口与工具补充：Windows x64 条目 marketplace 显示名为 `Kimi Computer Use for Windows`（0.34.0 起），能力安装失败时展示底层错误。
- Kimi Code 详情执行行为更新 Windows 安装流程：安装前先探测 PowerShell 候选（系统 Windows PowerShell，随后 PowerShell 7 的 `pwsh.exe`），要求版本不低于 5.1 且具备安装脚本所需命令（探测超时 10 秒）；安装脚本由 `-File` 改为经 `-Command` 以 UTF-8 输出运行（仍为 `-NoProfile -NonInteractive -ExecutionPolicy Bypass`，超时 180 秒）；doctor 运行时探测失败时同样回退 PowerShell 7；插件文件被当前 Kimi Code 进程占用（EBUSY）时提示重启 Kimi Code 后重装。
- Kimi Code 详情条件与边界由"Windows x64 支持 2026-08-05 合入主分支（changeset 标记为 minor），0.33.0 未包含，尚未发布"更新为"Windows x64 支持（PR #2652 与 #2686 的 PowerShell 兼容、占用文件恢复修正）随 0.34.0（2026-08-06 发布）进入正式版本"。
- 跨产品事实更新为"`kimi-cu` 的 Windows x64 支持随 0.34.0（2026-08-06 发布）进入正式版本"。
- 新增来源 `kimi-cu-windows-release`（固定到 0.34.0 Release 页面）与 `kimi-cu-powershell`（固定到提交 SHA `ef610840098a57819d62d407f33256e14b512c77`）；Kimi Code 核对日期更新为 2026-08-08。

## 影响页面

- [任务执行与 Git 矩阵](../docs/06-任务执行与Git矩阵.md)
- [桌面与浏览器控制详情](../docs/capabilities/execution/execution-computer-use.md)
- [版本与证据](../docs/09-版本与证据.md)

## 证据版本

- Kimi Code 官方 Release `@moonshot-ai/kimi-code@0.34.0`（2026-08-06T13:59:12Z 发布，`prerelease: false`）：Minor Changes 包含 PR #2652（提交 `68ba740ebfb3e32ad9abdb8607f48d4387cf6f69`），发布说明原文 “Add Windows support for the built-in Kimi Computer Use capability and show the underlying error when capability setup fails. Install it from `/plugins` on Windows x64.”；Patch Changes 包含 PR #2686（提交 `ef610840098a57819d62d407f33256e14b512c77`），原文 “Use a compatible PowerShell for Windows Kimi Computer Use installation, provide actionable recovery for locked plugin files, and keep its marketplace name consistent after installation.”。发布说明同步进仓库的提交为 `d9ec566e513a`（`docs(changelog): sync 0.34.0 from apps/kimi-code/CHANGELOG.md`）。
- Kimi Code 官方仓库提交 `ef610840098a57819d62d407f33256e14b512c77`（`fix(kimi-code): select compatible PowerShell for Computer Use (#2686)`，2026-08-06T10:08:28Z）：`packages/agent-core-v2/src/app/capability/entries/kimiCu.ts` 新增 `installerPowerShell()`，按顺序探测 Windows PowerShell（`windowsPowerShellPath()`）与 PowerShell 7（`windowsPowerShell7Path()`，位于 `%ProgramW6432%` 或 `%ProgramFiles%` 下 `PowerShell\7\pwsh.exe`，默认 `C:\Program Files`），探测脚本以 `-NoProfile -NonInteractive -Command` 运行，要求 PowerShell 版本不低于 5.1 且具备 `Get-FileHash`、`Expand-Archive`、`Get-AuthenticodeSignature`、`Get-CimInstance`、`Invoke-WebRequest`、`Invoke-RestMethod`、`ConvertFrom-Json`、`ConvertTo-Json` 命令，探测超时 `WINDOWS_INSTALLER_PROBE_TIMEOUT_MS` 10000 ms，全部候选失败时报错 “Kimi Computer Use requires Windows PowerShell 5.1 or PowerShell 7 with the commands required by its official installer.”；`setup_windows.ps1` 改经 `powerShellSetupCommand()` 包装后以 `-Command` 运行（控制台与输出编码设为无 BOM UTF-8），安装超时 `WINDOWS_INSTALL_TIMEOUT_MS` 180000 ms 不变；插件层安装捕获 `EBUSY` 并转译为 “Kimi Computer Use plugin files are still in use by the current Kimi Code process. Restart Kimi Code, then install again.”；`detectRuntimeStep()` 在系统 PowerShell doctor 探测失败时回退 PowerShell 7；Windows 条目 `displayName` 改为 `Kimi Computer Use for Windows`。
- Kimi Code 提交 `68ba740ebfb3e32ad9abdb8607f48d4387cf6f69` 合入时间（2026-08-05T13:15:02Z）晚于 0.33.0 发布（2026-08-05T08:24:45Z）、早于 0.34.0 发布（2026-08-06T13:59:12Z），与该能力"随 0.34.0 发布"的结论一致。

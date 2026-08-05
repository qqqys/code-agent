# Kimi Computer Use 增加 Windows x64 支持

Kimi Code 官方仓库在 2026-08-05 合入提交 `68ba740ebfb3`（PR #2652），为内置 Kimi Computer Use 能力增加 Windows x64 支持：Windows 上同一 `kimi-cu` 能力条目对应新的后端插件 `kimi-cu-win`，从 `/plugins` 的 Official tab 安装。changeset 标记为 minor；合入时间（2026-08-05T13:15:02Z）晚于 0.33.0 发布（2026-08-05T08:24:45Z），Windows 支持尚未进入发布版本，记录为条件项。同时修正原详情中"当前发布版本（0.32.0）尚未包含"的过时表述：内置 `kimi-cu` 与 `kimi-webbridge` 条目（PR #2407）已随 0.33.0 发布。

## 修正

- `execution-computer-use`（桌面与浏览器控制）矩阵 Kimi Code 列更新为"条件：`/plugins` 内置 `kimi-cu` 与 `kimi-webbridge`；`kimi-cu` 支持 macOS 与 Windows x64（Windows 未发布）；v2 CLI"。
- Kimi Code 详情入口补充 Windows x64 上 `kimi-cu` 条目对应后端插件 `kimi-cu-win`；核心机制补充 Windows 安装产物（`kimi-cu-win` 插件与官方签名运行时 `kimi-cu.exe`）；执行行为补充 Windows 三步安装（插件、下载、运行时）与 PowerShell `-NoProfile -NonInteractive -ExecutionPolicy Bypass` 运行 `setup_windows.ps1`（超时 180 秒）、doctor 健康时跳过运行时重装；运行范围由"`kimi-cu` 仅 macOS"改为"支持 macOS 与 Windows x64（仅 `win32` + `x64`，不含 Windows arm64）"。
- Kimi Code 详情补充 Windows 就绪检测：doctor 脚本按 `KIMI_CU_WINDOWS_EXE`、`KIMI_CU_WINDOWS_HOME`、`%LOCALAPPDATA%\KimiCU\kimi-cu.exe`、`%ProgramFiles%\KimiCU\kimi-cu.exe` 查找运行时，要求输出 `mcp=true` 且 `helper=embedded`；官方插件来源允许列表新增 `cdn.kimi.com/kimi-computer-use-windows/`。
- Kimi Code 详情状态与产物补充 Windows x64 的 `kimi-cu.exe` 运行时；条件与边界改为"内置条目已随 0.33.0 发布；Windows x64 支持在 main 分支，0.33.0 未包含，尚未发布"。
- 跨产品事实更新：Kimi Code 内置能力已随 0.33.0 发布，`kimi-cu` 于 2026-08-05 增加 Windows x64 支持（main 分支，尚未发布）。
- 新增来源 `kimi-cu-windows`，固定到提交 SHA `68ba740ebfb3e32ad9abdb8607f48d4387cf6f69`。

## 影响页面

- [任务执行与 Git 矩阵](../docs/06-任务执行与Git矩阵.md)
- [桌面与浏览器控制详情](../docs/capabilities/execution/execution-computer-use.md)
- [版本与证据](../docs/09-版本与证据.md)

## 证据版本

- Kimi Code 官方仓库提交 `68ba740ebfb3e32ad9abdb8607f48d4387cf6f69`（`feat(kimi-code): support Kimi Computer Use on Windows (#2652)`，2026-08-05T13:15:02Z）：changeset `.changeset/kimi-cu-windows.md` 原文 “Add Windows support for the built-in Kimi Computer Use capability. Install it from `/plugins` on Windows x64.”，级别 minor；`packages/agent-core-v2/src/app/capability/entries/kimiCu.ts` 按平台拆分入口，Windows 入口支持条件为 `ctx.platform === 'win32' && ctx.arch === 'x64'`，后端插件 `kimi-cu-win`（插件包 `https://cdn.kimi.com/kimi-computer-use-windows/latest/kimi-cu-win-plugin.zip`），安装步骤为 plugin、download（`setup_windows.ps1`）、runtime（经 `%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -File` 执行，超时 `WINDOWS_INSTALL_TIMEOUT_MS` 180000 ms）；doctor 脚本检查 `KIMI_CU_WINDOWS_EXE`、`KIMI_CU_WINDOWS_HOME`、`%LOCALAPPDATA%\KimiCU\kimi-cu.exe`、`%ProgramFiles%\KimiCU\kimi-cu.exe`，就绪要求输出 `mcp=true` 且 `helper=embedded`；doctor 报告健康时即使插件缺失也不重装运行时；`apps/kimi-code/src/tui/utils/plugin-source-label.ts` 官方来源允许列表新增 `/kimi-computer-use-windows/` 路径；`apps/kimi-code/src/tui/commands/plugins.ts` 的移除提示逻辑把 `kimi-cu-win` 纳入能力插件集合（移除后保留运行时二进制、禁用插件接线）。
- Kimi Code 提交 `68ba740ebfb3e32ad9abdb8607f48d4387cf6f69` 处的 `docs/zh/customization/plugins.md` 与 `docs/en/customization/plugins.md`：由"Kimi Computer Use——仅限 macOS"改为"支持 macOS 和 Windows x64 的 Kimi Computer Use"（英文 “Kimi Computer Use on macOS and Windows x64”）。
- Kimi Code 官方 Release `@moonshot-ai/kimi-code@0.33.0`（2026-08-05T08:24:45Z 发布）：Minor Changes 包含 PR #2407（内置 Computer Use 与 WebBridge 能力，提交 `0abcd00f7fd3`）与 PR #2627（v2 引擎成为默认，`KIMI_CODE_LEGACY_FLAG=1` 回退），Patch Changes 包含 PR #2601（内置能力可用性与安装状态修复）；发布说明不包含 PR #2652（Windows 支持）。

# 桌面与浏览器控制

[返回任务执行与 Git 详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=execution-computer-use)

> 核对日期：2026-08-06

## 定义

由产品内置并分发的桌面 GUI 自动化或真实浏览器控制能力：Agent 读取屏幕或页面、模拟鼠标键盘、操作窗口或已登录浏览器，而不要求用户自备 MCP Server。

## 执行结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | 无内置桌面或浏览器控制工具；经 MCP 扩展 | 官方确认 |
| Codex | 条件：ChatGPT 桌面 App 的 Computer Use；CLI 未提供 | 条件项 |
| Qwen Code | `computer_use__*` 内置工具；默认开启；含浏览器 `page` 工具 | 官方确认 |
| Kimi Code | 条件：`/plugins` 内置 `kimi-cu` 与 `kimi-webbridge`；`kimi-cu` 支持 macOS 与 Windows x64（Windows 未发布）；v2 CLI | 条件项 |
| Qoder CLI | 内置工具表未列桌面或浏览器控制；经 MCP 扩展 | 官方确认 |

## 比较边界

### 本页包含

- 官方提供的桌面控制工具或插件（点击、输入、滚动、读屏）
- 官方提供的真实浏览器控制入口（复用登录态）
- 安装、就绪检测、系统权限授予与禁用方式

### 本页不包含

- 用户自行接入的第三方 MCP 浏览器或桌面工具
- 仅抓取网页文本或返回搜索链接的 WebFetch/WebSearch 类工具
- 产品自身的 Web 界面、桌面端或远程接管入口

## 跨产品事实

1. Qwen Code 在 CLI 内默认注册 `computer_use__*` 桌面控制工具，并含浏览器 `page` 工具；Kimi Code 的 `/plugins` 内置 `kimi-cu` 与 `kimi-webbridge` 已随 0.33.0 发布，`kimi-cu` 又于 2026-08-05 增加 Windows x64 支持（main 分支，尚未发布）。
2. Codex 的 Computer Use 属于 ChatGPT 桌面 App Surface：macOS 支持后台与锁屏使用，Windows 只操作活动桌面；Codex CLI 不提供同类内置工具。
3. Claude Code 与 Qoder CLI 的官方内置工具表没有桌面或浏览器控制工具，官方路径是经 MCP 扩展。
4. 提供桌面控制的产品都要求 macOS 授予辅助功能与屏幕录制权限，并把动作类操作置于审批或用户授权之下。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 无内置桌面或浏览器控制工具；经 MCP 扩展 |
| 入口与工具 | 官方工具参考列出 Agent、Bash、Edit、Read、WebFetch、WebSearch 等内置工具，未包含桌面控制、鼠标键盘或浏览器控制工具；自定义工具经 MCP Server 添加。 |
| 核心机制 | `WebFetch` 抓取 URL 并转 Markdown 处理，`WebSearch` 返回搜索结果标题和链接且不抓取结果页；二者都不操作浏览器界面。 |
| 执行行为 | 无产品内置 GUI 动作；用户自备的 MCP 或 Shell 自动化工具按常规权限规则审批。 |
| 运行范围 | 当前官方工具参考面向 CLI 内置工具集合；桌面或浏览器控制不在其中。 |
| 后台与并发 | 无对应内置能力；第三方 MCP 工具的生命周期由用户配置决定。 |
| Git 与平台联动 | MCP 文档把 MCP Server 列为添加自定义工具的官方路径。 |
| 状态与产物 | 无产品内置产物。 |
| 条件与边界 | 结论基于当前官方工具参考；第三方 MCP 可补充同类能力，但不计为产品内置。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code tools reference](https://code.claude.com/docs/en/tools-reference)、[Claude Code MCP](https://code.claude.com/docs/en/mcp) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 条件：ChatGPT 桌面 App 的 Computer Use；CLI 未提供 |
| 入口与工具 | ChatGPT 桌面 App 内经 Plugins > Computer Use 安装并启用；提示中提及 `@Computer` 或 `@AppName` 调用；桌面 App 的 Codex 入口可用。 |
| 核心机制 | 读取屏幕内容、截图、操作窗口与菜单、键盘输入和剪贴板状态；Chrome、Excel、PowerPoint 另有专用集成。 |
| 执行行为 | 首次使用某应用前请求授权并可 Always allow；敏感或破坏性动作可再次请求许可；文件读写与 Shell 仍遵循任务的沙箱与审批设置。 |
| 运行范围 | ChatGPT 桌面 App Surface（含 Codex 入口）；官方文档未把 CLI、IDE 或 Cloud 列为 Computer Use 运行位置。 |
| 后台与并发 | macOS 支持后台运行，并可在锁屏后经 Apple 授权插件临时解锁（Locked use）；Windows 只操作活动桌面并接管前台输入，不能在同一会话后台运行。 |
| Git 与平台联动 | Windows 允许列表写入 `$CODEX_HOME/config.toml` 的 `[computer_use.windows] always_allowed_app_ids`；管理员可在 `requirements.toml` 用 `[features].computer_use = false` 禁用；旧 `$CODEX_HOME/computer-use/config.toml` 配置自动迁移。 |
| 状态与产物 | GUI 操作结果保留在目标应用与系统状态；经 GUI 的修改可能延迟到落盘后才出现在 Review pane。 |
| 条件与边界 | macOS 需屏幕录制与辅助功能权限；不能自动化终端应用或 ChatGPT 自身；Windows 允许列表外的应用需审批；仅在支持地区随 ChatGPT Work 和 Codex 提供。 |
| 证据状态 | 条件项 |
| 来源 | [Codex Computer Use](https://learn.chatgpt.com/docs/computer-use)、[Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `computer_use__*` 内置工具；默认开启；含浏览器 `page` 工具 |
| 入口与工具 | 内置工具以 `computer_use__` 前缀延迟注册，默认开启；`settings.json` 设 `tools.computerUse.enabled: false` 可整体关闭（重启生效）。 |
| 核心机制 | 原生 `cua-driver` 二进制首次使用时下载到 `~/.qwen/computer-use/`；工具覆盖鼠标（click、drag、scroll）、键盘（type_text、press_key、hotkey）、窗口与无障碍树、应用管理、轨迹录制和 `page` 浏览器页面操作。 |
| 执行行为 | 动作类工具（点击、输入、拖拽）需审批，只读工具可直接运行；macOS 需授予辅助功能与屏幕录制权限，授权对象可能是启动 Qwen Code 的终端或 IDE。 |
| 运行范围 | 提供 macOS（Apple Silicon 与 Intel）、Linux x86_64、Windows x86_64 预构建二进制；macOS 支持最完整，部分工具仅限特定平台（如 `bring_to_front` 仅 Windows）。 |
| 后台与并发 | `tools.computerUse.idleTimeoutMs`（默认 `300000`）控制驱动空闲驻留时长，`0` 为常驻到退出。 |
| Git 与平台联动 | `page` 工具操作 Chrome、Brave、Edge、Safari 与 Electron 应用中已加载的页面（执行 JS、读取 DOM、点击元素）；截图尺寸受 `tools.computerUse.maxImageDimension` 或 `QWEN_COMPUTER_USE_MAX_IMAGE_DIMENSION` 控制。 |
| 状态与产物 | 操作直接作用于真实桌面与浏览器；`start_recording`/`stop_recording`/`replay_trajectory` 可记录并重放操作轨迹。 |
| 条件与边界 | 各项 `tools.computerUse` 配置均需重启生效；官方文档提示该能力把鼠标、键盘、窗口与屏幕内容交给 Agent，应在可信提示和隔离环境中使用。 |
| 证据状态 | 官方确认 |
| 来源 | [Qwen Code Computer Use](https://github.com/QwenLM/qwen-code/blob/0907edb909706cf7589f94723b26572eb1dd9512/docs/users/features/computer-use.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 条件：`/plugins` 内置 `kimi-cu` 与 `kimi-webbridge`；`kimi-cu` 支持 macOS 与 Windows x64（Windows 未发布）；v2 CLI |
| 入口与工具 | v2 CLI 的 `/plugins` 面板内置 `Kimi Computer Use`（`kimi-cu`）与 `Kimi WebBridge`（`kimi-webbridge`）条目，安装时一并配置最新托管运行时与插件，报告缺失的手动步骤并支持中断后重试；Windows x64 上同一 `kimi-cu` 条目对应后端插件 `kimi-cu-win`。 |
| 核心机制 | `kimi-cu` 在 macOS 安装 `KimiCU.app`、同名插件与 `ai.kimi.cu.service` launchd 服务，提供后台 GUI 自动化：读取应用 UI、点击、输入、滚动、拖拽，不抢占鼠标或前台；在 Windows x64 安装插件 `kimi-cu-win` 与官方签名运行时 `kimi-cu.exe`，提供同类 Windows GUI 自动化（读取应用 UI、点击、输入、滚动、拖拽）；`kimi-webbridge` 安装 `~/.kimi-webbridge/bin/` 守护进程与官方浏览器控制插件，控制带登录态的真实浏览器（导航、点击、输入、读取页面、截图），浏览器扩展为可选手动安装。 |
| 执行行为 | 安装为幂等托管流程：macOS 按插件、应用、服务、权限（`kimi-cu`）或守护进程、插件、扩展连接（`kimi-webbridge`）逐项检测就绪状态；Windows x64 按插件、下载、运行时三步执行，经系统自带 PowerShell 以 `-NoProfile -NonInteractive -ExecutionPolicy Bypass` 运行安装脚本 `setup_windows.ps1`（超时 180 秒），doctor 检测运行时健康时跳过运行时重装；WebBridge 守护进程只在未运行时启动（start-if-down，与 Kimi Work 共存）。 |
| 运行范围 | `kimi-cu` 支持 macOS 与 Windows x64（仅 `win32` + `x64`，不含 Windows arm64）；`kimi-webbridge` 支持 macOS arm64/x64、Linux arm64/x64、Windows x64；条目由客户端按发布版本注入默认 Official marketplace，旧版本客户端不会看到。 |
| 后台与并发 | `kimi-cu` 在 macOS 经后台 launchd 服务运行；Windows x64 安装流程没有服务注册步骤，运行状态由 doctor 脚本检测；`kimi-webbridge` 守护进程常驻，就绪检测轮询 `/status`。 |
| Git 与平台联动 | macOS 辅助功能与屏幕录制（TCC）权限只能由用户手动授予，就绪检测经 `xpc-ping` 校验；Windows x64 doctor 脚本按 `KIMI_CU_WINDOWS_EXE`、`KIMI_CU_WINDOWS_HOME`、`%LOCALAPPDATA%\KimiCU\kimi-cu.exe`、`%ProgramFiles%\KimiCU\kimi-cu.exe` 查找运行时，要求输出 `mcp=true` 且 `helper=embedded`；官方插件来源允许列表新增 `cdn.kimi.com/kimi-computer-use-windows/`；WebBridge 会检测 `~/.kimi-code/skills/` 与 `~/.agents/skills/` 下冲突的旧技能副本并在安装进度中标记迁移。 |
| 状态与产物 | `KimiCU.app` 与 launchd 服务（macOS）、`kimi-cu.exe` 运行时（Windows x64）、`~/.kimi-webbridge/bin/kimi-webbridge[.exe]` 及版本文件、已安装的官方插件。 |
| 条件与边界 | `kimi-cu` 与 `kimi-webbridge` 内置条目 2026-08-04 合入主分支，已随 0.33.0 发布；Windows x64 支持 2026-08-05 合入主分支（changeset 标记为 minor），0.33.0 未包含，尚未发布；仅 v2 CLI 提供；安装进行中会返回 `capability.install_in_progress`。 |
| 证据状态 | 条件项 |
| 来源 | [Kimi Code built-in Computer Use and WebBridge capabilities](https://github.com/MoonshotAI/kimi-code/commit/0abcd00f7fd3e3cbf087509ffef1c54a6f8d396d)、[Kimi Code Computer Use Windows support commit](https://github.com/MoonshotAI/kimi-code/commit/68ba740ebfb3e32ad9abdb8607f48d4387cf6f69) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 内置工具表未列桌面或浏览器控制；经 MCP 扩展 |
| 入口与工具 | 官方 SDK Reference 内置工具表列 Bash、Read、Edit、Write、Glob、Grep、WebFetch、WebSearch、Agent、NotebookEdit、TaskOutput、TaskStop 等，未包含桌面控制或浏览器控制工具。 |
| 核心机制 | `WebFetch` 抓取并处理 URL 内容，`WebSearch` 执行网页搜索；二者均不操作浏览器界面或桌面。 |
| 执行行为 | 无产品内置 GUI 动作；用户自备的 MCP 工具按权限规则审批。 |
| 运行范围 | TUI、Headless、ACP 与 Agent SDK 共用同一内置工具集合，各入口可用 `tools`/`allowedTools`/`disallowedTools` 再过滤。 |
| 后台与并发 | 无对应内置能力。 |
| Git 与平台联动 | 官方 MCP 文档提供自定义 Server 的接入路径。 |
| 状态与产物 | 无产品内置产物。 |
| 条件与边界 | 结论基于当前官方内置工具表；第三方 MCP 可补充同类能力，但不计为产品内置。 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI SDK Reference](https://docs.qoder.com/en/cli/sdk/references)、[Qoder CLI MCP servers](https://docs.qoder.com/en/cli/mcp-servers) |

## 官方来源

- [Claude Code tools reference](https://code.claude.com/docs/en/tools-reference)
- [Claude Code MCP](https://code.claude.com/docs/en/mcp)
- [Codex Computer Use](https://learn.chatgpt.com/docs/computer-use)
- [Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)
- [Qwen Code Computer Use](https://github.com/QwenLM/qwen-code/blob/0907edb909706cf7589f94723b26572eb1dd9512/docs/users/features/computer-use.md)
- [Kimi Code built-in Computer Use and WebBridge capabilities](https://github.com/MoonshotAI/kimi-code/commit/0abcd00f7fd3e3cbf087509ffef1c54a6f8d396d)
- [Kimi Code Computer Use Windows support commit](https://github.com/MoonshotAI/kimi-code/commit/68ba740ebfb3e32ad9abdb8607f48d4387cf6f69)
- [Qoder CLI SDK Reference](https://docs.qoder.com/en/cli/sdk/references)
- [Qoder CLI MCP servers](https://docs.qoder.com/en/cli/mcp-servers)

## 关联能力

- [Shell 执行](./execution-shell.md)
- [MCP 客户端](../extensions/extension-mcp.md)
- [交互审批](../security/security-approval.md)

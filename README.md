# Claude Agent SDK 示例集

> ⚠️ **重要提示**：这些是由 Anthropic 提供的示例应用程序，仅供本地开发使用，请勿部署到生产环境或大规模使用。

本仓库包含多个 [Claude Agent SDK](https://platform.claude.com/docs/en/agent-sdk/overview) 的演示示例，展示了使用 Claude 构建 AI 驱动应用的不同方式。

注意： \.claude\skills\claude-agent-sdk  就是帮忙你写 ‘claude-agent-sdk’ 应用的skill，你安装这个skill就可以直接命令ai帮忙完成项目。

注意： http://liangdabiao.github.io/claude-agent-sdk-demos  ，这是本项目的教程，可以先阅读。

建议： clone 本项目下来，例如 codex/claude code/ workbuddy 等直接打开整个项目， 你就可以命令AI帮你完成claude-agent-sdk 项目了，AI会参考skill和这里的项目demo帮你完成工作！


## 可用的示例

### 📧 [邮件 Agent](./email-agent)
一个正在开发中的 IMAP 邮件助手，能够：
- 展示你的收件箱
- 执行智能搜索以查找邮件
- 提供由 AI 驱动的邮件协助

### 📊 [Excel 示例](./excel-demo)
演示如何使用 Claude 处理电子表格和 Excel 文件。

### 👋 [Hello World](./hello-world)
一个简单的入门示例，帮助你理解 Claude Agent SDK 的基础用法。

### 🔄 [Hello World V2](./hello-world-v2)
V2 Session API（`unstable_v2_*`）的示例：用分离的 `send()`/`stream()` 取代单一的 `query()` 生成器，并演示多轮对话与会话持久化模式。

### 🔬 [研究 Agent](./research-agent)
一个多 Agent 研究系统，协调专门的子 Agent 来研究主题并生成详尽的报告：
- 将研究请求拆分为多个子主题
- 并行启动研究 Agent 搜索网络
- 将发现综合成详细报告
- 演示详细的子 Agent 活动追踪

### 🎨 [AskUserQuestion 预览](./ask-user-question-previews)
一个品牌助手，将 AskUserQuestion 的选项渲染为可视化 HTML 预览卡片，而非纯文本标签：
- 启用 `previewFormat: "html"`，让每个选项都包含一个带样式的 HTML 模型
- 通过 WebSocket 将 SDK 的 `canUseTool` 回调中的问题往返传输到浏览器
- 演示 plan 模式如何引导 Claude 在行动前先提出澄清性问题

### 💬 [简单聊天应用](./simple-chatapp)
一个基于 SDK 的 React + Express 聊天界面，通过 WebSocket 展示带有流式响应的完整对话循环。

### 📄 [简历生成器](./resume-generator)
通过联网搜索某人的姓名（LinkedIn、GitHub、新闻）并汇总发现，生成一个单页 `.docx` 简历。

## 快速开始

每个示例都有自己的目录和独立的安装说明。请进入对应的示例文件夹，按其 README 进行安装和使用。

## 前置条件

- [Bun](https://bun.sh) 运行时（或 Node.js 18+）
- 一个 Anthropic API 密钥（[在此获取](https://console.anthropic.com)）

## 开始使用

1. **克隆仓库**
```bash
git clone https://github.com/anthropics/claude-agent-sdk-demos.git
cd claude-agent-sdk-demos
```

2. **选择一个示例并进入其目录**
```bash
cd email-agent  # 或 excel-demo，或 hello-world
```

3. **参考该示例专属的 README** 获取安装和使用说明

## 资源

- [Claude Agent SDK 文档](https://platform.claude.com/docs/en/agent-sdk)
- [API 参考](https://platform.claude.com/docs/en/agent-sdk/api-reference)
- [GitHub Issues](https://github.com/anthropics/claude-agent-sdk-demos/issues)

## 支持

这些是按需提供的示例应用程序。如果遇到以下问题：
- **Claude Agent SDK**：[SDK 文档](https://platform.claude.com/docs/en/agent-sdk)
- **示例问题**：[GitHub Issues](https://github.com/anthropics/sdk-demos/issues)
- **API 相关问题**：[Anthropic 支持](https://support.anthropic.com)

## 许可证

MIT —— 这是用于演示目的的示例代码。

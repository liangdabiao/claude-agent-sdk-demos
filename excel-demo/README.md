# Excel 示例

> ⚠️ **重要提示**：这是 Anthropic 提供的示例应用程序。仅供本地开发使用，请勿部署到生产环境或大规模使用。

一个由 Claude 和 [Claude Agent SDK](https://platform.claude.com/docs/en/agent-sdk) 驱动的演示桌面应用，展示由 AI 驱动的表格创建、分析与操作能力。

## 本示例展示的内容

这个基于 Electron 的桌面应用演示了如何：
- 创建带有公式、格式和多张工作表的复杂 Excel 表格
- 分析并操作已有的表格数据
- 使用 Claude 协助数据整理与表格设计
- 使用 Python 脚本生成复杂的表格结构
- 将 Claude Agent SDK 集成到桌面应用中

### 示例用例

`agent/` 文件夹包含 Python 示例，包括：
- **健身追踪器（Workout Tracker）**：带自动汇总统计和多张工作表的健身日志
- **预算追踪器（Budget Tracker）**：带公式和数据校验的财务追踪
- 带有样式、边框和条件格式的自定义表格生成

## 前置条件

- [Node.js 18+](https://nodejs.org) 或 [Bun](https://bun.sh)
- 一个 Anthropic API 密钥（[在此获取](https://console.anthropic.com)）
- Python 3.9+（用于 Python agent 示例）
- LibreOffice（可选，用于公式重算）

## 安装

1. 克隆仓库：
```bash
git clone https://github.com/anthropics/sdk-demos.git
cd sdk-demos/excel-demo
```

2. 安装依赖：
```bash
npm install
# 或 bun install
```

3. 配置你的 Anthropic API 密钥：
   - 设置 `ANTHROPIC_API_KEY` 环境变量，或
   - 应用会在首次运行时提示你输入

4. 运行 Electron 应用：
```bash
npm start
# 或 bun start
```

## 使用 Python 示例

`agent/` 目录包含演示表格生成的 Python 脚本：

### 配置 Python 环境

```bash
cd agent
python -m venv .venv
source .venv/bin/activate  # Windows 上：.venv\Scripts\activate
pip install -r requirements.txt
```

### 运行示例脚本

```bash
# 创建健身追踪器
python create_workout_tracker.py

# 创建预算追踪器
python create_budget_tracker.py
```

更多关于 Excel agent 配置与能力的细节，请参阅 [agent/README.md](./agent/README.md)。

## 功能特性

- **AI 驱动的表格生成**：让 Claude 根据你的需求创建复杂表格
- **公式管理**：处理 Excel 公式、计算与自动重算
- **专业样式**：生成带有表头、颜色、边框和格式化的表格
- **多工作表工作簿**：创建包含多张相关工作表的工作簿
- **数据分析**：分析已有表格并提取洞察
- **桌面集成**：使用 Electron 构建的原生桌面应用

## 项目结构

```
excel-demo/
├── agent/              # Python 示例与 Excel agent 配置
│   ├── create_workout_tracker.py
│   ├── create_budget_tracker.py
│   └── README.md       # Excel agent 文档
├── src/
│   ├── main/          # Electron 主进程
│   └── renderer/      # React UI 组件
└── package.json
```

## 资源

- [Claude Agent SDK 文档](https://platform.claude.com/docs/en/agent-sdk)
- [Electron 文档](https://www.electronjs.org/docs/latest/)
- [openpyxl 文档](https://openpyxl.readthedocs.io/)（使用的 Python 库）

## 支持

这些是按需提供的示例应用程序。如果遇到以下问题：
- **Claude Agent SDK**：[SDK 文档](https://platform.claude.com/docs/en/agent-sdk)
- **示例问题**：[GitHub Issues](https://github.com/anthropics/sdk-demos/issues)
- **API 相关问题**：[Anthropic 支持](https://support.anthropic.com)

## 许可证

MIT —— 这是用于演示目的的示例代码。

---

由 Anthropic 构建，用于演示 [Claude Agent SDK](https://github.com/anthropics/claude-code-sdk)

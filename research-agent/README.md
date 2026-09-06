# 多 Agent 研究系统

一个多 Agent 研究系统，协调专门的子 Agent 来研究任意主题，并生成带有数据可视化的详尽 PDF 报告。

## 快速开始

```bash
# 安装依赖
uv sync

# 设置你的 API 密钥
export ANTHROPIC_API_KEY="your-api-key"

# 运行 agent
uv run python research_agent/agent.py
```

然后询问："Research quantum computing developments in 2025"（研究 2025 年量子计算的进展）

## 工作原理

1. **主 Agent（Lead Agent）** 将你的请求拆分为 2-4 个子主题
2. 并行启动**研究员（Researcher）**子 Agent 搜索网络
3. 每个研究员将发现保存到 `files/research_notes/`
4. 启动**数据分析师（Data Analyst）** 从 `files/charts/` 提取指标并生成图表
5. 启动**报告撰写员（Report Writer）** 在 `files/reports/` 创建最终 PDF 报告

## Agents

| Agent | 工具 | 用途 |
|-------|-------|---------|
| **主 Agent（Lead Agent）** | `Task` | 协调研究工作，委派给子 Agent |
| **研究员（Researcher）** | `WebSearch`、`Write` | 从网络收集信息 |
| **数据分析师（Data Analyst）** | `Glob`、`Read`、`Bash`、`Write` | 提取指标，生成图表 |
| **报告撰写员（Report Writer）** | `Skill`、`Write`、`Glob`、`Read`、`Bash` | 创建内嵌可视化的 PDF 报告 |

## 斜杠命令（Slash Commands）

| 命令 | 描述 |
|---------|-------------|
| `/research <topic>` | 针对任意主题开始聚焦研究 |
| `/competitive-analysis <company>` | 分析公司或产品 |
| `/market-trends <industry>` | 研究行业趋势 |
| `/fact-check <claim>` | 核实声明与陈述 |
| `/summarize` | 汇总当前所有研究发现 |

## 示例查询

- "Research quantum computing developments"（研究量子计算的进展）
- "What are current trends in renewable energy?"（可再生能源的当前趋势是什么？）
- `/competitive-analysis Tesla`（Tesla 竞品分析）
- `/market-trends artificial intelligence`（人工智能市场趋势）

## 输出结构

```
files/
├── research_notes/     # 研究员产出的 Markdown 文件
├── data/               # 分析师产出的数据摘要
├── charts/             # PNG 可视化图
└── reports/            # 最终的 PDF 报告

logs/
└── session_YYYYMMDD_HHMMSS/
    ├── transcript.txt      # 人类可读的对话记录
    └── tool_calls.jsonl    # 结构化的工具调用日志
```

## 使用 Hooks 追踪子 Agent

本系统使用 SDK hooks 追踪所有工具调用。

### 追踪了什么

- **谁（Who）**：哪个 agent（RESEARCHER-1、DATA-ANALYST-1 等）
- **什么（What）**：工具名称（WebSearch、Write、Bash 等）
- **何时（When）**：时间戳
- **输入/输出（Input/Output）**：参数与结果

### 工作原理

Hooks 在每次工具调用执行前后进行拦截：

```python
hooks = Hooks(
    pre_tool_use=[tracker.pre_tool_use_hook],
    post_tool_use=[tracker.post_tool_use_hook]
)
```

`parent_tool_use_id` 将工具调用与其子 Agent 关联起来：
- 主 Agent 通过 `Task` 工具 spawn 一个研究员 → 获得 ID "task_123"
- 该研究员的所有工具调用都包含 `parent_tool_use_id = "task_123"`
- Hooks 用这个 ID 来识别是哪个子 Agent 发起了调用

### 日志输出

**transcript.txt** - 人类可读：
```
[RESEARCHER-1] → WebSearch
    Input: query='quantum computing 2025'
[DATA-ANALYST-1] → Bash
    Input: python matplotlib chart generation
```

**tool_calls.jsonl** - 结构化 JSON：
```json
{"event":"tool_call_start","agent_id":"RESEARCHER-1","tool_name":"WebSearch",...}
{"event":"tool_call_complete","success":true,"output_size":15234}
```

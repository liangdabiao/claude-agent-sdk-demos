# Claude Agent SDK Hello World

一个简单的示例，演示如何使用 Claude Agent SDK 创建能与 Claude 交互的自主 Agent。

## 概述

Claude Agent SDK 允许你以编程方式构建具备 Claude 能力的 AI Agent。SDK 将 Claude Code 进程作为子进程 spawn，并与之通信以自主执行任务。

## 安装

```bash
npm install @anthropic-ai/claude-agent-sdk typescript @types/node tsx zod
```

## 配置

1. 将你的 Anthropic API 密钥设为环境变量：
```bash
export ANTHROPIC_API_KEY="your-api-key"
```

2. 创建所需的目录结构：
```bash
mkdir -p agent/custom_scripts
```

`agent` 目录被用作 Claude agent 的工作目录，而 `custom_scripts` 是必须写入 JavaScript/TypeScript 文件的地方（由示例中的 hook 强制约束）。

## 工作原理

### 基本结构

SDK 使用一个 `query()` 函数，它返回一个异步可迭代的消息流：

```typescript
import { query } from '@anthropic-ai/claude-agent-sdk';

const q = query({
  prompt: 'Your prompt here',
  options: { /* configuration */ }
});

for await (const message of q) {
  // 处理消息
}
```

### 关键组件

#### 1. 查询选项（Query Options）

- **`maxTurns`**：最大对话轮数（默认：100）
- **`cwd`**：agent 的工作目录（必须存在）
- **`model`**：要使用的 Claude 模型（`"sonnet"`、`"opus"`、`"haiku"`，或 `"inherit"`）
- **`executable`**：Node.js 二进制文件路径（当前运行时可用 `process.execPath`）
- **`allowedTools`**：agent 可使用的工具名称数组

#### 2. 可用工具

agent 可以使用多种工具，包括：
- **文件操作**：`Read`、`Write`、`Edit`、`MultiEdit`、`NotebookEdit`
- **搜索**：`Glob`、`Grep`、`WebSearch`
- **执行**：`Bash`、`Task`
- **实用工具**：`TodoWrite`、`WebFetch`、`BashOutput`、`KillBash`
- **规划**：`ExitPlanMode`

#### 3. Hooks

Hooks 允许你拦截并控制工具的使用。示例包含一个 `PreToolUse` hook，强制 `.js` 和 `.ts` 文件只能写入 `custom_scripts` 目录：

```typescript
hooks: {
  PreToolUse: [
    {
      matcher: "Write|Edit|MultiEdit",
      hooks: [
        async (input: any): Promise<HookJSONOutput> => {
          // 校验逻辑
          // 返回 { continue: true } 表示允许
          // 返回 { decision: 'block', stopReason: '...', continue: false } 表示拒绝
        }
      ]
    }
  ]
}
```

#### 4. 消息类型

SDK 返回三种类型的消息：

- **`system`**：系统级消息与提示
- **`assistant`**：Claude 的回复（包含实际的消息内容）
- **`result`**：工具执行结果

提取 Claude 的文本回复：

```typescript
if (message.type === 'assistant' && message.message) {
  const textContent = message.message.content.find((c: any) => c.type === 'text');
  if (textContent && 'text' in textContent) {
    console.log(textContent.text);
  }
}
```

### 架构

1. SDK 将 Claude Code CLI 进程作为子进程 spawn
2. 它使用 `executable` 中指定的 Node.js 二进制文件（默认为 `"node"`）
3. 通过 stdin/stdout 与该子进程通信
4. agent 在指定的 `cwd` 目录下运行
5. Hooks 可以在工具执行前拦截并修改工具调用

## 运行示例

```bash
npx tsx hello-world.ts
```

## 常见问题

### "Failed to spawn Claude Code process: spawn node ENOENT"（无法 spawn Claude Code 进程：spawn node ENOENT）

**解决方法**：将 `executable` 选项设为 `node`：

```typescript
options: {
  executable: "node",
  // ... 其他选项
}
```

### spawn 时报 "ENOENT" 错误

**解决方法**：确保 `cwd` 目录存在：

```bash
mkdir -p agent
```

### 文件操作的权限错误

**解决方法**：检查你的 hooks 配置，并确保 agent 拥有必要的 `allowedTools`。

## 资源

- [Claude Agent SDK 文档](https://docs.claude.com/en/api/agent-sdk/overview)
- [GitHub 仓库](https://github.com/anthropics/claude-agent-sdk-typescript)
- [Anthropic 工程博客](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)
# claude-agent-hello-world

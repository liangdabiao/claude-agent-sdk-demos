# Claude Agent SDK V2 示例

**V2 Session API**（`unstable_v2_*`）的示例。

## V1 与 V2 对比

| V1：`query()` | V2：Session API |
|---------------|-----------------|
| 所有消息的异步生成器 | 分离的 `send()` / `stream()` |
| 单次提示流程 | 多轮对话 |
| `for await (msg of query({prompt}))` | 先 `await session.send()`，再 `for await (msg of session.stream())` |

## 快速开始

```bash
npm install
npx tsx v2-examples.ts basic       # 基础会话
npx tsx v2-examples.ts multi-turn  # 多轮对话
npx tsx v2-examples.ts one-shot    # unstable_v2_prompt()
npx tsx v2-examples.ts resume      # 会话持久化
```

## API

```typescript
// 创建会话（配合 await using 自动关闭）
await using session = unstable_v2_createSession({ model: 'sonnet' });
await session.send('Hello!');
for await (const msg of session.stream()) { /* ... */ }

// 续接会话
await using session = unstable_v2_resumeSession(sessionId, { model: 'sonnet' });

// 一次性（直接返回结果）
const result = await unstable_v2_prompt('Question?', { model: 'sonnet' });
```

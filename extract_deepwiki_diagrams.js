const fs = require('fs');

const DEEP = 'C:/Users/49707/.workbuddy/projects/d-Geek04-main/e05aea8f-8452-4bb9-a1aa-68a9da7a38c5/tool-results/mcp-connector-proxy-deepwiki_read_wiki_contents-1786068946204-eb928a.txt';

const txt = fs.readFileSync(DEEP, 'utf8');
const lines = txt.split('\n');

// Split into pages by "# Page:" markers
const pages = [];
let cur = null;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const m = line.match(/^# Page:\s*(.+?)\s*$/);
  if (m) {
    if (cur) pages.push(cur);
    cur = { title: m[1].trim(), lines: [] };
  } else if (cur) {
    cur.lines.push(line);
  }
}
if (cur) pages.push(cur);

// Extract mermaid blocks + nearest preceding heading for each page
function extractBlocks(page) {
  const blocks = [];
  let lastHeading = '';
  const pl = page.lines;
  for (let i = 0; i < pl.length; i++) {
    const ln = pl[i];
    const h = ln.match(/^(#{2,4})\s+(.+?)\s*$/);
    if (h && !h[2].startsWith('Page:')) {
      lastHeading = h[2].trim();
    }
    if (/^```\s*mermaid\s*$/i.test(ln)) {
      let j = i + 1;
      const body = [];
      while (j < pl.length && !/^```\s*$/.test(pl[j])) {
        body.push(pl[j]);
        j++;
      }
      i = j; // skip closing fence
      blocks.push({ caption: lastHeading, body: body.join('\n') });
    }
  }
  return blocks;
}

function projectFor(title) {
  const t = title.toLowerCase();
  if (t.includes('project 1') || t.includes('codeact agent (02') || t.includes('smolagents multi-agent')) return 'P1';
  if (t.includes('project 2') || t.includes('claude_agent_sdk basics') || t.includes('financial report generation') || t.includes('skill definitions') || t.includes('generated data artifacts')) return 'P2';
  if (t.includes('project 3') || t.includes('subagent architecture') || t.includes('session management') || t.includes('lifecycle hooks') || t.includes('opentelemetry observability') || t.includes('observability infrastructure')) return 'P3';
  if (t.includes('project 4') || t.includes('deepagents agent setup') || t.includes('stock-wiki skill')) return 'P4';
  if (t.includes('project 5') || t.includes('pi-mono agent basics') || t.includes('contract parsing tools') || t.includes('skill-based chunked review') || t.includes('security guards')) return 'P5';
  return 'CROSS';
}

// Accumulate per project
const projBlocks = { P1: [], P2: [], P3: [], P4: [], P5: [] };

for (const page of pages) {
  const proj = projectFor(page.title);
  const blocks = extractBlocks(page);
  if (blocks.length === 0) continue;

  if (proj !== 'CROSS') {
    for (const b of blocks) projBlocks[proj].push({ caption: b.caption, body: b.body, src: page.title });
  } else {
    // Cross-project pages: route by caption / title
    const t = page.title.toLowerCase();
    if (t.includes('repository overview') || t.includes('getting started')) {
      // general background -> P1
      for (const b of blocks) projBlocks.P1.push({ caption: '[全局] ' + b.caption, body: b.body, src: page.title });
    } else if (t.includes('project map')) {
      for (const b of blocks) {
        const cap = b.caption.toLowerCase();
        if (cap.includes('financial platform')) projBlocks.P3.push({ caption: b.caption, body: b.body, src: page.title });
        else if (cap.includes('skill-based report') || cap.includes('report generation')) projBlocks.P2.push({ caption: b.caption, body: b.body, src: page.title });
        else projBlocks.P1.push({ caption: '[全局] ' + b.caption, body: b.body, src: page.title });
      }
    }
    // Glossary: no blocks anyway
  }
}

// Build appendix text per project
function buildAppendix(proj) {
  const blocks = projBlocks[proj];
  let out = '\n\n---\n\n## 附录 C：DeepWiki 官方架构图 / 流程图 / 设计图（深度解读补充）\n\n';
  out += '> 以下内容来自 DeepWiki 对 `xingyunyang01/Geek04` 的自动深度解读（Mermaid 源码），作为本书架构与流程的权威参考补充。在支持 Mermaid 的 Markdown 阅读器（GitHub / Obsidian / VS Code + Mermaid 插件）中会自动渲染为图。\n\n';
  let idx = 1;
  for (const b of blocks) {
    const cap = b.caption && b.caption.trim() ? b.caption.trim() : ('图 ' + idx);
    out += `### C.${idx} ${cap}\n\n`;
    out += '```mermaid\n' + b.body + '\n```\n\n';
    idx++;
  }
  return out;
}

const bookMap = {
  P1: 'D:/Geek04-main/books/P1-数据分析助手/book.md',
  P2: 'D:/Geek04-main/books/P2-金融研报生成助手/book.md',
  P3: 'D:/Geek04-main/books/P3-金融平台/book.md',
  P4: 'D:/Geek04-main/books/P4-LLM-Wiki/book.md',
  P5: 'D:/Geek04-main/books/P5-合同审查助手/book.md',
};

const summary = [];
for (const proj of ['P1','P2','P3','P4','P5']) {
  const appendix = buildAppendix(proj);
  const bookPath = bookMap[proj];
  const existing = fs.readFileSync(bookPath, 'utf8');
  // Avoid double-append
  if (existing.includes('附录 C：DeepWiki')) {
    summary.push(`${proj}: 已存在附录 C，跳过 (${projBlocks[proj].length} 图)`);
    continue;
  }
  fs.writeFileSync(bookPath, existing + appendix, 'utf8');
  summary.push(`${proj}: 追加 ${projBlocks[proj].length} 张 Mermaid 图 -> ${bookPath}`);
}

console.log('=== 各 project 提取到的 Mermaid 图数量 ===');
for (const proj of ['P1','P2','P3','P4','P5']) {
  console.log(proj + ': ' + projBlocks[proj].length + ' 张');
}
console.log('\n=== 写入结果 ===');
console.log(summary.join('\n'));

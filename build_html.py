# -*- coding: utf-8 -*-
"""
把 5 本 Geek04 图书的 book.md 转成自包含、带侧边目录、可渲染 Mermaid 图的 book.html。
每个 HTML 放在对应书目录下，图片（cover.png / images/*）相对路径自动生效。
文本用 markdown 库预渲染（离线可读），架构图用 mermaid CDN 渲染（需联网）。
"""
import os
import re
import html as html_lib

BASE = os.path.dirname(os.path.abspath(__file__))

BOOKS = [
    "P1-数据分析助手",
    "P2-金融研报生成助手",
    "P3-金融平台",
    "P4-LLM-Wiki",
    "P5-合同审查助手",
    "DSH-DeepSeek-Harness",
    "Claude-Agent-SDK 实战案例",
]

MERMAID_CDN = "https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js"

# 浅色、阅读友好主题
CSS = """
:root{
  --bg:#ffffff; --fg:#1f2328; --muted:#57606a; --line:#e3e6ea;
  --accent:#0a6b6b; --accent2:#e8622c; --code-bg:#f6f8fa; --quote-bg:#f3f8f8;
  --card:#fbfcfd;
}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{
  margin:0; background:var(--bg); color:var(--fg);
  font-family:"PingFang SC","Microsoft YaHei","Hiragino Sans GB","Noto Sans CJK SC",system-ui,-apple-system,Segoe UI,Roboto,sans-serif;
  font-size:17px; line-height:1.85;
}
a{color:var(--accent); text-decoration:none}
a:hover{text-decoration:underline}
.layout{display:flex; align-items:flex-start; max-width:1280px; margin:0 auto}
.sidebar{
  position:sticky; top:0; align-self:flex-start;
  flex:0 0 270px; height:100vh; overflow-y:auto;
  padding:24px 18px 40px; border-right:1px solid var(--line);
  background:#fcfdfe;
}
.sidebar h2{
  font-size:15px; margin:0 0 12px; color:var(--accent);
  font-weight:700; letter-spacing:.5px;
}
.toc-list{list-style:none; margin:0; padding:0; font-size:14px}
.toc-list li{margin:2px 0; line-height:1.5}
.toc-list a{color:var(--muted); display:block; padding:3px 8px; border-radius:6px; border-left:2px solid transparent}
.toc-list a:hover{background:#eef3f3; color:var(--fg); text-decoration:none}
.toc-list a.active{color:var(--accent); background:#e9f3f3; border-left:2px solid var(--accent); font-weight:600}
.content{
  flex:1; min-width:0; max-width:860px; margin:0 auto;
  padding:40px 48px 120px;
}
.content h1{font-size:30px; line-height:1.35; margin:0 0 8px; color:#0c2b2b}
.content h2{font-size:24px; margin:42px 0 14px; padding-bottom:8px; border-bottom:2px solid var(--line); color:#0c2b2b}
.content h3{font-size:19px; margin:28px 0 10px; color:var(--accent)}
.content p{margin:14px 0}
.content img{max-width:100%; height:auto; display:block; margin:20px auto; border-radius:10px; box-shadow:0 2px 10px rgba(0,0,0,.06)}
.content blockquote{
  margin:18px 0; padding:12px 18px; background:var(--quote-bg);
  border-left:4px solid var(--accent); border-radius:0 8px 8px 0; color:#26403f;
}
.content blockquote p{margin:8px 0}
.content code{
  background:var(--code-bg); padding:.15em .4em; border-radius:5px;
  font-family:"SFMono-Regular",Consolas,"Liberation Mono",Menlo,monospace; font-size:.9em;
  border:1px solid var(--line);
}
.content pre{
  background:var(--code-bg); border:1px solid var(--line); border-radius:10px;
  padding:16px 18px; overflow-x:auto; margin:18px 0;
}
.content pre code{background:none; border:none; padding:0; font-size:13.5px; line-height:1.6}
.content table{
  border-collapse:collapse; width:100%; margin:18px 0; font-size:15px;
  display:block; overflow-x:auto;
}
.content th,.content td{border:1px solid var(--line); padding:8px 12px; text-align:left}
.content th{background:#eef3f3; font-weight:700; color:#0c2b2b}
.content tr:nth-child(even) td{background:#fafcfc}
.mermaid{
  background:var(--card); border:1px solid var(--line); border-radius:12px;
  padding:18px; margin:22px 0; overflow-x:auto; text-align:center;
}
.mermaid pre{text-align:left; white-space:pre; font-size:13px; color:var(--muted)}
.cover-note{color:var(--muted); font-size:14px; margin:4px 0 30px}
.footnote{margin-top:60px; padding-top:18px; border-top:1px solid var(--line); color:var(--muted); font-size:13px}
.totop{
  position:fixed; right:24px; bottom:24px; width:44px; height:44px; border-radius:50%;
  background:var(--accent); color:#fff; border:none; font-size:20px; cursor:pointer;
  box-shadow:0 4px 14px rgba(0,0,0,.18); display:none;
}
.totop:hover{background:#085656}
@media (max-width:980px){
  .layout{flex-direction:column}
  .sidebar{position:static; height:auto; width:100%; border-right:none; border-bottom:1px solid var(--line); max-height:42vh}
  .content{padding:24px 18px 90px}
  .content h1{font-size:25px}
}
"""

JS = """
// 目录高亮（scroll-spy）
(function(){
  var links = Array.prototype.slice.call(document.querySelectorAll('.toc-list a'));
  var map = {};
  links.forEach(function(a){ map[a.getAttribute('href').slice(1)] = a; });
  var targets = links.map(function(a){ return document.getElementById(a.getAttribute('href').slice(1)); }).filter(Boolean);
  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        links.forEach(function(l){ l.classList.remove('active'); });
        var a = map[e.target.id]; if(a) a.classList.add('active');
      }
    });
  }, {rootMargin:'-10% 0px -75% 0px', threshold:0});
  targets.forEach(function(t){ obs.observe(t); });
  // 回到顶部
  var btn = document.getElementById('totop');
  window.addEventListener('scroll', function(){ btn.style.display = window.scrollY>600 ? 'block':'none'; });
  btn.addEventListener('click', function(){ window.scrollTo({top:0,behavior:'smooth'}); });
})();
"""

PAGE = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<style>{css}</style>
<script src="{mermaid_cdn}" defer></script>
<script>window.addEventListener('DOMContentLoaded',function(){ if(window.mermaid){ mermaid.initialize({startOnLoad:true, theme:'base', themeVariables:{primaryColor:'#e9f3f3',lineColor:'#0a6b6b',fontSize:'15px'}}); } });</script>
</head>
<body>
<div class="layout">
  <nav class="sidebar">
    <h2>{short_title}</h2>
    {toc}
  </nav>
  <main class="content">
    {body}
    <div class="footnote">
      本文由 Geek04 项目图书自动排版生成。正文离线可读；
      含 <code>graph/sequence/class</code> 的「DeepWiki 架构图」需联网由 Mermaid 渲染，
      离线时显示原始源码，不影响阅读。
    </div>
  </main>
</div>
<button class="totop" id="totop" title="回到顶部">↑</button>
<script>{js}</script>
</body>
</html>
"""


def escape_text(s):
    return html_lib.escape(s, quote=False)


def prep_mermaid(text):
    """把 ```mermaid 代码块转成 <div class="mermaid">，其余代码块留给 markdown 处理。"""
    def repl(m):
        code = m.group(1)
        return '<div class="mermaid">\n' + code + '\n</div>'
    return re.sub(r'```mermaid\s*\n(.*?)```', repl, text, flags=re.DOTALL)


def assign_ids_and_toc(html):
    toc = []
    counter = [0]

    def repl(m):
        level = int(m.group(1))
        inner = m.group(2)
        counter[0] += 1
        sid = "sec-%d" % counter[0]
        label = re.sub(r'<[^>]+>', '', inner).strip()
        if level >= 2:
            toc.append((level, sid, label))
        return '<h%d id="%s">%s</h%d>' % (level, sid, inner, level)

    html = re.sub(r'<h([1-3])>(.*?)</h\1>', repl, html, flags=re.DOTALL)
    return html, toc


def build_toc(toc):
    items = []
    for level, sid, label in toc:
        indent = (level - 2) * 18
        items.append('<li style="margin-left:%dpx"><a href="#%s">%s</a></li>'
                     % (indent, sid, escape_text(label)))
    return '<ul class="toc-list">' + ''.join(items) + '</ul>'


def first_h1(text):
    m = re.search(r'^#\s+(.+)$', text, flags=re.MULTILINE)
    return m.group(1).strip() if m else "图书"


def main():
    import markdown
    for folder in BOOKS:
        src = os.path.join(BASE, "books", folder, "book.md")
        dst = os.path.join(BASE, "books", folder, "book.html")
        if not os.path.exists(src):
            print("SKIP (no book.md):", folder)
            continue
        with open(src, encoding="utf-8") as f:
            raw = f.read()

        title = first_h1(raw)
        prepped = prep_mermaid(raw)
        md = markdown.Markdown(extensions=["tables", "fenced_code", "sane_lists", "attr_list"])
        body = md.convert(prepped)
        body, toc = assign_ids_and_toc(body)

        html = (PAGE
                .replace("{title}", escape_text(title))
                .replace("{css}", CSS)
                .replace("{mermaid_cdn}", MERMAID_CDN)
                .replace("{short_title}", escape_text(title))
                .replace("{toc}", build_toc(toc))
                .replace("{body}", body)
                .replace("{js}", JS))
        with open(dst, "w", encoding="utf-8") as f:
            f.write(html)
        print("OK  %s  ->  %s  (目录项 %d)" % (folder, dst, len(toc)))


if __name__ == "__main__":
    main()

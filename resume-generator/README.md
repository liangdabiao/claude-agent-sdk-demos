# 简历生成器

使用 Claude Agent SDK 配合联网搜索能力生成专业简历。

## 功能特性

- 使用联网搜索研究一个人（LinkedIn、公司主页、新闻、GitHub）
- 生成一份专业的单页 `.docx` 简历文件
- 使用 `docx` 库生成 Word 文档

## 用法

```bash
npm install
npm start "Person Name"
```

## 工作原理

1. 使用 `WebSearch` 研究此人的职业背景
2. 收集其当前职位、过往经历、教育背景和技能等信息
3. 生成一个使用 `docx` 库创建简历的 JavaScript 文件
4. 执行该脚本以生成 `.docx` 文件

## 输出

生成的简历会保存到 `agent/custom_scripts/resume.docx`

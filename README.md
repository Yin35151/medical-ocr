# Medical OCR Data Collector

一个轻量级病例照片 OCR 与结构化录入工具。用户可以上传病例、化验单或检查报告照片，系统调用 DashScope/Qwen 进行 OCR 和结构化整理，并将结果保存到 Supabase，最后可导出 Excel 继续分析。


## 功能

- 上传单张病例图片并识别结构化字段
- 粘贴文本后直接进行 AI 整理
- 批量上传 zip 图片包
- 患者与项目管理
- 同一患者多次记录按采集日期保存
- 数据导出为 Excel

## 技术栈

- Next.js 14 / React / TypeScript
- Tailwind CSS
- Supabase PostgreSQL
- DashScope Qwen VL / Qwen text model
- SheetJS / JSZip

## 本地运行

1. 安装依赖

```bash
npm install
```

2. 创建环境变量文件

```bash
cp .env.example .env.local
```

3. 在 `.env.local` 中填入自己的配置

```env
DASHSCOPE_API_KEY=your_dashscope_api_key_here
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

`SUPABASE_SERVICE_ROLE_KEY` 只能放在本地 `.env.local` 或 Vercel/Supabase Edge 等服务端环境变量里，不能提交到 GitHub，也不能写进前端代码。

4. 在 Supabase SQL Editor 中执行 `supabase/schema.sql`

5. 启动开发服务器

```bash
npm run dev
```

打开 `http://localhost:3000`。

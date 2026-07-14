# Medical OCR Data Collector

一个轻量级病例照片 OCR 与结构化录入工具。用户可以上传病例、化验单或检查报告照片，系统调用 DashScope/Qwen 进行 OCR 和结构化整理，并将结果保存到 Supabase，最后可导出 Excel 继续分析。

> 注意：本项目会处理患者姓名、病案号、电话、地址、诊断等敏感医疗信息。公开部署前请务必配置访问控制、数据库 RLS 策略和合规的数据处理流程。

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

## GitHub 上传范围

上传项目根目录 `E:\桌面\medical-ocr` 里面的源码文件，不要上传外层父目录。

可以上传：

- `app/`
- `components/`
- `lib/`
- `supabase/`
- `.env.example`
- `.gitignore`
- `README.md`
- `next-env.d.ts`
- `next.config.js`
- `package.json`
- `package-lock.json`
- `postcss.config.js`
- `tailwind.config.js`
- `tsconfig.json`

不要上传：

- `.env.local`、`.env` 或任何真实环境变量文件
- `.next/`
- `node_modules/`
- `.git/`
- `.agents/`、`.codex/`
- 病例照片、导出的 Excel、数据库备份、日志、zip 原始资料

## 隐私与安全

- 不要提交真实 API key、数据库密码或真实 Supabase service role key。
- 不要提交病例照片、导出的 Excel、数据库备份、日志或任何包含患者身份信息的文件。
- `supabase/schema.sql` 默认启用 RLS，并撤销 `anon` / `authenticated` 对患者表的直接访问权限。
- 服务端 API 使用 `SUPABASE_SERVICE_ROLE_KEY` 访问数据库；这个 key 权限很高，必须只存在服务端。
- DashScope API key 只应在服务端环境变量中使用，不应暴露到浏览器端。
- 如果密钥曾经被提交、截图、分享或怀疑泄露，请直接到对应平台轮换密钥。

## 上传 GitHub 前检查

```bash
npm run build
git status --short
git ls-files --others --exclude-standard
```

确认输出中没有 `.env.local`、病例图片、Excel、数据库备份或其他敏感文件后再提交。

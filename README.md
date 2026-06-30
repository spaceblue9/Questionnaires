# ระบบประเมินความพึงพอใจในการสอน

ไฟล์ ZIP นี้สร้างจาก AI Project Bootstrapper เพื่อใช้เป็นชุดเอกสารตั้งต้นสำหรับให้ AI coding tool ทำงานต่อ

เริ่มอ่านไฟล์นี้ก่อน แล้วค่อยส่ง prompt ด้านล่างให้ AI อ่านเอกสารในโฟลเดอร์ `documents/` และ `prompts/`

## เริ่มใช้งานหลังได้ ZIP

1. แตกไฟล์ ZIP นี้ไว้ในโฟลเดอร์โปรเจกต์ที่ต้องการให้ AI ทำงานต่อ
2. เปิด AI coding tool เช่น Codex, Cursor, Antigravity, Claude หรือเครื่องมือที่คุณใช้
3. คัดลอกข้อความในหัวข้อ `Recommended AI Starter Prompt` ด้านล่างไปวางสั่ง AI
4. ให้ AI อ่าน `README.md`, `documents/prd.md`, `documents/architecture.md`, `documents/tasks.md` และไฟล์ใน `prompts/` ก่อนเริ่มเขียนโค้ด
5. หลัง AI แก้โค้ด ให้สั่งให้ AI อัปเดต `tasks.md`, `architecture.md`, และ `prd.md` ถ้าสิ่งที่ทำเปลี่ยนแผนหรือขอบเขตงาน

## Project Snapshot

- Project type: internal-tool
- Primary goal: สร้างเว็บแอปที่ช่วยในการทำงาน เนื่องจาก ผมมีความจำเป็นต้องทำการสอน หรือ แชร์ Knowledge ให้กับทีม โดยทำการสอนทุกอาทิตย์ ครั้งละ 1 ชั่วโมง ผมอยากได้ Web App สำหรับ Feedback การสอนและ Share Material การสอน การประเมินการพึงพอใจ โดยการเก็บข้อมูลไว้ใน Google Sheets เพื่อสรุปผลในปลายปี และมีหน้า Dashboard ในการวิเคราะห์ ข้อมูลในแต่ละครั้งที่สอน หรือดูภาพรวมการสอนทั้งหมด และสามารถมีหน้า Config การใช้ Google Sheet
- Target users: ผู้สอนทำหน้าที่ ตั้งข้อคำถามในการประเมินความพึงพอใจ ของวิชาที่ตนเองสอน , ผู้เรียนทำหน้าหน้าที่ ประเมินตามหัวข้อที่ผู้สอนกำหนด, ผู้ดูแลระบบ ทำหน้าที่เพิ่ม User และกำหนด Role ในการใช้งาน
- Output language: thai
- Prompt pack level: standard

## AI Target Context

- Target workflow: Codex
- Provider mode: Standard Fallback
- Provider model: not specified
- Provider timeout: default
- Workflow style: Workspace-aware, task-driven, verification-heavy
- Handoff style: ส่งต่องานแบบมี next-step, assumptions, verification notes และ file context ชัดเจน
- Prompt bias: เน้น implementation sequencing, code review mindset และ update เอกสารระหว่างทำงาน

## What Is Inside

### Documents

- documents/prd.md
- documents/architecture.md
- documents/rules.md
- documents/tasks.md
- documents/memory.md
- documents/design.md

### Prompts

- prompts/start-project.md - Start Project
- prompts/implement-next-task.md - Implement Next Task
- prompts/review-output.md - Review Output
- prompts/update-project-context.md - Update Project Context
- prompts/update-memory.md - Update Memory

### Optional Bundles

- AI pack: Not included in this export
- AI analysis: Not included in this export
- Provider diagnostics: 5 provider events included
- Context sync: No context sync bundle included
- Team template: Not included
- Baseline snapshots: 0

## Recommended Reading Order

1. `README.md` - คู่มือเริ่มต้นและ prompt สำหรับส่งต่อให้ AI
2. `documents/prd.md` - เป้าหมายของโปรแกรมและขอบเขตที่ควรทำ
3. `documents/architecture.md` - โครงสร้างระบบและแนวทางเทคนิค
4. `documents/tasks.md` - งานถัดไปที่ควรให้ AI ทำทีละข้อ
5. `prompts/start-project.md` - prompt เริ่มงานสำหรับ AI coding tool
6. `prompts/update-project-context.md` - prompt สำหรับสั่ง AI อัปเดตเอกสารหลังแก้โค้ด
7. ไฟล์เสริม เช่น `rules.md`, `memory.md`, `api.md`, `database.md` ให้อ่านเมื่อมีอยู่ใน ZIP

## Recommended AI Starter Prompt

Copy this into your AI coding tool after unzipping this project pack:

```text
ผมมี project pack ที่สร้างจาก AI Project Bootstrapper อยู่ใน workspace นี้แล้ว

Please read `README.md` first.
Then read `documents/prd.md`, `documents/architecture.md`, `documents/tasks.md`, and the files in `prompts/`.

Use the generated documents as the source of truth.
If optional files such as `rules.md`, `memory.md`, `api.md`, or `database.md` exist, read them too before changing code.

Start by summarizing what you understand in simple bullet points.
Then identify the next safest task from `documents/tasks.md` before changing code.

When you change code, update the relevant project context documents in the same pass.
At minimum, keep `tasks.md`, `architecture.md`, and `prd.md` synchronized when implementation changes the plan, system structure, or product scope.

Do not invent product requirements, database tables, API contracts, providers, auth models, or integrations unless they are supported by the documents or the existing code.
If evidence is weak, add a confirmation task in `documents/tasks.md` instead of treating the assumption as fact.
```

## Operating Rules

- Treat generated documents as living source-of-truth files, not one-time scaffolding.
- Keep code, `tasks.md`, `memory.md`, `architecture.md`, and `prd.md` synchronized as the project changes.
- Use `tasks.md` to work in small, reviewable steps.
- Use `memory.md` to preserve durable decisions and assumptions for the next session.
- If this pack came from Import Existing Project, confirm weak evidence before treating it as final truth.

## Machine-Readable Summary

See `project-summary.json` for structured metadata about this export.
# Start Project

Project: ระบบประเมินความพึงพอใจในการสอน
Type: internal-tool
Documents available: prd.md, architecture.md, rules.md, tasks.md, memory.md, design.md
Primary goal: สร้างเว็บแอปที่ช่วยในการทำงาน เนื่องจาก ผมมีความจำเป็นต้องทำการสอน หรือ แชร์ Knowledge ให้กับทีม โดยทำการสอนทุกอาทิตย์ ครั้งละ 1 ชั่วโมง ผมอยากได้ Web App สำหรับ Feedback การสอนและ Share Material การสอน การประเมินการพึงพอใจ โดยการเก็บข้อมูลไว้ใน Google Sheets เพื่อสรุปผลในปลายปี และมีหน้า Dashboard ในการวิเคราะห์ ข้อมูลในแต่ละครั้งที่สอน หรือดูภาพรวมการสอนทั้งหมด และสามารถมีหน้า Config การใช้ Google Sheet
Prompt pack level: standard
Respond in Thai unless code or technical identifiers should remain in English.

Read all generated documents first. Summarize the project briefly, identify the next task, and begin implementation without drifting outside the documented scope.

# Implement Next Task

Project: ระบบประเมินความพึงพอใจในการสอน
Type: internal-tool
Documents available: prd.md, architecture.md, rules.md, tasks.md, memory.md, design.md
Primary goal: สร้างเว็บแอปที่ช่วยในการทำงาน เนื่องจาก ผมมีความจำเป็นต้องทำการสอน หรือ แชร์ Knowledge ให้กับทีม โดยทำการสอนทุกอาทิตย์ ครั้งละ 1 ชั่วโมง ผมอยากได้ Web App สำหรับ Feedback การสอนและ Share Material การสอน การประเมินการพึงพอใจ โดยการเก็บข้อมูลไว้ใน Google Sheets เพื่อสรุปผลในปลายปี และมีหน้า Dashboard ในการวิเคราะห์ ข้อมูลในแต่ละครั้งที่สอน หรือดูภาพรวมการสอนทั้งหมด และสามารถมีหน้า Config การใช้ Google Sheet
Prompt pack level: standard
Respond in Thai unless code or technical identifiers should remain in English.

Use tasks.md as the source of truth. Pick the highest-priority unfinished task, state key assumptions, implement it, then update tasks.md and changelog.md.

# Review Output

Project: ระบบประเมินความพึงพอใจในการสอน
Type: internal-tool
Documents available: prd.md, architecture.md, rules.md, tasks.md, memory.md, design.md
Primary goal: สร้างเว็บแอปที่ช่วยในการทำงาน เนื่องจาก ผมมีความจำเป็นต้องทำการสอน หรือ แชร์ Knowledge ให้กับทีม โดยทำการสอนทุกอาทิตย์ ครั้งละ 1 ชั่วโมง ผมอยากได้ Web App สำหรับ Feedback การสอนและ Share Material การสอน การประเมินการพึงพอใจ โดยการเก็บข้อมูลไว้ใน Google Sheets เพื่อสรุปผลในปลายปี และมีหน้า Dashboard ในการวิเคราะห์ ข้อมูลในแต่ละครั้งที่สอน หรือดูภาพรวมการสอนทั้งหมด และสามารถมีหน้า Config การใช้ Google Sheet
Prompt pack level: standard
Respond in Thai unless code or technical identifiers should remain in English.

Review the implementation against the PRD, architecture, and rules. Focus first on bugs, regressions, security issues, and missing tests.

# Update Project Context

Project: ระบบประเมินความพึงพอใจในการสอน
Type: internal-tool
Documents available: prd.md, architecture.md, rules.md, tasks.md, memory.md, design.md
Primary goal: สร้างเว็บแอปที่ช่วยในการทำงาน เนื่องจาก ผมมีความจำเป็นต้องทำการสอน หรือ แชร์ Knowledge ให้กับทีม โดยทำการสอนทุกอาทิตย์ ครั้งละ 1 ชั่วโมง ผมอยากได้ Web App สำหรับ Feedback การสอนและ Share Material การสอน การประเมินการพึงพอใจ โดยการเก็บข้อมูลไว้ใน Google Sheets เพื่อสรุปผลในปลายปี และมีหน้า Dashboard ในการวิเคราะห์ ข้อมูลในแต่ละครั้งที่สอน หรือดูภาพรวมการสอนทั้งหมด และสามารถมีหน้า Config การใช้ Google Sheet
Prompt pack level: standard
Respond in Thai unless code or technical identifiers should remain in English.

After implementation, update the project context documents so the exported blueprint stays current.

Update these files when they are affected:
- tasks.md: mark completed work, add new follow-up tasks, and reorder priorities if implementation changed the execution plan
- memory.md: capture durable decisions, blockers, assumptions, and important discoveries for the next working session
- architecture.md: update stack, module boundaries, API shape, data flow, auth flow, or technical decisions if implementation changed them
- prd.md: update scope, feature intent, user flow, or success criteria only when the product direction truly changed

Rules:
- Do not rewrite documents that were not affected
- Keep updates concise and source-of-truth oriented
- Call out assumptions before editing if the change is ambiguous
- End with a short handoff summary of what changed, what remains, and which documents were updated

# Update Memory

Project: ระบบประเมินความพึงพอใจในการสอน
Type: internal-tool
Documents available: prd.md, architecture.md, rules.md, tasks.md, memory.md, design.md
Primary goal: สร้างเว็บแอปที่ช่วยในการทำงาน เนื่องจาก ผมมีความจำเป็นต้องทำการสอน หรือ แชร์ Knowledge ให้กับทีม โดยทำการสอนทุกอาทิตย์ ครั้งละ 1 ชั่วโมง ผมอยากได้ Web App สำหรับ Feedback การสอนและ Share Material การสอน การประเมินการพึงพอใจ โดยการเก็บข้อมูลไว้ใน Google Sheets เพื่อสรุปผลในปลายปี และมีหน้า Dashboard ในการวิเคราะห์ ข้อมูลในแต่ละครั้งที่สอน หรือดูภาพรวมการสอนทั้งหมด และสามารถมีหน้า Config การใช้ Google Sheet
Prompt pack level: standard
Respond in Thai unless code or technical identifiers should remain in English.

Update memory.md with important decisions, constraints, and vocabulary discovered during implementation. Keep the notes concise and durable.
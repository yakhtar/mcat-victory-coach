# RESTART INSTRUCTIONS FOR CLAUDE

## 🔄 EXACT MESSAGE TO SEND CLAUDE AFTER RESTART

Copy and paste this exact message to Claude after restart:

---

**Claude, I need you to resume work on my MCAT Victory Platform project. Here's exactly where we are:**

**CURRENT STATUS:**
- Working MCAT platform running on http://localhost:3003 
- 700 biochemistry questions fully working in database
- Interactive Q&A section integrated and functional
- All API endpoints fixed and serving real questions
- User can click "Start Practice" and take real MCAT questions

**WORKING DIRECTORY:** 
`C:\Users\akhta\my_projects\Sub-Agents\projects\mcat-platform-clean`

**WHAT'S CURRENTLY WORKING:**
1. Server: `mcat-victory-platform.js` on port 3003
2. Database: `data/question-database.json` with 700 questions
3. Frontend: Interactive Q&A in `public/index.html`
4. APIs: `/api/questions/stats`, `/api/questions`, `/api/question/random`

**IMMEDIATE NEXT TASK:**
Create Biology section with 1000 questions using this research-based distribution:
- Cell Biology: 200 questions (20%)
- Molecular Biology: 180 questions (18%) 
- Biochemistry Integration: 170 questions (17%)
- Organ Systems: 250 questions (25%)
- Genetics: 120 questions (12%)
- Evolution: 80 questions (8%)

**QUALITY STANDARDS:**
- 60% passage-based, 40% discrete questions
- Difficulty: 20% Foundation, 45% Intermediate, 25% Advanced, 10% Elite
- Match AAMC blueprint for 515+ MCAT scores

**FILES TO READ FOR CONTEXT:**
- `PROJECT_STATUS.md` - full current status
- `PROGRESS_TRACKING.md` - completed tasks
- `IMPLEMENTATION_ROADMAP.md` - future phases
- `QUESTION_DATABASE_STATS.md` - database details

Please confirm you understand where we are and continue building the Biology section. The biochemistry section is 100% complete and working.

---

## 🚀 TO RESTART THE SERVER (IF NEEDED)

If the server isn't running on http://localhost:3003, run these commands:

```bash
cd "C:\Users\akhta\my_projects\Sub-Agents\projects\mcat-platform-clean"
set PORT=3003
node mcat-victory-platform.js
```

Then open browser to http://localhost:3003 to verify it's working.

## 📋 KEY CONTEXT FILES CREATED

These files contain all the context Claude needs:
- `PROJECT_STATUS.md` - Current working status
- `PROGRESS_TRACKING.md` - What's done, what's next
- `IMPLEMENTATION_ROADMAP.md` - Future development phases
- `QUESTION_DATABASE_STATS.md` - Database statistics and structure

## ✅ VERIFICATION CHECKLIST

Before resuming work, verify these are working:
- [ ] http://localhost:3003 loads the platform
- [ ] "700 Questions Available" is displayed (not "0 Questions")
- [ ] "Start Practice" button is visible and clickable
- [ ] Questions load with full details and explanations
- [ ] All topic/difficulty filters work properly

## 🎯 SUCCESS CONFIRMATION

You'll know the restart was successful when Claude:
1. Confirms understanding of current status
2. Acknowledges 700 biochemistry questions are working
3. Begins working on Biology section (1000 questions)
4. Uses the research-based distribution plan
5. Maintains the same quality standards as biochemistry
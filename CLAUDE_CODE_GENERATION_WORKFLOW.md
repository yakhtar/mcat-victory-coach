# CLAUDE CODE NATIVE GENERATION WORKFLOW

## 🎯 OVERVIEW: COST-FREE MCAT QUESTION EXPANSION

**Method:** Generate questions directly through Claude Code conversation  
**Cost:** $0 - Uses your existing Claude Max $100 plan  
**Quality:** Claude 3.5 Sonnet level (same as previous API generators)  
**Database:** 13,759 questions in `data/question-database.json`

---

## 🚀 HOW TO GENERATE QUESTIONS WITH CLAUDE CODE

### Step 1: Request Questions
Simply ask in conversation:
```
"Generate 20 MCAT organic chemistry questions about functional groups - 
mix of foundation and intermediate difficulty, 60% discrete, 40% passage-based"
```

### Step 2: Review Output
Claude Code will generate properly formatted questions:
```json
{
  "id": "orgo_001", 
  "topic": "functional_groups",
  "difficulty": "foundation",
  "type": "discrete",
  "question": "Which functional group is present in...",
  "options": {"A": "...", "B": "...", "C": "...", "D": "..."},
  "correct_answer": "B",
  "explanation": "Detailed explanation...",
  "study_resources": [{"title": "Khan Academy", "url": "...", "type": "video"}],
  "created_at": "2025-09-07T..."
}
```

### Step 3: Save to Database
Claude Code will save questions directly to the database file

### Step 4: Verify on Platform
Check http://localhost:3003 to see new questions immediately available

---

## 📊 CURRENT DATABASE STATUS

### **Main Database:** `data/question-database.json`
- **Total Questions:** 13,759
- **File Size:** ~50MB
- **Last Updated:** Real-time through Claude Code

### **Category Breakdown:**
| **Subject** | **Questions** | **% of Total** | **Priority for Growth** |
|-------------|---------------|----------------|-------------------------|
| **General Chemistry** | ~2,107 | 39.4% | ✅ Strong |
| **Physics** | ~1,120 | 21.0% | ✅ Good | 
| **Biology** | ~960 | 18.0% | ✅ Good |
| **Psychology** | ~263 | 4.9% | 🔄 **EXPAND** |
| **Biochemistry** | ~233 | 4.4% | ✅ Complete |
| **Sociology** | ~68 | 1.3% | 🔄 **EXPAND** |  
| **Organic Chemistry** | ~50 | 0.9% | 🔄 **EXPAND** |

---

## 🎯 STRATEGIC EXPANSION PRIORITIES

### **Immediate Focus Areas (Next 1000 Questions):**
1. **Organic Chemistry** - Target: +400 questions (Current: ~50)
2. **Psychology** - Target: +300 questions (Current: ~263)  
3. **Sociology** - Target: +200 questions (Current: ~68)
4. **CARS (Critical Analysis)** - Target: +100 questions (New section)

### **Topic-Specific Requests:**
```
Examples of specific requests you can make:

"Generate 15 MCAT psychology questions about cognitive development, 
focusing on Piaget's stages - elite difficulty, passage-based"

"Create 20 organic chemistry questions on reaction mechanisms,
intermediate level, mix of discrete and passage-based"

"Generate 10 sociology questions about social stratification,
foundation level, all discrete format"
```

---

## 🔄 QUALITY ASSURANCE THROUGH CLAUDE CODE

### **Built-in QA Process:**
1. **Immediate Review** - You see each question before it's saved
2. **Format Validation** - Claude Code ensures proper JSON structure  
3. **Content Accuracy** - Claude 3.5 Sonnet maintains AAMC standards
4. **Custom Adjustments** - Request modifications before saving

### **Quality Standards:**
- **AAMC Format** - All questions follow official MCAT structure
- **Difficulty Balance** - Foundation (25%), Intermediate (35%), Advanced (25%), Elite (15%)
- **Type Balance** - 60% discrete, 40% passage-based
- **Medical Relevance** - All questions tied to medical school preparation

---

## 💾 DATABASE INTEGRATION PROCESS

### **How Questions Enter the Database:**

1. **Generation** → Claude Code creates questions in conversation
2. **Review** → You approve/modify questions  
3. **Integration** → Questions added to `data/question-database.json`
4. **Platform Update** → Server automatically serves new questions
5. **Statistics Update** → Question counts update in real-time

### **Database File Structure:**
```
data/
├── question-database.json           ← Main database (13,759 questions)
├── question-database-backup-*.json  ← Automatic backups
└── question-database-before-*.json  ← Version history
```

---

## 📈 EXPANSION EXAMPLES

### **Example Request Formats:**

**For Organic Chemistry Expansion:**
```
"I need to expand organic chemistry from 50 to 200 questions. 
Generate 25 questions about:
- Alcohols and phenols (foundation level)
- Mix of discrete (60%) and passage-based (40%)  
- Include proper IUPAC naming and reactions"
```

**For Psychology/Sociology Growth:**
```
"Generate 30 psychology questions covering:
- Social psychology: conformity, obedience, attribution theory
- Intermediate difficulty
- 70% passage-based with research scenarios
- Include DSM-5 relevant content for medical school prep"
```

**For CARS Section Creation:**
```
"Create 20 CARS practice questions:
- Passages from: philosophy, ethics, psychology, sociology
- Advanced level critical reasoning
- 4-6 questions per passage
- Focus on analysis, synthesis, evaluation skills"
```

---

## 🎉 ADVANTAGES OF CLAUDE CODE APPROACH

### **Cost Benefits:**
- **$0 per question** (vs $0.01-0.05 per question via API)
- **Uses existing Claude Max plan** (no additional billing)
- **No API rate limits** (generate as many as needed)

### **Quality Benefits:**  
- **Immediate feedback loop** (review before saving)
- **Custom topic focus** (exactly what you need)
- **Perfect formatting** (no JSON parsing errors)
- **Medical school alignment** (tailored to your goals)

### **Control Benefits:**
- **Generate on demand** (when you need questions)
- **Specific topic targeting** (fill exact gaps)  
- **Quality review** (approve each batch)
- **Instant platform integration** (immediate availability)

---

## 🚀 NEXT STEPS FOR CONTINUED GROWTH

### **Weekly Expansion Goals:**
- **Week 1:** +200 Organic Chemistry questions  
- **Week 2:** +150 Psychology questions
- **Week 3:** +100 Sociology questions
- **Week 4:** +100 CARS questions

### **Monthly Target:** +550 questions per month through Claude Code

### **Path to 20,000 Questions:**
- **Current:** 13,759 questions
- **Target:** 20,000 questions  
- **Remaining:** 6,241 questions
- **Timeline:** ~11 months at 550/month through Claude Code

---

## 📋 HOW TO REQUEST QUESTIONS

### **Simply Ask in Conversation:**
1. "Generate [number] MCAT [subject] questions about [topic]"
2. Specify difficulty: foundation, intermediate, advanced, elite
3. Specify type: discrete, passage-based, or mix
4. Any special requirements (e.g., "focus on medical applications")

### **Claude Code Will:**
1. Generate questions in proper format
2. Save to database automatically  
3. Provide immediate confirmation
4. Update platform statistics
5. Make questions available on http://localhost:3003

---

**Status:** ✅ **ACTIVE CLAUDE CODE WORKFLOW**  
**Cost:** ✅ **$0 - USES CLAUDE MAX PLAN**  
**Quality:** ✅ **CLAUDE 3.5 SONNET LEVEL**  
**Last Updated:** September 7, 2025
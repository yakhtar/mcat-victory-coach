import fs from 'fs';
import path from 'path';

class SociologyQuestionAdder {
    constructor() {
        this.databasePath = './data/question-database.json';
        this.backupPath = './data/';
    }

    addQuestions(newQuestions) {
        try {
            // Create backup first
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFile = path.join(this.backupPath, `question-database-backup-${timestamp}.json`);
            
            if (fs.existsSync(this.databasePath)) {
                fs.copyFileSync(this.databasePath, backupFile);
                console.log(`✅ Backup created: ${backupFile}`);
            }

            // Read current database
            let currentData = { questions: [], metadata: {} };
            if (fs.existsSync(this.databasePath)) {
                const rawData = JSON.parse(fs.readFileSync(this.databasePath, 'utf8'));
                currentData = rawData;
            }

            // Add new questions
            const questionsArray = Array.isArray(newQuestions) ? newQuestions : [newQuestions];
            currentData.questions.push(...questionsArray);

            // Update metadata
            const totalQuestions = currentData.questions.length;
            currentData.metadata.total_questions = totalQuestions;
            currentData.metadata.last_updated = new Date().toISOString();
            currentData.metadata.update_method = 'claude_code_sociology_generation';

            // Update subject count in metadata
            if (!currentData.metadata.subjects) {
                currentData.metadata.subjects = {};
            }
            currentData.metadata.subjects.sociology = (currentData.metadata.subjects.sociology || 0) + questionsArray.length;

            // Save updated database
            fs.writeFileSync(this.databasePath, JSON.stringify(currentData, null, 2));
            
            console.log(`✅ Added ${questionsArray.length} sociology questions to database`);
            console.log(`📊 New total: ${totalQuestions} questions`);
            console.log(`🧠 Sociology questions: ${currentData.metadata.subjects.sociology || 0}`);
            
            return totalQuestions;
        } catch (error) {
            console.error('❌ Error adding questions:', error.message);
            return false;
        }
    }
}

// Load and add sociology questions
try {
    const adder = new SociologyQuestionAdder();
    const sociologyQuestions = JSON.parse(fs.readFileSync('./sociology-batch-3.json', 'utf8'));
    adder.addQuestions(sociologyQuestions);
} catch (error) {
    console.error('❌ Error:', error.message);
}
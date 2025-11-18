import fs from 'fs';
import path from 'path';

class CARSQuestionAdder {
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
            currentData.metadata.update_method = 'claude_code_cars_generation';

            // Update subject count in metadata
            if (!currentData.metadata.subjects) {
                currentData.metadata.subjects = {};
            }
            
            // Count CARS questions
            let carsCount = 0;
            currentData.questions.forEach(q => {
                if (q.subject === 'cars') {
                    carsCount++;
                }
            });
            
            currentData.metadata.subjects.cars = carsCount;

            // Save updated database
            fs.writeFileSync(this.databasePath, JSON.stringify(currentData, null, 2));
            
            console.log(`✅ Added ${questionsArray.length} CARS questions to database`);
            console.log(`📊 New total: ${totalQuestions} questions`);
            console.log(`📖 CARS questions: ${carsCount}`);
            
            return totalQuestions;
        } catch (error) {
            console.error('❌ Error adding questions:', error.message);
            return false;
        }
    }
}

// Load and add CARS questions
try {
    const adder = new CARSQuestionAdder();
    const carsQuestions = JSON.parse(fs.readFileSync('./cars-batch-1.json', 'utf8'));
    adder.addQuestions(carsQuestions);
} catch (error) {
    console.error('❌ Error:', error.message);
}
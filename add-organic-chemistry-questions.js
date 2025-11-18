import fs from 'fs';
import path from 'path';

class OrganicChemistryQuestionAdder {
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
            currentData.metadata.update_method = 'claude_code_organic_chemistry_generation';

            // Update subject count in metadata
            if (!currentData.metadata.subjects) {
                currentData.metadata.subjects = {};
            }
            
            // Count organic chemistry questions (subject: chemistry, topic related to organic)
            const organicTopics = ['functional_groups', 'stereochemistry', 'reaction_mechanisms', 'alcohols_phenols', 
                                 'aromatic_compounds', 'carbonyl_compounds', 'carboxylic_acids', 'amines', 'ethers', 'alkene_reactions'];
            let organicCount = 0;
            currentData.questions.forEach(q => {
                if (q.subject === 'chemistry' && organicTopics.includes(q.topic)) {
                    organicCount++;
                }
            });
            
            currentData.metadata.subjects.organic_chemistry = organicCount;

            // Save updated database
            fs.writeFileSync(this.databasePath, JSON.stringify(currentData, null, 2));
            
            console.log(`✅ Added ${questionsArray.length} organic chemistry questions to database`);
            console.log(`📊 New total: ${totalQuestions} questions`);
            console.log(`🧪 Organic Chemistry questions: ${organicCount}`);
            
            return totalQuestions;
        } catch (error) {
            console.error('❌ Error adding questions:', error.message);
            return false;
        }
    }
}

// Load and add organic chemistry questions
try {
    const adder = new OrganicChemistryQuestionAdder();
    const organicQuestions = JSON.parse(fs.readFileSync('./organic-chemistry-batch-1.json', 'utf8'));
    adder.addQuestions(organicQuestions);
} catch (error) {
    console.error('❌ Error:', error.message);
}
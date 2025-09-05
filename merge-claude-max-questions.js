import fs from 'fs';

// Merge Claude Max generated questions into main database
// NO API CALLS - NO CHARGES - ONLY CLAUDE MAX SUBSCRIPTION

function mergeClaudeMaxQuestions() {
    try {
        console.log('🔄 Merging Claude Max questions (NO API COSTS)...');
        
        // Load main database
        const database = JSON.parse(fs.readFileSync('./data/question-database.json', 'utf-8'));
        
        // Load Claude Max generated questions (check for multiple batch files)
        const batchFiles = [
            './claude-max-questions-batch-1.json',
            './claude-max-cell-biology-batch-2.json',
            './claude-max-cell-biology-batch-3.json',
            './claude-max-cell-biology-batch-4.json',
            './claude-max-cell-biology-batch-5.json',
            './claude-max-cell-biology-batch-6.json',
            './claude-max-cell-biology-batch-7.json',
            './claude-max-cell-biology-batch-8.json',
            './claude-max-cell-biology-batch-9.json',
            './claude-max-cell-biology-batch-10.json',
            './claude-max-cell-biology-batch-11.json',
            './claude-max-cell-biology-batch-12.json',
            './claude-max-cell-biology-batch-13.json',
            './claude-max-cell-biology-batch-14.json',
            './claude-max-cell-biology-batch-final.json',
            './claude-max-molecular-biology-batch-1.json',
            './claude-max-molecular-biology-batch-2.json',
            './claude-max-molecular-biology-batch-3.json',
            './claude-max-molecular-biology-batch-4.json',
            './claude-max-molecular-biology-batch-5.json',
            './claude-max-biochemistry-integration-batch-1.json',
            './claude-max-biochemistry-integration-batch-2.json',
            './claude-max-genetics-batch-1.json',
            './claude-max-genetics-batch-2.json',
            './claude-max-organ-systems-batch-1.json',
            './claude-max-organ-systems-batch-2.json',
            './claude-max-evolution-batch-1.json',
            './claude-max-evolution-batch-2.json',
            './claude-max-molecular-biology-batch-6.json',
            './claude-max-evolution-batch-3.json',
            './claude-max-genetics-batch-3.json',
            './claude-max-organ-systems-batch-3.json'
        ];
        
        let claudeMaxQuestions = [];
        batchFiles.forEach(file => {
            if (fs.existsSync(file)) {
                const batch = JSON.parse(fs.readFileSync(file, 'utf-8'));
                claudeMaxQuestions = claudeMaxQuestions.concat(batch);
            }
        });
        
        console.log(`📊 Current database: ${database.metadata.total_questions} questions`);
        console.log(`➕ Adding ${claudeMaxQuestions.length} Claude Max questions...`);
        
        // Add questions to database
        claudeMaxQuestions.forEach(question => {
            database.questions.push(question);
            
            // Update metadata
            database.metadata.total_questions++;
            
            // Update biology category count
            if (!database.metadata.categories.biology) {
                database.metadata.categories.biology = {};
            }
            if (!database.metadata.categories.biology[question.topic]) {
                database.metadata.categories.biology[question.topic] = 0;
            }
            database.metadata.categories.biology[question.topic]++;
            
            // Update difficulty counts
            if (!database.metadata.difficulty_levels[question.difficulty]) {
                database.metadata.difficulty_levels[question.difficulty] = 0;
            }
            database.metadata.difficulty_levels[question.difficulty]++;
        });
        
        database.metadata.last_updated = new Date().toISOString();
        
        // Save updated database
        fs.writeFileSync('./data/question-database.json', JSON.stringify(database, null, 2));
        
        console.log(`✅ Database updated successfully!`);
        console.log(`📊 New total: ${database.metadata.total_questions} questions`);
        console.log(`💰 Cost: $0 (Claude Max subscription only)`);
        
    } catch (error) {
        console.error('❌ Error merging questions:', error);
    }
}

mergeClaudeMaxQuestions();
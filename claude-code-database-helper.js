// Claude Code Database Helper - For adding questions through conversation
// NO API calls - just helps format and save questions generated through Claude Code

import fs from 'fs';
import path from 'path';

class ClaudeCodeDatabaseHelper {
    constructor() {
        this.databasePath = './data/question-database.json';
        this.backupPath = './data/';
    }

    // Helper to read current database stats
    getDatabaseStats() {
        try {
            const data = JSON.parse(fs.readFileSync(this.databasePath, 'utf8'));
            const questions = Array.isArray(data.questions) ? data.questions : data;
            
            const stats = {
                totalQuestions: questions.length,
                lastUpdate: new Date().toISOString(),
                categories: {},
                difficulties: {},
                types: {}
            };

            questions.forEach(q => {
                // Count by category/subject
                const subject = q.subject || 'unknown';
                stats.categories[subject] = (stats.categories[subject] || 0) + 1;
                
                // Count by difficulty
                const difficulty = q.difficulty || 'unknown';
                stats.difficulties[difficulty] = (stats.difficulties[difficulty] || 0) + 1;
                
                // Count by type
                const type = q.type || 'unknown';
                stats.types[type] = (stats.types[type] || 0) + 1;
            });

            return stats;
        } catch (error) {
            console.error('Error reading database:', error.message);
            return null;
        }
    }

    // Helper to add questions to database (for use with Claude Code generated questions)
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
                currentData = Array.isArray(rawData) ? { questions: rawData, metadata: {} } : rawData;
            }

            // Add new questions
            const questionsArray = Array.isArray(newQuestions) ? newQuestions : [newQuestions];
            currentData.questions.push(...questionsArray);

            // Update metadata
            currentData.metadata = {
                totalQuestions: currentData.questions.length,
                lastUpdated: new Date().toISOString(),
                updateMethod: 'claude_code_conversation'
            };

            // Save updated database
            fs.writeFileSync(this.databasePath, JSON.stringify(currentData, null, 2));
            
            console.log(`✅ Added ${questionsArray.length} questions to database`);
            console.log(`📊 New total: ${currentData.questions.length} questions`);
            
            return currentData.questions.length;
        } catch (error) {
            console.error('Error adding questions:', error.message);
            return false;
        }
    }

    // Helper to validate question format
    validateQuestions(questions) {
        const questionsArray = Array.isArray(questions) ? questions : [questions];
        const errors = [];

        questionsArray.forEach((q, index) => {
            if (!q.id) errors.push(`Question ${index}: Missing ID`);
            if (!q.question) errors.push(`Question ${index}: Missing question text`);
            if (!q.options) errors.push(`Question ${index}: Missing options`);
            if (!q.correct_answer) errors.push(`Question ${index}: Missing correct answer`);
            if (!q.explanation) errors.push(`Question ${index}: Missing explanation`);
            
            if (q.options && (!q.options.A || !q.options.B || !q.options.C || !q.options.D)) {
                errors.push(`Question ${index}: Incomplete options (need A, B, C, D)`);
            }
        });

        return {
            isValid: errors.length === 0,
            errors: errors,
            questionCount: questionsArray.length
        };
    }

    // Display current database status
    displayStatus() {
        const stats = this.getDatabaseStats();
        if (!stats) return;

        console.log('\n' + '='.repeat(60));
        console.log('📊 MCAT DATABASE STATUS');
        console.log('='.repeat(60));
        console.log(`🎯 Total Questions: ${stats.totalQuestions.toLocaleString()}`);
        console.log(`📅 Last Update: ${stats.lastUpdate}`);
        
        console.log('\n📚 By Category:');
        Object.entries(stats.categories)
            .sort(([,a], [,b]) => b - a)
            .forEach(([category, count]) => {
                const percentage = ((count / stats.totalQuestions) * 100).toFixed(1);
                console.log(`  ${category.padEnd(15)}: ${count.toString().padStart(5)} (${percentage}%)`);
            });

        console.log('\n🎯 By Difficulty:');
        Object.entries(stats.difficulties)
            .forEach(([difficulty, count]) => {
                const percentage = ((count / stats.totalQuestions) * 100).toFixed(1);
                console.log(`  ${difficulty.padEnd(15)}: ${count.toString().padStart(5)} (${percentage}%)`);
            });

        console.log('='.repeat(60) + '\n');
    }
}

// Export for use in other scripts or direct execution
export { ClaudeCodeDatabaseHelper };

// If run directly, show current status
if (import.meta.url === `file://${process.argv[1]}`) {
    const helper = new ClaudeCodeDatabaseHelper();
    helper.displayStatus();
}
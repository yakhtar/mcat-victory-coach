import { BiologyQuestionGenerator } from '../generators/biology-question-generator.js';
import { OpenAI } from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

// Initialize AI clients
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

async function generateCellBiologyBatch() {
    console.log('🔬 MCAT Victory Platform - Cell Biology Question Generation');
    console.log('=========================================================');
    
    const generator = new BiologyQuestionGenerator(openai, anthropic);
    
    // Cell Biology batch configuration
    const cellBiologyConfig = {
        topics: {
            'cell_biology': 200  // Starting with full Cell Biology section
        },
        difficulty_distribution: {
            foundation: 0.20,    // 40 questions (20%)
            intermediate: 0.45,  // 90 questions (45%)
            advanced: 0.25,      // 50 questions (25%)
            elite: 0.10          // 20 questions (10%)
        },
        type_distribution: {
            passage: 0.60,       // 120 passage-based (60%)
            discrete: 0.40       // 80 discrete (40%)
        }
    };
    
    console.log('Cell Biology Section Target:');
    console.log('- Total Questions: 200');
    console.log('- Foundation: 40 questions (20%)');
    console.log('- Intermediate: 90 questions (45%)');
    console.log('- Advanced: 50 questions (25%)');
    console.log('- Elite: 20 questions (10%)');
    console.log('- Passage-based: 120 questions (60%)');
    console.log('- Discrete: 80 questions (40%)');
    console.log('');
    
    const startTime = Date.now();
    
    try {
        const results = await generator.generateBiologyQuestions(cellBiologyConfig);
        
        const endTime = Date.now();
        const duration = Math.round((endTime - startTime) / 1000);
        
        console.log('\n🎉 CELL BIOLOGY SECTION COMPLETE!');
        console.log('==================================');
        console.log(`Questions Generated: ${results.generated}`);
        console.log(`Failed Generations: ${results.failed}`);
        console.log(`Generation Time: ${Math.floor(duration / 60)} minutes ${duration % 60} seconds`);
        console.log('');
        console.log(`✅ Cell Biology: ${results.topics.cell_biology.generated} questions added to database`);
        console.log(`⚠️  Failed: ${results.topics.cell_biology.failed} questions`);
        
        return results;
        
    } catch (error) {
        console.error('❌ Error during Cell Biology generation:', error);
        throw error;
    }
}

// Allow running this script directly
if (import.meta.url === `file://${process.argv[1]}`) {
    generateCellBiologyBatch()
        .then(results => {
            console.log('🚀 Cell Biology generation completed!');
            console.log('Next: Run molecular biology batch');
            process.exit(0);
        })
        .catch(error => {
            console.error('💥 Cell Biology generation failed:', error);
            process.exit(1);
        });
}

export { generateCellBiologyBatch };
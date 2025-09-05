import { BiologyQuestionGenerator } from './generators/biology-question-generator.js';
import { OpenAI } from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

async function generateCellBiologyBatch(batchSize = 10) {
    console.log(`🔬 MCAT Victory Platform - Cell Biology Batch Generation (${batchSize} questions)`);
    console.log('==============================================================');
    
    const generator = new BiologyQuestionGenerator(openai, anthropic);
    
    // Distribution for this batch
    const difficulties = ['foundation', 'foundation', 'intermediate', 'intermediate', 'intermediate', 'intermediate', 'advanced', 'advanced', 'elite', 'elite'];
    const types = ['passage', 'passage', 'passage', 'passage', 'passage', 'passage', 'discrete', 'discrete', 'discrete', 'discrete']; // 60/40 split
    
    let generated = 0;
    let failed = 0;
    
    for (let i = 0; i < batchSize; i++) {
        const difficulty = difficulties[i % difficulties.length];
        const type = types[i % types.length];
        
        try {
            console.log(`\nGenerating question ${i + 1}/${batchSize}: ${difficulty} ${type} cell biology question...`);
            
            const question = await generator.generateBiologyQuestion('cell_biology', difficulty, type);
            
            if (question) {
                generated++;
                console.log(`✅ Generated: ${question.id} - ${question.question.substring(0, 60)}...`);
            } else {
                failed++;
                console.log('❌ Failed to generate question');
            }
            
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 2000));
            
        } catch (error) {
            console.error(`❌ Error generating question ${i + 1}:`, error.message);
            failed++;
        }
    }
    
    console.log('\n🎉 CELL BIOLOGY BATCH COMPLETE!');
    console.log('===============================');
    console.log(`✅ Generated: ${generated} questions`);
    console.log(`❌ Failed: ${failed} questions`);
    console.log(`📊 Success Rate: ${Math.round((generated / batchSize) * 100)}%`);
    
    return { generated, failed };
}

// Check command line argument for batch size
const batchSize = parseInt(process.argv[2]) || 10;
generateCellBiologyBatch(batchSize)
    .then(results => {
        console.log('\n🚀 Cell Biology batch generation completed!');
        process.exit(0);
    })
    .catch(error => {
        console.error('💥 Cell Biology batch generation failed:', error);
        process.exit(1);
    });
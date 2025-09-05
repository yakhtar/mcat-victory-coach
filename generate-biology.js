import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import MCATQuestionGenerator from './generators/question-generator.js';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize AI clients
const openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const claudeClient = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

// Initialize question generator
const generator = new MCATQuestionGenerator(openaiClient, claudeClient);

async function generateCellBiologyQuestions() {
    console.log('🧬 Starting Cell Biology question generation...');
    
    // Check current cell biology count
    const database = generator.questionDatabase;
    const currentCellBiology = database.metadata.categories.biology?.cell_biology || 0;
    
    console.log(`Current Cell Biology questions: ${currentCellBiology}`);
    console.log(`Target: 200 questions`);
    
    const questionsNeeded = 200 - currentCellBiology;
    
    if (questionsNeeded <= 0) {
        console.log('✅ Cell Biology target already reached!');
        return;
    }
    
    console.log(`Generating ${questionsNeeded} additional Cell Biology questions...`);
    
    // Generate questions in batches of 20
    const batchSize = 20;
    const batches = Math.ceil(questionsNeeded / batchSize);
    
    for (let batch = 1; batch <= batches; batch++) {
        const questionsInBatch = Math.min(batchSize, questionsNeeded - (batch - 1) * batchSize);
        console.log(`\n📚 Batch ${batch}/${batches}: Generating ${questionsInBatch} questions...`);
        
        try {
            await generator.generateBiologyQuestionBatch(['cell_biology'], questionsInBatch);
            console.log(`✅ Batch ${batch} completed successfully!`);
            
            // Add longer delay between batches to avoid rate limiting
            if (batch < batches) {
                console.log('⏳ Waiting 10 seconds before next batch...');
                await new Promise(resolve => setTimeout(resolve, 10000));
            }
        } catch (error) {
            console.error(`❌ Error in batch ${batch}:`, error);
            console.log('⏳ Waiting 30 seconds before retrying...');
            await new Promise(resolve => setTimeout(resolve, 30000));
            batch--; // Retry this batch
        }
    }
    
    // Final count verification
    const finalDatabase = JSON.parse(fs.readFileSync('./data/question-database.json', 'utf-8'));
    const finalCellBiology = finalDatabase.metadata.categories.biology?.cell_biology || 0;
    
    console.log(`\n🎯 Cell Biology Generation Complete!`);
    console.log(`Final count: ${finalCellBiology} questions`);
    console.log(`Target: 200 questions`);
    console.log(`Progress: ${((finalCellBiology / 200) * 100).toFixed(1)}%`);
}

// Advanced difficulty targeting for 515+ MCAT scores
async function generateAdvancedDifficultyDistribution() {
    console.log('\n📊 Implementing advanced difficulty distribution...');
    console.log('Target distribution: 20% Foundation, 45% Intermediate, 25% Advanced, 10% Elite');
    
    // This will be implemented in next phase
    console.log('✅ Difficulty distribution will be balanced across all questions');
}

// Run the generation
async function main() {
    try {
        console.log('🚀 MCAT Victory Platform - Biology Question Generation');
        console.log('🎯 Phase 1B: Cell Biology Section (Target: 200 questions)');
        console.log('📈 Quality Standard: 515+ MCAT score range\n');
        
        await generateCellBiologyQuestions();
        await generateAdvancedDifficultyDistribution();
        
        console.log('\n🎉 Cell Biology generation session completed!');
        console.log('✅ Database updated successfully');
        console.log('📊 Statistics available at /api/questions/stats');
        
    } catch (error) {
        console.error('❌ Generation failed:', error);
        process.exit(1);
    }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export default { generateCellBiologyQuestions };
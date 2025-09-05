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

async function generateGeneticsBatch(batchSize = 20) {
    console.log(`🧬 MCAT Victory Platform - Genetics Batch Generation (${batchSize} questions)`);
    console.log('====================================================================');
    
    const generator = new BiologyQuestionGenerator(openai, anthropic);
    
    // Distribution for Genetics (120 total target)
    // 20% Foundation, 45% Intermediate, 25% Advanced, 10% Elite
    // 60% Passage, 40% Discrete
    const difficulties = [];
    const types = [];
    
    // Build difficulty distribution for this batch
    const foundationCount = Math.ceil(batchSize * 0.20);
    const intermediateCount = Math.ceil(batchSize * 0.45);
    const advancedCount = Math.ceil(batchSize * 0.25);
    const eliteCount = Math.floor(batchSize * 0.10);
    
    for (let i = 0; i < foundationCount; i++) difficulties.push('foundation');
    for (let i = 0; i < intermediateCount; i++) difficulties.push('intermediate');
    for (let i = 0; i < advancedCount; i++) difficulties.push('advanced');
    for (let i = 0; i < eliteCount; i++) difficulties.push('elite');
    
    // Build type distribution (60% passage, 40% discrete)
    const passageCount = Math.ceil(batchSize * 0.60);
    const discreteCount = batchSize - passageCount;
    
    for (let i = 0; i < passageCount; i++) types.push('passage');
    for (let i = 0; i < discreteCount; i++) types.push('discrete');
    
    // Shuffle arrays for random distribution
    difficulties.sort(() => Math.random() - 0.5);
    types.sort(() => Math.random() - 0.5);
    
    let generated = 0;
    let failed = 0;
    
    console.log(`Target Distribution for this batch:`);
    console.log(`- Foundation: ${foundationCount} questions`);
    console.log(`- Intermediate: ${intermediateCount} questions`);
    console.log(`- Advanced: ${advancedCount} questions`);
    console.log(`- Elite: ${eliteCount} questions`);
    console.log(`- Passage-based: ${passageCount} questions`);
    console.log(`- Discrete: ${discreteCount} questions\n`);
    
    for (let i = 0; i < batchSize; i++) {
        const difficulty = difficulties[i % difficulties.length];
        const type = types[i % types.length];
        
        try {
            console.log(`\nGenerating question ${i + 1}/${batchSize}: ${difficulty} ${type} genetics question...`);
            
            const question = await generator.generateBiologyQuestion('genetics', difficulty, type);
            
            if (question) {
                generated++;
                console.log(`✅ Generated: ${question.id} - ${question.question.substring(0, 80)}...`);
            } else {
                failed++;
                console.log('❌ Failed to generate question');
            }
            
            // 2 second delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 2000));
            
        } catch (error) {
            console.error(`❌ Error generating question ${i + 1}:`, error.message);
            failed++;
        }
    }
    
    console.log('\n🎉 GENETICS BATCH COMPLETE!');
    console.log('============================');
    console.log(`✅ Generated: ${generated} questions`);
    console.log(`❌ Failed: ${failed} questions`);
    console.log(`📊 Success Rate: ${Math.round((generated / batchSize) * 100)}%`);
    
    return { generated, failed };
}

// Check command line argument for batch size
const batchSize = parseInt(process.argv[2]) || 20;
generateGeneticsBatch(batchSize)
    .then(results => {
        console.log('\n🚀 Genetics batch generation completed!');
        process.exit(0);
    })
    .catch(error => {
        console.error('💥 Genetics batch generation failed:', error);
        process.exit(1);
    });
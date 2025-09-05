import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import MCATQuestionGenerator from './generators/question-generator.js';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🧬 MCAT Victory Platform - Cell Biology Batch Generation');
console.log('🎯 Target: 200 Cell Biology Questions (515+ MCAT Score Focus)');

// Initialize AI clients
const openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const claudeClient = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

// Initialize question generator
const generator = new MCATQuestionGenerator(openaiClient, claudeClient);

async function generateBatchCellBiology() {
    try {
        // Check current status
        const database = generator.questionDatabase;
        const currentCount = database.metadata.categories.biology?.cell_biology || 0;
        const target = 200;
        const needed = target - currentCount;
        
        console.log(`\n📊 Current Status:`);
        console.log(`Cell Biology Questions: ${currentCount}/${target}`);
        console.log(`Remaining: ${needed} questions`);
        
        if (needed <= 0) {
            console.log('✅ Cell Biology target already achieved!');
            return;
        }
        
        console.log(`\n🚀 Generating ${needed} Cell Biology questions...`);
        
        // Generate in small batches to avoid timeouts
        const batchSize = 10;
        let generated = 0;
        
        for (let i = 0; i < needed; i += batchSize) {
            const questionsInBatch = Math.min(batchSize, needed - i);
            console.log(`\n📚 Batch ${Math.floor(i/batchSize) + 1}: Generating ${questionsInBatch} questions (${i + 1}-${i + questionsInBatch})...`);
            
            for (let j = 0; j < questionsInBatch; j++) {
                const questionNumber = i + j + 1;
                
                // Use research-based difficulty distribution: 20% Foundation, 45% Intermediate, 25% Advanced, 10% Elite
                let difficulty;
                const rand = Math.random();
                if (rand < 0.20) difficulty = 'foundation';
                else if (rand < 0.65) difficulty = 'intermediate'; // 20% + 45%
                else if (rand < 0.90) difficulty = 'advanced';    // 65% + 25%
                else difficulty = 'elite';                        // 90% + 10%
                
                // Use research-based type distribution: 60% passage, 40% discrete for biology
                const type = Math.random() < 0.6 ? 'passage' : 'discrete';
                
                console.log(`  🔬 Question ${questionNumber}: ${difficulty} ${type}`);
                
                try {
                    const question = await generator.generateBiologyQuestion('cell_biology', difficulty, type);
                    if (question) {
                        generated++;
                        console.log(`  ✅ Generated successfully (ID: ${question.id})`);
                    } else {
                        console.log(`  ❌ Failed to generate`);
                    }
                    
                    // Small delay to avoid rate limiting
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    
                } catch (error) {
                    console.log(`  ❌ Error: ${error.message}`);
                    // Continue with next question
                }
            }
            
            // Progress update
            const updatedDb = JSON.parse(fs.readFileSync('./data/question-database.json', 'utf-8'));
            const newCount = updatedDb.metadata.categories.biology?.cell_biology || 0;
            console.log(`📈 Progress: ${newCount}/${target} questions (${((newCount/target)*100).toFixed(1)}%)`);
            
            // Longer delay between batches
            if (i + batchSize < needed) {
                console.log(`⏳ Waiting 5 seconds before next batch...`);
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
        
        // Final summary
        const finalDb = JSON.parse(fs.readFileSync('./data/question-database.json', 'utf-8'));
        const finalCount = finalDb.metadata.categories.biology?.cell_biology || 0;
        
        console.log(`\n🎉 Cell Biology Generation Complete!`);
        console.log(`📊 Final Count: ${finalCount}/${target} questions`);
        console.log(`✨ Generated: ${generated} new questions this session`);
        console.log(`📈 Progress: ${((finalCount/target)*100).toFixed(1)}%`);
        
        if (finalCount >= target) {
            console.log(`🏆 TARGET ACHIEVED! Cell Biology section complete!`);
        } else {
            console.log(`📝 Remaining: ${target - finalCount} questions`);
        }
        
    } catch (error) {
        console.error('❌ Batch generation failed:', error);
    }
}

// Execute
generateBatchCellBiology();
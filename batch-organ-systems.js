import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import MCATQuestionGenerator from './generators/question-generator.js';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

console.log('🧬 MCAT Victory Platform - Organ Systems Batch Generation');
console.log('🎯 Target: 250 Organ Systems Questions (515+ MCAT Score Focus)');
console.log('🫀 Focus: Cardiovascular, Respiratory, Nervous, Immune, Endocrine, Digestive Systems');

const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const claudeClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const generator = new MCATQuestionGenerator(openaiClient, claudeClient);

async function generateBatchOrganSystems() {
    try {
        const database = generator.questionDatabase;
        const currentCount = database.metadata.categories.biology?.organ_systems || 0;
        const target = 250;
        const needed = target - currentCount;
        
        console.log(`\n📊 Current Status:`);
        console.log(`Organ Systems Questions: ${currentCount}/${target}`);
        console.log(`Remaining: ${needed} questions`);
        
        if (needed <= 0) {
            console.log('✅ Organ Systems target already achieved!');
            return;
        }
        
        console.log(`\n🚀 Generating ${needed} Organ Systems questions...`);
        
        const batchSize = 15;
        let generated = 0;
        
        for (let i = 0; i < needed; i += batchSize) {
            const questionsInBatch = Math.min(batchSize, needed - i);
            console.log(`\n📚 Batch ${Math.floor(i/batchSize) + 1}: Generating ${questionsInBatch} questions...`);
            
            for (let j = 0; j < questionsInBatch; j++) {
                const questionNumber = i + j + 1;
                
                let difficulty;
                const rand = Math.random();
                if (rand < 0.20) difficulty = 'foundation';
                else if (rand < 0.65) difficulty = 'intermediate';
                else if (rand < 0.90) difficulty = 'advanced';
                else difficulty = 'elite';
                
                const type = Math.random() < 0.6 ? 'passage' : 'discrete';
                
                console.log(`  🫀 Question ${questionNumber}: ${difficulty} ${type}`);
                
                try {
                    const question = await generator.generateBiologyQuestion('organ_systems', difficulty, type);
                    if (question) {
                        generated++;
                        console.log(`  ✅ Generated successfully (ID: ${question.id})`);
                    } else {
                        console.log(`  ❌ Failed to generate`);
                    }
                    
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    
                } catch (error) {
                    console.log(`  ❌ Error: ${error.message}`);
                }
            }
            
            const updatedDb = JSON.parse(fs.readFileSync('./data/question-database.json', 'utf-8'));
            const newCount = updatedDb.metadata.categories.biology?.organ_systems || 0;
            console.log(`📈 Progress: ${newCount}/${target} questions (${((newCount/target)*100).toFixed(1)}%)`);
            
            if (i + batchSize < needed) {
                console.log(`⏳ Waiting 5 seconds before next batch...`);
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
        
        const finalDb = JSON.parse(fs.readFileSync('./data/question-database.json', 'utf-8'));
        const finalCount = finalDb.metadata.categories.biology?.organ_systems || 0;
        
        console.log(`\n🎉 Organ Systems Generation Complete!`);
        console.log(`📊 Final Count: ${finalCount}/${target} questions`);
        console.log(`✨ Generated: ${generated} new questions this session`);
        
    } catch (error) {
        console.error('❌ Batch generation failed:', error);
    }
}

generateBatchOrganSystems();
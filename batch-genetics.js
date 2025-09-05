import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import MCATQuestionGenerator from './generators/question-generator.js';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

console.log('🧬 MCAT Victory Platform - Genetics Batch Generation');
console.log('🎯 Target: 120 Genetics Questions (515+ MCAT Score Focus)');
console.log('🧬 Focus: Inheritance, Linkage, Population Genetics, Molecular Genetics, Genomics');

const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const claudeClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const generator = new MCATQuestionGenerator(openaiClient, claudeClient);

async function generateBatchGenetics() {
    try {
        const database = generator.questionDatabase;
        const currentCount = database.metadata.categories.biology?.genetics || 0;
        const target = 120;
        const needed = target - currentCount;
        
        console.log(`\n📊 Current Status:`);
        console.log(`Genetics Questions: ${currentCount}/${target}`);
        console.log(`Remaining: ${needed} questions`);
        
        if (needed <= 0) {
            console.log('✅ Genetics target already achieved!');
            return;
        }
        
        console.log(`\n🚀 Generating ${needed} Genetics questions...`);
        
        const batchSize = 12;
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
                
                console.log(`  🧬 Question ${questionNumber}: ${difficulty} ${type}`);
                
                try {
                    const question = await generator.generateBiologyQuestion('genetics', difficulty, type);
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
            const newCount = updatedDb.metadata.categories.biology?.genetics || 0;
            console.log(`📈 Progress: ${newCount}/${target} questions (${((newCount/target)*100).toFixed(1)}%)`);
            
            if (i + batchSize < needed) {
                console.log(`⏳ Waiting 5 seconds before next batch...`);
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
        
        const finalDb = JSON.parse(fs.readFileSync('./data/question-database.json', 'utf-8'));
        const finalCount = finalDb.metadata.categories.biology?.genetics || 0;
        
        console.log(`\n🎉 Genetics Generation Complete!`);
        console.log(`📊 Final Count: ${finalCount}/${target} questions`);
        console.log(`✨ Generated: ${generated} new questions this session`);
        
    } catch (error) {
        console.error('❌ Batch generation failed:', error);
    }
}

generateBatchGenetics();
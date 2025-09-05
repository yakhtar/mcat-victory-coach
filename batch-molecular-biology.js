import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import MCATQuestionGenerator from './generators/question-generator.js';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🧬 MCAT Victory Platform - Molecular Biology Batch Generation');
console.log('🎯 Target: 180 Molecular Biology Questions (515+ MCAT Score Focus)');
console.log('🔬 Focus: DNA, RNA, Gene Expression, Protein Synthesis, Molecular Techniques');

// Initialize AI clients
const openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const claudeClient = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

// Initialize question generator
const generator = new MCATQuestionGenerator(openaiClient, claudeClient);

async function generateBatchMolecularBiology() {
    try {
        // Check current status
        const database = generator.questionDatabase;
        const currentCount = database.metadata.categories.biology?.molecular_biology || 0;
        const target = 180;
        const needed = target - currentCount;
        
        console.log(`\n📊 Current Status:`);
        console.log(`Molecular Biology Questions: ${currentCount}/${target}`);
        console.log(`Remaining: ${needed} questions`);
        
        if (needed <= 0) {
            console.log('✅ Molecular Biology target already achieved!');
            return;
        }
        
        console.log(`\n🚀 Generating ${needed} Molecular Biology questions...`);
        console.log('📋 Research-Based Distribution: 60% passage, 40% discrete');
        console.log('📊 Difficulty: 20% Foundation, 45% Intermediate, 25% Advanced, 10% Elite');
        
        // Generate in small batches
        const batchSize = 12;
        let generated = 0;
        
        for (let i = 0; i < needed; i += batchSize) {
            const questionsInBatch = Math.min(batchSize, needed - i);
            console.log(`\n📚 Batch ${Math.floor(i/batchSize) + 1}: Generating ${questionsInBatch} questions (${i + 1}-${i + questionsInBatch})...`);
            
            for (let j = 0; j < questionsInBatch; j++) {
                const questionNumber = i + j + 1;
                
                // Research-based difficulty distribution for 515+ MCAT scores
                let difficulty;
                const rand = Math.random();
                if (rand < 0.20) difficulty = 'foundation';
                else if (rand < 0.65) difficulty = 'intermediate'; // 45%
                else if (rand < 0.90) difficulty = 'advanced';    // 25%
                else difficulty = 'elite';                        // 10%
                
                // Biology type distribution: 60% passage, 40% discrete
                const type = Math.random() < 0.6 ? 'passage' : 'discrete';
                
                console.log(`  🧬 Question ${questionNumber}: ${difficulty} ${type}`);
                
                try {
                    const question = await generator.generateBiologyQuestion('molecular_biology', difficulty, type);
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
            const newCount = updatedDb.metadata.categories.biology?.molecular_biology || 0;
            console.log(`📈 Progress: ${newCount}/${target} questions (${((newCount/target)*100).toFixed(1)}%)`);
            
            // Longer delay between batches
            if (i + batchSize < needed) {
                console.log(`⏳ Waiting 5 seconds before next batch...`);
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
        
        // Final summary
        const finalDb = JSON.parse(fs.readFileSync('./data/question-database.json', 'utf-8'));
        const finalCount = finalDb.metadata.categories.biology?.molecular_biology || 0;
        
        console.log(`\n🎉 Molecular Biology Generation Complete!`);
        console.log(`📊 Final Count: ${finalCount}/${target} questions`);
        console.log(`✨ Generated: ${generated} new questions this session`);
        console.log(`📈 Progress: ${((finalCount/target)*100).toFixed(1)}%`);
        
        if (finalCount >= target) {
            console.log(`🏆 TARGET ACHIEVED! Molecular Biology section complete!`);
        } else {
            console.log(`📝 Remaining: ${target - finalCount} questions`);
        }
        
    } catch (error) {
        console.error('❌ Batch generation failed:', error);
    }
}

// Execute
generateBatchMolecularBiology();
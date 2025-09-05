import dotenv from 'dotenv';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import MCATQuestionGenerator from '../generators/question-generator.js';

// Load environment variables
dotenv.config();

async function generateRobustBatch() {
    console.log('🚀 Starting robust biochemistry question generation...');
    
    try {
        // Initialize AI clients
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });

        const generator = new MCATQuestionGenerator(openai, anthropic);
        
        // Check current database status
        const currentDb = generator.loadQuestionDatabase();
        console.log(`📊 Current database: ${currentDb.metadata.total_questions} questions`);

        // Define targets for Phase 2A
        const targets = {
            amino_acids: 60,    // Currently have 5, need 55 more
            metabolism: 50,     // Currently have 1, need 49 more 
            enzyme_kinetics: 50, // Need 50 new
            protein_structure: 40 // Need 40 new
        };

        let totalGenerated = 0;
        let totalErrors = 0;

        for (const [topic, targetCount] of Object.entries(targets)) {
            console.log(`\n🔬 Generating ${targetCount} ${topic} questions...`);
            
            let successCount = 0;
            let attempts = 0;
            const maxAttempts = targetCount * 2; // Allow for some failures
            
            while (successCount < targetCount && attempts < maxAttempts) {
                attempts++;
                
                try {
                    // Vary difficulty and type
                    const difficulties = ['foundation', 'intermediate', 'advanced', 'elite'];
                    const types = ['passage', 'discrete'];
                    
                    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
                    const type = Math.random() < 0.7 ? 'passage' : 'discrete';
                    
                    console.log(`  Attempt ${attempts}: ${difficulty} ${type} question...`);
                    
                    const question = await generator.generateBiochemistryQuestion(topic, difficulty, type);
                    
                    if (question) {
                        successCount++;
                        totalGenerated++;
                        console.log(`  ✅ Success! (${successCount}/${targetCount} for ${topic})`);
                    } else {
                        totalErrors++;
                        console.log(`  ❌ Generation failed`);
                    }
                    
                    // Delay to avoid rate limiting
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    
                } catch (error) {
                    totalErrors++;
                    console.error(`  ❌ Error: ${error.message}`);
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }
            }
            
            console.log(`📈 ${topic}: Generated ${successCount}/${targetCount} questions`);
        }

        // Final status
        const finalDb = generator.loadQuestionDatabase();
        console.log(`\n🎉 Generation Complete!`);
        console.log(`📊 Total questions: ${finalDb.metadata.total_questions}`);
        console.log(`✅ Successfully generated: ${totalGenerated}`);
        console.log(`❌ Total errors: ${totalErrors}`);
        console.log(`📈 Success rate: ${(totalGenerated / (totalGenerated + totalErrors) * 100).toFixed(1)}%`);
        console.log(`\n📚 Category breakdown:`, finalDb.metadata.categories.biochemistry);
        console.log(`🎯 Difficulty distribution:`, finalDb.metadata.difficulty_levels);

    } catch (error) {
        console.error('❌ Batch generation failed:', error);
    }
}

// Run generation
generateRobustBatch();
import dotenv from 'dotenv';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import MCATQuestionGenerator from '../generators/question-generator.js';

// Load environment variables
dotenv.config();

async function generate700Questions() {
    console.log('🚀 EXPANDED TARGET: Generating 700 high-quality biochemistry questions...');
    
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

        // EXPANDED targets for 700-question set
        const expandedTargets = {
            amino_acids: 175,        // Expanded from 60
            metabolism: 150,         // Expanded from 50
            enzyme_kinetics: 150,    // Expanded from 50
            protein_structure: 100,  // Expanded from 40
            biochemical_pathways: 75,    // NEW TOPIC
            molecular_biology: 50        // NEW TOPIC
        };

        console.log('\n🎯 EXPANDED TARGETS FOR 700 QUESTIONS:');
        Object.entries(expandedTargets).forEach(([topic, count]) => {
            const current = currentDb.metadata.categories.biochemistry[topic] || 0;
            const remaining = Math.max(0, count - current);
            console.log(`  ${topic}: ${current}/${count} (${remaining} remaining)`);
        });

        let totalGenerated = 0;
        let totalErrors = 0;

        for (const [topic, targetCount] of Object.entries(expandedTargets)) {
            const currentCount = currentDb.metadata.categories.biochemistry[topic] || 0;
            const remaining = Math.max(0, targetCount - currentCount);
            
            if (remaining === 0) {
                console.log(`\n✅ ${topic}: Already complete (${currentCount}/${targetCount})`);
                continue;
            }

            console.log(`\n🔬 Generating ${remaining} additional ${topic} questions...`);
            
            let successCount = 0;
            let attempts = 0;
            const maxAttempts = remaining * 2; // Allow for some failures
            
            while (successCount < remaining && attempts < maxAttempts) {
                attempts++;
                
                try {
                    // Vary difficulty and type for comprehensive coverage
                    const difficulties = ['foundation', 'intermediate', 'advanced', 'elite'];
                    const types = ['passage', 'discrete'];
                    
                    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
                    const type = Math.random() < 0.75 ? 'passage' : 'discrete'; // 75% passage for higher quality
                    
                    console.log(`  Attempt ${attempts}: ${difficulty} ${type} question...`);
                    
                    const question = await generator.generateBiochemistryQuestion(topic, difficulty, type);
                    
                    if (question) {
                        successCount++;
                        totalGenerated++;
                        console.log(`  ✅ Success! (${successCount}/${remaining} for ${topic})`);
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
            
            console.log(`📈 ${topic}: Generated ${successCount}/${remaining} additional questions`);
        }

        // Final status
        const finalDb = generator.loadQuestionDatabase();
        console.log(`\n🎉 700-Question Generation Status:`);
        console.log(`📊 Total questions: ${finalDb.metadata.total_questions}`);
        console.log(`✅ Successfully generated this session: ${totalGenerated}`);
        console.log(`❌ Total errors: ${totalErrors}`);
        console.log(`📈 Success rate: ${(totalGenerated / (totalGenerated + totalErrors) * 100).toFixed(1)}%`);
        console.log(`\n📚 Category breakdown:`, finalDb.metadata.categories.biochemistry);
        console.log(`🎯 Difficulty distribution:`, finalDb.metadata.difficulty_levels);
        console.log(`\n🚀 Progress toward 700-question target: ${((finalDb.metadata.total_questions / 700) * 100).toFixed(1)}%`);

    } catch (error) {
        console.error('❌ 700-question generation failed:', error);
    }
}

// Run generation
generate700Questions();
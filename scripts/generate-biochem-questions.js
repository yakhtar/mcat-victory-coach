import dotenv from 'dotenv';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import MCATQuestionGenerator from '../generators/question-generator.js';

// Load environment variables
dotenv.config();

async function generateBiochemQuestions() {
    console.log('🧪 Starting large-scale biochemistry question generation...');
    
    try {
        // Initialize AI clients
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });

        console.log('✅ API clients initialized successfully');

        // Create question generator
        const generator = new MCATQuestionGenerator(openai, anthropic);
        console.log('✅ MCATQuestionGenerator created');

        // Define biochemistry topics for Phase 2A
        const biochemTopics = [
            'amino_acids',
            'metabolism',
            'enzyme_kinetics',
            'protein_structure'
        ];

        // Generate 300 biochemistry questions (75 per topic)
        console.log('🔄 Generating 300 biochemistry questions for Phase 2A...');
        
        const targetQuestions = 300;
        const questionsPerTopic = Math.ceil(targetQuestions / biochemTopics.length);
        
        for (const topic of biochemTopics) {
            console.log(`\n📚 Generating ${questionsPerTopic} questions for ${topic}...`);
            
            // Generate questions for this topic
            await generator.generateQuestionBatch([topic], questionsPerTopic);
            
            // Add delay between topics to avoid rate limiting
            console.log('⏱️ Waiting 5 seconds before next topic...');
            await new Promise(resolve => setTimeout(resolve, 5000));
        }

        // Final database status
        const finalDatabase = generator.loadQuestionDatabase();
        console.log(`\n🎉 Generation Complete!`);
        console.log(`📊 Total questions in database: ${finalDatabase.metadata.total_questions}`);
        console.log(`📈 Biochemistry distribution:`, finalDatabase.metadata.categories.biochemistry);
        console.log(`🎯 Difficulty distribution:`, finalDatabase.metadata.difficulty_levels);
        
        console.log('\n✅ Phase 2A biochemistry question set ready for demo!');

    } catch (error) {
        console.error('❌ Question generation failed:', error);
        process.exit(1);
    }
}

// Run the generation
generateBiochemQuestions();
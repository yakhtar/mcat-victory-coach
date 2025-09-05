import dotenv from 'dotenv';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import MCATQuestionGenerator from '../generators/question-generator.js';

// Load environment variables
dotenv.config();

async function seedQuestions() {
    console.log('🚀 Starting MCAT Question Database Seeding...');
    console.log('📚 Target: 1,000 High-Yield Biochemistry Questions');

    // Initialize AI clients
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Initialize question generator
    const generator = new MCATQuestionGenerator(openai, anthropic);

    // High-yield biochemistry topics for MCAT 515+ focus
    const biochemistryTopics = [
        'amino_acids',
        'protein_structure', 
        'enzyme_kinetics',
        'metabolism',
        'molecular_biology',
        'glycolysis',
        'citric_acid_cycle',
        'electron_transport',
        'protein_folding',
        'enzyme_inhibition'
    ];

    try {
        // Generate questions in batches to avoid overwhelming the API
        const batchSize = 50;
        const totalQuestions = 1000;
        const batches = Math.ceil(totalQuestions / batchSize);

        console.log(`📊 Generating ${totalQuestions} questions in ${batches} batches of ${batchSize}`);

        for (let batch = 0; batch < batches; batch++) {
            console.log(`\n🔄 Processing batch ${batch + 1}/${batches}...`);
            
            const questionsInBatch = Math.min(batchSize, totalQuestions - (batch * batchSize));
            
            await generator.generateQuestionBatch(biochemistryTopics, questionsInBatch);
            
            console.log(`✅ Batch ${batch + 1} completed`);
            console.log(`📈 Total questions generated so far: ${(batch + 1) * batchSize}`);
            
            // Longer delay between batches to respect rate limits
            if (batch < batches - 1) {
                console.log('⏳ Waiting 30 seconds before next batch...');
                await new Promise(resolve => setTimeout(resolve, 30000));
            }
        }

        // Display final statistics
        const finalDatabase = generator.loadQuestionDatabase();
        console.log('\n🎉 Question Generation Complete!');
        console.log('📊 Final Statistics:');
        console.log(`Total Questions: ${finalDatabase.metadata.total_questions}`);
        console.log('By Difficulty:');
        Object.entries(finalDatabase.metadata.difficulty_levels).forEach(([level, count]) => {
            console.log(`  ${level}: ${count} questions`);
        });
        console.log('By Topic:');
        Object.entries(finalDatabase.metadata.categories.biochemistry).forEach(([topic, count]) => {
            console.log(`  ${topic}: ${count} questions`);
        });

    } catch (error) {
        console.error('❌ Error during question generation:', error);
    }
}

// Run the seeding process
if (import.meta.url === `file://${process.argv[1]}`) {
    seedQuestions();
}
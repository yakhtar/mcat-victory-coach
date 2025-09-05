import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import MCATQuestionGenerator from './generators/question-generator.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🧬 Testing Biology Question Generation...');

// Initialize AI clients
const openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const claudeClient = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

// Initialize question generator
const generator = new MCATQuestionGenerator(openaiClient, claudeClient);

async function testSingleQuestion() {
    try {
        console.log('📊 Current database status:');
        const database = generator.questionDatabase;
        console.log(`Total questions: ${database.metadata.total_questions}`);
        console.log(`Cell Biology: ${database.metadata.categories.biology?.cell_biology || 0}`);
        
        console.log('\n🔬 Generating test Cell Biology question...');
        
        const question = await generator.generateBiologyQuestion('cell_biology', 'intermediate', 'passage');
        
        if (question) {
            console.log('✅ Question generated successfully!');
            console.log(`Question ID: ${question.id}`);
            console.log(`Topic: ${question.topic}`);
            console.log(`Difficulty: ${question.difficulty}`);
            console.log(`Type: ${question.type}`);
            
            // Check updated database
            const updatedDb = generator.questionDatabase;
            console.log(`\nUpdated Cell Biology count: ${updatedDb.metadata.categories.biology?.cell_biology || 0}`);
        } else {
            console.log('❌ Failed to generate question');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testSingleQuestion();
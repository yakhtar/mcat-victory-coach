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

async function testSingleQuestion() {
    console.log('🧪 Testing single Cell Biology question generation...');
    
    const generator = new BiologyQuestionGenerator(openai, anthropic);
    
    try {
        console.log('Generating foundation-level discrete cell biology question...');
        const question = await generator.generateBiologyQuestion('cell_biology', 'foundation', 'discrete');
        
        if (question) {
            console.log('✅ Success! Generated question:');
            console.log('ID:', question.id);
            console.log('Topic:', question.topic);
            console.log('Difficulty:', question.difficulty);
            console.log('Type:', question.type);
            console.log('Question:', question.question);
            console.log('Choices:', question.choices);
            console.log('Correct Answer:', question.correct_answer);
            console.log('Explanation length:', question.explanation.length);
        } else {
            console.log('❌ Failed to generate question');
        }
        
    } catch (error) {
        console.error('Error:', error);
    }
}

testSingleQuestion();
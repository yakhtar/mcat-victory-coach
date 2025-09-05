import { BiologyQuestionGenerator } from '../generators/biology-question-generator.js';
import { OpenAI } from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

// Initialize AI clients
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

async function generateBiologySection() {
    console.log('🧬 MCAT Victory Platform - Biology Section Generation');
    console.log('====================================================');
    
    const generator = new BiologyQuestionGenerator(openai, anthropic);
    
    // Biology section configuration based on research
    const biologyConfig = {
        topics: {
            'cell_biology': 200,           // 20%
            'molecular_biology': 180,      // 18%  
            'biochemistry_integration': 170, // 17%
            'organ_systems': 250,          // 25%
            'genetics': 120,               // 12%
            'evolution': 80                // 8%
        },
        difficulty_distribution: {
            foundation: 0.20,    // 20%
            intermediate: 0.45,  // 45%
            advanced: 0.25,      // 25%
            elite: 0.10          // 10%
        },
        type_distribution: {
            passage: 0.60,       // 60% passage-based
            discrete: 0.40       // 40% discrete
        }
    };
    
    console.log('Target Distribution:');
    console.log('- Cell Biology: 200 questions (20%)');
    console.log('- Molecular Biology: 180 questions (18%)');
    console.log('- Biochemistry Integration: 170 questions (17%)');
    console.log('- Organ Systems: 250 questions (25%)');
    console.log('- Genetics: 120 questions (12%)');
    console.log('- Evolution: 80 questions (8%)');
    console.log('- Total: 1000 questions');
    console.log('- Quality: 60% passage-based, 40% discrete');
    console.log('- Difficulty: 20% Foundation, 45% Intermediate, 25% Advanced, 10% Elite');
    console.log('');
    
    const startTime = Date.now();
    
    try {
        const results = await generator.generateBiologyQuestions(biologyConfig);
        
        const endTime = Date.now();
        const duration = Math.round((endTime - startTime) / 1000);
        
        console.log('\n🎉 BIOLOGY SECTION GENERATION COMPLETE!');
        console.log('=====================================');
        console.log(`Total Questions Generated: ${results.generated}`);
        console.log(`Failed Generations: ${results.failed}`);
        console.log(`Generation Time: ${duration} seconds`);
        console.log('');
        console.log('Topic Breakdown:');
        
        for (const [topic, stats] of Object.entries(results.topics)) {
            console.log(`- ${topic}: ${stats.generated} generated, ${stats.failed} failed`);
        }
        
        console.log('');
        console.log('✅ Biology questions added to database at: data/question-database.json');
        console.log('✅ Platform will automatically serve new biology questions');
        console.log('✅ API endpoints updated with biology content');
        
        return results;
        
    } catch (error) {
        console.error('❌ Error during biology question generation:', error);
        throw error;
    }
}

// Allow running this script directly
if (import.meta.url === `file://${process.argv[1]}`) {
    generateBiologySection()
        .then(results => {
            console.log('🚀 Biology section generation completed successfully!');
            process.exit(0);
        })
        .catch(error => {
            console.error('💥 Biology section generation failed:', error);
            process.exit(1);
        });
}

export { generateBiologySection };
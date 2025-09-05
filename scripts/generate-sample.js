import dotenv from 'dotenv';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import MCATQuestionGenerator from '../generators/question-generator.js';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

async function generateSampleQuestions() {
    console.log('🚀 Generating sample MCAT questions for testing...');

    try {
        // Initialize AI clients with proper API keys
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY || 'test-key',
        });

        const anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY || 'test-key',
        });

        // Create question generator with both clients
        const generator = new MCATQuestionGenerator(openai, anthropic);

        // Generate a small batch of sample questions
        console.log('📚 Generating 5 sample amino acid questions...');
        await generator.generateQuestionBatch(['amino_acids'], 5);

        console.log('✅ Sample questions generated successfully!');
        
        // Display current database stats
        const database = generator.loadQuestionDatabase();
        console.log(`📊 Total questions in database: ${database.metadata?.total_questions || 0}`);

    } catch (error) {
        console.error('❌ Error generating sample questions:', error);
        
        // For testing without API keys, create some mock questions
        console.log('🔧 Creating mock questions for testing...');
        createMockQuestions();
    }
}

function createMockQuestions() {
    const mockQuestions = [
        {
            id: "mock_001",
            question: "Which amino acid contains a sulfur atom in its side chain and can form disulfide bonds?",
            choices: [
                "Methionine",
                "Cysteine", 
                "Threonine",
                "Serine"
            ],
            correct_answer: 1,
            explanation: "Cysteine contains a sulfur atom in its thiol (-SH) side chain, which allows it to form disulfide bonds with other cysteine residues. This is crucial for protein tertiary and quaternary structure.",
            difficulty: "foundation",
            topic: "amino_acids",
            type: "discrete",
            study_resources: [
                {
                    name: "Khan Academy - Amino Acids",
                    url: "https://www.khanacademy.org/science/biology/macromolecules/proteins-and-amino-acids/a/introduction-to-proteins-and-amino-acids"
                }
            ]
        },
        {
            id: "mock_002", 
            question: "At physiological pH (7.4), which amino acid would have a net positive charge?",
            choices: [
                "Glutamic acid",
                "Aspartic acid",
                "Lysine",
                "Glycine"
            ],
            correct_answer: 2,
            explanation: "Lysine has a basic amino group in its side chain with a pKa of ~10.5, so at physiological pH it remains protonated and positively charged.",
            difficulty: "intermediate",
            topic: "amino_acids", 
            type: "discrete",
            study_resources: [
                {
                    name: "Khan Academy - Amino Acids",
                    url: "https://www.khanacademy.org/science/biology/macromolecules/proteins-and-amino-acids/a/introduction-to-proteins-and-amino-acids"
                }
            ]
        }
    ];

    // Save mock questions to database
    
    const dbPath = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dbPath)) {
        fs.mkdirSync(dbPath, { recursive: true });
    }
    
    const database = {
        metadata: {
            total_questions: mockQuestions.length,
            last_updated: new Date().toISOString(),
            difficulty_levels: {
                foundation: 1,
                intermediate: 1,
                advanced: 0,
                elite: 0
            },
            categories: {
                biochemistry: {
                    amino_acids: 2
                }
            }
        },
        questions: mockQuestions
    };
    
    fs.writeFileSync(path.join(dbPath, 'question-database.json'), JSON.stringify(database, null, 2));
    console.log('✅ Mock questions created for testing!');
    console.log(`📊 Created ${mockQuestions.length} sample questions`);
}

// Run the sample generation
generateSampleQuestions();
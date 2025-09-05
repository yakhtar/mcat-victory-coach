import dotenv from 'dotenv';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import MCATQuestionGenerator from '../generators/question-generator.js';
import fs from 'fs';

// Load environment variables
dotenv.config();

async function persistentGeneration() {
    console.log('🚀 PERSISTENT 700-Question Generation Starting...');
    console.log('⚡ This script can be stopped and restarted - it resumes where it left off');
    
    const logFile = 'generation-log.txt';
    const statusFile = 'generation-status.json';
    
    function log(message) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}`;
        console.log(logMessage);
        fs.appendFileSync(logFile, logMessage + '\n');
    }

    function saveStatus(status) {
        fs.writeFileSync(statusFile, JSON.stringify(status, null, 2));
    }

    function loadStatus() {
        if (fs.existsSync(statusFile)) {
            return JSON.parse(fs.readFileSync(statusFile, 'utf-8'));
        }
        return { totalGenerated: 0, lastTopic: null, completed: [] };
    }

    try {
        // Initialize AI clients
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });

        const generator = new MCATQuestionGenerator(openai, anthropic);
        const status = loadStatus();
        
        // 700-question target distribution
        const targets = {
            amino_acids: 175,
            metabolism: 150, 
            enzyme_kinetics: 150,
            protein_structure: 100,
            biochemical_pathways: 75,
            molecular_biology: 50
        };

        log(`📊 RESUMING GENERATION - Previously generated: ${status.totalGenerated} questions`);

        while (true) {
            const currentDb = generator.loadQuestionDatabase();
            const totalQuestions = currentDb.metadata.total_questions;
            
            if (totalQuestions >= 700) {
                log(`🎉 TARGET ACHIEVED! Generated ${totalQuestions} questions`);
                break;
            }

            // Find next topic to work on
            let nextTopic = null;
            let remaining = 0;

            for (const [topic, target] of Object.entries(targets)) {
                const current = currentDb.metadata.categories.biochemistry[topic] || 0;
                if (current < target) {
                    nextTopic = topic;
                    remaining = target - current;
                    break;
                }
            }

            if (!nextTopic) {
                log(`🎉 ALL TOPICS COMPLETE! Total: ${totalQuestions} questions`);
                break;
            }

            log(`🔬 Working on ${nextTopic}: need ${remaining} more questions`);

            // Generate one question
            const difficulties = ['foundation', 'intermediate', 'advanced', 'elite'];
            const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
            const type = Math.random() < 0.75 ? 'passage' : 'discrete';

            try {
                const question = await generator.generateBiochemistryQuestion(nextTopic, difficulty, type);
                if (question) {
                    status.totalGenerated++;
                    status.lastTopic = nextTopic;
                    log(`✅ Generated ${difficulty} ${type} question for ${nextTopic} (Total: ${status.totalGenerated})`);
                    saveStatus(status);
                } else {
                    log(`❌ Failed to generate question for ${nextTopic}`);
                }
            } catch (error) {
                log(`❌ Error generating question: ${error.message}`);
            }

            // Progress update every 10 questions
            if (status.totalGenerated % 10 === 0) {
                log(`📈 PROGRESS: ${totalQuestions}/700 questions (${((totalQuestions/700)*100).toFixed(1)}%)`);
            }

            // Rate limiting delay
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        log('🎊 GENERATION COMPLETE!');
        const finalDb = generator.loadQuestionDatabase();
        log(`📊 Final count: ${finalDb.metadata.total_questions} questions`);
        log(`📚 Distribution: ${JSON.stringify(finalDb.metadata.categories.biochemistry)}`);

    } catch (error) {
        log(`❌ Critical error: ${error.message}`);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n📝 Generation paused. Run this script again to resume where you left off.');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n📝 Generation paused. Run this script again to resume where you left off.');
    process.exit(0);
});

// Run persistent generation
persistentGeneration();
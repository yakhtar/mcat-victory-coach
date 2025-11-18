// Claude Max Organic Chemistry Question Generator - Cost Optimized
// Generates high-quality MCAT organic chemistry questions using only Claude Max

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

class ClaudeOrganicChemistryGenerator {
    constructor() {
        this.anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });
        
        this.organicTopics = [
            // Structure and Properties (High Yield)
            'alkanes_alkenes_alkynes', 'aromatic_compounds', 'functional_groups',
            'isomerism_stereochemistry', 'conformational_analysis', 'chirality_enantiomers',
            
            // Organic Reactions (High Yield)
            'substitution_reactions', 'elimination_reactions', 'addition_reactions',
            'electrophilic_aromatic_substitution', 'nucleophilic_reactions', 'radical_reactions',
            
            // Carbonyl Chemistry (High Yield)
            'aldehydes_ketones', 'carboxylic_acids', 'esters_amides', 
            'enolate_chemistry', 'aldol_condensation', 'oxidation_reduction',
            
            // Nitrogen Chemistry (Medium-High Yield)
            'amines', 'amino_acids', 'proteins', 'nucleophilic_acyl_substitution',
            'gabriel_synthesis', 'reductive_amination',
            
            // Spectroscopy (High Yield)
            'nmr_spectroscopy', 'ir_spectroscopy', 'mass_spectrometry',
            'structure_elucidation', 'chemical_shifts', 'coupling_patterns',
            
            // Laboratory Techniques (Medium Yield)
            'purification_methods', 'extraction_techniques', 'chromatography',
            'crystallization', 'distillation', 'synthesis_planning',
            
            // Biological Applications (High Yield)
            'enzyme_mechanisms', 'drug_design', 'metabolic_pathways',
            'lipids_carbohydrates', 'nucleic_acids', 'biochemical_processes'
        ];
        
        this.difficulties = ['foundation', 'intermediate', 'advanced', 'elite'];
        this.questionTypes = ['discrete', 'passage'];
        this.currentBatch = 1;
        this.questionsGenerated = 0;
        this.targetQuestions = 600;
    }

    async generateOrganicChemistryQuestion(topic, difficulty, type) {
        const isPassage = type === 'passage';
        
        const prompt = `Generate a high-quality MCAT organic chemistry question about ${topic.replace(/_/g, ' ')} at ${difficulty} level.

${isPassage ? `Include a scientific passage (2-3 sentences) followed by the question.` : 'Create a discrete question without a passage.'}

Requirements:
- Follow AAMC question format exactly
- ${difficulty} level difficulty (${this.getDifficultyDescription(difficulty)})
- Include detailed explanation with mechanisms when appropriate
- Focus on real-world applications and medical relevance
- Provide study resources
- Use proper organic chemistry nomenclature

Format as JSON:
{
  "id": "${type === 'passage' ? 'orgo_pass' : 'orgo_disc'}_${difficulty.substring(0, 3)}_${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}",
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "type": "${type}",
  ${isPassage ? '"passage": "scientific passage here",' : ''}
  "question": "question text here",
  "options": {
    "A": "option A",
    "B": "option B", 
    "C": "option C",
    "D": "option D"
  },
  "correct_answer": "correct letter",
  "explanation": "detailed explanation with mechanisms",
  "study_resources": [
    {
      "title": "resource title",
      "url": "educational url",
      "type": "video|interactive|article"
    }
  ],
  "created_at": "${new Date().toISOString()}"
}`;

        try {
            const response = await this.anthropic.messages.create({
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 2000,
                temperature: 0.7,
                messages: [{ role: "user", content: prompt }]
            });

            const content = response.content[0].text;
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('No valid JSON found in response');
            }
        } catch (error) {
            console.error(`❌ Error generating ${topic} question:`, error);
            return null;
        }
    }

    getDifficultyDescription(difficulty) {
        const descriptions = {
            'foundation': 'Basic concepts, straightforward application',
            'intermediate': 'Multi-step problems, concept integration', 
            'advanced': 'Complex mechanisms, synthesis planning',
            'elite': 'Research-level understanding, cutting-edge applications'
        };
        return descriptions[difficulty];
    }

    async saveQuestions(questions, filename) {
        try {
            const filepath = path.join(process.cwd(), filename);
            await fs.promises.writeFile(filepath, JSON.stringify(questions, null, 2));
            console.log(`✅ Saved ${questions.length} questions to ${filename}`);
        } catch (error) {
            console.error(`❌ Error saving to ${filename}:`, error);
        }
    }

    async generateBatch(batchSize = 25) {
        const questions = [];
        const startTime = Date.now();
        
        console.log(`\n🧪 Starting Organic Chemistry Batch ${this.currentBatch}`);
        console.log(`🎯 Target: ${batchSize} questions`);
        
        for (let i = 0; i < batchSize && this.questionsGenerated < this.targetQuestions; i++) {
            // Select random topic, difficulty, and type
            const topic = this.organicTopics[Math.floor(Math.random() * this.organicTopics.length)];
            const difficulty = this.difficulties[Math.floor(Math.random() * this.difficulties.length)];
            const type = this.questionTypes[Math.floor(Math.random() * this.questionTypes.length)];
            
            console.log(`🧪 Generating ${topic} (${difficulty}, ${type})...`);
            
            const question = await this.generateOrganicChemistryQuestion(topic, difficulty, type);
            
            if (question) {
                questions.push(question);
                this.questionsGenerated++;
                console.log(`✅ Generated question ${this.questionsGenerated}/${this.targetQuestions}`);
            } else {
                console.log(`❌ Failed to generate ${topic} question`);
            }
            
            // Progress indicator
            if ((i + 1) % 5 === 0) {
                const progress = ((this.questionsGenerated / this.targetQuestions) * 100).toFixed(1);
                console.log(`📈 Progress: ${this.questionsGenerated}/${this.targetQuestions} (${progress}%)`);
            }
        }
        
        // Save batch
        if (questions.length > 0) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `claude-organic-chemistry-batch-${this.currentBatch}-${timestamp}.json`;
            await this.saveQuestions(questions, filename);
        }
        
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`\n⏱️ Batch ${this.currentBatch} completed in ${duration}s`);
        console.log(`📊 Questions in batch: ${questions.length}`);
        console.log(`📈 Total progress: ${this.questionsGenerated}/${this.targetQuestions} (${((this.questionsGenerated / this.targetQuestions) * 100).toFixed(1)}%)`);
        
        this.currentBatch++;
        return questions;
    }

    async startContinuousGeneration() {
        console.log('🧪 Claude Organic Chemistry Generator - Starting continuous generation...');
        console.log('🧪 Claude Organic Chemistry Generator initialized');
        console.log(`🎯 Target: ${this.targetQuestions} organic chemistry questions`);
        console.log('🚀 Starting continuous organic chemistry question generation...');
        console.log('💰 Using Claude Max only - no additional API costs\n');
        
        while (this.questionsGenerated < this.targetQuestions) {
            const remainingQuestions = this.targetQuestions - this.questionsGenerated;
            const batchSize = Math.min(25, remainingQuestions);
            
            try {
                await this.generateBatch(batchSize);
                
                if (this.questionsGenerated < this.targetQuestions) {
                    console.log('⏳ Waiting 2 seconds before next batch...\n');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                } else {
                    console.log('\n🎉 TARGET ACHIEVED! All organic chemistry questions generated!');
                    console.log(`📊 Final Stats: ${this.questionsGenerated} questions in ${this.currentBatch - 1} batches`);
                    break;
                }
            } catch (error) {
                console.error('❌ Error in batch generation:', error);
                console.log('⏳ Waiting 5 seconds before retry...\n');
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    }
}

// Start generation
const generator = new ClaudeOrganicChemistryGenerator();
generator.startContinuousGeneration().catch(console.error);
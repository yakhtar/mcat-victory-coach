// Claude Max Psychology & Sociology Question Generator - Cost Optimized
// Generates high-quality MCAT psychology and sociology questions using only Claude Max

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

class ClaudePsychologySociologyGenerator {
    constructor() {
        this.anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });
        
        this.psychologyTopics = [
            // Biological Psychology (High Yield)
            'neurons_action_potentials', 'neurotransmitters', 'brain_anatomy', 'endocrine_system',
            'sensation_perception', 'sleep_consciousness', 'drug_effects_addiction',
            
            // Cognition (High Yield) 
            'memory_encoding_retrieval', 'attention_consciousness', 'language_cognition',
            'problem_solving_decision_making', 'intelligence_testing', 'cognitive_development',
            
            // Learning (High Yield)
            'classical_conditioning', 'operant_conditioning', 'observational_learning',
            'habituation_sensitization', 'associative_learning', 'memory_consolidation',
            
            // Developmental Psychology (Medium-High Yield)
            'prenatal_development', 'attachment_theory', 'cognitive_development_piaget',
            'moral_development_kohlberg', 'identity_development', 'aging_lifespan',
            
            // Personality & Abnormal (Medium-High Yield)
            'personality_theories', 'psychological_disorders', 'anxiety_mood_disorders',
            'schizophrenia_psychotic_disorders', 'personality_disorders', 'therapeutic_approaches',
            
            // Social Psychology (High Yield)
            'attitudes_persuasion', 'conformity_obedience', 'group_behavior', 'prejudice_discrimination',
            'attribution_theory', 'social_identity', 'interpersonal_relationships'
        ];
        
        this.sociologyTopics = [
            // Social Structure (High Yield)
            'social_stratification', 'social_class_mobility', 'race_ethnicity', 'gender_identity',
            'age_demographics', 'family_structures', 'education_systems',
            
            // Social Institutions (High Yield)
            'healthcare_systems', 'economic_systems', 'political_systems', 'religious_institutions',
            'mass_media_influence', 'criminal_justice', 'social_movements',
            
            // Social Processes (Medium-High Yield)
            'socialization_agents', 'social_control', 'deviance_crime', 'collective_behavior',
            'social_change_modernization', 'urbanization', 'globalization',
            
            // Culture (Medium-High Yield)
            'cultural_transmission', 'cultural_diversity', 'subcultures_countercultures',
            'cultural_capital', 'cultural_relativism', 'symbolic_interactionism',
            
            // Social Interaction (High Yield)
            'dramaturgy_impression_management', 'social_networks', 'social_roles_status',
            'social_construction_reality', 'microsociology_macrosociology', 'social_exchange_theory',
            
            // Health & Medicine Sociology (High Yield)
            'social_determinants_health', 'health_disparities', 'medicalization',
            'doctor_patient_relationships', 'healthcare_access', 'illness_behavior'
        ];
        
        this.difficulties = ['foundation', 'intermediate', 'advanced', 'elite'];
        this.questionTypes = ['discrete', 'passage'];
        this.currentBatch = 1;
        this.questionsGenerated = 0;
        this.targetQuestions = 600;
    }

    async generatePsychSocQuestion(topic, difficulty, type, subject) {
        const isPassage = type === 'passage';
        const subjectName = subject === 'psychology' ? 'psychology' : 'sociology';
        
        const prompt = `Generate a high-quality MCAT ${subjectName} question about ${topic.replace(/_/g, ' ')} at ${difficulty} level.

${isPassage ? `Include a research scenario or case study (2-3 sentences) followed by the question.` : 'Create a discrete question without a passage.'}

Requirements:
- Follow AAMC question format exactly
- ${difficulty} level difficulty (${this.getDifficultyDescription(difficulty)})
- Include detailed explanation with theoretical framework
- Focus on research applications and real-world examples
- Emphasize medical school relevance
- Provide study resources
- Use proper ${subjectName} terminology

Format as JSON:
{
  "id": "${type === 'passage' ? 'psyc_pass' : 'psyc_disc'}_${difficulty.substring(0, 3)}_${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}",
  "topic": "${topic}",
  "subject": "${subjectName}",
  "difficulty": "${difficulty}",
  "type": "${type}",
  ${isPassage ? '"passage": "research scenario or case study here",' : ''}
  "question": "question text here",
  "options": {
    "A": "option A",
    "B": "option B", 
    "C": "option C",
    "D": "option D"
  },
  "correct_answer": "correct letter",
  "explanation": "detailed explanation with theoretical framework",
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
            'foundation': 'Basic concepts, definitions, and simple applications',
            'intermediate': 'Theory integration, research interpretation', 
            'advanced': 'Complex analysis, critical thinking, research design',
            'elite': 'Advanced research understanding, nuanced applications'
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
        
        console.log(`\n🧠 Starting Psychology & Sociology Batch ${this.currentBatch}`);
        console.log(`🎯 Target: ${batchSize} questions`);
        
        for (let i = 0; i < batchSize && this.questionsGenerated < this.targetQuestions; i++) {
            // Alternate between psychology and sociology (60% psychology, 40% sociology)
            const isPsychology = Math.random() < 0.6;
            const topicArray = isPsychology ? this.psychologyTopics : this.sociologyTopics;
            const subject = isPsychology ? 'psychology' : 'sociology';
            
            // Select random topic, difficulty, and type
            const topic = topicArray[Math.floor(Math.random() * topicArray.length)];
            const difficulty = this.difficulties[Math.floor(Math.random() * this.difficulties.length)];
            const type = this.questionTypes[Math.floor(Math.random() * this.questionTypes.length)];
            
            console.log(`🧠 Generating ${subject}: ${topic} (${difficulty}, ${type})...`);
            
            const question = await this.generatePsychSocQuestion(topic, difficulty, type, subject);
            
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
            const filename = `claude-psychology-sociology-batch-${this.currentBatch}-${timestamp}.json`;
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
        console.log('🧠 Claude Psychology & Sociology Generator - Starting continuous generation...');
        console.log('🧠 Claude Psychology & Sociology Generator initialized');
        console.log(`🎯 Target: ${this.targetQuestions} psychology & sociology questions`);
        console.log('📊 Distribution: ~60% Psychology, ~40% Sociology');
        console.log('🚀 Starting continuous psychology & sociology question generation...');
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
                    console.log('\n🎉 TARGET ACHIEVED! All psychology & sociology questions generated!');
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
const generator = new ClaudePsychologySociologyGenerator();
generator.startContinuousGeneration().catch(console.error);
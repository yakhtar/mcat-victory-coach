// Claude Max Physics Question Generator - Cost Optimized
// Generates high-quality MCAT physics questions using only Claude Max

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

class ClaudePhysicsGenerator {
    constructor() {
        this.anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });
        
        this.physicsTopics = [
            // Mechanics (High Yield)
            'kinematics', 'forces_equilibrium', 'work_energy', 'momentum_collisions',
            'rotational_motion', 'oscillations', 'gravitation',
            
            // Waves and Sound (Medium-High Yield)
            'wave_properties', 'sound_waves', 'doppler_effect', 'wave_interference',
            'standing_waves', 'resonance',
            
            // Electricity and Magnetism (High Yield)
            'electric_fields', 'electric_potential', 'capacitors', 'current_resistance',
            'circuits_dc', 'magnetic_fields', 'electromagnetic_induction', 'ac_circuits',
            
            // Optics (Medium Yield)
            'geometric_optics', 'mirrors_lenses', 'refraction_snells_law', 'interference_diffraction',
            'polarization', 'optical_instruments',
            
            // Thermodynamics (Medium Yield)
            'temperature_heat', 'thermal_expansion', 'heat_transfer', 'ideal_gas_laws',
            'thermodynamic_processes', 'entropy_energy',
            
            // Modern Physics (Low-Medium Yield)
            'atomic_structure', 'quantum_mechanics', 'nuclear_physics', 'radioactive_decay',
            'special_relativity', 'photoelectric_effect'
        ];
        
        this.questionCount = 0;
        this.batchSize = 10;
        this.maxQuestions = 1833; // Target number needed
        
        console.log('🔬 Claude Physics Generator initialized');
        console.log(`🎯 Target: ${this.maxQuestions} physics questions`);
    }

    async generatePhysicsBatch(topic, difficulty = 'intermediate') {
        const prompt = `Generate ${this.batchSize} high-quality MCAT physics questions about ${topic.replace('_', ' ')} at ${difficulty} level.

MCAT PHYSICS REQUIREMENTS:
- Conceptual understanding over pure calculation
- Real-world medical/biological applications when possible
- AAMC-style formatting and difficulty
- Clear, unambiguous question stems
- Detailed explanations that teach concepts

FORMAT for each question:
{
  "id": "phys_${topic}_XXX",
  "subject": "physics", 
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "type": "multiple_choice",
  "question": "[Question stem with any necessary setup]",
  "options": {
    "A": "[Option A]",
    "B": "[Option B]", 
    "C": "[Option C]",
    "D": "[Option D]"
  },
  "correct_answer": "A",
  "explanation": "[Detailed explanation covering the concept, why the answer is correct, why others are wrong, and any relevant medical applications]",
  "tags": ["${topic}", "mcat_physics", "${difficulty}"],
  "estimated_time": 90
}

PHYSICS FOCUS AREAS:
- ${topic.includes('electric') || topic.includes('magnetic') ? 'Bioelectricity, nerve conduction, medical devices' : ''}
- ${topic.includes('wave') || topic.includes('sound') ? 'Medical imaging, ultrasound, hearing physiology' : ''}
- ${topic.includes('optics') || topic.includes('light') ? 'Vision, microscopy, laser medicine' : ''}
- ${topic.includes('mechanics') || topic.includes('force') ? 'Biomechanics, blood flow, muscle physics' : ''}
- ${topic.includes('thermo') || topic.includes('heat') ? 'Metabolism, body temperature, calorimetry' : ''}

Generate EXACTLY ${this.batchSize} questions as a valid JSON array.`;

        try {
            const response = await this.anthropic.messages.create({
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 8000,
                temperature: 0.3, // Lower temperature for consistent quality
                messages: [{
                    role: "user",
                    content: prompt
                }]
            });

            const content = response.content[0].text;
            
            // Extract JSON from Claude's response (sometimes includes explanation text)
            let jsonText = content;
            const jsonStart = content.indexOf('[');
            const jsonEnd = content.lastIndexOf(']');
            
            if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
                jsonText = content.substring(jsonStart, jsonEnd + 1);
            }
            
            const questions = JSON.parse(jsonText);
            
            if (!Array.isArray(questions) || questions.length !== this.batchSize) {
                throw new Error(`Expected ${this.batchSize} questions, got ${questions?.length || 0}`);
            }
            
            // Validate each question structure
            questions.forEach((q, index) => {
                if (!q.id || !q.question || !q.options || !q.correct_answer || !q.explanation) {
                    throw new Error(`Question ${index + 1} missing required fields`);
                }
            });
            
            console.log(`✅ Generated ${questions.length} ${topic} questions (${difficulty})`);
            return questions;
            
        } catch (error) {
            console.error(`❌ Failed to generate ${topic} questions:`, error.message);
            return [];
        }
    }

    async saveQuestions(questions, filename) {
        try {
            const filepath = path.join(process.cwd(), filename);
            const jsonData = JSON.stringify(questions, null, 2);
            fs.writeFileSync(filepath, jsonData);
            console.log(`💾 Saved ${questions.length} questions to ${filename}`);
        } catch (error) {
            console.error('❌ Error saving questions:', error);
        }
    }

    async addToDatabase(newQuestions) {
        try {
            const dbPath = path.join(process.cwd(), 'data', 'question-database.json');
            const database = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
            
            // Add new questions
            database.questions.push(...newQuestions);
            
            // Update metadata
            database.metadata.total_questions = database.questions.length;
            database.metadata.last_updated = new Date().toISOString();
            
            // Update physics count
            const physicsCount = database.questions.filter(q => q.subject === 'physics').length;
            if (!database.metadata.subjects) database.metadata.subjects = {};
            database.metadata.subjects.physics = physicsCount;
            
            fs.writeFileSync(dbPath, JSON.stringify(database, null, 2));
            console.log(`📊 Database updated: ${database.questions.length} total questions (${physicsCount} physics)`);
            
        } catch (error) {
            console.error('❌ Error updating database:', error);
        }
    }

    async runContinuousGeneration() {
        console.log('🚀 Starting continuous physics question generation...');
        console.log('💰 Using Claude Max only - no additional API costs');
        
        let currentTopic = 0;
        const difficulties = ['foundation', 'intermediate', 'advanced'];
        let currentDifficulty = 0;
        
        while (this.questionCount < this.maxQuestions) {
            const topic = this.physicsTopics[currentTopic];
            const difficulty = difficulties[currentDifficulty];
            
            console.log(`\n🔬 Generating ${topic} questions (${difficulty})...`);
            console.log(`📈 Progress: ${this.questionCount}/${this.maxQuestions} (${Math.round(this.questionCount/this.maxQuestions*100)}%)`);
            
            const questions = await this.generatePhysicsBatch(topic, difficulty);
            
            if (questions.length > 0) {
                // Save batch file
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const filename = `claude-physics-${topic}-${difficulty}-${timestamp}.json`;
                await this.saveQuestions(questions, filename);
                
                // Add to main database
                await this.addToDatabase(questions);
                
                this.questionCount += questions.length;
                console.log(`✅ Generated ${questions.length} questions. Total: ${this.questionCount}/${this.maxQuestions}`);
            }
            
            // Rotate through difficulties and topics
            currentDifficulty = (currentDifficulty + 1) % difficulties.length;
            if (currentDifficulty === 0) {
                currentTopic = (currentTopic + 1) % this.physicsTopics.length;
            }
            
            // Rate limiting to be respectful of Claude Max
            if (this.questionCount < this.maxQuestions) {
                console.log('⏳ Waiting 30 seconds before next batch...');
                await new Promise(resolve => setTimeout(resolve, 30000));
            }
        }
        
        console.log(`\n🎉 Physics question generation complete!`);
        console.log(`📊 Generated ${this.questionCount} physics questions using Claude Max only`);
    }
}

// Start generation if run directly
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
if (__filename === process.argv[1]) {
    console.log('🔬 Claude Physics Generator - Starting continuous generation...');
    const generator = new ClaudePhysicsGenerator();
    generator.runContinuousGeneration().catch(console.error);
}

export default ClaudePhysicsGenerator;
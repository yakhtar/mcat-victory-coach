// Claude Max Chemistry Question Generator - Cost Optimized
// Generates high-quality MCAT chemistry questions using only Claude Max

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

class ClaudeChemistryGenerator {
    constructor() {
        this.anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });
        
        this.chemistryTopics = [
            // General Chemistry (High Yield)
            'atomic_structure', 'periodic_trends', 'chemical_bonding', 'molecular_geometry',
            'intermolecular_forces', 'stoichiometry', 'limiting_reagents', 'empirical_formulas',
            
            // Thermodynamics & Kinetics (High Yield)
            'thermochemistry', 'enthalpy_entropy', 'free_energy', 'equilibrium_constants',
            'chemical_kinetics', 'reaction_mechanisms', 'catalysis', 'activation_energy',
            
            // Acids and Bases (High Yield)
            'acid_base_theories', 'pH_calculations', 'buffer_systems', 'titrations',
            'weak_acids_bases', 'polyprotic_acids', 'acid_base_indicators',
            
            // Electrochemistry (Medium-High Yield)
            'redox_reactions', 'galvanic_cells', 'electrolysis', 'electrode_potentials',
            'battery_chemistry', 'corrosion', 'electroplating',
            
            // Solutions (Medium Yield)
            'colligative_properties', 'solubility_rules', 'concentration_units',
            'solubility_equilibria', 'complex_ions', 'precipitation_reactions',
            
            // Phase Changes (Medium Yield)
            'phase_diagrams', 'vapor_pressure', 'boiling_freezing_points',
            'heat_of_vaporization', 'sublimation', 'critical_point',
            
            // Organic Chemistry Integration (Medium Yield)
            'functional_groups', 'organic_reactions', 'isomerism', 'stereochemistry',
            'organic_acids_bases', 'biological_molecules',
            
            // Nuclear Chemistry (Low-Medium Yield)
            'nuclear_decay', 'half_life', 'nuclear_reactions', 'radioactive_dating',
            'nuclear_stability', 'mass_energy_equivalence'
        ];
        
        this.questionCount = 0;
        this.batchSize = 8;
        this.maxQuestions = 1739; // Target number needed
        
        console.log('⚗️ Claude Chemistry Generator initialized');
        console.log(`🎯 Target: ${this.maxQuestions} chemistry questions`);
    }

    async generateChemistryBatch(topic, difficulty = 'intermediate') {
        const prompt = `Generate ${this.batchSize} high-quality MCAT chemistry questions about ${topic.replace('_', ' ')} at ${difficulty} level.

MCAT CHEMISTRY REQUIREMENTS:
- Conceptual understanding with quantitative applications
- Medical/biological relevance when applicable
- AAMC-style formatting and complexity
- Clear problem-solving pathways
- Integration across chemistry topics

FORMAT for each question:
{
  "id": "chem_${topic}_XXX",
  "subject": "chemistry", 
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "type": "multiple_choice",
  "question": "[Question stem with necessary data/setup]",
  "options": {
    "A": "[Option A]",
    "B": "[Option B]", 
    "C": "[Option C]",
    "D": "[Option D]"
  },
  "correct_answer": "A",
  "explanation": "[Step-by-step solution with concept review, calculation details if needed, and medical relevance]",
  "tags": ["${topic}", "mcat_chemistry", "${difficulty}"],
  "estimated_time": 90
}

CHEMISTRY FOCUS AREAS:
- ${topic.includes('acid') || topic.includes('base') ? 'Blood pH, buffer systems, drug ionization' : ''}
- ${topic.includes('thermo') || topic.includes('kinetics') ? 'Enzyme activity, metabolic reactions' : ''}
- ${topic.includes('electro') ? 'Nerve conduction, redox in biology' : ''}
- ${topic.includes('organic') ? 'Drug structures, biomolecule chemistry' : ''}
- ${topic.includes('solution') ? 'IV fluids, drug concentrations, osmotic pressure' : ''}

CALCULATION EXPECTATIONS:
- Include necessary constants and formulas when needed
- Show clear mathematical pathways
- Round appropriately for MCAT-style answers
- Focus on conceptual setup over complex math

Generate EXACTLY ${this.batchSize} questions as a valid JSON array.`;

        try {
            const response = await this.anthropic.messages.create({
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 8000,
                temperature: 0.3,
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
            
            // Validate question structure
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
            
            // Update chemistry count
            const chemCount = database.questions.filter(q => q.subject === 'chemistry').length;
            if (!database.metadata.subjects) database.metadata.subjects = {};
            database.metadata.subjects.chemistry = chemCount;
            
            fs.writeFileSync(dbPath, JSON.stringify(database, null, 2));
            console.log(`📊 Database updated: ${database.questions.length} total questions (${chemCount} chemistry)`);
            
        } catch (error) {
            console.error('❌ Error updating database:', error);
        }
    }

    async runContinuousGeneration() {
        console.log('🚀 Starting continuous chemistry question generation...');
        console.log('💰 Using Claude Max only - no additional API costs');
        
        let currentTopic = 0;
        const difficulties = ['foundation', 'intermediate', 'advanced'];
        let currentDifficulty = 0;
        
        while (this.questionCount < this.maxQuestions) {
            const topic = this.chemistryTopics[currentTopic];
            const difficulty = difficulties[currentDifficulty];
            
            console.log(`\n⚗️ Generating ${topic} questions (${difficulty})...`);
            console.log(`📈 Progress: ${this.questionCount}/${this.maxQuestions} (${Math.round(this.questionCount/this.maxQuestions*100)}%)`);
            
            const questions = await this.generateChemistryBatch(topic, difficulty);
            
            if (questions.length > 0) {
                // Save batch file
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const filename = `claude-chemistry-${topic}-${difficulty}-${timestamp}.json`;
                await this.saveQuestions(questions, filename);
                
                // Add to main database
                await this.addToDatabase(questions);
                
                this.questionCount += questions.length;
                console.log(`✅ Generated ${questions.length} questions. Total: ${this.questionCount}/${this.maxQuestions}`);
            }
            
            // Rotate through difficulties and topics
            currentDifficulty = (currentDifficulty + 1) % difficulties.length;
            if (currentDifficulty === 0) {
                currentTopic = (currentTopic + 1) % this.chemistryTopics.length;
            }
            
            // Rate limiting for Claude Max
            if (this.questionCount < this.maxQuestions) {
                console.log('⏳ Waiting 35 seconds before next batch...');
                await new Promise(resolve => setTimeout(resolve, 35000));
            }
        }
        
        console.log(`\n🎉 Chemistry question generation complete!`);
        console.log(`📊 Generated ${this.questionCount} chemistry questions using Claude Max only`);
    }
}

// Start generation if run directly
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
if (__filename === process.argv[1]) {
    console.log('⚗️ Claude Chemistry Generator - Starting continuous generation...');
    const generator = new ClaudeChemistryGenerator();
    generator.runContinuousGeneration().catch(console.error);
}

export default ClaudeChemistryGenerator;
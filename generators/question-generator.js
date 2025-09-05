import fs from 'fs';
import path from 'path';

class MCATQuestionGenerator {
    constructor(openaiClient, claudeClient) {
        this.openaiClient = openaiClient;
        this.claudeClient = claudeClient;
        this.questionDatabase = this.loadQuestionDatabase();
    }

    loadQuestionDatabase() {
        const dbPath = path.join(process.cwd(), 'data', 'question-database.json');
        if (fs.existsSync(dbPath)) {
            return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
        }
        return { metadata: { total_questions: 0 }, questions: [] };
    }

    saveQuestionDatabase() {
        const dbPath = path.join(process.cwd(), 'data', 'question-database.json');
        fs.writeFileSync(dbPath, JSON.stringify(this.questionDatabase, null, 2));
    }

    async generateBiochemistryQuestion(topic, difficulty, type = 'passage') {
        const prompt = this.createBiochemistryPrompt(topic, difficulty, type);
        
        try {
            const response = await this.claudeClient.messages.create({
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 2000,
                messages: [{
                    role: "user",
                    content: prompt
                }]
            });

            const questionData = this.parseQuestionResponse(response.content[0].text, topic, difficulty, type);
            this.addQuestionToDatabase(questionData, 'biochemistry');
            return questionData;
        } catch (error) {
            console.error('Error generating question:', error);
            return null;
        }
    }

    async generateBiologyQuestion(topic, difficulty, type = 'passage') {
        const prompt = this.createBiologyPrompt(topic, difficulty, type);
        
        try {
            const response = await this.claudeClient.messages.create({
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 2000,
                messages: [{
                    role: "user",
                    content: prompt
                }]
            });

            const questionData = this.parseQuestionResponse(response.content[0].text, topic, difficulty, type);
            this.addQuestionToDatabase(questionData, 'biology');
            return questionData;
        } catch (error) {
            console.error('Error generating question:', error);
            return null;
        }
    }

    createBiochemistryPrompt(topic, difficulty, type) {
        const resourceLinks = this.getStudyResourceLinks(topic);
        
        const basePrompt = `Generate a high-quality MCAT ${type === 'passage' ? 'passage-based' : 'discrete'} question for ${topic} at ${difficulty} level.

Requirements:
- Target MCAT 515+ score range
- ${type === 'passage' ? 'Include a scientific passage (150-200 words) followed by the question' : 'Create a standalone question'}
- Provide 4 multiple choice answers (A, B, C, D)
- Include detailed explanation with reasoning
- Focus on conceptual understanding, not memorization
- Use AAMC-style formatting

Topic: ${topic}
Difficulty: ${difficulty}
Type: ${type}

Format your response as JSON:
{
    "passage": "${type === 'passage' ? 'scientific passage here' : 'null'}",
    "question": "question text here",
    "options": {
        "A": "option A",
        "B": "option B", 
        "C": "option C",
        "D": "option D"
    },
    "correct_answer": "A",
    "explanation": "detailed explanation here",
    "study_resources": ${JSON.stringify(resourceLinks)}
}`;

        return basePrompt;
    }

    createBiologyPrompt(topic, difficulty, type) {
        const resourceLinks = this.getBiologyResourceLinks(topic);
        
        const basePrompt = `Generate a high-quality MCAT ${type === 'passage' ? 'passage-based' : 'discrete'} biology question for ${topic} at ${difficulty} level.

Requirements:
- Target MCAT 515+ score range with focus on advanced biological concepts
- ${type === 'passage' ? 'Include a scientific passage (150-200 words) followed by the question' : 'Create a standalone question'}
- Provide 4 multiple choice answers (A, B, C, D)
- Include detailed explanation with reasoning for correct and incorrect answers
- Focus on conceptual understanding, experimental design, and data analysis
- Use AAMC-style formatting and complexity
- Integrate multiple biological concepts when appropriate

Topic: ${topic}
Difficulty: ${difficulty}
Type: ${type}

For ${topic} questions, emphasize:
${this.getBiologyTopicFocus(topic)}

Format your response as JSON:
{
    "passage": "${type === 'passage' ? 'scientific passage here' : 'null'}",
    "question": "question text here",
    "options": {
        "A": "option A",
        "B": "option B", 
        "C": "option C",
        "D": "option D"
    },
    "correct_answer": "A",
    "explanation": "detailed explanation here covering why the correct answer is right and why others are wrong",
    "study_resources": ${JSON.stringify(resourceLinks)}
}`;

        return basePrompt;
    }

    getBiologyTopicFocus(topic) {
        const focusMap = {
            "cell_biology": "- Membrane structure and function, organelle biology, cell cycle, signal transduction\n- Experimental techniques like microscopy, cell fractionation, protein localization",
            "molecular_biology": "- DNA replication, transcription, translation, gene regulation\n- Molecular techniques like PCR, cloning, sequencing, Western blots",
            "biochemistry_integration": "- Metabolic pathways, enzyme regulation, protein-protein interactions\n- Integration of biochemical processes with cellular functions",
            "organ_systems": "- Physiological processes, homeostasis, system integration\n- Human anatomy and physiology with emphasis on MCAT-relevant systems",
            "genetics": "- Inheritance patterns, population genetics, molecular genetics\n- Genetic analysis, linkage, and experimental design",
            "evolution": "- Natural selection, speciation, phylogenetics, comparative biology\n- Evidence for evolution and evolutionary mechanisms"
        };
        return focusMap[topic] || "- General biological principles and experimental analysis";
    }

    getStudyResourceLinks(topic) {
        const resourceMap = {
            "amino_acids": [
                {
                    "title": "Khan Academy: Amino Acids",
                    "url": "https://www.khanacademy.org/science/organic-chemistry/amino-acids-and-proteins",
                    "type": "video"
                },
                {
                    "title": "PDB-101: Amino Acid Explorer",
                    "url": "https://pdb101.rcsb.org/learn/guide-to-understanding-pdb-data/dealing-with-coordinates",
                    "type": "interactive"
                }
            ],
            "enzyme_kinetics": [
                {
                    "title": "Khan Academy: Enzyme Kinetics",
                    "url": "https://www.khanacademy.org/science/biology/energy-and-enzymes/enzyme-introduction/a/introduction-to-enzymes-and-catalysis",
                    "type": "video"
                },
                {
                    "title": "PDB-101: Enzyme Structure",
                    "url": "https://pdb101.rcsb.org/browse/enzymes",
                    "type": "interactive"
                }
            ],
            "metabolism": [
                {
                    "title": "Khan Academy: Cellular Respiration",
                    "url": "https://www.khanacademy.org/science/biology/cellular-respiration-and-fermentation",
                    "type": "video"
                }
            ],
            "protein_structure": [
                {
                    "title": "Khan Academy: Protein Structure",
                    "url": "https://www.khanacademy.org/science/biology/macromolecules/proteins-and-amino-acids",
                    "type": "video"
                },
                {
                    "title": "PDB-101: Protein Structure Tutorial",
                    "url": "https://pdb101.rcsb.org/learn/guide-to-understanding-pdb-data/introduction",
                    "type": "interactive"
                }
            ]
        };

        return resourceMap[topic] || [
            {
                "title": "Khan Academy MCAT",
                "url": "https://www.khanacademy.org/test-prep/mcat",
                "type": "video"
            }
        ];
    }

    getBiologyResourceLinks(topic) {
        const resourceMap = {
            "cell_biology": [
                {
                    "title": "Khan Academy: Cell Biology",
                    "url": "https://www.khanacademy.org/science/biology/structure-of-a-cell",
                    "type": "video"
                },
                {
                    "title": "BioInteractive: Cell Biology",
                    "url": "https://www.biointeractive.org/classroom-resources/cell-biology",
                    "type": "interactive"
                }
            ],
            "molecular_biology": [
                {
                    "title": "Khan Academy: Molecular Biology",
                    "url": "https://www.khanacademy.org/science/biology/gene-expression-and-regulation",
                    "type": "video"
                },
                {
                    "title": "HHMI BioInteractive: Central Dogma",
                    "url": "https://www.biointeractive.org/classroom-resources/central-dogma-and-genetic-medicine",
                    "type": "interactive"
                }
            ],
            "biochemistry_integration": [
                {
                    "title": "Khan Academy: Biochemistry",
                    "url": "https://www.khanacademy.org/science/biology/cellular-respiration-and-fermentation",
                    "type": "video"
                },
                {
                    "title": "HHMI: Metabolic Pathways",
                    "url": "https://www.biointeractive.org/classroom-resources/metabolic-pathways",
                    "type": "interactive"
                }
            ],
            "organ_systems": [
                {
                    "title": "Khan Academy: Human Biology",
                    "url": "https://www.khanacademy.org/science/biology/human-biology",
                    "type": "video"
                },
                {
                    "title": "HHMI: Physiology",
                    "url": "https://www.biointeractive.org/classroom-resources/human-physiology",
                    "type": "interactive"
                }
            ],
            "genetics": [
                {
                    "title": "Khan Academy: Genetics",
                    "url": "https://www.khanacademy.org/science/biology/classical-genetics",
                    "type": "video"
                },
                {
                    "title": "HHMI: Genetics Resources",
                    "url": "https://www.biointeractive.org/classroom-resources/genetics",
                    "type": "interactive"
                }
            ],
            "evolution": [
                {
                    "title": "Khan Academy: Evolution",
                    "url": "https://www.khanacademy.org/science/biology/her/evolution-and-natural-selection",
                    "type": "video"
                },
                {
                    "title": "HHMI: Evolution Collection",
                    "url": "https://www.biointeractive.org/classroom-resources/evolution",
                    "type": "interactive"
                }
            ]
        };

        return resourceMap[topic] || [
            {
                "title": "Khan Academy MCAT Biology",
                "url": "https://www.khanacademy.org/test-prep/mcat/biological-sciences-practice",
                "type": "video"
            }
        ];
    }

    parseQuestionResponse(response, topic, difficulty, type) {
        try {
            // Extract JSON from response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('No JSON found in response');
            
            // Clean the JSON string - remove control characters and fix common issues
            let jsonStr = jsonMatch[0]
                .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
                .replace(/\n\s*\n/g, '\n') // Remove extra newlines
                .replace(/\\\\/g, '\\') // Fix double escapes
                .replace(/\\"/g, '"') // Fix escaped quotes within strings
                .trim();
            
            const questionData = JSON.parse(jsonStr);
            
            // Add metadata
            questionData.id = this.generateQuestionId();
            questionData.topic = topic;
            questionData.difficulty = difficulty;
            questionData.type = type;
            questionData.created_at = new Date().toISOString();
            
            return questionData;
        } catch (error) {
            console.error('Error parsing question response:', error);
            console.log('Raw response:', response);
            return null;
        }
    }

    generateQuestionId() {
        return `mcat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    addQuestionToDatabase(questionData, subject = 'biochemistry') {
        if (!questionData) return;
        
        this.questionDatabase.questions.push(questionData);
        this.questionDatabase.metadata.total_questions++;
        
        // Initialize subject category if it doesn't exist
        if (!this.questionDatabase.metadata.categories[subject]) {
            this.questionDatabase.metadata.categories[subject] = {};
        }
        
        // Update category counts
        const category = questionData.topic;
        if (!this.questionDatabase.metadata.categories[subject][category]) {
            this.questionDatabase.metadata.categories[subject][category] = 0;
        }
        this.questionDatabase.metadata.categories[subject][category]++;
        
        // Update difficulty counts
        const difficulty = questionData.difficulty;
        if (!this.questionDatabase.metadata.difficulty_levels[difficulty]) {
            this.questionDatabase.metadata.difficulty_levels[difficulty] = 0;
        }
        this.questionDatabase.metadata.difficulty_levels[difficulty]++;
        
        this.questionDatabase.metadata.last_updated = new Date().toISOString();
        this.saveQuestionDatabase();
    }

    async generateQuestionBatch(topics, count = 10) {
        const difficulties = ['foundation', 'intermediate', 'advanced', 'elite'];
        const types = ['passage', 'discrete'];
        const questions = [];

        console.log(`🔄 Generating ${count} high-yield biochemistry questions...`);

        for (let i = 0; i < count; i++) {
            const topic = topics[i % topics.length];
            const difficulty = difficulties[Math.floor(i / topics.length) % difficulties.length];
            const type = Math.random() < 0.7 ? 'passage' : 'discrete'; // 70% passage-based

            console.log(`Generating question ${i + 1}/${count}: ${topic} (${difficulty}, ${type})`);

            const question = await this.generateBiochemistryQuestion(topic, difficulty, type);
            if (question) {
                questions.push(question);
                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        console.log(`✅ Generated ${questions.length} questions successfully!`);
        return questions;
    }

    async generateBiologyQuestionBatch(topics, count = 10) {
        const difficulties = ['foundation', 'intermediate', 'advanced', 'elite'];
        // Biology has different type distribution: 60% passage, 40% discrete (based on research)
        const questions = [];

        console.log(`🧬 Generating ${count} high-yield biology questions...`);

        for (let i = 0; i < count; i++) {
            const topic = topics[i % topics.length];
            const difficulty = difficulties[Math.floor(i / topics.length) % difficulties.length];
            const type = Math.random() < 0.6 ? 'passage' : 'discrete'; // 60% passage-based for biology

            console.log(`Generating biology question ${i + 1}/${count}: ${topic} (${difficulty}, ${type})`);

            const question = await this.generateBiologyQuestion(topic, difficulty, type);
            if (question) {
                questions.push(question);
                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        console.log(`✅ Generated ${questions.length} biology questions successfully!`);
        return questions;
    }

    getQuestionsByFilters(filters = {}) {
        let questions = this.questionDatabase.questions;

        if (filters.topic) {
            questions = questions.filter(q => q.topic === filters.topic);
        }

        if (filters.difficulty) {
            questions = questions.filter(q => q.difficulty === filters.difficulty);
        }

        if (filters.type) {
            questions = questions.filter(q => q.type === filters.type);
        }

        return questions;
    }

    getRandomQuestion(filters = {}) {
        const questions = this.getQuestionsByFilters(filters);
        if (questions.length === 0) return null;
        
        const randomIndex = Math.floor(Math.random() * questions.length);
        return questions[randomIndex];
    }
}

export default MCATQuestionGenerator;
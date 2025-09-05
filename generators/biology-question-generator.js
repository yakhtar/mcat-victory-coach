import fs from 'fs';
import path from 'path';

class BiologyQuestionGenerator {
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
        return { metadata: { total_questions: 0, categories: {} }, questions: [] };
    }

    saveQuestionDatabase() {
        const dbPath = path.join(process.cwd(), 'data', 'question-database.json');
        fs.writeFileSync(dbPath, JSON.stringify(this.questionDatabase, null, 2));
    }

    async generateBiologyQuestion(topic, difficulty, type = 'passage') {
        const prompt = this.createBiologyPrompt(topic, difficulty, type);
        
        try {
            const response = await this.claudeClient.messages.create({
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 3000,
                messages: [{
                    role: "user",
                    content: prompt
                }]
            });

            const questionData = this.parseQuestionResponse(response.content[0].text, topic, difficulty, type);
            this.addQuestionToDatabase(questionData);
            return questionData;
        } catch (error) {
            console.error('Error generating biology question:', error);
            return null;
        }
    }

    createBiologyPrompt(topic, difficulty, type) {
        const resourceLinks = this.getStudyResourceLinks(topic);
        
        const basePrompt = `Generate a high-quality MCAT ${type === 'passage' ? 'passage-based' : 'discrete'} biology question for ${topic} at ${difficulty} level.

CRITICAL REQUIREMENTS FOR 515+ MCAT SCORES:
- Target advanced test-takers who need challenging, differentiated content
- Focus on application, analysis, and synthesis over memorization
- Integrate multiple biological concepts when possible
- Use realistic experimental scenarios and data interpretation
- ${type === 'passage' ? 'Include a scientific passage (200-300 words) with experimental context' : 'Create a complex standalone scenario'}

QUESTION SPECIFICATIONS:
- Topic: ${topic}
- Difficulty: ${difficulty}
- Type: ${type}
- Must test conceptual understanding and critical thinking
- Avoid simple factual recall questions
- Include quantitative analysis where appropriate
- Connect to real-world biological phenomena

${this.getDifficultyGuidelines(difficulty)}

${this.getTopicGuidelines(topic)}

Format your response as valid JSON only (no additional text):
{
    "passage": "${type === 'passage' ? 'detailed scientific passage with experimental context here' : null}",
    "question": "challenging question text requiring analysis and application",
    "options": {
        "A": "option A with specific biological detail",
        "B": "option B with specific biological detail", 
        "C": "option C with specific biological detail",
        "D": "option D with specific biological detail"
    },
    "correct_answer": "A",
    "explanation": "comprehensive explanation covering why the correct answer is right and why other options are wrong, with biological reasoning and connections to broader concepts",
    "study_resources": ${JSON.stringify(resourceLinks)}
}`;

        return basePrompt;
    }

    getDifficultyGuidelines(difficulty) {
        const guidelines = {
            "foundation": "Focus on fundamental biological principles. Test basic understanding of core concepts. Questions should be accessible but not trivial.",
            "intermediate": "Integrate 2-3 biological concepts. Require application of principles to new scenarios. Include some data interpretation.",
            "advanced": "Synthesize multiple biological systems and processes. Require analysis of complex experimental data. Test ability to predict outcomes.",
            "elite": "Demand highest-level critical thinking. Integrate biochemistry, genetics, and physiology. Analyze novel experimental designs and unexpected results."
        };
        return `DIFFICULTY GUIDELINES for ${difficulty}: ${guidelines[difficulty]}`;
    }

    getTopicGuidelines(topic) {
        const guidelines = {
            "cell_biology": "Cover cell structure, organelle function, membrane transport, cell cycle, apoptosis, cellular communication, and cytoskeleton. Integrate with molecular mechanisms.",
            "molecular_biology": "Focus on DNA replication, transcription, translation, gene regulation, RNA processing, protein folding, and molecular techniques. Emphasize experimental methods.",
            "biochemistry_integration": "Connect metabolic pathways with cellular processes. Cover enzyme regulation, signaling cascades, protein interactions, and bioenergetics.",
            "organ_systems": "Integrate anatomy with physiology. Cover cardiovascular, respiratory, digestive, nervous, endocrine, immune, and reproductive systems. Emphasize homeostasis.",
            "genetics": "Cover inheritance patterns, population genetics, genetic variation, mutation effects, gene mapping, and genetic technologies. Include evolutionary genetics.",
            "evolution": "Cover natural selection, speciation, phylogeny, evolutionary evidence, population dynamics, and evolutionary developmental biology."
        };
        return `TOPIC GUIDELINES for ${topic}: ${guidelines[topic]}`;
    }

    getStudyResourceLinks(topic) {
        const resourceMap = {
            "cell_biology": [
                {
                    "title": "Khan Academy: Cell Biology",
                    "url": "https://www.khanacademy.org/science/biology/structure-of-a-cell",
                    "type": "video"
                },
                {
                    "title": "BioInteractive: Cell Biology Resources",
                    "url": "https://www.biointeractive.org/classroom-resources?f%5B0%5D=topics%3A435",
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
                    "title": "Khan Academy: Metabolism Integration",
                    "url": "https://www.khanacademy.org/science/biology/cellular-respiration-and-fermentation",
                    "type": "video"
                },
                {
                    "title": "PDB-101: Metabolic Pathways",
                    "url": "https://pdb101.rcsb.org/learn/flyers-posters-and-videos/video/atp-synthase-in-action",
                    "type": "interactive"
                }
            ],
            "organ_systems": [
                {
                    "title": "Khan Academy: Human Biology",
                    "url": "https://www.khanacademy.org/science/high-school-biology/hs-human-body-systems",
                    "type": "video"
                },
                {
                    "title": "BioInteractive: Human Biology",
                    "url": "https://www.biointeractive.org/classroom-resources?f%5B0%5D=topics%3A433",
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
                    "title": "BioInteractive: Genetics Resources",
                    "url": "https://www.biointeractive.org/classroom-resources?f%5B0%5D=topics%3A436",
                    "type": "interactive"
                }
            ],
            "evolution": [
                {
                    "title": "Khan Academy: Evolution",
                    "url": "https://www.khanacademy.org/science/biology/evolution-and-natural-selection",
                    "type": "video"
                },
                {
                    "title": "BioInteractive: Evolution Resources",
                    "url": "https://www.biointeractive.org/classroom-resources?f%5B0%5D=topics%3A432",
                    "type": "interactive"
                }
            ]
        };
        return resourceMap[topic] || [];
    }

    parseQuestionResponse(responseText, topic, difficulty, type) {
        try {
            // Clean up response text to extract JSON
            let jsonText = responseText.trim();
            
            // Remove any markdown formatting
            if (jsonText.startsWith('```json')) {
                jsonText = jsonText.replace(/```json\s*/, '').replace(/\s*```$/, '');
            } else if (jsonText.startsWith('```')) {
                jsonText = jsonText.replace(/```\s*/, '').replace(/\s*```$/, '');
            }
            
            const parsed = JSON.parse(jsonText);
            
            // Generate unique ID
            const questionId = this.generateQuestionId(topic);
            
            return {
                id: questionId,
                topic: topic,
                difficulty: difficulty,
                type: type,
                passage: parsed.passage,
                question: parsed.question,
                choices: [
                    parsed.options.A,
                    parsed.options.B,
                    parsed.options.C,
                    parsed.options.D
                ],
                correct_answer: this.convertAnswerToIndex(parsed.correct_answer),
                explanation: parsed.explanation,
                study_resources: parsed.study_resources || [],
                created_at: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error parsing question response:', error);
            console.log('Raw response:', responseText);
            return null;
        }
    }

    generateQuestionId(topic) {
        const existing = this.questionDatabase.questions.filter(q => q.topic === topic);
        return `bio_${topic}_${String(existing.length + 1).padStart(3, '0')}`;
    }

    convertAnswerToIndex(answer) {
        const mapping = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
        return mapping[answer] || 0;
    }

    addQuestionToDatabase(questionData) {
        if (!questionData) return;

        this.questionDatabase.questions.push(questionData);
        
        // Update metadata
        this.questionDatabase.metadata.total_questions = this.questionDatabase.questions.length;
        this.questionDatabase.metadata.last_updated = new Date().toISOString();
        
        // Update category counts
        if (!this.questionDatabase.metadata.categories.biology) {
            this.questionDatabase.metadata.categories.biology = {};
        }
        
        const topic = questionData.topic;
        if (!this.questionDatabase.metadata.categories.biology[topic]) {
            this.questionDatabase.metadata.categories.biology[topic] = 0;
        }
        this.questionDatabase.metadata.categories.biology[topic]++;
        
        // Update difficulty counts
        if (!this.questionDatabase.metadata.difficulty_levels) {
            this.questionDatabase.metadata.difficulty_levels = {};
        }
        
        const difficulty = questionData.difficulty;
        if (!this.questionDatabase.metadata.difficulty_levels[difficulty]) {
            this.questionDatabase.metadata.difficulty_levels[difficulty] = 0;
        }
        this.questionDatabase.metadata.difficulty_levels[difficulty]++;

        this.saveQuestionDatabase();
    }

    async generateBiologyQuestions(config) {
        console.log('Starting Biology question generation...');
        
        const results = {
            generated: 0,
            failed: 0,
            topics: {}
        };

        for (const [topic, count] of Object.entries(config.topics)) {
            console.log(`\nGenerating ${count} questions for ${topic}...`);
            results.topics[topic] = { generated: 0, failed: 0 };
            
            const difficulties = this.calculateDifficultyDistribution(count, config.difficulty_distribution);
            const types = this.calculateTypeDistribution(count, config.type_distribution);
            
            let typeIndex = 0;
            
            for (const [difficulty, diffCount] of Object.entries(difficulties)) {
                for (let i = 0; i < diffCount; i++) {
                    const questionType = types[typeIndex % types.length];
                    typeIndex++;
                    
                    try {
                        console.log(`Generating ${difficulty} ${questionType} question for ${topic}... (${results.topics[topic].generated + 1}/${count})`);
                        
                        const question = await this.generateBiologyQuestion(topic, difficulty, questionType);
                        
                        if (question) {
                            results.generated++;
                            results.topics[topic].generated++;
                            console.log(`✓ Generated question: ${question.id}`);
                        } else {
                            results.failed++;
                            results.topics[topic].failed++;
                            console.log(`✗ Failed to generate question`);
                        }
                        
                        // Add delay to avoid rate limiting
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        
                    } catch (error) {
                        console.error(`Error generating question:`, error);
                        results.failed++;
                        results.topics[topic].failed++;
                    }
                }
            }
        }
        
        return results;
    }

    calculateDifficultyDistribution(totalCount, distribution) {
        return {
            foundation: Math.ceil(totalCount * distribution.foundation),
            intermediate: Math.ceil(totalCount * distribution.intermediate), 
            advanced: Math.ceil(totalCount * distribution.advanced),
            elite: Math.floor(totalCount * distribution.elite)
        };
    }

    calculateTypeDistribution(totalCount, distribution) {
        const passageCount = Math.ceil(totalCount * distribution.passage);
        const discreteCount = totalCount - passageCount;
        
        const types = [];
        for (let i = 0; i < passageCount; i++) types.push('passage');
        for (let i = 0; i < discreteCount; i++) types.push('discrete');
        
        // Shuffle for random distribution
        return types.sort(() => Math.random() - 0.5);
    }
}

export { BiologyQuestionGenerator };
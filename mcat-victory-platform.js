#!/usr/bin/env node

/**
 * MCAT Victory Coach - Interactive Study Platform
 * MCP-Powered Dynamic MCAT Preparation System
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import MCATQuestionGenerator from './generators/question-generator.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'public')));

class MCATVictoryPlatform {
    constructor() {
        this.isConnected = false;
        
        // Initialize AI clients
        this.initializeAIClients();
        
        // Initialize enhanced question generator
        this.questionGenerator = null;
        
        // Conversation memory for AI Tutor
        this.conversationSessions = new Map(); // sessionId -> conversation history
        
        // 515+ Progress Tracking System (The "little details" that matter)
        this.progressTracking = {
            // Study session metrics
            sessionData: new Map(), // sessionId -> detailed metrics
            
            // Topic mastery tracking (biochemistry priority)
            topicMastery: {
                biochemistry: {
                    glycolysis: { understanding: 0, lastStudied: null, mistakes: [] },
                    citricAcidCycle: { understanding: 0, lastStudied: null, mistakes: [] },
                    electronTransport: { understanding: 0, lastStudied: null, mistakes: [] },
                    enzymeKinetics: { understanding: 0, lastStudied: null, mistakes: [] },
                    proteinFolding: { understanding: 0, lastStudied: null, mistakes: [] },
                },
                biology: {},
                chemistry: {},
                physics: {},
                psychology: {}
            },
            
            // 515+ specific metrics
            studyMetrics: {
                totalStudyTime: 0,
                earlyMorningStudySessions: 0, // 8am starts (high scorers habit)
                biochemistryFocusPercentage: 0,
                detailedExplanationsRequested: 0,
                clinicalCorrelationsStudied: 0,
                memoryTechniquesUsed: 0,
                integrationQuestionsAnswered: 0
            },
            
            // Performance analytics
            performanceAnalytics: {
                lastUpdated: new Date(),
                trends: [],
                recommendations: [],
                strengthAreas: [],
                improvementAreas: []
            }
        };
        
        this.initializeMCPConnection();
        this.setupRoutes();
    }

    initializeAIClients() {
        try {
            // Initialize OpenAI client
            this.openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY,
            });
            
            // Initialize Anthropic client
            this.anthropic = new Anthropic({
                apiKey: process.env.ANTHROPIC_API_KEY,
            });
            
            console.log('🤖 AI clients initialized successfully');
            console.log('✅ OpenAI client ready');
            console.log('✅ Claude client ready');
            
            // Initialize enhanced question generator
            try {
                this.questionGenerator = new MCATQuestionGenerator(this.openai, this.anthropic);
                console.log('📚 Enhanced Question Generator initialized');
            } catch (error) {
                console.error('❌ Error initializing question generator:', error);
                this.questionGenerator = null;
            }
            
        } catch (error) {
            console.error('❌ Error initializing AI clients:', error);
            this.openai = null;
            this.anthropic = null;
        }
    }

    async initializeMCPConnection() {
        console.log('🧬 MCP Server disabled - using enhanced fallback mode');
        console.log('📚 All features available through comprehensive fallback system');
        this.isConnected = false;
    }

    async callMCPTool(toolName, args = {}) {
        if (!this.isConnected) {
            console.log('MCP not connected, using simulated response');
            return this.simulateMCPResponse(toolName, args);
        }

        try {
            if (this.mcpClient) {
                // Use real MCP client
                const response = await this.mcpClient.callTool({
                    name: toolName,
                    arguments: args
                });
                return response.content;
            } else {
                // Fallback to simulated responses
                return this.simulateMCPResponse(toolName, args);
            }
        } catch (error) {
            console.error(`Error calling MCP tool ${toolName}:`, error);
            // Fallback to simulated response on error
            return this.simulateMCPResponse(toolName, args);
        }
    }

    simulateMCPResponse(toolName, args) {
        switch (toolName) {
            case 'get_mcat_high_yield_topics':
                return [{
                    type: 'text',
                    text: this.getHighYieldTopics(args.section)
                }];
            
            case 'generate_study_schedule':
                return [{
                    type: 'text', 
                    text: this.generateStudySchedule(args)
                }];
            
            case 'analyze_practice_score':
                return [{
                    type: 'text',
                    text: this.analyzeScore(args)
                }];
            
            case 'get_medical_concept_explanation':
                return this.getEnhancedFallbackTutorResponse(args.concept || 'medical concept');
                
            case 'analyze_medical_concept':
                return this.getEnhancedFallbackTutorResponse(args.concept || args.term || 'medical concept');
                
            case 'search_pubmed_advanced':
                return this.getEnhancedFallbackTutorResponse('research ' + (args.query || 'medical research'));
                
            case 'generate_adaptive_study_plan':
                return this.getEnhancedFallbackTutorResponse('study plan ' + (args.topic || 'MCAT preparation'));
                
            case 'medical_terminology_trainer':
                return this.getEnhancedFallbackTutorResponse('define ' + (args.term || args.concept || 'medical term'));
            
            case 'get_mcat_question_strategy':
                return [{
                    type: 'text',
                    text: this.getQuestionStrategy(args.section)
                }];
            
            case 'search_pubmed':
                return [{
                    type: 'text',
                    text: this.searchPubMed(args)
                }];
            
            default:
                console.log(`⚠️  Unknown MCP tool: ${toolName}, using enhanced fallback`);
                return this.getEnhancedFallbackTutorResponse(args.concept || args.query || args.term || 'MCAT topic');
        }
    }

    getHighYieldTopics(section) {
        const topics = {
            'General Chemistry': [
                'Acid-Base Chemistry & Henderson-Hasselbalch Equation',
                'Chemical Equilibrium & Le Châtelier\'s Principle', 
                'Thermodynamics (ΔG, ΔH, ΔS relationships)',
                'Kinetics & Rate Laws (Zero, First, Second Order)',
                'Electrochemistry & Nernst Equation',
                'Stoichiometry & Gas Laws (Ideal Gas Law, Boyle\'s, Charles\')',
                'Atomic Structure & Periodic Trends',
                'Bonding Theory (Lewis, VSEPR, Hybridization)'
            ],
            'Organic Chemistry': [
                'Stereochemistry (R/S, E/Z, Chirality Centers)',
                'Substitution & Elimination Mechanisms (SN1, SN2, E1, E2)',
                'Functional Groups & Their Reactions',
                'Spectroscopy (IR, NMR, Mass Spec) for Structure Determination',
                'Carbonyl Chemistry (Aldehydes, Ketones, Carboxylic Acids)',
                'Aromatic Chemistry & Electrophilic Aromatic Substitution',
                'Biochemically Relevant Molecules (Amino Acids, Sugars)',
                'Reaction Energy Diagrams & Transition States'
            ],
            'Physics': [
                'Optics (Lens Equation, Snell\'s Law, Mirrors)',
                'Fluid Mechanics (Continuity, Bernoulli\'s, Poiseuille\'s)',
                'Electricity & Magnetism (Coulomb\'s, Ohm\'s, Magnetic Fields)',
                'Thermodynamics (Laws, Heat Engines, Entropy)',
                'Sound & Waves (Doppler Effect, Standing Waves, Interference)',
                'Mechanics (Newton\'s Laws, Work-Energy, Momentum)',
                'Atomic Physics (Photoelectric Effect, de Broglie Wavelength)',
                'Circuits (Series, Parallel, RC, Capacitors)'
            ],
            'Biology': [
                'Molecular Biology (DNA Replication, Transcription, Translation)',
                'Genetics (Mendelian, Non-Mendelian, Linkage, Mutations)',
                'Evolution (Natural Selection, Hardy-Weinberg, Speciation)',
                'Ecology (Population Dynamics, Energy Flow, Biogeochemical Cycles)',
                'Animal Systems (Circulatory, Respiratory, Nervous, Endocrine)',
                'Cell Biology (Organelles, Membrane Transport, Cell Cycle)',
                'Microbiology (Bacteria, Viruses, Immune System)',
                'Developmental Biology (Embryogenesis, Cell Differentiation)'
            ],
            'Biochemistry': [
                'Enzyme Kinetics (Michaelis-Menten, Km, Vmax, Inhibition)',
                'Metabolism (Glycolysis, Citric Acid Cycle, Electron Transport)',
                'Protein Structure (Primary, Secondary, Tertiary, Quaternary)',
                'Nucleic Acids (DNA/RNA Structure, Replication, Repair)',
                'Cellular Processes (Signal Transduction, Apoptosis)',
                'Bioenergetics (ATP Synthesis, Redox Reactions, ΔG)',
                'Lipid Metabolism (Beta-oxidation, Fatty Acid Synthesis)',
                'Amino Acid Metabolism (Deamination, Urea Cycle)'
            ],
            'Psychology': [
                'Learning & Memory (Classical/Operant Conditioning, Memory Types)',
                'Cognition (Problem Solving, Decision Making, Language)',
                'Personality Theories (Big Five, Psychodynamic, Humanistic)',
                'Developmental Psychology (Piaget, Erikson, Attachment)',
                'Social Psychology (Attitudes, Conformity, Group Dynamics)',
                'Research Methods (Experimental Design, Statistics, Ethics)',
                'Sensation & Perception (Thresholds, Visual/Auditory Processing)',
                'Psychological Disorders (DSM-5, Treatment Approaches)'
            ],
            'Sociology': [
                'Social Stratification (Class, Status, Social Mobility)',
                'Healthcare Systems (Access, Disparities, Health Behaviors)',
                'Demographics (Population Pyramids, Migration, Urbanization)',
                'Social Institutions (Family, Education, Religion, Government)',
                'Culture (Norms, Values, Socialization, Cultural Capital)',
                'Deviance & Social Control (Crime, Labeling Theory)',
                'Social Change (Modernization, Globalization, Social Movements)',
                'Research Methods (Qualitative vs Quantitative, Sampling)'
            ],
            'CARS': [
                'Passage Types (Humanities, Social Sciences, Ethics)',
                'Main Idea Identification Strategies',
                'Author\'s Tone & Perspective Analysis',
                'Argument Structure Recognition',
                'Inference & Assumption Questions',
                'Strengthen/Weaken Argument Techniques',
                'Time Management (8-10 minutes per passage)',
                'Process of Elimination Strategies'
            ]
        };
        
        const sectionTopics = topics[section] || ['Topic 1', 'Topic 2', 'Topic 3'];
        const topicCount = sectionTopics.length;
        const mcatQuestions = section === 'CARS' ? '53 questions' : '59 questions';
        
        return `High-yield topics for ${section} (${mcatQuestions} on MCAT):\n\n${sectionTopics.map((topic, i) => `${i+1}. ${topic}`).join('\n')}\n\n📊 Coverage: ${topicCount} essential topics\n⏱️ Study Focus: These topics appear frequently on the MCAT\n🎯 Recommendation: Master these concepts for maximum score impact`;
    }

    generateStudySchedule(args) {
        const { study_duration_weeks, hours_per_day, target_score, weak_areas } = args;
        return `Personalized Study Schedule:\n\n` +
               `Duration: ${study_duration_weeks} weeks\n` +
               `Daily Hours: ${hours_per_day}\n` +
               `Target Score: ${target_score}\n\n` +
               `Phase 1 (Weeks 1-${Math.ceil(study_duration_weeks/3)}): Content Review\n` +
               `Phase 2 (Mid-weeks): Practice & Application\n` +
               `Phase 3 (Final weeks): AAMC Materials & Test Prep\n\n` +
               `Focus Areas: ${weak_areas?.join(', ') || 'All sections'}`;
    }

    analyzeScore(args) {
        const { chem_phys, cars, bio_biochem, psych_soc } = args;
        const total = chem_phys + cars + bio_biochem + psych_soc;
        const sections = {
            'Chem/Phys': chem_phys,
            'CARS': cars, 
            'Bio/Biochem': bio_biochem,
            'Psych/Soc': psych_soc
        };
        
        let analysis = `Score Analysis (Total: ${total}/528):\n\n`;
        Object.entries(sections).forEach(([section, score]) => {
            const percentile = Math.round((score - 118) / 14 * 100);
            analysis += `${section}: ${score} (~${percentile}th percentile)\n`;
        });
        
        const weakest = Object.entries(sections).reduce((min, curr) => 
            curr[1] < min[1] ? curr : min
        );
        
        analysis += `\nWeakest Area: ${weakest[0]} (${weakest[1]})\n`;
        analysis += `Recommended Focus: Increase practice in ${weakest[0]} section`;
        
        return analysis;
    }

    getConceptExplanation(args) {
        return `Medical Concept: ${args.concept}\n\n` +
               `Complexity Level: ${args.complexity_level}\n\n` +
               `This concept is fundamental to understanding medical processes and is ` +
               `frequently tested on the MCAT. Key points include molecular mechanisms, ` +
               `clinical relevance, and connections to other biological systems.`;
    }

    getQuestionStrategy(section) {
        const strategies = {
            'Chem/Phys': 'Focus on unit analysis, dimensional analysis, and equation manipulation',
            'CARS': 'Practice active reading, identify main ideas, and eliminate extreme answers',
            'Bio/Biochem': 'Understand processes at molecular level, memorize key pathways',
            'Psych/Soc': 'Learn key terminology, understand research methods, apply theories'
        };
        
        return `Strategy for ${section}:\n\n${strategies[section] || 'General test-taking strategies apply'}`;
    }

    searchPubMed(args) {
        return `PubMed Search Results for "${args.query}":\n\n` +
               `Found ${args.max_results || 10} relevant medical education articles.\n\n` +
               `Research trends show increasing focus on evidence-based medical education ` +
               `and integration of basic sciences with clinical practice.`;
    }

    setupRoutes() {
        // Main dashboard route
        app.get('/', (req, res) => {
            res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
        });

        // API Routes powered by MCP server
        
        // Get high-yield topics for a specific MCAT section
        app.get('/api/topics/:section', async (req, res) => {
            try {
                const section = req.params.section;
                const topics = await this.callMCPTool('get_mcat_high_yield_topics', { section });
                
                res.json({
                    success: true,
                    section: section,
                    topics: topics,
                    generated_at: new Date().toISOString()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Generate personalized study schedule
        app.post('/api/study-schedule', async (req, res) => {
            try {
                const { study_duration_weeks, hours_per_day, target_score, weak_areas } = req.body;
                
                const schedule = await this.callMCPTool('generate_study_schedule', {
                    study_duration_weeks,
                    hours_per_day,
                    target_score,
                    weak_areas
                });

                res.json({
                    success: true,
                    schedule: schedule,
                    generated_at: new Date().toISOString()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Analyze practice test scores with detailed feedback
        app.post('/api/analyze-score', async (req, res) => {
            try {
                const { chem_phys, cars, bio_biochem, psych_soc } = req.body;
                
                const analysis = await this.callMCPTool('analyze_practice_score', {
                    chem_phys,
                    cars, 
                    bio_biochem,
                    psych_soc
                });

                res.json({
                    success: true,
                    analysis: analysis,
                    total_score: chem_phys + cars + bio_biochem + psych_soc,
                    analyzed_at: new Date().toISOString()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Get detailed medical concept explanation
        app.get('/api/concept/:concept', async (req, res) => {
            try {
                const concept = req.params.concept;
                const level = req.query.level || 'intermediate';
                
                const explanation = await this.callMCPTool('get_medical_concept_explanation', {
                    concept,
                    complexity_level: level
                });

                res.json({
                    success: true,
                    concept: concept,
                    level: level,
                    explanation: explanation,
                    generated_at: new Date().toISOString()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Get MCAT question strategy for specific section
        app.get('/api/strategy/:section', async (req, res) => {
            try {
                const section = req.params.section;
                
                const strategy = await this.callMCPTool('get_mcat_question_strategy', {
                    section
                });

                res.json({
                    success: true,
                    section: section,
                    strategy: strategy,
                    generated_at: new Date().toISOString()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Search medical literature for MCAT-relevant topics
        app.get('/api/research/:topic', async (req, res) => {
            try {
                const topic = req.params.topic;
                const limit = req.query.limit || 5;
                
                const research = await this.callMCPTool('search_pubmed', {
                    query: topic,
                    max_results: parseInt(limit)
                });

                res.json({
                    success: true,
                    topic: topic,
                    research: research,
                    searched_at: new Date().toISOString()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Interactive practice question generator
        app.post('/api/practice-question', async (req, res) => {
            try {
                const { section, topic, difficulty } = req.body;
                
                // This would integrate with MCP to generate practice questions
                // For now, return a structured response
                const question = await this.generatePracticeQuestion(section, topic, difficulty);
                
                res.json({
                    success: true,
                    question: question,
                    generated_at: new Date().toISOString()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Comprehensive Study Platform - Subject Overview
        app.get('/api/subjects/:subject', async (req, res) => {
            try {
                const subject = req.params.subject;
                console.log(`Loading comprehensive content for subject: ${subject}`);
                
                // Get subject overview using MCP medical concept analysis
                const conceptAnalysis = await this.callMCPTool('analyze_medical_concept', {
                    concept: subject,
                    analysis_depth: 'mcat_focused',
                    include_clinical_correlation: true
                });
                
                // Get high-yield topics for this subject
                const topics = await this.callMCPTool('get_mcat_high_yield_topics', { section: subject });
                
                // Search PubMed for recent research
                const research = await this.callMCPTool('search_pubmed_advanced', {
                    query: `${subject} medical education MCAT`,
                    max_results: 5,
                    sort_by: 'relevance'
                });
                
                // Generate study recommendations
                const studyPlan = await this.generateSubjectStudyPlan(subject);
                
                res.json({
                    success: true,
                    subject: subject,
                    overview: {
                        concept_analysis: conceptAnalysis[0]?.text || `Comprehensive analysis of ${subject} concepts and MCAT relevance.`,
                        high_yield_topics: topics[0]?.text || `Key topics in ${subject} for MCAT success.`,
                        recent_research: research[0]?.text || `Latest research findings in ${subject} education.`,
                        study_recommendations: studyPlan
                    },
                    topics: this.getSubjectTopics(subject),
                    generated_at: new Date().toISOString()
                });
            } catch (error) {
                console.error('Error loading subject content:', error);
                res.status(500).json({
                    success: false,
                    error: error.message,
                    fallback_content: this.getFallbackContent(req.params.subject)
                });
            }
        });
        
        // Subject Topic Details
        app.get('/api/subjects/:subject/topics/:topic', async (req, res) => {
            try {
                const { subject, topic } = req.params;
                console.log(`Loading topic details: ${subject} - ${topic}`);
                
                // Get detailed concept analysis
                const analysis = await this.callMCPTool('analyze_medical_concept', {
                    concept: topic,
                    analysis_depth: 'advanced',
                    include_clinical_correlation: true
                });
                
                // Get medical school correlation
                const medSchoolRelevance = await this.callMCPTool('medical_school_correlation', {
                    mcat_topic: topic,
                    medical_school_year: 'all'
                });
                
                // Generate practice questions
                const practiceQuestion = await this.generatePracticeQuestion(subject, topic, 'medium');
                
                res.json({
                    success: true,
                    subject: subject,
                    topic: topic,
                    content: {
                        detailed_analysis: analysis[0]?.text || `Detailed analysis of ${topic} concept.`,
                        medical_school_relevance: medSchoolRelevance[0]?.text || `Medical school applications of ${topic}.`,
                        practice_question: practiceQuestion,
                        study_tips: this.getStudyTips(topic),
                        related_concepts: this.getRelatedConcepts(subject, topic)
                    },
                    generated_at: new Date().toISOString()
                });
            } catch (error) {
                console.error('Error loading topic content:', error);
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });
        
        // Generate MCP-powered flashcards
        app.post('/api/flashcards/generate', async (req, res) => {
            try {
                const { subject, count = 10, difficulty = 'intermediate' } = req.body;
                
                const flashcards = await this.generateMCPFlashcards(subject, count, difficulty);
                
                res.json({
                    success: true,
                    flashcards: flashcards,
                    generated_at: new Date().toISOString(),
                    count: flashcards.length
                });
            } catch (error) {
                console.error('Error generating flashcards:', error);
                res.status(500).json({
                    success: false,
                    error: error.message,
                    fallback_cards: this.getFallbackFlashcards(req.body.subject)
                });
            }
        });

        // AI Tutor query endpoint with conversation memory
        app.post('/api/tutor/query', async (req, res) => {
            try {
                const { message, context = 'mcat_study', sessionId = 'default', clearHistory = false } = req.body;
                
                // Handle clear history request
                if (clearHistory) {
                    this.conversationSessions.delete(sessionId);
                    res.json({
                        success: true,
                        response: "Conversation cleared. What would you like to learn about?",
                        conversation_cleared: true,
                        generated_at: new Date().toISOString()
                    });
                    return;
                }
                
                const response = await this.generateContextualTutorResponse(message, context, sessionId);
                
                res.json({
                    success: true,
                    response: response,
                    session_id: sessionId,
                    generated_at: new Date().toISOString()
                });
            } catch (error) {
                console.error('Error generating tutor response:', error);
                res.status(500).json({
                    success: false,
                    error: error.message,
                    fallback_response: "I'm having trouble connecting to the medical database right now. Please try a different question or check back later."
                });
            }
        });

        // 515+ Progress Tracking Routes
        
        // Get detailed progress report
        app.get('/api/progress/:sessionId', (req, res) => {
            try {
                const sessionId = req.params.sessionId || 'default';
                const progressReport = this.getProgressReport(sessionId);
                
                res.json({
                    success: true,
                    sessionId: sessionId,
                    progress: progressReport,
                    generated_at: new Date().toISOString()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Update study session manually
        app.post('/api/progress/session', (req, res) => {
            try {
                const { sessionId, topic, duration, questionType, isCorrect } = req.body;
                
                this.trackStudySession(sessionId, topic, duration, questionType, isCorrect);
                
                res.json({
                    success: true,
                    message: 'Study session tracked successfully',
                    generated_at: new Date().toISOString()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Get 515+ specific recommendations
        app.get('/api/progress/:sessionId/recommendations', (req, res) => {
            try {
                const sessionId = req.params.sessionId || 'default';
                const recommendations = this.progressTracking.performanceAnalytics.recommendations;
                const next515Steps = this.getNext515Steps();
                
                res.json({
                    success: true,
                    sessionId: sessionId,
                    recommendations: recommendations,
                    next515Steps: next515Steps,
                    biochemistryFocus: this.progressTracking.studyMetrics.biochemistryFocusPercentage,
                    generated_at: new Date().toISOString()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // 515+ Study Pathways Routes
        
        // Generate personalized 515+ study pathway
        app.post('/api/study-pathway/515', (req, res) => {
            try {
                const { currentLevel, timeframe, focusAreas } = req.body;
                
                const studyPathway = this.generate515StudyPathway(
                    currentLevel || 'beginner', 
                    timeframe || '3months', 
                    focusAreas || []
                );
                
                res.json({
                    success: true,
                    pathway: studyPathway,
                    customized: true,
                    generated_at: new Date().toISOString()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Get daily schedule for 515+ prep
        app.get('/api/study-pathway/daily-schedule', (req, res) => {
            try {
                const dailySchedule = this.generate515DailySchedule();
                
                res.json({
                    success: true,
                    dailySchedule: dailySchedule,
                    optimizedFor: '515+ MCAT scores',
                    generated_at: new Date().toISOString()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // ===== ENHANCED QUESTION SYSTEM ROUTES =====
        
        // Get random question with filtering
        app.get('/api/question/random', async (req, res) => {
            try {
                const filters = {
                    topic: req.query.topic,
                    difficulty: req.query.difficulty,
                    type: req.query.type
                };

                // Directly read the database file
                const dbPath = path.join(process.cwd(), 'data', 'question-database.json');
                
                if (!fs.existsSync(dbPath)) {
                    return res.json({
                        success: false,
                        error: 'Question database not found',
                        timestamp: new Date().toISOString()
                    });
                }
                
                const databaseData = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
                let allQuestions = databaseData.questions || [];
                
                // Apply filters
                if (filters.topic) {
                    allQuestions = allQuestions.filter(q => q.topic === filters.topic);
                }
                if (filters.difficulty) {
                    allQuestions = allQuestions.filter(q => q.difficulty === filters.difficulty);
                }
                if (filters.type) {
                    allQuestions = allQuestions.filter(q => q.type === filters.type);
                }
                
                if (allQuestions.length === 0) {
                    return res.json({
                        success: false,
                        error: 'No questions found matching filters',
                        filters_applied: filters,
                        timestamp: new Date().toISOString()
                    });
                }
                
                const randomIndex = Math.floor(Math.random() * allQuestions.length);
                const question = allQuestions[randomIndex];
                
                console.log(`🎲 Random question selected: ${question.topic} (${question.difficulty})`);

                res.json({
                    success: true,
                    question: question,
                    filters_applied: filters,
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                console.error('Error getting random question:', error);
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Get questions by topic/difficulty
        app.get('/api/questions', async (req, res) => {
            try {
                const filters = {
                    topic: req.query.topic,
                    difficulty: req.query.difficulty,
                    type: req.query.type
                };

                const limit = parseInt(req.query.limit) || 10;
                const offset = parseInt(req.query.offset) || 0;

                // Directly read the database file
                const dbPath = path.join(process.cwd(), 'data', 'question-database.json');
                
                if (!fs.existsSync(dbPath)) {
                    return res.json({
                        success: true,
                        questions: [],
                        total_count: 0,
                        filters: filters,
                        pagination: { limit, offset },
                        timestamp: new Date().toISOString(),
                        note: 'Database file not found'
                    });
                }
                
                const databaseData = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
                let allQuestions = databaseData.questions || [];
                
                // Apply filters
                if (filters.topic) {
                    allQuestions = allQuestions.filter(q => q.topic === filters.topic);
                }
                if (filters.difficulty) {
                    allQuestions = allQuestions.filter(q => q.difficulty === filters.difficulty);
                }
                if (filters.type) {
                    allQuestions = allQuestions.filter(q => q.type === filters.type);
                }
                
                const totalCount = allQuestions.length;
                const questions = allQuestions.slice(offset, offset + limit);
                
                console.log(`📚 Serving ${questions.length} questions (${totalCount} total match filters)`);

                res.json({
                    success: true,
                    questions: questions,
                    total_count: totalCount,
                    filters: filters,
                    pagination: { limit, offset },
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                console.error('Error getting questions:', error);
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Generate new question on-demand
        app.post('/api/question/generate', async (req, res) => {
            try {
                const { topic, difficulty, type } = req.body;
                
                if (!this.questionGenerator) {
                    console.log('Question generator not available, generating fallback question');
                    const question = this.generateFallbackQuestion(topic, difficulty, type);
                    return res.json({
                        success: true,
                        question: question,
                        generated_at: new Date().toISOString(),
                        note: 'Generated using fallback system'
                    });
                }

                console.log(`Generating ${difficulty} ${type} question for ${topic}`);
                const question = await this.questionGenerator.generateBiochemistryQuestion(topic, difficulty, type);

                if (!question) {
                    throw new Error('Failed to generate question');
                }

                res.json({
                    success: true,
                    question: question,
                    generated_at: new Date().toISOString()
                });
            } catch (error) {
                console.error('Error generating question:', error);
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Get question database statistics
        app.get('/api/questions/stats', (req, res) => {
            try {
                // Directly read the database file to bypass questionGenerator issues
                const dbPath = path.join(process.cwd(), 'data', 'question-database.json');
                
                if (!fs.existsSync(dbPath)) {
                    console.log('❌ Database file not found:', dbPath);
                    return res.json({
                        success: true,
                        stats: {
                            total_questions: 0,
                            by_topic: {},
                            by_difficulty: {},
                            by_type: {},
                            last_updated: null
                        },
                        timestamp: new Date().toISOString(),
                        note: 'Database file not found'
                    });
                }
                
                const databaseData = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
                console.log('📊 Database loaded - Total questions:', databaseData.metadata?.total_questions || 0);
                
                const stats = {
                    total_questions: databaseData.metadata?.total_questions || 0,
                    by_topic: databaseData.metadata?.categories?.biochemistry || {},
                    by_difficulty: databaseData.metadata?.difficulty_levels || {},
                    by_type: this.calculateTypeStats(databaseData.questions || []),
                    last_updated: databaseData.metadata?.last_updated
                };

                res.json({
                    success: true,
                    stats: stats,
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                console.error('Error getting question stats:', error);
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Health check
        app.get('/api/health', (req, res) => {
            res.json({
                status: 'healthy',
                mcp_connected: this.isConnected,
                progress_tracking: 'enabled',
                biochemistry_focus: 'enhanced',
                ai_integration: 'claude + openai',
                timestamp: new Date().toISOString()
            });
        });
    }

    async generateMCPFlashcards(subject, count, difficulty) {
        try {
            const flashcards = [];
            const topics = await this.callMCPTool('get_mcat_high_yield_topics', { section: subject });
            
            // Parse topics response
            let topicList = [];
            if (Array.isArray(topics)) {
                topicList = topics.map(topic => typeof topic === 'string' ? topic : (topic.text || topic.toString()));
            } else if (topics && topics[0] && topics[0].text) {
                topicList = topics[0].text.split('\n').filter(line => line.match(/^\d+\./)).slice(0, count);
            }
            
            for (let i = 0; i < count && i < topicList.length; i++) {
                const explanation = await this.callMCPTool('get_medical_concept_explanation', {
                    concept: topicList[i],
                    complexity_level: difficulty
                });
                
                // Parse explanation response  
                let explanationText = '';
                if (Array.isArray(explanation) && explanation[0] && explanation[0].text) {
                    explanationText = explanation[0].text;
                } else if (typeof explanation === 'string') {
                    explanationText = explanation;
                } else {
                    explanationText = 'Explanation not available';
                }
                
                flashcards.push({
                    id: `mcp-${Date.now()}-${i}`,
                    front: `What is ${topicList[i]}?`,
                    back: explanationText,
                    subject: subject,
                    difficulty: difficulty,
                    source: 'MCP-Generated',
                    created: new Date().toISOString()
                });
            }
            
            return flashcards.length > 0 ? flashcards : this.getFallbackFlashcards(subject, count);
        } catch (error) {
            console.log('MCP not connected, generating fallback flashcards');
            return this.getFallbackFlashcards(subject, count);
        }
    }

    getFallbackFlashcards(subject, count = 5) {
        const fallbackCards = {
            'Biology': [
                {
                    id: 'fallback-bio-1',
                    front: 'What are the phases of mitosis?',
                    back: 'Prophase, Metaphase, Anaphase, Telophase (PMAT). During prophase, chromosomes condense. In metaphase, they align at the cell center. Anaphase separates sister chromatids. Telophase forms two nuclei.',
                    subject: 'Biology',
                    source: 'Fallback'
                },
                {
                    id: 'fallback-bio-2',
                    front: 'What is the difference between prokaryotes and eukaryotes?',
                    back: 'Prokaryotes lack a membrane-bound nucleus (bacteria, archaea). Eukaryotes have a nucleus and organelles (plants, animals, fungi, protists).',
                    subject: 'Biology',
                    source: 'Fallback'
                },
                {
                    id: 'fallback-bio-3',
                    front: 'What is photosynthesis?',
                    back: '6CO2 + 6H2O + light energy → C6H12O6 + 6O2. Plants convert light energy to chemical energy in chloroplasts.',
                    subject: 'Biology',
                    source: 'Fallback'
                }
            ],
            'Chemistry': [
                {
                    id: 'fallback-chem-1',
                    front: 'What is the Henderson-Hasselbalch equation?',
                    back: 'pH = pKa + log([A-]/[HA]). Used to calculate pH of buffer solutions. [A-] is conjugate base, [HA] is weak acid.',
                    subject: 'Chemistry',
                    source: 'Fallback'
                },
                {
                    id: 'fallback-chem-2',
                    front: 'What is Le Châtelier\'s Principle?',
                    back: 'If stress is applied to equilibrium, system shifts to counteract the stress. Stress can be concentration, temperature, or pressure changes.',
                    subject: 'Chemistry',
                    source: 'Fallback'
                }
            ],
            'Physics': [
                {
                    id: 'fallback-phys-1',
                    front: 'What is Newton\'s Second Law?',
                    back: 'F = ma. Net force equals mass times acceleration. Force and acceleration are vectors in same direction.',
                    subject: 'Physics',
                    source: 'Fallback'
                },
                {
                    id: 'fallback-phys-2',
                    front: 'What is Ohm\'s Law?',
                    back: 'V = IR. Voltage equals current times resistance. Used to analyze electrical circuits.',
                    subject: 'Physics',
                    source: 'Fallback'
                }
            ],
            'Psychology': [
                {
                    id: 'fallback-psych-1',
                    front: 'What is classical conditioning?',
                    back: 'Learning process where neutral stimulus becomes conditioned stimulus through association with unconditioned stimulus. Discovered by Pavlov.',
                    subject: 'Psychology',
                    source: 'Fallback'
                },
                {
                    id: 'fallback-psych-2',
                    front: 'What are the Big Five personality traits?',
                    back: 'Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism (OCEAN). Widely used personality model.',
                    subject: 'Psychology',
                    source: 'Fallback'
                }
            ],
            'Biochemistry': [
                {
                    id: 'fallback-biochem-1',
                    front: 'What is the Michaelis-Menten equation?',
                    back: 'v = (Vmax × [S]) / (Km + [S]). Describes enzyme kinetics. Km is substrate concentration at half Vmax.',
                    subject: 'Biochemistry',
                    source: 'Fallback'
                }
            ]
        };
        
        const cards = fallbackCards[subject] || fallbackCards['Biology'];
        return cards.slice(0, count);
    }

    async generateContextualTutorResponse(message, context, sessionId) {
        try {
            console.log(`🎓 AI Tutor contextual query: "${message}" (Session: ${sessionId})`);
            
            // Get or create conversation history
            if (!this.conversationSessions.has(sessionId)) {
                this.conversationSessions.set(sessionId, {
                    messages: [],
                    currentTopic: null,
                    topicHistory: [],
                    lastActivity: Date.now()
                });
            }
            
            const conversation = this.conversationSessions.get(sessionId);
            
            // Analyze message with conversation context
            const contextualAnalysis = this.analyzeMessageWithContext(message, conversation);
            console.log(`🧠 Contextual analysis:`, contextualAnalysis);
            
            // Generate AI-powered response
            const response = await this.generateAIPoweredResponse(message, contextualAnalysis, conversation);
            
            // Track progress for 515+ analytics
            this.trackStudySession(
                sessionId, 
                contextualAnalysis.currentTopic, 
                5, // Assume 5-minute study session
                contextualAnalysis.queryType,
                null // No right/wrong for open questions
            );
            
            // Update conversation history
            this.updateConversationHistory(conversation, message, response, contextualAnalysis);
            
            return response;
            
        } catch (error) {
            console.log('🔄 AI error, generating enhanced fallback:', error.message);
            return this.getEnhancedFallbackTutorResponse(message);
        }
    }
    
    // Legacy method for backward compatibility
    async generateTutorResponse(message, context) {
        return this.generateContextualTutorResponse(message, context, 'default');
    }
    
    analyzeMessageWithContext(message, conversation) {
        const lowerMessage = message.toLowerCase();
        
        // Detect topic switches
        const newTopic = this.detectSubject(message, conversation);
        const topicSwitch = conversation.currentTopic && 
                           conversation.currentTopic !== newTopic && 
                           newTopic !== 'unknown';
        
        // Detect follow-up patterns
        const isFollowUp = this.isFollowUpQuestion(message, conversation);
        
        // Detect clarification requests
        const isClarification = this.isClarificationRequest(message, conversation);
        
        return {
            queryType: this.analyzeQueryType(message),
            currentTopic: newTopic,
            previousTopic: conversation.currentTopic,
            topicSwitch: topicSwitch,
            isFollowUp: isFollowUp,
            isClarification: isClarification,
            conversationLength: conversation.messages.length,
            recentContext: conversation.messages.slice(-3) // Last 3 exchanges for context
        };
    }
    
    detectSubject(message, conversation = null) {
        const lowerMessage = message.toLowerCase();
        
        // Biology keywords
        if (lowerMessage.match(/cell|dna|rna|protein|enzyme|mitochondria|respiration|photosynthesis|genetics|evolution|biology|bio/)) {
            return 'biology';
        }
        
        // Chemistry keywords  
        if (lowerMessage.match(/molecule|atom|bond|reaction|acid|base|organic|inorganic|chemistry|chem|ph/)) {
            return 'chemistry';
        }
        
        // Physics keywords
        if (lowerMessage.match(/force|energy|wave|electric|magnetic|optics|mechanics|physics|motion/)) {
            return 'physics';
        }
        
        // Psychology keywords
        if (lowerMessage.match(/behavior|psychology|psych|cognitive|social|development|learning|memory/)) {
            return 'psychology';
        }
        
        return (conversation && conversation.currentTopic) || 'unknown';
    }
    
    isFollowUpQuestion(message, conversation) {
        if (conversation.messages.length === 0) return false;
        
        const lowerMessage = message.toLowerCase();
        const followUpPatterns = [
            /how does.*relate/,
            /what about/,
            /and.*\?/,
            /why.*that/,
            /can you explain.*more/,
            /tell me more/,
            /elaborate/,
            /go deeper/,
            /what.*mean/,
            /how.*work/
        ];
        
        return followUpPatterns.some(pattern => pattern.test(lowerMessage));
    }
    
    isClarificationRequest(message, conversation) {
        if (conversation.messages.length === 0) return false;
        
        const lastResponse = conversation.messages[conversation.messages.length - 1]?.response || '';
        const hasAskedForClarification = lastResponse.includes('clarify') || 
                                       lastResponse.includes('specific') ||
                                       lastResponse.includes('which aspect');
        
        return hasAskedForClarification;
    }
    
    async generateSmartResponse(message, analysis, conversation) {
        // Handle topic switches
        if (analysis.topicSwitch) {
            const contextPrefix = `Moving from ${analysis.previousTopic} to ${analysis.currentTopic}. `;
            const baseResponse = await this.getContextualResponse(message, analysis);
            return contextPrefix + baseResponse;
        }
        
        // Handle follow-up questions with context
        if (analysis.isFollowUp && analysis.recentContext.length > 0) {
            const lastTopic = this.extractTopicFromRecentContext(analysis.recentContext);
            const contextualMessage = `${message} (in context of ${lastTopic})`;
            return await this.getContextualResponse(contextualMessage, analysis);
        }
        
        // Handle clarification responses (no more generic fallbacks!)
        if (analysis.isClarification) {
            const specificResponse = await this.getSpecificClarificationResponse(message, analysis, conversation);
            return specificResponse;
        }
        
        // Generate standard contextual response
        return await this.getContextualResponse(message, analysis);
    }
    
    async getContextualResponse(message, analysis) {
        try {
            let mcpResponse;
            
            switch (analysis.queryType) {
                case 'medical_concept':
                    mcpResponse = await this.callMCPTool('analyze_medical_concept', {
                        concept: message,
                        complexity_level: 'mcat_preparation',
                        include_examples: true,
                        focus: 'mcat_relevance'
                    });
                    break;
                    
                case 'pubmed_research':
                    mcpResponse = await this.callMCPTool('search_pubmed_advanced', {
                        query: message,
                        max_results: 3,
                        mcat_focus: true
                    });
                    break;
                    
                case 'study_planning':
                    mcpResponse = await this.callMCPTool('generate_adaptive_study_plan', {
                        topic: message,
                        difficulty: 'intermediate',
                        time_frame: 'short_term'
                    });
                    break;
                    
                case 'terminology':
                    mcpResponse = await this.callMCPTool('medical_terminology_trainer', {
                        term: message,
                        provide_context: true,
                        include_related_terms: true
                    });
                    break;
                    
                default:
                    mcpResponse = await this.callMCPTool('analyze_medical_concept', {
                        concept: message,
                        complexity_level: 'mcat_preparation',
                        include_examples: true
                    });
            }
            
            return this.formatMedicalResponse(mcpResponse, analysis.queryType);
            
        } catch (error) {
            console.log('🔄 MCP error in contextual response, using enhanced fallback:', error.message);
            return this.getEnhancedFallbackTutorResponse(message);
        }
    }
    
    async getSpecificClarificationResponse(message, analysis, conversation) {
        // Get the previous question context
        const lastUserMessage = conversation.messages.find(m => m.type === 'user')?.message || '';
        const combinedQuery = `${lastUserMessage} - specifically: ${message}`;
        
        console.log(`🎯 Clarification query: "${combinedQuery}"`);
        
        // Use enhanced response with specific context
        return this.getEnhancedContextualFallbackTutorResponse(combinedQuery, lastUserMessage);
    }
    
    extractTopicFromRecentContext(recentContext) {
        // Extract the main topic from recent conversation
        const lastMessage = recentContext[recentContext.length - 1];
        if (lastMessage && lastMessage.response) {
            const response = lastMessage.response.toLowerCase();
            if (response.includes('cellular respiration')) return 'cellular respiration';
            if (response.includes('glycolysis')) return 'glycolysis';
            if (response.includes('mitochondria')) return 'mitochondria';
            if (response.includes('photosynthesis')) return 'photosynthesis';
            // Add more topic extractions as needed
        }
        return 'the previous topic';
    }
    
    updateConversationHistory(conversation, message, response, analysis) {
        // Add user message
        conversation.messages.push({
            type: 'user',
            message: message,
            timestamp: Date.now()
        });
        
        // Add AI response
        conversation.messages.push({
            type: 'ai',
            response: response,
            queryType: analysis.queryType,
            topic: analysis.currentTopic,
            timestamp: Date.now()
        });
        
        // Update current topic and topic history
        if (analysis.currentTopic && analysis.currentTopic !== 'unknown') {
            if (analysis.topicSwitch) {
                conversation.topicHistory.push(conversation.currentTopic);
            }
            conversation.currentTopic = analysis.currentTopic;
        }
        
        // Limit conversation history to last 20 exchanges (10 pairs)
        if (conversation.messages.length > 20) {
            conversation.messages = conversation.messages.slice(-20);
        }
        
        conversation.lastActivity = Date.now();
    }
    
    async generateAIPoweredResponse(message, contextualAnalysis, conversation) {
        try {
            // Determine if this is biochemistry-focused (high priority for 515+)
            const isBiochemistry = this.isBiochemistryQuery(message);
            const is515Plus = contextualAnalysis.queryType === 'advanced' || isBiochemistry;
            
            // Choose AI based on complexity and type
            let response;
            if (is515Plus || isBiochemistry) {
                // Use Claude for complex, detailed explanations (515+ focus)
                response = await this.generateClaudeResponse(message, contextualAnalysis, conversation);
            } else {
                // Use OpenAI for general queries
                response = await this.generateOpenAIResponse(message, contextualAnalysis, conversation);
            }
            
            return response || this.getEnhancedFallbackTutorResponse(message);
            
        } catch (error) {
            console.log('🔄 AI-powered response failed, using fallback:', error.message);
            return this.getEnhancedFallbackTutorResponse(message);
        }
    }

    async generateClaudeResponse(message, contextualAnalysis, conversation) {
        if (!this.anthropic) {
            console.log('❌ Claude client not available');
            return null;
        }

        try {
            const isBiochem = this.isBiochemistryQuery(message);
            
            const systemPrompt = `You are an expert MCAT tutor specializing in helping students achieve 515+ scores (top 5% of test-takers). Your expertise focuses on:

${isBiochem ? `
🧬 **BIOCHEMISTRY SPECIALIST (515+ Focus):**
- Metabolic pathways: Glycolysis, gluconeogenesis, citric acid cycle, electron transport chain
- Enzyme kinetics: Km, Vmax, Kcat, competitive/noncompetitive inhibition, cooperativity
- Protein structure-function: Folding, domains, allosteric regulation, clinical mutations
- Nucleic acids: Replication, transcription, translation, RNA processing, repair mechanisms
- Clinical correlations: Hemoglobin variants, diabetes, metabolic disorders, genetic diseases

**515+ DIFFERENTIATION:** Provide the "little details" and mechanistic understanding that separate 515+ scorers from 510-514 scorers. Include:
- Specific enzyme names and their clinical significance
- Quantitative relationships and rate-limiting steps  
- Disease mechanisms and molecular basis
- Integration between pathways (how they connect)
- Memory techniques for complex biochemical processes
` : `
📚 **ADVANCED MCAT CONCEPTS (515+ Level):**
- Detailed mechanistic explanations beyond basic definitions
- Integration between different MCAT subjects
- Clinical applications and real-world relevance
- High-yield details that appear in challenging questions
`}

Current context: ${contextualAnalysis.currentTopic || 'MCAT preparation'}
Query type: ${contextualAnalysis.queryType}

**Response Requirements:**
- Start with the most clinically relevant aspect
- Include 2-3 key details that 515+ scorers must know
- Provide a memory technique or study strategy
- End with how this connects to other MCAT topics
- Use clear, professional language appropriate for pre-med students`;

            const response = await this.anthropic.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 1500,
                system: systemPrompt,
                messages: [
                    {
                        role: 'user',
                        content: message
                    }
                ]
            });

            console.log('✅ Claude response generated');
            const baseResponse = response.content[0].text;
            
            // Apply 515+ biochemistry enhancement
            return this.enhance515PlusBiochemistryResponse(baseResponse, message);

        } catch (error) {
            console.log('❌ Claude API error:', error.message);
            return null;
        }
    }

    async generateOpenAIResponse(message, contextualAnalysis, conversation) {
        if (!this.openai) {
            console.log('❌ OpenAI client not available');
            return null;
        }

        try {
            const systemPrompt = `You are an MCAT tutor helping students prepare for medical school admission. Focus on:
- Clear, accurate explanations of medical and scientific concepts
- MCAT-specific study strategies
- Connections between topics across MCAT sections
- Practical study advice

Current topic: ${contextualAnalysis.currentTopic || 'MCAT preparation'}`;

            const response = await this.openai.chat.completions.create({
                model: 'gpt-4-turbo-preview',
                max_tokens: 1200,
                temperature: 0.7,
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt
                    },
                    {
                        role: 'user', 
                        content: message
                    }
                ]
            });

            console.log('✅ OpenAI response generated');
            return response.choices[0].message.content;

        } catch (error) {
            console.log('❌ OpenAI API error:', error.message);
            return null;
        }
    }

    isBiochemistryQuery(message) {
        // Enhanced biochemistry detection for 515+ focus
        const highYieldBiochemKeywords = [
            // Core metabolism (highest yield)
            'glycolysis', 'gluconeogenesis', 'citric acid cycle', 'krebs cycle', 'electron transport',
            'oxidative phosphorylation', 'fatty acid synthesis', 'beta oxidation', 'pentose phosphate',
            
            // Enzyme kinetics (515+ essential)
            'enzyme kinetics', 'michaelis menten', 'km', 'vmax', 'kcat', 'competitive inhibition',
            'noncompetitive inhibition', 'uncompetitive inhibition', 'allosteric regulation',
            'cooperativity', 'sigmoidal curve', 'hill coefficient',
            
            // Protein structure/function (high yield)
            'protein folding', 'denaturation', 'quaternary structure', 'tertiary structure',
            'alpha helix', 'beta sheet', 'disulfide bonds', 'hydrophobic interactions',
            'protein domains', 'conformational change',
            
            // Nucleic acids (515+ detail level)
            'dna replication', 'transcription', 'translation', 'rna processing', 'splicing',
            'ribosomes', 'trna', 'mrna', 'genetic code', 'mutations', 'repair mechanisms',
            
            // Clinical correlations (515+ advantage)
            'hemoglobin', 'myoglobin', 'oxygen binding', 'bohr effect', 'sickle cell',
            'thalassemia', 'diabetes', 'insulin', 'glucagon', 'metabolic disorders',
            
            // General terms
            'enzyme', 'protein', 'amino acid', 'metabolism', 'kinetics', 'ATP', 'DNA', 'RNA',
            'glucose', 'biochemistry', 'molecular biology', 'cell biology', 'peptide bond'
        ];
        
        const messageLower = message.toLowerCase();
        return highYieldBiochemKeywords.some(keyword => messageLower.includes(keyword));
    }

    // 515+ Biochemistry Content Enhancement
    enhance515PlusBiochemistryResponse(baseResponse, message) {
        if (!this.isBiochemistryQuery(message)) {
            return baseResponse;
        }
        
        // Add 515+ specific biochemistry enhancements
        const biochemEnhancements = {
            glycolysis: {
                keyFact: "Rate-limiting enzyme: Phosphofructokinase-1 (PFK-1), inhibited by ATP and citrate",
                clinical: "Deficiency in pyruvate kinase → hemolytic anemia",
                integration: "Links to PPP via glucose-6-phosphate and to lipid synthesis via acetyl-CoA"
            },
            'citric acid cycle': {
                keyFact: "Anaplerotic reactions replenish cycle intermediates (e.g., pyruvate carboxylase)",
                clinical: "α-ketoglutarate dehydrogenase deficiency → developmental delays",
                integration: "Provides NADH/FADH2 for ETC and precursors for biosynthesis"
            },
            'electron transport': {
                keyFact: "Complex I (NADH dehydrogenase) pumps 4 H+, Complex III pumps 4 H+, Complex IV pumps 2 H+",
                clinical: "Cyanide poisoning inhibits Complex IV → cytotoxic hypoxia",
                integration: "P/O ratio: NADH = 2.5 ATP, FADH2 = 1.5 ATP"
            },
            hemoglobin: {
                keyFact: "Bohr effect: CO2 and H+ decrease O2 affinity (right shift in P50)",
                clinical: "HbS polymerization in sickle cell → vaso-occlusive crises",
                integration: "Links respiratory physiology with hematology and acid-base balance"
            }
        };
        
        // Enhance response with relevant 515+ details
        const messageLower = message.toLowerCase();
        for (const [topic, enhancement] of Object.entries(biochemEnhancements)) {
            if (messageLower.includes(topic)) {
                return baseResponse + `\n\n🎯 **515+ KEY INSIGHT:** ${enhancement.keyFact}\n\n🏥 **CLINICAL CORRELATION:** ${enhancement.clinical}\n\n🔗 **INTEGRATION:** ${enhancement.integration}`;
            }
        }
        
        return baseResponse;
    }

    getEnhancedContextualFallbackTutorResponse(message, previousContext = '') {
        // This method has been replaced by generateAIPoweredResponse
        return this.getEnhancedFallbackTutorResponse(message);
    }
    
    analyzeQueryType(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('study plan') || lowerMessage.includes('how to study') || lowerMessage.includes('schedule')) {
            return 'study_planning';
        }
        
        if (lowerMessage.includes('research') || lowerMessage.includes('studies') || lowerMessage.includes('evidence')) {
            return 'pubmed_research';
        }
        
        if (lowerMessage.includes('define') || lowerMessage.includes('what is') || lowerMessage.includes('meaning of')) {
            return 'terminology';
        }
        
        return 'medical_concept';
    }
    
    formatMedicalResponse(mcpResponse, queryType) {
        if (!mcpResponse || typeof mcpResponse === 'string') {
            return mcpResponse || 'I apologize, but I couldn\'t generate a comprehensive response right now.';
        }
        
        // Add MCAT-specific context to responses
        let formattedResponse = mcpResponse;
        
        // Add helpful MCAT study tips based on query type
        const studyTips = {
            'medical_concept': '💡 **MCAT Study Tip**: Focus on understanding mechanisms rather than memorizing facts.',
            'pubmed_research': '📚 **Research Note**: MCAT questions often reference current medical research findings.',
            'study_planning': '⏰ **Study Strategy**: Break complex topics into manageable daily study sessions.',
            'terminology': '🔬 **Terminology Tip**: Understanding root words helps with unfamiliar medical terms on the MCAT.'
        };
        
        if (studyTips[queryType]) {
            formattedResponse += `\n\n${studyTips[queryType]}`;
        }
        
        return formattedResponse;
    }

    // 515+ Progress Tracking System Methods
    
    trackStudySession(sessionId, topic, duration, questionType, isCorrect = null) {
        const now = new Date();
        const hour = now.getHours();
        
        // Initialize session data if not exists
        if (!this.progressTracking.sessionData.has(sessionId)) {
            this.progressTracking.sessionData.set(sessionId, {
                sessionsToday: 0,
                studyTime: 0,
                topicsStudied: new Set(),
                earlyMorningSession: false,
                biochemistryTime: 0,
                lastActive: now
            });
        }
        
        const sessionData = this.progressTracking.sessionData.get(sessionId);
        
        // Track early morning sessions (515+ habit)
        if (hour >= 7 && hour <= 9) {
            sessionData.earlyMorningSession = true;
            this.progressTracking.studyMetrics.earlyMorningStudySessions++;
        }
        
        // Track study time and topics
        sessionData.studyTime += duration || 5; // Assume 5 min if not specified
        sessionData.topicsStudied.add(topic);
        
        // Track biochemistry focus (515+ priority)
        if (this.isBiochemistryQuery(topic)) {
            sessionData.biochemistryTime += duration || 5;
        }
        
        // Update topic mastery
        this.updateTopicMastery(topic, isCorrect, questionType);
        
        // Update global metrics
        this.updateStudyMetrics(sessionData);
        
        console.log(`📊 Progress tracked: ${topic} (${duration || 5}min)`);
    }
    
    updateTopicMastery(topic, isCorrect, questionType) {
        // Determine subject area
        const subject = this.categorizeTopicBySubject(topic);
        
        if (!this.progressTracking.topicMastery[subject]) {
            this.progressTracking.topicMastery[subject] = {};
        }
        
        if (!this.progressTracking.topicMastery[subject][topic]) {
            this.progressTracking.topicMastery[subject][topic] = {
                understanding: 50, // Start at 50%
                lastStudied: new Date(),
                mistakes: [],
                detailLevel: 'basic'
            };
        }
        
        const topicData = this.progressTracking.topicMastery[subject][topic];
        
        // Update understanding based on performance
        if (isCorrect === true) {
            topicData.understanding = Math.min(100, topicData.understanding + 10);
        } else if (isCorrect === false) {
            topicData.understanding = Math.max(0, topicData.understanding - 5);
            topicData.mistakes.push({
                date: new Date(),
                type: questionType || 'unknown'
            });
        }
        
        topicData.lastStudied = new Date();
        
        // Upgrade detail level for high-performing areas
        if (topicData.understanding >= 80) {
            topicData.detailLevel = '515+';
        }
    }
    
    categorizeTopicBySubject(topic) {
        const topicLower = topic.toLowerCase();
        
        if (this.isBiochemistryQuery(topic)) return 'biochemistry';
        if (topicLower.includes('psychology') || topicLower.includes('behavior')) return 'psychology';
        if (topicLower.includes('physics') || topicLower.includes('force') || topicLower.includes('energy')) return 'physics';
        if (topicLower.includes('chemistry') || topicLower.includes('organic') || topicLower.includes('acid')) return 'chemistry';
        if (topicLower.includes('biology') || topicLower.includes('cell') || topicLower.includes('genetics')) return 'biology';
        
        return 'general';
    }
    
    updateStudyMetrics(sessionData) {
        // Calculate biochemistry focus percentage
        if (sessionData.studyTime > 0) {
            this.progressTracking.studyMetrics.biochemistryFocusPercentage = 
                (sessionData.biochemistryTime / sessionData.studyTime) * 100;
        }
        
        // Update total study time
        this.progressTracking.studyMetrics.totalStudyTime += 5; // Increment by session
        
        // Generate recommendations
        this.generateProgressRecommendations();
    }
    
    generateProgressRecommendations() {
        const metrics = this.progressTracking.studyMetrics;
        const recommendations = [];
        
        // Check biochemistry focus (should be 40%+ for 515+ scores)
        if (metrics.biochemistryFocusPercentage < 40) {
            recommendations.push({
                priority: 'HIGH',
                category: '515+ Strategy',
                message: `🧬 Increase biochemistry study time to 40%+ (currently ${Math.round(metrics.biochemistryFocusPercentage)}%). This is the highest yield topic for 515+ scores.`,
                action: 'Focus next 3 sessions on metabolism, enzyme kinetics, and protein structure.'
            });
        }
        
        // Check early morning sessions
        if (metrics.earlyMorningStudySessions < 3) {
            recommendations.push({
                priority: 'MEDIUM',
                category: '515+ Habit',
                message: '⏰ 515+ scorers typically start studying at 8am to match MCAT testing time.',
                action: 'Schedule next session for 8:00 AM to build this habit.'
            });
        }
        
        // Check for detailed explanations
        if (metrics.detailedExplanationsRequested < 5) {
            recommendations.push({
                priority: 'HIGH',
                category: '515+ Depth',
                message: '📚 Request more detailed explanations. "Little details" differentiate 515+ from 510-514 scores.',
                action: 'Ask "explain this in 515+ detail" or "what clinical correlations should I know?"'
            });
        }
        
        this.progressTracking.performanceAnalytics.recommendations = recommendations;
        this.progressTracking.performanceAnalytics.lastUpdated = new Date();
    }
    
    getProgressReport(sessionId) {
        const sessionData = this.progressTracking.sessionData.get(sessionId) || {};
        const metrics = this.progressTracking.studyMetrics;
        const recommendations = this.progressTracking.performanceAnalytics.recommendations;
        
        return {
            sessionSummary: {
                studyTimeToday: sessionData.studyTime || 0,
                topicsStudied: Array.from(sessionData.topicsStudied || []),
                biochemistryFocus: `${Math.round(metrics.biochemistryFocusPercentage || 0)}%`,
                earlyMorningSession: sessionData.earlyMorningSession || false
            },
            overall515Performance: {
                totalStudyTime: metrics.totalStudyTime,
                biochemistryEmphasis: metrics.biochemistryFocusPercentage >= 40 ? '✅ Strong' : '⚠️ Needs Improvement',
                earlyMorningSessions: metrics.earlyMorningStudySessions,
                detailedFocus: metrics.detailedExplanationsRequested >= 5 ? '✅ Strong' : '⚠️ Needs Improvement'
            },
            recommendations: recommendations,
            next515Steps: this.getNext515Steps()
        };
    }
    
    getNext515Steps() {
        const biochemFocus = this.progressTracking.studyMetrics.biochemistryFocusPercentage;
        
        if (biochemFocus < 30) {
            return [
                '🧬 Start with glycolysis pathway (highest yield)',
                '⚗️ Master enzyme kinetics (Km, Vmax concepts)',
                '🏥 Learn clinical correlations for each pathway'
            ];
        } else if (biochemFocus < 50) {
            return [
                '🔬 Deepen protein structure understanding',
                '🧪 Connect pathways (how they integrate)',
                '📊 Practice quantitative problems'
            ];
        } else {
            return [
                '🎯 Perfect the "little details" that differentiate 515+',
                '🏥 Master clinical applications',
                '🧠 Focus on cross-topic integration'
            ];
        }
    }

    // 515+ Study Pathways and Recommendations
    
    generate515StudyPathway(currentLevel = 'beginner', timeframe = '3months', focusAreas = []) {
        const pathways = {
            biochemistry515: {
                foundation: [
                    {
                        week: 1,
                        topic: 'Glycolysis Mastery',
                        objectives: [
                            'Memorize all 10 steps with enzyme names',
                            'Understand rate-limiting steps (hexokinase, PFK-1, pyruvate kinase)',
                            'Learn clinical correlations (diabetes, cancer metabolism)',
                            'Master regulation (ATP inhibition, AMP activation)'
                        ],
                        resources: '🧬 Use Claude for detailed enzyme kinetics explanations',
                        testableDetails: 'Know specific Km values and enzyme deficiency diseases'
                    },
                    {
                        week: 2,
                        topic: 'Citric Acid Cycle + Electron Transport',
                        objectives: [
                            'Connect glycolysis → pyruvate → acetyl-CoA → TCA',
                            'Understand anaplerotic reactions',
                            'Master Complex I-IV functions and H+ pumping',
                            'Calculate P/O ratios (NADH = 2.5, FADH2 = 1.5 ATP)'
                        ],
                        resources: '🏥 Focus on clinical correlations (cyanide, oligomycin)',
                        testableDetails: 'Rotenone inhibits Complex I, antimycin A inhibits Complex III'
                    }
                ],
                intermediate: [
                    {
                        week: 3,
                        topic: 'Protein Structure-Function',
                        objectives: [
                            'Master quaternary structure changes (hemoglobin)',
                            'Understand allosteric regulation',
                            'Learn protein folding pathways',
                            'Connect structure to clinical diseases'
                        ],
                        resources: '🔬 Claude provides excellent protein folding explanations',
                        testableDetails: 'Sickle cell = single amino acid change → polymerization'
                    },
                    {
                        week: 4,
                        topic: 'Enzyme Kinetics Deep Dive',
                        objectives: [
                            'Master Michaelis-Menten equation applications',
                            'Distinguish competitive vs. noncompetitive inhibition',
                            'Understand cooperativity and sigmoidal curves',
                            'Apply kinetics to drug mechanisms'
                        ],
                        resources: '📊 Practice quantitative problems daily',
                        testableDetails: 'Km = [S] when v = Vmax/2, Hill coefficient > 1 = positive cooperativity'
                    }
                ],
                advanced515: [
                    {
                        week: 5,
                        topic: 'Metabolic Integration',
                        objectives: [
                            'Connect all major metabolic pathways',
                            'Understand tissue-specific metabolism',
                            'Master hormonal regulation (insulin, glucagon)',
                            'Learn pathological states (diabetes, starvation)'
                        ],
                        resources: '🧠 Focus on "little details" that differentiate 515+ scores',
                        testableDetails: 'Glucose-6-phosphatase only in liver/kidneys, muscle lacks it'
                    },
                    {
                        week: 6,
                        topic: 'Clinical Applications Mastery',
                        objectives: [
                            'Connect biochemistry to disease mechanisms',
                            'Understand drug target mechanisms',
                            'Master genetic disorders at molecular level',
                            'Apply concepts to novel scenarios'
                        ],
                        resources: '🏥 Use clinical vignettes for practice',
                        testableDetails: 'Aspirin irreversibly acetylates COX enzymes'
                    }
                ]
            }
        };
        
        const studySchedule = this.customizePathwayForUser(pathways.biochemistry515, currentLevel, timeframe, focusAreas);
        return {
            title: '515+ Biochemistry Mastery Pathway',
            description: 'Systematic approach to master the highest-yield MCAT topic for 515+ scores',
            totalWeeks: 6,
            focusRatio: 'Biochemistry 50%, Other topics 50%',
            schedule: studySchedule,
            dailySchedule: this.generate515DailySchedule(),
            successMetrics: {
                biochemistryMastery: '90%+ understanding',
                clinicalCorrelations: 'Know 50+ disease mechanisms',
                enzymeKinetics: 'Solve quantitative problems confidently',
                integration: 'Connect pathways fluently'
            }
        };
    }
    
    customizePathwayForUser(basePathway, currentLevel, timeframe, focusAreas) {
        let customizedSchedule = [];
        
        if (currentLevel === 'beginner') {
            customizedSchedule = [...basePathway.foundation, ...basePathway.intermediate, ...basePathway.advanced515];
        } else if (currentLevel === 'intermediate') {
            customizedSchedule = [...basePathway.intermediate, ...basePathway.advanced515];
        } else {
            customizedSchedule = basePathway.advanced515;
        }
        
        // Adjust timeframe
        if (timeframe === '2months') {
            customizedSchedule = customizedSchedule.map(week => ({...week, duration: '1.5 weeks'}));
        } else if (timeframe === '6months') {
            customizedSchedule = customizedSchedule.map(week => ({...week, duration: '2 weeks'}));
        }
        
        return customizedSchedule;
    }
    
    generate515DailySchedule() {
        return {
            earlyMorning: {
                time: '8:00 AM - 10:00 AM',
                activity: 'Biochemistry deep dive (matches MCAT timing)',
                focus: 'New material or challenging concepts',
                tip: 'Peak cognitive performance for 515+ content'
            },
            midMorning: {
                time: '10:30 AM - 12:00 PM',
                activity: 'Practice problems and application',
                focus: 'Apply morning concepts to passages',
                tip: 'Use both Claude and practice questions'
            },
            afternoon: {
                time: '2:00 PM - 4:00 PM',
                activity: 'Other MCAT subjects (Biology, Chemistry)',
                focus: 'Maintain other areas while prioritizing biochem',
                tip: 'Connect other subjects back to biochemistry when possible'
            },
            evening: {
                time: '7:00 PM - 8:00 PM',
                activity: 'Review and memory consolidation',
                focus: 'Flashcards, key facts, clinical correlations',
                tip: 'Use spaced repetition for long-term retention'
            }
        };
    }

    getEnhancedFallbackTutorResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Enhanced subject-specific responses with MCAT context
        if (lowerMessage.includes('cellular respiration') || lowerMessage.includes('respiration')) {
            return `**Cellular Respiration** is the process by which cells break down glucose to produce ATP energy. 

**Key MCAT Concepts:**
- **Location**: Glycolysis (cytoplasm), Citric Acid Cycle & ETC (mitochondria)
- **Overall equation**: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP
- **ATP yield**: ~30-32 ATP molecules per glucose

💡 **MCAT Study Tip**: Focus on the connection between cellular respiration and metabolic pathways.`;
        }
        
        if (lowerMessage.includes('organic chemistry') || lowerMessage.includes('reactions')) {
            return `**Organic Chemistry** for the MCAT focuses on functional groups and reaction mechanisms.

**Key Reaction Types:**
- **Substitution**: SN1 (carbocation) vs SN2 (backside attack)
- **Elimination**: E1 vs E2 mechanisms
- **Addition**: Alkene reactions, Markovnikov's rule
- **Oxidation/Reduction**: Alcohols ↔ Aldehydes/Ketones

💡 **MCAT Study Tip**: Practice drawing mechanisms and predicting stereochemistry outcomes.`;
        }
        
        if (lowerMessage.includes('physics') || lowerMessage.includes('solve')) {
            return `**Physics Problem Solving** for the MCAT:

**Strategy:**
1. **Identify** what's given and what you need to find
2. **Choose** the right equation or principle
3. **Check units** and conversions
4. **Draw diagrams** when helpful

**Key Areas**: Mechanics, Waves, Electricity, Optics with biological applications

💡 **MCAT Study Tip**: Focus on conceptual understanding over complex calculations.`;
        }
        
        if (lowerMessage.includes('psychology') || lowerMessage.includes('psych') || lowerMessage.includes('behavior')) {
            return `**Psychology & Sociology** covers behavior and social factors affecting health.

**Major Topics:**
- **Learning & Memory**: Classical/operant conditioning, memory formation
- **Social Psychology**: Attitudes, conformity, group dynamics
- **Research Methods**: Experimental design, statistics
- **Development**: Piaget's stages, attachment theory

💡 **MCAT Study Tip**: Connect psychological concepts to healthcare scenarios.`;
        }
        
        if (lowerMessage.includes('study') || lowerMessage.includes('strategy') || lowerMessage.includes('plan')) {
            return `**Effective MCAT Study Strategies:**

**Core Principles:**
- **Active Recall**: Test yourself frequently
- **Spaced Repetition**: Review material at increasing intervals
- **Practice Tests**: Use AAMC materials regularly
- **Cross-Subject Integration**: Connect concepts across sciences

**Daily Structure:**
1. Content review (2-3 hours)
2. Practice problems (1-2 hours)
3. Review mistakes (30 minutes)

⏰ **Study Strategy**: Consistency is more important than marathon sessions.`;
        }
        
        if (lowerMessage.includes('elaboration likelihood model') || lowerMessage.includes('elm')) {
            return `**Elaboration Likelihood Model (ELM)** - Key Psychology/Sociology concept for MCAT:

**Two Routes of Persuasion:**
- **Central Route**: High elaboration, careful evaluation of arguments, lasting attitude change
- **Peripheral Route**: Low elaboration, focus on superficial cues (source attractiveness, credibility), temporary change

**Key Factors:**
- **Motivation**: Personal relevance, need for cognition  
- **Ability**: Knowledge, time, cognitive resources

**MCAT Application**: Understanding how people process health messages, medical compliance, patient education

💡 **MCAT Study Tip**: Connect to health behavior change and doctor-patient communication scenarios.`;
        }
        
        if (lowerMessage.includes('keq') || lowerMessage.includes('equilibrium constant') || lowerMessage.includes('k eq')) {
            return `**Equilibrium Constant (Keq)** - Critical General Chemistry concept for MCAT:

**What it is:**
- **Keq = [products]/[reactants]** at equilibrium (concentrations raised to stoichiometric coefficients)
- **Temperature dependent**: Only changes when temperature changes

**What it tells you:**
- **Keq > 1**: Favors products (reaction proceeds forward)
- **Keq < 1**: Favors reactants (reaction proceeds backward)  
- **Keq = 1**: Equal concentrations of products and reactants

**MCAT Applications:**
- **Acid-base equilibria**: Ka, Kb, Kw relationships
- **Solubility**: Ksp calculations
- **Buffer systems**: Henderson-Hasselbalch equation

💡 **MCAT Study Tip**: Practice calculating Keq from ICE tables and connecting to Le Châtelier's principle.`;
        }
        
        // Default enhanced response
        return `I understand you're asking about "${message}" in the context of MCAT preparation.

**General MCAT Study Approach:**
- **Understand, don't memorize**: Focus on underlying mechanisms
- **Practice actively**: Use flashcards, practice problems, and teach-back methods
- **Connect concepts**: Link topics across biology, chemistry, physics, and psychology
- **Use official materials**: AAMC practice tests and question banks are essential

**Specific Help**: Could you clarify which aspect of this topic you'd like me to focus on? (e.g., mechanism, clinical relevance, common MCAT question types)

🎓 **Remember**: The MCAT tests critical thinking and application, not just factual recall.`;
    }

    // Legacy fallback method (kept for compatibility)
    getFallbackTutorResponse(message) {
        return this.getEnhancedFallbackTutorResponse(message);
    }

    async generatePracticeQuestion(section, topic, difficulty) {
        // Enhanced question generation using MCP server
        try {
            // Get concept explanation first
            const explanation = await this.callMCPTool('get_medical_concept_explanation', {
                concept: topic,
                complexity_level: difficulty
            });

            // Get section strategy
            const strategy = await this.callMCPTool('get_mcat_question_strategy', {
                section: section
            });

            // Create practice question based on MCP data
            return {
                section: section,
                topic: topic,
                difficulty: difficulty,
                question: `Based on the concept of ${topic}, analyze the following scenario...`,
                options: [
                    { id: 'A', text: 'Option A - Generated based on common misconception' },
                    { id: 'B', text: 'Option B - Correct answer with proper reasoning' },
                    { id: 'C', text: 'Option C - Plausible distractor' },
                    { id: 'D', text: 'Option D - Another plausible distractor' }
                ],
                correct_answer: 'B',
                explanation: {
                    correct: `Option B is correct because... ${explanation}`,
                    wrong: {
                        A: 'This is incorrect because it confuses...',
                        C: 'This is a common misconception that...',
                        D: 'This answer fails to consider...'
                    }
                },
                strategy_tip: strategy,
                related_concepts: ['Related concept 1', 'Related concept 2'],
                difficulty_level: difficulty
            };
        } catch (error) {
            console.error('Error generating practice question:', error);
            throw error;
        }
    }
    
    async generateSubjectStudyPlan(subject) {
        try {
            // Generate adaptive study recommendations for the subject
            const recommendations = [
                `📚 Start with foundational concepts in ${subject}`,
                `🎯 Focus on high-yield topics that appear frequently on MCAT`,
                `📝 Practice with AAMC materials for authentic question types`,
                `🔄 Use spaced repetition for long-term retention`,
                `💡 Connect concepts to clinical applications for deeper understanding`
            ];
            return recommendations.join('\n');
        } catch (error) {
            return `Study plan for ${subject} - Focus on core concepts and practice questions.`;
        }
    }
    
    getSubjectTopics(subject) {
        const subjectTopics = {
            'General Chemistry': [
                'Atomic Structure', 'Chemical Bonding', 'Thermodynamics', 
                'Kinetics', 'Equilibrium', 'Acids and Bases', 'Electrochemistry'
            ],
            'Organic Chemistry': [
                'Structure and Bonding', 'Stereochemistry', 'Reactions and Mechanisms',
                'Spectroscopy', 'Functional Groups', 'Synthesis'
            ],
            'Physics': [
                'Mechanics', 'Thermodynamics', 'Waves and Sound',
                'Electricity and Magnetism', 'Optics', 'Atomic Physics'
            ],
            'Biology': [
                'Cell Biology', 'Molecular Biology', 'Genetics',
                'Evolution', 'Animal Systems', 'Plant Biology'
            ],
            'Biochemistry': [
                'Protein Structure and Function', 'Enzyme Kinetics', 'Metabolism',
                'Nucleic Acids', 'Cell Signaling', 'Bioenergetics'
            ],
            'Psychology': [
                'Learning and Memory', 'Cognition', 'Personality',
                'Development', 'Social Psychology', 'Research Methods'
            ],
            'Sociology': [
                'Social Stratification', 'Healthcare Systems', 'Demographics',
                'Social Institutions', 'Culture', 'Social Change'
            ],
            'CARS': [
                'Reading Strategies', 'Passage Analysis', 'Critical Reasoning',
                'Main Ideas', 'Author Perspective', 'Argument Evaluation'
            ]
        };
        
        return subjectTopics[subject] || ['Fundamental Concepts', 'Advanced Topics', 'Practice Applications'];
    }
    
    getFallbackContent(subject) {
        return {
            message: 'Content integration in progress',
            description: `We're working on loading comprehensive ${subject} content from our medical education database.`,
            status: 'loading',
            available_soon: true
        };
    }
    
    getStudyTips(topic) {
        return [
            `Create concept maps to visualize ${topic} relationships`,
            `Use active recall techniques when studying ${topic}`,
            `Connect ${topic} to real-world medical applications`,
            `Practice explaining ${topic} in simple terms`
        ];
    }
    
    getRelatedConcepts(subject, topic) {
        // This could be enhanced with MCP tool calls for better accuracy
        return [
            `${topic} fundamentals`,
            `Advanced ${topic} applications`,
            `${topic} in clinical practice`,
            `${topic} research trends`
        ];
    }

    // Helper functions for enhanced question system
    async generateEnhancedQuestion(filters) {
        const topic = filters.topic || 'amino_acids';
        const difficulty = filters.difficulty || 'intermediate';
        const type = filters.type || 'passage';

        if (!this.questionGenerator) {
            return this.generateFallbackQuestion(topic, difficulty, type);
        }

        return await this.questionGenerator.generateBiochemistryQuestion(topic, difficulty, type);
    }

    generateFallbackQuestion(topic, difficulty, type) {
        return {
            id: `fallback_${Date.now()}`,
            topic: topic,
            difficulty: difficulty,
            type: type,
            question: `What is the significance of ${topic} in biochemistry?`,
            options: {
                A: `${topic} is primarily involved in energy metabolism`,
                B: `${topic} serves as a structural component`,
                C: `${topic} functions in cellular signaling`,
                D: `${topic} is essential for protein synthesis`
            },
            correct_answer: 'A',
            explanation: `This is a fallback question for ${topic}. For detailed explanations, the AI system will provide comprehensive analysis.`,
            study_resources: [
                {
                    title: "Khan Academy MCAT",
                    url: "https://www.khanacademy.org/test-prep/mcat",
                    type: "video"
                }
            ],
            created_at: new Date().toISOString()
        };
    }

    calculateTypeStats(questions) {
        if (!Array.isArray(questions)) return {};
        
        const stats = {};
        questions.forEach(question => {
            const type = question.type || 'unknown';
            stats[type] = (stats[type] || 0) + 1;
        });
        return stats;
    }

    start() {
        app.listen(PORT, () => {
            console.log(`🚀 MCAT Victory Platform running on http://localhost:${PORT}`);
            console.log(`🧬 MCP Server Status: ${this.isConnected ? 'Connected' : 'Disconnected'}`);
        });
    }

    async shutdown() {
        console.log('🛑 Shutting down MCAT Victory Platform...');
    }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down MCAT Victory Platform...');
    await platform.shutdown();
    process.exit(0);
});

// Start the platform
const platform = new MCATVictoryPlatform();
platform.start();

export default MCATVictoryPlatform;
/**
 * Enhanced API Routes for MCAT Victory Platform
 * Implements all skill-based functionality as RESTful endpoints
 */

import express from 'express';
import {
    MedicalAccuracyValidator,
    PerformanceAnalytics,
    StudyStrategyEngine,
    CARSMasteryModule,
    PhysicsMathSolver,
    VisualLearningGenerator,
    TestDayCoach,
    EnhancedProgressTracking
} from '../modules/skill-enhancements.js';

const router = express.Router();

// Initialize all skill modules
const medicalValidator = new MedicalAccuracyValidator();
const performanceAnalytics = new PerformanceAnalytics();
const studyStrategy = new StudyStrategyEngine();
const carsModule = new CARSMasteryModule();
const physicsSolver = new PhysicsMathSolver();
const visualGenerator = new VisualLearningGenerator();
const testDayCoach = new TestDayCoach();
const progressTracker = new EnhancedProgressTracking();

// ============================================
// 1. QUESTION VALIDATION ENDPOINTS
// ============================================

// Validate a single question for medical accuracy and quality
router.post('/api/validate/question', async (req, res) => {
    try {
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({ error: 'Question data required' });
        }

        const validationResult = await medicalValidator.validateQuestion(question);

        res.json({
            status: 'success',
            validation: validationResult,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Batch validate multiple questions
router.post('/api/validate/batch', async (req, res) => {
    try {
        const { questions } = req.body;

        if (!questions || !Array.isArray(questions)) {
            return res.status(400).json({ error: 'Array of questions required' });
        }

        const results = await Promise.all(
            questions.map(q => medicalValidator.validateQuestion(q))
        );

        const summary = {
            total: questions.length,
            passed: results.filter(r => r.passed).length,
            failed: results.filter(r => !r.passed).length,
            averageScore: results.reduce((sum, r) => sum + r.score, 0) / results.length
        };

        res.json({
            status: 'success',
            results,
            summary,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// 2. PERFORMANCE ANALYTICS ENDPOINTS
// ============================================

// Get predicted MCAT score
router.post('/api/analytics/predict-score', (req, res) => {
    try {
        const { studentData } = req.body;

        if (!studentData) {
            return res.status(400).json({ error: 'Student data required' });
        }

        const prediction = performanceAnalytics.predictMCATScore(studentData);

        res.json({
            status: 'success',
            prediction,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Track real-time performance
router.post('/api/analytics/track-session', (req, res) => {
    try {
        const { sessionData } = req.body;

        if (!sessionData) {
            return res.status(400).json({ error: 'Session data required' });
        }

        const tracking = performanceAnalytics.trackRealTimePerformance(sessionData);
        const progress = progressTracker.trackProgress(sessionData);

        res.json({
            status: 'success',
            tracking,
            progress,
            insights: progressTracker.getLearningInsights(),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get performance insights
router.get('/api/analytics/insights/:studentId', (req, res) => {
    try {
        const insights = progressTracker.getLearningInsights();

        res.json({
            status: 'success',
            insights,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// 3. STUDY STRATEGY ENDPOINTS
// ============================================

// Generate personalized study plan
router.post('/api/study/generate-plan', (req, res) => {
    try {
        const { profile } = req.body;

        if (!profile) {
            return res.status(400).json({ error: 'Student profile required' });
        }

        const plan = studyStrategy.generatePersonalizedStudyPlan(profile);

        res.json({
            status: 'success',
            plan,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get spaced repetition schedule
router.post('/api/study/spaced-repetition', (req, res) => {
    try {
        const { performance, previousInterval } = req.body;

        const nextReview = studyStrategy.calculateNextReview(
            performance || 'good',
            previousInterval || 1
        );

        const dueItems = progressTracker.getSpacedRepetitionItems();

        res.json({
            status: 'success',
            nextReview,
            dueItems,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get weekly schedule
router.get('/api/study/weekly-schedule', (req, res) => {
    try {
        const profile = req.query;
        const schedule = studyStrategy.createWeeklySchedule(profile);

        res.json({
            status: 'success',
            schedule,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// 4. CARS MASTERY ENDPOINTS
// ============================================

// Analyze CARS passage
router.post('/api/cars/analyze-passage', (req, res) => {
    try {
        const { passage } = req.body;

        if (!passage) {
            return res.status(400).json({ error: 'Passage text required' });
        }

        const analysis = carsModule.analyzePassage(passage);

        res.json({
            status: 'success',
            analysis,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get CARS practice schedule
router.get('/api/cars/practice-schedule', (req, res) => {
    try {
        const schedule = carsModule.generatePracticeSchedule();

        res.json({
            status: 'success',
            schedule,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// 5. PHYSICS & MATH SOLVER ENDPOINTS
// ============================================

// Solve physics problem
router.post('/api/physics/solve', (req, res) => {
    try {
        const { problem } = req.body;

        if (!problem) {
            return res.status(400).json({ error: 'Problem statement required' });
        }

        const solution = physicsSolver.solveProblem(problem);

        res.json({
            status: 'success',
            solution,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Generate practice problems
router.post('/api/physics/generate-problems', (req, res) => {
    try {
        const { topic, difficulty } = req.body;

        const problems = physicsSolver.generatePracticeProblems(
            topic || 'kinematics',
            difficulty || 'medium'
        );

        res.json({
            status: 'success',
            problems,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get physics equations
router.get('/api/physics/equations/:topic', (req, res) => {
    try {
        const { topic } = req.params;
        const equations = physicsSolver.equations[topic] || {};

        res.json({
            status: 'success',
            topic,
            equations,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// 6. VISUAL LEARNING ENDPOINTS
// ============================================

// Generate diagram
router.post('/api/visual/generate-diagram', (req, res) => {
    try {
        const { topic, type } = req.body;

        if (!topic || !type) {
            return res.status(400).json({ error: 'Topic and type required' });
        }

        const diagram = visualGenerator.generateDiagram(topic, type);

        res.json({
            status: 'success',
            diagram,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create concept map
router.post('/api/visual/concept-map', (req, res) => {
    try {
        const { centralTopic, connections } = req.body;

        if (!centralTopic) {
            return res.status(400).json({ error: 'Central topic required' });
        }

        const conceptMap = visualGenerator.createConceptMap(
            centralTopic,
            connections || []
        );

        res.json({
            status: 'success',
            conceptMap,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create memory palace
router.post('/api/visual/memory-palace', (req, res) => {
    try {
        const { topic } = req.body;

        if (!topic) {
            return res.status(400).json({ error: 'Topic required' });
        }

        const palace = visualGenerator.createMemoryPalace(topic);

        res.json({
            status: 'success',
            palace,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// 7. TEST DAY COACH ENDPOINTS
// ============================================

// Get countdown plan
router.get('/api/test-day/countdown/:days', (req, res) => {
    try {
        const days = parseInt(req.params.days);

        if (isNaN(days) || days < 0) {
            return res.status(400).json({ error: 'Valid days until test required' });
        }

        const plan = testDayCoach.getCountdownPlan(days);

        res.json({
            status: 'success',
            daysUntilTest: days,
            plan,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get stress management techniques
router.get('/api/test-day/stress-management', (req, res) => {
    try {
        const techniques = testDayCoach.getStressManagementTechniques();

        res.json({
            status: 'success',
            techniques,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get test day checklist
router.get('/api/test-day/checklist', (req, res) => {
    try {
        const checklist = testDayCoach.getTestDayChecklist();

        res.json({
            status: 'success',
            checklist,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get emergency protocols
router.get('/api/test-day/emergency-protocols', (req, res) => {
    try {
        const protocols = testDayCoach.getEmergencyProtocols();

        res.json({
            status: 'success',
            protocols,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Generate personalized test day plan
router.post('/api/test-day/personalized-plan', (req, res) => {
    try {
        const { profile } = req.body;

        if (!profile) {
            return res.status(400).json({ error: 'Student profile required' });
        }

        const plan = testDayCoach.generatePersonalizedPlan(profile);

        res.json({
            status: 'success',
            plan,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// 8. COMPREHENSIVE ENDPOINTS
// ============================================

// Get complete student dashboard
router.get('/api/dashboard/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;

        // Gather all relevant data
        const dashboard = {
            performance: progressTracker.getLearningInsights(),
            upcomingStudy: progressTracker.getSpacedRepetitionItems(5),
            testDayStatus: testDayCoach.getCountdownPlan(30), // Example: 30 days
            recentActivity: {
                lastSession: new Date().toISOString(),
                questionsCompleted: 0,
                accuracy: 0
            }
        };

        res.json({
            status: 'success',
            studentId,
            dashboard,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get skill recommendations
router.post('/api/recommendations/skills', (req, res) => {
    try {
        const { performance, weakAreas } = req.body;

        const recommendations = {
            immediate: [],
            shortTerm: [],
            longTerm: []
        };

        // Generate recommendations based on performance
        if (weakAreas?.includes('CARS')) {
            recommendations.immediate.push({
                skill: 'CARS Mastery',
                action: 'Practice 2 passages daily',
                endpoint: '/api/cars/practice-schedule'
            });
        }

        if (weakAreas?.includes('Physics')) {
            recommendations.immediate.push({
                skill: 'Physics Solver',
                action: 'Review equations and practice problems',
                endpoint: '/api/physics/generate-problems'
            });
        }

        res.json({
            status: 'success',
            recommendations,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Health check endpoint
router.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        version: '2.0.0',
        skills: {
            medicalValidator: 'active',
            performanceAnalytics: 'active',
            studyStrategy: 'active',
            carsModule: 'active',
            physicsSolver: 'active',
            visualGenerator: 'active',
            testDayCoach: 'active',
            progressTracker: 'active'
        },
        timestamp: new Date().toISOString()
    });
});

export default router;
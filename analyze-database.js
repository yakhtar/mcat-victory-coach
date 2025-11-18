// Database Analysis Script - Question Breakdown by Category and Topic
// Analyzes the consolidated question database to show detailed statistics

import fs from 'fs';
import path from 'path';

class DatabaseAnalyzer {
    constructor() {
        this.questions = [];
        this.analysis = {
            totalQuestions: 0,
            categories: {},
            topics: {},
            difficulties: {},
            types: {},
            subjects: {}
        };
    }

    async loadDatabase() {
        try {
            // Try to load the main consolidated database
            const mainDbPath = path.join(process.cwd(), 'claude-max-questions-database.json');
            
            if (fs.existsSync(mainDbPath)) {
                console.log('📊 Loading main database...');
                const data = JSON.parse(fs.readFileSync(mainDbPath, 'utf8'));
                this.questions = Array.isArray(data) ? data : [];
                console.log(`✅ Loaded ${this.questions.length} questions from main database`);
                return;
            }

            // If main database doesn't exist, look for individual question files
            console.log('📊 Main database not found, scanning individual files...');
            const files = fs.readdirSync(process.cwd());
            const questionFiles = files.filter(file => 
                file.startsWith('claude-') && file.endsWith('.json') && 
                !file.includes('database') && !file.includes('generator')
            );

            console.log(`📁 Found ${questionFiles.length} question files`);
            
            for (const file of questionFiles) {
                try {
                    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
                    const fileQuestions = Array.isArray(data) ? data : [data];
                    this.questions.push(...fileQuestions);
                    console.log(`  ✅ ${file}: ${fileQuestions.length} questions`);
                } catch (error) {
                    console.log(`  ❌ ${file}: Error loading - ${error.message}`);
                }
            }

        } catch (error) {
            console.error('❌ Error loading database:', error.message);
        }
    }

    analyzeQuestions() {
        console.log('\n🔍 Analyzing question database...');
        
        this.analysis.totalQuestions = this.questions.length;
        
        for (const question of this.questions) {
            // Extract category from topic or ID
            let category = 'Unknown';
            const topic = question.topic || '';
            const subject = question.subject || '';
            const id = question.id || '';

            // Determine category based on topic/subject
            if (topic.includes('biochem') || id.includes('biochem') || subject === 'biochemistry') {
                category = 'Biochemistry';
            } else if (topic.includes('chemistry') || id.includes('chemistry') || subject === 'chemistry') {
                if (topic.includes('organic') || id.includes('organic')) {
                    category = 'Organic Chemistry';
                } else {
                    category = 'General Chemistry';
                }
            } else if (topic.includes('biology') || id.includes('biology') || subject === 'biology') {
                category = 'Biology';
            } else if (topic.includes('physics') || id.includes('physics') || subject === 'physics') {
                category = 'Physics';
            } else if (topic.includes('psychology') || id.includes('psyc') || subject === 'psychology') {
                category = 'Psychology';
            } else if (topic.includes('sociology') || id.includes('soc') || subject === 'sociology') {
                category = 'Sociology';
            } else if (topic.includes('cell') || topic.includes('molecular') || topic.includes('genetics') || topic.includes('evolution')) {
                category = 'Biology';
            } else if (topic.includes('amino_acids') || topic.includes('metabolism') || topic.includes('enzyme')) {
                category = 'Biochemistry';
            }

            // Count by category
            if (!this.analysis.categories[category]) {
                this.analysis.categories[category] = 0;
            }
            this.analysis.categories[category]++;

            // Count by topic
            const topicName = topic || 'Unknown';
            if (!this.analysis.topics[topicName]) {
                this.analysis.topics[topicName] = 0;
            }
            this.analysis.topics[topicName]++;

            // Count by difficulty
            const difficulty = question.difficulty || 'Unknown';
            if (!this.analysis.difficulties[difficulty]) {
                this.analysis.difficulties[difficulty] = 0;
            }
            this.analysis.difficulties[difficulty]++;

            // Count by type
            const type = question.type || 'Unknown';
            if (!this.analysis.types[type]) {
                this.analysis.types[type] = 0;
            }
            this.analysis.types[type]++;

            // Count by subject (if available)
            if (subject) {
                if (!this.analysis.subjects[subject]) {
                    this.analysis.subjects[subject] = 0;
                }
                this.analysis.subjects[subject]++;
            }
        }
    }

    generateReport() {
        console.log('\n' + '='.repeat(80));
        console.log('📊 MCAT QUESTION DATABASE ANALYSIS REPORT');
        console.log('='.repeat(80));
        
        console.log(`\n🎯 TOTAL QUESTIONS: ${this.analysis.totalQuestions.toLocaleString()}`);
        
        // Category breakdown
        console.log('\n📚 BREAKDOWN BY MAJOR CATEGORY:');
        console.log('-'.repeat(50));
        const sortedCategories = Object.entries(this.analysis.categories)
            .sort(([,a], [,b]) => b - a);
            
        for (const [category, count] of sortedCategories) {
            const percentage = ((count / this.analysis.totalQuestions) * 100).toFixed(1);
            console.log(`${category.padEnd(20)} | ${count.toString().padStart(6)} | ${percentage.padStart(5)}%`);
        }
        
        // Difficulty breakdown
        console.log('\n🎯 BREAKDOWN BY DIFFICULTY:');
        console.log('-'.repeat(50));
        const difficultyOrder = ['foundation', 'intermediate', 'advanced', 'elite', 'Unknown'];
        for (const difficulty of difficultyOrder) {
            const count = this.analysis.difficulties[difficulty] || 0;
            if (count > 0) {
                const percentage = ((count / this.analysis.totalQuestions) * 100).toFixed(1);
                console.log(`${difficulty.padEnd(20)} | ${count.toString().padStart(6)} | ${percentage.padStart(5)}%`);
            }
        }
        
        // Type breakdown
        console.log('\n📝 BREAKDOWN BY QUESTION TYPE:');
        console.log('-'.repeat(50));
        const sortedTypes = Object.entries(this.analysis.types)
            .sort(([,a], [,b]) => b - a);
            
        for (const [type, count] of sortedTypes) {
            const percentage = ((count / this.analysis.totalQuestions) * 100).toFixed(1);
            console.log(`${type.padEnd(20)} | ${count.toString().padStart(6)} | ${percentage.padStart(5)}%`);
        }

        // Top topics
        console.log('\n🔥 TOP 20 TOPICS BY QUESTION COUNT:');
        console.log('-'.repeat(60));
        const sortedTopics = Object.entries(this.analysis.topics)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 20);
            
        for (const [topic, count] of sortedTopics) {
            const percentage = ((count / this.analysis.totalQuestions) * 100).toFixed(1);
            const displayTopic = topic.length > 35 ? topic.substring(0, 32) + '...' : topic;
            console.log(`${displayTopic.padEnd(38)} | ${count.toString().padStart(6)} | ${percentage.padStart(5)}%`);
        }

        // Subject breakdown (if available)
        if (Object.keys(this.analysis.subjects).length > 0) {
            console.log('\n🧬 BREAKDOWN BY SUBJECT:');
            console.log('-'.repeat(50));
            const sortedSubjects = Object.entries(this.analysis.subjects)
                .sort(([,a], [,b]) => b - a);
                
            for (const [subject, count] of sortedSubjects) {
                const percentage = ((count / this.analysis.totalQuestions) * 100).toFixed(1);
                console.log(`${subject.padEnd(20)} | ${count.toString().padStart(6)} | ${percentage.padStart(5)}%`);
            }
        }

        console.log('\n' + '='.repeat(80));
        console.log('📊 Analysis Complete - Database Report Generated');
        console.log('='.repeat(80));

        // Save detailed report
        this.saveDetailedReport();
    }

    saveDetailedReport() {
        const reportData = {
            timestamp: new Date().toISOString(),
            totalQuestions: this.analysis.totalQuestions,
            categories: this.analysis.categories,
            topics: this.analysis.topics,
            difficulties: this.analysis.difficulties,
            types: this.analysis.types,
            subjects: this.analysis.subjects,
            topTopics: Object.entries(this.analysis.topics)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 50)
                .reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {})
        };

        const filename = `database-analysis-${new Date().toISOString().split('T')[0]}.json`;
        fs.writeFileSync(filename, JSON.stringify(reportData, null, 2));
        console.log(`💾 Detailed report saved to: ${filename}`);
    }

    async run() {
        console.log('🚀 Starting MCAT Database Analysis...\n');
        await this.loadDatabase();
        this.analyzeQuestions();
        this.generateReport();
    }
}

// Run the analysis
const analyzer = new DatabaseAnalyzer();
analyzer.run().catch(console.error);
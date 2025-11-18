// Analyze Main Database File - The actual database used by the server
import fs from 'fs';

class MainDatabaseAnalyzer {
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

    async loadMainDatabase() {
        try {
            console.log('📊 Loading main database from data/question-database.json...');
            const data = JSON.parse(fs.readFileSync('data/question-database.json', 'utf8'));
            this.questions = Array.isArray(data) ? data : [];
            console.log(`✅ Loaded ${this.questions.length.toLocaleString()} questions from main database`);
        } catch (error) {
            console.error('❌ Error loading main database:', error.message);
        }
    }

    analyzeQuestions() {
        console.log('\n🔍 Analyzing main database...');
        
        this.analysis.totalQuestions = this.questions.length;
        
        for (const question of this.questions) {
            // Extract category
            let category = 'Unknown';
            const topic = question.topic || '';
            const subject = question.subject || '';
            const id = question.id || '';

            // Determine category
            if (topic.includes('biochem') || id.includes('biochem') || subject === 'biochemistry') {
                category = 'Biochemistry';
            } else if (topic.includes('organic') || id.includes('organic')) {
                category = 'Organic Chemistry';
            } else if (topic.includes('chemistry') || id.includes('chemistry') || subject === 'chemistry') {
                category = 'General Chemistry';
            } else if (topic.includes('biology') || id.includes('biology') || subject === 'biology') {
                category = 'Biology';
            } else if (topic.includes('physics') || id.includes('physics') || subject === 'physics') {
                category = 'Physics';
            } else if (topic.includes('psychology') || id.includes('psyc') || subject === 'psychology') {
                category = 'Psychology';
            } else if (topic.includes('sociology') || subject === 'sociology') {
                category = 'Sociology';
            } else if (topic.includes('cell') || topic.includes('molecular') || topic.includes('genetics') || topic.includes('evolution')) {
                category = 'Biology';
            } else if (topic.includes('amino_acids') || topic.includes('metabolism') || topic.includes('enzyme')) {
                category = 'Biochemistry';
            }

            // Count by category
            this.analysis.categories[category] = (this.analysis.categories[category] || 0) + 1;

            // Count by topic (limit to avoid clutter)
            const topicName = topic || 'Unknown';
            this.analysis.topics[topicName] = (this.analysis.topics[topicName] || 0) + 1;

            // Count by difficulty
            const difficulty = question.difficulty || 'Unknown';
            this.analysis.difficulties[difficulty] = (this.analysis.difficulties[difficulty] || 0) + 1;

            // Count by type
            const type = question.type || 'Unknown';
            this.analysis.types[type] = (this.analysis.types[type] || 0) + 1;

            // Count by subject
            if (subject) {
                this.analysis.subjects[subject] = (this.analysis.subjects[subject] || 0) + 1;
            }
        }
    }

    generateReport() {
        console.log('\n' + '='.repeat(120));
        console.log('📊 MAIN DATABASE ANALYSIS REPORT - ACTUAL PLATFORM DATA');
        console.log('='.repeat(120));
        
        console.log(`\n🎯 TOTAL QUESTIONS: ${this.analysis.totalQuestions.toLocaleString()}`);
        
        // Category breakdown
        console.log('\n📚 BREAKDOWN BY MAJOR CATEGORY:');
        console.log('-'.repeat(80));
        const sortedCategories = Object.entries(this.analysis.categories)
            .sort(([,a], [,b]) => b - a);
            
        for (const [category, count] of sortedCategories) {
            const percentage = ((count / this.analysis.totalQuestions) * 100).toFixed(1);
            const barLength = Math.floor((count / Math.max(...Object.values(this.analysis.categories))) * 40);
            const bar = '█'.repeat(barLength);
            console.log(`${category.padEnd(20)} | ${count.toString().padStart(7)} | ${percentage.padStart(6)}% | ${bar}`);
        }
        
        // Difficulty breakdown
        console.log('\n🎯 BREAKDOWN BY DIFFICULTY:');
        console.log('-'.repeat(80));
        const difficultyOrder = ['foundation', 'intermediate', 'advanced', 'elite', 'Unknown'];
        for (const difficulty of difficultyOrder) {
            const count = this.analysis.difficulties[difficulty] || 0;
            if (count > 0) {
                const percentage = ((count / this.analysis.totalQuestions) * 100).toFixed(1);
                const barLength = Math.floor((count / Math.max(...Object.values(this.analysis.difficulties))) * 30);
                const bar = '█'.repeat(barLength);
                console.log(`${difficulty.padEnd(20)} | ${count.toString().padStart(7)} | ${percentage.padStart(6)}% | ${bar}`);
            }
        }
        
        // Type breakdown
        console.log('\n📝 BREAKDOWN BY QUESTION TYPE:');
        console.log('-'.repeat(80));
        const sortedTypes = Object.entries(this.analysis.types)
            .sort(([,a], [,b]) => b - a);
            
        for (const [type, count] of sortedTypes) {
            const percentage = ((count / this.analysis.totalQuestions) * 100).toFixed(1);
            const barLength = Math.floor((count / Math.max(...Object.values(this.analysis.types))) * 30);
            const bar = '█'.repeat(barLength);
            console.log(`${type.padEnd(20)} | ${count.toString().padStart(7)} | ${percentage.padStart(6)}% | ${bar}`);
        }

        // Top 30 topics
        console.log('\n🔥 TOP 30 TOPICS BY QUESTION COUNT:');
        console.log('-'.repeat(100));
        const sortedTopics = Object.entries(this.analysis.topics)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 30);
            
        for (const [topic, count] of sortedTopics) {
            const percentage = ((count / this.analysis.totalQuestions) * 100).toFixed(2);
            const displayTopic = topic.length > 45 ? topic.substring(0, 42) + '...' : topic;
            console.log(`${displayTopic.padEnd(47)} | ${count.toString().padStart(6)} | ${percentage.padStart(6)}%`);
        }

        // Subject breakdown (if available)
        if (Object.keys(this.analysis.subjects).length > 0) {
            console.log('\n🧬 BREAKDOWN BY SUBJECT:');
            console.log('-'.repeat(80));
            const sortedSubjects = Object.entries(this.analysis.subjects)
                .sort(([,a], [,b]) => b - a);
                
            for (const [subject, count] of sortedSubjects) {
                const percentage = ((count / this.analysis.totalQuestions) * 100).toFixed(1);
                console.log(`${subject.padEnd(20)} | ${count.toString().padStart(7)} | ${percentage.padStart(6)}%`);
            }
        }

        console.log('\n' + '='.repeat(120));
        console.log('📊 MAIN DATABASE ANALYSIS COMPLETE - This is what powers the platform!');
        console.log('='.repeat(120));

        // Calculate some key stats
        const topCategory = sortedCategories[0];
        const topTopic = sortedTopics[0];
        
        console.log('\n📈 KEY INSIGHTS:');
        console.log(`• Largest Category: ${topCategory[0]} (${topCategory[1].toLocaleString()} questions)`);
        console.log(`• Most Popular Topic: ${topTopic[0]} (${topTopic[1].toLocaleString()} questions)`);
        console.log(`• Question Type Balance: ${Object.keys(this.analysis.types).length} different types`);
        console.log(`• Difficulty Spread: ${Object.keys(this.analysis.difficulties).length} difficulty levels`);
        
        // Save report
        const reportData = {
            timestamp: new Date().toISOString(),
            totalQuestions: this.analysis.totalQuestions,
            categories: this.analysis.categories,
            topics: Object.entries(this.analysis.topics)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 100)
                .reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {}),
            difficulties: this.analysis.difficulties,
            types: this.analysis.types,
            subjects: this.analysis.subjects
        };

        fs.writeFileSync('main-database-report.json', JSON.stringify(reportData, null, 2));
        console.log(`💾 Report saved to: main-database-report.json`);
    }

    async run() {
        console.log('🚀 Starting Main Database Analysis (Server Data)...\n');
        await this.loadMainDatabase();
        this.analyzeQuestions();
        this.generateReport();
    }
}

const analyzer = new MainDatabaseAnalyzer();
analyzer.run().catch(console.error);
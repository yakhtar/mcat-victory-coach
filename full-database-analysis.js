// Complete Database Analysis - All Question Files
// Analyzes ALL question files to get the true database size

import fs from 'fs';
import path from 'path';

class FullDatabaseAnalyzer {
    constructor() {
        this.questions = [];
        this.fileStats = [];
        this.analysis = {
            totalQuestions: 0,
            totalFiles: 0,
            categories: {},
            topics: {},
            difficulties: {},
            types: {},
            subjects: {}
        };
    }

    async loadAllQuestionFiles() {
        console.log('🔍 Scanning for all question files...');
        
        try {
            const files = fs.readdirSync(process.cwd());
            const questionFiles = files.filter(file => 
                file.startsWith('claude-') && 
                file.endsWith('.json') && 
                !file.includes('generator') &&
                !file.includes('analysis')
            );

            console.log(`📁 Found ${questionFiles.length} question files\n`);
            this.analysis.totalFiles = questionFiles.length;

            let fileCount = 0;
            for (const file of questionFiles) {
                fileCount++;
                try {
                    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
                    const fileQuestions = Array.isArray(data) ? data : [data];
                    
                    // Filter out invalid questions
                    const validQuestions = fileQuestions.filter(q => 
                        q && q.question && q.options && q.correct_answer
                    );

                    this.questions.push(...validQuestions);
                    
                    const fileInfo = {
                        filename: file,
                        questionCount: validQuestions.length,
                        category: this.getCategoryFromFilename(file)
                    };
                    this.fileStats.push(fileInfo);

                    if (fileCount % 50 === 0) {
                        console.log(`  📈 Processed ${fileCount}/${questionFiles.length} files...`);
                    }
                    
                } catch (error) {
                    console.log(`  ❌ ${file}: Error - ${error.message.substring(0, 50)}...`);
                }
            }

            console.log(`\n✅ Total files processed: ${fileCount}`);
            console.log(`✅ Total questions loaded: ${this.questions.length}`);
            
        } catch (error) {
            console.error('❌ Error scanning files:', error.message);
        }
    }

    getCategoryFromFilename(filename) {
        if (filename.includes('biochem')) return 'Biochemistry';
        if (filename.includes('organic')) return 'Organic Chemistry';
        if (filename.includes('chemistry')) return 'General Chemistry';
        if (filename.includes('physics')) return 'Physics';
        if (filename.includes('psychology')) return 'Psychology';
        if (filename.includes('biology')) return 'Biology';
        if (filename.includes('cell-biology')) return 'Biology';
        if (filename.includes('molecular-biology')) return 'Biology';
        if (filename.includes('genetics')) return 'Biology';
        if (filename.includes('evolution')) return 'Biology';
        if (filename.includes('organ-systems')) return 'Biology';
        return 'Unknown';
    }

    analyzeQuestions() {
        console.log('\n🔍 Analyzing question database...');
        
        this.analysis.totalQuestions = this.questions.length;
        
        for (const question of this.questions) {
            // Extract category
            let category = 'Unknown';
            const topic = question.topic || '';
            const subject = question.subject || '';
            const id = question.id || '';

            // Determine category based on various fields
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
            } else if (topic.includes('atomic') || topic.includes('periodic') || topic.includes('bonding')) {
                category = 'General Chemistry';
            }

            // Count by category
            this.analysis.categories[category] = (this.analysis.categories[category] || 0) + 1;

            // Count by topic
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
        console.log('\n' + '='.repeat(100));
        console.log('📊 COMPLETE MCAT QUESTION DATABASE ANALYSIS REPORT');
        console.log('='.repeat(100));
        
        console.log(`\n🎯 TOTAL QUESTIONS: ${this.analysis.totalQuestions.toLocaleString()}`);
        console.log(`📁 TOTAL FILES: ${this.analysis.totalFiles.toLocaleString()}`);
        console.log(`📊 AVERAGE QUESTIONS PER FILE: ${(this.analysis.totalQuestions / this.analysis.totalFiles).toFixed(1)}`);
        
        // Category breakdown
        console.log('\n📚 BREAKDOWN BY MAJOR CATEGORY:');
        console.log('-'.repeat(60));
        const sortedCategories = Object.entries(this.analysis.categories)
            .sort(([,a], [,b]) => b - a);
            
        for (const [category, count] of sortedCategories) {
            const percentage = ((count / this.analysis.totalQuestions) * 100).toFixed(1);
            console.log(`${category.padEnd(25)} | ${count.toString().padStart(6)} | ${percentage.padStart(6)}%`);
        }
        
        // File type breakdown
        console.log('\n📁 TOP QUESTION FILE CATEGORIES:');
        console.log('-'.repeat(60));
        const categoryFiles = {};
        this.fileStats.forEach(file => {
            categoryFiles[file.category] = (categoryFiles[file.category] || 0) + file.questionCount;
        });
        
        const sortedFileCategories = Object.entries(categoryFiles)
            .sort(([,a], [,b]) => b - a);
            
        for (const [category, count] of sortedFileCategories) {
            const percentage = ((count / this.analysis.totalQuestions) * 100).toFixed(1);
            console.log(`${category.padEnd(25)} | ${count.toString().padStart(6)} | ${percentage.padStart(6)}%`);
        }
        
        // Difficulty breakdown
        console.log('\n🎯 BREAKDOWN BY DIFFICULTY:');
        console.log('-'.repeat(60));
        const difficultyOrder = ['foundation', 'intermediate', 'advanced', 'elite', 'Unknown'];
        for (const difficulty of difficultyOrder) {
            const count = this.analysis.difficulties[difficulty] || 0;
            if (count > 0) {
                const percentage = ((count / this.analysis.totalQuestions) * 100).toFixed(1);
                console.log(`${difficulty.padEnd(25)} | ${count.toString().padStart(6)} | ${percentage.padStart(6)}%`);
            }
        }
        
        // Type breakdown
        console.log('\n📝 BREAKDOWN BY QUESTION TYPE:');
        console.log('-'.repeat(60));
        const sortedTypes = Object.entries(this.analysis.types)
            .sort(([,a], [,b]) => b - a);
            
        for (const [type, count] of sortedTypes) {
            const percentage = ((count / this.analysis.totalQuestions) * 100).toFixed(1);
            console.log(`${type.padEnd(25)} | ${count.toString().padStart(6)} | ${percentage.padStart(6)}%`);
        }

        // Top topics
        console.log('\n🔥 TOP 25 TOPICS BY QUESTION COUNT:');
        console.log('-'.repeat(70));
        const sortedTopics = Object.entries(this.analysis.topics)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 25);
            
        for (const [topic, count] of sortedTopics) {
            const percentage = ((count / this.analysis.totalQuestions) * 100).toFixed(1);
            const displayTopic = topic.length > 40 ? topic.substring(0, 37) + '...' : topic;
            console.log(`${displayTopic.padEnd(42)} | ${count.toString().padStart(6)} | ${percentage.padStart(6)}%`);
        }

        console.log('\n' + '='.repeat(100));
        console.log('📊 Complete Analysis Finished - Full Database Report Generated');
        console.log('='.repeat(100));

        // Save comprehensive report
        this.saveComprehensiveReport();
    }

    saveComprehensiveReport() {
        const reportData = {
            timestamp: new Date().toISOString(),
            totalQuestions: this.analysis.totalQuestions,
            totalFiles: this.analysis.totalFiles,
            categories: this.analysis.categories,
            topics: this.analysis.topics,
            difficulties: this.analysis.difficulties,
            types: this.analysis.types,
            subjects: this.analysis.subjects,
            fileStats: this.fileStats,
            topTopics: Object.entries(this.analysis.topics)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 100)
                .reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {}),
            summary: {
                avgQuestionsPerFile: this.analysis.totalQuestions / this.analysis.totalFiles,
                topCategory: Object.entries(this.analysis.categories).sort(([,a], [,b]) => b - a)[0],
                topTopic: Object.entries(this.analysis.topics).sort(([,a], [,b]) => b - a)[0]
            }
        };

        const filename = `complete-database-analysis-${new Date().toISOString().split('T')[0]}.json`;
        fs.writeFileSync(filename, JSON.stringify(reportData, null, 2));
        console.log(`💾 Comprehensive report saved to: ${filename}`);
    }

    async run() {
        console.log('🚀 Starting COMPLETE MCAT Database Analysis...\n');
        await this.loadAllQuestionFiles();
        this.analyzeQuestions();
        this.generateReport();
    }
}

// Run the complete analysis
const analyzer = new FullDatabaseAnalyzer();
analyzer.run().catch(console.error);
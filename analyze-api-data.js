// Analyze the actual question data from the API
import fetch from 'node-fetch';

async function analyzeDatabase() {
    console.log('🔍 Fetching questions from API to analyze distribution...\n');

    try {
        // Fetch a large sample of questions
        const response = await fetch('http://localhost:3003/api/questions?limit=2000');
        const data = await response.json();

        if (!data.success || !data.questions) {
            console.error('Failed to fetch questions');
            return;
        }

        const questions = data.questions;
        console.log(`📊 Analyzing ${questions.length} questions from API...\n`);

        // Analyze distribution
        const subjects = {};
        const topics = {};
        const difficulties = {};
        const types = {};

        for (const q of questions) {
            // Count subjects
            const subject = q.subject || 'Unknown';
            subjects[subject] = (subjects[subject] || 0) + 1;

            // Count topics
            const topic = q.topic || 'Unknown';
            topics[topic] = (topics[topic] || 0) + 1;

            // Count difficulties
            const difficulty = q.difficulty || 'Unknown';
            difficulties[difficulty] = (difficulties[difficulty] || 0) + 1;

            // Count types
            const type = q.type || 'Unknown';
            types[type] = (types[type] || 0) + 1;
        }

        // Display results
        console.log('📚 SUBJECT DISTRIBUTION:');
        console.log('-'.repeat(50));
        Object.entries(subjects)
            .sort(([,a], [,b]) => b - a)
            .forEach(([subject, count]) => {
                const percentage = ((count / questions.length) * 100).toFixed(1);
                console.log(`${subject.padEnd(20)} | ${count.toString().padStart(5)} | ${percentage.padStart(5)}%`);
            });

        console.log('\n🎯 TOP 20 TOPICS:');
        console.log('-'.repeat(50));
        Object.entries(topics)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 20)
            .forEach(([topic, count]) => {
                const percentage = ((count / questions.length) * 100).toFixed(1);
                console.log(`${topic.padEnd(30)} | ${count.toString().padStart(5)} | ${percentage.padStart(5)}%`);
            });

        console.log('\n📊 DIFFICULTY LEVELS:');
        console.log('-'.repeat(50));
        ['foundation', 'intermediate', 'advanced', 'elite'].forEach(level => {
            if (difficulties[level]) {
                const percentage = ((difficulties[level] / questions.length) * 100).toFixed(1);
                console.log(`${level.padEnd(15)} | ${difficulties[level].toString().padStart(5)} | ${percentage.padStart(5)}%`);
            }
        });

        console.log('\n📝 QUESTION TYPES:');
        console.log('-'.repeat(50));
        Object.entries(types)
            .sort(([,a], [,b]) => b - a)
            .forEach(([type, count]) => {
                const percentage = ((count / questions.length) * 100).toFixed(1);
                console.log(`${type.padEnd(20)} | ${count.toString().padStart(5)} | ${percentage.padStart(5)}%`);
            });

        // Get total from stats API for comparison
        const statsResponse = await fetch('http://localhost:3003/api/questions/stats');
        const statsData = await statsResponse.json();

        console.log('\n📈 SUMMARY:');
        console.log('-'.repeat(50));
        console.log(`Total Questions in Database: ${statsData.stats.total_questions}`);
        console.log(`Questions Analyzed: ${questions.length}`);
        console.log(`Unique Subjects: ${Object.keys(subjects).length}`);
        console.log(`Unique Topics: ${Object.keys(topics).length}`);

    } catch (error) {
        console.error('Error analyzing database:', error);
    }
}

analyzeDatabase();
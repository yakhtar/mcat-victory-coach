import fs from 'fs';

// Quick analysis of current database
const databasePath = './data/question-database.json';

try {
    console.log('📊 LOADING DATABASE...');
    const rawData = JSON.parse(fs.readFileSync(databasePath, 'utf8'));
    const questions = rawData.questions || [];
    const metadata = rawData.metadata || {};
    
    console.log('='.repeat(80));
    console.log('📈 CURRENT DATABASE STATUS');
    console.log('='.repeat(80));
    
    console.log(`🎯 Total Questions: ${questions.length.toLocaleString()}`);
    console.log(`📊 Metadata Total: ${metadata.total_questions?.toLocaleString() || 'N/A'}`);
    
    // Analyze subjects from actual questions
    const subjects = {};
    const topics = {};
    const difficulties = {};
    const types = {};
    
    questions.forEach(q => {
        // Subject analysis
        const subject = q.subject || q.category || 'unknown';
        subjects[subject] = (subjects[subject] || 0) + 1;
        
        // Topic analysis
        const topic = q.topic || 'unknown';
        topics[topic] = (topics[topic] || 0) + 1;
        
        // Difficulty analysis
        const difficulty = q.difficulty || 'unknown';
        difficulties[difficulty] = (difficulties[difficulty] || 0) + 1;
        
        // Type analysis
        const type = q.type || 'unknown';
        types[type] = (types[type] || 0) + 1;
    });
    
    console.log('\n📚 BY SUBJECT:');
    console.log('-'.repeat(50));
    Object.entries(subjects)
        .sort(([,a], [,b]) => b - a)
        .forEach(([subject, count]) => {
            const percent = ((count / questions.length) * 100).toFixed(1);
            console.log(`  ${subject.padEnd(20)}: ${count.toString().padStart(6)} (${percent}%)`);
        });
    
    console.log('\n🎯 BY DIFFICULTY:');
    console.log('-'.repeat(50));
    Object.entries(difficulties)
        .sort(([,a], [,b]) => b - a)
        .forEach(([difficulty, count]) => {
            const percent = ((count / questions.length) * 100).toFixed(1);
            console.log(`  ${difficulty.padEnd(20)}: ${count.toString().padStart(6)} (${percent}%)`);
        });
    
    console.log('\n📝 BY TYPE:');
    console.log('-'.repeat(50));
    Object.entries(types)
        .forEach(([type, count]) => {
            const percent = ((count / questions.length) * 100).toFixed(1);
            console.log(`  ${type.padEnd(20)}: ${count.toString().padStart(6)} (${percent}%)`);
        });
    
    console.log('\n🔥 TOP 20 TOPICS:');
    console.log('-'.repeat(50));
    Object.entries(topics)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 20)
        .forEach(([topic, count]) => {
            const percent = ((count / questions.length) * 100).toFixed(1);
            console.log(`  ${topic.padEnd(25)}: ${count.toString().padStart(5)} (${percent}%)`);
        });
    
    console.log('\n' + '='.repeat(80));
    
} catch (error) {
    console.error('❌ Error analyzing database:', error.message);
}
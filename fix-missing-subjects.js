import fs from 'fs';

console.log('🔧 Fixing Questions Missing Subject Fields');
console.log('='.repeat(50));

// Load the database
let database;
try {
    const data = fs.readFileSync('./data/question-database.json', 'utf8');
    database = JSON.parse(data);
} catch (err) {
    console.error('❌ Error loading database:', err.message);
    process.exit(1);
}

const questions = database.questions || [];
console.log(`📊 Total questions to check: ${questions.length}`);

// Subject classification function
function classifySubject(question, explanation, topic, id) {
    const content = `${question} ${explanation} ${topic || ''} ${id || ''}`.toLowerCase();
    
    // Biochemistry patterns
    if (content.includes('enzyme') || content.includes('metabolism') || content.includes('glycolysis') || 
        content.includes('amino acid') || content.includes('protein') || content.includes('biochem') ||
        content.includes('phosphorylation') || content.includes('atp') || content.includes('kinase')) {
        return 'biochemistry';
    }
    
    // Chemistry patterns
    if (content.includes('periodic') || content.includes('electron config') || content.includes('bond') ||
        content.includes('molecular geometry') || content.includes('pH') || content.includes('equilibrium') ||
        content.includes('chem') && !content.includes('biochem')) {
        return 'chemistry';
    }
    
    // Physics patterns
    if (content.includes('force') || content.includes('velocity') || content.includes('energy') ||
        content.includes('wave') || content.includes('electric') || content.includes('magnetic') ||
        content.includes('physics')) {
        return 'physics';
    }
    
    // Psychology patterns
    if (content.includes('behavior') || content.includes('cognitive') || content.includes('memory') ||
        content.includes('learning') || content.includes('psychology')) {
        return 'psychology';
    }
    
    // Default to biology
    return 'biology';
}

let fixed = 0;
let missingSubjects = 0;

console.log('\n🔍 Analyzing questions missing subjects...\n');

for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    
    if (!q.subject) {
        missingSubjects++;
        
        // Classify the question
        const predictedSubject = classifySubject(q.question || '', q.explanation || '', q.topic, q.id);
        
        // Add the subject field
        questions[i].subject = predictedSubject;
        questions[i]._addedSubject = true;
        fixed++;
        
        if (fixed <= 10) {
            console.log(`${fixed}. ${q.id}: Added subject → ${predictedSubject}`);
            if (q.id === 'biochem_001') {
                console.log(`   🎯 FIXED THE GLYCOLYSIS QUESTION!`);
            }
        }
    }
}

console.log('\n' + '='.repeat(50));
console.log('🔧 MISSING SUBJECTS FIX RESULTS');
console.log('='.repeat(50));

console.log(`📊 Questions missing subjects: ${missingSubjects}`);
console.log(`✅ Questions fixed: ${fixed}`);

if (fixed > 0) {
    // Create backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFilename = `question-database-before-subject-fix-${timestamp}.json`;
    fs.writeFileSync(`./data/${backupFilename}`, fs.readFileSync('./data/question-database.json'));
    
    // Save corrected database
    database.metadata.last_missing_subject_fix = new Date().toISOString();
    fs.writeFileSync('./data/question-database.json', JSON.stringify(database, null, 2));
    
    console.log(`💾 Backup created: ./data/${backupFilename}`);
    console.log(`✅ Fixed database saved to: ./data/question-database.json`);
    console.log(`\n🚀 The glycolysis question should now be properly categorized!`);
} else {
    console.log('✅ All questions already have subject fields.');
}
import fs from 'fs';

console.log('📊 MCAT Victory Platform - Real-Time Progress Monitor');
console.log('🎯 Biology Section Generation Progress Dashboard\n');

function monitorProgress() {
    try {
        const db = JSON.parse(fs.readFileSync('./data/question-database.json', 'utf-8'));
        const metadata = db.metadata;
        
        // Biology targets based on research
        const targets = {
            cell_biology: 200,
            molecular_biology: 180,
            biochemistry_integration: 170,
            organ_systems: 250,
            genetics: 120,
            evolution: 80
        };
        
        console.log('🧬 BIOLOGY SECTION PROGRESS:');
        console.log('═══════════════════════════════════════');
        
        let totalBiologyGenerated = 0;
        let totalBiologyTarget = 0;
        
        Object.entries(targets).forEach(([topic, target]) => {
            const current = metadata.categories.biology?.[topic] || 0;
            const progress = ((current / target) * 100).toFixed(1);
            const status = current >= target ? '✅' : current > 0 ? '🔄' : '⏳';
            
            console.log(`${status} ${topic.padEnd(25)}: ${current.toString().padStart(3)}/${target} (${progress}%)`);
            
            totalBiologyGenerated += current;
            totalBiologyTarget += target;
        });
        
        console.log('═══════════════════════════════════════');
        console.log(`🎯 TOTAL BIOLOGY PROGRESS: ${totalBiologyGenerated}/${totalBiologyTarget} (${((totalBiologyGenerated/totalBiologyTarget)*100).toFixed(1)}%)`);
        
        console.log('\n📈 OVERALL PLATFORM STATUS:');
        console.log('═══════════════════════════════════════');
        console.log(`Total Questions: ${metadata.total_questions}`);
        console.log(`Biochemistry: 700 ✅ (Complete)`);
        console.log(`Biology: ${totalBiologyGenerated}/1000 (${((totalBiologyGenerated/1000)*100).toFixed(1)}%)`);
        
        console.log('\n⚡ PERFORMANCE METRICS:');
        console.log('═══════════════════════════════════════');
        console.log(`Database Size: ${(fs.statSync('./data/question-database.json').size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`Last Updated: ${new Date(metadata.last_updated).toLocaleTimeString()}`);
        
        console.log('\n🎲 DIFFICULTY DISTRIBUTION:');
        console.log('═══════════════════════════════════════');
        Object.entries(metadata.difficulty_levels).forEach(([difficulty, count]) => {
            const percentage = ((count / metadata.total_questions) * 100).toFixed(1);
            console.log(`${difficulty.padEnd(12)}: ${count.toString().padStart(3)} (${percentage}%)`);
        });
        
        // Generation rate estimation
        const biologyRemaining = totalBiologyTarget - totalBiologyGenerated;
        const estimatedMinutes = Math.ceil(biologyRemaining * 16 / 60); // ~16 seconds per question
        
        console.log('\n⏰ TIME ESTIMATES:');
        console.log('═══════════════════════════════════════');
        console.log(`Remaining Biology Questions: ${biologyRemaining}`);
        console.log(`Estimated Completion Time: ~${estimatedMinutes} minutes`);
        console.log(`Target Total Questions: ${700 + totalBiologyTarget} (1,700 total)`);
        
    } catch (error) {
        console.error('❌ Monitor Error:', error.message);
    }
}

monitorProgress();
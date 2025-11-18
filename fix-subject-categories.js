import fs from 'fs';

console.log('🔧 MCAT Database Subject Categorization Fix');
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
console.log(`📊 Total questions to fix: ${questions.length}`);

// Load audit report for reference
let auditReport;
try {
    const auditData = fs.readFileSync('./subject-audit-report.json', 'utf8');
    auditReport = JSON.parse(auditData);
} catch (err) {
    console.warn('⚠️ Could not load audit report, proceeding with pattern-based corrections');
}

// Subject classification function (same as in flashcard system)
function classifyAndCorrectSubject(question, explanation, topic, currentSubject = '') {
    const content = `${question} ${explanation} ${topic || ''}`.toLowerCase();
    
    // Define subject classification patterns
    const subjectPatterns = {
        'biochemistry': {
            strongIndicators: [
                'enzyme', 'metabolism', 'glycolysis', 'krebs cycle', 'electron transport', 'ATP', 'NADH', 'FADH2',
                'amino acid', 'protein structure', 'enzyme kinetics', 'Km', 'Vmax', 'allosteric', 'phosphorylation',
                'transcription', 'translation', 'DNA replication', 'RNA', 'codon', 'ribosome', 'polymerase',
                'warburg effect', 'metabolic pathway', 'biochemical', 'molecular biology', 'nucleotide',
                'phosphofructokinase', 'pfk-1', 'hexokinase', 'pyruvate kinase'
            ],
            topics: [
                'amino_acids', 'metabolism', 'enzyme_kinetics', 'protein_structure', 'biochemical_pathways',
                'molecular_biology', 'nucleic_acids', 'carbohydrates', 'lipids'
            ],
            weight: 1.0
        },
        'chemistry': {
            strongIndicators: [
                'periodic table', 'electron configuration', 'orbital', 'hybridization', 'lewis structure',
                'VSEPR', 'molecular geometry', 'electronegativity', 'solubility rules', 'acid base',
                'pH buffer', 'equilibrium', 'thermodynamics', 'enthalpy', 'entropy', 'kinetics',
                'activation energy', 'redox', 'oxidation', 'reduction', 'galvanic cell', 'coordination complex',
                'tetraammine', 'ligand', 'ionic', 'covalent', 'molecular'
            ],
            topics: [
                'general_chemistry', 'organic_chemistry', 'physical_chemistry', 'chemical_bonding',
                'thermodynamics', 'kinetics', 'equilibrium', 'acids_bases', 'redox', 'coordination_chemistry'
            ],
            weight: 1.0
        },
        'physics': {
            strongIndicators: [
                'force', 'velocity', 'acceleration', 'momentum', 'kinetic energy', 'potential energy',
                'newton', 'gravity', 'wave', 'frequency', 'wavelength', 'electromagnetic', 'photon',
                'electric field', 'magnetic field', 'voltage', 'resistance', 'optics', 'lens'
            ],
            topics: [
                'mechanics', 'waves', 'electromagnetics', 'optics', 'modern_physics', 'nuclear_physics'
            ],
            weight: 1.0
        },
        'psychology': {
            strongIndicators: [
                'behavior', 'cognitive', 'memory', 'learning', 'conditioning', 'reinforcement',
                'perception', 'attention', 'consciousness', 'personality', 'emotion', 'motivation',
                'therapy', 'development', 'social psychology', 'intelligence'
            ],
            topics: [
                'cognitive_psychology', 'behavioral_psychology', 'social_psychology',
                'developmental_psychology', 'personality_psychology'
            ],
            weight: 1.0
        },
        'sociology': {
            strongIndicators: [
                'society', 'social', 'culture', 'socialization', 'norms', 'values', 'role', 'status',
                'institution', 'family', 'education', 'religion', 'government', 'stratification'
            ],
            topics: [
                'social_institutions', 'social_stratification', 'culture', 'deviance', 'social_change'
            ],
            weight: 1.0
        },
        'biology': {
            strongIndicators: [
                'cell membrane', 'organelle', 'mitosis', 'meiosis', 'photosynthesis', 'evolution',
                'natural selection', 'ecology', 'population', 'ecosystem', 'organ system',
                'anatomy', 'physiology', 'immune system', 'nervous system', 'reproduction'
            ],
            topics: [
                'cell_biology', 'genetics', 'evolution', 'ecology', 'anatomy', 'physiology',
                'organ_systems', 'reproduction', 'development'
            ],
            weight: 0.8  // Lower weight since many biochem questions get misclassified as biology
        }
    };
    
    // Calculate scores for each subject
    const scores = {};
    for (const [subject, patterns] of Object.entries(subjectPatterns)) {
        let score = 0;
        
        // Check strong indicators
        for (const indicator of patterns.strongIndicators) {
            if (content.includes(indicator.toLowerCase())) {
                score += patterns.weight;
            }
        }
        
        // Check topics (higher weight)
        for (const topicPattern of patterns.topics) {
            if (topic && topic.toLowerCase().includes(topicPattern.toLowerCase())) {
                score += 3 * patterns.weight;
            }
        }
        
        scores[subject] = score;
    }
    
    // Find the best match
    const bestMatch = Object.entries(scores).reduce((a, b) => scores[a[0]] > scores[b[0]] ? a : b);
    const predictedSubject = bestMatch[1] > 0 ? bestMatch[0] : currentSubject || 'biology';
    
    return {
        predictedSubject,
        confidence: bestMatch[1],
        scores
    };
}

// Apply corrections
const corrections = {
    total: 0,
    corrected: 0,
    subjectChanges: {},
    newDistribution: {}
};

console.log('\n🔧 Applying subject corrections...\n');

for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    corrections.total++;
    
    // Get current subject
    let currentSubject = 'unknown';
    if (q.subject) {
        currentSubject = q.subject.toLowerCase();
    } else {
        // Infer from question ID or set as biology by default
        if (q.id && q.id.includes('biochem')) currentSubject = 'biochemistry';
        else if (q.id && q.id.includes('bio')) currentSubject = 'biology';
        else if (q.id && q.id.includes('chem')) currentSubject = 'chemistry';
        else if (q.id && q.id.includes('phys')) currentSubject = 'physics';
        else if (q.id && q.id.includes('psyc')) currentSubject = 'psychology';
        else if (q.id && q.id.includes('soc')) currentSubject = 'sociology';
        else currentSubject = 'biology'; // Default fallback
    }
    
    // Classify the question
    const classification = classifyAndCorrectSubject(
        q.question || '', 
        q.explanation || '', 
        q.topic, 
        currentSubject
    );
    
    const predictedSubject = classification.predictedSubject;
    
    // Apply correction if there's a significant mismatch
    if (currentSubject !== predictedSubject && classification.confidence > 2) {
        corrections.corrected++;
        
        // Track the change
        const changeKey = `${currentSubject} → ${predictedSubject}`;
        corrections.subjectChanges[changeKey] = (corrections.subjectChanges[changeKey] || 0) + 1;
        
        // Update the question
        questions[i].subject = predictedSubject;
        questions[i]._originalSubject = currentSubject;
        questions[i]._correctionConfidence = classification.confidence;
        
        if (corrections.corrected <= 10) {
            console.log(`${corrections.corrected}. ${q.id}: ${currentSubject} → ${predictedSubject} (confidence: ${classification.confidence})`);
        }
    }
    
    // Count new distribution
    const finalSubject = questions[i].subject || predictedSubject;
    corrections.newDistribution[finalSubject] = (corrections.newDistribution[finalSubject] || 0) + 1;
    
    // Show progress
    if (corrections.total % 1000 === 0) {
        console.log(`📊 Processed ${corrections.total} questions, corrected ${corrections.corrected}...`);
    }
}

// Display results
console.log('\n' + '='.repeat(50));
console.log('🔧 CORRECTION RESULTS');
console.log('='.repeat(50));

console.log(`\n📊 Summary:`);
console.log(`  Total questions processed: ${corrections.total}`);
console.log(`  Questions corrected: ${corrections.corrected}`);
console.log(`  Correction rate: ${((corrections.corrected / corrections.total) * 100).toFixed(2)}%`);

console.log(`\n🔄 Subject Changes:`);
Object.entries(corrections.subjectChanges)
    .sort(([,a], [,b]) => b - a)
    .forEach(([change, count]) => {
        console.log(`  ${change}: ${count} questions`);
    });

console.log(`\n📈 New Subject Distribution:`);
Object.entries(corrections.newDistribution)
    .sort(([,a], [,b]) => b - a)
    .forEach(([subject, count]) => {
        console.log(`  ${subject}: ${count} questions`);
    });

// Create backup and save corrected database
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

// Backup original
const backupFilename = `question-database-backup-${timestamp}.json`;
fs.writeFileSync(`./data/${backupFilename}`, JSON.stringify(database, null, 2));
console.log(`\n💾 Original database backed up to: ./data/${backupFilename}`);

// Save corrected database
database.metadata.last_subject_correction = new Date().toISOString();
database.metadata.subject_corrections = corrections;

fs.writeFileSync('./data/question-database.json', JSON.stringify(database, null, 2));
console.log(`✅ Corrected database saved to: ./data/question-database.json`);

// Save correction report
const correctionReport = {
    timestamp: new Date().toISOString(),
    summary: {
        totalQuestions: corrections.total,
        totalCorrections: corrections.corrected,
        correctionRate: ((corrections.corrected / corrections.total) * 100).toFixed(2) + '%'
    },
    subjectChanges: corrections.subjectChanges,
    newDistribution: corrections.newDistribution,
    backupFile: backupFilename
};

fs.writeFileSync('subject-correction-report.json', JSON.stringify(correctionReport, null, 2));
console.log(`📄 Correction report saved to: subject-correction-report.json`);

console.log('\n✅ Subject categorization fix complete!');

// Verify the fix worked
const mostCommonCorrection = Object.entries(corrections.subjectChanges)
    .sort(([,a], [,b]) => b - a)[0];

if (mostCommonCorrection) {
    console.log(`\n🎯 Most common correction: ${mostCommonCorrection[0]} (${mostCommonCorrection[1]} questions)`);
}

if (corrections.corrected > 0) {
    console.log(`\n🚀 Restart the MCAT Victory Platform to see the corrected subject categories!`);
}
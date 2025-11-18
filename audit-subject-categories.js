import fs from 'fs';

console.log('🔍 MCAT Database Subject Categorization Audit');
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
console.log(`📊 Total questions to audit: ${questions.length}`);

// Define subject classification patterns
const subjectPatterns = {
    'biology': {
        keywords: [
            'cell', 'cellular', 'mitosis', 'meiosis', 'DNA', 'RNA', 'protein', 'enzyme', 'gene', 'genetic',
            'chromosome', 'membrane', 'organelle', 'nucleus', 'ribosome', 'photosynthesis', 'respiration',
            'evolution', 'natural selection', 'ecology', 'population', 'ecosystem', 'organism', 'species',
            'tissue', 'organ system', 'heart', 'lung', 'kidney', 'brain', 'nervous system', 'immune system',
            'endocrine', 'homeostasis', 'hormone', 'neuron', 'synapse', 'action potential'
        ],
        topics: [
            'cell_biology', 'molecular_biology', 'genetics', 'evolution', 'ecology', 'anatomy', 
            'physiology', 'organ_systems', 'reproduction', 'development'
        ]
    },
    'biochemistry': {
        keywords: [
            'enzyme', 'metabolism', 'glycolysis', 'krebs cycle', 'electron transport', 'ATP', 'NADH', 'FADH2',
            'amino acid', 'protein structure', 'primary structure', 'secondary structure', 'tertiary structure',
            'quaternary structure', 'alpha helix', 'beta sheet', 'enzyme kinetics', 'Km', 'Vmax', 'allosteric',
            'competitive inhibition', 'noncompetitive inhibition', 'cofactor', 'coenzyme', 'phosphorylation',
            'carbohydrate', 'lipid', 'fatty acid', 'cholesterol', 'nucleotide', 'nucleic acid', 'transcription',
            'translation', 'replication', 'PCR', 'western blot', 'ELISA'
        ],
        topics: [
            'amino_acids', 'metabolism', 'enzyme_kinetics', 'protein_structure', 'biochemical_pathways',
            'molecular_biology', 'nucleic_acids', 'carbohydrates', 'lipids'
        ]
    },
    'chemistry': {
        keywords: [
            'atom', 'molecule', 'bond', 'ionic', 'covalent', 'hydrogen bond', 'van der waals', 'electronegativity',
            'periodic table', 'electron configuration', 'orbital', 'hybridization', 'Lewis structure',
            'VSEPR', 'molecular geometry', 'polarity', 'solubility', 'acid', 'base', 'pH', 'buffer',
            'equilibrium', 'Le Chatelier', 'thermodynamics', 'enthalpy', 'entropy', 'Gibbs free energy',
            'kinetics', 'rate law', 'activation energy', 'catalyst', 'redox', 'oxidation', 'reduction',
            'electrochemistry', 'galvanic cell', 'electrolysis'
        ],
        topics: [
            'general_chemistry', 'organic_chemistry', 'physical_chemistry', 'inorganic_chemistry',
            'chemical_bonding', 'thermodynamics', 'kinetics', 'equilibrium', 'acids_bases', 'redox'
        ]
    },
    'physics': {
        keywords: [
            'force', 'velocity', 'acceleration', 'momentum', 'energy', 'work', 'power', 'kinetic energy',
            'potential energy', 'conservation', 'Newton', 'gravity', 'friction', 'wave', 'frequency',
            'wavelength', 'amplitude', 'electromagnetic', 'light', 'photon', 'electric field', 'magnetic field',
            'current', 'voltage', 'resistance', 'capacitor', 'inductor', 'circuit', 'optics', 'lens', 'mirror',
            'refraction', 'reflection', 'interference', 'diffraction', 'quantum', 'relativity', 'nuclear'
        ],
        topics: [
            'mechanics', 'waves', 'electromagnetics', 'optics', 'thermodynamics', 'modern_physics',
            'nuclear_physics', 'quantum_mechanics'
        ]
    },
    'psychology': {
        keywords: [
            'behavior', 'cognitive', 'memory', 'learning', 'conditioning', 'reinforcement', 'punishment',
            'perception', 'sensation', 'attention', 'consciousness', 'sleep', 'dream', 'personality',
            'emotion', 'motivation', 'stress', 'anxiety', 'depression', 'therapy', 'psychotherapy',
            'development', 'piaget', 'freud', 'jung', 'behaviorism', 'social psychology', 'group dynamics',
            'conformity', 'obedience', 'attribution', 'stereotype', 'prejudice', 'intelligence', 'IQ'
        ],
        topics: [
            'cognitive_psychology', 'behavioral_psychology', 'social_psychology', 'developmental_psychology',
            'abnormal_psychology', 'personality_psychology', 'research_methods', 'statistics'
        ]
    },
    'sociology': {
        keywords: [
            'society', 'social', 'culture', 'socialization', 'norms', 'values', 'role', 'status', 'institution',
            'family', 'education', 'religion', 'government', 'economy', 'stratification', 'class', 'inequality',
            'race', 'ethnicity', 'gender', 'sexuality', 'deviance', 'crime', 'social movement', 'change',
            'urbanization', 'globalization', 'demographics', 'population', 'migration', 'community'
        ],
        topics: [
            'social_institutions', 'social_stratification', 'culture', 'deviance', 'social_change',
            'demographics', 'research_methods', 'theory'
        ]
    }
};

// Function to classify question based on content
function classifyQuestion(question, explanation, topic) {
    const content = `${question} ${explanation} ${topic || ''}`.toLowerCase();
    const scores = {};
    
    for (const [subject, patterns] of Object.entries(subjectPatterns)) {
        let score = 0;
        
        // Check keywords
        for (const keyword of patterns.keywords) {
            if (content.includes(keyword.toLowerCase())) {
                score += 1;
            }
        }
        
        // Check topics (higher weight)
        for (const topicPattern of patterns.topics) {
            if (topic && topic.toLowerCase().includes(topicPattern.toLowerCase())) {
                score += 3;
            }
        }
        
        scores[subject] = score;
    }
    
    // Return the subject with highest score
    const bestMatch = Object.entries(scores).reduce((a, b) => scores[a[0]] > scores[b[0]] ? a : b);
    return bestMatch[1] > 0 ? bestMatch[0] : 'unknown';
}

// Audit all questions
const results = {
    total: 0,
    mismatches: [],
    subjectCounts: {},
    predictedCounts: {}
};

console.log('\n🔍 Analyzing questions...\n');

for (const q of questions) {
    results.total++;
    
    // Get current subject assignment (look for subject field or infer from metadata)
    let currentSubject = 'unknown';
    if (q.subject) {
        currentSubject = q.subject.toLowerCase();
    } else if (q.category) {
        currentSubject = q.category.toLowerCase();
    } else {
        // Try to infer from question ID or topic
        if (q.id && q.id.includes('biochem')) currentSubject = 'biochemistry';
        else if (q.id && q.id.includes('bio')) currentSubject = 'biology';
        else if (q.id && q.id.includes('chem')) currentSubject = 'chemistry';
        else if (q.id && q.id.includes('phys')) currentSubject = 'physics';
        else if (q.id && q.id.includes('psyc')) currentSubject = 'psychology';
        else if (q.id && q.id.includes('soc')) currentSubject = 'sociology';
    }
    
    // Predict correct subject based on content
    const predictedSubject = classifyQuestion(q.question || '', q.explanation || '', q.topic);
    
    // Count subjects
    results.subjectCounts[currentSubject] = (results.subjectCounts[currentSubject] || 0) + 1;
    results.predictedCounts[predictedSubject] = (results.predictedCounts[predictedSubject] || 0) + 1;
    
    // Check for mismatch
    if (currentSubject !== 'unknown' && predictedSubject !== 'unknown' && currentSubject !== predictedSubject) {
        results.mismatches.push({
            id: q.id,
            question: (q.question || '').substring(0, 100) + '...',
            topic: q.topic,
            currentSubject,
            predictedSubject,
            confidence: 'medium'  // Could be enhanced with confidence scoring
        });
    }
    
    // Show progress for large datasets
    if (results.total % 1000 === 0) {
        console.log(`📊 Processed ${results.total} questions...`);
    }
}

// Display results
console.log('\n' + '='.repeat(50));
console.log('📊 AUDIT RESULTS');
console.log('='.repeat(50));

console.log(`\n📈 Current Subject Distribution:`);
Object.entries(results.subjectCounts)
    .sort(([,a], [,b]) => b - a)
    .forEach(([subject, count]) => {
        console.log(`  ${subject}: ${count} questions`);
    });

console.log(`\n🎯 Predicted Subject Distribution:`);
Object.entries(results.predictedCounts)
    .sort(([,a], [,b]) => b - a)
    .forEach(([subject, count]) => {
        console.log(`  ${subject}: ${count} questions`);
    });

console.log(`\n🚨 SUBJECT MISMATCHES DETECTED: ${results.mismatches.length}`);

if (results.mismatches.length > 0) {
    console.log('\nTop 20 Most Critical Mismatches:');
    console.log('-'.repeat(80));
    
    results.mismatches.slice(0, 20).forEach((mismatch, index) => {
        console.log(`${index + 1}. ${mismatch.id}`);
        console.log(`   Question: ${mismatch.question}`);
        console.log(`   Current: ${mismatch.currentSubject} → Should be: ${mismatch.predictedSubject}`);
        console.log(`   Topic: ${mismatch.topic || 'N/A'}`);
        console.log('');
    });
    
    if (results.mismatches.length > 20) {
        console.log(`... and ${results.mismatches.length - 20} more mismatches`);
    }
}

// Save detailed results to file
const auditReport = {
    timestamp: new Date().toISOString(),
    summary: {
        totalQuestions: results.total,
        totalMismatches: results.mismatches.length,
        mismatchRate: ((results.mismatches.length / results.total) * 100).toFixed(2) + '%'
    },
    currentDistribution: results.subjectCounts,
    predictedDistribution: results.predictedCounts,
    mismatches: results.mismatches
};

fs.writeFileSync('subject-audit-report.json', JSON.stringify(auditReport, null, 2));

console.log('\n✅ Audit complete!');
console.log(`📄 Detailed report saved to: subject-audit-report.json`);
console.log(`📊 Mismatch rate: ${auditReport.summary.mismatchRate}`);
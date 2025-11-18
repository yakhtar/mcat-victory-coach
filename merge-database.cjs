const fs = require('fs');

// Get all JSON batch files
const files = fs.readdirSync('.')
  .filter(f => f.endsWith('.json') && f.startsWith('claude-max-') && !f.includes('package'))
  .sort();

console.log('Found batch files:', files.length);

let allQuestions = [];
let batchSummary = {};

for (const file of files) {
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (Array.isArray(data)) {
      allQuestions = allQuestions.concat(data);
      batchSummary[file] = data.length;
      console.log(`${file}: ${data.length} questions`);
    }
  } catch (err) {
    console.log(`Error reading ${file}: ${err.message}`);
  }
}

console.log('\n=== COMPLETE DATABASE MERGE ===');
console.log('Total questions:', allQuestions.length);

// Count General Chemistry specifically
const gcTopics = [
  'solution_concentrations', 'quantum_mechanics', 'chemical_equilibrium', 
  'ideal_gas_deviations', 'oxidation_states', 'electrolysis', 'buffer_capacity',
  'crystal_structures', 'reaction_spontaneity', 'mass_spectrometry',
  'acids_bases_salts', 'chemical_kinetics', 'gas_laws_combined',
  'electron_configuration', 'solubility_rules', 'thermodynamics_spontaneity',
  'periodic_table_trends', 'complex_ions', 'colligative_properties_calculations',
  'molecular_geometry_advanced', 'collision_theory', 'partial_pressures',
  'hybrid_orbitals', 'electronegativity_trends', 'precipitation_reactions',
  'bond_energies', 'empirical_formulas', 'galvanic_cells',
  'calorimetry_calculations', 'half_life', 'vapor_pressure_equilibrium',
  'nuclear_decay_equations', 'enzyme_kinetics_chemistry', 'limiting_reagent_calculations',
  'intermolecular_forces_strength', 'coordination_chemistry_naming',
  'acid_base_calculations', 'redox_balancing_equations', 'gas_density_calculations',
  'lewis_acid_base_theory'
];

// Count by topic
const topics = {};
allQuestions.forEach(q => {
  topics[q.topic] = (topics[q.topic] || 0) + 1;
});

const gcCount = gcTopics.reduce((sum, topic) => sum + (topics[topic] || 0), 0);
console.log(`\n=== GENERAL CHEMISTRY PROGRESS ===`);
console.log(`General Chemistry: ${gcCount}/800 questions (${(gcCount/800*100).toFixed(1)}%)`);

// Save complete database
fs.writeFileSync('claude-max-questions-database.json', JSON.stringify(allQuestions, null, 2));
console.log('\n✅ Complete database created with ' + allQuestions.length + ' questions!');
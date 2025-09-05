import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const execAsync = promisify(exec);

class MasterBiologyGenerator {
    constructor() {
        this.results = {
            cell_biology: { target: 200, generated: 0, batches: 0 },
            molecular_biology: { target: 180, generated: 0, batches: 0 },
            biochemistry_integration: { target: 170, generated: 0, batches: 0 },
            organ_systems: { target: 250, generated: 0, batches: 0 },
            genetics: { target: 120, generated: 0, batches: 0 },
            evolution: { target: 80, generated: 0, batches: 0 }
        };
        this.totalTarget = 1000;
        this.batchSize = 20;
    }

    async getCurrentQuestionCount() {
        try {
            const dbPath = 'data/question-database.json';
            if (!fs.existsSync(dbPath)) return 0;
            
            const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
            
            // Count biology questions by topic
            if (db.metadata?.categories?.biology) {
                const biology = db.metadata.categories.biology;
                this.results.cell_biology.generated = biology.cell_biology || 0;
                this.results.molecular_biology.generated = biology.molecular_biology || 0;
                this.results.biochemistry_integration.generated = biology.biochemistry_integration || 0;
                this.results.organ_systems.generated = biology.organ_systems || 0;
                this.results.genetics.generated = biology.genetics || 0;
                this.results.evolution.generated = biology.evolution || 0;
            }
            
            const totalGenerated = Object.values(this.results).reduce((sum, topic) => sum + topic.generated, 0);
            return totalGenerated;
            
        } catch (error) {
            console.error('Error reading question database:', error);
            return 0;
        }
    }

    displayProgress() {
        console.log('\n🧬 MCAT Victory Platform - Biology Section Progress');
        console.log('==================================================');
        
        const totalGenerated = Object.values(this.results).reduce((sum, topic) => sum + topic.generated, 0);
        const progressPercent = Math.round((totalGenerated / this.totalTarget) * 100);
        
        console.log(`Total Progress: ${totalGenerated}/${this.totalTarget} questions (${progressPercent}%)`);
        console.log('\nTopic Breakdown:');
        
        for (const [topic, data] of Object.entries(this.results)) {
            const topicPercent = Math.round((data.generated / data.target) * 100);
            const status = data.generated >= data.target ? '✅' : '🔄';
            const topicName = topic.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            
            console.log(`${status} ${topicName}: ${data.generated}/${data.target} (${topicPercent}%)`);
        }
    }

    async generateTopicBatch(topic, batchSize = null) {
        const actualBatchSize = batchSize || this.batchSize;
        const remaining = this.results[topic].target - this.results[topic].generated;
        const thisBatch = Math.min(actualBatchSize, remaining);
        
        if (thisBatch <= 0) {
            console.log(`✅ ${topic} already complete!`);
            return { success: true, generated: 0 };
        }
        
        console.log(`\n🚀 Starting ${topic} batch: ${thisBatch} questions...`);
        
        try {
            const scriptName = this.getScriptName(topic);
            const { stdout, stderr } = await execAsync(`node ${scriptName} ${thisBatch}`);
            
            console.log(stdout);
            if (stderr) console.error(stderr);
            
            // Update progress
            await this.getCurrentQuestionCount();
            this.results[topic].batches++;
            
            return { success: true, generated: thisBatch };
            
        } catch (error) {
            console.error(`❌ Error generating ${topic} batch:`, error);
            return { success: false, generated: 0 };
        }
    }

    getScriptName(topic) {
        const scriptMap = {
            'cell_biology': 'generate-cell-biology-batch.js',
            'molecular_biology': 'generate-molecular-biology-batch.js',
            'biochemistry_integration': 'generate-biochem-integration-batch.js',
            'organ_systems': 'generate-organ-systems-batch.js',
            'genetics': 'generate-genetics-batch.js',
            'evolution': 'generate-evolution-batch.js'
        };
        return scriptMap[topic];
    }

    async generateAllBiologyQuestions() {
        console.log('🧬 MASTER BIOLOGY GENERATION STARTING');
        console.log('=====================================');
        
        await this.getCurrentQuestionCount();
        this.displayProgress();
        
        const startTime = Date.now();
        let totalGenerated = 0;
        
        // Process each topic
        for (const topic of Object.keys(this.results)) {
            while (this.results[topic].generated < this.results[topic].target) {
                const result = await this.generateTopicBatch(topic);
                if (!result.success) {
                    console.error(`Failed to complete ${topic}. Continuing with next topic...`);
                    break;
                }
                totalGenerated += result.generated;
                
                // Update progress display
                await this.getCurrentQuestionCount();
                this.displayProgress();
                
                // Small delay between batches
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        const endTime = Date.now();
        const duration = Math.round((endTime - startTime) / 1000 / 60);
        
        console.log('\n🎉 BIOLOGY SECTION GENERATION COMPLETE!');
        console.log('=======================================');
        console.log(`Total Questions Generated: ${totalGenerated}`);
        console.log(`Generation Time: ${duration} minutes`);
        
        await this.getCurrentQuestionCount();
        this.displayProgress();
        
        return totalGenerated;
    }

    async generateSingleBatch(topic, batchSize = 20) {
        console.log(`🧬 SINGLE BATCH GENERATION: ${topic}`);
        console.log('====================================');
        
        await this.getCurrentQuestionCount();
        const result = await this.generateTopicBatch(topic, batchSize);
        
        await this.getCurrentQuestionCount();
        this.displayProgress();
        
        return result;
    }
}

// Command line interface
if (import.meta.url === `file://${process.argv[1]}`) {
    const generator = new MasterBiologyGenerator();
    
    const command = process.argv[2];
    const topic = process.argv[3];
    const batchSize = parseInt(process.argv[4]) || 20;
    
    if (command === 'batch' && topic) {
        generator.generateSingleBatch(topic, batchSize)
            .then(() => process.exit(0))
            .catch(error => {
                console.error('Generation failed:', error);
                process.exit(1);
            });
    } else if (command === 'all') {
        generator.generateAllBiologyQuestions()
            .then(() => process.exit(0))
            .catch(error => {
                console.error('Generation failed:', error);
                process.exit(1);
            });
    } else if (command === 'status') {
        generator.getCurrentQuestionCount()
            .then(() => {
                generator.displayProgress();
                process.exit(0);
            })
            .catch(error => {
                console.error('Status check failed:', error);
                process.exit(1);
            });
    } else {
        console.log('Usage:');
        console.log('  node master-biology-generator.js status');
        console.log('  node master-biology-generator.js batch <topic> [batchSize]');
        console.log('  node master-biology-generator.js all');
        console.log('');
        console.log('Topics: cell_biology, molecular_biology, biochemistry_integration, organ_systems, genetics, evolution');
    }
}

export { MasterBiologyGenerator };
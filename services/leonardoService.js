// Leonardo AI Visual Content Service for MCAT Victory Platform
// Generates custom medical diagrams, molecular structures, and educational visuals

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class LeonardoService {
    constructor() {
        this.apiKey = process.env.LEONARDO_API_KEY;
        this.baseURL = 'https://cloud.leonardo.ai/api/rest/v1';
        
        // Visual content directory
        this.visualsDir = path.join(__dirname, '..', 'public', 'visuals');
        this.ensureVisualsDirectory();
        
        // Medical education optimized models
        this.models = {
            medical: {
                id: '6bef9f1b-29cb-40c7-b9df-32b51c1f67d3', // Leonardo Diffusion XL
                name: 'Medical Education'
            },
            scientific: {
                id: '1e60896f-3c26-4296-8ecc-53e2afecc132', // Leonardo Vision XL  
                name: 'Scientific Diagrams'
            }
        };
        
        console.log('🎨 Leonardo AI Service initialized for medical visuals');
    }

    ensureVisualsDirectory() {
        if (!fs.existsSync(this.visualsDir)) {
            fs.mkdirSync(this.visualsDir, { recursive: true });
        }
    }

    // Generate medical diagrams for MCAT topics
    async generateMedicalDiagram(topic, description, options = {}) {
        try {
            const prompt = this.createMedicalPrompt(topic, description, options.style || 'educational');
            
            const response = await this.generateImage({
                prompt,
                model: this.models.medical.id,
                width: options.width || 1024,
                height: options.height || 1024,
                guidance_scale: 7,
                num_images: 1,
                prompt_magic: true
            });

            const imageUrl = await this.downloadAndSaveImage(response.url, topic);
            
            console.log(`🎨 Generated medical diagram: ${topic}`);
            return {
                success: true,
                image_url: imageUrl,
                topic: topic,
                description: description,
                model_used: this.models.medical.name
            };

        } catch (error) {
            console.error('❌ Medical diagram generation failed:', error);
            throw new Error(`Visual content generation failed: ${error.message}`);
        }
    }

    // Generate molecular structure visualizations
    async generateMolecularStructure(moleculeName, formula, options = {}) {
        try {
            const prompt = `Professional scientific illustration of ${moleculeName} (${formula}) molecular structure, 
                           clean educational diagram style, white background, 
                           clear atom labels, bond representations, 
                           medical textbook quality, no text overlays, 
                           ${options.view || '3D perspective'} view`;

            const response = await this.generateImage({
                prompt,
                model: this.models.scientific.id,
                width: 768,
                height: 768,
                guidance_scale: 8,
                num_images: 1
            });

            const imageUrl = await this.downloadAndSaveImage(response.url, `molecule_${moleculeName.toLowerCase()}`);
            
            console.log(`🧬 Generated molecular structure: ${moleculeName}`);
            return {
                success: true,
                image_url: imageUrl,
                molecule: moleculeName,
                formula: formula
            };

        } catch (error) {
            console.error('❌ Molecular structure generation failed:', error);
            throw error;
        }
    }

    // Generate anatomical diagrams
    async generateAnatomicalDiagram(bodySystem, specificStructure, options = {}) {
        try {
            const prompt = `Medical textbook illustration of ${bodySystem} system focusing on ${specificStructure}, 
                           anatomically accurate, educational diagram style, 
                           clear labels and callouts, professional medical illustration, 
                           clean white background, ${options.complexity || 'detailed'} level`;

            const response = await this.generateImage({
                prompt,
                model: this.models.medical.id,
                width: 1024,
                height: 768,
                guidance_scale: 7
            });

            const imageUrl = await this.downloadAndSaveImage(response.url, `anatomy_${specificStructure.toLowerCase()}`);
            
            console.log(`🫀 Generated anatomical diagram: ${specificStructure}`);
            return {
                success: true,
                image_url: imageUrl,
                body_system: bodySystem,
                structure: specificStructure
            };

        } catch (error) {
            console.error('❌ Anatomical diagram generation failed:', error);
            throw error;
        }
    }

    // Generate biochemical pathway diagrams
    async generatePathwayDiagram(pathwayName, keySteps, options = {}) {
        try {
            const prompt = `Biochemical pathway diagram for ${pathwayName}, 
                           showing key steps: ${keySteps.join(', ')}, 
                           professional medical education style, 
                           clear arrows and flow direction, 
                           enzyme names and cofactors labeled, 
                           clean educational diagram, white background`;

            const response = await this.generateImage({
                prompt,
                model: this.models.medical.id,
                width: 1200,
                height: 800,
                guidance_scale: 8
            });

            const imageUrl = await this.downloadAndSaveImage(response.url, `pathway_${pathwayName.toLowerCase()}`);
            
            console.log(`⚗️ Generated pathway diagram: ${pathwayName}`);
            return {
                success: true,
                image_url: imageUrl,
                pathway: pathwayName,
                steps: keySteps
            };

        } catch (error) {
            console.error('❌ Pathway diagram generation failed:', error);
            throw error;
        }
    }

    // Core image generation method
    async generateImage(params) {
        try {
            const response = await axios.post(`${this.baseURL}/generations`, params, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            const generationId = response.data.sdGenerationJob.generationId;
            
            // Poll for completion
            let completed = false;
            let attempts = 0;
            const maxAttempts = 30; // 5 minutes max

            while (!completed && attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
                
                const statusResponse = await axios.get(`${this.baseURL}/generations/${generationId}`, {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`
                    }
                });

                if (statusResponse.data.generations_by_pk?.status === 'COMPLETE') {
                    completed = true;
                    return {
                        url: statusResponse.data.generations_by_pk.generated_images[0].url,
                        id: generationId
                    };
                }
                
                attempts++;
            }

            throw new Error('Generation timed out');

        } catch (error) {
            console.error('❌ Leonardo API error:', error.response?.data || error.message);
            throw error;
        }
    }

    // Download and save generated images locally
    async downloadAndSaveImage(imageUrl, filename) {
        try {
            const response = await axios.get(imageUrl, { responseType: 'stream' });
            const timestamp = Date.now();
            const savedFilename = `${filename}_${timestamp}.jpg`;
            const filepath = path.join(this.visualsDir, savedFilename);

            const writer = fs.createWriteStream(filepath);
            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            return `/visuals/${savedFilename}`;
        } catch (error) {
            console.error('❌ Image download failed:', error);
            throw error;
        }
    }

    // Create optimized prompts for medical education
    createMedicalPrompt(topic, description, style = 'educational') {
        const styleMap = {
            educational: 'clean educational diagram style, medical textbook illustration',
            detailed: 'highly detailed medical illustration, anatomically precise',
            simple: 'simplified diagram for learning, clear and basic',
            interactive: 'engaging visual aid, colorful but professional'
        };

        return `${description} for ${topic}, ${styleMap[style]}, 
                professional medical education quality, 
                white background, no text overlays, 
                clear visual elements, MCAT preparation material style`;
    }

    // Get usage statistics
    async getUsageStats() {
        try {
            const response = await axios.get(`${this.baseURL}/user`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });

            return {
                tokens_used: response.data.user_details[0].tokenCount,
                subscription_tokens: response.data.user_details[0].subscriptionTokens,
                api_credit_balance: response.data.user_details[0].apiCreditBalance
            };
        } catch (error) {
            console.warn('⚠️ Could not fetch usage stats:', error.message);
            return null;
        }
    }

    // Health check for the service
    async healthCheck() {
        try {
            const stats = await this.getUsageStats();
            return {
                status: 'healthy',
                service: 'Leonardo AI',
                usage_stats: stats,
                models_available: Object.keys(this.models).length
            };
        } catch (error) {
            return {
                status: 'error',
                service: 'Leonardo AI',
                error: error.message
            };
        }
    }

    // Clean up old generated images (maintenance)
    async cleanupOldImages(maxAgeHours = 48) {
        try {
            const files = fs.readdirSync(this.visualsDir);
            const now = Date.now();
            let cleanedCount = 0;

            for (const file of files) {
                const filePath = path.join(this.visualsDir, file);
                const stats = fs.statSync(filePath);
                const ageHours = (now - stats.mtime.getTime()) / (1000 * 60 * 60);
                
                if (ageHours > maxAgeHours) {
                    fs.unlinkSync(filePath);
                    cleanedCount++;
                }
            }

            console.log(`🧹 Cleaned up ${cleanedCount} old visual files`);
            return cleanedCount;
        } catch (error) {
            console.error('❌ Visual cleanup failed:', error);
            return 0;
        }
    }
}

// Singleton instance
let leonardoServiceInstance = null;

export function getLeonardoService() {
    if (!leonardoServiceInstance) {
        leonardoServiceInstance = new LeonardoService();
    }
    return leonardoServiceInstance;
}

export default LeonardoService;

// Add this to mcat-victory-platform.js to use the new database

// Update the database path (around line 90)
const FINAL_DATABASE_PATH = './data/mcat-complete-515plus.json';

// In the loadDatabase method, change the path:
loadDatabase() {
    try {
        const data = fs.readFileSync(FINAL_DATABASE_PATH, 'utf8');
        this.questions = JSON.parse(data).questions || [];
        console.log(`✅ Loaded ${this.questions.length} questions from 515+ database`);
        return true;
    } catch (error) {
        console.error('Error loading database:', error);
        return false;
    }
}

// Add enhanced routes (after line 400)
import enhancedRoutes from './routes/enhanced-api-routes.js';
app.use(enhancedRoutes);

// Add coaching features status (in constructor)
this.coachingFeatures = {
    scoreP<brkr>rediction: true,
    studyPlanning: true,
    spacedRepetition: true,
    carsModule: true,
    medicalValidation: true
};

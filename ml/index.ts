/**
 * Machine Learning Module
 *
 * Core ML model for skin disease detection.
 * Exports SkinDiseaseDetector and related types for use throughout the app.
 */

// Core disease detector - the main ML logic
export { SkinDiseaseDetector, type DiseaseInfo, type ModelPredictions, type AnalysisResult } from './disease-detector';

// React component wrapper
export { MLAnalyzer } from './MLAnalyzer';
export type { default as MLAnalyzerType } from './MLAnalyzer';

// TensorFlow.js model analyzer (for live camera inference)
export { SkinModelAnalyzer } from './SkinModelAnalyzer';

// Default export for lazy loading
import MLAnalyzer from './MLAnalyzer';
export default MLAnalyzer;

import React, { useState, useCallback } from 'react';
import { View, Text, Image, ActivityIndicator, ScrollView } from 'react-native';
import { SkinDiseaseDetector, type AnalysisResult } from './disease-detector';

interface MLAnalyzerProps {
  imagePath: string;
  medicalData?: Record<string, any>;
}

export const MLAnalyzer: React.FC<MLAnalyzerProps> = ({ imagePath, medicalData }) => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detector = React.useMemo(() => new SkinDiseaseDetector(), []);

  const analyzeImage = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate model predictions
      // In production, integrate with actual TensorFlow.js model
      const modelPredictions = {
        acne: Math.random() * 0.5,
        dry: Math.random() * 0.3,
        oily: Math.random() * 0.2,
        normal: Math.random() * 0.3,
        pigmentation: Math.random() * 0.1,
      };

      const result = detector.analyzeImage(modelPredictions);
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  }, [detector]);

  React.useEffect(() => {
    analyzeImage();
  }, [imagePath, analyzeImage]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="mt-3 text-gray-600">Analyzing your skin...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-500 font-bold">Analysis Error</Text>
        <Text className="text-gray-600 text-center mt-2">{error}</Text>
      </View>
    );
  }

  if (!analysis) {
    return null;
  }

  const { disease, confidence, message, urdu_message, full_analysis } = analysis;

  return (
    <ScrollView className="flex-1 bg-white p-4">
      {/* Image Display */}
      <Image
        source={{ uri: imagePath }}
        className="w-full h-64 rounded-lg mb-4"
        resizeMode="cover"
      />

      {/* Primary Result */}
      <View className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
        <Text className="text-2xl font-bold mb-2">
          {full_analysis.emoji} {full_analysis.name}
        </Text>
        <Text className="text-gray-700 mb-2">{message}</Text>
        <Text className="text-gray-500 text-sm mb-2">{urdu_message}</Text>
        <Text className="text-lg font-semibold text-blue-600">
          Confidence: {(confidence * 100).toFixed(1)}%
        </Text>
      </View>

      {/* Severity Levels */}
      {full_analysis.severity_levels && (
        <View className="mb-4">
          <Text className="text-lg font-bold mb-2">Severity Levels</Text>
          <View className="flex-row flex-wrap gap-2">
            {full_analysis.severity_levels.map((level: string) => (
              <View key={level} className="bg-yellow-100 rounded-full px-3 py-1">
                <Text className="text-sm text-yellow-800">{level}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Symptoms */}
      {full_analysis.symptoms && (
        <View className="mb-4">
          <Text className="text-lg font-bold mb-2">Symptoms</Text>
          {full_analysis.symptoms.map((symptom: string, idx: number) => (
            <Text key={idx} className="text-gray-700 ml-4 mb-1">
              • {symptom}
            </Text>
          ))}
        </View>
      )}

      {/* Causes */}
      {full_analysis.causes && (
        <View className="mb-4">
          <Text className="text-lg font-bold mb-2">Common Causes</Text>
          {full_analysis.causes.map((cause: string, idx: number) => (
            <Text key={idx} className="text-gray-700 ml-4 mb-1">
              • {cause}
            </Text>
          ))}
        </View>
      )}

      {/* Treatment Options */}
      {full_analysis.treatment && (
        <View className="mb-4">
          <Text className="text-lg font-bold mb-2">Treatment & Care</Text>
          {full_analysis.treatment.map((treatment: string, idx: number) => (
            <Text key={idx} className="text-gray-700 ml-4 mb-1">
              {treatment}
            </Text>
          ))}
        </View>
      )}

      {/* Recommended Products */}
      {full_analysis.products && (
        <View className="mb-4">
          <Text className="text-lg font-bold mb-2">Recommended Products</Text>
          {full_analysis.products.map((product: string, idx: number) => (
            <View key={idx} className="bg-green-50 rounded p-2 mb-2 border border-green-200">
              <Text className="text-green-800">{product}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

export default MLAnalyzer;

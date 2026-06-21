import { useLocalSearchParams, useRouter } from 'expo-router';
import { Activity, AlertCircle, ArrowRight, Check, CheckCircle2, Coffee, Droplet, Moon, ShieldAlert, Sun, XCircle, Zap, ArrowLeft, Download } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View, ActivityIndicator, Platform, Alert } from 'react-native';
import Footer from '../../../components/Footer';
import * as api from '../../../utils/api';
import { generatePDF } from '../../../utils/pdfHelper';
import { SkinAnalysisResult } from '../../../utils/types';
import { diseaseData } from '../../../utils/diseaseData';

type AnalysisResultsProps = {
  result: SkinAnalysisResult;
  onNavigate: (page: string, extraParams?: any) => void;
  isGuest: boolean;
};

function AnalysisResults({ result, onNavigate, isGuest }: AnalysisResultsProps) {
  const getScoreColor = (score: number) => {
    if (score < 30) return 'text-purple-600';
    if (score < 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score < 30) return 'bg-purple-500';
    if (score < 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score < 30) return 'Mild';
    if (score < 60) return 'Moderate';
    return 'Severe';
  };

  const handleDownload = async () => {
    try {
      await generatePDF(result);
    } catch (e) {
      console.error('PDF generation failed', e);
      Alert.alert('PDF generation failed', 'There was an error generating your skin analysis report.');
    }
  };

  const detectedKey = result.detectedDisease?.toLowerCase().replace(/ /g, '_') || 'normal';
  const matchedDisease = Object.entries(diseaseData).find(([key]) => key.includes(detectedKey) || detectedKey.includes(key));
  const diseaseInfo = matchedDisease ? matchedDisease[1] : (diseaseData['normal'] || {} as any);
  const isSerious = diseaseInfo?.severity?.toLowerCase().includes('high');

  return (
    <ScrollView 
      style={{ flex: 1 }} 
      className="bg-gray-50" 
      contentContainerStyle={{ paddingBottom: 80, flexGrow: 1 }}
      showsVerticalScrollIndicator={true}
    >
      {/* Back Button */}
      <View className="px-6 pt-4 flex-row items-center gap-3">
        <TouchableOpacity
          onPress={() => onNavigate('landing')}
          className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm border border-gray-200"
        >
          <ArrowLeft size={20} color="#4B5563" />
        </TouchableOpacity>
        <Text className="text-gray-600 font-bold">{isGuest ? 'Back to Home' : 'Back to Dashboard'}</Text>
      </View>

      {/* Success Header */}
      <View className="bg-white m-4 rounded-3xl shadow-sm p-6 mb-6">
        <View className="items-center">
          <View className="w-20 h-20 bg-purple-100 rounded-full items-center justify-center mb-6">
            <Check size={40} color="#9333ea" />
          </View>
          <Text className="text-2xl font-bold mb-2 text-gray-900 text-center">Analysis Complete!</Text>
          <Text className="text-gray-600 text-center">Here's what we found about your skin</Text>
        </View>

        {/* AI Result Banner */}
        <View className="mb-6 p-4 rounded-2xl bg-purple-50 border border-purple-200 relative overflow-hidden mt-6">
          <View className="absolute top-0 right-0 bg-purple-200 px-3 py-1 rounded-bl-2xl flex-row items-center gap-1 z-10">
            <Activity size={12} color="#6b21a8" />
            <Text className="text-purple-800 font-bold text-xs uppercase">Confidence: {result.confidence || '92%'}</Text>
          </View>
          <Text className="text-gray-600 text-xs mb-1 uppercase font-bold tracking-widest mt-2">Our AI Detected:</Text>
          <Text className="text-3xl font-black text-purple-900 mb-2">{result.detectedDisease || result.skinType}</Text>
          <View className="flex-row items-center gap-2">
            <Text className="text-gray-500 font-medium tracking-tight uppercase text-[10px]">Condition Level:</Text>
            <View className={`px-3 py-1 rounded-full ${result.conditionLevel === 'good' ? 'bg-green-100' : 'bg-yellow-100'}`}>
              <Text className={`font-bold text-xs uppercase ${result.conditionLevel === 'good' ? 'text-green-700' : 'text-yellow-700'}`}>
                {result.conditionLevel || 'Moderate'}
              </Text>
            </View>
          </View>
        </View>

        <View className="mb-6">
          {result.is_uncertain && (
            <View className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex-row items-center gap-3">
              <ShieldAlert size={24} color="#d97706" />
              <View className="flex-1">
                <Text className="text-amber-800 font-bold text-base">Uncertain Analysis</Text>
                <Text className="text-amber-700 text-sm">AI confidence is low. Please consult a professional for verification.</Text>
              </View>
            </View>
          )}

          {!result.is_uncertain && result.conditionLevel?.toLowerCase() === 'good' && (
            <View className="p-4 rounded-2xl bg-green-50 border border-green-200 flex-row items-center gap-3">
              <CheckCircle2 size={24} color="#15803d" />
              <View className="flex-1">
                <Text className="text-green-800 font-bold text-base">Great Skin Health!</Text>
                <Text className="text-green-700 text-sm">Your skin is looking healthy. Stay consistent with your routine!</Text>
              </View>
            </View>
          )}

          {(result.conditionLevel?.toLowerCase() === 'moderate' || result.conditionLevel?.toLowerCase() === 'mild') && (
            <View className="p-4 rounded-2xl bg-yellow-50 border border-yellow-200">
              <View className="flex-row items-center gap-3">
                <AlertCircle size={24} color="#a16207" />
                <View className="flex-1">
                  <Text className="text-yellow-800 font-bold text-base">Moderate Condition</Text>
                  <Text className="text-yellow-700 text-sm">Your skin needs some attention. Follow the recommended action plan below.</Text>
                </View>
              </View>
              <View className="flex-row items-start mt-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <AlertCircle size={16} color="#6b7280" style={{ marginTop: 2, marginRight: 8 }} />
                <Text className="text-sm text-gray-600 italic flex-1 leading-5">
                  <Text className="font-bold">Disclaimer:</Text> These are supportive care tips and do not replace professional medical treatment, especially for infections, autoimmune diseases, or suspected skin cancers.
                </Text>
              </View>
            </View>
          )}

          {(result.conditionLevel?.toLowerCase() === 'poor' || result.conditionLevel?.toLowerCase() === 'severe' || result.conditionLevel?.toLowerCase() === 'high') && (
            <View className="p-4 rounded-2xl bg-red-50 border border-red-200">
              <View className="flex-row items-center gap-3 mb-3">
                <ShieldAlert size={24} color="#dc2626" />
                <View className="flex-1">
                  <Text className="text-red-800 font-bold text-base">Action Required!</Text>
                  <Text className="text-red-700 text-sm">Your skin condition looks concerning. We recommend professional advice.</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => onNavigate('appointments')}
                className="bg-red-600 py-3 rounded-xl items-center flex-row justify-center gap-2"
              >
                <Text className="text-white font-bold">Book Appointment Now</Text>
                <ArrowRight size={16} color="white" />
              </TouchableOpacity>
            </View>
          )}
        </View>

      </View>

      <View className="bg-white m-4 mt-0 rounded-3xl shadow-sm p-6 mb-8">
        <Text className="text-xl font-bold mb-4 text-gray-900">Your Action Plan</Text>
        
        {/* Disease Overview */}
        {result.conditionLevel !== 'good' && diseaseInfo?.disease !== 'Normal / Healthy Skin' && (
          <View className="mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <Text className="text-lg font-bold text-gray-900 mb-2">{diseaseInfo?.disease || 'Skin Analysis'}</Text>
            <Text className="text-gray-600 mb-4">{diseaseInfo?.description || 'Follow the recommended action plan.'}</Text>
            
            <Text className="font-bold text-gray-800 mb-2">Common Symptoms:</Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {diseaseInfo?.symptoms?.map((sym: string, i: number) => (
                <View key={i} className="bg-white px-3 py-1.5 rounded-full border border-gray-200">
                  <Text className="text-gray-700 text-sm">{sym}</Text>
                </View>
              ))}
            </View>

            <Text className="font-bold text-gray-800 mb-2">Common Causes:</Text>
            <View className="flex-row flex-wrap gap-2">
              {diseaseInfo?.causes?.map((cause: string, i: number) => (
                <View key={i} className="bg-purple-50 px-3 py-1.5 rounded-full border border-purple-100">
                  <Text className="text-purple-800 text-sm">{cause}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Doctor Consultation - Highlights if Serious */}
        <View className={`mb-6 p-4 rounded-2xl border ${isSerious ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
          <View className="flex-row items-center gap-2 mb-2">
            {isSerious ? <ShieldAlert size={20} color="#dc2626" /> : <Activity size={20} color="#2563eb" />}
            <Text className={`font-bold text-lg ${isSerious ? 'text-red-800' : 'text-blue-900'}`}>Medical Advice</Text>
          </View>
          <Text className={isSerious ? 'text-red-700 font-medium' : 'text-blue-800'}>{diseaseInfo?.doctor_when || 'Consult a dermatologist for personalized advice.'}</Text>
          {isSerious && (
            <TouchableOpacity
              onPress={() => onNavigate('appointments')}
              className="mt-4 bg-red-600 py-3 rounded-xl items-center flex-row justify-center gap-2"
            >
              <Text className="text-white font-bold text-base">Consult a Doctor Now</Text>
              <ArrowRight size={18} color="white" />
            </TouchableOpacity>
          )}
        </View>

        {/* Daily Routine */}
        <View className="mb-6 gap-3">
          <View className="bg-blue-50 p-4 rounded-2xl">
            <View className="flex-row items-center gap-2 mb-3">
              <Sun size={20} color="#2563eb" />
              <Text className="text-blue-900 font-bold text-lg">Morning Routine</Text>
            </View>
            {diseaseInfo?.morning_routine?.map((step: string, i: number) => (
              <Text key={i} className="text-blue-800 mb-1 font-medium">• {step}</Text>
            ))}
          </View>
          <View className="bg-indigo-50 p-4 rounded-2xl">
            <View className="flex-row items-center gap-2 mb-3">
              <Moon size={20} color="#4f46e5" />
              <Text className="text-indigo-900 font-bold text-lg">Night Routine</Text>
            </View>
            {diseaseInfo?.night_routine?.map((step: string, i: number) => (
              <Text key={i} className="text-indigo-800 mb-1 font-medium">• {step}</Text>
            ))}
          </View>
        </View>

        {/* Recommended Ingredients & Avoid */}
        <View className="mb-6 gap-3 flex-row">
          <View className="flex-1 border border-green-200 bg-green-50 p-4 rounded-2xl">
            <View className="flex-row items-center gap-2 mb-3">
              <CheckCircle2 size={18} color="#15803d" />
              <Text className="font-bold text-green-800 text-base">Key Ingredients</Text>
            </View>
            {diseaseInfo?.recommended_ingredients?.length > 0 ? diseaseInfo.recommended_ingredients.map((item: string, i: number) => (
              <Text key={i} className="text-green-700 text-sm mb-1 font-medium">• {item}</Text>
            )) : <Text className="text-green-700 text-sm">See doctor for prescription.</Text>}
          </View>
          <View className="flex-1 border border-red-200 bg-red-50 p-4 rounded-2xl">
            <View className="flex-row items-center gap-2 mb-3">
              <XCircle size={18} color="#b91c1c" />
              <Text className="font-bold text-red-800 text-base">Avoid</Text>
            </View>
            {diseaseInfo?.things_to_avoid?.length > 0 ? diseaseInfo.things_to_avoid.map((item: string, i: number) => (
              <Text key={i} className="text-red-700 text-sm mb-1 font-medium">• {item}</Text>
            )) : <Text className="text-red-700 text-sm">None specific.</Text>}
          </View>
        </View>

        {/* Home Remedies Section */}
        {!isSerious && diseaseInfo?.home_remedies && diseaseInfo.home_remedies.length > 0 && (
          <View className="mb-6 p-5 bg-emerald-50 rounded-2xl border border-emerald-200">
            <View className="flex-row items-center gap-3 mb-4">
              <Droplet size={22} color="#047857" />
              <Text className="text-emerald-900 font-bold text-lg">Safe Home Remedies</Text>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {diseaseInfo.home_remedies.map((remedy: string, i: number) => (
                <View key={i} className="bg-white px-4 py-2 rounded-full border border-emerald-100 shadow-sm">
                  <Text className="text-emerald-800 font-medium">{remedy}</Text>
                </View>
              ))}
            </View>
            <View className="flex-row items-start mt-5 bg-emerald-100/50 p-3 rounded-lg border border-emerald-100">
              <AlertCircle size={16} color="#047857" style={{ marginTop: 2, marginRight: 8 }} />
              <Text className="text-sm text-emerald-900 italic flex-1 leading-5">
                <Text className="font-bold">Disclaimer:</Text> These are supportive care tips and do not replace professional medical treatment, especially for infections, autoimmune diseases, or suspected skin cancers.
              </Text>
            </View>
          </View>
        )}

        {/* Multiple Product Recommendations */}
        {!isSerious && diseaseInfo?.recommended_products && diseaseInfo.recommended_products.length > 0 && (
          <View className="bg-gray-50 rounded-2xl p-5 border border-gray-100 mb-8">
            <Text className="font-bold text-gray-900 text-lg mb-4">Recommended Products</Text>
            {diseaseInfo.recommended_products.map((item: any, idx: number) => (
              <View key={idx} className="mb-3 flex-row items-center justify-between bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                <View className="flex-row items-center gap-3 flex-1">
                  <View className="bg-purple-50 p-2 rounded-full">
                    <Check size={16} color="#9333ea" />
                  </View>
                  <Text className="text-gray-800 font-bold text-base flex-1">{item}</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => onNavigate('products', { searchQuery: item })}
                  className="bg-purple-100 px-4 py-2 rounded-full flex-row items-center gap-1"
                >
                  <Text className="text-purple-700 font-bold text-sm">Shop</Text>
                  <ArrowRight size={14} color="#7e22ce" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Medical Disclaimer */}
        <View className="mt-2 border-t border-gray-100 pt-5">
          <Text className="text-gray-400 text-xs text-center font-medium leading-relaxed">
            Disclaimer: This AI analysis is for educational purposes only and is not a substitute for professional medical advice. Always consult a certified dermatologist before starting any new treatment.
          </Text>
        </View>
      </View>

        {/* Action Buttons */}
        <View className="gap-3">
          <TouchableOpacity
            onPress={handleDownload}
            className="flex-row items-center justify-center gap-2 px-6 py-4 bg-gray-800 rounded-2xl"
          >
            <Download size={20} color="white" />
            <Text className="text-white font-bold text-lg">Download PDF Report</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onNavigate('products')}
            className="flex-row items-center justify-center gap-2 px-6 py-4 bg-purple-600 rounded-2xl"
          >
            <Text className="text-white font-bold text-lg">Shop Products</Text>
            <ArrowRight size={20} color="white" />
          </TouchableOpacity>
        </View>


      <Footer />
    </ScrollView>
  );
}

export default function AnalysisDetailsPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string, result?: string }>();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<SkinAnalysisResult | null>(null);
  const [isGuest, setIsGuest] = useState(true);

  // Enforce Patient Role or Guest access
  useEffect(() => {
    const verifyRole = async () => {
      try {
        const userRes = await api.getCurrentUser();
        if (userRes && userRes.user) {
          setIsGuest(false);
          const role = userRes?.user?.role || userRes?.user?.userType || userRes?.role || userRes?.userType;
          if (role === 'doctor') {
            router.replace('/doctor/dashboard');
          }
        }
      } catch (err) {
        setIsGuest(true);
        console.log("Accessing analysis details page as guest");
      }
    };
    verifyRole();
  }, []);

  useEffect(() => {
    const loadAnalysis = async () => {
      if (params.result) {
        try {
          const parsed = JSON.parse(params.result);
          if (!parsed._id) parsed._id = params.id && params.id !== 'temp' ? params.id : 'SKN-' + new Date().getFullYear() + '-' + Math.floor(100000 + Math.random() * 900000);
          if (!parsed.createdAt) parsed.createdAt = new Date().toISOString();
          setResult(parsed);
          setLoading(false);
          return;
        } catch (e) {
          console.error('Failed to parse passed result:', e);
        }
      }

      if (params.id && params.id !== 'temp') {
        try {
          setLoading(true);
          const data = await api.getAnalysisDetails(params.id);
          if (data && data.analysis) {
            const dbAnalysis = data.analysis;

            // Map Db structure back to standard SkinAnalysisResult format
            const mappedResult: SkinAnalysisResult = {
              skinType: dbAnalysis.results?.skinType || 'Combination',
              skinTone: dbAnalysis.results?.skinTone || 'Medium',
              detectedDisease: dbAnalysis.results?.detectedDisease || dbAnalysis.results?.skinType || 'healthy',
              conditionLevel: dbAnalysis.results?.conditionLevel || 'moderate',
              confidence: dbAnalysis.results?.confidence || '92%',
              advice: dbAnalysis.results?.advice || 'Maintain a consistent skincare routine.',
              doctor: dbAnalysis.results?.doctor || 'Not required',
              is_uncertain: dbAnalysis.results?.is_uncertain || false,
              issues: dbAnalysis.results?.issues || dbAnalysis.results || {
                acne: 5,
                pigmentation: 5,
                dryness: 5,
                oiliness: 5,
                darkCircles: 5,
                sensitivity: 5
              },
              recommendations: dbAnalysis.results?.recommendations || [],
              dos: dbAnalysis.results?.dos || [],
              donts: dbAnalysis.results?.donts || [],
              remedies: dbAnalysis.results?.remedies || [],
              imageUrl: dbAnalysis.imageUrl || dbAnalysis.results?.imageUrl || '',
              createdAt: dbAnalysis.createdAt || dbAnalysis.datePerformed || new Date().toISOString(),
              _id: dbAnalysis._id || params.id
            };
            setResult(mappedResult);
          }
        } catch (err) {
          console.error('Failed to load analysis details:', err);
        } finally {
          setLoading(false);
        }
      } else {
        // Fallback for temp/local mock
        setResult({
          skinType: 'Combination',
          skinTone: 'Medium',
          conditionLevel: 'moderate',
          confidence: '92%',
          issues: {
            acne: 20,
            pigmentation: 15,
            dryness: 10,
            oiliness: 40,
            darkCircles: 30,
            sensitivity: 50
          },
          recommendations: [],
          imageUrl: '',
          createdAt: new Date().toISOString(),
          _id: 'SKN-' + new Date().getFullYear() + '-' + Math.floor(100000 + Math.random() * 900000)
        });
        setLoading(false);
      }
    };
    loadAnalysis();
  }, [params.id, params.result]);

  const handleNavigate = (page: string, extraParams?: any) => {
    if (page === 'landing') {
      router.push(isGuest ? '/' : '/patient/dashboard');
    }
    else if (page === 'analysis') router.push('/patient/scan');
    else if (page === 'products') {
      router.push({
        pathname: '/patient/products',
        params: { result: JSON.stringify(result), ...extraParams }
      });
    }
    else if (page === 'routine') router.push('/patient/routine');
    else if (page === 'appointments') router.push('/patient/appointments');
    else router.push(`/patient/${page}` as any);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#9333EA" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" style={Platform.OS === 'web' ? { height: '100vh' } : { flex: 1 }}>
      {result && <AnalysisResults result={result} onNavigate={handleNavigate} isGuest={isGuest} />}
    </SafeAreaView>
  );
}

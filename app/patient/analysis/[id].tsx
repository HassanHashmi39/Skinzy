import { useLocalSearchParams, useRouter } from 'expo-router';
import { Activity, AlertCircle, ArrowRight, Check, CheckCircle2, Coffee, Droplet, Moon, ShieldAlert, Sun, XCircle, Zap, ArrowLeft, Download } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View, ActivityIndicator, Platform, Alert } from 'react-native';
import Footer from '../../../components/Footer';
import * as api from '../../../utils/api';
import { generatePDF } from '../../../utils/pdfHelper';
import { SkinAnalysisResult } from '../../../utils/types';

type AnalysisResultsProps = {
  result: SkinAnalysisResult;
  onNavigate: (page: string) => void;
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

  return (
    <ScrollView className=" bg-gray-50" contentContainerStyle={{ paddingBottom: 40 }}>
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
            <View className="p-4 rounded-2xl bg-yellow-50 border border-yellow-200 flex-row items-center gap-3">
              <AlertCircle size={24} color="#a16207" />
              <View className="flex-1">
                <Text className="text-yellow-800 font-bold text-base">Moderate Condition</Text>
                <Text className="text-yellow-700 text-sm">Your skin needs some attention. Follow the recommended action plan below.</Text>
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

        {/* Skin Profile */}
        <View className="flex-row gap-4 mb-4">
          <View className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-100">
            <Text className="text-gray-600 text-xs mb-1 font-medium">Skin Category:</Text>
            <Text className="text-gray-900 font-bold">{result.skinType}</Text>
          </View>
          <View className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-100">
            <Text className="text-gray-600 text-xs mb-1 font-medium">Skin Tone:</Text>
            <Text className="text-gray-900 font-bold">{result.skinTone}</Text>
          </View>
        </View>
      </View>

      <View className="bg-white m-4 mt-0 rounded-3xl shadow-sm p-6 mb-8">
        <Text className="text-xl font-bold mb-6 text-gray-900">Your Action Plan</Text>

        {/* Daily Routine */}
        <View className="mb-6 gap-3">
          <View className="bg-blue-50 p-4 rounded-2xl">
            <View className="flex-row items-center gap-2 mb-3">
              <Coffee size={20} color="#2563eb" />
              <Text className="text-blue-900 font-bold text-lg">Morning Routine</Text>
            </View>
            {(
              result.morningRoutine && result.morningRoutine.length > 0
                ? result.morningRoutine
                : (
                  result.skinType?.toLowerCase().includes('oily')
                    ? ['1. Foaming Cleanser', '2. Niacinamide Serum', '3. Oil-free Sunscreen SPF 50+']
                    : result.skinType?.toLowerCase().includes('dry')
                      ? ['1. Hydrating Cleanser', '2. Hyaluronic Acid Serum', '3. Moisturizing Sunscreen SPF 50+']
                      : result.skinType?.toLowerCase().includes('sensitive')
                        ? ['1. Milk Cleanser', '2. Soothing Centella Serum', '3. Mineral Sunscreen SPF 50+']
                        : ['1. Gentle Cleanser', '2. Active Serum (e.g. Vitamin C)', '3. Sunscreen SPF 60+']
                )
            ).map((step, i) => (
              <Text key={i} className="text-blue-800 mb-1 font-medium">• {step}</Text>
            ))}
          </View>
          <View className="bg-indigo-50 p-4 rounded-2xl">
            <View className="flex-row items-center gap-2 mb-3">
              <Moon size={20} color="#4f46e5" />
              <Text className="text-indigo-900 font-bold text-lg">Night Routine</Text>
            </View>
            {(
              result.nightRoutine && result.nightRoutine.length > 0
                ? result.nightRoutine
                : (
                  result.detectedDisease && result.detectedDisease !== 'Healthy'
                    ? ['1. Double Cleanse', `2. Targeted Treatment (for ${result.detectedDisease})`, '3. Reparative Moisturizer']
                    : result.skinType?.toLowerCase().includes('oily')
                      ? ['1. Micellar Water', '2. Salicylic Acid Cleanser', '3. Light Gel Moisturizer']
                      : result.skinType?.toLowerCase().includes('dry')
                        ? ['1. Cleansing Balm', '2. Hydrating Cleanser', '3. Rich Night Cream']
                        : ['1. Double Cleanse', '2. Gentle Exfoliation (1-2x/week)', '3. Reparative Moisturizer']
                )
            ).map((step, i) => (
              <Text key={i} className="text-indigo-800 mb-1 font-medium">• {step}</Text>
            ))}
          </View>
        </View>

        {/* Dos & Don'ts */}
        <View className="mb-6 gap-3 flex-row">
          <View className="flex-1 border border-green-200 bg-green-50 p-4 rounded-2xl">
            <View className="flex-row items-center gap-2 mb-2">
              <CheckCircle2 size={16} color="#15803d" />
              <Text className="font-bold text-green-800 text-base">Do's</Text>
            </View>
            {(
              result.dos && result.dos.length > 0
                ? result.dos
                : result.detectedDisease?.toLowerCase().includes('acne') || result.skinType?.toLowerCase().includes('oily')
                  ? ['Wash face 2x daily', 'Use non-comedogenic makeup', 'Change pillowcases often']
                  : result.skinType?.toLowerCase().includes('dry')
                    ? ['Moisturize on damp skin', 'Use a humidifier', 'Drink much water']
                    : result.skinType?.toLowerCase().includes('sensitive')
                      ? ['Patch test new products', 'Keep routine simple', 'Wear wide-brimmed hats']
                      : ['Wash face 2x daily', 'Drink much water', 'Eat antioxidant foods']
            ).map((item, i) => (
              <Text key={i} className="text-green-700 text-sm mb-1">• {item}</Text>
            ))}
          </View>
          <View className="flex-1 border border-red-200 bg-red-50 p-4 rounded-2xl">
            <View className="flex-row items-center gap-2 mb-2">
              <XCircle size={16} color="#b91c1c" />
              <Text className="font-bold text-red-800 text-base">Don'ts</Text>
            </View>
            {(
              result.donts && result.donts.length > 0
                ? result.donts
                : result.detectedDisease?.toLowerCase().includes('acne')
                  ? ['Pop or pick at pimples', 'Over-exfoliate', 'Consume excessive dairy']
                  : result.skinType?.toLowerCase().includes('dry')
                    ? ['Use hot water for washing', 'Use alcohol toners', 'Over-wash face']
                    : result.skinType?.toLowerCase().includes('sensitive')
                      ? ['Use physical scrubs', 'Use strong fragrances', 'Try many new products at once']
                      : ['Avoid oily/salty food', "Don't touch face", 'Skip sunscreen']
            ).map((item, i) => (
              <Text key={i} className="text-red-700 text-sm mb-1">• {item}</Text>
            ))}
          </View>
        </View>

        {/* Golden Rules */}
        <View className="mb-8 p-6 bg-amber-50 rounded-3xl border border-amber-200">
          <View className="flex-row items-center gap-3 mb-4">
            <Zap size={24} color="#d97706" />
            <Text className="text-amber-900 font-black text-xl">Golden Rules ✨</Text>
          </View>
          <View className="gap-3">
            <View className="flex-row items-center gap-3">
              <Sun size={18} color="#d97706" />
              <Text className="text-amber-800 font-bold flex-1">Sunscreen is MUST (SPF 50+ Daily)</Text>
            </View>
            <View className="flex-row items-center gap-3">
              <Droplet size={18} color="#d97706" />
              <Text className="text-amber-800 font-bold flex-1">Gentle skincare &gt; Harsh products</Text>
            </View>
            <View className="flex-row items-center gap-3">
              <Zap size={18} color="#d97706" />
              <Text className="text-amber-800 font-bold flex-1">Consistency is key for results</Text>
            </View>
            <View className="flex-row items-center gap-3">
              <AlertCircle size={18} color="#d97706" />
              <Text className="text-amber-800 font-bold flex-1">Avoid DIY random treatments</Text>
            </View>
          </View>
        </View>

        {/* Home Remedies Section */}
        {result.remedies && result.remedies.length > 0 && (
          <View className="mb-8 p-6 bg-green-50 rounded-3xl border border-green-200">
            <View className="flex-row items-center gap-3 mb-4">
              <Droplet size={24} color="#166534" />
              <Text className="text-green-900 font-black text-xl">Home Remedies 🌿</Text>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {result.remedies.map((remedy, i) => (
                <View key={i} className="bg-white px-4 py-2 rounded-full border border-green-100">
                  <Text className="text-green-800 font-medium">{remedy}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Multiple Product Recommendations */}
        <View className="bg-gray-50 rounded-2xl p-5 border border-gray-100 mb-8">
          <Text className="font-bold text-gray-900 text-lg mb-4">Recommended Products</Text>

          {result.recommendations && result.recommendations.map((item: any, idx: number) => (
            <View key={idx} className="mb-4">
              <Text className="text-[10px] text-gray-500 font-bold uppercase mb-1 tracking-wider">{item.tier || 'Product'} Option | {item.category}</Text>
              <Text className="text-gray-800 font-medium text-base">{item.brand} {item.name}</Text>
              <Text className="text-purple-600 font-bold text-sm">{item.price}</Text>
            </View>
          ))}
          {(!result.recommendations || result.recommendations.length === 0) && (
            <Text className="text-gray-500 font-medium">No specific products recommended.</Text>
          )}
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

  const handleNavigate = (page: string) => {
    if (page === 'landing') {
      router.push(isGuest ? '/' : '/patient/dashboard');
    }
    else if (page === 'analysis') router.push('/patient/scan');
    else if (page === 'products') {
      router.push({
        pathname: '/patient/products',
        params: { result: JSON.stringify(result) }
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
    <SafeAreaView className="flex-1 bg-white">
      {result && <AnalysisResults result={result} onNavigate={handleNavigate} isGuest={isGuest} />}
    </SafeAreaView>
  );
}

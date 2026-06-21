import React, { useEffect, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Image } from 'react-native';
import * as api from '../../utils/api';
import { ArrowLeft, Coffee, Droplet, Heart, Leaf, Sparkles, Sun } from 'lucide-react-native';
export type Page = 'landing' | 'analysis' | 'results' | 'products' | 'routine' | 'appointments' | 'remedies' | 'chat' | 'history' | 'notifications' | 'profile' | 'feedback';

type RemediesProps = {
  result?: any;
  onNavigate: (page: Page) => void;
};

type Remedy = {
  id: string;
  title: string;
  category: string;
  ingredients: string[];
  benefits: string[];
  howToUse: string;
  frequency: string;
  icon: React.ReactNode;
  bestFor: string[];
  bgColor: string;
  iconColor: string;
  targetDiseases?: string[];
  imageUrl?: string;
};

function Remedies({ result, onNavigate }: RemediesProps) {
  const [dbRemedies, setDbRemedies] = useState<Remedy[]>([]);
  const [loading, setLoading] = useState(true);
  const [diseaseSearch, setDiseaseSearch] = useState('');

  useEffect(() => {
    const fetchRemedies = async () => {
      try {
        const response = await fetch(`${api.API_BASE_URL}/inventory/remedies`);
        const data = await response.json();
        if (response.ok && data.remedies) {
          const mappedRemedies = data.remedies.map((r: any) => ({
            id: r._id,
            title: r.name || 'Remedy',
            category: r.condition || 'General',
            ingredients: r.description ? r.description.split(',').map((s: string) => s.trim()) : [r.name],
            benefits: ['Natural Care'],
            howToUse: r.instructions ? r.instructions.split('.').map((s: string) => s.trim()).filter(Boolean).join('. ') : 'Apply as directed.',
            frequency: 'Daily',
            icon: <Leaf size={24} color="#16a34a" />,
            bestFor: ['All Skin Types'],
            bgColor: 'from-green-100 to-emerald-100',
            iconColor: 'text-green-600',
            targetDiseases: r.targetDiseases || [],
            imageUrl: r.imageUrl,
          }));
          setDbRemedies(mappedRemedies);
        }
      } catch (error) {
        console.error('Failed to fetch remedies:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRemedies();
  }, []);

  const remedies = dbRemedies.filter(remedy => {
    if (diseaseSearch.trim() !== '') {
      const search = diseaseSearch.trim().toLowerCase();
      const targets = (remedy as any).targetDiseases || [];
      const match = targets.some((d: string) => d.toLowerCase().includes(search));
      if (!match) return false;
    } else {
      const detected = result?.detectedDisease;
      if (detected) {
        const targets = (remedy as any).targetDiseases || [];
        if (!targets.includes(detected) && !targets.includes('normal')) {
          return false;
        }
      }
    }
    return true;
  });

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }} className="bg-gray-50">
      <View className="p-4 md:p-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <TouchableOpacity
          onPress={() => onNavigate('landing')}
          className="flex-row items-center gap-2 mb-8"
        >
          <ArrowLeft size={20} color="#4b5563" />
          <Text className="text-gray-600 font-medium ml-2">Back to Home</Text>
        </TouchableOpacity>

        <View className="mb-8">
          <View className="flex-row items-center gap-3 mb-3">
            <Leaf size={32} color="#16a34a" />
            <Text className="text-3xl font-bold">Natural Home Remedies</Text>
          </View>
          <Text className="text-gray-600 mb-4">
            Traditional Pakistani skincare remedies using natural ingredients for healthy, glowing skin
          </Text>
          
          <View className="mb-4">
            <TextInput
              value={diseaseSearch}
              onChangeText={setDiseaseSearch}
              placeholder="Search by disease (e.g. acne, psoriasis...)"
              className="w-full bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-800 shadow-sm"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        {/* Quick Tips */}
        <View className="bg-purple-600 rounded-2xl p-6 mb-8 shadow-lg shadow-purple-100">
          <Text className="text-lg font-bold mb-4 text-white">💡 Important Tips</Text>
          <View className="flex-col md:flex-row gap-4">
            <View className="bg-white/20 rounded-lg p-4 flex-1">
              <Text className="text-white">Always do a patch test before applying any remedy to your face</Text>
            </View>
            <View className="bg-white/20 rounded-lg p-4 flex-1">
              <Text className="text-white">Use fresh, organic ingredients whenever possible</Text>
            </View>
            <View className="bg-white/20 rounded-lg p-4 flex-1">
              <Text className="text-white">Consistency is key - results may take 2-4 weeks</Text>
            </View>
          </View>
        </View>

        {/* Remedies Grid */}
        <View className="flex-row flex-wrap gap-y-8 gap-x-[2.5%]">
          {remedies.map((remedy) => (
            <View key={remedy.id} className="w-full md:w-[48.75%] lg:w-[31.6%]">
              <RemedyCard remedy={remedy} />
            </View>
          ))}
        </View>

        {/* CTA Section */}
        <View className="mt-12 bg-purple-500 rounded-3xl p-8 md:p-12 items-center">
          <Text className="text-2xl font-bold mb-4 text-white text-center">Want Personalized Product Recommendations?</Text>
          <Text className="mb-6 text-white text-center opacity-90">
            Get AI-powered skin analysis and curated Halal product recommendations
          </Text>
          <TouchableOpacity
            onPress={() => onNavigate('landing')}
            className="px-8 py-4 bg-white rounded-full"
          >
            <Text className="text-purple-600 font-bold">Start Skin Analysis</Text>
          </TouchableOpacity>
        </View>
        <View className="h-10" />
      </View>
    </ScrollView>
  );
}

function RemedyCard({ remedy }: { remedy: Remedy }) {
  return (
    <View className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden h-full flex-col transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:border-purple-200">
      {/* Header Image */}
      {remedy.imageUrl && (
        <Image source={{ uri: remedy.imageUrl }} className="w-full h-40" resizeMode="cover" />
      )}
      
      {/* Header */}
      <View className="bg-gradient-to-r p-6" style={{ backgroundColor: '#a7f3d0' }}>
        <View className="flex-row items-start justify-between mb-3">
          <View className="w-12 h-12 bg-white rounded-full items-center justify-center">
            {remedy.icon}
          </View>
          <View className="px-3 py-1 bg-white/80 rounded-full">
            <Text className="text-gray-700 text-sm font-medium">{remedy.category}</Text>
          </View>
        </View>
        <Text className="text-lg font-bold text-gray-900">{remedy.title}</Text>
      </View>

      {/* Content */}
      <View className="p-6">
        {/* Ingredients */}
        <View className="mb-4">
          <Text className="text-gray-900 mb-2 font-bold">Ingredients:</Text>
          <View className="gap-1">
            {remedy.ingredients.map((ingredient, index) => (
              <View key={index} className="flex-row items-start gap-2">
                <Text className="text-green-500 mt-1">✓</Text>
                <Text className="text-gray-600 flex-1">{ingredient}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Benefits */}
        <View className="mb-4">
          <Text className="text-gray-900 mb-2 font-bold">Benefits:</Text>
          <View className="flex-row flex-wrap gap-2">
            {remedy.benefits.map((benefit, index) => (
              <View
                key={index}
                className="px-3 py-1 bg-purple-50 rounded-full"
              >
                <Text className="text-purple-700 text-sm">{benefit}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* How to Use */}
        <View className="mb-4 p-4 bg-gray-50 rounded-lg">
          <Text className="text-gray-900 mb-2 font-bold">How to Use:</Text>
          <Text className="text-gray-600">{remedy.howToUse}</Text>
        </View>

        {/* Frequency */}
        <View className="mb-4">
          <Text className="text-gray-900 mb-1 font-bold">Frequency:</Text>
          <Text className="text-purple-600 font-medium">{remedy.frequency}</Text>
        </View>

        {/* Best For */}
        <View>
          <Text className="text-gray-900 mb-2 font-bold">Best For:</Text>
          <View className="flex-row flex-wrap gap-2">
            {remedy.bestFor.map((condition, index) => (
              <View
                key={index}
                className="px-3 py-1 bg-green-50 rounded-full"
              >
                <Text className="text-green-700 text-sm">{condition}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

export default function RemediesPage() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const result = params.result ? JSON.parse(params.result as string) : null;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <Remedies result={result} onNavigate={(page: string) => {
              if (page === 'landing') router.push('/');
              else router.push(`/patient/${page}` as any);
            }} />
        </SafeAreaView>
    );
}

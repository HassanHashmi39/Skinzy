import { useRouter } from 'expo-router';
import { ArrowLeft, Shield, Eye, Lock, FileText, CheckCircle } from 'lucide-react-native';
import React from 'react';
import { 
    SafeAreaView, 
    ScrollView, 
    Text, 
    TouchableOpacity, 
    View 
} from 'react-native';

export default function PrivacyPolicyPage() {
    const router = useRouter();

    const sections = [
        {
            icon: <Eye size={22} color="#9333EA" />,
            title: "Data We Collect",
            description: "To perform AI skin diagnostics, we collect your profile details, answers to skin-type questionnaires, and standard facial images uploaded via our camera interface."
        },
        {
            icon: <Shield size={22} color="#9333EA" />,
            title: "How We Use Your Photos",
            description: "Your uploaded selfies are processed using our high-precision AI models to detect 12+ skin conditions. These photos are strictly used for clinical analysis and are never sold or shared with advertisers."
        },
        {
            icon: <Lock size={22} color="#9333EA" />,
            title: "Security & Compliance",
            description: "We employ industry-leading AES-256 encryption. Patient-doctor consultations and medical records comply with top-tier security standards, keeping your data confidential."
        },
        {
            icon: <FileText size={22} color="#9333EA" />,
            title: "Your Rights & Control",
            description: "You have absolute ownership of your data. At any time, you can request a full download of your skincare history or request permanent deletion of your profile and photos from our servers."
        }
    ];

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100">
                <TouchableOpacity 
                    onPress={() => router.back()}
                    className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center"
                >
                    <ArrowLeft size={20} color="#4B5563" />
                </TouchableOpacity>
                <Text className="text-lg font-black text-gray-900">Privacy Policy</Text>
                <View className="w-10 h-10" /> {/* Spacer for centering */}
            </View>

            <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false} className="px-6 py-6">
                {/* Header Badge */}
                <View className="items-center mb-8">
                    <View className="w-16 h-16 bg-purple-50 rounded-3xl items-center justify-center mb-4 border border-purple-100">
                        <Shield size={32} color="#9333EA" />
                    </View>
                    <Text className="text-2xl font-black text-gray-900 text-center mb-2">Your Privacy is Sacred</Text>
                    <Text className="text-gray-500 text-center leading-5 px-4">
                        At Skinzy, we prioritize safeguarding your clinical and personal data with medical-grade security.
                    </Text>
                </View>

                {/* Last Updated Badge */}
                <View className="bg-gray-50 rounded-2xl p-4 mb-8 flex-row items-center justify-between border border-gray-100">
                    <Text className="text-gray-500 font-bold text-xs">Last Updated</Text>
                    <Text className="text-purple-600 font-black text-xs">June 2, 2026</Text>
                </View>

                {/* Policy Sections */}
                <View className="gap-6">
                    {sections.map((section, idx) => (
                        <View key={idx} className="bg-white rounded-3xl p-6 border border-purple-50 shadow-sm shadow-purple-50 flex-row gap-4">
                            <View className="w-12 h-12 bg-purple-50 rounded-2xl items-center justify-center self-start">
                                {section.icon}
                            </View>
                            <View className="flex-1">
                                <Text className="text-lg font-bold text-gray-900 mb-2">{section.title}</Text>
                                <Text className="text-gray-600 leading-6 text-sm">{section.description}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Additional Detailed Agreement */}
                <View className="mt-8 mb-12 bg-purple-900 rounded-[30px] p-6 relative overflow-hidden">
                    <View className="absolute -top-10 -right-10 w-24 h-24 bg-purple-600 rounded-full opacity-20" />
                    <Text className="text-white text-lg font-black mb-3">Our Promise</Text>
                    <Text className="text-purple-100 text-sm leading-6 mb-4">
                        Skinzy Pakistan guarantees complete transparency. We comply with all regional patient privacy and tele-health regulations, ensuring a secure and trusted AI Skincare routine.
                    </Text>
                    <View className="flex-row items-center gap-2">
                        <CheckCircle size={16} color="#A78BFA" />
                        <Text className="text-purple-200 text-xs font-bold">100% Encrypted & Safe</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

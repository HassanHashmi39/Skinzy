import { useRouter } from 'expo-router';
import { ArrowLeft, BookOpen, AlertTriangle, FileText, Activity, HelpCircle } from 'lucide-react-native';
import React from 'react';
import { 
    SafeAreaView, 
    ScrollView, 
    Text, 
    TouchableOpacity, 
    View 
} from 'react-native';

export default function TermsOfUsePage() {
    const router = useRouter();

    const sections = [
        {
            icon: <AlertTriangle size={22} color="#9333EA" />,
            title: "Medical Disclaimer",
            description: "Skinzy AI skin analysis is an innovative screening and recommendation tool, not a professional medical diagnosis. Always consult with our certified dermatologists or your local doctor before starting any prescription medications or serious skin treatments."
        },
        {
            icon: <Activity size={22} color="#9333EA" />,
            title: "Acceptable Use",
            description: "You agree to use our application only for personal skincare tracking and telehealth consultations. Any attempts to manipulate our AI scanning model, upload malicious content, or scrape clinical data are strictly prohibited."
        },
        {
            icon: <BookOpen size={22} color="#9333EA" />,
            title: "Account Responsibility",
            description: "You are responsible for keeping your credentials and profile information secure. If you book consultations with dermatologists on our platform, you agree to provide truthful medical history for your safety."
        },
        {
            icon: <FileText size={22} color="#9333EA" />,
            title: "Cancellations & Booking",
            description: "Telehealth bookings can be rescheduled or cancelled up to 2 hours before the appointment time. Refunds for cancelled sessions will be processed according to our standard merchant guidelines."
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
                <Text className="text-lg font-black text-gray-900">Terms of Use</Text>
                <View className="w-10 h-10" /> {/* Spacer for centering */}
            </View>

            <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false} className="px-6 py-6">
                {/* Header Badge */}
                <View className="items-center mb-8">
                    <View className="w-16 h-16 bg-purple-50 rounded-3xl items-center justify-center mb-4 border border-purple-100">
                        <FileText size={32} color="#9333EA" />
                    </View>
                    <Text className="text-2xl font-black text-gray-900 text-center mb-2">Terms & Conditions</Text>
                    <Text className="text-gray-500 text-center leading-5 px-4">
                        Please read our terms carefully to understand your rights, responsibilities, and our clinical disclaimers.
                    </Text>
                </View>

                {/* Agreement Banner */}
                <View className="bg-purple-50 rounded-3xl p-5 mb-8 border border-purple-100 flex-row gap-3 items-center">
                    <HelpCircle size={20} color="#9333EA" />
                    <Text className="text-purple-950 font-bold text-xs flex-1">
                        By using the Skinzy application, you agree to these legally binding terms.
                    </Text>
                </View>

                {/* Terms Sections */}
                <View className="gap-6 mb-12">
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
            </ScrollView>
        </SafeAreaView>
    );
}

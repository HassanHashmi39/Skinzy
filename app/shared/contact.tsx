import { useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle, Mail, MapPin, Phone, Send, Sparkles } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { submitContactInquiry } from '../../utils/api';

export default function ContactUsPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [emailError, setEmailError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleEmailChange = (text: string) => {
        setEmail(text);
        if (emailError) {
            setEmailError('');
        }
    };

    const handleSubmit = async () => {
        if (!name || !email || !message) {
            alert('Please fill out all fields.');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setEmailError('Please enter a valid email address');
            return;
        } else {
            setEmailError('');
        }

        try {
            setIsSubmitting(true);
            await submitContactInquiry(name, email, message);
            setIsSuccess(true);
        } catch (error: any) {
            console.error('Error submitting contact form:', error);
            alert(error.message || 'Failed to send your message. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center"
                    >
                        <ArrowLeft size={20} color="#4B5563" />
                    </TouchableOpacity>
                    <Text className="text-lg font-black text-gray-900">Contact Us</Text>
                    <View className="w-10 h-10" />
                </View>

                {isSuccess ? (
                    <View className="flex-1 items-center justify-center px-6">
                        <View className="w-20 h-20 bg-purple-50 rounded-full items-center justify-center mb-6 border border-purple-100">
                            <CheckCircle size={44} color="#9333EA" />
                        </View>
                        <Text className="text-2xl font-black text-gray-900 mb-3 text-center">Message Received!</Text>
                        <Text className="text-gray-500 text-center leading-6 mb-8 max-w-sm">
                            Thank you for reaching out, {name}! Our support team or consulting dermatologist will reply to your email ({email}) within the next 2 hours.
                        </Text>
                        <TouchableOpacity
                            onPress={() => {
                                setIsSuccess(false);
                                setName('');
                                setEmail('');
                                setMessage('');
                            }}
                            className="bg-purple-600 px-8 py-4 rounded-full"
                        >
                            <Text className="text-white font-black text-sm">Send Another Message</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false} className="px-6 py-6">
                        {/* Header Banner */}
                        <View className="items-center mb-8">
                            <View className="w-16 h-16 bg-purple-50 rounded-3xl items-center justify-center mb-4 border border-purple-100">
                                <Sparkles size={32} color="#9333EA" />
                            </View>
                            <Text className="text-2xl font-black text-gray-900 text-center mb-2">Get in Touch</Text>
                            <Text className="text-gray-500 text-center leading-5 px-4">
                                Have questions about AI scans, medical consultancy, or partnership? We are here to support you!
                            </Text>
                        </View>

                        {/* Direct Contact Cards */}
                        <View className="gap-4 mb-8">
                            <View className="flex-row items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <View className="w-10 h-10 bg-white rounded-xl items-center justify-center border border-gray-100">
                                    <Mail size={18} color="#9333EA" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-400 text-xs font-bold uppercase">Support Email</Text>
                                    <Text className="text-gray-800 font-bold text-sm">support@skinzy.pk</Text>
                                </View>
                            </View>

                            <View className="flex-row items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <View className="w-10 h-10 bg-white rounded-xl items-center justify-center border border-gray-100">
                                    <Phone size={18} color="#9333EA" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-400 text-xs font-bold uppercase">Care Line</Text>
                                    <Text className="text-gray-800 font-bold text-sm">+92 (307) 6750975</Text>
                                </View>
                            </View>

                            <View className="flex-row items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <View className="w-10 h-10 bg-white rounded-xl items-center justify-center border border-gray-100">
                                    <MapPin size={18} color="#9333EA" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-400 text-xs font-bold uppercase">Headquarters</Text>
                                    <Text className="text-gray-800 font-bold text-sm">DHA Phase 4, Lahore, Pakistan</Text>
                                </View>
                            </View>
                        </View>

                        {/* Interactive Form */}
                        <View className="bg-white rounded-3xl p-6 border border-purple-50 shadow-sm shadow-purple-50 gap-5 mb-10">
                            <Text className="text-lg font-black text-gray-900">Send us a Message</Text>

                            <View>
                                <Text className="text-gray-700 font-bold mb-2 ml-1 text-sm">Full Name</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-gray-900 font-medium"
                                    placeholder="Ayesha Khan"
                                    placeholderTextColor="#9CA3AF"
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>

                            <View>
                                <Text className="text-gray-700 font-bold mb-2 ml-1 text-sm">Email Address</Text>
                                <TextInput
                                    className={`bg-gray-50 border rounded-2xl px-4 py-4 text-gray-900 font-medium ${emailError ? 'border-red-500 bg-red-50/10' : 'border-gray-200'}`}
                                    placeholder="ayesha@example.com"
                                    placeholderTextColor="#9CA3AF"
                                    value={email}
                                    onChangeText={handleEmailChange}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                                {emailError ? (
                                    <Text className="text-red-500 text-xs font-bold mt-2 ml-1">{emailError}</Text>
                                ) : null}
                            </View>

                            <View>
                                <Text className="text-gray-700 font-bold mb-2 ml-1 text-sm">Message</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-gray-900 font-medium min-h-[100]"
                                    placeholder="How can we help with your skincare analysis or dermatologist appointment?"
                                    placeholderTextColor="#9CA3AF"
                                    value={message}
                                    onChangeText={setMessage}
                                    multiline
                                    textAlignVertical="top"
                                />
                            </View>

                            <TouchableOpacity
                                onPress={handleSubmit}
                                disabled={isSubmitting}
                                className="bg-purple-600 py-4 rounded-2xl flex-row items-center justify-center gap-2 shadow-lg shadow-purple-200 mt-2"
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <>
                                        <Send size={18} color="white" />
                                        <Text className="text-white font-black text-lg">Send Message</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

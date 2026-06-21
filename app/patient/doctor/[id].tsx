import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Star, Clock, User, Award, MessageCircle } from 'lucide-react-native';
import * as api from '../../../utils/api';

export default function DoctorProfilePage() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [doctor, setDoctor] = useState<any>(null);
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const docRes = await api.getDoctorDetails(id);
                if (docRes && docRes.doctor) {
                    setDoctor(docRes.doctor);
                }

                const feedRes = await api.getDoctorRatings(id);
                if (feedRes && feedRes.feedbacks) {
                    setFeedbacks(feedRes.feedbacks);
                }
            } catch (e) {
                console.error('Error fetching doctor profile:', e);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchDetails();
        }
    }, [id]);

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#9333EA" />
            </SafeAreaView>
        );
    }

    if (!doctor) {
        return (
            <SafeAreaView className="flex-1 bg-white p-6 justify-center items-center">
                <Text className="text-gray-500 text-lg">Doctor not found</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-4 bg-purple-100 px-6 py-2 rounded-full">
                    <Text className="text-purple-700 font-bold">Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const averageRating = feedbacks.length > 0 
        ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
        : '5.0';

    return (
        <SafeAreaView style={{ flex: 1 }} className="bg-gray-50">
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Header */}
                <View className="bg-white px-6 pt-4 pb-8 rounded-b-[40px] shadow-sm">
                    <TouchableOpacity 
                        onPress={() => router.back()}
                        className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mb-6"
                    >
                        <ArrowLeft size={20} color="#4b5563" />
                    </TouchableOpacity>

                    <View className="items-center">
                        <View className="w-28 h-28 bg-purple-200 rounded-full items-center justify-center overflow-hidden border-4 border-white shadow-sm mb-4">
                            {doctor.profileImage ? (
                                <Image source={{ uri: doctor.profileImage }} className="w-full h-full" />
                            ) : (
                                <Text className="text-4xl text-purple-700 font-bold">{doctor.name?.charAt(0)}</Text>
                            )}
                        </View>
                        <Text className="text-2xl font-bold text-gray-900 mb-1">{doctor.name}</Text>
                        <Text className="text-purple-600 font-medium mb-4">{doctor.specialization || 'Clinical Dermatologist'}</Text>
                        
                        <View className="flex-row items-center gap-6">
                            <View className="items-center">
                                <View className="flex-row items-center gap-1 mb-1">
                                    <Star size={16} fill="#facc15" color="#facc15" />
                                    <Text className="font-bold text-gray-900 text-lg">{averageRating}</Text>
                                </View>
                                <Text className="text-gray-500 text-xs">Reviews ({feedbacks.length})</Text>
                            </View>
                            <View className="w-[1px] h-8 bg-gray-200" />
                            <View className="items-center">
                                <View className="flex-row items-center gap-1 mb-1">
                                    <Award size={16} color="#9333EA" />
                                    <Text className="font-bold text-gray-900 text-lg">{doctor.experience || '3+'}</Text>
                                </View>
                                <Text className="text-gray-500 text-xs">Years Exp.</Text>
                            </View>
                            <View className="w-[1px] h-8 bg-gray-200" />
                            <View className="items-center">
                                <View className="flex-row items-center gap-1 mb-1">
                                    <User size={16} color="#3B82F6" />
                                    <Text className="font-bold text-gray-900 text-lg">100+</Text>
                                </View>
                                <Text className="text-gray-500 text-xs">Patients</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View className="p-6">
                    {/* About */}
                    <Text className="text-lg font-bold text-gray-900 mb-3">About Doctor</Text>
                    <Text className="text-gray-600 leading-6 mb-8">
                        {doctor.bio || `${doctor.name} is a highly experienced dermatologist specializing in clinical and cosmetic treatments. They are dedicated to providing excellent patient care and customized skincare routines.`}
                    </Text>

                    {/* Feedback */}
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-lg font-bold text-gray-900">Patient Feedback</Text>
                        <View className="flex-row items-center gap-1">
                            <Star size={16} fill="#facc15" color="#facc15" />
                            <Text className="font-bold text-gray-900">{averageRating}</Text>
                        </View>
                    </View>

                    {feedbacks.length > 0 ? (
                        <View className="gap-4 mb-8">
                            {feedbacks.map((f, i) => (
                                <View key={i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                    <View className="flex-row justify-between items-start mb-2">
                                        <View className="flex-row items-center gap-2">
                                            <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center">
                                                <User size={14} color="#3B82F6" />
                                            </View>
                                            <View>
                                                <Text className="font-bold text-gray-900">{f.patient?.name || 'Anonymous Patient'}</Text>
                                                <Text className="text-gray-500 text-[10px]">{new Date(f.createdAt).toLocaleDateString()}</Text>
                                            </View>
                                        </View>
                                        <View className="flex-row">
                                            {[...Array(5)].map((_, j) => (
                                                <Star key={j} size={12} fill={j < f.rating ? "#facc15" : "#e5e7eb"} color={j < f.rating ? "#facc15" : "#e5e7eb"} />
                                            ))}
                                        </View>
                                    </View>
                                    {f.comment && (
                                        <Text className="text-gray-600 mt-2 leading-5 text-sm">"{f.comment}"</Text>
                                    )}
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View className="bg-white p-8 rounded-2xl items-center justify-center border border-dashed border-gray-300 mb-8">
                            <MessageCircle size={32} color="#D1D5DB" className="mb-3" />
                            <Text className="text-gray-500 font-medium text-center">No feedback yet.</Text>
                            <Text className="text-gray-400 text-sm text-center mt-1">Be the first to leave a review after your appointment.</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Bottom Actions */}
            <View className="absolute bottom-0 w-full bg-white p-4 pb-8 border-t border-gray-100 shadow-lg flex-row items-center justify-between">
                <View>
                    <Text className="text-gray-500 text-xs">Consultation Fee</Text>
                    <Text className="text-purple-600 font-bold text-lg">PKR {doctor.consultationFee || '2500'}</Text>
                </View>
                <TouchableOpacity 
                    onPress={() => router.push('/patient/appointments')}
                    className="bg-purple-600 px-8 py-3.5 rounded-full shadow-md shadow-purple-200"
                >
                    <Text className="text-white font-bold">Book Appointment</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

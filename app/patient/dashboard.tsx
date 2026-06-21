import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Bell, Calendar, Camera, ChevronRight, MessageSquare, ShoppingBag, Sparkles, Sun, TrendingUp, Umbrella, User, Droplets, Thermometer, Wind, Cloud, CloudRain, CloudSnow, CloudLightning, Info } from 'lucide-react-native';
import React, { useCallback, useState, useEffect, useRef } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, Platform, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Footer from '../../components/Footer';
import * as api from '../../utils/api';
import { io, Socket } from 'socket.io-client';

const { width } = Dimensions.get('window');

const MOCK_USER = {
    name: 'Ayesha',
    skinType: 'Combination',
    lastAnalysisDate: 'Dec 30, 2024',
    skinScore: 78,
};

const MOCK_WEATHER = {
    city: 'Loading...',
    temp: '--',
    condition: 'Loading...',
    uvIndex: '--',
    uvVal: 0,
    feelsLike: '--',
    humidity: '--',
    wind: '--',
    lastUpdated: '--'
};

export default function PatientDashboard() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [userData, setUserData] = useState<any>(null);
    const [routineData, setRoutineData] = useState<any>(null);
    const [weather, setWeather] = useState<any>(MOCK_WEATHER);
    const [weatherError, setWeatherError] = useState(false);
    const [allDoctors, setAllDoctors] = useState<any[]>([]);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [latestAnalysis, setLatestAnalysis] = useState<any>(null);
    const socketRef = useRef<Socket | null>(null);

    // Real-time notifications: update badge when doctor confirms/cancels
    useEffect(() => {
        let mounted = true;
        const setupSocket = async () => {
            try {
                const res = await api.getCurrentUser();
                const userId = res?.user?._id;
                if (!userId || !mounted) return;

                const socket = io(api.SOCKET_URL, {
                    transports: ['websocket'],
                    reconnection: true,
                });

                socket.on('connect', () => {
                    socket.emit('join', userId);
                });

                socket.on('new_notification', () => {
                    setUnreadNotifications(prev => prev + 1);
                });

                socketRef.current = socket;
            } catch (e) {
                console.error('Patient socket error:', e);
            }
        };
        setupSocket();
        return () => {
            mounted = false;
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, []);

    // Enforce Patient Role redirecting to login if invalid
    const verifyRoleAndFetchData = async () => {
        try {
            const userResponse = await api.getCurrentUser();
            if (userResponse && userResponse.user) {
                const role = userResponse.user.role || userResponse.user.userType || userResponse.role || userResponse.userType;
                if (role !== 'patient') {
                    if (Platform.OS === 'web') {
                        window.alert('Access Denied: Please log in as a patient.');
                    } else {
                        Alert.alert('Access Denied', 'Please log in as a patient.');
                    }
                    router.replace('/shared/login');
                    return;
                }
                setUserData(userResponse.user);
                fetchWeather(userResponse.user.city || 'Karachi');
            } else {
                router.replace('/shared/login');
                return;
            }
        } catch (err) {
            console.error('Auth verification error:', err);
            router.replace('/shared/login');
            return;
        }

        // Fetch independent dashboard metrics
        try {
            const routine = await api.getRoutine();
            if (routine) setRoutineData(routine);
        } catch (e) { console.error('Routine error:', e); }

        try {
            const apts = await api.getAppointments();
            if (apts?.appointments) setAppointments(apts.appointments);
        } catch (e) { console.error('Apts error:', e); }

        try {
            const docs = await api.getDoctors();
            if (docs?.doctors) setAllDoctors(docs.doctors);
        } catch (e) { console.error('Doctors error:', e); }

        try {
            const notifs = await api.getNotifications();
            if (notifs?.notifications) {
                const unread = notifs.notifications.filter((n: any) => !n.isRead).length;
                setUnreadNotifications(unread);
            }
        } catch (e) { console.error('Notifs error:', e); }

        try {
            const analysesRes = await api.getAnalysisHistory();
            if (analysesRes?.analyses && analysesRes.analyses.length > 0) {
                setLatestAnalysis(analysesRes.analyses[0]);
            } else {
                setLatestAnalysis(null);
            }
        } catch (e) { console.error('Latest analysis fetch error:', e); }

        setIsLoading(false);
    };

    useFocusEffect(
        useCallback(() => {
            verifyRoleAndFetchData();
        }, [])
    );

    // Weather Fetching
    const fetchWeather = async (city: string) => {
        try {
            setWeatherError(false);
            const data = await api.getWeatherRecommendations(city);
            if (data && !data.message) {
                setWeather(data);
            } else {
                setWeatherError(true);
            }
        } catch (e) {
            console.error('Weather fetch error:', e);
            setWeatherError(true);
        }
    };

    // Auto-update temperature/weather every 18 minutes automatically
    useEffect(() => {
        const intervalId = setInterval(() => {
            if (userData?.city) {
                fetchWeather(userData.city);
            } else {
                fetchWeather('Karachi');
            }
        }, 18 * 60 * 1000);

        return () => clearInterval(intervalId);
    }, [userData?.city]);

    const getChatDoctorId = () => {
        if (appointments && appointments.length > 0) {
            const validApts = appointments.filter(a => a.doctor && a.doctor._id);
            if (validApts.length > 0) {
                return validApts[0].doctor._id;
            }
        }
        if (allDoctors && allDoctors.length > 0) {
            return allDoctors[0]._id;
        }
        return null;
    };

    const handleChatWithDoctor = () => {
        const docId = getChatDoctorId();
        if (docId) {
            router.push(`/patient/chat/${docId}`);
        } else {
            router.push('/patient/chat');
        }
    };

    const renderWeatherIcon = (condition: string) => {
        const cond = (condition || '').toLowerCase();
        if (cond.includes('sunny') || cond.includes('clear')) {
            return <Sun size={32} color="#FBBF24" />;
        }
        if (cond.includes('rain') || cond.includes('drizzle') || cond.includes('showers')) {
            return <CloudRain size={32} color="#93C5FD" />;
        }
        if (cond.includes('thunderstorm')) {
            return <CloudLightning size={32} color="#FBBF24" />;
        }
        if (cond.includes('snow')) {
            return <CloudSnow size={32} color="#FFFFFF" />;
        }
        return <Cloud size={32} color="#E5E7EB" />;
    };

    if (isLoading && !userData) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#A855F7" />
            </SafeAreaView>
        );
    }

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };
    const greeting = getGreeting();
    const rawName = userData?.name?.split(' ')[0] || MOCK_USER.name;
    const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'Never';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return 'Never';
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getCalculatedScore = () => {
        if (!latestAnalysis || !latestAnalysis.results) return null;
        const issues = latestAnalysis.results.issues;
        if (issues) {
            const avg = ((issues.acne || 0) + (issues.pigmentation || 0) + (issues.dryness || 0) + (issues.oiliness || 0) + (issues.sensitivity || 0)) / 5;
            return Math.round(100 - avg);
        }
        return null;
    };

    const calculatedScore = getCalculatedScore();

    return (
        <View className="flex-1 bg-gray-50">
            <ScrollView style={{ flex: 1 }} className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
                {/* Header */}
                <View className="px-6 pt-5 pb-2 flex-row justify-between items-center">
                    <View className="flex-row items-center gap-3">
                        <TouchableOpacity
                            onPress={() => router.push('/patient/profile')}
                            className="w-12 h-12 bg-purple-100 rounded-full items-center justify-center shadow-sm overflow-hidden border border-purple-200"
                        >
                            {userData?.profileImage ? (
                                <Image source={{ uri: userData.profileImage }} className="w-full h-full" />
                            ) : (
                                <User size={24} color="#7E22CE" />
                            )}
                        </TouchableOpacity>
                        <View>
                            <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">{greeting},</Text>
                            <Text className="text-2xl font-black text-gray-900 leading-tight mt-0.5">{displayName} ✨</Text>
                            <Text className="text-[10px] text-purple-600 font-extrabold uppercase mt-0.5">
                                {latestAnalysis?.results?.skinType || userData?.skinType || 'Not Assessed'} Skin • Score: {calculatedScore !== null ? `${calculatedScore}%` : 'N/A'}
                            </Text>
                        </View>
                    </View>
                    
                    <TouchableOpacity
                        onPress={() => router.push('/shared/notifications')}
                        className="w-11 h-11 bg-white rounded-full items-center justify-center shadow-sm border border-gray-100 relative"
                    >
                        <Bell size={20} color="#4B5563" />
                        {unreadNotifications > 0 && (
                            <View className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full items-center justify-center border border-white">
                                <Text className="text-white text-[9px] font-black">
                                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Weather Card Mockup - Redesigned to look like a real widget */}
                <View className="px-6 mt-4">
                    <View className="bg-blue-600 rounded-[32px] p-6 shadow-lg">
                        {weatherError ? (
                            <View className="flex-1 py-4 justify-center items-center">
                                <Text className="text-white font-bold text-lg">Unable to fetch weather right now</Text>
                                <Text className="text-blue-200 text-xs mt-1">Please check your network connection</Text>
                            </View>
                        ) : (
                            <>
                                <View className="flex-col md:flex-row justify-between items-center gap-6">
                                    {/* Left Section: Temp & Condition */}
                                <View className="flex-row items-center gap-4">
                                    <View className="bg-blue-500/50 p-4 rounded-3xl border border-blue-400">
                                        {renderWeatherIcon(weather.condition)}
                                    </View>
                                    <View>
                                        <Text className="text-white font-bold text-xs uppercase tracking-wider">{weather.city || 'Location'}</Text>
                                        <Text className="text-white font-black text-4xl leading-none mt-1">{weather.temp || '--'}</Text>
                                        <Text className="text-blue-100 font-bold text-base mt-1">{weather.condition || '--'}</Text>
                                        <Text className="text-blue-200 text-[10px] mt-1">Updated: {weather.lastUpdated || '--'}</Text>
                                    </View>
                                </View>

                                {/* Middle Section: Metrics List */}
                                <View className="flex-row flex-wrap justify-between md:justify-start gap-x-6 gap-y-3 max-w-sm">
                                    <View className="flex-row items-center gap-2 min-w-[110px]">
                                        <Thermometer size={14} color="#93C5FD" />
                                        <View>
                                            <Text className="text-blue-200 text-[10px] uppercase font-bold">Feels like</Text>
                                            <Text className="text-white font-extrabold text-sm">{weather.feelsLike || '--'}</Text>
                                        </View>
                                    </View>
                                    <View className="flex-row items-center gap-2 min-w-[110px]">
                                        <Droplets size={14} color="#93C5FD" />
                                        <View>
                                            <Text className="text-blue-200 text-[10px] uppercase font-bold">Humidity</Text>
                                            <Text className="text-white font-extrabold text-sm">{weather.humidity || '--'}</Text>
                                        </View>
                                    </View>
                                    <View className="flex-row items-center gap-2 min-w-[110px]">
                                        <Sun size={14} color="#93C5FD" />
                                        <View>
                                            <Text className="text-blue-200 text-[10px] uppercase font-bold">UV Index</Text>
                                            <Text className="text-white font-extrabold text-sm">
                                                {weather.uvVal !== undefined ? `${weather.uvVal} (${weather.uvIndex})` : '--'}
                                            </Text>
                                        </View>
                                    </View>
                                    <View className="flex-row items-center gap-2 min-w-[110px]">
                                        <Wind size={14} color="#93C5FD" />
                                        <View>
                                            <Text className="text-blue-200 text-[10px] uppercase font-bold">Wind</Text>
                                            <Text className="text-white font-extrabold text-sm">{weather.wind || '--'}</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Right Section: Chat with Doctor Button */}
                                <TouchableOpacity
                                    onPress={handleChatWithDoctor}
                                    className="bg-white/10 hover:bg-white/20 border border-white/30 px-5 py-3.5 rounded-2xl flex-row items-center gap-2 w-full md:w-auto justify-center"
                                >
                                    <MessageSquare size={16} color="white" />
                                    <Text className="text-white font-bold text-sm">Chat with Doctor</Text>
                                </TouchableOpacity>
                            </View>

                                {/* Weather-Based Skincare Tips */}
                                <View className="mt-4 border-t border-blue-400/30 pt-4 w-full">
                                    <Text className="text-blue-100 font-bold text-xs uppercase tracking-wider mb-2">Recommended for Current Weather</Text>
                                    <View className="flex-row flex-wrap gap-2">
                                        <View className="bg-white/10 px-3 py-1.5 rounded-full flex-row items-center gap-1.5 border border-white/20">
                                            <Sun size={12} color="#fcd34d" />
                                            <Text className="text-white text-xs font-medium">
                                                {weather.uvVal && parseInt(weather.uvVal) >= 5 ? 'SPF 50+ Sunscreen' : 'SPF 30 Sunscreen'}
                                            </Text>
                                        </View>
                                        <View className="bg-white/10 px-3 py-1.5 rounded-full flex-row items-center gap-1.5 border border-white/20">
                                            <Droplets size={12} color="#93c5fd" />
                                            <Text className="text-white text-xs font-medium">
                                                {weather.humidity && parseInt(weather.humidity) < 40 ? 'Heavy Moisturizer' : (weather.temp && parseInt(weather.temp) >= 30 ? 'Light Moisturizer' : 'Daily Moisturizer')}
                                            </Text>
                                        </View>
                                        {weather.temp && parseInt(weather.temp) >= 30 && (
                                            <View className="bg-white/10 px-3 py-1.5 rounded-full flex-row items-center gap-1.5 border border-white/20">
                                                <Wind size={12} color="#86efac" />
                                                <Text className="text-white text-xs font-medium">Salicylic Acid Wash (Oil Control)</Text>
                                            </View>
                                        )}
                                        {weather.humidity && parseInt(weather.humidity) >= 70 && (
                                            <View className="bg-white/10 px-3 py-1.5 rounded-full flex-row items-center gap-1.5 border border-white/20">
                                                <Sparkles size={12} color="#d8b4fe" />
                                                <Text className="text-white text-xs font-medium">Clay Mask (Pore Detox)</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </>
                        )}
                    </View>
                </View>

                {/* Skin Analysis Summary */}
                <View className="px-6 mt-8">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-xl font-bold text-gray-900">Your Skin Analysis</Text>
                        <TouchableOpacity onPress={() => router.push('/patient/scan')}>
                            <Text className="text-purple-600 font-medium">New Scan</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        onPress={() => router.push('/patient/history?filter=analysis')}
                        className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
                    >
                        <View className="flex-row items-center justify-between mb-4">
                            <View className="flex-row items-center gap-3">
                                <View className="w-12 h-12 bg-purple-100 rounded-2xl items-center justify-center">
                                    <Sparkles size={24} color="#7E22CE" />
                                </View>
                                <View>
                                    <Text className="text-gray-900 font-bold text-lg">Health Score: {calculatedScore !== null ? `${calculatedScore}%` : 'N/A'}</Text>
                                    <Text className="text-gray-500 text-sm">Last scan: {latestAnalysis ? formatDate(latestAnalysis.createdAt || latestAnalysis.datePerformed) : 'No scans yet'}</Text>
                                </View>
                            </View>
                            {latestAnalysis && (
                                <View className="bg-green-100 px-3 py-1 rounded-full">
                                    <Text className="text-green-700 font-bold text-xs">IMPROVING</Text>
                                </View>
                            )}
                        </View>

                        <View className="flex-row gap-3">
                            <View className="flex-1 bg-gray-50 p-3 rounded-2xl">
                                <Text className="text-gray-500 text-xs mb-1">Top Concern</Text>
                                <Text className="text-gray-900 font-bold">{latestAnalysis?.results?.detectedDisease || latestAnalysis?.results?.topConcern || 'None'}</Text>
                            </View>
                            <View className="flex-1 bg-gray-50 p-3 rounded-2xl">
                                <Text className="text-gray-500 text-xs mb-1">Skin Type</Text>
                                <Text className="text-gray-900 font-bold">{latestAnalysis?.results?.skinType || userData?.skinType || 'Not Assessed'}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Quick Actions Grid (Chat Removed, balanced 4 cards) */}
                <View className="px-6 mt-8">
                    <Text className="text-xl font-bold text-gray-900 mb-4">Quick Actions</Text>
                    <View className="flex-row flex-wrap justify-between gap-4">
                        <ActionCard
                            title="Scan Skin"
                            icon={<Camera size={24} color="#A855F7" />}
                            bgColor="bg-purple-50"
                            onPress={() => router.push('/patient/scan')}
                        />
                        <ActionCard
                            title="View Results"
                            icon={<Sparkles size={24} color="#6366F1" />}
                            bgColor="bg-indigo-50"
                            onPress={() => router.push('/patient/history?filter=analysis')}
                        />
                        <ActionCard
                            title="Skincare Routine"
                            icon={<TrendingUp size={24} color="#3B82F6" />}
                            bgColor="bg-blue-50"
                            onPress={() => router.push('/patient/routine')}
                        />
                        <ActionCard
                            title="Products"
                            icon={<ShoppingBag size={24} color="#EC4899" />}
                            bgColor="bg-pink-50"
                            onPress={() => router.push('/patient/products')}
                        />
                    </View>
                </View>

                {/* Recommended Doctors */}
                <View className="px-6 mt-8">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-xl font-bold text-gray-900">Top Dermatologists</Text>
                        <TouchableOpacity onPress={() => router.push('/patient/appointments')}>
                            <Text className="text-purple-600 font-medium">View All</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-4">
                        {allDoctors.length > 0 ? (
                            allDoctors.map((doc: any) => (
                                <TouchableOpacity
                                    key={doc._id}
                                    onPress={() => router.push('/patient/appointments')}
                                    className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 mr-4 items-center w-40"
                                >
                                    <View className="w-20 h-20 bg-purple-100 rounded-full mb-3 items-center justify-center overflow-hidden">
                                        {doc.profileImage ? (
                                            <Image source={{ uri: doc.profileImage }} className="w-full h-full" />
                                        ) : (
                                            <Text className="text-2xl text-purple-700 font-bold">{doc.name.charAt(0)}</Text>
                                        )}
                                    </View>
                                    <Text className="text-gray-900 font-bold text-center" numberOfLines={1}>{doc.name}</Text>
                                    <Text className="text-gray-500 text-xs text-center mb-2">{doc.specialization || 'Skin Expert'}</Text>
                                    <View className="bg-purple-600 px-3 py-1.5 rounded-full w-full">
                                        <Text className="text-white font-bold text-[10px] text-center">BOOK</Text>
                                    </View>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <View className="bg-white rounded-2xl p-4 w-60 border border-dashed border-gray-300 items-center justify-center">
                                <Text className="text-gray-400 text-xs">No doctors available</Text>
                            </View>
                        )}
                    </ScrollView>
                </View>

                {/* Daily Routine Progress */}
                <View className="px-6 mt-8">
                    <Text className="text-xl font-bold text-gray-900 mb-4">Daily Routine</Text>
                    <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex-row items-center">
                        {routineData ? (
                            <>
                                <View className="w-16 h-16 rounded-full border-4 border-purple-500 items-center justify-center mr-4">
                                    <Text className="text-purple-700 font-bold text-lg">
                                        {(() => {
                                            const currentDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];
                                            const todayTasks = routineData.morningRoutine?.filter((t: any) => !t.days || t.days.includes(currentDay)) || [];
                                            return `${todayTasks.filter((t: any) => t.isCompleted).length}/${todayTasks.length}`;
                                        })()}
                                    </Text>
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-900 font-bold text-lg">Morning Routine</Text>
                                    <Text className="text-gray-500 text-sm">
                                        {(() => {
                                            const currentDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];
                                            const todayTasks = routineData.morningRoutine?.filter((t: any) => !t.days || t.days.includes(currentDay)) || [];
                                            const remaining = todayTasks.length - todayTasks.filter((t: any) => t.isCompleted).length;
                                            return `${remaining} steps remaining for today`;
                                        })()}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => router.push('/patient/routine')}
                                        className="mt-2 flex-row items-center"
                                    >
                                        <Text className="text-purple-600 font-medium mr-1">View Routine</Text>
                                        <ChevronRight size={16} color="#9333EA" />
                                    </TouchableOpacity>
                                </View>
                            </>
                        ) : (
                            <View className="flex-1 items-center justify-center py-4">
                                <Text className="text-gray-500">No routine set up yet</Text>
                                <TouchableOpacity
                                    onPress={() => router.push('/patient/routine')}
                                    className="mt-2"
                                >
                                    <Text className="text-purple-600 font-bold">Set Up Now</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>

                {/* Upcoming Consultations */}
                <View className="px-6 mt-8 mb-12">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-xl font-bold text-gray-900">Upcoming Consultations</Text>
                        <TouchableOpacity onPress={() => router.push('/patient/history')}>
                            <Text className="text-gray-500 font-medium">History</Text>
                        </TouchableOpacity>
                    </View>

                    {appointments && appointments.length > 0 ? (
                        appointments.filter(a => a.status === 'confirmed' || a.status === 'pending').slice(0, 2).map((apt: any) => (
                            <View key={apt._id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 mb-4 flex-row items-center">
                                <View className="w-12 h-12 bg-blue-50 rounded-2xl items-center justify-center mr-4">
                                    <Calendar size={24} color="#3B82F6" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-900 font-bold">{apt.doctor.name}</Text>
                                    <Text className="text-gray-500 text-sm">{apt.appointmentDate} • {apt.appointmentTime}</Text>
                                    <View className={`px-2 py-0.5 rounded-full self-start mt-1 ${apt.status === 'confirmed' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                                        <Text className={`text-[10px] font-bold ${apt.status === 'confirmed' ? 'text-green-700' : 'text-yellow-700'}`}>{apt.status.toUpperCase()}</Text>
                                    </View>
                                </View>
                                {apt.status === 'confirmed' && (
                                    <TouchableOpacity 
                                        className="bg-blue-600 px-4 py-2 rounded-xl"
                                        onPress={() => {
                                            if (apt.doctor && apt.doctor._id) {
                                                router.push(`/patient/chat/${apt.doctor._id}`);
                                            } else {
                                                router.push('/patient/chat');
                                            }
                                        }}
                                    >
                                        <Text className="text-white font-bold text-xs">JOIN</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))
                    ) : (
                        <View className="bg-white rounded-3xl p-8 items-center border border-dashed border-gray-300">
                            <Text className="text-gray-500">No upcoming appointments</Text>
                            <TouchableOpacity onPress={() => router.push('/patient/appointments')} className="mt-2">
                                <Text className="text-purple-600 font-bold">Book One Now</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                <View className="h-10" />
                <Footer />
            </ScrollView>
        </View>
    );
}

function ActionCard({ title, icon, bgColor, onPress }: { title: string; icon: any; bgColor: string; onPress: () => void }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className={`${bgColor} rounded-3xl p-4 items-center justify-center shadow-sm w-[46%] min-h-[110px] mb-2`}
        >
            <View className="mb-2">{icon}</View>
            <Text className="text-gray-900 font-bold text-xs text-center">{title}</Text>
        </TouchableOpacity>
    );
}

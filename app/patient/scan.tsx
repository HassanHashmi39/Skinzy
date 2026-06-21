import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Camera, ChevronLeft, Image as ImageIcon, Info, Sparkles, X, FlipHorizontal } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, Image, Modal, Platform, SafeAreaView, ScrollView, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import Footer from '../../components/Footer';
import * as api from '../../utils/api';

const { width } = Dimensions.get('window');

export default function SkinAnalysisPage() {
    const { width: winWidth, height } = useWindowDimensions();
    const isLargeScreen = winWidth > 768;

    const [isGuest, setIsGuest] = useState(true);

    // Enforce Patient Role or Guest access (no login required)
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
                console.log("Accessing scan page as guest");
            }
        };
        verifyRole();
    }, []);

    useEffect(() => {
        // Pre-check AI Server connection on load (Python Flask on port 5001)
        const checkServer = async () => {
            const derivedServerUrl = api.SOCKET_URL.replace(':4445', ':5001');
            const urls = [
                `${derivedServerUrl}/api/health`,
                `http://${Platform.OS === 'web' ? window.location.hostname : '127.0.0.1'}:5001/api/health`,
                'http://127.0.0.1:5001/api/health',
                'http://localhost:5001/api/health'
            ];
            for (const url of urls) {
                try {
                    const r = await fetch(url);
                    if (r.ok) {
                        console.log("✅ Proactive check: AI Server found at", url);
                        break;
                    }
                } catch (e) { }
            }
        };
        checkServer();
    }, []);

    const [image, setImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState(0);
    const [scanLineAnim] = useState(new Animated.Value(0));
    const [dots, setDots] = useState('');

    // Rejection Modal state
    const [rejectionModal, setRejectionModal] = useState<{
        visible: boolean;
        title: string;
        reason: string;
        tips: string[];
    }>({
        visible: false,
        title: '',
        reason: '',
        tips: [],
    });

    const showRejectionModal = (title: string, reason: string, tips: string[] = []) => {
        setIsAnalyzing(false);
        setRejectionModal({ visible: true, title, reason, tips });
    };

    const closeRejectionModal = () => {
        setRejectionModal(prev => ({ ...prev, visible: false }));
        setImage(null);
    };

    const [isCameraActive, setIsCameraActive] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [isMirrored, setIsMirrored] = useState(false);
    const videoRef = useRef<any>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        if (isAnalyzing) {
            startScanAnimation();
            const interval = setInterval(() => {
                setAnalysisProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        finishAnalysis();
                        return 100;
                    }
                    return prev + 2;
                });
            }, 100);

            const dotInterval = setInterval(() => {
                setDots(prev => prev.length >= 3 ? '' : prev + '.');
            }, 500);

            return () => {
                clearInterval(interval);
                clearInterval(dotInterval);
            };
        }
    }, [isAnalyzing]);

    // Clean up camera on unmount
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

// Attach stream to video element when it becomes available
useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
    }
}, [isCameraActive, videoRef.current, streamRef.current]);

const startScanAnimation = () => {
    scanLineAnim.setValue(0);
    Animated.loop(
        Animated.sequence([
            Animated.timing(scanLineAnim, {
                toValue: 1,
                duration: 2000,
                useNativeDriver: true,
            }),
            Animated.timing(scanLineAnim, {
                toValue: 0,
                duration: 2000,
                useNativeDriver: true,
            })
        ])
    ).start();
};

const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
        Alert.alert('Permission needed', 'We need access to your gallery to analyze your skin.');
        return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
    });

    if (!result.canceled) {
        const croppedUri = await cropUploadedImage(result.assets[0].uri);
        setImage(croppedUri);
    }
};

const takePhoto = async () => {
    if (Platform.OS === 'web') {
        startWebCamera();
        return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
        Alert.alert('Permission needed', 'We need access to your camera to analyze your skin.');
        return;
    }

    const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
    });

    if (!result.canceled) {
        const croppedUri = await cropUploadedImage(result.assets[0].uri);
        setImage(croppedUri);
    }
};

const startWebCamera = async () => {
    setCameraError(null);
    try {
        // Stop existing stream if we are flipping
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }

        const constraints = {
            video: {
                facingMode: "user",
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        setIsCameraActive(true);
        setImage(null);
    } catch (err: any) {
        console.error("Camera access error:", err);
        let msg = "Could not access camera.";
        if (err.name === 'NotAllowedError') msg = "Camera access was denied. Please allow camera permission.";
        else if (err.name === 'NotFoundError') msg = "No camera device found.";
        else if (err.name === 'NotReadableError') msg = "Camera is already in use by another application.";
        else if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
            msg = "Camera requires HTTPS to work on a hosted website.";
        }
        setCameraError(msg);
        Alert.alert("Camera Error", msg);
    }
};

const stopWebCamera = () => {
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
    setIsCameraActive(false);
};

const toggleMirror = () => {
    setIsMirrored(prev => !prev);
};

const captureWebPhoto = () => {
    if (!videoRef.current || !streamRef.current) {
        console.error("Camera not ready for capture");
        return;
    }

    const video = videoRef.current;

    if (video.readyState < 2 || video.videoWidth === 0) {
        console.warn("Video not ready, retrying capture...");
        setTimeout(captureWebPhoto, 100);
        return;
    }

    const canvas = document.createElement('canvas');
    const size = Math.min(video.videoWidth, video.videoHeight);
    const startX = (video.videoWidth - size) / 2;
    const startY = (video.videoHeight - size) / 2;

    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        if (isMirrored) {
            ctx.translate(size, 0);
            ctx.scale(-1, 1);
        }
        ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size);
        if (isMirrored) {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        setImage(dataUrl);
        stopWebCamera();
    }
};

const cropUploadedImage = async (uri: string): Promise<string> => {
    if (Platform.OS !== 'web') return uri;

    return new Promise((resolve) => {
        const img = new window.Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const size = Math.min(img.width, img.height);
            const startX = (img.width - size) / 2;
            const startY = (img.height - size) / 2;

            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, startX, startY, size, size, 0, 0, size, size);
                resolve(canvas.toDataURL('image/jpeg', 0.95));
            } else {
                resolve(uri);
            }
        };
        img.onerror = () => resolve(uri);
        img.src = uri;
    });
};

const startAnalysis = () => {
    if (!image) {
        Alert.alert('Image required', 'Please take or pick a photo of your skin first.');
        return;
    }
    setIsAnalyzing(true);
};

const finishAnalysis = async () => {
    if (!image) return;

    const derivedDiagnoseUrl = api.SOCKET_URL.replace(':4445', ':5001') + '/api/diagnose';
    const AI_SERVER_URL = process.env.EXPO_PUBLIC_AI_SERVER_URL ||
        (Platform.OS === 'web'
            ? `http://${window.location.hostname}:5001/api/diagnose`
            : derivedDiagnoseUrl);

    try {
        await new Promise(resolve => setTimeout(resolve, 500));
        const formData = new FormData();

        if (Platform.OS === 'web') {
            try {
                const response = await fetch(image);
                const blob = await response.blob();
                formData.append('image', blob, 'skin_image.jpg');
            } catch (blobErr) {
                console.error("Failed to convert image to blob:", blobErr);
                setIsAnalyzing(false);
                Alert.alert('Image Error', 'Failed to process the selected image for upload.');
                return;
            }
        } else {
            formData.append('image', {
                uri: image,
                type: 'image/jpeg',
                name: 'skin_image.jpg',
            } as any);
        }

        try {
            const medicalDataStr = await AsyncStorage.getItem('patientMedicalHistory');
            if (medicalDataStr) {
                formData.append('medical_data', medicalDataStr);
            }
        } catch (e) {
            console.log('Failed to attach medical profile.');
        }

        const tryFetch = async (url: string) => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    body: formData,
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                return response;
            } catch (e) {
                clearTimeout(timeoutId);
                throw e;
            }
        };

        try {
            let response;
            const urlsToTry = [
                AI_SERVER_URL,
                api.SOCKET_URL.replace(':4445', ':5001') + '/api/diagnose',
                `http://${Platform.OS === 'web' ? window.location.hostname : '127.0.0.1'}:5001/api/diagnose`,
                'http://127.0.0.1:5001/api/diagnose',
                'http://localhost:5001/api/diagnose'
            ];

            const uniqueUrls = Array.from(new Set(urlsToTry.filter(url => url && url.startsWith('http'))));

            let lastErr;
            for (const url of uniqueUrls) {
                try {
                    response = await tryFetch(url);
                    if (response) break;
                } catch (err) {
                    lastErr = err;
                }
            }

            if (!response) {
                throw lastErr || new Error("All connection attempts failed");
            }

            const aiResult = await response.json();

            if (aiResult.status === 'error') {
                const title = 'Analysis Failed';
                const message = aiResult.message || 'The AI could not process this image.';
                if (Platform.OS === 'web') {
                    window.alert(`${title}\n\n${message}`);
                } else {
                    Alert.alert(title, message);
                }
                showRejectionModal(
                    title,
                    message,
                    ['Ensure good lighting', 'Use a clear, close-up photo', 'Avoid blurry or dark images']
                );
                return;
            }

            if (aiResult.status === 'unclear' || aiResult.request_retry === true) {
                const title = 'Image Not Accepted';
                const message = aiResult.message || 'The image is not correct or too unclear. Please try again.';
                if (Platform.OS === 'web') {
                    window.alert(`${title}\n\n${message}`);
                } else {
                    Alert.alert(title, message);
                }
                showRejectionModal(
                    title,
                    message,
                    [
                        'Use bright, natural lighting',
                        'Hold camera steady to avoid blur',
                        'Bring the affected skin area closer',
                        'Remove glasses or heavy makeup',
                    ]
                );
                return;
            }

            processAIResult(aiResult);
        } catch (err) {
            const title = 'Server Unreachable';
            const message = 'The AI analysis server is not responding. Please make sure it is running.';
            if (Platform.OS === 'web') {
                window.alert(`${title}\n\n${message}`);
            } else {
                Alert.alert(title, message);
            }
            showRejectionModal(
                title,
                message,
                ['Check that the Python API server is started', 'Ensure you are on the correct network']
            );
        }

    } catch (error) {
        if (Platform.OS === 'web') {
            window.alert('Analysis Failed\n\nCould not process image. Please try again.');
        } else {
            Alert.alert('Analysis Failed', 'Could not process image. Please try again.');
        }
        setIsAnalyzing(false);
    }
};

const processAIResult = (aiResult: any) => {
    setIsAnalyzing(false);
    setAnalysisProgress(0);

    const confidence = aiResult.confidence || 0.5;
    const isLowCondition = confidence < 0.55;

    if (isLowCondition) {
        if (Platform.OS === 'web') {
            // Web doesn't support Alert.alert custom buttons properly, so just navigate directly
            navigateToResults(aiResult);
        } else {
            Alert.alert(
                'Concern Detected',
                'Based on our AI analysis, your skin may need professional attention. Would you like to book an appointment with a dermatologist?',
                [
                    { text: 'See Results First', onPress: () => navigateToResults(aiResult) },
                    {
                        text: 'Book Appointment', onPress: () => {
                            navigateToResults(aiResult);
                            router.push('/patient/appointments');
                        }, style: 'default'
                    }
                ]
            );
        }
    } else {
        navigateToResults(aiResult);
    }
};

const navigateToResults = async (aiResult: any) => {
    const disease = aiResult.disease || 'normal';
    const details = aiResult.details || {};
    const confidencePct = Math.round((aiResult.confidence || 0.5) * 100);
    const modelScores = aiResult.model_scores || {};
    const confidence = aiResult.confidence || 0.5;
    const conditionLevel = disease === 'normal'
        ? 'good'
        : confidence >= 0.75
            ? 'severe'
            : confidence >= 0.55
                ? 'moderate'
                : 'mild';

    const issueScores = {
        acne: Math.round((modelScores.acne_vulgaris || modelScores.comedones || (disease.includes('acne') ? confidence : 0.05)) * 100),
        pigmentation: Math.round((modelScores.melasma || (disease.includes('melasma') ? confidence : 0.05)) * 100),
        dryness: Math.round((modelScores.eczema_atopic_dermatitis || modelScores.psoriasis || (disease.includes('eczema') ? confidence : 0.05)) * 100),
        oiliness: Math.round((modelScores.seborrheic_keratosis || (disease.includes('seborrheic') ? confidence : 0.10)) * 100),
        darkCircles: 5,
        sensitivity: Math.round((modelScores.rosacea || modelScores.urticaria || (disease.includes('rosacea') ? confidence : 0.10)) * 100),
    };

    const results = {
        skinType: details.name_en || disease,
        detectedDisease: details.name_en || disease,
        conditionLevel,
        confidence: `${confidencePct}%`,
        advice: details.treatment?.[0] || 'Maintain a consistent skincare routine.',
        doctor: confidence < 0.55 ? 'Recommended' : 'Not required',
        skinTone: 'Medium',
        is_uncertain: (aiResult.confidence || 1) < 0.5,
        issues: issueScores,
        recommendations: (details.products || []).map((p: any) =>
            typeof p === 'string' ? { name: p, brand: '', category: 'Skincare', price: '', tier: 'Recommended' }
                : { name: p.name || '', brand: p.brand || '', category: p.category || 'Skincare', price: p.price || '', tier: p.tier || 'Recommended' }
        ),
        dos: (details.treatment || []).filter((t: string) => t.toLowerCase().includes('✓') || t.toLowerCase().startsWith('do')),
        donts: (details.treatment || []).filter((t: string) => t.toLowerCase().includes('avoid') || t.toLowerCase().includes('☀️')),
        morningRoutine: [],
        nightRoutine: [],
        remedies: details.remedies || [],
        imageUrl: image || '',
        skin_detected: aiResult.skin_analysis?.skin_detected,
        skin_percentage: aiResult.skin_analysis?.skin_percentage,
        shot_type: aiResult.skin_analysis?.shot_type,
    };

    // Pre-save to database first
    let savedId = 'temp';
    try {
        const saved = await api.createAnalysis({
            results: results,
            imageUrl: image || ''
        });
        if (saved && saved.analysis && saved.analysis._id) {
            savedId = saved.analysis._id;
        }
    } catch (err) {
        console.error('Failed to pre-save analysis:', err);
    }

    router.push({
        pathname: `/patient/analysis/${savedId}` as any,
        params: { result: JSON.stringify(results) }
    });
};

if (isAnalyzing) {
    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ flexGrow: 1, alignItems: 'center', paddingTop: 48, paddingBottom: 60, paddingHorizontal: 24 }}
                showsVerticalScrollIndicator={false}
            >
                <View
                    className="bg-gray-100 rounded-[32px] overflow-hidden relative shadow-2xl mb-8 w-full"
                    style={{ maxWidth: 360, aspectRatio: 1, maxHeight: 360 }}
                >
                    {image && <Image source={{ uri: image }} className="w-full h-full" style={{ objectFit: 'cover' }} />}

                    <Animated.View
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            height: 4,
                            backgroundColor: '#10b981',
                            zIndex: 10,
                            shadowColor: '#10b981',
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 1,
                            shadowRadius: 10,
                            transform: [{
                                translateY: scanLineAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, 360]
                                })
                            }]
                        }}
                    />

                    <View className="absolute inset-0 opacity-10 border border-green-500/20 pointer-events-none">
                        <View className="w-full h-full flex-row">
                            <View className="flex-1 border-r border-green-500" />
                            <View className="flex-1 border-r border-green-500" />
                            <View className="flex-1" />
                        </View>
                    </View>
                </View>

                <Text className="text-3xl font-black text-gray-900 mb-2 text-center w-[180px]">Analyzing{dots}</Text>
                <Text className="text-gray-500 text-center mb-6 px-4">Our AI is scanning for 12+ skin indicators. One moment please.</Text>

                <View className="w-full max-w-xs bg-gray-200 h-6 rounded-full overflow-hidden mb-6 relative justify-center border border-gray-200 shadow-inner">
                    <View
                        className="absolute top-0 bottom-0 left-0 bg-green-500"
                        style={{ width: `${analysisProgress}%` }}
                    />
                    <View className="absolute inset-0 items-center justify-center pointer-events-none">
                        <Text className="font-black text-xs tracking-widest" style={{ color: analysisProgress > 50 ? 'white' : '#374151' }}>
                            {analysisProgress}%
                        </Text>
                    </View>
                </View>

                <View className="items-center">
                    <Text className="text-gray-400 text-xs italic">Processing securely on-device</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

return (
    <SafeAreaView className="flex-1 bg-white">
        {/* ─── Rejection Modal ─── */}
        <Modal
            visible={rejectionModal.visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={closeRejectionModal}
        >
            <View
                style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingHorizontal: 24,
                }}
            >
                <View
                    style={{
                        backgroundColor: 'white',
                        borderRadius: 32,
                        padding: 28,
                        width: '100%',
                        maxWidth: 420,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 20 },
                        shadowOpacity: 0.3,
                        shadowRadius: 30,
                        elevation: 20,
                    }}
                >
                    {/* Red X icon */}
                    <View style={{ alignItems: 'center', marginBottom: 20 }}>
                        <View
                            style={{
                                width: 80,
                                height: 80,
                                borderRadius: 40,
                                backgroundColor: '#fef2f2',
                                borderWidth: 3,
                                borderColor: '#fca5a5',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 16,
                            }}
                        >
                            <Text style={{ fontSize: 36 }}>📷</Text>
                        </View>
                        <Text
                            style={{
                                fontSize: 22,
                                fontWeight: '900',
                                color: '#111827',
                                textAlign: 'center',
                                marginBottom: 8,
                            }}
                        >
                            {rejectionModal.title}
                        </Text>
                        <Text
                            style={{
                                fontSize: 14,
                                color: '#6b7280',
                                textAlign: 'center',
                                lineHeight: 22,
                            }}
                        >
                            {rejectionModal.reason}
                        </Text>
                    </View>

                    {/* Tips */}
                    {rejectionModal.tips.length > 0 && (
                        <View
                            style={{
                                backgroundColor: '#faf5ff',
                                borderRadius: 16,
                                padding: 16,
                                marginBottom: 24,
                                borderWidth: 1,
                                borderColor: '#e9d5ff',
                            }}
                        >
                            <Text style={{ fontSize: 13, fontWeight: '800', color: '#7c3aed', marginBottom: 10 }}>
                                💡 Tips for a better photo:
                            </Text>
                            {rejectionModal.tips.map((tip, i) => (
                                <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 }}>
                                    <Text style={{ color: '#9333ea', fontWeight: '900', marginRight: 8, marginTop: 1 }}>•</Text>
                                    <Text style={{ fontSize: 13, color: '#374151', flex: 1, lineHeight: 20 }}>{tip}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Action buttons */}
                    <View style={{ gap: 12 }}>
                        <TouchableOpacity
                            onPress={() => {
                                setRejectionModal(prev => ({ ...prev, visible: false }));
                                setImage(null);
                                setTimeout(() => {
                                    if (Platform.OS === 'web') startWebCamera();
                                    else takePhoto();
                                }, 300);
                            }}
                            style={{
                                backgroundColor: '#9333ea',
                                borderRadius: 16,
                                paddingVertical: 16,
                                alignItems: 'center',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                gap: 8,
                            }}
                        >
                            <Text style={{ fontSize: 16, fontWeight: '900', color: 'white' }}>📸  Retake Photo</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                setRejectionModal(prev => ({ ...prev, visible: false }));
                                setImage(null);
                                setTimeout(() => pickImage(), 300);
                            }}
                            style={{
                                backgroundColor: 'white',
                                borderRadius: 16,
                                paddingVertical: 16,
                                alignItems: 'center',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                gap: 8,
                                borderWidth: 2,
                                borderColor: '#9333ea',
                            }}
                        >
                            <Text style={{ fontSize: 16, fontWeight: '900', color: '#9333ea' }}>🖼️  Upload Again</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={closeRejectionModal}
                            style={{ paddingVertical: 12, alignItems: 'center' }}
                        >
                            <Text style={{ fontSize: 14, color: '#9ca3af', fontWeight: '600' }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="max-w-6xl mx-auto w-full px-6 pt-4 pb-4 flex-row items-center">
                <TouchableOpacity
                    onPress={() => {
                        if (isCameraActive) stopWebCamera();
                        if (isGuest) {
                            router.push('/');
                        } else {
                            router.push('/patient/dashboard');
                        }
                    }}
                    className="w-12 h-12 bg-gray-50 rounded-full items-center justify-center shadow-sm border border-gray-100"
                >
                    <ChevronLeft size={isLargeScreen ? 20 : 24} color="#1F2937" />
                </TouchableOpacity>
                <View className="ml-6">
                    <Text className="text-3xl font-black text-gray-900">Skin Analysis</Text>
                    <Text className="text-gray-500 font-medium">AI-powered skin health assessment</Text>
                </View>
            </View>

            <View className="max-w-6xl mx-auto w-full px-6 flex-col lg:flex-row lg:items-start lg:gap-10 pb-16">
                <View className="w-full lg:w-[55%] mb-6 lg:mb-0 items-center lg:items-start">
                    <View className="w-full max-w-lg mb-6">
                        {isCameraActive ? (
                            <View className="w-full aspect-[4/3] max-h-[350px] bg-black rounded-[32px] overflow-hidden relative shadow-xl">
                                {Platform.OS === 'web' && (
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', transform: isMirrored ? 'scaleX(-1)' : 'none' }}
                                    />
                                )}

                                <View className="absolute inset-0 items-center justify-center pointer-events-none">
                                    <View className="w-40 h-40 md:w-48 md:h-48 border-2 border-green-500/50 rounded-full flex-col items-center justify-center">
                                        <View className="w-full h-[2px] bg-green-500/20 absolute top-1/2" />
                                        <View className="h-full w-[2px] bg-green-500/20 absolute left-1/2" />
                                        <View className="bg-green-500/10 p-1.5 rounded-lg">
                                            <Text className="text-green-500 text-[10px] font-bold uppercase tracking-widest">Position Affected Area</Text>
                                        </View>
                                    </View>
                                </View>

                                <View className="absolute bottom-4 left-0 right-0 flex-row justify-center gap-4">
                                    <TouchableOpacity
                                        onPress={toggleMirror}
                                        className="bg-gray-800 p-4 rounded-full shadow-2xl transform active:scale-95 transition-all"
                                    >
                                        <FlipHorizontal size={28} color="white" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={captureWebPhoto}
                                        className="bg-purple-600 p-4 rounded-full shadow-2xl transform active:scale-95 transition-all"
                                    >
                                        <Camera size={28} color="white" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={stopWebCamera}
                                        className="bg-red-500 p-4 rounded-full shadow-2xl transform active:scale-95 transition-all"
                                    >
                                        <X size={28} color="white" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : image ? (
                            <View className="w-full bg-gray-50 rounded-[32px] overflow-hidden relative shadow-xl border border-gray-100 items-center justify-center p-4">
                                <View className="w-full max-h-[250px] aspect-square rounded-[24px] overflow-hidden bg-white shadow-inner">
                                    <Image
                                        source={{ uri: image }}
                                        className="w-full h-full"
                                        style={{ objectFit: 'cover' }}
                                    />
                                </View>

                                <TouchableOpacity
                                    onPress={() => setImage(null)}
                                    className="absolute top-6 right-6 w-8 h-8 bg-black/60 rounded-full items-center justify-center shadow-lg"
                                >
                                    <X size={16} color="white" />
                                </TouchableOpacity>

                                <View className="flex-row justify-center gap-3 mt-4">
                                    <TouchableOpacity
                                        onPress={() => setImage(null)}
                                        className="bg-white px-5 py-2 rounded-xl border border-purple-600 shadow-sm flex-row items-center gap-2"
                                    >
                                        <Text className="text-purple-600 font-bold text-sm">Change</Text>
                                    </TouchableOpacity>
                                    {Platform.OS === 'web' && (
                                        <TouchableOpacity
                                            onPress={startWebCamera}
                                            className="bg-white px-5 py-2 rounded-xl border border-purple-600 shadow-sm flex-row items-center gap-2"
                                        >
                                            <Text className="text-purple-600 font-bold text-sm">Retake</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        ) : (
                            <View className="w-full border-2 border-dashed border-purple-200 bg-purple-50/20 rounded-[32px] p-6 items-center justify-center min-h-[220px] lg:h-[260px]">
                                <View className="w-14 h-14 bg-purple-100 rounded-full items-center justify-center mb-3 shadow-sm">
                                    <Camera size={28} color="#9333EA" />
                                </View>
                                <Text className="text-gray-400 font-bold text-base text-center mb-1">No image selected</Text>
                                <Text className="text-gray-400 text-xs text-center px-6">Capture or upload a photo of your skin</Text>

                                {cameraError && (
                                    <Text className="text-red-500 text-[10px] text-center mt-3 px-4 bg-red-50 py-1.5 rounded-lg">{cameraError}</Text>
                                )}
                            </View>
                        )}
                    </View>

                    {!isCameraActive && (
                        <View className="w-full max-w-lg">
                            {!image ? (
                                <View className="flex-col md:flex-row gap-4">
                                    <TouchableOpacity
                                        onPress={takePhoto}
                                        className="flex-1 py-4 bg-purple-600 rounded-[20px] flex-row items-center justify-center gap-2 shadow-lg shadow-purple-200"
                                    >
                                        <Camera size={20} color="white" />
                                        <Text className="text-white font-black text-lg">Live Camera</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={pickImage}
                                        className="flex-1 py-4 bg-white border-2 border-purple-600 rounded-[20px] flex-row items-center justify-center gap-2"
                                    >
                                        <ImageIcon size={20} color="#9333EA" />
                                        <Text className="text-purple-600 font-black text-lg">Upload Photo</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    onPress={startAnalysis}
                                    className="w-full py-5 bg-purple-600 rounded-[20px] flex-row items-center justify-center gap-2 shadow-xl shadow-purple-200 transform active:scale-95 transition-all"
                                >
                                    <Sparkles size={20} color="white" />
                                    <Text className="text-white font-black text-xl">Start Analysis Now</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>

                <View className="w-full lg:w-[45%] lg:mt-0">
                    <View className="w-full bg-purple-50 rounded-[40px] p-6 items-center mb-6 border border-purple-100 shadow-sm">
                        <View className="w-14 h-14 bg-purple-600 rounded-2xl items-center justify-center mb-4 shadow-lg shadow-purple-200">
                            <Sparkles size={28} color="white" />
                        </View>
                        <Text className="text-xl font-black text-center text-gray-900 mb-2 leading-tight">
                            Deep Analysis
                        </Text>
                        <Text className="text-center text-gray-600 text-sm leading-5">
                            Our medical-grade AI performs a deep scan of your skin layers to identify concerns before they surface.
                        </Text>
                    </View>

                    <View className="w-full bg-gray-50/50 p-5 rounded-[40px] border border-gray-100">
                        <Text className="text-base font-bold text-gray-900 mb-4">For Best Results:</Text>
                        <View className="gap-4">
                            <GuideItem
                                icon={<Info size={16} color="#9333EA" />}
                                text="Ensure you are in a brightly lit room."
                            />
                            <GuideItem
                                icon={<Info size={16} color="#9333EA" />}
                                text="Remove makeup or glasses."
                            />
                            <GuideItem
                                icon={<Info size={16} color="#9333EA" />}
                                text="Position the affected skin area inside the guide."
                            />
                        </View>
                    </View>
                </View>
            </View>
            <Footer />
        </ScrollView>
    </SafeAreaView>
);
}

function GuideItem({ icon, text }: { icon: React.ReactNode; text: string }) {
    return (
        <View className="flex-row items-center gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
            {icon}
            <Text className="text-gray-700 font-medium text-xs">{text}</Text>
        </View>
    );
}

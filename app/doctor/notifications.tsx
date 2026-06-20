import { useRouter } from 'expo-router';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { ArrowLeft, Bell, Calendar, CheckCircle, Clock, MessageCircle, UserPlus, Trash2, Wifi } from 'lucide-react-native';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import * as api from '../../utils/api';
import { io, Socket } from 'socket.io-client';

type DoctorNotificationsProps = {
  onBack: () => void;
  onNewNotification?: (count: number) => void;
};

type NotificationType = 'appointment' | 'message' | 'patient' | 'reminder' | 'success' | 'cancellation' | 'product' | 'feedback';

type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
};

function timeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds || 0) + " seconds ago";
}

export function DoctorNotifications({ onBack, onNewNotification }: DoctorNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [newArrivals, setNewArrivals] = useState(0);
  const socketRef = useRef<Socket | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
      initSocket();
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    }, [])
  );

  const initSocket = async () => {
    try {
      const res = await api.getCurrentUser();
      const userId = res?.user?._id;
      if (!userId) return;

      const socket = io(api.SOCKET_URL, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
      });

      socket.on('connect', () => {
        console.log('🔔 [Doctor] Notification socket connected');
        socket.emit('join', userId);
        setIsConnected(true);
      });

      socket.on('disconnect', () => {
        console.log('🔌 [Doctor] Notification socket disconnected');
        setIsConnected(false);
      });

      socket.on('new_notification', (notif: any) => {
        if (notif?.type === 'message' || notif?.type === 'new_message') return;
        
        console.log('📬 [Doctor] Real-time notification:', notif.title);
        const mapped: Notification = {
          id: notif._id || String(Date.now()),
          type: notif.type as NotificationType,
          title: notif.title,
          message: notif.message,
          time: 'Just now',
          isRead: false,
        };
        setNotifications(prev => [mapped, ...prev]);
        setNewArrivals(n => n + 1);
        if (onNewNotification) {
          onNewNotification(1);
        }
        setTimeout(() => setNewArrivals(n => Math.max(0, n - 1)), 5000);
      });

      socketRef.current = socket;
    } catch (e) {
      console.error('[Doctor] Socket init error:', e);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.getNotifications();
      if (response?.notifications) {
        const mapped = response.notifications
          .filter((n: any) => n.type !== 'message' && n.type !== 'new_message')
          .map((n: any) => ({
            id: n._id,
            type: n.type as NotificationType,
            title: n.title,
            message: n.message,
            time: timeAgo(new Date(n.createdAt)),
            isRead: n.isRead,
          }));
        setNotifications(mapped);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) { console.error(e); }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (e) { console.error(e); }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'appointment':  return <Calendar size={20} color="#9333ea" />;
      case 'message':      return <MessageCircle size={20} color="#9333ea" />;
      case 'patient':      return <UserPlus size={20} color="#9333ea" />;
      case 'reminder':     return <Clock size={20} color="#9333ea" />;
      case 'success':      return <CheckCircle size={20} color="#16a34a" />;
      case 'cancellation': return <Bell size={20} color="#dc2626" />;
      default:             return <Bell size={20} color="#4b5563" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'appointment':  return 'bg-purple-50';
      case 'cancellation': return 'bg-red-50';
      case 'success':      return 'bg-green-50';
      default:             return 'bg-purple-50';
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#9333EA" />
        <Text className="mt-3 text-gray-500 font-medium">Loading notifications...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        {/* Header */}
        <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm border border-gray-100">
          <TouchableOpacity
            onPress={onBack}
            className="flex-row items-center gap-3 mb-5"
          >
            <View className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center border border-gray-200">
              <ArrowLeft size={20} color="#4b5563" />
            </View>
            <Text className="text-gray-700 font-semibold text-base">Back to Dashboard</Text>
          </TouchableOpacity>

          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <View className="flex-row items-center gap-3 mb-1">
                <Text className="text-2xl font-black text-gray-900">Notifications</Text>
                {/* Live status badge */}
                <View className={`flex-row items-center gap-1 px-2.5 py-1 rounded-full ${isConnected ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <View className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <Text className={`text-[10px] font-bold uppercase ${isConnected ? 'text-green-700' : 'text-gray-500'}`}>
                    {isConnected ? 'Live' : 'Offline'}
                  </Text>
                </View>
              </View>
              {unreadCount > 0 ? (
                <Text className="text-purple-600 font-medium text-sm">
                  {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
                </Text>
              ) : (
                <Text className="text-gray-400 text-sm">All caught up!</Text>
              )}
            </View>
            {unreadCount > 0 && (
              <TouchableOpacity onPress={markAllAsRead} className="px-4 py-2 bg-purple-50 rounded-xl border border-purple-100">
                <Text className="text-purple-600 font-bold text-sm">Mark all read</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Live arrival banner */}
        {newArrivals > 0 && (
          <TouchableOpacity
            onPress={fetchNotifications}
            className="bg-purple-600 py-3 px-4 rounded-2xl mb-4 flex-row items-center justify-center gap-2"
          >
            <Wifi size={16} color="white" />
            <Text className="text-white font-bold text-sm">
              {newArrivals} new notification{newArrivals > 1 ? 's' : ''} — tap to refresh
            </Text>
          </TouchableOpacity>
        )}

        {/* Notifications List */}
        <View className="gap-3">
          {notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              onPress={() => !notification.isRead && markAsRead(notification.id)}
              activeOpacity={0.8}
              className={`bg-white rounded-2xl p-5 shadow-sm border ${
                !notification.isRead ? 'border-purple-200' : 'border-gray-100'
              }`}
            >
              <View className="flex-row items-start gap-4">
                <View className={`w-12 h-12 ${getBgColor(notification.type)} rounded-full items-center justify-center`}>
                  {getIcon(notification.type)}
                </View>
                <View className="flex-1">
                  <View className="flex-row items-start justify-between mb-1">
                    <Text className="font-bold text-gray-900 flex-1 mr-2 text-base">{notification.title}</Text>
                    {!notification.isRead && (
                      <View className="w-2.5 h-2.5 bg-purple-500 rounded-full mt-1.5" />
                    )}
                  </View>
                  <Text className="text-gray-600 text-sm mb-2">{notification.message}</Text>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-gray-400 text-xs">{notification.time}</Text>
                    <TouchableOpacity
                      onPress={() => handleDelete(notification.id)}
                      className="p-1.5 bg-red-50 rounded-lg"
                    >
                      <Trash2 size={14} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Empty State */}
        {notifications.length === 0 && (
          <View className="bg-white rounded-3xl p-12 items-center shadow-sm border border-gray-100">
            <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
              <Bell size={40} color="#9ca3af" />
            </View>
            <Text className="text-lg font-black text-gray-900 mb-2">No notifications yet</Text>
            <Text className="text-gray-500 text-center text-sm">
              When patients book appointments or send messages, you'll see them here in real time.
            </Text>
          </View>
        )}

        <View className="h-8" />
      </View>
    </ScrollView>
  );
}

export default function DoctorNotificationsPage() {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-white">
      <DoctorNotifications onBack={() => router.replace('/doctor/dashboard')} />
    </SafeAreaView>
  );
}

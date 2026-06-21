import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View, ScrollView, ActivityIndicator } from 'react-native';
import { ArrowLeft, Bell, Calendar, Check, Clock, MessageCircle, ShoppingBag, Trash2, X, Wifi, Star } from 'lucide-react-native';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import * as api from '../../utils/api';
import { io, Socket } from 'socket.io-client';

export type Page = 'landing' | 'analysis' | 'results' | 'products' | 'routine' | 'appointments' | 'remedies' | 'chat' | 'history' | 'notifications' | 'profile' | 'feedback';

type NotificationType = 'appointment' | 'message' | 'reminder' | 'product' | 'cancellation' | 'feedback';

type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  relatedId?: string;
};

function timeAgo(date: Date) {
  if (!date || isNaN(date.getTime())) return "Unknown time";
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

function getNotifStyle(type: string) {
  switch (type) {
    case 'appointment': return { iconColor: '#9333ea', bgColor: 'bg-purple-100' };
    case 'message':     return { iconColor: '#9333ea', bgColor: 'bg-purple-100' };
    case 'reminder':    return { iconColor: '#2563eb', bgColor: 'bg-blue-100' };
    case 'product':     return { iconColor: '#db2777', bgColor: 'bg-pink-100' };
    case 'cancellation':return { iconColor: '#dc2626', bgColor: 'bg-red-100' };
    case 'feedback':    return { iconColor: '#d97706', bgColor: 'bg-amber-100' };
    default:            return { iconColor: '#4b5563', bgColor: 'bg-gray-100' };
  }
}

function getNotifIcon(type: string, color: string) {
  switch (type) {
    case 'appointment': return <Calendar size={20} color={color} />;
    case 'message':     return <MessageCircle size={20} color={color} />;
    case 'reminder':    return <Clock size={20} color={color} />;
    case 'product':     return <ShoppingBag size={20} color={color} />;
    case 'cancellation':return <X size={20} color={color} />;
    case 'feedback':    return <Star size={20} color={color} />;
    default:            return <Bell size={20} color={color} />;
  }
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [userRole, setUserRole] = useState<string>('patient');
  const [isConnected, setIsConnected] = useState(false);
  const [newCount, setNewCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
      setupSocket();
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    }, [])
  );

  const setupSocket = async () => {
    try {
      const res = await api.getCurrentUser();
      const user = res?.user;
      if (!user) return;

      const role = user.role || user.userType || 'patient';
      setUserRole(role);

      const socket = io(api.SOCKET_URL, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
      });

      socket.on('connect', () => {
        console.log('🔔 Notification socket connected');
        socket.emit('join', user._id);
        setIsConnected(true);
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
      });

      // Listen for real-time notifications
      socket.on('new_notification', (notif: any) => {
        console.log('📬 Real-time notification received:', notif.title);
        const mapped: Notification = {
          id: notif._id || String(Date.now()),
          type: notif.type as NotificationType,
          title: notif.title,
          message: notif.message,
          time: 'Just now',
          isRead: false,
        };
        setNotifications(prev => [mapped, ...prev]);
        setNewCount(n => n + 1);
        // Auto-clear "new" count after 5 seconds
        setTimeout(() => setNewCount(n => Math.max(0, n - 1)), 5000);
      });

      socketRef.current = socket;
    } catch (e) {
      console.error('Socket setup error:', e);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.getCurrentUser();
      const role = res?.user?.role || res?.user?.userType || 'patient';
      setUserRole(role);

      const response = await api.getNotifications();
      if (response?.notifications) {
        setNotifications(response.notifications.map((n: any) => ({
          id: n._id,
          type: n.type as NotificationType,
          title: n.title,
          message: n.message,
          time: timeAgo(new Date(n.createdAt)),
          isRead: n.isRead,
          relatedId: n.relatedId
        })));
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const filtered = filter === 'unread' ? notifications.filter(n => !n.isRead) : notifications;

  const markAsRead = async (id: string) => {
    try {
      await api.markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (e) { console.error(e); }
  };

  const markAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) { console.error(e); }
  };

  const deleteNotif = async (id: string) => {
    try {
      await api.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (e) { console.error(e); }
  };

  const clearAll = async () => {
    try {
      await api.clearAllNotifications();
      setNotifications([]);
    } catch (e) { console.error(e); }
  };

  const goBack = () => {
    if (userRole === 'doctor') {
      router.replace('/doctor/dashboard');
    } else {
      router.replace('/patient/dashboard');
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#9333ea" />
        <Text className="mt-4 text-gray-500 font-medium">Loading notifications...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 py-6 max-w-3xl mx-auto w-full">

          {/* ─── Back Button ─── */}
          <TouchableOpacity
            onPress={goBack}
            className="flex-row items-center gap-2 mb-6 self-start"
          >
            <View className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm border border-gray-100">
              <ArrowLeft size={20} color="#4b5563" />
            </View>
            <Text className="text-gray-600 font-semibold text-base">Back to Dashboard</Text>
          </TouchableOpacity>

          {/* ─── Header ─── */}
          <View className="flex-row items-start justify-between mb-6">
            <View className="flex-1">
              <View className="flex-row items-center gap-3 mb-1">
                <View className="relative">
                  <Bell size={28} color="#9333ea" />
                  {newCount > 0 && (
                    <View className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full items-center justify-center">
                      <Text className="text-white text-[9px] font-black">{newCount}</Text>
                    </View>
                  )}
                </View>
                <Text className="text-2xl font-black text-gray-900">Notifications</Text>
                {/* Live indicator */}
                <View className={`flex-row items-center gap-1 px-2 py-1 rounded-full ${isConnected ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <View className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <Text className={`text-[10px] font-bold ${isConnected ? 'text-green-700' : 'text-gray-500'}`}>
                    {isConnected ? 'LIVE' : 'OFFLINE'}
                  </Text>
                </View>
              </View>
              <Text className="text-gray-500 text-sm">
                Stay updated with your appointments, messages, and reminders
              </Text>
            </View>
          </View>

          {/* ─── Filter & Actions Bar ─── */}
          <View className="bg-white rounded-2xl p-4 mb-5 shadow-sm border border-gray-100 flex-row flex-wrap items-center justify-between gap-3">
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setFilter('all')}
                className={`px-4 py-2 rounded-full ${filter === 'all' ? 'bg-purple-600' : 'bg-gray-100'}`}
              >
                <Text className={`font-semibold text-sm ${filter === 'all' ? 'text-white' : 'text-gray-700'}`}>
                  All ({notifications.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFilter('unread')}
                className={`px-4 py-2 rounded-full ${filter === 'unread' ? 'bg-purple-600' : 'bg-gray-100'}`}
              >
                <Text className={`font-semibold text-sm ${filter === 'unread' ? 'text-white' : 'text-gray-700'}`}>
                  Unread ({unreadCount})
                </Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row gap-1">
              {unreadCount > 0 && (
                <TouchableOpacity onPress={markAllAsRead} className="px-3 py-2">
                  <Text className="text-purple-600 font-semibold text-sm">Mark all read</Text>
                </TouchableOpacity>
              )}
              {notifications.length > 0 && (
                <TouchableOpacity onPress={clearAll} className="px-3 py-2">
                  <Text className="text-red-500 font-semibold text-sm">Clear all</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* ─── New notification banner ─── */}
          {newCount > 0 && (
            <TouchableOpacity
              onPress={fetchNotifications}
              className="bg-purple-600 py-3 px-4 rounded-2xl mb-4 flex-row items-center justify-center gap-2"
            >
              <Wifi size={16} color="white" />
              <Text className="text-white font-bold text-sm">
                {newCount} new notification{newCount > 1 ? 's' : ''} arrived — tap to refresh
              </Text>
            </TouchableOpacity>
          )}

          {/* ─── Notifications List ─── */}
          {filtered.length === 0 ? (
            <View className="bg-white rounded-3xl p-12 items-center justify-center shadow-sm border border-gray-100">
              <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                <Bell size={40} color="#9ca3af" />
              </View>
              <Text className="text-lg font-bold text-gray-900 mb-2">
                {filter === 'unread' ? 'All caught up!' : 'No Notifications'}
              </Text>
              <Text className="text-gray-500 text-center text-sm">
                {filter === 'unread'
                  ? 'No unread notifications right now.'
                  : 'You don\'t have any notifications yet.'}
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {filtered.map((notif) => {
                const { iconColor, bgColor } = getNotifStyle(notif.type);
                return (
                  <View
                    key={notif.id}
                    className={`bg-white rounded-2xl p-5 shadow-sm border ${!notif.isRead ? 'border-purple-200' : 'border-gray-100'}`}
                  >
                    <View className="flex-row gap-4">
                      {/* Icon */}
                      <View className={`w-12 h-12 ${bgColor} rounded-full items-center justify-center`}>
                        {getNotifIcon(notif.type, iconColor)}
                      </View>
                      {/* Content */}
                      <View className="flex-1">
                        <View className="flex-row items-start justify-between mb-1">
                          <Text className="text-base font-bold text-gray-900 flex-1 mr-2">{notif.title}</Text>
                          {!notif.isRead && (
                            <View className="w-2.5 h-2.5 bg-purple-500 rounded-full mt-1.5" />
                          )}
                        </View>
                        <Text className="text-gray-600 text-sm mb-2">{notif.message}</Text>
                        <Text className="text-xs text-gray-400">{notif.time}</Text>

                        {/* Special Feedback Action */}
                        {notif.type === 'feedback' && (
                          <TouchableOpacity 
                            onPress={() => router.push({ pathname: '/patient/history', params: { openFeedback: notif.relatedId } })}
                            className="mt-3 bg-amber-500 py-2.5 px-4 rounded-xl items-center flex-row justify-center gap-2 self-start"
                          >
                            <Star size={16} color="white" fill="white" />
                            <Text className="text-white font-bold text-sm">Leave Feedback</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                      {/* Actions */}
                      <View className="gap-2">
                        {!notif.isRead && (
                          <TouchableOpacity
                            onPress={() => markAsRead(notif.id)}
                            className="p-2 bg-purple-50 rounded-xl border border-purple-100"
                          >
                            <Check size={16} color="#9333ea" />
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity
                          onPress={() => deleteNotif(notif.id)}
                          className="p-2 bg-red-50 rounded-xl border border-red-100"
                        >
                          <Trash2 size={16} color="#dc2626" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          <View className="h-10" />
        </View>
      </ScrollView>
    </View>
  );
}

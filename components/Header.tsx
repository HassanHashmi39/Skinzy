import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePathname, useRouter } from 'expo-router';
import { Calendar, Camera, Home, LogOut, Menu, MessageSquare, Sparkles, X, User } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Platform, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('sessionToken');
        setIsLoggedIn(!!token);

        if (token) {
          const api = require('../utils/api');
          const notifs = await api.getNotifications();
          if (notifs?.notifications) {
             const unreadMsgs = notifs.notifications.filter((n: any) => !n.isRead && (n.type === 'message' || n.type === 'new_message')).length;
             setUnreadMessages(unreadMsgs);
          }
        }
      } catch (e) {
        setIsLoggedIn(false);
      }
    };
    checkStatus();

    // Check again more frequently for snappier UI updates
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [pathname]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleScroll = () => {
        setScrolled(window.scrollY > 20);
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('sessionToken');
    setIsLoggedIn(false);
    setMobileMenuOpen(false);
    router.replace('/');
  };

  // Auth awareness
  const isAuthPage = pathname.includes('/shared/login') ||
    pathname.includes('/shared/user-type-selection') ||
    pathname.includes('/shared/signup-information');

  // Member awareness
  const isAdmin = pathname.includes('/admin');
  const isDoctor = pathname.includes('/doctor');
  const isPatient = pathname.includes('/patient');

  // SHOW MEMBER NAV if logged in and not on a dedicated auth/onboarding page
  const showMemberNav = isLoggedIn && !isAuthPage;

  const homeRoute = isLoggedIn ? (isAdmin ? '/admin/dashboard' : isDoctor ? '/doctor/dashboard' : '/patient/dashboard') : '/';

  const NavItem = ({ title, route, icon: Icon, primary = false, action, badgeCount }: any) => {
    const isActive = pathname === route;
    return (
      <TouchableOpacity
        onPress={() => {
          setMobileMenuOpen(false);
          if (action) action();
          else router.push(route as any);
        }}
        className={`flex-row items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${primary
          ? 'bg-purple-600 hover:bg-purple-900 shadow-md shadow-purple-200'
          : isActive
            ? 'bg-purple-50'
            : 'bg-transparent hover:bg-purple-50 group'
          }`}
      >
        <View className="relative flex-row items-center justify-center">
          {Icon && (
            <Icon
              size={18}
              color={primary ? 'white' : isActive ? '#9333EA' : '#4B5563'}
            />
          )}
          {badgeCount > 0 && (
            <View className="absolute -top-1 -right-2 w-3 h-3 bg-red-500 rounded-full border border-white" />
          )}
        </View>
        <Text className={`font-bold ${primary
          ? 'text-white'
          : isActive
            ? 'text-purple-600'
            : 'text-gray-700'
          }`}>
          {title}
        </Text>
        {badgeCount > 0 && title === 'Chat' && (
          <View className="ml-1 bg-red-500 px-1.5 py-0.5 rounded-full items-center justify-center">
            <Text className="text-white text-[10px] font-bold">{badgeCount > 9 ? '9+' : badgeCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View
      className={`z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 shadow-md border-b border-purple-100' : 'bg-white border-b border-gray-100'
        }`}
      style={{
        width: '100%',
        backdropFilter: scrolled ? 'blur(10px)' : 'none'
      } as any}
    >
      <View className="flex-row justify-between items-center px-6 py-4 max-w-7xl mx-auto w-full">
        {/* Logo */}
        <TouchableOpacity
          className="flex-row items-center gap-2"
          onPress={() => {
            setMobileMenuOpen(false);
            router.push(homeRoute);
          }}
        >
          <View className="w-10 h-10 bg-purple-600 rounded-xl items-center justify-center">
            <Sparkles size={24} color="white" />
          </View>
          <Text className="text-2xl font-black text-gray-900 tracking-tighter">SKINZY</Text>
        </TouchableOpacity>

        {/* Desktop Nav */}
        {isDesktop ? (
          <View className="flex-row items-center gap-2">
            <NavItem title="Home" route={homeRoute} icon={Home} />
            {showMemberNav ? (
              isAdmin ? (
                <NavItem title="Logout" icon={LogOut} action={handleLogout} />
              ) : isDoctor ? (
                <>
                  <NavItem title="Chat" route="/doctor/chat" icon={MessageSquare} badgeCount={unreadMessages} />
                  <NavItem title="Logout" icon={LogOut} action={handleLogout} />
                </>
              ) : (
                <>
                  <NavItem title="Appointments" route="/patient/appointments" icon={Calendar} />
                  <NavItem title="Scan Skin" route="/patient/scan" icon={Camera} primary />
                  <NavItem title="Logout" icon={LogOut} action={handleLogout} />
                </>
              )
            ) : (
              <>
                <NavItem title="Products" route="/patient/products" />
                <NavItem title="Login" route="/shared/login" />
                <NavItem title="Scan Skin" route="/patient/scan" icon={Camera} primary />
              </>
            )}
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 items-center justify-center bg-gray-50 rounded-full"
          >
            {mobileMenuOpen ? <X size={24} color="#1F2937" /> : <Menu size={24} color="#1F2937" />}
          </TouchableOpacity>
        )}
      </View>

      {/* Mobile Menu */}
      {mobileMenuOpen && !isDesktop && (
        <View className="absolute top-[72px] left-0 w-full bg-white border-b border-gray-100 p-4 shadow-lg z-50">
          <View className="gap-2">
            <NavItem title="Home" route={homeRoute} icon={Home} />
            {showMemberNav ? (
              isAdmin ? (
                <NavItem title="Logout" icon={LogOut} action={handleLogout} />
              ) : isDoctor ? (
                <>
                  <NavItem title="Chat" route="/doctor/chat" icon={MessageSquare} badgeCount={unreadMessages} />
                  <NavItem title="Logout" icon={LogOut} action={handleLogout} />
                </>
              ) : (
                <>
                  <NavItem title="Appointments" route="/patient/appointments" icon={Calendar} />
                  <NavItem title="Scan Skin" route="/patient/scan" icon={Camera} primary />
                  <NavItem title="Logout" icon={LogOut} action={handleLogout} />
                </>
              )
            ) : (
              <>
                <NavItem title="Products" route="/patient/products" />
                <NavItem title="Login" route="/shared/login" />
                <NavItem title="Scan Skin" route="/patient/scan" icon={Camera} primary />
              </>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

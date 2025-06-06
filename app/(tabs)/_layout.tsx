import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2E7D32',
        tabBarInactiveTintColor: '#9E9E9E',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          paddingBottom: Math.max(insets.bottom + 5, Platform.OS === 'ios' ? 20 : 10),
          height: Math.max(insets.bottom + 60, Platform.OS === 'ios' ? 90 : 80),
          paddingTop: 5,
          elevation: 0,
          shadowRadius: 10,
          position: 'relative',
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ focused, color }) => (
            <MaterialIcons 
              name="map" 
              size={focused ? 28 : 24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="ReportScreen"
        options={{
          title: 'Reportar',
          tabBarIcon: ({ focused, color }) => (
            <MaterialIcons 
              name="add-circle" 
              size={focused ? 28 : 24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="ProblemsListScreen"
        options={{
          title: 'Problemas',
          tabBarIcon: ({ focused, color }) => (
            <MaterialIcons 
              name="report" 
              size={focused ? 28 : 24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="ProfileScreen"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused, color }) => (
            <MaterialIcons 
              name="person" 
              size={focused ? 28 : 24} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}

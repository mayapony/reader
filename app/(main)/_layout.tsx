import { Tabs } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React, { useEffect } from 'react'
import { Platform } from 'react-native'

import TabBarBackground from '@/components/ui/TabBarBackground'

import * as NavigationBar from 'expo-navigation-bar'
import { useTheme } from 'tamagui'

import { HapticTab } from '@/components/HapticTab'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'

export default function TabLayout() {
  const theme = useTheme()
  console.log('当前主题结构:', JSON.stringify(theme, null, 2))
  console.log(theme?.background?.val)

  useEffect(() => {
    NavigationBar.setBackgroundColorAsync(theme?.background?.val)
  }, [theme?.background?.val])

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme?.colorFocus?.val,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: {
            backgroundColor: theme?.background?.val,
            ...Platform.select({
              ios: {
                // Use a transparent background on iOS to show the blur effect
                position: 'absolute',
              },
              default: {},
            }),
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: '书架',
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons size={28} name="book-open" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="user"
          options={{
            title: '用户',
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="account" size={28} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="book/[uri]"
          options={{
            href: null,
          }}
        />
      </Tabs>

      <StatusBar style="auto" translucent={false} backgroundColor={theme?.background?.val} />
    </>
  )
}

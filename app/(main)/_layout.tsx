import { Tabs } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React, { useEffect } from 'react'
import { Platform, useColorScheme } from 'react-native'

import TabBarBackground from '@/components/ui/TabBarBackground'

import { useTheme } from 'tamagui'

import { HapticTab } from '@/components/HapticTab'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'

import * as NavigationBar from 'expo-navigation-bar'
import { setStatusBarBackgroundColor, setStatusBarStyle } from 'expo-status-bar'

export default function TabLayout() {
  const colorScheme = useColorScheme()
  const theme = useTheme()
  console.log('当前主题结构:', JSON.stringify(theme, null, 2))
  console.log(theme?.background?.val)

  useEffect(() => {
    NavigationBar.setBackgroundColorAsync(theme?.background?.val)
    setStatusBarBackgroundColor(theme?.background?.val)
    setStatusBarStyle(colorScheme === 'dark' ? 'light' : 'dark')
  })

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
            animation: 'shift',
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
          name="book/[id]"
          options={{
            href: null,
            tabBarStyle: {
              display: 'none',
            },
          }}
        />
      </Tabs>

      <StatusBar style="auto" translucent={false} backgroundColor={theme?.background?.val} />
    </>
  )
}

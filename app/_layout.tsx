import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { openDatabaseSync, SQLiteProvider } from 'expo-sqlite'
import { Suspense, useEffect } from 'react'
import 'react-native-reanimated'

import { DrizzleDBProvider } from '@/components/common/DatabaseProvider'
import migrations from '@/drizzle/migrations'
import tamaguiConfig from '@/tamagui.config'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { drizzle } from 'drizzle-orm/expo-sqlite'
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator'
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin'
import { ActivityIndicator, useColorScheme } from 'react-native'
import { TamaguiProvider, Theme } from 'tamagui'

import Toast from 'react-native-toast-message'

export const DATABASE_NAME = 'db'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const colorScheme = useColorScheme()

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  })

  const expoDb = openDatabaseSync(DATABASE_NAME, { enableChangeListener: true })
  const drizzleDb = drizzle(expoDb, { casing: 'snake_case' })
  const { success, error } = useMigrations(drizzleDb, migrations)

  useDrizzleStudio(expoDb)

  useEffect(() => {
    if (loaded && success) {
      SplashScreen.hideAsync()
    } else {
      console.log(error)
    }
  }, [loaded, success, error])

  if (!loaded) {
    return null
  }

  return (
    <Suspense fallback={<ActivityIndicator size="large" />}>
      <SQLiteProvider databaseName={DATABASE_NAME}>
        <DrizzleDBProvider value={drizzleDb}>
          <TamaguiProvider config={tamaguiConfig} defaultTheme={colorScheme!}>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <Theme name={colorScheme!}>
                <Stack>
                  <Stack.Screen name="(main)" options={{ headerShown: false }} />
                  <Stack.Screen name="+not-found" />
                </Stack>
                <Toast />
              </Theme>
            </ThemeProvider>
          </TamaguiProvider>
        </DrizzleDBProvider>
      </SQLiteProvider>
    </Suspense>
  )
}

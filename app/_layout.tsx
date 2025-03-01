import { openDatabaseAsync, openDatabaseSync, SQLiteProvider } from 'expo-sqlite'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { Suspense, useEffect } from 'react'
import 'react-native-reanimated'

import { useColorScheme } from '@/hooks/useColorScheme'
import { createTamagui, TamaguiProvider } from 'tamagui'
import { defaultConfig } from '@tamagui/config/v4'
import { themes as customThemes } from '@/constants/themes'
import { DrizzleDBProvider } from '@/components/common/DatabaseProvider'
import { ActivityIndicator } from 'react-native'
import { drizzle } from 'drizzle-orm/expo-sqlite'
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator'
import migrations from '@/drizzle/migrations'
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin'

export const DATABASE_NAME = 'db'

// you usually export this from a tamagui.config.ts file
//@ts-ignore
export const config = createTamagui({
  ...defaultConfig,
  themes: customThemes,
})

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  })

  const expoDb = openDatabaseSync(DATABASE_NAME)
  const drizzleDb = drizzle(expoDb, { casing: 'snake_case' })
  const { success, error } = useMigrations(drizzleDb, migrations)

  useDrizzleStudio(expoDb)

  useEffect(() => {
    if (loaded && success) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  if (!loaded) {
    return null
  }

  return (
    <Suspense fallback={<ActivityIndicator size="large" />}>
      <SQLiteProvider databaseName={DATABASE_NAME}>
        <DrizzleDBProvider value={drizzleDb}>
          <TamaguiProvider config={config} defaultTheme="light">
            <Stack>
              <Stack.Screen name="(main)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" translucent={false} />
          </TamaguiProvider>
        </DrizzleDBProvider>
      </SQLiteProvider>
    </Suspense>
  )
}

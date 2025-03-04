import { View } from '@tamagui/core'
import { Spinner, styled, useTheme } from 'tamagui'

const ThemedView = styled(View, {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
})

export const OverlaySpinner = () => {
  const theme = useTheme()
  return (
    <ThemedView>
      <Spinner size="large" color={theme?.accent1?.val} />
    </ThemedView>
  )
}

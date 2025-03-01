import type { StyleProp, ViewStyle } from 'react-native'

export type OnLoadEventPayload = {
  url: string
}

export type ExpoAnkiDroidAPIModuleEvents = {
  onChange: (params: ChangeEventPayload) => void
}

export type ChangeEventPayload = {
  value: string
}

export type ExpoAnkiDroidAPIViewProps = {
  url: string
  onLoad: (event: { nativeEvent: OnLoadEventPayload }) => void
  style?: StyleProp<ViewStyle>
}

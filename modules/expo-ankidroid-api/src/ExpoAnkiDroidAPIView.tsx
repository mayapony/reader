import { requireNativeView } from 'expo'
import * as React from 'react'

import { ExpoAnkiDroidAPIViewProps } from './ExpoAnkiDroidAPI.types'

const NativeView: React.ComponentType<ExpoAnkiDroidAPIViewProps> =
  requireNativeView('ExpoAnkiDroidAPI')

export default function ExpoAnkiDroidAPIView(props: ExpoAnkiDroidAPIViewProps) {
  return <NativeView {...props} />
}

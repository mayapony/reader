import * as React from 'react'

import { ExpoAnkiDroidAPIViewProps } from './ExpoAnkiDroidAPI.types'

export default function ExpoAnkiDroidAPIView(props: ExpoAnkiDroidAPIViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  )
}

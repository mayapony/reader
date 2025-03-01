// Reexport the native module. On web, it will be resolved to ExpoAnkiDroidAPIModule.web.ts
// and on native platforms to ExpoAnkiDroidAPIModule.ts
export { default } from './src/ExpoAnkiDroidAPIModule'
export { default as ExpoAnkiDroidAPIView } from './src/ExpoAnkiDroidAPIView'
export * from './src/ExpoAnkiDroidAPI.types'

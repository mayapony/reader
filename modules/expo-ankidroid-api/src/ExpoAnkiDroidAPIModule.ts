import { NativeModule, requireNativeModule } from 'expo'

import { ExpoAnkiDroidAPIModuleEvents } from './ExpoAnkiDroidAPI.types'

declare class ExpoAnkiDroidAPIModule extends NativeModule<ExpoAnkiDroidAPIModuleEvents> {
  isApiAvailable(): boolean
  addCardsToAnkiDroidAsync(data: object[]): Promise<number>
  getExampleData(): Map<string, string>[]
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoAnkiDroidAPIModule>('ExpoAnkiDroidAPI')

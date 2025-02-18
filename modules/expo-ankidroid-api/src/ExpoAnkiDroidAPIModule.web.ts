import { registerWebModule, NativeModule } from 'expo';

import { ChangeEventPayload } from './ExpoAnkiDroidAPI.types';

type ExpoAnkiDroidAPIModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
}

class ExpoAnkiDroidAPIModule extends NativeModule<ExpoAnkiDroidAPIModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
};

export default registerWebModule(ExpoAnkiDroidAPIModule);

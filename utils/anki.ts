import ExpoAnkiDroidAPIModule from '@/modules/expo-ankidroid-api'
import { ToastAndroid } from 'react-native'

export function addTranslationCard(from: string, to: string) {
  const card = {
    Front: from,
    Back: to,
  }

  ExpoAnkiDroidAPIModule.addCardsToAnkiDroidAsync([card])
    .then((added) => {
      ToastAndroid.show(`卡片已成功添加，${added}个`, ToastAndroid.LONG)
    })
    .catch((error) => {
      console.log(error)
      ToastAndroid.show('卡片添加失败', ToastAndroid.LONG)
    })
}

import ExpoAnkiDroidAPIModule from '@/modules/expo-ankidroid-api'
import Toast from 'react-native-toast-message'

export function addTranslationCard(from: string, to: string) {
  const card = {
    Front: from,
    Back: to,
  }

  ExpoAnkiDroidAPIModule.addCardsToAnkiDroidAsync([card])
    .then((added) => {
      console.log(added)
      Toast.show({
        type: 'success',
        text1: '卡片添加成功',
        text2: `正面内容：${from}`,
      })
    })
    .catch((error) => {
      console.log(error)
      Toast.show({
        type: 'error',
        text1: '卡片添加失败',
        text2: `正面内容：${from}`,
      })
    })
}

import { translationByBaidu } from '@/api/translation'
import { addTranslationCard } from '@/utils/anki'
import { Annotation, Reader, ReaderProvider, Themes, useReader } from '@epubjs-react-native/core'
import { useFileSystem } from '@epubjs-react-native/expo-file-system'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { useLocalSearchParams } from 'expo-router'
import { useMemo, useRef, useState } from 'react'
import { ToastAndroid, useColorScheme, useWindowDimensions } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useTheme, YStack } from 'tamagui'

import { OverlaySpinner } from '@/components/common/OverlaySpinner'
import React from 'react'

export default function Book() {
  const colorScheme = useColorScheme()
  const theme = useTheme()

  const memReaderDefaultTheme = useMemo(() => {
    const bodyStyle = {
      background: theme?.background?.val ?? (colorScheme === 'dark' ? '#000' : '#fff'),
    }
    const defaultTheme = colorScheme === 'dark' ? Themes.DARK : Themes.LIGHT
    return {
      ...defaultTheme,
      body: bodyStyle,
    }
  }, [colorScheme, theme?.background?.val])

  const { width, height } = useWindowDimensions()

  const { addAnnotation, removeAnnotation, annotations } = useReader()
  const [selection, setSelection] = useState<Selection | null>(null)
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | undefined>(undefined)
  const [tempMark, setTempMark] = useState<Annotation | null>(null)
  const annotationsListRef = useRef<BottomSheetModal>(null)

  const params = useLocalSearchParams()
  const bookUri = useMemo(() => params.uri + '', [params])

  return (
    <YStack alignItems="center" flex={1}>
      <GestureHandlerRootView>
        <ReaderProvider>
          <Reader
            src={bookUri}
            width={width}
            renderLoadingFileComponent={() => <OverlaySpinner />}
            renderOpeningBookComponent={() => <OverlaySpinner />}
            defaultTheme={memReaderDefaultTheme}
            // @ts-ignore
            fileSystem={useFileSystem}
            initialLocation="introduction_001.xhtml"
            initialAnnotations={[
              // Chapter 1
              {
                cfiRange: 'epubcfi(/6/10!/4/2/4,/1:0,/1:319)',
                data: {},
                sectionIndex: 4,
                styles: { color: '#23CE6B' },
                cfiRangeText:
                  'The pale Usher—threadbare in coat, heart, body, and brain; I see him now. He was ever dusting his old lexicons and grammars, with a queer handkerchief, mockingly embellished with all the gay flags of all the known nations of the world. He loved to dust his old grammars; it somehow mildly reminded him of his mortality.',
                type: 'highlight',
              },
              // Chapter 5
              {
                cfiRange: 'epubcfi(/6/22!/4/2/4,/1:80,/1:88)',
                data: {},
                sectionIndex: 3,
                styles: { color: '#CBA135' },
                cfiRangeText: 'landlord',
                type: 'highlight',
              },
            ]}
            onAddAnnotation={(annotation) => {
              if (annotation.type === 'highlight' && annotation.data?.isTemp) {
                setTempMark(annotation)
              }
            }}
            onPressAnnotation={(annotation) => {
              setSelectedAnnotation(annotation)
              annotationsListRef.current?.present()
            }}
            onChangeAnnotations={(annotation) => {
              console.log('onChangeAnnotations', annotation)
            }}
            menuItems={[
              {
                label: 'To Anki',
                action: (cfiRange, text) => {
                  console.log('Add Note', cfiRange, text)

                  translationByBaidu(text)
                    .then((dst) => {
                      addTranslationCard(text, dst)
                    })
                    .catch((error) => {
                      console.log(error)
                      ToastAndroid.show('翻译失败！', ToastAndroid.SHORT)
                    })
                  return true
                },
              },
            ]}
          />
        </ReaderProvider>
      </GestureHandlerRootView>
    </YStack>
  )
}

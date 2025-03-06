import { Annotation, Reader, Themes, useReader } from '@epubjs-react-native/core'
import { useFileSystem } from '@epubjs-react-native/expo-file-system'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useColorScheme, useWindowDimensions } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useTheme, YStack } from 'tamagui'

import { useDrizzleDB } from '@/components/common/DatabaseProvider'
import { OverlaySpinner } from '@/components/common/OverlaySpinner'
import { AnnotationsList, Selection } from '@/components/reader/AnnotationsList'
import { annotationTable } from '@/db/schema/annotation'
import { bookTable, SelectBook } from '@/db/schema/book'
import { and, eq } from 'drizzle-orm'
import React from 'react'

export default function Book() {
  const colorScheme = useColorScheme()
  const theme = useTheme()
  const params = useLocalSearchParams()
  const drizzleDb = useDrizzleDB()
  const router = useRouter()

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

  const [selectedBook, setSelectedBook] = useState<SelectBook | null>(null)

  const [initialAnnotations, setInitialAnnotations] = useState<Annotation[]>([])

  const initBookState = useCallback(
    async function fetchBook() {
      const bookId = parseInt(params?.id + '')
      console.log({ bookId })
      if (isNaN(bookId)) {
        router.back()
        return
      }

      try {
        const result = await drizzleDb.select().from(bookTable).where(eq(bookTable.id, bookId))
        if (result) setSelectedBook(result?.[0])
      } catch (error) {
        console.log(error)
        router.back()
      }

      try {
        const result = await drizzleDb
          .select()
          .from(annotationTable)
          .where(eq(annotationTable.bookId, bookId))

        const initAnno: Annotation[] = result.map((annotation) => ({
          ...annotation,
          styles: JSON.parse(annotation.styles ?? '{}'),
          data: {
            ...JSON.parse(annotation.data ?? '{}'),
            id: annotation.id,
            bookId: annotation.bookId,
          },
        })) as Annotation[]
        console.log({ initAnno })
        if (result) setInitialAnnotations(initAnno)
      } catch (error) {
        console.log(error)
      }
    },
    [drizzleDb, params?.id, router],
  )

  const handleAddAnnotation = useCallback(
    async (annotation: Annotation) => {
      if (!selectedBook) return

      try {
        const result = await drizzleDb.insert(annotationTable).values({
          bookId: selectedBook.id,
          type: annotation.type,
          cfiRange: annotation.cfiRange,
          sectionIndex: annotation.sectionIndex,
          cfiRangeText: annotation.cfiRangeText,
          iconClass: annotation.iconClass,
          styles: JSON.stringify(annotation.styles),
          data: JSON.stringify(annotation.data),
        })
        console.log(result)
      } catch (error) {
        console.log(error)
      }
    },
    [drizzleDb, selectedBook],
  )
  const handleDeleteAnnotation = useCallback(
    async (annotation: Annotation) => {
      if (!selectedBook) return
      try {
        await drizzleDb
          .delete(annotationTable)
          .where(
            and(
              eq(annotationTable.bookId, selectedBook.id),
              eq(annotationTable.cfiRange, annotation.cfiRange),
            ),
          )
      } catch (error) {
        console.log(error)
      }
    },
    [drizzleDb, selectedBook],
  )

  useEffect(() => {
    initBookState()
  }, [initBookState])

  return (
    <YStack alignItems="center" flex={1}>
      {!!selectedBook ? (
        <GestureHandlerRootView>
          <Reader
            src={selectedBook.filePath}
            width={width}
            renderLoadingFileComponent={() => <OverlaySpinner />}
            renderOpeningBookComponent={() => <OverlaySpinner />}
            defaultTheme={memReaderDefaultTheme}
            // @ts-ignore
            fileSystem={useFileSystem}
            initialLocation=""
            initialAnnotations={initialAnnotations}
            onAddAnnotation={(annotation) => {
              handleAddAnnotation(annotation)
              if (annotation.type === 'highlight' && annotation.data?.isTemp) {
                setTempMark(annotation)
              }
            }}
            onPressAnnotation={(annotation) => {
              console.log(`selected annotation ${JSON.stringify(annotation)}`)
              setSelectedAnnotation(annotation)
              annotationsListRef.current?.present()
            }}
            onChangeAnnotations={(annotation) => {
              console.log('onChangeAnnotations', annotation)
            }}
            menuItems={[
              {
                label: '🟡',
                action: (cfiRange) => {
                  console.log({ cfiRange })
                  addAnnotation('highlight', cfiRange, undefined, {
                    color: '#CBA135',
                  })
                  return true
                },
              },
              {
                label: '🔴',
                action: (cfiRange) => {
                  addAnnotation('highlight', cfiRange, undefined, {
                    color: theme?.red1?.val,
                  })
                  return true
                },
              },
              {
                label: '🟢',
                action: (cfiRange) => {
                  addAnnotation('highlight', cfiRange, undefined, {
                    color: theme?.green1?.val,
                  })
                  return true
                },
              },
              {
                label: '笔记',
                action: (cfiRange, text) => {
                  setSelection({ cfiRange, text })
                  addAnnotation('highlight', cfiRange, { isTemp: true })
                  annotationsListRef.current?.present()
                  return true
                },
              },
              {
                label: '翻译',
                action: (cfiRange, text) => {
                  setSelection({ cfiRange, text })
                  addAnnotation('highlight', cfiRange, { isTranslation: true })
                  annotationsListRef.current?.present()
                  return true
                },
              },
            ]}
          />

          <AnnotationsList
            ref={annotationsListRef}
            selection={selection}
            selectedAnnotation={selectedAnnotation}
            annotations={annotations}
            onClose={() => {
              setTempMark(null)
              setSelection(null)
              setSelectedAnnotation(undefined)
              if (tempMark) removeAnnotation(tempMark)
              annotationsListRef.current?.dismiss()
            }}
          />
        </GestureHandlerRootView>
      ) : (
        <OverlaySpinner />
      )}
    </YStack>
  )
}

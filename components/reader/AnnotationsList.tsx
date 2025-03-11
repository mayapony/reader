/* eslint-disable @typescript-eslint/no-use-before-define */
import { useAnnotation } from '@/hooks/useAnnotation'
import { Annotation, useReader } from '@epubjs-react-native/core'
import {
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet'
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types'
import React, { forwardRef } from 'react'
import { StyleSheet, View } from 'react-native'
import AnnotationForm from './AnnotationForm'
import AnnotationItem from './AnnotationItem'

export type Selection = {
  cfiRange: string
  text: string
  id?: number
}

interface Props {
  selection: Selection | null
  selectedAnnotation?: Annotation
  annotations: Annotation[]
  onClose: () => void
}
export type Ref = BottomSheetModalMethods

export const AnnotationsList = forwardRef<Ref, Props>(
  ({ selection, selectedAnnotation, annotations, onClose }, ref) => {
    const { theme, goToLocation } = useReader()

    const snapPoints = React.useMemo(() => ['50%', '75%', '100%'], [])

    const { handleDeleteAnnotation } = useAnnotation()

    const renderItem = React.useCallback(
      // eslint-disable-next-line react/no-unused-prop-types
      ({ item }: { item: Annotation }) => (
        <AnnotationItem
          annotation={item}
          onPressAnnotation={(annotation) => {
            goToLocation(annotation.cfiRange)
            onClose()
          }}
          onRemoveAnnotation={(annotation) => {
            handleDeleteAnnotation(annotation, annotations)
            onClose()
          }}
        />
      ),
      [annotations, goToLocation, onClose, handleDeleteAnnotation],
    )

    const header = React.useCallback(
      () => (
        <View style={{ backgroundColor: theme.body.background }}>
          {(selection || selectedAnnotation) && (
            <AnnotationForm
              annotation={selectedAnnotation}
              selection={selection}
              onClose={onClose}
            />
          )}
        </View>
      ),
      [onClose, selectedAnnotation, selection, theme.body.background],
    )

    return (
      <BottomSheetModalProvider>
        <BottomSheetModal
          ref={ref}
          index={0}
          snapPoints={snapPoints}
          enablePanDownToClose
          style={{
            ...styles.container,
            backgroundColor: theme.body.background,
          }}
          handleStyle={{ backgroundColor: theme.body.background }}
          backgroundStyle={{ backgroundColor: theme.body.background }}
          onDismiss={onClose}>
          <BottomSheetFlatList<Annotation>
            data={annotations.filter(
              (annotation) => !annotation?.data?.isTemp && annotation.type !== 'mark',
            )}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item.cfiRange + item.type + item.data}
            renderItem={renderItem}
            ListHeaderComponent={header}
            style={{ width: '100%' }}
            maxToRenderPerBatch={20}
          />
        </BottomSheetModal>
      </BottomSheetModalProvider>
    )
  },
)
// Adding display name to the component
AnnotationsList.displayName = 'AnnotationsList'

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  input: {
    width: '100%',
    borderRadius: 10,
    fontSize: 16,
    lineHeight: 20,
    padding: 8,
    backgroundColor: 'rgba(151, 151, 151, 0.25)',
  },
})

/* eslint-disable @typescript-eslint/no-use-before-define */
import { Annotation } from '@epubjs-react-native/core'
import { BottomSheetView, TouchableOpacity } from '@gorhom/bottom-sheet'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Button, Text, useTheme } from 'tamagui'

interface Props {
  annotation: Annotation
  onPressAnnotation: (annotation: Annotation) => void
  onRemoveAnnotation: (annotation: Annotation) => void
}

function AnnotationItem({ annotation, onPressAnnotation, onRemoveAnnotation }: Props) {
  const theme = useTheme()

  return (
    <BottomSheetView
      key={annotation.cfiRange}
      style={{
        ...styles.container,
        padding: 8,
        borderRadius: 8,
      }}>
      <View
        style={{
          ...styles.row,
        }}>
        <View
          style={{
            ...styles.color,
            backgroundColor: annotation.styles?.color,
            borderColor: theme?.background01?.val,
          }}
        />

        <TouchableOpacity onPress={() => onPressAnnotation(annotation)}>
          {annotation.type !== 'highlight' && (
            <Text
              style={{
                ...styles.observation,
              }}>
              {annotation.data?.observation}
            </Text>
          )}

          <Text
            style={{
              ...styles.cfiRangeText,
            }}
            numberOfLines={2}>
            &quot;{annotation.cfiRangeText}&quot;
          </Text>
        </TouchableOpacity>
      </View>

      <Button onPress={() => onRemoveAnnotation(annotation)}>删除</Button>
    </BottomSheetView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  color: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 10,
    borderStyle: 'solid',
    borderWidth: 1,
  },
  cfiRange: {
    fontWeight: '600',
    marginLeft: 5,
  },
  cfiRangeText: {
    fontStyle: 'italic',
    flexWrap: 'wrap',
    maxWidth: 220,
  },
  observation: {
    fontWeight: '600',
    marginLeft: 5,
  },
})

export default AnnotationItem

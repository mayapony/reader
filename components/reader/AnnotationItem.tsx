/* eslint-disable @typescript-eslint/no-use-before-define */
import { Annotation } from '@epubjs-react-native/core'
import { BottomSheetView, TouchableOpacity } from '@gorhom/bottom-sheet'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Text } from 'tamagui'

interface Props {
  annotation: Annotation
  onPressAnnotation: (annotation: Annotation) => void
  onRemoveAnnotation: (annotation: Annotation) => void
}

function AnnotationItem({ annotation, onPressAnnotation, onRemoveAnnotation }: Props) {
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
          }}
        />

        <View
          style={{
            flex: 1,
          }}>
          <TouchableOpacity onPress={() => onPressAnnotation(annotation)}>
            <Text
              style={{
                ...styles.cfiRangeText,
              }}>
              &quot;{annotation.cfiRangeText}&quot;
            </Text>
            {annotation.type !== 'highlight' && (
              <Text
                style={{
                  ...styles.observation,
                }}>
                {annotation.data?.observation}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
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
    display: 'flex',
  },
  color: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 10,
  },
  cfiRange: {
    fontWeight: '600',
    marginLeft: 5,
  },
  cfiRangeText: {
    fontStyle: 'italic',
    flexWrap: 'wrap',
  },
  observation: {
    fontWeight: '600',
    marginLeft: 5,
    flexWrap: 'wrap',
  },
})

export default AnnotationItem

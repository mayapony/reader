/* eslint-disable react/require-default-props */
/* eslint-disable @typescript-eslint/no-use-before-define */
import { useAnnotation } from '@/hooks/useAnnotation'
import { Annotation, useReader } from '@epubjs-react-native/core'
import { BottomSheetTextInput } from '@gorhom/bottom-sheet'
import React, { useEffect, useMemo } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Button, useTheme } from 'tamagui'

interface Props {
  annotation?: Annotation
  selection: { cfiRange: string; text: string } | null
  onClose: () => void
}

function AnnotationForm({ annotation, selection, onClose }: Props) {
  const theme = useTheme()
  const COLORS = useMemo(
    () => [
      theme?.o_red?.val,
      theme?.o_blue?.val,
      theme?.o_yellow?.val,
      theme?.o_green?.val,
      theme?.o_purple?.val,
    ],
    [theme],
  )
  const [observation, setObservation] = React.useState(annotation?.data?.observation ?? '')
  const [color, setColor] = React.useState(COLORS[0])

  const { addAnnotation, updateAnnotation, annotations } = useReader()

  const { handleUpdateAnnotation } = useAnnotation()

  useEffect(() => {
    if (annotation) {
      setObservation(annotation.data?.observation)
      setColor(annotation.styles?.color || '')
    }

    return () => {
      setObservation('')
      setColor(COLORS[0])
    }
  }, [annotation, COLORS])
  return (
    <View style={styles.container}>
      {(annotation?.type !== 'highlight' || annotation?.data?.isTranslation) && (
        <BottomSheetTextInput
          value={observation}
          style={styles.input}
          multiline
          placeholder="Type an annotation here..."
          placeholderTextColor={COLORS[3]}
          onChangeText={(text) => setObservation(text)}
        />
      )}

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: '100%',
          marginTop: 10,
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignSelf: 'flex-start',
          }}>
          {COLORS.map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.circle, { backgroundColor: item }]}
              onPress={() => setColor(item)}>
              {color === item && (
                <Text
                  style={{
                    color: theme?.background?.val,
                    fontSize: 12,
                    fontWeight: 'bold',
                  }}>
                  X
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {!annotation && (
          <TouchableOpacity
            style={{
              backgroundColor: '#f6f8ff',
              width: 100,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 12,
            }}
            onPress={() => {
              const key = Date.now()
              addAnnotation(
                'underline',
                selection!.cfiRange,
                { key, text: selection!.text, observation },
                { color, opacity: 0.8 },
              )

              setObservation('')
              onClose()
            }}>
            <Text style={{ textAlign: 'center', color: '#090c02' }}>Add Note</Text>
          </TouchableOpacity>
        )}

        {annotation && (
          <>
            <Button size="$2" theme="accent">
              <Text>同步Anki</Text>
            </Button>
            <Button
              size="$2"
              onPress={() => {
                /**
                 * Required for the "add note" scenario, as an "underline" and "mark" type annotation is created in it and both work as one...
                 */
                if (annotation.data?.key) {
                  const withMarkAnnotations = annotations.filter(
                    ({ data }) => data.key === annotation.data.key,
                  )

                  withMarkAnnotations.forEach((item) => {
                    updateAnnotation(
                      item,
                      {
                        ...item.data,
                        observation,
                      },
                      { ...item.styles, color },
                    )
                  })
                } else {
                  console.log({ color })
                  handleUpdateAnnotation(
                    annotation,
                    {
                      ...annotation.data,
                      observation,
                    },
                    { ...annotation.styles, color },
                  )
                }

                onClose()
                setObservation('')
              }}>
              <Text>更新</Text>
            </Button>
          </>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    height: 64,
    marginTop: 8,
    borderRadius: 10,
    fontSize: 16,
    lineHeight: 20,
    padding: 8,
    backgroundColor: 'rgba(151, 151, 151, 0.25)',
  },
  title: {
    textAlign: 'left',
    fontSize: 18,
    alignSelf: 'flex-start',
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default AnnotationForm

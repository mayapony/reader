import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import React, { FC } from 'react'
import { Pressable, StyleSheet } from 'react-native'
import { Text, useTheme, View, YStack } from 'tamagui'

const MultiBottom: FC<{ handleRemoveBooks: () => void }> = ({ handleRemoveBooks }) => {
  const theme = useTheme()
  const color = theme?.color?.val
  const errorColor = theme?.error?.val

  return (
    <View style={styles.container}>
      <View style={styles.column}>
        <YStack>
          <MaterialCommunityIcons name="format-vertical-align-top" size={28} color={color} />
          <Text>置顶</Text>
        </YStack>
      </View>
      <View style={styles.column}>
        <MaterialCommunityIcons name="select-group" size={28} color={color} />
        <Text>分组</Text>
      </View>
      <Pressable style={styles.column} onPress={handleRemoveBooks}>
        <MaterialCommunityIcons name="book-remove" size={28} color={errorColor} />
        <Text>删除</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  column: {
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    padding: 20,
  },
})

export default MultiBottom

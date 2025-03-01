import { useDrizzleDB } from '@/components/common/DatabaseProvider'
import { books } from '@/db/schema/book'
import { Book } from '@/interfaces/book'
import { getMetadataFromEpub, saveEpubFileToAppFolder } from '@/utils/epub'
import { MaterialIcons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useLiveQuery } from 'drizzle-orm/expo-sqlite'
import * as DocumentPicker from 'expo-document-picker'
import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import { Alert, FlatList, StyleSheet, TextInput, View } from 'react-native'
import { Button, Card, Image, styled, Text, XStack, YStack } from 'tamagui'

const SearchBar = styled(TextInput, {
  borderWidth: 1,
  borderRadius: 8,
  padding: 10,
  width: '80%',
})

const BookCard = styled(View, {
  width: '30%',
  margin: 10,
  alignItems: 'center',
  justifyContent: 'center',
})

const BookTitle = styled(Text, {
  width: '100%',
  textAlign: 'center',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
})

const BookShelfScreen = () => {
  const drizzleDb = useDrizzleDB()
  const [tempBooks, setBooks] = useState<Book[]>([])

  const { data, error } = useLiveQuery(drizzleDb.select().from(books))

  useEffect(() => {
    if (error) {
      console.log(error)
    } else {
      console.log(data)
    }
    const loadBooks = async () => {
      try {
        const storedBooks = await AsyncStorage.getItem('@books')
        if (storedBooks) setBooks(JSON.parse(storedBooks))
      } catch (error) {
        Alert.alert('错误', '无法加载书籍数据')
      }
    }
    loadBooks()
  }, [])

  const handleImportBook = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/epub+zip'],
        copyToCacheDirectory: true,
      })

      if (result.canceled) return

      if (result.assets?.[0]) {
        const { uri } = result.assets[0]

        const copyUri = await saveEpubFileToAppFolder(uri)
        if (!copyUri) throw new Error('保存EPUB副本失败')

        const metadata = await getMetadataFromEpub(uri)
        if (!metadata) throw new Error('获取metadata失败')

        const { title, coverUri, author } = metadata
        console.log({
          title,
          coverUri,
          author,
          copyUri,
        })

        const newBook: Book = {
          id: Date.now().toString(),
          title: title,
          author: author,
          cover: coverUri ?? `https://picsum.photos/200/300?random=${Date.now()}`,
          progress: 0,
          fileUri: copyUri,
        }
        const updatedBooks = [...tempBooks, newBook]
        setBooks(updatedBooks)
        await AsyncStorage.setItem('@books', JSON.stringify(updatedBooks))
      }
    } catch (error) {
      Alert.alert('错误', '导入图书失败')
    }
  }

  const handleRemoveAllBooks = () => {
    AsyncStorage.clear()
    setBooks([])
  }

  // 渲染书籍项
  const renderBookItem = ({ item }: { item: Book }) => (
    <BookCard>
      <Card
        animation="bouncy"
        scale={0.9}
        hoverStyle={{ scale: 0.925 }}
        pressStyle={{ scale: 0.875 }}
        onPress={() =>
          router.push({
            pathname: '/book/[uri]',
            params: { uri: item.fileUri },
          })
        }>
        <Image
          source={{ uri: item.cover }}
          style={{
            width: '100%',
            height: undefined,
            aspectRatio: 2 / 3,
            borderRadius: 8,
          }}
        />
      </Card>
      <BookTitle numberOfLines={1}>{item.title}</BookTitle>
    </BookCard>
  )

  return (
    <YStack flex={1} backgroundColor="$background">
      <XStack justifyContent="space-between" padding={20}>
        <SearchBar placeholder="搜索书籍" />
        <Button onPress={handleImportBook}>导入</Button>
        <Button onPress={handleRemoveAllBooks}>清空</Button>
      </XStack>

      <FlatList
        data={tempBooks}
        renderItem={renderBookItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="menu-book" size={64} color="#444" />
            <Text style={styles.emptyText}>点击右上角按钮导入图书</Text>
          </View>
        }
      />
    </YStack>
  )
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 8,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    marginTop: 16,
  },
})

export default BookShelfScreen

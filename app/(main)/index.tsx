import MultiBottom from '@/components/bookshelf/MutilBottom'
import ModernSearchBar from '@/components/bookshelf/SearchBar'
import { useDrizzleDB } from '@/components/common/DatabaseProvider'
import { OverlaySpinner } from '@/components/common/OverlaySpinner'
import { SelectBook } from '@/db/schema/book'
import { MULTI_STATE, useBookManager } from '@/hooks/useBookManager'
import { MaterialIcons } from '@expo/vector-icons'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import * as DocumentPicker from 'expo-document-picker'
import { useNavigation, useRouter } from 'expo-router'
import React, { useEffect } from 'react'
import { Alert, FlatList, StyleSheet, View } from 'react-native'
import { Button, Card, Image, styled, Text, useTheme, XStack, YStack } from 'tamagui'

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

export const PrimaryButton = styled(Button, {
  backgroundColor: '$background',
  color: '$color',
})

const BookShelfScreen = () => {
  const theme = useTheme()
  const router = useRouter()
  const drizzleDb = useDrizzleDB()
  const navigation = useNavigation()
  const {
    multiState,
    updateMultiState,
    handleSelectById,
    selectedBookIds,
    removeBooks,
    addBookByUri,
    loadBookDataError,
    bookData,
    loading: managerLoading,
  } = useBookManager(drizzleDb)

  useEffect(() => {
    if (loadBookDataError) {
      console.log(loadBookDataError)
    } else {
      console.log(bookData)
    }
  }, [bookData, loadBookDataError, theme?.background?.val])

  const handleImportBook = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/epub+zip'],
        copyToCacheDirectory: true,
      })

      if (result.canceled) return

      if (result.assets?.[0]) {
        const { uri } = result.assets[0]
        addBookByUri(uri)
      }
    } catch (error) {
      console.log(error)
      Alert.alert('错误', '导入图书失败')
    }
  }

  const handleBookLongPress = () => {
    const isSelecting = multiState === MULTI_STATE.MULTI_SELECTING
    navigation.setOptions({
      tabBarStyle: !isSelecting
        ? { display: 'none' }
        : {
            backgroundColor: theme?.background?.val,
          },
    })
    updateMultiState(isSelecting ? MULTI_STATE.NOT_MULTI_SELECTING : MULTI_STATE.MULTI_SELECTING)
  }

  const handleBookPress = (book: SelectBook) => {
    if (multiState === MULTI_STATE.MULTI_SELECTING) {
      handleSelectById(book.id)
    } else {
      router.push({
        pathname: '/book/[uri]',
        params: { uri: book.filePath },
      })
    }
  }

  const renderBookItem = ({ item }: { item: SelectBook }) => (
    <>
      <BookCard>
        <Card
          animation="bouncy"
          scale={0.9}
          hoverStyle={{ scale: 0.925 }}
          pressStyle={{ scale: 0.875 }}
          onPress={handleBookPress.bind(null, item)}
          onLongPress={handleBookLongPress}>
          <View
            style={{
              width: '100%',
            }}>
            <Image
              source={{ uri: item.coverPath ?? '' }}
              style={{
                width: '100%',
                height: undefined,
                aspectRatio: 2 / 3,
              }}
            />

            {multiState === MULTI_STATE.MULTI_SELECTING &&
              (selectedBookIds.has(item.id) ? (
                <>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={24}
                    color={theme?.accent1?.val}
                    style={{
                      position: 'absolute',
                      right: 5,
                      bottom: 5,
                    }}
                  />

                  {/* black overlay for image*/}
                  <View
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(0,0,0,0.3)',
                    }}
                  />
                </>
              ) : (
                <>
                  <MaterialCommunityIcons
                    name="check-circle-outline"
                    color={theme?.background?.val}
                    style={{
                      position: 'absolute',
                      right: 5,
                      bottom: 5,
                      zIndex: 2,
                    }}
                    size={24}
                  />
                  <View
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 1,
                      backgroundColor: 'rgba(0,0,0,0.1)',
                    }}
                  />
                </>
              ))}
          </View>
        </Card>
        <BookTitle numberOfLines={1}>{item.title}</BookTitle>
      </BookCard>
    </>
  )

  return (
    <>
      <YStack flex={1} backgroundColor="$background">
        <XStack justifyContent="space-between" padding={20}>
          <ModernSearchBar />
          <Button onPress={handleImportBook}>导入</Button>
        </XStack>

        <FlatList
          data={bookData ?? []}
          renderItem={renderBookItem}
          keyExtractor={(item) => `${item.id.toString()}-${item.title}`}
          numColumns={3}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="menu-book" size={64} color="#444" />
              <Text style={styles.emptyText}>点击右上角按钮导入图书</Text>
            </View>
          }
        />

        {multiState === MULTI_STATE.MULTI_SELECTING && (
          <MultiBottom handleRemoveBooks={removeBooks.bind(null)} />
        )}

        {managerLoading && <OverlaySpinner />}
      </YStack>
    </>
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

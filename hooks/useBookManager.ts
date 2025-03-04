import { useDrizzleDB } from '@/components/common/DatabaseProvider'
import { bookTable, InsertBook } from '@/db/schema/book'
import { getMetadataFromEpub, saveEpubFileToAppFolder } from '@/utils/epub'
import { inArray } from 'drizzle-orm'
import { useLiveQuery } from 'drizzle-orm/expo-sqlite'
import { useState } from 'react'
import Toast from 'react-native-toast-message'

export enum MULTI_STATE {
  MULTI_SELECTING,
  NOT_MULTI_SELECTING,
}

export const useBookManager = (drizzleDb: ReturnType<typeof useDrizzleDB>) => {
  const [loading, setLoading] = useState(false)
  const [multiState, setMultiState] = useState<MULTI_STATE>(MULTI_STATE.NOT_MULTI_SELECTING)

  const [selectedBookIds, setSelectedBookIds] = useState<Set<number>>(new Set())

  const { data: bookData, error: loadBookDataError } = useLiveQuery(
    drizzleDb.select().from(bookTable),
  )

  const handleSelectById = (id: number) => {
    setSelectedBookIds((prev) => {
      const newSelected = new Set(prev)
      if (newSelected.has(id)) {
        newSelected.delete(id)
      } else {
        newSelected.add(id)
      }
      return newSelected
    })
  }

  const updateMultiState = (state: MULTI_STATE) => {
    selectedBookIds.clear()
    setMultiState(state)
  }

  const removeBooks = () => {
    setLoading(true)
    if (selectedBookIds.size === 0) return
    console.log('removing books', selectedBookIds)

    drizzleDb
      .delete(bookTable)
      .where(inArray(bookTable.id, [...selectedBookIds]))
      .then((res) => {
        const { changes } = res
        if (changes && changes === selectedBookIds.size) {
          selectedBookIds.clear()
          Toast.show({
            type: 'success',
            text1: '图书删除成功',
            text2: '共删除 ' + changes + '本图书',
          })
          setMultiState(MULTI_STATE.NOT_MULTI_SELECTING)
        }
      })
      .catch((error) => {
        console.log(error)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const addBookByUri = async (uri: string) => {
    setLoading(true)
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
    const book: InsertBook = {
      title: title,
      filePath: copyUri,
      coverPath: coverUri,
      author: author,
      fileHash: 'hash',
    }

    const insertRes = await drizzleDb.insert(bookTable).values(book)
    setLoading(false)
    return insertRes
  }

  return {
    selectedBookIds,
    handleSelectById,
    multiState,
    updateMultiState,
    removeBooks,
    bookData,
    loadBookDataError,
    addBookByUri,
    loading,
  }
}

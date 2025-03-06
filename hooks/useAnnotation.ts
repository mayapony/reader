import { useDrizzleDB } from '@/components/common/DatabaseProvider'
import { annotationTable } from '@/db/schema/annotation'
import { Annotation, useReader } from '@epubjs-react-native/core'
import { eq } from 'drizzle-orm'

export const useAnnotation = () => {
  const { addAnnotation, updateAnnotation, removeAnnotation } = useReader()
  const drizzleDb = useDrizzleDB()

  const handleAddAnnotation = async (annotation: Annotation, bookId: number) => {
    try {
      await drizzleDb.insert(annotationTable).values({
        bookId,
        type: annotation.type,
        cfiRange: annotation.cfiRange,
        sectionIndex: annotation.sectionIndex,
        cfiRangeText: annotation.cfiRangeText,
        iconClass: annotation.iconClass,
        styles: JSON.stringify(annotation.styles),
        data: JSON.stringify(annotation.data),
      })
    } catch (error) {
      console.log(error)
    }
  }

  const handleUpdateAnnotation = async (annotation: Annotation, data?: object, style?: object) => {
    const annotationId = annotation.data.id
    if (!annotationId) {
      return
    }

    console.log({ annotation, data, style })
    const dataBackup = annotation.data
    const stylesBackup = annotation.styles
    let tempAnnotation = structuredClone(annotation)
    tempAnnotation.data = data
    tempAnnotation.styles = style
    updateAnnotation(annotation, data, style)
    console.log({ data })
    try {
      const result = await drizzleDb
        .update(annotationTable)
        .set({
          type: annotation.type,
          cfiRange: annotation.cfiRange,
          sectionIndex: annotation.sectionIndex,
          cfiRangeText: annotation.cfiRangeText,
          iconClass: annotation.iconClass,
          styles: JSON.stringify(style),
          data: JSON.stringify(data),
        })
        .where(eq(annotationTable.id, annotationId))

      console.log(result)
    } catch (error) {
      updateAnnotation(tempAnnotation, dataBackup, stylesBackup)
      console.log(error)
    }
  }

  return {
    handleUpdateAnnotation,
  }
}

import { useDrizzleDB } from '@/components/common/DatabaseProvider'
import { annotationTable } from '@/db/schema/annotation'
import { Annotation, useReader } from '@epubjs-react-native/core'
import { eq } from 'drizzle-orm'

export const useAnnotation = () => {
  const { updateAnnotation, removeAnnotation } = useReader()
  const drizzleDb = useDrizzleDB()

  const handleUpdateAnnotation = async (annotation: Annotation, data?: object, styles?: object) => {
    const annotationId = annotation.data.id
    console.log({ annotation })
    if (!annotationId) {
      return
    }

    console.log({ annotation, data, styles })
    try {
      const result = await drizzleDb
        .update(annotationTable)
        .set({
          type: annotation.type,
          cfiRange: annotation.cfiRange,
          sectionIndex: annotation.sectionIndex,
          cfiRangeText: annotation.cfiRangeText,
          iconClass: annotation.iconClass,
          styles: JSON.stringify(styles),
          data: JSON.stringify(data),
        })
        .where(eq(annotationTable.id, annotationId))

      updateAnnotation(annotation, data, styles)

      console.log(result)
    } catch (error) {
      console.log(error)
    }
  }

  const handleDeleteAnnotation = async (annotation: Annotation, annotations: Annotation[]) => {
    const annotationId = annotation.data.id
    if (!annotationId) {
      return
    }
    try {
      const result = await drizzleDb
        .delete(annotationTable)
        .where(eq(annotationTable.id, annotationId))

      /**
       * Required for the "add note" scenario, as an "underline" and "mark" type annotation is created in it and both work as one...
       */
      if (annotation.data?.key) {
        const withMarkAnnotations = annotations.filter(
          ({ data }) => data.key === annotation.data.key,
        )

        withMarkAnnotations.forEach((_annotation) => removeAnnotation(_annotation))
      } else {
        removeAnnotation(annotation)
      }
      console.log(result)
    } catch (error) {
      console.log(error)
    }
  }

  return {
    handleUpdateAnnotation,
    handleDeleteAnnotation,
  }
}

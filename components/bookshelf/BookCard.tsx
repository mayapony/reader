import { Book } from "@/interfaces/book";
import { styled } from "@tamagui/core";
import { Card, H3, Image, Text, View } from "tamagui";

const BookTitle = styled(Text, {
  width: "100%",
  overflow: "hidden",
});

export function BookCard({ book }: { book: Book }) {
  return (
    <View
      style={{
        width: "30%",
        margin: 10,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Card
        animation="bouncy"
        scale={0.9}
        hoverStyle={{ scale: 0.925 }}
        pressStyle={{ scale: 0.875 }}
      >
        <Image
          source={{ uri: book.cover }}
          style={{
            width: "100%",
            aspectRatio: 1.5,
            borderRadius: 8,
          }}
        />
        <BookTitle numberOfLines={1}>{book.title}</BookTitle>
      </Card>
    </View>
  );
}

import {
  View,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import {
  Card,
  H1,
  H2,
  H3,
  H4,
  Image,
  Paragraph,
  SizableStack,
  SizableText,
  styled,
  XStack,
  YStack,
  Text,
  Button,
} from "tamagui";
import { Book } from "@/interfaces/book";
import { Link, router } from "expo-router";

const SearchBar = styled(TextInput, {
  borderWidth: 1,
  borderRadius: 8,
  padding: 10,
  width: "80%",
});

const BookCard = styled(View, {
  width: "30%",
  margin: 10,
  alignItems: "center",
  justifyContent: "center",
});

const BookTitle = styled(Text, {
  width: "100%",
  textAlign: "center",
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
});

const BookShelfScreen = () => {
  const [books, setBooks] = useState<Book[]>([]);

  // 加载本地数据
  useEffect(() => {
    const loadBooks = async () => {
      try {
        const storedBooks = await AsyncStorage.getItem("@books");
        if (storedBooks) setBooks(JSON.parse(storedBooks));
      } catch (error) {
        Alert.alert("错误", "无法加载书籍数据");
      }
    };
    loadBooks();
  }, []);

  // 导入图书
  const handleImportBook = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/epub+zip", "application/pdf"],
        copyToCacheDirectory: true, // 自动复制到应用缓存目录
      });

      if (result.assets?.[0]) {
        const { uri, name } = result.assets[0];
        const newBook: Book = {
          id: Date.now().toString(),
          title: name.replace(/\.[^/.]+$/, ""),
          author: "未知作者",
          cover: `https://picsum.photos/200/300?random=${Date.now()}`,
          progress: 0,
          fileUri: uri,
        };
        const updatedBooks = [...books, newBook];
        setBooks(updatedBooks);
        await AsyncStorage.setItem("@books", JSON.stringify(updatedBooks));
      }
    } catch (error) {
      Alert.alert("错误", "导入图书失败");
    }
  };

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
            pathname: "/book/[uri]",
            params: { uri: item.fileUri },
          })
        }
      >
        <Image
          source={{ uri: item.cover }}
          style={{
            width: "100%",
            height: undefined,
            aspectRatio: 2 / 3,
            borderRadius: 8,
          }}
        />
      </Card>
      <BookTitle numberOfLines={1}>{item.title}</BookTitle>
    </BookCard>
  );

  return (
    <YStack flex={1} backgroundColor="$background">
      <XStack justifyContent="space-between" padding={20}>
        <SearchBar placeholder="搜索书籍" />
        <Button onPress={handleImportBook}>导入</Button>
      </XStack>

      <FlatList
        data={books}
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
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 8,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300,
  },
  emptyText: {
    color: "#666",
    fontSize: 16,
    marginTop: 16,
  },
});

export default BookShelfScreen;

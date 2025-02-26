import {
  Button,
  Text,
  ToastAndroid,
  useWindowDimensions,
  View,
} from "react-native";
import {
  Annotation,
  Reader,
  ReaderProvider,
  useReader,
} from "@epubjs-react-native/core";
import { useFileSystem } from "@epubjs-react-native/expo-file-system";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ExpoAnkiDroidApiModule from "@/modules/expo-ankidroid-api";
import * as Notifications from "expo-notifications";
import axios from "axios";
import md5 from "crypto-js/md5";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { YStack } from "tamagui";

export default function Book() {
  const { width, height } = useWindowDimensions();

  const { addAnnotation, removeAnnotation, annotations } = useReader();
  const [selection, setSelection] = useState<Selection | null>(null);
  const [selectedAnnotation, setSelectedAnnotation] = useState<
    Annotation | undefined
  >(undefined);
  const [tempMark, setTempMark] = useState<Annotation | null>(null);
  const annotationsListRef = useRef<BottomSheetModal>(null);

  const params = useLocalSearchParams();
  const bookUri = useMemo(() => params.uri + "", [params]);

  return (
    <YStack
      backgroundColor={"red"}
      justifyContent="center"
      alignItems="center"
      flex={1}
    >
      <GestureHandlerRootView>
        <ReaderProvider>
          <Reader
            src={bookUri}
            width={width}
            // @ts-ignore
            fileSystem={useFileSystem}
            initialLocation="introduction_001.xhtml"
            initialAnnotations={[
              // Chapter 1
              {
                cfiRange: "epubcfi(/6/10!/4/2/4,/1:0,/1:319)",
                data: {},
                sectionIndex: 4,
                styles: { color: "#23CE6B" },
                cfiRangeText:
                  "The pale Usher—threadbare in coat, heart, body, and brain; I see him now. He was ever dusting his old lexicons and grammars, with a queer handkerchief, mockingly embellished with all the gay flags of all the known nations of the world. He loved to dust his old grammars; it somehow mildly reminded him of his mortality.",
                type: "highlight",
              },
              // Chapter 5
              {
                cfiRange: "epubcfi(/6/22!/4/2/4,/1:80,/1:88)",
                data: {},
                sectionIndex: 3,
                styles: { color: "#CBA135" },
                cfiRangeText: "landlord",
                type: "highlight",
              },
            ]}
            onAddAnnotation={(annotation) => {
              if (annotation.type === "highlight" && annotation.data?.isTemp) {
                setTempMark(annotation);
              }
            }}
            onPressAnnotation={(annotation) => {
              setSelectedAnnotation(annotation);
              annotationsListRef.current?.present();
            }}
            onChangeAnnotations={(annotation) => {
              console.log("onChangeAnnotations", annotation);
            }}
            menuItems={[
              {
                label: "🟡",
                action: (cfiRange) => {
                  addAnnotation("highlight", cfiRange, undefined);
                  return true;
                },
              },
              {
                label: "🔴",
                action: (cfiRange) => {
                  addAnnotation("highlight", cfiRange, undefined);
                  return true;
                },
              },
              {
                label: "🟢",
                action: (cfiRange) => {
                  addAnnotation("highlight", cfiRange, undefined);
                  return true;
                },
              },
              {
                label: "To Anki",
                action: (cfiRange, text) => {
                  console.log("Add Note", cfiRange, text);
                  const params = {
                    q: text,
                    from: "auto",
                    to: "zh",
                    appid: "",
                    salt: "123456",
                    get sign() {
                      return md5(this.appid + this.q + this.salt + "");
                    },
                  };
                  console.log({ params });
                  axios({
                    method: "post",
                    url: "https://fanyi-api.baidu.com/api/trans/vip/translate",
                    params: params,
                  })
                    .then((response) => {
                      const transResult = response.data?.trans_result?.[0]?.dst;
                      if (!transResult) {
                        throw new Error("Translation Failed");
                      }
                      const card = {
                        Front: text,
                        Back: transResult,
                      };
                      console.log({ card });
                      ExpoAnkiDroidApiModule.addCardsToAnkiDroidAsync([card])
                        .then((added) => {
                          console.log(added);
                          ToastAndroid.show("Card Added", ToastAndroid.SHORT);
                        })
                        .catch((error) => {
                          console.log(error);
                          ToastAndroid.show(
                            "Card Add Failed",
                            ToastAndroid.SHORT
                          );
                        });
                    })
                    .catch((error) => {
                      console.log(error);
                      ToastAndroid.show(
                        "Translation Failed",
                        ToastAndroid.SHORT
                      );
                    });
                  return true;
                },
              },
            ]}
          />
        </ReaderProvider>
      </GestureHandlerRootView>
    </YStack>
  );
}

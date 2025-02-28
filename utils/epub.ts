import JSZip from "jszip";
import { parse } from "fast-xml-parser"; //  适配 fast-xml-parser@3
import * as FileSystem from "expo-file-system";

const parseXml = (xmlString: string) => {
  const options = {
    ignoreAttributes: false,
    attributeNamePrefix: "", // 避免属性前缀
    removeNSPrefix: true,
  };
  return parse(xmlString, options);
};

const readEpubFile = async (epubUri: string) => {
  try {
    return await FileSystem.readAsStringAsync(epubUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
  } catch (error) {
    console.error("EPUB 读取失败:", error);
    return null;
  }
};

const getCoverImage = async (zip: JSZip, metadata: any, opfPath: string) => {
  try {
    // 方式 1: EPUB2 通过 meta 获取封面 ID
    let coverId = metadata?.meta?.find((m: any) => m.name === "cover")?.content;

    // 方式 2: EPUB3 通过 item[properties="cover-image"] 获取封面
    if (!coverId) {
      coverId = metadata.manifest.item.find(
        (i: any) => i.properties === "cover-image"
      )?.id;
    }

    if (!coverId) throw new Error("封面未找到");

    // 获取封面路径
    const coverItem = metadata.manifest.item.find((i: any) => i.id === coverId);
    if (!coverItem) throw new Error("封面文件路径不存在");

    const coverHref = coverItem.href;
    const opfDir = opfPath.substring(0, opfPath.lastIndexOf("/") + 1);
    const coverPath = opfDir + coverHref;

    // 提取 Base64 封面数据
    const coverBase64 = await zip.file(coverPath)?.async("base64");
    if (!coverBase64) throw new Error("封面数据提取失败");

    // 存储封面到 App 目录
    const appCoverDir = FileSystem.documentDirectory + "covers/";
    const fileName = `${Date.now()}_cover.jpg`;
    const coverFilePath = appCoverDir + fileName;

    // 确保 `covers/` 目录存在
    const dirInfo = await FileSystem.getInfoAsync(appCoverDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(appCoverDir, { intermediates: true });
    }

    //  保存封面文件
    await FileSystem.writeAsStringAsync(coverFilePath, coverBase64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    console.log("封面已保存:", coverFilePath);
    return coverFilePath;
  } catch (error) {
    console.warn(error instanceof Error ? error.message : "封面提取失败");
    return null;
  }
};

export const getMetadataFromEpub = async (epubUri: string) => {
  try {
    const base64 = await readEpubFile(epubUri);
    if (!base64) throw new Error("EPUB 文件读取失败");

    const zip = await JSZip.loadAsync(base64, { base64: true });

    const containerXml = await zip
      .file("META-INF/container.xml")
      ?.async("text");
    if (!containerXml) throw new Error("META-INF/container.xml 不存在");

    console.log(containerXml);
    const containerDoc = parseXml(containerXml);
    const opfPath = Array.isArray(containerDoc.container.rootfiles.rootfile)
      ? containerDoc.container.rootfiles.rootfile[0]["full-path"]
      : containerDoc.container.rootfiles.rootfile["full-path"];

    if (!opfPath) throw new Error("OPF 文件路径不存在");

    const opfXml = await zip.file(opfPath)?.async("text");
    if (!opfXml) throw new Error("OPF 文件不存在");

    const opfDoc = parseXml(opfXml);
    const metadata = opfDoc.package.metadata;
    if (!metadata) throw new Error("元数据不存在");

    const title =
      metadata["dc:title"]?.["#text"] || metadata["dc:title"] || "未知书名";
    const author =
      metadata["dc:creator"]?.["#text"] || metadata["dc:creator"] || "未知作者";

    const coverUri = await getCoverImage(zip, opfDoc.package, opfPath);

    return { title, author, coverUri };
  } catch (error) {
    console.error("EPUB 解析失败:", error);
    return null;
  }
};

//  保存 EPUB 文件到 App 目录
export const saveEpubFileToAppFolder = async (epubUri: string) => {
  try {
    const appBooksDir = FileSystem.documentDirectory + "books/";

    //  确保 books/ 目录存在
    const dirInfo = await FileSystem.getInfoAsync(appBooksDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(appBooksDir, { intermediates: true });
    }

    //  生成唯一的 EPUB 文件名
    const fileName = `book_${Date.now()}.epub`;
    const destPath = appBooksDir + fileName;

    //  复制 EPUB 文件
    await FileSystem.copyAsync({
      from: epubUri,
      to: destPath,
    });

    console.log("EPUB 文件已保存:", destPath);
    return destPath;
  } catch (error) {
    console.error("EPUB 复制失败:", error);
    return null;
  }
};

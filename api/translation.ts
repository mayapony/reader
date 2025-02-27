import axios from "axios";
import md5 from "crypto-js/md5";

export async function translationByBaidu(text: string) {
  const params = {
    q: text,
    from: "auto",
    to: "zh",
    appid: process.env.EXPO_PUBLIC_BAIDU_API_ID ?? "",
    salt: process.env.EXPO_PUBLIC_SALT ?? "",
    get sign() {
      return md5(
        this.appid + this.q + this.salt + process.env.EXPO_PUBLIC_BAIDU_KEY
      ).toString();
    },
  };

  console.log({ params });

  const response = await fetch(
    `https://fanyi-api.baidu.com/api/trans/vip/translate?${new URLSearchParams(
      params
    )}`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to translation, API REQUEST ERROR");
  }

  const data = await response.json();
  console.log({ data: data?.trans_result });
  const dst = data?.trans_result?.[0]?.dst;

  if (!dst) {
    throw new Error("Failed to translation, DON'T HAVE DST");
  }

  return dst;
}

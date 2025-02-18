package expo.modules.ankidroidapi

object AnkiDroidConfig {
    // Name of deck which will be created in AnkiDroid
    const val DECK_NAME = "Reader"

    // Name of model which will be created in AnkiDroid
    const val MODEL_NAME = "reader"

    // List of field names that will be used in AnkiDroid model
    val FIELDS = arrayOf("Front", "Back")

    // List of card names that will be used in AnkiDroid (one for each direction of learning)
    val CARD_NAMES = arrayOf("Default")

    // CSS for AnkiDroid cards
    val CSS = """.card {
        font-family: NotoSansJP;
        font-size: 24px;
        text-align: center;
        color: black;
        background-color: white;
        word-wrap: break-word;
    }
    @font-face { font-family: "NotoSansJP"; src: url('_NotoSansJP-Regular.otf'); }
    @font-face { font-family: "NotoSansJP"; src: url('_NotoSansJP-Bold.otf'); font-weight: bold; }
    .big { font-size: 48px; }
    .small { font-size: 18px; }
    """.trimIndent()

    // Templates for the question of each card
    private val QFMT1 = "<div class=big>{{Front}}</div>"
    val QFMT = arrayOf(QFMT1)

    // Templates for the answer (use identical for both sides)
    private val AFMT1 = """<div class=big>{{Back}}</div>
    """.trimIndent()
    val AFMT = arrayOf(AFMT1)

    // Define two keys which will be used when using legacy ACTION_SEND intent
    val FRONT_SIDE_KEY = FIELDS[0]
    val BACK_SIDE_KEY = FIELDS[1]

    /**
     * Generate example data which will be sent to AnkiDroid
     */
    fun getExampleData(): List<Map<String, String>> {
        val exampleWords = arrayOf("例", "データ", "送る")
        val exampleReadings = arrayOf("れい", "データ", "おくる")
        val exampleTranslations = arrayOf("Example", "Data", "To send")
        val exampleFurigana = arrayOf("例[れい]", "データ", "送[おく]る")
        val exampleGrammar = arrayOf("P, adj-no, n, n-pref", "P, n", "P, v5r, vt")
        val exampleSentence =
            arrayOf("そんな先例はない。", "きゃ～データが消えた！", "放蕩生活を送る。")
        val exampleSentenceFurigana = arrayOf(
            "そんな 先例[せんれい]はない。",
            "きゃ～データが 消[き]えた！",
            "放蕩[ほうとう] 生活[せいかつ]を 送[おく]る。"
        )
        val exampleSentenceMeaning = arrayOf(
            "We have no such example",
            "Oh, I lost the data！",
            "I lead a fast way of living."
        )

        return exampleWords.indices.map { idx ->
            mapOf(
                FIELDS[0] to exampleWords[idx],
                FIELDS[1] to exampleTranslations[idx],
            )
        }
    }
}

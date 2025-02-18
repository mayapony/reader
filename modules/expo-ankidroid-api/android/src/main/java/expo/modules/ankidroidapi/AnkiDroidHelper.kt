package expo.modules.ankidroidapi

import android.content.Context
import android.content.SharedPreferences
import android.content.pm.PackageManager
import androidx.core.content.ContextCompat
import com.ichi2.anki.api.AddContentApi

class AnkiDroidHelper(private val mContext: Context) {
    private val mApi = AddContentApi(mContext)
    val api
        get() = mApi

    companion object {
        private const val DECK_REF_DB = "com.ichi2.anki.api.decks"
        private const val MODEL_REF_DB = "com.ichi2.anki.api.models"

        /**
         * Whether or not the API is available to use.
         * The API could be unavailable if AnkiDroid is not installed or the user explicitly disabled the API
         * @return true if the API is available to use
         */
        @JvmStatic
        fun isApiAvailable(context: Context): Boolean {
            return AddContentApi.getAnkiDroidPackageName(context) != null
        }
    }

    /**
     * Whether or not we should request full access to the AnkiDroid API
     */
    fun shouldRequestPermissions(): Boolean {
        return ContextCompat.checkSelfPermission(
            mContext,
            AddContentApi.READ_WRITE_PERMISSION
        ) != PackageManager.PERMISSION_GRANTED
    }


    /**
     * Try to find the given model by name, accounting for renaming of the model:
     * If there's a model with this modelName that is known to have previously been created (by this app)
     *   and the corresponding model ID exists and has the required number of fields
     *   then return that ID (even though it may have since been renamed)
     * If there's a model from #getModelList with modelName and required number of fields then return its ID
     * Otherwise return null
     * @param modelName the name of the model to find
     * @param numFields the minimum number of fields the model is required to have
     * @return the model ID or null if something went wrong
     */
    fun findModelIdByName(modelName: String, numFields: Int): Long? {
        val modelsDb: SharedPreferences =
            mContext.getSharedPreferences(MODEL_REF_DB, Context.MODE_PRIVATE)
        val prefsModelId = modelsDb.getLong(modelName, -1L)

        if (prefsModelId != -1L && mApi.getModelName(prefsModelId) != null && mApi.getFieldList(
                prefsModelId
            ) != null &&
            mApi.getFieldList(prefsModelId).size >= numFields
        ) {
            return prefsModelId
        }

        val modelList = mApi.getModelList(numFields)
        modelList?.forEach { (id, name) ->
            if (name == modelName) return id
        }

        return null
    }

    /**
     * Try to find the given deck by name, accounting for potential renaming of the deck by the user as follows:
     * If there's a deck with deckName then return it's ID
     * If there's no deck with deckName, but a ref to deckName is stored in SharedPreferences, and that deck exist in
     * AnkiDroid (i.e. it was renamed), then use that deck.Note: this deck will not be found if your app is re-installed
     * If there's no reference to deckName anywhere then return null
     * @param deckName the name of the deck to find
     * @return the did of the deck in Anki
     */
    fun findDeckIdByName(deckName: String): Long? {
        val decksDb: SharedPreferences =
            mContext.getSharedPreferences(DECK_REF_DB, Context.MODE_PRIVATE)
        var did: Long? = getDeckId(deckName)
        if (did != null) {
            return did
        } else {
            did = decksDb.getLong(deckName, -1)
            if (did != -1L && mApi.getDeckName(did) != null) {
                return did
            }
            return null
        }
    }

    /**
     * Get the ID of the deck which matches the name
     * @param deckName Exact name of deck (note: deck names are unique in Anki)
     * @return the ID of the deck that has given name, or null if no deck was found or API error
     */
    private fun getDeckId(deckName: String): Long? {
        val deckList = mApi.getDeckList()
        deckList?.forEach { (id, name) ->
            if (name.equals(deckName, ignoreCase = true)) {
                return id
            }
        }
        return null
    }

    /**
     * Save a mapping from deckName to getDeckId in the SharedPreferences
     */
    fun storeDeckReference(deckName: String, deckId: Long) {
        val decksDb: SharedPreferences =
            mContext.getSharedPreferences(DECK_REF_DB, Context.MODE_PRIVATE)
        decksDb.edit().putLong(deckName, deckId).apply()
    }

    /**
     * Save a mapping from modelName to modelId in the SharedPreferences
     */
    fun storeModelReference(modelName: String, modelId: Long) {
        val modelsDb: SharedPreferences =
            mContext.getSharedPreferences(MODEL_REF_DB, Context.MODE_PRIVATE)
        modelsDb.edit().putLong(modelName, modelId).apply()
    }


    /**
     * Remove the duplicates from a list of note fields and tags
     * @param fields List of fields to remove duplicates from
     * @param tags List of tags to remove duplicates from
     * @param modelId ID of model to search for duplicates on
     */
    fun removeDuplicates(
        fields: MutableList<Array<String?>>,
        tags: MutableList<Set<String>>,
        modelId: Long
    ) {
        val keys = ArrayList<String>(fields.size)
        for (f in fields) {
            f[0]?.let { keys.add(it) }
        }

        val duplicateNotes = mApi.findDuplicateNotes(modelId, keys)

        if (tags.size != fields.size) {
            throw IllegalStateException("List of tags must be the same length as the list of fields")
        }

        if (duplicateNotes == null || duplicateNotes.size() == 0 || fields.isEmpty() || tags.isEmpty()) {
            return
        }

        if (duplicateNotes.keyAt(duplicateNotes.size() - 1) >= fields.size) {
            throw IllegalStateException("The array of duplicates goes outside the bounds of the original lists")
        }

        val fieldIterator = fields.toMutableList().listIterator()
        val tagIterator = tags.toMutableList().listIterator()

        var listIndex = -1
        for (i in 0 until duplicateNotes.size()) {
            val duplicateIndex = duplicateNotes.keyAt(i)
            while (listIndex < duplicateIndex) {
                fieldIterator.next()
                tagIterator.next()
                listIndex++
            }
            fieldIterator.remove()
            tagIterator.remove()
        }
    }
}
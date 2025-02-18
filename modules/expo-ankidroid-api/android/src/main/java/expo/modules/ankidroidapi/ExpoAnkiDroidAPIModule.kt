package expo.modules.ankidroidapi

import android.content.Context
import android.util.Log
import android.widget.Toast
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

const val MODULE_NAME = "ExpoAnkiDroidAPI"

class ExpoAnkiDroidAPIModule : Module() {
    private lateinit var ankiDroidHelper: AnkiDroidHelper
    private lateinit var context: Context

    private fun getDeckId(): Long? {
        var did = ankiDroidHelper.findDeckIdByName(AnkiDroidConfig.DECK_NAME)

        if (did == null) {
            did = ankiDroidHelper.api.addNewDeck(AnkiDroidConfig.DECK_NAME)
            ankiDroidHelper.storeDeckReference(AnkiDroidConfig.DECK_NAME, did)
        }

        return did
    }

    /**
     * Get the model ID.
     * @return might be null if there was an error
     */
    private fun getModelId(): Long? {
        var mid = ankiDroidHelper.findModelIdByName(
            AnkiDroidConfig.MODEL_NAME,
            AnkiDroidConfig.FIELDS.size
        )
        if (mid == null) {
            try {
                mid = ankiDroidHelper.api.addNewCustomModel(
                    AnkiDroidConfig.MODEL_NAME,
                    AnkiDroidConfig.FIELDS,
                    AnkiDroidConfig.CARD_NAMES,
                    AnkiDroidConfig.QFMT,
                    AnkiDroidConfig.AFMT,
                    AnkiDroidConfig.CSS,
                    getDeckId(),
                    null
                )
                ankiDroidHelper.storeModelReference(AnkiDroidConfig.MODEL_NAME, mid)
            } catch (e: Exception) {
                Log.e("AnkiDroidAPI", "Error creating model", e)
            }
        }
        return mid
    }

    override fun definition() = ModuleDefinition {
        Name(MODULE_NAME)

        OnCreate {
            appContext.reactContext?.let {
                context = it
                ankiDroidHelper = AnkiDroidHelper(context)
                context
            } ?: throw IllegalStateException("Context is null")
        }

        Function("isApiAvailable") {
            AnkiDroidHelper.isApiAvailable(context)
        }


        AsyncFunction("addCardsToAnkiDroidAsync") { data: List<Map<String, String>>, promise: Promise ->
            val deckId = getDeckId()
            val modelId = getModelId()

            if (deckId == null || modelId == null) {
                promise.reject(MODULE_NAME, "deckId or modelId is null", null)
                return@AsyncFunction
            }

            val fieldNames = ankiDroidHelper.api.getFieldList(modelId)
            if (fieldNames == null) {
                promise.reject(MODULE_NAME, "fieldNames is null", null)
                return@AsyncFunction
            }

            // Build list of fields and tags
            val fields = mutableListOf<Array<String?>>()
            val tags = mutableListOf<Set<String>>()

            for (fieldMap in data) {
                // Build a field map accounting for the fact that the user could have changed the fields in the model
                val flds = arrayOfNulls<String>(fieldNames.size)
                for (i in flds.indices) {
                    if (i < AnkiDroidConfig.FIELDS.size) {
                        flds[i] = fieldMap[AnkiDroidConfig.FIELDS[i]]
                    }
                }
                tags.add(emptySet())
                fields.add(flds)
            }

            // Remove duplicates and add notes
            ankiDroidHelper.removeDuplicates(fields, tags, modelId)
            val added = ankiDroidHelper.api.addNotes(modelId, deckId, fields, tags)

            promise.resolve(added)
        }


        Function("getExampleData") {
            AnkiDroidConfig.getExampleData()
        }
    }
}

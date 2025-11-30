package __PACKAGE_NAME__

import android.content.Context
import com.lynx.tasm.provider.AbsTemplateProvider
import java.io.ByteArrayOutputStream
import java.io.IOException

class LynxTemplateProvider(context: Context) : AbsTemplateProvider() {
    
    private val appContext: Context = context.applicationContext

    override fun loadTemplate(uri: String, callback: Callback) {
        Thread {
            try {
                val inputStream = appContext.assets.open(uri)
                val byteArrayOutputStream = ByteArrayOutputStream()
                val buffer = ByteArray(1024)
                var length: Int
                
                while (inputStream.read(buffer).also { length = it } != -1) {
                    byteArrayOutputStream.write(buffer, 0, length)
                }
                
                inputStream.close()
                callback.onSuccess(byteArrayOutputStream.toByteArray())
            } catch (e: IOException) {
                callback.onFailed(e.message ?: "Failed to load template")
            }
        }.start()
    }
}

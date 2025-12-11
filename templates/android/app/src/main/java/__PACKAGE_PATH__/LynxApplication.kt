package __PACKAGE_NAME__

import android.app.Application
import com.lynx.tasm.LynxEnv
import com.lynx.tasm.LynxEnvBuilder

class LynxApplication : Application() {

    override fun onCreate() {
        super.onCreate()
        initLynxEnv()
    }

    private fun initLynxEnv() {
        try {
            val builder = LynxEnvBuilder(this)
            builder.setMediaResourceFetcher(LocalMediaFetcher())
            LynxEnv.inst().init(builder)
        } catch (e: Exception) {
            e.printStackTrace()
            // Fallback: basic initialization without media fetcher
            try {
                LynxEnv.inst().init(this, null, null, null)
            } catch (e2: Exception) {
                e2.printStackTrace()
            }
        }
    }
}

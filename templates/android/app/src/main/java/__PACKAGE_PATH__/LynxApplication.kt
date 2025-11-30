package __PACKAGE_NAME__

import android.app.Application
import com.lynx.tasm.LynxEnv

class LynxApplication : Application() {

    override fun onCreate() {
        super.onCreate()
        initLynxEnv()
    }

    private fun initLynxEnv() {
        try {
            LynxEnv.inst().init(this, null, null, null)
        } catch (e: Exception) {
            e.printStackTrace()
            // Fallback: basic initialization
        }
    }
}

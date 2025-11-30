package __PACKAGE_NAME__

import android.app.Application
import com.lynx.service.http.LynxHttpService
import com.lynx.service.image.LynxImageService
import com.lynx.service.log.LynxLogService
import com.lynx.tasm.LynxEnv

class LynxApplication : Application() {

    override fun onCreate() {
        super.onCreate()
        initLynxService()
        initLynxEnv()
    }

    private fun initLynxService() {
        LynxImageService.getInstance().init(this)
        LynxLogService.getInstance().init(this)
        LynxHttpService.getInstance().init(this)
    }

    private fun initLynxEnv() {
        LynxEnv.inst().init(
            this,
            null,
            null,
            null
        )
    }
}

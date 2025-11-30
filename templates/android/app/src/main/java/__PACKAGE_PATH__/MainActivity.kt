package __PACKAGE_NAME__

import android.os.Bundle
import androidx.activity.ComponentActivity
import com.lynx.tasm.LynxView
import com.lynx.tasm.LynxViewBuilder

class MainActivity : ComponentActivity() {

    private lateinit var lynxView: LynxView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        lynxView = buildLynxView()
        setContentView(lynxView)
        
        // Load the Lynx bundle
        lynxView.renderTemplateUrl("main.lynx.bundle", "")
    }

    private fun buildLynxView(): LynxView {
        val viewBuilder = LynxViewBuilder()
        viewBuilder.setTemplateProvider(LynxTemplateProvider(this))
        return viewBuilder.build(this)
    }

    override fun onDestroy() {
        super.onDestroy()
        lynxView.destroy()
    }
}

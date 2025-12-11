package __PACKAGE_NAME__

import android.os.Build
import android.os.Bundle
import android.view.View
import android.view.WindowInsetsController
import androidx.activity.ComponentActivity
import androidx.core.view.WindowCompat
import com.lynx.tasm.LynxView
import com.lynx.tasm.LynxViewBuilder

class MainActivity : ComponentActivity() {

    private lateinit var lynxView: LynxView
    
    // Edge-to-edge 开关：设置为 true 启用全面屏沉浸式模式
    private val enableEdgeToEdge = true

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        lynxView = buildLynxView()
        setContentView(lynxView)
        
        // Edge-to-edge 必须在 setContentView 之后调用
        if (enableEdgeToEdge) {
            setupEdgeToEdge()
        }
        
        // Load the Lynx bundle
        lynxView.renderTemplateUrl("main.lynx.bundle", "")
    }
    
    private fun setupEdgeToEdge() {
        // 启用 edge-to-edge 模式
        WindowCompat.setDecorFitsSystemWindows(window, false)
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            // Android 11+ 使用新 API
            window.insetsController?.let { controller ->
                controller.setSystemBarsAppearance(
                    WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS,
                    WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS
                )
            }
        } else {
            // Android 10 及以下
            @Suppress("DEPRECATION")
            window.decorView.systemUiVisibility = (
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            )
        }
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

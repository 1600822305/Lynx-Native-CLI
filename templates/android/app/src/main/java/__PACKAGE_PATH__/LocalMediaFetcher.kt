package __PACKAGE_NAME__

import com.lynx.tasm.resourceprovider.LynxResourceRequest
import com.lynx.tasm.resourceprovider.media.LynxMediaResourceFetcher
import com.lynx.tasm.resourceprovider.media.OptionalBool

/**
 * Custom media resource handler for loading local assets
 * 
 * Intercepts URLs starting with "http://localhost" and redirects them
 * to the "asset://" protocol for loading from Android assets folder.
 */
class LocalMediaFetcher : LynxMediaResourceFetcher() {

    /**
     * Determines if the resource is local
     * @param url The original request URL
     * @return OptionalBool.TRUE indicates the request needs redirection
     */
    override fun isLocalResource(url: String?): OptionalBool {
        return if (url?.startsWith("http://localhost") == true) {
            OptionalBool.TRUE
        } else {
            OptionalBool.FALSE
        }
    }

    /**
     * Performs URL redirection
     * @param request The resource request object
     * @return The converted valid resource path
     */
    override fun shouldRedirectUrl(request: LynxResourceRequest?): String {
        return request?.url?.replace(
            oldValue = "http://localhost",
            newValue = "asset://",
            ignoreCase = true
        ) ?: ""
    }
}

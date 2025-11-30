import Foundation
import Lynx

class LynxTemplateProvider: NSObject, LynxTemplateProviderProtocol {
    
    func loadTemplate(withUrl url: String, onComplete complete: @escaping (Data?, Error?) -> Void) {
        DispatchQueue.global(qos: .userInitiated).async {
            guard let bundlePath = Bundle.main.path(forResource: "Assets/\(url)", ofType: nil) else {
                // Try without Assets prefix
                guard let altPath = Bundle.main.path(forResource: url, ofType: nil) else {
                    let error = NSError(domain: "LynxTemplateProvider", code: 404, userInfo: [
                        NSLocalizedDescriptionKey: "Template not found: \(url)"
                    ])
                    DispatchQueue.main.async {
                        complete(nil, error)
                    }
                    return
                }
                
                do {
                    let data = try Data(contentsOf: URL(fileURLWithPath: altPath))
                    DispatchQueue.main.async {
                        complete(data, nil)
                    }
                } catch {
                    DispatchQueue.main.async {
                        complete(nil, error)
                    }
                }
                return
            }
            
            do {
                let data = try Data(contentsOf: URL(fileURLWithPath: bundlePath))
                DispatchQueue.main.async {
                    complete(data, nil)
                }
            } catch {
                DispatchQueue.main.async {
                    complete(nil, error)
                }
            }
        }
    }
}

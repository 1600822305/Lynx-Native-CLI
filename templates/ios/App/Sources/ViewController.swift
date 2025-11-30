import UIKit
import Lynx

class ViewController: UIViewController {
    
    private var lynxView: LynxView?
    
    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .white
        
        setupLynxView()
        loadLynxBundle()
    }
    
    private func setupLynxView() {
        lynxView = LynxView { builder in
            builder.config = LynxConfig(provider: LynxTemplateProvider())
            builder.screenSize = self.view.frame.size
            builder.fontScale = 1.0
        }
        
        guard let lynxView = lynxView else { return }
        
        lynxView.preferredLayoutWidth = view.frame.size.width
        lynxView.preferredLayoutHeight = view.frame.size.height
        lynxView.layoutWidthMode = .exact
        lynxView.layoutHeightMode = .exact
        lynxView.frame = view.bounds
        lynxView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        
        view.addSubview(lynxView)
    }
    
    private func loadLynxBundle() {
        lynxView?.loadTemplateFromURL("main.lynx.bundle", initData: nil)
    }
    
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        lynxView?.frame = view.bounds
    }
}

import SwiftUI

@main
struct TaskManagerApp: App {
    @State private var isLoggedIn = CredentialStore.shared.isLoggedIn

    var body: some Scene {
        WindowGroup {
            Group {
                if isLoggedIn {
                    MainTabView()
                } else {
                    LoginView()
                }
            }
            .onReceive(NotificationCenter.default.publisher(for: UIApplication.didBecomeActiveNotification)) { _ in
                isLoggedIn = CredentialStore.shared.isLoggedIn
            }
        }
    }
}

#Preview {
    MainTabView()
}

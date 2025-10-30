import SwiftUI
import Combine

@MainActor
final class AuthViewModel: ObservableObject {
    @Published var email = ""
    @Published var password = ""
    @Published var isLoading = false
    @Published var error: String?
    @Published var message: String?
    @Published var isLoggedIn = false   // ✅ new flag

    func login() async {
        guard !email.isEmpty, !password.isEmpty else {
            error = "Please enter both email and password."
            return
        }
        isLoading = true
        defer { isLoading = false }

        do {
            let token = try await APIClient.shared.login(email: email, password: password)
            CredentialStore.shared.save(token: token)
            message = "✅ Login successful!"
            isLoggedIn = true           // ✅ tell UI to switch
            print("🔑 Token stored:", token)
        } catch {
            self.error = (error as? APIError)?.errorDescription ?? error.localizedDescription
        }
    }
}




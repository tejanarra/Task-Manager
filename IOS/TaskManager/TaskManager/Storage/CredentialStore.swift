import Security
import Foundation

final class CredentialStore {
    static let shared = CredentialStore()
    private let service = "TaskManager"
    private let account = "authToken"

    func save(token: String) {
        let data = Data(token.utf8)
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account
        ]
        // Delete old token if exists
        SecItemDelete(query as CFDictionary)
        // Add new token
        var attributes = query
        attributes[kSecValueData as String] = data
        let status = SecItemAdd(attributes as CFDictionary, nil)
        print(status == errSecSuccess ? "🔐 Token saved in Keychain" : "❌ Failed to save token: \(status)")
    }

    func load() -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
            kSecReturnData as String: true
        ]
        var item: CFTypeRef?
        let status = SecItemCopyMatching(query as CFDictionary, &item)
        if status == errSecSuccess, let data = item as? Data, let token = String(data: data, encoding: .utf8) {
            print("✅ Loaded token from Keychain: \(token.prefix(25))...")
            return token
        } else {
            print("⚠️ No token found or failed to load (status: \(status))")
            return nil
        }
    }

    func clear() {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account
        ]
        let status = SecItemDelete(query as CFDictionary)
        print(status == errSecSuccess ? "🗑️ Token cleared" : "⚠️ Nothing to delete or error \(status)")
    }

    var isLoggedIn: Bool {
        load() != nil
    }
}

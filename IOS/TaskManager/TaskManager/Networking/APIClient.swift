import Foundation
import UIKit

enum APIError: Error, LocalizedError {
    case invalidURL, invalidResponse, decodingFailed, server(String), unauthorized, unknown
    var errorDescription: String? {
        switch self {
        case .invalidURL: return "Invalid URL"
        case .invalidResponse: return "Invalid Response"
        case .decodingFailed: return "Failed to decode server response"
        case .server(let msg): return msg
        case .unauthorized: return "Unauthorized"
        case .unknown: return "Unknown error"
        }
    }
}

final class APIClient {
    static let shared = APIClient()
    private init() {}

    private let baseURL = URL(string: "https://task-manager-sigma-ashen.vercel.app/api")!

    // MARK: - Auth
    struct LoginBody: Encodable { let email: String; let password: String }
    struct LoginResponse: Decodable { let token: String }

    func login(email: String, password: String) async throws -> String {
        guard let url = URL(string: "https://task-manager-sigma-ashen.vercel.app/api/auth/login")
        else { throw APIError.invalidURL }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try JSONEncoder().encode(LoginBody(email: email, password: password))

        let (data, resp) = try await URLSession.shared.data(for: req)
        guard let http = resp as? HTTPURLResponse else { throw APIError.unknown }

        switch http.statusCode {
        case 200..<300:
            do {
                let response = try JSONDecoder().decode(LoginResponse.self, from: data)
                print("✅ Login successful!")
                print("🔑 Token: \(response.token)")
                return response.token
            } catch {
                throw APIError.decodingFailed
            }
        case 401:
            throw APIError.unauthorized
        default:
            let msg = String(data: data, encoding: .utf8) ?? "Server \(http.statusCode)"
            throw APIError.server(msg)
        }
    }

    // MARK: - Tasks
    struct TaskResponse: Decodable {
        let id: String
        let title: String
        let description: String?
        let status: String?
        let deadline: String?
    }

    func fetchTasks() async throws -> [TaskItem] {
        guard let token = CredentialStore.shared.load() else { throw APIError.unauthorized }
        guard let url = URL(string: "https://task-manager-sigma-ashen.vercel.app/api/tasks")
        else { throw APIError.invalidURL }

        var req = URLRequest(url: url)
        req.httpMethod = "GET"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

        let (data, resp) = try await URLSession.shared.data(for: req)
        guard let http = resp as? HTTPURLResponse else { throw APIError.unknown }

        switch http.statusCode {
        case 200..<300:
            let decoder = JSONDecoder()

            // Custom formatter for "2025-10-29T21:16:01.833Z"
            let formatter = DateFormatter()
            formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSZ"
            formatter.timeZone = TimeZone(secondsFromGMT: 0)
            decoder.dateDecodingStrategy = .formatted(formatter)

            return try decoder.decode([TaskItem].self, from: data)

        case 401:
            throw APIError.unauthorized
        default:
            let msg = String(data: data, encoding: .utf8) ?? "Server \(http.statusCode)"
            throw APIError.server(msg)
        }
    }
    
    // MARK: - Profile

    func fetchProfile() async throws -> UserProfile {
        guard let token = CredentialStore.shared.load() else { throw APIError.unauthorized }
        guard let url = URL(string: "https://task-manager-sigma-ashen.vercel.app/api/profile")
        else { throw APIError.invalidURL }

        var req = URLRequest(url: url)
        req.httpMethod = "GET"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

        let (data, resp) = try await URLSession.shared.data(for: req)
        guard let http = resp as? HTTPURLResponse else { throw APIError.unknown }

        switch http.statusCode {
        case 200..<300:
            let decoder = JSONDecoder()
            return try decoder.decode(UserProfile.self, from: data)
        case 401:
            throw APIError.unauthorized
        default:
            let msg = String(data: data, encoding: .utf8) ?? "Server \(http.statusCode)"
            throw APIError.server(msg)
        }
    }
    
    // MARK: - Update Profile

    func updateProfile(_ body: UpdateProfileBody) async throws -> UserProfile {
        guard let url = URL(string: "\(baseURL)/profile") else {
            throw APIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = "PUT"
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        if let token = CredentialStore.shared.load() {
            request.addValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }else { throw APIError.unauthorized }

        request.httpBody = try JSONEncoder().encode(body)

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse,
              (200..<300).contains(httpResponse.statusCode) else {
            throw APIError.invalidResponse
        }

        // ✅ Decode correctly based on backend response
        let decoded = try JSONDecoder().decode(UpdateProfileResponse.self, from: data)
        
        if let jsonString = String(data: data, encoding: .utf8) {
            print("🔹 UpdateProfile Response: \(jsonString)")
        }

        return decoded.user
    }
    
    // MARK: - Update Profile with Image (Multipart)
    func updateProfileWithImage(
            body: UpdateProfileBody,
            image: UIImage?
        ) async throws -> UserProfile {
            guard let token = CredentialStore.shared.load() else { throw APIError.unauthorized }
            guard let url = URL(string: "\(baseURL)/profile") else { throw APIError.invalidURL }

            var request = URLRequest(url: url)
            request.httpMethod = "PUT"
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
            
            let boundary = UUID().uuidString
            request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
            
            var bodyData = Data()

            func appendField(name: String, value: String?) {
                guard let value = value else { return }
                bodyData.append("--\(boundary)\r\n".data(using: .utf8)!)
                bodyData.append("Content-Disposition: form-data; name=\"\(name)\"\r\n\r\n".data(using: .utf8)!)
                bodyData.append("\(value)\r\n".data(using: .utf8)!)
            }

            appendField(name: "firstName", value: body.firstName)
            appendField(name: "lastName", value: body.lastName)
            appendField(name: "phoneNumber", value: body.phoneNumber)
            appendField(name: "dob", value: body.dob)
            appendField(name: "bio", value: body.bio)

            if let image = image,
               let imageData = image.jpegData(compressionQuality: 0.8) {
                bodyData.append("--\(boundary)\r\n".data(using: .utf8)!)
                bodyData.append("Content-Disposition: form-data; name=\"avatar\"; filename=\"avatar.jpg\"\r\n".data(using: .utf8)!)
                bodyData.append("Content-Type: image/jpeg\r\n\r\n".data(using: .utf8)!)
                bodyData.append(imageData)
                bodyData.append("\r\n".data(using: .utf8)!)
            }

            bodyData.append("--\(boundary)--\r\n".data(using: .utf8)!)
            request.httpBody = bodyData
            
            let (data, response) = try await URLSession.shared.data(for: request)
            guard let http = response as? HTTPURLResponse,
                  (200..<300).contains(http.statusCode) else {
                throw APIError.invalidResponse
            }

            let decoded = try JSONDecoder().decode(UpdateProfileResponse.self, from: data)
            return decoded.user
        }
    }




import Combine
import SwiftUI

struct TaskItem: Identifiable, Decodable {
    let id: Int
    let title: String
    let description: String?
    let status: String?
    let priority: Int?
    let deadline: Date?
    let createdAt: Date?
    let updatedAt: Date?
}


@MainActor
final class TasksViewModel: ObservableObject {
    @Published var tasks: [TaskItem] = []
    @Published var loading = false
    @Published var error: String?

    func fetchTasks() async {
        loading = true; error = nil
        defer { loading = false }
        do {
            tasks = try await APIClient.shared.fetchTasks()
        } catch {
            self.error = error.localizedDescription
        }
    }

    func logout() {
        tasks = []
    }
}

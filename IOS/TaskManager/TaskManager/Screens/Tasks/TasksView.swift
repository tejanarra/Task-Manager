import SwiftUI

struct TasksView: View {
    @StateObject private var vm = TasksViewModel()

    var body: some View {
        NavigationStack {
            List {
                ForEach(vm.tasks) { task in
                    VStack(alignment: .leading, spacing: 6) {
                        Text(task.title)
                            .font(.headline)
                        if let desc = task.description {
                            Text(desc)
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        if let date = task.deadline {
                            Text(date.formatted(date: .abbreviated, time: .shortened))
                                .font(.caption2)
                                .foregroundColor(.gray)
                        }
                    }
                    .padding(.vertical, 4)
                }
            }
            .navigationTitle("My Tasks")
            .refreshable {   // ✅ pull-to-refresh
                await vm.fetchTasks()
            }
            .overlay {
                if vm.loading {
                    ProgressView("Loading…")
                } else if let err = vm.error {
                    VStack {
                        Text(err).foregroundStyle(.red)
                        Button("Retry") { Task { await vm.fetchTasks() } }
                    }
                } else if vm.tasks.isEmpty {
                    ContentUnavailableView("No Tasks", systemImage: "tray")
                }
            }
            .task {
                await vm.fetchTasks()
            }
        }
    }
}

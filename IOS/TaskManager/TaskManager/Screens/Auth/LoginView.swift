import SwiftUI

struct LoginView: View {
    @StateObject private var vm = AuthViewModel()

    var body: some View {
        if vm.isLoggedIn {
            MainTabView()  // ✅ navigate automatically
        } else {
            VStack(spacing: 20) {
                Text("Task Manager").font(.largeTitle).bold()
                VStack(spacing: 12) {
                    TextField("Email", text: $vm.email)
                        .textContentType(.emailAddress)
                        .keyboardType(.emailAddress)
                        .autocapitalization(.none)
                        .textFieldStyle(.roundedBorder)
                    SecureField("Password", text: $vm.password)
                        .textFieldStyle(.roundedBorder)
                }

                Button {
                    Task { await vm.login() }
                } label: {
                    if vm.isLoading { ProgressView() }
                    else { Text("Sign In").frame(maxWidth: .infinity) }
                }
                .buttonStyle(.borderedProminent)

                if let msg = vm.message {
                    Text(msg).foregroundStyle(.green).font(.caption)
                } else if let err = vm.error {
                    Text(err).foregroundStyle(.red).font(.caption)
                }

                Spacer()
            }
            .padding()
        }
    }
}


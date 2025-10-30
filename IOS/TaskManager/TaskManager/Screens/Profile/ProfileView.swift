import SwiftUI

struct ProfileView: View {
    @State private var profile: UserProfile?
    @State private var isLoading = false
    @State private var error: String?
    @State private var success: String?
    @State private var selectedDate = Date()
    @State private var showDatePicker = false
    @State private var isEditMode = false
    @Environment(\.dismiss) private var dismiss
    @FocusState private var focusedField: Field?

    enum Field: Hashable {
        case firstName, lastName, phoneNumber, bio
    }

    var body: some View {
        NavigationStack {
            ZStack {
                
                
                ScrollView {
                    VStack(spacing: 24) {
                        // MARK: - Avatar Section
                        VStack(spacing: 16) {
                            ZStack(alignment: .bottomTrailing) {
                                if let avatar = profile?.avatar, let url = URL(string: avatar) {
                                    AsyncImage(url: url) { image in
                                        image.resizable().scaledToFill()
                                    } placeholder: {
                                        Circle().fill(Color.gray.opacity(0.2)).overlay(ProgressView())
                                    }
                                    .frame(width: 140, height: 140)
                                    .clipShape(Circle())
                                } else {
                                    ZStack {
                                        Circle()
                                            .fill(
                                                LinearGradient(
                                                    colors: [.blue.opacity(0.7), .purple.opacity(0.7), .pink.opacity(0.5)],
                                                    startPoint: .topLeading,
                                                    endPoint: .bottomTrailing
                                                )
                                            )
                                            .frame(width: 140, height: 140)
                                        if let initials = initials(from: profile) {
                                            Text(initials)
                                                .font(.system(size: 52, weight: .bold, design: .rounded))
                                                .foregroundStyle(.white)
                                        } else {
                                            Image(systemName: "person.fill")
                                                .font(.system(size: 50))
                                                .foregroundStyle(.white.opacity(0.8))
                                        }
                                    }
                                }
                                
                                // Camera icon overlay in edit mode
                                if isEditMode {
                                    Circle()
                                        .fill(Color.blue)
                                        .frame(width: 40, height: 40)
                                        .overlay(
                                            Image(systemName: "camera.fill")
                                                .font(.system(size: 16, weight: .semibold))
                                                .foregroundStyle(.white)
                                        )
                                        .shadow(color: .black.opacity(0.2), radius: 5, y: 2)
                                        .offset(x: 5, y: 5)
                                        .transition(.scale.combined(with: .opacity))
                                }
                            }
                            .shadow(color: .black.opacity(0.15), radius: 20, y: 8)
                            .animation(.spring(response: 0.3), value: isEditMode)
                            
                            VStack(spacing: 4) {
                                Text(isEditMode ? "Edit Profile" : fullName())
                                    .font(.title2.bold())
                                    .foregroundColor(.primary)
                                
                                if !isEditMode, let bio = profile?.bio, !bio.isEmpty {
                                    Text(bio)
                                        .font(.subheadline)
                                        .foregroundColor(.secondary)
                                        .multilineTextAlignment(.center)
                                        .lineLimit(2)
                                        .padding(.horizontal)
                                }
                            }
                        }
                        .padding(.top, 20)
                        .padding(.bottom, 8)
                        
                        // MARK: - Info or Edit View
                        if isEditMode {
                            editForm
                        } else {
                            infoCard
                        }
                        
                        Spacer(minLength: 80)
                    }
                }
                .scrollDismissesKeyboard(.interactively)
            }
            .task { await loadProfile() }
            .navigationTitle("Profile")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                // MARK: - Edit / Save button (right side)
                ToolbarItem(placement: .topBarTrailing) {
                    Button(isEditMode ? "Save" : "Edit") {
                        focusedField = nil
                        if isEditMode {
                            Task { await saveProfile() }
                        } else {
                            withAnimation { isEditMode = true }
                        }
                    }
                    .disabled(isLoading)
                    .foregroundColor(isEditMode ? .green : .blue)
                }
                
                // MARK: - Cancel button (left side)
                ToolbarItem(placement: .topBarLeading) {
                    if isEditMode {
                        Button("Cancel") {
                            focusedField = nil
                            withAnimation {
                                isEditMode = false
                                Task { await loadProfile() } // discard unsaved edits
                            }
                        }
                        .foregroundColor(.red)
                    }
                }
                
                
                
                // MARK: - Keyboard Toolbar
                ToolbarItemGroup(placement: .keyboard) {
                    Spacer()
                    Button {
                        focusedField = nil
                    } label: {
                        Image(systemName: "keyboard.chevron.compact.down")
                            .font(.system(size: 16, weight: .semibold))
                    }
                    .foregroundColor(.blue)
                }
            }
        }
    }
        // MARK: - Info Card
        private var infoCard: some View {
            VStack(spacing: 20) {
                if let profile = profile {
                    ProfileInfoRow(icon: "person.fill", label: "Name", value: "\(profile.firstName) \(profile.lastName)", color: .blue)
                    
                    if let phone = profile.phoneNumber, !phone.isEmpty {
                        ProfileInfoRow(icon: "phone.fill", label: "Phone", value: phone, color: .green)
                    }
                    
                    if let dob = profile.dob, !dob.isEmpty {
                        ProfileInfoRow(icon: "calendar", label: "Date of Birth", value: formatDateForDisplay(dob), color: .orange)
                    }
                    
                    
                }
            }
            .padding(24)

            .padding(.horizontal, 16)
        }
    
        // MARK: - Edit Form
        private var editForm: some View {
            VStack(spacing: 20) {
                EnhancedTextField(icon: "person.fill", placeholder: "First Name",
                                  text: Binding(get: { profile?.firstName ?? "" },
                                                set: { profile?.firstName = $0 }), color: .blue)
                .focused($focusedField, equals: .firstName)
                .submitLabel(.next)
                .onSubmit { focusedField = .lastName }
                
                EnhancedTextField(icon: "person.fill", placeholder: "Last Name",
                                  text: Binding(get: { profile?.lastName ?? "" },
                                                set: { profile?.lastName = $0 }), color: .blue)
                .focused($focusedField, equals: .lastName)
                .submitLabel(.next)
                .onSubmit { focusedField = .phoneNumber }
                
                EnhancedTextField(icon: "phone.fill", placeholder: "Phone Number",
                                  text: Binding(get: { profile?.phoneNumber ?? "" },
                                                set: { profile?.phoneNumber = $0 }), color: .green)
                .keyboardType(.phonePad)
                .focused($focusedField, equals: .phoneNumber)
                
                // MARK: DOB Picker
                VStack(alignment: .leading, spacing: 12) {
                    Button {
                        focusedField = nil
                        withAnimation(.spring(response: 0.3)) { showDatePicker.toggle() }
                    } label: {
                        HStack(spacing: 12) {
                            ZStack {
                                RoundedRectangle(cornerRadius: 10)
                                    .fill(Color.orange.opacity(0.15))
                                    .frame(width: 44, height: 44)
                                Image(systemName: "calendar")
                                    .font(.system(size: 18, weight: .semibold))
                                    .foregroundStyle(.orange)
                            }
                            VStack(alignment: .leading, spacing: 2) {
                                Text("Date of Birth")
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                                Text(profile?.dob ?? "Select date")
                                    .font(.body.weight(.medium))
                                    .foregroundColor(profile?.dob == nil ? .secondary : .primary)
                            }
                            Spacer()
                            Image(systemName: showDatePicker ? "chevron.up" : "chevron.down")
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundStyle(.secondary)
                        }
                        .padding(16)
                        .background(RoundedRectangle(cornerRadius: 16).fill(Color(.secondarySystemBackground)))
                    }
                    
                    if showDatePicker {
                        DatePicker("", selection: $selectedDate, in: ...Date(), displayedComponents: .date)
                            .datePickerStyle(.graphical)
                            .tint(.orange)
                            .onChange(of: selectedDate) { _, newValue in
                                let formatter = DateFormatter()
                                formatter.dateFormat = "yyyy-MM-dd"
                                profile?.dob = formatter.string(from: newValue)
                            }
                            .transition(.scale.combined(with: .opacity))
                    }
                }
                
                // MARK: Bio Editor
                VStack(alignment: .leading, spacing: 12) {
                    HStack(spacing: 12) {
                        ZStack {
                            RoundedRectangle(cornerRadius: 10)
                                .fill(Color.purple.opacity(0.15))
                                .frame(width: 44, height: 44)
                            Image(systemName: "text.alignleft")
                                .font(.system(size: 18, weight: .semibold))
                                .foregroundStyle(.purple)
                        }
                        Text("Bio")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                        Spacer()
                    }
                    
                    ZStack(alignment: .topLeading) {
                        if profile?.bio?.isEmpty ?? true {
                            Text("Tell us about yourself...")
                                .foregroundColor(.secondary.opacity(0.6))
                                .padding(.horizontal, 16)
                                .padding(.vertical, 16)
                        }
                        
                        TextEditor(text: Binding(
                            get: { profile?.bio ?? "" },
                            set: { profile?.bio = $0 }
                        ))
                        .frame(minHeight: 120)
                        .scrollContentBackground(.hidden)
                        .padding(12)
                        .focused($focusedField, equals: .bio)
                    }
                    .background(RoundedRectangle(cornerRadius: 16).fill(Color(.secondarySystemBackground)))
                }
                
                // MARK: Status Messages
                if let msg = success {
                    statusCapsule(text: msg, color: .green, icon: "checkmark.circle.fill")
                }
                if let err = error {
                    statusCapsule(text: err, color: .red, icon: "exclamationmark.triangle.fill")
                }
            }
            .padding(24)
            
            .padding(.horizontal, 16)
        }
    

    // MARK: - Helpers
    func fullName() -> String {
        guard let profile = profile else { return "Profile" }
        return "\(profile.firstName) \(profile.lastName)".trimmingCharacters(in: .whitespaces)
    }

    func initials(from profile: UserProfile?) -> String? {
        guard let p = profile else { return nil }
        let first = p.firstName.first.map(String.init) ?? ""
        let last = p.lastName.first.map(String.init) ?? ""
        return (first + last).uppercased().isEmpty ? nil : (first + last).uppercased()
    }

    func formatDateForDisplay(_ dateString: String) -> String {
        let inputFormatter = DateFormatter()
        inputFormatter.dateFormat = "yyyy-MM-dd"
        let outputFormatter = DateFormatter()
        outputFormatter.dateStyle = .medium
        if let date = inputFormatter.date(from: dateString) {
            return outputFormatter.string(from: date)
        }
        return dateString
    }

    func loadProfile() async {
        isLoading = true
        error = nil
        success = nil
        defer { isLoading = false }
        do {
            profile = try await APIClient.shared.fetchProfile()
            if let dobString = profile?.dob {
                let formatter = DateFormatter()
                formatter.dateFormat = "yyyy-MM-dd"
                if let date = formatter.date(from: dobString) {
                    selectedDate = date
                }
            }
        } catch {
            withAnimation {
                self.error = (error as? APIError)?.errorDescription ?? error.localizedDescription
            }
        }
    }

    func saveProfile() async {
        guard let user = profile else { return }
        isLoading = true
        error = nil
        success = nil
        focusedField = nil
        defer { isLoading = false }
        do {
            let body = UpdateProfileBody(
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber,
                dob: user.dob,
                bio: user.bio
            )
            profile = try await APIClient.shared.updateProfile(body)
            withAnimation(.spring(response: 0.3)) {
                success = "Profile updated successfully"
                isEditMode = false
            }
            Task {
                try? await Task.sleep(for: .seconds(3))
                withAnimation { success = nil }
            }
        } catch {
            withAnimation {
                self.error = (error as? APIError)?.errorDescription ?? error.localizedDescription
            }
        }
    }

    // MARK: - Status Capsule
    private func statusCapsule(text: String, color: Color, icon: String) -> some View {
        HStack(spacing: 10) {
            Image(systemName: icon).font(.system(size: 18))
            Text(text).font(.subheadline.weight(.medium))
        }
        .foregroundStyle(.white)
        .padding(.horizontal, 20)
        .padding(.vertical, 12)
        .background(
            Capsule().fill(color).shadow(color: color.opacity(0.3), radius: 10, y: 5)
        )
        .transition(.scale.combined(with: .opacity))
    }
}

// MARK: - Reusable Components
struct ProfileInfoRow: View {
    let icon: String
    let label: String
    let value: String
    let color: Color
    var body: some View {
        HStack(spacing: 12) {
            ZStack {
                RoundedRectangle(cornerRadius: 10).fill(color.opacity(0.15)).frame(width: 40, height: 40)
                Image(systemName: icon).font(.system(size: 16, weight: .semibold)).foregroundStyle(color)
            }
            VStack(alignment: .leading, spacing: 2) {
                Text(label).font(.subheadline).foregroundColor(.secondary)
                Text(value).font(.body.weight(.medium)).foregroundColor(.primary)
            }
            Spacer()
        }
    }
}

struct EnhancedTextField: View {
    let icon: String
    let placeholder: String
    @Binding var text: String
    let color: Color
    var body: some View {
        HStack(spacing: 12) {
            ZStack {
                RoundedRectangle(cornerRadius: 10).fill(color.opacity(0.15)).frame(width: 44, height: 44)
                Image(systemName: icon).font(.system(size: 18, weight: .semibold)).foregroundStyle(color)
            }
            TextField(placeholder, text: $text).font(.body)
        }
        .padding(16)
        .background(RoundedRectangle(cornerRadius: 16).fill(Color(.secondarySystemBackground)))
    }
}

#Preview {
    ProfileView()
}

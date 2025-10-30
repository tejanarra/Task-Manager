import Foundation

struct UpdateProfileResponse: Decodable {
    let message: String
    let user: UserProfile
}


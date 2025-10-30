import Foundation

struct UserProfile: Codable {
    let id: Int
    var firstName: String
    var lastName: String
    var email: String
    var phoneNumber: String?
    var dob: String?
    var bio: String?
    var avatar: String?
    var isVerified: Bool
}

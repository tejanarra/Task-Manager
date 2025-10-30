import Foundation

struct UpdateProfileBody: Codable {
    var firstName: String
    var lastName: String
    var phoneNumber: String?
    var dob: String?
    var bio: String?
}

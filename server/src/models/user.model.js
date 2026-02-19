import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: String,
    phone: String,
    email: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: ["student", "faculty", "staff", "admin"],
      required: true,
    },
    department: String,
    profilePic: String,
    collegeIdImage: String,
    verificationStatus: {
      type: String,
      enum: ["unverified", "verified"],
      default: "unverified",
    },

    // role-based fields
    rollNumber: String,        // student
    year: String,
    section: String,

    employeeId: String,        // faculty
    designation: String,
    cabin: String,

    staffId: String,           // maintenance
    skillType: String,
    assignedDepartments: [String],

    adminId: String,           // admin
    officeRole: String,
    managedDepartments: [String],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);

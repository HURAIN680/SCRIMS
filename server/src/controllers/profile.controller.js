import User from "../models/user.model.js";

/* ================= GET PROFILE ================= */
export const getMyProfile = async (req, res) => {
  try {
    const user = req.user;

    const responseUser = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
      department: user.department,
      profilePicture: user.profilePicture,
      collegeIdImage: user.collegeIdImage,
      verificationStatus: user.verificationStatus,

      // role-based
      ...(user.role === "student" && {
        rollNumber: user.rollNumber,
        year: user.year,
        section: user.section,
      }),

      ...(user.role === "faculty" && {
        employeeId: user.employeeId,
        designation: user.designation,
        cabin: user.cabin,
      }),

      ...(user.role === "staff" && {
        staffId: user.staffId,
        skillType: user.skillType,
        assignedDepartments: user.assignedDepartments,
      }),

      ...(user.role === "admin" && {
        adminId: user.adminId,
        officeRole: user.officeRole,
        managedDepartments: user.managedDepartments,
      }),
    };

    res.json(responseUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= UPDATE PROFILE ================= */
export const updateProfile = async (req, res) => {
  try {
    const user = req.user;

    const {
      fullName,
      phoneNumber,
      department,

      // student
      rollNumber,
      year,
      section,

      // faculty
      employeeId,
      designation,
      cabin,

      // staff
      staffId,
      skillType,
      assignedDepartments,

      // admin
      adminId,
      officeRole,
      managedDepartments,
    } = req.body;

    /* ---------- COMMON FIELDS ---------- */
    if (fullName?.trim()) user.fullName = fullName;
    if (phoneNumber?.trim()) user.phoneNumber = phoneNumber;
    if (department?.trim()) user.department = department;

    /* ---------- FILE UPLOADS ---------- */
    if (req.files?.profilePicture?.length > 0) {
      user.profilePicture = req.files.profilePicture[0].path;
    }

    if (req.files?.collegeIdImage?.length > 0) {
      user.collegeIdImage = req.files.collegeIdImage[0].path;
      user.verificationStatus = "pending";
    }

    /* ---------- RESET ROLE-SPECIFIC FIELDS ---------- */
    user.rollNumber = undefined;
    user.year = undefined;
    user.section = undefined;

    user.employeeId = undefined;
    user.designation = undefined;
    user.cabin = undefined;

    user.staffId = undefined;
    user.skillType = undefined;
    user.assignedDepartments = undefined;

    user.adminId = undefined;
    user.officeRole = undefined;
    user.managedDepartments = undefined;

    /* ---------- ROLE BASED ---------- */
    if (user.role === "student") {
      if (rollNumber?.trim()) user.rollNumber = rollNumber;
      if (year?.trim()) user.year = year;
      if (section?.trim()) user.section = section;
      delete user.assignedDepartments;
      delete user.managedDepartments;
    }

    if (user.role === "faculty") {
      if (employeeId?.trim()) user.employeeId = employeeId;
      if (designation?.trim()) user.designation = designation;
      if (cabin?.trim()) user.cabin = cabin;
      delete user.assignedDepartments;
      delete user.managedDepartments;
    }

    if (user.role === "staff") {
      if (staffId?.trim()) user.staffId = staffId;
      if (skillType?.trim()) user.skillType = skillType;

      if (assignedDepartments) {
        user.assignedDepartments = Array.isArray(assignedDepartments)
          ? assignedDepartments
          : [assignedDepartments];
      }
    }

    if (user.role === "admin") {
      if (adminId?.trim()) user.adminId = adminId;
      if (officeRole?.trim()) user.officeRole = officeRole;

      if (managedDepartments) {
        user.managedDepartments = Array.isArray(managedDepartments)
          ? managedDepartments
          : [managedDepartments];
      }
    }

    await user.save();

    const updatedUser = await User.findById(user._id).select("-password -__v");

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

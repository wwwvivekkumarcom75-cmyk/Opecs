 
const Programme = require("../models/Programme");

const checkEligibility = async (req, res) => {
  try {
    const {
      programmeCode,
      qualificationCode,
      courses,
      percentage,
    } = req.body;

    // 1. Validate programme code
    if (
      typeof programmeCode !== "string" ||
      !programmeCode.trim()
    ) {
      return res.status(400).json({
        eligible: false,
        message: "Please select a valid programme.",
      });
    }

    // 2. Validate percentage
    if (
      percentage === undefined ||
      percentage === null ||
      String(percentage).trim() === "" ||
      !Number.isFinite(Number(percentage)) ||
      Number(percentage) < 0 ||
      Number(percentage) > 100
    ) {
      return res.status(400).json({
        eligible: false,
        message: "Enter a percentage between 0 and 100.",
      });
    }

    // 3. Validate selected courses
    if (
      !Array.isArray(courses) ||
      !courses.every(
        (course) =>
          typeof course === "string" && course.trim().length > 0
      )
    ) {
      return res.status(400).json({
        eligible: false,
        message: "Please select valid course codes.",
      });
    }

    // 4. Find the selected programme in MongoDB
    const programme = await Programme.findOne({
      programmeCode: programmeCode.trim(),
    }).lean();

    if (!programme) {
      return res.status(404).json({
        eligible: false,
        message: "Programme not found. Please check the programme code.",
      });
    }

    // 5. Read the programme-specific eligibility criteria
    const studentPercentage = Number(percentage);
    const minimumPercentage = Number(programme.minimumPercentage);

    if (
      !Number.isFinite(minimumPercentage) ||
      minimumPercentage < 0 ||
      minimumPercentage > 100
    ) {
      console.error(
        `Invalid minimumPercentage configured for programme ${programme.programmeCode}`
      );

      return res.status(500).json({
        eligible: false,
        message: "The programme eligibility criteria are incorrectly configured.",
      });
    }

    const requiredCourses = (
      programme.requiredCourses || []
    ).map((course) => String(course).trim().toUpperCase());

    const selectedCourses = [
      ...new Set(
        courses.map((course) => course.trim().toUpperCase())
      ),
    ];

    // 6. Check required courses
    const missingCourses = requiredCourses.filter(
      (course) => !selectedCourses.includes(course)
    );

    const percentageSatisfied =
      studentPercentage >= minimumPercentage;

    const coursesSatisfied =
      missingCourses.length === 0;

    // Qualification mismatch is intentionally ignored.
    // Eligibility depends only on percentage and required courses.
    const eligible =
      percentageSatisfied && coursesSatisfied;

    // 7. Explain unmet criteria
    const requirementsNotMet = [];

    if (!percentageSatisfied) {
      requirementsNotMet.push(
        `Minimum required percentage is ${minimumPercentage}%.`
      );
    }

    if (!coursesSatisfied) {
      requirementsNotMet.push(
        `Missing required courses: ${missingCourses.join(", ")}.`
      );
    }

    // 8. Return the result in a frontend-friendly format
    return res.status(200).json({
      eligible,
      message: eligible
        ? "Congratulations! You meet the configured eligibility criteria."
        : requirementsNotMet.join(" "),
      programmeName: programme.programmeName,
      programme: programme.programmeName,
      programmeCode: programme.programmeCode,
      qualificationCode: qualificationCode || "",
      percentage: studentPercentage,
      minimumPercentage,
      requiredCourses,
      selectedCourses,
      missingCourses,
      requirementsNotMet,
    });
  } catch (error) {
    console.error("Eligibility controller error:", error);

    return res.status(500).json({
      eligible: false,
      message: "Server error while checking eligibility.",
    });
  }
};

module.exports = { checkEligibility };

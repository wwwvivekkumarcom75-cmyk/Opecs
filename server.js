 
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Programme = require("./models/Programme");
const eligibilityRoutes = require("./routes/eligibilityRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// 1. MIDDLEWARE
// ============================================
app.use(cors());
app.use(express.json());

// ============================================
// 2. HOME ROUTE
// GET http://localhost:5000/
// ============================================
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "OPECS API is running successfully.",
    project: "Online Programme Eligibility Checking System",
    totalProgrammes: 15,
  });
});

// ============================================
// 3. API ROUTES
// GET  /api/health
// POST /api/check-eligibility
// ============================================
app.use("/api", eligibilityRoutes);

// ============================================
// 4. MASTER'S DEGREE PROGRAMMES
// Each programme has its own percentage criteria.
// ============================================
const programmes = [
  {
    programmeCode: "MCA01",
    programmeName: "Master of Computer Applications",
    qualificationCode: "BCA01",
    qualificationName: "Bachelor of Computer Applications",
    requiredCourses: ["CS101", "CS102", "CS103"],
    minimumPercentage: 55,
  },
  {
    programmeCode: "MBA01",
    programmeName: "Master of Business Administration",
    qualificationCode: "BBA01",
    qualificationName: "Bachelor of Business Administration",
    requiredCourses: ["MG101", "MG102", "MG103"],
    minimumPercentage: 50,
  },
  {
    programmeCode: "MSC01",
    programmeName: "MSc Computer Science",
    qualificationCode: "BSC01",
    qualificationName: "BSc Computer Science",
    requiredCourses: ["CSC101", "CSC102", "CSC103"],
    minimumPercentage: 60,
  },
  {
    programmeCode: "MSC02",
    programmeName: "MSc Mathematics",
    qualificationCode: "BSC02",
    qualificationName: "BSc Mathematics",
    requiredCourses: ["MAT101", "MAT102", "MAT103"],
    minimumPercentage: 55,
  },
  {
    programmeCode: "MSC03",
    programmeName: "MSc Physics",
    qualificationCode: "BSC03",
    qualificationName: "BSc Physics",
    requiredCourses: ["PHY101", "PHY102", "PHY103"],
    minimumPercentage: 60,
  },
  {
    programmeCode: "MSC04",
    programmeName: "MSc Chemistry",
    qualificationCode: "BSC04",
    qualificationName: "BSc Chemistry",
    requiredCourses: ["CHM101", "CHM102", "CHM103"],
    minimumPercentage: 55,
  },
  {
    programmeCode: "MSC05",
    programmeName: "MSc Information Technology",
    qualificationCode: "BSC01",
    qualificationName: "BSc Computer Science",
    requiredCourses: ["IT101", "IT102", "IT103"],
    minimumPercentage: 50,
  },
  {
    programmeCode: "MA01",
    programmeName: "MA English",
    qualificationCode: "BA01",
    qualificationName: "Bachelor of Arts",
    requiredCourses: ["ENG101", "ENG102", "ENG103"],
    minimumPercentage: 45,
  },
  {
    programmeCode: "MA02",
    programmeName: "MA Economics",
    qualificationCode: "BA02",
    qualificationName: "BA Economics",
    requiredCourses: ["ECO101", "ECO102", "ECO103"],
    minimumPercentage: 50,
  },
  {
    programmeCode: "MA03",
    programmeName: "MA Political Science",
    qualificationCode: "BA01",
    qualificationName: "Bachelor of Arts",
    requiredCourses: ["POL101", "POL102", "POL103"],
    minimumPercentage: 45,
  },
  {
    programmeCode: "MA04",
    programmeName: "MA History",
    qualificationCode: "BA01",
    qualificationName: "Bachelor of Arts",
    requiredCourses: ["HIS101", "HIS102", "HIS103"],
    minimumPercentage: 48,
  },
  {
    programmeCode: "MCOM01",
    programmeName: "Master of Commerce",
    qualificationCode: "BCOM01",
    qualificationName: "Bachelor of Commerce",
    requiredCourses: ["COM101", "COM102", "COM103"],
    minimumPercentage: 55,
  },
  {
    programmeCode: "MSW01",
    programmeName: "Master of Social Work",
    qualificationCode: "BA01",
    qualificationName: "Bachelor of Arts",
    requiredCourses: ["SOC101", "SOC102", "SOC103"],
    minimumPercentage: 45,
  },
  {
    programmeCode: "MTTM01",
    programmeName: "Master of Tourism and Travel Management",
    qualificationCode: "BBA01",
    qualificationName: "Bachelor of Business Administration",
    requiredCourses: ["TOU101", "TOU102", "TOU103"],
    minimumPercentage: 50,
  },
  {
    programmeCode: "MTECH01",
    programmeName: "Master of Technology",
    qualificationCode: "BE01",
    qualificationName: "Bachelor of Engineering",
    requiredCourses: ["TEC101", "TEC102", "TEC103"],
    minimumPercentage: 65,
  },
];

// ============================================
// 5. SEED / UPDATE PROGRAMMES IN MONGODB
// Existing programme codes are updated.
// New programme codes are inserted.
// ============================================
const seedProgrammes = async () => {
  const operations = programmes.map((programme) => ({
    updateOne: {
      filter: {
        programmeCode: programme.programmeCode,
      },
      update: {
        $set: programme,
      },
      upsert: true,
    },
  }));

  await Programme.bulkWrite(operations);

  console.log(
    `Successfully seeded ${programmes.length} master's programmes.`
  );
};

// ============================================
// 6. START SERVER
// ============================================
const startServer = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error(
        "MONGODB_URI is missing. Check the backend/.env file."
      );
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected successfully.");

    // Ensure programme data exists before accepting requests.
    await seedProgrammes();

    app.listen(PORT, () => {
      console.log("-------------------------------------");
      console.log("OPECS Backend Started Successfully");
      console.log(`Server URL: http://localhost:${PORT}`);
      console.log(`Health Check: http://localhost:${PORT}/api/health`);
      console.log(
        `Eligibility API: http://localhost:${PORT}/api/check-eligibility`
      );
      console.log(`Total Master's Programmes: ${programmes.length}`);
      console.log("-------------------------------------");
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

// Handle unexpected errors during database operation.
mongoose.connection.on("error", (error) => {
  console.error("MongoDB connection error:", error.message);
});

startServer();

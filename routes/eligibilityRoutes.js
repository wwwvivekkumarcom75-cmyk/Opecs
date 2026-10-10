 
const express = require("express");
const router = express.Router();

const {
  checkEligibility,
} = require("../controllers/eligibilityController");

// ============================================
// 1. API HEALTH CHECK
// Frontend: GET http://localhost:5000/api/health
// ============================================
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "OPECS API is running successfully.",
  });
});

// ============================================
// 2. CHECK STUDENT ELIGIBILITY
// Frontend: POST http://localhost:5000/api/check-eligibility
// ============================================
router.post("/check-eligibility", checkEligibility);

module.exports = router;

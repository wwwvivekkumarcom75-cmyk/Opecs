
const mongoose = require("mongoose");

const programmeSchema = new mongoose.Schema(
  {
    programmeCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true
    },

    programmeName: {
      type: String,
      required: true,
      trim: true
    },

    qualificationCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },

    qualificationName: {
      type: String,
      required: true,
      trim: true
    },

    requiredCourses: {
      type: [String],
      required: true,
      validate: {
        validator: (courses) => courses.length > 0,
        message: "At least one required course must be specified."
      }
    },

    minimumPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Programme", programmeSchema);

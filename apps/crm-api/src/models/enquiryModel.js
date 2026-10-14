const mongoose = require("mongoose");

const enquirySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
    phone: { type: String, trim: true, maxlength: 30, default: "" },
    courseInterest: { type: String, required: true, trim: true, minlength: 2, maxlength: 160 },
    message: { type: String, trim: true, maxlength: 1000, default: "" },
    claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    claimedAt: { type: Date, default: null }
}, { timestamps: true, versionKey: false });

const EnquiryModel = mongoose.model("Enquiry", enquirySchema);
module.exports = { EnquiryModel };

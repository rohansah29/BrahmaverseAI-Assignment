const express = require("express");
const mongoose = require("mongoose");
const { EnquiryModel } = require("../models/enquiryModel");
const { auth } = require("../middleware/auth");
const enquiryRouter = express.Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// public enquiry form - no authentication required
enquiryRouter.post("/", async (req, res) => {
    const { name, email, phone, courseInterest, message } = req.body;
    try {
        if (typeof name !== "string" || name.trim().length < 2) return res.status(400).send({ error: "Name must contain at least 2 characters" });
        if (typeof email !== "string" || !emailPattern.test(email.trim())) return res.status(400).send({ error: "Valid email is required" });
        if (typeof courseInterest !== "string" || courseInterest.trim().length < 2) return res.status(400).send({ error: "Course interest is required" });
        const enquiry = new EnquiryModel({ name: name.trim(), email: email.trim().toLowerCase(), phone: typeof phone === "string" ? phone.trim() : "", courseInterest: courseInterest.trim(), message: typeof message === "string" ? message.trim() : "" });
        await enquiry.save();
        res.status(201).send({ msg: "Enquiry submitted successfully", enquiry: { id: enquiry._id, name: enquiry.name, email: enquiry.email, courseInterest: enquiry.courseInterest, status: "public" } });
    } catch (error) { res.status(500).send({ error: "Failed to submit enquiry" }); }
});

// fetch all unclaimed public enquiries
enquiryRouter.get("/public", auth, async (req, res) => {
    try {
        const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 100);
        const enquiries = await EnquiryModel.find({ claimedBy: null }).sort({ createdAt: -1 }).limit(limit).select("-__v");
        res.status(200).send({ enquiries });
    } catch (error) { res.status(500).send({ error: "Failed to fetch public enquiries" }); }
});

// claim a lead - atomic findOneAndUpdate prevents double claiming
enquiryRouter.patch("/:id/claim", auth, async (req, res) => {
    const { id } = req.params;
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).send({ error: "Invalid enquiry id" });
        const enquiry = await EnquiryModel.findOneAndUpdate({ _id: id, claimedBy: null }, { $set: { claimedBy: req.userID, claimedAt: new Date() } }, { new: true, runValidators: true });
        if (enquiry) return res.status(200).send({ msg: "Enquiry claimed successfully", enquiry });
        const existingEnquiry = await EnquiryModel.findById(id).select("_id claimedBy");
        if (!existingEnquiry) return res.status(404).send({ error: "Enquiry not found" });
        res.status(409).send({ error: "This enquiry has already been claimed" });
    } catch (error) { res.status(500).send({ error: "Failed to claim enquiry" }); }
});

// fetch leads claimed by logged-in employee
enquiryRouter.get("/my", auth, async (req, res) => {
    try {
        const enquiries = await EnquiryModel.find({ claimedBy: req.userID }).sort({ claimedAt: -1 });
        res.status(200).send({ enquiries });
    } catch (error) { res.status(500).send({ error: "Failed to fetch your enquiries" }); }
});
module.exports = { enquiryRouter };

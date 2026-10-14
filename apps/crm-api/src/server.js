require("dotenv").config();
const { app } = require("./app");
const { connection } = require("./config/db");
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    console.error("JWT_SECRET must be set and at least 32 characters long");
    process.exit(1);
}
const PORT = process.env.PORT || 4000;
connection.then(() => {
    console.log("MongoDB connected successfully");
    const server = app.listen(PORT, () => console.log(`CRM API running on port ${PORT}`));
    const shutdown = async () => {
        server.close(async () => {
            const mongoose = require("mongoose");
            await mongoose.connection.close();
            process.exit(0);
        });
    };
    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
}).catch(error => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
});

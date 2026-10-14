const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
    const header = req.headers.authorization || "";
    const parts = header.split(" ");
    const token = parts[0] === "Bearer" ? parts[1] : null;
    if (!token) return res.status(401).send({ error: "Please login to continue" });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.userID) return res.status(401).send({ error: "Invalid token" });
        req.userID = decoded.userID;
        req.userEmail = decoded.email;
        next();
    } catch (error) {
        return res.status(401).send({ error: "Invalid or expired token" });
    }
};
module.exports = { auth };

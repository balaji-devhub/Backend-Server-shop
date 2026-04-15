import jwt from "jsonwebtoken";

const Auth = (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                message: "No token provided"
            });
        }


        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        // attach user
        req.user = decoded;

        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};

export default Auth;
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protect = async (req, res, next) => {
	try {
		console.log(' Protect middleware - Cookies reçus:', Object.keys(req.cookies));
		console.log(' Protect middleware - Headers:', {
			cookie: req.headers.cookie ? 'présent' : 'absent',
			authorization: req.headers.authorization ? 'présent' : 'absent',
			origin: req.headers.origin,
		});
		
		let accessToken = req.cookies.accessToken;
		
		if (!accessToken && req.headers.authorization) {
			const authHeader = req.headers.authorization;
			if (authHeader.startsWith('Bearer ')) {
				accessToken = authHeader.substring(7);
				console.log(' Protect: Token trouvé dans Authorization header');
			}
		}

		if (!accessToken) {
			console.log(' Protect: Pas de accessToken (ni cookie ni header)');
			return res.status(401).json({ message: "Unauthorized - No access token provided" });
		}
		
		console.log(' Protect: accessToken trouvé');

		try {
			const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
			const user = await User.findById(decoded.userId).select("-password");

			if (!user) {
				return res.status(401).json({ message: "User not found" });
			}

			req.user = user;

			next();
		} catch (error) {
			if (error.name === "TokenExpiredError") {
				return res.status(401).json({ message: "Unauthorized - Access token expired" });
			}
			throw error;
		}
	} catch (error) {
		console.log("Error in protectRoute middleware", error.message);
		return res.status(401).json({ message: "Unauthorized - Invalid access token" });
	}
};
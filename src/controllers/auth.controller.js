import { signToken } from '../utils/auth.util.js';
import { AppError } from '../utils/error-handler.js';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

class AuthController {
    
    /**
     * Handles user login and JWT generation.
     */
    login = async (req, res, next) => {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return next(new AppError('Please provide username and password!', 400));
            }

            // Static Credential Check (Replace with DB check + bcrypt in production)
            const isMatch = (username === ADMIN_USERNAME && password === ADMIN_PASSWORD);
            
            if (!isMatch) {
                return next(new AppError('Incorrect username or password', 401));
            }

            // Sign JWT using a fixed ID for the admin user
            const token = signToken(1); 
            
            res.status(200).json({
                status: 'success',
                token,
                user: { id: 1, username: ADMIN_USERNAME }
            });

        } catch (error) {
            next(error);
        }
    };
}

export default AuthController;
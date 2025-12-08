import express from 'express';
import { JwtPayload } from 'jsonwebtoken';
const router = express.Router();
import { verifyToken } from '../services/token.services';
// ...existing code...
import { getAdminById,getModeratorById } from '../services/users.services';


router.use(express.json());
router.use(express.urlencoded({ extended: true }));



router.get('/', async (req, res) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
        return res.status(401).json({ message: "Token manquant" });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Format d'autorisation invalide" });
    }
    const decoded = verifyToken(token);
    if (decoded !=null){
        if (getAdminById((decoded as JwtPayload).id)){
            res.send({ message: 'Token is valid and user is admin'})
        }else if (getModeratorById((decoded as JwtPayload).id)){
            res.send({ message: 'Token is valid and user is moderator'})
        }else{
        res.send({ message: 'Token is valid'})
        }
    }else{
        res.status(401).send({ message: 'Invalid token' });
    }
    
})

export { router as tokenRoutes };
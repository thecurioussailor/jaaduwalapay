import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET!;

export const AuthService = {
    async register(email: string, password: string) {
        const existing = await prisma.merchant.findUnique({
            where: {
                email
            }
        });

        if(existing) throw new Error('EMAIL_TAKEN');

        const passwordHash = await bcrypt.hash(password, 12);
        
        const merchant = await prisma.merchant.create({
            data: {
                email,
                passwordHash
            },
            select: { 
                id: true, 
                email: true,
                isOnboarded: true 
            }
        });
        
        const token = jwt.sign({ merchantId: merchant.id }, JWT_SECRET, { expiresIn: '7d' })

        return { token, merchant }                
    },

    async login(email: string, password: string) {
        const merchant = await prisma.merchant.findUnique({
            where: {
                email
            }
        });

        if(!merchant) throw new Error('INVALID_CREDENTIALS');

        const valid = await bcrypt.compare(password, merchant.passwordHash);

        if(!valid) throw new Error('INVALID_CREDENTIALS');

        const token = jwt.sign(
            {
                merchantId: merchant.id
            }, 
            JWT_SECRET, 
            {
                expiresIn: '7d'
            }
        );

        return {
            token,
            merchant: {
                id: merchant.id,
                email: merchant.email,
                isOnboarded: merchant.isOnboarded
            }
        }
    }

}
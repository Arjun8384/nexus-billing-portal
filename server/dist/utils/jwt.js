"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
const jose_1 = require("jose");
const env_1 = require("../config/env");
const secret = new TextEncoder().encode(env_1.env.JWT_SECRET);
async function generateToken(payload) {
    return new jose_1.SignJWT(payload)
        .setProtectedHeader({
        alg: "HS256",
    })
        .setIssuedAt()
        .setExpirationTime(env_1.env.JWT_EXPIRES_IN)
        .sign(secret);
}
async function verifyToken(token) {
    const { payload } = await (0, jose_1.jwtVerify)(token, secret);
    return payload;
}

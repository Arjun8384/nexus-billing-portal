"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = exports.UserRepository = void 0;
const user_model_1 = require("./user.model");
class UserRepository {
    async findById(userId) {
        return user_model_1.UserModel.findById(userId).select("+refreshToken");
    }
    async findByEmail(email) {
        return user_model_1.UserModel.findOne({
            email: email.toLowerCase(),
        }).select("+password");
    }
    async findClients() {
        return user_model_1.UserModel.find({
            role: "CLIENT",
        }).sort({
            createdAt: -1,
        });
    }
    async findClientById(userId) {
        return user_model_1.UserModel.findOne({
            _id: userId,
            role: "CLIENT",
        });
    }
    async updateClient(userId, input) {
        return user_model_1.UserModel.findOneAndUpdate({
            _id: userId,
            role: "CLIENT",
        }, {
            $set: input,
        }, {
            new: true,
            runValidators: true,
        });
    }
    async updateLastLogin(userId) {
        return user_model_1.UserModel.findByIdAndUpdate(userId, {
            lastLogin: new Date(),
        }, {
            new: true,
        });
    }
    async create(user) {
        return user_model_1.UserModel.create(user);
    }
    async updateRefreshToken(userId, refreshToken) {
        return user_model_1.UserModel.findByIdAndUpdate(userId, {
            refreshToken,
        }, {
            new: true,
        });
    }
    async updateClientStatus(userId, isActive) {
        return user_model_1.UserModel.findOneAndUpdate({
            _id: userId,
            role: "CLIENT",
        }, {
            $set: {
                isActive,
            },
        }, {
            new: true,
            runValidators: true,
        });
    }
}
exports.UserRepository = UserRepository;
exports.userRepository = new UserRepository();

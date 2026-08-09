"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClient = createClient;
exports.getClients = getClients;
exports.getClientById = getClientById;
exports.updateClient = updateClient;
exports.updateClientStatus = updateClientStatus;
const http_status_codes_1 = require("http-status-codes");
const app_error_1 = require("../../utils/app-error");
const api_response_1 = require("../../utils/api-response");
const user_schema_1 = require("./user.schema");
const user_service_1 = require("./user.service");
function getParamId(value) {
    if (!value || Array.isArray(value)) {
        throw new app_error_1.AppError("Invalid client ID", http_status_codes_1.StatusCodes.BAD_REQUEST);
    }
    return value;
}
async function createClient(req, res) {
    const parsed = user_schema_1.createClientSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new app_error_1.AppError("Invalid client data", http_status_codes_1.StatusCodes.BAD_REQUEST);
    }
    const client = await user_service_1.userService.createClient(parsed.data);
    return res.status(http_status_codes_1.StatusCodes.CREATED).json((0, api_response_1.successResponse)("Client created successfully", { client }));
}
async function getClients(_req, res) {
    const clients = await user_service_1.userService.getClients();
    return res.status(http_status_codes_1.StatusCodes.OK).json((0, api_response_1.successResponse)("Clients retrieved successfully", { clients }));
}
async function getClientById(req, res) {
    const client = await user_service_1.userService.getClientById(getParamId(req.params.id));
    return res.status(http_status_codes_1.StatusCodes.OK).json((0, api_response_1.successResponse)("Client retrieved successfully", { client }));
}
async function updateClient(req, res) {
    const parsed = user_schema_1.updateClientSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new app_error_1.AppError("Invalid client data", http_status_codes_1.StatusCodes.BAD_REQUEST);
    }
    const client = await user_service_1.userService.updateClient(getParamId(req.params.id), parsed.data);
    return res.status(http_status_codes_1.StatusCodes.OK).json((0, api_response_1.successResponse)("Client updated successfully", { client }));
}
async function updateClientStatus(req, res) {
    const parsed = user_schema_1.updateClientStatusSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new app_error_1.AppError("Invalid client status", http_status_codes_1.StatusCodes.BAD_REQUEST);
    }
    const client = await user_service_1.userService.updateClientStatus(getParamId(req.params.id), parsed.data);
    return res.status(http_status_codes_1.StatusCodes.OK).json((0, api_response_1.successResponse)("Client status updated successfully", { client }));
}

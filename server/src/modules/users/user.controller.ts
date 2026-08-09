import type {
  Request,
  Response,
} from "express";
import { StatusCodes } from "http-status-codes";

import { AppError } from "@/utils/app-error";
import { successResponse } from "@/utils/api-response";

import {
  createClientSchema,
  updateClientSchema,
  updateClientStatusSchema,
} from "./user.schema";
import { userService } from "./user.service";

function getParamId(
  value: string | string[] | undefined
): string {
  if (!value || Array.isArray(value)) {
    throw new AppError(
      "Invalid client ID",
      StatusCodes.BAD_REQUEST
    );
  }

  return value;
}

export async function createClient(
  req: Request,
  res: Response
) {
  const parsed =
    createClientSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError(
      "Invalid client data",
      StatusCodes.BAD_REQUEST
    );
  }

  const client =
    await userService.createClient(
      parsed.data
    );

  return res.status(
    StatusCodes.CREATED
  ).json(
    successResponse(
      "Client created successfully",
      { client }
    )
  );
}

export async function getClients(
  _req: Request,
  res: Response
) {
  const clients =
    await userService.getClients();

  return res.status(StatusCodes.OK).json(
    successResponse(
      "Clients retrieved successfully",
      { clients }
    )
  );
}

export async function getClientById(
  req: Request,
  res: Response
) {
  const client =
    await userService.getClientById(
      getParamId(req.params.id)
    );

  return res.status(StatusCodes.OK).json(
    successResponse(
      "Client retrieved successfully",
      { client }
    )
  );
}

export async function updateClient(
  req: Request,
  res: Response
) {
  const parsed =
    updateClientSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError(
      "Invalid client data",
      StatusCodes.BAD_REQUEST
    );
  }

  const client =
    await userService.updateClient(
        getParamId(req.params.id),
        parsed.data
    );

  return res.status(StatusCodes.OK).json(
    successResponse(
      "Client updated successfully",
      { client }
    )
  );
}

export async function updateClientStatus(
  req: Request,
  res: Response
) {
  const parsed =
    updateClientStatusSchema.safeParse(
      req.body
    );

  if (!parsed.success) {
    throw new AppError(
      "Invalid client status",
      StatusCodes.BAD_REQUEST
    );
  }

  const client =
    await userService.updateClientStatus(
      getParamId(req.params.id),
      parsed.data
    );

  return res.status(StatusCodes.OK).json(
    successResponse(
      "Client status updated successfully",
      { client }
    )
  );
}
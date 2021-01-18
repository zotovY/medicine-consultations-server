import { Response } from "express";
import logger from "../logger";
import Joi from "joi";

export default class RoutesHelper {

    private static defaultValidationResponse = { success: false, error: "not_validated" }

    public static JoiValidator = (
        res: Response,
        schema: Joi.AnySchema,
        data: any,
        position: string,
        responseJson = RoutesHelper.defaultValidationResponse,
        responseStatus = 404): boolean => {
            const validate = schema.validate(data);
            if (validate.error) {
                logger.i(`${position}: failed to validate`, validate.error);
                res.status(responseStatus).json(responseJson)
                return false;
            }
            return true;
    }

    public static getStatus = (schema: { [key: number]: string[]}, error: string, def = 500): number => {
        // @ts-ignore
        const keys: number[] = Object.keys(schema);
        for (let i = 0; i < keys.length; i++) {
            if (schema[keys[i]].includes(error)) return keys[i];
        }

        return def;
    }

}
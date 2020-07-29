/// <reference path="../declaration/mongoose-extended-schema.d.ts" />

import { Types } from "mongoose";
import Doctor, { BecomeDoctorRequest } from "../models/doctor";

// types
import { DoctorObject, IDoctor, BecomeDoctorObj } from "../types/models";

import {
    TValidateDoctor,
    TDoctorValidationErrors,
    TValidationErrorType,
    TSpeciality,
    TCreateDoctor,
    TUpdateDoctor,
    TRemoveDoctor,
    TGetOneDoctor,
    TSaveBecomeDoctorRequest,
} from "../types/services";

// Services
import UserServices from "./user_services";
import { IDoctorToDoctorObj } from "./types_services";
import logger from "../logger";

class DoctorServices {
    // ANCHOR: validate doctor
    validate = async (
        doctor: any,
        needUnique: boolean = true
    ): Promise<TValidateDoctor> => {
        if (!doctor) {
            return {
                success: false,
                errors: {},
            };
        }

        // Doctor model is extended from User model,
        // so, if obj is not validate as user this will never validated as doctor
        const response = await UserServices.validateUser(doctor, needUnique);

        if (!response.success) {
            return {
                success: false,
                errors: response.errors,
            };
        }

        let errors: TDoctorValidationErrors = {};
        const ErrorType = TValidationErrorType;

        // Education
        if (!doctor.education) {
            errors.education = ErrorType.RequiredError;
        } else if (typeof doctor.education !== "string") {
            errors.education = ErrorType.TypeError;
        }

        // Year education
        if (!doctor.yearEducation) {
            errors.yearEducation = ErrorType.RequiredError;
        } else if (typeof doctor.yearEducation !== "string") {
            errors.yearEducation = ErrorType.TypeError;
        }

        // Blanck series
        if (!doctor.blankSeries) {
            errors.blankSeries = ErrorType.RequiredError;
        } else if (typeof doctor.blankSeries !== "string") {
            errors.blankSeries = ErrorType.TypeError;
        }

        // Blanck number
        if (!doctor.blankNumber) {
            errors.blankNumber = ErrorType.RequiredError;
        } else if (typeof doctor.blankNumber !== "string") {
            errors.blankNumber = ErrorType.TypeError;
        }

        // issueDate
        if (!doctor.issueDate) {
            errors.issueDate = ErrorType.RequiredError;
        } else {
            if (typeof doctor.issueDate !== "string") {
                errors.issueDate = ErrorType.TypeError;
            }
        }

        // Speciality
        if (doctor.speciality !== undefined && doctor.speciality !== null) {
            if (!Array.isArray(doctor.speciality)) {
                errors.speciality = ErrorType.TypeError;
            } else {
                for (let i = 0; i < doctor.speciality.length; i++) {
                    if (
                        !Object.keys(TSpeciality).includes(doctor.speciality[i])
                    ) {
                        errors.speciality = ErrorType.TypeError;
                        break;
                    }
                }
            }
        } else errors.speciality = ErrorType.RequiredError;

        // beginDoctorDate
        if (doctor.beginDoctorDate) {
            if (!(doctor.beginDoctorDate instanceof Date)) {
                errors.beginDoctorDate = ErrorType.TypeError;
            }
        } else errors.beginDoctorDate = ErrorType.RequiredError;

        // experience
        if (doctor.experience) {
            if (typeof doctor.experience !== "number") {
                errors.experience = ErrorType.TypeError;
            } else if (doctor.experience < 0) {
                errors.experience = ErrorType.TypeError;
            }
        } else errors.experience = ErrorType.RequiredError;

        // rating
        if (doctor.rating) {
            if (typeof doctor.rating !== "number") {
                errors.rating = ErrorType.TypeError;
            } else if (doctor.rating < 0 || doctor.rating > 5) {
                errors.rating = ErrorType.TypeError;
            }
        } else errors.rating = ErrorType.RequiredError;

        // whosFavourite
        if (doctor.whosFavourite) {
            if (!Array.isArray(doctor.whosFavourite)) {
                errors.whosFavourite = ErrorType.TypeError;
            } else {
                for (let i = 0; i < doctor.whosFavourite.length; i++) {
                    if (!Types.ObjectId.isValid(doctor.whosFavourite[i])) {
                        errors.whosFavourite = ErrorType.TypeError;
                        break;
                    }
                }
            }
        } else errors.whosFavourite = ErrorType.RequiredError;

        // clientsReviews
        if (
            doctor.clientsReviews !== undefined &&
            doctor.clientsReviews !== null
        ) {
            if (!Array.isArray(doctor.clientsReviews)) {
                errors.clientsReviews = ErrorType.TypeError;
            }
        } else errors.clientsReviews = ErrorType.RequiredError;

        // clientConsultations
        if (
            doctor.clientsConsultations !== undefined &&
            doctor.clientsConsultations !== null
        ) {
            if (!Array.isArray(doctor.clientsConsultations)) {
                errors.clientsConsultations = ErrorType.TypeError;
            }
        } else errors.clientsConsultations = ErrorType.RequiredError;

        // sheldure
        if (doctor.sheldure) {
            if (!Array.isArray(doctor.sheldure)) {
                errors.sheldure = ErrorType.TypeError;
            }
        } else errors.sheldure = ErrorType.RequiredError;

        if (Object.keys(errors).length == 0) {
            return {
                success: true,
            };
        } else {
            return {
                success: false,
                errors,
            };
        }
    };

    // ANCHOR: create doctor
    create = async (data: DoctorObject): Promise<TCreateDoctor> => {
        // validate doctor type
        const response = await this.validate(data);

        if (!response.success || response.errors === {}) {
            logger.w(`user is not validated, errors=${response.errors}`);
            return {
                success: false,
                error: "not_validated_error",
                errors: response.errors,
                message: "User is not validated",
            };
        }

        const doctor: IDoctor = new Doctor(data);

        if (!doctor) {
            logger.w(`created doctor is null data = ${data}`);
            return {
                success: false,
                error: "created_doctor_is_null",
                message: "Created doctor is null",
            };
        }

        // save doctor to db
        await doctor.save();

        logger.i(`successfully create doctor with id ${doctor._id}`);

        return {
            success: true,
            doctor: IDoctorToDoctorObj(doctor),
        };
    };

    // ANCHOR: update doctor
    update = async (data: DoctorObject): Promise<TUpdateDoctor> => {
        const validation = await this.validate(data, false);

        if (!validation.success) {
            logger.w(`user is not validated, errors=${validation.errors}`);
            return {
                success: false,
                error: "not_validated_error",
                validationErrors: validation.errors,
                message: "Passing doctor object is not validated",
            };
        }

        try {
            const updated: IDoctor | null = await Doctor.findOneAndUpdate(
                { _id: data.id },
                data,
                { new: true }
            );

            if (!updated) {
                logger.w(
                    `Updated user is null. User with id=${data.id} does not exist`
                );
                return {
                    success: false,
                    error: "updated_doctor_is_null",
                    message: `Updated user is null. User with id=${data.id} does not exist`,
                };
            }

            return {
                success: true,
                doctor: IDoctorToDoctorObj(updated),
            };
        } catch (e) {
            logger.e(e, e.stack);
            return {
                success: false,
                error: "invalid_error",
                message: "Invalid error happened",
            };
        }
    };

    // ANCHOR: remove doctor
    delete = async (id: string | Types.ObjectId): Promise<TRemoveDoctor> => {
        const doctor: IDoctor | null = await Doctor.findOne({
            _id: id,
        });

        // no doctor found
        if (!doctor) {
            logger.w(`No user found with id = ${id}`);
            return {
                success: false,
                error: "no_doctor_found",
                message: `No user found with id = ${id}`,
            };
        }

        let error: any;
        let removed: IDoctor | undefined | null;

        // remove doctor
        removed = await doctor.deleteOne();

        // error
        if (error) {
            logger.e(error, error.trace);
            return {
                success: false,
                error: "invalid_error",
                message: `invalid error when doctor.remove()`,
            };
        }

        if (removed) {
            logger.i(`successfully remove user with id=${removed.id}`);
            return {
                success: true,
                doctor: IDoctorToDoctorObj(removed),
            };
        } else {
            logger.w(`Removed user is null, id=${id}`);
            return {
                success: false,
                error: "removed_doctor_is_null",
                message: "Removed user is null",
            };
        }
    };

    // ANCHOR: get one
    getOne = async (id: string | Types.ObjectId): Promise<TGetOneDoctor> => {
        if (!Types.ObjectId.isValid(id)) {
            logger.w(`Invalid Id were provide, id=${id}`);
            return {
                success: false,
                error: "no_doctor_found",
                message: "Invalid Id were provide",
            };
        }

        const doctor: IDoctor | null = await Doctor.findById(id);

        if (!doctor) {
            logger.w(`No doctor found, id=${id}`);
            return {
                success: false,
                error: "no_doctor_found",
                message: "Invalid Id were provide",
            };
        }

        logger.i(`successfully get user, id=${id}`);
        return {
            success: true,
            doctor: IDoctorToDoctorObj(doctor),
        };
    };

    // ANCHOR: save become doctor request
    saveBecomeDoctorRequest = async (
        request: BecomeDoctorObj
    ): Promise<TSaveBecomeDoctorRequest> => {
        try {
            const email = request.email;

            if (email) {
                const founded = await BecomeDoctorRequest.find({ email });

                if (founded.length >= 3) {
                    logger.i(
                        `Exceeded the limit of request per one email=${email} (3)`
                    );
                    return {
                        success: false,
                        error: "requests_limit_error",
                        message:
                            "Exceeded the limit of request per one email (3)",
                    };
                }
            } else {
                logger.i(`no email found, ignore become doctor request`);
                return {
                    success: true,
                };
            }

            await BecomeDoctorRequest.create(request);

            logger.i(`successfully save become doctor request for ${email}`);
            return {
                success: true,
            };
        } catch (e) {
            logger.e(e, e.trace);
            return {
                success: false,
                error: "invalid_error",
                message: "Invalid error happened",
            };
        }
    };
}

export default new DoctorServices();

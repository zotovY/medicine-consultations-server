const mongoose = require("mongoose");
const requiredField = [true, "required_error"];


const consultation = new mongoose.Schema({
    patientId: {
        type: String,
        required: requiredField,
    },
    patientName: {
        type: String,
        required: requiredField,
    },
    doctorId: {
        type: String,
        required: requiredField,
    },
    doctorName: {
        type: String,
        required: requiredField,
    },
    doctorPhotoUrl: {
        type: String,
        required: requiredField,
    },
    doctorSpecialty: {
        type: String,
        required: requiredField,
    },
    date: {
        type: Date,
        required: requiredField,
    },
    note: {
        type: String,
    }
});


module.exports = mongoose.model("Consultation", consultation);
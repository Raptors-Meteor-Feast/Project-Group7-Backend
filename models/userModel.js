import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    displayName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData: { type: Object, default: {} }
},{ 
    minimize: false, 
    versionKey: false
})

const userModel = mongoose.models.user || mongoose.model('user',userSchema);

export default userModel;
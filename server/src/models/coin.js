import mongoose from "mongoose";


const coinSchema = new mongoose.Schema({
    cokde: {
        type: String,
        required: true,
        unique: true,
    }
});

// Create user model
const User = mongoose.model('Coin', userSchema);

export default User;
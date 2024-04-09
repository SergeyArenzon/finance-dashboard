import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    }
});

// / Create user model
const User = mongoose.model('User', userSchema);


// Login route
  

  export default User;
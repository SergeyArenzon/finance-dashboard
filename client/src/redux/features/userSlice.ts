
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IUser } from '@/types/user.type';
import { loginApi, signupApi } from '@/api/auth';
import { coinsnApi } from '@/api/coins';


const initialState = {value: null} 



export const fetchUser =  createAsyncThunk("user/fetch", async () => {
  const res = await fetch("http://localhost:5001/me",{
    method: "get",
    credentials: 'include'
  });
  
  const data = await res.json();
  return data;

});

export const logoutUser =  createAsyncThunk("user/logout", async () => {
  const res = await fetch("http://localhost:5001/logout",{
    method: "post",
    credentials: 'include'
  });
  
  const data = await res.json();
  return data;

});
export const loginUser =  createAsyncThunk("user/login",  loginApi);
export const signUser =  createAsyncThunk("user/signup",  signupApi);
export const updateUserCoins =  createAsyncThunk("user/update-coins",  coinsnApi);


export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {

    setUser: (state: IUser | null, action: PayloadAction<IUser>) => {
      state.value = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchUser.fulfilled, (state: IUser, action) => {
      state.value = action.payload
    });

    builder.addCase(logoutUser.fulfilled, (state: IUser, action) => {
      state.value = null
    });

    builder.addCase(loginUser.fulfilled, (state: IUser, action) => {
      state.value = action.payload
    });

    builder.addCase(signUser.fulfilled, (state: IUser, action) => {
      state.value = action.payload
    });
    builder.addCase(updateUserCoins.fulfilled, (state: IUser, action) => {
      state.value = state.value.coins = action.payload
    });
  },
  

})

// Action creators are generated for each case reducer function
export const { setUser } = userSlice.actions;

export default userSlice.reducer;
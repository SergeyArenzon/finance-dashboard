import React, { useState } from 'react'
import { AuthForm } from '@/components/ui/auth-form'
import { IUser } from '@/types/user.type';
import { loginUser, signUser} from '@/redux/features/userSlice';
import { RootState } from '@/redux/store';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { useNavigate } from 'react-router-dom';

enum AuthStateEnum{
  Signup = "signup",
  Login = "login"
}


export const SignupPage = () => {

  const user: IUser | null = useAppSelector((state: RootState ) => state.user.value);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();



  const handleSignup = async(user: IUser) => {
    try {
      const signupUser = await dispatch(signUser(user));
      debugger
      if(!signupUser.payload.email) throw Error("")
      navigate("/dashboard");
      
    } catch (error) {
        console.log(error);
        
    }
    
  }


  return (
    <div className='h-full w-full flex justify-center items center'>
        <AuthForm 
        submitLabel={"Signup"}
        handleLoginSubmit={handleSignup}/>
    </div>
  )
}

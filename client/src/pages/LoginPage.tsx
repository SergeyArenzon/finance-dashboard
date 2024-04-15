import React, { useState } from 'react'
import { AuthForm } from '@/components/ui/auth-form'
import { IUser } from '@/types/user.type';
import { loginUser} from '@/redux/features/userSlice';
import { RootState } from '@/redux/store';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { useNavigate } from 'react-router-dom';

enum AuthStateEnum{
  Signup = "signup",
  Login = "login"
}


export const LoginPage = () => {

  const user: IUser | null = useAppSelector((state: RootState ) => state.user.value);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();



  const handleLogin = async(user: IUser) => {
    try {
      const loggedUser = await dispatch(loginUser(user));
      
      if(!loggedUser.payload.email) throw Error("")
      navigate("/dashboard");
      
    } catch (error) {
        console.log(error);
        
    }
    
  }



  return (
    <div className='h-full w-full flex justify-center items center'>
        <AuthForm 
        submitLabel={"Login"}
        handleLoginSubmit={ handleLogin }/>
    </div>
  )
}

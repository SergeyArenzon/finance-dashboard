import React, { useState } from 'react'
import { Button } from './ui/button';
import { RootState } from '@/redux/store';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { IUser } from '@/types/user.type';
import {  useNavigate } from 'react-router-dom';
import { logoutUser } from '@/redux/features/userSlice';
import { useLocation } from 'react-router-dom';

const Navbar = () => {
  const user: IUser | null = useAppSelector((state: RootState ) => state.user.value);
  const location = useLocation();

  enum AuthState {
    Signup = "signup",
    Login = "login"
  }
  

  const [switchButtonState, setSwitchButtonState] = useState<AuthState>(AuthState.Login); 
  const authRouteName = location.pathname.split("/")[1] === AuthState.Signup ? "login" : "signup"
  
  const navigate = useNavigate();
    const dispatch = useAppDispatch();

  const logoutHandler = () => {
    try {
      dispatch(logoutUser())
      navigate(`/${authRouteName}`);
    } catch (error) {
      console.log(error);
      
    } 
  }



  
  console.log(`/${switchButtonState}`);
  

  
  return (
    <nav className='bg-primary rounded-lg glex p-3 justify-between w-full items-center'> 
    {!user?.email  && 
    <Button  
    className="bg-foreground hover:bg-secondary-foreground uppercase"
    onClick={() => {
        navigate(`/${authRouteName}`)
    }}
    >
      {authRouteName}
    </Button>}
     {user && "email" in user && 
        <div className='font-bold flex justify-between items-center'>
          <div className='text-secondary '>{user.email}</div>
          <div>
            <Button className='bg-red-500  bg-destructive hover:bg-secondary-foreground '
            onClick={logoutHandler}>
              logout
            </Button>
            </div>
        </div>
      }
           
    
  </nav>
  )
}

export default Navbar
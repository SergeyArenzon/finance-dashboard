
// import './App.css'
import { Route, Routes, useNavigate } from 'react-router-dom';
import {  SignupPage } from './pages/SignupPage';

import DashboardPage  from './pages/DashboardPage';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import {  fetchUser} from '@/redux/features/userSlice';
import { RootState } from '@/redux/store';
import { Button } from './components/ui/button';
import { useEffect } from 'react';
import { IUser } from './types/user.type';
import Navbar from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
function App() {
  const user: IUser | null = useAppSelector((state: RootState ) => state.user.value);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();


  useEffect(() => {
    const authUser = async() => {
      try {
        const fetchedUser = await dispatch(fetchUser())
      
        if(!fetchedUser.payload.email) throw Error("")
        
        navigate('/dashboard');
      } catch (error) {
        
        navigate('/login');
      }
    }

    authUser()
  }, [])
  



  console.log({user});
  

  return (
    <div className='h-screen p-2 flex flex-col gap-6'>
      <Navbar/>
      <main className='h-full'>
        <Routes>
          <Route path="/" element={<div>home</div>}></Route>
          <Route path="/dashboard" element={<DashboardPage/>}></Route>
          <Route path="/login" element={<LoginPage/>}></Route>
          <Route path="/signup" element={<SignupPage/>}></Route>
        </Routes>

      </main>
    </div>
  )
}

export default App

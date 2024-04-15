import { IUser } from "@/types/user.type"


const  VITE_BACKEND_URL = "http://localhost:5001"



export const loginApi = async(user: IUser) => {
    try {
        const response = await fetch(`${VITE_BACKEND_URL}/login`, {
            method: "POST", // *GET, POST, PUT, DELETE, etc.
            credentials: "include", // include, *same-origin, omit
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(user), // body data type must match "Content-Type" header
          });
        
        return response.json()
    } catch (error) {
        console.error(error)
    }

}
export const signupApi = async(user: IUser) => {
    try {
        const response = await fetch(`${VITE_BACKEND_URL}/signup`, {
            method: "POST", // *GET, POST, PUT, DELETE, etc.
            credentials: "include", // include, *same-origin, omit
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(user), // body data type must match "Content-Type" header
          });
        
        return response.json()
    } catch (error) {
        console.error(error)
    }

}
export const auth = async(user: IUser) => {
    try {
        const response = await fetch(`${VITE_BACKEND_URL}/auth`, {
            method: "POST", // *GET, POST, PUT, DELETE, etc.
            credentials: "include", // include, *same-origin, omit
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(user), // body data type must match "Content-Type" header
          });
        
        return response.json()
    } catch (error) {
        console.error(error)
    }

}
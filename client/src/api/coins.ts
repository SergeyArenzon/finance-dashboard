


const  VITE_BACKEND_URL = "http://localhost:5001"



export const coinsnApi = async(coins: string[]) => {
    try {
        const response = await fetch(`${VITE_BACKEND_URL}/coins`, {
            method: "POST", // *GET, POST, PUT, DELETE, etc.
            credentials: "include", // include, *same-origin, omit
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({coins}), // body data type must match "Content-Type" header
          });
        
        return response.json()
    } catch (error) {
        console.error(error)
    }

}


import React, {useEffect, useState, useRef} from 'react'
import io from 'socket.io-client';
import coins from './coins.json';
import Select from 'react-select'
import { coinsnApi } from '@/api/coins';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';
import { IUser } from '@/types/user.type';
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {  updateUserCoins} from '@/redux/features/userSlice';





const DashboardPage = () => {    
  const [coinsData, setCoinsData] = useState({last: null, current: null});
  const [marketCapData, setMarketCapData] = useState({last: null, current: null});
  const [followedCoins, setFollowedCoins] = useState([]);
  const socketRef = useRef(null)
  const [loader, setLoader] = useState(true);
  
  const user: IUser | null = useAppSelector((state: RootState ) => state.user.value);
  const dispatch = useAppDispatch();
  
  let socket_instance = null;

  useEffect(() => {
    if(user?.coins.length === 0 ) {
      setLoader(false);
      return

    }
    const socket = io('ws://localhost:8080', {
      withCredentials: true,
    });
    socketRef.current = socket;

    
  socket.on('connect', () => {
    console.log('Connected to server');
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  socket.on('message', (message) => {
    const currentCoinsData = {...message};

    setCoinsData((prevCoinsData) => ({last: prevCoinsData.current, current: currentCoinsData}));
    setMarketCapData((prevMarketCapData) => ({last: prevMarketCapData.current, current: currentCoinsData.market_cap}));
    setLoader(false)
  });

    return () => {
      socket.disconnect()
    }
 
  }, []); // Empty dependency array ensures the effect runs only once



  const addCoins = async(e) => {
    e.preventDefault();
    socketRef.current.disconnect()

    setLoader(true)
    const coins = followedCoins.map(c => c.value);
    const updatedUser = await dispatch(updateUserCoins(coins))

    setCoinsData({last: null, current: null})
    setLoader(false);
    socketRef.current.connect()
    
  }

  const handleChange = (selectedValues) => {
    setFollowedCoins(selectedValues);

  };



  console.log({coinsData, marketCapData});
  

  let updatedData = true;
  user?.coins?.forEach(coin => {
    if(!(coinsData?.current && coinsData?.current[coin])) updatedData = false;
    if(!(coinsData?.last && coinsData?.last[coin])) updatedData = false;
    if(!(marketCapData?.current && marketCapData?.current.find(mcd => mcd.symbol === coin))) updatedData =false
  })



  return (
    <div className=' flex flex-col gap-11 justify-center'>
  {user  &&  
  <form 
  onSubmit={addCoins}
  className='flex gap-3 items-center justify-center'
  >

      <Select 
      isMulti
      name="Coins"
      onChange={handleChange}
      defaultValue={user?.coins.map(key => ({value: key, label: `${key}, ${coins[key]}`}))}
      options={Object.keys(coins).map(key => ({value: key, label: `${key}, ${coins[key]}`}))} />


      <Button 
      type='submit'
      className='h-full'
      >Save coins</Button>
    </form>}


    {(loader || !updatedData) ? <div>Loading...</div> : 
    user?.coins.length > 0 && 
    coinsData.current && 
    updatedData &&

    <div className='flex gap-5 justify-center'>
      <div>

          <h1>Price</h1>
          <Table>
            <TableHeader>
              <TableRow className='bg-current'>
                <TableHead className="w-[100px]">Name</TableHead>
                <TableHead>Price</TableHead>
                {/* <TableHead>Method</TableHead>
                <TableHead className="text-right">Amount</TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody className='bg-secondary'>
              {user?.coins.map((coinCode) => {
                // debugger

                
                const currentPrice = coinsData?.current && coinsData?.current[coinCode]["USD"];
                const lastPrice = coinsData?.last && coinsData?.last[coinCode]["USD"];

                let cellColor = "";
                if( !lastPrice) cellColor = ""
                else if(currentPrice > lastPrice) cellColor = "bg-green-500";
                else if(currentPrice < lastPrice) cellColor = "bg-red-500"
                
                if(!currentPrice) null
                return (
                <TableRow key={coinCode}>
                  <TableCell className="font-medium">{coinCode}</TableCell>
                  <TableCell className={cellColor}>${currentPrice}</TableCell>
                  {/* <TableCell>{invoice.paymentMethod}</TableCell>
                  <TableCell className="text-right">{invoice.totalAmount}</TableCell> */}
                </TableRow>
              )}
              )}
            </TableBody>
            {/* <TableFooter>
              <TableRow>
                <TableCell colSpan={3}>Total</TableCell>
                <TableCell className="text-right">$2,500.00</TableCell>
              </TableRow>
            </TableFooter> */}
          </Table>
      </div>
      <div>

        <h1>Market Cap</h1>
        <Table>
        <TableHeader>
          <TableRow className='bg-current'>
            <TableHead className="w-[100px]">Name</TableHead>
            <TableHead>Rank</TableHead>
            <TableHead>Market Cap</TableHead>
            <TableHead>Volume(24h)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className='bg-secondary'>
          {user?.coins.map((coinCode) => {
            
            const mc = marketCapData?.current?.find(mc => mc.symbol === coinCode)
        
            return (
            <TableRow key={coinCode}>
              <TableCell className="font-medium">{coinCode}</TableCell>
              <TableCell >{mc.rank}</TableCell>
              <TableCell >${mc.market_cap}</TableCell>
              <TableCell >${mc.volume_24h}</TableCell>
  
            </TableRow>
          )}
          )}
        </TableBody>
        {/* <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Total</TableCell>
            <TableCell className="text-right">$2,500.00</TableCell>
          </TableRow>
        </TableFooter> */}
      </Table>
      </div>
    </div>
    
    
    }



  </div>
  )
}

export default DashboardPage

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EmailClient from './EmailSite';
import Login from './Login';

function Home () {


  const [auth, setAuth] = useState(false)
  const [email, setEmail] = useState("")

  axios.defaults.withCredentials = true

  useEffect(() =>{
    axios.get("https://localhost:5000/cookie")
    .then(res => {
      if(res.data.Status === "Success"){
        setAuth(true)
        setEmail(res.data.email)
        
      }else{
        setAuth(false)
        setEmail("Gosc")
      }
    })
  })


  return (
    <div>
      {
        auth ?
        <div>
          <EmailClient />
          


        </div>
        :
        <div>
          <Login />
        </div>  
      }
    </div>
    
    
  );
}

export default Home;

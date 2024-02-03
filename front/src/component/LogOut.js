import React from 'react'
import axios from 'axios'
import {Link} from 'react-router-dom';

function LogOut() {

const handleDelete = () => {
    axios.get("https://localhost:5000/logout")
    .then(res =>{
        window.location.reload(true)
    })
    .catch(err => console.log(err))
}
  return (

    <Link class='links' style = {styles.logOutlink} onClick={handleDelete}>Wyloguj się</Link>
  )
}
const styles = {
  logOutlink: {
    display: 'block',
    marginTop: '10px',
    textAlign: 'center',
    color: '#3da0a7',
    textDecoration: 'none',
    fontSize: '16px',
    transition: 'color 0.2s ease-in-out',
  },
};

export default LogOut

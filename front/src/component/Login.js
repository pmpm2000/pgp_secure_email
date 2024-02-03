import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Validation from './LoginValidation';
import axios from 'axios';


function Login() {
    const [errors, setErrors] = useState('')
    const navigate = useNavigate()

    axios.defaults.withCredentials = true


    const [values, setValues] = useState({
        email: '',
        password: ''
    })
    const handleInput = (event => {
        setValues(prev => ({...prev, [event.target.name]: event.target.value}))
    })
    const handleSubmit =(event) => {
        event.preventDefault()
        const err = Validation(values); setErrors(err);
        if(err.email === "" && err.password === "") {
            axios.post('https://localhost:5000/login', values)
            .then(res => {
                
                    if(res.data.result.success === true) {
                        navigate('/');
                        window.location.reload(true)
                    } else {
                         alert(res.data.result.message);
                        }
                    
                })
                .catch(err => console.log(err));
            }
          }


  return (
    <div style={styles.container}>
      <div style={styles.loginForm}>
        <h1 style={styles.heading}>Zaloguj się</h1>
        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label htmlFor='email' style={styles.label}>
              Email
            </label>
            <input
              type='email'
              placeholder='Email'
              name='email'
              onChange={handleInput}
              style={styles.input}
            />
            {errors.email && <span className='text-danger'> {errors.email}</span>}
          </div>
          <div style={styles.inputGroup}>
            <label htmlFor='password' style={styles.label}>
              Hasło
            </label>
            <input
              type='password'
              placeholder='Hasło'
              name='password'
              onChange={handleInput}
              style={styles.input}
            />
            {errors.password && <span className='text-danger'> {errors.password}</span>}
          </div>
          <button type='submit' style={styles.button}>
            <strong>Zaloguj się</strong>
          </button>
          <Link to='/rejestracja' style={styles.createAccountLink}>
            Utwórz konto
          </Link>
        </form>
      </div>
    </div>

  )


}
const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
    },
    loginForm: {
      backgroundColor: '#f2f2f2',
      padding: '20px',
      borderRadius: '5px',
      boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
      width: '400px',
    },
    heading: {
      textAlign: 'center',
      marginBottom: '20px',
    },
    inputGroup: {
      marginBottom: '20px',
    },
    label: {
      display: 'block',
      marginBottom: '5px',
    },
    input: {
      width: '100%',
      padding: '8px',
      borderRadius: '4px',
      border: '1px solid #ccc',
    },
    checkbox: {
      marginLeft: '5px',
    },
    button: {
      width: '100%',
      padding: '10px',
      borderRadius: '4px',
      border: 'none',
      backgroundColor: 'dodgerblue',
      boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.3)',
      color: 'white',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
    },
    createAccountLink: {
      display: 'block',
      marginTop: '10px',
      textAlign: 'center',
      color: '#3da0a7',
      textDecoration: 'none',
      fontSize: '16px',
      transition: 'color 0.2s ease-in-out',
    },
  };
  
export default Login;


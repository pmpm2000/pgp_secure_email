import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Validation from './EmailValidation';
import axios from 'axios';
import Login from './Login';

function NewEmail() {


    const [auth, setAuth] = useState(false)
    const [email, setEmail] = useState("")
    const [values, setValues] = useState({
        emailsrc: email,
        emailrcv: '',
        body: '',
      });
  
    axios.defaults.withCredentials = true
  
    useEffect(() =>{
      axios.get("https://localhost:5000/cookie")
      .then(res => {
        if(res.data.Status === "Success"){
          setAuth(true)
          setEmail(res.data.email)
          setValues({
            emailsrc: res.data.email
          });
  
          
        }else{
          setAuth(false)
          setEmail("")
        }
      })
    }, [])
  const navigate = useNavigate();
  const [errors, setErrors] = useState('');
  

  

  const handleInput = (event) => {
    if (event.key === 'Enter' && !event.shiftKey && event.target.tagName !== 'TEXTAREA') {
      event.preventDefault();
    } else {
      setValues((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    }
  };

  const handleSubmit = (event) => {
    
    event.preventDefault();
    const err = Validation(values);

    console.log(err)
    setErrors(err);
    if (
      err.emailrcv === '' &&
      err.body === ''
    ) {
      axios
        .post('https://localhost:5000/sendemail', values)
        .then((res) => {
                console.log(res);
            
                if(res.data.success === true) {
                    navigate('/');
                } else {
                     alert(res.data.message);
                }

                }
            )
        .catch((err) => console.log(err));
    }
  };

  return (
    <div>
      {
        auth ?
        <div>
          <div style={styles.container}>
      <div style={styles.signupForm}>
        <h1 style={styles.heading}>Nowa wiadomość</h1>
        <form onSubmit={handleSubmit}>
            <div style={styles.inputGroup}>
            <label htmlFor='emailsrc' style={styles.label}>
                Email źródłowy:
            </label>
            <input
                type='email'
                name='emailsrc'
                value={email}
                readOnly
                style={styles.input}
                onChange={handleInput}
            />
            </div>
          
          <div style={styles.inputGroup}>
            <label htmlFor='emailrcv' style={styles.label}>
              Email docelowy:
            </label>
            <input
              type='email'
              placeholder='Do:'
              name='emailrcv'
              onChange={handleInput}
              style={styles.input}
            />
            {errors.email && <span style={styles.error}> {errors.email}</span>}
          </div>
          <div style={styles.inputGroup}>
            <label htmlFor='body' style={styles.label}>
              Wiadomość:
            </label>
            <textarea
              placeholder='Treść'
              name='body'
              onKeyDown={handleInput}
              onChange={handleInput}
              style={styles.input}
            />
            {errors.password && (
              <span style={styles.error}> {errors.password}</span>
            )}
          </div>
          <button type='submit' style={styles.button}>
            <strong>Wyślij</strong>
          </button>
          <Link to='/' style={styles.loginLink}>
            Powrót
          </Link>
        </form>
      </div>
    </div>
          


        </div>
        :
        <div>
          <Login />
        </div>  
      }
    </div>
    
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  },
  signupForm: {
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
  button: {
    display: 'block',
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: 'none',
    background: 'linear-gradient(to right, #3da0a7, #00d2d3)',
    color: 'white',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px',
    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.3)',
    transition: 'transform 0.2s ease-in-out',
  },
  loginLink: {
    display: 'block',
    marginTop: '10px',
    textAlign: 'center',
    color: '#3da0a7',
    textDecoration: 'none',
    fontSize: '16px',
    transition: 'color 0.2s ease-in-out',
  },
  error:{
    color: 'red',
  }
};
export default NewEmail;


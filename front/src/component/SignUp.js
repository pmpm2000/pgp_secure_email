import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Validation from './SignUpValidation';
import axios from 'axios';

function SignUp() {
  const navigate = useNavigate();
  const [errors, setErrors] = useState('');
  const [values, setValues] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  

  const handleInput = (event) => {
    setValues((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const err = Validation(values);
    setErrors(err);
    if (
      err.email === '' &&
      err.password === '' &&
      err.confirmpassword === ''
    ) {
      axios
        .post('https://localhost:5000/rejestracja', values)
        .then((res) => {
                console.log(res);
            
                if(res.data.success === true) {
                    navigate('/login');
                } else {
                     alert(res.data.message);
                }

                }
            )
        .catch((err) => console.log(err));
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.signupForm}>
        <h1 style={styles.heading}>Zarejestruj się</h1>
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
            {errors.email && <span style={styles.error}> {errors.email}</span>}
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
            {errors.password && (
              <span style={styles.error}> {errors.password}</span>
            )}
          </div>
          <div style={styles.inputGroup}>
            <label htmlFor='confirmPassword' style={styles.label}>
              Powtórz hasło
            </label>
            <input
              type='password'
              placeholder='Powtórz hasło'
              name='confirmPassword'
              onChange={handleInput}
              style={styles.input}
            />
            {errors.confirmpassword && (
              <span style={styles.error}> {errors.confirmpassword}</span>
            )}
          </div>
          <button type='submit' style={styles.button}>
            <strong>Zarejestruj</strong>
          </button>
          <Link to='/login' style={styles.loginLink}>
            Zaloguj się
          </Link>
        </form>
      </div>
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
    background: 'dodgerblue',
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
export default SignUp;


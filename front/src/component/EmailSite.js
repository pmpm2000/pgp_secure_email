import React, { useState, useEffect } from 'react';
import LogOut from './LogOut';
import axios from 'axios';

const EmailClient = () => {


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
  },[])
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');



  useEffect(() => {
    const fetchEmails = async () => {
      axios.post(`https://localhost:5000/${selectedCategory}`, {email})
      .then(res => {
        const fetchedEmails = res.data.data;
        if (fetchedEmails === 'undefined'){
          setEmails(fetchedEmails)
        } else{
          const sortedEmails = fetchedEmails.sort((a, b) => b.idemails - a.idemails);
          setEmails(sortedEmails);

        }
        
        
    })
    .catch(err => console.log(err));
      
    };

    fetchEmails();
  }, [selectedCategory]);

  const handleEmailClick = (email) => {
    setSelectedEmail(email);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSelectedEmail(null);
  };

  const formatEmailTime = (timeString) => {
    const date = new Date(timeString);
    const formattedDate = date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    });
    return formattedDate;
  };

  return (

    <div style={styles.container}>
      <div style={styles.header}>
      <h1>Witaj {email}</h1> <div style={styles.logoutContainer}>
          <LogOut />
        </div>
      </div>
      <div style={styles.header}>
        <div style={styles.categoryButtons}>
          <button style={styles.categoryButton} onClick={() => handleCategoryChange('inbox')}>Odebrane</button>
          <button style={{ ...styles.categoryButton, ...styles.categoryButtonHover }} onClick={() => handleCategoryChange('sent')}>Wysłane</button>
        </div>
        <button style={styles.button} onClick={() => window.location.href = 'https://localhost:3000/nowy'}>
          Nowy Email
        </button>
      </div>
        
      {(selectedCategory === '') ? (<div></div>) : (<div style={styles.contentContainer}>
          <div style={styles.emailList}>
            {(selectedCategory === 'inbox') ? (<h2 style={styles.emailListHeading}> Odebrane</h2>) : (<h2 style={styles.emailListHeading}> Wysłane</h2>)}
            <ul style={styles.emailListUl}>
              {(typeof emails === 'undefined' || !Array.isArray(emails)) ? (
                <p>Ładowanie...</p>
              ) : (
                emails.map(email => (
                  <li key={email.idemails} style={styles.emailListItem} onClick={() => handleEmailClick(email)}>
                    {formatEmailTime(email.time)} {(selectedCategory === 'inbox') ? (<div>{email.email_src}</div>) : (<div>{email.email_rcv}</div>)}
                  </li>
                ))
              )}
            </ul>
          </div>

          <div style={styles.emailDetails}>
            <h2 style={styles.emailDetailsHeading}>Szczegóły</h2>
            {selectedEmail ? (
              <div>
                <h3 style={styles.emailDetailsH3}>OD: {selectedEmail.email_src}</h3>
                <h3 style={styles.emailDetailsH3}>DO: {selectedEmail.email_rcv}</h3>
                <p>{selectedEmail.body}</p>
              </div>
            ) : (
              <p>Wybierz email, aby wyświetlić szczegóły.</p>
            )}
          </div>
        </div>)}

      </div>

  );
};
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '80%', 
    marginBottom: '20px',
  },
  categoryButtons: {
    display: 'flex',
    justifyContent: 'flex-start', // Align buttons to the left
  },
  categoryButton: {
    padding: '10px 15px',
    fontSize: '16px',
    cursor: 'pointer',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    outline: 'none',
  },
  categoryButtonHover: {
    backgroundColor: '#0056b3',
  },
  button: {
    padding: '10px 15px',
    fontSize: '16px',
    cursor: 'pointer',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    outline: 'none',
    textDecoration: 'none',
  },
  contentContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '80%',
  },
  emailList: {
    width: '40%', 
    paddingRight: '20px',
  },
  emailListHeading: {
    marginBottom: '10px',
    fontSize: '18px',
  },
  emailListUl: {
    listStyle: 'none',
    padding: '0',
    margin: '0',
  },
  emailListItem: {
    padding: '10px',
    cursor: 'pointer',
    borderBottom: '1px solid #ddd',
  },
  emailListItemHover: {
    backgroundColor: '#f5f5f5',
  },
  emailDetails: {
    width: '58%',
  },
  emailDetailsHeading: {
    marginBottom: '10px',
    fontSize: '18px',
  },
  emailDetailsH3: {
    marginBottom: '10px',
    fontSize: '16px',
  },
  logoutContainer: {
    clear: 'both',
    marginBottom: '20px',
  },
  link: {
    textDecoration: 'none',
    color: '#007bff',
    display: 'block',
    marginBottom: '20px',
  },
};


export default EmailClient;

const express = require('express')
var fs = require('fs');
const cors = require('cors')
var https = require('https');
const openpgp = require('openpgp'); 
const crypto = require('crypto');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

require('dotenv').config();
var privateKey  = fs.readFileSync('sslcert/key.pem', 'utf8');
var certificate = fs.readFileSync('sslcert/cert.pem', 'utf8');
var credentials = {key: privateKey, cert: certificate};

const app = express()
app.use(cookieParser())

app.use(cors({
    origin: ["https://localhost:3000"],
    methods: ["POST", "GET"],
    credentials: true
}))


const db = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

const pool = mysql.createPool({
  ...db,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

function executeQuery(query, values) {
  return new Promise((resolve, reject) => {
      pool.query(query, values, (err, results) => {
          if (err) {
              reject(err);
          } else {
              resolve(results);
          }
      });
  });
}

async function decryptEmail(encryptedKey, encryptedMessage, sender, email, password) {
  try {
    const message = await openpgp.readMessage({
      armoredMessage: encryptedKey,
    });

    const privateKeyReceiver = await getPrivateKeyByEmail(email);
    const publicKeySender = await getPublicKeyByEmail(sender);

    const { data: decryptedKey, signatures } = await openpgp.decrypt({
      message,
      decryptionKeys: await openpgp.decryptKey({ privateKey: privateKeyReceiver, passphrase: password }),
      verificationKeys: publicKeySender,
    });

    const { data: decryptedMess, signs } = await openpgp.decrypt({
      message: await openpgp.readMessage({ armoredMessage: encryptedMessage }),
      passwords: decryptedKey,
    });

    await signatures[0].verified; // throws on invalid signature
    //console.log('Signature is valid');

    return {success: true, message: decryptedMess };
  } catch (error) {
    console.error('Error decrypting email:', error);
    return { success: false, error: error.message };
  }
}
function random128() {
  var result = "";
  for (var i = 0; i < 8; i++)
    result += String.fromCharCode(Math.random() * 0x10000);
  return result;
}


async function encryptEmail(plaintext, recv, email, passwd) {
  try {
    const shortKey = random128();

    const encryptedMessage = await openpgp.encrypt({
      message: await openpgp.createMessage({ text: plaintext }),
      passwords: shortKey,
    });

    const publicKeyRecv = await getPublicKeyByEmail(recv);
    const privateKeySender = await getPrivateKeyByEmail(email);

    const encrypted = await openpgp.encrypt({
      message: await openpgp.createMessage({ text: shortKey }),
      encryptionKeys: publicKeyRecv,
      signingKeys: await openpgp.decryptKey({ privateKey: privateKeySender, passphrase: passwd }),
    });

    return {
      success: true,
      key: encrypted,
      message: encryptedMessage,
    };
  } catch (error) {
    console.error('Error encrypting email:', error);
    return { success: false, error: error.message };
  }
}

async function addUser(email, password) {
  const hash = crypto.createHash('sha256').update(password).digest('hex');
  const insertQuery = 'INSERT INTO users (email, public_key, private_key, password) VALUES (?, ?, ?, ?)';
console.log("Generating keys for " + email) //generacja kluczy przy rejestracji
const keys = await openpgp.generateKey({
  userIDs: [{ email }],
  type: 'rsa',
  passphrase: password
});
  try {
      await executeQuery(insertQuery, [email, keys.publicKey, keys.privateKey, hash]);
      return { success: true, message: 'Zarejestrowano' };
  } catch (err) {
    if (err.message.includes('Duplicate entry')) {
      return { success: false, message: 'Użytkownik o podanym adresie email już istnieje', error: err.message };
    } else {
      return { success: false, message: 'Problem z rejestracją użytkownika', error: err.message };
    }
  }
}

async function checkEmail(email) {
  const checkEmailQuery = 'SELECT COUNT(*) as count FROM users WHERE email = ?';

  try {
      const result = await executeQuery(checkEmailQuery, [email]);
      const count = result[0].count;

      return count > 0;
  } catch (err) {
      console.error('Error checking email:', err);
      return false;
  }
}

async function getPublicKeyByEmail(email) {
  const getPublicKeyQuery = 'SELECT public_key FROM users WHERE email = ?';

  try {
      const result = await executeQuery(getPublicKeyQuery, [email]);

      if (result.length > 0) {
          return await openpgp.readKey({ armoredKey: result[0].public_key });
      } else {
          console.log(`Public key not found for email: ${email}`);
          return null;
      }
  } catch (err) {
      console.error('Error getting public key:', err);
      return null;
  }
}

async function getPrivateKeyByEmail(email) {
  const getPublicKeyQuery = 'SELECT private_key FROM users WHERE email = ?';

  try {
      const result = await executeQuery(getPublicKeyQuery, [email]);
      if (result.length > 0) {
          return await openpgp.readKey({ armoredKey: result[0].private_key });
      } else {
          console.log(`Private key not found for email: ${email}`);
          return null;
      }
  } catch (err) {
      console.error('Error getting private key:', err);
      return null;
  }
}



async function getInboxEmails(email) {
  const getInboxQuery = 'SELECT * FROM emails WHERE email_rcv = ?';
  

  try {
    const inboxEmails = await executeQuery(getInboxQuery, [email]);

    if(inboxEmails.length >0){
      return { success: true, data: inboxEmails}; 
    } else {
      return { success: false, message: 'Nie znaleziono widomości email', data: inboxEmails}; 
    }
  } catch (error) {
    
    return { success: false, message: 'Wystąpił problem'}; 
  }
}

async function getSentEmails(email) {
  const getSentQuery = 'SELECT * FROM emails WHERE email_src = ?';

  try {
    const sentEmails = await executeQuery(getSentQuery, [email]);

    if(sentEmails.length >0){
      return { success: true, data: sentEmails}; 
    } else {
      return { success: false, message: 'Nie znaleziono widomości email', data: inboxEmails}; 
    }
  } catch (error) {
    
    return { success: false, message: 'Wystąpił problem'}; 
  }
}
async function addEmail(emailSrc, emailDst, body, hashKey) {
  const insertQuery = 'INSERT INTO emails (email_src, email_rcv, body, hash_key) VALUES (?, ?, ?, ?)';
  try {
    await executeQuery(insertQuery, [emailSrc, emailDst, body, hashKey]);
    return { success: true, message: 'Email sent successfully' };
  } catch (err) {
    return { success: false, message: 'Problem sending email', error: err.message };
  }
}

async function login(email, password) {
  const getData = 'SELECT id_user, password FROM users WHERE email = ?';
  const hash = crypto.createHash('sha256').update(password).digest('hex');

  try {
      const result = await executeQuery(getData, [email]);

      if (result.length > 0) {
          const storedHash = result[0].password;
          if (storedHash === hash) {
            return { success: true, message: 'Zalogowano', data: result };
          } else {
            return { success: false, message: 'Nieprawidłowe hasło', data: result };
          }

          
          
      } else {
          return {success: false, message: `Nie znaleziono użytkownika  ${email}`}
          
      }
  } catch (err) {
      return {success: false, message: 'Błąd podczas logowania'}
  }
}


app.use(express.json())
app.get("/api", (req,res) => {
    //res.setHeader("Access-Control-Allow-Origin", "*");
    res.json({ "users": ["userOne", "userTwo", "userThree", ":)"]})
})

app.get("/emails", (req,res) => {
    //res.setHeader("Access-Control-Allow-Origin", "*");
    res.json({
        "emails": [
          {"id": 1, "subject": "userOne", "body": "7u6gaslfy"},
          {"id": 2, "subject": "userTwo", "body": "9s8df3hj2"},
          {"id": 3, "subject": "userThree", "body": "2k1lmn4op"}
        ]
      });})


app.post('/rejestracja',async (req, res) => {
  
    const result = await addUser(req.body.email, req.body.password);
    
    res.json(result); 
    
  

});
const verifyUser = (req, res, next) => {
  const token = req.cookies.user
  if(!token) {
      return res.json({Error: "You are not logged in"})
  }else{
      jwt.verify(token, "jwtKey", (err, decoded) =>{
          if(err) {
              return res.json("Token is wrong")
          }else{
              req.user_id = decoded.id
              req.email = decoded.email
              req.password = decoded.pass
              next()
          }

      })
  }
}

app.get("/cookie",verifyUser, (req,res) => {
  return res.json({Status: "Success",user_id: req.user_id, email: req.email})

})


app.post('/login',async (req, res) => {
  const result = await login(req.body.email, req.body.password);
  if (result.success) {
    
    const id = result.data[0].id_user
    const email = req.body.email
    const pass = req.body.password
    const token = jwt.sign({id, email, pass}, "jwtKey", {expiresIn: 3000});
    res.cookie('user', token)
    res.json({result, token});
  } else {
    res.json({ result, token: "" }); 
  }


});

app.get("/logout", (req, res) => {
  res.clearCookie("user")
  return res.json({Status: "Success"})
})

app.post('/inbox', verifyUser, async (req, res) => {
  const userPassword = req.password;
  const result = await getInboxEmails(req.body.email);
  if  (result.success) {
    for (let i = 0; i < result.data.length; i++) {
      const decrypmail = await decryptEmail(result.data[i].hash_key, result.data[i].body, result.data[i].email_src, result.data[i].email_rcv, userPassword)
      
      if (decrypmail.success){
        result.data[i].body = decrypmail.message

      }
      
  
    }
  }
  //console.log(result)
  res.json(result)
})

app.post('/sent', async (req, res) => { 

  const result = await getSentEmails(req.body.email);
  res.json(result)
})

app.post('/sendemail', verifyUser, async (req, res) => {

  const userPassword = req.password;
  const crypt = await encryptEmail(req.body.body, req.body.emailrcv, req.body.emailsrc, userPassword);
  if (crypt.success){
    const result = await addEmail(req.body.emailsrc, req.body.emailrcv, crypt.message, crypt.key);
    res.json(result)
  }else{
  res.json(crypt)
  }
}) 


      
var httpsServer = https.createServer(credentials, app);
httpsServer.listen(5000, () => {console.log("Server started on port 5000")}) 
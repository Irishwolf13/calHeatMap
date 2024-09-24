import React, { useState } from 'react';
import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonInput, IonItem, IonLabel, IonButton, IonLoading, IonFooter } from '@ionic/react';
import './Login.css';
import MainMenu from '../../components/MainMenu/MainMenu';
import { auth } from '../../firebase/config';
import { signInWithEmailAndPassword } from "firebase/auth";
import { useHistory } from 'react-router-dom';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const history = useHistory();
  
    const handleLogin = async () => {
      setLoading(true);
      try {
        await signInWithEmailAndPassword(auth, email, password);
        history.push('/home');
  
      } catch (error: any) {
        setError('Email or password incorrect');
      }
      setLoading(false);
    };
  
    // Handle key down event on password field
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleLogin();
      }
    };
  
    return (
      <>
        <MainMenu />
        <IonPage id="main-content">

          <IonContent className="ion-padding">
            <h1 className='loginTitle'>Paint Kit Login</h1>
            <div className='loginMainContainer'>
              <IonInput
                type="email"
                value={email}
                label="Email" 
                labelPlacement="stacked" 
                fill="outline" 
                placeholder="Enter email address"
                onIonInput={(e) => setEmail(e.detail.value!)}
              ></IonInput>
              <br />
              <IonInput
                type="password"
                value={password}
                label="Password" 
                labelPlacement="stacked" 
                fill="outline"
                placeholder="Enter Password"
                onIonInput={(e) => setPassword(e.detail.value!)}
                onKeyDown={handleKeyDown}
              ></IonInput>
              <br />
            <IonButton expand="block" onClick={handleLogin}>
              Login
            </IonButton>
              <IonLoading isOpen={loading} message={'Logging in...'} />
              {error && <p style={{ color: 'red' }}>{error}</p>}
            </div>
          </IonContent>
          {/* <IonFooter>
          <IonToolbar>            
          </IonToolbar>
        </IonFooter> */}
        </IonPage>
      </>
    );
  };
  
  export default Login;
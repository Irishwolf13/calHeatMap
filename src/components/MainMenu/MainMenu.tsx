import { IonButton, IonButtons, IonContent, IonHeader, IonMenu, IonMenuButton, IonMenuToggle, IonTitle, IonToolbar } from "@ionic/react";
import { useHistory } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useRef } from 'react';
import './MainMenu.css'

const MainMenu: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const history = useHistory();
  const menuRef = useRef<HTMLIonMenuElement | null>(null); 

  const handleLogout = async () => {
    try {
      if (menuRef.current) { await menuRef.current.close(); }
      await logout();
      history.push('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <IonMenu ref={menuRef} side="start" contentId="main-content" swipeGesture={false}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Main Menu</IonTitle>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonMenuToggle>
          {currentUser ? (
            <div className="menuButtonHolder">
              <IonButton onClick={() => history.push('/')}>Home</IonButton>
              <IonButton onClick={() => history.push('/createJob')}>Create New Job</IonButton>
              <IonButton className='menuBottomButton' color="danger" onClick={handleLogout}>Logout</IonButton>
            </div>
          ) : (
            <IonButton onClick={() => history.push('/login')}>Login</IonButton>
          )}
        </IonMenuToggle>
      </IonContent>
    </IonMenu>
  );
};

export default MainMenu;

import { IonButton, IonButtons, IonContent, IonFooter, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import './Home.css';
import MainMenu from '../../components/MainMenu/MainMenu';
import { useHistory } from 'react-router-dom';


const Home: React.FC = () => {
  const history = useHistory();

  return (
    <> 
      <MainMenu />
      <IonPage id="main-content">
        <IonHeader>
          <IonToolbar>
            <IonTitle>Home</IonTitle>
            <IonButtons slot="start">
              <IonMenuButton></IonMenuButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
        </IonContent>
        {/* <IonFooter>
          <IonToolbar>
            <IonButton onClick={() => history.push('/cal')}>Calendar</IonButton>
          </IonToolbar>
        </IonFooter> */}
      </IonPage>
    </>
  );
};

export default Home;

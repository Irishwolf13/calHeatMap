import React, { useRef } from 'react';
import MainMenu from '../../components/MainMenu/MainMenu';
import { IonBackButton, IonButton, IonButtons, IonContent, IonFooter, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../Store/store';
import './PrintJob.css';
import { Job } from '../../interfaces/interface';

const PrintJob: React.FC = () => {
  const currentJob = useSelector((state: RootState) => state.currentJob.currentJob);
  const componentRef = useRef<HTMLDivElement>(null);
  const history = useHistory();

  const handlePrint = () => {
    if (componentRef.current) {
      const printContents = componentRef.current.innerHTML;
      const printWindow = window.open('', '', 'height=600,width=800');

      if (printWindow) {
        printWindow.document.write(`
          <html>
            <body>
              ${printContents}
            </body>
          </html>
        `);

        printWindow.document.close();

        // Wait for images to load before printing
        const images = printWindow.document.images;
        let loadedImages = 0;

        const onImageLoad = () => {
          loadedImages++;
          if (loadedImages === images.length) {
            setTimeout(() => {
              printWindow.print();
              printWindow.focus();
            }, 500); // slight delay
          }
        };

        if (images.length === 0) {
          setTimeout(() => {
            printWindow.print();
            printWindow.focus();
          }, 500); // slight delay
        } else {
          for (let i = 0; i < images.length; i++) {
            images[i].addEventListener('load', onImageLoad);
            images[i].addEventListener('error', onImageLoad);
          }
        }

        // Close the window after printing
        printWindow.onbeforeunload = () => {
          printWindow.close();
        };
        
        printWindow.onafterprint = () => {
        //   onAfterPrint();
          printWindow.close();
        };
      }
    }
  };

  //  const onAfterPrint = () => {};

  const renderDate = (job: Job) => {
    if (!job.date) return;
    const formattedDate = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short'
    }).format(new Date(job.date));
  
    return (
        <p>{`${formattedDate}`}</p>
    );
  };

  const renderNotes = (job: Job) => {
    if (!job.notes) return null;
    
    return (
      <div>
        {job.notes.map((noteObj, index) => (
          <div key={index}>
            <p>NOTES:</p>
            {noteObj.note}
          </div>
        ))}
      </div>
    );
  };

  const renderPaintColors = (job: Job) => {
    if (!job.paintColors) return null;
    
    return (
      <div>
        {job.paintColors.map((noteObj, index) => (
          <div key={index}>
            {noteObj.brand}
            {noteObj.color}
            {noteObj.finish}
            {noteObj.line}
            {noteObj.type}
            {noteObj.orderForm}
          </div>
        ))}
      </div>
    );
  };

  const renderImages = (job: Job) => {
    if (!job.images) return null;
    
    return (
      <div>
        {job.images.map((noteObj, index) => (
          <img
            key={index}
            style={{ 
              width: '150px',
              height: '150px',
              objectFit: 'contain',
              objectPosition: 'center',
            }} 
            src={noteObj.url} 
            alt={`uploaded-${index}`}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <MainMenu />
      <IonPage id="main-content">
        <IonHeader>
          <IonToolbar>
            <IonTitle>Print Page</IonTitle>
            <IonButtons slot="start">
              <IonBackButton></IonBackButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div style={{ overflowX: 'auto' }}>
            {/* Only this div will be printed */}
            <div 
                ref={componentRef}
                style={{ 
                    width: '8.5in', 
                    height: '11in',
                    position: 'relative',
                    border: '1px solid black',
                }} 
                >
                <p>{`Job Name: ${currentJob?.name}`}</p>
                <p>{`Job# ${currentJob?.number}`}</p>
                {currentJob && <div>{renderDate(currentJob)}</div>}
                {currentJob && <div>{renderNotes(currentJob)}</div>}
                <div>Paint Colors:</div>
                {currentJob && <div>{renderPaintColors(currentJob)}</div>}
                <div style={{display: 'flex'}}>
                    {currentJob && <div>{renderImages(currentJob)}</div>}
                </div>
            </div>
          </div>
        </IonContent>
        <IonFooter>
          <IonToolbar>
            <button onClick={handlePrint}>Print Now</button>
            <IonButton onClick={() => console.log('/createJob')}>Create New Job</IonButton>
          </IonToolbar>
        </IonFooter>
      </IonPage>
    </>
  );
};

export default PrintJob;
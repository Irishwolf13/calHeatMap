import { InputChangeEventDetail, IonBackButton, IonButton, IonButtons, IonContent, IonDatetime, IonDatetimeButton, IonFooter, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonMenuButton, IonModal, IonPage, IonTextarea, IonTitle, IonToast, IonToolbar } from '@ionic/react';
import MainMenu from '../../components/MainMenu/MainMenu';
import { useEffect, useState } from 'react';
import { closeCircleOutline } from 'ionicons/icons';
import { checkIfJobNumberExistsInDatabase, createJob, uploadImageForJob } from '../../firebase/controller';
import { Job } from '../../interfaces/interface'
import './CreateJob.css'
import { useHistory } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const CreateJob: React.FC = () => {
  const [newJob, setNewJob] = useState<Job>({
    notes: [{ id: 1, note: '' }],
    paintColors: [{ id: 1, color: '', brand: '', line: '', finish: '', type: '', orderForm: ''}]
  });
  const myColorInfo = [ 'color', 'brand','line','finish','type', 'orderForm']

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [uploadVisible, setUploadVisible] = useState<boolean>(false);

  const { currentUser } = useAuth();
  const history = useHistory();

  const handleNameChanged = (event: CustomEvent<InputChangeEventDetail>) => {
    setNewJob({ ...newJob, name: event.detail.value ?? '' });
  };
  const handleNumberChange = (event: CustomEvent<InputChangeEventDetail>) => {
    const numValue = event.detail.value ? parseFloat(event.detail.value) : undefined;
    setNewJob({ ...newJob, number: numValue });
  };
  const handleDateChanged = (event: CustomEvent<InputChangeEventDetail>) => {
    setNewJob({ ...newJob, date: event.detail.value ?? '' });
  };

  const handleAddImages = (urls: string[]) => {
    setNewJob(prevNewJob => {
      const currentImages = prevNewJob.images || [];
      const newImages = urls.map(url => ({ url }));
      return { ...prevNewJob, images: [...currentImages, ...newImages] };
    });
  };

  const handleRemoveImage = (index: number) => {
    const filteredImages = newJob.images?.filter((_, imgIndex) => imgIndex !== index) || [];
    setNewJob({ ...newJob, images: filteredImages });
  };

  //////////////////////////// HANDLE NOTES //////////////////////////// 
  const handleAddNote = () => {
    const newId = newJob.notes && newJob.notes.length > 0 
                  ? newJob.notes[newJob.notes.length - 1].id + 1
                  : 1;
    const newNote = { id: newId, note: '' };
    setNewJob({ ...newJob, notes: [...(newJob.notes || []), newNote] });
  };
  const handleRemoveNote = (myId: number) => {
    const filteredNotes = newJob.notes?.filter(note => note.id !== myId) || [];
    setNewJob({ ...newJob, notes: filteredNotes });
  };
  const handleNoteChange = (event: CustomEvent<InputChangeEventDetail>, myId: number) => {
    if (newJob.notes) {
      const updatedNotes = newJob.notes.map(note =>
        note.id === myId ? { ...note, note: event.detail.value ?? '' } : note
      );
      setNewJob({ ...newJob, notes: updatedNotes });
    }
  };

  //////////////////////////// HANDLE PAINT COLORS //////////////////////////// 
  const handleAddPaintColor = () => {
    const newId = newJob.paintColors && newJob.paintColors.length > 0 
                  ? newJob.paintColors[newJob.paintColors.length - 1].id + 1
                  : 1;
    const newPaintColor = { id: newId, color: '', brand: '', line: '', finish: '', type: '', orderForm: '' };
    setNewJob({ ...newJob, paintColors: [...(newJob.paintColors || []), newPaintColor] });
  };
  const handleRemovePaintColor = (myId: number) => {
    const filteredPaintColors = newJob.paintColors?.filter(paintColor => paintColor.id !== myId) || [];
    setNewJob({ ...newJob, paintColors: filteredPaintColors });
  };
  const handlePaintColorChange = (event: CustomEvent<InputChangeEventDetail>, myId: number, myValue: string) => {
    if (newJob.paintColors) {
      const updatedPaintColors = newJob.paintColors.map(paintColor =>
        paintColor.id === myId ? { ...paintColor, [myValue]: event.detail.value ?? '' } : paintColor
      );
      setNewJob({ ...newJob, paintColors: updatedPaintColors });
    }
  };
      
  //////////////////////////// DISPLAYS //////////////////////////// 
  const displayNotes = () => {
    return newJob.notes?.map(note => (
      <div className='paintContainer' key={note.id}>
      <IonList>
        <div className='flex'>
          <IonIcon className='removeMe' onClick={() => handleRemoveNote(note.id)} slot="end" icon={closeCircleOutline} size="small"></IonIcon>
        </div>
        <IonTextarea
          class='paddingLeft'
          placeholder='Enter Note Here'
          onIonInput={(e) => handleNoteChange(e, note.id)}
          autoGrow={true}
        ></IonTextarea >
      </IonList>
      </div>
    )) || [];
  };

  const displayPaintColors = () => {
    // Define a mapping for colorAttribute to custom labels
    const labelMapping: { [key: string]: string } = {
      color: 'Pantone Color',
      brand: 'Sherwin, Ben Moore, etc.',
      line: 'Emerald, Regal Select, etc.',
      finish: 'Eggshell, Satin, etc.',
      type: 'Indoor, Outdoor, etc.',
      orderForm: 'www.sherwin-williams.com'
    };
  
    return newJob.paintColors?.map(paintColor => (
      <div className='paintContainer' key={paintColor.id}>
        {myColorInfo.map((colorAttribute) => (
          <IonInput
            class='customBox'
            key={colorAttribute}
            label={`${colorAttribute.charAt(0).toUpperCase() + colorAttribute.slice(1)}:`}
            placeholder={`${labelMapping[colorAttribute] || colorAttribute}`}
            onIonInput={(e) => handlePaintColorChange(e, paintColor.id, colorAttribute)}
          ></IonInput>
        ))}
        <IonIcon className='removeMe' onClick={() => handleRemovePaintColor(paintColor.id)} slot="end" icon={closeCircleOutline} size="small"></IonIcon>
      </div>
    )) || [];
  };

  //////////////////////////// Creating Stuff //////////////////////////// 
  const handleCreateJob = async (myJob: Job) => {
    try {
      if (!currentUser?.uid) { return }
      if (!myJob.number) {
        console.error('You must provide a Job number.');
        return;
      }else {
        const numberExists = await checkIfJobNumberExistsInDatabase(myJob.number);
        if (numberExists) {
          console.error('Job number already in use.');
          return;
        }
      }
      if (!myJob.name) {
        console.error('You must provide a Job Name.');
        return;
      }
      if (!myJob.date) myJob.date = new Date().toISOString(); // Checks if date is valid if not, sets to today's date
      
      // Add in the creator of the job for the future...
      const jobWithCreator = { ...newJob, creator: currentUser.uid };
      
      await createJob(jobWithCreator);
      console.log('Job updated successfully.');
    } catch (error) {
      console.error('Error updating job:', error);
    }
    console.log('iran here')
    setNewJob({});
    resetImageInput();
    setIsConfirmOpen(true);
  };

  //////////////////////////// MODALS //////////////////////////// 
  const [isDateSelectOpen, setIsDateSelectOpen] = useState(false);
  const onDateSelected = (event:any) => {
    handleDateChanged(event);
    setIsDateSelectOpen(false);
  };

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  //////////////////////////// Dealing with Image Files ////////////////////////////
  useEffect(() => {
    if (selectedFiles.length > 0) { handleUpload(); }
  }, [selectedFiles]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
      const validFiles = files.filter(file => validTypes.includes(file.type));
      const invalidFiles = files.filter(file => !validTypes.includes(file.type));
  
      if (invalidFiles.length > 0) {
        setError("Some files have invalid types. Only JPG, PNG, GIF, and PDF are allowed.");
        return;
      } else {
        setError("");
      }
      setSelectedFiles(validFiles);
    }
  };

  const handleUpload = async () => {
    if (!selectedFiles || !newJob || !newJob.number) {
      setError("To upload files please ensure you are logged in, and your Job has a number.");
      return;
    }
  
    try {
      const myNumber = newJob.number.toString();
      setUploadVisible(true);
  
      for (let file of selectedFiles) {
        const url = await uploadImageForJob(myNumber, file);
        if (url) {
          handleAddImages([url]);
        } else {
          throw new Error(`Failed to upload image ${file.name}. URL is null.`);
        }
      }
  
      setUploadVisible(false);
      setToastVisible(true);
      resetImageInput();
      setError('');
    } catch (error) {
      console.error("Error uploading images: ", error);
      setError(`Error uploading images`);
    }
  };

  const renderImages = (images: any) => {
    return images.map((image: any, index: number) => (
      <div key={index} className='imageContainer'>
        <img className='displayThumb' src={image.url} alt={`uploaded-${index}`} />
        <button className='removeButton' onClick={() => handleRemoveImage(index)}>x</button>
      </div>
    ));
  };
  const resetImageInput = () => {
    // Clears out the file input so it's blank again
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    setSelectedFiles([]);
  };

  return (
    <>
      <MainMenu />
      <IonPage id="main-content">
        <IonHeader>
          <IonToolbar>
            <IonTitle>Create New Job</IonTitle>
            <IonButtons slot="start">
              <IonBackButton></IonBackButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className='ion-padding'>
              <div>
                {/* <h3>Job Information</h3> */}
              </div>
                <IonInput 
                  value={newJob.name}
                  label='Job Name:'
                  placeholder='Enter Job Name'
                  onIonInput={handleNameChanged}
                  className='specialPadding'
                ></IonInput>
                <IonInput
                  value={newJob.number?.toString()}
                  type="number"
                  label='Job #:'
                  placeholder='Enter Job #'
                  onIonInput={handleNumberChange}
                ></IonInput>
                <IonItem className='noPadding'>
                  <p>Date:</p>
                  <IonDatetimeButton datetime="datetime" onClick={() => setIsDateSelectOpen(true)}></IonDatetimeButton>  
                </IonItem>
              {newJob.notes && newJob.notes.length > 0 &&
                <div>
                  <h3>Notes</h3>
                  {displayNotes()}
                </div>
              }
              {newJob.paintColors && newJob.paintColors.length > 0 && (
                <div>
                  <h3>Paint Colors</h3>
                  {displayPaintColors()}
                </div>
              )}
              <div>
                <h2>Upload Image or PDF</h2>
                {newJob?.images && (
                  <div className='mainImageContainer'>
                    {renderImages(newJob.images)}
                  </div>
                )}
                <input
                  id="fileInput"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  accept="image/jpeg, image/png, image/gif, image/pdf, image/jpg"  
                />
                {/* <div><IonButton onClick={handleUpload}>Upload Images</IonButton></div> */}
                {error && <p style={{ color: 'red' }}>{error}</p>}
              </div>

{/* MODALS */}
          <IonModal keepContentsMounted={true} isOpen={isDateSelectOpen} onDidDismiss={() => setIsDateSelectOpen(false)}>
            <IonDatetime id="datetime" presentation="date" onIonChange={onDateSelected}></IonDatetime>
          </IonModal>
          <IonModal keepContentsMounted={true} isOpen={isConfirmOpen} onDidDismiss={() => setIsConfirmOpen(false)}>
            <IonHeader>
              <IonToolbar>
                <IonTitle>Your Job has been created!</IonTitle>
              </IonToolbar>
            </IonHeader>
            <IonContent>
              <IonButton onClick={() => {setIsConfirmOpen(false); history.push('/');}}>Ok</IonButton>
            </IonContent>
          </IonModal>
{/* TOASTS */}
          <IonToast
            className='toastyTrying'
            isOpen={uploadVisible}
            onDidDismiss={() => setUploadVisible(false)}
            message={`Uploading Image...`}
          />
          <IonToast
            className='toastySuccess'
            isOpen={toastVisible}
            onDidDismiss={() => setToastVisible(false)}
            onClick={() => setToastVisible(false)}
            message={`Image uploaded successfully!`}
            duration={3000}
          />
        </IonContent>
        <IonFooter>
          <IonToolbar>
            <IonButton onClick={handleAddNote}>Add Note</IonButton>
            <IonButton onClick={handleAddPaintColor}>Add Color</IonButton>
            <IonButton className='buttonGreen' onClick={() => handleCreateJob(newJob)}>Save Job</IonButton>
          </IonToolbar>
        </IonFooter>
      </IonPage>
    </>
  );
};

export default CreateJob;

import { InputChangeEventDetail, IonBackButton, IonButton, IonButtons, IonContent, IonDatetime, IonDatetimeButton, IonFooter, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonMenuButton, IonModal, IonPage, IonPopover, IonTextarea, IonTitle, IonToast, IonToolbar } from '@ionic/react';
import MainMenu from '../../components/MainMenu/MainMenu';
import { useEffect, useState } from 'react';
import { closeCircleOutline, ellipsisHorizontal, ellipsisVertical } from 'ionicons/icons';
import { deleteImageFolder, deleteJobByID, uploadImageForJob } from '../../firebase/controller';
import { Job } from '../../interfaces/interface'
import { useHistory } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../Store/store';
import { updateJobByID } from '../../firebase/controller'
import './EditJob.css'
import { setCurrentJob } from '../../Store/jobSlice';

const EditJob: React.FC = () => {
  const currentJob = useSelector((state: RootState) => state.currentJob.currentJob);
  const dispatch = useDispatch();
  const [newJob, setNewJob] = useState<Job>(currentJob || {
    notes: [],
    paintColors: []
  });
  const myColorInfo = [ 'color', 'brand','line','finish','type', 'orderForm']
  
  const maraUID = 'xjmGbqlR6YhsrjEmFIRhw2mXN4B2' // This is temporary, client side security check isn't great, but it's enough for now...

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [toastSavedVisible, setToastSavedVisible] = useState<boolean>(false);
  const [uploadVisible, setUploadVisible] = useState<boolean>(false);

  const { currentUser } = useAuth();
  const history = useHistory();

  const mockJob: Job = {
    name: 'Sample Job Title'
  };

  const handlePrintClick = () => {
    history.push({
      pathname: '/printJob',
      state: { job: mockJob }
    });
    setShowPopover(false)
  };


  //////////////////////////// HANDLE TEXTS //////////////////////////// 
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

  //////////////////////////// HANDLE IMAGES //////////////////////////// 
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
    const newNote = { id: newId, note: '', title:'' };
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
      
  //////////////////////////// DISPLAY ITEMS //////////////////////////// 
  const displayNotes = () => {
    return newJob.notes?.map(note => (
      <div className='paintContainer' key={note.id}>
      <IonList>
        <div className='flex'>
          <IonIcon className='removeMe' onClick={() => handleRemoveNote(note.id)} slot="end" icon={closeCircleOutline} size="small"></IonIcon>
        </div>
        <IonTextarea
          class='paddingLeft'
          value={note.note}
          onIonInput={(e) => handleNoteChange(e, note.id)}
          autoGrow={true}
          placeholder='Enter Note Here'
        ></IonTextarea >
      </IonList>
      </div>
    )) || [];
  };

  const displayPaintColors = () => {
    return newJob.paintColors?.map((paintColor) => (
      <div className='paintContainer' key={paintColor.id}>
        {myColorInfo.map((colorAttribute) => (
          <IonInput
            class='customBox'
            key={colorAttribute}
            label={`${colorAttribute.charAt(0).toUpperCase() + colorAttribute.slice(1)}:`}
            value={paintColor[colorAttribute as keyof typeof paintColor] || ''}
            onIonInput={(e) => handlePaintColorChange(e, paintColor.id, colorAttribute)}
          ></IonInput>
        ))}
        <IonIcon 
          className='removeMe' 
          onClick={() => handleRemovePaintColor(paintColor.id)} 
          slot="end" 
          icon={closeCircleOutline} 
          size="small"
        ></IonIcon>
      </div>
    )) || [];
  };

  const renderImages = (images: any) => {
    return images.map((image: any, index: number) => (
      <div key={index} className='imageContainer'>
        <a href={image.url} target="_blank" rel="noopener noreferrer">
          <img 
            className='displayThumb' 
            src={image.url} 
            alt={`uploaded-${index}`} 
          />
        </a>
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

  //////////////////////////// CREATING ITEMS //////////////////////////// 
  const UpdateJob = async (myJob: Job, currentJob: any) => { // Allowing `myJob` to be null
    try {
      if (!myJob.id) { return }
      const differences = getDifferences(currentJob, myJob); 
      if (Object.keys(differences).length > 0) {
        await updateJobByID(myJob.id, differences);
      } else {
        console.log("No changes detected.");
      }
    } catch (error) {
      console.error('Error updating job:', error);
    }
    setHasDifference(false);
    setToastSavedVisible(true);
    dispatch(setCurrentJob(myJob))
  };

  const cancelUpdate = async () => {
    if (currentJob !== null) {
      setNewJob(currentJob);
      setHasDifference(false);
    }
  }

  const getDifferences = (original: any, updated: any): Partial<Job> => {
    let diff: Partial<Job> = {};
    
    Object.keys(updated).forEach(key => {
      if (original[key as keyof Job] !== updated[key as keyof Job]) {
        // @ts-ignore
        diff[key as keyof Job] = updated[key as keyof Job];
      }
    });
    return diff;
  };
  
  const [hasDifference, setHasDifference] = useState(false);
  useEffect(() => {
    const differences = getDifferences(currentJob, newJob);
    setHasDifference(Object.keys(differences).length > 0);
  }, [newJob, currentJob]);

  //////////////////////////// MODALS //////////////////////////// 
  const [isDateSelectOpen, setIsDateSelectOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [deleteItem, setDeleteItem] = useState(false);

  const onDateSelected = (event:any) => {
    handleDateChanged(event);
    setIsDateSelectOpen(false);
  };

  //////////////////////////// POPOVERS //////////////////////////// 
  const [showPopover, setShowPopover] = useState(false);
  const [popoverEvent, setPopoverEvent] = useState();

  const handleOpenPopover = (e:any) => {
    e.persist();
    setPopoverEvent(e);
    setShowPopover(true);
  };

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
        setError("Only JPG, PNG, GIF, and PDF are allowed.");
        return;
      } else {
        setError("");
      }
      setSelectedFiles(validFiles);
    }
  };

  const handleUpload = async () => {
    if (!selectedFiles || !currentJob || !currentJob.number) {
      setError("Must have Job Number before uploading files.");
      return;
    }
    
    try {
      const myNumber = currentJob.number.toString();
      setUploadVisible(true);
  
      for (let file of selectedFiles) {
        const url = await uploadImageForJob(myNumber, file);
        if (url) {
          handleAddImages([url]);
        } else {
          throw new Error(`Failed to upload image ${file.name}.`);
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

  const handleDeleteJob = async () => {
    if (currentJob?.id && currentJob.number) {
      try {
        const response = await deleteJobByID(currentJob.id);
        deleteImageFolder(currentJob.number)
        if (response.status === 200) {
          setDeleteItem(false);
          setShowConfirmation(true);
          history.push('/');
        }
      } catch (error) {
        console.error('Error deleting job:', error);
      }
    }
  };

  return (
    <>
      <MainMenu />
      <IonPage id="main-content">
        <IonHeader>
          <IonToolbar>
            <IonTitle>{newJob.name}</IonTitle>
            <IonButtons slot="start">
              <IonBackButton></IonBackButton>
            </IonButtons>
            {currentUser && currentUser.uid === maraUID && (
              <IonButtons slot="end">
                <IonButton onClick={handleOpenPopover}>
                  <IonIcon slot="icon-only" ios={ellipsisHorizontal} md={ellipsisVertical}></IonIcon>
                </IonButton>
              </IonButtons>
            )}
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div>
          </div>
          <IonList lines="none">
            <IonInput 
              value={newJob.name}
              label='Job Name:'
              placeholder='Enter Job Name'
              onIonInput={handleNameChanged}
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
          </IonList>
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
            {newJob?.images && (
              <div className='mainImageContainer'>
                {renderImages(newJob.images)}
              </div>
            )}
            <IonButton onClick={() => history.push('/imageSwiper')}>Image Viewer</IonButton>
            <h4>Add More Images</h4>
            <input
              id="fileInput"
              type="file"
              multiple
              onChange={handleFileChange}
              accept="image/jpeg, image/png, image/gif, image/pdf, image/jpg"  
            />
            {error && <p style={{ color: 'red' }}>{error}</p>}
          </div>

          <IonModal keepContentsMounted={true} isOpen={isDateSelectOpen} onDidDismiss={() => setIsDateSelectOpen(false)}>
            <IonDatetime id="datetime" presentation="date" onIonChange={onDateSelected} value={newJob.date}></IonDatetime>
          </IonModal>

          <IonModal isOpen={deleteItem} onDidDismiss={() => setDeleteItem(false)}>
            <div className='centerModal'>
              <h1 className='titleModal'>{`Are you sure you want to delete ${currentJob?.name}?`}</h1>
              <div className='modalButtonHolder'>
                <IonButton className='yesButton' onClick={() => handleDeleteJob()}>DELETE</IonButton>
                <IonButton className='noButton' onClick={() => setDeleteItem(false)}>CANCEL</IonButton>
              </div>
            </div>
          </IonModal>

          <IonToast
            className='toastySaved'
            isOpen={toastSavedVisible}
            onDidDismiss={() => setToastSavedVisible(false)}
            onClick={() => setToastSavedVisible(false)}
            message={`${newJob.name} has been saved!`}
            duration={2000}
          />
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
            duration={2000}
          />
          <IonToast
            className='toastyTrying'
            isOpen={showConfirmation}
            onDidDismiss={() => setShowConfirmation(false)}
            message={`The show "${currentJob?.name}" has been deleted.`}
            duration={2000}
            position="bottom"
          />
          <IonPopover isOpen={showPopover} event={popoverEvent} onDidDismiss={() => setShowPopover(false)} >
            <IonList>
              {/* <IonItem color="success" button onClick={() => {history.push('/home'); setShowPopover(false)}}>
                Print Job
              </IonItem> */}
              <IonItem color="success" button onClick={handlePrintClick}>
                Print Job
              </IonItem>
              <IonItem color="danger" className='deleteItem' button onClick={() => {setDeleteItem(true); setShowPopover(false)}}>
                Delete Job
              </IonItem>
            </IonList>
          </IonPopover>
        </IonContent>
        <IonFooter>
          <IonToolbar>
            <div className="toolbar-grid">
              <IonButton onClick={handleAddNote}>+ Note</IonButton>
              <IonButton onClick={handleAddPaintColor}>+ Color</IonButton>
              {/* <IonButton onClick={handleAddPainter}>Add Painter</IonButton> */}
              {hasDifference && (
                <IonButton className='buttonGreen' onClick={() => UpdateJob(newJob, currentJob)}>Save</IonButton>
              )}
              {hasDifference && (
                <IonButton className='buttonRed' onClick={() => cancelUpdate()}>Cancel</IonButton>
              )}
            </div>
          </IonToolbar>
        </IonFooter>
      </IonPage>
    </>
  );
};

export default EditJob;

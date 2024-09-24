import React, { useEffect, useState } from "react";
import { IonList, IonItem, IonLabel, IonSearchbar, IonButton } from "@ionic/react";
import { subscribeToJobs } from "../../firebase/controller";
import { Job } from "../../interfaces/interface";
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../Store/store';
import { setCurrentJob, clearCurrentJob } from '../../Store/jobSlice';
import { useHistory } from 'react-router-dom';
import './DisplayJobs.css'

const DisplayJobs: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const currentJob = useSelector((state: RootState) => state.currentJob.currentJob);
  const dispatch = useDispatch();
  const history = useHistory();

  useEffect(() => {
    const unsubscribe = subscribeToJobs(
      (jobsList) => {
        setJobs(jobsList);
        setLoading(false);
      },
      (errMessage) => {
        setError(errMessage);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const myFilteredJobs = jobs.filter((job) => {
      if (!job.name) return false;
      if (!job.number) return false;
      
      // Check name and number
      const nameMatched = job.name.toLowerCase().includes(searchTerm.toLowerCase());
      const numberMatched = job.number.toString().toLowerCase().includes(searchTerm.toLowerCase());

      // Check paint colors
      const paintColorsMatched = job.paintColors?.some(paintColor => 
        paintColor.color.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return nameMatched || numberMatched || paintColorsMatched;
    });
    setFilteredJobs(myFilteredJobs);
  }, [searchTerm, jobs]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const handleClicked = (myJob:Job) => {
    dispatch(setCurrentJob(myJob))
    history.push('/viewJob');
  }

  const renderJobCard = (job: any) => {
    const formattedDate = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short'
    }).format(new Date(job.date));
  
    return (
      <IonItem key={job.id} onClick={(e) => handleClicked(job)}>
        <div className="titleFlex">
          <h5 className="titleh5">{`${job.name}`}</h5>
          <p className="titlep">{`Job # ${job.number}`}</p>
        </div>
          <p>{`${formattedDate}`}</p>
      </IonItem>
    );
  };

  const handleUserInput = (e: CustomEvent) => {
    setSearchTerm(e.detail.value);
  };

  return (
    <div className="homeContainer">
      <IonSearchbar
        show-clear-button="always"
        value={searchTerm}
        placeholder="Search by Name, Number, or Color"
        onIonInput={(e) => handleUserInput(e)}
      ></IonSearchbar>
      <div className="scrollableListContainer">
        <IonList>
          {filteredJobs.length > 0 ? (
            filteredJobs.map(renderJobCard)
          ) : (
            <div>No jobs available</div>
          )}
        </IonList>
      </div>
    </div>
  );
};

export default DisplayJobs;

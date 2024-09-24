import { getFirestore, collection, doc, getDoc, setDoc, deleteDoc, addDoc, QuerySnapshot, onSnapshot, getDocs, where, updateDoc, deleteField, arrayUnion, arrayRemove, query } from "firebase/firestore";
import { app, db, imageDB } from "./config";
import { useState, useEffect } from "react";
import { deleteObject, getDownloadURL, listAll, ref, uploadBytes } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { Job } from '../interfaces/interface'

export const auth = getAuth(app);
export const firestore = getFirestore(app);

////////////////////////////////////////// FIREBASE FUNCTIONS //////////////////////////////////////////
// Create Job
export const createJob = async (myJob: Job) => {
  try {
    const jobsCollectionRef = collection(firestore, "jobs");
    const docRef = await addDoc(jobsCollectionRef, myJob);
    console.log("Document successfully created");
    // return docRef.id;
  } catch (error) {
    console.error("Error adding document: ", error);
    throw new Error("Could not create job");
  }
};

export const checkIfJobNumberExistsInDatabase = async (jobNumber: number) => {
  try {
    const jobsCollectionRef = collection(firestore, "jobs");
    const q = query(jobsCollectionRef, where("number", "==", jobNumber));
    const querySnapshot = await getDocs(q);

    return !querySnapshot.empty; // Returns true if at least one document with the job number exists
  } catch (error) {
    console.error("Error checking job number in Firestore: ", error);
    throw new Error("Could not verify job number existence in Firestore");
  }
};

export const deleteImageFolder = async (jobNumber: number) => {
  try {
    const folderPath = `images/${jobNumber}/`;
    const folderRef = ref(imageDB, folderPath);
    const res = await listAll(folderRef);

    // Delete all files inside the folder
    for (const itemRef of res.items) {
      await deleteObject(itemRef);
    }

    console.log(`Folder ${folderPath} and its contents have been deleted.`);
    return true;
  } catch (error) {
    console.error("Error deleting folder and its contents: ", error);
    throw new Error("Could not delete job folder");
  }
};

// Fetch all jobs
export const fetchAllJobs = async (): Promise<Job[]> => {
  try {
    const jobsCollectionRef = collection(firestore, "jobs");
    const jobsSnapshot = await getDocs(jobsCollectionRef);
    const jobsList = jobsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Job[];
    
    console.log("All jobs fetched successfully");
    return jobsList;
  } catch (error) {
    console.error("Error fetching documents: ", error);
    throw new Error("Could not fetch jobs");
  }
};

////////////////////////////////////////// BY ID FUNCTIONS //////////////////////////////////////////
 // Fetch a job by ID
 export const fetchJobByID = async (jobId: string): Promise<Job | null> => {
  try {
    const jobDocRef = doc(firestore, "jobs", jobId);
    const jobDoc = await getDoc(jobDocRef);

    if (jobDoc.exists()) {
      return jobDoc.data() as Job;
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching document: ", error);
    throw new Error("Could not fetch job");
  }
};

// Update a job by ID
export const updateJobByID = async (jobId: string, updatedData: Partial<Job>) => {
  try {
    const jobDocRef = doc(firestore, "jobs", jobId);
    await updateDoc(jobDocRef, updatedData);
    console.log("Document successfully updated");
  } catch (error) {
    console.error("Error updating document: ", error);
    throw new Error("Could not update job");
  }
};

// Delete a job by ID
export const deleteJobByID = async (jobId: string): Promise<{ status: number }> => {
  try {
    const jobDocRef = doc(firestore, "jobs", jobId);
    await deleteDoc(jobDocRef);
    console.log("Document successfully deleted");

    // Return a success status
    return { status: 200 };
  } catch (error) {
    console.error("Error deleting document: ", error);

    // Re-throw the error after logging it
    throw new Error("Could not delete job");
  }
};

////////////////////////////////////////// LIVE UPDATE FUNCTIONS //////////////////////////////////////////
export const subscribeToJobs = (callback: (jobs: Job[]) => void, onError: (error: string) => void) => {
  try {
    const jobsCollectionRef = collection(firestore, "jobs");
    return onSnapshot(
      jobsCollectionRef,
      (snapshot: QuerySnapshot) => {
        const jobsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Job[];
        callback(jobsList);
      },
      (error) => {
        console.error("Error with real-time listener: ", error);
        onError("Could not fetch jobs in real-time");
      }
    );
  } catch (error) {
    console.error("Error setting up real-time listener: ", error);
    throw new Error("Could not set up real-time listener");
  }
};

////////////////////////////////////////// IMAGE UPLOAD FUNCTION //////////////////////////////////////////
export const uploadImageForJob = async (jobNumber: string, file: File): Promise<string | null> => {
  try {
    const storageRef = ref(imageDB, `images/${jobNumber}/${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log("Image successfully uploaded, URL: ", downloadURL);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image: ", error);
    throw new Error("Could not upload image");
  }
};
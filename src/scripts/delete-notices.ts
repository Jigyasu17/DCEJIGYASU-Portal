import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";

// TODO: Add your Firebase configuration here
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const deleteNotices = async () => {
  const noticesCollection = collection(db, "notices");
  const noticesSnapshot = await getDocs(noticesCollection);
  const deletionPromises = noticesSnapshot.docs.map((noticeDoc) =>
    deleteDoc(doc(db, "notices", noticeDoc.id))
  );
  await Promise.all(deletionPromises);
  console.log("All notices have been deleted.");
};

deleteNotices().catch((error) => {
  console.error("Error deleting notices: ", error);
});

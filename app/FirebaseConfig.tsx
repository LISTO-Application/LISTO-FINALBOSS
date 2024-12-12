import { initializeApp } from "@react-native-firebase/app";
import { getFirestore } from "@react-native-firebase/firestore";
import { getAuth } from "@react-native-firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyAzZ7B0faWwYTNHO3swEUErpD5UaWnMYGo",
  authDomain: "listo-dev-18c26.firebaseapp.com",
  projectId: "listo-dev-18c26",
  storageBucket: "listo-dev-18c26.appspot.com",
  messagingSenderId: "1019470933970",
  appId: "1:1019470933970:android:2ef6f747ad244c2607a20b",
  measurementId: "G-NE9YEPY24Z",
  databaseURL: "",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };

import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCyj4O4KjTVGz6vgODRJVEcYcRLCPpk3nY",
  authDomain: "divine-cardinal.firebaseapp.com",
  databaseURL: "https://divine-cardinal-default-rtdb.firebaseio.com",
  projectId: "divine-cardinal",
  storageBucket: "divine-cardinal.firebasestorage.app",
  messagingSenderId: "521349950555",
  appId: "1:521349950555:web:8148e41c7634f615bfa37e"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const registryRef = ref(db, 'pages_registry');
onValue(registryRef, (snapshot) => {
  console.log("Data:", snapshot.val());
  process.exit(0);
}, (error) => {
  console.error("Error:", error);
  process.exit(1);
});

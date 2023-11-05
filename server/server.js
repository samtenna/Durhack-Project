import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, getDocs , collection, query, where} from "firebase/firestore";
import { getDownloadURL, getStorage, ref} from "firebase/storage";
import express from 'express';
import * as cors from "cors";
//const firestore = require('firebase-admin/firestore');

const firebaseConfig = {
    apiKey: "AIzaSyBXOjJy_EpIafw6mntPfHjMq9iKPknx_4g",
    authDomain: "durhack-project-45a1b.firebaseapp.com",
    projectId: "durhack-project-45a1b",
    storageBucket: "durhack-project-45a1b.appspot.com",
    messagingSenderId: "912269921938",
    appId: "1:912269921938:web:017b70dda6b2c8eb06e04b",
    measurementId: "G-MWCQ2PH5CM",
    storageBucket: 'gs://durhack-project-45a1b.appspot.com/',
}

const expressApp = express();
expressApp.use(express.json());
expressApp.use(cors.default());

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const storage = getStorage(app);

const imagesRef = ref(storage, 'Images');

const bannerRef = ref(storage, 'Banner');


//declaring port and hostname

let hostname = '127.0.0.1'
let port = process.env.PORT || 3000


expressApp.listen(port, () => {
    console.log(`server running on port {port}.`);
});


expressApp.get("/prod/all/:ID", async (req, res) => {
    const docRef = doc(db, "Listings", req.params.ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        res.send(docSnap.data());
    } else {
        res.status(404);
    };
});

expressApp.get("/prod/allprod", async (req, res) => {
    const prodRef = collection(db, 'Listings');
    const docsSnap = await getDocs(prodRef);
    let message = []
    docsSnap.forEach(doc => {
       message.push({ID: doc.id, ...doc.data()});
    });
    res.send(message);
});

expressApp.get("/prod/image/:ID", async (req, res) => {
    const docRef = doc(db, "Listings", req.params.ID);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
        let imageFileName = `${req.params.ID}.jpg`;
        let imageRef = ref(imagesRef, imageFileName);
        let imageLink = await getDownloadURL(imageRef);
        res.send(imageLink);
    } else {
        res.status(404);
    };
});

expressApp.get("/prod/banner/:ID", async (req, res) => {
    let imageFileName = `${req.params.ID}.jpg`;
    let imageRef = ref(bannerRef, imageFileName);
    let imageLink = await getDownloadURL(imageRef);
    res.send(imageLink);
});


expressApp.get("/prod/search/:searchTerm", async (req, res) => {
    const listingRef = collection(db, "Listings");
    const q = query(listingRef, where("product_name", "==", req.params.searchTerm));
    const querySnapshot = await getDocs(q);
    let message = [];
    querySnapshot.forEach((doc) => {
        message.push({ID: doc.id, ...doc.data()});
    });
    res.send(message);
});

// Content filters

expressApp.get("/prod/filter/:filterTerm", async (req, res) => {
    const listingRef = collection(db, "Listings");
    const q = query(listingRef, where("labels", "array-contains", req.params.filterTerm));
    const querySnapshot = await getDocs(q);
    let message = [];
    querySnapshot.forEach((doc) => {
        message.push({ID: doc.id, ...doc.data()});
    });
    res.send(message);
});

expressApp.get("/prod/filters/:filterTerms", async (req, res) => {
    const terms = req.params.filterTerms.split(" ");
    const q = query(listingRef, where("lables", "array-contains-any", terms));
    const querySnapshot = await getDocs(q);
    let message = [];
    querySnapshot.forEach((doc) => {
        message.push({ID: doc.id, ...doc.data()});
    });
    res.send(message);
});


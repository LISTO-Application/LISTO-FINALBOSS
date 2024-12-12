// React Imports
import React, { useEffect, useRef, useState, } from "react";
import { Animated, Dimensions, View, 
    ScrollView, Text, TouchableOpacity, 
    Alert, Image, Platform, StyleSheet,
    Modal, FlatList, TouchableWithoutFeedback, 
    ImageSourcePropType, TextInput, ActivityIndicator} from "react-native";
import Geocoder from 'react-native-geocoding';

// Expo Imports
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Image as Img, type ImageSource } from "expo-image";
import * as ImageManipulator from "expo-image-manipulator";
import * as Location from 'expo-location';

// Constant Imports
import { Report } from "../../constants/data/reports";

// Firebase Imports
import { db } from "../FirebaseConfig";
import { authWeb } from "@/app/(auth)";
import { collection, deleteDoc, doc, FirebaseFirestoreTypes, query, where, getDocs, updateDoc, firebase } from "@react-native-firebase/firestore";
import {collection as WebCollection, GeoPoint, addDoc} from "firebase/firestore";
import { app, dbWeb } from "../(auth)"; // Adjust the import path to your Firebase config
import { getStorage, ref, StorageReference, UploadMetadata, UploadTaskSnapshot, getDownloadURL, uploadBytesResumable as firebaseUploadBytesResumable } from "firebase/storage";

// Date Imports
import dayjs from "dayjs";
import { format, formatDate, getTime, set, subDays, subYears} from "date-fns";

// Hooks
import useResponsive from "@/hooks/useResponsive";

// Component Imports
import PaginationReport from "@/components/PaginationReport";
import { SpacerView } from "@/components/SpacerView";
import Ionicons from "@expo/vector-icons/Ionicons";
import { DropdownCrimeTypes } from "./(drawer)/newReports";
import { MaterialIcons } from "@expo/vector-icons";4
import DropDownPicker from "react-native-dropdown-picker";
import DatePicker from "react-datepicker";

// Map Imports
import { AdvancedMarker, APIProvider, Map, useMap, useMapsLibrary } from "@vis.gl/react-google-maps";


// Style Imports
import { styles } from "@/styles/styles";
import { webstyles } from "@/styles/webstyles";
import EditReport from "./(drawer)/editReport";

// Image Imports
const murder = require("../../assets/images/knife-icon.png");
const homicide = require("../../assets/images/homicide-icon.png");
const theft = require("../../assets/images/thief-icon.png");
const carnapping = require("../../assets/images/car-icon.png");
const injury = require("../../assets/images/injury-icon.png");
const robbery = require("../../assets/images/robbery-icon.png");
const rape = require("../../assets/images/rape-icon.png");
const PlaceholderImage = require("@/assets/images/background-image.jpg");

type ImageProps = {
  label: string;
  theme?: "primary";
  onPress?: () => void;
};

type IMGViewerProps = {
  imgSource: ImageSource;
  selectedImage?: string;
};

const ImageViewer = ({ imgSource, selectedImage }: IMGViewerProps) => {

  const imageSource = selectedImage ? { uri: selectedImage } : imgSource;

  return <Img source={imageSource} style={webstyles.image} />;
};

  export default function ViewReport({ navigation }: { navigation: any }) {

    // Responsive Sizes
    const {display, subDisplay, title, subtitle, body, small, tiny, height} = useResponsive()

    const categories = {
      murder: murder as ImageSourcePropType,
      theft: theft as ImageSourcePropType,
      carnapping: carnapping as ImageSourcePropType, 
      homicide: homicide as ImageSourcePropType,
      injury: injury as ImageSourcePropType,
      robbery: robbery as ImageSourcePropType, 
      rape: rape as ImageSourcePropType,
    };

    let crimeType: DropdownCrimeTypes[] = [
      {
        label: "Murder",
        value: "murder",
      },
      {
        label: "Homicide",
        value: "homicide",
      },
      {
        label: "Theft",
        value: "theft",
      },
      {
        label: "Carnapping",
        value: "carnapping",
      },
      {
        label: "Injury",
        value: "injury",
      },
      {
        label: "Robbery",
        value: "robbery",
      },
      {
        label: "Rape",
        value: "rape",
      },
    ];

    const database = dbWeb;

    // AUTH STATE
    const [role, setRole] = useState<{privilege: number | null}>({privilege: null});

    //ARRAY STATES
    const [reports, setReports] = useState<FirebaseFirestoreTypes.QueryDocumentSnapshot[]>([]);
    const [filteredReports, setFilteredReports] = useState<Report[]>([]); // Add this state for filtered reports

    //QUERY STATES
    const [searchQuery, setSearchQuery] = useState<string>(""); // State for search query
    const [isSortedAsc, setIsSortedAsc] = useState(true); // State for sorting direction
    
    //VIEW STATES
    const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
    const [isAddReportVisible, setAddReportVisible] = useState(false);
    const [geoLocateVisible, setGeoLocateVisible] = useState(false);
    const [adminGeoLocateVisible, setAdminGeoLocateVisible] = useState(false);
    const [editReportVisible, setEditReportVisible] = useState(false);
    const [recordCrimeVisible, setRecordCrimeVisible] = useState(false);
    const [validateCrimeVisible, setValidateCrimeVisible] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // State for selected category filter
    const [currentStatusSort, setCurrentStatusSort] = useState<"1" | "0" | "2">("1");

    //INPUT FORM VIEW STATES
    const [locationLoading, setLocationLoading] = useState(false);

    // DROPDOWN VALUES
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);
    const [items, setItems] = useState(crimeType);

    const minDate = value === "rape" ? subYears(new Date(), 5) : subDays(new Date(), 365);

    // INPUT STATES
    const [selectedValue, setSelectedValue] = useState<DropdownCrimeTypes>();
    const [geoLocation, setGeoLocation] = useState<GeoPoint>();
    const [location, setLocation] = useState("Click to set location");
    const [additionalInfo, setAdditionalInfo] = useState("");
    const [timeOfCrime, setTimeOfCrime] = useState<Date | null>(new Date());
    const [name, setName] = useState(authWeb.currentUser?.displayName); //TO set the reporter's name
    const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
    const [imageFilename, setImageFileName] = useState<string | null | undefined>(undefined);
    const [timeReported, setTimeReported] = useState<Date | null>(new Date());
    const [docID, setDocID] = useState<string | undefined>(undefined);
    const [UID, setUID] = useState<string | undefined>(undefined);
  
    const auth = authWeb;
    const authID = auth.currentUser;
  
    // FETCH REPORTS FOR USER
    const fetchReports = async () => {
      // Connect database and collection
      const reportsCollectionRef = collection(db, "reports");
      // Fetch query snapshot
      await query(reportsCollectionRef, where("uid", "==", authID?.uid))
          .get()
          .then((querySnapshot) => {
              const data = querySnapshot.docs.map((doc) => doc);
              setReports(data);
          }).catch((error) => {
              console.error("Error fetching reports: ", error);
          })
    };

    // FETCH REPORTS FOR ADMIN
    const adminFetchReports = async () => {
      // Connect database and collection
      const reportsCollectionRef = collection(db, "reports");
      // Fetch query snapshot
      await firebase.firestore().collection("reports")
        .where("status", "==", 1)
        .get()
        .then((querySnapshot) => {
            const data = querySnapshot.docs.map((doc) => doc);
            setReports(data);
        }).catch((error) => {
            console.error("Error fetching reports: ", error);
        })
    };

    // FETCH REPORTS ON LOAD AND SET AUTH
    useEffect(() => {
      const setup = async () => {
        await authID?.getIdTokenResult()
          .then(token => {
            if (token.claims.admin == true) {
              adminFetchReports();
              setRole({privilege: 1});
            } else if (token.claims.user == true) {
              fetchReports();
              setRole({privilege: 0});
            }
          });  
      }
      setup();
      console.log("REPORTS: ", reports);
    }, []);

    const position = { lat: 14.685992094228787, lng: 121.07589171824928 };
    const [geoMarkerPos, setGeoMarkerPos] = useState(position);

    // INITIALIZE MAP
    Geocoder.init("AIzaSyDoWF8JDzlhT2xjhuInBtMmkhWGXg2My0g");
    const PlacesLibrary = () => {
      const map = useMap("geoLocateMap");
      const placesLib = useMapsLibrary("places");

      useEffect(() => {
        if (!placesLib || !map) return;

        const svc = new placesLib.PlacesService(map);
      }, [placesLib, map]);

      return null;
    };
  
    //PAGINATIONS
    const [currentPage, setCurrentPage] = useState(1);
    const reportsPerPage = 10;
    const currentReports = filteredReports.slice(
      (currentPage - 1) * reportsPerPage,
      currentPage * reportsPerPage
    );

    //GEOLOCATION
    const isValidLocation = async (
      address: string
    ): Promise<GeoPoint | boolean | null | undefined> => {
      if (!address || address.trim() === "") return null;
      const apiKey = "AIzaSyDoWF8JDzlhT2xjhuInBtMmkhWGXg2My0g";
      const bounds = {
        northeast: "14.693963,121.101193", // Adjusted bounds
        southwest: "14.649732,121.067052",
      };
      const [neLat, neLng] = bounds.northeast.split(",").map(Number);
      const [swLat, swLng] = bounds.southwest.split(",").map(Number);
      if (geoLocation != null) {
        const isWithinBounds = geoLocation?.latitude <= neLat && geoLocation?.latitude >= swLat && geoLocation?.longitude <= neLng && geoLocation?.longitude >= swLng;
        if (isWithinBounds) {
          return true;
        }
      } else {
        return null;
      }
    };
    
  // Image Picker
  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setImageFileName(result.assets[0].fileName);
    } else {
      alert("You did not select any image.");
    }
  };

  // CLEAR IMAGE
  function clearImageAsync() {
    setSelectedImage(undefined);
    setImageFileName(undefined);
  };

  // RESET INPUT DATA
  function resetData() {
    setSelectedValue(undefined);
    setValue(null);
    setLocation("");
    setGeoLocation(undefined);
    setAdditionalInfo("");
    setImageFileName(undefined);
    setSelectedImage(undefined);
    setTimeOfCrime(new Date());
    setUID(undefined);
    setDocID(undefined);
  }
  
    //HANDLERS
    // USER ONLY
    const handleDeleteReport = async (reportId: any) => {
      await authID?.getIdTokenResult()
      .then(token => {
        if (token.claims.user == true) {
          try {
             deleteDoc(doc(db, "reports", reportId))
            .then(() => {
              Alert.alert("Report deleted successfully");
            });
            setFilteredReports((prevReports) =>
              prevReports.filter((r) => r.uid !== reportId)
            );
          } catch (error) {
            console.error("Error deleting report: ", error);
          }
        } 
      });  
    };

    // USER ONLY
    const handleOpenEditReport = (report: any) => {
      authID?.getIdTokenResult()
        .then(token => {
          if (token.claims.user == true) {
            const auth = authWeb.currentUser?.uid;
            const uid = auth;
            const storage = getStorage(
              app,
              "gs://listo-dev-18c26.firebasestorage.app"
            );
            const storagePath = `reportImages/${uid}/${report.data().image.filename}`;
            const reference = ref(storage, storagePath);

            getDownloadURL(ref(storage, storagePath))
              .then((url) => {
                setSelectedImage(url);
              })

            console.log("Report UID:", report.data().uid);
            setSelectedValue(crimeType.find((item) => item.value === report.data().category));
            setValue(report.data().category);
            setLocation(report.data().location);
            setGeoLocation(report.data().coordinate);
            setAdditionalInfo(report.data().additionalInfo);
            setImageFileName(report.data().image.filename);
            setTimeOfCrime(report.data().timeOfCrime.toDate());
            setDocID(report.id);
            setEditReportVisible(true);
          }
        });  
    };

    //ADMIN ONLY
    const handleOpenValidateReport = async (report : any) => {
      await authID?.getIdTokenResult()
      .then(token => {
        if (token.claims.admin == true) {
          const storage = getStorage(
            app,
            "gs://listo-dev-18c26.firebasestorage.app"
          );
          const storagePath = `reportImages/${report.data().uid}/${report.data().image.filename}`;
          const reference = ref(storage, storagePath);
    
          getDownloadURL(reference)
            .then((url) => {
              setSelectedImage(url);
            })
    
          console.log("Report UID:", report.data().uid);
          setSelectedValue(crimeType.find((item) => item.value === report.data().category));
          setValue(report.data().category);
          setLocation(report.data().location);
          setGeoLocation(report.data().coordinate);
          setName(report.data().name);
          setUID(report.data().uid);
          setAdditionalInfo(report.data().additionalInfo);
          setImageFileName(report.data().image.filename);
          setTimeOfCrime(report.data().timeOfCrime.toDate());
          setTimeReported(report.data().timeReported.toDate());
          setDocID(report.id);
          setValidateCrimeVisible(true);
        }
      });
    };

    // USER ONLY
    const handleEdit = async () => {
      await authID?.getIdTokenResult()
      .then( async (token) => {
        if (token.claims.user == true) {
              let resizedImage = null;
          console.log("Starting handleEdit function...");
      
          if (selectedImage) {
            try {
              console.log("Resizing image...");
              // Resize the image
              resizedImage = await ImageManipulator.manipulateAsync(
                selectedImage,
                [{ resize: { width: 800 } }],
                { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
              );
            } catch (error) {
              console.error("Error processing and uploading the image:", error);
              alert("Failed to process and upload the image. Please try again.");
              return;
            }
          }
      
          // Geocode address to get Firestore GeoPoint
          const locationString = location;
          console.log("Geocoding location:", locationString);
          const firestoreGeoPoint = await isValidLocation(location);
      
          if (!firestoreGeoPoint) {
            console.warn("Skipping invalid location:", locationString);
            alert("Does not accept locations beyond Quezon City");
            return;
          }
      
          if (!selectedValue) {
            alert("Select a valid category!");
            return;
          }
          
          //Timestamp
          const timestamp = new Date();
      
          async function convertUriToFile(
            uri: string,
            filename: string
          ): Promise<File> {
            return new Promise<File>((resolve, reject) => {
              const img = new window.Image();
              img.src = uri;
      
              img.onload = () => {
                // Create a canvas to draw the image and convert to Blob
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");
                if (context) {
                  canvas.width = img.width;
                  canvas.height = img.height;
                  context.drawImage(img, 0, 0);
      
                  canvas.toBlob((blob) => {
                    if (blob) {
                      const file = new File([blob], filename, { type: "image/jpeg" });
                      resolve(file);
                    } else {
                      reject("Failed to convert image to Blob.");
                    }
                  }, "image/jpeg");
                } else {
                  reject("Failed to get canvas context.");
                }
              };
      
              img.onerror = (error) => reject(error);
            });
          }

          async function uploadImageAndGetURL(
            file: File,
            storagePath: string,
            metadata: UploadMetadata
          ): Promise<string> {
            const storage = getStorage(
              app,
              "gs://listo-dev-18c26.firebasestorage.app"
            );
            const reference = ref(storage, storagePath);
            const snapshot = await uploadBytesResumable(reference, file, metadata) as UploadTaskSnapshot;
      
            console.log("Image uploaded successfully!", snapshot.metadata.fullPath);
            const downloadURL = snapshot.metadata.fullPath;
            return downloadURL;
          }
      
          //UID fetch
          const auth = authWeb.currentUser?.uid;
          const uid = auth;
          const authPhone = authWeb.currentUser?.phoneNumber;
          const authName = authWeb.currentUser?.displayName;
      
          //Convert URI to File object
      
          let downloadURL = null;
          if (selectedImage) {
            const file = await convertUriToFile(selectedImage, imageFilename || "default-filename.jpg"); // A File object from a file picker
            const storagePath = `reportImages/${uid}/${imageFilename}`;
            const metadata = {
              contentType: "image/jpeg", // Automatically gets MIME type from the file
            };
            downloadURL = await uploadImageAndGetURL(file, storagePath, metadata);
          } else {
            alert("No image selected, proceeding to create report.");
          }
      
        const editReport = {
          uid: uid || "anonymous",
          phone: authPhone || "No phone",
          name: authName || "Anonymous",
          category: selectedValue ? selectedValue.value.toString().toLowerCase() : "Unknown",
          location: location || "Unknown location",
          coordinate: {latitude: geoLocation?.latitude, longitude: geoLocation?.longitude} as GeoPoint,
          additionalInfo: additionalInfo || "Undescribed Report",
          image: resizedImage
            ? { filename: imageFilename, uri: downloadURL }
            : { filename: "default-image.jpg", uri: "" },
          status: 1, // Default to 1
          time: timeOfCrime ? formatDate(timeOfCrime, "hh:mma") : "Unknown time",
          timeOfCrime: timeOfCrime,
          unixTOC: getTime(timeOfCrime || new Date()),
        };
      
          try {
            if (docID != undefined) {
              console.log("Edited report details:", editReport);
              const reportRef = doc(db, "reports", docID);
              await updateDoc(reportRef, editReport)
                .then(() => {
                  Alert.alert("Report edited successfully!", "Thank you for your report.");
                  setEditReportVisible(false);
                  resetData();
                  fetchReports();
                }).catch((error) => {
                  console.error("Error saving report:", error);
                  alert("Failed to save report. Please try again.");
                });
            }
          } catch (error) {
            console.error("Error saving report:", error);
            alert("Failed to save report. Please try again.");
          }
        }
      });
      
    };

    // USER ONLY
    const handleSubmit = async () => {
      await authID?.getIdTokenResult()
      .then(async (token) => {
        if (token.claims.user == true) {
              let resizedImage = null;
          console.log("Starting handleSubmit function...");
      
          if (selectedImage) {
            try {
              console.log("Resizing image...");
              // Resize the image
              resizedImage = await ImageManipulator.manipulateAsync(
                selectedImage,
                [{ resize: { width: 800 } }],
                { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
              );
            } catch (error) {
              console.error("Error processing and uploading the image:", error);
              alert("Failed to process and upload the image. Please try again.");
              return;
            }
          }
      
          // Geocode address to get Firestore GeoPoint
          const locationString = location;
          console.log("Geocoding location:", locationString);
          const firestoreGeoPoint = await isValidLocation(location);
      
          if (!firestoreGeoPoint) {
            console.warn("Skipping invalid location:", locationString);
            alert("Does not accept locations beyond Quezon City");
            return;
          }
      
          if (!selectedValue) {
            alert("Select a valid category!");
            return;
          }
          
          //Timestamp
          const timestamp = new Date();
      
          async function convertUriToFile(
            uri: string,
            filename: string
          ): Promise<File> {
            return new Promise<File>((resolve, reject) => {
              const img = new window.Image();
              img.src = uri;
      
              img.onload = () => {
                // Create a canvas to draw the image and convert to Blob
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");
                if (context) {
                  canvas.width = img.width;
                  canvas.height = img.height;
                  context.drawImage(img, 0, 0);
      
                  canvas.toBlob((blob) => {
                    if (blob) {
                      const file = new File([blob], filename, { type: "image/jpeg" });
                      resolve(file);
                    } else {
                      reject("Failed to convert image to Blob.");
                    }
                  }, "image/jpeg");
                } else {
                  reject("Failed to get canvas context.");
                }
              };
      
              img.onerror = (error) => reject(error);
            });
          }

          async function uploadImageAndGetURL(
            file: File,
            storagePath: string,
            metadata: UploadMetadata
          ): Promise<string> {
            const storage = getStorage(
              app,
              "gs://listo-dev-18c26.firebasestorage.app"
            );
            const reference = ref(storage, storagePath);
            const snapshot = await uploadBytesResumable(reference, file, metadata) as UploadTaskSnapshot;
      
            console.log("Image uploaded successfully!", snapshot.metadata.fullPath);
            const downloadURL = snapshot.metadata.fullPath;
            return downloadURL;
          }
      
          //UID fetch
          const auth = authWeb.currentUser?.uid;
          const uid = auth;
          const authPhone = authWeb.currentUser?.phoneNumber;
          const authName = authWeb.currentUser?.displayName;
      
          //Convert URI to File object
      
          let downloadURL = null;
          if (selectedImage) {
            const file = await convertUriToFile(selectedImage, imageFilename || "default-filename.jpg"); // A File object from a file picker
            const storagePath = `reportImages/${uid}/${imageFilename}`;
            const metadata = {
              contentType: "image/jpeg", // Automatically gets MIME type from the file
            };
            downloadURL = await uploadImageAndGetURL(file, storagePath, metadata);
          } else {
            alert("No image selected, proceeding to create report.");
          }
      
        const newReport = {
          uid: uid || "anonymous",
          phone: authPhone || "No phone",
          name: authName || "Anonymous",
          category: selectedValue ? selectedValue.value.toString().toLowerCase() : "Unknown",
          location: location || "Unknown location",
          coordinate: {latitude: geoLocation?.latitude, longitude: geoLocation?.longitude} as GeoPoint,
          additionalInfo: additionalInfo || "Undescribed Report",
          image: resizedImage
            ? { filename: imageFilename, uri: downloadURL }
            : { filename: "default-image.jpg", uri: "" },
          status: 1, // Default to 1
          time: timeOfCrime ? formatDate(timeOfCrime, "hh:mma") : "Unknown time",
          timeOfCrime: timeOfCrime,
          timeReported: timestamp,
          unixTOC: getTime(timeOfCrime || new Date()),
        };
      
          console.log("New report to be saved:", newReport);
          try {
            const reportRef = WebCollection(database, "reports");
            await addDoc(reportRef, newReport);
            Alert.alert("Report submitted successfully!", "Thank you for your report.");
            setAddReportVisible(false);
            resetData();
            fetchReports();
          } catch (error) {
            console.error("Error saving report:", error);
            alert("Failed to save report. Please try again.");
          }
        }
      });
      
    };

    // ADMIN ONLY
    const handleRecord = async () => {
      await authID?.getIdTokenResult()
      .then(async (token) => {
        if (token.claims.admin == true) {
              console.log("Starting handleRecord function...");
      
          // Geocode address to get Firestore GeoPoint
          const locationString = location;
          console.log("Geocoding location:", locationString);
          const firestoreGeoPoint = await isValidLocation(location);
      
          if (!firestoreGeoPoint) {
            console.warn("Skipping invalid location:", locationString);
            alert("Does not accept locations beyond Quezon City");
            return;
          }
      
          if (!selectedValue) {
            alert("Select a valid category!");
            return;
          }

        const newCrime = {
          category: selectedValue ? selectedValue.value.toString().toLowerCase() : "Unknown",
          location: location || "Unknown location",
          coordinate: {latitude: geoLocation?.latitude, longitude: geoLocation?.longitude} as GeoPoint,
          additionalInfo: additionalInfo || "Undescribed Report",
          time: timeOfCrime ? formatDate(timeOfCrime, "hh:mma") : "Unknown time",
          timeOfCrime: timeOfCrime,
          timeReported: new Date(),
          unixTOC: getTime(timeOfCrime || new Date()),
        };
      
          console.log("New report to be saved:", newCrime);
          try {
            const reportRef = WebCollection(database, "crimes");
            await addDoc(reportRef, newCrime);
            alert("Report submitted successfully!");
            setRecordCrimeVisible(false);
            resetData();
            fetchReports();
          } catch (error) {
            console.error("Error saving report:", error);
            alert("Failed to save report. Please try again.");
          }
        }
      });
    };

    // ADMIN ONLY
    const handleValidateCrime = async () => {
      await authID?.getIdTokenResult()
      .then(async (token) => {
        if (token.claims.admin == true) {
          await firebase.firestore().collection("reports")
          .doc(docID)
          .update({
            status: 2,
          }).then(() => {
            firebase.firestore().collection("crimes")
              .add({
                category: selectedValue ? selectedValue.value.toString().toLowerCase() : "Unknown",
                location: location || "Unknown location",
                coordinate: {latitude: geoLocation?.latitude, longitude: geoLocation?.longitude} as GeoPoint,
                additionalInfo: additionalInfo || "Undescribed Report",
                time: timeOfCrime ? formatDate(timeOfCrime, "hh:mma") : "Unknown time",
                timeOfCrime: timeOfCrime,
                timeReported: timeReported,
              }).then(() => {
                alert("Report validated successfully!");
                setValidateCrimeVisible(false);
                resetData();
                adminFetchReports();
              })
          })
        }
      });
    };

    // ADMIN ONLY
    const handleArchiveCrime = async () => {
      await authID?.getIdTokenResult()
      .then(async (token) => {
        if (token.claims.admin == true) {
          await firebase.firestore().collection("reports")
          .doc(docID)
          .update({
            status: 0,
          }).then(() => {
            firebase.firestore().collection("archives")
              .add({
                category: selectedValue ? selectedValue.value.toString().toLowerCase() : "Unknown",
                location: location || "Unknown location",
                coordinate: {latitude: geoLocation?.latitude, longitude: geoLocation?.longitude} as GeoPoint,
                additionalInfo: additionalInfo || "Undescribed Report",
                time: timeOfCrime ? formatDate(timeOfCrime, "hh:mma") : "Unknown time",
                timeOfCrime: timeOfCrime,
                timeReported: timeReported,
              }).then(() => {
                alert("Report validated successfully!");
                setValidateCrimeVisible(false);
                resetData();
                adminFetchReports();
              })
            })
        }
      });
    };

    // ADMIN ONLY
    const handlePenalizeUser = async () => {
      await authID?.getIdTokenResult()
      .then(async (token) => {
        if (token.claims.admin == true) {
          await firebase.firestore().collection("reports")
          .doc(docID)
          .delete()
          .then(() => {
              firebase.app().functions("asia-east1").httpsCallable("penalizeUser")({
              uid: UID
            }).then((result) => {
              console.log(result);
              setValidateCrimeVisible(false);
            }).catch((error) => {
              alert("Error penalizing user: " + error)
            })
          }).catch((error) => {
            alert("Error deleting mischievous report: " + error)
          })
        }
      });
    };

    // const handleSearch = (query: string) => {
    //   setSearchQuery(query);
    //   filterReports(query, selectedCategory);
    // };
  
    const contentPosition = useRef(new Animated.Value(0)).current;
    const [isAlignedRight, setIsAlignedRight] = useState(false);
  
    //SEARCH BY INCLUDES TEXT & CATEGORY FILTER
    // function filterReports (searchQuery: string, category: string | null) {
    //   let filtered = reports;
    //   if (category) {
    //     filtered = filtered.filter((report) => report.category === category);
    //   }
    //   if (searchQuery) {
    //     filtered = filtered.filter((report) => {
    //       const query = searchQuery.toLowerCase();
    //       return (
    //         report.location.toLowerCase().includes(query) ||
    //         report.category.toLowerCase().includes(query) ||
    //         dayjs(new Date(report.date))
    //           .format("YYYY-MM-DD")
    //           .toLowerCase()
    //           .includes(query) ||
    //         report.additionalInfo.toLowerCase().includes(query)
    //       );
    //     });
    //   }
    //   setFilteredReports(filtered);
    // };

    // const handleCategorySelect = (category: string) => {
    //   setSelectedCategory(category); // Set the selected category
    //   filterReports(searchQuery, category); // Apply the category filter along with the current search query
    // };

    const crimeCategories = Array.from(
      new Set(reports.map((report) => report.data().category))
    );



    // Render for Android
    if (Platform.OS === "android") {
      return (
        <View style={styles.mainContainer}>
          {/* Blue Header */}
          <View style={styles.headerContainer}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backIcon}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerText}>Submitted Reports</Text>
            <SpacerView height={120} />
          </View>
  
          {/* REPORT LIST */}
          <SpacerView height={90} />
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            {currentReports.map((report) => (
              <View key={report.uid} style={styles.reportContainer}>
                <SpacerView height={20} />
                <View style={styles.reportIcon}>
                  <Ionicons name="alert-circle-outline" size={24} color="white" />
                </View>
                <View style={styles.reportTextContainer}>
                  <Text style={styles.reportTitle}>{report.category}</Text>
                </View>
                <View style={styles.reportActions}>
                  {/* Edit Icon */}
                  <TouchableOpacity
                    style={styles.editIcon}
                    onPress={() => handleOpenEditReport(report)}
                  >
                    <Ionicons name="pencil" size={24} color="white" />
                  </TouchableOpacity>
  
                  {/* Trash Icon (Delete) */}
                  <TouchableOpacity
                    style={styles.editIcon}
                    onPress={() => handleDeleteReport(report.uid)}
                  >
                    <Ionicons name="trash-bin" size={24} color="white" />
                  </TouchableOpacity>
  
                  <Text style={styles.timeText}>{report.time}</Text>
                </View>
              </View>
            ))}
  
            {/* Pagination Controls */}
            <PaginationReport
              filteredReports={filteredReports}
              reportsPerPage={reportsPerPage}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              isAlignedRight={isAlignedRight}
            />
  
            {/* Submit & Cancel Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.cancelButton}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={()=>{}} // Redirect to the new report form
              >
                <Text style={[styles.buttonText, { color: "#FFF" }]}>
                  Submit Report
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      );
    } else if (Platform.OS === "web") {
      
      return (
        <>
          {/* VIEW REPORT */}
          <View style={webstyles.container}>
          <Animated.View
            style={[webstyles.mainContainer, {transform: [{ translateX: contentPosition }],}]}>

            <Modal
              visible={isCategoryModalVisible}
              animationType="slide"
              transparent={true}
              onRequestClose={() => setCategoryModalVisible(false)}>
              <TouchableWithoutFeedback
                onPress={() => setCategoryModalVisible(false)}
              >
                <View style={[webstyles.modalContainer, { height: "100%" }]}>
                  <View style={webstyles.modalContent}>
                    <Text style={webstyles.modalHeader}>
                      Select A Crime Category
                    </Text>
                    <FlatList
                      data={crimeCategories}
                      keyExtractor={(item) => item}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={webstyles.modalOption}
                          onPress={() => {
                            //handleCategorySelect(item)
                        }}>
                          <Text style={webstyles.modalOptionText}>
                            {item.charAt(0).toUpperCase() + item.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </Modal>
            <SpacerView height="5%" />
            <ScrollView
              contentContainerStyle={[
                webstyles.reportList,
                isAlignedRight && { width: "75%" },
              ]}
              showsVerticalScrollIndicator={true}
              >
              {reports.map((report) => {
                return (
                  <View key={report.id} 
                  style={{
                    marginVertical: 10,
                    padding: 15,
                    backgroundColor: "#115272",
                    borderRadius: 8,
                    flexDirection: "row"}}>
                    <Image source={categories[report.data().category as keyof typeof categories]} style={webstyles.reportIcon} />
                    <View style={{ flex: 1, flexDirection: "column" }}>
                      <View style={{ flexDirection: "row" }}>
                        <Text style={webstyles.reportTitle}>
                          {report.data().category.charAt(0).toUpperCase() +
                            report.data().category.slice(1)}
                        </Text>
                        <Text
                          style={{ flex: 1, color: "white", alignSelf: "center", fontWeight: "bold"}}>
                          {report.data().phone}
                        </Text>
                        <Text
                          style={{ flex: 1, color: "white", fontWeight: "bold" }}
                        >
                          {report.data().location.toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flexDirection: "row" }}>
                        <Text style={[webstyles.reportInfo, { marginLeft: 20, fontWeight: "bold"}]}>
                          {formatDate(report.data().timeOfCrime.toDate(), "MMMM dd, yyyy")} at {formatDate(report.data().timeOfCrime.toDate(), "hh:mma")}
                        </Text>
                        <Text style={[webstyles.reportInfo]}>
                          <b>Reported on:</b> {formatDate(report.data().timeReported.toDate(), "MMMM dd, yyyy")} at {formatDate(report.data().timeReported.toDate(), "hh:mma")}
                        </Text>
                        <Text style={webstyles.reportInfo}></Text>
                      </View>
                    </View>
                    <View style={{alignItems: "center", justifyContent: "center"}}>
                      {report.data().status === 2 && <Ionicons name="checkmark-circle" color = "#FFF" size={title}/>}
                      {report.data().status === 1 && <MaterialIcons name="pending" color = "#FFF" size={title}/>}
                      {report.data().status === 0 && <Ionicons name="archive" color = "#FFF" size={title}/>}
                    </View>
                    <View style={webstyles.reportActions}>
                      <TouchableOpacity
                        style={[
                          webstyles.editIcon,
                          report.data().status === 2 && webstyles.disabledIcon, // Disabled when status is 2 (green)
                        ]}
                        onPress={() =>{
                          if (role.privilege == 0) {
                            report.data().status == 1 && handleOpenEditReport(report)
                          } else if (role.privilege == 1) {
                            handleOpenValidateReport(report)
                          }
                        }} // Only allow edit if status is 1
                        disabled={report.data().status === 2} // Disable if status is 2 (green)
                      >
                        <Ionicons
                          name="create-outline"
                          size={30}
                          color={
                            report.data().status != 1
                              ? "gray"
                              : report.data().status === 1
                                ? "#FFF"
                                : "#FFF"
                          } // Set color based on status
                          style={
                            report.data().status === 0 && {
                              textDecorationLine: "line-through",
                            } // Strike-through when status is 0 (grey)
                          }
                        />
                      </TouchableOpacity>
                      {role.privilege == 0 && <TouchableOpacity
                        style={webstyles.editIcon}
                        onPress={() => handleDeleteReport(report.id)}
                      >
                        <Ionicons
                          name="trash-bin-outline"
                          size={30}
                          color="#DA4B46"
                        />
                      </TouchableOpacity>}
                      <Text style={webstyles.timeText}></Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
            <PaginationReport
              filteredReports={filteredReports}
              reportsPerPage={reportsPerPage}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              isAlignedRight={isAlignedRight}
            />
          </Animated.View>
          </View>

          {/* ADD REPORT MODAL */}
          {isAddReportVisible && role.privilege == 0 &&
          <Modal>
            <ScrollView contentContainerStyle={{display: "flex", flexDirection: "column", width: "100%", backgroundColor: "#115272"}}>
              
              <View style = {{backgroundColor: "#115272"}}>
                <Text style={{fontSize: 50, fontWeight: "bold", color: "#FFF", textAlign: "center", marginVertical: "2.5%"}}>Report a Crime</Text>
              </View>
              
              <Animated.View
                style={[{transform: [{ translateX: contentPosition }]}, {
                  marginHorizontal: "auto",    
                  backgroundColor: "white",
                  borderRadius: 30,
                  width: "50%",
                  marginBottom: "2.5%",
                  paddingHorizontal: "5%",
                  paddingVertical: "2.5%"
                  }]}>

                  <Text style = {{color: "#115272", fontSize: subtitle, fontWeight: "bold"}}>Reporter's Username:</Text>
                  <TextInput
                    style={{borderWidth: 3, borderColor: "#115272", borderRadius: 5, padding: 10, marginBottom: 10, width: "100%", color: "#115272"}}
                    value={name ?? ""}
                    editable={true}
                    aria-disabled
                  />
                  <Text style = {{color: "#115272", fontSize: subtitle, fontWeight: "bold"}}>Select Incident Type:</Text>
                  <DropDownPicker
                    style={{borderWidth: 3, borderColor: "#115272", borderRadius: 5, padding: 10, marginBottom: 10, width: "100%",}}
                    open={open}
                    value={value}
                    items={items}
                    setOpen={setOpen}
                    setValue={setValue}
                    setItems={setItems}
                    placeholder="Select Crime Type:"
                    onChangeValue={(selectedValue) => {
                      const selectedItem = items.find(
                        (item) => item.value === selectedValue
                      );
                      setSelectedValue(selectedItem);
                    }}
                  />
                  <Text style = {{color: "#115272", fontSize: subtitle, fontWeight: "bold"}}>Location:</Text>
                  <TouchableOpacity style={{borderWidth: 3, borderColor: "#115272", borderRadius: 5, padding: 10, marginBottom: 10, width: "100%", flexDirection: "row", alignItems: "center"}}
                  onPress={() => {setGeoLocateVisible(true)}}>
                    <Ionicons name="locate" size = {subtitle} color="#115272"/>
                    <Text style = {{color: "#115272", fontSize: subtitle, marginLeft: "2.5%"}}>{location}</Text>
                  </TouchableOpacity>
                  <Text style = {{color: "#115272", fontSize: subtitle, fontWeight: "bold"}}>Date and Time Happened:</Text>
                  <View style={{ width: 250, marginHorizontal: "auto", marginVertical: "2.5%"}}>
                    <DatePicker
                      selected={timeOfCrime}
                      onChange={(date) => setTimeOfCrime(date)}
                      maxDate={new Date()}
                      minDate={minDate}
                      showTimeInput
                      showMonthYearDropdown
                      inline
                    />
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      width: "100%",
                      justifyContent: "center",
                    }}>
                    <Text
                      style={{borderWidth: 3, borderColor: "#115272", borderRadius: 5, padding: 10, marginBottom: 10, width: "50%", color: "#115272",}}>
                      {timeOfCrime ? formatDate(timeOfCrime, "MMMM dd, yyyy") : "Unknown date"}
                    </Text>
                    <Text
                      style={{borderWidth: 3, borderColor: "#115272", borderRadius: 5, padding: 10, marginBottom: 10, width: "50%", color: "#115272",}}>
                      {timeOfCrime ? formatDate(timeOfCrime, "hh:mma") : "Unknown date"}
                    </Text> 
                  </View>
                  <Text style = {{color: "#115272", fontSize: subtitle, fontWeight: "bold"}}>Additional Information:</Text>
                  <TextInput
                    style={{borderWidth: 3, borderColor: "#115272", borderRadius: 5, padding: 10, marginBottom: 10, width: "100%", color: "#115272",}}
                    multiline
                    numberOfLines={4}
                    value={additionalInfo}
                    onChangeText={setAdditionalInfo}
                    placeholder={
                      "Additional Information (e.g: suspects involved, witnesses, names, sequence of events, description of area, etc.)"
                    }
                    placeholderTextColor={"#8c8c8c"}
                  />
                  <Text style = {{color: "#115272", fontSize: subtitle, fontWeight: "bold", textAlign: "center"}}>Image Upload:</Text>
                  <Text>{imageFilename}</Text>

                  <View style={{height: "10%", justifyContent: "space-evenly", alignItems: "center"}}>
                    <TouchableOpacity
                      style={{ backgroundColor: "#115272", paddingHorizontal: "2.5%", borderRadius: 5, paddingVertical: "1%"}}
                      onPress={pickImageAsync}>
                      <Text style={[webstyles.buttonTexteditReport, { color: "#FFF" }]}>
                        CHOOSE A PHOTO
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{ backgroundColor: "#DA4B46", paddingHorizontal: "2.5%", borderRadius: 5, paddingVertical: "1%"}}
                      onPress={clearImageAsync}>
                      <Text style={[webstyles.buttonTexteditReport, { color: "#FFF" }]}>
                        CLEAR
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={webstyles.imageInputContainer}>
                    <View style={webstyles.imageContainer}>
                      <ImageViewer
                        imgSource={PlaceholderImage}
                        selectedImage={selectedImage}
                      />
                    </View>
                  </View>
                  <View style={webstyles.buttonContainereditReport}>
                    <TouchableOpacity
                      style={webstyles.cancelButtoneditReport}
                      onPress={() => {
                        resetData();
                        setAddReportVisible(false);
                      }}
                    >
                      <Text style={webstyles.buttonTexteditReport}>CANCEL</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={webstyles.submitButtoneditReport}
                      onPress={handleSubmit}
                    >
                      <Text style={[webstyles.buttonTexteditReport, { color: "#FFF" }]}>
                        SUBMIT
                      </Text>
                    </TouchableOpacity>
                  </View>
                      
              </Animated.View>
            </ScrollView>
          </Modal>}

          {/* EDIT REPORT MODAL */}
          {editReportVisible && role.privilege == 0 &&
          <Modal>
            <ScrollView contentContainerStyle={{display: "flex", flexDirection: "column", width: "100%", backgroundColor: "#115272"}}>
              
              <View style = {{backgroundColor: "#115272"}}>
                <Text style={{fontSize: 50, fontWeight: "bold", color: "#FFF", textAlign: "center", marginVertical: "2.5%"}}>Edit Report</Text>
              </View>
              
              <Animated.View
                style={[{transform: [{ translateX: contentPosition }]}, {
                  marginHorizontal: "auto",    
                  backgroundColor: "white",
                  borderRadius: 30,
                  width: "50%",
                  marginBottom: "2.5%",
                  paddingHorizontal: "5%",
                  paddingVertical: "2.5%"
                  }]}>

                  <Text style = {{color: "#115272", fontSize: subtitle, fontWeight: "bold"}}>Reporter's Username:</Text>
                  <TextInput
                    style={{borderWidth: 3, borderColor: "#115272", borderRadius: 5, padding: 10, marginBottom: 10, width: "100%", color: "#115272"}}
                    value={name ?? ""}
                    editable={true}
                    aria-disabled
                  />
                  <Text style = {{color: "#115272", fontSize: subtitle, fontWeight: "bold"}}>Select Incident Type:</Text>
                  <DropDownPicker
                    style={{borderWidth: 3, borderColor: "#115272", borderRadius: 5, padding: 10, marginBottom: 10, width: "100%",}}
                    open={open}
                    value={value}
                    items={items}
                    setOpen={setOpen}
                    setValue={setValue}
                    setItems={setItems}
                    placeholder="Select Crime Type:"
                    onChangeValue={(selectedValue) => {
                      const selectedItem = items.find(
                        (item) => item.value === selectedValue
                      );
                      setSelectedValue(selectedItem);
                    }}
                  />
                  <Text style = {{color: "#115272", fontSize: subtitle, fontWeight: "bold"}}>Location:</Text>
                  <TouchableOpacity style={{borderWidth: 3, borderColor: "#115272", borderRadius: 5, padding: 10, marginBottom: 10, width: "100%", flexDirection: "row", alignItems: "center"}}
                  onPress={() => {setGeoLocateVisible(true)}}>
                    <Ionicons name="locate" size = {subtitle} color="#115272"/>
                    <Text style = {{color: "#115272", fontSize: subtitle, marginLeft: "2.5%"}}>{location}</Text>
                  </TouchableOpacity>
                  <Text style = {{color: "#115272", fontSize: subtitle, fontWeight: "bold"}}>Date and Time Happened:</Text>
                  <View style={{ width: 250, marginHorizontal: "auto", marginVertical: "2.5%"}}>
                    <DatePicker
                      selected={timeOfCrime}
                      onChange={(date) => setTimeOfCrime(date)}
                      maxDate={new Date()}
                      minDate={minDate}
                      showTimeInput
                      showMonthYearDropdown
                      inline
                    />
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      width: "100%",
                      justifyContent: "center",
                    }}>
                    <Text
                      style={{borderWidth: 3, borderColor: "#115272", borderRadius: 5, padding: 10, marginBottom: 10, width: "50%", color: "#115272",}}>
                      {timeOfCrime ? formatDate(timeOfCrime, "MMMM dd, yyyy") : "Unknown date"}
                    </Text>
                    <Text
                      style={{borderWidth: 3, borderColor: "#115272", borderRadius: 5, padding: 10, marginBottom: 10, width: "50%", color: "#115272",}}>
                      {timeOfCrime ? formatDate(timeOfCrime, "hh:mma") : "Unknown date"}
                    </Text> 
                  </View>
                  <Text style = {{color: "#115272", fontSize: subtitle, fontWeight: "bold"}}>Additional Information:</Text>
                  <TextInput
                    style={{borderWidth: 3, borderColor: "#115272", borderRadius: 5, padding: 10, marginBottom: 10, width: "100%", color: "#115272",}}
                    multiline
                    numberOfLines={4}
                    value={additionalInfo}
                    onChangeText={setAdditionalInfo}
                    placeholder={
                      "Additional Information (e.g: suspects involved, witnesses, names, sequence of events, description of area, etc.)"
                    }
                    placeholderTextColor={"#8c8c8c"}
                  />
                  <Text style = {{color: "#115272", fontSize: subtitle, fontWeight: "bold", textAlign: "center"}}>Image Upload:</Text>
                  <Text>{imageFilename}</Text>

                  <View style={{height: "10%", justifyContent: "space-evenly", alignItems: "center"}}>
                    <TouchableOpacity
                      style={{ backgroundColor: "#115272", paddingHorizontal: "2.5%", borderRadius: 5, paddingVertical: "1%"}}
                      onPress={pickImageAsync}>
                      <Text style={[webstyles.buttonTexteditReport, { color: "#FFF" }]}>
                        CHOOSE A PHOTO
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{ backgroundColor: "#DA4B46", paddingHorizontal: "2.5%", borderRadius: 5, paddingVertical: "1%"}}
                      onPress={clearImageAsync}>
                      <Text style={[webstyles.buttonTexteditReport, { color: "#FFF" }]}>
                        CLEAR
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={webstyles.imageInputContainer}>
                    <View style={webstyles.imageContainer}>
                      <ImageViewer
                        imgSource={PlaceholderImage}
                        selectedImage={selectedImage}
                      />
                    </View>
                  </View>
                  <View style={webstyles.buttonContainereditReport}>
                    <TouchableOpacity
                      style={webstyles.cancelButtoneditReport}
                      onPress={() => {
                        resetData();
                        setEditReportVisible(false);
                      }}
                    >
                      <Text style={webstyles.buttonTexteditReport}>CANCEL</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={webstyles.submitButtoneditReport}
                      onPress={()=> {
                        handleEdit
                      }}
                    >
                      <Text style={[webstyles.buttonTexteditReport, { color: "#FFF" }]}>
                        SAVE CHANGES
                      </Text>
                    </TouchableOpacity>
                  </View>
                      
              </Animated.View>
            </ScrollView>
          </Modal>}

          {/* VALIDATE REPORT MODAL */}
          {validateCrimeVisible && role.privilege == 1 &&
          <Modal>
            <ScrollView contentContainerStyle={{display: "flex", flexDirection: "column", width: "100%", backgroundColor: "#115272"}}>
              
              <View style = {{backgroundColor: "#115272"}}>
                <Text style={{fontSize: 50, fontWeight: "bold", color: "#FFF", textAlign: "center", marginVertical: "2.5%"}}>Validate Report</Text>
              </View>
              
              <Animated.View
                style={[{transform: [{ translateX: contentPosition }]}, {
                  marginHorizontal: "auto",    
                  backgroundColor: "white",
                  borderRadius: 30,
                  width: "50%",
                  marginBottom: "2.5%",
                  paddingHorizontal: "5%",
                  paddingVertical: "2.5%"
                  }]}>

                  <Text style = {{color: "#115272", fontSize: subtitle, fontWeight: "bold"}}>Reporter's Username:</Text>
                  <TextInput
                    style={{borderWidth: 3, borderColor: "#115272", borderRadius: 5, padding: 10, marginBottom: 10, width: "100%", color: "#115272"}}
                    value={name ?? ""}
                    editable={true}
                    aria-disabled
                  />
                  <Text style = {{color: "#115272", fontSize: subtitle, fontWeight: "bold"}}>Select Incident Type:</Text>
                  <Text
                    style={{borderWidth: 3, borderColor: "#115272", borderRadius: 5, padding: 10, marginBottom: 10, width: "100%",}}>
                      {selectedValue?.label}
                  </Text>
                  <Text style = {{color: "#115272", fontSize: subtitle, fontWeight: "bold"}}>Location:</Text>
                  <TouchableOpacity style={{borderWidth: 3, borderColor: "#115272", borderRadius: 5, padding: 10, marginBottom: 10, width: "100%", flexDirection: "row", alignItems: "center"}}
                  onPress={() => {setAdminGeoLocateVisible(true)}}>
                    <Ionicons name="locate" size = {subtitle} color="#115272"/>
                    <Text style = {{color: "#115272", fontSize: subtitle, marginLeft: "2.5%"}}>{location}</Text>
                  </TouchableOpacity>
                  <Text style = {{color: "#115272", fontSize: subtitle, fontWeight: "bold"}}>Date and Time Happened:</Text>
                  <View style={{ width: 250, marginHorizontal: "auto", marginVertical: "2.5%"}}>
                    <DatePicker
                      selected={timeOfCrime}
                      onChange={(date) => setTimeOfCrime(date)}
                      maxDate={new Date()}
                      minDate={minDate}
                      showTimeInput
                      showMonthYearDropdown
                      inline
                    />
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      width: "100%",
                      justifyContent: "center",
                    }}>
                    <Text
                      style={{borderWidth: 3, borderColor: "#115272", borderRadius: 5, padding: 10, marginBottom: 10, width: "50%", color: "#115272",}}>
                      {timeOfCrime ? formatDate(timeOfCrime, "MMMM dd, yyyy") : "Unknown date"}
                    </Text>
                    <Text
                      style={{borderWidth: 3, borderColor: "#115272", borderRadius: 5, padding: 10, marginBottom: 10, width: "50%", color: "#115272",}}>
                      {timeOfCrime ? formatDate(timeOfCrime, "hh:mma") : "Unknown date"}
                    </Text> 
                  </View>
                  <Text style = {{color: "#115272", fontSize: subtitle, fontWeight: "bold"}}>Additional Information:</Text>
                  <TextInput
                    style={{borderWidth: 3, borderColor: "#115272", borderRadius: 5, padding: 10, marginBottom: 10, width: "100%", color: "#115272",}}
                    multiline
                    numberOfLines={4}
                    value={additionalInfo}
                    onChangeText={setAdditionalInfo}
                    placeholder={
                      "Additional Information (e.g: suspects involved, witnesses, names, sequence of events, description of area, etc.)"
                    }
                    placeholderTextColor={"#8c8c8c"}
                  />
                  <Text style = {{color: "#115272", fontSize: subtitle, fontWeight: "bold", textAlign: "center"}}>Image Upload:</Text>
                  <Text>{imageFilename}</Text>

                  <View style={webstyles.imageInputContainer}>
                    <View style={webstyles.imageContainer}>
                      <ImageViewer
                        imgSource={PlaceholderImage}
                        selectedImage={selectedImage}
                      />
                    </View>
                  </View>
                  <View style={webstyles.buttonContainereditReport}>

                    <TouchableOpacity
                      style={webstyles.cancelButtoneditReport}
                      onPress={() => {
                        resetData();
                        setValidateCrimeVisible(false);
                      }}
                    >
                      <Text style={webstyles.buttonTexteditReport}>CANCEL</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{
                        backgroundColor: "#DA4B46", // Red color for penalize
                        paddingVertical: 10, // Vertical padding for more height
                        paddingHorizontal: 20, // Horizontal padding for more width
                        borderRadius: 20, // Increased radius for capsule shape
                        flex: 1,
                        alignItems: "center", // Center the text
                      }}
                      onPress={()=> {
                        handlePenalizeUser();
                        resetData();
                      }}
                    >
                      <Text style={[webstyles.buttonTexteditReport, { color: "#FFF" }]}>
                        PENALIZE USER
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={webstyles.buttonContainereditReport}>
                    <TouchableOpacity
                      style={webstyles.submitButtoneditReport}
                      onPress={() => {
                        handleArchiveCrime();
                        resetData();
                      }}
                    >
                      <Text style={[webstyles.buttonTexteditReport, {color: "#FFF"}]}>ARCHIVE CRIME</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={webstyles.submitButtoneditReport}
                      onPress={()=> {
                        handleValidateCrime()
                        resetData();
                      }}
                    >
                      <Text style={[webstyles.buttonTexteditReport, { color: "#FFF" }]}>
                        VALIDATE CRIME
                      </Text>
                    </TouchableOpacity>
                  </View>
                      
              </Animated.View>
            </ScrollView>
          </Modal>}

          {/* RECORD CRIME MODAL */}
          {recordCrimeVisible && role.privilege == 1 &&
          <Modal>
            <ScrollView contentContainerStyle={{display: "flex", flexDirection: "column", width: "100%", backgroundColor: "#115272"}}>
              
              <View style = {{backgroundColor: "#115272"}}>
                <Text style={{fontSize: 50, fontWeight: "bold", color: "#FFF", textAlign: "center", marginVertical: "2.5%"}}>Record a Crime</Text>
              </View>
              
              <Animated.View
                style={[{transform: [{ translateX: contentPosition }]}, {
                  marginHorizontal: "auto",    
                  backgroundColor: "white",
                  borderRadius: 30,
                  width: "50%",
                  marginBottom: "2.5%",
                  paddingHorizontal: "5%",
                  paddingVertical: "2.5%"
                  }]}>

                  <Text style = {{color: "#115272", fontSize: subtitle, fontWeight: "bold"}}>Select Incident Type:</Text>
                  <DropDownPicker
                    style={{borderWidth: 3, borderColor: "#115272", borderRadius: 5, padding: 10, marginBottom: 10, width: "100%",}}
                    open={open}
                    value={value}
                    items={items}
                    setOpen={setOpen}
                    setValue={setValue}
                    setItems={setItems}
                    placeholder="Select Crime Type:"
                    onChangeValue={(selectedValue) => {
                      const selectedItem = items.find(
                        (item) => item.value === selectedValue
                      );
                      setSelectedValue(selectedItem);
                    }}
                  />
                  <Text style = {{color: "#115272", fontSize: subtitle, fontWeight: "bold"}}>Location:</Text>
                  <TouchableOpacity style={{borderWidth: 3, borderColor: "#115272", borderRadius: 5, padding: 10, marginBottom: 10, width: "100%", flexDirection: "row", alignItems: "center"}}
                  onPress={() => {setGeoLocateVisible(true)}}>
                    <Ionicons name="locate" size = {subtitle} color="#115272"/>
                    <Text style = {{color: "#115272", fontSize: subtitle, marginLeft: "2.5%"}}>{location}</Text>
                  </TouchableOpacity>
                  <Text style = {{color: "#115272", fontSize: subtitle, fontWeight: "bold"}}>Date and Time Happened:</Text>
                  <View style={{ width: 250, marginHorizontal: "auto", marginVertical: "2.5%"}}>
                    <DatePicker
                      selected={timeOfCrime}
                      onChange={(date) => setTimeOfCrime(date)}
                      maxDate={new Date()}
                      minDate={minDate}
                      showTimeInput
                      showMonthYearDropdown
                      inline
                    />
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      width: "100%",
                      justifyContent: "center",
                    }}>
                    <Text
                      style={{borderWidth: 3, borderColor: "#115272", borderRadius: 5, padding: 10, marginBottom: 10, width: "50%", color: "#115272",}}>
                      {timeOfCrime ? formatDate(timeOfCrime, "MMMM dd, yyyy") : "Unknown date"}
                    </Text>
                    <Text
                      style={{borderWidth: 3, borderColor: "#115272", borderRadius: 5, padding: 10, marginBottom: 10, width: "50%", color: "#115272",}}>
                      {timeOfCrime ? formatDate(timeOfCrime, "hh:mma") : "Unknown date"}
                    </Text> 
                  </View>
                  <Text style = {{color: "#115272", fontSize: subtitle, fontWeight: "bold"}}>Additional Information:</Text>
                  <TextInput
                    style={{borderWidth: 3, borderColor: "#115272", borderRadius: 5, padding: 10, marginBottom: 10, width: "100%", color: "#115272",}}
                    multiline
                    numberOfLines={4}
                    value={additionalInfo}
                    onChangeText={setAdditionalInfo}
                    placeholder={
                      "Additional Information (e.g: suspects involved, witnesses, names, sequence of events, description of area, etc.)"
                    }
                    placeholderTextColor={"#8c8c8c"}
                  />

                  <View style={webstyles.buttonContainereditReport}>
                    <TouchableOpacity
                      style={webstyles.cancelButtoneditReport}
                      onPress={() => {
                        resetData();
                        setRecordCrimeVisible(false);
                      }}
                    >
                      <Text style={webstyles.buttonTexteditReport}>CANCEL</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={webstyles.submitButtoneditReport}
                      onPress={handleRecord}
                    >
                      <Text style={[webstyles.buttonTexteditReport, { color: "#FFF" }]}>
                        SUBMIT
                      </Text>
                    </TouchableOpacity>
                  </View>
                      
              </Animated.View>
            </ScrollView>
          </Modal>}

          {/* GEOLOCATION MODAL */}
          {role.privilege == 0 && geoLocateVisible && 
          <Modal
            visible={geoLocateVisible}
            transparent={true}
            animationType="slide"
            hardwareAccelerated>
              <View style = {{width: "100%", height: "100%", backgroundColor: "#FFF", alignItems:"center", alignSelf: "center", marginVertical: "auto", borderRadius: 5}}>
                
                {/* GEOLOCATION MAP */}
                <View style = {{width: "100%", height: "75%"}}>
                  <APIProvider
                  apiKey={"AIzaSyDoWF8JDzlhT2xjhuInBtMmkhWGXg2My0g"}
                  region="PH">
                    <Map
                      id = "geoLocateMap"
                      defaultCenter={position}
                      disableDoubleClickZoom={true}
                      defaultZoom={15}
                      mapId="5cc51025f805d25d"
                      mapTypeControl={true}
                      streetViewControl={false}
                      mapTypeId="roadmap"
                      scrollwheel={true}
                      disableDefaultUI={false}
                      minZoom={14}
                      maxZoom={18}
                      onZoomChanged={(event) => {
                        const coords = event.map.getCenter();
                        const lat = coords?.lat();
                        const lng = coords?.lng();
                        setGeoMarkerPos({lat: lat || 0, lng: lng || 0});
                      }}
                      onDrag={(event) => {
                        const coords = event.map.getCenter();
                        const lat = coords?.lat();
                        const lng = coords?.lng();
                        setGeoMarkerPos({lat: lat || 0, lng: lng || 0});
                      }}
                      onIdle={(event) => {
                        console.log("Map is idle");
                        const coords = event.map.getCenter();
                        const lat = coords?.lat();
                        const lng = coords?.lng();
                        setLocationLoading(true);
                        setTimeout(() => {
                          setGeoLocation(new GeoPoint(lat || 0, lng || 0));
                          Geocoder.from(lat || 0, lng || 0)
                          .then(json => {
                              setLocation(json.results[0].formatted_address);
                              setLocationLoading(false);
                          })
                          .catch(error => console.warn(error));
                        }, 1000);
                      }}>
                       <AdvancedMarker
                       position={geoMarkerPos}
                       />
                      
                      <PlacesLibrary />
                    
                    </Map>
                  </APIProvider>
                </View>

                {/* GEOLOCATION INFO PANEL */}
                <View style = {{width: "100%", height: "25%", backgroundColor: "#115272", justifyContent: "center", alignItems: "center"}}>

                <Text style = {{width: "50%", borderRadius: 50, fontSize: subtitle, fontWeight: "bold", color: "#FFF", textAlign: "center"}}>Pan the map to pin the location.</Text>
                
                <View style = {{ width: "50%", backgroundColor: "#FFF", borderWidth: 3, borderColor: "#115272", borderRadius: 50, paddingHorizontal: "2.5%", paddingVertical: "1%", marginVertical: "1%"}}>
                  {!locationLoading ? 
                    <View style = {{borderRadius: 50}}>
                      <Text style = {{borderRadius: 50, fontWeight: "bold", fontSize: body, color: "#115272", textAlign: "left", }}>{location}</Text>
                    </View>
                  : 
                  <ActivityIndicator style = {{marginHorizontal: "auto"}} size="small" color="#115272"/>
                  }
                </View>

                <TouchableOpacity onPress={() => {
                  if(locationLoading == false) {
                  setGeoLocateVisible(false)
                  } else {
                    Alert.alert("Loading location", "Please wait for the location to load before confirming.");
                  }
                  }} style = {{width: "25%", height: "25%", backgroundColor: "#FFF", paddingHorizontal: "2.5%", paddingVertical: "1.5%", borderRadius: 50, justifyContent: "center"}}>{!locationLoading ? <Text style = {{textAlign: "center", color: "#115272", fontWeight: "bold"}}>Confirm</Text> : <ActivityIndicator style = {{marginHorizontal: "auto"}} size="small" color="#115272"/>}</TouchableOpacity>
                </View>
              </View>
          </Modal>}

          {/* ADMIN GEOLOCATION MODAL */}
          {role.privilege == 1 && adminGeoLocateVisible && 
          <Modal
            visible={adminGeoLocateVisible}
            transparent={true}
            animationType="slide"
            hardwareAccelerated>
              <View style = {{width: "100%", height: "100%", backgroundColor: "#FFF", alignItems:"center", alignSelf: "center", marginVertical: "auto", borderRadius: 5}}>
                
                {/* GEOLOCATION MAP */}
                <View style = {{width: "100%", height: "75%"}}>
                  <APIProvider
                  apiKey={"AIzaSyDoWF8JDzlhT2xjhuInBtMmkhWGXg2My0g"}
                  region="PH">
                    <Map
                      id = "adminGeoLocateMap"
                      defaultCenter={position}
                      disableDoubleClickZoom={true}
                      defaultZoom={15}
                      mapId="5cc51025f805d25d"
                      mapTypeControl={true}
                      streetViewControl={false}
                      mapTypeId="roadmap"
                      scrollwheel={true}
                      disableDefaultUI={false}
                      minZoom={14}
                      maxZoom={18}>
                       <AdvancedMarker
                       position={geoMarkerPos}
                       />
                      
                      <PlacesLibrary />
                    
                    </Map>
                  </APIProvider>
                </View>

                {/* GEOLOCATION INFO PANEL */}
                <View style = {{width: "100%", height: "25%", backgroundColor: "#115272", justifyContent: "center", alignItems: "center"}}>

                <Text style = {{width: "50%", borderRadius: 50, fontSize: subtitle, fontWeight: "bold", color: "#FFF", textAlign: "center"}}>Pan the map to pin the location.</Text>
                
                <View style = {{ width: "50%", backgroundColor: "#FFF", borderWidth: 3, borderColor: "#115272", borderRadius: 50, paddingHorizontal: "2.5%", paddingVertical: "1%", marginVertical: "1%"}}>
                  {!locationLoading ? 
                    <View style = {{borderRadius: 50}}>
                      <Text style = {{borderRadius: 50, fontWeight: "bold", fontSize: body, color: "#115272", textAlign: "left", }}>{location}</Text>
                    </View>
                  : 
                  <ActivityIndicator style = {{marginHorizontal: "auto"}} size="small" color="#115272"/>
                  }
                </View>

                <TouchableOpacity onPress={() => {
                  if(locationLoading == false) {
                  setAdminGeoLocateVisible(false)
                  } else {
                    Alert.alert("Loading location", "Please wait for the location to load before confirming.");
                  }
                  }} style = {{width: "25%", height: "25%", backgroundColor: "#FFF", paddingHorizontal: "2.5%", paddingVertical: "1.5%", borderRadius: 50, justifyContent: "center"}}>{!locationLoading ? <Text style = {{textAlign: "center", color: "#115272", fontWeight: "bold"}}>Back</Text> : <ActivityIndicator style = {{marginHorizontal: "auto"}} size="small" color="#115272"/>}</TouchableOpacity>
                </View>
              </View>
          </Modal>}

          {/* ADD REPORT FAB */}
          {role.privilege == 0 &&<TouchableOpacity
            style={webstyles.fab}
            onPress={() => {
              setAddReportVisible(true);
              console.log(isAddReportVisible);
            }}
          >
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "center",
                gap: 20,
              }}
            >
              <Text
                style={{
                  alignSelf: "center",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: 20,
                }}>
                Add a report
              </Text>
              <View style={{ alignSelf: "center" }}>
                <Ionicons name="add" size={30} color="white" />
              </View>
            </View>
          </TouchableOpacity>}

          {/* RECORD CRIME FAB */}
          {role.privilege == 1 && <TouchableOpacity
          style={webstyles.fab}
          onPress={() => {setRecordCrimeVisible(true);}}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "center",
              gap: 20,
            }}
          >
            <Text
              style={{
                alignSelf: "center",
                color: "white",
                fontWeight: "bold",
                fontSize: 20,
              }}
            >
              Add a crime
            </Text>
            <View style={{ alignSelf: "center" }}>
              <Ionicons name="add" size={30} color="white" />
            </View>
          </View>
          </TouchableOpacity>}

        </>
      );
    }
  }

function uploadBytesResumable(reference: StorageReference, file: File, metadata: UploadMetadata) {
  return new Promise((resolve, reject) => {
    const uploadTask = firebaseUploadBytesResumable(reference, file, metadata);
    uploadTask.on(
      "state_changed",
      null,
      (error) => reject(error),
      () => resolve(uploadTask.snapshot)
    );
  });
}
  
const style = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterSheetItem: {
    width: 130,
    height: "100%",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
  },
  filterSheetImageContainer: {
    width: "75%",
    aspectRatio: 1,
    backgroundColor: "#DA4B46",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderRadius: 10,
    borderColor: "#FFF",
  },
  filterSheetImage: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  filterSheetItemTitle: {
    width: "100%",
    height: "25%",
    marginTop: 10,
    textAlign: "center",
    verticalAlign: "top",
  },
  button: {
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    height: "50%",
    width: "50%",
    borderRadius: 15,
    backgroundColor: "#115272",
  },
  buttonText: {
    color: "white",
  },
  calendarHeader: {
    color: "#FFF",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "50%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: "center",
  },
});
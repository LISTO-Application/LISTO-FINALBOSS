// React Imports
import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, ScrollView, 
    Platform, Animated, Dimensions, FlatList, Modal, 
    TouchableWithoutFeedback, 
    ActivityIndicator} from "react-native";
import Geocoder from 'react-native-geocoding';

// Expo Imports
import * as DocumentPicker from "expo-document-picker"; // For mobile file selection
import { router } from "expo-router";

// Firebase Imports
import { db } from "@/app/FirebaseConfig";
import { Timestamp } from "@react-native-firebase/firestore";
import { GeoPoint as FirestoreGeoPoint, GeoPoint } from "firebase/firestore";
import "firebase/database";
import { collection, getDocs, addDoc, firebase } from "@react-native-firebase/firestore";

// Map Imports
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";

// Utility Imports
import { format, set } from "date-fns";
import * as XLSX from "xlsx";
import { v4 as uuidv4 } from "uuid";

// Hooks
import useResponsive from "@/hooks/useResponsive";

// Component Imports
import PaginationReport from "@/components/PaginationReport";
import Ionicons from "@expo/vector-icons/Ionicons";
import {MotiView} from "moti"
import { FontAwesome6, MaterialIcons } from "@expo/vector-icons";

// Style Imports
import { webstyles } from "@/styles/webstyles"; // For web styles
import { SpacerView } from "@/components/SpacerView";
import { authWeb } from "../(auth)";


export default function ViewAdminEmergencyList() {

  const { display, subDisplay, title, subtitle, body, small } = useResponsive();

    // ARRAY STATES
    interface Distress {
      id: string;
      acknowledged: boolean;
      addInfo: string;
      barangay: string;
      address: string;
      emergencyType: { fire: boolean; crime: boolean; injury: boolean };
      location: GeoPoint;
      timestamp: number;
    }
    
    const [role, setRole] = useState({privilege: 0});

    const [distress, setDistresses] = useState<Distress[]>([]);
    const [filteredDistress, setFilteredDistress] = useState<Distress[]>([]);

    // QUERY STATES
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

    // MODAL STATES
    const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
    const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);

    // EMERGENCY DETAIL STATES
    const [distressDetails, setDistressDetails] = useState<Distress | null>(null);
    const [detailsVisible, setDetailsVisible] = useState(false);
    const [address, setAddress] = useState<string | null>(null);

    // LOADING STATES
    const [loading, setLoading] = useState(false);

    // FETCH DATA FOR ADMIN (ADD CONDITIONAL FOR ADMIN)
    const setupDistress = async () => {
        try {
          const auth = authWeb;
          const authID = auth.currentUser;

          await authID?.getIdTokenResult()
          .then(async (token) => {
            if (token.claims.admin == true) {
              setRole({privilege: 1});
              const distressCollectionRef = collection(db, "distress");
              const distressSnapshot = await getDocs(distressCollectionRef);
              if (distressSnapshot.empty) {
              console.log("No incidents found in Firestore.");
              return;
              }
              // Process records from Firestore without geocoding.
              const distressArray = await Promise.all(distressSnapshot.docs.map(async (doc) => {
              const data = doc.data();
              let coord = data.location;
              let place = "";
              await Geocoder.from(coord.latitude, coord.longitude)
              .then(json => {
                  place = json.results[0].formatted_address;
              })
              // Handle GeoPoint or plain object coordinates
              let coordinate = data.coordinate;
              if (coordinate instanceof FirestoreGeoPoint) {
                  // If the coordinate is a GeoPoint (Firestore GeoPoint)
                  coordinate = {
                  latitude: coordinate.latitude,
                  longitude: coordinate.longitude,
                  };
              } else {
                  // If it's a plain object or not available, use default coordinates
                  coordinate = coordinate || { latitude: 0, longitude: 0 };
              }
              return {
                  id: doc.id,
                  acknowledged: data.acknowledged || false,
                  addInfo: data.addInfo || "No additional info",
                  address: place || "Unknown address",
                  barangay: data.barangay || "Unknown",
                  emergencyType: data.emergencyType || { fire: false, crime: false, injury: false },
                  location: data.location || "Unknown location",
                  timestamp: data.timestamp || null,
              };
              }));
  
              console.log("Mapped Distresses:", distressArray);
              setTimeout(() => {
                setDistresses(distressArray);
                setFilteredDistress(distressArray);
              }, 3000)
            } else if (token.claims.user == true) {
              setRole({privilege: 0});
            }
          });  

        } catch (error) {
            console.error("Error fetching distresses:", error);
        }
    };
    useEffect(() => {
      Geocoder.init("AIzaSyDoWF8JDzlhT2xjhuInBtMmkhWGXg2My0g");
      setupDistress();
    }, []);

    // GEOCODE ADDRESS
    async function geocodeAddress(address: string): Promise<FirestoreGeoPoint | null> {
        if (!address || address.trim() === "") {
            console.warn("Empty or invalid address provided.");
            return null;
        }
        // GEO CODING API
        const apiKey = "AIzaSyDoWF8JDzlhT2xjhuInBtMmkhWGXg2My0g";
        const encodedAddress = encodeURIComponent(address);
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&region=PH&key=${apiKey}`;
        console.log(`Geocoding request for address: ${address}`);
        try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(
            `Geocoding API request failed with status ${response.status}`
            );
            return null;
        }
        const data = await response.json();
        console.log("Geocoding API response:", data);
        if (data.status === "OK" && data.results.length > 0) {
            const { lat, lng } = data.results[0].geometry.location;
            console.log(
            `Geocoding succeeded, coordinates: Latitude ${lat}, Longitude ${lng}`
            );
            return new firebase.firestore.GeoPoint(lat, lng);
        } else {
            console.error("Geocoding failed or returned no results:", data);
            return null;
        }
        } catch (error) {
        console.error("Error occurred during geocoding:", error);
        return null;
        }
    };

  //Animation to Hide side bar
  const contentPosition = useRef(new Animated.Value(0)).current;
  const [isAlignedRight, setIsAlignedRight] = useState(false);

  // Import GeoPoint from Firebase Firestore

  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 10;
  const currentDistress = filteredDistress.slice(
    (currentPage - 1) * reportsPerPage,
    currentPage * reportsPerPage
  );

  const filterReports = (searchQuery: string, barangay: string | null) => {
    let filtered = distress;

    if (barangay) {
      filtered = filtered.filter(
        (distress: { barangay: string }) => distress.barangay === barangay
      );
    }

    if (searchQuery) {
      filtered = filtered.filter((distress) => {
        const query = searchQuery.toLowerCase();
        return (
          distress.barangay.includes(query) ||
          distress.timestamp?.toString().includes(query)
        );
      });
    }

    setFilteredDistress(filtered); // Update the filtered reports state
  };
  // Handle category selection from the modal
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category); // Set the selected category
    setCategoryModalVisible(false); // Close the modal
    filterReports(searchQuery, category); // Apply the category filter along with the current search query
  };

  if (Platform.OS === "android") {
    return (
      // <View style={webstyles.mainContainer}>
      //   {/* Header */}
      //   <View style={webstyles.headerContainer}>
      //     <TouchableOpacity
      //       onPress={() => router.back()}
      //       style={webstyles.backIcon}
      //     >
      //       <Ionicons name="arrow-back" size={24} color="white" />
      //     </TouchableOpacity>
      //     <Text style={webstyles.headerText}>Distress Messages (ADMINS)</Text>
      //   </View>

      //   <ScrollView contentContainerStyle={webstyles.scrollViewContent}>
      //     {distress.map((distress) => (
      //       <View key={report.id}>
      //         {/* Report content */}
      //         <View style={webstyles.reportContainer}>
      //           <View style={webstyles.reportIcon}>
      //             <Ionicons
      //               name={
      //                 report.category === "homicide" ? "alert-circle" : "alert"
      //               }
      //               size={24}
      //               color="white"
      //             />
      //           </View>

      //           <View style={webstyles.reportTextContainer}>
      //             {/* Title wrapped in TouchableOpacity for navigation */}
      //             <TouchableOpacity onPress={() => {
      //               //handleTitlePress(report.id)
      //               }}>
      //               <Text style={webstyles.reportTitle}>{report.category}</Text>
      //             </TouchableOpacity>
      //             <Text style={webstyles.reportDetails}>{report.additionalInfo}</Text>
      //           </View>

      //           {/* Status badge */}
      //           <View style={webstyles.statusContainer}>
      //             <Text
      //               style={[
      //                 webstyles.statusBadge,
      //                 getStatusStyle(report.status),
      //               ]}
      //             >
      //               {report.status}
      //             </Text>
      //           </View>

      //           {/* Approve and Reject buttons */}
      //           {report.status === 1 ? (
      //             <View style={styles.actionContainer}>
      //               <TouchableOpacity
      //                 style={webstyles.approveButton}
      //                 onPress={() => handleApprove(report.id)}
      //               >
      //                 <Text style={webstyles.buttonText}>Validate</Text>
      //               </TouchableOpacity>
      //               <TouchableOpacity
      //                 style={webstyles.rejectedButton}
      //                 onPress={() => handleReject(report.id)}
      //               >
      //                 <Text style={webstyles.buttonText}>Archive</Text>
      //               </TouchableOpacity>
      //             </View>
      //           ) : report.status === 2 ? (
      //             <TouchableOpacity
      //               style={webstyles.approvedButton}
      //               onPress={() => {
      //                 /* Optional: Add any action for approved state */
      //               }}
      //             >
      //               <Text style={webstyles.approvedButtonText}>Validated</Text>
      //             </TouchableOpacity>
      //           ) : report.status === 0 ? (
      //             <TouchableOpacity
      //               style={webstyles.rejectedButton}
      //               onPress={() => {
      //                 /* Optional: Add any action for rejected state */
      //               }}
      //             >
      //               <Text style={webstyles.rejectedButtonText}>Archived</Text>
      //             </TouchableOpacity>
      //           ) : null}
      //         </View>
      //       </View>
      //     ))}
      //   </ScrollView>
      // </View>
      null
    );
  } else if (Platform.OS === "web") {

    if (role.privilege == 1) {
      
    return (
      <View style={webstyles.container}>
        <Animated.View
          style={[{    
            backgroundColor: "#DA4B46", // White background for the main part
            padding: 20,
            width: "80%",
            flex: 1,},{ transform: [{ translateX: contentPosition }] },]}>

          {/* EMERGENCY LIST */}
          <ScrollView
            contentContainerStyle={[
              {
                padding: 20,
                borderRadius: 10,
                margin: 5,
              },
              isAlignedRight && { width: "75%" },
            ]}
            style = {{marginVertical: "2.5%"}}
          >
            {currentDistress.map((distress, index) => {
            return (
              <MotiView from = {{translateX: 500}} animate={{translateX: 0}} key={index}>
                <TouchableOpacity style = {{width: "98%", height: "auto", flexDirection: "row", backgroundColor: "#FFF", borderColor: "#FFF", borderWidth: 5, borderRadius: 5, marginHorizontal: "auto", marginVertical: "0.5%", opacity: distress.acknowledged ? 0.75 : 1}} onPress={() => {
                  setDistressDetails(distress);
                  setTimeout(() => {
                    console.log("TUBOOOOOOOOOOOOOOOOOOOOOOOOL")
                    // if (mapRef.current) {
                    //   mapRef.current.setMapBoundaries(
                    //     mapBoundaries.northEast,
                    //     mapBoundaries.southWest
                    //   ); 
                    //   setTimeout(() => {
                    //     mapRef.current?.fitToCoordinates([{latitude: distress.location?.latitude ?? 0, longitude: distress.location?.longitude ?? 0}]);
                    //   }, 3000);
                    // }
                  }, 1000);
                  setDetailsVisible(true);
                }}>
                  {distress.emergencyType.fire == true &&
                  <View style = {{width: "5%",  aspectRatio: 1/1, justifyContent: "center", alignItems: "center", backgroundColor: "#DA4B46", borderRadius: 5, marginRight: "2.5%", marginVertical: "auto"}}>
                    <Ionicons name="flame-outline" size={title} color="#FFF"/> 
                  </View>}
                  {distress.emergencyType.crime == true &&
                  <View style = {{width: "5%",  aspectRatio: 1/1, justifyContent: "center", alignItems: "center", backgroundColor: "#DA4B46", borderRadius: 5, marginRight: "2.5%", marginVertical: "auto"}}>
                    <FontAwesome6 name="gun" size={title} color="#FFF"/>
                  </View>}
                  {distress.emergencyType.injury == true &&
                  <View style = {{width: "5%",  aspectRatio: 1/1, justifyContent: "center", alignItems: "center", backgroundColor: "#DA4B46", borderRadius: 5, marginRight: "2.5%", marginVertical: "auto"}}>
                    <MaterialIcons name="personal-injury" size={title} color="#FFF"/>
                  </View>}
                  <View style = {{width: "auto", maxWidth: "80%", flexDirection: "column", justifyContent: "flex-start"}}>
                      <Text style = {{fontSize: body, fontWeight: "bold", color: "#DA4B46"}}>{distress.barangay == "HS" ? "Holy Spirit" : "Matandang Balara"}</Text>
                      <Text style = {{fontSize: small, fontWeight: "500", color: "#DA4B46"}}>{distress.address}</Text>
                  </View>
                </TouchableOpacity>
              </MotiView>
            );
          }) }

          </ScrollView>

        {/* EMERGENCY DETAILS MODAL*/}
        {detailsVisible && 
          <>
            <Modal style = {{position: "absolute", width: '100%', height: '100%', flexDirection: "column", backgroundColor: '#DA4B46', justifyContent: "flex-start", alignItems: "center", marginTop: "3.5%"}} >
              <View style={{backgroundColor: '#DA4B46', height: "12%", paddingVertical: 15, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'flex-end', width: "100%", }}>
              <SpacerView height={display} />
                {distressDetails?.emergencyType.fire == true && <View style = {{width: "5%", aspectRatio: 1/1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFF", borderRadius: 5, marginRight: "2.5%", marginVertical: "auto"}}>
                    <Ionicons name="flame-outline" size={title} color="#DA4B46"/> 
                  </View>}
                {distressDetails?.emergencyType.crime == true && <View style = {{width: "5%", aspectRatio: 1/1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFF", borderRadius: 5, marginRight: "2.5%", marginVertical: "auto"}}>
                    <FontAwesome6 name="gun" size={title} color="#DA4B46"/>
                  </View>}
                {distressDetails?.emergencyType.injury == true && <View style = {{width: "5%", aspectRatio: 1/1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFF", borderRadius: 5, marginRight: "2.5%", marginVertical: "auto"}}>
                    <MaterialIcons name="personal-injury" size={title} color="#DA4B46"/>
                  </View>}
                <View style = {{width: "100%", flexDirection: "column"}}>
                  <Text style = {{ color: "#FFF", fontWeight: 'bold', fontSize: subDisplay, marginHorizontal: "2.5%"}}>
                    {distressDetails?.barangay == "HS" ? "Holy Spirit" : "Matandang Balara"}
                  </Text>
                    <Text style = {{ color: "#FFF", fontWeight: 'bold', fontSize: body, marginHorizontal: "2.5%"}}>
                      {distressDetails?.emergencyType.crime && "Violent Crime"} 
                      {distressDetails?.emergencyType.fire && "(Active Fire)"}
                      {distressDetails?.emergencyType.injury && "(Serious Injury)"}
                    </Text>
                </View>
              </View>

              <APIProvider
                  apiKey={"AIzaSyDoWF8JDzlhT2xjhuInBtMmkhWGXg2My0g"}
                  region="PH">
                <Map
                style={{width: "100%", height: "65%"}}
                  id = "geoLocateMap"
                  defaultCenter={{
                    lat: distressDetails?.location?.latitude || 0, 
                    lng: distressDetails?.location?.longitude || 0}}
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

                {distressDetails?.location?.latitude && distressDetails?.location?.longitude && (
                  <AdvancedMarker 
                  position={{ 
                    lat: distressDetails?.location?.latitude, 
                    lng: distressDetails?.location?.longitude }} />
                )}
                </Map>
              </APIProvider>

              <View style = {{justifyContent: "center", alignItems: "center", width: "100%", height:"auto", backgroundColor: "#DA4B46",}}>
                <View style = {{width: "50%", height:"15%", backgroundColor: "#FFF", flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: "2%", marginVertical: "1%", borderRadius: 10}}>
                  <Text style = {{ color: "#DA4B46", fontWeight: 'bold', fontSize: body, marginHorizontal: "2.5%"}}>{distressDetails?.addInfo}</Text>
                </View>
                <View style = {{width: "50%", height:"10%", flexDirection: "row", justifyContent: "space-between", backgroundColor: "#DA4B46"}}>
                <TouchableOpacity style={{width: "25%", marginTop: "1%", backgroundColor: "#115272", justifyContent: "center", borderRadius: 10, paddingVertical: "2.5%", }} 
                  onPress={async () => {
                    setLoading(true);
                    await firebase.firestore().collection("distress").doc(distressDetails?.id)
                      .update({acknowledged: true})
                      .then(() => {
                        setDetailsVisible(false);
                        setDistressDetails({} as Distress);
                        setLoading(false);
                      })
                  }}>
                    {!loading ?
                    <Text style={{color: "#FFF", fontSize: subtitle, fontWeight: "bold", textAlign: "center"}}>
                      Acknowledge
                    </Text>
                    :
                    <ActivityIndicator style = {{marginHorizontal: "auto"}} size="small" color="#FFF"/>}
                  </TouchableOpacity>
                  <TouchableOpacity style={{width: "25%", marginTop: "1%", backgroundColor: "#FFF", justifyContent: "center", borderRadius: 10, paddingVertical: "2.5%", }} 
                  onPress={() => {
                    setDistressDetails({} as Distress);
                    setDetailsVisible(false);
                  }}>
                    {!loading ?
                    <Text style={{color: "#DA4b46", fontSize: subtitle, fontWeight: "bold", textAlign: "center"}}>
                      Back
                    </Text>
                    :
                    <ActivityIndicator style = {{marginHorizontal: "auto"}} size="small" color="#FFF"/>}
                  </TouchableOpacity>
                </View>
              <SpacerView height={display} />
            </View>
          </Modal>
          </>
        }

          {/* PAGE FLIPPER */}
          <PaginationReport
            filteredReports={filteredDistress}
            reportsPerPage={reportsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            isAlignedRight={isAlignedRight}
          />
        </Animated.View>

      </View>
    );
    } else if (role.privilege == 0) {
      router.replace({pathname: "/(tabs)/crimemap"});
      return (
        <View style = {{width: "100%", height: "100%", justifyContent: "center"}}>
          <Text style = {{color: "#115272", fontWeight: "bold", fontSize: display, textAlign: "center"}}>Not Privileged</Text>
        </View>
      );
    }
  }
}

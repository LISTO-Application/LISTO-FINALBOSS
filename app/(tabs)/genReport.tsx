// React Imports
import React, { useEffect, useState, } from "react";
import { View, Text, TouchableOpacity, 
    Platform,  StyleSheet,
    Image,} from "react-native";

// Expo Imports
import { Image as Img, type ImageSource } from "expo-image";
import * as DocumentPicker from "expo-document-picker"; // For mobile file selection

// Firebase Imports
import { db } from "../FirebaseConfig";
import { authWeb } from "@/app/(auth)";
import {
    collection,
    getDocs,
    addDoc,
    firebase,
    Timestamp,
    FirebaseFirestoreTypes,
    query,
    where
  } from "@react-native-firebase/firestore";
  import { GeoPoint as FirestoreGeoPoint, GeoPoint } from "firebase/firestore";
import { dbWeb } from "../(auth)"; // Adjust the import path to your Firebase config
// Date Imports
import dayjs from "dayjs";
import { format, formatDate, getTime, set, subDays, subYears} from "date-fns";

// Utility Imports
import * as XLSX from "xlsx";
import { v4 as uuidv4 } from "uuid";

// Hooks
import useResponsive from "@/hooks/useResponsive";

// Component Imports
import Ionicons from "@expo/vector-icons/Ionicons";

// Style Imports
import { webstyles } from "@/styles/webstyles";

const repGen = require("../../assets/images/repGen.png");

  export default function Summary({ navigation }: { navigation: any }) {

    interface Report {
        id: string;
        additionalInfo: string;
        category: string;
        coordinate: FirebaseFirestoreTypes.GeoPoint;
        location: string;
        time: string;
        timeOfCrime: Date | null;
        timeReported: Date | null;
        unixTOC: number;
      }
      
    // Responsive Sizes
    const {display, subDisplay, title, subtitle, body, small, tiny, height} = useResponsive()

    const database = dbWeb;

    // AUTH STATE
    const [role, setRole] = useState<{privilege: number | null}>({privilege: null});

    //ARRAY STATES
    const [reports, setReports] = useState<FirebaseFirestoreTypes.QueryDocumentSnapshot[]>([]);
    const [crimes, setCrimes] = useState<Report[]>([]);
    const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  
    const auth = authWeb;
    const authID = auth.currentUser;

    useEffect(() => {
      fetchIncidents();
    }, []);
  
    const fetchIncidents = async () => {
      try {
        const crimesCollectionRef = collection(db, "crimes");
        const crimesSnapshot = await getDocs(crimesCollectionRef);
  
        if (crimesSnapshot.empty) {
          console.log("No incidents found in Firestore.");
          return;
        }
  
        // Process records from Firestore without geocoding.
        const crimesArray = crimesSnapshot.docs.map((doc) => {
          const data = doc.data();
  
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
            additionalInfo: data.additionalInfo || "No additional info",
            category: data.category || "Unknown",
            location: data.location || "Unknown location",
            coordinate: coordinate, // Updated coordinates based on GeoPoint or plain object
            time: data.time || "00:00",
            timeOfCrime:
              data.timeOfCrime instanceof Timestamp
                ? data.timeOfCrime.toDate()
                : new Date(data.timeOfCrime || null),
            timeReported:
              data.timeReported instanceof Timestamp
                ? data.timeReported.toDate()
                : new Date(data.timeReported || null),
            unixTOC: data.unixTOC || 0,
          };
        });
  
        console.log("Mapped Incidents:", crimesArray);
        setCrimes(crimesArray);
        setFilteredReports(crimesArray);
      } catch (error) {
        console.error("Error fetching incidents:", error);
      }
    };

    const parseTime = (timeString: string | null | undefined): Date => {
        // Check if the timeString is missing or null/undefined
        if (!timeString) {
          console.warn("Time of Crime missing, using current time.");
          return new Date(); // Return the current time
        }
    
        // Clean up the time string to handle spaces and case-insensitive matching
        const cleanedTimeString = timeString.trim().toLowerCase();
        // Regex for 12/25/2024 12:30 pm format (handles space between time and am/pm)
        const regex = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{1,2}):(\d{2})\s*(am|pm)$/i;
        const match = cleanedTimeString.match(regex);
    
        if (!match) {
          console.warn(`Invalid time format: ${timeString}, using current time.`);
          return new Date(); // Return the current time if the format is invalid
        }
    
        // Extract date components from matched groups
        const month = parseInt(match[1], 10) - 1; // JavaScript months are 0-based
        const day = parseInt(match[2], 10);
        const year = parseInt(match[3], 10);
        let hour = parseInt(match[4], 10);
        const minute = parseInt(match[5], 10);
        const period = match[6]; // 'am' or 'pm'
    
        // Adjust the hour for 12-hour format (AM/PM)
        if (period === "pm" && hour !== 12) {
          hour += 12;
        } else if (period === "am" && hour === 12) {
          hour = 0; // Midnight case
        }
    
        // Create a Date object using the parsed values
        const date = new Date(year, month, day, hour, minute, 0, 0);
    
        // Check for invalid date
        if (isNaN(date.getTime())) {
          console.warn(`Invalid time format: ${timeString}, using current time.`);
          return new Date(); // Return the current time if the date is invalid
        }
    
        // Convert to UTC and apply Philippine Standard Time (PST) offset
        const utcDate = new Date(date.toUTCString());
        const phOffset = 8 * 60; // Philippines is UTC +8
        utcDate.setMinutes(utcDate.getMinutes() + phOffset);
    
        return utcDate;
        };

    const geocodeAddress = async (
        address: string
        ): Promise<FirestoreGeoPoint | null> => {
        if (!address || address.trim() === "") {
            console.warn("Empty or invalid address provided.");
            return null;
        }
    
        const apiKey = "AIzaSyDoWF8JDzlhT2xjhuInBtMmkhWGXg2My0g"; // Replace with your API key
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
    
    async function handleImport() {
        try {
        const result = await DocumentPicker.getDocumentAsync({
            type: [
            "text/csv",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ],
        });

        if (result.canceled) {
            console.log("File selection was canceled.");
            return;
        }

        const file = result.assets?.[0];
        if (!file?.uri) {
            console.error("No URI found for the selected file.");
            return;
        }

        const response = await fetch(file.uri);
        const data = await response.blob();
        const reader = new FileReader();

        reader.onload = async (event) => {
            const binaryData = event.target?.result;
            if (!binaryData) {
            console.error("Failed to read the file.");
            return;
            }

            const workbook = XLSX.read(binaryData, { type: "binary" });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            const importedReports = await Promise.all(
            jsonData.map(async (item: any) => {
                let timeOfCrime = item["Time of Crime"]
                ? parseTime(item["Time of Crime"])
                : null;
                let timeReported = item["Time Reported"]
                ? parseTime(item["Time Reported"])
                : null;

                if (!timeOfCrime) {
                timeOfCrime = new Date(); // Default to current time
                console.warn(
                    "Time of Crime missing or invalid, using current time."
                );
                }

                if (!timeReported) {
                timeReported = new Date(); // Default to current time
                console.warn(
                    "Time Report missing or invalid, using current time."
                );
                }

                let coordinate: FirebaseFirestoreTypes.GeoPoint | null = null;
                const lat = item["Latitude"] ? parseFloat(item["Latitude"]) : null;
                const lng = item["Longitude"] ? parseFloat(item["Longitude"])
                : null;

                // Check if latitude and longitude exist in the file
                if (lat && lng) {
                  console.error("NO NEED TO GEOCODE PHEWWW")
                coordinate = new FirestoreGeoPoint(lat, lng);
                } else if (item["Location"]) {
                // Geocode the address if coordinates aren't available
                console.error("GEOCODING WHOOPSIES")
                coordinate = await geocodeAddress(item["Location"]);
                }

                if (!coordinate) {
                alert(
                    "Geocoding failed or no coordinates provided, using default coordinates for Barangay Holy Spirit."
                );
                coordinate = new FirestoreGeoPoint(14.6522, 121.0633); // Default coordinates
                }

                // Log coordinate values for debugging
                console.log("Coordinates before formatting:", {
                latitude: coordinate.latitude,
                longitude: coordinate.longitude,
                });

                // Format the coordinates for display or usage

                // Convert the time to Firestore Timestamp
                const timestampOfCrime = Timestamp.fromMillis(
                timeOfCrime.getTime()
                );
                const timestampReported = Timestamp.fromMillis(
                timeReported.getTime()
                );

                const report = {
                additionalInfo: item["Additional Info"] || "No additional info",
                category: item["Category"] || "Unknown",
                location: item["Location"] || "Unknown location",
                time: item["Time"] || "00:00",
                timeOfCrime: timestampOfCrime,
                timeReported: timestampReported,
                coordinate: coordinate, // Store GeoPoint directly
                unixTOC: timestampOfCrime.toMillis()
                };

                console.log("Imported Report Details:", report);
                return report;
            })
            );

            console.log("Total Reports Imported: ", importedReports.length);
            console.log("Imported Reports: ", importedReports);

            const crimesCollection = collection(db, "crimes");

            try {
            const addReportsPromises = importedReports.map(async (report) => {
                console.log("Adding report to Firestore:", report.coordinate);
                // try {
                // await addDoc(crimesCollection, report);
                // } catch (error) {
                // console.error("Error adding report to Firestore:", error);
                // }
            });

            await Promise.all(addReportsPromises);

            alert("Reports successfully added.");
            await fetchIncidents();
            } catch (error) {
            console.error("Error adding reports to Firestore:", error);
            alert("Failed to add reports. Please try again.");
            }
        };

        reader.readAsBinaryString(data);
        } catch (error) {
        console.error("Error during file import:", error);
        alert(
            "An error occurred during file import. Please check the file format."
        );
        }
    };
    
    async function handleCleanup() {
      await firebase.firestore().collection("crimes")
      .where("category", "==", "Unknown")
      .get()
      .then((querySnapshot) => {
        const batch = firebase.firestore().batch();
        querySnapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });
        return batch.commit();
      })
    }
    
    // EXPORT CRIMES
    const handleExport = () => {
    if (filteredReports.length === 0) {
        alert("No reports to export.");
        return;
    }

    // Prepare data for export
    const dataToExport = filteredReports.map((report, index) => {
        let formattedDate = "N/A"; // Default to N/A if date is invalid
        let date = report.timeOfCrime || null;
        if (date) {
        console.log(format(date, "yyyy-MM-dd"));
        } else {
        console.log("Date is null");
        }
        if (date) {
        if (typeof date === "object") {
            formattedDate = format(date, "yyyy-MM-dd");
        } else if (report.timeOfCrime instanceof Timestamp) {
            formattedDate = format(date, "yyyy-MM-dd");
        }
        }

        // Ensure report.coordinate is a GeoPoint
        let FirestoregeoPoint = report.coordinate;
        if (
        FirestoregeoPoint &&
        !(FirestoregeoPoint instanceof FirestoreGeoPoint)
        ) {
        FirestoregeoPoint = new FirestoreGeoPoint(
            FirestoregeoPoint.latitude,
            FirestoregeoPoint.longitude
        );
        }

        // Ensure the location is available or default to 'Unknown'
        const location = report.location || "Unknown";

        // Now geoPoint is guaranteed to be a GeoPoint
        return {
        "S. No.": index + 1,
        Category:
            report.category.charAt(0).toUpperCase() + report.category.slice(1),
        Date: formattedDate,
        Coordinates: FirestoregeoPoint
            ? `${FirestoregeoPoint.latitude}, ${FirestoregeoPoint.longitude}`
            : "N/A", // Show coordinates as string
        Location: location, // Add the location field here

        Description: report.additionalInfo || "N/A", // Assuming there's a description field
        };
    });

    // Ensure that the columns have proper headers and the data is in the correct format
    const headers = [
        "S. No.",
        "Category",
        "Date",
        "Coordinates",
        "Location",
        "Title",
        "Description",
        "Status",
    ];

    // Create a new worksheet with the provided data and header
    const worksheet = XLSX.utils.json_to_sheet(dataToExport, {
        header: headers,
    });

    // Automatically adjust column widths based on content
    const colWidths = headers.map((header) => {
        // Find the maximum length of content in each column and adjust width accordingly
        let maxLength = header.length;
        dataToExport.forEach((report: { [key: string]: any }) => {
        const cellValue = report[header];
        if (
            cellValue &&
            typeof cellValue === "string" &&
            cellValue.length > maxLength
        ) {
            maxLength = cellValue.length;
        } else if (
            typeof cellValue === "number" &&
            String(cellValue).length > maxLength
        ) {
            maxLength = String(cellValue).length;
        }
        });

        // Increase the width padding more significantly
        return { wch: maxLength + 100 }; // Increased padding for better readability
    });

    worksheet["!cols"] = colWidths; // Apply the column widths to the worksheet

    // Convert worksheet to CSV
    const csvData = XLSX.utils.sheet_to_csv(worksheet);

    // Trigger download of the CSV file
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "FilteredReports.csv"); // Save as CSV
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    };

    // Render for Android
    if (Platform.OS === "android") {
      return null;
    } else if (Platform.OS === "web") {

      const setupGen = async () => {
        try {
          const auth = authWeb;
          const authID = auth.currentUser;

          await authID?.getIdTokenResult()
          .then(async (token) => {
            if (token.claims.admin == true) {
              setRole({privilege: 1});
            } else {
              setRole({privilege: 0});
            }
          })
        } catch (error) {
          console.error("Error setting up distress:", error);
        }
      };

      useEffect(() => {
        setupGen();
      }, []);
      
      return (
        <>
        {role.privilege == 0 &&
        <View style = {{width: "100%", height: "100%", justifyContent: "space-evenly", alignItems: "center", backgroundColor: "#FFF"}}>
          <Text style = {{fontSize: display, fontWeight: "bold", color: "#115272"}}> Generate Reports</Text>
          <Image source={repGen} style = {{width: "25%", height: "25%"}}/>
        </View>}

        {role.privilege == 1 &&
        <View style = {{width: "100%", height: "100%", justifyContent: "center", alignItems: "center", backgroundColor: "#FFF"}}>
          <Text style = {{fontSize: display, fontWeight: "bold", color: "#115272"}}> NOT PRIVILEGED</Text>
        </View>}

          {/* IMPORT CRIMES FAB */}
          {role.privilege == 0 &&
          <TouchableOpacity
            style={{
                position: "absolute",
                bottom: 20, // Adjust based on your layout needs
                left: 20, // Adjust based on your layout needs
                backgroundColor: "#0078A8", // Blue background
                borderRadius: 50, // Circular shape
                width: 250, // Diameter
                height: "6%", // Diameter
                justifyContent: "center",
                alignItems: "center",
                elevation: 5, // Optional for shadow
            }}
            onPress={() => {
              handleImport();
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
                Import Crime Data
              </Text>
              <View style={{ alignSelf: "center" }}>
                <Ionicons name="add" size={30} color="white" />
              </View>
            </View>
          </TouchableOpacity>}

          {/* EXPORT CRIMES FAB */}
          {role.privilege == 0 && 
          <TouchableOpacity
          style={{
            position: "absolute",
            bottom: 20, // Adjust based on your layout needs
            right: 20, // Adjust based on your layout needs
            backgroundColor: "#0078A8", // Blue background
            borderRadius: 50, // Circular shape
            width: 250, // Diameter
            height: "6%", // Diameter
            justifyContent: "center",
            alignItems: "center",
            elevation: 5, // Optional for shadow
          }}
          onPress={() => {handleExport();}}
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
              Export Crime Data
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
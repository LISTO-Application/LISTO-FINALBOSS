// React Imports
import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, ScrollView, 
    Platform, Animated, Dimensions, FlatList, Modal, 
    TouchableWithoutFeedback } from "react-native";

// Expo Imports
import * as DocumentPicker from "expo-document-picker"; // For mobile file selection
import { router } from "expo-router";

// Firebase Imports
import { db } from "@/app/FirebaseConfig";
import { Timestamp } from "@react-native-firebase/firestore";
import { GeoPoint as FirestoreGeoPoint, GeoPoint } from "firebase/firestore";
import "firebase/database";
import { collection, getDocs, addDoc, firebase } from "@react-native-firebase/firestore";

// Utility Imports
import { format } from "date-fns";
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
import { styles } from "@/styles/styles";


export default function ViewAdminEmergencyList() {

  const { title, body, small } = useResponsive();

    // ARRAY STATES
    interface Distress {
      id: string;
      acknowledged: boolean;
      addInfo: string;
      barangay: string;
      emergencyType: { fire: boolean; crime: boolean; injury: boolean };
      location: GeoPoint;
      timestamp: number;
    }
    
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

    // FETCH DATA FOR ADMIN (ADD CONDITIONAL FOR ADMIN)
    const fetchDistress = async () => {
        try {
            const distressCollectionRef = collection(db, "distress");
            const distressSnapshot = await getDocs(distressCollectionRef);
            if (distressSnapshot.empty) {
            console.log("No incidents found in Firestore.");
            return;
            }
            // Process records from Firestore without geocoding.
            const distressArray = distressSnapshot.docs.map((doc) => {
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
                acknowledged: data.acknowledged || false,
                addInfo: data.addInfo || "No additional info",
                barangay: data.barangay || "Unknown",
                emergencyType: data.emergencyType || { fire: false, crime: false, injury: false },
                location: data.location || "Unknown location",
                timestamp: data.timestamp || null,
            };
            });
            console.log("Mapped Distresses:", distressArray);
            setDistresses(distressArray);
            setFilteredDistress(distressArray);
        } catch (error) {
            console.error("Error fetching distresses:", error);
        }
    };
    useEffect(() => {
      fetchDistress();
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

              let coordinate: FirestoreGeoPoint | null = null;
              const lat = item["Latitude"] ? parseFloat(item["Latitude"]) : null;
              const lng = item["Longitude"]
                ? parseFloat(item["Longitude"])
                : null;

              // Check if latitude and longitude exist in the file
              if (lat && lng) {
                coordinate = new FirestoreGeoPoint(lat, lng);
              } else if (item["Location"]) {
                // Geocode the address if coordinates aren't available
                coordinate = await geocodeAddress(item["Location"]);
              }

              if (!coordinate) {
                console.warn(
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
                id: uuidv4(),
                additionalInfo: item["Additional Info"] || "No additional info",
                category: item["Category"] || "Unknown",
                location: item["Location"] || "Unknown location",
                time: item["Time"] || "00:00",
                timeOfCrime: timestampOfCrime,
                timeReported: timestampReported,
                coordinate, // Store GeoPoint directly
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
              console.log("Adding report to Firestore:", report);
              try {
                await addDoc(crimesCollection, report);
              } catch (error) {
                console.error("Error adding report to Firestore:", error);
              }
            });

            await Promise.all(addReportsPromises);

            alert("Reports successfully added.");
            await fetchDistress();
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

    // Helper function to parse the date format in the CSV

  // const formatDate = (date: Date | null): string => {
  //   if (date && date._seconds) {
  //     date = dayjs(date._seconds * 1000);
  //   } else {
  //     date = dayjs(date, ["MM/DD/YYYY", "MM-DD-YYYY"], true);
  //   }
  //   return format(date.toLocaleString(), "yyyy-MM-dd");
  // };

    const getStatusStyle = (status: number) => {
      switch (status) {
        case 0:
          return { backgroundColor: "#115272", color: "red" };
        case 1:
          return { backgroundColor: "grey", color: "blue" };
        case 2:
          return { backgroundColor: "#dc3545", color: "green" };
        default:
          return { backgroundColor: "#6c757d", color: "" };
      }
    };

  //Animation to Hide side bar
  const { width: screenWidth } = Dimensions.get("window"); // Get the screen width
  const contentPosition = useRef(new Animated.Value(0)).current;
  const [isAlignedRight, setIsAlignedRight] = useState(false);

  function handleApprove(reportID: string) {
    //Approve logic
    //Change Status to 2
    //Add to crime database
  }

  function handleReject(reportID: string) {
    //Reject logic
    //Change Status to 0
    //Add to archive collection
  }

  const handleDeleteRequest = (reportId: string) => {
    setSelectedReportId(reportId);
    setDeleteModalVisible(true);
  };

  // Import GeoPoint from Firebase Firestore

  // const handleExport = () => {
  //   if (filteredReports.length === 0) {
  //     alert("No reports to export.");
  //     return;
  //   }

  //   // Prepare data for export
  //   const dataToExport = filteredReports.map((report, index) => {
  //     let formattedDate = "N/A"; // Default to N/A if date is invalid
  //     let date = report.timeOfCrime || null;
  //     if (date) {
  //       console.log(format(date, "yyyy-MM-dd"));
  //     } else {
  //       console.log("Date is null");
  //     }
  //     if (date) {
  //       if (typeof date === "object") {
  //         formattedDate = format(date, "yyyy-MM-dd");
  //       } else if (report.timeOfCrime instanceof Timestamp) {
  //         formattedDate = format(date, "yyyy-MM-dd");
  //       }
  //     }

  //     // Ensure report.coordinate is a GeoPoint
  //     let FirestoregeoPoint = report.coordinate;
  //     if (
  //       FirestoregeoPoint &&
  //       !(FirestoregeoPoint instanceof FirestoreGeoPoint)
  //     ) {
  //       FirestoregeoPoint = new FirestoreGeoPoint(
  //         FirestoregeoPoint.latitude,
  //         FirestoregeoPoint.longitude
  //       );
  //     }

  //     // Ensure the location is available or default to 'Unknown'
  //     const location = report.location || "Unknown";

  //     // Now geoPoint is guaranteed to be a GeoPoint
  //     return {
  //       "S. No.": index + 1,
  //       Category:
  //         report.category.charAt(0).toUpperCase() + report.category.slice(1),
  //       Date: formattedDate,
  //       Coordinates: FirestoregeoPoint
  //         ? `${FirestoregeoPoint.latitude}, ${FirestoregeoPoint.longitude}`
  //         : "N/A", // Show coordinates as string
  //       Location: location, // Add the location field here

  //       Description: report.additionalInfo || "N/A", // Assuming there's a description field
  //     };
  //   });

  //   // Ensure that the columns have proper headers and the data is in the correct format
  //   const headers = [
  //     "S. No.",
  //     "Category",
  //     "Date",
  //     "Coordinates",
  //     "Location",
  //     "Title",
  //     "Description",
  //     "Status",
  //   ];

  //   // Create a new worksheet with the provided data and header
  //   const worksheet = XLSX.utils.json_to_sheet(dataToExport, {
  //     header: headers,
  //   });

  //   // Automatically adjust column widths based on content
  //   const colWidths = headers.map((header) => {
  //     // Find the maximum length of content in each column and adjust width accordingly
  //     let maxLength = header.length;
  //     dataToExport.forEach((report: { [key: string]: any }) => {
  //       const cellValue = report[header];
  //       if (
  //         cellValue &&
  //         typeof cellValue === "string" &&
  //         cellValue.length > maxLength
  //       ) {
  //         maxLength = cellValue.length;
  //       } else if (
  //         typeof cellValue === "number" &&
  //         String(cellValue).length > maxLength
  //       ) {
  //         maxLength = String(cellValue).length;
  //       }
  //     });

  //     // Increase the width padding more significantly
  //     return { wch: maxLength + 100 }; // Increased padding for better readability
  //   });

  //   worksheet["!cols"] = colWidths; // Apply the column widths to the worksheet

  //   // Convert worksheet to CSV
  //   const csvData = XLSX.utils.sheet_to_csv(worksheet);

  //   // Trigger download of the CSV file
  //   const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
  //   const url = URL.createObjectURL(blob);

  //   const link = document.createElement("a");
  //   link.href = url;
  //   link.setAttribute("download", "FilteredReports.csv"); // Save as CSV
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // };

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
    return (
      <View style={webstyles.container}>
        <Animated.View
          style={[webstyles.mainContainer, { transform: [{ translateX: contentPosition }] },]}>

          {/* EMERGENCY LIST */}
          <ScrollView
            contentContainerStyle={[
              webstyles.reportList,
              isAlignedRight && { width: "75%" },
            ]}
            style = {{marginVertical: "2.5%"}}
          >

            { currentDistress.map((distress, index) => {
            if(distress.location != null) {
              Geocoder.from(distress.location?.latitude, distress.location?.longitude)
              .then(json => {
                  setAddress(json.results[0].formatted_address);
              })
            }
            return (
              <MotiView from = {{translateX: 500}} animate={{translateX: 0}} key={index}>
                <TouchableOpacity style = {{width: "98%", height: "auto", flexDirection: "row", backgroundColor: "#FFF", borderColor: "#FFF", borderWidth: 5, borderRadius: 5, marginHorizontal: "auto", marginVertical: "0.5%", opacity: distress.acknowledged ? 0.75 : 1}} onPress={() => {
                  setDistressDetails(distress);
                  setTimeout(() => {
                    Geocoder.init("AIzaSyDoWF8JDzlhT2xjhuInBtMmkhWGXg2My0g");
                    console.log("Geocoder initialized");
                    if (mapRef.current) {
                      mapRef.current.setMapBoundaries(
                        mapBoundaries.northEast,
                        mapBoundaries.southWest
                      ); 
                      setTimeout(() => {
                        mapRef.current?.fitToCoordinates([{latitude: distress.location?.latitude ?? 0, longitude: distress.location?.longitude ?? 0}]);
                      }, 3000);
                    }
                  }, 1000);
                  setDetailsVisible(true);
                }}>
                  {distress.emergencyType.fire == true &&<View style = {{width: "20%",  aspectRatio: 1/1, justifyContent: "center", alignItems: "center", backgroundColor: "#DA4B46", borderRadius: 5, marginRight: "2.5%", marginVertical: "auto"}}>
                    <Ionicons name="flame-outline" size={title} color="#FFF"/> 
                  </View>}
                  {distress.emergencyType.crime == true &&<View style = {{width: "20%",  aspectRatio: 1/1, justifyContent: "center", alignItems: "center", backgroundColor: "#DA4B46", borderRadius: 5, marginRight: "2.5%", marginVertical: "auto"}}>
                    <FontAwesome6 name="gun" size={title} color="#FFF"/>
                  </View>}
                  {distress.emergencyType.injury == true &&<View style = {{width: "20%",  aspectRatio: 1/1, justifyContent: "center", alignItems: "center", backgroundColor: "#DA4B46", borderRadius: 5, marginRight: "2.5%", marginVertical: "auto"}}>
                    <MaterialIcons name="personal-injury" size={title} color="#FFF"/>
                  </View>}
                  <View style = {{width: "auto", maxWidth: "80%", flexDirection: "column", justifyContent: "flex-start"}}>
                      <Text style = {{fontSize: body, fontWeight: "bold", color: "#DA4B46"}}>{distress.barangay == "HS" ? "Holy Spirit" : "Matandang Balara"}</Text>
                      <Text style = {{fontSize: small, fontWeight: "500", color: "#DA4B46"}}>{address}</Text>
                  </View>
                </TouchableOpacity>
              </MotiView>
            );
          }) }

          </ScrollView>

          <PaginationReport
            filteredReports={filteredDistress}
            reportsPerPage={reportsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            isAlignedRight={isAlignedRight}
          />
        </Animated.View>
        <TouchableOpacity
          style={webstyles.fab}
          onPress={() => router.push("/newAdminReports")}
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
        </TouchableOpacity>
      </View>
    );
  }
}

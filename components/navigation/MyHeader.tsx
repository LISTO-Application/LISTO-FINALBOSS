import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Button,
  StyleSheet,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { db } from "../../app/FirebaseConfig"; // Ensure this is importing from the correct file
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  updateDoc,
  doc,
} from "@react-native-firebase/firestore";
import MapView, { Marker } from "react-native-maps";
// TypeScript Types
import { DrawerNavigationProp } from "@react-navigation/drawer";

// Component Imports
import { ThemedButton } from "@/components/ThemedButton";
import {
  Map,
  APIProvider,
  useMapsLibrary,
  useMap,
  MapMouseEvent,
  Pin,
  AdvancedMarker,
  InfoWindow,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";
// Type for Navigation
type DrawerParamList = {
  emergency: undefined;
  index: undefined;
  "[id]": undefined;
  Custom: undefined;
};

type CustomNavigatorProps = {
  navigation: DrawerNavigationProp<DrawerParamList>;
};

const MyHeader: React.FC<CustomNavigatorProps> = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [newReportsCount, setNewReportsCount] = useState(0);
  const [reportTitles, setReportTitles] = useState<string[]>([]);
  const [exclamationModalVisible, setExclamationModalVisible] = useState(false);
  const [distressMessagesCount, setDistressMessagesCount] = useState(0);
  const [distressMessagesDetails, setDistressMessagesDetails] = useState<
    {
      emergencyType: string;
      addInfo: string;
      location: { latitude: number; longitude: number };
      timestamp: Date;
      id: string;
      acknowledge: boolean;
    }[] // Adding the 'id' property
  >([]);

  const [mapModalVisible, setMapModalVisible] = useState(false); // State for map modal visibility
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const position = { lat: 14.685992094228787, lng: 121.07589171824928 };

  const [mapRegion, setMapRegion] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.1, // Controls zoom level
    longitudeDelta: 0.1, // Controls zoom level
  });

  // Fetch the count and titles of new reports whenever the component mounts or updates
  useEffect(() => {
    const reportsCollection = collection(db, "reports");
    const q = query(reportsCollection, where("status", "==", 1));
    const fetchReports = async () => {
      try {
        const snapshot = await getDocs(q);
        setNewReportsCount(snapshot.size);
        const titles: string[] = snapshot.docs.map((doc) => doc.data().title);
        setReportTitles(titles);
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };
    fetchReports();
  }, []);

  useEffect(() => {
    const distressCollection = collection(db, "distress");
    const q = query(distressCollection, where("acknowledged", "==", false));

    const fetchDistressMessages = async () => {
      try {
        const snapshot = await getDocs(q); // Fetch the distress messages

        if (!snapshot.empty) {
          const messagesDetails = snapshot.docs.map((doc) => {
            const data = doc.data();
            const timestamp = data.timestamp;
            const parsedTimestamp = new Date(timestamp);
            const location = data.location;
            const latitude = location.latitude;
            const longitude = location.longitude;

            return {
              emergencyType: data.emergencyType || {},
              addInfo: data.addInfo || "",
              location: { latitude, longitude },
              timestamp: parsedTimestamp,
              id: doc.id, // Document ID
              acknowledge: data.acknowledged || false,
            };
          });

          setDistressMessagesCount(messagesDetails.length);
          setDistressMessagesDetails(messagesDetails);
        } else {
          setDistressMessagesCount(0);
          setDistressMessagesDetails([]);
        }
      } catch (error) {
        console.error("Error fetching distress messages:", error);
      }
    };

    fetchDistressMessages();
  }, []);

  const [selectedMessageDetails, setSelectedMessageDetails] = useState<{
    emergencyType: string;
    addInfo: string;
    location: { latitude: number; longitude: number };
    timestamp: Date;
    id: string; // Assuming you're using Firestore doc ID as a string
  } | null>(null);

  const handleLocationClick = (location: string) => {
    try {
      const [latitudeStr, longitudeStr] = location.split(",");
      const latitude = parseFloat(latitudeStr.trim());
      const longitude = parseFloat(longitudeStr.trim());

      if (isNaN(latitude) || isNaN(longitude)) {
        throw new Error("Invalid latitude or longitude.");
      }

      // Find the corresponding distress message based on the clicked location
      const selectedMessage = distressMessagesDetails.find(
        (message) =>
          message.location.latitude === latitude &&
          message.location.longitude === longitude
      );

      if (selectedMessage) {
        setSelectedLocation({ latitude, longitude });
        setSelectedMessageDetails(selectedMessage); // Set the selected message details for display

        // Set the map region to center on the clicked location with zoom level
        setMapRegion({
          latitude,
          longitude,
          latitudeDelta: 0.05, // Zoom in
          longitudeDelta: 0.05, // Zoom in
        });

        setMapModalVisible(true); // Show the map modal
      } else {
        console.warn("No matching message found for the clicked location.");
      }
    } catch (error) {
      console.error("Error parsing location:", error);
    }
  };

  const handleAcknowledge = async () => {
    if (!selectedMessageDetails) return;

    try {
      // Send request to Firestore to update the 'acknowledged' field in the database
      const messageRef = doc(db, "distress", selectedMessageDetails.id);
      await updateDoc(messageRef, {
        acknowledged: true, // Mark as acknowledged
      });

      // Update the local state to reflect the acknowledged status
      const updatedMessage = {
        ...selectedMessageDetails,
        acknowledge: true, // Update acknowledge field locally
      };
      setDistressMessagesCount((prevNotifs: any) => {
        return prevNotifs.map((message: any) => {
          message.id === updatedMessage.id ? updatedMessage : message;
        });
      });
      setSelectedMessageDetails(updatedMessage); // Update the selected message details state
      setMapModalVisible(false); // Close the modal after acknowledging
    } catch (error) {
      console.error("Error acknowledging message:", error);
    }
  };
  // Log the region whenever it changes (for debugging)

  const closeModal = () => {
    setModalVisible(false);
  };

  // USER MODE
  const [userRole, setUserRole] = useState("User");

  useEffect(() => {
    console.log("Selected Location:", selectedLocation);
  }, [selectedLocation]);

  return (
    <View style={layoutStyles.headerContainer}>
      <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
        <MaterialIcons
          name="menu"
          size={35}
          color="#115272"
          style={layoutStyles.icon}
        />
      </TouchableOpacity>

      {userRole === "Admin" ? (
        <View style={layoutStyles.iconGroup}>
          {/* Notification Icon */}

          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={layoutStyles.buttonContainer}
          >
            <View style={layoutStyles.iconContainer}>
              <MaterialIcons
                name="notifications"
                size={30}
                color="#115272"
                style={layoutStyles.iconInner}
              />
              {newReportsCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationText}>{newReportsCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          {/* Exclamation Icon */}
          <TouchableOpacity
            onPress={() => setExclamationModalVisible(true)} // Show modal for distress messages
            style={layoutStyles.buttonContainer}
          >
            <View style={layoutStyles.iconContainer}>
              <MaterialIcons
                name="error"
                size={30}
                color="#115272"
                style={layoutStyles.iconInner}
              />
              {distressMessagesCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationText}>
                    {distressMessagesCount}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      ) : null}
      {/* Notification Modal */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalMessage}>
              {newReportsCount > 0
                ? `${newReportsCount} reports still need validation`
                : "No new reports to validate"}
            </Text>
            <ScrollView style={styles.reportListContainer}>
              {reportTitles.map((title, index) => (
                <Text key={index} style={styles.reportTitle}>
                  {title}
                </Text>
              ))}
            </ScrollView>
            <Button
              title="Close"
              onPress={() => setModalVisible(false)}
              color="#115272"
            />
          </View>
        </View>
      </Modal>

      {/* Exclamation Modal */}
      <Modal
        visible={exclamationModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setExclamationModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalMessage}>
              {distressMessagesCount > 0
                ? `${distressMessagesCount} new distress messages`
                : "No new distress messages"}
            </Text>

            <ScrollView style={styles.reportListContainer}>
              {distressMessagesDetails.map((message, index) => {
                const emergencyTypes = message.emergencyType || {}; // Ensure emergencyType exists

                // Cast to Record<string, boolean> to avoid TypeScript errors
                const typedEmergencyTypes = emergencyTypes as Record<
                  string,
                  boolean
                >;

                // Filter out the types that are true
                const activeEmergencyTypes = Object.keys(typedEmergencyTypes)
                  .filter((key) => typedEmergencyTypes[key] === true)
                  .join(", ");

                return (
                  <View key={index} style={styles.cardContainer}>
                    <Text style={styles.label}>Emergency Type:</Text>{" "}
                    {activeEmergencyTypes} - {message.addInfo}
                    <Text>
                      <Text
                        style={styles.locationText}
                        onPress={() =>
                          handleLocationClick(
                            `${message.location.latitude}, ${message.location.longitude}`
                          )
                        }
                      >
                        Show Marker Location
                      </Text>
                    </Text>
                  </View>
                );
              })}
            </ScrollView>

            <Button
              title="Close"
              onPress={() => setExclamationModalVisible(false)}
              color="#115272"
            />
          </View>
        </View>
      </Modal>
      <Modal
        visible={mapModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setMapModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <APIProvider
            apiKey="AIzaSyDoWF8JDzlhT2xjhuInBtMmkhWGXg2My0g"
            region="PH"
          >
            <View style={styles.mapModal}>
              <Map
                center={position}
                zoom={18} // Increase the zoom level for a more zoomed-in view
                gestureHandling="greedy"
                mapTypeControl={true}
                streetViewControl={false}
                mapId="5cc51025f805d25d"
                mapTypeId="roadmap"
                scrollwheel={true}
                disableDefaultUI={false}
                minZoom={10}
                maxZoom={17} // Allow zooming in to a higher level
              >
                <AdvancedMarker position={position} title="Selected Location" />
              </Map>

              {/* Distress Message Details - No scroll */}
              {selectedMessageDetails && (
                <View style={styles.distressMessagesContainer}>
                  <View style={styles.cardContainer}>
                    {/* Extracting active emergency types */}
                    <Text style={styles.reportTitle}>
                      <Text style={styles.label}>Emergency Type: </Text>
                      {(() => {
                        // Ensure emergencyType exists and cast to Record<string, boolean>
                        const emergencyTypes =
                          selectedMessageDetails.emergencyType || {};
                        const typedEmergencyTypes = emergencyTypes as Record<
                          string,
                          boolean
                        >;

                        // Filter out the types that are true
                        const activeEmergencyTypes = Object.keys(
                          typedEmergencyTypes
                        )
                          .filter((key) => typedEmergencyTypes[key] === true) // Keep only true ones
                          .join(", "); // Join them into a comma-separated string

                        // Display active emergency types, or a fallback message if none
                        return activeEmergencyTypes
                          ? activeEmergencyTypes
                          : "None";
                      })()}
                    </Text>
                    <Text style={styles.reportTitle}>
                      <Text style={styles.label}>Time of Report:</Text>{" "}
                      {new Date(
                        selectedMessageDetails.timestamp
                      ).toLocaleString()}
                    </Text>
                    <Text style={styles.reportTitle}>
                      <Text style={styles.label}>Add Info:</Text>{" "}
                      {selectedMessageDetails.addInfo}
                    </Text>
                    <Text style={styles.reportTitle}>
                      <Text style={styles.label}>Coordinates:</Text>{" "}
                      {selectedMessageDetails.location.latitude},{" "}
                      {selectedMessageDetails.location.longitude}
                    </Text>
                    <Text style={styles.reportTitle}>
                      <Text style={styles.label}>ID:</Text>{" "}
                      {selectedMessageDetails.id} {/* Display ID */}
                    </Text>
                  </View>
                </View>
              )}

              {/* Acknowledge Button */}
              <TouchableOpacity
                style={styles.acknowledgeButton}
                onPress={handleAcknowledge}
              >
                <Text style={styles.acknowledgeButtonText}>Acknowledge</Text>
              </TouchableOpacity>

              {/* Close Button */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setMapModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </APIProvider>
        </View>
      </Modal>
    </View>
  );
};

const layoutStyles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#115272",
  },
  iconGroup: {
    flexDirection: "row", // Icons side-by-side
    alignItems: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    borderRadius: 15, // Increase radius to ensure the icon is centered
    borderWidth: 2,
    width: 50, // Size of the circle
    height: 50, // Size of the circle
    borderColor: "#115272",
    backgroundColor: "white",
    justifyContent: "center", // Horizontally center the icon
    alignItems: "center", // Vertically center the icon
    lineHeight: 45, // Ensure text inside is centered vertically (if applicable)
    textAlign: "center", // Ensure text is centered if any
  },

  iconContainer: {
    borderRadius: 20,
    borderWidth: 2,
    width: 50, // Matches the size of `icon`
    height: 50,
    borderColor: "#115272",
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5, // Spacing between the two icons
  },
  iconInner: {
    textAlign: "center",
  },
});

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#115272",
  },
  distressMessagesContainer: {
    marginTop: 15,
    maxHeight: "50%",
    marginBottom: 15,
  },
  label: {
    fontWeight: "bold",
    color: "#115272",
  },
  acknowledgeButton: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  acknowledgeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  cardContainer: {
    backgroundColor: "#f8f8f8",
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5, // For Android shadow
  },
  locationText: {
    color: "#115272",
    textDecorationLine: "underline",
  },

  mapModal: {
    width: "50%",
    height: "50%", // Adjust the height as needed
    backgroundColor: "white",
    borderRadius: 10,
    overflow: "hidden", // Prevent map from overflowing
    padding: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
  closeButton: {
    backgroundColor: "#115272",
    padding: 10,
    marginTop: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 8,
    width: 250,
    alignItems: "center",
  },
  modalMessage: {
    textAlign: "center",
    fontSize: 18,
    marginBottom: 15,
    color: "#333",
  },
  notificationBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "red",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  reportListContainer: {
    maxHeight: 200,
    marginTop: 10,
  },
  messageCard: {
    backgroundColor: "#f8f8f8",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
  },
  cardInfo: {
    fontSize: 14,
    color: "#555",
  },
  cardLocation: {
    fontSize: 14,
    color: "#555",
  },
  cardTimestamp: {
    fontSize: 12,
    color: "#888",
  },
  reportTitle: {
    fontSize: 14,
    color: "#333",
    marginBottom: 5,
  },
});

export default MyHeader;

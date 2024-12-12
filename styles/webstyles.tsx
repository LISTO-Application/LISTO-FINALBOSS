import { transform } from "@babel/core";
import { StyleSheet } from "react-native";

const webstyles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    height: "100%",
    backgroundColor: "white",
    padding: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff", // White background for loading state
  },
  sidebar: {
    width: "25%", // Adjust to the sidebar's width
    backgroundColor: "#fff",
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 2, height: 0 },
    shadowRadius: 5,
    zIndex: 10,
  },
  reportContainer: {
    marginVertical: 10,
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  reportHeader: {
    flexDirection: "row", // Arrange items horizontally
    justifyContent: "space-between", // Space between the date and button
    alignItems: "center", // Vertically center the items
    marginBottom: 10,
  },
  reportDate: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
  },

  // Custom CSS for the "Sort by Date" Button
  sortButton: {
    backgroundColor: "#007BFF", // Blue background for sort button
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  sortButtonText: {
    color: "#115272", // White text for sort button
    fontSize: 20,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
  modalContent: {
    width: "80%", // Adjust width as needed
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    elevation: 5, // For shadow effect on Android
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#115272",
    marginBottom: 15,
  },
  modalOption: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: "#f8f8f8",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#115272",
    textAlign: "center",
  },
  sidebarTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  sidebarItem: {
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  sidebarText: {
    color: "#333",
    fontSize: 18,
  },
  userSection: {
    justifyContent: "center",
    alignItems: "center",
    height: 200,
    width: "100%",
    overflow: "hidden",
  },
  userImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  logoutContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  logoutButton: {
    padding: 15,
    backgroundColor: "red",
    borderRadius: 5,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
  },
  toggleButton: {
    width: 30,
    height: 30,
    backgroundColor: "#fff",
    borderColor: "black",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 40,
    left: 260, // Adjust to position the toggle button
    zIndex: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 2, height: 2 },
    shadowRadius: 5,
  },
  mainContainer: {
    backgroundColor: "white", // White background for the main part
    padding: 20,
    borderRadius: 30,
    width: "80%",
    flex: 1,
  },
  headerContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerText: {
    fontSize: 50,
    fontWeight: "bold",
    color: "#115272",
  },
  reportList: {
    borderColor: "white",
    padding: 20,
    borderWidth: 2,
    borderRadius: 10,
    margin: 5,
  },
  reportIconContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  reportContainer2: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#115272",
    marginBottom: 10,
    borderRadius: 8, // Center align items vertically
  },
  reportContainerValidate: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "white",
    marginBottom: 10,
    // Rounded corners
    borderBottomWidth: 0.5, // Add a border at the bottom
    borderBottomColor: "grey", // Set the bottom border color to grey
  },
  dropdownList: {
    position: "absolute",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "gray",
    width: "100%",
    zIndex: 1, // Ensure the dropdown appears above other content
  },

  backIcon: {
    position: "absolute",
    left: 10,
  },

  scrollViewContent: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },

  reportIcon: {
    width: 40,
    height: 40,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ff3b30",
    borderRadius: 10,
    borderWidth: 1,
  },
  reportTextContainer: {
    flex: 1,
    paddingLeft: 10
  },
  reportTitleValidate: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#115272", // Blue color for the title
  },
  // Updated details to blue
  reportDetails: {
    fontSize: 14,
    color: "#115272", // Blue color for the details
  },
  timeText: {
    fontSize: 15,
    color: "white",
    marginLeft: 20,
    fontWeight: 600,
  },
  statusButtonsContainer: {
    color: "black",
    flexDirection: "row",
  },
  pendingButton: {
    marginLeft: 10,
    padding: 10,
    backgroundColor: "grey",
    borderRadius: 5,
  },
  pendingButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  actionContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginLeft: 5,
  },

  statusButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  statusContainer: {
    marginRight: 10,
    // Add padding to make it larger
    paddingVertical: 5,
    paddingHorizontal: 10,
    // Optionally, set a fixed width or a minimum width
    minWidth: 80, // Adjust as needed
    justifyContent: "center",
    alignItems: "center",
  },
 
  modalText: {
    fontSize: 16,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
    padding: 10,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  statusBadge: {
    paddingVertical: 8, // Increase vertical padding
    paddingHorizontal: 12, // Increase horizontal padding
    borderRadius: 15,
    textAlign: "center",
    fontSize: 14, // Adjust font size if needed
  },
  validateIcon: {
    paddingLeft: 5,
    color: "#115272",
  },
  horizontalLine: {
    color: "black",
    height: 10,
    backgroundColor: "#ccc",
    marginVertical: 10,
  },

  item: {
    padding: 10,
  },

  itemText: {
    fontSize: 16,
  },
  approveButton: {
    backgroundColor: "#4caf50",
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  rejectedButton: {
    backgroundColor: "#f44336",
    padding: 10,
    borderRadius: 5,
  },
  approvedButton: {
    backgroundColor: "#115272",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  detailItem: {
    marginBottom: 15,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 16,
    color: "#333",
  },
  button: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#007bff",
    borderRadius: 5,
    alignItems: "center",
  },

  buttonIcon: {
    paddingRight: 8,
  },

  buttonLabel: {
    color: "#fff",
    fontSize: 16,
  },

  approvedButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  rejectedButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  // Add this inside your webstyles object
  paginationContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center", // Center the buttons
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 0,
    marginTop: 20,
  },

  paginationButton: {
    backgroundColor: "#115272",
    paddingVertical: 15,
    paddingHorizontal: 25, // Increased padding
    borderRadius: 5,
    cursor: "pointer",
    marginHorizontal: 10, // Add margin to space out buttons
  },
  selectedText: {
    fontSize: 16,
    color: "black",
    padding: 10,
  },
  reportIdText: {
    fontSize: 16,
    color: "black",
    padding: 10,
  },
  paginationTextButton: {
    color: "white",
    fontSize: 18, // Increased font size
    fontWeight: "bold",
    textAlign: "center", // Center-align the text
  },
  paginationText: {
    color: "black",
    fontSize: 18, // Increased font size
    fontWeight: "bold",
    textAlign: "center", // Center-align the text
  },

  fab: {
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
  },
  reportActions: {
    flexDirection: "row", // Ensure actions are in a row
    alignItems: "center",
    justifyContent: "center",
    marginRight: 20,
  },
  reportTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    marginLeft: 20,
  },

  reportInfo: {
    color: "white",
    fontSize: 14,
    fontWeight: "200",
    flex: 2 / 5,
  },
  disabledIcon: {
    opacity: 0.5,
  },

  editIcon: {
    cursor: "pointer",
    marginLeft: 8,
    width: 40,
    height: 40,
  },
  timeTextValdiate: {
    color: "#115272",
    fontSize: 14,
    marginLeft: 8,
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 16,
  },
  cancelButton: {
    backgroundColor: "#FF5B5B",
    padding: 12,
    borderRadius: 4,
    color: "#FFF",
    cursor: "pointer",
  },
  submitButton: {
    backgroundColor: "#0078A8",
    padding: 12,
    borderRadius: 4,
    color: "#FFF",
    cursor: "pointer",
  },

  inputField: {
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    width: "100%",
  },
  textArea: {
    height: 100,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  dropdown: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
  },
  buttonContainereditReport: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  cancelButtoneditReport: {
    borderWidth: 2, // Add border width
    // Set the border color
    paddingVertical: 10, // Vertical padding
    paddingHorizontal: 20, // Horizontal padding
    borderRadius: 20, // Rounded corners
    flex: 1,
    marginRight: 10,
    alignItems: "center", // Center the text
    backgroundColor: "transparent", // Center the text
  },
  submitButtoneditReport: {
    backgroundColor: "#115272",
    paddingVertical: 10, // Vertical padding for more height
    paddingHorizontal: 20, // Horizontal padding for more width
    borderRadius: 20, // Increased radius for capsule shape
    flex: 1,
    alignItems: "center", // Center the text
  },
  buttonTexteditReport: {
    textAlign: "center",
    color: "black",
    fontWeight: "bold",
  },

  imageInputContainer: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 20,
  },

  imageContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  image: {
    width: "100%",
    height: 250,
    aspectRatio: 5 / 4,
    borderRadius: 18,
  },

  footerContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
});

export { webstyles };

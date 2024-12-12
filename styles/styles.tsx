import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: "column",
    height: "100%",
    display: "flex",
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8",
    paddingHorizontal: 20,
  },
  headerContainer: {
    backgroundColor: "#115272", // Blue color
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  backIcon: {
    marginRight: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF", // White text color
  },
  scrollViewContent: {
    alignItems: "center",
    paddingBottom: 30,
  },
  reportIcon: {
    marginRight: 10,
    backgroundColor: "#DA4B46",
    padding: 10,
    borderRadius: 50,
  },
  reportTextContainer: {
    flex: 1,
  },
  reportActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    marginLeft: "auto",
    fontSize: 14,
    color: "#FFF",
  },
  editIcon: {
    marginLeft: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#115272",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: "45%",
    alignItems: "center",
  },
  submitButton: {
    backgroundColor: "#115272",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: "45%",
    alignItems: "center",
  },
  buttonText: {
    color: "#115272",
    fontSize: 16,
    fontWeight: "bold",
  },

  header: {
    paddingLeft: "5%",
    paddingRight: "5%",
    paddingTop: "5%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },

  profileContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },

  // White background section starts here
  whiteSectionContainer: {
    backgroundColor: "#fff", // White background
    borderTopLeftRadius: 20, // Optional, for rounded top corners
    borderTopRightRadius: 20, // Optional, for rounded top corners
    paddingVertical: 20,
    paddingHorizontal: "5%",
    flex: 1,
  },

  sectionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#115272", // Darker color for text against the white background
  },
  iconButton: {
    padding: 10,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  infoLabel: {
    fontSize: 16,
    color: "#115272", // Darker color for text against the white background
  },
  infoText: {
    fontSize: 16,
    color: "#115272", // Darker color for text against the white background
  },
  logoutButton: {
    marginTop: 20,
    paddingVertical: 10,
    backgroundColor: "transparent",
  },
  logoutText: {
    color: "#ff4444",
    fontSize: 16,
    fontWeight: "bold",
  },
  formContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  dropdown: {
    padding: 15,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  selectedText: {
    fontSize: 16,
    color: "gray",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    marginHorizontal: 20,
  },
  item: {
    paddingVertical: 15,
  },
  itemText: {
    fontSize: 18,
    color: "black",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  imageUpload: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    marginBottom: 20,
  },
  uploadText: {
    marginLeft: 10,
    fontSize: 16,
    color: "gray",
  },

  buttonContainerReport: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  cancelButtonReport: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    padding: 15,
    width: "40%",
    alignItems: "center",
  },
  submitButtonReport: {
    backgroundColor: "#0d6efd",
    borderRadius: 5,
    padding: 15,
    width: "40%",
    alignItems: "center",
  },
  buttonTextReport: {
    fontSize: 16,
    fontWeight: "bold",
    color: "gray",
  },
  reportContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  reportDescription: {
    marginTop: 5,
    fontSize: 14,
    color: "#666",
  },
  statusLabel: {
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  statusText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },

  actionButton: {
    marginHorizontal: 10,
  },

  reportDetails: {
    fontSize: 14,
    color: "#6c757d",
  },

  statusContainer: {
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    textAlign: "center",
  },
  validateIcon: {
    paddingHorizontal: 5,
  },

  actionContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  blueBackground: {
    backgroundColor: "#003366", // Blue background for the top section
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    marginTop: 20,
  },

  paginationButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    opacity: 1, // You can control the opacity for disabled state in the component
  },

  paginationText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  
});

export { styles };

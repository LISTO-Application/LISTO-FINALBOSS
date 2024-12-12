import {
  Button,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import DropDownPicker from "react-native-dropdown-picker";
import ClearFilter from "./ClearFilter";
import { useRoute } from "@react-navigation/native";

type Report = {
  id: string;
  additionalInfo: string;
  category: string;
  location: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  image: {
    filename: string;
    uri: string;
  };
  name: string | null;
  phone: string;
  status: number;
  time: string;
  timeOfCrime: Date; // Ensure it's a Date object
  timeReported: Date; // Ensure it's a Date object
  unixTOC: number;
  uid: string;
};

export default function SearchSort({
  reports,
  setCategoryModalVisible,
  setFilteredReports,
  isAlignedRight,
  filterReports,
  handleExport = () => {},
  handleImport = () => {},
  pickFile,
  excelData,
  uploading,
  uploadToFirestore,
}: {
  reports: Report[];
  setCategoryModalVisible: any;
  setFilteredReports: any;
  isAlignedRight: any;
  filterReports: any;
  handleExport: any;
  handleImport: any;
  pickFile: any;
  excelData: any;
  uploading: any;
  uploadToFirestore: any;
}) {
  const route = useRoute();
  const [isSortedAsc, setIsSortedAsc] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>(""); // State for search query
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // State for selected category filter
  const [currentStatusSort, setCurrentStatusSort] = useState<boolean>(false);

  // Handle search query change
  const handleSearch = (query: string) => {
    setSearchQuery(query); // Update search query state
    filterReports(query, selectedCategory); // Re-filter reports based on query and selected category
  };
  // Clear category filter
  const handleClearFilter = () => {
    setSearchQuery(""); // Clear search query
    setSelectedCategory(null); // Clear selected category
    setFilteredReports(reports); // Show all reports again
  };

  // Sort reports by date (ascending/descending)
  const sortReportsByDateAsc = () => {
    setFilteredReports((prevReports: Report[]) => {
      const sortedReports = [...prevReports];
      sortedReports.sort((a, b) => {
        const dateA = a.timeOfCrime ? new Date(a.timeOfCrime).getTime() : 0;
        const dateB = b.timeOfCrime ? new Date(b.timeOfCrime).getTime() : 0;
        return dateA - dateB; // Ascending order
      });
      return sortedReports;
    });
    setIsSortedAsc(true); // Set sorting state to ascending
  };

  const sortReportsByDateDesc = () => {
    setFilteredReports((prevReports: Report[]) => {
      const sortedReports = [...prevReports];
      sortedReports.sort((a, b) => {
        const dateA = a.timeOfCrime ? new Date(a.timeOfCrime).getTime() : 0;
        const dateB = b.timeOfCrime ? new Date(b.timeOfCrime).getTime() : 0;
        return dateB - dateA; // Descending order
      });
      return sortedReports;
    });
    setIsSortedAsc(false); // Set sorting state to descending
  };
  // Sort reports alphabetically by title
  const sortReportsByAlphabetAsc = () => {
    setFilteredReports((prevReports: any) => {
      const sortedReports = [...prevReports].sort((a, b) => {
        return a.category.localeCompare(b.category);
      });
      return sortedReports;
    });
  };

  // Sort reports alphabetically by title
  const sortReportsByAlphabetDesc = () => {
    setFilteredReports((prevReports: any) => {
      const sortedReports = [...prevReports].sort((a, b) => {
        return b.category.localeCompare(a.category);
      });
      return sortedReports;
    });
  };

  const sortReportsByStatus = () => {
    // Cycle through status types
    const nextStatus =
      currentStatusSort === false
        ? true
        : currentStatusSort === true
          ? false
          : false;

    setCurrentStatusSort(nextStatus); // Update the state to the next status

    // Sort the reports based on the new status
    setFilteredReports((prevReports: any) => {
      const sortedReports = [...prevReports].sort((a, b) => {
        const statusOrder = [true, false];
        // Sort reports by the status order
        return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
      });
      return sortedReports;
    });
  };

  //DropDown Sorter
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([
    { label: "Sort by Date (Earliest)", value: "date-asc" },
    { label: "Sort by Date (Latest)", value: "date-desc" },
    { label: "Sort by Alphabet (A-Z)", value: "alphabet-asc" },
    { label: "Sort by Alphabet (Z-A)", value: "alphabet-desc" },
    { label: "Sort by Crime Category", value: "category" },
    { label: "Sort by Status", value: "status" },
  ]);

  const handleDropDownChange = (selectedValue: any) => {
    switch (selectedValue) {
      case "date-asc":
        sortReportsByDateAsc();
        break;
      case "date-desc":
        sortReportsByDateDesc();
        break;
      case "alphabet-asc":
        sortReportsByAlphabetAsc();
        break;
      case "alphabet-desc":
        sortReportsByAlphabetDesc();
        break;
      case "status":
        sortReportsByStatus(); // Call the sort function when "Sort by Status" is selected
        break;
      case "category":
        setCategoryModalVisible(true); // Show category modal
        break;
      default:
        break;
    }
    console.log(selectedValue);
  };

  return (
    <View
      style={[
        {
          zIndex: 1,
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 20,
        },
      ]}
    >
      <View style={{ flexDirection: "row" }}>
        <TextInput
          placeholder="Search reports..."
          value={searchQuery}
          onChangeText={handleSearch}
          style={{
            width: 200,
            borderWidth: 1,
            borderColor: "#000",
            borderRadius: 8,
            padding: 8,
          }}
        />
        <View style={{ alignSelf: "center", left: -40 }}>
          <Ionicons name={"search-outline"} size={24} />
        </View>
        {route.name === "ViewAdminEmergencyList" ? (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginTop: 10,
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: "#115272",
                paddingHorizontal: 20,
                borderRadius: 8,
                marginRight: 10,
                width: 100,
                height: 50,
                justifyContent: "center",
              }}
              onPress={handleExport}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: "bold",
                  alignSelf: "center",
                }}
              >
                Export
              </Text>
            </TouchableOpacity>
            {/* <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Button title="Pick an Excel File" onPress={pickFile} />
              {excelData && <Text>{JSON.stringify(excelData, null, 2)}</Text>}
              <Button
                title={uploading ? "Uploading..." : "Upload Data to Firestore"}
                onPress={uploadToFirestore}
                disabled={uploading}
              />
            </View> */}
            <TouchableOpacity
              style={{
                backgroundColor: "#115272",
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 8,
                marginRight: 10,
                width: 100,
                height: 50,
                justifyContent: "center",
              }}
              onPress={handleImport}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: "bold",
                  alignSelf: "center",
                }}
              >
                Import
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      <View
        style={[
          {
            alignSelf: "flex-end",
            paddingRight: 40,
            width: "25%",
            flexDirection: "row",
            gap: 20,
          },
          isAlignedRight && {
            left: -450,
          },
        ]}
      >
        <ClearFilter handleClearFilter={handleClearFilter} />
        <View style={{ width: "75%" }}>
          <DropDownPicker
            multiple={false}
            open={open}
            value={value}
            items={items}
            setOpen={setOpen}
            setItems={setItems}
            setValue={setValue}
            onChangeValue={handleDropDownChange}
            placeholder="Filter or Sort"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({});

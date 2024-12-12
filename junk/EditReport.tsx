import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
  } from "react-native";
  import React from "react";
  import { router } from "expo-router";
  import { styles } from "@/styles/styles";
  import { Ionicons } from "@expo/vector-icons";
  import { SpacerView } from "@/components/SpacerView";
  import { webstyles } from "@/styles/webstyles";
  
  const EditReportMobile = ({
    isDropdownVisible,
    setIsDropdownVisible,
    selectedValue,
    crimeTypes,
    handleSelect,
    location,
    setLocation,
    additionalInfo,
    setAdditionalInfo,
    handleSubmit,
  }: {
    isDropdownVisible: any;
    setIsDropdownVisible: any;
    selectedValue: any;
    crimeTypes: any;
    handleSelect: any;
    location: any;
    setLocation: any;
    additionalInfo: any;
    setAdditionalInfo: any;
    handleSubmit: any;
  }) => {
    return (
      <View style={styles.mainContainer}>
        {/* Blue Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Edit a Report</Text>
          <SpacerView height={120} />
        </View>
  
        <View style={styles.formContainer}>
          <TouchableOpacity
            style={webstyles.dropdown}
            onPress={() => setIsDropdownVisible(!isDropdownVisible)}
          >
            <Text style={webstyles.selectedText}>
              {selectedValue || "Select Crime Type"}
            </Text>
            <Ionicons name="chevron-down" size={24} color="gray" />
          </TouchableOpacity>
  
          {isDropdownVisible && (
            <FlatList
              data={crimeTypes}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={webstyles.item}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={webstyles.itemText}>{item.label}</Text>
                </TouchableOpacity>
              )}
              style={webstyles.dropdownList} // Optional: Add styles to control dropdown position
            />
          )}
  
          <TextInput
            style={styles.textInput}
            placeholder="Location"
            value={location}
            onChangeText={setLocation}
          />
  
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Additional Information"
            value={additionalInfo}
            onChangeText={setAdditionalInfo}
            multiline={true}
          />
  
          <TouchableOpacity style={styles.imageUpload}>
            <Ionicons name="image-outline" size={24} color="gray" />
            <Text style={styles.uploadText}>Add file</Text>
          </TouchableOpacity>
        </View>
  
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => console.log("Cancel")}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={[styles.buttonText, { color: "#FFF" }]}>
              Submit Report
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  export default EditReportMobile;
  
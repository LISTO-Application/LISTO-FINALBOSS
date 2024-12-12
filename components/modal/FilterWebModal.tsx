import { CrimeFilter } from "@/app/(tabs)/crimemap";
import { View, Pressable, Image, Text, StyleSheet } from "react-native";


const FilterWebModal = ({
  confirmFilter,
  handleFilterCrimeButtonClick,
  selectedCrimeFilters,
}: {
  confirmFilter: any;
  handleFilterCrimeButtonClick: any;
  selectedCrimeFilters: CrimeFilter[];
}) => {
  let images = [
    { source: require("../../assets/images/knife-icon.png"), label: "murder" },
    {
      source: require("../../assets/images/homicide-icon.png"),
      label: "homicide",
    },
    { source: require("../../assets/images/thief-icon.png"), label: "theft" },
    {
      source: require("../../assets/images/car-icon.png"),
      label: "carnapping",
    },
    { source: require("../../assets/images/injury-icon.png"), label: "injury" },
    {
      source: require("../../assets/images/robbery-icon.png"),
      label: "robbery",
    },
    { source: require("../../assets/images/rape-icon.png"), label: "rape" },
  ];

  return (
    <View style={filterStyle.crimeFilterModalContainer}>
      <View style={filterStyle.crimeFilterModal}>
        <Text style={filterStyle.crimeFilterTitle}>Choose your filter</Text>

        {/* Render the images as toggleable buttons */}
        <View style={filterStyle.crimeFilters}>
          {images.map((image, index) => (
            <View style = {{flexDirection: "column"}}>
              <Pressable
                key={index}
                onPress={() => handleFilterCrimeButtonClick(image)} // Toggle this button's active state
                style={{
                  alignItems: "center",
                  borderStyle: "solid",
                  borderColor: "#115272",
                  borderWidth: 2,
                  margin: 10,
                  backgroundColor: selectedCrimeFilters.some(
                    (filter) => filter.label === image.label
                  )
                    ? "#E63B36"
                    : "#E07875", // Change color based on active status
                  width: 85,
                  height: 85,
                  justifyContent: "center",
                  borderRadius: 10,
                }}
              >
                <Image
                  source={image.source}
                  style={{
                    width: 50,
                    height: 50,
                  }}
                />
              </Pressable>
              <Text style={{ color: "#115272", fontSize: 14, fontWeight: "bold" }}>{image.label.charAt(0).toUpperCase() + image.label.slice(1)}</Text>
            </View>
          ))}
        </View>

        {/* Centered close button */}
        <Pressable
          onPress={confirmFilter}
          style={{
            marginTop: 20,
            alignSelf: "center",
            backgroundColor: "#115272",
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 25,
          }}
        >
          <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>Confirm</Text>
        </Pressable>
      </View>
    </View>
  );
};

const filterStyle = StyleSheet.create({
  crimeFilterModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  crimeFilterModal: {
    width: "auto",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    height: "30%",
  },
  crimeFilterTitle: {
    color: "#115272",
    fontSize: 24, // Increase the font size for better visibility
    fontWeight: "bold", // Optional: make the text bold for emphasis
    textAlign: "center", // Center the text horizontally
    marginBottom: 20, // Add some space below the text
  },
  crimeFilters: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-evenly",
  },
});

export default FilterWebModal;

import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import React, { useCallback, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, { ModeType, DateType } from "react-native-ui-datepicker";
import dayjs from "dayjs";
import { TouchableOpacity } from "react-native-gesture-handler";
import { MarkerType } from "@/constants/data/marker";
import isBetween from "dayjs/plugin/isBetween";

const DateModal = ({
  setToggleModal,
  setSelectedDate,
  setMarkers,
  allMarkers,
  setIsAddingMarker,
  dateFunction,
  setDateFunction,
  mode,
  setMode,
  setFilteredCrimeItems,
  filteredCrimeItems,
  selectedCrimeFilters,
}: {
  setSelectedDate: any;
  setToggleModal: (visible: boolean) => void;
  setMarkers: any;
  allMarkers: any;
  setIsAddingMarker: any;
  dateFunction: DateType | undefined;
  setDateFunction: any;
  mode: ModeType;
  setMode: (mode: ModeType) => void;
  setFilteredCrimeItems: any;
  filteredCrimeItems: any;
  selectedCrimeFilters: any;
}) => {
  dayjs.extend(isBetween);
  //States
  console.log("allmarkers", allMarkers);
  console.log("filteredCrimeItems", filteredCrimeItems);
  const [timePicker, setTimePicker] = useState(false);
  const [range, setRange] = React.useState<{
    startDate: DateType;
    endDate: DateType;
  }>({ startDate: undefined, endDate: undefined });
  const [dates, setDates] = useState<DateType[] | undefined>();
  const [locale, setLocale] = useState("en");

  const onChangeMode = useCallback(
    (value: ModeType) => {
      setDateFunction(undefined);
      setRange({ startDate: undefined, endDate: undefined });
      setDates(undefined);
      setMode(value);
    },
    [setMode, setDateFunction, setRange, setDates]
  );
  //Filter Function
  const filterMarkersByDate = (
    mode: string,
    selectedDates: Date | Date[] | { startDate: Date; endDate: Date }
  ) => {
    if (mode === "range" || mode === "multiple") {
      setIsAddingMarker(false);
    }
    setFilteredCrimeItems(() => {
      return allMarkers.filter((marker: any) => {
        const markerDate = dayjs(marker.date, "MM-DD-YYYY").toDate();
        let dateMatch = false;
        console.log(markerDate);

        // console.log("Date Function: ", dateFunction.format("YYYY-MM-DD"));
        if (mode === "single") {
          dateMatch = dayjs(markerDate).isSame(selectedDates as Date, "day");
        } else if (mode === "range") {
          const { startDate, endDate } = selectedDates as {
            startDate: Date;
            endDate: Date;
          };
          dateMatch = dayjs(markerDate).isBetween(
            startDate,
            endDate,
            "day",
            "[]"
          );
        } else if (mode === "multiple") {
          const datesArray = selectedDates as Date[];
          dateMatch = datesArray.some((date) =>
            dayjs(markerDate).isSame(date, "day")
          );
        } else {
          dateMatch = true; // Fallback for unexpected cases
        }
        const crimeMatch =
          selectedCrimeFilters.length === 0 ||
          selectedCrimeFilters.some(
            (filter: { label: any }) => filter.label === marker.crime
          );
        console.log("Is matched", crimeMatch && dateMatch);
        return dateMatch && crimeMatch;
      });
    });
  };
  console.log(filteredCrimeItems);
  const confirmDateSelection = () => {
    let selectedDateInput: any;
    if (mode === "single" && dateFunction) {
      selectedDateInput = dateFunction;
    } else if (mode === "range" && range.startDate && range.endDate) {
      selectedDateInput = {
        startDate: range.startDate,
        endDate: range.endDate,
      };
    } else if (mode === "multiple" && dates) {
      selectedDateInput = dates;
    } else {
      alert("Incomplete date selection, please selected a date first.");
      return;
    }
    filterMarkersByDate(mode, selectedDateInput);
    setToggleModal(false);
  };

  //Buttons to change modes
  const handleSingleChange = useCallback((params: { date: Date | string }) => {
    setDateFunction(dayjs(params.date));
    setSelectedDate(dayjs(params.date));
  }, []);

  const handleRangeChange = useCallback(
    (params: { startDate: DateType; endDate: DateType }) => {
      setRange(params);
    },
    []
  );

  const handleMultiChange = useCallback((params: { dates: DateType[] }) => {
    setDates(params.dates);
  }, []);
  //onChange to check the mode type
  const onChange =
    mode === "single"
      ? handleSingleChange
      : mode === "range"
        ? handleRangeChange
        : mode === "multiple"
          ? handleMultiChange
          : undefined;

  //Console Logs
  const dateSingle = dateFunction
    ? dayjs(dateFunction)
        .locale(locale)
        .format(timePicker ? "MMMM, DD, YYYY - HH:mm" : "MMMM, DD, YYYY")
    : "...";

  const dateStartRange = range.startDate
    ? dayjs(range.startDate).locale(locale).format("MM-DD-YYYY")
    : "...";
  const dateEndRange = range.endDate
    ? dayjs(range.endDate).locale(locale).format("MM-DD-YYYY")
    : "...";

  dates &&
    dates.map((d) => {
      const dateMultiple = dayjs(d).locale(locale).format("MM-DD-YYYY");
      console.log("multiple dates:", dateMultiple);
    });
  return (
    <View style={styles.centeredView}>
      <View style={styles.modalView}>
        <Pressable
          style={[styles.button, styles.buttonClose]}
          onPress={() => setToggleModal(false)}
        >
          <Ionicons name="close" size={24} />
        </Pressable>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "space-between",
            gap: 6,
            alignItems: "center",
          }}
        >
          <Text style={{ marginRight: 8 }}>Mode:</Text>
          <Pressable
            style={[styles.modeSelect, styles.button]}
            onPress={() => onChangeMode("single")}
          >
            <Text style={[styles.modeSelectText]}>Single</Text>
          </Pressable>
          <Pressable
            style={[styles.modeSelect]}
            onPress={() => onChangeMode("range")}
          >
            <Text style={[styles.modeSelectText]}>Range</Text>
          </Pressable>
          <Pressable
            style={[
              styles.modeSelect,
              // eslint-disable-next-line react-native/no-inline-styles
            ]}
            onPress={() => onChangeMode("multiple")}
          >
            <Text style={[styles.modeSelectText]}>Multiple</Text>
          </Pressable>
        </View>
        <DateTimePicker
          mode={mode}
          date={dateFunction}
          onChange={onChange}
          locale={locale}
          startDate={range.startDate}
          endDate={range.endDate}
          dates={dates}
          initialView={"day"}
          displayFullDays={true}
          selectedItemColor={"#115272"}
        />
        <View style={styles.dateContainer}>
          {mode === "single" ? (
            <View>
              <Text style={{ fontWeight: "bold" }}>Date:</Text>
              <Text>{dateSingle}</Text>
            </View>
          ) : mode === "range" ? (
            <View>
              <Text style={{ fontWeight: "bold" }}>Start Date:</Text>
              <Text>{dateStartRange}</Text>
              <Text style={{ fontWeight: "bold" }}>End Date:</Text>
              <Text>{dateEndRange}</Text>
            </View>
          ) : mode === "multiple" ? (
            <View>
              <Text style={{ fontWeight: "bold" }}>Selected Dates:</Text>
              {dates &&
                dates.map((d, index) => (
                  <Text key={index}>
                    {dayjs(d).locale(locale).format("MMMM, DD, YYYY")}
                  </Text>
                ))}
            </View>
          ) : null}
        </View>
        <View style={styles.buttonContainer}>
          <Pressable style={styles.actionButton} onPress={confirmDateSelection}>
            <Text style={styles.buttonText} numberOfLines={1}>
              Confirm Dates
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default DateModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Dim background
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },
  buttonClose: {
    backgroundColor: "fff",
    position: "absolute",
    top: 10,
    right: 10,
    borderRadius: 20,
    zIndex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 20,
    width: "100%",
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#115272",
    borderRadius: 10,
    alignItems: "center",
    flexShrink: 1,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  modeSelect: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#115272",
  },
  modeSelectText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "white",
  },
});
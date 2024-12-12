import {
  Text,
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import React, { Component, useState } from "react";
import { webstyles } from "@/styles/webstyles";
import { format } from "date-fns";
import dayjs from "dayjs";

export default function ValidateReportCard({
  report,
  handleTitlePress,
  handleStatusChange,
}: {
  report: any;
  handleTitlePress: any;
  handleStatusChange: (reportId: string, newStatus: number) => void;
}) {
  const [isImageZoomVisible, setIsImageZoomVisible] = useState(false);
  console.log(report.timeReported);
  const timeReported = new Date(
    report.timeReported._seconds * 1000 +
      report.timeReported._nanoseconds / 1000000
  );
  const date = new Date(
    report.timeOfCrime._seconds * 1000 +
      report.timeOfCrime._nanoseconds / 1000000
  );
  console.log(date);
  console.log(timeReported);
  const parsedDate = format(date, "yyyy-MM-dd");
  const parsedTimeCrime = format(date, "hh:mm");
  const parsedTimeReported = format(timeReported, "hh:mm a");
  console.log(parsedTimeReported);
  // const parsedDate = format(report.date, "yyyy-MM-dd");
  // console.log(parsedDate);
  // console.log(new Date(report.timestamp * 1000));
  // const timestamp = new Date(report.timestamp * 1000);
  // const localTime = dayjs(timestamp).format("hh:mm A");
  // console.log(format(new Date(report.timestamp * 1000), "hh:mm a"));

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
      }}
    >
      <View style={{ flexDirection: "row", gap: 20 }}>
        <TouchableOpacity onPress={() => setIsImageZoomVisible(true)}>
          {report.image ? (
            <View style={style.imageContainer}>
              <Image
                source={{ uri: report.image.uri }}
                style={style.image}
                resizeMode="cover"
              />
            </View>
          ) : (
            <View style={style.imageContainer}>
              <Image
                source={require("@/assets/images/question.png")}
                style={style.image}
                resizeMode="cover"
              />
            </View>
          )}
        </TouchableOpacity>
        <View style={{ flexDirection: "column", alignSelf: "center" }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity onPress={() => handleTitlePress(report)}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#115272",
                }}
              >
                {report.category.charAt(0).toUpperCase() +
                  report.category.slice(1)}
              </Text>
            </TouchableOpacity>
            <Text
              style={{
                color: "#115272",
                fontSize: 14,
                marginLeft: 10,
              }}
            >
              {parsedDate} &nbsp; {parsedTimeCrime}
            </Text>
          </View>
          {/* Report Category */}
          <Text style={{ color: "#115272", marginTop: 5 }}>
            {`Category: ${report.category.charAt(0).toUpperCase() + report.category.slice(1)}`}
          </Text>
          {/* Report Location */}
          <Text style={{ color: "#115272", marginTop: 5 }}>
            {`Location: ${report.location || "Not provided"}`}
          </Text>
        </View>
      </View>
      {/* Action Buttons */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-end",
          alignItems: "center",
          alignSelf: "flex-end",
          marginTop: 10,
        }}
      >
        {report.status === 1 ? (
          <>
            <TouchableOpacity
              style={{
                backgroundColor: "#28a745",
                paddingVertical: 5,
                paddingHorizontal: 10,
                borderRadius: 5,
                marginLeft: 5,
              }}
              onPress={() => handleStatusChange(report.id, 2)} // Validate: Change status to 2 (valid)
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 20,
                  textAlign: "center",
                }}
              >
                Validate
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: "#dc3545",
                paddingVertical: 5,
                paddingHorizontal: 10,
                borderRadius: 5,
                marginLeft: 5,
              }}
              onPress={() => handleStatusChange(report.id, 0)} // Archive: Change status to 0 (archived)
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 20,
                  textAlign: "center",
                }}
              >
                Archive
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text
            style={{
              color:
                report.status === 2
                  ? "#28a745"
                  : report.status === 0
                    ? "#6c757d"
                    : "#6c757d",
              fontWeight: "bold",
              fontSize: 20,
              textAlign: "right",
            }}
          >
            {report.status === 2 ? "Valid" : "Archived"}
          </Text>
        )}
      </View>
      <Modal
        visible={isImageZoomVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsImageZoomVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsImageZoomVisible(false)}>
          <View style={webstyles.modalContainer}>
            <View
              style={{
                width: "80%",
                padding: 20,
                borderRadius: 10,
                elevation: 5, // For shadow effect on Android
                shadowColor: "#000", // iOS shadow
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                alignItems: "center",
              }}
            >
              {report.image ? (
                <View style={{ width: 500, height: 500 }}>
                  <Image
                    source={{ uri: report.image.uri }}
                    style={style.image}
                    resizeMode="cover"
                  />
                </View>
              ) : (
                <View style={style.imageContainer}>
                  <Image
                    source={require("@/assets/images/question.png")}
                    style={style.image}
                    resizeMode="cover"
                  />
                </View>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
const style = StyleSheet.create({
  imageContainer: {
    alignItems: "center",
    borderRadius: 10,
    width: 100,
    height: 100,
  },
  image: {
    objectFit: "contain",
    width: "100%", // Increase width
    height: "100%", // Increase height
    borderRadius: 10, // Optional, keep or remove based on design preference
    borderWidth: 1,
  },
});

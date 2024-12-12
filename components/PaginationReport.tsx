import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { webstyles } from "@/styles/webstyles";

export default function PaginationReport({
  filteredReports,
  reportsPerPage,
  currentPage,
  setCurrentPage,
  isAlignedRight,
}: {
  filteredReports: any;
  reportsPerPage: any;
  currentPage: any;
  setCurrentPage: any;
  isAlignedRight: any;
}) {
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  return (
    <View
      style={[
        webstyles.paginationContainer,
        isAlignedRight && { width: "75%" },
      ]}
    >
      <TouchableOpacity
        disabled={currentPage === 1}
        onPress={handlePreviousPage}
        style={webstyles.paginationButton}
      >
        <Text style={webstyles.paginationTextButton}>Previous</Text>
      </TouchableOpacity>
      <Text style={webstyles.paginationText}>
        Page {currentPage} of {totalPages}
      </Text>
      <TouchableOpacity
        disabled={currentPage === totalPages}
        onPress={handleNextPage}
        style={webstyles.paginationButton}
      >
        <Text style={webstyles.paginationTextButton}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

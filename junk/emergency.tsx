<SearchSort
reports={crimes}
setCategoryModalVisible={setCategoryModalVisible}
setFilteredReports={setFilteredReports}
isAlignedRight={isAlignedRight}
filterReports={filterReports}
handleExport={handleExport}
handleImport={handleImport}
pickFile={() => {}} // Add appropriate function or state
excelData={[]} // Add appropriate state
uploading={false} // Add appropriate state
uploadToFirestore={() => {}} // Add appropriate function
/>

<TitleCard />

<SideBar sideBarPosition={sideBarPosition} navigation={navigation} />
{/* Toggle Button */}
<TouchableOpacity
  onPress={toggleSideBar}
  style={[
    webstyles.toggleButton,
    { left: isSidebarVisible ? sidebarWidth : 10 }, // Adjust toggle button position
  ]}
>
  <Ionicons
    name={isSidebarVisible ? "chevron-back" : "chevron-forward"}
    size={24}
    color={"#333"}
  />
</TouchableOpacity>
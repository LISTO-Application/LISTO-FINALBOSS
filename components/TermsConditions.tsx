import {
  Modal,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Platform,
  Pressable,
} from "react-native";
import React from "react";
import { SpacerView } from "./SpacerView";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import { ThemedButton } from "./ThemedButton";

const TermsConditions = ({
  setToggleModal,
}: {
  setToggleModal: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <SpacerView
      style={[
        Platform.OS === "web"
          ? { width: "50%", height: "75%" }
          : { width: "100%", height: "100%" },
        registerStyle.shadowBox,
        {
          height: "75%",
          alignSelf: "center",
          borderRadius: 20,
        },
      ]}
    >
      <ThemedView
        style={[
          Platform.OS === "web" ? { width: "50%" } : { width: "100%" },
          {
            flex: 1,
            backgroundColor: "white",
            height: "100%",
            borderRadius: 20,
            flexDirection: "column",
            alignItems: "center",
            padding: 30,
          },
        ]}
      >
        <ScrollView
          style={{
            width: "100%",
          }}
        >
          <ThemedText type="title" darkColor="#115272">
            Terms & Conditions
          </ThemedText>
          <ThemedText
            style={{
              color: "black",
              padding: 20,
              textAlign: "justify",
            }}
          >
            These terms, conditions, and data privacy notice governs the use of
            the application. Please read it carefully to understand how we
            collect, use, protect, and handle your personal data in accordance
            with Republic Act 10173, also known as the “Data Privacy Act of
            2012”.
          </ThemedText>

          <ThemedText type="subtitle" darkColor="#115272">
            1. Introduction
          </ThemedText>
          <ThemedText
            style={{
              color: "black",
              padding: 20,
              textAlign: "justify",
            }}
          >
            This application (hereafter referred to as “LISTO: A Web and
            Mobile-based Crime Mapping and Incident Reporting Application for
            Selected Quezon City Barangays”) provides users with a platform to
            view crime data on a heat map, report crimes, and contact local
            authorities. The platform collects minimal personal data such as
            name, gender, phone number, email address, and date of birth for
            user identification and to ensure proper communication with relevant
            authorities when reporting incidents.
          </ThemedText>

          <ThemedText type="subtitle" darkColor="#115272">
            2. Data Collection
          </ThemedText>
          <ThemedText
            style={{
              color: "black",
              padding: 20,
              textAlign: "justify",
            }}
          >
            By using the application, you consent to the collection and
            processing of the following personal information:{"\n"}
            <Text style={{ fontWeight: "bold" }}>- Full name</Text>
            {"\n"}
            <Text style={{ fontWeight: "bold" }}>- Contact number</Text>
            {"\n"}
            <Text style={{ fontWeight: "bold" }}>- Email address</Text>
            {"\n"}
            {"\n"}
            This information is collected only when you sign up to provide it
            during account creation, and will be used when submitting a report
            to authorities, or when using the "Contact Local Authorities"
            feature.
          </ThemedText>

          <ThemedText type="subtitle" darkColor="#115272">
            3. Purpose of Data Collection
          </ThemedText>
          <ThemedText
            style={{
              color: "black",
              padding: 20,
              textAlign: "justify",
            }}
          >
            We collect and process your personal data for the following
            purposes:{"\n"}
            <Text style={{ fontWeight: "bold" }}>- Identification:</Text> To
            properly identify users when submitting reports or inquiries to
            authorities.{"\n"}
            <Text style={{ fontWeight: "bold" }}>- Communication:</Text> To
            contact users in case authorities need further information regarding
            a submitted report.{"\n"}
            <Text style={{ fontWeight: "bold" }}>
              - Service Improvement:
            </Text>{" "}
            To improve the platform’s user interface and crime heat map services
            based on user behavior and feedback.{"\n"}
            <Text style={{ fontWeight: "bold" }}>- Incident Reporting:</Text> To
            facilitate the direct reporting of crimes to local authorities and
            enable proper follow-up actions.{"\n"}
          </ThemedText>

          <ThemedText type="subtitle" darkColor="#115272">
            4. How We Use Your Information
          </ThemedText>
          <ThemedText
            style={{
              color: "black",
              padding: 20,
              textAlign: "justify",
            }}
          >
            Your data will only be used for the following specific purposes:
            {"\n"}- To submit crime reports to the local authorities.{"\n"}- To
            contact local authorities using the "Contact" button for emergency
            reporting.{"\n"}
          </ThemedText>

          <ThemedText type="subtitle" darkColor="#115272">
            5. Data Sharing and Disclosure
          </ThemedText>
          <ThemedText
            style={{
              color: "black",
              padding: 20,
              textAlign: "justify",
            }}
          >
            Your personal data will not be shared with any third-party
            organizations except for the following circumstances:{"\n"}
            <Text style={{ fontWeight: "bold" }}>
              - Local Authorities:
            </Text>{" "}
            When you submit a crime report or use the emergency contact button,
            relevant personal data (such as name, contact number, and report
            details) will be shared with the respective local authorities for
            response and investigation purposes.{"\n"}
            <Text style={{ fontWeight: "bold" }}>- Legal Obligations:</Text> We
            may disclose personal information if required by law, including
            compliance with Republic Act 10173 (Data Privacy Act of 2012).{"\n"}
          </ThemedText>

          <ThemedText type="subtitle" darkColor="#115272">
            6. Data Retention
          </ThemedText>
          <ThemedText
            style={{
              color: "black",
              padding: 20,
              textAlign: "justify",
            }}
          >
            Your personal information will be retained only for as long as
            necessary to fulfill the purpose for which it was collected. This
            includes maintaining crime reports, responding to incidents, and
            improving the platform. Once the data has reached a certain time
            threshold, it will be securely deleted or anonymized in accordance
            with the data retention policy.
          </ThemedText>

          <ThemedText type="subtitle" darkColor="#115272">
            7. Data Protection Measures
          </ThemedText>
          <ThemedText
            style={{
              color: "black",
              padding: 20,
              textAlign: "justify",
            }}
          >
            We implement appropriate technical, organizational, and
            administrative security measures to protect your personal data from
            unauthorized access, alteration, disclosure, or destruction. These
            measures include but are not limited to encryption, access control
            policies, and secure data storage.
          </ThemedText>

          <ThemedText type="subtitle" darkColor="#115272">
            8. Your Rights
          </ThemedText>
          <ThemedText
            style={{
              color: "black",
              padding: 20,
              textAlign: "justify",
            }}
          >
            Under the Data Privacy Act of 2012, you have the following rights
            regarding your personal data:{"\n"}
            <Text style={{ fontWeight: "bold" }}>- Right to Access:</Text> You
            have the right to request access to your personal data and know how
            it is being used.{"\n"}
            <Text style={{ fontWeight: "bold" }}>
              - Right to Rectification:
            </Text>{" "}
            You may request to update or correct your personal data if it is
            inaccurate or outdated.{"\n"}
            <Text style={{ fontWeight: "bold" }}>- Right to Erasure:</Text> You
            may request the deletion of your personal data, provided that it is
            no longer needed for the purposes for which it was collected.{"\n"}
            <Text style={{ fontWeight: "bold" }}>- Right to Object:</Text> You
            may object to the processing of your data under specific
            circumstances.{"\n"}
            <Text style={{ fontWeight: "bold" }}>
              - Right to Data Portability:
            </Text>{" "}
            You may request a copy of your personal data in a structured and
            commonly used format.{"\n"}
          </ThemedText>

          <ThemedText type="subtitle" darkColor="#115272">
            9. Consent
          </ThemedText>
          <ThemedText
            style={{
              color: "black",
              padding: 20,
              textAlign: "justify",
            }}
          >
            By using the application, you consent to the collection, use, and
            sharing of your personal information as described in this notice. If
            you do not agree with any part of these terms, please discontinue
            using the platform immediately.
          </ThemedText>

          <ThemedText type="subtitle" darkColor="#115272">
            10. Amendments
          </ThemedText>
          <ThemedText
            style={{
              color: "black",
              padding: 20,
              textAlign: "justify",
            }}
          >
            We reserve the right to modify these terms, conditions and data
            privacy notice at any time. Any changes will be communicated via the
            platform, and your continued use of the application following any
            amendments will constitute your acceptance of the changes.
          </ThemedText>

          <ThemedText type="subtitle" darkColor="#115272">
            11. Contact Information
          </ThemedText>
          <ThemedText
            style={{
              color: "black",
              padding: 20,
              textAlign: "justify",
            }}
          >
            If you have any questions or concerns about the data privacy
            practices, or if you wish to exercise your rights under the Data
            Privacy Act of 2012, please contact us at:{"\n"}- Email:
            mark.agraviador.cics@ust.edu.ph{"\n"}- Phone: (+63)9560562757{"\n"}
          </ThemedText>

          <ThemedText
            style={{
              color: "black",
              padding: 20,
              textAlign: "justify",
            }}
          >
            By using this platform, you confirm that you have read and
            understood this Terms and Conditions and Data Privacy Notice, and
            you agree to its terms.
          </ThemedText>
          <ThemedButton
            title="Close"
            width="auto"
            style={{ justifyContent: "center", alignSelf: "center" }}
            onPress={() => setToggleModal(false)}
          />
        </ScrollView>
      </ThemedView>
    </SpacerView>
  );
};

export default TermsConditions;

const registerStyle = StyleSheet.create({
  shadowBox: {
    shadowColor: "#333333",
    shadowOffset: {
      width: 10,
      height: 10,
    },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
});

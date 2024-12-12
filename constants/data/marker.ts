import { GeoPoint } from "@react-native-firebase/firestore";
import { Double } from "react-native/Libraries/Types/CodegenTypes";

export type CrimeType =
  | "murder"
  | "homicide"
  | "robbery"
  | "carnapping"
  | "injury"
  | "theft"
  | "rape";

export interface MarkerType {
  id: string;
  location: string;
  coordinate: GeoPoint;
  date: string;
  additionalInfo: string | undefined;
  crime: CrimeType;
  image: any;
}

export const crimeImages: { [key in CrimeType]: any } = {
  murder: require("@/assets/images/knife-icon.png"),
  homicide: require("@/assets/images/homicide-icon.png"),
  robbery: require("@/assets/images/robbery-icon.png"),
  carnapping: require("@/assets/images/car-icon.png"),
  injury: require("@/assets/images/injury-icon.png"),
  theft: require("@/assets/images/thief-icon.png"),
  rape: require("@/assets/images/rape-icon.png"),
};
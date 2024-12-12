import { GeoPoint } from "@react-native-firebase/firestore";
import dayjs from "dayjs";
import { Image } from "react-native-reanimated/lib/typescript/Animated";

export interface Report {
  uid: string;
  phone: string;
  category:
    | "murder"
    | "robbery"
    | "homicide"
    | "injury"
    | "rape"
    | "carnapping"
    | "theft";
  additionalInfo: string;
  location: string;
  coordinate: GeoPoint;
  image: {
    filename: string;
    uri: string;
  };
  name: string | null;
  status: number;
  time: string;
  timeOfCrime: Date; // Ensure it's a Date object
  timeReported: Date; // Ensure it's a Date object
  unixTOC: number;
  id: string;
}

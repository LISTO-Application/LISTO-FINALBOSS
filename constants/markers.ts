import { CrimeType, MarkerType } from "@/constants/data/marker";
import { db } from "@/app/FirebaseConfig";

import {
  collection,
  GeoPoint,
  getDocs,
  query,
} from "@react-native-firebase/firestore";

export type MarkerProps = {
  coordinate: string;
  weight: number;
}[];

export type MarkersCollection = MarkerProps;

export async function loadMarkersFromFirestore(): Promise<MarkerProps> {
  try {
    const crimesCollection = collection(db, "crimes");
    const q = query(crimesCollection);
    const querySnapshot = await getDocs(q);
    const markers: MarkerType[] = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      let coordinate;
      if (data.coordinate instanceof GeoPoint) {
        // If it's already a GeoPoint, keep it as is
        coordinate = data.coordinate;
      } else if (
        data.coordinate &&
        data.coordinate._lat &&
        data.coordinate._long
      ) {
        // If it's an object with _lat and _long, convert it to GeoPoint
        coordinate = new GeoPoint(data.coordinate._lat, data.coordinate._long);
      } else if (
        data.coordinates &&
        data.coordinates._lat &&
        data.coordinates._long
      ) {
        // If it's from coordinates (old format), convert to GeoPoint
        coordinate = new GeoPoint(
          data.coordinates._lat,
          data.coordinates._long
        );
      }

      return {
        id: doc.id, // Use Firestore document ID
        location: data.location || "",
        coordinate: coordinate, // Cast to GeoPoint
        title: data.title || "",
        date: data.date || "",
        details: data.details,
        crime: data.crime as CrimeType, // Cast to CrimeType
        image: data.image,
      };
    });
    console.log("Markers.ts", markers);

    const coordinateWeights: Record<string, number> = {};

    markers.forEach((marker) => {
      const key = `${marker.coordinate.latitude},${marker.coordinate.longitude}`;

      if (!coordinateWeights[key]) {
        coordinateWeights[key] = 1;
      } else {
        coordinateWeights[key] += 1;
      }
    });

    const result = Object.entries(coordinateWeights).map(
      ([coordinate, weight]) => ({
        coordinate,
        weight,
      })
    );
    console.log("Results", result);
    return result;
  } catch (error) {
    console.error("Error fetching markers from Firestore:", error);
    throw error;
  }
}

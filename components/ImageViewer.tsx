import { Image, type ImageSource } from "expo-image";
import { webstyles } from "@/styles/webstyles";

const ImageViewer = ({ imageSource }: { imageSource: string }) => {
  return <Image source={imageSource} style={webstyles.image} />;
};

export default ImageViewer;

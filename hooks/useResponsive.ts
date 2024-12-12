import { useWindowDimensions } from "react-native";
import { useMemo } from "react";

const useResponsive = () => {
  const { width, height } = useWindowDimensions();

  const responsive = useMemo(() => {
    let display: number;
    let subDisplay: number;
    let title: number;
    let subtitle: number;
    let body: number;
    let small: number;
    let tiny: number;

    if (width > 360) {
      display = 54;
      subDisplay = 42;
      title = 32;
      subtitle = 20;
      body = 16;
      small = 12;
      tiny = 8;
    } else {
      display = 48;
      subDisplay = 36;
      title = 28;
      subtitle = 16;
      body = 14;
      small = 10;
      tiny = 6;
    }

    return { display, subDisplay, title, subtitle, body, small, height, tiny };
  }, []);

  return responsive;
};

export default useResponsive;

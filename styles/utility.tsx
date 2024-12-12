import { StyleSheet } from "react-native";

    const utility = StyleSheet.create({

        justifyCenter: {
            justifyContent: 'center'
          },

        alignCenter: {
            alignItems: 'center'
        },

        blueBackground: {
          backgroundColor: '#115272',
        },

        
        blackBackground: {
          backgroundColor: '#000',
        },

        redBackground: {
          backgroundColor: '#DA4B46',
        },

        whiteBackground: {
          backgroundColor: '#FFF',
        },

        flex: {
          display: 'flex',
        },

        row: {
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }
        
      });

export { utility };
// File: textInputs.js
// Author: Cayden Wagner
// Date: 05/9/23
// Purpose: Create some custom text inputs
import React from "react";
import { useColorScheme, TextInput, StyleSheet, ScrollView } from 'react-native';
import { moderateScale, moderateVerticalScale, scale } from "../functions/helpers";
import { lightPallete, darkPallete } from "../globalStyles/colors";
import { MEDIUM_TEXT } from "../globalStyles/sizes";

const LightTextInput = (props) => {
  return (
    <TextInput 
      ref={props.forwardRef ? props.forwardRef : null}
      style={styles.lightTextInput}
      placeholderTextColor= {lightPallete.accent}
      {...props}
    />
  )
}

const DarkTextInput = (props) => {
  return (
    <TextInput 
      ref={props.forwardRef ? props.forwardRef : null}
      style={styles.darkTextInput}
      placeholderTextColor= {darkPallete.accent}
      {...props}
    />
  )
}

const SmartTextInput = (props) => {
  const isDarkMode = useColorScheme() === "dark"
  if (isDarkMode) {
    return <DarkTextInput {...props}/>
  }
  else {
    return <LightTextInput {...props}/>
  }
}

export {LightTextInput, DarkTextInput, SmartTextInput}

const styles = StyleSheet.create({
  darkTextInput: {
    backgroundColor: darkPallete.secondary,
    color: darkPallete.white,
    height: moderateVerticalScale(35),
    borderRadius: scale(4),
    marginHorizontal: moderateScale(15),
    marginBottom: moderateScale(15),
    paddingHorizontal: moderateScale(15),
    fontSize: MEDIUM_TEXT,
  },  
  lightTextInput: {
    backgroundColor: lightPallete.secondary,
    color: lightPallete.black,
    height: moderateVerticalScale(35),
    borderRadius: scale(4),
    marginHorizontal: moderateScale(15),
    marginBottom: moderateScale(15),
    paddingHorizontal: moderateScale(15),
    fontSize: MEDIUM_TEXT,
  }
})
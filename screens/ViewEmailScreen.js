// File: ViewEmailScreen.js
// Author: Cayden Wagner
// Date: 10/9/23
// Purpose: Provide the page for the user to view emails
import React, {useEffect, useState, useRef} from 'react';
import { StyleSheet, SafeAreaView, View, useColorScheme } from "react-native";
import { logOut, getMail, getPredictionOnMail, getGenAIPredictionOnMail } from '../functions/apiHelpers';
import { useNavigation } from '@react-navigation/native';
import { EmailDisplayer } from '../components/EmailDisplayer';
import { EmailScreenHeader } from '../components/EmailScreenHeader';
import { darkPalette, lightPalette } from '../globalStyles/colors';
import { FullScreenEmailModal } from '../components/FullScreenEmailModal';
import { getTrustedDomains } from '../functions/helpers';

export default function ViewEmailScreen() {
  const navigation = useNavigation();
  const [listOfEmails, setListOfEmails] = useState(null)
  const [currentDisplayedEmail, setCurrentDisplayEmail] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [trustedDomains, setTrustedDomains] = useState([])
  const [predictionLoadingStatus, setPredictionLoadingStatus] = useState("Fetching")
  const [moreDetailLoadingStatus, setMoreDetailLoadingStatus] = useState("Empty")
  const [moreDetailIsOpen, setMoreDetailOpen] = useState(false)

  const bottomSheetRef = useRef();

  const fetchMail = async () => {
    console.log("fetching mail")
    await getMail()
      .then((res) => {if (res) setListOfEmails(res)})
    setRefreshing(false)
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchMail()
  }

  const logOutUser = () => {
    logOut()

    navigation.navigate("LoginScreen")
  }

  useEffect(() => {
    fetchMail()
    const fetchTrustedDomains = async () => {
      const trustedDomains = await getTrustedDomains()
      setTrustedDomains(trustedDomains)
    }

    fetchTrustedDomains()
  }, []) 

  const addToTrustedDomains = (domain) => {
    setTrustedDomains([...trustedDomains, domain])
  }

  function openFullScreenMail(mail) {
    if (mail) {
      if (mail.resultsArray) {
        setMoreDetailLoadingStatus("Fetched")
      }
      setCurrentDisplayEmail(mail)
      bottomSheetRef.current?.snapToIndex(0)
    }
    makePredictionOnMail(mail);
  }

  function closeFullScreenMail() {
    bottomSheetRef.current?.close()
    setPredictionLoadingStatus("Fetching")
  }

  const deleteMailById = (idToRemove) => {
    setListOfEmails(prevData => prevData.filter(item => item.id !== idToRemove));
  };

  const getMoreDetailsOnMail = async (mail) => {
    setMoreDetailLoadingStatus("Fetching")
    if (!mail.resultsArray) {
      try {
        const { resultsArray, securityDesctiption } = await getGenAIPredictionOnMail(mail.id);
  
        // Update the mail object itself
        if (resultsArray) {
          mail.resultsArray = resultsArray;
          mail.securityDesctiption = securityDesctiption;
          
          setListOfEmails(prevListOfEmails =>
            prevListOfEmails.map(item => item.id === mail.id ? mail : item)
          );
          setMoreDetailLoadingStatus("Fetched")
          setMoreDetailOpen(true)
        }
        else {
          setMoreDetailLoadingStatus("Error")
        }
      } catch (error) {
        console.log('Error fetching prediction for mail:', mail.id, error);
        // Handle the error appropriately, retry button may be needed
      }
    }
    else {
      setMoreDetailLoadingStatus("Fetched")
      setMoreDetailOpen(true)
    }
  }

  const makePredictionOnMail = async (mail) => {
    setPredictionLoadingStatus("Fetching")
    if (!mail.securityScore) {
      try {
        const { securityScore, securityLabel } = await getPredictionOnMail(mail.id);
  
        // Update the mail object itself
        if (securityScore) {
          mail.securityLabel = securityLabel;
          mail.securityScore = securityScore;
          
          setListOfEmails(prevListOfEmails =>
            prevListOfEmails.map(item => item.id === mail.id ? mail : item)
          );
          setPredictionLoadingStatus("Fetched")
        }
        else {
          setPredictionLoadingStatus("Error")
        }
      } catch (error) {
        console.log('Error fetching prediction for mail:', mail.id, error);
        // Handle the error appropriately, retry button may be needed
      }
    }
  }

  const isDarkMode = useColorScheme() === "dark"
  
  return (
    <View style={{backgroundColor: isDarkMode ? darkPalette.primary : lightPalette.primary, height: "100%"}}>
      <SafeAreaView style={styles.container}>

        <EmailScreenHeader 
          handleRefresh={fetchMail}
          handleLogOut={logOutUser}
        />
    
        <EmailDisplayer
          refreshing={refreshing}
          handleRefresh={handleRefresh}
          data={listOfEmails}
          setCurrentDisplayEmail={openFullScreenMail}
        />

        <FullScreenEmailModal 
          forwardRef={bottomSheetRef}
          email={currentDisplayedEmail}
          trustedDomains={trustedDomains}
          setTrustedDomains={addToTrustedDomains}
          deleteMailById={deleteMailById}
          closeFullScreenMail={closeFullScreenMail}
          onRefresh={makePredictionOnMail}
          predictionLoadingStatus={predictionLoadingStatus}
          getMoreDetailsOnMail={getMoreDetailsOnMail}
          moreDetailLoadingStatus={moreDetailLoadingStatus}
          setMoreDetailLoadingStatus={setMoreDetailLoadingStatus}
          moreDetailIsOpen={moreDetailIsOpen}
          setMoreDetailOpen={setMoreDetailOpen}
        />

      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: '100%'
  },
})
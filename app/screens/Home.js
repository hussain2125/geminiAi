import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Animated,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import Markdown from 'react-native-markdown-display';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [controller, setController] = useState(new AbortController());
  const [animatedValue] = useState(new Animated.Value(0));

  const sendMessage = async () => {
    if (input.trim()) {
      const newMessages = [...messages, { text: input, sender: 'user' }];
      setMessages(newMessages);
      setInput('');
      setLoading(true);

      try {
        const response = await axios.post(
          'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyD2AiHt0o9PDG4fpYJUCxyZe3m1UnPzAvk',
          {
            contents: [
              {
                parts: [{ text: input }],
              },
            ],
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            signal: controller.signal,
          }
        );

        const aiResponse = response.data.candidates[0].content.parts[0].text;
        setMessages([...newMessages, { text: aiResponse, sender: 'ai' }]);
        animateResponse();
      } catch (error) {
        if (axios.isCancel(error)) {
          setMessages([...newMessages, { text: 'Response cancelled', sender: 'ai' }]);
        } else {
          console.error('Error fetching AI response:', error.response?.data || error.message);
          setMessages([...newMessages, { text: 'Error fetching AI response', sender: 'ai' }]);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const stopResponse = () => {
    controller.abort();
    setController(new AbortController());
    setLoading(false);
  };

  const animateResponse = () => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  // Custom styles for Markdown
  const markdownStyles = {
    body: {
      fontSize: 16,
      color: 'white',  // White text for user messages
    },
    code_block: {
      backgroundColor: '#2e2e2e', // Dark background for code blocks
      borderRadius: 8,
      padding: 8,
      fontFamily: 'Courier',
      color: '#F8F8F2', // Light-colored text
    },
    code_inline: {
      backgroundColor: '#2e2e2e', // Dark background for inline code
      borderRadius: 4,
      paddingHorizontal: 4,
      fontFamily: 'Courier',
      color: '#F8F8F2', // Light-colored text
    },
    link: {
      color: '#58a6ff', // Links in a blue color
    },
  };

  const aiMarkdownStyles = {
    ...markdownStyles,
    body: {
      fontSize: 16,
      color: '#000', // Black text for AI messages
    },
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Fatima's AI</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons name="ios-information-circle-outline" size={32} color="white" />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.messagesContainer}>
        {messages.map((msg, index) => (
          <Animated.View
            key={index}
            style={[
              msg.sender === 'user' ? styles.userMessageContainer : styles.aiMessageContainer,
              { opacity: animatedValue },
            ]}
          >
            <Markdown
              style={msg.sender === 'user' ? markdownStyles : aiMarkdownStyles}
            >
              {msg.text}
            </Markdown>
          </Animated.View>
        ))}
        {loading && <ActivityIndicator size="large" color="#ffffff" />}
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message"
          placeholderTextColor="#ccc"
        />
        <TouchableOpacity onPress={loading ? stopResponse : sendMessage}>
          <Ionicons name={loading ? 'stop' : 'send'} size={24} color="white" />
        </TouchableOpacity>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Developer: Fatima</Text>
          <Text style={styles.modalText}>
            This app uses the Gemini API to generate responses in real-time.
          </Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#1f1f1f',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    marginLeft: 10,
    color: 'white',
  },
  messagesContainer: {
    flex: 1,
    marginVertical: 16,
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    backgroundColor: '#333537',
    paddingHorizontal: 8,
    borderRadius: 8,
    marginVertical: 8,
    marginHorizontal: 8,
  },
  aiMessageContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#ECECEC',
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
    color: 'white',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    paddingHorizontal: 20,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

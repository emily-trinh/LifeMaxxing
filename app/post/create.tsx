import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  Alert,
  Image,
  InputAccessoryView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { colors, fonts, spacing, type } from '../../constants/theme';
import { categoryEmoji } from '../../lib/format';
import { getEvent } from '../../lib/mockData';
import { useProfile } from '../../lib/ProfileContext';
import { createPost } from '../../services/postService';

const accessoryId = 'doneAccessory';

export default function CreatePostScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const { profile } = useProfile();
  const { width } = useWindowDimensions();
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [mediaBase64, setMediaBase64] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [sharing, setSharing] = useState(false);
  const event = getEvent(eventId);

  async function choosePhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photo access needed', 'Allow Lifemaxxing to access your photos so you can share your activities.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      base64: true,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setMediaUri(result.assets[0].uri);
      setMediaBase64(result.assets[0].base64 ?? null);
    }
  }

  async function takePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Camera access needed', 'Allow Lifemaxxing to use your camera so you can share your activities.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      base64: true,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setMediaUri(result.assets[0].uri);
      setMediaBase64(result.assets[0].base64 ?? null);
    }
  }

  async function sharePost() {
    if (!mediaUri || sharing) return;
    setSharing(true);
    try {
      await createPost({
        userId: profile.id,
        eventId: eventId ?? '',
        mediaUri,
        mediaBase64,
        caption: caption.trim(),
      });
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert(
        "Couldn't share your post",
        error instanceof Error ? error.message : 'Please try again.'
      );
    } finally {
      setSharing(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.contentWrapper}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.headerSide} accessibilityRole="button" accessibilityLabel="Close">
              <Ionicons name="close" size={26} color={colors.text} />
            </Pressable>
            <Text style={styles.headerTitle}>New post</Text>
            <Pressable onPress={sharePost} disabled={!mediaUri || sharing} style={styles.shareButton} accessibilityRole="button">
              <Text style={[styles.shareText, mediaUri && !sharing ? styles.shareEnabled : styles.shareDisabled]}>{sharing ? 'Sharing…' : 'Share'}</Text>
            </Pressable>
          </View>
          <View style={styles.divider} />
          <KeyboardAvoidingView style={styles.keyboardArea} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView
              keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}>
              {event ? (
                <Text style={styles.eventLine} numberOfLines={1}>
                  {categoryEmoji[event.category] ? `${categoryEmoji[event.category]} ` : ''}{event.title}
                </Text>
              ) : null}
              <Pressable onPress={choosePhoto} style={[styles.photoArea, { width, height: width }]}>
                {mediaUri ? (
                  <Image source={{ uri: mediaUri }} style={styles.photo} resizeMode="cover" />
                ) : (
                  <View style={styles.emptyPhoto}>
                    <Ionicons name="image-outline" size={48} color={colors.muted} />
                    <Text style={styles.emptyPhotoText}>Add a photo of your activity</Text>
                  </View>
                )}
              </Pressable>
              <View style={styles.pickerButtons}>
                <View style={styles.buttonColumn}>
                  <Button label="Choose photo" onPress={choosePhoto} variant="outline" />
                </View>
                <View style={styles.buttonColumn}>
                  <Button label="Take photo" onPress={takePhoto} variant="outline" />
                </View>
              </View>
              <TextInput
                value={caption}
                onChangeText={setCaption}
                multiline
                maxLength={280}
                placeholder="Write a caption…"
                placeholderTextColor={colors.muted}
                textAlignVertical="top"
                inputAccessoryViewID={accessoryId}
                style={styles.captionInput}
              />
              <Text style={styles.counter}>{caption.length}/280</Text>
            </ScrollView>
          </KeyboardAvoidingView>
          {Platform.OS === 'ios' ? (
            <InputAccessoryView nativeID={accessoryId}>
              <View style={styles.accessory}>
                <Pressable onPress={Keyboard.dismiss} accessibilityRole="button">
                  <Text style={styles.doneText}>Done</Text>
                </Pressable>
              </View>
            </InputAccessoryView>
          ) : null}
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  contentWrapper: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  headerSide: { width: spacing.xl + spacing.sm, alignItems: 'flex-start' },
  headerTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 17 },
  shareButton: { width: spacing.xl + spacing.sm, alignItems: 'flex-end' },
  shareText: { fontFamily: fonts.bold, fontSize: 16 },
  shareEnabled: { color: colors.accent },
  shareDisabled: { color: colors.muted },
  divider: { height: 1, backgroundColor: colors.border },
  keyboardArea: { flex: 1 },
  accessory: { flexDirection: 'row', justifyContent: 'flex-end', backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  doneText: { color: colors.accent, fontFamily: fonts.bold, fontSize: 16 },
  scrollContent: { paddingBottom: spacing.xl },
  eventLine: { ...type.label, color: colors.muted, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  photoArea: { backgroundColor: colors.surface },
  photo: { width: '100%', height: '100%' },
  emptyPhoto: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  emptyPhotoText: { ...type.label, color: colors.muted },
  pickerButtons: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  buttonColumn: { flex: 1 },
  captionInput: { ...type.body, minHeight: spacing.xl * 3 + spacing.sm, paddingHorizontal: spacing.md, paddingTop: spacing.sm, textAlignVertical: 'top' },
  counter: { ...type.meta, textAlign: 'right', paddingHorizontal: spacing.md, paddingTop: spacing.xs },
});
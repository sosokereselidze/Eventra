import React from 'react';
import { StyleSheet, ScrollView, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

export default function PrivacyPolicyScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Privacy Policy</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
                    <X color={Colors.text} size={24} />
                </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.text}>
                    At Eventra, we take your privacy seriously. This policy describes how we collect, use, and handle your information when you use our services.{"\n\n"}
                    1. Information We Collect: We collect information you provide directly to us, such as when you create an account, book an event, or contact us for support.{"\n\n"}
                    2. How We Use Information: We use the information we collect to provide, maintain, and improve our services, including to process transactions and send related information.{"\n\n"}
                    3. Sharing of Information: We do not share your personal information with third parties except as described in this policy.{"\n\n"}
                    4. Security: We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access.
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    title: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 20, color: Colors.text },
    closeBtn: { padding: 4 },
    content: { padding: 20 },
    text: { fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.textMuted, lineHeight: 22 },
});

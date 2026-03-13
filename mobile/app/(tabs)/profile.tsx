import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, Ticket, Settings, ChevronRight, User, Shield, Users } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/lib/auth';

const MENU_ITEMS = [
    { icon: Ticket, label: 'My Bookings', route: '/bookings' as const },
];

export default function ProfileScreen() {
    const router = useRouter();
    const { user, isAdmin, signOut } = useAuth();

    const handleSignOut = () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out',
                style: 'destructive',
                onPress: async () => {
                    await signOut();
                },
            },
        ]);
    };

    if (!user) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.header}>
                    <Text style={styles.pageTitle}>Profile</Text>
                </View>
                <View style={styles.authPrompt}>
                    <LinearGradient
                        colors={[Colors.primary + '20', Colors.accent + '15']}
                        style={styles.authIconContainer}
                    >
                        <User color={Colors.primary} size={40} strokeWidth={1.5} />
                    </LinearGradient>
                    <Text style={styles.authTitle}>Welcome to Eventra</Text>
                    <Text style={styles.authSubtitle}>
                        Sign in to access your profile, manage bookings, and discover personalized events.
                    </Text>
                    <TouchableOpacity
                        style={styles.signInBtn}
                        onPress={() => router.push('/auth')}
                    >
                        <LinearGradient
                            colors={[Colors.primary, Colors.accent]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.signInBtnGradient}
                        >
                            <Text style={styles.signInBtnText}>Sign In</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.createAccountBtn}
                        onPress={() => router.push('/auth?mode=signup')}
                    >
                        <Text style={styles.createAccountText}>Create Account</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.pageTitle}>Profile</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* User Card */}
                <View style={styles.userCard}>
                    <LinearGradient
                        colors={[Colors.primary, Colors.accent]}
                        style={styles.avatarCircle}
                    >
                        <Text style={styles.avatarText}>
                            {(user.name || user.username || 'U')[0].toUpperCase()}
                        </Text>
                    </LinearGradient>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{user.name || user.username}</Text>
                        <Text style={styles.userEmail}>{user.email}</Text>
                        <Text style={styles.userHandle}>@{user.username}</Text>
                    </View>
                    {isAdmin && (
                        <View style={styles.adminBadge}>
                            <Text style={styles.adminBadgeText}>Admin</Text>
                        </View>
                    )}
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>🎫</Text>
                        <Text style={styles.statLabel}>My Tickets</Text>
                    </View>
                </View>

                {/* Menu */}
                <View style={styles.menuSection}>
                    <Text style={styles.menuSectionTitle}>Account</Text>
                    {MENU_ITEMS.map((item) => {
                        const Icon = item.icon;
                        return (
                            <TouchableOpacity
                                key={item.label}
                                style={styles.menuItem}
                                onPress={() => router.push(item.route)}
                            >
                                <View style={styles.menuItemIcon}>
                                    <Icon color={Colors.primary} size={18} strokeWidth={2} />
                                </View>
                                <Text style={styles.menuItemLabel}>{item.label}</Text>
                                <ChevronRight color={Colors.textMuted} size={16} strokeWidth={2} />
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Support Section */}
                <View style={styles.menuSection}>
                    <Text style={styles.menuSectionTitle}>Support & Legal</Text>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => router.push('/privacy')}
                    >
                        <View style={styles.menuItemIcon}>
                            <Shield color={Colors.primary} size={18} strokeWidth={2} />
                        </View>
                        <Text style={styles.menuItemLabel}>Privacy Policy</Text>
                        <ChevronRight color={Colors.textMuted} size={16} strokeWidth={2} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => Alert.alert('Support', 'Contact us at support@eventra.com')}
                    >
                        <View style={styles.menuItemIcon}>
                            <Users color={Colors.primary} size={18} strokeWidth={2} />
                        </View>
                        <Text style={styles.menuItemLabel}>Help & Support</Text>
                        <ChevronRight color={Colors.textMuted} size={16} strokeWidth={2} />
                    </TouchableOpacity>
                </View>

                {/* App Info */}
                <View style={styles.menuSection}>
                    <Text style={styles.menuSectionTitle}>App</Text>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Version</Text>
                        <Text style={styles.infoValue}>1.0.0</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Account Type</Text>
                        <Text style={[styles.infoValue, isAdmin && styles.infoValueAdmin]}>
                            {isAdmin ? 'Administrator' : 'Member'}
                        </Text>
                    </View>
                </View>

                {/* Sign Out */}
                <View style={styles.signOutSection}>
                    <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
                        <LogOut color={Colors.error} size={18} strokeWidth={2} />
                        <Text style={styles.signOutText}>Sign Out</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 32 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 14,
    },
    pageTitle: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 28,
        color: Colors.text,
        letterSpacing: -0.5,
    },
    authPrompt: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
        gap: 12,
    },
    authIconContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    authTitle: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 24,
        color: Colors.text,
        textAlign: 'center',
    },
    authSubtitle: {
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        color: Colors.textMuted,
        textAlign: 'center',
        lineHeight: 20,
    },
    signInBtn: {
        marginTop: 8,
        borderRadius: 100,
        overflow: 'hidden',
        width: '100%',
    },
    signInBtnGradient: {
        paddingVertical: 14,
        alignItems: 'center',
    },
    signInBtnText: {
        fontFamily: 'Inter_700Bold',
        fontSize: 16,
        color: Colors.white,
    },
    createAccountBtn: {
        paddingVertical: 13,
        borderRadius: 100,
        borderWidth: 1.5,
        borderColor: Colors.primary + '50',
        width: '100%',
        alignItems: 'center',
    },
    createAccountText: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 15,
        color: Colors.primary,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        backgroundColor: Colors.card,
        borderRadius: 20,
        padding: 18,
        borderWidth: 1,
        borderColor: Colors.border,
        gap: 16,
        marginBottom: 14,
    },
    avatarCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 26,
        color: Colors.white,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 18,
        color: Colors.text,
        letterSpacing: -0.3,
    },
    userEmail: {
        fontFamily: 'Inter_400Regular',
        fontSize: 13,
        color: Colors.textMuted,
        marginTop: 2,
    },
    userHandle: {
        fontFamily: 'Inter_500Medium',
        fontSize: 12,
        color: Colors.primary,
        marginTop: 2,
    },
    adminBadge: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 100,
    },
    adminBadgeText: {
        fontFamily: 'Inter_700Bold',
        fontSize: 11,
        color: Colors.white,
    },
    statsRow: {
        marginHorizontal: 20,
        marginBottom: 14,
    },
    statItem: {
        backgroundColor: Colors.card,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        flexDirection: 'row',
        gap: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    statNumber: {
        fontSize: 30,
    },
    statLabel: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 15,
        color: Colors.text,
    },
    menuSection: {
        marginHorizontal: 20,
        marginBottom: 16,
    },
    menuSectionTitle: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 12,
        color: Colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 8,
        marginLeft: 4,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.card,
        borderRadius: 14,
        padding: 16,
        gap: 14,
        marginBottom: 6,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    menuItemIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: Colors.primary + '12',
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuItemLabel: {
        flex: 1,
        fontFamily: 'Inter_500Medium',
        fontSize: 15,
        color: Colors.text,
    },
    infoItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.card,
        borderRadius: 14,
        padding: 16,
        marginBottom: 6,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    infoLabel: {
        fontFamily: 'Inter_500Medium',
        fontSize: 15,
        color: Colors.text,
    },
    infoValue: {
        fontFamily: 'Inter_500Medium',
        fontSize: 14,
        color: Colors.textMuted,
    },
    infoValueAdmin: {
        color: Colors.primary,
        fontFamily: 'Inter_600SemiBold',
    },
    signOutSection: {
        marginHorizontal: 20,
        marginTop: 4,
    },
    signOutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        padding: 16,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: Colors.error + '40',
        backgroundColor: Colors.error + '08',
    },
    signOutText: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 15,
        color: Colors.error,
    },
});

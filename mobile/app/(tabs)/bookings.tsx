import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, MapPin, Ticket, Trash2, ExternalLink } from 'lucide-react-native';
import { format } from 'date-fns';
import { Colors } from '@/constants/colors';
import { useBookings } from '@/lib/useEvents';
import { useAuth } from '@/lib/auth';
import { fetchApi } from '@/lib/api';

export default function BookingsScreen() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const { data: bookings, isLoading, refetch } = useBookings();
    const [refreshing, setRefreshing] = useState(false);
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    const onRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    const handleCancel = (bookingId: string, eventTitle: string) => {
        Alert.alert(
            'Cancel Booking',
            `Are you sure you want to cancel your booking for "${eventTitle}"? This action cannot be undone.`,
            [
                { text: 'Keep Booking', style: 'cancel' },
                {
                    text: 'Cancel Booking',
                    style: 'destructive',
                    onPress: async () => {
                        setCancellingId(bookingId);
                        try {
                            await fetchApi(`/api/bookings/${bookingId}`, { method: 'DELETE' });
                            await refetch();
                        } catch (e) {
                            Alert.alert('Error', 'Failed to cancel booking. Please try again.');
                        } finally {
                            setCancellingId(null);
                        }
                    },
                },
            ]
        );
    };

    if (!user && !authLoading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.authPrompt}>
                    <Text style={styles.authIcon}>🎫</Text>
                    <Text style={styles.authTitle}>Sign in to view your tickets</Text>
                    <Text style={styles.authSubtitle}>
                        Book events and manage your tickets all in one place.
                    </Text>
                    <TouchableOpacity style={styles.authBtn} onPress={() => router.push('/auth')}>
                        <Text style={styles.authBtnText}>Sign In / Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.pageTitle}>My Tickets</Text>
                <Text style={styles.pageSubtitle}>Manage your upcoming events</Text>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={Colors.primary}
                    />
                }
                contentContainerStyle={styles.scrollContent}
            >
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        {[0, 1, 2].map((i) => (
                            <View key={i} style={styles.skeletonCard} />
                        ))}
                    </View>
                ) : !bookings || bookings.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>🎟️</Text>
                        <Text style={styles.emptyTitle}>No bookings yet</Text>
                        <Text style={styles.emptySubtitle}>
                            Start exploring and book your first event!
                        </Text>
                        <TouchableOpacity
                            style={styles.browseBtn}
                            onPress={() => router.push('/events')}
                        >
                            <Text style={styles.browseBtnText}>Browse Events</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.bookingsList}>
                        {bookings.map((booking) => {
                            const event = booking.events;
                            if (!event) return null;
                            const isPast = new Date(event.date) < new Date();

                            return (
                                <View
                                    key={booking.id}
                                    style={[styles.bookingCard, isPast && styles.bookingCardPast]}
                                >
                                    {/* Event Image */}
                                    <Image
                                        source={{
                                            uri: event.image_url ||
                                                'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400',
                                        }}
                                        style={styles.eventImage}
                                        resizeMode="cover"
                                    />

                                    {/* Content */}
                                    <View style={styles.cardContent}>
                                        {/* Badges */}
                                        <View style={styles.badgeRow}>
                                            <View style={[styles.badge, isPast ? styles.badgePast : styles.badgeActive]}>
                                                <Text style={[styles.badgeText, isPast ? styles.badgeTextPast : styles.badgeTextActive]}>
                                                    {isPast ? 'Past Event' : '✓ Confirmed'}
                                                </Text>
                                            </View>
                                            {event.category && (
                                                <View style={styles.badgeOutline}>
                                                    <Text style={styles.badgeOutlineText}>{event.category}</Text>
                                                </View>
                                            )}
                                        </View>

                                        <Text style={styles.eventTitle} numberOfLines={2}>
                                            {event.title}
                                        </Text>

                                        {/* Meta */}
                                        <View style={styles.metaList}>
                                            <View style={styles.metaItem}>
                                                <Calendar color={Colors.primary} size={14} strokeWidth={2} />
                                                <Text style={styles.metaText}>
                                                    {format(new Date(event.date), 'MMM d, yyyy • h:mm a')}
                                                </Text>
                                            </View>
                                            <View style={styles.metaItem}>
                                                <MapPin color={Colors.primary} size={14} strokeWidth={2} />
                                                <Text style={styles.metaText} numberOfLines={1}>
                                                    {event.location}
                                                </Text>
                                            </View>
                                            <View style={styles.metaItem}>
                                                <Ticket color={Colors.primary} size={14} strokeWidth={2} />
                                                <Text style={styles.metaText}>
                                                    {booking.quantity} ticket{booking.quantity > 1 ? 's' : ''}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Actions */}
                                        <View style={styles.actions}>
                                            <TouchableOpacity
                                                style={styles.viewBtn}
                                                onPress={() => router.push(`/event/${event.id}`)}
                                            >
                                                <ExternalLink color={Colors.primary} size={14} strokeWidth={2} />
                                                <Text style={styles.viewBtnText}>View Event</Text>
                                            </TouchableOpacity>
                                            {!isPast && (
                                                <TouchableOpacity
                                                    style={styles.cancelBtn}
                                                    onPress={() => handleCancel(booking.id, event.title)}
                                                    disabled={cancellingId === booking.id}
                                                >
                                                    <Trash2 color={Colors.error} size={14} strokeWidth={2} />
                                                    <Text style={styles.cancelBtnText}>
                                                        {cancellingId === booking.id ? 'Cancelling...' : 'Cancel'}
                                                    </Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}
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
    pageSubtitle: {
        fontFamily: 'Inter_400Regular',
        fontSize: 13,
        color: Colors.textMuted,
        marginTop: 2,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    loadingContainer: {
        gap: 14,
    },
    skeletonCard: {
        height: 160,
        borderRadius: 16,
        backgroundColor: Colors.border,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 80,
        gap: 8,
    },
    emptyIcon: {
        fontSize: 56,
        marginBottom: 8,
    },
    emptyTitle: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 22,
        color: Colors.text,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        color: Colors.textMuted,
        textAlign: 'center',
        lineHeight: 20,
        maxWidth: 220,
    },
    browseBtn: {
        marginTop: 16,
        paddingHorizontal: 28,
        paddingVertical: 13,
        borderRadius: 100,
        backgroundColor: Colors.primary,
    },
    browseBtnText: {
        fontFamily: 'Inter_700Bold',
        fontSize: 15,
        color: Colors.white,
    },
    authPrompt: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
        gap: 10,
    },
    authIcon: {
        fontSize: 64,
        marginBottom: 8,
    },
    authTitle: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 22,
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
    authBtn: {
        marginTop: 16,
        paddingHorizontal: 28,
        paddingVertical: 13,
        borderRadius: 100,
        backgroundColor: Colors.primary,
    },
    authBtnText: {
        fontFamily: 'Inter_700Bold',
        fontSize: 15,
        color: Colors.white,
    },
    bookingsList: {
        gap: 14,
    },
    bookingCard: {
        backgroundColor: Colors.card,
        borderRadius: 18,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    bookingCardPast: {
        opacity: 0.65,
    },
    eventImage: {
        width: '100%',
        height: 130,
    },
    cardContent: {
        padding: 16,
        gap: 10,
    },
    badgeRow: {
        flexDirection: 'row',
        gap: 8,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 100,
    },
    badgeActive: {
        backgroundColor: Colors.primary + '20',
    },
    badgePast: {
        backgroundColor: Colors.surface,
    },
    badgeText: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 11,
    },
    badgeTextActive: {
        color: Colors.primary,
    },
    badgeTextPast: {
        color: Colors.textMuted,
    },
    badgeOutline: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    badgeOutlineText: {
        fontFamily: 'Inter_500Medium',
        fontSize: 11,
        color: Colors.textMuted,
    },
    eventTitle: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 17,
        color: Colors.text,
        lineHeight: 22,
    },
    metaList: {
        gap: 6,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    metaText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 13,
        color: Colors.textMuted,
        flex: 1,
    },
    actions: {
        flexDirection: 'row',
        gap: 10,
        paddingTop: 4,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        marginTop: 4,
    },
    viewBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: Colors.primary + '50',
    },
    viewBtnText: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 13,
        color: Colors.primary,
    },
    cancelBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
    },
    cancelBtnText: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 13,
        color: Colors.error,
    },
});

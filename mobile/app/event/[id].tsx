import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Share,
    Alert,
    Dimensions,
    Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ArrowLeft,
    Share2,
    Calendar,
    MapPin,
    Users,
    Ticket,
    Clock,
    Heart,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';
import { Colors } from '@/constants/colors';
import { useEvent, useBookings } from '@/lib/useEvents';
import { useAuth } from '@/lib/auth';
import { fetchApi } from '@/lib/api';

const { width } = Dimensions.get('window');
const IMAGE_HEIGHT = 280;

export default function EventDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { user } = useAuth();
    const { data: event, isLoading } = useEvent(id || '');
    const { data: bookings, refetch: refetchBookings } = useBookings();
    const [booking, setBooking] = useState(false);
    const [liked, setLiked] = useState(false);

    const isBooked = bookings?.some((b) => b.event_id === id);
    const availableTickets = event ? event.tickets_available - event.tickets_booked : 0;
    const soldOutPercentage = event
        ? Math.min((event.tickets_booked / event.tickets_available) * 100, 100)
        : 0;

    const handleBook = async () => {
        if (!user) {
            Alert.alert(
                'Sign In Required',
                'Please sign in to book tickets.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Sign In', onPress: () => router.push('/auth') },
                ]
            );
            return;
        }
        if (!id) return;
        setBooking(true);
        try {
            const res = await fetchApi<{ success: boolean; error?: string }>(
                '/api/bookings',
                { method: 'POST', body: JSON.stringify({ eventId: id, quantity: 1 }) }
            );
            if (!res.success) throw new Error(res.error || 'Failed to book event');
            await refetchBookings();
            Alert.alert('🎉 Booking Confirmed!', 'Your ticket has been reserved successfully.');
        } catch (e) {
            Alert.alert('Booking Failed', e instanceof Error ? e.message : 'Please try again.');
        } finally {
            setBooking(false);
        }
    };

    const handleShare = async () => {
        try {
            await Share.share({
                title: event?.title,
                message: `Check out "${event?.title}" on Eventra!\n${event?.description || ''}`,
            });
        } catch { }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingScreen}>
                <View style={styles.loadingImage} />
                <View style={styles.loadingContent}>
                    <View style={[styles.loadingLine, { width: '30%', height: 20, marginBottom: 16 }]} />
                    <View style={[styles.loadingLine, { width: '80%', height: 32 }]} />
                    <View style={[styles.loadingLine, { width: '60%', height: 20, marginTop: 8 }]} />
                    <View style={[styles.loadingLine, { width: '100%', height: 100, marginTop: 24 }]} />
                </View>
            </View>
        );
    }

    if (!event) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.notFound}>
                    <Text style={styles.notFoundIcon}>😕</Text>
                    <Text style={styles.notFoundTitle}>Event Not Found</Text>
                    <Text style={styles.notFoundSubtitle}>
                        This event doesn't exist or has been removed.
                    </Text>
                    <TouchableOpacity style={styles.backBtn2} onPress={() => router.back()}>
                        <Text style={styles.backBtn2Text}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} bounces={true}>
                {/* Hero Image */}
                <View style={styles.heroContainer}>
                    <Image
                        source={{
                            uri: event.image_url ||
                                'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
                        }}
                        style={styles.heroImage}
                        resizeMode="cover"
                    />
                    <LinearGradient
                        colors={['transparent', Colors.background]}
                        style={styles.heroGradient}
                    />
                    {/* Back & Action Buttons */}
                    <SafeAreaView style={styles.heroOverlay} edges={['top']}>
                        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
                            <ArrowLeft color={Colors.white} size={20} strokeWidth={2.5} />
                        </TouchableOpacity>
                        <View style={styles.heroActions}>
                            <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
                                <Share2 color={Colors.white} size={20} strokeWidth={2} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.iconBtn, liked && styles.iconBtnLiked]}
                                onPress={() => setLiked(!liked)}
                            >
                                <Heart
                                    color={liked ? Colors.error : Colors.white}
                                    size={20}
                                    strokeWidth={2}
                                    fill={liked ? Colors.error : 'transparent'}
                                />
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </View>

                {/* Content Card */}
                <View style={styles.contentCard}>
                    {/* Badges */}
                    <View style={styles.badgeRow}>
                        {event.featured && (
                            <View style={styles.featuredBadge}>
                                <Text style={styles.featuredBadgeText}>⭐ Featured</Text>
                            </View>
                        )}
                        {event.category && (
                            <View style={styles.categoryBadge}>
                                <Text style={styles.categoryBadgeText}>{event.category}</Text>
                            </View>
                        )}
                    </View>

                    {/* Title */}
                    <Text style={styles.eventTitle}>{event.title}</Text>

                    {/* Meta Info */}
                    <View style={styles.metaGrid}>
                        <View style={styles.metaItem}>
                            <View style={styles.metaIcon}>
                                <Calendar color={Colors.primary} size={20} strokeWidth={2} />
                            </View>
                            <View>
                                <Text style={styles.metaLabel}>Date & Time</Text>
                                <Text style={styles.metaValue}>
                                    {format(new Date(event.date), 'EEE, MMM d, yyyy')}
                                </Text>
                                <Text style={styles.metaSubValue}>
                                    {format(new Date(event.date), 'h:mm a')}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.metaItem}>
                            <View style={styles.metaIcon}>
                                <MapPin color={Colors.primary} size={20} strokeWidth={2} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.metaLabel}>Location</Text>
                                <Text style={styles.metaValue} numberOfLines={2}>
                                    {event.location}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Description */}
                    <View style={styles.descSection}>
                        <View style={styles.descHeader}>
                            <View style={styles.descDot} />
                            <Text style={styles.descTitle}>About This Event</Text>
                        </View>
                        <Text style={styles.descText}>
                            {event.description || 'No description available for this experience.'}
                        </Text>
                    </View>

                    {/* Availability */}
                    <View style={styles.availSection}>
                        <View style={styles.availRow}>
                            <View style={styles.availLeft}>
                                <Users color={Colors.textMuted} size={16} strokeWidth={2} />
                                <Text style={styles.availText}>{availableTickets} tickets remaining</Text>
                            </View>
                            <Text style={styles.soldPercent}>
                                {Math.round(soldOutPercentage)}% Sold
                            </Text>
                        </View>
                        <View style={styles.progressBar}>
                            <View
                                style={[styles.progressFill, { width: `${soldOutPercentage}%` }]}
                            />
                        </View>
                    </View>

                    {/* Booking Card */}
                    <View style={styles.bookingCard}>
                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>Secure Your Ticket</Text>
                            <View style={styles.priceValueRow}>
                                <Text style={styles.price}>${Number(event.price).toFixed(0)}</Text>
                                <Text style={styles.pricePer}> / person</Text>
                            </View>
                        </View>

                        {isBooked ? (
                            <View style={styles.bookedContainer}>
                                <View style={styles.bookedBadge}>
                                    <Ticket color={Colors.primary} size={18} strokeWidth={2} />
                                    <Text style={styles.bookedText}>See You There! 🎉</Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.viewTicketsBtn}
                                    onPress={() => router.push('/bookings')}
                                >
                                    <Text style={styles.viewTicketsBtnText}>View My Tickets</Text>
                                </TouchableOpacity>
                            </View>
                        ) : availableTickets === 0 ? (
                            <View style={styles.soldOutBtn}>
                                <Text style={styles.soldOutText}>Sold Out</Text>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.bookBtn}
                                onPress={handleBook}
                                disabled={booking}
                            >
                                <LinearGradient
                                    colors={[Colors.primary, Colors.accent]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.bookBtnGradient}
                                >
                                    <Text style={styles.bookBtnText}>
                                        {booking ? 'Booking...' : 'Book Tickets Now'}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        )}

                        <View style={styles.instantConfirm}>
                            <Clock color={Colors.primary} size={14} strokeWidth={2} />
                            <Text style={styles.instantConfirmText}>Instant confirmation upon booking</Text>
                        </View>
                    </View>

                    <View style={{ height: 40 }} />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    heroContainer: {
        height: IMAGE_HEIGHT,
        position: 'relative',
    },
    heroImage: {
        width,
        height: IMAGE_HEIGHT,
    },
    heroGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: IMAGE_HEIGHT / 2,
    },
    heroOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 16,
        paddingTop: 4,
    },
    heroActions: {
        flexDirection: 'row',
        gap: 8,
    },
    iconBtn: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: 'rgba(0,0,0,0.35)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconBtnLiked: {
        backgroundColor: 'rgba(239,68,68,0.2)',
    },
    contentCard: {
        backgroundColor: Colors.background,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        marginTop: -24,
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    badgeRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    featuredBadge: {
        backgroundColor: Colors.primary + '20',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 100,
    },
    featuredBadgeText: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 12,
        color: Colors.primary,
    },
    categoryBadge: {
        backgroundColor: Colors.surface,
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    categoryBadgeText: {
        fontFamily: 'Inter_500Medium',
        fontSize: 12,
        color: Colors.textMuted,
    },
    eventTitle: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 26,
        color: Colors.text,
        lineHeight: 33,
        letterSpacing: -0.5,
        marginBottom: 20,
    },
    metaGrid: {
        gap: 16,
        marginBottom: 24,
        backgroundColor: Colors.card,
        borderRadius: 18,
        padding: 18,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 14,
    },
    metaIcon: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: Colors.primary + '15',
        alignItems: 'center',
        justifyContent: 'center',
    },
    metaLabel: {
        fontFamily: 'Inter_500Medium',
        fontSize: 11,
        color: Colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        marginBottom: 2,
    },
    metaValue: {
        fontFamily: 'SpaceGrotesk_600SemiBold',
        fontSize: 15,
        color: Colors.text,
    },
    metaSubValue: {
        fontFamily: 'Inter_400Regular',
        fontSize: 13,
        color: Colors.textMuted,
        marginTop: 1,
    },
    descSection: {
        marginBottom: 24,
    },
    descHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    descDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.primary,
    },
    descTitle: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 18,
        color: Colors.text,
    },
    descText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 15,
        color: Colors.textMuted,
        lineHeight: 23,
    },
    availSection: {
        marginBottom: 20,
        gap: 10,
    },
    availRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    availLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    availText: {
        fontFamily: 'Inter_500Medium',
        fontSize: 13,
        color: Colors.textMuted,
    },
    soldPercent: {
        fontFamily: 'Inter_700Bold',
        fontSize: 13,
        color: Colors.primary,
    },
    progressBar: {
        height: 8,
        backgroundColor: Colors.border,
        borderRadius: 100,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: Colors.primary,
        borderRadius: 100,
    },
    bookingCard: {
        backgroundColor: Colors.card,
        borderRadius: 22,
        padding: 20,
        gap: 16,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    priceRow: {
        gap: 4,
    },
    priceLabel: {
        fontFamily: 'Inter_500Medium',
        fontSize: 11,
        color: Colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    priceValueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    price: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 42,
        color: Colors.text,
        letterSpacing: -1,
    },
    pricePer: {
        fontFamily: 'Inter_400Regular',
        fontSize: 15,
        color: Colors.textMuted,
    },
    bookedContainer: {
        gap: 10,
    },
    bookedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 14,
        borderRadius: 14,
        backgroundColor: Colors.primary + '15',
        borderWidth: 1,
        borderColor: Colors.primary + '30',
    },
    bookedText: {
        fontFamily: 'Inter_700Bold',
        fontSize: 16,
        color: Colors.primary,
    },
    viewTicketsBtn: {
        padding: 14,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: Colors.border,
        alignItems: 'center',
    },
    viewTicketsBtnText: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 15,
        color: Colors.text,
    },
    soldOutBtn: {
        padding: 18,
        borderRadius: 16,
        backgroundColor: Colors.surface,
        alignItems: 'center',
    },
    soldOutText: {
        fontFamily: 'Inter_700Bold',
        fontSize: 16,
        color: Colors.textMuted,
    },
    bookBtn: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    bookBtnGradient: {
        paddingVertical: 18,
        alignItems: 'center',
    },
    bookBtnText: {
        fontFamily: 'Inter_700Bold',
        fontSize: 17,
        color: Colors.white,
    },
    instantConfirm: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        justifyContent: 'center',
    },
    instantConfirmText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 12,
        color: Colors.textMuted,
    },
    loadingScreen: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    loadingImage: {
        height: IMAGE_HEIGHT,
        backgroundColor: Colors.border,
    },
    loadingContent: {
        padding: 20,
    },
    loadingLine: {
        backgroundColor: Colors.border,
        borderRadius: 8,
    },
    notFound: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingHorizontal: 40,
    },
    notFoundIcon: {
        fontSize: 64,
        marginBottom: 8,
    },
    notFoundTitle: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 24,
        color: Colors.text,
    },
    notFoundSubtitle: {
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        color: Colors.textMuted,
        textAlign: 'center',
    },
    backBtn2: {
        marginTop: 16,
        paddingHorizontal: 28,
        paddingVertical: 13,
        borderRadius: 100,
        backgroundColor: Colors.primary,
    },
    backBtn2Text: {
        fontFamily: 'Inter_700Bold',
        fontSize: 15,
        color: Colors.white,
    },
});

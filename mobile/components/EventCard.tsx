import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, MapPin, Users } from 'lucide-react-native';
import { format } from 'date-fns';
import { Colors } from '@/constants/colors';
import { Event } from '@/lib/useEvents';

interface EventCardProps {
    event: Event;
}

const { width } = Dimensions.get('window');

const CATEGORY_COLORS: Record<string, string> = {
    Music: '#8B5CF6',
    Technology: '#3B82F6',
    'Food & Drink': '#F97316',
    Sports: '#22C55E',
    Art: '#EC4899',
    Business: '#64748B',
    Wellness: '#14B8A6',
    Entertainment: '#EAB308',
};

export default function EventCard({ event }: EventCardProps) {
    const router = useRouter();
    const availableTickets = event.tickets_available - event.tickets_booked;
    const soldOutPercentage = (event.tickets_booked / event.tickets_available) * 100;
    const categoryColor = (event.category && CATEGORY_COLORS[event.category]) || Colors.primary;
    const isLowTickets = availableTickets > 0 && availableTickets <= 20;
    const isSoldOut = availableTickets === 0;

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/event/${event.id}`)}
            activeOpacity={0.92}
        >
            {/* Image */}
            <View style={styles.imageContainer}>
                <Image
                    source={{
                        uri:
                            event.image_url ||
                            'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500',
                    }}
                    style={styles.image}
                    resizeMode="cover"
                />
                {/* Category Badge */}
                {event.category && (
                    <View style={[styles.categoryBadge, { backgroundColor: categoryColor + 'E0' }]}>
                        <Text style={styles.categoryText}>{event.category}</Text>
                    </View>
                )}
                {/* Featured badge */}
                {event.featured && (
                    <View style={styles.featuredBadge}>
                        <Text style={styles.featuredText}>⭐ Featured</Text>
                    </View>
                )}
                {/* Sold Out overlay */}
                {isSoldOut && (
                    <View style={styles.soldOutOverlay}>
                        <Text style={styles.soldOutText}>Sold Out</Text>
                    </View>
                )}
            </View>

            {/* Body */}
            <View style={styles.body}>
                <Text style={styles.title} numberOfLines={2}>
                    {event.title}
                </Text>

                <View style={styles.metaList}>
                    <View style={styles.metaItem}>
                        <Calendar color={Colors.primary} size={13} strokeWidth={2} />
                        <Text style={styles.metaText}>
                            {format(new Date(event.date), 'MMM d, yyyy')}
                        </Text>
                    </View>
                    <View style={styles.metaItem}>
                        <MapPin color={Colors.primary} size={13} strokeWidth={2} />
                        <Text style={styles.metaText} numberOfLines={1}>
                            {event.location}
                        </Text>
                    </View>
                </View>

                {/* Availability */}
                {!isSoldOut && (
                    <View style={styles.availRow}>
                        <Users color={Colors.textMuted} size={12} strokeWidth={2} />
                        <Text style={[styles.availText, isLowTickets && styles.availTextLow]}>
                            {isLowTickets ? `⚠️ Only ${availableTickets} left` : `${availableTickets} tickets`}
                        </Text>
                    </View>
                )}

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.price}>
                        {Number(event.price) === 0 ? 'Free' : `$${Number(event.price).toFixed(0)}`}
                    </Text>
                    <View style={[styles.bookBtn, isSoldOut && styles.bookBtnSoldOut]}>
                        <Text style={[styles.bookBtnText, isSoldOut && styles.bookBtnTextSoldOut]}>
                            {isSoldOut ? 'Sold Out' : 'Book Now'}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.card,
        borderRadius: 18,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: Colors.black,
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
    },
    imageContainer: {
        height: 170,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    categoryBadge: {
        position: 'absolute',
        top: 10,
        left: 10,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 100,
    },
    categoryText: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 11,
        color: Colors.white,
    },
    featuredBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: Colors.primary,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 100,
    },
    featuredText: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 11,
        color: Colors.white,
    },
    soldOutOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    soldOutText: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 20,
        color: Colors.white,
    },
    body: {
        padding: 14,
        gap: 8,
    },
    title: {
        fontFamily: 'SpaceGrotesk_600SemiBold',
        fontSize: 16,
        color: Colors.text,
        lineHeight: 21,
    },
    metaList: {
        gap: 4,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 12,
        color: Colors.textMuted,
        flex: 1,
    },
    availRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    availText: {
        fontFamily: 'Inter_500Medium',
        fontSize: 12,
        color: Colors.textMuted,
    },
    availTextLow: {
        color: Colors.warning,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        marginTop: 2,
    },
    price: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 20,
        color: Colors.primary,
        letterSpacing: -0.3,
    },
    bookBtn: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 100,
    },
    bookBtnSoldOut: {
        backgroundColor: Colors.surface,
    },
    bookBtnText: {
        fontFamily: 'Inter_700Bold',
        fontSize: 13,
        color: Colors.white,
    },
    bookBtnTextSoldOut: {
        color: Colors.textMuted,
    },
});

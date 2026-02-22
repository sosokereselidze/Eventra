import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, MapPin, ArrowRight } from 'lucide-react-native';
import { format } from 'date-fns';
import { Colors } from '@/constants/colors';
import { Event } from '@/lib/useEvents';

interface FeaturedEventCardProps {
    event: Event;
}

export default function FeaturedEventCard({ event }: FeaturedEventCardProps) {
    const router = useRouter();

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/event/${event.id}`)}
            activeOpacity={0.92}
        >
            <ImageBackground
                source={{
                    uri:
                        event.image_url ||
                        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
                }}
                style={styles.background}
                imageStyle={styles.backgroundImage}
                resizeMode="cover"
            >
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.75)', 'rgba(0,0,0,0.92)']}
                    style={styles.gradient}
                >
                    {/* Badges */}
                    <View style={styles.topBadges}>
                        <View style={styles.featuredBadge}>
                            <Text style={styles.featuredText}>⭐ Featured Event</Text>
                        </View>
                        {event.category && (
                            <View style={styles.categoryBadge}>
                                <Text style={styles.categoryText}>{event.category}</Text>
                            </View>
                        )}
                    </View>

                    {/* Content */}
                    <View style={styles.content}>
                        <Text style={styles.title} numberOfLines={2}>
                            {event.title}
                        </Text>
                        {event.description && (
                            <Text style={styles.description} numberOfLines={2}>
                                {event.description}
                            </Text>
                        )}

                        {/* Meta */}
                        <View style={styles.metaRow}>
                            <View style={styles.metaItem}>
                                <Calendar color="rgba(255,255,255,0.7)" size={13} strokeWidth={2} />
                                <Text style={styles.metaText}>
                                    {format(new Date(event.date), 'MMM d, yyyy')}
                                </Text>
                            </View>
                            <View style={styles.metaItem}>
                                <MapPin color="rgba(255,255,255,0.7)" size={13} strokeWidth={2} />
                                <Text style={styles.metaText} numberOfLines={1}>
                                    {event.location}
                                </Text>
                            </View>
                        </View>

                        {/* Footer */}
                        <View style={styles.footer}>
                            <Text style={styles.price}>
                                {Number(event.price) === 0
                                    ? 'Free Entry'
                                    : `$${Number(event.price).toFixed(0)} / person`}
                            </Text>
                            <View style={styles.ctaBtn}>
                                <Text style={styles.ctaBtnText}>Get Tickets</Text>
                                <ArrowRight color={Colors.primary} size={14} strokeWidth={2.5} />
                            </View>
                        </View>
                    </View>
                </LinearGradient>
            </ImageBackground>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 22,
        overflow: 'hidden',
        height: 320,
        shadowColor: Colors.black,
        shadowOpacity: 0.15,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 8 },
        elevation: 8,
    },
    background: {
        flex: 1,
    },
    backgroundImage: {
        borderRadius: 22,
    },
    gradient: {
        flex: 1,
        justifyContent: 'space-between',
        padding: 18,
        paddingTop: 14,
    },
    topBadges: {
        flexDirection: 'row',
        gap: 8,
    },
    featuredBadge: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 100,
    },
    featuredText: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 12,
        color: Colors.white,
    },
    categoryBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 100,
    },
    categoryText: {
        fontFamily: 'Inter_500Medium',
        fontSize: 12,
        color: Colors.white,
    },
    content: {
        gap: 10,
    },
    title: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 22,
        color: Colors.white,
        lineHeight: 28,
        letterSpacing: -0.3,
    },
    description: {
        fontFamily: 'Inter_400Regular',
        fontSize: 13,
        color: 'rgba(255,255,255,0.75)',
        lineHeight: 18,
    },
    metaRow: {
        flexDirection: 'row',
        gap: 14,
        flexWrap: 'wrap',
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    metaText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 12,
        color: 'rgba(255,255,255,0.75)',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 18,
        color: Colors.white,
    },
    ctaBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: Colors.white,
        paddingHorizontal: 16,
        paddingVertical: 9,
        borderRadius: 100,
    },
    ctaBtnText: {
        fontFamily: 'Inter_700Bold',
        fontSize: 13,
        color: Colors.primary,
    },
});

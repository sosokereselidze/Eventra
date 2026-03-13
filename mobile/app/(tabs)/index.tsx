import React, { useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
    RefreshControl,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap, Users, Shield, ArrowRight, Sparkles, CalendarDays } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useEvents, useFeaturedEvents, Event } from '@/lib/useEvents';
import { useAuth } from '@/lib/auth';
import EventCard from '@/components/EventCard';
import FeaturedEventCard from '@/components/FeaturedEventCard';

const { width } = Dimensions.get('window');

const FEATURES = [
    {
        icon: Zap,
        title: 'Instant Booking',
        description: 'Secure your tickets in seconds with our streamlined booking process.',
    },
    {
        icon: Users,
        title: 'Curated Events',
        description: 'Discover handpicked events from music festivals to tech conferences.',
    },
    {
        icon: Shield,
        title: 'Secure & Safe',
        description: 'Your transactions are protected with enterprise-grade security.',
    },
];

export default function HomeScreen() {
    const router = useRouter();
    const { user, isAdmin } = useAuth();
    const { data: featuredEvents, isLoading: loadingFeatured, refetch: refetchFeatured } = useFeaturedEvents();
    const { data: allEvents, isLoading: loadingEvents, refetch: refetchAll } = useEvents();
    const [refreshing, setRefreshing] = React.useState(false);

    const upcomingEvents = allEvents?.slice(0, 6) || [];
    const heroEvent = featuredEvents?.[0];

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([refetchFeatured(), refetchAll()]);
        setRefreshing(false);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={Colors.primary}
                    />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.appName}>Eventra</Text>
                        <Text style={styles.tagline}>Discover amazing events</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.notifBtn}
                        onPress={() => router.push(user ? (isAdmin ? '/profile' : '/profile') : '/auth')}
                    >
                        <CalendarDays color={Colors.primary} size={22} strokeWidth={2} />
                    </TouchableOpacity>
                </View>

                {/* Hero Banner */}
                <View style={styles.heroBanner}>
                    <LinearGradient
                        colors={[Colors.primary, Colors.accent]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.heroBannerGradient}
                    >
                        <View style={styles.heroTextContainer}>
                            <View style={styles.heroBadge}>
                                <Sparkles color={Colors.white} size={13} strokeWidth={2} />
                                <Text style={styles.heroBadgeText}>200+ Events Available</Text>
                            </View>
                            <Text style={styles.heroTitle}>Unforgettable{'\n'}Experiences{'\n'}Await You</Text>
                            <Text style={styles.heroSubtitle}>
                                From concerts to conferences — discover and book tickets that matter.
                            </Text>
                            <TouchableOpacity
                                style={styles.heroBtn}
                                onPress={() => router.push('/events')}
                            >
                                <Text style={styles.heroBtnText}>Browse Events</Text>
                                <ArrowRight color={Colors.primary} size={16} strokeWidth={2.5} />
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </View>

                {/* Featured Event */}
                {heroEvent && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>✨ Featured</Text>
                        </View>
                        <FeaturedEventCard event={heroEvent} />
                    </View>
                )}

                {/* Upcoming Events */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View>
                            <Text style={styles.sectionTitle}>Upcoming Events</Text>
                            <Text style={styles.sectionSubtitle}>Don't miss out on these experiences</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.viewAllBtn}
                            onPress={() => router.push('/events')}
                        >
                            <Text style={styles.viewAllText}>View All</Text>
                        </TouchableOpacity>
                    </View>

                    {loadingEvents ? (
                        <View style={styles.loadingGrid}>
                            {[0, 1, 2].map((i) => (
                                <View key={i} style={styles.skeletonCard} />
                            ))}
                        </View>
                    ) : (
                        <View style={styles.eventsGrid}>
                            {upcomingEvents.map((event) => (
                                <EventCard key={event.id} event={event} />
                            ))}
                        </View>
                    )}
                </View>

                {/* Features */}
                <View style={[styles.section, styles.featuresSection]}>
                    <Text style={[styles.sectionTitle, styles.featuresSectionTitle]}>Why Eventra?</Text>
                    {FEATURES.map((feature) => {
                        const Icon = feature.icon;
                        return (
                            <View key={feature.title} style={styles.featureCard}>
                                <LinearGradient
                                    colors={[Colors.primary, Colors.accent]}
                                    style={styles.featureIcon}
                                >
                                    <Icon color={Colors.white} size={22} strokeWidth={2} />
                                </LinearGradient>
                                <View style={styles.featureText}>
                                    <Text style={styles.featureTitle}>{feature.title}</Text>
                                    <Text style={styles.featureDesc}>{feature.description}</Text>
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* CTA if not logged in */}
                {!user && (
                    <View style={styles.ctaSection}>
                        <LinearGradient
                            colors={[Colors.primary + '18', Colors.accent + '18']}
                            style={styles.ctaBanner}
                        >
                            <Text style={styles.ctaTitle}>Ready for Your Next Adventure?</Text>
                            <Text style={styles.ctaSubtitle}>
                                Join thousands of event-goers who trust Eventra.
                            </Text>
                            <TouchableOpacity
                                style={styles.ctaBtn}
                                onPress={() => router.push('/auth')}
                            >
                                <LinearGradient
                                    colors={[Colors.primary, Colors.accent]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.ctaBtnGradient}
                                >
                                    <Text style={styles.ctaBtnText}>Get Started Free</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>
                )}

                <View style={{ height: 24 }} />
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 12,
    },
    appName: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 26,
        color: Colors.text,
        letterSpacing: -0.5,
    },
    tagline: {
        fontFamily: 'Inter_400Regular',
        fontSize: 13,
        color: Colors.textMuted,
        marginTop: 1,
    },
    notifBtn: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: Colors.primary + '15',
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroBanner: {
        marginHorizontal: 20,
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 8,
    },
    heroBannerGradient: {
        padding: 28,
        paddingBottom: 32,
    },
    heroTextContainer: {
        gap: 12,
    },
    heroBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,255,255,0.25)',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 100,
        alignSelf: 'flex-start',
    },
    heroBadgeText: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 12,
        color: Colors.white,
    },
    heroTitle: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 34,
        color: Colors.white,
        lineHeight: 42,
        letterSpacing: -0.5,
    },
    heroSubtitle: {
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        color: 'rgba(255,255,255,0.85)',
        lineHeight: 20,
    },
    heroBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: Colors.white,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 100,
        alignSelf: 'flex-start',
        marginTop: 4,
    },
    heroBtnText: {
        fontFamily: 'Inter_700Bold',
        fontSize: 14,
        color: Colors.primary,
    },
    section: {
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 14,
    },
    sectionTitle: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 20,
        color: Colors.text,
        letterSpacing: -0.3,
    },
    sectionSubtitle: {
        fontFamily: 'Inter_400Regular',
        fontSize: 13,
        color: Colors.textMuted,
        marginTop: 2,
    },
    viewAllBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 100,
        borderWidth: 1.5,
        borderColor: Colors.primary + '50',
    },
    viewAllText: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 13,
        color: Colors.primary,
    },
    loadingGrid: {
        gap: 14,
    },
    skeletonCard: {
        height: 200,
        borderRadius: 16,
        backgroundColor: Colors.border,
    },
    eventsGrid: {
        gap: 14,
    },
    featuresSection: {
        backgroundColor: Colors.surface,
        marginHorizontal: 0,
        paddingHorizontal: 20,
        paddingVertical: 24,
        gap: 16,
    },
    featuresSectionTitle: {
        marginBottom: 4,
    },
    featureCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 16,
        backgroundColor: Colors.card,
        borderRadius: 16,
        padding: 16,
    },
    featureIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    featureText: {
        flex: 1,
        gap: 4,
    },
    featureTitle: {
        fontFamily: 'SpaceGrotesk_600SemiBold',
        fontSize: 16,
        color: Colors.text,
    },
    featureDesc: {
        fontFamily: 'Inter_400Regular',
        fontSize: 13,
        color: Colors.textMuted,
        lineHeight: 18,
    },
    ctaSection: {
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    ctaBanner: {
        borderRadius: 24,
        padding: 28,
        gap: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.primary + '20',
    },
    ctaTitle: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 22,
        color: Colors.text,
        textAlign: 'center',
        letterSpacing: -0.3,
    },
    ctaSubtitle: {
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        color: Colors.textMuted,
        textAlign: 'center',
        lineHeight: 20,
    },
    ctaBtn: {
        marginTop: 8,
        borderRadius: 100,
        overflow: 'hidden',
    },
    ctaBtnGradient: {
        paddingHorizontal: 32,
        paddingVertical: 14,
    },
    ctaBtnText: {
        fontFamily: 'Inter_700Bold',
        fontSize: 15,
        color: Colors.white,
    },
});

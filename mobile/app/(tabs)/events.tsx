import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    RefreshControl,
    FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, SlidersHorizontal, X } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useEvents } from '@/lib/useEvents';
import EventCard from '@/components/EventCard';

const CATEGORIES = ['All', 'Music', 'Technology', 'Food & Drink', 'Sports', 'Art', 'Business', 'Wellness', 'Entertainment'];
const SORT_OPTIONS = [
    { label: 'Date (Soonest)', value: 'date' },
    { label: 'Price: Low→High', value: 'price-low' },
    { label: 'Price: High→Low', value: 'price-high' },
    { label: 'Most Popular', value: 'popular' },
];

export default function EventsScreen() {
    const { data: events, isLoading, refetch } = useEvents();
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [sortBy, setSortBy] = useState('date');
    const [showSort, setShowSort] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    const filteredEvents = useMemo(() => {
        if (!events) return [];
        let filtered = events.filter((event) => {
            const matchesSearch =
                event.title.toLowerCase().includes(search.toLowerCase()) ||
                (event.description?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
                event.location.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = category === 'All' || event.category === category;
            return matchesSearch && matchesCategory;
        });

        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'date': return new Date(a.date).getTime() - new Date(b.date).getTime();
                case 'price-low': return Number(a.price) - Number(b.price);
                case 'price-high': return Number(b.price) - Number(a.price);
                case 'popular': return b.tickets_booked - a.tickets_booked;
                default: return 0;
            }
        });
        return filtered;
    }, [events, search, category, sortBy]);

    const currentSortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label || 'Sort';

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.pageTitle}>Browse Events</Text>
                    <Text style={styles.pageSubtitle}>Find your next experience</Text>
                </View>
            </View>

            {/* Search Bar */}
            <View style={styles.searchRow}>
                <View style={styles.searchBox}>
                    <Search color={Colors.textMuted} size={18} strokeWidth={2} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search events, locations..."
                        placeholderTextColor={Colors.textMuted}
                        value={search}
                        onChangeText={setSearch}
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch('')}>
                            <X color={Colors.textMuted} size={16} strokeWidth={2} />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity
                    style={[styles.sortBtn, showSort && styles.sortBtnActive]}
                    onPress={() => setShowSort(!showSort)}
                >
                    <SlidersHorizontal
                        color={showSort ? Colors.white : Colors.primary}
                        size={18}
                        strokeWidth={2}
                    />
                </TouchableOpacity>
            </View>

            {/* Sort Dropdown */}
            {showSort && (
                <View style={styles.sortDropdown}>
                    {SORT_OPTIONS.map((opt) => (
                        <TouchableOpacity
                            key={opt.value}
                            style={[styles.sortOption, sortBy === opt.value && styles.sortOptionActive]}
                            onPress={() => {
                                setSortBy(opt.value);
                                setShowSort(false);
                            }}
                        >
                            <Text style={[styles.sortOptionText, sortBy === opt.value && styles.sortOptionTextActive]}>
                                {opt.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Category Pills */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryScroll}
                style={styles.categoryScrollView}
            >
                {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                        key={cat}
                        style={[styles.categoryPill, category === cat && styles.categoryPillActive]}
                        onPress={() => setCategory(cat)}
                    >
                        <Text style={[styles.categoryPillText, category === cat && styles.categoryPillTextActive]}>
                            {cat}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Results Count */}
            <View style={styles.resultsRow}>
                <Text style={styles.resultsText}>
                    {isLoading ? 'Loading...' : `${filteredEvents.length} events found`}
                </Text>
                {sortBy !== 'date' && (
                    <Text style={styles.sortLabel}>Sorted by: {currentSortLabel}</Text>
                )}
            </View>

            {/* Events List */}
            {isLoading ? (
                <ScrollView contentContainerStyle={styles.loadingContainer}>
                    {[0, 1, 2, 3].map((i) => (
                        <View key={i} style={styles.skeletonCard} />
                    ))}
                </ScrollView>
            ) : filteredEvents.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>🔍</Text>
                    <Text style={styles.emptyTitle}>No events found</Text>
                    <Text style={styles.emptySubtitle}>Try adjusting your search or filters</Text>
                    <TouchableOpacity
                        style={styles.clearBtn}
                        onPress={() => { setSearch(''); setCategory('All'); }}
                    >
                        <Text style={styles.clearBtnText}>Clear Filters</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={filteredEvents}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <EventCard event={item} />}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={Colors.primary}
                        />
                    }
                />
            )}
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
    searchRow: {
        flexDirection: 'row',
        gap: 10,
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    searchBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.card,
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
        gap: 10,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    searchInput: {
        flex: 1,
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        color: Colors.text,
    },
    sortBtn: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: Colors.primary + '15',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.primary + '30',
    },
    sortBtnActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    sortDropdown: {
        marginHorizontal: 20,
        backgroundColor: Colors.card,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: Colors.border,
        overflow: 'hidden',
        marginBottom: 10,
    },
    sortOption: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    sortOptionActive: {
        backgroundColor: Colors.primary + '12',
    },
    sortOptionText: {
        fontFamily: 'Inter_500Medium',
        fontSize: 14,
        color: Colors.text,
    },
    sortOptionTextActive: {
        color: Colors.primary,
        fontFamily: 'Inter_600SemiBold',
    },
    categoryScrollView: {
        flexGrow: 0,
        marginBottom: 10,
    },
    categoryScroll: {
        paddingHorizontal: 20,
        gap: 8,
        flexDirection: 'row',
    },
    categoryPill: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 100,
        backgroundColor: Colors.card,
        borderWidth: 1.5,
        borderColor: Colors.border,
    },
    categoryPillActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    categoryPillText: {
        fontFamily: 'Inter_500Medium',
        fontSize: 13,
        color: Colors.textMuted,
    },
    categoryPillTextActive: {
        color: Colors.white,
        fontFamily: 'Inter_600SemiBold',
    },
    resultsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    resultsText: {
        fontFamily: 'Inter_500Medium',
        fontSize: 13,
        color: Colors.textMuted,
    },
    sortLabel: {
        fontFamily: 'Inter_400Regular',
        fontSize: 12,
        color: Colors.primary,
    },
    loadingContainer: {
        paddingHorizontal: 20,
        gap: 14,
        paddingBottom: 20,
    },
    skeletonCard: {
        height: 200,
        borderRadius: 16,
        backgroundColor: Colors.border,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
        gap: 8,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 8,
    },
    emptyTitle: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 20,
        color: Colors.text,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        color: Colors.textMuted,
        textAlign: 'center',
    },
    clearBtn: {
        marginTop: 12,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 100,
        borderWidth: 1.5,
        borderColor: Colors.primary,
    },
    clearBtnText: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 14,
        color: Colors.primary,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        gap: 14,
    },
});

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
    Mail,
    Lock,
    User,
    Eye,
    EyeOff,
    ArrowRight,
    X,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/lib/auth';

export default function AuthScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { signIn, signUp } = useAuth();

    const [isSignUp, setIsSignUp] = useState(params.mode === 'signup');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        username: '',
        identifier: '',
        password: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const updateField = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (isSignUp) {
            if (!formData.name || formData.name.length < 2)
                newErrors.name = 'Name must be at least 2 characters';
            if (!formData.email || !formData.email.includes('@'))
                newErrors.email = 'Please enter a valid email';
            if (!formData.username || formData.username.length < 3)
                newErrors.username = 'Username must be at least 3 characters';
        } else {
            if (!formData.identifier || formData.identifier.length < 3)
                newErrors.identifier = 'Please enter your email or username';
        }

        if (!formData.password || formData.password.length < 6)
            newErrors.password = 'Password must be at least 6 characters';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setIsLoading(true);

        if (isSignUp) {
            const { error } = await signUp(
                formData.email,
                formData.username,
                formData.password,
                formData.name
            );
            setIsLoading(false);
            if (error) {
                Alert.alert('Sign Up Failed', error.message);
            } else {
                Alert.alert('Welcome to Eventra! 🎉', 'Your account has been created successfully.', [
                    { text: 'Continue', onPress: () => router.replace('/(tabs)') },
                ]);
            }
        } else {
            const { error } = await signIn(formData.identifier, formData.password);
            setIsLoading(false);
            if (error) {
                Alert.alert('Sign In Failed', 'Invalid credentials. Please try again.');
            } else {
                router.replace('/(tabs)');
            }
        }
    };

    const InputField = ({
        field,
        label,
        placeholder,
        icon: Icon,
        keyboardType = 'default',
        secureTextEntry = false,
        isPassword = false,
    }: {
        field: string;
        label: string;
        placeholder: string;
        icon: React.ComponentType<{ color: string; size: number; strokeWidth: number }>;
        keyboardType?: 'default' | 'email-address';
        secureTextEntry?: boolean;
        isPassword?: boolean;
    }) => (
        <View style={styles.fieldGroup}>
            <Text style={styles.label}>{label}</Text>
            <View style={[styles.inputContainer, errors[field] ? styles.inputError : null]}>
                <Icon
                    color={errors[field] ? Colors.error : Colors.textMuted}
                    size={18}
                    strokeWidth={2}
                />
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor={Colors.textMuted}
                    value={(formData as Record<string, string>)[field]}
                    onChangeText={(v) => updateField(field, v)}
                    keyboardType={keyboardType}
                    secureTextEntry={isPassword ? !showPassword : secureTextEntry}
                    autoCapitalize="none"
                    editable={!isLoading}
                />
                {isPassword && (
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        {showPassword ? (
                            <EyeOff color={Colors.textMuted} size={18} strokeWidth={2} />
                        ) : (
                            <Eye color={Colors.textMuted} size={18} strokeWidth={2} />
                        )}
                    </TouchableOpacity>
                )}
            </View>
            {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* Dismiss Button */}
            <SafeAreaView style={styles.dismissRow}>
                <TouchableOpacity style={styles.dismissBtn} onPress={() => router.back()}>
                    <X color={Colors.textMuted} size={20} strokeWidth={2} />
                </TouchableOpacity>
            </SafeAreaView>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* Logo / Brand */}
                <View style={styles.brandSection}>
                    <LinearGradient
                        colors={[Colors.primary, Colors.accent]}
                        style={styles.logoGradient}
                    >
                        <Text style={styles.logoText}>E</Text>
                    </LinearGradient>
                    <Text style={styles.brandName}>Eventra</Text>
                </View>

                {/* Header */}
                <Text style={styles.heading}>
                    {isSignUp ? 'Create account' : 'Welcome back'}
                </Text>
                <Text style={styles.subheading}>
                    {isSignUp
                        ? 'Join Eventra and start discovering events'
                        : 'Sign in to access your dashboard'}
                </Text>

                {/* Divider */}
                <View style={styles.dividerRow}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>
                        {isSignUp ? 'Sign up with email' : 'Sign in with email'}
                    </Text>
                    <View style={styles.dividerLine} />
                </View>

                {/* Form */}
                <View style={styles.form}>
                    {isSignUp && (
                        <>
                            <InputField
                                field="name"
                                label="Full Name"
                                placeholder="John Doe"
                                icon={User}
                            />
                            <InputField
                                field="username"
                                label="Username"
                                placeholder="johndoe123"
                                icon={User}
                            />
                            <InputField
                                field="email"
                                label="Email Address"
                                placeholder="you@example.com"
                                icon={Mail}
                                keyboardType="email-address"
                            />
                        </>
                    )}

                    {!isSignUp && (
                        <InputField
                            field="identifier"
                            label="Email or Username"
                            placeholder="you@example.com or username"
                            icon={Mail}
                        />
                    )}

                    <InputField
                        field="password"
                        label="Password"
                        placeholder="••••••••"
                        icon={Lock}
                        isPassword={true}
                    />

                    <TouchableOpacity
                        style={styles.submitBtn}
                        onPress={handleSubmit}
                        disabled={isLoading}
                    >
                        <LinearGradient
                            colors={[Colors.primary, Colors.accent]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.submitBtnGradient}
                        >
                            <Text style={styles.submitBtnText}>
                                {isLoading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
                            </Text>
                            <ArrowRight color={Colors.white} size={18} strokeWidth={2.5} />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Toggle */}
                <View style={styles.toggleRow}>
                    <Text style={styles.toggleText}>
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                    </Text>
                    <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
                        <Text style={styles.toggleLink}>
                            {isSignUp ? ' Sign in' : ' Sign up'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    dismissRow: {
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 16 : 0,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    dismissBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: Colors.card,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    brandSection: {
        alignItems: 'center',
        paddingTop: 16,
        paddingBottom: 24,
        gap: 8,
    },
    logoGradient: {
        width: 64,
        height: 64,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoText: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 36,
        color: Colors.white,
    },
    brandName: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 22,
        color: Colors.text,
        letterSpacing: -0.5,
    },
    heading: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 28,
        color: Colors.text,
        letterSpacing: -0.5,
        textAlign: 'center',
        marginBottom: 6,
    },
    subheading: {
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        color: Colors.textMuted,
        textAlign: 'center',
        lineHeight: 20,
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginVertical: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: Colors.border,
    },
    dividerText: {
        fontFamily: 'Inter_500Medium',
        fontSize: 12,
        color: Colors.textMuted,
    },
    form: {
        gap: 16,
    },
    fieldGroup: {
        gap: 6,
    },
    label: {
        fontFamily: 'Inter_500Medium',
        fontSize: 13,
        color: Colors.text,
        marginLeft: 2,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.card,
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 13,
        gap: 10,
        borderWidth: 1.5,
        borderColor: Colors.border,
    },
    inputError: {
        borderColor: Colors.error + '80',
    },
    input: {
        flex: 1,
        fontFamily: 'Inter_400Regular',
        fontSize: 15,
        color: Colors.text,
    },
    errorText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 12,
        color: Colors.error,
        marginLeft: 2,
    },
    submitBtn: {
        marginTop: 8,
        borderRadius: 16,
        overflow: 'hidden',
    },
    submitBtnGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    submitBtnText: {
        fontFamily: 'Inter_700Bold',
        fontSize: 16,
        color: Colors.white,
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
    },
    toggleText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        color: Colors.textMuted,
    },
    toggleLink: {
        fontFamily: 'Inter_700Bold',
        fontSize: 14,
        color: Colors.primary,
    },
});

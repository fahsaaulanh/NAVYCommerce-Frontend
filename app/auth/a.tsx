"use client";

import React, { useState } from 'react';

type AuthView = 'LOGIN' | 'REGISTER' | 'OTP';

export default function AuthPage() {
    const [currentView, setCurrentView] = useState<AuthView>('LOGIN');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', isError: false });
    const [focusedInput, setFocusedInput] = useState<string | null>(null);

    // Form states
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [role, setRole] = useState(0);

    const API_BASE_URL = 'http://localhost:5000/api/Auth';

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ text: '', isError: false });

        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, fullName, phoneNumber: "", role })
            });
            const data = await response.json();

            if (response.ok) {
                setMessage({ text: data.message + (data.mockEmailInbox ? ` (${data.mockEmailInbox})` : ''), isError: false });
                setCurrentView('OTP');
            } else {
                setMessage({ text: data.message || 'Registration failed', isError: true });
            }
        } catch (error) {
            setMessage({ text: 'Network error. Is the backend running?', isError: true });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ text: '', isError: false });

        try {
            const response = await fetch(`${API_BASE_URL}/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otpCode })
            });
            const data = await response.json();

            if (response.ok) {
                setMessage({ text: 'Verification successful! You can now log in.', isError: false });
                setCurrentView('LOGIN');
            } else {
                setMessage({ text: data.message || 'Verification failed', isError: true });
            }
        } catch (error) {
            setMessage({ text: 'Network error.', isError: true });
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ text: '', isError: false });

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();

            if (response.ok) {
                setMessage({ text: 'Login successful! Token received.', isError: false });
                console.log("JWT Token:", data.token);
                // alert("Login Success! Check console for JWT Token."); // Removed alert as requested
            } else {
                setMessage({ text: data.message || 'Login failed', isError: true });
            }
        } catch (error) {
            setMessage({ text: 'Network error.', isError: true });
        } finally {
            setIsLoading(false);
        }
    };

    const renderInput = (
        id: string,
        label: string,
        type: string,
        value: string,
        onChange: (val: string) => void,
        placeholder?: string,
        extraProps?: any
    ) => {
        const isFocused = focusedInput === id;
        const hasValue = value.length > 0;

        return (
            <div className="relative mb-5 group">
                <label 
                    htmlFor={id}
                    className={`absolute left-3 transition-all duration-300 pointer-events-none ${
                        isFocused || hasValue 
                        ? '-top-2.5 text-xs bg-white px-1.5 text-blue-600 font-semibold' 
                        : 'top-3.5 text-sm text-slate-400 font-medium'
                    }`}
                >
                    {label}
                </label>
                <input
                    id={id}
                    type={type}
                    required
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setFocusedInput(id)}
                    onBlur={() => setFocusedInput(null)}
                    placeholder={isFocused ? placeholder : ''}
                    className={`w-full px-4 py-3.5 rounded-xl border-2 outline-none transition-all duration-300 text-slate-800 bg-slate-50/50 backdrop-blur-sm ${
                        isFocused 
                        ? 'border-blue-600 shadow-[0_0_0_4px_rgba(37,99,235,0.1)] bg-white' 
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                    {...extraProps}
                />
            </div>
        );
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 lg:p-8 font-sans overflow-hidden bg-slate-50">
            {/* Ambient Background Glows for a modern, premium feel */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-orange-400/20 blur-[120px] pointer-events-none" />

            <div className="max-w-5xl w-full flex rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] overflow-hidden bg-white/80 backdrop-blur-xl border border-white/50 relative z-10 h-[650px]">
                
                {}
                <div className="hidden lg:flex w-5/12 bg-slate-900 relative p-12 flex-col justify-between overflow-hidden">
                    {/* Abstract design elements within the branding panel */}
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdib3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMzMzQxNTUiIGZpbGwtb3BhY2l0eT0iMC4xNSI+PHBhdGggZD0iTTM2IDM0djI2aDJWMzRoLTIwem0tMjYtNGgyNnYtMmgtMjZWMzB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20 pointer-events-none" />
                    <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl" />
                    
                    <div className="relative z-10">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 mb-6 shadow-xl">
                            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                        </div>
                        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-4">
                            NAVY<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Commerce</span>
                        </h1>
                        <p className="text-slate-300 text-lg leading-relaxed font-light">
                            The next generation multi-vendor ecosystem. Connect, trade, and grow your business with enterprise-grade security.
                        </p>
                    </div>

                    <div className="relative z-10 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className={`w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-${i*200} flex items-center justify-center text-[10px] font-bold text-slate-700`}>
                                        {String.fromCharCode(64 + i)}
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm text-slate-300 font-medium">Join 10,000+ top merchants</p>
                        </div>
                    </div>
                </div>

                {}
                <div className="w-full lg:w-7/12 p-8 lg:p-14 flex flex-col justify-center relative bg-white">
                    <div className="max-w-md w-full mx-auto">
                        
                        {/* Header for mobile view (since left panel is hidden) */}
                        <div className="lg:hidden mb-10 text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 mb-4 shadow-lg">
                                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900">NAVY<span className="text-blue-600">Commerce</span></h1>
                        </div>

                        {/* Dynamic Title based on current view */}
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-slate-900 mb-2">
                                {currentView === 'LOGIN' ? 'Welcome back' : currentView === 'REGISTER' ? 'Create an account' : 'Verify your email'}
                            </h2>
                            <p className="text-slate-500 font-medium">
                                {currentView === 'LOGIN' ? 'Enter your credentials to access your workspace.' 
                                : currentView === 'REGISTER' ? 'Join our platform and start your journey today.' 
                                : `We sent a secure code to ${email || 'your email'}.`}
                            </p>
                        </div>

                        {/* Status Message Display */}
                        {message.text && (
                            <div className={`p-4 mb-6 rounded-xl text-sm font-semibold flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
                                message.isError 
                                ? 'bg-red-50 text-red-700 border border-red-100 shadow-sm shadow-red-100/50' 
                                : 'bg-green-50 text-green-700 border border-green-100 shadow-sm shadow-green-100/50'
                            }`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${message.isError ? 'bg-red-600' : 'bg-green-600'}`} />
                                {message.text}
                            </div>
                        )}

                        {}
                        {currentView === 'LOGIN' && (
                            <form onSubmit={handleLogin} className="animate-in fade-in duration-500">
                                {renderInput('login-email', 'Email Address', 'email', email, setEmail, 'name@company.com')}
                                {renderInput('login-password', 'Password', 'password', password, setPassword, '••••••••')}
                                
                                <div className="flex items-center justify-between mb-8 mt-2">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <div className="w-4 h-4 rounded border-2 border-slate-300 group-hover:border-blue-500 transition-colors" />
                                        <span className="text-sm text-slate-600 font-medium group-hover:text-slate-900 transition-colors">Remember me</span>
                                    </label>
                                    <button type="button" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                                        Forgot password?
                                    </button>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isLoading} 
                                    className="w-full bg-slate-900 hover:bg-blue-600 text-white font-semibold py-4 rounded-xl transition-all duration-300 shadow-lg shadow-slate-900/20 hover:shadow-blue-600/30 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : 'Sign In'}
                                </button>
                                
                                <p className="text-center text-slate-500 mt-8 font-medium">
                                    New to NAVYCommerce?{' '}
                                    <button type="button" onClick={() => {setCurrentView('REGISTER'); setMessage({text:'', isError:false})}} className="text-slate-900 font-bold hover:text-blue-600 transition-colors">
                                        Create an account
                                    </button>
                                </p>
                            </form>
                        )}

                        {}
                        {currentView === 'REGISTER' && (
                            <form onSubmit={handleRegister} className="animate-in fade-in duration-500">
                                {renderInput('reg-fullname', 'Full Name', 'text', fullName, setFullName, 'John Doe')}
                                {renderInput('reg-email', 'Email Address', 'email', email, setEmail, 'name@company.com')}
                                {renderInput('reg-password', 'Password', 'password', password, setPassword, 'Create a strong password')}
                                
                                <div className="relative mb-8 group">
                                    <label className="absolute left-3 -top-2.5 text-xs bg-white px-1.5 text-slate-500 font-semibold pointer-events-none z-10">
                                        Account Type
                                    </label>
                                    <select 
                                        value={role} 
                                        onChange={(e) => setRole(Number(e.target.value))} 
                                        className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 hover:border-slate-300 focus:border-blue-600 outline-none transition-all duration-300 text-slate-800 bg-slate-50 hover:bg-slate-50/50 focus:bg-white appearance-none cursor-pointer"
                                    >
                                        <option value={0}>Customer (I want to buy)</option>
                                        <option value={1}>Merchant (I want to sell)</option>
                                    </select>
                                    {/* Custom Dropdown Arrow */}
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isLoading} 
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-all duration-300 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : 'Create Account'}
                                </button>
                                
                                <p className="text-center text-slate-500 mt-8 font-medium">
                                    Already have an account?{' '}
                                    <button type="button" onClick={() => {setCurrentView('LOGIN'); setMessage({text:'', isError:false})}} className="text-slate-900 font-bold hover:text-blue-600 transition-colors">
                                        Sign In
                                    </button>
                                </p>
                            </form>
                        )}

                        {}
                        {currentView === 'OTP' && (
                            <form onSubmit={handleVerifyOtp} className="animate-in slide-in-from-right-8 duration-500">
                                
                                <div className="mb-8">
                                    {renderInput('otp-input', '6-Digit Secure Code', 'text', otpCode, setOtpCode, '••••••', { 
                                        maxLength: 6, 
                                        className: `w-full px-4 py-4 rounded-xl border-2 outline-none transition-all duration-300 text-center text-3xl tracking-[0.75em] font-mono font-bold ${
                                            focusedInput === 'otp-input'
                                            ? 'border-blue-600 shadow-[0_0_0_4px_rgba(37,99,235,0.1)] bg-white text-slate-900' 
                                            : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700'
                                        }` 
                                    })}
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isLoading || otpCode.length !== 6} 
                                    className="w-full bg-slate-900 hover:bg-blue-600 text-white font-semibold py-4 rounded-xl transition-all duration-300 shadow-lg shadow-slate-900/20 hover:shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : 'Verify & Continue'}
                                </button>
                                
                                <p className="text-center text-slate-500 mt-8 font-medium">
                                    Didn't receive the code?{' '}
                                    <button type="button" className="text-slate-900 font-bold hover:text-blue-600 transition-colors">
                                        Resend Code
                                    </button>
                                </p>
                            </form>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
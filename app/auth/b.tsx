"use client";

import React, { useState } from 'react';

type AuthView = 'LOGIN' | 'REGISTER' | 'OTP';

export default function AuthPage() {
    const [currentView, setCurrentView] = useState<AuthView>('LOGIN');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', isError: false });

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
        extraProps?: any
    ) => {
        return (
            <div className="relative mb-5">
                <input
                    type={type}
                    id={id}
                    required
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="block w-full px-4 py-3.5 text-slate-800 bg-transparent rounded-lg border border-slate-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-500 peer transition-colors"
                    placeholder=" " 
                    {...extraProps}
                />
                <label
                    htmlFor={id}
                    className="absolute text-[15px] text-slate-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-3 cursor-text"
                >
                    {label}
                </label>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
            
            {/* SIMPLIFIED NAVBAR (Tokopedia/Shopee Style) */}
            <header className="w-full bg-white h-16 border-b border-slate-200 flex items-center justify-between px-6 lg:px-12 sticky top-0 z-50 shadow-sm">
                <div 
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => console.log("Navigasi ke Beranda")}
                >
                    <div className="w-8 h-8 bg-[#0F172A] rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-[#38BDF8]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                    </div>
                    <span className="text-xl font-extrabold text-[#0F172A] tracking-tight">NAVY<span className="text-[#38BDF8]">Commerce</span></span>
                </div>

                <div className="flex items-center gap-6">
                    <button className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors hidden sm:block">
                        Butuh Bantuan?
                    </button>
                    <button className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        <span className="hidden sm:inline">Kembali ke Beranda</span>
                        <span className="sm:hidden">Beranda</span>
                    </button>
                </div>
            </header>

            {/* MAIN AUTHENTICATION AREA */}
            <main className="flex-1 relative flex items-center justify-center p-4 lg:p-8 overflow-hidden">
                {/* Subtle Background Ambient (Matching the image vibe) */}
                <div className="absolute top-0 left-0 w-[50%] h-[50%] bg-blue-100/40 blur-[120px] pointer-events-none rounded-br-full" />
                
                {/* THE AUTH CARD (Exactly matching image_c581d2.png) */}
                <div className="max-w-[950px] w-full flex rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden bg-white relative z-10 min-h-[600px] mx-auto border border-slate-100">
                    
                    {/* LEFT PANEL: Navy Branding */}
                    <div className="hidden lg:flex w-[45%] bg-[#0F172A] relative p-12 flex-col justify-between overflow-hidden">
                        {/* Subtle Inner Glow */}
                        <div className="absolute top-1/4 -right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-[60px]" />
                        
                        <div className="relative z-10 mt-8">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl border border-slate-700 bg-slate-800/50 mb-8 shadow-inner">
                                <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                            </div>
                            <h1 className="text-[2.5rem] font-extrabold text-white tracking-tight mb-4 leading-tight">
                                NAVY<span className="text-[#38BDF8]">Commerce</span>
                            </h1>
                            <p className="text-slate-400 text-[15px] leading-relaxed font-light max-w-sm">
                                The next generation multi-vendor ecosystem. Connect, trade, and grow your business with enterprise-grade security.
                            </p>
                        </div>

                        <div className="relative z-10 bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 inline-block self-start backdrop-blur-sm mb-4">
                            <div className="flex items-center gap-4">
                                <div className="flex -space-x-2">
                                    {['A', 'B', 'C'].map((char, i) => (
                                        <div key={char} className={`w-8 h-8 rounded-full border-2 border-[#0F172A] flex items-center justify-center text-[10px] font-bold text-slate-700 bg-slate-${200 + (i*100)} bg-slate-200`}>
                                            {char}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[13px] text-slate-300 font-medium">Join 10,000+ top merchants</p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL: Dynamic Forms */}
                    <div className="w-full lg:w-[55%] p-8 lg:px-16 lg:py-14 flex flex-col justify-center relative bg-white">
                        <div className="w-full max-w-[380px] mx-auto">
                            
                            {/* Mobile Header (Hidden on Desktop) */}
                            <div className="lg:hidden mb-8 text-center">
                                <h1 className="text-2xl font-bold text-[#0F172A]">NAVY<span className="text-[#38BDF8]">Commerce</span></h1>
                            </div>

                            {/* Dynamic Title */}
                            <div className="mb-8">
                                <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
                                    {currentView === 'LOGIN' ? 'Welcome back' : currentView === 'REGISTER' ? 'Create an account' : 'Verify your email'}
                                </h2>
                                <p className="text-slate-500 text-[15px]">
                                    {currentView === 'LOGIN' ? 'Enter your credentials to access your workspace.' 
                                    : currentView === 'REGISTER' ? 'Join our platform and start your journey today.' 
                                    : `We sent a secure code to ${email || 'your email'}.`}
                                </p>
                            </div>

                            {/* Status Message Display */}
                            {message.text && (
                                <div className={`p-4 mb-6 rounded-lg text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
                                    message.isError 
                                    ? 'bg-red-50 text-red-700 border border-red-100' 
                                    : 'bg-green-50 text-green-700 border border-green-100'
                                }`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${message.isError ? 'bg-red-500' : 'bg-green-500'}`} />
                                    {message.text}
                                </div>
                            )}

                            {/* LOGIN VIEW */}
                            {currentView === 'LOGIN' && (
                                <form onSubmit={handleLogin} className="animate-in fade-in duration-500">
                                    {renderInput('login-email', 'Email Address', 'email', email, setEmail)}
                                    {renderInput('login-password', 'Password', 'password', password, setPassword)}
                                    
                                    <div className="flex items-center justify-between mb-8 mt-1">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <div className="relative flex items-center">
                                                <input type="checkbox" className="peer w-4 h-4 rounded border-slate-300 text-[#0F172A] focus:ring-[#0F172A] cursor-pointer" />
                                            </div>
                                            <span className="text-[13px] text-slate-600 font-medium select-none">Remember me</span>
                                        </label>
                                        <button type="button" className="text-[13px] font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                                            Forgot password?
                                        </button>
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={isLoading} 
                                        className="w-full bg-[#0F172A] hover:bg-slate-800 text-white font-medium py-3.5 rounded-lg transition-colors duration-200 disabled:opacity-70 flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        {isLoading ? (
                                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : 'Sign In'}
                                    </button>
                                    
                                    <p className="text-center text-[14px] text-slate-500 mt-8 font-medium">
                                        New to NAVYCommerce?{' '}
                                        <button type="button" onClick={() => {setCurrentView('REGISTER'); setMessage({text:'', isError:false})}} className="text-slate-900 font-bold hover:underline transition-all">
                                            Create an account
                                        </button>
                                    </p>
                                </form>
                            )}

                            {/* REGISTER VIEW */}
                            {currentView === 'REGISTER' && (
                                <form onSubmit={handleRegister} className="animate-in fade-in duration-500">
                                    {renderInput('reg-fullname', 'Full Name', 'text', fullName, setFullName)}
                                    {renderInput('reg-email', 'Email Address', 'email', email, setEmail)}
                                    {renderInput('reg-password', 'Password', 'password', password, setPassword)}
                                    
                                    <div className="relative mb-8">
                                        <select 
                                            value={role} 
                                            onChange={(e) => setRole(Number(e.target.value))} 
                                            className="block w-full px-4 py-3.5 text-slate-800 bg-transparent rounded-lg border border-slate-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-500 cursor-pointer transition-colors"
                                            required
                                        >
                                            <option value={0}>Customer (I want to buy)</option>
                                            <option value={1}>Merchant (I want to sell)</option>
                                        </select>
                                        <label className="absolute text-[15px] text-slate-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 left-3 pointer-events-none">
                                            Account Type
                                        </label>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={isLoading} 
                                        className="w-full bg-[#0F172A] hover:bg-slate-800 text-white font-medium py-3.5 rounded-lg transition-colors duration-200 disabled:opacity-70 flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        {isLoading ? (
                                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : 'Create Account'}
                                    </button>
                                    
                                    <p className="text-center text-[14px] text-slate-500 mt-8 font-medium">
                                        Already have an account?{' '}
                                        <button type="button" onClick={() => {setCurrentView('LOGIN'); setMessage({text:'', isError:false})}} className="text-slate-900 font-bold hover:underline transition-all">
                                            Sign In
                                        </button>
                                    </p>
                                </form>
                            )}

                            {/* OTP VIEW */}
                            {currentView === 'OTP' && (
                                <form onSubmit={handleVerifyOtp} className="animate-in slide-in-from-right-4 duration-500">
                                    
                                    <div className="mb-8 relative">
                                        <input
                                            type="text"
                                            id="otp-input"
                                            required
                                            maxLength={6}
                                            value={otpCode}
                                            onChange={(e) => setOtpCode(e.target.value)}
                                            className="block w-full px-4 py-4 text-center text-3xl tracking-[0.5em] font-mono font-medium text-slate-900 bg-transparent rounded-lg border border-slate-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-500 peer transition-colors"
                                            placeholder=" "
                                        />
                                        <label
                                            htmlFor="otp-input"
                                            className="absolute text-[15px] text-slate-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1/2 -translate-x-1/2 peer-placeholder-shown:-translate-x-1/2 peer-focus:-translate-x-1/2 cursor-text"
                                        >
                                            6-Digit Secure Code
                                        </label>
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={isLoading || otpCode.length !== 6} 
                                        className="w-full bg-[#0F172A] hover:bg-slate-800 text-white font-medium py-3.5 rounded-lg transition-colors duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        {isLoading ? (
                                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : 'Verify & Continue'}
                                    </button>
                                    
                                    <p className="text-center text-[14px] text-slate-500 mt-8 font-medium">
                                        Didn't receive the code?{' '}
                                        <button type="button" className="text-slate-900 font-bold hover:underline transition-all">
                                            Resend Code
                                        </button>
                                    </p>
                                </form>
                            )}

                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
'use client';
import { signInKeycloak } from '@/actions/auth';
import React from 'react';

const LoginPage = () => {
    return <button onClick={() => signInKeycloak()}>LoginPage</button>;
};

export default LoginPage;

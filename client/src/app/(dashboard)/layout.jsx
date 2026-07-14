import React, { Suspense } from 'react';
import Navbar from '@/shared/components/Navbar';

function DashboardLayout({ children }) {
    return (
        <div>
            <Suspense fallback={null}>
                <Navbar />
            </Suspense>
            {children}
        </div>
    )
}

export default DashboardLayout;
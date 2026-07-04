import React from 'react'

function Loader() {
    return (
        <div>
            <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" style={{ color: "var(--accent)" }}>
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Please wait...
            </div>
        </div>
    )
}

export default Loader;
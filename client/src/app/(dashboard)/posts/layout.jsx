// No Navbar here — the PostEditor has its own slim topbar with Cancel/Publish.
// This layout intentionally overrides the dashboard layout for all /posts/* routes
// to give the editor the full viewport height.
export default function PostsLayout({ children }) {
    return <>{children}</>;
}

import Link from 'next/link'

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Navigation */}
            <nav className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <div className="text-2xl">🌆</div>
                            <span className="text-xl font-bold">Second London</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link
                                href="/auth?mode=login"
                                className="text-muted hover:text-primary transition-colors"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/auth?mode=signup"
                                className="px-4 py-2 bg-primary text-background rounded-lg font-semibold hover:opacity-90 transition-opacity"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-success/5"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
                    <div className="text-center max-w-4xl mx-auto">
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                            Your London Community,
                            <br />
                            <span className="text-primary">One Moment at a Time</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-muted mb-8 max-w-2xl mx-auto">
                            Connect with neighbors for help, services, free items, and skill swaps.
                            Every opportunity expires in hours—act fast, stay local.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/auth?mode=signup"
                                className="px-8 py-4 bg-primary text-background rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity"
                            >
                                Join Second London
                            </Link>
                            <Link
                                href="#how-it-works"
                                className="px-8 py-4 bg-surface text-primary border border-border rounded-lg font-semibold text-lg hover:bg-opacity-80 transition-all"
                            >
                                Learn More
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="bg-surface border-y border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-primary mb-2">10k+</div>
                            <div className="text-muted">Active Members</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-primary mb-2">50k+</div>
                            <div className="text-muted">Moments Created</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-primary mb-2">2-12h</div>
                            <div className="text-muted">Average Response</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-primary mb-2">4.8★</div>
                            <div className="text-muted">Average Rating</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Why Second London?</h2>
                        <p className="text-xl text-muted max-w-2xl mx-auto">
                            Built for Londoners who believe in community, urgency, and authentic connections
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-surface p-8 rounded-card border border-border hover:border-primary/50 transition-all">
                            <div className="text-4xl mb-4">⚡</div>
                            <h3 className="text-2xl font-semibold mb-3">Time-Limited</h3>
                            <p className="text-muted">
                                Every moment expires in 2-12 hours. No endless scrolling, just urgent opportunities that matter now.
                            </p>
                        </div>

                        <div className="bg-surface p-8 rounded-card border border-border hover:border-primary/50 transition-all">
                            <div className="text-4xl mb-4">📍</div>
                            <h3 className="text-2xl font-semibold mb-3">Hyper-Local</h3>
                            <p className="text-muted">
                                Connect with people in your actual neighborhood. See distance bands, not exact locations for privacy.
                            </p>
                        </div>

                        <div className="bg-surface p-8 rounded-card border border-border hover:border-primary/50 transition-all">
                            <div className="text-4xl mb-4">🛡️</div>
                            <h3 className="text-2xl font-semibold mb-3">Safe & Trusted</h3>
                            <p className="text-muted">
                                Trust levels, verified badges, quiet mode, and comprehensive safety features keep you protected.
                            </p>
                        </div>

                        <div className="bg-surface p-8 rounded-card border border-border hover:border-primary/50 transition-all">
                            <div className="text-4xl mb-4">💬</div>
                            <h3 className="text-2xl font-semibold mb-3">Real Connections</h3>
                            <p className="text-muted">
                                No vanity metrics. Just genuine interactions with real people in your community.
                            </p>
                        </div>

                        <div className="bg-surface p-8 rounded-card border border-border hover:border-primary/50 transition-all">
                            <div className="text-4xl mb-4">🎁</div>
                            <h3 className="text-2xl font-semibold mb-3">Multiple Types</h3>
                            <p className="text-muted">
                                Post needs, offers, free items, or skill swaps. Whatever your community needs, we've got you covered.
                            </p>
                        </div>

                        <div className="bg-surface p-8 rounded-card border border-border hover:border-primary/50 transition-all">
                            <div className="text-4xl mb-4">📱</div>
                            <h3 className="text-2xl font-semibold mb-3">Mobile-First</h3>
                            <p className="text-muted">
                                Designed for on-the-go Londoners. Quick, minimal, and always accessible from your phone.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="bg-surface py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">How It Works</h2>
                        <p className="text-xl text-muted">Simple, fast, and effective</p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary text-background rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                                1
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Create Account</h3>
                            <p className="text-muted">Sign up with email or social login in seconds</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary text-background rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                                2
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Post or Browse</h3>
                            <p className="text-muted">Create a moment or find opportunities near you</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary text-background rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                                3
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Connect & Chat</h3>
                            <p className="text-muted">Apply to moments and chat with your match</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary text-background rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                                4
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Meet & Review</h3>
                            <p className="text-muted">Complete the moment and build your reputation</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Ready to Connect with Your Community?
                    </h2>
                    <p className="text-xl text-muted mb-8">
                        Join thousands of Londoners making real connections every day
                    </p>
                    <Link
                        href="/auth?mode=signup"
                        className="inline-block px-8 py-4 bg-primary text-background rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity"
                    >
                        Get Started for Free
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-border bg-surface">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="text-2xl">🌆</div>
                                <span className="text-xl font-bold">Second London</span>
                            </div>
                            <p className="text-muted text-sm">
                                Your micro-opportunity network for London
                            </p>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-4">Product</h3>
                            <ul className="space-y-2 text-muted text-sm">
                                <li><Link href="#" className="hover:text-primary">Features</Link></li>
                                <li><Link href="#" className="hover:text-primary">How it Works</Link></li>
                                <li><Link href="#" className="hover:text-primary">Pricing</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-4">Company</h3>
                            <ul className="space-y-2 text-muted text-sm">
                                <li><Link href="#" className="hover:text-primary">About</Link></li>
                                <li><Link href="#" className="hover:text-primary">Blog</Link></li>
                                <li><Link href="#" className="hover:text-primary">Careers</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-4">Legal</h3>
                            <ul className="space-y-2 text-muted text-sm">
                                <li><Link href="/app/safety" className="hover:text-primary">Safety</Link></li>
                                <li><Link href="#" className="hover:text-primary">Privacy</Link></li>
                                <li><Link href="#" className="hover:text-primary">Terms</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-border mt-8 pt-8 text-center text-muted text-sm">
                        <p>&copy; 2025 Second London. Built for the London community.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

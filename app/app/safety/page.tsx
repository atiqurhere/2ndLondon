export default function SafetyPage() {
    return (
        <div className="max-w-2xl mx-auto px-4 py-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">🛡️ Safety Center</h1>
                <p className="text-muted">Your safety is our priority</p>
            </div>

            {/* Safety Guidelines */}
            <div className="space-y-6">
                <div className="bg-surface p-6 rounded-card border border-border">
                    <h2 className="text-xl font-semibold mb-4">Meeting Safely</h2>
                    <ul className="space-y-3 text-muted">
                        <li className="flex gap-3">
                            <span className="text-success flex-shrink-0">✓</span>
                            <span>Always meet in public places during daylight hours</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-success flex-shrink-0">✓</span>
                            <span>Tell a friend or family member where you're going</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-success flex-shrink-0">✓</span>
                            <span>Trust your instincts - if something feels off, leave</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-success flex-shrink-0">✓</span>
                            <span>Keep your phone charged and with you</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-success flex-shrink-0">✓</span>
                            <span>Don't share personal financial information</span>
                        </li>
                    </ul>
                </div>

                <div className="bg-surface p-6 rounded-card border border-border">
                    <h2 className="text-xl font-semibold mb-4">Trust & Verification</h2>
                    <div className="space-y-4 text-muted">
                        <div>
                            <h3 className="font-semibold text-primary mb-2">Trust Levels (0-5)</h3>
                            <p className="text-sm">
                                Users build trust through completed moments and positive reviews.
                                Higher trust levels unlock more features and reduce rate limits.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-primary mb-2">Verified Badge</h3>
                            <p className="text-sm">
                                Verified users have confirmed their identity. Some moments require
                                verified users only for added safety.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-primary mb-2">Quiet Mode</h3>
                            <p className="text-sm">
                                Prevents spam by limiting initial messages to 240 characters.
                                Full chat unlocks only after the creator accepts your application.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-surface p-6 rounded-card border border-border">
                    <h2 className="text-xl font-semibold mb-4">Reporting & Moderation</h2>
                    <div className="space-y-3 text-muted">
                        <p>
                            If you encounter inappropriate behavior, spam, or safety concerns:
                        </p>
                        <ul className="space-y-2 ml-4">
                            <li>• Use the report button on any moment or message</li>
                            <li>• Our moderation team reviews all reports within 24 hours</li>
                            <li>• Serious violations result in immediate account suspension</li>
                            <li>• You can block users to prevent future interactions</li>
                        </ul>
                    </div>
                </div>

                <div className="bg-warning bg-opacity-10 border border-warning p-6 rounded-card">
                    <h2 className="text-xl font-semibold mb-4 text-warning">Red Flags</h2>
                    <ul className="space-y-2 text-muted">
                        <li className="flex gap-3">
                            <span className="text-danger flex-shrink-0">⚠️</span>
                            <span>Requests to meet in private or isolated locations</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-danger flex-shrink-0">⚠️</span>
                            <span>Asking for money upfront or financial information</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-danger flex-shrink-0">⚠️</span>
                            <span>Pressure to act quickly or bypass platform messaging</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-danger flex-shrink-0">⚠️</span>
                            <span>Offers that seem too good to be true</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-danger flex-shrink-0">⚠️</span>
                            <span>Aggressive or inappropriate communication</span>
                        </li>
                    </ul>
                </div>

                <div className="bg-surface p-6 rounded-card border border-border">
                    <h2 className="text-xl font-semibold mb-4">Emergency Contacts</h2>
                    <div className="space-y-2 text-muted">
                        <p className="font-medium text-primary">
                            If you feel unsafe or threatened:
                        </p>
                        <ul className="space-y-1 ml-4">
                            <li>• Emergency Services (UK): <strong className="text-primary">999</strong></li>
                            <li>• Non-Emergency Police: <strong className="text-primary">101</strong></li>
                            <li>• Report to Second London: <strong className="text-primary">safety@secondlondon.com</strong></li>
                        </ul>
                    </div>
                </div>

                <div className="bg-surface p-6 rounded-card border border-border">
                    <h2 className="text-xl font-semibold mb-4">Privacy</h2>
                    <div className="space-y-3 text-muted text-sm">
                        <p>
                            <strong className="text-primary">Location Privacy:</strong> We never share your
                            exact coordinates. Other users only see approximate area labels and distance bands
                            (e.g., "Near Stratford", "1-2 mi away").
                        </p>
                        <p>
                            <strong className="text-primary">Personal Information:</strong> Never share your
                            home address, phone number, or financial details in messages. Arrange to meet
                            in public places only.
                        </p>
                        <p>
                            <strong className="text-primary">Data Security:</strong> All communications are
                            encrypted and stored securely. We never sell your data to third parties.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

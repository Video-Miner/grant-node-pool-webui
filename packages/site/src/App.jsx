// App.jsx
import React, { StrictMode} from 'react';
import { createRoot } from 'react-dom/client';

const PoolSite = () => {
    return (
    <div id="app_main" className="green-theme">
        <header className="header">
            <div className="container fixed-width header-content">
                <nav className="main-nav">
                    <a href="#" className="logo">
                        {/*<img src="/logo.af67da3.svg" alt="Open Pool Logo" className="logo-img" />*/}
                        <span className="logo-text">Open Pool</span>
                    </a>
                    <ul className="nav-links">
                        <li><a href="#about">About</a></li>
                        <li><a href="#get_started">Quickstart</a></li>
                        <li><a href="#faq">FAQ</a></li>
                    </ul>
                </nav>
                <div className="nav-cta">
                    <a href="https://app.open-pool.com/" target="_blank" className="btn-cta">
                        Open App <i className="fas fa-external-link-alt"></i>
                    </a>
                </div>
            </div>
        </header>
        <main>
            <section id="home" className="hero-section">
                <div className="container">
                    <div className="hero-content">
                        {/*<img src="logo.af67da3.svg" alt="Open Pool Logo" className="hero-logo" />*/}
                        <h1 className="hero-title">Open Pool</h1>
                        <h2 className="hero-subtitle">A Livepeer Public Video Transcoding Pool</h2>
                        <p className="hero-tagline">
                            Connect your GPU, Transcode Video or AI Inference, Get Paid
                        </p>
                        <a href="#get_started" className="btn-cta">Get Started</a>
                    </div>
                </div>
            </section>

            <section id="about" className="section about-section">
                <div className="container">
                    <header className="section-header">
                        <h2>
                            Operated by <span className="highlight">Xodeapp Orchestrator</span>
                        </h2>
                    </header>
                    <div className="section-content">
                        <p className="section-text">
                            Community Driven Transcoding Pool, managed by Xodeapp.
                            Anyone with an **NVIDIA GPU can put their GPUs to work and and earn passive Ethereum income for doing so.
                        </p>
                    </div>
                    <div className="section-sub">
                        <h3>
                            Built on top of the <span className="highlight">Livepeer Network</span>
                        </h3>
                        <p className="section-text">
                            Livepeer is a live video streaming and AI Inference network protocol that is decentralized
                            , highly scalable, crypto token incentivized, and provides a cost-effective infrastructure
                            solution compared to traditional centralized systems.
                        </p>
                    </div>
                </div>
            </section>

            <section id="get_started" className="section get-started-section">
                <div className="container">
                    <header className="section-header">
                        <h2>Get Started</h2>
                    </header>
                    <p className="section-text">
                        Set up a Worker and connect to Open Pool in minutes.
                    </p>
                    <div className="steps">
                        <article className="step">
                            <div className="step-number">01</div>
                            <div className="step-content">
                                <h3 className="step-title">
                                    Download and Install Open Pool Binary
                                </h3>
                                <p className="step-desc">
                                    Start by downloading the latest release for your OS.
                                </p>
                                <div className="downloads">
                                    <a
                                        href="#"
                                        target="_blank"
                                        className="btn-secondary"
                                    >
                                        <i className="fab fa-linux"></i> Linux
                                    </a>
                                    <a
                                        href="#"
                                        target="_blank"
                                        className="btn-secondary"
                                    >
                                        <i className="fab fa-windows"></i> Windows
                                    </a>
                                </div>
                                <p className="step-desc">Unpack the binary:</p>
                                <pre className="code-block">
$ tar -zxvf livepeer-$(YOUR_PLATFORM)-amd64.tar.gz
                  </pre>
                                <p className="step-desc">
                                    Move the binary into your <code>$PATH</code>:
                                </p>
                                <pre className="code-block">
$ mv livepeer-$(YOUR_PLATFORM)-amd64/livepeer /usr/local/bin
                  </pre>
                            </div>
                        </article>
                        <article className="step">
                            <div className="step-number">02</div>
                            <div className="step-content">
                                <h3 className="step-title">Find your GPU PCIe IDs</h3>
                                <p className="step-desc">
                                    Identify the PCIe slot IDs where your GPUs are installed. They are
                                    numbered starting at 0. Run the <code>nvidia-smi</code> tool to list
                                    them.
                                </p>
                                <pre className="code-block">$ nvidia-smi</pre>
                            </div>
                        </article>
                        <article className="step">
                            <div className="step-number">03</div>
                            <div className="step-content">
                                <h3 className="step-title">Start Open Pool Worker</h3>
                                <p className="step-desc">
                                    Provide the <strong>Ethereum Address</strong> you wish to receive payouts
                                    on Arbitrum, and specify the GPUs to use.
                                </p>
                                <pre className="code-block">
$ livepeer -ethAcctAddr $(YOUR_ETH_ADDRESS) -nvidia $(PCIe IDs comma-separated)
                  </pre>
                            </div>
                        </article>
                    </div>
                </div>
            </section>

            <section id="faq" className="section faq-section">
                <div className="container">
                    <header className="section-header">
                        <h2>FAQ</h2>
                        <p className="section-text">
                            Have a question? Check out our frequently asked questions for answers.
                        </p>
                    </header>
                    <div className="faq-list">
                        <details className="faq-item" open>
                            <summary className="faq-question">What is Open Pool?</summary>
                            <p className="faq-answer">
                                Open Pool is an open source and public video transcoding and AI Inference pool. Learn more at
                                <a href="https://github.com/Livepeer-Open-Pool" target="_blank">Open Pool GitHub</a>.
                            </p>
                        </details>
                        <details className="faq-item">
                            <summary className="faq-question">What is Livepeer?</summary>
                            <p className="faq-answer">
                                Livepeer is a decentralized live video streaming and AI Inference network protocol.
                            </p>
                        </details>
                        <details className="faq-item">
                            <summary className="faq-question">How do I receive payouts?</summary>
                            <p className="faq-answer">
                                Payouts are processed to your specified Ethereum address after
                                worker jobs completes and your work balance is above the 0.01 ETH payout threshold.
                            </p>
                        </details>
                        <details className="faq-item">
                            <summary className="faq-question">How much can I expect to earn?</summary>
                            <p className="faq-answer">
                                Earnings vary based on your setup and network conditions. Please refer
                                to our documentation for details.
                            </p>
                        </details>
                        <details className="faq-item">
                            <summary className="faq-question">Which GPUs can I use?</summary>
                            <p className="faq-answer">
                                Very specific NVIDIA GPU work for Transcoding and others for AI. See more details <a href="https://github.com/Livepeer-Open-Pool" target="_blank">Open Pool GitHub</a>.
                            </p>
                        </details>
                    </div>
                </div>
            </section>
        </main>

        <footer className="footer">
            <div className="container fixed-width footer-content">
                <div className="footer-branding">
                    <a href="#" className="logo">
                        {/*<img src="#" alt="Open Pool Logo" className="footer-logo-img" />*/}
                        <span className="footer-logo-text">Open Pool</span>
                    </a>
                </div>
            </div>
            <div className="footer-copy">
                <p>&copy; 2025 Open Pool. All rights reserved.</p>
            </div>
        </footer>
    </div>
    );
};

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <PoolSite />
    </StrictMode>
);

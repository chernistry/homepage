/**
 * Article Interactions for LLM Hallucination Prevention Feature
 * Lightweight enhancements for the article experience
 */

(function() {
    'use strict';

    let readingTimeAdded = false; // Prevent duplication

    // Robust init: run if content exists; also bind DOMContentLoaded and article:ready
    const tryInit = () => init();
    if (document.querySelector('.feature-article')) tryInit();
    window.addEventListener('article:ready', tryInit, { once: true });
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', tryInit, { once: true });
    } else {
        // already loaded
        tryInit();
    }

    function init() {
        // Idempotent heavy init; always re-run lightweight hooks (tooltips)
        if (!window.__hpInitDone) {
            ensureRootScope();
            setupReadingProgress();
            setupShareFunctionality();
            setupSmoothScrolling();
            setupScrollToTop();
            setupCopyButtons();
            setupCopyFullArticleButton();
            if (!readingTimeAdded) {
                addReadingTime();
                readingTimeAdded = true;
            }
            window.__hpInitDone = true;
        }
        // Always attempt to (re)bind tooltips after content updates
        ensureTooltipsWhenArticleReady();
    }

    /**
     * Ensure tooltips are bound even if article content is injected later
     */
    function ensureTooltipsWhenArticleReady() {
        const article = document.querySelector('.feature-article');
        if (article) {
            setupTooltips();
            return;
        }
        // Observe DOM for late injection (Next.js embed scenario)
        const observer = new MutationObserver(() => {
            const el = document.querySelector('.feature-article');
            if (el) {
                observer.disconnect();
                setupTooltips();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    /**
     * Ensure required scope class present
     */
    function ensureRootScope() {
        try {
            // Scope class for CSS
            document.body.classList.add('hallucination-prevention-page');
        } catch (_) {
            // no-op, fail safe
        }
    }

    /**
     * Reading Progress Indicator
     */
    function setupReadingProgress() {
        const progressBar = document.createElement('div');
        progressBar.className = 'reading-progress';
        progressBar.innerHTML = '<div class="reading-progress-fill"></div>';

        document.body.appendChild(progressBar);

        const progressFill = progressBar.querySelector('.reading-progress-fill');

        function updateProgress() {
            const article = document.querySelector('.feature-article');
            if (!article) return;

            const articleTop = article.offsetTop;
            const articleHeight = article.offsetHeight;
            const windowHeight = window.innerHeight;
            const scrollTop = window.pageYOffset;

            const articleBottom = articleTop + articleHeight - windowHeight;
            const progress = Math.min(Math.max((scrollTop - articleTop) / (articleBottom - articleTop), 0), 1);

            progressFill.style.width = (progress * 100) + '%';
        }

        window.addEventListener('scroll', updateProgress, { passive: true });
        updateProgress();
    }

    /**
     * Scroll to Top Button
     */
    function setupScrollToTop() {
        if (document.getElementById('scroll-to-top')) return;
        const scrollButton = document.createElement('button');
        scrollButton.id = 'scroll-to-top';
        scrollButton.className = 'scroll-to-top';
        scrollButton.innerHTML = '<span style="font-size: 24px; display: block; line-height: 1;">^</span>';
        scrollButton.setAttribute('aria-label', 'Scroll to top');

        document.body.appendChild(scrollButton);

        // Show/hide button based on scroll position
        function toggleScrollButton() {
            if (window.pageYOffset > 300) {
                scrollButton.classList.add('visible');
            } else {
                scrollButton.classList.remove('visible');
            }
        }

        // Scroll to top functionality
        scrollButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        window.addEventListener('scroll', toggleScrollButton, { passive: true });
    }

    /**
     * Share Functionality
     */
    function setupShareFunctionality() {
        const shareButtons = document.querySelectorAll('.share-icon');

        // If share buttons removed, nothing to init
        if (!shareButtons.length) return;
        shareButtons.forEach(function(button) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const action = button.getAttribute('data-action');
                if (action === 'share') handleShare();
            });
        });
    }

    function handleShare() {
        const url = window.location.href;
        const title = document.title;
        const text = 'Preventing Hallucinations in LLMs: Modern Techniques';

        if (navigator.share) {
            navigator.share({
                title: title,
                text: text,
                url: url
            }).catch(function(error) {
                console.log('Share failed:', error);
                fallbackCopyToClipboard(url);
            });
        } else {
            fallbackCopyToClipboard(url);
        }
    }

    function fallbackCopyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function() {
                showNotification('Copied to clipboard!');
            }).catch(function(err) {
                console.log('Clipboard API failed:', err);
                legacyCopyToClipboard(text);
            });
        } else {
            legacyCopyToClipboard(text);
        }
    }

    function legacyCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            const successful = document.execCommand('copy');
            if (successful) {
                showNotification('Copied to clipboard!');
            } else {
                showNotification('Copy failed. Please copy manually.');
            }
        } catch (err) {
            console.log('Copy failed:', err);
            showNotification('Copy failed. Please copy manually.');
        }

        document.body.removeChild(textArea);
    }

    /**
     * Copy full article button (robust binding and fallback)
     */
    function setupCopyFullArticleButton() {
        const button = document.querySelector('.copy-full-article-button');
        if (!button) return;

        function doCopyFullArticle(e) {
            if (e) e.preventDefault();
            const article = document.querySelector('.feature-article');
            if (!article) return;
            const text = (article.textContent || article.innerText || '').trim();
            if (!text) return;

            // Try async Clipboard API, fallback to legacy
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(function() {
                    transientButtonState(button, 'Copied!');
                    showNotification('Article copied to clipboard');
                }).catch(function() {
                    legacyCopyToClipboard(text);
                    transientButtonState(button, 'Copied!');
                });
            } else {
                legacyCopyToClipboard(text);
                transientButtonState(button, 'Copied!');
            }
        }

        // Public API for inline handlers if present
        try { window.copyFullArticle = doCopyFullArticle; } catch (_) {}

        // Bind click
        button.addEventListener('click', doCopyFullArticle);
    }

    function transientButtonState(button, label) {
        const original = button.innerHTML;
        button.innerHTML = '<span>' + label + '</span>';
        setTimeout(function() { button.innerHTML = original; }, 1600);
    }

    function handleBookmark(button) {
        const icon = button.querySelector('.material-icons');
        const isBookmarked = icon.textContent === 'bookmark';

        if (isBookmarked) {
            icon.textContent = 'bookmark_border';
            localStorage.removeItem('bookmarked-hallucination-prevention');
            showNotification('Bookmark removed');
        } else {
            icon.textContent = 'bookmark';
            localStorage.setItem('bookmarked-hallucination-prevention', 'true');
            showNotification('Article bookmarked');
        }
    }

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(function() { notification.classList.add('show'); }, 10);
        setTimeout(function() {
            notification.classList.remove('show');
            setTimeout(function() {
                if (notification.parentNode) notification.parentNode.removeChild(notification);
            }, 300);
        }, 3000);
    }

    /**
     * Smooth Scrolling
     */
    function setupSmoothScrolling() {
        document.addEventListener('click', function(e) {
            const link = e.target.closest('a[href^="#"]');
            if (!link) return;

            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }

    /**
     * Tooltips for technical terms - полностью переработанная версия
     */
    function setupTooltips() {
        const articleRoot = document.querySelector('.feature-article');
        if (!articleRoot) {
            console.debug('[tooltips] no .feature-article, skip');
            return;
        }

        // Расширенный словарь терминов с учетом разных дефисов и синонимов
        const tooltipData = {
            'RAG': 'Retrieval-Augmented Generation - A technique that integrates external knowledge retrieval with language model generation to improve factual accuracy',
            'Chain-of-Thought': 'Chain-of-Thought - A prompting technique that instructs the model to show its reasoning process step-by-step',
            'CoT': 'Chain-of-Thought - A prompting technique that instructs the model to show its reasoning process step-by-step',
            'RLHF': 'Reinforcement Learning from Human Feedback - A training method where human evaluators provide feedback on model outputs to improve safety and truthfulness',
            'Fine-tuning': 'Fine-tuning - The process of training a pre-trained model on domain-specific data to improve performance on specific tasks',
            'Few-shot': 'Few-shot Learning - A machine learning approach where models learn from a small number of examples',
            'Self-consistency': 'A technique that samples multiple reasoning paths and selects the most consistent answer',
            'SelfCheckGPT': 'A method for detecting hallucinations by comparing multiple generations from the same prompt',
            'Entropy-based': 'Entropy-based uncertainty - Using probability distributions to measure model confidence and detect uncertain outputs',
            'Guardrails': 'Guardrails - Rule-based systems that constrain LLM outputs to prevent harmful or incorrect content',
            'Hallucination': 'Hallucination - When an LLM generates incorrect or fabricated information presented as factual',
            'Prompt Engineering': 'Prompt Engineering - The practice of designing and optimizing prompts to improve LLM performance and reliability'
        };

        // CSS for tooltips is defined in article-styles.css

        // Smart positioning to avoid viewport overflow
        function positionTooltip(termEl) {
            const tip = termEl.querySelector('.tooltip');
            if (!tip) return;

            // Reset orientation and shift
            tip.classList.remove('top', 'bottom');
            tip.style.removeProperty('--tooltip-shift');

            // Make it measurable
            const prevVisibility = tip.style.visibility;
            const prevOpacity = tip.style.opacity;
            tip.style.visibility = 'hidden';
            tip.style.opacity = '1';

            const termRect = termEl.getBoundingClientRect();
            const tipRect = tip.getBoundingClientRect();
            const vh = window.innerHeight || document.documentElement.clientHeight;
            const vw = window.innerWidth || document.documentElement.clientWidth;

            const spaceAbove = termRect.top;
            const spaceBelow = vh - termRect.bottom;
            const placeTop = spaceAbove >= tipRect.height + 20 || spaceAbove > spaceBelow;
            tip.classList.add(placeTop ? 'top' : 'bottom');

            // Recompute after orientation applied
            const tipRect2 = tip.getBoundingClientRect();
            const margin = 16; /* keep a bit more gap from viewport edges */
            const centerLeft = termRect.left + termRect.width / 2;
            let left = centerLeft - tipRect2.width / 2;
            let right = left + tipRect2.width;
            let shift = 0;
            if (left < margin) shift = margin - left;
            else if (right > vw - margin) shift = (vw - margin) - right;
            tip.style.setProperty('--tooltip-shift', shift + 'px');

            // Restore visibility
            tip.style.visibility = prevVisibility;
            tip.style.opacity = prevOpacity;
        }

        // Find and wrap terms with tooltips
        const articleContent = articleRoot;
        if (!articleContent) return;

        // Process each term
        Object.keys(tooltipData).forEach(function(term) {
            // Support multiple hyphen types by expanding '-' to a class
            const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const hyphenClass = '[\\-\u2010-\u2015\u2212\uFE58\uFE63\uFF0D]';
            const pattern = escaped.replace(/-/g, hyphenClass);
            const testRegex = new RegExp('(^|\\b)' + pattern + '(?=\\b|$)', 'i');
            const replaceRegex = new RegExp('(^|\\b)' + pattern + '(?=\\b|$)', 'gi');

            // Get all text nodes in the article
            const walker = document.createTreeWalker(
                articleContent,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode: function(node) {
                        // Skip if parent already has tooltip-term class
                        if (node.parentNode.classList && node.parentNode.classList.contains('tooltip-term')) {
                            return NodeFilter.FILTER_REJECT;
                        }
                        // Skip if inside any tooltip (check ancestors)
                        let ancestor = node.parentNode;
                        while (ancestor && ancestor !== articleContent) {
                            if (ancestor.classList && (ancestor.classList.contains('tooltip-term') || ancestor.classList.contains('tooltip'))) {
                                return NodeFilter.FILTER_REJECT;
                            }
                            ancestor = ancestor.parentNode;
                        }
                        // Skip if inside code blocks
                        if (node.parentNode.tagName === 'CODE' || node.parentNode.tagName === 'PRE') {
                            return NodeFilter.FILTER_REJECT;
                        }
                        return NodeFilter.FILTER_ACCEPT;
                    }
                },
                false
            );

            const textNodes = [];
            let node;
            while (node = walker.nextNode()) {
                if (testRegex.test(node.textContent)) {
                    textNodes.push(node);
                }
            }

            // Process each text node
            textNodes.forEach(function(textNode) {
                const parent = textNode.parentNode;
                const text = textNode.textContent;

                if (testRegex.test(text)) {
                    const newHTML = text.replace(replaceRegex, function(match) {
                        return '<span class="tooltip-term" tabindex="0">' + match + '<span class="tooltip top" role="tooltip">' + tooltipData[term] + '</span></span>';
                    });

                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = newHTML;

                    const fragment = document.createDocumentFragment();
                    while (tempDiv.firstChild) {
                        fragment.appendChild(tempDiv.firstChild);
                    }

                    parent.replaceChild(fragment, textNode);
                }
            });
        });

        // Attach listeners for positioning
        const terms = document.querySelectorAll('.tooltip-term');
        terms.forEach(function(termEl) {
            termEl.addEventListener('mouseenter', function() { positionTooltip(termEl); });
            termEl.addEventListener('focus', function() { positionTooltip(termEl); });
        });
        window.addEventListener('resize', function() {
            const hovered = document.querySelector('.tooltip-term:hover');
            if (hovered) positionTooltip(hovered);
        });
        window.addEventListener('scroll', function() {
            const hovered = document.querySelector('.tooltip-term:hover');
            if (hovered) positionTooltip(hovered);
        }, { passive: true });
    }

    /**
     * Add Reading Time Estimation
     */
    function addReadingTime() {
        const article = document.querySelector('.feature-article');
        if (!article) return;

        // Check if reading time already exists
        if (document.querySelector('.reading-time')) return;

        const text = article.textContent;
        const wordsPerMinute = 200;
        const wordCount = text.trim().split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / wordsPerMinute);

        const readingTimeElement = document.createElement('span');
        readingTimeElement.className = 'reading-time';
        readingTimeElement.textContent = readingTime + ' min read';

        const publishDate = document.querySelector('.publish-date');
        if (publishDate && publishDate.parentNode) {
            publishDate.parentNode.appendChild(readingTimeElement);
        }
    }

    /**
     * Copy to clipboard functionality
     */
    function setupCopyButtons() {
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('copy-button') || e.target.closest('.copy-button')) {
                e.preventDefault();
                const button = e.target.classList.contains('copy-button') ? e.target : e.target.closest('.copy-button');
                const codeBlock = button.parentNode.parentNode.querySelector('pre code') || button.parentNode.parentNode.querySelector('code');

                if (codeBlock) {
                    const text = codeBlock.textContent;
                    fallbackCopyToClipboard(text);
                }
            }
        });
    }

    // Initialize bookmark state
    function initializeBookmarkState() {
        if (localStorage.getItem('bookmarked-hallucination-prevention')) {
            const bookmarkButtons = document.querySelectorAll('.share-icon[data-action="bookmark"]');
            bookmarkButtons.forEach(function(button) {
                const icon = button.querySelector('.material-icons');
                if (icon) {
                    icon.textContent = 'bookmark';
                }
            });
        }
    }

    // Initialize all functionality
    setTimeout(function() {
        initializeBookmarkState();
    }, 100);

})();

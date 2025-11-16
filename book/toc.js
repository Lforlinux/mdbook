// Populate the sidebar
//
// This is a script, and not included directly in the page, to control the total size of the book.
// The TOC contains an entry for each page, so if each page includes a copy of the TOC,
// the total size of the page becomes O(n**2).
class MDBookSidebarScrollbox extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.innerHTML = '<ol class="chapter"><li class="chapter-item expanded affix "><a href="introduction.html">Introduction</a></li><li class="chapter-item expanded affix "><li class="part-title">Projects</li><li class="chapter-item expanded "><a href="cloud-cv/introduction.html"><strong aria-hidden="true">1.</strong> Cloud-CV</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="cloud-cv/architecture.html"><strong aria-hidden="true">1.1.</strong> Architecture</a></li><li class="chapter-item expanded "><a href="cloud-cv/deployment.html"><strong aria-hidden="true">1.2.</strong> Deployment</a></li><li class="chapter-item expanded "><a href="cloud-cv/localstack.html"><strong aria-hidden="true">1.3.</strong> Local Development with LocalStack</a></li><li class="chapter-item expanded "><a href="cloud-cv/technical-implementation.html"><strong aria-hidden="true">1.4.</strong> Technical Implementation</a></li><li class="chapter-item expanded "><a href="cloud-cv/security.html"><strong aria-hidden="true">1.5.</strong> Security &amp; Best Practices</a></li><li class="chapter-item expanded "><a href="cloud-cv/monitoring.html"><strong aria-hidden="true">1.6.</strong> Monitoring &amp; Observability</a></li><li class="chapter-item expanded "><a href="cloud-cv/cost-optimization.html"><strong aria-hidden="true">1.7.</strong> Cost Optimization</a></li><li class="chapter-item expanded "><a href="cloud-cv/troubleshooting.html"><strong aria-hidden="true">1.8.</strong> Troubleshooting</a></li><li class="chapter-item expanded "><a href="cloud-cv/technical-qa.html"><strong aria-hidden="true">1.9.</strong> Technical Q&amp;A</a></li><li class="chapter-item expanded "><a href="cloud-cv/advanced-topics.html"><strong aria-hidden="true">1.10.</strong> Advanced Topics</a></li></ol></li><li class="chapter-item expanded "><a href="stack-quest/introduction.html"><strong aria-hidden="true">2.</strong> Stack-Quest</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="stack-quest/features.html"><strong aria-hidden="true">2.1.</strong> Features</a></li><li class="chapter-item expanded "><a href="stack-quest/content.html"><strong aria-hidden="true">2.2.</strong> Content Structure</a></li><li class="chapter-item expanded "><a href="stack-quest/technical-implementation.html"><strong aria-hidden="true">2.3.</strong> Technical Implementation</a></li><li class="chapter-item expanded "><a href="stack-quest/architecture.html"><strong aria-hidden="true">2.4.</strong> Architecture &amp; Design</a></li><li class="chapter-item expanded "><a href="stack-quest/deployment.html"><strong aria-hidden="true">2.5.</strong> Deployment &amp; CI/CD</a></li><li class="chapter-item expanded "><a href="stack-quest/performance.html"><strong aria-hidden="true">2.6.</strong> Performance Optimization</a></li><li class="chapter-item expanded "><a href="stack-quest/technical-qa.html"><strong aria-hidden="true">2.7.</strong> Technical Q&amp;A</a></li></ol></li><li class="chapter-item expanded "><a href="opensource-llm-rag-stack/introduction.html"><strong aria-hidden="true">3.</strong> Opensource-LLM-RAG-Stack</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="opensource-llm-rag-stack/architecture.html"><strong aria-hidden="true">3.1.</strong> Architecture</a></li><li class="chapter-item expanded "><a href="opensource-llm-rag-stack/setup.html"><strong aria-hidden="true">3.2.</strong> Setup Guide</a></li><li class="chapter-item expanded "><a href="opensource-llm-rag-stack/rag-guide.html"><strong aria-hidden="true">3.3.</strong> RAG Implementation Guide</a></li><li class="chapter-item expanded "><a href="opensource-llm-rag-stack/monitoring.html"><strong aria-hidden="true">3.4.</strong> Monitoring &amp; Observability</a></li><li class="chapter-item expanded "><a href="opensource-llm-rag-stack/technical-implementation.html"><strong aria-hidden="true">3.5.</strong> Technical Implementation</a></li><li class="chapter-item expanded "><a href="opensource-llm-rag-stack/security.html"><strong aria-hidden="true">3.6.</strong> Security &amp; Best Practices</a></li><li class="chapter-item expanded "><a href="opensource-llm-rag-stack/scaling.html"><strong aria-hidden="true">3.7.</strong> Scaling &amp; Performance</a></li><li class="chapter-item expanded "><a href="opensource-llm-rag-stack/troubleshooting.html"><strong aria-hidden="true">3.8.</strong> Troubleshooting</a></li><li class="chapter-item expanded "><a href="opensource-llm-rag-stack/technical-qa.html"><strong aria-hidden="true">3.9.</strong> Technical Q&amp;A</a></li></ol></li><li class="chapter-item expanded "><a href="kubernetes-gitops-platform/introduction.html"><strong aria-hidden="true">4.</strong> Kubernetes GitOps Platform</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="kubernetes-gitops-platform/architecture.html"><strong aria-hidden="true">4.1.</strong> Architecture</a></li><li class="chapter-item expanded "><a href="kubernetes-gitops-platform/technical-implementation.html"><strong aria-hidden="true">4.2.</strong> Technical Implementation</a></li><li class="chapter-item expanded "><a href="kubernetes-gitops-platform/deployment.html"><strong aria-hidden="true">4.3.</strong> Deployment</a></li><li class="chapter-item expanded "><a href="kubernetes-gitops-platform/monitoring.html"><strong aria-hidden="true">4.4.</strong> Monitoring &amp; Observability</a></li><li class="chapter-item expanded "><a href="kubernetes-gitops-platform/security.html"><strong aria-hidden="true">4.5.</strong> Security &amp; Best Practices</a></li><li class="chapter-item expanded "><a href="kubernetes-gitops-platform/scaling.html"><strong aria-hidden="true">4.6.</strong> Scaling &amp; Performance</a></li><li class="chapter-item expanded "><a href="kubernetes-gitops-platform/k6-performance-testing.html"><strong aria-hidden="true">4.7.</strong> k6 Performance Testing</a></li><li class="chapter-item expanded "><a href="kubernetes-gitops-platform/troubleshooting.html"><strong aria-hidden="true">4.8.</strong> Troubleshooting</a></li><li class="chapter-item expanded "><a href="kubernetes-gitops-platform/technical-qa.html"><strong aria-hidden="true">4.9.</strong> Technical Q&amp;A</a></li></ol></li></ol>';
        // Set the current, active page, and reveal it if it's hidden
        let current_page = document.location.href.toString().split("#")[0].split("?")[0];
        if (current_page.endsWith("/")) {
            current_page += "index.html";
        }
        var links = Array.prototype.slice.call(this.querySelectorAll("a"));
        var l = links.length;
        for (var i = 0; i < l; ++i) {
            var link = links[i];
            var href = link.getAttribute("href");
            if (href && !href.startsWith("#") && !/^(?:[a-z+]+:)?\/\//.test(href)) {
                link.href = path_to_root + href;
            }
            // The "index" page is supposed to alias the first chapter in the book.
            if (link.href === current_page || (i === 0 && path_to_root === "" && current_page.endsWith("/index.html"))) {
                link.classList.add("active");
                var parent = link.parentElement;
                if (parent && parent.classList.contains("chapter-item")) {
                    parent.classList.add("expanded");
                }
                while (parent) {
                    if (parent.tagName === "LI" && parent.previousElementSibling) {
                        if (parent.previousElementSibling.classList.contains("chapter-item")) {
                            parent.previousElementSibling.classList.add("expanded");
                        }
                    }
                    parent = parent.parentElement;
                }
            }
        }
        // Track and set sidebar scroll position
        this.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                sessionStorage.setItem('sidebar-scroll', this.scrollTop);
            }
        }, { passive: true });
        var sidebarScrollTop = sessionStorage.getItem('sidebar-scroll');
        sessionStorage.removeItem('sidebar-scroll');
        if (sidebarScrollTop) {
            // preserve sidebar scroll position when navigating via links within sidebar
            this.scrollTop = sidebarScrollTop;
        } else {
            // scroll sidebar to current active section when navigating via "next/previous chapter" buttons
            var activeSection = document.querySelector('#sidebar .active');
            if (activeSection) {
                activeSection.scrollIntoView({ block: 'center' });
            }
        }
        // Toggle buttons
        var sidebarAnchorToggles = document.querySelectorAll('#sidebar a.toggle');
        function toggleSection(ev) {
            ev.currentTarget.parentElement.classList.toggle('expanded');
        }
        Array.from(sidebarAnchorToggles).forEach(function (el) {
            el.addEventListener('click', toggleSection);
        });
    }
}
window.customElements.define("mdbook-sidebar-scrollbox", MDBookSidebarScrollbox);

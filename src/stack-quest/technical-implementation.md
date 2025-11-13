# Stack-Quest Technical Implementation

## Frontend Architecture

### HTML Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>StackQuest - DevOps Knowledge Base</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <header class="header">
            <h1>StackQuest 🚀</h1>
            <p>A quest for stack knowledge</p>
        </header>
        
        <main class="main-content">
            <!-- Category selection -->
            <section class="categories">
                <!-- Category buttons -->
            </section>
            
            <!-- Question display -->
            <section class="question-section">
                <div class="question-card">
                    <h2 id="question-title">Select a category to begin</h2>
                    <div id="question-content"></div>
                </div>
            </section>
        </main>
    </div>
    
    <script src="script.js"></script>
</body>
</html>
```

## JavaScript Implementation

### Core Application Class
```javascript
class StackQuest {
    constructor() {
        this.categories = [];
        this.currentCategory = null;
        this.questions = [];
        this.shownQuestions = new Set();
        this.currentQuestion = null;
        this.init();
    }

    async init() {
        await this.loadCategories();
        await this.loadQuestions();
        this.setupEventListeners();
        this.renderCategories();
    }

    async loadCategories() {
        // Load category definitions
        this.categories = [
            { id: 'linux', name: 'Linux 🐧', file: 'Random-Questions/linux.md' },
            { id: 'networking', name: 'Networking 🌐', file: 'Random-Questions/networking.md' },
            { id: 'git', name: 'Git', file: 'Random-Questions/git.md' },
            { id: 'aws', name: 'AWS ☁️', file: 'Random-Questions/aws.md' },
            { id: 'terraform', name: 'Terraform 🏗️', file: 'Random-Questions/terraform.md' },
            { id: 'docker', name: 'Docker 🐳', file: 'Random-Questions/docker.md' },
            { id: 'kubernetes', name: 'Kubernetes 🎻', file: 'Random-Questions/kubernetes.md' },
            { id: 'cicd', name: 'CI/CD 🔄', file: 'Random-Questions/cicd.md' },
            { id: 'devops', name: 'DevOps 🛠️', file: 'Random-Questions/devops.md' },
            { id: 'system-design', name: 'System Design 🍥', file: 'Random-Questions/system-design.md' },
            { id: 'security', name: 'Security 🔒', file: 'Random-Questions/security.md' }
        ];
    }

    async loadQuestions() {
        // Load questions from markdown files
        const category = this.currentCategory;
        if (!category) return;

        try {
            const response = await fetch(category.file);
            const content = await response.text();
            this.questions = this.parseQuestions(content, category.id);
        } catch (error) {
            console.error('Error loading questions:', error);
        }
    }

    parseQuestions(content, category) {
        // Parse markdown content to extract questions
        const questions = [];
        const lines = content.split('\n');
        let currentQuestion = null;
        let inDetails = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line === '<details>') {
                inDetails = true;
                currentQuestion = { category, content: [] };
            } else if (line.startsWith('<summary>') && line.endsWith('</summary>')) {
                currentQuestion.title = line.replace('<summary>', '').replace('</summary>', '');
            } else if (inDetails && currentQuestion) {
                if (line === '</details>') {
                    questions.push(currentQuestion);
                    currentQuestion = null;
                    inDetails = false;
                } else if (line && !line.startsWith('<summary>')) {
                    currentQuestion.content.push(line);
                }
            }
        }

        return questions;
    }

    getRandomQuestion() {
        const availableQuestions = this.questions.filter(
            q => !this.shownQuestions.has(q.title)
        );

        if (availableQuestions.length === 0) {
            // Reset shown questions if all have been shown
            this.shownQuestions.clear();
            return this.questions[Math.floor(Math.random() * this.questions.length)];
        }

        const question = availableQuestions[
            Math.floor(Math.random() * availableQuestions.length)
        ];
        this.shownQuestions.add(question.title);
        return question;
    }

    displayQuestion(question) {
        const titleElement = document.getElementById('question-title');
        const contentElement = document.getElementById('question-content');
        
        titleElement.textContent = question.title;
        contentElement.innerHTML = this.formatQuestionContent(question.content);
    }

    formatQuestionContent(content) {
        // Convert markdown-like content to HTML
        return content.map(line => {
            if (line.startsWith('**')) {
                return `<p><strong>${line.replace(/\*\*/g, '')}</strong></p>`;
            } else if (line.startsWith('- ')) {
                return `<li>${line.substring(2)}</li>`;
            } else if (line.startsWith('```')) {
                return '<pre><code>';
            } else {
                return `<p>${line}</p>`;
            }
        }).join('');
    }

    setupEventListeners() {
        // Category selection
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectCategory(e.target.dataset.category);
            });
        });

        // Next question button
        document.getElementById('next-question').addEventListener('click', () => {
            this.showNextQuestion();
        });

        // Reset session button
        document.getElementById('reset-session').addEventListener('click', () => {
            this.resetSession();
        });
    }

    selectCategory(categoryId) {
        this.currentCategory = this.categories.find(c => c.id === categoryId);
        this.shownQuestions.clear();
        this.loadQuestions().then(() => {
            this.showNextQuestion();
        });
    }

    showNextQuestion() {
        const question = this.getRandomQuestion();
        this.currentQuestion = question;
        this.displayQuestion(question);
    }

    resetSession() {
        this.shownQuestions.clear();
        this.showNextQuestion();
    }
}

// Initialize application
const app = new StackQuest();
```

## Responsive Design

### CSS Implementation
```css
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.categories {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin-bottom: 30px;
}

.category-btn {
    padding: 15px 20px;
    border: 2px solid #007bff;
    border-radius: 8px;
    background: white;
    cursor: pointer;
    transition: all 0.3s;
}

.category-btn:hover {
    background: #007bff;
    color: white;
}

.question-card {
    background: white;
    border-radius: 8px;
    padding: 30px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

@media (max-width: 768px) {
    .categories {
        grid-template-columns: 1fr;
    }
    
    .question-card {
        padding: 20px;
    }
}
```

## Session Management

### LocalStorage Implementation
```javascript
class SessionManager {
    constructor() {
        this.storageKey = 'stackquest-session';
    }

    saveSession(sessionData) {
        localStorage.setItem(this.storageKey, JSON.stringify(sessionData));
    }

    loadSession() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : null;
    }

    clearSession() {
        localStorage.removeItem(this.storageKey);
    }

    getShownQuestions() {
        const session = this.loadSession();
        return session ? session.shownQuestions : [];
    }

    addShownQuestion(questionTitle) {
        const session = this.loadSession() || { shownQuestions: [] };
        if (!session.shownQuestions.includes(questionTitle)) {
            session.shownQuestions.push(questionTitle);
            this.saveSession(session);
        }
    }
}
```

## Content Management

### Markdown Question Format
```markdown
<details>
<summary>What is the difference between TCP and UDP?</summary>

**Answer:**

TCP (Transmission Control Protocol) and UDP (User Datagram Protocol) are both transport layer protocols but serve different purposes:

- **TCP**: Connection-oriented, reliable, ordered delivery
  - Guarantees delivery
  - Error checking and correction
  - Flow control
  - Used for: HTTP, HTTPS, FTP, SSH

- **UDP**: Connectionless, unreliable, faster
  - No delivery guarantee
  - No error checking
  - Lower overhead
  - Used for: DNS, DHCP, streaming, gaming

</details>
```

## Performance Optimization

### Lazy Loading
```javascript
class LazyLoader {
    constructor() {
        this.loadedCategories = new Set();
    }

    async loadCategoryOnDemand(categoryId) {
        if (this.loadedCategories.has(categoryId)) {
            return; // Already loaded
        }

        const category = this.categories.find(c => c.id === categoryId);
        if (!category) return;

        try {
            const response = await fetch(category.file);
            const content = await response.text();
            this.parseAndCacheQuestions(content, categoryId);
            this.loadedCategories.add(categoryId);
        } catch (error) {
            console.error(`Error loading category ${categoryId}:`, error);
        }
    }

    parseAndCacheQuestions(content, categoryId) {
        // Parse and cache questions for faster access
        const questions = this.parseQuestions(content, categoryId);
        this.questionCache[categoryId] = questions;
    }
}
```

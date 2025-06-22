document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});

class App {
    constructor() {
        this.weeks = [];
    }

    async init() {
        this.weeks = await DataParser.fetchAndParseData();
        UIBuilder.buildNav(this.weeks);
        this.displayInitialTopic();
        this.setupEventListeners();
        this.setupSearch(); // Add this line
    }

    displayInitialTopic() {
        if (this.weeks.length > 0 && this.weeks[0].topics.length > 0) {
            const firstWeek = this.weeks[0];
            const firstTopic = firstWeek.topics[0];
            UIBuilder.displayTopic(this.weeks, firstWeek.id, firstTopic.id);
            // Set the first topic as active in the nav
            const firstTopicLink = document.querySelector(`[data-topic-id="${firstTopic.id}"]`);
            if(firstTopicLink) {
                firstTopicLink.classList.add('active');
                // Open the parent week section
                firstTopicLink.closest('ul').style.display = 'block';
            }
        }
    }

    setupEventListeners() {
        // Event delegation for topic links
        const nav = document.getElementById('app-nav');
        nav.addEventListener('click', (e) => {
            const target = e.target;
            if (target.tagName === 'A' && target.dataset.topicId) {
                e.preventDefault();
                UIBuilder.displayTopic(this.weeks, target.dataset.weekId, target.dataset.topicId);

                // Handle active class
                document.querySelectorAll('#app-nav a').forEach(a => a.classList.remove('active'));
                target.classList.add('active');
            } else if (target.tagName === 'A' && target.parentElement.parentElement.id === 'app-nav') {
                 e.preventDefault();
                const topicList = target.nextElementSibling;
                if (topicList) {
                    const isVisible = topicList.style.display === 'block';
                    topicList.style.display = isVisible ? 'none' : 'block';
                }
            }
        });
    }

    setupSearch() {
        const searchInput = document.getElementById('search-input');
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            this.filterAndDisplayNav(searchTerm);
        });
    }

    filterAndDisplayNav(searchTerm) {
        if (!searchTerm) {
            UIBuilder.buildNav(this.weeks);
            this.displayInitialTopic(); // Or restore previous state
            return;
        }

        const filteredWeeks = this.weeks.map(week => {
            const filteredTopics = week.topics.filter(topic => 
                topic.title.toLowerCase().includes(searchTerm) || 
                topic.content.toLowerCase().includes(searchTerm)
            );
            // Return a new week object with filtered topics
            return { ...week, topics: filteredTopics };
        }).filter(week => week.topics.length > 0); // Only include weeks that have matching topics

        UIBuilder.buildNav(filteredWeeks, true); // Pass true to expand all weeks
    }
}

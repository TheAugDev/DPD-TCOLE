class DataParser {
    static async fetchAndParseData() {
        const response = await fetch('topic_data.html');
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        return this.parseWeeks(doc);
    }

    static parseWeeks(doc) {
        const weeks = [];
        const weekElements = doc.querySelectorAll('h2');
        weekElements.forEach((weekEl, index) => {
            const weekId = `week-${index + 1}`;
            const week = {
                id: weekId,
                title: weekEl.textContent.trim(),
                topics: []
            };

            let nextElement = weekEl.nextElementSibling;
            while (nextElement && nextElement.tagName !== 'H2') {
                if (nextElement.tagName === 'H3') {
                    const topicId = `topic-${index + 1}-${week.topics.length + 1}`;
                    week.topics.push({
                        id: topicId,
                        title: nextElement.textContent.trim(),
                        content: nextElement.nextElementSibling
                    });
                }
                nextElement = nextElement.nextElementSibling;
            }
            weeks.push(week);
        });
        return weeks;
    }
}

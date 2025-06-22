class UIBuilder {
    static buildNav(weeks, expandAll = false) {
        const navUl = document.createElement('ul');
        weeks.forEach(week => {
            const weekLi = document.createElement('li');
            const weekLink = document.createElement('a');
            weekLink.href = '#';
            weekLink.textContent = week.title;
            weekLink.dataset.weekId = week.id;
            weekLi.appendChild(weekLink);

            if (week.topics.length > 0) {
                const topicsUl = document.createElement('ul');
                if (expandAll) {
                    topicsUl.style.display = 'block';
                }
                week.topics.forEach(topic => {
                    const topicLi = document.createElement('li');
                    const topicLink = document.createElement('a');
                    topicLink.href = '#';
                    topicLink.textContent = topic.title;
                    topicLink.dataset.weekId = week.id;
                    topicLink.dataset.topicId = topic.id;
                    topicLi.appendChild(topicLink);
                    topicsUl.appendChild(topicLi);
                });
                weekLi.appendChild(topicsUl);
            }
            navUl.appendChild(weekLi);
        });

        const navContainer = document.getElementById('app-nav');
        navContainer.innerHTML = ''; // Clear previous nav
        navContainer.appendChild(navUl);
    }

    static displayTopic(weeks, weekId, topicId) {
        const week = weeks.find(w => w.id === weekId);
        if (!week) return;

        const topic = week.topics.find(t => t.id === topicId);
        if (!topic) return;

        const mainContent = document.getElementById('app-main');
        mainContent.innerHTML = `
            <h2>${topic.title}</h2>
            <div>${topic.content}</div>
        `;
    }
}

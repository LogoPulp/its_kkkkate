
export async function updateGoalBar() {
    const token = 'VPhFBTY5SmKJQVysdXWY';
    const apiUrl = `https://www.donationalerts.com/api/v1/goal/data?token=${token}`;
    
    // Elements
    const goalLabel = document.querySelector('.goal-label');
    const goalFill = document.querySelector('.goal-fill');
    const goalPercent = document.querySelector('.goal-percent');

    if (!goalLabel || !goalFill || !goalPercent) return;

    try {
        // Since DA might block CORS, we wrap in try-catch
        // In some cases we might need a proxy or static file update
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('CORS or Network error');
        
        const json = await response.json();
        const data = json.data[0];

        if (data) {
            goalLabel.textContent = `ЦЕЛЬ: ${data.title.toUpperCase()}`;
            goalPercent.textContent = `${data.percent}%`;
            goalFill.style.width = `${data.percent}%`;
            
            // Add tooltip with amounts
            const amountText = `${data.amount} / ${data.goal_amount} ${data.currency}`;
            goalFill.parentElement.setAttribute('title', amountText);
        }
    } catch (err) {
        console.warn("DA Goal Sync: Direct fetch blocked or failed. Using static values or trying alternative.");
        // If fetch fails, we could look for a local goal.json updated by a script
        try {
            const localResponse = await fetch('assets/goal.json');
            if (localResponse.ok) {
                const localData = await localResponse.json();
                goalLabel.textContent = `ЦЕЛЬ: ${localData.title.toUpperCase()}`;
                goalPercent.textContent = `${localData.percent}%`;
                goalFill.style.width = `${localData.percent}%`;
            }
        } catch (e) {
            // Already handled or just leave defaults
        }
    }
}

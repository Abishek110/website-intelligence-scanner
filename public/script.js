function calculateOffset(score) {
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    return circumference - (score / 100) * circumference;
}

function getRingClass(score) {
    if (score >= 80) return "high-score";
    if (score >= 50) return "medium-score";
    return "low-score";
}

async function analyzeWebsite() {

    const website = document.getElementById("websiteInput").value;
    const results = document.getElementById("results");

    if (!website) {
        alert("Enter a website.");
        return;
    }

    const response = await fetch("/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ website })
    });

    const data = await response.json();

    if (data.error) {
        alert(data.error);
        return;
    }

    results.innerHTML = `
        <div class="card">
            <h2>SEO</h2>
            <svg class="progress-ring" width="200" height="200">
                <circle class="bg" cx="100" cy="100" r="70"></circle>
                <circle class="progress ${getRingClass(data.seoScore)}" id="seoRing" cx="100" cy="100" r="70"></circle>
            </svg>
            <div class="score-text">${data.seoScore} (${data.seoScore >= 90 ? "A+" : data.seoScore >= 80 ? "A" : data.seoScore >= 70 ? "B" : "C"})</div>
        </div>

        <div class="card">
            <h2>Security</h2>
            <svg class="progress-ring" width="200" height="200">
                <circle class="bg" cx="100" cy="100" r="70"></circle>
                <circle class="progress ${getRingClass(data.securityScore)}" id="securityRing" cx="100" cy="100" r="70"></circle>
            </svg>
            <div class="score-text">${data.securityScore} (${data.securityScore >= 90 ? "A+" : data.securityScore >= 80 ? "A" : data.securityScore >= 70 ? "B" : "C"})</div>
        </div>
    `;

    setTimeout(() => {
        document.getElementById("seoRing")
            .style.strokeDashoffset = calculateOffset(data.seoScore);

        document.getElementById("securityRing")
            .style.strokeDashoffset = calculateOffset(data.securityScore);
    }, 100);
}

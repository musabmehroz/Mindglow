const express = require('express');
const path = require('path');
const fs = require('fs'); // File system module to save data
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Path where data will be saved
const DATA_FILE = path.join(__dirname, 'user_data.json');

// Helper function to save logs securely
function saveToDatabase(type, inputData, outputData) {
    let currentLogs = [];
    
    // Agar file pehle se maujood hai, toh purana data read karo
    if (fs.existsSync(DATA_FILE)) {
        try {
            const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
            currentLogs = JSON.parse(fileContent);
        } catch (e) {
            console.error("Error reading log file, resetting...", e);
        }
    }

    // Naya data record banao timestamp ke saath
    const newLog = {
        timestamp: new Date().toISOString(),
        type: type,
        userInput: inputData,
        backendResponse: outputData
    };

    currentLogs.push(newLog);

    // File me wapis save kar do (JSON format me beautify kar ke)
    fs.writeFileSync(DATA_FILE, JSON.stringify(currentLogs, null, 2), 'utf8');
}

// Central Database for conditions
const detailedDB = {
    "Depression": {
        brief: "Depression is a mood disorder with persistent sadness, loss of interest, fatigue, and worthlessness.",
        solutions: `<div class="solution-block"><strong>🧠 Therapy:</strong> CBT, IPT, behavioral activation.</div>
                    <div class="solution-block"><strong>💊 Medication:</strong> SSRIs/SNRIs under psychiatrist.</div>
                    <div class="solution-block"><strong>🌿 Lifestyle:</strong> Daily walks, sleep routine, nutrition.</div>`
    },
    "Anxiety Disorder": {
        brief: "Excessive worry, restlessness, muscle tension. Hyperactive amygdala and stress response.",
        solutions: `<div class="solution-block"><strong>🧠 CBT/ACT:</strong> Challenge thoughts, acceptance.</div>
                    <div class="solution-block"><strong>🌬️ Breathing:</strong> 4-7-8, progressive relaxation.</div>
                    <div class="solution-block"><strong>📵 Lifestyle:</strong> Limit caffeine, exercise, sleep.</div>`
    },
    "Chronic Stress": {
        brief: "Long-term pressure elevates cortisol, causing fatigue, illness, burnout.",
        solutions: `<div class="solution-block"><strong>🧘 Relax:</strong> Meditation, yoga, breathing.</div>
                    <div class="solution-block"><strong>📋 Time:</strong> Prioritize, boundaries.</div>`
    },
    "Insomnia": {
        brief: "Difficulty sleeping despite opportunity. Impacts mood and cognition.",
        solutions: `<div class="solution-block"><strong>🧠 CBT-I:</strong> Stimulus control, sleep restriction.</div>
                    <div class="sleep-hygiene"><strong>🛏️ Hygiene:</strong> Dark room, no screens.</div>`
    }
};

const quizQuestions = [
    { q: "Stressed?", options: ["Overthink", "Deep breaths", "Ignore", "Scroll"], correct: 1 },
    { q: "Low?", options: ["Isolate", "Talk to friend", "Bed", "Skip meals"], correct: 1 },
    { q: "Workload?", options: ["Panic", "Plan tasks", "Quit", "Delay"], correct: 1 },
    { q: "Sleep?", options: ["Phone", "Caffeine", "Relax mind", "Overthink"], correct: 2 }
];

// 1. Condition Analyzer Route (Saves Data)
app.post('/api/analyze-condition', (req, res) => {
    const { condition } = req.body;
    let data = detailedDB[condition];

    if (!data) {
        data = {
            brief: `${condition} affects emotional wellbeing. Professional support is recommended.`,
            solutions: `<div class="solution-block"><strong>🧠 Therapy:</strong> CBT, counseling.</div>
                        <div class="solution-block"><strong>🌿 Self-care:</strong> Exercise, sleep, mindfulness.</div>`
        };
    }

    // DATA SAVE LOGIC HERE
    saveToDatabase("Condition Analysis", { selectedCondition: condition }, data);

    res.json({ condition, ...data });
});

// 2. Quick Mood Analysis Route (Saves Data)
app.post('/api/quick-mood', (req, res) => {
    const { moodText } = req.body;
    const text = moodText.toLowerCase();
    
    let analysis = "General mental tracking active.";
    let routine = "Maintain hydration, take a 10-minute walk, and try a digital detox tonight.";

    if (text.includes("stress") || text.includes("tired") || text.includes("work")) {
        analysis = "Elevated stress or exhaustion patterns detected.";
        routine = "Take micro-breaks using the Pomodoro technique (25m work, 5m rest) and focus on mindfulness.";
    } else if (text.includes("anxiety") || text.includes("scared") || text.includes("panic")) {
        analysis = "Anxiety markers identified.";
        routine = "Practice the 4-7-8 breathing exercise immediately and reduce caffeine intake.";
    }

    // DATA SAVE LOGIC HERE
    saveToDatabase("Quick Mood", { textEntered: moodText }, { analysis, routine });

    res.json({ analysis, routine });
});

// 3. Game Endpoint
app.get('/api/game-questions', (req, res) => {
    res.json(quizQuestions);
});

app.listen(PORT, () => console.log(`Server live on http://localhost:${PORT}`));
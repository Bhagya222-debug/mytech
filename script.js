// Global variables
let currentUser = null;
let currentScore = 0;
let currentGameQuestion = 0;
let gameQuestions = [];
let virtualTourStep = 0;
let celebrationTimeout = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeGame();
    loadLeaderboard();
});

// Initialize game questions
function initializeGame() {
    gameQuestions = [
        {
            character: "Sarah",
            direct: "Sarah says: \"I am studying for my exam.\"",
            options: [
                "Sarah said that she is studying for her exam.",
                "Sarah said that she was studying for her exam.",
                "Sarah said that she will study for her exam."
            ],
            correct: 1,
            explanation: "Present tense 'am studying' changes to past tense 'was studying' in reported speech."
        },
        {
            character: "Tom",
            direct: "Tom says: \"I will go to the market.\"",
            options: [
                "Tom said that he will go to the market.",
                "Tom said that he would go to the market.", 
                "Tom said that he goes to the market."
            ],
            correct: 1,
            explanation: "'Will' changes to 'would' in reported speech."
        },
        {
            character: "Maria",
            direct: "Maria says: \"I have finished my homework.\"",
            options: [
                "Maria said that she has finished her homework.",
                "Maria said that she had finished her homework.",
                "Maria said that she finished her homework."
            ],
            correct: 1,
            explanation: "Present perfect 'have finished' changes to past perfect 'had finished' in reported speech."
        },
        {
            character: "John",
            direct: "John says: \"I can swim very well.\"",
            options: [
                "John said that he can swim very well.",
                "John said that he could swim very well.",
                "John said that he will swim very well."
            ],
            correct: 1,
            explanation: "'Can' changes to 'could' in reported speech."
        },
        {
            character: "Lisa",
            direct: "Lisa says: \"I was reading a book.\"",
            options: [
                "Lisa said that she was reading a book.",
                "Lisa said that she had been reading a book.",
                "Lisa said that she is reading a book."
            ],
            correct: 1,
            explanation: "Past continuous 'was reading' changes to past perfect continuous 'had been reading' in reported speech."
        },
        {
            character: "David",
            direct: "David says: \"I must leave early today.\"",
            options: [
                "David said that he must leave early that day.",
                "David said that he had to leave early that day.",
                "David said that he will leave early that day."
            ],
            correct: 1,
            explanation: "'Must' changes to 'had to' in reported speech, and 'today' changes to 'that day'."
        },
        {
            character: "Emma",
            direct: "Emma says: \"I may come to the party.\"",
            options: [
                "Emma said that she may come to the party.",
                "Emma said that she might come to the party.",
                "Emma said that she will come to the party."
            ],
            correct: 1,
            explanation: "'May' changes to 'might' in reported speech."
        },
        {
            character: "Alex",
            direct: "Alex says: \"I bought this car yesterday.\"",
            options: [
                "Alex said that he bought that car yesterday.",
                "Alex said that he had bought that car the day before.",
                "Alex said that he buys that car yesterday."
            ],
            correct: 1,
            explanation: "Past simple 'bought' changes to past perfect 'had bought', 'this' becomes 'that', and 'yesterday' becomes 'the day before'."
        },
        {
            character: "Rachel",
            direct: "Rachel says: \"We are going to the beach tomorrow.\"",
            options: [
                "Rachel said that they are going to the beach tomorrow.",
                "Rachel said that they were going to the beach the next day.",
                "Rachel said that they will go to the beach the next day."
            ],
            correct: 1,
            explanation: "Present continuous 'are going' changes to past continuous 'were going', and 'tomorrow' changes to 'the next day'."
        },
        {
            character: "Mike",
            direct: "Mike says: \"I have never been to Paris.\"",
            options: [
                "Mike said that he has never been to Paris.",
                "Mike said that he had never been to Paris.",
                "Mike said that he never went to Paris."
            ],
            correct: 1,
            explanation: "Present perfect 'have never been' changes to past perfect 'had never been' in reported speech."
        }
    ];
}

// Handle login form submission
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('studentName').value.trim();
    const grade = document.getElementById('studentGrade').value;

    if (name && grade) {
        currentUser = { name, grade };
        document.getElementById('welcomeUser').textContent = `Welcome, ${name}!`;

        // Create welcome celebration
        createWelcomeCelebration(name);

        // Hide login modal and show main content after celebration
        setTimeout(() => {
            document.getElementById('loginModal').classList.remove('active');
            document.getElementById('mainContent').classList.remove('hidden');

            // Show virtual tour after a brief delay
            setTimeout(() => {
                document.getElementById('virtualTour').classList.add('active');
            }, 500);
        }, 1500);
    }
});

// Navigation functions
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    // Hide virtual tour
    document.getElementById('virtualTour').classList.remove('active');

    // Show selected section
    document.getElementById(sectionId).classList.add('active');

    // Update navigation buttons
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.classList.remove('active');
    });

    // Find and activate the correct nav button
    const activeButton = Array.from(navButtons).find(btn => 
        btn.textContent.toLowerCase().includes(sectionId.toLowerCase()) ||
        btn.onclick.toString().includes(sectionId)
    );
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

// Practice section functions
function checkAnswer(questionNum, correctAnswer) {
    const userAnswer = document.getElementById(`answer${questionNum}`).value.trim();
    const feedbackElement = document.getElementById(`feedback${questionNum}`);

    // Simple comparison - could be enhanced with better matching
    const isCorrect = userAnswer.toLowerCase().replace(/[.,!?]/g, '') === 
                     correctAnswer.toLowerCase().replace(/[.,!?]/g, '');

    if (isCorrect) {
        feedbackElement.innerHTML = '✅ Correct! Well done!';
        feedbackElement.className = 'feedback correct';
        currentScore += 10;
        updateScore();
        createCelebrationBalloons();
        showCelebrationText("Excellent! 🎉");
    } else {
        feedbackElement.innerHTML = `❌ Not quite right. The correct answer is: <strong>${correctAnswer}</strong>`;
        feedbackElement.className = 'feedback incorrect';
        createSadFaceBlast();
        showFailureText("Keep trying! 💪");
    }
}

// Game section functions
let selectedGameAnswer = null;

function selectGameAnswer(option, buttonElement) {
    // Remove selection from all buttons
    const optionButtons = document.querySelectorAll('.option-btn');
    optionButtons.forEach(btn => {
        btn.classList.remove('correct', 'incorrect');
    });

    selectedGameAnswer = option;
    const currentQuestion = gameQuestions[currentGameQuestion];
    const isCorrect = (option === 'A' && currentQuestion.correct === 0) ||
                     (option === 'B' && currentQuestion.correct === 1) ||
                     (option === 'C' && currentQuestion.correct === 2);

    const feedbackElement = document.getElementById('gameFeedback');

    if (isCorrect) {
        buttonElement.classList.add('correct');
        feedbackElement.innerHTML = `✅ Correct! ${currentQuestion.explanation}`;
        feedbackElement.style.color = '#155724';
        feedbackElement.style.backgroundColor = '#d4edda';
        currentScore += 10;
        updateScore();
        createCelebrationBalloons();
        showCelebrationText("Amazing! 🎊");
    } else {
        buttonElement.classList.add('incorrect');
        feedbackElement.innerHTML = `❌ Incorrect. ${currentQuestion.explanation}`;
        feedbackElement.style.color = '#721c24';
        feedbackElement.style.backgroundColor = '#f8d7da';
        createSadFaceBlast();
        showFailureText("Try again! 🤔");
    }

    feedbackElement.style.padding = '15px';
    feedbackElement.style.borderRadius = '8px';
    feedbackElement.style.marginTop = '15px';
    feedbackElement.style.fontWeight = 'bold';

    // Show next question button
    document.getElementById('nextQuestion').classList.remove('hidden');

    // Disable all option buttons
    optionButtons.forEach(btn => {
        btn.disabled = true;
        btn.style.cursor = 'not-allowed';
        btn.style.opacity = '0.7';
    });
}

function nextGameQuestion() {
    currentGameQuestion++;

    if (currentGameQuestion >= gameQuestions.length) {
        // Game completed
        document.querySelector('.game-container').innerHTML = `
            <h2>🎊 Congratulations! 🎊</h2>
            <div style="text-align: center; padding: 2rem;">
                <p style="font-size: 1.5rem; margin-bottom: 1rem;">You completed all the questions!</p>
                <p style="font-size: 1.2rem; margin-bottom: 2rem;">Final Score: <strong>${currentScore} points</strong></p>
                <button onclick="resetGame()" style="background: linear-gradient(45deg, #667eea, #764ba2); color: white; border: none; padding: 15px 30px; border-radius: 25px; cursor: pointer; font-size: 16px;">Play Again</button>
            </div>
        `;

        // Save score to leaderboard
        saveScoreToLeaderboard();
        return;
    }

    // Load next question
    loadGameQuestion();
}

function loadGameQuestion() {
    const question = gameQuestions[currentGameQuestion];
    document.getElementById('directSpeech').textContent = question.direct;

    const optionButtons = document.querySelectorAll('.option-btn');
    optionButtons.forEach((btn, index) => {
        btn.textContent = `${String.fromCharCode(65 + index)}) ${question.options[index]}`;
        btn.classList.remove('correct', 'incorrect');
        btn.disabled = false;
        btn.style.cursor = 'pointer';
        btn.style.opacity = '1';
    });

    document.getElementById('gameFeedback').innerHTML = '';
    document.getElementById('nextQuestion').classList.add('hidden');
    document.getElementById('gameScore').textContent = `${currentGameQuestion + 1}`;
}

function resetGame() {
    currentGameQuestion = 0;
    
    // Reset game container HTML
    document.querySelector('.game-container').innerHTML = `
        <h2>Conversation Game</h2>
        <div class="game-scenario">
            <div class="character">
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%234A90E2'/%3E%3Ccircle cx='40' cy='40' r='5' fill='white'/%3E%3Ccircle cx='60' cy='40' r='5' fill='white'/%3E%3Cpath d='M35 60 Q50 70 65 60' stroke='white' stroke-width='3' fill='none'/%3E%3C/svg%3E" alt="Character">
                <p>Meet Sarah!</p>
            </div>
            <div class="conversation-box">
                <div class="speech-bubble" id="speechBubble">
                    <p id="directSpeech">Sarah says: "I am studying for my exam."</p>
                </div>
                <div class="game-question">
                    <p>How would you report what Sarah said?</p>
                    <div class="options">
                        <button class="option-btn" onclick="selectGameAnswer('A', this)">A) Sarah said that she is studying for her exam.</button>
                        <button class="option-btn" onclick="selectGameAnswer('B', this)">B) Sarah said that she was studying for her exam.</button>
                        <button class="option-btn" onclick="selectGameAnswer('C', this)">C) Sarah said that she will study for her exam.</button>
                    </div>
                    <div class="game-feedback" id="gameFeedback"></div>
                    <button id="nextQuestion" class="hidden" onclick="nextGameQuestion()">Next Question</button>
                </div>
            </div>
        </div>
        <div class="game-score">
            <p>Game Score: <span id="gameScore">1</span>/10</p>
        </div>
    `;
    
    // Load the first question after resetting the HTML
    loadGameQuestion();
}

// Score management
function updateScore() {
    document.getElementById('userScore').textContent = `Score: ${currentScore}`;
}

// Navigation dot update function
function updateNavDots(currentStep) {
    // This function can be used to update navigation dots if needed
    console.log('Current tour step:', currentStep);
}

// Virtual Tour Functions
function exploreLocation(location) {
    const locations = {
        'start': {
            title: 'Welcome to Your Grammar Adventure!',
            description: 'You\'re about to embark on an exciting journey to master reported speech. Get ready to learn, practice, and have fun!',
            action: 'Let\'s begin this amazing journey!'
        },
        'theory': {
            title: 'Theory Castle Discovered!',
            description: 'Here you\'ll learn the fundamental rules of reported speech through interactive lessons, videos, and animated examples.',
            action: 'Enter the castle and start learning!'
        },
        'practice': {
            title: 'Practice Forest Explored!',
            description: 'Test your knowledge with 5 challenging exercises. Each correct answer will boost your confidence and skills!',
            action: 'Start practicing your skills!'
        },
        'game': {
            title: 'Game Arena Found!',
            description: 'Enjoy 10 fun questions with character conversations. Turn learning into an exciting game experience!',
            action: 'Begin the grammar game!'
        },
        'leaderboard': {
            title: 'Achievement Summit Reached!',
            description: 'See how you rank against other learners and earn amazing achievement badges based on your performance!',
            action: 'Check your achievements!'
        }
    };

    const locationData = locations[location];
    if (locationData) {
        showTourStep(locationData.title, locationData.description, locationData.action, location);
    }
}

function showTourStep(title, description, actionText, targetSection) {
    const tourOverlay = document.getElementById('virtualTour');
    const tourContainer = tourOverlay.querySelector('.tour-map-container');

    // Create tour step content
    const stepContent = document.createElement('div');
    stepContent.className = 'tour-step';
    stepContent.innerHTML = `
        <div style="text-align: center; padding: 2rem; background: rgba(255, 255, 255, 0.95); border-radius: 15px; margin: 2rem;">
            <h2 style="color: #667eea; margin-bottom: 1rem; font-size: 2rem;">${title}</h2>
            <p style="font-size: 1.2rem; margin-bottom: 2rem; color: #555;">${description}</p>
            <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                <button onclick="proceedToSection('${targetSection}')" style="background: linear-gradient(45deg, #28a745, #20bf6b); color: white; border: none; padding: 15px 30px; border-radius: 25px; cursor: pointer; font-size: 16px; font-weight: bold;">
                    ${actionText}
                </button>
                <button onclick="continueTour()" style="background: linear-gradient(45deg, #667eea, #764ba2); color: white; border: none; padding: 15px 30px; border-radius: 25px; cursor: pointer; font-size: 16px; font-weight: bold;">
                    Continue Tour
                </button>
            </div>
        </div>
    `;

    // Replace tour content temporarily
    const originalContent = tourContainer.innerHTML;
    tourContainer.innerHTML = '';
    tourContainer.appendChild(stepContent);

    // Store original content for restoration
    stepContent.setAttribute('data-original', 'true');
}

function proceedToSection(sectionId) {
    document.getElementById('virtualTour').classList.remove('active');
    showSection(sectionId);
}

function continueTour() {
    // Restore original tour content
    location.reload(); // Simple way to reset the tour
}

function startLearning() {
    document.getElementById('virtualTour').classList.remove('active');
    showSection('theory');
}

// Animation functions for theory section
function playAnimation() {
    // Reset all elements first
    resetAnimation();

    setTimeout(() => {
        // Step 1: Show the speaker
        const speaker = document.getElementById('speaker');
        const directBubble = document.getElementById('directBubble');

        if (speaker) {
            speaker.classList.add('animate');
            setTimeout(() => {
                if (directBubble) directBubble.classList.add('animate');
            }, 500);
        }

        // Step 2: Show transformation arrow
        setTimeout(() => {
            const transformArrow = document.getElementById('transformArrow');
            if (transformArrow) transformArrow.classList.add('animate');
        }, 1500);

        // Step 3: Show the reporter
        setTimeout(() => {
            const reporter = document.getElementById('reporter');
            const reportedBubble = document.getElementById('reportedBubble');

            if (reporter) {
                reporter.classList.add('animate');
                setTimeout(() => {
                    if (reportedBubble) reportedBubble.classList.add('animate');
                }, 500);
            }
        }, 2500);

        // Step 4: Show transformation steps
        setTimeout(() => {
            const transformationSteps = document.getElementById('transformationSteps');
            if (transformationSteps) {
                transformationSteps.classList.add('animate');

                // Animate each step with delay
                const stepItems = transformationSteps.querySelectorAll('.step-item');
                stepItems.forEach((step, index) => {
                    setTimeout(() => {
                        step.style.animation = 'stepAppear 0.6s ease-out forwards';
                        step.style.opacity = '0';
                        step.style.transform = 'translateX(-50px)';

                        setTimeout(() => {
                            step.style.opacity = '1';
                            step.style.transform = 'translateX(0)';
                        }, 50);
                    }, index * 200);
                });
            }
        }, 3500);

    }, 100);
}

function resetAnimation() {
    // Remove all animation classes
    const animatedElements = [
        'speaker', 'directBubble', 'transformArrow', 
        'reporter', 'reportedBubble', 'transformationSteps'
    ];

    animatedElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.classList.remove('animate');
        }
    });

    // Reset step items
    const stepItems = document.querySelectorAll('.step-item');
    stepItems.forEach(step => {
        step.style.animation = '';
        step.style.opacity = '';
        step.style.transform = '';
    });
}

// Leaderboard functions
function loadLeaderboard() {
    const leaderboardList = document.getElementById('leaderboardList');
    const savedScores = JSON.parse(localStorage.getItem('reportedSpeechScores') || '[]');

    // Sort by score descending
    savedScores.sort((a, b) => b.score - a.score);

    leaderboardList.innerHTML = '';

    if (savedScores.length === 0) {
        leaderboardList.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #fff; opacity: 0.8;">
                <p style="font-size: 1.2rem;">No scores yet. Be the first to play and get on the leaderboard!</p>
            </div>
        `;
        return;
    }

    savedScores.forEach((entry, index) => {
        const badge = getBadgeForScore(entry.score);
        const rankClass = index === 0 ? 'first' : index === 1 ? 'second' : index === 2 ? 'third' : '';

        const listItem = document.createElement('div');
        listItem.className = `leaderboard-item ${rankClass}`;
        listItem.innerHTML = `
            <div class="rank">${index + 1}</div>
            <div class="player-info">
                <div class="player-name">${entry.name}${badge}</div>
                <div class="player-grade">Grade ${entry.grade}</div>
            </div>
            <div class="score">${entry.score}</div>
        `;

        leaderboardList.appendChild(listItem);
    });
}

function getBadgeForScore(score) {
    if (score >= 200) return '<span class="badge badge-legendary">Legendary</span>';
    if (score >= 180) return '<span class="badge badge-genius">Genius</span>';
    if (score >= 160) return '<span class="badge badge-master">Master</span>';
    if (score >= 140) return '<span class="badge badge-expert">Expert</span>';
    if (score >= 120) return '<span class="badge badge-scholar">Scholar</span>';
    if (score >= 100) return '<span class="badge badge-learner">Learner</span>';
    if (score >= 50) return '<span class="badge badge-beginner">Beginner</span>';
    return '';
}

function saveScoreToLeaderboard() {
    if (!currentUser) return;

    const savedScores = JSON.parse(localStorage.getItem('reportedSpeechScores') || '[]');

    // Check if user already exists and update if score is higher
    const existingIndex = savedScores.findIndex(entry => 
        entry.name === currentUser.name && entry.grade === currentUser.grade
    );

    if (existingIndex !== -1) {
        if (currentScore > savedScores[existingIndex].score) {
            savedScores[existingIndex].score = currentScore;
        }
    } else {
        savedScores.push({
            name: currentUser.name,
            grade: currentUser.grade,
            score: currentScore
        });
    }

    localStorage.setItem('reportedSpeechScores', JSON.stringify(savedScores));
    loadLeaderboard();
}

// Celebration effects
function createCelebrationBalloons() {
    const balloonColors = ['red', 'blue', 'yellow', 'green', 'purple', 'pink', 'orange', 'cyan'];

    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            const balloon = document.createElement('div');
            balloon.className = `balloon balloon-${balloonColors[i]}`;
            balloon.style.left = Math.random() * 100 + '%';
            balloon.style.animationDelay = (Math.random() * 0.5) + 's';

            document.body.appendChild(balloon);

            // Remove balloon after animation
            setTimeout(() => {
                if (balloon.parentNode) {
                    balloon.parentNode.removeChild(balloon);
                }
            }, 4000);
        }, i * 200);
    }
}

function createSadFaceBlast() {
    const sadFaces = ['😢', '😔', '😞', '😟', '😕', '☹️'];

    for (let i = 0; i < 6; i++) {
        setTimeout(() => {
            const sadFace = document.createElement('div');
            sadFace.className = 'sad-face';
            sadFace.textContent = sadFaces[Math.floor(Math.random() * sadFaces.length)];
            sadFace.style.left = Math.random() * 100 + '%';
            sadFace.style.top = Math.random() * 100 + '%';

            document.body.appendChild(sadFace);

            // Create sad particles
            for (let j = 0; j < 3; j++) {
                setTimeout(() => {
                    const particle = document.createElement('div');
                    particle.className = 'sad-particle';
                    particle.style.left = sadFace.style.left;
                    particle.style.top = sadFace.style.top;
                    particle.style.animationDelay = (j * 0.2) + 's';

                    document.body.appendChild(particle);

                    setTimeout(() => {
                        if (particle.parentNode) {
                            particle.parentNode.removeChild(particle);
                        }
                    }, 2500);
                }, j * 100);
            }

            // Create tears
            for (let k = 0; k < 2; k++) {
                setTimeout(() => {
                    const tear = document.createElement('div');
                    tear.className = 'tear';
                    tear.style.left = (parseFloat(sadFace.style.left) + (k * 5)) + '%';
                    tear.style.top = (parseFloat(sadFace.style.top) + 5) + '%';
                    tear.style.animationDelay = (k * 0.3) + 's';

                    document.body.appendChild(tear);

                    setTimeout(() => {
                        if (tear.parentNode) {
                            tear.parentNode.removeChild(tear);
                        }
                    }, 2000);
                }, k * 150);
            }

            // Remove sad face after animation
            setTimeout(() => {
                if (sadFace.parentNode) {
                    sadFace.parentNode.removeChild(sadFace);
                }
            }, 3000);
        }, i * 150);
    }
}

function showCelebrationText(message) {
    if (celebrationTimeout) {
        clearTimeout(celebrationTimeout);
    }

    const textElement = document.createElement('div');
    textElement.style.position = 'fixed';
    textElement.style.top = '50%';
    textElement.style.left = '50%';
    textElement.style.transform = 'translate(-50%, -50%)';
    textElement.style.fontSize = '3rem';
    textElement.style.fontWeight = 'bold';
    textElement.style.color = 'transparent';
    textElement.style.background = 'linear-gradient(45deg, #28a745, #20bf6b, #26de81)';
    textElement.style.backgroundClip = 'text';
    textElement.style.webkitBackgroundClip = 'text';
    textElement.style.zIndex = '2500';
    textElement.style.pointerEvents = 'none';
    textElement.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.3)';
    textElement.style.animation = 'celebrationText 2s ease-out forwards';
    textElement.textContent = message;

    document.body.appendChild(textElement);

    celebrationTimeout = setTimeout(() => {
        if (textElement.parentNode) {
            textElement.parentNode.removeChild(textElement);
        }
    }, 2000);
}

function showFailureText(message) {
    if (celebrationTimeout) {
        clearTimeout(celebrationTimeout);
    }

    const textElement = document.createElement('div');
    textElement.style.position = 'fixed';
    textElement.style.top = '50%';
    textElement.style.left = '50%';
    textElement.style.transform = 'translate(-50%, -50%)';
    textElement.style.fontSize = '2.5rem';
    textElement.style.fontWeight = 'bold';
    textElement.style.color = 'transparent';
    textElement.style.background = 'linear-gradient(45deg, #ff6b6b, #ff4757, #ff3838)';
    textElement.style.backgroundClip = 'text';
    textElement.style.webkitBackgroundClip = 'text';
    textElement.style.zIndex = '2500';
    textElement.style.pointerEvents = 'none';
    textElement.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.3)';
    textElement.style.animation = 'failureText 2s ease-out forwards';
    textElement.textContent = message;

    document.body.appendChild(textElement);

    celebrationTimeout = setTimeout(() => {
        if (textElement.parentNode) {
            textElement.parentNode.removeChild(textElement);
        }
    }, 2000);
}

// Create welcome celebration with heart balloons
function createWelcomeCelebration(userName) {
    // Create welcome text overlay
    const welcomeText = document.createElement('div');
    welcomeText.style.position = 'fixed';
    welcomeText.style.top = '50%';
    welcomeText.style.left = '50%';
    welcomeText.style.transform = 'translate(-50%, -50%)';
    welcomeText.style.fontSize = '4rem';
    welcomeText.style.fontWeight = 'bold';
    welcomeText.style.color = 'transparent';
    welcomeText.style.background = 'linear-gradient(45deg, #ff69b4, #ff1493, #dc143c, #b22222)';
    welcomeText.style.backgroundClip = 'text';
    welcomeText.style.webkitBackgroundClip = 'text';
    welcomeText.style.zIndex = '3000';
    welcomeText.style.pointerEvents = 'none';
    welcomeText.style.textShadow = '3px 3px 6px rgba(0, 0, 0, 0.3)';
    welcomeText.style.animation = 'welcomeHeartText 3s ease-out forwards';
    welcomeText.textContent = `💖 Welcome ${userName}! 💖`;

    document.body.appendChild(welcomeText);

    // Create heart balloons with different colors
    const heartColors = [
        { color: '#ff69b4', shadow: 'rgba(255, 105, 180, 0.8)' }, // Hot pink
        { color: '#ff1493', shadow: 'rgba(255, 20, 147, 0.8)' }, // Deep pink
        { color: '#dc143c', shadow: 'rgba(220, 20, 60, 0.8)' }, // Crimson
        { color: '#ff6347', shadow: 'rgba(255, 99, 71, 0.8)' }, // Tomato
        { color: '#ff4500', shadow: 'rgba(255, 69, 0, 0.8)' }, // Orange red
        { color: '#ffd700', shadow: 'rgba(255, 215, 0, 0.8)' }, // Gold
        { color: '#ff69b4', shadow: 'rgba(255, 105, 180, 0.8)' }, // Hot pink
        { color: '#ff1493', shadow: 'rgba(255, 20, 147, 0.8)' }  // Deep pink
    ];

    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            const heartBalloon = document.createElement('div');
            heartBalloon.style.position = 'fixed';
            heartBalloon.style.fontSize = '80px';
            heartBalloon.style.color = heartColors[i].color;
            heartBalloon.style.left = Math.random() * 100 + '%';
            heartBalloon.style.zIndex = '2500';
            heartBalloon.style.pointerEvents = 'none';
            heartBalloon.style.filter = `drop-shadow(0 0 15px ${heartColors[i].shadow})`;
            heartBalloon.style.animation = 'heartBalloonBlast 4s ease-out forwards';
            heartBalloon.textContent = '💖';

            document.body.appendChild(heartBalloon);

            // Create sparkles around heart balloons
            for (let j = 0; j < 3; j++) {
                setTimeout(() => {
                    const sparkle = document.createElement('div');
                    sparkle.style.position = 'fixed';
                    sparkle.style.fontSize = '30px';
                    sparkle.style.color = '#ffd700';
                    sparkle.style.left = heartBalloon.style.left;
                    sparkle.style.top = '120vh';
                    sparkle.style.zIndex = '2400';
                    sparkle.style.pointerEvents = 'none';
                    sparkle.style.animation = 'sparkleFloat 3s ease-out forwards';
                    sparkle.style.animationDelay = (j * 0.3) + 's';
                    sparkle.textContent = '✨';

                    document.body.appendChild(sparkle);

                    setTimeout(() => {
                        if (sparkle.parentNode) {
                            sparkle.parentNode.removeChild(sparkle);
                        }
                    }, 3500);
                }, j * 200);
            }

            // Create love particles
            for (let k = 0; k < 5; k++) {
                setTimeout(() => {
                    const loveParticle = document.createElement('div');
                    loveParticle.style.position = 'fixed';
                    loveParticle.style.fontSize = '25px';
                    loveParticle.style.left = (parseFloat(heartBalloon.style.left) + (Math.random() * 10 - 5)) + '%';
                    loveParticle.style.top = '120vh';
                    loveParticle.style.zIndex = '2300';
                    loveParticle.style.pointerEvents = 'none';
                    loveParticle.style.animation = 'loveParticleFloat 4s ease-out forwards';
                    loveParticle.style.animationDelay = (k * 0.2) + 's';

                    const loveEmojis = ['💕', '💗', '💝', '💖', '💘'];
                    loveParticle.textContent = loveEmojis[Math.floor(Math.random() * loveEmojis.length)];

                    document.body.appendChild(loveParticle);

                    setTimeout(() => {
                        if (loveParticle.parentNode) {
                            loveParticle.parentNode.removeChild(loveParticle);
                        }
                    }, 4500);
                }, k * 100);
            }

            // Remove heart balloon after animation
            setTimeout(() => {
                if (heartBalloon.parentNode) {
                    heartBalloon.parentNode.removeChild(heartBalloon);
                }
            }, 4000);
        }, i * 300);
    }

    // Remove welcome text after animation
    setTimeout(() => {
        if (welcomeText.parentNode) {
            welcomeText.parentNode.removeChild(welcomeText);
        }
    }, 3000);
}

// Utility functions
function updateNavDots() {
    // Navigation dots functionality - currently not implemented
    // This function prevents console errors
}
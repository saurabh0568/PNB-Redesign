// Initialize Lucide Icons
lucide.createIcons();

// State Management
let totalTime = 300; // 5 minutes
let timeLeft = totalTime;
let timerInterval;

// DOM Elements
const timerDisplay = document.getElementById('session-timer');
const progressBar = document.getElementById('progress-bar');
const sessionOverlay = document.getElementById('session-expired-overlay');
const screens = document.querySelectorAll('.screen');
const btnSpendAnalyzer = document.getElementById('btn-spend-analyzer');
const btnPayBills = document.getElementById('btn-pay-bills');

// Initialize Timer
function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerUI();

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            showSessionExpired();
        }
    }, 1000);
}

function updateTimerUI() {
    // Update Text
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    // Update Progress Bar
    const percentage = (timeLeft / totalTime) * 100;
    progressBar.style.width = `${percentage}%`;
}

function showSessionExpired() {
    sessionOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Navigation Logic
function showScreen(screenId) {
    screens.forEach(screen => {
        screen.classList.remove('active');
        if (screen.id === screenId) {
            screen.classList.add('active');
        }
    });

    if (screenId === 'spend-analyzer') {
        initCharts();
    }
}

// Event Listeners
btnSpendAnalyzer.addEventListener('click', () => showScreen('spend-analyzer'));
btnPayBills.addEventListener('click', () => showScreen('pay-bills'));

// Register ChartDataLabels plugin
Chart.register(ChartDataLabels);

// Charts Logic
function initCharts() {
    const ctx = document.getElementById('spendDonutChart').getContext('2d');
    
    if (window.mySpendChart) {
        window.mySpendChart.destroy();
    }

    window.mySpendChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Fund Transfer', 'Lifestyle', 'Shopping'],
            datasets: [{
                data: [2400, 800, 420],
                backgroundColor: ['#d32f2f', '#1976d2', '#388e3c'],
                borderWidth: 0
            }]
        },
        options: {
            plugins: {
                legend: {
                    display: false
                },
                datalabels: {
                    color: '#fff',
                    font: {
                        weight: 'bold',
                        size: 16,
                        family: 'Inter'
                    },
                    formatter: (value, context) => {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = Math.round((value / total) * 100);
                        return percentage + '%';
                    }
                }
            }
        }
    });

    initDropdowns();
}

function initDropdowns() {
    const headers = document.querySelectorAll('.dropdown-header');
    headers.forEach(header => {
        // Remove existing listener if any (to prevent multiple calls)
        const newHeader = header.cloneNode(true);
        header.parentNode.replaceChild(newHeader, header);
        
        newHeader.addEventListener('click', () => {
            const parent = newHeader.parentElement;
            const wasActive = parent.classList.contains('active');
            
            // Close all
            document.querySelectorAll('.dropdown-details').forEach(d => d.classList.remove('active'));
            
            // Toggle current
            if (!wasActive) {
                parent.classList.add('active');
            }
        });
    });
    lucide.createIcons();
}

startTimer();

// --- Tour Logic ---
const tourSteps = [
    {
        title: "Pay Bills Quickly",
        text: "Manage all your utilities, credit cards, and insurance payments from one place.",
        target: "#btn-pay-bills",
        position: "right"
    },
    {
        title: "Analyze Your Spending",
        text: "Get deep insights into your transaction patterns with our advanced Spend Analyzer.",
        target: "#btn-spend-analyzer",
        position: "right"
    },
    {
        title: "Secure Session Timer",
        text: "For your safety, we track your session. You can see how much time is left right here.",
        target: ".timer-container",
        position: "bottom"
    }
];

class TourManager {
    constructor(steps) {
        this.steps = steps;
        this.currentStep = 0;
        this.overlay = document.getElementById('tour-overlay');
        this.tooltip = document.getElementById('tour-tooltip');
        this.highlight = null;
        
        this.initElements();
        this.attachListeners();
        
        // Auto-start the tour
        setTimeout(() => this.start(), 500);
    }

    initElements() {
        this.btnNext = document.getElementById('tour-next');
        this.title = document.getElementById('tour-title');
        this.text = document.getElementById('tour-text');
    }

    attachListeners() {
        this.btnNext.addEventListener('click', () => this.next());
        
        window.addEventListener('resize', () => {
            if (this.overlay && !this.overlay.classList.contains('hidden')) {
                this.updateStep();
            }
        });
    }

    start() {
        this.currentStep = 0;
        this.overlay.classList.remove('hidden');
        this.tooltip.classList.remove('hidden');
        
        if (!this.highlight) {
            this.highlight = document.createElement('div');
            this.highlight.className = 'tour-highlight tour-pulse';
            document.body.appendChild(this.highlight);
        }
        
        this.updateStep();
    }

    stop() {
        this.overlay.classList.add('hidden');
        this.tooltip.classList.add('hidden');
        if (this.highlight) {
            this.highlight.remove();
            this.highlight = null;
        }
    }

    next() {
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.updateStep();
        } else {
            this.stop();
        }
    }

    updateStep() {
        const step = this.steps[this.currentStep];
        const targetEl = document.querySelector(step.target);
        
        if (!targetEl) return;

        // Reset to dashboard if target is not visible
        if (this.currentStep < 2 && document.getElementById('dashboard').style.display === 'none') {
            showScreen('dashboard');
        }

        const rect = targetEl.getBoundingClientRect();
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;

        // Position Highlight
        this.highlight.style.top = `${rect.top + scrollY - 5}px`;
        this.highlight.style.left = `${rect.left + scrollX - 5}px`;
        this.highlight.style.width = `${rect.width + 10}px`;
        this.highlight.style.height = `${rect.height + 10}px`;

        // Update Content
        this.title.textContent = step.title;
        this.text.textContent = step.text;
        this.btnNext.textContent = this.currentStep === this.steps.length - 1 ? "Finish" : "Next";

        // Position Tooltip
        this.positionTooltip(rect, step.position);

        // Ensure element is in view
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    positionTooltip(targetRect, position) {
        const padding = 20;
        let top, left;
        const tooltipRect = this.tooltip.getBoundingClientRect();
        const arrow = this.tooltip.querySelector('.tooltip-arrow');

        // Reset arrow styles
        arrow.style.top = ''; arrow.style.bottom = ''; arrow.style.left = ''; arrow.style.right = '';

        if (position === 'right') {
            top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
            left = targetRect.right + padding;
            arrow.style.left = '-6px';
            arrow.style.top = '50%';
            arrow.style.marginTop = '-6px';
        } else if (position === 'bottom') {
            top = targetRect.bottom + padding;
            left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
            arrow.style.top = '-6px';
            arrow.style.left = '50%';
            arrow.style.marginLeft = '-6px';
        } else if (position === 'left') {
            top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
            left = targetRect.left - tooltipRect.width - padding;
            arrow.style.right = '-6px';
            arrow.style.top = '50%';
            arrow.style.marginTop = '-6px';
        }

        // Bound check
        left = Math.max(10, Math.min(left, window.innerWidth - tooltipRect.width - 10));
        top = Math.max(10, Math.min(top, window.innerHeight - tooltipRect.height - 10));

        this.tooltip.style.top = `${top}px`;
        this.tooltip.style.left = `${left}px`;
    }
}

const tour = new TourManager(tourSteps);
lucide.createIcons();

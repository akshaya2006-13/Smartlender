// SMART LENDER - Client Interactivity Logic

document.addEventListener('DOMContentLoaded', function () {
    // 1. Theme Toggle System
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const currentTheme = localStorage.getItem('theme') || 'light';

    // Apply saved theme on load
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', function () {
            let theme = document.documentElement.getAttribute('data-theme');
            let newTheme = theme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
            
            showToast(`Theme switched to ${newTheme} mode!`, 'info');
        });
    }

    function updateThemeIcon(theme) {
        if (!themeIcon) return;
        if (theme === 'dark') {
            themeIcon.className = 'fas fa-sun'; // Sun icon for light mode option
        } else {
            themeIcon.className = 'fas fa-moon'; // Moon icon for dark mode option
        }
    }

    // 2. Count-Up Stats Animation on Home Page
    const counters = document.querySelectorAll('.counter-val');
    if (counters.length > 0) {
        counters.forEach(counter => {
            const updateCount = () => {
                const target = parseFloat(counter.getAttribute('data-target'));
                const count = parseFloat(counter.innerText);
                const isFloat = counter.getAttribute('data-target').includes('.');
                
                // Speed modifier
                const speed = 100; 
                const increment = target / speed;

                if (count < target) {
                    if (isFloat) {
                        counter.innerText = (count + increment).toFixed(1);
                    } else {
                        counter.innerText = Math.ceil(count + increment);
                    }
                    setTimeout(updateCount, 15);
                } else {
                    counter.innerText = target;
                }
            };
            updateCount();
        });
    }

    // 3. Client-Side Form Validation (Predict Single Page)
    const predictForm = document.getElementById('predict-single-form');
    if (predictForm) {
        predictForm.addEventListener('submit', function (e) {
            let isValid = true;
            
            const name = document.getElementById('applicant_name');
            const income = document.getElementById('applicant_income');
            const coincome = document.getElementById('coapplicant_income');
            const amount = document.getElementById('loan_amount');
            const term = document.getElementById('loan_amount_term');
            
            // Name check
            if (name && name.value.trim() === '') {
                showValidationError(name, 'Applicant name cannot be empty');
                isValid = false;
            } else if (name) {
                removeValidationError(name);
            }
            
            // Income checks
            if (income && (isNaN(income.value) || parseFloat(income.value) <= 0)) {
                showValidationError(income, 'Applicant income must be a positive number greater than 0');
                isValid = false;
            } else if (income) {
                removeValidationError(income);
            }
            
            if (coincome && (isNaN(coincome.value) || parseFloat(coincome.value) < 0)) {
                showValidationError(coincome, 'Co-applicant income must be a non-negative number');
                isValid = false;
            } else if (coincome) {
                removeValidationError(coincome);
            }
            
            // Loan Amount check (represented in thousands, e.g. 100 means $100k)
            if (amount && (isNaN(amount.value) || parseFloat(amount.value) <= 0)) {
                showValidationError(amount, 'Requested loan amount must be positive');
                isValid = false;
            } else if (amount) {
                removeValidationError(amount);
            }
            
            // Term checks
            if (term && (isNaN(term.value) || parseInt(term.value) < 12 || parseInt(term.value) > 480)) {
                showValidationError(term, 'Amortization term must be between 12 and 480 months');
                isValid = false;
            } else if (term) {
                removeValidationError(term);
            }
            
            if (!isValid) {
                e.preventDefault();
                showToast('Please correct validation errors on the form.', 'danger');
            } else {
                showLoadingOverlay('Running automated underwriting scoring systems...');
            }
        });
    }

    // 4. File Upload CSV validation
    const csvForm = document.getElementById('predict-csv-form');
    if (csvForm) {
        csvForm.addEventListener('submit', function (e) {
            const fileInput = document.getElementById('csv_file');
            if (fileInput && fileInput.files.length === 0) {
                e.preventDefault();
                showToast('Please select a valid CSV template file to upload.', 'warning');
            } else {
                showLoadingOverlay('Parsing dataset and running batch predictions...');
            }
        });
    }

    // Helper functions for Form Validation styling
    function showValidationError(inputEl, message) {
        inputEl.classList.add('is-invalid');
        let feedback = inputEl.nextElementSibling;
        if (!feedback || !feedback.classList.contains('invalid-feedback')) {
            feedback = document.createElement('div');
            feedback.className = 'invalid-feedback';
            inputEl.parentNode.appendChild(feedback);
        }
        feedback.innerText = message;
    }

    function removeValidationError(inputEl) {
        inputEl.classList.remove('is-invalid');
        const feedback = inputEl.parentNode.querySelector('.invalid-feedback');
        if (feedback) {
            feedback.remove();
        }
    }

    // 5. Loading Overlay Manager
    window.showLoadingOverlay = function (messageText) {
        const overlay = document.getElementById('loading-overlay');
        const textEl = document.getElementById('loading-text');
        if (overlay) {
            if (textEl && messageText) {
                textEl.innerText = messageText;
            }
            overlay.classList.add('active');
        }
    };

    window.hideLoadingOverlay = function () {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.remove('active');
        }
    };

    // 6. Custom Toast Notification Manager
    window.showToast = function (message, type = 'info') {
        const container = document.getElementById('toast-container-custom');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type === 'danger' ? 'danger' : type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'primary'} border-0 show animated-fade`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        // Toast template content
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas ${type === 'danger' ? 'fa-exclamation-triangle' : type === 'success' ? 'fa-check-circle' : 'fa-info-circle'} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        
        container.appendChild(toast);
        
        // Auto remove toast after 4.5 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 4500);
    };
});

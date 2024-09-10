class NavigationManager {
    provision_years = 5
    
    constructor() {
        this.cards = document.querySelectorAll('.card');
        this.canvas = document.getElementById('canvas');
        this.setupEventListeners();
        this.setupResidentDateInput();
        this.adjustFirstCardMargin();
        this.adjustLastCardMargin();
        this.navigateTo('start');
        window.setTimeout(() => {
            document.body.classList.add('ready');
        }, 100);
    }

    setupEventListeners() {
        document.addEventListener('click', (event) => {
            const link = event.target.closest('a[href^="#"]');
            if (link) {
                event.preventDefault();
                const targetId = link.getAttribute('href').slice(1);
                this.navigateTo(targetId, event);
            }
        });
        window.addEventListener('resize', () => {
            console.log(this.canvas.dataset.currentStep);
            this.navigateTo(this.canvas.dataset.currentStep);
        });
    }

    navigateTo(targetId, event) {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            const shouldContinue = this.performAdditionalProcessing(targetId, event);
            if (shouldContinue) {
                this.scrollToElement(targetElement);
                this.canvas.dataset.currentStep = targetId;
            }
        }
    }

    scrollToElement(element) {
        const rect = element.getBoundingClientRect();

        const targetX = element.offsetLeft - (window.innerWidth - rect.width) / 2;
        const targetY = element.offsetTop - (window.innerHeight - rect.height) / 2;

        this.canvas.style.setProperty('--canvas-left', -targetX + 'px');
        this.canvas.style.setProperty('--canvas-top', -targetY + 'px');
    }

    performAdditionalProcessing(targetId, event) {
        // Add any additional processing logic here based on the targetId
        switch (targetId) {
            case 'start':
                document.body.classList.remove('in-progress');
                break;
            case 'marriage':
                document.body.classList.add('in-progress');
                break;
            case 'marriage-info':
                if (event && event.target.getAttribute('data-provision') === 'marriage') {
                    this.setProvision('marriage');
                } else if (event && event.target.getAttribute('data-provision') === 'general') {
                    this.setProvision('general');
                }
                break;
            case 'resident-since-info':
                const dateInput = document.getElementById('resident-since-date');
                if (!dateInput.value || isNaN(new Date(dateInput.value))) {
                    this.focusResidentDateInput();
                    return false;
                }
                break;
            case 'consider-travel':
                this.updateTimePeriod();
                break;
            // Add more cases as needed
        }
        return true;
    }

    focusResidentDateInput() {
        const dateInput = document.getElementById('resident-since-date');
        dateInput.focus();
    }

    setupResidentDateInput() {
        const dateInput = document.getElementById('resident-since-date');
        const continueButton = dateInput.parentElement.nextElementSibling;

        dateInput.addEventListener('change', () => {
            continueButton.classList.remove('disabled');
            this.updateResidentSinceInfo();
        });
    }

    updateResidentSinceInfo() {
        const dateInput = document.getElementById('resident-since-date');
        const dateDisplay = document.getElementById('resident-since-date-display');
        const residentSinceDateFormatted = document.querySelectorAll('.resident-since-date-formatted');
        const residentSinceCard = document.getElementById('resident-since-info');
        const selectedDate = new Date(dateInput.value);
        const today = new Date();
        const eligiblityDate = new Date(selectedDate.getFullYear() + this.provision_years, selectedDate.getMonth(), selectedDate.getDate());
        const eligiblityDateDisplay = document.getElementById('eligiblity-date');
        const yearsDiff = (today - selectedDate) / (365 * 24 * 60 * 60 * 1000);

        dateDisplay.textContent = yearsDiff.toFixed(1);
        if (yearsDiff < this.provision_years && !this.isWithinEarlyFilingPeriod()) {
            residentSinceCard.classList.add('ineligible');
            this.canvas.classList.remove('within-early-filing-period');
            eligiblityDateDisplay.textContent = eligiblityDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        } else {
            if (this.isWithinEarlyFilingPeriod()) {
                residentSinceDateFormatted.forEach(el => el.textContent = selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
                this.canvas.classList.add('within-early-filing-period');
            } else {
                this.canvas.classList.remove('within-early-filing-period');
            }
            residentSinceCard.classList.remove('ineligible');
        }
    }

    setProvision(provision) {
        if (provision === 'marriage') {
            this.provision_years = 3;
        } else if (provision === 'general') {
            this.provision_years = 5;
        }
        this.updateTimePeriod();
    }

    updateTimePeriod() {
        const timePeriodElements = document.querySelectorAll('.time-period');
        const physicalPresenceDays = document.getElementById('physical-presence-days');
        // const yearsAgo = parseFloat(document.getElementById('resident-since-date-display').textContent);
        // const timePeriod = yearsAgo < 3 ? 5 : 3;
        timePeriodElements.forEach(el => el.textContent = this.provision_years);
        physicalPresenceDays.textContent = this.provision_years === 3 ? 548 : 913;
    }

    adjustFirstCardMargin() {
        if (this.cards.length > 0) {
            const firstCard = this.cards[0];
            const viewportHeight = window.innerHeight;
            const cardHeight = firstCard.offsetHeight;
            const topMargin = Math.max(0, (viewportHeight - cardHeight) / 2);
            firstCard.style.marginTop = `${topMargin}px`;
        }
    }

    adjustLastCardMargin() {
        if (this.cards.length > 0) {
            const lastCard = this.cards[this.cards.length - 1];
            const viewportHeight = window.innerHeight;
            const cardHeight = lastCard.offsetHeight;
            const bottomMargin = Math.max(0, (viewportHeight - cardHeight) / 2);
            lastCard.style.marginBottom = `${bottomMargin}px`;
        }
    }

    isWithinEarlyFilingPeriod() {
        const residentDateValue = document.getElementById('resident-since-date').value; 
        if (!residentDateValue) {
            return false;
        }
        const residentSinceDate = new Date(residentDateValue);
        const provisionEligibilityDate = new Date(residentSinceDate.getFullYear() + this.provision_years, residentSinceDate.getMonth(), residentSinceDate.getDate());

        const today = new Date();
        
        // Calculate the difference in milliseconds
        const differenceInMs = provisionEligibilityDate -today;
        
        // Convert milliseconds to days
        const differenceInDays = Math.ceil(differenceInMs / (1000 * 60 * 60 * 24));
        
        if (differenceInDays <= 90 && differenceInDays > 0) {
            return true;
        }

        return false;
    }
}

// Initialize the NavigationManager when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new NavigationManager();
});

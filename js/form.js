// ── Formspree email & structured form handler ──
document.addEventListener('DOMContentLoaded', () => {
    const EMAIL_CAPTURE_ENDPOINT = 'https://formspree.io/f/xjgpwjyl';
    const hasEmailEndpoint = !EMAIL_CAPTURE_ENDPOINT.includes('your_form_id');

    async function submitForm(data) {
        if (!hasEmailEndpoint) {
            throw new Error('Email endpoint is not configured yet.');
        }

        const response = await fetch(EMAIL_CAPTURE_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                ...data,
                page: window.location.href
            })
        });

        if (!response.ok) {
            throw new Error('Submission failed');
        }
    }

    // Email capture forms (.email-row)
    document.querySelectorAll('.email-row').forEach(form => {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            const input = this.querySelector('input[type="email"]');
            const button = this.querySelector('button[type="submit"]');
            const messageEl = document.getElementById(this.dataset.message);
            const fineprint = this.nextElementSibling;
            const email = input.value.trim();
            const source = this.id || 'email-form';
            const originalText = button.textContent;

            if (!email) return;

            button.disabled = true;
            button.textContent = 'Submitting...';

            try {
                await submitForm({ email, source });
                this.style.display = 'none';
                if (fineprint && fineprint.classList.contains('form-fine-print')) {
                    fineprint.style.display = 'none';
                }
                if (messageEl) {
                    messageEl.classList.remove('error');
                    messageEl.textContent = "Thanks, we'll be in touch when programmes open.";
                    messageEl.style.display = 'block';
                }
            } catch (error) {
                if (messageEl) {
                    messageEl.classList.add('error');
                    messageEl.textContent = hasEmailEndpoint
                        ? 'Something went wrong. Please try again in a moment.'
                        : 'Form is almost ready. Add your endpoint in the script to start collecting emails.';
                    messageEl.style.display = 'block';
                }
            } finally {
                button.disabled = false;
                button.textContent = originalText;
            }
        });
    });

    // Structured contact form (#contact-form)
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const button = this.querySelector('button[type="submit"]');
            const messageEl = this.querySelector('.form-message');
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());
            data.source = 'contact-form';
            const originalText = button.textContent;

            button.disabled = true;
            button.textContent = 'Sending...';

            try {
                await submitForm(data);
                this.reset();
                if (messageEl) {
                    messageEl.classList.remove('error');
                    messageEl.textContent = "Thanks for getting in touch. We'll respond within 2 working days.";
                    messageEl.style.display = 'block';
                }
            } catch (error) {
                if (messageEl) {
                    messageEl.classList.add('error');
                    messageEl.textContent = 'Something went wrong. Please try again or email us directly.';
                    messageEl.style.display = 'block';
                }
            } finally {
                button.disabled = false;
                button.textContent = originalText;
            }
        });
    }
});
